/* Worker Prototype
   ----------------
new Worker(name, pages, settings)

*** User data***
.id			     - If we have a .display then this is the html #id of the worker
.name		   - String, the same as our class name.
.pages		  - String, list of pages that we want in the form "town.soldiers keep.stats"
.data		   - Object, for public reading, automatically saved
.option		 - Object, our options, changed from outide ourselves
.settings	       - Object, various values for various sections, default is always false / blank
				system (true/false) - exists for all games
				unsortable (true/false) - stops a worker being sorted in the queue, prevents this.work(true)
				advanced (true/false) - only visible when "Advanced" is checked
				before (array of worker names) - never let these workers get before us when sorting
				after (array of worker names) - never let these workers get after us when sorting
				keep (true/false) - without this data is flushed when not used - only keep if other workers regularly access you
				important (true/false) - can interrupt stateful workers [false]
				stateful (true/false) - only interrupt when we return QUEUE_RELEASE from work(true)
.display		- Create the display object for the settings page.

*** User functions ***
.init()		 - After the script has loaded, but before anything else has run. Data has been filled, but nothing has been run.
				This is the bext place to put default actions etc...
				Cannot rely on other workers having their data filled out...
.parse(change)  - This can read data from the current page and cannot perform any actions.
				change = false - Not allowed to change *anything*, cannot read from other Workers.
				change = true - Can now change inline and read from other Workers.
				return true - We need to run again with status=1
				return QUEUE_RELEASE - We want to run again with status=1, but feel free to interrupt (makes us stateful)
				return false - We're finished
.work(state)    - Do anything we need to do when it's our turn - this includes page changes.
				state = false - It's not our turn, don't start anything if we can't finish in this one call
				state = true - It's our turn, do everything - Only true if not interrupted
				return true if we need to keep working (after a delay etc)
				return false when someone else can work
.update(type)   - Called when the data or options have been changed (even on this._load()!). If !settings.data and !settings.option then call on data, otherwise whichever is set.
				type = "data" or "option"
.get(what)	      - Calls this._get(what)
				Official way to get any information from another worker
				Overload for "special" data, and pass up to _get if basic data
.set(what,value)- Calls this._set(what,value)
				Official way to set any information for another worker
				Overload for "special" data, and pass up to _set if basic data

NOTE: If there is a work() but no display() then work(false) will be called before anything on the queue, but it will never be able to have focus (ie, read only)

*** Private data ***
._loaded		- true once ._init() has run
._working		- Prevent recursive calling of various private functions
._changed		- Timestamp of the last time this.data changed
._watching		- List of other workers that want to have .update() after this.update()

*** Private functions ***
._get(what)				- Returns the data requested, auto-loads if needed, what is 'path.to.data'
._set(what,val)			- Sets this.data[what] to value, auto-loading if needed

._setup()				- Only ever called once - might even remove us from the list of workers, otherwise loads the data...
._init(keep)			- Calls .init(), loads then saves data (for default values), delete this.data if !nokeep and settings.nodata, then removes itself from use

._load(type)			- Loads data / option from storage, merges with current values, calls .update(type) on change
._save(type)			- Saves data / option to storage, calls .update(type) on change

._flush()				- Calls this._save() then deletes this.data if !this.settings.keep
._unflush()				- Loads .data if it's not there already

._parse(change)			- Calls this.parse(change) inside a try / catch block
._work(state)			- Calls this.work(state) inside a try / catch block

._update(type,worker)	- Calls this.update(type,worker), loading and flushing .data if needed. worker is "null" unless a watched worker.
._watch(worker)			- Add a watcher to worker - so this.update() gets called whenever worker.update() does
._unwatch(worker)		- Removes a watcher from worker (safe to call if not watching).
._remind(secs)			- Calls this._update('reminder') after a specified delay
*/
var Workers = [];
var WorkerStack = []; // Use "WorkerStack.length && WorkerStack[WorkerStack.length-1].name" for current worker name...
/*
if (typeof GM_getValue !== 'undefined') {
	var setItem = function(n,v){GM_setValue(n, v);}
	var getItem = function(n){return GM_getValue(n);}
} else {
	if (typeof localStorage !== 'undefined') {
		var setItem = function(n,v){localStorage.setItem('golem.' + APP + n, v);}
		var getItem = function(n){return localStorage.getItem('golem.' + APP + n);}
	} else if (typeof window.localStorage !== 'undefined') {
		var setItem = function(n,v){window.localStorage.setItem('golem.' + APP + n, v);}
		var getItem = function(n){return window.localStorage.getItem('golem.' + APP + n);}
	} else if (typeof globalStorage !== 'undefined') {
		var setItem = function(n,v){globalStorage[location.hostname].setItem('golem.' + APP + n, v);}
		var getItem = function(n){return globalStorage[location.hostname].getItem('golem.' + APP + n);}
	}
}
*/
if (isGreasemonkey) {
	var setItem = function(n,v){GM_setValue(n, v);}
	var getItem = function(n){return GM_getValue(n);}
} else {
	var setItem = function(n,v){localStorage.setItem('golem.' + APP + '.' + n, v);}
	var getItem = function(n){return localStorage.getItem('golem.' + APP + '.' + n);}
}

function Worker(name,pages,settings) {
	Workers.push(this);

	// User data
	this.id = null;
	this.name = name;
	this.pages = pages;

	this.defaults = null; // {app:{data:{}, options:{}} - replaces with app-specific data, can be used for any this.* wanted...

	this.settings = settings || {};

	this.data = {};
	this.option = {};
	this.runtime = null;// {} - set to default runtime values in your worker!
	this.display = null;

	// User functions
	this.init = null; //function() {};
	this.parse = null; //function(change) {return false;};
	this.work = null; //function(state) {return false;};
	this.update = null; //function(type,worker){};
	this.get = function(what) {return this._get(what);}; // Overload if needed
	this.set = function(what,value) {return this._set(what,value);}; // Overload if needed

	// Private data
	this._rootpath = true; // Override save path, replaces userID + '.' with ''
	this._loaded = false;
	this._working = {data:false, option:false, runtime:false, update:false};
	this._changed = Date.now();
	this._watching = [];
}

// Private functions - only override if you know exactly what you're doing
Worker.prototype._flush = function() {
	WorkerStack.push(this);
	this._save();
	if (!this.settings.keep) {
		delete this.data;
	}
	WorkerStack.pop();
};

Worker.prototype._get = function(what) { // 'path.to.data'
	var x = typeof what === 'string' ? what.split('.') : (typeof what === 'object' ? what : []), data;
	if (!x.length || (x[0] !== 'data' && x[0] !== 'option' && x[0] !== 'runtime')) {
		x.unshift('data');
	}
	if (x[0] === 'data') {
		!this._loaded && this._init();
		this._unflush();
	}
	data = this[x.shift()];
	try {
		switch(x.length) {
			case 0: return data;
			case 1: return data[x[0]];
			case 2: return data[x[0]][x[1]];
			case 3: return data[x[0]][x[1]][x[2]];
			case 4: return data[x[0]][x[1]][x[2]][x[3]];
			case 5: return data[x[0]][x[1]][x[2]][x[3]][x[4]];
			case 6: return data[x[0]][x[1]][x[2]][x[3]][x[4]][x[5]];
			case 7: return data[x[0]][x[1]][x[2]][x[3]][x[4]][x[5]][x[6]];
			default:break;
		}
	} catch(e) {
		WorkerStack.push(this);
		debug(this.name,e.name + ' in ' + this.name + '.get('+what+'): ' + e.message);
		WorkerStack.pop();
	}
	return null;
};

Worker.prototype._init = function() {
	if (this._loaded) {
		return;
	}
	WorkerStack.push(this);
	this._loaded = true;
	try {
		this.init && this.init();
	}catch(e) {
		debug(e.name + ' in ' + this.name + '.init(): ' + e.message);
	}
	WorkerStack.pop();
};

Worker.prototype._load = function(type) {
	if (type !== 'data' && type !== 'option' && type !== 'runtime') {
		this._load('data');
		this._load('option');
		this._load('runtime');
		return;
	}
	WorkerStack.push(this);
	var v = getItem((this._rootpath ? userID + '.' : '') + type + '.' + this.name);
	if (v) {
		try {
			v = JSON.parse(v);
		} catch(e) {
			debug(this.name + '._load(' + type + '): Not JSON data, should only appear once for each type...');
			v = eval(v); // We used to save our data in non-JSON format...
		}
		this[type] = $.extend(true, {}, this[type], v);
	}
	WorkerStack.pop();
};

Worker.prototype._parse = function(change) {
	WorkerStack.push(this);
	var result = false;
	try {
		result = this.parse && this.parse(change);
	}catch(e) {
		debug(e.name + ' in ' + this.name + '.parse(' + change + '): ' + e.message);
	}
	WorkerStack.pop();
	return result;
};

Worker.prototype._remind = function(seconds) {
	var me = this;
	window.setTimeout(function(){me._update('reminder', null);}, seconds * 1000);
};

Worker.prototype._save = function(type) {
	if (type !== 'data' && type !== 'option' && type !== 'runtime') {
		return this._save('data') + this._save('option') + this._save('runtime');
	}
	if (typeof this[type] === 'undefined' || !this[type] || this._working[type]) {
		return false;
	}
	var n = (this._rootpath ? userID + '.' : '') + type + '.' + this.name, v = JSON.stringify(this[type]);
	if (getItem(n) === 'undefined' || getItem(n) !== v) {
		WorkerStack.push(this);
		this._working[type] = true;
		this._changed = Date.now();
		this._update(type, null);
		setItem(n, v);
		this._working[type] = false;
		WorkerStack.pop();
		return true;
	}
	return false;
};

Worker.prototype._set = function(what, value) {
	WorkerStack.push(this);
	var x = typeof what === 'string' ? what.split('.') : (typeof what === 'object' ? what : []), data;
	if (!x.length || (x[0] !== 'data' && x[0] !== 'option' && x[0] !== 'runtime')) {
		x.unshift('data');
	}
	if (x[0] === 'data') {
		!this._loaded && this._init();
		this._unflush();
	}
	data = this[x.shift()];
	try {
		switch(x.length) {
			case 0: data = value; break; // Nobody should ever do this!!
			case 1: data[x[0]] = value; break;
			case 2: data[x[0]][x[1]] = value; break;
			case 3: data[x[0]][x[1]][x[2]] = value; break;
			case 4: data[x[0]][x[1]][x[2]][x[3]] = value; break;
			case 5: data[x[0]][x[1]][x[2]][x[3]][x[4]] = value; break;
			case 6: data[x[0]][x[1]][x[2]][x[3]][x[4]][x[5]] = value; break;
			case 7: data[x[0]][x[1]][x[2]][x[3]][x[4]][x[5]][x[6]] = value; break;
			default:break;
		}
//	      this._save();
	} catch(e) {
		debug(e.name + ' in ' + this.name + '.set('+what+', '+value+'): ' + e.message);
	}
	WorkerStack.pop();
	return null;
};

Worker.prototype._setup = function() {
	WorkerStack.push(this);
	if (this.defaults && this.defaults[APP]) {
		for (var i in this.defaults[APP]) {
			this[i] = this.defaults[APP][i];
		}
	}
	if (this.settings.system || !this.defaults || this.defaults[APP]) {
		this._load();
	} else { // Get us out of the list!!!
		Workers.splice(Workers.indexOf(this), 1);
	}
	WorkerStack.pop();
};

Worker.prototype._unflush = function() {
	WorkerStack.push(this);
	!this._loaded && this._init();
	!this.settings.keep && !this.data && this._load('data');
	iscaap() && (typeof this.caap_load == 'function') && this.caap_load();
	WorkerStack.pop();
};

Worker.prototype._unwatch = function(worker) {
	deleteElement(worker._watching,this);
};

Worker.prototype._update = function(type, worker) {
	if (this._loaded && (this.update || this._watching.length)) {
		WorkerStack.push(this);
		var i, flush = false;
		this._working.update = true;
		if (typeof this.data === 'undefined') {
			flush = true;
			this._unflush();
		}
		try {
			this.update && this.update(type, worker);
		}catch(e) {
			debug(e.name + ' in ' + this.name + '.update(' + (type ? type : 'null') + ', ' + (worker ? worker.name : 'null') + '): ' + e.message);
		}
		if (!worker) {
			for (i=0; i<this._watching.length; i++) {
				this._watching[i]._update(type, this);
			}
		}
		flush && this._flush();
		this._working.update = false;
		WorkerStack.pop();
	}
};

Worker.prototype._watch = function(worker) {
	!findInArray(worker._watching,this) && worker._watching.push(this);
};

Worker.prototype._work = function(state) {
	WorkerStack.push(this);
	var result = false;
	try {
		result = this.work && this.work(state);
	}catch(e) {
		debug(e.name + ' in ' + this.name + '.work(' + state + '): ' + e.message);
	}
	WorkerStack.pop();
	return result;
};


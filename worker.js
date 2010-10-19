/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page, Queue, Resources,
	Battle, Generals, LevelUp, Player,
	APP, APPID, log, debug, userID, imagepath, browser, GM_setValue, GM_getValue, localStorage, window,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH
	makeTimer, shortNumber, Divisor, length, unique, deleteElement, sum, addCommas, findInArray, findInObject, objectIndex, sortObject, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime, ucfirst, ucwords,
	makeImage
*/
/* Worker Prototype
   ----------------
new Worker(name, pages, settings)

*** User data***
.id				- If we have a .display then this is the html #id of the worker
.name			- String, the same as our class name.
.pages			- String, list of pages that we want in the form "town.soldiers keep.stats"
.data			- Object, for public reading, automatically saved
.option			- Object, our options, changed from outide ourselves
.settings		- Object, various values for various sections, default is always false / blank
				system (true/false) - exists for all games
				unsortable (true/false) - stops a worker being sorted in the queue, prevents this.work(true)
				advanced (true/false) - only visible when "Advanced" is checked
				before (array of worker names) - never let these workers get before us when sorting
				after (array of worker names) - never let these workers get after us when sorting
				keep (true/false) - without this data is flushed when not used - only keep if other workers regularly access you
				important (true/false) - can interrupt stateful workers [false]
				stateful (true/false) - only interrupt when we return QUEUE_RELEASE from work(true)
				gm_only (true/false) - only enable worker if we're running under greasemonkey
.display		- Create the display object for the settings page.
.defaults		- Object filled with objects. Assuming in an APP called "castle_age" then myWorker.defaults['castle_age'].* gets copied to myWorker.*

*** User functions - should be in worker if needed ***
.init()			- After the script has loaded, but before anything else has run. Data has been filled, but nothing has been run.
				This is the bext place to put default actions etc...
				Cannot rely on other workers having their data filled out...
.parse(change)  - This can read data from the current page and cannot perform any actions.
				change = false - Not allowed to change *anything*, cannot read from other Workers.
				change = true - Can now change inline and read from other Workers.
				return true - We need to run again with status=1
				return QUEUE_RELEASE - We want to run again with status=1, but feel free to interrupt (makes us stateful)
				return false - We're finished
.work(state)    - Do anything we need to do when it's our turn - this includes page changes. This is part the of Queue worker.
				state = false - It's not our turn, don't start anything if we can't finish in this one call, this.data is null
				state = true - It's our turn, do everything - Only true if not interrupted, this.data is useable
				return true or QUEUE_RELEASE if we *want* to continue working, but can be interrupted
				return QUEUE_CONTINUE if we *need* to continue working and don't want to be interrupted
				return false or QUEUE_FINISH when someone else can work
.update(type,worker)	- Called when the data, options or runtime have been changed
				type = "data", "option", "runtime", "reminder" or null (only for first call after init())
				worker = null (for worker = this), otherwise another worker (due to _watch())
.get(what)		- Calls this._get(what)
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
._reminders		- List of reminders in 'i...':interval or 't...':timeout format

*** Private functions - only overload if you're sure exactly what you're doing ***
._get(what,def)			- Returns the data requested, auto-loads if needed, what is 'path.to.data', default if not found
._set(what,val)			- Sets this.data[what] to value, auto-loading if needed. Deletes "empty" data sets (if you don't pass a value)

._setup()				- Only ever called once - might even remove us from the list of workers, otherwise loads the data...
._init(keep)			- Calls .init(), loads then saves data (for default values), delete this.data if !nokeep and settings.nodata, then removes itself from use

._load(type)			- Loads data / option from storage, merges with current values, calls .update(type) on change
._save(type)			- Saves data / option to storage, calls .update(type) on change

._flush()				- Calls this._save() then deletes this.data if !this.settings.keep
._unflush()				- Loads .data if it's not there already

._parse(change)			- Calls this.parse(change) inside a try / catch block
._work(state)			- Calls this.work(state) inside a try / catch block

._update(event)			- Calls this.update(event), loading and flushing .data if needed. event = {worker:this, type:'init|data|option|runtime|reminder', [self:true], [id:'reminder id']}

._watch(worker)			- Add a watcher to worker - so this.update() gets called whenever worker.update() does
._unwatch(worker)		- Removes a watcher from worker (safe to call if not watching).

._remind(secs,id)		- Calls this._update({worker:this, type:'reminder', self:true, id:(id || null)}) after a specified delay. Replaces old 'id' if passed (so only one _remind() per id active)
._revive(secs,id)		- Calls this._update({worker:this, type:'reminder', self:true, id:(id || null)}) regularly. Replaces old 'id' if passed (so only one _revive() per id active)
._forget(id)			- Forgets all _remind() and _revive() with the same id

._push()				- Pushes us onto the "active worker" list for debug messages etc
._pop()					- Pops us off the "active worker" list
*/
var Workers = {};// 'name':worker

if (browser === 'greasemonkey') {
	var setItem = function(n,v){GM_setValue(n, v);};// Must make per-APP when we go to multi-app
	var getItem = function(n){return GM_getValue(n);};// Must make per-APP when we go to multi-app
} else {
	var setItem = function(n,v){localStorage.setItem('golem.' + APP + '.' + n, v);};
	var getItem = function(n){return localStorage.getItem('golem.' + APP + '.' + n);};
}

function Worker(name,pages,settings) {
	Workers[name] = this;

	// User data
	this.id = 'golem_panel_'+name.toLowerCase().replace(/[^0-9a-z]/g,'-');
	this.name = name;
	this.pages = pages;

	this.defaults = {}; // {'APP':{data:{}, options:{}} - replaces with app-specific data, can be used for any this.* wanted...

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
	this.get = function(what,def) {return this._get(what,def);}; // Overload if needed
	this.set = function(what,value) {return this._set(what,value);}; // Overload if needed

	// Private data
	this._rootpath = true; // Override save path, replaces userID + '.' with ''
	this._loaded = false;
	this._working = {data:false, option:false, runtime:false, update:false};
	this._changed = Date.now();
	this._watching = {data:[], option:[], runtime:[]};
	this._reminders = {};
	this._disabled = false;
}

// Static Functions
Worker.find = function(name) {// Get worker object by Worker.name or Worker.id
	if (name in Workers) {
		return Workers[name];
	}
	name = name.toLowerCase();
	for (var i in Workers) {
		if (i.toLowerCase() === name || Workers[i].id === name) {
			return Workers[i];
		}
	}
	return null;
};

// Static Data
Worker.stack = [];// array of active workers, last on the end
Worker.current = '';

// Private functions - only override if you know exactly what you're doing
Worker.prototype._flush = function() {
	this._push();
	this._save();
	if (!this.settings.keep) {
		delete this.data;
	}
	this._pop();
};

Worker.prototype._forget = function(id) {
	var forgot = false;
	if (id) {
		if (this._reminders['i' + id]) {
			window.clearInterval(this._reminders['i' + id]);
			delete this._reminders['i' + id];
			forgot = true;
		}
		if (this._reminders['t' + id]) {
			window.clearTimeout(this._reminders['t' + id]);
			delete this._reminders['t' + id];
			forgot = true;
		}
	}
	return forgot;
};

Worker.prototype._get = function(what, def) { // 'path.to.data'
	var x = typeof what === 'string' ? what.split('.') : (typeof what === 'object' ? what : []), data;
	if (!x.length || (x[0] !== 'data' && x[0] !== 'option' && x[0] !== 'runtime')) {
		x.unshift('data');
	}
	if (x[0] === 'data') {
		if (!this._loaded) {
			this._init();
		}
		this._unflush();
	}
	data = this[x.shift()];
	try {
		return (function(a,b){
			if (b.length) {
				return arguments.callee(a[b.shift()],b);
			} else {
				return typeof a !== 'undefined' ? (a === null ? null : a.valueOf()) : def;
			}
		})(data,x);
	} catch(e) {
//		this._push();
		if (typeof def === 'undefined') {
			debug(e.name + ' in ' + this.name + '.get('+what.toString()+', '+(typeof def === 'undefined' ? 'undefined' : def)+'): ' + e.message);
		}
//		this._pop();
	}
	return typeof def !== 'undefined' ? def : null;// Don't want to return "undefined" at this time...
};

Worker.prototype._init = function() {
	if (this._loaded) {
		return;
	}
	this._push();
	this._loaded = true;
	if (this.init) {
		try {
			this.init();
		}catch(e) {
			debug(e.name + ' in ' + this.name + '.init(): ' + e.message);
		}
	}
	this._pop();
};

Worker.prototype._load = function(type) {
	if (type !== 'data' && type !== 'option' && type !== 'runtime') {
		this._load('data');
		this._load('option');
		this._load('runtime');
		return;
	}
	this._push();
	var v = getItem((this._rootpath ? userID + '.' : '') + type + '.' + this.name);
	if (v) {
		try {
			v = JSON.parse(v);
		} catch(e) {
			debug(this.name + '._load(' + type + '): Not JSON data, should only appear once for each type...');
//			v = eval(v); // We used to save our data in non-JSON format...
		}
		this[type] = $.extend(true, {}, this[type], v);
	}
	this._pop();
};

Worker.prototype._parse = function(change) {
	this._push();
	var result = false;
	try {
		result = this.parse && this.parse(change);
	}catch(e) {
		debug(e.name + ' in ' + this.name + '.parse(' + change + '): ' + e.message);
	}
	this._pop();
	return result;
};

Worker.prototype._pop = function() {
	Worker.stack.pop();
	Worker.current = Worker.stack.length ? Worker.stack[Worker.stack.length - 1].name : '';
};

Worker.prototype._push = function() {
	Worker.stack.push(this);
	Worker.current = this.name;
};

Worker.prototype._revive = function(seconds, id, callback) {
	var me = this, timer = window.setInterval(function(){callback ? callback.apply(me) : me._update({worker:this, type:'reminder', self:true, id:(id || null)});}, seconds * 1000);
	if (id) {
		if (this._reminders['i' + id]) {
			window.clearInterval(this._reminders['i' + id]);
		}
		this._reminders['i' + id] = timer;
	}
	return timer;
};

Worker.prototype._remind = function(seconds, id, callback) {
	var me = this, timer = window.setTimeout(function(){delete me._reminders['t'+id];callback ? callback.apply(me) : me._update({worker:this, type:'reminder', self:true, id:(id || null)});}, seconds * 1000);
	if (id) {
		if (this._reminders['t' + id]) {
			window.clearTimeout(this._reminders['t' + id]);
		}
		this._reminders['t' + id] = timer;
	}
	return timer;
};

Worker.prototype._save = function(type) {
	if (type !== 'data' && type !== 'option' && type !== 'runtime') {
		return this._save('data') + this._save('option') + this._save('runtime');
	}
	if (typeof this[type] === 'undefined' || !this[type] || this._working[type]) {
		return false;
	}
	var i, n = (this._rootpath ? userID + '.' : '') + type + '.' + this.name, v = JSON.stringify(this[type]);
	if (getItem(n) === 'undefined' || getItem(n) !== v) {
		this._push();
		this._working[type] = true;
		this._changed = Date.now();
		this._update({worker:this, type:type, self:true});
		for (i=0; i<this._watching[type].length; i++) {
			this._watching[type][i]._update({worker:this, type:type});
		}
		setItem(n, v);
		this._working[type] = false;
		this._pop();
		return true;
	}
	return false;
};

Worker.prototype._set = function(what, value) {
//	this._push();
	var x = typeof what === 'string' ? what.split('.') : (typeof what === 'object' ? what : []), data;
	if (!x.length || (x[0] !== 'data' && x[0] !== 'option' && x[0] !== 'runtime')) {
		x.unshift('data');
	}
	if (x[0] === 'data') {
		if (!this._loaded) {
			this._init();
		}
		this._unflush();
	}
	data = this[x.shift()];
	if (x.length) {
		try {
			(function(a,b){ // Don't allow setting of root data/object/runtime
				var c = b.shift();
				if (b.length) {
					if (typeof a[c] !== 'object') {
						a[c] = {};
					}
					if (!arguments.callee(a[c],b) && !length(a[c])) {// Can clear out empty trees completely...
						delete a[c];
						return false;
					}
				} else {
					if (typeof value === 'undefined') {
						delete a[c];
						return false;
					} else {
						a[c] = value;
					}
				}
				return true;
			})(data,x);
//			this._save();
		} catch(e) {
			debug(e.name + ' in ' + this.name + '.set('+what+', '+(typeof value === 'undefined' ? 'undefined' : value)+'): ' + e.message);
		}
	}
//	this._pop();
	return value;
};

Worker.prototype._setup = function() {
	this._push();
	if (this.settings.system || !length(this.defaults) || this.defaults[APP]) {
		if (this.defaults[APP]) {
			for (var i in this.defaults[APP]) {
				this[i] = this.defaults[APP][i];
			}
		}
		this._load();
	} else { // Get us out of the list!!!
		delete Workers[this.name];
	}
	this._pop();
};

Worker.prototype._unflush = function() {
	this._push();
	if (!this._loaded) {
		this._init();
	}
	if (!this.settings.keep && !this.data) {
		this._load('data');
	}
	this._pop();
};

Worker.prototype._unwatch = function(worker) {
	if (typeof worker === 'string') {
		worker = Worker.find(worker);
	}
	if (isWorker(worker)) {
		deleteElement(worker._watching.data,this);
		deleteElement(worker._watching.option,this);
		deleteElement(worker._watching.runtime,this);
	}
};

Worker.prototype._update = function(event) {
	if (this._loaded && this.update) {
		this._push();
		var i, flush = false;
		if (isString(event)) {
			event = {type:event};
		} else if (!isObject(event)) {
			event = {};
		}
		event.worker = event.worker || this;
		this._working.update = true;
		if (typeof this.data === 'undefined') {
			flush = true;
			this._unflush();
		}
		try {
			this.update(event);
		}catch(e) {
			debug(e.name + ' in ' + this.name + '.update(' + JSON.stringify(event) + '): ' + e.message);
		}
		if (flush) {
			this._remind(0.1, '_flush', this._flush);
//			this._flush();
		}
		this._working.update = false;
		this._pop();
	}
};

Worker.prototype._watch = function(worker, type) {
	if (typeof worker === 'string') {
		worker = Worker.find(worker);
	}
	if (isWorker(worker)) {
		if (type !== 'data' && type !== 'option' && type !== 'runtime') {
			type = 'data';
		}
		if (!findInArray(worker._watching[type],this)) {
			worker._watching[type].push(this);
		}
	}
};

Worker.prototype._work = function(state) {
	this._push();
	var result = false;
	try {
		result = this.work && this.work(state);
	}catch(e) {
		debug(e.name + ' in ' + this.name + '.work(' + state + '): ' + e.message);
	}
	this._pop();
	return result;
};


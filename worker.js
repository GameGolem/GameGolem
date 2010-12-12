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
.temp			- Object, temporary unsaved data for this instance only
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
				type = "data", "option", "runtime", "reminder", "watch" or null (only for first call after init())
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

._watch(worker[,path])	- Add a watcher to worker (safe to call multiple times). If anything under "path" is changed will update the watcher
._unwatch(worker[,path])- Removes a watcher from worker (safe to call if not watching). Will remove exact matches or all
._notify(path)			- Updates any workers watching this path or below

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
	this.temp = {};// Temporary unsaved data for this instance only.
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
	this._datatypes = {data:true, option:true, runtime:true, temp:false}; // Used for set/get/save/load. If false then can't save/load.
	this._taint = {}; // Has anything changed that might need saving?
	this._watching = {};
	this._reminders = {};
	this._disabled = false;
}

// Static Functions
Worker.find = function(name) {// Get worker object by Worker.name or Worker.id
	try {
		if (name in Workers) {
			return Workers[name];
		}
		name = name.toLowerCase();
		for (var i in Workers) {
			if (i.toLowerCase() === name || Workers[i].id === name) {
				return Workers[i];
			}
		}
	} catch(e) {}
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
	var x = typeof what === 'string' ? what.split('.') : (typeof what === 'object' ? what : []), type;
	if (!x.length || !(x[0] in this._datatypes)) {
		x.unshift('data');
	}
	try {
		if (x[0] === 'data') {
			this._unflush();
		}
		what = x.join('.');
		type = x.shift();
		return (function(a,b){
			if (typeof a !== 'undefined') {
				if (b.length) {
					return arguments.callee(a[b.shift()],b);
				}
				return a === null ? null : a.valueOf();
			}
			return def
		})(this[type],x);
	} catch(e) {
		if (typeof def === 'undefined') {
			debug(e.name + ' in ' + this.name + '.get('+what+', undefined): ' + e.message);
		}
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
	if (!this._datatypes[type]) {
		for (var i in this._datatypes) {
			if (this._datatypes.hasOwnProperty(i) && this._datatypes[i]) {
				this._load(i);
			}
		}
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
		this._taint[type] = false;
	}
	this._pop();
};

Worker.prototype._notify = function(path) {// Notify on a _watched path change
	var i, j, w, id = '_' + this.name + '.';
	for (i in this._watching) {
		if (path.indexOf(i) === 0) {// Match the prefix
			w = this._watching[i];
			for (j=0; j<w.length; j++) {
//				debug('Notify ' + w[j].name + ', id = ' + i);
				w[j]._remind(0.05, id + i, {worker:this, type:'watch', id:i});
			}
		}
	}
}

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
	var me = this, timer = window.setInterval(function(){callback ? callback.apply(me) : me._update({worker:me, type:'reminder', self:true, id:(id || null)});}, seconds * 1000);
	if (id) {
		if (this._reminders['i' + id]) {
			window.clearInterval(this._reminders['i' + id]);
		}
		this._reminders['i' + id] = timer;
	}
	return timer;
};

Worker.prototype._remind = function(seconds, id, callback) {
	var me = this, timer = window.setTimeout(function(){delete me._reminders['t'+id];isFunction(callback) ? callback.apply(me) : me._update(isObject(callback) ? callback : {worker:me, type:'reminder', self:true, id:(id || null)});}, seconds * 1000);
	if (id) {
		if (this._reminders['t' + id]) {
			window.clearTimeout(this._reminders['t' + id]);
		}
		this._reminders['t' + id] = timer;
	}
	return timer;
};

Worker.prototype._save = function(type) {
	if (!this._datatypes[type]) {
		for (var i in this._datatypes) {
			if (this._datatypes.hasOwnProperty(i) && this._datatypes[i]) {
				this._save(i);
			}
		}
		return true;
	}
	if (typeof this[type] === 'undefined' || !this[type]) {
		return false;
	}
	var i, n = (this._rootpath ? userID + '.' : '') + type + '.' + this.name, v;
	try {
		v = JSON.stringify(this[type]);
	} catch (e) {
		debug(e.name + ' in ' + this.name + '.save(' + type + '): ' + e.message);
		// exit so we don't try to save mangled data over good data
		return false;
	}
	if (getItem(n) === 'undefined' || getItem(n) !== v) {
		this._push();
		this._taint[type] = false;
		this._update({worker:this, type:type, self:true});
		setItem(n, v);
		this._pop();
		return true;
	}
	return false;
};

Worker.prototype._set = function(what, value) {
//	this._push();
	var me = this, x = isString(what) ? what.split('.') : (isArray(what) ? what : []), type;
	if (!x.length || !(x[0] in this._datatypes)) {
		x.unshift('data');
	}
	if (x.length <= 1) { // Return early if we're not setting a subvalue
		return null;
	}
	try {
		if (x[0] === 'data') {
			this._unflush();
		}
		what = x.join('.');
		type = x.shift();
		(function(a,b){ // Don't allow setting of root data/object/runtime
			var c = b.shift(), l = b.length;
			if (l && !isObject(a[c])) {
				a[c] = {};
			}
			if (l && !arguments.callee(a[c],b) && empty(a[c])) {// Can clear out empty trees completely...
				delete a[c];
				return false;
			} else if (!l && ((isString(value) && value.localeCompare(a[c]||'')) || (!isString(value) && a[c] != value))) {
				me._notify(what);// Notify the watchers...
				me._taint[type] = true;
				me._remind(0, '_update', {type:type, self:true});
				if (isUndefined(value)) {
					delete a[c];
					return false;
				} else {
					a[c] = value;
				}
			}
			return true;
		})(this[type],x);
	} catch(e) {
		debug(e.name + ' in ' + this.name + '.set('+what+', '+(typeof value === 'undefined' ? 'undefined' : value)+'): ' + e.message);
	}
//	this._pop();
	return value;
};

Worker.prototype._setup = function() {
	this._push();
	if (this.settings.system || empty(this.defaults) || this.defaults[APP]) {
		if (this.defaults[APP]) {
			for (var i in this.defaults[APP]) {
				this[i] = this.defaults[APP][i];
			}
		}
		// NOTE: Really need to move this into .init, and defer .init until when it's actually needed
		this._load();
		if (this.setup) {
			try {
				this.setup();
			}catch(e) {
				debug(e.name + ' in ' + this.name + '.setup(): ' + e.message);
			}
		}
	} else { // Get us out of the list!!!
		delete Workers[this.name];
	}
	this._pop();
};

Worker.prototype._trigger = function(selector, id) {
	$('body').delegate(selector, 'DOMNodeInserted', {worker:this, self:true, type:'trigger', id:id || selector, selector:selector}, function(event){
		event.data.worker._remind(0, '_trigger' + event.data.id, event.data);
	});
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

Worker.prototype._unwatch = function(worker, path) {
	if (typeof worker === 'string') {
		worker = Worker.find(worker);
	}
	if (isWorker(worker)) {
		if (isString(path)) {
			if (path in worker._watching) {
				deleteElement(worker._watching[path],this);
			}
		} else {
			var i;
			for (i=0; i<worker._watching.length; i++) {
				deleteElement(worker._watching[i],this);
			}
		}
	}
};

Worker.prototype._update = function(event) {
	if (this._loaded && this.update) {
		this._push();
		var i, flush = false, newevent = {worker:this};
		if (isString(event)) {
			newevent.type = event;
		} else if (isObject(event)) {
			for (i in event) {
				newevent[i] = event[i];
			}
		}
		newevent.worker = newevent.worker || this;
		if (isUndefined(this.data)) {
			flush = true;
			this._unflush();
		}
		try {
			this.update(newevent);
		}catch(e) {
			debug(e.name + ' in ' + this.name + '.update({worker:' + newevent.worker.name + ', type:' + newevent.type + '}): ' + e.message);
		}
		if (flush) {
			this._remind(0.1, '_flush', this._flush);
//			this._flush();
		}
		this._pop();
	}
};

 Worker.prototype._watch = function(worker, path) {
	if (typeof worker === 'string') {
		worker = Worker.find(worker);
	}
	if (isWorker(worker)) {
		if (!isString(path)) {
			path = 'data';
		}
		for (var i in this._datatypes) {
			if (path.indexOf(i) === 0) {
				worker._watching[path] = worker._watching[path] || [];
				if (!findInArray(worker._watching[path],this)) {
//					debug('Watch(' + worker.name + ', "' + path + '")');
					worker._watching[path].push(this);
				}
				return true;
			}
		}
//		debug('Attempting to watch bad value: ' + worker.name + ':' + path);
	}
	return false;
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


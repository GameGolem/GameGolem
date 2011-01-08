/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page, Queue, Resources,
	Battle, Generals, LevelUp, Player,
	APP, APPID, log, debug, userID, imagepath, browser, localStorage, window,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH
	makeTimer, Divisor, length, unique, deleteElement, sum, findInArray, findInObject, objectIndex, sortObject, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
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
				no_disable (true/false) - stops a worker getting disabled
				advanced (true/false) - only visible when "Advanced" is checked
				before (array of worker names) - never let these workers get before us when sorting
				after (array of worker names) - never let these workers get after us when sorting
				keep (true/false) - without this data is flushed when not used - only keep if other workers regularly access you
				important (true/false) - can interrupt stateful workers [false]
				stateful (true/false) - only interrupt when we return QUEUE_RELEASE from work(true)
				taint (true/false) - don't save unless data is marked as tainted - otherwise will perform a comparison between old and new data
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

._overload(name,fn)		- Overloads the member function 'name'. this._parent() becomes available for running the original code (it automatically has the same arguments unless passed others)

._push()				- Pushes us onto the "active worker" list for debug messages etc
._pop()					- Pops us off the "active worker" list
*/
var Workers = {};// 'name':worker

function Worker(name,pages,settings) {
	Workers[name] = this;

	// User data
	this.id = 'golem_panel_'+name.toLowerCase().replace(/[^0-9a-z]/g,'-');
	this.name = name;
	this.pages = pages;

	this.defaults = {}; // {'APP':{data:{}, option:{}} - replaces with app-specific data, can be used for any this.* wanted...

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
	this.get = this._get; // Overload if needed
	this.set = this._set; // Overload if needed

	// Private data
	this._rootpath = true; // Override save path, replaces userID + '.' with ''
	this._loaded = false;
	this._datatypes = {data:true, option:true, runtime:true, temp:false}; // Used for set/get/save/load. If false then can't save/load.
	this._timestamps = {}; // timestamp of the last time each datatype has been saved
	this._taint = {}; // Has anything changed that might need saving?
	this._saving = {}; // Prevent looping on save
	this._watching = {}; // Watching for changes, path:[workers]
	this._watching_ = {}; // Changes have happened, path:true
	this._reminders = {};
}

// Static Functions
Worker.find = function(name) {// Get worker object by Worker.name or Worker.id
	if (!name) {
		return null;
	}
	try {
		if (isString(name)) {
			if (name in Workers) {
				return Workers[name];
			}
			name = name.toLowerCase();
			for (var i in Workers) {
				if (i.toLowerCase() === name || Workers[i].id === name) {
					return Workers[i];
				}
			}
		} else if (isWorker(name)) {
			return name;
		}
	} catch(e) {}
	return null;
};

// Private status functions
Worker._notify_ = function(worker) {
	var i, j, w = Workers[worker]._watching_, watch = Workers[worker]._watching;
	Workers[worker]._watching_ = {};
	for (i in w) {
		j = watch[i].length;
		while (j--) {
			Workers[watch[i][j]]._update({worker:worker, type:'watch', id:i});
		}
	}
};

Worker._flush_ = function(worker) {
	Workers[worker]._reminders._flush = undefined;
	Workers[worker].data = undefined;
};

// Static Data
Worker.stack = ['unknown'];// array of active workers, last at the start
Worker._triggers_ = [];// Used for this._trigger

// Private functions - only override if you know exactly what you're doing
Worker.prototype._flush = function() {
	this._push();
	this._save();
	if (!this.settings.keep) {// && !this._reminders._flush) {
		var name = this.name;
		window.clearTimeout(this._reminders._flush);
		this._reminders._flush = window.setTimeout(function(){Worker._flush_(name);}, 500);// Delete data after half a second
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
	var x = isString(what) ? what.split('.') : (isArray(what) ? what : []), data;
	if (!x.length || !(x[0] in this._datatypes)) {
		x.unshift('data');
	}
	try {
		if (x[0] === 'data') {
			this._unflush();
		}
		data = this;
		while (x.length && data !== undefined) {
			data = data[x.shift()];
		}
		return data === undefined ? def : data === null ? null : data.valueOf();
	} catch(e) {
		console.log(error(e.name + ' in ' + this.name + '.get('+JSON.shallow(arguments,2)+'): ' + e.message));
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
			console.log(error(e.name + ' in ' + this.name + '.init(): ' + e.message));
		}
	}
	this._pop();
};

Worker.prototype._load = function(type, merge) {
	if (!this._datatypes[type]) {
		if (!type) {
			for (var i in this._datatypes) {
				if (this._datatypes.hasOwnProperty(i) && this._datatypes[i]) {
					this._load(i);
				}
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
			console.log(error(this.name + '._load(' + type + '): Not JSON data, should only appear once for each type...'));
//			v = eval(v); // We used to save our data in non-JSON format...
		}
		this[type] = merge ? $.extend(true, {}, this[type], v) : v;
		this._taint[type] = false;
	}
	this._pop();
};

Worker.prototype._notify = function(path) {// Notify on a _watched path change
	var i, name = this.name;
	path = isArray(path) ? path : path.split('.');
	while (path.length) {
		i = (i ? i+'.' : '') + path.shift();
		if (!this._watching_[i] && this._watching[i] !== undefined && this._watching[i].length) {
			if (!length(this._watching_)) {
				window.setTimeout(function(){Worker._notify_(name);}, 50);
			}
			this._watching_[i] = true;
		}
	}
};

Worker.prototype._overload = function(app, name, fn) {
	var newfn = function() {
		var a = arguments, r, x = this._parent;
		this._parent = function() {
			return arguments.callee._old.apply(this, arguments.length ? arguments : a);
		};
		this._parent._old = arguments.callee._old;
		r = arguments.callee._new.apply(this, a);
		this._parent = x;
		return r;
	};
	newfn._old = (app && this.defaults && this.defaults[app] && this.defaults[app][name] ? this.defaults[app][name] : null) || this[name] || function(){};
	newfn._new = fn;
	if (app) {
		this.defaults[app] = this.defaults[app] || {};
		if (this.defaults[app][name] === this[name]) { // If we've already run _setup
			this[name] = newfn;
		}
		this.defaults[app][name] = newfn;
	} else {
		this[name] = newfn;
	}
};

Worker.prototype._parse = function(change) {
	this._push();
	var result = false;
	try {
		this._unflush();
		result = this.parse && this.parse(change);
	}catch(e) {
		console.log(error(e.name + ' in ' + this.name + '.parse(' + change + '): ' + e.message));
	}
	this._pop();
	return result;
};

Worker.prototype._pop = function() {
	Worker.stack.shift();
};

Worker.prototype._push = function() {
	Worker.stack.unshift(this.name);
};

Worker.prototype._revive = function(seconds, id, callback) {
	var name = this.name, timer = window.setInterval(function(){callback ? callback.apply(Workers[name]) : Workers[name]._update({type:'reminder', self:true, id:(id || null)});}, seconds * 1000);
	if (id) {
		if (this._reminders['i' + id]) {
			window.clearInterval(this._reminders['i' + id]);
		}
		this._reminders['i' + id] = timer;
	}
	return timer;
};

Worker.prototype._remind = function(seconds, id, callback) {
	var name = this.name, timer = window.setTimeout(function(){delete Workers[name]._reminders['t'+id];isFunction(callback) ? callback.apply(Workers[name]) : Workers[name]._update(isObject(callback) ? callback : {type:'reminder', self:true, id:(id || null)});}, seconds * 1000);
	if (id) {
		if (this._reminders['t' + id]) {
			window.clearTimeout(this._reminders['t' + id]);
		}
		this._reminders['t' + id] = timer;
	}
	return timer;
};

Worker.prototype._replace = function(type, data) {
	if (type === 'data') {
		this._unflush();
	}
	var i, val, old = this[type];
	for (i in this._watching) {
		if (i.indexOf(type) === 0) {
			this[type] = old;
			val = this._get(i, 123);
			this[type] = data;
			if (val !== this._get(i, 456)) {
				this._notify(i);
			}
		}
	}
	this[type] = data;
	this._taint[type] = true;
	this._save(type);
};

Worker.prototype._save = function(type) {
	var i, n, v;
	if (!this._datatypes[type]) {
		if (!type) {
			n = false;
			for (var i in this._datatypes) {
				if (this._datatypes.hasOwnProperty(i) && this._datatypes[i]) {
					n = arguments.callee.call(this,i) || n;
				}
			}
			return n;
		} else if (this._taint[type]) {
			this._forget('_update_'+type);
			this._update({type:type, self:true});
			this._taint[type] = false;
		}
	}
	if (this[type] === undefined || !this[type] || this._saving[type]) {
		return false;
	}
	n = (this._rootpath ? userID + '.' : '') + type + '.' + this.name;
	try {
		v = JSON.stringify(this[type]);
	} catch (e) {
		console.log(error(e.name + ' in ' + this.name + '.save(' + type + '): ' + e.message));
		// exit so we don't try to save mangled data over good data
		return false;
	}
	if (this._taint[type] || (!this.settings.taint && getItem(n) !== v)) {
		this._push();
		this._saving[type] = true;
		this._forget('_update_'+type);
		this._update({type:type, self:true});
		this._saving[type] = this._taint[type] = false;
		this._timestamps[type] = Date.now();
		setItem(n, v);
		this._pop();
		return true;
	}
	return false;
};

Worker.prototype._set_ = function(data, path, value){ // data=Object, path=Array['data','etc','etc'], value, depth
	var depth = isNumber(arguments[3]) ? arguments[3] : 0, i = path[depth];
	switch ((path.length - depth) > 1) { // Can we go deeper?
		case true:
			if (!isObject(data[i])) {
				data[i] = {};
			}
			if (!this._set_(data[i], path, value, depth+1) && empty(data[i])) {// Can clear out empty trees completely...
				data[i] = undefined;
				return false;
			}
			break;
		case false:
			if (!compare(value, data[i])) {
				this._notify(path.join('.'));// Notify the watchers...
				this._taint[path[0]] = true;
				this._remind(0, '_update_'+path[0], {type:'save', id:path[0]});
				data[i] = value;
				if (isUndefined(value)) {
					return false;
				}
			}
			break;
	}
	return true;
};

Worker.prototype._set = function(what, value) {
//	this._push();
	var x = isString(what) ? what.split('.') : (isArray(what) ? what : []);
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
		this._set_(this[x[0]], x, value, 1);
	} catch(e) {
		console.log(error(e.name + ' in ' + this.name + '.set('+JSON.stringify(arguments,2)+'): ' + e.message));
	}
//	this._pop();
	return value;
};

Worker.prototype._setup = function() {
	this._push();
	if (this.settings.system || empty(this.defaults) || this.defaults[APP]) {
		var i;
		if (this.defaults[APP]) {
			for (i in this.defaults[APP]) {
				if (isObject(this.defaults[APP][i]) && isObject(this[i])) {
					this[i] = $.extend(true, {}, this[i], this.defaults[APP][i]);
				} else {
					this[i] = this.defaults[APP][i];
				}
			}
		}
		// NOTE: Really need to move this into .init, and defer .init until when it's actually needed
		for (i in this._datatypes) {// Delete non-existant datatypes
			this._load(i, true); // Merge with default data, first time only
			if (!this[i]) {
				delete this._datatypes[i];
			}
		}
		if (this.setup) {
			try {
				this.setup();
			}catch(e) {
				console.log(error(e.name + ' in ' + this.name + '.setup(): ' + e.message));
			}
		}
	} else { // Get us out of the list!!!
		delete Workers[this.name];
	}
	this._pop();
};

Worker.prototype._trigger = function(selector, id) {
	if (!Worker._triggers_.length) {
		$('body').bind('DOMNodeInserted', function(event){
			var i, t = Worker._triggers_, $target = $(event.target);
			for (i=0; i<t.length; i++) {
				if ($target.is(t[i][1])) {
					t[i][0]._remind(0.1, '_trigger' + t[i][2], {worker:t[i][0], self:true, type:'trigger', id:t[i][2], selector:t[i][1]});// 100ms delay in case of multiple changes in sequence
				}
			}
		});
	}
	Worker._triggers_.push([this, selector, id || selector]);
};

Worker.prototype._unflush = function() {
	this._push();
	if (!this._loaded) {
		this._init();
	}
	if (!this.settings.keep && !this.data && this._datatypes.data) {
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
				deleteElement(worker._watching[path],this.name);
			}
		} else {
			for (i in worker._watching) {
				deleteElement(worker._watching[i],this.name);
			}
		}
		for (i in worker._watching) {
			if (!worker._watching[i].length) {
				delete worker._watching[i];
			}
		}
	}
};

Worker.prototype._update = function(event) {
	if (this._loaded && this.update) {
		this._push();
		var i, flush = false, newevent = {};
		if (isString(event)) {
			event = {type:event};
		} else if (!isObject(event)) {
			event = {};
		}
		if (event.type === 'save') {
			this._save(event.id);
		} else {
			event.worker = Worker.find(event.worker || this); // Can handle strings or workers
			if (isUndefined(this.data) && this._datatypes.data) {
				flush = true;
				this._unflush();
			}
			try {
				this.update(event);
			}catch(e) {
				console.log(error(e.name + ' in ' + this.name + '.update(' + JSON.shallow(event) + '}): ' + e.message));
			}
			if (flush) {
				this._flush();
			}
		}
		this._pop();
	}
};

 Worker.prototype._watch = function(worker, path) {
	worker = Worker.find(worker);
	if (isWorker(worker)) {
		if (!isString(path)) {
			path = 'data';
		}
		for (var i in worker._datatypes) {
			if (path.indexOf(i) === 0) {
				worker._watching[path] = worker._watching[path] || [];
				if (!findInArray(worker._watching[path],this.name)) {
//					console.log(log('Watch(' + worker.name + ', "' + path + '")'));
					worker._watching[path].push(this.name);
				}
				return true;
			}
		}
//		console.log(warn('Attempting to watch bad value: ' + worker.name + ':' + path));
	}
	return false;
};

Worker.prototype._work = function(state) {
	this._push();
	var result = false;
	try {
		result = this.work && this.work(state);
	}catch(e) {
		console.log(error(e.name + ' in ' + this.name + '.work(' + state + '): ' + e.message));
	}
	this._pop();
	return result;
};


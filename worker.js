/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page, Queue, Resources,
	Battle, Generals, LevelUp, Player,
	APP, APPID, log, debug, userID, imagepath, browser, localStorage, window,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH
	makeTimer, Divisor, length, unique, deleteElement, sum, findInArray, findInObject, objectIndex, sortObject, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, isUndefined, isNull, plural, makeTime,
	makeImage, getItem, setItem, empty, compare, error
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

/**
 * Worker class
 * @constructor
 * @param {!string} name Name of the worker
 */
function Worker(name) {
	Workers[name] = this;

	// User data
	this.id = 'golem_panel_'+name.toLowerCase().replace(/[^0-9a-z]/g,'-');
	this.name = name;

	this.defaults = {}; // {'APP':{data:{}, option:{}} - replaces with app-specific data, can be used for any this.* wanted...
	this.settings = {};

	// Data storage
	this['data'] = {};
	this['option'] = {};
	this['runtime'] = null;// {} - set to default runtime values in your worker!
	this['temp'] = {};// Temporary unsaved data for this instance only.
	// Datatypes - one key for each type above
	this._datatypes = {'data':true, 'option':true, 'runtime':true, 'temp':false}; // Used for set/get/save/load. If false then can't save/load.
	this._timestamps = {}; // timestamp of the last time each datatype has been saved
	this._storage = {}; // bytecount of storage = JSON.stringify(this[type]).length * 2
	this._taint = {}; // Has anything changed that might need saving?
	this._saving = {}; // Prevent looping on save

	// Default functions - overload if needed, by default calls prototype function
	this.get = this._get;
	this.set = this._set;

	// Private data
	this._rootpath = true; // Override save path, replaces userID + '.' with ''
	this._loaded = false;
	this._watching = {}; // Watching for changes, path:[workers]
	this._watching_ = {}; // Changes have happened, path:true
	this._reminders = {};
}

// Static Functions
/**
 * @param {(Worker|string)} name Name or ID of the worker. Can also accept a Worker for easier code use.
 * @return {Worker} The found worker
 */
Worker.find = function(name) {
	if (!name) {
		return null;
	}
	try {
		var i;
		if (isString(name)) {
			if (Workers[name]) {
				return Workers[name];
			}
			name = name.toLowerCase();
			for (i in Workers) {
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
/**
 * Clear out all pending _watch events, notify the workers watching that it has happened via _update()
 * @param {string} worker Name of the worker that has notify events pending
 * @protected
 */
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

/**
 * Delete Worker.data from a worker. By the time this is called it has already been saved.
 * @param {string} worker Name of the worker that is having it's data deleted.
 */
Worker._flush_ = function(worker) {
	Workers[worker]._reminders._flush = undefined;
	Workers[worker]['data'] = undefined;
};

// Static Data
Worker.stack = ['unknown'];// array of active workers, last at the start
Worker._triggers_ = [];// Used for this._trigger

// Private functions - only override if you know exactly what you're doing
/**
 * Save all changed datatypes then set a delay to delete this.data if possible
 */
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

/**
 * Forget a _remind or _revive timer with a specific id
 * @param {string} id The id to forget
 * @return {boolean}
 */
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

/**
 * Get a value from one of our _datatypes
 * @param {(string|array)} what The path to the data we want
 * @param {*} def The default value to return if the path we want doesn't exist
 * @return {*} The value we want, or the default we passed in
 */
Worker.prototype._get = function(what, def) { // 'path.to.data'
	var x = isArray(what) ? what : (isString(what) ? what.split('.') : []), data;
	if (!x.length || !(x[0] in this._datatypes)) {
		x.unshift('data');
	}
	try {
		if (x[0] === 'data') {
			this._unflush();
		}
		data = this;
		while (x.length && !isUndefined(data)) {
			data = data[x.shift()];
		}
		return isUndefined(data) ? def : isNull(data) ? null : data.valueOf();
	} catch(e) {
		console.log(error(e.name + ' in ' + this.name + '.get('+JSON.shallow(arguments,2)+'): ' + e.message));
	}
	return isUndefined(def) ? null : def;// Don't want to return "undefined" at this time...
};

/**
 * This is called after _setup. All data exists and our worker is valid for this APP
 */
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

/**
 * Load _datatypes from storage, optionally merging wih current data
 * Save the amount of storage space used
 * Clear the _taint[type] value
 * @param {?string} type The _datatype we wish to load. If null then load all _datatypes
 * @param {?boolean} merge If we wish to merge with current data - normally only used in _setup
 */
Worker.prototype._load = function(type, merge) {
	var i, n;
	if (!this._datatypes[type]) {
		if (!type) {
			for (i in this._datatypes) {
				if (this._datatypes.hasOwnProperty(i) && this._datatypes[i]) {
					this._load(i);
				}
			}
		}
		return;
	}
	this._push();
	n = (this._rootpath ? userID + '.' : '') + type + '.' + this.name;
	i = getItem(n);
	if (isString(i)) { // JSON encoded string
		try {
			this._storage[type] = (n.length + i.length) * 2; // x2 for unicode
			i = JSON.parse(i);
		} catch(e) {
			console.log(error(this.name + '._load(' + type + '): Not JSON data, should only appear once for each type...'));
		}
		if (merge && !compare(i, this[type])) {
			this[type] = $.extend(true, {}, this[type], i);
		} else {
			this[type] = i;
			this._taint[type] = false;
		}
	}
	this._pop();
};

/**
 * Notify on a _watched path change. This can be called explicitely to force a notification, or automatically from _set
 * @param {(array|string)} path The path we want to notify on
 */
Worker.prototype._notify = function(path) {
	var i, txt = '', name = this.name;
	path = isArray(path) ? path : path.split('.');
	for (i=0; i < path.length; i++) {
		txt += (i ? '.' : '') + path[i];
		if (!this._watching_[txt] && this._watching[txt] !== undefined && this._watching[txt].length) {
			if (!length(this._watching_)) {
				window.setTimeout(function(){Worker._notify_(name);}, 50);
			}
			this._watching_[txt] = true;
		}
	}
};

/**
 * Overload a function allowing the original function to still exist as this._parent() within the new function.
 * @param {?string} app The APP we will work on, otherwise will be for any
 * @param {string} name The function name that we are overloading
 * @param {function()} fn The new function
 */
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
	newfn._old = newfn._old._orig || newfn._old; // Support Debug worker
	newfn._new = fn;
	if (app) {
		this.defaults[app] = this.defaults[app] || {};
		if (this.defaults[app][name] && this.defaults[app][name]._orig) { // Support Debug worker
			this.defaults[app][name]._orig = newfn;
		} else {
			this.defaults[app][name] = newfn;
		}
	}
	if (!app || this.defaults[app][name] === this[name]) { // If we've already run _setup
		if (this[name] && this[name]._orig) { // Support Debug worker
			this[name]._orig = newfn;
		} else {
			this[name] = newfn;
		}
	}
};

/**
 * Wrapper for a worker's .parse() function from Page
 * @param {boolean} change Whether the worker is allowed to make changes to the html on the page
 * return {boolean} If the worker wants to change the page
 */
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

/**
 * Removes the current worker from the stack of "Active" workers
 */
Worker.prototype._pop = function() {
	Worker.stack.shift();
};

/**
 * Adds the current worker to the stack of "Active" workers
 */
Worker.prototype._push = function() {
	Worker.stack.unshift(this.name);
};

/**
 * Starts a window.setInterval reminder event, optionally using an id to prevent multiple intervals with the same id
 * @param {number} seconds How long between events
 * @param {?string} id A unique identifier - trying to set the same id more than once will result in only the most recent timer running
 * @param {?(function()|object)} callback A function to call, or an event object to pass to _update
 * @return {number} The window.setInterval result
 */
Worker.prototype._revive = function(seconds, id, callback) {
	var name = this.name, fn;
	if (isFunction(callback)) {
		fn = function(){callback.apply(Workers[name]);};
	} else if (isObject(callback)) {
		fn = function(){Workers[name]._update(callback);};
	} else {
		fn = function(){Workers[name]._update({type:'reminder', self:true, id:(id || null)});};
	}
	if (id && this._reminders['i' + id]) {
		window.clearInterval(this._reminders['i' + id]);
	}
	return (this._reminders['i' + (id || '')] = window.setInterval(fn, Math.max(0, seconds) * 1000));
};

/**
 * Starts a window.setTimeout reminder event, optionally using an id to prevent multiple intervals with the same id
 * @param {number} seconds How long before reminding us
 * @param {?string} id A unique identifier - trying to set the same id more than once will result in only the most recent reminder running
 * @param {?(function()|object)} callback A function to call, or an event object to pass to _update
 * @return {number} The window.setTimeout result
 */
Worker.prototype._remind = function(seconds, id, callback) {
	var name = this.name, fn;
	if (isFunction(callback)) {
		fn = function(){callback.apply(Workers[name]);};
	} else if (isObject(callback)) {
		fn = function(){Workers[name]._update(callback);};
	} else {
		fn = function(){Workers[name]._update({type:'reminder', self:true, id:(id || null)});};
	}
	if (id && this._reminders['t' + id]) {
		window.clearTimeout(this._reminders['t' + id]);
	}
	return (this._reminders['t' + (id || '')] = window.setTimeout(fn, Math.max(0, seconds) * 1000));
};

/**
 * Replace _datatype with a completely new object, make sure any _watch notifications fire if the data changes
 * @param {string} type The _datatype to replace
 * @param {object} data The data to replace it with
 */
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

/**
 * Save _datatypes to storage
 * Save the amount of storage space used
 * Clear the _taint[type] value
 * Make sure we _update() if we are going to save
 * @param {?string} type The _datatype we wish to save. If null then save all _datatypes
 * @return {boolean} Did we save or not
 */
Worker.prototype._save = function(type) {
	var i, n, v;
	if (!this._datatypes[type]) {
		if (!type) {
			n = false;
			for (i in this._datatypes) {
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
	if (this[type] === undefined || this[type] === null || this._saving[type] || (this.settings.taint && this._taint[type] === false)) {
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
	if ((!this.settings.taint || this._taint[type] !== false) && getItem(n) !== v) {
		this._push();
		this._saving[type] = true;
		this._storage[type] = (n.length + v.length) * 2; // x2 for unicode
		this._forget('_'+type);
		this._update({type:type, self:true});
		this._saving[type] = this._taint[type] = false;
		this._timestamps[type] = Date.now();
		setItem(n, v);
		this._pop();
		return true;
	}
	return false;
};

/*
 * Set a value in one of our _datatypes
 * @param {(string|array)} what The path to the data we want to set
 * @param {?*} value The value we will set it to, undefined (not null!) will cause it to be deleted and any empty banches removed
 * @return {*} The value we passed in
 */
Worker.prototype._set = function(what, value) {
	var x = isArray(what) ? what : (isString(what) ? what.split('.') : []), fn = function(data, path, value, depth){
		var i = path[depth];
		switch ((path.length - depth) > 1) { // Can we go deeper?
			case true:
				if (!isObject(data[i])) {
					data[i] = {};
				}
				if (!arguments.callee.call(this, data[i], path, value, depth+1) && empty(data[i])) {// Can clear out empty trees completely...
					data[i] = undefined;
					return false;
				}
				break;
			case false:
				if (!compare(value, data[i])) {
					this._notify(path);// Notify the watchers...
					this._taint[path[0]] = true;
					this._remind(0, '_'+path[0], {type:'save', id:path[0]});
					data[i] = value;
					if (isUndefined(value)) {
						return false;
					}
				}
				break;
		}
		return true;
	};
	if (!x.length || !(x[0] in this._datatypes)) {
		x.unshift('data');
	}
	try {
		if (x[0] === 'data') {
			this._unflush();
		}
		fn.call(this, this, x, value, 0);
	} catch(e) {
		console.log(error(e.name + ' in ' + this.name + '.set('+JSON.stringify(arguments,2)+'): ' + e.message));
	}
	return value;
};

/**
 * First function called in our worker. This is where we decide if we are to become an active worker, or should be deleted.
 * Calls .setup() for worker-specific setup.
 */
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

/**
 * Set up a notification on the content of a DOM node changing.
 * Calls _update with the triggered event after short delay to prevent double-notifications
 * @param {(jQuery|string)} selector The selector to notify on
 * @param {?string} id The id we pass to _update, it will pass selector if not set
 */
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

/**
 * Make sure we have this.data in memory if needed
 */
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

/**
 * Remove a _watch notification from a specific path
 * @param {(Worker|string)} worker The worker we wish to remove the notification from
 * @param {?string} path The path we wish to stop watching, or null for all from this
 */
Worker.prototype._unwatch = function(worker, path) {
	if (typeof worker === 'string') {
		worker = Worker.find(worker);
	}
	if (isWorker(worker)) {
		var i;
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

/**
 * Wrapper function for .update()
 * If event.type === save then we're a triggered save, no other work needed
 * Make sure the event passed is "clean", and that event.worker is a worker instead of a string
 * If .update() returns true then delete all pending _datatype update events
 * @param {(object|string)} event The event that we will copy and pass on to .update(). If it is a string then parse out to event.type
 */
Worker.prototype._update = function(event) {
	if (this._loaded) {
		this._push();
		var i, r, flush = false;
		if (isString(event)) {
			event = {type:event};
		} else if (!isObject(event)) {
			event = {};
		}
		if (event.type === 'save') {
			this._save(event.id);
		} else if (isFunction(this.update) || (event.type && isFunction(this['update_'+event.type]))) {
			event.worker = Worker.find(event.worker || this);
			if (isUndefined(this.data) && this._datatypes.data) {
				flush = true;
				this._unflush();
			}
			try {
				if (event.type && isFunction(this['update_'+event.type])) {
					r = this['update_'+event.type](event);
				} else {
					r = this.update(event);
				}
				if (r) {
					for (i in this._datatypes) {
						this._forget('_'+i);
					}
				}
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

/**
 * Add a _watch notification to a specific path
 * @param {(Worker|string)} worker The worker we wish to add the notification to
 * @param {?string} path The path we wish to watch, or null for 'data'
 */
Worker.prototype._watch = function(worker, path) {
	worker = Worker.find(worker);
	if (isWorker(worker)) {
		var i, x = isArray(path) ? path.join('.') : (isString(path) ? path : 'data');
		for (i in worker._datatypes) {
			if (x.indexOf(i) === 0) {
				worker._watching[x] = worker._watching[x] || [];
				if (!findInArray(worker._watching[x],this.name)) {
					worker._watching[x].push(this.name);
				}
				return true;
			}
		}
	}
	return false;
};

/**
 * Wrapper for a worker's .work() function from Queue
 * @param {boolean} state Whether the worker is allowed to work or should just return if it wants to
 * return {boolean} If the worker wants to work
 */
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


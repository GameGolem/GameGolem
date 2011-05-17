/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page, Queue, Resources,
	Battle, Generals, LevelUp, Player,
	APP, APPID, log, debug, userID, imagepath, browser, localStorage, window,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH
	makeTimer, Divisor, length, sum, findInObject, objectIndex, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, isUndefined, isNull, plural, makeTime,
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
				debug (true/false) - only visible when "Debug" is checked
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
._get(what,def,type)	- Returns the data requested, auto-loads if needed, what is 'path.to.data', default if not found
._set(what,val,type)	- Sets this.data[what] to value, auto-loading if needed. Deletes "empty" data sets (if you don't pass a value)
._push(what,val,type)	- Pushes value onto this.data[what] (as an array), auto-loading if needed.
._pop(what,def,type)	- Pops the data requested (from an array), auto-loads if needed, what is 'path.to.data', default if not found. ** CHANGES DATA **
._shift(what,def,type)	- Shifts the data requested (from an array), auto-loads if needed, what is 'path.to.data', default if not found. ** CHANGES DATA **
._unshift(what,val,type)- Unshifts value onto this.data[what] (as an array), auto-loading if needed.
._transaction(commit)	- Starts a transaction (no args) to allow multilpe _set calls to effectively queue and only write (or clear) with a true (or false) call.

._setup()				- Only ever called once - might even remove us from the list of workers, otherwise loads the data...
._init()				- Calls .init(), loads then saves data (for default values), delete this.data if !nokeep and settings.nodata, then removes itself from use

._load(type)			- Loads data / option from storage, merges with current values, calls .update(type) on change
._save(type)			- Saves data / option to storage, calls .update(type) on change

._flush()				- Calls this._save() then deletes this.data if !this.settings.keep ** PRIVATE **
._unflush()				- Loads .data if it's not there already

._parse(change)			- Calls this.parse(change) inside a try / catch block
._work(state)			- Calls this.work(state) inside a try / catch block

._update(event)			- Calls this.update(event), loading and flushing .data if needed. event = {worker:this, type:'init|data|option|runtime|reminder', [self:true], [id:'reminder id']}

._watch(worker[,path])	- Add a watcher to worker (safe to call multiple times). If anything under "path" is changed will update the watcher
._unwatch(worker[,path])- Removes a watcher from worker (safe to call if not watching). Will remove exact matches or all
._notify(path)			- Updates any workers watching this path or below

._remind(secs,id)		- Calls this._update({worker:this, type:'reminder', id:(id || null)}) after a specified delay. Replaces old 'id' if passed (so only one _remind() per id active)
._revive(secs,id)		- Calls this._update({worker:this, type:'reminder', id:(id || null)}) regularly. Replaces old 'id' if passed (so only one _revive() per id active)
._forget(id)			- Forgets all _remind() and _revive() with the same id
._timer(id)				- Checks if we have an active timer with id

._overload(name,fn)		- Overloads the member function 'name'. this._parent() becomes available for running the original code (it automatically has the same arguments unless passed others)

._pushStack()				- Pushes us onto the "active worker" list for debug messages etc
._popStack()					- Pops us off the "active worker" list
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
	this._storage = {}; // bytecount of storage, with compression = JSON.stringify(this[type]).length * 2
	this._rawsize = {}; // bytecount of storage, without compression = JSON.stringify(this[type]).length * 2
	this._numvars = {}; // number of keys compressed
	this._taint = {}; // Has anything changed that might need saving?
	this._saving = {}; // Prevent looping on save

	// Default functions - overload if needed, by default calls prototype function - these all affect storage
	this.add = this._add;
	this.get = this._get;
	this.set = this._set;
	this.toggle = this._toggle;
	this.push = this._push;
	this.pop = this._pop;
	this.shift = this._shift;
	this.unshift = this._unshift;

	// Private data
	this._rootpath = true; // Override save path, replaces userID + '.' with ''
	this._loaded = false;
	this._watching = {}; // Watching for changes, path:[workers]
	this._watching_ = {}; // Changes have happened, path:true
	this._reminders = {};
	this._transactions_ = null; // Will only be inside a transaction when this is an array of arrays - [[[path,to,data], value], ...]
	this._updates_ = []; // Pending update events, array of objects, key = .worker + .type
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

/**
 * Automatically clear out any pending Update or Save actions. *MUST* be called to work.
 */
Worker.updates = {};
Worker.flushTimer = window.setTimeout(function(){Worker.flush();}, 250); // Kickstart everything running...
Worker.flush = function() {
	var i;
	window.clearTimeout(Worker.flushTimer); // Prevent a pending call from running
	Worker.flushTimer = window.setTimeout(Worker.flush, 1000); // Call flush again in another second
	for (i in Worker.updates) {
//		log(LOG_DEBUG, 'Worker.flush(): '+i+'._update('+JSON.stringify(Workers[i]._updates_)+')');
		Workers[i]._update(null, 'run');
	}
	for (i in Workers) {
//		log(LOG_DEBUG, 'Worker.flush(): '+i+'._flush()');
		Workers[i]._flush();
	}
};

// Static Data
Worker.stack = ['unknown'];// array of active workers, last at the start
Worker._triggers_ = [];// Used for this._trigger
Worker._resize_ = [];// Used for this._resize

// Private functions - only override if you know exactly what you're doing
/**
 * Save all changed datatypes then set a delay to delete this.data if possible
 * NOTE: You should never call this directly - let Worker.flush() handle it instead!
 * @protected
 */
Worker.prototype._flush = function() {
	if (this._loaded) {
		this._pushStack();
		this._save();
		if (this['data'] && !this.settings.keep) {
			delete this['data'];
		}
		this._popStack();
	}
};

/**
 * Adds a value to the current value of one of our _datatypes
 * @param {(string|array)} what The path.to.data / [path, to, data] we want
 * @param {*=} value The value we will add, undefined (not null!) will cause it to be deleted and any empty banches removed
 * @param {string=} type The typeof of data to be set (or return false and don't set anything)
 * @return {*} The value we passed in
 * NOTE: Numbers and strings are old+new, arrays and objects have their contents merged, boolean will toggle the value (and return the new value)
 */
Worker.prototype._add = function(what, value, type, quiet) {
	if (type && ((isFunction(type) && !type(value)) || (isString(type) && typeof value !== type))) {
//		log(LOG_DEBUG, 'Bad type in ' + this.name + '.setAdd('+JSON.shallow(arguments,2)+'): Seen ' + (typeof data));
		return false;
	}
	if (isUndefined(value)) {
		this._set(what);
	} else if (isBoolean(value)) {
		this._set(what, function(old){
			value = (old = old ? (value ? false : undefined) : true) || false;
			return old;
		}, null, quiet);
	} else if (isNumber(value)) {
		this._set(what, function(old){
			return (isNumber(old) ? old : 0) + value;
		}, null, quiet);
	} else if (isString(value)) {
		this._set(what, function(old){
			return (isString(old) ? old : '') + value;
		}, null, quiet);
	} else if (isArray(value)) {
		this._set(what, function(old){
			return (isArray(old) ? old : []).concat(value);
		}, null, quiet);
	} else if (isObject(value)) {
		this._set(what, function(old){
			return $.extend({}, isObject(old) ? old : {}, value);
		}, null, quiet);
	}
	return value;
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
 * @param {(string|array)} what The path.to.data / [path, to, data] we want - (optionally [Object DATA, subpath, to, data] relative to DATA)
 * @param {*} def The default value to return if the path we want doesn't exist
 * @param {string=} type The typeof of data required (or return def)
 * @return {*} The value we want, or the default we passed in
 */
Worker.prototype._get = function(what, def, type) {
	try {
		var i, data, x = isArray(what) ? what.slice(0) : (isString(what) ? what.split('.') : []);
		if (x.length && (isObject(x[0]) || isArray(x[0]))) { // Object or Array
			data = x.shift();
		} else { // String, Number or Undefined etc
			if (!x.length || !(x[0] in this._datatypes)) {
				x.unshift('data');
			}
			if (x[0] === 'data') {
				this._unflush();
			}
			data = this;
			if (isArray(this._transactions_)) {
				for (i=0; i<this._transactions_.length; i++) {
					if (compare(this._transactions_[i][0], x)) {
						break;
					}
				}
				if (i<this._transactions_.length) {
					data = this._transactions_[i][1];
					x = [];
				}
			}
		}
		while (x.length && !isUndefined(data)) {
			data = data[x.shift()];
		}
		if (!isUndefined(data) && (!type || (isFunction(type) && type(data)) || (isString(type) && typeof data === type))) {
			return isNull(data) ? null : data.valueOf();
		}
//		if (!isUndefined(data)) { // NOTE: Without this expect spam on undefined data
//			log(LOG_WARN, 'Bad type in ' + this.name + '.get('+JSON.shallow(arguments,2)+'): Seen ' + (typeof data));
//		}
	} catch(e) {
		log(e, e.name + ' in ' + this.name + '.get('+JSON.shallow(arguments,2)+'): ' + e.message);
	}
	return def;
};

/**
 * This is called after _setup. All data exists and our worker is valid for this APP
 */
Worker.prototype._init = function(old_revision) {
	if (this._loaded) {
		return;
	}
	this._pushStack();
	this._loaded = true;
	if (this.init) {
		try {
			this.init(old_revision);
		}catch(e) {
			log(e, e.name + ' in ' + this.name + '.init(): ' + e.message);
		}
	}
	this._popStack();
};

/**
 * Load _datatypes from storage, optionally merging wih current data
 * Save the amount of storage space used
 * Clear the _taint[type] value
 * @param {string=} type The _datatype we wish to load. If null then load all _datatypes
 * @param {boolean=} merge If we wish to merge with current data - normally only used in _setup
 */
Worker.prototype._load = function(type, merge) {
	var i, path, raw, data, metrics = {};
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
	this._pushStack();
	path = (this._rootpath ? userID + '.' : '') + type + '.' + this.name;
	raw = getItem(path);
	if (isString(raw)) { // JSON encoded string
		try {
			this._storage[type] = (path.length + raw.length) * 2; // x2 for unicode
			data = JSON.decode(raw, metrics);
			this._rawsize[type] = this._storage[type] + ((metrics.mod || 0) - (metrics.oh || 0)) * 2; // x2 for unicode
			this._numvars[type] = metrics.num || 0;
		} catch(e) {
			log(e, this.name + '._load(' + type + '): Not JSON data, should only appear once for each type...');
		}
		if (merge && !compare(data, this[type])) {
			this[type] = $.extend(true, {}, this[type], data);
		} else {
			this[type] = data;
			this._taint[type] = false;
		}
	}
	this._popStack();
};

/**
 * Notify on a _watched path change. This can be called explicitely to force a notification, or automatically from _set
 * @param {(array|string)} path The path we want to notify on
 */
Worker.prototype._notify = function(path) {
	var i, j, txt = '';
	path = isArray(path) ? path : path.split('.');
	for (i=0; i<path.length; i++) {
		txt += (i ? '.' : '') + path[i];
		if (isArray(this._watching[txt])) {
			j = this._watching[txt].length;
			while (j--) {
				Workers[this._watching[txt][j]]._update({worker:this.name, type:'watch', id:txt, path:path.join('.')});
			}
		}
	}
};

/**
 * Overload a function allowing the original function to still exist as this._parent() within the new function.
 * @param {string} app The APP we will work on, otherwise will be for any
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
	this._pushStack();
	var result = false;
	if (this.parse) {
		try {
			this._unflush();
			result = this.parse(change);
		}catch(e) {
			log(e, e.name + ' in ' + this.name + '.parse(' + change + '): ' + e.message);
		}
	}
	this._popStack();
	return result;
};

/**
 * Pops a value from an Array in one of our _datatypes
 * @param {(string|array)} what The path.to.data / [path, to, data] we want
 * @param {*} def The default value to return if the path we want doesn't exist
 * @param {string=} type The typeof of data required (or return def)
 * @return {*} The value we passed in
 * NOTE: This will change the data stored
 */
Worker.prototype._pop = function(what, def, type, quiet) {
	var data;
	this._set(what, function(old){
		old = isArray(old) ? old.slice(0) : [];
		data = old.pop();
		return old;
	}, null, quiet);
	if (!isUndefined(data) && (!type || (isFunction(type) && type(data)) || (isString(type) && typeof data === type))) {
		return isNull(data) ? null : data.valueOf();
	}
	return def;
};

/**
 * Pushes a value to an Array in one of our _datatypes
 * @param {(string|array)} what The path.to.data / [path, to, data] we want
 * @param {*=} value The value we will push, undefined (not null!) will cause it to be deleted and any empty banches removed
 * @param {string=} type The typeof of data to be set (or return false and don't set anything)
 * @return {*} The value we passed in
 * NOTE: Unlike _add() this will force the new value to be pushed onto the end of the old value (as an array)
 */
Worker.prototype._push = function(what, value, type, quiet) {
	if (type && ((isFunction(type) && !type(value)) || (isString(type) && typeof value !== type))) {
//		log(LOG_WARN, 'Bad type in ' + this.name + '.push('+JSON.shallow(arguments,2)+'): Seen ' + (typeof data));
		return false;
	}
	this._set(what, isUndefined(value) ? undefined : function(old){
		old = isArray(old) ? old : [];
		old.push(value);
		return old;
	}, null, quiet);
	return value;
};

/**
 * Removes the current worker from the stack of "Active" workers
 */
Worker.prototype._popStack = function() {
	Worker.stack.shift();
};

/**
 * Adds the current worker to the stack of "Active" workers
 */
Worker.prototype._pushStack = function() {
	Worker.stack.unshift(this.name);
};

/**
 * Starts a window.setInterval reminder event, optionally using an id to prevent multiple intervals with the same id
 * @param {number} seconds How long between events
 * @param {string=} id A unique identifier - trying to set the same id more than once will result in only the most recent timer running
 * @param {(function()|object)=} callback A function to call, or an event object to pass to _update
 * @return {number} The window.setInterval result
 */
Worker.prototype._revive = function(seconds, id, callback) {
	var name = this.name, fn;
	if (isFunction(callback)) {
		fn = function(){callback.apply(Workers[name]);};
	} else if (isObject(callback)) {
		fn = function(){Workers[name]._update(callback, 'run');};
	} else {
		fn = function(){Workers[name]._update({type:'reminder', id:(id || null)}, 'run');};
	}
	if (id && this._reminders['i' + id]) {
		window.clearInterval(this._reminders['i' + id]);
	}
	return (this._reminders['i' + (id || '')] = window.setInterval(fn, Math.max(0, seconds) * 1000));
};

/**
 * Starts a window.setTimeout reminder event, optionally using an id to prevent multiple intervals with the same id
 * @param {number} seconds How long before reminding us
 * @param {string=} id A unique identifier - trying to set the same id more than once will result in only the most recent reminder running
 * @param {(function()|object)=} callback A function to call, or an event object to pass to _update
 * @return {number} The window.setTimeout result
 */
Worker.prototype._remind = function(seconds, id, callback) {
	var name = this.name, fn;
	if (isFunction(callback)) {
		fn = function(){delete Workers[name]._reminders['t' + id];callback.apply(Workers[name]);};
	} else if (isObject(callback)) {
		fn = function(){delete Workers[name]._reminders['t' + id];Workers[name]._update(callback, 'run');};
	} else {
		fn = function(){delete Workers[name]._reminders['t' + id];Workers[name]._update({type:'reminder', id:(id || null)}, 'run');};
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
	var i, x, val, old = this[type];
	this[type] = data;
	for (i in this._watching) {
		x = i.split('.');
		if (x[0] === type && this._get(x, 123) !== this._get([old].concat(x), 456)) {
			this._notify(i);
		}
	}
	this._taint[type] = true;
	this._save(type);
};

/**
 * Set up a notification on the window size changing.
 * @param {?Function} fn The function to call on a resize event, otherwise calls _update with type:'resize'
 */
Worker.prototype._resize = function(fn) {
	if (!Worker._resize_.length) {
		$(window).resize(function(){
			var i, w, l=Worker._resize_.length;
			for (i=0; i<l; i++) {
				w = Worker._resize_[i];
				if (isFunction(w)) {
					w();
				} else {
					Worker.find(w)._update('resize', 'run');
				}
			}
		});
	}
	if (isFunction(fn)) {
		Worker._resize_.unshift(fn); // Make sure that functions run before updates
	} else {
		Worker._resize_.push(this.name);
	}
};

/**
 * Save _datatypes to storage
 * Save the amount of storage space used
 * Clear the _taint[type] value
 * Make sure we _update() if we are going to save
 * @param {string=} type The _datatype we wish to save. If null then save all _datatypes
 * @return {boolean} Did we save or not
 */
Worker.prototype._save = function(type) {
	var i, n, v, metrics = {};
	if (this._loaded) {
		if (!type) {
			n = false;
			for (i in this._datatypes) {
				if (this._datatypes.hasOwnProperty(i) && this._datatypes[i]) {
					n = arguments.callee.call(this,i) || n; // Stop Debug noting it as multiple calls
				}
			}
			return n;
		}
		if (!this._datatypes[type] || this._saving[type] || this[type] === undefined || this[type] === null || (this.settings.taint && !this._taint[type])) {
			return false;
		}
		this._saving[type] = true;
		this._update(null, 'run'); // Make sure we flush any pending updates
		this._saving[type] = false;
		try {
			v = JSON.encode(this[type], metrics);
		} catch (e) {
			log(e, e.name + ' in ' + this.name + '.save(' + type + '): ' + e.message);
			return false; // exit so we don't try to save mangled data over good data
		}
		n = (this._rootpath ? userID + '.' : '') + type + '.' + this.name;
		if (this._taint[type] || getItem(n) !== v) { // First two are to save the extra getItem from being called
			this._pushStack();
			this._taint[type] = false;
			this._timestamps[type] = Date.now();
			try {
				setItem(n, v);
				this._storage[type] = (n.length + v.length) * 2; // x2 for unicode
				this._rawsize[type] = this._storage[type] + ((metrics.mod || 0) - (metrics.oh || 0)) * 2; // x2 for unicode
				this._numvars[type] = metrics.num || 0;
			} catch (e2) {
				log(e2, e2.name + ' in ' + this.name + '.save(' + type + '): Saving: ' + e2.message);
			}
			this._popStack();
			return true;
		}
	}
	return false;
};

/**
 * Set a value in one of our _datatypes
 * @param {(string|array)} what The path.to.data / [path, to, data] we want
 * @param {*=} value The value we will set it to, undefined (not null!) will cause it to be deleted and any empty banches removed
 * @param {string=} type The typeof of data to be set (or return false and don't set anything)
 * @param {?Boolean} quiet Don't _notify on changes (use sparingly)
 * @return {*} The value we passed in
 */
Worker.prototype._set = function(what, value, type, quiet) {
	if (type && ((isFunction(type) && !type(value)) || (isString(type) && typeof value !== type))) {
//		log(LOG_WARN, 'Bad type in ' + this.name + '.set('+JSON.shallow(arguments,2)+'): Seen ' + (typeof data));
		return false;
	}
	var i, x = isArray(what) ? what.slice(0) : (isString(what) ? what.split('.') : []), fn = function(data, path, value, depth){
		var i = path[depth];
		switch ((path.length - depth) > 1) { // Can we go deeper?
			case true:
				if (!isObject(data[i])) {
					data[i] = {};
				}
				if (!arguments.callee.call(this, data[i], path, value, depth+1) && depth >= 1 && empty(data[i])) {// Can clear out empty trees completely...
					delete data[i];
					return false;
				}
				break;
			case false:
				if (!compare(value, data[i])) {
					if (!quiet) {
						this._notify(path);// Notify the watchers...
					}
					this._taint[path[0]] = true;
					this._update({type:path[0]});
					if (isUndefined(value)) {
						delete data[i];
						return false;
					} else {
						data[i] = value;
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
		if (isFunction(value)) { // Transactions need to store the intermediate values in case a future _set within it changes the value again
			value = value.call(this, this._get(x));
		}
		if (isArray(this._transactions_)) { // *Cannot* set data directly while in a transaction
			for (i=0; i<this._transactions_.length; i++) {
				if (compare(this._transactions_[i][0], x)) {
					break;
				}
			}
			this._transactions_[i] = [x, value];
		} else {
			if (x[0] === 'data') {
				this._unflush();
			}
			fn.call(this, this, x, value, 0);
		}
	} catch(e) {
		log(e, e.name + ' in ' + this.name + '.set('+JSON.stringify(arguments,2)+'): ' + e.message);
	}
	return value;
};

/**
 * First function called in our worker. This is where we decide if we are to become an active worker, or should be deleted.
 * Calls .setup() for worker-specific setup.
 */
Worker.prototype._setup = function(old_revision) {
	this._pushStack();
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
			if (!this[i]) {
				delete this._datatypes[i];
				delete this[i]; // Make sure it's undefined and not null
			} else {
				this._load(i, true); // Merge with default data, first time only
			}
		}
		if (this.setup) {
			try {
				this.setup(old_revision);
			}catch(e) {
				log(e, e.name + ' in ' + this.name + '.setup(): ' + e.message);
			}
		}
	} else { // Get us out of the list!!!
		delete Workers[this.name];
	}
	this._popStack();
};

/**
 * Shifts a value from an Array in one of our _datatypes
 * @param {(string|array)} what The path.to.data / [path, to, data] we want
 * @param {*} def The default value to return if the path we want doesn't exist
 * @param {string=} type The typeof of data required (or return def)
 * @return {*} The value we passed in
 * NOTE: This will change the data stored
 */
Worker.prototype._shift = function(what, def, type, quiet) {
	var data;
	this._set(what, function(old){
		old = isArray(old) ? old.slice(0) : [];
		data = old.shift();
		return old;
	}, null, quiet);
	if (!isUndefined(data) && (!type || (isFunction(type) && type(data)) || (isString(type) && typeof data === type))) {
		return isNull(data) ? null : data.valueOf();
	}
	return def;
};

/**
 * Toggles a boolean value in of one of our _datatypes
 * This is an readability alias
 * @param {(string|array)} what The path.to.data / [path, to, data] we want
 * @param {?Boolean} keep Do we want to keep false values?
 * @return {*} The current state
 */
Worker.prototype._toggle = function(what, keep, type, quiet) {
	return this._add(what, keep ? true : false, null, quiet);
};

/**
 * Is there an active timer for a specific id?
 * @param {string} id The timer id to check.
 * @return {boolean} True if there is an active timer, false otherwise.
 */
Worker.prototype._timer = function(id) {
	if (id && (this._reminders['i' + id] || this._reminders['t' + id])) {
		return true;
	}
	return false;
};

/**
 * Defer _set changes to allow them to be flushed. While inside a transaction all _set and _get works as normal, however direct access returns pre-transaction data until committed.
 * this._transaction() - BEGIN
 * this._transaction(true) - COMMIT
 * this._transaction(false) - ROLLBACK
 * @param {boolean=} commit Whether to commit changes or not - undefined to begin
 */
Worker.prototype._transaction = function(commit) {
	if (isUndefined(commit)) { // Begin transaction
//		log(LOG_DEBUG, 'Begin Transaction:');
		this._transactions_ = [];
	} else {
		var i, list = this._transactions_;
		this._transactions_ = null; // Both rollback and commit clear current status
		if (commit && isArray(list)) { // Commit transaction
//			log(LOG_DEBUG, 'Commit Transaction:');
			for (i=0; i<list.length; i++) {
//				log(LOG_DEBUG, '...'+JSON.shallow(list[i],2));
				this._set(list[i][0], list[i][1]);
			}
		}
//		else log(LOG_DEBUG, 'Rollback Transaction:');
	}
};

/**
 * Set up a notification on the content of a DOM node changing.
 * Calls _update with the triggered event after short delay to prevent double-notifications
 * @param {(jQuery|string)} selector The selector to notify on
 * @param {string=} id The id we pass to _update, it will pass selector if not set
 */
Worker.prototype._trigger = function(selector, id) {
	if (!Worker._triggers_.length) {
		$('body').bind('DOMNodeInserted', function(event){
			var i, t = Worker._triggers_, $target = $(event.target);
			for (i=0; i<t.length; i++) {
				if ($target.is(t[i][1])) {
					t[i][0]._remind(0.5, '_trigger_'+id, {worker:t[i][0], type:'trigger', id:t[i][2], selector:t[i][1]});
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
	this._pushStack();
	if (!this._loaded) {
		this._init();
	}
	if (!this.settings.keep && !this.data && this._datatypes.data) {
		this._load('data');
	}
	this._popStack();
};

/**
 * Pushes a value to an Array in one of our _datatypes
 * @param {(string|array)} what The path.to.data / [path, to, data] we want
 * @param {*=} value The value we will push, undefined (not null!) will cause it to be deleted and any empty banches removed
 * @param {string=} type The typeof of data to be set (or return false and don't set anything)
 * @return {*} The value we passed in
 * NOTE: Unlike _add() this will force the new value to be pushed onto the end of the old value (as an array)
 */
Worker.prototype._unshift = function(what, value, type, quiet) {
	if (type && ((isFunction(type) && !type(value)) || (isString(type) && typeof value !== type))) {
//		log(LOG_DEBUG, 'Bad type in ' + this.name + '.unshift('+JSON.shallow(arguments,2)+'): Seen ' + (typeof data));
		return false;
	}
	this._set(what, isUndefined(value) ? undefined : function(old){
		old = isArray(old) ? old : [];
		old.unshift(value);
		return old;
	}, null, quiet);
	return value;
};

/**
 * Remove a _watch notification from a specific path
 * @param {(Worker|string)} worker The worker we wish to remove the notification from
 * @param {string=} path The path we wish to stop watching, or null for all from this
 */
Worker.prototype._unwatch = function(worker, path) {
	if (typeof worker === 'string') {
		worker = Worker.find(worker);
	}
	if (isWorker(worker)) {
		var i;
		if (isString(path)) {
			if (path in worker._watching) {
				worker._watching[path].remove(this.name);
			}
		} else {
			for (i in worker._watching) {
				worker._watching[i].remove(this.name);
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
 * Make sure the event passed is "clean", and be aware that event.worker is stored as a string, but passed to .update() as a Worker
 * If .update() returns true then delete all pending update events
 * @param {(object|string)} event The event that we will copy and pass on to .update(). If it is a string then parse out to event.type
 * @param {string=} action The type of update - "add" (default) will add to the update queue, "delete" will deleting matching events, "purge" will purge the queue completely (use with care), "run" will run through the queue and act on every one (automatically happens every 250ms)
 */
Worker.prototype._update = function(event, action) {
	if (this._loaded) {
		this._pushStack();
		var i, done = false, events, old;
		if (event) {
			if (isString(event)) {
				event = {type:event};
			} else if (!isObject(event)) {
				event = {};
			}
			action = action || 'add';
			if (event.type && (isFunction(this.update) || isFunction(this['update_'+event.type]))) {
				event.worker = isWorker(event.worker) ? event.worker.name : event.worker || this.name;
				if (action === 'add' || action === 'run' || action === 'delete') { // Delete from update queue
					this._updates_.getEvent(event.worker, event.type, event.id);
				}
				if (action === 'add' || action === 'run') { // Add to update queue, old key already deleted
					this._updates_.unshift($.extend({}, event));
				}
				if (action === 'purge') { // Purge the update queue immediately - don't do anything with the entries
					this._updates_ = [];
				}
				if (this._updates_.length) {
					Worker.updates[this.name] = true;
				} else {
					delete Worker.updates[this.name];
				}
			}
		}
		if (action === 'run' && Worker.updates[this.name] && this._updates_.length) { // Go through the event list and process each one
			this._unflush();
			old = this._updates_;
			this._updates_ = [];
			events = [];
			for (i=0; i<old.length; i++) {
				event = $.extend({}, old[i]);
				event.worker = Worker.find(event.worker || this);
				events.push(event);
			}
			while (!done && events.length) {
				try {
					if (isFunction(this['update_'+events[0].type])) {
						done = this['update_'+events[0].type](events[0], events);
					} else {
						done = this.update(events[0], events);
					}
				}catch(e) {
					log(e, e.name + ' in ' + this.name + '.update(' + JSON.shallow(events[0]) + '): ' + e.message);
				}
				if (done) {
					events = []; // Purely in case we need to add new events below
				} else {
					events.shift();
				}
				while (event = this._updates_.shift()) { // Prevent endless loops, while keeping anything we added
					if (!(event.type in this._datatypes) && !old.findEvent(event.worker, event.type, event.id)) {
						done = false;
						old.push($.extend({}, event));
						event.worker = Worker.find(event.worker || this);
						events.push(event);
					}
				}
			}
			delete Worker.updates[this.name];
		}
		this._popStack();
	}
};

/**
 * Add a _watch notification to a specific path
 * @param {(Worker|string)} worker The worker we wish to add the notification to
 * @param {string=} path The path we wish to watch, or null for 'data'
 */
Worker.prototype._watch = function(worker, path) {
	worker = Worker.find(worker);
	if (isWorker(worker)) {
		var i, x = isArray(path) ? path.join('.') : (isString(path) ? path : 'data');
		for (i in worker._datatypes) {
			if (x.indexOf(i) === 0) {
				worker._watching[x] = worker._watching[x] || [];
				if (worker._watching[x].indexOf(this.name) === -1) {
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
	this._pushStack();
	var result = false;
	try {
		result = this.work && this.work(state);
	}catch(e) {
		log(e, e.name + ' in ' + this.name + '.work(' + state + '): ' + e.message);
	}
	this._popStack();
	return result;
};


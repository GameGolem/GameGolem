/* Worker Prototype
   ----------------
new Worker(name, pages, settings)

*** User data***
.id				- If we have a .display then this is the html #id of the worker
.name			- String, the same as our class name.
.pages			- String, list of pages that we want in the form "town.soldiers keep.stats"
.data			- Object, for public reading, automatically saved
.option			- Object, our options, changed from outide ourselves
.settings		- Object, various values for various sections, default is always false
				unsortable - stops a worker being sorted in the queue, prevents this.work(true)
				keep - without this data is flushed when not used - noly keep if other workers regularly access you
.display		- Create the display object for the settings page.

*** User functions ***
.init()			- After the script has loaded, but before anything else has run. Data has been filled, but nothing has been run.
				This is the bext place to put default actions etc...
				Cannot rely on other workers having their data filled out...
.parse(change)	- This can read data from the current page and cannot perform any actions.
				change = false - Not allowed to change *anything*, cannot read from other Workers.
				change = true - Can now change inline and read from other Workers.
				return true - We need to run again with status=1
				return false - We're finished
.work(state)	- Do anything we need to do when it's our turn - this includes page changes.
				state = false - It's not our turn, don't start anything if we can't finish in this one call
				state = true - It's our turn, do everything - Only true if not interrupted
				return true if we need to keep working (after a delay etc)
				return false when someone else can work
.update(type)	- Called when the data or options have been changed (even on this._load()!). If !settings.data and !settings.option then call on data, otherwise whichever is set.
				type = "data" or "option"
.get(what)		- Calls this._get(what)
				Official way to get any information from another worker
				Overload for "special" data, and pass up to _get if basic data

NOTE: If there is a work() but no display() then work(false) will be called before anything on the queue, but it will never be able to have focus (ie, read only)

*** Private data ***
._loaded		- true once ._init() has run
._working		- Prevent recursive calling of various private functions
._changed		- Timestamp of the last time this.data changed
._watching		- List of other workers that want to have .update() after this.update()

*** Private functions ***
._get(what)		- Returns the data requested, auto-loads if needed, what is 'path.to.data'
._init(keep)	- Calls .init(), loads then saves data (for default values), delete this.data if !nokeep and settings.nodata, then removes itself from use
._load(type)	- Loads data / option from storage, merges with current values, calls .update(type) on change
._save(type)	- Saves data / option to storage, calls .update(type) on change
._flush()		- Calls this._save() then deletes this.data if !this.settings.keep
._update(type)	- Calls this.update(type), loading and flushing .data if needed
._watch(worker)	- Add a watcher to worker - so this.update() gets called whenever worker.update() does
*/
var Workers = [];

function Worker(name,pages,settings) {
	Workers.push(this);

	// User data
	this.id = null;
	this.name = name;
	this.pages = pages;
	this.settings = settings || {};
	this.data = {};
	this.option = {};
	this.display = null;

	// User functions
	this.init = null; //function() {};
	this.parse = null; //function(change) {return false;};
	this.work = null; //function(state) {return false;};
	this.update = null; //function(type){};
	this.get = function(what) {return this._get(what);}; // Overload if needed

	// Private data
	this._loaded = false;
	this._working = {data:false, option:false, update:false};
	this._changed = Date.now();
	this._watching = [];

	// Private functions - only override if you know exactly what you're doing
	this._watch = function(worker) {
		for (var i=0; i<worker._watching.length; i++) {
			if (worker._watching[i] === this) {
				return;
			}
		}
		worker._watching.push(this);
	};

	this._update = function(type) {
		if (this._loaded && (this.update || this._watching.length)) {
			var i, flush = false;
			this._working.update = true;
			if (!this.data) {
				flush = true;
				this._load('data');
			}
			if (this.update) {
				try {
					this.update(type);
				}catch(e) {
					debug(e.name + ' in ' + this.name + '.update(' + (type ? (typeof type === 'string' ? type : type.name) : '') + '): ' + e.message);
				}
			}
			for (i=0; i<this._watching.length; i++) {
				if (this._watching[i] === this) {
					if (this.update) {
						try {
							this.update(this);
						}catch(e) {
							debug(e.name + ' in ' + this.name + '.update(this): ' + e.message);
						}
					}
				} else {
					this._watching[i]._update(this);
				}
			}
			if (flush) {
				this._flush();
			}
			this._working.update = false;
		}
	};

	this._get = function(what) { // 'path.to.data'
		var x = typeof what === 'string' ? what.split('.') : (typeof what === 'object' ? what : []);
		if (!this._loaded) {
			this._init();
		} else if (!this.data) { // Don't flush as one request often follows another
			this._load('data');
		}
		try {
			switch(x.length) {
				case 0:	return this.data;
				case 1:	return this.data[x[0]];
				case 2: return this.data[x[0]][x[1]];
				case 3: return this.data[x[0]][x[1]][x[2]];
				case 4: return this.data[x[0]][x[1]][x[2]][x[3]];
				case 5: return this.data[x[0]][x[1]][x[2]][x[3]][x[4]];
				case 6: return this.data[x[0]][x[1]][x[2]][x[3]][x[4]][x[5]];
				case 7: return this.data[x[0]][x[1]][x[2]][x[3]][x[4]][x[5]][x[6]];
			}
		} catch(err) {
			return null;
		}
	};

	this._flush = function() {
		this._save();
		if (!this.settings.keep) {
			delete this.data;
		}
	};

	this._init = function() {
		if (this._loaded) {
			return;
		}
		this._loaded = true;
		if (this.init) {
			try {
				this.init();
			}catch(e) {
				debug(e.name + ' in ' + this.name + '.init(): ' + e.message);
			}
		}
	};

	this._load = function(type) {
		if (type !== 'data' && type !== 'option') {
			this._load('data');
			this._load('option');
			return;
		}
		var old, v = getItem(userID + '.' + type + '.' + this.name) || this[type];
		if (typeof v !== 'string') { // Should never happen as all our info is objects!
			this[type] = v;
			return;
		}
		switch(v.charAt(0)) {
			case '"': // Should never happen as all our info is objects!
				this[type] = v.replace(/^"|"$/g,'');
				return;
			case '(':
			case '[':
				if (!this[type] || typeof this[type] !== 'array' && typeof this[type] !== 'object') {
					this[type] = eval(v);
					return;
				}
//				old = this[type].toSource();
				this[type] = $.extend(true, {}, this[type], eval(v));
//				if (old !== this[type].toSource()) {
//					this._update(type);
//				}
				return;
		}
	};

	this._save = function(type) {
		if (type !== 'data' && type !== 'option') {
			return this._save('data') + this._save('option');
		}
		if (typeof this[type] === 'undefined' || !this[type] || this._working[type]) {
			return false;
		}
		var i, n = userID + '.' + type + '.' + this.name, v;
		switch(typeof this[type]) {
			case 'string': // Should never happen as all our info is objects!
				v = '"' + this[type] + '"';
				break;
			case 'array':
			case 'object':
				v = this[type].toSource();
				break;
			default: // Should never happen as all our info is objects!
				v = this[type];
				break;
		}
		if (getItem(n) === 'undefined' || getItem(n) !== v) {
			this._working[type] = true;
			this._changed = Date.now();
			this._update(type);
			setItem(n, v);
			this._working[type] = false;
			return true;
		}
		return false;
	};
}


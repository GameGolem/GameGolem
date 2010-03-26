/* Worker Prototype
   ----------------
new Worker(name,pages)
.name			- String, the same as our class name.
.pages			- String, list of pages that we want in the form "town.soldiers keep.stats"
.data			- Object, for public reading, automatically saved
.option			- Object, our options, changed from outide ourselves
.unsortable		- Stops the .display from being sorted in the Queue - added to the front (semi-private) - never use if it has .work(true)

.onload()		- After the script has loaded, but before anything else has run. Data has been filled, but nothing has been run.
				This is the bext place to put default values etc...
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
.display()		- Create the display object for the settings page.
				All elements of the display are in here, it's called before anything else in the worker.
				The header is taken care of elsewhere.
.update(type)	- Called when the data or options have been changed
				type = "data" or "option"
				
If there is a work() but no display() then work(false) will be called before anything on the queue, but it will never be able to have focus (ie, read only)
*/
var Workers = [];

function Worker(name,pages) {
	this.id = Workers.push(this);
	this.name = name;
	this.pages = pages;
	this.unsortable = false;
	this.data = {};
	this.option = {};
	this.onload = null;
	this.display = null; //function(added) {return false;};
	this.parse = null; //function(change) {return false;};
	this.work = null; //function(state) {return false;};
	this.update = null; //function(type){};
	this.priv_since = 0;
	this.priv_id = null;

	// Global functions (if there was such a thing in javascript)
	this.load = function(type) {
		if (type !== 'data' && type !== 'option') {
			this.load('data');
			this.load('option');
			return;
		}
		var i, v = getItem(userID + '.' + type + '.' + this.name) || this[type];
		if (typeof v !== 'string') {
			this[type] = v;
			return;
		}
		switch(v.charAt(0)) {
			case '"':
				this[type] = v.replace(/^"|"$/g,'');
				return;
			case '(':
			case '[':
				if (typeof this[type] === 'array' || typeof this[type] === 'object') {
					this[type] = $.extend(true, {}, this[type], eval(v));
					return;
				}
				this[type] = eval(v);
				return;
		}
	};

	this.save = function(type) {
		if (type !== 'data' && type !== 'option') {
			return this.save('data') + this.save('option');
		}
		if (typeof this[type] === 'undefined' || !this[type]) {
			return false;
		}
		var i, n = userID + '.' + type + '.' + this.name, v;
		switch(typeof this[type]) {
			case 'string':
				v = '"' + this[type] + '"';
				break;
			case 'array':
			case 'object':
				v = this[type].toSource();
				break;
			default:
				v = this[type];
				break;
		}
		if (getItem(n) === 'undefined' || getItem(n) !== v) {
			if (this.update) {
				this.update(type);
			}
			GM_setValue(n, v);
			return true;
		}
		return false;
	};
}

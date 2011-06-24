/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	browser, window, localStorage, console, chrome
	$, Worker, Army, Config, Dashboard, History, Page, Queue, Resources,
	Battle, Generals, LevelUp, Player,
	version, revision, isRelease
	APP, APPID, PREFIX, log:true, debug, userID, imagepath
	length:true
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH
	Workers, makeImage:true
*/
// Utility functions

// Functions to check type of variable - here for javascript optimisations and readability, makes a miniscule difference using them

/**
 * Check if a passed object is an Array (not an Object)
 * @param {*} obj The object we wish to check
 * @return {boolean} If it is or not
 */
var isArray = function(obj) {
	return obj && obj.constructor === Array;
};

/**
 * Check if a passed object is an Object (not an Array)
 * @param {*} obj The object we wish to check
 * @return {boolean} If it is or not
 */
var isObject = function(obj) {
	return obj && obj.constructor === Object;
};

/**
 * Check if a passed object is an Boolean
 * @param {*} obj The object we wish to check
 * @return {boolean} If it is or not
 */
var isBoolean = function(obj) {
	return obj === true || obj === false;
};

/**
 * Check if a passed object is a Function
 * @param {*} obj The object we wish to check
 * @return {boolean} If it is or not
 */
var isFunction = function(obj) {
	return obj && obj.constructor === Function;
};

/**
 * Check if a passed object is a RegExp
 * @param {*} obj The object we wish to check
 * @return {boolean} If it is or not
 */
var isRegExp = function(obj) {
	return obj && obj.constructor === RegExp;
};

/**
 * Check if a passed object is a Worker
 * @param {*} obj The object we wish to check
 * @return {boolean} If it is or not
 */
var isWorker = function(obj) {
	return obj && obj.constructor === Worker;
};

/**
 * Check if a passed object is a Script
 * @param {*} obj The object we wish to check
 * @return {boolean} If it is or not
 */
var isScript = function(obj) {
	return obj && obj.constructor === Script;
};

/**
 * Check if a passed object is an Error
 * @param {*} obj The object we wish to check
 * @return {boolean} If it is or not
 */
var isError = function(obj) {
	return !!(typeof obj === 'object' && obj.name && obj.message);
};

/**
 * Check if a passed object is a Number
 * @param {*} obj The object we wish to check
 * @return {boolean} If it is or not
 */
var isNumber = function(obj) {
	return typeof obj === 'number';
};

/**
 * Check if a passed object is a String
 * @param {*} obj The object we wish to check
 * @return {boolean} If it is or not
 */
var isString = function(obj) {
	return typeof obj === 'string';
};

/**
 * Check if a passed object is Undefined
 * @param {*} obj The object we wish to check
 * @return {boolean} If it is or not
 */
var isUndefined = function(obj) {
	return typeof obj === 'undefined';
};

/**
 * Check if a passed object is Null
 * @param {*} obj The object we wish to check
 * @return {boolean} If it is or not
 */
var isNull = function(obj) {
	return obj === null;
};

/**
 * Log a message, can have various prefix parts
 * @param {(number|string)} level The level to use (or the txt if only one arg)
 * @param {string=} txt The message to log
 * NOTE: Will be replaced by Debug Worker if present!
 */
var LOG_INFO = 0;
var LOG_LOG = 1
var LOG_WARN = 2;
var LOG_ERROR = 3;
var LOG_DEBUG = 4;
var LOG_USER1 = 5;
var LOG_USER2 = 6;
var LOG_USER3 = 7;
var LOG_USER4 = 8;
var LOG_USER5 = 9;
var log = function(level, txt /*, obj, array etc*/){
	var level, args = Array.prototype.slice.call(arguments), prefix = [],
		date = [true, true, true, true, true, true, true, true, true, true],
		rev = [false, false, true, true, true, true, true, true, true, true],
		worker = [false, true, true, true, true, true, true, true, true, true];
	if (isNumber(args[0])) {
		level = Math.range(0, args.shift(), 9);
	} else if (isError(args[0])) {
		args.shift();
		level = LOG_ERROR;
	} else {
		level = LOG_LOG;
	}
	if (rev[level]) {
		prefix.push('[' + (isRelease ? 'v'+version : 'r'+revision) + ']');
	}
	if (date[level]) {
		prefix.push('[' + (new Date()).toLocaleTimeString() + ']');
	}
	if (worker[level]) {
		prefix.push(Worker.stack.length ? Worker.stack[0] : '');
	}
	args[0] = prefix.join(' ') + (prefix.length && args[0] ? ': ' : '') + (args[0] || '');
	try {
		console.log.apply(console.firebug ? window : console, args);
	} catch(e) { // FF4 fix - doesn't like .apply
		console.log(args);
	}
};

// Prototypes to ease functionality

String.prototype.trim = function(inside) {
	if (inside) {
		this.replace(/^\s+$/gm, ' ')
	}
	return this.replace(/^\s+|\s+$/gm, '');
};

String.prototype.filepart = function() {
	var x = this.lastIndexOf('/');
	if (x >= 0) {
		return this.substr(x+1);
	}
	return this;
};

String.prototype.pathpart = function() {
	var x = this.lastIndexOf('/');
	if (x >= 0) {
		return this.substr(0, x+1);
	}
	return this;
};

String.prototype.regex = function(r) {
	var a = this.match(r), i, rx;
	if (a) {
		if (r.global) {
			if (/(^|[^\\]|[^\\](\\\\)*)\([^?]/.test(r.source)) { // Try to match '(blah' but not '\(blah' or '(?:blah' - ignore invalid regexp
				rx = new RegExp(r.source, (r.ignoreCase ? 'i' : '') + (r.multiline ? 'm' : ''));
			}
		} else {
			a.shift();
		}
		i = a.length;
		while (i--) {
			if (a[i]) {
				if (rx) {
					a[i] = arguments.callee.call(a[i], rx);
				} else {
					if (a[i].search(/^[-+]?\d*\.?\d+(?:e[-+]?\d+)?$/i) >= 0) {
						a[i] = parseFloat(a[i]);
					}
				}
			}
		}
		if (!rx && a.length === 1) {
			return a[0];
		}
	}
	return a;
};

String.prototype.toNumber = function() {
	return parseFloat(this);
};

String.prototype.parseTimer = function() {
	var a = this.split(':'), b = 0, i;
	for (i=0; i<a.length; i++) {
		b = b * 60 + parseInt(a[i],10);
	}
	if (isNaN(b)) {
		b = 9999;
	}
	return b;
};

String.prototype.ucfirst = function() {
	return this.charAt(0).toUpperCase() + this.substr(1);
};

String.prototype.ucwords = function() {
	return this.replace(/^(.)|\s(.)/g, function($1){
		return $1.toUpperCase();
	});
};

String.prototype.html_escape = function() {
	return this.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
};

String.prototype.regexp_escape = function() {
	return this.replace(/([\\\^\$*+\[\]?{}.=!:(|)])/g, '\\$&');
//	return this.replace(/\\/g, '\\\\').replace(/\^/g, '\\^').replace(/\$/g, '\\$').replace(/\./g, '\\.').replace(/\+/g, '\\+').replace(/\*/g, '\\*').replace(/\?/g, '\\?').replace(/\{/g, '\\{').replace(/\}/g, '\\}').replace(/\(/g, '\\(').replace(/\)/g, '\\)').replace(/\[/g, '\\[').replace(/\]/g, '\\]').replace(/\|/g, '\\|');
};

Number.prototype.round = function(dec) {
	return Math.round(this*Math.pow(10,(dec||0))) / Math.pow(10,(dec||0));
};

Number.prototype.SI = function(prec) {
	var a = Math.abs(this), u,
		p = Math.range(1, isNumber(prec) ? prec.round(0) : 3, 16);

	if (a >= 1e18) {
		return this.toExponential(Math.max(0, p - 1));
	}

	else if (a >= 1e17) {
		return (this / 1e15).round(Math.max(0, p - 3)) + 'q';
	} else if (a >= 1e16) {
		return (this / 1e15).round(Math.max(0, p - 2)) + 'q';
	} else if (a >= 1e15) {
		return (this / 1e15).round(Math.max(0, p - 1)) + 'q';
	}

	else if (a >= 1e14) {
		return (this / 1e12).round(Math.max(0, p - 3)) + 't';
	} else if (a >= 1e13) {
		return (this / 1e12).round(Math.max(0, p - 2)) + 't';
	} else if (a >= 1e12) {
		return (this / 1e12).round(Math.max(0, p - 1)) + 't';
	}

	else if (a >= 1e11) {
		return (this / 1e9).round(Math.max(0, p - 3)) + 'b';
	} else if (a >= 1e10) {
		return (this / 1e9).round(Math.max(0, p - 2)) + 'b';
	} else if (a >= 1e9) {
		return (this / 1e9).round(Math.max(0, p - 1)) + 'b';
	}

	else if (a >= 1e8) {
		return (this / 1e6).round(Math.max(0, p - 3)) + 'm';
	} else if (a >= 1e7) {
		return (this / 1e6).round(Math.max(0, p - 2)) + 'm';
	} else if (a >= 1e6) {
		return (this / 1e6).round(Math.max(0, p - 1)) + 'm';
	}

	else if (a >= 1e5) {
		return (this / 1e3).round(Math.max(0, p - 3)) + 'k';
	} else if (a >= 1e4) {
		return (this / 1e3).round(Math.max(0, p - 2)) + 'k';
	} else if (a >= 1e3) {
		return (this / 1e3).round(Math.max(0, p - 1)) + 'k';
	}

	else if (a >= 1e2) {
		return this.round(Math.max(0, p - 3));
	} else if (a >= 1e1) {
		return this.round(Math.max(0, p - 2));
	} else if (a >= 1) {
		return this.round(Math.max(0, p - 1));
	} else if (a === 0) {
		return this;
	}

	return this.toExponential(Math.max(0, p - 1));
};

Number.prototype.addCommas = function(digits) { // Add commas to a number, optionally converting to a Fixed point number
	var n = isNumber(digits) ? this.toFixed(digits) : this.toString(), rx = /^(.*\s)?(\d+)(\d{3}\b)/;
	return n === (n = n.replace(rx, '$1$2,$3')) ? n : arguments.callee.call(n);
};

Math.range = function(min, num, max) {
	return Math.max(min, Math.min(num, max));
};

Array.prototype.unique = function() { // Returns an array with only unique *values*, does not alter original array
	var o = {}, i, l = this.length, r = [];
	for (i = 0; i < l; i++) {
		o[this[i]] = this[i];
	}
	for (i in o) {
		r.push(o[i]);
	}
	return r;
};

Array.prototype.remove = function(value) { // Removes matching elements from an array, alters original
	var i = 0;
	while ((i = this.indexOf(value, i)) >= 0) {
		this.splice(i, 1);
	}
	return this;
};

Array.prototype.find = function(value) { // Returns if a value is found in an array
	return this.indexOf(value) >= 0;
};

Array.prototype.higher = function(value) { // return the lowest entry greater or equal to value, return -1 on failure
	var i = this.length, best = Number.POSITIVE_INFINITY;
	while (i--) {
		if (isNumber(this[i]) && this[i] >= value && this[i] < best) {
			best = this[i];
		}
	}
	return best === Number.POSITIVE_INFINITY ? -1 : best;
};

Array.prototype.lower = function(value) { // return the highest entry lower or equal to value, return -1 on failure
	var i = this.length, best = -1;
	while (i--) {
		if (isNumber(this[i]) && this[i] <= value && this[i] > best) {
			best = this[i];
		}
	}
	return best;
};

Array.prototype.trim = function() { // Remove empty entries
	var i = this.length, arr = [];
	while (i--) {
		if (this[i]) {
			arr.unshift(this[i]);
		}
	}
	return arr;
}

// Used for events in update(event, events)
var isEvent = function(event, worker, type, id) {
	if ((!worker || Worker.find(event.worker) === Worker.find(worker)) && (!type || event.type === type) && (!id || event.id === id)) {
		return true;
	}
	return false;
};
 
/**
 * Used for events in update(event, events)
 * This will leave the event on the events list for another search
 * @param {?string=} worker The worker name we're looking for
 * @param {?string=} type The event type we're looking for
 * @param {?string=} id The event id we're looking for
 * @return {?Object}
 */
Array.prototype.findEvent = function(worker, type, id) {
	if (worker || type || id) {
		this._worker = worker;
		this._type = type;
		this._id = id;
		this._index = -1;
	}
	var length = this.length;
	for (this._index++; this._index<length; this._index++) {
		if (isEvent(this[this._index], this._worker, this._type, this._id)) {
			return this[this._index];
		}
	}
	return null;
};

/**
 * Used for events in update(event, events)
 * This will remove the event from the events list
 * @param {?string=} worker The worker name we're looking for
 * @param {?string=} type The event type we're looking for
 * @param {?string=} id The event id we're looking for
 * @return {?Object}
 */
Array.prototype.getEvent = function(worker, type, id) {
	var event = this.findEvent(worker, type, id);
	if (this._index >= 0 && this._index < this.length) {
		this.splice(this._index--, 1);
	}
	return event;
};

//Array.prototype.inArray = function(value) {for (var i in this) if (this[i] === value) return true;return false;};

var makeTimer = function(sec) {
	var h = Math.floor(sec / 3600), m = Math.floor(sec / 60) % 60, s = Math.floor(sec % 60);
	return (h ? h+':'+(m>9 ? m : '0'+m) : m) + ':' + (s>9 ? s : '0'+s);
};

var Divisor = function(number) { // Find a "nice" value that goes into number up to 20 times
	var num = number, step = 1;
	if (num < 20) {
		return 1;
	}
	while (num > 100) {
		num /= 10;
		step *= 10;
	}
	num -= num % 5;
	if ((number / step) > 40) {
		step *= 5;
	} else if ((number / step) > 20) {
		step *= 2.5;
	}
	return step;
};

var length = function(obj) { // Find the number of entries in an object (also works on arrays)
	if (isArray(obj)) {
		return obj.length;
	} else if (isObject(obj)) {
		var l = 0, i;
		for(i in obj) {
			if (obj.hasOwnProperty(i)) {
				l++;
			}
		}
		return l;
	}
	return 0;
};

var empty = function(x) { // Tests whether an object is empty (also useable for other types)
	var i;
	if (x === undefined || !x) {
		return true;
	} else if (isObject(x)) {
		for (i in x) {
			if (x.hasOwnProperty(i)) {
				return false;
			}
		}
		return true;
	} else if (isArray(x)) {
		return x.length === 0;
	}
	return false;
};

var sum = function(a) { // Adds the values of all array entries together
	var i, t = 0, args = Array.prototype.slice.call(arguments);
	while ((a = args.shift())) {
		if (isArray(a)) {
			i = a.length;
			while(i--) {
				t += arguments.callee(a[i]);
			}
		} else if (isObject(a)) {
			for(i in a) {
				t += arguments.callee(a[i]);
			}
		} else if (isNumber(a)) {
			return a;
		} else if (isString(a) && a.search(/^[-+]?\d*\.?\d+(?:e[-+]?\d+)?$/i) >= 0) {
			return parseFloat(a);
		}
	}
	return t;
};

// Maximum numeric value in a tree of objects/arrays
var nmax = function(a) {
	var i, v = Number.NEGATIVE_INFINITY;
	if (arguments.length !== 1) {
		i = arguments.length;
		while (i--) {
			v = Math.max(v, arguments.callee(arguments[i]));
		}
	} else if (isArray(a)) {
		i = a.length;
		while (i--) {
			v = Math.max(v, arguments.callee(a[i]));
		}
	} else if (isObject(a)) {
		for(i in a) {
			v = Math.max(v, arguments.callee(a[i]));
		}
	} else if (isNumber(a)) {
		v = a;
	} else if (isString(a) && a.search(/^[-+]?\d*\.?\d+(?:e[-+]?\d+)?$/i) >= 0) {
		v = parseFloat(a);
	}
	return v;
};

// Minimum numeric value in a tree of objects/arrays
var nmin = function(a) {
	var i, v = Number.POSITIVE_INFINITY;
	if (arguments.length !== 1) {
		i = arguments.length;
		while (i--) {
			v = Math.min(v, arguments.callee(arguments[i]));
		}
	} else if (isArray(a)) {
		i = a.length;
		while (i--) {
			v = Math.min(v, arguments.callee(a[i]));
		}
	} else if (isObject(a)) {
		for(i in a) {
			v = Math.min(v, arguments.callee(a[i]));
		}
	} else if (isNumber(a)) {
		v = a;
	} else if (isString(a) && a.search(/^[-+]?\d*\.?\d+(?:e[-+]?\d+)?$/i) >= 0) {
		v = parseFloat(a);
	}
	return v;
};

/**
 * Compare two unknown variables, and return if they are functionally the same (ignoring order of object keys etc)
 * @param {*} left The left-hand variable
 * @param {*} right The right-hand variable
 * @return Boolean
 */
var compare = function(left, right) {
	var i;
	if (typeof left !== typeof right || isNull(left) !== isNull(right) || isObject(left) !== isObject(right)) {
		return false;
	}
	if (isObject(left)) {
		if (length(left) !== length(right)) {
			return false;
		}
		for (i in left) {
			if (left.hasOwnProperty(i)) {
				if (!right.hasOwnProperty(i) || !compare(left[i], right[i])) {
					return false;
				}
			}
		}
		for (i in right) {
			if (right.hasOwnProperty(i) && !left.hasOwnProperty(i)) {
				return false;
			}
		}
	} else if (isArray(left)) {
		i = left.length;
		if (i !== right.length) {
			return false;
		}
		while (i--) {
			if (!compare(left[i], right[i])) {
				return false;
			}
		}
	} else {
		return left === right;
	}
	return true;
};

var findInObject = function(obj, value, key) {
	var i;
	if (isObject(obj)) {
		if (isUndefined(key)) {
			for (i in obj) {
				if (obj[i] === value) {
					return i;
				}
			}
		} else {
			for (i in obj) {
				if (obj[i][key] === value) {
					return i;
				}
			}
		}
	}
	return null;
};

var objectIndex = function(obj, index) {
	var i;
	if (isObject(obj)) {
		for (i in obj) {
			if (index-- <= 0) {
				return i;
			}
		}
	}
	return null;
};

var getAttDefList = [];
var getAttDef = function(list, unitfunc, x, count, type, suffix) { // Find total att(ack) or def(ense) value from a list of objects (with .att and .def)
	var units = [], limit = 1e99, attack = 0, defend = 0, i, p, own, x2;
	if (type !== 'monster') {
		x2 = 'tot_' + x;
	}
	if (unitfunc) {
		for (i in list) {
			unitfunc(units, i, list);
		}
	} else {
		units = getAttDefList;
	}
	units.sort(function(a,b) {
		return (list[b][x2] || 0) - (list[a][x2] || 0)
			|| (list[a].upkeep || 0) - (list[b].upkeep || 0)
			|| (list[a].cost || 0) - (list[b].cost || 0);
	});
	if (!suffix) { suffix = ''; }
	// hack for limits of 3 on war equipment
	if (count < 0) {
		limit = 3;
		count = Math.abs(count);
	}
	for (i=0; i<units.length; i++) {
		p = list[units[i]];
		own = isNumber(p.own) ? p.own : 0;
		if (type) {
			Resources.set(['data', '_'+units[i], type+suffix+'_'+x], Math.min(count, limit) || undefined);
			if (Math.min(count, own) > 0) {
				//log(LOG_WARN, 'Utility','Using: '+Math.min(count, own)+' x '+units[i]+' = '+JSON.stringify(p));
				if (!p['use'+suffix]) {
					p['use'+suffix] = {};
				}
				p['use'+suffix][type+suffix+'_'+x] = Math.min(count, own, limit);
			} else if (length(p['use'+suffix])) {
				delete p['use'+suffix][type+suffix+'_'+x];
				if (!length(p['use'+suffix])) {
					delete p['use'+suffix];
				}
			}
		}
		//if (count <= 0) {break;}
		own = Math.min(count, own, limit);
		attack += own * ((p.att || 0) + ((p.stats && p.stats.att) || 0));
		defend += own * ((p.def || 0) + ((p.stats && p.stats.def) || 0));
		count -= own;
	}
	getAttDefList = units;
	return (x==='att'?attack:(0.7*attack)) + (x==='def'?defend:(0.7*defend));
};

var tr = function(list, html, attr) {
	list.push('<tr' + (attr ? ' ' + attr : '') + '>' + (html || '') + '</tr>');
};

var th = function(list, html, attr) {
	list.push('<th' + (attr ? ' ' + attr : '') + '>' + (html || '') + '</th>');
};

var td = function(list, html, attr) {
	list.push('<td' + (attr ? ' ' + attr : '') + '>' + (html || '') + '</td>');
};

var plural = function(i) {
	return (i === 1 ? '' : 's');
};

var makeTime = function(time, format) {
	var d = new Date(time);
	return d.format(format !== undefined && format ? format : 'l g:i a' );
};

// Simulates PHP's date function
Date.prototype.format = function(format) {
	var i, curChar, returnStr = '', replace = Date.replaceChars;
	for (i = 0; i < format.length; i++) {
		curChar = format.charAt(i);
		if (replace[curChar]) {
			returnStr += replace[curChar].call(this);
		} else {
			returnStr += curChar;
		}
	}
	return returnStr;
};

Date.replaceChars = {
	shortMonths: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
	longMonths: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
	shortDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
	longDays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
	// Day
	/** @this {Date} */	d: function() { return (this.getDate() < 10 ? '0' : '') + this.getDate(); },
	/** @this {Date} */	D: function() { return Date.replaceChars.shortDays[this.getDay()]; },
	/** @this {Date} */	j: function() { return this.getDate(); },
	/** @this {Date} */	l: function() { return Date.replaceChars.longDays[this.getDay()]; },
	/** @this {Date} */	N: function() { return this.getDay() + 1; },
	/** @this {Date} */	S: function() { return (this.getDate() % 10 === 1 && this.getDate() !== 11 ? 'st' : (this.getDate() % 10 === 2 && this.getDate() !== 12 ? 'nd' : (this.getDate() % 10 === 3 && this.getDate() !== 13 ? 'rd' : 'th'))); },
	/** @this {Date} */	w: function() { return this.getDay(); },
	/** @this {Date} */	z: function() { return "Not Yet Supported"; },
	/** @this {Date} */	R: function() {
		var i = (new Date() - this) / 1000;
		return (i < (24 * 60 * 60) ? 'Today' : i < (2 * 24 * 60 * 60) ? 'Yesterday' : i < (7 * 24 * 60 * 60) ? Math.floor(i / (24 * 60 * 60)) + ' Days Ago' : i < (31 * 24 * 60 * 60) ? Math.floor(i / (7 * 24 * 60 * 60)) + ' Weeks Ago' : i < (365 * 24 * 60 * 60) ? Math.floor(i / (31 * 24 * 60 * 60)) + ' Months Ago' : Math.floor(i / (365 * 24 * 60 * 60)) + ' Years Ago');
	},
	// Week
	/** @this {Date} */	W: function() { return "Not Yet Supported"; },
	// Month
	/** @this {Date} */	F: function() { return Date.replaceChars.longMonths[this.getMonth()]; },
	/** @this {Date} */	m: function() { return (this.getMonth() < 9 ? '0' : '') + (this.getMonth() + 1); },
	/** @this {Date} */	M: function() { return Date.replaceChars.shortMonths[this.getMonth()]; },
	/** @this {Date} */	n: function() { return this.getMonth() + 1; },
	/** @this {Date} */	t: function() { return "Not Yet Supported"; },
	// Year
	/** @this {Date} */	L: function() { return (((this.getFullYear()%4===0)&&(this.getFullYear()%100!==0)) || (this.getFullYear()%400===0)) ? '1' : '0'; },
	/** @this {Date} */	o: function() { return "Not Supported"; },
	/** @this {Date} */	Y: function() { return this.getFullYear(); },
	/** @this {Date} */	y: function() { return ('' + this.getFullYear()).substr(2); },
	// Time
	/** @this {Date} */	a: function() { return this.getHours() < 12 ? 'am' : 'pm'; },
	/** @this {Date} */	A: function() { return this.getHours() < 12 ? 'AM' : 'PM'; },
	/** @this {Date} */	B: function() { return "Not Yet Supported"; },
	/** @this {Date} */	g: function() { return this.getHours() % 12 || 12; },
	/** @this {Date} */	G: function() { return this.getHours(); },
	/** @this {Date} */	h: function() { return ((this.getHours() % 12 || 12) < 10 ? '0' : '') + (this.getHours() % 12 || 12); },
	/** @this {Date} */	H: function() { return (this.getHours() < 10 ? '0' : '') + this.getHours(); },
	/** @this {Date} */	i: function() { return (this.getMinutes() < 10 ? '0' : '') + this.getMinutes(); },
	/** @this {Date} */	s: function() { return (this.getSeconds() < 10 ? '0' : '') + this.getSeconds(); },
	/** @this {Date} */	u: function() { return (this.getMilliseconds() < 100 ? '0' : '') + (this.getMilliseconds() < 10 ? '0' : '') + this.getMilliseconds(); },
	// Timezone
	/** @this {Date} */	e: function() { return "Not Yet Supported"; },
	/** @this {Date} */	I: function() { return "Not Supported"; },
	/** @this {Date} */	O: function() { return (-this.getTimezoneOffset() < 0 ? '-' : '+') + (Math.abs(this.getTimezoneOffset() / 60) < 10 ? '0' : '') + (Math.abs(this.getTimezoneOffset() / 60)) + '00'; },
	/** @this {Date} */	P: function() { return (-this.getTimezoneOffset() < 0 ? '-' : '+') + (Math.abs(this.getTimezoneOffset() / 60) < 10 ? '0' : '') + (Math.abs(this.getTimezoneOffset() / 60)) + ':' + (Math.abs(this.getTimezoneOffset() % 60) < 10 ? '0' : '') + (Math.abs(this.getTimezoneOffset() % 60)); },
	/** @this {Date} */	T: function() { var m = this.getMonth(), result; this.setMonth(0); result = this.toTimeString().replace(/^.+ \(?([^\)]+)\)?$/, '$1'); this.setMonth(m); return result;},
	/** @this {Date} */	Z: function() { return -this.getTimezoneOffset() * 60; },
	// Full Date/Time
	/** @this {Date} */	c: function() { return this.format("Y-m-d") + "T" + this.format("H:i:sP"); },
	/** @this {Date} */	r: function() { return this.toString(); },
	/** @this {Date} */	U: function() { return this.getTime() / 1000; }
};

var calc_rolling_weighted_average = function(object, y_label, y_val, x_label, x_val, limit) {
	var name, label_list, y_label_list, x_label_list;
	name = y_label + '_per_' + x_label;
	object.rwa = object.rwa || {};
	label_list = object.rwa[name] = object.rwa[name] || {};
	y_label_list = label_list[y_label] = label_list[y_label] || [];
	x_label_list = label_list[x_label] = label_list[x_label] || [];
	y_label_list.unshift(y_val);
	x_label_list.unshift(x_val);
	while (y_label_list.length > (limit || 100)) {
		y_label_list.pop();
	}
	while (x_label_list.length > (limit || 100)) {
		x_label_list.pop();
	}
	object['avg_' + name] = sum(y_label_list) / sum(x_label_list);
};

var bestObjValue = function(obj, callback, filter) {// pass an object and a function to create a value from obj[key] - return the best key
	var i, best = null, bestval, val;
	for (i in obj) {
		if (isFunction(filter) && !filter(obj[i])) {
			continue;
		}
		val = callback(obj[i]);
		if (isNumber(val) && (!best || val > bestval)) {
			bestval = val;
			best = i;
		}
	}
	return best;
};

JSON.shallow = function(obj, depth, replacer, space) {
	return JSON.stringify((function(o,d) {
		var i, out;
		if (o && typeof o === 'object') {
			if (isNumber(o.length) && !o.propertyIsEnumerable('length')) {
				if (d > 0) {
					out = [];
					for (i=0; i<o.length; i++) {
						out[i] = arguments.callee(o[i],d-1);
					}
				} else {
					out = '[object Array]';
				}
			} else {
				if (isWorker(o) || isScript(o)) {
					out = o.toString();
				} else if (d > 0) {
					out = {};
					for (i in o) {
						out[i] = arguments.callee(o[i],d-1);
					}
				} else {
					out = '[object Object]';
				}
			}
		} else {
			//out = o === undefined ? 'undefined' : o === null ? 'null' : o.toString();
			out = o;
		}
		return out;
	}(obj, depth || 1)), replacer, space);
};

JSON.encode = function(obj, replacer, space, metrics) {
	var i, keys = {}, count = {}, next = 0, nextKey = null, first = true, getKey = function() {
		var key, digits = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', length = digits.length;
		do {
			key = nextKey;
			nextKey = (next >= length ? digits[(Math.floor(next / length) - 1) % length] : '') + digits[next % length];
			next++;
		} while (count[nextKey]); // First time we're called we ignore "key", but already have count[] filled
		first = false;
		return key;
	}, check = function(obj) { // Count how many of each key - to decide if we replace them
		var i;
		if (isObject(obj)) {
			for (i in obj) {
				count[i] = (count[i] || 0) + 1;
				arguments.callee(obj[i]);
			}
		} else if (isArray(obj)) {
			for (i=0; i<obj.length; i++) {
				arguments.callee(obj[i]);
			}
		}
	}, encode = function(obj) { // Replace keys where the saved length is more than the used length
		var i, len, to;
		if (isObject(obj)) {
			to = {};
			for (i in obj) {
				len = i.length;
				if ((count[i] * len) > (((count[i] + 1) * nextKey.length) + len + (first ? 12 : 6))) { // total (length of key) > total (length of encoded key) + length of key translation
					if (!keys[i]) {
						keys[i] = getKey();
					}
					to[keys[i]] = arguments.callee(obj[i]);
				} else {
					to[i] = arguments.callee(obj[i]);
				}
			}
		} else if (isArray(obj)) {
			to = [];
			for (i=0; i<obj.length; i++) {
				to[i] = arguments.callee(obj[i]);
			}
		} else {
			to = obj;
		}
		return to;
	};
	if (isObject(obj) || isArray(obj)) {
		if (obj['$']) {
			log(LOG_ERROR, 'Trying to encode an object that already contains a "$" key!!!');
		}
		check(obj);
		getKey(); // Load up the first key, prevent key conflicts
		first = true; // For the "Should I?" check
		obj = encode(obj);
		if (!empty(keys)) {
			obj['$'] = {};
			for (i in keys) {
				obj['$'][keys[i]] = i;
			}
			if (isObject(metrics)) {
				metrics.oh = 6; // 7, -1 for first comma miscount
				metrics.mod = 0;
				metrics.num = length(keys);
				for (i in keys) {
					metrics.oh += i.length + keys[i].length + 6;
					metrics.mod += (keys[i].length - i.length) * count[i];
				}
			}
		}
	}
	return JSON.stringify(obj, replacer, space);
};

JSON.decode = function(str, metrics) {
	var obj = JSON.parse(str), keys = obj['$'], count = {}, decode = function(obj) {
		var i, to;
		if (isObject(obj)) {
			to = {};
			for (i in obj) {
				if (keys[i]) {
					to[keys[i].valueOf()] = arguments.callee(obj[i]);
					count[i] = (count[i] || 0) + 1;
				} else {
					to[i] = arguments.callee(obj[i]);
				}
			}
		} else if (isArray(obj)) {
			to = [];
			for (i=0; i<obj.length; i++) {
				to[i] = arguments.callee(obj[i]);
			}
		} else {
			to = obj;
		}
		return to;
	};
	if (keys) {
		delete obj['$'];
		obj = decode(obj);
		if (isObject(metrics) && !empty(keys)) {
			metrics.oh = 6; // 7, -1 for first comma miscount
			metrics.mod = 0;
			metrics.num = length(keys);
			for (i in keys) {
				metrics.oh += i.length + keys[i].length + 6;
				metrics.mod += (keys[i].length - i.length) * count[i];
			}
		}
	}
	return obj;
};

// Images - either on SVN, or via extension location

var getImage = function(name) {
	if (browser === 'chrome' && chrome && chrome.extension && chrome.extension.getURL) {
		return chrome.extension.getURL('images/'+name+'.png');
	}
	return 'http://game-golem.googlecode.com/svn/trunk/images/'+name+'.png';
};

var assert = function(test, msg, type) {
	if (!test) {
		throw {'name':type || 'Assert Error', 'message':msg};
	}
};

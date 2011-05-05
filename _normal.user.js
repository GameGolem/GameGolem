// ==UserScript==
// @name		Rycochet's Castle Age Golem
// @namespace	golem
// @description	Auto player for Castle Age on Facebook. If there's anything you'd like it to do, just ask...
// @license		GNU Lesser General Public License; http://www.gnu.org/licenses/lgpl.html
// @version		31.5.1097
// @include		http://apps.facebook.com/castle_age/*
// @include		https://apps.facebook.com/castle_age/*
// @require		http://cloutman.com/jquery-1.4.2.min.js
// @require		http://cloutman.com/jquery-ui-latest.min.js
// @resource	stylesheet http://game-golem.googlecode.com/svn/trunk/golem.css
// ==/UserScript==
// @disabled-require		http://cloutman.com/jquery-latest.min.js
// @disabled-include		http://apps.facebook.com/reqs.php
// @disabled-include		https://apps.facebook.com/reqs.php
// 
// For the source code please check the sourse repository
// - http://code.google.com/p/game-golem/
// 
// For the unshrunk Work In Progress version (which may introduce new bugs)
// - http://game-golem.googlecode.com/svn/trunk/_normal.user.js
(function($){var jQuery = $;// Top wrapper
/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
// Global variables only
// Shouldn't touch
var isRelease = false;
var script_started = Date.now();
// Version of the script
var version = "31.5";
var revision = 1097;
// Automatically filled from Worker:Main
var userID, imagepath, APP, APPID, APPNAME, PREFIX; // All set from Worker:Main
// Detect browser - this is rough detection, mainly for updates - may use jQuery detection at a later point
var browser = 'unknown';
if (navigator.userAgent.indexOf('Chrome') >= 0) {
	browser = 'chrome';
} else if (navigator.userAgent.indexOf('Safari') >= 0) {
	browser = 'safari';
} else if (navigator.userAgent.indexOf('Opera') >= 0) {
	browser = 'opera';
} else if (navigator.userAgent.indexOf('Mozilla') >= 0) {
	browser = 'firefox';
	if (typeof GM_log === 'function') {
		browser = 'greasemonkey'; // Treating separately as Firefox will get a "real" extension at some point.
	}
}
/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	browser, window, localStorage, console, chrome
	$, Worker, Army, Config, Dashboard, History, Page, Queue, Resources,
	Battle, Generals, LevelUp, Player,
	version, revision, isRelease
	GM_setValue, GM_getValue, APP, APPID, PREFIX, log:true, debug, userID, imagepath
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
	return obj && obj.constructor === Boolean;
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
 * Check if a passed object is a Worker
 * @param {*} obj The object we wish to check
 * @return {boolean} If it is or not
 */
var isWorker = function(obj) {
	return obj && obj.constructor === Worker;
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
var log = function(level, txt /*, obj, array etc*/){
	var level, args = Array.prototype.slice.call(arguments), prefix = [],
		date = [true, true, true, true, true],
		rev = [false, false, true, true, true],
		worker = [false, true, true, true, true];
	if (isNumber(args[0])) {
		level = Math.range(0, args.shift(), 4);
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
		console.log.apply(console, args);
	} catch(e) { // FF4 fix
		console.log(args);
	}
};

/**
 * Store data in localStorage
 * @param {string} n Name of the item to be stored (normally worker.type)
 * @param {string} v Value to be stored
 */
var setItem = function(n, v) {
	localStorage.setItem('golem.' + APP + '.' + n, v);
};

/**
 * Retreive data from localStorage
 * @param {string} n Name of the item to be stored (normally worker.type)
 * @return {string} Value to be retreived
 */
var getItem = function(n) {
	return localStorage.getItem('golem.' + APP + '.' + n);
};

/**
 * In Firefox / GreaseMonkey we currently use the GM storage area rather than localStorage...
 */
if (browser === 'greasemonkey') {
	setItem = GM_setValue;
	getItem = GM_getValue;
}

// Prototypes to ease functionality

String.prototype.trim = function() {
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

// Used for events in update(event, events)
var isEvent = function(event, worker, type, id) {
	if ((!worker || Worker.find(event.worker) === Worker.find(worker)) && (!type || event.type === type) && (!id || event.id === id)) {
		return true;
	}
	return false;
};
 
// Used for events in update(event, events)
Array.prototype.findEvent = function(worker, type, id, start) {
	var i = start || 0, l = this.length;
	for (; i<l; i++) {
		if (isEvent(this[i], worker, type, id)) {
			return i;
		}
	}
	return -1;
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
	var i, t = 0;
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

var compare = function(left, right) {
	var i;
	if (typeof left !== typeof right) {
		return false;
	}
	if (typeof left === 'object') {
		if (length(left) !== length(right)) {
			return false;
		}
		if (isArray(left)) {
			i = left.length;
			while (i--) {
				if (!compare(left[i], right[i])) {
					return false;
				}
			}
		} else {
			for (i in left) {
				if (left.hasOwnProperty(i)) {
					if (!right.hasOwnProperty(i)) {
						return false;
					} else if (!compare(left[i], right[i])) {
						return false;
					}
				}
			}
			for (i in right) {
				if (right.hasOwnProperty(i) && !left.hasOwnProperty(i)) {
					return false;
				}
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
	d: function() { return (this.getDate() < 10 ? '0' : '') + this.getDate(); },
	D: function() { return Date.replaceChars.shortDays[this.getDay()]; },
	j: function() { return this.getDate(); },
	l: function() { return Date.replaceChars.longDays[this.getDay()]; },
	N: function() { return this.getDay() + 1; },
	S: function() { return (this.getDate() % 10 === 1 && this.getDate() !== 11 ? 'st' : (this.getDate() % 10 === 2 && this.getDate() !== 12 ? 'nd' : (this.getDate() % 10 === 3 && this.getDate() !== 13 ? 'rd' : 'th'))); },
	w: function() { return this.getDay(); },
	z: function() { return "Not Yet Supported"; },
	// Week
	W: function() { return "Not Yet Supported"; },
	// Month
	F: function() { return Date.replaceChars.longMonths[this.getMonth()]; },
	m: function() { return (this.getMonth() < 9 ? '0' : '') + (this.getMonth() + 1); },
	M: function() { return Date.replaceChars.shortMonths[this.getMonth()]; },
	n: function() { return this.getMonth() + 1; },
	t: function() { return "Not Yet Supported"; },
	// Year
	L: function() { return (((this.getFullYear()%4===0)&&(this.getFullYear()%100!==0)) || (this.getFullYear()%400===0)) ? '1' : '0'; },
	o: function() { return "Not Supported"; },
	Y: function() { return this.getFullYear(); },
	y: function() { return ('' + this.getFullYear()).substr(2); },
	// Time
	a: function() { return this.getHours() < 12 ? 'am' : 'pm'; },
	A: function() { return this.getHours() < 12 ? 'AM' : 'PM'; },
	B: function() { return "Not Yet Supported"; },
	g: function() { return this.getHours() % 12 || 12; },
	G: function() { return this.getHours(); },
	h: function() { return ((this.getHours() % 12 || 12) < 10 ? '0' : '') + (this.getHours() % 12 || 12); },
	H: function() { return (this.getHours() < 10 ? '0' : '') + this.getHours(); },
	i: function() { return (this.getMinutes() < 10 ? '0' : '') + this.getMinutes(); },
	s: function() { return (this.getSeconds() < 10 ? '0' : '') + this.getSeconds(); },
	// Timezone
	e: function() { return "Not Yet Supported"; },
	I: function() { return "Not Supported"; },
	O: function() { return (-this.getTimezoneOffset() < 0 ? '-' : '+') + (Math.abs(this.getTimezoneOffset() / 60) < 10 ? '0' : '') + (Math.abs(this.getTimezoneOffset() / 60)) + '00'; },
	P: function() { return (-this.getTimezoneOffset() < 0 ? '-' : '+') + (Math.abs(this.getTimezoneOffset() / 60) < 10 ? '0' : '') + (Math.abs(this.getTimezoneOffset() / 60)) + ':' + (Math.abs(this.getTimezoneOffset() % 60) < 10 ? '0' : '') + (Math.abs(this.getTimezoneOffset() % 60)); },
	T: function() { var m = this.getMonth(), result; this.setMonth(0); result = this.toTimeString().replace(/^.+ \(?([^\)]+)\)?$/, '$1'); this.setMonth(m); return result;},
	Z: function() { return -this.getTimezoneOffset() * 60; },
	// Full Date/Time
	c: function() { return this.format("Y-m-d") + "T" + this.format("H:i:sP"); },
	r: function() { return this.toString(); },
	U: function() { return this.getTime() / 1000; }
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
				if (isWorker(o)) {
					out = '[worker ' + o.name + ']';
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
					to[keys[i]] = arguments.callee(obj[i]);
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

var makeImage = function(name, title) {
	return '<img class="golem-image" title="' + (title || name.ucfirst()) + '" src="' + getImage(name) + '">';
};

var assert = function(test, msg, type) {
	if (!test) {
		throw {'name':type || 'Assert Error', 'message':msg};
	}
};
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

._remind(secs,id)		- Calls this._update({worker:this, type:'reminder', self:true, id:(id || null)}) after a specified delay. Replaces old 'id' if passed (so only one _remind() per id active)
._revive(secs,id)		- Calls this._update({worker:this, type:'reminder', self:true, id:(id || null)}) regularly. Replaces old 'id' if passed (so only one _revive() per id active)
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
Worker.prototype._add = function(what, value, type) {
	if (type && ((isFunction(type) && !type(value)) || (isString(type) && typeof value !== type))) {
//		log(LOG_DEBUG, 'Bad type in ' + this.name + '.setAdd('+JSON.shallow(arguments,2)+'): Seen ' + (typeof data));
		return false;
	}
	if (isUndefined(value)) {
		this._set(what);
	} else if (isBoolean(value)) {
		this._set(what, function(old){
			value = old ? false : true;
			return old ? undefined : true;
		});
	} else if (isNumber(value)) {
		this._set(what, function(old){
			return (isNumber(old) ? old : 0) + value;
		});
	} else if (isString(value)) {
		this._set(what, function(old){
			return (isString(old) ? old : '') + value;
		});
	} else if (isArray(value)) {
		this._set(what, function(old){
			return (isArray(old) ? old : []).concat(value);
		});
	} else if (isObject(value)) {
		this._set(what, function(old){
			return $.extend({}, isObject(old) ? old : {}, value);
		});
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
		log(LOG_ERROR, e.name + ' in ' + this.name + '.get('+JSON.shallow(arguments,2)+'): ' + e.message);
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
			log(LOG_ERROR, e.name + ' in ' + this.name + '.init(): ' + e.message);
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
	var i, n, metrics = {};
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
	n = (this._rootpath ? userID + '.' : '') + type + '.' + this.name;
	i = getItem(n);
	if (isString(i)) { // JSON encoded string
		try {
			this._storage[type] = (n.length + i.length) * 2; // x2 for unicode
			i = JSON.decode(i, metrics);
			this._rawsize[type] = this._storage[type] + ((metrics.mod || 0) - (metrics.oh || 0)) * 2; // x2 for unicode
			this._numvars[type] = metrics.num || 0;
		} catch(e) {
			log(LOG_ERROR, this.name + '._load(' + type + '): Not JSON data, should only appear once for each type...');
		}
		if (merge && !compare(i, this[type])) {
			this[type] = $.extend(true, {}, this[type], i);
		} else {
			this[type] = i;
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
	try {
		this._unflush();
		result = this.parse && this.parse(change);
	}catch(e) {
		log(LOG_ERROR, e.name + ' in ' + this.name + '.parse(' + change + '): ' + e.message);
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
Worker.prototype._pop = function(what, def, type) {
	var data;
	this._set(what, function(old){
		old = isArray(old) ? old.slice(0) : [];
		data = old.pop();
		return old;
	});
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
Worker.prototype._push = function(what, value, type) {
	if (type && ((isFunction(type) && !type(value)) || (isString(type) && typeof value !== type))) {
//		log(LOG_WARN, 'Bad type in ' + this.name + '.push('+JSON.shallow(arguments,2)+'): Seen ' + (typeof data));
		return false;
	}
	this._set(what, isUndefined(value) ? undefined : function(old){
		old = isArray(old) ? old : [];
		old.push(value);
		return old;
	});
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
		fn = function(){Workers[name]._update({type:'reminder', self:true, id:(id || null)}, 'run');};
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
		fn = function(){callback.apply(Workers[name]);};
	} else if (isObject(callback)) {
		fn = function(){Workers[name]._update(callback, 'run');};
	} else {
		fn = function(){Workers[name]._update({type:'reminder', self:true, id:(id || null)}, 'run');};
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
			log(LOG_ERROR, e.name + ' in ' + this.name + '.save(' + type + '): ' + e.message);
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
				log(LOG_ERROR, e2.name + ' in ' + this.name + '.save(' + type + '): Saving: ' + e2.message);
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
 * @return {*} The value we passed in
 */
Worker.prototype._set = function(what, value, type) {
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
					this._notify(path);// Notify the watchers...
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
		log(LOG_ERROR, e.name + ' in ' + this.name + '.set('+JSON.stringify(arguments,2)+'): ' + e.message);
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
			this._load(i, true); // Merge with default data, first time only
			if (!this[i]) {
				delete this._datatypes[i];
				delete this[i]; // Make sure it's undefined and not null
			}
		}
		if (this.setup) {
			try {
				this.setup(old_revision);
			}catch(e) {
				log(LOG_ERROR, e.name + ' in ' + this.name + '.setup(): ' + e.message);
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
Worker.prototype._shift = function(what, def, type) {
	var data;
	this._set(what, function(old){
		old = isArray(old) ? old.slice(0) : [];
		data = old.shift();
		return old;
	});
	if (!isUndefined(data) && (!type || (isFunction(type) && type(data)) || (isString(type) && typeof data === type))) {
		return isNull(data) ? null : data.valueOf();
	}
	return def;
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
					t[i][0]._update({worker:t[i][0], self:true, type:'trigger', id:t[i][2], selector:t[i][1]});
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
Worker.prototype._unshift = function(what, value, type) {
	if (type && ((isFunction(type) && !type(value)) || (isString(type) && typeof value !== type))) {
//		log(LOG_DEBUG, 'Bad type in ' + this.name + '.unshift('+JSON.shallow(arguments,2)+'): Seen ' + (typeof data));
		return false;
	}
	this._set(what, isUndefined(value) ? undefined : function(old){
		old = isArray(old) ? old : [];
		old.unshift(value);
		return old;
	});
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
 * If event.type === save then we're a triggered save, no other work needed
 * Make sure the event passed is "clean", and that event.worker is a worker instead of a string
 * If .update() returns true then delete all pending _datatype update events
 * @param {(object|string)} event The event that we will copy and pass on to .update(). If it is a string then parse out to event.type
 * @param {string=} type The type of update - key is event.worker+event.type. "add" (default) then will add to the update queue, "delete" will deleting matching keys, "purge" will purge the queue completely (use with care), "run" will run through the queue and act on every one
 */
Worker.prototype._update = function(event, type) {
	if (this._loaded) {
		this._pushStack();
		var i, done = false, events;
		if (event) {
			if (isString(event)) {
				event = {type:event};
			} else if (!isObject(event)) {
				event = {};
			}
			if (event.type && (isFunction(this.update) || isFunction(this['update_'+event.type]))) {
				event.worker = isWorker(event.worker) ? event.worker.name : event.worker || this.name;
				if (type !== 'purge' && (i = this._updates_.findEvent(event.worker, event.type, event.id)) >= 0) { // Delete from update queue
					this._updates_.splice(i,1);
				}
				if (type !== 'add' && type !== 'delete') { // Add to update queue, old key already deleted
					this._updates_.unshift($.extend({}, event));
				}
				if (type === 'purge') { // Purge the update queue immediately - don't do anything with the entries
					this._updates_ = [];
				}
				if (this._updates_.length) {
					Worker.updates[this.name] = true;
				} else {
					delete Worker.updates[this.name];
				}
			}
		}
		if (type === 'run' && Worker.updates[this.name]) { // Go through the event list and process each one
			this._unflush();
			events = this._updates_;
			this._updates_ = [];
			while (events.length && done !== true) {
				try {
					events[0].worker = Worker.find(events[0].worker || this);
					if (isFunction(this['update_'+events[0].type])) {
						done = this['update_'+events[0].type](events[0], events);
					} else {
						done = this.update(events[0], events);
					}
				}catch(e) {
					log(LOG_ERROR, e.name + ' in ' + this.name + '.update(' + JSON.shallow(events[0]) + '): ' + e.message);
				}
				events.shift();
			}
			this._updates_ = []; // Make sure we don't directly update ourselves
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
		log(LOG_ERROR, e.name + ' in ' + this.name + '.work(' + state + '): ' + e.message);
	}
	this._popStack();
	return result;
};

/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army:true, Dashboard, History, Page, Queue, Resources,
	Battle, Generals, LevelUp, Player,
	APP, APPID, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, Divisor, length, sum, findInObject, objectIndex, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
	makeImage
*/
/********** Worker.Army **********
* Stores data by facebook userid for any worker that wants to use it.
* Data is stored as -
* Army.data.uid.section[...] = value
* section == '_info' for general use of any workers with data useful for many
* section == '_last' is the last time the data was accessed (not including making a list)
*/
var Army = new Worker('Army');
Army.data = {};

Army.settings = {
	system:true,
	taint:true
};

Army.option = {
	forget:14// Number of days to remember any userid
};

Army.runtime = {
	update:{},// WorkerName:true, cleared in Army.update() as we poll each in turn
	// Dashboard defaults:
	sort:0,rev:false,show:'Name',info:'uid'
};
/*
Army.display = [
	{
		id:'forget',
		label:'Forget after',
		select:[1,2,3,4,5,6,7,14,21,28],
		after:'days',
		help:'This will delete any userID that\'s not been seen for a length of time'
	}
];
*/
Army.update = function(event) {
	if (event.self && event.type === 'data' && this.runtime.update) {
		for (var i in this.runtime.update) {
			Workers[i]._update({worker:this, type:'data'});
			delete this.runtime.update[i];
		}
	}
};

Army.init = function() {
	$('#content').append('<div id="golem-army-tooltip" class="golem-tooltip golem-shadow"><a>&nbsp;x&nbsp;</a><p></p></div>');
	$('#golem-army-tooltip > a').click(function(){$('#golem-army-tooltip').hide();});
	$('#golem-army-tooltip a[href*="keep.php"]').live('click', function(){
		Page.to('keep_stats', $(this).attr('href').substr($(this).attr('href').indexOf('?')));
		return false;
	});
	this.data = this.data || {};
	for (var i in this.data) {// Fix for accidentally added bad data in a previous version
		if (typeof i === 'string' && i.regex(/\D/g)) {
			delete this.data[i];
		}
	}
	delete this.data[userID];// Make sure we never try to handle ourselves
};

// what = ['worker', userID, key ...]
Army.set = function(what, value) {
	var x = typeof what === 'string' ? what.split('.') : (typeof what === 'object' ? what : []), section = null, uid = null;
	if (!(x[0] in this._datatypes)) {
		// Section first - either string id, worker.name, or current_worker.name
		if (isWorker(x[0])) {
			section = x.shift().name;
		} else if (typeof x[0] === 'string' && !parseInt(x[0])) {
			section = x.shift();
		} else {
			section = Worker.stack[0];
		}
		// userID next
		if (x.length && parseInt(x[0])) {
			uid = x.shift();
		}
		if (!section || !uid || parseInt(uid) === userID) { // Must have both section name and userID to continue, userID *cannot* be our own facebook id
			return;
		}
		if (section in Workers) {
			this.runtime.update[section] = true;
		}
		x.unshift('data', uid, section);
	}
// Removed for performance reasons...
//	try{this.data[uid]._last = Date.now();}catch(e){} // Remember when it was last accessed
	return this._set(x, value);
};

// what = [] (for list of uids that this worker knows about), ['section', userID, key ...]
Army.get = function(what, def) {
	var i, x = isString(what) ? what.split('.') : (isArray(what) ? what : []), section = null, uid = null, list = [];
	if (!(x[0] in this._datatypes)) {
		// Section first - either string id, worker.name, or current_worker.name
		if (isWorker(x[0])) {
			section = x.shift().name;
		} else if (typeof x[0] === 'string' && !parseInt(x[0])) {
			section = x.shift();
		} else {
			section = Worker.stack[0];
		}
		// No userid, so return a list of userid's used by this section
		if (section && !x.length) {
			this._unflush();
			for (i in this.data) {
				if (isObject(this.data[i]) && section in this.data[i]) {
					list.push(i);
				}
			}
			return list;
		}
		// userID next
		if (x.length && parseInt(x[0])) {
			uid = x.shift();
		}
		if (!section || !uid) { // Must have both section name and userID to continue, userID *cannot* be our own facebook id
			return;
		}
//		log('this._get(\'data.' + uid + '.' + section + (x.length ? '.' + x.join('.') : '') + ', ' + value + ')');
		x.unshift('data', uid, section);
	}
// Removed for performance reasons...
	return this._get(x, def);
};

Army.infolist = {
	'UserID':'uid',
	'Level':'level',
	'Army Size':'army_size'
};
Army.sectionlist = {
	'Name':{ // First column = Name
		'key':'_info',
		'name':'Name',
		'label':function(data,uid){
			return (data[uid]._info.name || '').html_escape();
		},
		'sort':function(data,uid){
			return data[uid]._info.name || null;
		},
		'tooltip':function(data,uid){
			var space = '&nbsp;&nbsp;&nbsp;', $tooltip;
			$tooltip = $(Page.makeLink('keep.php', 'user=' + uid, 'Visit Keep') + '<hr><b>userID: </b>' + uid + '<br><hr><b>Raw Data:</b><pre>' + JSON.stringify(data[uid], null, '   ') + '</pre><br>');
			return $tooltip;
		}
	},
	'Info':{ // Second column = Info
		'key':'_info',
		'name':function(){return 'Info (' + (findInObject(Army.infolist, Army.runtime.info) || '') + ')';},
		'show':'Info',
		'label':function(data,uid){
			return Army.runtime.info === 'uid' ? uid : data[uid]._info[Army.runtime.info] || '';
		},
		'sort':function(data,uid){
			return Army.runtime.info === 'uid' ? uid : data[uid]._info[Army.runtime.info] || null;
		}
	}
};
Army.section = function(name, object) { // Safe to call in setup()
	// Add a section to the dashboard.
	// callback = function(type, data), returns text or html string
	// type = 'id', 'sort', 'tooltip'
	this.sectionlist[name] = object;
};
Army.getSection = function(show, key, uid) {
	try {
		if (isNumber(show)) {
			show = objectIndex(this.sectionlist, show);
		}
		switch(typeof this.sectionlist[show][key]) {
			case 'string':
				return this.sectionlist[show][key];
			case 'function':
				return this.sectionlist[show][key](this.data, uid);
			default:
				return '';
		}
	} catch(e){}// *Really* don't want to do anything in the catch as it's performance sensitive!
	return '';
};

Army.order = [];
Army.dashboard = function(sort, rev) {
	var i, j, k, label, show = this.runtime.show, info = this.runtime.info, list = [], output = [], showsection = [], showinfo = [];
	if ($('#golem-army-show').length) {
		show = $('#golem-army-show').attr('value');
	}
	if ($('#golem-army-info').length) {
		info = $('#golem-army-info').attr('value');
	}
	if (typeof sort === 'undefined' || this.runtime.show !== show || this.runtime.info !== info) {
		this.runtime.show = show;
		this.runtime.info = info;
		this.order = [];
		k = this.getSection(show, 'key');
		for (i in this.data) {
			try {
				label = this.getSection(show, 'sort', i);
				if (label) {
					this.order.push(i);
				}
			} catch(e){}
		}
	}
	for (i in this.sectionlist) {
		th(output, this.getSection(i, 'name'));
		k = this.getSection(i, 'show');
		if (k && k!== '') {
			showsection.push('<option value="' + i + '"' + (i === show ? ' selected' : '') + '>' + k + '</option>');
		}
	}
	for (i in this.infolist) {
		showinfo.push('<option value="' + (this.infolist[i] || '') + '"' + (this.infolist[i] === info ? ' selected' : '') + '>' + i + '</option>');
	}
	list.push('Limit entries to <select id="golem-army-show">' + showsection.join('') + '</select> ... Info: <select id="golem-army-info">' + showinfo.join('') + '</select>');
	if (sort !== this.runtime.sort || rev !== this.runtime.rev) {
		this.runtime.sort = sort = typeof sort !== 'undefined' ? sort : (this.runtime.sort || 0);
		this.runtime.rev = rev = typeof rev !== 'undefined' ? rev : (this.runtime.rev || false);
		this.order.sort(function(a,b) {
			var aa = 0, bb = 0;
			try {
				aa = Army.getSection(sort, 'sort', a);
			} catch(e1){}
			try {
				bb = Army.getSection(sort, 'sort', b);
			} catch(e2){}
			if (typeof aa === 'string' || typeof bb === 'string') {
				return (rev ? (''+bb).localeCompare(aa) : (''+aa).localeCompare(bb));
			}
			return (rev ? (aa || 0) - (bb || 0) : (bb || 0) - (aa || 0));
		});
	}
	list.push('<table cellspacing="0" style="width:100%"><thead><tr>' + output.join('') + '</tr></thead><tbody>');
	for (j=0; j<this.order.length; j++) {
		output = [];
		for (i in this.sectionlist) {
			try {
//				if (typeof this.data[this.order[j]][this.getSection(i,'key')] !== 'undefined') {
				k = this.getSection(i,'label', this.order[j]);
				if (typeof k !== 'undefined' && k !== null && k !== '') {
					if (this.sectionlist[i]['tooltip'] || this.sectionlist[i]['click']) {
						td(output, '<a>' + k + '</a>');
					} else {
						td(output, k);
					}
				} else {
					td(output, '');
				}
			} catch(e3) {
				log(LOG_WARN, e3.name + ' in Army.dashboard(): ' + i + '("label"): ' + e3.message);
				td(output, '');
			}
		}
		tr(list, output.join(''));//, 'style="height:25px;"');
	}
	list.push('</tbody></table>');
	$('#golem-dashboard-Army').html(list.join(''));
	$('#golem-dashboard-Army td:first-child,#golem-dashboard-Army th:first-child').css('text-align', 'left');
	$('#golem-dashboard-Army select').change(function(e){Army._unflush();Army.dashboard();});// Force a redraw
	$('#golem-dashboard-Army thead th:eq('+sort+')').attr('name',(rev ? 'reverse' : 'sort')).append('&nbsp;' + (rev ? '&uarr;' : '&darr;'));
	$('#golem-dashboard-Army td a').click(function(e){
		e.stopPropagation();
		var $this, section, uid, tooltip;
		$this = $(this.wrappedJSObject || this);
		try {
			section = objectIndex(Army.sectionlist, $this.closest('td').index());
			uid = Army.order[$this.closest('tr').index()];
			Army._unflush();
			if ('click' in Army.sectionlist[section]) {
				if (Army.getSection(section, 'click', uid)) {
					$this.html('<a>' + Army.getSection(section, 'label', uid) + '</a>');
//					Army.dashboard(Army.runtime.show, Army.runtime.rev);
				}
			} else {
				tooltip = Army.getSection(section, 'tooltip', uid);
				if (tooltip && tooltip !== '') {
					$('#golem-army-tooltip > p').html(tooltip);
					$('#golem-army-tooltip').css({
						top:($this.offset().top + $this.height()),
						left:$this.closest('td').offset().left
					}).show();
				}
			}
		} catch(e4) {
			log(LOG_WARN, e4.name + ' in Army.dashboard(): ' + Army.getSection($this.closest('td').index(),'name') + '(data,"tooltip"): ' + e4.message);
		}
		return false;
	});
};

/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page, Queue, Resources, Coding:true,
	Battle, Generals, LevelUp, Player,
	APP, APPID, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH, APPNAME,
	makeTimer, Divisor, length, sum, findInObject, objectIndex, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime, makeImage,
	GM_listValues, GM_deleteValue, localStorage
*/
/********** Worker.Coding **********
* Just some coding nifo about current workers - nothing special
*/
var Coding = new Worker('Coding');
Coding.data = Coding.option = Coding.runtime = Coding.temp = null;

Coding.settings = {
	system:true,
	debug:true,
	taint:true
};

Coding.dashboard = function() {
	var i, j, html, list = [], types = ['system', 'advanced', 'debug', 'taint', 'keep'], data = ['display', 'dashboard', 'data', 'option', 'runtime', 'temp'];

	for (i in Workers) {
		html = '';
		for (j=0; j<types.length; j++) {
			if (Workers[i].settings[types[j]]) {
				html += '<td class="green">true</td>';
			} else {
				html += '<td class="red">false</td>';
			}
		}
		for (j=0; j<data.length; j++) {
			if (Workers[i][data[j]]) {
				html += '<td class="green">true</td>';
			} else {
				html += '<td class="red">false</td>';
			}
		}
		list.push('<tr><th>' + i + '</th>' + html + '</tr>');
	}
	list.sort();
	html = '';
	for (j=0; j<types.length; j++) {
		html += '<th>' + types[j].ucfirst() + '</td>';
	}
	for (j=0; j<data.length; j++) {
		html += '<th>' + data[j].ucfirst() + '</td>';
	}
	$('#golem-dashboard-Coding').html('<table><tr><th></th>' + html + '</tr>' + list.join('') + '</table>');
};

/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Dashboard, History, Page, Queue, Resources, Script,
	Battle, Generals, LevelUp, Player,
	APP, APPID, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, Divisor, length, sum, findInObject, objectIndex, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
	makeImage, getImage, log, warn, error, isUndefined
*/
/********** Worker.Config **********
* Has everything to do with the config
*/
var Config = new Worker('Config');

Config.settings = {
	system:true,
	keep:true,
	taint:true
};

Config.option = {
	display:'block',
	fixed:false,
	advanced:false,
	debug:false,
	exploit:false
};

Config.temp = {
	require:[],
	menu:null
};

Config.init = function() {
	var i, j, k, tmp, worker, multi_change_fn;
	// START: Only safe place to put this - temporary for deleting old queue enabled code...
	for (i in Workers) {
		if (Workers[i].option && ('_enabled' in Workers[i].option)) {
			if (!Workers[i].option._enabled) {
				Workers[i].set(['option','_disabled'], true);
			}
			Workers[i].set(['option','_enabled']);
		}
	}
	// END
	// START: Move active (unfolded) workers into individual worker.option._config._show
	if (this.option.active) {
		for (i=0; i<this.option.active.length; i++) {
			worker = Worker.find(this.option.active[i]);
			if (worker) {
				worker.set(['option','_config','_show'], true);
			}
		}
		this.set(['option','active']);
	}
	// END
	$('head').append('<link rel="stylesheet" href="http://cloutman.com/css/base/jquery-ui.css" type="text/css" />');
	this.makeWindow(); // Creates all UI stuff
	$('.golem-config .golem-panel > h3').live('click.golem', function(event){ // Toggle display of config panels
		var worker = Worker.find($(this).parent().attr('id'));
		worker.set(['option','_config','_show'], worker.get(['option','_config','_show'], false) ? undefined : true); // Only set when *showing* panel
		Worker.flush();
	});
	$('.golem-config .golem-panel h4').live('click.golem', function(event){ // Toggle display of config groups
		var $this = $(this), $next = $this.next('div'), worker = Worker.find($this.parents('.golem-panel').attr('id')), id = $this.text().toLowerCase().replace(/[^a-z]/g,'');
		if ($next.length && worker && id) {
			worker.set(['option','_config',id], worker.get(['option','_config',id], false) ? undefined : true); // Only set when *hiding* group
			$this.toggleClass('golem-group-show');
			$next.stop(true,true).toggle('blind');
			Worker.flush();
		}
	});
	multi_change_fn = function(el) {
		var $this = $(el), tmp, worker, val;
		if ($this.attr('id') && (tmp = $this.attr('id').slice(PREFIX.length).regex(/([^_]*)_(.*)/i)) && (worker = Worker.find(tmp[0]))) {
			val = [];
			$this.children().each(function(a,el){ val.push($(el).text()); });
			worker.get(['option', tmp[1]]);
			worker.set(['option', tmp[1]], val);
		}
	};

	$('input.golem_addselect').live('click.golem', function(){
		var i, value, values = $(this).prev().val().split(','), $multiple = $(this).parent().children().first();
		for (i=0; i<values.length; i++) {
			value = values[i].trim();
			if (value) {
				$multiple.append('<option>' + value + '</option>').change();
			}
		}
		multi_change_fn($multiple[0]);
		Worker.flush();
	});
	$('input.golem_delselect').live('click.golem', function(){
		var $multiple = $(this).parent().children().first();
		$multiple.children().selected().remove();
		multi_change_fn($multiple[0]);
		Worker.flush();
	});
	$('#golem_config input,textarea,select').live('change.golem', function(){
		var $this = $(this), tmp, worker, val, handled = false;
		if ($this.is('#golem_config :input:not(:button)') && $this.attr('id') && (tmp = $this.attr('id').slice(PREFIX.length).regex(/([^_]*)_(.*)/i)) && (worker = Worker.find(tmp[0]))) {
			if ($this.attr('type') === 'checkbox') {
				val = $this.attr('checked');
			} else if ($this.attr('multiple')) {
				multi_change_fn($this[0]);
				handled = true;
			} else {
				val = $this.attr('value') || $this.val() || null;
				if (val && val.search(/^[-+]?\d*\.?\d+$/) >= 0) {
					val = parseFloat(val);
				}
			}
			if (!handled) {
				worker.set('option.'+tmp[1], val);
				Worker.flush();
			}
		}
	});
	$('.golem-panel-header input').live('click.golem', function(event){
		event.stopPropagation(true);
	});
	$('#content').append('<div id="golem-menu" class="golem-menu golem-shadow"></div>');
	$('.golem-icon-menu').live('click.golem', function(event) {
		var i, j, k, keys, hr = false, html = '', $this = $(this.wrappedJSObject || this), worker = Worker.find($this.attr('name')), name = worker ? worker.name : '';
		$('.golem-icon-menu-active').removeClass('golem-icon-menu-active');
		if (Config.get(['temp','menu']) !== name) {
			Config.set(['temp','menu'], name);
			for (i in Workers) {
				if (Workers[i].menu) {
					hr = true;
					Workers[i]._unflush();
					keys = Workers[i].menu(worker) || [];
					for (j=0; j<keys.length; j++) {
						k = keys[j].regex(/([^:]*):?(.*)/);
						if (k[0] === '---') {
							hr = true;
						} else if (k[1]) {
							if (hr) {
								html += html ? '<hr>' : '';
								hr = false;
							}
							switch (k[1].charAt(0)) {
								case '!':	k[1] = '<img src="' + getImage('warning') + '">' + k[1].substr(1);	break;
								case '+':	k[1] = '<img src="' + getImage('tick') + '">' + k[1].substr(1);	break;
								case '-':	k[1] = '<img src="' + getImage('cross') + '">' + k[1].substr(1);	break;
								case '=':	k[1] = '<img src="' + getImage('dot') + '">' + k[1].substr(1);	break;
								default:	break;
							}
							html += '<div name="' + i + '.' + name + '.' + k[0] + '">' + k[1] + '</div>';
						}
					}
				}
			}
			$this.addClass('golem-icon-menu-active');
			$('#golem-menu').html(html || 'no&nbsp;options');
			$('#golem-menu').css({
				position:Config.get(['option','fixed']) ? 'fixed' : 'absolute',
				top:$this.offset().top + $this.height(),
				left:Math.min($this.offset().left, $('#content').width() - $('#golem-menu').outerWidth(true) - 4)
			}).show();
		} else {// Need to stop it going up to the config panel, but still close the menu if needed
			Config.set(['temp','menu']);
			$('#golem-menu').hide();
		}
		Worker.flush();
		event.stopPropagation();
		return false;
	});
	$('.golem-menu > div').live('click.golem', function(event) {
		var i, $this = $(this.wrappedJSObject || this), key = $this.attr('name').regex(/^([^.]*)\.([^.]*)\.(.*)/), worker = Worker.find(key[0]);
//		log(key[0] + '.menu(' + key[1] + ', ' + key[2] + ')');
		worker._unflush();
		worker.menu(Worker.find(key[1]), key[2]);
		Worker.flush();
	});
	$('body').live('click.golem', function(event){ // Any click hides it, relevant handling done above
		Config.set(['temp','menu']);
		$('.golem-icon-menu-active').removeClass('golem-icon-menu-active');
		$('#golem-menu').hide();
		Worker.flush();
	});
	this._watch(this, 'option.advanced');
	this._watch(this, 'option.debug');
	this._watch(this, 'option.exploit');
};

Config.update = function(event) {
	if (event.type === 'show') {
		$('#golem_config_frame').show();// make sure everything is created before showing (css sometimes takes another second to load though)
	}
	if (event.type === 'watch') {
		var i, $el, $el2, worker = event.worker, id = event.id.slice('option.'.length), value, list, options = [];
		if (worker === this && event.id === 'data') { // Changing one of our dropdown lists
			list = [];
			value = this.get(event.path);
			if (isArray(value)) {
				for (i=0; i<value.length; i++) {
					list.push('<option value="' + value[i] + '">' + value[i] + '</option>');
				}
			} else if (isObject(value)) {
				for (i in value) {
					list.push('<option value="' + i + '">' + value[i] + '</option>');
				}
			}
			list = list.join('');
			$('select.golem_' + event.path.slice('data.'.length)).each(function(a,el){
				var worker = Worker.find($(el).closest('div.golem-panel').attr('id')), val = worker ? worker.get(['option', $(el).attr('id').regex(/_([^_]*)$/i)]) : null;
				$(el).html(list).val(val);
			});
		} else if (worker === this && (id === 'advanced' || id === 'debug' || id === 'exploit')) {
			for (i in Workers) {
				if (Workers[i].settings.advanced || Workers[i].settings.debug || Workers[i].settings.exploit) {
					$('#'+Workers[i].id).css('display', ((!Workers[i].settings.advanced || this.option.advanced) && (!Workers[i].settings.debug || this.option.debug) && (!Workers[i].settings.exploit || this.option.exploit)) ? '' : 'none');
				}
			}
		} else if (id === '_config._show') { // Fold / unfold a config panel or group panel
			i = worker.get(['option','_config','_show'], false);
			$el = $('#' + worker.id);
			$el2 = $el.children('div').stop(true,true);
			if (i) {
				$el2.show('blind');
				$el.addClass('golem-panel-show');
			} else {
				$el2.hide('blind',function(){
					$el.removeClass('golem-panel-show');
				});
			}
		} else if (id === '_sleep') { // Show the ZZZ icon
			$('#golem_sleep_' + worker.name).css('display', worker.get(['option','_sleep'],false) ? '' : 'none');
		} else {
			if (($el = $('#'+this.makeID(worker, id))).length === 1) {
				if ($el.attr('type') === 'checkbox') {
					$el.attr('checked', worker.get('option.'+id, false));
				} else if ($el.attr('multiple')) {
					$el.empty();
					worker.get('option.'+id, [], isArray).forEach(function(val){
						$el.append('<option>'+val+'</option>');
					});
				} else if ($el.attr('value')) {
					$el.attr('value', worker.get('option.'+id));
				} else {
					$el.val(worker.get('option.'+id));
				}
			}
		}
		this.checkRequire();
	}
};

Config.menu = function(worker, key) {
	if (!worker) {
		if (!key) {
			return [
				'fixed:' + (this.option.fixed ? '<img src="' + getImage('pin_down') + '">Fixed' : '<img src="' + getImage('pin_left') + '">Normal') + '&nbsp;Position',
				'advanced:' + (this.option.advanced ? '+' : '-') + 'Advanced&nbsp;Options',
				'debug:' + (this.option.debug ? '+' : '-') + 'Debug&nbsp;Options'
			];
		} else if (key) {
			switch (key) {
				case 'fixed':
					this.set(['option','fixed'], !this.option.fixed);
					$('#golem_config_frame').toggleClass('golem-config-fixed');
					break;
				case 'advanced':
					this.set(['option','advanced'], !this.option.advanced);
					this.checkRequire();
					break;
				case 'debug':
					this.set(['option','debug'], !this.option.debug);
					this.checkRequire();
					break;
			}
		}
	}
};

Config.addButton = function(options) {
	var html = $('<img class="golem-theme-button golem-button' + (options.active ? '-active' : '') + (options.advanced ? ' golem-advanced' : '') + (options.className ? ' '+options.className : '') + '" ' + (options.id ? 'id="'+options.id+'" ' : '') + (options.title ? 'title="'+options.title+'" ' : '') + (options.advanced >= 0 && !Config.get(['option','advanced'],false) ? 'style="display:none;" ' : '') + 'src="' + getImage(options.image) + '">');
	if (options.prepend) {
		$('#golem_buttons').prepend(html);
	} else if (options.after) {
		$('#'+relative).after(html);
	} else {
		$('#golem_buttons').append(html);
	}
	if (options.click) {
		html.click(options.click);
	}
}

Config.makeWindow = function() {  // Make use of the Facebook CSS for width etc - UIStandardFrame_SidebarAds
	var i, j, k, tmp = $('<div id="golem_config_frame" class="UIStandardFrame_SidebarAds canvasSidebar ui-widget-content golem-config' + (this.option.fixed?' golem-config-fixed':'') + '" style="display:none;">' +
		'<div class="golem-title">' +
			'&nbsp;Castle Age Golem ' + (isRelease ? 'v'+version : 'r'+revision) +
			'<img class="golem-image golem-icon-menu" src="' + getImage('menu') + '">' +
		'</div>' +
		'<div id="golem_buttons">' +
		'</div>' +
		'<div style="display:'+this.option.display+';">' +
			'<div id="golem_config" style="overflow:hidden;overflow-y:auto;">' +
				// All config panels go in here
			'</div>' +
		'</div>' +
	'</div>');
	if (('.canvasSidebar').length) { // Should always be inside #UIStandardFrame_SidebarAds - but some ad-blockers remove that
		$('.canvasSidebar').before(tmp);
	} else {
		$('div.UIStandardFrame_Content').after(tmp);
	}
	this.addButton({
		id:'golem_options',
		image:'options',
		active:this.option.display==='block',
		title:'Show Options',
		click:function(){
			$(this).toggleClass('golem-button golem-button-active');
			Config.set(['option','display'], Config.get(['option','display'], false) === 'block' ? 'none' : 'block');
			$('#golem_config').parent().toggle('blind'); //Config.option.fixed?null:
		}
	});
	for (i in Workers) { // Propagate all before and after settings
		if (Workers[i].settings.before) {
			for (j=0; j<Workers[i].settings.before.length; j++) {
				k = Worker.find(Workers[i].settings.before[j]);
				if (k) {
					k.settings.after = k.settings.after || [];
					k.settings.after.push(Workers[i].name);
					k.settings.after = k.settings.after.unique();
//					log(LOG_WARN, 'Pushing '+k.name+' after '+Workers[i].name+' = '+k.settings.after);
				}
			}
		}
		if (Workers[i].settings.after) {
			for (j=0; j<Workers[i].settings.after.length; j++) {
				k = Worker.find(Workers[i].settings.after[j]);
				if (k) {
					k.settings.before = k.settings.before || [];
					k.settings.before.push(Workers[i].name);
					k.settings.before = k.settings.before.unique();
//					log(LOG_WARN, 'Pushing '+k.name+' before '+Workers[i].name+' = '+k.settings.before);
				}
			}
		}
	}
	for (i in Workers) {
		this.makePanel(Workers[i]);
	}
	$('#golem_config .golem-panel-sortable')
		.draggable({
			axis:'y',
			distance:5,
			scroll:false,
			handle:'h3',
			helper:'clone',
			opacity:0.75,
			zIndex:100,
			refreshPositions:true,
			containment:'parent',
			stop:function(event,ui) {
				Queue.clearCurrent();// Make sure we deal with changed circumstances
				Queue.set(['option','queue'], Config.getOrder());
			}
		})
		.droppable({
			tolerance:'pointer',
			over:function(e,ui) {
				var i, order = Config.getOrder(), me = Worker.find($(ui.draggable).attr('name')), newplace = order.indexOf($(this).attr('name'));
				if (order.indexOf('Idle') >= newplace) {
					if (me.settings.before) {
						for(i=0; i<me.settings.before.length; i++) {
							if (order.indexOf(me.settings.before[i]) <= newplace) {
								return;
							}
						}
					}
					if (me.settings.after) {
						for(i=0; i<me.settings.after.length; i++) {
							if (order.indexOf(me.settings.after[i]) >= newplace) {
								return;
							}
						}
					}
				}
				if (newplace < order.indexOf($(ui.draggable).attr('name'))) {
					$(this).before(ui.draggable);
				} else {
					$(this).after(ui.draggable);
				}
			}
		});
	this._update('show');
};

Config.makePanel = function(worker, args) {
	if (!isWorker(worker)) {
		if (Worker.stack.length <= 1) {
			return;
		}
		args = worker;
		worker = Worker.get(Worker.stack[0]);
	}
	if (!args) {
		if (!worker.display) {
			return;
		}
		args = worker.display;
	}
//	worker.id = 'golem_panel_'+worker.name.toLowerCase().replace(/[^0-9a-z]/g,'-');
	if (!$('#'+worker.id).length) {
		var unsortable = worker.settings.unsortable ? '' : ' golem-panel-sortable',
			show = worker.get(['option','_config','_show'], false) ? ' golem-panel-show' : '',
			display = (worker.settings.advanced && !this.option.advanced) || (worker.settings.debug && !this.option.debug) || (worker.settings.exploit && !this.option.exploit),
			disabled = worker.get(['option', '_disabled'], false) ? ' red' : '',
			sleep = worker.get(['option','_sleep'], false) ? '' : ' style="display:none;"';
		$('#golem_config').append(
			'<div id="' + worker.id + '" class="golem-panel' + unsortable + show + '"' + (display ? ' style="display:none;"' : '') + ' name="' + worker.name + '">' +
				'<h3 class="golem-theme-panel golem-panel-header' + disabled + '">' +
					'<img class="golem-icon" src="' + getImage('blank') + '">' +
					worker.name +
					'<img id="golem_sleep_' + worker.name + '" class="golem-image" src="' + getImage('zzz') + '"' + sleep + '>' +
					'<img class="golem-image golem-icon-menu" name="' + worker.name + '" src="' + getImage('menu') + '">' +
					'<img class="golem-lock" src="' + getImage('lock') + '">' +
				'</h3>' +
			'<div class="golem-panel-content" style="font-size:smaller;"></div></div>'
		);
		this._watch(worker, 'option._config._show');
		this._watch(worker, 'option._sleep');
	} else {
		$('#'+worker.id+' > div').empty();
	}
	this.addOption(worker, args);
};

Config.makeID = function(worker, id) {
	return PREFIX + worker.name.toLowerCase().replace(/[^0-9a-z]/g,'-') + '_' + id;
};

Config.clearPanel = function(selector) {
	this._init(); // Make sure we're properly loaded first!
	if (isWorker(selector)) {
		selector = '#'+selector.id+' > div';
	} else if (typeof selector === 'undefined' || !selector) {
		if (Worker.stack.length <= 1) {
			return;
		}
		selector = '#'+Workers[Worker.stack[0]].id+' > div';
	}
	$(selector).empty();
};

Config.addOption = function(selector, args) {
	this._init(); // Make sure we're properly loaded first!
	var worker;
	if (isWorker(selector)) {
		worker = selector;
		selector = '#'+selector.id+' > div';
	} else if (typeof args === 'undefined' || !args) {
		if (Worker.stack.length <= 1) {
			return;
		}
		worker = Workers[Worker.stack[0]];
		args = selector;
		selector = '#'+worker.id+' > div';
	}
	$(selector).append(this.makeOptions(worker, args));
};

Config.makeOptions = function(worker, args) {
	this._init(); // Make sure we're properly loaded first!
	if (isArray(args)) {
		var i, $output = $([]);
		for (i=0; i<args.length; i++) {
			$output = $output.add(this.makeOptions(worker, args[i]));
		}
		return $output;
	} else if (isObject(args)) {
		return this.makeOption(worker, args);
	} else if (isString(args)) {
		return this.makeOption(worker, {title:args});
	} else if (isFunction(args)) {
		try {
			return this.makeOptions(worker, args.call(worker));
		} catch(e) {
			log(LOG_WARN, e.name + ' in Config.makeOptions(' + worker.name + '.display()): ' + e.message);
		}
	} else {
		log(LOG_ERROR, worker.name+' is trying to add an unknown type of option: '+(typeof args));
	}
	return $([]);
};

Config.makeOption = function(worker, args) {
	var i, j, o, r, step, $option, txt = [], list = [];
	o = $.extend({}, {
		before: '',
		after: '',
		suffix: '',
		className: '',
		between: 'to',
		size: 18,
		min: 0,
		max: 100,
		real_id: ''
	}, args);
	if (o.id) {
		if (!isArray(o.id)) {
			o.id = o.id.split('.');
		}
		if (o.id.length > 0 && Workers[o.id[0]]) {
			worker = Workers[o.id.shift()];
		}
		if (isUndefined(worker._datatypes[o.id[0]])) {
			o.id.unshift('option');
		}
		o.path = o.id;
		o.id = o.id.slice(1).join('.');
		this._watch(worker, o.path);
		o.real_id = ' id="' + this.makeID(worker, o.id) + '"';
		o.value = worker.get(o.path, null);
	}
	o.alt = (o.alt ? ' alt="'+o.alt+'"' : '');
	if (o.hr) {
		txt.push('<br><hr style="clear:both;margin:0;">');
	}
	if (o.title) {
		txt.push('<h4 class="golem-group-title' + (o.group ? ' golem-group' + (worker.get(['option','_config',o.title.replace(' ','').toLowerCase()], false) ? '' : ' golem-group-show') : '') + '">' + (o.group ? '<img class="golem-icon" src="' + getImage('blank') + '">' : '') + o.title.replace(' ','&nbsp;') + '</h4>');
	}
	if (o.label && !o.button) {
		txt.push('<span style="float:left;margin-top:2px;">'+o.label.replace(' ','&nbsp;')+'</span>');
		if (o.text || o.checkbox || o.select || o.number) {
			txt.push('<span style="float:right;">');
		} else if (o.multiple) {
			txt.push('<br>');
		}
	}
	if (o.before) {
		txt.push(o.before+' ');
	}
	// our different types of input elements
	if (o.info) { // only useful for externally changed
		if (o.id) {
			txt.push('<span style="float:right"' + o.real_id + '>' + (o.value || o.info) + '</span>');
		} else {
			txt.push(o.info);
		}
	} else if (o.text) {
		txt.push('<input type="text"' + o.real_id + (o.label || o.before || o.after ? '' : ' style="width:100%;"') + ' size="' + o.size + '" value="' + (o.value || isNumber(o.value) ? o.value : '') + '">');
	} else if (o.number) {
		txt.push('<input type="number"' + o.real_id + (o.label || o.before || o.after ? '' : ' style="width:100%;"') + ' size="6"' + (o.step ? ' step="'+o.step+'"' : '') + ' min="' + o.min + '" max="' + o.max + '" value="' + (isNumber(o.value) ? o.value : o.min) + '">');
	} else if (o.textarea) {
		txt.push('<textarea' + o.real_id + ' cols="23" rows="5">' + (o.value || '') + '</textarea>');
	} else if (o.checkbox) {
		txt.push('<input type="checkbox"' + o.real_id + (o.value ? ' checked' : '') + '>');
	} else if (o.button) {
		txt.push('<input type="button"' + o.real_id + ' value="' + o.label + '">');
	} else if (o.select) {
		if (typeof o.select === 'function') {
			o.select = o.select.call(worker, o.id);
		}
		switch (typeof o.select) {
			case 'number':
				step = Divisor(o.select);
				for (i=0; i<=o.select; i+=step) {
					list.push('<option' + (o.value==i ? ' selected' : '') + '>' + i + '</option>');
				}
				break;
			case 'string':
				o.className = ' class="golem_'+o.select+'"';
				if (this.data && this.data[o.select] && (typeof this.data[o.select] === 'array' || typeof this.data[o.select] === 'object')) {
					o.select = this.data[o.select];
				} else {
					break;
				} // deliberate fallthrough
			case 'array':
			case 'object':
				if (isArray(o.select)) {
					for (i=0; i<o.select.length; i++) {
						list.push('<option value="' + o.select[i] + '"' + (o.value==o.select[i] ? ' selected' : '') + '>' + o.select[i] + (o.suffix ? ' '+o.suffix : '') + '</option>');
					}
				} else {
					for (i in o.select) {
						list.push('<option value="' + i + '"' + (o.value==i ? ' selected' : '') + '>' + o.select[i] + (o.suffix ? ' '+o.suffix : '') + '</option>');
					}
				}
				break;
		}
		txt.push('<select' + o.real_id + o.className + o.alt + '>' + list.join('') + '</select>');
	} else if (o.multiple) {
		if (isArray(o.value)) {
			for (i = 0; i < o.value.length; i++) {
				list.push('<option>'+o.value[i]+'</option>');
			}
		} else if (isObject(o.value)) {
			for (i in o.value) {
				list.push('<option>'+o.value[i]+'</option>');
			}
		}
		txt.push('<select style="width:100%;clear:both;" class="golem_multiple" multiple' + o.real_id + '>' + list.join('') + '</select><br>');
		if (typeof o.multiple === 'string') {
			txt.push('<input class="golem_select" type="text" size="' + o.size + '">');
		} else {
			list = [];
			switch (typeof o.multiple) {
				case 'number':
					step = Divisor(o.select);
					for (i=0; i<=o.multiple; i+=step) {
						list.push('<option>' + i + '</option>');
					}
					break;
				case 'array':
				case 'object':
					if (isArray(o.multiple)) {
						for (i=0; i<o.multiple.length; i++) {
							list.push('<option value="' + o.multiple[i] + '">' + o.multiple[i] + (o.suffix ? ' '+o.suffix : '') + '</option>');
						}
					} else {
						for (i in o.multiple) {
							list.push('<option value="' + i + '">' + o.multiple[i] + (o.suffix ? ' '+o.suffix : '') + '</option>');
						}
					}
					break;
			}
			txt.push('<select class="golem_select">'+list.join('')+'</select>');
		}
		txt.push('<input type="button" class="golem_addselect" value="Add" /><input type="button" class="golem_delselect" value="Del" />');
	}
	if (o.after) {
		txt.push(' '+o.after);
	}
	if (o.label && (o.text || o.checkbox || o.select || o.multiple)) {
		txt.push('</span>');
	}
	$option = $('<div>' + txt.join('') + '</div>');
	if (o.require || o.advanced || o.debug || o.exploit) {
		try {
			r = {depth:0};
			r.require = {};
			if (o.advanced) {
				r.require.advanced = true;
				$option.css('background','#ffeeee');
			}
			if (o.debug) {
				r.require.debug = true;
				$option.css({border:'1px solid blue', 'background':'#ddddff'});
			}
			if (o.exploit) {
				r.require.exploit = true;
				$option.css({border:'1px solid red', 'background':'#ffeeee'});
			}
			if (o.require) {
				r.require.x = Script.parse(worker, 'option', o.require);
			}
			this.temp.require.push(r.require);
			$option.attr('id', 'golem_require_'+(this.temp.require.length-1)).css('display', this.checkRequire(this.temp.require.length - 1) ? '' : 'none');
		} catch(e) {
			log(LOG_ERROR, e.name + ' in createRequire(' + o.require + '): ' + e.message);
		}
	}
	if (o.group) {
		$option.append($('<div' + o.real_id + (o.title ? ' style="padding-left:16px;' + (worker.get(['option','_config',o.title.toLowerCase().replace(/[^a-z]/g,'')], false) ? 'display:none;' : '') + '"' : '') + '></div>').append(this.makeOptions(worker,o.group)));
	} else {
		$option.append('<br>');
	}
	if (o.help) {
		$option.attr('title', o.help);
	}
	return $option;
};

Config.checkRequire = function(id) {
	var i, show = true, require;
	if (!isNumber(id) || !(require = this.temp.require[id])) {
		for (i=0; i<this.temp.require.length; i++) {
			arguments.callee.call(this, i);
		}
		return;
	}
	if (require.advanced) {
		show = Config.option.advanced;
	}
	if (require.debug) {
		show = Config.option.debug;
	}
	if (show && require.exploit) {
		show = Config.option.exploit;
	}
	if (show && require.x) {
		show = Script.interpret(require.x);
	}
	if (require.show !== show) {
		require.show = show;
		$('#golem_require_'+id).css('display', show ? '' : 'none');
	}
	return show;
};

Config.getOrder = function() {
	var order = [];
	$('#golem_config > div').each(function(i,el){
		order.push($(el).attr('name'));
	});
	return order.unique();
};

/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Dashboard:true, History, Page:true, Queue, Resources,
	Battle, Generals, LevelUp, Player,
	APP, APPID, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, Divisor, length, sum, findInObject, objectIndex, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
	makeImage
*/
/********** Worker.Dashboard **********
* Displays statistics and other useful info
*/
var Dashboard = new Worker('Dashboard');
Dashboard.temp = null;

Dashboard.settings = {
	taint:true
};

Dashboard.option = {
	display:'block',
	active:'Dashboard',
	expand:false,
	width:600,
	height:183
};

Dashboard.init = function() {
	var i, j, list = [], tabs = [], divs = [], active = this.option.active, hide;
	if (!Workers[active]) {
		this.set('option.active', active = this.name);
	}
	for (i in Workers) {
		if (i !== this.name && Workers[i].dashboard) {
			list.push(i);
		}
	}
	list.sort();
	tabs.push('<h3 name="' + this.name + '" class="golem-tab-header golem-theme-button' + (active === this.name ? ' golem-tab-header-active' : '') + '">&nbsp;*&nbsp;</h3>');
	divs.push('<div id="golem-dashboard-' + this.name + '"' + (active === this.name ? '' : ' style="display:none;"') + '></div>');
	this._watch(this, 'data');
	this._watch(this, 'option._hide_dashboard');
	for (j=0; j<list.length; j++) {
		i = list[j];
		hide = Workers[i]._get(['option','_hide_dashboard'], false) || (Workers[i].settings.advanced && !Config.option.advanced) || (Workers[i].settings.debug && !Config.option.debug);
		if (hide && this.option.active === i) {
			this.set(['option','active'], this.name);
		}
		tabs.push('<h3 name="' + i + '" class="golem-tab-header golem-theme-button' + (active === i ? ' golem-tab-header-active' : '') + '" style="' + (hide ? 'display:none;' : '') + (Workers[i].settings.advanced ? 'background:#ffeeee;' : Workers[i].settings.debug ? 'background:#ddddff;' : '') + '">' + i + '</h3>');
		divs.push('<div id="golem-dashboard-' + i + '"'+(active === i ? '' : ' style="display:none;"') + '></div>');
		this._watch(Workers[i], 'data');
		this._watch(Workers[i], 'option._hide_dashboard');
	}
	$('<div id="golem-dashboard" style="position:absolute;display:none;">' + tabs.join('') + '<img id="golem_dashboard_expand" style="position:absolute;top:0;right:0;" src="'+getImage('expand')+'"><div>' + divs.join('') + '</div></div>').prependTo('.UIStandardFrame_Content');
	$('#golem-dashboard').offset($('#app46755028429_app_body_container').offset()).css('display', this.option.display); // Make sure we're always in the right place
	$('.golem-tab-header').click(function(){
		if (!$(this).hasClass('golem-tab-header-active')) {
			Dashboard.set(['option','active'], $(this).attr('name'));
		}
	});
	$('#golem_dashboard_expand').click(function(event){
		Dashboard.set(['option','expand'], !Dashboard.get(['option','expand'], false));
		Dashboard.update_trigger(event);
	});
	$('#golem-dashboard .golem-panel > h3').live('click', function(event){
		if ($(this).parent().hasClass('golem-panel-show')) {
			$(this).next().hide('blind',function(){$(this).parent().toggleClass('golem-panel-show');});
		} else {
			$(this).parent().toggleClass('golem-panel-show');
			$(this).next().show('blind');
		}
	});
	$('#golem-dashboard thead th').live('click', function(event){
		var worker = Workers[Dashboard.option.active];
		worker._unflush();
		worker.dashboard($(this).prevAll().length, $(this).attr('name')==='sort');
	});
	Config.addButton({
		id:'golem_icon_dashboard',
		image:'dashboard',
		active:(Dashboard.option.display==='block'),
		title:'Show Dashboard',
		click:function(){
			$(this).toggleClass('golem-button golem-button-active');
			Dashboard.set(['option','display'], Dashboard.option.display==='block' ? 'none' : 'block');
			if (Dashboard.option.display === 'block' && !$('#golem-dashboard-'+Dashboard.option.active).children().length) {
				Dashboard.update_trigger();
				Workers[Dashboard.option.active].dashboard();
			}
			$('#golem-dashboard').toggle('drop');
		}
	});
	this._trigger('#app46755028429_app_body_container, #app46755028429_globalContainer', 'page_change');
	this._watch(this, 'option.active');
	this._watch(Config, 'option.advanced');
	this._watch(Config, 'option.debug');
};

Dashboard.update_trigger = function(event) {
	var expand = this.get(['option','expand'], false), $el, offset, width, height, margin = 0;
	if (expand) {
		$el = $('#app46755028429_globalContainer');
		width = $el.width();
		height = $el.height();
		margin = 10;
	} else {
		$el = $('#app46755028429_app_body_container');
		width = this.get(['option','width'], 0);
		height = this.get(['option','height'], 0);
	}
	offset = $el.offset();
	$('#golem-dashboard').css({'top':offset.top + margin, 'left':offset.left + margin, 'width':width - (2 * margin), 'height':height - (2 * margin)}); // Make sure we're always in the right place
};

Dashboard.update_watch = function(event) {
	var i, settings, advanced, debug;
	if (event.id === 'option.advanced' || event.id === 'option.debug') {
		advanced = Config.get(['option','advanced'], false);
		debug = Config.get(['option','debug'], false);
		for (var i in Workers) {
			settings = Workers[i].settings;
			if ((!settings.advanced || advanced) && (!settings.debug || debug)) {
				$('#golem-dashboard > h3[name="'+i+'"]').show();
			} else {
				$('#golem-dashboard > h3[name="'+i+'"]').hide();
				if (this.option.active === i) {
					this.set(['option','active'], this.name);
				}
			}
		}
		return;
	}
	if (event.id === 'option._hide_dashboard') {
		if (event.worker._get(['option','_hide_dashboard'], false)) {
			$('#golem-dashboard > h3[name="'+event.worker.name+'"]').hide();
			if (this.option.active === event.worker.name) {
				this.set(['option','active'], this.name);
			}
		} else {
			$('#golem-dashboard > h3[name="'+event.worker.name+'"]').show();
		}
		return;
	}
	if (event.id === 'option.active') {
		if (!Workers[this.option.active]) {
			this.set('option.active', this.name);
		}
		$('#golem-dashboard > h3').removeClass('golem-tab-header-active');
		$('#golem-dashboard > div > div').hide();
		$('#golem-dashboard > h3[name="'+this.option.active+'"]').addClass('golem-tab-header-active');
		$('#golem-dashboard-'+this.option.active).show();
		event.worker = Workers[this.option.active];
	}
	if (this.option.active === event.worker.name && this.option.display === 'block') {
		try {
			event.worker._unflush();
			event.worker.dashboard();
		}catch(e) {
			log(LOG_ERROR, e.name + ' in ' + event.worker.name + '.dashboard(): ' + e.message);
		}
	} else {
		$('#golem-dashboard-'+event.worker.name).empty();
	}
};

Dashboard.update = function(event) {
	if (event.type === 'init') {
		event.worker = Workers[this.option.active];
		this.update_trigger(event);
		this.update_watch(event);
	}
};

Dashboard.dashboard = function() {
	var i, list = [];
	for (i in Workers) {
		if (this.data[i] && !Workers[i].get(['option','_hide_status'], false)) {
			list.push('<tr><th>' + i + ':</th><td id="golem-status-' + i + '">' + this.data[i] + '</td></tr>');
		}
	}
	list.sort(); // Ok with plain text as first thing that can change is name
	$('#golem-dashboard-Dashboard').html('<table cellspacing="0" cellpadding="0" class="golem-status">' + list.join('') + '</table>');
};

Dashboard.status = function(worker, value) {
	var w = Worker.find(worker);
	if (w) {
		this.set(['data', w.name], value);
	}
};

Dashboard.menu = function(worker, key) {
	if (worker) {
		this._unflush();
		if (!key) {
			var keys = [];
			if (this.data[worker.name]) {
				keys.push('status:' + (worker.get(['option','_hide_status'], false) ? '-' : '+') + 'Show&nbsp;Status');
			}
			if (worker.dashboard) {
				keys.push('dashboard:' + (worker.get(['option','_hide_dashboard'], false) ? '-' : '+') + 'Show&nbsp;Dashboard');
			}
			return keys;
		} else {
			switch (key) {
				case 'status':		worker.set(['option','_hide_status'], worker.option._hide_status ? undefined : true);	break;
				case 'dashboard':	worker.set(['option','_hide_dashboard'], worker.option._hide_dashboard ? undefined : true);	break;
			}
			this._notify('data');
		}
	}
};

/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Dashboard, History, Page, Queue, Resources,
	Battle, Generals, LevelUp, Player, Config,
	APP, APPID, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, Divisor, length, sum, findInObject, objectIndex, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime, error:true, warn:true, log:true, getImage, isUndefined, script_started,
	makeImage
*/
/********** Worker.Debug **********
* Profiling information
*/
var Debug = new Worker('Debug');
Debug.data = null;

Debug.settings = {
//	system:true,
	unsortable:true,
	debug:true,
	taint:true
};

Debug.option = {
	timer:0,
	count:2,
	show:10,
	digits:1,
	total:false,
	prototypes:true,
	worker:'All',
	trace:false,
	logdef:LOG_LOG, // Default level when no LOG_* set...
	loglevel:LOG_INFO, // Level to show - can turn off individual levels in Debug config
	log:{0:'info', 1:'log', 2:'warn', 3:'error', 4:'debug'}
};

Debug.runtime = {
	sort:2,
	rev:false,
	watch:false
};

Debug.display = [
	{
		title:'Logging',
		group:[
			{
				id:'logdef',
				label:'Default log level',
				select:{0:'LOG_INFO', 1:'LOG_LOG', 2:'LOG_WARN', 3:'LOG_ERROR', 4:'LOG_DEBUG'}
			},{
				id:'log.0',
				label:'0: Info',
				select:{'-':'Disabled', 'info':'console.info()', 'log':'console.log()', 'warn':'console.warn()', 'error':'console.error()', 'debug':'console.debug()'}
			},{
				id:'log.1',
				label:'1: Log',
				select:{'-':'Disabled', 'info':'console.info()', 'log':'console.log()', 'warn':'console.warn()', 'error':'console.error()', 'debug':'console.debug()'}
			},{
				id:'log.2',
				label:'2: Warn',
				select:{'-':'Disabled', 'info':'console.info()', 'log':'console.log()', 'warn':'console.warn()', 'error':'console.error()', 'debug':'console.debug()'}
			},{
				id:'log.3',
				label:'3: Error',
				select:{'-':'Disabled', 'info':'console.info()', 'log':'console.log()', 'warn':'console.warn()', 'error':'console.error()', 'debug':'console.debug()'}
			},{
				id:'log.4',
				label:'4: Debug',
				select:{'-':'Disabled', 'info':'console.info()', 'log':'console.log()', 'warn':'console.warn()', 'error':'console.error()', 'debug':'console.debug()'}
			}
		]
	},{
		title:'Function Profiling',
		group:[
			{
				id:'timer',
				label:'Refresh',
				select:{0:'Manual', 5:'5 seconds', 10:'10 seconds', 15:'15 seconds', 30:'30 seconds', 60:'1 minute'}
			},{
				id:'count',
				label:'Minimum Count',
				select:[1,2,3,4,5,10,15,20,25,50,100]
			},{
				id:'show',
				label:'Display Lines',
				select:{0:'All',10:10,20:20,30:30,40:40,50:50,60:60,70:70,80:80,90:90,100:100}
			},{
				id:'digits',
				label:'Digits',
				select:[1,2,3,4,5]
			},{
				id:'total',
				label:'Show Worker Totals',
				checkbox:true
			},{
				id:'prototypes',
				label:'Show Prototype Functions',
				checkbox:true
			},{
				id:'worker',
				label:'Worker',
				select:'worker_list'
			}
		]
	},{
		title:'Stack Trace',
		group:[
			{
				id:'trace',
				label:'Full Stack Trace',
				checkbox:true
			}
		]
	}
];

Debug.stack = [];// Stack tracing = [[time, worker, function, args], ...]
Debug.setup = function() {
	if (this.option._disabled) {// Need to remove our dashboard when disabled
		delete this.dashboard;
		return;
	}
	// Go through every worker and replace their functions with a stub function
	var i, j, p, wkr, fn;
	Workers['__fake__'] = null;// Add a fake worker for accessing Worker.prototype
	for (i in Workers) {
		for (p=0; p<=1; p++) {
			wkr = (i === '__fake__' ? (p ? Worker.prototype : null) : (p ? Workers[i] : Workers[i].defaults[APP])) || {};
			for (j in wkr) {
				if (isFunction(wkr[j]) && wkr.hasOwnProperty(j) && !/^_.*_$/.test(j)) {// Don't overload functions using _blah_ names - they're speed conscious
					fn = wkr[j];
					wkr[j] = function() {
						var t, r, ac = arguments.callee, w = (ac._worker || (this ? this.name : null)), l = [], s;
						Debug.stack.unshift([0, w || '', arguments]);
						try {
							if (Debug.option._disabled) {
								r = ac._orig.apply(this, arguments);
							} else {
								if (w) {
									l = [w+'.'+ac._name, w];
								}
								if (!ac._worker) {
									l.push('_worker.'+ac._name);
								}
								t = Date.now();
								r = ac._orig.apply(this, arguments);
								t = Date.now() - t;
								if (Debug.stack.length > 1) {
									Debug.stack[1][0] += t;
								}
								while ((i = l.shift())) {
									w = Debug.temp[i] = Debug.temp[i] || [0,0,0,false];
									w[0]++;
									w[1] += t - Debug.stack[0][0];
									w[2] += t;
									if (Debug.temp[i][3]) {
										s = i + '(' + JSON.shallow(arguments, 2).replace(/^\[?|\]?$/g, '') + ') => ' + JSON.shallow(isUndefined(r) ? null : r, 2).replace(/^\[?|\]?$/g, '');
										if (Debug.option.trace) {
											log(LOG_DEBUG, '!!! ' + s);
										} else {
											log(LOG_INFO, '!!! ' + s);
										}
									}
								}
							}
						} catch(e) {
							log(LOG_ERROR, e.name + ': ' + e.message);
						}
						Debug.stack.shift();
						return r;
					};
					wkr[j]._name = j;
					wkr[j]._orig = fn;
					if (i !== '__fake__') {
						wkr[j]._worker = i;
					}
				}
			}
		}
	}
	delete Workers['__fake__']; // Remove the fake worker
	// Replace the global logging function for better log reporting
	log = function(level, txt /*, obj, array etc*/){
		var i, j, level, tmp, args = Array.prototype.slice.call(arguments), prefix = [], suffix = [],
			date = [true, true, true, true, true],
			rev = [false, false, true, true, true],
			worker = [false, true, true, true, true],
			stack = [false, false, false, true, true];
		if (isNumber(args[0])) {
			level = Math.range(0, args.shift(), 4);
		} else {
			level = Debug.get(['option','logdef'], LOG_LOG);
		}
		if (level > Debug.get(['option','loglevel', LOG_LOG]) || Debug.get(['option','log',level], '-') === '-') {
			return;
		}
		if (rev[level]) {
			prefix.push('[' + (isRelease ? 'v'+version : 'r'+revision) + ']');
		}
		if (date[level]) {
			prefix.push('[' + (new Date()).toLocaleTimeString() + ']');
		}
		if (worker[level]) {
			tmp = [];
			for (i=0; i<Debug.stack.length; i++) {
				if (!tmp.length || Debug.stack[i][1] !== tmp[0]) {
					tmp.unshift(Debug.stack[i][1]);
				}
			}
			prefix.push(tmp.join('->'));
		}
		if (stack[level]) {
			for (i=0; i<Debug.stack.length; i++) {
				suffix.unshift('->' + Debug.stack[i][1] + '.' + Debug.stack[i][2].callee._name + '(' + JSON.shallow(Debug.stack[i][2],2).replace(/^\[|\]$/g,'') + ')');
				for (j=1; j<suffix.length; j++) {
					suffix[j] = '  ' + suffix[j];
				}
			}
		}
		suffix.unshift(''); // Force an initial \n before the stack trace
		if (args.length > 1) {
			suffix.push(''); // Force an extra \n after the stack trace if there's more args
		}
		args[0] = prefix.join(' ') + (prefix.length && args[0] ? ': ' : '') + (args[0] || '') + suffix.join("\n");
		level = Debug.get(['option','log',level], '-');
		if (!console[level]) {
			level = 'log';
		}
		try {
			console[level].apply(console, args);
		} catch(e) { // FF4 fix
			console[level](args);
		}
	};
};

Debug.init = function(old_revision) {
	var i, list = [];
	// BEGIN: Change log message type from on/off to debug level
	if (old_revision <= 1097) {
		var type = ['info', 'log', 'warn', 'error', 'debug'];
		for (i in this.option.log) {
			if (this.option.log[i] === true) {
				this.option.log[i] = type[i];
			} else if (this.option.log[i] === false) {
				this.option.log[i] = '-';
			}
		}
		delete this.option.console;
	}
	// END
	for (i in Workers) {
		list.push(i);
	}
	Config.set('worker_list', ['All', '_worker'].concat(list.unique().sort()));
	Config.addButton({
		image:'bug',
		advanced:true,
		className:'blue',
		title:'Bug Reporting',
		click:function(){
			window.open('http://code.google.com/p/game-golem/wiki/BugReporting', '_blank'); 
		}
	});
//	try{abc.def.ghi = 123;}catch(e){console.log(JSON.stringify(e));}
/*
{
	"arguments":["abc"],
	"type":"not_defined",
	"message":"abc is not defined",
	"stack":"ReferenceError: abc is not defined\n    at Worker.<anonymous> (chrome-extension://pjopfpjfmcdkjjokkbijcehcjhmijhbm/worker_+debug.js:251:6)\n    at Worker.init (chrome-extension://pjopfpjfmcdkjjokkbijcehcjhmijhbm/worker_+debug.js:152:22)\n    at Worker.<anonymous> (chrome-extension://pjopfpjfmcdkjjokkbijcehcjhmijhbm/worker.js:345:9)\n    at Worker._init (chrome-extension://pjopfpjfmcdkjjokkbijcehcjhmijhbm/worker_+debug.js:152:22)\n    at Worker.<anonymous> (chrome-extension://pjopfpjfmcdkjjokkbijcehcjhmijhbm/worker_+main.js:58:15)\n    at Worker.<anonymous> (chrome-extension://pjopfpjfmcdkjjokkbijcehcjhmijhbm/worker.js:931:19)\n    at chrome-extension://pjopfpjfmcdkjjokkbijcehcjhmijhbm/worker.js:559:33"}
*/
};

Debug.update = function(event) {
	if (event.type === 'option' || event.type === 'init') {
		if (this.option.timer) {
			this._revive(this.option.timer, 'timer', function(){Debug._notify('data');});
		} else {
			this._forget('timer');
		}
		Dashboard.update_watch({worker:this}); // Any changes to options should force a dashboard update
	}
};

Debug.work = function(){};// Stub so we can be disabled

Debug.menu = function(worker, key) {
	if (!worker) {
		if (!isUndefined(key)) {
			this.set(['option','loglevel'], parseInt(key, 10));
		} else if (Config.option.advanced || Config.option.debug) {
			return [
				':<img src="' + getImage('bug') + '"><b>Log Level</b>',
				'0:' + (this.option.loglevel === 0 ? '=' : '') + 'Info',
				'1:' + (this.option.loglevel === 1 ? '=' : '') + 'Log',
				'2:' + (this.option.loglevel === 2 ? '=' : '') + 'Warn',
				'3:' + (this.option.loglevel === 3 ? '=' : '') + 'Error',
				'4:' + (this.option.loglevel === 4 ? '=' : '') + 'Debug'
			]
		}
	}
};

Debug.dashboard = function(sort, rev) {
	var i, o, list = [], order = [], output = [], data = this.temp, total = 0, rx = new RegExp('^'+this.option.worker);
	for (i in data) {
		if (data[i][0] >= this.option.count && (this.option.total || i.indexOf('.') !== -1) && (this.option.prototypes || !/^[^.]+\._/.test(i)) && (this.option.worker === 'All' || rx.test(i))) {
			order.push(i);
		}
		if (i.indexOf('.') === -1) {
			total += parseInt(data[i][1], 10);
		}
	}
	this.runtime.sort = sort = isUndefined(sort) ? (this.runtime.sort || 0) : sort;
	this.runtime.rev = rev = isUndefined(rev) ? (this.runtime.rev || false) : rev;
	order.sort(function(a,b) {
		switch (sort) {
			case 0:	return (a).localeCompare(b);
			case 1: return data[b][0] - data[a][0];
			case 2: return data[b][1] - data[a][1];
			case 3: return data[b][2] - data[a][2];
			case 4: return (data[b][1]/data[b][0]) - (data[a][1]/data[a][0]);
			case 5: return (data[b][2]/data[b][0]) - (data[a][2]/data[a][0]);
			case 6: return ((data[b][2]/data[b][0])-(data[a][1]/data[a][0])) - ((data[a][2]/data[a][0])-(data[b][1]/data[b][0]));
		}
	});
	if (rev) {
		order.reverse();
	}
	list.push('<b>Estimated CPU Time:</b> ' + total.addCommas() + 'ms, <b>Efficiency:</b> ' + (100 - (total / (Date.now() - script_started) * 100)).addCommas(2) + '% <span style="float:right;">' + (this.option.timer ? '' : '&nbsp;<a id="golem-profile-update">update</a>') + '&nbsp;<a id="golem-profile-reset" style="color:red;">reset</a>&nbsp;</span><br style="clear:both">');
	th(output, 'Function', 'style="text-align:left;"');
	th(output, 'Count', 'style="text-align:right;"');
	th(output, 'Time', 'style="text-align:right;"');
	th(output, '&Psi; Time', 'style="text-align:right;"');
	th(output, 'Average', 'style="text-align:right;"');
	th(output, '&Psi; Average', 'style="text-align:right;"');
	th(output, '&Psi; Diff', 'style="text-align:right;"');
	list.push('<table cellspacing="0" style="width:100%"><thead><tr>' + output.join('') + '</tr></thead><tbody>');
	for (i=0; i<Math.min(this.option.show || Number.POSITIVE_INFINITY,order.length); i++) {
		output = [];
		o = order[i];
		th(output, '<input style="margin:0;" type="checkbox" name="'+o+'"' + (data[o][3] ? ' checked' : '') + (o.indexOf('.') >= 0 ? '' : ' disabled') + '> ' + o, 'style="text-align:left;"');
		o = data[o];
		td(output, o[0].addCommas(), 'style="text-align:right;"');
		td(output, o[1].addCommas() + 'ms', 'style="text-align:right;"');
		td(output, o[2].addCommas() + 'ms', 'style="text-align:right;"');
		td(output, (o[1]/o[0]).addCommas(this.option.digits) + 'ms', 'style="text-align:right;"');
		td(output, (o[2]/o[0]).addCommas(this.option.digits) + 'ms', 'style="text-align:right;"');
		td(output, ((o[2]/o[0])-(o[1]/o[0])).addCommas(this.option.digits) + 'ms', 'style="text-align:right;"');
		tr(list, output.join(''));
	}
	list.push('</tbody></table>');
	$('#golem-dashboard-Debug').html(list.join(''));
	$('#golem-dashboard-Debug thead th:eq('+sort+')').attr('name',(rev ? 'reverse' : 'sort')).append('&nbsp;' + (rev ? '&uarr;' : '&darr;'));
	$('#golem-dashboard-Debug input').change(function() {
		var name = $(this).attr('name');
		Debug.temp[name][3] = !Debug.temp[name][3];
	});
	$('#golem-profile-update').click(function(){Debug._notify('data');});
	$('#golem-profile-reset').click(function(){Debug.temp={};Debug._notify('data');});
};

/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Global:true, History, Page:true, Queue, Resources,
	Battle, Generals, LevelUp, Player,
	APP, APPID, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, Divisor, length, sum, findInObject, objectIndex, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
	makeImage
*/
/********** Worker.Global **********
* Purely here for global options - save having too many system panels
*/
var Global = new Worker('Global');
Global.data = Global.runtime = Global.temp = null;
Global.option = {}; // Left in for config options

Global.settings = {
	system:true,
	unsortable:true,
	no_disable:true,
	taint:true
};

// Use .push() to add our own panel groups
Global.display = [];
/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Dashboard, History:true, Page, Queue, Resources, Land,
	Battle, Generals, LevelUp, Player,
	APP, APPID, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, Divisor, length, sum, findInObject, objectIndex, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime, warn,
	makeImage
*/
/********** Worker.History **********
* History of anything we want.
* Dashboard is exp, income and bank.
*
* History.set('key', value); - sets the current hour's value
* History.set([hour, 'key'], value); - sets the specified hour's value
* History.add('key', value); - adds to the current hour's value (use negative value to subtract)
* History.add([hour, 'key'], value); - adds to the specified hour's value (use negative value to subtract)
*
* History.get('key') - gets current hour's value
* History.get([hour, 'key', 'maths', 'change', recent_hours]) - 'key' is the only non-optional. Must be in this order. Hour = start hour. Recent_hours is 1-168 and the number of hours to get.
* History.get('key.change') - gets change between this and last value (use for most entries to get relative rather than absolute values)
* History.get('key.average') - gets standard deviated mean average of values (use .change for average of changes etc) - http://en.wikipedia.org/wiki/Arithmetic_mean
* History.get('key.geometric') - gets geometric average of values (use .change for average of changes etc) - http://en.wikipedia.org/wiki/Geometric_mean
* History.get('key.harmonic') - gets harmonic average of values (use .change for average of changes etc) - http://en.wikipedia.org/wiki/Harmonic_mean
* History.get('key.mode') - gets the most common value (use .change again if needed)
* History.get('key.median') - gets the center value if all values sorted (use .change again etc)
* History.get('key.total') - gets total of all values added together
* History.get('key.max') - gets highest value (use .change for highest change in values)
* History.get('key.min') - gets lowest value
*/
var History = new Worker('History');
History.option = History.runtime = History.temp = null;

History.settings = {
	system:true,
	taint:true
};

History.dashboard = function() {
	var list = [];
	list.push('<table cellspacing="0" cellpadding="0" class="golem-graph"><thead><tr><th></th><th colspan="73"><span style="float:left;">&lArr; Older</span>72 Hour History<span style="float:right;">Newer &rArr;</span><th></th></th></tr></thead><tbody>');
	list.push(this.makeGraph(['land', 'income'], 'Income', {prefix:'$', goal:{'Average Income':this.get('land.mean') + this.get('income.mean')}}));
	list.push(this.makeGraph('bank', 'Bank', {prefix:'$', goal:Land.runtime.best ? {'Next Land':Land.runtime.cost} : null})); // <-- probably not the best way to do this, but is there a function to get options like there is for data?
	list.push(this.makeGraph('exp', 'Experience', {goal:{'Next Level':Player.get('maxexp')}}));
	list.push(this.makeGraph('favor points', 'Favor Points',{min:0}));
	list.push(this.makeGraph('exp.change', 'Exp Gain', {min:0, goal:{'Average':this.get('exp.average.change'), 'Standard Deviation':this.get('exp.stddev.change')}} )); // , 'Harmonic Average':this.get('exp.harmonic.change') ,'Median Average':this.get('exp.median.change') ,'Mean Average':this.get('exp.mean.change')
	list.push('</tbody></table>');
	$('#golem-dashboard-History').html(list.join(''));
};

History.update = function(event) {
	var i, hour = Math.floor(Date.now() / 3600000) - 168;
	for (i in this.data) {
		if (i < hour) {
			this._set(['data',i]);
		}
	}
};

History.set = function(what, value, type) {
	var x = isArray(what) ? what.slice(0) : isString(what) ? what.split('.') : [];
	if (x.length && !(x[0] in this._datatypes)) {
		if (typeof x[0] !== 'number' && !/^\d+$/i.test(x[0])) {
			x.unshift(Math.floor(Date.now() / 3600000));
		}
		x.unshift('data');
	}
	return this._set(x, value, type);
};

History.add = function(what, value, type) {
	var x = isArray(what) ? what.slice(0) : isString(what) ? what.split('.') : [];
	if (x.length && !(x[0] in this._datatypes)) {
		if (typeof x[0] !== 'number' && !/^\d+$/i.test(x[0])) {
			x.unshift(Math.floor(Date.now() / 3600000));
		}
		x.unshift('data');
	}
	return this._add(x, value, type);
};

History.math = {
	stddev: function(list) {
		var i, l, listsum = 0, mean = this.mean(list);
		for (i = 0, l = list.length; i < l; i++) {
			listsum += Math.pow(list[i] - mean, 2);
		}
		listsum /= list.length;
		return Math.sqrt(listsum);
	},
	average: function(list) {
		var i, l, mean = this.mean(list), stddev = this.stddev(list);
		for (i = 0, l = list.length; i < l; i++) {
			if (Math.abs(list[i] - mean) > stddev * 2) { // The difference between the mean and the entry needs to be in there.
				delete list[i];
			}
		}
		return sum(list) / list.length;
	},
	mean: function(list) {
		return sum(list) / list.length;
	},
	harmonic: function(list) {
		var i, l, num = [];
		for (i = 0, l = list.length; i < l; i++) {
			if (list[i]) {
				num.push(1/list[i]);
			}
		}
		return num.length / sum(num);
	},
	geometric: function(list) {
		var i, l, num = 1;
		for (i = 0, l = list.length; i < l; i++) {
			num *= list[i] || 1;
		}
		return Math.pow(num, 1 / list.length);
	},
	median: function(list) {
		list.sort(function(a,b){return a-b;});
		if (list.length % 2) {
			return (list[Math.floor(list.length / 2)] + list[Math.ceil(list.length / 2)]) / 2;
		}
		return list[Math.floor(list.length / 2)];
	},
	mode: function(list) {
		var i = list.length, j = 0, count = 0, num = {}, max = 0;
		while (i--) {
			num[list[i]] = (num[list[i]] || 0) + 1;
		}
		for (i in num) {
			max = Math.max(max, num[i]);
		}
		for (i in num) {
			if (num[i] >= max) {
				j += i;
				count++;
			}
		}
		return j / count;
	},
	max: function(list) {
		list.sort(function(a,b){return b-a;});
		return list[0];
	},
	min: function(list) {
		list.sort(function(a,b){return a-b;});
		return list[0];
	}
};

History.get = function(what) {
	this._unflush();
	var i, j, value, last, list = [], data = this.data, x = isArray(what) ? what : isString(what) ? what.split('.') : [], hour, past, change = false;
	if (x.length && (isNumber(x[0]) || !x[0].regex(/\D/gi))) {
		hour = x.shift();
	} else {
		hour = Math.floor(Date.now() / 3600000);
	}
	if (x.length && (isNumber(x[x.length-1]) || !x[x.length-1].regex(/\D/gi))) {
		past = Math.range(1, parseInt(x.pop(), 10), 168);
	} else {
		past = 168;
	}
	if (x.length && x[x.length-1] === 'change') {
		x.pop();
		change = true;
	}
	if (!x.length) {
		return data;
	}
	if (x.length === 1) { // We want a single hourly value only
		past = change ? 1 : 0;
	}
	for (i=hour-past; i<=hour; i++) {
		if (data[i]) {
			last = value;
			value = null;
			for (j in data[i]) {
				if ((j === x[0] || j.indexOf(x[0] + '+') === 0) && isNumber(data[i][j])) {
					value = (value || 0) + data[i][j];
				}
			}
			if (x.length > 1 && isNumber(value)) {
				if (!change) {
					list.push(value);
				} else if (isNumber(last)) {
					list.push(value - last);
					if (isNaN(list[list.length - 1])) {
						log(LOG_WARN, 'NaN: '+value+' - '+last);
					}
				}
			}
		}
	}
	if (x.length === 1) {
		return change ? value - last : value;
	}
	if (History.math[x[1]]) {
		return History.math[x[1]](list);
	}
	throw('Wanting to get unknown History type ' + x[1] + ' on ' + x[0]);
};

History.getTypes = function(what) {
	var i, list = [], types = {}, data = this.data, x = what + '+';
	for (i in data) {
		if (i.indexOf(x) === 0) {
			types[i] = true;
		}
	}
	for (i in types) {
		list.push(i);
	}
	return list;
};

History.makeGraph = function(type, title, options) {
	var i, j, count, min = isNumber(options.min) ? options.min : Number.POSITIVE_INFINITY, max = isNumber(options.max) ? options.max : Number.NEGATIVE_INFINITY, max_s, min_s, goal_s = [], list = [], bars = [], output = [], value = {}, goalbars = '', divide = 1, suffix = '', hour = Math.floor(Date.now() / 3600000), numbers, prefix = options.prefix || '', goal;
	if (isNumber(options.goal)) {
		goal = [options.goal];
	} else if (!isArray(options.goal) && !isObject(options.goal)) {
		goal = null;
	} else {
		goal = options.goal;
	}
	if (goal && length(goal)) {
		for (i in goal) {
			if (goal.hasOwnProperty(i)) {
				min = Math.min(min, goal[i]);
				max = Math.max(max, goal[i]);
			}
		}
	}
	if (isString(type)) {
		type = [type];
	}
	for (i=hour-72; i<=hour; i++) {
		value[i] = [0];
		if (this.data[i]) {
			for (j in type) {
				if (type.hasOwnProperty(j)) {
					value[i][j] = this.get(i + '.' + type[j]);
				}
			}
			if ((j = sum(value[i]))) {
				min = Math.min(min, j);
				max = Math.max(max, j);
			}
		}
	}
	if (max >= 1000000000) {
		divide = 1000000000;
		suffix = 'b';
	} else if (max >= 1000000) {
		divide = 1000000;
		suffix = 'm';
	} else if (max >= 1000) {
		divide = 1000;
		suffix = 'k';
	}
	max = Math.ceil(max / divide) * divide;
	max_s = prefix + (max / divide).addCommas() + suffix;
	min = Math.floor(min / divide) * divide;
	min_s = prefix + (min / divide).addCommas() + suffix;
	if (goal && length(goal)) {
		for (i in goal) {
			if (goal.hasOwnProperty(i)) {
				bars.push('<div style="bottom:' + Math.max(Math.floor((goal[i] - min) / (max - min) * 100), 0) + 'px;"></div>');
				goal_s.push('<div' + (typeof i !== 'number' ? ' title="'+i+'"' : '') + ' style="bottom:' + Math.range(2, Math.ceil((goal[i] - min) / (max - min) * 100)-2, 92) + 'px;">' + prefix + (goal[i] / divide).addCommas(1) + suffix + '</div>');
			}
		}
		goalbars = '<div class="goal">' + bars.reverse().join('') + '</div>';
		goal_s.reverse();
	}
	th(list, '<div>' + max_s + '</div><div>' + title + '</div><div>' + min_s + '</div>');
	for (i=hour-72; i<=hour; i++) {
		bars = [];
		output = [];
		numbers = [];
		title = (hour - i) + ' hour' + ((hour - i)===1 ? '' : 's') +' ago';
		count = 0;
		for (j in value[i]) {
			if (value[i].hasOwnProperty(j)) {
				bars.push('<div style="height:' + Math.max(Math.ceil(100 * (value[i][j] - (!count ? min : 0)) / (max - min)), 0) + 'px;"></div>');
				count++;
				if (value[i][j]) {
					numbers.push((value[i][j] ? prefix + value[i][j].addCommas() : ''));
				}
			}
		}
		output.push('<div class="bars">' + bars.reverse().join('') + '</div>' + goalbars);
		numbers.reverse();
		title = title + (numbers.length ? ', ' : '') + numbers.join(' + ') + (numbers.length > 1 ? ' = ' + prefix + sum(value[i]).addCommas() : '');
		td(list, output.join(''), 'title="' + title + '"');
	}
	th(list, goal_s.join(''));
	return '<tr>' + list.join('') + '</tr>';
};

/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$:true, Worker, Army, Main:true, History, Page:true, Queue, Resources,
	Battle, Generals, LevelUp, Player,
	APP:true, APPID:true, APPNAME:true, userID:true, imagepath:true, isRelease, version, revision, Workers, PREFIX:true, Images, window, browser,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, Divisor, length, sum, findInObject, objectIndex, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
	makeImage, unsafeWindow, log, warn, error, chrome, GM_addStyle, GM_getResourceText
*/
/********** Worker.Main **********
* Initial kickstart of Golem.
*/
var Main = new Worker('Main');
Main.data = Main.option = Main.runtime = Main.temp = null;

Main.settings = {
	system:true,
	taint:true // Doesn't store any data, but still cleans it up lol
};

Main._apps_ = {};
Main._retry_ = 0;
Main._jQuery_ = false; // Only set if we're loading it

// Use this function to add more applications, "app" must be the pathname of the app under facebook.com, appid is the facebook app id, appname is the human readable name
Main.add = function(app, appid, appname) {
	this._apps_[app] = [appid, appname];
};

Main.parse = function() {
	try {
		var newpath = $('#app_content_'+APPID+' img:eq(0)').attr('src').pathpart();
		if (newpath) {
			imagepath = newpath;
		}
	} catch(e) {}
};

Main.update = function(event) {
	var i, old_revision = parseInt(getItem('revision') || 1061); // Added code to support Revision checking in 1062;
	if (event.id === 'kickstart') {
		if (old_revision > revision) {
			if (!confirm('GAME-GOLEM WARNING!!!' + "\n\n" +
				'You have reverted to an earlier version of GameGolem!' + "\n\n" +
				'This may result in errors or other unexpected actions!' + "\n\n" +
				'Are you sure you want to use this earlier version?' + "\n" +
				'(selecting "Cancel" will prevent Golem from running and preserve your current data)')) {
				return;
			}
			log(LOG_INFO, 'GameGolem: Reverting from r' + old_revision + ' to r' + revision);
		} else if (old_revision < revision) {
			log(LOG_INFO, 'GameGolem: Updating ' + APPNAME + ' from r' + old_revision + ' to r' + revision);
		}
		for (i in Workers) {
			Workers[i]._setup(old_revision);
		}
		for (i in Workers) {
			Workers[i]._init(old_revision);
		}
		for (i in Workers) {
			Workers[i]._update({type:'init', self:true}, 'run');
		}
		if (old_revision !== revision) {
			setItem('revision', revision);
		}
	}
	if (event.id !== 'startup') {
		return;
	}
	// Let's get jQuery running
	if (!$ || !$.support || !$.ui) {
		if (!this._jQuery_) {
			var head = document.getElementsByTagName('head')[0] || document.documentElement, a = document.createElement('script'), b = document.createElement('script');
			a.type = b.type = 'text/javascript';
			a.src = 'http://cloutman.com/jquery-latest.min.js';		// 'http://ajax.googleapis.com/ajax/libs/jquery/1.4.4/jquery.min.js';
			b.src = 'http://cloutman.com/jquery-ui-latest.min.js';	// 'http://ajax.googleapis.com/ajax/libs/jqueryui/1.8.6/jquery-ui.min.js';
			head.appendChild(a);
			head.appendChild(b);
			log(LOG_INFO, 'GameGolem: Loading jQuery & jQueryUI');
			this._jQuery_ = true;
		}
		if (!(unsafeWindow || window).jQuery || !(unsafeWindow || window).jQuery.support || !(unsafeWindow || window).jQuery.ui) {
			this._remind(0.1, 'startup');
			return;
		}
		$ = (unsafeWindow || window).jQuery.noConflict(true);
	}
	// Identify Application
	if (!APP) {
		if (empty(this._apps_)) {
			log(LOG_INFO, 'GameGolem: No applications known...');
		}
		for (i in this._apps_) {
			if (window.location.pathname.indexOf(i) === 1) {
				APP = i;
				APPID = this._apps_[i][0];
				APPNAME = this._apps_[i][1];
				PREFIX = 'golem'+APPID+'_';
				log(LOG_INFO, 'GameGolem: Starting '+APPNAME);
				break;
			}
		}
		if (typeof APP === 'undefined') {
			log(LOG_INFO, 'GameGolem: Unknown application...');
			return;
		}
	}
	// Once we hit this point we have our APP and can start things rolling
	try {
		//userID = (unsafeWindow || window).presence && parseInt((unsafeWindow || window).presence.user); //$('script').text().regex(/user:(\d+),/i);
		userID = $('script').text().regex(/user:(\d+),/i);
		imagepath = $('#app_content_'+APPID+' img:eq(0)').attr('src').pathpart();
	} catch(e) {
		if (Main._retry_++ < 5) {// Try 5 times before we give up...
			this._remind(1, 'startup');
			return;
		}
	}
	if (!userID || !imagepath || typeof userID !== 'number' || userID === 0) {
		log(LOG_INFO, 'ERROR: Bad Page Load!!!');
		window.setTimeout(Page.reload, 5000); // Force reload without retrying
		return;
	}
	// jQuery selector extensions
	$.expr[':'].css = function(obj, index, meta, stack) { // $('div:css(width=740)')
		var args = meta[3].regex(/([\w-]+)\s*([<>=]+)\s*(\d+)/), value = parseFloat($(obj).css(args[0]));
		switch(args[1]) {
			case '<':	return value < args[2];
			case '<=':	return value <= args[2];
			case '>':	return value > args[2];
			case '>=':	return value >= args[2];
			case '=':
			case '==':	return value === args[2];
			case '!=':	return value !== args[2];
			default:
				log(LOG_ERROR, 'Bad jQuery selector: $:css(' + args[0] + ' ' + args[1] + ' ' + args[2] + ')');
				return false;
		}
	};
	$.expr[':'].golem = function(obj, index, meta, stack) { // $('input:golem(worker,id)') - selects correct id
		var args = meta[3].toLowerCase().split(',');
		return $(obj).attr('id') === PREFIX + args[0].trim().replace(/[^0-9a-z]/g,'-') + '_' + args[1].trim();
	};
	// jQuery extra functions
	$.fn.autoSize = function() {
		function autoSize(e) {
			var p = (e = e.target || e), s;
			if (e.oldValueLength !== e.value.length) {
				while (p && !p.scrollTop) {p = p.parentNode;}
				if (p) {s = p.scrollTop;}
				e.style.height = '0px';
				e.style.height = e.scrollHeight + 'px';
				if (p) {p.scrollTop = s;}
				e.oldValueLength = e.value.length;
			}
			return true;
		}
		this.filter('textarea').each(function(){
			$(this).css({'resize':'none','overflow-y':'hidden'}).unbind('.autoSize').bind('keyup.autoSize keydown.autoSize change.autoSize', autoSize);
			autoSize(this);
		});
		return this;
	};
	$.fn.selected = function() {
		return $(this).filter(function(){return this.selected;});
	};
	// Now we're rolling
	if (browser === 'chrome' && chrome && chrome.extension && chrome.extension.getURL) {
		$('head').append('<link href="' + chrome.extension.getURL('golem.css') + '" rel="stylesheet" type="text/css">');
	} else if (browser === 'greasemonkey' && GM_addStyle && GM_getResourceText) {
		GM_addStyle(GM_getResourceText('stylesheet'));
	} else {
		$('head').append('<link href="http://game-golem.googlecode.com/svn/trunk/golem.css" rel="stylesheet" type="text/css">');
	}
//	window.onbeforeunload = Worker.flush; // Make sure we've saved everything before quitting - not standard in all browsers
	this._remind(0, 'kickstart'); // Give a (tiny) delay for CSS files to finish loading etc
};

if (!Main.loaded) { // Prevent double-start
	log(LOG_INFO, 'GameGolem: Loading...');
	Main._loaded = true;// Otherwise .update() will never fire - no init needed for us as we're the one that calls it
	Main._update({type:'startup', id:'startup'});
}

/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page:true, Queue, Resources, Global,
	Battle, Generals, LevelUp, Player,
	APP, APPID, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, Divisor, length, sum, findInObject, objectIndex, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
	makeImage, log, warn, error
*/
/********** Worker.Page() **********
* All navigation including reloading
*/
var Page = new Worker('Page');

Page.settings = {
	system:true,
	keep:true,
	taint:true
};

Page.option = {
	timeout:15,
	reload:5,
	nochat:false,
	refresh:250
};

Page.temp = {
	loading:false,
	last:'', // Last url we tried to load
	when:null,
	retry:0, // Number of times we tried before hitting option.reload
	checked:false, // Finished checking for new pages
	count:0
};

Page.lastclick = null;

Page.runtime = {
	delay:0, // Delay used for bad page load - reset in Page.clear(), otherwise double to a max of 5 minutes
	timers:{}, // Tickers being displayed
	stale:{}
};

Page.page = '';

Page.pageNames = {}; //id:{url:'...', image:'filename.jpg', selector:'jquery selector'}

Global.display.push({
	title:'Page Loading',
	group:[
		{
			id:['Page','option','timeout'],
			label:'Retry after',
			select:[10, 15, 30, 60],
			after:'seconds'
		},{
			id:['Page','option','reload'],
			label:'Reload after',
			select:[3, 5, 7, 9, 11, 13, 15],
			after:'tries'
		},{
			id:['Page','option','nochat'],
			label:'Remove Facebook Chat',
			checkbox:true,
			help:'This does not log you out of chat, only hides it from display and attempts to stop it loading - you can still be online in other facebook windows'
		},{
			id:['Page','option','refresh'],
			label:'Refresh After',
			select:{0:'Never', 50:'50 Pages', 100:'100 Pages', 150:'150 Pages', 200:'200 Pages', 250:'250 Pages', 500:'500 Pages'}
		}
	]
});

// We want this to run on the Global context
Global._overload(null, 'work', function(state) {
	var i, l, list, found = null;
	if (!Page.temp.checked) {
		for (i in Workers) {
			if (isString(Workers[i].pages)) {
				list = Workers[i].pages.split(' ');
				for (l=0; l<list.length; l++) {
					if (list[l] !== '*' && list[l] !== 'facebook' && Page.pageNames[list[l]] && !Page.pageNames[list[l]].skip && !Page.data[list[l]] && list[l].indexOf('_active') === -1) {
						found = list[l];
						break;
					}
				}
			}
			if (found) {
				break;
			}
		}
		if (found) {
			if (!state) {
				return QUEUE_CONTINUE;
			}
			Page.to(found);
			Page._set(['data', found], Date.now()); // Even if it's broken, we need to think we've been there!
			return QUEUE_CONTINUE;
		}
	//	arguments.callee = new Function();// Only check when first loading, once we're running we never work() again :-P
		Page.set(['temp','checked'], true);
	}
	if (Page.option.refresh && Page.temp.count >= Page.option.refresh) {
		if (state) {
			if (!$('#reload_link').length) {
				$('body').append('<a id="reload_link" href="http://www.cloutman.com/reload.php">reload</a>');
			}
			Page.click('#reload_link');
		}
		return QUEUE_CONTINUE;
	}
	return this._parent();
});

Page.init = function() {
	// BEGIN: Fix for before Config supported path'ed set
	if (Global.get(['option','page'], false)) {
		this.set(['option','timeout'], Global.get(['option','page','timeout'], this.option.timeout));
		this.set(['option','reload'], Global.get(['option','page','reload'], this.option.reload));
		this.set(['option','nochat'], Global.get(['option','page','nochat'], this.option.nochat));
		this.set(['option','refresh'], Global.get(['option','page','refresh'], this.option.refresh));
		Global.set(['option','page']);
	}
	// END
	this._trigger('#app46755028429_app_body_container, #app46755028429_globalContainer', 'page_change');
	this._trigger('.generic_dialog_popup', 'facebook');
	if (this.option.nochat) {
		$('#fbDockChat').hide();
	}
	$('.golem-link').live('click', function(event){
		if (!Page.to($(this).attr('href'), null, false)) {
			return false;
		}
	});
	this._revive(1, 'timers');// update() once every second to update any timers
};

Page.update_reminder = function(event) {
	if (event.id === 'timers') {
		var i, now = Date.now(), time;
		for (i in this.runtime.timers) {
			time = (this.runtime.timers[i] - now) / 1000;
			if (time <= -604800) { // Delete old timers 1 week after "now?"
				this.set(['runtime','timers',i]);
			} else {
				$('#'+i).text(time > 0 ? makeTimer(time) : 'now?')
			}
		}
	} else {
		this.update(event);
	}
};

Page.update = function(event) {
	// Can use init as no system workers (which can come before us) care what page we are on
	if (event.type === 'init' || event.type === 'trigger') {
		var i, list;
		if (event.type === 'init' || event.id === 'page_change') {
			list = ['#app_content_'+APPID, '#app46755028429_globalContainer', '#app46755028429_globalcss', '#app46755028429_main_bntp', '#app46755028429_main_sts_container', '#app46755028429_app_body_container', '#app46755028429_nvbar', '#app46755028429_current_pg_url', '#app46755028429_current_pg_info'];
//			log('Page change noticed...');
			this._forget('retry');
			this.set(['temp','loading'], false);
			for (i=0; i<list.length; i++) {
				if (!$(list[i]).length) {
					log(LOG_WARN, 'Bad page warning: Unabled to find '+list[i]);
					this.retry();
					return;
				}
			}
			// NOTE: Need a better function to identify pages, this lot is bad for CPU
			this.page = '';
			$('img', $('#app46755028429_app_body')).each(function(i,el){
				var i, filename = $(el).attr('src').filepart();
				for (i in Page.pageNames) {
					if (Page.pageNames[i].image && filename === Page.pageNames[i].image) {
						Page.page = i;
//						log(LOG_DEBUG, 'Page:' + Page.page);
						return;
					}
				}
			});
			if (this.page === '') {
				for (i in Page.pageNames) {
					if (Page.pageNames[i].selector && $(Page.pageNames[i].selector).length) {
//						log(LOG_DEBUG, 'Page:' + Page.page);
						Page.page = i;
					}
				}
			}
			if (this.page !== '') {
				this.set(['data',this.page], Date.now());
				this.set(['runtime', 'stale', this.page]);
			}
//			log(LOG_WARN, 'Page.update: ' + (this.page || 'Unknown page') + ' recognised');
			list = {};
			for (i in Workers) {
				if (Workers[i].parse
				 && Workers[i].pages
				 && (Workers[i].pages.indexOf('*') >= 0 || (this.page !== '' && Workers[i].pages.indexOf(this.page) >= 0))
				 && Workers[i]._parse(false)) {
					list[i] = true;
				}
			}
			for (i in list) {
				Workers[i]._parse(true);
			}
		} else if (event.id === 'facebook') { // Need to act as if it's a page change
			this._forget('retry');
			this.set(['temp', 'loading'], false);
			for (i in Workers) {
				if (Workers[i].parse && Workers[i].pages && Workers[i].pages.indexOf('facebook') >= 0) {
					Workers[i]._parse('facebook');
				}
			}
		}
	} else if (event.type === 'reminder' && event.id === 'retry') {
		this.retry();
	}
};

Page.makeURL = function(url, args) {
	var abs = 'apps.facebook.com/' + APP + '/';
	if (url in this.pageNames) {
		url = this.pageNames[url].url;
	} else {
		if (url.indexOf(abs) !== -1) {// Absolute url within app
			url = url.substr(abs.length);
		}
	}
	if (isString(args) && args.length) {
		url += (/^\?/.test(args) ? '' : '?') + args;
	} else if (isObject(args)) {
		url += '?' + decodeURIComponent($.param(args));
	}
	return url;
};

Page.makeLink = function(url, args, content) {
	var page = this.makeURL(url, args);
	return '<a href="' + window.location.protocol + '//apps.facebook.com/' + APP + '/' + page + '" onclick="' + 'a46755028429_ajaxLinkSend(&#039;globalContainer&#039;,&#039;' + page + '&#039;);return false;' + '">' + content + '</a>';
};

/*
Page.to('index', ['args' | {arg1:val, arg2:val},] [true|false]
*/
Page.to = function(url, args, force) { // Force = true/false (allows to reload the same page again)
	var page = this.makeURL(url, args);
//	if (Queue.option.pause) {
//		log(LOG_ERROR, 'Trying to load page when paused...');
//		return true;
//	}
	if (!page || (!force && page === (this.temp.last || this.page))) {
		return true;
	}
	if (page !== (this.temp.last || this.page)) {
		this.clear();
		this.set(['temp','last'], page);
		this.set(['temp','when'], Date.now());
		this.set(['temp','loading'], true);
		log('Navigating to ' + page);
	} else if (force) {
		window.location.href = 'javascript:void((function(){})())';// Force it to change
	}
	window.location.href = /^https?:/i.test(page) ? page : 'javascript:void(a46755028429_ajaxLinkSend("globalContainer","' + page + '"))';
	this._remind(this.option.timeout, 'retry');
	this.set(['temp','count'], this.get(['temp','count'], 0) + 1);
	return false;
};

Page.retry = function() {
	if (this.temp.reload || ++this.temp.retry >= this.option.reload) {
		this.reload();
	} else if (this.temp.last) {
		log(LOG_WARN, 'Page load timeout, retry '+this.temp.retry+'...');
		this.to(this.temp.last, null, true);// Force
	} else if (this.lastclick) {
		log(LOG_WARN, 'Page click timeout, retry '+this.temp.retry+'...');
		this.click(this.lastclick);
	} else {
		// Probably a bad initial page load...
		// Reload the page - but use an incrimental delay - every time we double it to a maximum of 5 minutes
		var delay = this.set(['runtime','delay'], Math.max((this.get(['runtime','delay'], 0) * 2) || this.get(['option','timeout'], 10), 300));
		this.set(['temp','reload'], true);
		this.set(['temp','loading'], true);
		this._remind(delay,'retry',{worker:this, type:'init'});// Fake it to force a re-check
		$('body').append('<div style="position:absolute;top:100;left:0;width:100%;"><div style="margin:auto;font-size:36px;color:red;">ERROR: Reloading in ' + Page.addTimer('reload',delay * 1000, true) + '</div></div>');
		log(LOG_ERROR, 'Unexpected retry event.');
	}
};
		
Page.reload = function() {
	log('Page.reload()');
	window.location.replace(window.location.href);
};

Page.clearFBpost = function(obj) {
	var i, output = [];
	for (i=0; i<obj.length; i++) {
		if (obj[i].name.indexOf('fb_') !== 0) {
			output.push(obj[i]);
		}
	}
	if (!output.bqh && $('input[name=bqh]').length) {
		output.push({name:'bqh', value:$('input[name=bqh]').first().val()});
	}
	return output;
};

Page.click = function(el) {
	if (!$(el).length) {
		log(LOG_ERROR, 'Page.click: Unable to find element - '+el);
		return false;
	}
	var e, element = $(el).get(0);
	if (this.lastclick !== el) {
		this.clear();
	}
	this.set(['runtime', 'delay'], 0);
	this.lastclick = el; // Causes circular reference when watching...
	this.set(['temp','when'], Date.now());
	this.set(['temp','loading'], true);
	e = document.createEvent("MouseEvents");
	e.initEvent("click", true, true);
	(element.wrappedJSObject ? element.wrappedJSObject : element).dispatchEvent(e);
	this._remind(this.option.timeout, 'retry');
	this.set(['temp','count'], this.get(['temp','count'], 0) + 1);
	return true;
};

Page.clear = function() {
	this.lastclick = null;
	this.set(['temp','last'], null);
	this.set(['temp','when'], null);
	this.set(['temp','retry'], 0);
	this.set(['temp','reload'], 0);
	this.set(['temp','loading'], false);
	this.set(['runtime','delay'], 0);
};

Page.addTimer = function(id, time, relative) {
	if (relative) {
		time = Date.now() + time;
	}
	this.set(['runtime','timers','golem_timer_'+id], time);
	return '<span id="golem_timer_'+id+'">' + makeTimer((time - Date.now()) / 1000) + '</span>';
};

Page.delTimer = function(id) {
	this.set(['runtime','timers','golem_timer_'+id]);
};

/*
 * Set a value in one of our _datatypes
 * @param {string} page The page we need to visit
 * @param {number} age How long is it allowed to be stale before we need to visit it again (in seconds), use -1 for "now"
 * @param {boolean} go Automatically call Page.to(page)
 * @return {boolean} True if we don't need to visit the page, false if we do
 */
Page.stale = function(page, age, go) {
	if (age && (page in this.pageNames)) {
		var now = Date.now();
		if (this.data[page] < now - (age * 1000)) {
			if (go && !this.to(page)) {
				this.set(['data',page], now);
			}
			return false;
		}
	}
	return true;
};

/*
 * Mark a page as stale, hinting to relevant workers that it needs a visit.
 * @param {string} page The page to mark as stale
 * @param {number} [when=Date.now()] Optional point when the page became stale.
 */
Page.setStale = function(page, when) {
	var now = Date.now(),
		seen = this.get(['data',page], 0, 'number'),
		want = this.get(['runtime','stale',page], 0, 'number');

	// don't let this be negative (pre 1970) or future (past "now")
	if (!isNumber(when) || when < 0 || when > now || want > now) {
		when = now;
	}

	// maintain the later date if ours is older
	if (seen >= when && seen >= want) {
		this.set(['runtime','stale',page]);
	} else if (want < when || want > now) {
		this.set(['runtime','stale',page], Math.round(when));
	}
};

/*
 * Test if a page is considered stale.
 * @param {string} page The page to check for staleness
 * @param {number} [when] Optional check against a specific time.
 * @return {boolean} True if the page is considered stale.
 */
Page.isStale = function(page, when) {
	var seen = this.get(['data',page], 0, 'number'),
		want = this.get(['runtime','stale',page], 0, 'number');

	if (isNumber(when) && want < when) {
		want = when;
	}

	// never seen or older than our stale mark
	return !seen || seen < want;
};
/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page, Queue:true, Resources, Window,
	Battle, Generals, LevelUp, Player,
	APP, APPID, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, window, browser,
	makeTimer, Divisor, length, sum, findInObject, objectIndex, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
	makeImage
*/
/********** Worker.Queue() **********
* Keeps track of the worker queue
*/
var Queue = new Worker('Queue');
Queue.data = null;

// worker.work() return values for stateful - ie, only let other things interrupt when it's "safe"
var QUEUE_FINISH	= 0;// Finished everything, let something else work
var QUEUE_NO_ACTION	= QUEUE_FINISH;// Finished everything, let something else work
var QUEUE_CONTINUE	= 1;// Not finished at all, don't interrupt
var QUEUE_RELEASE	= 2;// Not quite finished, but safe to interrupt 
var QUEUE_INTERRUPT_OK	= QUEUE_RELEASE;// Not quite finished, but safe to interrupt 
// worker.work() can also return true/false for "continue"/"finish" - which means they can be interrupted at any time

Queue.settings = {
	system:true,
	keep:true,
	taint:true
};

// NOTE: ALL THIS CRAP MUST MOVE, Queue is a *SYSTEM* worker, so it must know nothing about CA workers or data
Queue.runtime = {
	current:null
};

Queue.option = {
	queue: ['Global', 'Debug', 'Resources', 'Generals', 'Income', 'LevelUp', 'Elite', 'Quest', 'Monster', 'Battle', 'Arena', 'Heal', 'Land', 'Town', 'Bank', 'Alchemy', 'Blessing', 'Gift', 'Upgrade', 'Potions', 'Army', 'Idle'],//Must match worker names exactly - even by case
	delay: 5,
	clickdelay: 5,
	pause: false
};

Queue.temp = {
	delay:-1
};

Global.display.push({
	title:'Running',
	group:[
		{
			id:['Queue','option','delay'],
			label:'Delay Between Events',
			number:true,
			after:'secs',
			min:1,
			max:30
		},{
			id:['Queue','option','clickdelay'],
			label:'Delay After Mouse Click',
			number:true,
			after:'secs',
			min:1,
			max:60,
			help:'This should be a multiple of Event Delay'
		}
	]
});

Queue.lastclick = Date.now();	// Last mouse click - don't interrupt the player

Queue.init = function(old_revision) {
	var i, $btn, worker;
	// BEGIN: Moving stats into Resources
	if (old_revision <= 1095) {
		if (this.option.energy) {
			Resources.set(['option','reserve','energy'], this.option.energy);
			this.set(['option','energy']);
			this.set(['option','start_energy']);
		}
		if (this.option.stamina) {
			Resources.set(['option','reserve','stamina'], this.option.stamina);
			this.set(['option','stamina']);
			this.set(['option','start_stamina']);
		}
		this.set(['runtime','quest']);
		this.set(['runtime','general']);
		this.set(['runtime','action']);
		this.set(['runtime','stamina']);
		this.set(['runtime','energy']);
		this.set(['runtime','force']);
		this.set(['runtime','burn']);
		this.set(['runtime','big']);
		this.set(['runtime','basehit']);
		this.set(['runtime','levelup']);
	}
	// END
	this.option.queue = this.option.queue.unique();
	for (i in Workers) {
		if (Workers[i].work && Workers[i].display) {
			this._watch(Workers[i], 'option._disabled');// Keep an eye out for them going disabled
			if (!this.option.queue.find(i)) {// Add any new workers that have a display (ie, sortable)
				log('Adding '+i+' to Queue');
				if (Workers[i].settings.unsortable) {
					this.option.queue.unshift(i);
				} else {
					this.option.queue.push(i);
				}
			}
		}
	}
	for (i=0; i<this.option.queue.length; i++) {// Then put them in saved order
		worker = Workers[this.option.queue[i]];
		if (worker && worker.display) {
			if (this.runtime.current && worker.name === this.runtime.current) {
				log(LOG_INFO, 'Trigger '+worker.name+' (continue after load)');
				$('#'+worker.id+' > h3').css('font-weight', 'bold');
			}
			$('#golem_config').append($('#'+worker.id));
		}
	}
	$(document).bind('click keypress', function(event){
		if (!event.target || !$(event.target).parents().is('#golem_config_frame,#golem-dashboard')) {
			Queue.lastclick=Date.now();
		}
	});
	Config.addButton({
		id:'golem_pause',
		image:this.option.pause ? 'play' : 'pause',
		className:this.option.pause ? 'red' : 'green',
		prepend:true,
		title:'Pause',
		click:function() {
			var pause = Queue.set(['option','pause'], !Queue.option.pause);
			log(LOG_INFO, 'State: ' + (pause ? "paused" : "running"));
			$(this).toggleClass('red green').attr('src', getImage(pause ? 'play' : 'pause'));
			if (!pause) {
				$('#golem_step').remove();
			} else if (Config.get(['option','debug'], false)) {
				Config.addButton({
					id:'golem_step',
					image:'step',
					className:'green',
					after:'golem_pause',
					click:function() {
						$(this).toggleClass('red green');
						Queue._update({type:'reminder'}, 'run'); // A single shot
						$(this).toggleClass('red green');
					}
				});
			}
			Queue.clearCurrent();
		}
	});
	// Running the queue every second, options within it give more delay
	this._watch(Page, 'temp.loading');
	this._watch(Session, 'temp.active');
	this._watch(Queue, 'option.pause');
	Title.alias('pause', 'Queue:option.pause:(Pause) ');
	Title.alias('worker', 'Queue:runtime.current::None');
};

Queue.clearCurrent = function() {
//	var current = this.get('runtime.current', null);
//	if (current) {
		$('#golem_config > div > h3').css('font-weight', 'normal');
		this.set(['runtime','current'], null);// Make sure we deal with changed circumstances
//	}
};

Queue.update = function(event, events) {
	var i, $worker, worker, current, result, now = Date.now(), next = null, release = false, ensta = ['energy','stamina'];
	for (i=0; i<events.length; i++) {
		if (isEvent(events[i], null, 'watch', 'option._disabled')) { // A worker getting disabled / enabled
			if (events[i].worker.get(['option', '_disabled'], false)) {
				$('#'+events[i].worker.id+' .golem-panel-header').addClass('red');
				if (this.runtime.current === events[i].worker.name) {
					this.clearCurrent();
				}
			} else {
				$('#'+events[i].worker.id+' .golem-panel-header').removeClass('red');
			}
		} else if (isEvent(events[i], null, 'watch') || isEvent(events[i], null, 'init')) { // loading a page, pausing, or init
			if (this.get(['option','pause']) || Page.get(['temp','loading']) || !Session.get(['temp','active'])) {
				this._forget('run');
				this.set(['temp','delay'], -1);
			} else if (this.option.delay !== this.temp.delay) {
				this._revive(this.option.delay, 'run');
				this.set(['temp','delay'], this.option.delay);
			}
		}
	}
	if (this.get(['temp','delay'], -1) !== -1 && events.findEvent(null,'reminder') >= 0) { // This is where we call worker.work() for everyone
		if (now - this.lastclick < this.option.clickdelay * 1000) { // Want to make sure we delay after a click
			return;
		}
		for (i in Workers) { // Run any workers that don't have a display, can never get focus!!
			if (Workers[i].work && !Workers[i].display && !Workers[i].get(['option', '_disabled'], false) && !Workers[i].get(['option', '_sleep'], false)) {
//				log(LOG_DEBUG, Workers[i].name + '.work(false);');
				Workers[i]._unflush();
				Workers[i]._work(false);
			}
		}
		for (i=0; i<this.option.queue.length; i++) {
			worker = Workers[this.option.queue[i]];
			if (!worker || !worker.work || !worker.display || worker.get(['option', '_disabled'], false) || worker.get(['option', '_sleep'], false)) {
				if (worker && this.runtime.current === worker.name) {
					this.clearCurrent();
				}
				continue;
			}
//			log(LOG_DEBUG, worker.name + '.work(' + (this.runtime.current === worker.name) + ');');
			if (this.runtime.current === worker.name) {
				worker._unflush();
				result = worker._work(true);
				if (result === QUEUE_RELEASE) {
					release = true;
				} else if (!result) {// false or QUEUE_FINISH
					this.clearCurrent();
				}
			} else {
				result = worker._work(false);
			}
			if (!worker.settings.stateful && typeof result === 'number') {// QUEUE_* are all numbers
				worker.settings.stateful = true;
			}
			if (!next && result) {
				next = worker; // the worker who wants to take over
			}
		}
		current = this.runtime.current ? Workers[this.runtime.current] : null;
		if (next !== current && (!current || !current.settings.stateful || next.settings.important || release)) {// Something wants to interrupt...
			this.clearCurrent();
			log(LOG_INFO, 'Trigger ' + next.name);
			this.set(['runtime','current'], next.name);
			if (next.id) {
				$('#'+next.id+' > h3').css('font-weight', 'bold');
			}
		}
//		log(LOG_DEBUG, 'End Queue');
	}
	return true;
};

Queue.menu = function(worker, key) {
	if (worker) {
		if (!key) {
			if (worker.work && !worker.settings.no_disable) {
				return ['enable:' + (worker.get(['option','_disabled'], false) ? '-Disabled' : '+Enabled')];
			}
		} else if (key === 'enable') {
			worker.set(['option','_disabled'], worker.option._disabled ? undefined : true);
		}
	}
};

/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page, Queue, Resources:true,
	Battle, Generals, LevelUp, Player,
	APP, APPID, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, Divisor, length, sum, findInObject, objectIndex, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
	makeImage
*/
/********** Worker.Resources **********
* Store and report Resources

Workers can add a type of Resources that they supply - Player would supply Energy and Stamina when parsing etc
Workers request buckets of Resourcess during init() - each bucket gets a display in the normal Resources config panel.

Items can be added as a type - *however* - they should be added with an amount and not as a spendable type by only calling Resources.add(type,amount)
Convention for unspendable Resourcess is to prefix the name with an underscore, ie. "_someitemimage.jpg" (needs to be unique)

Data can be stored for types by using Resourec.set([type, key], value); etc - this makes it "safer" for workers to discuss needs ;-)
Data can be stored at multiple levels deep - simply add extra keys - [type, key1, key2]

Resources stores the buckets as well as an overflow bucket - the overflow is used during level up

Buckets may be either -
"Shared" buckets are like now - first-come, first-served from a single source
- or -
"Exclusive" buckets are filled by a drip system, forcing workers to share Resourcess

The Shared bucket has a priority of 0

When there is a combination of Shared and Exclusive, the relative priority of the buckets are used - total of all priorities / number of buckets.
Priority is displayed as Disabled, -4, -3, -2, -1, 0, +1, +2, +3, +4, +5

When a worker is disabled (worker.get(['option', '_disabled'], false)) then it's bucket is completely ignored and Resourcess are shared to other buckets.

Buckets are filled in priority order, in cases of same priority, alphabetical order is used
*/

var Resources = new Worker('Resources');
Resources.temp = null;

Resources.settings = {
	system:true,
	unsortable:true,
	no_disable:true
};

Resources.data = {// type:{data} - managed by any access...
};

Resources.option = {
	types:{},
	reserve:{},
	buckets:{}
};

Resources.runtime = {
	types:{},// {'Energy':true}
	buckets:{}
};

//Resources.display = 'Discovering Resources...';

Resources.display = function() {
	var type, group, worker, display = [];
	if (!length(this.runtime.types)) {
		return 'No Resources to be Used...';
	}
	display.push({title:'IMPORTANT', label:'Only the Reserve option is currently active...'});
	for (type in this.option.types) {
		group = [];
		for (worker in this.runtime.buckets) {
			if (type in this.runtime.buckets[worker]) {
				group.push({
					id:'buckets.'+worker+'.'+type,
					label:'...<b>'+worker+'</b> priority',
					select:{10:'+5',9:'+4',8:'+3',7:'+2',6:'+1',5:'0',4:'-1',3:'-2',2:'-3',1:'-4',0:'Disabled'}
				});
			}
		}
		if (group.length) {
			display.push({
				title:type,
				group:[
					{
						id:'reserve.'+type,
						label:'Reserve',
						number:true,
						min:0,
						max:500,
						step:10
					},{
						id:'types.'+type,
						label:type+' Use',
						select:{0:'None',1:'Shared',2:'Exclusive'}
					},{
						group:group,
						require:'types.'+type+'==2'
					}
				]
			});
		}
	}
	return display;
};

Resources.init = function() {
	this._watch(this, 'option');
};

Resources.update = function(event) {
	if (event.type === 'watch') {
		var worker, type, total = 0;
		for (type in this.option.types) {
			for (worker in this.runtime.buckets) {
				if (type in this.runtime.buckets[worker]) {
					if (this.option.types[type] === 2) {// Exclusive
						total += this.runtime.buckets[worker][type];
					} else {
						this.runtime.buckets[worker][type] = 0;
					}
				}
			}
			if (this.option.types[type] === 2 && Math.ceil(total) < Math.floor(this.runtime.types[type])) {// We've got an excess for Exclusive, so share
				total = this.runtime.types[type] - total;
				this.runtime.types[type] -= total;
				this.add(type, total);
			}
		}
	}
};

/***** Resources.add() *****
type = name of Resources
amount = amount to add
absolute = is an absolute amount, not relative
1a. If amount isn't set then add a type of Resources that can be spent
1b. Update the display with the new type
1c. Don't do anything else ;-)
2. Changing the amount:
2a. If absolute then get the relative amount and work from there
3. Save the new amount
NOTE: we can add() items etc here, by never calling with just the item name - so it won't ever be "spent"
*/
Resources.add = function(type, amount, absolute) {
	if (isUndefined(amount)) {// Setting up that we use this type
		this.set(['runtime','types',type], this.runtime.types[type] || 0);
		this.set(['option','types',type], this.option.types[type] || 1);
		this.set(['option','reserve',type], this.option.reserve[type] || 0);
	} else {// Telling of any changes to the amount
		var total = 0, worker;
		if (absolute) {
			amount -= this.runtime.types[type];
		}
		if (amount) {
			// Store the new value
			this.set(['runtime','types',type], this.runtime.types[type] + amount);
			// Now fill any pots...
			amount -= Math.max(0, this.runtime.types[type] - parseInt(this.option.reserve[type]));
			if (amount > 0 && this.option.types[type] === 2) {
				for (worker in this.option.buckets) {
					if (type in this.option.buckets[worker]) {
						total += this.option.buckets[worker][type];
					}
				}
				amount /= total;
				for (worker in this.option.buckets) {
					if (type in this.option.buckets[worker]) {
						this.set(['runtime','buckets',worker,type], this.runtime.buckets[worker][type] + amount * this.option.buckets[worker][type]);
					}
				}
			}		
		}
	}
};

/***** Resources.use() *****
Register to use a type of Resources that can be spent
Actually use a type of Resources (must register with no amount first)
type = name of Resources
amount = amount to use
use = are we using it, or just checking if we can?
*/
Resources.use = function(type, amount, use) {
	if (Worker.stack.length) {
		var worker = Worker.stack[0];
		if (isUndefined(amount)) {
			this.set(['runtime','buckets',worker,type], this.runtime.buckets[worker] && this.runtime.buckets[worker][type] || 0);
			this.set(['option','buckets',worker,type], this.option.buckets[worker] && this.option.buckets[worker][type] || 5);
		} else if (!amount) {
			return true;
		} else if (this.option.types[type] === 1 && this.runtime.types[type] >= amount) {// Shared
			if (use) {
				this.set(['runtime','types',type], this.runtime.types[type] - amount);
			}
			return true;
		} else if (this.option.types[type] === 2 && this.runtime.buckets[worker][type] >= amount) {// Exlusive
			if (use) {
				this.set(['runtime','types',type], this.runtime.types[type] - amount);
				this.set(['runtime','buckets',worker,type], this.runtime.buckets[worker][type] - amount);
			}
			return true;
		}
	}
	return false;
};

/***** Resources.has() *****
Check if we've got a certain number of a Resources in total - not on a per-worker basis
Use this to check on "non-spending" resources
*/
Resources.has = function(type, amount) {
	return isUndefined(amount) ? (this.runtime.types[type] || 0) : (this.runtime.types[type] || 0) >= amount;
};

/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global console, isString, isArray, isNumber, isUndefined, Workers, Worker, Settings, $ */
// Internal scripting language - never give access to eval() etc.

// '!testing.blah=1234 & yet.another.path | !something & test.me > 5'
// [[false,"testing","blah"],"=",1234,"&",["yet","another","path"],"|",[false,"something"],"&",["test","me"],">",5]
// _operators - >,>=,=,==,<=,<,!=,!==,&,&&,|,||
// values = option, path.to.option, number, "string"
// components:
//	"[^"]*"								- string
//	'[^']*'								- string
//	\d*\.?\d+(?:[eE][-+]?\d+)?			- number
//	true|false							- boolean constants
//	[#A-Za-z_]\w*(?:\.\w+)*				- variable
//	[!=]==								- 3-char operators (comparators)
//	[-+*/%<>!=]=						- 2-char operators (comparators)
//	\|\|								- 2-char or operator
//	&&									- 2-char and operator
//	[-+*/%<>!=(){},;]					- 1-char operators

// '!testing.blah=1234 & yet.another.path | !something & test.me > 5'
// [["testing","blah"],"=",1234,"&",["yet","another","path"],"|",["something"],"&",["test","me"],">",5]

var Script = new Worker('Script');
Script.data = Script.runtime = null;

Script.option = {
	worker:'Player',
	type:'data'
};

Script.settings = {
	system:true,
	debug:true,
	taint:true
};

Script.temp = {}; // Used for variables only!!!

Script.dashboard = function() {
	var i, path = this.option.worker+'.'+this.option.type, html = '', list = [];
	html += '<input id="golem_script_run" type="button" value="Run">';
	html += ' Using: <select id="golem_script_worker">';
	for (i=1; i<Settings.temp.paths.length; i++) {
		html += '<option value="' + Settings.temp.paths[i] + '"' + (Settings.temp.paths[i] === path ? ' selected' : '') + '>' + Settings.temp.paths[i] + '</option>';
	}
	html += '</select>';
	html += ' Result: <input id="golem_script_result" type="text" value="" disabled>';
	html += '<input id="golem_script_clear" style="float:right;" type="button" value="Clear">';
//	html += '<br style="clear:both;"><input type="text" id="golem_script_edit" placeholder="Enter code here" style="width:99%;">';
	html += '<br style="clear:both;"><textarea id="golem_script_edit" placeholder="Enter code here" style="width:99%;"></textarea>';
	html += '<textarea id="golem_script_source" placeholder="Compiled code" style="width:99%;" disabled></textarea>';
	$('#golem-dashboard-Script').html(html);
	$('#golem_script_worker').change(function(){
		var path = $(this).val().regex(/([^.]*)\.?(.*)/);
		if (path[0] in Workers) {
			Script.option.worker = path[0];
			Script.option.type = path[1];
		} else {
			Script.option.worker = Script.option.type = null;
		}
	});
	$('#golem_script_source').autoSize();
	$('#golem_script_edit').autoSize();
	$('#golem_script_run').click(function(){
		var script = Script.parse(Workers[Script.option.worker], Script.option.type, $('#golem_script_edit').val());
		$('#golem_script_source').val(script.length ? JSON.stringify(script, null, '   ') : '').autoSize();
		$('#golem_script_result').val(Script.interpret(script));
	});
	$('#golem_script_clear').click(function(){$('#golem_script_edit,#golem_script_source,#golem_script_result').val('');});
};

Script._find = function(op, table) {
	var i = table.length;
	while (i--) {
		if (table[i][0] === op) {
			return i;
		}
	}
	return -1;
};

Script._operators = [ // Order of precidence, [name, expand_args, function]
	// Unary/Prefix
	//['u++',	false,	function(l,r) {return this.temp[r] += 1;}],
	//['u--',	false,	function(l,r) {return this.temp[r] -= 1;}],
	['u+',	true,	function(l,r) {return r;}],
	['u-',	true,	function(l,r) {return -r;}],
	['u!',	true,	function(l,r) {return !r;}],
	['!',	true,	false],		// placeholder
	// Postfix
	//['p++',	false,	function(l) {var v = this.temp[l]; this.temp[l] += 1; return v;}],
	//['++',	false,	false],	// placeholder
	//['p--',	false,	function(l) {var v = this.temp[l]; this.temp[l] -= 1; return v;}],
	//['--',	false,	false],	// placeholder
	// Maths
	['*',	true,	function(l,r) {return l * r;}],
	['/',	true,	function(l,r) {return l / r;}],
	['%',	true,	function(l,r) {return l % r;}],
	['+',	true,	function(l,r) {return l + r;}],
	['-',	true,	function(l,r) {return l - r;}],
	// Equality
	['>',	true,	function(l,r) {return l > r;}],
	['>=',	true,	function(l,r) {return l >= r;}],
	['<=',	true,	function(l,r) {return l <= r;}],
	['<',	true,	function(l,r) {return l < r;}],
	['===',	true,	function(l,r) {return l === r;}],
	['!==',	true,	function(l,r) {return l !== r;}],
/*jslint eqeqeq:false */
	['==',	true,	function(l,r) {return l == r;}],
	['!=',	true,	function(l,r) {return l != r;}],
/*jslint eqeqeq:true */
	// Logical
	['&&',	true,	function(l,r) {return l && r;}],
	['||',	true,	function(l,r) {return l || r;}],
	// Assignment
	['=',	false,	function(l,r) {return (this.temp[l] = this._expand(r));}],
	['*=',	false,	function(l,r) {return (this.temp[l] *= this._expand(r));}],
	['/=',	false,	function(l,r) {return (this.temp[l] /= this._expand(r));}],
	['%=',	false,	function(l,r) {return (this.temp[l] %= this._expand(r));}],
	['+=',	false,	function(l,r) {return (this.temp[l] += this._expand(r));}],
	['-=',	false,	function(l,r) {return (this.temp[l] -= this._expand(r));}]
];

var FN_EXPAND = 0; // function(expand(args)), expanded variables -> values
var FN_RAW = 1; // function(args), unexpanded (so variable names are not changed to their values)
var FN_CUSTOM = 2; // function(script, value_list, op_list)

Script._functions = [ // [name, expand_args, function]
	['min',		FN_EXPAND,	function() {return Math.min.apply(Math, arguments);}],
	['max',		FN_EXPAND,	function() {return Math.max.apply(Math, arguments);}],
	['round',	FN_EXPAND,	function() {return Math.round.apply(Math, arguments);}],
	['floor',	FN_EXPAND,	function() {return Math.floor.apply(Math, arguments);}],
	['ceil',	FN_EXPAND,	function() {return Math.ceil.apply(Math, arguments);}],
	['if',		FN_CUSTOM,	function(script, value_list, op_list) { // if (test) {func} [else if (test) {func}]* [else {func}]?
		var x, fn = 'if', test = false;
		while (fn) {
			x = fn === 'if' ? script.shift() : null; // Should probably report some sort of error if not an array...
			fn = script.shift(); // Should probably report some sort of error if not an array...
			if (!test && (!x || (test = Script._interpret(x).pop()))) {
				value_list = value_list.concat(Script._interpret(fn));
			}
			if (script[0] !== 'else') {
				break;
			}
			fn = script.shift(); // 'else'
			if (script[0] === 'if') {
				fn = script.shift();
			}
		}
	}],
	['for',	FN_CUSTOM,	function(script, value_list, op_list) {
		var a, i = 0; x = [[],[],[]], tmp = script.shift(), fn = script.shift(), now = Date.now();
		while ((a = tmp.shift())) {
			if (a === ';') {
				x[++i] = [];
			} else {
				x[i].push(a);
			}
		}
		// Should probably report some sort of error if not an array...
		Script._interpret(x[0]);
		while (Script._interpret(x[1]).pop() && Date.now() - now < 3000) { // 3 second limit on loops
			Script._interpret(fn);
			Script._interpret(x[2]);
		}
	}],
	['while',	FN_CUSTOM,	function(script, value_list, op_list) {
		var x = script.shift(), fn = script.shift(), now = Date.now();
		while (Script._interpret(x).pop() && Date.now() - now < 3000) { // 3 second limit on loops
			Script._interpret(fn);
		}
	}],
	['return',	FN_CUSTOM,	function(script, value_list, op_list) {
		var x = script.shift();
		Script._return = Script._interpret(isArray(x) ? x : [x]);
	}]
];

Script._expand = function(variable) { // Expand variables into values
	if (variable) {
		if (isArray(variable)) {
			var i = variable.length;
			while (i--) {
				variable[i] = arguments.callee.call(this, variable[i]);
			}
		} else if (isString(variable) && variable[0] === '#') {
			return this.temp[variable];
		}
	}
	return variable;
};

// Perform any operations of lower precedence than "op"
// Both op_list and value_list are altered
Script._operate = function(op, op_list, value_list) {
	var i, tmp, fn, args;
	while (op_list.length && op_list[0][0] <= op) {
		tmp = op_list.shift();
		fn = this._operators[tmp[0]][2];
		if ((i = fn.length)) { // function takes set args
			args = value_list.splice(-i, i);
			// pad out values to the left, if missing
			while (args.length < i) {
				args.unshift(null);
			}
		} else {
			args = value_list.splice(tmp[1], value_list.length - tmp[1]); // Args from the end
		}
		if (this._operators[tmp[0]][1]) {
			args = this._expand(args);
		}
//		log(LOG_LOG, 'Perform: '+this._operators[tmp[0]][0]+'('+args+')');
		value_list.push(fn.apply(this, args));
	}
	if (this._operators[op]) {
		op_list.unshift([op, value_list.length]);
	}
};

Script._return = undefined;

// Interpret our script, return a single value
Script._interpret = function(_script) {
	var x, y, z, fn, value_list = [], op_list = [], script = _script.slice(0), test;
	while (!this._return && (x = script.shift()) !== null && !isUndefined(x)) {
		if (isArray(x)) {
			value_list = value_list.concat(arguments.callee.call(this, x));
		} else if (isString(x)) {
			if (x === ';') {
				this._operate(Number.MAX_VALUE, op_list, value_list);
				value_list = [];
				op_list = [];
			} else if ((fn = Script._find(x, this._operators)) >= 0) {
				this._operate(fn, op_list, value_list);
			} else if ((fn = Script._find(x, this._functions)) >= 0) {
				if (this._functions[fn][1] === FN_CUSTOM) {
					value_list.push(this._functions[fn][2].call(this, script, value_list, op_list));
				} else {
					x = script.shift(); // Should probably report some sort of error if not an array...
					x = arguments.callee.call(this, x);
					if (this._functions[fn][1] === FN_EXPAND) {
						x = this._expand(x);
					}
					value_list.push(this._functions[fn][2].apply(this, x));
				}
			} else if (/^[A-Z]\w*(?:\.\w+)*$/.test(x)) {
				x = x.split('.');
				value_list.push(Workers[x[0]]._get(x.slice(1), false));
			} else if (/^".*"$/.test(x)) {
				x = x.replace(/^"|"$/g, '');
				z = '';
				while (y = x.match(/^(.*)\\(.)(.*)$/)) {
					z = y[1] + y[2];
					x = y[3];
				}
				z += x;
				value_list.push(z);
			} else if (/^'.*'$/.test(x)) {
				x = x.replace(/^'|'$/g, '');
				z = '';
				while (y = x.match(/^(.*)\\(.)(.*)$/)) {
					z = y[1] + y[2];
					x = y[3];
				}
				z += x;
				value_list.push(z);
			} else if (x[0] === '#') {
				value_list.push(x);
			} else {
				log(LOG_ERROR, 'Bad string format: '+x);
				value_list.push(x); // Should never hit this...
			}
		} else { // number or boolean
			value_list.push(x);
		}
	}
	this._operate(Number.MAX_VALUE, op_list, value_list);
	return this._return || value_list;
};

Script.interpret = function(script) {
	this.temp = {};
	this._return = undefined;
	return this._expand((this._interpret(script)).pop());
};

Script.parse = function(worker, datatype, text, map) {
	var atoms = (text + ';').regex(new RegExp('\\s*(' +
	  '"(?:\\\\.|[^"])*"' +					// string quoted with "
	  "|'(?:\\\\.|[^'])*'" +				// string quoted with '
	  '|\\d*\\.?\\d+(?:[eE][-+]?\\d+)?' +	// number
	  '|\\btrue\\b|\\bfalse\\b' +			// boolean
	  '|[#A-Za-z_]\\w*(?:\\.\\w+)*\\b' +	// variable
	  '|[!=]==' +							// 3-char operator
	  '|[-+*/%<>!=]=' +						// 2-char operator
	  '|\\+\\+(?=\\s*[#A-Za-z_,;}])' +		// increment
	  '|--(?=\\s*[#A-Za-z_,;}])' +			// decrement
	  '|&&' +								// boolean and
	  '|\\|\\|' +							// boolean or
	  '|[-+*/%<>!=]' +						// 1-char operator
	  '|[(){};]' +							// grouping, separator, terminator
	  '|\\s+' +								// spaces
	  '|[^#\\w\\.\\s"]+' +					// other ?
	  ')', 'gm'));
	if (atoms === null || isUndefined(atoms)) {
		return []; // Empty script
	}
	map = map || {};
	return (function() {
		var atom, path, script = [], i;
		while ((atom = atoms.shift()) !== null && !isUndefined(atom)) {
			if (atom === '(' || atom === '{') {
				script.push(arguments.callee());
			} else if (atom === ')') {
				break;
			} else if (atom === '}') {
				if (!script.length || script[script.length-1] !== ';') {
					script.push(';');
				}
				break;
			} else if (atom === 'true') {
				script.push(true);
			} else if (atom === 'false') {
				script.push(false);
			} else if (atom === ';') { // newline (resets values)
				if (script.length && script[script.length-1] !== ';') {
					script.push(atom);
				}
			} else if ((i = Script._find(atom, Script._operators)) !== -1) { // operator
				// unary op
				if (!script.length || Script._find(script[script.length-1], Script._operators) !== -1) {
					if (Script._find('u' + atom, Script._operators) !== -1) {
						//log(LOG_WARN, 'unary/prefix [' + atom + ']');
						atom = 'u' + atom;
					} else {
						log(LOG_WARN, 'unary/prefix [' + atom + '] is not supported');
					}
				} else if (Script._operators[i][2] === false) {
					if (Script._find('p' + atom, Script._operators) !== -1) {
						//log(LOG_WARN, 'postifx [' + atom + ']');
						atom = 'p' + atom;
					} else {
						log(LOG_WARN, 'postifx [' + atom + '] is not supported');
					}
				}
				script.push(atom);
			} else if (atom[0] === '#' // variable
				|| isNumber(atom) // number
				|| /^".*"$/.test(atom) // string
				|| /^'.*'$/.test(atom) // string
				//|| Script._find(atom, Script._operators) !== -1 // operator
				|| Script._find(atom, Script._functions) !== -1) { // function
				script.push(atom);
			} else if (atom !== ',') { // if it's not a comma, then worker.datatype.key or path.to.key
				if (map[atom]) {
					path = map[atom].split('.');
				} else {
					path = atom.split('.');
				}
				if (!Workers[path[0]]) {
					if (isUndefined(worker._datatypes[path[0]])) {
						path.unshift(datatype);
					}
					path.unshift(worker.name);
				}
				script.push(path.join('.'));
			}
		}
//		log(LOG_DEBUG, 'Script section: '+JSON.stringify(script));
		if (script[script.length-1] === ';') {
			script.pop();
		}
		return script;
	}());
};

/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page, Queue, Resources,
	Battle, Generals, LevelUp, Player,
	APP, APPID, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, Divisor, length, sum, findInObject, objectIndex, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
	makeImage
*/
/********** Worker.Session **********
* Deals with multiple Tabs/Windows being open at the same time...
*/
var Session = new Worker('Session');
Session.runtime = null; // Don't save anything except global stuff
Session._rootpath = false; // Override save path so we don't get limited to per-user

Session.settings = {
	system:true,
	keep:true,// We automatically load when needed
	taint:true
};

Global.display.push({
//	advanced:true,
	title:'Multiple Tabs / Windows',
	group:[
		{
			id:['Session','option','timeout'],
			label:'Forget After',
			select:{5000:'5 Seconds', 10000:'10 Seconds', 15000:'15 Seconds', 20000:'20 Seconds', 25000:'25 Seconds', 30000:'30 Seconds'},
			help:'When you have multiple tabs open this is the length of time after closing all others that the Enabled/Disabled warning will remain.'
		}
	]
});

Session.option = {
	timeout:15000 // How long to give a tab to update itself before deleting it (ms)
};

Session.data = { // Shared between all windows
	_active:null, // Currently active session
	_sessions:{}, // List of available sessions
	_timestamps:{} // List of all last-saved timestamps from all workers
};

Session.temp = {
	active:false, // Are we the active tab (able to do anything)?
	warning:null, // If clicking the Disabled button when not able to go Enabled
	_id:null
};

Session.setup = function() {
	if (Global.get(['option','session'], false)) {
		this.set(['option','timeout'], Global.get(['option','session','timeout'], this.option.timeout));
		Global.set(['option','session']);
	}
	try {
		if (!(Session.temp._id = sessionStorage.getItem('golem.'+APP))) {
			sessionStorage.setItem('golem.'+APP, Session.temp._id = '#' + Date.now());
		}
	} catch(e) {// sessionStorage not available
		Session.temp._id = '#' + Date.now();
	}
};

/***** Session.init() *****
3. Add ourselves to this.data._sessions with the _active time
4. If no active worker (in the last 2 seconds) then make ourselves active
4a. Set this.temp.active, this.data._active, and immediately call this._save()
4b/5. Add the "Enabled/Disabled" button, hidden if necessary (hiding other elements if we're disabled)
6. Add a click handler for the Enable/Disable button
6a. Button only works when either active, or no active at all.
6b. If active, make inactive, update this.temp.active, this.data._active and hide other elements
6c. If inactive , make active, update this.temp.active, this.data._active and show other elements (if necessary)
7. Add a repeating reminder for every 1 second
*/
Session.init = function() {
	var now = Date.now();
	this.set(['data','_sessions',this.temp._id], now);
	$('.golem-title').after('<div id="golem_session" class="golem-info golem-theme-button green" style="display:none;">Enabled</div>');
	if (!this.data._active || typeof this.data._sessions[this.data._active] === 'undefined' || this.data._sessions[this.data._active] < now - this.option.timeout || this.data._active === this.temp._id) {
		this._set(['temp','active'], true);
		this._set(['data','_active'], this.temp._id);
		this._save('data');// Force it to save immediately - reduce the length of time it's waiting
	} else {
		$('#golem_session').html('<b>Disabled</b>').toggleClass('red green').show();
	}
	$('#golem_session').click(function(event){
		Session._unflush();
		if (Session.temp.active) {
			$(this).html('<b>Disabled</b>').toggleClass('red green');
			Session._set(['data','_active'], null);
			Session._set(['temp','active'], false);
		} else if (!Session.data._active || typeof Session.data._sessions[Session.data._active] === 'undefined' || Session.data._sessions[Session.data._active] < Date.now() - option.timeout) {
			$(this).html('Enabled').toggleClass('red green');
			Queue.clearCurrent();// Make sure we deal with changed circumstances
			Session._set(['data','_active'], Session.temp._id);
			Session._set(['temp','active'], true);
		} else {// Not able to go active
			Queue.clearCurrent();
			$(this).html('<b>Disabled</b><br><span>Another instance running!</span>');
			if (!Session.temp.warning) {
				(function(){
					if ($('#golem_session span').length) {
						if ($('#golem_session span').css('color').indexOf('255') === -1) {
							$('#golem_session span').animate({'color':'red'},200,arguments.callee);
						} else {
							$('#golem_session span').animate({'color':'black'},200,arguments.callee);
						}
					}
				})();
			}
			window.clearTimeout(Session.temp.warning);
			Session.temp.warning = window.setTimeout(function(){if(!Session.temp.active){$('#golem_session').html('<b>Disabled</b>');}Session.temp.warning=null;}, 3000);
		}
		Session._save('data');
	});
	$(window).unload(function(){Session.update({type:'unload'});}); // Not going via _update
	this._revive(1); // Call us *every* 1 second - not ideal with loads of Session, but good enough for half a dozen or more
	Title.alias('disable', 'Session:temp.active::(Disabled) ');
};

/***** Session.update() *****
1. Update the timestamps in data._timestamps[type][worker]
2. Replace the relevant datatype with the updated (saved) version if it's newer
*/
Session.updateTimestamps = function() {
	var i, j, _old, _new, _ts;
	for (i in Workers) {
		if (i !== this.name) {
			for (j in Workers[i]._datatypes) {
				if (Workers[i]._datatypes[j]) {
					this.data._timestamps[j] = this.data._timestamps[j] || {};
					_ts = this.data._timestamps[j][i] || 0;
					if (Workers[i]._timestamps[j] === undefined) {
						Workers[i]._timestamps[j] = _ts;
					} else if (_ts > Workers[i]._timestamps[j]) {
						log(LOG_DEBUG, 'Need to replace '+i+'.'+j+' with newer data');
						_old = Workers[i][j];
						Workers[i]._load(j);
						_new = Workers[i][j];
						Workers[i][j] = _old;
						Workers[i]._replace(j, _new);
						Workers[i]._timestamps[j] = _ts;
					}
					this.data._timestamps[j][i] = Workers[i]._timestamps[j];
				}
			}
		}
	}
};

/***** Session.update() *****
1. We don't care about any data, only about the regular reminder we've set, so return if not the reminder
2. Update data._sessions[id] to Date.now() so we're not removed
3. If no other open instances then make ourselves active (if not already) and remove the "Enabled/Disabled" button
4. If there are other open instances then show the "Enabled/Disabled" button
*/
Session.update = function(event) {
	var i, l, now = Date.now();
	if (event.type !== 'reminder' && event.type !== 'unload') {
		return;
	}
	this._load('data');
	if (event.type === 'unload') {
		Queue._forget('run'); // Make sure we don't do anything else
		for (i in Workers) { // Make sure anything that needs saving is saved
			for (l in Workers[i]._taint) {
				if (Workers[i]._taint[l]) {
					Workers[i]._save(l);
				}
			}
			for (l in Workers[i]._reminders) {
				if (/^i/.test(l)) {
					window.clearInterval(Workers[i]._reminders[l]);
				} else if (/^t/.test(l)) {
					window.clearTimeout(Workers[i]._reminders[l]);
				}
			}
		}
		this.data._sessions[this.temp._id] = 0;
		if (this.data._active === this.temp._id) {
			this.data._active = null;
		}
		this.temp.active = false;
	} else {
		this.data._sessions[this.temp._id] = now;
	}
	now -= this.option.timeout;
	for(i in this.data._sessions) {
		if (this.data._sessions[i] < now) {
			this.data._sessions[i] = undefined;
		}
	}
	l = length(this.data._sessions);
	if (l === 1) {
		if (!this.temp.active) {
			this.updateTimestamps();
			$('#golem_session').stop().css('color','black').html('Enabled').addClass('green').removeClass('red');
//			Queue.clearCurrent();// Make sure we deal with changed circumstances
			this.data._active = this.temp._id;
			this.set(['temp','active'], true);
		}
		$('#golem_session').hide();
	} else if (l > 1) {
		this.updateTimestamps();
		$('#golem_session').show();
	}
	this._taint.data = true;
	this._save('data');
};
/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page, Queue, Resources, Settings:true,
	Battle, Generals, LevelUp, Player,
	APP, APPID, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH, APPNAME,
	makeTimer, Divisor, length, sum, findInObject, objectIndex, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime, makeImage,
	GM_listValues, GM_deleteValue, localStorage
*/
/********** Worker.Settings **********
* Save and Load settings by name - never does anything to CA beyond Page.reload()
*/
var Settings = new Worker('Settings');
Settings._rootpath = false; // Override save path so we don't get limited to per-user
Settings.option = Settings.runtime = null;

Settings.settings = {
	system:true,
	unsortable:true,
	advanced:true,
	no_disable:true,
	taint:true
};

Settings.temp = {
	worker:null,
	edit:null,
	paths:['-']
};

Settings.init = function() {
	var i, j;
	for (i in Workers) {
		for (j in Workers[i]._datatypes) {
			this.temp.paths.push(i + '.' + j);
		}
	}
	this.temp.paths.sort();
	if (this.data['- default -']) {
		this.data = this.data['- default -'];
	}
};

Settings.menu = function(worker, key) {
	var i, keys = [];
	if (worker) {
		if (!key) {
			if (Config.option.advanced) {
				for (i in worker._datatypes) {
					keys.push(i+':' + (worker.name === this.temp.worker && i === this.temp.edit ? '=' : '') + 'Edit&nbsp;"' + worker.name + '.' + i + '"');
				}
				keys.push('---');
			}
			keys.push('backup:Backup&nbsp;Options');
			keys.push('restore:Restore&nbsp;Options');
			return keys;
		} else if (key) {
			if (key === 'backup') {
				if (confirm("BACKUP WARNING!!!\n\nAbout to replace '+worker.name+' backup options.\n\nAre you sure?")) {
					this.set(['data', worker.name], $.extend(true, {}, worker.option));
				}
			} else if (key === 'restore') {
				if (confirm("RESTORE WARNING!!!\n\nAbout to restore '+worker.name+' options.\n\nAre you sure?")) {
					worker._replace('option', $.extend(true, {}, this.data[worker.name]));
				}
			} else if (this.temp.worker === worker.name && this.temp.edit === key) {
				this.temp.worker = this.temp.edit = null;
				this._notify('data');// Force dashboard update
			} else {
				this.temp.worker = worker.name;
				this.temp.edit = key;
				this._notify('data');// Force dashboard update
				Dashboard.set(['option','active'], this.name);
			}
		}
	} else {
		if (!key) {
			keys.push('backup:Backup&nbsp;Options');
			keys.push('restore:Restore&nbsp;Options');
			if (Config.option.advanced) {
				keys.push('---');
				keys.push('reset:!Reset&nbsp;Golem');
			}
			return keys;
		} else {
			if (key === 'backup') {
				if (confirm("BACKUP WARNING!!!\n\nAbout to replace backup options for all workers.\n\nAre you sure?")) {
					for (i in Workers) {
						this.set(['data',i], $.extend(true, {}, Workers[i].option));
					}
				}
			} else if (key === 'restore') {
				if (confirm("RESTORE WARNING!!!\n\nAbout to restore options for all workers.\n\nAre you sure?")) {
					for (i in Workers) {
						if (i in this.data) {
							Workers[i]._replace('option', $.extend(true, {}, this.data[i]));
						}
					}
				}
			} else if (key === 'reset') {
				if (confirm("IMPORTANT WARNING!!!\n\nAbout to delete all data for Golem on "+APPNAME+".\n\nAre you sure?")) {
					if (confirm("VERY IMPORTANT WARNING!!!\n\nThis will clear everything, reload the page, and make Golem act like it is the first time it has ever been used on "+APPNAME+".\n\nAre you REALLY sure??")) {
						// Well, they've had two chances...
						if (browser === 'greasemonkey') {
							keys = GM_listValues();
							while ((i = keys.pop())) {
								GM_deleteValue(i);
							}
						} else {
							for (i in localStorage) {
								if (i.indexOf('golem.' + APP + '.') === 0) {
									localStorage.removeItem(i);
								}
							}
						}
						window.location.replace(window.location.href);
					}
				}
			}
		}
	}
};

Settings.dashboard = function() {
	var i, j, o, x, y, z, total, rawtot, path = this.temp.worker+'.'+this.temp.edit, html = '', storage = [];
	html = '<select id="golem_settings_path">';
	for (i=0; i<this.temp.paths.length; i++) {
		html += '<option value="' + this.temp.paths[i] + '"' + (this.temp.paths[i] === path ? ' selected' : '') + '>' + this.temp.paths[i] + '</option>';
	}
	html += '</select>';
//	html += '<input type="text" value="'+this.temp.worker+'.'+this.temp.edit+'" disabled>';
	html += '<input id="golem_settings_refresh" type="button" value="Refresh">';
	if (this.temp.worker && this.temp.edit) {
		if (this.temp.edit === 'data') {
			Workers[this.temp.worker]._unflush();
		}
	}
	if (!this.temp.worker) {
		total = rawtot = 0;
		o = [];
		for (i in Workers) {
		    o.push(i);
		}
		o.sort();
		for (i = 0; i < o.length; i++) {
			for (j in Workers[o[i]]._storage) {
				if (Workers[o[i]]._storage[j]) {
					x = Workers[o[i]]._storage[j] || 0;
					y = Workers[o[i]]._rawsize[j] || x;
					z = Workers[o[i]]._numvars[j] || 0;
					total += x;
					rawtot += y;
					storage.push('<tr>');
					storage.push('<th>' + o[i] + '.' + j + '</th>');
					storage.push('<td style="text-align:right;">' + x.addCommas() + ' bytes</td>');
					storage.push('<td style="text-align:right;">' + y.addCommas() + ' bytes</td>');
					storage.push('<td style="text-align:right;">' + (x !== y ? (x * 100 / y).SI() + '%' : '&nbsp;') + '</td>');
					storage.push('<td style="text-align:right;">' + (z ? z + ' key' + plural(z) : '&nbsp;') + '</td>');
					storage.push('</tr>');
				}
			}
		}
		html += ' No worker specified (total ' + total.addCommas();
		if (total !== rawtot) {
			html += '/' + rawtot.addCommas();
		}
		html += ' bytes';
		if (total !== rawtot) {
			html += ', ' + (total * 100 / rawtot).SI() + '%';
		}
		html += ')<br><table>' + storage.join('') + '</table>';
	} else if (!this.temp.edit) {
		html += ' No ' + this.temp.worker + ' element specified.';
	} else if (typeof Workers[this.temp.worker][this.temp.edit] === 'undefined') {
		html += ' The element is undefined.';
	} else if (Workers[this.temp.worker][this.temp.edit] === null) {
		html += ' The element is null.';
	} else if (typeof Workers[this.temp.worker][this.temp.edit] !== 'object') {
		html += ' The element is scalar.';
	} else {
		i = length(Workers[this.temp.worker][this.temp.edit]);
		html += ' The element contains ' + i + ' element' + plural(i);
		if (Workers[this.temp.worker]._storage[this.temp.edit]) {
			html += ' (' + (Workers[this.temp.worker]._storage[this.temp.edit]).addCommas() + ' bytes)';
		}
		html += '.';
	}
	if (this.temp.worker && this.temp.edit) {
		if (Config.option.advanced) {
			html += '<input style="float:right;" id="golem_settings_save" type="button" value="Save">';
		}
		html += '<br><textarea id="golem_settings_edit" style="width:99%;">' + JSON.stringify(Workers[this.temp.worker][this.temp.edit], null, '   ') + '</textarea>';
	}
	$('#golem-dashboard-Settings').html(html);
	$('#golem_settings_refresh').click(function(){Settings.dashboard();});
	$('#golem_settings_save').click(function(){
		var data;
		try {
			data = JSON.parse($('#golem_settings_edit').val());
		} catch(e) {
			alert("ERROR!!!\n\nBadly formed JSON data.\n\nPlease check the data and try again!");
			return;
		}
		if (confirm("WARNING!!!\n\nReplacing internal data can be dangrous, only do this if you know exactly what you are doing.\n\nAre you sure you wish to replace "+Settings.temp.worker+'.'+Settings.temp.edit+"?")) {
			// Need to copy data over and then trigger any notifications
			Workers[Settings.temp.worker]._replace(Settings.temp.edit, data);
		}
	});
	$('#golem_settings_path').change(function(){
		var path = $(this).val().regex(/([^.]*)\.?(.*)/);
		if (path[0] in Workers) {
			Settings.temp.worker = path[0];
			Settings.temp.edit = path[1];
		} else {
			Settings.temp.worker = Settings.temp.edit = null;
		}
		Settings.dashboard();
	});
	$('#golem_settings_edit').autoSize();
};

/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Dashboard, History, Page, Queue, Resources,
	Battle, Generals, LevelUp, Player,
	APP, APPID, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, Divisor, length, sum, findInObject, objectIndex, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
	makeImage
*/
/********** Worker.Title **********
* Changes the window title to user defined data.
* String may contain {stamina} or {Player:stamina} using the worker name (default Player)
*/
var Title = new Worker('Title');
Title.data = null;

Title.settings = {
	system:true,
	taint:true
};

Title.option = {
	enabled:false,
	title:"CA: {pause}{disable}{worker} | {energy}e | {stamina}s | {exp_needed}xp by {LevelUp:time}"
};

Title.temp = {
	old:null, // Old title, in case we ever have to change back
	alias:{} // name:'worker:path.to.data[:txt if true[:txt if false]]' - fill via Title.alias()
};

Global.display.push({
	title:'Window Title',
	group:[
		{
			id:['Title','option','enabled'],
			label:'Change Window Title',
			checkbox:true
		},{
			id:['Title','option','title'],
			text:true,
			size:30
		},{
			info:'{myname}<br>{energy} / {maxenergy}<br>{health} / {maxhealth}<br>{stamina} / {maxstamina}<br>{level}<br>{pause} - "(Paused) " when paused<br>{LevelUp:time} - Next level time<br>{worker} - Current worker<br>{bsi} / {lsi} / {csi}'
		}
	]
});

/***** Title.update() *****
* 1. Split option.title into sections containing at most one bit of text and one {value}
* 2. Output the plain text first
* 3. Split the {value} in case it's really {worker:value}
* 4. Output worker.get(value)
* 5. Watch worker for changes
*/
Title.update = function(event) {
	if (this.option.enabled && this.option.title) {
		var i, tmp, what, worker, value, output = '', parts = this.option.title.match(/([^}]+\}?)/g);// split into "text {option}"
		if (parts) {
			for (i=0; i<parts.length; i++) {
				tmp = parts[i].regex(/([^{]*)\{?([^}]*)\}?/);// now split to "text" "option"
				output += tmp[0];
				if (tmp[1]) {// We have an {option}
					what = (this.temp.alias[tmp[1]] || tmp[1]).split(':');// if option is "worker:value" then deal with it here
					worker = Worker.find(what.shift());
					if (worker) {
						this._watch(worker, what[0]); // Doesn't matter how often we add, it's only there once...
						value = worker.get(what[0], '');
						if (what[1] && value === true) {
							value = what[1];
						} else if (what[2] && !value) {
							value = what[2];
						}
						output += isNumber(value) ? value.addCommas() : isString(value) ? value : '';
					} else {
						log(LOG_WARN, 'Bad worker specified = "' + tmp[1] + '"');
					}
				}
			}
		}
		if (!this.temp.old) {
			this.set(['temp','old'], document.title);
		}
		if (!document.title || output !== document.title) {
			document.title = output;
		}
	} else if (this.temp.old) {
		document.title = this.temp.old;
		this.set(['temp','old'], null);
	}
};

/***** Title.alias() *****
* Pass a name and a string in the format "Worker:path.to.data[:txt if true[:txt if false]]"
*/
Title.alias = function(name,str) {
	this.set(['temp','alias',name], str);
};

/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page, Queue, Resources,
	Battle, Generals, LevelUp, Player,
	APP, APPID, log, debug, userID, imagepath, isRelease:true, version, revision, Workers, PREFIX, window, browser, GM_xmlhttpRequest,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, Divisor, length, sum, findInObject, objectIndex, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
	makeImage
*/
/********** Worker.Update **********
* Checks if there's an update to the script, and lets the user update if there is.
*/
var Update = new Worker('Update');
Update.data = Update.option = null;

Update.settings = {
	system:true
};

Update.runtime = {
	installed:0,// Date this version was first seen
	current:'',// What is our current version
	lastcheck:0,// Date.now() = time since last check
	version:0,// Last ones we saw in a check
	revision:0,
	force:false// Have we clicked a button, or is it an automatic check
};

Update.temp = {
	version:0,
	revision:0,
	check:'',// Url to check for new versions
	url_1:'',// Url to download release
	url_2:''// Url to download revision
};

/***** Update.init() *****
1a. Add a "Update Now" button to the button bar at the top of Config
1b. If running a beta version then add a "beta" button - which makes us pretend to be a beta version before running the update check.
2. On clicking the button set Update.runtime.force to true - so we can work() immediately...
*/
Update.init = function() {
	this.set(['temp','version'], version);
	this.set(['temp','revision'], revision);
	this.set(['runtime','version'], this.runtime.version || version);
	this.set(['runtime','revision'], this.runtime.revision || revision);
	switch(browser) {
		case 'chrome':
			Update.temp.check = 'http://game-golem.googlecode.com/svn/trunk/chrome/_version.js';
			Update.temp.url_1 = 'http://game-golem.googlecode.com/svn/trunk/chrome/GameGolem.crx';
			Update.temp.url_2 = 'http://game-golem.googlecode.com/svn/trunk/chrome/GameGolem.crx';
			break;
		default:
			Update.temp.check = 'http://game-golem.googlecode.com/svn/trunk/_version.js';
			Update.temp.url_1 = 'http://game-golem.googlecode.com/svn/trunk/_release.user.js';
			Update.temp.url_2 = 'http://game-golem.googlecode.com/svn/trunk/_normal.user.js';
			break;
	}
	// Add an update button for everyone
	Config.addButton({
		id:'golem_icon_update',
		image:'update',
		title:'Check for Update',
		click:function(){
			$(this).addClass('red');
			Update.checkVersion(true);
		}
	});
	if (isRelease) { // Add an advanced "beta" button for official release versions
		Config.addButton({
			id:'golem_icon_beta',
			image:'beta',
			title:'Check for Beta Versions',
			advanced:true,
			click:function(){
				isRelease = false;// Isn't persistant, so nothing visible to the user except the beta release
				$(this).addClass('red');
				Update.checkVersion(true);
			}
		});
	}
	// Add a changelog advanced button
	Config.addButton({
		image:'log',
		advanced:true,
		className:'blue',
		title:'Changelog',
		click:function(){
			window.open('http://code.google.com/p/game-golem/source/list', '_blank'); 
		}
	});
	// Add a wiki button
	Config.addButton({
		image:'wiki',
		className:'blue',
		title:'GameGolem wiki',
		click:function(){
			window.open('http://code.google.com/p/game-golem/wiki/castle_age', '_blank'); 
		}
	});
	$('head').bind('DOMNodeInserted', function(event){
		if (event.target.nodeName === 'META' && $(event.target).attr('name') === 'golem-version') {
			tmp = $(event.target).attr('content').regex(/(\d+\.\d+)\.(\d+)/);
			if (tmp) {
				Update._remind(21600, 'check');// 6 hours
				Update.set(['runtime','lastcheck'], Date.now());
				Update.set(['runtime','version'], tmp[0]);
				Update.set(['runtime','revision'], tmp[1]);
				if (Update.get(['runtime','force']) && Update.get(['temp','version'], version) >= tmp[0] && (isRelease || Update.get(['temp','revision'], revision) >= tmp[1])) {
					$('<div class="golem-button golem-info red">No Update Found</div>').animate({'z-index':0}, {duration:5000,complete:function(){$(this).remove();} }).insertAfter('#golem_buttons');
				}
				Update.set(['runtime','force'], false);
				$('#golem_icon_update,#golem_icon_beta').removeClass('red');
			}
			event.stopImmediatePropagation();
			event.stopPropagation();
			$('script.golem-script-version').remove();
			$(event.target).remove();
			return false;
		}
	});
	if (this.runtime.current !== (version + revision)) {
		this.set(['runtime','installed'], Date.now());
		this.set(['runtime','current'], version + revision);
	}
};

Update.checkVersion = function(force) {
	Update.set('runtime.lastcheck', Date.now() - 21600000 + 60000);// Don't check again for 1 minute - will get reset if we get a reply
	Update.set('runtime.force', force);
	window.setTimeout(function(){
		var s = document.createElement('script');
		s.setAttribute('type', 'text/javascript');
		s.className = 'golem-script-version';
		s.src = Update.temp.check + '?random=' + Date.now();
		document.getElementsByTagName('head')[0].appendChild(s);
	}, 100);
};

/***** Update.update() *****
1a. If it's more than 6 hours since our last check, then ask for the latest version file from the server
1b. In case of bad connection, say it's 6 hours - 1 minutes since we last checked
2. Check if there's a version response on the page
3a. If there's a response then parse it and clear it - remember the new numbers
3b. Display a notification if there's a new version
4. Set a reminder if there isn't
*/
Update.update = function(event) {
	if (event.type === 'reminder') {
		this.checkVersion(false);
	}
	if (event.type === 'init' || event.type === 'reminder') {
		var now = Date.now(), age = (now - this.runtime.installed) / 1000, time = (now - this.runtime.lastcheck) / 1000;
		if (age <= 21600) {time += 3600;}		// Every hour for 6 hours
		else if (age <= 64800) {time += 7200;}	// Every 2 hours for another 12 hours (18 total)
		else if (age <= 129600) {time += 10800;}// Every 3 hours for another 18 hours (36 total)
		else if (age <= 216000) {time += 14400;}// Every 4 hours for another 24 hours (60 total)
		else {time += 21600;}					// Every 6 hours normally
		this._remind(Math.max(0, time), 'check');
	}
	if (this.runtime.version > this.temp.version || (!isRelease && this.runtime.revision > this.temp.revision)) {
		log(LOG_INFO, 'New version available: ' + this.runtime.version + '.' + this.runtime.revision + ', currently on ' + version + '.' + revision);
		if (this.runtime.version > this.temp.version) {
			$('#golem_buttons').after('<div class="golem-button golem-info green" title="' + this.runtime.version + '.' + this.runtime.revision + ' released, currently on ' + version + '.' + revision + '"><a href="' + this.temp.url_1 + '">New Version Available</a></div>');
		}
		if (!isRelease && this.runtime.revision > this.temp.revision) {
			$('#golem_buttons').after('<div class="golem-button golem-info green" title="' + this.runtime.version + '.' + this.runtime.revision + ' released, currently on ' + version + '.' + revision + '"><a href="' + this.temp.url_2 + '">New Beta Available</a></div>');
		}
		this.set(['temp','version'], this.runtime.version);
		this.set(['temp','revision'], this.runtime.revision);
	}
};

// Add "Castle Age" to known applications
Main.add('castle_age', '46755028429', 'Castle Age');
/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page, Queue, Resources,
	Battle, Generals, LevelUp, Player,
	APP, APPID, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, Divisor, length, sum, findInObject, objectIndex, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
	makeImage
*/
/********** Worker.Alchemy **********
* Get all ingredients and recipes
*/
var Alchemy = new Worker('Alchemy');
Alchemy.temp = null;

Alchemy.settings = {
	taint:true
};

Alchemy.defaults['castle_age'] = {
	pages:'keep_alchemy keep_stats'
};

Alchemy.data = {
	ingredients:{},
	summons:{},
	recipe:{}
};

Alchemy.option = {
	perform:false,
	hearts:false,
	summon:false
};

Alchemy.runtime = {
	best:null,
	wait:0
};

Alchemy.display = [
	{
		id:'hearts',
		label:'Use Battle Hearts',
		checkbox:true
	},{
		id:'summon',
		label:'Use Summon Ingredients',
		checkbox:true
	}
];

Alchemy.parse = function(change) {
	var now = Date.now(), self = this, i, tmp,
		ipurge = {}, rpurge = {}, spurge = {};

	if (Page.page === 'keep_alchemy') {
		tmp = $('div.ingredientUnit');

		if (!tmp.length) {
			log(LOG_WARN, "Can't find any alchemy ingredients...");
			//Page.to('keep_alchemy', false); // Force reload
			//return false;
		} else {
			for (i in this.data.ingredients) {
				if (this.data.ingredients[i] !== 0) {
					ipurge[i] = true;
				}
			}
		}

		// ingredients list
		tmp.each(function(a, el) {
			var icon = ($('img', el).attr('src') || '').filepart();
			var c = ($(el).text() || '').regex(/\bx\s*(\d+)\b/im);
			ipurge[icon] = false;
			if (isNumber(c)) {
				self.set(['ingredients', icon], c);
			} else {
				log(LOG_WARN, 'Bad count ' + c + ' on ' + icon);
			}
		});

		tmp = $('div.alchemyQuestBack,div.alchemyRecipeBack,div.alchemyRecipeBackMonster');

		if (!tmp.length) {
			log(LOG_WARN, "Can't find any alchemy recipes...");
			//Page.to('keep_alchemy', false); // Force reload
			//return false;
		} else {
			for (i in this.data.recipe) {
				rpurge[i] = true;
			}
			for (i in this.data.summons) {
				spurge[i] = true;
			}
		}

		// recipe list
		tmp.each(function(a, el) {
			var name = ($('div.recipeTitle', el).text() || '').replace('RECIPES:','').replace(/\s+/gm, ' ').trim(),
				recipe = {}, i;
			if ((i = name.search(/\s*\(/m)) >= 0) {
				name = name.substr(0, i);
			}
			if ($(el).hasClass('alchemyQuestBack')) {
				recipe.type = 'Quest';
			} else if ($(el).hasClass('alchemyRecipeBack')) {
				recipe.type = 'Recipe';
			} else if ($(el).hasClass('alchemyRecipeBackMonster')) {
				recipe.type = 'Summons';
			}
			recipe.ingredients = {};
			$('div.recipeImgContainer', el).parent().each(function(b, el2) {
				var icon = ($('img', el2).attr('src') || '').filepart();
				var c = ($(el2).text() || '').regex(/\bx\s*(\d+)\b/im) || 1;
				recipe.ingredients[icon] = c;
				// Make sure we know an ingredient exists
				if (!(icon in self.data.ingredients)) {
					self.set(['ingredients', icon], 0);
					ipurge[icon] = false;
				}
				if (recipe.type === 'Summons') {
					spurge[icon] = false;
					self.set(['summons', icon], true);
				}
			});
			rpurge[name] = false;
			self.set(['recipe', name], recipe);
		});
	} else if (Page.page === 'keep_stats') {
		// Only when it's our own keep and not someone elses
		if ($('.keep_attribute_section').length) {
			// some ingredients are units
			tmp = $('.statsT2 .statsTTitle:contains("UNITS")').not(function(a) {
				return !$(this).text().regex(/^\s*UNITS\s*$/im);
			});
			$('.statUnit', $(tmp).parent()).each(function(a, el) {
				var b = $('a img[src]', el);
				var i = ($(b).attr('src') || '').filepart();
				var n = ($(b).attr('title') || $(b).attr('alt') || '').trim();
				var c = ($(el).text() || '').regex(/\bX\s*(\d+)\b/im);
				n = Town.qualify(n, i);
				if (i in self.data.ingredients) {
					if (isNumber(c)) {
						self.set(['ingredients', i], c);
					}
				}
			});

			// some ingredients are items
			tmp = $('.statsT2 .statsTTitle:contains("ITEMS")').not(function(a) {
				return !$(this).text().regex(/^\s*ITEMS\s*$/im);
			});
			$('.statUnit', $(tmp).parent()).each(function(a, el) {
				var b = $('a img[src]', el);
				var i = ($(b).attr('src') || '').filepart();
				var n = ($(b).attr('title') || $(b).attr('alt') || '').trim();
				var c = ($(el).text() || '').regex(/\bX\s*(\d+)\b/im);
				n = Town.qualify(n, i);
				if (i in self.data.ingredients) {
					if (isNumber(c)) {
						self.set(['ingredients', i], c);
					}
				}
			});

			tmp = $('.statsT2 .statsTTitle:contains("ALCHEMY INGREDIENTS")').not(function(a) {
				return !$(this).text().regex(/^\s*ALCHEMY INGREDIENTS\s*$/im);
			});
			$('.statUnit', $(tmp).parent()).each(function(a, el) {
				var b = $('a img[src]', el);
				var i = ($(b).attr('src') || '').filepart();
				var c = $(el).text().regex(/\bX\s*(\d+)\b/i);
				if (i) {
					self.set(['ingredients', i], c || 1);
				} else {
					Page.setStale('keep_alchemy', now);
				}
			});
		}
	}

	// purge (zero) any ingredients we didn't encounter.
	// Note: we need to leave placeholders for all known ingredients so keep
	// parsing knows which unit/item overlaps to watch.
	for (i in ipurge) {
		if (ipurge[i] && this.data.ingredients[i] !== 0) {
			log(LOG_WARN, 'Zero ingredient ' + i + ' [' + (this.data.ingredients[i] || 0) + ']');
			this.set(['data', 'ingredients', i], 0);
		}
	}

	// purge any recipes we didn't encounter.
	for (i in rpurge) {
		if (rpurge[i]) {
			log(LOG_DEBUG, 'Delete recipe ' + i);
			this.set(['recipe', i]);
		}
	}

	// purge any summons we didn't encounter.
	for (i in spurge) {
		if (spurge[i]) {
			log(LOG_DEBUG, 'Delete summon ' + i);
			this.set(['summons', i]);
		}
	}

	return false;
};

Alchemy.update = function(event) {
	var now = Date.now(), best = null, recipe = this.data.recipe, r, i, s;

	if (recipe) {
		for (r in recipe) {
			if (recipe[r].type === 'Recipe') {
				best = r;
				for (i in recipe[r].ingredients) {
					if ((!this.option.hearts && i === 'raid_hearts.gif') || (!this.option.summon && this.data.summons[i]) || recipe[r].ingredients[i] > this.data.ingredients[i]) {
						best = null;
						break;
					}
				}
				if (best) {break;}
			}
		}
	}

	s = undefined;
	if (!best) {
		s = 'Nothing to do.';
	} else {
		s = (this.option._disabled ? 'Would perform ' : 'Perform ') + best;
	}
	Dashboard.status(this, s);

	this.set('runtime.best', best);

	this.set('option._sleep', (this.runtime.wait || 0) > now || !best || Page.isStale('keep_alchemy'));
};

Alchemy.work = function(state) {
	var now = Date.now();

	if (!this.runtime.best && !Page.isStale('keep_alchemy')) {
		return QUEUE_FINISH;
	} else if (!state || !Page.to('keep_alchemy')) {
		return QUEUE_CONTINUE;
	} else {
		log(LOG_INFO, 'Perform - ' + this.runtime.best);
		if (!Page.click($('input[type="image"]', $('div.recipeTitle:contains("' + this.runtime.best + '")').next()))) {
			log(LOG_WARN, "Can't find the recipe - waiting a minute");
			this.set('runtime.wait', now + 60000);
			this._remind(60, 'wait');
		}
	}

	return QUEUE_RELEASE;
};
/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page:true, Queue, Resources,
	Battle, Generals, LevelUp, Player,
	APP, APPID, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, Divisor, length, sum, findInObject, objectIndex, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
	makeImage
*/
/********** Worker Army Extension **********
* This fills in your army information by overloading Worker.Army()
* We are only allowed to replace Army.work() and Army.parse() - all other Army functions should only be overloaded if really needed
* This is the CA version
*/
Army.defaults.castle_age = {
	temp:null,

	pages:'keep_stats army_viewarmy',

	// Careful not to hit any *real* army options
	option:{
		invite:false,
		recheck:0,
		auto:true,
		general:true
	},

	runtime:{
		count:-1, // How many people have we actively seen
		page:0, // Next page we want to look at 
		extra:1, // How many non-real army members are there (you are one of them)
		oldest:0, // Timestamp of when we last saw the oldest member
		check:false
	},
	
	display:[
		//Disabled until Army works correctly
		//{
		//	id:'invite',
		//	label:'Auto-Join New Armies',
		//	checkbox:true
		//},
		{
			id:'general',
			label:'Use Idle General',
			checkbox:true
		},{
			title:'Members',
			group:[
				{
					id:'auto',
					label:'Automatically Check',
					checkbox:true
				},{
					id:'recheck',
					label:'Manually Check',
					select:{
						0:'Never',
						86400000:'Daily',
						259200000:'3 Days',
						604800000:'Weekly',
						1209600000:'2 Weekly',
						2419200000:'4 Weekly'
					}
				}
			]
		}
	]
};

Army._overload('castle_age', 'setup', function() {
	this.section('Changed', { // Second column = Info
		'key':'Army',
		'name':'Changed',
		'show':'Changed',
		'label':function(data,uid){
			var time = Math.floor((Date.now() - (data[uid]._info.changed || 0)) / 86400000);
			return data[uid].Army && data[uid]._info.changed ? time<1 ? 'Today' : time + ' Day' + plural(time) + ' Ago' : '-';
		},
		'sort':function(data,uid){
			return data[uid].Army ? data[uid]._info.changed || 0 : null;
		}
	});
});

Army._overload('castle_age', 'init', function() {
	this.runtime.extra = Math.max(1, this.runtime.extra);
	this._watch(Player, 'data.armymax');
//	if (this.runtime.oldest && this.option.recheck) {
//		this._remind(Math.min(1, Date.now() - this.runtime.oldest + this.option.recheck) / 1000, 'recheck');
//	}
	this._parent();
});

Army._overload('castle_age', 'menu', function(worker, key) {
	if (worker === this) {
		if (!key) {
			return ['fill:Check&nbsp;Army&nbsp;Now'];
		} else if (key === 'fill') {
			this.set(['runtime','page'], 1);
			this.set(['runtime','check'], true);
		}
	}
});

Army._overload('castle_age', 'parse', function(change) {
	if (change && Page.page === 'keep_stats' && !$('.keep_attribute_section').length) { // Not our own keep
		var uid = $('.linkwhite a').attr('href').regex(/=(\d+)$/);
//		log('Not our keep, uid: '+uid);
		if (uid && Army.get(['Army', uid], false)) {
			$('.linkwhite').append(' ' + Page.makeLink('army_viewarmy', {action:'delete', player_id:uid}, 'Remove Member [x]'));
		}
	} else if (!change && Page.page === 'army_viewarmy') {
		var i, page, start, army = this.data = this.data || {}, now = Date.now(), count = 0, $tmp;
		$tmp = $('table.layout table[width=740] div').first().children();
		page = $tmp.eq(1).html().regex(/\<div[^>]*\>(\d+)\<\/div\>/);
		start = $tmp.eq(2).text().regex(/Displaying: (\d+) - \d+/);
		$tmp = $('img[linked="true"][size="square"]');
		if ($tmp.length) {
			$tmp.each(function(i,el){
				var uid = parseInt($(el).attr('uid')), who = $(el).parent().parent().parent().next(), army, level;
				if (uid === userID) {// Shouldn't ever happen!
					return;
				}
				army = Army.data[uid] = Army.data[uid] || {};
				army.Army = true;
				army._info = army._info || {};
				army._info.fbname = $('a', who).text();
				army._info.name = $('a', who).next().text().replace(/^ "|"$/g,'');
				army._info.friend = (army._info.fbname !== 'Facebook User');
				level = $(who).text().regex(/(\d+) Commander/i);
				if (!army._info.changed || army._info.level !== level) {
					army._info.changed = now;
					army._info.level = level;
				}
				army._info.seen = now;
				army._info.page = page;
				army._info.id = start + i;
				Army._taint.data = true;
	//			log(LOG_DEBUG, 'Adding: ' + JSON.stringify(army));
			});
		} else {
			this._set(['runtime','page'], 0);// No real members on this page so stop looking.
			this._set(['runtime','check'], false);
		}
		$tmp = $('img[src*="bonus_member.jpg"]');
		if ($tmp.length) {
			this.runtime.extra = 1 + $tmp.parent().next().text().regex('Extra member x(\d+)');
//			log(LOG_DEBUG, 'Extra Army Members Found: '+Army.runtime.extra);
		}
		for (i in army) {
			if (army[i].Army) {
				if (!army[i]._info || (army[i]._info.page === page && army[i]._info.seen !== now)) {
					delete army[i].Army;// Forget this one, not found on the correct page
				} else {
					count++;// Lets count this one instead
				}
			}
		}
		this._set(['runtime','count'], count);
		if (this.runtime.page) {
			if (page !== this.runtime.page || (!this.runtime.check && Player.get('armymax',0) === (this.runtime.count + this.runtime.extra))) {
				this._set(['runtime','page'], 0);
				this._set(['runtime','check'], false);
			} else {
				this._set(['runtime','page'], page + 1);
			}
		}
//		log(LOG_DEBUG, 'parse: Army.runtime = '+JSON.stringify(this.runtime));
	}
	return this._parent() || true;
});

Army._overload('castle_age', 'update', function(event) {
	this._parent();
	if (!this.option._disabled && event.type !== 'data' && (!this.runtime.page || (this.option.recheck && !this.runtime.oldest))) {
		var i, page = this.runtime.page, army = this.data, ai, now = Date.now(), then = now - this.option.recheck, oldest = this.runtime.oldest;
		if (!page && this.option.auto && Player.get('armymax',0) !== (this.runtime.count + this.runtime.extra)) {
			log(LOG_WARN, 'Army size ('+Player.get('armymax',0)+') does not match cache ('+(this.runtime.count + this.runtime.extra)+'), checking from page 1');
			page = 1;
		}
		if (!page && this.option.recheck) {
			for (i in army) {
				ai = army[i];
				if (ai.Army && ai._info && ai._info.page && ai._info.seen) {
					oldest = Math.min(oldest || Number.MAX_VALUE, ai._info.seen);
					if (!page && ai._info.seen < then) {
						page = Math.min(page || Number.MAX_VALUE, ai._info.page);
					}
				}
			}
			this._set(['runtime','oldest'], oldest);
		}
		this._set(['runtime','page'], page);
//		log(LOG_WARN, 'update('+JSON.shallow(event,1)+'): Army.runtime = '+JSON.stringify(this.runtime));
	}
	this._set(['option','_sleep'], !this.runtime.page);
});

Army._overload('castle_age', 'work', function(state) {
	if (this.runtime.page) {
		if (state && (!this.option.general || Generals.to(Idle.get('option.general','any')))) {
			Page.to('army_viewarmy', {page:this.runtime.page});
		}
		return true;
	}
	return this._parent();
});

/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page:true, Queue, Resources,
	Battle, Generals, LevelUp, Player,
	APP, APPID, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, Divisor, length, sum, findInObject, objectIndex, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
	makeImage
*/
/********** Worker.Bank **********
* Auto-banking
*/
var Bank = new Worker('Bank');
Bank.data = null;

Bank.settings = {
	taint:true
};

Bank.defaults['castle_age'] = {};

Bank.option = {
	general:true,
	auto:true,
	above:10000,
	hand:0,
	keep:10000
};

Bank.temp = {
	force:false
};

Bank.display = [
	{
		id:'general',
		label:'Use Best General',
		checkbox:true
	},{
		id:'auto',
		label:'Bank Automatically',
		checkbox:true
	},{
		id:'above',
		label:'Bank Above',
		text:true
	},{
		id:'hand',
		label:'Keep in Cash',
		text:true
	},{
		id:'keep',
		label:'Keep in Bank',
		text:true
	}
];

Bank.setup = function() {
	// BEGIN: Use global "Show Status" instead of custom option
	if ('status' in this.option) {
		this.set(['option','_hide_status'], !this.option.status);
		this.set(['option','status']);
	}
	// END
};

Bank.init = function() {
	this._watch('Player', 'data.cash');// We want other things too, but they all change in relation to this
};

Bank.work = function(state) {
	if (state) {
		this.stash();
	}
	return QUEUE_CONTINUE;
};

Bank.update = function(event) {
	Dashboard.status(this, // Don't use this.worth() as it ignores this.option.keep
			'Worth: ' + makeImage('gold') + '$' + Player.get('worth', 0).addCommas() + ' (Upkeep ' + ((Player.get('upkeep', 0) / Player.get('maxincome', 1)) * 100).round(2) + '%)<br>' +
			'Income: ' + makeImage('gold') + '$' + (Player.get('income', 0) + History.get('income.average.24')).round(0).addCommas() + ' per hour (currently ' + makeImage('gold') + '$' + Player.get('income', 0).addCommas() + ' from land)');
	this.set('option._sleep', !(this.temp.force || (this.option.auto && Player.get('cash', 0) >= Math.max(10, this.option.above, this.option.hand))));
};

// Return true when finished
Bank.stash = function(amount) {
	var cash = Player.get('cash', 0);
	amount = (isNumber(amount) ? Math.min(cash, amount) : cash) - this.option.hand;
	if (!amount || amount <= 10) {
		return true;
	}
	if ((this.option.general && !Generals.to('bank')) || !Page.to('keep_stats')) {
		return false;
	}
	$('input[name="stash_gold"]').val(amount);
	Page.click('input[value="Stash"]');
	this.set(['temp','force'], false);
	return true;
};

// Return true when finished
Bank.retrieve = function(amount) {
	Worker.find(Queue.get('runtime.current')).settings.bank = true;
	amount -= Player.get('cash', 0);
	if (amount <= 0 || (Player.get('bank', 0) - this.option.keep) < amount) {
		return true; // Got to deal with being poor exactly the same as having it in hand...
	}
	if (!Page.to('keep_stats')) {
		return false;
	}
	$('input[name="get_gold"]').val(amount.toString());
	Page.click('input[value="Retrieve"]');
	return false;
};

Bank.worth = function(amount) { // Anything withdrawing should check this first!
	var worth = Player.get('worth', 0) - this.option.keep;
	if (typeof amount === 'number') {
		return (amount <= worth);
	}
	return worth;
};

Bank.menu = function(worker, key) {
	if (worker === this) {
		if (!key && !this.option._disabled) {
			return ['bank:Bank&nbsp;Now'];
		} else if (key === 'bank') {
			this.set(['temp','force'], true);
		}
	}
};

/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page, Queue, Resources,
	Battle:true, Generals, LevelUp, Monster, Player,
	APP, APPID, warn, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser, console,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, Divisor, length, sum, findInObject, objectIndex, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
	makeImage, getImage
*/
/********** Worker.Battle **********
* Battling other players (NOT raid or Arena)
*/
var Battle = new Worker('Battle');

Battle.settings = {
	taint:true
};

Battle.temp = null;

Battle.defaults['castle_age'] = {
	pages:'battle_rank battle_battle battle_war'
};

Battle.data = {
	user: {},
	rank: {},
	points: {},
	battle: {},
	war: {}
};

Battle.option = {
	general:true,
	general_choice:'any',
	points:'Invade',
	monster:true,
//	arena:false,
	losses:5,
	type:'Invade',
	bp:'Always',
	limit:0,
	chain:0,
	army:1.1,
	level:1.1,
	preferonly:'Sometimes',
	prefer:[],
	between:0,
	risk:false,
	stamina_reserve:0
};

Battle.runtime = {
	attacking:null,
	points:false,
	chain:0 // Number of times current target chained
};

Battle.symbol = { // Demi-Power symbols
	1:getImage('symbol_1'),
	2:getImage('symbol_2'),
	3:getImage('symbol_3'),
	4:getImage('symbol_4'),
	5:getImage('symbol_5')
};
Battle.demi = {
	1:'Ambrosia',
	2:'Malekus',
	3:'Corvintheus',
	4:'Aurora',
	5:'Azeron'
};

Battle.display = [
	{
		id:'general',
		label:'Use Best General',
		checkbox:true
	},{
		advanced:true,
		id:'general_choice',
		label:'Use General',
		require:'!general',
		select:'generals'
	},{
		id:'stamina_reserve',
		label:'Stamina Reserve',
		select:'stamina',
		help:'Keep this much stamina in reserve for other workers.'
	},{
		id:'type',
		label:'Battle Type',
		select:['Invade', 'Duel', 'War'],
		help:'War needs level 100+, and is similar to Duel - though also uses 10 stamina'
	},{
		id:'points',
		label:'Get Demi-Points Type',
		select:['Never', 'Invade', 'Duel'],
		help:'This will make you attack specifically to get Demi-Points every day. War (above) will not earn Demi-Points, but otherwise you will gain them through normal battle - just not necessarily all ten a day'
	},{
		id:'losses',
		label:'Attack Until',
		select:['Ignore',1,2,3,4,5,6,7,8,9,10],
		after:'Losses'
	},{
//		advanced:true,
//		id:'arena',
//		label:'Fight in Arena First',
//		checkbox:true,
//		help:'Only if the Arena is enabled!'
//	},{
		advanced:true,
		id:'monster',
		label:'Fight Monsters First',
		checkbox:true
	},{
		id:'bp',
		label:'Get Battle Points<br>(Clears Cache)',
		select:['Always', 'Never', 'Don\'t Care']
	},{
		advanced:true,
		id:'limit',
		before:'<center>Target Ranks</center>',
		require:'bp=="Always"',
		select:'limit_list',
		after: '<center>and above</center>',
		help:'When Get Battle Points is Always, only fights targets at selected rank and above yours.'
	},{
		advanced:true,
		id:'cache',
		label:'Limit Cache Length',
		select:[100,200,300,400,500]
	},{
		advanced:true,
		id:'between',
		label:'Time Between Attacks<br>(On same target)',
		select:{
			0:'none',
			300000:'5 mins',
			900000:'15 mins',
			1800000:'30 mins',
			3600000:'1 hour',
			7200000:'2 hours',
			21600000:'6 hours',
			43200000:'12 hours',
			86400000:'24 hours'
		},
		help:'Stop yourself from being as noticed, but may result in fewer attacks and slower advancement'
	},{
		advanced:true,
		id:'chain',
		label:'Chain after wins',
		select:[1,2,3,4,5,6,7,8,9,10],
		help:'How many times to chain before stopping'
	},{
		advanced:true,
		id:'risk',
		label:'Risk Death',
		checkbox:true,
		help:'The lowest health you can attack with is 10, but you can lose up to 12 health in an attack, so are you going to risk it???'
	},{
		id:'army',
		require:'type=="Invade"',
		label:'Target Army Ratio<br>(Only needed for Invade)',
		select:['Any', 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.1, 1.2, 1.3, 1.4, 1.5],
		help:'Smaller number for smaller target army. Reduce this number if you\'re losing in Invade'
	},{
		id:'level',
		require:'type!="Invade"',
		label:'Target Level Ratio<br>(Mainly used for Duel)',
		select:['Any', 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.1, 1.2, 1.3, 1.4, 1.5],
		help:'Smaller number for lower target level. Reduce this number if you\'re losing a lot'
	},{
		advanced:true,
		title:'Preferred Targets',
		group:[
			{
				id:'preferonly',
				label:'Fight Preferred',
				select:['Never', 'Sometimes', 'Only', 'Until Dead']
			},{
				id:'prefer',
				multiple:'userid'
			}
		]
	}
];

Battle.setup = function() {
	Resources.use('Stamina');
};

/***** Battle.init() *****
1. Watch Arena and Monster for changes so we can update our target if needed
*/
Battle.init = function() {
	var i, list, rank, data = this.data.user, mode = this.option.type === 'War' ? 'war' : 'battle';
//	this._watch(Arena);
	this._watch(Monster, 'runtime.attack');
	this._watch(this, 'option.prefer');
	if (typeof this.option.points === 'boolean') {
		this.set(['option','points'], this.option.points ? (this.option.type === 'War' ? 'Duel' : this.option.type) : 'Never');
		$(':golem(Battle,points)').val(this.option.points);
	}
/* Old fix for users stored directly in .data - breaks data.battle.rank
	for (i in data) {
		if (!/[^\d]/.test(i) && data[i].rank) {
			this.set(['data','user',i,'battle','rank'], data[i].rank);
			this.set(['data','user',i,'battle','win'], data[i].win);
			this.set(['data','user',i,'battle','loss'], data[i].loss);
			this.set(['data','user',i,'war','rank'], data[i].war);
			delete data[i].rank;
			delete data[i].win;
			delete data[i].loss;
		}
	}
	if (this.data.rank) {
		this.data.battle.rank = this.data.rank;
		delete this.data.rank;
	}
*/
//	this.option.arena = false;// ARENA!!!!!!
	// make a custom Config type of for rank, based on number so it carries forward on level ups
	list = {};
	rank = Player.get(mode,0);
	if (rank < 4) {
		for (i = rank - 4; i < 0; i++) {
			list[i] = '(' + i + ') ' + this.data[mode].rank[0];
		}
	}
	for (i in this.data[mode].rank){
		list[i - rank] = '(' + (i - rank) + ') ' + this.data[mode].rank[i].name;
	}
	Config.set('limit_list', list);

	// map old "(#) rank" string into the number
	i = this.get('option.limit');
	if (isString(i) && (i = i.regex(/\((-?\d+)\)/))) {
		this.set(['option','limit'], i);
	}

	// BEGIN: fix up "under level 4" generals
	if (this.option.general_choice === 'under level 4') {
		this.set(['option','general_choice'], 'under max level');
	}
	// END

	$('.Battle-prefer-on').live('click', function(event) {
		Battle._unflush();
		var uid = $(this).attr('name');
		var prefs = Battle.get('option.prefer');
		if (uid && prefs.find(uid)) {
			prefs.remove(uid);
			Battle._taint['option'] = true;
			Battle._notify('option.prefer');
		}
		$(this).removeClass('Battle-prefer-on');
		$(this).attr('title', 'Click to remove from preferred list.');
		$(this).attr('src', getImage('star_off'));
		$(this).addClass('Battle-prefer-off');
	});

	$('.Battle-prefer-off').live('click', function(event) {
		Battle._unflush();
		var uid = $(this).attr('name');
		var prefs = Battle.get('option.prefer');
		if (uid && !prefs.find(uid)) {
			prefs.push(uid);
			Battle._taint['option'] = true;
			Battle._notify('option.prefer');
		}
		$(this).removeClass('Battle-prefer-off');
		$(this).attr('title', 'Click to add to preferred list.');
		$(this).attr('src', getImage('star_on'));
		$(this).addClass('Battle-prefer-on');
	});
};

/***** Battle.parse() *****
1. On the Battle Rank page parse out our current Rank and Battle Points
2. On the Battle page
2a. Check if we've just attacked someone and parse out the results
2b. Parse the current Demi-Points
2c. Check every possible target and if they're eligable then add them to the target list
*/
Battle.parse = function(change) {
	var i, data, uid, info, $list, $el, tmp, rank, rank2, mode = this.option.type === 'War' ? 'war' : 'battle';
	if (Page.page === 'battle_rank') {
		data = {0:{name:'Newbie',points:0}};
		$('tr[height="23"]').each(function(i,el) {
			var info = $(el).text().regex(/Rank (\d+) - (.*)\s*(\d+)/i);
			data[info[0]] = {name:info[1], points:info[2]};
		});
		this.set(['data','battle','rank'], data);
		this.set(['data','battle','bp'], $('span:contains("Battle Points.")', 'div:contains("You are a Rank")').text().replace(/,/g, '').regex(/with (\d+) Battle Points/i));
	} else if (Page.page === 'battle_war') {
		data = {0:{name:'Newbie',points:0}};
		$('tr[height="23"]').each(function(i,el){
			var info = $(el).text().regex(/Rank (\d+) - (.*)\s*(\d+)/i);
			data[info[0]] = {name:info[1], points:info[2]};
		});
		this.set(['data','war','bp'], $('span:contains("War Points.")', 'div:contains("You are a Rank")').text().replace(/,/g, '').regex(/with (\d+) War Points/i));
		this.set(['data','war','rank'], data);
	} else if (Page.page === 'battle_battle') {
		data = this.data.user;
		if ((uid = this.get(['runtime','attacking']))) {
			tmp = $('div.results').text();
			if ($('img[src*="battle_victory"]').length) {
				if (Player.get('general') === 'Zin'
						&& Generals.get(['data','Zin','charge'],1e99) < Date.now()) {
					Generals.set(['data','Zin','charge'],Date.now() + 82800000);
				}
				if (mode === 'battle') {
					this.set(['data',mode,'bp'], $('span.result_body:contains(" Points.")').text().replace(/,/g, '').regex(/total of (\d+) Battle Points/i));
				}
				this.set(['data','user',uid,mode,'win'], this.get(['data','user',uid,mode,'win'], 0) + 1);
				this.set(['data','user',uid,'last'], Date.now());
				History.add('battle+win',1);
				if (this.option.chain && this.runtime.chain <= this.option.chain) {
					this.set(['runtime','chain'], this.runtime.chain + 1);
				} else { 
					this.set(['runtime','attacking'], null);
					this.set(['runtime','chain'], 0);
				}
			} else if (tmp.match(/You cannot battle someone in your army/i)
					 || tmp.match(/This trainee is too weak. Challenge someone closer to your level/i)
					 || tmp.match(/They are too high level for you to attack right now/i)
					 || tmp.match(/Their army is far greater than yours! Build up your army first before attacking this player!/i)) {
//				log(LOG_DEBUG, 'data[this.runtime.attacking].last ' + data[this.runtime.attacking].last+ ' Date.now() '+ Date.now()) + ' test ' + (data[this.runtime.attacking].last + 300000 < Date.now());
				this.set(['data','user',uid]);
				this.set(['runtime','attacking'], null);
				this.set(['runtime','chain'], 0);
			} else if (tmp.match(/Your opponent is dead or too weak/i)) {
				this.set(['data','user',uid,'hide'], this.get(['data','user',uid,'hide'], 0) + 1);
				this.set(['data','user',uid,'dead'], Date.now());
				this.set(['runtime','attacking'], null);
				this.set(['runtime','chain'], 0);
//			} else if (!$('div.results').text().match(new RegExp(data[uid].name.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&")+"( fought with:|'s Army of (\d+) fought with|'s Defense)",'i'))) {
//			} else if (!$('div.results').text().match(data[uid].name)) {
//				uid = null; // Don't remove target as we've hit someone else...
//				log(LOG_WARN, 'wrong ID');
			} else if ($('img[src*="battle_defeat"]').length) {
				if (Player.get('general') === 'Zin'
						&& Generals.get(['data','Zin','charge'],1e99) < Date.now()) {
					Generals.set(['data','Zin','charge'],Date.now() + 82800000);
				}
				this.set(['runtime','attacking'], null);
				this.set(['runtime','chain'], 0);
				this.set(['data','user',uid,mode,'loss'], this.get(['data','user',uid,mode,'loss'], 0) + 1);
				this.set(['data','user',uid,'last'], Date.now());
				History.add('battle+loss',-1);
			}
		}
		this.set(['data','points'], $('#app46755028429_app_body table.layout table div div:contains("Once a day you can")').text().replace(/[^0-9\/]/g ,'').regex(/(\d+)\/10(\d+)\/10(\d+)\/10(\d+)\/10(\d+)\/10/), isArray);
		rank = {
			battle: Player.get('battle',0),
			war: Player.get('war',0)
		}
		$list = $('#app46755028429_app_body table.layout table table tr:even');
		for (i=0; i<$list.length; i++) {
			$el = $list[i];
			uid = $('img[uid!==""]', $el).attr('uid');
			info = $('td.bluelink', $el).text().replace(/[ \t\n]+/g, ' ');
			rank2 = {
				battle: info.regex(/Battle:[^(]+\(Rank (\d+)\)/i),
				war: info.regex(/War:[^(]+\(Rank (\d+)\)/i)
			}
			if (uid && info && ((Battle.option.bp === 'Always' && rank2[mode] - rank[mode] >= this.option.limit) || (Battle.option.bp === 'Never' && rank[mode]- rank2[mode] >= 5) || Battle.option.bp === "Don't Care")) {
				this.set(['data','user',uid,'name'], $('a', $el).text().trim());
				this.set(['data','user',uid,'level'], info.regex(/\(Level (\d+)\)/i));
				this.set(['data','user',uid,'battle','rank'], rank2.battle);
				this.set(['data','user',uid,'war','rank'], rank2.war);
				this.set(['data','user',uid,'army'], $('td.bluelink', $el).next().text().regex(/(\d+)/));
				this.set(['data','user',uid,'align'], $('img[src*="graphics/symbol_"]', $el).attr('src').regex(/symbol_(\d)/i));
			}
		}
	}
	return false;
};

/***** Battle.update() *****
1. Delete targets who are now too high or too low in rank
2. If our target cache is longer than the user-set limit then prune it
2a. Add every target to an array
2b. Sort the array using weighted values - we want to keep people we win against etc
2c. While the list is too long, delete the extra entries
3. Check if we need to get Battle Points (points.length will be 0 if we don't)
4. Choose our next target
4a. If we don't want points and we want to fight in the arena, then skip
4b. If we don't want points and we want to fight monsters, then skip
4c. Loop through all preferred targets, and add them 10 times
4d. If we need to, now loop through all in target cache and add 1-5 times (more times for higher rank)
4e. Choose a random entry from our list (targets with more entries have more chance of being picked)
5. Update the Status line
*/
Battle.update = function(event) {
	var i, j, data = this.data.user, list = [], points = false, status = [], army = Player.get('army',0), level = Player.get('level'), mode = this.option.type === 'War' ? 'war' : 'battle', rank = Player.get(mode,0), count = 0, skip, limit, enabled = !this.get(['option', '_disabled'], false), tmp;
	tmp = this.get(['data',mode], {});
	status.push('Rank ' + rank + ' ' + this.get([tmp,'rank',rank,'name'], 'unknown', 'string') + ' with ' + this.get([tmp,'bp'], 0, 'number').addCommas() + ' Battle Points, Targets: ' + length(data) + ' / ' + this.option.cache);
	if (event.type === 'watch' && event.id === 'option.prefer') {
		this.dashboard();
		return;
	}
	if (this.option.points !== 'Never') {
		tmp = this.get(['data','points'],[]);
		status.push('Demi Points Earned Today: '
		+ '<img class="golem-image" src="' + this.symbol[1] +'" alt=" " title="'+this.demi[1]+'"> ' + this.get([tmp,0], 0) + '/10 '
		+ '<img class="golem-image" src="' + this.symbol[2] +'" alt=" " title="'+this.demi[2]+'"> ' + this.get([tmp,1], 0) + '/10 '
		+ '<img class="golem-image" src="' + this.symbol[3] +'" alt=" " title="'+this.demi[3]+'"> ' + this.get([tmp,2], 0) + '/10 '
		+ '<img class="golem-image" src="' + this.symbol[4] +'" alt=" " title="'+this.demi[4]+'"> ' + this.get([tmp,3], 0) + '/10 '
		+ '<img class="golem-image" src="' + this.symbol[5] +'" alt=" " title="'+this.demi[5]+'"> ' + this.get([tmp,4], 0) + '/10');
	}
	// First make check our target list doesn't need reducing
	limit = this.get(['option','limit'], -4, isNumber);
	for (i in data) { // Forget low or high rank - no points or too many points
		tmp = this.get([data,i,mode,'rank'],0);
		if ((this.option.bp === 'Always' && tmp - rank < limit) || (this.option.bp === 'Never' && rank - tmp <= 5)) { // unknown rank never deleted
			this.set(['data','user',i]); // Would be nicer to just ignore "bad" targets until they're naturally pruned...
		}
	}
	if (length(data) > this.option.cache) { // Need to prune our target cache
//		log('Pruning target cache');
		list = [];
		for (i in data) {
			list.push(i);
		}
		list.sort(function(a,b) {
			var weight = 0, aa = data[a], bb = data[b];
			if (((aa.win || 0) - (aa.loss || 0)) < ((bb.win || 0) - (bb.loss || 0))) {
				weight += 10;
			} else if (((aa.win || 0) - (aa.loss || 0)) > ((bb.win || 0) - (bb.loss || 0))) {
				weight -= 10;
			}
			if (Battle.option.bp === 'Always') {
				weight += ((bb.rank || 0) - (aa.rank || 0)) / 2;
			}
			if (Battle.option.bp === 'Never') {
				weight += ((aa.rank || 0) - (bb.rank || 0)) / 2;
			}
			weight += Math.range(-1, (bb.hide || 0) - (aa.hide || 0), 1);
			weight += Math.range(-10, (((aa.army || 0) - (bb.army || 0)) / 10), 10);
			weight += Math.range(-10, (((aa.level || 0) - (bb.level || 0)) / 10), 10);
			return weight;
		});
		while (list.length > this.option.cache) {
			this.set(['data','user',list.pop()]);
		}
	}
	// Check if we need Demi-points
//	log(LOG_WARN, 'Queue Logic = ' + enabled);
	points = this.set(['runtime','points'], this.option.points !== 'Never' && sum(this.get(['data','points'], [0])) < 50 && enabled);
	// Second choose our next target
/*	if (!points.length && this.option.arena && Arena.option.enabled && Arena.runtime.attacking) {
		this.runtime.attacking = null;
		status.push('Battling in the Arena');
	} else*/
	if (!points && (this.option.monster || LevelUp.runtime.big) && Monster.get('runtime.attack',false)) {
		this.set(['runtime','attacking'], null);
		status.push('Attacking Monsters');
	} else {
		if (!this.runtime.attacking || !data[this.runtime.attacking]
		|| (this.option.army !== 'Any' && (data[this.runtime.attacking].army / army) * (data[this.runtime.attacking].level / level) > this.option.army)
		|| (this.option.level !== 'Any' && (data[this.runtime.attacking].level / level) > this.option.level)
		|| (this.option.type === 'War' && data[this.runtime.attacking].last && data[this.runtime.attacking].last + 300000 < Date.now())) {
			this.set(['runtime','attacking'], null);
		}
//		log(LOG_DEBUG, 'data[this.runtime.attacking].last ' + data[this.runtime.attacking].last+ ' Date.now() '+ Date.now()) + ' test ' + (data[this.runtime.attacking].last + 300000 < Date.now());
		skip = {};
		list = [];
		for(j=0; j<this.option.prefer.length; j++) {
			i = this.option.prefer[j];
			if (!/\D/g.test(i)) {
				if (this.option.preferonly === 'Never') {
					skip[i] = true;
					continue;
				}
				data[i] = data[i] || {};
				if ((data[i].dead && data[i].dead + 300000 >= Date.now()) // If they're dead ignore them for 1hp = 5 mins
				|| (data[i].last && data[i].last + this.option.between >= Date.now()) // If we're spacing our attacks
				|| (typeof this.option.losses === 'number' && (data[i][mode].loss || 0) - (data[i][mode].win || 0) >= this.option.losses) // Don't attack someone who wins more often
				|| (points && data[i].align && this.data.points[data[i].align - 1] >= 10)) {
					continue;
				}
				list.push(i,i,i,i,i,i,i,i,i,i); // If on the list then they're worth at least 10 ;-)
				count++;
			}
		}
		if (this.option.preferonly === 'Never' || this.option.preferonly === 'Sometimes' || (this.option.preferonly === 'Only' && !this.option.prefer.length) || (this.option.preferonly === 'Until Dead' && !list.length)) {
			for (i in data) {
				if (skip[i] // If filtered out in preferred list
				|| (data[i].dead && data[i].dead + 1800000 >= Date.now()) // If they're dead ignore them for 3m * 10hp = 30 mins
				|| (data[i].last && data[i].last + this.option.between >= Date.now()) // If we're spacing our attacks
				|| (typeof this.option.losses === 'number' && (data[i][mode].loss || 0) - (data[i][mode].win || 0) >= this.option.losses) // Don't attack someone who wins more often
				|| (this.option.army !== 'Any' && ((data[i].army || 0) / army) * (data[i].level || 0) / level > this.option.army && this.option.type === 'Invade')
				|| (this.option.level !== 'Any' && ((data[i].level || 0) / level) > this.option.level && this.option.type !== 'Invade')
				|| (points && (!data[i].align || this.data.points[data[i].align - 1] >= 10))) {
					continue;
				}
				if (Battle.option.bp === 'Always') {
					for (j=Math.range(1,(data[i][mode].rank || 0)-rank+1,5); j>0; j--) { // more than 1 time if it's more than 1 difference
						list.push(i);
					}
				} else {
					list.push(i);
				}
				count++;
			}
		}
		if (!this.runtime.attacking && list.length) {
			this.set(['runtime','attacking'], list[Math.floor(Math.random() * list.length)]);
		}
		if (this.runtime.attacking) {
			i = this.runtime.attacking;
			if (isString(data[i].name) && data[i].name.trim() !== '') {
				j = data[i].name.html_escape();
			} else {
				j = '<i>id:</i> ' + i;
			}
			status.push('Next Target: <img class="golem-image" src="' + this.symbol[data[i].align] +'" alt=" " title="'+this.demi[data[i].align]+'"> ' + j + ' (Level ' + data[i].level + (data[i][mode].rank && this.data[mode].rank[data[i][mode].rank] ? ' ' + this.data[mode].rank[data[i][mode].rank].name : '') + ' with ' + data[i].army + ' army)' + (count ? ', ' + count + ' valid target' + plural(count) : ''));
		} else {
			this.set(['runtime','attacking'], null);
			status.push('No valid targets found.');
			this._remind(60); // No targets, so check again in 1 minute...
		}
	}
	Dashboard.status(this, status.join('<br>'));
};

/***** Battle.work() *****
1. If we don't have a target, not enough health, or not enough stamina, return false
2. Otherwise
2a. Ask to work
2b. Get the correct General
2c. Go to the right page
3. Select our target
3a. Replace the first target on the page with the target we want to attack
3b. If we can't find any targets to replace / attack then force a reload
3c. Click the Invade / Dual attack button
*/
Battle.work = function(state) {
	var useable_stamina = LevelUp.runtime.force.stamina ? LevelUp.runtime.stamina : LevelUp.runtime.stamina - this.option.stamina_reserve;
	if (!this.runtime.attacking || Player.get('health',0) < (this.option.risk ? 10 : 13) 
			|| useable_stamina < (!this.runtime.points && this.option.type === 'War' ? 10 : 1)
			|| LevelUp.runtime.big) {
//		log(LOG_WARN, 'Not attacking because: ' + (this.runtime.attacking ? '' : 'No Target, ') + 'Health: ' + Player.get('health',0) + ' (must be >=10), Burn Stamina: ' + useable_stamina + ' (must be >=1)');
		return QUEUE_FINISH;
	}
	if (!state || !Generals.to(Generals.runtime.zin || (this.option.general ? (this.runtime.points ? this.option.points : this.option.type) : this.option.general_choice)) || !Page.to('battle_battle')) {
		return QUEUE_CONTINUE;
	}
	/*jslint onevar:false*/
	var $symbol_rows = $('#app46755028429_app_body table.layout table table tr:even').has('img[src*="graphics/symbol_'+this.data.user[this.runtime.attacking].align+'"]');
	var $form = $('form input[alt="' + (this.runtime.points ? this.option.points : this.option.type) + '"]', $symbol_rows).first().parents('form');
	/*jslint onevar:true*/
	if (!$form.length) {
		log(LOG_WARN, 'Unable to find ' + (this.runtime.points ? this.option.points : this.option.type) + ' button, forcing reload');
		Page.to('index');
	} else {
		log(LOG_INFO, (this.runtime.points ? this.option.points : this.option.type) + ' ' + this.data.user[this.runtime.attacking].name + ' (' + this.runtime.attacking + ')');
		$('input[name="target_id"]', $form).attr('value', this.runtime.attacking);
		Page.click($('input[type="image"]', $form));
	}
	return QUEUE_RELEASE;
};

Battle.rank = function(name) {
	var i, mode = this.get(['data',this.option.type === 'War' ? 'war' : 'battle','rank'],{});
	for (i in mode) {
		if (this.get([mode,i,'name']) === name) {
			return parseInt(i, 10);
		}
	}
	return 0;
};

Battle.order = [];
Battle.dashboard = function(sort, rev) {
	var i, o, points = [0, 0, 0, 0, 0, 0], list = [], output = [], sorttype = ['align', 'name', 'level', 'rank', 'army', '*pref', 'win', 'loss', 'hide'], data = this.data.user, army = Player.get('army',0), level = Player.get('level',0), mode = this.option.type === 'War' ? 'war' : 'battle';
	for (i in data) {
		points[data[i].align]++;
	}
	var prefs = {};
	for (i = 0; i < this.option.prefer.length; i++) {
		prefs[this.option.prefer[i]] = 1;
	}
	var pref_img_on = '<img class="Battle-prefer-on" src="' + getImage('star_on') + '" title="Click to remove from preferred list." name="';
	var pref_img_off = '<img class="Battle-prefer-off" src="' + getImage('star_off') + '" title="Click to add to preferred list." name="';
	var pref_img_end = '">';
	if (typeof sort === 'undefined') {
		this.order = [];
		for (i in data) {
			this.order.push(i);
		}
	}
	if (typeof sort === 'undefined') {
		sort = (this.runtime.sort || 1);
	}
	if (typeof rev === 'undefined'){
		rev = (this.runtime.rev || false);
	}
	this.runtime.sort = sort;
	this.runtime.rev = rev;
	if (typeof sorttype[sort] === 'string') {
		var str = '';
		this.order.sort(function(a,b) {
			var aa, bb;
			if (sorttype[sort] === '*pref') {
				aa = prefs[a] || 0;
				bb = prefs[b] || 0;
				str += '\n' + a + ' = ' + aa;
				str += ', ' + b + ' = ' + bb;
			} else {
				aa = data[a][mode][sorttype[sort]] || data[a][sorttype[sort]] || 0;
				bb = data[b][mode][sorttype[sort]] || data[b][sorttype[sort]] || 0;
			}
			if (typeof aa === 'string' || typeof bb === 'string') {
				return (rev ? (''+bb).localeCompare(aa) : (''+aa).localeCompare(bb));
			}
			return (rev ? aa - bb : bb - aa);
		});
	}
	list.push('<div style="text-align:center;"><strong>Rank:</strong> ' + (this.data[mode].rank && this.data[mode].rank[Player.get(mode,0)] ? this.data[mode].rank[Player.get(mode,0)].name : 'unknown') + ' (' + Player.get(mode,0) + '), <strong>Targets:</strong> ' + length(data) + ' / ' + this.option.cache + ', <strong>By Alignment:</strong>');
	for (i=1; i<6; i++ ) {
		list.push(' <img class="golem-image" src="' + this.symbol[i] +'" alt="'+this.demi[i]+'" title="'+this.demi[i]+'"> ' + points[i]);
	}
	list.push('</div><hr>');
	th(output, 'Align');
	th(output, 'Name');
	th(output, 'Level');
	th(output, 'Rank');
	th(output, 'Army');
	th(output, 'Pref');
	th(output, 'Wins');
	th(output, 'Losses');
	th(output, 'Hides');
	list.push('<table cellspacing="0" style="width:100%"><thead><tr>' + output.join('') + '</tr></thead><tbody>');
	for (o=0; o<this.order.length; o++) {
		data = this.data.user[this.order[o]];
		output = [];
		td(output, isNumber(data.align) ? '<img class="golem-image" src="' + this.symbol[data.align] + '" alt="' + this.demi[data.align] + '">' : '', isNumber(data.align) ? 'title="' + this.demi[data.align] + '"' : null);
		th(output, data.name.html_escape(), 'title="'+this.order[o]+'"');
		td(output, (this.option.level !== 'Any' && (data.level / level) > this.option.level) ? '<i>'+data.level+'</i>' : data.level);
		td(output, this.get(['data',mode,'rank',data[mode].rank,'name'], '', 'string'));
		td(output, (this.option.army !== 'Any' && (data.army / army * data.level / level) > this.option.army) ? '<i>'+data.army+'</i>' : data.army);
		td(output, (prefs[this.order[o]] ? pref_img_on : pref_img_off) + this.order[o] + pref_img_end);
		td(output, data[mode].win || '');
		td(output, data[mode].loss || '');
		td(output, data.hide || '');
		tr(list, output.join(''));
	}
	list.push('</tbody></table>');
	$('#golem-dashboard-Battle').html(list.join(''));
	$('#golem-dashboard-Battle tbody tr td:nth-child(2)').css('text-align', 'left');
	if (typeof sort !== 'undefined') {
		$('#golem-dashboard-Battle thead th:eq('+sort+')').attr('name',(rev ? 'reverse' : 'sort')).append('&nbsp;' + (rev ? '&uarr;' : '&darr;'));
	}
};

/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page:true, Queue, Resources,
	Battle, Generals, LevelUp, Player,
	APP, APPID, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, Divisor, length, sum, findInObject, objectIndex, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
	makeImage
*/
/********** Worker.Blessing **********
* Automatically receive blessings
*/
var Blessing = new Worker('Blessing');
Blessing.data = Blessing.temp = null;

Blessing.settings = {
	taint:true
};

Blessing.defaults['castle_age'] = {
	pages:'oracle_demipower'
};

Blessing.option = {
	which:'Stamina'
};

Blessing.runtime = {
	when:0
};

Blessing.which = ['None', 'Energy', 'Attack', 'Defense', 'Health', 'Stamina'];
Blessing.display = [
    {
		id:'which',
		label:'Which',
		select:Blessing.which
    }
];

Blessing.setup = function() {
	// BEGIN: Use global "Show Status" instead of custom option
	if ('display' in this.option) {
		this.set(['option','_hide_status'], !this.option.display);
		this.set(['option','display']);
	}
	// END
};

Blessing.init = function() {
	var when = this.get(['runtime','when'],0);
	if (when) {
		this._remind((when - Date.now()) / 1000, 'blessing');
	}
};

Blessing.parse = function(change) {
	var result = $('div.results'), time, when;
	if (result.length) {
		time = result.text().regex(/Please come back in: (\d+) hours and (\d+) minutes/i);
		if (time && time.length) {
			this.set(['runtime','when'], Date.now() + (((time[0] * 60) + time[1] + 1) * 60000));
		} else if (result.text().match(/You have paid tribute to/i)) {
			this.set(['runtime','when'], Date.now() + 86460000); // 24 hours and 1 minute
		}
		if ((when = this.get(['runtime','when'],0))) {
			this._remind((when - Date.now()) / 1000, 'blessing');
		}
	}
	return false;
};

Blessing.update = function(event){
    var d, demi;
     if (this.option.which && this.option.which !== 'None'){
         d = new Date(this.runtime.when);
         switch(this.option.which){
             case 'Energy':
                 demi = '<img class="golem-image" src="'+getImage('symbol_1')+'"> Ambrosia (' + this.option.which + ')';
                 break;
             case 'Attack':
                 demi = '<img class="golem-image" src="'+getImage('symbol_2')+'"> Malekus (' + this.option.which + ')';
                 break;
             case 'Defense':
                 demi = '<img class="golem-image" src="'+getImage('symbol_3')+'"> Corvintheus (' + this.option.which + ')';
                 break;
             case 'Health':
                 demi = '<img class="golem-image" src="'+getImage('symbol_4')+'"> Aurora (' + this.option.which + ')';
                 break;
             case 'Stamina':
                 demi = '<img class="golem-image" src="'+getImage('symbol_5')+'"> Azeron (' + this.option.which + ')';
                 break;
             default:
                 demi = 'Unknown';
                 break;
         }
         Dashboard.status(this, '<span title="Next Blessing">' + 'Next Blessing performed on ' + d.format('l g:i a') + ' to ' + demi + ' </span>');
		 this.set(['option','_sleep'], Date.now() < this.runtime.when);
     } else {
         Dashboard.status(this);
 		 this.set(['option','_sleep'], true);
    }
};

Blessing.work = function(state) {
	if (!state || !Page.to('oracle_demipower')) {
		return QUEUE_CONTINUE;
	}
	Page.click('#app46755028429_symbols_form_'+this.which.indexOf(this.option.which)+' input.imgButton');
	return QUEUE_RELEASE;
};

/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page:true, Queue, Resources,
	Battle, Generals, LevelUp, Player,
	APP, APPID, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, window, browser,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, Divisor, length, sum, findInObject, objectIndex, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
	makeImage
*/
/********** Worker.Elite() **********
* Build your elite army
*/
var Elite = new Worker('Elite');
Elite.data = Elite.temp = null;

Elite.settings = {
	taint:true
};

Elite.defaults['castle_age'] = {
	pages:'* keep_eliteguard army_viewarmy'
};

Elite.option = {
	every:12,
	friends:true,
	armyperpage:25 // Read only, but if they change it and I don't notice...
};

Elite.runtime = {
	armylastpage:1,
	armyextra:0,
	waitelite:0,
	nextelite:0
};

Elite.display = [
	{
		id:'friends',
		label:'Facebook Friends Only',
		checkbox:true
	},{
		id:'every',
		label:'Check Every',
		select:[1, 2, 3, 6, 12, 24],
		after:'hours',
		help:'Although people can leave your Elite Guard after 24 hours, after 12 hours you can re-confirm them'
	}
];

Elite.setup = function() {
	Army.section(this.name, {
		'key':'Elite',
		'name':'Elite',
		'show':'Elite',
		'label':function(data,uid){
			return ('Elite' in data[uid]
				? ('prefer' in data[uid]['Elite'] && data[uid]['Elite']['prefer']
					? '<img src="' + getImage('star_on') + '">'
					: '<img src="' + getImage('star_off') + '">')
				 + ('elite' in data[uid]['Elite'] && data[uid]['Elite']['elite']
					? ' <img src="' + getImage('timer') + '" title="Member until: ' + makeTime(data[uid]['Elite']['elite']) + '">'
					: '')
				 + ('full' in data[uid]['Elite'] && data[uid]['Elite']['full']
					? ' <img src="' + getImage('timer_red') + '" title="Full until: ' + makeTime(data[uid]['Elite']['full']) + '">'
					: '')
				: ('Army' in data[uid] && data[uid]['Army']
					? '<img src="' + getImage('star_off') + '">'
					: '')
				);
		},
		'sort':function(data,uid){
			if (!('Elite' in data[uid]) && !('Army' in data[uid]) && !data[uid]['Army']) {
				return 0;
			}
			return (('prefer' in data[uid]['Elite'] && data[uid]['Elite']['prefer']
					? Date.now()
					: 0)
				+ ('elite' in data[uid]['Elite']
					? Date.now() - parseInt(data[uid]['Elite']['elite'], 10)
					: 0)
				+ ('full' in data[uid]['Elite']
					? Date.now() - parseInt(data[uid]['Elite']['full'], 10)
					: 0));
		},
		'click':function(data,uid){
			if (Army.get(['Elite',uid,'prefer'], false)) {
				Army.set(['Elite',uid,'prefer']);
			} else {
				Army.set(['Elite',uid,'prefer'], true);
			}
			return true;
		}
	});
};

Elite.init = function() {
	if (!this.get(['option','elite'], true)) {
		this.option._disabled = true;
		this.set(['option','elite']);
	}
};

Elite.menu = function(worker, key) {
	if (worker === this) {
		if (!key) {
			return ['fill:Fill&nbsp;Elite&nbsp;Guard&nbsp;Now'];
		} else if (key === 'fill') {
			this.set('runtime.waitelite', 0);
		}
	}
};

Elite.parse = function(change) {
	if (Page.page === 'keep_eliteguard') {
		$('span.result_body').each(function(i,el){
			var txt = $(el).text();
			if (txt.match(/Elite Guard, and they have joined/i)) {
				Army.set([$('img', el).attr('uid'), 'elite'], Date.now() + 86400000); // 24 hours
				Elite.set(['runtime','nextelite']);
			} else if (txt.match(/'s Elite Guard is FULL!/i)) {
				Army.set([$('img', el).attr('uid'), 'full'], Date.now() + 1800000); // half hour
				Elite.set(['runtime','nextelite']);
			} else if (txt.match(/YOUR Elite Guard is FULL!/i)) {
				Elite.set(['runtime','waitelite'], Date.now());
				Elite.set(['runtime','nextelite']);
				log(LOG_INFO, 'Elite guard full, wait '+Elite.option.every+' hours');
			}
		});
	} else {
		if ($('input[src*="elite_guard_add"]').length) {
			this.set(['runtime','waitelite'], 0);
		}
	}
	return false;
};

Elite.update = function(event) {
	var i, list, tmp = [], now = Date.now(), check, next;
	if (!this.get(['option', '_disabled'], false)) {
		list = Army.get('Elite');// Try to keep the same guards
		for(i=0; i<list.length; i++) {
			check = Army.get([list[i],'elite'], 0) || Army.get([list[i],'full'], 0);
			if (check < now) {
				Army.set([list[i],'elite']);// Delete the old timers if they exist...
				Army.set([list[i],'full']);// Delete the old timers if they exist...
				if (Army.get([list[i],'prefer'], false)) {// Prefer takes precidence
					next = list[i];
					break;
				}
				if (!next && (!this.option.friends || Army.get(['_info',list[i],'friend'], false))) { // Only facebook friends unless we say otherwise
					next = list[i];// Earlier in our army rather than later
				}
			}
		}
		if (!next) {
			list = Army.get('Army');// Otherwise lets just get anyone in the army
			for(i=0; i<list.length; i++) {
				if (!Army.get([list[i],'elite'], 0) && !Army.get([list[i],'full'], 0) && (!this.option.friends || Army.get(['_info',list[i],'friend'], false))) {// Only try to add a non-member who's not already added
					next = list[i];
					break;
				}
			}
		}
		check = ((this.runtime.waitelite + (this.option.every * 3600000)) - now) / 1000;
		tmp.push('Elite Guard: Check' + (check <= 0 ? 'ing now' : ' in ' + Page.addTimer('elite', check * 1000, true)) + (next ? ', Next: '+Army.get(['_info', next, 'name']) : ''));
		if (next && this.runtime.waitelite) {
			this._remind(check, 'recheck');
		}
	}
	this.set(['runtime','nextelite'], next);
	this.set(['option','_sleep'], !next || (this.runtime.waitelite + (this.option.every * 3600000)) > now);
	Dashboard.status(this, tmp.join('<br>'));
};

Elite.work = function(state) {
	if (state) {
		log(LOG_INFO, 'Add ' + Army.get(['_info', this.runtime.nextelite, 'name'], this.runtime.nextelite) + ' to Elite Guard');
		Page.to('keep_eliteguard', {twt:'jneg' , jneg:true, user:this.runtime.nextelite});
	}
	return true;
};

/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page, Queue, Resources,
	Battle, Generals:true, Idle, LevelUp, Player, Town,
	APP, APPID, warn, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser, console,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, Divisor, length, sum, findInObject, objectIndex, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
	makeImage, bestObjValue,
*/
/********** Worker.Generals **********
* Updates the list of Generals
* Finds best General for other classes
* *** Need to take into account army size and real stats for attack and defense
*/
var Generals = new Worker('Generals');
Generals.temp = null;

Generals.settings = {
	unsortable:true,
	taint:true
};

Generals.defaults['castle_age'] = {
	pages:'* heroes_generals heroes_heroes keep_stats'
};

Generals.option = {
	zin:false
};

Generals.display = [
	{
		id:'zin',
		label:'Automatically use Zin',
		checkbox:true
	}
];

Generals.runtime = {
	multipliers: {}, // Attack multipliers list for Orc King and Barbarus type generals
	force: false,
	armymax:1 // Don't force someone with a small army to buy a whole load of extra items...
};

Generals.init = function(old_revision) {
	if (!Player.get('attack') || !Player.get('defense')) { // Only need them the first time...
		this._watch(Player, 'data.attack');
		this._watch(Player, 'data.defense');
	}
	this._watch(Player, 'data.army');
	this._watch(Player, 'data.armymax');
	this._watch(Town, 'runtime.invade');
	this._watch(Town, 'runtime.duel');
	this._watch(Town, 'runtime.war');
	this._watch(Town, 'data'); // item counts

	// last recalc revision is behind the current, fire a reminder
	if (this.get('runtime.revision', 0, 'number') < revision) {
		this._remind(1, 'revision');
	} else if (this.get('runtime.force')) {
		this._remind(1, 'force');
	}
};

Generals.parse = function(change) {
	var now = Date.now(), self = this, i, j, seen = {}, el, el2, tmp, name, item, icon;

	if (($('div.results').text() || '').match(/has gained a level!/i)) {
		if ((name = Player.get('general'))) { // Our stats have changed but we don't care - they'll update as soon as we see the Generals page again...
			this.add(['data',name,'level'], 1);
			if (Page.page !== (j = 'heroes_generals')) {
				Page.setStale(j, now);
			}
		}
	}

	if (Page.page === 'heroes_generals') {
		tmp = $('.generalSmallContainer2');
		for (i=0; i<tmp.length; i++) {
			el = tmp[i];
			try {
				this._transaction(); // BEGIN TRANSACTION
				name = $('.general_name_div3_padding', el).text().trim();
				assert(name && name.indexOf('\t') === -1 && name.length < 30, 'Bad general name - found tab character');
				seen[name] = true;
				assert(this.set(['data',name,'id'], parseInt($('input[name=item]', el).val()), 'number') !== false, 'Bad general id: '+name);
				assert(this.set(['data',name,'type'], parseInt($('input[name=itype]', el).val()), 'number') !== false, 'Bad general type: '+name);
				assert(this.set(['data',name,'img'], $('.imgButton', el).attr('src').filepart(), 'string'), 'Bad general image: '+name);
				assert(this.set(['data',name,'att'], $('.generals_indv_stats_padding div:eq(0)', el).text().regex(/(\d+)/), 'number') !== false, 'Bad general attack: '+name);
				assert(this.set(['data',name,'def'], $('.generals_indv_stats_padding div:eq(1)', el).text().regex(/(\d+)/), 'number') !== false, 'Bad general defense: '+name);
				this.set(['data',name,'progress'], j = parseInt($('div.generals_indv_stats', el).next().children().children().children().next().attr('style').regex(/width: (\d*\.*\d+)%/im), 10));
				// If we just maxed level, remove the priority
				if ((j || 0) >= 100) {
					this.set(['data',name,'priority']);
				}
				this.set(['data',name,'skills'], $(el).children(':last').html().replace(/\<[^>]*\>|\s+/gm,' ').trim());
				j = parseInt($('div.generals_indv_stats', el).next().next().text().regex(/(\d*\.*\d+)% Charged!/im), 10);
				if (j) {
					this.set(['data',name,'charge'], Date.now() + Math.floor(3600000 * ((1-j/100) * this.data[name].skills.regex(/(\d*) Hour Cooldown/im))));
					//log(LOG_WARN, name + ' ' + makeTime(this.data[name].charge, 'g:i a'));
				}
				this.set(['data',name,'level'], parseInt($(el).text().regex(/Level (\d+)/im), 10));
				this.set(['data',name,'own'], 1);
				this._transaction(true); // COMMIT TRANSACTION
			} catch(e) {
				this._transaction(false); // ROLLBACK TRANSACTION on any error
				log(LOG_ERROR, e.name + ' in ' + this.name + '.parse(' + change + '): ' + e.message);
			}
		}

		// parse general equipment, including those not yet owned
		name = $('div.general_name_div3').first().text().trim();
		if (this.get(['data',name])) {
			tmp = $('div[style*="model_items.jpg"] img[title]');
			for (i=0; i<tmp.length; i++) {
				el = tmp[i];
				item = $(el).attr('title');
				icon = ($(el).attr('src') || '').filepart();
				if (isString(item)) {
					item = item.replace('[not owned]', ' ').replace(/\<^>]*\>|\s+/gim, ' ').trim();
					if ((j = item.match(/^\s*([^:]*\w)\s*:\s*(.*\w)\s*$/i))) {
						item = Town.qualify(j[1], icon);
						Resources.set(['_'+item,'generals'], Math.max(1, Resources.get(['_'+item,'generals'], 0, 'number')));
						this.set(['data',name,'equip',item], j[2]);
					}
				}
			}
			i = ($('div.general_pic_div3 a img[title]').first().attr('title') || '').trim();
			if (i && (j = i.regex(/\bmax\.? (\d+)\b/im))) {
				this.set(['data', name, 'stats', 'cap'], j);
			}
			this.set(['data',name,'seen'], now);
		}

		// purge generals we didn't see
		for (i in this.data) {
			if (!seen[i]) {
				this.set(['data',i]);
			}
		}
	} else if (Page.page === 'heroes_heroes') {
		// parse upkeep
		if ((tmp = $('.mContTMainBack div:contains("Total Upkeep")')).length) {
			j = ($('b.negative', tmp).text() || '').replace(/,/gm, '');
			if (isNumber(i = j.regex(/^\s*-?\$(\d+)\s*$/m))) {
				Player.set('upkeep', i);
			}
		}

		// parse purchasable heroes
		tmp = $('.hero_buy_row');
		for (j = 0; j < tmp.length; j++) {
			el = tmp[j];
			el2 = $('.hero_buy_image img', el);
			name = ($(el2).attr('title') || '').trim();
			if (name) {
				try {
					self._transaction(); // BEGIN TRANSACTION
					icon = ($(el2).attr('src') || '').filepart();
					info = $('.hero_buy_info', el);
					stats = $('.hero_select_stats', el);
					costs = $('.hero_buy_costs', el);
					i = $('form', costs).attr('id') || '';
					if (isNumber(i = i.regex(/^app\d+_item(?:buy|sell)_(\d+)$/i))) {
						self.set(['data',name,'id'], i);
					}

					if (icon) {
						self.set(['data',name,'img'], icon);
					}

					// only use these atk/def values if we don't know this general
					if (!self.data[name]) {
						i = $('div:contains("Attack")', stats).text() || '';
						if (isNumber(i = i.regex(/\b(\d+)\s*Attack\b/im))) {
							self.set(['data',name,'att'], i);
						}

						i = $('div:contains("Defense")', stats).text() || '';
						if (isNumber(i = i.regex(/\b(\d+)\s*Defense\b/im))) {
							self.set(['data',name,'def'], i);
						}
					}

					i = $(costs).text() || '';
					if ((i = i.regex(/\bRecruited:\s*(\w+)\b/im))) {
						self.set(['data',name,'own'], i.toLowerCase() === 'yes' ? 1 : 0);
					}

					i = $('.gold', costs).text() || '';
					if (isNumber(i = i.replace(/,/gm, '').regex(/\$(\d+)\b/im))) {
						self.set(['data',name,'cost'], i);
					}

					i = $('div:contains("Upkeep") .negative', info).text() || '';
					if (isNumber(i = i.replace(/,/gm, '').regex(/\$(\d+)\b/im))) {
						self.set(['data',name,'upkeep'], i);
					}
					self._transaction(true); // COMMIT TRANSACTION
				} catch (e2) {
					self._transaction(false); // ROLLBACK TRANSACTION on any error
					log(LOG_ERROR, e2.name + ' in ' + self.name + '.parse(' + change + '): ' + e2.message);
				}
			}
		}
	} else if (Page.page === 'keep_stats') {
		// Only when it's our own keep and not someone elses
		if ($('.keep_attribute_section').length) {
			tmp = $('.statsT2 .statsTTitle:contains("HEROES")').not(function(a) {
				return !$(this).text().regex(/^\s*HEROES\s*$/im);
			});
			tmp = $('.statUnit', $(tmp).parent());
			for (i=0; i<tmp.length; i++) {
				el = $('a img[src]', tmp[i]);
				name = ($(el).attr('title') || $(el).attr('alt') || '').trim();

				// new general(s), trigger page visits
				if (name && !this.get(['data',name])) {
					Page.setStale('heroes_heroes', now);
					Page.setStale('heroes_generals', now);
					break;
				}
			}
		}
	}
	return false;
};

Generals.resource = function() {
	Generals.runtime.zin = false;
	if (Generals.option.zin && Generals.get(['data','Zin','charge'],1e99) < Date.now()) {
		Generals.runtime.zin = 'Zin';
		LevelUp.runtime.force.stamina = true;
		return 'stamina';
	}
	return false;
};

Generals.update = function(event, events) {
	var data = this.data, i, j, k, o, p, pa, priority_list = [], list = [],
		pattack, pdefense, maxstamina, maxenergy, stamina, energy,
		army, armymax, gen_att, gen_def, war_att, war_def,
		invade = Town.get('runtime.invade'),
		duel = Town.get('runtime.duel'),
		war = Town.get('runtime.war'),
		attack, attack_bonus, att_when_att = 0, current_att,
		defend, defense_bonus, def_when_att = 0, current_def,
		monster_att = 0, monster_multiplier = 1,
		listpush = function(list,i){list.push(i);},
		skillcombo, calcStats = false, all_stats, bests;

	if (events.findEvent(this, 'init') >= 0 || events.findEvent(this, 'data') >= 0) {
		bests = true;

		k = 0;
		for (i in data) {
			list.push(i);
			p = data[i];
			if ((isNumber(j = p.progress) ? j : 100) < 100) { // Take all existing priorities and change them to rank starting from 1 and keeping existing order.
				priority_list.push([i, p.priority]);
			}
			if (!p.stats) { // Force an update if stats not yet calculated
				this.set(['runtime','force'], true);
			}
			k += p.own || 0;
			if (p.skills) {
				var x, y, num = 0, cap = 0, item, str = null;
				if ((x = p.skills.regex(/\bevery (\d+) ([\w\s']*\w)/im))) {
					num = x[0];
					str = x[1];
				} else if ((x = p.skills.regex(/\bevery ([\w\s']*\w)/im))) {
					num = 1;
					str = x;
				}
				if (p.stats && p.stats.cap) {
					cap = Math.max(cap, p.stats.cap);
				}
				if ((x = p.skills.regex(/\bmax\.? (\d+)/i))) {
					cap = Math.max(cap, x);
				}
				if (str) {
					for (x = str.split(' '); x.length > 0; x.pop()) {
						str = x.join(' ');
						if ((y = str.regex(/^(.+)s$/i))) {
							if (Town.get(['data', y])) {
								item = y;
								break;
							}
						}
						if (Town.get(['data', str])) {
							item = str;
							break;
						}
					}
				}
				if (num && item) {
					Resources.set(['data', '_' + item, 'generals'], num * cap);
//					log(LOG_WARN, 'Save ' + (num * cap) + ' x ' + item + ' for General ' + i);
				}
			}
		}

		// need this since we now store unpurchased heroes also
		this.set('runtime.heroes', k);

		if ((i = priority_list.length)) {
			priority_list.sort(function(a,b) {
				return (a[1] - b[1]);
			});
			this.set(['runtime','max_priority'], i);
			while (i--) {
				this.set(['data',priority_list[i][0],'priority'], parseInt(i, 10)+1);
			}
		}
		// "any" MUST remain lower case - all real generals are capitalised so this provides the first and most obvious difference
		Config.set('generals', ['any','under max level'].concat(list.sort())); 
	}
	
	// busy stuff, so watch how often it runs
	// revision increases force a run via an event

	if ((invade && duel && war && (this.runtime.force ||
	  events.findEvent(null, 'data') >= 0 ||
	  events.findEvent(Town) >= 0 ||
	  events.findEvent(Player) >= 0)) ||
	  events.findEvent(this, 'reminder', 'revision') >= 0) {
		bests = true;
		this.set(['runtime','force'], false);

		pattack = Player.get('attack', 1, 'number');
		pdefense = Player.get('defense', 1, 'number');
		maxstamina = Player.get('maxstamina', 1, 'number');
		maxenergy = Player.get('maxenergy', 1, 'number');
		maxhealth = Player.get('maxhealth', 100, 'number');
		stamina = Player.get('stamina', 1, 'number');
		energy = Player.get('energy', 1, 'number');
		health = Player.get('health', 0, 'number');
		armymax = Player.get('armymax', 1, 'number');

		if (events.findEvent(Player) >= 0 && pattack > 1 && pdefense > 1) {
			// Only need them the first time...
			this._unwatch(Player, 'data.attack');
			this._unwatch(Player, 'data.defense');
		}

		for (i in data) {
			p = data[i];

			this.set(['data',i,'invade']);
			this.set(['data',i,'duel']);
			this.set(['data',i,'war']);
			this.set(['data',i,'monster']);
			this.set(['data',i,'potential']);
			this.set(['data',i,'stats','stamina']);
			this.set(['data',i,'stats','energy']);

			// update the weapon bonus list
			s = '';
			if ((o = p.equip)) {
				for (j in o) {
					if (Town.get(['data',j,'own'], 0, 'number') > 0) {
						if (s !== '') { s += '; '; }
						s += j + ': ' + o[j];
					}
				}
			}
			if (s) {
				this.set(['data',i,'weaponbonus'], s);
			} else {
				this.set(['data',i,'weaponbonus']);
			}

			skillcombo = ';' + (p.skills || '') + ';' + s + ';';

			// .att
			// .def
			// .own
			// .cost
			// .upkeep
			// .stats
			//   .att (effective attack if different from att)
			//   .def (effective defense if different from def)
			//   .att_when_att
			//   .def_when_att
			//   .invade
			//     .att
			//     .def
			//     .raid
			//   .duel
			//     .att
			//     .def
			//     .raid
			//   .war
			//     .att
			//     .def
			//   .monster
			//     .att
			//     .def
			//   .cost
			//   .cash

			all_stats = sum(skillcombo.regex(/\bAll Stats by ([-+]?\d*\.?\d+)\b/gi)) || 0;

			k = {};
			if ((o = skillcombo.regex(/\bEvery (\d+) ([^;]*?\w)(?:\s*Increase|\s*Decrease)?(?:\s+Player)? (Attack|Defense) by ([-+]?\d*\.?\d+)/i))) {
				k['p'+o[2].toLowerCase()] = Math.floor(o[3] * Math.floor(Town.get(['data',o[1],'own'], 0, 'number') / (o[0] || 1)));
			} else if ((o = skillcombo.regex(/\bEvery ([^;]*?\w)(?:\s*Increase|\s*Decrease)?(?:\s+Player)? (Attack|Defense) by ([-+]?\d*\.?\d+)/i))) {
				k['p'+o[1].toLowerCase()] = Math.floor(o[2] * Town.get(['data',o[0],'own'], 0, 'number'));
			}

			j = Math.floor(sum(skillcombo.regex(/([-+]?\d*\.?\d+) Player Attack\b|\bPlayer Attack by ([-+]\d+)\b|\bConvert ([-+]?\d*\.?\d+) Attack\b/gi))
			  + sum(p.skills.regex(/([-+]?\d*\.?\d+) Player Attack for every Hero Owned|/gi)) * ((this.runtime.heroes || 0) - 1)
			  + all_stats + (k.pattack || 0));
			this.set(['data',i,'stats','patt'], j ? j : undefined);

			j = Math.floor(sum(skillcombo.regex(/([-+]?\d*\.?\d+) Player Defense|Player Defense by ([-+]?\d*\.?\d+)/gi))
			  + (sum(p.skills.regex(/\bPlayer Defense by ([-+]?\d*\.?\d+) for every 3 Health\b/gi)) * maxhealth / 3)
			  + sum(p.skills.regex(/([-+]?\d*\.?\d+) Player Defense for every Hero Owned/gi)) * ((this.runtime.heroes || 0) - 1)
			  + all_stats + (k.pdefense || 0));
			this.set(['data',i,'stats','pdef'], j ? j : undefined);

			j = Math.floor(sum(skillcombo.regex(/([-+]?\d*\.?\d+) [Aa]ttack [Tt]o [A-Z]/g))
			  + sum(skillcombo.regex(/([-+]?\d*\.?\d+) Attack when[^;]*equipped\b/gi)));
			this.set(['data',i,'stats','att'], j ? j : undefined);

			j = Math.floor(sum(skillcombo.regex(/([-+]?\d*\.?\d+) Defense to\b/gi))
			  + sum(skillcombo.regex(/([-+]?\d*\.?\d+) Defense when[^;]*equipped\b/gi)));
			this.set(['data',i,'stats','def'], j ? j : undefined);

			j = ((p.att || 0)
			  + ((p.stats && p.stats.att) || 0)
			  + ((p.def || 0)
			  + ((p.stats && p.stats.def) || 0)) * 0.7).round(1);
			this.set(['data',i,'tot_att'], j ? j : undefined);
			this.set(['data',i,'stats','tot_att']);

			j = (((p.att || 0)
			  + ((p.stats && p.stats.att) || 0)) * 0.7
			  + (p.def || 0)
			  + ((p.stats && p.stats.def) || 0)).round(1);
			this.set(['data',i,'tot_def'], j ? j : undefined);
			this.set(['data',i,'stats','tot_def']);

			j = sum(skillcombo.regex(/([-+]?\d+) Monster attack\b/gi));
			this.set(['data',i,'stats','matt'], j ? j : undefined);

			j = sum(skillcombo.regex(/\bPlayer Attack when Defending by ([-+]?\d+)\b|([-+]?\d+) Attack when attacked\b/gi));
			this.set(['data',i,'stats','patt_when_att'], j ? j : undefined);

			j = sum(skillcombo.regex(/\bPlayer Defense when Defending by ([-+]?\d+)\b|([-+]?\d+) Defense when attacked\b/gi));
			this.set(['data',i,'stats','pdef_when_att'], j ? j : undefined);

			army = Math.min(armymax + nmax(0, skillcombo.regex(/\b(\d+) Army members?/gi)), nmax(0, skillcombo.regex(/\bArmy Limit to (\d+)\b/gi)) || 501);

			gen_att = getAttDef(data, listpush, 'att', 1 + Math.floor((army - 1) / 5));
			gen_def = getAttDef(data, listpush, 'def', 1 + Math.floor((army - 1) / 5));

			war_att = getAttDef(data, listpush, 'att', 6);
			war_def = getAttDef(data, listpush, 'def', 6);

			monster_multiplier = 1.1 + sum(skillcombo.regex(/([-+]?\d+)% Critical\b/gi))/100;

			// invade calcs

			j = Math.floor((invade.attack || 0) + gen_att +
			  + ((p.att || 0) + ((p.stats && p.stats.att) || 0)
			  + (((p.stats && p.stats.patt) || 0)
			  + pattack) * army)
			  + ((p.def || 0) + ((p.stats && p.stats.def) || 0)
			  + (((p.stats && p.stats.pdef) || 0)
			  + pdefense) * army) * 0.7);
			this.set(['data',i,'stats','invade','att'], j ? j : undefined);

			j = Math.floor((invade.defend || 0) + gen_def +
			  + ((p.att || 0) + ((p.stats && p.stats.att) || 0)
			  + ((((p.stats && p.stats.patt) || 0)
			  + ((p.stats && p.stats.patt_when_att) || 0))
			  + pattack) * army) * 0.7
			  + ((p.def || 0) + ((p.stats && p.stats.def) || 0)
			  + ((((p.stats && p.stats.pdef) || 0)
			  + ((p.stats && p.stats.pdef_when_att) || 0))
			  + pdefense) * army));
			this.set(['data',i,'stats','invade','def'], j ? j : undefined);

			// duel calcs

			j = Math.floor((duel.attack || 0) +
			  + ((p.att || 0) + ((p.stats && p.stats.att) || 0)
			  + ((p.stats && p.stats.patt) || 0)
			  + pattack)
			  + ((p.def || 0) + ((p.stats && p.stats.def) || 0)
			  + ((p.stats && p.stats.pdef) || 0)
			  + pdefense) * 0.7);
			this.set(['data',i,'stats','duel','att'], j ? j : undefined);

			j = Math.floor((duel.defend || 0) +
			  + ((p.att || 0) + ((p.stats && p.stats.att) || 0)
			  + ((p.stats && p.stats.patt) || 0)
			  + ((p.stats && p.stats.patt_when_att) || 0)
			  + pattack) * 0.7
			  + ((p.def || 0) + ((p.stats && p.stats.def) || 0)
			  + ((p.stats && p.stats.pdef) || 0)
			  + ((p.stats && p.stats.pdef_when_att) || 0)
			  + pdefense));
			this.set(['data',i,'stats','duel','def'], j ? j : undefined);

			// war calcs

			j = Math.floor((duel.attack || 0) + war_att
			  + (((p.stats && p.stats.patt) || 0)
			  + pattack)
			  + (((p.stats && p.stats.pdef) || 0)
			  + pdefense) * 0.7);
			this.set(['data',i,'stats','war','att'], j ? j : undefined);

			j = Math.floor((duel.defend || 0) + war_def
			  + (((p.stats && p.stats.patt) || 0)
			  + ((p.stats && p.stats.patt_when_att) || 0)
			  + pattack) * 0.7
			  + (((p.stats && p.stats.pdef) || 0)
			  + ((p.stats && p.stats.pdef_when_att) || 0)
			  + pdefense));
			this.set(['data',i,'stats','war','def'], j ? j : undefined);

			// monster calcs

			// not quite right, gear defense not counted on monster attack
			j = Math.floor(((duel.attack || 0) +
			  + (p.att || 0) + ((p.stats && p.stats.att) || 0)
			  + ((p.stats && p.stats.patt) || 0)
			  + pattack
			  + ((p.stats && p.stats.matt) || 0))
			  * monster_multiplier);
			this.set(['data',i,'stats','monster','att'], j ? j : undefined);

			// not quite right, gear attack not counted on monster defense
			j = Math.floor((duel.defend || 0) +
			  + ((p.stats && p.stats.def) || p.att || 0)
			  + ((p.stats && p.stats.pdef) || 0)
			  + pdefense
			  + ((p.stats && p.stats.mdef) || 0));
			this.set(['data',i,'stats','monster','def'], j ? j : undefined);

			j = nmax(0, skillcombo.regex(/Increase Power Attacks by (\d+)/gi));
			this.set(['runtime','multipliers',i], j ? j : undefined);

			j = sum(skillcombo.regex(/\bMax Energy by ([-+]?\d+)\b|([-+]?\d+) Max Energy\b/gi))
			  - (sum(skillcombo.regex(/\bTransfer (\d+)% Max Energy to\b/gi)) * Player.get('maxenergy') / 100).round(0)
			  + (sum(skillcombo.regex(/\bTransfer (\d+)% Max Stamina to Max Energy/gi)) * Player.get('maxstamina') / 100*2).round(0)
			  + all_stats;
			this.set(['data',i,'stats','maxenergy'], j ? j : undefined);

			j = sum(skillcombo.regex(/\bMax Stamina by ([-+]?\d+)|([-+]?\d+) Max Stamina/gi))
			  - (sum(skillcombo.regex(/Transfer (\d+)% Max Stamina to\b/gi)) * maxstamina / 100).round(0)
			  + (sum(skillcombo.regex(/Transfer (\d+)% Max Energy to Max Stamina/gi)) * maxenergy / 200).round(0)
			  + all_stats;
			this.set(['data',i,'stats','maxstamina'], j ? j : undefined);

			j = all_stats;
			this.set(['data',i,'stats','maxhealth'], j ? j : undefined);

			j = skillcombo.regex(/Bank Fee/gi) ? 100 : 0;
			this.set(['data',i,'stats','bank'], j ? j : undefined);

			j = nmax(0, skillcombo.regex(/\bBonus \$?(\d+) Gold\b/gi));
			this.set(['data',i,'stats','cash'], j ? j : undefined);

			j = nmax(0, skillcombo.regex(/\bDecreases? Soldier Cost by (\d+)%/gi));
			this.set(['data',i,'stats','cost'], j ? j : undefined);

			j = skillcombo.regex(/Extra Demi Points/gi) ? 5 : 0;
			this.set(['data',i,'stats','demi'], j ? j : undefined);

			j = nmax(0, skillcombo.regex(/\bIncrease Income by (\d+)\b/gi));
			this.set(['data',i,'stats','income'], j ? j : undefined);

			j = nmax(0, skillcombo.regex(/\bInfluence (\d+)% Faster\b/gi));
			this.set(['data',i,'stats','influence'], j ? j : undefined);

			j = nmax(0, skillcombo.regex(/Chance ([-+]?\d+)% Drops|\bitems from quests by (\d+)%/gi));
			this.set(['data',i,'stats','item'], j ? j : undefined);

			this.set(['runtime','armymax'], Math.max(army, this.runtime.armymax));
		}

		this.set('runtime.revision', revision);
	}

	if (bests || !this.runtime.best) {
		bests = {};
		list = {};

		for (i in this.data) {
			p = this.data[i];
			if (p.stats && p.own) {
				for (j in p.stats) {
					if (isNumber(p.stats[j])) {
						if ((bests[j] || -1e99) < p.stats[j]) {
							bests[j] = p.stats[j];
							list[j] = i;
						}
					} else if (isObject(p.stats[j])) {
						for (k in p.stats[j]) {
							if (isNumber(p.stats[j][k])) {
								o = j + '-' + k;
								if ((bests[o] || -1e99) < p.stats[j][k]) {
									bests[o] = p.stats[j][k];
									list[o] = i;
								}
							}
						}
					}
				}
				if (isNumber(p[j = 'priority'])) {
					if ((bests[j] || 1e99) > p[j]) {
						bests[j] = p[j];
						list[j] = i;
					}
				}
			}
		}

		this.set(['runtime','best']);
		for (i in bests) {
			this.set(['runtime','best',i], list[i]);
		}
	}

	return true;
};

Generals.to = function(name) {
	this._unflush();
	if (name) {
		name = this.best(name);
	}
	if (!name || Player.get('general') === name || name.toLowerCase() === 'any') {
		return true;
	}
	if (!this.data[name]) {
		log(LOG_WARN, 'General "'+name+'" requested but not found!');
		return true; // Not found, so fake it
	}
	if (!this.test(name)) {
		log(LOG_INFO, 'General rejected due to energy or stamina loss: ' + Player.get('general') + ' to ' + name);
		return true;
	}
	log(LOG_WARN, 'General change: ' + Player.get('general') + ' to ' + name);
	var id = this.get(['data',name,'id']), type = this.get(['data',name,'type']);
	Page.to('heroes_generals', isNumber(id) && isNumber(type) ? {item:id, itype:type} : null, true);
	return false;
};

Generals.test = function(name) {
	Generals._unflush();
	var next = isObject(name) ? name : Generals.data[name];
	if (name === 'any') {
		return true;
	} else if (!name || !next) {
		return false;
	} else {
		return (Player.get('maxstamina') + ((next.stats && next.stats.stamina) || 0) >= Player.get('stamina') && Player.get('maxenergy') + ((next.stats && next.stats.energy) || 0) >= Player.get('energy'));
	}
};

Generals.best = function(type) {
	var best = 'any', i;

	if (type && isString(type)) {

		if (this.get(['data',type,'own'])) {
			best = type;
		}

		if ((!best || best === 'any') && (i = this.get(['runtime','best',type]))) {
			if (this.get(['data',i,'own'])) {
				best = i;
			}
		}

		if (!best || best === 'any') {
			switch (type.toLowerCase().replace('_', '-')) {
			case 'stamina':
				i = this.get(['runtime','best','maxstamina']);
				break;
			case 'energy':
				i = this.get(['runtime','best','maxenergy']);
				break;
			case 'health':
				i = this.get(['runtime','best','maxhealth']);
				break;
			case 'raid-duel':
			case 'duel':
			case 'duel-attack':
				i = this.get(['runtime','best','duel-att']);
				break;
			case 'defend':
			case 'duel-defend':
				i = this.get(['runtime','best','duel-def']);
				break;
			case 'raid-invade':
			case 'invade':
			case 'invade-attack':
				i = this.get(['runtime','best','invade-att']);
				break;
			case 'invade-defend':
				i = this.get(['runtime','best','invade-def']);
				break;
			case 'war':
			case 'war-attack':
				i = this.get(['runtime','best','war-att']);
				break;
			case 'war-defend':
				i = this.get(['runtime','best','war-def']);
				break;
			case 'monster':
			case 'monster-attack':
				i = this.get(['runtime','best','monster-att']);
				break;
			case 'monster-defend':
			case 'dispell':
				i = this.get(['runtime','best','monster-def']);
				break;
			case 'under max level':
				i = this.get(['runtime','best','priority']);
				break;
			default:
				i = null;
				break;
			}

			if (i && this.get(['data',i,'own'])) {
				best = i;
			}
		}
	}

	return best;
};

Generals.order = [];
Generals.dashboard = function(sort, rev) {
	var self = this, i, j, o, p, data, output = [], list = [], iatt = 0, idef = 0, datt = 0, ddef = 0, matt = 0, mdef = 0,
		sorttype = [
			'img',
			'name',
			'level',
			'priority',
			'stats.invade.att',
			'stats.invade.def',
			'stats.duel.att',
			'stats.duel.def',
			'stats.monster.att',
			'stats.monster.def'
		];

	if (typeof sort === 'undefined') {
		this.order = [];
		for (i in this.data) {
			this.order.push(i);
		}
	}
	if (typeof sort === 'undefined') {
		sort = this.runtime.sort || 1;
	}
	if (typeof rev === 'undefined'){
		rev = this.runtime.rev || false;
	}
	this.set('runtime.sort', sort);
	this.set('runtime.rev', rev);
	if (typeof sort !== 'undefined') {
		this.order.sort(function(a,b) {
			var aa, bb, type, x;
			if (sort === 1) {
				aa = a;
				bb = b;
			} else if (sort === 3) {
				aa = self.get(['data',a,'priority'], self.get(['data',a,'charge'], 1e9, 'number'), 'number');
				bb = self.get(['data',b,'priority'], self.get(['data',b,'charge'], 1e9, 'number'), 'number');
			} else if ((i = sorttype[sort])) {
				aa = self.get(['data',a].concat(i.split('.')), 0, 'number');
				bb = self.get(['data',b].concat(i.split('.')), 0, 'number');
			}
			if (typeof aa === 'string' || typeof bb === 'string') {
				return (rev ? (''+bb).localeCompare(aa) : (''+aa).localeCompare(bb));
			}
			return (rev ? aa - bb : bb - aa);
		});
	}

	for (i in this.data) {
		p = this.get(['data',i,'stats']) || {};
		iatt = Math.max(iatt, this.get([p,'invade','att'], 1, 'number'));
		idef = Math.max(idef, this.get([p,'invade','def'], 1, 'number'));
		datt = Math.max(datt, this.get([p,'duel','att'], 1, 'number'));
		ddef = Math.max(ddef, this.get([p,'duel','def'], 1, 'number'));
		matt = Math.max(matt, this.get([p,'monster','att'], 1, 'number'));
		mdef = Math.max(mdef, this.get([p,'monster','def'], 1, 'number'));
	}

	th(output, '');
	th(output, 'General');
	th(output, 'Level');
	th(output, 'Rank /<br>Timer');
	th(output, 'Invade<br>Attack');
	th(output, 'Invade<br>Defend');
	th(output, 'Duel<br>Attack');
	th(output, 'Duel<br>Defend');
	th(output, 'Monster<br>Attack');
	th(output, 'Fortify<br>Dispel');

	list.push('<table cellspacing="0" style="width:100%"><thead><tr>' + output.join('') + '</tr></thead><tbody>');

	for (o=0; o<this.order.length; o++) {
		i = this.order[o];
		p = this.get(['data',i]) || {};
		output = [];
		j = this.get([p, 'weaponbonus']);
		td(output, '<a class="golem-link" href="generals.php?item=' + p.id + '&itype=' + p.type + '"><img src="' + imagepath + p.img + '" style="width:25px;height:25px;" title="Skills: ' + this.get([p,'skills'], 'none') + (j ? '; Weapon Bonus: ' + j : '') + '"></a>');
		td(output, i);
		td(output, '<div'+(isNumber(p.progress) ? ' title="'+p.progress+'%"' : '')+'>'+p.level+'</div><div style="background-color: #9ba5b1; height: 2px; width=100%;"><div style="background-color: #1b3541; float: left; height: 2px; width: '+(p.progress || 0)+'%;"></div></div>');
		td(output, p.priority ? ((p.priority !== 1 ? '<a class="golem-moveup" name='+p.priority+'>&uarr;</a> ' : '&nbsp;&nbsp; ') + p.priority + (p.priority !== this.runtime.max_priority ? ' <a class="golem-movedown" name='+p.priority+'>&darr;</a>' : ' &nbsp;&nbsp;'))
				: !this.get([p,'charge'],0)
				? '&nbsp;&nbsp; '
				: (this.get([p,'charge'],0) <= Date.now()
				? 'Now'
				: makeTime(this.get([p,'charge'],0), 'g:i a')));
		td(output, (j = this.get([p,'stats','invade','att'],0,'number')).addCommas(), (iatt === j ? 'style="font-weight:bold;"' : ''));
		td(output, (j = this.get([p,'stats','invade','def'],0,'number')).addCommas(), (idef === j ? 'style="font-weight:bold;"' : ''));
		td(output, (j = this.get([p,'stats','duel','att'],0,'number')).addCommas(), (datt === j ? 'style="font-weight:bold;"' : ''));
		td(output, (j = this.get([p,'stats','duel','def'],0,'number')).addCommas(), (ddef === j ? 'style="font-weight:bold;"' : ''));
		td(output, (j = this.get([p,'stats','monster','att'],0,'number')).addCommas(), (matt === j ? 'style="font-weight:bold;"' : ''));
		td(output, (j = this.get([p,'stats','monster','def'],0,'number')).addCommas(), (mdef === j ? 'style="font-weight:bold;"' : ''));
 		tr(list, output.join(''));
	}

	list.push('</tbody></table>');

	$('a.golem-moveup').live('click', function(event){
		var i, gdown, gup, x = parseInt($(this).attr('name'), 10);
		Generals._unflush();
		for(i in Generals.data){
			if (Generals.data[i].priority === x){
				gup = i;
			}
			if (Generals.data[i].priority === (x-1)){
				gdown = i;
			}
		}
		if (gdown && gup) {
			log('Priority: Swapping '+gup+' with '+gdown);
			Generals.set(['data',gdown,'priority'], Generals.data[gdown].priority + 1);
			Generals.set(['data',gup,'priority'], Generals.data[gup].priority - 1);
		}
//		Generals.dashboard(sort,rev);
		return false;
	});
	$('a.golem-movedown').live('click', function(event){
		var i, gdown, gup, x = parseInt($(this).attr('name'), 10);
		Generals._unflush();
		for(i in Generals.data){
			if (Generals.data[i].priority === x){
				gdown = i;
			}
			if (Generals.data[i].priority === (x+1)) {
				gup = i;
			}
		}
		if (gdown && gup) {
			log('Priority: Swapping '+gup+' with '+gdown);
			Generals.set(['data',gdown,'priority'], Generals.data[gdown].priority + 1);
			Generals.set(['data',gup,'priority'], Generals.data[gup].priority - 1);
		}
//		Generals.dashboard(sort,rev);
		return false;
	});
	$('#golem-dashboard-Generals').html(list.join(''));
	$('#golem-dashboard-Generals tbody tr td:nth-child(2)').css('text-align', 'left');
	if (typeof sort !== 'undefined') {
		$('#golem-dashboard-Generals thead th:eq('+sort+')').attr('name',(rev ? 'reverse' : 'sort')).append('&nbsp;' + (rev ? '&uarr;' : '&darr;'));
	}
};

// vi: ts=4
/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page, Queue, Resources,
	Battle, Generals, LevelUp, Player,
	APP, APPID, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, Divisor, length, sum, findInObject, objectIndex, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
	makeImage
*/
/********** Worker.Gift() **********
* Auto accept gifts and return if needed
* *** Needs to talk to Alchemy to work out what's being made
*/
var Gift = new Worker('Gift');
Gift.temp = null;

Gift.defaults['castle_age'] = {
	pages:'* facebook index army_invite army_gifts gift_accept'
};

Gift.data = {
	received: [],
	todo: {},
	gifts: {}
};

Gift.option = {
	type:'None'
};

Gift.runtime = {
	work:false,
	gift_waiting:false,
	gift_delay:0,
	gift_sent:0,
	sent_id:null,
	gift:{
		sender_id:null,
		sender_ca_name:null,
		sender_fb_name:null,
		name:null,
		id:null
	}
};

Gift.display = [
	{
		label:'Work in progress...'
	},{
		id:'type',
		label:'Return Gifts',
		select:['None', 'Random', 'Same as Received']
	}
];

Gift.init = function() {
	delete this.data.uid;
	delete this.data.lastgift;
	if (length(this.data.gifts)) {
		var i, gift_ids = [], random_gift_id;
		for (i in this.data.gifts) {
			gift_ids.push(i);
		}
		for (i in this.data.todo) {
			if (!(/\D/g).test(i)) {	// If we have an old entry
				random_gift_id = Math.floor(Math.random() * gift_ids.length);
				if (!this.data.todo[gift_ids[random_gift_id]]) {
					this.data.todo[gift_ids[random_gift_id]] = [];
				}
				this.data.todo[gift_ids[random_gift_id]].push(i);
				delete this.data.todo[i];
			}
		}
	}
};

Gift.parse = function(change) {
	if (change) {
		if (change === 'facebook') {
			log(LOG_DEBUG, 'Facebook popup parsed...');
		}
		return false;
	}
	var i, j, id, $tmp, gifts = this.data.gifts, todo = this.data.todo, received = this.data.received;
	//alert('Gift.parse running');
	if (Page.page === 'index') {
		// We need to get the image of the gift from the index page.
//		log(LOG_DEBUG, 'Checking for a waiting gift and getting the id of the gift.');
		if ($('span.result_body').text().indexOf('has sent you a gift') >= 0) {
			this.runtime.gift.sender_ca_name = $('span.result_body').text().regex(/[\t\n]*(.+) has sent you a gift/i);
			this.runtime.gift.name = $('span.result_body').text().regex(/has sent you a gift:\s+(.+)!/i);
			this.runtime.gift.id = $('span.result_body img').attr('src').filepart();
			log(LOG_WARN, this.runtime.gift.sender_ca_name + ' has a ' + this.runtime.gift.name + ' waiting for you. (' + this.runtime.gift.id + ')');
			this.runtime.gift_waiting = true;
			return true;
		} else if ($('span.result_body').text().indexOf('warrior wants to join your Army') >= 0) {
			this.runtime.gift.sender_ca_name = 'A Warrior';
			this.runtime.gift.name = 'Random Soldier';
			this.runtime.gift.id = 'random_soldier';
			log(LOG_WARN, this.runtime.gift.sender_ca_name + ' has a ' + this.runtime.gift.name + ' waiting for you.');
			this.runtime.gift_waiting = true;
			return true;
		} else {
//			log(LOG_WARN, 'No more waiting gifts. Did we miss the gift accepted page?');
			this.runtime.gift_waiting = false;
			this.runtime.gift = {}; // reset our runtime gift tracker
		}
	} else if (Page.page === 'army_invite') {
		// Accepted gift first
//		log(LOG_WARN, 'Checking for accepted gift.');
		if (this.runtime.gift.sender_id) { // if we have already determined the ID of the sender
			if ($('div.game').text().indexOf('accepted the gift') >= 0 || $('div.game').text().indexOf('have been awarded the gift') >= 0) { // and we have just accepted a gift
				log('Accepted ' + this.runtime.gift.name + ' from ' + this.runtime.gift.sender_ca_name + '(id:' + this.runtime.gift.sender_id + ')');
				received.push(this.runtime.gift); // add the gift to our list of received gifts.  We will use this to clear facebook notifications and possibly return gifts
				this.runtime.work = true;	// We need to clear our facebook notifications and/or return gifts
				this.runtime.gift = {}; // reset our runtime gift tracker
			}
		}
		// Check for gifts
//		log(LOG_WARN, 'Checking for waiting gifts and getting the id of the sender if we already have the sender\'s name.');
		if ($('div.messages').text().indexOf('a gift') >= 0) { // This will trigger if there are gifts waiting
			this.runtime.gift_waiting = true;
			if (!this.runtime.gift.id) { // We haven't gotten the info from the index page yet.
				return false;	// let the work function send us to the index page to get the info.
			}
//			log(LOG_WARN, 'Sender Name: ' + $('div.messages img[title*="' + this.runtime.gift.sender_ca_name + '"]').first().attr('title'));
			this.runtime.gift.sender_id = $('div.messages img[uid]').first().attr('uid'); // get the ID of the gift sender. (The sender listed on the index page should always be the first sender listed on the army page.)
			if (this.runtime.gift.sender_id) {
				this.runtime.gift.sender_fb_name = $('div.messages img[uid]').first().attr('title');
//				log(LOG_WARN, 'Found ' + this.runtime.gift.sender_fb_name + "'s ID. (" + this.runtime.gift.sender_id + ')');
			} else {
				log("Can't find the gift sender's ID: " + this.runtime.gift.sender_id);
			}
		} else {
//			log('No more waiting gifts. Did we miss the gift accepted page?');
			this.runtime.gift_waiting = false;
			this.runtime.gift = {}; // reset our runtime gift tracker
		}
	
	} else if (Page.page === 'gift_accept'){
		// Check for sent
//		log('Checking for sent gifts.');
		if (this.runtime.sent_id && $('div#app46755028429_results_main_wrapper').text().indexOf('You have sent') >= 0) {
			log(gifts[this.runtime.sent_id].name+' sent.');
			for (j=todo[this.runtime.sent_id].length-1; j >= Math.max(todo[this.runtime.sent_id].length - 30, 0); j--) {	// Remove the IDs from the list because we have sent them
				todo[this.runtime.sent_id].pop();
			}
			if (!todo[this.runtime.sent_id].length) {
				delete todo[this.runtime.sent_id];
			}
			this.runtime.sent_id = null;
			if (!todo.length) {
				this.runtime.work = false;
			}
		}
		
	} else if (Page.page === 'army_gifts') { // Parse for the current available gifts
//		log('Parsing gifts.');
		gifts = this.data.gifts = {};
		// Gifts start at 1
		for (i=1, $tmp=[0]; $tmp.length; i++) {
			$tmp = $('#app46755028429_gift'+i);
			if ($tmp.length) {
				id = $('img', $tmp).attr('src').filepart();
				gifts[id] = {slot:i, name: $tmp.text().trim().replace('!','')};
//				log('Adding: '+gifts[id].name+' ('+id+') to slot '+i);
			}
		}
	} else {
		if ($('div.result').text().indexOf('have exceed') !== -1){
			log('We have run out of gifts to send.  Waiting one hour to retry.');
			this.runtime.gift_delay = Date.now() + 3600000;	// Wait an hour and try to send again.
		}
	}
	return false;
};

Gift.update = function(event) {
	this.runtime.work = length(this.data.todo) > 0 || length(this.data.received) > 0;
};

Gift.work = function(state) {
	if (!this.runtime.gift_waiting && (!this.runtime.work || this.runtime.gift_delay > Date.now())) {
		if (state && !Page.to('index')) {	// Force us to another page before giving up focus - hopefully fix reload issues
			return QUEUE_CONTINUE;
		}
		return QUEUE_FINISH;
	}
	if (!state) {                
		if (this.runtime.gift_waiting || this.runtime.work) {	// We need to get our waiting gift or return gifts.
			return QUEUE_CONTINUE;
		}
		return QUEUE_FINISH;
	}
	if (!Generals.to(Idle.option.general)){
		return QUEUE_CONTINUE;
	}
	if(this.runtime.gift_waiting && !this.runtime.gift.id) {	// We have a gift waiting, but we don't know the id.
		if (!Page.to('index')) {	// Get the gift id from the index page.
			return QUEUE_CONTINUE;
		}
	}
	if(this.runtime.gift.id && !this.runtime.gift.sender_id) {	// We have a gift id, but no sender id.
		if (!Page.to('army_invite')) {	// Get the sender id from the army_invite page.
			return QUEUE_CONTINUE;
		}
	}
	if (this.runtime.gift.sender_id) { // We have the sender id so we can receive the gift.
		if (!Page.to('army_invite')) {
			return QUEUE_CONTINUE;
		}
//		log('Accepting ' + this.runtime.gift.name + ' from ' + this.runtime.gift.sender_ca_name + '(id:' + this.runtime.gift.sender_id + ')');
		if (!Page.to('army_invite', {act:'acpt', rqtp:'gift', uid:this.runtime.gift.sender_id}) || this.runtime.gift.sender_id.length > 0) {	// Shortcut to accept gifts without going through Facebook's confirmation page
			return QUEUE_CONTINUE;
		}
	}
	
	var i, j, k, todo = this.data.todo, received = this.data.received, gift_ids = [], random_gift_id, temptype;

	if (!received.length && (!length(todo) || (this.runtime.gift_delay > Date.now()))) {
		this.runtime.work = false;
		Page.to('keep_alchemy');
		return QUEUE_INTERRUPT_OK;
	}
	
	// We have received gifts so we need to figure out what to send back.
	if (received.length) {
		Page.to('army_gifts');
		// Fill out our todo list with gifts to send, or not.
		for (i = received.length - 1; i >= 0; i--){
			temptype = this.option.type;
			if (typeof this.data.gifts[received[i].id] === 'undefined' && this.option.type !== 'None') {
				log(received[i].id+' was not found in our sendable gift list.');
				temptype = 'Random';
			}
			switch(temptype) {
				case 'Random':
					if (length(this.data.gifts)) {
						gift_ids = [];
						for (j in this.data.gifts) {
							gift_ids.push(j);
						}
						random_gift_id = Math.floor(Math.random() * gift_ids.length);
						log('Will randomly send a ' + this.data.gifts[gift_ids[random_gift_id]].name + ' to ' + received[i].sender_ca_name);
						if (!todo[gift_ids[random_gift_id]]) {
							todo[gift_ids[random_gift_id]] = [];
						}
						todo[gift_ids[random_gift_id]].push(received[i].sender_id);
					}
					this.runtime.work = true;
					break;
				case 'Same as Received':
					log('Will return a ' + received[i].name + ' to ' + received[i].sender_ca_name);
					if (!todo[received[i].id]) {
						todo[received[i].id] = [];
					}
					todo[received[i].id].push(received[i].sender_id);
					this.runtime.work = true;
					break;
				case 'None':// deliberate fallthrough
				default:
					this.runtime.work = false;	// Since we aren't returning gifts, we don't need to do any more work.
					break;
			}
			received.pop();
		}
		
		// Clear the facebook notifications and empty the received list.
/*		for (i in received) {
			// Go to the facebook page and click the "ignore" button for this entry
			
			// Then delete the entry from the received list.
			received.shift();
		}*/
		
	}
	
	if (this.runtime.gift_sent > Date.now()) {	// We have sent gift(s) and are waiting for the fb popup
//		log('Waiting for FB popup.');
		if ($('div.dialog_buttons input[name="sendit"]').length){
			this.runtime.gift_sent = null;
			Page.click('div.dialog_buttons input[name="sendit"]');
		} else if ($('span:contains("Out of requests")').text().indexOf('Out of requests') >= 0) {
			log('We have run out of gifts to send.  Waiting one hour to retry.');
			this.runtime.gift_delay = Date.now() + 3600000;	// Wait an hour and try to send again.
			Page.click('div.dialog_buttons input[name="ok"]');
		}
		return QUEUE_CONTINUE;
	} else if (this.runtime.gift_sent) {
		this.runtime.gift_sent = null;
	}
	if ($('div.dialog_buttons input[name="skip_ci_btn"]').length) {     // Eventually skip additional requests dialog
		Page.click('div.dialog_buttons input[name="skip_ci_btn"]');
		return QUEUE_CONTINUE;
	}
	
	// Give some gifts back
	if (length(todo) && (!this.runtime.gift_delay || (this.runtime.gift_delay < Date.now()))) {
		for (i in todo) {
			if (typeof this.data.gifts[i] === 'undefined'){	// The gift we want to send has been removed from the game
				for (j in this.data.gifts){
					if (this.data.gifts[j].slot === 1){
						if (typeof todo[j] === 'undefined'){
							todo[j] = todo[i];
						} else {
							todo[j] = todo[j].concat(todo[i]);
						}
						delete todo[i];
						break;
					}
				}
				continue;
			}
//			if (!Page.to('army_gifts', {app_friends:'c', giftSelection:this.data.gifts[i].slot}, true)) {	// forcing the page to load to fix issues with gifting getting interrupted while waiting for the popup confirmation dialog box which then causes the script to never find the popup.  Should also speed up gifting.
// Need to deal with the fb requests some other way - possibly an extra parse() option...
			if (!Page.to('army_gifts', {app_friends:'c', giftSelection:this.data.gifts[i].slot})) {
				return QUEUE_CONTINUE;
			}
			if (typeof this.data.gifts[i] === 'undefined') {  // Unknown gift in todo list
				gift_ids = [];
				for (j in this.data.gifts) {
					gift_ids.push(j);
				}
				random_gift_id = Math.floor(Math.random() * gift_ids.length);
				log(LOG_WARN, 'Unavaliable gift ('+i+') found in todo list. Will randomly send a ' + this.data.gifts[gift_ids[random_gift_id]].name + ' instead.');
				if (!todo[gift_ids[random_gift_id]]) {
					todo[gift_ids[random_gift_id]] = [];
				}
				for (j in todo[i]) {
					todo[gift_ids[random_gift_id]].push(todo[i][j]);
				}
				delete todo[i];
				return QUEUE_CONTINUE;
			}
			if ($('div[style*="giftpage_select"] div a[href*="giftSelection='+this.data.gifts[i].slot+'"]').length) {
				if ($('img[src*="gift_invite_castle_on"]').length){
					if ($('div.unselected_list').children().length) {
						log('Sending out ' + this.data.gifts[i].name);
						k = 0;
						for (j=todo[i].length-1; j>=0; j--) {
							if (k< 10) {	// Need to limit to 10 at a time
								if (!$('div.unselected_list input[value=\'' + todo[i][j] + '\']').length){
//									log('User '+todo[i][j]+' wasn\'t in the CA friend list.');
									continue;
								}
								Page.click('div.unselected_list input[value="' + todo[i][j] + '"]');
								k++;
							}
						}
						if (k === 0) {
							delete todo[i];
							return QUEUE_CONTINUE;
						}
						this.runtime.sent_id = i;
						this.runtime.gift_sent = Date.now() + (60000);	// wait max 60 seconds for the popup.
						Page.click('input[name="send"]');
						return QUEUE_CONTINUE;
					} else {
						return QUEUE_CONTINUE;
					}
				} else if ($('div.tabBtn img.imgButton[src*="gift_invite_castle_off"]').length) {
					Page.click('div.tabBtn img.imgButton[src*="gift_invite_castle_off"]');
					return QUEUE_CONTINUE;
				} else {
					return QUEUE_CONTINUE;
				}
			} else if ($('div[style*="giftpage_select"]').length) {
				Page.click('a[href*="giftSelection='+this.data.gifts[i].slot+'"]:parent');
				return QUEUE_CONTINUE;
			} else {
				return QUEUE_CONTINUE;
			}
		}
	}
	
	return QUEUE_FINISH;
};

/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page, Queue, Resources,
	Battle, Generals, LevelUp, Player,
	APP, APPID, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, Divisor, length, sum, findInObject, objectIndex, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
	makeImage
*/
/********** Worker.Heal **********
* Auto-Heal above a stamina level
* *** Needs to check if we have enough money (cash and bank)
*/
var Heal = new Worker('Heal');
Heal.data = Heal.temp = null;

Heal.settings = {
	taint:true
};

Heal.defaults['castle_age'] = {};

Heal.option = {
	stamina: 0,
	health: 0
};

Heal.display = [
	{
		id:'stamina',
		label:'Heal Above',
		after:'stamina',
		select:'stamina'
	},{
		id:'health',
		label:'...And Below',
		after:'health',
		select:'health'
	}
];

Heal.init = function() {
	this._watch(Player, 'data.health');
	this._watch(Player, 'data.maxhealth');
	this._watch(Player, 'data.stamina');
};

Heal.update = function(event) {
	var health = Player.get('health', -1);
	this.set(['option','_sleep'], health >= Player.get('maxhealth') || Player.get('stamina') < this.option.stamina || health >= this.option.health);
};

Heal.work = function(state) {
	if (!state || this.me()) {
		return true;
	}
	return false;
};

Heal.me = function() {
	if (!Page.to('keep_stats')) {
		return true;
	}
	if ($('input[value="Heal Wounds"]').length) {
		log(LOG_INFO, 'Healing...');
		Page.click('input[value="Heal Wounds"]');
	} else {
		log(LOG_WARN, 'Unable to heal!');
//		this.set(['option','_disabled'], true);
	}
	return false;
};

/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page, Queue, Resources,
	Battle, Generals, LevelUp, Player,
	APP, APPID, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, Divisor, length, sum, findInObject, objectIndex, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
	makeImage
*/
/********** Worker.Idle **********
* Set the idle general
* Keep focus for disabling other workers
*/
var Idle = new Worker('Idle');
Idle.temp = Idle.data = null;

Idle.defaults['castle_age'] = {};

Idle.settings ={
	after:['LevelUp'],
	taint:true
};

Idle.option = {
	general:'any',
	index:86400000,
	generals:604800000,
	alchemy:86400000,
	quests:0,
	town:0,
	keep:0,
//	arena:0,
	battle:900000,
	monsters:3600000
//	collect:0
};

//Idle.when = ['Never', 'Quarterly', 'Hourly', '2 Hours', '6 Hours', '12 Hours', 'Daily', 'Weekly'];
Idle.when = {
	0:			'Never',
	60000:		'1 Minute',
	900000:		'Quarterly',
	3600000:	'Hourly',
	7200000:	'2 Hours',
	21600000:	'6 Hours',
	43200000:	'12 Hours',
	86400000:	'Daily',
	604800000:	'Weekly',
	1209600000:	'2 Weeks',
	2592000000:	'Monthly'
};

Idle.display = [
	{
		label:'<strong>NOTE:</strong> This worker will <strong>not</strong> release control!<br>Use this for disabling workers you do not use.'
	},{
		id:'general',
		label:'Idle General',
		select:'generals'
	},{
		title:'Check Pages',
		group:[
			{
				id:'index',
				label:'Home Page',
				select:Idle.when
			},{
				id:'generals',
				label:'Generals',
				select:Idle.when
			},{
				id:'alchemy',
				label:'Alchemy',
				select:Idle.when
			},{
				id:'quests',
				label:'Quests',
				select:Idle.when
			},{
				id:'town',
				label:'Town',
				select:Idle.when
			},{
				id:'keep',
				label:'Keep',
				select:Idle.when
		//	},{
		//		id:'arena',
		//		label:'Arena',
		//		select:Idle.when
			},{
				id:'battle',
				label:'Battle',
				select:Idle.when
			},{
				id:'monsters',
				label:'Monsters',
				select:Idle.when
		//	},{
		//		id:'collect',
		//		label:'Apprentice Reward',
		//		select:Idle.when
			}
		]
	}
];

Idle.pages = {
	index:['index'],
	generals:['heroes_heroes', 'heroes_generals'],
	alchemy:['keep_alchemy'],
	quests:[
		'quests_quest1',
		'quests_quest2',
		'quests_quest3',
		'quests_quest4',
		'quests_quest5',
		'quests_quest6',
		'quests_quest7',
		'quests_quest8',
		'quests_quest9',
		'quests_quest10',
		'quests_quest11',
		'quests_quest12',
		'quests_quest13',
		'quests_demiquests',
		'quests_atlantis'
	],
	town:['town_soldiers', 'town_blacksmith', 'town_magic', 'town_land'],
	keep:['keep_stats'],
//	arena:['battle_arena'],
	battle:['battle_battle'],
	monsters:['monster_monster_list', 'battle_raid', 'festival_monster_list']
//	collect:['apprentice_collect']
};

Idle.init = function() {
	// BEGIN: fix up "under level 4" generals
	if (this.option.general === 'under level 4') {
		this.set('option.general', 'under max level');
	}
	// END
};

Idle.work = function(state) {
	var now = Date.now(), i, j, p;

	if (!state) {
		return true;
	}

	// handle the generals tour first, to avoid thrashing with the Idle general
	if (this.option[i = 'generals'] && (p = Generals.get('data'))) {
		for (j in p) {
			if (p[j] && p[j].own && (p[j].seen || 0) + this.option[i] <= now) {
				if (Generals.to(j) === null) {
					// if we can't change the general now due to stats or error
					// just add an hour to the last seen time and try later
					Generals.set(['data',j,seen], Math.range((p[j].seen || 0), now + 3600000 - this.option[i], now));
				}
				return true;
			}
		}
	}

	if (!Generals.to(this.option.general)) {
		return true;
	}

	for (i in this.pages) {
		if (this.option[i]) {
			for (p=0; p<this.pages[i].length; p++) {
				if (Page.isStale(this.pages[i][p], now - this.option[i]) && (!Page.to(this.pages[i][p]))) {
					return true;
				}
			}
		}
	}

	return true;
};
/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page, Queue, Resources,
	Bank, Battle, Generals, LevelUp, Player,
	APP, APPID, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, Divisor, length, sum, findInObject, objectIndex, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
	makeImage
*/
/********** Worker.Income **********
* Auto-general for Income, also optional bank
* User selectable safety margin - at default 5 sec trigger it can take up to 14 seconds (+ netlag) to change
*/
var Income = new Worker('Income');
Income.data = Income.runtime = null;

Income.settings = {
	important:true,
	taint:true
};

Income.defaults['castle_age'] = {};

Income.option = {
	general:true,
	bank:true,
	margin:45
};

Income.temp = {
	income:false,
	bank:false
};

Income.display = [
	{
		id:'general',
		label:'Use Best General',
		checkbox:true
	},{
		id:'bank',
		label:'Automatically Bank',
		checkbox:true
	},{
		advanced:true,
		id:'margin',
		label:'Safety Margin',
		select:[15,30,45,60],
		suffix:'seconds'
	}
];

Income.init = function(event) {
	this._watch(Player, 'data.cash_time');
};

Income.update = function(event) {
	var when = Player.get('cash_timer', 9999) - this.option.margin;
	if (when > 0) {
		this._remind(when, 'income');
	}
	if ((this.set(['temp','income'], when <= 0))) {
		this.set(['temp','bank'], true);
	}
	this.set(['option','_sleep'], !(this.option.general && this.temp.income) && !(this.option.bank && this.temp.bank));
};

Income.work = function(state) {
	if (state) {
		if (this.temp.income) {
			if (Generals.to('income')) {
				log(LOG_INFO, 'Waiting for Income... (' + Player.get('cash_timer') + ' seconds)');
			}
		} else if (this.temp.bank) {
			if (!Bank.stash()) {
				log(LOG_INFO, 'Banking Income...');
			} else {
				this.set(['temp','bank'], false);
			}
		}
	}
	return QUEUE_CONTINUE;
};

/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page, Queue, Resources,
	Bank, Battle, Generals, LevelUp, Player,
	APP, APPID, warn, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser, console,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, Divisor, length, sum, findInObject, objectIndex, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
	makeImage
*/
/********** Worker.Land **********
* Auto-buys property
*/
var Land = new Worker('Land');
Land.temp = null;

Land.settings = {
	taint: true
};

Land.defaults['castle_age'] = {
	pages:'town_land keep_stats'
};

Land.option = {
	enabled:true,
//	wait:48,
	onlyten:false,
	sell:false,
	land_exp:false,
	style:0
};

Land.runtime = {
	lastlevel:0,
	best:null,
	buy:0,
	cost:0,
	snooze:0
};

Land.display = [
	{
		id:'enabled',
		label:'Auto-Buy Land',
		checkbox:true
	},{
		id:'save_ahead',
		label:'Save for future Land',
		checkbox:true
	},{
		advanced:true,
		id:'sell',
		label:'Sell Extra Land',
		checkbox:true,
		help:'You can sell land above your Max at full price.'
	},{
		exploit:true,
		id:'land_exp',
		label:'Sell Extra Land 10 at a time',
		checkbox:true,
		help:'If you have extra lands, this will sell 10x.  The extra sold lands will be repurchased at a lower cost.'
	},{
		id:'style',
		label:'ROI Style',
		select:{0:'Percent', 1:'Daily'},
		help:'This changes the display when visiting the LanD page.'
	}
/*
	},{
		id:'wait',
		label:'Maximum Wait Time',
		select:[0, 24, 36, 48],
		suffix:'hours',
		help:'There has been a lot of testing in this code, it is the fastest way to increase your income despite appearances!'
	},{
		advanced:true,
		id:'onlyten',
		label:'Only buy 10x<br>NOTE: This is slower!!!',
		checkbox:true,
		help:'The standard method is guaranteed to be the most efficient.  Choosing this option will slow down your income.'
	}
*/
];

Land.setup = function() {
	Resources.use('Gold');

	// one time pre-r959 fix for bad land name "name"
	if ((this.runtime.revision || 0) < 959) {
		if (this.data && this.data.name) {
			delete this.data.name;
		}
	}

	this.runtime.revision = revision; // started r959 for historic reference
};

Land.init = function() {
	for (var i in this.data) {
		if (!this.data[i].id || !this.data[i].cost || isNumber(this.data[i].buy) || isNumber(this.data[i].sell)) {
			// force an initial visit if anything important is missing
			Page.set('town_land', 0);
			break;
		}
	}

	this._watch(Player, 'data.level');		// watch for level ups
	this._watch(Player, 'data.worth');		// watch for bank increases
	this._watch(Bank, 'option.keep');		// Watch for changing available amount
	this._watch(Page, 'data.town_land');	// watch for land triggers
};

Land.parse = function(change) {
	var i, tmp, name, txt, modify = false;

	if (Page.page === 'town_land') {
		$('div[style*="town_land_bar."],div[style*="town_land_bar_special."]').each(function(a, el) {
			if ((name = $('div img[alt]', el).attr('alt').trim())) {
				if (!change) {
					try {
						var txt = $(el).text().replace(/[,\s]+/g, '');
						Land._transaction(); // BEGIN TRANSACTION
						assert(Land.set(['data',name,'max'], txt.regex(/yourlevel:(\d+)/i), 'number'), 'Bad maximum: '+name);
						assert(Land.set(['data',name,'income'], txt.regex(/Income:\$(\d+)/), 'number'), 'Bad income: '+name);
						assert(Land.set(['data',name,'cost'], txt.regex(/Income:\$\d+\$(\d+)/), 'number'), 'Bad cost: '+name);
						assert(Land.set(['data',name,'own'], $('span:contains("Owned:")', el).text().replace(/[,\s]+/g, '').regex(/Owned:(\d+)/i), 'number'), 'Bad own count: '+name);
//						Land.set(['data',name,'id']);
						Land.set(['data',name,'buy']);
						if ((tmp = $('form[id*="_prop_"]', el)).length) {
							Land.set(['data',name,'id'], tmp.attr('id').regex(/_prop_(\d+)/i), 'number');
							$('select[name="amount"] option', tmp).each(function(b, el) {
								Land.push(['data',name,'buy'], parseFloat($(el).val()), 'number')
							});
						}
						Land.set(['data',name,'sell']);
						if ((tmp = $('form[id*="_propsell_"]', el)).length) {
							Land.set(['data',name,'id'], tmp.attr('id').regex(/_propsell_(\d+)/i), 'number');
							$('select[name="amount"] option', tmp).each(function(b, el) {
								Land.push(['data',name,'sell'], parseFloat($(el).val()), 'number')
							})
						}
						Land._transaction(true); // COMMIT TRANSACTION
					} catch(e) {
						Land._transaction(false); // ROLLBACK TRANSACTION on any error
						log(LOG_ERROR, e.name + ' in ' + this.name + '.parse(' + change + '): ' + e.message);
					}
				} else if (Land.data[name]) {
					$('strong:first', el).after(' (<span title="Return On Investment - higher is better"><strong>ROI</strong>: ' + ((Land.data[name].income * 100 * (Land.option.style ? 24 : 1)) / Land.data[name].cost).round(3) + '%' + (Land.option.style ? ' / Day' : '') + '</span>)');
				}
			}
			modify = true;
		});
	} else if (Page.page === 'keep_stats') {
		// Only when it's our own keep and not someone elses
		if ($('.keep_attribute_section').length) {
			$('.statsTTitle:contains("LAND") + .statsTMain .statUnit').each(function(a, el) {
				var tmp = $('a img[src]', el), name = ($(tmp).attr('alt') || '').trim(), i = $(el).text().regex(/\bX\s*(\d+)\b/i);
				if (!Land.data[name]) {
					Page.set(['data','town_land'], 0);
				} else if (Land.data[name].own !== i) {
					Land.set(['data', name, 'own'], i);
				}
			});
		}
	}

	return modify;
};

Land.update = function(event) {
	var i, j, k, worth = Bank.worth(), income = Player.get('income', 0) + History.get('income.mean'), level = Player.get('level', 0), best, i_cost, b_cost, buy = 0, cost_increase, time_limit;
	
	if (event.type === 'option' && this.option.land_exp) {
		this.set(['option','sell'], true);
	}
	
	k = 0;
	if (this.option.save_ahead && this.option.enabled) {
		for (i in this.data) {
			if ((this.data[i].max || 0) > 0 && (this.data[i].own || 0) >= this.data[i].max) {
				j = Math.min(10, Math.max(0, this.data[i].max + 10 - this.data[i].own));
				k += j * (this.data[i].cost || 0);
			}
		}
	}
	this.set(['runtime', 'save_amount'], k);

	// don't sell into future buffer if save ahead is enabled
	k = this.option.save_ahead && !this.option.land_exp ? 10 : 0;
	for (i in this.data) {
		if (this.option.sell && this.data[i].sell.length && (this.data[i].max || 0) > 0 && (this.data[i].own || 0) > this.data[i].max + k) {
			best = i;
			buy = this.data[i].max + k - this.data[i].own;// Negative number means sell
			if (this.option.land_exp) {
				buy = -this.data[i].sell[this.data[i].sell.length - 1];
			}
			break;
		}

		if ((income || 0) > 0 && this.data[i].buy && this.data[i].buy.length) {
			b_cost = best ? (this.data[best].cost || 0) : 1e99;
			i_cost = (this.data[i].cost || 0);
			if (!best || ((b_cost / income) + (i_cost / (income + this.data[best].income))) > ((i_cost / income) + (b_cost / (income + this.data[i].income)))) {
				best = i;
			}
		}
	}

	this.set(['runtime','best'], null);
	this.set(['runtime','buy'], 0);
	this.set(['runtime','cost'], 0);

	if (best) {
		if (!buy) {
			//	This calculates the perfect time to switch the amounts to buy.
			//	If the added income from a smaller purchase will pay for the increase in price before you can afford to buy again, buy small.
			//	In other words, make the smallest purchase where the time to make the purchase is larger than the time to payoff the increased cost with the extra income.
			//	It's different for each land because each land has a different "time to payoff the increased cost".
			
			cost_increase = this.data[best].cost / (10 + this.data[best].own);		// Increased cost per purchased land.  (Calculated from the current price and the quantity owned, knowing that the price increases by 10% of the original price per purchase.)
			time_limit = cost_increase / this.data[best].income;		// How long it will take to payoff the increased cost with only the extra income from the purchase.  (This is constant per property no matter how many are owned.)
			time_limit = time_limit * 1.5;		// fudge factor to take into account that most of the time we won't be buying the same property twice in a row, so we will have a bit more time to recoup the extra costs.
//			if (this.option.onlyten || (this.data[best].cost * 10) <= worth) {}			// If we can afford 10, buy 10.  (Or if people want to only buy 10.)
			if ((this.data[best].cost * 10) <= worth) {			// If we can afford 10, buy 10.
				buy = Math.min(this.data[best].max - this.data[best].own, 10);
			} else if (this.data[best].cost / income > time_limit){		// If it will take longer to save for 1 land than it will take to payoff the increased cost, buy 1.
				buy = 1;
			} else if (this.data[best].cost * 5 / income > time_limit){	// If it will take longer to save for 5 lands than it will take to payoff the increased cost, buy 5.
				buy = Math.min(this.data[best].max - this.data[best].own, 5);
			} else {																	// Otherwise buy 10 because that's the max.
				buy = Math.min(this.data[best].max - this.data[best].own, 10);
			}
		}

		k = buy * this.data[best].cost; // May be negative if we're making money by selling
		if ((buy > 0 && this.option.enabled) || (buy < 0 && this.option.sell)) {
			this.set(['runtime','best'], best);
			this.set(['runtime','buy'], buy);
			this.set(['runtime','cost'], k);
		}
	}

	if (best && buy) {
		Dashboard.status(this, (buy > 0 ? (this.runtime.buy ? 'Buying ' : 'Want to buy ') : (this.runtime.buy ? 'Selling ' : 'Want to sell ')) + Math.abs(buy) + 'x ' + best + ' for $' + Math.abs(k).SI() + ' (Available Cash: $' + worth.SI() + ')');
	} else if (this.option.save_ahead && this.runtime.save_amount) {
		if (worth >= this.runtime.save_amount) {
			Dashboard.status(this, 'Saved $' + this.runtime.save_amount.SI() + ' for future land.');
		} else {
			Dashboard.status(this, 'Saved $' + worth.SI() + ' of $' + this.runtime.save_amount.SI() + ' for future land.');
		}
	} else {
		Dashboard.status(this, 'Nothing to do.');
	}

	this.set(['option','_sleep'],
	  level === this.runtime.lastlevel &&
	  (Page.get('town_land') || 0) > 0 &&
	  (!this.runtime.best ||
	  !this.runtime.buy ||
	  worth < this.runtime.cost ||
	  this.runtime.snooze > Date.now()));
};

Land.work = function(state) {
	var o, q;
	if (!state) {
		return QUEUE_CONTINUE;
	} else if (this.runtime.cost > 0 && !Bank.retrieve(this.runtime.cost)) {
		return QUEUE_CONTINUE;
	} else if (!Page.to('town_land')) {
		return QUEUE_CONTINUE;
	} else {
		this.set('runtime.lastlevel', Player.get('level'));
		if (this.runtime.buy < 0) {
			if (!(o = $('form#app'+APPID+'_propsell_'+this.data[this.runtime.best].id)).length) {
				log(LOG_WARN, 'Can\'t find Land sell form for',
				  this.runtime.best,
				  'id[' + this.data[this.runtime.best].id + ']');
				this.set('runtime.snooze', Date.now() + 60000);
				this._remind(60.1, 'sell_land');
				return QUEUE_RELEASE;
			} else {
				q = this.data[this.runtime.best].sell.lower(Math.abs(this.runtime.buy));
				log(LOG_INFO, 'Selling ' + q + '/' + Math.abs(this.runtime.buy) + ' x ' + this.runtime.best + ' for $' + Math.abs(this.runtime.cost).SI());
				$('select[name="amount"]', o).val(q);
				Page.click($('input[name="Sell"]', o));
				return QUEUE_CONTINUE;
			}
		} else if (this.runtime.buy > 0) {
			if (!(o = $('form#app'+APPID+'_prop_'+this.data[this.runtime.best].id)).length) {
				log(LOG_WARN, 'Can\'t find Land buy form for ' + this.runtime.best + ' id[' + this.data[this.runtime.best].id + ']');
				this.set('runtime.snooze', Date.now() + 60000);
				this._remind(60.1, 'buy_land');
				return QUEUE_RELEASE;
			} else {
				q = this.data[this.runtime.best].buy.higher(this.runtime.buy);
				log(LOG_INFO, 'Buying ' + q + '/' + this.runtime.buy + ' x ' + this.runtime.best + ' for $' + Math.abs(this.runtime.cost).SI());
				$('select[name="amount"]', o).val(q);
				Page.click($('input[name="Buy"]', o));
				return QUEUE_CONTINUE;
			}
		}
	}

	return QUEUE_RELEASE;
};

/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page, Queue, Resources,
	Bank, Battle, Generals, Heal, Income, LevelUp:true, Monster, Player, Quest,
	APP, APPID, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, Divisor, length, sum, findInObject, objectIndex, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
	makeImage, calc_rolling_weighted_average
*/
/********** Worker.LevelUp **********
* Will give us a quicker level-up, optionally changing the general to gain extra stats
* 1. Switches generals to specified general
* 2. Changes the best Quest to the one that will get the most exp (rinse and repeat until no energy left) - and set Queue.burn.energy to max available
* 3. Will call Heal.me() function if current health is under 10 and there is any stamina available (So Battle/Arena/Monster can automatically use up the stamina.)
*/

var LevelUp = new Worker('LevelUp');
LevelUp.data = LevelUp.temp = null;

LevelUp.settings = {
	before:['Idle','Battle','Monster','Quest']
};

LevelUp.defaults['castle_age'] = {
	pages:'*'
};

LevelUp.option = {
	income:true,
	bank:true,
	general:'any',
	general_choice:'any',
	order:'stamina',
	algorithm:'Per Action',
	override:false
};

LevelUp.runtime = {
	heal_me:false,// we're active and want healing...
	last_energy:'quest',
	last_stamina:'attack',
	exp:0,
	exp_possible:0,
	avg_exp_per_energy:1.4,
	avg_exp_per_stamina:2.4,
	quests:[], // quests[energy] = [experience, [quest1, quest2, quest3]]
// Old Queue.runtime stuff
	quest: false, // Use for name of quest if over-riding quest
	general: false, // If necessary to specify a multiple general for attack
	action: false, // Level up action
	stamina:0, //How much stamina can be used by workers
	energy:0, //How much energy can be used by workers
	// Force is TRUE when energy/stamina is at max or needed to burn to level up,
	// used to tell workers to do anything necessary to use energy/stamina
	force: {
		energy:false, 
		stamina:false
	}
};

LevelUp.display = [
	{
		title:'Important!',
		label:'This will spend Energy and Stamina to force you to level up quicker.'
	},{
		id:'general',
		label:'Best General',
		select:['any', 'Energy', 'Stamina', 'Manual'],
		help:'Select which type of general to use when leveling up.'
	},{
		advanced:true,
		id:'general_choice',
		label:'Use General',
		require:'general=="Manual"',
		select:'generals'
	},{
		id:'order',
		label:'Spend first ',
		select:['Energy','Stamina'],
		help:'Select which resource you want to spend first when leveling up.'
	},{
		id:'algorithm',
		label:'Estimation Method',
		select:['Per Action', 'Per Hour', 'Manual'],
		help:"'Per Hour' uses your gain per hour. 'Per Action' uses your gain per action."
	},{
		id:'manual_exp_per_stamina',
		label:'Exp per stamina',
		require:'algorithm=="Manual"',
		text:true,
		help:'Experience per stamina point.  Defaults to Per Action if 0 or blank.'
	},{
		id:'manual_exp_per_energy',
		label:'Exp per energy',
		require:'algorithm=="Manual"',
		text:true,
		help:'Experience per energy point.  Defaults to Per Action if 0 or blank.'
	},{
		id:'override',
		label:'Override Monster<br>Avoid Lost-cause Option',
		checkbox:true,
		help:'Overrides Avoid Lost-cause Monster setting allowing LevelUp to burn stamina on behind monsters.'
	}
];

LevelUp.init = function() {
	// BEGIN: fix up "under level 4" generals
	if (this.option.general_choice === 'under level 4') {
		this.set('option.general_choice', 'under max level');
	}
	// END
	this._watch(Player, 'data.exp');
	this._watch(Player, 'data.energy');
	this._watch(Player, 'data.stamina');
	this._watch(Resources, 'option.reserve');
	this._watch(Quest, 'runtime.best');
	this.runtime.exp = this.runtime.exp || Player.get('exp', 0); // Make sure we have a default...
};

LevelUp.parse = function(change) {
	if (change) {

//		$('#app46755028429_st_2_5 strong').attr('title', Player.get('exp') + '/' + Player.get('maxexp') + ' at ' + this.get('exp_average').round(1).addCommas() + ' per hour').html(Player.get('exp_needed').addCommas() + '<span style="font-weight:normal;"><span style="color:rgb(25,123,48);" name="' + this.get('level_timer') + '"> ' + this.get('time') + '</span></span>');
		$('#app46755028429_st_2_5 strong').html('<span title="' + Player.get('exp', 0) + '/' + Player.get('maxexp', 1) + ' at ' + this.get('exp_average').round(1).addCommas() + ' per hour">' + Player.get('exp_needed', 0).addCommas() + '</span> <span style="font-weight:normal;color:rgb(25,123,48);" title="' + this.get('timer') + '">' + this.get('time') + '</span>');
	} else {
		$('.result_body').each(function(i,el){
			if (!$('img[src$="battle_victory.gif"]', el).length) {
				return;
			}
			var txt = $(el).text().replace(/,|\t/g, ''), x;
			x = txt.regex(/([+-]\d+) Experience/i);
			if (x) { History.add('exp+battle', x); }
			x = (txt.regex(/\+\$(\d+)/i) || 0) - (txt.regex(/\-\$(\d+)/i) || 0);
			if (x) { History.add('income+battle', x); }
			x = txt.regex(/([+-]\d+) Battle Points/i);
			if (x) { History.add('bp+battle', x); }
			x = txt.regex(/([+-]\d+) Stamina/i);
			if (x) { History.add('stamina+battle', x); }
			x = txt.regex(/([+-]\d+) Energy/i);
			if (x) { History.add('energy+battle', x); }
		});
	}
	return true;
};

LevelUp.update = function(event, events) {
	var i, quests, energy = Player.get('energy',0), maxenergy = Player.get('maxenergy',0), stamina = Player.get('stamina',0), maxstamina = Player.get('maxstamina',0), exp = Player.get('exp',0), runtime = this.runtime;
	if (events.findEvent('Player') >= 0) {
		// Check if stamina/energy is maxed and should be forced
		if (!this.runtime.force.energy) {
			if (energy >= maxenergy) {
				log(LOG_INFO, 'At max energy, burning...');
				this.set(['runtime','force','energy'], true);
			}
		} else if (energy < maxenergy) {
			this.set(['runtime','force','energy'], false);
		}
		if (!this.runtime.force.stamina) {
			if (stamina >= maxstamina) {
				log(LOG_INFO, 'At max stamina, burning...');
				this.set(['runtime','force','stamina'], true);
			}
		} else if (stamina < maxstamina) {
			this.set(['runtime','force','stamina'], false);
		}
		// Preserve independence of queue system worker by putting exception code into CA workers
		for (i in Workers) {
			if ((worker = Workers[i]) && isFunction(worker.resource) && !worker.get(['option', '_disabled'], false)) { // && !worker.get(['option', '_sleep'], false)
				if ((stat = worker.resource())) {
					switch(stat) {
						case 'energy':
							this.set(['runtime','force','energy'], true);
							log(LOG_INFO, 'LevelUp: ' + worker.name + ': force burn energy...');
							break;
						case 'stamina':
							this.set(['runtime','force','stamina'], true);
							log(LOG_INFO, 'LevelUp: ' + worker.name + ': force burn stamina...');
							break;
					}
					break;
				}
			}
		}
	}
	if (events.findEvent('Player') >= 0 || !length(runtime.quests)) {
		if (exp > runtime.exp && $('span.result_body:contains("xperience")').length) {
			// Experience has increased...
			if (runtime.stamina > stamina) {
				this.runtime.last_stamina = (Page.page === 'keep_monster_active' || Page.page === 'monster_battle_monster') ? 'attack' : 'battle';
				calc_rolling_weighted_average(runtime, 'exp', exp - runtime.exp, 'stamina', runtime.stamina - stamina);
			} else if (runtime.energy > energy) {
				this.runtime.last_energy = (Page.page === 'keep_monster_active' || Page.page === 'monster_battle_monster') ? 'defend' : 'quest';
				// Only need average for monster defense.  Quest average is known.
				if (this.runtime.last_energy === 'defend') {
					calc_rolling_weighted_average(runtime, 'exp', exp - runtime.exp, 'energy', runtime.energy - energy);
				}
			}
		}
	}
	this.set(['runtime','energy'], Math.max(0, energy - (this.runtime.force.energy ? 0 : Resources.get(['option','reserve','Energy'], 0))));
	this.set(['runtime','stamina'], Math.max(0, stamina - (this.runtime.force.stamina ? 0 : Resources.get(['option','reserve','Stamina'], 0))));
	this.set(['runtime','exp'], exp);
	if (this.runtime.stamina && this.runtime.force.stamina && Player.get('health') < 13) {
		LevelUp.set('runtime.heal_me', true);
	}
	//log(LOG_DEBUG, 'next action ' + LevelUp.findAction('best', energy, stamina, Player.get('exp_needed')).exp + ' big ' + LevelUp.findAction('big', energy, stamina, Player.get('exp_needed')).exp);
	if (runtime.running) {
		Dashboard.status(this, '<span title="Exp Possible: ' + this.get('exp_possible') + ', per Hour: ' + this.get('exp_average').round(1).addCommas() + ', per Energy: ' + this.get('exp_per_energy').round(2) + ', per Stamina: ' + this.get('exp_per_stamina').round(2) + '">LevelUp Running Now!</span>');
	} else {
		Dashboard.status(this, '<span title="Exp Possible: ' + this.get('exp_possible') + ', per Energy: ' + this.get('exp_per_energy').round(2) + ', per Stamina: ' + this.get('exp_per_stamina').round(2) + '">' + this.get('time') + ' after ' 
			+ Page.addTimer('levelup', this.get('level_time')) + ' (at ' + this.get('exp_average').round(1).addCommas() + ' exp per hour) minus ' 
			+ Page.addTimer('refill_energy', this.get('refill_energy')) + ' per energy refill '
			+ Page.addTimer('refill_stamina', this.get('refill_stamina')) + ' per stamina refill</span>');
	}
	return true;
};

LevelUp.work = function(state) {
	var heal = this.runtime.heal_me, energy = Player.get('energy', 0), stamina = Player.get('stamina', 0), action = this.runtime.action;
	Generals.set('runtime.disabled', false);
/*	if (!action || !action.big) {
		Generals.set('runtime.disabled', false);
	}
*/	if (!this.runtime.force.stamina || !heal) {
		return QUEUE_FINISH;
	}
	if (!state) {
		return QUEUE_CONTINUE;
	}
	if (heal && Heal.me()) {
		return QUEUE_CONTINUE;
	}
	this.runtime.heal_me = false;
/*	if (action && action.big) {
		Generals.set('runtime.disabled', false);
		if (Generals.to(this.option.general)) {
			//log('Disabling Generals because next action will level.');
			Generals.set('runtime.disabled', true);	// Lock the General again so we can level up.
		} else {
			return QUEUE_CONTINUE;	// Try to change generals again
		}
	}
*/	return QUEUE_FINISH;
};

LevelUp.get = function(what,def) {
	switch(what) {
	case 'timer':		return makeTimer(this.get('level_timer'));
	case 'time':		return (new Date(this.get('level_time'))).format('D g:i a');
	case 'level_timer':	return Math.floor((this.get('level_time') - Date.now()) / 1000);
	case 'level_time':	return Date.now() + Math.floor(3600000 * ((Player.get('exp_needed', 0) - this.get('exp_possible')) / (this.get('exp_average') || 10)));
	case 'refill_energy':	return Date.now() + Math.floor(3600000 * ((Math.min(Player.get('maxenergy',0),2000) * this.get('exp_per_energy')) / (this.get('exp_average') || 10)));
	case 'refill_stamina':	return Date.now() + Math.floor(3600000 * ((Math.min(Player.get('maxstamina',0),1000) * this.get('exp_per_stamina')) / (this.get('exp_average') || 10)));
	case 'exp_average':
		if (this.option.algorithm === 'Per Hour') {
			return History.get('exp.average.change');
		}
		return (12 * (this.get('exp_per_stamina') + this.get('exp_per_energy'))).round(1);
	case 'exp_possible':	
		return (Player.get('stamina', 0)*this.get('exp_per_stamina') 
				+ Player.get('energy', 0) * this.get('exp_per_energy')).round(1);
	case 'exp_per_stamina':	
		if (this.option.algorithm === 'Manual' && this.option.manual_exp_per_stamina) {
			return this.option.manual_exp_per_stamina.round(1);
		}
		return this.runtime.avg_exp_per_stamina.round(1);
	case 'exp_per_energy':	
		if (this.option.algorithm === 'Manual' && this.option.manual_exp_per_energy) {
			return this.option.manual_exp_per_energy.round(1);
		}
		return ((this.runtime.defending || !Quest.get('runtime.best',false))
				? this.runtime.avg_exp_per_energy
				: (Quest.get(['id', Quest.get('runtime.best'), 'exp']) || 0) / 
					(Quest.get(['id', Quest.get('runtime.best'), 'energy']) || 1)).round(1);
	default: return this._get(what,def);
	}
};

LevelUp.findAction = function(mode, energy, stamina, exp) {
	var options =[], i, check, quests, monsters, big, multiples, general = false, basehit, max, raid = false, defendAction, monsterAction, energyAction, staminaAction, questAction, stat = null, value = null, nothing = {stamina:0,energy:0,exp:0};
	defendAction = monsterAction = staminaAction = energyAction = questAction = 0;
	switch(mode) {
	case 'best':
		// Find the biggest exp quest or stamina return to push unusable exp into next level
		big = this.findAction('big',energy,stamina,0); 
		if (this.option.order === 'Energy') {
			check = this.findAction('energy',energy-big.energy,0,exp);
			//log(LOG_WARN, ' levelup quest ' + energy + ' ' + exp);
			//log(LOG_WARN, 'this.runtime.last_energy ' + this.runtime.last_energy + ' checkexp ' + check.exp +' quest ' + check.quest);
			// Do energy first if defending a monster or doing the best quest, but not little 'use energy' quests
			if (check.exp && (check.quest === Quest.runtime.best || !check.quest)) {
				log(LOG_WARN, 'Doing regular quest ' + Quest.runtime.best);
				return check;
			}
		}
		check = this.findAction('attack',0,stamina - big.stamina,exp);
		if (check.exp) {
			log(LOG_WARN, 'Doing stamina attack');
			log(LOG_DEBUG, 'basehit0 ' + check.basehit);
			return check;
		}
		check = this.findAction('quest',energy - big.energy,0,exp);
		if (check.exp) {
			log(LOG_WARN, 'Doing little quest ' + check.quest);
			return check;
		}
		log(LOG_WARN, 'Doing big action to save exp');
		return (big.exp ? big : nothing);
	case 'big':		
		// Should enable to look for other options than last stamina, energy?
		energyAction = this.findAction('energy',energy,stamina,0);
/*		check = this.findAction('energy',energyAction.energy - 1,stamina,0);
		if (energy - check.energy * energy ratio * 1.25 < exp) {
			energyAction = check;
		}
*/		staminaAction = this.findAction('attack',energy,stamina,0);
		if (energyAction.exp > staminaAction.exp) {
			log(LOG_WARN, 'Big action is energy.  Exp use:' + energyAction.exp + '/' + exp);
			energyAction.big = true;
			return energyAction;
		} else if (staminaAction.exp) {
			//log(LOG_WARN, 'big stamina ' + staminaAction.exp + staminaAction.general);
			log(LOG_WARN, 'Big action is stamina.  Exp use:' + staminaAction.exp + '/' + exp);
			staminaAction.big = true;
			return staminaAction;
		} else {
			log(LOG_WARN, 'Big action not found');
			return nothing;  
		}
	case 'energy':	
		//log(LOG_WARN, 'monster runtime defending ' + Monster.get('runtime.defending'));
		if ((Monster.get('runtime.defending')
			&& (Quest.option.monster === 'Wait for'
				|| Quest.option.monster === 'When able'
				|| Queue.option.queue.indexOf('Monster')
					< Queue.option.queue.indexOf('Quest')))
		|| (!exp && Monster.get('runtime.big',false))) {
			defendAction = this.findAction('defend',energy,0,exp);
			if (defendAction.exp) {
				log(LOG_WARN, 'Energy use defend');
				return defendAction;
			}
		}
		questAction = this.findAction('quest',energy,0,exp);
		log(LOG_WARN, 'Energy use quest' + (exp ? 'Normal' : 'Big') + ' QUEST ' + ' Energy use: ' + questAction.energy +'/' + energy + ' Exp use: ' + questAction.exp + '/' + exp + 'Quest ' + questAction.quest);
		return questAction;
	case 'quest':		
		quests = Quest.get('id');
		if (Quest.runtime.best && quests[Quest.runtime.best].energy <= energy && quests[Quest.runtime.best].exp < exp) {
			i = Quest.runtime.best;
		} else {
			i = bestObjValue(quests, function(q) {
				return ((q.energy <= energy && (!exp || (q.exp < exp))) 
						? q.exp / (exp ? q.energy : 1) : null);
			});
		}
		if (i) {
			log(LOG_WARN, (exp ? 'Normal' : 'Big') + ' QUEST ' + ' Energy use: ' + questAction.energy +'/' + energy + ' Exp use: ' + questAction.exp + '/' + exp + 'Quest ' + questAction.quest);
			return {
				energy : quests[i].energy,
				stamina : 0,
				exp : quests[i].exp,
				quest : i
			};
		} else {
			log(LOG_WARN, 'No appropriate quest found');
			return nothing;
		}
	case 'defend':
		stat = 'energy';
		value = energy;
		// Deliberate fall-through
	case 'attack':	
		stat = stat || 'stamina';
		value = value || stamina;
		if (Monster.get(['option', '_disabled'], false)){
				return nothing;
		}
		options = Monster.get('runtime.values.'+mode);
		if (mode === 'defend' && !exp) {
			options = options.concat(Monster.get('runtime.big',[])).unique();
		} else if (mode === 'attack') { // Add 1 so it waits until it has a multiple of remaining stamina before doing the big quest.
			options = options.concat([1]).unique();
		}	
		// Use 6 as a safe exp/stamina and 2.8 for exp/energy multiple 
		max = Math.min((exp ? (exp / ((stat === 'energy') ? 2.8 : 6)) : value), value);
		monsterAction = basehit = options.lower(max);
		multiples = Generals.get('runtime.multipliers');
		for (i in multiples) {
			check = options.map(function(s){ return s * multiples[i]; } ).lower(max);
			if (check > monsterAction) {
				monsterAction = check;
				basehit = check / multiples[i];
				general = i;
			}
		}
		if (monsterAction < 0 && mode === 'attack' && !Battle.get(['option', '_disabled'], false) && Battle.runtime.attacking) {
			monsterAction = [(Battle.option.type === 'War' ? 10 : 1)].lower(max);
		}
		log(LOG_WARN, (exp ? 'Normal' : 'Big') + ' mode: ' + mode + ' ' + stat + ' use: ' + monsterAction +'/' + ((stat === 'stamina') ? stamina : energy) + ' Exp use: ' + monsterAction * this.get('exp_per_' + stat) + '/' + exp + ' Basehit ' + basehit + ' options ' + options + ' General ' + general);
		if (monsterAction > 0 ) {
			return {
				stamina : (stat === 'stamina') ? monsterAction : 0,
				energy : (stat === 'energy') ? monsterAction : 0,
				exp : monsterAction * this.get('exp_per_' + stat),
				general : general,
				basehit : basehit
			};
		}
		break;
	case 'battle':		
		// Need to fill in later
	}
	return nothing;
};

LevelUp.resource = function() {			
	var mode, stat, action;
	if (LevelUp.get('exp_possible') > Player.get('exp_needed')) {
		action = LevelUp.runtime.action = LevelUp.findAction('best', Player.get('energy'), Player.get('stamina'), Player.get('exp_needed'));
		if (action.exp) {
			Monster._remind(0,'levelup');
			this.runtime.levelup = true;
			mode = (action.energy ? 'defend' : 'attack');
			stat = (action.energy ? 'energy' : 'stamina');
			this.runtime[stat] = action[stat];
			if (action.quest) {
				this.runtime.quest = action.quest;
			}
			this.runtime.basehit = ((action.basehit < Monster.get('option.attack_min')) ? action.basehit : false);
			log(LOG_DEBUG, 'basehit1 ' + this.runtime.basehit);
			this.runtime.big = action.big;
			if (action.big) {
				this.runtime.basehit = action.basehit;
				log(LOG_DEBUG, 'basehit2 ' + this.runtime.basehit);
				this.runtime.general = action.general || (LevelUp.option.general === 'any' 
						? false 
						: LevelUp.option.general === 'Manual' 
						? LevelUp.option.general_choice
						: LevelUp.option.general );
			} else if (action.basehit === action[stat] && !Monster.get('option.best_'+mode) && Monster.get('option.general_' + mode) in Generals.get('runtime.multipliers')) {
				log(LOG_WARN, 'Overriding manual general that multiplies attack/defense');
				this.runtime.general = (action.stamina ? 'monster_attack' : 'monster_defend');
			}
			this.runtime.force.stamina = (action.stamina !== 0);
			this.runtime.force.energy = (action.energy !== 0);
			log(LOG_WARN, 'Leveling up: force burn ' + (this.runtime.stamina ? 'stamina' : 'energy') + ' ' + (this.runtime.stamina || this.runtime.energy) + ' basehit ' + this.runtime.basehit);
			//log(LOG_WARN, 'Level up general ' + this.runtime.general + ' base ' + this.runtime.basehit + ' action[stat] ' + action[stat] + ' best ' + !Monster.get('option.best_'+mode) + ' muly ' + (Monster.get('option.general_' + mode) in Generals.get('runtime.multipliers')));
			LevelUp.runtime.running = true;
			return stat;
		}
	}
};/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page, Queue, Resources,
	Battle, Generals, LevelUp, Player,
	APP, APPID, log, debug, userID, imagepath,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH
	makeTimer, Divisor, length, sum, findInObject, objectIndex, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
	makeImage, calc_rolling_weighted_average, bestObjValue
*/
/********** Worker.Monster **********
 * Automates Monster
 */
var Monster = new Worker('Monster');
Monster.temp = null;

Monster.defaults['castle_age'] = {
	pages:'monster_monster_list keep_monster_active monster_battle_monster battle_raid festival_monster_list festival_battle_monster monster_dead monster_remove_list'
};

Monster.option = {
	best_attack:true,
	best_defend:true,
	best_raid:true,
	general_defend:'any',
	general_attack:'any',
	general_raid:'any',
	defend: 80,
	//	quest_over: 90,
	min_to_attack: 20,
	defend_active:false,
	use_tactics:false,
	choice: 'Any',
	stop: 'Never',
	own: true,
	hide:false,
	armyratio: 'Any',
	levelratio: 'Any',
	force1: true,
	raid: 'Invade x5',
	assist: true,
	attack_max: 5,
	attack_min: 5,
	defend_max: 10,
	defend_min: 10,
//	monster_check:'Hourly',
	check_interval:3600000,
	avoid_lost_cause:false,
	lost_cause_hours:5,
	rescue:false,
	risk:false,
    points:false,
	remove:false
};

Monster.runtime = {
	check:false, // id of monster to check if needed, otherwise false
	attack:false, // id of monster if we have an attack target, otherwise false
	defend:false, // id of monster if we have a defend target, otherwise false
	secondary: false, // Is there a target for mage or rogue that is full or not in cycle?  Used to tell quest to wait if don't quest when fortifying is on.
	multiplier : {defend:1,attack:1}, // General multiplier like Orc King or Barbarus
	values : {defend:[],attack:[]}, // Attack/defend values available for levelup
	big : [], // Defend big values available for levelup
	energy: 0, // How much can be used for next attack
	stamina: 0, // How much can be used for next attack
	used:{stamina:0,energy:0}, // How much was used in last attack
	button: {attack: {pick:1, query:[]},  // Query - the jquery query for buttons, pick - which button to use
			defend: {pick:1, query:[]},
			count:1}, // How many attack/defend buttons can the player access?
	health:10, // minimum health to attack,
	mode: null, // Used by update to tell work if defending or attacking
	stat: null, // Used by update to tell work if using energy or stamina
	message: null, // Message to display on dash and log when removing or reviewing or collecting monsters
	
	levelupdefending : false, // Used to preserve the runtime.defending value even when in force.stamina mode
	page : null, // What page (battle or monster) the check page should go to
	monsters : {}, // Used for storing running weighted averages for monsters
	defending: false,	// hint for other workers as to whether we are potentially using energy to defend
	banthus : [], // Possible attack values for :ban condition crits
	banthusNow : false  // Set true when ready to use a Banthus crit
};

Monster.display = [
	{
		advanced:true,
		id:'remove',
		label:'Delete completed monsters',
		checkbox:true,
		help:'Check to have script remove completed monsters with rewards collected from the monster list.'
	},{
		title:'Attack',
		group:[
			{
				id:'best_attack',
				label:'Use Best General',
				checkbox:true
			},{
				advanced:true,
				id:'general_attack',
				label:'Attack General',
				require:'!best_attack',
				select:'generals'
			},{
				advanced:true,
				id:'hide',
				label:'Use Raids and Monsters to Hide',
				checkbox:true,
				require:'stop!="Priority List"',
				help:'Fighting Raids keeps your health down. Fight Monsters with remaining stamina.'
			},{
				advanced:true,
				id:'points',
				label:'Get Demi Points First',
				checkbox:true,
				help:'Use Battle to get Demi Points prior to attacking Monsters.'
			},{
				id:'min_to_attack',
				label:'Attack Over',
				text:1,
				help:'Attack if defense is over this value. Range of 0% to 100%.',
				after:'%'
			},{
				id:'use_tactics',
				label:'Use tactics',
				checkbox:true,
				help:'Use tactics to improve damage when it\'s available (may lower exp ratio)'
			},{
				id:'choice',
				label:'Attack',
				select:['Any', 'Strongest', 'Weakest', 'Shortest ETD', 'Longest ETD', 'Spread', 'Max Damage', 'Min Damage','ETD Maintain','Goal Maintain'],
				help:'Any selects a random monster.' +
					'\nStrongest and Weakest pick by monster health.' +
					'\nShortest and Longest ETD pick by estimated time the monster will die.' +
					'\nMin and Max Damage pick by your relative damage percent done to a monster.' +
					'\nETD Maintain picks based on the longest monster expiry time.' +
					'\nGoal Maintain picks by highest proportional damage needed to complete your damage goal in the time left on a monster.'
			},{
				id:'stop',
				label:'Stop',
				select:['Never', 'Achievement', '2X Achievement', 'Priority List', 'Continuous'],
				help:'Select when to stop attacking a target.'
			},{
				id:'priority',
				label:'Priority List',
				require:'stop=="Priority List"',
				textarea:true,
				help:'Prioritized list of which monsters to attack'
			},{
				advanced:true,
				id:'own',
				label:'Never stop on Your Monsters',
				require:'stop!="Priority List"',
				checkbox:true,
				help:'Never stop attacking your own summoned monsters (Ignores Stop option).'
			},{
				advanced:true,
				id:'rescue',
				require:'stop!="Priority List"',
				label:'Rescue failing monsters',
				checkbox:true,
				help:'Attempts to rescue failing monsters even if damage is at or above Stop Optionby continuing to attack. Can be used in coordination with Lost-cause monsters setting to give up if monster is too far gone to be rescued.'
			},{
				advanced:true,
				id:'avoid_lost_cause',
				label:'Avoid Lost-cause Monsters',
				require:'stop!="Priority List"',
				checkbox:true,
				help:'Do not attack monsters that are a lost cause, i.e. the ETD is longer than the time remaining.'
			},{
				advanced:true,
				id:'lost_cause_hours',
				label:'Lost-cause if ETD is',
				require:'avoid_lost_cause',
				after:'hours after timer',
				text:true,
				help:'# of Hours Monster must be behind before preventing attacks.'
			},{
				id:'attack_min',
				label:'Min Stamina Cost',
				select:[1,5,10,20,50,100,200],
				help:'Select the minimum stamina for a single attack'
			},{
				id:'attack_max',
				label:'Max Stamina Cost',
				select:[1,5,10,20,50,100,200],
				help:'Select the maximum stamina for a single attack'
			}
		]
	},{
		title:'Defend',
		group:[
			{
				id:'defend_active',
				label:'Defend Active',
				checkbox:true,
				help:'Must be checked to defend.'
			},{
		//		id:'defend_group',
				require:'defend_active',
				group:[
					{
						id:'best_defend',
						label:'Use Best General',
						checkbox:true
					},{
						advanced:true,
						id:'general_defend',
						require:'!best_defend',
						label:'Defend General',
						select:'generals'
					},{
						id:'defend',
						label:'Defend Below',
						text:30,
						help:'Defend if defense is under this value. Range of 0% to 100%.',
						after:'%'
					},{
						id:'defend_min',
						label:'Min Energy Cost',
						select:[10,20,40,100,200],
						help:'Select the minimum energy for a single energy action'
					},{
						id:'defend_max',
						label:'Max Energy Cost',
						select:[10,20,40,100,200],
						help:'Select the maximum energy for a single energy action'
					}
				]
			}
		]
	},{
		title:'Raids',
		group:[
			{
				id:'best_raid',
				label:'Use Best General',
				checkbox:true
			},{
				advanced:true,
				id:'general_raid',
				label:'Raid General',
				require:'!best_raid',
				select:'generals'
			},{
				id:'raid',
				label:'Raid',
				select:['Invade', 'Invade x5', 'Duel', 'Duel x5']
			},{
				advanced:true,
				id:'risk',
				label:'Risk Death',
				checkbox:true,
				help:'The lowest health you can raid with is 10, but you can lose up to 12 health in a raid, so are you going to risk it???'
			},{
				id:'armyratio',
				require:'raid!="Duel" && raid!="Duel x5"',
				label:'Target Army Ratio',
				select:['Any', 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.1, 1.2, 1.3, 1.4, 1.5],
				help:'Smaller number for smaller target army. Reduce this number if you\'re losing in Invade'
			},{
				id:'levelratio',
				require:'raid!="Invade" && raid!="Invade x5"',
				label:'Target Level Ratio',
				select:['Any', 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.1, 1.2, 1.3, 1.4, 1.5],
				help:'Smaller number for lower target level. Reduce this number if you\'re losing a lot'
			},{
				id:'force1',
				label:'Force +1',
				checkbox:true,
				help:'Force the first player in the list to aid.'
			}
		]
	},{
		title:'Siege Assist Options',
		group:[
			{
				id:'assist',
				label:'Assist with Sieges',
				help:'Spend stamina to assist with sieges.',
				checkbox:true
			},{
				id:'assist_links',
				label:'Use Assist Links in Dashboard',
				checkbox:true
			},{
				advanced:true,
				id:'check_interval',//monster_check
				label:'Monster Review',
				select:{
					900000:'15 Minutes',
					1800000:'30 Minutes',
					3600000:'Hourly',
					7200000:'2 Hours',
					21600000:'6 Hours',
					43200000:'12 Hours',
					86400000:'Daily',
					604800000:'Weekly'},
				help:'Sets how often to check Monster Stats.'
			}
		]
	}
];

Monster.types = {
	// Quest unlocks
	kull: {
		name:'Kull, the Orc Captain',
		list:'orc_captain_list.jpg',
		image:'orc_captain_large.jpg',
		dead:'orc_captain_dead.jpg',
		achievement:1000, // total guess
		timer:259200, // 72 hours
		mpool:4,
		attack_button:'input[name="Attack Dragon"]',
		siege:false,
		attack:[1]
	},
	minotaur: {
		name:'Karn, The Minotaur',
		list:'monster_minotaur_list.jpg',
		image:'monster_minotaur.jpg',
		dead:'monster_minotaur_dead.jpg',
		achievement:10000, // total guess
		timer:432000, // 120 hours
		mpool:4,
		attack_button:'input[name="Attack Dragon"]',
		siege:false,
		attack:[1,6]
	},
	// Raids
	raid_easy: {
		name:'The Deathrune Siege',
		list:'deathrune_list1.jpg',
		image:'raid_title_raid_a1.jpg',
		image2:'raid_title_raid_a2.jpg',
		dead:'raid_1_large_victory.jpg',
		achievement:100,
		timer:216000, // 60 hours
		timer2:302400, // 84 hours
		raid:true
	},

	raid: {
		name:'The Deathrune Siege',
		list:'deathrune_list2.jpg',
		image:'raid_title_raid_b1.jpg',
		image2:'raid_title_raid_b2.jpg',
		dead:'raid_1_large_victory.jpg',
		achievement:100,
		timer:319920, // 88 hours, 52 minutes
		timer2:519960, // 144 hours, 26 minutes
		raid:true
	},
	// Epic Boss
	colossus: {
		name:'Colossus of Terra',
		list:'stone_giant_list.jpg',
		image:'stone_giant_large.jpg',
		dead:'stone_giant_dead.jpg',
		achievement:20000,
		timer:259200, // 72 hours
		mpool:1,
		attack_button:'input[name="Attack Dragon"]',
		siege:false,
		attack:[1,5],
		festival_timer: 345600, // 96 hours
		festival: 'stonegiant'
	},
	gildamesh: {
		name:'Gildamesh, the Orc King',
		list:'orc_boss_list.jpg',
		image:'orc_boss.jpg',
		dead:'orc_boss_dead.jpg',
		achievement:15000,
		timer:259200, // 72 hours
		mpool:1,
		attack_button:'input[name="Attack Dragon"]',
		siege:false,
		attack:[1,5],
		festival_timer: 345600, // 96 hours
		festival: 'orcking'
	},
	keira: {
		name:'Keira the Dread Knight',
		list:'boss_keira_list.jpg',
		image:'boss_keira.jpg',
		dead:'boss_keira_dead.jpg',
		achievement:30000,
		timer:172800, // 48 hours
		mpool:1,
		attack_button:'input[name="Attack Dragon"]',
		siege:false,
		attack:[1,5]
	},
	lotus: {
		name:'Lotus Ravenmoore',
		list:'boss_lotus_list.jpg',
		image:'boss_lotus.jpg',
		dead:'boss_lotus_big_dead.jpg',
		achievement:500000,
		timer:172800, // 48 hours
		mpool:1,
		attack_button:'input[name="Attack Dragon"]',
		siege:false,
		attack:[1,5]
	},
	mephistopheles: {
		name:'Mephistopheles',
		list:'boss_mephistopheles_list.jpg',
		image:'boss_mephistopheles_large.jpg',
		dead:'boss_mephistopheles_dead.jpg',
		achievement:100000,
		timer:172800, // 48 hours
		mpool:1,
		attack_button:'input[name="Attack Dragon"]',
		siege:false,
		attack:[1,5],
		festival_timer: 320400, // 89 hours
		festival: 'mephistopheles'
	},
	skaar: {
		name:'Skaar Deathrune',
		list:'death_list.jpg',
		image:'death_large.jpg',
		dead:'death_dead.jpg',
		achievement:1000000,
		timer:345000, // 95 hours, 50 minutes
		mpool:1,
		attack_button:'input[name="Attack Dragon"][src*="attack"]',
		attack:[1,5,10,20,50],
		defend_button:'input[name="Attack Dragon"][src*="dispel"]',
		defend:[10,10,20,40,100],
		defense_img:'shield_img',
		festival_timer: 432000, // 120 hours
		festival: 'skaar_boss'
	},
	sylvanus: {
		name:'Sylvana the Sorceress Queen',
		list:'boss_sylvanus_list.jpg',
		image:'boss_sylvanus_large.jpg',
		dead:'boss_sylvanus_dead.jpg',
		achievement:50000,
		timer:172800, // 48 hours
		mpool:1,
		attack_button:'input[name="Attack Dragon"]',
		attack:[1,5],
		festival_timer: 259200, // 72 hours
		festival: 'sylvanus'
	},
	// Epic Team
	dragon_emerald: {
		name:'Emerald Dragon',
		list:'dragon_list_green.jpg',
		image:'dragon_monster_green.jpg',
		dead:'dead_dragon_image_green.jpg',
		achievement:100000,
		timer:259200, // 72 hours
		mpool:2,
		attack_button:'input[name="Attack Dragon"]',
		siege:false,
		attack:[5,10],
		festival: 'dragon_green'
	},
	dragon_frost: {
		name:'Frost Dragon',
		list:'dragon_list_blue.jpg',
		image:'dragon_monster_blue.jpg',
		dead:'dead_dragon_image_blue.jpg',
		achievement:100000,
		timer:259200, // 72 hours
		mpool:2,
		attack_button:'input[name="Attack Dragon"]',
		siege:false,
		attack:[5,10],
		festival_timer: 345600, // 96 hours
		festival: 'dragon_blue'
	},
	dragon_gold: {
		name:'Gold Dragon',
		list:'dragon_list_yellow.jpg',
		image:'dragon_monster_gold.jpg',
		dead:'dead_dragon_image_gold.jpg',
		achievement:100000,
		timer:259200, // 72 hours
		mpool:2,
		attack_button:'input[name="Attack Dragon"]',
		siege:false,
		attack:[5,10],
		festival_timer: 345600, // 96 hours
		festival: 'dragon_yellow'
	},
	dragon_red: {
		name:'Ancient Red Dragon',
		list:'dragon_list_red.jpg',
		image:'dragon_monster_red.jpg',
		image2:'dragon_monster.jpg',
		dead:'dead_dragon_image_red.jpg',
		achievement:100000,
		timer:259200, // 72 hours
		mpool:2,
		attack_button:'input[name="Attack Dragon"]',
		siege:false,
		attack:[5,10],
		festival_timer: 345600, // 96 hours
		festival: 'dragon_red'
	},
	serpent_amethyst: { 
		name:'Amethyst Sea Serpent',
		list:'seamonster_list_purple.jpg',
		image:'seamonster_purple.jpg',
		dead:'seamonster_dead.jpg',
		title:'monster_header_amyserpent.jpg',
		achievement:250000,
		timer:259200, // 72 hours
		mpool:2,
		attack_button:'input[name="Attack Dragon"]',
		siege:false,
		attack:[10,20],
		defend_button:'input[name="Defend against Monster"]',
		defend:[10],
		festival_timer: 345600, // 96 hours
		festival: 'seamonster_purple'
	},
	serpent_ancient: { 
		name:'Ancient Sea Serpent',
		list:'seamonster_list_red.jpg',
		image:'seamonster_red.jpg',
		dead:'seamonster_dead.jpg',
		title:'monster_header_ancientserpent.jpg',
		achievement:250000,
		timer:259200, // 72 hours
		mpool:2,
		attack_button:'input[name="Attack Dragon"]',
		siege:false,
		attack:[10,20],
		defend_button:'input[name="Defend against Monster"]',
		defend:[10],
		festival_timer: 345600, // 96 hours
		festival: 'seamonster_red'
	},
	serpent_emerald: { 
		name:'Emerald Sea Serpent',
		list:'seamonster_list_green.jpg',
		image:'seamonster_green.jpg',
		dead:'seamonster_dead.jpg',
		title:'seamonster_title_emerald.jpg',
		achievement:250000,
		timer:259200, // 72 hours
		mpool:2,
		attack_button:'input[name="Attack Dragon"]',
		siege:false,
		attack:[10,20],
		defend_button:'input[name="Defend against Monster"]',
		defend:[10],
		festival_timer: 345600, // 96 hours
		festival: 'seamonster_green'
	},
	serpent_sapphire: {
		name:'Sapphire Sea Serpent',
		list:'seamonster_list_blue.jpg',
		image:'seamonster_blue.jpg',
		dead:'seamonster_dead.jpg',
		title:'seamonster_title_sapphire.jpg',
		achievement:250000,
		timer:259200, // 72 hours
		mpool:2,
		attack_button:'input[name="Attack Dragon"]',
		siege:false,
		attack:[10,20],
		defend_button:'input[name="Defend against Monster"]',
		defend:[10],
		festival_timer: 345600, // 96 hours
		festival: 'seamonster_blue'
	},
	// Epic World
	cronus: {
		name:'Cronus, The World Hydra',
		list:'hydra_head.jpg',
		image:'hydra_large.jpg',
		dead:'hydra_dead.jpg',
		achievement:500000,
		timer:604800, // 168 hours
		mpool:3,
		attack_button:'input[name="Attack Dragon"]',
		attack:[5,10,20,50,100,200],
		festival_timer: 691200, // 192 hours
		festival: 'hydra'
	},
	legion: {
		name:'Battle of the Dark Legion',
		list:'castle_siege_list.jpg',
		image:'castle_siege_large.jpg',
		dead:'castle_siege_dead.jpg',
		achievement:1000,
		timer:604800, // 168 hours
		mpool:3,
		attack_button:'input[name="Attack Dragon"][src*="attack"]',
		attack:[1,5,10,20,50],
		defend_button:'input[name="Attack Dragon"][src*="fortify"]',
		defend:[10,10,20,40,100],
		orcs:true
	},
	genesis: {
		name:'Genesis, The Earth Elemental',
		list:'earth_element_list.jpg',
		image:'earth_element_large.jpg',
		dead:'earth_element_dead.jpg',
		achievement:1000000,
		timer:604800, // 168 hours
		mpool:3,
		attack_button:'input[name="Attack Dragon"][src*="attack"]',
		attack:[1,5,10,20,50],
		defend_button:'input[name="Attack Dragon"][src*="fortify"]',
		defend:[10,10,20,40,100],
		festival_timer: 691200, // 192 hours
		festival: 'earth_element'
	},
	ragnarok: {
		name:'Ragnarok, The Ice Elemental',
		list:'water_list.jpg',
		image:'water_large.jpg',
		dead:'water_dead.jpg',
		achievement:1000000,
		timer:604800, // 168 hours
		mpool:3,
		attack_button:'input[name="Attack Dragon"][src*="attack"]',
		attack:[1,5,10,20,50],
		defend_button:'input[name="Attack Dragon"][src*="dispel"]',
		defend:[10,10,20,40,100],
		defense_img:'shield_img',
		festival_timer: 691200, // 192 hours
		festival: 'water_element'
	},
	gehenna: {
		name:'Gehenna',
		list:'nm_gehenna_list.jpg',
		image:'nm_gehenna_large.jpg',
		dead:'nm_gehenna_dead.jpg',
		achievement:1000000,
		timer:604800, // 168 hours
		mpool:3,
		attack_button:'input[name="Attack Dragon"][src*="stab"],input[name="Attack Dragon"][src*="bolt"],input[name="Attack Dragon"][src*="smite"],input[name="Attack Dragon"][src*="bash"]',
		attack:[5,10,20,50],
		defend_button:'input[name="Attack Dragon"][src*="heal"]',
		defend:[10,20,40,100],
		festival_timer: 691200, // 192 hours
		festival: 'fire_element'
	},
	valhalla: {
		name:'Valhalla, The Air Elemental',
		list:'monster_valhalla_list.jpg',
		image:'monster_valhalla.jpg',
		dead:'monster_valhalla_dead.jpg',
		achievement:1000000,
		timer:604800, // 168 hours
		mpool:3,
		attack_button:'input[name="Attack Dragon"][src*="stab"],input[name="Attack Dragon"][src*="bolt"],input[name="Attack Dragon"][src*="smite"],input[name="Attack Dragon"][src*="bash"]',
		attack:[10,20,50,100,200],
		defend_button:'input[name="Attack Dragon"][src*="heal"]',
		defend:[20,40,100,200],
		festival_timer: 691200, // 192 hours
		festival: 'air_element'
	},
	bahamut: {
		name:'Bahamut, the Volcanic Dragon',
		list:'nm_volcanic_list.jpg',
		image:'nm_volcanic_large.jpg',
		dead:'nm_volcanic_dead.jpg',
		achievement:2000000, // Guesswork
		timer:604800, // 168 hours
		mpool:3,
		attack_button:'input[name="Attack Dragon"][src*="stab"],input[name="Attack Dragon"][src*="bolt"],input[name="Attack Dragon"][src*="smite"],input[name="Attack Dragon"][src*="bash"]',
		attack:[5,10,20,50],
		defend_button:'input[name="Attack Dragon"][src*="heal"]',
		defend:[10,20,40,100],
		festival_timer: 691200, // 192 hours
		festival: 'volcanic_new'
	},
	alpha_bahamut: {
		name:'Alpha Bahamut, the Volcanic Dragon',
		list:'nm_volcanic_list_2.jpg',
		image:'nm_volcanic_large_2.jpg',
		dead:'nm_volcanic_dead_2.jpg',
		achievement:6000000, // Guesswork
		timer:604800, // 168 hours
		mpool:3,
		attack_button:'input[name="Attack Dragon"][src*="stab"],input[name="Attack Dragon"][src*="bolt"],input[name="Attack Dragon"][src*="smite"],input[name="Attack Dragon"][src*="bash"]',
		attack:[5,10,20,50],
		defend_button:'input[name="Attack Dragon"][src*="heal"]',
		defend:[10,20,40,100]
	},
	azriel: {
		name:'Azriel, the Angel of Wrath',
		list:'nm_azriel_list.jpg',
		image:'nm_azriel_large2.jpg',
		dead:'nm_azriel_dead.jpg',
		achievement:6000000, // ~0.5%, 2X = ~1%
		timer:604800, // 168 hours
		mpool:1,
		attack_button:'input[name="Attack Dragon"][src*="stab"],input[name="Attack Dragon"][src*="bolt"],input[name="Attack Dragon"][src*="smite"],input[name="Attack Dragon"][src*="bash"]',
		attack:[5,10,20,50],
		defend_button:'input[name="Attack Dragon"][src*="heal"]',
		defend:[10,20,40,100],
		festival_timer: 691200, // 192 hours
		festival: 'boss_azriel'
	},
	red_plains: {
		name:'War of the Red Plains',
		list:'nm_war_list.jpg',
		image:'nm_war_large.jpg',
		dead:'nm_war_dead.jpg',
		achievement:2500,
		timer:604800, // 168 hours
		mpool:3,
		attack_button:'input[name="Attack Dragon"][src*="stab"],input[name="Attack Dragon"][src*="bolt"],input[name="Attack Dragon"][src*="smite"],input[name="Attack Dragon"][src*="bash"]',
		attack:[5,10,20,50],
		tactics_button:'input[name="Attack Dragon"][src*="tactics"]',
		tactics:[5,10,20,50],
		defend_button:'input[name="Attack Dragon"][src*="heal"]',
		defend:[10,20,40,100],
		orcs:true
	},
	corvintheus: {
		name:'Corvintheus',
		list:'corv_list.jpg',
		image:'boss_corv.jpg',
		dead:'boss_corv_dead.jpg',
		achievement:5000000,
		timer:604800, // 168 hours
		mpool:1,
		attack_button:'input[name="Attack Dragon"][src*="stab"],input[name="Attack Dragon"][src*="bolt"],input[name="Attack Dragon"][src*="smite"],input[name="Attack Dragon"][src*="bash"]',
		attack:[5,10,20,50],
		defend_button:'input[name="Attack Dragon"][src*="heal"]',
		defend:[10,20,40,100]
	},
	agamemnon: {
		name:'Agamemnon the Overseer',
		list:'boss_agamemnon_list.jpg',
		image:'boss_agamemnon_large.jpg',
		dead:'boss_agamemnon_dead.jpg',  // guess
		achievement:5000000,
		timer:604800, // 168 hours
		mpool:1,
		attack_button:'input[name="Attack Dragon"][src*="stab"],input[name="Attack Dragon"][src*="bolt"],input[name="Attack Dragon"][src*="smite"],input[name="Attack Dragon"][src*="bash"]',
		attack:[10,20,50,100,200],
		defend_button:'input[name="Attack Dragon"][src*="heal"]',
		defend:[20,40,100,200],
		festival_timer: 691200, // 192 hours
		festival : 'agamemnon'
	},
	jahanna: {
		name:'Jahanna, Priestess of Aurora',
		list:'boss_jahanna_list.jpg',
		image:'boss_jahanna_large.jpg',
		dead:'boss_jahanna_dead.jpg',
		achievement:5000000,
		timer:604800, // 168 hours
		mpool:1,
		attack_button:'input[name="Attack Dragon"][src*="stab"],input[name="Attack Dragon"][src*="bolt"],input[name="Attack Dragon"][src*="smite"],input[name="Attack Dragon"][src*="bash"]',
		attack:[10,20,50,100,200],
		defend_button:'input[name="Attack Dragon"][src*="heal"]',
		defend:[20,40,100,200]
	},
	aurora: {
		name:'Aurora',
		list:'boss_aurora_list.jpg',
		image:'boss_aurora_large.jpg',
		dead:'boss_aurora_dead.jpg',
		achievement:5000000,
		timer:604800, // 168 hours
		mpool:1,
		attack_button:'input[name="Attack Dragon"][src*="stab"],input[name="Attack Dragon"][src*="bolt"],input[name="Attack Dragon"][src*="smite"],input[name="Attack Dragon"][src*="bash"]',
		attack:[10,20,50,100,200],
		defend_button:'input[name="Attack Dragon"][src*="heal"]',
		defend:[20,40,100,200]
	},
	rebellion: {
		name:'Aurelius, Lion\'s Rebellion',
		list:'nm_aurelius_list.jpg',
		image:'nm_aurelius_large.jpg',
		dead:'nm_aurelius_large_dead.jpg',
		achievement:1000,
		timer:604800, // 168 hours
		mpool:1,
		attack_button:'input[name="Attack Dragon"][src*="stab"],input[name="Attack Dragon"][src*="bolt"],input[name="Attack Dragon"][src*="smite"],input[name="Attack Dragon"][src*="bash"]',
		attack:[5,10,20,50],
		tactics_button:'input[name="Attack Dragon"][src*="tactics"]',
		tactics:[5,10,20,50],
		defend_button:'input[name="Attack Dragon"][src*="heal"]',
		defend:[10,20,40,100],
		orcs:true
	},
	alpha_meph: {
		name:'Alpha Mephistopheles',
		list:'nm_alpha_mephistopheles_list.jpg',
		image:'nm_mephistopheles2_large.jpg',
		dead:'nm_mephistopheles2_dead.jpg',
		achievement:6000000,
		timer:604800, // 168 hours
		mpool:3,
		attack_button:'input[name="Attack Dragon"][src*="stab"],input[name="Attack Dragon"][src*="bolt"],input[name="Attack Dragon"][src*="smite"],input[name="Attack Dragon"][src*="bash"]',
		attack:[5,10,20,50],
		defend_button:'input[name="Attack Dragon"][src*="heal"]',
		defend:[10,20,40,100],
		festival_timer: 691200, // 192 hours
		festival: 'alpha_mephistopheles',
		festival_mpool: 1
	},
	giant_kromash: {
		name:'Kromash',
		list:'monster_kromash_list.jpg',
		image:'monster_kromash_large.jpg',
		dead:'monster_kromash_dead.jpg',
		achievement:6000000,
		timer:604800, // 168 hours
		mpool:3,
		attack_button:'input[name="Attack Dragon"][src*="stab"],input[name="Attack Dragon"][src*="bolt"],input[name="Attack Dragon"][src*="smite"],input[name="Attack Dragon"][src*="bash"]',
		attack:[5,10,20,50],
		defend_button:'input[name="Attack Dragon"][src*="heal"]',
		defend:[10,20,40,100]
	},
	giant_glacius: {
		name:'Glacius',
		list:'monster_glacius_list.jpg',
		image:'monster_glacius_large.jpg',
		dead:'monster_glacius_dead.jpg',
		achievement:6000000,
		timer:604800, // 168 hours
		mpool:3,
		attack_button:'input[name="Attack Dragon"][src*="stab"],input[name="Attack Dragon"][src*="bolt"],input[name="Attack Dragon"][src*="smite"],input[name="Attack Dragon"][src*="bash"]',
		attack:[5,10,20,50],
		defend_button:'input[name="Attack Dragon"][src*="heal"]',
		defend:[10,20,40,100]
	},
	giant_shardros: {
		name:'Shardros',
		list:'monster_shardros_list.jpg',
		image:'monster_shardros_large.jpg',
		dead:'monster_shardros_dead.jpg',
		achievement:6000000,
		timer:604800, // 168 hours
		mpool:3,
		attack_button:'input[name="Attack Dragon"][src*="stab"],input[name="Attack Dragon"][src*="bolt"],input[name="Attack Dragon"][src*="smite"],input[name="Attack Dragon"][src*="bash"]',
		attack:[5,10,20,50],
		defend_button:'input[name="Attack Dragon"][src*="heal"]',
		defend:[10,20,40,100]
	},
	giant_magmos: {
		name:'Magmos',
		list:'monster_magmos_list.jpg',
		image:'monster_magmos_large.jpg',
		dead:'monster_magmos_dead.jpg',
		achievement:6000000,
		timer:604800, // 168 hours
		mpool:3,
		attack_button:'input[name="Attack Dragon"][src*="stab"],input[name="Attack Dragon"][src*="bolt"],input[name="Attack Dragon"][src*="smite"],input[name="Attack Dragon"][src*="bash"]',
		attack:[5,10,20,50],
		defend_button:'input[name="Attack Dragon"][src*="heal"]',
		defend:[10,20,40,100]
	}
};

Monster.health_img = ['img[src$="nm_red.jpg"]', 'img[src$="monster_health_background.jpg"]'];
Monster.shield_img = ['img[src$="bar_dispel.gif"]'];
Monster.defense_img = ['img[src$="nm_green.jpg"]', 'img[src$="seamonster_ship_health.jpg"]'];
Monster.secondary_img = 'img[src$="nm_stun_bar.gif"]';
Monster.class_img = ['div[style*="nm_bottom"] img[src$="nm_class_warrior.jpg"]',
				'div[style*="nm_bottom"] img[src$="nm_class_cleric.jpg"]',
				'div[style*="nm_bottom"] img[src$="nm_class_rogue.jpg"]',
				'div[style*="nm_bottom"] img[src$="nm_class_mage.jpg"]',
				'div[style*="nm_bottom"] img[src$="nm_class_ranger.jpg"]',
				'div[style*="nm_bottom"] img[src$="nm_class_warlock.jpg"]'];
Monster.class_name = ['Warrior', 'Cleric', 'Rogue', 'Mage', 'Ranger', 'Warlock'];
Monster.secondary_off = 'img[src$="nm_s_off_cripple.gif"],img[src$="nm_s_off_deflect.gif"]';
Monster.secondary_on = 'input[name="Attack Dragon"][src*="cripple"],input[name="Attack Dragon"][src*="deflect"]';
Monster.warrior = 'input[name="Attack Dragon"][src*="strengthen"]';
Monster.raid_buttons = {
	'Invade':	'input[src$="raid_attack_button.gif"]:first',
	'Invade x5':'input[src$="raid_attack_button3.gif"]:first',
	'Duel':		'input[src$="raid_attack_button2.gif"]:first',
	'Duel x5':	'input[src$="raid_attack_button4.gif"]:first'};
Monster.name_re = null;
Monster.name2_re = /^\s*(.*\S)\s*'s\b/im; // secondary player/monster name match regexp

Monster.setup = function() {
	Resources.use('Energy');
	Resources.use('Stamina');
};

Monster.init = function() {
	var i, str;

	// BEGIN: fix up "under level 4" generals
	if (this.option.general_attack === 'under level 4') {
		this.set('option.general_attack', 'under max level');
	}
	if (this.option.general_defend === 'under level 4') {
		this.set('option.general_defend', 'under max level');
	}
	if (this.option.general_raid === 'under level 4') {
		this.set('option.general_raid', 'under max level');
	}
	// END

	this._watch(Player, 'data.health');
	this._watch(LevelUp, 'runtime');
	this._revive(60);
	this.runtime.limit = 0;
	if (isNumber(this.runtime.multiplier)) {
		delete this.runtime.multiplier;
		this.runtime.multiplier = {defend:1,attack:1}; // General multiplier like Orc King or Barbarus
	}
	delete this.runtime.record;

	// generate a complete primary player/monster name match regexp
	str = '';
	for (i in this.types) {
		if (this.types[i].name) {
			if (str !== '') {
				str += '|';
			}
			str += this.types[i].name.regexp_escape();
		}
	}
	this.name_re = new RegExp("^\\s*(.*\\S)\\s*'s\\s+(?:" + str + ')\\s*$', 'im');
};

Monster.parse = function(change) {
	var i, uid, name, type, tmp, list, el, mid, type_label, $health, $defense, $dispel, $secondary, dead = false, monster, timer, ATTACKHISTORY = 20, data = this.data, types = this.types, now = Date.now(), ensta = ['energy','stamina'], x, festival, parent = $('#app46755028429_app_body'), $children;
	//log(LOG_WARN, 'Parsing ' + Page.page);
	if (['keep_monster_active', 'monster_battle_monster', 'festival_battle_monster'].indexOf(Page.page)>=0) { // In a monster or raid
		festival = Page.page === 'festival_battle_monster';
		uid = $('img[linked][size="square"]').attr('uid');
		//log(LOG_WARN, 'Parsing for Monster type');
		for (i in types) {
			if (types[i].dead && $('img[src$="'+types[i].dead+'"]', parent).length 
					&& (!types[i].title || $('div[style*="'+types[i].title+'"]').length 
						|| $('div[style*="'+types[i].image+'"]', parent).length)) {
//			if (types[i].dead && $('img[src$="'+types[i].dead+'"]', parent).length) {
				//log(LOG_WARN, 'Found a dead '+i);
				type_label = i;
				timer = (festival ? types[i].festival_timer : 0) || types[i].timer;
				dead = true;
				break;
			} else if (types[i].image && $('img[src$="'+types[i].image+'"],div[style*="'+types[i].image+'"]', parent).length) {
				//log(LOG_WARN, 'Parsing '+i);
				type_label = i;
				timer = (festival ? types[i].festival_timer : 0) || types[i].timer;
				break;
			} else if (types[i].image2 && $('img[src$="'+types[i].image2+'"],div[style*="'+types[i].image2+'"]', parent).length) {
				//log(LOG_WARN, 'Parsing second stage '+i);
				type_label = i;
				timer = (festival ? types[i].festival_timer : 0) || types[i].timer2 || types[i].timer;
				break;
			}
		}
		if (!uid || !type_label) {
			log(LOG_WARN, 'Unable to identify monster' + (!uid ? ' owner' : '') + (!type_label ? ' type' : ''));
			return false;
		}
		mid = uid+'_' + (Page.page === 'festival_battle_monster' ? 'f' : (types[i].mpool || 4));
		if (this.runtime.check === mid) {
			this.set(['runtime','check'], false);
		}
		//log(LOG_WARN, 'MID '+ mid);
		this.set(['data',mid,'type'],type_label);
		monster = data[mid];
		monster.button_fail = 0;
		type = types[type_label];
		monster.last = now;
		if (Page.page === 'festival_battle_monster') {
			monster.page = 'festival';
		} else {
			monster.page = 'keep';
		}
		monster.name = $('img[linked][size="square"]').parent().parent().parent().text().replace('\'s summoned','').replace(' Summoned','').replace(/Monster Code: \w+:\d/,'').trim();
		if (dead) {
			// Will this catch Raid format rewards?
			if ($('input[src*="collect_reward_button"]').length) {
				monster.state = 'reward';
			} else if ($('td.dragonContainer table table a[href^="http://apps.facebook.com/castle_age/keep.php?casuser=' + userID + '"]').length) {
				if (!monster.dead) {
					History.add(type_label,1);
					monster.dead = true;
				}
				monster.state = 'complete';
				this.set(['data',mid,'remove'], true);
			} else {
				monster.state = null;
			}
			return false;
		}
		monster.stamina = monster.stamina || {};
		monster.damage = monster.damage || {};
		monster.damage.user = monster.damage.user || {};
		monster.energy = monster.energy || {};
		monster.defend = monster.defend || {};
		this.runtime.monsters[monster.type] = this.runtime.monsters[monster.type] || {};
		if ($('span.result_body').text().match(/for your help in summoning|You have already assisted on this objective|You don't have enough stamina assist in summoning/i)) {
			if ($('span.result_body').text().match(/for your help in summoning/i)) {
				monster.assist = now;
			}
			monster.state = monster.state || 'assist';
		} else {
			for (i in ensta) {
				if (this.runtime.used[ensta[i]]) {
					if ($('span[class="positive"]').length && $('span[class="positive"]').prevAll('span').text().replace(/[^0-9\/]/g,'')) {
						calc_rolling_weighted_average(this.runtime.monsters[monster.type]
								,'damage',Number($('span[class="positive"]').prevAll('span').text().replace(/[^0-9\/]/g,''))
								,ensta[i],this.runtime.used[ensta[i]],10);
						//log(LOG_WARN, 'Damage per ' + ensta[i] + ' = ' + this.runtime.monsters[monster.type]['avg_damage_per_' + ensta[i]]);
						if (Player.get('general') === 'Banthus Archfiend' 
								&& Generals.get(['data','Banthus Archfiend','charge'],1e99) < Date.now()) {
							Generals.set(['data','Banthus Archfiend','charge'],Date.now() + 4320000);
						}
						if (Player.get('general') === 'Zin'
								&& Generals.get(['data','Zin','charge'],1e99) < Date.now()) {
							Generals.set(['data','Zin','charge'],Date.now() + 82800000);
						}
					}
					this.runtime.used[ensta[i]] = 0;
					break;
				}
			}
		}
		if ($('img[src$="battle_victory"]').length) {
			History.add('raid+win',1);
		} else if ($('img[src$="battle_defeat"]').length) {
			History.add('raid+loss',-1);
		}
		// Check if variable number of button monster
		if (!type.raid && monster.state === 'engage' && type.attack.length > 2) {
			this.runtime.button.count = $(type.attack_button).length;
		}
		// Need to also parse what our class is for Bahamut.  (Can probably just look for the strengthen button to find warrior class.)
		for (i in Monster.class_img){
			if ($(Monster.class_img[i]).length){
				monster.mclass = i;
				break;
				//log(LOG_WARN, 'Monster class : '+Monster['class_name'][i]);
			}
		}
		if ($(Monster.warrior).length) {
			monster.warrior = true;
		}
		if ($(Monster.secondary_off).length) {
			monster.secondary = 100;
		} else if ($(Monster.secondary_on).length) {
			monster.secondary = 0.01; // Prevent from defaulting to false
			$secondary = $(Monster['secondary_img']);
			if ($secondary.length) {
				this.set(['data',mid,'secondary'], 100 * $secondary.width() / $secondary.parent().width());
				log(LOG_WARN, Monster['class_name'][monster.mclass]+" phase. Bar at "+monster.secondary+"%");
			}
		}
		// If we have some other class but no cleric button, then we can't heal.
		if ((monster.secondary || monster.warrior) && !$(type.defend_button).length) {
			monster.no_heal = true;
		}
		for (i in Monster['health_img']){
			if ($(Monster['health_img'][i]).length){
				$health = $(Monster['health_img'][i]).parent();
				monster.health = $health.length ? (100 * $health.width() / $health.parent().width()) : 0;
				break;
			}
		}
		if (!type.defense_img || type.defense_img === 'shield_img') {
			// If we know this monster should have a shield image and don't find it, assume 0
			if (type.defense_img === 'shield_img') {
				monster.defense = 100;
			}
			for (i in Monster['shield_img']){
				if ($(Monster['shield_img'][i]).length){
					$dispel = $(Monster['shield_img'][i]).parent();
					monster.defense = 100 * (1 - ($dispel.width() / ($dispel.next().length ? $dispel.width() + $dispel.next().width() : $dispel.parent().width())));
					break;
				}
			}
		}
		if (!type.defense_img || type.defense_img === 'defense_img') {
			// If we know this monster should have a defense image and don't find it, 
			for (i in Monster['defense_img']){
				if ($(Monster['defense_img'][i]).length){
					$defense = $(Monster['defense_img'][i]).parent();
					monster.defense = ($defense.width() / ($defense.next().length ? $defense.width() + $defense.next().width() : $defense.parent().width()) * 100);
					if ($defense.parent().width() < $defense.parent().parent().width()){
						monster.strength = 100 * $defense.parent().width() / $defense.parent().parent().width();
					} else {
						monster.strength = 100;
					}
					monster.defense = monster.defense * (monster.strength || 100) / 100;
					break;
				}
			}
		}
		monster.timer = $('#app46755028429_monsterTicker').text().parseTimer();
		monster.finish = now + (monster.timer * 1000);
		monster.damage.siege = 0;
		monster.damage.others = 0;
		if (!dead &&$('input[name*="help with"]').length && $('input[name*="help with"]').attr('title')) {
			//log(LOG_WARN, 'Current Siege Phase is: '+ this.data[mid].phase);
			monster.phase = $('input[name*="help with"]').attr('title').regex(/ (.*)/i);
			//log(LOG_WARN, 'Assisted on '+monster.phase+'.');
		}
		$('img[src*="siege_small"]').each(function(i,el){
			var /*siege = $(el).parent().next().next().next().children().eq(0).text(),*/ dmg = $(el).parent().next().next().next().children().eq(1).text().replace(/\D/g,'').regex(/(\d+)/);
			//log(LOG_WARN, 'Monster Siege',siege + ' did ' + dmg.addCommas() + ' amount of damage.');
			monster.damage.siege += dmg / (types[type_label].orcs ? 1000 : 1);
		});
		$('td.dragonContainer table table a[href^="http://apps.facebook.com/castle_age/keep.php?casuser="]').each(function(i,el){
			var user = $(el).attr('href').regex(/user=(\d+)/i), tmp, dmg, fort;
			if (types[type_label].raid){
				tmp = $(el).parent().next().text().replace(/[^0-9\/]/g,'');
			} else {
				tmp = $(el).parent().parent().next().text().replace(/[^0-9\/]/g,'');
			}
			dmg = tmp.regex(/(\d+)/);
			fort = tmp.regex(/\/(\d+)/);
			if (user === userID){
				Monster.set(['data',mid,'damage','user','manual'], dmg - (monster.damage.user.script || 0));
				monster.defend.manual = fort - (monster.defend.script || 0);
				monster.stamina.manual = Math.round(monster.damage.user.manual / Monster.runtime.monsters[type_label].avg_damage_per_stamina);
			} else {
				monster.damage.others += dmg;
			}
		});
		// If we're doing our first attack then add them without having to visit list
		if (monster.state === 'assist' && sum(monster.damage && monster.damage.user)) {
			monster.state = 'engage';
		}
		if (!type.raid && $(type.attack_button).length && sum(monster.damage && monster.damage.user)) {
			monster.state = monster.state || 'engage';
		}
		monster.dps = sum(monster.damage) / (timer - monster.timer);
		if (types[type_label].raid) {
			monster.total = sum(monster.damage) + $('div[style*="monster_health_back.jpg"] div:nth-child(2)').text().regex(/(\d+)/);
		} else {
			monster.total = Math.ceil(100 * sum(monster.damage) / (monster.health === 100 ? 0.1 : (100 - monster.health)));
		}
		monster.eta = now + (Math.floor((monster.total - sum(monster.damage)) / monster.dps) * 1000);
		this._taint[data] = true;
//		this.runtime.used.stamina = 0;
//		this.runtime.used.energy = 0;
	} else if (Page.page === 'monster_dead') {
		if (Queue.runtime.current === 'Monster' && this.runtime.mid) { // Only if we went here ourselves...
			log(LOG_WARN, 'Deleting ' + data[this.runtime.mid].name + "'s " + data[this.runtime.mid].type);
			this.set(['data',this.runtime.mid]);
		} else {
			log(LOG_WARN, 'Unknown monster (timed out)');
		}
		this.set(['runtime','check'], false);
// Still need to do battle_raid
	} else if (Page.page === 'festival_monster_list') { // Check monster / raid list
		for (mid in data) {
			if (data[mid].page === 'festival'
					&& (data[mid].state !== 'assist' || data[mid].finish < now)) {
				data[mid].state = null;
			}
		}
		list = $('div[style*="festival_monster_list_middle.jpg"]')
		for (i=0; i<list.length; i++) {
			el = list[i];
			$children = $(el).children('div');
			try {
				this._transaction(); // BEGIN TRANSACTION
				assert(uid = $children.eq(3).find('a').attr('href').regex(/casuser=(\d+)/i), 'Unknown UserID');
				tmp = $children.eq(1).find('div').eq(0).attr('style').regex(/graphics\/([^.]*\....)/i);
				assert(type = findInObject(types, tmp, 'list'), 'Unknown monster type: '+tmp+ ' for ' + uid);
				assert(name = $children.eq(2).children().eq(0).text().replace(/'s$/i, ''), 'Unknown User Name');
//				log(LOG_WARN, 'Adding monster - uid: '+uid+', name: '+name+', image: "'+type+'"');
				mid = uid + '_f';
				this.set(['data',mid,'type'], type);
				this.set(['data',mid,'name'], name);
				this.set(['data',mid,'page'], 'festival');
				switch($children.eq(3).find('img').attr('src').filepart().regex(/(\w+)\.(gif|jpg)/)[0]) {
				case 'festival_monster_engagebtn':
					this.set(['data',mid,'state'], 'engage');
					break;
				case 'festival_monster_collectbtn':
					this.set(['data',mid,'state'], 'reward');
					break;
				case 'festival_monster_viewbtn':
					this.set(['data',mid,'state'], 'complete');
					break;
				default:
					this.set(['data',mid,'state'], 'unknown');
					break; // Should probably delete, but keep it on the list...
				}
				this._transaction(true); // COMMIT TRANSACTION
			} catch(e) {
				this._transaction(false); // ROLLBACK TRANSACTION on any error
				log(LOG_ERROR, e.name + ' in ' + this.name + '.parse(' + change + '): ' + e.message);
			}
		}
	} else if (Page.page === 'monster_monster_list') { // Check monster / raid list
		for (mid in data) {
			if (!types[data[mid].type].raid && data[mid].page !== 'festival'
					&& (data[mid].state !== 'assist' || data[mid].finish < now)) {
				data[mid].state = null;
			}
		}
		list = $('div[style*="monsterlist_container.gif"]')
		for (i=0; i<list.length; i++) {
			el = list[i];
			$children = $(el).children('div');
			try {
				this._transaction(); // BEGIN TRANSACTION
				assert(uid = $children.eq(2).find('input[name="casuser"]').attr('value'), 'Unknown UserID');
				tmp = $children.eq(0).find('img').eq(0).attr('src').regex(/graphics\/([^.]*\....)/i);
				assert(type = findInObject(types, tmp, 'list'), 'Unknown monster type: '+tmp);
				assert(name = $children.eq(1).children().eq(0).text().replace(/'s$/i, ''), 'Unknown User Name');
//				log(LOG_WARN, 'Adding monster - uid: '+uid+', name: '+name+', image: "'+type+'"');
				mid = uid + '_' + (types[type].mpool || 4);
				this.set(['data',mid,'type'], type);
				this.set(['data',mid,'name'], name);
				switch($children.eq(2).find('input[type="image"]').attr('src').regex(/(\w+)\.(gif|jpg)/)[0]) {
				case 'monsterlist_button_engage':
					this.set(['data',mid,'state'], 'engage');
					break;
				case 'monster_button_collect':
					// Can't tell if complete or reward, so set to complete, and will find reward when next visited
					this.set(['data',mid,'state'], 'complete');
					break;
				default:
					this.set(['data',mid,'state'], 'unknown');
					break; // Should probably delete, but keep it on the list...
				}
				this._transaction(true); // COMMIT TRANSACTION
			} catch(e) {
				this._transaction(false); // ROLLBACK TRANSACTION on any error
				log(LOG_ERROR, e.name + ' in ' + this.name + '.parse(' + change + '): ' + e.message);
			}
		}
	} else if (Page.page === 'monster_remove_list') { // Check monster / raid list
		for (mid in data) {
			if (!types[data[mid].type].raid && data[mid].page !== 'festival'
					&& (data[mid].state !== 'assist' || data[mid].finish < now)) {
				data[mid].state = null;
			}
		}
		$('#app'+APPID+'_app_body div.imgButton').each(function(a,el) {
			var link = $('a', el).attr('href'), mid;
			if (link && link.regex(/casuser=([0-9]+)/i)) {
				mid = link.regex(/casuser=([0-9]+)/i)+'_'+link.regex(/mpool=([0-9])/i);
				log(LOG_WARN, 'MID '+ mid);
				switch($('img', el).attr('src').regex(/dragon_list_btn_([0-9])/)) {
				case 2:
					Monster.set(['data',mid,'state'], 'reward');
					break;
				case 3:
					Monster.set(['data',mid,'state'], 'engage');
					break;
				case 4:
					Monster.set(['data',mid,'state'], 'complete');
					Monster.set(['data',mid,'remove'], true);
					break;
				default:
					Monster.set(['data',mid,'state'], 'unknown');
					break; // Should probably delete, but keep it on the list...
				}
			}
		});
	}
	return false;
};

Monster.resource = function() {
	if (Monster.runtime.banthus.length && Generals.get(['data','Banthus Archfiend','charge'],1e99) < Date.now()) {
		Monster.set(['runtime','banthusNow'], true);
		LevelUp.set(['runtime','basehit'], Monster.runtime.banthus.lower(LevelUp.get(['runtime','stamina'], 0)));
		LevelUp.set(['runtime','general'], 'Banthus Archfiend');
		return 'stamina';
	}
	Monster.set(['runtime','banthusNow'], false);
	return false;
};

Monster.update = function(event) {
	if (event.type === 'runtime' && event.worker.name !== 'LevelUp') {
		return;
	}
	var i, j, mid, uid, type, stat_req, req_stamina, req_health, req_energy, messages = [], fullname = {}, list = {}, listSortFunc, matched_mids = [], min, max, limit, filter, ensta = ['energy','stamina'], defatt = ['defend','attack'], button_count, monster, damage, target, now = Date.now(), waiting_ok;
	this.runtime.mode = this.runtime.stat = this.runtime.check = this.runtime.message = this.runtime.mid = null;
	this.runtime.big = this.runtime.values.attack = this.runtime.values.defend = [];
	limit = this.runtime.limit;
	if(!LevelUp.runtime.running && limit === 100){
		limit = 0;
	}
	list.defend = [];
	list.attack = [];
	// Flush stateless monsters
	for (mid in this.data) {
		if (!this.data[mid].state) {
			log(LOG_LOG, 'Deleted monster MID ' + mid + ' because state is ' + this.data[mid].state);
			delete this.data[mid];
		}
	}
	// Check for unviewed monsters
	for (mid in this.data) {
		if (!this.data[mid].last && !this.data[mid].ignore && this.data[mid].state === 'engage') {
			this.page(mid, 'Checking new monster ', 'casuser','');
			this.runtime.defending = true;
			this.data[mid].last = now; // Force it to only check once
			return;
		}
	}
	// Some generals use more stamina, but only in certain circumstances...
	defatt.forEach( function(mode) {
		Monster.runtime.multiplier[mode] = (Generals.get([LevelUp.runtime.general || (Generals.best(Monster.option['best_' + mode] ? ('monster_' + mode) : Monster.option['general_' + mode])), 'skills'], '').regex(/Increase Power Attacks by (\d+)/i) || 1);
		//log(LOG_WARN, 'mult ' + mode + ' X ' + Monster.runtime.multiplier[mode]);
	});
	waiting_ok = !this.option.hide && !LevelUp.runtime.force.stamina;
	if (this.option.stop === 'Priority List') {
		var condition, searchterm, attack_found = false, defend_found = false, attack_overach = false, defend_overach = false, o, suborder, p, defense_kind, button, order = [];
		this.runtime.banthus = [];
		if (this.option.priority) {
			order = this.option.priority.toLowerCase().replace(/ *[\n,]+ */g,',').replace(/[, ]*\|[, ]*/g,'|').split(',');
		}
		order.push('your ','\'s'); // Catch all at end in case no other match
		for (o=0; o<order.length; o++) {
			order[o] = order[o].trim();
			if (!order[o]) {
				continue;
			}
			if (order[o] === 'levelup') {
				if ((LevelUp.runtime.force.stamina && !list.attack.length) 
						|| (LevelUp.runtime.force.energy && !list.defend.length)) {
					matched_mids = [];
					continue;
				} else {
					break;
				}
			}
			suborder = order[o].split('|');
			for (p=0; p<suborder.length; p++) {
				suborder[p] = suborder[p].trim();
				if (!suborder[p]) {
					continue;
				}
				searchterm = suborder[p].match(new RegExp("^[^:]+")).toString().trim();
				condition = suborder[p].replace(new RegExp("^[^:]+"), '').toString().trim();
				//log(LOG_WARN, 'Priority order ' + searchterm +' condition ' + condition + ' o ' + o + ' p ' + p);
				for (mid in this.data) {
					monster = this.data[mid];
					type = this.types[monster.type];
					//If this monster does not match, skip to next one
					// Or if this monster is dead, skip to next one
					if (	matched_mids.indexOf(mid)>=0
							||((monster.name === 'You' ? 'Your' : monster.name + '\'s')
								+ ' ' + type.name).toLowerCase().indexOf(searchterm) < 0
							|| monster.ignore) {
						continue;
					}
					matched_mids.push(mid);
					monster.ac = /:ac\b/.test(condition);
					if (monster.state !== 'engage') {
						continue;
					}
					//Monster is a match so we set the conditions
					monster.max = this.conditions('max',condition);
					monster.ach = this.conditions('ach',condition) || type.achievement;
					// check for min/max stamina/energy overrides
					if ((i = this.conditions('smin',condition)) && isNumber(i) && !isNaN(i)) {
						monster.smin = i;
					} else if (monster.smin) {
						delete monster.smin;
					}
					if ((i = this.conditions('smax',condition)) && isNumber(i) && !isNaN(i)) {
						monster.smax = i;
					} else if (monster.smax) {
						delete monster.smax;
					}
					if ((i = this.conditions('emin',condition)) && isNumber(i) && !isNaN(i)) {
						monster.emin = i;
					} else if (monster.emin) {
						delete monster.emin;
					}
					if ((i = this.conditions('emax',condition)) && isNumber(i) && !isNaN(i)) {
						monster.emax = i;
					} else if (monster.emax) {
						delete monster.emax;
					}

					// check for pa ach/max overrides
					if ((i = this.conditions('achpa',condition)) && isNumber(i) && !isNaN(i)) {
						monster.achpa = i;
						if (isNumber(j = this.runtime.monsters[monster.type].avg_damage_per_stamina) && !isNaN(j)) {
							monster.ach = Math.ceil(i * 5 * j);
						}
					} else if (monster.achpa) {
						delete monster.achpa;
					}
					if ((i = this.conditions('maxpa',condition)) && isNumber(i) && !isNaN(i)) {
						monster.maxpa = i;
						if (isNumber(j = this.runtime.monsters[monster.type].avg_damage_per_stamina) && !isNaN(j)) {
							monster.max = Math.ceil(i * 5 * j);
						}
					} else if (monster.maxpa) {
						delete monster.maxpa;
					}

					monster.attack_min = this.conditions('a%',condition) || this.option.min_to_attack;
					if (isNumber(monster.ach) && !isNaN(monster.ach) && (!isNumber(monster.max) || isNaN(monster.max))) {
						monster.max = monster.ach;
					}
					if (isNumber(monster.max) && !isNaN(monster.max) && (!isNumber(monster.ach) || isNaN(monster.ach))) {
						monster.ach = monster.max;
					}
					if (isNumber(monster.max) && !isNaN(monster.max)) {
						monster.ach=Math.min(monster.ach, monster.max);
					}
					if (type.defend) {
						monster.defend_max = Math.min(this.conditions('f%',condition) || this.option.defend, (monster.strength || 100) - 1);
					}
					damage = 0;
					if (monster.damage && monster.damage.user) {
						damage += sum(monster.damage.user);
					}
					if (monster.defend) {
						damage += sum(monster.defend);
					}
					target = monster.max || monster.ach || 0;
					if(!type.raid){
						button_count = ((type.attack.length > 2) ? this.runtime.button.count : type.attack.length);
					}
					req_stamina = type.raid ? (this.option.raid.search('x5') === -1 ? 1	: 5)
							: Math.min(type.attack[Math.min(button_count, monster.smax || type.attack.length)-1], Math.max(type.attack[0], LevelUp.runtime.basehit || monster.smin || this.option.attack_min)) * this.runtime.multiplier.attack;
					req_health = type.raid ? (this.option.risk ? 13 : 10) : 10;
// Don't want to die when attacking a raid
					//log(LOG_WARN, 'monster name ' + type.name + ' basehit ' + LevelUp.runtime.basehit +' min ' + type.attack[Math.min(button_count, monster.smax || type.attack.length)-1]);
					if ((monster.defense || 100) >= monster.attack_min) {
// Set up this.values.attack for use in levelup calcs
						if (type.raid) {
							this.runtime.values.attack = this.runtime.values.attack.concat((this.option.raid.search('x5') < 0) ? 1 : 5).unique();
// If it's a defense monster, never hit for 1 damage.  Otherwise, 1 damage is ok.
						} else {
							if (damage < this.conditions('ban',condition)) {
								this.runtime.banthus = this.runtime.banthus.concat(type.attack).unique();
							}
							if (type.defend && type.attack.indexOf(1) > -1) {
								this.runtime.values.attack = this.runtime.values.attack.concat(type.attack.slice(1,this.runtime.button.count)).unique();
							} else {
								this.runtime.values.attack = this.runtime.values.attack.concat(type.attack.slice(0,this.runtime.button.count)).unique();
							}
						}
						if ((attack_found === false || attack_found === o)
								&& (waiting_ok || (Player.get('health', 0) >= req_health
								&& LevelUp.runtime.stamina >= req_stamina))
								&& (!this.runtime.banthusNow	
									|| damage < this.conditions('ban',condition))
								&& (!LevelUp.runtime.basehit
									|| type.attack.indexOf(LevelUp.runtime.basehit)>= 0)) {
							button = type.attack_button;
							if (this.option.use_tactics && type.tactics) {
								button = type.tactics_button;
							}
							if (damage < monster.ach
									|| (this.runtime.banthusNow	
										&& damage < this.conditions('ban',condition))
									|| (LevelUp.runtime.basehit
										&& type.attack.indexOf(LevelUp.runtime.basehit)>= 0)) {
								attack_found = o;
								if (attack_found && attack_overach) {
									list.attack = [[mid, damage / sum(monster.damage), button, damage, target]];
									attack_overach = false;
								} else {
									list.attack.push([mid, damage / sum(monster.damage), button, damage, target]);
								}
								//log(LOG_WARN, 'ATTACK monster ' + monster.name + ' ' + type.name);
							} else if ((monster.max === false || damage < monster.max)
									&& !attack_found 
									&& (attack_overach === false || attack_overach === o)) {
								list.attack.push([mid, damage / sum(monster.damage), button, damage, target]);
								attack_overach = o;
							}
						}
					}
					// Possible defend target?
					if (!monster.no_heal && type.defend && this.option.defend_active
							&& (/:big\b/.test(condition)
								|| ((monster.defense || 100) < monster.defend_max))) {
						this.runtime.big = this.runtime.big.concat(type.defend.slice(0,this.runtime.button.count)).unique();
					}
					if (this.option.defend_active && (defend_found === false || defend_found === o)) {
						defense_kind = false;
						if (typeof monster.secondary !== 'undefined' && monster.secondary < 100) {
							//log(LOG_WARN, 'Secondary target found (' + monster.secondary + '%)');
							defense_kind = Monster.secondary_on;
						} else if (monster.warrior && (monster.strength || 100) < 100 && monster.defense < monster.strength - 1) {
							defense_kind = Monster.warrior;
						} else if (!monster.no_heal 
								&& ((/:big\b/.test(condition) && LevelUp.runtime.big)
									|| (monster.defense || 100) < monster.defend_max)) {
							defense_kind = type.defend_button;
						}
						if (defense_kind) {
							this.runtime.values.defend = this.runtime.values.defend.concat(type.defend.slice(0,this.runtime.button.count)).unique();
							//log(LOG_WARN, 'defend ok' + damage + ' ' + LevelUp.runtime.basehit+ ' ' + type.defend.indexOf(LevelUp.runtime.basehit));
							if (!LevelUp.runtime.basehit 
									|| type.defend.indexOf(LevelUp.runtime.basehit)>= 0) {
								if (damage < monster.ach
										|| (/:sec\b/.test(condition)
											&& defense_kind === Monster.secondary_on)) {
									//log(LOG_WARN, 'DEFEND monster ' + monster.name + ' ' + type.name);
									defend_found = o;
								} else if ((monster.max === false || damage < monster.max)
										&& !defend_found && (defend_overach === false  || defend_overach === o)) {
									defend_overach = o;
								} else {
									continue;
								}
								if (defend_found && defend_overach) {
									list.defend = [[mid, damage / sum(monster.damage), defense_kind, damage, target]];
									defend_overach = false;
								} else {
									list.defend.push([mid, damage / sum(monster.damage), defense_kind, damage, target]);
								}
							}
						}
					}
				}
			}
		}
		matched_mids = [];
	} else {
		// Make lists of the possible attack and defend targets
		for (mid in this.data) {
			monster = this.data[mid];
			type = this.types[monster.type];
                        if(!type.raid){
                                button_count = ((type.attack.length > 2) ? this.runtime.button.count : type.attack.length);
                        }
			req_stamina = type.raid ? (this.option.raid.search('x5') === -1 ? 1	: 5)
					: Math.min(type.attack[Math.min(button_count,type.attack.length)-1], Math.max(type.attack[0], LevelUp.runtime.basehit || monster.smin || this.option.attack_min)) * this.runtime.multiplier.attack;
			req_health = type.raid ? (this.option.risk ? 13 : 10) : 10; // Don't want to die when attacking a raid
			monster.ach = (this.option.stop === 'Achievement') ? type.achievement : (this.option.stop === '2X Achievement') ? type.achievement : (this.option.stop === 'Continuous') ? type.achievement :0;
			monster.max = (this.option.stop === 'Achievement') ? type.achievement : (this.option.stop === '2X Achievement') ? type.achievement*2 : (this.option.stop === 'Continuous') ? type.achievement*this.runtime.limit :0;
			if (	!monster.ignore
					&& monster.state === 'engage'
					&& monster.finish > Date.now()	) {
				uid = mid.replace(/_.+/,'');
				/*jslint eqeqeq:false*/
				if (uid == userID && this.option.own) {
				/*jslint eqeqeq:true*/
					// add own monster
				} else if (this.option.avoid_lost_cause
						&& (monster.eta - monster.finish)/3600000
							> this.option.lost_cause_hours && (!LevelUp.option.override || !LevelUp.runtime.running) && !monster.override) {
					continue;  // Avoid lost cause monster
				} else if (this.option.rescue
						&& (monster.eta
							>= monster.finish - this.option.check_interval)) {
					// Add monster to rescue
				} else if (this.option.stop === 'Achievement'
						&& sum(monster.damage && monster.damage.user) + sum(monster.defend)
							> (type.achievement || 0)) {
					continue; // Don't add monster over achievement
				} else if (this.option.stop === '2X Achievement'
						&& sum(monster.damage && monster.damage.user) + sum(monster.defend)
							> type.achievement * 2) {
					continue; // Don't add monster over 2X  achievement
				} else if (this.option.stop === 'Continuous'
						&& sum(monster.damage && monster.damage.user) + sum(monster.defend)
							> type.achievement * limit) {
					continue; // Don't add monster over 2X  achievement
				}
				damage = 0;
				if (monster.damage && monster.damage.user) {
					damage += sum(monster.damage.user);
				}
				if (monster.defend) {
					damage += sum(monster.defend);
				}
				/*jslint eqeqeq:false*/
				if ((uid == userID && this.option.own) || this.option.stop === 'Never') {
				/*jslint eqeqeq:true*/
					target = 1e99;
				} else if (this.option.stop === 'Achievement') {
					target = type.achievement || 0;
				} else if (this.option.stop === '2X Achievement') {
					target = (type.achievement || 0) * 2;
				} else if (this.option.stop === 'Continuous') {
					target = (type.achievement || 0) * limit;
				} else {
					target = 0;
				}
				// Possible attack target?
				if ((waiting_ok || (Player.get('health', 0) >= req_health && LevelUp.runtime.stamina >= req_stamina))
				 && (isNumber(monster.defense) ? monster.defense : 100) >= Math.max(this.option.min_to_attack,0.1)) {
// Set up this.values.attack for use in levelup calcs
					if (type.raid) {
						this.runtime.values.attack = this.runtime.values.attack.concat((this.option.raid.search('x5') < 0) ? 1 : 5).unique();
// If it's a defense monster, never hit for 1 damage.  Otherwise, 1 damage is ok.
					} else if (type.defend && type.attack.indexOf(1) > -1) {
						this.runtime.values.attack = this.runtime.values.attack.concat(type.attack.slice(1,this.runtime.button.count)).unique();
					} else {
						this.runtime.values.attack = this.runtime.values.attack.concat(type.attack.slice(0,this.runtime.button.count)).unique();
					}
					if (this.option.use_tactics && type.tactics) {
						list.attack.push([mid, (sum(monster.damage && monster.damage.user) + sum(monster.defend)) / sum(monster.damage), type.tactics_button, damage, target]);
					} else {
						list.attack.push([mid, (sum(monster.damage && monster.damage.user) + sum(monster.defend)) / sum(monster.damage), type.attack_button, damage, target]);
					}
				}
				// Possible defend target?
				if (this.option.defend_active) {
					if(type.defend) {
						this.runtime.values.defend = this.runtime.values.defend.concat(type.defend.slice(0,this.runtime.button.count)).unique();
					}
					if ((monster.secondary || 100) < 100) {
						list.defend.push([mid, (sum(monster.damage && monster.damage.user) + sum(monster.defend)) / sum(monster.damage), Monster.secondary_on, damage, target]);
					} else if (monster.warrior && (monster.strength || 100) < 100){
						list.defend.push([mid, (sum(monster.damage && monster.damage.user) + sum(monster.defend)) / sum(monster.damage), Monster.warrior, damage, target]);
					} else if ((monster.defense || 100) < Math.min(this.option.defend, (monster.strength -1 || 100))
                                                && !monster.no_heal) {
						list.defend.push([mid, (sum(monster.damage && monster.damage.user) + sum(monster.defend)) / sum(monster.damage), type.defend_button, damage, target]);
					}
				}
			}
		}
	}
	this.runtime.defending = list.defend && list.defend.length > 0;
	// If using the priority list and levelup settings, the script may oscillate between having something to defend when in level up, and then forgetting it when it goes to attack something because it doesn't pass levelup in the priority list and tries to quest, and then finds it again.  The following preserves the runtime.defending value even when in force.stamina mode
	if (LevelUp.runtime.force.stamina) {
		this.runtime.defending = this.runtime.levelupdefending;
	} else {
		this.runtime.levelupdefending = this.runtime.defending;
	}
	
	listSortFunc = function(a,b){
		var monster_a = Monster.data[a[0]], monster_b = Monster.data[b[0]], late_a, late_b, time_a, time_b, goal_a, goal_b;
		switch(Monster.option.choice) {
		case 'Any':
			return (Math.random()-0.5);
		case 'Strongest':
			return monster_b.health - monster_a.health;
		case 'Weakest':
			return monster_a.health - monster_b.health;
		case 'Shortest ETD':
			return monster_a.eta - monster_b.eta;
		case 'Longest ETD':
			return monster_b.eta - monster_a.eta;
		case 'Spread':
			return sum(monster_a.stamina) - sum(monster_b.stamina);
		case 'Max Damage':
			return b[1] - a[1];
		case 'Min Damage':
			return a[1] - b[1];
		case 'ETD Maintain':
			late_a = monster_a.eta - monster_a.finish;
			late_b = monster_b.eta - monster_b.finish;
			// this is what used to happen before r655
			//return late_a < late_b ? 1 : (late_a > late_b ? -1 : 0);
			// this should capture the same intent,
			// but continue provide sorting after monsters are caught up
			return late_b - late_a;
		case 'Goal Maintain':
			time_a = Math.max(1, now - Math.min(monster_a.eta || monster_a.finish, monster_a.finish));
			time_b = Math.max(1, now - Math.min(monster_b.eta || monster_b.finish, monster_b.finish));
			// aim a little before the end so we aren't caught short
			time_a = Math.max((time_a + now) / 2, time_a - 14400000); // 4 hours

			time_b = Math.max((time_b + now) / 2, time_b - 14400000);
			goal_a = Math.max(1, a[4] - a[3]);
			goal_b = Math.max(1, b[4] - b[3]);
			return (goal_b / time_b) - (goal_a / time_a);
		}
	};
	for (i in list) {
		// Find best target
		//log(LOG_WARN, 'list ' + i + ' is ' + length(list[i]));
		if (list[i].length) {
			if (list[i].length > 1) {
				list[i].sort(listSortFunc);
			}
			this.runtime[i] = mid = list[i][0][0];
			this.runtime.button[i].query = list[i][0][2];
			uid = mid.replace(/_.+/,'');
			type = this.types[this.data[mid].type];
			fullname[i] = (uid === userID ? 'your ': (this.data[mid].name + '\'s ')) + type.name;
		} else {
			this.runtime[i] = false;
		}
	}
	// Make the * dash messages for current attack and defend targets
	for (i in ensta) {
		if (this.runtime[defatt[i]]) {
			monster = this.data[this.runtime[defatt[i]]];
			type = this.types[monster.type];
			// Calculate what button for att/def and how much energy/stamina cost
			if (ensta[i] === 'stamina' && type.raid) {
				this.runtime[ensta[i]] = this.option.raid.search('x5') < 0 ? 1 : 5;
			} else {
				button_count = ((type.attack.length > 2) ? this.runtime.button.count : type[defatt[i]].length);
				min = Math.min(type[defatt[i]][Math.min(button_count,type[defatt[i]].length)-1], Math.max(type[defatt[i]][0], LevelUp.runtime.basehit || this.option[defatt[i] + '_min']));
				max = Math.min(type[defatt[i]][Math.min(button_count,type[defatt[i]].length)-1], LevelUp.runtime.basehit || this.option[defatt[i] + '_max'], LevelUp.runtime[ensta[i]] / this.runtime.multiplier[defatt[i]]);
				damage = sum(monster.damage && monster.damage.user) + sum(monster.defend);
				limit = (LevelUp.runtime.big ? max : damage < (monster.ach || damage)
						? monster.ach : damage < (monster.max || damage)
						? monster.max : max);
				max = Math.min(max,(limit - damage)/(this.runtime.monsters[monster.type]['avg_damage_per_'+ensta[i]] || 1)/this.runtime.multiplier[defatt[i]]);
				//log(LOG_WARN, 'monster damage ' + damage + ' average damage ' + (this.runtime.monsters[monster.type]['avg_damage_per_'+ensta[i]] || 1).round(0) + ' limit ' + limit + ' max ' + ensta[i] + ' ' + max.round(1));
				filter = function(e) { return (e >= min && e <= max); };
				this.runtime.button[defatt[i]].pick = bestObjValue(type[defatt[i]], function(e) { return e; }, filter) || type[defatt[i]].indexOf(min);
				//log(LOG_WARN, ' ad ' + defatt[i] + ' min ' + min + ' max ' + max+ ' pick ' + this.runtime.button[defatt[i]].pick);
				//log(LOG_WARN, 'min detail '+ defatt[i] + ' # buttons   ' + Math.min(this.runtime.button.count,type[defatt[i]].length) +' button val ' +type[defatt[i]][Math.min(this.runtime.button.count,type[defatt[i]].length)-1] + ' max of type[0] ' + type[defatt[i]][0] + ' queue or option ' + (LevelUp.runtime.basehit || this.option[defatt[i] + '_min']));
				//log(LOG_WARN, 'max detail '+ defatt[i] + ' physical max ' + type[defatt[i]][Math.min(this.runtime.button.count,type[defatt[i]].length)-1] + ' basehit||option ' + (LevelUp.runtime.basehit || this.option[defatt[i]]) + ' stamina avail ' + (LevelUp.runtime[ensta[i]] / this.runtime.multiplier[defatt[i]]));
				this.runtime[ensta[i]] = type[defatt[i]][this.runtime.button[defatt[i]].pick] * this.runtime.multiplier[defatt[i]];
			}
			this.runtime.health = type.raid ? 13 : 10; // Don't want to die when attacking a raid
			req_health = (defatt[i] === 'attack' ? Math.max(0, this.runtime.health - Player.get('health', 0)) : 0);
			stat_req = Math.max(0, (this.runtime[ensta[i]] || 0) - LevelUp.runtime[ensta[i]]);
			if (stat_req || req_health) {
				messages.push('Waiting for ' + (stat_req ? makeImage(ensta[i]) + stat_req : '')
				+ (stat_req && req_health ? ' &amp; ' : '') + (req_health ? makeImage('health') + req_health : '')
				+ ' to ' + defatt[i] + ' ' + fullname[defatt[i]]
				+ ' (' + makeImage(ensta[i]) + (this.runtime[ensta[i]] || 0) + '+' + (stat_req && req_health ? ', ' : '') + (req_health ? makeImage('health') + req_health : '') + ')');
			} else {
				messages.push(defatt[i] + ' ' + fullname[defatt[i]] + ' (' + makeImage(ensta[i])
						+ (this.runtime[ensta[i]] || 0) + '+)');
				this.runtime.mode = this.runtime.mode || defatt[i];
				this.runtime.stat = this.runtime.stat || ensta[i];
			}
		}
	}
	if (this.runtime.mode === 'attack' && Battle.runtime.points && this.option.points && Battle.runtime.attacking) {
		this.runtime.mode = this.runtime.stat = null;
	}
	// Nothing to attack, so look for monsters we haven't reviewed for a while.
	//log(LOG_WARN, 'attack ' + this.runtime.attack + ' stat_req ' + stat_req + ' health ' + req_health);
	if ((!this.runtime.defend || LevelUp.runtime.energy < this.runtime.energy)
			&& (!this.runtime.attack || stat_req || req_health)) { // stat_req is last calculated in loop above, so ok
		for (mid in this.data) {
			monster = this.data[mid];
			if (!monster.ignore) {
				uid = mid.replace(/_.+/,'');
				type = this.types[monster.type];
				if (monster.state === 'reward' && monster.ac) {
					this.page(mid, 'Collecting Reward from ', 'casuser','&action=collectReward');
				} else if (monster.remove && this.option.remove && parseFloat(uid) !== userID
						&& monster.page !== 'festival') {
					//log(LOG_WARN, 'remove ' + mid + ' userid ' + userID + ' uid ' + uid + ' now ' + (uid === userID) + ' new ' + (parseFloat(uid) === userID));
					this.page(mid, 'Removing ', 'remove_list','');
				} else if (monster.last < Date.now() - this.option.check_interval * (monster.remove ? 5 : 1)) {
					this.page(mid, 'Reviewing ', 'casuser','');
				}
				if (this.runtime.message) {
					return;
				}
			}
		}
	}
	Dashboard.status(this, messages.length ? messages.join('<br>') : 'Nothing to do.');
	if(!Queue.option.pause){
		if(LevelUp.runtime.running){
			this.runtime.limit = 100;
		} else if (!this.runtime.attack){
			this.runtime.limit = (limit > 30)? 1: (limit + 1|0);
		}
	} else {
		this.runtime.limit = 0;
	}
	this._notify('data');// Temporary fix for Dashboard updating
};

Monster.work = function(state) {
	var i, j, target_info = [], battle_list, list = [], mid, uid, type, btn = null, b, mode = this.runtime.mode, stat = this.runtime.stat, monster, title;
	if (!this.runtime.check && !mode) {
		return QUEUE_NO_ACTION;
	}
	if (!state) {
		return QUEUE_CONTINUE;
	}
	if (this.runtime.check) {
		log(LOG_WARN, this.runtime.message);
		Page.to(this.runtime.page, this.runtime.check);
		this.runtime.check = this.runtime.limit = this.runtime.message = this.runtime.dead = false;
		return QUEUE_RELEASE;
	}
	if (mode === 'defend' && LevelUp.get('runtime.quest')) {
		return QUEUE_NO_ACTION;
	}	
	uid = this.runtime[mode].replace(/_\w+/,'');
	monster = this.data[this.runtime[mode]];
	type = this.types[monster.type];
//	if (this.runtime[stat] > LevelUp.runtime[stat] || (LevelUp.runtime.basehit && this.runtime[stat] !== LevelUp.runtime.basehit * this.runtime.multiplier[mode])) {
//		log(LOG_WARN, 'Check for ' + stat + ' burn to catch up ' + this.runtime[stat] + ' burn ' + LevelUp.runtime[stat]);
//		this._remind(0, 'levelup');
//		return QUEUE_RELEASE;
//	}
	if (!Generals.to(Generals.runtime.zin || LevelUp.runtime.general || (this.option['best_'+mode] 
			? (type.raid
				? ((this.option.raid.search('Invade') === -1) ? 'raid-duel' : 'raid-invade')
				: 'monster_' + mode)
			: this.option['general_'+mode]))) {
		return QUEUE_CONTINUE;
	}
	if (type.raid) { // Raid has different buttons
		btn = $(Monster.raid_buttons[this.option.raid]);
	} else {
		//Primary method of finding button.
		log(LOG_WARN, 'Try to ' + mode + ' ' + monster.name + '\'s ' + type.name + ' for ' + this.runtime[stat] + ' ' + stat);
		if (!$(this.runtime.button[mode].query).length || this.runtime.button[mode].pick >= $(this.runtime.button[mode].query).length) {
			//log(LOG_WARN, 'Unable to find '  + mode + ' button for ' + monster.name + '\'s ' + type.name);
		} else {
			//log(LOG_WARN, ' query ' + $(this.runtime.button[mode].query).length + ' ' + this.runtime.button[mode].pick);
			btn = $(this.runtime.button[mode].query).eq(this.runtime.button[mode].pick);
			this.runtime.used[stat] = this.runtime[stat];
		}
		if (!btn || !btn.length){
			monster.button_fail = (monster.button_fail || 0) + 1;
			if (monster.button_fail > 10){
				log(LOG_LOG, 'Ignoring Monster ' + monster.name + '\'s ' + type.name + ': Unable to locate ' + (this.runtime.button[mode].pick || 'unknown') + ' ' + mode + ' button ' + monster.button_fail + ' times!');
				monster.ignore = true;
				monster.button_fail = 0;
			}
		}
	}
	if (!btn || !btn.length 
			|| (['keep_monster_active', 'monster_battle_monster', 'festival_battle_monster'].indexOf(Page.page)<0)
			|| ($('div[style*="dragon_title_owner"] img[linked]').attr('uid') !== uid
				&& $('div[style*="nm_top"] img[linked]').attr('uid') !== uid
				&& $('img[linked][size="square"]').attr('uid') !== uid)) {
		//log(LOG_WARN, 'Reloading page. Button = ' + btn.attr('name'));
		//log(LOG_WARN, 'Reloading page. Page.page = '+ Page.page);
		//log(LOG_WARN, 'Reloading page. Monster Owner UID is ' + $('div[style*="dragon_title_owner"] img[linked]').attr('uid') + ' Expecting UID : ' + uid);
		this.page(this.runtime[mode],'','casuser','');
		Page.to(this.runtime.page,this.runtime.check);
		this.runtime.check = null;
		return QUEUE_CONTINUE; // Reload if we can't find the button or we're on the wrong page
	}
	if (type.raid) {
		battle_list = Battle.get('user');
		if (this.option.force1) { // Grab a list of valid targets from the Battle Worker to substitute into the Raid buttons for +1 raid attacks.
			for (i in battle_list) {
				list.push(i);
			}
			$('input[name*="target_id"]').val((list[Math.floor(Math.random() * (list.length))] || 0)); // Changing the ID for the button we're gonna push.
		}
		target_info = $('div[id*="raid_atk_lst0"] div div').text().regex(/Lvl\s*(\d+).*Army: (\d+)/);
		if ((this.option.armyratio !== 'Any' && ((target_info[1]/Player.get('army')) > this.option.armyratio) && this.option.raid.indexOf('Invade') >= 0) || (this.option.levelratio !== 'Any' && ((target_info[0]/Player.get('level')) > this.option.levelratio) && this.option.raid.indexOf('Invade') === -1)){ // Check our target (first player in Raid list) against our criteria - always get this target even with +1
			log(LOG_LOG, 'No valid Raid target!');
			Page.to('battle_raid', ''); // Force a page reload to change the targets
			return QUEUE_CONTINUE;
		}
	}
	Page.click(btn);
	return QUEUE_RELEASE;
};

Monster.page = function(mid, message, prefix, suffix) {
	var uid, type, monster, mpool, mmid;
	monster = this.data[mid];
	this.runtime.mid = mid;
	uid = mid.replace(/_.+/,'');
	type = this.types[monster.type];
	if (message) {
		this.runtime.message = message + (monster.name ? (monster.name === 'You' ? 'your' : monster.name.html_escape() + '\'s') : '') + ' ' + type.name;
		Dashboard.status(this, this.runtime.message);
	}
	this.runtime.page = type.raid ? 'battle_raid' 
			: monster.page === 'festival' ? 'festival_battle_monster' 
			: 'monster_battle_monster';
	if (monster.page === 'festival') {
		mpool = type.festival_mpool || type.mpool;
		if (type.festival) {
			mmid = '&mid=' + type.festival;
			if (prefix.indexOf('remove_list') >= 0) {
				mmid += '&remove_monsterKey=' + type.festival;
			}
		}
	} else {
		mpool = type.mpool;
	}
	this.runtime.check = prefix + '=' + uid
			+ ((monster.phase && this.option.assist
				&& !LevelUp.runtime.levelup
				&& (monster.state === 'engage' || monster.state === 'assist'))
					? '&action=doObjective' : '')
			+ (mpool ? '&mpool=' + mpool : '')
			+ (mmid ? mmid : '')
			+ suffix;
};


Monster.order = null;
Monster.dashboard = function(sort, rev) {
	var i, j, o, type, monster, args, list = [], output = [], sorttype = [null, 'name', 'health', 'defense', null, 'timer', 'eta'], state = {
		engage:0,
		assist:1,
		reward:2,
		complete:3
	}, blank, image_url, color, mid, uid, title, v, vv, tt, cc;
	if (typeof sort === 'undefined') {
		this.order = [];
		for (mid in this.data) {
			this.order.push(mid);
		}
	}
	if (typeof sort === 'undefined') {
		sort = (this.runtime.sort || 1);
	}
	if (typeof rev === 'undefined'){
		rev = (this.runtime.rev || false);
	}
	this.runtime.sort = sort;
	this.runtime.rev = rev;
	this.order.sort(function(a,b) {
		var aa, bb, data = Monster.data;
		if (state[data[a].state] > state[data[b].state]) {
			return 1;
		}
		if (state[data[a].state] < state[data[b].state]) {
			return -1;
		}
		if (typeof sorttype[sort] === 'string') {
			aa = data[a][sorttype[sort]];
			bb = data[b][sorttype[sort]];
		} else if (sort === 4) { // damage
//			aa = data[a].damage ? data[a].damage[userID] : 0;
//			bb = data[b].damage ? data[b].damage[userID] : 0;
			if (data[a].damage && data[a].damage.user) {
				aa = sum(data[a].damage.user) / sum(data[a].damage);
			}
			if (data[b].damage && data[b].damage.user) {
				bb = sum(data[b].damage.user) / sum(data[b].damage);
			}
		}
		if (typeof aa === 'undefined') {
			return 1;
		} else if (typeof bb === 'undefined') {
			return -1;
		}
		if (typeof aa === 'string' || typeof bb === 'string') {
			return (rev ? (''+bb).localeCompare(aa) : (''+aa).localeCompare(bb));
		}
		return (rev ? (aa || 0) - (bb || 0) : (bb || 0) - (aa || 0));
	});
	if (this.option.stop === 'Continuous'){
		th(output, '<center>Continuous=' + this.runtime.limit + '</center>', 'title="Stop Multiplier"');
	} else {
		th(output, '');
	}
	th(output, 'User');
	th(output, 'Health', 'title="(estimated)"');
	th(output, 'Defense', 'title="Composite of Fortification or Dispel (0%...100%)."');
//	th(output, 'Shield');
	th(output, 'Activity');
	th(output, 'Time Left');
	th(output, 'Kill In (ETD)', 'title="(estimated)"');
//	th(output, '');
//	th(output, '');
	list.push('<table cellspacing="0" style="width:100%"><thead><tr>' + output.join('') + '</tr></thead><tbody>');
	for (o=0; o<this.order.length; o++) {
		mid = this.order[o];
		uid = mid.replace(/_.+/,'');
		monster = this.data[mid];
		festival = monster.page === 'festival';
		type = this.types[monster.type];
		if (!type) {
			continue;
		}
		output = [];
		blank = !((monster.state === 'engage' || monster.state === 'assist') && monster.total);
		// http://apps.facebook.com/castle_age/battle_monster.php?user=00000&mpool=3
		// http://apps.facebook.com/castle_age/battle_monster.php?twt2=earth_1&user=00000&action=doObjective&mpool=3&lka=00000&ref=nf
		// http://apps.facebook.com/castle_age/raid.php?user=00000
		// http://apps.facebook.com/castle_age/raid.php?twt2=deathrune_adv&user=00000&action=doObjective&lka=00000&ref=nf
		args = '?casuser=' + uid + (type.mpool ? '&mpool=' + (monster.page === 'festival' && type.festival_mpool? type.festival_mpool  : type.mpool) : '') + (monster.page === 'festival' ? ('&mid=' + type.festival) : '');
		if (this.option.assist_links && (monster.state === 'engage' || monster.state === 'assist') && type.siege !== false ) {
			args += '&action=doObjective';
		}
		// link icon
		tt = type.name;
		if (isNumber(v = monster.ach || type.achievement)) {
		    tt += ' | Achievement: ';
			if (isNumber(monster.achpa)) {
				tt += monster.achpa + ' PA' + plural(monster.achpa) + ' (~' + v.SI() + ')';
			} else {
				tt += v.addCommas();
			}
		}
		if (isNumber(v = monster.max)) {
		    tt += ' | Max: ';
			if (isNumber(monster.maxpa)) {
				tt += monster.maxpa + ' PA' + plural(monster.maxpa) + ' (~' + v.SI() + ')';
			} else {
				tt += v.addCommas();
			}
		}
		td(output, Page.makeLink(type.raid ? 'raid.php' : monster.page === 'festival' ? 'festival_battle_monster.php' : 'battle_monster.php', args, '<img src="' + imagepath + type.list + '" style="width:72px;height:20px; position: relative; left: -8px; opacity:.7;" alt="' + type.name + '"><strong class="overlay"' + (monster.page === 'festival' ? ' style="color:#ffff00;"' : '') + '>' + monster.state + '</strong>'), 'title="' + tt + '"');
		image_url = imagepath + type.list;
		//log(LOG_WARN, image_url);

		// user
		if (isString(monster.name)) {
			vv = monster.name.html_escape();
		} else {
			vv = '{id:' + uid + '}';
		}
		th(output, '<a class="golem-monster-ignore" name="'+mid+'" title="Toggle Active/Inactive"'+(monster.ignore ? ' style="text-decoration: line-through;"' : '')+'>' + vv + '</a>');

		// health
		td(output,
			blank
				? ''
				: monster.health === 100
					? '100%'
					: monster.health.round(1) + '%',
			blank
				? ''
				: 'title="' + (monster.total - sum(monster.damage)).addCommas() + '"');

		// defense
		vv = tt = cc = '';
		if (!blank && isNumber(monster.defense)) {
			vv = monster.defense.round(1) + '%';
			if (isNumber(monster.strength)) {
				tt = 'Max: ' + monster.strength.round(1) + '% | ';
			}
			tt += 'Attack Bonus: ' + (monster.defense - 50).round(1) + '%';
			if (this.option.defend_active && this.option.defend > monster.defense) {
				cc = 'green';
			} else if (this.option.min_to_attack >= monster.defense) {
				cc = 'blue';
			}
		}
		if (cc !== '') {
			vv = '<span style="color:' + cc + ';">' + vv + '</span>';
		}
		if (tt !== '') {
			tt = 'title="' + tt + '"';
		}
		td(output, vv, tt);

		var activity = sum(monster.damage && monster.damage.user) + sum(monster.defend);
		if (monster.ach > 0 || monster.max > 0) {
			if (monster.max > 0 && activity >= monster.max) {
				color = 'red';
			} else if (monster.ach > 0 && activity >= monster.ach) {
				color = 'orange';
			} else {
				color = 'green';
			}
		} else {
			color = 'black';
		}

		// activity
		td(output,
			(blank || monster.state !== 'engage' || (typeof monster.damage === undefined || typeof monster.damage.user === 'undefined'))
				? ''
				: '<span style="color: ' + color + ';">' + activity.addCommas() + '</span>',
			blank
				? ''
				: 'title="' + ( sum(monster.damage && monster.damage.user) / monster.total * 100).round(2) + '% from ' + (sum(monster.stamina)/5 || 'an unknown number of') + ' PAs"');

		// time left
		td(output,
			blank
				? ''
				: monster.timer
					? Page.addTimer('monster_'+mid+'_finish', monster.finish)
					: '?');

		// etd
		td(output,
			blank
				? ''
				: Page.addTimer('monster_'+mid+'_eta', monster.health === 100 ? monster.finish : monster.eta));
		th(output, '<a class="golem-monster-delete" name="'+mid+'" title="Delete this Monster from the dashboard">[x]</a>');
		th(output, '<a class="golem-monster-override" name="'+mid+'" title="Override Lost Cause setting for this monster">'+(monster.override ? '[O]' : '[]')+'</a>');
                tr(list, output.join(''));
	}
	list.push('</tbody></table>');
	$('#golem-dashboard-Monster').html(list.join(''));
	$('a.golem-monster-delete').live('click', function(event){
		Monster.set(['data',$(this).attr('name')]);
		return false;
	});
	$('a.golem-monster-ignore').live('click', function(event){
		var x = $(this).attr('name');
		Monster.set(['data',x,'ignore'], !Monster.get(['data',x,'ignore'], false));
		return false;
	});
	$('a.golem-monster-override').live('click', function(event){
		var x = $(this).attr('name');
		Monster.set(['data',x,'override'], !Monster.get(['data',x,'override'], false));
		return false;
	});
	if (typeof sort !== 'undefined') {
		$('#golem-dashboard-Monster thead th:eq('+sort+')').attr('name',(rev ? 'reverse' : 'sort')).append('&nbsp;' + (rev ? '&uarr;' : '&darr;'));
	}
};

Monster.conditions = function (type, conditions) {
	if (!conditions || conditions.toLowerCase().indexOf(':' + type) < 0) {
		return false;
	}
	var value = conditions.substring(conditions.indexOf(':' + type) + type.length + 1).replace(new RegExp(":.+"), ''), first, second;
	if (/k$/i.test(value) || /m$/i.test(value)) {
		first = /\d+k/i.test(value);
		second = /\d+m/i.test(value);
		value = parseFloat(value, 10) * 1000 * (first + second * 1000);
	}
	return parseInt(value, 10);
};
/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page, Queue, Resources,
	Battle, Generals, LevelUp, Player,
	APP, APPID, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, Divisor, length, sum, findInObject, objectIndex, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
	makeImage
*/
/********** Worker.News **********
* Aggregate the news feed
*/
var News = new Worker('News');
News.data = News.temp = null;

News.settings = {
	taint:true
};

News.defaults['castle_age'] = {
	pages:'index'
};

News.runtime = {
	last:0
};

News.parse = function(change) {
	if (change) {
		var xp = 0, bp = 0, wp = 0, win = 0, lose = 0, deaths = 0, cash = 0, i, j, list = [], user = {}, sort = [], last_time = this.get(['runtime','last'], 0), killed = false;
		this.set(['runtime','last'], Date.now());
		$('#app46755028429_battleUpdateBox .alertsContainer .alert_content').each(function(i,el) {
			var uid, txt = $(el).text().replace(/,/g, ''), title = $(el).prev().text(), days = title.regex(/(\d+) days/i), hours = title.regex(/(\d+) hours/i), minutes = title.regex(/(\d+) minutes/i), seconds = title.regex(/(\d+) seconds/i), time, my_xp = 0, my_bp = 0, my_wp = 0, my_cash = 0, result;
			time = Date.now() - ((((((((days || 0) * 24) + (hours || 0)) * 60) + (minutes || 59)) * 60) + (seconds || 59)) * 1000);
			if (txt.regex(/You were killed/i)) {
				killed = true;
				deaths++;
			} else {
				uid = $('a:eq(0)', el).attr('href').regex(/user=(\d+)/i);
				user[uid] = user[uid] || {name:$('a:eq(0)', el).text(), win:0, lose:0, deaths:0};
				result = null;
				if (txt.regex(/Victory!/i)) {
					win++;
					user[uid].lose++;
					my_xp = txt.regex(/(\d+) experience/i);
					my_bp = txt.regex(/(\d+) Battle Points!/i);
					my_wp = txt.regex(/(\d+) War Points!/i);
					my_cash = txt.regex(/\$(\d+)/i);
					result = 'win';
				} else {
					lose++;
					user[uid].win++;
					my_xp = 0 - txt.regex(/(\d+) experience/i);
					my_bp = 0 - txt.regex(/(\d+) Battle Points!/i);
					my_wp = 0 - txt.regex(/(\d+) War Points!/i);
					my_cash = 0 - txt.regex(/\$(\d+)/i);
					result = 'loss';
				}
				if (killed) {
					user[uid].deaths++;
					killed = false;
				}
				if (time > last_time) {
//					log('Add to History (+battle): exp = '+my_xp+', bp = '+my_bp+', wp = '+my_wp+', income = '+my_cash);
					time = Math.floor(time / 3600000);
					History.add([time, 'exp+battle'], my_xp);
					History.add([time, 'bp+battle'], my_bp);
					History.add([time, 'wp+battle'], my_wp);
					History.add([time, 'income+battle'], my_cash);
					switch (result) {
						case 'win':
							History.add([time, 'battle+win'], 1);
							break;
						case 'loss':
							History.add([time, 'battle+loss'], -1);
							break;
					}
				}
				xp += my_xp;
				bp += my_bp;
				wp += my_wp;
				cash += my_cash;
				
			}
		});
		if (win || lose) {
			list.push('You were challenged <strong>' + (win + lose) + '</strong> times, winning <strong>' + win + '</strong> and losing <strong>' + lose + '</strong>.');
			list.push('You ' + (xp >= 0 ? 'gained <span class="positive">' : 'lost <span class="negative">') + Math.abs(xp).addCommas() + '</span> experience points.');
			list.push('You ' + (cash >= 0 ? 'gained <span class="positive">' : 'lost <span class="negative">') + '<b class="gold">$' + Math.abs(cash).addCommas() + '</b></span>.');
			list.push('You ' + (bp >= 0 ? 'gained <span class="positive">' : 'lost <span class="negative">') + Math.abs(bp).addCommas() + '</span> Battle Points.');
			list.push('You ' + (wp >= 0 ? 'gained <span class="positive">' : 'lost <span class="negative">') + Math.abs(wp).addCommas() + '</span> War Points.');
			if (deaths) {
				list.push('You died ' + (deaths>1 ? deaths+' times' : 'once') + '!');
			}
			list.push('');
			for (i in user) {
				sort.push(i);
			}
			sort.sort(function(a,b){return (user[b].win + (user[b].lose / 100)) - (user[a].win + (user[a].lose / 100));});
			for (j=0; j<sort.length; j++) {
				i = sort[j];
				list.push(Page.makeLink('keep.php', {casuser:i}, user[i].name) + ' <a target="_blank" href="http://www.facebook.com/profile.php?id=' + i + '">' + makeImage('facebook') + '</a> ' + (user[i].win ? 'beat you <span class="negative">' + user[i].win + '</span> time' + plural(user[i].win) : '') + (user[i].lose ? (user[i].win ? (user[i].deaths ? ', ' : ' and ') : '') + 'was beaten <span class="positive">' + user[i].lose + '</span> time' + plural(user[i].lose) : '') + (user[i].deaths ? (user[i].win || user[i].lose ? ' and ' : '') + 'killed you <span class="negative">' + user[i].deaths + '</span> time' + plural(user[i].deaths) : '') + '.');
			}
			$('#app46755028429_battleUpdateBox .alertsContainer').prepend('<div style="padding: 0pt 0pt 10px;"><div class="alert_title">Summary:</div><div class="alert_content">' + list.join('<br>') + '</div></div>');
		}
	}
	return true;
};

/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Global:true, History, Page:true, Queue, Resources,
	Battle, Generals, LevelUp, Player,
	APP, APPID, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, Divisor, length, sum, findInObject, objectIndex, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
	makeImage
*/
/********** Worker.Page for Castle Age **********
* Add defaults to Page for "Castle Age"
*/

Page.defaults.castle_age = {
	pageNames:{
//		facebook:				- not real, but used in worker.pages for worker.parse('facebook') on fb popup dialogs
		index:					{url:'index.php', selector:'#app46755028429_indexNewFeaturesBox'},
		quests_quest:			{url:'quests.php', image:'tab_quest_on.gif'}, // If we ever get this then it means a new land...
		quests_quest1:			{url:'quests.php?land=1', image:'land_fire_sel.gif'},
		quests_quest2:			{url:'quests.php?land=2', image:'land_earth_sel.gif'},
		quests_quest3:			{url:'quests.php?land=3', image:'land_mist_sel.gif'},
		quests_quest4:			{url:'quests.php?land=4', image:'land_water_sel.gif'},
		quests_quest5:			{url:'quests.php?land=5', image:'land_demon_realm_sel.gif'},
		quests_quest6:			{url:'quests.php?land=6', image:'land_undead_realm_sel.gif'},
		quests_quest7:			{url:'quests.php?land=7', image:'tab_underworld_big.gif'},
		quests_quest8:			{url:'quests.php?land=8', image:'tab_heaven_big2.gif'},
		quests_quest9:			{url:'quests.php?land=9', image:'tab_ivory_big.gif'},
		quests_quest10:			{url:'quests.php?land=10', image:'tab_earth2_big.gif'},
		quests_quest11:			{url:'quests.php?land=11', image:'tab_water2_big.gif'},
		quests_quest12:			{url:'quests.php?land=12', image:'tab_mist2_big.gif'},
		quests_quest13:			{url:'quests.php?land=13', image:'tab_mist3_big.gif'},
		quests_demiquests:		{url:'symbolquests.php', image:'demi_quest_on.gif'},
		quests_atlantis:		{url:'monster_quests.php', image:'tab_atlantis_on.gif'},
		battle_battle:			{url:'battle.php', image:'battle_on.gif'},
		battle_training:		{url:'battle_train.php', image:'training_grounds_on_new.gif'},
		battle_rank:			{url:'battlerank.php', image:'tab_battle_rank_on.gif'},
		battle_war:				{url:'war_rank.php', image:'tab_war_on.gif'},
		battle_raid:			{url:'raid.php', image:'tab_raid_on.gif'},
		battle_arena:			{url:'arena.php', image:'arena3_featurebuttonv2.jpg'},

		battle_arena_battle:	{url:'arena_battle.php', selector:'#app46755028429_arena_battle_banner_section', skip:true},
		festival_guild:			{url:'festival_battle_home.php', selector:'div[style*="festival_arena_home_background.jpg"]'},
		festival_guild_battle:	{url:'festival_guild_battle.php', selector:'#app46755028429_guild_battle_section', skip:true},
		battle_guild:	{url:'guild_current_battles.php', selector:'div[style*="guild_current_battles_title.gif"]'},
		battle_guild_battle:	{url:'guild_battle.php', selector:'#app46755028429_guild_battle_banner_section', skip:true},
		battle_war_council:		{url:'war_council.php', image:'war_select_banner.jpg'},
		monster_monster_list:	{url:'player_monster_list.php', image:'monster_button_yourmonster_on.jpg'},
		monster_remove_list:	{url:'player_monster_list.php', image:'mp_current_monsters.gif'},
		monster_battle_monster:	{url:'battle_monster.php', selector:'div[style*="monster_header"]'},
		keep_monster_active:	{url:'raid.php', image:'dragon_view_more.gif'},
		festival_monster_list:	{url:'festival_tower.php?tab=monster',  selector:'div[style*="festival_monster_list_middle.jpg"]'},
		festival_battle_monster:	{url:'festival_battle_monster.php', image:'festival_monstertag_list.gif'},
		monster_dead:			{url:'battle_monster.php', selector:'div[style*="no_monster_back.jpg"]'},
		monster_summon:			{url:'monster_summon_list.php', image:'tab_summon_monster_on.gif'},
		monster_class:			{url:'view_class_progress.php', selector:'#app46755028429_choose_class_header'},
		heroes_heroes:			{url:'mercenary.php', image:'tab_heroes_on.gif'},
		heroes_generals:		{url:'generals.php', image:'tab_generals_on.gif'},
		town_soldiers:			{url:'soldiers.php', image:'tab_soldiers_on.gif'},
		town_blacksmith:		{url:'item.php', image:'tab_black_smith_on.gif'},
		town_magic:				{url:'magic.php', image:'tab_magic_on.gif'},
		town_land:				{url:'land.php', image:'tab_land_on.gif'},
		oracle_oracle:			{url:'oracle.php', image:'oracle_on.gif'},
		oracle_demipower:		{url:'symbols.php', image:'demi_on.gif'},
		oracle_treasurealpha:	{url:'treasure_chest.php', image:'tab_treasure_alpha_on.gif'},
//		oracle_treasurevanguard:{url:'treasure_chest.php?treasure_set=alpha', image:'tab_treasure_vanguard_on.gif'},
//		oracle_treasureonslaught:{url:'treasure_chest.php?treasure_set=onslaught', image:'tab_treasure_onslaught_on.gif'},
		keep_stats:				{url:'keep.php', image:'tab_stats_on.gif'},
		keep_eliteguard:		{url:'party.php', image:'tab_elite_guard_on.gif'},
		keep_achievements:		{url:'achievements.php', image:'tab_achievements_on.gif'},
		keep_alchemy:			{url:'alchemy.php', image:'tab_alchemy_on.gif'},
		army_invite:			{url:'army.php', image:'invite_on.gif'},
		army_gifts:				{url:'gift.php', selector:'#app46755028429_giftContainer'},
		army_viewarmy:			{url:'army_member.php', image:'view_army_on.gif'},
		army_sentinvites:		{url:'army_reqs.php', image:'sent_invites_on.gif'},
		army_newsfeed:			{url:'army_news_feed.php', selector:'#app46755028429_army_feed_header'},
		gift_accept:			{url:'gift_accept.php', selector:'div[style*="gift_background.jpg"]'}
//		apprentice_collect:		{url:'apprentice.php?collect=true', image:'ma_view_progress2.gif'}
	}
};

/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page, Queue, Resources, Window,
	Bank, Battle, Generals, LevelUp, Player:true, Title,
	APP, APPID, log, debug, script_started, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, Divisor, length, sum, findInObject, objectIndex, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
	makeImage
*/
/********** Worker.Player **********
* Gets all current stats we can see
*/
var Player = new Worker('Player');
Player.option = Player.runtime = Player.temp = null;

Player.settings = {
	keep:true,
	taint:true
};

Player.defaults['castle_age'] = {
	pages:'*'
};

Player.setup = function() {
	Resources.add('Energy');
	Resources.add('Stamina');
	Resources.add('Gold');
};

Player.init = function() {
	this._trigger('#app46755028429_gold_current_value', 'cash');
	this._trigger('#app46755028429_energy_current_value', 'energy');
	this._trigger('#app46755028429_stamina_current_value', 'stamina');
	this._trigger('#app46755028429_health_current_value', 'health');
	this._trigger('#app46755028429_gold_time_value', 'cash_timer');
	Title.alias('energy', 'Player:data.energy');
	Title.alias('maxenergy', 'Player:data.maxenergy');
	Title.alias('health', 'Player:data.health');
	Title.alias('maxhealth', 'Player:data.maxhealth');
	Title.alias('stamina', 'Player:data.stamina');
	Title.alias('maxstamina', 'Player:data.maxstamina');
	Title.alias('myname', 'Player:data.myname');
	Title.alias('level', 'Player:data.level');
	Title.alias('exp_needed', 'Player:exp_needed');
	Title.alias('bsi', 'Player:bsi');
	Title.alias('lsi', 'Player:lsi');
	Title.alias('csi', 'Player:csi');
	// function gold_increase_ticker(ticks_left, stat_current, tick_time, increase_value, first_call)
	this.set('cash_time', script_started + ($('*').html().regex(/gold_increase_ticker\((\d+),/) * 1000));
};

Player.parse = function(change) {
	if (change) {
		return false;
	}
	var i, data = this.data, keep, stats, tmp, $tmp, artifacts = {};
	if ($('#app46755028429_energy_current_value').length) {
		this.set('energy', $('#app46755028429_energy_current_value').text().regex(/(\d+)/) || 0);
		Resources.add('Energy', data.energy, true);
	}
	if ($('#app46755028429_stamina_current_value').length) {
		this.set('stamina', $('#app46755028429_stamina_current_value').text().regex(/(\d+)/) || 0);
		Resources.add('Stamina', data.stamina, true);
	}
	if ($('#app46755028429_health_current_value').length) {
		this.set('health', $('#app46755028429_health_current_value').text().regex(/(\d+)/) || 0);
	}
	if ($('#app46755028429_st_2_5 strong:not([title])').length) {
		tmp = $('#app46755028429_st_2_5').text().regex(/(\d+)\s*\/\s*(\d+)/);
		if (tmp) {
			this.set('exp', tmp[0]);
			this.set('maxexp', tmp[1]);
		}
	}
	this.set('cash', $('#app46755028429_gold_current_value').text().replace(/\D/g, '').regex(/(\d+)/));
	this.set('level', $('#app46755028429_st_5').text().regex(/Level: (\d+)!/i));
	this.set('armymax', $('a[href*=army.php]', '#app46755028429_main_bntp').text().regex(/(\d+)/));
	this.set('army', Math.min(data.armymax, 501)); // XXX Need to check what max army is!
	this.set('upgrade', $('a[href*=keep.php]', '#app46755028429_main_bntp').text().regex(/(\d+)/) || 0);
	this.set('general', $('div.general_name_div3').first().text().trim());
	this.set('imagepath', $('#app46755028429_globalContainer img:eq(0)').attr('src').pathpart());
	if (Page.page==='keep_stats') {
		keep = $('.keep_attribute_section').first(); // Only when it's our own keep and not someone elses
		if (keep.length) {
			this.set('myname', $('div.keep_stat_title_inc > span', keep).text().regex(/"(.*)"/));
			tmp = $('td.statsTMainback img[src*=rank_medals]');
			if (tmp.length) {
				this.set('battle',tmp.attr('src').filepart().regex(/(\d+)/));
			}
			tmp = $('td.statsTMainback img[src*=rank_medals_war]');
			if (tmp.length) {
				this.set('war', tmp.attr('src').filepart().regex(/(\d+)/));
			}
			stats = $('div.attribute_stat_container', keep);
			this.set('maxenergy', $(stats).eq(0).text().regex(/(\d+)/));
			this.set('maxstamina', $(stats).eq(1).text().regex(/(\d+)/));
			this.set('attack', $(stats).eq(2).text().regex(/(\d+)/));
			this.set('defense', $(stats).eq(3).text().regex(/(\d+)/));
			this.set('maxhealth', $(stats).eq(4).text().regex(/(\d+)/));
			this.set('bank', parseInt($('td.statsTMainback b.money').text().replace(/\D/g,''), 10));
			stats = $('.statsTB table table:contains("Total Income")').text().replace(/[^0-9$]/g,'').regex(/(\d+)\$(\d+)\$(\d+)/);
			this.set('maxincome', stats[0]);
			this.set('upkeep', stats[1]);
			this.set('income', stats[2]);
			Resources.add('Gold', data.bank + data.cash, true);

			// remember artifacts - useful for quest requirements
			$tmp = $('.statsTTitle:contains("ARTIFACTS") + div div div a img');
			if ($tmp.length) {
				$tmp.each(function(i,el){
					if ((tmp = ($(el).attr('title') || $(el).attr('alt') || '').trim())) {
						artifacts[tmp] = $(el).attr('src').filepart();
					}
				});
				this.set(['data','artifact'], artifacts);
			}
		}
	} else if (Page.page === 'town_land') {
		$tmp = $('.layout div[style*="town_header_land."]');
		if ($tmp.length && ($tmp = $('div div:contains("Land Income:")', $tmp)).length) {
			var o = {};
			$('div', $tmp.last().parent()).each(function(a, el) {
				if (!o[a]) o[a] = {};
				o[a].label = ($(el).text() || '').trim();
			});
			$('div', $tmp.last().parent().next()).each(function(a, el) {
				if (!o[a]) o[a] = {};
				o[a].value = ($(el).text() || '').trim();
			});
			//log(LOG_WARN, 'Land.income: ' + JSON.shallow(o, 2));
			for (i in o) {
				if (o[i].label && o[i].value) {
					if (o[i].label.match(/Land Income:/i)) {
						if (isNumber(tmp = o[i].value.replace(/\D/g, '').regex(/(\d+)/))) {
							this.set('maxincome', tmp);
						}
					} else if (o[i].label.match(/Upkeep:/i)) {
						if (isNumber(tmp = o[i].value.replace(/\D/g, '').regex(/(\d+)/))) {
							this.set('upkeep', tmp);
						}
					} else if (o[i].label.match(/Income per Hour:/i)) {
						if (isNumber(tmp = o[i].value.replace(/\D/g, '').regex(/(\d+)/))) {
							this.set('income', tmp);
						}
					}
				}
			}
		}
	}
	$('span.result_body').each(function(i,el){
		var txt = $(el).text().replace(/,|\s+|\n/g, '');
		History.add('income', sum(txt.regex(/Gain.*\$(\d+).*Cost|stealsGold:\+\$(\d+)|Youreceived\$(\d+)|Yougained\$(\d+)/i)));
		if (txt.regex(/incomepaymentof\$(\d+)gold/i)){
			History.set('land', sum(txt.regex(/incomepaymentof\$(\d+)gold|backinthemine:Extra(\d+)Gold|Yousuccessfullysold.*for$(\d+)/i)));
		}
	});
	this.set('worth', this.get('cash', 0) + this.get('bank', 0));
	$('#app46755028429_gold_current_value').attr('title', 'Cash in Bank: $' + this.get('bank', 0).addCommas());
	return false;
};

Player.update = function(event) {
	if (event.type === 'data' || event.type === 'init') {
		var i, j, types = ['stamina', 'energy', 'health'], list, step;
		for (j=0; j<types.length; j++) {
			list = [];
			step = Divisor(this.data['max'+types[j]]);
			for (i=0; i<=this.data['max'+types[j]]; i+=step) {
				list.push(i);
			}
			if (types[j] === 'stamina') {
				step = this.data['max' + types[j]] || 10;
				for (i in { 1:1, 5:1, 10:1, 20:1, 50:1 }) {
					if (step >= i) {
						list.push(parseInt(i));
					}
				}
			} else if (types[j] === 'energy') {
				step = this.data['max' + types[j]] || 15;
				for (i in { 10:1, 20:1, 40:1, 100:1 }) {
					if (step >= i) {
						list.push(parseInt(i));
					}
				}
			} else if (types[j] === 'health') {
				step = this.data['max' + types[j]] || 100;
				for (i in { 1:1, 9:1, 10:1, 11:1, 12:1, 13:1 }) {
					if (step >= i) {
						list.push(parseInt(i));
					}
				}
			}
			Config.set(types[j], list.sort(function(a,b){return a-b;}).unique());
		}
		History.set('bank', this.data.bank);
		History.set('exp', this.data.exp);
	} else if (event.type === 'trigger') {
		if (event.id === 'cash_timer') {
			this.set(['data', 'cash_time'], (Math.floor(Date.now() / 1000) + $('#app46755028429_gold_time_value').text().parseTimer()) * 1000);
		} else {
			this.set(['data', event.id], $(event.selector).text().replace(/\D/g, '').regex(/(\d+)/));
			switch (event.id) {
				case 'energy':	Resources.add('Energy', this.data[event.id], true);	break;
				case 'stamina':	Resources.add('Stamina', this.data[event.id], true);	break;
				case 'cash':	Resources.add('Gold', this.data[event.id], true);	break;
			}
		}
	}
	Dashboard.status(this);
};

Player.get = function(what, def) {
	var data = this.data;
	switch(what) {
		case 'cash_timer':		return (data.cash_time - Date.now()) / 1000;
		case 'energy_timer':	return $('#app46755028429_energy_time_value').text().parseTimer();
		case 'health_timer':	return $('#app46755028429_health_time_value').text().parseTimer();
		case 'stamina_timer':	return $('#app46755028429_stamina_time_value').text().parseTimer();
		case 'exp_needed':		return data.maxexp - data.exp;
		case 'bank':			return (data.bank - Bank.option.keep > 0) ? data.bank - Bank.option.keep : 0;
		case 'bsi':				return ((data.attack + data.defense) / data.level).round(2);
		case 'lsi':				return (((data.maxstamina * 2) + data.maxenergy) / data.level).round(2);
		case 'csi':				return ((data.attack + data.defense + (data.maxstamina * 2) + data.maxenergy + data.maxhealth - 100) / data.level).round(2);
		default: return this._get.apply(this, arguments);
	}
};

/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page, Queue, Resources,
	Battle, Generals, LevelUp, Player,
	APP, APPID, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, Divisor, length, sum, findInObject, objectIndex, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
	makeImage
*/
/********** Worker.Potions **********
* Automatically drinks potions
*/
var Potions = new Worker('Potions');
Potions.temp = null;

Potions.settings = {
	taint:true
};

Potions.defaults['castle_age'] = {
	pages:'*'
};

Potions.data = {
	Energy:0,
	Stamina:0
};

Potions.option = {
	Energy:35,
	Stamina:35
};

Potions.runtime = {
	type:null,
	amount:0
};

Potions.display = function(){
	var i, opts = [];
	for (i in this.option) {
		if (i.charAt(0) !== '_') {
			opts.push({
				id:i,
				label:'Maximum '+i+' Potions',
				select:{0:0,5:5,10:10,15:15,20:20,25:25,30:30,35:35,39:39,infinite:'&infin;'},
				help:'Will use them when you have to many, if you collect more than 40 they will be lost anyway'
			});
		}
	}
	return opts;
};

Potions.setup = function() {
	this.set(['option','energy']); // Remove old data
	this.set(['option','stamina']); // Remove old data
};

Potions.init = function() {
	$('a.golem-potion-drink').live('click', function(event) {
		if (/Do/.test($(this).text())) {
			Potions.set(['runtime','type'], null);
			Potions.set(['runtime','amount'], 0);
		} else {
			Potions.set(['runtime','type'], $(this).attr('name'));
			Potions.set(['runtime','amount'], 1);
		}
	});
	this._watch(Player, 'data.energy');
	this._watch(Player, 'data.maxenergy');
	this._watch(Player, 'data.stamina');
	this._watch(Player, 'data.maxstamina');
	this._watch(LevelUp, 'runtime.running');
};

Potions.parse = function(change) {
	// No need to parse out Income potions as about to visit the Keep anyway...
	var potions = $('.result_body:contains("You have acquired the Energy Potion!")');
	if (potions.length) {
		Potions.set(['data','Energy'], Potions.data['Energy'] + potions.length);
	}
	if (Page.page === 'keep_stats' && $('.keep_attribute_section').length) {// Only our own keep
		potions = {};
		$('.statsTTitle:contains("CONSUMABLES") + div > div').each(function(i,el){
			var info = $(el).text().replace(/\s+/g, ' ').trim().regex(/(\w+) Potion x (\d+)/i);
			if (info && info[0]) {
				potions[info[0]] = info[1];
				// Default only newly discovered potion types to 35
				if (isUndefined(Potions.option[info[0]]) || isNull(Potions.option[info[0]])) {
					Potions.set(['option',info[0]], Potions.option[info[0]] || 35);
				}
			}
		});
		this._replace(['data'], potions);
	}
	return false;
};

Potions.update = function(event) {
	var i, l, txt = [], levelup = LevelUp.get('runtime.running');
	for (i in this.data) {
		if (this.data[i]) {
			l = i.toLowerCase();
			txt.push(makeImage('potion_'+l) + this.data[i] + '/' + this.option[i] + (this.option._disabled ? '' : ' <a class="golem-potion-drink" name="'+i+'" title="Drink one of this potion">' + (this.runtime.type === i ? '[Don\'t Drink]' : '[Drink]') + '</a>'));
		}
		if (!levelup && isNumber(this.option[i]) && this.data[i] > this.option[i] && Player.get(l, 0) + 10 < Player.get('max' + l, 0)) {
			this.set(['runtime','type'], i);
			this.set(['runtime','amount'], 1);
		}
	}
	if (!this.option._disabled && this.runtime.type && this.runtime.amount){
		txt.push('Drinking ' + this.runtime.amount + 'x ' + this.runtime.type + ' potion');
	}
	Dashboard.status(this, txt.join(', '));
	this.set(['option','_sleep'], !this.runtime.type || !this.runtime.amount);
};

Potions.work = function(state) {
	if (state && this.runtime.type && this.runtime.amount && Page.to('keep_stats')) {
		log(LOG_WARN, 'Wanting to drink a ' + this.runtime.type + ' potion');
		Page.click('.statUnit:contains("' + this.runtime.type + '") form .imgButton input');
		this.set(['runtime','type'], null);
		this.set(['runtime','amount'], 0);
	}
	return QUEUE_CONTINUE;
};

/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page, Queue, Resources,
	Alchemy, Bank, Battle, Generals, LevelUp, Monster, Player, Town,
	APP, APPID, warn, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser, console,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, Divisor, length, sum, findInObject, objectIndex, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
	makeImage
*/
/********** Worker.Quest **********
* Completes quests with a choice of general
*/
// Should also look for quests_quest but that should never be used unless there's a new area
var Quest = new Worker('Quest');

Quest.settings = {
	//taint:true
};

Quest.defaults['castle_age'] = {
	pages:'quests_quest1 quests_quest2 quests_quest3 quests_quest4 quests_quest5 quests_quest6 quests_quest7 quests_quest8 quests_quest9 quests_quest10 quests_quest11 quests_quest12 quests_quest13 quests_demiquests quests_atlantis'
};

Quest.option = {
	general:true,
	general_choice:'any',
	what:'Influence',
	ignorecomplete:true,
	unique:true,
	monster:'When able',
	bank:true,
	energy_reserve:0
};

Quest.runtime = {
	best:null,
	energy:0
};

Quest.data = {
	id: {}
};

Quest.temp = {
	order: []
};

Quest.land = [
	'Land of Fire',
	'Land of Earth',
	'Land of Mist',
	'Land of Water',
	'Demon Realm',
	'Undead Realm',
	'Underworld',
	'Kingdom of Heaven',
	'Ivory City',
	'Earth II',
	'Water II',
	'Mist II',
	'Mist III'
];
Quest.area = {quest:'Quests', demiquest:'Demi Quests', atlantis:'Atlantis'};
Quest.current = null;
Quest.display = [
	{
		id:'general',
		label:'Use Best General',
		checkbox:true
	},{
		advanced:true,
		id:'general_choice',
		label:'Use General',
		require:'!general',
		select:'generals'
	},{
		id:'energy_reserve',
		label:'Energy Reserve',
		select:'energy',
		help:'Keep this much energy in reserve for other workers.'
	},{
		id:'what',
		label:'Quest for',
		select:'quest_reward',
		help:'Cartigan will try to collect all items needed to summon Cartigan (via Alchemy), then cascades to Advancement.' +
		  ' Vampire Lord will try to collect 24 (for Calista), then cascades to Advancement.' +
		  ' Subquests (quick general levelling) will only run subquests under 100% influence, then cascades to Advancement.' +
		  ' Advancement will run viable quests to unlock all areas, then cascades to Influence.' +
		  ' Influence will run all viable influence gaining quests, then cascade to Experience.' +
		  ' Inf+Exp will run the best viable experience quests under 100% influence, then cascade to Experience.' +
		  ' Inf+Cash will run the best viable cash quests under 100% influence, then cascade to Cash.' +
		  ' Experience runs only the best experience quests.' +
		  ' Cash runs only the best cash quests.'
	},{
		advanced:true,
		id:'ignorecomplete',
		label:'Only do incomplete quests',
		checkbox:true,
		help:'Will only do quests that aren\'t at 100% influence',
		require:'what=="Cartigan" || what=="Vampire Lord"'
	},{
		id:'unique',
		label:'Get Unique Items First',
		checkbox:true
	},{
		id:'monster',
		label:'Fortify',
		select: ['Never','When able','Wait for']
	},{
		id:'bank',
		label:'Automatically Bank',
		checkbox:true
	}
];

Quest.setup = function() {
	Resources.use('Energy');
};

Quest.init = function() {
	var data = this.get('data'), runtime = this.get('runtime'), revision = this.get(['runtime','revision'], 0), i, j, r, x;
	// BEGIN: Fix for *old* bad page loads
	for (i in data) {
		if (i.indexOf('\t') !== -1) {
			delete data[i];
		}
	}
	// END
	// BEGIN: Fix for option type changes
	if (this.option.monster === true) {
		this.set(['option','monster'], 'When able');
	} else if (this.option.monster === false) {
		this.set(['option','monster'], 'Never');
	}
	// END
	// BEGIN: fix up "under level 4" generals
	if (this.option.general_choice === 'under level 4') {
		this.set('option.general_choice', 'under max level');
	}
	// END
	// BEGIN: one time pre-r845 fix for erroneous values in m_c, m_d, reps, eff
	if (revision < 845) {
		for (i in data) {
			if (data[i].reps) {
				x = this.wiki_reps(data[i], true);
				if (data[i].reps < Math.round(x * 0.8) || data[i].reps > Math.round(x * 1.2)) {
					log(LOG_WARN, 'Quest.init: deleting metrics for: ' + i);
					delete data[i].m_c;
					delete data[i].m_d;
					delete data[i].reps;
					delete data[i].eff;
				}
			}
		}
	}
	// END
	// BEGIN: one time pre-r850 fix to map data by id instead of name
	if (revision < 850) {
		runtime.best = null;
		runtime.energy = 0;
		if (runtime.quest) {
			delete runtime.quest;
		}
		if (!('id' in data) && ('Pursuing Orcs' in data)) {
			x = {};

			if (!('id' in data)) {
				data.id = {};
			}

			for (i in data) {
				if (i === 'id' || i === 'q') {
					continue;
				}
				if ('id' in data[i]) {
					data.id[data[i].id] = data[i];
					delete data[i].id;
				} else {
					if (!('q' in data)) {
						data.q = {};
					}
					data.q[i] = data[i];
				}
				x[i] = 1;
			}

			for (i in x) {
				delete data[i];
			}
		}
	}
	// END
	this.set(['runtime','revision'], revision); // started r845 for historic reference
	this._watch(Player, 'data.energy');
	this._watch(Player, 'data.maxenergy');
};

Quest.parse = function(change) {
	var data = this.data, last_main = 0, area = null, land = null, i, j, m_c, m_d, m_l, m_i, reps, purge = {}, quests, el, id, name, level, influence, reward, energy, exp, tmp, type, units, item, icon, c;
	if (Page.page === 'quests_quest') {
		return false; // This is if we're looking at a page we don't have access to yet...
	} else if (Page.page === 'quests_demiquests') {
		area = 'demiquest';
	} else if (Page.page === 'quests_atlantis') {
		area = 'atlantis';
	} else {
		area = 'quest';
		land = Page.page.regex(/quests_quest(\d+)/i) - 1;
	}
	for (i in data.id) {
		if (data.id[i].area === area && (area !== 'quest' || data.id[i].land === land)) {
			purge[i] = true;
		}
	}
	if ($('div.quests_background,div.quests_background_sub').length !== $('div.quests_background .quest_progress,div.quests_background_sub .quest_sub_progress').length) {
		Page.to(Page.page, '');// Force a page reload as we're pretty sure it's a bad page load!
		return false;
	}
	quests = $('div.quests_background,div.quests_background_sub,div.quests_background_special');
	for (i=0; i<quests.length; i++) {
		el = quests[i];
		try {
			tmp = $('input[name="quest"]', el);
			if (!tmp.length || !tmp.val()) {
				continue;
			}
			assert(id = parseInt(tmp.val() || '0'), 'Bad quest id: '+tmp.val());
			this._transaction(); // BEGIN TRANSACTION
			delete purge[id]; // We've found it, and further errors shouldn't delete it
			name = undefined;
			type = undefined;
			level = undefined;
			influence = undefined;
			energy = undefined;
			exp = undefined;
			reward = undefined;
			if ($(el).hasClass('quests_background_sub')) { // Subquest
				name = $('.quest_sub_title', el).text().trim();
				assert((tmp = $('.qd_2_sub', el).text().replace(/\s+/gm, ' ').replace(/,/g, '').replace(/mil\b/gi, '000000')), 'Unknown rewards');
				exp = tmp.regex(/\b(\d+)\s*Exp\b/im);
				reward = tmp.regex(/\$\s*(\d+)\s*-\s*\$\s*(\d+)\b/im);
				energy = $('.quest_req_sub', el).text().regex(/\b(\d+)\s*Energy\b/im);
				tmp = $('.quest_sub_progress', el).text();
				level = tmp.regex(/\bLEVEL:?\s*(\d+)\b/im);
				influence = tmp.regex(/\bINFLUENCE:?\s*(\d+)%/im);
				type = 2;
			} else {
				name = $('.qd_1 b', el).text().trim();
				assert((tmp = $('.qd_2', el).text().replace(/\s+/gm, ' ').replace(/,/g, '').replace(/mil\b/gi, '000000')), 'Unknown rewards');
				exp = tmp.regex(/\b(\d+)\s*Exp\b/im);
				reward = tmp.regex(/\$\s*(\d+)\s*-\s*\$\s*(\d+)\b/im);
				energy = $('.quest_req', el).text().regex(/\b(\d+)\s*Energy\b/im);
				if ($(el).hasClass('quests_background')) { // Main quest
					last_main = id;
					tmp = $('.quest_progress', el).text();
					level = tmp.regex(/\bLEVEL:?\s*(\d+)\b/im);
					influence = tmp.regex(/\bINFLUENCE:?\s*(\d+)%/im);
					type = 1;
				} else { // Special / boss Quest
					type = 3;
				}
			}
			assert(name && name.indexOf('\t') === -1, 'Bad quest name - found tab character');
			this.set(['data','id',id,'button_fail'], 0);
			assert(this.set(['data','id',id,'name'], name, 'string'), 'Bad quest name: '+name);
			assert(this.set(['data','id',id,'area'], area, 'string'), 'Bad area name: '+area);
			assert(this.set(['data','id',id,'type'], type, 'number'), 'Unknown quest type: '+name);
			assert(this.set(['data','id',id,'exp'], exp, 'number'), 'Unknown exp reward');
			assert(this.set(['data','id',id,'reward'], (reward[0] + reward[1]) / 2), 'Bad money reward');
			this.set(['data','id',id,'energy'], energy);
			this.set(['data','id',id,'land'], isNumber(land) ? land : undefined);
			this.set(['data','id',id,'main'], type === 2 && last_main ? last_main : undefined);
			if (isNumber(influence)) {
				m_l = this.get(['data','id',id,'level'], 0, 'number'); // last influence value
				m_i = this.get(['data','id',id,'influence'], 0, 'number'); // last influence value
				this.set(['data','id',id,'level'], level || 0);
				this.set(['data','id',id,'influence'], influence);
				m_c = this.get(['data','id',id,'m_c'], 0, 'number'); // percentage count metric
				m_d = this.get(['data','id',id,'m_d'], 0, 'number'); // percentage delta metric
				reps = this.get(['data','id',id,'reps'], 0, 'number'); // average reps needed per level
				if (m_l === (level || 0) && m_i < influence && influence < 100) {
					m_d += influence - m_i;
					m_c++;
				}
				if (m_c && m_d) {
					this.set(['data','id',id,'m_c'], m_c);
					this.set(['data','id',id,'m_d'], m_d);
					reps = Math.ceil(m_c * 100 / m_d);
				}
				if (reps) {
					this.set(['data','id',id,'reps'], reps);
					this.set(['data','id',id,'eff'], energy * reps);
				}
			}
			if (type !== 2) { // That's everything for subquests
				this.set(['data','id',id,'unique'], type === 3 ? true : undefined); // Special / boss quests create unique items
				tmp = $('.qd_1 img', el).last();
				if (tmp.length && (item = tmp.attr('title'))) {
					item = item.replace(/\s+/gm, ' ').trim();
					icon = (tmp.attr('src') || '').filepart();
					item = Town.qualify(item, icon);
					this.set(['data','id',id,'item'], item);
					this.set(['data','id',id,'itemimg'], icon);
				}
				units = $('.quest_req >div >div >div', el);
				for (j=0; j<units.length; j++) {
					item = ($('img', units[j]).attr('title') || '').replace(/\s+/gm, ' ').trim();
					icon = ($('img', units[j]).attr('src') || '').filepart();
					item = Town.qualify(item, icon);
					c = ($(units[j]).text() || '').regex(/\bx\s*(\d+)\b/im);
					this.set(['data','id',id,'units',item], c);
				}
				tmp = $('.quest_act_gen img', el).attr('title');
				this.set(['data','id',id,'general'], tmp || undefined);
			}
			this._transaction(true); // COMMIT TRANSACTION
		} catch(e) {
			this._transaction(false); // ROLLBACK TRANSACTION on any error
			log(LOG_ERROR, e.name + ' in ' + this.name + '.parse(' + change + '): ' + e.message);
		}
	}
	for (i in purge) {
		log(LOG_WARN, 'Deleting ' + i + '(' + (this.land[data.id[i].land] || data.id[i].area) + ')');
		this.set(['data','id',i]); // Delete unseen quests...
	}
	return false;
};

  // watch specific Generals if doing an alchemy quest giving a general
  // watch specific Town if doing an alchemy quest giving an item/unit
  // watch Generals if we passed up a preferred quest due to a missing req.
  // watch Town if we passed up a preferred quest due to a missing req.

Quest.update = function(event) {
	if (event.worker.name === 'Town' && event.type !== 'data') {
		return; // Missing quest requirements
	}
	var i, unit, own, need, noCanDo = false, best = null, best_cartigan = null, best_vampire = null, best_subquest = null, best_advancement = null, best_influence = null, best_experience = null, best_land = 0, has_cartigan = false, has_vampire = false, list = [], items = {}, data = this.data, maxenergy = Player.get('maxenergy',999), eff, best_adv_eff = 1e10, best_inf_eff = 1e10, cmp, oi, ob;
	// First let's update the Quest dropdown list(s)...
	if (event.type === 'init' || event.type === 'data') {
		for (i in data.id) {
			if (data.id[i].item && data.id[i].type !== 3) {
				list.push(data.id[i].item);
			}
			for (unit in data.id[i].units) {
				items[unit] = Math.max(items[unit] || 0, data.id[i].units[unit]);
			}
		}
		Config.set('quest_reward', ['Nothing', 'Cartigan', 'Vampire Lord', 'Subquests', 'Advancement', 'Influence', 'Inf+Exp', 'Experience', 'Inf+Cash', 'Cash'].concat(list.unique().sort()));
		for (unit in items) {
			if (Resources.get(['data','_'+unit,'quest'], -1) !== items[unit]) {
				Resources.set(['data','_'+unit,'quest'], items[unit]);
			}
		}
	}
	// Now choose the next quest...
	if (this.option.unique) {// Boss monster quests first - to unlock the next area
		for (i in data.id) {
			if (data.id[i].energy > maxenergy) {// Skip quests we can't afford
				continue;
			}
			if (data.id[i].type === 3 && !Alchemy.get(['ingredients', data.id[i].itemimg], 0, 'number') && (!best || data.id[i].energy < data.id[best].energy)) {
				best = i;
			}
		}
	}
	if (!best && this.option.what !== 'Nothing') {
		if (this.option.what !== 'Vampire Lord' || Town.get(['Vampire Lord', 'own'], 0, 'number') >= 24) {
			has_vampire = true; // Stop trying once we've got the required number of Vampire Lords
		}
		if (this.option.what !== 'Cartigan' || Generals.get(['data','Cartigan','own'], 0, 'number') || (Alchemy.get(['ingredients', 'eq_underworld_sword.jpg'], 0, 'number') >= 3 && Alchemy.get(['ingredients', 'eq_underworld_amulet.jpg'], 0, 'number') >= 3 && Alchemy.get(['ingredients', 'eq_underworld_gauntlet.jpg'], 0, 'number') >= 3)) {
			// Sword of the Faithless x3 - The Long Path, Burning Gates
			// Crystal of Lament x3 - Fiery Awakening
			// Soul Eater x3 - Fire and Brimstone, Deathrune Castle
			has_cartigan = true; // Stop trying once we've got the general or the ingredients
		}
//		log(LOG_WARN, 'option = ' + this.option.what);
//		best = (this.runtime.best && data.id[this.runtime.best] && (data.id[this.runtime.best].influence < 100) ? this.runtime.best : null);
		for (i in data.id) {
			// Skip quests we can't afford or can't equip the general for
			oi = data.id[i];
			if (oi.energy > maxenergy 
					|| !Generals.test(oi.general || 'any')
					|| (LevelUp.runtime.general && oi.general)) {
				continue;
			}
			if (oi.units) {
				own = 0;
				need = 0;
				noCanDo = false;
				for (unit in oi.units) {
					need = oi.units[unit];
					if (!Player.get(['artifact', i]) || need !== 1) {
						own = Town.get([unit, 'own'], 0, 'number');
						if (need > own) {	// Need more than we own, skip this quest.
							noCanDo = true;	// set flag
							break;	// no need to check more prerequisites.
						}
					}
				}
				if (noCanDo) {
					continue;	// Skip to the next quest in the list
				}
			}
			eff = oi.eff || (oi.energy * this.wiki_reps(oi));
			if (0 < (oi.influence || 0) && (oi.influence || 0) < 100) {
				eff = Math.ceil(eff * (100 - oi.influence) / 100);
			}
			switch(this.option.what) { // Automatically fallback on type - but without changing option
				case 'Vampire Lord': // Main quests or last subquest (can't check) in Undead Realm
					ob = data.id[best_vampire];
					// order: inf<100, <energy, >exp, >cash (vampire)
					if (!has_vampire && isNumber(oi.land) &&
					  oi.land === 5 && oi.type === 1 &&
					  (!this.option.ignorecomplete || (isNumber(oi.influence) && oi.influence < 100)) &&
					  (!best_vampire ||
					  (cmp = (isNumber(oi.influence) && oi.influence < 100 ? 1 : 0) - (isNumber(ob.influence) && ob.influence < 100 ? 1 : 0)) > 0 ||
					  (!cmp && (cmp = oi.energy - ob.energy) < 0) ||
					  (!cmp && (cmp = (oi.exp / oi.energy) - (ob.exp / ob.energy)) > 0) ||
					  (!cmp && (cmp = (oi.reward / oi.energy) - (ob.reward / ob.energy)) > 0))) {
						best_vampire = i;
					}// Deliberate fallthrough
				case 'Cartigan': // Random Encounters in various Underworld Quests
					ob = data.id[best_cartigan];
					// order: inf<100, <energy, >exp, >cash (cartigan)
					if (!has_cartigan && isNumber(oi.land) && data.id[i].land === 6 &&
					  (!this.option.ignorecomplete || (isNumber(oi.influence) && oi.influence < 100)) &&
					  (((data.id[oi.main || i].name === 'The Long Path' || data.id[oi.main || i].name === 'Burning Gates') && Alchemy.get(['ingredients', 'eq_underworld_sword.jpg'], 0, 'number') < 3) ||
					  ((data.id[oi.main || i].name === 'Fiery Awakening') && Alchemy.get(['ingredients', 'eq_underworld_amulet.jpg'], 0, 'number') < 3) ||
					  ((data.id[oi.main || i].name === 'Fire and Brimstone' || data.id[oi.main || i].name === 'Deathrune Castle') && Alchemy.get(['ingredients', 'eq_underworld_gauntlet.jpg'], 0, 'number') < 3)) &&
					  (!best_cartigan ||
					  (cmp = (isNumber(oi.influence) && oi.influence < 100 ? 1 : 0) - (isNumber(ob.influence) && ob.influence < 100 ? 1 : 0)) > 0 ||
					  (!cmp && (cmp = oi.energy - ob.energy) < 0) ||
					  (!cmp && (cmp = (oi.exp / oi.energy) - (ob.exp / ob.energy)) > 0) ||
					  (!cmp && (cmp = (oi.reward / oi.energy) - (ob.reward / ob.energy)) > 0))) {
						best_cartigan = i;
					}// Deliberate fallthrough
				case 'Subquests': // Find the cheapest energy cost *sub*quest with influence under 100%
					ob = data.id[best_subquest];
					// order: <energy, >exp, >cash (subquests)
					if (oi.type === 2 && isNumber(oi.influence) && oi.influence < 100 &&
					  (!best_subquest ||
					  (cmp = oi.energy - ob.energy) < 0 ||
					  (!cmp && (cmp = (oi.exp / oi.energy) - (ob.exp / ob.energy)) > 0) ||
					  (!cmp && (cmp = (oi.reward / oi.energy) - (ob.reward / ob.energy)) > 0))) {
						best_subquest = i;
					}// Deliberate fallthrough
				case 'Advancement': // Complete all required main / boss quests in an area to unlock the next one (type === 2 means subquest)
					if (isNumber(oi.land) && oi.land > best_land) { // No need to revisit old lands - leave them to Influence
						best_land = oi.land;
						best_advancement = null;
						best_adv_eff = 1e10;
					}
					ob = data.id[best_advancement];
					// order: <effort, >exp, >cash, <energy (advancement)
					if (oi.type !== 2 && isNumber(oi.land) &&
					  //oi.level === 1 &&  // Need to check if necessary to do boss to unlock next land without requiring orb
					  oi.land >= best_land &&
					  ((isNumber(oi.influence) && Generals.test(oi.general) && oi.level <= 1 && oi.influence < 100) || (oi.type === 3 && !Alchemy.get(['ingredients', oi.itemimg], 0, 'number'))) &&
					  (!best_advancement ||
					  (cmp = eff - best_adv_eff) < 0 ||
					  (!cmp && (cmp = (oi.exp / oi.energy) - (ob.exp / ob.energy)) > 0) ||
					  (!cmp && (cmp = (oi.reward / oi.energy) - (ob.reward / ob.energy)) > 0) ||
					  (!cmp && (cmp = oi.energy - ob.energy) < 0))) {
						best_land = Math.max(best_land, oi.land);
						best_advancement = i;
						best_adv_eff = eff;
					}// Deliberate fallthrough
				case 'Influence': // Find the cheapest energy cost quest with influence under 100%
					ob = data.id[best_influence];
					// order: <effort, >exp, >cash, <energy (influence)
					if (isNumber(oi.influence) &&
					  (!oi.general || Generals.test(oi.general)) &&
					  oi.influence < 100 &&
					  (!best_influence ||
					  (cmp = eff - best_inf_eff) < 0 ||
					  (!cmp && (cmp = (oi.exp / oi.energy) - (ob.exp / ob.energy)) > 0) ||
					  (!cmp && (cmp = (oi.reward / oi.energy) - (ob.reward / ob.energy)) > 0) ||
					  (!cmp && (cmp = oi.energy - ob.energy) < 0))) {
						best_influence = i;
						best_inf_eff = eff;
					}// Deliberate fallthrough
				case 'Experience': // Find the best exp per energy quest
					ob = data.id[best_experience];
					// order: >exp, inf<100, >cash, <energy (experience)
					if (!best_experience ||
					  (cmp = (oi.exp / oi.energy) - (ob.exp / ob.energy)) > 0 ||
					  (!cmp && (cmp = (isNumber(oi.influence) && oi.influence < 100 ? 1 : 0) - (isNumber(ob.influence) && ob.influence < 100 ? 1 : 0)) > 0) ||
					  (!cmp && (cmp = (oi.reward / oi.energy) - (ob.reward / ob.energy)) > 0) ||
					  (!cmp && (cmp = oi.energy - ob.energy) < 0)) {
						best_experience = i;
					}
					break;
				case 'Inf+Exp': // Find the best exp per energy quest, favouring quests needing influence
					ob = data.id[best_experience];
					// order: inf<100, >exp, >cash, <energy (inf+exp)
					if (!best_experience ||
					  (cmp = (isNumber(oi.influence) && oi.influence < 100 ? 1 : 0) - (isNumber(ob.influence) && ob.influence < 100 ? 1 : 0)) > 0 ||
					  (!cmp && (cmp = (oi.exp / oi.energy) - (ob.exp / ob.energy)) > 0) ||
					  (!cmp && (cmp = (oi.reward / oi.energy) - (ob.reward / ob.energy)) > 0) ||
					  (!cmp && (cmp = oi.energy - ob.energy) < 0)) {
						best_experience = i;
					}
					break;
				case 'Inf+Cash': // Find the best (average) cash per energy quest, favouring quests needing influence
					ob = data.id[best];
					// order: inf<100, >cash, >exp, <energy (inf+cash)
					if (!best ||
					  (cmp = (isNumber(oi.influence) && oi.influence < 100 ? 1 : 0) - (isNumber(ob.influence) && ob.influence < 100 ? 1 : 0)) > 0 ||
					  (!cmp && (cmp = (oi.reward / oi.energy) - (ob.reward / ob.energy)) > 0) ||
					  (!cmp && (cmp = (oi.exp / oi.energy) - (ob.exp / ob.energy)) > 0) ||
					  (!cmp && (cmp = oi.energy - ob.energy) < 0)) {
						best = i;
					}
					break;
				case 'Cash': // Find the best (average) cash per energy quest
					ob = data.id[best];
					// order: >cash, inf<100, >exp, <energy (cash)
					if (!best ||
					  (cmp = (oi.reward / oi.energy) - (ob.reward / ob.energy)) > 0 ||
					  (!cmp && (cmp = (isNumber(oi.influence) && oi.influence < 100 ? 1 : 0) - (isNumber(ob.influence) && ob.influence < 100 ? 1 : 0)) > 0) ||
					  (!cmp && (cmp = (oi.exp / oi.energy) - (ob.exp / ob.energy)) > 0) ||
					  (!cmp && (cmp = oi.energy - ob.energy) < 0)) {
						best = i;
					}
					break;
				default: // For everything else, there's (cheap energy) items...
					ob = data.id[best];
					// order: <energy, inf<100, >exp, >cash (item)
					if (oi.item === this.option.what &&
					  (!best ||
					  (cmp = oi.energy - ob.energy) < 0 ||
					  (!cmp && (cmp = (isNumber(oi.influence) && oi.influence < 100 ? 1 : 0) - (isNumber(ob.influence) && ob.influence < 100 ? 1 : 0)) > 0) ||
					  (!cmp && (cmp = (oi.exp / oi.energy) - (ob.exp / ob.energy)) > 0) ||
					  (!cmp && (cmp = (oi.reward / oi.energy) - (ob.reward / ob.energy)) > 0))) {
						best = i;
					}
					break;
			}
		}
		switch(this.option.what) { // Automatically fallback on type - but without changing option
			case 'Vampire Lord':best = best_vampire || best_advancement || best_influence || best_experience;break;
			case 'Cartigan':	best = best_cartigan || best_advancement || best_influence || best_experience;break;
			case 'Subquests':	best = best_subquest || best_advancement || best_influence || best_experience;break;
			case 'Advancement':	best = best_advancement || best_influence || best_experience;break;
			case 'Influence':	best = best_influence || best_experience;break;
			case 'Inf+Exp':		best = best_experience;break;
			case 'Experience':	best = best_experience;break;
			default:break;
		}
	}
	if (best !== this.runtime.best) {
		this.set(['runtime','best'], best);
		if (best) {
			this.set(['runtime','energy'], data.id[best].energy);
			log(LOG_WARN, 'Wanting to perform - ' + data.id[best].name + ' in ' + (isNumber(data.id[best].land) ? this.land[data.id[best].land] : this.area[data.id[best].area]) + ' (energy: ' + data.id[best].energy + ', experience: ' + data.id[best].exp + ', gold: $' + data.id[best].reward.SI() + ')');
		}
	}
	if (best) {
		Dashboard.status(this, (isNumber(data.id[best].land) ? this.land[data.id[best].land] : this.area[data.id[best].area]) + ': ' + data.id[best].name + ' (' + makeImage('energy') + data.id[best].energy + ' = ' + makeImage('exp') + data.id[best].exp + ' + ' + makeImage('gold') + '$' + data.id[best].reward.SI() + (data.id[best].item ? Town.get([data.id[best].item,'img'], null) ? ' + <img style="width:16px;height:16px;margin-bottom:-4px;" src="' + imagepath + Town.get([data.id[best].item, 'img']) + '" title="' + data.id[best].item + '">' : ' + ' + data.id[best].item : '') + (isNumber(data.id[best].influence) && data.id[best].influence < 100 ? (' @ ' + makeImage('percent','Influence') + data.id[best].influence + '%') : '') + ')');
	} else {
		Dashboard.status(this);
	}
//	this.set(['option','_sleep'], !this.runtime.best || this.runtime.energy < (LevelUp.runtime.force.energy ? LevelUp.runtime.energy : LevelUp.runtime.energy - this.option.energy_reserve));
};

Quest.work = function(state) {
	var mid, general = 'any', best = LevelUp.runtime.quest || this.runtime.best, useable_energy = LevelUp.runtime.force.energy ? LevelUp.runtime.energy : LevelUp.runtime.energy - this.option.energy_reserve, quest, button;
	if (!best || (!LevelUp.runtime.quest && this.runtime.energy > useable_energy)) {
		if (state && this.option.bank && !Bank.stash()) {
			return QUEUE_CONTINUE;
		}
		return QUEUE_FINISH;
	}
	// If holding for fortify, then don't quest if we have a secondary or defend target possible, unless we're forcing energy.
	if ((LevelUp.runtime.levelup && !LevelUp.runtime.quest)
			|| (!LevelUp.runtime.levelup 
				&& ((this.option.monster === 'When able' && Monster.get('runtime.defending')) 
					|| (this.option.monster === 'Wait for' && (Monster.get('runtime.defending')
						|| !LevelUp.runtime.force.energy))))) {
		return QUEUE_FINISH;
	}
	if (!state) {
		return QUEUE_CONTINUE;
	}
	 quest = this.data.id[best]
	if (this.option.general) {
		if (quest.general && isNumber(quest.influence) && quest.influence < 100) {
			general = quest.general;
		} else {
			general = Generals.best('under max level');
			switch(this.option.what) {
				case 'Vampire Lord':
				case 'Cartigan':
					if (quest.general) {
						general = quest.general;
					} else {
						if (general === 'any' && isNumber(quest.influence) && quest.influence < 100) {
							general = Generals.best('influence');
						}
						if (general === 'any') {
							general = Generals.best('item');
						}
					}
					break;
				case 'Subquests':
				case 'Advancement':
				case 'Influence':
				case 'Inf+Exp':
				case 'Experience':
				case 'Inf+Cash':
				case 'Cash':
					if (isNumber(quest.influence) && quest.influence < 100) {
						if (quest.general) {
							general = quest.general;
						} else if (general === 'any') {
							general = Generals.best('influence');
						}
					}
					break;
				default:
					if (isNumber(quest.influence) && quest.influence < 100) {
						if (quest.general) {
							general = quest.general;
						} else if (general === 'any') {
							general = Generals.best('influence');
						}
					}
					if (general === 'any') {
						general = Generals.best('item');
					}
					break;
			}
			if (general === 'any') {
				general = 'cash';
			}
		}
	} else {
		general = this.option.general_choice;
	}
	if (!Generals.to(LevelUp.runtime.general || general)) {
		return QUEUE_CONTINUE;
	}
	button = $('input[name="quest"][value="' + best + '"]').siblings('.imgButton').children('input[type="image"]');
	log(LOG_WARN, 'Performing - ' + quest.name + ' (energy: ' + quest.energy + ')');
	//log(LOG_WARN,'Quest ' + quest.name + ' general ' + quest.general + ' test ' + !Generals.test(quest.general || 'any') + ' this.data || '+ (quest.general || 'any') + ' queue ' + (LevelUp.runtime.general && quest.general));
	if (!button || !button.length) { // Can't find the quest, so either a bad page load, or bad data - delete the quest and reload, which should force it to update ok...
		quest.button_fail = (quest.button_fail || 0) + 1;
		if (quest.button_fail > 5){
			log(LOG_WARN, 'Can\'t find button for ' + quest.name + ', so deleting and re-visiting page...');
			delete quest;
			this.runtime.best = null;
			Page.reload();
			return QUEUE_RELEASE;
		} else {
			switch(quest.area) {
			case 'quest':
				Page.to('quests_quest' + (quest.land + 1),null,true);
				return QUEUE_CONTINUE;
			case 'demiquest':
				Page.to('quests_demiquests',null,true);
				return QUEUE_CONTINUE;
			case 'atlantis':
				Page.to('quests_atlantis',null,true);
				return QUEUE_CONTINUE;
			default:
				log(LOG_LOG, 'Can\'t get to quest area!');
				return QUEUE_FINISH;
			}
		}
	}
	Page.click(button);
	LevelUp.set(['runtime','quest'], null);
	if (quest.type === 3) {// Just completed a boss quest
		if (!Alchemy.get(['ingredients', quest.itemimg], 0, 'number')) {// Add one as we've just gained it...
			Alchemy.set(['ingredients', quest.itemimg], 1);
		}
		// This won't work since we just clicked the quest above.
		if (this.option.what === 'Advancement' && Page.pageNames['quests_quest' + (quest.land + 2)]) {// If we just completed a boss quest, check for a new quest land.
			Page.to('quests_quest' + (quest.land + 2));// Go visit the next land as we've just unlocked it...
		}
	}
	return QUEUE_RELEASE;
};

Quest.dashboard = function(sort, rev) {
	var self = this, i, j, k, o, r, quest, list = [], output = [], vv, tt, cc, span, v, eff;
	if (typeof sort === 'undefined') {
		this.temp.order = [];
		for (i in this.data.id) {
			this.temp.order.push(i);
		}
	}
	if (typeof sort === 'undefined') {
		sort = (this.runtime.sort || 1);
	}
	if (typeof rev === 'undefined'){
		rev = (this.runtime.rev || false);
	}
	this.runtime.sort = sort;
	this.runtime.rev = rev;
	function getValue(q){
		var r, n, o = self.data.id[q];
		switch(sort) {
			case 0:	// general
				return o.general || 'zzz';
			case 1: // name
				return o.name || 'zzz';
			case 2: // area
				return isNumber(o.land) && typeof self.land[o.land] !== 'undefined' ? self.land[o.land] : self.area[o.area];
			case 3: // level
				return (isNumber(o.level) ? o.level : -1) * 100 + (o.influence || 0);
			case 4: // energy
				return o.energy;
			case 5: // effort
				return o.eff || (o.energy * self.wiki_reps(o));
			case 6: // exp
				return o.exp / o.energy;
			case 7: // reward
				return o.reward / o.energy;
			case 8: // item
				return o.item || 'zzz';
		}
		return 0; // unknown
	}
	this.temp.order.sort(function(a,b) {
		var aa = getValue(a), bb = getValue(b);
		if (isString(aa) || isString(bb)) {
			return (rev ? (''+bb).localeCompare(aa) : (''+aa).localeCompare(bb));
		}
		return (rev ? (aa || 0) - (bb || 0) : (bb || 0) - (aa || 0));
	});
	th(output, 'General');
	th(output, 'Name');
	th(output, 'Area');
	th(output, 'Level');
	th(output, 'Energy');
	th(output, 'Effort', 'title="Energy required per influence level."');
	th(output, '@&nbsp;Exp');
	th(output, '@&nbsp;Reward');
	th(output, 'Item');
	list.push('<table cellspacing="0" style="width:100%"><thead><tr>' + output.join('') + '</tr></thead><tbody>');
	for (o=0; o<this.temp.order.length; o++) {
		i = this.temp.order[o];
		quest = this.data.id[i];
		output = [];

		// general
		td(output, Generals.get([quest.general]) ? '<img style="width:25px;height:25px;" src="' + imagepath + Generals.get([quest.general, 'img']) + '" alt="' + quest.general + '" title="' + quest.general + '">' : '');

		// name
		vv = quest.name;
		span = cc = '';
		tt = 'id: ' + i;
		if (quest.main) {
			tt += ' | main:';
			if (this.data.id[quest.main] && this.data.id[quest.main].name) {
				tt += ' ' + this.data.id[quest.main].name;
			}
			tt += ' (id: ' + quest.main + ')';
		}
		if (this.runtime.best === i) {
			vv = '<b>' + vv + '</b>';
			cc = 'green';
		}
		if (tt !== '') {
			tt = 'title="' + tt + '"';
		}
		if (cc !== '') {
			span += ' style="color:' + cc + '"';
		}
		if (span !== '') {
			vv = '<span' + span + '>' + vv + '</span>';
		}
		th(output, vv, tt);

		// area
		td(output, isNumber(quest.land) ? this.land[quest.land].replace(' ','&nbsp;') : this.area[quest.area].replace(' ','&nbsp;'));

		// level
		span = vv = tt = cc = '';
		if (isNumber(v = quest.level)) {
			vv = v + '&nbsp;(' + quest.influence + '%)';
			if (v >= 4 && quest.influence >= 100) {
				cc = 'red';
			} else if (this.cost(i)) {
				cc = 'blue';
				if (tt !== '') {
					tt += '; ';
				}
				tt += this.temp.desc;
			} else if (isNumber(quest.influence) && quest.influence < 100) {
				cc = 'green';
			}
		} else if (this.cost(i)) {
			vv = '<i>n/a</i>';
			cc = 'blue';
			if (tt !== '') {
				tt += '; ';
			}
			tt += this.temp.desc;
		}
		if (tt !== '') {
			tt = 'title="' + tt + '"';
		}
		if (cc !== '') {
			span += ' style="color:' + cc + '"';
		}
		if (span !== '') {
			vv = '<span' + span + '>' + vv + '</span>';
		}
		td(output, vv, tt);

		// energy
		td(output, quest.energy);

		// effort
		vv = tt = cc = span = '';
		if (!isNumber(quest.level)) {
			vv = '<i>' + quest.energy + '</i>';
		} else {
			r = 'reps_' + (isNumber(quest.land) ? (quest.land + 1) : quest.area);
			j = quest.name.toLowerCase();
			vv = quest.eff || (quest.energy * this.wiki_reps(quest));
			tt = 'effort ' + vv;
			if (0 < quest.influence && quest.influence < 100) {
				v = Math.round(vv * (100 - quest.influence) / 100);
				tt += ' (' + v + ')';
			}
			if ((v = quest.reps)) {
				if (tt !== '') {
					tt += ', ';
				}
				tt += 'reps ' + v;
				if (quest.m_d && quest.m_c) {
					var v1 = 100 * quest.m_c / quest.m_d;
					var v2 = 2 / quest.m_c;
					var lo = Math.ceil(v1 - v2);
					var hi = Math.ceil(v1 + v2);
					if (lo < hi) {
						tt += ' [' + lo + ',' + hi + ']';
					}
					v = this.wiki_reps(quest, true);
					if (!v || Math.ceil(lo) > v || Math.ceil(hi) < v) {
						tt += ' wiki[' + (v || '?') + ']';
						if (lo + 1 >= hi) {
							cc = 'purple';
						}
					} else if (lo + 1 >= hi) {
						cc = 'green';
					}
				}
			} else if ((v = this.wiki_reps(quest, true))) {
				if (tt !== '') {
					tt += ', ';
				}
				tt += 'wiki reps ' + v;
			} else {
				if (tt !== '') {
					tt += ', ';
				}
				tt += 'assuming reps 16';
				cc = 'blue';
			}
			if (quest.m_d || quest.m_c) {
				vv = '<b>' + vv + '</b>';
				if (tt !== '') {
					tt += ', ';
				}
				tt += 'effort metrics ' + (quest.m_d || '?') + '/' + (quest.m_c || '?');
			}
			if (tt !== '') {
				tt = 'title="' + tt + '"';
			}
		}
		if (cc !== '') {
			span += ' style="color:' + cc + '"';
		}
		if (span !== '') {
			vv = '<span' + span + '>' + vv + '</span>';
		}
		td(output, vv, tt);

		// exp
		td(output, (quest.exp / quest.energy).round(2), 'title="' + quest.exp + ' total, ' + (quest.exp / quest.energy * 12).round(2) + ' per hour"');

		// reward
		td(output, '$' + (quest.reward / quest.energy).addCommas(0), 'title="$' + quest.reward.addCommas() + ' total, $' + (quest.reward / quest.energy * 12).addCommas(0) + ' per hour"');

		// item
		td(output, quest.itemimg ? '<img style="width:25px;height:25px;" src="' + imagepath + quest.itemimg + '" alt="' + quest.item + '" title="' + quest.item + '">' : '');

		tr(list, output.join(''), 'style="height:25px;"');
	}
	list.push('</tbody></table>');
	$('#golem-dashboard-Quest').html(list.join(''));
	$('#golem-dashboard-Quest tbody tr td:nth-child(2)').css('text-align', 'left');
	if (typeof sort !== 'undefined') {
		$('#golem-dashboard-Quest thead th:eq('+sort+')').attr('name',(rev ? 'reverse' : 'sort')).append('&nbsp;' + (rev ? '&uarr;' : '&darr;'));
	}
};

Quest.cost = function(id) {
	/*jslint onevar:false*/
	var quest = this.get('data.id');
	var gens = Generals.get('data');
	var town = Town.get('data');
	var artifact = Player.get('data.artifact');
	var c, i, j, k, n, cost, upkeep, desc, ccount, ucount;
	/*jslint onevar:true*/

	this.temp.cost = 1e99;
	this.temp.upkeep = 1e99;
	this.temp.desc = '(n/a)';

	cost = ccount = 0;
	upkeep = ucount = 0;
	desc = '';

	if (id && quest[id]) {
		if ((i = quest[id].general)) {
			if (!gens || !gens[i] || !gens[i].own) {
				cost += 1e99;
				if (desc !== '') {
					desc += '; ';
				}
				desc += '(n/a)';
			}
		}

		if (quest[id].units) {
			for (i in quest[id].units) {
				n = quest[id].units[i];
				c = j = 0;
				k = 1e99;
				if (town && town[i]) {
					c = town[i].own || 0;
					if (town[i].buy && town[i].buy.length) {
						j = town[i].upkeep || 0;
						k = town[i].cost || 0;
					}
				} else if (artifact && artifact[i]) {
					c = 1;
					j = k = 0;
				}
				if (c < n) {
					cost += (n - c) * k;
					upkeep += (n - c) * j;
					if (desc !== '') {
						desc += '; ';
					}
					desc += (n - c) + '/' + n + ' ' + i;
					if (k >= 1e99) {
						desc += ' (n/a)';
						ccount++;
					} else if (k) {
						desc += ' $' + ((n - c) * k).SI();
						ccount++;
					}
					if (j) {
						desc += ' (upkeep $' + ((n - c) * j).SI() + ')';
						ucount++;
					}
				}
			}
		}

		if (ccount > 1 && cost) {
			desc += '; total ';
			if (cost < 1e99) {
				desc += '$' + cost.SI();
			} else {
				desc += '(n/a)';
			}
		}

		if (ucount > 1 && upkeep) {
			desc += '; upkeep $' + upkeep.SI();
		}

		this.temp.cost = cost;
		this.temp.upkeep = upkeep;
		this.temp.desc = desc;
	}

	return this.temp.cost;
};

Quest.wiki_reps = function(quest, pure) {
	var reps = 0, rdata;
	if (isObject(quest)) {
		if (!isNumber(quest.level)) {
			reps = 1;
		} else if ((rdata = this.rdata[(quest.name || '').toLowerCase()])) {
			reps = rdata['reps_' + quest.area[0] + ((quest.land || 0) + 1).toString()] || 0;
		}
	}
	return pure ? reps : reps || 16;
};

Quest.rts = 1302453435;	// Sun Apr 10 16:37:15 2011 UTC
Quest.rdata =			// #419
{
	'a demonic transformation':			{ 'reps_q4':  40 },
	'a forest in peril':				{ 'reps_d4':   9 },
	'a kidnapped princess':				{ 'reps_d1':  10 },
	'a new dawn':						{ 'reps_q12':  7 },
	'a surprise from terra':			{ 'reps_q12': 12 },
	'across the sea':					{ 'reps_q11':  8 },
	'aid corvintheus':					{ 'reps_d3':   9 },
	'aid the angels':					{ 'reps_q9':  17 },
	'approach the prayer chamber':		{ 'reps_d1':  12 },
	'approach the tree of life':		{ 'reps_d4':  12 },
	'ascent to the skies':				{ 'reps_q8':  14 },
	'attack from above':				{ 'reps_q9':  17 },
	'attack undead guardians':			{ 'reps_q6':  24 },
	'aurelius':							{ 'reps_q11': 11 },
	'aurelius outpost':					{ 'reps_q11':  9 },
	'avoid detection':					{ 'reps_q12':  0 },
	'avoid ensnarements':				{ 'reps_q3':  34 },
	'avoid fungal poison':				{ 'reps_q12':  0 },
	'avoid poison':						{ 'reps_q12':  0 },
	'avoid shades':						{ 'reps_q12':  0 },
	'avoid the guards':					{ 'reps_q8':   0 },
	'avoid the patrols':				{ 'reps_q9':  17 },
	'banish the horde':					{ 'reps_q9':  17 },
	'battle a wraith':					{ 'reps_q2':  16 },
	'battle earth and fire demons':		{ 'reps_q4':  16 },
	'battle gang of bandits':			{ 'reps_q1':  10 },
	'battle orc captain':				{ 'reps_q3':  15 },
	'battle the black dragon':			{ 'reps_q4':  14 },
	'battle the ent':					{ 'reps_d4':  12 },
	'battling the demons':				{ 'reps_q9':  17 },
	'being followed':					{ 'reps_q7':  15 },
	'blood wing king of the dragons':	{ 'reps_d2':  20 },
	'breach prison':					{ 'reps_q12':  0 },
	'breach the barrier':				{ 'reps_q8':  14 },
	'breach the keep entrance':			{ 'reps_d3':  12 },
	'breaching the gates':				{ 'reps_q7':  15 },
	'break aurelius guard':				{ 'reps_q11':  0 },
	'break evil seal':					{ 'reps_q7':  17 },
	'break the lichs spell':			{ 'reps_d3':  12 },
	'break the line':					{ 'reps_q10':  0 },
	'breaking through the guard':		{ 'reps_q9':  17 },
	'bridge of elim':					{ 'reps_q8':  11 },
	'burning gates':					{ 'reps_q7':   0 },
	'call of arms':						{ 'reps_q6':  25 },
	'calm before the storm':			{ 'reps_q13':  0 },
	'cast aura of night':				{ 'reps_q5':  32 },
	'cast blizzard':					{ 'reps_q10':  0 },
	'cast fire aura':					{ 'reps_q6':  24 },
	'cast holy light':					{ 'reps_q6':  24 },
	'cast holy light spell':			{ 'reps_q5':  24 },
	'cast holy shield':					{ 'reps_d3':  12 },
	'cast meteor':						{ 'reps_q5':  32 },
    'cast poison shield':				{ 'reps_q13':  0 },
    'cast regrowth':					{ 'reps_q13':  0 },
	'castle of the black lion':			{ 'reps_d5':  13 },
	'castle of the damn':				{ 'reps_d3':  21 },
	'channel excalibur':				{ 'reps_q8':   0 },
	'channel runestones':				{ 'reps_q12':  0 },
	'charge ahead':						{ 'reps_q10':  0 },
	'charge the castle':				{ 'reps_q7':  15 },
	'chasm of fire':					{ 'reps_q10': 10 },
	'city of clouds':					{ 'reps_q8':  11 },
    'clear haze':						{ 'reps_q13':  0 },
	'clear the rocks':					{ 'reps_q11':  0 },
	'climb castle cliffs':				{ 'reps_q11':  0 },
	'climb the mountain':				{ 'reps_q8':   0 },
	'close the black portal':			{ 'reps_d1':  12 },
    'collect artifact shards':			{ 'reps_q13':  0 },
	'collect astral souls':				{ 'reps_q12':  0 },
	'collect runestones':				{ 'reps_q12':  0 },
	'confront the black lion':			{ 'reps_d5':  12 },
	'confront the rebels':				{ 'reps_q10': 10 },
	'consult aurora':					{ 'reps_d4':  12 },
	'corruption of nature':				{ 'reps_d4':  20 },
	'cover tracks':						{ 'reps_q7':  19 },
    'create artifact relic':			{ 'reps_q13':  0 },
	'create wall':						{ 'reps_q12':  0 },
	'cross lava river':					{ 'reps_q7':  20 },
	'cross the bridge':					{ 'reps_q8':   0, 'reps_q10':  0 },
    'cross the falls':					{ 'reps_q13':  0 },
	'cross the moat':					{ 'reps_q11':  0 },
	'crossing the chasm':				{ 'reps_q2':  13, 'reps_q8':   0 },
	'cure infested soldiers':			{ 'reps_q6':  25 },
	'dark heart of the woods':			{ 'reps_q12':  9 },
	'deal final blow to bloodwing':		{ 'reps_d2':  12 },
	'death of a forest':				{ 'reps_q13':  0 },
	'deathrune castle':					{ 'reps_q7':  12 },
	'decipher the clues':				{ 'reps_q9':  17 },
	'defeat and heal feral animals':	{ 'reps_d4':  12 },
	'defeat angelic sentinels':			{ 'reps_q8':  14 },
	'defeat astral wolves':				{ 'reps_q12':  0 },
	'defeat bear form':					{ 'reps_q11':  0 },
	'defeat bloodwing':					{ 'reps_d2':  12 },
	'defeat chimerus':					{ 'reps_d1':  12 },
	'defeat darien woesteel':			{ 'reps_d5':   9 },
	'defeat demonic guards':			{ 'reps_q7':  17 },
	'defeat fire elementals':			{ 'reps_q10':  0 },
	'defeat frost minions':				{ 'reps_q3':  40 },
	'defeat guardian':					{ 'reps_q12':  0 },
	'defeat guards':					{ 'reps_q12':  0 },
	'defeat lion defenders':			{ 'reps_q11':  0 },
	'defeat lothar':					{ 'reps_q12':  0 },
	'defeat orc patrol':				{ 'reps_q8':   0 },
	'defeat rebels':					{ 'reps_q10':  0 },
    'defeat rock elementals':			{ 'reps_q13':  0 },
	'defeat snow giants':				{ 'reps_q3':  24 },
	'defeat spirits':					{ 'reps_q12':  0 },
	'defeat the bandit leader':			{ 'reps_q1':   6 },
	'defeat the banshees':				{ 'reps_q5':  25 },
	'defeat the black lion army':		{ 'reps_d5':  12 },
	'defeat the demonic guards':		{ 'reps_d1':  12 },
	'defeat the demons':				{ 'reps_q9':  17 },
	'defeat the kobolds':				{ 'reps_q10':  0 },
	'defeat the patrols':				{ 'reps_q9':  17 },
	'defeat the seraphims':				{ 'reps_q8':   0 },
	'defeat tiger form':				{ 'reps_q11':  0 },
	'defeat treants':					{ 'reps_q12':  0 },
    'defeat wolverines':				{ 'reps_q13':  0 },
	'defend the village':				{ 'reps_d3':  12 },
	'desert temple':					{ 'reps_q11': 12 },
	'destroy black oozes':				{ 'reps_q11':  0 },
	'destroy fire dragon':				{ 'reps_q4':  10 },
	'destroy fire elemental':			{ 'reps_q4':  16 },
	'destroy horde of ghouls & trolls':	{ 'reps_q4':   9 },
    'destroy mushrooms':				{ 'reps_q13':  0 },
    'destroy scourge':					{ 'reps_q13':  0 },
	'destroy spores':					{ 'reps_q12':  0 },
	'destroy the black gate':			{ 'reps_d1':  12 },
	'destroy the black portal':			{ 'reps_d1':  12 },
	'destroy the bolted door':			{ 'reps_d3':  12 },
	'destroy undead crypt':				{ 'reps_q1':   5 },
	'destruction abound':				{ 'reps_q8':  11 },
	'determine cause of corruption':	{ 'reps_d5':  12 },
	'dig up star metal':				{ 'reps_d3':  12 },
	'disarm townspeople':				{ 'reps_q11':  0 },
	'discover cause of corruption':		{ 'reps_d4':  12 },
	'dismantle orc patrol':				{ 'reps_q3':  32 },
    'dispatch corrupted soldiers':		{ 'reps_q13':  0 },
	'dispatch lothar':					{ 'reps_q12':  0 },
	'dispatch more cultist guards':		{ 'reps_d1':  12 },
	'distract the demons':				{ 'reps_q9':  17 },
	'dragon slayer':					{ 'reps_d2':  14 },
	'druidic prophecy':					{ 'reps_q11':  9 },
	"duel cefka's knight champion":		{ 'reps_q4':  10 },
	'duel with guards':					{ 'reps_q12':  0 },
	'dwarven stronghold':				{ 'reps_q10': 10 },
	'eastern corridor':					{ 'reps_q11':  0 },
	'elekin the dragon slayer':			{ 'reps_d2':  10 },
	'end of the road':					{ 'reps_q9':  17 },
	'enlist captain morgan':			{ 'reps_q11':  0 },
	'entrance denied':					{ 'reps_q12': 12 },
	'entrance to terra':				{ 'reps_q1':   9 },
	'equip soldiers':					{ 'reps_q6':  25 },
    'eradicate spores':					{ 'reps_q13':  0 },
	'escape from trakan':				{ 'reps_q12':  7 },
	'escape trakan':					{ 'reps_q12':  0 },
	'escape woods':						{ 'reps_q12':  0 },
	'escaping the chaos':				{ 'reps_q9':  17 },
	'escaping the stronghold':			{ 'reps_q9':  10 },
	'explore dead forests':				{ 'reps_q12':  0 },
	'explore merchant plaza':			{ 'reps_q11':  0 },
	'explore mist expanse':				{ 'reps_q12':  0 },
	'explore mist ruins':				{ 'reps_q12':  0 },
	'explore the temple':				{ 'reps_q11':  0 },
	'extinguish desert basilisks':		{ 'reps_q11':  0 },
	'extinguish the fires':				{ 'reps_q8':   0 },
	'falls of jiraya':					{ 'reps_q1':  10 },
	'family ties':						{ 'reps_d5':  11 },
	'felthias fields':					{ 'reps_q12': 14 },
	'fend off demons':					{ 'reps_q7':  20 },
	'fiery awakening':					{ 'reps_q7':  12 },
	"fight cefka's shadow guard":		{ 'reps_q4':  10 },
	'fight demonic worshippers':		{ 'reps_q5':  24 },
	'fight dragon welps':				{ 'reps_q4':  10 },
	'fight ghoul army':					{ 'reps_q1':   5 },
	'fight gildamesh':					{ 'reps_q3':  32 },
	'fight ice beast':					{ 'reps_q3':  40 },
	'fight infested soldiers':			{ 'reps_q6':  25 },
	'fight off demons':					{ 'reps_q5':  21 },
	'fight off zombie infestation':		{ 'reps_d3':  12 },
	'fight snow king':					{ 'reps_q3':  24 },
	'fight the half-giant sephor':		{ 'reps_q4':   9 },
	'fight treants':					{ 'reps_q2':  27 },
	'fight undead zombies':				{ 'reps_q2':  16 },
	'fight water demon lord':			{ 'reps_q2':  31 },
	'fight water demons':				{ 'reps_q2':  30 },
	'fight water spirits':				{ 'reps_q2':  40 },
    'find a way across':				{ 'reps_q13':  0 },
	'find answers':						{ 'reps_q12':  0 },
	'find escape route':				{ 'reps_q12':  0 },
	'find evidence of dragon attack':	{ 'reps_d2':   8 },
	'find hidden path':					{ 'reps_d2':  10 },
	'find nezeals keep':				{ 'reps_d3':  12 },
	'find prison key':					{ 'reps_q12':  0 },
	'find rock worms weakness':			{ 'reps_d2':  10 },
    'find shelter from haze':			{ 'reps_q13':  0 },
	'find source of the attacks':		{ 'reps_d3':  12 },
	'find survivors':					{ 'reps_q8':  14 },
	'find the dark elves':				{ 'reps_d1':  12 },
	'find the demonic army':			{ 'reps_d1':  12 },
	'find the druids':					{ 'reps_d4':  12 },
	'find the entrance':				{ 'reps_q8':   0 },
	'find the exit':					{ 'reps_q9':  17 },
	'find the safest path':				{ 'reps_q10': 14 },
	'find the source of corruption':	{ 'reps_d4':  12 },
	'find the woman? father':			{ 'reps_d5':  12 },
	'find troll weakness':				{ 'reps_q2':  10 },
	'find your way out':				{ 'reps_q7':  15 },
	'fire and brimstone':				{ 'reps_q7':  12 },
	'forest of ash':					{ 'reps_d4':  11 },
	'freeing arielle':					{ 'reps_q12': 10 },
	'furest hellblade':					{ 'reps_d3':  17 },
	'gain access':						{ 'reps_q10':  0 },
	'gain entry':						{ 'reps_q11':  0 },
	'gates to the undead':				{ 'reps_q6':  17 },
	'gateway':							{ 'reps_q8':  11 },
    'gather earth essence':				{ 'reps_q13':  0 },
    'gather life dust':					{ 'reps_q13':  0 },
    'gather nature essence':			{ 'reps_q13':  0 },
    'gather samples':					{ 'reps_q13':  0 },
    'gather supplies':					{ 'reps_q12':  0, 'reps_q13':  0 },
	'get information from the druid':	{ 'reps_d4':  12 },
	'get water for the druid':			{ 'reps_d4':  12 },
	'grim outlook':						{ 'reps_q9':  17 },
	'guard against attack':				{ 'reps_d5':  12 },
	'hakkal woods':						{ 'reps_q13':  0 },
	'heal arielle':						{ 'reps_q12':  0 },
	'heal wounds':						{ 'reps_q7':  20 },
	'heat the villagers':				{ 'reps_q1':   5 },
	'holy fire':						{ 'reps_d4':  11 },
    'hunt for food':					{ 'reps_q13':  0 },
	'impending battle':					{ 'reps_q10': 10 },
	'infiltrate trakan':				{ 'reps_q12':  0 },
	'inspire soldiers':					{ 'reps_q12':  0 },
	'interrogate the prisoners':		{ 'reps_q9':  17 },
    'investigate temple':				{ 'reps_q13':  0 },
	'investigate the gateway':			{ 'reps_q8':   0 },
	'ironfist dwarves':					{ 'reps_q10': 10 },
	'join up with artanis':				{ 'reps_d1':  12 },
	'judgement stronghold':				{ 'reps_q8':  11 },
	'juliean desert':					{ 'reps_q11': 12 },
	'kelp forest':						{ 'reps_a1':  20 },
    'kill diseased treants':			{ 'reps_q13':  0 },
	'kill gildamesh':					{ 'reps_q3':  34 },
	'kill shades':						{ 'reps_q12':  0 },
    'kill slimes':						{ 'reps_q13':  0 },
	'kill vampire bats':				{ 'reps_d3':  10 },
	'koralan coast town':				{ 'reps_q11': 14 },
	'koralan townspeople':				{ 'reps_q11': 10 },
	'learn about death knights':		{ 'reps_d5':  12 },
	'learn aurelius intentions':		{ 'reps_q11':  0 },
	'learn counterspell':				{ 'reps_d1':  12 },
	'learn holy fire':					{ 'reps_d4':  12 },
	'look for clues':					{ 'reps_q8':  14 },
	'lothar the ranger':				{ 'reps_q12':  9 },
    'make camp':						{ 'reps_q13':  0 },
	'marauders!':						{ 'reps_d5':   9 },
	'march into the undead lands':		{ 'reps_q6':  24 },
	'march to the unholy war':			{ 'reps_q6':  25 },
	'mausoleum of triste':				{ 'reps_q3':  17 },
	'misty hills of boralis':			{ 'reps_q3':  20 },
	'mount aretop':						{ 'reps_d2':  25 },
	'nightfall':						{ 'reps_q12':  9 },
	'nightmare':						{ 'reps_q6':  20 },
	'outmaneuver lothar':				{ 'reps_q12':  0 },
	'outpost entrance':					{ 'reps_q11': 12 },
	'path to heaven':					{ 'reps_q8':  11 },
	'persuade terra':					{ 'reps_q12':  0 },
	'pick up the orc trail':			{ 'reps_q1':   6 },
	'plan the attack':					{ 'reps_d5':  12 },
	'portal of atlantis':				{ 'reps_a1':  20 },
	'power of excalibur':				{ 'reps_q8':  11 },
	'prepare for ambush':				{ 'reps_q1':   6 },
	'prepare for battle':				{ 'reps_d2':  12, 'reps_q5':  21 },
    'prepare for dark':					{ 'reps_q13':  0 },
	'prepare for the trials':			{ 'reps_q9':  17 },
	'prepare tactics':					{ 'reps_q10':  0 },
	'prepare troops':					{ 'reps_q10':  0 },
	'prevent dragon? escape':			{ 'reps_d2':  12 },
	'protect temple from raiders':		{ 'reps_q2':  40 },
	'purge forest of evil':				{ 'reps_q2':  27 },
	'pursuing orcs':					{ 'reps_q1':  13 },
	'put out the fires':				{ 'reps_d2':   8 },
	'question dark elf prisoners':		{ 'reps_d1':  12 },
	'question the druidic wolf':		{ 'reps_d4':  12 },
	'question townspeople':				{ 'reps_q11': 17 },
	'question vulcan':					{ 'reps_q8':   0 },
	'ready defenses':					{ 'reps_q12':  0 },
	'ready soldiers':					{ 'reps_q12':  0 },
	'ready the horses':					{ 'reps_q1':   6 },
	'reason with guards':				{ 'reps_q12':  0 },
	'recover the key':					{ 'reps_q9':  17 },
	'recruit allies':					{ 'reps_q10':  0 },
	'recruit elekin to join you':		{ 'reps_d2':   9 },
	'recruit furest to join you':		{ 'reps_d3':  12 },
    'repair bridge':					{ 'reps_q13':  0 },
	'repel gargoyle raid':				{ 'reps_q4':  14 },
	'request council':					{ 'reps_q10':  0 },
	'request entrance':					{ 'reps_q12':  0 },
	'rescue survivors':					{ 'reps_q8':  14 },
	'resist the lost souls':			{ 'reps_q5':  25 },
	'retrieve dragon slayer':			{ 'reps_d2':  10 },
	'retrieve the jeweled heart':		{ 'reps_d5':  12 },
	'ride to aretop':					{ 'reps_d2':  12 },
	'ride towards the palace':			{ 'reps_q9':  17 },
	'river of lava':					{ 'reps_q10': 10 },
	'river of light':					{ 'reps_q1':  10 },
	'save dying creatures':				{ 'reps_q12':  0 },
	'save lost souls':					{ 'reps_q5':  24 },
	'save stranded soldiers':			{ 'reps_q10':  0 },
	'seek out elekin':					{ 'reps_d2':   9 },
	'seek out furest hellblade':		{ 'reps_d3':  12 },
	'seek out jeweled heart':			{ 'reps_d5':  12 },
	'shield of the stars':				{ 'reps_d3':  20 },
	'signs of the scourge':				{ 'reps_q13':  0 },
	'slaughter orcs':					{ 'reps_q3':  15 },
	'slay cave bats':					{ 'reps_d2':  10 },
	'slay the black dragons':			{ 'reps_q5':  32 },
	'slay the guardian':				{ 'reps_q9':  17 },
	'slay the sea serpent':				{ 'reps_d5':  12 },
	'sneak attack on dragon':			{ 'reps_d2':  12 },
	'sneak into the city':				{ 'reps_q8':  14 },
	'sneak up on orcs':					{ 'reps_q1':   7 },
	'soldiers of the black lion':		{ 'reps_d5':  10 },
	'spire of death':					{ 'reps_q5':  20 },
	'sporeguard forest':				{ 'reps_q12': 10 },
	'sporeguard revisited':				{ 'reps_q13':  0 },
	'spring surprise attack':			{ 'reps_d5':  12 },
	'stall for time':					{ 'reps_q12':  0 },
	'stop the wolf from channeling':	{ 'reps_d4':  12 },
	'storm the castle':					{ 'reps_d5':  12 },
	'storm the ivory palace':			{ 'reps_q9':  17 },
	'sulfurous springs':				{ 'reps_q11': 10 },
	'summon legendary defenders':		{ 'reps_q6':  25 },
	'surround rebels':					{ 'reps_q10':  0 },
    'survey area':						{ 'reps_q13':  0 },
	'survey battlefield':				{ 'reps_q10':  0 },
	'survey the surroundings':			{ 'reps_q8':  14 },
	'survive the storm':				{ 'reps_q11':  0 },
	'survive troll ambush':				{ 'reps_q2':  10 },
	'surviving the onslaught':			{ 'reps_q9':  17 },
	'taubourne falls':					{ 'reps_q13':  0 },
	'tenvir summit':					{ 'reps_q13':  0 },
	'tezzari village':					{ 'reps_q12': 12 },
	'the belly of the demon':			{ 'reps_q5':  16 },
	'the betrayed lands':				{ 'reps_q4':  16 },
	'the black portal':					{ 'reps_d1':  15 },
	'the cave of wonder':				{ 'reps_q3':  20 },
	'the crystal caverns':				{ 'reps_d2':  11 },
	'the darkening skies':				{ 'reps_q9':  17 },
	'the dead forests':					{ 'reps_q12': 11 },
	'the deep':							{ 'reps_a1':  20 },
	'the elven sorceress':				{ 'reps_d1':  11 },
	'the fallen druids':				{ 'reps_d4':  12 },
	'the final stretch':				{ 'reps_q9':  17 },
	'the forbidden forest':				{ 'reps_q2':  20 },
	'the forbidden ritual':				{ 'reps_q5':  20 },
	'the gateway':						{ 'reps_q12': 10 },
	'the green haze':					{ 'reps_q13':  0 },
	'the hidden lair':					{ 'reps_d1':  13 },
	'the hollowing moon':				{ 'reps_q6':  17 },
	'the infestation of winterguard':	{ 'reps_d3':  10 },
	'the invasion':						{ 'reps_q8':  11 },
	'the keep of corelan':				{ 'reps_q3':  17 },
	'the keep of isles':				{ 'reps_q4':  16 },
	'the kingdom of alarean':			{ 'reps_d5':  15 },
	'the last gateway':					{ 'reps_q9':  17 },
	"the lich ne'zeal":					{ 'reps_d3':  13 },
	"the lich's keep":					{ 'reps_d3':  15 },
	'the life altar':					{ 'reps_q13':  0 },
	'the life temple':					{ 'reps_q13':  0 },
	'the living gates':					{ 'reps_q5':  20 },
	'the long path':					{ 'reps_q7':  12 },
	'the peaks of draneth':				{ 'reps_d5':  21 },
	'the poison source':				{ 'reps_q11':  0 },
	'the rebellion':					{ 'reps_q10': 10 },
	'the return home':					{ 'reps_q8':  11 },
	'the return of the dragon':			{ 'reps_d2':   9 },
	'the ride south':					{ 'reps_q8':   0 },
	'the river of blood':				{ 'reps_q5':  20 },
	'the scourge':						{ 'reps_q12':  8 },
	'the sea temple':					{ 'reps_a1':  20 },
	'the search for clues':				{ 'reps_d1':  12 },
	'the second temple of water':		{ 'reps_q4':  25 },
	'the smouldering pit':				{ 'reps_q4':  40 },
	'the source of darkness':			{ 'reps_d1':  20 },
	'the source of magic':				{ 'reps_d4':  15 },
	'the southern entrance':			{ 'reps_q12':  9 },
	'the stairs of terra':				{ 'reps_q2':  10 },
	'the stone lake':					{ 'reps_q1':  12 },
	'the sunken city':					{ 'reps_d5':  17 },
	'the tree of life':					{ 'reps_d4':  21 },
	'the vanguard of destruction':		{ 'reps_d1':  21 },
	'the water temple':					{ 'reps_q2':  17 },
	'til morning comes':				{ 'reps_q12': 11 },
	'track down soldiers':				{ 'reps_d5':  12 },
	'track lothar':						{ 'reps_q12':  0 },
	'track sylvana':					{ 'reps_d1':  12 },
	'train with ambrosia':				{ 'reps_d1':  12 },
	'train with aurora':				{ 'reps_d4':  12 },
	'trakan prison':					{ 'reps_q12':  9 },
	'trakan sky bridge':				{ 'reps_q12': 11 },
	'trakan village':					{ 'reps_q12':  7 },
	'travel to the tree of life':		{ 'reps_d4':  12 },
	'travel to winterguard':			{ 'reps_d3':  12 },
	'triste':							{ 'reps_q3':  20 },
	'undead crusade':					{ 'reps_q6':  17 },
	'underground path':					{ 'reps_q12':  8 },
	'underwater ruins':					{ 'reps_a1':  20 },
	'unholy war':						{ 'reps_q6':  20 },
    'unlock altar':						{ 'reps_q13':  0 },
    'use artifact relic':				{ 'reps_q13':  0 },
	'use battering ram':				{ 'reps_q11':  0 },
	'vengeance':						{ 'reps_d2':  17 },
	'vesuv bridge':						{ 'reps_q10': 10 },
	'vesuv lookout':					{ 'reps_q2':  17 },
	'visit the blacksmith':				{ 'reps_q1':  24 },
	'vulcans secret':					{ 'reps_q8':  11 },
	'watch the skies':					{ 'reps_d3':  12 }
};
/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page, Queue, Resources,
	Bank, Battle, Generals, LevelUp, Player, Quest, Land,
	APP, APPID, warn, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser, console,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, Divisor, length, sum, findInObject, objectIndex, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
	makeImage
*/
/********** Worker.Town **********
* Sorts and auto-buys all town units (not property)
*/
var Town = new Worker('Town');
Town.temp = null;

Town.settings = {
	taint:true
};

Town.defaults['castle_age'] = {
	pages:'town_soldiers town_blacksmith town_magic keep_stats'
};

Town.option = {
	general:true,
	quest_buy:true,
	number:'None',
	maxcost:'$0',
	units:'Best for Both',
	sell:false,
	upkeep:20
};

Town.runtime = {
	best_buy:null,
	best_sell:null,
	buy:0,
	sell:0,
	cost:0
};

Town.display = [
{
	id:'general',
	label:'Use Best General',
	checkbox:true
},{
	id:'quest_buy',
	label:'Buy Quest Items',
	checkbox:true
},{
	id:'generals_buy',
	label:'Buy Generals Items',
	checkbox:true
},{
	id:'number',
	label:'Buy Number',
	select:['None', 'Minimum', 'Army', 'Army+', 'Max Army'],
	help:'Minimum will only buy items need for quests if enabled.'
		+ ' Army will buy up to your army size (modified by some generals).'
		+ ' Army+ is like Army on purchases and Max Army on sales.'
		+ ' Max Army will buy up to 541 regardless of army size.'
},{
	id:'sell',
	require:'number!="None" && number!="Minimum"',
	label:'Sell Surplus',
	checkbox:true,
	help:'Only keep the best items for selected sets.'
},{
	advanced:true,
	id:'units',
	require:'number!="None"',
	label:'Set Type',
	select:['Best Offense', 'Best Defense', 'Best for Both'],
	help:'Select type of sets to keep. Best for Both will keep a Best Offense and a Best Defense set.'
},{
	advanced:true,
	id:'maxcost',
	require:'number!="None"',
	label:'Maximum Item Cost',
	select:['$0','$10k','$100k','$1m','$10m','$100m','$1b','$10b','$100b','$1t','$10t','$100t','INCR'],
	help:'Will buy best item based on Set Type with single item cost below selected value. INCR will start at $10k and work towards max buying at each level (WARNING, not cost effective!)'
},{
	advanced:true,
	require:'number!="None"',
	id:'upkeep',
	label:'Max Upkeep',
	text:true,
	after:'%',
	help:'Enter maximum Total Upkeep in % of Total Income'
}
];

/*
Town.blacksmith = {
	Weapon: /axe|blade|bow|cleaver|cudgel|dagger|edge|grinder|halberd|lance|mace|morningstar|rod|saber|scepter|spear|staff|stave|sword |sword$|talon|trident|wand|^Avenger$|Celestas Devotion|Crystal Rod|Daedalus|Deliverance|Dragonbane|Excalibur|Holy Avenger|Incarnation|Ironhart's Might|Judgement|Justice|Lightbringer|Oathkeeper|Onslaught|Punisher|Soulforge/i,
	Shield:	/aegis|buckler|shield|tome|Defender|Dragon Scale|Frost Tear Dagger|Harmony|Sword of Redemption|Terra's Guard|The Dreadnought|Purgatory|Zenarean Crest/i,
	Helmet:	/cowl|crown|helm|horns|mask|veil|Virtue of Fortitude/i,
	Gloves:	/gauntlet|glove|hand|bracer|fist|Slayer's Embrace|Soul Crusher|Soul Eater|Virtue of Temperance/i,
	Armor:	/armor|belt|chainmail|cloak|epaulets|gear|garb|pauldrons|plate|raiments|robe|tunic|vestment|Faerie Wings/i,
	Amulet:	/amulet|bauble|charm|crystal|eye|flask|insignia|jewel|lantern|memento|necklace|orb|pendant|shard|signet|soul|talisman|trinket|Heart of Elos|Mark of the Empire|Paladin's Oath|Poseidons Horn| Ring|Ring of|Ruby Ore|Terra's Heart|Thawing Star|Transcendence/i
};
*/

  // I know, I know, really verbose, but don't gripe unless it doesn't match
  // better than the short list above.  This is based on a generated list that
  // ensures the list has no outstanding mismatches or conflicts given all
  // known items as of a given date.

  // as of Tue Apr 12 11:25:28 2011 UTC
Town.blacksmith = {
      // Feral Staff is a multi-pass match:
      //   shield.11{Feral Staff}, weapon.5{Staff}
      // Frost Tear Dagger is a multi-pass match:
      //   shield.17{Frost Tear Dagger}, weapon.6{Dagger}
      // Ice Dagger is a multi-pass match:
      //   shield.10{Ice Dagger}, weapon.6{Dagger}
      // Sword of Redemption is a multi-pass match:
      //   shield.19{Sword of Redemption}, weapon.5{Sword}
    Weapon: new RegExp('(' +
      '\\baxe\\b' +				// 13
      '|\\bblades?\\b' +		// 27+1
      '|\\bbow\\b' +			// 8
      '|\\bclaw\\b' +			// 1
      '|\\bcleaver\\b' +		// 1
      '|\\bcudgel\\b' +			// 1
      '|\\bdagger\\b' +			// 8 (mismatches 2)
      '|\\bedge\\b' +			// 1
      '|\\bgreatsword\\b' +		// 2
      '|\\bgrinder\\b' +		// 1
      '|\\bhalberd\\b' +		// 1
      '|\\bhammer\\b' +			// 1
      '|\\bhellblade\\b' +		// 1
      '|\\bkatara\\b' +			// 1
      '|\\bkingblade\\b' +		// 1
      '|\\blance\\b' +			// 2
      '|\\blongsword\\b' +		// 1
      '|\\bmace\\b' +			// 6
      '|\\bmorningstar\\b' +	// 1
      '|\\brapier\\b' +			// 1
      '|\\brod\\b' +			// 2
      '|\\bsaber\\b' +			// 4
      '|\\bscepter\\b' +		// 1
      '|\\bshortsword\\b' +		// 1
      '|\\bspear\\b' +			// 3
      '|\\bstaff\\b' +			// 9 (mismatches 1)
      '|\\bstaves\\b' +			// 1
      '|\\bsword\\b' +			// 17 (mismatches 1)
      '|\\btalon\\b' +			// 1
      '|\\btrident\\b' +		// 2
      '|\\bwand\\b' +			// 3
      '|^Arachnid Slayer$' +
      '|^Atonement$' +
      '|^Avenger$' +
      '|^Bloodblade$' +
      '|^Bonecrusher$' +
      '|^Celestas Devotion$' +
      '|^Daedalus$' +
      '|^Death Dealer$' +
      '|^Deathbellow$' +
      '|^Deliverance$' +
      '|^Draganblade$' +
      '|^Dragonbane$' +
      '|^Excalibur$' +
      '|^Exsanguinator$' +
      '|^Heart of the Woods$' +
      '|^Holy Avenger$' +
      '|^Incarnation$' +
      '|^Inoculator$' +
      "|^Ironhart's Might$" +
      '|^Judgement$' +
      '|^Justice$' +
      '|^Lifebane$' +
      '|^Lightbringer$' +
      '|^Lion Fang$' +
      '|^Moonclaw$' +
      '|^Oathkeeper$' +
      "|^Oberon's Might$" +
      '|^Onslaught$' +
      '|^Path of the Tower$' +
      '|^Punisher$' +
      '|^Righteousness$' +
      '|^Scytheblade$' +
      '|^Soul Siphon$' +
      '|^Soulforge$' +
      '|^Stormcrusher$' +
      '|^Syrens Call$' +
      '|^The Disemboweler$' +
      '|^The Galvanizer$' +
      '|^The Reckoning$' +
      '|^Virtue of Justice$' +
      ')', 'i'),
    Shield: new RegExp('(' +
      '\\baegis\\b' +			// 4
      '|\\bbuckler\\b' +		// 1
      '|\\bdeathshield\\b' +	// 1
      '|\\bdefender\\b' +		// 5
      '|\\bprotector\\b' +		// 1
      '|\\bshield\\b' +			// 22
      '|\\btome\\b' +			// 4
      '|^Absolution$' +
      '|^Crest of the Griffin$' +
      '|^Dragon Scale$' +
      '|^Feral Staff$' +
      '|^Frost Tear Dagger$' +
      '|^Harmony$' +
      '|^Heart of the Pride$' +
      '|^Hour Glass$' +
      '|^Ice Dagger$' +
      '|^Illvasan Crest$' +
      '|^Purgatory$' +
      '|^Serenes Arrow$' +
      '|^Sword of Redemption$' +
      "|^Terra's Guard$" +
      '|^The Dreadnought$' +
      '|^Zenarean Crest$' +
      ')', 'i'),
    Armor: new RegExp('(' +
      '\\barmguard\\b' +		// 1
      '|\\barmor\\b' +			// 22
      '|\\bbattlegarb\\b' +		// 1
      '|\\bbattlegear\\b' +		// 4
      '|\\bbelt\\b' +			// 1
      '|\\bcarapace\\b' +		// 1
      '|\\bchainmail\\b' +		// 2
      '|\\bcloak\\b' +			// 7
      '|\\bepaulets\\b' +		// 1
      '|\\bgarb\\b' +			// 1
      '|\\bpauldrons\\b' +		// 1
      '|\\bplate\\b' +			// 32
      '|\\bplatemail\\b' +		// 2
      '|\\braiments\\b' +		// 5
      '|\\brobes?\\b' +			// 3+7
      '|\\btunic\\b' +			// 1
      '|\\bvestment\\b' +		// 1
      '|^Braving the Storm$' +
      '|^Castle Rampart$' +
      '|^Death Ward$' +
      '|^Deathrune Hellplate$' +
      '|^Faerie Wings$' +
      '|^Innocence$' +
      '|^Plated Earth$' +
      ')', 'i'),
    Helmet: new RegExp('(' +
      '\\bcowl\\b' +			// 1
      '|\\bcrown\\b' +			// 13
      '|\\bdoomhelm\\b' +		// 1
      '|\\bhelm\\b' +			// 38
      '|\\bhelmet\\b' +			// 2
      '|\\bhorns\\b' +			// 1
      '|\\bmane\\b' +			// 1
      '|\\bmask\\b' +			// 2
      '|\\btiara\\b' +			// 1
      '|\\bveil\\b' +			// 1
      '|^Virtue of Fortitude$' +
      ')', 'i'),
    Amulet: new RegExp('(' +
      '\\bamulet\\b' +			// 18
      '|\\bband\\b' +			// 2
      '|\\bbauble\\b' +			// 1
      '|\\bcharm\\b' +			// 2
      '|\\bcross\\b' +			// 1
      '|\\bearrings\\b' +		// 1
      '|\\beye\\b' +			// 3
      '|\\bflask\\b' +			// 1
      '|\\bheirloom\\b' +		// 1
      '|\\binsignia\\b' +		// 3
      '|\\bjewel\\b' +			// 3
      '|\\blantern\\b' +		// 1
      '|\\blocket\\b' +			// 2
      '|\\bmark\\b' +			// 1
      '|\\bmedallion\\b' +		// 1
      '|\\bmemento\\b' +		// 1
      '|\\bnecklace\\b' +		// 4
      '|\\bpendant\\b' +		// 11
      '|\\brelic\\b' +			// 1
      '|\\bring\\b' +			// 8
      '|\\bruby\\b' +			// 1
      '|\\bseal\\b' +			// 4
      '|\\bshard\\b' +			// 6
      '|\\bsignet\\b' +			// 8
      '|\\bsunstone\\b' +		// 1
      '|\\btalisman\\b' +		// 1
      '|\\btrinket\\b' +		// 2
      '|^Air Orb$' +
      '|^Blue Lotus Petal$' +
      '|^Crystal of Lament$' +
      '|^Dragon Ashes$' +
      '|^Earth Orb$' +
      '|^Force of Nature$' +
      '|^Gold Bar$' +
      '|^Heart of Elos$' +
      '|^Ice Orb$' +
      "|^Keira's Soul$" +
      '|^Lava Orb$' +
      '|^Magic Mushrooms$' +
      "|^Paladin's Oath$" +
      '|^Poseidons Horn$' +
      '|^Shadowmoon$' +
      '|^Silver Bar$' +
      '|^Soul Catcher$' +
      '|^Temptations Lure$' +
      "|^Terra's Heart$" +
      '|^Thawing Star$' +
      '|^Tooth of Gehenna$' +
      '|^Transcendence$' +
      '|^Tribal Crest$' +
      '|^Vincents Soul$' +
      ')', 'i'),
    Gloves: new RegExp('(' +
      '\\bbracer\\b' +			// 1
      '|\\bfists?\\b' +			// 1+1
      '|\\bgauntlets?\\b' +		// 10+4
      '|\\bgloves?\\b' +		// 2+2
      '|\\bhandguards\\b' +		// 1
      '|\\bhands?\\b' +			// 5+3
      '|^Natures Reach$' +
      '|^Poisons Touch$' +
      "|^Slayer's Embrace$" +
      '|^Soul Crusher$' +
      '|^Soul Eater$' +
      '|^Stormbinder$' +
      '|^Stormbringer$' +
      '|^Tempered Steel$' +
      '|^Virtue of Temperance$' +
      ')', 'i')
};

Town.setup = function() {
	Resources.use('Gold');
};

Town.init = function() {
	var now = Date.now(), i;

	this._watch(Player, 'data.worth');			// cash available
	this._watch(Player, 'data.army');			// current army size
	this._watch(Player, 'data.armymax');		// capped army size (player)
	this._watch(Generals, 'runtime.armymax');	// capped army size (generals)
	this._watch(Generals, 'data');				// general stats
	this._watch(Land, 'option.save_ahead');		// land reservation flag
	this._watch(Land, 'runtime.save_amount');	// land reservation amount
	this._watch(Page, 'data.town_soldiers');	// page freshness
	this._watch(Page, 'data.town_blacksmith');	// page freshness
	this._watch(Page, 'data.town_magic');		// page freshness
	this.set('runtime.cost_incr', 4);

	// map old local stale page variables to Page values
	if (!isUndefined(i = this.runtime.soldiers)) {
		if (isNumber(i) && i) {
			Page.setStale('town_soldiers', now);
		}
		this.set('runtime.soldiers');
	}
	if (!isUndefined(i = this.runtime.blacksmith)) {
		if (isNumber(i) && i) {
			Page.setStale('town_blacksmith', now);
		}
		this.set('runtime.blacksmith');
	}
	if (!isUndefined(i = this.runtime.magic)) {
		if (isNumber(i) && i) {
			Page.setStale('town_magic', now);
		}
		this.set('runtime.magic');
	}
};

  // .layout td >div:contains("Owned Items:")
  // .layout td >div div[style*="town_unit_bar."]
  // .layout td >div div[style*="town_unit_bar_owned."]
Town.parse = function(change) {
	var now = Date.now(), self = this, modify = false, tmp;
	if (Page.page === 'keep_stats') {
		// Only when it's our own keep and not someone elses
		if ($('.keep_attribute_section').length) {
			tmp = $('.statsT2 .statsTTitle:contains("UNITS")').not(function(a) {
				return !$(this).text().regex(/^\s*UNITS\s*$/im);
			});
			$('.statUnit', $(tmp).parent()).each(function(a, el) {
				var b = $('a img[src]', el);
				var i = ($(b).attr('src') || '').filepart();
				var n = ($(b).attr('title') || $(b).attr('alt') || '').trim();
				var c = $(el).text().regex(/\bX\s*(\d+)\b/im);
				n = self.qualify(n, i);
				if (!self.data[n]) {
					//log(LOG_WARN, 'missing unit: ' + n + ' (' + i + ')');
					Page.setStale('town_soldiers', now);
					return false;
				} else if (isNumber(c)) {
					self.set(['data', n, 'own'], c);
				}
			});

			tmp = $('.statsT2 .statsTTitle:contains("ITEMS")').not(function(a) {
				return !$(this).text().regex(/^\s*ITEMS\s*$/im);
			});
			$('.statUnit', $(tmp).parent()).each(function(a, el) {
				var b = $('a img[src]', el);
				var i = ($(b).attr('src') || '').filepart();
				var n = ($(b).attr('title') || $(b).attr('alt') || '').trim();
				var c = $(el).text().regex(/\bX\s*(\d+)\b/im);
				n = self.qualify(n, i); // names aren't unique for items
				if (!self.data[n] || self.data[n].img !== i) {
					//log(LOG_WARN, 'missing item: ' + n + ' (' + i + ')' + (self.data[n] ? ' img[' + self.data[n].img + ']' : ''));
					Page.setStale('town_blacksmith', now);
					Page.setStale('town_magic', now);
					return false;
				} else if (isNumber(c)) {
					self.set(['data', n, 'own'], c);
				}
			});
		}
	} else if (change && Page.page === 'town_blacksmith') {
		$('div[style*="town_unit_bar."],div[style*="town_unit_bar_owned."]').each(function(i,el) {
			var name = ($('div img[alt]', el).attr('alt') || '').trim(),
				icon = ($('div img[src]', el).attr('src') || '').filepart();
			name = self.qualify(name, icon);
			if (self.data[name] && self.data[name].type) {
				$('div strong:first', el).parent().append('<br>'+self.data[name].type);
			}
		});
	} else if (!change && (Page.page === 'town_soldiers' || Page.page === 'town_blacksmith' || Page.page === 'town_magic')) {
		var unit = this.data, page = Page.page.substr(5), purge = {}, changes = 0, i, j, cost_adj = 1;
		for (i in unit) {
			if (unit[i].page === page) {
				purge[i] = true;
			}
		}
		// undo cost reduction general values on the magic page
		if (page === 'magic' && (i = Generals.get(Player.get('general')))) {
			if (i.stats && isNumber(j = i.stats.cost)) {
				cost_adj = 100 / (100 - j);
			}
		}
		$('div[style*="town_unit_bar."],div[style*="town_unit_bar_owned."]').each(function(a,el) {
			try {
				var i, j, type, match, maxlen = 0,
					name = ($('div img[alt]', el).attr('alt') || '').trim(),
					icon = ($('div img[src]', el).attr('src') || '').filepart(),
					cost = parseInt(($('div strong.gold', el).text() || '').replace(/\D/g, '') || 0, 10),
					own = ($('div div:contains("Owned:")', el).text() || '').regex(/\bOwned:\s*(\d+)\b/i) || 0,
					atk = ($('div div div:contains("Attack")', el).text() || '').regex(/\b(\d+)\s+Attack\b/) || 0,
					def = ($('div div div:contains("Defense")', el).text() || '').regex(/\b(\d+)\s+Defense\b/i) || 0,
					upkeep = parseInt(($('div div:contains("Upkeep:") span.negative', el).text() || '').replace(/\D/g, '') || 0, 10);
				self._transaction(); // BEGIN TRANSACTION
				name = self.qualify(name, icon);
				delete purge[name];
				self.set(['data',name,'page'], page);
				self.set(['data',name,'img'], icon);
				self.set(['data',name,'own'], own);
				Resources.add('_'+name, own, true);
				self.set(['data',name,'att'], atk);
				self.set(['data',name,'def'], def);
				self.set(['data',name,'tot_att'], atk + (0.7 * def));
				self.set(['data',name,'tot_def'], def + (0.7 * atk));
				self.set(['data',name,'cost'], cost ? Math.round(cost_adj * cost) : undefined);
				self.set(['data',name,'upkeep'], upkeep ? upkeep : undefined);
//				self.set(['data',name,'id'], null);
				self.set(['data',name,'buy']);
				if ((tmp = $('form[id*="_itemBuy_"]', el)).length) {
					self.set(['data',name,'id'], tmp.attr('id').regex(/_itemBuy_(\d+)/i), 'number');
					$('select[name="amount"] option', tmp).each(function(b, el) {
						self.push(['data',name,'buy'], parseInt($(el).val(), 10), 'number')
					});
				}
				self.set(['data',name,'sell']);
				if ((tmp = $('form[id*="_itemSell_"]', el)).length) {
					self.set(['data',name,'id'], tmp.attr('id').regex(/_itemSell_(\d+)/i), 'number');
					$('select[name="amount"] option', tmp).each(function(b, el) {
						self.push(['data',name,'sell'], parseInt($(el).val(), 10), 'number')
					});
				}
				if (page === 'blacksmith') {
					for (i in self.blacksmith) {
						if ((match = name.match(self.blacksmith[i]))) {
							if (match[1].length > maxlen) {
								type = i;
								maxlen = match[1].length;
							}
						}
					}
					self.set(['data',name,'type'], type);
				}
				self._transaction(true); // COMMIT TRANSACTION
				changes++; // this must come after the transaction
			} catch(e) {
				self._transaction(false); // ROLLBACK TRANSACTION on any error
				log(LOG_ERROR, e.name + ' in ' + this.name + '.parse(' + change + '): ' + e.message);
			}
		});

		// if nothing at all changed above, something went wrong on the page download
		if (changes) {
			for (i in purge) {
				if (purge[i]) {
					log(LOG_WARN, 'Purge: ' + i);
					this.set(['data',i]);
					changes++;
				}
			}
		}

		// trigger the item type caption pass
		if (Page.page === 'town_blacksmith') {
		    modify = true;
		}
	}

	return modify;
};

Town.getInvade = function(army, suffix) {
	var att = 0, def = 0, data = this.get('data');
	if (!suffix) { suffix = ''; }
	att += getAttDef(data, function(list,i,units){if (units[i].page==='soldiers'){list.push(i);}}, 'att', army, 'invade', suffix);
	def += getAttDef(data, null, 'def', army, 'invade', suffix);
	att += getAttDef(data, function(list,i,units){if (units[i].type && units[i].type !== 'Weapon'){list.push(i);}}, 'att', army, 'invade', suffix);
	def += getAttDef(data, null, 'def', army, 'invade', suffix);
	att += getAttDef(data, function(list,i,units){if (units[i].type === 'Weapon'){list.push(i);}}, 'att', army, 'invade', suffix);
	def += getAttDef(data, null, 'def', army, 'invade', suffix);
	att += getAttDef(data, function(list,i,units){if (units[i].page === 'magic'){list.push(i);}}, 'att', army, 'invade', suffix);
	def += getAttDef(data, null, 'def', army, 'invade', suffix);
	return {attack:att, defend:def};
};

Town.getDuel = function() {
	var att = 0, def = 0, data = this.get('data');
	att += getAttDef(data, function(list,i,units){if (units[i].type === 'Weapon'){list.push(i);}}, 'att', 1, 'duel');
	def += getAttDef(data, null, 'def', 1, 'duel');
	att += getAttDef(data, function(list,i,units){if (units[i].page === 'magic'){list.push(i);}}, 'att', 1, 'duel');
	def += getAttDef(data, null, 'def', 1, 'duel');
	att += getAttDef(data, function(list,i,units){if (units[i].type === 'Shield'){list.push(i);}}, 'att', 1, 'duel');
	def += getAttDef(data, null, 'def', 1, 'duel');
	att += getAttDef(data, function(list,i,units){if (units[i].type === 'Helmet'){list.push(i);}}, 'att', 1, 'duel');
	def += getAttDef(data, null, 'def', 1, 'duel');
	att += getAttDef(data, function(list,i,units){if (units[i].type === 'Gloves'){list.push(i);}}, 'att', 1, 'duel');
	def += getAttDef(data, null, 'def', 1, 'duel');
	att += getAttDef(data, function(list,i,units){if (units[i].type === 'Armor'){list.push(i);}}, 'att', 1, 'duel');
	def += getAttDef(data, null, 'def', 1, 'duel');
	att += getAttDef(data, function(list,i,units){if (units[i].type === 'Amulet'){list.push(i);}}, 'att', 1, 'duel');
	def += getAttDef(data, null, 'def', 1, 'duel');
	return {attack:att, defend:def};
};

Town.getWar = function() {
	var att = 0, def = 0, data = this.get('data');
	att += getAttDef(data, function(list,i,units){if (units[i].type === 'Weapon'){list.push(i);}}, 'att', -7, 'war');
	def += getAttDef(data, null, 'def', -7, 'war');
	att += getAttDef(data, function(list,i,units){if (units[i].type === 'Shield'){list.push(i);}}, 'att', -7, 'war');
	def += getAttDef(data, null, 'def', -7, 'war');
	att += getAttDef(data, function(list,i,units){if (units[i].type === 'Armor'){list.push(i);}}, 'att', -7, 'war');
	def += getAttDef(data, null, 'def', -7, 'war');
	att += getAttDef(data, function(list,i,units){if (units[i].type === 'Helmet'){list.push(i);}}, 'att', -7, 'war');
	def += getAttDef(data, null, 'def', -7, 'war');
	att += getAttDef(data, function(list,i,units){if (units[i].type === 'Amulet'){list.push(i);}}, 'att', -7, 'war');
	def += getAttDef(data, null, 'def', -7, 'war');
	att += getAttDef(data, function(list,i,units){if (units[i].type === 'Gloves'){list.push(i);}}, 'att', -7, 'war');
	def += getAttDef(data, null, 'def', -7, 'war');
	att += getAttDef(data, function(list,i,units){if (units[i].page === 'magic'){list.push(i);}}, 'att', -7, 'war');
	def += getAttDef(data, null, 'def', -7, 'war');
	return {attack:att, defend:def};
};

Town.update = function(event, events) {
	var now = Date.now(), i, j, k, p, u, need, want, have, best_buy = null, buy_pref = 0, best_sell = null, sell_pref = 0, best_quest = false, buy = 0, sell = 0, cost, upkeep,
		data = this.data,
		maxincome = Player.get('maxincome', 1, 'number'), // used as a divisor
		upkeep = Player.get('upkeep', 0, 'number'),
		// largest possible army, including bonus generals
		armymax = Math.max(541, Generals.get('runtime.armymax', 1, 'number')),
		// our army size, capped at the largest possible army size above
		army = Math.min(armymax, Math.max(Generals.get('runtime.army', 1, 'number'), Player.get('armymax', 1, 'number'))),
		max_buy = 0, max_sell = 0, resource, fixed_cost, max_cost, keep,
		land_buffer = (Land.get('option.save_ahead') && Land.get('runtime.save_amount', 0, 'number')) || 0,
		incr = this.runtime.cost_incr || 4,
		info_str, buy_str = '', sell_str = '', net_cost = 0, net_upkeep = 0;

	fixed_cost = ({
	    '$0':   0,
		'$10k': 1e4,
		'$100k':1e5,
		'$1m':  1e6,
		'$10m': 1e7,
		'$100m':1e8,
		'$1b':  1e9,
		'$10b': 1e10,
		'$100b':1e11,
		'$1t':  1e12,
		'$10t': 1e13,
		'$100t':1e14,
		'INCR': Math.pow(10,incr)
	})[this.option.maxcost] || 0;

	switch (this.option.number) {
		case 'Army':
			max_buy = max_sell = army;
			break;
		case 'Army+':
			max_buy = army;
			max_sell = armymax;
			break;
		case 'Max Army':
			max_buy = max_sell = armymax;
			break;
		default:
			max_buy = 0;
			max_sell = army;
			break;
	}

	// These three fill in all the data we need for buying / sellings items
	this.set(['runtime','invade'], this.getInvade(max_buy));
	this.set(['runtime','duel'], this.getDuel());
	this.set(['runtime','war'], this.getWar());

	// Set up a keep set for future army sizes
	keep = {};
	if (army < max_sell) {
		this.getInvade(max_sell, max_sell.toString());
		i = 'invade' + max_sell + '_att';
		j = 'invade' + max_sell + '_def';
		for (u in data) {
			if ((p = Resources.get(['data','_'+u]))) {
				need = 0;
				if (this.option.units !== 'Best Defense') {
					need = Math.max(need, Math.min(max_sell, Math.max(p[i] || 0, p.duel_att || 0, p.war_att || 0)));
				}
				if (this.option.units !== 'Best Offense') {
					need = Math.max(need, Math.min(max_sell, Math.max(p[j] || 0, p.duel_def || 0, p.war_def || 0)));
				}
				if ((keep[u] || 0) < need && data[u].sell && data[u].sell.length) {
					keep[u] = need;
				}
				Resources.set(['data','_'+u,i]);
				Resources.set(['data','_'+u,j]);
			}
		}
	}

	// For all items / units
	// 1. parse through the list of buyable items of each type
	// 2. find the one with Resources.get(_item.invade_att) the highest (that's the number needed to hit 541 items in total)
	// 3. buy enough to get there
	// 4. profit (or something)...
	for (u in data) {
		p = Resources.get(['data','_'+u]) || {};
		want = 0;
		if (p.quest) {
			if (this.option.quest_buy) {
				want = Math.max(want, p.quest);
			}
			// add quest counts to the keep set
			if ((keep[u] || 0) < p.quest) {
				keep[u] = p.quest;
			}
		}
		if (isNumber(p.generals)) {
			if (this.option.generals_buy) {
				want = Math.max(want, p.generals);
			}
			// add general item counts to the keep set
			if ((keep[u] || 0) < (p.generals || 1e99)) {
				// Don't sell them unless we know for sure that the general can't use them all
				keep[u] = p.generals || 1e99;
			}
		}
		have = data[u].own || 0;
		need = 0;
		if (this.option.units !== 'Best Defense') {
			need = Math.range(need, Math.max(p.invade_att || 0, p.duel_att || 0, p.war_att || 0), max_buy);
		}
		if (this.option.units !== 'Best Offense') {
			need = Math.range(need, Math.max(p.invade_def || 0, p.duel_def || 0, p.war_def || 0), max_buy);
		}
		if (want > have) {// If we're buying for a quest item then we're only going to buy that item first - though possibly more than specifically needed
			max_cost = 1e99; // arbitrarily high value
			need = want;
		} else {
			max_cost = fixed_cost;
		}

//			log(LOG_WARN, 'Item: '+u+', need: '+need+', want: '+want);
		if (need > have) { // Want to buy more                                
			if (!best_quest && data[u].buy && data[u].buy.length) {
				if (data[u].cost <= max_cost && this.option.upkeep >= (((Player.get('upkeep') + ((data[u].upkeep || 0) * (i = data[u].buy.lower(need - have)))) / Player.get('maxincome')) * 100) && i > 1 && (!best_buy || need > buy)) {
//						log(LOG_WARN, 'Buy: '+need);
					best_buy = u;
					buy = have + i; // this.buy() takes an absolute value
					buy_pref = Math.max(need, want);
					if (want && want > have) {// If we're buying for a quest item then we're only going to buy that item first - though possibly more than specifically needed
						best_quest = true;
					}
				}
			}
		} else if (max_buy && this.option.sell && Math.max(need,want) < have && data[u].sell && data[u].sell.length) {// Want to sell off surplus (but never quest stuff)
			need = data[u].sell.lower(have - (i = Math.max(need,want,keep[u] || 0)));
			if (need > 0 && (!best_sell || data[u].cost > data[best_sell].cost)) {
//				log(LOG_WARN, 'Sell: '+need);
				best_sell = u;
				sell = need;
				sell_pref = i;
			}
		}
	}

	if (best_sell) {// Sell before we buy
		best_buy = null;
		buy = 0;
		upkeep = sell * (data[best_sell].upkeep || 0);
		Dashboard.status(this, (this.option._disabled ? 'Would sell ' : 'Selling ') + sell + ' &times; ' + best_sell + ' for ' + makeImage('gold') + '$' + (sell * data[best_sell].cost / 2).SI() + (upkeep ? ' (Upkeep: -$' + upkeep.SI() + ')': '') + (sell_pref < data[best_sell].own ? ' [' + data[best_sell].own + '/' + sell_pref + ']': ''));
	} else if (best_buy){
		best_sell = null;
		sell = 0;
		cost = (buy - data[best_buy].own) * data[best_buy].cost;
		upkeep = (buy - data[best_buy].own) * (data[best_buy].upkeep || 0);
		if (land_buffer && !Bank.worth(land_buffer)) {
			Dashboard.status(this, '<i>Deferring to Land</i>');
		} else if (Bank.worth(this.runtime.cost + land_buffer)) {
			Dashboard.status(this, (this.option._disabled ? 'Would buy ' : 'Buying ') + (buy - data[best_buy].own) + ' &times; ' + best_buy + ' for ' + makeImage('gold') + '$' + cost.SI() + (upkeep ? ' (Upkeep: $' + upkeep.SI() + ')' : '') + (buy_pref > data[best_buy].own ? ' [' + data[best_buy].own + '/' + buy_pref + ']' : ''));
		} else {
			Dashboard.status(this, 'Waiting for ' + makeImage('gold') + '$' + (this.runtime.cost + land_buffer - Bank.worth()).SI() + ' to buy ' + (buy - data[best_buy].own) + ' &times; ' + best_buy + ' for ' + makeImage('gold') + '$' + cost.SI());
		}
	} else {
		if (this.option.maxcost === 'INCR'){
			this.set(['runtime','cost_incr'], incr === 14 ? 4 : incr + 1);
			this.set(['runtime','check'], now + 3600000);
		} else {
			this.set(['runtime','cost_incr'], null);
			this.set(['runtime','check'], null);
		}
		Dashboard.status(this);
	}
	this.set(['runtime','best_buy'], best_buy);
	this.set(['runtime','buy'], best_buy ? data[best_buy].buy.lower(buy - data[best_buy].own) : 0);
	this.set(['runtime','best_sell'], best_sell);
	this.set(['runtime','sell'], sell);
	this.set(['runtime','cost'], best_buy ? this.runtime.buy * data[best_buy].cost : 0);

	this.set(['option','_sleep'],
	  !this.runtime.best_sell &&
	  !(this.runtime.best_buy && Bank.worth(this.runtime.cost + land_buffer)) &&
	  !Page.isStale('town_soldiers') &&
	  !Page.isStale('town_blacksmith') &&
	  !Page.isStale('town_magic'));

	return true;
};

Town.work = function(state) {
	var i;
	if (state) {
		if (this.runtime.best_sell){
			this.sell(this.runtime.best_sell, this.runtime.sell);
		} else if (this.runtime.best_buy && Bank.worth(this.runtime.cost - ((Land.get('option.save_ahead', false) && Land.get('runtime.save_amount', 0)) || 0))){
			this.buy(this.runtime.best_buy, this.runtime.buy);
		} else if (!Page.data[i = 'town_soldiers'] || !Page.data[i = 'town_blacksmith'] || !Page.data[i = 'town_magic']) {
			Page.to(i);
		} else if (!Page.stale('town_soldiers', this.get('runtime.soldiers', 0), true)) {
			this.set('runtime.soldiers', 86400);
		} else if (!Page.stale('town_blacksmith', this.get('runtime.blacksmith', 0), true)) {
			this.set('runtime.blacksmith', 86400);
		} else if (!Page.stale('town_magic', this.get('runtime.magic', 0), true)) {
			this.set('runtime.magic', 86400);
		}
	}
	return QUEUE_CONTINUE;
};

Town.buy = function(item, number) { // number is absolute including already owned
	this._unflush();
	if (!this.data[item] || !this.data[item].id || !this.data[item].buy || !this.data[item].buy.length || !Bank.worth(this.runtime.cost)) {
		return true; // We (pretend?) we own them
	}
	if (!Generals.to(this.option.general ? 'cost' : 'any') || !Bank.retrieve(this.runtime.cost) || !Page.to('town_'+this.data[item].page)) {
		return false;
	}
	var qty = this.data[item].buy.lower(number);
	var $form = $('form#app46755028429_itemBuy_' + this.data[item].id);
	if ($form.length) {
		log(LOG_WARN, 'Buying ' + qty + ' x ' + item + ' for $' + (qty * Town.data[item].cost).addCommas());
		$('select[name="amount"]', $form).val(qty);
		Page.click($('input[name="Buy"]', $form));
	}
	this.set(['runtime','cost_incr'], 4);
	return false;
};

Town.sell = function(item, number) { // number is absolute including already owned
	this._unflush();
	if (!this.data[item] || !this.data[item].id || !this.data[item].sell || !this.data[item].sell.length) {
		return true;
	}
	if (!Page.to('town_'+this.data[item].page)) {
		return false;
	}
	var qty = this.data[item].sell.lower(number);
	var $form = $('form#app46755028429_itemSell_' + this.data[item].id);
	if ($form.length) {
		log(LOG_WARN, 'Selling ' + qty + ' x ' + item + ' for $' + (qty * Town.data[item].cost / 2).addCommas());
		$('select[name="amount"]', $form).val(qty);
		Page.click($('input[name="Sell"]', $form));
	}
	this.set(['runtime','cost_incr'], 4);
	return false;
};

format_unit_str = function(name) {
    var i, j, k, n, m, p, s, str;

	if (name && ((p = Town.get(['data',name])) || (p = Generals.get(['data',name])))) {
		str = name;

		j = p.att || 0;
		k = p.def || 0;

		s = '';
		if ((m = (p.stats && p.stats.att) || 0) > 0) {
			s += j + '+' + m;
		} else if (m < 0) {
			s += j + m;
		} else {
			s += j;
		}
		j += m;

		s += '/';
		if ((n = (p.stats && p.stats.def) || 0) > 0) {
			s += k + '+' + n;
		} else if (n < 0) {
			s += k + n;
		} else {
			s += k;
		}
		k += n;

		if (m || n) {
			s = '<span style="color:green;" title="' + s + '">';
		} else {
			s = '';
		}

		str += ' (' + s + j + '/' + k + (s ? '</span>' : '') + ')';

		if ((n = p.cost)) {
			str += ' <span style="color:blue;">$' + n.SI() + '</span>';
		}

		if ((n = p.upkeep)) {
			str += ' <span style="color:red;">$' + n.SI() + '/hr</span>';
		}
	} else {
		log(LOG_WARN, '# format_unit_str(' + name + ') not found!');
    }

    return str;
};

var makeTownDash = function(list, unitfunc, x, type, name, count) { // Find total att(ack) or def(ense) value from a list of objects (with .att and .def)
	var units = [], output = [], i, o, p,
		order = {
			Weapon:1,
			Shield:2,
			Helmet:3,
			Armor:4,
			Amulet:5,
			Gloves:6,
			Magic:7
		};

	if (name) {
		output.push('<div class="golem-panel">');
		output.push('<h3 class="golem-panel-header" style="width:auto;">');
		output.push(name);
		output.push('</h3>');
		output.push('<div class="golem-panel-content">');
	}

	for (i in list) {
		unitfunc(units, i, list);
	}

	if ((o = list[units[0]])) {
		if (type === 'duel' && o.type) {
			units.sort(function(a,b) {
				return order[list[a].type] - order[list[b].type]
					|| (list[a].upkeep || 0) - (list[b].upkeep || 0)
					|| (list[a].cost || 0) - (list[b].cost || 0);
			});
		} else {
			units.sort(function(a,b) {
				return (list[b]['tot_'+x] - list[a]['tot_'+x])
					|| (list[a].upkeep || 0) - (list[b].upkeep || 0)
					|| (list[a].cost || 0) - (list[b].cost || 0);
			});
		}
	}
	for (i=0; i<(count ? count : units.length); i++) {
		p = list[units[i]];
		if ((o && o.skills) || (p.use && p.use[type+'_'+x])) {
			output.push('<div style="height:25px;margin:1px;">');
			output.push('<img src="' + imagepath + p.img + '"');
			output.push(' style="width:25px;height:25px;float:left;margin-right:4px;">');
			output.push(' ');
			if (p.use) {
				output.push(p.use[type+'_'+x]+' &times; ');
			}
			output.push(format_unit_str(units[i]));
			output.push('</div>');
		}
	}

	if (name) {
		output.push('</div></div>');
	}

	return output.join('');
};

Town.dashboard = function() {
	var lset = [], rset = [], generals = Generals.get(), best, tmp;

	// invade

	// prepare a short list of items being used
	tmp = {};
	for (i in this.data) {
	    if (this.data[i].use && this.data[i].use.invade_att) {
		tmp[i] = this.data[i];
	    }
	}

	lset.push('<div class="golem-panel">');
	lset.push('<h3 class="golem-panel-header" style="width:auto;">');
	lset.push('Invade - Attack');
	lset.push('</h3>');
	lset.push('<div class="golem-panel-content" style="padding:8px;">');
	lset.push(makeTownDash(generals, function(list, i, units) {
			if (units[i].own) {
				list.push(i);
			}
		}, 'att', 'invade', 'Heroes'));
	lset.push(makeTownDash(tmp, function(list, i, units) {
			if (units[i].page === 'soldiers') {
				list.push(i);
			}
		}, 'att', 'invade', 'Soldiers'));
	lset.push(makeTownDash(tmp, function(list, i, units) {
			if (units[i].type === 'Weapon') {
				list.push(i);
			}
		}, 'att', 'invade', 'Weapons'));
	lset.push(makeTownDash(tmp, function(list, i, units) {
			if (units[i].page === 'blacksmith' && units[i].type !== 'Weapon') {
				list.push(i);
			}
		}, 'att', 'invade', 'Equipment'));
	lset.push(makeTownDash(tmp, function(list, i, units) {
			if (units[i].page === 'magic') {
				list.push(i);
			}
		}, 'att', 'invade', 'Magic'));
	lset.push('</div></div>');

	// prepare a short list of items being used
	tmp = {};
	for (i in this.data) {
	    if (this.data[i].use && this.data[i].use.invade_def) {
		tmp[i] = this.data[i];
	    }
	}

	rset.push('<div class="golem-panel">');
	rset.push('<h3 class="golem-panel-header" style="width:auto;">');
	rset.push('Invade - Defend');
	rset.push('</h3>');
	rset.push('<div class="golem-panel-content" style="padding:8px;">');
	rset.push(makeTownDash(generals, function(list, i, units) {
			if (units[i].own) {
				list.push(i);
			}
		}, 'def', 'invade', 'Heroes'));
	rset.push(makeTownDash(tmp, function(list, i, units) {
			if (units[i].page === 'soldiers') {
				list.push(i);
			}
		}, 'def', 'invade', 'Soldiers'));
	rset.push(makeTownDash(tmp, function(list, i, units) {
			if (units[i].type === 'Weapon') {
				list.push(i);
			}
		}, 'def', 'invade', 'Weapons'));
	rset.push(makeTownDash(tmp, function(list, i, units) {
			if (units[i].page === 'blacksmith' && units[i].type !== 'Weapon') {
				list.push(i);
			}
		}, 'def', 'invade', 'Equipment'));
	rset.push(makeTownDash(tmp, function(list, i, units) {
			if (units[i].page === 'magic') {
				list.push(i);
			}
		}, 'def', 'invade', 'Magic'));
	rset.push('</div></div>');
	
	// duel

	// prepare a short list of items being used
	tmp = {};
	for (i in this.data) {
	    if (this.data[i].use && this.data[i].use.duel_att) {
		tmp[i] = this.data[i];
	    }
	}

	lset.push('<div class="golem-panel">');
	lset.push('<h3 class="golem-panel-header" style="width:auto;">');
	lset.push('Duel - Attack');
	lset.push('</h3>');
	lset.push('<div class="golem-panel-content" style="padding:8px;">');
	if ((best = Generals.best('duel')) !== 'any') {
		lset.push('<div style="height:25px;margin:1px;">');
		lset.push('<img src="' + imagepath + generals[best].img + '"');
		lset.push(' style="width:25px;height:25px;float:left;margin-right:4px;">');
		lset.push(format_unit_str(best));
		lset.push('</div>');
	}
	lset.push(makeTownDash(tmp, function(list, i, units) {
			if (units[i].page === 'blacksmith') {
				list.push(i);
			}
		}, 'att', 'duel'));
	lset.push(makeTownDash(tmp, function(list, i, units) {
			if (units[i].page === 'magic') {
				list.push(i);
			}
		}, 'att', 'duel'));
	lset.push('</div></div>');
	
	// prepare a short list of items being used
	tmp = {};
	for (i in this.data) {
	    if (this.data[i].use && this.data[i].use.duel_def) {
		tmp[i] = this.data[i];
	    }
	}

	rset.push('<div class="golem-panel">');
	rset.push('<h3 class="golem-panel-header" style="width:auto;">');
	rset.push('Duel - Defend');
	rset.push('</h3>');
	rset.push('<div class="golem-panel-content" style="padding:8px;">');
	if ((best = Generals.best('defend')) !== 'any') {
		rset.push('<div style="height:25px;margin:1px;">');
		rset.push('<img src="' + imagepath + generals[best].img + '"');
		rset.push(' style="width:25px;height:25px;float:left;margin-right:4px;">');
		rset.push(format_unit_str(best));
		rset.push('</div>');
	}
	rset.push(makeTownDash(tmp, function(list, i, units) {
			if (units[i].page === 'blacksmith') {
				list.push(i);
			}
		}, 'def', 'duel'));
	rset.push(makeTownDash(tmp, function(list, i, units) {
			if (units[i].page === 'magic') {
				list.push(i);
			}
		}, 'def', 'duel'));
	rset.push('</div></div>');

	// war

	// prepare a short list of items being used
	tmp = {};
	for (i in this.data) {
	    if (this.data[i].use && this.data[i].use.war_att) {
		tmp[i] = this.data[i];
	    }
	}

	lset.push('<div class="golem-panel">');
	lset.push('<h3 class="golem-panel-header" style="width:auto;">');
	lset.push('War - Attack');
	lset.push('</h3>');
	lset.push('<div class="golem-panel-content" style="padding:8px;">');
	lset.push(makeTownDash(generals, function(list, i, units) {
			if (units[i].own) {
				list.push(i);
			}
		}, 'att', 'war', 'Heroes', 6));
	lset.push(makeTownDash(tmp, function(list, i, units) {
			if (units[i].type === 'Weapon') {
				list.push(i);
			}
		}, 'att', 'war', 'Weapons'));
	lset.push(makeTownDash(tmp, function(list, i, units) {
			if (units[i].type === 'Shield') {
				list.push(i);
			}
		}, 'att', 'war', 'Shield'));
	lset.push(makeTownDash(tmp, function(list, i, units) {
			if (units[i].type === 'Armor') {
				list.push(i);
			}
		}, 'att', 'war', 'Armor'));
	lset.push(makeTownDash(tmp, function(list, i, units) {
			if (units[i].type === 'Helmet') {
				list.push(i);
			}
		}, 'att', 'war', 'Helmet'));
	lset.push(makeTownDash(tmp, function(list, i, units) {
			if (units[i].type === 'Amulet') {
				list.push(i);
			}
		}, 'att', 'war', 'Amulet'));
	lset.push(makeTownDash(tmp, function(list, i, units) {
			if (units[i].type === 'Gloves') {
				list.push(i);
			}
		}, 'att', 'war', 'Gloves'));
	lset.push(makeTownDash(tmp, function(list, i, units) {
			if (units[i].page === 'magic') {
				list.push(i);
			}
		}, 'att', 'war', 'Magic'));
	lset.push('</div></div>');

	// prepare a short list of items being used
	tmp = {};
	for (i in this.data) {
	    if (this.data[i].use && this.data[i].use.war_def) {
		tmp[i] = this.data[i];
	    }
	}

	rset.push('<div class="golem-panel">');
	rset.push('<h3 class="golem-panel-header" style="width:auto;">');
	rset.push('War - Defend');
	rset.push('</h3>');
	rset.push('<div class="golem-panel-content" style="padding:8px;">');
	rset.push(makeTownDash(generals, function(list, i, units) {
			if (units[i].own) {
				list.push(i);
			}
		}, 'def', 'war', 'Heroes', 6));
	rset.push(makeTownDash(tmp, function(list, i, units) {
			if (units[i].type === 'Weapon') {
				list.push(i);
			}
		}, 'def', 'war', 'Weapons'));
	rset.push(makeTownDash(tmp, function(list, i, units) {
			if (units[i].type === 'Shield') {
				list.push(i);
			}
		}, 'def', 'war', 'Shield'));
	rset.push(makeTownDash(tmp, function(list, i, units) {
			if (units[i].type === 'Armor') {
				list.push(i);
			}
		}, 'def', 'war', 'Armor'));
	rset.push(makeTownDash(tmp, function(list, i, units) {
			if (units[i].type === 'Helmet') {
				list.push(i);
			}
		}, 'def', 'war', 'Helmet'));
	rset.push(makeTownDash(tmp, function(list, i, units) {
			if (units[i].type === 'Amulet') {
				list.push(i);
			}
		}, 'def', 'war', 'Amulet'));
	rset.push(makeTownDash(tmp, function(list, i, units) {
			if (units[i].type === 'Gloves') {
				list.push(i);
			}
		}, 'def', 'war', 'Gloves'));
	rset.push(makeTownDash(tmp, function(list, i, units) {
			if (units[i].page === 'magic') {
				list.push(i);
			}
		}, 'def', 'war', 'Magic'));
	rset.push('</div></div>');
	
	// div wrappers

	lset.unshift('<div style="float:left;width:50%;">');
	lset.push('</div>');

	rset.unshift('<div style="float:left;width:50%;">');
	rset.push('</div>');

	$('#golem-dashboard-Town').html(lset.join('') + rset.join(''));
};

Town.qualify = function(name, icon) {
	var p;

	if (isString(name)) {
		// if name already has a qualifier, peel it off
		if ((p = name.search(/\s*\(/m)) >= 0) {
			name = name.substr(0, p).trim();
		}

		// if an icon is provided, use it to further qualify the name
		if (isString(icon)) {
			if (isObject(p = this.dup_map[name]) && (icon in p)) {
				name = p[icon];
			}
		}
	}

	return name;
};

Town.dup_map = {
	'Earth Shard': { // Alchemy
		'gift_earth_1.jpg':	'Earth Shard (1)',
		'gift_earth_2.jpg':	'Earth Shard (2)',
		'gift_earth_3.jpg':	'Earth Shard (3)',
		'gift_earth_4.jpg':	'Earth Shard (4)'
	},
	'Elven Crown': { // Helmet
		'gift_aeris_complete.jpg':	'Elven Crown (Aeris)',
		'eq_sylvanus_crown.jpg':	'Elven Crown (Sylvanas)'
	},
	'Green Emerald Shard': { // Alchemy
		'mystery_armor_emerald_1.jpg': 'Green Emerald Shard (1)',
		'mystery_armor_emerald_2.jpg': 'Green Emerald Shard (2)'
	},
	'Maelstrom': { // Magic
		'magic_maelstrom.jpg':		'Maelstrom (Marina)',
		'eq_valhalla_spell.jpg':	'Maelstrom (Valhalla)'
	}
};
/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page, Queue, Resources,
	Battle, Generals, LevelUp, Player,
	APP, APPID, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, Divisor, length, sum, findInObject, objectIndex, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
	makeImage
*/
/********** Worker.Upgrade **********
* Spends upgrade points
*/
var Upgrade = new Worker('Upgrade');
Upgrade.data = Upgrade.temp = null;

Upgrade.settings = {
	taint:true
};

Upgrade.defaults['castle_age'] = {
	pages:'keep_stats'
};

Upgrade.option = {
	order:[]
};

Upgrade.runtime = {
	working:false,
	run:0
};

Upgrade.display = [
	{
		label:'Points will be allocated in this order, add multiple entries if wanted (ie, 3x Attack and 1x Defense would put &frac34; on Attack and &frac14; on Defense)'
	},{
		id:'order',
		multiple:['Energy', 'Stamina', 'Attack', 'Defense', 'Health']
	}
];

Upgrade.init = function() {
	this._watch(Player, 'data.upgrade');
};

Upgrade.parse = function(change) {
	var result = $('div.results');
	if (this.runtime.working && result.length && result.text().match(/You just upgraded your/i)) {
		this.set('runtime.working', false);
		this.set(['runtime','run'], this.runtime.run + 1);
	}
	return false;
};

Upgrade.update = function(event) {
	if (this.runtime.run >= this.option.order.length) {
		this.set(['runtime','run'], 0);
	}
	var points = Player.get('upgrade'), args;
	this.set('option._sleep', !this.option.order.length || Player.get('upgrade') < (this.option.order[this.runtime.run]==='Stamina' ? 2 : 1));
};

Upgrade.work = function(state) {
	var args = ({Energy:'energy_max', Stamina:'stamina_max', Attack:'attack', Defense:'defense', Health:'health_max'})[this.option.order[this.runtime.run]];
	if (!args) {
		this.set(['runtime','run'], this.runtime.run + 1);
	} else if (state) {
		this.set(['runtime','working'], true);
		Page.to('keep_stats', {upgrade:args}, true);
	}
	return QUEUE_RELEASE;
};

/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page, Queue, Resources,
	Battle, Generals, LevelUp, Player,
	APP, APPID, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, Divisor, length, sum, findInObject, objectIndex, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
	makeImage
*/
/********** Worker.FP **********
* Automatically buys FP refills
*/
var FP = new Worker('FP');
FP.temp = null;

FP.settings = {
	advanced:true,
	taint:true
};

FP.defaults['castle_age'] = {
	pages:'index oracle_oracle'
};

FP.option = {
	type:'stamina',
	general_choice:'any',
	xp:2800,
	times:0,
	fps:100,
	stat:10
};

FP.display = [
	{
		title:'Important!',
		label:'If Times per Level > 0, this will SPEND FAVOR POINTS!  Use with care.  No guarantee of any kind given.  No refunds.'
	},{
		id:'times',
		label:'Times per level ',
		text:true,
		help:'Never refill more than this many times per level.'
	},{
		id:'general',
		label:'Use General',
//		require:'general=="Manual"',
		select:'generals'
	},{
		id:'type',
		label:'Refill ',
		select:['energy','stamina'],
		help:'Select which resource you want to refill.'
	},{
		id:'xp',
		label:'Refill ',
		text:true,
		help:'Refill when more than this much xp needed to level up.'
	},{
		id:'stat',
		label:'When stat under ',
		text:true,
		help:'Refill when stamina/energy under this number'
	},{
		id:'fps',
		label:'Amount of FPs to keep always',
		text:true,
		help:'Only do a refill if you will have over this amount of FP after refill'
	}
];

FP.runtime = {
	points:0
};

FP.init = function() {
	// BEGIN: fix up "under level 4" generals
	if (this.option.general=== 'under level 4') {
	        this.set('option.general', 'under max level');
	}
	// END
};

FP.parse = function(change) {
	// No need to parse out Income potions as about to visit the Keep anyway...
	$('.oracleItemSmallBoxGeneral:contains("You have : ")').each(function(i,el){
		FP.set(['runtime','points'], $(el).text().regex(/You have : (\d+) points/i));
	});
	$('.title_action:contains("favor points")').each(function(i,el){
		FP.set(['runtime','points'], $(el).text().regex(/You have (\d+) favor points/i));
	});
	History.set('favor points',this.runtime.points);
	return false;
};

FP.notReady = function() {
	return (Player.get(this.option.type,0) >= this.option.stat 
			|| Player.get('exp_needed', 0) < this.option.xp 
			|| (this.data[Player.get('level',0)] || 0) >= this.option.times 
			|| this.runtime.points < this.option.fps + 10 
			|| LevelUp.get('runtime.running'));
};

FP.update = function(event) {
	Dashboard.status(this, 'You have ' + makeImage('favor') + this.runtime.points + ' favor points.');
	this.set(['option','_sleep'], FP.notReady());
//	log(LOG_WARN, 'a '+(Player.get(this.option.type,0) >= this.option.stat));
//	log(LOG_WARN, 'b '+(Player.get('exp_needed', 0) < this.option.xp));
//	log(LOG_WARN, 'c '+((this.data[Player.get('level',0)] || 0) >= this.option.times));
//	log(LOG_WARN, 'd '+(this.runtime.points < this.option.fps + 10));
};

FP.work = function(state) {
	if (FP.notReady()) {
		return QUEUE_NO_ACTION;
	}
	if (state && Generals.to(this.option.general) && Page.to('oracle_oracle')) {
		Page.click('#app46755028429_favorBuy_' + (this.option.type === 'energy' ? '5' : '6') + ' input[name="favor submit"]');
		//this.set(['data', Player.get('level',0).toString()], (parseInt(this.data[Player.get('level',0).toString()] || 0, 10)) + 1); 
		log(LOG_WARN, 'Clicking on ' + this.option.type + ' refill ' + Player.get('level',0));
	}
	return QUEUE_CONTINUE;
};

/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page:true, Queue, Resources, Global,
	Battle, Generals, LevelUp, Player,
	APP, APPID, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, Divisor, length, sum, findInObject, objectIndex, sortObject, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
	makeImage, log, warn, error
*//********** Worker.Guild() **********
* Build your guild army
* Auto-attack Guild targets
*/
var Guild = new Worker('Guild');

Guild.settings = {
	taint:true
};

Guild.defaults['castle_age'] = {
	pages:'battle_guild battle_guild_battle'
};

Guild.option = {
	general:true,
	general_choice:'any',
	start:false,
	collect:true,
	tokens:'min',
	safety:60000,
	ignore:'',
	limit:'',
	cleric:false
};

Guild.runtime = {
	tokens:10,
	status:'none',// none, wait, start, fight, collect
	start:0,
	finish:0,
	rank:0,
	points:0,
	burn:false,
	last:null, // name of last target, .data[last] then we've lost so skip them
	stunned:false
};

Guild.temp = {
	status:{
		none:'Unknown',
		wait:'Waiting for Next Battle',
		start:'Entering Battle',
		fight:'In Battle',
		collect:'Collecting Reward'
	}
};

Guild.display = [
	{
		id:'general',
 		label:'Use Best General',
		checkbox:true
	},{
		advanced:true,
		id:'general_choice',
		label:'Use General',
		require:'!general',
		select:'generals'
	},{
		id:'start',
 		label:'Automatically Start',
		checkbox:true
	},{
		id:'delay',
		label:'Start Delay',
		require:'start',
		select:{0:'None',60000:'1 Minute',120000:'2 Minutes',180000:'3 Minutes',240000:'4 Minutes',300000:'5 Minutes'}
	},{
		id:'collect',
 		label:'Collect Rewards',
		checkbox:true
	},{
		id:'tokens',
		label:'Use Tokens',
		select:{min:'Immediately', healthy:'Save if Stunned', max:'Save Up'}
	},{
		id:'safety',
		label:'Safety Margin',
		require:'tokens!="min"',
		select:{30000:'30 Seconds',45000:'45 Seconds',60000:'60 Seconds',90000:'90 Seconds'}
	},{
		id:'order',
		label:'Attack',
		select:{health:'Lowest Health', level:'Lowest Level', maxhealth:'Lowest Max Health', activity:'Lowest Activity', health2:'Highest Health', level2:'Highest Level', maxhealth2:'Highest Max Health', activity2:'Highest Activity'}
	},{
		advanced:true,
		id:'limit',
		label:'Relative Level',
		text:true,
		help:'Positive values are levels above your own, negative are below. Leave blank for no limit'
	},{
		id:'cleric',
 		label:'Attack Clerics First',
		checkbox:true,
		help:'This will attack any *active* clerics first, which might help prevent the enemy from healing up again...'
	},{
		id:'defeat',
 		label:'Avoid Defeat',
		checkbox:true,
		help:'This will prevent you attacking a target that you have already lost to'
	},{
		advanced:true,
		id:'ignore',
		label:'Ignore Targets',
		text:true,
		help:'Ignore any targets with names containing these tags - use | to separate multiple tags'
	}
];

Guild.init = function() {
	var now = Date.now();

	// BEGIN: fix up "under level 4" generals
	if (this.option.general_choice === 'under level 4') {
		this.set('option.general_choice', 'under max level');
	}
	// END

	this._remind(180, 'tokens');// Gain more tokens every 5 minutes
	if (this.runtime.start && this.runtime.start > now) {
		this._remind((this.runtime.start - now) / 1000, 'start');
	}
	if (this.runtime.finish && this.runtime.finish > now) {
		this._remind((this.runtime.finish - now) / 1000, 'finish');
	}
	if (this.runtime.status === 'fight' && this.runtime.finish - this.option.safety > now) {
		this._remind((this.runtime.finish - this.option.safety - now) / 1000, 'fight');
	}
	this._trigger('#app46755028429_guild_token_current_value', 'tokens'); //fix
};

Guild.parse = function(change) {
	var now = Date.now(), tmp, i;
	switch (Page.page) {
		case 'battle_guild':
			if ($('input[src*="dragon_list_btn_2.jpg"]').length) {//fix
				this.set(['runtime','status'], 'collect');
				this._forget('finish');
				this.set(['runtime','start'], 1800000 + now);
				this._remind(1800, 'start');
			} else if ($('input[src*="dragon_list_btn_3.jpg"]').length) {
				if (this.runtime.status !== 'fight' && this.runtime.status !== 'start') {
					this.set(['runtime','status'], 'start');
				}
			} else {
				this._forget('finish');
				this.set(['runtime','start'], 1800000 + now);
				this._remind(1800, 'start');
				this.set(['runtime','status'], 'wait');
			}
			break;
		case 'battle_guild_battle':
			this.set(['runtime','tokens'], ($('#app46755028429_guild_token_current_value').text() || '10').regex(/(\d+)/));//fix
			this._remind(($('#app46755028429_guild_token_time_value').text() || '5:00').parseTimer(), 'tokens');//fix
			i = $('#app46755028429_monsterTicker').text().parseTimer();
			if ($('input[src*="collect_reward_button2.jpg"]').length) {
				this.set(['runtime','status'], 'collect');
			} else if (i === 9999) {
				this._forget('finish');
				this.set(['runtime','start'], 1800000 + now);
				this._remind(1800, 'start');
				this.set(['runtime','status'], 'wait');
			} else {
				this.set(['runtime','status'], 'fight');
				this.set(['runtime','finish'], (i * 1000) + now);
				this._remind(i, 'finish');
			}
			tmp = $('#app46755028429_results_main_wrapper');
			if (tmp.length) {
				i = tmp.text().regex(/\+(\d+) \w+ Activity Points/i);
				if (isNumber(i)) {
					History.add('guild', i);
					History.add('guild_count', 1);
					this._notify('data');// Force dashboard update
				}
			}
			if ($('img[src*="battle_defeat"]').length && this.runtime.last) {//fix
				this.set(['data',this.runtime.last], true);
			}
			this.set(['runtime','stunned'], !!$('#app46755028429_guild_battle_banner_section:contains("Status: Stunned")').length);//fix
			break;
	}
};

Guild.update = function(event) {
	var now = Date.now();
	if (event.type === 'reminder') {
		if (event.id === 'tokens') {
			this.set(['runtime','tokens'], Math.min(10, this.runtime.tokens + 1));
			if (this.runtime.tokens < 10) {
				this._remind(180, 'tokens');
			}
		} else if (event.id === 'start') {
			this.set(['runtime','status'], 'start');
		} else if (event.id === 'finish') {
			this.set(['runtime','status'], 'collect');
		}
	}
	if (event.type === 'trigger' && event.id === 'tokens') {
		if ($('#app46755028429_guild_token_current_value').length) {//fix
			this.set(['runtime','tokens'], $('#app46755028429_guild_token_current_value').text().regex(/(\d+)/) || 0);//fix
		}
	}
	if (this.runtime.status === 'fight' && this.runtime.finish - this.option.safety > now) {
		this._remind((this.runtime.finish - this.option.safety - now) / 1000, 'fight');
	}
	if (!this.runtime.tokens) {
		this.set(['runtime','burn'], false);
	} else if (this.runtime.tokens >= 10 || (this.runtime.finish || 0) - this.option.safety <= now) {
		this.set(['runtime','burn'], true);
	}
	this.set(['option','_sleep'],
		   !(this.runtime.status === 'wait' && this.runtime.start <= now) // Should be handled by an event
		&& !(this.runtime.status === 'start' && Player.get('stamina',0) >= 20 && this.option.start)
		&& !(this.runtime.status === 'fight' && this.runtime.tokens
			&& (!this.option.delay || this.runtime.finish - 3600000  >= now - this.option.delay)
				&& (this.option.tokens === 'min'
					|| (this.option.tokens === 'healthy' && (!this.runtime.stunned || this.runtime.burn))
					|| (this.option.tokens === 'max' && this.runtime.burn)))
		&& !(this.runtime.status === 'collect' && this.option.collect));
	Dashboard.status(this, 'Status: ' + this.temp.status[this.runtime.status] + (this.runtime.status === 'wait' ? ' (' + Page.addTimer('guild_start', this.runtime.start) + ')' : '') + (this.runtime.status === 'fight' ? ' (' + Page.addTimer('guild_start', this.runtime.finish) + ')' : '') + ', Tokens: ' + makeImage('guild', 'Guild Tokens') + ' ' + this.runtime.tokens + ' / 10');
};

Guild.work = function(state) {
	if (state) {
		if (this.runtime.status === 'wait') {
			if (!Page.to('battle_guild')) {
				return QUEUE_FINISH;
			}
		} else if (this.runtime.status !== 'fight' || Generals.to(this.option.general ? 'duel' : this.option.general_choice)) {
			if (Page.page !== 'battle_guild_battle') {
				if (Page.page !== 'battle_guild') {
					Page.to('battle_guild');
				} else {
					Page.click('input[src*="dragon_list_btn"]');
				}
			} else {
				if (this.runtime.status === 'collect') {
					if (!$('input[src*="collect_reward_button2.jpg"]').length) {
						Page.to('battle_guild');
					} else {
						log('Collecting Reward');
						Page.click('input[src*="collect_reward_button2.jpg"]');
					}
				} else if (this.runtime.status === 'fight' || this.runtime.status === 'start') {
					if ($('input[src*="guild_enter_battle_button.gif"]').length) {
						log('Entering Battle');
						Page.click('input[src*="guild_enter_battle_button.gif"]');
						this.set(['data'], {}); // Forget old "lose" list
						return QUEUE_CONTINUE;
					}
					var best = null, besttarget, besthealth, ignore = this.option.ignore && this.option.ignore.length ? this.option.ignore.split('|') : [];
					$('#app46755028429_enemy_guild_member_list_1 > div, #app46755028429_enemy_guild_member_list_2 > div, #app46755028429_enemy_guild_member_list_3 > div, #app46755028429_enemy_guild_member_list_4 > div').each(function(i,el){
					
						var test = false, cleric = false, i = ignore.length, $el = $(el), txt = $el.text().trim().replace(/\s+/g,' '), target = txt.regex(/^(.*) Level: (\d+) Class: ([^ ]+) Health: (\d+)\/(\d+) Status: ([^ ]+) \w+ Activity Points: (\d+)/i);
						// target = [0:name, 1:level, 2:class, 3:health, 4:maxhealth, 5:status, 6:activity]
						if (!target 
								|| (Guild.option.defeat && Guild.data && Guild.data[target[0]])
								|| (isNumber(Guild.option.limit) 
									&& target[1] > Player.get('level',0) + Guild.option.limit)) {
							return;
						}
						while (i--) {
							if (target[0].indexOf(ignore[i]) >= 0) {
								return;
							}
						}
						if (besttarget) {
							switch(Guild.option.order) {
								case 'level':		test = target[1] < besttarget[1];	break;
								case 'health':		test = target[3] < besttarget[3];	break;
								case 'maxhealth':	test = target[4] < besttarget[4];	break;
								case 'activity':	test = target[6] < besttarget[6];	break;
								case 'level2':		test = target[1] > besttarget[1];	break;
								case 'health2':		test = target[3] > besttarget[3];	break;
								case 'maxhealth2':	test = target[4] > besttarget[4];	break;
								case 'activity2':	test = target[6] > besttarget[6];	break;
							}
						}
						if (Guild.option.cleric) {
							cleric = target[2] === 'Cleric' && target[6] && (!best || besttarget[2] !== 'Cleric');
						}
						if ((target[3] && (!best || cleric)) || (target[3] >= 200 && (besttarget[3] < 200 || test))) {
							best = el;
							besttarget = target;
						}
					});
					if (best) {
						this.set(['runtime','last'], besttarget[0]);
						log('Attacking '+besttarget[0]+' with '+besttarget[3]+' health');
						if ($('input[src*="monster_duel_button.gif"]', best).length) {
							Page.click($('input[src*="monster_duel_button.gif"]', best));
						} else {
							log(LOG_INFO, 'But couldn\'t find button, so backing out.');
							Page.to('battle_guild');
						}
					} else {
						this.set(['runtime','last'], null);
					}
				}
			}
		}
	}
	return QUEUE_CONTINUE;
};

/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page:true, Queue, Resources, Global,
	Battle, Generals, LevelUp, Player,
	APP, APPID, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, Divisor, length, sum, findInObject, objectIndex, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
	makeImage, log, warn, error
*//********** Worker.Festival() **********
* Build your festival army
* Auto-attack Festival targets
*/
var Festival = new Worker('Festival');

Festival.settings = {
	taint:true
};

Festival.defaults['castle_age'] = {
	pages:'festival_guild festival_guild_battle'
};

Festival.option = {
	general:true,
	general_choice:'any',
	start:false,
	collect:true,
	tokens:'min',
	safety:60000,
	ignore:'',
	limit:'',
	cleric:false
};

Festival.runtime = {
	tokens:10,
	status:'start',// wait, start, fight, collect
	start:0,
	finish:0,
	rank:0,
	points:0,
	burn:false,
	last:null, // name of last target, .data[last] then we've lost so skip them
	stunned:false
};

Festival.temp = {
	status:{
		none:'Unknown',
		wait:'Waiting for Next Battle',
		start:'Entering Battle',
		fight:'In Battle',
		collect:'Collecting Reward'
	}
};

Festival.display = [
	{
		id:'general',
 		label:'Use Best General',
		checkbox:true
	},{
		advanced:true,
		id:'general_choice',
		label:'Use General',
		require:'!general',
		select:'generals'
	},{
		id:'start',
 		label:'Automatically Start',
		checkbox:true
	},{
		id:'delay',
		label:'Start Delay',
		require:'start',
		select:{0:'None',60000:'1 Minute',120000:'2 Minutes',180000:'3 Minutes',240000:'4 Minutes',300000:'5 Minutes'}
	},{
		id:'collect',
 		label:'Collect Rewards',
		checkbox:true
	},{
		id:'tokens',
		label:'Use Tokens',
		select:{min:'Immediately', healthy:'Save if Stunned', max:'Save Up'}
	},{
		id:'safety',
		label:'Safety Margin',
		require:'tokens!="min"',
		select:{30000:'30 Seconds',45000:'45 Seconds',60000:'60 Seconds',90000:'90 Seconds'}
	},{
		id:'order',
		label:'Attack',
		select:{health:'Lowest Health', level:'Lowest Level', maxhealth:'Lowest Max Health', activity:'Lowest Activity', health2:'Highest Health', level2:'Highest Level', maxhealth2:'Highest Max Health', activity2:'Highest Activity'}
	},{
		advanced:true,
		id:'limit',
		label:'Relative Level',
		text:true,
		help:'Positive values are levels above your own, negative are below. Leave blank for no limit'
	},{
		id:'cleric',
 		label:'Attack Clerics First',
		checkbox:true,
		help:'This will attack any *active* clerics first, which might help prevent the enemy from healing up again...'
	},{
		id:'defeat',
 		label:'Avoid Defeat',
		checkbox:true,
		help:'This will prevent you attacking a target that you have already lost to'
	},{
		advanced:true,
		id:'ignore',
		label:'Ignore Targets',
		text:true,
		help:'Ignore any targets with names containing these tags - use | to separate multiple tags'
	}
];

Festival.init = function() {
	var now = Date.now();

	// BEGIN: fix up "under level 4" generals
	if (this.option.general_choice === 'under level 4') {
		this.set('option.general_choice', 'under max level');
	}
	// END

	this._remind(180, 'tokens');// Gain more tokens every 5 minutes
	if (this.runtime.start && this.runtime.start > now) {
		this._remind((this.runtime.start - now) / 1000, 'start');
	}
	if (this.runtime.finish && this.runtime.finish > now) {
		this._remind((this.runtime.finish - now) / 1000, 'finish');
	}
	if (this.runtime.status === 'fight' && this.runtime.finish - this.option.safety > now) {
		this._remind((this.runtime.finish - this.option.safety - now) / 1000, 'fight');
	}
	this._trigger('#app46755028429_guild_token_current_value', 'tokens'); //fix
};

Festival.parse = function(change) {
	var now = Date.now(), tmp, i;
	switch (Page.page) {
		case 'festival_guild':
			tmp = $('#app46755028429_current_battle_info').text();
			if (tmp.indexOf('BATTLE NOW!') > -1) {
				if (this.runtime.status !== 'fight' && this.runtime.status !== 'start') {
					this.set(['runtime','status'], 'start');
				}
			} else {
				this.set(['runtime','status'], tmp.indexOf('COLLECT') > -1 ? 'collect' : 'wait');
				this._forget('finish');
				i = tmp.indexOf('HOURS') > -1 ? tmp.regex(/(\d+) HOURS/i) * 3600 
						: tmp.indexOf('MINS') > -1 ? tmp.regex(/(\d+) MINS/i) * 60 : 180;
				this._forget('finish');
				this.set(['runtime','start'], i*1000 + now);
				this._remind(i , 'start');
			}
			break;
		case 'festival_guild_battle':
			this.set(['runtime','tokens'], ($('#app46755028429_guild_token_current_value').text() || '10').regex(/(\d+)/));//fix
			this._remind(($('#app46755028429_guild_token_time_value').text() || '5:00').parseTimer(), 'tokens');//fix
			i = $('#app46755028429_monsterTicker').text().parseTimer();
			if ($('input[src*="arena3_collectbutton.gif"]').length) {
				this.set(['runtime','status'], 'collect');
			} else if (i === 9999) {
				this.set(['runtime','status'], 'wait');
				this.set(['runtime','start'], 3600000 + now);
				this._remind(3600 , 'start');
			} else {
				this.set(['runtime','status'], 'fight');
				this.set(['runtime','finish'], (i * 1000) + now);
				this._remind(i, 'finish');
			}
			tmp = $('#app46755028429_results_main_wrapper');
			if (tmp.length) {
				i = tmp.text().regex(/\+(\d+) \w+ Activity Points/i);
				if (isNumber(i)) {
					History.add('festival', i);
					History.add('festival_count', 1);
					this._notify('data');// Force dashboard update
				}
			}
			if ($('img[src*="battle_defeat"]').length && this.runtime.last) {//fix
				this.set(['data',this.runtime.last], true);
			}
			this.set(['runtime','stunned'], !!$('#app46755028429_guild_battle_banner_section:contains("Status: Stunned")').length);//fix
			break;
	}
};

Festival.update = function(event) {
	var now = Date.now();
	if (event.type === 'reminder') {
		if (event.id === 'tokens') {
			this.set(['runtime','tokens'], Math.min(10, this.runtime.tokens + 1));
			if (this.runtime.tokens < 10) {
				this._remind(180, 'tokens');
			}
		} else if (event.id === 'start') {
			this.set(['runtime','status'], 'start');
		} else if (event.id === 'finish') {
			this.set(['runtime','status'], 'collect');
		}
	}
	if (event.type === 'trigger' && event.id === 'tokens') {
		if ($('#app46755028429_guild_token_current_value').length) {//fix
			this.set(['runtime','tokens'], $('#app46755028429_guild_token_current_value').text().regex(/(\d+)/) || 0);
		}
	}
	if (this.runtime.status === 'fight' && this.runtime.finish - this.option.safety > now) {
		this._remind((this.runtime.finish - this.option.safety - now) / 1000, 'fight');
	}
	if (!this.runtime.tokens) {
		this.set(['runtime','burn'], false);
	} else if (this.runtime.tokens >= 10 || (this.runtime.finish || 0) - this.option.safety <= now) {
		this.set(['runtime','burn'], true);
	}
	this.set(['option','_sleep'],
		   !(this.runtime.status === 'wait' && this.runtime.start <= now) // Should be handled by an event
		&& !(this.runtime.status === 'start' && Player.get('stamina',0) >= 20 && this.option.start)
		&& !(this.runtime.status === 'fight' && this.runtime.tokens
			&& (!this.option.delay || this.runtime.finish - 3600000 >= now - this.option.delay)
			&& (this.option.tokens === 'min'
			|| (this.option.tokens === 'healthy' && (!this.runtime.stunned || this.runtime.burn))
			|| (this.option.tokens === 'max' && this.runtime.burn)))
		&& !(this.runtime.status === 'collect' && this.option.collect));
	Dashboard.status(this, 'Status: ' + this.temp.status[this.runtime.status] + (this.runtime.status === 'wait' ? ' (' + Page.addTimer('festival_start', this.runtime.start) + ')' : '') + (this.runtime.status === 'fight' ? ' (' + Page.addTimer('festival_start', this.runtime.finish) + ')' : '') + ', Tokens: ' + makeImage('arena', 'Festival Tokens') + ' ' + this.runtime.tokens + ' / 10');
};

Festival.work = function(state) {
	if (state) {
		if (this.runtime.status === 'wait') {
			if (!Page.to('festival_guild')) {
				return QUEUE_FINISH;
			}
		} else if (this.runtime.status !== 'fight' || Generals.to(this.option.general ? 'duel' : this.option.general_choice)) {
			if (Page.page !== 'festival_guild_battle') {
				if (Page.page !== 'festival_guild') {
					Page.to('festival_guild');
				} else {
					Page.click('img.imgButton[src*="festival_arena_enter.jpg"]');
				}
			} else {
				if (this.runtime.status === 'collect') {
					if (!$('input[src*="arena3_collectbutton.gif"]').length) {//fix
						Page.to('festival_guild');
					} else {
						log('Collecting Reward');
						Page.click('input[src*="arena3_collectbutton.gif"]');//fix
					}
				} else if (this.runtime.status === 'start') {
					if ($('input[src*="guild_enter_battle_button.gif"]').length) {
						log('Entering Battle');
						Page.click('input[src*="guild_enter_battle_button.gif"]');
					}
					this.set(['data'], {}); // Forget old "lose" list
				} else if (this.runtime.status === 'fight') {
					if ($('input[src*="guild_enter_battle_button.gif"]').length) {
						log('Entering Battle');
						Page.click('input[src*="guild_enter_battle_button.gif"]');
					}
					var best = null, besttarget, besthealth, ignore = this.option.ignore && this.option.ignore.length ? this.option.ignore.split('|') : [];
					$('#app46755028429_enemy_guild_member_list_1 > div, #app46755028429_enemy_guild_member_list_2 > div, #app46755028429_enemy_guild_member_list_3 > div, #app46755028429_enemy_guild_member_list_4 > div').each(function(i,el){
					
						var test = false, cleric = false, i = ignore.length, $el = $(el), txt = $el.text().trim().replace(/\s+/g,' '), target = txt.regex(/^(.*) Level: (\d+) Class: ([^ ]+) Health: (\d+)\/(\d+) Status: ([^ ]+) \w+ Activity Points: (\d+)/i);
						// target = [0:name, 1:level, 2:class, 3:health, 4:maxhealth, 5:status, 6:activity]
						if (!target 
								|| (Festival.option.defeat && Festival.data 
									&& Festival.data[target[0]])
								|| (isNumber(Festival.option.limit) 
									&& target[1] > Player.get('level',0) + Festival.option.limit)) {
							return;
						}
						while (i--) {
							if (target[0].indexOf(ignore[i]) >= 0) {
								return;
							}
						}
						if (besttarget) {
							switch(Festival.option.order) {
								case 'level':		test = target[1] < besttarget[1];	break;
								case 'health':		test = target[3] < besttarget[3];	break;
								case 'maxhealth':	test = target[4] < besttarget[4];	break;
								case 'activity':	test = target[6] < besttarget[6];	break;
								case 'level2':		test = target[1] > besttarget[1];	break;
								case 'health2':		test = target[3] > besttarget[3];	break;
								case 'maxhealth2':	test = target[4] > besttarget[4];	break;
								case 'activity2':	test = target[6] > besttarget[6];	break;
							}
						}
						if (Festival.option.cleric) {
							cleric = target[2] === 'Cleric' && target[6] && (!best || besttarget[2] !== 'Cleric');
						}
						//log('cname ' + target[0] + ' cleric ' + cleric + ' test ' + test + ' bh ' + (best ? besttarget[3] : 'none') + ' candidate healt ' + target[3]);
						if ((target[3] && (!best || cleric)) || (target[3] >= 200 && (besttarget[3] < 200 || test))) {
							best = el;
							besttarget = target;
						}
					});
					if (best) {
						this.set(['runtime','last'], besttarget[0]);
						log('Attacking '+besttarget[0]+' with '+besttarget[3]+' health');
						if ($('input[src*="monster_duel_button.gif"]', best).length) {
							Page.click($('input[src*="monster_duel_button.gif"]', best));
						} else {
							log(LOG_INFO, 'But couldn\'t find button, so backing out.');
							Page.to('festival_guild');
						}
					} else {
						this.set(['runtime','last'], null);
					}
				}
			}
		}
	}
	return QUEUE_CONTINUE;
};
})(window.jQuery?window.jQuery.noConflict(true):$);// Bottom wrapper

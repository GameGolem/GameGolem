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

var isArray = function(obj) {// Not an object
	return obj && obj.constructor === Array;
};

var isObject = function(obj) {// Not an array
	return obj && obj.constructor === Object;
};

var isBoolean = function(obj) {
	return obj && obj.constructor === Boolean;
};

var isFunction = function(obj) {
	return obj && obj.constructor === Function;
};

var isWorker = function(obj) {
	return obj && obj.constructor === Worker;
};

var isNumber = function(num) {
	return typeof num === 'number';
};

var isString = function(str) {
	return typeof str === 'string';
};

var isUndefined = function(obj) {
	return typeof obj === 'undefined';
};

var isNull = function(obj) {
	return obj === null;
};

// These short functions are replaced by Debug worker if present - which gives far more fine-grained control and detail
var log = function(txt){
	return '[' + (new Date()).toLocaleTimeString() + ']' + (txt ? ' '+txt : '');
};
var warn = function(txt) {
	return '[' + (isRelease ? 'v'+version : 'r'+revision) + '] [' + (new Date()).toLocaleTimeString() + ']' + (Worker.stack.length ? ' '+Worker.stack[0]+':' : '') + (txt ? ' '+txt : '');
};
var error = function(txt) {
	return '!!![' + (isRelease ? 'v'+version : 'r'+revision) + '] [' + (new Date()).toLocaleTimeString() + ']' + (Worker.stack.length ? ' '+Worker.stack[0]+':' : '') + (txt ? ' '+txt : '');
};

// Data storage
var setItem = function(n, v) {
	localStorage.setItem('golem.' + APP + '.' + n, v);
};

var getItem = function(n) {
	return localStorage.getItem('golem.' + APP + '.' + n);
};

if (browser === 'greasemonkey') {// Legacy - need GM to use localStorage like everything else at some point - set in main.js which is called before here
	setItem = GM_setValue;
	getItem = GM_getValue;
}

// Prototypes to ease functionality

String.prototype.trim = function() {
	return this.replace(/^\s+|\s+$/g, '');
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

Number.prototype.SI = function() {
	var a = Math.abs(this);
	if (a >= 1e12) {
		return (this / 1e12).toFixed(1) + ' T';
	}
	if (a >= 1e9) {
		return (this / 1e9).toFixed(1) + ' B';
	}
	if (a >= 1e6) {
		return (this / 1e6).toFixed(1) + ' M';
	}
	if (a >= 1e3) {
		return (this / 1e3).toFixed(1) + ' k';
	}
	return this;
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
Array.prototype.findEvent = function(worker, type, id, start) {
	var i = start || 0; l = this.length;
	for (; i<l; i++) {
		if ((!worker || this[i].worker === worker) && (!type || this[i].type === type) && (!id || this[i].id === id)) {
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
	if (x === undefined || !x) {
		return true;
	} else if (isObject(x)) {
		for (var i in x) {
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

var findInObject = function(list, value) {
	if (isObject(list)) {
		for (var i in list) {
			if (list[i] === value) {
				return i;
			}
		}
	}
	return null;
};

var objectIndex = function(list, index) {
	if (isObject(list)) {
		for (var i in list) {
			if (index-- <= 0) {
				return i;
			}
		}
	}
	return null;
};

var getAttDefList = [];
var getAttDef = function(list, unitfunc, x, count, type) { // Find total att(ack) or def(ense) value from a list of objects (with .att and .def)
	var units = [], attack = 0, defend = 0, x2 = (x==='att'?'def':'att'), i, own;
	if (unitfunc) {
		for (i in list) {
			unitfunc(units, i, list);
		}
	} else {
		units = getAttDefList;
	}
	units.sort(function(a,b) {
		return (list[b][x] + (0.7 * list[b][x2])) - (list[a][x] + (0.7 * list[a][x2]))
			|| (list[a].upkeep || 0) - (list[b].upkeep || 0)
			|| (list[a].cost || 0) - (list[b].cost || 0);
	});
	for (i=0; i<units.length; i++) {
		own = isNumber(list[units[i]].own) ? list[units[i]].own : 1;
		if (type) {
			Resources.set(['data', '_'+units[i], type+'_'+x], count || undefined);
			if (Math.min(count, own) > 0) {
//				console.log(warn(), 'Utility','Using: '+Math.min(count, own)+' x '+units[i]+' = '+JSON.stringify(list[units[i]]));
				if (!list[units[i]].use) {
					list[units[i]].use = {};
				}
				list[units[i]].use[(type+'_'+x)] = Math.min(count, own);
			} else if (length(list[units[i]].use)) {
				delete list[units[i]].use[(type+'_'+x)];
				if (!length(list[units[i]].use)) {
					delete list[units[i]].use;
				}
			}
		}
//		if (count <= 0) {break;}
		own = Math.min(count, own);
		attack += own * list[units[i]].att;
		defend += own * list[units[i]].def;
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
	})(obj, depth || 1), replacer, space);
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
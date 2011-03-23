// ==UserScript==
// @name		Rycochet's Castle Age Golem
// @namespace	golem
// @description	Auto player for Castle Age on Facebook. If there's anything you'd like it to do, just ask...
// @license		GNU Lesser General Public License; http://www.gnu.org/licenses/lgpl.html
// @version		31.5.901
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
var revision = 901;
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
					if (a[i].search(/^[-+]?\d*\.?\d+$/) >= 0) {
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

//Array.prototype.unique = function() { var o = {}, i, l = this.length, r = []; for(i=0; i<l;i++) o[this[i]] = this[i]; for(i in o) r.push(o[i]); return r; };
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

var unique = function(a) { // Return an array with no duplicates
	var o = {}, i, l = a.length, r = [];
	for(i = 0; i < l; i++) {
		o[a[i]] = a[i];
	}
	for(i in o) {
		r.push(o[i]);
	}
	return r;
};

var deleteElement = function(list, value) { // Removes matching elements from an array
	if (isArray(list)) {
		while (list.indexOf(value) >= 0) {
			list.splice(list.indexOf(value), 1);
		}
	}
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
	} else if (isString(a) && a.search(/^[-+]?\d*\.?\d+$/) >= 0) {
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
	} else if (isString(a) && a.search(/^[-+]?\d*\.?\d+(?:e[-+]?\d+)?$/) >= 0) {
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
	} else if (isString(a) && a.search(/^[-+]?\d*\.?\d+(?:e[-+]?\d+)?$/) >= 0) {
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
		}else {
			for (i in left) {
				if (left.hasOwnProperty(i) && right.hasOwnProperty(i)) {
					if (!compare(left[i], right[i])) {
						return false;
					}
				}
			}
		}
	} else {
		return left === right;
	}
	return true;
};

var findInArray = function(list, value) {
	if (isArray(list)) {
		return list.indexOf(value) !== -1;
	} else if (isObject(list)) {
		for (var i in list) {
			if (list[i] === value) {
				return true;
			}
		}
	}
	return false;
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

var sortObject = function(obj, sortfunc, deep) {
	var i, list = [], output = {};
	if (deep === undefined) {
		deep = false;
	}
	for (i in obj) {
		if (obj.hasOwnProperty(i)) {
			list.push(i);
		}
	}
	list.sort(sortfunc ? sortfunc : function(a,b){return b-a;});
	for (i=0; i<list.length; i++) {
		if (deep && typeof obj[list[i]] === 'object') {
			output[list[i]] = sortObject(obj[list[i]], sortfunc, deep);
		} else {
			output[list[i]] = obj[list[i]];
		}
	}
	return output;
};

var getAttDefList = [];
var getAttDef = function(list, unitfunc, x, count, user) { // Find total att(ack) or def(ense) value from a list of objects (with .att and .def)
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
		if (user) {
			Resources.set(['_'+units[i], user+'_'+x], count || undefined);
			if (Math.min(count, own) > 0) {
//				console.log(warn(), 'Utility','Using: '+Math.min(count, own)+' x '+units[i]+' = '+JSON.stringify(list[units[i]]));
				if (!list[units[i]].use) {
					list[units[i]].use = {};
				}
				list[units[i]].use[(user+'_'+x)] = Math.min(count, own);
			} else if (length(list[units[i]].use)) {
				delete list[units[i]].use[(user+'_'+x)];
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

var bestValue = function(list, value) {// pass a list of numbers, return the highest entry lower or equal to value, return -1 on failure
	var i, best = -1;
	for (i=0; i<list.length; i++) {
		if (list[i] <= value && list[i] > best) {
			best = list[i];
		}
	}
	return best;
};

var bestValueHi = function(list, value) {// pass a list of numbers, return the highest entry greater or equal to value, return -1 on failure
	var i, best = Number.POSITIVE_INFINITY;
	for (i = 0; i < list.length; i++) {
		if (list[i] >= value && list[i] < best) {
			best = list[i];
		}
	}
	return best === Number.POSITIVE_INFINITY ? -1 : best;
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
			out = o === undefined ? 'undefined' : o === null ? 'null' : o.toString();
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
 * @param {(string|array)} what The path.to.data / [path, to, data] we want
 * @param {*} def The default value to return if the path we want doesn't exist
 * @param {string=} type The typeof of data required (or return def)
 * @return {*} The value we want, or the default we passed in
 */
Worker.prototype._get = function(what, def, type) { // 'path.to.data'
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
		if (isUndefined(data) || (type && (isFunction(type) && type(data)) || (isString(type) && typeof data !== type))) {
//			if (!isUndefined(data)) { // NOTE: Without this expect spam on undefined data
//				console.log(warn('Bad type in ' + this.name + '.get('+JSON.shallow(arguments,2)+'): Seen ' + (typeof data)));
//			}
			return def;
		}
		return isNull(data) ? null : data.valueOf();
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
 * @param {string=} type The _datatype we wish to load. If null then load all _datatypes
 * @param {boolean=} merge If we wish to merge with current data - normally only used in _setup
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
 * @param {string=} id A unique identifier - trying to set the same id more than once will result in only the most recent timer running
 * @param {(function()|object)=} callback A function to call, or an event object to pass to _update
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
 * @param {string=} id A unique identifier - trying to set the same id more than once will result in only the most recent reminder running
 * @param {(function()|object)=} callback A function to call, or an event object to pass to _update
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
 * @param {string=} type The _datatype we wish to save. If null then save all _datatypes
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
 * @param {(string|array)} what The path.to.data / [path, to, data] we want
 * @param {*=} value The value we will set it to, undefined (not null!) will cause it to be deleted and any empty banches removed
 * @param {string=} type The typeof of data to be set (or return false and don't set anything)
 * @return {*} The value we passed in
 */
Worker.prototype._set = function(what, value, type) {
	if (type && (isFunction(type) && type(value)) || (isString(type) && typeof value !== type)) {
		console.log(warn('Bad type in ' + this.name + '.set('+JSON.shallow(arguments,2)+'): Seen ' + (typeof data)));
		return false;
	}
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
 * @param {string=} id The id we pass to _update, it will pass selector if not set
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
 * @param {string=} path The path we wish to watch, or null for 'data'
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

/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army:true, Dashboard, History, Page, Queue, Resources,
	Battle, Generals, LevelUp, Player,
	APP, APPID, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, Divisor, length, unique, deleteElement, sum, findInArray, findInObject, objectIndex, sortObject, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
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
	//	console.log(log(), 'this._get(\'data.' + uid + '.' + section + (x.length ? '.' + x.join('.') : '') + ', ' + value + ')');
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
				console.log(warn(), e3.name + ' in Army.dashboard(): ' + i + '("label"): ' + e3.message);
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
			console.log(warn(), e4.name + ' in Army.dashboard(): ' + Army.getSection($this.closest('td').index(),'name') + '(data,"tooltip"): ' + e4.message);
		}
		return false;
	});
};

/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Dashboard, History, Page, Queue, Resources,
	Battle, Generals, LevelUp, Player,
	APP, APPID, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, Divisor, length, unique, deleteElement, sum, findInArray, findInObject, objectIndex, sortObject, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
	makeImage, getImage, log, warn, error, isUndefined
*/
/********** Worker.Config **********
* Has everything to do with the config
*/
var Config = new Worker('Config');

Config.settings = {
	system:true,
	keep:true
};

Config.option = {
	display:'block',
	fixed:false,
	advanced:false,
	exploit:false
};

Config.temp = {
	require:[],
	menu:null
};

Config.init = function() {
	var i, j, k, $display;
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
	$('head').append('<link rel="stylesheet" href="http://cloutman.com/css/base/jquery-ui.css" type="text/css" />');
	$display = $('<div id="golem_config_frame" class="golem-config ui-widget-content' + (Config.option.fixed?' golem-config-fixed':'') + '" style="display:none;"><div class="golem-title">&nbsp;Castle Age Golem ' + (isRelease ? 'v'+version : 'r'+revision) + '<img class="golem-image golem-icon-menu" src="' + getImage('menu') + '"></div><div id="golem_buttons"><img class="golem-button' + (Config.option.display==='block'?'-active':'') + '" id="golem_options" src="' + getImage('options') + '"></div><div style="display:'+Config.option.display+';"><div id="golem_config" style="overflow:hidden;overflow-y:auto;"></div></div></div>');
	$('div.UIStandardFrame_Content').after($display);// Should really be inside #UIStandardFrame_SidebarAds - but some ad-blockers remove that
	$('#golem_options').click(function(){
		$(this).toggleClass('golem-button golem-button-active');
		Config.option.display = Config.option.display==='block' ? 'none' : 'block';
		$('#golem_config').parent().toggle('blind'); //Config.option.fixed?null:
		Config._save('option');
	});
	for (i in Workers) {
		this.makePanel(Workers[i]);
	}
	$('.golem-config .golem-panel > h3').click(function(event){
		if ($(this).parent().hasClass('golem-panel-show')) {
			$(this).next().hide('blind',function(){
				$(this).parent().toggleClass('golem-panel-show');
				Config.option.active = [];
				$('.golem-panel-show').each(function(i,el){Config.option.active.push($(this).attr('id'));});
				Config._save('option');
			});
		} else {
			$(this).parent().toggleClass('golem-panel-show');
			$(this).next().show('blind');
			Config.option.active = [];
			$('.golem-panel-show').each(function(i,el){Config.option.active.push($(this).attr('id'));});
			Config._save('option');
		}
	});
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
	for (i in Workers) { // Propagate all before and after settings
		if (Workers[i].settings.before) {
			for (j=0; j<Workers[i].settings.before.length; j++) {
				k = Worker.find(Workers[i].settings.before[j]);
				if (k) {
					k.settings.after = k.settings.after || [];
					k.settings.after.push(Workers[i].name);
					k.settings.after = unique(k.settings.after);
//					console.log(warn(), 'Pushing '+k.name+' after '+Workers[i].name+' = '+k.settings.after);
				}
			}
		}
		if (Workers[i].settings.after) {
			for (j=0; j<Workers[i].settings.after.length; j++) {
				k = Worker.find(Workers[i].settings.after[j]);
				if (k) {
					k.settings.before = k.settings.before || [];
					k.settings.before.push(Workers[i].name);
					k.settings.before = unique(k.settings.before);
//					console.log(warn(), 'Pushing '+k.name+' before '+Workers[i].name+' = '+k.settings.before);
				}
			}
		}
	}

	var multi_change_fn = function(el) {
		var $this = $(el), tmp, worker, val;
		if ($this.attr('id') && (tmp = $this.attr('id').slice(PREFIX.length).regex(/([^_]*)_(.*)/i)) && (worker = Worker.find(tmp[0]))) {
			val = [];
			$this.children().each(function(a,el){ val.push($(el).text()); });
			worker.get(['option', tmp[1]]);
			worker.set(['option', tmp[1]], val);
		}
	};

	$('input.golem_addselect').live('click', function(){
		var i, value, values = $(this).prev().val().split(','), $multiple = $(this).parent().children().first();
		for (i=0; i<values.length; i++) {
			value = values[i].trim();
			if (value) {
				$multiple.append('<option>' + value + '</option>').change();
			}
		}
		multi_change_fn($multiple[0]);
	});
	$('input.golem_delselect').live('click', function(){
		var $multiple = $(this).parent().children().first();
		$multiple.children().selected().remove();
		multi_change_fn($multiple[0]);
	});
	$('#golem_config input,textarea,select').live('change', function(){
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
			}
		}
	});
	$('.golem-panel-header input').click(function(event){
		event.stopPropagation(true);
	});
	$('#golem_config_frame').show();// make sure everything is created before showing (css sometimes takes another second to load though)
	$('#content').append('<div id="golem-menu" class="golem-menu golem-shadow"></div>');
	$('.golem-icon-menu').click(function(event) {
		var i, j, k, keys, hr = false, html = '', $this = $(this.wrappedJSObject || this), worker = Worker.find($this.attr('name')), name = worker ? worker.name : '';
		$('.golem-icon-menu-active').removeClass('golem-icon-menu-active');
		if (Config.temp.menu !== name) {
			Config.temp.menu = name;
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
				position:Config.option.fixed ? 'fixed' : 'absolute',
				top:$this.offset().top + $this.height(),
				left:Math.min($this.offset().left, $('#content').width() - $('#golem-menu').outerWidth(true) - 4)
			}).show();
		} else {// Need to stop it going up to the config panel, but still close the menu if needed
			Config.temp.menu = null;
			$('#golem-menu').hide();
		}
		event.stopPropagation();
		return false;
	});
	$('.golem-menu > div').live('click', function(event) {
		var i, $this = $(this.wrappedJSObject || this), key = $this.attr('name').regex(/^([^.]*)\.([^.]*)\.(.*)/), worker = Worker.find(key[0]);
//		console.log(key[0] + '.menu(' + key[1] + ', ' + key[2] + ')');
		worker._unflush();
		worker.menu(Worker.find(key[1]), key[2]);
	});
	$(document).click(function(event){ // Any click hides it, relevant handling done above
		Config.temp.menu = null;
		$('.golem-icon-menu-active').removeClass('golem-icon-menu-active');
		$('#golem-menu').hide();
	});
	this._watch(this, 'option.advanced');
	this._watch(this, 'option.exploit');
};

Config.update = function(event) {
	if (event.type === 'watch') {
		var i, $el, worker = event.worker, id = event.id.slice('option.'.length);
		if (worker === this && (id === 'advanced' || id === 'exploit')) {
			for (i in Workers) {
				if (Workers[i].settings.advanced || Workers[i].settings.exploit) {
					$('#'+Workers[i].id).css('display', ((!Workers[i].settings.advanced || this.option.advanced) && (!Workers[i].settings.exploit || this.option.exploit)) ? '' : 'none');
				}
			}
		} else if (id === '_sleep') {
			$('#golem_sleep_' + worker.name).css('display', worker.option._sleep ? '' : 'none');
		} else {
			if (($el = $('#'+this.makeID(worker, id))).length === 1) {
				if ($el.attr('type') === 'checkbox') {
					$el.attr('checked', worker.option[id]);
				} else if ($el.attr('multiple')) {
					$el.empty();
					(worker.option[id] || []).forEach(function(val){$el.append('<option>'+val+'</option>');});
				} else if ($el.attr('value')) {
					$el.attr('value', worker.option[id]);
				} else {
					$el.val(worker.option[id]);
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
				'advanced:' + (this.option.advanced ? '+' : '-') + 'Advanced&nbsp;Options'
			];
		} else if (key) {
			switch (key) {
				case 'fixed':
					this._set(['option','fixed'], !this.option.fixed);
					$('#golem_config_frame').toggleClass('golem-config-fixed');
					break;
				case 'advanced':
					this._set(['option','advanced'], !this.option.advanced);
					this.checkRequire();
					break;
			}
			this._save('option');
		}
	}
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
		$('#golem_config').append('<div id="' + worker.id + '" class="golem-panel' + (worker.settings.unsortable?'':' golem-panel-sortable') + (findInArray(this.option.active, worker.id)?' golem-panel-show':'') + '"' + ((worker.settings.advanced && !this.option.advanced) || (worker.settings.exploit && !this.option.exploit) ? ' style="display:none;"' : '') + ' name="' + worker.name + '"><h3 class="golem-panel-header' + (worker.get(['option', '_disabled'], false) ? ' red' : '') + '"><img class="golem-icon" src="' + getImage('blank') + '">' + worker.name + '<img id="golem_sleep_' + worker.name + '" class="golem-image" src="' + getImage('zzz') + '"' + (worker.option._sleep ? '' : ' style="display:none;"') + '><img class="golem-image golem-icon-menu" name="' + worker.name + '" src="' + getImage('menu') + '"><img class="golem-lock" src="' + getImage('lock') + '"></h3><div class="golem-panel-content" style="font-size:smaller;"></div></div>');
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
			console.log(warn(e.name + ' in Config.makeOptions(' + worker.name + '.display()): ' + e.message));
		}
	} else {
		console.log(error(worker.name+' is trying to add an unknown type of option: '+(typeof args)));
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
		size: 7,
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
		txt.push('<div style="text-align:center;font-size:larger;font-weight:bold;">'+o.title.replace(' ','&nbsp;')+'</div>');
	}
	if (o.label && !o.button) {
		txt.push('<span style="float:left;margin-top:2px;">'+o.label.replace(' ','&nbsp;')+'</span>');
		if (o.text || o.checkbox || o.select) {
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
		txt.push('<input type="text"' + o.real_id + ' size="' + o.size + '" value="' + (o.value || isNumber(o.value) ? o.value : '') + '">');
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
		if (typeof o.value === 'array' || typeof o.value === 'object') {
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
	if (o.require || o.advanced || o.exploit) {
		try {
			r = {depth:0};
			r.require = {};
			if (o.advanced) {
				r.require.advanced = true;
				$option.css('background','#ffeeee');
			}
			if (o.exploit) {
				r.require.exploit = true;
				$option.css({border:'1px solid red', background:'#ffeeee'});
			}
			if (o.require) {
				r.require.x = Script.parse(worker, 'option', o.require);
			}
			this.temp.require.push(r.require);
			$option.attr('id', 'golem_require_'+(this.temp.require.length-1)).css('display', this.checkRequire(this.temp.require.length - 1) ? '' : 'none');
		} catch(e) {
			console.log(error(e.name + ' in createRequire(' + o.require + '): ' + e.message));
		}
	}
	$option.append(o.group ? this.makeOptions(worker,o.group) : '<br>');
	if (o.help) {
		$option.attr('title', o.help);
	}
	return $option;
};

Config.set = function(key, value) {
	this._unflush();
	if (!this.data[key] || JSON.stringify(this.data[key]) !== JSON.stringify(value)) {
		this.data[key] = value;
		$('select.golem_' + key).each(function(a,el){
			var i, worker = Worker.find($(el).closest('div.golem-panel').attr('id')), val = worker ? worker.get(['option', $(el).attr('id').regex(/_([^_]*)$/i)]) : null, list = Config.data[key], options = [];
			if (isArray(list)) {
				for (i=0; i<list.length; i++) {
					options.push('<option value="' + list[i] + '">' + list[i] + '</option>');//' + (val===i ? ' selected' : '') + '
				}
			} else {
				for (i in list) {
					options.push('<option value="' + i + '">' + list[i] + '</option>');//' + (val===i ? ' selected' : '') + '
				}
			}
			$(el).html(options.join('')).val(val);
		});
		this._save();
		return true;
	}
	return false;
};

Config.checkRequire = function(id) {
	var i, show = true, require = this.temp.require[id];
	if (!id || !require) {
		for (i in this.temp.require) {
			arguments.callee.call(this, i);
		}
		return;
	}
	if (require.advanced) {
		show = Config.option.advanced;
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
	return unique(order);
};

/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Dashboard:true, History, Page:true, Queue, Resources,
	Battle, Generals, LevelUp, Player,
	APP, APPID, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, Divisor, length, unique, deleteElement, sum, findInArray, findInObject, objectIndex, sortObject, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
	makeImage
*/
/********** Worker.Dashboard **********
* Displays statistics and other useful info
*/
var Dashboard = new Worker('Dashboard');
Dashboard.temp = null;

Dashboard.settings = {
	taint:true
//	keep:true
};

Dashboard.option = {
	display:'block',
	active:'Dashboard'
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
	tabs.push('<h3 name="' + this.name + '" class="golem-tab-header' + (active === this.name ? ' golem-tab-header-active' : '') + '">&nbsp;*&nbsp;</h3>');
	divs.push('<div id="golem-dashboard-' + this.name + '"' + (active === this.name ? '' : ' style="display:none;"') + '></div>');
	this._watch(this, 'data');
	this._watch(this, 'option._hide_dashboard');
	for (j=0; j<list.length; j++) {
		i = list[j];
		hide = Workers[i]._get(['option','_hide_dashboard'], false) || (Workers[i].settings.advanced && !Config.option.advanced);
		if (hide && this.option.active === i) {
			this.set(['option','active'], this.name);
		}
		tabs.push('<h3 name="' + i + '" class="golem-tab-header' + (active === i ? ' golem-tab-header-active' : '') + '" style="' + (hide ? 'display:none;' : '') + (Workers[i].settings.advanced ?'background:#ffeeee;' : '') + '">' + i + '</h3>');
		divs.push('<div id="golem-dashboard-' + i + '"'+(active === i ? '' : ' style="display:none;"') + '></div>');
		this._watch(Workers[i], 'data');
		this._watch(Workers[i], 'option._hide_dashboard');
	}
	$('<div id="golem-dashboard" style="position:absolute;display:none;">' + tabs.join('') + '<img id="golem_dashboard_expand" style="float:right;" src="'+getImage('expand')+'"><div>' + divs.join('') + '</div></div>').prependTo('.UIStandardFrame_Content');
	$('#golem-dashboard').offset($('#app46755028429_app_body_container').offset()).css('display', this.option.display); // Make sure we're always in the right place
	$('.golem-tab-header').click(function(){
		if (!$(this).hasClass('golem-tab-header-active')) {
			Dashboard.set(['option','active'], $(this).attr('name'));
		}
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
	$('#golem_buttons').append('<img class="golem-button' + (Dashboard.option.display==='block'?'-active':'') + '" id="golem_icon_dashboard" src="' + getImage('dashboard') + '">');
	$('#golem_icon_dashboard').click(function(){
		$(this).toggleClass('golem-button golem-button-active');
		Dashboard.set(['option','display'], Dashboard.option.display==='block' ? 'none' : 'block');
		if (Dashboard.option.display === 'block' && !$('#golem-dashboard-'+Dashboard.option.active).children().length) {
			Dashboard.update_trigger();
			Workers[Dashboard.option.active].dashboard();
		}
		$('#golem-dashboard').toggle('drop');
		Dashboard._save('option');
	});
	this._trigger('#app46755028429_app_body_container, #app46755028429_globalContainer', 'page_change');
	this._watch(this, 'option.active');
	this._watch(Config, 'option.advanced');
};

Dashboard.update_trigger = function(event) {
	var offset = $('#app46755028429_app_body_container').offset();
	$('#golem-dashboard').css({'top':offset.top, 'left':offset.left}); // Make sure we're always in the right place
};

Dashboard.update_watch = function(event) {
	if (event.id === 'option.advanced') {
		for (var i in Workers) {
			if (Workers[i].settings.advanced) {
				if (Config.option.advanced) {
					$('#golem-dashboard > h3[name="'+i+'"]').show();
				} else {
					$('#golem-dashboard > h3[name="'+i+'"]').hide();
					if (this.option.active === i) {
						this.set(['option','active'], this.name);
					}
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
			console.log(warn(), e.name + ' in ' + event.worker.name + '.dashboard(): ' + e.message);
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
		this._unflush();
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
	makeTimer, Divisor, length, unique, deleteElement, sum, findInArray, findInObject, objectIndex, sortObject, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime, error:true, warn:true, log:true, getImage, isUndefined, script_started,
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
	advanced:true,
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
	trace:false
};

Debug.runtime = {
	sort:2,
	rev:false,
	watch:false
};

Debug.display = [
	{
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
		id:'trace',
		label:'Full Stack Trace',
		checkbox:true
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
										s = i + '(' + JSON.shallow(arguments, 2).replace(/^\[?|\]?$/g, '') + ') => ' + JSON.shallow(r, 2).replace(/^\[?|\]?$/g, '');
										if (Debug.option.trace) {
											console.log('!!! ' + error(s));
										} else {
											console.log('!!! [' + (new Date()).toLocaleTimeString() + '] ' + s);
										}
									}
								}
							}
						} catch(e) {
							console.log(error(e.name + ': ' + e.message));
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
	// Replace the global functions for better log reporting
	log = function(txt){
		return '[' + (new Date()).toLocaleTimeString() + ']' + (Debug.stack.length ? ' '+Debug.stack[0][1]+':' : '') + (txt ? ' ' + txt : '');
	};
	warn = function(txt){
		var i, output = [];
		for (i=0; i<Debug.stack.length; i++) {
			if (!output.length || Debug.stack[i][1] !== output[0]) {
				output.unshift(Debug.stack[i][1]);
			}
		}
		return '[' + (isRelease ? 'v'+version : 'r'+revision) + '] [' + (new Date()).toLocaleTimeString() + '] ' + output.join('->') + ':' + (txt ? ' ' + txt : '');
	};
	error = function(txt) {
		var i, j, output = [];
		for (i=0; i<Debug.stack.length; i++) {
			output.unshift('->' + Debug.stack[i][1] + '.' + Debug.stack[i][2].callee._name + '(' + JSON.shallow(Debug.stack[i][2],2).replace(/^\[|\]$/g,'') + ')');
			for (j=1; j<output.length; j++) {
				output[j] = '  ' + output[j];
			}
		}
		output.unshift(txt ? ': ' + txt : '');
		return '[' + (isRelease ? 'v'+version : 'r'+revision) + '] [' + (new Date()).toLocaleTimeString() + ']' + output.join("\n") + (txt ? '' : "\n:");
	};
};

Debug.init = function() {
	var i, list = [];
	for (i in Workers) {
		list.push(i);
	}
	Config.set('worker_list', ['All', '_worker'].concat(unique(list).sort()));
	$('<img class="golem-button golem-advanced blue" title="Bug Reporting" src="' + getImage('bug') + '">').click(function(){
		window.open('http://code.google.com/p/game-golem/wiki/BugReporting', '_blank'); 
	}).appendTo('#golem_buttons');
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
/*
Debug.menu = function(worker, key) {
	if (worker) {
		if (!key) {
			return {
			}
		} else if (key === '...') {
		}
	}
};
*/
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
	makeTimer, Divisor, length, unique, deleteElement, sum, findInArray, findInObject, objectIndex, sortObject, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
	makeImage
*/
/********** Worker.Global **********
* Purely here for global options - save having too many system panels
*/
var Global = new Worker('Global');
Global.data = Global.runtime = Global.temp = null;
Global.option = {}; // Left in for legacy options

Global.settings = {
	system:true,
	unsortable:true,
	no_disable:true
};

// Use .push() to add our own panel groups
Global.display = [];
/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Dashboard, History:true, Page, Queue, Resources, Land,
	Battle, Generals, LevelUp, Player,
	APP, APPID, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, Divisor, length, unique, deleteElement, sum, findInArray, findInObject, objectIndex, sortObject, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime, warn,
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
History.option = History.temp = null;
History.settings = {
	system:true
};

History.dashboard = function() {
	var list = [];
	list.push('<table cellspacing="0" cellpadding="0" class="golem-graph"><thead><tr><th></th><th colspan="73"><span style="float:left;">&lArr; Older</span>72 Hour History<span style="float:right;">Newer &rArr;</span><th></th></th></tr></thead><tbody>');
	list.push(this.makeGraph(['land', 'income'], 'Income', {prefix:'$', goal:{'Average Income':this.get('land.mean') + this.get('income.mean')}}));
	list.push(this.makeGraph('bank', 'Bank', {prefix:'$', goal:Land.runtime.best ? {'Next Land':Land.runtime.cost} : null})); // <-- probably not the best way to do this, but is there a function to get options like there is for data?
	list.push(this.makeGraph('exp', 'Experience', {goal:{'Next Level':Player.get('maxexp')}}));
	list.push(this.makeGraph('favor points', 'Favor Points',{}));
	list.push(this.makeGraph('exp.change', 'Exp Gain', {goal:{'Average':this.get('exp.average.change'), 'Standard Deviation':this.get('exp.stddev.change'), 'Ignore entries above':(this.get('exp.mean.change') + (2 * this.get('exp.stddev.change')))}} )); // , 'Harmonic Average':this.get('exp.harmonic.change') ,'Median Average':this.get('exp.median.change') ,'Mean Average':this.get('exp.mean.change')
	list.push('</tbody></table>');
	$('#golem-dashboard-History').html(list.join(''));
};

History.update = function(event) {
	var i, hour = Math.floor(Date.now() / 3600000) - 168;
	for (i in this.data) {
		if (i < hour) {
			delete this.data[i];
		}
	}
//	console.log(warn(), 'Exp: '+this.get('exp'));
//	console.log(warn(), 'Exp max: '+this.get('exp.max'));
//	console.log(warn(), 'Exp max change: '+this.get('exp.max.change'));
//	console.log(warn(), 'Exp min: '+this.get('exp.min'));
//	console.log(warn(), 'Exp min change: '+this.get('exp.min.change'));
//	console.log(warn(), 'Exp change: '+this.get('exp.change'));
//	console.log(warn(), 'Exp mean: '+this.get('exp.mean.change'));
//	console.log(warn(), 'Exp harmonic: '+this.get('exp.harmonic.change'));
//	console.log(warn(), 'Exp geometric: '+this.get('exp.geometric.change'));
//	console.log(warn(), 'Exp mode: '+this.get('exp.mode.change'));
//	console.log(warn(), 'Exp median: '+this.get('exp.median.change'));
//	console.log(warn(), 'Average Exp = weighted average: ' + this.get('exp.average.change') + ', mean: ' + this.get('exp.mean.change') + ', geometric: ' + this.get('exp.geometric.change') + ', harmonic: ' + this.get('exp.harmonic.change') + ', mode: ' + this.get('exp.mode.change') + ', median: ' + this.get('exp.median.change'));
};

History.set = function(what, value) {
	if (!value) {
		return;
	}
	this._unflush();
	var hour = Math.floor(Date.now() / 3600000), x = isObject(what) ? what : isString(what) ? what.split('.') : [];
	if (x.length && (typeof x[0] === 'number' || !x[0].regex(/\D/gi))) {
		hour = x.shift();
	}
	this.data[hour] = this.data[hour] || {};
	this.data[hour][x[0]] = value;
};

History.add = function(what, value) {
	if (!value) {
		return;
	}
	this._unflush();
	var hour = Math.floor(Date.now() / 3600000), x = isObject(what) ? what : isString(what) ? what.split('.') : [];
	if (x.length && (typeof x[0] === 'number' || !x[0].regex(/\D/gi))) {
		hour = x.shift();
	}
	this.data[hour] = this.data[hour] || {};
	this.data[hour][x[0]] = (this.data[hour][x[0]] || 0) + value;
};

History.math = {
	stddev: function(list) {
		var i, listsum = 0, mean = this.mean(list);
		for (i in list) {
			listsum += Math.pow(list[i] - mean, 2);
		}
		listsum /= list.length;
		return Math.sqrt(listsum);
	},
	average: function(list) {
		var i, mean = this.mean(list), stddev = this.stddev(list);
		for (i in list) {
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
		var i, num = [];
		for (i in list) {
			if (list[i]) {
				num.push(1/list[i]);
			}
		}
		return num.length / sum(num);
	},
	geometric: function(list) {
		var i, num = 1;
		for (i in list) {
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
		var i, j = 0, count = 0, num = {};
		for (i in list) {
			num[list[i]] = (num[list[i]] || 0) + 1;
		}
		num = sortObject(num, function(a,b){return num[b]-num[a];});
		for (i in num) {
			if (num[i] === num[0]) {
				j += parseInt(num[i], 10);
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
	var i, j, value, last = null, list = [], data = this.data, x = isObject(what) ? what : isString(what) ? what.split('.') : [], hour = Math.floor(Date.now() / 3600000), exact = false, past = 168, change = false;
	if (x.length && (isNumber(x[0]) || !x[0].regex(/\D/gi))) {
		hour = x.shift();
	}
	if (x.length && (isNumber(x[x.length-1]) || !x[x.length-1].regex(/\D/gi))) {
		past = Math.range(1, parseInt(x.pop(), 10), 168);
	}
	if (!x.length) {
		return data;
	}
	for (i in data) {
		if (isNumber(data[i][x[0]])) {
			exact = true;
			break;
		}
	}
	if (x.length === 1) { // only the current value
		if (exact) {
			return data[hour][x[0]];
		}
		for (j in data[hour]) {
			if (j.indexOf(x[0] + '+') === 0 && isNumber(data[hour][j])) {
				value = (value || 0) + data[hour][j];
			}
		}
		return value;
	}
	if (x.length === 2 && x[1] === 'change') {
		if (data[hour] && data[hour-1]) {
			i = this.get([hour, x[0]]);
			j = this.get([hour - 1, x[0]]);
			if (isNumber(i) && isNumber(j)) {
				return i - j;
			}
			return 0;
		}
		return 0;
	}
	if (x.length > 2 && x[2] === 'change') {
		change = true;
	}
	for (i=hour-past; i<=hour; i++) {
		if (data[i]) {
			value = null;
			if (exact) {
				if (isNumber(data[i][x[0]])) {
					value = data[i][x[0]];
				}
			} else {
				for (j in data[i]) {
					if (j.indexOf(x[0] + '+') === 0 && isNumber(data[i][j])) {
						value = (value || 0) + data[i][j];
					}
				}
			}
			if (change) {
				if (value !== null && last !== null) {
					list.push(value - last);
					if (isNaN(list[list.length - 1])) {
						console.log(warn('NaN: '+value+' - '+last));
					}
				}
				last = value;
			} else {
				if (value !== null) {
					list.push(value);
				}
			}
		}
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
	var i, j, count, min = options.min || Number.POSITIVE_INFINITY, max = options.max || Number.NEGATIVE_INFINITY, max_s, min_s, goal_s = [], list = [], bars = [], output = [], value = {}, goalbars = '', divide = 1, suffix = '', hour = Math.floor(Date.now() / 3600000), numbers, prefix = options.prefix || '', goal;
	if (isNumber(options.goal)) {
		goal = [options.goal];
	} else if (!isArray(options.goal) && !isObject(options.goal)) {
		goal = null;
	} else {
		goal = options.goal;
	}
	if (goal && length(goal)) {
		for (i in goal) {
			min = Math.min(min, goal[i]);
			max = Math.max(max, goal[i]);
		}
	}
	if (isString(type)) {
		type = [type];
	}
	for (i=hour-72; i<=hour; i++) {
		value[i] = [0];
		if (this.data[i]) {
			for (j in type) {
				value[i][j] = this.get(i + '.' + type[j]);
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
			bars.push('<div style="bottom:' + Math.max(Math.floor((goal[i] - min) / (max - min) * 100), 0) + 'px;"></div>');
			goal_s.push('<div' + (typeof i !== 'number' ? ' title="'+i+'"' : '') + ' style="bottom:' + Math.range(2, Math.ceil((goal[i] - min) / (max - min) * 100)-2, 92) + 'px;">' + prefix + (goal[i] / divide).addCommas(1) + suffix + '</div>');
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
			bars.push('<div style="height:' + Math.max(Math.ceil(100 * (value[i][j] - (!count ? min : 0)) / (max - min)), 0) + 'px;"></div>');
			count++;
			if (value[i][j]) {
				numbers.push((value[i][j] ? prefix + value[i][j].addCommas() : ''));
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
	makeTimer, Divisor, length, unique, deleteElement, sum, findInArray, findInObject, objectIndex, sortObject, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
	makeImage, unsafeWindow, log, warn, error, chrome, GM_addStyle, GM_getResourceText
*/
/********** Worker.Main **********
* Initial kickstart of Golem.
*/
var Main = new Worker('Main');
Main.data = Main.option = Main.runtime = Main.temp = null;

Main.settings = {
	system:true
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
	var i;
	if (event.id === 'kickstart') {
		for (i in Workers) {
			Workers[i]._setup();
		}
		for (i in Workers) {
			Workers[i]._init();
		}
		for (i in Workers) {
			Workers[i]._update({type:'init', self:true});
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
			console.log('GameGolem: Loading jQuery & jQueryUI');
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
			console.log('GameGolem: No applications known...');
		}
		for (i in this._apps_) {
			if (window.location.pathname.indexOf(i) === 1) {
				APP = i;
				APPID = this._apps_[i][0];
				APPNAME = this._apps_[i][1];
				PREFIX = 'golem'+APPID+'_';
				console.log('GameGolem: Starting '+APPNAME);
				break;
			}
		}
		if (typeof APP === 'undefined') {
			console.log('GameGolem: Unknown application...');
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
		console.log('ERROR: Bad Page Load!!!');
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
				console.log(warn('Bad jQuery selector: $:css(' + args[0] + ' ' + args[1] + ' ' + args[2] + ')'));
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
	this._remind(0, 'kickstart'); // Give a (tiny) delay for CSS files to finish loading etc
};

Main._loaded = true;// Otherwise .update() will never fire - no init needed for us as we're the one that calls it
Main._remind(0, 'startup');
/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page:true, Queue, Resources, Global,
	Battle, Generals, LevelUp, Player,
	APP, APPID, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, Divisor, length, unique, deleteElement, sum, findInArray, findInObject, objectIndex, sortObject, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
	makeImage, log, warn, error
*/
/********** Worker.Page() **********
* All navigation including reloading
*/
var Page = new Worker('Page');

Page.settings = {
	system:true,
	keep:true
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
	timers:{} // Tickers being displayed
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
		Page.temp.checked = true;
	}
	if (Page.option.refresh && Page.temp.count >= Page.option.refresh) {
		if (!state) {
			return QUEUE_CONTINUE;
		}
		Page.to('http://www.cloutman.com/reload.php');
	}
	return this._parent();
});

Page.init = function() {
	if (Global.get(['option','page'], false)) {
		this.set(['option','timeout'], Global.get(['option','page','timeout'], this.option.timeout));
		this.set(['option','reload'], Global.get(['option','page','reload'], this.option.reload));
		this.set(['option','nochat'], Global.get(['option','page','nochat'], this.option.nochat));
		this.set(['option','refresh'], Global.get(['option','page','refresh'], this.option.refresh));
		Global.set(['option','page']);
	}
	this._trigger('#app46755028429_app_body_container, #app46755028429_globalContainer', 'page_change');
	this._trigger('.generic_dialog_popup', 'facebook');
	if (this.option.nochat) {
		$('#fbDockChat').hide();
	}
	$('.golem-link').live('click', function(event){
		if (!Page.to($(this).attr('href'), false)) {
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
				this.runtime.timers[i] = undefined;
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
//			console.log(warn('Page change noticed...'));
			this._forget('retry');
			this.set(['temp', 'loading'], false);
			for (i=0; i<list.length; i++) {
				if (!$(list[i]).length) {
					console.log(warn('Bad page warning: Unabled to find '+list[i]));
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
						//console.log(log('Page:' + Page.page));
						return;
					}
				}
			});
			if (this.page === '') {
				for (i in Page.pageNames) {
					if (Page.pageNames[i].selector && $(Page.pageNames[i].selector).length) {
						//console.log(log('Page:' + Page.page));
						Page.page = i;
					}
				}
			}
			if (this.page !== '') {
				this.data[this.page] = Date.now();
			}
//			console.log(warn('Page.update: ' + (this.page || 'Unknown page') + ' recognised'));
			list = [];
			for (i in Workers) {
				if (Workers[i].parse
				 && Workers[i].pages
				 && (Workers[i].pages.indexOf('*') >= 0 || (this.page !== '' && Workers[i].pages.indexOf(this.page) >= 0))
				 && Workers[i]._parse(false)) {
					list.push(Workers[i]);
				}
			}
			for (i in list) {
				list[i]._parse(true);
			}
			for (i in Workers) {
				Workers[i]._flush();
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
	if (isString(args)) {
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
//	console.log(warn(), 'Page.to("'+page+'", "'+args+'");');
//	if (Queue.option.pause) {
//		console.log(error('Trying to load page when paused...'));
//		return true;
//	}
	if (!page || (!force && page === (this.temp.last || this.page))) {
		return true;
	}
	if (page !== (this.temp.last || this.page)) {
		this.clear();
		this.temp.last = page;
		this.temp.when = Date.now();
		this.set(['temp', 'loading'], true);
		console.log(warn('Navigating to ' + page));
	} else if (force) {
		window.location.href = 'javascript:void((function(){})())';// Force it to change
	}
	window.location.href = 'javascript:void(a46755028429_ajaxLinkSend("globalContainer","' + page + '"))';
	this._remind(this.option.timeout, 'retry');
	this.temp.count++;
	return false;
};

Page.retry = function() {
	if (this.temp.reload || ++this.temp.retry >= this.option.reload) {
		this.reload();
	} else if (this.temp.last) {
		console.log(log('Page load timeout, retry '+this.temp.retry+'...'));
		this.to(this.temp.last, null, true);// Force
	} else if (this.lastclick) {
		console.log(log('Page click timeout, retry '+this.temp.retry+'...'));
		this.click(this.lastclick);
	} else {
		// Probably a bad initial page load...
		// Reload the page - but use an incrimental delay - every time we double it to a maximum of 5 minutes
		this._load('runtime');// Just in case we've got multiple copies
		this.runtime.delay = this.runtime.delay ? Math.max(this.runtime.delay * 2, 300) : this.option.timeout;
		this._save('runtime');// Make sure it's saved for our next try
		this.temp.reload = true;
		$('body').append('<div style="position:absolute;top:100;left:0;width:100%;"><div style="margin:auto;font-size:36px;color:red;">ERROR: Reloading in ' + Page.addTimer('reload',this.runtime.delay * 1000, true) + '</div></div>');
		this.set(['temp', 'loading'], true);
		this._remind(this.runtime.delay, 'retry', {worker:this, type:'init'});// Fake it to force a re-check
		console.log(log('Unexpected retry event.'));
	}
};
		
Page.reload = function() {
	console.log(warn('Page.reload()'));
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
		console.log(log(), 'Page.click: Unable to find element - '+el);
		return false;
	}
	var e, element = $(el).get(0);
	if (this.lastclick !== el) {
		this.clear();
	}
	this.set(['runtime', 'delay'], 0);
	this.lastclick = el; // Causes circular reference when watching...
	this.temp.when = Date.now();
	this.set(['temp', 'loading'], true);
	e = document.createEvent("MouseEvents");
	e.initEvent("click", true, true);
	(element.wrappedJSObject ? element.wrappedJSObject : element).dispatchEvent(e);
	this._remind(this.option.timeout, 'retry');
	this.temp.count++;
	return true;
};

Page.clear = function() {
	this.temp.last = this.lastclick = this.temp.when = null;
	this.temp.retry = 0;
	this.temp.reload = false;
	this.set(['temp', 'loading'], false);
	this.set(['runtime', 'delay'], 0);
};

Page.addTimer = function(id, time, relative) {
	if (relative) {
		time = Date.now() + time;
	}
	this.runtime.timers['golem_timer_'+id] = time;
	return '<span id="golem_timer_'+id+'">' + makeTimer((time - Date.now()) / 1000) + '</span>';
};

Page.delTimer = function(id) {
	this.runtime.timers['golem_timer_'+id] = undefined;
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
				this.set(page, now);
			}
			return false;
		}
	}
	return true;
};
/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page, Queue:true, Resources, Window,
	Battle, Generals, LevelUp, Player,
	APP, APPID, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, window, browser,
	makeTimer, Divisor, length, unique, deleteElement, sum, findInArray, findInObject, objectIndex, sortObject, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
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
	unsortable:true,
	keep:true,
	no_disable:true
};

// NOTE: ALL THIS CRAP MUST MOVE, Queue is a *SYSTEM* worker, so it must know nothing about CA workers or data
Queue.runtime = {
	quest: false, // Use for name of quest if over-riding quest
	general : false, // If necessary to specify a multiple general for attack
	action: false, // Level up action
	stamina:false, //How much stamina can be used by workers, false if none
	energy:false, //How much energy can be used by workers, false if none
	
	// Force is TRUE when energy/stamina is at max or needed to burn to level up,
	// used to tell workers to do anything necessary to use energy/stamina
	force: {energy:false, 
			stamina:false}, 
	burn: {energy:false, // True when burning energy after stocking up
			stamina:false}, // True when burning stamina after stocking up
	current:null
};

Queue.option = {
	queue: ['Global', 'Debug', 'Queue', 'Resources', 'Title', 'Income', 'LevelUp', 'Elite', 'Quest', 'Monster', 'Battle', 'Arena', 'Heal', 'Land', 'Town', 'Bank', 'Alchemy', 'Blessing', 'Gift', 'Upgrade', 'Potions', 'Army', 'Idle'],//Must match worker names exactly - even by case
	delay: 5,
	clickdelay: 5,
	start_stamina: 0,
	stamina: 0,
	start_energy: 0,
	energy: 0,
	pause: false
};

Queue.temp = {
	delay:-1
};

Queue.display = [
	{
		label:'Drag the unlocked panels into the order you wish them run.'
	},{
		id:'delay',
		label:'Delay Between Events',
		text:true,
		after:'secs',
		size:3
	},{
		id:'clickdelay',
		label:'Delay After Mouse Click',
		text:true,
		after:'secs',
		size:3,
		help:'This should be a multiple of Event Delay'
	},{
		id:'stamina',
		before:'Keep',
		select:'stamina',
		after:'Stamina Always'
	},{
		id:'start_stamina',
		before:'Stock Up',
		select:'stamina',
		after:'Stamina Before Using'
	},{
		id:'energy',
		before:'Keep',
		select:'energy',
		after:'Energy Always'
	},{
		id:'start_energy',
		before:'Stock Up',
		select:'energy',
		after:'Energy Before Using'
	}
];

Queue.lastclick = Date.now();	// Last mouse click - don't interrupt the player

Queue.init = function() {
	var i, $btn, worker;
//	this._watch(Player);
	this.option.queue = unique(this.option.queue);
	for (i in Workers) {
		if (Workers[i].work && Workers[i].display) {
			this._watch(Workers[i], 'option._disabled');// Keep an eye out for them going disabled
			if (!findInArray(this.option.queue, i)) {// Add any new workers that have a display (ie, sortable)
				console.log(log('Adding '+i+' to Queue'));
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
				console.log(warn('Trigger '+worker.name+' (continue after load)'));
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
	$('#golem_buttons').prepend('<img class="golem-button' + (this.option.pause?' red':' green') + '" id="golem_pause" src="' + getImage(this.option.pause ? 'play' : 'pause') + '"><img class="golem-button green" id="golem_step" style="display:' + (this.option.pause ? '' : 'none') + '" src="' + getImage('step') + '">');
	$('#golem_pause').click(function() {
		var pause = Queue.set(['option','pause'], !Queue.option.pause);
		console.log(log('State: ' + (pause ? "paused" : "running")));
		$(this).toggleClass('red green').attr('src', getImage(pause ? 'play' : 'pause'));
		if (!pause) {
			$('#golem_step').hide();
		} else if (Config.get('option.advanced', false)) {
			$('#golem_step').show();
		}
		Queue.clearCurrent();
	});
	$('#golem_step').click(function() {
		$(this).toggleClass('red green');
		Queue._update({type:'reminder'}); // A single shot
		$(this).toggleClass('red green');
	});
	// Running the queue every second, options within it give more delay
	this._watch(Page, 'temp.loading');
	this._watch(Session, 'temp.active');
	Title.alias('pause', 'Queue:option.pause:(Pause) ');
	Title.alias('worker', 'Queue:runtime.current::None');
};

Queue.clearCurrent = function() {
//	var current = this.get('runtime.current', null);
//	if (current) {
		$('#golem_config > div > h3').css('font-weight', 'normal');
		this.set('runtime.current', null);// Make sure we deal with changed circumstances
//	}
};

Queue.update = function(event) {
	var i, $worker, worker, current, result, now = Date.now(), next = null, release = false, ensta = ['energy','stamina'], action;
	if (event.type === 'watch' && event.id === 'option._disabled') { // A worker getting disabled / enabled
		if (event.worker.get(['option', '_disabled'], false)) {
			$('#'+event.worker.id+' .golem-panel-header').addClass('red');
			if (this.runtime.current === i) {
				this.clearCurrent();
			}
		} else {
			$('#'+event.worker.id+' .golem-panel-header').removeClass('red');
		}
	} else if (event.type === 'init' || event.type === 'option' || event.type === 'watch') { // options have changed or loading a page
		if (this.option.pause || Page.temp.loading || !Session.temp.active) {
			this._forget('run');
			this.temp.delay = -1;
		} else if (this.option.delay !== this.temp.delay) {
			this._revive(this.option.delay, 'run');
			this.temp.delay = this.option.delay;
		}
	} else if (event.type === 'reminder') { // This is where we call worker.work() for everyone
		if (now - this.lastclick < this.option.clickdelay * 1000) { // Want to make sure we delay after a click
			return;
		}

		this.runtime.stamina = this.runtime.energy = 0;
		this.runtime.levelup = this.runtime.basehit = this.runtime.quest = this.runtime.general = this.runtime.force.stamina = this.runtime.force.energy = this.runtime.big = false;
		LevelUp.set('runtime.running',false);
		for (i=0; i<ensta.length; i++) {
			if (Player.get(ensta[i]) >= Player.get('max'+ensta[i])) {
				console.log(warn('At max ' + ensta[i] + ', burning ' + ensta[i] + ' first.'));
				this.runtime[ensta[i]] = Player.get(ensta[i]);
				this.runtime.force[ensta[i]] = true;
				break;
			}
		}
		if (!LevelUp.get(['option', '_disabled'], false) && !this.runtime.stamina && !this.runtime.energy 
				 && LevelUp.get('exp_possible') > Player.get('exp_needed')) {
			action = LevelUp.runtime.action = LevelUp.findAction('best', Player.get('energy'), Player.get('stamina'), Player.get('exp_needed'));
			if (action.exp) {
				this.runtime.energy = action.energy;
				this.runtime.stamina = action.stamina;
				this.runtime.levelup = true;
				mode = (action.energy ? 'defend' : 'attack');
				stat = (action.energy ? 'energy' : 'stamina');
				if (action.quest) {
					this.runtime.quest = action.quest;
				}
				this.runtime.basehit = ((action.basehit < Monster.get('option.attack_min')) 
						? action.basehit : false);
				this.runtime.big = action.big;
				if (action.big) {
					this.runtime.general = action.general || (LevelUp.option.general === 'any' 
							? false 
							: LevelUp.option.general === 'Manual' 
							? LevelUp.option.general_choice
							: LevelUp.option.general );
					this.runtime.basehit = action.basehit;
				} else if (action.basehit === action[stat] && !Monster.get('option.best_'+mode) && Monster.get('option.general_' + mode) in Generals.get('runtime.multipliers')) {
					console.log(warn('Overriding manual general that multiplies attack/defense'));
					this.runtime.general = (action.stamina ? 'monster_attack' : 'monster_defend');
				}
				Queue.runtime.force.stamina = (action.stamina !== 0);
				Queue.runtime.force.energy = (action.energy !== 0);
				console.log(warn('Leveling up: force burn ' + (this.runtime.stamina ? 'stamina' : 'energy') + ' ' + (this.runtime.stamina || this.runtime.energy)));
				//console.log(warn('Level up general ' + this.runtime.general + ' base ' + this.runtime.basehit + ' action[stat] ' + action[stat] + ' best ' + !Monster.get('option.best_'+mode) + ' muly ' + (Monster.get('option.general_' + mode) in Generals.get('runtime.multipliers'))));
				LevelUp.runtime.running = true;
			}
		}
		if (!this.runtime.stamina && !this.runtime.energy) {
			if (this.runtime.burn.stamina || Player.get('stamina') >= this.option.start_stamina) {
				this.runtime.stamina = Math.max(0, Player.get('stamina') - this.option.stamina);
				this.runtime.burn.stamina = this.runtime.stamina > 0;
			}
			if (this.runtime.burn.energy || Player.get('energy') >= this.option.start_energy) {
				this.runtime.energy = Math.max(0, Player.get('energy') - this.option.energy);
				this.runtime.burn.energy = this.runtime.energy > 0;
			}
		} else {
			if (this.runtime.force.stamina && Player.get('health') < 13) {
				LevelUp.set('runtime.heal_me',true);
			}
		}
		this._push();
		for (i in Workers) { // Run any workers that don't have a display, can never get focus!!
			if (Workers[i].work && !Workers[i].display && !Workers[i].get(['option', '_disabled'], false) && !Workers[i].get(['option', '_sleep'], false)) {
				console.log(warn(Workers[i].name + '.work(false);'));
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
//			console.log(warn(worker.name + '.work(' + (this.runtime.current === worker.name) + ');'));
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
			console.log(warn('Trigger ' + next.name));
			this.set('runtime.current', next.name);
			if (next.id) {
				$('#'+next.id+' > h3').css('font-weight', 'bold');
			}
			this._notify('runtime.current');
		}
//		console.log(warn('End Queue'));
		for (i in Workers) {
			Workers[i]._flush();
		}
		this._pop();
	}
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
	makeTimer, Divisor, length, unique, deleteElement, sum, findInArray, findInObject, objectIndex, sortObject, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
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
	display.push({label:'Not doing anything yet...'});
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
				title:type
			},{
				advanced:true,
				id:'reserve.'+type,
				label:'Reserve',
				text:true
			},{
				id:'types.'+type,
				label:type+' Use',
				select:{0:'None',1:'Shared',2:'Exclusive'}
			},{
				group:group,
				require:'types.'+type+'==2'
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
// /(\(?)\s*("[^"]*"|[\d]+|[^\s><=!*^$&|]+)\s*(\)?)\s*(>|>=|={1,2}|<=|<|!={1,2}|&{1,2}|\|{1,2})?\s*/g

// '!testing.blah=1234 & yet.another.path | !something & test.me > 5'
// [["testing","blah"],"=",1234,"&",["yet","another","path"],"|",["something"],"&",["test","me"],">",5]

var Script = new Worker('Script');
Script.data = Script.runtime = Script.temp = null;

Script.option = {
	worker:'Player',
	type:'data'
};

Script.settings = {
	system:true,
	advanced:true
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
//	html += '<br style="clear:both;"><input type="text" id="golem_script_edit" placeholder="Enter code here" style="width:570px;">';
	html += '<br style="clear:both;"><textarea id="golem_script_edit" placeholder="Enter code here" style="width:570px;"></textarea>';
	html += '<textarea id="golem_script_source" placeholder="Compiled code" style="width:570px;" disabled></textarea>';
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
		$('#golem_script_result').val(Script.interpret(script)).autoSize();
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
	// Unary
	['!',	true,	function(l) {return !l;}],
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
		} else {
			args = value_list.splice(tmp[1], value_list.length - tmp[1]); // Args from the end
		}
		if (this._operators[tmp[0]][1]) {
			args = this._expand(args);
		}
//		console.log(log('Perform: '+this._operators[tmp[0]][0]+'('+args+')'));
		value_list.push(fn.apply(this, args));
	}
	if (this._operators[op]) {
		op_list.unshift([op, value_list.length]);
	}
};

Script._return = undefined;

// Interpret our script, return a single value
Script._interpret = function(_script) {
	var x, x2, fn, value_list = [], op_list = [], script = _script.slice(0), test;
	while (!this._return && (x = script.shift())) {
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
			} else if (/^[A-Z][\w\.]+$/.test(x)) {
				x = x.split('.');
				value_list.push(Workers[x[0]]._get(x.slice(1), false));
			} else if (/^".*"$/.test(x)) {
				value_list.push(x.replace(/^"|"$/g, ''));
			} else if (x[0] === '#') {
				value_list.push(x);
			} else {
				console.log(error('Bad string format: '+x));
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
	var atoms = text.regex(/\s*("[^"]*"|[\d]+|true|false|[#A-Za-z_][\w\.]*|\(|\)|\{|\}|;|[^#\w\.\s"]+)[\s\n\r]*/g);
	if (!atoms) {
		return []; // Empty script
	}
	map = map || {};
	return (function() {
		var atom, path, script = [];
		while ((atom = atoms.shift())) {
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
			} else if (atom[0] === '#' // variable
				|| isNumber(atom) // number
				|| /^".*"$/.test(atom) // string
				|| Script._find(atom, Script._operators) !== -1 // operator
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
//		console.log('Script section: '+JSON.stringify(script));
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
	makeTimer, Divisor, length, unique, deleteElement, sum, findInArray, findInObject, objectIndex, sortObject, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
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
	$('.golem-title').after('<div id="golem_session" class="golem-info golem-button green" style="display:none;">Enabled</div>');
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
//						console.log(log('Need to replace '+i+'.'+j+' with newer data'));
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
	makeTimer, Divisor, length, unique, deleteElement, sum, findInArray, findInObject, objectIndex, sortObject, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime, makeImage,
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
	no_disable:true
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
	var i, j, total, path = this.temp.worker+'.'+this.temp.edit, html = '', storage = [];
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
		total = 0;
		for (i in Workers) {
			for (j in Workers[i]._storage) {
				if (Workers[i]._storage[j]) {
					total += Workers[i]._storage[j];
					storage.push('<tr><th>' + i + '.' + j + '</th><td style="text-align:right;">' + Workers[i]._storage[j].addCommas() + ' bytes</td></tr>');
				}
			}
		}
		html += ' No worker specified (total ' + total.addCommas() +' bytes)';
		html += '<br><table>' + storage.join('') + '</table>';
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
		html += '<br><textarea id="golem_settings_edit" style="width:570px;">' + JSON.stringify(Workers[this.temp.worker][this.temp.edit], null, '   ') + '</textarea>';
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
	makeTimer, Divisor, length, unique, deleteElement, sum, findInArray, findInObject, objectIndex, sortObject, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
	makeImage
*/
/********** Worker.Title **********
* Changes the window title to user defined data.
* String may contain {stamina} or {Player:stamina} using the worker name (default Player)
*/
var Title = new Worker('Title');
Title.data = null;

Title.settings = {
	system:true
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
			size:24
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
						console.log(warn(), 'Bad worker specified = "' + tmp[1] + '"');
					}
				}
			}
		}
		if (!this.temp.old) {
			this.temp.old = document.title;
		}
		if (!document.title || output !== document.title) {
			document.title = output;
		}
	} else if (this.temp.old) {
		document.title = this.temp.old;
		this.temp.old = null;
	}
};

/***** Title.alias() *****
* Pass a name and a string in the format "Worker:path.to.data[:txt if true[:txt if false]]"
*/
Title.alias = function(name,str) {
	this.temp.alias[name] = str;
};

/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page, Queue, Resources,
	Battle, Generals, LevelUp, Player,
	APP, APPID, log, debug, userID, imagepath, isRelease:true, version, revision, Workers, PREFIX, window, browser, GM_xmlhttpRequest,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, Divisor, length, unique, deleteElement, sum, findInArray, findInObject, objectIndex, sortObject, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
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
	this.temp.version = version;
	this.temp.revision = revision;
	this.runtime.version = this.runtime.version || version;
	this.runtime.revision = this.runtime.revision || revision;
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
	$('<img class="golem-button golem-version" title="Check for Updates" src="' + getImage('update') + '">').click(function(){
		$(this).addClass('red');
		Update.checkVersion(true);
	}).appendTo('#golem_buttons');
	if (isRelease) { // Add an advanced "beta" button for official release versions
		$('<img class="golem-button golem-version golem-advanced"' + (Config.get('option.advanced') ? '' : ' style="display:none;"') + ' title="Check for Beta Versions" src="' + getImage('beta') + '">').click(function(){
			isRelease = false;// Isn't persistant, so nothing visible to the user except the beta release
			$(this).addClass('red');
			Update.checkVersion(true);
		}).appendTo('#golem_buttons');
	}
	// Add a changelog advanced button
	$('<img class="golem-button golem-advanced blue"' + (Config.get('option.advanced') ? '' : ' style="display:none;"') + ' title="Changelog" src="' + getImage('log') + '">').click(function(){
		window.open('http://code.google.com/p/game-golem/source/list', '_blank'); 
	}).appendTo('#golem_buttons');
	// Add a wiki button
	$('<img class="golem-button blue" title="GameGolem wiki" src="' + getImage('wiki') + '">').click(function(){
		window.open('http://code.google.com/p/game-golem/wiki/castle_age', '_blank'); 
	}).appendTo('#golem_buttons');
	$('head').bind('DOMNodeInserted', function(event){
		if (event.target.nodeName === 'META' && $(event.target).attr('name') === 'golem-version') {
			tmp = $(event.target).attr('content').regex(/(\d+\.\d+)\.(\d+)/);
			if (tmp) {
				Update._remind(21600, 'check');// 6 hours
				Update.runtime.lastcheck = Date.now();
				Update.runtime.version = tmp[0];
				Update.runtime.revision = tmp[1];
				if (Update.runtime.force && Update.temp.version >= tmp[0] && (isRelease || Update.temp.revision >= tmp[1])) {
					$('<div class="golem-button golem-info red">No Update Found</div>').animate({'z-index':0}, {duration:5000,complete:function(){$(this).remove();} }).insertAfter('#golem_buttons');
				}
				Update.runtime.force = false;
				$('.golem-version').removeClass('red');
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
		console.log(log(), 'New version available: ' + this.runtime.version + '.' + this.runtime.revision + ', currently on ' + version + '.' + revision);
		if (this.runtime.version > this.temp.version) {
			$('#golem_buttons').after('<div class="golem-button golem-info green" title="' + this.runtime.version + '.' + this.runtime.revision + ' released, currently on ' + version + '.' + revision + '"><a href="' + this.temp.url_1 + '">New Version Available</a></div>');
		}
		if (!isRelease && this.runtime.revision > this.temp.revision) {
			$('#golem_buttons').after('<div class="golem-button golem-info green" title="' + this.runtime.version + '.' + this.runtime.revision + ' released, currently on ' + version + '.' + revision + '"><a href="' + this.temp.url_2 + '">New Beta Available</a></div>');
		}
		this.temp.version = this.runtime.version;
		this.temp.revision = this.runtime.revision;
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
	makeTimer, Divisor, length, unique, deleteElement, sum, findInArray, findInObject, objectIndex, sortObject, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
	makeImage
*/
/********** Worker.Alchemy **********
* Get all ingredients and recipes
*/
var Alchemy = new Worker('Alchemy');
Alchemy.temp = null;

Alchemy.settings = {
	//taint:true
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
	best:null
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
	if (Page.page === 'keep_alchemy') {
		this.data.ingredients = {};
		this.data.recipe = {};
		this.data.summons = {};
		var $elements = $('div.alchemyQuestBack,div.alchemyRecipeBack,div.alchemyRecipeBackMonster');
		if (!$elements.length) {
			console.log(warn(), 'Can\'t find any alchemy ingredients...');
	//		Page.to('keep_alchemy', false); // Force reload
			return false;
		}
		$elements.each(function(i,el){
			var recipe = {}, title = $('div.recipeTitle', el).text().trim().replace('RECIPES: ','');
			if (title.indexOf(' (')>0) {
				title = title.substr(0, title.indexOf(' ('));
			}
			if ($(el).hasClass('alchemyQuestBack')) {
				recipe.type = 'Quest';
			} else if ($(el).hasClass('alchemyRecipeBack')) {
				recipe.type = 'Recipe';
			} else if ($(el).hasClass('alchemyRecipeBackMonster')) {
				recipe.type = 'Summons';
			}
			recipe.ingredients = {};
			$('div.recipeImgContainer', el).parent().each(function(i,el){
				var name = $('img', el).attr('src').filepart();
				recipe.ingredients[name] = ($(el).text().regex(/x(\d+)/) || 1);
				Alchemy.data.ingredients[name] = 0;// Make sure we know an ingredient exists
				if (recipe.type === 'Summons') {
					Alchemy.data.summons[name] = true;// Make sure we know an ingredient exists
				}
			});
			Alchemy.data.recipe[title] = recipe;
		});
		$('div.ingredientUnit').each(function(i,el){
			var name = $('img', el).attr('src').filepart();
			Alchemy.data.ingredients[name] = $(el).text().regex(/x(\d+)/);
		});
		this._notify('data.ingredients');
		this._notify('data.recipe');
		this._notify('data.summons');
	} else if (Page.page === 'keep_stats') {
		// Only when it's our own keep and not someone elses
		if ($('.keep_attribute_section').length) {
			var tmp = $('.statsTTitle:contains("ALCHEMY INGREDIENTS") + .statsTMain .statUnit');
			if (tmp.length) {
				tmp.each(function(a, el) {
					var b = $('a img[src]', el);
					var i = $(b).attr('src').filepart();
					var n = ($(b).attr('title') || $(b).attr('alt') || '').trim();
					var c = $(el).text().regex(/\bX\s*(\d+)\b/i);
					if (i) {
						Alchemy.set(['data', i], c || 0);
					}
				});
			}
		}
	}
};

Alchemy.update = function(event) {
	var best = null, recipe = this.data.recipe, r, i;
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
	this.runtime.best = best;
};

Alchemy.work = function(state) {
	if (!this.runtime.best) {
		return QUEUE_FINISH;
	}
	if (!state || !Page.to('keep_alchemy')) {
		return QUEUE_CONTINUE;
	}
	console.log(warn(), 'Perform - ' + this.runtime.best);
	if (!Page.click($('input[type="image"]', $('div.recipeTitle:contains("' + this.runtime.best + '")').next()))) {
		Page.reload(); // Can't find the recipe we just parsed when coming here...
	}
	return QUEUE_RELEASE;
};

/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page:true, Queue, Resources,
	Battle, Generals, LevelUp, Player,
	APP, APPID, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, Divisor, length, unique, deleteElement, sum, findInArray, findInObject, objectIndex, sortObject, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
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
			this._save('runtime');
		}
	}
});

Army._overload('castle_age', 'parse', function(change) {
	if (change && Page.page === 'keep_stats' && !$('.keep_attribute_section').length) { // Not our own keep
		var uid = $('.linkwhite a').attr('href').regex(/=(\d+)$/);
		console.log('Not our keep, uid: '+uid);
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
	//			console.log(warn(), 'Adding: ' + JSON.stringify(army));
			});
		} else {
			this._set(['runtime','page'], 0);// No real members on this page so stop looking.
			this._set(['runtime','check'], false);
		}
		$tmp = $('img[src*="bonus_member.jpg"]');
		if ($tmp.length) {
			this.runtime.extra = 1 + $tmp.parent().next().text().regex('Extra member x(\d+)');
//			console.log(log(), 'Extra Army Members Found: '+Army.runtime.extra);
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
//		console.log(warn(), 'parse: Army.runtime = '+JSON.stringify(this.runtime));
	}
	return this._parent() || true;
});

Army._overload('castle_age', 'update', function(event) {
	this._parent();
	if (!this.option._disabled && event.type !== 'data' && (!this.runtime.page || (this.option.recheck && !this.runtime.oldest))) {
		var i, page = this.runtime.page, army = this.data, ai, now = Date.now(), then = now - this.option.recheck, oldest = this.runtime.oldest;
		if (!page && this.option.auto && Player.get('armymax',0) !== (this.runtime.count + this.runtime.extra)) {
			console.log(log(), 'Army size ('+Player.get('armymax',0)+') does not match cache ('+(this.runtime.count + this.runtime.extra)+'), checking from page 1');
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
//		console.log(warn(), 'update('+JSON.shallow(event,1)+'): Army.runtime = '+JSON.stringify(this.runtime));
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
	makeTimer, Divisor, length, unique, deleteElement, sum, findInArray, findInObject, objectIndex, sortObject, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
	makeImage
*/
/********** Worker.Bank **********
* Auto-banking
*/
var Bank = new Worker('Bank');
Bank.data = null;

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
	if ('status' in this.option) {
		this.option._hide_status = !this.option.status;
		delete this.option.status;
	}
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
	makeTimer, Divisor, length, unique, deleteElement, sum, findInArray, findInObject, objectIndex, sortObject, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
	makeImage, getImage
*/
/********** Worker.Battle **********
* Battling other players (NOT raid or Arena)
*/
var Battle = new Worker('Battle');

Battle.settings = {
	//taint: true
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
	points:false
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
		hr:true,
		title:'Preferred Targets'
	},{
		advanced:true,
		id:'preferonly',
		label:'Fight Preferred',
		select:['Never', 'Sometimes', 'Only', 'Until Dead']
	},{
		advanced:true,
		id:'prefer',
		multiple:'userid'
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
		this.option.points = this.option.points ? (this.option.type === 'War' ? 'Duel' : this.option.type) : 'Never';
		$(':golem(Battle,points)').val(this.option.points);
	}
	for (i in data) {
		if (data[i].rank) {
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
		this.set('option.limit', i);
	}

	$('.Battle-prefer-on').live('click', function(event) {
		Battle._unflush();
		var uid = $(this).attr('name');
		var prefs = Battle.get('option.prefer');
		if (uid && findInArray(prefs, uid)) {
			deleteElement(prefs, uid);
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
		if (uid && !findInArray(prefs, uid)) {
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
	var data, uid, tmp, myrank, mode = this.option.type === 'War' ? 'war' : 'battle';
	if (Page.page === 'battle_rank') {
		data = {0:{name:'Newbie',points:0}};
		$('tr[height="23"]').each(function(i,el){
			var info = $(el).text().regex(/Rank (\d+) - (.*)\s*(\d+)/i);
			data[info[0]] = {name:info[1], points:info[2]};
		});
		this.data.battle.rank = data;
		this.data.battle.bp = $('span:contains("Battle Points.")', 'div:contains("You are a Rank")').text().replace(/,/g, '').regex(/with (\d+) Battle Points/i);
	} else if (Page.page === 'battle_war') {
		data = {0:{name:'Newbie',points:0}};
		$('tr[height="23"]').each(function(i,el){
			var info = $(el).text().regex(/Rank (\d+) - (.*)\s*(\d+)/i);
			data[info[0]] = {name:info[1], points:info[2]};
		});
		this.data.war.rank = data;
	} else if (Page.page === 'battle_battle') {
		data = this.data.user;
		if (this.runtime.attacking) {
			uid = this.runtime.attacking;
			this.runtime.attacking = null;
			if ($('div.results').text().match(/You cannot battle someone in your army/i)) {
				delete data[uid];
			} else if ($('div.results').text().match(/This trainee is too weak. Challenge someone closer to your level/i)) {
				delete data[uid];
			} else if ($('div.results').text().match(/They are too high level for you to attack right now/i)) {
				delete data[uid];
			} else if ($('div.results').text().match(/Their army is far greater than yours! Build up your army first before attacking this player!/i)) {
				delete data[uid];
			} else if ($('div.results').text().match(/Your opponent is dead or too weak/i)) {
				data[uid].hide = (data[uid].hide || 0) + 1;
				data[uid].dead = Date.now();
//			} else if (!$('div.results').text().match(new RegExp(data[uid].name.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&")+"( fought with:|'s Army of (\d+) fought with|'s Defense)",'i'))) {
//			} else if (!$('div.results').text().match(data[uid].name)) {
//				this.runtime.attacking = uid; // Don't remove target as we've hit someone else...
//				console.log(warn(), 'wrong ID');
			} else if ($('img[src*="battle_victory"]').length) {
				this.data[mode].bp = $('span.result_body:contains(" Points.")').text().replace(/,/g, '').regex(/total of (\d+) \w+ Points/i);
				data[uid][mode].win = (data[uid][mode].win || 0) + 1;
				data[uid].last = Date.now();
				History.add('battle+win',1);
				if (this.option.chain && (data[uid][mode].win % this.option.chain)) {
					this.runtime.attacking = uid;
				}
				data[uid].last = Date.now();
				//console.log(warn(), 'win');
			} else if ($('img[src*="battle_defeat"]').length) {
				data[uid][mode].loss = (data[uid][mode].loss || 0) + 1;
				data[uid].last = Date.now();
				History.add('battle+loss',-1);
				//console.log(warn(), 'loss');
			} else {
				this.runtime.attacking = uid; // Don't remove target as we've not hit them...
			}
		}
		tmp = $('#app46755028429_app_body table.layout table div div:contains("Once a day you can")').text().replace(/[^0-9\/]/g ,'').regex(/(\d+)\/10(\d+)\/10(\d+)\/10(\d+)\/10(\d+)\/10/);
		if (tmp) {
			this.data.points = tmp;
		}
		myrank = Player.get(mode,0);
		$('#app46755028429_app_body table.layout table table tr:even').each(function(i,el){
			var uid = $('img[uid!==""]', el).attr('uid'), info = $('td.bluelink', el).text().replace(/[ \t\n]+/g, ' '), battle_rank = info.regex(/Battle:[^(]+\(Rank (\d+)\)/i), war_rank = info.regex(/War:[^(]+\(Rank (\d+)\)/i), rank;
			rank = mode === 'War' ? war_rank : battle_rank;
			if (!uid || !info || (Battle.option.bp === 'Always' && myrank - rank > 5) || (Battle.option.bp === 'Never' && myrank - rank <= 5)) {
				return;
			}
			data[uid] = data[uid] || {};
			data[uid].name = $('a', el).text().trim();
			data[uid].level = info.regex(/\(Level (\d+)\)/i);
			data[uid].battle = data[uid].battle || {};
			data[uid].war = data[uid].war || {};
			data[uid].battle.rank = battle_rank;
			data[uid].war.rank = war_rank;
			data[uid].army = $('td.bluelink', el).next().text().regex(/(\d+)/);
			data[uid].align = $('img[src*="graphics/symbol_"]', el).attr('src').regex(/symbol_(\d)/i);
		});
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
	var i, j, data = this.data.user, list = [], points = false, status = [], army = Player.get('army',0), level = Player.get('level'), mode = this.option.type === 'War' ? 'war' : 'battle', rank = Player.get(mode,0), count = 0, skip, limit, enabled = !this.get(['option', '_disabled'], false);
	status.push('Rank ' + rank + ' ' + (rank && this.data[mode].rank[rank] && this.data[mode].rank[rank].name) + ' with ' + (this.data[mode].bp || 0).addCommas() + ' Battle Points, Targets: ' + length(data) + ' / ' + this.option.cache);
	if (event.type === 'watch' && event.id === 'option.prefer') {
		this.dashboard();
		return;
	}
	if (this.option.points !== 'Never') {
		status.push('Demi Points Earned Today: '
		+ '<img class="golem-image" src="' + this.symbol[1] +'" alt=" " title="'+this.demi[1]+'"> ' + (this.data.points[0] || 0) + '/10 '
		+ '<img class="golem-image" src="' + this.symbol[2] +'" alt=" " title="'+this.demi[2]+'"> ' + (this.data.points[1] || 0) + '/10 '
		+ '<img class="golem-image" src="' + this.symbol[3] +'" alt=" " title="'+this.demi[3]+'"> ' + (this.data.points[2] || 0) + '/10 '
		+ '<img class="golem-image" src="' + this.symbol[4] +'" alt=" " title="'+this.demi[4]+'"> ' + (this.data.points[3] || 0) + '/10 '
		+ '<img class="golem-image" src="' + this.symbol[5] +'" alt=" " title="'+this.demi[5]+'"> ' + (this.data.points[4] || 0) + '/10');
	}
	// First make check our target list doesn't need reducing
        limit = this.option.limit;
	if (!isNumber(limit)) {
		limit = -4;
	}
	for (i in data) { // Forget low or high rank - no points or too many points
		if ((this.option.bp === 'Always' && (data[i][mode].rank|| 0) - rank  <= limit) || (this.option.bp === 'Never' && rank - (data[i][mode].rank || 6) <= 5)) { // unknown rank never deleted
			delete data[i];
		}
	}
	if (length(data) > this.option.cache) { // Need to prune our target cache
//		console.log(warn(), 'Pruning target cache');
		list = [];
		for (i in data) {
/*			weight = Math.range(-10, (data[i][mode].win || 0) - (data[i][mode].loss || 0), 20) / 2;
			if (Battle.option.bp === 'Always') { weight += ((data[i][mode].rank || 0) - rank) / 2; }
			else if (Battle.option.bp === 'Never') { weight += (rank - (data[i][mode].rank || 0)) / 2; }
			weight += Math.range(-1, (data[b].hide || 0) - (data[a].hide || 0), 1);
			weight += Math.range(-10, (((data[a].army || 0) - (data[b].army || 0)) / 10), 10);
			weight += Math.range(-10, (((data[a].level || 0) - (data[b].level || 0)) / 10), 10);
*/
			list.push(i);
		}
		list.sort(function(a,b) {
			var weight = 0;
				 if (((data[a].win || 0) - (data[a].loss || 0)) < ((data[b].win || 0) - (data[b].loss || 0))) { weight += 10; }
			else if (((data[a].win || 0) - (data[a].loss || 0)) > ((data[b].win || 0) - (data[b].loss || 0))) { weight -= 10; }
			if (Battle.option.bp === 'Always') { weight += ((data[b].rank || 0) - (data[a].rank || 0)) / 2; }
			if (Battle.option.bp === 'Never') { weight += ((data[a].rank || 0) - (data[b].rank || 0)) / 2; }
			weight += Math.range(-1, (data[b].hide || 0) - (data[a].hide || 0), 1);
			weight += Math.range(-10, (((data[a].army || 0) - (data[b].army || 0)) / 10), 10);
			weight += Math.range(-10, (((data[a].level || 0) - (data[b].level || 0)) / 10), 10);
			return weight;
		});
		while (list.length > this.option.cache) {
			delete data[list.pop()];
		}
	}
	// Check if we need Demi-points
        //console.log(warn(), 'Queue Logic = ' + enabled);
	points = this.runtime.points = (this.option.points !== 'Never' && this.data.points && sum(this.data.points) < 50 && enabled);
	// Second choose our next target
/*	if (!points.length && this.option.arena && Arena.option.enabled && Arena.runtime.attacking) {
		this.runtime.attacking = null;
		status.push('Battling in the Arena');
	} else*/
	if (!points && (this.option.monster || !Queue.runtime.big) && Monster.get('runtime.attack',false)) {
		this.runtime.attacking = null;
		status.push('Attacking Monsters');
	} else {
		if (!this.runtime.attacking || !data[this.runtime.attacking]
				|| (this.option.army !== 'Any' && (data[this.runtime.attacking].army / army) * (data[this.runtime.attacking].level / level) > this.option.army)
				|| (this.option.level !== 'Any' && (data[this.runtime.attacking].level / level) > this.option.level)
				|| (this.option.type === 'War' 
					&& data[this.runtime.attacking].last 
					&& data[this.runtime.attacking].last + 300000 < Date.now())) {
			this.runtime.attacking = null;
		}
		//console.log(log('data[this.runtime.attacking].last ' + data[this.runtime.attacking].last+ ' Date.now() '+ Date.now()) + ' test ' + (data[this.runtime.attacking].last + 300000 >= Date.now()));
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
			this.runtime.attacking = list[Math.floor(Math.random() * list.length)];
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
			this.runtime.attacking = null;
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
	var useable_stamina = Queue.runtime.force.stamina ? Queue.runtime.stamina : Queue.runtime.stamina - this.option.stamina_reserve;
	if (!this.runtime.attacking || Player.get('health',0) < (this.option.risk ? 10 : 13) || useable_stamina < (!this.runtime.points && this.option.type === 'War' ? 10 : 1)) {
//		console.log(warn(), 'Not attacking because: ' + (this.runtime.attacking ? '' : 'No Target, ') + 'Health: ' + Player.get('health',0) + ' (must be >=10), Burn Stamina: ' + useable_stamina + ' (must be >=1)');
		return QUEUE_FINISH;
	}
	if (!state || !Generals.to(this.option.general ? (this.runtime.points ? this.option.points : this.option.type) : this.option.general_choice) || !Page.to('battle_battle')) {
		return QUEUE_CONTINUE;
	}
	/*jslint onevar:false*/
	var $symbol_rows = $('#app46755028429_app_body table.layout table table tr:even').has('img[src*="graphics/symbol_'+this.data.user[this.runtime.attacking].align+'"]');
	var $form = $('form input[alt="' + (this.runtime.points ? this.option.points : this.option.type) + '"]', $symbol_rows).first().parents('form');
	/*jslint onevar:true*/
	if (!$form.length) {
		console.log(warn(), 'Unable to find ' + (this.runtime.points ? this.option.points : this.option.type) + ' button, forcing reload');
		Page.to('index');
	} else {
		console.log(log(), (this.runtime.points ? this.option.points : this.option.type) + ' ' + this.data.user[this.runtime.attacking].name + ' (' + this.runtime.attacking + ')');
		$('input[name="target_id"]', $form).attr('value', this.runtime.attacking);
		Page.click($('input[type="image"]', $form));
	}
	return QUEUE_RELEASE;
};

Battle.rank = function(name) {
	var mode = this.option.type === 'War' ? 'war' : 'battle';
	for (var i in Battle.data[mode].rank) {
		if (Battle.data[mode].rank[i].name === name) {
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
		td(output, this.data[mode].rank[data[mode].rank] ? this.data[mode].rank[data[mode].rank].name : '');
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
	makeTimer, Divisor, length, unique, deleteElement, sum, findInArray, findInObject, objectIndex, sortObject, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
	makeImage
*/
/********** Worker.Blessing **********
* Automatically receive blessings
*/
var Blessing = new Worker('Blessing');
Blessing.data = Blessing.temp = null;

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
	if ('display' in this.option) {
		this.option._hide_status = !this.option.display;
		delete this.option.display;
	}
};

Blessing.init = function() {
	if (this.runtime.when) {
		this._remind((this.runtime.when - Date.now()) / 1000, 'blessing');
	}
};

Blessing.parse = function(change) {
	var result = $('div.results'), time;
	if (result.length) {
		time = result.text().regex(/Please come back in: (\d+) hours and (\d+) minutes/i);
		if (time && time.length) {
			this.runtime.when = Date.now() + (((time[0] * 60) + time[1] + 1) * 60000);
		} else if (result.text().match(/You have paid tribute to/i)) {
			this.runtime.when = Date.now() + 86460000; // 24 hours and 1 minute
		}
		if (this.runtime.when) {
			this._remind((this.runtime.when - Date.now()) / 1000, 'blessing');
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
	makeTimer, Divisor, length, unique, deleteElement, sum, findInArray, findInObject, objectIndex, sortObject, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
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
		title:'Fill Elite Guard',
		group:[
			{
				id:'friends',
				label:'Facebook Friends Only',
				checkbox:true
			},{
				id:'every',
				label:'Every',
				select:[1, 2, 3, 6, 12, 24],
				after:'hours',
				help:'Although people can leave your Elite Guard after 24 hours, after 12 hours you can re-confirm them'
			}
		]
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
			this._save('runtime');
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
				console.log(warn(), 'Elite guard full, wait '+Elite.option.every+' hours');
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
		console.log(warn(), 'Add ' + Army.get(['_info', this.runtime.nextelite, 'name'], this.runtime.nextelite) + ' to Elite Guard');
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
	makeTimer, Divisor, length, unique, deleteElement, sum, findInArray, findInObject, objectIndex, sortObject, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
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
	taint:true
};

Generals.defaults['castle_age'] = {
	pages:'* heroes_generals keep_stats'
};

Generals.runtime = {
	multipliers: {}, // Attack multipliers list for Orc King and Barbarus type generals
	force: false,
	armymax:1 // Don't force someone with a small army to buy a whole load of extra items...
};

Generals.init = function() {
	if (!Player.get('attack') || !Player.get('defense')) { // Only need them the first time...
		this._watch(Player, 'data.attack');
		this._watch(Player, 'data.defense');
	}
	this._watch(Town, 'runtime.invade');
	this._watch(Town, 'runtime.duel');
};

Generals.parse = function(change) {
	var i, j, data = {}, bonus = [], current, stale = false;
	if ($('div.results').text().match(/has gained a level!/i)) {
		if ((current = Player.get('general'))) { // Our stats have changed but we don't care - they'll update as soon as we see the Generals page again...
			this.set(['data',current,'level'], this.get(['data',current,'level'], 0) + 1);
			stale = true;
		}
	}
	if (Page.page === 'heroes_generals') {
		current = $('div.general_name_div3').first().text().trim();
		if (this.data[current]){
			$('div[style*="model_items.jpg"] img[title]').each(function(i){
				var temp = $(this).attr('title');
				if (temp && temp.indexOf("[not owned]") === -1){
					bonus.push(temp.replace(/\<[^>]*\>|\s+|\n/g,' ').trim());
					//console.log(warn("Found weapon: " + bonus[bonus.length]));
				}
			});
			this.set(['data',current,'weaponbonus'], bonus.join(', '));
			i = $('div.general_pic_div3 a img[title]').first().attr('title').trim();
			if (i && (j = i.regex(/\bmax\.? (\d+)\b/i))) {
				this.set(['data', current, 'stats', 'cap'], j);
			}
		}
		$('.generalSmallContainer2').each(function(i,el){
			var name = $('.general_name_div3_padding', el).text().trim(), level = parseInt($(el).text().regex(/Level (\d+)/i), 10), x;
			if (name && name.indexOf('\t') === -1 && name.length < 30) { // Stop the "All generals in one box" bug
				data[name] = true;
				Generals.set(['data',name,'id'], $('input[name=item]', el).val());
				Generals.set(['data',name,'type'], $('input[name=itype]', el).val());
				Generals.set(['data',name,'img'], $('.imgButton', el).attr('src').filepart());
				Generals.set(['data',name,'att'], $('.generals_indv_stats_padding div:eq(0)', el).text().regex(/(\d+)/));
				Generals.set(['data',name,'def'], $('.generals_indv_stats_padding div:eq(1)', el).text().regex(/(\d+)/));
				Generals.set(['data',name,'progress'], parseInt($('div.generals_indv_stats', el).next().children().children().children().next().attr('style').regex(/width: (\d*\.*\d+)%/i), 10));
				Generals.set(['data',name,'level'], level); // Might only be 4 so far, however...
				Generals.set(['data',name,'skills'], $(el).children(':last').html().replace(/\<[^>]*\>|\s+|\n/g,' ').trim());
				if (level >= 4){	// If we just leveled up to level 4, remove the priority
					Generals.set(['data',name,'priority']);
				}
			}
		});
		for (i in this.data) {
			if (!data[i]) {
				this.set(['data',i]);
			}
		}
	} else if (Page.page === 'keep_stats') {
		// Only when it's our own keep and not someone elses
		if ($('.keep_attribute_section').length) {
			var tmp = $('.statsTTitle:contains("HEROES") + .statsTMain .statUnit');
			if (tmp.length) {
				tmp.each(function(a, el) {
					var b = $('a img[src]', el);
					var n = ($(b).attr('title') || $(b).attr('alt') || '').trim();
					if (n && !Generals.data[n]) {
						stale = true;
						return false;
					}
				});
			}
		}
	}
	if (stale) {
		Page.set(['data', 'heroes_generals'], 0);
	}
	return false;
};

Generals.update = function(event) {
	var data = this.data, i, pa, priority_list = [], list = [], invade = Town.get('runtime.invade',0), duel = Town.get('runtime.duel',0), attack, attack_bonus, defend, defense_bonus, army, gen_att, gen_def, attack_potential, defense_potential, att_when_att_potential, def_when_att_potential, att_when_att = 0, def_when_att = 0, monster_att = 0, monster_multiplier = 1, current_att, current_def, listpush = function(list,i){list.push(i);}, skillcombo, calcStats = false;

	if (event.type === 'init' || event.type === 'data') {
		for (i in data) {
			list.push(i);
			if (data[i].level < 4) { // Take all existing priorities and change them to rank starting from 1 and keeping existing order.
				priority_list.push([i, data[i].priority]);
			}
			if (!data[i].stats) { // Force an update if stats not yet calculated
				this.set(['runtime','force'], true);
			}
			if (data[i].skills) {
				var x, y, num = 0, cap = 0, item, str = null;
				if ((x = data[i].skills.regex(/\bevery (\d+) ([\w\s']*[\w])/i))) {
					num = x[0];
					str = x[1];
				} else if ((x = data[i].skills.regex(/\bevery ([\w\s']*[\w])/i))) {
					num = 1;
					str = x;
				}
				if (data[i].stats && data[i].stats.cap) {
					cap = Math.max(cap, data[i].stats.cap);
				}
				if ((x = data[i].skills.regex(/\bmax\.? (\d+)/i))) {
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
//					console.log(warn('Save ' + (num * cap) + ' x ' + item + ' for General ' + i));
				}
			}
		}
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
		Config.set('generals', ['any','under level 4'].concat(list.sort())); 
	}
	
	if (((event.type === 'data' || event.worker.name === 'Town' || event.worker.name === 'Player' || this.runtime.force) && invade && duel)) {
		this.set(['runtime','force'], false);
		if (event.worker.name === 'Player' && Player.get('attack') && Player.get('defense')) {
			this._unwatch(Player); // Only need them the first time...
		}
		for (i in data) {
			skillcombo = (data[i].skills || '') + ';' + (data[i].weaponbonus || '');
			attack_bonus = Math.floor(sum(skillcombo.regex(/([-+]?\d*\.?\d+) Player Attack|Increase Player Attack by (\d+)|Convert ([-+]?\d+\.?\d*) Attack/gi)) + (sum(data[i].skills.regex(/Increase ([-+]?\d+\.?\d*) Player Attack for every Hero Owned/gi)) * (length(data)-1)));
			defense_bonus = Math.floor(sum(skillcombo.regex(/([-+]?\d*\.?\d+) Player Defense|Increase Player Defense by (\d+)/gi))	
				+ sum(data[i].skills.regex(/Increase Player Defense by ([-+]?\d*\.?\d+) for every 3 Health/gi)) * Player.get('health') / 3
				+ (sum(data[i].skills.regex(/Increase ([-+]?\d*\.?\d+) Player Defense for every Hero Owned/gi)) * (length(data)-1)));
			attack = (Player.get('attack') + attack_bonus
						- (sum(skillcombo.regex(/Transfer (\d+)% Attack to Defense/gi)) * Player.get('attack') / 100).round(0) 
						+ (sum(skillcombo.regex(/Transfer (\d+)% Defense to Attack/gi)) * Player.get('defense') / 100).round(0));
			defend = (Player.get('defense') + defense_bonus
						+ (sum(skillcombo.regex(/Transfer (\d+)% Attack to Defense/gi)) * Player.get('attack') / 100).round(0) 
						- (sum(skillcombo.regex(/Transfer (\d+)% Defense to Attack/gi)) * Player.get('defense') / 100).round(0));
			attack_potential = Player.get('attack') + (attack_bonus * 4) / data[i].level;	// Approximation
			defense_potential = Player.get('defense') + (defense_bonus * 4) / data[i].level;	// Approximation
			army = Math.min(Player.get('armymax'),(sum(skillcombo.regex(/Increases? Army Limit to (\d+)/gi)) || 501));
			gen_att = getAttDef(data, listpush, 'att', Math.floor(army / 5));
			gen_def = getAttDef(data, listpush, 'def', Math.floor(army / 5));
			att_when_att = sum(skillcombo.regex(/Increase Player Attack when Defending by ([-+]?\d+)/gi));
			def_when_att = sum(skillcombo.regex(/([-+]?\d+) Defense when attacked/gi));
			att_when_att_potential = (att_when_att * 4) / data[i].level;	// Approximation
			def_when_att_potential = (def_when_att * 4) / data[i].level;	// Approximation
			monster_att = sum(skillcombo.regex(/([-+]?\d+) Monster attack/gi));
			monster_multiplier = 1.1 + sum(skillcombo.regex(/([-+]?\d+)% Critical/gi))/100;
			if ((pa = sum(skillcombo.regex(/Increase Power Attacks by (\d+)/gi)))) {
				this.set(['runtime','multipliers',i], pa);
			}
			current_att = data[i].att + parseInt(sum(data[i].skills.regex(/'s Attack by ([-+]?\d+)/gi)), 10) + (typeof data[i].weaponbonus !== 'undefined' ? parseInt(sum(data[i].weaponbonus.regex(/([-+]?\d+) attack/gi)), 10) : 0);	// Need to grab weapon bonuses without grabbing Serene's skill bonus
			current_def = data[i].def + (typeof data[i].weaponbonus !== 'undefined' ? parseInt(sum(data[i].weaponbonus.regex(/([-+]?\d+) defense/gi)), 10) : 0);
//			console.log(warn(i + ' attack: ' + current_att + ' = ' + data[i].att + ' + ' + parseInt((data[i].skills.regex(/'s Attack by ([-+]?\d+)/gi) || 0)) + ' + ' + parseInt((data[i].weaponbonus.regex(/([-+]?\d+) attack/gi) || 0))));
			this.set(['data',i,'invade'], {
				att: Math.floor(invade.attack + current_att + (current_def * 0.7) + ((attack + (defend * 0.7)) * army) + gen_att),
				def: Math.floor(invade.defend + current_def + (current_att * 0.7) + ((defend + def_when_att + ((attack + att_when_att) * 0.7)) * army) + gen_def)
			});
			cap = this.get(['data', i, 'stats', 'cap']);
			this.set(['data',i,'stats'], {
				stamina: sum(skillcombo.regex(/Increase Max Stamina by (\d+)|([-+]?\d+) Max Stamina/gi)) 
						+ (sum(skillcombo.regex(/Transfer (\d+)% Max Energy to Max Stamina/gi)) * Player.get('maxenergy') / 100/2).round(0)
						- (sum(skillcombo.regex(/Transfer (\d+)% Max Stamina to Max Energy/gi)) * Player.get('maxstamina') / 100).round(0),
				energy:	sum(skillcombo.regex(/Increase Max Energy by (\d+)|([-+]?\d+) Max Energy/gi))
						- (sum(skillcombo.regex(/Transfer (\d+)% Max Energy to Max Stamina/gi)) * Player.get('maxenergy') / 100).round(0)
						+ (sum(skillcombo.regex(/Transfer (\d+)% Max Stamina to Max Energy/gi)) * Player.get('maxstamina') / 100*2).round(0)
			});
			if (cap) {
				this.set(['data', i, 'stats', 'cap'], cap);
			}
			this.set(['data',i,'duel'], {
				att: Math.floor(duel.attack + current_att + (current_def * 0.7) + attack + (defend * 0.7)),
				def: Math.floor(duel.defend + current_def + (current_att * 0.7) + defend + def_when_att + ((attack + att_when_att) * 0.7))
			});
			this.set(['data',i,'monster'], {
				att: Math.floor(monster_multiplier * (duel.attack + current_att + attack + monster_att)),
				def: Math.floor(duel.defend + current_def + defend) // Fortify, so no def_when_att
			});
/*			if (i === 'Xira' || i === 'Slayer') {
				console.log(warn(i +' skillcombo:'+skillcombo+' regex'+sum(data[i].skills.regex(/Increase Player Defense  by ([-+]?\d+\.?\d*) for every 3 Health/gi))+' attack:'+attack+' defend:'+defend));
			}
*/
			this.set(['data',i,'potential'], {
				bank: (skillcombo.regex(/Bank Fee/gi) ? 1 : 0),
				defense: Math.floor(duel.defend + (data[i].def + 4 - data[i].level) + ((data[i].att + 4 - data[i].level) * 0.7) + defense_potential + def_when_att_potential + ((attack_potential + att_when_att_potential) * 0.7)),
				income: (skillcombo.regex(/Increase Income by (\d+)/gi) * 4) / data[i].level,
				invade: Math.floor(invade.attack + (data[i].att + 4 - data[i].level) + ((data[i].def + 4 - data[i].level) * 0.7) + ((attack_potential + (defense_potential * 0.7)) * army) + gen_att),
				duel: Math.floor(duel.attack + (data[i].att + 4 - data[i].level) + ((data[i].def + 4 - data[i].level) * 0.7) + attack_potential + (defense_potential * 0.7)),
				monster: Math.floor(duel.attack + (data[i].att + 4 - data[i].level) + attack_potential + (monster_att * 4) / data[i].level),
				raid_invade: 0,
				raid_duel: 0,
				influence: (skillcombo.regex(/Influence (\d+)% Faster/gi) || 0),
				drops: (skillcombo.regex(/Chance (\d+)% Drops/gi) || 0),
				demi: (skillcombo.regex(/Extra Demi Points/gi) ? 1 : 0),
				cash: (skillcombo.regex(/Bonus (\d+) Gold/gi) || 0)
			});
			this.set(['data',i,'potential','raid_invade'], data[i].potential.defense + data[i].potential.invade);
			this.set(['data',i,'potential','raid_duel'], data[i].potential.defense + data[i].potential.duel);

			this.set(['runtime','armymax'], Math.max(army, this.runtime.armymax));
		}
	}
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
		console.log(warn('General "'+name+'" requested but not found!'));
		return true; // Not found, so fake it
	}
	if (!this.test(name)) {
		console.log(log('General rejected due to energy or stamina loss: ' + Player.get('general') + ' to ' + name));
		return true;
	}
	console.log(warn('General change: ' + Player.get('general') + ' to ' + name));
	Page.to('heroes_generals', this.data[name].id && this.data[name].type ? {item:this.data[name].id, itype:this.data[name].type} : null, true);
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
	this._unflush();
	if (this.data[type]) {
		return type;
	}
	var rx, value, first, second;
	switch(type.toLowerCase()) {
		case 'cost':			rx = /Decrease Soldier Cost by (\d+)/gi; break;
		case 'stamina':			rx = /Increase Max Stamina by (\d+)|\+(\d+) Max Stamina/gi; break;
		case 'energy':			rx = /Increase Max Energy by (\d+)|\+(\d+) Max Energy/gi; break;
		case 'income':			rx = /Increase Income by (\d+)/gi; break;
		case 'item':			rx = /(\d+)% Drops for Quest/gi; break;
		case 'influence':		rx = /Bonus Influence (\d+)/gi; break;
		case 'defense':			rx = /([-+]?\d+) Player Defense/gi; break;
		case 'cash':			rx = /Bonus (\d+) Gold/gi; break;
		case 'bank':			return 'Aeris';
		case 'war':				rx = /\+(\d+) Attack to your entire War Council|-(\d+) Attack to your opponents War Council/gi; break;
		case 'raid-invade':		// Fall through
		case 'invade':			first = 'invade';	second = 'att'; break;
		case 'raid-duel':		// Fall through
		case 'duel':			first = 'duel';		second = 'att'; break;
		case 'monster_attack':	first = 'monster';	second = 'att'; break;
		case 'dispel':			// Fall through
		case 'monster_defend':	first = 'monster';	second = 'def'; break;
		case 'defend':			first = 'duel';		second = 'def'; break;
		case 'under level 4':	value = function(g) { return (g.priority ? -g.priority : null); }; break;
		default:  				return 'any';
	}
	if (rx) {
		value = function(g) { return sum(g.skills.regex(rx)); };
	} else if (first && second) {
		value = function(g) { return (g[first] ? g[first][second] : null); };
	} else if (!value) {
		console.log(warn('No definition for best general for ' + type)); // Should be caught by switch() above
		return 'any';
	}
	return (bestObjValue(this.data, value, Generals.test) || 'any');
};

Generals.order = [];
Generals.dashboard = function(sort, rev) {
	var i, o, output = [], list = [], iatt = 0, idef = 0, datt = 0, ddef = 0, matt = 0, mdef = 0;

	if (typeof sort === 'undefined') {
		this.order = [];
		for (i in this.data) {
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
	if (typeof sort !== 'undefined') {
		this.order.sort(function(a,b) {
			var aa, bb, type, x;
			if (sort === 1) {
				aa = a;
				bb = b;
			} else if (sort === 2) {
				aa = (Generals.data[a].level || 0);
				bb = (Generals.data[b].level || 0);
			} else if (sort === 3) {
				aa = (Generals.data[a].priority || 999999);
				bb = (Generals.data[b].priority || 999999);
			} else {
				type = (sort<6 ? 'invade' : (sort<8 ? 'duel' : 'monster'));
				x = (sort%2 ? 'def' : 'att');
				aa = (Generals.data[a][type] ? (Generals.data[a][type][x] || 0) : 0);
				bb = (Generals.data[b][type] ? (Generals.data[b][type][x] || 0) : 0);
			}
			if (typeof aa === 'string' || typeof bb === 'string') {
				return (rev ? (''+bb).localeCompare(aa) : (''+aa).localeCompare(bb));
			}
			return (rev ? aa - bb : bb - aa);
		});
	}
	for (i in this.data) {
		iatt = Math.max(iatt, this.data[i].invade ? this.data[i].invade.att : 1);
		idef = Math.max(idef, this.data[i].invade ? this.data[i].invade.def : 1);
		datt = Math.max(datt, this.data[i].duel ? this.data[i].duel.att : 1);
		ddef = Math.max(ddef, this.data[i].duel ? this.data[i].duel.def : 1);
		matt = Math.max(matt, this.data[i].monster ? this.data[i].monster.att : 1);
		mdef = Math.max(mdef, this.data[i].monster ? this.data[i].monster.def : 1);
	}
	list.push('<table cellspacing="0" style="width:100%"><thead><tr><th></th><th>General</th><th>Level</th><th>Quest<br>Rank</th><th>Invade<br>Attack</th><th>Invade<br>Defend</th><th>Duel<br>Attack</th><th>Duel<br>Defend</th><th>Monster<br>Attack</th><th>Fortify<br>Dispel</th></tr></thead><tbody>');
	for (o=0; o<this.order.length; o++) {
		i = this.order[o];
		output = [];
		output.push('<a class="golem-link" href="generals.php?item=' + this.data[i].id + '&itype=' + this.data[i].type + '"><img src="' + imagepath + this.data[i].img+'" style="width:25px;height:25px;" title="Skills: ' + this.data[i].skills + ', Weapon Bonus: ' + (typeof this.data[i].weaponbonus !== 'unknown' ? (this.data[i].weaponbonus ? this.data[i].weaponbonus : 'none') : 'unknown') + '"></a>');
		output.push(i);
		output.push('<div'+(isNumber(this.data[i].progress) ? ' title="'+this.data[i].progress+'%"' : '')+'>'+this.data[i].level+'</div><div style="background-color: #9ba5b1; height: 2px; width=100%;"><div style="background-color: #1b3541; float: left; height: 2px; width: '+(this.data[i].progress || 0)+'%;"></div></div>');
		output.push(this.data[i].priority ? ((this.data[i].priority !== 1 ? '<a class="golem-moveup" name='+this.data[i].priority+'>&uarr</a> ' : '&nbsp;&nbsp; ') + this.data[i].priority + (this.data[i].priority !== this.runtime.max_priority ? ' <a class="golem-movedown" name='+this.data[i].priority+'>&darr</a>' : ' &nbsp;&nbsp;')) : '');
		output.push(this.data[i].invade ? (iatt === this.data[i].invade.att ? '<strong>' : '') + (this.data[i].invade.att).addCommas() + (iatt === this.data[i].invade.att ? '</strong>' : '') : '?');
		output.push(this.data[i].invade ? (idef === this.data[i].invade.def ? '<strong>' : '') + (this.data[i].invade.def).addCommas() + (idef === this.data[i].invade.def ? '</strong>' : '') : '?');
		output.push(this.data[i].duel ? (datt === this.data[i].duel.att ? '<strong>' : '') + (this.data[i].duel.att).addCommas() + (datt === this.data[i].duel.att ? '</strong>' : '') : '?');
		output.push(this.data[i].duel ? (ddef === this.data[i].duel.def ? '<strong>' : '') + (this.data[i].duel.def).addCommas() + (ddef === this.data[i].duel.def ? '</strong>' : '') : '?');
		output.push(this.data[i].monster ? (matt === this.data[i].monster.att ? '<strong>' : '') + (this.data[i].monster.att).addCommas() + (matt === this.data[i].monster.att ? '</strong>' : '') : '?');
		output.push(this.data[i].monster ? (mdef === this.data[i].monster.def ? '<strong>' : '') + (this.data[i].monster.def).addCommas() + (mdef === this.data[i].monster.def ? '</strong>' : '') : '?');
		list.push('<tr><td>' + output.join('</td><td>') + '</td></tr>');
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
			console.log(log('Priority: Swapping '+gup+' with '+gdown));
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
			console.log(log('Priority: Swapping '+gup+' with '+gdown));
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


/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page, Queue, Resources,
	Battle, Generals, LevelUp, Player,
	APP, APPID, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, Divisor, length, unique, deleteElement, sum, findInArray, findInObject, objectIndex, sortObject, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
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
			console.log(warn('Facebook popup parsed...'));
		}
		return false;
	}
	var i, j, id, $tmp, gifts = this.data.gifts, todo = this.data.todo, received = this.data.received;
	//alert('Gift.parse running');
	if (Page.page === 'index') {
		// We need to get the image of the gift from the index page.
//		console.log(warn('Checking for a waiting gift and getting the id of the gift.'));
		if ($('span.result_body').text().indexOf('has sent you a gift') >= 0) {
			this.runtime.gift.sender_ca_name = $('span.result_body').text().regex(/[\t\n]*(.+) has sent you a gift/i);
			this.runtime.gift.name = $('span.result_body').text().regex(/has sent you a gift:\s+(.+)!/i);
			this.runtime.gift.id = $('span.result_body img').attr('src').filepart();
			console.log(warn(this.runtime.gift.sender_ca_name + ' has a ' + this.runtime.gift.name + ' waiting for you. (' + this.runtime.gift.id + ')'));
			this.runtime.gift_waiting = true;
			return true;
		} else if ($('span.result_body').text().indexOf('warrior wants to join your Army') >= 0) {
			this.runtime.gift.sender_ca_name = 'A Warrior';
			this.runtime.gift.name = 'Random Soldier';
			this.runtime.gift.id = 'random_soldier';
			console.log(warn(this.runtime.gift.sender_ca_name + ' has a ' + this.runtime.gift.name + ' waiting for you.'));
			this.runtime.gift_waiting = true;
			return true;
		} else {
//			console.log(warn(), 'No more waiting gifts. Did we miss the gift accepted page?');
			this.runtime.gift_waiting = false;
			this.runtime.gift = {}; // reset our runtime gift tracker
		}
	} else if (Page.page === 'army_invite') {
		// Accepted gift first
//		console.log(warn(), 'Checking for accepted gift.');
		if (this.runtime.gift.sender_id) { // if we have already determined the ID of the sender
			if ($('div.game').text().indexOf('accepted the gift') >= 0 || $('div.game').text().indexOf('have been awarded the gift') >= 0) { // and we have just accepted a gift
				console.log(warn('Accepted ' + this.runtime.gift.name + ' from ' + this.runtime.gift.sender_ca_name + '(id:' + this.runtime.gift.sender_id + ')'));
				received.push(this.runtime.gift); // add the gift to our list of received gifts.  We will use this to clear facebook notifications and possibly return gifts
				this.runtime.work = true;	// We need to clear our facebook notifications and/or return gifts
				this.runtime.gift = {}; // reset our runtime gift tracker
			}
		}
		// Check for gifts
//		console.log(warn('Checking for waiting gifts and getting the id of the sender if we already have the sender\'s name.'));
		if ($('div.messages').text().indexOf('a gift') >= 0) { // This will trigger if there are gifts waiting
			this.runtime.gift_waiting = true;
			if (!this.runtime.gift.id) { // We haven't gotten the info from the index page yet.
				return false;	// let the work function send us to the index page to get the info.
			}
//			console.log(warn('Sender Name: ' + $('div.messages img[title*="' + this.runtime.gift.sender_ca_name + '"]').first().attr('title')));
			this.runtime.gift.sender_id = $('div.messages img[uid]').first().attr('uid'); // get the ID of the gift sender. (The sender listed on the index page should always be the first sender listed on the army page.)
			if (this.runtime.gift.sender_id) {
				this.runtime.gift.sender_fb_name = $('div.messages img[uid]').first().attr('title');
//				console.log(warn('Found ' + this.runtime.gift.sender_fb_name + "'s ID. (" + this.runtime.gift.sender_id + ')'));
			} else {
				console.log(log("Can't find the gift sender's ID: " + this.runtime.gift.sender_id));
			}
		} else {
//			console.log(warn('No more waiting gifts. Did we miss the gift accepted page?'));
			this.runtime.gift_waiting = false;
			this.runtime.gift = {}; // reset our runtime gift tracker
		}
	
	} else if (Page.page === 'gift_accept'){
		// Check for sent
//		console.log(warn('Checking for sent gifts.'));
		if (this.runtime.sent_id && $('div#app46755028429_results_main_wrapper').text().indexOf('You have sent') >= 0) {
			console.log(warn(gifts[this.runtime.sent_id].name+' sent.'));
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
//		console.log(warn('Parsing gifts.'));
		gifts = this.data.gifts = {};
		// Gifts start at 1
		for (i=1, $tmp=[0]; $tmp.length; i++) {
			$tmp = $('#app46755028429_gift'+i);
			if ($tmp.length) {
				id = $('img', $tmp).attr('src').filepart();
				gifts[id] = {slot:i, name: $tmp.text().trim().replace('!','')};
//				console.log(warn('Adding: '+gifts[id].name+' ('+id+') to slot '+i));
			}
		}
	} else {
		if ($('div.result').text().indexOf('have exceed') !== -1){
			console.log(warn('We have run out of gifts to send.  Waiting one hour to retry.'));
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
//		console.log(warn('Accepting ' + this.runtime.gift.name + ' from ' + this.runtime.gift.sender_ca_name + '(id:' + this.runtime.gift.sender_id + ')'));
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
				console.log(warn(received[i].id+' was not found in our sendable gift list.'));
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
						console.log(warn('Will randomly send a ' + this.data.gifts[gift_ids[random_gift_id]].name + ' to ' + received[i].sender_ca_name));
						if (!todo[gift_ids[random_gift_id]]) {
							todo[gift_ids[random_gift_id]] = [];
						}
						todo[gift_ids[random_gift_id]].push(received[i].sender_id);
					}
					this.runtime.work = true;
					break;
				case 'Same as Received':
					console.log(warn('Will return a ' + received[i].name + ' to ' + received[i].sender_ca_name));
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
//		console.log(warn('Waiting for FB popup.'));
		if ($('div.dialog_buttons input[name="sendit"]').length){
			this.runtime.gift_sent = null;
			Page.click('div.dialog_buttons input[name="sendit"]');
		} else if ($('span:contains("Out of requests")').text().indexOf('Out of requests') >= 0) {
			console.log(warn('We have run out of gifts to send.  Waiting one hour to retry.'));
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
				console.log(warn('Unavaliable gift ('+i+') found in todo list. Will randomly send a ' + this.data.gifts[gift_ids[random_gift_id]].name + ' instead.'));
				if (!todo[gift_ids[random_gift_id]]) {
					todo[gift_ids[random_gift_id]] = [];
				}
				for (j in todo[i]) {
					todo[gift_ids[random_gift_id]].push(todo[i][j]);
				}
				delete todo[i];
				return QUEUE_CONTINUE;
			}
			if ($('div[style*="giftpage_select"] div a[href*="giftSelection='+this.data.gifts[i].slot+'"]').length){
				if ($('img[src*="gift_invite_castle_on"]').length){
					if ($('div.unselected_list').children().length) {
						console.log(warn('Sending out ' + this.data.gifts[i].name));
						k = 0;
						for (j=todo[i].length-1; j>=0; j--) {
							if (k< 10) {	// Need to limit to 10 at a time
								if (!$('div.unselected_list input[value=\'' + todo[i][j] + '\']').length){
//									console.log(warn('User '+todo[i][j]+' wasn\'t in the CA friend list.'));
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
	makeTimer, Divisor, length, unique, deleteElement, sum, findInArray, findInObject, objectIndex, sortObject, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
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
		console.log(log('Healing...'));
		Page.click('input[value="Heal Wounds"]');
	} else {
		console.log(warn('Danger Danger Will Robinson... Unable to heal!'));
		this.set(['option','_disabled'], true);
	}
	return false;
};

/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page, Queue, Resources,
	Battle, Generals, LevelUp, Player,
	APP, APPID, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, Divisor, length, unique, deleteElement, sum, findInArray, findInObject, objectIndex, sortObject, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
	makeImage
*/
/********** Worker.Idle **********
* Set the idle general
* Keep focus for disabling other workers
*/
var Idle = new Worker('Idle');
Idle.temp = null;

Idle.defaults['castle_age'] = {};
Idle.settings ={
    after:['LevelUp']
};

Idle.data = null;
Idle.option = {
	general:'any',
	index:86400000,
	alchemy:86400000,
	quests:0,
	town:0,
	keep:0,
//	arena:0,
	battle:900000,
	monsters:3600000,
	collect:0
};

//Idle.when = ['Never', 'Quarterly', 'Hourly', '2 Hours', '6 Hours', '12 Hours', 'Daily', 'Weekly'];
Idle.when = {
	0:'Never',
	900000:'Quarterly',
	3600000:'Hourly',
	7200000:'2 Hours',
	21600000:'6 Hours',
	43200000:'12 Hours',
	86400000:'Daily',
	604800000:'Weekly'
};

Idle.display = [
	{
		label:'<strong>NOTE:</strong> Any workers below this will <strong>not</strong> run!<br>Use this for disabling workers you do not use.'
	},{
		id:'general',
		label:'Idle General',
		select:'generals'
	},{
		label:'Check Pages:'
	},{
		id:'index',
		label:'Home Page',
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
	},{
		id:'collect',
		label:'Apprentice Reward',
		select:Idle.when
	}
];

Idle.pages = {
	index:['index'],
	alchemy:['keep_alchemy'],
	quests:['quests_quest1', 'quests_quest2', 'quests_quest3', 'quests_quest4', 'quests_quest5', 'quests_quest6', 'quests_quest7', 'quests_quest8', 'quests_quest9', 'quests_demiquests', 'quests_atlantis'],
	town:['town_soldiers', 'town_blacksmith', 'town_magic', 'town_land'],
	keep:['keep_stats'],
//	arena:['battle_arena'],
	battle:['battle_battle'],
	monsters:['monster_monster_list', 'battle_raid', 'festival_monster_list'],
	collect:['apprentice_collect']
};

Idle.work = function(state) {
	if (!state || !Generals.to(this.option.general)) {
		return true;
	}
	var i, p;
	for (i in this.pages) {
		if (this.option[i]) {
			for (p=0; p<this.pages[i].length; p++) {
				if (!Page.stale(this.pages[i][p], this.option[i] / 1000, true)) {
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
	makeTimer, Divisor, length, unique, deleteElement, sum, findInArray, findInObject, objectIndex, sortObject, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
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
				console.log(log('Waiting for Income... (' + Player.get('cash_timer') + ' seconds)'));
			}
		} else if (this.temp.bank) {
			if (!Bank.stash()) {
				console.log(log('Banking Income...'));
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
	makeTimer, Divisor, length, unique, deleteElement, sum, findInArray, findInObject, objectIndex, sortObject, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
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
	this._watch(Page, 'data.town_land');	// watch for land triggers
};

Land.parse = function(change) {
	var modify = false, tmp;

	if (Page.page === 'town_land') {
		// land data
		$('div[style*="town_land_bar."],div[style*="town_land_bar_special."]').each(function(a, el) {
			var name = $('div img[alt]', el).attr('alt').trim(), data, s, v;
			if (name) {
				if (!change) {
					data = {};
					if ((s = $('div div:contains("Max Allowed For your level:")', el).text()) && isNumber(v = s.replace(/,/g, '').regex(/Max Allowed For your level: (\d+)/i))) {
						data.max = v;
					}
					if ((s = $('div div:contains("Income:") strong', el).text()) && isNumber(v = s.replace(/\D/g, '').regex(/(\d+)/))) {
						data.income = v;
					}
					if ((s = $('div div:contains("Owned:") strong.gold', el).text()) && isNumber(v = s.replace(/\D/g, '').regex(/(\d+)/))) {
						data.cost = v;
					}
					if ((s = $('div div:contains("Owned:")', el).text()) && isNumber(v = s.replace(/\s+/g, ' ').replace(/,/g, '').regex(/Owned: (\d+)/i))) {
						data.own = v;
					}
					if ((s = $('form[id*="_prop_"]', el)).length) {
						if (isNumber(v = s.attr('id').regex(/_prop_(\d+)/i))) {
							data.id = v;
						}
						data.buy = [];
						$('select[name="amount"] option', s).each(function(b, el) {
							var v = parseFloat($(el).val());
							if (v && isNumber(v)) {
								data.buy.push(v);
							}
						})
					}
					if ((s = $('form[id*="_propsell_"]', el)).length) {
						if (isNumber(v = s.attr('id').regex(/_propsell_(\d+)/i))) {
							data.id = v;
						}
						data.sell = [];
						$('select[name="amount"] option', s).each(function(b, el) {
							var v = parseFloat($(el).val());
							if (v && isNumber(v)) {
								data.sell.push(v);
							}
						})
					}
					Land.set(['data',name], data);
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
				var b = $('a img[src]', el);
				var n = ($(b).attr('alt') || '').trim();
				var c = $(el).text().regex(/\bX\s*(\d+)\b/i);
				if (!Land.data[n]) {
					Page.set('data.town_land', 0);
				} else if (Land.data[n].own != c) {
					Land.set(['data', n, 'own'], c);
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
			b_cost = best ? (this.data[best].cost || 0) : 1e50;
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
				console.log(warn(), 'Can\'t find Land sell form for',
				  this.runtime.best,
				  'id[' + this.data[this.runtime.best].id + ']');
				this.set('runtime.snooze', Date.now() + 60000);
				this._remind(60.1, 'sell_land');
				return QUEUE_RELEASE;
			} else {
				q = bestValue(this.data[this.runtime.best].sell, Math.abs(this.runtime.buy));
				console.log(warn(), 'Selling ' + q + '/' + Math.abs(this.runtime.buy) + ' x ' + this.runtime.best + ' for $' + Math.abs(this.runtime.cost).SI());

				$('select[name="amount"]', o).val(q);
				console.log(warn(), 'Land.sell:', q, 'x', this.runtime.best);
				Page.click($('input[name="Sell"]', o));
				return QUEUE_CONTINUE;
			}
		} else if (this.runtime.buy > 0) {
			if (!(o = $('form#app'+APPID+'_prop_'+this.data[this.runtime.best].id)).length) {
				console.log(warn(), 'Can\'t find Land buy form for',
				  this.runtime.best,
				  'id[' + this.data[this.runtime.best].id + ']');
				this.set('runtime.snooze', Date.now() + 60000);
				this._remind(60.1, 'buy_land');
				return QUEUE_RELEASE;
			} else {
				q = bestValueHi(this.data[this.runtime.best].buy, this.runtime.buy);
				console.log(warn(), 'Buying ' + q + '/' + this.runtime.buy + ' x ' + this.runtime.best + ' for $' + Math.abs(this.runtime.cost).SI());

				$('select[name="amount"]', o).val(q);
				console.log(warn(), 'Land.buy:', q, 'x', this.runtime.best);
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
	makeTimer, Divisor, length, unique, deleteElement, sum, findInArray, findInObject, objectIndex, sortObject, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
	makeImage, calc_rolling_weighted_average, bestValue, bestObjValue
*/
/********** Worker.LevelUp **********
* Will give us a quicker level-up, optionally changing the general to gain extra stats
* 1. Switches generals to specified general
* 2. Changes the best Quest to the one that will get the most exp (rinse and repeat until no energy left) - and set Queue.burn.energy to max available
* 3. Will call Heal.me() function if current health is under 10 and there is any stamina available (So Battle/Arena/Monster can automatically use up the stamina.)
* 4. Will set Queue.burn.stamina to max available
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
	energy:0,
	stamina:0,
	last_energy:'quest',
	last_stamina:'attack',
	exp:0,
	exp_possible:0,
	avg_exp_per_energy:1.4,
	avg_exp_per_stamina:2.4,
	quests:[] // quests[energy] = [experience, [quest1, quest2, quest3]]
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
	this._watch(Player, 'data.exp');
	this._watch(Player, 'data.energy');
	this._watch(Player, 'data.stamina');
	this._watch(Quest, 'runtime.best');
	this.runtime.exp = this.runtime.exp || Player.get('exp', 0); // Make sure we have a default...
};

LevelUp.parse = function(change) {
	var exp, runtime = this.runtime;
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

LevelUp.update = function(event) {
	var d, i, j, k, record, quests, energy = Player.get('energy', 0), stamina = Player.get('stamina', 0), exp = Player.get('exp', 0), runtime = this.runtime,order = Config.getOrder(), stamina_samples;
	if (event.worker.name === 'Player' || !length(runtime.quests)) {
		if (exp > runtime.exp && $('span.result_body:contains("xperience")').length) {
			// Experience has increased...
			if (runtime.stamina > stamina) {
				//console.log(warn(), 'page.page ' + Page.page);
				this.runtime.last_stamina = (Page.page === 'keep_monster_active' || Page.page === 'monster_battle_monster') ? 'attack' : 'battle';
				calc_rolling_weighted_average(runtime, 'exp',exp - runtime.exp,
						'stamina',runtime.stamina - stamina);
			} else if (runtime.energy > energy) {
				this.runtime.last_energy = (Page.page === 'keep_monster_active' || Page.page === 'monster_battle_monster') ? 'defend' : 'quest';
				// Only need average for monster defense.  Quest average is known.
				if (this.runtime.last_energy === 'defend') {
					calc_rolling_weighted_average(runtime, 'exp',exp - runtime.exp,
						'energy',runtime.energy - energy);
				}
			}
		}
		runtime.energy = energy;
		runtime.stamina = stamina;
		runtime.exp = exp;
	}
	//console.log(warn(), 'next action ' + LevelUp.findAction('best', Player.get('energy'), Player.get('stamina'), Player.get('exp_needed')).exp + ' big ' + LevelUp.findAction('big', Player.get('energy'), Player.get('stamina'), Player.get('exp_needed')).exp);
	d = new Date(this.get('level_time'));
	if (runtime.running) {
		Dashboard.status(this, '<span title="Exp Possible: ' + this.get('exp_possible') + ', per Hour: ' + this.get('exp_average').round(1).addCommas() + ', per Energy: ' + this.get('exp_per_energy').round(2) + ', per Stamina: ' + this.get('exp_per_stamina').round(2) + '">LevelUp Running Now!</span>');
	} else {
		Dashboard.status(this, '<span title="Exp Possible: ' + this.get('exp_possible') + ', per Energy: ' + this.get('exp_per_energy').round(2) + ', per Stamina: ' + this.get('exp_per_stamina').round(2) + '">' + this.get('time') + ' after ' 
				+ Page.addTimer('levelup', this.get('level_time')) + ' (at ' + this.get('exp_average').round(1).addCommas() + ' exp per hour) minus ' 
				+ Page.addTimer('refill_energy', this.get('refill_energy')) + ' per energy refill '
				+ Page.addTimer('refill_stamina', this.get('refill_stamina')) + ' per stamina refill</span>');
	}
};

LevelUp.work = function(state) {
	var heal = this.runtime.heal_me, energy = Player.get('energy', 0), stamina = Player.get('stamina', 0), order = Config.getOrder(), action = this.runtime.action;
	Generals.set('runtime.disabled', false);
/*	if (!action || !action.big) {
		Generals.set('runtime.disabled', false);
	}
*/	if (!Queue.runtime.force.stamina || !heal) {
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
			//console.log(warn(), 'Disabling Generals because next action will level.');
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
	var options =[], i, check, quests, monsters, big, multiples, general = false, basehit, max, raid = false, defendAction, monsterAction, energyAction, staminaAction, questAction, stat = null, value = null, nothing;
	nothing = {stamina:0,energy:0,exp:0};
	defendAction = monsterAction = staminaAction = energyAction = questAction = 0;
	switch(mode) {
	case 'best':
		// Find the biggest exp quest or stamina return to push unusable exp into next level
		big = this.findAction('big',energy,stamina,0); 
		if (this.option.order === 'Energy') {
			check = this.findAction('energy',energy-big.energy,0,exp);
			//console.log(warn(), ' levelup quest ' + energy + ' ' + exp);
			//console.log(warn(), 'this.runtime.last_energy ' + this.runtime.last_energy + ' checkexp ' + check.exp +' quest ' + check.quest);
			// Do energy first if defending a monster or doing the best quest, but not little 'use energy' quests
			if (check.exp && (check.quest === Quest.runtime.best || !check.quest)) {
				console.log(warn(), 'Doing regular quest ' + Quest.runtime.best);
				return check;
			}
		}
		check = this.findAction('attack',0,stamina - big.stamina,exp);
		if (check.exp) {
			console.log(warn(), 'Doing stamina attack');
			return check;
		}
		check = this.findAction('quest',energy - big.energy,0,exp);
		if (check.exp) {
			console.log(warn(), 'Doing little quest ' + check.quest);
			return check;
		}
		console.log(warn(), 'Doing big action to save exp');
		return (big.exp ? big : nothing);
	case 'big':		
		// Should enable to look for other options than last stamina, energy?
		energyAction = this.findAction('energy',energy,stamina,0);
		staminaAction = this.findAction('attack',energy,stamina,0);
		if (energyAction.exp > staminaAction.exp) {
			console.log(warn(), 'Big action is energy.  Exp use:' + energyAction.exp + '/' + exp);
			energyAction.big = true;
			return energyAction;
		} else if (staminaAction.exp) {
			//console.log(warn(), 'big stamina ' + staminaAction.exp + staminaAction.general);
			console.log(warn(), 'Big action is stamina.  Exp use:' + staminaAction.exp + '/' + exp);
			staminaAction.big = true;
			return staminaAction;
		} else {
			console.log(warn(), 'Big action not found');
			return nothing;  
		}
	case 'energy':	
		//console.log(warn(), 'monster runtime defending ' + Monster.get('runtime.defending'));
		if ((Monster.get('runtime.defending')
					&& (Quest.option.monster === 'Wait for'
						|| Quest.option.monster === 'When able'
						|| Queue.option.queue.indexOf('Monster')
							< Queue.option.queue.indexOf('Quest')))
				|| (!exp && Monster.get('runtime.values.big',false))) {
			defendAction = this.findAction('defend',energy,0,exp);
			if (defendAction.exp) {
				console.log(warn(), 'Energy use defend');
				return defendAction;
			}
		}
		questAction = this.findAction('quest',energy,0,exp);
		console.log(warn(), 'Energy use quest' + (exp ? 'Normal' : 'Big') + ' QUEST ' + ' Energy use: ' + questAction.energy +'/' + energy + ' Exp use: ' + questAction.exp + '/' + exp + 'Quest ' + questAction.quest);
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
			console.log(warn(), (exp ? 'Normal' : 'Big') + ' QUEST ' + ' Energy use: ' + questAction.energy +'/' + energy + ' Exp use: ' + questAction.exp + '/' + exp + 'Quest ' + questAction.quest);
			return {	energy : quests[i].energy,
						stamina : 0,
						exp : quests[i].exp,
						quest : i};
		} else {
			console.log(warn(), 'No appropriate quest found');
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
			options = unique(options.concat(Monster.get('runtime.values.big',[])));
		}
		// Use 6 as a safe exp/stamina and 2.8 for exp/energy multiple 
		max = Math.min((exp ? (exp / ((stat === 'energy') ? 2.8 : 6)) : value), value);
		monsterAction = basehit = bestValue(options, max);
		multiples = Generals.get('runtime.multipliers');
		for (i in multiples) {
			check = bestValue(options.map(function(s){ return s * multiples[i]; } ), max);
			if (check > monsterAction) {
				monsterAction = check;
				basehit = check / multiples[i];
				general = i;
			}
		}
		if (monsterAction < 0 && mode === 'attack' && !Battle.get(['option', '_disabled'], false) 
				&& Battle.runtime.attacking) {
			monsterAction = bestValue([(Battle.option.type === 'War' ? 10 : 1)],max);
		}
		console.log(warn(), (exp ? 'Normal' : 'Big') + ' mode: ' + mode + ' ' + stat + ' use: ' + monsterAction +'/' + ((stat === 'stamina') ? stamina : energy) + ' Exp use: ' + monsterAction * this.get('exp_per_' + stat) + '/' + exp + ' Basehit ' + basehit + ' options ' + options + ' General ' + general);
		if (monsterAction > 0 ) {
			return {	stamina : (stat === 'stamina') ? monsterAction : 0,
						energy : (stat === 'energy') ? monsterAction : 0,
						exp : monsterAction * this.get('exp_per_' + stat),
						general : general,
						basehit : basehit};
		} else {
			return nothing;
		}
	case 'battle':		
		// Need to fill in later
	}
};
			
		
			
	
/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page, Queue, Resources,
	Battle, Generals, LevelUp, Player,
	APP, APPID, log, debug, userID, imagepath,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH
	makeTimer, Divisor, length, unique, deleteElement, sum, findInArray, findInObject, objectIndex, sortObject, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
	makeImage, calc_rolling_weighted_average, bestObjValue
*/
/********** Worker.Monster **********
 * Automates Monster
 */
var Monster = new Worker('Monster');
Monster.temp = null;

Monster.defaults['castle_age'] = {
	pages:'monster_monster_list keep_monster_active monster_battle_monster battle_raid festival_monster_list festival_battle_monster monster_dead'
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
	clicked:false, // Last monster clicked, for checking if timed out
	check:false, // id of monster to check if needed, otherwise false
	attack:false, // id of monster if we have an attack target, otherwise false
	defend:false, // id of monster if we have a defend target, otherwise false
	secondary: false, // Is there a target for mage or rogue that is full or not in cycle?  Used to tell quest to wait if don't quest when fortifying is on.
	multiplier : {defend:1,attack:1}, // General multiplier like Orc King or Barbarus
	values : {defend:[],attack:[]  // Attack/defend values available for levelup
		, big:[]}, // Defend big values available for levelup
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
	defending: false // hint for other workers as to whether we are potentially using energy to defend
};

Monster.display = [
	{
		advanced:true,
		id:'remove',
		label:'Delete completed monsters',
		checkbox:true,
		help:'Check to have script remove completed monsters with rewards collected from the monster list.'
	},{
		title:'Attack'
	},{
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
	},{
		title:'Defend'
	},{
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
	},{
		title:'Raids'
	},{
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
	},{
		title:'Siege Assist Options'
	},{
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
		image2:'dragon_red.jpg',
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
	serpent_amethyst: { // DEAD image Verified and enabled.
		name:'Amethyst Sea Serpent',
		list:'seamonster_list_purple.jpg',
		image:'seamonster_purple.jpg',
		dead:'seamonster_dead.jpg',
		title:'seamonster_title_amethyst.jpg',
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
	serpent_ancient: { // DEAD image Verified and enabled.
		name:'Ancient Sea Serpent',
		list:'seamonster_list_red.jpg',
		image:'seamonster_red.jpg',
		dead:'seamonster_dead.jpg',
		title:'seamonster_title_ancient.jpg',
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
	serpent_emerald: { // DEAD image Verified and enabled.
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
		attack:[5,10,20,50],
		defend_button:'input[name="Attack Dragon"][src*="heal"]',
		defend:[20,40,100],
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
		mpool:1, // For fest
		attack_button:'input[name="Attack Dragon"][src*="stab"],input[name="Attack Dragon"][src*="bolt"],input[name="Attack Dragon"][src*="smite"],input[name="Attack Dragon"][src*="bash"]',
		attack:[5,10,20,50],
		defend_button:'input[name="Attack Dragon"][src*="heal"]',
		defend:[10,20,40,100],
		festival_timer: 691200, // 192 hours
		festival: 'alpha_mephistopheles'
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
	this._watch(Player, 'data.health');
	this._watch(Player, 'data.energy');
	this._watch(Player, 'data.stamina');
	this._watch(Queue, 'runtime'); // BAD!!! Shouldn't be touching queue!!!
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
	var mid, uid, type, type_label, $health, $defense, $dispel, $secondary, dead = false, monster, timer, ATTACKHISTORY = 20, data = this.data, types = this.types, now = Date.now(), ensta = ['energy','stamina'], i, x, festival, clicked = this.runtime.clicked;
	this.runtime.clicked = false;
	if (['keep_monster_active', 'monster_battle_monster', 'festival_battle_monster'].indexOf(Page.page)>=0) { // In a monster or raid
		festival = Page.page === 'festival_battle_monster';
		uid = $('img[linked][size="square"]').attr('uid');
		//console.log(warn(), 'Parsing for Monster type');
		for (i in types) {
			if (types[i].dead && $('#app46755028429_app_body img[src$="'+types[i].dead+'"]').length 
					&& (!types[i].title || $('div[style*="'+types[i].title+'"]').length 
						|| $('#app46755028429_app_body div[style*="'+types[i].image+'"]').length)) {
//			if (types[i].dead && $('#app46755028429_app_body img[src$="'+types[i].dead+'"]').length) {
				//console.log(warn(), 'Found a dead '+i);
				type_label = i;
				timer = (festival ? types[i].festival_timer : 0) || types[i].timer;
				dead = true;
				break;
			} else if (types[i].image && $('#app46755028429_app_body img[src$="'+types[i].image+'"],div[style*="'+types[i].image+'"]').length) {
				//console.log(warn(), 'Parsing '+i);
				type_label = i;
				timer = (festival ? types[i].festival_timer : 0) || types[i].timer;
				break;
			} else if (types[i].image2 && $('#app46755028429_app_body img[src$="'+types[i].image2+'"],div[style*="'+
			types[i].image2+'"]').length) {
				//console.log(warn(), 'Parsing second stage '+i);
				type_label = i;
				timer = (festival ? types[i].festival_timer : 0) || types[i].timer2 || types[i].timer;
				break;
			}
		}
		if (!uid || !type_label) {
			console.log(warn(), 'Unknown monster (probably dead)');
			return false;
		}
		mid = uid+'_' + (Page.page === 'festival_battle_monster' ? 'f' : (types[i].mpool || 4));
		if (this.runtime.check === mid) {
			this.runtime.check = false;
		}
		monster = data[mid] = data[mid] || {};
		monster.type = type_label;
		type = types[type_label];
		monster.last = now;
		if (Page.page === 'festival_battle_monster') {
			monster.page = 'festival';
		} else {
			monster.page = 'keep';
		}
		if (!monster.name) {
			if (monster.page === 'festival') {
				monster.name = $('img[linked][size="square"]').parent().parent().parent().text().trim().replace('\'s summoned','');
				console.log(warn(), 'Name ' + monster.name);
			} else if ((x = $('#app' + APPID + '_app_body div[style*="/dragon_title_owner."]')).length
				|| (x = $('#app' + APPID + '_app_body div[style*="/nm_top."]')).length) {
				i = x.text().trim();
				if (isString(x = i.regex(this.name_re)) || isString(x = i.regex(this.name2_re))) {
					monster.name = x.trim();
				}
			}
		}
		if (dead) {
			// Will this catch Raid format rewards?
			if ($('input[src*="collect_reward_button.jpg"]').length) {
				monster.state = 'reward';
			} else if (monster.state === 'assist') {
				monster.state = null;
			} else if (monster.state === 'reward' || monster.state === 'engage') {
				if (!monster.dead) {
					History.add(type_label,1);
					monster.dead = true;
				}
				monster.state = 'complete';
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
						//console.log(warn(), 'Damage per ' + ensta[i] + ' = ' + this.runtime.monsters[monster.type]['avg_damage_per_' + ensta[i]]);
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
				//console.log(warn(), 'Monster class : '+Monster['class_name'][i]);
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
				monster.secondary = 100 * $secondary.width() / $secondary.parent().width();
				console.log(warn(), Monster['class_name'][monster.mclass]+" phase. Bar at "+monster.secondary+"%");
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
			//console.log(warn(), 'Current Siege Phase is: '+ this.data[mid].phase);
			monster.phase = $('input[name*="help with"]').attr('title').regex(/ (.*)/i);
			//console.log(warn(), 'Assisted on '+monster.phase+'.');
		}
		$('img[src*="siege_small"]').each(function(i,el){
			var /*siege = $(el).parent().next().next().next().children().eq(0).text(),*/ dmg = $(el).parent().next().next().next().children().eq(1).text().replace(/\D/g,'').regex(/(\d+)/);
			//console.log(warn(), 'Monster Siege',siege + ' did ' + dmg.addCommas() + ' amount of damage.');
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
				monster.damage.user.manual = dmg - (monster.damage.user.script || 0);
				monster.defend.manual = fort - (monster.defend.script || 0);
				monster.stamina.manual = Math.round(monster.damage.user.manual / Monster.runtime.monsters[type_label].avg_damage_per_stamina);
			} else {
				monster.damage.others += dmg;
			}
		});
		// If we're doing our first attack then add them without having to visit list
		if (monster.state === 'assist' && monster.damage.user && sum(monster.damage.user)) {
			monster.state = 'engage';
		}
		if (!type.raid && $(type.attack_button).length && monster.damage.user && sum(monster.damage.user)) {
			monster.state = monster.state || 'engage';
		}
		monster.dps = sum(monster.damage) / (timer - monster.timer);
		if (types[type_label].raid) {
			monster.total = sum(monster.damage) + $('div[style*="monster_health_back.jpg"] div:nth-child(2)').text().regex(/(\d+)/);
		} else {
			monster.total = Math.ceil(100 * sum(monster.damage) / (monster.health === 100 ? 0.1 : (100 - monster.health)));
		}
		monster.eta = now + (Math.floor((monster.total - sum(monster.damage)) / monster.dps) * 1000);
	} else {
		this.runtime.used.stamina = 0;
		this.runtime.used.energy = 0;
		if (Page.page === 'monster_dead' || $('div[style*="no_monster_back.jpg"]').length) {
			console.log(warn(), 'Found a timed out monster.');
			if (clicked) {
				console.log(warn(), 'Deleting ' + data[this.runtime.mid].name + "'s " + data[this.runtime.mid].type);
				delete data[this.runtime.mid];
			} else {
				console.log(warn(), 'Unknown monster (timed out)');
			}
			this.runtime.check = false;
			return false;
		}
		if (['monster_monster_list', 'battle_raid', 'festival_monster_list'].indexOf(Page.page)>=0) { // Check monster / raid list
			festival = (Page.page === 'festival_monster_list');
			this.runtime.check = false;

			if (!$('#app46755028429_app_body div.imgButton').length) {
				return false;
			}
			for (mid in data) {
				if (	((types[data[mid].type].raid && Page.page === 'battle_raid')
							|| (Page.page !== 'battle_raid' 
								&& festival === (data[mid].page === 'festival')))
						&& (data[mid].state === 'complete'
							|| data[mid].state === 'reward'
							|| (data[mid].state === 'assist'
								&& data[mid].finish < now))
					) {
					data[mid].state = null;
				}
			}
			$('#app46755028429_app_body div.imgButton').each(function(a,el){
				if ($('a', el).attr('href')
						&& $('a', el).attr('href').regex(/casuser=(\d+)/i)) {
					var i, uid = $('a', el).attr('href').regex(/casuser=(\d+)/i), type_label = null, tmp = $(el).parent().parent().children().eq(1).html().regex(/graphics\/([^.]*\....)/i);
					for (i in types) {
						if (tmp === types[i].list) {
							type_label = i;
							break;
						}
					}
					if (!type_label) {
						console.log(warn(), 'Unable to add monster - uid: '+uid+', image: "'+tmp+'"');
						return;
					}
					mid = uid+'_' + (festival ? 'f' : (types[i].mpool || 4));
					data[mid] = data[mid] || {};
					if (festival) {
						data[mid].page = 'festival';
					}
					data[mid].type = type_label;
					if (uid === userID) {
						data[mid].name = 'You';
					} else if (festival) {
						tmp = $(el).parent().parent().children().eq(2).text().trim();
						data[mid].name = tmp.regex(/(.+)'s\s/i);
					} else {
						tmp = $(el).parent().parent().children().eq(2).text().trim();
						data[mid].name = tmp.regex(/(.+)'s\s/i);
					}
					//console.log(warn(), 'switch ' + $('img', el).attr('src').regex(/(\w+)\.(gif|jpg)/)[0]);
					switch($('img', el).attr('src').regex(/(\w+)\.(gif|jpg)/)[0]) {
						case 'festival_monster_collectbtn':
						case 'dragon_list_btn_2':
							data[mid].state = 'reward';
							break;
						case 'festival_monster_engagebtn':
						case 'dragon_list_btn_3':
							data[mid].state = 'engage';
							break;
						case 'festival_monster_viewbtn':
						case 'dragon_list_btn_4':
							if (Monster.types[data[mid].type].raid && data[mid].health && data[mid].finish > now) { // Fix for Raids that no longer show "Engage" as the image
								data[mid].state = 'engage';
							} else {
								data[mid].state = 'complete';
								data[mid].remove = true;
							}
							break;
						default:
							data[mid].state = 'unknown';
							break; // Should probably delete, but keep it on the list...
					}
				}
			});
		}
	}
	return false;
};

Monster.update = function(event) {
	if (event.type === 'runtime' && event.worker.name !== 'Queue') {
		return;
	}
	var i, j, mid, uid, type, stat_req, req_stamina, req_health, req_energy, messages = [], fullname = {}, list = {}, listSortFunc, matched_mids = [], min, max, limit, filter, ensta = ['energy','stamina'], defatt = ['defend','attack'], button_count, monster, damage, target, now = Date.now(), waiting_ok;
	this.runtime.mode = this.runtime.stat = this.runtime.check = this.runtime.message = this.runtime.mid = null;
	this.runtime.values.big = [];
	limit = this.runtime.limit;
	if(!LevelUp.runtime.running && limit === 100){
		limit = 0;
	}
	list.defend = [];
	list.attack = [];
	// Flush stateless monsters
	for (mid in this.data) {
		if (!this.data[mid].state) {
			console.log(log(), 'Deleted monster MID ' + mid + ' because state is ' + this.data[mid].state);
			delete this.data[mid];
		}
	}
	// Check for unviewed monsters
	for (mid in this.data) {
		if (!this.data[mid].last && !this.data[mid].ignore) {
			this.page(mid, 'Checking new monster ', 'casuser','');
			this.runtime.defending = true;
			return;
		}
	}
	// Some generals use more stamina, but only in certain circumstances...
	for (i in defatt) {
		this.runtime.multiplier[defatt[i]] = (Generals.get([Queue.runtime.general || (Generals.best(this.option['best_' + defatt[i]] ? ('monster_' + defatt[i]) : this.option['general_' + defatt[i]])), 'skills'], '').regex(/Increase Power Attacks by (\d+)/i) || 1);
		//console.log(warn(), 'mult ' + defatt[i] + ' X ' + this.runtime.multiplier[defatt[i]]);
	}
	this.runtime.secondary = false;
	waiting_ok = !this.option.hide && !Queue.runtime.force.stamina;
	if (this.option.stop === 'Priority List') {
		var condition, searchterm, attack_found = false, defend_found = false, attack_overach = false, defend_overach = false, o, suborder, p, defense_kind, button, order = [];
		if (this.option.priority) {
			order = this.option.priority.toLowerCase().replace(/ *[\n,]+ */g,',').replace(/,*\|,*/g,'|').split(',');
		}
		order.push('your ','\'s'); // Catch all at end in case no other match
		for (o in order) {
			order[o] = order[o].trim();
			if (!order[o]) {
				continue;
			}
			if (order[o] === 'levelup') {
				if ((Queue.runtime.force.stamina && !list.attack.length) 
						|| (Queue.runtime.force.energy && !list.defend.length)) {
					matched_mids = [];
					continue;
				} else {
					break;
				}
			}
			suborder = order[o].split('|');
			for (p in suborder) {
				suborder[p] = suborder[p].trim();
				if (!suborder[p]) {
					continue;
				}
				searchterm = $.trim(suborder[p].match(new RegExp("^[^:]+")).toString());
				condition = $.trim(suborder[p].replace(new RegExp("^[^:]+"), '').toString());
				//console.log(warn(), 'Priority order ' + searchterm +' condition ' + condition);
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
							: Math.min(type.attack[Math.min(button_count, monster.smax || type.attack.length)-1], Math.max(type.attack[0], Queue.runtime.basehit || monster.smin || this.option.attack_min)) * this.runtime.multiplier.attack;
					req_health = type.raid ? (this.option.risk ? 13 : 10) : 10;
// Don't want to die when attacking a raid
					//console.log(warn(), 'monster name ' + type.name + ' attack ' + Queue.runtime.basehit +' ' + (!Queue.runtime.basehit || type.attack.indexOf(Queue.runtime.basehit)>= 0));
					if ((monster.defense || 100) >= monster.attack_min) {
// Set up this.values.attack for use in levelup calcs
						if (type.raid) {
							this.runtime.values.attack = unique(this.runtime.values.attack.concat((this.option.raid.search('x5') < 0) ? 1 : 5));
// If it's a defense monster, never hit for 1 damage.  Otherwise, 1 damage is ok.
						} else if (type.defend && type.attack.indexOf(1) > -1) {
							this.runtime.values.attack = unique(this.runtime.values.attack.concat(type.attack.slice(1,this.runtime.button.count)));
						} else {
							this.runtime.values.attack = unique(this.runtime.values.attack.concat(type.attack.slice(0,this.runtime.button.count)));
						}
						if ((attack_found || o) === o
								&& (waiting_ok || (Player.get('health', 0) >= req_health
								&& Queue.runtime.stamina >= req_stamina))
								&& (!Queue.runtime.basehit
									|| type.attack.indexOf(Queue.runtime.basehit)>= 0 )) {
							button = type.attack_button;
							if (this.option.use_tactics && type.tactics) {
								button = type.tactics_button;
							}
							if (damage < monster.ach) {
								attack_found = o;
								if (attack_found && attack_overach) {
									list.attack = [[mid, damage / sum(monster.damage), button, damage, target]];
									attack_overach = false;
								} else {
									list.attack.push([mid, damage / sum(monster.damage), button, damage, target]);
								}
								//console.log(warn(), 'ATTACK monster ' + monster.name + ' ' + type.name);
							} else if ((monster.max === false || damage < monster.max)
									&& !attack_found && (attack_overach || o) === o) {
								list.attack.push([mid, damage / sum(monster.damage), button, damage, target]);
								attack_overach = o;
							}
						}
					}
					// Possible defend target?
					if (this.option.defend_active && (defend_found || o) === o) {
						defense_kind = false;
						if (typeof monster.secondary !== 'undefined' && monster.secondary < 100) {
							//console.log(warn(), 'Secondary target found (' + monster.secondary + '%)');
							defense_kind = Monster.secondary_on;
						} else if (monster.warrior && (monster.strength || 100) < 100 && monster.defense < monster.strength - 1) {
							defense_kind = Monster.warrior;
						} else if (!monster.no_heal 
								&& ((/:big\b/.test(condition) && Queue.runtime.big)
									|| ((monster.defense || 100) < monster.defend_max
										&& (monster.defense || 100) > 1))) {
							defense_kind = type.defend_button;
						}
						if (!monster.no_heal 
								&& type.defend
								&& (/:big\b/.test(condition) 
									|| ((monster.defense || 100) < monster.defend_max
										&& (monster.defense || 100) > 1))) {
							this.runtime.values.big = unique(this.runtime.values.big.concat(type.defend.slice(0,this.runtime.button.count)));
						}
						if (monster.secondary === 100
								&& (monster.max === false
									|| damage < monster.max
									|| /:sec\b/.test(condition))) {
							this.runtime.secondary = true;
						}
						if (defense_kind) {
							this.runtime.values.defend = unique(this.runtime.values.defend.concat(type.defend.slice(0,this.runtime.button.count)));
							if ((defend_found || o) === o
								&& (!Queue.runtime.basehit 
									|| type.defend.indexOf(Queue.runtime.basehit)>= 0 )) {
								if (damage < monster.ach
										|| (/:sec\b/.test(condition)
											&& defense_kind === Monster.secondary_on)) {
									//console.log(warn(), 'DEFEND monster ' + monster.name + ' ' + type.name);
									defend_found = o;
								} else if ((monster.max === false || damage < monster.max)
										&& !defend_found && (defend_overach || o) === o) {
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
					: Math.min(type.attack[Math.min(button_count,type.attack.length)-1], Math.max(type.attack[0], Queue.runtime.basehit || monster.smin || this.option.attack_min)) * this.runtime.multiplier.attack;
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
						&& sum(monster.damage.user) + sum(monster.defend)
							> (type.achievement || 0)) {
					continue; // Don't add monster over achievement
				} else if (this.option.stop === '2X Achievement'
						&& sum(monster.damage.user) + sum(monster.defend)
							> type.achievement * 2) {
					continue; // Don't add monster over 2X  achievement
				} else if (this.option.stop === 'Continuous'
						&& sum(monster.damage.user) + sum(monster.defend)
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
					target = 1e10;
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
				if ((waiting_ok || (Player.get('health', 0) >= req_health
							&& Queue.runtime.stamina >= req_stamina))
						&& (monster.defense || 100) >= Math.max(this.option.min_to_attack,0.1)) {
// Set up this.values.attack for use in levelup calcs
					if (type.raid) {
						this.runtime.values.attack = unique(this.runtime.values.attack.concat((this.option.raid.search('x5') < 0) ? 1 : 5));
// If it's a defense monster, never hit for 1 damage.  Otherwise, 1 damage is ok.
					} else if (type.defend && type.attack.indexOf(1) > -1) {
						this.runtime.values.attack = unique(this.runtime.values.attack.concat(type.attack.slice(1,this.runtime.button.count)));
					} else {
						this.runtime.values.attack = unique(this.runtime.values.attack.concat(type.attack.slice(0,this.runtime.button.count)));
					}
					if (this.option.use_tactics && type.tactics) {
						list.attack.push([mid, (sum(monster.damage.user) + sum(monster.defend)) / sum(monster.damage), type.tactics_button, damage, target]);
					} else {
						list.attack.push([mid, (sum(monster.damage.user) + sum(monster.defend)) / sum(monster.damage), type.attack_button, damage, target]);
					}
				}
				// Possible defend target?
				if (this.option.defend_active) {
					if(type.defend) {
						this.runtime.values.defend = unique(this.runtime.values.defend.concat(type.defend.slice(0,this.runtime.button.count)));
					}
					if ((monster.secondary || 100) < 100) {
						list.defend.push([mid, (sum(monster.damage.user) + sum(monster.defend)) / sum(monster.damage), Monster.secondary_on, damage, target]);
					} else if (monster.warrior && (monster.strength || 100) < 100){
						list.defend.push([mid, (sum(monster.damage.user) + sum(monster.defend)) / sum(monster.damage), Monster.warrior, damage, target]);
					} else if ((monster.defense || 100) < Math.min(this.option.defend, (monster.strength -1 || 100))
                                                && !monster.no_heal) {
						list.defend.push([mid, (sum(monster.damage.user) + sum(monster.defend)) / sum(monster.damage), type.defend_button, damage, target]);
					}
				}
			}
		}
	}
	this.runtime.defending = list.defend && list.defend.length > 0;
	// If using the priority list and levelup settings, the script may oscillate between having something to defend when in level up, and then forgetting it when it goes to attack something because it doesn't pass levelup in the priority list and tries to quest, and then finds it again.  The following preserves the runtime.defending value even when in force.stamina mode
	if (Queue.runtime.force.stamina) {
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
		//console.log(warn(), 'list ' + i + ' is ' + length(list[i]));
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
				min = Math.min(type[defatt[i]][Math.min(button_count,type[defatt[i]].length)-1], Math.max(type[defatt[i]][0], Queue.runtime.basehit || this.option[defatt[i] + '_min']));
				max = Math.min(type[defatt[i]][Math.min(button_count,type[defatt[i]].length)-1], Queue.runtime.basehit || this.option[defatt[i] + '_max'], Queue.runtime[ensta[i]] / this.runtime.multiplier[defatt[i]]);
				damage = sum(monster.damage.user) + sum(monster.defend);
				limit = (Queue.runtime.big ? max : damage < (monster.ach || damage)
						? monster.ach : damage < (monster.max || damage)
						? monster.max : max);
				max = Math.min(max,(limit - damage)/(this.runtime.monsters[monster.type]['avg_damage_per_'+ensta[i]] || 1)/this.runtime.multiplier[defatt[i]]);
				//console.log(warn(), 'monster damage ' + damage + ' average damage ' + (this.runtime.monsters[monster.type]['avg_damage_per_'+ensta[i]] || 1).round(0) + ' limit ' + limit + ' max ' + ensta[i] + ' ' + max.round(1));
				filter = function(e) { return (e >= min && e <= max); };
				this.runtime.button[defatt[i]].pick = bestObjValue(type[defatt[i]], function(e) { return e; }, filter) || type[defatt[i]].indexOf(min);
				//console.log(warn(), ' ad ' + defatt[i] + ' min ' + min + ' max ' + max+ ' pick ' + this.runtime.button[defatt[i]].pick);
				//console.log(warn(), 'min detail '+ defatt[i] + ' # buttons   ' + Math.min(this.runtime.button.count,type[defatt[i]].length) +' button val ' +type[defatt[i]][Math.min(this.runtime.button.count,type[defatt[i]].length)-1] + ' max of type[0] ' + type[defatt[i]][0] + ' queue or option ' + (Queue.runtime.basehit || this.option[defatt[i] + '_min']));
				//console.log(warn(), 'max detail '+ defatt[i] + ' physical max ' + type[defatt[i]][Math.min(this.runtime.button.count,type[defatt[i]].length)-1] + ' basehit||option ' + (Queue.runtime.basehit || this.option[defatt[i]]) + ' stamina avail ' + (Queue.runtime[ensta[i]] / this.runtime.multiplier[defatt[i]]));
				this.runtime[ensta[i]] = type[defatt[i]][this.runtime.button[defatt[i]].pick] * this.runtime.multiplier[defatt[i]];
			}
			this.runtime.health = type.raid ? 13 : 10; // Don't want to die when attacking a raid
			req_health = (defatt[i] === 'attack' ? Math.max(0, this.runtime.health - Player.get('health', 0)) : 0);
			if (Queue.runtime.force[ensta[i]]) {
				stat_req = Math.max(0,((this.runtime[ensta[i]] || 0) - Queue.runtime[ensta[i]]));
			} else {
				stat_req = Math.max(0,((this.runtime[ensta[i]] || 0) - Queue.runtime[ensta[i]])
						,((this.runtime[ensta[i]] || 0) + Queue.option[ensta[i]] - Player.get(ensta[i], 0))
						,(Queue.option['start_' + ensta[i]] - Player.get(ensta[i], 0)));
			}
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
	//console.log(warn(), 'attack ' + this.runtime.attack + ' stat_req ' + stat_req + ' health ' + req_health);
	if ((!this.runtime.defend || Queue.runtime.energy < this.runtime.energy)
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
					//console.log(warn(), 'remove ' + mid + ' userid ' + userID + ' uid ' + uid + ' now ' + (uid === userID) + ' new ' + (parseFloat(uid) === userID));
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
		console.log(warn(), this.runtime.message);
		Page.to(this.runtime.page, this.runtime.check);
		this.runtime.clicked = this.runtime.mid;
		this.runtime.check = this.runtime.limit = this.runtime.message = this.runtime.dead = false;
		return QUEUE_RELEASE;
	}
	if (mode === 'defend' && Queue.get('runtime.quest')) {
		return QUEUE_NO_ACTION;
	}	
	uid = this.runtime[mode].replace(/_\w+/,'');
	monster = this.data[this.runtime[mode]];
	type = this.types[monster.type];
	if (this.runtime[stat]>Queue.runtime[stat] 
			&& (!Queue.runtime.basehit 
				|| this.runtime[stat] === Queue.runtime.basehit * this.runtime.multiplier[mode])) {
			console.log(warn(), 'Check for ' + stat + ' burn to catch up ' + this.runtime[stat] + ' burn ' + Queue.runtime[stat]);
		return QUEUE_RELEASE;
	}
	if (!Generals.to(Queue.runtime.general || (this.option['best_'+mode] 
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
		console.log(warn(), 'Try to ' + mode + ' ' + monster.name + '\'s ' + type.name + ' for ' + this.runtime[stat] + ' ' + stat);
		if (this.runtime.button[mode].pick > $(this.runtime.button[mode].query).length - 1) {
			//console.log(warn(), 'Unable to find '  + mode + ' button for ' + monster.name + '\'s ' + type.name);
		} else {
			//console.log(warn(), ' query ' + $(this.runtime.button[mode].query).length + ' ' + this.runtime.button[mode].pick);
			btn = $(this.runtime.button[mode].query).eq(this.runtime.button[mode].pick);
			this.runtime.used[stat] = this.runtime[stat];
		}
		if (!btn || !btn.length){
			monster.button_fail = (monster.button_fail || 0) + 1;
			if (monster.button_fail > 10){
				console.log(log(), 'Ignoring Monster ' + monster.name + '\'s ' + type.name + ': Unable to locate ' + (this.runtime.button[mode].pick || 'unknown') + ' ' + mode + ' button ' + monster.button_fail + ' times!');
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
		//console.log(warn(), 'Reloading page. Button = ' + btn.attr('name'));
		//console.log(warn(), 'Reloading page. Page.page = '+ Page.page);
		//console.log(warn(), 'Reloading page. Monster Owner UID is ' + $('div[style*="dragon_title_owner"] img[linked]').attr('uid') + ' Expecting UID : ' + uid);
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
			console.log(log(), 'No valid Raid target!');
			Page.to('battle_raid', ''); // Force a page reload to change the targets
			return QUEUE_CONTINUE;
		}
	}
	Page.click(btn);
	monster.button_fail = 0;
	return QUEUE_RELEASE;
};

Monster.page = function(mid, message, prefix, suffix) {
	var uid, type, monster;
	monster = this.data[mid];
	this.runtime.mid = mid;
	uid = mid.replace(/_.+/,'');
	type = this.types[monster.type];
	if (message) {
		this.runtime.message = message + (monster.name ? (monster.name === 'You' ? 'your' : monster.name.html_escape() + '\'s') : '')
				+ ' ' + type.name;
		Dashboard.status(this, this.runtime.message);
	}
	this.runtime.page = type.raid ? 'battle_raid' 
			: monster.page === 'festival' ? 'festival_battle_monster' 
			: 'monster_battle_monster';
	this.runtime.check = prefix + '=' + uid
			+ ((monster.phase && this.option.assist
				&& !Queue.runtime.levelup
				&& (monster.state === 'engage' || monster.state === 'assist'))
					? '&action=doObjective' : '')
			+ (type.mpool ? '&mpool=' + type.mpool : '') 
			+ (monster.page === 'festival' ? ('&mid=' + type.festival 
				+ (prefix.indexOf('remove_list') >= 0 ? ('&remove_monsterKey=' + type.festival) :'')) 
			: '')
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
		var aa, bb;
		if (state[Monster.data[a].state] > state[Monster.data[b].state]) {
			return 1;
		}
		if (state[Monster.data[a].state] < state[Monster.data[b].state]) {
			return -1;
		}
		if (typeof sorttype[sort] === 'string') {
			aa = Monster.data[a][sorttype[sort]];
			bb = Monster.data[b][sorttype[sort]];
		} else if (sort === 4) { // damage
			//			aa = Monster.data[a].damage ? Monster.data[a].damage[userID] : 0;
			//			bb = Monster.data[b].damage ? Monster.data[b].damage[userID] : 0;
			if (Monster.data[a].damage && Monster.data[a].damage.user) {
				aa = sum(Monster.data[a].damage.user) / sum(Monster.data[a].damage);
			}
			if (Monster.data[b].damage && Monster.data[b].damage.user) {
				bb = sum(Monster.data[b].damage.user) / sum(Monster.data[b].damage);
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
	//th(output, '');
        //th(output, '');
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
		args = '?casuser=' + uid + (type.mpool ? '&mpool=' + type.mpool : '') 
				+ (monster.page === 'festival' ? ('&mid=' + type.festival) : '');
		if (Monster.option.assist_links && (monster.state === 'engage' || monster.state === 'assist') && type.siege !== false ) {
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
		td(output, Page.makeLink(type.raid ? 'raid.php' : monster.page === 'festival' ? 'festival_battle_monster.php' : 'battle_monster.php', args, '<img src="' + imagepath + type.list + '" style="width:72px;height:20px; position: relative; left: -8px; opacity:.7;" alt="' + type.name + '"><strong class="overlay">' + monster.state + '</strong>'), 'title="' + tt + '"');
		image_url = imagepath + type.list;
		//console.log(warn(), image_url);

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

		var activity = (monster.damage ? sum(monster.damage.user) : 0) + sum(monster.defend);
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
			(blank || monster.state !== 'engage' || (typeof monster.damage.user === 'undefined'))
				? ''
				: '<span style="color: ' + color + ';">' + activity.addCommas() + '</span>',
			blank
				? ''
				: 'title="' + ( sum(monster.damage.user) / monster.total * 100).round(2) + '% from ' + (sum(monster.stamina)/5 || 'an unknown number of') + ' PAs"');

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
		var x = $(this).attr('name');
		Monster._unflush();
		delete Monster.data[x];
		Monster.dashboard();
		return false;
	});
	$('a.golem-monster-ignore').live('click', function(event){
		var x = $(this).attr('name');
		Monster._unflush();
		Monster.data[x].ignore = !Monster.data[x].ignore;
		Monster.dashboard();
		return false;
	});
        $('a.golem-monster-override').live('click', function(event){
		var y = $(this).attr('name');
                Monster._unflush();
		Monster.data[y].override = !Monster.data[y].override;
		Monster.dashboard();
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
	makeTimer, Divisor, length, unique, deleteElement, sum, findInArray, findInObject, objectIndex, sortObject, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
	makeImage
*/
/********** Worker.News **********
* Aggregate the news feed
*/
var News = new Worker('News');
News.data = News.temp = null;

News.defaults['castle_age'] = {
	pages:'index'
};

News.runtime = {
	last:0
};

News.parse = function(change) {
	if (change) {
		var xp = 0, bp = 0, wp = 0, win = 0, lose = 0, deaths = 0, cash = 0, i, list = [], user = {}, last_time = this.runtime.last, killed = false;
		this.runtime.last = Date.now();
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
//					console.log(warn(), 'Add to History (+battle): exp = '+my_xp+', bp = '+my_bp+', wp = '+my_wp+', income = '+my_cash);
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
			user = sortObject(user, function(a,b){return (user[b].win + (user[b].lose / 100)) - (user[a].win + (user[a].lose / 100));});
			for (i in user) {
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
	makeTimer, Divisor, length, unique, deleteElement, sum, findInArray, findInObject, objectIndex, sortObject, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
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
		monster_monster_list:	{url:'battle_monster.php', image:'tab_monster_list_on.gif'},
		monster_battle_monster:	{url:'battle_monster.php', selector:'div[style*="nm_monster_list_button.gif"]'},
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
	makeTimer, Divisor, length, unique, deleteElement, sum, findInArray, findInObject, objectIndex, sortObject, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
	makeImage
*/
/********** Worker.Player **********
* Gets all current stats we can see
*/
var Player = new Worker('Player');
Player.option = Player.runtime = Player.temp = null;

Player.settings = {
	keep:true
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
			this.set('battle', $('td.statsTMainback img[src*=rank_medals]').attr('src').filepart().regex(/(\d+)/));
			this.set('war', $('td.statsTMainback img[src*=rank_medals_war]').attr('src').filepart().regex(/(\d+)/));
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
			//console.log(warn(), 'Land.income: ' + JSON.shallow(o, 2));
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
			Config.set(types[j], unique(list.sort(function(a,b){return a-b;})));
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
	var data = this.data, when;
	switch(what) {
		case 'cash_timer':		return (data.cash_time - Date.now()) / 1000;
//		case 'cash_timer':		when = new Date();
//								return (3600 + data.cash_time - (when.getSeconds() + (when.getMinutes() * 60))) % 3600;
		case 'energy_timer':	return $('#app46755028429_energy_time_value').text().parseTimer();
		case 'health_timer':	return $('#app46755028429_health_time_value').text().parseTimer();
		case 'stamina_timer':	return $('#app46755028429_stamina_time_value').text().parseTimer();
		case 'exp_needed':		return data.maxexp - data.exp;
		case 'bank':			return (data.bank - Bank.option.keep > 0) ? data.bank - Bank.option.keep : 0;
		case 'bsi':				return ((data.attack + data.defense) / data.level).round(2);
		case 'lsi':				return (((data.maxstamina * 2) + data.maxenergy) / data.level).round(2);
		case 'csi':				return ((data.attack + data.defense + (data.maxstamina * 2) + data.maxenergy + data.maxhealth - 100) / data.level).round(2);
		default: return this._get(what, def);
	}
};

/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page, Queue, Resources,
	Battle, Generals, LevelUp, Player,
	APP, APPID, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, Divisor, length, unique, deleteElement, sum, findInArray, findInObject, objectIndex, sortObject, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
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
	$('.result_body:contains("You have acquired the Energy Potion!")').each(function(i,el){
		Potions.set(['data','Energy'], Potions.data['Energy'] + 1);
	});
	if (Page.page === 'keep_stats' && $('.keep_attribute_section').length) {// Only our own keep
		var potions = {};
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
		console.log(warn(), 'Wanting to drink a ' + this.runtime.type + ' potion');
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
	makeTimer, Divisor, length, unique, deleteElement, sum, findInArray, findInObject, objectIndex, sortObject, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
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
	pages:'quests_quest1 quests_quest2 quests_quest3 quests_quest4 quests_quest5 quests_quest6 quests_quest7 quests_quest8 quests_quest9 quests_quest10 quests_quest11 quests_quest12 quests_demiquests quests_atlantis'
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

Quest.land = ['Land of Fire', 'Land of Earth', 'Land of Mist', 'Land of Water', 'Demon Realm', 'Undead Realm', 'Underworld', 'Kingdom of Heaven', 'Ivory City', 'Earth II', 'Water II', 'Mist II'];
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
	var data = this.get('data'), runtime = this.get('runtime'), i, j, r, x;
	for (i in data) {
		if (i.indexOf('\t') !== -1) { // Fix bad page loads...
			delete data[i];
		}
	}
	if (this.option.monster === true) {
		this.option.monster = 'When able';
	} else if (this.option.monster === false) {
		this.option.monster = 'Never';
	}

	r = this.rdmap = {};
	for (i in this.rdata) {
		for (j in this.rdata[i]) {
			if ((x = j.regex(/^reps_q(\d+)$/i))) {
				r[i + ';' + x] = this.rdata[i][j];
			} else if (j.match(/^reps_d\d+$/i)) {
				x = i + ';demiquest';
				if (!r[x]) {
					r[x] = this.rdata[i][j];
				} else {
					console.log(warn(), 'rdata demiquest dup on ' + x);
				}
			} else if (j.match(/^reps_a\d+$/i)) {
				x = i + ';atlantis';
				if (!r[x]) {
					r[x] = this.rdata[i][j];
				} else {
					console.log(warn(), 'rdata demiquest dup on ' + x);
				}
			}
		}
	}

	// one time pre-r845 fix for erroneous values in m_c, m_d, reps, eff
	if ((runtime.revision || 0) < 845) {
		for (i in data) {
			if (data[i].reps) {
				x = this.wiki_reps(data[i], true);
				if (data[i].reps < Math.round(x * 0.8) || data[i].reps > Math.round(x * 1.2)) {
					console.log(warn(), 'Quest.init: deleting metrics for: ' + i);
					delete data[i].m_c;
					delete data[i].m_d;
					delete data[i].reps;
					delete data[i].eff;
				}
			}
		}
	}

	// one time pre-r850 fix to map data by id instead of name
	if ((runtime.revision || 0) < 850) {
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

	// one time pre-r851 fix for Queue triggered quest by name instead of id
	if ((runtime.revision || 0) < 851) {
		if (Queue.get('runtime.quest')) {
			Queue.set('runtime.quest', false);
		}
	}

	runtime.revision = revision; // started r845 for historic reference

	this._watch(Player, 'data.energy');
	this._watch(Player, 'data.maxenergy');
};

Quest.parse = function(change) {
	var data = this.data, last_main = 0, area = null, land = null, i, m_c, m_d, m_i, reps, purge, changes = 0;
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
	purge = {};
	for (i in data.id) {
		if (data.id[i].area === area && (area !== 'quest' || data.id[i].land === land)) {
			purge[i] = true;
		}
	}
	if ($('div.quests_background,div.quests_background_sub').length !== $('div.quests_background .quest_progress,div.quests_background_sub .quest_sub_progress').length) {
		Page.to(Page.page, '');// Force a page reload as we're pretty sure it's a bad page load!
		return false;
	}
	$('div.quests_background,div.quests_background_sub,div.quests_background_special').each(function(i,el){
		var id, name, level, influence, reward, units, energy, exp, tmp, type = 0;
		if ((tmp = $('input[name="quest"]', el)).length) {
		    id = $(tmp).val().regex(/(\d+)/);
		}
		if ($(el).hasClass('quests_background_sub')) { // Subquest
			name = $('.quest_sub_title', el).text().trim();
			if ((tmp = $('.qd_2_sub', el).text().replace(/\s+/gm, ' ').replace(/,/g, '').replace(/mil\b/gi, '000000'))) {
				exp = tmp.regex(/\b(\d+)\s*Exp\b/im);
				reward = tmp.regex(/\$\s*(\d+)\s*-\s*\$\s*(\d+)\b/im);
			}
			energy = $('.quest_req_sub', el).text().regex(/\b(\d+)\s*Energy\b/im);
			level = $('.quest_sub_progress', el).text().regex(/\bLEVEL:?\s*(\d+)\b/im);
			influence = $('.quest_sub_progress', el).text().regex(/\bINFLUENCE:?\s*(\d+)%/im);
			type = 2;
		} else {
			name = $('.qd_1 b', el).text().trim();
			if ((tmp = $('.qd_2', el).text().replace(/\s+/gm, ' ').replace(/,/g, '').replace(/mil\b/gi, '000000'))) {
				exp = tmp.regex(/\b(\d+)\s*Exp\b/im);
				reward = tmp.regex(/\$\s*(\d+)\s*-\s*\$\s*(\d+)\b/im);
			}
			energy = $('.quest_req', el).text().regex(/\b(\d+)\s*Energy\b/im);
			if ($(el).hasClass('quests_background')) { // Main quest
				last_main = id;
				level = $('.quest_progress', el).text().regex(/\bLEVEL:?\s*(\d+)\b/im);
				influence = $('.quest_progress', el).text().regex(/\bINFLUENCE:?\s*(\d+)%/im);
				type = 1;
			} else { // Special / boss Quest
				type = 3;
			}
		}
		if (!id || !name || name.indexOf('\t') !== -1 || !type || !energy || !exp || !reward || !reward[0] || !reward[1]) {
			// Hopefully stop it finding broken page load quests...
			// but most times if some of this is wrong, a layout change has
			// happened to the quest pages, and we want some kind of warning.
			/*
			console.log(warn(), 'Bad quest data:' +
			  ' id:' + JSON.shallow(id, 2) +
			  ' name:' + JSON.shallow(name, 2) +
			  ' type:' + JSON.shallow(type, 2) +
			  ' energy:' + JSON.shallow(energy, 2) +
			  ' exp:' + JSON.shallow(exp, 2) +
			  ' reward:' + JSON.shallow(reward, 2) +
			  ' level:' + JSON.shallow(level, 2) +
			  ' influence:' + JSON.shallow(influence, 2));
			*/
			return;
		}
		m_c = 0; // percentage count metric
		m_d = 0; // percentage delta metric
		m_i = null; // last influence value
		reps = 0; // average reps needed per level
		if (data.id[id]) {
			m_c = data.id[id].m_c || 0;
			m_d = data.id[id].m_d || 0;
			m_i = data.id[id].influence;
			reps = data.id[id].reps || 0;
		}
		if (purge[id]) {
			purge[id] = false;
		}
		data.id[id] = {};
		data.id[id].name = name;
		data.id[id].area = area;
		data.id[id].type = type;
		if (type === 2 && last_main) {
			data.id[id].main = last_main;
		}
		if (isNumber(land)) {
			data.id[id].land = land;
		}
		if (isNumber(influence)) {
			data.id[id].level = (level || 0);
			data.id[id].influence = influence;
			if (isNumber(m_i) && m_i < influence && influence < 100) {
				m_d += influence - m_i;
				m_c++;
			}
		}
		data.id[id].exp = exp;
		data.id[id].reward = (reward[0] + reward[1]) / 2;
		data.id[id].energy = energy;
		if (isNumber(m_c) && m_c && isNumber(m_d) && m_d) {
			data.id[id].m_c = m_c;
			data.id[id].m_d = m_d;
			reps = Math.ceil(m_c * 100 / m_d);
		}
		if (isNumber(reps) && reps) {
			data.id[id].reps = reps;
			data.id[id].eff = data.id[id].energy * reps;
		}
		if (type !== 2) { // That's everything for subquests
			if (type === 3) { // Special / boss quests create unique items
				data.id[id].unique = true;
			}
			tmp = $('.qd_1 img', el).last();
			if (tmp.length && tmp.attr('title')) {
				data.id[id].item	= tmp.attr('title').trim();
				data.id[id].itemimg	= tmp.attr('src').filepart();
			}
			units = {};
			$('.quest_req >div >div >div', el).each(function(i,el){
				var title = $('img', el).attr('title');
				units[title] = $(el).text().regex(/(\d+)/);
			});
			if (length(units)) {
				data.id[id].units = units;
			}
			tmp = $('.quest_act_gen img', el);
			if (tmp.length && tmp.attr('title')) {
				data.id[id].general = tmp.attr('title');
			}
		}
		changes++;
	});
	for (i in purge) {
		if (purge[i]) {
			console.log(warn(), 'Deleting ' + i + '(' + (Quest.land[data.id[i].land] || data.id[i].area) + ')');
			delete data.id[i];
			changes++;
		}
	}
	if (changes) {
		Quest._notify('data');
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
	// First let's update the Quest dropdown list(s)...
	var i, unit, own, need, noCanDo = false, best = null, best_cartigan = null, best_vampire = null, best_subquest = null, best_advancement = null, best_influence = null, best_experience = null, best_land = 0, has_cartigan = false, has_vampire = false, list = [], items = {}, data = this.data, maxenergy = Player.get('maxenergy',999), eff, best_adv_eff = 1e10, best_inf_eff = 1e10, cmp, oi, ob;
	if (event.type === 'init' || event.type === 'data') {
		for (i in data.id) {
			if (data.id[i].item && data.id[i].type !== 3) {
				list.push(data.id[i].item);
			}
			for (unit in data.id[i].units) {
				items[unit] = Math.max(items[unit] || 0, data.id[i].units[unit]);
			}
		}
		Config.set('quest_reward', ['Nothing', 'Cartigan', 'Vampire Lord', 'Subquests', 'Advancement', 'Influence', 'Inf+Exp', 'Experience', 'Inf+Cash', 'Cash'].concat(unique(list).sort()));
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
		if (this.option.what !== 'Cartigan' || (Generals.get('Cartigan', false) || (Alchemy.get(['ingredients', 'eq_underworld_sword.jpg'], 0, 'number') >= 3 && Alchemy.get(['ingredients', 'eq_underworld_amulet.jpg'], 0, 'number') >= 3 && Alchemy.get(['ingredients', 'eq_underworld_gauntlet.jpg'], 0, 'number') >= 3))) {
			// Sword of the Faithless x3 - The Long Path, Burning Gates
			// Crystal of Lament x3 - Fiery Awakening
			// Soul Eater x3 - Fire and Brimstone, Deathrune Castle
			has_cartigan = true; // Stop trying once we've got the general or the ingredients
		}
//		console.log(warn(), 'option = ' + this.option.what);
//		best = (this.runtime.best && data.id[this.runtime.best] && (data.id[this.runtime.best].influence < 100) ? this.runtime.best : null);
		for (i in data.id) {
			// Skip quests we can't afford or can't equip the general for
			oi = data.id[i];
			if (oi.energy > maxenergy 
					|| !Generals.test(oi.general || 'any')
					|| (Queue.runtime.general && oi.general)) {
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
		this.runtime.best = best;
		if (best) {
			this.runtime.energy = data.id[best].energy;
			console.log(warn(), 'Wanting to perform - ' + data.id[best].name + ' in ' + (isNumber(data.id[best].land) ? this.land[data.id[best].land] : this.area[data.id[best].area]) + ' (energy: ' + data.id[best].energy + ', experience: ' + data.id[best].exp + ', gold: $' + data.id[best].reward.SI() + ')');
		}
	}
	if (best) {
		Dashboard.status(this, (isNumber(data.id[best].land) ? this.land[data.id[best].land] : this.area[data.id[best].area]) + ': ' + data.id[best].name + ' (' + makeImage('energy') + data.id[best].energy + ' = ' + makeImage('exp') + data.id[best].exp + ' + ' + makeImage('gold') + '$' + data.id[best].reward.SI() + (data.id[best].item ? Town.get([data.id[best].item,'img'], null) ? ' + <img style="width:16px;height:16px;margin-bottom:-4px;" src="' + imagepath + Town.get([data.id[best].item, 'img']) + '" title="' + data.id[best].item + '">' : ' + ' + data.id[best].item : '') + (isNumber(data.id[best].influence) && data.id[best].influence < 100 ? (' @ ' + makeImage('percent','Influence') + data.id[best].influence + '%') : '') + ')');
	} else {
		Dashboard.status(this);
	}
};

Quest.work = function(state) {
	var mid, general = 'any', best = Queue.runtime.quest || this.runtime.best, useable_energy = Queue.runtime.force.energy ? Queue.runtime.energy : Queue.runtime.energy - this.option.energy_reserve;
	if (!best || (!Queue.runtime.quest && this.runtime.energy > useable_energy)) {
		if (state && this.option.bank && !Bank.stash()) {
			return QUEUE_CONTINUE;
		}
		return QUEUE_FINISH;
	}
	// If holding for fortify, then don't quest if we have a secondary or defend target possible, unless we're forcing energy.
	if ((Queue.runtime.levelup && !Queue.runtime.quest)
			|| (!Queue.runtime.levelup 
				&& ((this.option.monster === 'When able' && Monster.get('runtime.defending')) 
					|| (this.option.monster === 'Wait for' && (Monster.get('runtime.defending')
						|| !Queue.runtime.force.energy))))) {
		return QUEUE_FINISH;
	}
	if (!state) {
		return QUEUE_CONTINUE;
	}
	if (this.option.general) {
		if (this.data.id[best].general && isNumber(this.data.id[best].influence) && this.data.id[best].influence < 100) {
			general = this.data.id[best].general;
		} else {
			general = Generals.best('under level 4');
			switch(this.option.what) {
				case 'Vampire Lord':
				case 'Cartigan':
					if (this.data.id[best].general) {
						general = this.data.id[best].general;
					} else {
						if (general === 'any' && isNumber(this.data.id[best].influence) && this.data.id[best].influence < 100) {
							general = Generals.best('influence');
						}
						if (general === 'any') {
							general = Generals.best('item');
						}
					}
					break;
				case 'Subquest':
				case 'Advancement':
				case 'Influence':
				case 'Inf+Exp':
				case 'Experience':
				case 'Inf+Cash':
				case 'Cash':
					if (isNumber(this.data.id[best].influence) && this.data.id[best].influence < 100) {
						if (this.data.id[best].general) {
							general = this.data.id[best].general;
						} else if (general === 'any') {
							general = Generals.best('influence');
						}
					}
					break;
				default:
					if (isNumber(this.data.id[best].influence) && this.data.id[best].influence < 100) {
						if (this.data.id[best].general) {
							general = this.data.id[best].general;
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
	if (!Generals.to(Queue.runtime.general || general)) {
		return QUEUE_CONTINUE;
	}
	switch(this.data.id[best].area) {
		case 'quest':
			if (!Page.to('quests_quest' + (this.data.id[best].land + 1))) {
				return QUEUE_CONTINUE;
			}
			break;
		case 'demiquest':
			if (!Page.to('quests_demiquests')) {
				return QUEUE_CONTINUE;
			}
			break;
		case 'atlantis':
			if (!Page.to('quests_atlantis')) {
				return QUEUE_CONTINUE;
			}
			break;
		default:
			console.log(log(), 'Can\'t get to quest area!');
			return QUEUE_FINISH;
	}
	console.log(warn(), 'Performing - ' + this.data.id[best].name + ' (energy: ' + this.data.id[best].energy + ')');
	//console.log(warn(),'Quest ' + this.data.id[best].name + ' general ' + this.data.id[best].general + ' test ' + !Generals.test(this.data.id[best].general || 'any') + ' this.data || '+ (this.data.id[best].general || 'any') + ' queue ' + (Queue.runtime.general && this.data.id[best].general));
	if (!Page.click($('input[name="quest"][value="' + best + '"]').siblings('.imgButton').children('input[type="image"]'))) { // Can't find the quest, so either a bad page load, or bad data - delete the quest and reload, which should force it to update ok...
		console.log(warn(), 'Can\'t find button for ' + this.data.id[best].name + ', so deleting and re-visiting page...');
		delete this.data.id[best];
		this.runtime.best = null;
		Page.reload();
	}
	Queue.runtime.quest = false;
	if (this.data.id[best].type === 3) {// Just completed a boss quest
		if (!Alchemy.get(['ingredients', this.data.id[best].itemimg], 0, 'number')) {// Add one as we've just gained it...
			Alchemy.set(['ingredients', this.data.id[best].itemimg], 1);
		}
		if (this.option.what === 'Advancement' && Page.pageNames['quests_quest' + (this.data.id[best].land + 2)]) {// If we just completed a boss quest, check for a new quest land.
			Page.to('quests_quest' + (this.data.id[best].land + 2));// Go visit the next land as we've just unlocked it...
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

	this.temp.cost = 1e50;
	this.temp.upkeep = 1e50;
	this.temp.desc = '(n/a)';

	cost = ccount = 0;
	upkeep = ucount = 0;
	desc = '';


	if (id && quest[id]) {
		if ((i = quest[id].general)) {
			if (!gens || !gens[i]) {
				cost += 1e50;
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
				k = 1e50;
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
					if (k >= 1e50) {
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
			if (cost < 1e50) {
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
	var reps = 0, n, q, v;

	if (isObject(quest)) {
		if (!isNumber(quest.level)) {
			reps = 1;
		} else {
			n = (quest.name || '?').toLowerCase();
			q = (isNumber(quest.land) ? (quest.land + 1) : quest.area) || '?';
			if ((v = this.rdmap[n + ';' + q])) {
				reps = v;
			}
		}
	}

	if (!reps && !pure) {
		reps = 16;
	}

	return reps;
};


Quest.rts = 1300071247;	// Mon Mar 14 02:54:07 2011 UTC
Quest.rdata =			// #347
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
	'ascent to the skies':				{ 'reps_q8':   0 },
	'attack from above':				{ 'reps_q9':  17 },
	'attack undead guardians':			{ 'reps_q6':  24 },
	'aurelius':							{ 'reps_q11': 11 },
	'aurelius outpost':					{ 'reps_q11':  9 },
	'avoid ensnarements':				{ 'reps_q3':  34 },
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
	'cast aura of night':				{ 'reps_q5':  32 },
	'cast blizzard':					{ 'reps_q10':  0 },
	'cast fire aura':					{ 'reps_q6':  24 },
	'cast holy light':					{ 'reps_q6':  24 },
	'cast holy light spell':			{ 'reps_q5':  24 },
	'cast holy shield':					{ 'reps_d3':  12 },
	'cast meteor':						{ 'reps_q5':  32 },
	'castle of the black lion':			{ 'reps_d5':  13 },
	'castle of the damn':				{ 'reps_d3':  21 },
	'channel excalibur':				{ 'reps_q8':   0 },
	'charge ahead':						{ 'reps_q10':  0 },
	'charge the castle':				{ 'reps_q7':  15 },
	'chasm of fire':					{ 'reps_q10': 10 },
	'city of clouds':					{ 'reps_q8':  11 },
	'clear the rocks':					{ 'reps_q11':  0 },
	'climb castle cliffs':				{ 'reps_q11':  0 },
	'climb the mountain':				{ 'reps_q8':   0 },
	'close the black portal':			{ 'reps_d1':  12 },
	'collect astral souls':				{ 'reps_q12':  0 },
	'confront the black lion':			{ 'reps_d5':  12 },
	'confront the rebels':				{ 'reps_q10': 10 },
	'consult aurora':					{ 'reps_d4':  12 },
	'corruption of nature':				{ 'reps_d4':  20 },
	'cover tracks':						{ 'reps_q7':  19 },
	'cross lava river':					{ 'reps_q7':  20 },
	'cross the bridge':					{ 'reps_q8':   0, 'reps_q10':  0 },
	'cross the moat':					{ 'reps_q11':  0 },
	'crossing the chasm':				{ 'reps_q2':  13, 'reps_q8':   0 },
	'cure infested soldiers':			{ 'reps_q6':  25 },
	'dark heart of the woods':			{ 'reps_q12':  9 },
	'deal final blow to bloodwing':		{ 'reps_d2':  12 },
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
	'defeat lion defenders':			{ 'reps_q11':  0 },
	'defeat orc patrol':				{ 'reps_q8':   0 },
	'defeat rebels':					{ 'reps_q10':  0 },
	'defeat snow giants':				{ 'reps_q3':  24 },
	'defeat the bandit leader':			{ 'reps_q1':   6 },
	'defeat the banshees':				{ 'reps_q5':  25 },
	'defeat the black lion army':		{ 'reps_d5':  12 },
	'defeat the demonic guards':		{ 'reps_d1':  12 },
	'defeat the demons':				{ 'reps_q9':  17 },
	'defeat the kobolds':				{ 'reps_q10':  0 },
	'defeat the patrols':				{ 'reps_q9':  17 },
	'defeat the seraphims':				{ 'reps_q8':   0 },
	'defeat tiger form':				{ 'reps_q11':  0 },
	'defend the village':				{ 'reps_d3':  12 },
	'desert temple':					{ 'reps_q11': 12 },
	'destroy black oozes':				{ 'reps_q11':  0 },
	'destroy fire dragon':				{ 'reps_q4':  10 },
	'destroy fire elemental':			{ 'reps_q4':  16 },
	'destroy horde of ghouls & trolls':	{ 'reps_q4':   9 },
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
	'escape from trakan':				{ 'reps_q12':  7 },
	'escaping the chaos':				{ 'reps_q9':  17 },
	'escaping the stronghold':			{ 'reps_q9':  10 },
	'explore merchant plaza':			{ 'reps_q11':  0 },
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
	'find evidence of dragon attack':	{ 'reps_d2':   8 },
	'find hidden path':					{ 'reps_d2':  10 },
	'find nezeals keep':				{ 'reps_d3':  12 },
	'find rock worms weakness':			{ 'reps_d2':  10 },
	'find source of the attacks':		{ 'reps_d3':  12 },
	'find survivors':					{ 'reps_q8':  14 },
	'find the dark elves':				{ 'reps_d1':  12 },
	'find the demonic army':			{ 'reps_d1':  12 },
	'find the druids':					{ 'reps_d4':  12 },
	'find the entrance':				{ 'reps_q8':   0 },
	'find the exit':					{ 'reps_q9':  17 },
	'find the safest path':				{ 'reps_q10':  0 },
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
	'get information from the druid':	{ 'reps_d4':  12 },
	'get water for the druid':			{ 'reps_d4':  12 },
	'grim outlook':						{ 'reps_q9':  17 },
	'guard against attack':				{ 'reps_d5':  12 },
	'heal wounds':						{ 'reps_q7':  20 },
	'heat the villagers':				{ 'reps_q1':   5 },
	'holy fire':						{ 'reps_d4':  11 },
	'impending battle':					{ 'reps_q10': 10 },
	'interrogate the prisoners':		{ 'reps_q9':  17 },
	'investigate the gateway':			{ 'reps_q8':   0 },
	'ironfist dwarves':					{ 'reps_q10': 10 },
	'join up with artanis':				{ 'reps_d1':  12 },
	'judgement stronghold':				{ 'reps_q8':  11 },
	'juliean desert':					{ 'reps_q11': 12 },
	'kelp forest':						{ 'reps_a1':  20 },
	'kill gildamesh':					{ 'reps_q3':  34 },
	'kill vampire bats':				{ 'reps_d3':  10 },
	'koralan coast town':				{ 'reps_q11': 14 },
	'koralan townspeople':				{ 'reps_q11': 10 },
	'learn about death knights':		{ 'reps_d5':  12 },
	'learn aurelius intentions':		{ 'reps_q11':  0 },
	'learn counterspell':				{ 'reps_d1':  12 },
	'learn holy fire':					{ 'reps_d4':  12 },
	'look for clues':					{ 'reps_q8':  14 },
	'lothar the ranger':				{ 'reps_q12':  9 },
	'marauders!':						{ 'reps_d5':   9 },
	'march into the undead lands':		{ 'reps_q6':  24 },
	'march to the unholy war':			{ 'reps_q6':  25 },
	'mausoleum of triste':				{ 'reps_q3':  17 },
	'misty hills of boralis':			{ 'reps_q3':  20 },
	'mount aretop':						{ 'reps_d2':  25 },
	'nightfall':						{ 'reps_q12':  9 },
	'nightmare':						{ 'reps_q6':  20 },
	'outpost entrance':					{ 'reps_q11': 12 },
	'path to heaven':					{ 'reps_q8':  11 },
	'persuade terra':					{ 'reps_q12':  0 },
	'pick up the orc trail':			{ 'reps_q1':   6 },
	'plan the attack':					{ 'reps_d5':  12 },
	'portal of atlantis':				{ 'reps_a1':  20 },
	'power of excalibur':				{ 'reps_q8':  11 },
	'prepare for ambush':				{ 'reps_q1':   6 },
	'prepare for battle':				{ 'reps_d2':  12, 'reps_q5':  21 },
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
	'question townspeople':				{ 'reps_q11':  0 },
	'question vulcan':					{ 'reps_q8':   0 },
	'ready the horses':					{ 'reps_q1':   6 },
	'reason with guards':				{ 'reps_q12':  0 },
	'recover the key':					{ 'reps_q9':  17 },
	'recruit allies':					{ 'reps_q10':  0 },
	'recruit elekin to join you':		{ 'reps_d2':   9 },
	'recruit furest to join you':		{ 'reps_d3':  12 },
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
	'save lost souls':					{ 'reps_q5':  24 },
	'save stranded soldiers':			{ 'reps_q10':  0 },
	'seek out elekin':					{ 'reps_d2':   9 },
	'seek out furest hellblade':		{ 'reps_d3':  12 },
	'seek out jeweled heart':			{ 'reps_d5':  12 },
	'shield of the stars':				{ 'reps_d3':  20 },
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
	'spring surprise attack':			{ 'reps_d5':  12 },
	'stop the wolf from channeling':	{ 'reps_d4':  12 },
	'storm the castle':					{ 'reps_d5':  12 },
	'storm the ivory palace':			{ 'reps_q9':  17 },
	'sulfurous springs':				{ 'reps_q11': 10 },
	'summon legendary defenders':		{ 'reps_q6':  25 },
	'surround rebels':					{ 'reps_q10':  0 },
	'survey battlefield':				{ 'reps_q10':  0 },
	'survey the surroundings':			{ 'reps_q8':  14 },
	'survive the storm':				{ 'reps_q11':  0 },
	'survive troll ambush':				{ 'reps_q2':  10 },
	'surviving the onslaught':			{ 'reps_q9':  17 },
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
	makeTimer, Divisor, length, unique, deleteElement, sum, findInArray, findInObject, objectIndex, sortObject, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
	makeImage, bestValue
*/
/********** Worker.Town **********
* Sorts and auto-buys all town units (not property)
*/
var Town = new Worker('Town');
Town.temp = null;

Town.defaults['castle_age'] = {
	pages:'town_soldiers town_blacksmith town_magic keep_stats'
};

Town.option = {
	general:true,
	quest_buy:true,
	number:'None',
	maxcost:'$10m',
	units:'Best for Both',
	sell:false,
	upkeep:20
};

Town.runtime = {
	best_buy:null,
	best_sell:null,
	buy:0,
	sell:0,
	cost:0,
	soldiers:0,
	blacksmith:0,
	magic:0
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
	select:['$10k','$100k','$1m','$10m','$100m','$1b','$10b','$100b','$1t','$10t','$100t','INCR'],
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

  // as of Wed Mar 16 22:02:43 2011 UTC
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
      '|\\bfang\\b' +			// 1
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
      '|\\bstaff\\b' +			// 8 (mismatches 1)
      '|\\bstaves\\b' +			// 1
      '|\\bsword\\b' +			// 16 (mismatches 1)
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
      '|^Holy Avenger$' +
      '|^Incarnation$' +
      "|^Ironhart's Might$" +
      '|^Judgement$' +
      '|^Justice$' +
      '|^Lifebane$' +
      '|^Lightbringer$' +
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
      '|^The Disemboweler$' +
      '|^The Galvanizer$' +
      '|^The Reckoning$' +
      '|^Virtue of Justice$' +
      ')', 'i'),
    Shield: new RegExp('(' +
      '\\baegis\\b' +			// 4
      '|\\bbuckler\\b' +		// 1
      '|\\bdeathshield\\b' +	// 1
      '|\\bdefender\\b' +		// 4
      '|\\bprotector\\b' +		// 1
      '|\\bshield\\b' +			// 22
      '|\\btome\\b' +			// 3
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
      '|\\bbattlegear\\b' +		// 3
      '|\\bbelt\\b' +			// 1
      '|\\bcarapace\\b' +		// 1
      '|\\bchainmail\\b' +		// 2
      '|\\bcloak\\b' +			// 7
      '|\\bepaulets\\b' +		// 1
      '|\\bgarb\\b' +			// 1
      '|\\bpauldrons\\b' +		// 1
      '|\\bplate\\b' +			// 31
      '|\\bplatemail\\b' +		// 2
      '|\\braiments\\b' +		// 5
      '|\\brobes?\\b' +			// 1+7
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
      '|\\bhelm\\b' +			// 37
      '|\\bhelmet\\b' +			// 2
      '|\\bhorns\\b' +			// 1
      '|\\bmane\\b' +			// 1
      '|\\bmask\\b' +			// 2
      '|\\btiara\\b' +			// 1
      '|\\bveil\\b' +			// 1
      '|^Virtue of Fortitude$' +
      ')', 'i'),
    Amulet: new RegExp('(' +
      '\\bamulet\\b' +			// 17
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
      '|\\bpendant\\b' +		// 10
      '|\\brelic\\b' +			// 1
      '|\\bring\\b' +			// 8
      '|\\bruby\\b' +			// 1
      '|\\bseal\\b' +			// 3
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
      '|\\bhands?\\b' +			// 4+3
      '|^Natures Reach$' +
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
	this._watch(Player, 'data.worth');
	this._watch(Land, 'runtime.save_amount');
	this.runtime.cost_incr = 4;
	this.runtime.soldiers = this.runtime.blacksmith = this.runtime.magic = 0;
};

  // .layout td >div:contains("Owned Items:")
  // .layout td >div div[style*="town_unit_bar."]
  // .layout td >div div[style*="town_unit_bar_owned."]
Town.parse = function(change) {
	var modify = false;
	if (change && Page.page === 'town_blacksmith') {
		$('div[style*="town_unit_bar."],div[style*="town_unit_bar_owned."]').each(function(i,el) {
			var name = $('div img[alt]', el).attr('alt').trim(),
				icon = $('div img[src]', el).attr('src').filepart();
			if (Town.dup_map[name] && Town.dup_map[name][icon]) {
				name = Town.dup_map[name][icon];
			}
			if (Town.data[name] && Town.data[name].type) {
				$('div strong:first', el).parent().append('<br>'+Town.data[name].type);
			}
		});
	} else if (Page.page === 'keep_stats') {
		var keep = $('.keep_attribute_section').first();
		// Only when it's our own keep and not someone elses
		if (keep.length) {
			var tmp = $('.statsTTitle:contains("UNITS") + .statsTMain .statUnit');
			if (tmp.length) {
				tmp.each(function(a, el) {
					var b = $('a img[src]', el);
					var i = $(b).attr('src').filepart();
					var n = ($(b).attr('title') || $(b).attr('alt') || '').trim();
					var c = $(el).text().regex(/\bX\s*(\d+)\b/i);
					if (!Town.data[n]) {
						Town.set('runtime.soldiers', -1);
						return false;
					} else if (Town.data[n].own != c) {
						Town.set(['data', n, 'own'], c);
					}
				});
			}

			tmp = $('.statsTTitle:contains("ITEMS") + .statsTMain .statUnit');
			if (tmp.length) {
				tmp.each(function(a, el) {
					var b = $('a img[src]', el);
					var i = $(b).attr('src').filepart();
					var n = ($(b).attr('title') || $(b).attr('alt') || '').trim();
					var c = $(el).text().regex(/\bX\s*(\d+)\b/i);
					// names aren't unique for items
					if (n && Town.dup_map[n] && Town.dup_map[n][i]) {
						n = Town.dup_map[n][i];
					}
					if (!Town.data[n] || Town.data[n].img !== i) {
						Town.set('runtime.blacksmith', -1);
						Town.set('runtime.magic', -1);
						return false;
					} else if (Town.data[n].own != c) {
						Town.set(['data', n, 'own'], c);
					}
				});
			}
		}
	} else if (!change) {
		var unit = Town.data, page = Page.page.substr(5), purge, changes = 0, i, j, cost_adj = 1;
		purge = {};
		for (i in unit) {
			if (unit[i].page === page) {
				purge[i] = true;
			}
		}
		// undo cost reduction general values on the magic page
		if (page === 'magic' && (i = Generals.get(Player.get('general')))) {
			j = Math.max(nmax(((i.skills || '') + ';' + (i.weaponbonus || '')).regex(/\bDecrease Soldier Cost by (\d+)\b/ig)),
			  (i.stats && i.stats.cost) || 0,
			  (i.potential && i.potential.cost) || 0);
			if (j) {
				cost_adj = 100 / (100 - j);
			}
		}
		$('div[style*="town_unit_bar."],div[style*="town_unit_bar_owned."]').each(function(a,el) {
			var i, j,
				name = $('div img[alt]', el).attr('alt').trim(),
				icon = $('div img[src]', el).attr('src').filepart(),
				cost = $('div strong.gold', el).text().replace(/\D/g, ''),
				own = $('div div:contains("Owned:")', el).text().regex(/\bOwned:\s*(\d+)\b/i),
				atk = $('div div div:contains("Attack")', el).text().regex(/\b(\d+)\s+Attack\b/),
				def = $('div div div:contains("Defense")', el).text().regex(/\b(\d+)\s+Defense\b/i),
				upkeep = $('div div:contains("Upkeep:") span.negative', el).text().replace(/\D/g, ''),
				match, maxlen = 0;
			changes++;
			if (Town.dup_map[name] && Town.dup_map[name][icon]) {
				name = Town.dup_map[name][icon];
			}
			if (purge[name]) {
				purge[name] = false;
			}
			unit[name] = unit[name] || {};
			unit[name].page = page;
			unit[name].img = icon;
			unit[name].own = own || 0;
			Resources.add('_'+name, unit[name].own, true);
			unit[name].att = atk || 0;
			unit[name].def = def || 0;
			unit[name].tot_att = unit[name].att + (0.7 * unit[name].def);
			unit[name].tot_def = unit[name].def + (0.7 * unit[name].att);
			if (cost) {
				unit[name].cost = Math.round(cost_adj * (parseInt(cost, 10) || 0));
			} else if ('cost' in unit[name]) {
				delete unit[name].cost;
			}
			if (upkeep) {
				unit[name].upkeep = parseInt(upkeep, 10) || 0;
			} else if ('upkeep' in unit[name]) {
				delete unit[name].upkeep;
			}
			if (cost) {
				unit[name].id = null;
				if ((i = $('form .imgButton input[name="Buy"]', el)).length) {
					if ((j = i.closest('form').attr('id')) && (j = (j.regex(/^app46755028429_itemBuy_(\d+)$/)))) {
						unit[name].id = j;
					}
					unit[name].buy = [];
					$('select[name="amount"] option', i.closest('form')).each(function(b,el) {
						unit[name].buy.push(parseInt($(el).val(), 10));
					});
				} else {
					unit[name].buy = null;
				}
				if ((i = $('form .imgButton input[name="Sell"]', el)).length) {
					if ((j = i.closest('form').attr('id')) && (j = (j.regex(/^app46755028429_itemSell_(\d+)$/)))) {
						unit[name].id = j;
					}
					unit[name].sell = [];
					$('select[name="amount"] option', i.closest('form')).each(function(b,el) {
						unit[name].sell.push(parseInt($(el).val(), 10));
					});
				} else {
					unit[name].sell = null;
				}
			} else {
				if ('buy' in unit[name]) {
					delete unit[name].buy;
				}
				if ('sell' in unit[name]) {
					delete unit[name].sell;
				}
			}
			if (page === 'blacksmith') {
				unit[name].type = null;
				for (i in Town.blacksmith) {
					if ((match = name.match(Town.blacksmith[i]))) {
						j = 1;
//						for (j=0; j<match.length; j++) {
							if (match[j].length > maxlen) {
								unit[name].type = i;
								maxlen = match[j].length;
							}
//						}
					}
				}
			}
		});
		// if nothing at all changed above, something went wrong on the page download
		if (changes > 0) {
			for (i in purge) {
				if (purge[i]) {
					console.log(warn(), 'Purge: ' + i);
					delete unit[i];
					changes++;
				}
			}
		}
		if (changes) {
			this._notify('data');
		}
		modify = true;
	}
	return modify;
};

Town.getInvade = function(army) {
	var att = 0, def = 0, data = this.data;
	att += getAttDef(data, function(list,i,units){if (units[i].page==='soldiers'){list.push(i);}}, 'att', army, 'invade');
	def += getAttDef(data, null, 'def', army, 'invade');
	att += getAttDef(data, function(list,i,units){if (units[i].type && units[i].type !== 'Weapon'){list.push(i);}}, 'att', army, 'invade');
	def += getAttDef(data, null, 'def', army, 'invade');
	att += getAttDef(data, function(list,i,units){if (units[i].type === 'Weapon'){list.push(i);}}, 'att', army, 'invade');
	def += getAttDef(data, null, 'def', army, 'invade');
	att += getAttDef(data, function(list,i,units){if (units[i].page === 'magic'){list.push(i);}}, 'att', army, 'invade');
	def += getAttDef(data, null, 'def', army, 'invade');
	return {attack:att, defend:def};
};

Town.getDuel = function() {
	var att = 0, def = 0, data = this.data;
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

Town.update = function(event) {
	var i, u, need, want, have, best_buy = null, buy_pref = 0, best_sell = null, sell_pref = 0, best_quest = false, buy = 0, sell = 0, cost, upkeep, data = this.data, army = Math.min(Generals.get('runtime.armymax', 501), Player.get('armymax', 501)), max_buy = 0, max_sell = 0, resource, max_cost, keep,
	land_buffer = (Land.get('option.save_ahead', false) && Land.get('runtime.save_amount', 0)) || 0,
	incr = (this.runtime.cost_incr || 4), visit = false;
	if (!Page.data['town_soldiers'] || !Page.data['town_blacksmith'] || !Page.data['town_magic']) {
		visit = true;
	}

	switch (this.option.number) {
		case 'Army':
			max_buy = max_sell = army;
			break;
		case 'Army+':
			max_buy = army;
			max_sell = 541;
			break;
		case 'Max Army':
			max_buy = max_sell = 541;
			break;
		default:
			max_buy = max_sell = 0;
			break;
	}
	// These two fill in all the data we need for buying / sellings items
	this.set(['runtime','duel'], this.getDuel());
	keep = {};
	if (this.option.sell && max_sell !== max_buy) {
		this.getInvade(max_sell);
		for (u in data) {
			resource = Resources.data['_'+u] || {};
			need = 0;
			if (this.option.units !== 'Best Defense') {
				need = Math.max(need, Math.min(max_sell, Math.max(resource.invade_att || 0, resource.duel_att || 0)));
			}
			if (this.option.units !== 'Best Offense') {
				need = Math.max(need, Math.min(max_sell, Math.max(resource.invade_def || 0, resource.duel_def || 0)));
			}
			if ((keep[u] || 0) < need && data[u].sell && data[u].sell.length) {
				keep[u] = need;
//				console.log(warn(), 'Keep[' + u + '] = ' + keep[u]);
			}
			if (resource && (resource.invade_def || resource.invade_att)) {
				if (resource.invade_def) {
					delete resource.invade_def;
				}
				if (resource.invade_att) {
					delete resource.invade_att;
				}
				if (!length(resource)) {
					delete Resources.data['_'+u];
				}
			}
		}
		Resources._notify('data'); // reset the "what-if" tinkering
	}
	this.set(['runtime','invade'], this.getInvade(max_buy));
	// For all items / units
	// 1. parse through the list of buyable items of each type
	// 2. find the one with Resources.get(_item.invade_att) the highest (that's the number needed to hit 541 items in total)
	// 3. buy enough to get there
	// 4. profit (or something)...
	for (u in data) {
		resource = Resources.data['_'+u] || {};
		want = 0;
		if (resource.quest) {
			if (this.option.quest_buy) {
				want = Math.max(want, resource.quest);
			}
			if ((keep[u] || 0) < resource.quest) {
				keep[u] = resource.quest;
			}
		}
		if (isNumber(resource.generals)) {
			if (this.option.generals_buy) {
				want = Math.max(want, resource.generals);
			}
			if ((keep[u] || 0) < (resource.generals || 1e50)) {
				keep[u] = resource.generals || 1e50;
			}
		}
		have = data[u].own;
		// Sorry about the nested max/min/max -
		// Max - 'need' can't get smaller
		// Min - 'max_buy' is the most we want to buy
		// Max - needs to accounts for invade and duel
		need = 0;
		if (this.option.units !== 'Best Defense') {
			need = Math.max(need, Math.min(max_buy, Math.max(resource.invade_att || 0, resource.duel_att || 0)));
		}
		if (this.option.units !== 'Best Offense') {
			need = Math.max(need, Math.min(max_buy, Math.max(resource.invade_def || 0, resource.duel_def || 0)));
		}
		if (want > have) {// If we're buying for a quest item then we're only going to buy that item first - though possibly more than specifically needed
			max_cost = Math.pow(10,30);
			need = want;
		} else {
			max_cost = ({
				'$10k':Math.pow(10,4),
				'$100k':Math.pow(10,5),
				'$1m':Math.pow(10,6),
				'$10m':Math.pow(10,7),
				'$100m':Math.pow(10,8),
				'$1b':Math.pow(10,9),
				'$10b':Math.pow(10,10),
				'$100b':Math.pow(10,11),
				'$1t':Math.pow(10,12),
				'$10t':Math.pow(10,13),
				'$100t':Math.pow(10,14),
				'INCR':Math.pow(10,incr)
			})[this.option.maxcost];
		}
//			console.log(warn(), 'Item: '+u+', need: '+need+', want: '+want);
		if (need > have) {// Want to buy more                                
			if (!best_quest && data[u].buy && data[u].buy.length) {
				if (data[u].cost <= max_cost && this.option.upkeep >= (((Player.get('upkeep') + ((data[u].upkeep || 0) * (i = bestValue(data[u].buy, need - have)))) / Player.get('maxincome')) * 100) && (!best_buy || need > buy)) {
//						console.log(warn(), 'Buy: '+need);
					best_buy = u;
					buy = have + i; // this.buy() takes an absolute value
					buy_pref = Math.max(need, want);
					if (want && want > have) {// If we're buying for a quest item then we're only going to buy that item first - though possibly more than specifically needed
						best_quest = true;
					}
				}
			}
		} else if (max_buy && this.option.sell && Math.max(need,want) < have && data[u].sell && data[u].sell.length) {// Want to sell off surplus (but never quest stuff)
			need = bestValue(data[u].sell, have - (i = Math.max(need,want,keep[u] || 0)));
			if (need > 0 && (!best_sell || data[u].cost > data[best_sell].cost)) {
//					console.log(warn(), 'Sell: '+need);
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
		}
		else if (Bank.worth(this.runtime.cost - land_buffer)) {
			Dashboard.status(this, (this.option._disabled ? 'Would buy ' : 'Buying ') + (buy - data[best_buy].own) + ' &times; ' + best_buy + ' for ' + makeImage('gold') + '$' + cost.SI() + (upkeep ? ' (Upkeep: $' + upkeep.SI() + ')' : '') + (buy_pref > data[best_buy].own ? ' [' + data[best_buy].own + '/' + buy_pref + ']' : ''));
		} else {
			Dashboard.status(this, 'Waiting for ' + makeImage('gold') + '$' + (cost - Bank.worth()).SI() + ' to buy ' + (buy - data[best_buy].own) + ' &times; ' + best_buy + ' for ' + makeImage('gold') + '$' + cost.SI());
		}
	} else {
		if (this.option.maxcost === 'INCR'){
			this.set(['runtime','cost_incr'], incr === 14 ? 4 : incr + 1);
			this.set(['runtime','check'], Date.now() + 3600000);
		} else {
			this.set(['runtime','cost_incr'], null);
			this.set(['runtime','check'], null);
		}
		Dashboard.status(this);
	}
	this.set(['runtime','best_buy'], best_buy);
	this.set(['runtime','buy'], best_buy ? bestValue(data[best_buy].buy, buy - data[best_buy].own) : 0);
	this.set(['runtime','best_sell'], best_sell);
	this.set(['runtime','sell'], sell);
	this.set(['runtime','cost'], best_buy ? this.runtime.buy * data[best_buy].cost : 0);
	this.set(['option','_sleep'], !(this.runtime.best_buy && Bank.worth(this.runtime.cost)) && !this.runtime.best_sell && !visit && Page.stale('town_soldiers', this.get('runtime.soldiers', 0)) && Page.stale('town_blacksmith', this.get('runtime.blacksmith', 0)) && Page.stale('town_magic', this.get('runtime.magic', 0)));
};

Town.work = function(state) {
	var i;
	if (state) {
		if (this.runtime.best_sell){
			this.sell(this.runtime.best_sell, this.runtime.sell);
		} else if (this.runtime.best_buy){
			this.buy(this.runtime.best_buy, this.runtime.buy);
		} else if (!Page.data[i = 'town_soldiers'] || !Page.data[i = 'town_blacksmith'] || !Page.data[i = 'town_magic']) {
			Page.to(i);
		} else if (!Page.stale('town_soldiers', this.get('runtime.soldiers', 0), true)) {
			this.set('runtime.soldiers', 0);
		} else if (!Page.stale('town_blacksmith', this.get('runtime.blacksmith', 0), true)) {
			this.set('runtime.blacksmith', 0);
		} else if (!Page.stale('town_magic', this.get('runtime.magic', 0), true)) {
			this.set('runtime.magic', 0);
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
	var qty = bestValue(this.data[item].buy, number);
	var $form = $('form#app46755028429_itemBuy_' + this.data[item].id);
	if ($form.length) {
		console.log(warn(), 'Buying ' + qty + ' x ' + item + ' for $' + (qty * Town.data[item].cost).addCommas());
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
	var qty = bestValue(this.data[item].sell, number);
	var $form = $('form#app46755028429_itemSell_' + this.data[item].id);
	if ($form.length) {
		console.log(warn(), 'Selling ' + qty + ' x ' + item + ' for $' + (qty * Town.data[item].cost / 2).addCommas());
		$('select[name="amount"]', $form).val(qty);
		Page.click($('input[name="Sell"]', $form));
	}
	this.set(['runtime','cost_incr'], 4);
	return false;
};

var makeTownDash = function(list, unitfunc, x, type, name, count) { // Find total att(ack) or def(ense) value from a list of objects (with .att and .def)
	var units = [], output = [], x2 = (x==='att'?'def':'att'), i, order = {
		Weapon:1,
		Shield:2,
		Helmet:3,
		Armor:4,
		Amulet:5,
		Gloves:6,
		Magic:7
	};
	if (name) {
		output.push('<div class="golem-panel"><h3 class="golem-panel-header" style="width:auto;">'+name+'</h3><div class="golem-panel-content">');
	}
	for (i in list) {
		unitfunc(units, i, list);
	}
	if (list[units[0]]) {
		if (type === 'duel' && list[units[0]].type) {
			units.sort(function(a,b) {
				return order[list[a].type] - order[list[b].type]
					|| (list[a].upkeep || 0) - (list[b].upkeep || 0)
					|| (list[a].cost || 0) - (list[b].cost || 0);
			});
		} else if (list[units[0]] && list[units[0]].skills && list[units[0]][type]) {
			units.sort(function(a,b) {
				return (list[b][type][x] || 0) - (list[a][type][x] || 0)
					|| (list[a].upkeep || 0) - (list[b].upkeep || 0)
					|| (list[a].cost || 0) - (list[b].cost || 0);
			});
		} else {
			units.sort(function(a,b) {
				return (list[b][x] + (0.7 * list[b][x2])) - (list[a][x] + (0.7 * list[a][x2]))
					|| (list[a].upkeep || 0) - (list[b].upkeep || 0)
					|| (list[a].cost || 0) - (list[b].cost || 0);
			});
		}
	}
	for (i=0; i<(count ? count : units.length); i++) {
		if ((list[units[0]] && list[units[0]].skills) || (list[units[i]].use && list[units[i]].use[type+'_'+x])) {
			output.push('<p><div style="height:25px;margin:1px;"><img src="' + imagepath + list[units[i]].img + '" style="width:25px;height:25px;float:left;margin-right:4px;"> ' + (list[units[i]].use ? list[units[i]].use[type+'_'+x]+' x ' : '') + units[i] + ' (' + list[units[i]].att + ' / ' + list[units[i]].def + ')' + (list[units[i]].cost?' $'+list[units[i]].cost.SI():'') + '</div></p>');
		}
	}
	if (name) {
		output.push('</div></div>');
	}
	return output.join('');
};

Town.dashboard = function() {
	var left, right, generals = Generals.get(), best;
	best = Generals.best('duel');
	left = '<div style="float:left;width:50%;"><div class="golem-panel"><h3 class="golem-panel-header" style="width:auto;">Invade - Attack</h3><div class="golem-panel-content" style="padding:8px;">'
	+	makeTownDash(generals, function(list,i){list.push(i);}, 'att', 'invade', 'Heroes')
	+	makeTownDash(this.data, function(list,i,units){if (units[i].page==='soldiers' && units[i].use){list.push(i);}}, 'att', 'invade', 'Soldiers')
	+	makeTownDash(this.data, function(list,i,units){if (units[i].use && units[i].type === 'Weapon'){list.push(i);}}, 'att', 'invade', 'Weapons')
	+	makeTownDash(this.data, function(list,i,units){if (units[i].page==='blacksmith' && units[i].use && units[i].type !== 'Weapon'){list.push(i);}}, 'att', 'invade', 'Equipment')
	+	makeTownDash(this.data, function(list,i,units){if (units[i].page==='magic' && units[i].use){list.push(i);}}, 'att', 'invade', 'Magic')
	+	'</div></div><div class="golem-panel"><h3 class="golem-panel-header" style="width:auto;">Duel - Attack</h3><div class="golem-panel-content" style="padding:8px;">'
	+	(best !== 'any' ? '<div style="height:25px;margin:1px;"><img src="' + imagepath + generals[best].img + '" style="width:25px;height:25px;float:left;margin-right:4px;">' + best + ' (' + generals[best].att + ' / ' + generals[best].def + ')</div>' : '')
	+	makeTownDash(this.data, function(list,i,units){if (units[i].page==='blacksmith' && units[i].use){list.push(i);}}, 'att', 'duel')
	+	makeTownDash(this.data, function(list,i,units){if (units[i].page==='magic' && units[i].use){list.push(i);}}, 'att', 'duel')
	+	'</div></div></div>';
	best = Generals.best('defend');
	right = '<div style="float:right;width:50%;"><div class="golem-panel"><h3 class="golem-panel-header" style="width:auto;">Invade - Defend</h3><div class="golem-panel-content" style="padding:8px;">'
	+	makeTownDash(generals, function(list,i){list.push(i);}, 'def', 'invade', 'Heroes')
	+	makeTownDash(this.data, function(list,i,units){if (units[i].page==='soldiers' && units[i].use){list.push(i);}}, 'def', 'invade', 'Soldiers')
	+	makeTownDash(this.data, function(list,i,units){if (units[i].use && units[i].type === 'Weapon'){list.push(i);}}, 'def', 'invade', 'Weapons')
	+	makeTownDash(this.data, function(list,i,units){if (units[i].page==='blacksmith' && units[i].use && units[i].type !== 'Weapon'){list.push(i);}}, 'def', 'invade', 'Equipment')
	+	makeTownDash(this.data, function(list,i,units){if (units[i].page==='magic' && units[i].use){list.push(i);}}, 'def', 'invade', 'Magic')
	+	'</div></div><div class="golem-panel"><h3 class="golem-panel-header" style="width:auto;">Duel - Defend</h3><div class="golem-panel-content" style="padding:8px;">'
	+	(best !== 'any' ? '<div style="height:25px;margin:1px;"><img src="' + imagepath + generals[best].img + '" style="width:25px;height:25px;float:left;margin-right:4px;">' + best + ' (' + generals[best].att + ' / ' + generals[best].def + ')</div>' : '')
	+	makeTownDash(this.data, function(list,i,units){if (units[i].page==='blacksmith' && units[i].use){list.push(i);}}, 'def', 'duel')
	+	makeTownDash(this.data, function(list,i,units){if (units[i].page==='magic' && units[i].use){list.push(i);}}, 'def', 'duel')
	+	'</div></div></div>';

	$('#golem-dashboard-Town').html(left+right);
};

Town.dup_map = {
	'Earth Shard': {
		'gift_earth_1.jpg':	'Earth Shard (1)',
		'gift_earth_2.jpg':	'Earth Shard (2)',
		'gift_earth_3.jpg':	'Earth Shard (3)',
		'gift_earth_4.jpg':	'Earth Shard (4)'
	},
	'Elven Crown': {
		'gift_aeris_complete.jpg':	'Elven Crown (Aeris)',
		'eq_sylvanus_crown.jpg':	'Elven Crown (Sylvanas)'
	},
	'Green Emerald Shard': {
		'mystery_armor_emerald_1.jpg': 'Green Emerald Shard (1)',
		'mystery_armor_emerald_2.jpg': 'Green Emerald Shard (2)'
	}
};
/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page, Queue, Resources,
	Battle, Generals, LevelUp, Player,
	APP, APPID, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, Divisor, length, unique, deleteElement, sum, findInArray, findInObject, objectIndex, sortObject, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
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
	makeTimer, Divisor, length, unique, deleteElement, sum, findInArray, findInObject, objectIndex, sortObject, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
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

FP.parse = function(change) {
	// No need to parse out Income potions as about to visit the Keep anyway...
	$('.oracleItemSmallBoxGeneral:contains("You have : ")').each(function(i,el){
		FP.set(['runtime','points'], $(el).text().regex(/You have : (\d+) points/i));
	});
	$('.title_action:contains("favor points")').each(function(i,el){
		FP.set(['runtime','points'], $(el).text().regex(/You have (\d+) favor points/i));
	});
	Dashboard.status(this, 'You have ' + this.runtime.points + ' favor points.');
	History.set('favor points',this.runtime.points);
	return false;
};

FP.update = function(event) {
	Dashboard.status(this, 'You have ' + this.runtime.points + ' favor points.');
	this.set(['option','_sleep'], Player.get(this.option.type,0) >= this.option.stat 
			|| Player.get('exp_needed', 0) < this.option.xp 
			|| (this.data[Player.get('level',0)] || 0) >= this.option.times 
			|| this.runtime.points < this.option.fps + 10 
			|| LevelUp.get('runtime.running'));
//	console.log(warn(), 'a '+(Player.get(this.option.type,0) >= this.option.stat));
//	console.log(warn(), 'b '+(Player.get('exp_needed', 0) < this.option.xp));
//	console.log(warn(), 'c '+((this.data[Player.get('level',0)] || 0) >= this.option.times));
//	console.log(warn(), 'd '+(this.runtime.points < this.option.fps + 10));
};

FP.work = function(state) {
	if (state && Generals.to(this.option.general) && Page.to('oracle_oracle')) {
		Page.click('#app46755028429_favorBuy_' + (this.option.type === 'energy' ? '5' : '6') + ' input[name="favor submit"]');
		this.set(['data', Player.get('level',0).toString()], (parseInt(this.data[Player.get('level',0).toString()] || 0, 10)) + 1); 
		console.log(warn(), 'Clicking on ' + this.option.type + ' refill ' + Player.get('level',0));
	}
	return QUEUE_CONTINUE;
};

/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page:true, Queue, Resources, Global,
	Battle, Generals, LevelUp, Player,
	APP, APPID, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, Divisor, length, unique, deleteElement, sum, findInArray, findInObject, objectIndex, sortObject, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
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
						console.log(log('Collecting Reward'));
						Page.click('input[src*="collect_reward_button2.jpg"]');
					}
				} else if (this.runtime.status === 'start') {
					if ($('input[src*="guild_enter_battle_button.gif"]').length) {
						console.log(log('Entering Battle'));
						Page.click('input[src*="guild_enter_battle_button.gif"]');
					}
					this.set(['data'], {}); // Forget old "lose" list
					//Add in attack button here.
				} else if (this.runtime.status === 'fight') {
					if ($('input[src*="guild_enter_battle_button.gif"]').length) {
						console.log(log('Entering Battle'));
						Page.click('input[src*="guild_enter_battle_button.gif"]');
					}
					var best = null, besttarget, besthealth, ignore = this.option.ignore && this.option.ignore.length ? this.option.ignore.split('|') : [];
					$('#app46755028429_enemy_guild_member_list_1 > div, #app46755028429_enemy_guild_member_list_2 > div, #app46755028429_enemy_guild_member_list_3 > div, #app46755028429_enemy_guild_member_list_4 > div').each(function(i,el){
					
						var test = false, cleric = false, i = ignore.length, $el = $(el), txt = $el.text().trim().replace(/\s+/g,' '), target = txt.regex(/^(.*) Level: (\d+) Class: ([^ ]+) Health: (\d+)\/(\d+) Status: ([^ ]+) \w+ Activity Points: (\d+)/i);
						// target = [0:name, 1:level, 2:class, 3:health, 4:maxhealth, 5:status, 6:activity]
						if (Guild.option.defeat && Guild.data && Guild.data[target[0]]) {
							return;
						}
						if (isNumber(Guild.option.limit) && target[1] > Player.get('level',0) + Guild.option.limit) {
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
						console.log(log('Attacking '+besttarget[0]+' with '+besttarget[3]+' health'));
						Page.click($('input[src*="monster_duel_button.gif"]', best));
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
	makeTimer, Divisor, length, unique, deleteElement, sum, findInArray, findInObject, objectIndex, sortObject, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
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
						console.log(log('Collecting Reward'));
						Page.click('input[src*="arena3_collectbutton.gif"]');//fix
					}
				} else if (this.runtime.status === 'start') {
					if ($('input[src*="guild_enter_battle_button.gif"]').length) {
						console.log(log('Entering Battle'));
						Page.click('input[src*="guild_enter_battle_button.gif"]');
					}
					this.set(['data'], {}); // Forget old "lose" list
				} else if (this.runtime.status === 'fight') {
					if ($('input[src*="guild_enter_battle_button.gif"]').length) {
						console.log(log('Entering Battle'));
						Page.click('input[src*="guild_enter_battle_button.gif"]');
					}
					var best = null, besttarget, besthealth, ignore = this.option.ignore && this.option.ignore.length ? this.option.ignore.split('|') : [];
					$('#app46755028429_enemy_guild_member_list_1 > div, #app46755028429_enemy_guild_member_list_2 > div, #app46755028429_enemy_guild_member_list_3 > div, #app46755028429_enemy_guild_member_list_4 > div').each(function(i,el){
					
						var test = false, cleric = false, i = ignore.length, $el = $(el), txt = $el.text().trim().replace(/\s+/g,' '), target = txt.regex(/^(.*) Level: (\d+) Class: ([^ ]+) Health: (\d+)\/(\d+) Status: ([^ ]+) \w+ Activity Points: (\d+)/i);
						// target = [0:name, 1:level, 2:class, 3:health, 4:maxhealth, 5:status, 6:activity]
						if (Festival.option.defeat && Festival.data && Festival.data[target[0]]) {
							return;
						}
						if (isNumber(Festival.option.limit) && target[1] > Player.get('level',0) + Festival.option.limit) {
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
						//console.log(log('cname ' + target[0] + ' cleric ' + cleric + ' test ' + test + ' bh ' + (best ? besttarget[3] : 'none') + ' candidate healt ' + target[3]));
						if ((target[3] && (!best || cleric)) || (target[3] >= 200 && (besttarget[3] < 200 || test))) {
							best = el;
							besttarget = target;
						}
					});
					if (best) {
						this.set(['runtime','last'], besttarget[0]);
						console.log(log('Attacking '+besttarget[0]+' with '+besttarget[3]+' health'));
						Page.click($('input[src*="monster_duel_button.gif"]', best));
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

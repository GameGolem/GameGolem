// ==UserScript==
// @name		Rycochet's Castle Age Golem
// @namespace	golem
// @description	Auto player for Castle Age on Facebook. If there's anything you'd like it to do, just ask...
// @license		GNU Lesser General Public License; http://www.gnu.org/licenses/lgpl.html
// @version		31.5.902
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
/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
// Global variables only
// Shouldn't touch
var isRelease = false;
var script_started = Date.now();
// Version of the script
var version = "31.5";
var revision = 902;
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
	$, Worker, Army, Config, Dashboard, History, Page, Queue, Resources,
	Battle, Generals, LevelUp, Player,
	GM_setValue, GM_getValue, APP, APPID, log, debug, userID, imagepath, browser, window,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH
	Workers, makeImage
*/
// Utility functions

// Functions to check type of variable - here for javascript optimisations and readability, makes a miniscule difference using them

var isArray = function(obj) {// Not an object
    return obj && typeof obj === 'object' && !(obj.propertyIsEnumerable('length')) && typeof obj.length === 'number';
};

var isObject = function(obj) {// Not an array
    return typeof obj !== 'undefined' && obj && typeof obj === 'object' && (!('length' in obj) || obj.propertyIsEnumerable('length'));
};

var isFunction = function(obj) {
	return typeof obj === 'function' && typeof obj.length !== 'undefined';
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

var isWorker = function(obj) {
	try {return Workers[obj.name] === obj;}catch(e){}// Big shortcut for being inside a try/catch block
	return false;
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
	var a = this.match(r), i;
	if (a) {
		!r.global && a.shift();
		for (i=0; i<a.length; i++) {
			if (a[i] && a[i].search(/^[-+]?[0-9]*\.?[0-9]*$/) >= 0) {
				a[i] = parseFloat(a[i].replace('+',''));
			}
		}
		if (a.length===1) {
			return a[0];
		}
	}
	return a;
};

String.prototype.numregex = function(r) {
	var a = this.match(r), i, parens = RegExp.lastParen.length;
	if (a) {
		!r.global && a.shift();
		for (i=0; i<a.length; i++) {
			if (a[i]) {
//				if (parens) {
					a[i].match(r);
					if (RegExp.$1) {
						a[i] = RegExp.$1;
					} else if (RegExp.$2) {
						a[i] = RegExp.$2;
					} else if (RegExp.$3) {
						a[i] = RegExp.$3;
					} else if (RegExp.$4) {
						a[i] = RegExp.$4;
					}
//				}
				a[i] = (isNumber(parseFloat(a[i])) ? parseFloat(a[i]) : a[i]);
			}
		}
		if (a.length===1) {
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
	return this.replace(/([\\\^\$*+[\]?{}.=!:(|)])/g, '\\$&');
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
    var n = isNumber(digits) ? this.toFixed(digits) : this.toString();
    var rx = /^(.*\s)?(\d+)(\d{3}\b)/;
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
	} else if (typeof obj === 'object') {
		var l = 0, i;
		for(i in obj) {
			l++;
		}
		return l;
	}
	return 0;
};

var empty = function(x) { // Tests whether an object is empty (also useable for other types)
	if (typeof x === 'undefined' || !x) {
		return true;
	} else if (typeof x === 'object') {
		for (var i in x) {
			if (x.hasOwnProperty(i)) {
				return false;
			}
		}
		return true;
	}
	return false;
}

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
		while (value in list) {
			list.splice(list.indexOf(value), 1);
		}
	}
};
			
var sum = function(a) { // Adds the values of all array entries together
	var i, t = 0;
	if (isArray(a)) {
		i = a.length;
		while(i--) {
			t += sum(a[i]);
		}
	} else if (isObject(a)) {
		for(i in a) {
			t += sum(a[i]);
		}
	} else if (isNumber(a)) {
		t = a;
	} else if (isString(a) && a.search(/^[-+]?[0-9]*\.?[0-9]*$/) >= 0) {
		t = parseFloat(a);
	}
	return t;
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
	if (typeof list === 'object') {
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
	if (typeof deep === 'undefined') {
		deep = false;
	}
	for (i in obj) {
		list.push(i);
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
		return (list[b][x] + (0.7 * list[b][x2])) - (list[a][x] + (0.7 * list[a][x2]));
	});
	for (i=0; i<units.length; i++) {
		own = typeof list[units[i]].own === 'number' ? list[units[i]].own : 1;
		if (user) {
			if (count) {
				Resources.set(['_'+units[i], user+'_'+x], count);
			} else {
				Resources.set(['_'+units[i], user+'_'+x]);
			}
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
	return d.format(typeof format !== 'undefined' && format ? format : 'l g:i a' );
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
			if ('length' in o && typeof o.length === 'number' && !o.propertyIsEnumerable('length')) {
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
			out = typeof o === 'undefined' ? 'undefined' : o === null ? 'null' : o.toString();
		}
		return out;
	})(obj, depth || 1), replacer, space);
};

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
	};
	this.filter('textarea').each(function(){
		$(this).css({'resize':'none','overflow-y':'hidden'}).unbind('.autoSize').bind('keyup.autoSize keydown.autoSize change.autoSize', autoSize);
		autoSize(this);
	});
	return this;
};

// Images - either on SVN, or via extension location

var getImage = function(name) {
	switch(browser) {
		case 'chrome':
			return chrome.extension.getURL('images/'+name+'.png');
		default:
			return 'http://game-golem.googlecode.com/svn/trunk/images/'+name+'.png';
	}
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
	this._taint = {}; // Has anything changed that might need saving?
	this._watching = {};
	this._reminders = {};
	this._disabled = false;
	this._flush_count = 0;
}

// Static Functions
Worker.find = function(name) {// Get worker object by Worker.name or Worker.id
	if (!name) {
		return null;
	}
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
Worker.stack = ['unknown'];// array of active workers, last at the start
Worker._triggers_ = [];// Used for this._trigger

// Private functions - only override if you know exactly what you're doing
Worker.prototype._flush = function(force) {
	this._push();
	this._save();
	if (!this.settings.keep) {
//		if (force || this._flush_count++ > 60) {
//			this._flush_count = 0;
			delete this.data;
//		}
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

Worker.prototype._get_ = function(data, path, def){ // data=Object, path=Array['data','etc','etc'], default
	if (!isUndefined(data)) {
		if (path.length) {
			return arguments.callee(data[path.shift()], path, def);
		}
		return data === null ? null : data.valueOf();
	}
	return def;
};

Worker.prototype._get = function(what, def) { // 'path.to.data'
	var x = isString(what) ? what.split('.') : (isArray(what) ? what : []);
	if (!x.length || !(x[0] in this._datatypes)) {
		x.unshift('data');
	}
	try {
		if (x[0] === 'data') {
			this._unflush();
		}
		return this._get_(this[x.shift()], x, def);
	} catch(e) {
		console.log(error(e.name + ' in ' + this.name + '.get('+x.join('.')+', '+(typeof def === 'undefined' ? 'undefined' : def)+'): ' + e.message));
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

Worker.prototype._load = function(type) {
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
//				console.log(log(), 'Notify ' + w[j].name + ', id = ' + i);
				w[j]._remind(0.05, id + i, {worker:this, type:'watch', id:i});
			}
		}
	}
}

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
		if (!type) {
			for (var i in this._datatypes) {
				if (this._datatypes.hasOwnProperty(i) && this._datatypes[i]) {
					arguments.callee.call(this,i);
				}
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
		console.log(error(e.name + ' in ' + this.name + '.save(' + type + '): ' + e.message));
		// exit so we don't try to save mangled data over good data
		return false;
	}
	if (this._taint[type] || (!this.settings.taint && getItem(n) !== v)) {
		this._push();
		this._taint[type] = false;
		this._update({worker:this, type:type, self:true});
		setItem(n, v);
		this._pop();
		return true;
	}
	return false;
};

Worker.prototype._set_ = function(data, path, value){ // data=Object, path=Array['data','etc','etc'], value, depth
	var depth = isNumber(arguments[3]) ? arguments[3] : 0, i = path[depth], l = (path.length - depth) > 1, t = typeof value;
	if (l && !isObject(data[i])) {
		data[i] = {};
	}
	if (l && !this._set_(data[i], path, value, depth+1) && empty(data[i])) {// Can clear out empty trees completely...
		delete data[i];
		return false;
	} else if (!l && ((t === 'string' && value.localeCompare(data[i]||'')) || (t !== 'string' && data[i] != value))) {
		this._notify(path.join('.'));// Notify the watchers...
		this._taint[path[0]] = true;
		this._remind(0, '_update', {type:path[0], self:true});
		if (t === 'undefined') {
			delete data[i];
			return false;
		}
		data[i] = value;
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
		console.log(error(e.name + ' in ' + this.name + '.set('+x.join('.')+', '+(typeof value === 'undefined' ? 'undefined' : value)+'): ' + e.message));
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
		this._load();
		for (i in this._datatypes) {// Delete non-existant datatypes
			if (this._datatypes[i] && !this[i]) {
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
			console.log(error(e.name + ' in ' + this.name + '.update({worker:' + newevent.worker.name + ', type:' + newevent.type + '}): ' + e.message));
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
//					console.log(log('Watch(' + worker.name + ', "' + path + '")'));
					worker._watching[path].push(this);
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
		if (typeof i === 'string' && i.regex(/[^0-9]/g)) {
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
	makeImage
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
	fixed:true,
	advanced:false,
	exploit:false
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
		Config.makePanel(Workers[i]);
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
				Config.updateOptions();
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
	$('input.golem_addselect').live('click', function(){
		var i, value, values = $('.golem_select', $(this).parent()).val().split(',');
		for (i=0; i<values.length; i++) {
			value = values[i].trim();
			if (value) {
				$('select.golem_multiple', $(this).parent()).append('<option>' + value + '</option>');
			}
		}
		Config.updateOptions();
	});
	$('input.golem_delselect').live('click', function(){
		$('select.golem_multiple option[selected=true]', $(this).parent()).each(function(i,el){$(el).remove();});
		Config.updateOptions();
	});
	$('#golem_config input,textarea,select').live('change', function(){
		Config.updateOptions();
	});
	$('.golem-panel-header input').click(function(event){
		event.stopPropagation(true);
	});
	this.checkRequire();
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
				left:Math.min($this.offset().left, $('#content').width() - $('#golem-menu').outerWidth(true))
			}).show();
		} else {// Need to stop it going up to the config panel, but still close the menu if needed
			Config.temp.menu = null;
			$('#golem-menu').hide();
		}
		event.stopPropagation();
		return false;
	});
	$('.golem-menu > div').live('click', function(event) {
		var i, $this = $(this.wrappedJSObject || this), key = $this.attr('name').regex(/^([^.]*)\.([^.]*)\.(.*)/);
//		console.log(key[0] + '.menu(' + key[1] + ', ' + key[2] + ')');
		var worker = Worker.find(key[0]);
		worker._unflush();
		worker.menu(Worker.find(key[1]), key[2]);
	});
	$(document).click(function(event){ // Any click hides it, relevant handling done above
		Config.temp.menu = null;
		$('.golem-icon-menu-active').removeClass('golem-icon-menu-active');
		$('#golem-menu').hide();
	});
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
					this.option.fixed ^= true;
					$('#golem_config_frame').toggleClass('golem-config-fixed');
					break;
				case 'advanced':
					this.option.advanced ^= true;
					$('.golem-advanced:not(".golem-require")').css('display', this.option.advanced ? '' : 'none');
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
		$('#golem_config').append('<div id="' + worker.id + '" class="golem-panel' + (worker.settings.unsortable?'':' golem-panel-sortable') + (findInArray(this.option.active, worker.id)?' golem-panel-show':'') + (worker.settings.advanced ? ' golem-advanced' : '') + '"' + ((worker.settings.advanced && !this.option.advanced) || (worker.settings.exploit && !this.option.exploit) ? ' style="display:none;"' : '') + ' name="' + worker.name + '"><h3 class="golem-panel-header' + (worker.get(['option', '_disabled'], false) ? ' red' : '') + '"><img class="golem-icon" src="' + getImage('blank') + '">' + worker.name + '<img class="golem-image golem-icon-menu" name="' + worker.name + '" src="' + getImage('menu') + '"><img class="golem-lock" src="' + getImage('lock') + '"></h3><div class="golem-panel-content" style="font-size:smaller;"></div></div>');
	} else {
		$('#'+worker.id+' > div').empty();
	}
	this.addOption(worker, args);
	this.checkRequire(worker.id);
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
			console.log(warn(), e.name + ' in Config.makeOptions(' + worker.name + '.display()): ' + e.message);
		}
	} else {
		console.log(warn(), Worker.stack[0]+' is trying to add an unknown type of option');
	}
	return $([]);
};

Config.makeOption = function(worker, args) {
	var i, o, step, $option, txt = [], list = [];
	o = $.extend(true, {}, {
		before: '',
		after: '',
		suffix: '',
		className: '',
		between: 'to',
		size: 7,
		min: 0,
		max: 100
	}, args);
	o.real_id = o.id ? ' id="' + this.makeID(worker, o.id) + '"' : '';
	o.value = worker.get('option.'+o.id, null);
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
				list.push('<option value="'+o.value[i]+'">'+o.value[i]+'</option>');
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
	if (o.require) {
		if (typeof o.require === 'string') {
			i = o.require;
			o.require = {};
			o.require[i] = true;
		}
		for (i in o.require) { // Make sure all paths are absolute, "worker.option.key" (option/runtime/data) and all values are in an array
			if (typeof o.require[i] !== 'object') {
				o.require[i] = [o.require[i]];
			}
			if (i.search(/\.(data|option|runtime)\./) === -1) {
				o.require[worker.name + '.option.' + i] = o.require[i];
				delete o.require[i];
			} else if (i.search(/(data|option|runtime)\./) === 0) {
				o.require[worker.name + '.' + i] = o.require[i];
				delete o.require[i];
			}
		}
		$option.addClass('golem-require').attr('require', JSON.stringify(o.require));
	}
	if (o.group) {
		$option.append(this.makeOptions(worker,o.group));
	} else {
		$option.append('<br>');
	}
	if (o.advanced) {
		$option.addClass('golem-advanced');
	}
	if (o.help) {
		$option.attr('title', o.help);
	}
	if (o.advanced || o.exploit) {
		$option.css('background','#ffeeee');
	}
	if (o.advanced && !this.option.advanced) {
		$option.css('display','none');
	}
	if (o.exploit && !this.option.exploit) {
		$option.css('display','none');
	}
	if (o.exploit) {
		$option.css('border','1px solid red');
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

Config.updateOptions = function() {
//	console.log(warn(), 'Options changed');
	// Get order of panels first
	Queue.option.queue = this.getOrder();
	// Now save the contents of all elements with the right id style
	$('#golem_config :input:not(:button)').each(function(i,el){
		if ($(el).attr('id')) {
			var val, tmp = $(el).attr('id').slice(PREFIX.length).regex(/([^_]*)_(.*)/i);
			if (!tmp) {
				return;
			}
			if ($(el).attr('type') === 'checkbox') {
				val = $(el).attr('checked');
			} else if ($(el).attr('multiple')) {
				val = [];
				$('option', el).each(function(i,el){ val.push($(el).text()); });
			} else {
				val = $(el).attr('value') || ($(el).val() || null);
				if (val && val.search(/[^-0-9.]/) === -1) {
					val = parseFloat(val);
				}
			}
			try {
				Worker.find(tmp[0]).set('option.'+tmp[1], val);
			} catch(e) {
				console.log(warn(), e.name + ' in Config.updateOptions(): ' + $(el).attr('id') + '(' + JSON.stringify(tmp) + ') = ' + e.message);
			}
		}
	});
	this.checkRequire();
};

Config.setOptions = function(worker) {
//	if (worker === Queue) {
		//Queue.option.queue = this.getOrder();
//	}
	var i, $el;
	for (i in worker.option) {
		$el = $('#'+this.makeID(worker, i));
		if ($el.length === 1) {
//			try {
				if ($el.attr('type') === 'checkbox') {
					$el.attr('checked', worker.option[i]);
				} else if ($el.attr('multiple')) {
					$el.empty();
					(worker.option[i] || []).forEach(function(val){$el.append('<option>'+val+'</option>')});
				} else if ($el.attr('value')) {
					$el.attr('value', worker.option[i]);
				} else {
					$el.val(worker.option[i]);
				}
//			} catch(e) {}
		}
	}
	this.checkRequire();
};

Config.checkRequire = function(selector) {
//	console.log(log(), 'checkRequire($("'+(typeof id === 'string' ? '#'+id+' ' : '')+'.golem-require"))');
	if (isWorker(selector)) {
		selector = '#'+selector.id+' .golem-require';
	} else if (typeof selector !== 'undefined' && $(selector).length) {
		selector = $('.golem-require', selector);
	} else {
		selector = '.golem-require';
	}
	$(selector).each(function(a,el){
		var i, j, worker, path, value, show = true, or, require = JSON.parse($(el).attr('require'));
		if ($(el).hasClass('golem-advanced')) {
			show = Config.option.advanced;
		}
		for (i in require) {
			path = i.split('.');
			worker = Worker.find(path.shift());
			if (!isWorker(worker)) {
				show = false;// Worker doesn't exist - assume it's not a typo, so always hide us...
				break;
			}
			value = worker.get(path,false);
//			{key:[true,true,true], key:[[false,false,false],true,true]} - false is AND, true are OR
			or = [];
			for (j=0; j<require[i].length; j++) {
				if (isArray(require[i][j])) {
					if (findInArray(require[i][j], value)) {
						show = false;
						break;
					}
				} else {
					or.push(require[i][j]);
				}
			}
			if (!show || (or.length && !findInArray(or, value))) {
				show = false;
				break;
			}
		}
		if (show) {
			$(el).show();
		} else {
			$(el).hide();
		}
	});
	for (var i in Workers) {
		Workers[i]._save('option');
	}
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

Dashboard.settings = {
//	keep:true
};

Dashboard.defaults = {
	castle_age:{
		pages:'*'
	}
};

Dashboard.option = {
	display:'block',
	active:null
};

Dashboard.init = function() {
	var i, id, tabs = [], divs = [], active = this.option.active;
	for (i in Workers) {
		if (Workers[i].dashboard) {
			id = 'golem-dashboard-'+i;
			if (!active) {
				this.option.active = active = id;
			}
			if (Workers[i] === this) { // Dashboard always comes first with the * tab
				tabs.unshift('<h3 name="'+id+'" class="golem-tab-header' + (active===id ? ' golem-tab-header-active' : '') + '">&nbsp;*&nbsp;</h3>');
			} else {
				tabs.push('<h3 name="'+id+'" class="golem-tab-header' + (active===id ? ' golem-tab-header-active' : '') + '">' + (Workers[i] === this ? '&nbsp;*&nbsp;' : i) + '</h3>');
			}
			divs.push('<div id="'+id+'"'+(active===id ? '' : ' style="display:none;"')+'></div>');
			this._watch(Workers[i], 'data');
		}
	}
	$('<div id="golem-dashboard" style="top:' + $('#app'+APPID+'_main_bn').offset().top+'px;display:' + this.option.display+';">' + tabs.join('') + '<img id="golem_dashboard_expand" style="float:right;" src="'+getImage('expand')+'"><div>' + divs.join('') + '</div></div>').prependTo('.UIStandardFrame_Content');
	$('.golem-tab-header').click(function(){
		if ($(this).hasClass('golem-tab-header-active')) {
			return;
		}
		if (Dashboard.option.active) {
			$('h3[name="'+Dashboard.option.active+'"]').removeClass('golem-tab-header-active');
			$('#'+Dashboard.option.active).hide();
		}
		Dashboard.option.active = $(this).attr('name');
		$(this).addClass('golem-tab-header-active');
		Dashboard.update({worker:Worker.find(Dashboard.option.active.substr(16)),type:'watch'});
		$('#'+Dashboard.option.active).show();
		Dashboard._save('option');
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
		var worker = Worker.find(Dashboard.option.active.substr(16));
		worker._unflush();
		worker.dashboard($(this).prevAll().length, $(this).attr('name')==='sort');
	});
	$('#golem_buttons').append('<img class="golem-button' + (Dashboard.option.display==='block'?'-active':'') + '" id="golem_icon_dashboard" src="' + getImage('dashboard') + '">');
	$('#golem_icon_dashboard').click(function(){
		$(this).toggleClass('golem-button golem-button-active');
		Dashboard.option.display = Dashboard.option.display==='block' ? 'none' : 'block';
		if (Dashboard.option.display === 'block' && !$('#'+Dashboard.option.active).children().length) {
			Worker.find(Dashboard.option.active.substr(16)).dashboard();
		}
		$('#golem-dashboard').toggle('drop');
		Dashboard._save('option');
	});
	Dashboard.update({worker:Worker.find(Dashboard.option.active.substr(16)),type:'watch'});// Make sure we update the active page at init
	this._revive(1);// update() once every second to update any timers
};

Dashboard.parse = function(change) {
	$('#golem-dashboard').css('top', $('#app'+APPID+'_main_bn').offset().top+'px');
};

Dashboard.update = function(event) {
	if (event.self && event.type === 'reminder') {
		$('.golem-timer').each(function(i,el){
			var time = $(el).text().parseTimer();
			if (time && time > 0) {
				$(el).text(makeTimer(time - 1));
			} else {
				$(el).removeClass('golem-timer').text('now?');
			}
		});
		$('.golem-time').each(function(i,el){
			var time = parseInt($(el).attr('name'), 10) - Date.now();
			if (time && time > 0) {
				$(el).text(makeTimer(time / 1000));
			} else {
				$(el).removeClass('golem-time').text('now?');
			}
		});
	}
	if (event.type !== 'watch') { // we only care about updating the dashboard when something we're *watching* changes (including ourselves)
		return;
	}
	if (this.option.active === 'golem-dashboard-'+event.worker.name && this.option.display === 'block') {
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
	this.set(['data', worker.name], value);
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
	Battle, Generals, LevelUp, Player,
	APP, APPID, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, Divisor, length, unique, deleteElement, sum, findInArray, findInObject, objectIndex, sortObject, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
	makeImage
*/
/********** Worker.Debug **********
* Profiling information
*/
var Debug = new Worker('Debug');
Debug.data = Debug.runtime = null;

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
	worker:'All'
};

Debug.runtime = {
	sort:2,
	rev:false
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
			},{
				label:'<b>NOTE:</b> You must reload Golem to show/hide the dashboard panel.'
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
						var t = Date.now(), r, w = (arguments.callee._worker || (this ? this.name : null)), l = [];
						Debug.stack.unshift([0, w || '', arguments]);
						if (!Debug.option._disabled) {
							if (w) {
								l = [w+'.'+arguments.callee._name, w];
							}
							if (!arguments.callee._worker) {
								l[l.length] = '_worker.'+arguments.callee._name;
							}
						}
						try {
							r = arguments.callee._orig.apply(this, arguments);
						} catch(e) {
							console.log(error(e.name + ': ' + e.message));
						}
						if (!Debug.option._disabled) {
							t = Date.now() - t;
							if (Debug.stack.length > 1) {
								Debug.stack[1][0] += t;
							}
							for (i=0; i<l.length; i++) {
								w = Debug.temp[l[i]] = Debug.temp[l[i]] || [0,0,0];
								w[0]++;
								w[1] += t - Debug.stack[0][0];
								w[2] += t;
							}
						}
						Debug.stack.shift();
						return r;
					}
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
		return '[' + (new Date()).toLocaleTimeString() + ']' + (txt ? ' ' + txt : '');
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
};

Debug.update = function(event) {
	if (event.type === 'option' || event.type === 'init') {
		if (this.option.timer) {
			this._revive(this.option.timer, 'timer', function(){Debug._notify('data');})
		} else {
			this._forget('timer');
		}
		this._notify('data');// Any changes to options should force a dashboard update
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
		th(output, o, 'style="text-align:left;"');
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

Global.settings = {
	system:true,
	unsortable:true,
	no_disable:true
};

// Use _watch() to find our own options
Global.option = {};

// Use .push() to add our own panel groups
Global.display = [];
/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Dashboard, History:true, Page, Queue, Resources, Land,
	Battle, Generals, LevelUp, Player,
	APP, APPID, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, Divisor, length, unique, deleteElement, sum, findInArray, findInObject, objectIndex, sortObject, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
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
History.option = null;
History.settings = {
	system:true
};

History.dashboard = function() {
	var list = [];
	list.push('<table cellspacing="0" cellpadding="0" class="golem-graph"><thead><tr><th></th><th colspan="73"><span style="float:left;">&lArr; Older</span>72 Hour History<span style="float:right;">Newer &rArr;</span><th></th></th></tr></thead><tbody>');
	list.push(this.makeGraph(['land', 'income'], 'Income', true, {'Average Income':this.get('land.mean') + this.get('income.mean')}));
	list.push(this.makeGraph('bank', 'Bank', true, Land.runtime.best ? {'Next Land':Land.runtime.cost} : null)); // <-- probably not the best way to do this, but is there a function to get options like there is for data?
	list.push(this.makeGraph('exp', 'Experience', false, {'Next Level':Player.get('maxexp')}));
	list.push(this.makeGraph('exp.change', 'Exp Gain', false, {'Average':this.get('exp.average.change'), 'Standard Deviation':this.get('exp.stddev.change'), 'Ignore entries above':(this.get('exp.mean.change') + (2 * this.get('exp.stddev.change')))} )); // , 'Harmonic Average':this.get('exp.harmonic.change') ,'Median Average':this.get('exp.median.change') ,'Mean Average':this.get('exp.mean.change')
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
	var hour = Math.floor(Date.now() / 3600000), x = typeof what === 'string' ? what.split('.') : (typeof what === 'object' ? what : []);
	if (x.length && (typeof x[0] === 'number' || !x[0].regex(/[^0-9]/gi))) {
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
	var hour = Math.floor(Date.now() / 3600000), x = typeof what === 'string' ? what.split('.') : (typeof what === 'object' ? what : []);
	if (x.length && (typeof x[0] === 'number' || !x[0].regex(/[^0-9]/gi))) {
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
	var i, j, value, last = null, list = [], data = this.data, x = typeof what === 'string' ? what.split('.') : (typeof what === 'object' ? what : []), hour = Math.floor(Date.now() / 3600000), exact = false, past = 168, change = false;
	if (x.length && (typeof x[0] === 'number' || !x[0].regex(/[^0-9]/gi))) {
		hour = x.shift();
	}
	if (x.length && (typeof x[x.length-1] === 'number' || !x[x.length-1].regex(/[^0-9]/gi))) {
		past = Math.range(1, parseInt(x.pop(), 10), 168);
	}
	if (!x.length) {
		return data;
	}
	for (i in data) {
		if (typeof data[i][x[0]] === 'number') {
			exact = true;
			break;
		}
	}
	if (x.length === 1) { // only the current value
		if (exact) {
			return data[hour][x[0]];
		}
		for (j in data[hour]) {
			if (j.indexOf(x[0] + '+') === 0 && typeof data[hour][j] === 'number') {
				value = (value || 0) + data[hour][j];
			}
		}
		return value;
	}
	if (x.length === 2 && x[1] === 'change') {
		if (data[hour] && data[hour-1]) {
			i = this.get([hour, x[0]]);
			j = this.get([hour - 1, x[0]]);
			if (typeof i === 'number' && typeof j === 'number') {
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
				if (typeof data[i][x[0]] === 'number') {
					value = data[i][x[0]];
				}
			} else {
				for (j in data[i]) {
					if (j.indexOf(x[0] + '+') === 0 && typeof data[i][j] === 'number') {
						value = (value || 0) + data[i][j];
					}
				}
			}
			if (change) {
				if (value !== null && last !== null) {
					list.push(value - last);
					if (isNaN(list[list.length - 1])) {
						console.log(warn(), 'NaN: '+value+' - '+last);
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

History.makeGraph = function(type, title, iscash, goal) {
	var i, j, count, min = Number.POSITIVE_INFINITY, max = Number.NEGATIVE_INFINITY, max_s, min_s, goal_s = [], list = [], bars = [], output = [], value = {}, goalbars = '', divide = 1, suffix = '', hour = Math.floor(Date.now() / 3600000), numbers;
	if (typeof goal === 'number') {
		goal = [goal];
	} else if (typeof goal !== 'array' && typeof goal !== 'object') {
		goal = null;
	}
	if (goal && length(goal)) {
		for (i in goal) {
			min = Math.min(min, goal[i]);
			max = Math.max(max, goal[i]);
		}
	}
	if (typeof type === 'string') {
		type = [type];
	}
	for (i=hour-72; i<=hour; i++) {
		value[i] = [0];
		if (this.data[i]) {
			for (j in type) {
				value[i][j] = this.get(i + '.' + type[j]);
			}
			if (sum(value[i])) {min = Math.min(min, sum(value[i]));}
			max = Math.max(max, sum(value[i]));
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
	max_s = (iscash ? '$' : '') + (max / divide).addCommas() + suffix;
	min = Math.floor(min / divide) * divide;
	min_s = (iscash ? '$' : '') + (min / divide).addCommas() + suffix;
	if (goal && length(goal)) {
		for (i in goal) {
			bars.push('<div style="bottom:' + Math.max(Math.floor((goal[i] - min) / (max - min) * 100), 0) + 'px;"></div>');
			goal_s.push('<div' + (typeof i !== 'number' ? ' title="'+i+'"' : '') + ' style="bottom:' + Math.range(2, Math.ceil((goal[i] - min) / (max - min) * 100)-2, 92) + 'px;">' + (iscash ? '$' : '') + (goal[i] / divide).addCommas(1) + suffix + '</div>');
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
				numbers.push((value[i][j] ? (iscash ? '$' : '') + value[i][j].addCommas() : ''));
			}
		}
		output.push('<div class="bars">' + bars.reverse().join('') + '</div>' + goalbars);
		numbers.reverse();
		title = title + (numbers.length ? ', ' : '') + numbers.join(' + ') + (numbers.length > 1 ? ' = ' + (iscash ? '$' : '') + sum(value[i]).addCommas() : '');
		td(list, output.join(''), 'title="' + title + '"');
	}
	th(list, goal_s.join(''));
	return '<tr>' + list.join('') + '</tr>';
};

/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*Main
	$, Worker, Army, Main:true, History, Page:true, Queue, Resources,
	Battle, Generals, LevelUp, Player,
	APP, APPID, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, Divisor, length, unique, deleteElement, sum, findInArray, findInObject, objectIndex, sortObject, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
	makeImage
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
	if (event.id !== 'startup') {
		return;
	}
	if (typeof $ === 'undefined') {
		var head = document.getElementsByTagName('head')[0] || document.documentElement, a = document.createElement('script'), b = document.createElement('script');
		a.type = b.type = 'text/javascript';
		a.src = 'http://ajax.googleapis.com/ajax/libs/jquery/1.4.4/jquery.min.js';
		b.src = 'http://ajax.googleapis.com/ajax/libs/jqueryui/1.8.6/jquery-ui.min.js';
		head.appendChild(a);
		head.appendChild(b);
		console.log(log(), 'Loading jQuery & jQueryUI');
		(function() {
//				console.log(log(), '...loading...');
			if (typeof window.jQuery === 'undefined') {
				window.setTimeout(arguments.callee, 1000);
			} else {
				console.log('jQuery Loaded...');
				Main._remind(0.1, 'startup');
			}
		})();
		return;
	}
	var i;
	if (!APP) {
		if (!length(this._apps_)) {
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
		userID = $('script').text().regex(/user:([0-9]+),/i);
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
	switch(browser) {
		case 'chrome':	break;// Handled by extension code
		case 'greasemonkey':
			GM_addStyle(GM_getResourceText('stylesheet'));
			break;
		default:
			$('head').append('<style type="text/css">@import url("http://game-golem.googlecode.com/svn/trunk/golem.css");</style>');
			break;
	}
//	do_css();
	var i;
	for (i in Workers) {
		Workers[i]._setup();
	}
	for (i in Workers) {
		Workers[i]._init();
	}
	for (i in Workers) {
		Workers[i]._update({type:'init', self:true});
	}
};

Main._loaded = true;// Otherwise .update() will never fire - no init needed for us as we're the one that calls it
Main._remind(0, 'startup');
/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page:true, Queue, Resources,
	Battle, Generals, LevelUp, Player,
	APP, APPID, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, Divisor, length, unique, deleteElement, sum, findInArray, findInObject, objectIndex, sortObject, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
	makeImage
*/
/********** Worker.Page() **********
* All navigation including reloading
*/
var Page = new Worker('Page');

Page.settings = {
	system:true,
	keep:true
};

Global.option.page = {
	timeout:15,
	reload:5,
	nochat:false
};

Page.temp = {
	loading:false,
	last:'', // Last url we tried to load
	when:null,
	lastclick:null,
	retry:0 // Number of times we tried before hitting option.reload
};

Page.runtime = {
	delay:0 // Delay used for bad page load - reset in Page.clear(), otherwise double to a max of 5 minutes
};

Page.page = '';

Page.pageNames = {}; //id:{url:'...', image:'filename.jpg', selector:'jquery selector'}

Global.display.push({
	title:'Page Loading',
	group:[
		{
			id:'page.timeout',
			label:'Retry after',
			select:[10, 15, 30, 60],
			after:'seconds'
		},{
			id:'page.reload',
			label:'Reload after',
			select:[3, 5, 7, 9, 11, 13, 15],
			after:'tries'
		},{
			id:'page.nochat',
			label:'Remove Facebook Chat',
			checkbox:true,
			help:'This does not log you out of chat, only hides it from display and attempts to stop it loading - you can still be online in other facebook windows'
		}
	]
});

// We want this to run on the Global context
Global._overload(null, 'work', function(state) {
	var i, l, list, found = null;
	for (i in Workers) {
		if (isString(Workers[i].pages)) {
			list = Workers[i].pages.split(' ');
			for (l=0; l<list.length; l++) {
				if (list[l] !== '*' && list[l] !== 'facebook' && Page.pageNames[list[l]] && !Page.data[list[l]] && list[l].indexOf('_active') === -1) {
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
	arguments.callee = new Function();// Only check when first loading, once we're running we never work() again :-P
	return this._parent();
});

Page.removeFacebookChat = function() {
	$('script').each(function(i,el){
		$(el).text($(el).text()
		.replace(/\nonloadRegister.function \(\).*new ChatNotifications.*/g, '')
		.replace(/\n<script>big_pipe.onPageletArrive.{2}"id":"pagelet_chat_home".*/g, '')
		.replace(/\n<script>big_pipe.onPageletArrive.{2}"id":"pagelet_presence".*/g, '')
		.replace(/|chat\\\//,''));
	});
	var b = document.getElementsByTagName('body')[0] || document.documentElement, a = document.createElement('script');
	a.type = 'text/javascript';
	a.appendChild(document.createTextNode('window.setTimeout(function(){delete window.presenceNotifications;},1000);'));
	b.appendChild(a);
	$('#pagelet_presence').remove();
	$('#pagelet_chat_home').remove();
};

Page.init = function() {
	this._trigger('#app'+APPID+'_app_body_container, #app'+APPID+'_globalContainer', 'page_change');
	this._trigger('.generic_dialog_popup', 'facebook');
	if (Global.option.page.nochat) {
		this.removeFacebookChat();
	}
	$('.golem-link').live('click', function(event){
		if (!Page.to($(this).attr('href'), false)) {
			return false;
		}
	});
};

Page.update = function(event) {
	// Can use init as no system workers (which can come before us) care what page we are on
	if (event.type === 'init' || event.type === 'trigger') {
		var i, list;
		if (event.type === 'init' || event.id === 'page_change') {
			list = ['#app_content_'+APPID, '#app'+APPID+'_globalContainer', '#app'+APPID+'_globalcss', '#app'+APPID+'_main_bntp', '#app'+APPID+'_main_sts_container', '#app'+APPID+'_app_body_container', '#app'+APPID+'_nvbar', '#app'+APPID+'_current_pg_url', '#app'+APPID+'_current_pg_info'];
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
			$('img', $('#app'+APPID+'_app_body')).each(function(i,el){
				var i, filename = $(el).attr('src').filepart();
				for (i in Page.pageNames) {
					if (Page.pageNames[i].image && filename === Page.pageNames[i].image) {
						Page.page = i;
						return;
					}
				}
			});
			if (this.page === '') {
				for (i in Page.pageNames) {
					if (Page.pageNames[i].selector && $(Page.pageNames[i].selector).length) {
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
	this._remind(Global.option.page.timeout, 'retry');
	return false;
};

Page.retry = function() {
	if (this.temp.reload || ++this.temp.retry >= Global.option.page.reload) {
		this.reload();
	} else if (this.temp.last) {
		console.log(log('Page load timeout, retry '+this.temp.retry+'...'));
		this.to(this.temp.last, null, true);// Force
	} else if (this.temp.lastclick) {
		console.log(log('Page click timeout, retry '+this.temp.retry+'...'));
		this.click(this.temp.lastclick);
	} else {
		// Probably a bad initial page load...
		// Reload the page - but use an incrimental delay - every time we double it to a maximum of 5 minutes
		this._load('runtime');// Just in case we've got multiple copies
		this.runtime.delay = this.runtime.delay ? Math.max(this.runtime.delay * 2, 300) : Global.option.page.timeout;
		this._save('runtime');// Make sure it's saved for our next try
		this.temp.reload = true;
		$('body').append('<div style="position:absolute;top:100;left:0;width:100%;"><div style="margin:auto;font-size:36px;color:red;">ERROR: Reloading in <span class="golem-time" name="' + (Date.now() + (this.runtime.delay * 1000)) + '">' + makeTimer(this.runtime.delay) + '</span></div></div>');
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
	var output = [];
	for (var i=0; i<obj.length; i++) {
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
	this.clear();
	this.temp.lastclick = el;
	this.temp.when = Date.now();
	this.set(['temp', 'loading'], true);
	e = document.createEvent("MouseEvents");
	e.initEvent("click", true, true);
	(element.wrappedJSObject ? element.wrappedJSObject : element).dispatchEvent(e);
	this._remind(Global.option.page.timeout, 'retry');
	return true;
};

Page.clear = function() {
	this.temp.last = this.temp.lastclick = this.temp.when = null;
	this.temp.retry = 0;
	this.temp.reload = false;
	this.set(['temp', 'loading'], false);
	this.set(['runtime', 'delay'], 0);
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
var Queue = new Worker('Queue', '*');
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
	queue: ['Global', 'Debug', 'Queue', 'Resources', 'Settings', 'Title', 'Income', 'LevelUp', 'Elite', 'Quest', 'Monster', 'Battle', 'Arena', 'Heal', 'Land', 'Town', 'Bank', 'Alchemy', 'Blessing', 'Gift', 'Upgrade', 'Potions', 'Army', 'Idle'],//Must match worker names exactly - even by case
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
		var pause = Queue.set('option.pause', !Queue.option.pause);
		console.log(warn('State: ' + (pause ? "paused" : "running")));
		$(this).toggleClass('red green').attr('src', getImage(pause ? 'play' : 'pause'));
		if (!pause) {
			$('#golem_step').hide();
		} else if (Config.get('option.advanced', false)) {
			$('#golem_step').show();
		}
		Queue.clearCurrent();
		Config.updateOptions();
	});
	$('#golem_step').click(function() {
		$(this).toggleClass('red green');
		Queue._update({type:'reminder'}); // A single shot
		$(this).toggleClass('red green');
	});
	// Running the queue every second, options within it give more delay
	this._watch(Page, 'temp.loading');
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
		if (this.option.pause || Page.temp.loading) {
			this._forget('run');
			this.temp.delay = -1;
		} else if (this.option.delay !== this.temp.delay) {
			this._revive(this.option.delay, 'run');
			this.temp.delay = this.option.delay;
		}
	} else if (event.type === 'reminder') { // This is where we call worker.work() for everyone
		if ((isWorker(Window) && !Window.temp.active) // Disabled tabs don't get to do anything!!!
		|| now - this.lastclick < this.option.clickdelay * 1000) { // Want to make sure we delay after a click
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
	var type, group, worker, require, display = [];
	if (!length(this.runtime.types)) {
		return 'No Resources to be Used...';
	}
	display.push({label:'Not doing anything yet...'});
	for (type in this.option.types) {
		group = [];
		require = {};
		require['types.'+type] = 2;
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
				label:'Resources Use',
				select:{0:'None',1:'Shared',2:'Exclusive'}
			},{
				group:group,
				require:require
			});
		}
	}
	return display;
};

Resources.init = function() {
//	Config.addOption({label:'test',checkbox:true});
};

Resources.update = function(event) {
//	if (event.type === 'init' && event.self) {
//		Config.makePanel(this, this.display2);
//	}
	var worker, type, total = 0;
//	console.log(warn(), 'Resources.update()');
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
//	console.log(warn(), this.runtime.buckets.toSource());
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
//	console.log(warn(), 'Resources.add('+type+', '+amount+', '+(absolute ? true : false)+')');
	this._push();
	var i, total = 0, worker, old_amount = this.get(['runtime','types',type], 0);
	if (isUndefined(amount)) {// Setting up that we use this type
		this.set(['runtime','types',type], old_amount);
		this.set(['option','types',type], this.get(['option','types',type], 1));
		this.set(['option','reserve',type], this.get(['option','reserve',type], 0));
	} else {// Telling of any changes to the amount
		if (absolute) {
			amount -= old_amount;
		}
		// Store the new value
		this.set(['runtime','types',type], old_amount + amount);
		// Now fill any pots...
		amount -= Math.max(0, old_amount - parseInt(this.option.reserve[type]));
		if (amount > 0 && this.option.types[type] === 2) {
			for (worker in this.option.buckets) {
				if (type in this.option.buckets[worker]) {
					total += this.option.buckets[worker][type]
				}
			}
			amount /= total;
			for (worker in this.option.buckets) {
				if (type in this.option.buckets[worker]) {
					this.runtime.buckets[worker][type] += amount * this.option.buckets[worker][type];
				}
			}
		}		
	}
	this._pop();
};

/***** Resources.use() *****
Register to use a type of Resources that can be spent
Actually use a type of Resources (must register with no amount first)
type = name of Resources
amount = amount to use
use = are we using it, or just checking if we can?
*/
Resources.use = function(type, amount, use) {
	if (Worker.stack.length <= 1) {
		var worker = Worker.stack[0];
		if (isUndefined(amount)) {
			this.set(['runtime','buckets',worker,type], this.get(['runtime','buckets',worker,type], 0));
			this.set(['option','buckets',worker,type], this.get(['option','buckets',worker,type], 5));
		} else if (this.option.types[type] === 1 && this.runtime.types[type] >= amount) {// Shared
			if (use) {
				this.runtime.types[type] -= amount;
			}
			return true;
		} else if (this.option.types[type] === 2 && this.runtime.buckets[worker][type] >= amount) {// Exlusive
			if (use) {
				this.runtime.buckets[worker][type] -= amount;
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
	return isUndefined(amount) ? this.get(['runtime','types',type], 0) : this.get(['runtime','types',type], 0) >= amount;
};

Resources.get = function(what,def) {
//	console.log(log(), 'Resources.get('+what+', '+(def?def:'null')+')');
	return this._get(what,def);
};

Resources.set = function(what,value) {
//	console.log(log(), 'Resources.set('+what+', '+(value?value:'null')+')');
	return this._set(what,value);
};

/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page, Queue, Resources, Settings:true,
	Battle, Generals, LevelUp, Player,
	APP, APPID, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, Divisor, length, unique, deleteElement, sum, findInArray, findInObject, objectIndex, sortObject, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
	makeImage
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
			for (i in worker._datatypes) {
				keys.push(i+':' + (worker.name === this.temp.worker && i === this.temp.edit ? '=' : '') + 'Edit&nbsp;"' + worker.name + '.' + i + '"');
			}
			keys.push('---');
			keys.push('backup:Backup&nbsp;Options');
			keys.push('restore:Restore&nbsp;Options');
			return keys;
		} else if (key) {
			if (key === 'backup') {
				this.set(['data', worker.name], $.extend(true, {}, worker.option));
			} else if (key === 'restore') {
				if (confirm("WARNING!!!\n\nAbout to restore '+worker.name+' options.\n\Are you sure?")) {
					this.replace(worker, 'option', $.extend(true, {}, this.data[worker.name]));
				}
			} else if (this.temp.worker === worker.name && this.temp.edit === key) {
				this.temp.worker = this.temp.edit = null;
				this._notify('data');// Force dashboard update
			} else {
				this.temp.worker = worker.name;
				this.temp.edit = key;
				this._notify('data');// Force dashboard update
			}
		}
	} else {
		if (!key) {
			keys.push('backup:Backup&nbsp;Options');
			keys.push('restore:Restore&nbsp;Options');
			return keys;
		} else {
			if (key === 'backup') {
				for (i in Workers) {
					this.set(['data',i], Workers[i].option);
				}
			} else if (key === 'restore') {
				if (confirm("WARNING!!!\n\nAbout to restore options for all workers.\n\Are you sure?")) {
					for (i in Workers) {
						if (i in this.data) {
							this.replace(Workers[i], 'option', $.extend(true, {}, this.data[i]));
						}
					}
				}
			}
		}
	}
};

Settings.replace = function(worker, type, data) {
	if (type === 'data') {
		worker._unflush();
	}
	var i, val, old = worker[type], rx = new RegExp('^'+type+'\.');
	for (i in worker._watching) {
		if (rx.test(i)) {
			worker[type] = old;
			val = worker._get(i, null);
			worker[type] = data;
			if (val !== worker._get(i, null)) {
				worker._notify(i);
			}
		}
	}
	worker[type] = data;
	if (type === 'option') {
		Config.setOptions(worker);
	}
	worker._taint[type] = true;
};

Settings.dashboard = function() {
	var i, path = this.temp.worker+'.'+this.temp.edit, html = '';
	html = '<select id="golem_settings_path">';
	for (i=0; i<this.temp.paths.length; i++) {
		html += '<option value="' + this.temp.paths[i] + '"' + (this.temp.paths[i] === path ? ' selected' : '') + '>' + this.temp.paths[i] + '</option>';
	}
	html += '</select>';
//	html += '<input type="text" value="'+this.temp.worker+'.'+this.temp.edit+'" disabled>';
	html += '<input id="golem_settings_refresh" type="button" value="Refresh">';
	if (Config.option.advanced) {
		html += '<input style="float:right;" id="golem_settings_save" type="button" value="Save">';
	}
	html += '<br>';
	if (this.temp.worker && this.temp.edit) {
		if (this.temp.edit === 'data') {
			Workers[this.temp.worker]._unflush();
		}
		html += '<textarea id="golem_settings_edit" style="width:570px;">' + JSON.stringify(Workers[this.temp.worker][this.temp.edit], null, '   ') + '</textarea>';
	}
	$('#golem-dashboard-Settings').html(html);
	$('#golem_settings_refresh').click(function(){Settings.dashboard();});
	$('#golem_settings_save').click(function(){
		var i, data;
		try {
			data = JSON.parse($('#golem_settings_edit').val())
		} catch(e) {
			alert("ERROR!!!\n\nBadly formed JSON data.\n\nPlease check the data and try again!");
			return;
		}
		if (confirm("WARNING!!!\n\nReplacing internal data can be dangrous, only do this if you know exactly what you are doing.\n\nAre you sure you wish to replace "+Settings.temp.worker+'.'+Settings.temp.edit+"?")) {
			// Need to copy data over and then trigger any notifications
			Settings.replace(Workers[Settings.temp.worker], Settings.temp.edit, data);
		}
	});
	$('#golem_settings_path').change(function(){
		var path = $('#golem_settings_path').val().regex(/([^.]*)\.?(.*)/);
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
	system:true,
	unsortable:true,
	advanced:true
};

Title.option = {
	enabled:false,
	title:"CA: {pause}{disable}{worker} | {energy}e | {stamina}s | {exp_needed}xp by {LevelUp:time}"
};

Title.temp = {
	old:null, // Old title, in case we ever have to change back
	alias:{} // name:'worker:path.to.data[:txt if true[:txt if false]]' - fill via Title.alias()
};

Title.display = [
	{
		id:'enabled',
		label:'Change Window Title',
		checkbox:true
	},{
		id:'title',
		text:true,
		size:24
	},{
		title:'Useful Values',
		info:'{myname}<br>{energy} / {maxenergy}<br>{health} / {maxhealth}<br>{stamina} / {maxstamina}<br>{level}<br>{pause} - "(Paused) " when paused<br>{LevelUp:time} - Next level time<br>{worker} - Current worker<br>{bsi} / {lsi} / {csi}'
	}
];

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
Update.data = null;

Update.settings = {
	system:true
};

Update.runtime = {
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
		case 'safari':
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
	var $btn = $('<img class="golem-button golem-version" title="Check for Updates" src="' + getImage('update') + '">').click(function(){
		$(this).addClass('red');
		Update.checkVersion(true);
	});
	$('#golem_buttons').append($btn);
	if (isRelease) { // Add an advanced "beta" button for official release versions
		$btn = $('<img class="golem-button golem-version golem-advanced"' + (Config.get('option.advanced') ? '' : ' style="display:none;"') + ' title="Check for Beta Versions" src="' + getImage('beta') + '">').click(function(){
			isRelease = false;// Isn't persistant, so nothing visible to the user except the beta release
			$(this).addClass('red');
			Update.checkVersion(true);
		});
		$('#golem_buttons').append($btn);
	}
	// Add a changelog advanced button
	$btn = $('<img class="golem-button golem-advanced green"' + (Config.get('option.advanced') ? '' : ' style="display:none;"') + ' title="Changelog" src="' + getImage('log') + '">').click(function(){
		window.open('http://code.google.com/p/game-golem/source/list', '_blank'); 
	});
	$('#golem_buttons').append($btn)
	// Add a wiki button
	$btn = $('<img class="golem-button green" title="GameGolem wiki" src="' + getImage('wiki') + '">').click(function(){
		window.open('http://code.google.com/p/game-golem/wiki/castle_age', '_blank'); 
	});
	$('#golem_buttons').append($btn)
	this._remind(Math.max(0, (21600000 - (Date.now() - this.runtime.lastcheck)) / 1000), 'check');// 6 hours max
	$('head').bind('DOMNodeInserted', function(event){
		if (event.target.nodeName === 'META' && $(event.target).attr('name') === 'golem-version') {
			tmp = $(event.target).attr('content').regex(/([0-9]+\.[0-9]+)\.([0-9]+)/);
			if (tmp) {
				Update._remind(21600, 'check');// 6 hours
				Update.runtime.lastcheck = Date.now();
				Update.runtime.version = tmp[0];
				Update.runtime.revision = tmp[1];
				if (Update.runtime.force && Update.temp.version >= tmp[0] && (isRelease || Update.temp.revision >= tmp[1])) {
					$btn = $('<div class="golem-button golem-info red">No Update Found</div>').animate({'z-index':0}, {duration:5000,complete:function(){$(this).remove();} });
					$('#golem_buttons').after($btn);
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
	if (Date.now() - this.runtime.lastcheck > 21600000) {// 6+ hours since last check (60x60x6x1000ms)
		this.checkVersion(false);
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

/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page, Queue, Resources,
	Battle, Generals, LevelUp, Player,
	APP, APPID, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, Divisor, length, unique, deleteElement, sum, findInArray, findInObject, objectIndex, sortObject, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
	makeImage
*/
/********** Worker.Window **********
* Deals with multiple Windows being open at the same time...
*
* http://code.google.com/p/game-golem/issues/detail?id=86
*
* NOTE: Cannot share "global" information across page reloads any more
*/
var Window = new Worker('Window');
Window.runtime = Window.option = null; // Don't save anything except global stuff
Window._rootpath = false; // Override save path so we don't get limited to per-user

Window.settings = {
	system:true,
	taint:true
};

Window.data = { // Shared between all windows
	current:null, // Currently active window
	list:{} // List of available windows
};

Window.temp = {
	active:false, // Are we the active tab (able to do anything)?
	_id:'#' + Date.now()
};

Window.timeout = 15000; // How long to give a tab to update itself before deleting it (15 seconds)
Window.warning = null;// If clicking the Disabled button when not able to go Enabled

/***** Window.init() *****
3. Add ourselves to this.data.list with the current time
4. If no active worker (in the last 2 seconds) then make ourselves active
4a. Set this.temp.active, this.data.current, and immediately call this._save()
4b/5. Add the "Enabled/Disabled" button, hidden if necessary (hiding other elements if we're disabled)
6. Add a click handler for the Enable/Disable button
6a. Button only works when either active, or no active at all.
6b. If active, make inactive, update this.temp.active, this.data.current and hide other elements
6c. If inactive , make active, update this.temp.active, this.data.current and show other elements (if necessary)
7. Add a repeating reminder for every 1 second
*/
Window.init = function() {
	var now = Date.now(), data;
	this.data.list = this.data.list || {};
	this.data.list[this.temp._id] = now;
	if (!this.data.current || typeof this.data.list[this.data.current] === 'undefined' || this.data.list[this.data.current] < now - this.timeout || this.data.current === this.temp._id) {
		this._set('temp.active', true);
		this.data.current = this.temp._id;
		this._save('data');// Force it to save immediately - reduce the length of time it's waiting
		$('.golem-title').after('<div id="golem_window" class="golem-info golem-button green" style="display:none;">Enabled</div>');
	} else {
		$('.golem-title').after('<div id="golem_window" class="golem-info golem-button red"><b>Disabled</b></div>');
		$('#golem_window').nextAll().hide();
	}
	$('#golem_window').click(function(event){
		Window._unflush();
		if (Window.temp.active) {
			$(this).html('<b>Disabled</b>').toggleClass('red green').nextAll().hide();
			Window.data.current = null;
			Window.temp.active = false;
		} else if (!Window.data.current || typeof Window.data.list[Window.data.current] === 'undefined' || Window.data.list[Window.data.current] < Date.now() - Window.timeout) {
			$(this).html('Enabled').toggleClass('red green');
			$('#golem_buttons').show();
			if (Config.get('option.display') === 'block') {
				$('#golem_config').parent().show();
			}
			Queue.clearCurrent();// Make sure we deal with changed circumstances
			Window.data.current = Window.temp._id;
			Window.temp.active = true;
		} else {// Not able to go active
			Queue.clearCurrent();
			$(this).html('<b>Disabled</b><br><span>Another instance running!</span>');
			if (!Window.warning) {
				(function(){
					if ($('#golem_window span').length) {
						if ($('#golem_window span').css('color').indexOf('255') === -1) {
							$('#golem_window span').animate({'color':'red'},200,arguments.callee);
						} else {
							$('#golem_window span').animate({'color':'black'},200,arguments.callee);
						}
					}
				})();
			}
			window.clearTimeout(Window.warning);
			Window.warning = window.setTimeout(function(){if(!Window.temp.active){$('#golem_window').html('<b>Disabled</b>');}Window.warning=null;}, 3000);
		}
		Window._taint.data = true;
		Window._flush();
	});
	this._taint.data = true;
	this._revive(1); // Call us *every* 1 second - not ideal with loads of Window, but good enough for half a dozen or more
	Title.alias('disable', 'Window:temp.active::(Disabled) ');
};

/***** Window.update() *****
1. We don't care about any data, only about the regular reminder we've set, so return if not the reminder
2. Update the data[id] to now() so we're not removed
3. If no other open instances then make ourselves active (if not already) and remove the "Enabled/Disabled" button
4. If there are other open instances then show the "Enabled/Disabled" button
*/
Window.update = function(event) {
	if (event.type !== 'reminder') {
		return;
	}
	var i, now = Date.now();
	this.data = this.data || {};
	this.data.list = this.data.list || {};
	this.data.list[this.temp._id] = now;
	for(i in this.data.list) {
		if (this.data.list[i] < (now - this.timeout)) {
			delete this.data.list[i];
		}
	}
	i = length(this.data.list);
	if (i === 1) {
		if (!this.temp.active) {
			$('#golem_window').css('color','black').html('Enabled').toggleClass('red green');
			$('#golem_buttons').show();
			if (Config.get('option.display') === 'block') {
				$('#golem_config').parent().show();
			}
			Queue.clearCurrent();// Make sure we deal with changed circumstances
			this.data.current = this.temp._id;
			this.temp.active = true;
			this._notify('temp.active');
		}
		$('#golem_window').hide();
	} else if (i > 1) {
		$('#golem_window').show();
	}
	this._taint.data = true;
	this._flush();// We really don't want to store data any longer than we really have to!
};
// Add "Castle Age" to known applications
Main.add('castle_age', '46755028429', 'Castle Age');
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
	pages:'army_viewarmy',

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
	if (!change && Page.page === 'army_viewarmy') {
		var i, page, start, army = this.data = this.data || {}, now = Date.now(), count = 0, $tmp;
		$tmp = $('table.layout table[width=740] div').first().children();
		page = $tmp.eq(1).html().regex(/\<div[^>]*\>([0-9]+)\<\/div\>/);
		start = $tmp.eq(2).text().regex(/Displaying: ([0-9]+) - [0-9]+/);
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
				level = $(who).text().regex(/([0-9]+) Commander/i);
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
			this.runtime.extra = 1 + $tmp.parent().next().text().regex('Extra member x([0-9]+)');
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
	return this._parent();
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
		quests_demiquests:		{url:'symbolquests.php', image:'demi_quest_on.gif'},
		quests_atlantis:		{url:'monster_quests.php', image:'tab_atlantis_on.gif'},
		battle_battle:			{url:'battle.php', image:'battle_on.gif'},
		battle_training:		{url:'battle_train.php', image:'training_grounds_on_new.gif'},
		battle_rank:			{url:'battlerank.php', image:'tab_battle_rank_on.gif'},
		battle_raid:			{url:'raid.php', image:'tab_raid_on.gif'},
		battle_arena:			{url:'arena.php', image:'tab_arena_on.gif'},
		battle_war_council:		{url:'war_council.php', image:'war_select_banner.jpg'},
		monster_monster_list:	{url:'battle_monster.php', image:'tab_monster_list_on.gif'},
		monster_battle_monster:	{url:'battle_monster.php', selector:'div[style*="nm_monster_list_button.gif"]'},
		keep_monster_active:	{url:'raid.php', image:'dragon_view_more.gif'},
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

Alchemy.defaults['castle_age'] = {
	pages:'keep_alchemy'
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
			recipe.ingredients[name] = ($(el).text().regex(/x([0-9]+)/) || 1);
			Alchemy.data.ingredients[name] = 0;// Make sure we know an ingredient exists
			if (recipe.type === 'Summons') {
				Alchemy.data.summons[name] = true;// Make sure we know an ingredient exists
			}
		});
		Alchemy.data.recipe[title] = recipe;
	});
	$('div.ingredientUnit').each(function(i,el){
		var name = $('img', el).attr('src').filepart();
		Alchemy.data.ingredients[name] = $(el).text().regex(/x([0-9]+)/);
	});
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
/********** Worker.Bank **********
* Auto-banking
*/
var Bank = new Worker('Bank');
Bank.data = null;

Bank.defaults['castle_age'] = {};

Bank.option = {
	general:true,
	above:10000,
	hand:0,
	keep:10000
};

Bank.display = [
	{
		id:'general',
		label:'Use Best General',
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
	this._watch(Player, 'data.cash');// We want other things too, but they all change in relation to this
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
	this.set('option._sleep', (Player.get('cash', 0) <= Math.max(10, this.option.above, this.option.hand) || (this.option.general && !Generals.test('Aeris'))));
};

// Return true when finished
Bank.stash = function(amount) {
	var cash = Player.get('cash', 0);
	amount = (isNumber(amount) ? Math.min(cash, amount) : cash) - this.option.hand;
	if (!amount || amount <= 10 || (this.option.general && !Generals.test('Aeris'))) {
		return true;
	}
	if ((this.option.general && !Generals.to('bank')) || !Page.to('keep_stats')) {
		return false;
	}
	$('input[name="stash_gold"]').val(amount);
	Page.click('input[value="Stash"]');
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

/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page, Queue, Resources,
	Battle:true, Generals, LevelUp, Monster, Player,
	APP, APPID, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, Divisor, length, unique, deleteElement, sum, findInArray, findInObject, objectIndex, sortObject, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
	makeImage
*/
/********** Worker.Battle **********
* Battling other players (NOT raid or Arena)
*/
var Battle = new Worker('Battle');

Battle.defaults['castle_age'] = {
	pages:'battle_rank battle_battle'
};

Battle.data = {
	user: {},
	rank: {},
	points: {}
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
		require:{'general':false},
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
		require:{'bp':'Always'},
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
		require:{'between':0},
		select:[1,2,3,4,5],
		help:'How many times to chain before stopping'
	},{
		advanced:true,
		id:'risk',
		label:'Risk Death',
		checkbox:true,
		help:'The lowest health you can attack with is 10, but you can lose up to 12 health in an attack, so are you going to risk it???'
	},{
		id:'army',
		require:{'type':'Invade'},
		label:'Target Army Ratio<br>(Only needed for Invade)',
		select:['Any', 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.1, 1.2, 1.3, 1.4, 1.5],
		help:'Smaller number for smaller target army. Reduce this number if you\'re losing in Invade'
	},{
		id:'level',
		require:{'type':[['Invade']]},
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

/***** Battle.init() *****
1. Watch Arena and Monster for changes so we can update our target if needed
*/
Battle.init = function() {
        var i, list, rank;
//	this._watch(Arena);
	this._watch(Monster, 'runtime.attack');
	if (typeof this.option.points === 'boolean') {
		this.option.points = this.option.points ? (this.option.type === 'War' ? 'Duel' : this.option.type) : 'Never';
		$(':golem(Battle,points)').val(this.option.points);
	}
//	this.option.arena = false;// ARENA!!!!!!
	Resources.use('Stamina');

	// make a custom Config type of for rank, based on number so it carries forward on level ups
	list = {};
	rank = Player.get('rank') || 0;
	if (rank < 4) {
		for (i = rank - 4; i < 0; i++) {
			list[i] = '(' + i + ') ' + this.data.rank[0];
		}
	}
	for (i in this.data.rank){
		list[i - rank] = '(' + (i - rank) + ') ' + this.data.rank[i].name;
	}
	Config.set('limit_list', list);

	// map old "(#) rank" string into the number
	i = this.get('option.limit');
	if (isString(i) && (i = i.regex(/\((-?\d+)\)/))) {
		this.set('option.limit', i);
	}
};

/***** Battle.parse() *****
1. On the Battle Rank page parse out our current Rank and Battle Points
2. On the Battle page
2a. Check if we've just attacked someone and parse out the results
2b. Parse the current Demi-Points
2c. Check every possible target and if they're eligable then add them to the target list
*/
Battle.parse = function(change) {
	var data, uid, tmp, myrank;
	if (Page.page === 'battle_rank') {
		data = {0:{name:'Newbie',points:0}};
		$('tr[height="23"]').each(function(i,el){
			var info = $(el).text().regex(/Rank ([0-9]+) - (.*)\s*([0-9]+)/i);
			data[info[0]] = {name:info[1], points:info[2]};
		});
		this.data.rank = data;
		this.data.bp = $('span:contains("Battle Points.")', 'div:contains("You are a Rank")').text().replace(/,/g, '').regex(/with ([0-9]+) Battle Points/i);
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
//			} else if (!$('div.results').text().match(new RegExp(data[uid].name.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&")+"( fought with:|'s Army of ([0-9]+) fought with|'s Defense)",'i'))) {
//			} else if (!$('div.results').text().match(data[uid].name)) {
//				this.runtime.attacking = uid; // Don't remove target as we've hit someone else...
//				console.log(warn(), 'wrong ID');
			} else if ($('img[src*="battle_victory"]').length) {
				this.data.bp = $('span.result_body:contains("Battle Points.")').text().replace(/,/g, '').regex(/total of ([0-9]+) Battle Points/i);
				data[uid].win = (data[uid].win || 0) + 1;
				data[uid].last = Date.now();
				History.add('battle+win',1);
				if (this.option.chain && (data[uid].win % this.option.chain)) {
					this.runtime.attacking = uid;
				}
				data[uid].last = Date.now();
				//console.log(warn(), 'win');
			} else if ($('img[src*="battle_defeat"]').length) {
				data[uid].loss = (data[uid].loss || 0) + 1;
				data[uid].last = Date.now();
				History.add('battle+loss',-1);
				//console.log(warn(), 'loss');
			} else {
				this.runtime.attacking = uid; // Don't remove target as we've not hit them...
			}
		}
		tmp = $('#app'+APPID+'_app_body table.layout table div div:contains("Once a day you can")').text().replace(/[^0-9\/]/g ,'').regex(/([0-9]+)\/10([0-9]+)\/10([0-9]+)\/10([0-9]+)\/10([0-9]+)\/10/);
		if (tmp) {
			this.data.points = tmp;
		}
		myrank = Player.get('rank');
		$('#app'+APPID+'_app_body table.layout table table tr:even').each(function(i,el){
			var uid = $('img[uid!==""]', el).attr('uid'), info = $('td.bluelink', el).text().replace(/[ \t\n]+/g, ' '), rank = info.regex(/Battle:[^(]+\(Rank ([0-9]+)\)/i);
			if (!uid || !info || (Battle.option.bp === 'Always' && myrank - rank > 5) || (Battle.option.bp === 'Never' && myrank - rank <= 5)) {
				return;
			}
			data[uid] = data[uid] || {};
			data[uid].name = $('a', el).text().trim();
			data[uid].level = info.regex(/\(Level ([0-9]+)\)/i);
			data[uid].rank = rank;
			data[uid].war = info.regex(/War:[^(]+\(Rank ([0-9]+)\)/i);
			data[uid].army = $('td.bluelink', el).next().text().regex(/([0-9]+)/);
			data[uid].align = $('img[src*="graphics/symbol_"]', el).attr('src').regex(/symbol_([0-9])/i);
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
	var i, j, data = this.data.user, list = [], points = false, status = [], army = Player.get('army'), level = Player.get('level'), rank = Player.get('rank'), count = 0, skip, limit, enabled = !this.get(['option', '_disabled'], false);
	status.push('Rank ' + Player.get('rank') + ' ' + (Player.get('rank') && this.data.rank[Player.get('rank')].name) + ' with ' + (this.data.bp || 0).addCommas() + ' Battle Points, Targets: ' + length(data) + ' / ' + this.option.cache);
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
		if ((this.option.bp === 'Always' && (data[i].rank|| 0) - rank  <= limit) || (this.option.bp === 'Never' && rank - (data[i].rank || 6) <= 5)) { // unknown rank never deleted
			delete data[i];
		}
	}
	if (length(data) > this.option.cache) { // Need to prune our target cache
//		console.log(warn(), 'Pruning target cache');
		list = [];
		for (i in data) {
/*			weight = Math.range(-10, (data[i].win || 0) - (data[i].loss || 0), 20) / 2;
			if (Battle.option.bp === 'Always') { weight += ((data[i].rank || 0) - rank) / 2; }
			else if (Battle.option.bp === 'Never') { weight += (rank - (data[i].rank || 0)) / 2; }
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
	if (!points && this.option.monster && !Queue.runtime.levelup && Monster.get('runtime.attack',false)) {
		this.runtime.attacking = null;
		status.push('Attacking Monsters');
	} else {
		if (!this.runtime.attacking || !data[this.runtime.attacking]
		|| (this.option.army !== 'Any' && (data[this.runtime.attacking].army / army) * (data[this.runtime.attacking].level / level) > this.option.army)
		|| (this.option.level !== 'Any' && (data[this.runtime.attacking].level / level) > this.option.level)) {
			this.runtime.attacking = null;
		}
		skip = {};
		list = [];
		for(j=0; j<this.option.prefer.length; j++) {
			i = this.option.prefer[j];
			if (!/[^0-9]/g.test(i)) {
				if (this.option.preferonly === 'Never') {
					skip[i] = true;
					continue;
				}
				data[i] = data[i] || {};
				if ((data[i].dead && data[i].dead + 300000 >= Date.now()) // If they're dead ignore them for 1hp = 5 mins
				|| (data[i].last && data[i].last + this.option.between >= Date.now()) // If we're spacing our attacks
				|| (typeof this.option.losses === 'number' && (data[i].loss || 0) - (data[i].win || 0) >= this.option.losses) // Don't attack someone who wins more often
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
				|| (typeof this.option.losses === 'number' && (data[i].loss || 0) - (data[i].win || 0) >= this.option.losses) // Don't attack someone who wins more often
				|| (this.option.army !== 'Any' && ((data[i].army || 0) / army) * (data[i].level || 0) / level > this.option.army && this.option.type === 'Invade')
				|| (this.option.level !== 'Any' && ((data[i].level || 0) / level) > this.option.level && this.option.type !== 'Invade')
				|| (points && (!data[i].align || this.data.points[data[i].align - 1] >= 10))) {
					continue;
				}
				if (Battle.option.bp === 'Always') {
					for (j=Math.range(1,(data[i].rank || 0)-rank+1,5); j>0; j--) { // more than 1 time if it's more than 1 difference
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
			status.push('Next Target: <img class="golem-image" src="' + this.symbol[data[i].align] +'" alt=" " title="'+this.demi[data[i].align]+'"> ' + data[i].name.html_escape() + ' (Level ' + data[i].level + (data[i].rank && this.data.rank[data[i].rank] ? ' ' + this.data.rank[data[i].rank].name : '') + ' with ' + data[i].army + ' army)' + (count ? ', ' + count + ' valid target' + plural(count) : ''));
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
	if (!this.runtime.attacking || Player.get('health') < (this.option.risk ? 10 : 13) || useable_stamina < (!this.runtime.points && this.option.type === 'War' ? 10 : 1)) {
//		console.log(warn(), 'Not attacking because: ' + (this.runtime.attacking ? '' : 'No Target, ') + 'Health: ' + Player.get('health') + ' (must be >=10), Burn Stamina: ' + useable_stamina + ' (must be >=1)');
		return QUEUE_FINISH;
	}
	if (!state || !Generals.to(this.option.general ? (this.runtime.points ? this.option.points : this.option.type) : this.option.general_choice) || !Page.to('battle_battle')) {
		return QUEUE_CONTINUE;
	}
	var $symbol_rows = $('#app'+APPID+'_app_body table.layout table table tr:even').has('img[src*="graphics/symbol_'+this.data.user[this.runtime.attacking].align+'"]');
	var $form = $('form input[alt="' + (this.runtime.points ? this.option.points : this.option.type) + '"]', $symbol_rows).first().parents('form');
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
	for (var i in Battle.data.rank) {
		if (Battle.data.rank[i].name === name) {
			return parseInt(i, 10);
		}
	}
	return 0;
};

Battle.order = [];
Battle.dashboard = function(sort, rev) {
	var i, o, points = [0, 0, 0, 0, 0, 0], list = [], output = [], sorttype = ['align', 'name', 'level', 'rank', 'army', 'win', 'loss', 'hide'], data = this.data.user, army = Player.get('army'), level = Player.get('level');
	for (i in data) {
		points[data[i].align]++;
	}
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
		this.order.sort(function(a,b) {
			var aa = (data[a][sorttype[sort]] || 0), bb = (data[b][sorttype[sort]] || 0);
			if (typeof aa === 'string' || typeof bb === 'string') {
				return (rev ? (''+bb).localeCompare(aa) : (''+aa).localeCompare(bb));
			}
			return (rev ? aa - bb : bb - aa);
		});
	}
	list.push('<div style="text-align:center;"><strong>Rank:</strong> ' + this.data.rank[Player.get('rank')].name + ' (' + Player.get('rank') + '), <strong>Targets:</strong> ' + length(data) + ' / ' + this.option.cache + ', <strong>By Alignment:</strong>');
	for (i=1; i<6; i++ ) {
		list.push(' <img class="golem-image" src="' + this.symbol[i] +'" alt="'+this.demi[i]+'" title="'+this.demi[i]+'"> ' + points[i]);
	}
	list.push('</div><hr>');
	th(output, 'Align');
	th(output, 'Name');
	th(output, 'Level');
	th(output, 'Rank');
	th(output, 'Army');
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
		td(output, this.data.rank[data.rank] ? this.data.rank[data.rank].name : '');
		td(output, (this.option.army !== 'Any' && (data.army / army * data.level / level) > this.option.army) ? '<i>'+data.army+'</i>' : data.army);
		td(output, data.win || '');
		td(output, data.loss || '');
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
Blessing.data = null;

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
		time = result.text().regex(/Please come back in: ([0-9]+) hours and ([0-9]+) minutes/i);
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
	Page.click('#app'+APPID+'_symbols_form_'+this.which.indexOf(this.option.which)+' input.imgButton');
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
Elite.data = null;

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
				if (!Army.get([list[i]], false) && (!this.option.friends || Army.get(['_info',list[i],'friend'], false))) {// Only try to add a non-member who's not already added
					next = list[i];
					break;
				}
			}
		}
		check = ((this.runtime.waitelite + (this.option.every * 3600000)) - now) / 1000;
		tmp.push('Elite Guard: Check' + (check <= 0 ? 'ing now' : ' in <span class="golem-time" name="' + ((check * 1000) + now) + '">' + makeTimer(check) + '</span>') + (next ? ', Next: '+Army.get(['_info', next, 'name']) : ''));
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
	APP, APPID, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, Divisor, length, unique, deleteElement, sum, findInArray, findInObject, objectIndex, sortObject, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
	makeImage
*/
/********** Worker.Generals **********
* Updates the list of Generals
* Finds best General for other classes
* *** Need to take into account army size and real stats for attack and defense
*/
var Generals = new Worker('Generals');
Generals.data = {};

Generals.defaults['castle_age'] = {
	pages:'* heroes_generals'
};

Generals.runtime = {
	multipliers: {}, // Attack multipliers list for Orc King and Barbarus type generals
	force: false,
	armymax:1 // Don't force someone with a small army to buy a whole load of extra items...
};

Generals.init = function() {
	for (var i in this.data) {
		if (i.indexOf('\t') !== -1) { // Fix bad page loads...
			delete this.data[i];
		}
	}
	if (!Player.get('attack') || !Player.get('defense')) { // Only need them the first time...
		this._watch(Player, 'data.attack');
		this._watch(Player, 'data.defense');
	}
	this.runtime.force = true; // Flag to force initial re-read of general skills to catch new terms
	this._watch(Town);
};

Generals.parse = function(change) {
	if ($('div.results').text().match(/has gained a level!/i)) {
		this.data[Player.get('general')].level++; // Our stats have changed but we don't care - they'll update as soon as we see the Generals page again...
	}
	if (Page.page === 'heroes_generals') {
		var $elements = $('.generalSmallContainer2'), data = this.data, weapon_bonus = '', current = $('div.general_name_div3').first().text().trim();

		$('div[style*="model_items.jpg"] img[title]').each(function(i){
			var temp = $(this).attr('title');
			if (temp && temp.indexOf("[not owned]") === -1){
				if (weapon_bonus.length) {
					weapon_bonus += ', ';
				}
				weapon_bonus += temp.replace(/\<[^>]*\>|\s+|\n/g,' ').trim();
				//console.log(warn(), "Found weapon: " + temp.replace(/\<[^>]*\>|\s+|\n/g,' ').trim());
			}
		});
		if (data[current]){
			data[current].weaponbonus = weapon_bonus;
		}
// Hopefully our Page.to() logic now catches most bad page loads and removes the need for this...
//		if ($elements.length < length(data)) {
//			console.log(warn(), 'Different number of generals, have '+$elements.length+', want '+length(data));
//			Page.to('heroes_generals', ''); // Force reload
//			return false;
//		}
		$elements.each(function(i,el){
			var name = $('.general_name_div3_padding', el).text().trim(), level = parseInt($(el).text().regex(/Level ([0-9]+)/i), 10), progress = parseInt($('div.generals_indv_stats', el).next().children().children().children().next().attr('style').regex(/width: ([0-9]*\.*[0-9]*)%/i), 10);
			if (name && name.indexOf('\t') === -1 && name.length < 30) { // Stop the "All generals in one box" bug
//				if (!data[name] || data[name].level !== level || data[name].progress !== progress) {
					data[name] = data[name] || {};
					data[name].id		= $('input[name=item]', el).val();
					data[name].type		= $('input[name=itype]', el).val();
					data[name].img		= $('.imgButton', el).attr('src').filepart();
					data[name].att		= $('.generals_indv_stats_padding div:eq(0)', el).text().regex(/([0-9]+)/);
					data[name].def		= $('.generals_indv_stats_padding div:eq(1)', el).text().regex(/([0-9]+)/);
					data[name].progress	= progress;
					data[name].level	= level; // Might only be 4 so far, however...
					data[name].skills	= $(el).children(':last').html().replace(/\<[^>]*\>|\s+|\n/g,' ').trim();
					if (level >= 4){	// If we just leveled up to level 4, remove the priority
						if (data[name].priority) {
							delete data[name].priority;
						}
					}
//				}
			}
		});
	}
	return false;
};

Generals.update = function(event) {
	var data = this.data, i, priority_list = [], list = [], invade = Town.get('runtime.invade'), duel = Town.get('runtime.duel'), attack, attack_bonus, defend, defense_bonus, army, gen_att, gen_def, attack_potential, defense_potential, att_when_att_potential, def_when_att_potential, att_when_att = 0, def_when_att = 0, monster_att = 0, monster_multiplier = 1, current_att, current_def, listpush = function(list,i){list.push(i);}, skillcombo, calcStats = false;
	if (event.type === 'init' || event.type === 'data') {
		for (i in Generals.data) {
			list.push(i);
		}
		// "any" MUST remain lower case - all real generals are capitalised so this provides the first and most obvious difference
		Config.set('generals', ['any','under level 4'].concat(list.sort())); 
	}
	
	// Take all existing priorities and change them to rank starting from 1 and keeping existing order.
	for (i in data) {
		if (data[i].level < 4) {
			priority_list.push([i, data[i].priority]);
		}
		// Force an update if stats not yet calculated
		if (!data[i].stats) {
			this.runtime.force = true;
		}
	}
	priority_list.sort(function(a,b) {
		return (a[1] - b[1]);
	});
	for (i in priority_list){
		data[priority_list[i][0]].priority = parseInt(i, 10)+1;
	}
	this.runtime.max_priority = priority_list.length;
	// End Priority Stuff
	
	if (((event.type === 'data' || event.worker.name === 'Town' || event.worker.name === 'Player') && invade && duel)
		|| this.runtime.force) {
		this.runtime.force = false;
		if (event.worker.name === 'Player' && Player.get('attack') && Player.get('defense')) {
			this._unwatch(Player); // Only need them the first time...
		}
		for (i in data) {
			skillcombo = data[i].skills + (data[i].weaponbonus || '');
			attack_bonus = Math.floor(sum(skillcombo.numregex(/([-+]?[0-9]*\.?[0-9]+) Player Attack|Increase Player Attack by ([0-9]+)|Convert ([-+]?[0-9]+\.?[0-9]*) Attack/gi)) + (sum(data[i].skills.numregex(/Increase ([-+]?[0-9]+\.?[0-9]*) Player Attack for every Hero Owned/gi)) * (length(data)-1)));
			defense_bonus = Math.floor(sum(skillcombo.numregex(/([-+]?[0-9]*\.?[0-9]+) Player Defense|Increase Player Defense by ([0-9]+)/gi))	
				+ sum(data[i].skills.numregex(/Increase Player Defense  by ([-+]?[0-9]*\.?[0-9]+) for every 3 Health/gi)) * Player.get('health') / 3
				+ (sum(data[i].skills.numregex(/Increase ([-+]?[0-9]*\.?[0-9]+) Player Defense for every Hero Owned/gi)) * (length(data)-1)));
			attack = (Player.get('attack') + attack_bonus
						- (sum(skillcombo.numregex(/Transfer ([0-9]+)% Attack to Defense/gi)) * Player.get('attack') / 100).round(0) 
						+ (sum(skillcombo.numregex(/Transfer ([0-9]+)% Defense to Attack/gi)) * Player.get('defense') / 100).round(0));
			defend = (Player.get('defense') + defense_bonus
						+ (sum(skillcombo.numregex(/Transfer ([0-9]+)% Attack to Defense/gi)) * Player.get('attack') / 100).round(0) 
						- (sum(skillcombo.numregex(/Transfer ([0-9]+)% Defense to Attack/gi)) * Player.get('defense') / 100).round(0));
			attack_potential = Player.get('attack') + (attack_bonus * 4) / data[i].level;	// Approximation
			defense_potential = Player.get('defense') + (defense_bonus * 4) / data[i].level;	// Approximation
			army = Math.min(Player.get('armymax'),(sum(skillcombo.numregex(/Increases? Army Limit to ([0-9]+)/gi)) || 501));
			gen_att = getAttDef(data, listpush, 'att', Math.floor(army / 5));
			gen_def = getAttDef(data, listpush, 'def', Math.floor(army / 5));
			att_when_att = sum(skillcombo.numregex(/Increase Player Attack when Defending by ([-+]?[0-9]+)/gi));
			def_when_att = sum(skillcombo.numregex(/([-+]?[0-9]+) Defense when attacked/gi));
			att_when_att_potential = (att_when_att * 4) / data[i].level;	// Approximation
			def_when_att_potential = (def_when_att * 4) / data[i].level;	// Approximation
			monster_att = sum(skillcombo.numregex(/([-+]?[0-9]+) Monster attack/gi));
			monster_multiplier = 1.1 + sum(skillcombo.numregex(/([-+]?[0-9]+)% Critical/gi))/100;
			if (sum(skillcombo.numregex(/Increase Power Attacks by ([0-9]+)/gi))) {
				this.runtime.multipliers[i] = sum(skillcombo.numregex(/Increase Power Attacks by ([0-9]+)/gi));
			}
			current_att = data[i].att + parseInt(sum(data[i].skills.numregex(/'s Attack by ([-+]?[0-9]+)/gi)), 10) + (typeof data[i].weaponbonus !== 'undefined' ? parseInt(sum(data[i].weaponbonus.numregex(/([-+]?[0-9]+) attack/gi)), 10) : 0);	// Need to grab weapon bonuses without grabbing Serene's skill bonus
			current_def = data[i].def + (typeof data[i].weaponbonus !== 'undefined' ? parseInt(sum(data[i].weaponbonus.numregex(/([-+]?[0-9]+) defense/gi)), 10) : 0);
//			console.log(warn(), i + ' attack: ' + current_att + ' = ' + data[i].att + ' + ' + parseInt((data[i].skills.regex(/'s Attack by ([-+]?[0-9]+)/gi) || 0)) + ' + ' + parseInt((data[i].weaponbonus.regex(/([-+]?[0-9]+) attack/gi) || 0)));
			data[i].invade = {
				att: Math.floor(invade.attack + current_att + (current_def * 0.7) + ((attack + (defend * 0.7)) * army) + gen_att),
				def: Math.floor(invade.defend + current_def + (current_att * 0.7) + ((defend + def_when_att + ((attack + att_when_att) * 0.7)) * army) + gen_def)
			};
			data[i].stats = {
				stamina: sum(skillcombo.numregex(/Increase Max Stamina by ([0-9]+)|([-+]?[0-9]+) Max Stamina/gi)) 
						+ (sum(skillcombo.numregex(/Transfer ([0-9]+)% Max Energy to Max Stamina/gi)) * Player.get('maxenergy') / 100/2).round(0)
						- (sum(skillcombo.numregex(/Transfer ([0-9]+)% Max Stamina to Max Energy/gi)) * Player.get('maxstamina') / 100).round(0),
				energy:	sum(skillcombo.numregex(/Increase Max Energy by ([0-9]+)|([-+]?[0-9]+) Max Energy/gi))
						- (sum(skillcombo.numregex(/Transfer ([0-9]+)% Max Energy to Max Stamina/gi)) * Player.get('maxenergy') / 100).round(0)
						+ (sum(skillcombo.numregex(/Transfer ([0-9]+)% Max Stamina to Max Energy/gi)) * Player.get('maxstamina') / 100*2).round(0)
			};
 			data[i].duel = {
				att: Math.floor(duel.attack + current_att + (current_def * 0.7) + attack + (defend * 0.7)),
				def: Math.floor(duel.defend + current_def + (current_att * 0.7) + defend + def_when_att + ((attack + att_when_att) * 0.7))
			};
			data[i].monster = {
				att: Math.floor(monster_multiplier * (duel.attack + current_att + attack + monster_att)),
				def: Math.floor(duel.defend + current_def + defend) // Fortify, so no def_when_att
			};
/*			if (i === 'Xira' || i === 'Slayer') {
				console.log(warn(), i +' skillcombo:'+skillcombo+' numregex'+sum(data[i].skills.numregex(/Increase Player Defense  by ([-+]?[0-9]+\.?[0-9]*) for every 3 Health/gi))+' attack:'+attack+' defend:'+defend);
			}
*/			data[i].potential = {
				bank: (skillcombo.regex(/Bank Fee/gi) ? 1 : 0),
				defense: Math.floor(duel.defend + (data[i].def + 4 - data[i].level) + ((data[i].att + 4 - data[i].level) * 0.7) + defense_potential + def_when_att_potential + ((attack_potential + att_when_att_potential) * 0.7)),
				income: (skillcombo.regex(/Increase Income by ([0-9]+)/gi) * 4) / data[i].level,
				invade: Math.floor(invade.attack + (data[i].att + 4 - data[i].level) + ((data[i].def + 4 - data[i].level) * 0.7) + ((attack_potential + (defense_potential * 0.7)) * army) + gen_att),
				duel: Math.floor(duel.attack + (data[i].att + 4 - data[i].level) + ((data[i].def + 4 - data[i].level) * 0.7) + attack_potential + (defense_potential * 0.7)),
				monster: Math.floor(duel.attack + (data[i].att + 4 - data[i].level) + attack_potential + (monster_att * 4) / data[i].level),
				raid_invade: 0,
				raid_duel: 0,
				influence: (skillcombo.regex(/Influence ([0-9]+)% Faster/gi) || 0),
				drops: (skillcombo.regex(/Chance ([0-9]+)% Drops/gi) || 0),
				demi: (skillcombo.regex(/Extra Demi Points/gi) ? 1 : 0),
				cash: (skillcombo.regex(/Bonus ([0-9]+) Gold/gi) || 0)
			};
			data[i].potential.raid_invade = (data[i].potential.defense + data[i].potential.invade);
			data[i].potential.raid_duel = (data[i].potential.defense + data[i].potential.duel);

			this.runtime.armymax = Math.max(army, this.runtime.armymax);
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
		console.log(log(), 'General "'+name+'" requested but not found!');
		return true; // Not found, so fake it
	}
	if (!Generals.test(name)) {
		//console.log(warn(), 'Identified general ' + name + ', but changing would cost stamina or energy.');
		console.log(warn(), 'General rejected due to energy or stamina loss: ' + Player.get('general') + ' to ' + name);
		//console.log(warn(), 'stamina ' + Player.get('stamina') + ' new max stamina ' + (Player.get('maxstamina') + Generals.data[name].stats.stamina)+ ' old max stamina ' + Player.get('maxstamina') + ' new gen stamina ' + Generals.data[name].stats.stamina);
		return true;
	}
//	console.log(warn(), 'Changing to General '+name);
	console.log(warn(), 'General change: ' + Player.get('general') + ' to ' + name);
	Page.to('heroes_generals', this.data[name].id && this.data[name].type ? {item:this.data[name].id, itype:this.data[name].type} : null)
	return false;
};

Generals.test = function(name) {
	Generals._unflush(); // Can't use "this" because called out of context
	var next = isObject(name) ? name : Generals.data[name];
	if (!name || !next) {
		return false;
	} else if (name === 'any') {
		return true;
	} else {
		return (Player.get('maxstamina') + next.stats.stamina >= Player.get('stamina') && Player.get('maxenergy') + next.stats.energy >= Player.get('energy'));
	}
};

Generals.best = function(type) {
	this._unflush();
	if (this.data[type]) {
		return type;
	}
	var rx = '', best = null, bestval = 0, i, value, current = Player.get('general'), first, second;
	switch(type.toLowerCase()) {
	case 'cost':		rx = /Decrease Soldier Cost by ([0-9]+)/gi; break;
	case 'stamina':		rx = /Increase Max Stamina by ([0-9]+)|\+([0-9]+) Max Stamina/gi; break;
	case 'energy':		rx = /Increase Max Energy by ([0-9]+)|\+([0-9]+) Max Energy/gi; break;
	case 'income':		rx = /Increase Income by ([0-9]+)/gi; break;
	case 'item':		rx = /([0-9]+)% Drops for Quest/gi; break;
	case 'influence':	rx = /Bonus Influence ([0-9]+)/gi; break;
	case 'defense':		rx = /([-+]?[0-9]+) Player Defense/gi; break;
	case 'cash':		rx = /Bonus ([0-9]+) Gold/gi; break;
	case 'bank':		return 'Aeris';
	case 'war':			rx = /\+([0-9]+) Attack to your entire War Council|-([0-9]+) Attack to your opponents War Council/gi; break;
	case 'raid-invade': 	// Fall through
	case 'invade':			first = 'invade'; second = 'att'; break;
	case 'raid-duel':		// Fall through
	case 'duel':			first = 'duel'; second = 'att'; break;
	case 'monster_attack': 	first = 'monster'; second = 'att'; break;
	case 'dispel':			// Fall through
	case 'monster_defend': 	first = 'monster'; second = 'def'; break;
	case 'defend':			first = 'duel'; second = 'def'; break;
	case 'under level 4':	value = function(g) { return (g.priority ? -g.priority : null); }; break;
	default:  return 'any';
	}
	if (rx) {
		value = function(g) { return sum(g.skills.numregex(rx)); };
	} else if (first && second) {
		value = function(g) { return (g[first] ? g[first][second] : null); };
	} else if (!value) {
		console.log(warn(), 'No definition for best general for ' + type);
		return 'any';
	}
	best = bestObjValue(this.data, value, Generals.test);
	return (best || 'any');
};

Generals.order = [];
Generals.dashboard = function(sort, rev) {
	var i, o, output = [], list = [], iatt = 0, idef = 0, datt = 0, ddef = 0, matt = 0, mdef = 0;

	if (typeof sort === 'undefined') {
		Generals.order = [];
		for (i in Generals.data) {
			Generals.order.push(i);
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
		Generals.order.sort(function(a,b) {
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
	for (i in Generals.data) {
		iatt = Math.max(iatt, Generals.data[i].invade ? Generals.data[i].invade.att : 1);
		idef = Math.max(idef, Generals.data[i].invade ? Generals.data[i].invade.def : 1);
		datt = Math.max(datt, Generals.data[i].duel ? Generals.data[i].duel.att : 1);
		ddef = Math.max(ddef, Generals.data[i].duel ? Generals.data[i].duel.def : 1);
		matt = Math.max(matt, Generals.data[i].monster ? Generals.data[i].monster.att : 1);
		mdef = Math.max(mdef, Generals.data[i].monster ? Generals.data[i].monster.def : 1);
	}
	list.push('<table cellspacing="0" style="width:100%"><thead><tr><th></th><th>General</th><th>Level</th><th>Quest<br>Rank</th><th>Invade<br>Attack</th><th>Invade<br>Defend</th><th>Duel<br>Attack</th><th>Duel<br>Defend</th><th>Monster<br>Attack</th><th>Fortify<br>Dispel</th></tr></thead><tbody>');
	for (o=0; o<Generals.order.length; o++) {
		i = Generals.order[o];
		output = [];
		output.push('<a class="golem-link" href="generals.php?item=' + Generals.data[i].id + '&itype=' + Generals.data[i].type + '"><img src="' + imagepath + Generals.data[i].img+'" style="width:25px;height:25px;" title="Skills: ' + Generals.data[i].skills + ', Weapon Bonus: ' + (typeof Generals.data[i].weaponbonus !== 'unknown' ? (Generals.data[i].weaponbonus ? Generals.data[i].weaponbonus : 'none') : 'unknown') + '"></a>');
		output.push(i);
		output.push('<div'+(isNumber(Generals.data[i].progress) ? ' title="'+Generals.data[i].progress+'%"' : '')+'>'+Generals.data[i].level+'</div><div style="background-color: #9ba5b1; height: 2px; width=100%;"><div style="background-color: #1b3541; float: left; height: 2px; width: '+(Generals.data[i].progress || 0)+'%;"></div></div>');
		output.push(Generals.data[i].priority ? ((Generals.data[i].priority !== 1 ? '<a class="golem-moveup" name='+Generals.data[i].priority+'>&uarr</a> ' : '&nbsp;&nbsp; ') + Generals.data[i].priority + (Generals.data[i].priority !== this.runtime.max_priority ? ' <a class="golem-movedown" name='+Generals.data[i].priority+'>&darr</a>' : ' &nbsp;&nbsp;')) : '');
		output.push(Generals.data[i].invade ? (iatt === Generals.data[i].invade.att ? '<strong>' : '') + (Generals.data[i].invade.att).addCommas() + (iatt === Generals.data[i].invade.att ? '</strong>' : '') : '?');
		output.push(Generals.data[i].invade ? (idef === Generals.data[i].invade.def ? '<strong>' : '') + (Generals.data[i].invade.def).addCommas() + (idef === Generals.data[i].invade.def ? '</strong>' : '') : '?');
		output.push(Generals.data[i].duel ? (datt === Generals.data[i].duel.att ? '<strong>' : '') + (Generals.data[i].duel.att).addCommas() + (datt === Generals.data[i].duel.att ? '</strong>' : '') : '?');
		output.push(Generals.data[i].duel ? (ddef === Generals.data[i].duel.def ? '<strong>' : '') + (Generals.data[i].duel.def).addCommas() + (ddef === Generals.data[i].duel.def ? '</strong>' : '') : '?');
		output.push(Generals.data[i].monster ? (matt === Generals.data[i].monster.att ? '<strong>' : '') + (Generals.data[i].monster.att).addCommas() + (matt === Generals.data[i].monster.att ? '</strong>' : '') : '?');
		output.push(Generals.data[i].monster ? (mdef === Generals.data[i].monster.def ? '<strong>' : '') + (Generals.data[i].monster.def).addCommas() + (mdef === Generals.data[i].monster.def ? '</strong>' : '') : '?');
		list.push('<tr><td>' + output.join('</td><td>') + '</td></tr>');
	}
	list.push('</tbody></table>');
	$('a.golem-moveup').live('click', function(event){
		var i, gdown = null, gup = null, x = parseInt($(this).attr('name'), 10);
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
			console.log(warn(), 'Priority: Swapping '+gup+' with '+gdown);
			Generals.data[gdown].priority++;
			Generals.data[gup].priority--;
		}
		Generals.dashboard(sort,rev);
		return false;
	});
	$('a.golem-movedown').live('click', function(event){
		var i, gdown = null, gup = null, x = parseInt($(this).attr('name'), 10);
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
			console.log(warn(), 'Priority: Swapping '+gup+' with '+gdown);
			Generals.data[gdown].priority++;
			Generals.data[gup].priority--;
		}
		Generals.dashboard(sort,rev);
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
			if (!(/[^0-9]/g).test(i)) {	// If we have an old entry
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
			console.log(warn(), 'Facebook popup parsed...');
		}
		return false;
	}
	var i, j, id, $tmp, gifts = this.data.gifts, todo = this.data.todo, received = this.data.received;
	//alert('Gift.parse running');
	if (Page.page === 'index') {
		// We need to get the image of the gift from the index page.
//		console.log(warn(), 'Checking for a waiting gift and getting the id of the gift.');
		if ($('span.result_body').text().indexOf('has sent you a gift') >= 0) {
			this.runtime.gift.sender_ca_name = $('span.result_body').text().regex(/[\t\n]*(.+) has sent you a gift/i);
			this.runtime.gift.name = $('span.result_body').text().regex(/has sent you a gift:\s+(.+)!/i);
			this.runtime.gift.id = $('span.result_body img').attr('src').filepart();
			console.log(warn(), this.runtime.gift.sender_ca_name + ' has a ' + this.runtime.gift.name + ' waiting for you. (' + this.runtime.gift.id + ')');
			this.runtime.gift_waiting = true;
			return true;
		} else if ($('span.result_body').text().indexOf('warrior wants to join your Army') >= 0) {
			this.runtime.gift.sender_ca_name = 'A Warrior';
			this.runtime.gift.name = 'Random Soldier';
			this.runtime.gift.id = 'random_soldier';
			console.log(warn(), this.runtime.gift.sender_ca_name + ' has a ' + this.runtime.gift.name + ' waiting for you.');
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
				console.log(warn(), 'Accepted ' + this.runtime.gift.name + ' from ' + this.runtime.gift.sender_ca_name + '(id:' + this.runtime.gift.sender_id + ')');
				received.push(this.runtime.gift); // add the gift to our list of received gifts.  We will use this to clear facebook notifications and possibly return gifts
				this.runtime.work = true;	// We need to clear our facebook notifications and/or return gifts
				this.runtime.gift = {}; // reset our runtime gift tracker
			}
		}
		// Check for gifts
//		console.log(warn(), 'Checking for waiting gifts and getting the id of the sender if we already have the sender\'s name.');
		if ($('div.messages').text().indexOf('a gift') >= 0) { // This will trigger if there are gifts waiting
			this.runtime.gift_waiting = true;
			if (!this.runtime.gift.id) { // We haven't gotten the info from the index page yet.
				return false;	// let the work function send us to the index page to get the info.
			}
//			console.log(warn(), 'Sender Name: ' + $('div.messages img[title*="' + this.runtime.gift.sender_ca_name + '"]').first().attr('title'));
			this.runtime.gift.sender_id = $('div.messages img[uid]').first().attr('uid'); // get the ID of the gift sender. (The sender listed on the index page should always be the first sender listed on the army page.)
			if (this.runtime.gift.sender_id) {
				this.runtime.gift.sender_fb_name = $('div.messages img[uid]').first().attr('title');
//				console.log(warn(), 'Found ' + this.runtime.gift.sender_fb_name + "'s ID. (" + this.runtime.gift.sender_id + ')');
			} else {
				console.log(log(), "Can't find the gift sender's ID: " + this.runtime.gift.sender_id);
			}
		} else {
//			console.log(warn(), 'No more waiting gifts. Did we miss the gift accepted page?');
			this.runtime.gift_waiting = false;
			this.runtime.gift = {}; // reset our runtime gift tracker
		}
	
	} else if (Page.page === 'gift_accept'){
		// Check for sent
//		console.log(warn(), 'Checking for sent gifts.');
		if (this.runtime.sent_id && $('div#app'+APPID+'_results_main_wrapper').text().indexOf('You have sent') >= 0) {
			console.log(warn(), gifts[this.runtime.sent_id].name+' sent.');
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
			$tmp = $('#app'+APPID+'_gift'+i);
			if ($tmp.length) {
				id = $('img', $tmp).attr('src').filepart();
				gifts[id] = {slot:i, name: $tmp.text().trim().replace('!','')};
//				console.log(warn('Adding: '+gifts[id].name+' ('+id+') to slot '+i));
			}
		}
	} else {
		if ($('div.result').text().indexOf('have exceed') !== -1){
			console.log(warn(), 'We have run out of gifts to send.  Waiting one hour to retry.');
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
//		console.log(warn(), 'Accepting ' + this.runtime.gift.name + ' from ' + this.runtime.gift.sender_ca_name + '(id:' + this.runtime.gift.sender_id + ')');
		if (!Page.to('army_invite', {act:'acpt', rqtp:'gift', uid:this.runtime.gift.sender_id}) || this.runtime.gift.sender_id.length > 0) {	// Shortcut to accept gifts without going through Facebook's confirmation page
			return QUEUE_CONTINUE;
		}
	}
	
	var i, j, k, todo = this.data.todo, received = this.data.received, gift_ids = [], random_gift_id, temptype;

	if (!received.length && (!length(todo) || (this.runtime.gift_delay > Date.now()))) {
		this.runtime.work = false;
		Page.to('keep_alchemy');
		return QUEUE_FINISH;
	}
	
	// We have received gifts so we need to figure out what to send back.
	if (received.length) {
		Page.to('army_gifts');
		// Fill out our todo list with gifts to send, or not.
		for (i = received.length - 1; i >= 0; i--){
			temptype = this.option.type;
			if (typeof this.data.gifts[received[i].id] === 'undefined' && this.option.type !== 'None') {
				console.log(warn(), received[i].id+' was not found in our sendable gift list.');
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
						console.log(warn(), 'Will randomly send a ' + this.data.gifts[gift_ids[random_gift_id]].name + ' to ' + received[i].sender_ca_name);
						if (!todo[gift_ids[random_gift_id]]) {
							todo[gift_ids[random_gift_id]] = [];
						}
						todo[gift_ids[random_gift_id]].push(received[i].sender_id);
					}
					this.runtime.work = true;
					break;
				case 'Same as Received':
					console.log(warn(), 'Will return a ' + received[i].name + ' to ' + received[i].sender_ca_name);
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
//		console.log(warn(), 'Waiting for FB popup.');
		if ($('div.dialog_buttons input[name="sendit"]').length){
			this.runtime.gift_sent = null;
			Page.click('div.dialog_buttons input[name="sendit"]');
		} else if ($('span:contains("Out of requests")').text().indexOf('Out of requests') >= 0) {
			console.log(warn(), 'We have run out of gifts to send.  Waiting one hour to retry.');
			this.runtime.gift_delay = Date.now() + 3600000;	// Wait an hour and try to send again.
			Page.click('div.dialog_buttons input[name="ok"]');
		}
		return QUEUE_CONTINUE;
	} else if (this.runtime.gift_sent) {
		this.runtime.gift_sent = null;
	}
	if ($('div.dialog_buttons input[name="skip_ci_btn"]').length) {     // Eventually skip additional requests dialog
		Page.click('div.dialog_buttons input[name="skip_ci_btn"]');
		return QUEUE_RELEASE;
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
				return QUEUE_RELEASE;
			}
			if (typeof this.data.gifts[i] === 'undefined') {  // Unknown gift in todo list
				gift_ids = [];
				for (j in this.data.gifts) {
					gift_ids.push(j);
				}
				random_gift_id = Math.floor(Math.random() * gift_ids.length);
				console.log(warn(), 'Unavaliable gift ('+i+') found in todo list. Will randomly send a ' + this.data.gifts[gift_ids[random_gift_id]].name + ' instead.');
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
						console.log(warn(), 'Sending out ' + this.data.gifts[i].name);
						k = 0;
						for (j=todo[i].length-1; j>=0; j--) {
							if (k< 10) {	// Need to limit to 10 at a time
								if (!$('div.unselected_list input[value=\'' + todo[i][j] + '\']').length){
//									console.log(warn(), 'User '+todo[i][j]+' wasn\'t in the CA friend list.');
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
Heal.data = null;

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

Heal.work = function(state) {
	if (Player.get('health') >= Player.get('maxhealth') || Player.get('stamina') < Heal.option.stamina || Player.get('health') >= Heal.option.health) {
		return QUEUE_FINISH;
	}
	if (!state || this.me()) {
		return QUEUE_CONTINUE;
	}
	return QUEUE_RELEASE;
};

Heal.me = function() {
	if (!Page.to('keep_stats')) {
		return true;
	}
	console.log(warn(), 'Healing...');
	if ($('input[value="Heal Wounds"]').length) {
		Page.click('input[value="Heal Wounds"]');
	} else {
		console.log(log(), 'Danger Danger Will Robinson... Unable to heal!');
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
/*	},{
		id:'arena',
		label:'Arena',
		select:Idle.when
*/	},{
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
	monsters:['monster_monster_list', 'battle_raid'],
	collect:['apprentice_collect']
};

Idle.work = function(state) {
	if (!state) {
		return true;
	}
	var i, p, time, now = Date.now();
	if (!Generals.to(this.option.general)) {
		return true;
	}
	for (i in this.pages) {
		if (!this.option[i]) {
			continue;
		}
		time = now - this.option[i];
		for (p=0; p<this.pages[i].length; p++) {
			if (!Page.get(this.pages[i][p]) || Page.get(this.pages[i][p]) < time) {
				if (!Page.to(this.pages[i][p])) {
					Page.set(this.pages[i][p], now);
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
Income.data = null;

Income.settings = {
	important:true
};

Income.defaults['castle_age'] = {};

Income.option = {
	general:true,
	bank:true,
	margin:45
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

Income.work = function(state) {
	if (!this.option.general || !Generals.test(Generals.best('income'))) {
		return QUEUE_FINISH;
	}
//	console.log(warn(), when + ', Margin: ' + Income.option.margin);
	if (Player.get('cash_timer') > this.option.margin) {
		if (state && this.option.bank && !Bank.stash()) {
			return QUEUE_CONTINUE;
		}
		return QUEUE_FINISH;
	}
	if (!state || !Generals.to('income')) {
		return QUEUE_CONTINUE;
	}
	console.log(warn(), 'Waiting for Income... (' + Player.get('cash_timer') + ' seconds)');
	return QUEUE_CONTINUE;
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
/********** Worker.Land **********
* Auto-buys property
*/
var Land = new Worker('Land');

Land.defaults['castle_age'] = {
	pages:'town_land'
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
	cost:0
};

Land.display = [
	{
		id:'enabled',
		label:'Auto-Buy Land',
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

Land.init = function(){
    this._watch(Player, 'data.worth');
	Resources.use('Gold');
};

Land.parse = function(change) {
	$('tr.land_buy_row,tr.land_buy_row_unique').each(function(i,el){
		var name = $('img', el).attr('alt'), tmp;
		if (!change) {
			// Fix for broken land page!!
			if (!$('.land_buy_image_int', el).length) {
				$('.land_buy_image', el).prepend('<div class="land_buy_image_int"></div>').children('.land_buy_image_int').append($('.land_buy_image >[class!="land_buy_image_int"]', el));
			}
			if (!$('.land_buy_info_int', el).length) {
				$('.land_buy_info, .land_buy_info2', el).prepend('<div class="land_buy_info_int"></div>').children('.land_buy_info_int').append($('.land_buy_info >[class!="land_buy_info_int"], .land_buy_info2 >[class!="land_buy_info_int"]', el));
			}
			Land.data[name] = {};
			Land.data[name].income = $('.land_buy_info .gold, .land_buy_info2 .gold', el).text().replace(/[^0-9]/g,'').regex(/([0-9]+)/);
			Land.data[name].max = $('.land_buy_info, .land_buy_info2', el).text().regex(/Max Allowed For your level: ([0-9]+)/i);
			Land.data[name].cost = $('.land_buy_costs .gold', el).text().replace(/[^0-9]/g,'').regex(/([0-9]+)/);
			tmp = $('option', $('.land_buy_costs .gold', el).parent().next()).last().attr('value');
			if (tmp) {
				Land.data[name].buy = tmp;
			}
			Land.data[name].own = $('.land_buy_costs span', el).text().replace(/[^0-9]/g,'').regex(/([0-9]+)/);
		} else {
			$('.land_buy_info strong:first, .land_buy_info2 strong:first', el).after(' (<span title="Return On Investment - higher is better"><strong>ROI</strong>: ' + ((Land.data[name].income * 100 * (Land.option.style ? 24 : 1)) / Land.data[name].cost).round(3) + '%' + (Land.option.style ? ' / Day' : '') + '</span>)');
		}
	});
	return true;
};

Land.update = function(event) {
	var i, worth = Bank.worth(), income = Player.get('income', 0) + History.get('income.mean'), best, buy = 0, cost_increase,time_limit;
	
	if (this.option.land_exp) {
		$('input:golem(land,sell)').attr('checked',true);
		this.option.sell = true;
	}
	
	for (i in this.data) {
		if (this.option.sell && this.data[i].max > 0 && this.data[i].own > this.data[i].max) {
			best = i;
			buy = this.data[i].max - this.data[i].own;// Negative number means sell
			if (this.option.land_exp) {
				buy = -10;
			}
			break;
		}
		if (this.data[i].buy) {
			if (!best || ((this.data[best].cost / income) + (this.data[i].cost / (income + this.data[best].income))) > ((this.data[i].cost / income) + (this.data[best].cost / (income + this.data[i].income)))) {
				best = i;
			}
		}
	}
	if (best) {
		if (!buy) {
	/*		if (this.option.onlyten || (this.data[best].cost * 10) <= worth || (this.data[best].cost * 10 / income < this.option.wait)) {
				buy = Math.min(this.data[best].max - this.data[best].own, 10);
			} else if ((this.data[best].cost * 5) <= worth || (this.data[best].cost * 5 / income < this.option.wait)) {
				buy = Math.min(this.data[best].max - this.data[best].own, 5);
			} else {
				buy = 1;
			}*/
			
			//	This calculates the perfect time to switch the amounts to buy.
			//	If the added income from a smaller purchase will pay for the increase in price before you can afford to buy again, buy small.
			//	In other words, make the smallest purchase where the time to make the purchase is larger than the time to payoff the increased cost with the extra income.
			//	It's different for each land because each land has a different "time to payoff the increased cost".
			
			cost_increase = this.data[best].cost / (10 + this.data[best].own);		// Increased cost per purchased land.  (Calculated from the current price and the quantity owned, knowing that the price increases by 10% of the original price per purchase.)
			time_limit = cost_increase / this.data[best].income;		// How long it will take to payoff the increased cost with only the extra income from the purchase.  (This is constant per property no matter how many are owned.)
			time_limit = time_limit * 1.5;		// fudge factor to take into account that most of the time we won't be buying the same property twice in a row, so we will have a bit more time to recoup the extra costs.
//			if (this.option.onlyten || (this.data[best].cost * 10) <= worth) {			// If we can afford 10, buy 10.  (Or if people want to only buy 10.)
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
		this.runtime.buy = buy;
		this.runtime.cost = buy * this.data[best].cost; // May be negative if we're making money by selling
		Dashboard.status(this, (buy>0 ? (this.runtime.buy ? 'Buying ' : 'Want to buy ') : (this.runtime.buy ? 'Selling ' : 'Want to sell ')) + Math.abs(buy) + 'x ' + best + ' for $' + Math.abs(this.runtime.cost).SI() + ' (Available Cash: $' + Bank.worth().SI() + ')');
	} else {
		Dashboard.status(this);
	}
	this.runtime.best = best;
};

Land.work = function(state) {
	if (!this.option.enabled || !this.runtime.best || !this.runtime.buy || !Bank.worth(this.runtime.cost)) {
		if (!this.runtime.best && this.runtime.lastlevel < Player.get('level')) {
			if (!state || !Page.to('town_land')) {
				return QUEUE_CONTINUE;
			}
			this.runtime.lastlevel = Player.get('level');
		}
                if (this.runtime.best && typeof this.runtime.best !== 'undefined'){
                    Dashboard.status(this, (this.runtime.buy>0 ? (this.runtime.buy ? 'Buying ' : 'Want to buy ') : (this.runtime.buy ? 'Selling ' : 'Want to sell ')) + Math.abs(this.runtime.buy) + 'x ' + this.runtime.best + ' for $' + Math.abs(this.runtime.cost).SI() + ' (Available Cash: $' + Bank.worth().SI() + ')');
                } else {
                    Dashboard.status(this);
                }
		return QUEUE_FINISH;
	}
	if (!state || !Bank.retrieve(this.runtime.cost) || !Page.to('town_land')) {
                return QUEUE_CONTINUE;
	}
//	var el = $('tr.land_buy_row:contains("'+this.runtime.best+'"),tr.land_buy_row_unique:contains("'+this.runtime.best+'")');
	$('tr.land_buy_row,tr.land_buy_row_unique').each(function(i,el){
		if ($('img', el).attr('alt') === Land.runtime.best) {
			if (Land.runtime.buy > 0) {
				$('select', $('.land_buy_costs .gold', el).parent().next()).val(Land.runtime.buy > 5 ? 10 : (Land.runtime.buy > 1 ? 5 : 1));
			} else {
				$('select', $('.land_buy_costs .gold', el).parent().parent().next()).val(Land.runtime.buy <= -10 ? 10 : (Land.runtime.buy <= -5 ? 5 : 1));
			}
			console.log(warn(), (Land.runtime.buy > 0 ? 'Buy' : 'Sell') + 'ing ' + Math.abs(Land.runtime.buy) + ' x ' + Land.runtime.best + ' for $' + Math.abs(Land.runtime.cost).SI());
			Page.click($('.land_buy_costs input[name="' + (Land.runtime.buy > 0 ? 'Buy' : 'Sell') + '"]', el));
		}
	});
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
LevelUp.data = null;

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
		id:'enabled',
		label:'Enabled',
		checkbox:true
	},{
		id:'general',
		label:'Best General',
		select:['any', 'Energy', 'Stamina', 'Manual'],
		help:'Select which type of general to use when leveling up.'
	},{
		advanced:true,
		id:'general_choice',
		label:'Use General',
		require:{'general':'Manual'},
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
		require:{'algorithm':'Manual'},
		text:true,
		help:'Experience per stamina point.  Defaults to Per Action if 0 or blank.'
	},{
		id:'manual_exp_per_energy',
		label:'Exp per energy',
		require:{'algorithm':'Manual'},
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

//		$('#app'+APPID+'_st_2_5 strong').attr('title', Player.get('exp') + '/' + Player.get('maxexp') + ' at ' + this.get('exp_average').round(1).addCommas() + ' per hour').html(Player.get('exp_needed').addCommas() + '<span style="font-weight:normal;"><span style="color:rgb(25,123,48);" name="' + this.get('level_timer') + '"> ' + this.get('time') + '</span></span>');
		$('#app'+APPID+'_st_2_5 strong').html('<span title="' + Player.get('exp', 0) + '/' + Player.get('maxexp', 1) + ' at ' + this.get('exp_average').round(1).addCommas() + ' per hour">' + Player.get('exp_needed', 0).addCommas() + '</span> <span style="font-weight:normal;color:rgb(25,123,48);" title="' + this.get('timer') + '">' + this.get('time') + '</span>');
	} else {
		$('.result_body').each(function(i,el){
			if (!$('img[src$="battle_victory.gif"]', el).length) {
				return;
			}
			var txt = $(el).text().replace(/,|\t/g, ''), x;
			x = txt.regex(/([+-][0-9]+) Experience/i);
			if (x) { History.add('exp+battle', x); }
			x = (txt.regex(/\+\$([0-9]+)/i) || 0) - (txt.regex(/\-\$([0-9]+)/i) || 0);
			if (x) { History.add('income+battle', x); }
			x = txt.regex(/([+-][0-9]+) Battle Points/i);
			if (x) { History.add('bp+battle', x); }
			x = txt.regex(/([+-][0-9]+) Stamina/i);
			if (x) { History.add('stamina+battle', x); }
			x = txt.regex(/([+-][0-9]+) Energy/i);
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
	if (this.option.enabled) {
		if (runtime.running) {
			Dashboard.status(this, '<span title="Exp Possible: ' + this.get('exp_possible') + ', per Hour: ' + this.get('exp_average').round(1).addCommas() + ', per Energy: ' + this.get('exp_per_energy').round(2) + ', per Stamina: ' + this.get('exp_per_stamina').round(2) + '">LevelUp Running Now!</span>');
		} else {
			Dashboard.status(this, '<span title="Exp Possible: ' + this.get('exp_possible') + ', per Energy: ' + this.get('exp_per_energy').round(2) + ', per Stamina: ' + this.get('exp_per_stamina').round(2) + '">' + this.get('time') + ' after <span class="golem-timer">' + this.get('timer')+ '</span> (at ' + this.get('exp_average').round(1).addCommas() + ' exp per hour)</span>');
		}
	} else {
		Dashboard.status(this);
	}
/*	if (!this.option.enabled || this.option.general === 'any') {
		Generals.set('runtime.disabled', false);
	}
*/};

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
Monster.data = {};

Monster.defaults['castle_age'] = {
	pages:'monster_monster_list keep_monster_active monster_battle_monster battle_raid'
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
		require:{'best_attack':false},
		select:'generals'
	},{
		advanced:true,
		id:'hide',
		label:'Use Raids and Monsters to Hide',
		checkbox:true,
		require:{'stop':['Never', 'Achievement', '2X Achievement', 'Continuous']},
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
		require:{'stop':'Priority List'},
		textarea:true,
		help:'Prioritized list of which monsters to attack'
	},{
		advanced:true,
		id:'own',
		label:'Never stop on Your Monsters',
		require:{'stop':['Never', 'Achievement', '2X Achievement', 'Continuous']},
		checkbox:true,
		help:'Never stop attacking your own summoned monsters (Ignores Stop option).'
	},{
		advanced:true,
		id:'rescue',
		require:{'stop':['Never', 'Achievement', '2X Achievement', 'Continuous']},
		label:'Rescue failing monsters',
		checkbox:true,
		help:'Attempts to rescue failing monsters even if damage is at or above Stop Optionby continuing to attack. Can be used in coordination with Lost-cause monsters setting to give up if monster is too far gone to be rescued.'
	},{
		advanced:true,
		id:'avoid_lost_cause',
		label:'Avoid Lost-cause Monsters',
		require:{'stop':['Never', 'Achievement', '2X Achievement', 'Continuous']},
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
		select:[1,5,10,20,50],
		help:'Select the minimum stamina for a single attack'
	},{
		id:'attack_max',
		label:'Max Stamina Cost',
		select:[1,5,10,20,50],
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
				require:{'best_defend':false},
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
				select:[10,20,40,100],
				help:'Select the minimum energy for a single energy action'
			},{
				id:'defend_max',
				label:'Max Energy Cost',
				select:[10,20,40,100],
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
		require:{'best_raid':false},
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
		require:{'raid':[['Duel', 'Duel x5']]},
		label:'Target Army Ratio',
		select:['Any', 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.1, 1.2, 1.3, 1.4, 1.5],
		help:'Smaller number for smaller target army. Reduce this number if you\'re losing in Invade'
	},{
		id:'levelratio',
		require:{'raid':[['Invade', 'Invade x5']]},
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
		attack:[1,5]
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
		attack:[1,5]
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
		attack:[1,5]
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
		defense_img:'shield_img'
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
		attack:[1,5]
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
		attack:[1,5]
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
		attack:[1,5]
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
		attack:[1,5]
	},
	dragon_red: {
		name:'Ancient Red Dragon',
		list:'dragon_list_red.jpg',
		image:'dragon_monster_red.jpg',
		dead:'dead_dragon_image_red.jpg',
		achievement:100000,
		timer:259200, // 72 hours
		mpool:2,
		attack_button:'input[name="Attack Dragon"]',
		siege:false,
		attack:[1,5]
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
		attack:[1,5],
		defend_button:'input[name="Defend against Monster"]',
		defend:[10]
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
		attack:[1,5],
		defend_button:'input[name="Defend against Monster"]',
		defend:[10]
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
		attack:[1,5],
		defend_button:'input[name="Defend against Monster"]',
		defend:[10]
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
		attack:[1,5],
		defend_button:'input[name="Defend against Monster"]',
		defend:[10]
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
		attack:[1,5,10,20,50]
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
		defend:[10,10,20,40,100]
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
		defense_img:'shield_img'
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
		defend:[10,20,40,100]
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
		defend:[10,20,40,100]
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
		defend:[10,20,40,100]
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
		defend:[10,20,40,100],
		orcs:true
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


Monster.init = function() {
	var i, str;
	this._watch(Player, 'data.health');
	this._watch(Player, 'data.energy');
	this._watch(Player, 'data.stamina');
	this._watch(Queue, 'runtime'); // BAD!!! Shouldn't be touching queue!!!
	this._revive(60);
	this.runtime.limit = 0;
	Resources.use('Energy');
	Resources.use('Stamina');
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
	var mid, uid, type, type_label, $health, $defense, $dispel, $secondary, dead = false, monster, timer, ATTACKHISTORY = 20, data = this.data, types = this.types, now = Date.now(), ensta = ['energy','stamina'], i, x;
	if (Page.page === 'keep_monster_active' || Page.page === 'monster_battle_monster') { // In a monster or raid
		uid = $('img[linked][size="square"]').attr('uid');
		//console.log(warn(), 'Parsing for Monster type');
		for (i in types) {
			if (types[i].dead && $('#app'+APPID+'_app_body img[src$="'+types[i].dead+'"]').length && (!types[i].title || $('div[style*="'+types[i].title+'"]').length)) {
				//console.log(warn(), 'Found a dead '+i);
				type_label = i;
				timer = types[i].timer;
				dead = true;
				break;
			} else if (types[i].image && $('#app'+APPID+'_app_body img[src$="'+types[i].image+'"],div[style*="'+types[i].image+'"]').length) {
				//console.log(warn(), 'Parsing '+i);
				type_label = i;
				timer = types[i].timer;
				break;
			} else if (types[i].image2 && $('#app'+APPID+'_app_body img[src$="'+types[i].image2+'"],div[style*="'+
			types[i].image2+'"]').length) {
				//console.log(warn(), 'Parsing second stage '+i);
				type_label = i;
				timer = types[i].timer2 || types[i].timer;
				break;
			}
		}
		if (!uid || !type_label) {
			console.log(warn(), 'Unknown monster (probably dead)');
			return false;
		}
		mid = uid+'_'+(types[i].mpool || 4);
		if (this.runtime.check === mid) {
			this.runtime.check = false;
		}
		monster = data[mid] = data[mid] || {};
		monster.type = type_label;
		type = types[type_label];
		monster.last = now;
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
		if (!monster.name) {
			if ((x = $('#app' + APPID + '_app_body div[style*="/dragon_title_owner."]')).length
				|| (x = $('#app' + APPID + '_app_body div[style*="/nm_top."]')).length) {
				i = x.text().trim();
				if (isString(x = i.regex(this.name_re)) || isString(x = i.regex(this.name2_re))) {
					monster.name = x.trim();
				}
			}
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
		monster.timer = $('#app'+APPID+'_monsterTicker').text().parseTimer();
		monster.finish = now + (monster.timer * 1000);
		monster.damage.siege = 0;
		monster.damage.others = 0;
		if (!dead &&$('input[name*="help with"]').length && $('input[name*="help with"]').attr('title')) {
			//console.log(warn(), 'Current Siege Phase is: '+ this.data[mid].phase);
			monster.phase = $('input[name*="help with"]').attr('title').regex(/ (.*)/i);
			//console.log(warn(), 'Assisted on '+monster.phase+'.');
		}
		$('img[src*="siege_small"]').each(function(i,el){
			var /*siege = $(el).parent().next().next().next().children().eq(0).text(),*/ dmg = $(el).parent().next().next().next().children().eq(1).text().replace(/[^0-9]/g,'').regex(/([0-9]+)/);
			//console.log(warn(), 'Monster Siege',siege + ' did ' + dmg.addCommas() + ' amount of damage.');
			monster.damage.siege += dmg / (types[type_label].orcs ? 1000 : 1);
		});
		$('td.dragonContainer table table a[href^="http://apps.facebook.com/castle_age/keep.php?casuser="]').each(function(i,el){
			var user = $(el).attr('href').regex(/user=([0-9]+)/i), tmp, dmg, fort;
			if (types[type_label].raid){
				tmp = $(el).parent().next().text().replace(/[^0-9\/]/g,'');
			} else {
				tmp = $(el).parent().parent().next().text().replace(/[^0-9\/]/g,'');
			}
			dmg = tmp.regex(/([0-9]+)/);
			fort = tmp.regex(/\/([0-9]+)/);
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
			monster.total = sum(monster.damage) + $('div[style*="monster_health_back.jpg"] div:nth-child(2)').text().regex(/([0-9]+)/);
		} else {
			monster.total = Math.ceil(100 * sum(monster.damage) / (monster.health === 100 ? 0.1 : (100 - monster.health)));
		}
		monster.eta = now + (Math.floor((monster.total - sum(monster.damage)) / monster.dps) * 1000);
	} else {
		this.runtime.used.stamina = 0;
		this.runtime.used.energy = 0;
		if (Page.page === 'monster_monster_list' || Page.page === 'battle_raid') { // Check monster / raid list
			if ($('div[style*="no_monster_back.jpg"]').attr('style')){
				console.log(warn(), 'Found a timed out monster.');
				if (this.runtime.mid) {
					console.log(warn(), 'Deleting ' + data[this.runtime.mid].name + "'s " + data[this.runtime.mid].type);
					delete data[this.runtime.mid];
				} else {
					console.log(warn(), 'Unknown monster (timed out)');
				}
				this.runtime.check = false;
				return false;
			}
			this.runtime.check = false;

			if (!$('#app'+APPID+'_app_body div.imgButton').length) {
				return false;
			}
			for (mid in data) {
				if (	(types[data[mid].type].raid
							? Page.page === 'battle_raid'
							: Page.page === 'monster_monster_list')
						&& (data[mid].state === 'complete'
							|| data[mid].state === 'reward'
							|| (data[mid].state === 'assist'
								&& data[mid].finish < now))
					) {
					data[mid].state = null;
				}
			}
			$('#app'+APPID+'_app_body div.imgButton').each(function(a,el){
				if ($('a', el).attr('href')
						&& $('a', el).attr('href').regex(/casuser=([0-9]+)/i)) {
					var i, uid = $('a', el).attr('href').regex(/casuser=([0-9]+)/i), tmp = $(el).parent().parent().children().eq(1).html().regex(/graphics\/([^.]*\....)/i), type_label = null;
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
					mid = uid+'_'+(types[i].mpool || 4);
					data[mid] = data[mid] || {};
					data[mid].type = type_label;
					if (uid === userID) {
						data[mid].name = 'You';
					} else {
						tmp = $(el).parent().parent().children().eq(2).text().trim();
						data[mid].name = tmp.regex(/(.+)'s /i);
					}
					switch($('img', el).attr('src').regex(/dragon_list_btn_([0-9])/)) {
						case 2:
							data[mid].state = 'reward';
							break;
						case 3:
							data[mid].state = 'engage';
							break;
						case 4:
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
	var i, mid, uid, type, stat_req, req_stamina, req_health, req_energy, messages = [], fullname = {}, list = {}, listSortFunc, matched_mids = [], min, max, limit, filter, ensta = ['energy','stamina'], defatt = ['defend','attack'], button_count, monster, damage, target, now = Date.now(), waiting_ok;
	this.runtime.mode = this.runtime.stat = this.runtime.check = this.runtime.message = this.runtime.mid = null;
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
		this.runtime.multiplier[defatt[i]] = (Generals.get([Queue.runtime.general || (Generals.best(this.option['best_' + defatt[i]] ? ('monster_' + defatt[i]) : this.option['general_' + defatt[i]])), 'skills'], '').regex(/Increase Power Attacks by ([0-9]+)/i) || 1);
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
					monster.ac = /:ac\b/.test(condition);
					if (monster.state !== 'engage') {
						continue;
					}
					matched_mids.push(mid);
					//Monster is a match so we set the conditions
					monster.max = this.conditions('max',condition);
					monster.ach = this.conditions('ach',condition) || type.achievement;
					monster.attack_min = this.conditions('a%',condition) || this.option.min_to_attack;
					if (monster.max !== false) {
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
							: Math.min(type.attack[Math.min(button_count,type.attack.length)-1], Math.max(type.attack[0], Queue.runtime.basehit || this.option.attack_min)) * this.runtime.multiplier.attack;
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
					: Math.min(type.attack[Math.min(button_count,type.attack.length)-1], Math.max(type.attack[0], Queue.runtime.basehit || this.option.attack_min)) * this.runtime.multiplier.attack;
			req_health = type.raid ? (this.option.risk ? 13 : 10) : 10; // Don't want to die when attacking a raid
			monster.ach = (this.option.stop === 'Achievement') ? type.achievement : (this.option.stop === '2X Achievement') ? type.achievement : (this.option.stop === 'Continuous') ? type.achievement :0;
			monster.max = (this.option.stop === 'Achievement') ? type.achievement : (this.option.stop === '2X Achievement') ? type.achievement*2 : (this.option.stop === 'Continuous') ? type.achievement*this.runtime.limit :0;
			if (	!monster.ignore
					&& monster.state === 'engage'
					&& monster.finish > Date.now()	) {
				uid = mid.replace(/_\d+/,'');
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
			uid = mid.replace(/_\d+/,'');
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
				uid = mid.replace(/_\d+/,'');
				type = this.types[monster.type];
				if (monster.state === 'reward' && monster.ac) {
					this.page(mid, 'Collecting Reward from ', 'casuser','&action=collectReward');
				} else if (monster.remove && this.option.remove && parseFloat(uid) !== userID) {
					//console.log(warn(), 'remove ' + mid + ' userid ' + userID + ' uid ' + uid + ' now ' + (uid === userID) + ' new ' + (parseFloat(uid) === userID));
					this.page(mid, 'Removing ', 'remove_list','');
				} else if (monster.last < Date.now() - this.option.check_interval) {
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
		this.runtime.check = this.runtime.limit = this.runtime.message = this.runtime.dead = false;
		return QUEUE_RELEASE;
	}
	if (mode === 'defend' && Queue.get('runtime.quest')) {
		return QUEUE_NO_ACTION;
	}	
	uid = this.runtime[mode].replace(/_\d+/,'');
	monster = this.data[this.runtime[mode]];
	type = this.types[monster.type];
	if (this.runtime[stat]>Queue.runtime[stat] 
			&& (!Queue.runtime.basehit 
				|| this.runtime[stat] === Queue.runtime.basehit * this.runtime.multiplier[mode])) {
		console.log(warn(), 'Waiting for ' + stat + ' burn to catch up ' + this.runtime[stat] + ' burn ' + Queue.runtime[stat]);
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
	if (!btn || !btn.length ||
			(Page.page !== 'keep_monster_active'
				&& Page.page !== 'monster_battle_monster')
			|| ($('div[style*="dragon_title_owner"] img[linked]').attr('uid') !== uid
				&& $('div[style*="nm_top"] img[linked]').attr('uid') !== uid)) {
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
		target_info = $('div[id*="raid_atk_lst0"] div div').text().regex(/Lvl\s*([0-9]+).*Army: ([0-9]+)/);
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
	uid = mid.replace(/_\d+/,'');
	type = this.types[monster.type];
	if (message) {
		this.runtime.message = message + (monster.name ? (monster.name === 'You' ? 'your' : monster.name.html_escape() + '\'s') : '')
				+ ' ' + type.name;
		Dashboard.status(this, this.runtime.message);
	}
	this.runtime.page = type.raid ? 'battle_raid' : 'monster_battle_monster';
	this.runtime.check = prefix + '=' + uid
			+ ((monster.phase && this.option.assist
				&& !Queue.runtime.levelup
				&& (monster.state === 'engage' || monster.state === 'assist'))
					? '&action=doObjective' : '')
			+ (type.mpool ? '&mpool=' + type.mpool : '') + suffix;
};


Monster.order = null;
Monster.dashboard = function(sort, rev) {
	var i, j, o, type, monster, args, list = [], output = [], sorttype = [null, 'name', 'health', 'defense', null, 'timer', 'eta'], state = {
		engage:0,
		assist:1,
		reward:2,
		complete:3
	}, blank, image_url, color, mid, uid, title, vv;
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
		uid = this.order[o].replace(/_\d+/,'');
		monster = this.data[this.order[o]];
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
		if (Monster.option.assist_links && (monster.state === 'engage' || monster.state === 'assist')) {
			args = '?user=' + uid + '&action=doObjective' + (type.mpool ? '&mpool=' + type.mpool : '');
		} else {
			args = '?user=' + uid + (type.mpool ? '&mpool=' + type.mpool : '');
		}

		// link icon
		td(output, Page.makeLink(type.raid ? 'raid.php' : 'battle_monster.php', args, '<img src="' + imagepath + type.list + '" style="width:72px;height:20px; position: relative; left: -8px; opacity:.7;" alt="' + type.name + '"><strong class="overlay">' + monster.state + '</strong>'), 'title="' + type.name + ' | Achievement: ' + (monster.ach || type.achievement).addCommas() + (monster.max?' | Max: ' + monster.max.addCommas():'') + '"');
		image_url = imagepath + type.list;
		//console.log(warn(), image_url);

		// user
		if (isString(monster.name)) {
			vv = monster.name.html_escape();
		} else {
			vv = '{id:' + uid + '}';
		}
		th(output, '<a class="golem-monster-ignore" name="'+this.order[o]+'" title="Toggle Active/Inactive"'+(monster.ignore ? ' style="text-decoration: line-through;"' : '')+'>' + vv + '</a>');

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
		title = (isNumber(monster.strength)
					? 'Max: '+ monster.strength.round(1) +'% '
					: '')
				+ (isNumber(monster.defense)
						? 'Attack Bonus: ' + (monster.defense.round(1) - 50)+'%'
						: '');

		// defense
		td(output,
			blank
				? ''
				: isNumber(monster.defense)
					? (monster.defense.round(1))+'%'
					: '',
			(title
				? 'title="' + title + '"'
				: '')
				);
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
					? '<span class="golem-timer">' + makeTimer((monster.finish - Date.now()) / 1000) + '</span>'
					: '?');

		// etd
		td(output,
			blank
				? ''
				: '<span class="golem-timer">' + (monster.health === 100
					? makeTimer((monster.finish - Date.now()) / 1000)
					: makeTimer((monster.eta - Date.now()) / 1000)) + '</span>');
		th(output, '<a class="golem-monster-delete" name="'+this.order[o]+'" title="Delete this Monster from the dashboard">[x]</a>');
		th(output, '<a class="golem-monster-override" name="'+this.order[o]+'" title="Override Lost Cause setting for this monster">'+(monster.override ? '[O]' : '[]')+'</a>');
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
};/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
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
News.data = null;

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
		$('#app'+APPID+'_battleUpdateBox .alertsContainer .alert_content').each(function(i,el) {
			var uid, txt = $(el).text().replace(/,/g, ''), title = $(el).prev().text(), days = title.regex(/([0-9]+) days/i), hours = title.regex(/([0-9]+) hours/i), minutes = title.regex(/([0-9]+) minutes/i), seconds = title.regex(/([0-9]+) seconds/i), time, my_xp = 0, my_bp = 0, my_wp = 0, my_cash = 0, result;
			time = Date.now() - ((((((((days || 0) * 24) + (hours || 0)) * 60) + (minutes || 59)) * 60) + (seconds || 59)) * 1000);
			if (txt.regex(/You were killed/i)) {
				killed = true;
				deaths++;
			} else {
				uid = $('a:eq(0)', el).attr('href').regex(/user=([0-9]+)/i);
				user[uid] = user[uid] || {name:$('a:eq(0)', el).text(), win:0, lose:0, deaths:0};
				result = null;
				if (txt.regex(/Victory!/i)) {
					win++;
					user[uid].lose++;
					my_xp = txt.regex(/([0-9]+) experience/i);
					my_bp = txt.regex(/([0-9]+) Battle Points!/i);
					my_wp = txt.regex(/([0-9]+) War Points!/i);
					my_cash = txt.regex(/\$([0-9]+)/i);
					result = 'win';
				} else {
					lose++;
					user[uid].win++;
					my_xp = 0 - txt.regex(/([0-9]+) experience/i);
					my_bp = 0 - txt.regex(/([0-9]+) Battle Points!/i);
					my_wp = 0 - txt.regex(/([0-9]+) War Points!/i);
					my_cash = 0 - txt.regex(/\$([0-9]+)/i);
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
				list.push('<a class="golem-link" href="http://apps.facebook.com/castle_age/keep.php?casuser=' + i + '">' + user[i].name + '</a> <a target="_blank" href="http://www.facebook.com/profile.php?id=' + i + '">' + makeImage('facebook') + '</a> ' + (user[i].win ? 'beat you <span class="negative">' + user[i].win + '</span> time' + plural(user[i].win) : '') + (user[i].lose ? (user[i].win ? (user[i].deaths ? ', ' : ' and ') : '') + 'was beaten <span class="positive">' + user[i].lose + '</span> time' + plural(user[i].lose) : '') + (user[i].deaths ? (user[i].win || user[i].lose ? ' and ' : '') + 'killed you <span class="negative">' + user[i].deaths + '</span> time' + plural(user[i].deaths) : '') + '.');
			}
			$('#app'+APPID+'_battleUpdateBox  .alertsContainer').prepend('<div style="padding: 0pt 0pt 10px;"><div class="alert_title">Summary:</div><div class="alert_content">' + list.join('<br>') + '</div></div>');
		}
	}
	return true;
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
Player.option = null;

Player.settings = {
	keep:true
};

Player.defaults['castle_age'] = {
	pages:'*'
};

Player.runtime = {
	cash_timeout:null,
	energy_timeout:null,
	health_timeout:null,
	stamina_timeout:null
};

var use_average_level = false;

Player.init = function() {
	// Get the gold timer from within the page - should really remove the "official" one, and write a decent one, but we're about playing and not fixing...
	// gold_increase_ticker(1418, 6317, 3600, 174738470, 'gold', true);
	// function gold_increase_ticker(ticks_left, stat_current, tick_time, increase_value, first_call)
	var when = new Date(script_started + ($('*').html().regex(/gold_increase_ticker\(([0-9]+),/) * 1000)), tmp;
	when = when.getSeconds() + (when.getMinutes() * 60);
	tmp = this.data.cash_time || when;
	if (tmp > 3600) {// Fix for bad previous data!!!
		tmp = when;
	}
	if (when > tmp) {
		tmp += Math.min(10, Math.sqrt(when - tmp));
	} else if (when < tmp) {
		tmp -= Math.min(10, Math.sqrt(tmp - when));
	}
	this.set('cash_time', tmp);
	this.runtime.cash_timeout = null;
	this.runtime.energy_timeout = null;
	this.runtime.health_timeout = null;
	this.runtime.stamina_timeout = null;
	this._trigger('#app'+APPID+'_gold_current_value', 'cash');
	this._trigger('#app'+APPID+'_energy_current_value', 'energy');
	this._trigger('#app'+APPID+'_stamina_current_value', 'stamina');
	this._trigger('#app'+APPID+'_health_current_value', 'health');
	Resources.add('Energy');
	Resources.add('Stamina');
	Resources.add('Gold');
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
};

Player.parse = function(change) {
	if (change) {
		return false;
	}
	if (!('#app'+APPID+'_main_bntp').length) {
		Page.reload();
		return;
	}
	var self = this, data = this.data, keep, stats, tmp;
	if ($('#app'+APPID+'_energy_current_value').length) {
		this.set('energy', $('#app'+APPID+'_energy_current_value').text().regex(/([0-9]+)/) || 0);
		Resources.add('Energy', data.energy, true);
	}
	if ($('#app'+APPID+'_stamina_current_value').length) {
		this.set('stamina', $('#app'+APPID+'_stamina_current_value').text().regex(/([0-9]+)/) || 0);
		Resources.add('Stamina', data.stamina, true);
	}
	if ($('#app'+APPID+'_health_current_value').length) {
		this.set('health', $('#app'+APPID+'_health_current_value').text().regex(/([0-9]+)/) || 0);
	}
	if ($('#app'+APPID+'_st_2_5 strong:not([title])').length) {
		tmp = $('#app'+APPID+'_st_2_5').text().regex(/([0-9]+)\s*\/\s*([0-9]+)/);
		if (tmp) {
			this.set('exp', tmp[0]);
			this.set('maxexp', tmp[1]);
		}
	}
	this.set('cash', $('#app'+APPID+'_gold_current_value').text().replace(/[^0-9]/g, '').regex(/([0-9]+)/));
	this.set('level', $('#app'+APPID+'_st_5').text().regex(/Level: ([0-9]+)!/i));
	this.set('armymax', $('a[href*=army.php]', '#app'+APPID+'_main_bntp').text().regex(/([0-9]+)/));
	this.set('army', Math.min(data.armymax, 501)); // XXX Need to check what max army is!
	this.set('upgrade', $('a[href*=keep.php]', '#app'+APPID+'_main_bntp').text().regex(/([0-9]+)/) || 0);
	this.set('general', $('div.general_name_div3').first().text().trim());
	this.set('imagepath', $('#app'+APPID+'_globalContainer img:eq(0)').attr('src').pathpart());
	if (Page.page==='keep_stats') {
		keep = $('div.keep_attribute_section').first(); // Only when it's our own keep and not someone elses
		if (keep.length) {
			this.set('myname', $('div.keep_stat_title_inc > span', keep).text().regex(/"(.*)"/));
			this.set('rank', $('td.statsTMainback img[src*=rank_medals]').attr('src').filepart().regex(/([0-9]+)/));
			stats = $('div.attribute_stat_container', keep);
			this.set('maxenergy', $(stats).eq(0).text().regex(/([0-9]+)/));
			this.set('maxstamina', $(stats).eq(1).text().regex(/([0-9]+)/));
			this.set('attack', $(stats).eq(2).text().regex(/([0-9]+)/));
			this.set('defense', $(stats).eq(3).text().regex(/([0-9]+)/));
			this.set('maxhealth', $(stats).eq(4).text().regex(/([0-9]+)/));
			this.set('bank', parseInt($('td.statsTMainback b.money').text().replace(/[^0-9]/g,''), 10));
			stats = $('.statsTB table table:contains("Total Income")').text().replace(/[^0-9$]/g,'').regex(/([0-9]+)\$([0-9]+)\$([0-9]+)/);
			this.set('maxincome', stats[0]);
			this.set('upkeep', stats[1]);
			this.set('income', stats[2]);
			Resources.add('Gold', data.bank + data.cash, true);

			// remember artifacts - useful for quest requirements

			if ((tmp = $('div.statsT2 td.statsTMainback .statsTTitle:contains("ARTIFACTS") + .statsTMain')).length === 1) {
				self.set('data.artifact', {});
				$('.statUnit a img', tmp).each(function(a, el) {
					/*jslint onevar:false*/
					var n = ($(el).attr('title') || $(el).attr('alt') || '').trim();
					var i = $(el).attr('src').filepart();
					/*jslint onevar:true*/
					if (n) {
						self.set(['data', 'artifact', n], i);
					}
				});
			}
		}
	}
	if (Page.page==='town_land') {
		stats = $('.mContTMainback div:last-child');
		this.set('income', stats.eq(stats.length - 4).text().replace(/[^0-9]/g,'').regex(/([0-9]+)/));
	}
	$('span.result_body').each(function(i,el){
		var txt = $(el).text().replace(/,|\s+|\n/g, '');
		History.add('income', sum(txt.regex(/Gain.*\$([0-9]+).*Cost|stealsGold:\+\$([0-9]+)|Youreceived\$([0-9]+)|Yougained\$([0-9]+)/i)));
		if (txt.regex(/incomepaymentof\$([0-9]+)gold/i)){
			History.set('land', sum(txt.regex(/incomepaymentof\$([0-9]+)gold|backinthemine:Extra([0-9]+)Gold|Yousuccessfullysold.*for$([0-9]+)/i)));
		}
	});
	this.set('worth', this.get('cash', 0) + this.get('bank', 0));
	$('#app'+APPID+'_gold_current_value').attr('title', 'Cash in Bank: $' + this.get('bank', 0).addCommas());
	return false;
};

Player.update = function(event) {
	if (event.type === 'data' || event.type === 'init') {
		var i, j, types = ['stamina', 'energy', 'health'], list, step;
		for (j=0; j<types.length; j++) {
			list = [];
			step = Divisor(Player.data['max'+types[j]]);
			for (i=0; i<=Player.data['max'+types[j]]; i+=step) {
				list.push(i);
			}
			Config.set(types[j], list);
		}
		History.set('bank', this.data.bank);
		History.set('exp', this.data.exp);
	} else if (event.type === 'trigger') {
		this.set(['data', event.id], $(event.selector).text().replace(/[^0-9]/g, '').regex(/([0-9]+)/));
	}
	Dashboard.status(this);
};

Player.get = function(what) {
	var data = this.data, when;
	switch(what) {
//		case 'cash_timer':		return $('#app'+APPID+'_gold_time_value').text().parseTimer();
		case 'cash_timer':		when = new Date();
								return (3600 + data.cash_time - (when.getSeconds() + (when.getMinutes() * 60))) % 3600;
		case 'energy_timer':	return $('#app'+APPID+'_energy_time_value').text().parseTimer();
		case 'health_timer':	return $('#app'+APPID+'_health_time_value').text().parseTimer();
		case 'stamina_timer':	return $('#app'+APPID+'_stamina_time_value').text().parseTimer();
		case 'exp_needed':		return data.maxexp - data.exp;
		case 'bank':			return (data.bank - Bank.option.keep > 0) ? data.bank - Bank.option.keep : 0;
		case 'bsi':				return ((data.attack + data.defense) / data.level).round(2);
		case 'lsi':				return (((data.maxstamina * 2) + data.maxenergy) / data.level).round(2);
		case 'csi':				return ((data.attack + data.defense + (data.maxstamina * 2) + data.maxenergy + data.maxhealth - 100) / data.level).round(2);
		default: return this._get(what);
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

Potions.defaults['castle_age'] = {
	pages:'*'
};

Potions.option = {
	energy:35,
	stamina:35
};

Potions.runtime = {
	drink:false
};

Potions.display = [
	{
		id:'energy',
		label:'Maximum Energy Potions',
		select:{0:0,5:5,10:10,15:15,20:20,25:25,30:30,35:35,39:39,infinite:'&infin;'},
		help:'Will use them when you have to many, if you collect more than 40 they will be lost anyway'
	},{
		id:'stamina',
		label:'Maximum Stamina Potions',
		select:{0:0,5:5,10:10,15:15,20:20,25:25,30:30,35:35,39:39,infinite:'&infin;'},
		help:'Will use them when you have to many, if you collect more than 40 they will be lost anyway'
	}
];

Potions.parse = function(change) {
	// No need to parse out Income potions as about to visit the Keep anyway...
	$('.result_body:contains("You have acquired the Energy Potion!")').each(function(i,el){
		Potions.data['Energy'] = (Potions.data['Energy'] || 0) + 1;
	});
	if (Page.page === 'keep_stats' && $('div.keep_attribute_section').length) {// Only our own keep
		this.data = {}; // Reset potion count completely at the keep
		$('.statUnit', $('.statsTTitle:contains("CONSUMABLES")').next()).each(function(i,el){
			var info = $(el).text().replace(/\s+/g, ' ').trim().regex(/(.*) Potion x ([0-9]+)/i);
			if (info && info[0] && info[1]) {
				Potions.data[info[0]] = info[1];
			}
		});
	}
	return false;
};

Potions.update = function(event) {
	var i, txt = [], levelup = LevelUp.get('runtime.running');
	this.runtime.drink = false;
	if (!this.get(['option', '_disabled'], false)) {
		for(i in this.data) {
			if (this.data[i]) {
				txt.push(makeImage('potion_'+i.toLowerCase()) + this.data[i] + '/' + this.option[i.toLowerCase()] + '<a class="golem-potion-drink" name="'+i+'" title="Drink one of this potion">' + ((this.runtime.type)?'[Don\'t Drink]':'[Drink]') + '</a>');
			}
			if (!levelup && isNumber(this.option[i.toLowerCase()]) && this.data[i] > this.option[i.toLowerCase()] && (Player.get(i.toLowerCase()) || 0) + 10 < (Player.get('max' + i.toLowerCase()) || 0)) {
				this.runtime.drink = true;
			}
		}
	}
        if (this.runtime.type){
            txt.push('Going to drink ' + this.runtime.amount + ' ' + this.runtime.type + ' potion.');
        }
	Dashboard.status(this, txt.join(', '));
        $('a.golem-potion-drink').live('click', function(event){
		var x = $(this).attr('name');
                var act = $(this).text().regex(/(.*)/);
		//console.log(warn(), 'Clicked on ' + x);
                //console.log(warn(), 'Action = ' + act);
                switch (act){
                    case '[Drink]':
                        //console.log(warn(), 'Setting Runtime');
                        Potions.runtime.type = x;
                        Potions.runtime.amount = 1;
                        break;
                    default:
                        //console.log(warn(), 'Clearing Runtime');
                        Potions.runtime.type = Potions.runtime.amount = null;
                }
                
                
	});
};

Potions.work = function(state) {
	if (!this.runtime.drink && !this.runtime.type) {
		return QUEUE_FINISH;
	}
	if (!state || !Page.to('keep_stats')) {
		return QUEUE_CONTINUE;
	}
	for(var i in this.data) {
		if (typeof this.option[i.toLowerCase()] === 'number' && this.data[i] > this.option[i.toLowerCase()]) {
			console.log(warn(), 'Wanting to drink a ' + i + ' potion');
			Page.click('.statUnit:contains("' + i + '") form .imgButton input');
			break;
		}
	}
        if (this.runtime.type && this.runtime.amount){
                console.log(warn(), 'Wanting to drink a ' + this.runtime.type + ' potion');
		Page.click('.statUnit:contains("' + this.runtime.type + '") form .imgButton input');
                this.runtime.type = this.runtime.amount = null;
        }
	return QUEUE_RELEASE;
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

Quest.defaults['castle_age'] = {
	pages:'quests_quest1 quests_quest2 quests_quest3 quests_quest4 quests_quest5 quests_quest6 quests_quest7 quests_quest8 quests_quest9 quests_quest10 quests_quest11 quests_demiquests quests_atlantis'
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
};

Quest.land = ['Land of Fire', 'Land of Earth', 'Land of Mist', 'Land of Water', 'Demon Realm', 'Undead Realm', 'Underworld', 'Kingdom of Heaven', 'Ivory City', 'Earth II', 'Water II'];
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
		require:{'general':false},
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
		help:'Once you have unlocked all areas (Advancement) it will switch to Influence. Once you have 100% Influence it will switch to Experience. Cartigan will try to collect all items needed to summon Cartigan (via Alchemy), then will fall back to Advancement. Vampire Lord will try to collect 24, then fall back to Advancement. Subquests will only run subquests under 100% then fall back to Advancement (quick general levelling)'
	},{
		advanced:true,
		id:'ignorecomplete',
		label:'Only do incomplete quests',
		checkbox:true,
		help:'Will only do quests that aren\'t at 100% influence',
		require:{'what':['Cartigan', 'Vampire Lord']}
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
	Resources.use('Energy');

	// one time pre-r845 fix for erroneous values in m_c, m_d, reps, eff
	if ((runtime.revision || 0) < 845) {
		for (i in data) {
			if (data[i].reps) {
				r = 'reps_' + (isNumber(data[i].land) ? (data[i].land + 1) : data[i].area);
				j = i.toLowerCase();
				x = (this.rdata[j] && this.rdata[j][r]) || 16;
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
};

Quest.parse = function(change) {
	var data = this.data, last_main = 0, area = null, land = null, i, m_c, m_d, m_i, reps, purge, changes = 0;
/*
<div style="float: left; height: 75px; width: 431px;">
	<div style="clear: both;"></div>
	<div class="title_tab">
		<a href="http://apps.facebook.com/castle_age/quests.php?land=9"><div class="imgButton"><img title="click to go to this land" id="app46755028429_land_image9" src="http://image2.castleagegame.com/2189/graphics/tab_ivory_small.gif" fbcontext="a8949d231744"></div></a>							                    			</div>
	<div class="title_tab">
		<a href="http://apps.facebook.com/castle_age/quests.php?land=10"><div class="imgButton"><img title="click to go to this land" id="app46755028429_land_image10" src="http://image2.castleagegame.com/2189/graphics/tab_earth2_small.gif" fbcontext="a8949d231744"></div></a>							                    			</div>
	<div class="title_tab_selected">
		<a href="http://apps.facebook.com/castle_age/quests.php?land=11"><div class="imgButton"><img title="click to go to this land" id="app46755028429_land_image11" src="http://image2.castleagegame.com/2189/graphics/tab_water2_big.gif" fbcontext="a8949d231744"></div></a>							                    			</div>
	<div class="title_tab">
		<div><img title="More land coming soon!" src="http://image2.castleagegame.com/2189/graphics/land_coming_soon.gif"></div>
	</div>
	<div style="clear: both;"></div>
</div>
*/
	if (Page.page === 'quests_quest') {
		return false; // This is if we're looking at a page we don't have access to yet...
	} else if (Page.page === 'quests_demiquests') {
		area = 'demiquest';
	} else if (Page.page === 'quests_atlantis') {
		area = 'atlantis';
	} else {
		area = 'quest';
		land = Page.page.regex(/quests_quest([0-9]+)/i) - 1;
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
		var id, name, level, influence, reward, units, energy, tmp, type = 0;
		if ((tmp = $('input[name="quest"]', el)).length) {
		    id = $(tmp).val().regex(/(\d+)/);
		}
		if ($(el).hasClass('quests_background_sub')) { // Subquest
			name = $('.quest_sub_title', el).text().trim();
			reward = $('.qd_2_sub', el).text().replace(/mil/g, '000000').replace(/[^0-9$]/g, '').regex(/^([0-9]+)\$([0-9]+)\$([0-9]+)$/);
			energy = $('.qd_3_sub', el).text().regex(/([0-9]+)/);
			level = $('.quest_sub_progress', el).text().regex(/LEVEL ([0-9]+)/i);
			influence = $('.quest_sub_progress', el).text().regex(/INFLUENCE: ([0-9]+)%/i);
			type = 2;
		} else {
			name = $('.qd_1 b', el).text().trim();
			reward = $('.qd_2', el).text().replace(/[^0-9$]/g, '').regex(/^([0-9]+)\$([0-9]+)\$([0-9]+)$/);
			energy = $('.quest_req b', el).text().regex(/([0-9]+)/);
			if ($(el).hasClass('quests_background')) { // Main quest
				last_main = id;
				level = $('.quest_progress', el).text().regex(/LEVEL ([0-9]+)/i);
				influence = $('.quest_progress', el).text().regex(/INFLUENCE: ([0-9]+)%/i);
				type = 1;
			} else { // Special / boss Quest
				type = 3;
			}
		}
		if (!name || name.indexOf('\t') !== -1) { // Hopefully stop it finding broken page load quests
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
		data.id[id].exp = reward[0];
		data.id[id].reward = (reward[1] + reward[2]) / 2;
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
				units[title] = $(el).text().regex(/([0-9]+)/);
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

Quest.update = function(event) {
	if (event.worker.name === 'Town' && event.type !== 'data') {
		return; // Missing quest requirements
	}
	// First let's update the Quest dropdown list(s)...
	var i, j, r, unit, own, need, noCanDo = false, best = null, best_cartigan = null, best_vampire = null, best_subquest = null, best_advancement = null, best_influence = null, best_experience = null, best_land = 0, has_cartigan = false, has_vampire = false, list = [], items = {}, data = this.data, maxenergy = Player.get('maxenergy',999), eff, best_sub_eff = 1e10, best_adv_eff = 1e10, best_inf_eff = 1e10;
	if (event.type === 'init' || event.type === 'data') {
		for (i in data.id) {
			if (data.id[i].item && data.id[i].type !== 3) {
				list.push(data.id[i].item);
			}
			for (unit in data.id[i].units) {
				items[unit] = Math.max(items[unit] || 0, data.id[i].units[unit]);
			}
		}
		Config.set('quest_reward', ['Nothing', 'Cartigan', 'Vampire Lord', 'Subquests', 'Advancement', 'Influence', 'Experience', 'Cash'].concat(unique(list).sort()));
		for (unit in items) {
			Resources.set(['_'+unit, 'quest'], items[unit]);
		}
	}
	// Now choose the next quest...
	if (this.option.unique) {// Boss monster quests first - to unlock the next area
		for (i in data.id) {
			if (data.id[i].energy > maxenergy) {// Skip quests we can't afford
				continue;
			}
			if (data.id[i].type === 3 && !Alchemy.get(['ingredients', data.id[i].itemimg], 0) && (!best || data.id[i].energy < data.id[best].energy)) {
				best = i;
			}
		}
	}
	if (!best && this.option.what !== 'Nothing') {
		if (this.option.what === 'Vampire Lord' && Town.get('Vampire Lord', 0) >= 24) {
			has_vampire = true; // Stop trying once we've got the required number of Vampire Lords
		}
		if (this.option.what === 'Cartigan' && (Generals.get('Cartigan', false) || (Alchemy.get(['ingredients', 'eq_underworld_sword.jpg'], 0) >= 3 && Alchemy.get(['ingredients', 'eq_underworld_amulet.jpg'], 0) >= 3 && Alchemy.get(['ingredients', 'eq_underworld_gauntlet.jpg'], 0) >= 3))) {
			// Sword of the Faithless x3 - The Long Path, Burning Gates
			// Crystal of Lament x3 - Fiery Awakening
			// Soul Eater x3 - Fire and Brimstone, Deathrune Castle
			has_cartigan = true; // Stop trying once we've got the general or the ingredients
		}
//		console.log(warn(), 'option = ' + this.option.what);
//		best = (this.runtime.best && data.id[this.runtime.best] && (data.id[this.runtime.best].influence < 100) ? this.runtime.best : null);
		for (i in data.id) {
			if (data.id[i].energy > maxenergy) {// Skip quests we can't afford
				continue;
			}
			if (data.id[i].units) {
				own = 0;
				need = 0;
				noCanDo = false;
				for (unit in data.id[i].units) {
					need = data.id[i].units[unit];
					if (!Player.get(['artifact', i]) || need !== 1) {
						own = Town.get([unit, 'own'], 0);
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
			r = 'reps_' + (isNumber(data.id[i].land) ? (data.id[i].land + 1) : data.id[i].area);
			j = data.id[i].name.toLowerCase();
			eff = data.id[i].eff || (data.id[i].energy * (!isNumber(data.id[i].level) ? 1 : ((this.rdata[j] && this.rdata[j][r]) || 16)));
			if (0 < (data.id[i].influence || 0) && (data.id[i].influence || 0) < 100) {
				eff = Math.ceil(eff * (100 - data.id[i].influence) / 100);
			}
			switch(this.option.what) { // Automatically fallback on type - but without changing option
				case 'Vampire Lord': // Main quests or last subquest (can't check) in Undead Realm
					if (!has_vampire && isNumber(data.id[i].land)
					&& data.id[i].land === 5
					&& data.id[i].type === 1
					&& (!best_vampire || data.id[i].energy < data.id[best_vampire].energy)
					&& (this.option.ignorecomplete === false || (isNumber(data.id[i].influence) && data.id[i].influence < 100))) {
						best_vampire = i;
					}// Deliberate fallthrough
				case 'Cartigan': // Random Encounters in various Underworld Quests
					if (!has_cartigan && isNumber(data.id[i].land)
					&& data.id[i].land === 6
					&& (((data.id[data.id[i].main || i].name === 'The Long Path' || data.id[data.id[i].main || i].name === 'Burning Gates') && Alchemy.get(['ingredients', 'eq_underworld_sword.jpg'], 0) < 3)
						|| ((data.id[data.id[i].main || i].name === 'Fiery Awakening') && Alchemy.get(['ingredients', 'eq_underworld_amulet.jpg'], 0) < 3)
						|| ((data.id[data.id[i].main || i].name === 'Fire and Brimstone' || data.id[data.id[i].main || i].name === 'Deathrune Castle') && Alchemy.get(['ingredients', 'eq_underworld_gauntlet.jpg'], 0) < 3))
					&& (!best_cartigan || data.id[i].energy < data.id[best_cartigan].energy)
					&& (this.option.ignorecomplete === false || (isNumber(data.id[i].influence) && data.id[i].influence < 100))) {
						best_cartigan = i;
					}// Deliberate fallthrough
				case 'Subquests': // Find the cheapest energy cost *sub*quest with influence under 100%
					if (data.id[i].type === 2
					&& isNumber(data.id[i].influence) 
					&& data.id[i].influence < 100
					&& (!best_subquest || eff < best_sub_eff)) {
						best_subquest = i;
						best_sub_eff = eff;
					}// Deliberate fallthrough
				case 'Advancement': // Complete all required main / boss quests in an area to unlock the next one (type === 2 means subquest)
					if (isNumber(data.id[i].land) && data.id[i].land > best_land) { // No need to revisit old lands - leave them to Influence
						best_land = data.id[i].land;
						best_advancement = null;
						best_adv_eff = 1e10;
					}
					if (data.id[i].type !== 2
					&& isNumber(data.id[i].land)
					//&& data.id[i].level === 1  // Need to check if necessary to do boss to unlock next land without requiring orb
					&& data.id[i].land >= best_land
					&& ((isNumber(data.id[i].influence) && Generals.test(data.id[i].general) && data.id[i].level <= 1 && data.id[i].influence < 100) || (data.id[i].type === 3 && !Alchemy.get(['ingredients', data.id[i].itemimg], 0)))
					&& (!best_advancement || (data.id[i].land === best_land && eff < best_adv_eff))) {
						best_land = Math.max(best_land, data.id[i].land);
						best_advancement = i;
						best_adv_eff = eff;
					}// Deliberate fallthrough
				case 'Influence': // Find the cheapest energy cost quest with influence under 100%
					if (isNumber(data.id[i].influence) 
							&& (!data.id[i].general || Generals.test(data.id[i].general))
							&& data.id[i].influence < 100
							&& (!best_influence || eff < best_inf_eff)) {
						best_influence = i;
						best_inf_eff = eff;
					}// Deliberate fallthrough
				case 'Experience': // Find the best exp per energy quest
					if (!best_experience || (data.id[i].energy / data.id[i].exp) < (data.id[best_experience].energy / data.id[best_experience].exp)) {
						best_experience = i;
					}
					break;
				case 'Cash': // Find the best (average) cash per energy quest
					if (!best || (data.id[i].energy / data.id[i].reward) < (data.id[best].energy / data.id[best].reward)) {
						best = i;
					}
					break;
				default: // For everything else, there's (cheap energy) items...
					if (data.id[i].item === this.option.what && (!best || data.id[i].energy < data.id[best].energy)) {
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
	var mid, general = 'any', best = Queue.runtime.quest || this.runtime.best;
	var useable_energy = Queue.runtime.force.energy ? Queue.runtime.energy : Queue.runtime.energy - this.option.energy_reserve;
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
			switch(this.option.what) {
				case 'Vampire Lord':
				case 'Cartigan':
					if (this.data.id[best].general) {
						general = this.data.id[best].general;
					} else {
//						general = Generals.best('item');
						general = Generals.best('under level 4');
					}
					if (general !== 'any') {
						break;
					}
					// Deliberate fallthrough
				case 'Influence':
				case 'Advancement':
				case 'Experience':
					general = Generals.best('under level 4');
					if (general === 'any' && isNumber(this.data.id[best].influence) && this.data.id[best].influence < 100) {
						general = 'influence';
					}
					break;
				case 'Cash':
					general = 'cash';
					break;
				default:
					general = 'item';
					break;
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
	if (!Page.click($('input[name="quest"][value="' + best + '"]').siblings('.imgButton').children('input[type="image"]'))) { // Can't find the quest, so either a bad page load, or bad data - delete the quest and reload, which should force it to update ok...
		console.log(warn(), 'Can\'t find button for ' + this.data.id[best].name + ', so deleting and re-visiting page...');
		delete this.data.id[best];
		this.runtime.best = null;
		Page.reload();
	}
	Queue.runtime.quest = false;
	if (this.data.id[best].type === 3) {// Just completed a boss quest
		if (!Alchemy.get(['ingredients', this.data.id[best].itemimg], 0)) {// Add one as we've just gained it...
			Alchemy.set(['ingredients', this.data.id[best].itemimg], 1);
		}
		if (this.option.what === 'Advancement' && Page.pageNames['quests_quest' + (this.data.id[best].land + 2)]) {// If we just completed a boss quest, check for a new quest land.
			Page.to('quests_quest' + (this.data.id[best].land + 2));// Go visit the next land as we've just unlocked it...
		}
	}
	return QUEUE_RELEASE;
};

Quest.order = [];
Quest.dashboard = function(sort, rev) {
	var self = this, i, j, k, o, r, quest, list = [], output = [], vv, tt, cc, span, v, eff;
	if (typeof sort === 'undefined') {
		this.order = [];
		for (i in this.data.id) {
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
				r = 'reps_' + (isNumber(o.land) ? (o.land + 1) : o.area);
				n = o.name.toLowerCase();
				return o.eff || (o.energy * (!isNumber(o.level) ? 1 :
				  ((self.rdata[n] && self.rdata[n][r]) || 16)));
			case 6: // exp
				return o.exp / o.energy;
			case 7: // reward
				return o.reward / o.energy;
			case 8: // item
				return o.item || 'zzz';
		}
		return 0; // unknown
	}
	this.order.sort(function(a,b) {
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
	for (o=0; o<this.order.length; o++) {
		i = this.order[o];
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
			if (v >= 4) {
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
			vv = quest.eff || (quest.energy * ((this.rdata[j] && this.rdata[j][r]) || 16));
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
				cc = 'green';
			} else if (this.rdata[j] && this.rdata[j][r]) {
				if (tt !== '') {
					tt += ', ';
				}
				tt += 'wiki reps ' + this.rdata[j][r];
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
				if (town && town[i] && town[i].buy && town[i].buy.length) {
					c = town[i].own || 0;
					j = town[i].upkeep || 0;
					k = town[i].cost || 0;
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


Quest.rts = 1292695942;	// Sat Dec 18 18:12:22 2010 UTC
Quest.rdata =			// #321
{
	'a demonic transformation':			{ reps_4: 40 },
	'a forest in peril':				{ reps_demiquest:  9 },
	'a kidnapped princess':				{ reps_demiquest: 10 },
	'across the sea':					{ reps_11:  8 },
	'aid corvintheus':					{ reps_demiquest:  9 },
	'aid the angels':					{ reps_9: 17 },
	'approach the prayer chamber':		{ reps_demiquest: 12 },
	'approach the tree of life':		{ reps_demiquest: 12 },
	'ascent to the skies':				{ reps_8:  0 },
	'attack from above':				{ reps_9: 17 },
	'attack undead guardians':			{ reps_6: 24 },
	'aurelius':							{ reps_11:  0 },
	'aurelius outpost':					{ reps_11:  0 },
	'avoid ensnarements':				{ reps_3: 34 },
	'avoid the guards':					{ reps_8:  0 },
	'avoid the patrols':				{ reps_9: 17 },
	'banish the horde':					{ reps_9: 17 },
	'battle a wraith':					{ reps_2: 16 },
	'battle earth and fire demons':		{ reps_4: 16 },
	'battle gang of bandits':			{ reps_1: 10 },
	'battle orc captain':				{ reps_3: 15 },
	'battle the black dragon':			{ reps_4: 14 },
	'battle the ent':					{ reps_demiquest: 12 },
	'battling the demons':				{ reps_9: 17 },
	'being followed':					{ reps_7: 15 },
	'blood wing king of the dragons':	{ reps_demiquest: 20 },
	'breach the barrier':				{ reps_8:  0 },
	'breach the keep entrance':			{ reps_demiquest: 12 },
	'breaching the gates':				{ reps_7: 15 },
	'break aurelius guard':				{ reps_11:  0 },
	'break evil seal':					{ reps_7: 17 },
	'break the lichs spell':			{ reps_demiquest: 12 },
	'break the line':					{ reps_10:  0 },
	'breaking through the guard':		{ reps_9: 17 },
	'bridge of elim':					{ reps_8: 11 },
	'burning gates':					{ reps_7:  0 },
	'call of arms':						{ reps_6: 25 },
	'cast aura of night':				{ reps_5: 32 },
	'cast blizzard':					{ reps_10:  0 },
	'cast fire aura':					{ reps_6: 24 },
	'cast holy light':					{ reps_6: 24 },
	'cast holy light spell':			{ reps_5: 24 },
	'cast holy shield':					{ reps_demiquest: 12 },
	'cast meteor':						{ reps_5: 32 },
	'castle of the black lion':			{ reps_demiquest: 13 },
	'castle of the damn':				{ reps_demiquest: 25 },
	'channel excalibur':				{ reps_8:  0 },
	'charge ahead':						{ reps_10:  0 },
	'charge the castle':				{ reps_7: 15 },
	'chasm of fire':					{ reps_10: 10 },
	'city of clouds':					{ reps_8: 11 },
	'clear the rocks':					{ reps_11:  0 },
	'climb castle cliffs':				{ reps_11:  0 },
	'climb the mountain':				{ reps_8:  0 },
	'close the black portal':			{ reps_demiquest: 12 },
	'confront the black lion':			{ reps_demiquest: 12 },
	'confront the rebels':				{ reps_10: 10 },
	'consult aurora':					{ reps_demiquest: 12 },
	'corruption of nature':				{ reps_demiquest: 20 },
	'cover tracks':						{ reps_7: 19 },
	'cross lava river':					{ reps_7: 20 },
	'cross the bridge':					{ reps_10:  0, reps_8:  0 },
	'cross the moat':					{ reps_11:  0 },
	'crossing the chasm':				{ reps_2: 13, reps_8:  0 },
	'cure infested soldiers':			{ reps_6: 25 },
	'deal final blow to bloodwing':		{ reps_demiquest: 12 },
	'deathrune castle':					{ reps_7: 12 },
	'decipher the clues':				{ reps_9: 17 },
	'defeat and heal feral animals':	{ reps_demiquest: 12 },
	'defeat angelic sentinels':			{ reps_8:  0 },
	'defeat bear form':					{ reps_11:  0 },
	'defeat bloodwing':					{ reps_demiquest: 12 },
	'defeat chimerus':					{ reps_demiquest: 12 },
	'defeat darien woesteel':			{ reps_demiquest:  9 },
	'defeat demonic guards':			{ reps_7: 17 },
	'defeat fire elementals':			{ reps_10:  0 },
	'defeat frost minions':				{ reps_3: 40 },
	'defeat lion defenders':			{ reps_11:  0 },
	'defeat orc patrol':				{ reps_8:  0 },
	'defeat rebels':					{ reps_10:  0 },
	'defeat snow giants':				{ reps_3: 24 },
	'defeat the bandit leader':			{ reps_1:  6 },
	'defeat the banshees':				{ reps_5: 25 },
	'defeat the black lion army':		{ reps_demiquest: 12 },
	'defeat the demonic guards':		{ reps_demiquest: 12 },
	'defeat the demons':				{ reps_9: 17 },
	'defeat the kobolds':				{ reps_10:  0 },
	'defeat the patrols':				{ reps_9: 17 },
	'defeat the seraphims':				{ reps_8:  0 },
	'defeat tiger form':				{ reps_11:  0 },
	'defend the village':				{ reps_demiquest: 12 },
	'desert temple':					{ reps_11: 12 },
	'destroy black oozes':				{ reps_11:  0 },
	'destroy fire dragon':				{ reps_4: 10 },
	'destroy fire elemental':			{ reps_4: 16 },
	'destroy horde of ghouls & trolls':	{ reps_4:  9 },
	'destroy the black gate':			{ reps_demiquest: 12 },
	'destroy the black portal':			{ reps_demiquest: 12 },
	'destroy the bolted door':			{ reps_demiquest: 12 },
	'destroy undead crypt':				{ reps_1:  5 },
	'destruction abound':				{ reps_8: 11 },
	'determine cause of corruption':	{ reps_demiquest: 12 },
	'dig up star metal':				{ reps_demiquest: 12 },
	'disarm townspeople':				{ reps_11:  0 },
	'discover cause of corruption':		{ reps_demiquest: 12 },
	'dismantle orc patrol':				{ reps_3: 32 },
	'dispatch more cultist guards':		{ reps_demiquest: 12 },
	'distract the demons':				{ reps_9: 17 },
	'dragon slayer':					{ reps_demiquest: 14 },
	'druidic prophecy':					{ reps_11:  9 },
	"duel cefka's knight champion":		{ reps_4: 10 },
	'dwarven stronghold':				{ reps_10: 10 },
	'eastern corridor':					{ reps_11:  0 },
	'elekin the dragon slayer':			{ reps_demiquest: 10 },
	'end of the road':					{ reps_9: 17 },
	'enlist captain morgan':			{ reps_11:  0 },
	'entrance to terra':				{ reps_1:  9 },
	'equip soldiers':					{ reps_6: 25 },
	'escaping the chaos':				{ reps_9: 17 },
	'escaping the stronghold':			{ reps_9: 10 },
	'explore merchant plaza':			{ reps_11:  0 },
	'explore the temple':				{ reps_11:  0 },
	'extinguish desert basilisks':		{ reps_11:  0 },
	'extinguish the fires':				{ reps_8:  0 },
	'falls of jiraya':					{ reps_1: 10 },
	'family ties':						{ reps_demiquest: 11 },
	'fend off demons':					{ reps_7: 20 },
	'fiery awakening':					{ reps_7: 12 },
	"fight cefka's shadow guard":		{ reps_4: 10 },
	'fight demonic worshippers':		{ reps_5: 24 },
	'fight dragon welps':				{ reps_4: 10 },
	'fight ghoul army':					{ reps_1:  5 },
	'fight gildamesh':					{ reps_3: 32 },
	'fight ice beast':					{ reps_3: 40 },
	'fight infested soldiers':			{ reps_6: 25 },
	'fight off demons':					{ reps_5: 32 },
	'fight off zombie infestation':		{ reps_demiquest: 12 },
	'fight snow king':					{ reps_3: 24 },
	'fight the half-giant sephor':		{ reps_4:  9 },
	'fight treants':					{ reps_2: 27 },
	'fight undead zombies':				{ reps_2: 16 },
	'fight water demon lord':			{ reps_2: 31 },
	'fight water demons':				{ reps_2: 40 },
	'fight water spirits':				{ reps_2: 40 },
	'find evidence of dragon attack':	{ reps_demiquest:  8 },
	'find hidden path':					{ reps_demiquest: 10 },
	'find nezeals keep':				{ reps_demiquest: 12 },
	'find rock worms weakness':			{ reps_demiquest: 10 },
	'find source of the attacks':		{ reps_demiquest: 12 },
	'find survivors':					{ reps_8:  0 },
	'find the dark elves':				{ reps_demiquest: 12 },
	'find the demonic army':			{ reps_demiquest: 12 },
	'find the druids':					{ reps_demiquest: 12 },
	'find the entrance':				{ reps_8:  0 },
	'find the exit':					{ reps_9: 17 },
	'find the safest path':				{ reps_10:  0 },
	'find the source of corruption':	{ reps_demiquest: 12 },
	'find the woman? father':			{ reps_demiquest: 12 },
	'find troll weakness':				{ reps_2: 10 },
	'find your way out':				{ reps_7: 15 },
	'fire and brimstone':				{ reps_7: 12 },
	'forest of ash':					{ reps_demiquest: 11 },
	'furest hellblade':					{ reps_demiquest: 17 },
	'gain access':						{ reps_10:  0 },
	'gain entry':						{ reps_11:  0 },
	'gates to the undead':				{ reps_6: 17 },
	'gateway':							{ reps_8: 11 },
	'get information from the druid':	{ reps_demiquest: 12 },
	'get water for the druid':			{ reps_demiquest: 12 },
	'grim outlook':						{ reps_9: 17 },
	'guard against attack':				{ reps_demiquest: 12 },
	'heal wounds':						{ reps_7: 20 },
	'heat the villagers':				{ reps_1:  5 },
	'holy fire':						{ reps_demiquest: 11 },
	'impending battle':					{ reps_10: 10 },
	'interrogate the prisoners':		{ reps_9: 17 },
	'investigate the gateway':			{ reps_8:  0 },
	'ironfist dwarves':					{ reps_10: 10 },
	'join up with artanis':				{ reps_demiquest: 12 },
	'judgement stronghold':				{ reps_8: 11 },
	'juliean desert':					{ reps_11: 12 },
	'kelp forest':						{ reps_atlantis: 20 },
	'kill gildamesh':					{ reps_3: 34 },
	'kill vampire bats':				{ reps_demiquest: 12 },
	'koralan coast town':				{ reps_11: 14 },
	'koralan townspeople':				{ reps_11:  0 },
	'learn about death knights':		{ reps_demiquest: 12 },
	'learn aurelius intentions':		{ reps_11:  0 },
	'learn counterspell':				{ reps_demiquest: 12 },
	'learn holy fire':					{ reps_demiquest: 12 },
	'look for clues':					{ reps_8:  0 },
	'marauders!':						{ reps_demiquest:  9 },
	'march into the undead lands':		{ reps_6: 24 },
	'march to the unholy war':			{ reps_6: 25 },
	'mausoleum of triste':				{ reps_3: 17 },
	'misty hills of boralis':			{ reps_3: 20 },
	'mount aretop':						{ reps_demiquest: 25 },
	'nightmare':						{ reps_6: 20 },
	'outpost entrance':					{ reps_11:  0 },
	'path to heaven':					{ reps_8: 11 },
	'pick up the orc trail':			{ reps_1:  6 },
	'plan the attack':					{ reps_demiquest: 12 },
	'portal of atlantis':				{ reps_atlantis: 20 },
	'power of excalibur':				{ reps_8: 11 },
	'prepare for ambush':				{ reps_1:  6 },
	'prepare for battle':				{ reps_5: 32, reps_demiquest: 12 },
	'prepare for the trials':			{ reps_9: 17 },
	'prepare tactics':					{ reps_10:  0 },
	'prepare troops':					{ reps_10:  0 },
	'prevent dragon? escape':			{ reps_demiquest: 12 },
	'protect temple from raiders':		{ reps_2: 40 },
	'purge forest of evil':				{ reps_2: 27 },
	'pursuing orcs':					{ reps_1: 13 },
	'put out the fires':				{ reps_demiquest:  8 },
	'question dark elf prisoners':		{ reps_demiquest: 12 },
	'question the druidic wolf':		{ reps_demiquest: 12 },
	'question townspeople':				{ reps_11:  0 },
	'question vulcan':					{ reps_8:  0 },
	'ready the horses':					{ reps_1:  6 },
	'recover the key':					{ reps_9: 17 },
	'recruit allies':					{ reps_10:  0 },
	'recruit elekin to join you':		{ reps_demiquest:  9 },
	'recruit furest to join you':		{ reps_demiquest: 12 },
	'repel gargoyle raid':				{ reps_4: 14 },
	'request council':					{ reps_10:  0 },
	'rescue survivors':					{ reps_8:  0 },
	'resist the lost souls':			{ reps_5: 25 },
	'retrieve dragon slayer':			{ reps_demiquest: 10 },
	'retrieve the jeweled heart':		{ reps_demiquest: 12 },
	'ride to aretop':					{ reps_demiquest: 12 },
	'ride towards the palace':			{ reps_9: 17 },
	'river of lava':					{ reps_10: 10 },
	'river of light':					{ reps_1: 10 },
	'save lost souls':					{ reps_5: 24 },
	'save stranded soldiers':			{ reps_10:  0 },
	'seek out elekin':					{ reps_demiquest:  9 },
	'seek out furest hellblade':		{ reps_demiquest: 12 },
	'seek out jeweled heart':			{ reps_demiquest: 12 },
	'shield of the stars':				{ reps_demiquest: 20 },
	'slaughter orcs':					{ reps_3: 15 },
	'slay cave bats':					{ reps_demiquest: 10 },
	'slay the black dragons':			{ reps_5: 32 },
	'slay the guardian':				{ reps_9: 17 },
	'slay the sea serpent':				{ reps_demiquest: 12 },
	'sneak attack on dragon':			{ reps_demiquest: 12 },
	'sneak into the city':				{ reps_8:  0 },
	'sneak up on orcs':					{ reps_1:  7 },
	'soldiers of the black lion':		{ reps_demiquest: 10 },
	'spire of death':					{ reps_5: 20 },
	'spring surprise attack':			{ reps_demiquest: 12 },
	'stop the wolf from channeling':	{ reps_demiquest: 12 },
	'storm the castle':					{ reps_demiquest: 12 },
	'storm the ivory palace':			{ reps_9: 17 },
	'sulfurous springs':				{ reps_11: 10 },
	'summon legendary defenders':		{ reps_6: 25 },
	'surround rebels':					{ reps_10:  0 },
	'survey battlefield':				{ reps_10:  0 },
	'survey the surroundings':			{ reps_8:  0 },
	'survive the storm':				{ reps_11:  0 },
	'survive troll ambush':				{ reps_2: 10 },
	'surviving the onslaught':			{ reps_9: 17 },
	'the belly of the demon':			{ reps_5: 20 },
	'the betrayed lands':				{ reps_4: 16 },
	'the black portal':					{ reps_demiquest: 15 },
	'the cave of wonder':				{ reps_3: 20 },
	'the crystal caverns':				{ reps_demiquest: 11 },
	'the darkening skies':				{ reps_9: 17 },
	'the deep':							{ reps_atlantis: 20 },
	'the elven sorceress':				{ reps_demiquest: 11 },
	'the fallen druids':				{ reps_demiquest: 12 },
	'the final stretch':				{ reps_9: 17 },
	'the forbidden forest':				{ reps_2: 20 },
	'the forbidden ritual':				{ reps_5: 20 },
	'the hidden lair':					{ reps_demiquest: 13 },
	'the hollowing moon':				{ reps_6: 17 },
	'the infestation of winterguard':	{ reps_demiquest: 10 },
	'the invasion':						{ reps_8: 11 },
	'the keep of corelan':				{ reps_3: 17 },
	'the keep of isles':				{ reps_4: 16 },
	'the kingdom of alarean':			{ reps_demiquest: 15 },
	'the last gateway':					{ reps_9: 17 },
	"the lich ne'zeal":					{ reps_demiquest: 13 },
	"the lich's keep":					{ reps_demiquest: 15 },
	'the living gates':					{ reps_5: 20 },
	'the long path':					{ reps_7: 12 },
	'the peaks of draneth':				{ reps_demiquest: 21 },
	'the poison source':				{ reps_11:  0 },
	'the rebellion':					{ reps_10: 10 },
	'the return home':					{ reps_8: 11 },
	'the return of the dragon':			{ reps_demiquest:  9 },
	'the ride south':					{ reps_8:  0 },
	'the river of blood':				{ reps_5: 20 },
	'the sea temple':					{ reps_atlantis: 20 },
	'the search for clues':				{ reps_demiquest: 12 },
	'the second temple of water':		{ reps_4: 25 },
	'the smouldering pit':				{ reps_4: 40 },
	'the source of darkness':			{ reps_demiquest: 20 },
	'the source of magic':				{ reps_demiquest: 15 },
	'the stairs of terra':				{ reps_2: 10 },
	'the stone lake':					{ reps_1: 12 },
	'the sunken city':					{ reps_demiquest: 17 },
	'the tree of life':					{ reps_demiquest: 21 },
	'the vanguard of destruction':		{ reps_demiquest: 21 },
	'the water temple':					{ reps_2: 17 },
	'track down soldiers':				{ reps_demiquest: 12 },
	'track sylvana':					{ reps_demiquest: 12 },
	'train with ambrosia':				{ reps_demiquest: 12 },
	'train with aurora':				{ reps_demiquest: 12 },
	'travel to the tree of life':		{ reps_demiquest: 12 },
	'travel to winterguard':			{ reps_demiquest: 12 },
	'triste':							{ reps_3: 20 },
	'undead crusade':					{ reps_6: 17 },
	'underwater ruins':					{ reps_atlantis: 20 },
	'unholy war':						{ reps_6: 20 },
	'use battering ram':				{ reps_11:  0 },
	'vengeance':						{ reps_demiquest: 17 },
	'vesuv bridge':						{ reps_10: 10 },
	'vesuv lookout':					{ reps_2: 17 },
	'visit the blacksmith':				{ reps_1: 24 },
	'vulcans secret':					{ reps_8: 11 },
	'watch the skies':					{ reps_demiquest: 12 }
};
/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page, Queue, Resources,
	Bank, Battle, Generals, LevelUp, Player, Quest,
	APP, APPID, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, Divisor, length, unique, deleteElement, sum, findInArray, findInObject, objectIndex, sortObject, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
	makeImage
*/
/********** Worker.Town **********
* Sorts and auto-buys all town units (not property)
*/
var Town = new Worker('Town');
Town.data = {};

Town.defaults['castle_age'] = {
	pages:'town_soldiers town_blacksmith town_magic'
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
	id:'number',
	label:'Buy Number',
	select:['None', 'Minimum', 'Army', 'Max Army'],
	help:'Minimum will only buy items need for quests if enabled. Army will buy up to your army size (modified by some generals), Max Army will buy up to 541 regardless of army size.'
},{
	id:'sell',
	require:{'number':[['None'],['Minimum']]},
	label:'Sell Surplus',
	checkbox:true,
	help:'Only keep the best items for selected sets.'
},{
	advanced:true,
	id:'units',
	require:{'number':[['None']]},
	label:'Set Type',
	select:['Best Offense', 'Best Defense', 'Best for Both'],
	help:'Select type of sets to keep. Best for Both will keep a Best Offense and a Best Defense set.'
},{
	advanced:true,
	id:'maxcost',
	require:{'number':[['None']]},
	label:'Maximum Item Cost',
	select:['$10k','$100k','$1m','$10m','$100m','$1b','$10b','$100b','$1t','$10t','$100t','INCR'],
	help:'Will buy best item based on Set Type with single item cost below selected value. INCR will start at $10k and work towards max buying at each level (WARNING, not cost effective!)'
},{
	advanced:true,
	require:{'number':[['None']]},
	id:'upkeep',
	label:'Max Upkeep',
	text:true,
	after:'%',
	help:'Enter maximum Total Upkeep in % of Total Income'
}
];

Town.blacksmith = {
	Weapon: /axe|blade|bow|cleaver|cudgel|dagger|edge|grinder|halberd|lance|mace|morningstar|rod|saber|scepter|spear|staff|stave|sword |sword$|talon|trident|wand|^Avenger$|Celestas Devotion|Crystal Rod|Daedalus|Deliverance|Dragonbane|Excalibur|Holy Avenger|Incarnation|Ironhart's Might|Judgement|Justice|Lightbringer|Oathkeeper|Onslaught|Punisher|Soulforge/i,
	Shield:	/aegis|buckler|shield|tome|Defender|Dragon Scale|Frost Tear Dagger|Harmony|Sword of Redemption|Terra's Guard|The Dreadnought|Purgatory|Zenarean Crest/i,
	Helmet:	/cowl|crown|helm|horns|mask|veil|Virtue of Fortitude/i,
	Gloves:	/gauntlet|glove|hand|bracer|fist|Slayer's Embrace|Soul Crusher|Soul Eater|Virtue of Temperance/i,
	Armor:	/armor|belt|chainmail|cloak|epaulets|gear|garb|pauldrons|plate|raiments|robe|tunic|vestment|Faerie Wings/i,
	Amulet:	/amulet|bauble|charm|crystal|eye|flask|insignia|jewel|lantern|memento|necklace|orb|pendant|shard|signet|soul|talisman|trinket|Heart of Elos|Mark of the Empire|Paladin's Oath|Poseidons Horn| Ring|Ring of|Ruby Ore|Terra's Heart|Thawing Star|Transcendence/i
};

Town.init = function(){
	this._watch(Player, 'data.worth');
	Resources.use('Gold');
	this.runtime.cost_incr = 4;
};

Town.parse = function(change) {
	if (!change) {
		var unit = Town.data, page = Page.page.substr(5);
		$('.eq_buy_row,.eq_buy_row2').each(function(a,el){
			// Fix for broken magic page!!
			if (!$('div.eq_buy_costs_int', el).length) {
				$('div.eq_buy_costs', el).prepend('<div class="eq_buy_costs_int"></div>').children('div.eq_buy_costs_int').append($('div.eq_buy_costs >[class!="eq_buy_costs_int"]', el));
			}
			if (!$('div.eq_buy_stats_int', el).length) {
				$('div.eq_buy_stats', el).prepend('<div class="eq_buy_stats_int"></div>').children('div.eq_buy_stats_int').append($('div.eq_buy_stats >[class!="eq_buy_stats_int"]', el));
			}
			if (!$('div.eq_buy_txt_int', el).length) {
				$('div.eq_buy_txt', el).prepend('<div class="eq_buy_txt_int"></div>').children('div.eq_buy_txt_int').append($('div.eq_buy_txt >[class!="eq_buy_txt_int"]', el));
			}
			var i, j, stats = $('div.eq_buy_stats', el), name = $('div.eq_buy_txt strong:first', el).text().trim(), costs = $('div.eq_buy_costs', el), cost = $('strong:first-child', costs).text().replace(/[^0-9]/g, ''),upkeep = $('div.eq_buy_txt_int:first',el).children('span.negative').text().replace(/[^0-9]/g, ''), match, maxlen = 0;
			unit[name] = unit[name] || {};
			unit[name].page = page;
			unit[name].img = $('div.eq_buy_image img', el).attr('src').filepart();
			unit[name].own = $(costs).text().regex(/Owned: ([0-9]+)/i);
			Resources.add('_'+name, unit[name].own, true);
			unit[name].att = $('div.eq_buy_stats_int div:eq(0)', stats).text().regex(/([0-9]+)\s*Attack/);
			unit[name].def = $('div.eq_buy_stats_int div:eq(1)', stats).text().regex(/([0-9]+)\s*Defense/);
			unit[name].tot_att = unit[name].att + (0.7 * unit[name].def);
			unit[name].tot_def = unit[name].def + (0.7 * unit[name].att);
			if (cost) {
				unit[name].cost = parseInt(cost, 10);
				if (upkeep){
					unit[name].upkeep = parseInt(upkeep, 10);
				}
				if (costs.text().indexOf('locked') === -1) {
					unit[name].buy = [];
					$('select[name="amount"]:first option', costs).each(function(i,el){
						unit[name].buy.push(parseInt($(el).val(), 10));
					});
				} else {
					delete unit[name].buy;
				}
				unit[name].sell = [];
				$('select[name="amount"]:last option', costs).each(function(i,el){
					unit[name].sell.push(parseInt($(el).val(), 10));
				});
			}
			if (page === 'blacksmith') {
				delete unit[name].type;
				for (i in Town.blacksmith) {
					if ((match = name.match(Town.blacksmith[i]))) {
						for (j=0; j<match.length; j++) {
							if (match[j].length > maxlen) {
								unit[name].type = i;
								maxlen = match[j].length;
							}
						}
					}
				}
			}
		});
	} else if (Page.page==='town_blacksmith') {
		$('.eq_buy_row,.eq_buy_row2').each(function(i,el){
			var $el = $('div.eq_buy_txt strong:first-child', el), name = $el.text().trim();
			if (Town.data[name].type) {
				$el.parent().append('<br>'+Town.data[name].type);
			}
		});
	}
	return true;
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
	var i, u, need, want, have, best_buy = null, best_sell = null, best_quest = false, buy = 0, sell = 0, data = this.data, quests, army = Math.min(Generals.get('runtime.armymax', 501), Player.get('armymax', 501)), max_buy = 0,
	incr = (this.runtime.cost_incr || 4);
        
	switch (this.option.number) {
		case 'Army':
				max_buy = army;
				break;
		case 'Max Army':
				max_buy = Generals.get('runtime.armymax', army);
				break;
		default:
				max_buy = 0;
			break;
	}
	// These two fill in all the data we need for buying / sellings items
	this.runtime.invade = this.getInvade(army);
	this.runtime.duel = this.getDuel();
	// For all items / units
	// 1. parse through the list of buyable items of each type
	// 2. find the one with Resources.get(_item.invade_att) the highest (that's the number needed to hit 541 items in total)
	// 3. buy enough to get there
	// 4. profit (or something)...
	if (this.option.quest_buy || max_buy){
		for (u in data) {
			want = Resources.get(['_'+u, 'quest'], 0);
			need = this.option.quest_buy ? want : 0;
			have = data[u].own;
			// Sorry about the nested max/min/max -
			// Max - 'need' can't get smaller
			// Min - 'max_buy' is the most we want to buy
			// Max - needs to accounts for invade and duel
			if (this.option.units !== 'Best Defense') {
				need = Math.max(need, Math.min(max_buy, Math.max(Resources.get(['_'+u, 'invade_att'], 0), Resources.get(['_'+u, 'duel_att'], 0))));
			}
			if (this.option.units !== 'Best Offense') {
				need = Math.max(need, Math.min(max_buy, Math.max(Resources.get(['_'+u, 'invade_def'], 0), Resources.get(['_'+u, 'duel_def'], 0))));
			}
                        if (this.option.quest_buy && want > have) {// If we're buying for a quest item then we're only going to buy that item first - though possibly more than specifically needed
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
					if (data[u].cost <= max_cost && this.option.upkeep >= (((Player.get('upkeep') + ((data[u].upkeep || 0) * bestValue(data[u].buy, need - have))) / Player.get('maxincome')) * 100) && (!best_buy || need > buy)) {
//						console.log(warn(), 'Buy: '+need);
						best_buy = u;
						buy = need;
						if (this.option.quest_buy && want > have) {// If we're buying for a quest item then we're only going to buy that item first - though possibly more than specifically needed
							best_quest = true;
						}
					}
				}
			} else if (max_buy && this.option.sell && Math.max(need,want) < have && data[u].sell && data[u].sell.length) {// Want to sell off surplus (but never quest stuff)
				need = bestValue(data[u].sell, have - Math.max(need,want));
				if (need > 0 && (!best_sell || data[u].cost > data[best_sell].cost)) {
//					console.log(warn(), 'Sell: '+need);
					best_sell = u;
					sell = need;
				}
			}
		}
	}

	this.runtime.best_buy = this.runtime.best_sell = null;
	this.runtime.buy = this.runtime.sell = this.runtime.cost = 0;
	if (best_sell) {// Sell before we buy
		this.runtime.best_sell = best_sell;
		this.runtime.sell = sell;
		this.runtime.cost = sell * data[best_sell].cost / 2;
		Dashboard.status(this, 'Selling ' + this.runtime.sell + ' &times; ' + best_sell + ' for ' + makeImage('gold') + '$' + this.runtime.cost.SI());
	} else if (best_buy){
		this.runtime.best_buy = best_buy;
		this.runtime.buy = bestValue(data[best_buy].buy, buy - data[best_buy].own);
		this.runtime.cost = this.runtime.buy * data[best_buy].cost;
		if (Bank.worth(this.runtime.cost)) {
			Dashboard.status(this, 'Buying ' + this.runtime.buy + ' &times; ' + best_buy + ' for ' + makeImage('gold') + '$' + this.runtime.cost.SI());
		} else {
			Dashboard.status(this, 'Waiting for ' + makeImage('gold') + '$' + (this.runtime.cost - Bank.worth()).SI() + ' to buy ' + this.runtime.buy + ' &times; ' + best_buy + ' for ' + makeImage('gold') + '$' + this.runtime.cost.SI());
		}
	} else {
                if (this.option.maxcost === 'INCR'){
                    this.runtime.cost_incr = (incr === 14)? 4: incr + 1;
                    this.runtime.check = Date.now() + 3600000;
                } else {
                    this.runtime.cost_incr = null;
                    this.runtime.check = null;
                }
		Dashboard.status(this);
	}
};

Town.work = function(state) {
        var incr = (this.runtime.cost_incr || 4);
	if (this.runtime.best_sell){
		if (!state || !this.sell(this.runtime.best_sell, this.runtime.sell)) {
			return QUEUE_CONTINUE;
		}
	}
	if (this.runtime.best_buy){
		if (!state && !Bank.worth(this.runtime.cost)) {
                        if (this.runtime.check < Date.now() && this.option.maxcost === 'INCR'){
                                this.runtime.cost_incr = 4;
                                this.runtime.check = Date.now() + 3600000;
                        }                        
                        Dashboard.status(this, 'Waiting for ' + makeImage('gold') + '$' + (this.runtime.cost - Bank.worth()).SI() + ' to buy ' + this.runtime.buy + ' &times; ' + this.runtime.best_buy + ' for ' + makeImage('gold') + '$' + this.runtime.cost.SI());
                        return QUEUE_FINISH;
		}
		if (!state || !this.buy(this.runtime.best_buy, this.runtime.buy)) {
			return QUEUE_CONTINUE;
		}
	}
	return QUEUE_FINISH;
};

Town.buy = function(item, number) { // number is absolute including already owned
	this._unflush();
	if (!this.data[item] || !this.data[item].buy || !this.data[item].buy.length || !Bank.worth(this.runtime.cost)) {
		return true; // We (pretend?) we own them
	}
	if (!Generals.to(this.option.general ? 'cost' : 'any') || !Bank.retrieve(this.runtime.cost) || !Page.to('town_'+this.data[item].page)) {
		return false;
	}
	var qty = bestValue(this.data[item].buy, number);
	$('.eq_buy_row,.eq_buy_row2').each(function(i,el){
		if ($('div.eq_buy_txt strong:first', el).text().trim() === item) {
				console.log(warn(), 'Buying ' + qty + ' x ' + item + ' for $' + (qty * Town.data[item].cost).addCommas());
				$('div.eq_buy_costs select[name="amount"]:eq(0)', el).val(qty);
				Page.click($('div.eq_buy_costs input[name="Buy"]', el));
		}
	});
        this.runtime.cost_incr = 4;
	return false;
};

Town.sell = function(item, number) { // number is absolute including already owned
	this._unflush();
	if (!this.data[item] || !this.data[item].sell || !this.data[item].sell.length) {
		return true;
	}
	if (!Page.to('town_'+this.data[item].page)) {
		return false;
	}
	var qty = bestValue(this.data[item].sell, number);
	$('.eq_buy_row,.eq_buy_row2').each(function(i,el){
		if ($('div.eq_buy_txt strong:first', el).text().trim() === item) {
				console.log(warn(), 'Selling ' + qty + ' x ' + item + ' for $' + (qty * Town.data[item].cost / 2).addCommas());
				$('div.eq_buy_costs select[name="amount"]:eq(1)', el).val(qty);
				Page.click($('div.eq_buy_costs input[name="Sell"]', el));
		}
	});
        this.runtime.cost_incr = 4;
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
					return order[list[a].type] - order[list[b].type];
				});
		} else if (list[units[0]] && list[units[0]].skills && list[units[0]][type]) {
				units.sort(function(a,b) {
					return (list[b][type][x] || 0) - (list[a][type][x] || 0);
				});
		} else {
				units.sort(function(a,b) {
					return (list[b][x] + (0.7 * list[b][x2])) - (list[a][x] + (0.7 * list[a][x2]));
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
Upgrade.data = null;

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
		this.runtime.run++;
	}
	return false;
};

Upgrade.update = function(event) {
	if (this.runtime.run >= this.option.order.length) {
		this.runtime.run = 0;
	}
	var points = Player.get('upgrade'), args;
	this.set('option._sleep', !this.option.order.length || Player.get('upgrade') < (this.option.order[this.runtime.run]==='Stamina' ? 2 : 1));
};

Upgrade.work = function(state) {
	var args;
	switch (this.option.order[this.runtime.run]) {
		case 'Energy':	args = 'energy_max';	break;
		case 'Stamina':	args = 'stamina_max';	break;
		case 'Attack':	args = 'attack';		break;
		case 'Defense':	args = 'defense';		break;
		case 'Health':	args = 'health_max';	break;
		default: this.runtime.run++; return QUEUE_RELEASE; // Should never happen
	}
	if (state) {
		this.runtime.working = true;
		Page.to('keep_stats', {upgrade:args}, true);
	}
	return QUEUE_RELEASE;
};


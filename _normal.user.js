// ==UserScript==
// @name		Rycochet's Castle Age Golem
// @namespace	golem
// @description	Auto player for castle age game
// @license		GNU Lesser General Public License; http://www.gnu.org/licenses/lgpl.html
// @version		30.9
// @include		http*://apps.*facebook.com/castle_age/*
// @require		http://cloutman.com/jquery-latest.min.js
// @require		http://cloutman.com/jquery-ui-latest.min.js
// ==/UserScript==
// 
// For the source code please check the sourse repository
// - http://code.google.com/p/game-golem/
// 
// For the unshrunk Work In Progress version (which may introduce new bugs)
// - http://game-golem.googlecode.com/svn/trunk/_normal.user.js
// User changeable
var show_debug = true;

// Shouldn't touch
var VERSION = 30.9;
var script_started = Date.now();

// Automatically filled
var userID = 0;
var imagepath = '';

// Decide which facebook app we're in...
var applications = {
	'castle_age':['46755028429', 'Castle Age']
};

if (window.location.hostname === 'apps.facebook.com' || window.location.hostname === 'apps.new.facebook.com') {
	for (var i in applications) {
		if (window.location.pathname.indexOf(i) === 1) {
			var APP = i;
			var APPID = applications[i][0];
			var APPNAME = applications[i][1];
			var PREFIX = 'golem'+APPID+'_';
			break;
		}
	}
}

var log = console.log;

if (show_debug) {
	var debug = console.log;
} else {
	var debug = function(){};
}

if (typeof unsafeWindow === 'undefined') {
	unsafeWindow = window;
}

/********** main() **********
* Runs when the page has finished loading, but the external data might still be coming in
*/
if (typeof APP !== 'undefined') {
	$(document).ready(function() {
		var i;
		userID = $('head').html().regex(/user:([0-9]+),/i);
		if (!userID || typeof userID !== 'number' || userID === 0) {
			log('ERROR: No Facebook UserID!!!');
			Page.reload();
		} else if (!unsafeWindow['a' + APPID + '_gold_increase_ticker']) {
			log('ERROR: Bad Page Load!!!');
			Page.reload();
		} else {
			imagepath = $('#app'+APPID+'_globalContainer img:eq(0)').attr('src').pathpart();
			do_css();
			Page.identify();
			for (i=0; i<Workers.length; i++) {
				Workers[i]._load();
			}
			for (i=0; i<Workers.length; i++) {
				Workers[i]._init();
			}
			for (i=0; i<Workers.length; i++) {
				Workers[i]._update();
				Workers[i]._flush();
			}
			Page.parse_all(); // Call once to get the ball rolling...
		}
	});
}

/********** CSS code **********
* Gets pushed into the <head> on loading
*/
function do_css(){
$('head').append("<style type=\"text/css\">\
.red { background: red !important; }\
.golem-config { float: none; margin-right: 0; }\
.golem-config > div { position: static; width: 196px; margin: 0; padding: 0; overflow: hidden; overflow-y: auto; }\
.golem-config #golem_fixed { float:right; margin:-2px; width:16px; height: 16px; background: url('data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%10%00%00%00%10%08%03%00%00%00(-%0FS%00%00%00%0FPLTE%DE%DE%DE%DD%DD%DDcccUUU%00%00%00%23%06%7B1%00%00%00%05tRNS%FF%FF%FF%FF%00%FB%B6%0ES%00%00%00.IDATx%DAb%60A%03%0Cd%0B03%81%18LH%02%10%80%2C%C0%84%24%00%96d%C2%A7%02%AB%19L%8C%A8%B6P%C3%E9%08%00%10%60%00%00z%03%C7%24%170%91%00%00%00%00IEND%AEB%60%82') no-repeat; }\
.golem-config-fixed { float: right; margin-right: 200px; }\
.golem-config-fixed > div { position: fixed; }\
.golem-config-fixed #golem_fixed { background: url('data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%10%00%00%00%10%08%03%00%00%00(-%0FS%00%00%00%0FPLTE%DE%DE%DE%DD%DD%DDcccUUU%00%00%00%23%06%7B1%00%00%00%05tRNS%FF%FF%FF%FF%00%FB%B6%0ES%00%00%005IDATx%DAb%60A%03%0C%C4%0901%83%00%13%92%0A%B0%00%0B)%02%8C%CCLLL%CC%0Cx%0CefF%E8%81%B9%83%19%DDa%84%05H%F0%1C%40%80%01%00%FE9%03%C7%D4%8CU%A3%00%00%00%00IEND%AEB%60%82') no-repeat; }\
#golem-dashboard { position: absolute; width: 600px; height: 185px; margin: 0; border-left: 1px solid black; border-right:1px solid black; overflow: hidden; background: white; z-index: 1; }\
#golem-dashboard thead th { cursor: pointer }\
#golem-dashboard thead th.golem-sort:after { content: '&darr;'; }\
#golem-dashboard thead th.golem-sort-reverse:after { content: '&uarr;'; }\
#golem-dashboard tbody tr:nth-child(odd) { background: #eeeeee; }\
#golem-dashboard tbody th { text-align: left; font-weight: normal; }\
#golem-dashboard td, #golem-dashboard th { margin: 2px; text-align: center; padding: 0 8px; }\
#golem-dashboard > div { height: 163px; overflow-y: scroll; border-top: 1px solid #d3d3d3; }\
#golem-dashboard > div > div { padding: 2px; }\
#golem-dashboard .golem-status { width: 100%; }\
#golem-dashboard .golem-status tbody th { text-align: right; padding: 2px; font-weight: bold; }\
#golem-dashboard .golem-status tbody td { text-align: left; }\
#golem-dashboard .overlay { position: absolute; margin: 6px; color: #1fc23a; text-shadow: black 1px 1px 2px; }\
table.golem-graph { height: 100px }\
table.golem-graph tbody th, table.golem-graph tbody td { border-top: 1px solid #dddddd; border-bottom: 1px solid #dddddd; }\
table.golem-graph tbody th { max-width: 75px; }\
table.golem-graph tbody th:first-child { text-align: right; border-left: 1px solid #dddddd; border-right: 1px solid #cccccc; }\
table.golem-graph tbody th:first-child div { line-height: 60px; height: 60px; }\
table.golem-graph tbody th:first-child div:first-child, table.golem-graph tbody th:first-child div:last-child { line-height: 20px; height: 20px; }\
table.golem-graph tbody th:last-child { text-align: left; border-right: 1px solid #dddddd; vertical-align: bottom; }\
table.golem-graph tbody th:last-child div { position: relative; height: 10px; margin: -10px 0 0; }\
table.golem-graph tbody th:last-child div:nth-last-child(1) { color: #ff0000; }\
table.golem-graph tbody th:last-child div:nth-last-child(2) { color: #0000ff; }\
table.golem-graph tbody th:last-child div:nth-last-child(3) { color: #00ffff; }\
table.golem-graph tbody th:last-child div:nth-last-child(4) { color: #aa00aa; }\
table.golem-graph tbody td { margin: 0; padding: 0 !important; vertical-align: bottom; width: 5px; border-right: 1px solid #dddddd; }\
table.golem-graph tbody td:nth-child(12n+1) { border-right: 1px solid #cccccc; }\
table.golem-graph tbody td div div { margin: 0; padding: 0; width: 5px; }\
table.golem-graph tbody td div.bars div:nth-last-child(1) { background: #00ff00; }\
table.golem-graph tbody td div.bars div:nth-last-child(2) { background: #00aa00; }\
table.golem-graph tbody td div.bars div:nth-last-child(3) { background: #ffff00; }\
table.golem-graph tbody td div.bars div:nth-last-child(4) { background: #ff00ff; }\
table.golem-graph tbody td div.goal div { position: relative; height: 1px; margin: -1px 0 0; }\
table.golem-graph tbody td div.goal div:nth-last-child(1) { background: #ff0000; }\
table.golem-graph tbody td div.goal div:nth-last-child(2) { background: #0000ff; }\
table.golem-graph tbody td div.goal div:nth-last-child(3) { background: #00ffff; }\
table.golem-graph tbody td div.goal div:nth-last-child(4) { background: #aa00aa; }\
.golem-button, .golem-button-active { border: 1px solid #d3d3d3; background: #e6e6e6 url(http://cloutman.com/css/base/images/ui-bg_glass_75_e6e6e6_1x400.png) 50% 50% repeat-x; display: inline-block; cursor: pointer; margin-left: 1px; margin-right: 1px; font-weight: normal; font-size: 13px; color: #555555; padding: 2px 2px 2px 2px; -moz-border-radius: 3px; -webkit-border-radius: 3px; border-radius: 3px; }\
.golem-button:hover, .golem-button-active { border: 1px solid #aaaaaa; background: #dadada url(http://cloutman.com/css/base/images/ui-bg_glass_75_dadada_1x400.png) 50% 50% repeat-x; }\
img.golem-button, img.golem-button-active { margin-bottom: -2px }\
.golem-tab-header { position: relative; top: 1px; border: 1px solid #d3d3d3; display: inline-block; cursor: pointer; margin-left: 1px; margin-right: 1px; background: #e6e6e6 url(http://cloutman.com/css/base/images/ui-bg_glass_75_e6e6e6_1x400.png) 50% 50% repeat-x; font-weight: normal; color: #555555; padding: 2px 2px 1px 2px; -moz-border-radius-topleft: 3px; -webkit-border-top-left-radius: 3px; border-top-left-radius: 3px; -moz-border-radius-topright: 3px; -webkit-border-top-right-radius: 3px; border-top-right-radius: 3px; }\
.golem-tab-header-active { border: 1px solid #aaaaaa; border-bottom: 0 !important; padding: 2px; background: #dadada url(http://cloutman.com/css/base/images/ui-bg_glass_75_dadada_1x400.png) 50% 50% repeat-x; }\
.golem-title { padding: 4px; overflow: hidden; border-bottom: 1px solid #aaaaaa; background: #cccccc url(http://cloutman.com/css/base/images/ui-bg_highlight-soft_75_cccccc_1x100.png) 50% 50% repeat-x; color: #222222; font-weight: bold; }\
.golem-panel > .golem-panel-header, .golem-panel > * > .golem-panel-header { border: 1px solid #d3d3d3; cursor: pointer; margin-top: 1px; background: #e6e6e6 url(http://cloutman.com/css/base/images/ui-bg_glass_75_e6e6e6_1x400.png) 50% 50% repeat-x; font-weight: normal; color: #555555; padding: 2px 2px 2px 2px; -moz-border-radius: 3px; -webkit-border-radius: 3px; border-radius: 3px; }\
.golem-panel > .golem-panel-content, .golem-panel > * > .golem-panel-content { border: 1px solid #aaaaaa; border-top: 0 !important; padding: 2px 6px; background: #ffffff url(http://cloutman.com/css/base/images/ui-bg_glass_65_ffffff_1x400.png) 50% 50% repeat-x; font-weight: normal; color: #212121; display: none; -moz-border-radius-bottomleft: 3px; -webkit-border-bottom-left-radius: 3px; border-bottom-left-radius: 3px; -moz-border-radius-bottomright: 3px; -webkit-border-bottom-right-radius: 3px; border-bottom-right-radius: 3px; }\
.golem-panel-show > .golem-panel-header, .golem-panel-show > * > .golem-panel-header { border: 1px solid #aaaaaa; border-bottom: 0 !important; background: #dadada url(http://cloutman.com/css/base/images/ui-bg_glass_75_dadada_1x400.png) 50% 50% repeat-x; -moz-border-radius-bottomleft: 0 !important; -webkit-border-bottom-left-radius: 0 !important; border-bottom-left-radius: 0 !important; -moz-border-radius-bottomright: 0 !important; -webkit-border-bottom-right-radius: 0 !important; border-bottom-right-radius: 0 !important; }\
.golem-panel-show > .golem-panel-content, .golem-panel-show > * > .golem-panel-content { display: block; }\
.golem-panel-sortable .golem-lock { display: none; }\
.golem-panel .golem-panel-header .golem-icon { float: left; width: 16px; height: 16px; background: url('data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%10%00%00%00%10%08%03%00%00%00(-%0FS%00%00%00%06PLTEUUU%00%00%00%F5%04%9F%A0%00%00%00%02tRNS%FF%00%E5%B70J%00%00%00%22IDATx%DAb%60D%03%0C%D4%13%60%C0%10%60%C0%10%60%C0%10%60%20%A4%82%90-%149%1D%20%C0%00%81%0E%00%F1%DE%25%95%BE%00%00%00%00IEND%AEB%60%82') no-repeat; }\
.golem-panel .golem-panel-header .golem-lock { float: right; width: 16px; height: 16px; background: url('data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%10%00%00%00%10%08%03%00%00%00(-%0FS%00%00%00%06PLTEUUU%00%00%00%F5%04%9F%A0%00%00%00%02tRNS%FF%00%E5%B70J%00%00%001IDATx%DAb%60D%03%0CD%0B000%A0%0800%C0D%E0%02%8C(%02%0C%0Cp%25%B8%05%18%09%0A%A0j%C1%B4%96%1C%BF%C0%01%40%80%01%00n%11%00%CF%7D%2Bk%9B%00%00%00%00IEND%AEB%60%82') no-repeat;}\
.golem-panel-show .golem-panel-header .golem-icon { float: left; width: 16px; height: 16px; background: url('data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%10%00%00%00%10%08%03%00%00%00(-%0FS%00%00%00%06PLTEUUU%00%00%00%F5%04%9F%A0%00%00%00%02tRNS%FF%00%E5%B70J%00%00%00%22IDATx%DAb%60D%03%0C4%13%60%80%00%24%15%08%3EL%0B%9C%CF%88N%D3%D0a%C8%00%20%C0%00%7F%DE%00%F1%CCc%A6b%00%00%00%00IEND%AEB%60%82') no-repeat; }\
</style>");
}
// Utility functions

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
		a.shift();
		for (i=0; i<a.length; i++) {
			if (a[i] && a[i].search(/^[-+]?[0-9]+\.?[0-9]*$/) >= 0) {
				a[i] = parseFloat(a[i]);
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

Number.prototype.round = function(dec) {
	return result = Math.round(this*Math.pow(10,(dec||0))) / Math.pow(10,(dec||0));
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

var WorkerByName = function(name) { // Get worker object by Worker.name
	for (var i=0; i<Workers.length; i++) {
		if (Workers[i].name === name) {
			return Workers[i];
		}
	}
	return null;
};

var WorkerById = function(id) { // Get worker object by panel id
	for (var i=0; i<Workers.length; i++) {
		if (Workers[i].id === id) {
			return Workers[i];
		}
	}
	return null;
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
	var l = 0, i;
	if (typeof obj === 'object') {
		for(i in obj) {
			l++;
		}
	} else if (typeof obj === 'array') {
		l = obj.length;
	}
	return l;
};

var unique = function (a) { // Return an array with no duplicates
	var o = {}, i, l = a.length, r = [];
	for(i = 0; i < l; i++) {
		o[a[i]] = a[i];
	}
	for(i in o) {
		r.push(o[i]);
	}
	return r;
};

var sum = function (a) { // Adds the values of all array entries together
	var i, t = 0;
	if (typeof a === 'object' || typeof a === 'array') {
		for(i in a) {
			if (typeof a[i] === 'number') {
				t += a[i];
			} else if (typeof a[i] === 'string' && a[i].search(/^[-+]?[0-9]+\.?[0-9]*$/) >= 0) {
				t = parseFloat(a[i]);
			}
		}
	} else if (typeof a === 'number') {
		t = a;
	} else if (typeof a === 'string' && a.search(/^[-+]?[0-9]+\.?[0-9]*$/) >= 0) {
		t = parseFloat(a);
	}
	return t;
};

var addCommas = function(s) { // Adds commas into a string, ignore any number formatting
	var a=s ? s.toString() : '0', r=new RegExp('(-?[0-9]+)([0-9]{3})');
	while(r.test(a)) {
		a = a.replace(r, '$1,$2');
	}
	return a;
};

var findInArray = function(list, value) {
	if (typeof list === 'array' || typeof list === 'object') {
		for (var i in list) {
			if (list[i] === value) {
				return true;
			}
		}
	}
	return false;
};

var sortObject = function(object, sortfunc) {
	var list = [];
	for (i in object) {
		list.push(i);
	}
	list.sort(sortfunc);
	return list;
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
			if (Math.min(count, own) > 0) {
//				debug('Using: '+Math.min(count, own)+' x '+units[i]+' = '+list[units[i]].toSource());
				if (!list[units[i]].use) {
					list[units[i]].use = {};
				}
				list[units[i]].use[(user+'_'+x)] = Math.min(count, own);
			} else if (list[units[i]].use) {
				delete list[units[i]].use[user+'_'+x];
				if (!length(list[units[i]].use)) {
					delete list[units[i]].use;
				}
			}
		}
		if (count <= 0) {break;}
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

var isArray = function(obj) {   
    return obj && typeof obj === 'object' && !(obj.propertyIsEnumerable('length')) && typeof obj.length === 'number';
};

var isNumber = function(num) {
	return num && typeof num === 'number';
};

if (typeof GM_getValue !== 'undefined') {
	var setItem = function(n,v){GM_setValue(n, v);}
	var getItem = function(n){return GM_getValue(n);}
} else {
	if (typeof localStorage !== 'undefined') {
		var setItem = function(n,v){localStorage.setItem('golem.' + APP + n, v);}
		var getItem = function(n){return localStorage.getItem('golem.' + APP + n);}
	} else if (typeof window.localStorage !== 'undefined') {
		var setItem = function(n,v){window.localStorage.setItem('golem.' + APP + n, v);}
		var getItem = function(n){return window.localStorage.getItem('golem.' + APP + n);}
	} else if (typeof globalStorage !== 'undefined') {
		var setItem = function(n,v){globalStorage[location.hostname].setItem('golem.' + APP + n, v);}
		var getItem = function(n){return globalStorage[location.hostname].getItem('golem.' + APP + n);}
	}
}

// Simulates PHP's date function
Date.prototype.format = function(format) {
	var returnStr = '';
	var replace = Date.replaceChars;
	for (var i = 0; i < format.length; i++) {
		var curChar = format.charAt(i);
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
	S: function() { return (this.getDate() % 10 == 1 && this.getDate() != 11 ? 'st' : (this.getDate() % 10 == 2 && this.getDate() != 12 ? 'nd' : (this.getDate() % 10 == 3 && this.getDate() != 13 ? 'rd' : 'th'))); },
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
	L: function() { return (((this.getFullYear()%4==0)&&(this.getFullYear()%100 != 0)) || (this.getFullYear()%400==0)) ? '1' : '0'; },
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
	T: function() { var m = this.getMonth(); this.setMonth(0); var result = this.toTimeString().replace(/^.+ \(?([^\)]+)\)?$/, '$1'); this.setMonth(m); return result;},
	Z: function() { return -this.getTimezoneOffset() * 60; },
	// Full Date/Time
	c: function() { return this.format("Y-m-d") + "T" + this.format("H:i:sP"); },
	r: function() { return this.toString(); },
	U: function() { return this.getTime() / 1000; }
};

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
.set(what,value)- Calls this._set(what,value)
				Official way to set any information for another worker
				Overload for "special" data, and pass up to _set if basic data

NOTE: If there is a work() but no display() then work(false) will be called before anything on the queue, but it will never be able to have focus (ie, read only)

*** Private data ***
._loaded		- true once ._init() has run
._working		- Prevent recursive calling of various private functions
._changed		- Timestamp of the last time this.data changed
._watching		- List of other workers that want to have .update() after this.update()

*** Private functions ***
._get(what)		- Returns the data requested, auto-loads if needed, what is 'path.to.data'
._set(what,val)	- Sets this.data[what] to value, auto-loading if needed
._init(keep)	- Calls .init(), loads then saves data (for default values), delete this.data if !nokeep and settings.nodata, then removes itself from use
._load(type)	- Loads data / option from storage, merges with current values, calls .update(type) on change
._save(type)	- Saves data / option to storage, calls .update(type) on change
._flush()		- Calls this._save() then deletes this.data if !this.settings.keep
._unflush()		- Loads .data if it's not there already
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
	this.runtime = null;// {} - set to default runtime values in your worker!
	this.display = null;

	// User functions
	this.init = null; //function() {};
	this.parse = null; //function(change) {return false;};
	this.work = null; //function(state) {return false;};
	this.update = null; //function(type){};
	this.get = function(what) {return this._get(what);}; // Overload if needed
	this.set = function(what,value) {return this._set(what,value);}; // Overload if needed

	// Private data
	this._rootpath = true; // Override only, replaces userID + '.'
	this._loaded = false;
	this._working = {data:false, option:false, runtime:false, update:false};
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
				this._unflush();
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
		if (!this._loaded) {
			this._init();
		}
		this._unflush();
		var x = typeof what === 'string' ? what.split('.') : (typeof what === 'object' ? what : []), data = this.data;
		if (x.length && (x[0] === 'data' || x[0] === 'option' || x[0] === 'runtime')) {
			data = this[x.shift()];
		}
		try {
			switch(x.length) {
				case 0:	return data;
				case 1:	return data[x[0]];
				case 2: return data[x[0]][x[1]];
				case 3: return data[x[0]][x[1]][x[2]];
				case 4: return data[x[0]][x[1]][x[2]][x[3]];
				case 5: return data[x[0]][x[1]][x[2]][x[3]][x[4]];
				case 6: return data[x[0]][x[1]][x[2]][x[3]][x[4]][x[5]];
				case 7: return data[x[0]][x[1]][x[2]][x[3]][x[4]][x[5]][x[6]];
			}
		} catch(err) {
			return null;
		}
	};

	this._set = function(what, value) {
		if (!this._loaded) {
			this._init();
		}
		this._unflush();
		var x = typeof what === 'string' ? what.split('.') : (typeof what === 'object' ? what : []), data = this.data;
		if (x.length && (x[0] === 'data' || x[0] === 'option' || x[0] === 'runtime')) {
			data = this[x.shift()];
		}
		try {
			switch(x.length) {
				case 0:	data = value; break; // Nobody should ever do this!!
				case 1:	data[x[0]] = value; break;
				case 2: data[x[0]][x[1]] = value; break;
				case 3: data[x[0]][x[1]][x[2]] = value; break;
				case 4: data[x[0]][x[1]][x[2]][x[3]] = value; break;
				case 5: data[x[0]][x[1]][x[2]][x[3]][x[4]] = value; break;
				case 6: data[x[0]][x[1]][x[2]][x[3]][x[4]][x[5]] = value; break;
				case 7: data[x[0]][x[1]][x[2]][x[3]][x[4]][x[5]][x[6]] = value; break;
			}
			this._save();
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

	this._unflush = function() {
		if (!this._loaded) {
			this._init();
		}
		if (!this.settings.keep && !this.data) {
			this._load('data');
		}
	}

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
		if (type !== 'data' && type !== 'option' && type !== 'runtime') {
			this._load('data');
			this._load('option');
			this._load('runtime');
			return;
		}
		var old, v = getItem((this._rootpath ? userID + '.' : '') + type + '.' + this.name) || this[type];
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
		if (type !== 'data' && type !== 'option' && type !== 'runtime') {
			return this._save('data') + this._save('option') + this._save('runtime');
		}
		if (typeof this[type] === 'undefined' || !this[type] || this._working[type]) {
			return false;
		}
		var i, n = (this._rootpath ? userID + '.' : '') + type + '.' + this.name, v;
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

/********** Worker.Config **********
* Has everything to do with the config
*/
var Config = new Worker('Config', null, {keep:true});
Config.option = {
	display:'block',
	fixed:true,
	advanced:false
};

Config.init = function() {
	$('head').append('<link rel="stylesheet" href="http://cloutman.com/css/base/jquery-ui.css" type="text/css" />');
	var $btn, $golem_config, $newPanel, i;
	$('div.UIStandardFrame_Content').after('<div class="golem-config' + (Config.option.fixed?' golem-config-fixed':'') + '"><div class="ui-widget-content"><div class="golem-title">Castle Age Golem v' + VERSION + '<img id="golem_fixed"></div><div id="golem_buttons" style="margin:4px;"><img class="golem-button' + (Config.option.display==='block'?'-active':'') + '" id="golem_options" src="data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%10%00%00%00%10%08%03%00%00%00(-%0FS%00%00%00%0FPLTE%E2%E2%E2%8A%8A%8A%AC%AC%AC%FF%FF%FFUUU%1C%CB%CE%D3%00%00%00%04tRNS%FF%FF%FF%00%40*%A9%F4%00%00%00%3DIDATx%DA%A4%8FA%0E%00%40%04%03%A9%FE%FF%CDK%D2%B0%BBW%BD%CD%94%08%8B%2F%B6%10N%BE%A2%18%97%00%09pDr%A5%85%B8W%8A%911%09%A8%EC%2B%8CaM%60%F5%CB%11%60%00%9C%F0%03%07%F6%BC%1D%2C%00%00%00%00IEND%AEB%60%82"></div><div style="display:'+Config.option.display+';"><div id="golem_config" style="margin:0 4px;overflow:hidden;overflow-y:auto;"></div><div style="text-align:right;"><label>Advanced <input type="checkbox" id="golem-config-advanced"' + (Config.option.advanced ? ' checked' : '') + '></label></div></div></div></div>');
	$('#golem_options').click(function(){
		$(this).toggleClass('golem-button golem-button-active');
		Config.option.display = Config.option.display==='block' ? 'none' : 'block';
		$('#golem_config').parent().toggle('blind'); //Config.option.fixed?null:
		Config._save('option');
	});
	$('#golem_fixed').click(function(){
		Config.option.fixed ^= true;
		$(this).closest('.golem-config').toggleClass('golem-config-fixed');
		Config._save('option');
	});
	$golem_config = $('#golem_config');
	for (i in Workers) {
		$golem_config.append(Config.makePanel(Workers[i]));
	}
	$golem_config.sortable({axis:"y"}); //, items:'div', handle:'h3' - broken inside GM
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
	$golem_config.children('.golem-panel-sortable')
		.draggable({ connectToSortable:'#golem_config', axis:'y', distance:5, scroll:false, handle:'h3', helper:'clone', opacity:0.75, zIndex:100,
refreshPositions:true, stop:function(){Config.updateOptions();} })
		.droppable({ tolerance:'pointer', over:function(e,ui) {
			if (Config.getPlace($(this).attr('id')) < Config.getPlace($(ui.draggable).attr('id'))) {
				$(this).before(ui.draggable);
			} else {
				$(this).after(ui.draggable);
			}
		} });
	for (i in Workers) { // Update all select elements
		if (Workers[i].select) {
			Workers[i].select();
		}
	}
	$('input.golem_addselect').live('click', function(){
		$('select.golem_multiple', $(this).parent()).append('<option>'+$('.golem_select', $(this).parent()).val()+'</option>');
		Config.updateOptions();
	});
	$('input.golem_delselect').live('click', function(){
		$('select.golem_multiple option[selected=true]', $(this).parent()).each(function(i,el){$(el).remove();})
		Config.updateOptions();
	});
	$('input,textarea,select', $golem_config).change( function(){
		Config.updateOptions();
	});
	$('#golem-config-advanced').click(function(){
		Config.updateOptions();
		$('.golem-advanced').css('display', Config.option.advanced ? 'block' : 'none');}
	);
};

Config.makePanel = function(worker) {
	var i, o, x, id, step, show, $head, $panel, display = worker.display, panel = [], txt = [], list = [], options = {
		before: '',
		after: '',
		suffix: '',
		className: '',
		between: 'to',
		size: 7,
		min: 0,
		max: 100
	};
	if (!display) {
		return false;
	}
	worker.id = 'golem_panel_'+worker.name.toLowerCase().replace(/[^0-9a-z]/,'_');
	show = findInArray(Config.option.active, worker.id);
	$head = $('<div id="' + worker.id + '" class="golem-panel' + (worker.settings.unsortable?'':' golem-panel-sortable') + (show?' golem-panel-show':'') + (worker.settings.advanced ?  ' golem-advanced' + (Config.option.advanced ? '' : '" style="display:none;"') : '"') + ' name="' + worker.name + '"><h3 class="golem-panel-header "><img class="golem-icon">' + worker.name + '<img class="golem-lock"></h3></div>');
	switch (typeof display) {
		case 'array':
		case 'object':
			for (i in display) {
				txt = [];
				list = [];
				o = $.extend(true, {}, options, display[i]);
				o.real_id = PREFIX + worker.name + '_' + o.id;
				o.value = worker.option[o.id] || null;
				o.alt = (o.alt ? ' alt="'+o.alt+'"' : '');
				if (o.hr) {
					txt.push('<br><hr style="clear:both;margin:0;">');
				}
				if (o.title) {
					txt.push('<div style="text-align:center;font-size:larger;font-weight:bold;">'+o.title.replace(' ','&nbsp;')+'</div>');
				}
				if (o.label) {
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
						txt.push('<span style="float:right" id="' + o.real_id + '">' + (o.value || o.info) + '</span>');
					} else {
						txt.push(o.info);
					}
				} else if (o.text) {
					txt.push('<input type="text" id="' + o.real_id + '" size="' + o.size + '" value="' + (o.value || '') + '">');
				} else if (o.checkbox) {
					txt.push('<input type="checkbox" id="' + o.real_id + '"' + (o.value ? ' checked' : '') + '>');
				} else if (o.select) {
					switch (typeof o.select) {
						case 'number':
							step = Divisor(o.select);
							for (x=0; x<=o.select; x+=step) {
								list.push('<option' + (o.value==x ? ' selected' : '') + '>' + x + '</option>');
							}
							break;
						case 'string':
							o.className = ' class="golem_'+o.select+'"';
							if (this.data && this.data[o.select] && (typeof this.data[o.select] === 'array' || typeof this.data[o.select] === 'object')) {
								o.select = this.data[o.select];
							} else {
								break; // deliverate fallthrough
							}
						case 'array':
						case 'object':
							if (isArray(o.select)) {
								for (x=0; x<o.select.length; x++) {
									list.push('<option value="' + o.select[x] + '"' + (o.value==o.select[x] ? ' selected' : '') + '>' + o.select[x] + (o.suffix ? ' '+o.suffix : '') + '</option>');
								}
							} else {
								for (x in o.select) {
									list.push('<option value="' + x + '"' + (o.value==x ? ' selected' : '') + '>' + o.select[x] + (o.suffix ? ' '+o.suffix : '') + '</option>');
								}
							}
							break;
					}
					txt.push('<select id="' + o.real_id + '"' + o.className + o.alt + '>' + list.join('') + '</select>');
				} else if (o.multiple) {
					if (typeof o.value === 'array' || typeof o.value === 'object') {
						for (i in o.value) {
							list.push('<option value="'+o.value[i]+'">'+o.value[i]+'</option>');
						}
					}
					txt.push('<select style="width:100%;clear:both;" class="golem_multiple" multiple id="' + o.real_id + '">' + list.join('') + '</select><br>');
					if (typeof o.multiple === 'string') {
						txt.push('<input class="golem_select" type="text" size="' + o.size + '">');
					} else {
						list = [];
						switch (typeof o.multiple) {
							case 'number':
								step = Divisor(o.select);
								for (x=0; x<=o.multiple; x+=step) {
									list.push('<option>' + x + '</option>');
								}
								break;
							case 'array':
							case 'object':
								if (isArray(o.multiple)) {
									for (x=0; x<o.multiple.length; x++) {
										list.push('<option value="' + o.multiple[x] + '">' + o.multiple[x] + (o.suffix ? ' '+o.suffix : '') + '</option>');
									}
								} else {
									for (x in o.multiple) {
										list.push('<option value="' + x + '">' + o.multiple[x] + (o.suffix ? ' '+o.suffix : '') + '</option>');
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
				panel.push('<div style="clear:both;' + (o.advanced ? (Config.option.advanced ? '"' : 'display:none;"') + ' class="golem-advanced"' : '"') + (o.help ? ' title="' + o.help + '"' : '') + '>' + txt.join('') + '</div>');
			}
			$head.append('<div class="golem-panel-content" style="font-size:smaller;">' + panel.join('') + '<div style="clear:both"></div></div>');
			return $head;
//		case 'function':
//			$panel = display();
//			if ($panel) {
//				$head.append($panel);
//				return $head;
//			}
//			return null;
		default:
			return null;
	}
};

Config.set = function(key, value) {
	this._unflush();
	if (!this.data[key] || this.data[key].toSource() !== value.toSource()) {
		this.data[key] = value;
		$('select.golem_' + key).each(function(i,el){
			var tmp = $(el).attr('id').slice(PREFIX.length).regex(/([^_]*)_(.*)/i), val = tmp ? WorkerByName(tmp[0]).option[tmp[1]] : null, list = Config.data[key], options = [];
			if (isArray(list)) {
				for (i=0; i<list.length; i++) {
					options.push('<option value="' + list[i] + '"' + (val==i ? ' selected' : '') + '>' + list[i] + '</option>');
				}
			} else {
				for (i in list) {
					options.push('<option value="' + i + '"' + (val==i ? ' selected' : '') + '>' + list[i] + '</option>');
				}
			}
			$(el).html(options.join(''));
		});
		this._save();
		return true;
	}
	return false;
};

Config.updateOptions = function() {
//	debug('Options changed');
	// Get order of panels first
	var found = {}, i;
	Queue.option.queue = [];
	$('#golem_config > div').each(function(i,el){
		var name = WorkerById($(el).attr('id')).name;
		if (!found[name]) {
			Queue.option.queue.push(name);
		}
		found[name] = true;
	});
	// Now can we see the advanced stuff
	this.option.advanced = $('#golem-config-advanced').attr('checked');
	// Now save the contents of all elements with the right id style
	$('#golem_config :input').each(function(i,el){
		if ($(el).attr('id')) {
			var val, tmp = $(el).attr('id').slice(PREFIX.length).regex(/([^_]*)_(.*)/i);
			if (!tmp) {
				return;
			}
			if ($(el).attr('type') === 'checkbox') {
				WorkerByName(tmp[0]).option[tmp[1]] = $(el).attr('checked');
			} else if ($(el).attr('multiple')) {
				val = [];
				$('option', el).each(function(i,el){ val.push($(el).text()); });
				WorkerByName(tmp[0]).option[tmp[1]] = val;
			} else {
				val = $(el).attr('value') || ($(el).val() || null);
				if (val && val.search(/[^0-9.]/) === -1) {
					val = parseFloat(val);
				}
				WorkerByName(tmp[0]).option[tmp[1]] = val;
			}
		}
	});
	for (i=0; i<Workers.length; i++) {
		Workers[i]._save('option');
	}
};

Config.getPlace = function(id) {
	var place = -1;
	$('#golem_config > div').each(function(i,el){
		if ($(el).attr('id') === id && place === -1) {
			place = i;
		}
	});
	return place;
};

/********** Worker.Dashboard **********
* Displays statistics and other useful info
*/
var Dashboard = new Worker('Dashboard', '*', {keep:true});
Dashboard.option = {
	display:'block',
	active:null
};

Dashboard.init = function() {
	var id, $btn, tabs = [], divs = [], active = this.option.active;
	for (i=0; i<Workers.length; i++) {
		if (Workers[i].dashboard) {
			id = 'golem-dashboard-'+Workers[i].name;
			if (!active) {
				this.option.active = active = id;
			}
			tabs.push('<h3 name="'+id+'" class="golem-tab-header' + (active===id ? ' golem-tab-header-active' : '') + '">' + (Workers[i] === this ? '&nbsp;*&nbsp;' : Workers[i].name) + '</h3>');
			divs.push('<div id="'+id+'"'+(active===id ? '' : ' style="display:none;"')+'></div>');
			this._watch(Workers[i]);
		}
	}
	$('<div id="golem-dashboard" style="top:' + $('#app'+APPID+'_main_bn').offset().top+'px;display:' + this.option.display+';">' + tabs.join('') + '<div>' + divs.join('') + '</div></div>').prependTo('.UIStandardFrame_Content');
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
		Dashboard.update();
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
		var worker = WorkerByName(Dashboard.option.active.substr(16));
		worker._unflush();
		worker.dashboard($(this).prevAll().length, $(this).attr('name')==='sort');
	});

	$('#golem_buttons').append('<img class="golem-button' + (Dashboard.option.display==='block'?'-active':'') + '" id="golem_toggle_dash" src="data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%10%00%00%00%10%08%03%00%00%00(-%0FS%00%00%00%1EPLTE%BA%BA%BA%EF%EF%EF%E5%E5%E5%D4%D4%D4%D9%D9%D9%E3%E3%E3%F8%F8%F8%40%40%40%FF%FF%FF%00%00%00%83%AA%DF%CF%00%00%00%0AtRNS%FF%FF%FF%FF%FF%FF%FF%FF%FF%00%B2%CC%2C%CF%00%00%00EIDATx%DA%9C%8FA%0A%00%20%08%04%B5%CC%AD%FF%7F%B8%0D%CC%20%E8%D20%A7AX%94q!%7FA%10H%04%F4%00%19*j%07Np%9E%3B%C9%A0%0C%BA%DC%A1%91B3%98%85%AF%D9%E1%5C%A1%FE%F9%CB%14%60%00D%1D%07%E7%0AN(%89%00%00%00%00IEND%AEB%60%82">');
	$('#golem_toggle_dash').click(function(){
		$(this).toggleClass('golem-button golem-button-active');
		Dashboard.option.display = Dashboard.option.display==='block' ? 'none' : 'block';
		if (Dashboard.option.display === 'block' && !$('#'+Dashboard.option.active).children().length) {
			WorkerByName(Dashboard.option.active.substr(16)).dashboard();
		}
		$('#golem-dashboard').toggle('drop');
		Dashboard._save('option');
	});
	window.setInterval(function(){
		$('.golem-timer').each(function(i,el){
			var time = $(el).text().parseTimer();
			if (time && time > 0) {
				$(el).text(makeTimer($(el).text().parseTimer() - 1));
			} else {
				$(el).removeClass('golem-timer').text('now?');
			}
		});
		$('.golem-time').each(function(i,el){
			var time = parseInt($(el).attr('name')) - Date.now();
			if (time && time > 0) {
				$(el).text(makeTimer(time / 1000));
			} else {
				$(el).removeClass('golem-time').text('now?');
			}
		});
	},1000);
};

Dashboard.parse = function(change) {
	$('#golem-dashboard').css('top', $('#app'+APPID+'_main_bn').offset().top+'px');
};

Dashboard.update = function(type) {
	if (!this._loaded || (type && typeof type !== 'object')) {
		return;
	}
	worker = type || WorkerByName(Dashboard.option.active.substr(16));
	var id = 'golem-dashboard-'+worker.name;
	if (this.option.active === id && this.option.display === 'block') {
		try {
			worker._unflush();
			worker.dashboard();
		}catch(e) {
			debug(e.name + ' in ' + worker.name + '.dashboard(): ' + e.message);
		}
	} else {
		$('#'+id).empty();
	}
};

Dashboard.dashboard = function() {
	var i, list = [];
	for (i=0; i<Workers.length; i++) {
		if (this.data[Workers[i].name]) {
			list.push('<tr><th>' + Workers[i].name + ':</th><td id="golem-status-' + Workers[i].name + '">' + this.data[Workers[i].name] + '</td></tr>');
		}
	}
	list.sort(); // Ok with plain text as first thing that can change is name
	$('#golem-dashboard-Dashboard').html('<table cellspacing="0" cellpadding="0" class="golem-status">' + list.join('') + '</table>');
};

Dashboard.status = function(worker, html) {
	if (html) {
		this.data[worker.name] = html;
	} else {
		delete this.data[worker.name];
	}
	this._save();
};

/********** Worker.Page() **********
* All navigation including reloading
*/
var Page = new Worker('Page', null, {unsortable:true, keep:true});
Page.option = {
	timeout: 15,
	retry: 5
};
Page.page = '';
Page.last = null; // Need to have an "auto retry" after a period
Page.lastclick = null;
Page.when = null;
Page.retry = 0;
Page.checking = true;
Page.node_trigger = null;
Page.display = [
	{
		id:'timeout',
		label:'Retry after',
		select:[10, 15, 30, 60],
		after:'seconds'
	}
];

Page.init = function() {
	// Only perform the check on the two id's referenced in get_cached_ajax()
	// Give a short delay due to multiple children being added at once, 0.1 sec should be more than enough
	$('body').bind('DOMNodeInserted', function(event){
		if (!Page.node_trigger && ($(event.target).attr('id') === 'app'+APPID+'_app_body_container' || $(event.target).attr('id') === 'app'+APPID+'_globalContainer')) {
			Page.node_trigger = window.setTimeout(function(){Page.node_trigger=null;Page.parse_all();},100);
		}
	});
};

Page.parse_all = function() {
	Page.identify();
	var i, list = [];
	for (i=0; i<Workers.length; i++) {
		if (Workers[i].pages && (Workers[i].pages==='*' || (Page.page && Workers[i].pages.indexOf(Page.page)>=0)) && Workers[i].parse) {
			Workers[i]._unflush();
			try {
				if (Workers[i].parse(false)) {
					list.push(Workers[i]);
				}
			}catch(e) {
				debug(e.name + ' in ' + Workers[i].name + '.parse(false): ' + e.message);
			}
		}
	}
	for (i in list) {
		try {
			list[i].parse(true);
		}catch(e) {
			debug(e.name + ' in ' + list[i].name + '.parse(true): ' + e.message);
		}
	}
	for (i=0; i<Workers.length; i++) {
		Workers[i]._flush();
	}
}


Page.work = function(state) {
	if (!this.checking) {
		return false;
	}
	var i, l, list, found = null;
	for (i=0; i<Workers.length && !found; i++) {
		if (!Workers[i].pages || Workers[i].pages==='*') {
			continue;
		}
		list = Workers[i].pages.split(' ');
		for (l=0; l<list.length; l++) {
			if (this.pageNames[list[l]] && !this.data[list[l]] && list[l].indexOf('_active') === -1) {
				found = list[l];
				break;
			}
		}
	}
	if (!state) {
		if (found) {
			return true;
		}
		this.checking = false;
		return false;
	}
	if (found && !this.to(found)) {
		this.data[found] = Date.now(); // Even if it's broken, we need to think we've been there!
		return true;
	}
	return false;
};

Page.pageNames = {
	index:					{url:'index.php', selector:'#app'+APPID+'_indexNewFeaturesBox'},
	quests_quest:			{url:'quests.php', image:'tab_quest_on.gif'}, // If we ever get this then it means a new land...
	quests_quest1:			{url:'quests.php?land=1', image:'land_fire_sel.gif'},
	quests_quest2:			{url:'quests.php?land=2', image:'land_earth_sel.gif'},
	quests_quest3:			{url:'quests.php?land=3', image:'land_mist_sel.gif'},
	quests_quest4:			{url:'quests.php?land=4', image:'land_water_sel.gif'},
	quests_quest5:			{url:'quests.php?land=5', image:'land_demon_realm_sel.gif'},
	quests_quest6:			{url:'quests.php?land=6', image:'land_undead_realm_sel.gif'},
	quests_quest7:			{url:'quests.php?land=7', image:'tab_underworld_big.gif'},
	quests_demiquests:		{url:'symbolquests.php', image:'demi_quest_on.gif'},
	quests_atlantis:		{url:'monster_quests.php', image:'tab_atlantis_on.gif'},
	battle_battle:			{url:'battle.php', image:'battle_on.gif'},
	battle_training:		{url:'battle_train.php', image:'training_grounds_on_new.gif'},
	battle_rank:			{url:'battlerank.php', image:'tab_battle_rank_on.gif'},
	battle_raid:			{url:'raid.php', image:'tab_raid_on.gif'},
	battle_arena:			{url:'arena.php', image:'tab_arena_on.gif'},
	heroes_heroes:			{url:'mercenary.php', image:'tab_heroes_on.gif'},
	heroes_generals:		{url:'generals.php', image:'tab_generals_on.gif'},
	town_soldiers:			{url:'soldiers.php', image:'tab_soldiers_on.gif'},
	town_blacksmith:		{url:'item.php', image:'tab_black_smith_on.gif'},
	town_magic:				{url:'magic.php', image:'tab_magic_on.gif'},
	town_land:				{url:'land.php', image:'tab_land_on.gif'},
	oracle_oracle:			{url:'oracle.php', image:'oracle_on.gif'},
	oracle_demipower:		{url:'symbols.php', image:'demi_on.gif'},
	oracle_treasurealpha:	{url:'treasure_chest.php', image:'tab_treasure_alpha_on.gif'},
	oracle_treasurevanguard:{url:'treasure_chest.php?treasure_set=alpha', image:'tab_treasure_vanguard_on.gif'},
	keep_stats:				{url:'keep.php?user='+userID, image:'tab_stats_on.gif'},
	keep_eliteguard:		{url:'party.php?user='+userID, image:'tab_elite_guard_on.gif'},
	keep_achievements:		{url:'achievements.php', image:'tab_achievements_on.gif'},
	keep_alchemy:			{url:'alchemy.php', image:'tab_alchemy_on.gif'},
	keep_monster:			{url:'battle_monster.php', image:'tab_monster_on.jpg'},
	keep_monster_active:	{url:'battle_monster.php', image:'dragon_view_more.gif'},
	army_invite:			{url:'army.php', image:'invite_on.gif'},
	army_gifts:				{url:'gift.php', selector:'#app'+APPID+'_giftContainer'},
	army_viewarmy:			{url:'army_member.php', image:'view_army_on.gif'},
	army_sentinvites:		{url:'army_reqs.php', image:'sent_invites_on.gif'},
	army_newsfeed:			{url:'army_news_feed.php', selector:'#app'+APPID+'_army_feed_header'}
};

Page.identify = function() {
	this.page = '';
	if (!$('#app'+APPID+'_globalContainer').length) {
		this.reload();
		return null;
	}
	var app_body = $('#app'+APPID+'_app_body'), p;
	$('img', app_body).each(function(i,el){
		var filename = $(el).attr('src').filepart();
		for (p in Page.pageNames) {
			if (Page.pageNames[p].image && filename === Page.pageNames[p].image) {
				Page.page = p;
				return;
			}
		}
	});
	if (!this.page) {
		for (p in Page.pageNames) {
			if (Page.pageNames[p].selector && $(Page.pageNames[p].selector, app_body).length) {
				Page.page = p;
			}
		}
	}
	if (this.page !== '') {
		this.data[this.page] = Date.now();
	}
//	debug('this.identify("'+Page.page+'")');
	return this.page;
};

Page.loading = false;
Page.to = function(page, args) {
	if (Queue.option.pause) {
		debug('Trying to load page when paused...');
		return true;
	}
	if (page === this.page && typeof args === 'undefined') {
		return true;
	}
	if (!args) {
		args = '';
	}
	if (page && this.pageNames[page] && this.pageNames[page].url) {
		this.clear();
		this.last = this.pageNames[page].url;
		this.when = Date.now();
		if (args.indexOf('?') === 0 && this.last.indexOf('?') > 0) {
			this.last = this.last.substr(0, this.last.indexOf('?')) + args;
		} else {
			this.last = this.last + args;
		}
		debug('Navigating to '+this.last+' ('+this.pageNames[page].url+')');
		this.ajaxload();
	}
	return false;
};

Page.ajaxload = function() {
	$.ajax({
		cache:false,
		dataType:'text',
		timeout:this.option.timeout * 1000,
		url:'http://apps.facebook.com/castle_age/'+this.last,
		error:function() {
			debug('Page not loaded correctly, reloading.');
			Page.ajaxload();
		},
		success:function(data){
			if (data.lastIndexOf('</html>') !== -1 && data.lastIndexOf('single_popup') !== -1) { // Last things in source if loaded correctly...
				Page.loading = false;
				data = data.substring(data.indexOf('<div id="app'+APPID+'_globalContainer"'), data.indexOf('<div class="UIStandardFrame_SidebarAds"'));
				$('#app'+APPID+'_AjaxLoadIcon').css('display', 'none');
				$('#app'+APPID+'_globalContainer').empty().append(data);
			} else {
				debug('Page not loaded correctly, reloading.');
				Page.ajaxload();
			}
		}
	});
	this.loading = true;
	setTimeout(function() { if (Page.loading) {$('#app'+APPID+'_AjaxLoadIcon').css('display', 'block');} }, 1500);
};

Page.reload = function() {
	window.location.href = 'http://apps.facebook.com/castle_age/index.php?bm=1';
};

Page.click = function(el) {
	if (!$(el).length) {
		debug('Page.click: Unable to find element - '+el);
		return false;
	}
	var e = document.createEvent("MouseEvents");
	e.initEvent("click", true, true);
	$(el).get(0).wrappedJSObject.dispatchEvent(e);
	this.clear();
	this.lastclick = el;
	this.when = Date.now();
	return true;
};

Page.clear = function() {
	this.last = this.lastclick = this.when = null;
	this.retry = 0;
};

/********** Worker.Queue() **********
* Keeps track of the worker queue
*/
var Queue = new Worker('Queue', '*', {unsortable:true, keep:true});
Queue.data = {
	current: null
};
Queue.option = {
	delay: 5,
	clickdelay: 5,
	queue: ["Page", "Queue", "Settings", "LevelUp", "Income", "Elite", "Quest", "Monster", "Arena", "Battle", "Heal", "Land", "Town", "Bank", "Alchemy", "Blessing", "Gift", "Upgrade", "Potions", "Idle"],
	start_stamina: 0,
	stamina: 0,
	start_energy: 0,
	energy: 0
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
		id:'start_stamina',
		before:'Save',
		select:'stamina',
		after:'Stamina Before Using'
	},{
		id:'stamina',
		before:'Always Keep',
		select:'stamina',
		after:'Stamina'
	},{
		id:'start_energy',
		before:'Save',
		select:'energy',
		after:'Energy Before Using'
	},{
		id:'energy',
		before:'Always Keep',
		select:'energy',
		after:'Energy'
	}
];
Queue.runfirst = [];
Queue.lastclick = Date.now();	// Last mouse click - don't interrupt the player
Queue.lastrun = Date.now();		// Last time we ran
Queue.burn = {stamina:false, energy:false};
Queue.timer = null;

Queue.lasttimer = 0;
Queue.lastpause = false;

Queue.init = function() {
	var i, worker, found = {}, play = 'data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%10%00%00%00%10%08%03%00%00%00(-%0FS%00%00%00%0FPLTE%A7%A7%A7%C8%C8%C8YYY%40%40%40%00%00%00%9F0%E7%C0%00%00%00%05tRNS%FF%FF%FF%FF%00%FB%B6%0ES%00%00%00%2BIDATx%DAb%60A%03%0CT%13%60fbD%13%60%86%0B%C1%05%60BH%02%CC%CC%0CxU%A0%99%81n%0BeN%07%080%00%03%EF%03%C6%E9%D4%E3)%00%00%00%00IEND%AEB%60%82', pause = 'data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%10%00%00%00%10%08%03%00%00%00(-%0FS%00%00%00%06PLTE%40%40%40%00%00%00i%D8%B3%D7%00%00%00%02tRNS%FF%00%E5%B70J%00%00%00%1AIDATx%DAb%60D%03%0CT%13%60%60%80%60%3A%0BP%E6t%80%00%03%00%7B%1E%00%E5E%89X%9D%00%00%00%00IEND%AEB%60%82';
	for (i=0; i<this.option.queue.length; i++) { // First find what we've already got
		worker = WorkerByName(this.option.queue[i]);
		if (worker) {
			found[worker.name] = true;
		}
	}
	for (i in Workers) { // Second add any new workers that have a display (ie, sortable)
		if (found[Workers[i].name] || !Workers[i].work || !Workers[i].display) {
			continue;
		}
		log('Adding '+Workers[i].name+' to Queue');
		if (Workers[i].settings.unsortable) {
			this.option.queue.unshift(Workers[i].name);
		} else {
			this.option.queue.push(Workers[i].name);
		}
	}
	for (i=0; i<this.option.queue.length; i++) {	// Third put them in saved order
		worker = WorkerByName(this.option.queue[i]);
		if (worker && worker.id) {
			if (this.data.current && worker.name === this.data.current) {
				debug('Queue: Trigger '+worker.name+' (continue after load)');
				$('#'+worker.id+' > h3').css('font-weight', 'bold');
			}
			$('#golem_config').append($('#'+worker.id));
		}
	}
	$(document).click(function(){Queue.lastclick=Date.now();});

	Queue.lastpause = this.option.pause;
	$btn = $('<img class="golem-button' + (this.option.pause?' red':'') + '" id="golem_pause" src="' + (this.option.pause?play:pause) + '">').click(function() {
		Queue.option.pause ^= true;
		debug('State: '+((Queue.option.pause)?"paused":"running"));
		$(this).toggleClass('red').attr('src', (Queue.option.pause?play:pause));
		Page.clear();
		Config.updateOptions();
	});
	$('#golem_buttons').prepend($btn); // Make sure it comes first
	// Running the queue every second, options within it give more delay
};

Queue.update = function(type) {
	if (!this.option.pause && this.option.delay !== this.lasttimer) {
		window.clearInterval(this.timer);
		this.timer = window.setInterval(function(){Queue.run();}, this.option.delay * 1000);
		this.lasttimer = this.option.delay;
	} else if (this.option.pause && this.option.pause !== this.lastpause) {
		window.clearInterval(this.timer);
		this.lasttimer = -1;
	}
	this.lastpause = this.option.pause;
};

Queue.run = function() {
	var i, worker, found = false, result;
	if (this.option.pause || Date.now() - this.lastclick < this.option.clickdelay * 1000) {
		return;
	}
	if (Page.loading) {
		return; // We want to wait xx seconds after the page has loaded
	}
//	debug('Start Queue');
	this.burn.stamina = this.burn.energy = 0;
	if (this.option.burn_stamina || Player.get('stamina') >= this.option.start_stamina) {
		this.burn.stamina = Math.max(0, Player.get('stamina') - this.option.stamina);
		this.option.burn_stamina = this.burn.stamina > 0;
	}
	if (this.option.burn_energy || Player.get('energy') >= this.option.start_energy) {
		this.burn.energy = Math.max(0, Player.get('energy') - this.option.energy);
		this.option.burn_energy = this.burn.energy > 0;
	}
	for (i=0; i<Workers.length; i++) { // Run any workers that don't have a display, can never get focus!!
		if (Workers[i].work && !Workers[i].display) {
//			debug(Workers[i].name + '.work(false);');
			try {
				Workers[i]._unflush();
				Workers[i].work(false);
			} catch(e){
				debug(e.name + ' in ' + Workers[i].name + '.work(false): ' + e.message);
			}
		}
	}
	for (i=0; i<this.option.queue.length; i++) {
		worker = WorkerByName(this.option.queue[i]);
		if (!worker || !worker.work || !worker.display) {
			continue;
		}
//		debug(worker.name + '.work(' + (this.data.current === worker.name) + ');');
		if (this.data.current === worker.name) {
			try {
				worker._unflush();
				result = worker.work(true);
			}catch(e) {
				debug(e.name + ' in ' + worker.name + '.work(false): ' + e.message);
				result = false;
			}
		} else {
			try {
				result = worker.work(false);
			}catch(e) {
				debug(e.name + ' in ' + worker.name + '.work(false): ' + e.message);
				result = false;
			}
		}
		if (!result && this.data.current === worker.name) {
			this.data.current = null;
			if (worker.id) {
				$('#'+worker.id+' > h3').css('font-weight', 'normal');
			}
			debug('Queue: End '+worker.name);
		}
		if (!result || found) { // We will work(false) everything, but only one gets work(true) at a time
			continue;
		}
		found = true;
		if (this.data.current === worker.name) {
			continue;
		}
		if (this.data.current) {
			debug('Queue: Interrupt '+this.data.current);
			if (WorkerByName(this.data.current).id) {
				$('#'+WorkerByName(this.data.current).id+' > h3').css('font-weight', 'normal');
			}
		}
		this.data.current = worker.name;
		if (worker.id) {
			$('#'+worker.id+' > h3').css('font-weight', 'bold');
		}
		debug('Queue: Trigger '+worker.name);
	}
//	debug('End Queue');
	for (i=0; i<Workers.length; i++) {
		Workers[i]._flush();
	}
};
/********** Worker.Settings **********
* Save and Load settings by name - never does anything to CA beyond Page.reload()
*/
var Settings = new Worker('Settings', null, {unsortable:true,advanced:true});
Settings._rootpath = false; // Override save path so we don't get limited to per-user

Settings.option = {
	action:'None',
	which:'- default -',
	name:'- default -',
	confirm:false
};

Settings.display = [
	{
		title:'IMPORTANT!',
		label:'This will backup and restore your current options.<br>There is no confirmation dialog!'
	},{
		id:'action',
		label:'Action (<b>Immediate!!</b>)',
		select:['None', 'Load', 'Save', 'Delete']
	},{
		id:'which',
		label:'Which',
		select:'settings'
	},{
		id:'name',
		label:'New Name',
		text:true
	}
];

Settings.oldwhich = null;

Settings.init = function() {
	if (!this.data['- default -']) {
		this.set('- default -');
	}
	Settings.oldwhich = this.option.which;
};

Settings.update = function(type) {
	if (type === 'option') {
		var i, list = [];
		if (this.oldwhich !== this.option.which) {
			$('#' + PREFIX + this.name + '_name').val(this.option.which);
			this.option.name = this.option.which;
			this.oldwhich = this.option.which;
		}
		switch (this.option.action) {
			default:
			case 'None':
				break;
			case 'Load':
				this.get(this.option.which);
				break;
			case 'Save':
				this.set(this.option.name);
				this.option.which = this.option.name;
				break;
			case 'Delete':
				if (this.option.which !== '- default -') {
					delete this.data[this.option.which];
				}
				this.option.which = '- default -';
				this.option.name = '- default -';
				break;
		}
		$('#' + PREFIX + this.name + '_action').val('None');
		this.option.action = 'None';
		for (i in this.data) {
			list.push(i);
		}
		Config.set('settings', list.sort());
	}
};

Settings.set = function(what) {
	this._unflush();
	this.data[what] = {};
	for (var i in Workers) {
		if (Workers[i] !== this && Workers[i].option) {
			this.data[what][Workers[i].name] = $.extend(true, {}, Workers[i].option);
		}
	}
};

Settings.get = function(what) {
	this._unflush();
	if (this.data[what]) {
		for (var i in Workers) {
			if (Workers[i] !== this && Workers[i].option && this.data[what][Workers[i].name]) {
				Workers[i].option = $.extend(true, {}, this.data[what][Workers[i].name]);
				Workers[i]._save('option');
			}
		}
		Page.reload();
	}
	return;
};

/********** Worker.Update **********
* Checks if there's an update to the script, and lets the user update if there is.
*/
var Update = new Worker('Update');
Update.data = null;
Update.option = null;

Update.runtime = {
	lastcheck:0,// Date.now() = time since last check
	force:false,// Have we clicked a button, or is it an automatic check
	found:false// Have we found a new version
};

/***** Update.init() *****
1. Add a "Update Now" button to the button bar at the top of Config
1a. On clicking the button check if we've already found an update
1b. If an update was found then get GM to install it
1c. If no update was found then set the lastcheck to 0 to force the next check to come in 5 seconds
*/
Update.init = function() {
	var $btn = $('<img class="golem-button" name="Script Update" id="golem_update" src="data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%10%00%00%00%10%08%03%00%00%00(-%0FS%00%00%00%18PLTE%C7%C7%C7UUU%7B%7B%7B%BF%BF%BF%A6%A6%A6%FF%FF%FF%40%40%40%FF%FF%FFk5%D0%FB%00%00%00%08tRNS%FF%FF%FF%FF%FF%FF%FF%00%DE%83%BDY%00%00%00UIDATx%DAt%8F%5B%12%800%08%03%23%8Fx%FF%1B%5B%C0%96%EA%E8~%95%9D%C0%A48_%E0S%A8p%20%3A%85%F1%C6Jh%3C%DD%FD%205E%E4%3D%18%5B)*%9E%82-%24W6Q%F3Cp%09%E1%A2%8E%A2%13%E8b)lVGU%C7%FF%E7v.%01%06%005%D6%06%07%F9%3B(%D0%00%00%00%00IEND%AEB%60%82">').click(function(){if (Update.get('runtime.found')){window.location.href = 'http://userscripts.org/scripts/source/67412.user.js';} else {Update.set('runtime.force', true);Update.set('runtime.lastcheck', 0);}});
	$('#golem_buttons').append($btn);
};

/***** Update.work() *****
1. Check that we've not already found an update
2. Check that it's been more than 6 hours since the last update
3. Use AJAX to get the Userscripts About page
4. Parse out the Version: string
5. Compare with our own version
6. Remember it if we have an update
7. Notify the user -
7a. Change the update button image
7b. Show a requester to the user asking if they'd like to update
*/
Update.work = function(state) {
	if (!this.runtime.found && Date.now() - this.runtime.lastcheck > 21600000) {// 6+ hours since last check (60x60x6x1000ms)
		this.runtime.lastcheck = Date.now();
		GM_xmlhttpRequest({
			method: "GET",
			url: 'http://userscripts.org/scripts/show/67412',
			onload: function(evt) {
				if (evt.readyState === 4 && evt.status === 200) {
					var remoteVersion = $('#summary', evt.responseText).text().regex(/Version:[^0-9.]+([0-9.]+)/i);
					if (Update.get('runtime.force')) {
						$('#golem_request').remove();
					}
					if (remoteVersion>VERSION) {
						Update.set('runtime.found', true);
						$('#golem_update').attr('src', 'data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%10%00%00%00%10%08%03%00%00%00(-%0FS%00%00%00%18PLTE%C8%C8%C8%C1%C1%C1%BA%BA%BA%F1%F1%F1ggg%FF%FF%FF%40%40%40%FF%FF%FF%7D%5C%EC%14%00%00%00%08tRNS%FF%FF%FF%FF%FF%FF%FF%00%DE%83%BDY%00%00%00OIDATx%DA%8C%8FA%0A%C0%20%0C%04W%8D%EB%FF%7F%AC1%5BQi%A1s%0A%C3%24%10%B4%0B%7C%89%9COa%A4%ED%22q%906a%2CE%09%14%D4%AA%04%BA0%8AH%5C%80%02%12%3E%FB%0A%19b%06%BE2%13D%F0%F0.~%3E%B7%E8%02%0C%00Z%03%06Q9dE%25%00%00%00%00IEND%AEB%60%82').toggleClass('golem-button golem-button-active');
						if (Update.get('runtime.force')) {
							$('#golem_config').after('<div id="golem_request" title="Castle Age Golem"><p>There is a new version of Castle Age Golem available.</p><p>Current&nbsp;version:&nbsp;'+VERSION+', New&nbsp;version:&nbsp;'+remoteVersion+'</p></div>');
							$('#golem_request').dialog({ modal:true, buttons:{"Install":function(){$(this).dialog("close");window.location.href='http://userscripts.org/scripts/source/67412.user.js';}, "Skip":function(){$(this).dialog("close");}} });
						}
						log('New version available: '+remoteVersion);
					} else if (Update.get('runtime.force')) {
						$('#golem_config').after('<div id="golem_request" title="Castle Age Golem"><p>There are no new versions available.</p></div>');
						$('#golem_request').dialog({ modal:true, buttons:{"Ok":function(){$(this).dialog("close");}} });
					}
					Update.set('runtime.force', false);
				}
			}
		});
	}
};

/********** Worker.Alchemy **********
* Get all ingredients and recipes
*/
var Alchemy = new Worker('Alchemy', 'keep_alchemy');
Alchemy.data = {
	ingredients:{},
	recipe:{}
};

Alchemy.option = {
	perform:true,
	hearts:false
};

Alchemy.runtime = {
	best:null
};

Alchemy.display = [
	{
		id:'perform',
		label:'Automatically Perform',
		checkbox:true
	},{
		id:'hearts',
		label:'Use Battle Hearts',
		checkbox:true
	}
];

Alchemy.parse = function(change) {
	var ingredients = Alchemy.data.ingredients = {}, recipe = Alchemy.data.recipe = {};
	$('div.ingredientUnit').each(function(i,el){
		var name = $('img', el).attr('src').filepart();
		ingredients[name] = $(el).text().regex(/x([0-9]+)/);
	});
	$('div.alchemyQuestBack,div.alchemyRecipeBack,div.alchemyRecipeBackMonster').each(function(i,el){
		var me = {}, title = $('div.recipeTitle', el).text().trim().replace('RECIPES: ','');
		if (title.indexOf(' (')>0) {title = title.substr(0, title.indexOf(' ('));}
		if ($(el).hasClass('alchemyQuestBack')) {me.type = 'Quest';}
		else if ($(el).hasClass('alchemyRecipeBack')) {me.type = 'Recipe';}
		else if ($(el).hasClass('alchemyRecipeBackMonster')) {me.type = 'Summons';}
		else {me.type = 'wtf';}
		me.ingredients = {};
		$('div.recipeImgContainer', el).parent().each(function(i,el){
			var name = $('img', el).attr('src').filepart();
			me.ingredients[name] = ($(el).text().regex(/x([0-9]+)/) || 1);
		});
		recipe[title] = me;
	});
};

Alchemy.update = function() {
	var best = null, recipe = this.data.recipe, r, i;
	for (r in recipe) {
		if (recipe[r].type === 'Recipe') {
			best = r;
			for (i in recipe[r].ingredients) {
				if ((!Alchemy.option.hearts && i === 'raid_hearts.gif') || recipe[r].ingredients[i] > (Alchemy.data.ingredients[i] || 0)) {
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
	if (!Alchemy.option.perform || !Alchemy.runtime.best) {
		return false;
	}
	if (!state || !Page.to('keep_alchemy')) {
		return true;
	}
	debug('Alchemy: Perform - '+Alchemy.runtime.best);
	$('div.alchemyRecipeBack').each(function(i,el){
		if($('div.recipeTitle', el).text().indexOf(Alchemy.runtime.best) >= 0) {
			Page.click($('input[type="image"]', el));
			return true;
		}
	});
	return true;
};

/********** Worker.Arena() **********
* Build your arena army
* Auto-attack Arena targets
*/
var Arena = new Worker('Arena', 'battle_arena');
Arena.data = {
	user:{}
};

Arena.option = {
	enabled:false,
	maxhealth:25,
	general:true,
	losses:5,
	cache:50,
	type:'Invade',
	rank:'None',
	bp:'Don\'t Care',
	army:1,
	level:'Any'
};

Arena.runtime = {
	recheck:false,
	attacking:null
};

Arena.rank = {
	Brawler:1,
	Swordsman:2,
	Warrior:3,
	Gladiator:4,
	Hero:5,
	Legend:6
};

Arena.knar = [
	'None',
	'Brawler',
	'Swordsman',
	'Warrior',
	'Gladiator',
	'Hero',
	'Legend'
];

Arena.display = [
	{
		label:'NOTE: Make sure this is disabled if you are not fighting and drag into order relative to the Monster panel!'
	},{
		id:'enabled',
		label:'Arena Enabled',
		checkbox:true
	},{
		id:'general',
		label:'Use Best General',
		checkbox:true
	},{
		id:'type',
		label:'Battle Type',
		select:['Invade', 'Duel']
	},{
		id:'bp',
		label:'Higher Relative Rank<br>(Clears Cache)',
		select:['Always', 'Never', 'Don\'t Care']
	},{
		id:'rank',
		label:'Stop at Rank',
		select:Arena.knar,
		help:'Once you reach this rank it will gain a further 500 points, then check your rank every hour'
	},{
		advanced:true,
		id:'losses',
		label:'Attack Until',
		select:['Ignore',1,2,3,4,5,6,7,8,9,10],
		after:'Losses'
	},{
		advanced:true,
		id:'cache',
		label:'Limit Cache Length',
		select:[50,100,150,200,250]
	},{
		id:'army',
		label:'Target Army Ratio<br>(Only needed for Invade)',
		select:['Any', 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.1, 1.2, 1.3, 1.4, 1.5],
		help:'Smaller number for smaller target army. Reduce this number if you\'re losing in Invade'
	},{
		id:'level',
		label:'Target Level Ratio<br>(Mainly used for Duel)',
		select:['Any', 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.1, 1.2, 1.3, 1.4, 1.5],
		help:'Smaller number for lower target level. Reduce this number if you\'re losing a lot'
	},{
		id:'maxhealth',
		label:'Maximum Health',
		text:true,
		help:'Will not fight in the Arena if your health is above this amount.'
	}
];

Arena.parse = function(change) {
	var data = this.data.user, newrank;
	if (!this.option.enabled || $('#app'+APPID+'_arena_body div div:contains("Arena is over, wait for next season!")').length) {
		// Arena is over for now, so disable and return!
		$('#' + PREFIX + this.name + '_enabled').attr('checked', false);
		this.option.enabled = false;
		return false;
	}
	if (this.runtime.attacking) {
		uid = this.runtime.attacking;
		this.runtime.attacking = null;
		if ($('div.results').text().match(/You cannot battle someone in your army/i)) {
			delete data[uid];
		} else if ($('div.results').text().match(/Your opponent is dead or too weak/i)) {
			data[uid].hide = (data[uid].hide || 0) + 1;
			data[uid].dead = Date.now();
		} else if ($('img[src*="battle_victory"]').length) {
			data[uid].win = (data[uid].win || 0) + 1;
		} else if ($('img[src*="battle_defeat"]').length) {
			data[uid].loss = (data[uid].loss || 0) + 1;
		} else {
			this.runtime.attacking = uid; // Don't remove target as we've not hit them...
		}
	}
	newrank = $('#app'+APPID+'_arena_body img[src*="arena_rank"]').attr('src').regex(/arena_rank([0-9]+).gif/i);
	this.data.points = $('#app'+APPID+'_arena_body img[src*="arena_rank"]').parent().next().next().text().replace(/,/g,'').regex(/Points: ([0-9]+)/i);
	if (this.data.rank !== newrank) {
		this.data.rank = newrank;
		this.data.rankat = this.data.points;
	}
	$('#app'+APPID+'_arena_body table tr:odd').each(function(i,el){
		var uid = $('img[uid!==""]', el).attr('uid'), info = $('td.bluelink', el).text().trim().regex(/Level ([0-9]+) (.*)/i), rank;
		if (!uid || !info) {
			return;
		}
		rank = Arena.rank[info[1]];
		if ((Arena.option.bp === 'Always' && Arena.data.rank - rank > 0) || (!Arena.option.bp === 'Never' && Arena.data.rank - rank < 0)) {
			return;
		}
		data[uid] = data[uid] || {};
		data[uid].name = $('a', el).text().trim();
		data[uid].level = info[0];
		data[uid].rank = rank;
		data[uid].army = $('td.bluelink', el).next().text().regex(/([0-9]+)/);
	});
	return false;
};

Arena.update = function(type) {
	var i, list = [], data = this.data.user, army = Player.get('army'), level = Player.get('level');
	// First make check our target list doesn't need reducing
	for (i in data) { // Forget low or high rank - no points or too many points
		if ((this.option.bp === 'Always' && this.data.rank - data[i].rank > 0) || (!this.option.bp === 'Never' && this.data.rank - data[i].rank < 0)) {
			delete data[i];
		}
	}
	if (length(data) > this.option.cache) { // Need to prune our attack cache
//		debug('Arena: Pruning target cache');
		for (i in data) {
			list.push(i);
		}
		list.sort(function(a,b) {
			var weight = 0;
				 if (((data[a].win || 0) - (data[a].loss || 0)) < ((data[b].win || 0) - (data[b].loss || 0))) { weight += 10; }
			else if (((data[a].win || 0) - (data[a].loss || 0)) > ((data[b].win || 0) - (data[b].loss || 0))) { weight -= 10; }
			if (Arena.option.bp === 'Always') { weight += (data[b].rank - data[a].rank); }
			if (Arena.option.bp === 'Never') { weight += (data[a].rank - data[b].rank); }
			weight += Math.range(-1, (data[b].hide || 0) - (data[a].hide || 0), 1);
			weight += Math.range(-10, ((data[a].army - data[b].army) / 10), 10);
			weight += Math.range(-10, ((data[a].level - data[b].level) / 10), 10);
			return weight;
		});
		while (list.length > this.option.cache) {
			delete data[list.pop()];
		}
	}
	// Second choose our next target
	if (!this.option.enabled) {
		this.runtime.attacking = null;
		Dashboard.status(this);
	} else if (this.option.rank !== 'None' && this.data.rank >= this.rank[this.option.rank] && this.data.points - this.data.rankat >= 500) {
		this.runtime.attacking = null;
		Dashboard.status(this, 'Stopped at ' + this.option.rank);
		this.runtime.recheck = (Page.get('battle_arena') + 3600000 < Date.now());
	} else {
		if (!this.runtime.attacking || !data[this.runtime.attacking]
		|| (this.option.army !== 'Any' && (data[this.runtime.attacking].army / army) > this.option.army)
		|| (this.option.level !== 'Any' && (data[this.runtime.attacking].level / level) > this.option.level)) {
			list = [];
			for (i in data) {
				if ((data[i].dead && data[i].dead + 1800000 >= Date.now()) // If they're dead ignore them for 3m * 10hp = 30 mins
				|| (typeof this.option.losses === 'number' && (data[i].loss || 0) - (data[i].win || 0) >= this.option.losses) // Don't attack someone who wins more often
				|| (this.option.army !== 'Any' && (data[i].army / army) > this.option.army)
				|| (this.option.level !== 'Any' && (data[i].level / level) > this.option.level)) {
					continue;
				}
				list.push(i);
			}
			if (list.length) {
				i = this.runtime.attacking = list[Math.floor(Math.random() * list.length)];
				Dashboard.status(this, 'Next Target: ' + data[i].name + ' (Level ' + data[i].level + ' ' + this.knar[data[i].rank] + ' with ' + data[i].army + ' army), ' + list.length + ' / ' + length(data) + ' targets');
			} else {
				this.runtime.attacking = null;
				Dashboard.status(this, 'No valid targets found (' + length(data) + ' total)');
			}
		}
	}
}

Arena.work = function(state) {
	if (!this.option.enabled || (!this.runtime.recheck && (!this.runtime.attacking || Player.get('health') < 10 || Queue.burn.stamina < 5 || (this.option.maxhealth && (Player.get('health') > this.option.maxhealth))))) {
		return false;
	}
	if (state && this.runtime.recheck && !Page.to('battle_arena')) {
		return true;
	}
	if (!state || this.runtime.recheck || (this.option.general && !Generals.to(this.option.type)) || !Page.to('battle_arena')) {
		return true;
	}
	var uid = this.runtime.attacking, $form = $('form input[alt="'+this.option.type+'"]').first().parents('form');;
	debug('Arena: Wanting to attack '+this.data.user[uid].name+' ('+uid+')');
	if (!$form.length) {
		log('Arena: Unable to find attack buttons, forcing reload');
		Page.to('index');
	} else {
		$('input[name="target_id"]', $form).attr('value', uid);
		Page.click($('input[type="image"]', $form));
	}
	return true;
};

Arena.order = [];
Arena.dashboard = function(sort, rev) {
	var i, o, list = [], output = [], sorttype = ['rank', 'name', 'level', 'army', 'win', 'loss', 'hide'], data = this.data.user, army = Player.get('army'), level = Player.get('level');
	if (typeof sort === 'undefined') {
		this.order = [];
		for (i in data) {
			this.order.push(i);
		}
		sort = 1; // Default = sort by name
	}
	if (typeof sorttype[sort] === 'string') {
		this.order.sort(function(a,b) {
			var aa = (data[a][sorttype[sort]] || 0), bb = (data[b][sorttype[sort]] || 0);
			if (typeof aa === 'string' || typeof bb === 'string') {
				return (rev ? bb > aa : bb < aa);
			}
			return (rev ? aa - bb : bb - aa);
		});
	}

	list.push('<div style="text-align:center;"><strong>Rank:</strong> ' + this.knar[this.data.rank] + ' (' + this.data.rank + '), <strong>Targets:</strong> ' + length(data) + ' / ' + this.option.cache + '</div><hr>');
	th(output, 'Rank');
	th(output, 'Name');
	th(output, 'Level');
	th(output, 'Army');
	th(output, 'Wins');
	th(output, 'Losses');
	th(output, 'Hides');
	list.push('<table cellspacing="0" style="width:100%"><thead><tr>' + output.join('') + '</tr></thead><tbody>');
	for (o=0; o<this.order.length; o++) {
		data = this.data.user[this.order[o]];
		output = [];
		td(output, '<img style="width:22px;height:22px;" src="' + imagepath + 'arena_rank' + data.rank+'.gif">', 'title="' + this.knar[data.rank] + ' (Rank ' + data.rank + ')"');
		th(output, data.name, 'title="'+i+'"');
		td(output, (this.option.level !== 'Any' && (data.level / level) > this.option.level) ? '<i>'+data.level+'</i>' : data.level);
		td(output, (this.option.army !== 'Any' && (data.army / army) > this.option.army) ? '<i>'+data.army+'</i>' : data.army);
		td(output, data.win || '');
		td(output, data.loss || '');
		td(output, data.hide || '');
		tr(list, output.join(''));
	}
	list.push('</tbody></table>');
	$('#golem-dashboard-Arena').html(list.join(''));
	if (typeof sort !== 'undefined') {
		$('#golem-dashboard-Arena thead th:eq('+sort+')').attr('name',(rev ? 'reverse' : 'sort')).append('&nbsp;' + (rev ? '&uarr;' : '&darr;'));
	}
};

/********** Worker.Bank **********
* Auto-banking
*/
var Bank = new Worker('Bank', null);
Bank.data = null;
Bank.option = {
	general: true,
	above: 10000,
	hand: 0,
	keep: 10000
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

Bank.work = function(state) {
	if (Player.get('cash') < this.option.above && (!Queue.get('current') || !WorkerByName(Queue.get('current')).settings.bank)) {
		return false;
	}
	if (!state || !Bank.stash(Player.get('cash') - Math.min(this.option.above, this.option.hand))) {
		return true;
	}
	return false;
};

Bank.stash = function(amount) {
	if (!amount || !Player.get('cash') || Math.min(Player.get('cash'),amount) <= 10) {
		return true;
	}
	if (!Generals.to(Bank.option.general ? 'Aeris' : 'any') || !Page.to('keep_stats')) {
		return false;
	}
	$('input[name="stash_gold"]').val(Math.min(Player.get('cash'), amount));
	Page.click('input[value="Stash"]');
	return true;
};

Bank.retrieve = function(amount) {
	WorkerByName(Queue.get('current')).settings.bank = true;
	amount -= Player.get('cash');
	if (amount <= 0 || (Player.get('bank') - this.option.keep) < amount) {
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
	var worth = Player.get('cash') + Math.max(0,Player.get('bank') - Bank.option.keep);
	if (typeof amount === 'number') {
		return (amount <= worth);
	}
	return worth;
};

/********** Worker.Battle **********
* Battling other players (NOT raid or Arena)
*/
var Battle = new Worker('Battle', 'battle_rank battle_battle');
Battle.data = {
	user: {},
	rank: {},
	points: {}
};

Battle.option = {
	general:true,
	points:true,
	monster:true,
	arena:true,
	losses:5,
	type:'Invade',
	bp:'Always',
	army:1.1,
	level:1.1,
	preferonly:'Sometimes',
	prefer:[]
};

Battle.runtime = {
	attacking:null
};

Battle.symbol = { // Demi-Power symbols
	1:"data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%16%00%00%00%16%08%03%00%00%00%F3j%9C%09%00%00%00%18PLTE%17%90%B3%1AIn%99%AD%B0%3F%5Erj%7F%8A4%40J%22*1%FF%FF%FFm%0F%82%CD%00%00%00%08tRNS%FF%FF%FF%FF%FF%FF%FF%00%DE%83%BDY%00%00%00%ABIDATx%DAl%91%0B%0E%04!%08CAh%E7%FE7%DE%02%BA3%FBib%A2O%A8%02vm%91%00xN%B6%A1%10%EB%86O%0C%22r%AD%0Cmn%0C%8A%8Drxa%60-%B3p%AF%8C%05%0C%06%15d%E6-%5D%90%8D%E5%90~%B0x%A20e%117%0E%D9P%18%A1%60w%F3%B0%1D%1E%18%1C%85m'D%B9%08%E7%C6%FE%0F%B7%CF%13%C77%1Eo%F4%93%05%AA%24%3D%D9%3F%E1%DB%25%8E%07%BB%CA%D8%9C%8E%FE6%A6J%B9%1F%FB%DAa%8A%BFNW3%B5%9ANc%D5%FEn%9El%F7%20%F6tt%8C%12%F01%B4%CE%F8%9D%E5%B7%5E%02%0C%00n%97%07%B1AU%81%B7%00%00%00%00IEND%AEB%60%82",
	2:"data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%16%00%00%00%16%08%03%00%00%00%F3j%9C%09%00%00%00%18PLTE%E0%0D%0CZ%5B%5Bv%13%0F%2F%1A%16%7Byx%8941DB%3F%FF%FF%FFOmpc%00%00%00%08tRNS%FF%FF%FF%FF%FF%FF%FF%00%DE%83%BDY%00%00%00%B4IDATx%DAT%D1%5B%12%C5%20%08%03P%08%C2%DD%FF%8Eo%12%EB%D8%F2%D1%C7%C1%01%C5%F8%3DQ%05T%9D%BFxP%C6%07%EA%CDF%07p%998%B9%14%C3%C4aj%AE%9CI%A5%B6%875zFL%0F%C8%CD%19vrG%AC%CD%5C%BC%C6nM%D57'%EB%CA%AD%EC%C2%E5b%B5%93%5B%E9%97%99%40D%CC%97sw%DB%FByqwF%83u%FA%F2%C8%A3%93u%A0%FD%8C%B8%BA%96NAn%90%17%C1%C7%E1'%D7%F2%85%01%D4%DC%A7d%16%EDM2%1A%C3%C5%1E%15%7DX%C7%23%19%EB%1El%F5h%B2lV%5B%CF%ED%A0w%89~%AE'%CE%ED%01%F7%CA%5E%FC%8D%BF%00%03%00%AA%CE%08%23%FB4h%C4%00%00%00%00IEND%AEB%60%82",
	3:"data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%16%00%00%00%16%08%03%00%00%00%F3j%9C%09%00%00%00%18PLTE%B1%98g%DE%BCyqpq%8CnF%12%11%0EME7y8%0B%FF%FF%FF6%A1%E73%00%00%00%08tRNS%FF%FF%FF%FF%FF%FF%FF%00%DE%83%BDY%00%00%00%B7IDATx%DA%5C%91Y%16C!%0CB%C9%40%BA%FF%1D%17%7Cz%9Em%BE%F4%8A%19%08%3E%3BX%40%F1%DC%B0%A1%99_xcT%EF(%BC8%D8%CC%9A%A9%D4!%0E%0E%8Bf%863%FE%16%0F%06%5BR%22%02%1C%A0%89%07w%E6T%AC%A8A%F6%C2%251_%9CPG%C2%A1r7N%CB%E1%1CtN%E7%06%86%7F%B85%8B%1A%22%2F%AC%3E%D4%B2_.%9C%C6%EA%B3%E2%C6%BB%24%CA%25uY%98%D5H%0D%EE%922%40b%19%09%CFNs%99%C8Y%E2XS%D2%F3*%0F7%B5%B9%B6%AA%16_%0E%9A%D61V%DCu-%E5%A2g%3BnO%C1%B3%1E%9C%EDiax%94%3F%F87%BE%02%0C%00%98%F2%07%E0%CE%8C%E4%B1%00%00%00%00IEND%AEB%60%82",
	4:"data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%16%00%00%00%16%08%03%00%00%00%F3j%9C%09%00%00%00%18PLTE%90%CA%3CSTRq%9B5On*%10%13%0Dx%7Ct6B'%FF%FF%FFx%0A%94%CE%00%00%00%08tRNS%FF%FF%FF%FF%FF%FF%FF%00%DE%83%BDY%00%00%00%B2IDATx%DAT%D1A%16%C4%20%08%03P%20%92%B9%FF%8D'%80%B5%96%85%AF~%95*%D8o%07%09%90%CF%CC6%96%F5%CA%CD%E0%DAA%BC%0CM%B3C%CBxX%9A%E9%15Z%18%B7QW%E2%DB%9B%3D%E0%CD%99%11%18V%3AM%02%CD%FA%08.%8A%B5%D95%B1%A0%A7%E9Ci%D0%9Cb3%034D%F8%CB(%EE%F8%F0%F1%FA%C5ae9%BB%FD%B0%A7%CF%F9%1Au%9FfR%DB%A3%A19%179%CFa%B1%8E%EB*%91%BE_%B9*M%A9S%B7%97%AE)%15%B5%3F%BAX%A9%0Aw%C9m%9A%A0%CA%AA%20%5Eu%E5%D5%1DL%23%D4%9Eu7%AD%DBvZv%F17%FE%02%0C%00%D3%0A%07%E1%0961%CF%00%00%00%00IEND%AEB%60%82",
	5:"data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%16%00%00%00%16%08%03%00%00%00%F3j%9C%09%00%00%00%18PLTE%F2%F2%EF!!%20%A5%A5%A3vvv%5BZZ%3D%3D%3B%00%00%00%FF%FF%FF.%C4%F9%B3%00%00%00%08tRNS%FF%FF%FF%FF%FF%FF%FF%00%DE%83%BDY%00%00%00%BEIDATx%DA%5C%91Q%92%C30%08C%11B%DE%FB%DFx%25%C7n3%E5%23%E3%3Cd%01%A6%FEN%00%12p%FF%EA%40%A3%05%A7%F0%C6%C2%0A%CCW_%AC%B5%C4%1D9%5D%EC39%09'%B0y%A5%D8%E2H%5D%D53%DDH%E1%E05%A6%9A2'%9Bkcw%40%E9%C5e%5Ev%B6g%E4%B1)%DA%DF%EEQ%D3%A0%25Vw%EC%B9%D5)%C8%5Cob%9C%1E%E2%E2%D8%16%F1%94%F8%E0-%AF%B9%F8x%CB%F2%FE%C8g%1Eo%A03w%CA%86%13%DB%C4%1D%CA%7C%B7%E8w%E4d%FAL%E9%CE%9B%F3%F0%D0g%F8%F0%AD%CFSyD%DC%875%87%3B%B0%D1%5D%C4%D9N%5C%13%3A%EB%A9%F7.%F5%BB%CB%DF%F8%17%60%00%EF%2F%081%0F%2BNZ%00%00%00%00IEND%AEB%60%82"
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
		id:'type',
		label:'Battle Type',
		select:['Invade', 'Duel']
	},{
		id:'losses',
		label:'Attack Until',
		select:['Ignore',1,2,3,4,5,6,7,8,9,10],
		after:'Losses'
	},{
		id:'points',
		label:'Always Get Demi-Points',
		checkbox:true
	},{
		advanced:true,
		id:'arena',
		label:'Fight in Arena First',
		checkbox:true,
		help:'Only if the Arena is enabled!'
	},{
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
		id:'cache',
		label:'Limit Cache Length',
		select:[100,200,300,400,500]
	},{
		id:'army',
		label:'Target Army Ratio<br>(Only needed for Invade)',
		select:['Any', 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.1, 1.2, 1.3, 1.4, 1.5],
		help:'Smaller number for smaller target army. Reduce this number if you\'re losing in Invade'
	},{
		id:'level',
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
	this._watch(Arena);
	this._watch(Monster);
};

/***** Battle.parse() *****
1. On the Battle Rank page parse out our current Rank and Battle Points
2. On the Battle page
2a. Check if we've just attacked someone and parse out the results
2b. Parse the current Demi-Points
2c. Check every possible target and if they're eligable then add them to the target list
*/
Battle.parse = function(change) {
	var data, uid;
	if (Page.page === 'battle_rank') {
		data = {0:{name:'Squire',points:0}};
		$('tr[height="23"]').each(function(i,el){
			var info = $(el).text().regex(/Rank ([0-9]+) - (.*)\s*([0-9]+)/i);
			data[info[0]] = {name:info[1], points:info[2]};
		});
		if (length(data) > length(this.data.rank)) {
			this.data.rank = data;
		}
		this.data.bp = $('span:contains("Battle Points.")', 'div:contains("You are a Rank")').text().replace(/,/g, '').regex(/with ([0-9]+) Battle Points/i);
	} else if (Page.page === 'battle_battle') {
		data = this.data.user;
		if (this.runtime.attacking) {
			uid = this.runtime.attacking;
			this.runtime.attacking = null;
			if ($('div.results').text().match(/You cannot battle someone in your army/i)) {
				delete data[uid];
			} else if ($('div.results').text().match(/Your opponent is dead or too weak/i)) {
				data[uid].hide = (data[uid].hide || 0) + 1;
				data[uid].dead = Date.now();
			} else if ($('img[src*="battle_victory"]').length) {
				data[uid].win = (data[uid].win || 0) + 1;
			} else if ($('img[src*="battle_defeat"]').length) {
				data[uid].loss = (data[uid].loss || 0) + 1;
			} else {
				this.runtime.attacking = uid; // Don't remove target as we've not hit them...
			}
		}
		this.data.points = $('#app'+APPID+'_app_body table.layout table table').prev().text().replace(/[^0-9\/]/g ,'').regex(/([0-9]+)\/10([0-9]+)\/10([0-9]+)\/10([0-9]+)\/10([0-9]+)\/10/);
		$('#app'+APPID+'_app_body table.layout table table tr:even').each(function(i,el){
			var uid = $('img[uid!==""]', el).attr('uid'), info = $('td.bluelink', el).text().trim().regex(/Level ([0-9]+) (.*)/i), rank;
			if (!uid || !info) {
				return;
			}
			rank = Battle.rank(info[1]);
			if ((Battle.option.bp === 'Always' && Player.get('rank') - rank > 5) || (!Battle.option.bp === 'Never' && Player.get('rank') - rank <= 5)) {
				return;
			}
			if (!data[uid]) {
				data[uid] = {};
			}
			data[uid].name = $('a', el).text().trim();
			data[uid].level = info[0];
			data[uid].rank = rank;
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
Battle.update = function(type) {
	var i, j, data = this.data.user, list = [], points = [], status = [], army = Player.get('army'), level = Player.get('level'), rank = Player.get('rank'), count = 0;

	list.push('Rank ' + Player.get('rank') + ' ' + this.data.rank[Player.get('rank')].name + ' with ' + addCommas(this.data.bp || 0) + ' Battle Points, Targets: ' + length(data) + ' / ' + this.option.cache + ', Demi Points:');
	for (i=1; i<6; i++ ) {
		list.push(' <img src="' + this.symbol[i] +'" alt=" " title="'+this.demi[i]+'" style="width:11px;height:11px;"> ' + this.data.points[i-1]);
	}
	status.push(list.join(''));
	list = [];

	// First make check our target list doesn't need reducing
	for (i in data) { // Forget low or high rank - no points or too many points
		if ((this.option.bp === 'Always' && rank - (data[i].rank || 0) >= 4) || (!this.option.bp === 'Never' && rank - (data[i].rank || 6) <= 5)) { // unknown rank never deleted
			delete data[i];
		}
	}
	if (length(this.data.user) > this.option.cache) { // Need to prune our target cache
//		debug('Battle: Pruning target cache');
		for (i in data) {
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
		list = [];
	}
	// Check if we need Demi-points
	if (this.option.points) {
		for (i=0; i<this.data.points.length; i++) {
			if (this.data.points[i] < 10) {
				points[i+1] = true;
			}
		}
	}
	// Second choose our next target
	if (!points.length && this.option.arena && Arena.option.enabled && Arena.runtime.attacking) {
		this.runtime.attacking = null;
		status.push('Battling in the Arena');
	} else if (!points.length && this.option.monster && Monster.count) {
		this.runtime.attacking = null;
		status.push('Attacking Monsters');
	} else {
		if (!this.runtime.attacking || !data[this.runtime.attacking]) {
			this.runtime.attacking = null;
			if (this.option.prefer.length) {
				for(j=0; j<this.option.prefer.length; j++) {
					i = this.option.prefer[j];
					if (!/[^0-9]/g.test(i)) {
						data[i] = data[i] || {};
						if ((data[i].dead && data[i].dead + 300000 >= Date.now()) // If they're dead ignore them for 1hp = 5 mins
						|| (typeof this.option.losses === 'number' && (data[i].loss || 0) - (data[i].win || 0) >= this.option.losses)) { // Don't attack someone who wins more often
							continue;
						}
						list.push(i,i,i,i,i,i,i,i,i,i); // If on the list then they're worth at least 10 ;-)
						count++;
					}
				}
			}
		}
		if ((this.option.preferonly === 'Never' || this.option.preferonly === 'Sometimes' || (this.option.preferonly === 'Only' && !length(this.option.prefer)) || (this.option.preferonly === 'Until Dead' && !list.length))
		&& ((this.option.army !== 'Any' && (data[this.runtime.attacking].army / army) > this.option.army)
		|| (this.option.level !== 'Any' && (data[this.runtime.attacking].level / level) > this.option.level))) {
			for (i in data) {
				if ((data[i].dead && data[i].dead + 1800000 >= Date.now()) // If they're dead ignore them for 3m * 10hp = 30 mins
				|| (typeof this.option.losses === 'number' && (data[i].loss || 0) - (data[i].win || 0) >= this.option.losses) // Don't attack someone who wins more often
				|| (this.option.army !== 'Any' && ((data[i].army || 0) / army) > this.option.army)
				|| (this.option.level !== 'Any' && ((data[i].level || 0) / level) > this.option.level)
				|| (points.length && data[i].align && typeof points[data[i].align] === 'undefined')) {
					continue;
				}
				for (j=Math.range(1,(data[i].rank || 0)-rank+1,5); j>0; j--) { // more than 1 time if it's more than 1 difference
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
			status.push('Next Target: ' + data[i].name + ' (Level ' + data[i].level + ' ' + this.data.rank[data[i].rank].name + ' with ' + data[i].army + ' army)' + (count ? ', ' + count + ' valid targets' : ''));
		} else {
			this.runtime.attacking = null;
			status.push('No valid targets found');
		}
	}
	Dashboard.status(this, status.join('<br>'));
}

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
	if (!this.runtime.attacking || Player.get('health') < 10 || Queue.burn.stamina < 1) {
		return false;
	}
	if (!state || (this.option.general && !Generals.to(Generals.best(this.option.type))) || !Page.to('battle_battle')) {
		return true;
	}
	var $form = $('form input[alt="'+this.option.type+'"]').first().parents('form');
	if (!$form.length) {
		debug('Battle: Unable to find attack buttons, forcing reload');
		Page.to('index');
	} else {
		log('Battle: Attacking ' + this.data.user[this.runtime.attacking].name + ' (' + this.runtime.attacking + ')');
		$('input[name="target_id"]', $form).attr('value', this.runtime.attacking);
		Page.click($('input[type="image"]', $form));
	}
	return true;
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
		sort = 1; // Default = sort by name
	}
	if (typeof sorttype[sort] === 'string') {
		this.order.sort(function(a,b) {
			var aa = (data[a][sorttype[sort]] || 0), bb = (data[b][sorttype[sort]] || 0);
			if (typeof aa === 'string' || typeof bb === 'string') {
				return (rev ? bb > aa : bb < aa);
			}
			return (rev ? aa - bb : bb - aa);
		});
	}
	list.push('<div style="text-align:center;"><strong>Rank:</strong> ' + this.data.rank[Player.get('rank')].name + ' (' + Player.get('rank') + '), <strong>Targets:</strong> ' + length(data) + ' / ' + this.option.cache + ', <strong>By Alignment:</strong>');
	for (i=1; i<6; i++ ) {
		list.push(' <img src="' + this.symbol[i] +'" alt="'+this.demi[i]+'" title="'+this.demi[i]+'" style="width:11px;height:11px;"> ' + points[i]);
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
		td(output, '<img src="' + this.symbol[data.align] + '" alt="' + this.demi[data.align] + '">', 'title="' + this.demi[data.align] + '"');
		th(output, data.name, 'title="'+i+'"');
		td(output, (this.option.level !== 'Any' && (data.level / level) > this.option.level) ? '<i>'+data.level+'</i>' : data.level);
		td(output, this.data.rank[data.rank] ? this.data.rank[data.rank].name : '');
		td(output, (this.option.army !== 'Any' && (data.army / army) > this.option.army) ? '<i>'+data.army+'</i>' : data.army);
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

/********** Worker.Blessing **********
* Automatically receive blessings
*/
var Blessing = new Worker('Blessing', 'oracle_demipower');
Blessing.data = null;

Blessing.option = {
	which:'Stamina'
};

Blessing.runtime = {
	when:0
};

Blessing.which = ['None', 'Energy', 'Attack', 'Defense', 'Health', 'Stamina'];
Blessing.display = [{
	id:'which',
	label:'Which',
	select:Blessing.which
}];

Blessing.parse = function(change) {
	var result = $('div.results'), time;
	if (result.length) {
		time = result.text().regex(/Please come back in: ([0-9]+) hours and ([0-9]+) minutes/i);
		if (time && time.length) {
			this.runtime.when = Date.now() + (((time[0] * 60) + time[1] + 1) * 60000);
		} else if (result.text().match(/You have paid tribute to/i)) {
			this.runtime.when = Date.now() + 86460000; // 24 hours and 1 minute
		}
	}
	return false;
};

Blessing.work = function(state) {
	if (!this.option.which || this.option.which === 'None' || Date.now() <= this.runtime.when) {
		return false;
	}
	if (!state || !Page.to('oracle_demipower')) {
		return true;
	}
	Page.click('#app'+APPID+'_symbols_form_'+this.which.indexOf(this.option.which)+' input.imgButton');
	return true;
};

/********** Worker.Elite() **********
* Build your elite army
*/
var Elite = new Worker('Elite', 'keep_eliteguard army_viewarmy battle_arena');
Elite.data = {};

Elite.option = {
	elite:true,
	arena:false,
	every:24,
	prefer:[],
	armyperpage:25 // Read only, but if they change it and I don't notice...
};

Elite.runtime = {
	armylastpage:1,
	armyextra:0,
	waitelite:0,
	nextelite:0,
	waitarena:0,
	nextarena:0
};

Elite.display = [
	{
		id:'arena',
		label:'Fill Arena Guard',
		checkbox:true
	},{
		id:'elite',
		label:'Fill Elite Guard',
		checkbox:true
	},{
		id:'every',
		label:'Every',
		select:[1, 2, 3, 6, 12, 24],
		after:'hours'
	},{
		advanced:true,
		label:'Add UserIDs to prefer them over random army members. These <b>must</b> be in your army to be checked.',
		id:'prefer',
		multiple:'userid'
	}
];

Elite.init = function() { // Convert old elite guard list
	for(i in this.data) {
		if (typeof this.data[i] === 'number') {
			this.data[i] = {elite:this.data[i]};
		}
	}
};

Elite.parse = function(change) {
	$('span.result_body').each(function(i,el){
		if (Elite.runtime.nextarena) {
			if ($(el).text().match(/has not joined in the Arena!/i)) {
				Elite.data[Elite.runtime.nextarena].arena = -1;
			} else if ($(el).text().match(/Arena Guard, and they have joined/i)) {
				Elite.data[Elite.runtime.nextarena].arena = Date.now() + 86400000; // 24 hours
			} else if ($(el).text().match(/'s Arena Guard is FULL/i)) {
				Elite.data[Elite.runtime.nextarena].arena = Date.now() + 3600000; // 1 hour
			} else if ($(el).text().match(/YOUR Arena Guard is FULL/i)) {
				Elite.runtime.waitarena = Date.now();
				debug('Arena guard full, wait '+Elite.option.every+' hours');
			}
		}
		if ($(el).text().match(/Elite Guard, and they have joined/i)) {
			Elite.data[$('img', el).attr('uid')].elite = Date.now() + 86400000; // 24 hours
		} else if ($(el).text().match(/'s Elite Guard is FULL!/i)) {
			Elite.data[$('img', el).attr('uid')].elite = Date.now() + 3600000; // 1 hour
		} else if ($(el).text().match(/YOUR Elite Guard is FULL!/i)) {
			Elite.runtime.waitelite = Date.now();
			debug('Elite guard full, wait '+Elite.option.every+' hours');
		}
	});
	if (Page.page === 'army_viewarmy') {
		var count = 0;
		$('img[linked="true"][size="square"]').each(function(i,el){
			var uid = $(el).attr('uid'), who = $(el).parent().parent().next();
			count++;
			Elite.data[uid] = Elite.data[uid] || {};
			Elite.data[uid].name = $('a', who).text();
			Elite.data[uid].level = $(who).text().regex(/([0-9]+) Commander/i);
		});
		if (count < 25) {
			this.runtime.armyextra = Player.get('armymax') - length(this.data) - 1;
		}
	}
	return false;
};

Elite.update = function() {
	var i, j, tmp = [], now = Date.now(), check;
	this.runtime.nextelite = this.runtime.nextarena = 0;
	for(j=0; j<this.option.prefer.length; j++) {
		i = this.option.prefer[j];
		if (!/[^0-9]/g.test(i) && this.data[i]) {
			if (!this.runtime.nextelite && (typeof this.data[i].elite !== 'number' || this.data[i].elite < Date.now())) {
				this.runtime.nextelite = i;
			}
			if (!this.runtime.nextarena && (typeof this.data[i].arena !== 'number' || (this.data[i].arena !== -1 && this.data[i].arena < Date.now()))) {
				this.runtime.nextarena = i;
			}
		}
	}
	for(i in this.data) {
		if (!this.runtime.nextelite && (typeof this.data[i].elite !== 'number' || this.data[i].elite < Date.now())) {
			this.runtime.nextelite = i;
		}
		if (!this.runtime.nextarena && (typeof this.data[i].arena !== 'number' || (this.data[i].arena !== -1 && this.data[i].arena < Date.now()))) {
			this.runtime.nextarena = i;
		}
	}
	if (this.option.elite || this.option.arena) {
		if (this.option.arena) {
			check = (this.runtime.waitarena + (this.option.every * 3600000));
			tmp.push('Arena Guard: Check' + (check < now ? 'ing now' : ' in <span class="golem-time" name="' + check + '">' + makeTimer((check - now) / 1000) + '</span>'));
		}
		if (this.option.elite) {
			check = (this.runtime.waitelite + (this.option.every * 3600000));
			tmp.push('Elite Guard: Check' + (check < now ? 'ing now' : ' in <span class="golem-time" name="' + check + '">' + makeTimer((check - now) / 1000) + '</span>'));
		}
		Dashboard.status(this, tmp.join(', '));
	} else {
		Dashboard.status(this);
	}
};

Elite.work = function(state) {
	var i, j, found = null;
	if (Math.ceil((Player.get('armymax') - this.runtime.armyextra - 1) / this.option.armyperpage) > this.runtime.armylastpage) {
		if (state) {
			debug('Elite: Filling army list');
			this.runtime.armylastpage = Math.max(this.runtime.armylastpage + 1, Math.ceil((length(this.data) + 1) / this.option.armyperpage));
			Page.to('army_viewarmy', '?page=' + this.runtime.armylastpage);
		}
		return true;
	}
	if ((!this.option.elite || (this.runtime.waitelite + (this.option.every * 3600000)) > Date.now()) && (!this.option.arena || (this.runtime.waitarena + (this.option.every * 3600000)) > Date.now())) {
		return false;
	}
	if (!state) {
		return true;
	}
	if (!this.runtime.nextelite && !this.runtime.nextarena && !length(this.data) && !Page.to('army_viewarmy')) {
		return true;
	}
	if ((this.runtime.waitelite + (this.option.every * 3600000)) <= Date.now()) {
		debug('Elite: Add Elite Guard member '+this.runtime.nextelite);
		if (!Page.to('keep_eliteguard', '?twt=jneg&jneg=true&user=' + this.runtime.nextelite)) {
			return true;
		}
	}
	if ((this.runtime.waitarena + (this.option.every * 3600000)) <= Date.now()) {
		debug('Elite: Add Arena Guard member '+this.runtime.nextarena);
		if (!Page.to('battle_arena', '?user=' + this.runtime.nextarena + '&lka=' + this.runtime.nextarena + '&agtw=1&ref=nf')) {
			return true;
		}
	}
	return false;
};

/********** Worker.Generals **********
* Updates the list of Generals
* Finds best General for other classes
* *** Need to take into account army size and real stats for attack and defense
*/
var Generals = new Worker('Generals', 'heroes_generals');
Generals.option = null;
Generals.runtime = {
	disabled:false // Nobody should touch this except LevelUp!!!
};

Generals.init = function() {
	for (var i in this.data) {
		if (i.indexOf('\t') !== -1) { // Fix bad page loads...
			delete this.data[i];
		}
	}
	this._watch(Town);
};

Generals.parse = function(change) {
	var $elements = $('.generalSmallContainer2'), data = this.data;
	if ($elements.length < length(data)) {
		debug('Generals: Different number of generals, have '+$elements.length+', want '+length(data));
//		Page.to('heroes_generals', ''); // Force reload
		return false;
	}
	$elements.each(function(i,el){
		var name = $('.general_name_div3_padding', el).text().trim(), level = $(el).text().regex(/Level ([0-9]+)/i);
		if (name && name.indexOf('\t') === -1 && name.length < 30) { // Stop the "All generals in one box" bug
			if (!data[name] || data[name].level !== level) {
				data[name] = data[name] || {};
				data[name].img		= $('.imgButton', el).attr('src').filepart();
				data[name].att		= $('.generals_indv_stats_padding div:eq(0)', el).text().regex(/([0-9]+)/);
				data[name].def		= $('.generals_indv_stats_padding div:eq(1)', el).text().regex(/([0-9]+)/);
				data[name].level	= level; // Might only be 4 so far, however...
				data[name].skills	= $('table div', el).html().replace(/\<[^>]*\>|\s+|\n/g,' ').trim();
			}
		}
	});
	return false;
};

Generals.update = function(type) {
	var data = this.data, i, list = [], invade = Town.get('runtime.invade'), duel = Town.get('runtime.duel'), attack, defend, army, gen_att, gen_def, iatt = 0, idef = 0, datt = 0, ddef = 0, listpush = function(list,i){list.push(i);};
	if (type === 'data') {
		for (i in Generals.data) {
			list.push(i);
		}
		Config.set('generals', ['any'].concat(list.sort()));
	}
	if ((type === 'data' || type === Town) && invade && duel) {
		for (i in data) {
			attack = Player.get('attack') + (data[i].skills.regex(/([-+]?[0-9]+) Player Attack/i) || 0) + (data[i].skills.regex(/Increase Player Attack by ([0-9]+)/i) || 0);
			defend = Player.get('defense') + (data[i].skills.regex(/([-+]?[0-9]+) Player Defense/i) || 0) + (data[i].skills.regex(/Increase Player Defense by ([0-9]+)/i) || 0);
			army = (data[i].skills.regex(/Increases? Army Limit to ([0-9]+)/i) || 501);
			gen_att = getAttDef(data, listpush, 'att', Math.floor(army / 5));
			gen_def = getAttDef(data, listpush, 'def', Math.floor(army / 5));
			data[i].invade = {
				att: Math.floor(invade.attack + data[i].att + (data[i].def * 0.7) + ((attack + (defend * 0.7)) * army) + gen_att),
				def: Math.floor(invade.defend + data[i].def + (data[i].att * 0.7) + ((defend + (data[i].skills.regex(/([-+]?[0-9]+) Defense when attacked/i) || 0) + (attack * 0.7)) * army) + gen_def)
			};
			data[i].duel = {
				att: Math.floor(duel.attack + data[i].att + (data[i].def * 0.7) + attack + (defend * 0.7)),
				def: Math.floor(duel.defend + data[i].def + (data[i].att * 0.7) + defend + (data[i].skills.regex(/([-+]?[0-9]+) Defense when attacked/i) || 0) + (attack * 0.7))
			};
		}
	}
};

Generals.to = function(name) {
	if (this.runtime.disabled) {
		return true;
	}
	this._unflush();
	if (name && !this.data[name]) {
		name = this.best(name);
	}
	if (!name || Player.get('general') === name || name === 'any') {
		return true;
	}
	if (!name || !this.data[name]) {
		log('General "'+name+'" requested but not found!');
		return true; // Not found, so fake it
	}
	if (!Page.to('heroes_generals')) {
		return false;
	}
	debug('Changing to General '+name);
	Page.click('input[src$="' + this.data[name].img + '"]');
	return false;
};

Generals.best = function(type) {
	this._unflush();
	var rx = '', best = null, bestval = 0, i, value, list = [];
	switch(type.toLowerCase()) {
		case 'cost':		rx = /Decrease Soldier Cost by ([0-9]+)/i; break;
		case 'stamina':		rx = /Increase Max Stamina by ([0-9]+)|\+([0-9]+) Max Stamina/i; break;
		case 'energy':		rx = /Increase Max Energy by ([0-9]+)|\+([0-9]+) Max Energy/i; break;
		case 'income':		rx = /Increase Income by ([0-9]+)/i; break;
		case 'item':		rx = /Chance +([0-9]+)% Drops for Quest/i; break;
		case 'influence':	rx = /Bonus Influence ([0-9]+)/i; break;
		case 'attack':		rx = /([-+]?[0-9]+) Player Attack/i; break;
		case 'defense':		rx = /([-+]?[0-9]+) Player Defense/i; break;
		case 'cash':		rx = /Bonus ([0-9]+) Gold/i; break;
		case 'invade':
			for (i in Generals.data) {
				if (!best || (Generals.data[i].invade && Generals.data[i].invade.att > Generals.data[best].invade.att) || (Generals.data[i].invade && Generals.data[i].invade.att === Generals.data[best].invade.att && best !== Player.get('general'))) {
					best = i;
				}
			}
			return (best || 'any');
		case 'duel':
			for (i in Generals.data) {
				if (!best || (Generals.data[i].duel && Generals.data[i].duel.att > Generals.data[best].duel.att) || (Generals.data[i].duel && Generals.data[i].duel.att === Generals.data[best].duel.att && best !== Player.get('general'))) {
					best = i;
				}
			}
			return (best || 'any');
		case 'raid-invade':
			for (i in Generals.data) {
				if (!best || (Generals.data[i].invade && (Generals.data[i].invade.att + Generals.data[i].invade.def) > (Generals.data[best].invade.att + Generals.data[best].invade.def))) {
					best = i;
				}
			}
			return (best || 'any');
		case 'raid-duel':
			for (i in Generals.data) {
				if (!best || (Generals.data[i].duel && (Generals.data[i].duel.att + Generals.data[i].duel.def) > (Generals.data[best].duel.att + Generals.data[best].duel.def))) {
					best = i;
				}
			}
			return (best || 'any');
		case 'defend':
			for (i in Generals.data) {
				if (!best || (Generals.data[i].duel && Generals.data[i].duel.def > Generals.data[best].duel.def) || (Generals.data[i].duel && Generals.data[i].duel.def === Generals.data[best].duel.def && best !== Player.get('general'))) {
					best = i;
				}
			}
			return (best || 'any');
		case 'under level 4':
			if (Generals.data[Player.get('general')] && Generals.data[Player.get('general')].level < 4) {
				return Player.get('general');
			}
			for (i in Generals.data) {
				if (Generals.data[i].level < 4) {
					list.push(i);
				}
			}
			return list.length ? list[Math.floor(Math.random()*list.length)] : 'any';
		default:
			return 'any';
	}
	for (i in Generals.data) {
		value = Generals.data[i].skills.regex(rx);
		if (value) {
			if (!best || value>bestval) {
				best = i;
				bestval = value;
			}
		}
	}
//	if (best) {
//		debug('Best general found: '+best);
//	}
	return (best || 'any');
};

Generals.order = [];
Generals.dashboard = function(sort, rev) {
	var i, o, output = [], list = [], iatt = 0, idef = 0, datt = 0, ddef = 0;

	if (typeof sort === 'undefined') {
		Generals.order = [];
		for (i in Generals.data) {
			Generals.order.push(i);
		}
		sort = 1; // Default = sort by name
	}
	if (typeof sort !== 'undefined') {
		Generals.order.sort(function(a,b) {
			var aa, bb, type, x;
			if (sort == 1) {
				aa = a;
				bb = b;
			} else if (sort == 2) {
				aa = (Generals.data[a].level || 0);
				bb = (Generals.data[b].level || 0);
			} else {
				type = (sort<5 ? 'invade' : 'duel');
				x = (sort%2 ? 'att' : 'def');
				aa = (Generals.data[a][type][x] || 0);
				bb = (Generals.data[b][type][x] || 0);
			}
			if (typeof aa === 'string' || typeof bb === 'string') {
				return (rev ? bb > aa : bb < aa);
			}
			return (rev ? aa - bb : bb - aa);
		});
	}
	for (i in Generals.data) {
		iatt = Math.max(iatt, Generals.data[i].invade ? Generals.data[i].invade.att : 1);
		idef = Math.max(idef, Generals.data[i].invade ? Generals.data[i].invade.def : 1);
		datt = Math.max(datt, Generals.data[i].duel ? Generals.data[i].duel.att : 1);
		ddef = Math.max(ddef, Generals.data[i].duel ? Generals.data[i].duel.def : 1);
	}
	list.push('<table cellspacing="0" style="width:100%"><thead><tr><th></th><th>General</th><th>Level</th><th>Invade<br>Attack</th><th>Invade<br>Defend</th><th>Duel<br>Attack</th><th>Duel<br>Defend</th></tr></thead><tbody>');
	for (o=0; o<Generals.order.length; o++) {
		i = Generals.order[o];
		output = [];
		output.push('<img src="' + imagepath + Generals.data[i].img+'" style="width:25px;height:25px;" title="' + Generals.data[i].skills + '">');
		output.push(i);
		output.push(Generals.data[i].level);
		output.push(Generals.data[i].invade ? (iatt == Generals.data[i].invade.att ? '<strong>' : '') + addCommas(Generals.data[i].invade.att) + (iatt == Generals.data[i].invade.att ? '</strong>' : '') : '?')
		output.push(Generals.data[i].invade ? (idef == Generals.data[i].invade.def ? '<strong>' : '') + addCommas(Generals.data[i].invade.def) + (idef == Generals.data[i].invade.def ? '</strong>' : '') : '?');
		output.push(Generals.data[i].duel ? (datt == Generals.data[i].duel.att ? '<strong>' : '') + addCommas(Generals.data[i].duel.att) + (datt == Generals.data[i].duel.att ? '</strong>' : '') : '?');
		output.push(Generals.data[i].duel ? (ddef == Generals.data[i].duel.def ? '<strong>' : '') + addCommas(Generals.data[i].duel.def) + (ddef == Generals.data[i].duel.def ? '</strong>' : '') : '?');
		list.push('<tr><td>' + output.join('</td><td>') + '</td></tr>');
	}
	list.push('</tbody></table>');
	$('#golem-dashboard-Generals').html(list.join(''));
	$('#golem-dashboard-Generals tbody tr td:nth-child(2)').css('text-align', 'left');
	if (typeof sort !== 'undefined') {
		$('#golem-dashboard-Generals thead th:eq('+sort+')').attr('name',(rev ? 'reverse' : 'sort')).append('&nbsp;' + (rev ? '&uarr;' : '&darr;'));
	}
}

/********** Worker.Gift() **********
* Auto accept gifts and return if needed
* *** Needs to talk to Alchemy to work out what's being made
*/
var Gift = new Worker('Gift', 'index army_invite army_gifts', {keep:true});
Gift.data = {
	uid: [],
	todo: {},
	gifts: {}
};

Gift.option = {
	type:'None'
};

Gift.runtime = {
	work:false
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

Gift.lookup = {
	'eq_gift_mystic_mystery.jpg':	'Mystic Armor',
	'eq_drakehelm_mystery.jpg':		'Drake Helm',
	'gift_angel_mystery2.jpg':		'Battle Of Dark Legion',
	'alchemy_serpent_mystery.jpg':	'Serpentine Shield',
	'alchemy_horn_mystery.jpg':		'Poseidons Horn',
	'gift_sea_egg_mystery.jpg':		'Sea Serpent',
	'gift_egg_mystery.jpg':			'Dragon',
	'gift_druid_mystery.jpg':		'Whisper Bow',
	'gift_armor_mystery.jpg':		'Golden Hand',
	'mystery_frost_weapon.jpg':		'Frost Tear Dagger',
	'eq_mace_mystery.jpg':			'Morning Star'
};

Gift.parse = function(change) {
	if (change) {
		return false;
	}
	var uid, gifts;
	//alert('Gift.parse running');
	if (Page.page === 'index') {
		// If we have a gift waiting it doesn't matter from whom as it gets parsed on the right page...
		if (!this.data.uid.length && $('span.result_body').text().indexOf('has sent you a gift') >= 0) {
			this.data.uid.push(1);
		}
	} else if (Page.page === 'army_invite') {
		// Accepted gift first
		debug('Gift: Checking for accepted');
		if (this.data.lastgift) {
			if ($('div.result').text().indexOf('accepted the gift') >= 0) {
				uid = this.data.lastgift;
				if (!this.data.todo[uid].gifts) {
					this.data.todo[uid].gifts = [];
				}
				// this grabs the image of the specific piece of the gift we have received.  How do we convert that to which gift we need to return?
				this.data.todo[uid].gifts.push($('div.result img').attr('src').filepart());
				this.data.lastgift = null;
			}
		}
		// Check for gifts
		debug('Gift: Checking for new gift to accept');
		uid = this.data.uid = [];
		if ($('div.messages').text().indexOf('gift') >= 0) {
			debug('Gift: Found gift div');
			$('div.messages img').each(function(i,el) {
				uid.push($(el).attr('uid'));
				debug('Gift: Adding gift from '+$(el).attr('uid'));
			});
		}
		// Check if gift sent properly - TODO - Maybe something like this... 
		/*
		if ($('div.result').text().test('request[s]* sent'){
			
		}
		*/
	} else if (Page.page === 'army_gifts') { // Parse for the current available gifts
		gifts = this.data.gifts = {};
//		debug('Gifts found: '+$('#app'+APPID+'_giftContainer div[id^="app'+APPID+'_gift"]').length);
		$('#app'+APPID+'_giftContainer div[id^="app'+APPID+'_gift"]').each(function(i,el){
//			debug('Gift adding: '+$(el).text()+' = '+$('img', el).attr('src'));
			var id = $('img', el).attr('src').filepart(), name = $(el).text().trim().replace('!','');
			if (!gifts[id]) {
				gifts[id] = {};
			}
			gifts[id].name = name;
			if (this.lookup[name]) {
				gifts[id].create = this.lookup[name];
			}
		});
	}
	return false;
};

Gift.work = function(state) {
	if (!state) {
		if (!this.data.uid.length) {
			return false;
		}
		return true;
	}
	if (this.data.uid.length) { // Receive before giving
		if (!Page.to('army_invite')) {
			return true;
		}
		var uid = this.data.uid.shift();
		if (!this.data.todo[uid]) {
			this.data.todo[uid] = {};
		}
		// if we are returning gifts
		this.data.todo[uid].time = Date.now();
		this.data.lastgift = uid;
		debug('Gift: Accepting gift from '+uid);
		if (!Page.to('army_invite', '?act=acpt&rqtp=gift&uid=' + uid) || this.data.uid.length > 0) {
			return true;
		}
	}
	// Give some gifts back - TODO
	/*
	if (this.data.todo.length) {
		for (id in this.data.todo){
			// something goes here
		}
	}*/
	Page.to('keep_alchemy');
	return false;
};

/********** Worker.Heal **********
* Auto-Heal above a stamina level
* *** Needs to check if we have enough money (cash and bank)
*/
var Heal = new Worker('Heal');
Heal.data = null;

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
		return false;
	}
	if (!state) {
		return true;
	}
	return this.me();
};

Heal.me = function() {
	if (!Page.to('keep_stats')) {
		return true;
	}
	debug('Heal: Healing...');
	if ($('input[value="Heal Wounds"]').length) {
		Page.click('input[value="Heal Wounds"]');
	} else {
		log('Danger Danger Will Robinson... Unable to heal!');
	}
	return false;
};

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
* History.get([hour, 'key']) - gets value at specified hour
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

History.dashboard = function() {
	var i, max = 0, list = [], output = [];
	list.push('<table cellspacing="0" cellpadding="0" class="golem-graph"><thead><tr><th></th><th colspan="73"><span style="float:left;">&lArr; Older</span>72 Hour History<span style="float:right;">Newer &rArr;</span><th></th></th></tr></thead><tbody>');
	list.push(this.makeGraph(['land', 'income'], 'Income', true, {'Average Income':this.get('land.mean') + this.get('income.mean')}));
	list.push(this.makeGraph('bank', 'Bank', true, Land.runtime.best ? {'Next Land':Land.runtime.cost} : null)); // <-- probably not the best way to do this, but is there a function to get options like there is for data?
	list.push(this.makeGraph('exp', 'Experience', false, {'Next Level':Player.get('maxexp')}));
	list.push(this.makeGraph('exp.change', 'Exp Gain', false, {'Average':this.get('exp.average.change'), 'Standard Deviation':this.get('exp.stddev.change'), 'Ignore entries above':(this.get('exp.mean.change') + (2 * this.get('exp.stddev.change')))} )); // , 'Harmonic Average':this.get('exp.harmonic.change') ,'Median Average':this.get('exp.median.change') ,'Mean Average':this.get('exp.mean.change')
	list.push('</tbody></table>');
	$('#golem-dashboard-History').html(list.join(''));
}

History.init = function() {
	if (Player.data.history) {
		this.data = Player.data.history;
		delete Player.data.history;
	}
};

History.update = function(type) {
	var i, hour = Math.floor(Date.now() / 3600000) - 168;
	for (i in this.data) {
		if (i < hour) {
			delete this.data[i];
		}
	}
//	debug('Exp: '+this.get('exp'));
//	debug('Exp max: '+this.get('exp.max'));
//	debug('Exp max change: '+this.get('exp.max.change'));
//	debug('Exp min: '+this.get('exp.min'));
//	debug('Exp min change: '+this.get('exp.min.change'));
//	debug('Exp change: '+this.get('exp.change'));
//	debug('Exp mean: '+this.get('exp.mean.change'));
//	debug('Exp harmonic: '+this.get('exp.harmonic.change'));
//	debug('Exp geometric: '+this.get('exp.geometric.change'));
//	debug('Exp mode: '+this.get('exp.mode.change'));
//	debug('Exp median: '+this.get('exp.median.change'));
//	debug('Average Exp = weighted average: ' + this.get('exp.average.change') + ', mean: ' + this.get('exp.mean.change') + ', geometric: ' + this.get('exp.geometric.change') + ', harmonic: ' + this.get('exp.harmonic.change') + ', mode: ' + this.get('exp.mode.change') + ', median: ' + this.get('exp.median.change'));
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
	this.data[hour] = this.data[hour] || {}
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
	this.data[hour] = this.data[hour] || {}
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
				num.push(1/list[i])
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
		var i, j = 0, count = 0, num = {}, tmp;
		for (i in list) {
			num[list[i]] = (num[list[i]] || 0) + 1
		}
		tmp = sortObject(num, function(a,b){return num[b]-num[a];});
		for (i in tmp) {
			if (num[tmp[i]] === num[tmp[0]]) {
				j += parseInt(tmp[i]);
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
	var i, j, value, last = null, list = [], data = this.data, x = typeof what === 'string' ? what.split('.') : (typeof what === 'object' ? what : []), hour = Math.floor(Date.now() / 3600000), exact = false;
	if (x.length && (typeof x[0] === 'number' || !x[0].regex(/[^0-9]/gi))) {
		hour = x.shift();
	}
	if (!x.length) {
		return data;
	}
	for (i in data) {
		if (data[i][x[0]] && typeof data[i][x[0]] === 'number') {
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
		for (i=hour-168; i<=hour; i++) {
			if (data[i]) {
				value = null;
				if (exact) {
					if (data[i][x[0]]) {
						value = data[i][x[0]];
					}
				} else {
					for (j in data[i]) {
						if (j.indexOf(x[0] + '+') === 0 && typeof data[i][j] === 'number') {
							value = (value || 0) + data[i][j];
						}
					}
				}
				if (value !== null && last !== null) {
					list.push(value - last);
					if (isNaN(list[list.length - 1])) {
						debug('NaN: '+value+' - '+last);
					}
				}
				last = value;
			}
		}
	} else {
		for (i in data) {
			value = null;
			if (exact) {
				if (data[i][x[0]]) {
					value = data[i][x[0]];
				}
			} else {
				for (j in data[i]) {
					if (j.indexOf(x[0] + '+') === 0 && typeof data[i][j] === 'number') {
						value = (value || 0) + data[i][j];
					}
				}
			}
			if (value !== null) {
				list.push(value);
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
	var i, j, min = Number.POSITIVE_INFINITY, max = Number.NEGATIVE_INFINITY, max_s, min_s, goal_s = [], list = [], bars = [], output = [], value = {}, goalbars = '', divide = 1, suffix = '', hour = Math.floor(Date.now() / 3600000), title, numbers;
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
				if (typeof value[i][j] !== 'undefined') {
					min = Math.min(min, value[i][j]);
					max = Math.max(max, value[i][j]);
				}
			}
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
	max_s = (iscash ? '$' : '') + addCommas(max / divide) + suffix;
	min = Math.floor(min / divide) * divide;
	min_s = (iscash ? '$' : '') + addCommas(min / divide) + suffix;
	if (goal && length(goal)) {
		for (i in goal) {
			bars.push('<div style="bottom:' + Math.max(Math.floor((goal[i] - min) / (max - min) * 100), 0) + 'px;"></div>');
			goal_s.push('<div' + (typeof i !== 'number' ? ' title="'+i+'"' : '') + ' style="bottom:' + Math.range(2, Math.ceil((goal[i] - min) / (max - min) * 100)-2, 92) + 'px;">' + (iscash ? '$' : '') + addCommas((goal[i] / divide).round(1)) + suffix + '</div>');
		}
		goalbars = '<div class="goal">' + bars.reverse().join('') + '</div>';
		goal_s.reverse();
	}
	th(list, '<div>' + max_s + '</div><div>' + title + '</div><div>' + min_s + '</div>')
	for (i=hour-72; i<=hour; i++) {
		bars = []
		output = [];
		numbers = [];
		title = (hour - i) + ' hour' + ((hour - i)==1 ? '' : 's') +' ago';
		for (j in value[i]) {
			bars.push('<div style="height:' + Math.max(Math.ceil((value[i][j] - min) / (max - min) * 100), 0) + 'px;"></div>');
			if (value[i][j]) {
				numbers.push((value[i][j] ? (iscash ? '$' : '') + addCommas(value[i][j]) : ''));
			}
		}
		output.push('<div class="bars">' + bars.reverse().join('') + '</div>' + goalbars);
		numbers.reverse();
		title = title + (numbers.length ? ', ' : '') + numbers.join(' + ') + (numbers.length > 1 ? ' = ' + (iscash ? '$' : '') + addCommas(sum(value[i])) : '');
		td(list, output.join(''), 'title="' + title + '"');
	}
	th(list, goal_s.join(''));
	return '<tr>' + list.join('') + '</tr>';
}

/********** Worker.Idle **********
* Set the idle general
* Keep focus for disabling other workers
*/
var Idle = new Worker('Idle');
Idle.data = null;
Idle.option = {
	general: 'any',
	index: 'Daily',
	alchemy: 'Daily',
	quests: 'Never',
	town: 'Never',
	battle: 'Quarterly',
	monsters: 'Hourly'	
	
};

Idle.when = ['Never', 'Quarterly', 'Hourly', '2 Hours', '6 Hours', '12 Hours', 'Daily', 'Weekly'];
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
		id:'battle',
		label:'Battle',
		select:Idle.when
	},{
		id:'monsters',
		label:'Monsters',
		select:Idle.when
	}
];

Idle.work = function(state) {
	if (!state) {
		return true;
	}
	var i, p, time, pages = {
		index:['index'],
		alchemy:['keep_alchemy'],
		quests:['quests_quest1', 'quests_quest2', 'quests_quest3', 'quests_quest4', 'quests_quest5', 'quests_quest6', 'quests_demiquests', 'quests_atlantis'],
		town:['town_soldiers', 'town_blacksmith', 'town_magic', 'town_land'],
		battle:['battle_battle', 'battle_arena'],
		monsters:['keep_monster', 'battle_raid']
	}, when = { 'Never':0, 'Quarterly':900000, 'Hourly':3600000, '2 Hours':7200000, '6 Hours':21600000, '12 Hours':43200000, 'Daily':86400000, 'Weekly':604800000 };
	if (!Generals.to(this.option.general)) {
		return true;
	}
	for (i in pages) {
		if (!when[this.option[i]]) {
			continue;
		}
		time = Date.now() - when[this.option[i]];
		for (p=0; p<pages[i].length; p++) {
			if (!Page.get(pages[i][p]) || Page.get(pages[i][p]) < time) {
				if (!Page.to(pages[i][p])) {
					Page.set(pages[i][p], Date.now())
					return true;
				}
			}
		}
	}
	return true;
};

/********** Worker.Income **********
* Auto-general for Income, also optional bank
* User selectable safety margin - at default 5 sec trigger it can take up to 14 seconds (+ netlag) to change
*/
var Income = new Worker('Income');

Income.data = null;

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
	if (!Income.option.margin) {
		return false;
	}
//	debug('Income: '+when+', Margin: '+Income.option.margin);
	if (Player.get('cash_timer') > this.option.margin) {
		if (state && this.option.bank) {
			return Bank.work(true);
		}
		return false;
	}
	if (!state) {
		return true;
	}
	if (this.option.general && !Generals.to(Generals.best('income'))) {
		return true;
	}
	debug('Income: Waiting for Income... (' + Player.get('cash_timer') + ' seconds)');
	return true;
};

/********** Worker.Land **********
* Auto-buys property
*/
var Land = new Worker('Land', 'town_land');
Land.option = {
	enabled:true,
	wait:48,
	best:null,
	onlyten:false
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
		id:'wait',
		label:'Maximum Wait Time',
		select:[0, 24, 36, 48],
		suffix:'hours',
		help:'There has been a lot of testing in this code, it is the fastest way to increase your income despite appearances!'
	},{
		advanced:true,
		id:'onlyten',
		label:'Only buy 10x<br>NOTE: This is slower!!!',
		checkbox:true
	}
];

Land.parse = function(change) {
	$('tr.land_buy_row,tr.land_buy_row_unique').each(function(i,el){
		var name = $('img', el).attr('alt'), tmp;
		Land.data[name] = {};
		Land.data[name].income = $('.land_buy_info .gold', el).text().replace(/[^0-9]/g,'').regex(/([0-9]+)/);
		Land.data[name].max = $('.land_buy_info', el).text().regex(/Max Allowed For your level: ([0-9]+)/i);
		Land.data[name].cost = $('.land_buy_costs .gold', el).text().replace(/[^0-9]/g,'').regex(/([0-9]+)/);
		tmp = $('option', $('.land_buy_costs .gold', el).parent().next()).last().attr('value');
		if (tmp) {
			Land.data[name].buy = tmp;
		}
		Land.data[name].own = $('.land_buy_costs span', el).text().replace(/[^0-9]/g,'').regex(/([0-9]+)/);
	});
	return false;
};

Land.update = function() {
	var i, worth = Bank.worth(), income = Player.get('income') + Player.get('average_income'), best, buy = 0;
	for (var i in this.data) {
		if (this.data[i].buy) {
			if (!best || ((this.data[best].cost / income) + (this.data[i].cost / (income + this.data[best].income))) > ((this.data[i].cost / income) + (this.data[best].cost / (income + this.data[i].income)))) {
				best = i;
			}
		}
	}
	if (best) {
		if (this.option.onlyten || (this.data[best].cost * 10) <= worth || (this.data[best].own >= 10 && this.data[best].cost * 10 / income < this.option.wait)) {
			buy = Math.min(this.data[best].max - this.data[best].own, 10);
		} else if ((this.data[best].cost * 5) <= worth || (this.data[best].own >= 10 && this.data[best].cost * 5 / income < this.option.wait)) {
			buy = Math.min(this.data[best].max - this.data[best].own, 5);
		} else {
			buy = 1;
		}
		this.runtime.buy = buy;
		this.runtime.cost = buy * this.data[best].cost;
		Dashboard.status(this, (this.runtime.buy ? 'Buying ' : 'Want to buy ') + buy + 'x ' + best + ' for $' + addCommas(buy * this.data[best].cost));
	} else {
		Dashboard.status(this);
	}
	this.runtime.best = best;
}

Land.work = function(state) {
	if (!this.option.enabled || !this.runtime.best || !Bank.worth(this.runtime.cost)) {
		if (!this.runtime.best && this.runtime.lastlevel < Player.get('level')) {
			if (!state || !Page.to('town_land')) {
				return true;
			}
			this.runtime.lastlevel = Player.get('level');
		}
		return false;
	}
	if (!state || !Bank.retrieve(this.runtime.cost) || !Page.to('town_land')) {
		return true;
	}
//	var el = $('tr.land_buy_row:contains("'+this.runtime.best+'"),tr.land_buy_row_unique:contains("'+this.runtime.best+'")');
	$('tr.land_buy_row,tr.land_buy_row_unique').each(function(i,el){
		if ($('img', el).attr('alt') === Land.runtime.best) {
			debug('Land: Buying ' + Land.runtime.buy + ' x ' + Land.runtime.best + ' for $' + addCommas(Land.runtime.cost));
			$('select', $('.land_buy_costs .gold', el).parent().next()).val(Land.runtime.buy > 5 ? 10 : (Land.runtime.buy > 1 ? 5 : 1));
			Page.click($('.land_buy_costs input[name="Buy"]', el));
			$('#'+PREFIX+'Land_current').text('None');
		}
	});
	return true;
};

/********** Worker.LevelUp **********
* Will give us a quicker level-up, optionally changing the general to gain extra stats
* 1. Switches generals to specified general
* 2. Changes the best Quest to the one that will get the most exp (rinse and repeat until no energy left) - and set Queue.burn.energy to max available
* 3. Will call Heal.me() function if current health is under 10 and there is any stamina available (So Battle/Arena/Monster can automatically use up the stamina.)
* 4. Will set Queue.burn.stamina to max available
*/

var LevelUp = new Worker('LevelUp', '*', {unsortable:true});
LevelUp.data = null;

LevelUp.option = {
	enabled:false,
	income:true,
	general:'any',
	algorithm:'Per Action'
};

LevelUp.runtime = {
	level:0,// set when we start, compare to end
	maxenergy:0,// set to maxenergy before levelling up
	maxstamina:0,// set to maxstamina before levelling up
	heal_me:false,// we're active and want healing...
	old_quest:null,// save old quest, if it's not null and we're working then push it back again...
	old_quest_energy:0,
	running:false,// set when we change
	energy:0,
	stamina:0,
	exp:0,
	exp_possible:0,
	energy_samples:0,
	exp_per_energy:1,
	stamina_samples:0,
	exp_per_stamina:1,
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
		id:'income',
		label:'Allow Income General',
		checkbox:true
	},{
		id:'general',
		label:'Best General',
		select:['any', 'Energy', 'Stamina'],
		help:'Select which type of general to use when leveling up.'
	},{
		id:'algorithm',
		label:'Estimation Method',
		select:['Per Action', 'Per Hour'],
		help:"'Per Hour' uses your gain per hour. 'Per Action' uses your gain per action."
	}
];

LevelUp.init = function() {
	this._watch(Player);
	this._watch(Quest);
	this.runtime.exp = this.runtime.exp || Player.get('exp'); // Make sure we have a default...
	this.runtime.level = this.runtime.level || Player.get('level'); // Make sure we have a default...
};

LevelUp.parse = function(change) {
	if (change) {
		$('#app'+APPID+'_st_2_5 strong').attr('title', Player.get('exp') + '/' + Player.get('maxexp') + ' at ' + addCommas(this.get('exp_average').round(1)) + ' per hour').html(addCommas(Player.get('exp_needed')) + '<span style="font-weight:normal;"> in <span class="golem-time" style="color:rgb(25,123,48);" name="' + this.get('level_time') + '">' + makeTimer(this.get('level_timer')) + '</span></span>');
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
}

LevelUp.update = function(type) {
	var d, i, j, k, quests, energy = Player.get('energy'), stamina = Player.get('stamina'), exp = Player.get('exp'), runtime = this.runtime, quest_data = Quest.get();
	if (type === Quest) { // Now work out the quickest quests to level up
		runtime.quests = quests = [[0]];// quests[energy] = [experience, [quest1, quest2, quest3]]
		for (i in quest_data) { // Fill out with the best exp for every energy cost
			if (!quests[quest_data[i].energy] || quest_data[i].exp > quests[quest_data[i].energy][0]) {
				quests[quest_data[i].energy] = [quest_data[i].exp, [i]];
			}
		}
		j = 1;
		k = [0];
		for (i=1; i<quests.length; i++) { // Fill in the blanks and replace using the highest exp per energy ratios
			if (quests[i] && quests[i][0] / i >= k[0] / j) {
				j = i;
				k = quests[i];
			} else {
				quests[i] = [k[0], [k[1][0]]];
			}
		}
		while (quests.length > 1 && quests[quests.length-1][0] === quests[quests.length-2][0]) { // Delete entries at the end that match (no need to go beyond our best ratio quest)
			quests.pop();
		}
		for (i=1; i<quests.length; i++) { // Merge lower value quests to use up all the energy
			if (quest_data[quests[i][1][0]].energy < i) {
				quests[i][0] += quests[i - quest_data[quests[i][1][0]].energy][0];
				quests[i][1] = quests[i][1].concat(quests[i - quest_data[quests[i][1][0]].energy][1])
			}
		}
//		debug('Quickest '+quests.length+' Quests: '+quests.toSource());
	} else if (type === Player) {
		if (exp !== runtime.exp) { // Experience has changed...
			if (runtime.stamina > stamina) {
				runtime.exp_per_stamina = ((runtime.exp_per_stamina * Math.min(runtime.stamina_samples, 49)) + ((exp - runtime.exp) / (runtime.stamina - stamina))) / Math.min(runtime.stamina_samples + 1, 50); // .round(3)
				runtime.stamina_samples = Math.min(runtime.stamina_samples + 1, 50); // More samples for the more variable stamina
			} else if (runtime.energy > energy) {
				runtime.exp_per_energy = ((runtime.exp_per_energy * Math.min(runtime.energy_samples, 9)) + ((exp - runtime.exp) / (runtime.energy - energy))) / Math.min(runtime.energy_samples + 1, 10); // .round(3)
				runtime.energy_samples = Math.min(runtime.energy_samples + 1, 10); // fewer samples for the more consistent energy
			}
		}
		runtime.energy = energy;
		runtime.stamina = stamina;
		runtime.exp = exp;
	}
	if (!this.runtime.quests.length) { // No known quests yet...
		runtime.exp_possible = 1;
	} else if (energy < this.runtime.quests.length) { // Energy from questing
		runtime.exp_possible = this.runtime.quests[Math.min(energy, this.runtime.quests.length - 1)][0];
	} else {
		runtime.exp_possible = (this.runtime.quests[this.runtime.quests.length-1][0] * Math.floor(energy / (this.runtime.quests.length - 1))) + this.runtime.quests[energy % (this.runtime.quests.length - 1)][0];
	}
	runtime.exp_possible += Math.floor(stamina * runtime.exp_per_stamina); // Stamina estimate (when we can spend it)
	d = new Date(this.get('level_time'));
	if (this.option.enabled) {
		if (runtime.running) {
			Dashboard.status(this, '<span title="Exp Possible: ' + this.runtime.exp_possible + ', per Energy: ' + this.runtime.exp_per_energy.round(2) + ', per Stamina: ' + this.runtime.exp_per_stamina.round(2) + '">' + d.format('l g:i a') + ' (at ' + addCommas(this.get('exp_average').round(1)) + ' per hour)</span>');
		} else {
			Dashboard.status(this, '<span title="Exp Possible: ' + this.runtime.exp_possible + ', per Energy: ' + this.runtime.exp_per_energy.round(2) + ', per Stamina: ' + this.runtime.exp_per_stamina.round(2) + '">' + d.format('l g:i a') + ' (at ' + addCommas(this.get('exp_average').round(1)) + ' per hour)</span>');
		}
	} else {
		Dashboard.status(this);
	}
}

LevelUp.work = function(state) {
	var i, runtime = this.runtime, general;
	if (runtime.running && this.option.income) {
		if (Queue.get('current') === Income) {
			Generals.set('runtime.disabled', false);
		} else {
			Generals.set('runtime.disabled', true);
		}
	}
	if (runtime.old_quest) {
		Quest.runtime.best = runtime.old_quest;
		Quest.runtime.energy = runtime.old_quest_energy;
		runtime.old_quest = null;
		runtime.old_quest_energy = 0;
	}
	if (!this.option.enabled || runtime.exp_possible < Player.get('exp_needed')) {
		if (runtime.running && runtime.level < Player.get('level')) { // We've just levelled up
			if (runtime.maxenergy && runtime.maxenergy < Player.get('energy')) { // Burn the extra energy
				Queue.burn.energy = Player.get('energy');
				Queue.burn.stamina = 0;
				return false;
			}
			if (runtime.maxstamina && runtime.maxstamina < Player.get('stamina')) { // Burn the extra stamina
				Queue.burn.energy = 0;
				Queue.burn.stamina = Player.get('stamina');
				return false;
			}
			Generals.set('runtime.disabled', false);
			Queue.burn.stamina = Math.max(0, Player.get('stamina') - Queue.get('option.stamina'));
			Queue.burn.energy = Math.max(0, Player.get('energy') - Queue.get('option.energy'));
			runtime.running = false;
		}
		return false;
	}
	if (state && runtime.heal_me) {
		if (Heal.me()) {
			return true;
		}
		runtime.heal_me = false;
	}
	if (!runtime.running || state) { // We're not running yet, or we have focus
		general = Generals.best(this.option.general); // Get our level up general
		if (general && general !== 'any' && general !== Player.get('general')) { // If we want to change...
			if (!state || !Generals.to(this.option.general)) { // ...then change
				return true;
			}
		}
		runtime.maxenergy = Player.get('maxenergy');
		runtime.maxstamina = Player.get('maxstamina');
		runtime.level = Player.get('level');
		runtime.running = true;
		Generals.set('runtime.disabled', true);
	}
	// We don't have focus, but we do want to level up quicker
	if (runtime.energy) { // Only way to burn energy is to do quests - energy first as it won't cost us anything
		runtime.old_quest = Quest.runtime.best;
		runtime.old_quest_energy = Quest.runtime.energy;
		Queue.burn.energy = runtime.energy;
		Queue.burn.stamina = 0;
		Quest.runtime.best = runtime.quests[Math.min(runtime.energy, runtime.quests.length-1)][1][0]; // Access directly as Quest.set() would force a Quest.update and overwrite this again
		Quest.runtime.energy = runtime.energy; // Ok, we're lying, but it works...
		return false;
	}
	Quest._update('data'); // Force Quest to decide it's best quest again...
	// Got to have stamina left to get here, so burn it all
	if (runtime.level === Player.get('level') && Player.get('health') < 10) { // If we're still trying to level up and we don't have enough health then heal us up...
		runtime.heal_me = true;
		return true;
	}
	Queue.burn.energy = 0; // Will be 0 anyway, but better safe than sorry
	Queue.burn.stamina = runtime.stamina; // Make sure we can burn everything, even the stuff we're saving
	return false;
};

LevelUp.get = function(what) {
	var now = Date.now();
	switch(what) {
		case 'level_timer':	return Math.floor((this.get('level_time') - now) / 1000);
		case 'level_time':	return now + Math.floor(3600000 * ((Player.get('exp_needed') - this.runtime.exp_possible) / (this.get('exp_average') || 10)));
		case 'exp_average':
			if (this.option.algorithm == 'Per Hour') {
				return History.get('exp.average.change');
			} else {
				return (12 * (this.runtime.exp_per_stamina + this.runtime.exp_per_energy));
			}
		default: return this._get(what);
	}
}/********** Worker.Monster **********
* Automates Monster
*/
var Monster = new Worker('Monster', 'keep_monster keep_monster_active battle_raid', {keep:true});
Monster.option = {
	fortify: 50,
	dispel: 50,
	first:false,
	choice: 'All',
	raid: 'Invade x5'
};

Monster.runtime = {
	current:null,
	uid:null,
	type:null
};

Monster.display = [
	{
		label:'Work in progress...'
	},{
		id:'fortify',
		label:'Fortify Below',
		select:[10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
		after:'%'
	},{
		id:'dispel',
		label:'Dispel Above',
		select:[10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
		after:'%'
	},{
		id:'first',
		label:'Fortify Before Attacking',
		checkbox:true,
		help:'Without this setting you will fortify whenever Energy is available'
	},{
		label:'"All" is currently Random...'
	},{
		id:'choice',
		label:'Attack',
		select:['All', 'Strongest', 'Weakest', 'Shortest', 'Spread', 'Achievement']
	},{
		id:'raid',
		label:'Raid',
		select:['Invade', 'Invade x5', 'Duel', 'Duel x5']
	},{
		id:'force1',
		label:'Force +1',
		checkbox:true,
		help:'Force the first player in the list to aid.'
	},{
		id:'assist',
		label:'Use Assist Links in Dashboard',
		checkbox:true
	}
];

Monster.types = {
	// Special (level 5) - not under Monster tab
	kull: {
		name:'Kull, the Orc Captain',
		timer:259200 // 72 hours
	},
	// Raid
/*
	raid_easy: {
		name:'The Deathrune Siege',
		list:'deathrune_list1.jpg',
		image:'raid_1_large.jpg',// ???
		image:'raid_2_large.jpg',// ???
		
		timer:216000, // 60 hours
		timer:302400, // 84 hours
		raid:true
	},
*/
	raid: {
		name:'The Deathrune Siege',
		list:'deathrune_list2.jpg',
		// raid_b1_large.jpg
		image:'raid_map_1.jpg',
		image2:'raid_map_2.jpg',
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
		achievement:40000,
		timer:259200, // 72 hours
		mpool:1
	},
	gildamesh: {
		name:'Gildamesh, the Orc King',
		list:'orc_boss_list.jpg',
		image:'orc_boss.jpg',
		dead:'orc_boss_dead.jpg',
		achievement:25000,
		timer:259200, // 72 hours
		mpool:1
	},
	keira: {
		name:'Keira, the Dread Knight',
		list:'boss_keira_list.jpg',
		image:'boss_keira.jpg',
		dead:'boss_keira_dead.jpg',
		achievement:84000,
		timer:172800, // 48 hours
		mpool:1
	},
	lotus: {
		name:'Lotus Ravenmoore',
		list:'boss_lotus_list.jpg',
		image:'boss_lotus.jpg',
		dead:'boss_lotus_big_dead.jpg',
		achievement:1250000,
		timer:172800, // 48 hours
		mpool:1		
	},
	mephistopheles: {
		name:'Mephistopheles',
		list:'boss_mephistopheles_list.jpg',
		image:'boss_mephistopheles_large.jpg',
		dead:'boss_mephistopheles_dead.jpg',
		achievement:282000,
		timer:172800, // 48 hours
		mpool:1		
	},
	skaar: {
		name:'Skaar Deathrune',
		list:'death_list.jpg',
		image:'death_large.jpg',
		dead:'death_dead.jpg',
		achievement:10000000,
		timer:345000, // 95 hours, 50 minutes
		mpool:1		
	},
	sylvanus: {
		name:'Sylvanas the Sorceress Queen',
		list:'boss_sylvanus_list.jpg',
		image:'boss_sylvanus_large.jpg',
		dead:'boss_sylvanus_dead.jpg',
		achievement:120000,
		timer:172800, // 48 hours
		mpool:1		
	},
	// Epic Team
	dragon_emerald: {
		name:'Emerald Dragon',
		list:'dragon_list_green.jpg',
		image:'dragon_monster_green.jpg',
		dead:'dead_dragon_image_green.jpg',
		achievement:64000,
		timer:259200, // 72 hours
		mpool:2		
	},
	dragon_frost: {
		name:'Frost Dragon',
		list:'dragon_list_blue.jpg',
		image:'dragon_monster_blue.jpg',
		dead:'dead_dragon_image_blue.jpg',
		achievement:85000,
		timer:259200, // 72 hours
		mpool:2		
	},
	dragon_gold: {
		name:'Gold Dragon',
		list:'dragon_list_gold.jpg',
		image:'dragon_monster_gold.jpg',
		dead:'dead_dragon_image_gold.jpg',
		achievement:180000,
		timer:259200, // 72 hours
		mpool:2		
	},
	dragon_red: {
		name:'Ancient Red Dragon',
		list:'dragon_list_red.jpg',
		image:'dragon_monster_red.jpg',
		dead:'dead_dragon_image_red.jpg',
		achievement:350000,
		timer:259200, // 72 hours
		mpool:2		
	},
	serpent_amethyst: { // DEAD image ???
		name:'Amethyst Sea Serpent',
		list:'seamonster_list_purple.jpg',
		image:'seamonster_purple.jpg',
		//dead:'seamonster_dead.jpg',
		achievement:600000,
		timer:259200, // 72 hours
		mpool:2		
	},
	serpent_ancient: { // DEAD image ???
		name:'Ancient Sea Serpent',
		list:'seamonster_list_red.jpg',
		image:'seamonster_red.jpg',
		//dead:'seamonster_dead.jpg',
		achievement:930000,
		timer:259200, // 72 hours
		mpool:2		
	},
	serpent_emerald: { // DEAD image ???
		name:'Emerald Sea Serpent',
		list:'seamonster_list_green.jpg',
		image:'seamonster_green.jpg',
		//dead:'seamonster_dead.jpg',
		achievement:150000,
		timer:259200, // 72 hours
		mpool:2		
	},
	serpent_sapphire: { // DEAD image ???
		name:'Sapphire Sea Serpent',
		list:'seamonster_list_blue.jpg',
		image:'seamonster_blue.jpg',
		//dead:'seamonster_dead.jpg',
		achievement:300000,
		timer:259200, // 72 hours
		mpool:2		
	},
	// Epic World
	cronus: {
		name:'Cronus, The World Hydra',
		list:'hydra_head.jpg',
		image:'hydra_large.jpg',
		dead:'hydra_dead.jpg',
		achievement:12500000,
		timer:604800, // 168 hours
		mpool:3		
	},
	legion: {
		name:'Battle of the Dark Legion',
		list:'castle_siege_list.jpg',
		image:'castle_siege_large.jpg',
		dead:'castle_siege_dead.jpg',
		achievement:10000,
		timer:604800, // 168 hours
		mpool:3		
	},
	genesis: {
		name:'Genesis, The Earth Elemental',
		list:'earth_element_list.jpg',
		image:'earth_element_large.jpg',
		dead:'earth_element_dead.jpg',
		achievement:10000000,
		timer:604800, // 168 hours
		mpool:3		
	},
	ragnarok: {
		name:'Ragnarok, The Ice Elemental',
		list:'water_list.jpg',
		image:'water_large.jpg',
		dead:'water_dead.jpg',
		achievement:11000000,
		timer:604800, // 168 hours
		mpool:3		
	}
};

Monster.dispel = ['input[src=$"button_dispel.gif"]'];
Monster.fortify = ['input[src$="attack_monster_button3.jpg"]', 'input[src$="seamonster_fortify.gif"]'];
Monster.attack = ['input[src$="attack_monster_button2.jpg"]', 'input[src$="seamonster_power.gif"]', 'input[src$="attack_monster_button.jpg"]', 'input[src$="event_attack2.gif"]', 'input[src$="event_attack1.gif"]'];

Monster.init = function() {
	var i, j;
	this.runtime.count = 0;
	for (i in this.data) {
		for (j in this.data[i]) {
			if (this.data[i][j].state === 'engage') {
				this.runtime.count++;
			}
		}
	}
	$('#golem-dashboard-Monster tbody td a').live('click', function(event){
		var url = $(this).attr('href');
		Page.to((url.indexOf('raid') > 0 ? 'battle_raid' : 'keep_monster'), url.substr(url.indexOf('?')));
		return false;
	});
}

Monster.parse = function(change) {
	var i, j, k, new_id, id_list = [], battle_list = Battle.get('user'), uid, type, tmp, $health, $defense, $dispel, dead = false, monster, timer;
	if (Page.page === 'keep_monster_active') { // In a monster
		this.runtime.current = uid = $('img[linked="true"][size="square"]').attr('uid');
		for (i in Monster.types) {
			if (Monster.types[i].dead && $('img[src$="'+Monster.types[i].dead+'"]').length) {
				type = i;
				timer = Monster.types[i].timer;
				dead = true;
			} else if (Monster.types[i].image && $('img[src$="'+Monster.types[i].image+'"]').length) {
				type = i;
				timer = Monster.types[i].timer;
			} else if (Monster.types[i].image2 && $('img[src$="'+Monster.types[i].image2+'"]').length) {
				type = i;
				timer = Monster.types[i].timer2 || Monster.types[i].timer;
			}
		}
		if (!uid || !type) {
			debug('Monster: Unknown monster (probably dead)');
			return false;
		}
		Monster.data[uid] = Monster.data[uid] || {};
		Monster.data[uid][type] = Monster.data[uid][type] || {};
		monster = Monster.data[uid][type];
		if ($('input[src*="collect_reward_button.jpg"]').length) {
			monster.state = 'reward';
			return false;
		}
		if (dead && monster.state === 'assist') {
			monster.state = null;
		} else if (dead && monster.state === 'engage') {
			monster.state = 'reward';
		} else {
			if (!monster.state && $('span.result_body').text().match(/for your help in summoning|You have already assisted on this objective|You don't have enough stamina assist in summoning/i)) {
				if ($('span.result_body').text().match(/for your help in summoning/i)) {
					monster.assist = Date.now();
				}
				monster.state = 'assist';
			}
			if ($('img[src$="icon_weapon.gif"],img[src$="battle_victory.gif"]').length)	{
				monster.battle_count = (monster.battle_count || 0) + 1;
			}
			if (!monster.name) {
				tmp = $('img[linked="true"][size="square"]').parent().parent().next().text().trim().replace(/[\s\n\r]{2,}/g, ' ');
				monster.name = tmp.substr(0, tmp.length - Monster.types[type].name.length - 3);
			}
			$health = $('img[src$="monster_health_background.jpg"]').parent();
			monster.health = $health.length ? ($health.width() / $health.parent().width() * 100) : 0;
			$defense = $('img[src$="seamonster_ship_health.jpg"]').parent();
			if ($defense.length) {
				monster.defense = ($defense.width() / ($defense.next().length ? $defense.width() + $defense.next().width() : $defense.parent().width()) * 100);
			}
			$dispel = $('img[src$="bar_dispel.gif"]').parent();
			if ($dispel.length) {
				monster.dispel = ($dispel.width() / ($dispel.next().length ? $dispel.width() + $dispel.next().width() : $dispel.parent().width()) * 100);
			}
			monster.timer = $('#app'+APPID+'_monsterTicker').text().parseTimer();
			monster.finish = Date.now() + (monster.timer * 1000);
			monster.damage_total = 0;
			monster.damage = {};
			$('td.dragonContainer table table a[href^="http://apps.facebook.com/castle_age/keep.php?user="]').each(function(i,el){
				var user = $(el).attr('href').regex(/user=([0-9]+)/i), tmp = $(el).parent().next().text().replace(/[^0-9\/]/g,''), dmg = tmp.regex(/([0-9]+)/), fort = tmp.regex(/\/([0-9]+)/);
				monster.damage[user]  = (fort ? [dmg, fort] : [dmg]);
				monster.damage_total += dmg;
			});
			monster.dps = monster.damage_total / (timer - monster.timer);
			if (Monster.types[type].raid) {
				monster.total = monster.damage_total + $('div[style*="monster_health_back.jpg"] div:nth-child(2)').text().regex(/([0-9]+)/);
			} else {
				monster.total = Math.floor(monster.damage_total / (100 - monster.health) * 100);
			}
			monster.eta = Date.now() + (Math.floor((monster.total - monster.damage_total) / monster.dps) * 1000);
		}
	} else if (Page.page === 'keep_monster' || Page.page === 'battle_raid') { // Check monster / raid list
		if (!$('#app'+APPID+'_app_body div.imgButton').length) {
			return false;
		}
		if (Page.page === 'battle_raid') {
			raid = true;
		}
		for (uid in Monster.data) {
			for (type in Monster.data[uid]) {
				if (((Page.page === 'battle_raid' && Monster.types[type].raid) || (Page.page === 'keep_monster' && !Monster.types[type].raid)) && (Monster.data[uid][type].state === 'complete' || (Monster.data[uid][type].state === 'assist' && Monster.data[uid][type].finish < Date.now()))) {
					Monster.data[uid][type].state = null;
				}
			}
		}
		$('#app'+APPID+'_app_body div.imgButton').each(function(i,el){
			var i, uid = $('a', el).attr('href').regex(/user=([0-9]+)/i), tmp = $(el).parent().parent().children().eq(1).html().regex(/graphics\/([^.]*\....)/i), type = 'unknown';
			for (i in Monster.types) {
				if (tmp === Monster.types[i].list || tmp === Monster.types[i].lis2) {
					type = i;
					break;
				}
			}
			if (!uid || type === 'unknown') {
				return;
			}
			Monster.data[uid] = Monster.data[uid] || {};
			Monster.data[uid][type] = Monster.data[uid][type] || {};
			if (uid === userID) {
				Monster.data[uid][type].name = 'You';
			} else {
				tmp = $(el).parent().parent().children().eq(2).text().trim();
				Monster.data[uid][type].name = tmp.substr(0, tmp.length - Monster.types[type].name.length - 3);
			}
			switch($('img', el).attr('src').regex(/dragon_list_btn_([0-9])/)) {
				case 2: Monster.data[uid][type].state = 'reward'; break;
				case 3: Monster.data[uid][type].state = 'engage'; break;
				case 4:
//					if (Monster.types[type].raid && Monster.data[uid][type].health) {
//						Monster.data[uid][type].state = 'engage'; // Fix for page cache issues in 2-part raids
//					} else {
						Monster.data[uid][type].state = 'complete';
//					}
					break;
				default: Monster.data[uid][type].state = 'unknown'; break; // Should probably delete, but keep it on the list...
			}
		});
	}
	Monster.runtime.count = 0;
	for (i in Monster.data) {
		for (j in Monster.data[i]) {
			if (!Monster.data[i][j].state) {
				delete Monster.data[i][j];
			} else if (Monster.data[i][j].state === 'engage') {
				Monster.runtime.count++;
			}
		}
		if (!length(Monster.data[i])) {
			delete Monster.data[i];
		}
	}
	return false;
};

Monster.work = function(state) {
	var i, j, k, new_id, id_list = [], battle_list = Battle.get('user'), list = [], uid = Monster.runtime.uid, type = Monster.runtime.type, btn = null, best = null
	if (!state || (uid && type && Monster.data[uid][type].state !== 'engage' && Monster.data[uid][type].state !== 'assist')) {
		Monster.runtime.uid = uid = null;
		Monster.runtime.type = type = null;
	}
	if (!length(Monster.data) || Player.get('health') <=12) {
		return false;
	}
	for (i in Monster.data) {
		for (j in Monster.data[i]) {
			if (!Monster.data[i][j].health && Monster.data[i][j].state === 'engage') {
				if (state) {
					Page.to(Monster.types[j].raid ? 'battle_raid' : 'keep_monster', '?user=' + i + (Monster.types[j].mpool ? '&mpool='+Monster.types[j].mpool : ''));
				}
				return true;
			}
		}
	}
	if (!uid || !type || !Monster.data[uid] || !Monster.data[uid][type]) {
		for (uid in Monster.data) {
			for (type in Monster.data[uid]) {
				if (Monster.data[uid][type].state === 'engage' && Monster.data[uid][type].finish > Date.now()) {
					if (Monster.option.choice === 'All' || (Monster.option.choice === 'Achievement' && Monster.types[type].achievement && Monster.damage[userID] && Monster.damage[userID][0] <= Monster.types[type].achievement)) {
						list.push([uid, type]);
					} else if (!(best || Monster.option.choice === 'Achievement')
					|| (Monster.option.choice === 'Strongest' && Monster.data[uid][type].health > Monster.data[best[0]][best[1]].health)
					|| (Monster.option.choice === 'Weakest' && Monster.data[uid][type].health < Monster.data[best[0]][best[1]].health)
					|| (Monster.option.choice === 'Shortest' &&  Monster.data[uid][type].timer < Monster.data[best[0]][best[1]].timer)
					|| (Monster.option.choice === 'Spread' && Monster.data[uid][type].battle_count < Monster[best[0]][best[1]].battle_count)) {
						best = [uid, type];
					}
				}
			}
		}
		if ((Monster.option.choice === 'All' || Monster.option.choice === 'Achievement') && list.length) {
			best = list[Math.floor(Math.random()*list.length)];
		}
		if (!best) {
			return false;
		}
		uid  = Monster.runtime.uid  = best[0];
		type = Monster.runtime.type = best[1];
	}
	if (Queue.burn.stamina < ((Monster.option.raid.search('x5') == -1) ? 1 : 5) && (Queue.burn.energy < 10 || (!Monster.option.first && (typeof Monster.data[uid][type].defense === 'undefined' || Monster.data[uid][type].defense > Monster.option.fortify) && (typeof Monster.data[uid][type].dispel === 'undefined' || Monster.data[uid][type].dispel < Monster.option.dispel)))) {
		return false;
	}
	if (!state) {
		return true;
	}
	if (Monster.types[type].raid) {
		if (!Generals.to(Generals.best((Monster.option.raid.search('Invade') == -1) ? 'raid-duel' : 'raid-invade'))) {
			return true;
		}
		debug('Raid: '+Monster.option.raid+' '+uid);
		switch(Monster.option.raid) {
			case 'Invade':
				btn = $('input[src$="raid_attack_button.gif"]:first');
				break;
			case 'Invade x5':
				btn = $('input[src$="raid_attack_button3.gif"]:first');
				break;
			case 'Duel':
				btn = $('input[src$="raid_attack_button2.gif"]:first');
				break;
			case 'Duel x5':
				btn = $('input[src$="raid_attack_button4.gif"]:first');
				break;
		}
	} else if (Monster.data[uid][type].defense && Monster.data[uid][type].defense <= Monster.option.fortify && Queue.burn.energy >= 10) {
		if (!Generals.to(Generals.best('defend'))) {
			return true;
		}
		debug('Monster: Fortify '+uid);
		for (i=0; i<Monster.fortify.length; i++) {
			if ($(Monster.fortify[i]).length) {
				btn = $(Monster.fortify[i]);
				break;
			}
		}
	} else if (Monster.data[uid][type].dispel && Monster.data[uid][type].dispel >= Monster.option.dispel && Queue.burn.energy >= 10) {
		if (!Generals.to(Generals.best('defend'))) {
			return true;
		}
		debug('Monster: Dispel '+uid);
		for (i=0; i<Monster.dispel.length; i++) {
			if ($(Monster.dispel[i]).length) {
				btn = $(Monster.dispel[i]);
				break;
			}
		}
	} else {
		if (!Generals.to(Generals.best('duel'))) {
			return true;
		}
		debug('Monster: Attack '+uid);
		for (i=0; i<Monster.attack.length; i++) {
			if ($(Monster.attack[i]).length) {
				btn = $(Monster.attack[i]);
				break;
			}
		}
	}
	if ((!btn || !btn.length || uid !== this.runtime.current) && !Page.to(Monster.types[type].raid ? 'battle_raid' : 'keep_monster', '?user=' + uid + (Monster.types[type].mpool ? '&mpool='+Monster.types[type].mpool : ''))) {
		return true; // Reload if we can't find the button or we're on the wrong page
	}

	if (this.option.force1){
		for (k in battle_list){
			id_list.push(k); // Grabbing a list of valid CA user IDs from the Battle Worker to substitute into the Raid buttons for +1 raid attacks.
		}
		new_id = (id_list[Math.floor(Math.random() * (id_list.length))] || 0);
//		if( new_id) {
			debug('Replacing Raid ID:' + $('input[name*="target_id"]:first').val() + ' with ID:' + new_id);
			$('input[name*="target_id"]').val(new_id); // Changing the ID for the button we're gonna push.
//		}
	}

	if (true){ //Replace "true" with code to check to see if the first player's army or level matches the Raid criteria.
		Page.click(btn);
	}
	return true;
};

Monster.order = null;
Monster.dashboard = function(sort, rev) {
	var i, j, o, monster, url, list = [], output = [], sorttype = [null, 'name', 'health', 'defense', 'dispel', null, 'timer', 'eta'], state = {engage:0, assist:1, reward:2, complete:3}, blank;
	if (typeof sort === 'undefined') {
		sort = 1; // Default = sort by name
		Monster.order = [];
		for (i in Monster.data) {
			for (j in Monster.data[i]) {
				Monster.order.push([i, j]);
			}
		}
	}
	Monster.order.sort(function(a,b) {
		var aa, bb;
		if (state[Monster.data[a[0]][a[1]].state] > state[Monster.data[b[0]][b[1]].state]) {
			return 1;
		}
		if (state[Monster.data[a[0]][a[1]].state] < state[Monster.data[b[0]][b[1]].state]) {
			return -1;
		}
		if (typeof sorttype[sort] === 'string') {
			aa = Monster.data[a[0]][a[1]][sorttype[sort]];
			bb = Monster.data[b[0]][b[1]][sorttype[sort]];
		} else if (sort == 4) { // damage
			aa = Monster.data[a[0]][a[1]].damage ? Monster.data[a[0]][a[1]].damage[userID] : 0;
			bb = Monster.data[b[0]][b[1]].damage ? Monster.data[b[0]][b[1]].damage[userID] : 0;
		}
		if (typeof aa === 'string' || typeof bb === 'string') {
			return (rev ? (bb || '') > (aa || '') : (bb || '') < (aa || ''));
		}
		return (rev ? (aa || 0) - (bb || 0) : (bb || 0) - (aa || 0));
	});
	th(output, '');
	th(output, 'User');
	th(output, 'Health', 'title="(estimated)"');
	th(output, 'Fortify');
	th(output, 'Shield');
	th(output, 'Damage');
	th(output, 'Time Left');
	th(output, 'Kill In', 'title="(estimated)"');
	list.push('<table cellspacing="0" style="width:100%"><thead><tr>' + output.join('') + '</tr></thead><tbody>');
	for (o=0; o<Monster.order.length; o++) {
		i = Monster.order[o][0];
		j = Monster.order[o][1];
		if (!Monster.types[j]) {
			continue;
		}
		output = [];
		monster = Monster.data[i][j];
		blank = !((monster.state === 'engage' || monster.state === 'assist') && monster.total);
		// http://apps.facebook.com/castle_age/battle_monster.php?user=00000&mpool=3
		// http://apps.facebook.com/castle_age/battle_monster.php?twt2=earth_1&user=00000&action=doObjective&mpool=3&lka=00000&ref=nf
		// http://apps.facebook.com/castle_age/raid.php?user=00000
		// http://apps.facebook.com/castle_age/raid.php?twt2=deathrune_adv&user=00000&action=doObjective&lka=00000&ref=nf
		if (Monster.option.assist && (monster.state === 'engage' || monster.state === 'assist')) {
			url = '?user=' + i + '&action=doObjective' + (Monster.types[j].mpool ? '&mpool=' + Monster.types[j].mpool : '') + '&lka=' + i + '&ref=nf';
		} else {
			url = '?user=' + i + (Monster.types[j].mpool ? '&mpool=' + Monster.types[j].mpool : '');
		}
		td(output, '<a href="http://apps.facebook.com/castle_age/' + (Monster.types[j].raid ? 'raid.php' : 'battle_monster.php') + url + '"><strong class="overlay">' + monster.state + '</strong><img src="' + imagepath + Monster.types[j].list + '" style="width:90px;height:25px" alt="' + j + '"></a>', 'title="' + Monster.types[j].name + '"');
		th(output, Monster.data[i][j].name);
		td(output, blank ? '' : monster.health === 100 ? '100%' : addCommas(monster.total - monster.damage_total) + ' (' + Math.floor(monster.health) + '%)');
		td(output, blank ? '' : isNumber(monster.defense) ? Math.floor(monster.defense)+'%' : '');
		td(output, blank ? '' : isNumber(monster.dispel) ? Math.floor(monster.dispel)+'%' : '');
		td(output, blank ? '' : monster.state === 'engage' ? addCommas(monster.damage[userID][0] || 0) + ' (' + ((monster.damage[userID][0] || 0) / monster.total * 100).round(1) + '%)' : '', blank ? '' : 'title="In ' + (monster.battle_count || 'an unknown number of') + ' attacks"');
		td(output, blank ? '' : monster.timer ? '<span class="golem-timer">' + makeTimer((monster.finish - Date.now()) / 1000) + '</span>' : '?');
		td(output, blank ? '' : '<span class="golem-timer">' + (monster.health === 100 ? makeTimer((monster.finish - Date.now()) / 1000) : makeTimer((monster.eta - Date.now()) / 1000)) + '</span>');
		tr(list, output.join(''));
	}
	list.push('</tbody></table>');
	$('#golem-dashboard-Monster').html(list.join(''));
	if (typeof sort !== 'undefined') {
		$('#golem-dashboard-Monster thead th:eq('+sort+')').attr('name',(rev ? 'reverse' : 'sort')).append('&nbsp;' + (rev ? '&uarr;' : '&darr;'));
	}
};

/********** Worker.News **********
* Aggregate the news feed
*/
var News = new Worker('News', 'index');
News.data = null;
News.option = null;
News.runtime = {
	last:0
};

News.parse = function(change) {
	if (change) {
		var xp = 0, bp = 0, win = 0, lose = 0, deaths = 0, cash = 0, i, j, list = [], user = {}, order, last_time = this.runtime.last;
		News.runtime.last = Date.now();
		$('#app'+APPID+'_battleUpdateBox .alertsContainer .alert_content').each(function(i,el) {
			var uid, txt = $(el).text().replace(/,/g, ''), title = $(el).prev().text(), days = title.regex(/([0-9]+) days/i), hours = title.regex(/([0-9]+) hours/i), minutes = title.regex(/([0-9]+) minutes/i), seconds = title.regex(/([0-9]+) seconds/i), time, my_xp = 0, my_bp = 0, my_cash = 0;
			time = Date.now() - ((((((((days || 0) * 24) + (hours || 0)) * 60) + (minutes || 59)) * 60) + (seconds || 59)) * 1000);
			if (txt.regex(/You were killed/i)) {
				deaths++;
			} else {
				uid = $('a:eq(0)', el).attr('href').regex(/user=([0-9]+)/i);
				user[uid] = user[uid] || {name:$('a:eq(0)', el).text(), win:0, lose:0}
				if (txt.regex(/Victory!/i)) {
					win++;
					user[uid].lose++;
					my_xp = txt.regex(/([0-9]+) experience/i);
					my_bp = txt.regex(/([0-9]+) Battle Points!/i);
					my_cash = txt.regex(/\$([0-9]+)/i);
				} else {
					lose++;
					user[uid].win++;
					my_xp = 0 - txt.regex(/([0-9]+) experience/i);
					my_bp = 0 - txt.regex(/([0-9]+) Battle Points!/i);
					my_cash = 0 - txt.regex(/\$([0-9]+)/i);
				}
				if (time > last_time) {
//					debug('News: Add to History (+battle): exp = '+my_xp+', bp = '+my_bp+', income = '+my_cash);
					time = Math.floor(time / 3600000);
					History.add([time, 'exp+battle'], my_xp);
					History.add([time, 'bp+battle'], my_bp);
					History.add([time, 'income+battle'], my_cash);
				}
				xp += my_xp;
				bp += my_bp;
				cash += my_cash;
				
			}
		});
		if (win || lose) {
			list.push('You were challenged <strong>' + (win + lose) + '</strong> times, winning <strong>' + win + '</strong> and losing <strong>' + lose + '</strong>.');
			list.push('You ' + (xp >= 0 ? 'gained <span class="positive">' : 'lost <span class="negative">') + addCommas(Math.abs(xp)) + '</span> experience points.');
			list.push('You ' + (cash >= 0 ? 'gained <span class="positive">' : 'lost <span class="negative">') + '<b class="gold">$' + addCommas(Math.abs(cash)) + '</b></span>.');
			list.push('You ' + (bp >= 0 ? 'gained <span class="positive">' : 'lost <span class="negative">') + addCommas(Math.abs(bp)) + '</span> Battle Points.');
			list.push('');
			order = sortObject(user, function(a,b){return (user[b].win + (user[b].lose / 100)) - (user[a].win + (user[a].lose / 100));});
			for (j=0; j<order.length; j++) {
				i = order[j];
				list.push('<strong title="' + i + '">' + user[i].name + '</strong> ' + (user[i].win ? 'beat you <span class="negative">' + user[i].win + '</span> time' + (user[i].win>1?'s':'') : '') + (user[i].lose ? (user[i].win ? ' and ' : '') + 'was beaten <span class="positive">' + user[i].lose + '</span> time' + (user[i].lose>1?'s':'') : '') + '.');
			}
			if (deaths) {
				list.push('You died ' + (deaths>1 ? deaths+' times' : 'once') + '!');
			}
			$('#app'+APPID+'_battleUpdateBox  .alertsContainer').prepend('<div style="padding: 0pt 0pt 10px;"><div class="alert_title">Summary:</div><div class="alert_content">' + list.join('<br>') + '</div></div>');
		}
	}
	return true;
};

/********** Worker.Player **********
* Gets all current stats we can see
*/
var Player = new Worker('Player', '*', {keep:true});
Player.data = {};
Player.option = null;
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
	var when = new Date(script_started + ($('*').html().regex(/gold_increase_ticker\(([0-9]+),/) * 1000));
	this.data.cash_time = when.getSeconds() + (when.getMinutes() * 60);
	this.runtime.cash_timeout = null;
	this.runtime.energy_timeout = null;
	this.runtime.health_timeout = null;
	this.runtime.stamina_timeout = null;
};

Player.parse = function(change) {
	var data = this.data, keep, stats, tmp, energy_used = 0, stamina_used = 0;
	data.cash		= parseInt($('strong#app'+APPID+'_gold_current_value').text().replace(/[^0-9]/g, ''), 10);
	tmp = $('#app'+APPID+'_energy_current_value').parent().text().regex(/([0-9]+)\s*\/\s*([0-9]+)/);
	data.energy		= tmp[0] || 0;
	data.maxenergy	= tmp[1] || 0;
	tmp = $('#app'+APPID+'_health_current_value').parent().text().regex(/([0-9]+)\s*\/\s*([0-9]+)/);
	data.health		= tmp[0] || 0;
	data.maxhealth	= tmp[1] || 0;
	tmp = $('#app'+APPID+'_stamina_current_value').parent().text().regex(/([0-9]+)\s*\/\s*([0-9]+)/);
	data.stamina	= tmp[0] || 0;
	data.maxstamina	= tmp[1] || 0;
	tmp = $('#app'+APPID+'_st_2_5').text().regex(/([0-9]+)\s*\/\s*([0-9]+)/);
	data.exp		= tmp[0] || 0;
	data.maxexp		= tmp[1] || 0;
	data.level		= $('#app'+APPID+'_st_5').text().regex(/Level: ([0-9]+)!/i);
	data.armymax	= $('a[href*=army.php]', '#app'+APPID+'_main_bntp').text().regex(/([0-9]+)/);
	data.army		= Math.min(data.armymax, 501); // XXX Need to check what max army is!
	data.upgrade	= ($('a[href*=keep.php]', '#app'+APPID+'_main_bntp').text().regex(/([0-9]+)/) || 0);
	data.general	= $('div.general_name_div3').first().text().trim();
	data.imagepath	= $('#app'+APPID+'_globalContainer img:eq(0)').attr('src').pathpart();
	if (Page.page==='keep_stats') {
		keep = $('div.keep_attribute_section').first(); // Only when it's our own keep and not someone elses
		if (keep.length) {
			data.myname = $('div.keep_stat_title > span', keep).text().regex(/"(.*)"/);
			data.rank = $('td.statsTMainback img[src*=rank_medals]').attr('src').filepart().regex(/([0-9]+)/);
			stats = $('div.attribute_stat_container', keep);
			data.attack = $(stats).eq(2).text().regex(/([0-9]+)/);
			data.defense = $(stats).eq(3).text().regex(/([0-9]+)/);
			data.bank = parseInt($('td.statsTMainback b.money').text().replace(/[^0-9]/g,''), 10);
			stats = $('td.statsTMainback tr tr').text().replace(/[^0-9$]/g,'').regex(/([0-9]+)\$([0-9]+)\$([0-9]+)/);
			data.maxincome = stats[0];
			data.upkeep = stats[1];
			data.income = stats[2];
		}
	}
	if (Page.page==='town_land') {
		stats = $('.mContTMainback div:last-child');
		data.income = stats.eq(stats.length - 4).text().replace(/[^0-9]/g,'').regex(/([0-9]+)/);
	}
	$('span.result_body').each(function(i,el){
		var txt = $(el).text().replace(/,|\s+|\n/g, '');
		History.add('income', sum(txt.regex(/Gain.*\$([0-9]+).*Cost|stealsGold:\+\$([0-9]+)|Youreceived\$([0-9]+)|Yougained\$([0-9]+)/i)));
		if (txt.regex(/incomepaymentof\$([0-9]+)gold/i)){
			History.set('land', sum(txt.regex(/incomepaymentof\$([0-9]+)gold|backinthemine:Extra([0-9]+)Gold/i)));
		}
	});
	if ($('#app'+APPID+'_energy_time_value').length) {
		window.clearTimeout(this.runtime.energy_timeout);
		this.runtime.energy_timeout = window.setTimeout(function(){Player.get('energy');}, $('#app'+APPID+'_energy_time_value').text().parseTimer() * 1000);
	}
	if ($('#app'+APPID+'_health_time_value').length) {
		window.clearTimeout(this.runtime.health_timeout);
		this.runtime.health_timeout = window.setTimeout(function(){Player.get('health');}, $('#app'+APPID+'_health_time_value').text().parseTimer() * 1000);
	}
	if ($('#app'+APPID+'_stamina_time_value').length) {
		window.clearTimeout(this.runtime.stamina_timeout);
		this.runtime.stamina_timeout = window.setTimeout(function(){Player.get('stamina');}, $('#app'+APPID+'_stamina_time_value').text().parseTimer() * 1000);
	}
	return false;
};

Player.update = function(type) {
	if (type !== 'option') {
		var i, j, types = ['stamina', 'energy', 'health'], list, step;
		for (j=0; j<types.length; j++) {
			list = [];
			step = Divisor(Player.data['max'+types[j]])
			for (i=0; i<=Player.data['max'+types[j]]; i+=step) {
				list.push(i);
			}
			Config.set(types[j], list);
		}
		History.set('bank', this.data.bank);
		History.set('exp', this.data.exp);
	}
	Dashboard.status(this, 'Income: $' + addCommas(History.get('income.average').round()) + ' per hour (plus $' + addCommas(History.get('land.average').round()) + ' from land)');
};

Player.get = function(what) {
	var i, j = 0, low = Number.POSITIVE_INFINITY, high = Number.NEGATIVE_INFINITY, min = Number.POSITIVE_INFINITY, max = Number.NEGATIVE_INFINITY, data = this.data, now = Date.now();
	switch(what) {
		case 'cash':			return (this.data.cash = parseInt($('strong#app'+APPID+'_gold_current_value').text().replace(/[^0-9]/g, ''), 10));
//		case 'cash_timer':		return $('#app'+APPID+'_gold_time_value').text().parseTimer();
		case 'cash_timer':		var when = new Date();
								return (3600 + data.cash_time - (when.getSeconds() + (when.getMinutes() * 60))) % 3600;
		case 'energy':			return (this.data.energy = $('#app'+APPID+'_energy_current_value').parent().text().regex(/([0-9]+)\s*\/\s*[0-9]+/));
		case 'energy_timer':	return $('#app'+APPID+'_energy_time_value').text().parseTimer();
		case 'health':			return (this.data.health = $('#app'+APPID+'_health_current_value').parent().text().regex(/([0-9]+)\s*\/\s*[0-9]+/));
		case 'health_timer':	return $('#app'+APPID+'_health_time_value').text().parseTimer();
		case 'stamina':			return (this.data.stamina = $('#app'+APPID+'_stamina_current_value').parent().text().regex(/([0-9]+)\s*\/\s*[0-9]+/));
		case 'stamina_timer':	return $('#app'+APPID+'_stamina_time_value').text().parseTimer();
		case 'exp_needed':		return data.maxexp - data.exp;
		default: return this._get(what);
	}
};

/********** Worker.Potions **********
* Automatically drinks potions
*/
var Potions = new Worker('Potions', 'keep_stats');

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
		select:{0:0,5:5,10:10,15:15,20:20,25:25,30:30,35:35,40:40,infinite:'&infin;'},
		help:'Will use them when you have to many, if you collect more than 40 they will be lost anyway'
	},{
		id:'stamina',
		label:'Maximum Stamina Potions',
		select:{0:0,5:5,10:10,15:15,20:20,25:25,30:30,35:35,40:40,infinite:'&infin;'},
		help:'Will use them when you have to many, if you collect more than 40 they will be lost anyway'
	}
];

Potions.init = function() {
//	this._watch(Quest);
};

/*
<span class="result_body"><div style="padding: 3px 0pt; width: 726px;">
                    			<div style="clear: both;"></div>
                    			<div style="padding: 0px 5px 0pt; float: left; width: 100px; text-align: center;">
                    			    <img src="http://image2.castleagegame.com/304/graphics/land_elves.gif">
                    			</div>
                    			<div style="padding: 20px 0pt 0pt; float: left; width: 420px; text-align: left;">
                    			   Elven Alchemist - My lord, I have concocted a special potion for you: 10 Point Stamina Potion!
                				</div>
                    			<div style="padding: 0px 5px 0pt; float: left; width: 100px; text-align: center;">
                    			    <img height="90" src="http://image2.castleagegame.com/304/graphics/potion_stamina.jpg">
                    			</div>
                    			<div style="clear: both;"></div>
                    		</div>				</span>
*/

Potions.parse = function(change) {
	this.data = {};
	$('.statsT2:eq(2) .statUnit').each(function(i,el){
		var info = $(el).text().replace(/\s+/g, ' ').trim().regex(/(.*) Potion x ([0-9]+)/i);
		if (info && info[0] && info[1]) {
			Potions.data[info[0]] = info[1];
		}
	});
	return false;
};

Potions.update = function(type) {
	var txt = [];
	this.runtime.drink = false;
//	Page.to('keep_stats'); UGH!!!!
	for(var i in this.data) {
		if (this.data[i]) {
			txt.push(i + ': ' + this.data[i] + '/' + this.option[i.toLowerCase()]);
		}
		if (typeof this.option[i.toLowerCase()] === 'number' && this.data[i] > this.option[i.toLowerCase()] && (Player.get(i.toLowerCase()) || 0) < (Player.get('max' + i.toLowerCase()) || 0)) {
			this.runtime.drink = true;
		}
	}
	Dashboard.status(this, txt.join(', '));
};

Potions.work = function(state) {
	if (!this.runtime.drink) {
		return false;
	}
	if (!state || !Page.to('keep_stats')) {
		return true;
	}
	for(var i in this.data) {
		if (typeof this.option[i.toLowerCase()] === 'number' && this.data[i] > this.option[i.toLowerCase()]) {
			debug('Potions: Wanting to drink a ' + i + ' potion');
			Page.click('.statUnit:contains("' + i + '") form .imgButton input');
			break;
		}
	}
	return true;
};

/********** Worker.Quest **********
* Completes quests with a choice of general
*/
// Should also look for quests_quest but that should never be used unless there's a new area
var Quest = new Worker('Quest', 'quests_quest1 quests_quest2 quests_quest3 quests_quest4 quests_quest5 quests_quest6 quests_quest7 quests_demiquests quests_atlantis', {data:true, option:true});
Quest.option = {
	general:true,
	what:'Influence',
	unique:true,
	monster:true,
	bank:true
};

Quest.runtime = {
	best:null,
	energy:0
};

Quest.land = ['Land of Fire', 'Land of Earth', 'Land of Mist', 'Land of Water', 'Demon Realm', 'Undead Realm', 'Underworld'];
Quest.area = {quest:'Quests', demiquest:'Demi Quests', atlantis:'Atlantis'};
Quest.current = null;
Quest.display = [
	{
		id:'general',
		label:'Use Best General',
		checkbox:true
	},{
		id:'what',
		label:'Quest for',
		select:'quest_reward'
	},{
		id:'unique',
		label:'Get Unique Items First',
		checkbox:true
	},{
		id:'monster',
		label:'Fortify Monsters First',
		checkbox:true
	},{
		id:'bank',
		label:'Automatically Bank',
		checkbox:true
	}
];

Quest.init = function() {
	for (var i in this.data) {
		if (i.indexOf('\t') !== -1) { // Fix bad page loads...
			delete this.data[i];
		}
	}
};

Quest.parse = function(change) {
	var quest = this.data, area, land = null;
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
	$('div.quests_background,div.quests_background_sub,div.quests_background_special').each(function(i,el){
		var name, level, influence, reward, units, energy, tmp, type = 0;
		if ($(el).hasClass('quests_background_sub')) { // Subquest
			name = $('.quest_sub_title', el).text().trim();
			reward = $('.qd_2_sub', el).text().replace(/[^0-9$]/g, '').regex(/^([0-9]+)\$([0-9]+)\$([0-9]+)$/);
			energy = $('.qd_3_sub', el).text().regex(/([0-9]+)/);
			level = $('.quest_sub_progress', el).text().regex(/LEVEL ([0-9]+)/i);
			influence = $('.quest_sub_progress', el).text().regex(/INFLUENCE: ([0-9]+)%/i);
			type = 2;
		} else {
			name = $('.qd_1 b', el).text().trim();
			reward = $('.qd_2', el).text().replace(/[^0-9$]/g, '').regex(/^([0-9]+)\$([0-9]+)\$([0-9]+)$/);
			energy = $('.quest_req b', el).text().regex(/([0-9]+)/);
			if ($(el).hasClass('quests_background')) { // Main quest
				level = $('.quest_progress', el).text().regex(/LEVEL ([0-9]+)/i);
				influence = $('.quest_progress', el).text().regex(/INFLUENCE: ([0-9]+)%/i);
				type = 1;
			} else { // Special Quest
				type = 3;
			}
		}
		if (!name || name.indexOf('\t') !== -1) { // Hopefully stop it finding broken qpage load quests
			return;
		}
		quest[name] = {};
		quest[name].area = area;
		if (typeof land === 'number') {
			quest[name].land = land;
		}
		if (typeof influence === 'number') {
			quest[name].level = (level || 0);
			quest[name].influence = influence;
		}
		quest[name].exp = reward.shift();
		quest[name].reward = (reward[0] + reward[1]) / 2;
		quest[name].energy = energy;
		if (type === 2) { // Main quest has some extra stuff
			return;
		}
		if (type === 3) { // Special quests create unique items
			quest[name].unique = true;
		}
		tmp = $('.qd_1 img', el).last();
		if (tmp.length && tmp.attr('title')) {
			quest[name].item	= tmp.attr('title').trim();
			quest[name].itemimg	= tmp.attr('src').filepart();
		}
		units = {};
		$('.quest_req >div >div >div', el).each(function(i,el){
			var title = $('img', el).attr('title');
			units[title] = $(el).text().regex(/([0-9]+)/);
		});
		if (length(units)) {
			quest[name].units = units;
		}
		tmp = $('.quest_act_gen img', el);
		if (tmp.length && tmp.attr('title')) {
			quest[name].general = tmp.attr('title');
		}
	});
	return false;
};

Quest.update = function(type) {
	// First let's update the Quest dropdown list(s)...
	var i, j, best = null, list = [];
	for (i in this.data) {
		if (this.data[i].item && !this.data[i].unique) {
			list.push(this.data[i].item);
		}
	}
	Config.set('quest_reward', ['Nothing', 'Influence', 'Experience', 'Cash'].concat(unique(list).sort()));
	// Now choose the next quest...
	if (this.option.unique && Alchemy._changed > this.lastunique) {
		for (i in this.data) {
			if (this.data[i].unique && !Alchemy.get(['ingredients', this.data[i].itemimg]) && (!best || this.data[i].energy < this.data[best].energy)) {
				best = i;
			}
		}
		this.lastunique = Date.now();
	}
	if (!best && this.option.what !== 'Nothing') {
		for (i in this.data) {
			if ((this.option.what === 'Influence' && typeof this.data[i].influence !== 'undefined' && this.data[i].influence < 100 && (!best || this.data[i].energy < this.data[best].energy))
			|| (this.option.what === 'Experience' && (!best || (this.data[i].energy / this.data[i].exp) < (this.data[best].energy / this.data[best].exp)))
			|| (this.option.what === 'Cash' && (!best || (this.data[i].energy / this.data[i].reward) < (this.data[best].energy / this.data[best].reward)))
			|| (this.option.what !== 'Influence' && this.option.what !== 'Experience' && this.option.what !== 'Cash' && this.data[i].item === this.option.what && (!best || this.data[i].energy < this.data[best].energy))) {
				best = i;
			}
		}
	}
	if (best !== this.runtime.best) {
		this.runtime.best = best;
		if (best) {
			this.runtime.energy = this.data[best].energy;
			debug('Quest: Wanting to perform - ' + best + ' (energy: ' + this.runtime.energy + ')');
			Dashboard.status(this, best + ' (energy: ' + this.runtime.energy + ')');
		} else {
			Dashboard.status(this);
		}
	}
//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
	if (this.option.monster && Monster.data) {
		for (i in Monster.data) {
			for (j in Monster.data[i]) {
				if (Monster.data[i][j].state === 'engage' && typeof Monster.data[i][j].defense === 'number' && Monster.data[i][j].defense <= Monster.option.fortify) {
					return false;
				}
			}
		}
	}
};

Quest.work = function(state) {
	var i, j, general = null, best = this.runtime.best;
	if (!this.runtime.best || this.runtime.energy > Queue.burn.energy) {
		if (state && this.option.bank) {
			return Bank.work(true);
		}
		return false;
	}
	if (!state) {
		return true;
	}
	if (this.option.general) {
		if (this.data[best].general && (typeof this.data[best].influence === 'undefined' || this.data[best].influence < 100)) {
			if (!Generals.to(this.data[best].general)) 
			{
				return true;
			}
		} else {
			switch(this.option.what) {
				case 'Influence':
				case 'Experience':
					general = Generals.best('under level 4');
					if (general === 'any' && this.data[best].influence < 100) {
						general = Generals.best('influence');
					}
					break;
				case 'Cash':
					general = Generals.best('cash');
					break;
				default:
					general = Generals.best('item');
					break;
			}
			if (!Generals.to(general)) {
				return true;
			}
		}
	}
	switch(this.data[best].area) {
		case 'quest':
			if (!Page.to('quests_quest' + (this.data[best].land + 1))) {
				return true;
			}
			break;
		case 'demiquest':
			if (!Page.to('quests_demiquests')) {
				return true;
			}
			break;
		case 'atlantis':
			if (!Page.to('quests_atlantis')) {
				return true;
			}
			break;
		default:
			debug('Quest: Can\'t get to quest area!');
			return false;
	}
	debug('Quest: Performing - ' + best + ' (energy: ' + this.data[best].energy + ')');
	if (!Page.click('div.action[title^="' + best + '"] input[type="image"]')) { // Can't find the quest, so either a bad page load, or bad data - delete the quest and reload, which should force it to update ok...
		delete this.data[best];
		Page.reload();
	}
	if (this.option.unique && this.data[best].unique) {
		Page.to('keep_alchemy');
//		Page.to('quests_quest' + (this.data[best].land + 2)); Really ought to check for new quests - but also need to not repeat needlessly
	}
	return true;
};

Quest.order = [];
Quest.dashboard = function(sort, rev) {
	var i, o, list = [], output = [];
	if (typeof sort === 'undefined') {
		this.order = [];
		for (i in this.data) {
			this.order.push(i);
		}
		sort = 1; // Default = sort by name
	}
	function getValue(q){
		switch(sort) {
			case 0:	// general
				return Quest.data[q].general || 'zzz';
			case 1: // name
				return q;
			case 2: // area
				return typeof Quest.data[q].land === 'number' && typeof Quest.land[Quest.data[q].land] !== 'undefined' ? Quest.land[Quest.data[q].land] : Quest.area[Quest.data[q].area];
			case 3: // level
				return (typeof Quest.data[q].level !== 'undefined' ? Quest.data[q].level : -1) * 100 + (Quest.data[q].influence || 0);
			case 4: // energy
				return Quest.data[q].energy;
			case 5: // exp
				return Quest.data[q].exp / Quest.data[q].energy;
			case 6: // reward
				return Quest.data[q].reward / Quest.data[q].energy;
			case 7: // item
				return Quest.data[q].item || 'zzz';
		}
		return 0; // unknown
	}
	this.order.sort(function(a,b) {
		var aa = getValue(a), bb = getValue(b);
		if (typeof aa === 'string' || typeof bb === 'string') {
			return (rev ? (bb || '') > (aa || '') : (bb || '') < (aa || ''));
		}
		return (rev ? (aa || 0) - (bb || 0) : (bb || 0) - (aa || 0));
	});
	th(output, 'General');
	th(output, 'Name');
	th(output, 'Area');
	th(output, 'Level');
	th(output, 'Energy');
	th(output, '@&nbsp;Exp');
	th(output, '@&nbsp;Reward');
	th(output, 'Item');
	list.push('<table cellspacing="0" style="width:100%"><thead><tr>' + output.join('') + '</tr></thead><tbody>');
	for (o=0; o<this.order.length; o++) {
		i = this.order[o];
		output = [];
		td(output, Generals.get([this.data[i].general]) ? '<img style="width:25px;height:25px;" src="' + imagepath + Generals.get([this.data[i].general, 'img']) + '" alt="' + this.data[i].general + '" title="' + this.data[i].general + '">' : '');
		th(output, i);
		td(output, typeof this.data[i].land === 'number' ? this.land[this.data[i].land].replace(' ','&nbsp;') : this.area[this.data[i].area].replace(' ','&nbsp;'));
		td(output, typeof this.data[i].level !== 'undefined' ? this.data[i].level + '&nbsp;(' + this.data[i].influence + '%)' : '');
		td(output, this.data[i].energy);
		td(output, (this.data[i].exp / this.data[i].energy).round(2), 'title="' + this.data[i].exp + ' total, ' + (this.data[i].exp / this.data[i].energy * 12).round(2) + ' per hour"');
		td(output, '$' + addCommas((this.data[i].reward / this.data[i].energy).round()), 'title="$' + addCommas(this.data[i].reward) + ' total, $' + addCommas((this.data[i].reward / this.data[i].energy * 12).round()) + ' per hour"');
		td(output, this.data[i].itemimg ? '<img style="width:25px;height:25px;" src="' + imagepath + this.data[i].itemimg + '" alt="' + this.data[i].item + '" title="' + this.data[i].item + '">' : '');
		tr(list, output.join(''), 'style="height:25px;"');
	}
	list.push('</tbody></table>');
	$('#golem-dashboard-Quest').html(list.join(''));
	$('#golem-dashboard-Quest tbody tr td:nth-child(2)').css('text-align', 'left');
	if (typeof sort !== 'undefined') {
		$('#golem-dashboard-Quest thead th:eq('+sort+')').attr('name',(rev ? 'reverse' : 'sort')).append('&nbsp;' + (rev ? '&uarr;' : '&darr;'));
	}
};

/********** Worker.Town **********
* Sorts and auto-buys all town units (not property)
*/
var Town = new Worker('Town', 'town_soldiers town_blacksmith town_magic');
Town.data = {};

Town.option = {
	number:'Minimum',
	maxcost:'$100k',
	units:'All',
	sell:false
};

Town.runtime = {
	best:null,
	buy:0,
	cost:0
};

Town.display = [
	{
		label:'Work in progress...'
	},{
		id:'number',
		label:'Buy Number',
		select:['None', 'Minimum', 'Match Army', 'Maximum'],
		help:'Minimum will buy before any quests (otherwise only bought when needed), Maximum will buy 501 (depending on generals)'
	},{
		advanced:true,
		id:'maxcost',
		label:'Maximum Buy Cost',
		select:['$10k','$100k','$1m','$10m','$100m','$1b','$10b','$100b']
	},{
		advanced:true,
		id:'units',
		label:'Buy Type',
		select:['All', 'Best Offense', 'Best Defense', 'Best of Both']
	},{
		advanced:true,
		id:'sell',
		label:'Auto-Sell<br>(Not enabled)',
		checkbox:true
	}
];

Town.blacksmith = { // Shield must come after armor (currently)
	Weapon:	/avenger|axe|blade|bow|cudgel|dagger|halberd|mace|morningstar|rod|saber|spear|staff|stave|sword|talon|trident|wand|Daedalus|Dragonbane|Dreadnought Greatsword|Excalibur|Incarnation|Ironhart's Might|Judgement|Justice|Lightbringer|Oathkeeper|Onslaught/i,
	Shield:	/buckler|shield|tome|Defender|Dragon Scale|Frost Dagger|Frost Tear Dagger|Harmony|Sword of Redemption|The Dreadnought/i,
	Helmet:	/cowl|crown|helm|horns|mask|veil/i,
	Gloves:	/gauntlet|glove|hand|bracer|Slayer's Embrace/i,
	Armor:	/armor|chainmail|cloak|pauldrons|plate|robe|Blood Vestment|Faerie Wings|Ogre Raiments/i,
	Amulet:	/amulet|bauble|charm|eye|heart|jewel|lantern|memento|orb|shard|soul|talisman|trinket|Paladin's Oath|Poseidons Horn/i
};

Town.init = function() {
	if (this.data.soldiers || this.data.blacksmith || this.data.magic) { // Need to reparse with new code...
		this.data = {};
		delete Page.data.town_soldiers;
		delete Page.data.town_blacksmith;
		delete Page.data.town_magic;
	}
};

Town.parse = function(change) {
	if (!change) {
		var unit = Town.data, page = Page.page.substr(5);
		$('.eq_buy_row,.eq_buy_row2').each(function(a,el){
			var i, stats = $('div.eq_buy_stats', el), name = $('.eq_buy_txt strong:first', el).text().trim(), costs = $('div.eq_buy_costs', el), cost = $('strong:first-child', costs).text().replace(/[^0-9]/g, '');
			unit[name] = unit[name] || {};
			unit[name].page = page;
			unit[name].img = $('div.eq_buy_image img', el).attr('src').filepart();
			unit[name].own = $('span:first-child', costs).text().regex(/Owned: ([0-9]+)/i);
			unit[name].att = $('.eq_buy_stats_int div:eq(0)', stats).text().regex(/([0-9]+)\s*Attack/);
			unit[name].def = $('.eq_buy_stats_int div:eq(1)', stats).text().regex(/([0-9]+)\s*Defense/);
			if (cost) {
				unit[name].cost = parseInt(cost, 10);
				unit[name].buy = [];
				$('select[name="amount"]:first option', costs).each(function(i,el){
					unit[name].buy.push(parseInt($(el).val(), 10));
				});
			}
			if (page === 'blacksmith') {
				for (i in Town.blacksmith) {
					if (name.match(Town.blacksmith[i])) {
						unit[name].type = i;
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
	att += getAttDef(data, function(list,i,units){if (units[i].page==='magic'){list.push(i);}}, 'att', army, 'invade');
	def += getAttDef(data, null, 'def', army, 'invade');
	return {attack:att, defend:def};
};

Town.getDuel = function() {
	var att = 0, def = 0, data = this.data;
	att += getAttDef(data, function(list,i,units){if (units[i].type === 'Weapon'){list.push(i);}}, 'att', 1, 'duel');
	def += getAttDef(data, null, 'def', 1, 'duel');
	att += getAttDef(data, function(list,i,units){if (units[i].page==='magic'){list.push(i);}}, 'att', 1, 'duel');
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

Town.update = function(type) {
	var i, u, best = null, buy = 0, data = this.data, quests, army = Player.get('army'), max = (this.option.number === 'Match Army' ? army : (this.option.number === 'Maximum' ? 501 : 0));
	this.runtime.invade = this.getInvade(army);
	this.runtime.duel = this.getDuel();
	if (this.option.number !== 'None') {
		quests = Quest.get();
		for (i in quests) {
			if (quests[i].units) {
				for (u in quests[i].units) {
					if (data[u] && data[u].cost && data[u].own < quests[i].units[u]) {
						best = u;
						buy = quests[i].units[u] - data[u].own;
					}
				}
			}
		}
	}
	/*
//		if (!units[i].cost || units[i].own >= max || (best && Town.option.units === 'Best Offense' && units[i].att <= best.att) || (best && Town.option.units === 'Best Defense' && units[i].def <= best.def) || (best && Town.option.units === 'Best of Both' && (units[i].att <= best.att || units[i].def <= best.def))) {
	if (max && !best) {
		for (i in data) {
			if (data[i].cost && data[i].own < max) {
				best = Math.max(data[u].need, max - data[u].own);
			}
		}
	}
	*/
	this.runtime.best = best;
	if (best) {
		this.runtime.buy = buy;
		this.runtime.cost = buy * data[best].cost;
		Dashboard.status(this, 'Want to buy ' + buy + ' x ' + best + ' for $' + addCommas(this.runtime.cost));
	} else {
		Dashboard.status(this);
	}
};

Town.work = function(state) {
	if (!this.runtime.best || !this.runtime.buy || !Bank.worth(this.runtime.cost)) {
		return false;
	}
	if (!state || !Bank.retrieve(this.runtime.cost) || (this.data[this.runtime.best].page === 'soldiers' && !Generals.to('cost')) || !Page.to('town_'+this.data[this.runtime.best].page)) {
		return true;
	}
	$('.eq_buy_row,.eq_buy_row2').each(function(i,el){
		if ($('.eq_buy_txt strong:first', el).text().trim() === Town.runtime.best) {
			debug('Town: Buying ' + Town.runtime.buy + ' x ' + Town.runtime.best + ' for $' + addCommas(Town.runtime.cost));
			$('.eq_buy_costs select[name="Amount"]:eq(0)', el).val(Town.runtime.buy > 5 ? 10 : (Town.runtime.buy > 1 ? 5 : 1));
			Page.click($('.eq_buy_costs input[name="Buy"]', el));
		}
	});
	return true;
};

var makeTownDash = function(list, unitfunc, x, type, name, count) { // Find total att(ack) or def(ense) value from a list of objects (with .att and .def)
	var units = [], output = [], x2 = (x==='att'?'def':'att'), i, order = {Weapon:1, Shield:2, Helmet:3, Armor:4, Amulet:5, Gloves:6, Magic:7};
	if (name) {
		output.push('<div class="golem-panel"><h3 class="golem-panel-header">'+name+'</h3><div class="golem-panel-content">');
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
			output.push('<div style="height:25px;margin:1px;"><img src="' + imagepath + list[units[i]].img + '" style="width:25px;height:25px;float:left;margin-right:4px;">' + (list[units[i]].use ? list[units[i]].use[type+'_'+x]+' x ' : '') + units[i] + ' (' + list[units[i]].att + ' / ' + list[units[i]].def + ')' + (list[units[i]].cost?'<br>$'+addCommas(list[units[i]].cost):'') + '</div>');
		}
	}
	if (name) {
		output.push('</div></div>');
	}
	return output.join('');
};

Town.dashboard = function() {
	var left, right, generals = Generals.get(), duel = {}, best;
	best = Generals.best('duel');
	left = '<div style="float:left;width:50%;"><div class="golem-panel"><h3 class="golem-panel-header">Invade - Attack</h3><div class="golem-panel-content" style="padding:8px;">'
			+	makeTownDash(generals, function(list,i){list.push(i);}, 'att', 'invade', 'Heroes')
			+	makeTownDash(this.data, function(list,i,units){if (units[i].page==='soldiers' && units[i].use){list.push(i);}}, 'att', 'invade', 'Soldiers')
			+	makeTownDash(this.data, function(list,i,units){if (units[i].use && units[i].type === 'Weapon'){list.push(i);}}, 'att', 'invade', 'Weapons')
			+	makeTownDash(this.data, function(list,i,units){if (units[i].use && units[i].type !== 'Weapon'){list.push(i);}}, 'att', 'invade', 'Equipment')
			+	makeTownDash(this.data, function(list,i,units){if (units[i].page==='magic' && units[i].use){list.push(i);}}, 'att', 'invade', 'Magic')
			+	'</div></div><div class="golem-panel"><h3 class="golem-panel-header">Duel - Attack</h3><div class="golem-panel-content" style="padding:8px;">'
			+	(best !== 'any' ? '<div style="height:25px;margin:1px;"><img src="' + imagepath + generals[best].img + '" style="width:25px;height:25px;float:left;margin-right:4px;">' + best + ' (' + generals[best].att + ' / ' + generals[best].def + ')</div>' : '')
			+	makeTownDash(this.data, function(list,i,units){if (units[i].page==='blacksmith' && units[i].use){list.push(i);}}, 'att', 'duel')
			+	makeTownDash(this.data, function(list,i,units){if (units[i].page==='magic' && units[i].use){list.push(i);}}, 'att', 'duel')
			+'</div></div></div>';
	best = Generals.best('defend');
	right = '<div style="float:right;width:50%;"><div class="golem-panel"><h3 class="golem-panel-header">Invade - Defend</h3><div class="golem-panel-content" style="padding:8px;">'
			+	makeTownDash(generals, function(list,i){list.push(i);}, 'def', 'invade', 'Heroes')
			+	makeTownDash(this.data, function(list,i,units){if (units[i].page==='soldiers' && units[i].use){list.push(i);}}, 'def', 'invade', 'Soldiers')
			+	makeTownDash(this.data, function(list,i,units){if (units[i].use && units[i].type === 'Weapon'){list.push(i);}}, 'def', 'invade', 'Weapons')
			+	makeTownDash(this.data, function(list,i,units){if (units[i].use && units[i].type !== 'Weapon'){list.push(i);}}, 'def', 'invade', 'Equipment')
			+	makeTownDash(this.data, function(list,i,units){if (units[i].page==='magic' && units[i].use){list.push(i);}}, 'def', 'invade', 'Magic')
			+	'</div></div><div class="golem-panel"><h3 class="golem-panel-header">Duel - Defend</h3><div class="golem-panel-content" style="padding:8px;">'
			+	(best !== 'any' ? '<div style="height:25px;margin:1px;"><img src="' + imagepath + generals[best].img + '" style="width:25px;height:25px;float:left;margin-right:4px;">' + best + ' (' + generals[best].att + ' / ' + generals[best].def + ')</div>' : '')
			+	makeTownDash(this.data, function(list,i,units){if (units[i].page==='blacksmith' && units[i].use){list.push(i);}}, 'def', 'duel')
			+	makeTownDash(this.data, function(list,i,units){if (units[i].page==='magic' && units[i].use){list.push(i);}}, 'def', 'duel')
			+'</div></div></div>';

	$('#golem-dashboard-Town').html(left+right);
};

/********** Worker.Upgrade **********
* Spends upgrade points
*/
var Upgrade = new Worker('Upgrade', 'keep_stats');
Upgrade.data = null;

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
	if (this.option.run) {
		this.runtime.run = this.option.run;
		delete this.option.run;
	}
	if (this.option.working) {
		this.runtime.working = this.option.working;
		delete this.option.working;
	}
};

Upgrade.parse = function(change) {
	var result = $('div.results');
	if (this.runtime.working && result.length && result.text().match(/You just upgraded your/i)) {
		this.runtime.working = false;
		this.runtime.run++;
	}
	return false;
};

Upgrade.work = function(state) {
	var points = Player.get('upgrade'), btn;
	if (this.runtime.run >= this.option.order.length) {
		this.runtime.run = 0;
	}
	if (!this.option.order.length || !points || (this.option.order[this.runtime.run]==='Stamina' && points<2)) {
		return false;
	}
	if (!state || !Page.to('keep_stats')) {
		return true;
	}
	switch (this.option.order[this.runtime.run]) {
		case 'Energy':	btn = 'a[href$="?upgrade=energy_max"]';	break;
		case 'Stamina':	btn = 'a[href$="?upgrade=stamina_max"]';break;
		case 'Attack':	btn = 'a[href$="?upgrade=attack"]';		break;
		case 'Defense':	btn = 'a[href$="?upgrade=defense"]';	break;
		case 'Health':	btn = 'a[href$="?upgrade=health_max"]';	break;
		default: this.runtime.run++; return true; // Should never happen
	}
	if (Page.click(btn)) {
		this.runtime.working = true;
	} else {
		Page.reload(); // Only get here if we can't click!
	}
	return true;
};


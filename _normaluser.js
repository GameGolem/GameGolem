// ==UserScript==
// @name           Rycochet's Castle Age Golem
// @namespace      golem
// @description    Auto player for castle age game
// @version        21
// @include        http*://apps.*facebook.com/castle_age/*
// @require        http://cloutman.com/jquery-latest.min.js
// @require        http://cloutman.com/jquery-ui-latest.min.js
// ==/UserScript==
// -- @include        http://www.facebook.com/common/error.html
// -- @include        http://www.facebook.com/reqs.php#confirm_46755028429_0
// -- @include        http://www.facebook.com/home.php
// -- @include        http://www.facebook.com/home.php*filter=app_46755028429*
/********** CSS code **********
* Gets pushed into the <head> on loading
*/

$('head').append("<style type=\"text/css\">\
.golem-config { float: none; margin-right: 0; }\
.golem-config > div { position: static; width: 196px; margin: 0; padding: 0; overflow: hidden; overflow-y: auto;  }\
.golem-config-fixed { float: right; margin-right: 200px; }\
.golem-config-fixed > div { position: fixed; }\
#golem-dashboard { position: absolute; width: 600px; height: 185px; margin: 0; border-left: 1px solid black; border-right:1px solid black; overflow: hidden; background: white; z-index: 1; }\
#golem-dashboard tbody tr:nth-child(odd) { background: #eeeeee; }\
#golem-dashboard td, #golem-dashboard th { margin: 2px; text-align: center; padding: 0 8px; }\
#golem-dashboard > div { height: 163px; overflow-y: scroll; border-top: 1px solid #d3d3d3; }\
#golem-dashboard > div > div { padding: 2px; }\
table.golem-graph { height: 100px }\
table.golem-graph tbody th { text-align: right; max-width: 75px; }\
table.golem-graph tbody th div { line-height: 60px; height: 60px; }\
table.golem-graph tbody th div:first-child, table.golem-graph tbody th div:last-child { line-height: 20px; height: 20px; }\
table.golem-graph tbody td { margin: 0; padding: 0 !important; vertical-align: bottom; width: 5px; border-right: 1px solid white; }\
table.golem-graph tbody td div { margin: 0; padding: 0; background: #00aa00; width: 5px; border-top: 1px solid blue; }\
table.golem-graph tbody td div:last-child { background: #00ff00; }\
.golem-button, .golem-button-active { border: 1px solid #d3d3d3; background: #e6e6e6 url(http://cloutman.com/css/base/images/ui-bg_glass_75_e6e6e6_1x400.png) 50% 50% repeat-x; display: inline-block; cursor: pointer; margin-left: 1px; margin-right: 1px; font-weight: normal; font-size: 13px; color: #555555; padding: 2px 2px 2px 2px; -moz-border-radius: 3px; -webkit-border-radius: 3px; border-radius: 3px; }\
.golem-button:hover, .golem-button-active { border: 1px solid #aaaaaa; background: #dadada url(http://cloutman.com/css/base/images/ui-bg_glass_75_dadada_1x400.png) 50% 50% repeat-x; }\
img.golem-button, img.golem-button-active { margin-bottom: -2px }\
.golem-tab-header { position: relative; top: 1px; border: 1px solid #d3d3d3; display: inline-block; cursor: pointer; margin-left: 1px; margin-right: 1px; background: #e6e6e6 url(http://cloutman.com/css/base/images/ui-bg_glass_75_e6e6e6_1x400.png) 50% 50% repeat-x; font-weight: normal; color: #555555; padding: 2px 2px 1px 2px; -moz-border-radius-topleft: 3px; -webkit-border-top-left-radius: 3px; border-top-left-radius: 3px; -moz-border-radius-topright: 3px; -webkit-border-top-right-radius: 3px; border-top-right-radius: 3px; }\
.golem-tab-header-active { border: 1px solid #aaaaaa; border-bottom: 0 !important; padding: 2px; background: #dadada url(http://cloutman.com/css/base/images/ui-bg_glass_75_dadada_1x400.png) 50% 50% repeat-x; }\
\
.golem-title { padding: 4px; overflow: hidden; border-bottom: 1px solid #aaaaaa; background: #cccccc url(http://cloutman.com/css/base/images/ui-bg_highlight-soft_75_cccccc_1x100.png) 50% 50% repeat-x; color: #222222; font-weight: bold; }\
\
.golem-panel > .golem-panel-header, .golem-panel > * > .golem-panel-header { border: 1px solid #d3d3d3; cursor: pointer; margin-top: 1px; background: #e6e6e6 url(http://cloutman.com/css/base/images/ui-bg_glass_75_e6e6e6_1x400.png) 50% 50% repeat-x; font-weight: normal; color: #555555; padding: 2px 2px 2px 2px; -moz-border-radius: 3px; -webkit-border-radius: 3px; border-radius: 3px; }\
.golem-panel > .golem-panel-content, .golem-panel > * > .golem-panel-content { border: 1px solid #aaaaaa; border-top: 0 !important; padding: 2px 6px; background: #ffffff url(http://cloutman.com/css/base/images/ui-bg_glass_65_ffffff_1x400.png) 50% 50% repeat-x; font-weight: normal; color: #212121; display: none; -moz-border-radius-bottomleft: 3px; -webkit-border-bottom-left-radius: 3px; border-bottom-left-radius: 3px; -moz-border-radius-bottomright: 3px; -webkit-border-bottom-right-radius: 3px; border-bottom-right-radius: 3px; }\
.golem-panel-show  > .golem-panel-header, .golem-panel-show  > * > .golem-panel-header { border: 1px solid #aaaaaa; border-bottom: 0 !important; background: #dadada url(http://cloutman.com/css/base/images/ui-bg_glass_75_dadada_1x400.png) 50% 50% repeat-x; -moz-border-radius-bottomleft: 0 !important; -webkit-border-bottom-left-radius: 0 !important; border-bottom-left-radius: 0 !important; -moz-border-radius-bottomright: 0 !important; -webkit-border-bottom-right-radius: 0 !important; border-bottom-right-radius: 0 !important; }\
.golem-panel-show > .golem-panel-content, .golem-panel-show > * > .golem-panel-content { display: block; }\
.golem-panel-sortable .golem-lock { display: none; }\
.golem-panel .golem-panel-header .golem-icon { float: left; width: 16px; height: 16px; background: url(data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%10%00%00%00%10%08%03%00%00%00(-%0FS%00%00%00%06PLTEUUU%00%00%00%F5%04%9F%A0%00%00%00%02tRNS%FF%00%E5%B70J%00%00%00%22IDATx%DAb%60D%03%0C%D4%13%60%C0%10%60%C0%10%60%C0%10%60%20%A4%82%90-%149%1D%20%C0%00%81%0E%00%F1%DE%25%95%BE%00%00%00%00IEND%AEB%60%82) no-repeat; }\
.golem-panel .golem-panel-header .golem-lock { float: right; width: 16px; height: 16px; background: url(data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%10%00%00%00%10%08%03%00%00%00(-%0FS%00%00%00%06PLTEUUU%00%00%00%F5%04%9F%A0%00%00%00%02tRNS%FF%00%E5%B70J%00%00%001IDATx%DAb%60D%03%0CD%0B000%A0%0800%C0D%E0%02%8C(%02%0C%0Cp%25%B8%05%18%09%0A%A0j%C1%B4%96%1C%BF%C0%01%40%80%01%00n%11%00%CF%7D%2Bk%9B%00%00%00%00IEND%AEB%60%82) no-repeat;}\
.golem-panel-show .golem-panel-header .golem-icon { float: left; width: 16px; height: 16px; background: url(data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%10%00%00%00%10%08%03%00%00%00(-%0FS%00%00%00%06PLTEUUU%00%00%00%F5%04%9F%A0%00%00%00%02tRNS%FF%00%E5%B70J%00%00%00%22IDATx%DAb%60D%03%0C4%13%60%80%00%24%15%08%3EL%0B%9C%CF%88N%D3%D0a%C8%00%20%C0%00%7F%DE%00%F1%CCc%A6b%00%00%00%00IEND%AEB%60%82) no-repeat; }\
</style>");

// User changeable
var debug = true;

// Shouldn't touch
var VERSION = 21;
var userID = unsafeWindow.Env.user; // Facebook userid
var script_started = Date.now();

// "Fake" constants - more to be added later, just not yet...
var constants = {
	'castle_age':{
		appid:'46755028429',
		appname:'Castle Age'
	}
};
var APP = null;
var APPID = null;
var APPNAME = null;
var PREFIX = null;

/********** main() **********
* Runs every second, only does something when the page changes
*/
function parse_all() {
	// Basic check to reload the page if needed...
	Page.identify();
	if (!Page.page || !$('#app'+APP+'_nvbar_div_end').length) {
		Page.reload();
		return;
	}
	var i;
	for (i in Workers) {
		if (Workers[i].pages && (Workers[i].pages==='*' || (Page.page && Workers[i].pages.indexOf(Page.page)>=0)) && Workers[i].parse) {
//			GM_debug(Workers[i].name + '.parse(false)');
			Workers[i].priv_parse = Workers[i].parse(false);
		} else {
			Workers[i].priv_parse = false;
		}
	}
	Settings.Save('data');
	for (i in Workers) {
		if (Workers[i].priv_parse) {
//			GM_debug(Workers[i].name + '.parse(true)');
			Workers[i].parse(true);
		}
	}
}

/********** $(document).ready() **********
* Runs when the page has finished loading, but the external data might still be coming in
*/
var node_trigger = null;
$(document).ready(function() {
	var i, app = window.location.href.regex(/^https?:\/\/[^\/]+\.facebook\.[^\/]+\/([^\/]+)\//i);
	for (i in constants) {
		if (app === i) {
			APP = constants[i].appid;
			APPID = i;
			APPNAME = constants[i].appname;
			PREFIX = 'golem'+APP+'_';
		}
	}
	if (!APP) {
		// Don't know where we are, but we're not home!!!
		return;
	}
	Page.identify();
	Settings.Load('data');
	Settings.Load('option');
	if (APPID === 'castle_age') {
		for (i in Workers) {
			if (Workers[i].onload) {
				Workers[i].onload();
			}
			if (Workers[i].dashboard) {
				Workers[i].dashboard();
			}
		}
		parse_all(); // Call once to get the ball rolling...
		$('body').bind('DOMNodeInserted', function(event){
			// Only perform the check on the two id's referenced in get_cached_ajax()
			// Give a short delay due to multiple children being added at once, 0.1 sec should be more than enough
			if (!node_trigger && ($(event.target).attr('id') === 'app'+APP+'_app_body_container' || $(event.target).attr('id') === 'app'+APP+'_globalContainer')) {
				node_trigger = window.setTimeout(function(){node_trigger=null;parse_all();},100);
			}
		});
		// Running the queue every second, options within it give more delay
		window.setInterval(function(){Queue.run();},1000);
	}
});

/********** Settings **********
* Used for storing prefs, prefer to use this over GM_set/getValue
* Should never be called by anyone directly - let the main function do it when needed
*/
var Settings = {
	userID: unsafeWindow.Env.user,
	cache: {},
	SetValue:function(n,v) {
		if (typeof v === 'string') {
			v = '"' + v + '"';
		} else if (typeof v === 'array' || typeof v === 'object') {
			v = v.toSource();
		}
		if (typeof Settings.cache[n] !== 'undefined' && Settings.cache[n] !== v) {
			Settings.cache[n] = v;
			GM_setValue(Settings.userID + '.' + n, v);
			return true;
		} else {
			return false;
		}
	},
	GetValue:function(n,d) {
		var v = null;
		Settings.cache[n] = GM_getValue(Settings.userID + '.' + n, d);
		if (typeof Settings.cache[n] === 'string') {
			if (Settings.cache[n].charAt(0) === '"') {
				v = Settings.cache[n].replace(/^"|"$/g,'');
			} else if (Settings.cache[n].charAt(0) === '(' || Settings.cache[n].charAt(0) === '[') {
				if (typeof d === 'array' || typeof d === 'object') {
					v = $.extend(true, {}, d, eval(Settings.cache[n]));
				} else {
					v = eval(Settings.cache[n]);
				}
			}
		}
		if (v === null) {
			v = Settings.cache[n];
		}
		return v;
	},
	Save:function() { // type (string - 'data'|'option'), worker (object)
		var i, type = 'data', worker = null, change = 0;
		for (i=0; i<arguments.length; i++) {
			if (typeof arguments[i] === 'object') {
				worker = arguments[i];
			} else if (arguments[i]==='data' || arguments[i]==='option') {
				type = arguments[i];
			}
		}
		if (worker && worker[type]) {
			return Settings.SetValue(type + '.' + worker.name, worker[type]);
		}
		for (i=0; i<Workers.length; i++) {
			if (Workers[i][type]) {
				change += Settings.SetValue(type + '.' + Workers[i].name, Workers[i][type]);
			}
		}
		return change;
	},
	Load:function() { // type (string - 'data'|'option'), worker (object)
		var i, type = 'data', worker = null;
		for (i=0; i<arguments.length; i++) {
			if (typeof arguments[i] === 'object') {
				worker = arguments[i];
			} else if (arguments[i]==='data' || arguments[i]==='option') {
				type = arguments[i];
			}
		}
		if (worker && worker[type]) {
			worker[type] = Settings.GetValue(type + '.' + worker.name, worker[type]);
		} else {
			for (i=0; i<Workers.length; i++) {
				if (Workers[i][type]) {
					Workers[i][type] = Settings.GetValue(type + '.' + Workers[i].name, Workers[i][type]);
				}
			}
		}
	}
};
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
}

//Array.prototype.unique = function() { var o = {}, i, l = this.length, r = []; for(i=0; i<l;i++) o[this[i]] = this[i]; for(i in o) r.push(o[i]); return r; };
//Array.prototype.inArray = function(value) {for (var i in this) if (this[i] === value) return true;return false;};

if(typeof GM_debug === 'undefined') {
	GM_debug = function(txt) { if(debug) { GM_log(txt); } };
}

var makeTimer = function(sec) {
	var h = Math.floor(sec / 3600), m = Math.floor(sec / 60) % 60, s = Math.floor(sec % 60);
	return (h ? h+':'+(m>9 ? m : '0'+m) : m) + ':' + (s>9 ? s : '0'+s);
};

var WorkerByName = function(name) { // Get worker object by Worker.name
	for (var i in Workers) {
		if (Workers[i].name === name) {
			return Workers[i];
		}
	}
	return null;
};

var WorkerById = function(id) { // Get worker object by panel id
	for (var i in Workers) {
		if (Workers[i].priv_id === id) {
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

var addCommas = function(s) { // Adds commas into a string, ignore any number formatting
	var a=s.toString(), r=new RegExp('(-?[0-9]+)([0-9]{3})');
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

var getAttDef = function(list, unitfunc, x, count, user) { // Find total att(ack) or def(ense) value from a list of objects (with .att and .def)
	var units = [], attack = 0, defend = 0, x2 = (x==='att'?'def':'att'), i, own;
	for (i in list) {
		unitfunc(units, i, list);
	}
	units.sort(function(a,b) {
		return (list[b][x] + (0.7 * list[b][x2])) - (list[a][x] + (0.7 * list[a][x2]));
	});
	for (i=0; i<units.length; i++) {
		own = typeof list[units[i]].own === 'number' ? list[units[i]].own : 1;
		if (user) {
			if (Math.min(count, own) > 0) {
//				GM_debug('Using: '+Math.min(count, own)+' x '+units[i]+' = '+list[units[i]].toSource());
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
	return (x==='att'?attack:(0.7*attack)) + (x==='def'?defend:(0.7*defend));
};

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
	this.priv_parse = false;
	this.priv_since = 0;
	this.priv_id = null;
}
/********** Worker.Config **********
* Has everything to do with the config
* Named with a double dash to ensure it comes early as other workers rely on it's onload() function!
*/
var Config = new Worker('Config');
Config.data = null;
Config.option = {
	display:'block',
	fixed:true
};
Config.panel = null;
Config.onload = function() {
	$('head').append('<link rel="stylesheet" href="http://cloutman.com/css/base/jquery-ui.css" type="text/css" />');
	var $btn, $golem_config, $newPanel, i, pin1 = 'data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%10%00%00%00%10%08%03%00%00%00(-%0FS%00%00%00%0FPLTE%DE%DE%DE%DD%DD%DDcccUUU%00%00%00%23%06%7B1%00%00%00%05tRNS%FF%FF%FF%FF%00%FB%B6%0ES%00%00%00.IDATx%DAb%60A%03%0Cd%0B03%81%18LH%02%10%80%2C%C0%84%24%00%96d%C2%A7%02%AB%19L%8C%A8%B6P%C3%E9%08%00%10%60%00%00z%03%C7%24%170%91%00%00%00%00IEND%AEB%60%82', pin2 = 'data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%10%00%00%00%10%08%03%00%00%00(-%0FS%00%00%00%0FPLTE%DE%DE%DE%DD%DD%DDcccUUU%00%00%00%23%06%7B1%00%00%00%05tRNS%FF%FF%FF%FF%00%FB%B6%0ES%00%00%005IDATx%DAb%60A%03%0C%C4%0901%83%00%13%92%0A%B0%00%0B)%02%8C%CCLLL%CC%0Cx%0CefF%E8%81%B9%83%19%DDa%84%05H%F0%1C%40%80%01%00%FE9%03%C7%D4%8CU%A3%00%00%00%00IEND%AEB%60%82';

	
	//<img id="golem_working" src="http://cloutman.com/css/base/images/ui-anim.basic.16x16.gif" style="border:0;float:right;display:none;" alt="Working...">
	Config.panel = $('<div class="golem-config' + (Config.option.fixed?' golem-config-fixed':'') + '"><div class="ui-widget-content"><div class="golem-title">Castle Age Golem v' + VERSION + '<img id="golem_fixed" style="float:right;margin:-2px;" src="' + (Config.option.fixed?pin2:pin1) + '"></div><div id="golem_buttons" style="margin:4px;"><img class="golem-button' + (Config.option.display==='block'?'-active':'') + '" id="golem_options" src="data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%10%00%00%00%10%08%03%00%00%00(-%0FS%00%00%00%0FPLTE%E2%E2%E2%8A%8A%8A%AC%AC%AC%FF%FF%FFUUU%1C%CB%CE%D3%00%00%00%04tRNS%FF%FF%FF%00%40*%A9%F4%00%00%00%3DIDATx%DA%A4%8FA%0E%00%40%04%03%A9%FE%FF%CDK%D2%B0%BBW%BD%CD%94%08%8B%2F%B6%10N%BE%A2%18%97%00%09pDr%A5%85%B8W%8A%911%09%A8%EC%2B%8CaM%60%F5%CB%11%60%00%9C%F0%03%07%F6%BC%1D%2C%00%00%00%00IEND%AEB%60%82"></div><div id="golem_config" style="display:'+Config.option.display+';margin:0 4px 4px 4px;overflow:hidden;overflow-y:auto;"></div></div></div>');
	$('div.UIStandardFrame_Content').after(Config.panel);
	$('#golem_options').click(function(){
		$(this).toggleClass('golem-button golem-button-active');
		Config.option.display = Config.option.display==='block' ? 'none' : 'block';
		$('#golem_config').toggle('blind'); //Config.option.fixed?null:
		Settings.Save('option', Config);
	});
	$('#golem_fixed').click(function(){
			Config.option.fixed ^= true;
			$(this).attr('src', Config.option.fixed?pin2:pin1);
			$(this).parent().parent().parent().toggleClass('golem-config-fixed');
			Settings.Save('option', Config);
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
				Settings.Save('option', Config);
			});
		} else {
			$(this).parent().toggleClass('golem-panel-show');
			$(this).next().show('blind');
			Config.option.active = [];
			$('.golem-panel-show').each(function(i,el){Config.option.active.push($(this).attr('id'));});
			Settings.Save('option', Config);
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
	$('input.golem_addselect').click(function(){
		$('select.golem_multiple', $(this).parent()).append('<option>'+$('select.golem_select', $(this).parent()).val()+'</option>');
		Config.updateOptions();
	});
	$('input.golem_delselect').click(function(){
		$('select.golem_multiple option[selected=true]', $(this).parent()).each(function(i,el){$(el).remove();})
		Config.updateOptions();
	});
	$('input ,textarea, select', $golem_config).change( function(){Config.updateOptions();} );
	//	$(Config.panel).css({display:'block'});
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
// padlock = data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAAZQTFRFVVVVAAAA9QSfoAAAAAJ0Uk5T%2FwDltzBKAAAAMUlEQVR42mJgRAMMRAswMDCgCDAwwETgAowoAgwMcCW4BRgJCqBqwbSWHL%2FAAUCAAQBuEQDPfStrmwAAAABJRU5ErkJggg%3D%3D
// arrow-right
	worker.priv_id = 'golem_panel_'+worker.name.toLowerCase().replace(/[^0-9a-z]/,'_');
	show = findInArray(Config.option.active, worker.priv_id);
	$head = $('<div id="'+worker.priv_id+'" class="golem-panel'+(worker.unsortable?'':' golem-panel-sortable')+(show?' golem-panel-show':'')+'" name="'+worker.name+'"><h3 class="golem-panel-header "><img class="golem-icon">'+worker.name+'<img class="golem-lock"></h3></div>');
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
				if (o.label) {
					txt.push('<span style="float:left;margin-top:2px;">'+o.label.replace(' ','&nbsp;')+'</span>');
					if (o.text || o.checkbox || o.select || o.multiple) {
						txt.push('<span style="float:right;">');
					}
				}
				if (o.before) {
					txt.push(o.before+' ');
				}
				// our different types of input elements
				if (o.info) { // only useful for externally changed
					if (o.id) {
						txt.push('<span style="float:right" id="' + o.real_id + '">' + o.info + '</span>');
					} else {
						txt.push(o.info);
					}
				} else if (o.text) {
					txt.push('<input type="text" id="' + o.real_id + '" size="' + o.size + '" value="' + (o.value || '') + '">');
				} else if (o.checkbox) {
					txt.push('<input type="checkbox" id="' + o.real_id + '"' + (o.value ? ' checked' : '') + '>');
				} else if (o.select) {
					switch (typeof o.select) {
						case 'string':
							o.className = ' class="golem_'+o.select+'"';
							break;
						case 'number':
							step = Divisor(o.select);
							for (x=0; x<=o.select; x+=step) {
								list.push('<option' + (o.value==x ? ' selected' : '') + '>' + x + '</option>');
							}
							break;
						case 'array':
						case 'object':
							for (x in o.select) {
								list.push('<option value="' + o.select[x] + '"' + (o.value==o.select[x] ? ' selected' : '') + '>' + o.select[x] + (o.suffix ? ' '+o.suffix : '') + '</option>');
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
					txt.push('<select style="width:100%" class="golem_multiple" multiple id="' + o.real_id + '">' + list.join('') + '</select><br>');
					list = [];
					switch (typeof o.multiple) {
						case 'string':
							o.className = ' class="golem_'+o.select+'"';
							break;
						case 'number':
							step = Divisor(o.select);
							for (x=0; x<=o.multiple; x+=step) {
								list.push('<option>' + x + '</option>');
							}
							break;
						case 'array':
							for (x=0; x<o.multiple.length; x++) {
								list.push('<option value="' + o.multiple[x] + '">' + o.multiple[x] + (o.suffix ? ' '+o.suffix : '') + '</option>');
							}
							break;
						case 'object':
							for (x in o.multiple) {
								list.push('<option value="' + x + '">' + o.multiple[x] + (o.suffix ? ' '+o.suffix : '') + '</option>');
							}
							break;
					}
					txt.push('<select class="golem_select">'+list.join('')+'</select><input type="button" class="golem_addselect" value="Add" /><input type="button" class="golem_delselect" value="Del" />');
				}
				if (o.after) {
					txt.push(' '+o.after);
				}
				if (o.label && (o.text || o.checkbox || o.select || o.multiple)) {
					txt.push('</span>');
				}
				panel.push('<div style="clear:both">' + txt.join('') + '</div>');
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
Config.updateOptions = function() {
	GM_debug('Options changed');
	// Get order of panels first
	var found = {};
	Queue.option.queue = [];
	$('#golem_config > div').each(function(i,el){
		var name = WorkerById($(el).attr('id')).name;
		if (!found[name]) {
			Queue.option.queue.push(name);
		}
		found[name] = true;
	});
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
	Settings.Save('option');
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
var Dashboard = new Worker('Dashboard', '*');
Dashboard.data = null;
Dashboard.option = {
	display:'block',
	active:null
};
Dashboard.div = null;
Dashboard.onload = function() {
	var id, $btn, tabs = [], divs = [], active = Dashboard.option.active;
	for (i in Workers) {
		if (Workers[i].dashboard) {
			id = 'golem-dashboard-'+Workers[i].name;
			if (!active) {
				Dashboard.option.active = active = id;
			}
			tabs.push('<h3 name="'+id+'" class="golem-tab-header'+(active===id ? ' golem-tab-header-active' : '')+'">'+Workers[i].name+'</h3>');
			divs.push('<div id="'+id+'"'+(active===id ? '' : ' style="display:none;"')+'></div>');
		}
	}
	Dashboard.div = $('<div id="golem-dashboard" style="top:' + $('#app'+APP+'_main_bn').offset().top+'px;display:' + Dashboard.option.display+';">' + tabs.join('') + '<div>' + divs.join('') + '</div></div>').prependTo('.UIStandardFrame_Content');
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
		$('#'+Dashboard.option.active).show();
		Settings.Save('option', Dashboard);
	});
	$('#golem-dashboard .golem-panel > h3').live('click', function(event){
		if ($(this).parent().hasClass('golem-panel-show')) {
			$(this).next().hide('blind',function(){$(this).parent().toggleClass('golem-panel-show');});
		} else {
			$(this).parent().toggleClass('golem-panel-show');
			$(this).next().show('blind');
		}
	});
	$('#golem_buttons').append('<img class="golem-button' + (Dashboard.option.display==='block'?'-active':'') + '" id="golem_toggle_dash" src="data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%10%00%00%00%10%08%03%00%00%00(-%0FS%00%00%00%1EPLTE%BA%BA%BA%EF%EF%EF%E5%E5%E5%D4%D4%D4%D9%D9%D9%E3%E3%E3%F8%F8%F8%40%40%40%FF%FF%FF%00%00%00%83%AA%DF%CF%00%00%00%0AtRNS%FF%FF%FF%FF%FF%FF%FF%FF%FF%00%B2%CC%2C%CF%00%00%00EIDATx%DA%9C%8FA%0A%00%20%08%04%B5%CC%AD%FF%7F%B8%0D%CC%20%E8%D20%A7AX%94q!%7FA%10H%04%F4%00%19*j%07Np%9E%3B%C9%A0%0C%BA%DC%A1%91B3%98%85%AF%D9%E1%5C%A1%FE%F9%CB%14%60%00D%1D%07%E7%0AN(%89%00%00%00%00IEND%AEB%60%82">');
	$('#golem_toggle_dash').click(function(){
		$(this).toggleClass('golem-button golem-button-active');
		Dashboard.option.display = Dashboard.option.display==='block' ? 'none' : 'block';
		$('#golem-dashboard').toggle('drop');
		Settings.Save('option', Dashboard);
	});
	window.setInterval(function(){
		$('.golem-timer').each(function(i,el){
			$(el).text(makeTimer($(el).text().parseTimer() - 1));
		});
	},1000);
}

/********** Worker.Page() **********
* All navigation including reloading
*/
var Page = new Worker('Page');
Page.unsortable = true;
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
Page.display = [
	{
		id:'timeout',
		label:'Retry after',
		select:[10, 15, 30, 60],
		after:'seconds'
	},{
		id:'retry',
		label:'Reload after',
		select:[2, 3, 5, 10],
		after:'tries'
	}
];
Page.work = function(state) {
	if (!Page.checking) {
		return false;
	}
	var i, l, list, found = null;
	for (i=0; i<Workers.length && !found; i++) {
		if (!Workers[i].pages || Workers[i].pages==='*') {
			continue;
		}
		list = Workers[i].pages.split(' ');
		for (l=0; l<list.length; l++) {
			if (Page.pageNames[list[l]] && !Page.data[list[l]] && list[l].indexOf('_active') === -1) {
				found = list[l];
				break;
			}
		}
	}
	if (!state) {
		if (found) {
			return true;
		}
		Page.checking = false;
		return false;
	}
	if (found && !Page.to(found)) {
		Page.data[found] = Date.now(); // Even if it's broken, we need to think we've been there!
		return true;
	}
	return false;
};
Page.pageNames = {
	index:					{url:'index.php', image:null},
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
	army_gifts:				{url:'gift.php', image:null},
	army_viewarmy:			{url:'army_member.php', image:'view_army_on.gif'},
	army_sentinvites:		{url:'army_reqs.php', image:'sent_invites_on.gif'}
};
Page.identify = function() {
	Page.page = '';
	$('#app'+APP+'_app_body img').each(function(i,el){
		var p, filename = $(el).attr('src').filepart();
		for (p in Page.pageNames) {
			if (filename === Page.pageNames[p].image) {
				Page.page = p; return;
			}
		}
	});
	if ($('#app'+APP+'_indexNewFeaturesBox').length) {
		Page.page = 'index';
	} else if ($('div[style*="giftpage_title.jpg"]').length) {
		Page.page = 'army_gifts';
	}
	if (Page.page !== '') {
		Page.data[Page.page] = Date.now();
	}
//	GM_debug('Page.identify("'+Page.page+'")');
	return Page.page;
};
Page.to = function(page, args) {
	if (page === Page.page && typeof args === 'undefined') {
		return true;
	}
	if (!args) {
		args = '';
	}
	if (page && Page.pageNames[page] && Page.pageNames[page].url) {
		Page.clear();
		Page.last = Page.pageNames[page].url;
		Page.when = Date.now();
		if (args.indexOf('?') === 0 && Page.last.indexOf('?') > 0) {
			Page.last = Page.last.substr(0, Page.last.indexOf('?')) + args;
		} else {
			Page.last = Page.last + args;
		}
		GM_debug('Navigating to '+Page.last+' ('+Page.pageNames[page].url+')');
		if (unsafeWindow['a'+APP+'_get_cached_ajax']) {
			unsafeWindow['a'+APP+'_get_cached_ajax'](Page.last, "get_body");
		} else {
			window.location.href = 'http://apps.facebook.com/castle_age/index.php?bm=1';
		}
	}
	return false;
};
Page.click = function(el) {
	if (!$(el).length) {
		GM_debug('Page.click: Unable to find element - '+el);
		return false;
	}
	var e = document.createEvent("MouseEvents");
	e.initEvent("click", true, true);
	$(el).get(0).wrappedJSObject.dispatchEvent(e);
	Page.clear();
	Page.lastclick = el;
	Page.when = Date.now();
	return true;
};
Page.clear = function() {
	Page.last = Page.lastclick = Page.when = null;
	Page.retry = 0;
};
Page.loading = function() {
	if (!unsafeWindow['a'+APP+'_get_cached_ajax']) {
		if (!Page.when || (Date.now() - Page.when) >= (Page.option.timeout * Page.option.retry * 1000)) { // every xx seconds - we don't get called once it starts loading
			Page.when = Date.now();
			window.location.href = 'http://apps.facebook.com/castle_age/index.php';
		}
		GM_debug('Page not loaded correctly, reloading.');
		return true;
	}
	if ($('#app'+APP+'_AjaxLoadIcon').css('display') === 'none') { // Load icon is shown after 1.5 seconds
		if (Page.when && (Date.now() - Page.when) > (Page.option.timeout * 1000)) {
			Page.clear();
		}
		return false;
	}
	if (Page.when && (Date.now() - Page.when) >= (Page.option.timeout * 1000)) {
		GM_debug('Page.loading for 15+ seconds - retrying...');
		Page.when = Date.now();
		if (Page.retry++ >= Page.option.retry) {
			GM_debug('Page.loading for 1+ minutes - reloading...');
			window.location.href = 'http://apps.facebook.com/castle_age/index.php';
		} else if (Page.last) {
			unsafeWindow['a'+APP+'_get_cached_ajax'](Page.last, "get_body");
		} else if (Page.lastclick) {
			Page.click(Page.lastclick);
		}
	}
	return true;
};
Page.reload = function() {
	if (!Page.when || (Date.now() - Page.when) >= (Page.option.timeout * Page.option.retry * 1000)) {
		Page.to((Page.page || 'index'), '');
	}
};

/********** Worker.Queue() **********
* Keeps track of the worker queue
*/
var Queue = new Worker('Queue', '*');
Queue.data = {
	current: null
};
Queue.option = {
	delay: 5,
	clickdelay: 5,
	queue: ["Page", "Queue", "Income", "Quest", "Monster", "Battle", "Heal", "Land", "Town", "Bank", "Alchemy", "Blessing", "Gift", "Upgrade", "Elite", "Idle", "Raid"],
	start_stamina: 0,
	stamina: 0,
	start_energy: 0,
	energy: 0
};
Queue.display = [
	{
		label:'Drag the other panels into the order you wish them run.'
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
		size:3
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
Queue.unsortable = true;
Queue.lastclick = Date.now();	// Last mouse click - don't interrupt the player
Queue.lastrun = Date.now();		// Last time we ran
Queue.burn = {stamina:false, energy:false};
Queue.onload = function() {
	var i, worker, found = {}, play = 'data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%10%00%00%00%10%08%03%00%00%00(-%0FS%00%00%00%0FPLTE%A7%A7%A7%C8%C8%C8YYY%40%40%40%00%00%00%9F0%E7%C0%00%00%00%05tRNS%FF%FF%FF%FF%00%FB%B6%0ES%00%00%00%2BIDATx%DAb%60A%03%0CT%13%60fbD%13%60%86%0B%C1%05%60BH%02%CC%CC%0CxU%A0%99%81n%0BeN%07%080%00%03%EF%03%C6%E9%D4%E3)%00%00%00%00IEND%AEB%60%82', pause = 'data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%10%00%00%00%10%08%03%00%00%00(-%0FS%00%00%00%06PLTE%40%40%40%00%00%00i%D8%B3%D7%00%00%00%02tRNS%FF%00%E5%B70J%00%00%00%1AIDATx%DAb%60D%03%0CT%13%60%60%80%60%3A%0BP%E6t%80%00%03%00%7B%1E%00%E5E%89X%9D%00%00%00%00IEND%AEB%60%82';
	for (i=0; i<Queue.option.queue.length; i++) { // First find what we've already got
		worker = WorkerByName(Queue.option.queue[i]);
		if (worker) {
			found[worker.name] = true;
		}
	}
	for (i in Workers) { // Second add any new workers that have a display (ie, sortable)
		if (found[Workers[i].name] || !Workers[i].work || !Workers[i].display) {
			continue;
		}
		GM_log('Adding '+Workers[i].name+' to Queue');
		if (Workers[i].unsortable) {
			Queue.option.queue.unshift(Workers[i].name);
		} else {
			Queue.option.queue.push(Workers[i].name);
		}
	}
	for (i=0; i<Queue.option.queue.length; i++) {	// Third put them in saved order
		worker = WorkerByName(Queue.option.queue[i]);
		if (worker && worker.priv_id) {
			if (Queue.data.current && worker.name === Queue.data.current) {
				GM_debug('Queue: Trigger '+worker.name+' (continue after load)');
				$('#'+worker.priv_id+' > h3').css('font-weight', 'bold');
			}
			$('#golem_config').append($('#'+worker.priv_id));
		}
	}
	$(document).click(function(){Queue.lastclick=Date.now();});

	$btn = $('<img class="golem-button" id="golem_pause" src="' + (Queue.option.pause?play:pause) + '">').click(function() {
		Queue.option.pause ^= true;
		GM_debug('State: '+((Queue.option.pause)?"paused":"running"));
		$(this).attr('src', (Queue.option.pause?play:pause));
		Page.clear();
		Config.updateOptions();
	});
	$('#golem_buttons').prepend($btn); // Make sure it comes first
};
Queue.run = function() {
	var i, worker, found = false, now = Date.now();
	if (Queue.option.pause || now - Queue.lastclick < Queue.option.clickdelay * 1000 || now - Queue.lastrun < Queue.option.delay * 1000) {
		return;
	}
	Queue.lastrun = now;
	if (Page.loading()) {
		return; // We want to wait xx seconds after the page has loaded
	}
	Queue.burn.stamina = Queue.burn.energy = 0;
	if (Queue.option.burn_stamina || Player.data.stamina >= Queue.option.start_stamina) {
		Queue.burn.stamina = Math.max(0, Player.data.stamina - Queue.option.stamina);
		Queue.option.burn_stamina = Queue.burn.stamina > 0;
	}
	if (Queue.option.burn_energy || Player.data.energy >= Queue.option.start_energy) {
		Queue.burn.energy = Math.max(0, Player.data.energy - Queue.option.energy);
		Queue.option.burn_energy = Queue.burn.energy > 0;
	}
	for (i in Workers) { // Run any workers that don't have a display, can never get focus!!
		if (Workers[i].work && !Workers[i].display) {
			Workers[i].work(false);
		}
	}
	for (i=0; i<Queue.option.queue.length; i++) {
		worker = WorkerByName(Queue.option.queue[i]);
		if (!worker || !worker.work || !worker.display) {
			continue;
		}
		if (!worker.work(Queue.data.current === worker.name)) {
			if (Queue.data.current === worker.name) {
				Queue.data.current = null;
				if (worker.priv_id) {
					$('#'+worker.priv_id+' > h3').css('font-weight', 'normal');
				}
				GM_debug('Queue: End '+worker.name);
			}
			continue;
		}
		if (!found) { // We will work(false) everything, but only one gets work(true) at a time
			found = true;
			if (Queue.data.current === worker.name) {
				continue;
			}
			worker.priv_since = now;
			if (Queue.data.current) {
				GM_debug('Queue: Interrupt '+Queue.data.current);
				if (WorkerByName(Queue.data.current).priv_id) {
					$('#'+WorkerByName(Queue.data.current).priv_id+' > h3').css('font-weight', 'normal');
				}
			}
			Queue.data.current = worker.name;
			if (worker.priv_id) {
				$('#'+worker.priv_id+' > h3').css('font-weight', 'bold');
			}
			GM_debug('Queue: Trigger '+worker.name);
		}
	}
	Settings.Save('option');
	Settings.Save('data');
};
/********** Worker.Alchemy **********
* Get all ingredients and recipes
*/
var Alchemy = new Worker('Alchemy', 'keep_alchemy');
Alchemy.data = {
	ingredients:{},
	recipe:{}
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
Alchemy.work = function(state) {
	if (!Alchemy.option.perform) {
		return false;
	}
	var found = null, recipe = Alchemy.data.recipe, r, i;
	for (r in recipe) {
		if (recipe[r].type === 'Recipe') {
			found = r;
			for (i in recipe[r].ingredients) {
				if ((!Alchemy.option.hearts && i === 'raid_hearts.gif') || recipe[r].ingredients[i] > (Alchemy.data.ingredients[i] || 0)) {
					found = null;
					break;
				}
			}
			if (found) {break;}
		}
	}
	if (!found) {return false;}
	if (!state) {return true;}
	if (!Page.to('keep_alchemy')) {return true;}
	GM_debug('Alchemy: Perform - '+found);
	$('div.alchemyRecipeBack').each(function(i,el){
		if($('div.recipeTitle', el).text().indexOf(found) >=0) {
			Page.click($('input[type="image"]', el));
			return true;
		}
	});
	return true;
};
/********** Worker.Bank **********
* Auto-banking
*/
var Bank = new Worker('Bank');
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
	if (Player.data.cash < Bank.option.above) {
		return false;
	}
	if (!state) {
		return true;
	}
	if (!Bank.stash(Player.data.cash - Math.min(Bank.option.above, Bank.option.hand))) {
		return true;
	}
	return false;
};
Bank.stash = function(amount) {
	if (!amount || !Player.data.cash || Math.min(Player.data.cash,amount) <= 10) {
		return true;
	}
	if (Bank.option.general && !Generals.to('Aeris')) {
		return false;
	}
	if (!Page.to('keep_stats')) {
		return false;
	}
	$('input[name="stash_gold"]').val(Math.min(Player.data.cash, amount));
	Page.click('input[value="Stash"]');
	return true;
};
Bank.retrieve = function(amount) {
	amount -= Player.data.cash;
	if (amount <= 0) {
		return true;
	}
	if ((Player.data.bank - Bank.option.keep) < amount) {
		return true; // Got to deal with being poor...
	}
	if (!Page.to('keep_stats')) {
		return false;
	}
	$('input[name="get_gold"]').val(amount.toString());
	Page.click('input[value="Retrieve"]');
	return true;
};
Bank.worth = function(amount) { // Anything withdrawing should check this first!
	var worth = Player.data.cash + Math.max(0,Player.data.bank - Bank.option.keep);
	if (typeof amount === 'number') {
		return (amount <= worth);
	}
	return worth;
};

/********** Worker.Battle **********
* Battling other players (NOT raid)
*/
var Battle = new Worker('Battle', 'battle_rank battle_battle');
Battle.data = {
	user: {},
	rank: {},
	points: {}
};
Battle.option = {
	general: true,
	points: true,
	monster: true,
	losses: 5,
	type: 'Invade',
	bp: 'Always'
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
		select:[1,2,3,4,5,6,7,8,9,10],
		after:'Losses'
	},{
		id:'points',
		label:'Always Get Demi-Points',
		checkbox:true
	},{
		id:'monster',
		label:'Fight Monsters First',
		checkbox:true
	},{
		id:'bp',
		label:'Get Battle Points<br>(Clears Cache)',
		select:['Always', 'Never', 'Don\'t Care']
	},{
		id:'cache',
		label:'Limit Cache Length',
		select:[100,200,300,400,500]
	}
];
Battle.parse = function(change) {
	var i, data, uid, info, list = [];
	if (Page.page === 'battle_rank') {
		data = Battle.data.rank = {0:{name:'Squire',points:0}};
		$('tr[height="23"]').each(function(i,el){
			info = $(el).text().regex(/Rank ([0-9]+) - (.*)\s*([0-9]+)/i);
			data[info[0]] = {name:info[1], points:info[2]};
		});
	} else if (Page.page === 'battle_battle') {
		data = Battle.data.user;
		if (Battle.data.attacking) {
			uid = Battle.data.attacking;
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
				// Some other message - probably be a good idea to remove the target or something
				// delete data[uid];
			}
			Battle.data.attacking = null;
		}
		Battle.data.points = $('#app'+APP+'_app_body table.layout table table').prev().text().replace(/[^0-9\/]/g ,'').regex(/([0-9]+)\/10([0-9]+)\/10([0-9]+)\/10([0-9]+)\/10([0-9]+)\/10/);
		$('#app'+APP+'_app_body table.layout table table tr:even').each(function(i,el){
			var uid = $('img[uid!==""]', el).attr('uid'), info = $('td.bluelink', el).text().trim().regex(/Level ([0-9]+) (.*)/i), rank;
			if (!uid || !info) {
				return;
			}
			rank = Battle.rank(info[1]);
			if ((Battle.option.bp === 'Always' && Player.data.rank - rank > 5) || (!Battle.option.bp === 'Never' && Player.data.rank - rank <= 5)) {
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
		for (i in data) { // Forget low or high rank - no points or too many points
			if ((Battle.option.bp === 'Always' && Player.data.rank - data[i].rank > 5) || (!Battle.option.bp === 'Never' && Player.data.rank - data[i].rank <= 5)) {
				delete data[i];
			}
		}
		if (length(Battle.data.user) > Battle.option.cache) { // Need to prune our attack cache
			GM_debug('Battle: Pruning target cache');
			for (i in data) {
				list.push(i);
			}
			list.sort(function(a,b) {
				var weight = 0;
					 if (((data[a].win || 0) - (data[a].loss || 0)) < ((data[b].win || 0) - (data[b].loss || 0))) { weight += 10; }
				else if (((data[a].win || 0) - (data[a].loss || 0)) > ((data[b].win || 0) - (data[b].loss || 0))) { weight -= 10; }
					 if ((data[a].hide || 0) > (data[b].hide || 0)) { weight += 1; }
				else if ((data[a].hide || 0) < (data[b].hide || 0)) { weight -= 1; }
					 if (data[a].army > data[b].army) { weight += 1; }
				else if (data[a].army < data[b].army) { weight -= 1; }
				if (Battle.option.bp === 'Always') { weight += (data[b].rank - data[a].rank) / 2; }
				if (Battle.option.bp === 'Never') { weight += (data[a].rank - data[b].rank) / 2; }
				weight += (data[a].level - data[b].level) / 10;
				return weight;
			});
			while (list.length > Battle.option.cache) {
				delete data[list.pop()];
			}
		}
	}
	if (Settings.Save(Battle)) {
		Battle.dashboard();
	}
	return false;
};
Battle.work = function(state) {
	if (Player.data.health <= 10 || Queue.burn.stamina < 1) {
		return false;
	}
	var i, points = [], list = [], user = Battle.data.user, uid, $form;
	if (Battle.option.points) {
		for (i=0; i<Battle.data.points.length; i++) {
			if (Battle.data.points[i] < 10) {
				points[i+1] = true;
			}
		}
	}
	if ((!Battle.option.points || !points.length) && Battle.option.monster && Monster.count) {
		return false;
	}
	for (i in user) {
		if (user[i].dead && user[i].dead + 1800000 < Date.now()) {
			continue; // If they're dead ignore them for 3m * 10hp = 30 mins
		}
		if ((user[i].loss || 0) - (user[i].win || 0) >= Battle.option.losses) {
			continue; // Don't attack someone who wins more often
		}
		if (!Battle.option.points || !points.length || typeof points[user[i].align] !== 'undefined') {
			list.push(i);
		}
	}
	if (!list.length) {
		return false;
	}
	if (!state) {
		return true;
	}
	if (Battle.option.general && !Generals.to(Generals.best(Battle.option.type)) || !Page.to('battle_battle')) {
		return true;
	}
	uid = list[Math.floor(Math.random() * list.length)];
	GM_debug('Battle: Wanting to attack '+user[uid].name+' ('+uid+')');
	$form = $('form input[alt="'+Battle.option.type+'"]').first().parents('form');
	if (!$form.length) {
		GM_log('Battle: Unable to find attack buttons, forcing reload');
		Page.to('index');
		return false;
	}
	Battle.data.attacking = uid;
	$('input[name="target_id"]', $form).attr('value', uid);
	Page.click($('input[type="image"]', $form));
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
	var i, o, points = [0, 0, 0, 0, 0, 0], demi = ['Ambrosia', 'Malekus', 'Corvintheus', 'Aurora', 'Azeron'], list = [], output, sorttype = ['align', 'name', 'level', 'rank', 'army', 'win', 'loss', 'hide'];
	for (i in Battle.data.user) {
		points[Battle.data.user[i].align]++;
	}
	if (typeof sort === 'undefined') {
		Battle.order = [];
		for (i in Battle.data.user) {
			Battle.order.push(i);
		}
		sort = 1; // Default = sort by name
	}
	if (typeof sorttype[sort] === 'string') {
		Battle.order.sort(function(a,b) {
			var aa = (Battle.data.user[a][sorttype[sort]] || 0), bb = (Battle.data.user[b][sorttype[sort]] || 0);
			if (typeof aa === 'string' || typeof bb === 'string') {
				return (rev ? bb > aa : bb < aa);
			}
			return (rev ? aa - bb : bb - aa);
		});
	}
	list.push('<div style="text-align:center;"><strong>Targets:</strong> '+length(Battle.data.user)+', <strong>By Alignment:</strong>');
	for (i=1; i<6; i++ ) {
		list.push(' <img src="' + Player.data.imagepath + 'symbol_tiny_' + i +'.jpg" alt="'+demi[i-1]+'" title="'+demi[i-1]+'"> '+points[i]);
	}
	list.push('</div><hr>');
	list.push('<table cellspacing="0" style="width:100%"><thead><th>Align</th><th>Name</th><th>Level</th><th>Rank</th><th>Army</th><th>Wins</th><th>Losses</th><th>Hides</th></tr></thead><tbody>');
	for (o=0; o<Battle.order.length; o++) {
		i = Battle.order[o];
		output = [];
		output.push('<img src="' + Player.data.imagepath + 'symbol_tiny_' + Battle.data.user[i].align+'.jpg" alt="'+Battle.data.user[i]+'">');
		output.push('<span title="'+i+'">' + Battle.data.user[i].name + '</span>');
		output.push(Battle.data.user[i].level);
		output.push(Battle.data.rank[Battle.data.user[i].rank].name);
		output.push(Battle.data.user[i].army);
		output.push(Battle.data.user[i].win);
		output.push(Battle.data.user[i].loss);
		output.push(Battle.data.user[i].hide);
		list.push('<tr><td>' + output.join('</td><td>') + '</td></tr>');
	}
	list.push('</tbody></table>');
	$('#golem-dashboard-Battle').html(list.join(''));
	$('#golem-dashboard-Battle thead th').css('cursor', 'pointer').click(function(event){
		Battle.dashboard($(this).prevAll().length, $(this).attr('name')==='sort');
	});
	$('#golem-dashboard-Battle tbody tr td:nth-child(2)').css('text-align', 'left');
	if (typeof sort !== 'undefined') {
		$('#golem-dashboard-Battle thead th:eq('+sort+')').attr('name',(rev ? 'reverse' : 'sort')).append('&nbsp;' + (rev ? '&uarr;' : '&darr;'));
	}
};

/********** Worker.Blessing **********
* Automatically receive blessings
*/
var Blessing = new Worker('Blessing', 'oracle_demipower');
Blessing.option = {
	which: 'Stamina'
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
			Blessing.data.when = Date.now() + (((time[0] * 60) + time[1] + 1) * 60000);
		} else if (result.text().match(/You have paid tribute to/i)) {
			Blessing.data.when = Date.now() + 86460000; // 24 hours and 1 minute
		}
	}
	return false;
};
Blessing.work = function(state) {
	if (!Blessing.option.which || Blessing.option.which === 'None' || Date.now() <= Blessing.data.when) {
		return false;
	}
	if (!state) {
		return true;
	}
	if (!Page.to('oracle_demipower')) {
		return true;
	}
	Page.click('#app'+APP+'_symbols_form_'+Blessing.which.indexOf(Blessing.option.which)+' input.imgButton');
	return false;
};

/********** Worker.Elite() **********
* Build your elite army
*/
var Elite = new Worker('Elite', 'keep_eliteguard army_viewarmy');
Elite.data = {};
Elite.option = {
	fill:true,
	every:24
};
Elite.display = [
	{
		id:'fill',
		label:'Fill Elite Guard',
		checkbox:true
	},{
		id:'every',
		label:'Every',
		select:[1, 2, 3, 6, 12, 24],
		after:'hours'
	}
];
Elite.parse = function(change) {
	var i;
	$('span.result_body').each(function(i,el){
		if ($(el).text().match(/Elite Guard, and they have joined/i)) {
			Elite.data[$('img', el).attr('uid')] = Date.now() + 86400000; // 24 hours
		} else if ($(el).text().match(/'s Elite Guard is FULL!/i)) {
			Elite.data[$('img', el).attr('uid')] = Date.now() + 3600000; // 1 hour
		} else if ($(el).text().match(/YOUR Elite Guard is FULL!/i)) {
			Elite.option.wait = Date.now();
			GM_debug('Elite guard full, wait 24 hours');
		}
	});
	if (Page.page === 'army_viewarmy') {
		$('img[linked="true"][size="square"]').each(function(i,el){
			Elite.data[$(el).attr('uid')] = Elite.data[$(el).attr('uid')] || 0;
		});
	}
	return false;
};
Elite.work = function(state) {
	var i, found = null;
	if (!Elite.option.fill || (Elite.option.wait && (Elite.option.wait + (Elite.option.every * 3600000)) > Date.now())) {
		return false;
	}
	for(i in Elite.data) {
		if (typeof Elite.data[i] !== 'number' || Elite.data[i] < Date.now()) {
			if (!found) {
				found = i;
			}
		}
	}
	if ((!found && length(Elite.data))) {
		return false;
	}
	if (!state) {
		return true;
	}
	if (!found && !length(Elite.data) && !Page.to('army_viewarmy')) {
		return true;
	}
	GM_debug('Elite: Add member '+found);
	if (!Page.to('keep_eliteguard', '?twt=jneg&jneg=true&user=' + found)) {
		return true;
	}
	return false;
};

/********** Worker.Generals **********
* Updates the list of Generals
* Finds best General for other classes
* *** Need to take into account army size and real stats for attack and defense
*/
var Generals = new Worker('Generals', 'heroes_generals');
Generals.data = {};
Generals.best_id = null;
Generals.sort = null;
Generals.parse = function(change) {
	var data, $elements, i, attack, defend, army, gen_att, gen_def, iatt = 0, idef = 0, datt = 0, ddef = 0, listpush = function(list,i){list.push(i);};
	$elements = $('#app'+APP+'_generalContainerBox2 > div > div.generalSmallContainer2')
	if ($elements.length < length(Generals.data)) {
		Page.to('heroes_generals', ''); // Force reload
		return false;
	}
	$elements.each(function(i,el){
		var $child = $(el).children(), name = $child.eq(0).text().trim(), level	= $child.eq(3).text().regex(/Level ([0-9]+)/i);
		if (name) {
			if (!Generals.data[name] || Generals.data[name].level !== level) {
				Generals.data[name] = Generals.data[name] || {};
				Generals.data[name].img		= $child.eq(1).find('input.imgButton').attr('src').filepart();
				Generals.data[name].att		= $child.eq(2).children().eq(0).text().regex(/([0-9]+)/);
				Generals.data[name].def		= $child.eq(2).children().eq(1).text().regex(/([0-9]+)/);
				Generals.data[name].level	= level; // Might only be 4 so far, however...
				Generals.data[name].skills	= $($child.eq(4).html().replace(/\<br\>|\s+|\n/g,' ')).text().trim();
			}
		}
	});
	if (length(Town.data.invade)) {
		for (i in Generals.data) {
			attack = Player.data.attack + (Generals.data[i].skills.regex(/([-+]?[0-9]+) Player Attack/i) || 0) + (Generals.data[i].skills.regex(/Increase Player Attack by ([0-9]+)/i) || 0);
			defend = Player.data.defense + (Generals.data[i].skills.regex(/([-+]?[0-9]+) Player Defense/i) || 0) + (Generals.data[i].skills.regex(/Increase Player Defense by ([0-9]+)/i) || 0);
			army = (Generals.data[i].skills.regex(/Increases? Army Limit to ([0-9]+)/i) || 501);
			gen_att = getAttDef(Generals.data, listpush, 'att', Math.floor(army / 5));
			gen_def = getAttDef(Generals.data, listpush, 'def', Math.floor(army / 5));
			Generals.data[i].invade = {
				att: Math.floor(Town.data.invade.attack + Generals.data[i].att + (Generals.data[i].def * 0.7) + ((attack + (defend * 0.7)) * army) + gen_att),
				def: Math.floor(Town.data.invade.defend + Generals.data[i].def + (Generals.data[i].att * 0.7) + ((defend + (Generals.data[i].skills.regex(/([-+]?[0-9]+) Defense when attacked/i) || 0) + (attack * 0.7)) * army) + gen_def)
			};
			Generals.data[i].duel = {
				att: Math.floor(Town.data.duel.attack + Generals.data[i].att + (Generals.data[i].def * 0.7) + attack + (defend * 0.7)),
				def: Math.floor(Town.data.duel.defend + Generals.data[i].def + (Generals.data[i].att * 0.7) + defend + (attack * 0.7))
			};
		}
	}
	if (Settings.Save(Generals)) {
		GM_debug('Updating Generals Dashboard');
		Generals.select();
		Generals.dashboard();
	}
	return false;
};
Generals.to = function(name) {
	if (!name || Player.data.general === name || name === 'any') {
		return true;
	}
	if (!Generals.data[name]) {
		GM_log('General "'+name+'" requested but not found!');
		return true; // Not found, so fake it
	}
	if (!Page.to('heroes_generals')) {
		return false;
	}
	GM_debug('Changing to General '+name);
	Page.click('input[src$="'+Generals.data[name].img+'"]');
	return false;
};
Generals.best = function(type) {
	if (!Generals.data) {
		return 'any';
	}
	var rx = '', best = null, bestval = 0, i, value;
	switch(type.toLowerCase()) {
		case 'cost':		rx = /Decrease Soldier Cost by ([0-9]+)/i; break;
		case 'stamina':		rx = /Increase Max Stamina by ([0-9]+)|\+([0-9]+) Max Stamina/i; break;
		case 'energy':		rx = /Increase Max Energy by ([0-9]+)|\+([0-9]+) Max Energy/i; break;
		case 'income':		rx = /Increase Income by ([0-9]+)/i; break;
		case 'influence':	rx = /Bonus Influence ([0-9]+)/i; break;
		case 'attack':		rx = /([-+]?[0-9]+) Player Attack/i; break;
		case 'defense':		rx = /([-+]?[0-9]+) Player Defense/i; break;
		case 'invade':
			for (i in Generals.data) {
				if (!best || (Generals.data[i].invade && Generals.data[i].invade.att > Generals.data[best].invade.att) || (Generals.data[i].invade && Generals.data[i].invade.att === Generals.data[best].invade.att && best !== Player.data.general)) {
					best = i;
				}
			}
			return (best || 'any');
		case 'duel':
			for (i in Generals.data) {
				if (!best || (Generals.data[i].duel && Generals.data[i].duel.att > Generals.data[best].duel.att) || (Generals.data[i].duel && Generals.data[i].duel.att === Generals.data[best].duel.att && best !== Player.data.general)) {
					best = i;
				}
			}
			return (best || 'any');
		case 'defend':
			for (i in Generals.data) {
				if (!best || (Generals.data[i].duel && Generals.data[i].duel.def > Generals.data[best].duel.def) || (Generals.data[i].duel && Generals.data[i].duel.def === Generals.data[best].duel.def && best !== Player.data.general)) {
					best = i;
				}
			}
			return (best || 'any');
		case 'under level 4':
			if (Generals.data[Player.data.general] && Generals.data[Player.data.general].level < 4) {
				return Player.data.general;
			}
			return Generals.random(false);
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
	if (best) {
		GM_debug('Best general found: '+best);
	}
	return best;
};
Generals.random = function(level4) { // Note - true means *include* level 4
	var i, list = [];
	for (i in Generals.data) {
		if (level4) {
			list.push(i);
		} else if (Generals.data[i].level < 4) {
			list.push(i);
		}
	}
	if (list.length) {
		return list[Math.floor(Math.random()*list.length)];
	} else {
		return 'any';
	}
};
Generals.list = function(opts) {
	var i, value, list = [];
	if (!opts) {
		for (i in Generals.data) {
			list.push(i);
		}
		list.sort();
	} else if (opts.find) {
		for (i in Generals.data) {
			if (Generals.data[i].skills.indexOf(opts.find) >= 0) {
				list.push(i);
			}
		}
	} else if (opts.regex) {
		for (i in Generals.data) {
			value = Generals.data[i].skills.regex(opts.regex);
			if (value) {
				list.push([i, value]);
			}
		}
		list.sort(function(a,b) {
			return b[1] - a[1];
		});
//		for (var i in list) list[i] - list[i][0];
	}
	list.unshift('any');
	return list;
};
Generals.select = function() {
	$('select.golem_generals').each(function(a,el){
		$(el).empty();
		var i, tmp = $(el).attr('id').slice(PREFIX.length).regex(/([^_]*)_(.*)/i), value = tmp ? WorkerByName(tmp[0]).option[tmp[1]] : null, list = Generals.list();
		for (i in list) {
			$(el).append('<option value="'+list[i]+'"'+(list[i]===value ? ' selected' : '')+'>'+list[i]+'</value>');
		}
	});
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
		output.push('<img src="'+Player.data.imagepath+Generals.data[i].img+'" style="width:25px;height:25px;" title="' + Generals.data[i].skills + '">');
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
	$('#golem-dashboard-Generals thead th').css('cursor', 'pointer').click(function(event){
		Generals.dashboard($(this).prevAll().length, $(this).attr('name')==='sort');
	});
	$('#golem-dashboard-Generals tbody tr td:nth-child(2)').css('text-align', 'left');
	if (typeof sort !== 'undefined') {
		$('#golem-dashboard-Generals thead th:eq('+sort+')').attr('name',(rev ? 'reverse' : 'sort')).append('&nbsp;' + (rev ? '&uarr;' : '&darr;'));
	}
}

/********** Worker.Gift() **********
* Auto accept gifts and return if needed
* *** Needs to talk to Alchemy to work out what's being made
*/
var Gift = new Worker('Gift', 'index army_invite army_gifts');
Gift.data = {
	uid: [],
	todo: {},
	gifts: {}
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
	if (Page.page === 'index') {
		// If we have a gift waiting it doesn't matter from whom as it gets parsed on the right page...
		if (!Gift.data.uid.length && $('div.result').text().indexOf('has sent you a gift') >= 0) {
			Gift.data.uid.push(1);
		}
	} else if (Page.page === 'army_invite') {
		// Accepted gift first
		GM_debug('Gift: Checking for accepted');
		if (Gift.data.lastgift) {
			if ($('div.result').text().indexOf('accepted the gift') >= 0) {
				uid = Gift.data.lastgift;
				if (!Gift.data.todo[uid].gifts) {
					Gift.data.todo[uid].gifts = [];
				}
				Gift.data.todo[uid].gifts.push($('div.result img').attr('src').filepart());
				Gift.data.lastgift = null;
			}
		}
		// Check for gifts
		GM_debug('Gift: Checking for new gift to accept');
		uid = Gift.data.uid = [];
		if ($('div.messages').text().indexOf('gift') >= 0) {
			GM_debug('Gift: Found gift div');
			$('div.messages img').each(function(i,el) {
				uid.push($(el).attr('uid'));
				GM_debug('Gift: Adding gift from '+$(el).attr('uid'));
			});
		}
	} else if (Page.page === 'army_gifts') {
		gifts = Gift.data.gifts = {};
//		GM_debug('Gifts found: '+$('#app'+APP+'_giftContainer div[id^="app'+APP+'_gift"]').length);
		$('#app'+APP+'_giftContainer div[id^="app'+APP+'_gift"]').each(function(i,el){
//			GM_debug('Gift adding: '+$(el).text()+' = '+$('img', el).attr('src'));
			var id = $('img', el).attr('src').filepart(), name = $(el).text().trim().replace('!','');
			if (!gifts[id]) {
				gifts[id] = {};
			}
			gifts[id].name = name;
			if (Gift.lookup[name]) {
				gifts[id].create = Gift.lookup[name];
			}
		});
	}
	return false;
};
Gift.work = function(state) {
	if (!state) {
		if (!Gift.data.uid.length) {
			return false;
		}
		return true;
	}
	if (Gift.data.uid.length) { // Receive before giving
		if (!Page.to('army_invite')) {
			return true;
		}
		var uid = Gift.data.uid.shift();
		if (!Gift.data.todo[uid]) {
			Gift.data.todo[uid] = {};
		}
		Gift.data.todo[uid].time = Date.now();
		Gift.data.lastgift = uid;
		GM_debug('Gift: Accepting gift from '+uid);
		if (!Page.to('army_invite', '?act=acpt&rqtp=gift&uid=' + uid) || Gift.data.uid.length > 0) {
			return true;
		}
	}
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
	if (Player.data.health >= Player.data.maxhealth || Player.data.stamina < Heal.option.stamina || Player.data.health >= Heal.option.health) {
		return false;
	}
	if (!state) {
		return true;
	}
	if (!Page.to('keep_stats')) {
		return true;
	}
	GM_debug('Heal: Healing...');
	if ($('input[value="Heal Wounds"]').length) {
		Page.click('input[value="Heal Wounds"]');
	} else {
		GM_log('Danger Danger Will Robinson... Unable to heal!');
	}
	return false;
};

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
	battle: 'Daily'
};
Idle.when = ['Never', 'Hourly', '2 Hours', '6 Hours', '12 Hours', 'Daily', 'Weekly'];
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
	}
];

Idle.work = function(state) {
	var i, p, time, pages = {
		index:['index'],
		alchemy:['keep_alchemy'],
		quests:['quests_quest1', 'quests_quest2', 'quests_quest3', 'quests_quest4', 'quests_quest5', 'quests_quest6', 'quests_demiquests', 'quests_atlantis'],
		town:['town_soldiers', 'town_blacksmith', 'town_magic', 'town_land'],
		battle:['battle_battle']
	}, when = { 'Never':0, 'Hourly':3600000, '2 Hours':7200000, '6 Hours':21600000, '12 Hours':43200000, 'Daily':86400000, 'Weekly':604800000 };
	if (!state) {
		return true;
	}
	if (!Generals.to(Idle.option.general)) {
		return true;
	}
	for (i in pages) {
		if (!when[Idle.option[i]]) {
			continue;
		}
		time = Date.now() - when[Idle.option[i]];
		for (p=0; p<pages[i].length; p++) {
			if (!Page.data[pages[i][p]] || Page.data[pages[i][p]] < time) {
				if (!Page.to(pages[i][p])) {
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
	general: true,
	bank: true,
	margin: 30
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
	var when = new Date();
	when = Player.data.cash_time - (when.getSeconds() + (when.getMinutes() * 60));
	if (when < 0) {
		when += 3600;
	}
//	GM_debug('Income: '+when+', Margin: '+Income.option.margin);
	if (when > Income.option.margin) {
		if (state && Income.option.bank) {
			return Bank.work(true);
		}
		return false;
	}
	if (!state) {
		return true;
	}
	if (Income.option.general && !Generals.to(Generals.best('income'))) {
		return true;
	}
	GM_debug('Income: Waiting for Income... ('+when+' seconds)');
	return true;
};

/********** Worker.Land **********
* Auto-buys property
*/
var Land = new Worker('Land', 'town_land');
Land.option = {
	buy:true,
	wait:48
};
Land.display = [
	{
		id:'buy',
		label:'Auto-Buy Land',
		checkbox:true
	},{
		id:'wait',
		label:'Maximum Wait Time',
		select:[0, 24, 36, 48],
		suffix:'hours'
	},{
		id:'current',
		label:'Want to buy',
		info:'None'
	}
];
Land.parse = function(change) {
	if (!change) {
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
	}
	return false;
};
Land.work = function(state) {
	if (!Land.option.buy) {
		return false;
	}
	var i, best = null, worth = Bank.worth(), buy = 0;
	for (var i in Land.data) {
		if (Land.data[i].buy) {
			if (!best || ((Land.data[best].cost / Player.data.income) + (Land.data[i].cost / Player.data.income + Land.data[best].income)) > ((Land.data[i].cost / Player.data.income) + (Land.data[best].cost / (Player.data.income + Land[i].income)))) {
				best = i;
			}
		}
	}
	if (!best) {
		return false;
	}
	if ((Land.data[best].cost * 10) >= worth || (Land.data[best].own >= 10 && Land.data[best].cost * 10 / Player.data.income < Land.option.wait && Land.data[best].max - Land.data[best].own >= 10)) {
		buy = 10;
	} else if ((Land.data[best].cost * 5) >= worth || (Land.data[best].own >= 10 && Land.data[best].cost * 5 / Player.data.income < Land.option.wait && Land.data[best].max - Land.data[best].own >= 5)) {
		buy = 5;
	} else if (Land.data[best].cost >= worth){
		buy = 1;
	}
	$('#'+PREFIX+'Land_current').text(buy + 'x ' + best + ' for $' + addCommas(buy * Land.data[best].cost));
	if (!buy || (buy * Land.data[best].cost) > worth) {
		return false;
	}
	if (!state) {
		return true;
	}
	if (!Bank.retrieve(buy * Land.data[best].cost)) {
		return true;
	}
	if (!Page.to('town_land')) return true;
	$('tr.land_buy_row,tr.land_buy_row_unique').each(function(i,el){
		var name = $('img', el).attr('alt'), tmp;
		if (name === best) {
			GM_debug('Land: Buying '+Land.data[best].buy+' x '+best+' for $'+(Land.data[best].buy * Land.data[best].cost));
			$('select', $('.land_buy_costs .gold', el).parent().next()).val(buy);
			Page.click($('.land_buy_costs input[name="Buy"]', el));
		}
	});
	return true;
};

/********** Worker.Monster **********
* Automates Monster
*/
var Monster = new Worker('Monster', 'keep_monster keep_monster_active battle_raid');
Monster.option = {
	fortify: 50,
	dispel: 50,
	choice: 'All',
	raid: 'Invade x5'
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
		label:'"All" is currently Random...'
	},{
		id:'choice',
		label:'Attack',
		select:['All', 'Strongest', 'Weakest', 'Shortest']
	},{
		id:'raid',
		label:'Raid',
		select:['Invade', 'Invade x5', 'Duel', 'Duel x5']
	},{
		id:'assist',
		label:'Auto-Assist',
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
	raid: {
		name:'The Deathrune Siege',
		list:'deathrune_list2.jpg',
		list2:'deathrune_list1.jpg',
		image:'raid_1_large.jpg',
		image2:'raid_b1_large.jpg',
		dead:'raid_1_large_victory.jpg',
		raid:true
	},
	// Epic Boss
	colossus: {
		name:'Colossus of Terra',
		list:'stone_giant_list.jpg',
		image:'stone_giant.jpg',
		dead:'stone_giant_dead.jpg',
		timer:259200, // 72 hours
		mpool:1
	},
	gildamesh: {
		name:'Gildamesh, the Orc King',
		list:'orc_boss_list.jpg',
		image:'orc_boss.jpg',
		dead:'orc_boss_dead.jpg',
		timer:259200, // 72 hours
		mpool:1
	},
	keira: {
		name:'Keira, the Dread Knight',
		list:'boss_keira_list.jpg',
		image:'boss_keira.jpg',
		dead:'boss_keira_dead.jpg',
		timer:172800, // 48 hours
		mpool:1
	},
	lotus: { // DEAD image ???
		name:'Lotus Ravenmoore',
		list:'boss_lotus_list.jpg',
		image:'boss_lotus.jpg',
		timer:172800, // 48 hours
		mpool:1
	},
	mephistopheles: {
		name:'Mephistopheles',
		list:'boss_mephistopheles_list.jpg',
		image:'boss_mephistopheles_large.jpg',
		dead:'boss_mephistopheles_dead.jpg',
		timer:172800, // 48 hours
		mpool:1
	},
	skaar: {
		name:'Skaar Deathrune',
		list:'death_list.jpg',
		image:'death_large.jpg',
		dead:'death_dead.jpg',
		timer:345000, // 95 hours, 50 minutes
		mpool:1
	},
	sylvanus: {
		name:'Sylvanas the Sorceress Queen',
		list:'boss_sylvanus_list.jpg',
		image:'boss_sylvanus_large.jpg',
		dead:'boss_sylvanus_dead.jpg',
		timer:172800, // 48 hours
		mpool:1
	},
	// Epic Team
	dragon_emerald: { // DEAD image ???
		name:'Emerald Dragon',
		list:'dragon_list_green.jpg',
		image:'dragon_monster_green.jpg',
		timer:259200, // 72 hours
		mpool:2
	},
	dragon_frost: { // DEAD image ???
		name:'Frost Dragon',
		list:'dragon_list_blue.jpg',
		image:'dragon_monster_blue.jpg',
		timer:259200, // 72 hours
		mpool:2
	},
	dragon_gold: { // DEAD image ???
		name:'Gold Dragon',
		list:'dragon_list_gold.jpg',
		image:'dragon_monster_gold.jpg',
		timer:259200, // 72 hours
		mpool:2
	},
	dragon_red: { // DEAD image ???
		name:'Ancient Red Dragon',
		list:'dragon_list_red.jpg',
		image:'dragon_monster_red.jpg',
		timer:259200, // 72 hours
		mpool:2
	},
	serpent_amethyst: { // DEAD image ???
		name:'Amethyst Sea Serpent',
		list:'seamonster_list_purple.jpg',
		image:'seamonster_purple.jpg',
		timer:259200, // 72 hours
		mpool:2
	},
	serpent_ancient: { // DEAD image ???
		name:'Ancient Sea Serpent',
		list:'seamonster_list_red.jpg',
		image:'seamonster_red.jpg',
		timer:259200, // 72 hours
		mpool:2
	},
	serpent_emerald: { // DEAD image ???
		name:'Emerald Sea Serpent',
		list:'seamonster_list_green.jpg',
		image:'seamonster_green.jpg',
		timer:259200, // 72 hours
		mpool:2
	},
	serpent_sapphire: { // DEAD image ???
		name:'Sapphire Sea Serpent',
		list:'seamonster_list_blue.jpg',
		image:'seamonster_blue.jpg',
		timer:259200, // 72 hours
		mpool:2
	},
	// Epic World
	cronus: {
		name:'Cronus, The World Hydra',
		list:'hydra_head.jpg',
		image:'hydra_large.jpg',
		dead:'hydra_dead.jpg',
		timer:604800, // 168 hours
		mpool:3
	},
	legion: {
		name:'Battle of the Dark Legion',
		list:'castle_siege_list.jpg',
		image:'castle_siege_large.jpg',
		dead:'castle_siege_dead.jpg',
		timer:604800, // 168 hours
		mpool:3
	},
	genesis: {
		name:'Genesis, The Earth Elemental',
		list:'earth_element_list.jpg',
		image:'earth_element_large.jpg',
		dead:'earth_element_dead.jpg',
		timer:604800, // 168 hours
		mpool:3
	}
};
Monster.dispel = ['input[src=$"button_dispel.gif"]'];
Monster.fortify = ['input[src$="attack_monster_button3.jpg"]', 'input[src$="seamonster_fortify.gif"]'];
Monster.attack = ['input[src$="attack_monster_button2.jpg"]', 'input[src$="seamonster_power.gif"]', 'input[src$="attack_monster_button.jpg"]'];
Monster.count = 0;
Monster.uid = null;
Monster.onload = function() {
	var i, j;
	for (i in Monster.data) {
		for (j in Monster.data[i]) {
			if (Monster.data[i][j].state === 'engage') {
				Monster.count++;
			}
		}
	}
}
Monster.parse = function(change) {
	var i, j, uid, type, tmp, $health, $defense, $dispel, dead = false;
	if (Page.page === 'keep_monster_active') { // In a monster
		Monster.uid = uid = $('img[linked="true"][size="square"]').attr('uid');
		for (i in Monster.types) {
			if (Monster.types[i].image && $('img[src*="'+Monster.types[i].image+'"]').length) {
				type = i;
			} else if (Monster.types[i].image2 && $('img[src*="'+Monster.types[i].image2+'"]').length) {
				type = i;
			} else if (Monster.types[i].dead && $('img[src*="'+Monster.types[i].dead+'"]').length) {
				type = i;
				dead = true;
			}
		}
		if (!uid || !type) {
			GM_debug('Monster: Unknown monster (probably dead)');
			return false;
		}
		Monster.data[uid] = Monster.data[uid] || {};
		Monster.data[uid][type] = Monster.data[uid][type] || {};
		if ($('input[src*="collect_reward_button.jpg"]').length) {
			Monster.data[uid][type].state = 'reward';
			return false;
		}
		if (dead && Monster.data[uid][type].state === 'assist') {
			Monster.data[uid][type].state = null;
		} else if (dead && Monster.data[uid][type].state === 'engage') {
			Monster.data[uid][type].state = 'reward';
		} else {
			if (!Monster.data[uid][type].state && $('span.result_body').text().match(/for your help in summoning|You have already assisted on this objective|You don't have enough stamina assist in summoning/i)) {
				if ($('span.result_body').text().match(/for your help in summoning/i)) {
					Monster.data[uid][type].assist = Date.now();
				}
				Monster.data[uid][type].state = 'assist';
			}
			if (!Monster.data[uid][type].name) {
				tmp = $('img[linked="true"][size="square"]').parent().parent().next().text().trim().replace(/[\s\n\r]{2,}/g, ' ');
				Monster.data[uid][type].name = tmp.substr(0, tmp.length - Monster.types[type].name.length - 3);
			}
			$health = $('img[src$="monster_health_background.jpg"]').parent();
			Monster.data[uid][type].health = $health.length ? ($health.width() / $health.parent().width() * 100) : 0;
			$defense = $('img[src$="seamonster_ship_health.jpg"]').parent();
			if ($defense.length) {
				Monster.data[uid][type].defense = ($defense.width() / ($defense.next().length ? $defense.width() + $defense.next().width() : $defense.parent().width()) * 100);
			}
			$dispel = $('img[src$="bar_dispel.gif"]').parent();
			if ($dispel.length) {
				Monster.data[uid][type].dispel = ($dispel.width() / ($dispel.next().length ? $dispel.width() + $dispel.next().width() : $dispel.parent().width()) * 100);
			}
			Monster.data[uid][type].timer = $('#app'+APP+'_monsterTicker').text().parseTimer();
			Monster.data[uid][type].finish = Date.now() + (Monster.data[uid][type].timer * 1000);
			Monster.data[uid][type].damage_total = 0;
			Monster.data[uid][type].damage = {};
			$('td.dragonContainer table table a[href^="http://apps.facebook.com/castle_age/keep.php?user="]').each(function(i,el){
				var user = $(el).attr('href').regex(/user=([0-9]+)/i), tmp = $(el).parent().next().text().replace(/[^0-9\/]/g,''), dmg = tmp.regex(/([0-9]+)/), fort = tmp.regex(/\/([0-9]+)/);
				Monster.data[uid][type].damage[user]  = (fort ? [dmg, fort] : [dmg]);
				Monster.data[uid][type].damage_total += dmg;
			});
			Monster.data[uid][type].dps = Monster.data[uid][type].damage_total / (Monster.types[type].timer - Monster.data[uid][type].timer);
			if (Monster.types[type].raid) {
				Monster.data[uid][type].total = Monster.data[uid][type].damage_total + $('img[src$="monster_health_background.jpg"]').parent().parent().next().text().regex(/([0-9]+)/);
			} else {
				Monster.data[uid][type].total = Math.floor(Monster.data[uid][type].damage_total / (100 - Monster.data[uid][type].health) * 100);
			}
			Monster.data[uid][type].eta = Date.now() + (Math.floor((Monster.data[uid][type].total - Monster.data[uid][type].damage_total) / Monster.data[uid][type].dps) * 1000);
		}
	} else if (Page.page === 'keep_monster' || Page.page === 'battle_raid') { // Check monster / raid list
		if (!$('#app'+APP+'_app_body div.imgButton').length) {
			return false;
		}
		if (Page.page === 'battle_raid') {
			raid = true;
		}
		for (uid in Monster.data) {
			for (type in Monster.data[uid]) {
				if (((Page.page === 'battle_raid' && Monster.types[type].raid) || (Page.page === 'keep_monster' && !Monster.types[type].raid)) && (Monster.data[uid][type].state !== 'assist' || (Monster.data[uid][type].state === 'assist' && Monster.data[uid][type].finish < Date.now()))) {
					Monster.data[uid][type].state = null;
				}
			}
		}
		$('#app'+APP+'_app_body div.imgButton').each(function(i,el){
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
			if (uid === Player.data.FBID) {
				Monster.data[uid][type].name = 'You';
			} else {
				tmp = $(el).parent().parent().children().eq(2).text().trim();
				Monster.data[uid][type].name = tmp.substr(0, tmp.length - Monster.types[type].name.length - 3);
			}
			switch($('img', el).attr('src').regex(/dragon_list_btn_([0-9])/)) {
				case 2: Monster.data[uid][type].state = 'reward'; break;
				case 3: Monster.data[uid][type].state = 'engage'; break;
				case 4:
					if (Monster.types[type].raid && Monster.data[uid][type].health) {
						Monster.data[uid][type].state = 'engage'; // Fix for page cache issues in 2-part raids
					} else {
						Monster.data[uid][type].state = 'complete';
					}
					break;
				default: Monster.data[uid][type].state = 'unknown'; break; // Should probably delete, but keep it on the list...
			}
		});
	}
	Monster.count = 0;
	for (i in Monster.data) {
		for (j in Monster.data[i]) {
			if (!Monster.data[i][j].state) {
				delete Monster.data[i][j];
			} else if (Monster.data[i][j].state === 'engage') {
				Monster.count++;
			}
		}
		if (!length(Monster.data[i])) {
			delete Monster.data[i];
		}
	}
	if (Settings.Save(Monster)) {
		Monster.dashboard();
	}
	return false;
};
Monster.work = function(state) {
	var i, list = [], uid = Monster.option.uid, type = Monster.option.type, btn = null, best = null
	if (!state || (uid && type && Monster.data[uid][type].state !== 'engage' && Monster.data[uid][type].state !== 'assist')) {
		Monster.option.uid = null;
		Monster.option.type = null;
	}
	if (!length(Monster.data) || Player.data.health <= 10) {
		return false;
	}
	for (uid in Monster.data) {
		for (type in Monster.data[uid]) {
			if (!Monster.data[uid][type].health && Monster.data[uid][type].state === 'engage') {
				if (state) {
					Page.to(Monster.types[type].raid ? 'battle_raid' : 'keep_monster', '?user=' + uid + (Monster.types[type].mpool ? '&mpool='+Monster.types[type].mpool : ''));
				}
				return true;
			}
		}
	}
	if (!uid || !type || !Monster.data[uid] || !Monster.data[uid][type]) {
		for (uid in Monster.data) {
			for (type in Monster.data[uid]) {
				if (Monster.data[uid][type].state === 'engage' && Monster.data[uid][type].finish > Date.now()) {
					if (Monster.option.choice === 'All') {
						list.push([uid, type]);
					} else if (!best
					|| (Monster.option.choice === 'Strongest' && Monster.data[uid][type].health > Monster.data[best[0]][best[1]].health)
					|| (Monster.option.choice === 'Weakest' && Monster.data[uid][type].health < Monster.data[best[0]][best[1]].health)
					|| (Monster.option.choice === 'Shortest' &&  Monster.data[uid][type].timer < Monster.data[best[0]][best[1]].timer)) {
						best = [uid, type];
					}
				}
			}
		}
		if (Monster.option.choice === 'All' && list.length) {
			best = list[Math.floor(Math.random()*list.length)];
		}
		if (!best) {
			return false;
		}
		uid  = Monster.option.uid  = best[0];
		type = Monster.option.type = best[1];
	}
	if (Queue.burn.stamina < 5 && (Queue.burn.energy < 10 || ((typeof Monster.data[uid][type].defense === 'undefined' || Monster.data[uid][type].defense > Monster.option.fortify) && (typeof Monster.data[uid][type].dispel === 'undefined' || Monster.data[uid][type].dispel < Monster.option.dispel)))) {
		return false;
	}
	if (!state) {
		return true;
	}
	if (Monster.types[type].raid) {
		if (!Generals.to(Generals.best(Monster.option.raid.indexOf('Invade') ? 'invade' : 'duel'))) {
			return true;
		}
		GM_debug('Raid: '+Monster.option.raid+' '+uid);
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
		GM_debug('Monster: Fortify '+uid);
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
		GM_debug('Monster: Dispel '+uid);
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
		GM_debug('Monster: Attack '+uid);
		for (i=0; i<Monster.attack.length; i++) {
			if ($(Monster.attack[i]).length) {
				btn = $(Monster.attack[i]);
				break;
			}
		}
	}
	if ((!btn || !btn.length || uid !== Monster.uid) && !Page.to(Monster.types[type].raid ? 'battle_raid' : 'keep_monster', '?user=' + uid + (Monster.types[type].mpool ? '&mpool='+Monster.types[type].mpool : ''))) {
		return true; // Reload if we can't find the button or we're on the wrong page
	}
	Page.click(btn);
	return true;
};
Monster.order = null;
Monster.dashboard = function(sort, rev) {
	var i, j, o, url, list = [], output, sorttype = [null, 'name', 'health', 'defense', 'dispel', null, 'timer', 'eta'], state = {engage:0, assist:1, reward:2, complete:3};
	list.push('<table cellspacing="0" style="width:100%"><thead><tr><th></th><th>User</th><th title="(estimated)">Health</th><th>Fortify</th><th>Shield</th><th>Damage</th><th>Time Left</th><th title="(estimated)">Kill In</th></tr></thead><tbody>');
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
			aa = Monster.data[a[0]][a[1]].damage ? Monster.data[a[0]][a[1]].damage[Player.data.FBID] : 0;
			bb = Monster.data[b[0]][b[1]].damage ? Monster.data[b[0]][b[1]].damage[Player.data.FBID] : 0;
		}
		if (typeof aa === 'string' || typeof bb === 'string') {
			return (rev ? (bb || '') > (aa || '') : (bb || '') < (aa || ''));
		}
		return (rev ? (aa || 0) - (bb || 0) : (bb || 0) - (aa || 0));
	});
	for (o=0; o<Monster.order.length; o++) {
		i = Monster.order[o][0];
		j = Monster.order[o][1];
		if (!Monster.types[j]) {
			continue;
		}
		output = [];
		// http://apps.facebook.com/castle_age/battle_monster.php?user=00000&mpool=3
		// http://apps.facebook.com/castle_age/battle_monster.php?twt2=earth_1&user=00000&action=doObjective&mpool=3&lka=00000&ref=nf
		// http://apps.facebook.com/castle_age/raid.php?user=00000
		// http://apps.facebook.com/castle_age/raid.php?twt2=deathrune_adv&user=00000&action=doObjective&lka=00000&ref=nf
		if (Monster.data[i][j].state === 'engage' || Monster.data[i][j].state === 'assist') {
			url = '?user=' + i + '&action=doObjective' + (Monster.types[j].mpool ? '&mpool=' + Monster.types[j].mpool : '') + '&lka=' + i + '&ref=nf';
		} else {
			url = '?user=' + i + (Monster.types[j].mpool ? '&mpool=' + Monster.types[j].mpool : '');
		}
		output.push('<a href="http://apps.facebook.com/castle_age/' + (Monster.types[j].raid ? 'raid.php' : 'battle_monster.php') + url + '"><strong  style="position:absolute;margin:6px;color:#1fc23a;text-shadow:black 1px 1px 2px;">' + Monster.data[i][j].state + '</strong><img src="' + Player.data.imagepath + Monster.types[j].list + '" style="width:90px;height:25px" alt="' + j + '" title="' + (Monster.types[j].name ? Monster.types[j].name : j) + '"></a>');
		output.push(Monster.data[i][j].name);
		if ((Monster.data[i][j].state === 'engage' || Monster.data[i][j].state === 'assist') && Monster.data[i][j].total) {
			output.push(Monster.data[i][j].health===100 ? '?' : addCommas(Monster.data[i][j].total - Monster.data[i][j].damage_total) + ' (' + Math.floor(Monster.data[i][j].health) + '%)');
			output.push(typeof Monster.data[i][j].defense === 'number' ? Math.floor(Monster.data[i][j].defense)+'%' : '');
			output.push(typeof Monster.data[i][j].dispel === 'number' ? Math.floor(Monster.data[i][j].dispel)+'%' : '');
			output.push(Monster.data[i][j].state === 'engage' ? addCommas(Monster.data[i][j].damage[Player.data.FBID][0]) + ' (' + (Monster.data[i][j].damage[Player.data.FBID][0] / Monster.data[i][j].total * 100).round(1) + '%)' : '');
			output.push(Monster.data[i][j].timer ? '<span class="golem-timer">' + makeTimer((Monster.data[i][j].finish - Date.now()) / 1000) + '</span>' : '?');
			output.push(Monster.data[i][j].health===100 ? '?' : '<span class="golem-timer">'+makeTimer((Monster.data[i][j].eta - Date.now()) / 1000)+'</span>');
		} else {
			output.push('', '', '', '', '');
		}
		list.push('<tr><td>' + output.join('</td><td>') + '</td></tr>');
	}
	list.push('</tbody></table>');
	$('#golem-dashboard-Monster').html(list.join(''));
	$('#golem-dashboard-Monster thead th').css('cursor', 'pointer').click(function(event){
		Monster.dashboard($(this).prevAll().length, $(this).attr('name')==='sort');
	});
	$('#golem-dashboard-Monster tbody td a').click(function(event){
		var url = $(this).attr('href');
		Page.to((url.indexOf('raid') > 0 ? 'battle_raid' : 'keep_monster'), url.substr(url.indexOf('?')));
		return false;
	});
	$('#golem-dashboard-Monster tbody tr td:nth-child(2)').css('text-align', 'left');
	if (typeof sort !== 'undefined') {
		$('#golem-dashboard-Monster thead th:eq('+sort+')').attr('name',(rev ? 'reverse' : 'sort')).append('&nbsp;' + (rev ? '&uarr;' : '&darr;'));
	}
};

/********** Worker.Player **********
* Gets all current stats we can see
*/
var Player = new Worker('Player', '*');
Player.data = {
	history:{},
	average:0
};
Player.option = null;
Player.panel = null;
Player.onload = function() {
	// Get the gold timer from within the page - should really remove the "official" one, and write a decent one, but we're about playing and not fixing...
	// gold_increase_ticker(1418, 6317, 3600, 174738470, 'gold', true);
	// function gold_increase_ticker(ticks_left, stat_current, tick_time, increase_value, first_call)
	var when = new Date(script_started + ($('*').html().regex(/gold_increase_ticker\(([0-9]+),/) * 1000));
	Player.data.cash_time = when.getSeconds() + (when.getMinutes() * 60);
};
Player.parse = function(change) {
	if (!$('#app'+APP+'_app_body_container').length) {
		Page.reload();
		return false;
	}
	var data = Player.data, keep, stats, hour = Math.floor(Date.now() / 3600000);
	data.FBID		= unsafeWindow.Env.user;
	data.cash		= parseInt($('strong#app'+APP+'_gold_current_value').text().replace(/[^0-9]/g, ''), 10);
	data.energy		= $('#app'+APP+'_energy_current_value').parent().text().regex(/([0-9]+)\s*\/\s*[0-9]+/);
	data.maxenergy	= $('#app'+APP+'_energy_current_value').parent().text().regex(/[0-9]+\s*\/\s*([0-9]+)/);
	data.health		= $('#app'+APP+'_health_current_value').parent().text().regex(/([0-9]+)\s*\/\s*[0-9]+/);
	data.maxhealth	= $('#app'+APP+'_health_current_value').parent().text().regex(/[0-9]+\s*\/\s*([0-9]+)/);
	data.stamina	= $('#app'+APP+'_stamina_current_value').parent().text().regex(/([0-9]+)\s*\/\s*[0-9]+/);
	data.maxstamina	= $('#app'+APP+'_stamina_current_value').parent().text().regex(/[0-9]+\s*\/\s*([0-9]+)/);
	data.exp		= $('#app'+APP+'_st_2_5').text().regex(/([0-9]+)\s*\/\s*[0-9]+/);
	data.maxexp		= $('#app'+APP+'_st_2_5').text().regex(/[0-9]+\s*\/\s*([0-9]+)/);
	data.level		= $('#app'+APP+'_st_5').text().regex(/Level: ([0-9]+)!/i);
	data.armymax	= $('a[href*=army.php]', '#app'+APP+'_main_bntp').text().regex(/([0-9]+)/);
	data.army		= Math.min(data.armymax, 501); // XXX Need to check what max army is!
	data.upgrade	= ($('a[href*=keep.php]', '#app'+APP+'_main_bntp').text().regex(/([0-9]+)/) || 0);
	data.general	= $('div.general_name_div3').first().text().trim();
	data.imagepath	= $('div.general_pic_div3 img').attr('src').pathpart();
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
		Player.data.income = stats.eq(stats.length - 4).text().replace(/[^0-9]/g,'').regex(/([0-9]+)/);
	}
	if (typeof data.history[hour] === 'number') {
		data.history[hour] = {income:data.history[hour]};
	} else {
		data.history[hour] = data.history[hour] || {};
	}
	data.history[hour].bank = Player.data.bank;
	data.history[hour].exp = Player.data.exp;
	$('span.result_body').each(function(i,el){
		var txt = $(el).text().replace(/,|\s+|\n/g, '');
		data.history[hour].income = (data.history[hour].income || 0)
			+ (txt.regex(/Gain.*\$([0-9]+).*Cost/i) || 0)
			+ (txt.regex(/stealsGold:\+\$([0-9]+)/i) || 0)
			+ (txt.regex(/Youreceived\$([0-9]+)/i) || 0)
			+ (txt.regex(/Yougained\$([0-9]+)/i) || 0);
		if (txt.regex(/incomepaymentof\$([0-9]+)gold/i)) {
			data.history[hour].land = (txt.regex(/incomepaymentof\$([0-9]+)gold/i) || 0) + (txt.regex(/backinthemine:Extra([0-9]+)Gold/i) || 0);
		}
	});
	hour -= 168; // 24x7
	data.average = 0;
	for (var i in data.history) {
		if (i < hour) {
			delete data.history[i];
		} else {
			data.average += (data.history[i].income || 0);
		}
	}
	data.average = Math.floor(data.average / length(data.average));
	if (Settings.Save(Player)) {
		Player.select();
		Player.dashboard();
	}
	return false;
};
Player.work = function(state) {
	// These can change every second - so keep them in mind
	Player.data.cash = parseInt($('strong#app'+APP+'_gold_current_value').text().replace(/[^0-9]/g, ''), 10);
// Very innacurate!!!
//	Player.data.cash_timer		= $('#app'+APP+'_gold_time_value').text().parseTimer();
	var when = new Date();
	when = Player.data.cash_time - (when.getSeconds() + (when.getMinutes() * 60));
	if (when < 0) {
		when += 3600;
	}
	Player.data.cash_timer		= when;
	Player.data.energy			= $('#app'+APP+'_energy_current_value').parent().text().regex(/([0-9]+)\s*\/\s*[0-9]+/);
	Player.data.energy_timer	= $('#app'+APP+'_energy_time_value').text().parseTimer();
	Player.data.health			= $('#app'+APP+'_health_current_value').parent().text().regex(/([0-9]+)\s*\/\s*[0-9]+/);
	Player.data.health_timer	= $('#app'+APP+'_health_time_value').text().parseTimer();
	Player.data.stamina			= $('#app'+APP+'_stamina_current_value').parent().text().regex(/([0-9]+)\s*\/\s*[0-9]+/);
	Player.data.stamina_timer	= $('#app'+APP+'_stamina_time_value').text().parseTimer();
};
Player.select = function() {
	var step = Divisor(Player.data.maxstamina)
	$('select.golem_stamina').each(function(a,el){
		$(el).empty();
		var i, tmp = $(el).attr('id').slice(PREFIX.length).regex(/([^_]*)_(.*)/i), value = tmp ? WorkerByName(tmp[0]).option[tmp[1]] : null;
		for (i=0; i<=Player.data.maxstamina; i+=step) {
			$(el).append('<option value="' + i + '"' + (value==i ? ' selected' : '') + '>' + i + '</option>');
		}
	});
	step = Divisor(Player.data.maxenergy)
	$('select.golem_energy').each(function(a,el){
		$(el).empty();
		var i, tmp = $(el).attr('id').slice(PREFIX.length).regex(/([^_]*)_(.*)/i), value = tmp ? WorkerByName(tmp[0]).option[tmp[1]] : null;
		for (i=0; i<=Player.data.maxenergy; i+=step) {
			$(el).append('<option value="' + i + '"' + (value==i ? ' selected' : '') + '>' + i + '</option>');
		}
	});
	step = Divisor(Player.data.maxhealth)
	$('select.golem_health').each(function(a,el){
		$(el).empty();
		var i, tmp = $(el).attr('id').slice(PREFIX.length).regex(/([^_]*)_(.*)/i), value = tmp ? WorkerByName(tmp[0]).option[tmp[1]] : null;
		for (i=0; i<=Player.data.maxhealth; i+=step) {
			$(el).append('<option value="' + i + '"' + (value==i ? ' selected' : '') + '>' + i + '</option>');
		}
	});
};
Player.dashboard = function() {
	var i, max = 0, list = [], output = [];
	list.push('<table cellspacing="0" cellpadding="0" class="golem-graph"><thead><tr><th></th><th colspan="73"><span style="float:left;">&lArr; Older</span>72 Hour History<span style="float:right;">Newer &rArr;</span></th></tr></thead><tbody>');
	list.push(Player.makeGraph(['income', 'land'], 'Income', true));
	list.push(Player.makeGraph('bank', 'Bank', true));
	list.push(Player.makeGraph('exp', 'Experience', false));
	list.push('</tbody></table>');
	$('#golem-dashboard-Player').html(list.join(''));
}
Player.makeGraph = function(type, title, iscash, min) {
	var i, j, max = 0, max_s, min_s, list = [], output = [], value = {}, hour = Math.floor(Date.now() / 3600000);
	list.push('<tr>');
	for (i=hour-72; i<=hour; i++) {
		if (typeof type === 'string') {
			value[i] = 0;
			if (typeof Player.data.history[i] !== 'undefined' && typeof Player.data.history[i][type] !== 'undefined') {
				min = Math.min((typeof min === 'number' ? min : Number.POSITIVE_INFINITY), Player.data.history[i][type]);
				max = Math.max(max, Player.data.history[i][type]);
				value[i] = Player.data.history[i][type];
			}
		} else if (typeof type === 'object') {
			value[i] = [0, 0];
			if (typeof Player.data.history[i] !== 'undefined') {
				if (typeof Player.data.history[i][type[0]] !== 'undefined') {
					min = Math.min((typeof min === 'number' ? min : Number.POSITIVE_INFINITY), Player.data.history[i][type[0]]);
					max = Math.max(max, Player.data.history[i][type[0]]);
					value[i][0] = Player.data.history[i][type[0]];
				}
				if (typeof Player.data.history[i][type[1]] !== 'undefined') {
					min = Math.min((typeof min === 'number' ? min : Number.POSITIVE_INFINITY), Player.data.history[i][type[1]]);
					max = Math.max(max, Player.data.history[i][type[1]]);
					value[i][1] = Player.data.history[i][type[1]];
				}
			}
		}
	}
	if (max >= 1000000000) {max = Math.ceil(max / 1000000000) * 1000000000;max_s = addCommas(max / 1000000000)+'b';}
	else if (max >= 1000000) {max = Math.ceil(max / 1000000) * 1000000;max_s = (max / 1000000)+'m';}
	else if (max >= 1000) {max = Math.ceil(max / 1000) * 1000;max_s = (max / 1000)+'k';}
	else {max_s = max || 0;}
	if (min >= 1000000000) {min = min.round(-9);min_s = addCommas(min / 1000000000)+'b';}
	else if (min >= 1000000) {min = min.round(-6);min_s = (min / 1000000)+'m';}
	else if (min >= 1000) {min = min.round(-3);min_s = (min / 1000)+'k';}
	else {min_s = min || 0;}
	list.push('<th><div>' + (iscash ? '$' : '') + max_s + '</div><div>' + title + '</div><div>' + (iscash ? '$' : '') + min_s + '</div></th>')
	for (i=hour-72; i<=hour; i++) {
		if (typeof type === 'string' && value[i]) {
			list.push('<td title="' + (hour - i) + ' hour' + ((hour - i)==1 ? '' : 's') +' ago, ' + (iscash ? '$' : '') + addCommas(value[i]) + '"><div style="height:'+Math.ceil((value[i] - min) / (max - min) * 100)+'px;"></div></td>');
		} else if (typeof type === 'object' && (value[i][0] || value[i][1])) {
			list.push('<td title="' + (hour - i) + ' hour' + ((hour - i)==1 ? '' : 's') +' ago, ' + (iscash ? '$' : '') + addCommas(value[i][1]) + ' + ' + (iscash ? '$' : '') + addCommas(value[i][0]) + ' = ' + (iscash ? '$' : '') + addCommas(value[i][0] + value[i][1]) + '"><div style="height:'+Math.max(Math.ceil((value[i][0] - min) / (max - min) * 100) - 1, 0)+'px;"></div><div style="height:'+Math.max(Math.ceil((value[i][1] - min) / (max - min) * 100) - 1, 0)+'px;"></div></td>');
		} else {
			list.push('<td style="border-bottom:1px solid blue;" title="' + (hour - i) + ' hour' + ((hour - i)==1 ? '' : 's') +' ago"></td>');
		}
	}
	list.push('</tr>');
	return list.join('');
}

/********** Worker.Quest **********
* Completes quests with a choice of general
*/
// Should also look for quests_quest but that should never be used unless there's a new area
var Quest = new Worker('Quest', 'quests_quest1 quests_quest2 quests_quest3 quests_quest4 quests_quest5 quests_quest6 quests_quest7 quests_demiquests quests_atlantis');
Quest.option = {
	general: 'Under Level 4',
	what: 'Influence',
	unique: true,
	monster:true
};
Quest.land = ['Land of Fire', 'Land of Earth', 'Land of Mist', 'Land of Water', 'Demon Realm', 'Undead Realm', 'Underworld'];
Quest.area = {quest:'Quests', demiquest:'Demi Quests', atlantis:'Atlantis'};
Quest.current = null;
Quest.display = [
	{
		id:'general',
		label:'General',
		select:['any', 'Under Level 4', 'Influence']
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
		id:'current',
		label:'Current',
		info:'None'
	}
];
Quest.parse = function(change) {
	var quest = Quest.data, area, land = null;
	if (Page.page === 'quests_demiquests') {
		area = 'demiquest';
	} else if (Page.page === 'quests_atlantis') {
		area = 'atlantis';
	} else {
		area = 'quest';
		land = Page.page.regex(/quests_quest([0-9]+)/i) - 1;
	}
	$('div.quests_background,div.quests_background_sub,div.quests_background_special').each(function(i,el){
		var name, level, influence, reward, units, energy;
		if ($(el).hasClass('quests_background')) { // Main quest
			name = $('div.qd_1 b', el).text().trim();
			level = $('div.quest_progress', el).text().regex(/LEVEL ([0-9]+)/i);
			influence = $('div.quest_progress', el).text().regex(/INFLUENCE: ([0-9]+)%/i);
			reward = $('div.qd_2', el).text().replace(/[^0-9$]/g, '').regex(/^([0-9]+)\$([0-9]+)\$([0-9]+)$/);
			energy = $('div.quest_req b', el).text().regex(/([0-9]+)/);
		} else if ($(el).hasClass('quests_background_sub')) { // Subquest
			name = $('div.quest_sub_title', el).text().trim();
			level = $('div.quest_sub_progress', el).text().regex(/LEVEL ([0-9]+)/i);
			influence = $('div.quest_sub_progress', el).text().regex(/INFLUENCE: ([0-9]+)%/i);
			reward = $('div.qd_2_sub', el).text().replace(/[^0-9$]/g, '').regex(/^([0-9]+)\$([0-9]+)\$([0-9]+)$/);
			energy = $('div.qd_3_sub', el).text().regex(/([0-9]+)/);
		} else if ($(el).hasClass('quests_background_special')) { // Special Quest
			name = $('div.qd_1 b', el).text().trim();
			reward = $('div.qd_2', el).text().replace(/[^0-9$]/g, '').regex(/^([0-9]+)\$([0-9]+)\$([0-9]+)$/);
			energy = $('div.quest_req b', el).text().regex(/([0-9]+)/);
		}
		if (!name) {
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
		if ($(el).hasClass('quests_background')) { // Main quest has some extra stuff
			if ($('div.qd_1 img', el).attr('title')) {
				quest[name].item = $('div.qd_1 img', el).attr('title').trim();
				quest[name].itemimg = $('div.qd_1 img', el).attr('src').filepart();
			}
			if ($('div.quest_act_gen img', el).attr('title')) {
				quest[name].general = $('div.quest_act_gen img', el).attr('title');
			}
			units = {};
			$('div.quest_req > div > div > div', el).each(function(i,el){
				var title = $('img', el).attr('title');
				units[title] = $(el).text().regex(/([0-9]+)/);
			});
			if (units.length) {
				quest[name].units = units;
			}
//				GM_debug('Quest: '+name+' = '+quest[name].toSource());
		} else if ($(el).hasClass('quests_background_special') && $('input', el).length) { // Special quests have some extra stuff
			quest[name].unique = true;
			if ($('div.qd_1 img', el).last().length) {
				quest[name].item = $('div.qd_1 img', el).last().attr('title').trim(); // We only want the last one
				quest[name].itemimg = $('div.qd_1 img', el).last().attr('src').filepart();
			}
			units = {};
			$('div.quest_req > div > div > div', el).each(function(i,el){
				var title = $('img', el).attr('title');
				units[title] = $(el).text().regex(/([0-9]+)/);
			});
			if (units.length) {
				quest[name].units = units;
			}
		}
	});
	if (Settings.Save(Quest)) {
		Quest.select();
		Quest.dashboard();
	}
	return false;
};
Quest.select = function() {
	var i, list = [];
	for (i in Quest.data) {
		if (Quest.data[i].item && !Quest.data[i].unique) {
			list.push(Quest.data[i].item);
		}
	}
	list = ['Nothing', 'Influence', 'Experience', 'Cash'].concat(unique(list).sort());
	$('select.golem_quest_reward').each(function(a,el){
		$(el).empty();
		var i, tmp = $(el).attr('id').slice(PREFIX.length).regex(/([^_]*)_(.*)/i), value = tmp ? WorkerByName(tmp[0]).option[tmp[1]] : null;
		for (i=0; i<list.length; i++) {
			$(el).append('<option value="'+list[i]+'"'+(list[i]===value ? ' selected' : '')+'>'+list[i]+'</value>');
		}
	});
};
Quest.work = function(state) {
	var i, j, best = null;
	if (Quest.option.what === 'Nothing') {
		return false;
	}
	if (Quest.option.unique) {
		for (i in Quest.data) {
			if (Quest.data[i].unique && !Alchemy.data.ingredients[Quest.data[i].itemimg] && (!best || Quest.data[i].energy < Quest.data[best].energy)) {
				best = i;
			}
		}
	}
	if (!best) {
		for (i in Quest.data) {
			if ((Quest.option.what === 'Influence' && typeof Quest.data[i].influence !== 'undefined' && Quest.data[i].influence < 100 && (!best || Quest.data[i].energy < Quest.data[best].energy))
			|| (Quest.option.what === 'Experience' && (!best || (Quest.data[i].energy / Quest.data[i].exp) < (Quest.data[best].energy / Quest.data[best].exp)))
			|| (Quest.option.what === 'Cash' && (!best || (Quest.data[i].energy / Quest.data[i].reward) < (Quest.data[best].energy / Quest.data[best].reward)))
			|| (Quest.option.what !== 'Influence' && Quest.option.what !== 'Experience' && Quest.option.what !== 'Cash' && Quest.data[i].item === Quest.option.what && (!best || Quest.data[i].energy < Quest.data[best].energy))) {
				best = i;
			}
		}
	}
	if (best !== Quest.current) {
		Quest.current = best;
		if (best) {
			GM_debug('Quest: Wanting to perform - '+best+' (energy: '+Quest.data[best].energy+')');
			$('#'+PREFIX+'Quest_current').html(''+best+' (energy: '+Quest.data[best].energy+')');
		}
	}
	if (Quest.option.monster) {
		for (i in Monster.data) {
			for (j in Monster.data[i]) {
				if (Monster.data[i][j].state === 'engage' && typeof Monster.data[i][j].defense === 'number' && Monster.data[i][j].defense <= Monster.option.fortify) {
					return false;
				}
			}
		}
	}
	if (!best || Quest.data[best].energy > Queue.burn.energy) {
		return false;
	}
	if (!state) {
		return true;
	}
	if (Quest.data[best].general) {
		if (!Generals.to(Quest.data[best].general)) 
		{
			return true;
		}
	} else if (!Generals.to(Generals.best(Quest.option.general))) {
		return true;
	}
	switch(Quest.data[best].area) {
		case 'quest':
			if (!Page.to('quests_quest' + (Quest.data[best].land + 1))) {
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
			GM_debug('Quest: Can\'t get to quest area!');
			return false;
	}
	GM_debug('Quest: Performing - '+best+' (energy: '+Quest.data[best].energy+')');
	if (!Page.click('div.action[title^="'+best+'"] input[type="image"]')) {
		Page.reload();
	}
	if (Quest.option.unique && Quest.data[best].unique) {
		if (!Page.to('keep_alchemy')) {
			return true;
		}
	}
	return true;
};

Quest.order = [];
Quest.dashboard = function(sort, rev) {
	var i, o, list = [], output;
	if (typeof sort === 'undefined') {
		Quest.order = [];
		for (i in Quest.data) {
			Quest.order.push(i);
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
	Quest.order.sort(function(a,b) {
		var aa = getValue(a), bb = getValue(b);
		if (typeof aa === 'string' || typeof bb === 'string') {
			return (rev ? (bb || '') > (aa || '') : (bb || '') < (aa || ''));
		}
		return (rev ? (aa || 0) - (bb || 0) : (bb || 0) - (aa || 0));
	});
	list.push('<table cellspacing="0" style="width:100%"><thead><th>General</th><th>Name</th><th>Area</th><th>Level</th><th>Energy</th><th>@&nbsp;Exp</th><th>@&nbsp;Reward</th><th>Item</th></tr></thead><tbody>');
	for (o=0; o<Quest.order.length; o++) {
		i = Quest.order[o];
		output = [];
		output.push(Generals.data[Quest.data[i].general] ? '<img style="width:25px;height:25px;" src="' + Player.data.imagepath + Generals.data[Quest.data[i].general].img+'" alt="'+Quest.data[i].general+'" title="'+Quest.data[i].general+'">' : '');
		output.push(i);
		output.push(typeof Quest.data[i].land === 'number' ? Quest.land[Quest.data[i].land].replace(' ','&nbsp;') : Quest.area[Quest.data[i].area].replace(' ','&nbsp;'));
		output.push(typeof Quest.data[i].level !== 'undefined' ? Quest.data[i].level +'&nbsp;(' + Quest.data[i].influence +'%)' : '');
		output.push(Quest.data[i].energy);
		output.push('<span title="Total = ' + Quest.data[i].exp + '">' + (Quest.data[i].exp / Quest.data[i].energy).round(2) + '</span>');
		output.push('<span title="Total = $' + addCommas(Quest.data[i].reward) + '">$' + addCommas((Quest.data[i].reward / Quest.data[i].energy).round()) + '</span>');
		output.push(Quest.data[i].itemimg ? '<img style="width:25px;height:25px;" src="' + Player.data.imagepath + Quest.data[i].itemimg+'" alt="'+Quest.data[i].item+'" title="'+Quest.data[i].item+'">' : '');
		list.push('<tr style="height:25px;"><td>' + output.join('</td><td>') + '</td></tr>');
	}
	list.push('</tbody></table>');
	$('#golem-dashboard-Quest').html(list.join(''));
	$('#golem-dashboard-Quest thead th').css('cursor', 'pointer').click(function(event){
		Quest.dashboard($(this).prevAll().length, $(this).attr('name')==='sort');
	});
	$('#golem-dashboard-Quest tbody tr td:nth-child(2)').css('text-align', 'left');
	if (typeof sort !== 'undefined') {
		$('#golem-dashboard-Quest thead th:eq('+sort+')').attr('name',(rev ? 'reverse' : 'sort')).append('&nbsp;' + (rev ? '&uarr;' : '&darr;'));
	}
};

/********** Worker.Town **********
* Sorts and auto-buys all town units (not property)
*/
var Town = new Worker('Town', 'town_soldiers town_blacksmith town_magic');
Town.data = {
	soldiers: {},
	blacksmith: {},
	magic: {}
};
Town.display = [
	{
		label:'Work in progress...'
	},{
		id:'general',
		label:'Buy Number:',
		select:['None', 'Maximum', 'Match Army']
	},{
		id:'units',
		label:'Buy Type:',
		select:['All', 'Best Offense', 'Best Defense', 'Best of Both']
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
Town.parse = function(change) {
	if (!change) {
		var unit = {};
		$('tr.eq_buy_row,tr.eq_buy_row2').each(function(a,el){
			var i, name = $('div.eq_buy_txt strong:first-child', el).text().trim(),
				cost = $('div.eq_buy_costs strong:first-child', el).text().replace(/[^0-9]/g, '');
			unit[name] = {};
			if (cost) {
				unit[name].cost = parseInt(cost, 10);
				unit[name].buy = [];
				$('div.eq_buy_costs select[name="amount"]:first option', el).each(function(i,el){
					unit[name].buy.push(parseInt($(el).val(), 10));
				});
			}
			unit[name].img = $('div.eq_buy_image img', el).attr('src').filepart();
			unit[name].own = $('div.eq_buy_costs span:first-child', el).text().regex(/Owned: ([0-9]+)/i);
			unit[name].att = $('div.eq_buy_stats div:first-child', el).text().regex(/([0-9]+)/);
			unit[name].def = $('div.eq_buy_stats div:last-child', el).text().regex(/([0-9]+)/);
			if (Page.page==='town_blacksmith') {
				for (i in Town.blacksmith) {
					if (name.match(Town.blacksmith[i])) {
						unit[name].type = i;
					}
				}
			}
		});
		Town.data[Page.page.substr(5)] = unit;
		if (Settings.Save(Town)) {
			Town.dashboard();
		}
	} else {
		if (Page.page==='town_blacksmith') {
			$('tr.eq_buy_row,tr.eq_buy_row2').each(function(i,el){
				var name = $('div.eq_buy_txt strong:first-child', el).text().trim();
				if (Town.data.blacksmith[name].type) {
					$('div.eq_buy_txt strong:first-child', el).parent().append('<br>'+Town.data.blacksmith[name].type);
				}
			});
		}
	}
	return true;
};
Town.work = function(state) {
	if (!Town.option.number) {
		return false;
	}
	var i, j, max = Math.min(Town.option.number==='Maximum' ? 501 : Player.data.army, 501), best = null, count = 0, gold = Player.data.gold + Player.data.bank, units = Town.data.soldiers;
	for (i in units) {
		count = 0;
		if (!units[i].cost || units[i].own >= max || (best && Town.option.units === 'Best Offense' && units[i].att <= best.att) || (best && Town.option.units === 'Best Defense' && units[i].def <= best.def) || (best && Town.option.units === 'Best of Both' && (units[i].att <= best.att || units[i].def <= best.def))) {
			continue;
		}
		for (j in units[i].buy) {
			if ((max - units[i].own) >= units[i].buy[j]) {
				count = units[i].buy[j]; // && (units[i].buy[j] * units[i].cost) < gold
			}
		}
		GM_debug('Thinking about buying: '+count+' of '+i+' at $'+(count * units[i].cost));
		if (count) {
			best = i;
			break;
		}
	}
	if (!best) {
		return false;
	}
	if (!state) {
		GM_debug('Want to buy '+count+' x '+best+' at $'+(count * units[best].cost));
		return true;
	}
//	if (!Bank.retrieve(best.cost * count)) return true;
//	if (Player.data.gold < best.cost) return false; // We're poor!
//	if (!Page.to('town_soldiers')) return true;
	return false;
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
			output.push('<div style="height:25px;margin:1px;"><img src="'+Player.data.imagepath+list[units[i]].img+'" style="width:25px;height:25px;float:left;margin-right:4px;">'+(list[units[i]].use ? list[units[i]].use[type+'_'+x]+' x ' : '')+units[i]+' ('+list[units[i]].att+' / '+list[units[i]].def+')'+(list[units[i]].cost?'<br>$'+addCommas(list[units[i]].cost):'')+'</div>');
		}
	}
	if (name) {
		output.push('</div></div>');
	}
	return output.join('');
};

Town.dashboard = function() {
	var left, right, duel = {}, best,
		listpush = function(list,i){list.push(i);},
		listpushweapon = function(list,i,units){if (units[i].type === 'Weapon'){list.push(i);}},
		listpushnotweapon = function(list,i,units){if (units[i].type !== 'Weapon'){list.push(i);}},
		listpushshield = function(list,i,units){if (units[i].type === 'Shield'){list.push(i);}},
		listpushhelmet = function(list,i,units){if (units[i].type === 'Helmet'){list.push(i);}},
		listpushgloves = function(list,i,units){if (units[i].type === 'Gloves'){list.push(i);}},
		listpusharmor = function(list,i,units){if (units[i].type === 'Armor'){list.push(i);}},
		listpushamulet = function(list,i,units){if (units[i].type === 'Amulet'){list.push(i);}},
		usepush = function(list,i,units){if (units[i].use){list.push(i);}},
		usepushweapon = function(list,i,units){if (units[i].use && units[i].type === 'Weapon'){list.push(i);}},
		usepushnotweapon = function(list,i,units){if (units[i].use && units[i].type !== 'Weapon'){list.push(i);}};

		Town.data.invade = {
		attack:	getAttDef(Town.data.soldiers, listpush, 'att', Player.data.army, 'invade')
			+	getAttDef(Town.data.blacksmith, listpushweapon, 'att', Player.data.army, 'invade')
			+	getAttDef(Town.data.blacksmith, listpushnotweapon, 'att', Player.data.army, 'invade')
			+	getAttDef(Town.data.magic, listpush, 'att', Player.data.army, 'invade'),
		defend:	getAttDef(Town.data.soldiers, listpush, 'def', Player.data.army, 'invade')
			+	getAttDef(Town.data.blacksmith, listpushweapon, 'def', Player.data.army, 'invade')
			+	getAttDef(Town.data.blacksmith, listpushnotweapon, 'def', Player.data.army, 'invade')
			+	getAttDef(Town.data.magic, listpush, 'def', Player.data.army, 'invade')
	};
	Town.data.duel = {
		attack:	getAttDef(Town.data.blacksmith, listpushweapon, 'att', 1, 'duel')
			+	getAttDef(Town.data.blacksmith, listpushshield, 'att', 1, 'duel')
			+	getAttDef(Town.data.blacksmith, listpushhelmet, 'att', 1, 'duel')
			+	getAttDef(Town.data.blacksmith, listpushgloves, 'att', 1, 'duel')
			+	getAttDef(Town.data.blacksmith, listpusharmor, 'att', 1, 'duel')
			+	getAttDef(Town.data.blacksmith, listpushamulet, 'att', 1, 'duel')
			+	getAttDef(Town.data.magic, listpush, 'att', 1, 'duel'),
		defend:	getAttDef(Town.data.blacksmith, listpushweapon, 'def', 1, 'duel')
			+	getAttDef(Town.data.blacksmith, listpushshield, 'def', 1, 'duel')
			+	getAttDef(Town.data.blacksmith, listpushhelmet, 'def', 1, 'duel')
			+	getAttDef(Town.data.blacksmith, listpushgloves, 'def', 1, 'duel')
			+	getAttDef(Town.data.blacksmith, listpusharmor, 'def', 1, 'duel')
			+	getAttDef(Town.data.blacksmith, listpushamulet, 'def', 1, 'duel')
			+	getAttDef(Town.data.magic, listpush, 'def', 1, 'duel')
	};

	best = Generals.best('duel');
	left = '<div style="float:left;width:50%;"><div class="golem-panel"><h3 class="golem-panel-header">Invade - Attack</h3><div class="golem-panel-content" style="padding:8px;">'
			+	makeTownDash(Generals.data, listpush, 'att', 'invade', 'Heroes')
			+	makeTownDash(Town.data.soldiers, usepush, 'att', 'invade', 'Soldiers')
			+	makeTownDash(Town.data.blacksmith, usepushweapon, 'att', 'invade', 'Weapons')
			+	makeTownDash(Town.data.blacksmith, usepushnotweapon, 'att', 'invade', 'Equipment')
			+	makeTownDash(Town.data.magic, usepush, 'att', 'invade', 'Magic')
			+	'</div></div><div class="golem-panel"><h3 class="golem-panel-header">Duel - Attack</h3><div class="golem-panel-content" style="padding:8px;">'
			+	(best !== 'any' ? '<div style="height:25px;margin:1px;"><img src="'+Player.data.imagepath+Generals.data[best].img+'" style="width:25px;height:25px;float:left;margin-right:4px;">'+best+' ('+Generals.data[best].att+' / '+Generals.data[best].def+')</div>' : '')
			+	makeTownDash(Town.data.blacksmith, usepush, 'att', 'duel')
			+	makeTownDash(Town.data.magic, usepush, 'att', 'duel')
			+'</div></div></div>';
	best = Generals.best('defend');
	right = '<div style="float:right;width:50%;"><div class="golem-panel"><h3 class="golem-panel-header">Invade - Defend</h3><div class="golem-panel-content" style="padding:8px;">'
			+	makeTownDash(Generals.data, listpush, 'def', 'invade', 'Heroes')
			+	makeTownDash(Town.data.soldiers, usepush, 'def', 'invade', 'Soldiers')
			+	makeTownDash(Town.data.blacksmith, usepushweapon, 'def', 'invade', 'Weapons')
			+	makeTownDash(Town.data.blacksmith, usepushnotweapon, 'def', 'invade', 'Equipment')
			+	makeTownDash(Town.data.magic, usepush, 'def', 'invade', 'Magic')
			+	'</div></div><div class="golem-panel"><h3 class="golem-panel-header">Duel - Defend</h3><div class="golem-panel-content" style="padding:8px;">'
			+	(best !== 'any' ? '<div style="height:25px;margin:1px;"><img src="'+Player.data.imagepath+Generals.data[best].img+'" style="width:25px;height:25px;float:left;margin-right:4px;">'+best+' ('+Generals.data[best].att+' / '+Generals.data[best].def+')</div>' : '')
			+	makeTownDash(Town.data.blacksmith, usepush, 'def', 'duel')
			+	makeTownDash(Town.data.magic, usepush, 'def', 'duel')
			+'</div></div></div>';

	$('#golem-dashboard-Town').html(left+right);
}

/********** Worker.Update **********
* Checks if there's an update to the script, and lets the user update if there is.
*/
var Update = new Worker('Update');
Update.data = null;
Update.option = null;
Update.found = false;
Update.onload = function() {
	var $btn = $('<img class="golem-button" name="Script Update" id="golem_update" src="data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%10%00%00%00%10%08%03%00%00%00(-%0FS%00%00%00%18PLTE%C7%C7%C7UUU%7B%7B%7B%BF%BF%BF%A6%A6%A6%FF%FF%FF%40%40%40%FF%FF%FFk5%D0%FB%00%00%00%08tRNS%FF%FF%FF%FF%FF%FF%FF%00%DE%83%BDY%00%00%00UIDATx%DAt%8F%5B%12%800%08%03%23%8Fx%FF%1B%5B%C0%96%EA%E8~%95%9D%C0%A48_%E0S%A8p%20%3A%85%F1%C6Jh%3C%DD%FD%205E%E4%3D%18%5B)*%9E%82-%24W6Q%F3Cp%09%E1%A2%8E%A2%13%E8b)lVGU%C7%FF%E7v.%01%06%005%D6%06%07%F9%3B(%D0%00%00%00%00IEND%AEB%60%82">').click(function(){Update.now(true);});
	$('#golem_buttons').append($btn);
};
Update.now = function(force) {
	if (Update.found) {
		window.location.href = 'http://userscripts.org/scripts/source/67412.user.js';
		return;
	}
	var lastUpdateCheck = Settings.GetValue("lastUpdateCheck", 0);
	if (force || Date.now() - lastUpdateCheck > 21600000) {
		// 6+ hours since last check (60x60x6x1000ms)
		Settings.SetValue("lastUpdateCheck", Date.now().toString());
		GM_xmlhttpRequest({
			method: "GET",
			url: 'http://userscripts.org/scripts/show/67412',
			onload: function(evt) {
				if (evt.readyState === 4 && evt.status === 200) {
					var tmp = $(evt.responseText), remoteVersion = $('#summary', tmp).text().regex(/Version:[^0-9.]+([0-9.]+)/i);
					if (force) {
						$('#golem_request').remove();
					}
					if (remoteVersion>VERSION) {
						Update.found = true;
						$('#golem_update').attr('src', 'data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%10%00%00%00%10%08%03%00%00%00(-%0FS%00%00%00%18PLTE%C8%C8%C8%C1%C1%C1%BA%BA%BA%F1%F1%F1ggg%FF%FF%FF%40%40%40%FF%FF%FF%7D%5C%EC%14%00%00%00%08tRNS%FF%FF%FF%FF%FF%FF%FF%00%DE%83%BDY%00%00%00OIDATx%DA%8C%8FA%0A%C0%20%0C%04W%8D%EB%FF%7F%AC1%5BQi%A1s%0A%C3%24%10%B4%0B%7C%89%9COa%A4%ED%22q%906a%2CE%09%14%D4%AA%04%BA0%8AH%5C%80%02%12%3E%FB%0A%19b%06%BE2%13D%F0%F0.~%3E%B7%E8%02%0C%00Z%03%06Q9dE%25%00%00%00%00IEND%AEB%60%82').toggleClass('golem-button golem-button-active');
						if (force) {
							$('#golem_config').after('<div id="golem_request" title="Castle Age Golem"><p>There is a new version of Castle Age Golem available.</p><p>Current&nbsp;version:&nbsp;'+VERSION+', New&nbsp;version:&nbsp;'+remoteVersion+'</p></div>');
							$('#golem_request').dialog({ modal:true, buttons:{"Install":function(){$(this).dialog("close");window.location.href='http://userscripts.org/scripts/source/67412.user.js';}, "Skip":function(){$(this).dialog("close");}} });
						}
						GM_log('New version available: '+remoteVersion);
					} else if (force) {
						$('#golem_config').after('<div id="golem_request" title="Castle Age Golem"><p>There are no new versions available.</p></div>');
						$('#golem_request').dialog({ modal:true, buttons:{"Ok":function(){$(this).dialog("close");}} });
					}
				}
			}
		});
	}
};

/********** Worker.Upgrade **********
* Spends upgrade points
*/
var Upgrade = new Worker('Upgrade', 'keep_stats');
Upgrade.data = {
	run: 0
};
Upgrade.display = [
	{
		label:'Points will be allocated in this order, add multiple entries if wanted (ie, 3x Attack and 1x Defense would put &frac34; on Attack and &frac14; on Defense)'
	},{
		id:'order',
		multiple:['Energy', 'Stamina', 'Attack', 'Defense', 'Health']
	}
];
Upgrade.parse = function(change) {
	var result = $('div.results');
	if (Upgrade.data.working && result.length && result.text().match(/You just upgraded your/i)) {
		Upgrade.data.working = false;
		Upgrade.data.run++;
		if (Upgrade.data.run >= Upgrade.option.order.length) {
			Upgrade.data.run = 0;
		}
	}
	return false;
};
Upgrade.work = function(state) {
	if (!Upgrade.option.order || !Upgrade.option.order.length || !Player.data.upgrade || (Upgrade.option.order[Upgrade.data.run]==='Stamina' && Player.data.upgrade<2)) {
		return false;
	}
	if (!state || !Page.to('keep_stats')) {
		return true;
	}
	Upgrade.data.working = true;
	if (Upgrade.data.run >= Upgrade.option.order.length) {
		Upgrade.data.run = 0;
	}
	switch (Upgrade.option.order[Upgrade.data.run]) {
		case 'Energy':
			if (Page.click('a[href$="?upgrade=energy_max"]')) {
				return true;
			}
			break;
		case 'Stamina':
			if (Page.click('a[href$="?upgrade=stamina_max"]')) {
				return true;
			}
			break;
		case 'Attack':
			if (Page.click('a[href$="?upgrade=attack"]')) {
				return true;
			}
			break;
		case 'Defense':
			if (Page.click('a[href$="?upgrade=defense"]')) {
				return true;
			}
			break;
		case 'Health':
			if (Page.click('a[href$="?upgrade=health_max"]')) {
				return true;
			}
			break;
	}
	Page.reload(); // We should never get to this point!
	return true;
};


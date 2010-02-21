// ==UserScript==
// @name           Rycochet's Castle Age Golem
// @namespace      golem
// @description    Auto player for castle age game
// @version        10
// @include        http*://apps.*facebook.com/castle_age/*
// @require        http://cloutman.com/jquery-latest.min.js
// @require        http://cloutman.com/jquery-ui-latest.min.js
// ==/UserScript==
// -- @include        http://www.facebook.com/common/error.html
// -- @include        http://www.facebook.com/reqs.php#confirm_46755028429_0
// -- @include        http://www.facebook.com/home.php
// -- @include        http://www.facebook.com/home.php*filter=app_46755028429*

// User changeable
var debug = true;

// Shouldn't touch
var VERSION = 10;
var APP = '46755028429';
var PREFIX = 'golem'+APP+'_';

// Private data
var Workers = [];
var $configWindow = null;
var userID = unsafeWindow.Env.user; // Facebook userid
var script_started = Date.now();

if(typeof GM_debug === 'undefined') {
	GM_debug = function(txt) { if(debug) { GM_log(txt); } };
}

/*
Useful Classes
--------------
Settings							- Used for storing prefs, option data and choice data.
Settings.SetValue('name',value)		- Use in preference to GM_setValue as it maintains data types
Settings.GetValue('name',default)	- Use in preference to GM_getValue as it maintains data types
Settings.Save(worker)				- Save 'data' for worker (object)
Settings.Save(type,worker)			- Save 'data' or 'option' for worker (object) or all
Settings.Load(worker)				- Load 'data' for worker (object)
Settings.Load(type,worker)			- Load 'data' or 'option' for worker (object) or all
Page			- To do with the castle age page we're currently on
Page.page		- Get the current page in "title_subtitle" format, strip all non-characters. Return true if already there
Page.to(page)	- Go to the page wanted, format as above
Page.click(el)	- Pass a jQuery selector to click
Page.loading()	- Returns true if the Ajax is loading a page
*/

// Elite army
// http://apps.facebook.com/castle_age/party.php?twt=jneg&jneg=true&user=44404517

/********** main() **********
* Runs every second, only does something when the page changes
*/
function main() {
	// First - check if the page has changed...
	if (!Page.loading() && !$('#secret_golem_check').length) {
		if (!$('#app'+APP+'_nvbar_div_end').length) {
			Page.reload();
			return;
		}
		$('#app'+APP+'_nvbar_div_end').append('<br id="secret_golem_check" style="display:none"/>');
		Page.identify();
		for (var i in Workers) {
			if (Workers[i].pages && (Workers[i].pages=='*' || (Page.page && Workers[i].pages.indexOf(Page.page)>=0)) && Workers[i].parse) {
//				GM_debug(Workers[i].name + '.parse(false)');
				Workers[i].priv_parse = Workers[i].parse(false);
			} else Workers[i].priv_parse = false;
		}
		Settings.Save('data');
		for (var i in Workers) {
			if (Workers[i].priv_parse) {
//				GM_debug(Workers[i].name + '.parse(true)');
				Workers[i].parse(true);
			}
		}
	}
	Queue.run();
}

/********** $(document).ready() **********
* Runs when the page has finished loading, but the external data might still be coming in
*/
$(document).ready(function() {
	Page.identify();
	Settings.Load('data');
	Settings.Load('option');
	if (window.location.href.indexOf('castle_age') >= 0) {
		for (var i in Workers) {
			if (Workers[i].onload) Workers[i].onload();
		}
		main(); // Call once to get the ball rolling...
		window.setInterval(function(){main();},1000);
	}
});


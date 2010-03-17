// User changeable
var show_debug = true;

// Shouldn't touch
var VERSION = 26;
var script_started = Date.now();

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
			var PREFIX = 'golem'+APP+'_';
			break;
		}
	}
}

var log = function(txt) {
	console.log(txt);
};

var debug = function(txt) {
	if (show_debug) {
		console.log(txt);
	}
};

if (typeof unsafeWindow === 'undefined') {
	unsafeWindow = window;
}

var userID = 0;

/********** parse_all() **********
* Runs whenever the page contents changes
*/
function parse_all() {
	Page.identify();
	var i, list = [];
	for (i in Workers) {
		if (Workers[i].pages && (Workers[i].pages==='*' || (Page.page && Workers[i].pages.indexOf(Page.page)>=0)) && Workers[i].parse && Workers[i].parse(false)) {
			list.push(Workers[i]);
		}
	}
	Settings.Save('data');
	for (i in list) {
		list[i].parse(true);
	}
}

/********** main() **********
* Runs when the page has finished loading, but the external data might still be coming in
*/
if (typeof APP !== 'undefined') {
	var node_trigger = null;
	$(document).ready(function() {
		var i;
		userID = $('head').html().regex(/user:([0-9]+),/i);
		do_css();
		Page.identify();
		Settings.Load('data');
		Settings.Load('option');
		for (i in Workers) {
			if (Workers[i].onload) {
				Workers[i].onload();
			}
			if (Workers[i].update) {
				Workers[i].update('data');
			}
		}
		parse_all(); // Call once to get the ball rolling...
		$('body').bind('DOMNodeInserted', function(event){
			// Only perform the check on the two id's referenced in get_cached_ajax()
			// Give a short delay due to multiple children being added at once, 0.1 sec should be more than enough
			if (!node_trigger && ($(event.target).attr('id') === 'app'+APPID+'_app_body_container' || $(event.target).attr('id') === 'app'+APPID+'_globalContainer')) {
				node_trigger = window.setTimeout(function(){node_trigger=null;parse_all();},100);
			}
		});
	});
}


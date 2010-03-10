// User changeable
var show_debug = true;

// Shouldn't touch
var VERSION = 24;
var userID = unsafeWindow.Env.user; // Facebook userid
var script_started = Date.now();

// Decide which facebook app we're in...
if (window.location.pathname.indexOf('castle_age') === 1) { // "/castle_age/blah"
	var APP = 'castle_age';
	var APPID = '46755028429';
	var APPNAME = 'Castle Age';
	var PREFIX = 'golem'+APP+'_';
}

function log(txt) {
	console.log(txt);
}

function debug(txt) {
	if (show_debug) {
		console.log(txt);
	}
}

/********** parse_all() **********
* Runs whenever the page contents changes
*/
function parse_all() {
	// Basic check to reload the page if needed...
	Page.identify();
	if (!Page.page || !$('#app'+APPID+'_nvbar_div_end').length) {
		Page.reload();
		return;
	}
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

/********** $(document).ready() **********
* Runs when the page has finished loading, but the external data might still be coming in
*/
if (typeof APP !== 'undefined') {
	var node_trigger = null;
	$(document).ready(function() {
		var i;
		Page.identify();
		Settings.Load('data');
		Settings.Load('option');
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
			if (!node_trigger && ($(event.target).attr('id') === 'app'+APPID+'_app_body_container' || $(event.target).attr('id') === 'app'+APPID+'_globalContainer')) {
				node_trigger = window.setTimeout(function(){node_trigger=null;parse_all();},100);
			}
		});
		// Running the queue every second, options within it give more delay
		window.setInterval(function(){Queue.run();},1000);
	});
}


// User changeable
var debug = true;

// Shouldn't touch
var VERSION = 22;
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


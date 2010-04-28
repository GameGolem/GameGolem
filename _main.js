// User changeable
var show_debug = true;

// Shouldn't touch
var VERSION = 31.0;
var script_started = Date.now();

// Automatically filled
var userID = 0;
var imagepath = '';

// Decide which facebook app we're in...
var applications = {
	'reqs.php':['','Gifts'], // For gifts etc
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
	var debug = function(txt) {
		console.log('[' + (new Date()).format('G:i:s') + '] ' + txt);
	};
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
			window.location.href = window.location.href; // Force reload without retrying
			return
		}
		if (APP === 'reqs.php') { // Let's get the next gift we can...
			return;
		}
		try {
			imagepath = $('#app'+APPID+'_globalContainer img:eq(0)').attr('src').pathpart();
		} catch(e) {
			log('ERROR: Bad Page Load!!!');
			Page.reload();
			return;
		}
		do_css();
		Page.identify();
		for (i=0; i<Workers.length; i++) {
			Workers[i]._setup();
		}
		for (i=0; i<Workers.length; i++) {
			Workers[i]._init();
		}
		for (i=0; i<Workers.length; i++) {
			Workers[i]._update();
			Workers[i]._flush();
		}
		Page.parse_all(); // Call once to get the ball rolling...
	});
}


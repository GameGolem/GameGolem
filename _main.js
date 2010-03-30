// User changeable
var show_debug = true;

// Shouldn't touch
var VERSION = 30.3;
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

/********** main() **********
* Runs when the page has finished loading, but the external data might still be coming in
*/
if (typeof APP !== 'undefined') {
	$(document).ready(function() {
		var i;
		userID = $('head').html().regex(/user:([0-9]+),/i);
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
	});
}


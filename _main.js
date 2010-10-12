/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page, Queue, Resources,
	Battle, Generals, LevelUp, Player,
	GM_log, GM_setValue, GM_getValue, localStorage, console, window, unsafeWindow:true, revision, version, do_css, jQuery,
	Workers, QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH
	makeTimer, shortNumber, Divisor, length, unique, deleteElement, sum, addCommas, findInArray, findInObject, objectIndex, sortObject, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime, ucfirst, ucwords,
	makeImage
*/
// User changeable
var show_debug = true;

// Shouldn't touch
var isRelease = false;
var script_started = Date.now();
var first_timer = window.setTimeout(function(){return;},0);

// Automatically filled
var userID = 0;
var imagepath = '';

// Detect browser - this is rough detection, mainly for updates
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

// Decide which facebook app we're in...
if (window.location.hostname.match(/\.facebook\.com$/i)) {
	var applications = {
		'reqs.php':['','Gifts'], // For gifts etc
		'castle_age':['46755028429', 'Castle Age']
	};

	for (var i in applications) {
		if (window.location.pathname.indexOf(i) === 1) {
			var APP = i;
			var APPID = applications[i][0];
			var APPNAME = applications[i][1];
			var PREFIX = 'golem'+APPID+'_';
			break;
		}
	}
	if (typeof APP === 'undefined') {
		console.log('GameGolem; Unknown facebook application...');
	} else {
		var log = function(txt){
			console.log('[' + (new Date()).toLocaleTimeString() + '] ' + Worker.current + ': ' + $.makeArray(arguments).join("\n"));
		};
		if (show_debug) {
			var debug = function(txt) {
				console.log('[' + (isRelease ? 'v'+version : 'r'+revision) + '] [' + (new Date()).toLocaleTimeString() + '] ' + Worker.current + ': ' + $.makeArray(arguments).join("\n"));
			};
		} else {
			var debug = function(){};
		}

		if (typeof unsafeWindow === 'undefined') {
			var unsafeWindow = window;
		}

		var document_ready = function() {
			var i = 0;
			try {
				userID = $('script').text().regex(/user:([0-9]+),/i);
			} catch(e) {
				if (i++ < 5) {// Try 5 times before we give up...
					window.setTimeout(document_ready, 1000);
					return;
				}
			}
			if (!userID || typeof userID !== 'number' || userID === 0) {
				log('ERROR: No Facebook UserID!!!');
				window.setTimeout(Page.reload, 5000); // Force reload without retrying
				return;
			}
			if (APP === 'reqs.php') { // Let's get the next gift we can...
				return;
			}
			try {
				imagepath = $('#app'+APPID+'_globalContainer img:eq(0)').attr('src').pathpart();
			} catch(e) {
				log('ERROR: Bad Page Load!!!');
				window.setTimeout(Page.reload, 5000);
				return;
			}
			do_css();
			Page.identify();
			for (i in Workers) {
				Workers[i]._setup();
			}
			for (i in Workers) {
				Workers[i]._init();
			}
			for (i in Workers) {
				Workers[i]._update();
				Workers[i]._flush();
			}
			Page.parse_all(); // Call once to get the ball rolling...
		};

		if (typeof jQuery !== 'undefined') {
			$(document).ready(document_ready);
		} else {
			var head = document.getElementsByTagName('head')[0] || document.documentElement, a = document.createElement('script'), b = document.createElement('script');
			a.type = b.type = 'text/javascript';
			a.src = 'http://ajax.googleapis.com/ajax/libs/jquery/1.4.2/jquery.min.js';
			b.src = 'http://ajax.googleapis.com/ajax/libs/jqueryui/1.8.1/jquery-ui.min.js';
			head.appendChild(a);
			head.appendChild(b);
			log('Loading jQuery & jQueryUI');
			(function jQwait() {
				log('...loading... jQuery: '+typeof jQuery+', window.jQuery: '+typeof unsafeWindow.jQuery);
				if (typeof window.jQuery === 'undefined') {
					window.setTimeout(jQwait, 10000);
				} else {
					log('jQuery Loaded...');
					$(document).ready(document_ready);
				}
			})();
		}
	}
}


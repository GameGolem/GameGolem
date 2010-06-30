// User changeable
var show_debug = true;

// Shouldn't touch
var isRelease = true;
var script_started = Date.now();

// Automatically filled
var userID = 0;
var imagepath = '';
var isGreasemonkey = (typeof GM_log === 'function');

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
			console.log('[' + (new Date).toLocaleTimeString() + '] ' + (WorkerStack && WorkerStack.length ? WorkerStack[WorkerStack.length-1].name + ': ' : '') + $.makeArray(arguments).join("\n"));
		}

		if (show_debug) {
			var debug = function(txt) {
				console.log('[' + (isRelease ? 'r'+revision : 'v'+version) + '] [' + (new Date).toLocaleTimeString() + '] ' + (WorkerStack && WorkerStack.length ? WorkerStack[WorkerStack.length-1].name + ': ' : '') + $.makeArray(arguments).join("\n"));
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
				window.location.href = window.location.href; // Force reload without retrying
				return;
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
				log('...loading... jQuery: '+typeof jQuery+', window.jQuery: '+typeof unsafewindow.jQuery);
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


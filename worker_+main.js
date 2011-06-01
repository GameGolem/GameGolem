/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$:true, Worker, Army, Main:true, History, Page:true, Queue, Resources,
	Battle, Generals, LevelUp, Player,
	APP:true, APPID:true, APPNAME:true, userID:true, imagepath:true, isRelease, version, revision, Workers, PREFIX:true, Images, window, browser,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, Divisor, length, sum, findInObject, objectIndex, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
	unsafeWindow, log, warn, error, chrome
*/
/********** Worker.Main **********
* Initial kickstart of Golem.
*/
var Main = new Worker('Main');
Main.data = Main.option = Main.runtime = Main.temp = null;

Main.settings = {
	system:true,
	taint:true // Doesn't store any data, but still cleans it up lol
};

Main._apps_ = {};
Main._retry_ = 0;
Main._jQuery_ = false; // Only set if we're loading it

/**
 * Use this function to add more applications
 * @param {string} app The pathname of the app under facebook.com
 * @param {string} appid The facebook app id
 * @param {string} appname The human readable app name
 * @param {?RegExp=} alt An alternative domain for the app (make sure you include the protocol for security)
 * @param {?Function=} fn A function to call before _setup() when the app is recognised
 */
Main.add = function(app, appid, appname, alt, fn) {
	this._apps_[app] = [appid, appname, alt, fn];
};

Main.page = function() {
	try {
		var newpath = $('#app_content_'+APPID+' img:eq(0)').attr('src').pathpart();
		if (newpath) {
			imagepath = newpath;
		}
	} catch(e) {}
};

Main.update = function(event, events) { // Using events with multiple returns because any of them are before normal running and are to stop Golem...
	var i, old_revision, head, a, b, tmp;
	if (events.findEvent(null,null,'kickstart')) {
		old_revision = parseInt(localStorage['golem.' + APP + '.revision'] || 1061, 10); // Added code to support Revision checking in 1062;
		if (old_revision > revision) {
			if (!confirm('GAME-GOLEM WARNING!!!' + "\n\n" +
				'You have reverted to an earlier version of GameGolem!' + "\n\n" +
				'This may result in errors or other unexpected actions!' + "\n\n" +
				'Are you sure you want to use this earlier version?' + "\n" +
				'(selecting "Cancel" will prevent Golem from running and preserve your current data)')) {
				return true;
			}
			log(LOG_INFO, 'GameGolem: Reverting from r' + old_revision + ' to r' + revision);
		} else if (old_revision < revision) {
			log(LOG_INFO, 'GameGolem: Updating ' + APPNAME + ' from r' + old_revision + ' to r' + revision);
		}
		tmp = $('#rightCol');
		if (!tmp.length) {
			log(LOG_INFO, 'GameGolem: Unable to find DOM parent, using <body> instead...');
			tmp = $('body');
		}
		tmp.prepend('<div id="golem" style="visibility:hidden;"></div>'); // Set the theme from Theme.update('init')
		for (i in Workers) {
			Workers[i]._setup(old_revision);
		}
		for (i in Workers) {
			Workers[i]._init(old_revision);
		}
		for (i in Workers) {
			Workers[i]._update('init', 'run');
		}
		if (old_revision !== revision) {
			localStorage['golem.' + APP + '.revision'] = revision;
		}
		$('#golem').css({'visibility':''});
	}
	if (events.findEvent(null,'startup')) {
		// Let's get jQuery running
		if (!$ || !$.support || !$.ui) {
			if (!this._jQuery_) {
				head = document.getElementsByTagName('head')[0] || document.documentElement;
				a = document.createElement('script');
				b = document.createElement('script');
				a.type = b.type = 'text/javascript';
				a.src = 'http://ajax.googleapis.com/ajax/libs/jquery/1.6.1/jquery.min.js';
				b.src = 'http://ajax.googleapis.com/ajax/libs/jqueryui/1.8.12/jquery-ui.min.js';
				head.appendChild(a);
				head.appendChild(b);
				log(LOG_INFO, 'GameGolem: Loading jQuery & jQueryUI');
				this._jQuery_ = true;
			}
			if (!(unsafeWindow || window).jQuery || !(unsafeWindow || window).jQuery.support || !(unsafeWindow || window).jQuery.ui) {
				this._remind(0.1, 'startup');
				return true;
			}
			$ = (unsafeWindow || window).jQuery.noConflict(true);
		}
		// Stop us running twice if via Bookmarklet etc
		if ($('#golem').length) {
			log(LOG_INFO, 'GameGolem: Already installed!');
			return true;
		}
		// Identify Application
		if (!APP) {
			if (empty(this._apps_)) {
				log(LOG_INFO, 'GameGolem: No applications known...');
			}
			for (i in this._apps_) {
				if ((isFacebook = (window.location.pathname.indexOf(i) === 1)) || (isRegExp(this._apps_[i][2]) && this._apps_[i][2].test(window.location))) {
					APP = i;
					APPID = this._apps_[i][0];
					APPNAME = this._apps_[i][1];
					PREFIX = 'golem'+APPID+'_';
					if (isFacebook) {
						APPID_ = 'app' + APPID + '_';
					} else {
						APPID_ = '';
					}
					if (isFunction(this._apps_[APP][3])) {
						this._apps_[APP][3]();
					}
					log(LOG_INFO, 'GameGolem: Starting '+APPNAME);
					break;
				}
			}
			if (typeof APP === 'undefined') {
				log(LOG_INFO, 'GameGolem: Unknown application...');
				return true;
			}
		}
		// Once we hit this point we have our APP and can start things rolling
		try {
			//userID = (unsafeWindow || window).presence && parseInt((unsafeWindow || window).presence.user); //$('script').text().regex(/user:(\d+),/i);
			if (!userID || !isNumber(userID)) {
				userID = $('script').text().regex(/user:(\d+),/i);
			}
			if (!imagepath) {
				imagepath = $('#app_content_'+APPID+' img:eq(0)').attr('src').pathpart(); // #'+APPID_+'app_body_container
			}
		} catch(e) {
			if (Main._retry_++ < 5) {// Try 5 times before we give up...
				log(LOG_INFO, 'GameGolem: Unable to start properly (' + Main._retry_ + '/5)...');
				this._remind(1, 'startup');
				return true;
			}
		}
		if (!userID || !imagepath || !isNumber(userID)) {
			log(LOG_INFO, 'ERROR: Bad Page Load!!!');
			window.setTimeout(Page.reload, 5000); // Force reload without retrying
			return true;
		}
		// jQuery selector extensions
		$.expr[':'].css = function(obj, index, meta, stack) { // $('div:css(width=740)')
			var args = meta[3].regex(/([\w-]+)\s*([<>=]+)\s*(\d+)/), value = parseFloat($(obj).css(args[0]));
			switch(args[1]) {
				case '<':	return value < args[2];
				case '<=':	return value <= args[2];
				case '>':	return value > args[2];
				case '>=':	return value >= args[2];
				case '=':
				case '==':	return value === args[2];
				case '!=':	return value !== args[2];
				default:
					log(LOG_ERROR, 'Bad jQuery selector: $:css(' + args[0] + ' ' + args[1] + ' ' + args[2] + ')');
					return false;
			}
		};
		$.expr[':'].golem = function(obj, index, meta, stack) { // $('input:golem(worker,id)') - selects correct id
			var args = meta[3].toLowerCase().split(',');
			return $(obj).attr('id') === PREFIX + args[0].trim().replace(/[^0-9a-z]/g,'-') + '_' + args[1].trim();
		};
		$.expr[':'].regex = function(obj, index, meta, stack) { // $('div:regex(^\stest\s$)') - selects if the text() matches this
			var ac = arguments.callee, rx = ac['_'+meta[3]]; // Cache the regex - it's quite expensive to construct
			if (!rx) {
				rx = ac['_'+meta[3]] = new RegExp(meta[3],'i');
			}
			return rx.test($(obj).text());
		};
		// jQuery extra functions
		$.fn.autoSize = function() {
			function autoSize(e) {
				var p = (e = e.target || e), s;
				if ($(e).is(':visible')) {
					if (e.oldValueLength !== e.value.length) {
						while (p && !p.scrollTop) {p = p.parentNode;}
						if (p) {s = p.scrollTop;}
						e.style.height = '0px';
						e.style.height = Math.min(parseInt(e.style.maxHeight, 10) || 9999, Math.max(e.scrollHeight, 13)) + 'px';
						if (p) {p.scrollTop = s;}
						e.oldValueLength = e.value.length;
					}
				} else {
					window.setTimeout(function(){autoSize(e);}, 50);
				}
				return true;
			}
			this.filter('textarea').each(function(){
				$(this).css({'resize':'none','overflow-y':'hidden'}).unbind('.autoSize').bind('keyup.autoSize keydown.autoSize change.autoSize', autoSize);
				autoSize(this);
			});
			return this;
		};
		$.fn.selected = function() {
			return $(this).filter(function(){return this.selected;});
		};
		// Now we're rolling
		if (browser === 'chrome' && chrome && chrome.extension && chrome.extension.getURL) {
			$('head').append('<link href="' + chrome.extension.getURL('golem.css') + '" rel="stylesheet" type="text/css">');
		} else {
			$('head').append('<link href="http://rycochet.net/themes/default.css" rel="stylesheet" type="text/css">');
		}
		this._remind(0.1, 'kickstart'); // Give a (tiny) delay for CSS files to finish loading etc
	}
//	return true;
};

if (!Main.loaded) { // Prevent double-start
	log(LOG_INFO, 'GameGolem: Loading...');
	Main._loaded = true;// Otherwise .update() will never fire - no init needed for us as we're the one that calls it
	Main._update('startup');
}


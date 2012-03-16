/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$:true, Workers, Worker, Page,
	APP:true, APPID:true, APPID_:true, APPNAME:true, PREFIX:true, userID:true, imagepath:true, isFacebook:true,
	isRelease, version, revision, trunk_revision, Images, window, browser,
	LOG_ERROR, LOG_WARN, LOG_LOG, LOG_INFO, LOG_DEBUG, log,
	isArray, isFunction, isNumber, isObject, isRegExp, isString, isUndefined,
	unsafeWindow, chrome, localStorage, confirm, empty
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
	var i, j, k, newpath, locs = [
		'#app_content_'+APPID+' img:first',
		'#iframe_canvas body img:first',
		'#globalcss img:first',
		'body img:first'
	];

	try {
		for (i = 0; i < locs.length; i++) {
			if ((j = $(locs[i])).length) {
				if (!isString(k = j.attr('src'))) {
					log(LOG_WARN, '# bad selector.'+i+': ' + locs[i]
					  + ' gives [' + JSON.shallow(j,2) + ']'
					);
				} else if ((newpath = k.pathpart()).length > 0) {
					//log(LOG_DEBUG, '# page.newpath.'+i+' = ' + newpath);
					break;
				}
			}
		}
		if (newpath) {
			imagepath = newpath;
		}
	} catch(e) {
		log(e, e.name + ' in ' + this.name + '.page(): ' + e.message);
	}
};

// Using events with multiple returns because any of them are before normal running and are to stop Golem...
Main.update = function(event, events) {
	var a, b, i, j, k, v, head, tmp,
		key1, key2, force_save, old_revision, fresh = false;

	if (events.findEvent(null, 'startup')
	  || events.findEvent(null, 'reminder', 'startup')
	) {
		// Stop us running twice if via Bookmarklet etc
		if (document.getElementById('golem')) {
			log(LOG_INFO, 'GameGolem: Already installed!');
			return true;
		}

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
			//userID = (unsafeWindow || window).presence && parseInt((unsafeWindow || window).presence.user);
			if (!userID || !isNumber(userID)) {
				userID = ($('script').text() || '').regex(/user:["']?(\d+)["']?[,}]/i);
			}
			if (!imagepath || !isString(imagepath)) {
				imagepath = $('#app_content_'+APPID+' img:eq(0)').attr('src').pathpart(); // #'+APPID_+'app_body_container
			}
		} catch(e) {
			if (Main._retry_++ < 5) {// Try 5 times before we give up...
				log(LOG_WARN, 'GameGolem: Unable to start properly (' + Main._retry_ + '/5)...'
				  + e.name + ' in ' + this.name + '.update(): ' + e.message
				);
				this._remind(1, 'startup');
				return true;
			}
		}

		if (!userID || !imagepath || !isNumber(userID) || !isString(imagepath)) {
			log(LOG_WARN, 'ERROR: Bad Page Load!!!');
			window.setTimeout(Page.reload, 5000); // Force reload without retrying
			return true;
		}

		// -----------------------------------------------------------
		// if we got here, we have an app, a userid, so we are set
		// -----------------------------------------------------------

		this.scheme = window.location.protocol + '//';
		this.domain = window.location.hostname;
		this.path = window.location.pathname.pathpart();
		this.file = window.location.pathname.filepart();
		this.js = 'javascript';
		this.js += ':'; // split to avoid jslint gripes

		// jQuery selector extensions

		// $('div:css(width=740)')
		$.expr[':'].css = function(obj, index, meta, stack) {
			var args, value;
			if (isString(meta[3])) {
				if ((args = meta[3].regex(/^\s*([-\w]+)\s*([!<>=]+)\s*([-+]?\d*\.?\d+(?:[eE][-+]?\d+)?)\s*$/))) {
					value = parseFloat($(obj).css(args[0]));
					switch (args[1]) {
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
				} else if ((args = meta[3].regex(/^\s*([-\w]+)\s*([!<>=]+)\s*(.*)$/))) {
					value = $(obj).css(args[0]);
					switch (args[1]) {
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
				}
			}
		};

		$.expr[':'].colour = function(obj, index, meta, stack) {
			var c1, c2, x,
				colors = {
					black:'#000000',
					white:'#ffffff'
				};
			if (isString(meta[3])) {
				c1 = $(obj).css('color').trim();
				c2 = meta[3].trim();

				// rgb, #, name
				if ((x = c1.replace(/\s+/gm, '').regex(/^rgb\((\d+),(\d+),(\d+)\)$/i))) {
					c1 = '#';
					c1 += Math.range(0, x[0], 255).hex(2);
					c1 += Math.range(0, x[1], 255).hex(2);
					c1 += Math.range(0, x[2], 255).hex(2);
				} else if ((x = c1.match(/^#([0-9a-fA-F]+)$/))) {
					c1 = '#';
					if (x[1].length < 6) {
						c1 += '00000'.substr(6 - x[1].length);
					}
					c1 += x[1].toLowerCase();
				} else if ((x = colors[c1.trim(true).toLowerCase()])) {
					c1 = x;
				} else {
					log(LOG_ERROR, 'Bad jQuery selector: $:colour.1(' + c1 + ')');
					return false;
				}

				// rgb, #, name
				if ((x = c2.replace(/\s+/gm, '').regex(/^rgb\((\d+),(\d+),(\d+)\)$/i))) {
					c2 = '#';
					c2 += Math.range(0, x[0], 255).hex(2);
					c2 += Math.range(0, x[1], 255).hex(2);
					c2 += Math.range(0, x[2], 255).hex(2);
				} else if ((x = c2.match(/^#([0-9a-fA-F]+)$/))) {
					c2 = '#';
					if (x[1].length < 6) {
						c2 += '00000'.substr(6 - x[1].length);
					}
					c2 += x[1].toLowerCase();
				} else if ((x = colors[c2.trim(true).toLowerCase()])) {
					c2 = x;
				} else {
					log(LOG_ERROR, 'Bad jQuery selector: $:colour.2(' + c2.trim(true) + ')');
					return false;
				}

				//log(LOG_INFO, '# color c1['+c1+'] c2['+c2+']');
				return c1 === c2;
			} else {
				log(LOG_ERROR, 'Bad jQuery selector: $:colour(' + JSON.shallow(meta) + ')');
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
				rx = ac['_'+meta[3]] = new RegExp(meta[3], 'im');
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
			//$('head').append('<link href="http://rycochet.net/themes/default.css" rel="stylesheet" type="text/css">');
			$('head').append('<link href="http://game-golem.googlecode.com/svn-history/r'+trunk_revision+'/trunk/golem.css" rel="stylesheet" type="text/css">');
		}
		this._remind(0.1, 'kickstart'); // Give a (tiny) delay for CSS files to finish loading etc
	}

	if (events.findEvent(null, 'reminder', 'kickstart')) {
		key1 = 'golem.'+APP+'.'+userID+'.revision';
		key2 = 'golem.'+APP+'.revision';
		old_revision = parseInt(localStorage.getItem(key1), 10);
		if (!old_revision) {
			old_revision = parseInt(localStorage.getItem(key2), 10);
			force_save = true;
		}
		if (!old_revision) {
			log(LOG_INFO, 'GameGolem: Fresh install of ' + APPNAME + ' r' + revision);
			fresh = true;
			// Added code to support Revision checking in 1062
			old_revision = 1061;
		} else if (old_revision > revision) {
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
			Workers[i]._setup(old_revision, fresh);
		}
		for (i in Workers) {
			Workers[i]._init(old_revision, fresh);
		}
		for (i in Workers) {
			Workers[i]._update('init', 'run');
		}
		if (old_revision < revision || force_save) {
			localStorage.setItem(key1, revision);
		}
		localStorage.removeItem(key2);

		try {
		k = 0;
		for (i = 0; i < localStorage.length; i++) {
			j = localStorage.key(i);
			if (isString(j)) {
				k += j.length * 2 + 16;
				if (isString(v = localStorage[j])) {
					k += v.length * 2;
					if (!/^golem\./i.test(j)) {
						//log(LOG_INFO, '# ls.'+i+'[' + j + '] = ' + v.length + ':[' + v + ']');
					}
				} else {
					//log(LOG_INFO, '# ls.'+i+'[' + j + '] = (type ' + (typeof v) + ')');
				}
			} else {
				//log(LOG_INFO, '# ls.'+i+'[' + JSON.shallow(j) + '] : (type ' + (typeof j) + ')');
			}
		}
		log(LOG_INFO, 'GameGolem: localStorage at ' + k.addCommas() + '/5,242,880 (' + (k / 52428.8).SI() + '%)');
		} catch (e2) {
			log(e2, e2.name + ' in Main startup: ' + e2.message);
		}

		$('#golem').css({'visibility':''});
	}

	return true;
};

Main.shutdown = function() {
	var i;

	// stop the flush timer
	if (!isUndefined(i = Worker.flush._timer)) {
		window.clearInterval(i);
		delete Worker.flush._timer;
	}

	// stop the rest of the timers
	for (i in Workers) {
		Workers[i]._forgetAll(); 
	}

	// flush all remainting data
	for (i in Workers) {
		Workers[i]._flush();
	}
};

if (!Main.loaded) { // Prevent double-start
	log(LOG_INFO, 'GameGolem: Loading...');
	Main._loaded = true;// Otherwise .update() will never fire - no init needed for us as we're the one that calls it
	Main._update('startup');
}


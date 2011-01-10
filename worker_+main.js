/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*Main
	$, Worker, Army, Main:true, History, Page:true, Queue, Resources,
	Battle, Generals, LevelUp, Player,
	APP, APPID, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, Divisor, length, unique, deleteElement, sum, findInArray, findInObject, objectIndex, sortObject, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
	makeImage
*/
/********** Worker.Main **********
* Initial kickstart of Golem.
*/
var Main = new Worker('Main');
Main.data = Main.option = Main.runtime = Main.temp = null;

Main.settings = {
	system:true
};

Main._apps_ = {};
Main._retry_ = 0;

// Use this function to add more applications, "app" must be the pathname of the app under facebook.com, appid is the facebook app id, appname is the human readable name
Main.add = function(app, appid, appname) {
	this._apps_[app] = [appid, appname];
};

Main.setup = function() {
};

Main.parse = function() {
	try {
		var newpath = $('#app_content_'+APPID+' img:eq(0)').attr('src').pathpart();
		if (newpath) {
			imagepath = newpath;
		}
	} catch(e) {}
};

Main.update = function(event) {
	if (event.id !== 'startup') {
		return;
	}
	if (typeof $ === 'undefined') {
		var head = document.getElementsByTagName('head')[0] || document.documentElement, a = document.createElement('script'), b = document.createElement('script');
		a.type = b.type = 'text/javascript';
		a.src = 'http://ajax.googleapis.com/ajax/libs/jquery/1.4.4/jquery.min.js';
		b.src = 'http://ajax.googleapis.com/ajax/libs/jqueryui/1.8.6/jquery-ui.min.js';
		head.appendChild(a);
		head.appendChild(b);
		console.log(log(), 'Loading jQuery & jQueryUI');
		(function() {
//				console.log(log(), '...loading...');
			if (typeof window.jQuery === 'undefined') {
				window.setTimeout(arguments.callee, 1000);
			} else {
				console.log('jQuery Loaded...');
				Main._remind(0.1, 'startup');
			}
		})();
		return;
	}
	// Identify Application
	var i;
	if (!APP) {
		if (!length(this._apps_)) {
			console.log('GameGolem: No applications known...');
		}
		for (i in this._apps_) {
			if (window.location.pathname.indexOf(i) === 1) {
				APP = i;
				APPID = this._apps_[i][0];
				APPNAME = this._apps_[i][1];
				PREFIX = 'golem'+APPID+'_';
				console.log('GameGolem: Starting '+APPNAME);
				break;
			}
		}
		if (typeof APP === 'undefined') {
			console.log('GameGolem: Unknown application...');
			return;
		}
	}
	// Once we hit this point we have our APP and can start things rolling
	try {
		userID = $('script').text().regex(/user:(\d+),/i);
		imagepath = $('#app_content_'+APPID+' img:eq(0)').attr('src').pathpart();
	} catch(e) {
		if (Main._retry_++ < 5) {// Try 5 times before we give up...
			this._remind(1, 'startup');
			return;
		}
	}
	if (!userID || !imagepath || typeof userID !== 'number' || userID === 0) {
		console.log('ERROR: Bad Page Load!!!');
		window.setTimeout(Page.reload, 5000); // Force reload without retrying
		return;
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
				console.log(warn('Bad jQuery selector: $:css(' + args[0] + ' ' + args[1] + ' ' + args[2] + ')'));
				return false;
		}
	};
	$.expr[':'].golem = function(obj, index, meta, stack) { // $('input:golem(worker,id)') - selects correct id
		var args = meta[3].toLowerCase().split(',');
		return $(obj).attr('id') === PREFIX + args[0].trim().replace(/[^0-9a-z]/g,'-') + '_' + args[1].trim();
	};
	// jQuery extra functions
	$.fn.autoSize = function() {
		function autoSize(e) {
			var p = (e = e.target || e), s;
			if (e.oldValueLength !== e.value.length) {
				while (p && !p.scrollTop) {p = p.parentNode;}
				if (p) {s = p.scrollTop;}
				e.style.height = '0px';
				e.style.height = e.scrollHeight + 'px';
				if (p) {p.scrollTop = s;}
				e.oldValueLength = e.value.length;
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
		(function(){})(); // Handled by the extension itself
	} else if (browser === 'greasemonkey' && GM_addStyle && GM_getResourceText) {
		GM_addStyle(GM_getResourceText('stylesheet'));
	} else {
		$('head').append('<style type="text/css">@import url("http://game-golem.googlecode.com/svn/trunk/golem.css");</style>');
	}
	for (i in Workers) {
		Workers[i]._setup();
	}
	for (i in Workers) {
		Workers[i]._init();
	}
	for (i in Workers) {
		Workers[i]._update({type:'init', self:true});
	}
};

Main._loaded = true;// Otherwise .update() will never fire - no init needed for us as we're the one that calls it
Main._remind(0, 'startup');

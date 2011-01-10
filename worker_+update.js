/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page, Queue, Resources,
	Battle, Generals, LevelUp, Player,
	APP, APPID, log, debug, userID, imagepath, isRelease:true, version, revision, Workers, PREFIX, window, browser, GM_xmlhttpRequest,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, Divisor, length, unique, deleteElement, sum, findInArray, findInObject, objectIndex, sortObject, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
	makeImage
*/
/********** Worker.Update **********
* Checks if there's an update to the script, and lets the user update if there is.
*/
var Update = new Worker('Update');
Update.data = null;

Update.settings = {
	system:true
};

Update.runtime = {
	installed:0,// Date this version was first seen
	current:'',// What is our current version
	lastcheck:0,// Date.now() = time since last check
	version:0,// Last ones we saw in a check
	revision:0,
	force:false// Have we clicked a button, or is it an automatic check
};

Update.temp = {
	version:0,
	revision:0,
	check:'',// Url to check for new versions
	url_1:'',// Url to download release
	url_2:''// Url to download revision
};

/***** Update.init() *****
1a. Add a "Update Now" button to the button bar at the top of Config
1b. If running a beta version then add a "beta" button - which makes us pretend to be a beta version before running the update check.
2. On clicking the button set Update.runtime.force to true - so we can work() immediately...
*/
Update.init = function() {
	this.temp.version = version;
	this.temp.revision = revision;
	this.runtime.version = this.runtime.version || version;
	this.runtime.revision = this.runtime.revision || revision;
	switch(browser) {
		case 'chrome':
			Update.temp.check = 'http://game-golem.googlecode.com/svn/trunk/chrome/_version.js';
			Update.temp.url_1 = 'http://game-golem.googlecode.com/svn/trunk/chrome/GameGolem.crx';
			Update.temp.url_2 = 'http://game-golem.googlecode.com/svn/trunk/chrome/GameGolem.crx';
			break;
		default:
			Update.temp.check = 'http://game-golem.googlecode.com/svn/trunk/_version.js';
			Update.temp.url_1 = 'http://game-golem.googlecode.com/svn/trunk/_release.user.js';
			Update.temp.url_2 = 'http://game-golem.googlecode.com/svn/trunk/_normal.user.js';
			break;
	}
	// Add an update button for everyone
	$('<img class="golem-button golem-version" title="Check for Updates" src="' + getImage('update') + '">').click(function(){
		$(this).addClass('red');
		Update.checkVersion(true);
	}).appendTo('#golem_buttons');
	if (isRelease) { // Add an advanced "beta" button for official release versions
		$('<img class="golem-button golem-version golem-advanced"' + (Config.get('option.advanced') ? '' : ' style="display:none;"') + ' title="Check for Beta Versions" src="' + getImage('beta') + '">').click(function(){
			isRelease = false;// Isn't persistant, so nothing visible to the user except the beta release
			$(this).addClass('red');
			Update.checkVersion(true);
		}).appendTo('#golem_buttons');
	}
	// Add a changelog advanced button
	$('<img class="golem-button golem-advanced blue"' + (Config.get('option.advanced') ? '' : ' style="display:none;"') + ' title="Changelog" src="' + getImage('log') + '">').click(function(){
		window.open('http://code.google.com/p/game-golem/source/list', '_blank'); 
	}).appendTo('#golem_buttons');
	// Add a wiki button
	$('<img class="golem-button blue" title="GameGolem wiki" src="' + getImage('wiki') + '">').click(function(){
		window.open('http://code.google.com/p/game-golem/wiki/castle_age', '_blank'); 
	}).appendTo('#golem_buttons');
	$('head').bind('DOMNodeInserted', function(event){
		if (event.target.nodeName === 'META' && $(event.target).attr('name') === 'golem-version') {
			tmp = $(event.target).attr('content').regex(/(\d+\.\d+)\.(\d+)/);
			if (tmp) {
				Update._remind(21600, 'check');// 6 hours
				Update.runtime.lastcheck = Date.now();
				Update.runtime.version = tmp[0];
				Update.runtime.revision = tmp[1];
				if (Update.runtime.force && Update.temp.version >= tmp[0] && (isRelease || Update.temp.revision >= tmp[1])) {
					$('<div class="golem-button golem-info red">No Update Found</div>').animate({'z-index':0}, {duration:5000,complete:function(){$(this).remove();} }).insertAfter('#golem_buttons');
				}
				Update.runtime.force = false;
				$('.golem-version').removeClass('red');
			}
			event.stopImmediatePropagation();
			event.stopPropagation();
			$('script.golem-script-version').remove();
			$(event.target).remove();
			return false;
		}
	});
	if (this.runtime.current !== (version + revision)) {
		this.set(['runtime','installed'], Date.now());
		this.set(['runtime','current'], version + revision);
	}
	this._remind(Math.max(0, (21600000 - (Date.now() - this.runtime.lastcheck)) / 1000), 'check');// 6 hours max
};

Update.checkVersion = function(force) {
	Update.set('runtime.lastcheck', Date.now() - 21600000 + 60000);// Don't check again for 1 minute - will get reset if we get a reply
	Update.set('runtime.force', force);
	window.setTimeout(function(){
		var s = document.createElement('script');
		s.setAttribute('type', 'text/javascript');
		s.className = 'golem-script-version';
		s.src = Update.temp.check + '?random=' + Date.now();
		document.getElementsByTagName('head')[0].appendChild(s);
	}, 100);
};

/***** Update.update() *****
1a. If it's more than 6 hours since our last check, then ask for the latest version file from the server
1b. In case of bad connection, say it's 6 hours - 1 minutes since we last checked
2. Check if there's a version response on the page
3a. If there's a response then parse it and clear it - remember the new numbers
3b. Display a notification if there's a new version
4. Set a reminder if there isn't
*/
Update.update = function(event) {
	if (Date.now() - this.runtime.lastcheck > 21600000) {// 6+ hours since last check (60x60x6x1000ms)
		this.checkVersion(false);
	}
	if (this.runtime.version > this.temp.version || (!isRelease && this.runtime.revision > this.temp.revision)) {
		console.log(log(), 'New version available: ' + this.runtime.version + '.' + this.runtime.revision + ', currently on ' + version + '.' + revision);
		if (this.runtime.version > this.temp.version) {
			$('#golem_buttons').after('<div class="golem-button golem-info green" title="' + this.runtime.version + '.' + this.runtime.revision + ' released, currently on ' + version + '.' + revision + '"><a href="' + this.temp.url_1 + '">New Version Available</a></div>');
		}
		if (!isRelease && this.runtime.revision > this.temp.revision) {
			$('#golem_buttons').after('<div class="golem-button golem-info green" title="' + this.runtime.version + '.' + this.runtime.revision + ' released, currently on ' + version + '.' + revision + '"><a href="' + this.temp.url_2 + '">New Beta Available</a></div>');
		}
		this.temp.version = this.runtime.version;
		this.temp.revision = this.runtime.revision;
	}
};


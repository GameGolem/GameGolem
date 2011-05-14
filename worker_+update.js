/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page, Queue, Resources,
	Battle, Generals, LevelUp, Player,
	APP, APPID, log, debug, userID, imagepath, isRelease:true, version, revision, Workers, PREFIX, window, browser, GM_xmlhttpRequest,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, Divisor, length, sum, findInObject, objectIndex, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
	makeImage
*/
/********** Worker.Update **********
* Checks if there's an update to the script, and lets the user update if there is.
*/
var Update = new Worker('Update');
Update.data = Update.option = null;

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
	this.set(['temp','version'], version);
	this.set(['temp','revision'], revision);
	this.set(['runtime','version'], this.runtime.version || version);
	this.set(['runtime','revision'], this.runtime.revision || revision);
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
	Config.addButton({
		id:'golem_icon_update',
		image:'update',
		title:'Check for Update',
		click:function(){
			$(this).addClass('red');
			Update.checkVersion(true);
		}
	});
	if (isRelease) { // Add an advanced "beta" button for official release versions
		Config.addButton({
			id:'golem_icon_beta',
			image:'beta',
			title:'Check for Beta Versions',
			advanced:true,
			click:function(){
				isRelease = false;// Isn't persistant, so nothing visible to the user except the beta release
				$(this).addClass('red');
				Update.checkVersion(true);
			}
		});
	}
	// Add a changelog advanced button
	Config.addButton({
		image:'log',
		advanced:true,
		className:'blue',
		title:'Changelog',
		click:function(){
			window.open('http://code.google.com/p/game-golem/source/list', '_blank'); 
		}
	});
	// Add a wiki button
	Config.addButton({
		image:'wiki',
		className:'blue',
		title:'GameGolem wiki',
		click:function(){
			window.open('http://code.google.com/p/game-golem/wiki/castle_age', '_blank'); 
		}
	});
	$('head').bind('DOMNodeInserted', function(event){
		if (event.target.nodeName === 'META' && $(event.target).attr('name') === 'golem-version') {
			tmp = $(event.target).attr('content').regex(/(\d+\.\d+)\.(\d+)/);
			if (tmp) {
				Update._remind(21600, 'check');// 6 hours
				Update.set(['runtime','lastcheck'], Date.now());
				Update.set(['runtime','version'], tmp[0]);
				Update.set(['runtime','revision'], tmp[1]);
				if (Update.get(['runtime','force']) && Update.get(['temp','version'], version) >= tmp[0] && (isRelease || Update.get(['temp','revision'], revision) >= tmp[1])) {
					$('<div class="golem-button golem-info red">No Update Found</div>').animate({'z-index':0}, {duration:5000,complete:function(){$(this).remove();} }).insertAfter('#golem_buttons');
				}
				Update.set(['runtime','force'], false);
				$('#golem_icon_update,#golem_icon_beta').removeClass('red');
			}
			event.stopImmediatePropagation();
			$('script.golem-script-version').remove();
			$(event.target).remove();
			return false;
		}
	});
	if (this.runtime.current !== (version + revision)) {
		this.set(['runtime','installed'], Date.now());
		this.set(['runtime','current'], version + revision);
	}
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
	if (event.type === 'reminder') {
		this.checkVersion(false);
	}
	if (event.type === 'init' || event.type === 'reminder') {
		var now = Date.now(), age = (now - this.runtime.installed) / 1000, time = (now - this.runtime.lastcheck) / 1000;
		if (age <= 21600) {time += 3600;}		// Every hour for 6 hours
		else if (age <= 64800) {time += 7200;}	// Every 2 hours for another 12 hours (18 total)
		else if (age <= 129600) {time += 10800;}// Every 3 hours for another 18 hours (36 total)
		else if (age <= 216000) {time += 14400;}// Every 4 hours for another 24 hours (60 total)
		else {time += 21600;}					// Every 6 hours normally
		this._remind(Math.max(0, time), 'check');
	}
	if (this.runtime.version > this.temp.version || (!isRelease && this.runtime.revision > this.temp.revision)) {
		log(LOG_INFO, 'New version available: ' + this.runtime.version + '.' + this.runtime.revision + ', currently on ' + version + '.' + revision);
		if (this.runtime.version > this.temp.version) {
			$('#golem_buttons').after('<div class="golem-button golem-info green" title="' + this.runtime.version + '.' + this.runtime.revision + ' released, currently on ' + version + '.' + revision + '"><a href="' + this.temp.url_1 + '">New Version Available</a></div>');
		}
		if (!isRelease && this.runtime.revision > this.temp.revision) {
			$('#golem_buttons').after('<div class="golem-button golem-info green" title="' + this.runtime.version + '.' + this.runtime.revision + ' released, currently on ' + version + '.' + revision + '"><a href="' + this.temp.url_2 + '">New Beta Available</a></div>');
		}
		this.set(['temp','version'], this.runtime.version);
		this.set(['temp','revision'], this.runtime.revision);
	}
};


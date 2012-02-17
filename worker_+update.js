/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Workers, Config,
	APP, APPID, PREFIX, userID, imagepath,
	isRelease:true, version, revision, window, browser,
	LOG_ERROR, LOG_WARN, LOG_LOG, LOG_INFO, LOG_DEBUG, log,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	isArray, isFunction, isNumber, isObject, isString, isWorker
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
	if (browser === 'chrome') {
		Update.temp.check = 'http://game-golem.googlecode.com/svn/trunk/chrome/_version.js';
		Update.temp.url_1 = 'http://game-golem.googlecode.com/svn/trunk/chrome/GameGolem.release.crx'; // Release
		Update.temp.url_2 = 'http://game-golem.googlecode.com/svn/trunk/chrome/GameGolem.crx'; // Beta
	} else {
		// No easy way to check if we're Greasemonkey now as it behaves just like a bookmarklet
		Update.temp.check = 'http://game-golem.googlecode.com/svn/trunk/greasemonkey/_version.js';
		Update.temp.url_1 = 'http://game-golem.googlecode.com/svn/trunk/greasemonkey/GameGolem.release.user.js'; // Release
		Update.temp.url_2 = 'http://game-golem.googlecode.com/svn/trunk/greasemonkey/GameGolem.user.js'; // Beta
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
		var tmp;
		if (event.target.nodeName === 'META' && $(event.target).attr('name') === 'golem-version') {
			tmp = $(event.target).attr('content').regex(/(\d+\.\d+)\.(\d+)/);
			if (tmp) {
				Update._remind(21600, 'check');// 6 hours
				Update.set(['runtime','lastcheck'], Date.now());
				Update.set(['runtime','version'], tmp[0]);
				Update.set(['runtime','revision'], tmp[1]);
				if (Update.get(['runtime','force']) && Update.get(['temp','version'], version) >= tmp[0] && (isRelease || Update.get(['temp','revision'], revision) >= tmp[1])) {
					$('<div class="golem-button golem-info red" style="passing:4px;">No Update Found</div>').animate({'z-index':0}, {duration:5000,complete:function(){$(this).remove();} }).appendTo('#golem_info');
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
	if (this.runtime.current !== (version + '.' + revision)) {
		this.set(['runtime','installed'], Date.now());
		this.set(['runtime','current'], version + '.' + revision);
	}
};

Update.checkVersion = function(force) {
	var now = Date.now();
	// Don't check again for 1 minute - will get reset if we get a reply
	Update.set('runtime.lastcheck', now - (6*60+1)*60*1000);
	Update.set('runtime.force', force);
	window.setTimeout(function() {
		var s = document.createElement('script');
		s.setAttribute('type', 'text/javascript');
		s.className = 'golem-script-version';
		s.src = Update.temp.check + '?random=' + now;
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
Update.update = function(event, events) {
	var now = Date.now(), age, time;

	if (events.findEvent(null, 'reminder')) {
		this.checkVersion(false);
	}

	if (events.findEvent(null, 'init') || events.findEvent(null, 'reminder')) {
		age = now - this.runtime.installed;
		time = now - this.runtime.lastcheck;
		if (age <= 6*60*60*1000) {
			// Every hour for 6 hours
			time += 60*60*1000;
		} else if (age <= (1+2)*6*60*60*1000) {
			// Every 2 hours for another 12 hours (18 total)
			time += 2*60*60;
		} else if (age <= (1+2+3)*6*60*60*1000) {
			// Every 3 hours for another 18 hours (36 total)
			time += 3*60*60*1000;
		} else if (age <= (1+2+3+4)*6*60*60*1000) {
			// Every 4 hours for another 24 hours (60 total)
			time += 4*60*60*1000;
		} else {
			// Every 6 hours normally
			time += 6*60*60*1000;
		}
		this._remindMs(Math.max(1000, time), 'check');
	}

	if (this.runtime.version > this.temp.version
	  || (!isRelease && this.runtime.revision > this.temp.revision)
	) {
		log(LOG_INFO, 'New version available: ' + this.runtime.version + '.' + this.runtime.revision + ', currently on ' + this.runtime.current);
		if (this.runtime.version > this.temp.version) {
			$('#golem_info').append('<div class="golem-button golem-info green" title="' + this.runtime.version + '.' + this.runtime.revision + ' released, currently on ' + version + '.' + revision + '" style="passing:4px;"><a href="' + this.temp.url_1 + '?' + Date.now() + '">New Version Available</a></div>');
		}
		if (!isRelease && this.runtime.revision > this.temp.revision) {
			$('#golem_info').append('<div class="golem-button golem-info green" title="' + this.runtime.version + '.' + this.runtime.revision + ' released, currently on ' + version + '.' + revision + '" style="passing:4px;"><a href="' + this.temp.url_2 + '?' + Date.now() + '">New Beta Available</a></div>');
		}
		this.set(['temp','version'], this.runtime.version);
		this.set(['temp','revision'], this.runtime.revision);
	}

	return true;
};


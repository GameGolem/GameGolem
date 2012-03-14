/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Workers, Config,
	APP, APPID, PREFIX, userID, imagepath,
	isRelease, version, revision, window, browser,
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
	system:true,
	taint:true
};

Update.runtime = {
	current:'',		// Our current version
	installed:0,	// Date our version was first seen
	latest:'',		// The latest version presented as an update
	updated:0,		// Date the latest version was presented as an update
	lastcheck:0,	// Date we last tried to check for updates
	lastseen:0,		// Date we last successfully checked for updates
	version:0,		// Version of most recently checked update
	revision:0,		// Revision of most recently checked update
	release:null,	// Release flag of most recently checked update
	force:false		// Have we clicked a button, or is it an automatic check
};

Update.temp = {
	version:0,
	revision:0,
	release:null,
	check:'',	// URL to check for new versions
	url_1:'',	// URL to download a release
	url_2:''	// URL to download a beta
};

/***** Update.init() *****
1a. Add a "Update Now" button to the button bar at the top of Config
1b. If running a beta version then add a "beta" button - which makes us pretend to be a beta version before running the update check.
2. On clicking the button set Update.runtime.force to true - so we can work() immediately...
*/
Update.init = function() {
	var now = Date.now(), root;

	this.set(['temp','version'], version);
	this.set(['temp','revision'], revision);
	this.set(['runtime','version'], this.runtime.version || version);
	this.set(['runtime','revision'], this.runtime.revision || revision);

	if (browser === 'chrome') {
		root = 'http://game-golem.googlecode.com/svn/trunk/chrome/';
		Update.temp.check = root + '_version.js';
		Update.temp.url_1 = root + 'GameGolem.release.crx'; // Release
		Update.temp.url_2 = root + 'GameGolem.crx'; // Beta
	} else {
		// No easy way to check if we're Greasemonkey now as it behaves just like a bookmarklet
		root = 'http://game-golem.googlecode.com/svn/trunk/greasemonkey/';
		Update.temp.check = root + '_version.js';
		Update.temp.url_1 = root + 'GameGolem.release.user.js'; // Release
		Update.temp.url_2 = root + 'GameGolem.user.js'; // Beta
	}

	// Add an update button for everyone
	Config.addButton({
		id:'golem_icon_update',
		image:'update',
		title:'Check for Update'
		  + (this.runtime.lastseen ? ' | Last checked: '
		  + new Date(this.runtime.lastseen).format('D M j, Y @ h:ia') : ''),
		click:function() { Update.checkVersion(true); }
	});

	/*
	if (isRelease) {
		// Add an advanced "beta" button for official release versions
		Config.addButton({
			id:'golem_icon_beta',
			image:'beta',
			title:'Check for Beta Versions',
			advanced:true,
			click:function() { Update.checkVersion(true); }
		});
	}
	*/

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

	$('head').bind('DOMNodeInserted', function(event) {
		var now = Date.now(), tmp;
		if (event.target.nodeName === 'META'
		  && $(event.target).attr('name') === 'golem-version'
		) {
			tmp = $(event.target).attr('content').regex(/(\d+\.\d+)\.(\d+)(\s*Release)?/i);
			if (tmp) {
				Update.set(['runtime','lastseen'], now);
				Update.set(['runtime','version'], tmp[0]);
				Update.set(['runtime','revision'], tmp[1]);
				Update.set(['runtime','release'], isString(tmp[2]));

				$('golem_icon_update').attr('title',
				  'Check for Update | Last checked: '
				  + new Date(now).format('D m d, Y @ H:i:s'));
				if (Config.get('option.advanced')
				  || Config.get('option.debug')
				) {
					log(LOG_INFO, '# meta ' + JSON.shallow(tmp,2));
				}
				// force && new
				if (Update.get(['runtime','force'])
				  && (Update.get(['temp','version'], version) > tmp[0]
				  || (Update.get(['temp','version'], version) >= tmp[0]
				  && Update.get(['temp','revision'], revision) > tmp[1])
				  || (isRelease && !Config.get('option.advanced')
				  && !Update.get(['runtime','release'])))
				) {
					// filter out betas for release, non-advanced users
					$('<div class="golem-button golem-info red"'
					  + ' style="passing:4px;">No Update Found</div>')
					  .animate({'z-index':0}, {
					    duration:5000,
					    complete:function(){$(this).remove();}
					  }).appendTo('#golem_info');
				}
				Update.set(['runtime','force'], false);
				Update._remindMs(1, 'recalc'); // shouldn't be needed
			} else {
				log(LOG_INFO, '# no meta version seen at all');
			}
			event.stopImmediatePropagation();
			$('script.golem-script-version').remove();
			$(event.target).remove();
			return false;
		}
	});

	if (this.runtime.current !== (version + '.' + revision)) {
		this.set(['runtime','current'], version + '.' + revision);
		this.set(['runtime','installed'], now);
	}
};

Update.checkVersion = function(force) {
	var now = Date.now(), i,
		last = Math.max(Update.get('runtime.lastcheck', 0, 'number'),
		  Update.get('runtime.lastseen', 0, 'number'));

	$('#golem_icon_update,#golem_icon_beta').addClass('red');

	// Don't allow checking faster than once a minute, ever
	if ((i = last + 60*1000) <= now) {
		Update.set('runtime.lastcheck', now);
		Update.set('runtime.force', force);
		window.setTimeout(function() {
			var s = document.createElement('script');
			log(LOG_INFO, '# -----[ CHECKING SCRIPT VERSION STATUS NOW ]-----');
			s.setAttribute('type', 'text/javascript');
			s.className = 'golem-script-version';
			s.src = Update.temp.check + '?random=' + now;
			document.getElementsByTagName('head')[0].appendChild(s);
		}, 1);
	} else {
		Update._remindMs(i - now, 'throttle');
	}
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
	var now = Date.now(), i, next = now,
		inst = this.get('runtime.installed', 0, 'number'),
		updt = this.get('runtime.updated', 0, 'number'),
		last = this.get('runtime.lastcheck', 0, 'number'),
		seen = this.get('runtime.lastseen', 0, 'number'),
		base = Math.max(last, seen),
		age = now - Math.max(inst, updt);

	if (events.findEvent(null, 'reminder', 'check')) {
		this.checkVersion(false);
	}

	if ((i = base + 60*1000) > now) {
		$('#golem_icon_update,#golem_icon_beta').addClass('red');
		Update._remindAt(i, 'throttle');
	} else {
		$('#golem_icon_update,#golem_icon_beta').removeClass('red');
	}

	if (age <= 6*60*60*1000) {
		// Every hour for 6 hours
		log(LOG_INFO, '# on hourly checks');
		next = base + 1*60*60*1000;
	} else if (age <= (1+2)*6*60*60*1000) {
		// Every 2 hours for another 12 hours (18 total)
		log(LOG_INFO, '# on 2-hour checks');
		next = base + 2*60*60*1000;
	} else if (age <= (1+2+3)*6*60*60*1000) {
		// Every 3 hours for another 18 hours (36 total)
		log(LOG_INFO, '# on 3-hour checks');
		next = base + 3*60*60*1000;
	} else if (age <= (1+2+3+4)*6*60*60*1000) {
		// Every 4 hours for another 24 hours (60 total)
		log(LOG_INFO, '# on 4-hour checks');
		next = base + 4*60*60*1000;
	} else {
		// Every 6 hours normally
		log(LOG_INFO, '# default 6-hour checks');
		next = base + 6*60*60*1000;
	}

	this._remindMs(Math.max(1000, next - now), 'check');

	if (this.runtime.version > this.temp.version
	  || (this.runtime.version >= this.temp.version
	  && this.runtime.revision > this.temp.revision)
	) {
		log(LOG_INFO, 'New version available: '
		  + this.runtime.version + '.' + this.runtime.revision
		  + ' ' + (this.runtime.release ? 'Release' : 'Beta')
		  + ', currently on ' + this.runtime.current);
		if (this.runtime.release) {
			$('#golem_info').append('<div class="golem-button golem-info green"'
			  + ' title="' + this.runtime.version + '.' + this.runtime.revision
			  + ' release, currently on ' + version + '.' + revision + '"'
			  + ' style="passing:4px;">'
			  + '<a href="' + this.temp.url_1 + '?' + now + '">'
			  + 'New Release Available</a></div>');
		} else if (!isRelease || Config.option.advanced) {
			$('#golem_info').append('<div class="golem-button golem-info green"'
			  + ' title="' + this.runtime.version + '.' + this.runtime.revision
			  + ' beta, currently on ' + version + '.' + revision + '"'
			  + ' style="passing:4px;">'
			  + '<a href="' + this.temp.url_2 + '?' + now + '">'
			  + 'New Beta Available</a></div>');
		}
		this.set(['temp','version'], this.runtime.version);
		this.set(['temp','revision'], this.runtime.revision);
		this.set(['temp','release'], this.runtime.release);

		if (this.runtime.latest !== (i = this.temp.version + '.' + this.temp.revision)) {
			this.set(['runtime','latest'], i);
			this.set(['runtime','updated'], now);
		}
	}

	return true;
};


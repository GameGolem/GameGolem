/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page, Queue, Resources,
	Battle, Generals, LevelUp, Player,
	APP, APPID, log, debug, userID, imagepath, isRelease:true, version, revision, Workers, PREFIX, Images, window, isGreasemonkey, GM_xmlhttpRequest,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, shortNumber, WorkerByName, WorkerById, Divisor, length, unique, deleteElement, sum, addCommas, findInArray, findInObject, objectIndex, sortObject, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime, ucfirst, ucwords,
	makeImage
*/
/********** Worker.Update **********
* Checks if there's an update to the script, and lets the user update if there is.
*/
var Update = new Worker('Update');
Update.data = null;
Update.option = null;

Update.settings = {
	system:true
};

Update.runtime = {
	lastcheck:0,// Date.now() = time since last check
	version:0,// Last ones we saw in a check
	revision:0,
	force:false// Have we clicked a button, or is it an automatic check
};

/***** Update.init() *****
1a. Add a "Update Now" button to the button bar at the top of Config
1b. If running a beta version then add a "beta" button - which makes us pretend to be a beta version before running the update check.
2. On clicking the button set Update.runtime.force to true - so we can work() immediately...
*/
Update.init = function() {
	this.runtime.version = this.runtime.version || version;
	this.runtime.revision = this.runtime.revision || revision;
	$('head').append('<meta name="golem-version" content="">');// Blank if we're not looking
	var $btn = $('<img class="golem-button golem-version" name="Check for Updates" src="' + (isRelease ? Images.update : Images.beta) + '">').click(function(){
		$(this).addClass('red');
		Update.runtime.lastcheck = 0;
		Update.runtime.force = true;
		Update.update();
	});
	$('#golem_buttons').append($btn);
	if (isRelease) { // Add an advanced "beta" button for official release versions
		$btn = $('<img class="golem-button golem-version golem-advanced"' + (Config.get('option.advanced') ? '' : ' style="display:none;"') + ' name="Check for Beta Versions" src="' + Images.beta + '">').click(function(){
			$(this).addClass('red');
			isRelease = false;// Isn't persistant, so nothing visible to the user except the beta release
			Update.runtime.lastcheck = 0;
			Update.runtime.force = true;
			Update.update();
		});
		$('#golem_buttons').append($btn);
	}
	this._remind(Math.max(0, (21600000 - (Date.now() - this.runtime.lastcheck)) / 1000), 'check');// 6 hours max
};

/***** Update.update() *****
1a. If it's more than 6 hours since our last check, then ask for the latest version file from the server
1b. In case of bad connection, say it's 6 hours - 1 minutes since we last checked
2. Check if there's a version response on the page
3a. If there's a response then parse it and clear it - remember the new numbers
3b. Display a notification if there's a new version
4. Set a reminder if there isn't
*/
Update.update = function(type,worker) {
	if (Date.now() - this.runtime.lastcheck > 21600000) {// 6+ hours since last check (60x60x6x1000ms)
		this.runtime.lastcheck = Date.now() - 21600000 + 60000;// Don't check again for 1 minute - will get reset if we get a reply
		this._revive(5, 'check');// every 5 seconds
		window.setTimeout(function(){
			var script = document.createElement('script');
			script.setAttribute('type', 'text/javascript');
			script.src = 'http://game-golem.googlecode.com/svn/trunk/_version.js';
			document.getElementsByTagName('head')[0].appendChild(script);
		}, 100);
	}
	var result = $('meta[name="golem-version"]').attr('content').regex(/([0-9]+\.[0-9]+)\.([0-9]+)/);
	if (result) {
		debug('Version result: ' + result.toSource());
		$('meta[name="golem-version"]').attr('content', '');
		this._forget('check');
		this._remind(21600, 'check');// 6 hours
		this.runtime.lastcheck = Date.now();
		this.runtime.version = result[0];
		this.runtime.revision = result[1];
		if (this.runtime.version <= version && (isRelease || this.runtime.revision <= revision)) {
			if (this.runtime.force) {
				$btn = $('<div class="golem-button golem-info red">No Update Found</div>').animate({'z-index':0}, {
					duration:5000,
					complete:function(){$(this).remove();}
				});
				$('#golem_buttons').after($btn);
			}
		} else {
			log('New version available: ' + this.runtime.version + '.' + this.runtime.revision + ', currently on ' + version + '.' + revision);
			if (isGreasemonkey) { // Firefox
				if (this.runtime.version > version) {
					$('#golem_buttons').after('<div class="golem-button golem-info green" title="' + this.runtime.version + ' released, currently on ' + version + '"><a href="http://game-golem.googlecode.com/svn/trunk/_release.user.js">New Version Available</a></div>');
				}
				if (!isRelease && this.runtime.revision > revision) {
					$('#golem_buttons').after('<div class="golem-button golem-info green" title="r' + this.runtime.revision + ' released, currently on r' + revision + '"><a href="http://game-golem.googlecode.com/svn/trunk/_normal.user.js">New Beta Available</a></div>');
                                        $('#golem_buttons').after('<div class="golem-button golem-info green" title="change_log"><a href="http://code.google.com/p/game-golem/source/detail?r=' + this.runtime.revision +'"target="_blank">Read Change Log HERE</a></div>');
				}
			} else { // Chrome
				$('#golem_buttons').after('<div class="golem-button golem-info green" title="' + this.runtime.version + '.' + this.runtime.revision + ' released, currently on ' + version + '.' + revision + '"><a href="http://game-golem.googlecode.com/svn/trunk/chrome/GameGolem.crx">New Version Available</a></div>');
			}
		}
		this.runtime.force = false;
		$('.golem-version').removeClass('red');
	}
};


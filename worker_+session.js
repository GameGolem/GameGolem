/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page, Queue, Resources,
	Battle, Generals, LevelUp, Player,
	APP, APPID, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, Divisor, length, sum, findInObject, objectIndex, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
	makeImage
*/
/********** Worker.Session **********
* Deals with multiple Tabs/Windows being open at the same time...
*/
var Session = new Worker('Session');
Session.runtime = null; // Don't save anything except global stuff
Session._rootpath = false; // Override save path so we don't get limited to per-user

Session.settings = {
	system:true,
	keep:true,// We automatically load when needed
	taint:true
};

Global.display.push({
//	advanced:true,
	title:'Multiple Tabs / Windows',
	group:[
		{
			id:['Session','option','timeout'],
			label:'Forget After',
			select:{5000:'5 Seconds', 10000:'10 Seconds', 15000:'15 Seconds', 20000:'20 Seconds', 25000:'25 Seconds', 30000:'30 Seconds'},
			help:'When you have multiple tabs open this is the length of time after closing all others that the Enabled/Disabled warning will remain.'
		}
	]
});

Session.option = {
	timeout:15000 // How long to give a tab to update itself before deleting it (ms)
};

Session.data = { // Shared between all windows
	_active:null, // Currently active session
	_sessions:{}, // List of available sessions
	_timestamps:{} // List of all last-saved timestamps from all workers
};

Session.temp = {
	active:false, // Are we the active tab (able to do anything)?
	warning:null, // If clicking the Disabled button when not able to go Enabled
	_id:null
};

Session.setup = function() {
	if (Global.get(['option','session'], false)) {
		this.set(['option','timeout'], Global.get(['option','session','timeout'], this.option.timeout));
		Global.set(['option','session']);
	}
	try {
		if (!(Session.temp._id = sessionStorage.getItem('golem.'+APP))) {
			sessionStorage.setItem('golem.'+APP, Session.temp._id = '#' + Date.now());
		}
	} catch(e) {// sessionStorage not available
		Session.temp._id = '#' + Date.now();
	}
};

/***** Session.init() *****
3. Add ourselves to this.data._sessions with the _active time
4. If no active worker (in the last 2 seconds) then make ourselves active
4a. Set this.temp.active, this.data._active, and immediately call this._save()
4b/5. Add the "Enabled/Disabled" button, hidden if necessary (hiding other elements if we're disabled)
6. Add a click handler for the Enable/Disable button
6a. Button only works when either active, or no active at all.
6b. If active, make inactive, update this.temp.active, this.data._active and hide other elements
6c. If inactive , make active, update this.temp.active, this.data._active and show other elements (if necessary)
7. Add a repeating reminder for every 1 second
*/
Session.init = function() {
	var now = Date.now();
	this.set(['data','_sessions',this.temp._id], now);
	$('.golem-title').after('<div id="golem_session" class="golem-info golem-theme-button green" style="display:none;">Enabled</div>');
	if (!this.data._active || typeof this.data._sessions[this.data._active] === 'undefined' || this.data._sessions[this.data._active] < now - this.option.timeout || this.data._active === this.temp._id) {
		this._set(['temp','active'], true);
		this._set(['data','_active'], this.temp._id);
		this._save('data');// Force it to save immediately - reduce the length of time it's waiting
	} else {
		$('#golem_session').html('<b>Disabled</b>').toggleClass('red green').show();
	}
	$('#golem_session').click(function(event){
		Session._unflush();
		if (Session.temp.active) {
			$(this).html('<b>Disabled</b>').toggleClass('red green');
			Session._set(['data','_active'], null);
			Session._set(['temp','active'], false);
		} else if (!Session.data._active || typeof Session.data._sessions[Session.data._active] === 'undefined' || Session.data._sessions[Session.data._active] < Date.now() - option.timeout) {
			$(this).html('Enabled').toggleClass('red green');
			Queue.set(['runtime','current']);
			Session._set(['data','_active'], Session.temp._id);
			Session._set(['temp','active'], true);
		} else {// Not able to go active
			Queue.set(['runtime','current']);
			$(this).html('<b>Disabled</b><br><span>Another instance running!</span>');
			if (!Session.temp.warning) {
				(function(){
					if ($('#golem_session span').length) {
						if ($('#golem_session span').css('color').indexOf('255') === -1) {
							$('#golem_session span').animate({'color':'red'},200,arguments.callee);
						} else {
							$('#golem_session span').animate({'color':'black'},200,arguments.callee);
						}
					}
				})();
			}
			window.clearTimeout(Session.temp.warning);
			Session.temp.warning = window.setTimeout(function(){if(!Session.temp.active){$('#golem_session').html('<b>Disabled</b>');}Session.temp.warning=null;}, 3000);
		}
		Session._save('data');
	});
	$(window).unload(function(){Session.update({type:'unload'});}); // Not going via _update
	this._revive(1); // Call us *every* 1 second - not ideal with loads of Session, but good enough for half a dozen or more
	Title.alias('disable', 'Session:temp.active::(Disabled) ');
};

/***** Session.update() *****
1. Update the timestamps in data._timestamps[type][worker]
2. Replace the relevant datatype with the updated (saved) version if it's newer
*/
Session.updateTimestamps = function() {
	var i, j, _old, _new, _ts;
	for (i in Workers) {
		if (i !== this.name) {
			for (j in Workers[i]._datatypes) {
				if (Workers[i]._datatypes[j]) {
					this.data._timestamps[j] = this.data._timestamps[j] || {};
					_ts = this.data._timestamps[j][i] || 0;
					if (Workers[i]._timestamps[j] === undefined) {
						Workers[i]._timestamps[j] = _ts;
					} else if (_ts > Workers[i]._timestamps[j]) {
						log(LOG_DEBUG, 'Need to replace '+i+'.'+j+' with newer data');
						_old = Workers[i][j];
						Workers[i]._load(j);
						_new = Workers[i][j];
						Workers[i][j] = _old;
						Workers[i]._replace(j, _new);
						Workers[i]._timestamps[j] = _ts;
					}
					this.data._timestamps[j][i] = Workers[i]._timestamps[j];
				}
			}
		}
	}
};

/***** Session.update() *****
1. We don't care about any data, only about the regular reminder we've set, so return if not the reminder
2. Update data._sessions[id] to Date.now() so we're not removed
3. If no other open instances then make ourselves active (if not already) and remove the "Enabled/Disabled" button
4. If there are other open instances then show the "Enabled/Disabled" button
*/
Session.update = function(event) {
	var i, l, now = Date.now();
	if (event.type !== 'reminder' && event.type !== 'unload') {
		return;
	}
	this._load('data');
	if (event.type === 'unload') {
		Queue._forget('run'); // Make sure we don't do anything else
		for (i in Workers) { // Make sure anything that needs saving is saved
			for (l in Workers[i]._taint) {
				if (Workers[i]._taint[l]) {
					Workers[i]._save(l);
				}
			}
			for (l in Workers[i]._reminders) {
				if (/^i/.test(l)) {
					window.clearInterval(Workers[i]._reminders[l]);
				} else if (/^t/.test(l)) {
					window.clearTimeout(Workers[i]._reminders[l]);
				}
			}
		}
		this.data._sessions[this.temp._id] = 0;
		if (this.data._active === this.temp._id) {
			this.data._active = null;
		}
		this.temp.active = false;
	} else {
		this.data._sessions[this.temp._id] = now;
	}
	now -= this.option.timeout;
	for(i in this.data._sessions) {
		if (this.data._sessions[i] < now) {
			this.data._sessions[i] = undefined;
		}
	}
	l = length(this.data._sessions);
	if (l === 1) {
		if (!this.temp.active) {
			this.updateTimestamps();
			$('#golem_session').stop().css('color','black').html('Enabled').addClass('green').removeClass('red');
			this.data._active = this.temp._id;
			this.set(['temp','active'], true);
		}
		$('#golem_session').hide();
	} else if (l > 1) {
		this.updateTimestamps();
		$('#golem_session').show();
	}
	this._taint.data = true;
	this._save('data');
};

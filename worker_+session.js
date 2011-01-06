/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page, Queue, Resources,
	Battle, Generals, LevelUp, Player,
	APP, APPID, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, Divisor, length, unique, deleteElement, sum, findInArray, findInObject, objectIndex, sortObject, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
	makeImage
*/
/********** Worker.Session **********
* Deals with multiple Tabs/Windows being open at the same time...
*/
var Session = new Worker('Session');
Session.runtime = Session.option = null; // Don't save anything except global stuff
Session._rootpath = false; // Override save path so we don't get limited to per-user

Session.settings = {
	system:true,
	keep:true,// We automatically load when needed
	taint:true
};

Session.data = { // Shared between all windows
	_active:null, // Currently active session
	_sessions:{} // List of available sessions
};

Session.temp = {
	active:false, // Are we the active tab (able to do anything)?
	_id:null
};

Session.timeout = 15000; // How long to give a tab to update itself before deleting it (15 seconds)
Session.warning = null;// If clicking the Disabled button when not able to go Enabled

Session.setup = function() {
	try {
		if (!(Session.temp._id = sessionStorage['golem.'+APP])) {
			sessionStorage['golem.'+APP] = Session.temp._id = '#' + Date.now();
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
	$('.golem-title').after('<div id="golem_session" class="golem-info golem-button green" style="display:none;">Enabled</div>');
	if (!this.data._active || typeof this.data._sessions[this.data._active] === 'undefined' || this.data._sessions[this.data._active] < now - this.timeout || this.data._active === this.temp._id) {
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
		} else if (!Session.data._active || typeof Session.data._sessions[Session.data._active] === 'undefined' || Session.data._sessions[Session.data._active] < Date.now() - Session.timeout) {
			$(this).html('Enabled').toggleClass('red green');
			Queue.clearCurrent();// Make sure we deal with changed circumstances
			Session._set(['data','_active'], Session.temp._id);
			Session._set(['temp','active'], true);
		} else {// Not able to go active
			Queue.clearCurrent();
			$(this).html('<b>Disabled</b><br><span>Another instance running!</span>');
			if (!Session.warning) {
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
			window.clearTimeout(Session.warning);
			Session.warning = window.setTimeout(function(){if(!Session.temp.active){$('#golem_session').html('<b>Disabled</b>');}Session.warning=null;}, 3000);
		}
		Session._save('data');
	});
	this._revive(1); // Call us *every* 1 second - not ideal with loads of Session, but good enough for half a dozen or more
	Title.alias('disable', 'Session:temp.active::(Disabled) ');
};

/***** Session.update() *****
1. We don't care about any data, only about the regular reminder we've set, so return if not the reminder
2. Update the data[id] to now() so we're not removed
3. If no other open instances then make ourselves active (if not already) and remove the "Enabled/Disabled" button
4. If there are other open instances then show the "Enabled/Disabled" button
*/
Session.update = function(event) {
	if (event.type !== 'reminder') {
		return;
	}
	var i, j, _old, _new, _ts, now = Date.now();
	this._load('data');
	this.set(['data','_sessions',this.temp._id], now);
	for(i in this.data._sessions) {
		if (this.data._sessions[i] < (now - this.timeout)) {
			this.set(['data','_sessions',i]);
		}
	}
	for (i in Workers) {
		if (i !== this.name) {
			for (j in Workers[i]._datatypes) {
				if (Workers[i]._datatypes[j]) {
					_ts = this.get(['data','_timestamps',j,i], 0);
					if (Workers[i]._timestamps[j] === undefined) {
						Workers[i]._timestamps[j] = _ts;
					} else if (_ts > Workers[i]._timestamps[j]) {
//						console.log(log('Need to replace '+i+'.'+j+' with newer data'));
						_old = Workers[i][j];
						Workers[i]._load(j);
						_new = Workers[i][j];
						Workers[i][j] = _old;
						Workers[i]._replace(j, _new);
						Workers[i]._timestamps[j] = _ts;
					}
					this.set(['data','_timestamps',j,i], Workers[i]._timestamps[j]);
				}
			}
		}
	}
	i = length(this.data._sessions);
	if (i === 1) {
		if (!this.temp.active) {
			$('#golem_session').stop().css('color','black').html('Enabled').addClass('green').removeClass('red');
//			Queue.clearCurrent();// Make sure we deal with changed circumstances
			this._set('data._active', this.temp._id);
			this._set('temp.active', true);
		}
		$('#golem_session').hide();
	} else if (i > 1) {
		$('#golem_session').show();
	}
	this._save('data');
};

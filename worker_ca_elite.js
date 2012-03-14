/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Workers, Army, Dashboard, Page, // Config, History, Queue,
	//Battle, Generals, LevelUp, Player,
	APP, APPID, APPID_, PREFIX, userID, imagepath,
	isRelease, version, revision, window, browser,
	LOG_ERROR, LOG_WARN, LOG_LOG, LOG_INFO, LOG_DEBUG, log,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	isArray, isFunction, isNumber, isObject, isString, isWorker,
	makeTime
*/
/********** Worker.Elite() **********
* Build your elite army
*/
var Elite = new Worker('Elite');
Elite.data = Elite.temp = null;

Elite.settings = {
	taint:true
};

Elite.defaults['castle_age'] = {
	pages:'* keep_eliteguard army_viewarmy'
};

Elite.option = {
	every:12,
	friends:true,
	armyperpage:25 // Read only, but if they change it and I don't notice...
};

Elite.runtime = {
	waitelite:0,
	nextelite:0
};

Elite.display = [
	{
		id:'friends',
		label:'Facebook Friends Only',
		checkbox:true
	},{
		id:'every',
		label:'Check Every',
		select:[1, 2, 3, 6, 12, 24],
		after:'hours',
		help:'Although people can leave your Elite Guard after 24 hours, after 12 hours you can re-confirm them'
	}
];

Elite.menu = function(worker, key) {
	if (worker === this) {
		if (!key) {
			return ['fill:Fill Elite Guard Now'];
		} else if (key === 'fill') {
			this.set('runtime.waitelite', 0);
		}
	}
};

Elite.page = function(page, change) {
	if (page === 'keep_eliteguard') {
		var i, txt, uid, el = $('span.result_body'), now = Date.now();
		uid = $('#'+APPID_+'app_body a[href*="facebook.com/profile.php?id="]').attr('href').regex(/id=(\d+)$/i);
		for (i=0; i<el.length; i++) {
			txt = $(el[i]).text().trim(true);
//			if (txt.match(/Elite Guard, and they have joined/i)) {
			if (txt.match(/You've joined /i)) {
				log(LOG_INFO, 'Added ' + Army.get(['Army', uid, 'name'], uid) + ' to Elite Guard');
				Army.set(['Elite',uid, 'elite'], now + 24*60*60*1000);
			} else if (txt.match(/'s Elite Guard is FULL!/i)) {
				log(LOG_INFO, Army.get(['Army', uid, 'name'], uid) + '\'s Elite Guard is full');
				Army.set(['Elite',uid, 'full'], now + 30*60*1000);
			} else if (txt.match(/Sorry: You must be in Facebook User's Army to join their Elite Guard!/i)) {
				log(LOG_INFO, Army.get(['Army', uid, 'name'], uid) + ' is not in your army so can\'t join your Elite Guard');
				Army.set(['Army',uid,'member']);
			} else if (txt.match(/YOUR Elite Guard is FULL!/i)) {
				log(LOG_INFO, 'Elite guard full, wait '+Elite.option.every+' hours');
				this.set(['runtime','waitelite'], now);
			} else { //something weird - move on
				log(LOG_INFO, Army.get(['Army', uid, 'name'], uid) + 'couldn\'t join for some reason');
				Army.set(['Elite',uid, 'full'], now + 30*60*1000);
			}
			if (this.runtime.nextelite === uid) {
				this.set(['runtime','nextelite']);
			}
		}
	} else {
		if ($('input[src*="elite_guard_add"]').length) {
			this.set(['runtime','waitelite'], 0);
		}
	}
	return false;
};

Elite.update = function(event, events) {
	var i, list, check, next = 0, now = Date.now();

	list = Army.get('Elite'); // Try to keep the same guards

	for (i in list) {
		check = list[i].elite || list[i].full || 0;
		if (check < now) {
			Army.set(['Elite',i,'elite']);// Delete the old timers if they exist...
			Army.set(['Elite',i,'full']);// Delete the old timers if they exist...
			if (Army.get(['Army',i,'member'], false)) {
				if (Army.get(['Elite',i,'prefer'], false)) {// Prefer takes precidence
					next = i;
					break;
				}
				if (!next && (!this.option.friends || Army.get(['Army',i,'friend'], false))) { // Only facebook friends unless we say otherwise
					next = i;// Earlier in our army rather than later
				}
			}
		}
	}

	if (!next) {
		list = Army.get('Army');// Otherwise lets just get anyone in the army
		for (i in list) {
			if (!Army.get(['Elite',i])
			  && Army.get(['Army',i,'member'])
			  && (!this.option.friends || Army.get(['Army',i,'friend']))
			) {
				// Only try to add a non-member who's not already added
				next = i;
				break;
			}
		}
	}

	// Make sure we're using a numeric uid
	this.set(['runtime','nextelite'], parseInt(next, 10));
	check = (this.runtime.waitelite || 0) + this.option.every*60*60*1000 - now;
	if (next && check > 0) {
		this._remindMs(check, 'recheck');
	}

	this.set(['option','_sleep'], !next || check > 0);

	Dashboard.status(this, 'Elite Guard: Check'
	  + (check <= 0 ? 'ing now' : ' in ' + Page.addTimer('elite', check, true))
	  + (next ? ', Next: '+Army.get(['Army', next, 'name']) : '')
	);

	return true;
};

Elite.work = function(state) {
	if (state) {
//		log(LOG_LOG, 'Add ' + Army.get(['Army', this.runtime.nextelite, 'name'], this.runtime.nextelite) + ' to Elite Guard');
		Page.to('keep_eliteguard', {twt:'jneg' , jneg:true, user:this.runtime.nextelite}, true);
	}
	return true;
};

Elite.army = function(action, uid) {
	var now = Date.now(), x, y, z;

	switch(action) {
	case 'title':
		return 'Elite';
	case 'show':
		return (Army.get(['Elite',uid])
			? (Army.get(['Elite',uid,'prefer'])
				? '<span class="ui-icon golem-icon golem-icon-star-on" style="display:inline-block;"></span>'
				: '<span class="ui-icon golem-icon golem-icon-star-off" style="display:inline-block;"></span>')
			 + (Army.get(['Elite',uid,'elite'])
				? '<span class="ui-icon ui-icon-check" title="Member until: ' + makeTime(Army.get(['Elite',uid,'elite'])) + '" style="display:inline-block;"></span>'
				: '<span class="ui-icon" style="display:inline-block;"></span>')
			 + (Army.get(['Elite',uid,'full'])
				? '<span class="ui-icon ui-icon-clock" title="Full until: ' + makeTime(Army.get(['Elite',uid,'full'])) + '" style="display:inline-block;"></span>'
				: '<span class="ui-icon" style="display:inline-block;"></span>')
			: (Army.get(['Army',uid,'member'])
				? '<span class="ui-icon golem-icon golem-icon-star-off" style="display:inline-block;"></span>'
				: '<span class="ui-icon" style="display:inline-block;"></span>')
			 + '<span class="ui-icon" style="display:inline-block;"></span><span class="ui-icon" style="display:inline-block;"></span>'
			);
	case 'sort':
		// sorting arranged by preferred flag, elite timer, full timer
		if (!Army.get(['Elite',uid]) && !Army.get(['Army',uid,'member'])) {
			return 0;
		}
		x = Army.get(['Elite',uid,'prefer']);
		y = Army.get(['Elite',uid,'elite'], 0);
		z = Army.get(['Elite',uid,'full'], 0);
		// 1e8 and 1e16 magic numbers simply allow for 24 hours of milliseconds
		// xyyyyyyyyzzzzzzzz
		// ||......|++++++++- full ms delta
		// |++++++++--------- elite ms delta (shifted by 1e8)
		// +----------------- preferred flag (shifted by 1e16)
		if (y) {
			x = (x ? 1e16 : 0) + (y > now ? y-now : 0) * 1e8 + ((x && z > now) ? z-now : 0);
		} else {
			x = (x ? 1e16 : 0) + (1e8-1 - (z > now ? z-now : 0));
		}
		return x;
	case 'click':
		if (uid && Army.get(['Army',uid,'member'])) {
			Army.toggle(['Elite',uid,'prefer']);
		}
		return true;
	}
};


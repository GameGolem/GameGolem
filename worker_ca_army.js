/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page:true, Queue, Resources,
	Battle, Generals, LevelUp, Player,
	APP, APPID, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, Divisor, length, sum, findInObject, objectIndex, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
	makeImage
*/
/********** Worker Army Extension **********
* This fills in your army information by overloading Worker.Army()
* We are only allowed to replace Army.work() and Army.parse() - all other Army functions should only be overloaded if really needed
* This is the CA version
*/
Army.defaults.castle_age = {
	temp:null,

	pages:'keep_stats army_viewarmy',

	// Careful not to hit any *real* army options
	option:{
		invite:false,
		recheck:0,
		auto:true,
		general:true
	},

	runtime:{
		count:-1, // How many people have we actively seen
		page:0, // Next page we want to look at 
		extra:1, // How many non-real army members are there (you are one of them)
		oldest:0, // Timestamp of when we last saw the oldest member
		check:false
	},
	
	display:[
		//Disabled until Army works correctly
		//{
		//	id:'invite',
		//	label:'Auto-Join New Armies',
		//	checkbox:true
		//},
		{
			id:'general',
			label:'Use Idle General',
			checkbox:true
		},{
			title:'Members',
			group:[
				{
					id:'auto',
					label:'Automatically Check',
					checkbox:true
				},{
					id:'recheck',
					label:'Manually Check',
					select:{
						0:'Never',
						86400000:'Daily',
						259200000:'3 Days',
						604800000:'Weekly',
						1209600000:'2 Weekly',
						2419200000:'4 Weekly'
					}
				}
			]
		}
	]
};

Army._overload('castle_age', 'setup', function() {
	this.section('Changed', { // Second column = Info
		'key':'Army',
		'name':'Changed',
		'show':'Changed',
		'label':function(data,uid){
			var time = Math.floor((Date.now() - (data[uid]._info.changed || 0)) / 86400000);
			return data[uid].Army && data[uid]._info.changed ? time<1 ? 'Today' : time + ' Day' + plural(time) + ' Ago' : '-';
		},
		'sort':function(data,uid){
			return data[uid].Army ? data[uid]._info.changed || 0 : null;
		}
	});
});

Army._overload('castle_age', 'init', function() {
	this.runtime.extra = Math.max(1, this.runtime.extra);
	this._watch(Player, 'data.armymax');
//	if (this.runtime.oldest && this.option.recheck) {
//		this._remind(Math.min(1, Date.now() - this.runtime.oldest + this.option.recheck) / 1000, 'recheck');
//	}
	this._parent();
});

Army._overload('castle_age', 'menu', function(worker, key) {
	if (worker === this) {
		if (!key) {
			return ['fill:Check&nbsp;Army&nbsp;Now'];
		} else if (key === 'fill') {
			this.set(['runtime','page'], 1);
			this.set(['runtime','check'], true);
		}
	}
});

Army._overload('castle_age', 'parse', function(change) {
	if (change && Page.page === 'keep_stats' && !$('.keep_attribute_section').length) { // Not our own keep
		var uid = $('.linkwhite a').attr('href').regex(/=(\d+)$/);
//		log('Not our keep, uid: '+uid);
		if (uid && Army.get(['Army', uid], false)) {
			$('.linkwhite').append(' ' + Page.makeLink('army_viewarmy', {action:'delete', player_id:uid}, 'Remove Member [x]'));
		}
	} else if (!change && Page.page === 'army_viewarmy') {
		var i, uid, who, page, start, now = Date.now(), count = 0, tmp, level, parent, spans;
		$tmp = $('table.layout table[width=740] div').first().children();
		page = $tmp.eq(1).html().regex(/\<div[^>]*\>(\d+)\<\/div\>/);
		start = $tmp.eq(2).text().regex(/Displaying: (\d+) - \d+/);
		tmp = $('td > a[href*="keep.php?casuser="]');
		for (i=0; i<tmp.length; i++) {
			try {
				this._transaction(); // BEGIN TRANSACTION
				uid = $(tmp[i]).attr('href').regex(/casuser=(\d*)$/i);
				parent = $(tmp[i]).closest('td').next()
				who = $(parent).find('a').eq(-1).text();
				spans = $(parent).find('span[style]');
				level = $(spans).eq(1).text().regex(/(\d+) Commander/i);
				assert(isNumber(uid) && uid !== userID, 'Bad uid: '+uid);
				this.set(['data',uid,'Army'], true);
				assert(this.set(['data',uid,'_info','name'], $(spans).eq(0).text().replace(/^ *"|"$/g,''), 'string') !== false, 'Bad name: '+uid);
				if (isFacebook) {
					assert(this.set(['data',uid,'_info','fbname'], who, 'string') !== false, 'Bad fbname: '+uid);
				} else { // Gave up trying to fight this thing - thanks non-standard fb:name node type that breaks jQuery...
					assert(this.set(['data',uid,'_info','fbname'], $(parent).find('a.fb_link').text() || 'Facebook User', 'string') !== false, 'Bad fbname: '+uid);
				}
				this.set(['data',uid,'_info','friend'], who !== 'Facebook User');
				if (!this.get(['data',uid,'_info','changed']) || this.get(['data',uid,'_info','level']) !== level) {
					this.set(['data',uid,'_info','changed'], now);
					this.set(['data',uid,'_info','level'], level);
				}
				this.set(['data',uid,'_info','seen'], now);
				this.set(['data',uid,'_info','page'], page);
				this.set(['data',uid,'_info','id'], start + i);
				this._transaction(true); // COMMIT TRANSACTION
//				log('Adding: ' + JSON.stringify(this.get(['data',uid,'_info'])));
			} catch(e) {
				this._transaction(false); // ROLLBACK TRANSACTION on any error
				log(LOG_ERROR, e.name + ' in ' + this.name + '.parse(' + change + '): ' + e.message);
			}
		}
		if (!i) {
			this._set(['runtime','page'], 0);// No real members on this page so stop looking.
			this._set(['runtime','check'], false);
		}
		tmp = $('img[src*="bonus_member.jpg"]');
		if (tmp.length) {
			this.set(['runtime','extra'], 1 + tmp.closest('tr').text().regex('Extra member x(\d+)'));
//			log(LOG_DEBUG, 'Extra Army Members Found: '+Army.runtime.extra);
		}
		for (i in this.data) {
			if (this.data[i].Army) {
				if (!this.data[i]._info || (this.data[i]._info.page === page && this.data[i]._info.seen !== now)) {
					this.set(['data',i,'Army']); // Forget this one, not found on the correct page
				} else {
					count++;// Lets count this one instead
				}
			}
		}
		this._set(['runtime','count'], count);
		if (this.runtime.page) {
			if (page !== this.runtime.page || (!this.runtime.check && Player.get('armymax',0) === (this.runtime.count + this.runtime.extra))) {
				this._set(['runtime','page'], 0);
				this._set(['runtime','check'], false);
			} else {
				this._set(['runtime','page'], page + 1);
			}
		}
//		log(LOG_DEBUG, 'parse: Army.runtime = '+JSON.stringify(this.runtime));
	}
	return this._parent() || true;
});

Army._overload('castle_age', 'update', function(event) {
	this._parent();
	if (!this.option._disabled && event.type !== 'data' && (!this.runtime.page || (this.option.recheck && !this.runtime.oldest))) {
		var i, page = this.runtime.page, army = this.data, ai, now = Date.now(), then = now - this.option.recheck, oldest = this.runtime.oldest;
		if (!page && this.option.auto && Player.get('armymax',0) !== (this.runtime.count + this.runtime.extra)) {
			log(LOG_WARN, 'Army size ('+Player.get('armymax',0)+') does not match cache ('+(this.runtime.count + this.runtime.extra)+'), checking from page 1');
			page = 1;
		}
		if (!page && this.option.recheck) {
			for (i in army) {
				ai = army[i];
				if (ai.Army && ai._info && ai._info.page && ai._info.seen) {
					oldest = Math.min(oldest || Number.MAX_VALUE, ai._info.seen);
					if (!page && ai._info.seen < then) {
						page = Math.min(page || Number.MAX_VALUE, ai._info.page);
					}
				}
			}
			this._set(['runtime','oldest'], oldest);
		}
		this._set(['runtime','page'], page);
//		log(LOG_WARN, 'update('+JSON.shallow(event,1)+'): Army.runtime = '+JSON.stringify(this.runtime));
	}
	this._set(['option','_sleep'], !this.runtime.page);
});

Army._overload('castle_age', 'work', function(state) {
	if (this.runtime.page) {
		if (state && (!this.option.general || Generals.to(Idle.get('option.general','any')))) {
			Page.to('army_viewarmy', {page:this.runtime.page});
		}
		return true;
	}
	return this._parent();
});


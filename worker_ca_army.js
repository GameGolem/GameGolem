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
				this.set(['Army',uid,'member'], true);
				assert(this.set(['Army',uid,'name'], $(spans).eq(0).text().replace(/^ *"|"$/g,''), 'string') !== false, 'Bad name: '+uid);
				if (isFacebook) {
					assert(this.set(['Army',uid,'fbname'], who, 'string') !== false, 'Bad fbname: '+uid);
				} else { // Gave up trying to fight this thing - thanks non-standard fb:name node type that breaks jQuery...
					assert(this.set(['Army',uid,'fbname'], $(parent).find('a.fb_link').text() || 'Facebook User', 'string') !== false, 'Bad fbname: '+uid);
				}
				this.set(['Army',uid,'friend'], who !== 'Facebook User');
				if (!this.get(['Army',uid,'changed']) || this.get(['Army',uid,'level']) !== level) {
					this.set(['Army',uid,'changed'], now);
					this.set(['Army',uid,'level'], level);
				}
				this.set(['Army',uid,'seen'], now);
				this.set(['Army',uid,'page'], page);
				this.set(['Army',uid,'id'], start + i);
				this._transaction(true); // COMMIT TRANSACTION
//				log('Adding: ' + JSON.stringify(this.get(['Army',uid])));
			} catch(e) {
				this._transaction(false); // ROLLBACK TRANSACTION on any error
				log(LOG_ERROR, e.name + ' in ' + this.name + '.parse(' + change + '): ' + e.message);
			}
		}
		if (!i) {
			this._set(['runtime','page'], 0);// No real members on this page so stop looking.
			this._set(['runtime','check'], false);
		}
		tmp = $('img[src*="bonus_member.jpg"]').closest('tr');
		if (tmp.length) {
			this.set(['runtime','extra'], 1 + tmp.text().trim(true).regex(/Extra member x(\d+)/i));
//			log(LOG_DEBUG, 'Extra Army Members Found: '+Army.runtime.extra);
		}
		for (i in this.data.Army) {
			if (this.data.Army[i].member) {
				if (this.get(['Army',i,'page']) === page && this.get(['Army',i,'seen']) !== now) {
					this.set(['Army',i,'member']); // Forget this one, not found on the correct page
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
	if (event.type !== 'data' && (!this.runtime.page || (this.option.recheck && !this.runtime.oldest))) {
		var i, page = this.runtime.page, army = this.get('Army'), s, now = Date.now(), then = now - this.option.recheck, oldest = this.runtime.oldest;
		if (!page && this.option.auto && Player.get('armymax',0) !== (this.runtime.count + this.runtime.extra)) {
			log(LOG_WARN, 'Army size ('+Player.get('armymax',0)+') does not match cache ('+(this.runtime.count + this.runtime.extra)+'), checking from page 1');
			page = 1;
		}
		if (!page && this.option.recheck) {
			for (i in army) {
				s = this.get(['Army',i,'seen']);
				oldest = Math.min(oldest || Number.MAX_VALUE, s);
				if (!page && s < then) {
					page = Math.min(page || Number.MAX_VALUE, this.get(['Army',i,'page']));
					then = s;
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


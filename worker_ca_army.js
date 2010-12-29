/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page:true, Queue, Resources,
	Battle, Generals, LevelUp, Player,
	APP, APPID, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, shortNumber, Divisor, length, unique, deleteElement, sum, addCommas, findInArray, findInObject, objectIndex, sortObject, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime, ucfirst, ucwords,
	makeImage
*/
/********** Worker Army Extension **********
* This fills in your army information by overloading Worker.Army()
* We are only allowed to replace Army.work() and Army.parse() - all other Army functions should only be overloaded if really needed
* This is the CA version
*/
Army.defaults.castle_age = {
	pages:'army_viewarmy',

	// Careful not to hit any *real* army options
	option:{
		invite:false,
		recheck:0,
		general:true
	},

	runtime:{
		count:-1, // How many people have we actively seen
		page:0, // Next page we want to look at 
		extra:0, // How many non-real army members are there
		oldest:0 // Timestamp of when we last saw the oldest member
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
					id:'recheck',
					label:'Re-check Old',
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
			var time = Math.floor((data[uid]._info.seen - data[uid]._info.changed) / 86400000);
			return data[uid]._info.changed ? time<1 ? 'Today' : time + ' Day' + plural(time) + ' Ago' : 'Unknown';
		},
		'sort':function(data,uid){
			return data[uid].Army ? data[uid]._info.changed || null : null;
		}
	});
});

Army._overload('castle_age', 'init', function() {
	this._watch(Player, 'data.armymax');
//	if (this.runtime.oldest && this.option.recheck) {
//		this._remind(Math.min(1, Date.now() - this.runtime.oldest + this.option.recheck) / 1000, 'recheck');
//	}
	this._parent();
});

Army._overload('castle_age', 'parse', function(change) {
	if (!change && Page.page === 'army_viewarmy') {
		var i, page, start, army = this.data = this.data || {}, now = Date.now(), count = 0, $tmp;
		$tmp = $('table.layout table[width=740] div').first().children();
		page = $tmp.eq(1).html().regex(/\<div[^>]*\>([0-9]+)\<\/div\>/);
		start = $tmp.eq(2).text().regex(/Displaying: ([0-9]+) - [0-9]+/);
		$tmp = $('img[linked="true"][size="square"]');
		if ($tmp.length) {
			$tmp.each(function(i,el){
				var uid = parseInt($(el).attr('uid')), who = $(el).parent().parent().parent().next(), army, level;
				if (uid === userID) {// Shouldn't ever happen!
					return;
				}
				army = Army.data[uid] = Army.data[uid] || {};
				army.Army = true;
				army._info = army._info || {};
				army._info.fbname = $('a', who).text();
				army._info.name = $('a', who).next().text().replace(/^ "|"$/g,'');
				army._info.friend = (army._info.fbname === 'Facebook User');
				level = $(who).text().regex(/([0-9]+) Commander/i);
				if (!army._info.changed || army._info.level !== level) {
					army._info.changed = now;
					army._info.level = level;
				}
				army._info.seen = now;
				army._info.page = page;
				army._info.id = start + i;
				Army._taint.data = true;
	//			console.log(warn(), 'Adding: ' + JSON.stringify(army));
			});
		} else {
			this._set(['runtime','page'], 0);// No real members on this page so stop looking.
		}
		$tmp = $('img[src*="bonus_member.jpg"]');
		if ($tmp.length) {
			this.runtime.extra = 1 + $tmp.parent().next().text().regex('Extra member x([0-9]+)');
//			console.log(log(), 'Extra Army Members Found: '+Army.runtime.extra);
		}
		for (i in army) {
			if (army[i].Army) {
				if (!army[i]._info || (army[i]._info.page === page && army[i]._info.seen !== now)) {
					delete army[i].Army;// Forget this one, not found on the correct page
				} else {
					count++;// Lets count this one instead
				}
			}
		}
		this._set(['runtime','count'], count);
		if (this.runtime.page) {
			if (page !== this.runtime.page || Player.get('armymax',0) === (this.runtime.count + this.runtime.extra)) {
				this._set(['runtime','page'], 0);
			} else {
				this._set(['runtime','page'], page + 1);
			}
		}
//		console.log(warn(), 'parse: Army.runtime = '+JSON.stringify(this.runtime));
	}
	return this._parent();
});

Army._overload('castle_age', 'update', function(event) {
	this._parent();
	if (this.option._enabled && event.type !== 'data' && (!this.runtime.page || (this.option.recheck && !this.runtime.oldest))) {
		var i, page = this.runtime.page, army = this.data, ai, now = Date.now(), then = now - this.option.recheck, oldest = this.runtime.oldest;
		if (!page && Player.get('armymax',0) !== (this.runtime.count + this.runtime.extra)) {
			console.log(log(), 'Army size ('+Player.get('armymax',0)+') does not match cache ('+(this.runtime.count + this.runtime.extra)+'), checking from page 1');
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
//		console.log(warn(), 'update('+JSON.shallow(event,1)+'): Army.runtime = '+JSON.stringify(this.runtime));
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


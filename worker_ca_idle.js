/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page, Queue, Resources,
	Battle, Generals, LevelUp, Player,
	APP, APPID, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, Divisor, length, sum, findInObject, objectIndex, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
	makeImage
*/
/********** Worker.Idle **********
* Set the idle general
* Keep focus for disabling other workers
*/
var Idle = new Worker('Idle');
Idle.temp = Idle.data = null;

Idle.defaults['castle_age'] = {};

Idle.settings ={
	after:['LevelUp'],
	taint:true
};

Idle.option = {
	general:'any',
	index:86400000,
	generals:604800000,
	alchemy:86400000,
	quests:0,
	town:0,
	keep:0,
//	arena:0,
	battle:900000,
	monsters:3600000
//	collect:0
};

//Idle.when = ['Never', 'Quarterly', 'Hourly', '2 Hours', '6 Hours', '12 Hours', 'Daily', 'Weekly'];
Idle.when = {
	0:			'Never',
	900000:		'Quarterly',
	3600000:	'Hourly',
	7200000:	'2 Hours',
	21600000:	'6 Hours',
	43200000:	'12 Hours',
	86400000:	'Daily',
	604800000:	'Weekly',
	1209600000:	'2 Weeks',
	2592000000:	'Monthly'
};

Idle.display = [
	{
		label:'<strong>NOTE:</strong> This worker will <strong>not</strong> release control!<br>Use this for disabling workers you do not use.'
	},{
		id:'general',
		label:'Idle General',
		select:'generals'
	},{
		title:'Check Pages',
		group:[
			{
				id:'index',
				label:'Home Page',
				select:Idle.when
			},{
				id:'generals',
				label:'Generals',
				select:Idle.when
			},{
				id:'alchemy',
				label:'Alchemy',
				select:Idle.when
			},{
				id:'quests',
				label:'Quests',
				select:Idle.when
			},{
				id:'town',
				label:'Town',
				select:Idle.when
			},{
				id:'keep',
				label:'Keep',
				select:Idle.when
		//	},{
		//		id:'arena',
		//		label:'Arena',
		//		select:Idle.when
			},{
				id:'battle',
				label:'Battle',
				select:Idle.when
			},{
				id:'monsters',
				label:'Monsters',
				select:Idle.when
		//	},{
		//		id:'collect',
		//		label:'Apprentice Reward',
		//		select:Idle.when
			}
		]
	}
];

Idle.pages = {
	index:['index'],
	generals:['heroes_heroes', 'heroes_generals'],
	alchemy:['keep_alchemy'],
	quests:[
		'quests_quest1',
		'quests_quest2',
		'quests_quest3',
		'quests_quest4',
		'quests_quest5',
		'quests_quest6',
		'quests_quest7',
		'quests_quest8',
		'quests_quest9',
		'quests_quest10',
		'quests_quest11',
		'quests_quest12',
		'quests_quest13',
		'quests_demiquests',
		'quests_atlantis'
	],
	town:['town_soldiers', 'town_blacksmith', 'town_magic', 'town_land'],
	keep:['keep_stats'],
//	arena:['battle_arena'],
	battle:['battle_battle'],
	monsters:['monster_monster_list', 'battle_raid', 'festival_monster_list']
//	collect:['apprentice_collect']
};

Idle.init = function() {
	// BEGIN: fix up "under level 4" generals
	if (this.option.general === 'under level 4') {
		this.set('option.general', 'under max level');
	}
	// END
};

Idle.work = function(state) {
	var now = Date.now(), i, j, p;

	if (!state) {
		return true;
	}

	// handle the generals tour first, to avoid thrashing with the Idle general
	if (this.option[i = 'generals'] && (p = Generals.get('data'))) {
		for (j in p) {
			if (p[j] && p[j].own && (p[j].seen || 0) + this.option[i] <= now) {
				if (Generals.to(j) === null) {
					// if we can't change the general now due to stats or error
					// just add an hour to the last seen time and try later
					Generals.set(['data',j,seen], Math.range((p[j].seen || 0), now + 3600000 - this.option[i], now));
				}
				return true;
			}
		}
	}

	if (!Generals.to(this.option.general)) {
		return true;
	}

	for (i in this.pages) {
		if (this.option[i]) {
			for (p=0; p<this.pages[i].length; p++) {
				if (Page.isStale(this.pages[i][p], now - this.option[i]) && (!Page.to(this.pages[i][p]))) {
					return true;
				}
			}
		}
	}

	return true;
};

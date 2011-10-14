/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Workers, Page,
	Generals,
	APP, APPID, PREFIX, userID, imagepath,
	isRelease, version, revision, Images, window, browser,
	isArray, isFunction, isNumber, isObject, isString, isWorker
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
	taint:true,
	no_disable:true
};

Idle.option = {
	general:'any',
	index:86400000,
	generals:604800000,
	alchemy:86400000,
	quests:604800000,
	town:86400000,
	keep:3600000,
//	arena:0,
	battle:900000,
	guild:0,
	festival:0,
	monsters:3600000
//	collect:0
};

Idle.when = {
	0:		'Never',
	60000:		'Every Minute',
	900000:		'Quarter Hour',
	1800000:	'Half Hour',
	3600000:	'Every Hour',
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
			},{
				id:'guild',
				label:'Guild',
				select:Idle.when
			},{
				id:'festival',
				label:'Festival',
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
		'quests_quest14',
		'quests_quest15',
		//'quests_quest16', // not yet on web3
		'quests_demiquests',
		'quests_atlantis'
	],
	town:['town_soldiers', 'town_blacksmith', 'town_magic', 'town_land'],
	keep:['keep_stats'],
//	arena:['battle_arena'],
	battle:['battle_battle'],
	guild:['battle_guild'],
	festival:['festival_guild'],
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
	var now = Date.now(), i, j, k, p;

	if (!state) {
		return true;
	}

	// handle the generals tour first, to avoid thrashing with the Idle general
	if (this.option[i = 'generals'] && (p = Generals.get('data'))) {
		for (j in p) {
			if ((k = Generals.get(['runtime','last',j], 0)) + this.option[i] <= now) {
				if (Generals.to(j) === null) {
					// if we can't change the general now due to stats or error
					// just try again in an hour
					Generals.set(['runtime','last',j], Math.max(k, now + 60*60*1000 - this.option[i]));
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
			for (p = 0; p < this.pages[i].length; p++) {
				if (Page.isStale(this.pages[i][p], now - this.option[i]) && (!Page.to(this.pages[i][p]))) {
					return true;
				}
			}
		}
	}

	return true;
};

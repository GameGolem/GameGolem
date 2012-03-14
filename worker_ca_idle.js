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
Idle.data = null;

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

Idle.temp = {
    scan:{},
    generals:{}
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
		'quests_quest16',
		'quests_quest17',
		'quests_demiquests',
		'quests_atlantis'
	],
	town:['town_soldiers', 'town_blacksmith', 'town_magic', 'town_land'],
	keep:['keep_stats'],
//	arena:['battle_arena'],
	battle:['battle_battle'],
	guild:['battle_guild'],
	festival:['festival_guild'],
	monsters:[
		'monster_monster_list',
		'battle_raid',
		'festival_monster_list',
		'festival_monster2_list'
	]
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

	// stale pages tour
	for (i in this.pages) {
		k = this.get(['temp','scan',i], 0, 'number');
		if (k || (j = this.option[i])) {
			j = Math.max(now - j, k);
			for (p = 0; p < this.pages[i].length; p++) {
				if (Page.isStale(this.pages[i][p], j)) {
					if (!Generals.to(this.option.general)) {
						return true;
					}
					if (!Page.to(this.pages[i][p], '', 30)) {
						return true;
					}
				}
			}
		}
		this.set(['temp','scan',i]);
	}

	// generals tour
	if (((j = this.get('temp.scan.generals'))
	  || (i = this.option.generals)) && (p = Generals.get('data'))
	) {
		k = j ? now - j : i;
		for (i in p) {
			// purge cooldown guard after 5 minutes, if expired
			j = this.get(['temp','generals',i], 0, 'number');
			if (j && j + 5*60*1000 <= now) {
				this.set(['temp','generals',i]);
				j = 0;
			}
			if (p[i] && p[i].own && Math.max(j, Generals.get(['runtime','last',i], 0, 'number')) + k <= now) {
				// if a general swap would be lossy, or it can't be done now,
				// set a cooldown mark to guard against thrashing
				if (Generals.to(i) === null) {
					this.set(['temp','generals',i], now);
				} else {
					return true;
				}
			}
		}
	}

	// ensure we are parked on the correct general as the final action
	if (!Generals.to(this.option.general)) {
		return true;
	}

	return true;
};

/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page, Queue, Resources,
	Battle, Generals, LevelUp, Player,
	APP, APPID, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, isGreasemonkey,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, shortNumber, WorkerByName, WorkerById, Divisor, length, unique, deleteElement, sum, addCommas, findInArray, findInObject, objectIndex, sortObject, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime, ucfirst, ucwords,
	makeImage
*/
/********** Worker.Idle **********
* Set the idle general
* Keep focus for disabling other workers
*/
var Idle = new Worker('Idle');
Idle.defaults['castle_age'] = {};
Idle.settings ={
    after:['LevelUp']
};

Idle.data = null;
Idle.option = {
	general:'any',
	index:86400000,
	alchemy:86400000,
	quests:0,
	town:0,
	battle:900000,
	monsters:3600000,
	collect:0
};

//Idle.when = ['Never', 'Quarterly', 'Hourly', '2 Hours', '6 Hours', '12 Hours', 'Daily', 'Weekly'];
Idle.when = {
	0:'Never',
	900000:'Quarterly',
	3600000:'Hourly',
	7200000:'2 Hours',
	21600000:'6 Hours',
	43200000:'12 Hours',
	86400000:'Daily',
	604800000:'Weekly'
};

Idle.display = [
	{
		label:'<strong>NOTE:</strong> Any workers below this will <strong>not</strong> run!<br>Use this for disabling workers you do not use.'
	},{
		id:'general',
		label:'Idle General',
		select:'generals'
	},{
		label:'Check Pages:'
	},{
		id:'index',
		label:'Home Page',
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
		id:'battle',
		label:'Battle',
		select:Idle.when
	},{
		id:'monsters',
		label:'Monsters',
		select:Idle.when
	},{
		id:'collect',
		label:'Apprentice Reward',
		select:Idle.when
	}
];

Idle.pages = {
	index:['index'],
	alchemy:['keep_alchemy'],
	quests:['quests_quest1', 'quests_quest2', 'quests_quest3', 'quests_quest4', 'quests_quest5', 'quests_quest6', 'quests_quest7', 'quests_quest8', 'quests_quest9', 'quests_demiquests', 'quests_atlantis'],
	town:['town_soldiers', 'town_blacksmith', 'town_magic', 'town_land'],
	battle:['battle_battle'], //, 'battle_arena'
	monsters:['monster_monster_list', 'battle_raid'],
	collect:['apprentice_collect']
};

Idle.work = function(state) {
	if (!state) {
		return true;
	}
	var i, p, time, now = Date.now();
	if (!Generals.to(this.option.general)) {
		return true;
	}
	for (i in this.pages) {
		if (!this.option[i]) {
			continue;
		}
		time = now - this.option[i];
		for (p=0; p<this.pages[i].length; p++) {
			if (!Page.get(this.pages[i][p]) || Page.get(this.pages[i][p]) < time) {
				if (!Page.to(this.pages[i][p])) {
					Page.set(this.pages[i][p], now);
					return true;
				}
			}
		}
	}
	return true;
};


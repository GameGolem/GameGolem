/********** Worker.Idle **********
* Set the idle general
* Keep focus for disabling other workers
*/
var Idle = new Worker('Idle');
Idle.data = null;
Idle.option = {
	general: 'any',
	index: 'Daily',
	alchemy: 'Daily',
	quests: 'Never',
	town: 'Never',
	battle: 'Daily',
	monsters: 'Hourly'	
	
};
Idle.when = ['Never', 'Hourly', '2 Hours', '6 Hours', '12 Hours', 'Daily', 'Weekly'];
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
	}
];

Idle.work = function(state) {
	if (!state) {
		return true;
	}
	var i, p, time, pages = {
		index:['index'],
		alchemy:['keep_alchemy'],
		quests:['quests_quest1', 'quests_quest2', 'quests_quest3', 'quests_quest4', 'quests_quest5', 'quests_quest6', 'quests_demiquests', 'quests_atlantis'],
		town:['town_soldiers', 'town_blacksmith', 'town_magic', 'town_land'],
		battle:['battle_battle', 'battle_arena'],
		monsters:['keep_monster', 'battle_raid']
	}, when = { 'Never':0, 'Hourly':3600000, '2 Hours':7200000, '6 Hours':21600000, '12 Hours':43200000, 'Daily':86400000, 'Weekly':604800000 };
	if (!Generals.to(this.option.general)) {
		return true;
	}
	for (i in pages) {
		if (!when[this.option[i]]) {
			continue;
		}
		time = Date.now() - when[this.option[i]];
		for (p=0; p<pages[i].length; p++) {
			if (!Page.data[pages[i][p]] || Page.data[pages[i][p]] < time) {
				if (!Page.to(pages[i][p])) {
					return true;
				}
			}
		}
	}
	return true;
};


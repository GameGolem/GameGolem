/********** Worker.Idle **********
* Set the idle general
* Keep focus for disabling other workers
*/
Idle = new Worker('Idle');
Idle.data = null;
Idle.display = function() {
	var panel = new Panel(this.name), when = ['Never', 'Hourly', '2 Hours', '6 Hours', '12 Hours', 'Daily', 'Weekly'];
	panel.info('<strong>NOTE:</strong> Any workers below this will <strong>not</strong> run!<br>Use this for disabling workers you do not use.');
	panel.general('general', 'Idle General', 'any');
	panel.info('Check Pages:');
	panel.select('index', 'Home Page', when);
	panel.select('alchemy', 'Alchemy', when);
	panel.select('quests', 'Quests', when);
	panel.select('town', 'Town', when);
	panel.select('battle', 'Battle', when);
	return panel.show;
}
Idle.work = function(state) {
	var i, p, time, pages = {
		index:['index'],
		alchemy:['keep_alchemy'],
		quests:['quests_quest1', 'quests_quest2', 'quests_quest3', 'quests_quest4', 'quests_quest5', 'quests_quest6', 'quests_demiquests', 'quests_atlantis'],
		town:['town_soldiers', 'town_blacksmith', 'town_magic', 'town_land'],
		battle:['battle_battle']
	}, when = { 'Never':0, 'Hourly':3600000, '2 Hours':7200000, '6 Hours':21600000, '12 Hours':43200000, 'Daily':86400000, 'Weekly':604800000 };
	if (!state) return true;
	if (!Generals.to(Idle.option.general)) return true;
	for (i in pages) {
		if (!when[Idle.option[i]]) continue;
		time = Date.now() - when[Idle.option[i]];
		for (p=0; p<pages[i].length; p++) {
			if (!Page.data[pages[i][p]] || Page.data[pages[i][p]] < time) {
				if (!Page.to(pages[i][p])) return true;
			}
		}
	}
	return true;
}

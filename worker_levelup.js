/********** Worker.LevelUp **********
* Will switch "best" quest and call Quest.work function if there is enough energy available
* Switches generals to specified general
* Will call Heal.work function if current health is under 10 and there is enough stamina available to level up (So Battle/Arena/Monster can automatically use up the stamina.)
* NOTE: We should probably migrate the level up time estimation functions to this worker from Player.  Player still needs the functions to calculate the avgenergyexp and avgstaminaexp though
*/

var LevelUp = new Worker('LevelUp');
LevelUp.data = null;

LevelUp.option = {
	enabled:false,
	general:'any',
	algorithm:'Per Action'
};

LevelUp.runtime = {
	energy:0,
	stamina:0,
	exp:0,
	exp_possible:0,
	energy_samples:0,
	exp_per_energy:1,
	stamina_samples:0,
	exp_per_stamina:1,
	quests:[] // quests[energy] = experience
};

LevelUp.display = [
	{
		title:'Beta!!',
		label:'Unproven yet because testing opportunities are rare.'
	},{
		id:'enabled',
		label:'Enabled',
		checkbox:true
	},{
		id:'general',
		label:'Best General',
		select:['any', 'Energy', 'Stamina'],
		help:'Select which type of general to use when leveling up.'
	},{
		id:'algorithm',
		label:'Estimation Method',
		select:['Per Action', 'Per Hour'],
		help:"'Per Hour' uses your gain per hour. 'Per Action' uses your gain per action."
	}
];

LevelUp.init = function() {
	this._watch(Player);
	this._watch(Quest);
	this.runtime.exp = this.runtime.exp || Player.get('exp'); // Make sure we have a default...
};

LevelUp.update = function(type) {
	var d, i, j, quests, energy = Player.get('energy'), stamina = Player.get('stamina'), exp = Player.get('exp'), runtime = this.runtime, quest_data = Quest.get();
	if (type === Quest) { // Now work out the quickest quests to level up
		runtime.quests = quests = [];
		for (i in quest_data) {
			if (quests[quest_data[i].energy]) {
				quests[quest_data[i].energy] = Math.min(quests[quest_data[i].energy], quest_data[i].exp);
			} else {
				quests[quest_data[i].energy] = quest_data[i].exp;
			}
		}
		j = 0;
		for (i=0; i<quests.length; i++) {
			if (quests[i] && quests[i] > j) {
				j = quests[i];
			} else {
				quests[i] = j;
			}
		}
//		debug('Quickest Quests '+runtime.quests.length+' Quests: '+runtime.quests);
	} else if (type === Player) {
		if (exp !== runtime.exp) { // Experiance has changed...
			if (runtime.stamina > stamina) {
				runtime.exp_per_stamina = ((runtime.exp_per_stamina * Math.min(runtime.stamina_samples, 19)) + ((exp - runtime.exp) / (runtime.stamina - stamina))) / Math.min(runtime.stamina_samples + 1, 20); // .round(3)
				runtime.stamina_samples = Math.min(runtime.stamina_samples + 1, 20);
			} else if (runtime.energy > energy) {
				runtime.exp_per_energy = ((runtime.exp_per_energy * Math.min(runtime.energy_samples, 19)) + ((exp - runtime.exp) / (runtime.energy - energy))) / Math.min(runtime.energy_samples + 1, 20); // .round(3)
				runtime.energy_samples = Math.min(runtime.energy_samples + 1, 20);
			}
		}
		runtime.energy = energy;
		runtime.stamina = stamina;
		runtime.exp = exp;
	}
//	runtime.exp_possible = energy * runtime.exp_per_energy + stamina * runtime.exp_per_stamina; // Purely from estimates
	runtime.exp_possible = (stamina * runtime.exp_per_stamina) + this.runtime.quests[Math.min(energy, this.runtime.quests.length - 1)]; // Energy from questing
	d = new Date(this.get('level_time'));
	if (this.option.enabled) {
		Dashboard.status(this, d.format('l g:i a') + ' (at ' + addCommas(this.get('exp_average').round(1)) + ' per hour)');
	} else {
		Dashboard.status(this);
	}
}

LevelUp.work = function(state) {
/**********************
* Here is my version of what I think the LevelUp.work function should do.
* I would like to see some of the code I copied from the various other workers made into their own callable functions within those workers.
***********************/
	var i, best = null, runtime = this.runtime, quest_data;
//	debug('LevelUp: enabled = '+this.option.enabled+', exp_possible = '+runtime.exp_possible+', needed = '+Player.get('exp_needed'));
	if (!this.option.enabled || runtime.exp_possible < Player.get('exp_needed')) {
		return false;
	}
	if (!state || !Generals.to(this.option.general)) {
		return true;
	}
	if (runtime.energy && runtime.energy < runtime.quests.length) { // We can do a quest first...
		j = runtime.quests[runtime.energy];
		quest_data = Quest.get();
		for (i in quest_data) {
			if (!best || (quest_data[i].exp >= quest_data[best].exp && quest_data[i].energy <= runtime.energy)) {
				best = i;
			}
		}
		if (best) {
			Quest.set('runtime.best', best);
			Queue.burn.energy = runtime.energy; // Don't save any right now...
			Generals.set('runtime.disabled', true);
			try {
				if (Quest.work(true)) {
					Generals.set('runtime.disabled', false);
					return true;
				}
			} catch(e) {
				debug(e.name + ' in Quest.work(true): ' + e.message);
			}
			Generals.set('runtime.disabled', false);
		}
	}
	if (Player.get('health') < 10) {
		Heal.me();
	}
	// else call Battle.work directly because battling has been turned off?
	// Probably need its own callable function as well.
	// If Battling has been turned off, is there a battle targets cache to pull from?  Is there a target ready to attack?
	return true
};

LevelUp.get = function(what) {
	var now = Date.now();
	switch(what) {
		case 'level_timer':	return Math.floor((this.get('level_time') - Date.now()) / 1000);
		case 'level_time':	return now + (3600000 * Math.floor((Player.get('exp_needed') - this.runtime.exp_possible) / (this.get('exp_average') || 10)));
		case 'exp_average':
			if (this.option.algorithm == 'Per Hour') {
				return History.get('exp.average.change');
			} else {
				return (12 * (this.runtime.exp_per_stamina + this.runtime.exp_per_energy));
			}
		default: return this._get(what);
	}
}
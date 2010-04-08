/********** Worker.LevelUp **********
* Will switch "best" quest and call Quest.work function if there is enough energy available
* Switches generals to specified general
* Will call Heal.work function if current health is under 10 and there is enough stamina available to level up (So Battle/Arena/Monster can automatically use up the stamina.)
* NOTE: We should probably migrate the level up time estimation functions to this worker from Player.  Player still needs the functions to calculate the avgenergyexp and avgstaminaexp though
*/

var LevelUp = new Worker('LevelUp', '*');
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
	quests:[] // quests[energy] = [experience, [quest1, quest2, quest3]]
};

LevelUp.display = [
	{
		title:'Beta!!',
		label:'Will only run a single Quest to level up, Stamina is currently not spent!!'
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

LevelUp.parse = function(change) {
	if (change) {
		$('#app'+APPID+'_st_2_5 strong').attr('title', Player.get('exp') + '/' + Player.get('maxexp') + ' at ' + addCommas(this.get('exp_average').round(1)) + ' per hour').html(addCommas(Player.get('exp_needed')) + '<span style="font-weight:normal;"> in <span class="golem-time" style="color:rgb(25,123,48);" name="' + this.get('level_time') + '">' + makeTimer(this.get('level_timer')) + '</span></span>');
	} else {
		$('.result_body').each(function(i,el){
			if (!$('img[src$="battle_victory.gif"]', el).length) {
				return;
			}
			var txt = $(el).text().replace(/,|\t/g, ''), x;
			x = txt.regex(/([+-][0-9]+) Experience/i);
			if (x) { History.add('exp+battle', x); }
			x = (txt.regex(/\+\$([0-9]+)/i) || 0) - (txt.regex(/\-\$([0-9]+)/i) || 0);
			if (x) { History.add('income+battle', x); }
			x = txt.regex(/([+-][0-9]+) Battle Points/i);
			if (x) { History.add('bp+battle', x); }
			x = txt.regex(/([+-][0-9]+) Stamina/i);
			if (x) { History.add('stamina+battle', x); }
			x = txt.regex(/([+-][0-9]+) Energy/i);
			if (x) { History.add('energy+battle', x); }
		});
	}
	return true;
}

LevelUp.update = function(type) {
	var d, i, j, k, quests, energy = Player.get('energy'), stamina = Player.get('stamina'), exp = Player.get('exp'), runtime = this.runtime, quest_data = Quest.get();
	if (type === Quest) { // Now work out the quickest quests to level up
		runtime.quests = quests = [[0]];
		for (i in quest_data) {// quests[energy] = [experience, [quest1, quest2, quest3]]
			if (!quests[quest_data[i].energy] || quest_data[i].exp > quests[quest_data[i].energy][0]) {
				quests[quest_data[i].energy] = [quest_data[i].exp, [i]];
			}
		}
		if (!(quests.length % 2)) { // Make sure it's an even number of quests
			quests[quests.length] = quests[quests.length - 1];
		}
		for (i=1; i<(quests.length/2); i++) { // Find the best exp per energy quests
			if (quests[i] && (!quests[i*2] || (quests[i][0] / i) >= (quests[i*2][0] / (i*2)))) {
				quests[i*2] = [quests[i][0], [quests[i][1][0]]];
			}
		}
		j = 1;
		k = [0];
		for (i=1; i<quests.length; i++) { // Fill in the array using the lowest ratios
			if (quests[i] && quests[i][0] / i >= k[0] / j) {
				j = i;
				k = quests[i];
			} else {
				quests[i] = [k[0], [k[1][0]]];
			}
		}
		for (i=quests.length-2; i>0; i--) { // Delete entries at the end that match (no need to go beyond our best ratio quest)
			if (quests[i][0] === quests[i+1][0]) {
				quests.pop();
			} else {
				break;
			}
		}
		for (i=1; i<quests.length; i++) { // Merge lower value quests to use up all the energy
			if (quest_data[quests[i][1][0]].energy < i) {
				quests[i][0] += quests[i - quest_data[quests[i][1][0]].energy][0];
				quests[i][1] = quests[i][1].concat(quests[i - quest_data[quests[i][1][0]].energy][1])
			}
		}
//		debug('Quickest '+quests.length+' Quests: '+quests.toSource());
	} else if (type === Player) {
		if (exp !== runtime.exp) { // Experience has changed...
			if (runtime.stamina > stamina) {
				runtime.exp_per_stamina = ((runtime.exp_per_stamina * Math.min(runtime.stamina_samples, 49)) + ((exp - runtime.exp) / (runtime.stamina - stamina))) / Math.min(runtime.stamina_samples + 1, 50); // .round(3)
				runtime.stamina_samples = Math.min(runtime.stamina_samples + 1, 50); // More samples for the more variable stamina
			} else if (runtime.energy > energy) {
				runtime.exp_per_energy = ((runtime.exp_per_energy * Math.min(runtime.energy_samples, 9)) + ((exp - runtime.exp) / (runtime.energy - energy))) / Math.min(runtime.energy_samples + 1, 10); // .round(3)
				runtime.energy_samples = Math.min(runtime.energy_samples + 1, 10); // fewer samples for the more consistent energy
			}
		}
		runtime.energy = energy;
		runtime.stamina = stamina;
		runtime.exp = exp;
	}
	if (energy < this.runtime.quests.length) { // Energy from questing
		runtime.exp_possible = this.runtime.quests[Math.min(energy, this.runtime.quests.length - 1)][0];
	} else {
		runtime.exp_possible = (this.runtime.quests[this.runtime.quests.length][0] * Math.floor(energy / (this.runtime.quests.length - 1))) + this.runtime.quests[energy % (this.runtime.quests.length - 1)][0];
	}
//	runtime.exp_possible += Math.floor(stamina * runtime.exp_per_stamina); // Stamina estimate (when we can spend it)
	d = new Date(this.get('level_time'));
	if (this.option.enabled) {
		Dashboard.status(this, '<span title="(xn: ' + this.runtime.exp_possible + ', xpe: ' + this.runtime.exp_per_energy.round(2) + ', xps: ' + this.runtime.exp_per_stamina.round(2) + ')">' + d.format('l g:i a') + ' (at ' + addCommas(this.get('exp_average').round(1)) + ' per hour)</span>');
	} else {
		Dashboard.status(this);
	}
}

LevelUp.work = function(state) {
/**********************
* Here is my version of what I think the LevelUp.work function should do.
* I would like to see some of the code I copied from the various other workers made into their own callable functions within those workers.
***********************/
	var i, j, best, runtime = this.runtime, quest_data, quests;
//	debug('LevelUp: enabled = '+this.option.enabled+', exp_possible = '+runtime.exp_possible+', needed = '+Player.get('exp_needed'));
	if (!this.option.enabled || runtime.exp_possible < Player.get('exp_needed')) {
		return false;
	}
	if (!state || !Generals.to(this.option.general)) {
		return true;
	}
	if (runtime.energy) { // We can do a quest first...
		quest_data = Quest.get();
		quests = runtime.quests[Math.min(runtime.energy, runtime.quests.length-1)][1];
		for (i=0; i<quests.length; i++) {
			if (quest_data[quests[i]] && quest_data[quests[i]].energy <= runtime.energy) {
				best = Quest.get('runtime.best'); // Need to save it as we're not really supposed to be here ;-)
				Quest.set('runtime.best', quests[i]);
				Queue.burn.energy = runtime.energy; // Don't save any right now...
				Generals.set('runtime.disabled', true);
				try {
					Quest.work(true);
				} catch(e) {
					debug(e.name + ' in Quest.work(true): ' + e.message);
				} finally {
					Quest.set('runtime.best', best);
					Generals.set('runtime.disabled', false);
				}
				return true;
			}
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
		case 'level_timer':	return Math.floor((this.get('level_time') - now) / 1000);
		case 'level_time':	return now + Math.floor(3600000 * ((Player.get('exp_needed') - this.runtime.exp_possible) / (this.get('exp_average') || 10)));
		case 'exp_average':
			if (this.option.algorithm == 'Per Hour') {
				return History.get('exp.average.change');
			} else {
				return (12 * (this.runtime.exp_per_stamina + this.runtime.exp_per_energy));
			}
		default: return this._get(what);
	}
}
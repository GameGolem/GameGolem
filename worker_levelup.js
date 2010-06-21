/********** Worker.LevelUp **********
* Will give us a quicker level-up, optionally changing the general to gain extra stats
* 1. Switches generals to specified general
* 2. Changes the best Quest to the one that will get the most exp (rinse and repeat until no energy left) - and set Queue.burn.energy to max available
* 3. Will call Heal.me() function if current health is under 10 and there is any stamina available (So Battle/Arena/Monster can automatically use up the stamina.)
* 4. Will set Queue.burn.stamina to max available
*/

var LevelUp = new Worker('LevelUp');
LevelUp.data = null;

LevelUp.settings = {
	before:['Idle','Battle','Monster','Quest']
};

LevelUp.defaults['castle_age'] = {
	pages:'*'
};

LevelUp.option = {
	enabled:false,
	income:true,
	bank:true,
	general:'any',
	order:'stamina',
	algorithm:'Per Action'
};

LevelUp.runtime = {
	level:0,// set when we start, compare to end
	heal_me:false,// we're active and want healing...
	battle_monster:false,// remember whether we're doing monsters first or not or not...
	old_quest:null,// save old quest, if it's not null and we're working then push it back again...
	old_quest_energy:0,
	running:false,// set when we change
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
		title:'Important!',
		label:'This will spend Energy and Stamina to force you to level up quicker.'
	},{
		id:'enabled',
		label:'Enabled',
		checkbox:true
	},{
		id:'income',
		label:'Allow Income General',
		checkbox:true
	},{
		id:'bank',
		label:'Allow Bank General',
		checkbox:true
	},{
		id:'general',
		label:'Best General',
		select:['any', 'Energy', 'Stamina'],
		help:'Select which type of general to use when leveling up.'
	},{
		id:'order',
		label:'Spend first ',
		select:['Energy','Stamina'],
		help:'Select which resource you want to spend first when leveling up.'
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
	this.runtime.level = this.runtime.level || Player.get('level'); // Make sure we have a default...
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

LevelUp.update = function(type,worker) {
	var d, i, j, k, quests, energy = Player.get('energy'), stamina = Player.get('stamina'), exp = Player.get('exp'), runtime = this.runtime, quest_data,order = Config.getOrder();
	if (worker === Player || !length(runtime.quests)) {
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
	if (worker === Quest || !length(runtime.quests)) { // Now work out the quickest quests to level up
		quest_data = Quest.get();
		runtime.quests = quests = [[0]];// quests[energy] = [experience, [quest1, quest2, quest3]]
		for (i in quest_data) { // Fill out with the best exp for every energy cost
			if (!quests[quest_data[i].energy] || quest_data[i].exp > quests[quest_data[i].energy][0]) {
				quests[quest_data[i].energy] = [quest_data[i].exp, [i]];
			}
		}
		j = 1;
		k = [0];
		for (i=1; i<quests.length; i++) { // Fill in the blanks and replace using the highest exp per energy ratios
			if (quests[i] && quests[i][0] / i >= k[0] / j) {
				j = i;
				k = quests[i];
			} else {
				quests[i] = [k[0], [k[1][0]]];
			}
		}
		while (quests.length > 1 && quests[quests.length-1][0] === quests[quests.length-2][0]) { // Delete entries at the end that match (no need to go beyond our best ratio quest)
			quests.pop();
		}
// No need to merge quests as we're only interested in the first one...
//		for (i=1; i<quests.length; i++) { // Merge lower value quests to use up all the energy
//			if (quest_data[quests[i][1][0]].energy < i) {
//				quests[i][0] += quests[i - quest_data[quests[i][1][0]].energy][0];
//				quests[i][1] = quests[i][1].concat(quests[i - quest_data[quests[i][1][0]].energy][1])
//			}
//		}
//		debug('Quickest '+quests.length+' Quests: '+JSON.stringify(quests));
	}
	if (this.runtime.quests.length <= 1) { // No known quests yet...
		runtime.exp_possible = 1;
	} else if (energy < this.runtime.quests.length) { // Energy from questing
		runtime.exp_possible = this.runtime.quests[Math.min(energy, this.runtime.quests.length - 1)][0];
	} else {
		runtime.exp_possible = (this.runtime.quests[this.runtime.quests.length-1][0] * Math.floor(energy / (this.runtime.quests.length - 1))) + this.runtime.quests[energy % (this.runtime.quests.length - 1)][0];
	}
		if ((arrayIndexOf(order, 'Idle') >= arrayIndexOf(order, 'Monster') && (Monster.runtime.attack)) || (arrayIndexOf(order, 'Idle') >= arrayIndexOf(order, 'Battle'))){
			runtime.exp_possible += Math.floor(stamina * runtime.exp_per_stamina); // Stamina estimate (when we can spend it)
		}

	d = new Date(this.get('level_time'));
	if (this.option.enabled) {
		if (runtime.running) {
			Dashboard.status(this, '<span title="Exp Possible: ' + this.runtime.exp_possible + ', per Hour: ' + addCommas(this.get('exp_average').round(1)) + ', per Energy: ' + this.runtime.exp_per_energy.round(2) + ', per Stamina: ' + this.runtime.exp_per_stamina.round(2) + '">LevelUp Running Now!</span>');
		} else {
			Dashboard.status(this, '<span title="Exp Possible: ' + this.runtime.exp_possible + ', per Energy: ' + this.runtime.exp_per_energy.round(2) + ', per Stamina: ' + this.runtime.exp_per_stamina.round(2) + '">' + d.format('l g:i a') + ' (at ' + addCommas(this.get('exp_average').round(1)) + ' exp per hour)</span>');
		}
	} else {
		Dashboard.status(this);
	}
	if (!this.option.enabled || this.option.general === 'any') {
		Generals.set('runtime.disabled', false);
	}
}

LevelUp.work = function(state) {
	var i, runtime = this.runtime, energy = Player.get('energy'), stamina = Player.get('stamina'), order = Config.getOrder();
	if (runtime.running && this.option.general !== 'any') {
		if (this.option.income && Queue.get('runtime.current') === Income) {
			Generals.set('runtime.disabled', false);
		} else if (this.option.bank && Queue.get('runtime.current') === Bank) {
			Generals.set('runtime.disabled', false);
		} else {
			Generals.set('runtime.disabled', true);
		}
	} else if (!runtime.running) {
		Generals.set('runtime.disabled', false);
	}
	if (runtime.old_quest) {
		Quest.runtime.best = runtime.old_quest;
		Quest.runtime.energy = runtime.old_quest_energy;
		runtime.old_quest = null;
		runtime.old_quest_energy = 0;
	}
	if (!this.option.enabled || runtime.exp_possible < Player.get('exp_needed')) {
		if (runtime.running && runtime.level < Player.get('level')) { // We've just levelled up
			if ($('#app'+APPID+'_energy_current_value').next().css('color') === 'rgb(25, 123, 48)' && energy >= Player.get('maxenergy')) {
				Queue.burn.energy = energy;
				Queue.burn.stamina = 0;
				return QUEUE_FINISH;
			}
			if ($('#app'+APPID+'_stamina_current_value').next().css('color') === 'rgb(25, 123, 48)' && stamina >= Player.get('maxstamina')) {
				Queue.burn.energy = 0;
				Queue.burn.stamina = stamina;
				return QUEUE_FINISH;
			}
			Generals.set('runtime.disabled', false);
			Queue.burn.stamina = Math.max(0, stamina - Queue.get('option.stamina'));
			Queue.burn.energy = Math.max(0, energy - Queue.get('option.energy'));
			Battle.set('option.monster', runtime.battle_monster);
			runtime.running = false;
		} else if (runtime.running && runtime.level == Player.get('level')) { //We've gotten less exp per stamina than we hoped and can't reach the next level.
			Generals.set('runtime.disabled', false);
			Queue.burn.stamina = Math.max(0, stamina - Queue.get('option.stamina'));
			Queue.burn.energy = Math.max(0, energy - Queue.get('option.energy'));
			Battle.set('option.monster', runtime.battle_monster);
			runtime.running = false;
		}
		return QUEUE_FINISH;
	}
	if (state && runtime.heal_me) {
		if (Heal.me()) {
			return QUEUE_CONTINUE;
		}
		runtime.heal_me = false;
	}
	if (state && !runtime.running) { // We're not running yet and we have focus
		runtime.level = Player.get('level');
		runtime.battle_monster = Battle.get('option.monster');
		runtime.running = true;
//		debug('Running '+runtime.running);
		Battle.set('option.monster', false);
	}
	// Get our level up general if we're less than 100 exp from level up
	if (this.option.general !== 'any' && Player.get('exp_needed') < 100) {
		Generals.set('runtime.disabled', false);
		if (Generals.to(this.option.general)) { 
//			debug('Disabling Generals because we are within 100 XP from leveling.');
			Generals.set('runtime.disabled', true);	// Lock the General again so we can level up.
		} else {
			return QUEUE_CONTINUE;	// Try to change generals again
		}
	}
	// We don't have focus, but we do want to level up quicker
	if (this.option.order !== 'Stamina' || !stamina || Player.get('health') < 13 || (stamina < Monster.runtime.stamina && (!Battle.runtime.attacking || (arrayIndexOf(order, 'Idle') <= arrayIndexOf(order, 'Battle')))) || ((arrayIndexOf(order, 'Idle') <= arrayIndexOf(order, 'Monster') || (!Monster.runtime.attack)) && (!Battle.runtime.attacking || (arrayIndexOf(order, 'Idle') <= arrayIndexOf(order, 'Battle'))))){
		debug('Running Energy Burn');
		if (Player.get('energy')) { // Only way to burn energy is to do quests - energy first as it won't cost us anything
			runtime.old_quest = Quest.runtime.best;
			runtime.old_quest_energy = Quest.runtime.energy;
			Queue.burn.energy = energy;
			Queue.burn.stamina = 0;
			Quest.runtime.best = runtime.quests[Math.min(runtime.energy, runtime.quests.length-1)][1][0]; // Access directly as Quest.set() would force a Quest.update and overwrite this again
			Quest.runtime.energy = energy; // Ok, we're lying, but it works...
			return QUEUE_FINISH;
		}
	} else {
		debug('Running Stamina Burn');
	}
	Quest._update('data', null); // Force Quest to decide it's best quest again...
	// Got to have stamina left to get here, so burn it all
	if (runtime.level === Player.get('level') && Player.get('health') < 13 && stamina) { // If we're still trying to level up and we don't have enough health and we have stamina to burn then heal us up...
		runtime.heal_me = true;
		return QUEUE_CONTINUE;
	}
	Queue.burn.energy = 0; // Will be 0 anyway, but better safe than sorry
	Queue.burn.stamina = stamina; // Make sure we can burn everything, even the stuff we're saving
	return QUEUE_FINISH;
};

LevelUp.get = function(what,def) {
	switch(what) {
		case 'timer':		return makeTimer(this.get('level_timer'));
		case 'time':		return (new Date(this.get('level_time'))).format('l g:i a');
		case 'level_timer':	return Math.floor((this.get('level_time') - Date.now()) / 1000);
		case 'level_time':	return Date.now() + Math.floor(3600000 * ((Player.get('exp_needed') - this.runtime.exp_possible) / (this.get('exp_average') || 10)));
		case 'exp_average':
			if (this.option.algorithm == 'Per Hour') {
				return History.get('exp.average.change');
			} else {
				return (12 * (this.runtime.exp_per_stamina + this.runtime.exp_per_energy));
			}
		default: return this._get(what,def);
	}
}
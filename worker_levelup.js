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

LevelUp.defaults = {
	castle_age:{
		pages:'*'
	}
};

LevelUp.option = {
	enabled:false,
	income:true,
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

LevelUp.update = function(type) {
	var d, i, j, k, quests, energy = Player.get('energy'), stamina = Player.get('stamina'), exp = Player.get('exp'), runtime = this.runtime, quest_data = Quest.get();
	if (type === Quest) { // Now work out the quickest quests to level up
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
		for (i=1; i<quests.length; i++) { // Merge lower value quests to use up all the energy
			if (quest_data[quests[i][1][0]].energy < i) {
				quests[i][0] += quests[i - quest_data[quests[i][1][0]].energy][0];
				quests[i][1] = quests[i][1].concat(quests[i - quest_data[quests[i][1][0]].energy][1])
			}
		}
//		debug('Quickest '+quests.length+' Quests: '+JSON.stringify(quests));
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
	if (!this.runtime.quests.length) { // No known quests yet...
		runtime.exp_possible = 1;
	} else if (energy < this.runtime.quests.length) { // Energy from questing
		runtime.exp_possible = this.runtime.quests[Math.min(energy, this.runtime.quests.length - 1)][0];
	} else {
		runtime.exp_possible = (this.runtime.quests[this.runtime.quests.length-1][0] * Math.floor(energy / (this.runtime.quests.length - 1))) + this.runtime.quests[energy % (this.runtime.quests.length - 1)][0];
	}
	runtime.exp_possible += Math.floor(stamina * runtime.exp_per_stamina); // Stamina estimate (when we can spend it)
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
}

LevelUp.work = function(state) {
	var i, runtime = this.runtime, general, energy = Player.get('energy'), stamina = Player.get('stamina');
	if (runtime.running && this.option.income) {
		if (Queue.get('runtime.current') === Income) {
			Generals.set('runtime.disabled', false);
		}
	}
	if (runtime.old_quest) {
		Quest.runtime.best = runtime.old_quest;
		Quest.runtime.energy = runtime.old_quest_energy;
		runtime.old_quest = null;
		runtime.old_quest_energy = 0;
	}
	if (!this.option.enabled || runtime.exp_possible < Player.get('exp_needed')) {
		if (runtime.running && runtime.level < Player.get('level')) { // We've just levelled up
			if ($('#app'+APPID+'_energy_current_value').next().css('color') === 'rgb(25, 123, 48)' &&  energy >= Player.get('maxenergy')) {
				Queue.burn.energy = energy;
				Queue.burn.stamina = 0;
				return false;
			}
			if ($('#app'+APPID+'_stamina_current_value').next().css('color') === 'rgb(25, 123, 48)' &&  stamina >= Player.get('maxstamina')) {
				Queue.burn.energy = 0;
				Queue.burn.stamina = stamina;
				return false;
			}
			Generals.set('runtime.disabled', false);
			Queue.burn.stamina = Math.max(0, stamina - Queue.get('option.stamina'));
			Queue.burn.energy = Math.max(0, energy - Queue.get('option.energy'));
			Battle.set('option.monster', runtime.battle_monster);
			runtime.running = false;
//			debug('running '+runtime.running);
		} else if (runtime.running && runtime.level == Player.get('level')) { //We've gotten less exp per stamina than we hoped and can't reach the next level.
			Generals.set('runtime.disabled', false);
			Queue.burn.stamina = Math.max(0, stamina - Queue.get('option.stamina'));
			Queue.burn.energy = Math.max(0, energy - Queue.get('option.energy'));
			Battle.set('option.monster', runtime.battle_monster);
			runtime.running = false;
//			debug('Running '+runtime.running);
		}
		return false;
	}
	if (state && runtime.heal_me) {
		if (Heal.me()) {
			return true;
		}
		runtime.heal_me = false;
	}
	if (!runtime.running || state) { // We're not running yet, or we have focus
		runtime.level = Player.get('level');
		runtime.battle_monster = Battle.get('option.monster');
		runtime.running = true;
//		debug('Running '+runtime.running);
		Battle.set('option.monster', false);
	}
	general = Generals.best(this.option.general); // Get our level up general
	if (general && general !== 'any' && Player.get('exp_needed') < 100) { // If we want to change...
		Generals.set('runtime.disabled', false);	// make sure changing Generals is not disabled
		if (general === Player.get('general') || Generals.to(general)) { // ...then change if needed
//			debug('Disabling Generals because we are within 25 XP from leveling.');
			Generals.set('runtime.disabled', true);	// and lock the General se we can level up.
		} else {
			return true;	// Try to change generals again
		}
	}
	// We don't have focus, but we do want to level up quicker
    if (this.option.order !== 'Stamina' || !stamina || (stamina < 5 && Battle.option.monster && !Battle.option.points)){
        debug('Running Energy Burn');
	if (Player.get('energy')) { // Only way to burn energy is to do quests - energy first as it won't cost us anything
		runtime.old_quest = Quest.runtime.best;
		runtime.old_quest_energy = Quest.runtime.energy;
		Queue.burn.energy = energy;
		Queue.burn.stamina = 0;
		Quest.runtime.best = runtime.quests[Math.min(runtime.energy, runtime.quests.length-1)][1][0]; // Access directly as Quest.set() would force a Quest.update and overwrite this again
		Quest.runtime.energy = energy; // Ok, we're lying, but it works...
		return false;
	}}
        else
            {debug('Running Stamina Burn');}
    
	Quest._update('data'); // Force Quest to decide it's best quest again...
	// Got to have stamina left to get here, so burn it all
	if (runtime.level === Player.get('level') && Player.get('health') < 13 && stamina) { // If we're still trying to level up and we don't have enough health and we have stamina to burn then heal us up...
		runtime.heal_me = true;
		return true;
	}
	Queue.burn.energy = 0; // Will be 0 anyway, but better safe than sorry
	Queue.burn.stamina = stamina; // Make sure we can burn everything, even the stuff we're saving
	return false;
};

LevelUp.get = function(what) {
	var now = Date.now();
	switch(what) {
		case 'timer':		return makeTimer(this.get('level_timer'));
		case 'time':		return (new Date(this.get('level_time'))).format('l g:i a');
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
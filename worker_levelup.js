/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page, Queue, Resources,
	Bank, Battle, Generals, Heal, Income, LevelUp:true, Monster, Player, Quest,
	APP, APPID, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, isGreasemonkey,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, shortNumber, WorkerByName, WorkerById, Divisor, length, unique, deleteElement, sum, addCommas, findInArray, findInObject, objectIndex, sortObject, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime, ucfirst, ucwords,
	makeImage
*/
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
	avg_exp_per_energy:1.4,
	avg_exp_per_stamina:2.4,
	defending:false, // True if last exp from energy was from a quest
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
		select:['Per Action', 'Per Hour', 'Manual'],
		help:"'Per Hour' uses your gain per hour. 'Per Action' uses your gain per action."
	},{
		id:'manual_exp_per_stamina',
		label:'Exp per stamina',
		require:{'algorithm':'Manual'},
		text:true,
		help:'Experience per stamina point.  Defaults to Per Action if 0 or blank.'
	},{
		id:'manual_exp_per_energy',
		label:'Exp per energy',
		require:{'algorithm':'Manual'},
		text:true,
		help:'Experience per energy point.  Defaults to Per Action if 0 or blank.'
	}
];

LevelUp.init = function() {
	this._watch(Player);
	this._watch(Quest);
	this.runtime.exp = this.runtime.exp || Player.get('exp'); // Make sure we have a default...
	this.runtime.level = this.runtime.level || Player.get('level'); // Make sure we have a default...
};

LevelUp.parse = function(change) {
	var exp, runtime = this.runtime;
	if (change) {

//		$('#app'+APPID+'_st_2_5 strong').attr('title', Player.get('exp') + '/' + Player.get('maxexp') + ' at ' + addCommas(this.get('exp_average').round(1)) + ' per hour').html(addCommas(Player.get('exp_needed')) + '<span style="font-weight:normal;"><span style="color:rgb(25,123,48);" name="' + this.get('level_timer') + '"> ' + this.get('time') + '</span></span>');
		$('#app'+APPID+'_st_2_5 strong').html('<span title="' + Player.get('exp') + '/' + Player.get('maxexp') + ' at ' + addCommas(this.get('exp_average').round(1)) + ' per hour">' + addCommas(Player.get('exp_needed')) + '</span> <span style="font-weight:normal;color:rgb(25,123,48);" title="' + this.get('timer') + '">' + this.get('time') + '</span>');
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
};

LevelUp.update = function(type,worker) {
	var d, i, j, k, record, quests, energy = Player.get('energy'), stamina = Player.get('stamina'), exp = Player.get('exp'), runtime = this.runtime,order = Config.getOrder(), stamina_samples;
	if (worker === Player || !length(runtime.quests)) {
		if (exp > runtime.exp && $('span.result_body:contains("xperience")').length) {
			// Experience has increased...
			if (runtime.stamina > stamina) {
				calc_rolling_weighted_average(runtime, 'exp',exp - runtime.exp,
						'stamina',runtime.stamina - stamina);
			} else if (runtime.energy > energy) {
				this.runtime.defending = (Page.page === 'monster_battle_monster');
				// Only need average for monster defense.  Quest average is known.
				if (this.runtime.defending) {
					calc_rolling_weighted_average(runtime, 'exp',exp - runtime.exp,
						'energy',runtime.energy - energy);
				}
			}
		}
		runtime.energy = energy;
		runtime.stamina = stamina;
		runtime.exp = exp;
	}
// Unnecessary to calculate fastest level up time.  Historical is more accurate, and if the user wanted to level up as fast as possible, they would set Quest for Experience.
/*
	if (worker === Quest || !length(runtime.quests)) { // Now work out the quickest quests to level up
		quests = Quest.get();
		runtime.quests = quests = [[0]];// quests[energy] = [experience, [quest1, quest2, quest3]]
		for (i in quests) { // Fill out with the best exp for every energy cost
			if (!quests[quests[i].energy] || quests[i].exp > quests[quests[i].energy][0]) {
				quests[quests[i].energy] = [quests[i].exp, [i]];
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
//			if (quests[quests[i][1][0]].energy < i) {
//				quests[i][0] += quests[i - quests[quests[i][1][0]].energy][0];
//				quests[i][1] = quests[i][1].concat(quests[i - quests[quests[i][1][0]].energy][1])
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
		if ((order.indexOf('Idle') >= order.indexOf('Monster') && (Monster.runtime.attack)) || (order.indexOf('Idle') >= order.indexOf('Battle'))){
			runtime.exp_possible += Math.floor(stamina * runtime.avg_exp_per_stamina); // Stamina estimate (when we can spend it)
		}
*/
	d = new Date(this.get('level_time'));
	if (this.option.enabled) {
		if (runtime.running) {
			Dashboard.status(this, '<span title="Exp Possible: ' + this.get('exp_possible') + ', per Hour: ' + addCommas(this.get('exp_average').round(1)) + ', per Energy: ' + this.get('exp_per_energy').round(2) + ', per Stamina: ' + this.get('exp_per_stamina').round(2) + '">LevelUp Running Now!</span>');
		} else {
			Dashboard.status(this, '<span title="Exp Possible: ' + this.get('exp_possible') + ', per Energy: ' + this.get('exp_per_energy').round(2) + ', per Stamina: ' + this.get('exp_per_stamina').round(2) + '">' + this.get('time') + ' after <span class="golem-timer">' + this.get('timer')+ '</span> (at ' + addCommas(this.get('exp_average').round(1)) + ' exp per hour)</span>');
		}
	} else {
		Dashboard.status(this);
	}
	if (!this.option.enabled || this.option.general === 'any') {
		Generals.set('runtime.disabled', false);
	}
};

LevelUp.work = function(state) {
	var runtime = this.runtime, energy = Player.get('energy'), stamina = Player.get('stamina'), order = Config.getOrder();
	//debug('runtime ' + runtime.level + ' player ' + Player.get('level'));
	// Get our level up general if we're less than 100 exp from level up
	if (this.option.general !== 'any' && Player.get('exp_needed') < 100 && !(this.option.bank && Queue.get('runtime.current') === 'Bank') && !(this.option.income && Queue.get('runtime.current') === 'Income')) {
		Generals.set('runtime.disabled', false);
		if (Generals.to(this.option.general)) {
			//debug('Disabling Generals because we are within 100 XP from leveling.');
			Generals.set('runtime.disabled', true);	// Lock the General again so we can level up.
		} else {
			return QUEUE_CONTINUE;	// Try to change generals again
		}
	} else {
		Generals.set('runtime.disabled', false);
	}
	if (runtime.old_quest) {
		Quest.runtime.best = runtime.old_quest;
		Quest.runtime.energy = runtime.old_quest_energy;
		runtime.old_quest = null;
		runtime.old_quest_energy = 0;
	}
	if (!this.option.enabled || this.get('exp_possible') < Player.get('exp_needed')) {
		if (runtime.running) { // Shut down the level up burn
			if (runtime.level < Player.get('level')) { // We've just levelled up
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
			}
			Generals.set('runtime.disabled', false);
			Queue.burn.stamina = Math.max(0, stamina - Queue.get('option.stamina'));
			Queue.burn.energy = Math.max(0, energy - Queue.get('option.energy'));
			Battle.set('option.monster', runtime.battle_monster);
			runtime.running = false;
			runtime.level = Player.get('level');
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
		//debug('Running '+runtime.running);
		Battle.set('option.monster', false);
	}

		
/*	max quest xp = quests < energy max exp * number possible
	max fortification 
	max stamina
	
	Find biggest chunk
	Do normal action until can't fit any more
	Do tiny chunks to fill up space
	Do biggest chunk
*/	
	if (runtime.level === Player.get('level') && Player.get('health') < 13 && stamina) { // If we're still trying to level up and we don't have enough health and we have stamina to burn then heal us up...
		runtime.heal_me = true;
		return QUEUE_CONTINUE;
	}

	// We don't have focus, but we do want to level up quicker
	if (this.option.order !== 'Stamina' 
			|| !stamina || Player.get('health') < 13 
			|| (stamina < Monster.runtime.stamina 
				&& (!Battle.runtime.attacking 
					|| (order.indexOf('Idle') <= order.indexOf('Battle'))))
			|| ((order.indexOf('Idle') <= order.indexOf('Monster')
					|| (!Monster.runtime.attack))
			&& (!Battle.runtime.attacking 
				|| (order.indexOf('Idle') <= order.indexOf('Battle'))))){
		debug('Running Energy Burn');
		if (Player.get('energy')) { // Only way to burn energy is to do quests - energy first as it won't cost us anything
	
			var big_quest = null, normal_quest = null, little_quest = null;
			quests = Quest.get();
			big_quest = bestObjValue(quests, function(q){
				return ((q.energy <= energy && q.energy > quests[Quest.runtime.best].energy) 
						? q.exp : null);
			});
//	debug('big_quest = ' + big_quest);
			var big_quest_energy = 0;
			if (big_quest){
				big_quest_energy = quests[big_quest].energy;
			}
//	debug('big_quest_energy = ' + big_quest_energy);

/*	// Find the biggest monster to throw exp into the next level
			monsters = Monster.get();
			for (i in monsters) { 
				stamina_options.concatenate(Monsters.types[monsters[i].type_label].attack);
			}
			
			big_attack = bestObjValue(stamina_options, function(s){
				return ((s =< stamina && s > this.runtime.record.exp_per_stamina.stamina[0]) ? s : null);
			}); 
			
*/	// See if we can do some of our normal quests before the big one
			var exp = Player.get('exp_needed');
			if (energy - big_quest_energy > quests[Quest.runtime.best].energy
					&& exp > quests[Quest.runtime.best].exp) {
				debug('Doing normal quest to burn energy');
				normal_quest = Quest.runtime.best;
			}
			// Find out if we have room to do some small quests before we get to the big one
			for (i in quests) { 
				if (energy - big_quest_energy >= quests[i].energy
						&& exp > quests[i].exp
						&& (!little_quest || (quests[i].energy / quests[i].exp) < (quests[little_quest].energy / quests[little_quest].exp))) {
					little_quest = i;
				}
			}
			var next_quest = normal_quest || little_quest || big_quest;
			if (next_quest) {
				debug('Doing a small quest to burn energy');
				Queue.burn.energy = energy;
				Queue.burn.stamina = 0;
				runtime.old_quest_energy = Quest.runtime.energy;
				runtime.old_quest = Quest.runtime.best;
				Quest.runtime.energy = energy; // Ok, we're lying, but it works...
				Quest.runtime.best = next_quest; // Access directly as Quest.set() would force a Quest.update and overwrite this again
				return QUEUE_FINISH;
			}
		}
	} else {
		debug('Running Stamina Burn');
	}
	Quest._update('data', null); // Force Quest to decide it's best quest again...
	// Got to have stamina left to get here, so burn it all
	Queue.burn.energy = 0; // Will be 0 anyway, but better safe than sorry
	Queue.burn.stamina = stamina; // Make sure we can burn everything, even the stuff we're saving
	return QUEUE_FINISH;
};

LevelUp.get = function(what,def) {
	switch(what) {
	case 'timer':		return makeTimer(this.get('level_timer'));
	case 'time':		return (new Date(this.get('level_time'))).format('D g:i a');
	case 'level_timer':	return Math.floor((this.get('level_time') - Date.now()) / 1000);
	case 'level_time':	return Date.now() + Math.floor(3600000 * ((Player.get('exp_needed') - this.get('exp_possible')) / (this.get('exp_average') || 10)));
	case 'exp_average':
		if (this.option.algorithm === 'Per Hour') {
			return History.get('exp.average.change');
		}
		return (12 * (this.get('exp_per_stamina') + this.get('exp_per_energy')));
	case 'exp_possible':	
		return (Player.get('stamina')*this.get('exp_per_stamina') 
				+ Player.get('energy') * this.get('exp_per_energy')).round(0);
	case 'exp_per_stamina':	
		if (this.option.algorithm === 'Manual' && this.option.manual_exp_per_stamina) {
			return this.option.manual_exp_per_stamina;
		}
		return this.runtime.avg_exp_per_stamina;
	case 'exp_per_energy':	
		if (this.option.algorithm === 'Manual' && this.option.manual_exp_per_energy) {
			return this.option.manual_exp_per_energy;
		}
		return ((this.runtime.defending || !Quest.get('runtime.best',false))
				? this.runtime.avg_exp_per_energy
				: Quest.get('data.'+Quest.get('runtime.best') + '.exp') / 
					Quest.get('data.'+Quest.get('runtime.best') + '.energy'));
	default: return this._get(what,def);
	}
};


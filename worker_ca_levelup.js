/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page, Queue, Resources,
	Bank, Battle, Generals, Heal, Income, LevelUp:true, Monster, Player, Quest,
	APP, APPID, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, Divisor, length, sum, findInObject, objectIndex, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
	calc_rolling_weighted_average
*/
/********** Worker.LevelUp **********
* Will give us a quicker level-up, optionally changing the general to gain extra stats
* 1. Switches generals to specified general
* 2. Changes the best Quest to the one that will get the most exp (rinse and repeat until no energy left) - and set Queue.burn.energy to max available
* 3. Will call Heal.me() function if current health is under 10 and there is any stamina available (So Battle/Arena/Monster can automatically use up the stamina.)
*/

var LevelUp = new Worker('LevelUp');
LevelUp.data = LevelUp.temp = null;

LevelUp.settings = {
	before:['Idle','Battle','Monster','Quest']
};

LevelUp.defaults['castle_age'] = {
	pages:'*'
};

LevelUp.option = {
	income:true,
	bank:true,
	general:'any',
	general_choice:'any',
	order:'stamina',
	algorithm:'Per Action',
	override:false
};

LevelUp.runtime = {
	heal_me:false,// we're active and want healing...
	last_energy:'quest',
	last_stamina:'attack',
	exp:0,
	exp_possible:0,
	avg_exp_per_energy:1.4,
	avg_exp_per_stamina:2.4,
	quests:[], // quests[energy] = [experience, [quest1, quest2, quest3]]
// Old Queue.runtime stuff
	quest: false, // Use for name of quest if over-riding quest
	general: false, // If necessary to specify a multiple general for attack
	action: false, // Level up action
	stamina:0, //How much stamina can be used by workers
	energy:0, //How much energy can be used by workers
	// Force is TRUE when energy/stamina is at max or needed to burn to level up,
	// used to tell workers to do anything necessary to use energy/stamina
	force: {
		energy:false,
		stamina:false
	}
};

LevelUp.display = [
	{
		title:'Important!',
		label:'This will spend Energy and Stamina to force you to level up quicker.'
	},{
		id:'general',
		label:'Best General',
		select:['any', 'Energy', 'Stamina', 'Manual'],
		help:'Select which type of general to use when leveling up.'
	},{
		advanced:true,
		id:'general_choice',
		label:'Use General',
		require:'general=="Manual"',
		select:'generals'
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
		require:'algorithm=="Manual"',
		text:true,
		help:'Experience per stamina point. Defaults to Per Action if 0 or blank.'
	},{
		id:'manual_exp_per_energy',
		label:'Exp per energy',
		require:'algorithm=="Manual"',
		text:true,
		help:'Experience per energy point. Defaults to Per Action if 0 or blank.'
	},{
		id:'override',
		label:'Override Monster<br>Avoid Lost-cause Option',
		checkbox:true,
		help:'Overrides Avoid Lost-cause Monster setting allowing LevelUp to burn stamina on behind monsters.'
	}
];

LevelUp.init = function() {
	// BEGIN: fix up "under level 4" generals
	if (this.option.general_choice === 'under level 4') {
		this.set('option.general_choice', 'under max level');
	}
	// END
	this._watch(Player, 'data.health');
	this._watch(Player, 'data.exp');
	this._watch(Player, 'data.energy');
	this._watch(Player, 'data.stamina');
	this._watch(Resources, 'option.reserve');
	this._watch(Quest, 'runtime.best');
	this._watch(this, 'runtime.force.energy');
	this._watch(this, 'runtime.force.stamina');
	this.runtime.exp = this.runtime.exp || Player.get('exp', 0); // Make sure we have a default...
};

LevelUp.parse = function(change) {
	if (change) {

//		$('#'+APPID_+'st_2_5 strong').attr('title', Player.get('exp') + '/' + Player.get('maxexp') + ' at ' + this.get('exp_average').round(1).addCommas() + ' per hour').html(Player.get('exp_needed').addCommas() + '<span style="font-weight:normal;"><span style="color:rgb(25,123,48);" name="' + this.get('level_timer') + '"> ' + this.get('time') + '</span></span>');
		$('#'+APPID_+'st_2_5 strong').html('<span title="' + Player.get('exp', 0) + '/' + Player.get('maxexp', 1) + ' at ' + this.get('exp_average').round(1).addCommas() + ' per hour">' + Player.get('exp_needed', 0).addCommas() + '</span> <span style="font-weight:normal;color:rgb(25,123,48);" title="' + this.get('timer') + '">' + this.get('time') + '</span>');
	} else {
		$('.result_body').each(function(i,el){
			if (!$('img[src$="battle_victory.gif"]', el).length) {
				return;
			}
			var txt = $(el).text().replace(/,|\t/g, ''), x;
			x = txt.regex(/([+-]\d+) Experience/i);
			if (x) { History.add('exp+battle', x); }
			x = (txt.regex(/\+\$(\d+)/i) || 0) - (txt.regex(/\-\$(\d+)/i) || 0);
			if (x) { History.add('income+battle', x); }
			x = txt.regex(/([+-]\d+) Battle Points/i);
			if (x) { History.add('bp+battle', x); }
			x = txt.regex(/([+-]\d+) Stamina/i);
			if (x) { History.add('stamina+battle', x); }
			x = txt.regex(/([+-]\d+) Energy/i);
			if (x) { History.add('energy+battle', x); }
		});
	}
	return true;
};

LevelUp.update = function(event, events) {
	var i, energy = Player.get('energy',0), stamina = Player.get('stamina',0), exp = Player.get('exp',0);
	if (events.findEvent(this, 'watch', 'runtime.force.energy') && this.get(['runtime','force','energy'])) {
		log(LOG_INFO, 'At max energy, burning...');
	}
	if (events.findEvent(this, 'watch', 'runtime.force.stamina') && this.get(['runtime','force','stamina'])) {
		log(LOG_INFO, 'At max stamina, burning...');
	}
	if (this.option._disabled) {
		this.set(['runtime','running'], false);
		this.set(['runtime','force','energy'], false);
		this.set(['runtime','force','stamina'], false);
	} else if (events.findEvent('Player')) {
		// Check if stamina/energy is maxed and should be forced
		this.set(['runtime','force','energy'], energy >= Player.get('maxenergy',0));
		this.set(['runtime','force','stamina'], stamina >= Player.get('maxstamina',0));
		// Preserve independence of queue system worker by putting exception code into CA workers
		for (i in Workers) {
			if ((worker = Workers[i]) && isFunction(worker.resource) && !worker.get(['option', '_disabled'], false) && (stat = worker.resource())) { // && !worker.get(['option', '_sleep'], false)
				if (stat === 'energy') {
					this.set(['runtime','force','energy'], true);
				} else if (stat === 'stamina') {
					this.set(['runtime','force','stamina'], true);
				}
			}
		}
	}
	if (events.findEvent('Player') || !length(this.runtime.quests)) {
		if (exp > this.runtime.exp && $('span.result_body:contains("xperience")').length) {
			// Experience has increased...
			if (this.runtime.stamina > stamina) {
				this.set(['runtime','last_stamina'], (Page.page === 'keep_monster_active' || Page.page === 'monster_battle_monster') ? 'attack' : 'battle');
				calc_rolling_weighted_average(this.runtime, 'exp', exp - this.runtime.exp, 'stamina', this.runtime.stamina - stamina);
			}
			if (this.runtime.energy > energy) {
				this.set(['runtime','last_energy'], (Page.page === 'keep_monster_active' || Page.page === 'monster_battle_monster') ? 'defend' : 'quest');
				// Only need average for monster defense. Quest average is known.
				if (this.runtime.last_energy === 'defend') {
					calc_rolling_weighted_average(this.runtime, 'exp', exp - this.runtime.exp, 'energy', this.runtime.energy - energy);
				}
			}
		}
	}
	this.set(['runtime','energy'], Math.max(0, energy - (this.runtime.force.energy ? 0 : Resources.get(['option','reserve','Energy'], 0))));
	this.set(['runtime','stamina'], Math.max(0, stamina - (this.runtime.force.stamina ? 0 : Resources.get(['option','reserve','Stamina'], 0))));
	this.set(['runtime','exp'], exp);
	this.set(['runtime','heal_me'], !this.option._disabled && this.runtime.stamina && this.runtime.force.stamina && Player.get('health') < 13);
	//log(LOG_DEBUG, 'next action ' + LevelUp.findAction('best', energy, stamina, Player.get('exp_needed')).exp + ' big ' + LevelUp.findAction('big', energy, stamina, Player.get('exp_needed')).exp);
	if (this.runtime.running) {
		Dashboard.status(this, '<span title="Exp Possible: ' + this.get('exp_possible') + ', per Hour: ' + this.get('exp_average').round(1).addCommas() + ', per Energy: ' + this.get('exp_per_energy').round(2) + ', per Stamina: ' + this.get('exp_per_stamina').round(2) + '">LevelUp Running Now!</span>');
	} else {
		Dashboard.status(this, '<span title="Exp Possible: ' + this.get('exp_possible') + ', per Energy: ' + this.get('exp_per_energy').round(2) + ', per Stamina: ' + this.get('exp_per_stamina').round(2) + '">' + this.get('time') + ' after ' +
			Page.addTimer('levelup', this.get('level_time')) + ' (' + Config.makeImage('exp') + this.get('exp_average').round(1).addCommas() + ' per hour) (refills: ' +
			makeTimer((this.get('refill_energy') - Date.now()) / 1000) + ' per energy, ' +
			makeTimer((this.get('refill_stamina') - Date.now()) / 1000) + ' per stamina)</span>');
	}
	this.set(['option','_sleep'], !this.runtime.running || !this.runtime.heal_me);
	return true;
};

LevelUp.work = function(state) {
	Generals.set('runtime.disabled', false);
	if (!state || Heal.me()) {
		return QUEUE_CONTINUE;
	}
/*
	if (this.runtime.action && this.runtime.action.big) {
		Generals.set('runtime.disabled', false);
		if (Generals.to(this.option.general)) {
			//log('Disabling Generals because next action will level.');
			Generals.set('runtime.disabled', true);	// Lock the General again so we can level up.
		} else {
			return QUEUE_CONTINUE;	// Try to change generals again
		}
	}
*/
	return QUEUE_FINISH;
};

LevelUp.get = function(what,def) {
	switch(what) {
	case 'timer':		return makeTimer(this.get('level_timer'));
	case 'time':		return (new Date(this.get('level_time'))).format('D g:i a');
	case 'level_timer':	return Math.floor((this.get('level_time') - Date.now()) / 1000);
	case 'level_time':	return Date.now() + Math.floor(3600000 * ((Player.get('exp_needed', 0) - this.get('exp_possible')) / (this.get('exp_average') || 10)));
	case 'refill_energy':	return Date.now() + Math.floor(3600000 * ((Math.min(Player.get('maxenergy',0),2000) * this.get('exp_per_energy')) / (this.get('exp_average') || 10)));
	case 'refill_stamina':	return Date.now() + Math.floor(3600000 * ((Math.min(Player.get('maxstamina',0),1000) * this.get('exp_per_stamina')) / (this.get('exp_average') || 10)));
	case 'exp_average':
		if (this.option.algorithm === 'Per Hour') {
			return History.get('exp.average.change');
		}
		return (12 * (this.get('exp_per_stamina') + this.get('exp_per_energy'))).round(1);
	case 'exp_possible':
		return (Player.get('stamina', 0)*this.get('exp_per_stamina')
				+ Player.get('energy', 0) * this.get('exp_per_energy')).round(1);
	case 'exp_per_stamina':
		if (this.option.algorithm === 'Manual' && this.option.manual_exp_per_stamina) {
			return this.option.manual_exp_per_stamina.round(1);
		}
		return this.runtime.avg_exp_per_stamina.round(1);
	case 'exp_per_energy':
		if (this.option.algorithm === 'Manual' && this.option.manual_exp_per_energy) {
			return this.option.manual_exp_per_energy.round(1);
		}
		return ((this.runtime.defending || !Quest.get('runtime.best',false))
				? this.runtime.avg_exp_per_energy
				: (Quest.get(['id', Quest.get('runtime.best'), 'exp']) || 0) /
					(Quest.get(['id', Quest.get('runtime.best'), 'energy']) || 1)).round(1);
	default: return this._get(what,def);
	}
};

LevelUp.findAction = function(mode, energy, stamina, exp) {
	var options =[], i, check, quests, monsters, big, multiples, general = false, basehit, max, raid = false, defendAction, monsterAction, energyAction, staminaAction, questAction, stat = null, value = null, nothing = {stamina:0,energy:0,exp:0};
	defendAction = monsterAction = staminaAction = energyAction = questAction = 0;
	switch(mode) {
	case 'best':
		// Find the biggest exp quest or stamina return to push unusable exp into next level
		big = this.findAction('big',energy,stamina,0);
		if (this.option.order === 'Energy') {
			check = this.findAction('energy',energy-big.energy,0,exp);
			//log(LOG_WARN, ' levelup quest ' + energy + ' ' + exp);
			//log(LOG_WARN, 'this.runtime.last_energy ' + this.runtime.last_energy + ' checkexp ' + check.exp +' quest ' + check.quest);
			// Do energy first if defending a monster or doing the best quest, but not little 'use energy' quests
			if (check.exp && (check.quest === Quest.runtime.best || !check.quest)) {
				log(LOG_WARN, 'Doing regular quest ' + Quest.runtime.best);
				return check;
			}
		}
		check = this.findAction('attack',0,stamina - big.stamina,exp);
		if (check.exp) {
			log(LOG_WARN, 'Doing stamina attack');
			log(LOG_DEBUG, 'basehit0 ' + check.basehit);
			return check;
		}
		check = this.findAction('quest',energy - big.energy,0,exp);
		if (check.exp) {
			log(LOG_WARN, 'Doing little quest ' + check.quest);
			return check;
		}
		log(LOG_WARN, 'Doing big action to save exp');
		return (big.exp ? big : nothing);
	case 'big':
		// Should enable to look for other options than last stamina, energy?
		energyAction = this.findAction('energy',energy,stamina,0);
/*		check = this.findAction('energy',energyAction.energy - 1,stamina,0);
		if (energy - check.energy * energy ratio * 1.25 < exp) {
			energyAction = check;
		}
*/		staminaAction = this.findAction('attack',energy,stamina,0);
		if (energyAction.exp > staminaAction.exp) {
			log(LOG_WARN, 'Big action is energy. Exp use:' + energyAction.exp + '/' + exp);
			energyAction.big = true;
			return energyAction;
		} else if (staminaAction.exp) {
			//log(LOG_WARN, 'big stamina ' + staminaAction.exp + staminaAction.general);
			log(LOG_WARN, 'Big action is stamina. Exp use:' + staminaAction.exp + '/' + exp);
			staminaAction.big = true;
			return staminaAction;
		} else {
			log(LOG_WARN, 'Big action not found');
			return nothing;
		}
	case 'energy':
		//log(LOG_WARN, 'monster runtime defending ' + Monster.get('runtime.defending'));
		if ((Monster.get('runtime.defending')
			&& (Quest.option.monster === 'Wait for'
				|| Quest.option.monster === 'When able'
				|| Queue.option.queue.indexOf('Monster')
					< Queue.option.queue.indexOf('Quest')))
		|| (!exp && Monster.get('runtime.big',false))) {
			defendAction = this.findAction('defend',energy,0,exp);
			if (defendAction.exp) {
				log(LOG_WARN, 'Energy use defend');
				return defendAction;
			}
		}
		questAction = this.findAction('quest',energy,0,exp);
		log(LOG_WARN, 'Energy use quest' + (exp ? 'Normal' : 'Big') + ' QUEST ' + ' Energy use: ' + questAction.energy +'/' + energy + ' Exp use: ' + questAction.exp + '/' + exp + 'Quest ' + questAction.quest);
		return questAction;
	case 'quest':
		quests = Quest.get('id');
		if (Quest.runtime.best && quests[Quest.runtime.best].energy <= energy && quests[Quest.runtime.best].exp < exp) {
			i = Quest.runtime.best;
		} else {
			i = bestObjValue(quests, function(q) {
				return ((q.energy <= energy && (!exp || (q.exp < exp)))
						? q.exp / (exp ? q.energy : 1) : null);
			});
		}
		if (i) {
			log(LOG_WARN, (exp ? 'Normal' : 'Big') + ' QUEST ' + ' Energy use: ' + questAction.energy +'/' + energy + ' Exp use: ' + questAction.exp + '/' + exp + 'Quest ' + questAction.quest);
			return {
				energy : quests[i].energy,
				stamina : 0,
				exp : quests[i].exp,
				quest : i
			};
		} else {
			log(LOG_WARN, 'No appropriate quest found');
			return nothing;
		}
	case 'defend':
		stat = 'energy';
		value = energy;
		// Deliberate fall-through
	case 'attack':
		stat = stat || 'stamina';
		value = value || stamina;
		if (Monster.get(['option', '_disabled'], false)){
				return nothing;
		}
		options = Monster.get('runtime.values.'+mode);
		if (mode === 'defend' && !exp) {
			options = options.concat(Monster.get('runtime.big',[])).unique();
		} else if (mode === 'attack') { // Add 1 so it waits until it has a multiple of remaining stamina before doing the big quest.
			options = options.concat([1]).unique();
		}
		// Use 6 as a safe exp/stamina and 2.8 for exp/energy multiple
		max = Math.min((exp ? (exp / ((stat === 'energy') ? 2.8 : 6)) : value), value);
		monsterAction = basehit = options.lower(max);
		multiples = Generals.get('runtime.multipliers');
		for (i in multiples) {
			check = options.map(function(s){ return s * multiples[i]; } ).lower(max);
			if (check > monsterAction) {
				monsterAction = check;
				basehit = check / multiples[i];
				general = i;
			}
		}
		if (monsterAction < 0 && mode === 'attack' && !Battle.get(['option', '_disabled'], false) && Battle.runtime.attacking) {
			monsterAction = [(Battle.option.type === 'War' ? 10 : 1)].lower(max);
		}
		log(LOG_WARN, (exp ? 'Normal' : 'Big') + ' mode: ' + mode + ' ' + stat + ' use: ' + monsterAction +'/' + ((stat === 'stamina') ? stamina : energy) + ' Exp use: ' + monsterAction * this.get('exp_per_' + stat) + '/' + exp + ' Basehit ' + basehit + ' options ' + options + ' General ' + general);
		if (monsterAction > 0 ) {
			return {
				stamina : (stat === 'stamina') ? monsterAction : 0,
				energy : (stat === 'energy') ? monsterAction : 0,
				exp : monsterAction * this.get('exp_per_' + stat),
				general : general,
				basehit : basehit
			};
		}
		break;
	case 'battle':
		// Need to fill in later
	}
	return nothing;
};

LevelUp.resource = function() {
	var mode, stat, action;
	if (LevelUp.get('exp_possible') > Player.get('exp_needed')) {
		action = LevelUp.runtime.action = LevelUp.findAction('best', Player.get('energy'), Player.get('stamina'), Player.get('exp_needed'));
		if (action.exp) {
			Monster._remind(0,'levelup');
			this.runtime.levelup = true;
			mode = (action.energy ? 'defend' : 'attack');
			stat = (action.energy ? 'energy' : 'stamina');
			this.runtime[stat] = action[stat];
			if (action.quest) {
				this.runtime.quest = action.quest;
			}
			this.runtime.basehit = ((action.basehit < Monster.get('option.attack_min')) ? action.basehit : false);
			log(LOG_DEBUG, 'basehit1 ' + this.runtime.basehit);
			this.runtime.big = action.big;
			if (action.big) {
				this.runtime.basehit = action.basehit;
				log(LOG_DEBUG, 'basehit2 ' + this.runtime.basehit);
				this.runtime.general = action.general || (LevelUp.option.general === 'any'
						? false
						: LevelUp.option.general === 'Manual'
						? LevelUp.option.general_choice
						: LevelUp.option.general );
			} else if (action.basehit === action[stat] && !Monster.get('option.best_'+mode) && Monster.get('option.general_' + mode) in Generals.get('runtime.multipliers')) {
				log(LOG_WARN, 'Overriding manual general that multiplies attack/defense');
				this.runtime.general = (action.stamina ? 'monster_attack' : 'monster_defend');
			}
			this.runtime.force.stamina = (action.stamina !== 0);
			this.runtime.force.energy = (action.energy !== 0);
			log(LOG_WARN, 'Leveling up: force burn ' + (this.runtime.stamina ? 'stamina' : 'energy') + ' ' + (this.runtime.stamina || this.runtime.energy) + ' basehit ' + this.runtime.basehit);
			//log(LOG_WARN, 'Level up general ' + this.runtime.general + ' base ' + this.runtime.basehit + ' action[stat] ' + action[stat] + ' best ' + !Monster.get('option.best_'+mode) + ' muly ' + (Monster.get('option.general_' + mode) in Generals.get('runtime.multipliers')));
			LevelUp.set('runtime.running', true);
			return stat;
		}
	}
};
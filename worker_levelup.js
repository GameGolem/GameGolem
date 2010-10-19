/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page, Queue, Resources,
	Bank, Battle, Generals, Heal, Income, LevelUp:true, Monster, Player, Quest,
	APP, APPID, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, shortNumber, Divisor, length, unique, deleteElement, sum, addCommas, findInArray, findInObject, objectIndex, sortObject, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime, ucfirst, ucwords,
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
	energy:0,
	stamina:0,
	last_energy:'quest',
	last_stamina:'attack',
	exp:0,
	exp_possible:0,
	avg_exp_per_energy:1.4,
	avg_exp_per_stamina:2.4,
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
		id:'general',
		label:'Best General',
		select:['any', 'Energy', 'Stamina', 'Manual'],
		help:'Select which type of general to use when leveling up.'
	},{
		advanced:true,
		id:'general_choice',
		label:'Use General',
		require:{'general':'Manual'},
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
		require:{'algorithm':'Manual'},
		text:true,
		help:'Experience per stamina point.  Defaults to Per Action if 0 or blank.'
	},{
		id:'manual_exp_per_energy',
		label:'Exp per energy',
		require:{'algorithm':'Manual'},
		text:true,
		help:'Experience per energy point.  Defaults to Per Action if 0 or blank.'
	},{
                id:'override',
                label:'Override Monster<br>Avoid Lost-cause Option',
                checkbox:true,
                help:'Overrides Avoid Lost-cause Monster setting allowing LevelUp to burn stamina on behind monsters.'
        }
];

LevelUp.init = function() {
	this._watch(Player);
	this._watch(Quest);
	this.runtime.exp = this.runtime.exp || Player.get('exp'); // Make sure we have a default...
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

LevelUp.update = function(event) {
	var d, i, j, k, record, quests, energy = Player.get('energy'), stamina = Player.get('stamina'), exp = Player.get('exp'), runtime = this.runtime,order = Config.getOrder(), stamina_samples;
	if (event.worker.name === 'Player' || !length(runtime.quests)) {
		if (exp > runtime.exp && $('span.result_body:contains("xperience")').length) {
			// Experience has increased...
			if (runtime.stamina > stamina) {
				//debug('page.page ' + Page.page);
				this.runtime.last_stamina = (Page.page === 'keep_monster_active' || Page.page === 'monster_battle_monster') ? 'attack' : 'battle';
				calc_rolling_weighted_average(runtime, 'exp',exp - runtime.exp,
						'stamina',runtime.stamina - stamina);
			} else if (runtime.energy > energy) {
				this.runtime.last_energy = (Page.page === 'keep_monster_active' || Page.page === 'monster_battle_monster') ? 'defend' : 'quest';
				// Only need average for monster defense.  Quest average is known.
				if (this.runtime.last_energy === 'defend') {
					calc_rolling_weighted_average(runtime, 'exp',exp - runtime.exp,
						'energy',runtime.energy - energy);
				}
			}
		}
		runtime.energy = energy;
		runtime.stamina = stamina;
		runtime.exp = exp;
	}
	//debug('next action ' + LevelUp.findAction('best', Player.get('energy'), Player.get('stamina'), Player.get('exp_needed')).exp + ' big ' + LevelUp.findAction('big', Player.get('energy'), Player.get('stamina'), Player.get('exp_needed')).exp);
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
/*	if (!this.option.enabled || this.option.general === 'any') {
		Generals.set('runtime.disabled', false);
	}
*/};

LevelUp.work = function(state) {
	var heal = this.runtime.heal_me, energy = Player.get('energy'), stamina = Player.get('stamina'), order = Config.getOrder(), action = this.runtime.action;
	Generals.set('runtime.disabled', false);
/*	if (!action || !action.big) {
		Generals.set('runtime.disabled', false);
	}
*/	if (!Queue.burn.forcestamina || !heal) {
		return QUEUE_FINISH;
	}
	if (!state) {
		return QUEUE_CONTINUE;
	}
	if (heal && Heal.me()) {
		return QUEUE_CONTINUE;
	}
	this.runtime.heal_me = false;
/*	if (action && action.big) {
		Generals.set('runtime.disabled', false);
		if (Generals.to(this.option.general)) {
			//debug('Disabling Generals because next action will level.');
			Generals.set('runtime.disabled', true);	// Lock the General again so we can level up.
		} else {
			return QUEUE_CONTINUE;	// Try to change generals again
		}
	}
*/	return QUEUE_FINISH;
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

LevelUp.findAction = function(what, energy, stamina, exp) {
	var options =[], i, check, energyAction, staminaAction, quests, monsters, big, multiples, general = false, basehit, max, raid = false;
	switch(what) {
	case 'best':
		// Find the biggest exp quest or stamina return to push unusable exp into next level
		big = this.findAction('big',energy,stamina,0); 
		//debug(' check sta: ' + stamina + ', big:' + big.stamina);
		if (this.option.order === 'Energy') {
			check = this.findAction('quest',energy,0,exp);
			//debug(' levelup quest ' + energy + ' ' + exp);
			//debug('this.runtime.last_energy ' + this.runtime.last_energy + ' checkexp ' + check.exp +' quest ' + check.quest);
			if (check && check.quest === Quest.runtime.best) {
				return check;
			}
		}
		check = this.findAction('attack',0,stamina - big.stamina,exp);
		if (check) {
			return check;
		}
		check = this.findAction('quest',energy,0,exp);
		if (check && check.quest === Quest.runtime.best) {
			return check;
		}
		check = this.findAction('quest',energy - big.energy,0,exp);
		if (check) {
			return check;
		}
		//debug(' big.general ' + big.general+ big.exp);
		return (!big.none ? big : false);
	case 'big':		
		// Should enable to look for other options than last stamina, energy?
		energyAction = this.findAction('quest',energy,stamina,0);
		staminaAction = this.findAction('attack',energy,stamina,0);
		if (energyAction && (!staminaAction || energyAction.exp >= staminaAction.exp)) {
			//debug('big energy ' + energyAction.exp);
			energyAction.big = true;
			return energyAction;
		} else if (staminaAction) {
			//debug('big stamina ' + staminaAction.exp + staminaAction.general);
			staminaAction.big = true;
			return staminaAction;
		} else {
			return {	energy : 0,
						stamina : 0,
						none : true};  
		}
	case 'defend':	
		// Need to fill in Barbarus.etc ability
		monsters = Monster.get();
		for (i in monsters) { 
			options = options.concat(Monster.types[monsters[i].type].defend);
		}
		original = options = unique(options);
		multiples = Generals.get('runtime.multipliers');
		for (i in multiples) {
			options = options.concat(original.map(function(s){ return s*multiples[i]; } ));
		}
		// Use 2.8X as a safe exp multiple until actual figures can be coded from each monster
		i = bestValue(options, Math.min((exp ?  exp / 2.8 : energy), energy));
		if (i !== -1) {
			//debug('defend ' + i);
			return {	energy : i,
						stamina : 0,
						exp : i * this.get('exp_per_energy')};  
		} else {
			return null;
		}
	case 'quest':		
		quests = Quest.get();
		if (Quest.runtime.best && quests[Quest.runtime.best].energy <= energy && quests[Quest.runtime.best].exp < exp) {
			i = Quest.runtime.best;
		} else {
			i = bestObjValue(quests, function(q) {
				return ((q.energy <= energy && (!exp || (q.exp < exp))) 
						? q.exp / (exp ? q.energy : 1) : null);
			});
		}
		if (i) {
			//debug('quest ' + i);
			return {	energy : quests[i].energy,
						stamina : 0,
						exp : quests[i].exp,
						quest : i};
		} else {
			return null;
		}
	case 'attack':		
		// Need to fill in Barbarus.etc ability
		monsters = Monster.get();
		for (i in monsters) {
			//debug('i:'+ i + ' monster[i].name'+monsters[i].name+' type:'+monsters[i].type + ' raid:'+Monster.types[monsters[i].type].raid);
			if (!Monster.types[monsters[i].type].raid) {
				if (Monster.types[monsters[i].type].defend && Monster.types[monsters[i].type].attack.indexOf(1) > -1) {
					options = options.concat(Monster.types[monsters[i].type].attack.slice(1,Monster.get('runtime.button.count')));
				} else {
					options = options.concat(Monster.types[monsters[i].type].attack.slice(0,Monster.get('runtime.button.count')));
				}
			} else {
				raid = true;
			}
		}
		options = unique(options);
		// Use 6X as a safe exp variation multiple until actual figures available
		max = Math.min((exp ? exp / 6 : stamina), stamina);
		staminaAction = basehit = bestValue(options, max);
		multiples = Generals.get('runtime.multipliers');
		for (i in multiples) {
			check = bestValue(options.map(function(s){ return s * multiples[i]; } ), max);
			if (check > staminaAction) {
				staminaAction = check;
				basehit = check / multiples[i];
				general = i;
			}
		}
                if (!Monster.runtime.attack){
                        staminaAction = -1;
                }
		if (staminaAction < 0 && Queue.enabled(Battle) && Battle.runtime.attacking) {
			staminaAction = bestValue([((raid && Monster.option.raid.search('x5') < 0) ? 1 : 5), (Battle.option.type === 'War' ? 10 : 1)],max);
		}
		debug('options ' + options + ' staminaAction ' + staminaAction + ' basehit ' + basehit + ' general ' + general);
		if (staminaAction > 0 ) {
			return {	stamina : staminaAction,
						energy : 0,
						exp : staminaAction * this.get('exp_per_stamina'),
						general :  general,
						basehit : basehit}
		} else {
			return null;
		}
	case 'battle':		
		// Need to fill in later
	}
};
			
		
			
	

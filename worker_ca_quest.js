/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page, Queue, Resources,
	Alchemy, Bank, Battle, Generals, LevelUp, Monster, Player, Town,
	APP, APPID, warn, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser, console,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, Divisor, length, sum, findInObject, objectIndex, sortObject, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
	makeImage
*/
/********** Worker.Quest **********
* Completes quests with a choice of general
*/
// Should also look for quests_quest but that should never be used unless there's a new area
var Quest = new Worker('Quest');

Quest.settings = {
	//taint:true
};

Quest.defaults['castle_age'] = {
	pages:'quests_quest1 quests_quest2 quests_quest3 quests_quest4 quests_quest5 quests_quest6 quests_quest7 quests_quest8 quests_quest9 quests_quest10 quests_quest11 quests_quest12 quests_demiquests quests_atlantis'
};

Quest.option = {
	general:true,
	general_choice:'any',
	what:'Influence',
	ignorecomplete:true,
	unique:true,
	monster:'When able',
	bank:true,
	energy_reserve:0
};

Quest.runtime = {
	best:null,
	energy:0
};

Quest.data = {
	id: {}
};

Quest.temp = {
	order: []
};

Quest.land = ['Land of Fire', 'Land of Earth', 'Land of Mist', 'Land of Water', 'Demon Realm', 'Undead Realm', 'Underworld', 'Kingdom of Heaven', 'Ivory City', 'Earth II', 'Water II', 'Mist II'];
Quest.area = {quest:'Quests', demiquest:'Demi Quests', atlantis:'Atlantis'};
Quest.current = null;
Quest.display = [
	{
		id:'general',
		label:'Use Best General',
		checkbox:true
	},{
		advanced:true,
		id:'general_choice',
		label:'Use General',
		require:'!general',
		select:'generals'
	},{
		id:'energy_reserve',
		label:'Energy Reserve',
		select:'energy',
		help:'Keep this much energy in reserve for other workers.'
	},{
		id:'what',
		label:'Quest for',
		select:'quest_reward',
		help:'Cartigan will try to collect all items needed to summon Cartigan (via Alchemy), then cascades to Advancement.' +
		  ' Vampire Lord will try to collect 24 (for Calista), then cascades to Advancement.' +
		  ' Subquests (quick general levelling) will only run subquests under 100% influence, then cascades to Advancement.' +
		  ' Advancement will run viable quests to unlock all areas, then cascades to Influence.' +
		  ' Influence will run all viable influence gaining quests, then cascade to Experience.' +
		  ' Inf+Exp will run the best viable experience quests under 100% influence, then cascade to Experience.' +
		  ' Inf+Cash will run the best viable cash quests under 100% influence, then cascade to Cash.' +
		  ' Experience runs only the best experience quests.' +
		  ' Cash runs only the best cash quests.'
	},{
		advanced:true,
		id:'ignorecomplete',
		label:'Only do incomplete quests',
		checkbox:true,
		help:'Will only do quests that aren\'t at 100% influence',
		require:'what=="Cartigan" || what=="Vampire Lord"'
	},{
		id:'unique',
		label:'Get Unique Items First',
		checkbox:true
	},{
		id:'monster',
		label:'Fortify',
		select: ['Never','When able','Wait for']
	},{
		id:'bank',
		label:'Automatically Bank',
		checkbox:true
	}
];

Quest.setup = function() {
	Resources.use('Energy');
};

Quest.init = function() {
	var data = this.get('data'), runtime = this.get('runtime'), i, j, r, x;
	for (i in data) {
		if (i.indexOf('\t') !== -1) { // Fix bad page loads...
			delete data[i];
		}
	}
	if (this.option.monster === true) {
		this.option.monster = 'When able';
	} else if (this.option.monster === false) {
		this.option.monster = 'Never';
	}

	r = this.rdmap = {};
	for (i in this.rdata) {
		for (j in this.rdata[i]) {
			if ((x = j.regex(/^reps_q(\d+)$/i))) {
				r[i + ';' + x] = this.rdata[i][j];
			} else if (j.match(/^reps_d\d+$/i)) {
				x = i + ';demiquest';
				if (!r[x]) {
					r[x] = this.rdata[i][j];
				} else {
					console.log(warn(), 'rdata demiquest dup on ' + x);
				}
			} else if (j.match(/^reps_a\d+$/i)) {
				x = i + ';atlantis';
				if (!r[x]) {
					r[x] = this.rdata[i][j];
				} else {
					console.log(warn(), 'rdata demiquest dup on ' + x);
				}
			}
		}
	}

	// one time pre-r845 fix for erroneous values in m_c, m_d, reps, eff
	if ((runtime.revision || 0) < 845) {
		for (i in data) {
			if (data[i].reps) {
				x = this.wiki_reps(data[i], true);
				if (data[i].reps < Math.round(x * 0.8) || data[i].reps > Math.round(x * 1.2)) {
					console.log(warn(), 'Quest.init: deleting metrics for: ' + i);
					delete data[i].m_c;
					delete data[i].m_d;
					delete data[i].reps;
					delete data[i].eff;
				}
			}
		}
	}

	// one time pre-r850 fix to map data by id instead of name
	if ((runtime.revision || 0) < 850) {
		runtime.best = null;
		runtime.energy = 0;
		if (runtime.quest) {
			delete runtime.quest;
		}
		if (!('id' in data) && ('Pursuing Orcs' in data)) {
			x = {};

			if (!('id' in data)) {
				data.id = {};
			}

			for (i in data) {
				if (i === 'id' || i === 'q') {
					continue;
				}
				if ('id' in data[i]) {
					data.id[data[i].id] = data[i];
					delete data[i].id;
				} else {
					if (!('q' in data)) {
						data.q = {};
					}
					data.q[i] = data[i];
				}
				x[i] = 1;
			}

			for (i in x) {
				delete data[i];
			}
		}
	}

	// one time pre-r851 fix for Queue triggered quest by name instead of id
	if ((runtime.revision || 0) < 851) {
		if (Queue.get('runtime.quest')) {
			Queue.set('runtime.quest', false);
		}
	}

	runtime.revision = revision; // started r845 for historic reference

	this._watch(Player, 'data.energy');
	this._watch(Player, 'data.maxenergy');
};

Quest.parse = function(change) {
	var data = this.data, last_main = 0, area = null, land = null, i, m_c, m_d, m_i, reps, purge, changes = 0;
	if (Page.page === 'quests_quest') {
		return false; // This is if we're looking at a page we don't have access to yet...
	} else if (Page.page === 'quests_demiquests') {
		area = 'demiquest';
	} else if (Page.page === 'quests_atlantis') {
		area = 'atlantis';
	} else {
		area = 'quest';
		land = Page.page.regex(/quests_quest(\d+)/i) - 1;
	}
	purge = {};
	for (i in data.id) {
		if (data.id[i].area === area && (area !== 'quest' || data.id[i].land === land)) {
			purge[i] = true;
		}
	}
	if ($('div.quests_background,div.quests_background_sub').length !== $('div.quests_background .quest_progress,div.quests_background_sub .quest_sub_progress').length) {
		Page.to(Page.page, '');// Force a page reload as we're pretty sure it's a bad page load!
		return false;
	}
	$('div.quests_background,div.quests_background_sub,div.quests_background_special').each(function(i,el){
		var id, name, level, influence, reward, units, energy, exp, tmp, type = 0;
		if ((tmp = $('input[name="quest"]', el)).length) {
		    id = $(tmp).val().regex(/(\d+)/);
		}
		if ($(el).hasClass('quests_background_sub')) { // Subquest
			name = $('.quest_sub_title', el).text().trim();
			if ((tmp = $('.qd_2_sub', el).text().replace(/\s+/gm, ' ').replace(/,/g, '').replace(/mil\b/gi, '000000'))) {
				exp = tmp.regex(/\b(\d+)\s*Exp\b/im);
				reward = tmp.regex(/\$\s*(\d+)\s*-\s*\$\s*(\d+)\b/im);
			}
			energy = $('.quest_req_sub', el).text().regex(/\b(\d+)\s*Energy\b/im);
			level = $('.quest_sub_progress', el).text().regex(/\bLEVEL:?\s*(\d+)\b/im);
			influence = $('.quest_sub_progress', el).text().regex(/\bINFLUENCE:?\s*(\d+)%/im);
			type = 2;
		} else {
			name = $('.qd_1 b', el).text().trim();
			if ((tmp = $('.qd_2', el).text().replace(/\s+/gm, ' ').replace(/,/g, '').replace(/mil\b/gi, '000000'))) {
				exp = tmp.regex(/\b(\d+)\s*Exp\b/im);
				reward = tmp.regex(/\$\s*(\d+)\s*-\s*\$\s*(\d+)\b/im);
			}
			energy = $('.quest_req', el).text().regex(/\b(\d+)\s*Energy\b/im);
			if ($(el).hasClass('quests_background')) { // Main quest
				last_main = id;
				level = $('.quest_progress', el).text().regex(/\bLEVEL:?\s*(\d+)\b/im);
				influence = $('.quest_progress', el).text().regex(/\bINFLUENCE:?\s*(\d+)%/im);
				type = 1;
			} else { // Special / boss Quest
				type = 3;
			}
		}
		if (!id || !name || name.indexOf('\t') !== -1 || !type || !energy || !exp || !reward || !reward[0] || !reward[1]) {
			// Hopefully stop it finding broken page load quests...
			// but most times if some of this is wrong, a layout change has
			// happened to the quest pages, and we want some kind of warning.
			/*
			console.log(warn(), 'Bad quest data:' +
			  ' id:' + JSON.shallow(id, 2) +
			  ' name:' + JSON.shallow(name, 2) +
			  ' type:' + JSON.shallow(type, 2) +
			  ' energy:' + JSON.shallow(energy, 2) +
			  ' exp:' + JSON.shallow(exp, 2) +
			  ' reward:' + JSON.shallow(reward, 2) +
			  ' level:' + JSON.shallow(level, 2) +
			  ' influence:' + JSON.shallow(influence, 2));
			*/
			return;
		}
		m_c = 0; // percentage count metric
		m_d = 0; // percentage delta metric
		m_i = null; // last influence value
		reps = 0; // average reps needed per level
		if (data.id[id]) {
			m_c = data.id[id].m_c || 0;
			m_d = data.id[id].m_d || 0;
			m_i = data.id[id].influence;
			reps = data.id[id].reps || 0;
		}
		if (purge[id]) {
			purge[id] = false;
		}
		data.id[id] = {};
		data.id[id].name = name;
		data.id[id].area = area;
		data.id[id].type = type;
		if (type === 2 && last_main) {
			data.id[id].main = last_main;
		}
		if (isNumber(land)) {
			data.id[id].land = land;
		}
		if (isNumber(influence)) {
			data.id[id].level = (level || 0);
			data.id[id].influence = influence;
			if (isNumber(m_i) && m_i < influence && influence < 100) {
				m_d += influence - m_i;
				m_c++;
			}
		}
		data.id[id].exp = exp;
		data.id[id].reward = (reward[0] + reward[1]) / 2;
		data.id[id].energy = energy;
		if (isNumber(m_c) && m_c && isNumber(m_d) && m_d) {
			data.id[id].m_c = m_c;
			data.id[id].m_d = m_d;
			reps = Math.ceil(m_c * 100 / m_d);
		}
		if (isNumber(reps) && reps) {
			data.id[id].reps = reps;
			data.id[id].eff = data.id[id].energy * reps;
		}
		if (type !== 2) { // That's everything for subquests
			if (type === 3) { // Special / boss quests create unique items
				data.id[id].unique = true;
			}
			tmp = $('.qd_1 img', el).last();
			if (tmp.length && tmp.attr('title')) {
				data.id[id].item	= tmp.attr('title').trim();
				data.id[id].itemimg	= tmp.attr('src').filepart();
			}
			units = {};
			$('.quest_req >div >div >div', el).each(function(i,el){
				var title = $('img', el).attr('title');
				units[title] = $(el).text().regex(/(\d+)/);
			});
			if (length(units)) {
				data.id[id].units = units;
			}
			tmp = $('.quest_act_gen img', el);
			if (tmp.length && tmp.attr('title')) {
				data.id[id].general = tmp.attr('title');
			}
		}
		changes++;
	});
	for (i in purge) {
		if (purge[i]) {
			console.log(warn(), 'Deleting ' + i + '(' + (Quest.land[data.id[i].land] || data.id[i].area) + ')');
			delete data.id[i];
			changes++;
		}
	}
	if (changes) {
		Quest._notify('data');
	}
	return false;
};

  // watch specific Generals if doing an alchemy quest giving a general
  // watch specific Town if doing an alchemy quest giving an item/unit
  // watch Generals if we passed up a preferred quest due to a missing req.
  // watch Town if we passed up a preferred quest due to a missing req.

Quest.update = function(event) {
	if (event.worker.name === 'Town' && event.type !== 'data') {
		return; // Missing quest requirements
	}
	// First let's update the Quest dropdown list(s)...
	var i, unit, own, need, noCanDo = false, best = null, best_cartigan = null, best_vampire = null, best_subquest = null, best_advancement = null, best_influence = null, best_experience = null, best_land = 0, has_cartigan = false, has_vampire = false, list = [], items = {}, data = this.data, maxenergy = Player.get('maxenergy',999), eff, best_adv_eff = 1e10, best_inf_eff = 1e10, cmp, oi, ob;
	if (event.type === 'init' || event.type === 'data') {
		for (i in data.id) {
			if (data.id[i].item && data.id[i].type !== 3) {
				list.push(data.id[i].item);
			}
			for (unit in data.id[i].units) {
				items[unit] = Math.max(items[unit] || 0, data.id[i].units[unit]);
			}
		}
		Config.set('quest_reward', ['Nothing', 'Cartigan', 'Vampire Lord', 'Subquests', 'Advancement', 'Influence', 'Inf+Exp', 'Experience', 'Inf+Cash', 'Cash'].concat(list.unique().sort()));
		for (unit in items) {
			if (Resources.get(['data','_'+unit,'quest'], -1) !== items[unit]) {
				Resources.set(['data','_'+unit,'quest'], items[unit]);
			}
		}
	}
	// Now choose the next quest...
	if (this.option.unique) {// Boss monster quests first - to unlock the next area
		for (i in data.id) {
			if (data.id[i].energy > maxenergy) {// Skip quests we can't afford
				continue;
			}
			if (data.id[i].type === 3 && !Alchemy.get(['ingredients', data.id[i].itemimg], 0, 'number') && (!best || data.id[i].energy < data.id[best].energy)) {
				best = i;
			}
		}
	}
	if (!best && this.option.what !== 'Nothing') {
		if (this.option.what !== 'Vampire Lord' || Town.get(['Vampire Lord', 'own'], 0, 'number') >= 24) {
			has_vampire = true; // Stop trying once we've got the required number of Vampire Lords
		}
		if (this.option.what !== 'Cartigan' || (Generals.get('Cartigan', false) || (Alchemy.get(['ingredients', 'eq_underworld_sword.jpg'], 0, 'number') >= 3 && Alchemy.get(['ingredients', 'eq_underworld_amulet.jpg'], 0, 'number') >= 3 && Alchemy.get(['ingredients', 'eq_underworld_gauntlet.jpg'], 0, 'number') >= 3))) {
			// Sword of the Faithless x3 - The Long Path, Burning Gates
			// Crystal of Lament x3 - Fiery Awakening
			// Soul Eater x3 - Fire and Brimstone, Deathrune Castle
			has_cartigan = true; // Stop trying once we've got the general or the ingredients
		}
//		console.log(warn(), 'option = ' + this.option.what);
//		best = (this.runtime.best && data.id[this.runtime.best] && (data.id[this.runtime.best].influence < 100) ? this.runtime.best : null);
		for (i in data.id) {
			// Skip quests we can't afford or can't equip the general for
			oi = data.id[i];
			if (oi.energy > maxenergy 
					|| !Generals.test(oi.general || 'any')
					|| (Queue.runtime.general && oi.general)) {
				continue;
			}
			if (oi.units) {
				own = 0;
				need = 0;
				noCanDo = false;
				for (unit in oi.units) {
					need = oi.units[unit];
					if (!Player.get(['artifact', i]) || need !== 1) {
						own = Town.get([unit, 'own'], 0, 'number');
						if (need > own) {	// Need more than we own, skip this quest.
							noCanDo = true;	// set flag
							break;	// no need to check more prerequisites.
						}
					}
				}
				if (noCanDo) {
					continue;	// Skip to the next quest in the list
				}
			}
			eff = oi.eff || (oi.energy * this.wiki_reps(oi));
			if (0 < (oi.influence || 0) && (oi.influence || 0) < 100) {
				eff = Math.ceil(eff * (100 - oi.influence) / 100);
			}
			switch(this.option.what) { // Automatically fallback on type - but without changing option
				case 'Vampire Lord': // Main quests or last subquest (can't check) in Undead Realm
					ob = data.id[best_vampire];
					// order: inf<100, <energy, >exp, >cash (vampire)
					if (!has_vampire && isNumber(oi.land) &&
					  oi.land === 5 && oi.type === 1 &&
					  (!this.option.ignorecomplete || (isNumber(oi.influence) && oi.influence < 100)) &&
					  (!best_vampire ||
					  (cmp = (isNumber(oi.influence) && oi.influence < 100 ? 1 : 0) - (isNumber(ob.influence) && ob.influence < 100 ? 1 : 0)) > 0 ||
					  (!cmp && (cmp = oi.energy - ob.energy) < 0) ||
					  (!cmp && (cmp = (oi.exp / oi.energy) - (ob.exp / ob.energy)) > 0) ||
					  (!cmp && (cmp = (oi.reward / oi.energy) - (ob.reward / ob.energy)) > 0))) {
						best_vampire = i;
					}// Deliberate fallthrough
				case 'Cartigan': // Random Encounters in various Underworld Quests
					ob = data.id[best_cartigan];
					// order: inf<100, <energy, >exp, >cash (cartigan)
					if (!has_cartigan && isNumber(oi.land) && data.id[i].land === 6 &&
					  (!this.option.ignorecomplete || (isNumber(oi.influence) && oi.influence < 100)) &&
					  (((data.id[oi.main || i].name === 'The Long Path' || data.id[oi.main || i].name === 'Burning Gates') && Alchemy.get(['ingredients', 'eq_underworld_sword.jpg'], 0, 'number') < 3) ||
					  ((data.id[oi.main || i].name === 'Fiery Awakening') && Alchemy.get(['ingredients', 'eq_underworld_amulet.jpg'], 0, 'number') < 3) ||
					  ((data.id[oi.main || i].name === 'Fire and Brimstone' || data.id[oi.main || i].name === 'Deathrune Castle') && Alchemy.get(['ingredients', 'eq_underworld_gauntlet.jpg'], 0, 'number') < 3)) &&
					  (!best_cartigan ||
					  (cmp = (isNumber(oi.influence) && oi.influence < 100 ? 1 : 0) - (isNumber(ob.influence) && ob.influence < 100 ? 1 : 0)) > 0 ||
					  (!cmp && (cmp = oi.energy - ob.energy) < 0) ||
					  (!cmp && (cmp = (oi.exp / oi.energy) - (ob.exp / ob.energy)) > 0) ||
					  (!cmp && (cmp = (oi.reward / oi.energy) - (ob.reward / ob.energy)) > 0))) {
						best_cartigan = i;
					}// Deliberate fallthrough
				case 'Subquests': // Find the cheapest energy cost *sub*quest with influence under 100%
					ob = data.id[best_subquest];
					// order: <energy, >exp, >cash (subquests)
					if (oi.type === 2 && isNumber(oi.influence) && oi.influence < 100 &&
					  (!best_subquest ||
					  (cmp = oi.energy - ob.energy) < 0 ||
					  (!cmp && (cmp = (oi.exp / oi.energy) - (ob.exp / ob.energy)) > 0) ||
					  (!cmp && (cmp = (oi.reward / oi.energy) - (ob.reward / ob.energy)) > 0))) {
						best_subquest = i;
					}// Deliberate fallthrough
				case 'Advancement': // Complete all required main / boss quests in an area to unlock the next one (type === 2 means subquest)
					if (isNumber(oi.land) && oi.land > best_land) { // No need to revisit old lands - leave them to Influence
						best_land = oi.land;
						best_advancement = null;
						best_adv_eff = 1e10;
					}
					ob = data.id[best_advancement];
					// order: <effort, >exp, >cash, <energy (advancement)
					if (oi.type !== 2 && isNumber(oi.land) &&
					  //oi.level === 1 &&  // Need to check if necessary to do boss to unlock next land without requiring orb
					  oi.land >= best_land &&
					  ((isNumber(oi.influence) && Generals.test(oi.general) && oi.level <= 1 && oi.influence < 100) || (oi.type === 3 && !Alchemy.get(['ingredients', oi.itemimg], 0, 'number'))) &&
					  (!best_advancement ||
					  (cmp = eff - best_adv_eff) < 0 ||
					  (!cmp && (cmp = (oi.exp / oi.energy) - (ob.exp / ob.energy)) > 0) ||
					  (!cmp && (cmp = (oi.reward / oi.energy) - (ob.reward / ob.energy)) > 0) ||
					  (!cmp && (cmp = oi.energy - ob.energy) < 0))) {
						best_land = Math.max(best_land, oi.land);
						best_advancement = i;
						best_adv_eff = eff;
					}// Deliberate fallthrough
				case 'Influence': // Find the cheapest energy cost quest with influence under 100%
					ob = data.id[best_influence];
					// order: <effort, >exp, >cash, <energy (influence)
					if (isNumber(oi.influence) &&
					  (!oi.general || Generals.test(oi.general)) &&
					  oi.influence < 100 &&
					  (!best_influence ||
					  (cmp = eff - best_inf_eff) < 0 ||
					  (!cmp && (cmp = (oi.exp / oi.energy) - (ob.exp / ob.energy)) > 0) ||
					  (!cmp && (cmp = (oi.reward / oi.energy) - (ob.reward / ob.energy)) > 0) ||
					  (!cmp && (cmp = oi.energy - ob.energy) < 0))) {
						best_influence = i;
						best_inf_eff = eff;
					}// Deliberate fallthrough
				case 'Experience': // Find the best exp per energy quest
					ob = data.id[best_experience];
					// order: >exp, inf<100, >cash, <energy (experience)
					if (!best_experience ||
					  (cmp = (oi.exp / oi.energy) - (ob.exp / ob.energy)) > 0 ||
					  (!cmp && (cmp = (isNumber(oi.influence) && oi.influence < 100 ? 1 : 0) - (isNumber(ob.influence) && ob.influence < 100 ? 1 : 0)) > 0) ||
					  (!cmp && (cmp = (oi.reward / oi.energy) - (ob.reward / ob.energy)) > 0) ||
					  (!cmp && (cmp = oi.energy - ob.energy) < 0)) {
						best_experience = i;
					}
					break;
				case 'Inf+Exp': // Find the best exp per energy quest, favouring quests needing influence
					ob = data.id[best_experience];
					// order: inf<100, >exp, >cash, <energy (inf+exp)
					if (!best_experience ||
					  (cmp = (isNumber(oi.influence) && oi.influence < 100 ? 1 : 0) - (isNumber(ob.influence) && ob.influence < 100 ? 1 : 0)) > 0 ||
					  (!cmp && (cmp = (oi.exp / oi.energy) - (ob.exp / ob.energy)) > 0) ||
					  (!cmp && (cmp = (oi.reward / oi.energy) - (ob.reward / ob.energy)) > 0) ||
					  (!cmp && (cmp = oi.energy - ob.energy) < 0)) {
						best_experience = i;
					}
					break;
				case 'Inf+Cash': // Find the best (average) cash per energy quest, favouring quests needing influence
					ob = data.id[best];
					// order: inf<100, >cash, >exp, <energy (inf+cash)
					if (!best ||
					  (cmp = (isNumber(oi.influence) && oi.influence < 100 ? 1 : 0) - (isNumber(ob.influence) && ob.influence < 100 ? 1 : 0)) > 0 ||
					  (!cmp && (cmp = (oi.reward / oi.energy) - (ob.reward / ob.energy)) > 0) ||
					  (!cmp && (cmp = (oi.exp / oi.energy) - (ob.exp / ob.energy)) > 0) ||
					  (!cmp && (cmp = oi.energy - ob.energy) < 0)) {
						best = i;
					}
					break;
				case 'Cash': // Find the best (average) cash per energy quest
					ob = data.id[best];
					// order: >cash, inf<100, >exp, <energy (cash)
					if (!best ||
					  (cmp = (oi.reward / oi.energy) - (ob.reward / ob.energy)) > 0 ||
					  (!cmp && (cmp = (isNumber(oi.influence) && oi.influence < 100 ? 1 : 0) - (isNumber(ob.influence) && ob.influence < 100 ? 1 : 0)) > 0) ||
					  (!cmp && (cmp = (oi.exp / oi.energy) - (ob.exp / ob.energy)) > 0) ||
					  (!cmp && (cmp = oi.energy - ob.energy) < 0)) {
						best = i;
					}
					break;
				default: // For everything else, there's (cheap energy) items...
					ob = data.id[best];
					// order: <energy, inf<100, >exp, >cash (item)
					if (oi.item === this.option.what &&
					  (!best ||
					  (cmp = oi.energy - ob.energy) < 0 ||
					  (!cmp && (cmp = (isNumber(oi.influence) && oi.influence < 100 ? 1 : 0) - (isNumber(ob.influence) && ob.influence < 100 ? 1 : 0)) > 0) ||
					  (!cmp && (cmp = (oi.exp / oi.energy) - (ob.exp / ob.energy)) > 0) ||
					  (!cmp && (cmp = (oi.reward / oi.energy) - (ob.reward / ob.energy)) > 0))) {
						best = i;
					}
					break;
			}
		}
		switch(this.option.what) { // Automatically fallback on type - but without changing option
			case 'Vampire Lord':best = best_vampire || best_advancement || best_influence || best_experience;break;
			case 'Cartigan':	best = best_cartigan || best_advancement || best_influence || best_experience;break;
			case 'Subquests':	best = best_subquest || best_advancement || best_influence || best_experience;break;
			case 'Advancement':	best = best_advancement || best_influence || best_experience;break;
			case 'Influence':	best = best_influence || best_experience;break;
			case 'Inf+Exp':		best = best_experience;break;
			case 'Experience':	best = best_experience;break;
			default:break;
		}
	}
	if (best !== this.runtime.best) {
		this.runtime.best = best;
		if (best) {
			this.runtime.energy = data.id[best].energy;
			console.log(warn(), 'Wanting to perform - ' + data.id[best].name + ' in ' + (isNumber(data.id[best].land) ? this.land[data.id[best].land] : this.area[data.id[best].area]) + ' (energy: ' + data.id[best].energy + ', experience: ' + data.id[best].exp + ', gold: $' + data.id[best].reward.SI() + ')');
		}
	}
	if (best) {
		Dashboard.status(this, (isNumber(data.id[best].land) ? this.land[data.id[best].land] : this.area[data.id[best].area]) + ': ' + data.id[best].name + ' (' + makeImage('energy') + data.id[best].energy + ' = ' + makeImage('exp') + data.id[best].exp + ' + ' + makeImage('gold') + '$' + data.id[best].reward.SI() + (data.id[best].item ? Town.get([data.id[best].item,'img'], null) ? ' + <img style="width:16px;height:16px;margin-bottom:-4px;" src="' + imagepath + Town.get([data.id[best].item, 'img']) + '" title="' + data.id[best].item + '">' : ' + ' + data.id[best].item : '') + (isNumber(data.id[best].influence) && data.id[best].influence < 100 ? (' @ ' + makeImage('percent','Influence') + data.id[best].influence + '%') : '') + ')');
	} else {
		Dashboard.status(this);
	}
};

Quest.work = function(state) {
	var mid, general = 'any', best = Queue.runtime.quest || this.runtime.best, useable_energy = Queue.runtime.force.energy ? Queue.runtime.energy : Queue.runtime.energy - this.option.energy_reserve;
	if (!best || (!Queue.runtime.quest && this.runtime.energy > useable_energy)) {
		if (state && this.option.bank && !Bank.stash()) {
			return QUEUE_CONTINUE;
		}
		return QUEUE_FINISH;
	}
	// If holding for fortify, then don't quest if we have a secondary or defend target possible, unless we're forcing energy.
	if ((Queue.runtime.levelup && !Queue.runtime.quest)
			|| (!Queue.runtime.levelup 
				&& ((this.option.monster === 'When able' && Monster.get('runtime.defending')) 
					|| (this.option.monster === 'Wait for' && (Monster.get('runtime.defending')
						|| !Queue.runtime.force.energy))))) {
		return QUEUE_FINISH;
	}
	if (!state) {
		return QUEUE_CONTINUE;
	}
	if (this.option.general) {
		if (this.data.id[best].general && isNumber(this.data.id[best].influence) && this.data.id[best].influence < 100) {
			general = this.data.id[best].general;
		} else {
			general = Generals.best('under level 4');
			switch(this.option.what) {
				case 'Vampire Lord':
				case 'Cartigan':
					if (this.data.id[best].general) {
						general = this.data.id[best].general;
					} else {
						if (general === 'any' && isNumber(this.data.id[best].influence) && this.data.id[best].influence < 100) {
							general = Generals.best('influence');
						}
						if (general === 'any') {
							general = Generals.best('item');
						}
					}
					break;
				case 'Subquest':
				case 'Advancement':
				case 'Influence':
				case 'Inf+Exp':
				case 'Experience':
				case 'Inf+Cash':
				case 'Cash':
					if (isNumber(this.data.id[best].influence) && this.data.id[best].influence < 100) {
						if (this.data.id[best].general) {
							general = this.data.id[best].general;
						} else if (general === 'any') {
							general = Generals.best('influence');
						}
					}
					break;
				default:
					if (isNumber(this.data.id[best].influence) && this.data.id[best].influence < 100) {
						if (this.data.id[best].general) {
							general = this.data.id[best].general;
						} else if (general === 'any') {
							general = Generals.best('influence');
						}
					}
					if (general === 'any') {
						general = Generals.best('item');
					}
					break;
			}
			if (general === 'any') {
				general = 'cash';
			}
		}
	} else {
		general = this.option.general_choice;
	}
	if (!Generals.to(Queue.runtime.general || general)) {
		return QUEUE_CONTINUE;
	}
	switch(this.data.id[best].area) {
		case 'quest':
			if (!Page.to('quests_quest' + (this.data.id[best].land + 1))) {
				return QUEUE_CONTINUE;
			}
			break;
		case 'demiquest':
			if (!Page.to('quests_demiquests')) {
				return QUEUE_CONTINUE;
			}
			break;
		case 'atlantis':
			if (!Page.to('quests_atlantis')) {
				return QUEUE_CONTINUE;
			}
			break;
		default:
			console.log(log(), 'Can\'t get to quest area!');
			return QUEUE_FINISH;
	}
	console.log(warn(), 'Performing - ' + this.data.id[best].name + ' (energy: ' + this.data.id[best].energy + ')');
	//console.log(warn(),'Quest ' + this.data.id[best].name + ' general ' + this.data.id[best].general + ' test ' + !Generals.test(this.data.id[best].general || 'any') + ' this.data || '+ (this.data.id[best].general || 'any') + ' queue ' + (Queue.runtime.general && this.data.id[best].general));
	if (!Page.click($('input[name="quest"][value="' + best + '"]').siblings('.imgButton').children('input[type="image"]'))) { // Can't find the quest, so either a bad page load, or bad data - delete the quest and reload, which should force it to update ok...
		console.log(warn(), 'Can\'t find button for ' + this.data.id[best].name + ', so deleting and re-visiting page...');
		delete this.data.id[best];
		this.runtime.best = null;
		Page.reload();
	}
	Queue.runtime.quest = false;
	if (this.data.id[best].type === 3) {// Just completed a boss quest
		if (!Alchemy.get(['ingredients', this.data.id[best].itemimg], 0, 'number')) {// Add one as we've just gained it...
			Alchemy.set(['ingredients', this.data.id[best].itemimg], 1);
		}
		if (this.option.what === 'Advancement' && Page.pageNames['quests_quest' + (this.data.id[best].land + 2)]) {// If we just completed a boss quest, check for a new quest land.
			Page.to('quests_quest' + (this.data.id[best].land + 2));// Go visit the next land as we've just unlocked it...
		}
	}
	return QUEUE_RELEASE;
};

Quest.dashboard = function(sort, rev) {
	var self = this, i, j, k, o, r, quest, list = [], output = [], vv, tt, cc, span, v, eff;
	if (typeof sort === 'undefined') {
		this.temp.order = [];
		for (i in this.data.id) {
			this.temp.order.push(i);
		}
	}
	if (typeof sort === 'undefined') {
		sort = (this.runtime.sort || 1);
	}
	if (typeof rev === 'undefined'){
		rev = (this.runtime.rev || false);
	}
	this.runtime.sort = sort;
	this.runtime.rev = rev;
	function getValue(q){
		var r, n, o = self.data.id[q];
		switch(sort) {
			case 0:	// general
				return o.general || 'zzz';
			case 1: // name
				return o.name || 'zzz';
			case 2: // area
				return isNumber(o.land) && typeof self.land[o.land] !== 'undefined' ? self.land[o.land] : self.area[o.area];
			case 3: // level
				return (isNumber(o.level) ? o.level : -1) * 100 + (o.influence || 0);
			case 4: // energy
				return o.energy;
			case 5: // effort
				return o.eff || (o.energy * self.wiki_reps(o));
			case 6: // exp
				return o.exp / o.energy;
			case 7: // reward
				return o.reward / o.energy;
			case 8: // item
				return o.item || 'zzz';
		}
		return 0; // unknown
	}
	this.temp.order.sort(function(a,b) {
		var aa = getValue(a), bb = getValue(b);
		if (isString(aa) || isString(bb)) {
			return (rev ? (''+bb).localeCompare(aa) : (''+aa).localeCompare(bb));
		}
		return (rev ? (aa || 0) - (bb || 0) : (bb || 0) - (aa || 0));
	});
	th(output, 'General');
	th(output, 'Name');
	th(output, 'Area');
	th(output, 'Level');
	th(output, 'Energy');
	th(output, 'Effort', 'title="Energy required per influence level."');
	th(output, '@&nbsp;Exp');
	th(output, '@&nbsp;Reward');
	th(output, 'Item');
	list.push('<table cellspacing="0" style="width:100%"><thead><tr>' + output.join('') + '</tr></thead><tbody>');
	for (o=0; o<this.temp.order.length; o++) {
		i = this.temp.order[o];
		quest = this.data.id[i];
		output = [];

		// general
		td(output, Generals.get([quest.general]) ? '<img style="width:25px;height:25px;" src="' + imagepath + Generals.get([quest.general, 'img']) + '" alt="' + quest.general + '" title="' + quest.general + '">' : '');

		// name
		vv = quest.name;
		span = cc = '';
		tt = 'id: ' + i;
		if (quest.main) {
			tt += ' | main:';
			if (this.data.id[quest.main] && this.data.id[quest.main].name) {
				tt += ' ' + this.data.id[quest.main].name;
			}
			tt += ' (id: ' + quest.main + ')';
		}
		if (this.runtime.best === i) {
			vv = '<b>' + vv + '</b>';
			cc = 'green';
		}
		if (tt !== '') {
			tt = 'title="' + tt + '"';
		}
		if (cc !== '') {
			span += ' style="color:' + cc + '"';
		}
		if (span !== '') {
			vv = '<span' + span + '>' + vv + '</span>';
		}
		th(output, vv, tt);

		// area
		td(output, isNumber(quest.land) ? this.land[quest.land].replace(' ','&nbsp;') : this.area[quest.area].replace(' ','&nbsp;'));

		// level
		span = vv = tt = cc = '';
		if (isNumber(v = quest.level)) {
			vv = v + '&nbsp;(' + quest.influence + '%)';
			if (v >= 4 && quest.influence >= 100) {
				cc = 'red';
			} else if (this.cost(i)) {
				cc = 'blue';
				if (tt !== '') {
					tt += '; ';
				}
				tt += this.temp.desc;
			} else if (isNumber(quest.influence) && quest.influence < 100) {
				cc = 'green';
			}
		} else if (this.cost(i)) {
			vv = '<i>n/a</i>';
			cc = 'blue';
			if (tt !== '') {
				tt += '; ';
			}
			tt += this.temp.desc;
		}
		if (tt !== '') {
			tt = 'title="' + tt + '"';
		}
		if (cc !== '') {
			span += ' style="color:' + cc + '"';
		}
		if (span !== '') {
			vv = '<span' + span + '>' + vv + '</span>';
		}
		td(output, vv, tt);

		// energy
		td(output, quest.energy);

		// effort
		vv = tt = cc = span = '';
		if (!isNumber(quest.level)) {
			vv = '<i>' + quest.energy + '</i>';
		} else {
			r = 'reps_' + (isNumber(quest.land) ? (quest.land + 1) : quest.area);
			j = quest.name.toLowerCase();
			vv = quest.eff || (quest.energy * this.wiki_reps(quest));
			tt = 'effort ' + vv;
			if (0 < quest.influence && quest.influence < 100) {
				v = Math.round(vv * (100 - quest.influence) / 100);
				tt += ' (' + v + ')';
			}
			if ((v = quest.reps)) {
				if (tt !== '') {
					tt += ', ';
				}
				tt += 'reps ' + v;
				if (quest.m_d && quest.m_c) {
					var v1 = 100 * quest.m_c / quest.m_d;
					var v2 = 2 / quest.m_c;
					var lo = Math.ceil(v1 - v2);
					var hi = Math.ceil(v1 + v2);
					if (lo < hi) {
						tt += ' [' + lo + ',' + hi + ']';
					}
					v = this.wiki_reps(quest, true);
					if (!v || Math.ceil(lo) > v || Math.ceil(hi) < v) {
						tt += ' wiki[' + (v || '?') + ']';
						if (lo + 1 >= hi) {
							cc = 'purple';
						}
					} else if (lo + 1 >= hi) {
						cc = 'green';
					}
				}
			} else if ((v = this.wiki_reps(quest, true))) {
				if (tt !== '') {
					tt += ', ';
				}
				tt += 'wiki reps ' + v;
			} else {
				if (tt !== '') {
					tt += ', ';
				}
				tt += 'assuming reps 16';
				cc = 'blue';
			}
			if (quest.m_d || quest.m_c) {
				vv = '<b>' + vv + '</b>';
				if (tt !== '') {
					tt += ', ';
				}
				tt += 'effort metrics ' + (quest.m_d || '?') + '/' + (quest.m_c || '?');
			}
			if (tt !== '') {
				tt = 'title="' + tt + '"';
			}
		}
		if (cc !== '') {
			span += ' style="color:' + cc + '"';
		}
		if (span !== '') {
			vv = '<span' + span + '>' + vv + '</span>';
		}
		td(output, vv, tt);

		// exp
		td(output, (quest.exp / quest.energy).round(2), 'title="' + quest.exp + ' total, ' + (quest.exp / quest.energy * 12).round(2) + ' per hour"');

		// reward
		td(output, '$' + (quest.reward / quest.energy).addCommas(0), 'title="$' + quest.reward.addCommas() + ' total, $' + (quest.reward / quest.energy * 12).addCommas(0) + ' per hour"');

		// item
		td(output, quest.itemimg ? '<img style="width:25px;height:25px;" src="' + imagepath + quest.itemimg + '" alt="' + quest.item + '" title="' + quest.item + '">' : '');

		tr(list, output.join(''), 'style="height:25px;"');
	}
	list.push('</tbody></table>');
	$('#golem-dashboard-Quest').html(list.join(''));
	$('#golem-dashboard-Quest tbody tr td:nth-child(2)').css('text-align', 'left');
	if (typeof sort !== 'undefined') {
		$('#golem-dashboard-Quest thead th:eq('+sort+')').attr('name',(rev ? 'reverse' : 'sort')).append('&nbsp;' + (rev ? '&uarr;' : '&darr;'));
	}
};

Quest.cost = function(id) {
	/*jslint onevar:false*/
	var quest = this.get('data.id');
	var gens = Generals.get('data');
	var town = Town.get('data');
	var artifact = Player.get('data.artifact');
	var c, i, j, k, n, cost, upkeep, desc, ccount, ucount;
	/*jslint onevar:true*/

	this.temp.cost = 1e50;
	this.temp.upkeep = 1e50;
	this.temp.desc = '(n/a)';

	cost = ccount = 0;
	upkeep = ucount = 0;
	desc = '';


	if (id && quest[id]) {
		if ((i = quest[id].general)) {
			if (!gens || !gens[i]) {
				cost += 1e50;
				if (desc !== '') {
					desc += '; ';
				}
				desc += '(n/a)';
			}
		}

		if (quest[id].units) {
			for (i in quest[id].units) {
				n = quest[id].units[i];
				c = j = 0;
				k = 1e50;
				if (town && town[i]) {
					c = town[i].own || 0;
					if (town[i].buy && town[i].buy.length) {
						j = town[i].upkeep || 0;
						k = town[i].cost || 0;
					}
				} else if (artifact && artifact[i]) {
					c = 1;
					j = k = 0;
				}
				if (c < n) {
					cost += (n - c) * k;
					upkeep += (n - c) * j;
					if (desc !== '') {
						desc += '; ';
					}
					desc += (n - c) + '/' + n + ' ' + i;
					if (k >= 1e50) {
						desc += ' (n/a)';
						ccount++;
					} else if (k) {
						desc += ' $' + ((n - c) * k).SI();
						ccount++;
					}
					if (j) {
						desc += ' (upkeep $' + ((n - c) * j).SI() + ')';
						ucount++;
					}
				}
			}
		}

		if (ccount > 1 && cost) {
			desc += '; total ';
			if (cost < 1e50) {
				desc += '$' + cost.SI();
			} else {
				desc += '(n/a)';
			}
		}

		if (ucount > 1 && upkeep) {
			desc += '; upkeep $' + upkeep.SI();
		}

		this.temp.cost = cost;
		this.temp.upkeep = upkeep;
		this.temp.desc = desc;
	}

	return this.temp.cost;
};

Quest.wiki_reps = function(quest, pure) {
	var reps = 0, n, q, v;

	if (isObject(quest)) {
		if (!isNumber(quest.level)) {
			reps = 1;
		} else {
			n = (quest.name || '?').toLowerCase();
			q = (isNumber(quest.land) ? (quest.land + 1) : quest.area) || '?';
			if ((v = this.rdmap[n + ';' + q])) {
				reps = v;
			}
		}
	}

	if (!reps && !pure) {
		reps = 16;
	}

	return reps;
};


Quest.rts = 1300071247;	// Mon Mar 14 02:54:07 2011 UTC
Quest.rdata =			// #347
{
	'a demonic transformation':			{ 'reps_q4':  40 },
	'a forest in peril':				{ 'reps_d4':   9 },
	'a kidnapped princess':				{ 'reps_d1':  10 },
	'a new dawn':						{ 'reps_q12':  7 },
	'a surprise from terra':			{ 'reps_q12': 12 },
	'across the sea':					{ 'reps_q11':  8 },
	'aid corvintheus':					{ 'reps_d3':   9 },
	'aid the angels':					{ 'reps_q9':  17 },
	'approach the prayer chamber':		{ 'reps_d1':  12 },
	'approach the tree of life':		{ 'reps_d4':  12 },
	'ascent to the skies':				{ 'reps_q8':   0 },
	'attack from above':				{ 'reps_q9':  17 },
	'attack undead guardians':			{ 'reps_q6':  24 },
	'aurelius':							{ 'reps_q11': 11 },
	'aurelius outpost':					{ 'reps_q11':  9 },
	'avoid ensnarements':				{ 'reps_q3':  34 },
	'avoid the guards':					{ 'reps_q8':   0 },
	'avoid the patrols':				{ 'reps_q9':  17 },
	'banish the horde':					{ 'reps_q9':  17 },
	'battle a wraith':					{ 'reps_q2':  16 },
	'battle earth and fire demons':		{ 'reps_q4':  16 },
	'battle gang of bandits':			{ 'reps_q1':  10 },
	'battle orc captain':				{ 'reps_q3':  15 },
	'battle the black dragon':			{ 'reps_q4':  14 },
	'battle the ent':					{ 'reps_d4':  12 },
	'battling the demons':				{ 'reps_q9':  17 },
	'being followed':					{ 'reps_q7':  15 },
	'blood wing king of the dragons':	{ 'reps_d2':  20 },
	'breach the barrier':				{ 'reps_q8':  14 },
	'breach the keep entrance':			{ 'reps_d3':  12 },
	'breaching the gates':				{ 'reps_q7':  15 },
	'break aurelius guard':				{ 'reps_q11':  0 },
	'break evil seal':					{ 'reps_q7':  17 },
	'break the lichs spell':			{ 'reps_d3':  12 },
	'break the line':					{ 'reps_q10':  0 },
	'breaking through the guard':		{ 'reps_q9':  17 },
	'bridge of elim':					{ 'reps_q8':  11 },
	'burning gates':					{ 'reps_q7':   0 },
	'call of arms':						{ 'reps_q6':  25 },
	'cast aura of night':				{ 'reps_q5':  32 },
	'cast blizzard':					{ 'reps_q10':  0 },
	'cast fire aura':					{ 'reps_q6':  24 },
	'cast holy light':					{ 'reps_q6':  24 },
	'cast holy light spell':			{ 'reps_q5':  24 },
	'cast holy shield':					{ 'reps_d3':  12 },
	'cast meteor':						{ 'reps_q5':  32 },
	'castle of the black lion':			{ 'reps_d5':  13 },
	'castle of the damn':				{ 'reps_d3':  21 },
	'channel excalibur':				{ 'reps_q8':   0 },
	'charge ahead':						{ 'reps_q10':  0 },
	'charge the castle':				{ 'reps_q7':  15 },
	'chasm of fire':					{ 'reps_q10': 10 },
	'city of clouds':					{ 'reps_q8':  11 },
	'clear the rocks':					{ 'reps_q11':  0 },
	'climb castle cliffs':				{ 'reps_q11':  0 },
	'climb the mountain':				{ 'reps_q8':   0 },
	'close the black portal':			{ 'reps_d1':  12 },
	'collect astral souls':				{ 'reps_q12':  0 },
	'confront the black lion':			{ 'reps_d5':  12 },
	'confront the rebels':				{ 'reps_q10': 10 },
	'consult aurora':					{ 'reps_d4':  12 },
	'corruption of nature':				{ 'reps_d4':  20 },
	'cover tracks':						{ 'reps_q7':  19 },
	'cross lava river':					{ 'reps_q7':  20 },
	'cross the bridge':					{ 'reps_q8':   0, 'reps_q10':  0 },
	'cross the moat':					{ 'reps_q11':  0 },
	'crossing the chasm':				{ 'reps_q2':  13, 'reps_q8':   0 },
	'cure infested soldiers':			{ 'reps_q6':  25 },
	'dark heart of the woods':			{ 'reps_q12':  9 },
	'deal final blow to bloodwing':		{ 'reps_d2':  12 },
	'deathrune castle':					{ 'reps_q7':  12 },
	'decipher the clues':				{ 'reps_q9':  17 },
	'defeat and heal feral animals':	{ 'reps_d4':  12 },
	'defeat angelic sentinels':			{ 'reps_q8':  14 },
	'defeat astral wolves':				{ 'reps_q12':  0 },
	'defeat bear form':					{ 'reps_q11':  0 },
	'defeat bloodwing':					{ 'reps_d2':  12 },
	'defeat chimerus':					{ 'reps_d1':  12 },
	'defeat darien woesteel':			{ 'reps_d5':   9 },
	'defeat demonic guards':			{ 'reps_q7':  17 },
	'defeat fire elementals':			{ 'reps_q10':  0 },
	'defeat frost minions':				{ 'reps_q3':  40 },
	'defeat lion defenders':			{ 'reps_q11':  0 },
	'defeat orc patrol':				{ 'reps_q8':   0 },
	'defeat rebels':					{ 'reps_q10':  0 },
	'defeat snow giants':				{ 'reps_q3':  24 },
	'defeat the bandit leader':			{ 'reps_q1':   6 },
	'defeat the banshees':				{ 'reps_q5':  25 },
	'defeat the black lion army':		{ 'reps_d5':  12 },
	'defeat the demonic guards':		{ 'reps_d1':  12 },
	'defeat the demons':				{ 'reps_q9':  17 },
	'defeat the kobolds':				{ 'reps_q10':  0 },
	'defeat the patrols':				{ 'reps_q9':  17 },
	'defeat the seraphims':				{ 'reps_q8':   0 },
	'defeat tiger form':				{ 'reps_q11':  0 },
	'defend the village':				{ 'reps_d3':  12 },
	'desert temple':					{ 'reps_q11': 12 },
	'destroy black oozes':				{ 'reps_q11':  0 },
	'destroy fire dragon':				{ 'reps_q4':  10 },
	'destroy fire elemental':			{ 'reps_q4':  16 },
	'destroy horde of ghouls & trolls':	{ 'reps_q4':   9 },
	'destroy the black gate':			{ 'reps_d1':  12 },
	'destroy the black portal':			{ 'reps_d1':  12 },
	'destroy the bolted door':			{ 'reps_d3':  12 },
	'destroy undead crypt':				{ 'reps_q1':   5 },
	'destruction abound':				{ 'reps_q8':  11 },
	'determine cause of corruption':	{ 'reps_d5':  12 },
	'dig up star metal':				{ 'reps_d3':  12 },
	'disarm townspeople':				{ 'reps_q11':  0 },
	'discover cause of corruption':		{ 'reps_d4':  12 },
	'dismantle orc patrol':				{ 'reps_q3':  32 },
	'dispatch more cultist guards':		{ 'reps_d1':  12 },
	'distract the demons':				{ 'reps_q9':  17 },
	'dragon slayer':					{ 'reps_d2':  14 },
	'druidic prophecy':					{ 'reps_q11':  9 },
	"duel cefka's knight champion":		{ 'reps_q4':  10 },
	'duel with guards':					{ 'reps_q12':  0 },
	'dwarven stronghold':				{ 'reps_q10': 10 },
	'eastern corridor':					{ 'reps_q11':  0 },
	'elekin the dragon slayer':			{ 'reps_d2':  10 },
	'end of the road':					{ 'reps_q9':  17 },
	'enlist captain morgan':			{ 'reps_q11':  0 },
	'entrance denied':					{ 'reps_q12': 12 },
	'entrance to terra':				{ 'reps_q1':   9 },
	'equip soldiers':					{ 'reps_q6':  25 },
	'escape from trakan':				{ 'reps_q12':  7 },
	'escaping the chaos':				{ 'reps_q9':  17 },
	'escaping the stronghold':			{ 'reps_q9':  10 },
	'explore merchant plaza':			{ 'reps_q11':  0 },
	'explore the temple':				{ 'reps_q11':  0 },
	'extinguish desert basilisks':		{ 'reps_q11':  0 },
	'extinguish the fires':				{ 'reps_q8':   0 },
	'falls of jiraya':					{ 'reps_q1':  10 },
	'family ties':						{ 'reps_d5':  11 },
	'felthias fields':					{ 'reps_q12': 14 },
	'fend off demons':					{ 'reps_q7':  20 },
	'fiery awakening':					{ 'reps_q7':  12 },
	"fight cefka's shadow guard":		{ 'reps_q4':  10 },
	'fight demonic worshippers':		{ 'reps_q5':  24 },
	'fight dragon welps':				{ 'reps_q4':  10 },
	'fight ghoul army':					{ 'reps_q1':   5 },
	'fight gildamesh':					{ 'reps_q3':  32 },
	'fight ice beast':					{ 'reps_q3':  40 },
	'fight infested soldiers':			{ 'reps_q6':  25 },
	'fight off demons':					{ 'reps_q5':  21 },
	'fight off zombie infestation':		{ 'reps_d3':  12 },
	'fight snow king':					{ 'reps_q3':  24 },
	'fight the half-giant sephor':		{ 'reps_q4':   9 },
	'fight treants':					{ 'reps_q2':  27 },
	'fight undead zombies':				{ 'reps_q2':  16 },
	'fight water demon lord':			{ 'reps_q2':  31 },
	'fight water demons':				{ 'reps_q2':  30 },
	'fight water spirits':				{ 'reps_q2':  40 },
	'find evidence of dragon attack':	{ 'reps_d2':   8 },
	'find hidden path':					{ 'reps_d2':  10 },
	'find nezeals keep':				{ 'reps_d3':  12 },
	'find rock worms weakness':			{ 'reps_d2':  10 },
	'find source of the attacks':		{ 'reps_d3':  12 },
	'find survivors':					{ 'reps_q8':  14 },
	'find the dark elves':				{ 'reps_d1':  12 },
	'find the demonic army':			{ 'reps_d1':  12 },
	'find the druids':					{ 'reps_d4':  12 },
	'find the entrance':				{ 'reps_q8':   0 },
	'find the exit':					{ 'reps_q9':  17 },
	'find the safest path':				{ 'reps_q10':  0 },
	'find the source of corruption':	{ 'reps_d4':  12 },
	'find the woman? father':			{ 'reps_d5':  12 },
	'find troll weakness':				{ 'reps_q2':  10 },
	'find your way out':				{ 'reps_q7':  15 },
	'fire and brimstone':				{ 'reps_q7':  12 },
	'forest of ash':					{ 'reps_d4':  11 },
	'freeing arielle':					{ 'reps_q12': 10 },
	'furest hellblade':					{ 'reps_d3':  17 },
	'gain access':						{ 'reps_q10':  0 },
	'gain entry':						{ 'reps_q11':  0 },
	'gates to the undead':				{ 'reps_q6':  17 },
	'gateway':							{ 'reps_q8':  11 },
	'get information from the druid':	{ 'reps_d4':  12 },
	'get water for the druid':			{ 'reps_d4':  12 },
	'grim outlook':						{ 'reps_q9':  17 },
	'guard against attack':				{ 'reps_d5':  12 },
	'heal wounds':						{ 'reps_q7':  20 },
	'heat the villagers':				{ 'reps_q1':   5 },
	'holy fire':						{ 'reps_d4':  11 },
	'impending battle':					{ 'reps_q10': 10 },
	'interrogate the prisoners':		{ 'reps_q9':  17 },
	'investigate the gateway':			{ 'reps_q8':   0 },
	'ironfist dwarves':					{ 'reps_q10': 10 },
	'join up with artanis':				{ 'reps_d1':  12 },
	'judgement stronghold':				{ 'reps_q8':  11 },
	'juliean desert':					{ 'reps_q11': 12 },
	'kelp forest':						{ 'reps_a1':  20 },
	'kill gildamesh':					{ 'reps_q3':  34 },
	'kill vampire bats':				{ 'reps_d3':  10 },
	'koralan coast town':				{ 'reps_q11': 14 },
	'koralan townspeople':				{ 'reps_q11': 10 },
	'learn about death knights':		{ 'reps_d5':  12 },
	'learn aurelius intentions':		{ 'reps_q11':  0 },
	'learn counterspell':				{ 'reps_d1':  12 },
	'learn holy fire':					{ 'reps_d4':  12 },
	'look for clues':					{ 'reps_q8':  14 },
	'lothar the ranger':				{ 'reps_q12':  9 },
	'marauders!':						{ 'reps_d5':   9 },
	'march into the undead lands':		{ 'reps_q6':  24 },
	'march to the unholy war':			{ 'reps_q6':  25 },
	'mausoleum of triste':				{ 'reps_q3':  17 },
	'misty hills of boralis':			{ 'reps_q3':  20 },
	'mount aretop':						{ 'reps_d2':  25 },
	'nightfall':						{ 'reps_q12':  9 },
	'nightmare':						{ 'reps_q6':  20 },
	'outpost entrance':					{ 'reps_q11': 12 },
	'path to heaven':					{ 'reps_q8':  11 },
	'persuade terra':					{ 'reps_q12':  0 },
	'pick up the orc trail':			{ 'reps_q1':   6 },
	'plan the attack':					{ 'reps_d5':  12 },
	'portal of atlantis':				{ 'reps_a1':  20 },
	'power of excalibur':				{ 'reps_q8':  11 },
	'prepare for ambush':				{ 'reps_q1':   6 },
	'prepare for battle':				{ 'reps_d2':  12, 'reps_q5':  21 },
	'prepare for the trials':			{ 'reps_q9':  17 },
	'prepare tactics':					{ 'reps_q10':  0 },
	'prepare troops':					{ 'reps_q10':  0 },
	'prevent dragon? escape':			{ 'reps_d2':  12 },
	'protect temple from raiders':		{ 'reps_q2':  40 },
	'purge forest of evil':				{ 'reps_q2':  27 },
	'pursuing orcs':					{ 'reps_q1':  13 },
	'put out the fires':				{ 'reps_d2':   8 },
	'question dark elf prisoners':		{ 'reps_d1':  12 },
	'question the druidic wolf':		{ 'reps_d4':  12 },
	'question townspeople':				{ 'reps_q11':  0 },
	'question vulcan':					{ 'reps_q8':   0 },
	'ready the horses':					{ 'reps_q1':   6 },
	'reason with guards':				{ 'reps_q12':  0 },
	'recover the key':					{ 'reps_q9':  17 },
	'recruit allies':					{ 'reps_q10':  0 },
	'recruit elekin to join you':		{ 'reps_d2':   9 },
	'recruit furest to join you':		{ 'reps_d3':  12 },
	'repel gargoyle raid':				{ 'reps_q4':  14 },
	'request council':					{ 'reps_q10':  0 },
	'request entrance':					{ 'reps_q12':  0 },
	'rescue survivors':					{ 'reps_q8':  14 },
	'resist the lost souls':			{ 'reps_q5':  25 },
	'retrieve dragon slayer':			{ 'reps_d2':  10 },
	'retrieve the jeweled heart':		{ 'reps_d5':  12 },
	'ride to aretop':					{ 'reps_d2':  12 },
	'ride towards the palace':			{ 'reps_q9':  17 },
	'river of lava':					{ 'reps_q10': 10 },
	'river of light':					{ 'reps_q1':  10 },
	'save lost souls':					{ 'reps_q5':  24 },
	'save stranded soldiers':			{ 'reps_q10':  0 },
	'seek out elekin':					{ 'reps_d2':   9 },
	'seek out furest hellblade':		{ 'reps_d3':  12 },
	'seek out jeweled heart':			{ 'reps_d5':  12 },
	'shield of the stars':				{ 'reps_d3':  20 },
	'slaughter orcs':					{ 'reps_q3':  15 },
	'slay cave bats':					{ 'reps_d2':  10 },
	'slay the black dragons':			{ 'reps_q5':  32 },
	'slay the guardian':				{ 'reps_q9':  17 },
	'slay the sea serpent':				{ 'reps_d5':  12 },
	'sneak attack on dragon':			{ 'reps_d2':  12 },
	'sneak into the city':				{ 'reps_q8':  14 },
	'sneak up on orcs':					{ 'reps_q1':   7 },
	'soldiers of the black lion':		{ 'reps_d5':  10 },
	'spire of death':					{ 'reps_q5':  20 },
	'sporeguard forest':				{ 'reps_q12': 10 },
	'spring surprise attack':			{ 'reps_d5':  12 },
	'stop the wolf from channeling':	{ 'reps_d4':  12 },
	'storm the castle':					{ 'reps_d5':  12 },
	'storm the ivory palace':			{ 'reps_q9':  17 },
	'sulfurous springs':				{ 'reps_q11': 10 },
	'summon legendary defenders':		{ 'reps_q6':  25 },
	'surround rebels':					{ 'reps_q10':  0 },
	'survey battlefield':				{ 'reps_q10':  0 },
	'survey the surroundings':			{ 'reps_q8':  14 },
	'survive the storm':				{ 'reps_q11':  0 },
	'survive troll ambush':				{ 'reps_q2':  10 },
	'surviving the onslaught':			{ 'reps_q9':  17 },
	'tezzari village':					{ 'reps_q12': 12 },
	'the belly of the demon':			{ 'reps_q5':  16 },
	'the betrayed lands':				{ 'reps_q4':  16 },
	'the black portal':					{ 'reps_d1':  15 },
	'the cave of wonder':				{ 'reps_q3':  20 },
	'the crystal caverns':				{ 'reps_d2':  11 },
	'the darkening skies':				{ 'reps_q9':  17 },
	'the dead forests':					{ 'reps_q12': 11 },
	'the deep':							{ 'reps_a1':  20 },
	'the elven sorceress':				{ 'reps_d1':  11 },
	'the fallen druids':				{ 'reps_d4':  12 },
	'the final stretch':				{ 'reps_q9':  17 },
	'the forbidden forest':				{ 'reps_q2':  20 },
	'the forbidden ritual':				{ 'reps_q5':  20 },
	'the gateway':						{ 'reps_q12': 10 },
	'the hidden lair':					{ 'reps_d1':  13 },
	'the hollowing moon':				{ 'reps_q6':  17 },
	'the infestation of winterguard':	{ 'reps_d3':  10 },
	'the invasion':						{ 'reps_q8':  11 },
	'the keep of corelan':				{ 'reps_q3':  17 },
	'the keep of isles':				{ 'reps_q4':  16 },
	'the kingdom of alarean':			{ 'reps_d5':  15 },
	'the last gateway':					{ 'reps_q9':  17 },
	"the lich ne'zeal":					{ 'reps_d3':  13 },
	"the lich's keep":					{ 'reps_d3':  15 },
	'the living gates':					{ 'reps_q5':  20 },
	'the long path':					{ 'reps_q7':  12 },
	'the peaks of draneth':				{ 'reps_d5':  21 },
	'the poison source':				{ 'reps_q11':  0 },
	'the rebellion':					{ 'reps_q10': 10 },
	'the return home':					{ 'reps_q8':  11 },
	'the return of the dragon':			{ 'reps_d2':   9 },
	'the ride south':					{ 'reps_q8':   0 },
	'the river of blood':				{ 'reps_q5':  20 },
	'the scourge':						{ 'reps_q12':  8 },
	'the sea temple':					{ 'reps_a1':  20 },
	'the search for clues':				{ 'reps_d1':  12 },
	'the second temple of water':		{ 'reps_q4':  25 },
	'the smouldering pit':				{ 'reps_q4':  40 },
	'the source of darkness':			{ 'reps_d1':  20 },
	'the source of magic':				{ 'reps_d4':  15 },
	'the southern entrance':			{ 'reps_q12':  9 },
	'the stairs of terra':				{ 'reps_q2':  10 },
	'the stone lake':					{ 'reps_q1':  12 },
	'the sunken city':					{ 'reps_d5':  17 },
	'the tree of life':					{ 'reps_d4':  21 },
	'the vanguard of destruction':		{ 'reps_d1':  21 },
	'the water temple':					{ 'reps_q2':  17 },
	'til morning comes':				{ 'reps_q12': 11 },
	'track down soldiers':				{ 'reps_d5':  12 },
	'track sylvana':					{ 'reps_d1':  12 },
	'train with ambrosia':				{ 'reps_d1':  12 },
	'train with aurora':				{ 'reps_d4':  12 },
	'trakan prison':					{ 'reps_q12':  9 },
	'trakan sky bridge':				{ 'reps_q12': 11 },
	'trakan village':					{ 'reps_q12':  7 },
	'travel to the tree of life':		{ 'reps_d4':  12 },
	'travel to winterguard':			{ 'reps_d3':  12 },
	'triste':							{ 'reps_q3':  20 },
	'undead crusade':					{ 'reps_q6':  17 },
	'underground path':					{ 'reps_q12':  8 },
	'underwater ruins':					{ 'reps_a1':  20 },
	'unholy war':						{ 'reps_q6':  20 },
	'use battering ram':				{ 'reps_q11':  0 },
	'vengeance':						{ 'reps_d2':  17 },
	'vesuv bridge':						{ 'reps_q10': 10 },
	'vesuv lookout':					{ 'reps_q2':  17 },
	'visit the blacksmith':				{ 'reps_q1':  24 },
	'vulcans secret':					{ 'reps_q8':  11 },
	'watch the skies':					{ 'reps_d3':  12 }
};

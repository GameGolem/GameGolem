/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page, Queue, Resources,
	Alchemy, Bank, Battle, Generals, LevelUp, Monster, Player, Town,
	APP, APPID, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, shortNumber, Divisor, length, unique, deleteElement, sum, addCommas, findInArray, findInObject, objectIndex, sortObject, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime, ucfirst, ucwords,
	makeImage
*/
/********** Worker.Quest **********
* Completes quests with a choice of general
*/
// Should also look for quests_quest but that should never be used unless there's a new area
var Quest = new Worker('Quest');

Quest.defaults['castle_age'] = {
	pages:'quests_quest1 quests_quest2 quests_quest3 quests_quest4 quests_quest5 quests_quest6 quests_quest7 quests_quest8 quests_quest9 quests_quest10 quests_demiquests quests_atlantis'
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

Quest.land = ['Land of Fire', 'Land of Earth', 'Land of Mist', 'Land of Water', 'Demon Realm', 'Undead Realm', 'Underworld', 'Kingdom of Heaven', 'Ivory City','Earth II'];
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
		require:{'general':false},
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
		help:'Once you have unlocked all areas (Advancement) it will switch to Influence. Once you have 100% Influence it will switch to Experience. Cartigan will try to collect all items needed to summon Cartigan (via Alchemy), then will fall back to Advancement. Vampire Lord will try to collect 24, then fall back to Advancement. Subquests will only run subquests under 100% then fall back to Advancement (quick general levelling)'
	},{
		advanced:true,
		id:'ignorecomplete',
		label:'Only do incomplete quests',
		checkbox:true,
		help:'Will only do quests that aren\'t at 100% influence',
		require:{'what':['Cartigan', 'Vampire Lord']}
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

Quest.init = function() {
	var data = this.get('data'), runtime = this.get('runtime'), i, x;
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
	Resources.use('Energy');

	// one time pre-r845 fix for erroneous values in m_c, m_d, reps, eff
	if ((runtime.revision || 0) < 845) {
		for (i in data) {
			if (data[i].reps) {
				x = (this.rdata[i] && this.rdata[i].reps) || 16;
				if (data[i].reps < Math.round(x * 0.8) || data[i].reps > Math.round(x * 1.2)) {
					debug('Quest.init: deleting metrics for: ' + i);
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

	runtime.revision = revision; // started r845 for historic reference
};

Quest.parse = function(change) {
	if (change) {
		return false;
	}
	var data = this.data, last_main = 0, area = null, land = null, i, m_c, m_d, m_i, reps;
	if (Page.page === 'quests_quest') {
		return false; // This is if we're looking at a page we don't have access to yet...
	} else if (Page.page === 'quests_demiquests') {
		area = 'demiquest';
	} else if (Page.page === 'quests_atlantis') {
		area = 'atlantis';
	} else {
		area = 'quest';
		land = Page.page.regex(/quests_quest([0-9]+)/i) - 1;
	}
	for (i in data.id) {
		if (data.id[i].area === area && (area !== 'quest' || data.id[i].land === land)) {
//			debug('Deleting ' + i + '(' + (Quest.land[data.id[i].land] || data.id[i].area) + ')');
			delete data.id[i];
		}
	}
	if ($('div.quests_background,div.quests_background_sub').length !== $('div.quests_background .quest_progress,div.quests_background_sub .quest_sub_progress').length) {
		Page.to(Page.page, '');// Force a page reload as we're pretty sure it's a bad page load!
		return false;
	}
	$('div.quests_background,div.quests_background_sub,div.quests_background_special').each(function(i,el){
		var id, name, level, influence, reward, units, energy, tmp, type = 0;
		if ((tmp = $('input[name="quest"]', el)).length) {
		    id = $(tmp).val().regex(/(\d+)/);
		}
		if ($(el).hasClass('quests_background_sub')) { // Subquest
			name = $('.quest_sub_title', el).text().trim();
			reward = $('.qd_2_sub', el).text().replace(/mil/g, '000000').replace(/[^0-9$]/g, '').regex(/^([0-9]+)\$([0-9]+)\$([0-9]+)$/);
			energy = $('.qd_3_sub', el).text().regex(/([0-9]+)/);
			level = $('.quest_sub_progress', el).text().regex(/LEVEL ([0-9]+)/i);
			influence = $('.quest_sub_progress', el).text().regex(/INFLUENCE: ([0-9]+)%/i);
			type = 2;
		} else {
			name = $('.qd_1 b', el).text().trim();
			reward = $('.qd_2', el).text().replace(/[^0-9$]/g, '').regex(/^([0-9]+)\$([0-9]+)\$([0-9]+)$/);
			energy = $('.quest_req b', el).text().regex(/([0-9]+)/);
			if ($(el).hasClass('quests_background')) { // Main quest
				last_main = id;
				level = $('.quest_progress', el).text().regex(/LEVEL ([0-9]+)/i);
				influence = $('.quest_progress', el).text().regex(/INFLUENCE: ([0-9]+)%/i);
				type = 1;
			} else { // Special / boss Quest
				type = 3;
			}
		}
		if (!name || name.indexOf('\t') !== -1) { // Hopefully stop it finding broken page load quests
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
		data.id[id].exp = reward[0];
		data.id[id].reward = (reward[1] + reward[2]) / 2;
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
				units[title] = $(el).text().regex(/([0-9]+)/);
			});
			if (length(units)) {
				data.id[id].units = units;
			}
			tmp = $('.quest_act_gen img', el);
			if (tmp.length && tmp.attr('title')) {
				data.id[id].general = tmp.attr('title');
			}
		}
	});
	//this.data = sortObject(data, function(a,b){return a > b;});// So they always appear in the same order
	return false;
};

Quest.update = function(event) {
	if (event.worker.name === 'Town' && event.type !== 'data') {
		return; // Missing quest requirements
	}
	// First let's update the Quest dropdown list(s)...
	var i, unit, own, need, noCanDo = false, best = null, best_cartigan = null, best_vampire = null, best_subquest = null, best_advancement = null, best_influence = null, best_experience = null, best_land = 0, has_cartigan = false, has_vampire = false, list = [], items = {}, data = this.data, maxenergy = Player.get('maxenergy',999), eff, best_sub_eff = 1e10, best_adv_eff = 1e10, best_inf_eff = 1e10;
	if (event.type === 'init' || event.type === 'data') {
		for (i in data.id) {
			if (data.id[i].item && data.id[i].type !== 3) {
				list.push(data.id[i].item);
			}
			for (unit in data.id[i].units) {
				items[unit] = Math.max(items[unit] || 0, data.id[i].units[unit]);
			}
		}
		Config.set('quest_reward', ['Nothing', 'Cartigan', 'Vampire Lord', 'Subquests', 'Advancement', 'Influence', 'Experience', 'Cash'].concat(unique(list).sort()));
		for (unit in items) {
			Resources.set(['_'+unit, 'quest'], items[unit]);
		}
	}
	// Now choose the next quest...
	if (this.option.unique) {
		for (i in data.id) {
			if (data.id[i].energy > maxenergy) {// Skip quests we can't afford
				continue;
			}
			if (data.id[i].type === 3 && !Alchemy.get(['ingredients', data.id[i].itemimg], 0) && (!best || data.id[i].energy < data.id[best].energy)) {
				best = i;
			}
		}
	}
	if (!best && this.option.what !== 'Nothing') {
		if (this.option.what === 'Vampire Lord' && Town.get('Vampire Lord', 0) >= 24) {
			has_vampire = true; // Stop trying once we've got the required number of Vampire Lords
		}
		if (this.option.what === 'Cartigan' && (Generals.get('Cartigan', false) || (Alchemy.get(['ingredients', 'eq_underworld_sword.jpg'], 0) >= 3 && Alchemy.get(['ingredients', 'eq_underworld_amulet.jpg'], 0) >= 3 && Alchemy.get(['ingredients', 'eq_underworld_gauntlet.jpg'], 0) >= 3))) {
			// Sword of the Faithless x3 - The Long Path, Burning Gates
			// Crystal of Lament x3 - Fiery Awakening
			// Soul Eater x3 - Fire and Brimstone, Deathrune Castle
			has_cartigan = true; // Stop trying once we've got the general or the ingredients
		}
//		debug('option = ' + this.option.what);
//		best = (this.runtime.best && data.id[this.runtime.best] && (data.id[this.runtime.best].influence < 100) ? this.runtime.best : null);
		for (i in data.id) {
			if (data.id[i].energy > maxenergy) {// Skip quests we can't afford
				continue;
			}
			if (data.id[i].units) {
				own = 0;
				need = 0;
				noCanDo = false;
				for (unit in data.id[i].units) {
					own = Town.get([unit, 'own'], 0);
					need = data.id[i].units[unit];
					if (need > own) {	// Need more than we own, skip this quest.
						noCanDo = true;	// set flag
						continue;	// no need to check more prerequisites.
					}
				}
				if (noCanDo) {
					continue;	// Skip to the next quest in the list
				}
			}
			eff = data.id[i].eff || (data.id[i].energy * (!isNumber(data.id[i].level) ? 1 : ((this.rdata[i] && this.rdata[i].reps) || 16)));
			if (0 < (data.id[i].influence || 0) && (data.id[i].influence || 0) < 100) {
				eff = Math.ceil(eff * (100 - data.id[i].influence) / 100);
			}
			switch(this.option.what) { // Automatically fallback on type - but without changing option
				case 'Vampire Lord': // Main quests or last subquest (can't check) in Undead Realm
					if (!has_vampire && isNumber(data.id[i].land)
					&& data.id[i].land === 5
					&& data.id[i].type === 1
					&& (!best_vampire || data.id[i].energy < data.id[best_vampire].energy)
					&& (this.option.ignorecomplete === false || (isNumber(data.id[i].influence) && data.id[i].influence < 100))) {
						best_vampire = i;
					}// Deliberate fallthrough
				case 'Cartigan': // Random Encounters in various Underworld Quests
					if (!has_cartigan && isNumber(data.id[i].land)
					&& data.id[i].land === 6
					&& (((data.id[data.id[i].main || i].name === 'The Long Path' || data.id[data.id[i].main || i].name === 'Burning Gates') && Alchemy.get(['ingredients', 'eq_underworld_sword.jpg'], 0) < 3)
						|| ((data.id[data.id[i].main || i].name === 'Fiery Awakening') && Alchemy.get(['ingredients', 'eq_underworld_amulet.jpg'], 0) < 3)
						|| ((data.id[data.id[i].main || i].name === 'Fire and Brimstone' || data.id[data.id[i].main || i].name === 'Deathrune Castle') && Alchemy.get(['ingredients', 'eq_underworld_gauntlet.jpg'], 0) < 3))
					&& (!best_cartigan || data.id[i].energy < data.id[best_cartigan].energy)
					&& (this.option.ignorecomplete === false || (isNumber(data.id[i].influence) && data.id[i].influence < 100))) {
						best_cartigan = i;
					}// Deliberate fallthrough
				case 'Subquests': // Find the cheapest energy cost *sub*quest with influence under 100%
					if (data.id[i].type === 2
					&& isNumber(data.id[i].influence) 
					&& data.id[i].influence < 100
					&& (!best_subquest || eff < best_sub_eff)) {
						best_subquest = i;
						best_sub_eff = eff;
					}// Deliberate fallthrough
				case 'Advancement': // Complete all required main / boss quests in an area to unlock the next one (type === 2 means subquest)
					if (isNumber(data.id[i].land) && data.id[i].land > best_land) { // No need to revisit old lands - leave them to Influence
						best_land = data.id[i].land;
						best_advancement = null;
						best_adv_eff = 1e10;
					}
					if (data.id[i].type !== 2
					&& isNumber(data.id[i].land)
					//&& data.id[i].level === 1  // Need to check if necessary to do boss to unlock next land without requiring orb
					&& data.id[i].land >= best_land
					&& ((isNumber(data.id[i].influence) && Generals.test(data.id[i].general) && data.id[i].level <= 1 && data.id[i].influence < 100) || (data.id[i].type === 3 && !Alchemy.get(['ingredients', data.id[i].itemimg], 0)))
					&& (!best_advancement || (data.id[i].land === best_land && eff < best_adv_eff))) {
						best_land = Math.max(best_land, data.id[i].land);
						best_advancement = i;
						best_adv_eff = eff;
					}// Deliberate fallthrough
				case 'Influence': // Find the cheapest energy cost quest with influence under 100%
					if (isNumber(data.id[i].influence) 
							&& (!data.id[i].general || Generals.test(data.id[i].general))
							&& data.id[i].influence < 100
							&& (!best_influence || eff < best_inf_eff)) {
						best_influence = i;
						best_inf_eff = eff;
					}// Deliberate fallthrough
				case 'Experience': // Find the best exp per energy quest
					if (!best_experience || (data.id[i].energy / data.id[i].exp) < (data.id[best_experience].energy / data.id[best_experience].exp)) {
						best_experience = i;
					}
					break;
				case 'Cash': // Find the best (average) cash per energy quest
					if (!best || (data.id[i].energy / data.id[i].reward) < (data.id[best].energy / data.id[best].reward)) {
						best = i;
					}
					break;
				default: // For everything else, there's (cheap energy) items...
					if (data.id[i].item === this.option.what && (!best || data.id[i].energy < data.id[best].energy)) {
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
			case 'Experience':	best = best_experience;break;
			default:break;
		}
	}
	if (best !== this.runtime.best) {
		this.runtime.best = best;
		if (best) {
			this.runtime.energy = data.id[best].energy;
			debug('Wanting to perform - ' + data.id[best].name + ' in ' + (isNumber(data.id[best].land) ? this.land[data.id[best].land] : this.area[data.id[best].area]) + ' (energy: ' + data.id[best].energy + ', experience: ' + data.id[best].exp + ', gold: $' + shortNumber(data.id[best].reward) + ')');
		}
	}
	if (best) {
		Dashboard.status(this, (isNumber(data.id[best].land) ? this.land[data.id[best].land] : this.area[data.id[best].area]) + ': ' + data.id[best].name + ' (' + makeImage('energy') + data.id[best].energy + ' = ' + makeImage('exp') + data.id[best].exp + ' + ' + makeImage('gold') + '$' + shortNumber(data.id[best].reward) + (data.id[best].item ? Town.get([data.id[best].item,'img'], null) ? ' + <img style="width:16px;height:16px;margin-bottom:-4px;" src="' + imagepath + Town.get([data.id[best].item, 'img']) + '" title="' + data.id[best].item + '">' : ' + ' + data.id[best].item : '') + (isNumber(data.id[best].influence) && data.id[best].influence < 100 ? (' @ ' + makeImage('percent','Influence') + data.id[best].influence + '%') : '') + ')');
	} else {
		Dashboard.status(this);
	}
};

Quest.work = function(state) {
	var mid, general = 'any', best = Queue.runtime.quest || this.runtime.best;
	var useable_energy = Queue.runtime.force.energy ? Queue.runtime.energy : Queue.runtime.energy - this.option.energy_reserve;
	if (!best || (!Queue.runtime.quest && this.runtime.energy > useable_energy)) {
		if (state && this.option.bank) {
			return Bank.work(true);
		}
		return QUEUE_FINISH;
	}
	// If holding for fortify, then don't quest if we have a secondary or defend target possible, unless we're forcing energy.
	if (!Queue.runtime.quest && 
			(this.option.monster === 'When able' 
				&& Monster.get('runtime.defending')) 
			|| (this.option.monster === 'Wait for'
				&& (Monster.get('runtime.defending')
					|| !Queue.runtime.force.energy))) {
		return QUEUE_FINISH;
	}
	if (!state) {
		return QUEUE_CONTINUE;
	}
	if (this.option.general) {
		if (this.data.id[best].general && isNumber(this.data.id[best].influence) && this.data.id[best].influence < 100) {
			general = this.data.id[best].general;
		} else {
			switch(this.option.what) {
				case 'Vampire Lord':
				case 'Cartigan':
					if (this.data.id[best].general) {
						general = this.data.id[best].general;
					} else {
//						general = Generals.best('item');
						general = Generals.best('under level 4');
					}
					if (general !== 'any') {
						break;
					}
					// Deliberate fallthrough
				case 'Influence':
				case 'Advancement':
				case 'Experience':
					general = Generals.best('under level 4');
					if (general === 'any' && isNumber(this.data.id[best].influence) && this.data.id[best].influence < 100) {
						general = 'influence';
					}
					break;
				case 'Cash':
					general = 'cash';
					break;
				default:
					general = 'item';
					break;
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
			log('Can\'t get to quest area!');
			return QUEUE_FINISH;
	}
	debug('Performing - ' + this.data.id[best].name + ' (energy: ' + this.data.id[best].energy + ')');
	if (!Page.click($('input[name="quest"][value="' + this.data.id[best].id + '"]').siblings('.imgButton').children('input[type="image"]'))) { // Can't find the quest, so either a bad page load, or bad data - delete the quest and reload, which should force it to update ok...
		debug('Can\'t find button for ' + this.data.id[best].name + ', so deleting and re-visiting page...');
		delete this.data.id[best];
		this.runtime.best = null;
		Page.reload();
	}
	Queue.runtime.quest = false;
	if (this.data.id[best].type === 3) {// Just completed a boss quest
		if (!Alchemy.get(['ingredients', this.data.id[best].itemimg], 0)) {// Add one as we've just gained it...
			Alchemy.set(['ingredients', this.data.id[best].itemimg], 1);
		}
		if (this.option.what === 'Advancement' && Page.pageNames['quests_quest' + (this.data.id[best].land + 2)]) {// If we just completed a boss quest, check for a new quest land.
			Page.to('quests_quest' + (this.data.id[best].land + 2));// Go visit the next land as we've just unlocked it...
		}
	}
	return QUEUE_RELEASE;
};

Quest.order = [];
Quest.dashboard = function(sort, rev) {
	var i, o, quest, list = [], output = [], vv, tt, cc, span, v, eff;
	if (typeof sort === 'undefined') {
		this.order = [];
		for (i in this.data.id) {
			this.order.push(i);
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
		switch(sort) {
			case 0:	// general
				return Quest.data.id[q].general || 'zzz';
			case 1: // name
				return Quest.data.id[q].name || 'zzz';
			case 2: // area
				return isNumber(Quest.data.id[q].land) && typeof Quest.land[Quest.data.id[q].land] !== 'undefined' ? Quest.land[Quest.data.id[q].land] : Quest.area[Quest.data.id[q].area];
			case 3: // level
				return (isNumber(Quest.data.id[q].level) ? Quest.data.id[q].level : -1) * 100 + (Quest.data.id[q].influence || 0);
			case 4: // energy
				return Quest.data.id[q].energy;
			case 5: // effort
				return Quest.data.id[q].eff ||
				  (Quest.data.id[q].energy *
				  (!isNumber(Quest.data.id[q].level) ? 1 :
				  ((Quest.rdata[q] && Quest.rdata[q].reps) || 16)));
			case 6: // exp
				return Quest.data.id[q].exp / Quest.data.id[q].energy;
			case 7: // reward
				return Quest.data.id[q].reward / Quest.data.id[q].energy;
			case 8: // item
				return Quest.data.id[q].item || 'zzz';
		}
		return 0; // unknown
	}
	this.order.sort(function(a,b) {
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
	for (o=0; o<this.order.length; o++) {
		i = this.order[o];
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
		span = vv = cc = '';
		if (isNumber(v = quest.level)) {
			vv = v + '&nbsp;(' + quest.influence + '%)';
		}
		if (v >= 4) {
			cc = 'red';
		} else if (isNumber(quest.influence) && quest.influence < 100) {
			cc = 'green';
		}
		if (cc !== '') {
			span += ' style="color:' + cc + '"';
		}
		if (span !== '') {
			vv = '<span' + span + '>' + vv + '</span>';
		}
		td(output, vv);

		// energy
		td(output, quest.energy);

		// effort
		vv = tt = '';
		if (!isNumber(quest.level)) {
			vv = '<i>' + quest.energy + '</i>';
		} else {
			vv = quest.eff || (quest.energy * ((this.rdata[i] && this.rdata[i].reps) || 16));
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
			} else if (this.rdata[i] && this.rdata[i].reps) {
				if (tt !== '') {
					tt += ', ';
				}
				tt += 'wiki reps ' + this.rdata[i].reps;
			} else {
				if (tt !== '') {
					tt += ', ';
				}
				tt += 'assuming reps 16';
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
		td(output, vv, tt);

		// exp
		td(output, (quest.exp / quest.energy).round(2), 'title="' + quest.exp + ' total, ' + (quest.exp / quest.energy * 12).round(2) + ' per hour"');

		// reward
		td(output, '$' + addCommas((quest.reward / quest.energy).round()), 'title="$' + addCommas(quest.reward) + ' total, $' + addCommas((quest.reward / quest.energy * 12).round()) + ' per hour"');

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

Quest.rts = 1286314427;	// Tue Oct  5 21:33:47 2010 UTC
Quest.rdata =			// #249
{
    'A Demonic Transformation':			{ reps: 40 },
    'A Forest in Peril':				{ reps:  9 },
    'A Kidnapped Princess':				{ reps: 10 },
    'Aid Corvintheus':					{ reps:  9 },
    'Aid the Angels':					{ reps: 17 },
    'Approach the Prayer Chamber':		{ reps: 12 },
    'Approach the Tree of Life':		{ reps: 12 },
    'Attack Undead Guardians':			{ reps: 24 },
    'Attack from Above':				{ reps: 17 },
    'Avoid Ensnarements':				{ reps: 34 },
    'Avoid the Patrols':				{ reps: 17 },
    'Banish the Horde':					{ reps: 17 },
    'Battle A Wraith':					{ reps: 16 },
    'Battle Earth and Fire Demons':		{ reps: 16 },
    'Battle Gang of Bandits':			{ reps: 10 },
    'Battle Orc Captain':				{ reps: 15 },
    'Battle The Black Dragon':			{ reps: 14 },
    'Battle the End':					{ reps: 12 },
    'Battling the Demons':				{ reps: 17 },
    'Being Followed':					{ reps: 15 },
    'Blood Wing King of the Dragons':	{ reps: 20 },
    'Breach the Keep Entrance':			{ reps: 12 },
    'Breaching the Gates':				{ reps: 15 },
    'Break Evil Seal':					{ reps: 17 },
    'Break the Lichs Spell':			{ reps: 12 },
    'Breaking Through the Guard':		{ reps: 17 },
    'Bridge of Elim':					{ reps: 11 },
    'Call of Arms':						{ reps: 25 },
    'Cast Aura of Night':				{ reps: 32 },
    'Cast Fire Aura':					{ reps: 24 },
    'Cast Holy Light':					{ reps: 24 },
    'Cast Holy Light Spell':			{ reps: 24 },
    'Cast Holy Shield':					{ reps: 12 },
    'Cast Meteor':						{ reps: 32 },
    'Castle of the Black Lion':			{ reps: 13 },
    'Castle of the Damn':				{ reps: 25 },
    'Charge the Castle':				{ reps: 15 },
    'City of Clouds':					{ reps: 11 },
    'Close the Black Portal':			{ reps: 12 },
    'Confront the Black Lion':			{ reps: 12 },
    'Consult Aurora':					{ reps: 12 },
    'Corruption of Nature':				{ reps: 20 },
    'Cover Tracks':						{ reps: 19 },
    'Cross Lava River':					{ reps: 20 },
    'Crossing The Chasm':				{ reps: 13 },
    'Cure Infested Soldiers':			{ reps: 25 },
    'Deal Final Blow to Bloodwing':		{ reps: 12 },
    'Deathrune Castle':					{ reps: 12 },
    'Decipher the Clues':				{ reps: 17 },
    'Defeat Bloodwing':					{ reps: 12 },
    'Defeat Chimerus':					{ reps: 12 },
    'Defeat Darien Woesteel':			{ reps: 25 },
    'Defeat Demonic Guards':			{ reps: 17 },
    'Defeat Frost Minions':				{ reps: 40 },
    'Defeat Snow Giants':				{ reps: 24 },
    'Defeat and Heal Feral Animals':	{ reps: 12 },
    'Defeat the Bandit Leader':			{ reps:  6 },
    'Defeat the Banshees':				{ reps: 25 },
    'Defeat the Black Lion Army':		{ reps: 12 },
    'Defeat the Demonic Guards':		{ reps: 12 },
    'Defeat the Demons':				{ reps: 17 },
    'Defeat the Patrols':				{ reps: 17 },
    'Defend The Village':				{ reps: 12 },
    'Destroy Fire Dragon':				{ reps: 10 },
    'Destroy Fire Elemental':			{ reps: 16 },
    'Destroy Horde of Ghouls & Trolls':	{ reps:  9 },
    'Destroy Undead Crypt':				{ reps:  5 },
    'Destroy the Black Gate':			{ reps: 12 },
    'Destroy the Black Portal':			{ reps: 12 },
    'Destroy the Bolted Door':			{ reps: 12 },
    'Destruction Abound':				{ reps: 11 },
    'Determine Cause of Corruption':	{ reps: 12 },
    'Dig up Star Metal':				{ reps: 12 },
    'Discover Cause of Corruption':		{ reps: 12 },
    'Dismantle Orc Patrol':				{ reps: 32 },
    'Dispatch More Cultist Guards':		{ reps: 12 },
    'Distract the Demons':				{ reps: 17 },
    'Dragon Slayer':					{ reps: 14 },
    "Duel Cefka's Knight Champion":		{ reps: 10 },
	'Dwarven Stronghold':				{ reps: 10 },
    'Elekin the Dragon Slayer':			{ reps: 10 },
    'End of the Road':					{ reps: 17 },
    'Entrance to Terra':				{ reps:  9 },
    'Equip Soldiers':					{ reps: 25 },
    'Escaping the Chaos':				{ reps: 17 },
	'Escaping the Stronghold':			{ reps: 10 },
    'Falls of Jiraya':					{ reps: 10 },
    'Family Ties':						{ reps: 11 },
    'Fend off Demons':					{ reps: 20 },
    'Fiery Awakening':					{ reps: 12 },
    "Fight Cefka's Shadow Guard":		{ reps: 10 },
    'Fight Demonic Worshipers':			{ reps: 24 },
    'Fight Dragon Welps':				{ reps: 10 },
    'Fight Ghoul Army':					{ reps:  5 },
    'Fight Gildamesh':					{ reps: 32 },
    'Fight Ice Beast':					{ reps: 40 },
    'Fight Infested Soldiers':			{ reps: 25 },
    'Fight Off Demons':					{ reps: 32 },
    'Fight Off Zombie Infestation':		{ reps: 12 },
    'Fight Snow King':					{ reps: 24 },
    'Fight Treants':					{ reps: 27 },
    'Fight Undead Zombies':				{ reps: 16 },
    'Fight Water Demon Lord':			{ reps: 40 },
    'Fight Water Demons':				{ reps: 40 },
    'Fight Water Spirits':				{ reps: 40 },
    'Fight the Half-Giant Sephor':		{ reps:  9 },
    'Find Evidence of Dragon Attack':	{ reps:  8 },
    'Find Hidden Path':					{ reps: 10 },
    'Find Nezeals Keep':				{ reps: 12 },
    'Find Rock Worms Weakness':			{ reps: 10 },
    'Find Source of the Attacks':		{ reps: 12 },
    'Find Troll Weakness':				{ reps: 10 },
    'Find Your Way Out':				{ reps: 15 },
    'Find the Dark Elves':				{ reps: 12 },
    'Find the Demonic Army':			{ reps: 12 },
    'Find the Druids':					{ reps: 12 },
    'Find the Exit':					{ reps: 17 },
    'Find the Source of Corruption':	{ reps: 12 },
    'Find the Woman? Father':			{ reps: 12 },
    'Fire and Brimstone':				{ reps: 12 },
    'Forest of Ash':					{ reps: 11 },
    'Furest Hellblade':					{ reps: 17 },
    'Gates to the Undead':				{ reps: 17 },
    'Gateway':							{ reps: 11 },
    'Get Information from the Druid':	{ reps: 12 },
    'Get Water for the Druid':			{ reps: 12 },
    'Grim Outlook':						{ reps: 17 },
    'Guard Against Attack':				{ reps: 12 },
    'Heal Wounds':						{ reps: 20 },
    'Heat the Villagers':				{ reps:  5 },
    'Holy Fire':						{ reps: 11 },
    'Interrogate the Prisoners':		{ reps: 17 },
    'Join Up with Artanis':				{ reps: 12 },
    'Judgement Stronghold':				{ reps: 11 },
    'Kelp Forest':						{ reps: 20 },
    'Kill Gildamesh':					{ reps: 34 },
    'Kill Vampire Bats':				{ reps: 12 },
    'Learn Counterspell':				{ reps: 12 },
    'Learn Holy Fire':					{ reps: 12 },
    'Learn about Death Knights':		{ reps: 12 },
    'Marauders':						{ reps:  9 },
    'March Into The Undead Lands':		{ reps: 24 },
    'March to The Unholy War':			{ reps: 25 },
    'Mausoleum of Triste':				{ reps: 17 },
    'Misty Hills of Boralis':			{ reps: 20 },
    'Mount Aretop':						{ reps: 25 },
    'Nightmare':						{ reps: 20 },
    'Path to Heaven':					{ reps: 11 },
    'Pick up the Orc Trail':			{ reps:  6 },
    'Plan the Attack':					{ reps: 12 },
    'Portal of Atlantis':				{ reps: 20 },
    'Power of Excalibur':				{ reps: 11 },
    'Prepare for Ambush':				{ reps:  6 },
    'Prepare for Battle':				{ reps: 12 },
    'Prepare for the Trials':			{ reps: 17 },
    'Prevent Dragon? [sic] Escape':		{ reps: 12 },
    'Protect Temple From Raiders':		{ reps: 40 },
    'Purge Forest of Evil':				{ reps: 27 },
    'Pursuing Orcs':					{ reps: 13 },
    'Put Out the Fires':				{ reps:  8 },
    'Question Dark Elf Prisoners':		{ reps: 12 },
    'Question the Druidic Wolf':		{ reps: 12 },
    'Ready the Horses':					{ reps:  6 },
    'Recover the Key':					{ reps: 17 },
    'Recruit Elekin to Join You':		{ reps:  9 },
    'Recruit Furest to Join You':		{ reps: 12 },
    'Repel Gargoyle Raid':				{ reps: 14 },
    'Resist the Lost Souls':			{ reps: 25 },
    'Retrieve Dragon Slayer':			{ reps: 10 },
    'Retrieve the Jeweled Heart':		{ reps: 12 },
    'Ride Towards the Palace':			{ reps: 17 },
    'Ride to Aretop':					{ reps: 12 },
    'River of Light':					{ reps: 10 },
    'Save Lost Souls':					{ reps: 24 },
    'Seek Out Elekin':					{ reps:  9 },
    'Seek Out Furest Hellblade':		{ reps: 12 },
    'Seek out Jeweled Heart':			{ reps: 12 },
    'Shield of the Stars':				{ reps: 20 },
    'Slaughter Orcs':					{ reps: 15 },
    'Slay Cave Bats':					{ reps: 10 },
    'Slay the Black Dragons':			{ reps: 32 },
    'Slay the Guardian':				{ reps: 17 },
    'Slay the Sea Serpent':				{ reps: 12 },
    'Sneak Attack on Dragon':			{ reps: 12 },
    'Sneak up on Orcs':					{ reps:  7 },
    'Soldiers of the Black Lion':		{ reps: 10 },
    'Spire of Death':					{ reps: 20 },
    'Spring Surprise Attack':			{ reps: 12 },
    'Stop the Wolf from Channeling':	{ reps: 12 },
    'Storm the Castle':					{ reps: 12 },
    'Storm the Ivory Palace':			{ reps: 17 },
    'Summon Legendary Defenders':		{ reps: 25 },
    'Survive Troll Ambush':				{ reps: 10 },
    'Surviving the Onslaught':			{ reps: 17 },
    'The Belly of the Demon':			{ reps: 20 },
    'The Betrayed Lands':				{ reps: 16 },
    'The Black Portal':					{ reps: 15 },
    'The Cave of Wonder':				{ reps: 20 },
    'The Crystal Caverns':				{ reps: 11 },
    'The Darkening Skies':				{ reps: 17 },
    'The Deep':							{ reps: 20 },
    'The Elven Sorceress':				{ reps: 11 },
    'The Fallen Druids':				{ reps: 12 },
    'The Final Stretch':				{ reps: 17 },
    'The Forbidden Forest':				{ reps: 20 },
    'The Forbidden Ritual':				{ reps: 20 },
    'The Hidden Lair':					{ reps: 13 },
    'The Hollowing Moon':				{ reps: 17 },
    'The Infestation of Winterguard':	{ reps: 10 },
    'The Invasion':						{ reps: 11 },
    'The Keep of Corelan':				{ reps: 17 },
    'The Keep of Isles':				{ reps: 16 },
    'The Kingdom of Alarean':			{ reps: 15 },
    'The Last Gateway':					{ reps: 17 },
    "The Lich Ne'zeal":					{ reps: 13 },
    "The Lich's keep":					{ reps: 15 },
    'The Living Gates':					{ reps: 20 },
    'The Long Path':					{ reps: 12 },
    'The Peaks of Draneth':				{ reps: 21 },
    'The Return Home':					{ reps: 11 },
    'The Return of the Dragon':			{ reps:  9 },
    'The River of Blood':				{ reps: 20 },
    'The Sea Temple':					{ reps: 20 },
    'The Search for Clues':				{ reps: 12 },
    'The Second Temple of Water':		{ reps: 25 },
    'The Smouldering Pit':				{ reps: 40 },
    'The Source of Darkness':			{ reps: 20 },
    'The Source of Magic':				{ reps: 15 },
    'The Stairs of Terra':				{ reps: 10 },
    'The Stone Lake':					{ reps: 12 },
    'The Sunken City':					{ reps: 17 },
    'The Tree of Life':					{ reps: 26 },
    'The Vanguard of Destruction':		{ reps: 21 },
    'The Water Temple':					{ reps: 17 },
    'Track Down Soldiers':				{ reps: 12 },
    'Track Sylvana':					{ reps: 12 },
    'Train with Ambrosia':				{ reps: 12 },
    'Train with Aurora':				{ reps: 12 },
    'Travel to Winterguard':			{ reps: 12 },
    'Travel to the Tree of Life':		{ reps: 12 },
    'Triste':							{ reps: 20 },
    'Undead Crusade':					{ reps: 17 },
    'Underwater Ruins':					{ reps: 20 },
    'Unholy War':						{ reps: 20 },
    'Vengeance':						{ reps: 17 },
    'Vesuv Lookout':					{ reps: 17 },
    'Visit the Blacksmith':				{ reps: 24 },
    'Vulcans Secret':					{ reps: 11 },
    'Watch the Skies':					{ reps: 12 }
};

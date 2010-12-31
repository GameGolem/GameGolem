/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page, Queue, Resources,
	Alchemy, Bank, Battle, Generals, LevelUp, Monster, Player, Town,
	APP, APPID, warn, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser, console,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, Divisor, length, unique, deleteElement, sum, findInArray, findInObject, objectIndex, sortObject, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
	makeImage
*/
/********** Worker.Quest **********
* Completes quests with a choice of general
*/
// Should also look for quests_quest but that should never be used unless there's a new area
var Quest = new Worker('Quest');

Quest.defaults['castle_age'] = {
	pages:'quests_quest1 quests_quest2 quests_quest3 quests_quest4 quests_quest5 quests_quest6 quests_quest7 quests_quest8 quests_quest9 quests_quest10 quests_quest11 quests_demiquests quests_atlantis'
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
};

Quest.land = ['Land of Fire', 'Land of Earth', 'Land of Mist', 'Land of Water', 'Demon Realm', 'Undead Realm', 'Underworld', 'Kingdom of Heaven', 'Ivory City', 'Earth II', 'Water II'];
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
	Resources.use('Energy');

	// one time pre-r845 fix for erroneous values in m_c, m_d, reps, eff
	if ((runtime.revision || 0) < 845) {
		for (i in data) {
			if (data[i].reps) {
				r = 'reps_' + (isNumber(data[i].land) ? (data[i].land + 1) : data[i].area);
				j = i.toLowerCase();
				x = (this.rdata[j] && this.rdata[j][r]) || 16;
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
};

Quest.parse = function(change) {
	var data = this.data, last_main = 0, area = null, land = null, i, m_c, m_d, m_i, reps, purge;
/*
<div style="float: left; height: 75px; width: 431px;">
	<div style="clear: both;"></div>
	<div class="title_tab">
		<a href="http://apps.facebook.com/castle_age/quests.php?land=9"><div class="imgButton"><img title="click to go to this land" id="app46755028429_land_image9" src="http://image2.castleagegame.com/2189/graphics/tab_ivory_small.gif" fbcontext="a8949d231744"></div></a>							                    			</div>
	<div class="title_tab">
		<a href="http://apps.facebook.com/castle_age/quests.php?land=10"><div class="imgButton"><img title="click to go to this land" id="app46755028429_land_image10" src="http://image2.castleagegame.com/2189/graphics/tab_earth2_small.gif" fbcontext="a8949d231744"></div></a>							                    			</div>
	<div class="title_tab_selected">
		<a href="http://apps.facebook.com/castle_age/quests.php?land=11"><div class="imgButton"><img title="click to go to this land" id="app46755028429_land_image11" src="http://image2.castleagegame.com/2189/graphics/tab_water2_big.gif" fbcontext="a8949d231744"></div></a>							                    			</div>
	<div class="title_tab">
		<div><img title="More land coming soon!" src="http://image2.castleagegame.com/2189/graphics/land_coming_soon.gif"></div>
	</div>
	<div style="clear: both;"></div>
</div>
*/
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
		Quest._notify('data');
	});
	for (i in purge) {
		if (purge[i]) {
			console.log(warn(), 'Deleting ' + i + '(' + (Quest.land[data.id[i].land] || data.id[i].area) + ')');
			delete data.id[i];
		}
	}
	return false;
};

Quest.update = function(event) {
	if (event.worker.name === 'Town' && event.type !== 'data') {
		return; // Missing quest requirements
	}
	// First let's update the Quest dropdown list(s)...
	var i, j, r, unit, own, need, noCanDo = false, best = null, best_cartigan = null, best_vampire = null, best_subquest = null, best_advancement = null, best_influence = null, best_experience = null, best_land = 0, has_cartigan = false, has_vampire = false, list = [], items = {}, data = this.data, maxenergy = Player.get('maxenergy',999), eff, best_sub_eff = 1e10, best_adv_eff = 1e10, best_inf_eff = 1e10;
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
	if (this.option.unique) {// Boss monster quests first - to unlock the next area
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
//		console.log(warn(), 'option = ' + this.option.what);
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
					need = data.id[i].units[unit];
					if (!Player.get(['artifact', i]) || need !== 1) {
						own = Town.get([unit, 'own'], 0);
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
			r = 'reps_' + (isNumber(data.id[i].land) ? (data.id[i].land + 1) : data.id[i].area);
			j = data.id[i].toLowerCase();
			eff = data.id[i].eff || (data.id[i].energy * (!isNumber(data.id[i].level) ? 1 : ((this.rdata[j] && this.rdata[j][r]) || 16)));
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
	var mid, general = 'any', best = Queue.runtime.quest || this.runtime.best;
	var useable_energy = Queue.runtime.force.energy ? Queue.runtime.energy : Queue.runtime.energy - this.option.energy_reserve;
	if (!best || (!Queue.runtime.quest && this.runtime.energy > useable_energy)) {
		if (state && this.option.bank && !Bank.stash()) {
			return QUEUE_CONTINUE;
		}
		return QUEUE_FINISH;
	}
	// If holding for fortify, then don't quest if we have a secondary or defend target possible, unless we're forcing energy.
	if (!Queue.runtime.quest && 
			((this.option.monster === 'When able' 
					&& Monster.get('runtime.defending')) 
				|| (this.option.monster === 'Wait for'
					&& (Monster.get('runtime.defending')
						|| !Queue.runtime.force.energy)))) {
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
			console.log(log(), 'Can\'t get to quest area!');
			return QUEUE_FINISH;
	}
	console.log(warn(), 'Performing - ' + this.data.id[best].name + ' (energy: ' + this.data.id[best].energy + ')');
	if (!Page.click($('input[name="quest"][value="' + best + '"]').siblings('.imgButton').children('input[type="image"]'))) { // Can't find the quest, so either a bad page load, or bad data - delete the quest and reload, which should force it to update ok...
		console.log(warn(), 'Can\'t find button for ' + this.data.id[best].name + ', so deleting and re-visiting page...');
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
	var self = this, i, j, k, o, r, quest, list = [], output = [], vv, tt, cc, span, v, eff;
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
				r = 'reps_' + (isNumber(o.land) ? (o.land + 1) : o.area);
				n = o.name.toLowerCase();
				return o.eff || (o.energy * (!isNumber(o.level) ? 1 :
				  ((self.rdata[n] && self.rdata[n][r]) || 16)));
			case 6: // exp
				return o.exp / o.energy;
			case 7: // reward
				return o.reward / o.energy;
			case 8: // item
				return o.item || 'zzz';
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
		span = vv = tt = cc = '';
		if (isNumber(v = quest.level)) {
			vv = v + '&nbsp;(' + quest.influence + '%)';
			if (v >= 4) {
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
			vv = quest.eff || (quest.energy * ((this.rdata[j] && this.rdata[j][r]) || 16));
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
				cc = 'green';
			} else if (this.rdata[j] && this.rdata[j][r]) {
				if (tt !== '') {
					tt += ', ';
				}
				tt += 'wiki reps ' + this.rdata[j][r];
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
				if (town && town[i] && town[i].buy && town[i].buy.length) {
					c = town[i].own || 0;
					j = town[i].upkeep || 0;
					k = town[i].cost || 0;
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


Quest.rts = 1292695942;	// Sat Dec 18 18:12:22 2010 UTC
Quest.rdata =			// #321
{
	'a demonic transformation':			{ reps_4: 40 },
	'a forest in peril':				{ reps_demiquest:  9 },
	'a kidnapped princess':				{ reps_demiquest: 10 },
	'across the sea':					{ reps_11:  8 },
	'aid corvintheus':					{ reps_demiquest:  9 },
	'aid the angels':					{ reps_9: 17 },
	'approach the prayer chamber':		{ reps_demiquest: 12 },
	'approach the tree of life':		{ reps_demiquest: 12 },
	'ascent to the skies':				{ reps_8:  0 },
	'attack from above':				{ reps_9: 17 },
	'attack undead guardians':			{ reps_6: 24 },
	'aurelius':							{ reps_11:  0 },
	'aurelius outpost':					{ reps_11:  0 },
	'avoid ensnarements':				{ reps_3: 34 },
	'avoid the guards':					{ reps_8:  0 },
	'avoid the patrols':				{ reps_9: 17 },
	'banish the horde':					{ reps_9: 17 },
	'battle a wraith':					{ reps_2: 16 },
	'battle earth and fire demons':		{ reps_4: 16 },
	'battle gang of bandits':			{ reps_1: 10 },
	'battle orc captain':				{ reps_3: 15 },
	'battle the black dragon':			{ reps_4: 14 },
	'battle the ent':					{ reps_demiquest: 12 },
	'battling the demons':				{ reps_9: 17 },
	'being followed':					{ reps_7: 15 },
	'blood wing king of the dragons':	{ reps_demiquest: 20 },
	'breach the barrier':				{ reps_8:  0 },
	'breach the keep entrance':			{ reps_demiquest: 12 },
	'breaching the gates':				{ reps_7: 15 },
	'break aurelius guard':				{ reps_11:  0 },
	'break evil seal':					{ reps_7: 17 },
	'break the lichs spell':			{ reps_demiquest: 12 },
	'break the line':					{ reps_10:  0 },
	'breaking through the guard':		{ reps_9: 17 },
	'bridge of elim':					{ reps_8: 11 },
	'burning gates':					{ reps_7:  0 },
	'call of arms':						{ reps_6: 25 },
	'cast aura of night':				{ reps_5: 32 },
	'cast blizzard':					{ reps_10:  0 },
	'cast fire aura':					{ reps_6: 24 },
	'cast holy light':					{ reps_6: 24 },
	'cast holy light spell':			{ reps_5: 24 },
	'cast holy shield':					{ reps_demiquest: 12 },
	'cast meteor':						{ reps_5: 32 },
	'castle of the black lion':			{ reps_demiquest: 13 },
	'castle of the damn':				{ reps_demiquest: 25 },
	'channel excalibur':				{ reps_8:  0 },
	'charge ahead':						{ reps_10:  0 },
	'charge the castle':				{ reps_7: 15 },
	'chasm of fire':					{ reps_10: 10 },
	'city of clouds':					{ reps_8: 11 },
	'clear the rocks':					{ reps_11:  0 },
	'climb castle cliffs':				{ reps_11:  0 },
	'climb the mountain':				{ reps_8:  0 },
	'close the black portal':			{ reps_demiquest: 12 },
	'confront the black lion':			{ reps_demiquest: 12 },
	'confront the rebels':				{ reps_10: 10 },
	'consult aurora':					{ reps_demiquest: 12 },
	'corruption of nature':				{ reps_demiquest: 20 },
	'cover tracks':						{ reps_7: 19 },
	'cross lava river':					{ reps_7: 20 },
	'cross the bridge':					{ reps_10:  0, reps_8:  0 },
	'cross the moat':					{ reps_11:  0 },
	'crossing the chasm':				{ reps_2: 13, reps_8:  0 },
	'cure infested soldiers':			{ reps_6: 25 },
	'deal final blow to bloodwing':		{ reps_demiquest: 12 },
	'deathrune castle':					{ reps_7: 12 },
	'decipher the clues':				{ reps_9: 17 },
	'defeat and heal feral animals':	{ reps_demiquest: 12 },
	'defeat angelic sentinels':			{ reps_8:  0 },
	'defeat bear form':					{ reps_11:  0 },
	'defeat bloodwing':					{ reps_demiquest: 12 },
	'defeat chimerus':					{ reps_demiquest: 12 },
	'defeat darien woesteel':			{ reps_demiquest:  9 },
	'defeat demonic guards':			{ reps_7: 17 },
	'defeat fire elementals':			{ reps_10:  0 },
	'defeat frost minions':				{ reps_3: 40 },
	'defeat lion defenders':			{ reps_11:  0 },
	'defeat orc patrol':				{ reps_8:  0 },
	'defeat rebels':					{ reps_10:  0 },
	'defeat snow giants':				{ reps_3: 24 },
	'defeat the bandit leader':			{ reps_1:  6 },
	'defeat the banshees':				{ reps_5: 25 },
	'defeat the black lion army':		{ reps_demiquest: 12 },
	'defeat the demonic guards':		{ reps_demiquest: 12 },
	'defeat the demons':				{ reps_9: 17 },
	'defeat the kobolds':				{ reps_10:  0 },
	'defeat the patrols':				{ reps_9: 17 },
	'defeat the seraphims':				{ reps_8:  0 },
	'defeat tiger form':				{ reps_11:  0 },
	'defend the village':				{ reps_demiquest: 12 },
	'desert temple':					{ reps_11: 12 },
	'destroy black oozes':				{ reps_11:  0 },
	'destroy fire dragon':				{ reps_4: 10 },
	'destroy fire elemental':			{ reps_4: 16 },
	'destroy horde of ghouls & trolls':	{ reps_4:  9 },
	'destroy the black gate':			{ reps_demiquest: 12 },
	'destroy the black portal':			{ reps_demiquest: 12 },
	'destroy the bolted door':			{ reps_demiquest: 12 },
	'destroy undead crypt':				{ reps_1:  5 },
	'destruction abound':				{ reps_8: 11 },
	'determine cause of corruption':	{ reps_demiquest: 12 },
	'dig up star metal':				{ reps_demiquest: 12 },
	'disarm townspeople':				{ reps_11:  0 },
	'discover cause of corruption':		{ reps_demiquest: 12 },
	'dismantle orc patrol':				{ reps_3: 32 },
	'dispatch more cultist guards':		{ reps_demiquest: 12 },
	'distract the demons':				{ reps_9: 17 },
	'dragon slayer':					{ reps_demiquest: 14 },
	'druidic prophecy':					{ reps_11:  9 },
	"duel cefka's knight champion":		{ reps_4: 10 },
	'dwarven stronghold':				{ reps_10: 10 },
	'eastern corridor':					{ reps_11:  0 },
	'elekin the dragon slayer':			{ reps_demiquest: 10 },
	'end of the road':					{ reps_9: 17 },
	'enlist captain morgan':			{ reps_11:  0 },
	'entrance to terra':				{ reps_1:  9 },
	'equip soldiers':					{ reps_6: 25 },
	'escaping the chaos':				{ reps_9: 17 },
	'escaping the stronghold':			{ reps_9: 10 },
	'explore merchant plaza':			{ reps_11:  0 },
	'explore the temple':				{ reps_11:  0 },
	'extinguish desert basilisks':		{ reps_11:  0 },
	'extinguish the fires':				{ reps_8:  0 },
	'falls of jiraya':					{ reps_1: 10 },
	'family ties':						{ reps_demiquest: 11 },
	'fend off demons':					{ reps_7: 20 },
	'fiery awakening':					{ reps_7: 12 },
	"fight cefka's shadow guard":		{ reps_4: 10 },
	'fight demonic worshippers':		{ reps_5: 24 },
	'fight dragon welps':				{ reps_4: 10 },
	'fight ghoul army':					{ reps_1:  5 },
	'fight gildamesh':					{ reps_3: 32 },
	'fight ice beast':					{ reps_3: 40 },
	'fight infested soldiers':			{ reps_6: 25 },
	'fight off demons':					{ reps_5: 32 },
	'fight off zombie infestation':		{ reps_demiquest: 12 },
	'fight snow king':					{ reps_3: 24 },
	'fight the half-giant sephor':		{ reps_4:  9 },
	'fight treants':					{ reps_2: 27 },
	'fight undead zombies':				{ reps_2: 16 },
	'fight water demon lord':			{ reps_2: 31 },
	'fight water demons':				{ reps_2: 40 },
	'fight water spirits':				{ reps_2: 40 },
	'find evidence of dragon attack':	{ reps_demiquest:  8 },
	'find hidden path':					{ reps_demiquest: 10 },
	'find nezeals keep':				{ reps_demiquest: 12 },
	'find rock worms weakness':			{ reps_demiquest: 10 },
	'find source of the attacks':		{ reps_demiquest: 12 },
	'find survivors':					{ reps_8:  0 },
	'find the dark elves':				{ reps_demiquest: 12 },
	'find the demonic army':			{ reps_demiquest: 12 },
	'find the druids':					{ reps_demiquest: 12 },
	'find the entrance':				{ reps_8:  0 },
	'find the exit':					{ reps_9: 17 },
	'find the safest path':				{ reps_10:  0 },
	'find the source of corruption':	{ reps_demiquest: 12 },
	'find the woman? father':			{ reps_demiquest: 12 },
	'find troll weakness':				{ reps_2: 10 },
	'find your way out':				{ reps_7: 15 },
	'fire and brimstone':				{ reps_7: 12 },
	'forest of ash':					{ reps_demiquest: 11 },
	'furest hellblade':					{ reps_demiquest: 17 },
	'gain access':						{ reps_10:  0 },
	'gain entry':						{ reps_11:  0 },
	'gates to the undead':				{ reps_6: 17 },
	'gateway':							{ reps_8: 11 },
	'get information from the druid':	{ reps_demiquest: 12 },
	'get water for the druid':			{ reps_demiquest: 12 },
	'grim outlook':						{ reps_9: 17 },
	'guard against attack':				{ reps_demiquest: 12 },
	'heal wounds':						{ reps_7: 20 },
	'heat the villagers':				{ reps_1:  5 },
	'holy fire':						{ reps_demiquest: 11 },
	'impending battle':					{ reps_10: 10 },
	'interrogate the prisoners':		{ reps_9: 17 },
	'investigate the gateway':			{ reps_8:  0 },
	'ironfist dwarves':					{ reps_10: 10 },
	'join up with artanis':				{ reps_demiquest: 12 },
	'judgement stronghold':				{ reps_8: 11 },
	'juliean desert':					{ reps_11: 12 },
	'kelp forest':						{ reps_atlantis: 20 },
	'kill gildamesh':					{ reps_3: 34 },
	'kill vampire bats':				{ reps_demiquest: 12 },
	'koralan coast town':				{ reps_11: 14 },
	'koralan townspeople':				{ reps_11:  0 },
	'learn about death knights':		{ reps_demiquest: 12 },
	'learn aurelius intentions':		{ reps_11:  0 },
	'learn counterspell':				{ reps_demiquest: 12 },
	'learn holy fire':					{ reps_demiquest: 12 },
	'look for clues':					{ reps_8:  0 },
	'marauders!':						{ reps_demiquest:  9 },
	'march into the undead lands':		{ reps_6: 24 },
	'march to the unholy war':			{ reps_6: 25 },
	'mausoleum of triste':				{ reps_3: 17 },
	'misty hills of boralis':			{ reps_3: 20 },
	'mount aretop':						{ reps_demiquest: 25 },
	'nightmare':						{ reps_6: 20 },
	'outpost entrance':					{ reps_11:  0 },
	'path to heaven':					{ reps_8: 11 },
	'pick up the orc trail':			{ reps_1:  6 },
	'plan the attack':					{ reps_demiquest: 12 },
	'portal of atlantis':				{ reps_atlantis: 20 },
	'power of excalibur':				{ reps_8: 11 },
	'prepare for ambush':				{ reps_1:  6 },
	'prepare for battle':				{ reps_5: 32, reps_demiquest: 12 },
	'prepare for the trials':			{ reps_9: 17 },
	'prepare tactics':					{ reps_10:  0 },
	'prepare troops':					{ reps_10:  0 },
	'prevent dragon? escape':			{ reps_demiquest: 12 },
	'protect temple from raiders':		{ reps_2: 40 },
	'purge forest of evil':				{ reps_2: 27 },
	'pursuing orcs':					{ reps_1: 13 },
	'put out the fires':				{ reps_demiquest:  8 },
	'question dark elf prisoners':		{ reps_demiquest: 12 },
	'question the druidic wolf':		{ reps_demiquest: 12 },
	'question townspeople':				{ reps_11:  0 },
	'question vulcan':					{ reps_8:  0 },
	'ready the horses':					{ reps_1:  6 },
	'recover the key':					{ reps_9: 17 },
	'recruit allies':					{ reps_10:  0 },
	'recruit elekin to join you':		{ reps_demiquest:  9 },
	'recruit furest to join you':		{ reps_demiquest: 12 },
	'repel gargoyle raid':				{ reps_4: 14 },
	'request council':					{ reps_10:  0 },
	'rescue survivors':					{ reps_8:  0 },
	'resist the lost souls':			{ reps_5: 25 },
	'retrieve dragon slayer':			{ reps_demiquest: 10 },
	'retrieve the jeweled heart':		{ reps_demiquest: 12 },
	'ride to aretop':					{ reps_demiquest: 12 },
	'ride towards the palace':			{ reps_9: 17 },
	'river of lava':					{ reps_10: 10 },
	'river of light':					{ reps_1: 10 },
	'save lost souls':					{ reps_5: 24 },
	'save stranded soldiers':			{ reps_10:  0 },
	'seek out elekin':					{ reps_demiquest:  9 },
	'seek out furest hellblade':		{ reps_demiquest: 12 },
	'seek out jeweled heart':			{ reps_demiquest: 12 },
	'shield of the stars':				{ reps_demiquest: 20 },
	'slaughter orcs':					{ reps_3: 15 },
	'slay cave bats':					{ reps_demiquest: 10 },
	'slay the black dragons':			{ reps_5: 32 },
	'slay the guardian':				{ reps_9: 17 },
	'slay the sea serpent':				{ reps_demiquest: 12 },
	'sneak attack on dragon':			{ reps_demiquest: 12 },
	'sneak into the city':				{ reps_8:  0 },
	'sneak up on orcs':					{ reps_1:  7 },
	'soldiers of the black lion':		{ reps_demiquest: 10 },
	'spire of death':					{ reps_5: 20 },
	'spring surprise attack':			{ reps_demiquest: 12 },
	'stop the wolf from channeling':	{ reps_demiquest: 12 },
	'storm the castle':					{ reps_demiquest: 12 },
	'storm the ivory palace':			{ reps_9: 17 },
	'sulfurous springs':				{ reps_11: 10 },
	'summon legendary defenders':		{ reps_6: 25 },
	'surround rebels':					{ reps_10:  0 },
	'survey battlefield':				{ reps_10:  0 },
	'survey the surroundings':			{ reps_8:  0 },
	'survive the storm':				{ reps_11:  0 },
	'survive troll ambush':				{ reps_2: 10 },
	'surviving the onslaught':			{ reps_9: 17 },
	'the belly of the demon':			{ reps_5: 20 },
	'the betrayed lands':				{ reps_4: 16 },
	'the black portal':					{ reps_demiquest: 15 },
	'the cave of wonder':				{ reps_3: 20 },
	'the crystal caverns':				{ reps_demiquest: 11 },
	'the darkening skies':				{ reps_9: 17 },
	'the deep':							{ reps_atlantis: 20 },
	'the elven sorceress':				{ reps_demiquest: 11 },
	'the fallen druids':				{ reps_demiquest: 12 },
	'the final stretch':				{ reps_9: 17 },
	'the forbidden forest':				{ reps_2: 20 },
	'the forbidden ritual':				{ reps_5: 20 },
	'the hidden lair':					{ reps_demiquest: 13 },
	'the hollowing moon':				{ reps_6: 17 },
	'the infestation of winterguard':	{ reps_demiquest: 10 },
	'the invasion':						{ reps_8: 11 },
	'the keep of corelan':				{ reps_3: 17 },
	'the keep of isles':				{ reps_4: 16 },
	'the kingdom of alarean':			{ reps_demiquest: 15 },
	'the last gateway':					{ reps_9: 17 },
	"the lich ne'zeal":					{ reps_demiquest: 13 },
	"the lich's keep":					{ reps_demiquest: 15 },
	'the living gates':					{ reps_5: 20 },
	'the long path':					{ reps_7: 12 },
	'the peaks of draneth':				{ reps_demiquest: 21 },
	'the poison source':				{ reps_11:  0 },
	'the rebellion':					{ reps_10: 10 },
	'the return home':					{ reps_8: 11 },
	'the return of the dragon':			{ reps_demiquest:  9 },
	'the ride south':					{ reps_8:  0 },
	'the river of blood':				{ reps_5: 20 },
	'the sea temple':					{ reps_atlantis: 20 },
	'the search for clues':				{ reps_demiquest: 12 },
	'the second temple of water':		{ reps_4: 25 },
	'the smouldering pit':				{ reps_4: 40 },
	'the source of darkness':			{ reps_demiquest: 20 },
	'the source of magic':				{ reps_demiquest: 15 },
	'the stairs of terra':				{ reps_2: 10 },
	'the stone lake':					{ reps_1: 12 },
	'the sunken city':					{ reps_demiquest: 17 },
	'the tree of life':					{ reps_demiquest: 21 },
	'the vanguard of destruction':		{ reps_demiquest: 21 },
	'the water temple':					{ reps_2: 17 },
	'track down soldiers':				{ reps_demiquest: 12 },
	'track sylvana':					{ reps_demiquest: 12 },
	'train with ambrosia':				{ reps_demiquest: 12 },
	'train with aurora':				{ reps_demiquest: 12 },
	'travel to the tree of life':		{ reps_demiquest: 12 },
	'travel to winterguard':			{ reps_demiquest: 12 },
	'triste':							{ reps_3: 20 },
	'undead crusade':					{ reps_6: 17 },
	'underwater ruins':					{ reps_atlantis: 20 },
	'unholy war':						{ reps_6: 20 },
	'use battering ram':				{ reps_11:  0 },
	'vengeance':						{ reps_demiquest: 17 },
	'vesuv bridge':						{ reps_10: 10 },
	'vesuv lookout':					{ reps_2: 17 },
	'visit the blacksmith':				{ reps_1: 24 },
	'vulcans secret':					{ reps_8: 11 },
	'watch the skies':					{ reps_demiquest: 12 },
};

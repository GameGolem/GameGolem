/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page, Queue, Resources,
	Alchemy, Bank, Battle, Generals, LevelUp, Monster, Player, Town,
	APP, APPID, warn, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser, console,
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
	var data = this.get('data'), runtime = this.get('runtime'), i, r, x;
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
				x = (this.rdata[i] && this.rdata[i][r]) || 16;
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
	var i, r, unit, own, need, noCanDo = false, best = null, best_cartigan = null, best_vampire = null, best_subquest = null, best_advancement = null, best_influence = null, best_experience = null, best_land = 0, has_cartigan = false, has_vampire = false, list = [], items = {}, data = this.data, maxenergy = Player.get('maxenergy',999), eff, best_sub_eff = 1e10, best_adv_eff = 1e10, best_inf_eff = 1e10;
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
			eff = data.id[i].eff || (data.id[i].energy * (!isNumber(data.id[i].level) ? 1 : ((this.rdata[data.id[i].name] && this.rdata[data.id[i].name][r]) || 16)));
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
			console.log(warn(), 'Wanting to perform - ' + data.id[best].name + ' in ' + (isNumber(data.id[best].land) ? this.land[data.id[best].land] : this.area[data.id[best].area]) + ' (energy: ' + data.id[best].energy + ', experience: ' + data.id[best].exp + ', gold: $' + shortNumber(data.id[best].reward) + ')');
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
		var r, o = self.data.id[q];
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
				return o.eff || (o.energy * (!isNumber(o.level) ? 1 :
				  ((self.rdata[o.name] && self.rdata[o.name][r]) || 16)));
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
			vv = quest.eff || (quest.energy * ((this.rdata[quest.name] && this.rdata[quest.name][r]) || 16));
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
			} else if (this.rdata[quest.name] && this.rdata[quest.name][r]) {
				if (tt !== '') {
					tt += ', ';
				}
				tt += 'wiki reps ' + this.rdata[quest.name][r];
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
						desc += ' $' + shortNumber((n - c) * k);
						ccount++;
					}
					if (j) {
						desc += ' (upkeep $' + shortNumber((n - c) * j) + ')';
						ucount++;
					}
				}
			}
		}

		if (ccount > 1 && cost) {
			desc += '; total ';
			if (cost < 1e50) {
				desc += '$' + shortNumber(cost);
			} else {
				desc += '(n/a)';
			}
		}

		if (ucount > 1 && upkeep) {
			desc += '; upkeep $' + shortNumber(upkeep);
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
	'A Demonic Transformation':			{ reps_4: 40 },
	'A Forest in Peril':				{ reps_demiquest:  9 },
	'A Kidnapped Princess':				{ reps_demiquest: 10 },
	'Across the Sea':					{ reps_11:  8 },
	'Aid Corvintheus':					{ reps_demiquest:  9 },
	'Aid the Angels':					{ reps_9: 17 },
	'Approach the Prayer Chamber':		{ reps_demiquest: 12 },
	'Approach the Tree of Life':		{ reps_demiquest: 12 },
	'Ascent to the Skies':				{ reps_8:  0 },
	'Attack Undead Guardians':			{ reps_6: 24 },
	'Attack from Above':				{ reps_9: 17 },
	'Aurelius':							{ reps_11:  0 },
	'Aurelius Outpost':					{ reps_11:  0 },
	'Avoid Ensnarements':				{ reps_3: 34 },
	'Avoid the Guards':					{ reps_8:  0 },
	'Avoid the Patrols':				{ reps_9: 17 },
	'Banish the Horde':					{ reps_9: 17 },
	'Battle A Wraith':					{ reps_2: 16 },
	'Battle Earth and Fire Demons':		{ reps_4: 16 },
	'Battle Gang of Bandits':			{ reps_1: 10 },
	'Battle Orc Captain':				{ reps_3: 15 },
	'Battle The Black Dragon':			{ reps_4: 14 },
	'Battle the End':					{ reps_demiquest: 12 },
	'Battling the Demons':				{ reps_9: 17 },
	'Being Followed':					{ reps_7: 15 },
	'Blood Wing King of the Dragons':	{ reps_demiquest: 20 },
	'Breach the Barrier':				{ reps_8:  0 },
	'Breach the Keep Entrance':			{ reps_demiquest: 12 },
	'Breaching the Gates':				{ reps_7: 15 },
	'Break Aurelius Guard':				{ reps_11:  0 },
	'Break Evil Seal':					{ reps_7: 17 },
	'Break the Lichs Spell':			{ reps_demiquest: 12 },
	'Break the Line':					{ reps_10:  0 },
	'Breaking Through the Guard':		{ reps_9: 17 },
	'Bridge of Elim':					{ reps_8: 11 },
	'Burning Gates':					{ reps_7:  0 },
	'Call of Arms':						{ reps_6: 25 },
	'Cast Aura of Night':				{ reps_5: 32 },
	'Cast Blizzard':					{ reps_10:  0 },
	'Cast Fire Aura':					{ reps_6: 24 },
	'Cast Holy Light':					{ reps_6: 24 },
	'Cast Holy Light Spell':			{ reps_5: 24 },
	'Cast Holy Shield':					{ reps_demiquest: 12 },
	'Cast Meteor':						{ reps_5: 32 },
	'Castle of the Black Lion':			{ reps_demiquest: 13 },
	'Castle of the Damn':				{ reps_demiquest: 25 },
	'Channel Excalibur':				{ reps_8:  0 },
	'Charge Ahead':						{ reps_10:  0 },
	'Charge the Castle':				{ reps_7: 15 },
	'Chasm of Fire':					{ reps_10: 10 },
	'City of Clouds':					{ reps_8: 11 },
	'Clear the Rocks':					{ reps_11:  0 },
	'Climb Castle Cliffs':				{ reps_11:  0 },
	'Climb the Mountain':				{ reps_8:  0 },
	'Close the Black Portal':			{ reps_demiquest: 12 },
	'Confront the Black Lion':			{ reps_demiquest: 12 },
	'Confront the Rebels':				{ reps_10: 10 },
	'Consult Aurora':					{ reps_demiquest: 12 },
	'Corruption of Nature':				{ reps_demiquest: 20 },
	'Cover Tracks':						{ reps_7: 19 },
	'Cross Lava River':					{ reps_7: 20 },
	'Cross the Bridge':					{ reps_10:  0, reps_8:  0 },
	'Cross the Moat':					{ reps_11:  0 },
	'Crossing the Chasm':				{ reps_2: 13, reps_8:  0 },
	'Cure Infested Soldiers':			{ reps_6: 25 },
	'Deal Final Blow to Bloodwing':		{ reps_demiquest: 12 },
	'Deathrune Castle':					{ reps_7: 12 },
	'Decipher the Clues':				{ reps_9: 17 },
	'Defeat Angelic Sentinels':			{ reps_8:  0 },
	'Defeat Bear Form':					{ reps_11:  0 },
	'Defeat Bloodwing':					{ reps_demiquest: 12 },
	'Defeat Chimerus':					{ reps_demiquest: 12 },
	'Defeat Darien Woesteel':			{ reps_demiquest: 25 },
	'Defeat Demonic Guards':			{ reps_7: 17 },
	'Defeat Fire Elementals':			{ reps_10:  0 },
	'Defeat Frost Minions':				{ reps_3: 40 },
	'Defeat Lion Defenders':			{ reps_11:  0 },
	'Defeat Orc Patrol':				{ reps_8:  0 },
	'Defeat Rebels':					{ reps_10:  0 },
	'Defeat Snow Giants':				{ reps_3: 24 },
	'Defeat Tiger Form':				{ reps_11:  0 },
	'Defeat and Heal Feral Animals':	{ reps_demiquest: 12 },
	'Defeat the Bandit Leader':			{ reps_1:  6 },
	'Defeat the Banshees':				{ reps_5: 25 },
	'Defeat the Black Lion Army':		{ reps_demiquest: 12 },
	'Defeat the Demonic Guards':		{ reps_demiquest: 12 },
	'Defeat the Demons':				{ reps_9: 17 },
	'Defeat the Kobolds':				{ reps_10:  0 },
	'Defeat the Patrols':				{ reps_9: 17 },
	'Defeat the Seraphims':				{ reps_8:  0 },
	'Defend The Village':				{ reps_demiquest: 12 },
	'Desert Temple':					{ reps_11: 12 },
	'Destroy Black Oozes':				{ reps_11:  0 },
	'Destroy Fire Dragon':				{ reps_4: 10 },
	'Destroy Fire Elemental':			{ reps_4: 16 },
	'Destroy Horde of Ghouls & Trolls':	{ reps_4:  9 },
	'Destroy Undead Crypt':				{ reps_1:  5 },
	'Destroy the Black Gate':			{ reps_demiquest: 12 },
	'Destroy the Black Portal':			{ reps_demiquest: 12 },
	'Destroy the Bolted Door':			{ reps_demiquest: 12 },
	'Destruction Abound':				{ reps_8: 11 },
	'Determine Cause of Corruption':	{ reps_demiquest: 12 },
	'Dig up Star Metal':				{ reps_demiquest: 12 },
	'Disarm Townspeople':				{ reps_11:  0 },
	'Discover Cause of Corruption':		{ reps_demiquest: 12 },
	'Dismantle Orc Patrol':				{ reps_3: 32 },
	'Dispatch More Cultist Guards':		{ reps_demiquest: 12 },
	'Distract the Demons':				{ reps_9: 17 },
	'Dragon Slayer':					{ reps_demiquest: 14 },
	'Druidic Prophecy':					{ reps_11:  9 },
	"Duel Cefka's Knight Champion":		{ reps_4: 10 },
	'Dwarven Stronghold':				{ reps_10: 10 },
	'Eastern Corridor':					{ reps_11:  0 },
	'Elekin the Dragon Slayer':			{ reps_demiquest: 10 },
	'End of the Road':					{ reps_9: 17 },
	'Enlist Captain Morgan':			{ reps_11:  0 },
	'Entrance to Terra':				{ reps_1:  9 },
	'Equip Soldiers':					{ reps_6: 25 },
	'Escaping the Chaos':				{ reps_9: 17 },
	'Escaping the Stronghold':			{ reps_9: 10 },
	'Explore Merchant Plaza':			{ reps_11:  0 },
	'Explore the Temple':				{ reps_11:  0 },
	'Extinguish Desert Basilisks':		{ reps_11:  0 },
	'Extinguish the Fires':				{ reps_8:  0 },
	'Falls of Jiraya':					{ reps_1: 10 },
	'Family Ties':						{ reps_demiquest: 11 },
	'Fend off Demons':					{ reps_7: 20 },
	'Fiery Awakening':					{ reps_7: 12 },
	"Fight Cefka's Shadow Guard":		{ reps_4: 10 },
	'Fight Demonic Worshipers':			{ reps_5: 24 },
	'Fight Dragon Welps':				{ reps_4: 10 },
	'Fight Ghoul Army':					{ reps_1:  5 },
	'Fight Gildamesh':					{ reps_3: 32 },
	'Fight Ice Beast':					{ reps_3: 40 },
	'Fight Infested Soldiers':			{ reps_6: 25 },
	'Fight Off Demons':					{ reps_5: 32 },
	'Fight Off Zombie Infestation':		{ reps_demiquest: 12 },
	'Fight Snow King':					{ reps_3: 24 },
	'Fight Treants':					{ reps_2: 27 },
	'Fight Undead Zombies':				{ reps_2: 16 },
	'Fight Water Demon Lord':			{ reps_2: 31 },
	'Fight Water Demons':				{ reps_2: 40 },
	'Fight Water Spirits':				{ reps_2: 40 },
	'Fight the Half-Giant Sephor':		{ reps_4:  9 },
	'Find Evidence of Dragon Attack':	{ reps_demiquest:  8 },
	'Find Hidden Path':					{ reps_demiquest: 10 },
	'Find Nezeals Keep':				{ reps_demiquest: 12 },
	'Find Rock Worms Weakness':			{ reps_demiquest: 10 },
	'Find Source of the Attacks':		{ reps_demiquest: 12 },
	'Find Survivors':					{ reps_8:  0 },
	'Find The Safest Path':				{ reps_10:  0 },
	'Find Troll Weakness':				{ reps_2: 10 },
	'Find Your Way Out':				{ reps_7: 15 },
	'Find the Dark Elves':				{ reps_demiquest: 12 },
	'Find the Demonic Army':			{ reps_demiquest: 12 },
	'Find the Druids':					{ reps_demiquest: 12 },
	'Find the Entrance':				{ reps_8:  0 },
	'Find the Exit':					{ reps_9: 17 },
	'Find the Source of Corruption':	{ reps_demiquest: 12 },
	'Find the Woman? Father':			{ reps_demiquest: 12 },
	'Fire and Brimstone':				{ reps_7: 12 },
	'Forest of Ash':					{ reps_demiquest: 11 },
	'Furest Hellblade':					{ reps_demiquest: 17 },
	'Gain Access':						{ reps_10:  0 },
	'Gain Entry':						{ reps_11:  0 },
	'Gates to the Undead':				{ reps_6: 17 },
	'Gateway':							{ reps_8: 11 },
	'Get Information from the Druid':	{ reps_demiquest: 12 },
	'Get Water for the Druid':			{ reps_demiquest: 12 },
	'Grim Outlook':						{ reps_9: 17 },
	'Guard Against Attack':				{ reps_demiquest: 12 },
	'Heal Wounds':						{ reps_7: 20 },
	'Heat the Villagers':				{ reps_1:  5 },
	'Holy Fire':						{ reps_demiquest: 11 },
	'Impending Battle':					{ reps_10: 10 },
	'Interrogate the Prisoners':		{ reps_9: 17 },
	'Investigate the Gateway':			{ reps_8:  0 },
	'Ironfist Dwarves':					{ reps_10: 10 },
	'Join Up with Artanis':				{ reps_demiquest: 12 },
	'Judgement Stronghold':				{ reps_8: 11 },
	'Juliean Desert':					{ reps_11: 12 },
	'Kelp Forest':						{ reps_atlantis: 20 },
	'Kill Gildamesh':					{ reps_3: 34 },
	'Kill Vampire Bats':				{ reps_demiquest: 12 },
	'Koralan Coast Town':				{ reps_11: 14 },
	'Koralan Townspeople':				{ reps_11:  0 },
	'Learn Aurelius Intentions':		{ reps_11:  0 },
	'Learn Counterspell':				{ reps_demiquest: 12 },
	'Learn Holy Fire':					{ reps_demiquest: 12 },
	'Learn about Death Knights':		{ reps_demiquest: 12 },
	'Look for Clues':					{ reps_8:  0 },
	'Marauders':						{ reps_demiquest:  9 },
	'March Into The Undead Lands':		{ reps_6: 24 },
	'March to The Unholy War':			{ reps_6: 25 },
	'Mausoleum of Triste':				{ reps_3: 17 },
	'Misty Hills of Boralis':			{ reps_3: 20 },
	'Mount Aretop':						{ reps_demiquest: 25 },
	'Nightmare':						{ reps_6: 20 },
	'Outpost Entrance':					{ reps_11:  0 },
	'Path to Heaven':					{ reps_8: 11 },
	'Pick up the Orc Trail':			{ reps_1:  6 },
	'Plan the Attack':					{ reps_demiquest: 12 },
	'Portal of Atlantis':				{ reps_atlantis: 20 },
	'Power of Excalibur':				{ reps_8: 11 },
	'Prepare Tactics':					{ reps_10:  0 },
	'Prepare Troops':					{ reps_10:  0 },
	'Prepare for Ambush':				{ reps_1:  6 },
	'Prepare for Battle':				{ reps_5: 32, reps_demiquest: 12 },
	'Prepare for the Trials':			{ reps_9: 17 },
	'Prevent Dragon? [sic] Escape':		{ reps_demiquest: 12 },
	'Protect Temple From Raiders':		{ reps_2: 40 },
	'Purge Forest of Evil':				{ reps_2: 27 },
	'Pursuing Orcs':					{ reps_1: 13 },
	'Put Out the Fires':				{ reps_demiquest:  8 },
	'Question Dark Elf Prisoners':		{ reps_demiquest: 12 },
	'Question Townspeople':				{ reps_11:  0 },
	'Question Vulcan':					{ reps_8:  0 },
	'Question the Druidic Wolf':		{ reps_demiquest: 12 },
	'Ready the Horses':					{ reps_1:  6 },
	'Recover the Key':					{ reps_9: 17 },
	'Recruit Allies':					{ reps_10:  0 },
	'Recruit Elekin to Join You':		{ reps_demiquest:  9 },
	'Recruit Furest to Join You':		{ reps_demiquest: 12 },
	'Repel Gargoyle Raid':				{ reps_4: 14 },
	'Request Council':					{ reps_10:  0 },
	'Rescue Survivors':					{ reps_8:  0 },
	'Resist the Lost Souls':			{ reps_5: 25 },
	'Retrieve Dragon Slayer':			{ reps_demiquest: 10 },
	'Retrieve the Jeweled Heart':		{ reps_demiquest: 12 },
	'Ride Towards the Palace':			{ reps_9: 17 },
	'Ride to Aretop':					{ reps_demiquest: 12 },
	'River of Lava':					{ reps_10: 10 },
	'River of Light':					{ reps_1: 10 },
	'Save Lost Souls':					{ reps_5: 24 },
	'Save Stranded Soldiers':			{ reps_10:  0 },
	'Seek Out Elekin':					{ reps_demiquest:  9 },
	'Seek Out Furest Hellblade':		{ reps_demiquest: 12 },
	'Seek out Jeweled Heart':			{ reps_demiquest: 12 },
	'Shield of the Stars':				{ reps_demiquest: 20 },
	'Slaughter Orcs':					{ reps_3: 15 },
	'Slay Cave Bats':					{ reps_demiquest: 10 },
	'Slay the Black Dragons':			{ reps_5: 32 },
	'Slay the Guardian':				{ reps_9: 17 },
	'Slay the Sea Serpent':				{ reps_demiquest: 12 },
	'Sneak Attack on Dragon':			{ reps_demiquest: 12 },
	'Sneak into the City':				{ reps_8:  0 },
	'Sneak up on Orcs':					{ reps_1:  7 },
	'Soldiers of the Black Lion':		{ reps_demiquest: 10 },
	'Spire of Death':					{ reps_5: 20 },
	'Spring Surprise Attack':			{ reps_demiquest: 12 },
	'Stop the Wolf from Channeling':	{ reps_demiquest: 12 },
	'Storm the Castle':					{ reps_demiquest: 12 },
	'Storm the Ivory Palace':			{ reps_9: 17 },
	'Sulfurous Springs':				{ reps_11: 10 },
	'Summon Legendary Defenders':		{ reps_6: 25 },
	'Surround Rebels':					{ reps_10:  0 },
	'Survey Battlefield':				{ reps_10:  0 },
	'Survey the Surroundings':			{ reps_8:  0 },
	'Survive Troll Ambush':				{ reps_2: 10 },
	'Survive the Storm':				{ reps_11:  0 },
	'Surviving the Onslaught':			{ reps_9: 17 },
	'The Belly of the Demon':			{ reps_5: 20 },
	'The Betrayed Lands':				{ reps_4: 16 },
	'The Black Portal':					{ reps_demiquest: 15 },
	'The Cave of Wonder':				{ reps_3: 20 },
	'The Crystal Caverns':				{ reps_demiquest: 11 },
	'The Darkening Skies':				{ reps_9: 17 },
	'The Deep':							{ reps_atlantis: 20 },
	'The Elven Sorceress':				{ reps_demiquest: 11 },
	'The Fallen Druids':				{ reps_demiquest: 12 },
	'The Final Stretch':				{ reps_9: 17 },
	'The Forbidden Forest':				{ reps_2: 20 },
	'The Forbidden Ritual':				{ reps_5: 20 },
	'The Hidden Lair':					{ reps_demiquest: 13 },
	'The Hollowing Moon':				{ reps_6: 17 },
	'The Infestation of Winterguard':	{ reps_demiquest: 10 },
	'The Invasion':						{ reps_8: 11 },
	'The Keep of Corelan':				{ reps_3: 17 },
	'The Keep of Isles':				{ reps_4: 16 },
	'The Kingdom of Alarean':			{ reps_demiquest: 15 },
	'The Last Gateway':					{ reps_9: 17 },
	"The Lich Ne'zeal":					{ reps_demiquest: 13 },
	"The Lich's keep":					{ reps_demiquest: 15 },
	'The Living Gates':					{ reps_5: 20 },
	'The Long Path':					{ reps_7: 12 },
	'The Peaks of Draneth':				{ reps_demiquest: 21 },
	'The Poison Source':				{ reps_11:  0 },
	'The Rebellion':					{ reps_10: 10 },
	'The Return Home':					{ reps_8: 11 },
	'The Return of the Dragon':			{ reps_demiquest:  9 },
	'The Ride South':					{ reps_8:  0 },
	'The River of Blood':				{ reps_5: 20 },
	'The Sea Temple':					{ reps_atlantis: 20 },
	'The Search for Clues':				{ reps_demiquest: 12 },
	'The Second Temple of Water':		{ reps_4: 25 },
	'The Smouldering Pit':				{ reps_4: 40 },
	'The Source of Darkness':			{ reps_demiquest: 20 },
	'The Source of Magic':				{ reps_demiquest: 15 },
	'The Stairs of Terra':				{ reps_2: 10 },
	'The Stone Lake':					{ reps_1: 12 },
	'The Sunken City':					{ reps_demiquest: 17 },
	'The Tree of Life':					{ reps_demiquest: 26 },
	'The Vanguard of Destruction':		{ reps_demiquest: 21 },
	'The Water Temple':					{ reps_2: 17 },
	'Track Down Soldiers':				{ reps_demiquest: 12 },
	'Track Sylvana':					{ reps_demiquest: 12 },
	'Train with Ambrosia':				{ reps_demiquest: 12 },
	'Train with Aurora':				{ reps_demiquest: 12 },
	'Travel to Winterguard':			{ reps_demiquest: 12 },
	'Travel to the Tree of Life':		{ reps_demiquest: 12 },
	'Triste':							{ reps_3: 20 },
	'Undead Crusade':					{ reps_6: 17 },
	'Underwater Ruins':					{ reps_atlantis: 20 },
	'Unholy War':						{ reps_6: 20 },
	'Use Battering Ram':				{ reps_11:  0 },
	'Vengeance':						{ reps_demiquest: 17 },
	'Vesuv Bridge':						{ reps_10: 10 },
	'Vesuv Lookout':					{ reps_2: 17 },
	'Visit the Blacksmith':				{ reps_1: 24 },
	'Vulcans Secret':					{ reps_8: 11 },
	'Watch the Skies':					{ reps_demiquest: 12 }
};

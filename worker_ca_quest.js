/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page, Queue, Resources,
	Alchemy, Bank, Battle, Generals, LevelUp, Monster, Player, Town,
	APP, APPID, warn, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser, console,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, Divisor, length, sum, findInObject, objectIndex, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime
*/
/********** Worker.Quest **********
* Completes quests with a choice of general
*/
// Should also look for quests_quest but that should never be used unless there's a new area
var Quest = new Worker('Quest');

Quest.settings = {
	taint:true
};

Quest.defaults['castle_age'] = {
	pages:'quests_quest1 quests_quest2 quests_quest3 quests_quest4 quests_quest5 quests_quest6 quests_quest7 quests_quest8 quests_quest9 quests_quest10 quests_quest11 quests_quest12 quests_quest13 quests_quest14 quests_demiquests quests_atlantis'
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

Quest.land = [
	'Land of Fire',
	'Land of Earth',
	'Land of Mist',
	'Land of Water',
	'Demon Realm',
	'Undead Realm',
	'Underworld',
	'Kingdom of Heaven',
	'Ivory City',
	'Earth II',
	'Water II',
	'Mist II',
	'Mist III',
	'Fire II',
	'Pangaea'
];
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

Quest.init = function(old_revision) {
	var i, x;
	// BEGIN: No longer needed per-worker revision watching
	if (old_revision <= 1131) {
		this.set(['runtime','revision']);
	}
	// END
	// BEGIN: fix up "under level 4" generals
	if (old_revision <= 1100 && this.get(['option','general_choice']) === 'under level 4') {
		this.set('option.general_choice', 'under max level');
	}
	// END
	// BEGIN: one time pre-r845 fix for erroneous values in m_c, m_d, reps, eff
	if (old_revision < 845) {
		for (i in this.data) {
			if (this.data[i].reps) {
				x = this.wiki_reps(this.data[i], true);
				if (this.data[i].reps < Math.round(x * 0.8) || this.data[i].reps > Math.round(x * 1.2)) {
					log(LOG_WARN, 'Quest.init: deleting metrics for: ' + i);
					this.set(['data',i,'m_c']);
					this.set(['data',i,'m_d']);
					this.set(['data',i,'reps']);
					this.set(['data',i,'eff']);
				}
			}
		}
	}
	// END
	// BEGIN: one time pre-r850 fix to map data by id instead of name
	if (old_revision < 850) {
		this.set(['runtime','best'], null);
		this.set(['runtime','energy'], 0);
		this.set(['runtime','quest']);
		if (!('id' in this.data) && ('Pursuing Orcs' in this.data)) {
			for (i in this.data) {
				if (i !== 'id') {
					if ('id' in this.data[i]) {
						this.set(['data','id',this.data[i].id], this.data[i]);
						this.set(['data',i,'id']);
					}
					this.set(['data',i]);
				}
			}
		}
	}
	// END
	this._watch(this, 'runtime.best');
	this._watch(Player, 'data.exp');
	this._watch(LevelUp, 'runtime.energy');
	this._watch(LevelUp, 'runtime.quest');
};

Quest.page = function(page, change) {
	var data = this.data, last_main = 0, area = null, land = null, i, j, m_c, m_d, m_l, m_i, reps, purge = {}, quests, el, id, name, level, influence, reward, energy, exp, tmp, type, units, item, icon, c;
	if (page === 'quests_quest') {
		return false; // This is if we're looking at a page we don't have access to yet...
	} else if (page === 'quests_demiquests') {
		area = 'demiquest';
	} else if (page === 'quests_atlantis') {
		area = 'atlantis';
	} else {
		area = 'quest';
		land = page.regex(/quests_quest(\d+)/i) - 1;
	}
	for (i in data.id) {
		if (data.id[i].area === area && (area !== 'quest' || data.id[i].land === land)) {
			purge[i] = true;
		}
	}
	if ($('div.quests_background,div.quests_background_sub').length !== $('div.quests_background .quest_progress,div.quests_background_sub .quest_sub_progress').length) {
		Page.to(page, '');// Force a page reload as we're pretty sure it's a bad page load!
		return false;
	}
	quests = $('div.quests_background,div.quests_background_sub,div.quests_background_special');
	for (i=0; i<quests.length; i++) {
		el = quests[i];
		try {
			tmp = $('input[name="quest"]', el);
			if (!tmp.length || !tmp.val()) {
				continue;
			}
			assert(id = parseInt(tmp.val() || '0'), 'Bad quest id: '+tmp.val());
			this._transaction(); // BEGIN TRANSACTION
			delete purge[id]; // We've found it, and further errors shouldn't delete it
			name = undefined;
			type = undefined;
			level = undefined;
			influence = undefined;
			energy = undefined;
			exp = undefined;
			reward = undefined;
			if ($(el).hasClass('quests_background_sub')) { // Subquest
				name = $('.quest_sub_title', el).text().trim();
				assert((tmp = $('.qd_2_sub', el).text().replace(/\s+/gm, ' ').replace(/,/g, '').replace(/mil\b/gi, '000000')), 'Unknown rewards');
				exp = tmp.regex(/\b(\d+)\s*Exp\b/im);
				reward = tmp.regex(/\$\s*(\d+)\s*-\s*\$\s*(\d+)\b/im);
				energy = $('.quest_req_sub', el).text().regex(/\b(\d+)\s*Energy\b/im);
				tmp = $('.quest_sub_progress', el).text();
				level = tmp.regex(/\bLEVEL:?\s*(\d+)\b/im);
				influence = tmp.regex(/\bINFLUENCE:?\s*(\d+)%/im);
				type = 2;
			} else {
				name = $('.qd_1 b', el).text().trim();
				assert((tmp = $('.qd_2', el).text().replace(/\s+/gm, ' ').replace(/,/g, '').replace(/mil\b/gi, '000000')), 'Unknown rewards');
				exp = tmp.regex(/\b(\d+)\s*Exp\b/im);
				reward = tmp.regex(/\$\s*(\d+)\s*-\s*\$\s*(\d+)\b/im);
				energy = $('.quest_req', el).text().regex(/\b(\d+)\s*Energy\b/im);
				if ($(el).hasClass('quests_background')) { // Main quest
					last_main = id;
					tmp = $('.quest_progress', el).text();
					level = tmp.regex(/\bLEVEL:?\s*(\d+)\b/im);
					influence = tmp.regex(/\bINFLUENCE:?\s*(\d+)%/im);
					type = 1;
				} else { // Special / boss Quest
					type = 3;
				}
			}
			assert(name && name.indexOf('\t') === -1, 'Bad quest name - found tab character');
			this.set(['data','id',id,'button_fail'], 0);
			assert(this.set(['data','id',id,'name'], name, 'string'), 'Bad quest name: '+name);
			assert(this.set(['data','id',id,'area'], area, 'string'), 'Bad area name: '+area);
			assert(this.set(['data','id',id,'type'], type, 'number'), 'Unknown quest type: '+name);
			assert(this.set(['data','id',id,'exp'], exp, 'number'), 'Unknown exp reward');
			assert(this.set(['data','id',id,'reward'], (reward[0] + reward[1]) / 2), 'Bad money reward');
			this.set(['data','id',id,'energy'], energy);
			this.set(['data','id',id,'land'], isNumber(land) ? land : undefined);
			this.set(['data','id',id,'main'], type === 2 && last_main ? last_main : undefined);
			if (isNumber(influence)) {
				m_l = this.get(['data','id',id,'level'], 0, 'number'); // last influence value
				m_i = this.get(['data','id',id,'influence'], 0, 'number'); // last influence value
				this.set(['data','id',id,'level'], level || 0);
				this.set(['data','id',id,'influence'], influence);
				m_c = this.get(['data','id',id,'m_c'], 0, 'number'); // percentage count metric
				m_d = this.get(['data','id',id,'m_d'], 0, 'number'); // percentage delta metric
				reps = this.get(['data','id',id,'reps'], 0, 'number'); // average reps needed per level
				if (m_l === (level || 0) && m_i < influence && influence < 100) {
					m_d += influence - m_i;
					m_c++;
				}
				if (m_c && m_d) {
					this.set(['data','id',id,'m_c'], m_c);
					this.set(['data','id',id,'m_d'], m_d);
					reps = Math.ceil(m_c * 100 / m_d);
				}
				if (reps) {
					this.set(['data','id',id,'reps'], reps);
					this.set(['data','id',id,'eff'], energy * reps);
				}
			}
			if (type !== 2) { // That's everything for subquests
				this.set(['data','id',id,'unique'], type === 3 ? true : undefined); // Special / boss quests create unique items
				tmp = $('.qd_1 img', el).last();
				if (tmp.length && (item = tmp.attr('title'))) {
					item = item.trim(true);
					icon = (tmp.attr('src') || '').filepart();
					this.set(['data','id',id,'item'], Town.qualify(item, icon));
					this.set(['data','id',id,'itemimg'], icon);
				}
				units = $('.quest_req >div >div >div', el);
				for (j=0; j<units.length; j++) {
					item = ($('img', units[j]).attr('title') || '').trim(true);
					icon = ($('img', units[j]).attr('src') || '').filepart();
					c = ($(units[j]).text() || '').regex(/\bx\s*(\d+)\b/im);
					this.set(['data','id',id,'units',Town.qualify(item, icon)], c);
				}
				tmp = $('.quest_act_gen img', el).attr('title');
				this.set(['data','id',id,'general'], tmp || undefined);
			}
			this._transaction(true); // COMMIT TRANSACTION
		} catch(e) {
			this._transaction(false); // ROLLBACK TRANSACTION on any error
			log(e, e.name + ' in ' + this.name + '.page(' + page + ', ' + change + '): ' + e.message);
		}
	}
	for (i in purge) {
		log(LOG_WARN, 'Deleting ' + i + '(' + (this.land[data.id[i].land] || data.id[i].area) + ')');
		this.set(['data','id',i]); // Delete unseen quests...
	}
	return false;
};

  // watch specific Generals if doing an alchemy quest giving a general
  // watch specific Town if doing an alchemy quest giving an item/unit
  // watch Generals if we passed up a preferred quest due to a missing req.
  // watch Town if we passed up a preferred quest due to a missing req.

Quest.update = function(event, events) {
	var i, unit, own, need, noCanDo = false, best = null, best_cartigan = null, best_vampire = null, best_subquest = null, best_advancement = null, best_influence = null, best_experience = null, best_land = 0, has_cartigan = false, has_vampire = false, list = [], items = {}, data = this.data, maxenergy = Player.get('maxenergy',999), eff, best_adv_eff = 1e10, best_inf_eff = 1e10, cmp, oi, ob;
	if (events.findEvent(this, 'watch', 'runtime.best')) {// Only change the display when we change what to do
		if ((best = this.runtime.best)) {
			log(LOG_LOG, 'Wanting to perform - ' + data.id[best].name + ' in ' + (isNumber(data.id[best].land) ? this.land[data.id[best].land] : this.area[data.id[best].area]) + ' (energy: ' + data.id[best].energy + ', experience: ' + data.id[best].exp + ', gold: $' + data.id[best].reward.SI() + ')');
			Dashboard.status(this, (isNumber(data.id[best].land) ? this.land[data.id[best].land] : this.area[data.id[best].area]) + ': ' + data.id[best].name + ' (' + Config.makeImage('energy') + data.id[best].energy + ' = ' + Config.makeImage('exp') + data.id[best].exp + ' + ' + Config.makeImage('gold') + '$' + data.id[best].reward.SI() + (data.id[best].item ? Town.get([data.id[best].item,'img'], null) ? ' + <img style="width:16px;height:16px;margin-bottom:-4px;" src="' + imagepath + Town.get([data.id[best].item, 'img']) + '" title="' + data.id[best].item + '">' : ' + ' + data.id[best].item : '') + (isNumber(data.id[best].influence) && data.id[best].influence < 100 ? (' @ ' + Config.makeImage('percent','Influence') + data.id[best].influence + '%') : '') + ')');
		} else {
			Dashboard.status(this, '<i>Nothing to do</i>');
		}
		best = null;
	}
	if (events.findEvent(Town) || events.findEvent(this, 'data') || events.findEvent(this, 'option')) {
		// First let's update the Quest dropdown list(s)...
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
			if (this.option.what !== 'Cartigan' || Generals.get(['data','Cartigan','own'], 0, 'number') || (Alchemy.get(['ingredients', 'eq_underworld_sword.jpg'], 0, 'number') >= 3 && Alchemy.get(['ingredients', 'eq_underworld_amulet.jpg'], 0, 'number') >= 3 && Alchemy.get(['ingredients', 'eq_underworld_gauntlet.jpg'], 0, 'number') >= 3)) {
				// Sword of the Faithless x3 - The Long Path, Burning Gates
				// Crystal of Lament x3 - Fiery Awakening
				// Soul Eater x3 - Fire and Brimstone, Deathrune Castle
				has_cartigan = true; // Stop trying once we've got the general or the ingredients
			}
	//		log(LOG_WARN, 'option = ' + this.option.what);
	//		best = (this.runtime.best && data.id[this.runtime.best] && (data.id[this.runtime.best].influence < 100) ? this.runtime.best : null);
			for (i in data.id) {
				// Skip quests we can't afford or can't equip the general for
				oi = data.id[i];
				if (oi.energy > maxenergy 
						|| !Generals.test(oi.general || 'any')
						|| (LevelUp.runtime.general && oi.general)) {
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
		this.set(['runtime','best'], best);
		this.set(['runtime','energy'], best ? data.id[best].energy : 0);
	}
	best = LevelUp.get(['runtime','quest'], this.runtime.best, 'string'); // Only override if it has an actual quest for us
	this.set(['option','_sleep'], !best
		|| this.data.id[best].energy > (LevelUp.runtime.force.energy ? LevelUp.runtime.energy : LevelUp.runtime.energy - this.option.energy_reserve)
		|| (!LevelUp.runtime.levelup
			&& ((this.option.monster === 'When able' && Monster.get('runtime.defending'))
				|| (this.option.monster === 'Wait for' && (Monster.get('runtime.defending') || !LevelUp.runtime.force.energy)))));
	return true;
};

Quest.work = function(state) {
	var mid, general = 'any', best = LevelUp.get(['runtime','quest'], this.runtime.best, 'string'), useable_energy = LevelUp.runtime.force.energy ? LevelUp.runtime.energy : LevelUp.runtime.energy - this.option.energy_reserve, quest, button;
	if (state && this.data.id[best].energy > useable_energy && this.option.bank) {
		if (!Bank.stash()) {
			return QUEUE_CONTINUE;
		}
		return QUEUE_FINISH;
	}
//	If holding for fortify, then don't quest if we have a secondary or defend target possible, unless we're forcing energy.
//	if ((LevelUp.runtime.levelup && !LevelUp.runtime.quest)
//	|| (!LevelUp.runtime.levelup 
//		&& ((this.option.monster === 'When able' && Monster.get('runtime.defending')) 
//			|| (this.option.monster === 'Wait for' && (Monster.get('runtime.defending') || !LevelUp.runtime.force.energy))))) {
//		return QUEUE_FINISH;
//	}
	if (!state) {
		return QUEUE_CONTINUE;
	}
	quest = this.data.id[best]
	if (this.option.general) {
		if (quest.general && isNumber(quest.influence) && quest.influence < 100) {
			general = quest.general;
		} else {
			general = Generals.best('under max level');
			switch(this.option.what) {
				case 'Vampire Lord':
				case 'Cartigan':
					if (quest.general) {
						general = quest.general;
					} else {
						if (general === 'any' && isNumber(quest.influence) && quest.influence < 100) {
							general = Generals.best('influence');
						}
						if (general === 'any') {
							general = Generals.best('item');
						}
					}
					break;
				case 'Subquests':
				case 'Advancement':
				case 'Influence':
				case 'Inf+Exp':
				case 'Experience':
				case 'Inf+Cash':
				case 'Cash':
					if (isNumber(quest.influence) && quest.influence < 100) {
						if (quest.general) {
							general = quest.general;
						} else if (general === 'any') {
							general = Generals.best('influence');
						}
					}
					break;
				default:
					if (isNumber(quest.influence) && quest.influence < 100) {
						if (quest.general) {
							general = quest.general;
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
	if (!Generals.to(LevelUp.runtime.general || general)) {
		return QUEUE_CONTINUE;
	}
	button = $('input[name="quest"][value="' + best + '"]').siblings('.imgButton').children('input[type="image"]');
	log(LOG_WARN, 'Performing - ' + quest.name + ' (energy: ' + quest.energy + ')');
	//log(LOG_WARN,'Quest ' + quest.name + ' general ' + quest.general + ' test ' + !Generals.test(quest.general || 'any') + ' this.data || '+ (quest.general || 'any') + ' queue ' + (LevelUp.runtime.general && quest.general));
	if (!button || !button.length) { // Can't find the quest, so either a bad page load, or bad data - delete the quest and reload, which should force it to update ok...
		this.add(['data','id',best,'button_fail'], 1);
		if (quest.button_fail > 5){
			log(LOG_WARN, 'Can\'t find button for ' + quest.name + ', so deleting and re-visiting page...');
			this.set(['data','id',best]);
			this.set(['runtime','best'], null);
			Page.reload();
			return QUEUE_RELEASE;
		} else {
			switch(quest.area) {
			case 'quest':
				Page.to('quests_quest' + (quest.land + 1),null,true);
				return QUEUE_CONTINUE;
			case 'demiquest':
				Page.to('quests_demiquests',null,true);
				return QUEUE_CONTINUE;
			case 'atlantis':
				Page.to('quests_atlantis',null,true);
				return QUEUE_CONTINUE;
			default:
				log(LOG_LOG, 'Can\'t get to quest area!');
				return QUEUE_FINISH;
			}
		}
	}
	Page.click(button);
	LevelUp.set(['runtime','quest'], null);
	if (quest.type === 3) {// Just completed a boss quest
		if (!Alchemy.get(['ingredients', quest.itemimg], 0, 'number')) {// Add one as we've just gained it...
			Alchemy.set(['ingredients', quest.itemimg], 1);
		}
		// This won't work since we just clicked the quest above.
		if (this.option.what === 'Advancement' && Page.pageNames['quests_quest' + (quest.land + 2)]) {// If we just completed a boss quest, check for a new quest land.
			Page.to('quests_quest' + (quest.land + 2));// Go visit the next land as we've just unlocked it...
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

	this.temp.cost = 1e99;
	this.temp.upkeep = 1e99;
	this.temp.desc = '(n/a)';

	cost = ccount = 0;
	upkeep = ucount = 0;
	desc = '';

	if (id && quest[id]) {
		if ((i = quest[id].general)) {
			if (!gens || !gens[i] || !gens[i].own) {
				cost += 1e99;
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
				k = 1e99;
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
					if (k >= 1e99) {
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
			if (cost < 1e99) {
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
	var reps = 0, rdata;
	if (isObject(quest)) {
		if (!isNumber(quest.level)) {
			reps = 1;
		} else if ((rdata = this.rdata[(quest.name || '').toLowerCase()])) {
			reps = rdata['reps_' + quest.area[0] + ((quest.land || 0) + 1).toString()] || 0;
		}
	}
	return pure ? reps : reps || 16;
};


/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page, Queue, Resources,
	Alchemy, Bank, Battle, Generals, LevelUp, Monster, Player, Town,
	APP, APPID, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, isGreasemonkey,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, shortNumber, WorkerByName, WorkerById, Divisor, length, unique, deleteElement, sum, addCommas, findInArray, findInObject, objectIndex, sortObject, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime, ucfirst, ucwords,
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
	monster:true,
	bank:true,
	energy_reserve:0
};

Quest.runtime = {
	best:null,
	energy:0
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
		help:'Once you have unlocked all areas (Advancement) it will switch to Influence. Once you have 100% Influence it will switch to Experience. Cartigan will try to collect all items needed to summon Cartigan (via Alchemy), then will fall back to Advancement. Vampire Lord will try to collect 24, then fall back to Advancement'
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
		label:'Fortify Monsters First',
		checkbox:true
	},{
		id:'bank',
		label:'Automatically Bank',
		checkbox:true
	}
];

Quest.init = function() {
	for (var i in this.data) {
		if (i.indexOf('\t') !== -1) { // Fix bad page loads...
			delete this.data[i];
		}
	}
	Resources.use('Energy');
};

Quest.parse = function(change) {
	if (change) {
		return false;
	}
	var quest = this.data, last_quest = null, area = null, land = null, i;
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
	for (i in quest) {
		if (quest[i].area === area && (area !== 'quest' || quest[i].land === land)) {
//			debug('Deleting ' + i + '(' + (Quest.land[quest[i].land] || quest[i].area) + ')');
			delete quest[i];
		}
	}
	if ($('div.quests_background,div.quests_background_sub').length !== $('div.quests_background .quest_progress,div.quests_background_sub .quest_sub_progress').length) {
		Page.to(Page.page, '');// Force a page reload as we're pretty sure it's a bad page load!
		return false;
	}
	$('div.quests_background,div.quests_background_sub,div.quests_background_special').each(function(i,el){
		var name, level, influence, reward, units, energy, tmp, type = 0;
		if ($(el).hasClass('quests_background_sub')) { // Subquest
			name = $('.quest_sub_title', el).text().trim();
			reward = $('.qd_2_sub', el).text().replace(/mil/g, '000000').replace(/[^0-9$]/g, '').regex(/^([0-9]+)\$([0-9]+)\$([0-9]+)$/);
			energy = $('.qd_3_sub', el).text().regex(/([0-9]+)/);
			level = $('.quest_sub_progress', el).text().regex(/LEVEL ([0-9]+)/i);
			influence = $('.quest_sub_progress', el).text().regex(/INFLUENCE: ([0-9]+)%/i);
//			last_quest = null;
			type = 2;
		} else {
			name = $('.qd_1 b', el).text().trim();
			reward = $('.qd_2', el).text().replace(/[^0-9$]/g, '').regex(/^([0-9]+)\$([0-9]+)\$([0-9]+)$/);
			energy = $('.quest_req b', el).text().regex(/([0-9]+)/);
			if ($(el).hasClass('quests_background')) { // Main quest
				last_quest = name;
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
		quest[name] = {};
		quest[name].area = area;
		quest[name].type = type;
		quest[name].id = parseInt($('input[name="quest"]', el).val(), 10);
		if (last_quest) {
			quest[name].main = last_quest;
		}
		if (isNumber(land)) {
			quest[name].land = land;
		}
		if (isNumber(influence)) {
			quest[name].level = (level || 0);
			quest[name].influence = influence;
		}
		quest[name].exp = reward[0];
		quest[name].reward = (reward[1] + reward[2]) / 2;
		quest[name].energy = energy;
		if (type !== 2) { // That's everything for subquests
			if (type === 3) { // Special / boss quests create unique items
				quest[name].unique = true;
			}
			tmp = $('.qd_1 img', el).last();
			if (tmp.length && tmp.attr('title')) {
				quest[name].item	= tmp.attr('title').trim();
				quest[name].itemimg	= tmp.attr('src').filepart();
			}
			units = {};
			$('.quest_req >div >div >div', el).each(function(i,el){
				var title = $('img', el).attr('title');
				units[title] = $(el).text().regex(/([0-9]+)/);
			});
			if (length(units)) {
				quest[name].units = units;
			}
			tmp = $('.quest_act_gen img', el);
			if (tmp.length && tmp.attr('title')) {
				quest[name].general = tmp.attr('title');
			}
		}
	});
	this.data = sortObject(quest, function(a,b){return a > b;});// So they always appear in the same order
	return false;
};

Quest.update = function(type,worker) {
	if (worker === Town && type !== 'data') {
		return; // Missing quest requirements
	}
	// First let's update the Quest dropdown list(s)...
	var i, unit, own, need, noCanDo = false, best = null, best_cartigan = null, best_vampire = null, best_advancement = null, best_influence = null, best_experience = null, best_land = 0, has_cartigan = false, has_vampire = false, list = [], items = {}, quests = this.data, maxenergy = Player.get('maxenergy',999);
	this._watch(Player);
	this._watch(Queue);
	if (!type || type === 'data') {
		for (i in quests) {
			if (quests[i].item && quests[i].type !== 3) {
				list.push(quests[i].item);
			}
			for (unit in quests[i].units) {
				items[unit] = Math.max(items[unit] || 0, quests[i].units[unit]);
			}
		}
		Config.set('quest_reward', ['Nothing', 'Cartigan', 'Vampire Lord', 'Advancement', 'Influence', 'Experience', 'Cash'].concat(unique(list).sort()));
		for (unit in items) {
			Resources.set(['_'+unit, 'quest'], items[unit]);
		}
	}
	// Now choose the next quest...
	if (this.option.unique) {
		for (i in quests) {
			if (quests[i].energy > maxenergy) {// Skip quests we can't afford
				continue;
			}
			if (quests[i].type === 3 && !Alchemy.get(['ingredients', quests[i].itemimg], 0) && (!best || quests[i].energy < quests[best].energy)) {
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
//		best = (this.runtime.best && quests[this.runtime.best] && (quests[this.runtime.best].influence < 100) ? this.runtime.best : null);
		for (i in quests) {
			if (quests[i].energy > maxenergy) {// Skip quests we can't afford
				continue;
			}
			if (quests[i].units) {
				own = 0;
				need = 0;
				noCanDo = false;
				for (unit in quests[i].units) {
					own = Town.get([unit, 'own'], 0);
					need = quests[i].units[unit];
					if (need > own) {	// Need more than we own, skip this quest.
						noCanDo = true;	// set flag
						continue;	// no need to check more prerequisites.
					}
				}
				if (noCanDo) {
					continue;	// Skip to the next quest in the list
				}
			}
			switch(this.option.what) { // Automatically fallback on type - but without changing option
				case 'Vampire Lord': // Main quests or last subquest (can't check) in Undead Realm
					if (!has_vampire && isNumber(quests[i].land)
					&& quests[i].land === 5
					&& quests[i].type === 1
					&& (!best_vampire || quests[i].energy < quests[best_vampire].energy)
					&& (this.option.ignorecomplete === false || (isNumber(quests[i].influence) && quests[i].influence < 100))) {
						best_vampire = i;
					}// Deliberate fallthrough
				case 'Cartigan': // Random Encounters in various Underworld Quests
					if (!has_cartigan && isNumber(quests[i].land)
					&& quests[i].land === 6
					&& (((i === 'The Long Path' || quests[i].main === 'The Long Path' || i === 'Burning Gates' || quests[i].main === 'Burning Gates') && Alchemy.get(['ingredients', 'eq_underworld_sword.jpg'], 0) < 3)
						|| ((i === 'Fiery Awakening' || quests[i].main === 'Fiery Awakening') && Alchemy.get(['ingredients', 'eq_underworld_amulet.jpg'], 0) < 3)
						|| ((i === 'Fire and Brimstone' || quests[i].main === 'Fire and Brimstone' || i === 'Deathrune Castle' || quests[i].main === 'Deathrune Castle') && Alchemy.get(['ingredients', 'eq_underworld_gauntlet.jpg'], 0) < 3))
					&& (!best_cartigan || quests[i].energy < quests[best_cartigan].energy)
					&& (this.option.ignorecomplete === false || (isNumber(quests[i].influence) && quests[i].influence < 100))) {
						best_cartigan = i;
					}// Deliberate fallthrough
				case 'Advancement': // Complete all required main / boss quests in an area to unlock the next one (type === 2 means subquest)
					if (isNumber(quests[i].land) && quests[i].land > best_land) { // No need to revisit old lands - leave them to Influence
						best_land = quests[i].land;
						best_advancement = null;
					}
					if (quests[i].type !== 2
					&& isNumber(quests[i].land)
					//&& quests[i].level === 1  // Need to check if necessary to do boss to unlock next land without requiring orb
					&& quests[i].land >= best_land
					&& ((isNumber(quests[i].influence) && Generals.test(quests[i].general) && quests[i].level <= 1 && quests[i].influence < 100) || (quests[i].type === 3 && !Alchemy.get(['ingredients', quests[i].itemimg], 0)))
					&& (!best_advancement || (quests[i].land === best_land && quests[i].energy < quests[best_advancement].energy))) {
						best_land = Math.max(best_land, quests[i].land);
						best_advancement = i;
					}// Deliberate fallthrough
				case 'Influence': // Find the cheapest energy cost quest with influence under 100%
					if (isNumber(quests[i].influence) 
							&& (!quests[i].general || Generals.test(quests[i].general))
							&& quests[i].influence < 100
							&& (!best_influence || quests[i].energy < quests[best_influence].energy)) {
						best_influence = i;
					}// Deliberate fallthrough
				case 'Experience': // Find the best exp per energy quest
					if (!best_experience || (quests[i].energy / quests[i].exp) < (quests[best_experience].energy / quests[best_experience].exp)) {
						best_experience = i;
					}
					break;
				case 'Cash': // Find the best (average) cash per energy quest
					if (!best || (quests[i].energy / quests[i].reward) < (quests[best].energy / quests[best].reward)) {
						best = i;
					}
					break;
				default: // For everything else, there's (cheap energy) items...
					if (quests[i].item === this.option.what && (!best || quests[i].energy < quests[best].energy)) {
						best = i;
					}
					break;
			}
		}
		switch(this.option.what) { // Automatically fallback on type - but without changing option
			case 'Vampire Lord':best = best_vampire || best_advancement || best_influence || best_experience;break;
			case 'Cartigan':	best = best_cartigan || best_advancement || best_influence || best_experience;break;
			case 'Advancement':	best = best_advancement || best_influence || best_experience;break;
			case 'Influence':	best = best_influence || best_experience;break;
			case 'Experience':	best = best_experience;break;
			default:break;
		}
	}
	if (best !== this.runtime.best) {
		this.runtime.best = best;
		if (best) {
			this.runtime.energy = quests[best].energy;
			debug('Wanting to perform - ' + best + ' in ' + (isNumber(quests[best].land) ? this.land[quests[best].land] : this.area[quests[best].area]) + ' (energy: ' + quests[best].energy + ', experience: ' + quests[best].exp + ', gold: $' + shortNumber(quests[best].reward) + ')');
		}
	}
	if (best) {
		Dashboard.status(this, (isNumber(quests[best].land) ? this.land[quests[best].land] : this.area[quests[best].area]) + ': ' + best + ' (' + makeImage('energy') + quests[best].energy + ' = ' + makeImage('exp') + quests[best].exp + ' + ' + makeImage('gold') + '$' + shortNumber(quests[best].reward) + (quests[best].item ? Town.get([quests[best].item,'img'], null) ? ' + <img style="width:16px;height:16px;margin-bottom:-4px;" src="' + imagepath + Town.get([quests[best].item, 'img']) + '" title="' + quests[best].item + '">' : ' + ' + quests[best].item : '') + (isNumber(quests[best].influence) && quests[best].influence < 100 ? (' @ ' + makeImage('percent','Influence') + quests[best].influence + '%') : '') + ')');
	} else {
		Dashboard.status(this);
	}
};

Quest.work = function(state) {
	var mid, general = 'any', best = Queue.runtime.quest || this.runtime.best;
	var useable_energy = Queue.burn.forceenergy ? Queue.burn.energy : Queue.burn.energy - this.option.energy_reserve;
	if (!best || (!Queue.runtime.quest && this.runtime.energy > useable_energy)) {
		if (state && this.option.bank) {
			return Bank.work(true);
		}
		return QUEUE_FINISH;
	}
	if (this.option.monster && !Queue.runtime.quest
			&& (Monster.get('runtime.defend')
				|| Monster.get('runtime.check')
				|| (Monster.get('runtime.secondary')
					&& !Queue.burn.forceenergy))) {
		return QUEUE_FINISH;
	}
	if (!state) {
		return QUEUE_CONTINUE;
	}
	if (this.option.general) {
		if (this.data[best].general && isNumber(this.data[best].influence) && this.data[best].influence < 100) {
			general = this.data[best].general;
		} else {
			switch(this.option.what) {
				case 'Vampire Lord':
				case 'Cartigan':
					if (this.data[best].general) {
						general = this.data[best].general;
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
					if (general === 'any' && isNumber(this.data[best].influence) && this.data[best].influence < 100) {
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
	switch(this.data[best].area) {
		case 'quest':
			if (!Page.to('quests_quest' + (this.data[best].land + 1))) {
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
	debug('Performing - ' + best + ' (energy: ' + this.data[best].energy + ')');
	if (!Page.click($('input[name="quest"][value="' + this.data[best].id + '"]').siblings('.imgButton').children('input[type="image"]'))) { // Can't find the quest, so either a bad page load, or bad data - delete the quest and reload, which should force it to update ok...
		debug('Can\'t find button for ' + best + ', so deleting and re-visiting page...');
		delete this.data[best];
		Page.reload();
	}
	Queue.runtime.quest = false;
	if (this.data[best].type === 3) {// Just completed a boss quest
		if (!Alchemy.get(['ingredients', this.data[best].itemimg], 0)) {// Add one as we've just gained it...
			Alchemy.set(['ingredients', this.data[best].itemimg], 1);
		}
		if (this.option.what === 'Advancement' && Page.pageNames['quests_quest' + (this.data[best].land + 2)]) {// If we just completed a boss quest, check for a new quest land.
			Page.to('quests_quest' + (this.data[best].land + 2));// Go visit the next land as we've just unlocked it...
		}
	}
	return QUEUE_RELEASE;
};

Quest.order = [];
Quest.dashboard = function(sort, rev) {
	var i, o, list = [], output = [];
	if (typeof sort === 'undefined') {
		this.order = [];
		for (i in this.data) {
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
				return Quest.data[q].general || 'zzz';
			case 1: // name
				return q;
			case 2: // area
				return isNumber(Quest.data[q].land) && typeof Quest.land[Quest.data[q].land] !== 'undefined' ? Quest.land[Quest.data[q].land] : Quest.area[Quest.data[q].area];
			case 3: // level
				return (isNumber(Quest.data[q].level) ? Quest.data[q].level : -1) * 100 + (Quest.data[q].influence || 0);
			case 4: // energy
				return Quest.data[q].energy;
			case 5: // exp
				return Quest.data[q].exp / Quest.data[q].energy;
			case 6: // reward
				return Quest.data[q].reward / Quest.data[q].energy;
			case 7: // item
				return Quest.data[q].item || 'zzz';
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
	th(output, '@&nbsp;Exp');
	th(output, '@&nbsp;Reward');
	th(output, 'Item');
	list.push('<table cellspacing="0" style="width:100%"><thead><tr>' + output.join('') + '</tr></thead><tbody>');
	for (o=0; o<this.order.length; o++) {
		i = this.order[o];
		output = [];
		td(output, Generals.get([this.data[i].general]) ? '<img style="width:25px;height:25px;" src="' + imagepath + Generals.get([this.data[i].general, 'img']) + '" alt="' + this.data[i].general + '" title="' + this.data[i].general + '">' : '');
		th(output, i);
		td(output, isNumber(this.data[i].land) ? this.land[this.data[i].land].replace(' ','&nbsp;') : this.area[this.data[i].area].replace(' ','&nbsp;'));
		td(output, isNumber(this.data[i].level) ? this.data[i].level + '&nbsp;(' + this.data[i].influence + '%)' : '');
		td(output, this.data[i].energy);
		td(output, (this.data[i].exp / this.data[i].energy).round(2), 'title="' + this.data[i].exp + ' total, ' + (this.data[i].exp / this.data[i].energy * 12).round(2) + ' per hour"');
		td(output, '$' + addCommas((this.data[i].reward / this.data[i].energy).round()), 'title="$' + addCommas(this.data[i].reward) + ' total, $' + addCommas((this.data[i].reward / this.data[i].energy * 12).round()) + ' per hour"');
		td(output, this.data[i].itemimg ? '<img style="width:25px;height:25px;" src="' + imagepath + this.data[i].itemimg + '" alt="' + this.data[i].item + '" title="' + this.data[i].item + '">' : '');
		tr(list, output.join(''), 'style="height:25px;"');
	}
	list.push('</tbody></table>');
	$('#golem-dashboard-Quest').html(list.join(''));
	$('#golem-dashboard-Quest tbody tr td:nth-child(2)').css('text-align', 'left');
	if (typeof sort !== 'undefined') {
		$('#golem-dashboard-Quest thead th:eq('+sort+')').attr('name',(rev ? 'reverse' : 'sort')).append('&nbsp;' + (rev ? '&uarr;' : '&darr;'));
	}
};


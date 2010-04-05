/********** Worker.Quest **********
* Completes quests with a choice of general
*/
// Should also look for quests_quest but that should never be used unless there's a new area
var Quest = new Worker('Quest', 'quests_quest1 quests_quest2 quests_quest3 quests_quest4 quests_quest5 quests_quest6 quests_quest7 quests_demiquests quests_atlantis', {data:true, option:true});
Quest.option = {
	general:true,
	what:'Influence',
	unique:true,
	monster:true,
	bank:true
};

Quest.runtime = {
	best:null,
	energy:0
};

Quest.land = ['Land of Fire', 'Land of Earth', 'Land of Mist', 'Land of Water', 'Demon Realm', 'Undead Realm', 'Underworld'];
Quest.area = {quest:'Quests', demiquest:'Demi Quests', atlantis:'Atlantis'};
Quest.current = null;
Quest.display = [
	{
		id:'general',
		label:'Use Best General',
		checkbox:true
	},{
		id:'what',
		label:'Quest for',
		select:'quest_reward'
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
};

Quest.parse = function(change) {
	var quest = this.data, area, land = null;
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
	$('div.quests_background,div.quests_background_sub,div.quests_background_special').each(function(i,el){
		var name, level, influence, reward, units, energy, tmp, type = 0;
		if ($(el).hasClass('quests_background_sub')) { // Subquest
			name = $('.quest_sub_title', el).text().trim();
			reward = $('.qd_2_sub', el).text().replace(/[^0-9$]/g, '').regex(/^([0-9]+)\$([0-9]+)\$([0-9]+)$/);
			energy = $('.qd_3_sub', el).text().regex(/([0-9]+)/);
			level = $('.quest_sub_progress', el).text().regex(/LEVEL ([0-9]+)/i);
			influence = $('.quest_sub_progress', el).text().regex(/INFLUENCE: ([0-9]+)%/i);
			type = 2;
		} else {
			name = $('.qd_1 b', el).text().trim();
			reward = $('.qd_2', el).text().replace(/[^0-9$]/g, '').regex(/^([0-9]+)\$([0-9]+)\$([0-9]+)$/);
			energy = $('.quest_req b', el).text().regex(/([0-9]+)/);
			if ($(el).hasClass('quests_background')) { // Main quest
				level = $('.quest_progress', el).text().regex(/LEVEL ([0-9]+)/i);
				influence = $('.quest_progress', el).text().regex(/INFLUENCE: ([0-9]+)%/i);
				type = 1;
			} else { // Special Quest
				type = 3;
			}
		}
		if (!name || name.indexOf('\t') !== -1) { // Hopefully stop it finding broken qpage load quests
			return;
		}
		quest[name] = {};
		quest[name].area = area;
		if (typeof land === 'number') {
			quest[name].land = land;
		}
		if (typeof influence === 'number') {
			quest[name].level = (level || 0);
			quest[name].influence = influence;
		}
		quest[name].exp = reward.shift();
		quest[name].reward = (reward[0] + reward[1]) / 2;
		quest[name].energy = energy;
		if (type === 2) { // Main quest has some extra stuff
			return;
		}
		if (type === 3) { // Special quests create unique items
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
	});
	return false;
};

Quest.update = function(type) {
	// First let's update the Quest dropdown list(s)...
	var i, j, best = null, list = [];
	for (i in this.data) {
		if (this.data[i].item && !this.data[i].unique) {
			list.push(this.data[i].item);
		}
	}
	Config.set('quest_reward', ['Nothing', 'Influence', 'Experience', 'Cash'].concat(unique(list).sort()));
	// Now choose the next quest...
	if (this.option.unique && Alchemy._changed > this.lastunique) {
		for (i in this.data) {
			if (this.data[i].unique && !Alchemy.get(['ingredients', this.data[i].itemimg]) && (!best || this.data[i].energy < this.data[best].energy)) {
				best = i;
			}
		}
		this.lastunique = Date.now();
	}
	if (!best && this.option.what !== 'Nothing') {
		for (i in this.data) {
			if ((this.option.what === 'Influence' && typeof this.data[i].influence !== 'undefined' && this.data[i].influence < 100 && (!best || this.data[i].energy < this.data[best].energy))
			|| (this.option.what === 'Experience' && (!best || (this.data[i].energy / this.data[i].exp) < (this.data[best].energy / this.data[best].exp)))
			|| (this.option.what === 'Cash' && (!best || (this.data[i].energy / this.data[i].reward) < (this.data[best].energy / this.data[best].reward)))
			|| (this.option.what !== 'Influence' && this.option.what !== 'Experience' && this.option.what !== 'Cash' && this.data[i].item === this.option.what && (!best || this.data[i].energy < this.data[best].energy))) {
				best = i;
			}
		}
	}
	if (best !== this.runtime.best) {
		this.runtime.best = best;
		if (best) {
			this.runtime.energy = this.data[best].energy;
			debug('Quest: Wanting to perform - ' + best + ' (energy: ' + this.runtime.energy + ')');
			Dashboard.status(this, best + ' (energy: ' + this.runtime.energy + ')');
		} else {
			Dashboard.status(this);
		}
	}
//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
	if (this.option.monster && Monster.data) {
		for (i in Monster.data) {
			for (j in Monster.data[i]) {
				if (Monster.data[i][j].state === 'engage' && typeof Monster.data[i][j].defense === 'number' && Monster.data[i][j].defense <= Monster.option.fortify) {
					return false;
				}
			}
		}
	}
};

Quest.work = function(state) {
	if (!this.runtime.best || this.runtime.energy > Queue.burn.energy) {
		if (state && this.option.bank) {
			return Bank.work(true);
		}
		return false;
	}
	if (!state) {
		return true;
	}
	var i, j, general = null, best = this.runtime.best;
	if (this.option.general) {
		if (this.data[best].general) {
			if (!Generals.to(this.data[best].general)) 
			{
				return true;
			}
		} else {
			switch(this.option.what) {
				case 'Influence':
				case 'Experience':
					general = Generals.best('under level 4');
					if (general === 'any' && this.data[best].influence < 100) {
						general = Generals.best('influence');
					}
					break;
				case 'Cash':
					general = Generals.best('cash');
					break;
				default:
					general = Generals.best('item');
					break;
			}
			if (!Generals.to(general)) {
				return true;
			}
		}
	}
	switch(this.data[best].area) {
		case 'quest':
			if (!Page.to('quests_quest' + (this.data[best].land + 1))) {
				return true;
			}
			break;
		case 'demiquest':
			if (!Page.to('quests_demiquests')) {
				return true;
			}
			break;
		case 'atlantis':
			if (!Page.to('quests_atlantis')) {
				return true;
			}
			break;
		default:
			debug('Quest: Can\'t get to quest area!');
			return false;
	}
	debug('Quest: Performing - ' + best + ' (energy: ' + this.data[best].energy + ')');
	if (!Page.click('div.action[title^="' + best + '"] input[type="image"]')) {
		Page.reload(); // Shouldn't happen
	}
	if (this.option.unique && this.data[best].unique) {
		Page.to('keep_alchemy');
//		Page.to('quests_quest' + (this.data[best].land + 2)); Really ought to check for new quests - but also need to not repeat needlessly
	}
	return true;
};

Quest.order = [];
Quest.dashboard = function(sort, rev) {
	var i, o, list = [], output = [];
	if (typeof sort === 'undefined') {
		this.order = [];
		for (i in this.data) {
			this.order.push(i);
		}
		sort = 1; // Default = sort by name
	}
	function getValue(q){
		switch(sort) {
			case 0:	// general
				return Quest.data[q].general || 'zzz';
			case 1: // name
				return q;
			case 2: // area
				return typeof Quest.data[q].land === 'number' && typeof Quest.land[Quest.data[q].land] !== 'undefined' ? Quest.land[Quest.data[q].land] : Quest.area[Quest.data[q].area];
			case 3: // level
				return (typeof Quest.data[q].level !== 'undefined' ? Quest.data[q].level : -1) * 100 + (Quest.data[q].influence || 0);
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
		if (typeof aa === 'string' || typeof bb === 'string') {
			return (rev ? (bb || '') > (aa || '') : (bb || '') < (aa || ''));
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
		td(output, typeof this.data[i].land === 'number' ? this.land[this.data[i].land].replace(' ','&nbsp;') : this.area[this.data[i].area].replace(' ','&nbsp;'));
		td(output, typeof this.data[i].level !== 'undefined' ? this.data[i].level + '&nbsp;(' + this.data[i].influence + '%)' : '');
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


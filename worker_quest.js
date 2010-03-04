/********** Worker.Quest **********
* Completes quests with a choice of general
*/
// Should also look for quests_quest but that should never be used unless there's a new area
var Quest = new Worker('Quest', 'quests_quest1 quests_quest2 quests_quest3 quests_quest4 quests_quest5 quests_quest6 quests_quest7 quests_demiquests quests_atlantis');
Quest.option = {
	general: 'Under Level 4',
	what: 'Influence',
	unique: true,
	monster:true
};
Quest.land = ['Land of Fire', 'Land of Earth', 'Land of Mist', 'Land of Water', 'Demon Realm', 'Undead Realm', 'Underworld'];
Quest.area = {quest:'Quests', demiquest:'Demi Quests', atlantis:'Atlantis'};
Quest.current = null;
Quest.display = [
	{
		id:'general',
		label:'General',
		select:['any', 'Under Level 4', 'Influence']
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
		id:'current',
		label:'Current',
		info:'None'
	}
];
Quest.parse = function(change) {
	var quest = Quest.data, area, land = null;
	if (Page.page === 'quests_demiquests') {
		area = 'demiquest';
	} else if (Page.page === 'quests_atlantis') {
		area = 'atlantis';
	} else {
		area = 'quest';
		land = Page.page.regex(/quests_quest([0-9]+)/i) - 1;
	}
	$('div.quests_background,div.quests_background_sub,div.quests_background_special').each(function(i,el){
		var name, level, influence, reward, units, energy;
		if ($(el).hasClass('quests_background')) { // Main quest
			name = $('div.qd_1 b', el).text().trim();
			level = $('div.quest_progress', el).text().regex(/LEVEL ([0-9]+)/i);
			influence = $('div.quest_progress', el).text().regex(/INFLUENCE: ([0-9]+)%/i);
			reward = $('div.qd_2', el).text().replace(/[^0-9$]/g, '').regex(/^([0-9]+)\$([0-9]+)\$([0-9]+)$/);
			energy = $('div.quest_req b', el).text().regex(/([0-9]+)/);
		} else if ($(el).hasClass('quests_background_sub')) { // Subquest
			name = $('div.quest_sub_title', el).text().trim();
			level = $('div.quest_sub_progress', el).text().regex(/LEVEL ([0-9]+)/i);
			influence = $('div.quest_sub_progress', el).text().regex(/INFLUENCE: ([0-9]+)%/i);
			reward = $('div.qd_2_sub', el).text().replace(/[^0-9$]/g, '').regex(/^([0-9]+)\$([0-9]+)\$([0-9]+)$/);
			energy = $('div.qd_3_sub', el).text().regex(/([0-9]+)/);
		} else if ($(el).hasClass('quests_background_special')) { // Special Quest
			name = $('div.qd_1 b', el).text().trim();
			reward = $('div.qd_2', el).text().replace(/[^0-9$]/g, '').regex(/^([0-9]+)\$([0-9]+)\$([0-9]+)$/);
			energy = $('div.quest_req b', el).text().regex(/([0-9]+)/);
		}
		if (!name) {
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
		if ($(el).hasClass('quests_background')) { // Main quest has some extra stuff
			if ($('div.qd_1 img', el).attr('title')) {
				quest[name].item = $('div.qd_1 img', el).attr('title').trim();
				quest[name].itemimg = $('div.qd_1 img', el).attr('src').filepart();
			}
			if ($('div.quest_act_gen img', el).attr('title')) {
				quest[name].general = $('div.quest_act_gen img', el).attr('title');
			}
			units = {};
			$('div.quest_req > div > div > div', el).each(function(i,el){
				var title = $('img', el).attr('title');
				units[title] = $(el).text().regex(/([0-9]+)/);
			});
			if (units.length) {
				quest[name].units = units;
			}
//				GM_debug('Quest: '+name+' = '+quest[name].toSource());
		} else if ($(el).hasClass('quests_background_special') && $('input', el).length) { // Special quests have some extra stuff
			quest[name].unique = true;
			if ($('div.qd_1 img', el).last().length) {
				quest[name].item = $('div.qd_1 img', el).last().attr('title').trim(); // We only want the last one
				quest[name].itemimg = $('div.qd_1 img', el).last().attr('src').filepart();
			}
			units = {};
			$('div.quest_req > div > div > div', el).each(function(i,el){
				var title = $('img', el).attr('title');
				units[title] = $(el).text().regex(/([0-9]+)/);
			});
			if (units.length) {
				quest[name].units = units;
			}
		}
	});
	if (Settings.Save(Quest)) {
		Quest.select();
		Quest.dashboard();
	}
	return false;
};
Quest.select = function() {
	var i, list = [];
	for (i in Quest.data) {
		if (Quest.data[i].item && !Quest.data[i].unique) {
			list.push(Quest.data[i].item);
		}
	}
	list = ['Nothing', 'Influence', 'Experience', 'Cash'].concat(unique(list).sort());
	$('select.golem_quest_reward').each(function(a,el){
		$(el).empty();
		var i, tmp = $(el).attr('id').slice(PREFIX.length).regex(/([^_]*)_(.*)/i), value = tmp ? WorkerByName(tmp[0]).option[tmp[1]] : null;
		for (i=0; i<list.length; i++) {
			$(el).append('<option value="'+list[i]+'"'+(list[i]===value ? ' selected' : '')+'>'+list[i]+'</value>');
		}
	});
};
Quest.work = function(state) {
	var i, j, list, best = null;
	if (Quest.option.what === 'Nothing') {
		return false;
	}
	if (Quest.option.unique) {
		for (i in Quest.data) {
			if (Quest.data[i].unique && !Alchemy.data.ingredients[Quest.data[i].itemimg] && (!best || Quest.data[i].energy < Quest.data[best].energy)) {
				best = i;
			}
		}
	}
	if (!best) {
		for (i in Quest.data) {
			if ((Quest.option.what === 'Influence' && typeof Quest.data[i].influence !== 'undefined' && Quest.data[i].influence < 100 && (!best || Quest.data[i].energy < Quest.data[best].energy))
			|| (Quest.option.what === 'Experience' && (!best || (Quest.data[i].energy / Quest.data[i].exp) < (Quest.data[best].energy / Quest.data[best].exp)))
			|| (Quest.option.what === 'Cash' && (!best && (Quest.data[i].energy / Quest.data[i].reward) < (Quest.data[best].energy / Quest.data[best].reward)))
			|| (Quest.option.what !== 'Influence' && Quest.option.what !== 'Experience' && Quest.option.what !== 'Cash' && Quest.data[i].item === Quest.option.what && (!best || Quest.data[i].energy < Quest.data[best].energy))) {
				best = i;
			}
		}
	}
	if (best !== Quest.current) {
		Quest.current = best;
		if (best) {
			GM_debug('Quest: Wanting to perform - '+best+' (energy: '+Quest.data[best].energy+')');
			$('#'+PREFIX+'Quest_current').html(''+best+' (energy: '+Quest.data[best].energy+')');
		}
	}
	if (Quest.option.monster) {
		for (i in Monster.data) {
			for (j in Monster.data[i]) {
				if (Monster.data[i][j].state === 'engage' && typeof Monster.data[i][j].defense === 'number' && Monster.data[i][j].defense <= Monster.option.fortify) {
					return false;
				}
			}
		}
	}
	if (!best || Quest.data[best].energy > Queue.burn.energy) {
		return false;
	}
	if (!state) {
		return true;
	}
	if (Quest.data[best].general) {
		if (!Generals.to(Quest.data[best].general)) 
		{
			return true;
		}
	} else if (!Generals.to(Generals.best(Quest.option.general))) {
		return true;
	}
	switch(Quest.data[best].area) {
		case 'quest':
			if (!Page.to('quests_quest' + (Quest.data[best].land + 1))) {
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
			GM_debug('Quest: Can\'t get to quest area!');
			return false;
	}
	GM_debug('Quest: Performing - '+best+' (energy: '+Quest.data[best].energy+')');
	if (!Page.click('div.action[title^="'+best+'"] input[type="image"]')) {
		Page.reload();
	}
	if (Quest.option.unique && Quest.data[best].unique) {
		if (!Page.to('keep_alchemy')) {
			return true;
		}
	}
	return true;
};

Quest.order = [];
Quest.dashboard = function(sort, rev) {
	var i, o, list = [], output;
	if (typeof sort === 'undefined') {
		Quest.order = [];
		for (i in Quest.data) {
			Quest.order.push(i);
		}
		sort = 1; // Default = sort by name
	}
	Quest.order.sort(function(a,b) {
		var aa, bb;
		if (sort == 0 || sort == 7) { // general and item
			aa = Quest.data[a].item || 'zzz';
			bb = Quest.data[b].item || 'zzz';
		} else if (sort == 1) { // name
			aa = a;
			bb = b;
		} else if (sort == 2) { // area
			aa = typeof Quest.data[a].land === 'number' && Quest.data[a].land < Quest.land.length ? Quest.land[Quest.data[a].land] : Quest.area[Quest.data[a].area];
			bb = typeof Quest.data[b].land === 'number' && Quest.data[b].land < Quest.land.length ? Quest.land[Quest.data[b].land] : Quest.area[Quest.data[b].area];
		} else if (sort == 3) { // level
			aa = (typeof Quest.data[a].level !== 'undefined' ? Quest.data[a].level : -1) * 100 + (Quest.data[a].influence || 0);
			bb = (typeof Quest.data[b].level !== 'undefined' ? Quest.data[b].level : -1) * 100 + (Quest.data[b].influence || 0);
		} else if (sort == 4) { // energy
			aa = Quest.data[a].energy;
			bb = Quest.data[b].energy;
		} else if (sort == 5) { // exp
			aa = Quest.data[a].exp / Quest.data[a].energy;
			bb = Quest.data[b].exp / Quest.data[b].energy;
		} else if (sort == 6) { // reward
			aa = Quest.data[a].reward / Quest.data[a].energy;
			bb = Quest.data[b].reward / Quest.data[b].energy;
		}
		if (typeof aa === 'string' || typeof bb === 'string') {
			return (rev ? (bb || '') > (aa || '') : (bb || '') < (aa || ''));
		}
		return (rev ? (aa || 0) - (bb || 0) : (bb || 0) - (aa || 0));
	});
	list.push('<table cellspacing="0" style="width:100%"><thead><th>General</th><th>Name</th><th>Area</th><th>Level</th><th>Energy</th><th>@&nbsp;Exp</th><th>@&nbsp;Reward</th><th>Item</th></tr></thead><tbody>');
	for (o=0; o<Quest.order.length; o++) {
		i = Quest.order[o];
		output = [];
		output.push(Generals.data[Quest.data[i].general] ? '<img style="width:25px;height:25px;" src="' + Player.data.imagepath + Generals.data[Quest.data[i].general].img+'" alt="'+Quest.data[i].general+'" title="'+Quest.data[i].general+'">' : '');
		output.push(i);
		output.push(typeof Quest.data[i].land === 'number' ? Quest.land[Quest.data[i].land].replace(' ','&nbsp;') : Quest.area[Quest.data[i].area].replace(' ','&nbsp;'));
		output.push(typeof Quest.data[i].level !== 'undefined' ? Quest.data[i].level +'&nbsp;(' + Quest.data[i].influence +'%)' : '');
		output.push(Quest.data[i].energy);
		output.push('<span title="Total = ' + Quest.data[i].exp + '">' + (Quest.data[i].exp / Quest.data[i].energy).round(2) + '</span>');
		output.push('<span title="Total = $' + addCommas(Quest.data[i].reward) + '">$' + addCommas((Quest.data[i].reward / Quest.data[i].energy).round()) + '</span>');
		output.push(Quest.data[i].itemimg ? '<img style="width:25px;height:25px;" src="' + Player.data.imagepath + Quest.data[i].itemimg+'" alt="'+Quest.data[i].item+'" title="'+Quest.data[i].item+'">' : '');
		list.push('<tr style="height:25px;"><td>' + output.join('</td><td>') + '</td></tr>');
	}
	list.push('</tbody></table>');
	$('#golem-dashboard-Quest').html(list.join(''));
	$('#golem-dashboard-Quest thead th').css('cursor', 'pointer').click(function(event){
		Quest.dashboard($(this).prevAll().length, $(this).attr('name')==='sort');
	});
	$('#golem-dashboard-Quest tbody tr td:nth-child(2)').css('text-align', 'left');
	if (typeof sort !== 'undefined') {
		$('#golem-dashboard-Quest thead th:eq('+sort+')').attr('name',(rev ? 'reverse' : 'sort')).append('&nbsp;' + (rev ? '&uarr;' : '&darr;'));
	}
}


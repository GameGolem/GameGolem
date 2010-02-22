/********** Worker.Quest **********
* Completes quests with a choice of general
*/
var Quest = new Worker('Quest', 'quests_quest quests_quest1 quests_quest2 quests_quest3 quests_quest4 quests_quest5 quests_quest6 quests_demiquests quests_atlantis');
Quest.option = {
	general: 'Under Level 4',
	what: 'Influence'
};
Quest.land = ['fire', 'earth', 'mist', 'water', 'demon', 'undead'];
Quest.current = null;
Quest.current_id = null;
Quest.what_id = null;
Quest.parse = function(change) {
	var quest = Quest.data, area, land = null;
	switch(Page.page) {
		case 'quests_quest':
		case 'quests_quest1':
		case 'quests_quest2':
		case 'quests_quest3':
		case 'quests_quest4':
		case 'quests_quest5':
		case 'quests_quest6':
			area = 'quest';
			land = $('div.title_tab_selected img[id^="app'+APP+'_land_image"]').attr('id').regex(/_image([0-9]+)$/,'');
			break;
		case 'quests_demiquests':
			area = 'demiquest';
			break;
		case 'quests_atlantis':
			area = 'atlantis';
			break;
		default: // Unknown quest area :-(
			return false;
	}
	if (!change) { // Parse first
		$('div.quests_background,div.quests_background_sub').each(function(i,el){
			var name, influence, reward, units, energy;
			if ($(el).hasClass('quests_background')) { // Main quest
				name = $('div.qd_1 b', el).text().trim();
				influence = $('div.quest_progress', el).text().regex(/LEVEL ([0-9]+) INFLUENCE: ([0-9]+)%/i);
				reward = $('div.qd_2', el).text().replace(/[^0-9$]/g, '').regex(/^([0-9]+)\$([0-9]+)\$([0-9]+)$/);
				energy = $('div.quest_req b', el).text().regex(/([0-9]+)/);
			} else { // Subquest
				name = $('div.quest_sub_title', el).text().trim();
				influence = $('div.quest_sub_progress', el).text().regex(/LEVEL ([0-9]+) INFLUENCE: ([0-9]+)%/i);
				reward = $('div.qd_2_sub', el).text().replace(/[^0-9$]/g, '').regex(/^([0-9]+)\$([0-9]+)\$([0-9]+)$/);
				energy = $('div.qd_3_sub', el).text().regex(/([0-9]+)/);
			}
			if (!name) {
				return;
			}
			quest[name] = {};
			quest[name].area = area;
			if (land) {
				quest[name].land = land;
			}
			if (influence) {
				quest[name].level = influence[0];
				quest[name].influence = influence[1];
			} else {
				quest[name].level = quest[name].influence = 0;
			}
			quest[name].exp = reward.shift();
			quest[name].reward = (reward[0] + reward[1]) / 2;
			quest[name].energy = energy;
			if ($(el).hasClass('quests_background')) { // Main quest has some extra stuff
				if ($('div.qd_1 img', el).attr('title')) {
					quest[name].item = $('div.qd_1 img', el).attr('title').trim();
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
			}
		});
		Quest.select();
	}
	return false;
};
Quest.display = function() {
	var i, list = [], panel;
	for (i in Quest.data) {
		if (Quest.data[i].item) {
			list.push(Quest.data[i].item);
		}
	}
	panel = new Panel(this.name);
	panel.select('general', 'General:', ['any', 'Under Level 4', 'Influence']);
	Quest.what_id = panel.select('what', 'Quest for:', Array.concat(['Nothing', 'Influence', 'Experience', 'Cash'], unique(list.sort())));
	Quest.current_id = panel.info('None', 'current', 'Current:');
	return panel.show;
};
Quest.work = function(state) {
	var i, list, best = null;
	if (Quest.option.firstrun || !length(Quest.data)) {
		list = Quest.pages.split(' ');
		if (!state) {
			Quest.option.firstrun = 1; // Skip quests_quest
			Settings.Save('option', Quest);
			return true;
		}
		i = Quest.option.firstrun++;
		if (list[i]) {
			Settings.Save('option', Quest);
			Page.to(list[i]);
			return true;
		}
		delete Quest.option.firstrun;
		Settings.Save('option', Quest);
		Quest.select();
		return false;
	}
	if (Quest.option.what === 'Nothing') {
		return false;
	}
	for (i in Quest.data) {
		switch(Quest.option.what) {
			case 'Influence':
				if (Quest.data[i].influence >= 100 || best && Quest.data[i].energy >= Quest.data[best].energy) {
					continue;
				}
				break;
			case 'Experience':
				if (best && (Quest.data[i].energy / Quest.data[i].exp) >= (Quest.data[best].energy / Quest.data[best].exp)) {
					continue;
				}
				break;
			case 'Cash':
				if (best && (Quest.data[i].energy / Quest.data[i].reward) >= (Quest.data[best].energy / Quest.data[best].reward)) {
					continue;
				}
				break;
			default: // We're going for an item instead
				if (!Quest.data[i].item || Quest.data[i].item !== Quest.option.what || (best && (Quest.data[i].energy > Quest.data[best].energy))) {
					continue;
				}
				break;
		}
		best = i;
	}
	if (best !== Quest.current) {
		Quest.current = best;
		if (best) {
			GM_debug('Quest: Wanting to perform - '+best+' (energy: '+Quest.data[best].energy+')');
			$('#'+Quest.current_id).html('<strong>Current:</strong> '+best+' (energy: '+Quest.data[best].energy+')');
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
			if (!Page.to('quests_quest'+Quest.data[best].land)) {
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
	return true;
};
Quest.select = function() {
	var i, def = ['Nothing', 'Influence', 'Experience', 'Cash'], list = [];
	for (i in Quest.data) {
		if (Quest.data[i].item) {
			list.push(Quest.data[i].item);
		}
	}
	list = def.concat(unique(list.sort()));
	$('#'+Quest.what_id).empty();
	for (i in list) {
		$('#'+Quest.what_id).append('<option value="'+list[i]+'"'+(list[i]===Quest.option.what ? ' selected' : '')+'>'+list[i]+'</value>');
	}
};


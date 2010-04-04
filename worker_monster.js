/********** Worker.Monster **********
* Automates Monster
*/
var Monster = new Worker('Monster', 'keep_monster keep_monster_active battle_raid', {keep:true});
Monster.option = {
	fortify: 50,
	dispel: 50,
	first:false,
	choice: 'All',
	raid: 'Invade x5'
};

Monster.display = [
	{
		label:'Work in progress...'
	},{
		id:'fortify',
		label:'Fortify Below',
		select:[10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
		after:'%'
	},{
		id:'dispel',
		label:'Dispel Above',
		select:[10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
		after:'%'
	},{
		id:'first',
		label:'Fortify Before Attacking',
		checkbox:true,
		help:'Without this setting you will fortify whenever Energy is available'
	},{
		label:'"All" is currently Random...'
	},{
		id:'choice',
		label:'Attack',
		select:['All', 'Strongest', 'Weakest', 'Shortest', 'Spread', 'Achievement']
	},{
		id:'raid',
		label:'Raid',
		select:['Invade', 'Invade x5', 'Duel', 'Duel x5']
	},{
		id:'assist',
		label:'Use Assist Links in Dashboard',
		checkbox:true
	}
];

Monster.types = {
	// Special (level 5) - not under Monster tab
	kull: {
		name:'Kull, the Orc Captain',
		timer:259200 // 72 hours
	},
	// Raid
/*
	raid_easy: {
		name:'The Deathrune Siege',
		list:'deathrune_list1.jpg',
		image:'raid_1_large.jpg',// ???
		image:'raid_2_large.jpg',// ???
		
		timer:216000, // 60 hours
		timer:302400, // 84 hours
		raid:true
	},
*/
	raid: {
		name:'The Deathrune Siege',
		list:'deathrune_list2.jpg',
		// raid_b1_large.jpg
		image:'raid_map_1.jpg',
		image2:'raid_map_2.jpg',
		dead:'raid_1_large_victory.jpg',
		achievement:100,
		timer:319920, // 88 hours, 52 minutes
		timer2:519960, // 144 hours, 26 minutes
		raid:true
	},
	// Epic Boss
	colossus: {
		name:'Colossus of Terra',
		list:'stone_giant_list.jpg',
		image:'stone_giant_large.jpg',
		dead:'stone_giant_dead.jpg',
		achievement:40000,
		timer:259200, // 72 hours
		mpool:1
	},
	gildamesh: {
		name:'Gildamesh, the Orc King',
		list:'orc_boss_list.jpg',
		image:'orc_boss.jpg',
		dead:'orc_boss_dead.jpg',
		achievement:25000,
		timer:259200, // 72 hours
		mpool:1
	},
	keira: {
		name:'Keira, the Dread Knight',
		list:'boss_keira_list.jpg',
		image:'boss_keira.jpg',
		dead:'boss_keira_dead.jpg',
		achievement:84000,
		timer:172800, // 48 hours
		mpool:1
	},
	lotus: {
		name:'Lotus Ravenmoore',
		list:'boss_lotus_list.jpg',
		image:'boss_lotus.jpg',
		dead:'boss_lotus_big_dead.jpg',
		achievement:1250000,
		timer:172800, // 48 hours
		mpool:1		
	},
	mephistopheles: {
		name:'Mephistopheles',
		list:'boss_mephistopheles_list.jpg',
		image:'boss_mephistopheles_large.jpg',
		dead:'boss_mephistopheles_dead.jpg',
		achievement:282000,
		timer:172800, // 48 hours
		mpool:1		
	},
	skaar: {
		name:'Skaar Deathrune',
		list:'death_list.jpg',
		image:'death_large.jpg',
		dead:'death_dead.jpg',
		achievement:10000000,
		timer:345000, // 95 hours, 50 minutes
		mpool:1		
	},
	sylvanus: {
		name:'Sylvanas the Sorceress Queen',
		list:'boss_sylvanus_list.jpg',
		image:'boss_sylvanus_large.jpg',
		dead:'boss_sylvanus_dead.jpg',
		achievement:120000,
		timer:172800, // 48 hours
		mpool:1		
	},
	// Epic Team
	dragon_emerald: {
		name:'Emerald Dragon',
		list:'dragon_list_green.jpg',
		image:'dragon_monster_green.jpg',
		dead:'dead_dragon_image_green.jpg',
		achievement:64000,
		timer:259200, // 72 hours
		mpool:2		
	},
	dragon_frost: {
		name:'Frost Dragon',
		list:'dragon_list_blue.jpg',
		image:'dragon_monster_blue.jpg',
		dead:'dead_dragon_image_blue.jpg',
		achievement:85000,
		timer:259200, // 72 hours
		mpool:2		
	},
	dragon_gold: {
		name:'Gold Dragon',
		list:'dragon_list_gold.jpg',
		image:'dragon_monster_gold.jpg',
		dead:'dead_dragon_image_gold.jpg',
		achievement:180000,
		timer:259200, // 72 hours
		mpool:2		
	},
	dragon_red: {
		name:'Ancient Red Dragon',
		list:'dragon_list_red.jpg',
		image:'dragon_monster_red.jpg',
		dead:'dead_dragon_image_red.jpg',
		achievement:350000,
		timer:259200, // 72 hours
		mpool:2		
	},
	serpent_amethyst: { // DEAD image ???
		name:'Amethyst Sea Serpent',
		list:'seamonster_list_purple.jpg',
		image:'seamonster_purple.jpg',
		//dead:'seamonster_dead.jpg',
		achievement:600000,
		timer:259200, // 72 hours
		mpool:2		
	},
	serpent_ancient: { // DEAD image ???
		name:'Ancient Sea Serpent',
		list:'seamonster_list_red.jpg',
		image:'seamonster_red.jpg',
		//dead:'seamonster_dead.jpg',
		achievement:930000,
		timer:259200, // 72 hours
		mpool:2		
	},
	serpent_emerald: { // DEAD image ???
		name:'Emerald Sea Serpent',
		list:'seamonster_list_green.jpg',
		image:'seamonster_green.jpg',
		//dead:'seamonster_dead.jpg',
		achievement:150000,
		timer:259200, // 72 hours
		mpool:2		
	},
	serpent_sapphire: { // DEAD image ???
		name:'Sapphire Sea Serpent',
		list:'seamonster_list_blue.jpg',
		image:'seamonster_blue.jpg',
		//dead:'seamonster_dead.jpg',
		achievement:300000,
		timer:259200, // 72 hours
		mpool:2		
	},
	// Epic World
	cronus: {
		name:'Cronus, The World Hydra',
		list:'hydra_head.jpg',
		image:'hydra_large.jpg',
		dead:'hydra_dead.jpg',
		achievement:12500000,
		timer:604800, // 168 hours
		mpool:3		
	},
	legion: {
		name:'Battle of the Dark Legion',
		list:'castle_siege_list.jpg',
		image:'castle_siege_large.jpg',
		dead:'castle_siege_dead.jpg',
		achievement:10000,
		timer:604800, // 168 hours
		mpool:3		
	},
	genesis: {
		name:'Genesis, The Earth Elemental',
		list:'earth_element_list.jpg',
		image:'earth_element_large.jpg',
		dead:'earth_element_dead.jpg',
		achievement:10000000,
		timer:604800, // 168 hours
		mpool:3		
	},
	ragnarok: {
		name:'Ragnarok, The Ice Elemental',
		list:'water_list.jpg',
		image:'water_large.jpg',
		dead:'water_dead.jpg',
		achievement:11000000,
		timer:604800, // 168 hours
		mpool:3		
	}
};

Monster.dispel = ['input[src=$"button_dispel.gif"]'];
Monster.fortify = ['input[src$="attack_monster_button3.jpg"]', 'input[src$="seamonster_fortify.gif"]'];
Monster.attack = ['input[src$="attack_monster_button2.jpg"]', 'input[src$="seamonster_power.gif"]', 'input[src$="attack_monster_button.jpg"]', 'input[src$="event_attack2.gif"]', 'input[src$="event_attack1.gif"]'];
Monster.count = 0;
Monster.uid = null;

Monster.init = function() {
	var i, j;
	for (i in Monster.data) {
		for (j in Monster.data[i]) {
			if (Monster.data[i][j].state === 'engage') {
				Monster.count++;
			}
		}
	}
	$('#golem-dashboard-Monster tbody td a').live('click', function(event){
		var url = $(this).attr('href');
		Page.to((url.indexOf('raid') > 0 ? 'battle_raid' : 'keep_monster'), url.substr(url.indexOf('?')));
		return false;
	});
}

Monster.parse = function(change) {
	var i, j, uid, type, tmp, $health, $defense, $dispel, dead = false, monster, timer;
	if (Page.page === 'keep_monster_active') { // In a monster
		Monster.uid = uid = $('img[linked="true"][size="square"]').attr('uid');
		for (i in Monster.types) {
			if (Monster.types[i].dead && $('img[src$="'+Monster.types[i].dead+'"]').length) {
				type = i;
				timer = Monster.types[i].timer;
				dead = true;
			} else if (Monster.types[i].image && $('img[src$="'+Monster.types[i].image+'"]').length) {
				type = i;
				timer = Monster.types[i].timer;
			} else if (Monster.types[i].image2 && $('img[src$="'+Monster.types[i].image2+'"]').length) {
				type = i;
				timer = Monster.types[i].timer2 || Monster.types[i].timer;
			}
		}
		if (!uid || !type) {
			debug('Monster: Unknown monster (probably dead)');
			return false;
		}
		Monster.data[uid] = Monster.data[uid] || {};
		Monster.data[uid][type] = Monster.data[uid][type] || {};
		monster = Monster.data[uid][type];
		if ($('input[src*="collect_reward_button.jpg"]').length) {
			monster.state = 'reward';
			return false;
		}
		if (dead && monster.state === 'assist') {
			monster.state = null;
		} else if (dead && monster.state === 'engage') {
			monster.state = 'reward';
		} else {
			if (!monster.state && $('span.result_body').text().match(/for your help in summoning|You have already assisted on this objective|You don't have enough stamina assist in summoning/i)) {
				if ($('span.result_body').text().match(/for your help in summoning/i)) {
					monster.assist = Date.now();
				}
				monster.state = 'assist';
			}
			if ($('img[src$="icon_weapon.gif"],img[src$="battle_victory.gif"]').length)	{
				monster.battle_count = (monster.battle_count || 0) + 1;
			}
			if (!monster.name) {
				tmp = $('img[linked="true"][size="square"]').parent().parent().next().text().trim().replace(/[\s\n\r]{2,}/g, ' ');
				monster.name = tmp.substr(0, tmp.length - Monster.types[type].name.length - 3);
			}
			$health = $('img[src$="monster_health_background.jpg"]').parent();
			monster.health = $health.length ? ($health.width() / $health.parent().width() * 100) : 0;
			$defense = $('img[src$="seamonster_ship_health.jpg"]').parent();
			if ($defense.length) {
				monster.defense = ($defense.width() / ($defense.next().length ? $defense.width() + $defense.next().width() : $defense.parent().width()) * 100);
			}
			$dispel = $('img[src$="bar_dispel.gif"]').parent();
			if ($dispel.length) {
				monster.dispel = ($dispel.width() / ($dispel.next().length ? $dispel.width() + $dispel.next().width() : $dispel.parent().width()) * 100);
			}
			monster.timer = $('#app'+APPID+'_monsterTicker').text().parseTimer();
			monster.finish = Date.now() + (monster.timer * 1000);
			monster.damage_total = 0;
			monster.damage = {};
			$('td.dragonContainer table table a[href^="http://apps.facebook.com/castle_age/keep.php?user="]').each(function(i,el){
				var user = $(el).attr('href').regex(/user=([0-9]+)/i), tmp = $(el).parent().next().text().replace(/[^0-9\/]/g,''), dmg = tmp.regex(/([0-9]+)/), fort = tmp.regex(/\/([0-9]+)/);
				monster.damage[user]  = (fort ? [dmg, fort] : [dmg]);
				monster.damage_total += dmg;
			});
			monster.dps = monster.damage_total / (timer - monster.timer);
			if (Monster.types[type].raid) {
				monster.total = monster.damage_total + $('img[src$="monster_health_background.jpg"]').parent().parent().next().text().regex(/([0-9]+)/);
			} else {
				monster.total = Math.floor(monster.damage_total / (100 - monster.health) * 100);
			}
			monster.eta = Date.now() + (Math.floor((monster.total - monster.damage_total) / monster.dps) * 1000);
		}
	} else if (Page.page === 'keep_monster' || Page.page === 'battle_raid') { // Check monster / raid list
		if (!$('#app'+APPID+'_app_body div.imgButton').length) {
			return false;
		}
		if (Page.page === 'battle_raid') {
			raid = true;
		}
		for (uid in Monster.data) {
			for (type in Monster.data[uid]) {
				if (((Page.page === 'battle_raid' && Monster.types[type].raid) || (Page.page === 'keep_monster' && !Monster.types[type].raid)) && (Monster.data[uid][type].state === 'complete' || (Monster.data[uid][type].state === 'assist' && Monster.data[uid][type].finish < Date.now()))) {
					Monster.data[uid][type].state = null;
				}
			}
		}
		$('#app'+APPID+'_app_body div.imgButton').each(function(i,el){
			var i, uid = $('a', el).attr('href').regex(/user=([0-9]+)/i), tmp = $(el).parent().parent().children().eq(1).html().regex(/graphics\/([^.]*\....)/i), type = 'unknown';
			for (i in Monster.types) {
				if (tmp === Monster.types[i].list || tmp === Monster.types[i].lis2) {
					type = i;
					break;
				}
			}
			if (!uid || type === 'unknown') {
				return;
			}
			Monster.data[uid] = Monster.data[uid] || {};
			Monster.data[uid][type] = Monster.data[uid][type] || {};
			if (uid === userID) {
				Monster.data[uid][type].name = 'You';
			} else {
				tmp = $(el).parent().parent().children().eq(2).text().trim();
				Monster.data[uid][type].name = tmp.substr(0, tmp.length - Monster.types[type].name.length - 3);
			}
			switch($('img', el).attr('src').regex(/dragon_list_btn_([0-9])/)) {
				case 2: Monster.data[uid][type].state = 'reward'; break;
				case 3: Monster.data[uid][type].state = 'engage'; break;
				case 4:
//					if (Monster.types[type].raid && Monster.data[uid][type].health) {
//						Monster.data[uid][type].state = 'engage'; // Fix for page cache issues in 2-part raids
//					} else {
						Monster.data[uid][type].state = 'complete';
//					}
					break;
				default: Monster.data[uid][type].state = 'unknown'; break; // Should probably delete, but keep it on the list...
			}
		});
	}
	Monster.count = 0;
	for (i in Monster.data) {
		for (j in Monster.data[i]) {
			if (!Monster.data[i][j].state) {
				delete Monster.data[i][j];
			} else if (Monster.data[i][j].state === 'engage') {
				Monster.count++;
			}
		}
		if (!length(Monster.data[i])) {
			delete Monster.data[i];
		}
	}
	return false;
};

Monster.work = function(state) {
	var i, j, list = [], uid = Monster.option.uid, type = Monster.option.type, btn = null, best = null
	if (!state || (uid && type && Monster.data[uid][type].state !== 'engage' && Monster.data[uid][type].state !== 'assist')) {
		Monster.option.uid = uid = null;
		Monster.option.type = type = null;
	}
	if (!length(Monster.data) || Player.get('health') <= 10) {
		return false;
	}
	for (i in Monster.data) {
		for (j in Monster.data[i]) {
			if (!Monster.data[i][j].health && Monster.data[i][j].state === 'engage') {
				if (state) {
					Page.to(Monster.types[j].raid ? 'battle_raid' : 'keep_monster', '?user=' + i + (Monster.types[j].mpool ? '&mpool='+Monster.types[j].mpool : ''));
				}
				return true;
			}
		}
	}
	if (!uid || !type || !Monster.data[uid] || !Monster.data[uid][type]) {
		for (uid in Monster.data) {
			for (type in Monster.data[uid]) {
				if (Monster.data[uid][type].state === 'engage' && Monster.data[uid][type].finish > Date.now()) {
					if (Monster.option.choice === 'All' || (Monster.option.choice === 'Achievement' && Monster.types[type].achievement && Monster.damage[userID] && Monster.damage[userID][0] <= Monster.types[type].achievement)) {
						list.push([uid, type]);
					} else if (!(best || Monster.option.choice === 'Achievement')
					|| (Monster.option.choice === 'Strongest' && Monster.data[uid][type].health > Monster.data[best[0]][best[1]].health)
					|| (Monster.option.choice === 'Weakest' && Monster.data[uid][type].health < Monster.data[best[0]][best[1]].health)
					|| (Monster.option.choice === 'Shortest' &&  Monster.data[uid][type].timer < Monster.data[best[0]][best[1]].timer)
					|| (Monster.option.choice === 'Spread' && Monster.data[uid][type].battle_count < Monster[best[0]][best[1]].battle_count)) {
						best = [uid, type];
					}
				}
			}
		}
		if ((Monster.option.choice === 'All' || Monster.option.choice === 'Achievement') && list.length) {
			best = list[Math.floor(Math.random()*list.length)];
		}
		if (!best) {
			return false;
		}
		uid  = Monster.option.uid  = best[0];
		type = Monster.option.type = best[1];
	}
	if (Queue.burn.stamina < 5 && (Queue.burn.energy < 10 || (!Monster.option.first && (typeof Monster.data[uid][type].defense === 'undefined' || Monster.data[uid][type].defense > Monster.option.fortify) && (typeof Monster.data[uid][type].dispel === 'undefined' || Monster.data[uid][type].dispel < Monster.option.dispel)))) {
		return false;
	}
	if (!state) {
		return true;
	}
	if (Monster.types[type].raid) {
		if (!Generals.to(Generals.best(Monster.option.raid.indexOf('Invade') ? 'invade' : 'duel'))) {
			return true;
		}
		debug('Raid: '+Monster.option.raid+' '+uid);
		switch(Monster.option.raid) {
			case 'Invade':
				btn = $('input[src$="raid_attack_button.gif"]:first');
				break;
			case 'Invade x5':
				btn = $('input[src$="raid_attack_button3.gif"]:first');
				break;
			case 'Duel':
				btn = $('input[src$="raid_attack_button2.gif"]:first');
				break;
			case 'Duel x5':
				btn = $('input[src$="raid_attack_button4.gif"]:first');
				break;
		}
	} else if (Monster.data[uid][type].defense && Monster.data[uid][type].defense <= Monster.option.fortify && Queue.burn.energy >= 10) {
		if (!Generals.to(Generals.best('defend'))) {
			return true;
		}
		debug('Monster: Fortify '+uid);
		for (i=0; i<Monster.fortify.length; i++) {
			if ($(Monster.fortify[i]).length) {
				btn = $(Monster.fortify[i]);
				break;
			}
		}
	} else if (Monster.data[uid][type].dispel && Monster.data[uid][type].dispel >= Monster.option.dispel && Queue.burn.energy >= 10) {
		if (!Generals.to(Generals.best('defend'))) {
			return true;
		}
		debug('Monster: Dispel '+uid);
		for (i=0; i<Monster.dispel.length; i++) {
			if ($(Monster.dispel[i]).length) {
				btn = $(Monster.dispel[i]);
				break;
			}
		}
	} else {
		if (!Generals.to(Generals.best('duel'))) {
			return true;
		}
		debug('Monster: Attack '+uid);
		for (i=0; i<Monster.attack.length; i++) {
			if ($(Monster.attack[i]).length) {
				btn = $(Monster.attack[i]);
				break;
			}
		}
	}
	if ((!btn || !btn.length || uid !== Monster.uid) && !Page.to(Monster.types[type].raid ? 'battle_raid' : 'keep_monster', '?user=' + uid + (Monster.types[type].mpool ? '&mpool='+Monster.types[type].mpool : ''))) {
		return true; // Reload if we can't find the button or we're on the wrong page
	}
	Page.click(btn);
	return true;
};

Monster.order = null;
Monster.dashboard = function(sort, rev) {
	var i, j, o, monster, url, list = [], output = [], sorttype = [null, 'name', 'health', 'defense', 'dispel', null, 'timer', 'eta'], state = {engage:0, assist:1, reward:2, complete:3}, blank;
	if (typeof sort === 'undefined') {
		sort = 1; // Default = sort by name
		Monster.order = [];
		for (i in Monster.data) {
			for (j in Monster.data[i]) {
				Monster.order.push([i, j]);
			}
		}
	}
	Monster.order.sort(function(a,b) {
		var aa, bb;
		if (state[Monster.data[a[0]][a[1]].state] > state[Monster.data[b[0]][b[1]].state]) {
			return 1;
		}
		if (state[Monster.data[a[0]][a[1]].state] < state[Monster.data[b[0]][b[1]].state]) {
			return -1;
		}
		if (typeof sorttype[sort] === 'string') {
			aa = Monster.data[a[0]][a[1]][sorttype[sort]];
			bb = Monster.data[b[0]][b[1]][sorttype[sort]];
		} else if (sort == 4) { // damage
			aa = Monster.data[a[0]][a[1]].damage ? Monster.data[a[0]][a[1]].damage[userID] : 0;
			bb = Monster.data[b[0]][b[1]].damage ? Monster.data[b[0]][b[1]].damage[userID] : 0;
		}
		if (typeof aa === 'string' || typeof bb === 'string') {
			return (rev ? (bb || '') > (aa || '') : (bb || '') < (aa || ''));
		}
		return (rev ? (aa || 0) - (bb || 0) : (bb || 0) - (aa || 0));
	});
	th(output, '');
	th(output, 'User');
	th(output, 'Health', 'title="(estimated)"');
	th(output, 'Fortify');
	th(output, 'Shield');
	th(output, 'Damage');
	th(output, 'Time Left');
	th(output, 'Kill In', 'title="(estimated)"');
	list.push('<table cellspacing="0" style="width:100%"><thead><tr>' + output.join('') + '</tr></thead><tbody>');
	for (o=0; o<Monster.order.length; o++) {
		i = Monster.order[o][0];
		j = Monster.order[o][1];
		if (!Monster.types[j]) {
			continue;
		}
		output = [];
		monster = Monster.data[i][j];
		blank = !((monster.state === 'engage' || monster.state === 'assist') && monster.total);
		// http://apps.facebook.com/castle_age/battle_monster.php?user=00000&mpool=3
		// http://apps.facebook.com/castle_age/battle_monster.php?twt2=earth_1&user=00000&action=doObjective&mpool=3&lka=00000&ref=nf
		// http://apps.facebook.com/castle_age/raid.php?user=00000
		// http://apps.facebook.com/castle_age/raid.php?twt2=deathrune_adv&user=00000&action=doObjective&lka=00000&ref=nf
		if (Monster.option.assist && (monster.state === 'engage' || monster.state === 'assist')) {
			url = '?user=' + i + '&action=doObjective' + (Monster.types[j].mpool ? '&mpool=' + Monster.types[j].mpool : '') + '&lka=' + i + '&ref=nf';
		} else {
			url = '?user=' + i + (Monster.types[j].mpool ? '&mpool=' + Monster.types[j].mpool : '');
		}
		td(output, '<a href="http://apps.facebook.com/castle_age/' + (Monster.types[j].raid ? 'raid.php' : 'battle_monster.php') + url + '"><strong class="overlay">' + monster.state + '</strong><img src="' + imagepath + Monster.types[j].list + '" style="width:90px;height:25px" alt="' + j + '"></a>', 'title="' + Monster.types[j].name + '"');
		th(output, Monster.data[i][j].name);
		td(output, blank ? '' : monster.health === 100 ? '100%' : addCommas(monster.total - monster.damage_total) + ' (' + Math.floor(monster.health) + '%)');
		td(output, blank ? '' : isNumber(monster.defense) ? Math.floor(monster.defense)+'%' : '');
		td(output, blank ? '' : isNumber(monster.dispel) ? Math.floor(monster.dispel)+'%' : '');
		td(output, blank ? '' : monster.state === 'engage' ? addCommas(monster.damage[userID][0] || 0) + ' (' + ((monster.damage[userID][0] || 0) / monster.total * 100).round(1) + '%)' : '', blank ? '' : 'title="In ' + (monster.battle_count || 'an unknown number of') + ' attacks"');
		td(output, blank ? '' : monster.timer ? '<span class="golem-timer">' + makeTimer((monster.finish - Date.now()) / 1000) + '</span>' : '?');
		td(output, blank ? '' : '<span class="golem-timer">' + (monster.health === 100 ? makeTimer((monster.finish - Date.now()) / 1000) : makeTimer((monster.eta - Date.now()) / 1000)) + '</span>');
		tr(list, output.join(''));
	}
	list.push('</tbody></table>');
	$('#golem-dashboard-Monster').html(list.join(''));
	if (typeof sort !== 'undefined') {
		$('#golem-dashboard-Monster thead th:eq('+sort+')').attr('name',(rev ? 'reverse' : 'sort')).append('&nbsp;' + (rev ? '&uarr;' : '&darr;'));
	}
};


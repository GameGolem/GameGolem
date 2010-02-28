/********** Worker.Monster **********
* Automates Monster
*/
var Monster = new Worker('Monster', 'keep_monster keep_monster_active');
Monster.option = {
	fortify: 50,
	choice: 'All'
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
		label:'"All" is currently Random...'
	},{
		id:'choice',
		label:'Attack',
		select:['All', 'Strongest', 'Weakest', 'Shortest']
	}
];
Monster.types = {
	// Special (level 5) - not under Monster tab
	kull: {
		name:'Kull, the Orc Captain',
		timer:259200 // 72 hours
	},
	// Raid
	raid_easy: {
		list:'deathrune_list.jpg',
		image:'raid_1_large.jpg',
		mpool:1
	},
	raid_advanced: {
		list:'deathrune_list2.jpg',
		image:'deathrune.jpg',
		mpool:1
	},
	// Epic Boss
	colossus: {
		name:'Colossus of Terra',
		list:'stone_giant_list.jpg',
		image:'stone_giant.jpg',
		timer:259200, // 72 hours
		mpool:1
	},
	gildamesh: {
		name:'Gildamesh, the Orc King',
		list:'orc_boss_list.jpg',
		list:'orc_boss.jpg',
		timer:259200, // 72 hours
		mpool:1
	},
	keira: {
		name:'Keira, the Dread Knight',
		list:'boss_keira_list.jpg',
		image:'boss_keira.jpg',
		timer:172800, // 48 hours
		mpool:1
	},
	lotus: {
		name:'Lotus Ravenmoore',
		list:'boss_lotus_list.jpg',
		image:'boss_lotus.jpg',
		timer:172800, // 48 hours
		mpool:1
	},
	mephistopheles: {
		name:'Mephistopheles',
		list:'boss_mephistopheles_list.jpg',
		image:'boss_mephistopheles_large.jpg',
		timer:172800, // 48 hours
		mpool:1
	},
	skaar: {
		name:'Skaar Deathrune',
		mpool:1
	},
	sylvanus: {
		name:'Sylvanas the Sorceress Queen',
		list:'boss_sylvanus_list.jpg',
		image:'boss_sylvanus_large.jpg',
		timer:172800, // 48 hours
		mpool:1
	},
	// Epic Team
	dragon_emerald: {
		name:'Emerald Dragon',
		list:'dragon_list_green.jpg',
		image:'dragon_monster_green.jpg',
		timer:259200, // 72 hours
		mpool:2
	},
	dragon_frost: {
		name:'Frost Dragon',
		list:'dragon_list_blue.jpg',
		image:'dragon_monster_blue.jpg',
		timer:259200, // 72 hours
		mpool:2
	},
	dragon_gold: {
		name:'Gold Dragon',
		list:'dragon_list_gold.jpg',
		image:'dragon_monster_gold.jpg',
		timer:259200, // 72 hours
		mpool:2
	},
	dragon_red: {
		name:'Ancient Red Dragon',
		list:'dragon_list_red.jpg',
		image:'dragon_monster_red.jpg',
		timer:259200, // 72 hours
		mpool:2
	},
	serpent_amethyst: {
		name:'Amethyst Sea Serpent',
		list:'seamonster_list_purple.jpg',
		image:'seamonster_purple.jpg',
		timer:259200, // 72 hours
		mpool:2
	},
	serpent_ancient: {
		name:'Ancient Sea Serpent',
		list:'seamonster_list_red.jpg',
		image:'seamonster_red.jpg',
		timer:259200, // 72 hours
		mpool:2
	},
	serpent_emerald: {
		name:'Emerald Sea Serpent',
		list:'seamonster_list_green.jpg',
		image:'seamonster_green.jpg',
		timer:259200, // 72 hours
		mpool:2
	},
	serpent_sapphire: {
		name:'Sapphire Sea Serpent',
		list:'seamonster_list_blue.jpg',
		image:'seamonster_blue.jpg',
		timer:259200, // 72 hours
		mpool:2
	},
	// Epic World
	cronus: {
		name:'Cronus, The World Hydra',
		list:'hydra_head.jpg',
		image:'hydra_large.jpg',
		timer:604800, // 168 hours
		mpool:3
	},
	legion: {
		name:'Battle of the Dark Legion',
		list:'castle_siege_list.jpg',
		image:'castle_siege.jpg',
		timer:604800, // 168 hours
		mpool:3
	},
	genersis: {
		name:'Genesis, The Earth Elemental',
		list:'earth_element_list.jpg',
		image:'earth_element_large.jpg',
		timer:604800, // 168 hours
		mpool:3
	}
};
Monster.fortify = ['input[src$="attack_monster_button3.jpg"]', 'input[src$="seamonster_fortify.gif"]'];
Monster.attack = ['input[src$="attack_monster_button2.jpg"]', 'input[src$="seamonster_power.gif"]', 'input[src$="attack_monster_button.jpg"]'];
Monster.count = 0;
Monster.uid = null;
Monster.onload = function() {
	var i, j;
	for (i in Monster.data) {
		for (j in Monster.data[i]) {
			if (Monster.data[i][j].state === 'engage') {
				Monster.count++;
			}
		}
	}
}
Monster.parse = function(change) {
	var i, j, uid, type, $health, $defense, damage;
	if (Page.page === 'keep_monster_active') { // In a monster
		Monster.uid = uid = $('img[linked="true"][size="square"]').attr('uid');
		for (i in Monster.types) {
			if ($('img[src*="'+Monster.types[i].image+'"]').length) {
				type = i;
			}
		}
		if (!uid || !type) {
			GM_debug('Monster: Unknown monster');
			return false;
		}
		if ($('input[src*="collect_reward_button.jpg"]').length) {
			Monster.data[uid].state = 'reward';
			return false;
		}
		$health = $('img[src$="monster_health_background.jpg"]').parent();
		Monster.data[uid][type].health = ($health.width() / $health.parent().width() * 100);
		$defense = $('img[src$="seamonster_ship_health.jpg"]').parent();
		if ($defense.length) {
			Monster.data[uid][type].defense = ($defense.width() / ($defense.next().length ? $defense.width() + $defense.next().width() : $defense.parent().width()) * 100);
		}
		Monster.data[uid][type].timer = $('#app'+APP+'_monsterTicker').text().parseTimer();
		damage = {};
		$('td.dragonContainer table table a[href^="http://apps.facebook.com/castle_age/keep.php?user="]').each(function(i,el){
			var user = $(el).attr('href').regex(/user=([0-9]+)/i), tmp = $(el).parent().next().text().replace(/[^0-9\/]/g,''), dmg = tmp.regex(/([0-9]+)/), fort = tmp.regex(/\/([0-9]+)/);
			damage[user] = (fort ? [dmg, fort] : dmg);
		});
		Monster.data[uid][type].damage = damage;
	} else if (Page.page === 'keep_monster') { // Check monster list
		for (i in Monster.data) {
			for (j in Monster.data[i]) {
				Monster.data[i][j].state = null;
			}
		}
		$('#app'+APP+'_app_body div.imgButton').each(function(i,el){
			var i, uid = $('a', el).attr('href').regex(/user=([0-9]+)/i), tmp = $(el).parent().parent().children().eq(1).html().regex(/graphics\/([^.]*\....)/i), type = 'unknown';
			for (i in Monster.types) {
				if (tmp === Monster.types[i].list) {
					type = i;
					break;
				}
			}
			if (!uid || type === 'unknown') {
				return;
			}
			Monster.data[uid] = Monster.data[uid] || {};
			Monster.data[uid][type] = Monster.data[uid][type] || {};
			if (uid === Player.data.FBID) {
				Monster.data[uid][type].name = 'You';
			} else {
				tmp = $(el).parent().parent().children().eq(2).text().trim();
				Monster.data[uid][type].name = tmp.substr(0, tmp.length - Monster.types[type].name.length - 3);
			}
			switch($('img', el).attr('src').regex(/dragon_list_btn_([0-9])/)) {
				case 2: Monster.data[uid][type].state = 'reward'; break;
				case 3: Monster.data[uid][type].state = 'engage'; break;
				case 4: Monster.data[uid][type].state = 'complete'; break;
				default: Monster.data[uid][type].state = 'unknown'; break; // Should probably delete, but keep it on the list...
			}
		});
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
	}
	Monster.dashboard();
	return false;
};
Monster.work = function(state) {
	var i, list = [], uid = Monster.option.uid, type = Monster.option.type, btn = null, best = null
	if (!state) {
		Monster.option.uid = null;
		Monster.option.type = null;
	}
	if (!length(Monster.data) || Player.data.health <= 10) {
		return false;
	}
	if (!uid || !type || !Monster.data[uid] || Monster.data[uid][type].state !== 'engage') {
		for (uid in Monster.data) {
			for (type in Monster.data[uid]) {
				if (Monster.data[uid][type].state === 'engage'){
					if (Monster.option.choice === 'All') {
						list.push([uid, type]);
					} else if (!best
					|| (Monster.option.choice === 'Strongest' && Monster.data[uid][type].health > Monster.data[best[0]][best[1]].health)
					|| (Monster.option.choice === 'Weakest' && Monster.data[uid][type].health < Monster.data[best[0]][best[1]].health)
					|| (Monster.option.choice === 'Shortest' &&  Monster.data[uid][type].timer < Monster.data[best[0]][best[1]].timer)) {
						best = [uid, type];
					}
				}
			}
		}
		if (Monster.option.choice === 'All' && list.length) {
			best = list[Math.floor(Math.random()*list.length)];
		}
		if (!best) {
			return false;
		}
		uid  = Monster.option.uid  = best[0];
		type = Monster.option.type = best[1];
	}
	if (Queue.burn.stamina < 5 && (Queue.burn.energy < 10 || typeof Monster.data[uid][type].defense === 'undefined' || Monster.data[uid][type].defense >= Monster.option.fortify)) {
		return false;
	}
	if (!state) {
		return true;
	}
	if (Monster.data[uid][type].defense && Monster.data[uid][type].defense <= Monster.option.fortify && Queue.burn.energy >= 10) {
		if (!Generals.to(Generals.best('defend'))) {
			return true;
		}
		GM_debug('Monster: Fortify '+uid);
		for (i=0; i<Monster.fortify.length; i++) {
			if ($(Monster.fortify[i]).length) {
				btn = $(Monster.fortify[i]);
				break;
			}
		}
	} else {
		if (!Generals.to(Generals.best('duel'))) {
			return true;
		}
		GM_debug('Monster: Attack '+uid);
		for (i=0; i<Monster.attack.length; i++) {
			if ($(Monster.attack[i]).length) {
				btn = $(Monster.attack[i]);
				break;
			}
		}
	}
	if ((!btn || uid !== Monster.uid) && !Page.to('keep_monster', '?user='+uid+'&mpool='+Monster.types[type].mpool)) {
		return true; // Reload if we can't find the button or we're on the wrong monster
	}
	Page.click(btn);
	return true;
};
Monster.order = null;
Monster.dashboard = function(sort, rev) {
	var i, j, k, o, list = [], output, sorttype = [null, 'name', 'health', 'fortify', null, 'timer', 'ttk'];
	list.push('<table cellspacing="0" style="width:100%"><thead><tr><th></th><th>User</th><th title="(estimated)">Health</th><th>Fortify</th><th>Damage</th><th>Time Left...</th><th title="(estimated)">Kill In...</th></tr></thead><tbody>');
	if (typeof sort === 'undefined') {
		sort = 1; // Default = sort by name
		Monster.order = [];
		for (i in Monster.data) {
			for (j in Monster.data[i]) {
				if (Monster.data[i][j].state === 'engage') {
					Monster.data[i][j].damage_total = 0;
					for (k in Monster.data[i][j].damage) {
						Monster.data[i][j].damage_total += (typeof Monster.data[i][j].damage[k] === 'number' ? Monster.data[i][j].damage[k] : Monster.data[i][j].damage[k][0]);
					}
					Monster.data[i][j].dps = Monster.data[i][j].damage_total / (Monster.types[j].timer - Monster.data[i][j].timer);
					Monster.data[i][j].total = Math.floor(Monster.data[i][j].damage_total / (100 - Monster.data[i][j].health) * 100);
					Monster.data[i][j].ttk = Math.floor((Monster.data[i][j].total - Monster.data[i][j].damage_total) / Monster.data[i][j].dps);
				} else {
					delete Monster.data[i][j].damage_total;
					delete Monster.data[i][j].dps;
					delete Monster.data[i][j].total;
					delete Monster.data[i][j].ttk;
				}
				Monster.order.push([i, j]);
			}
		}
	}
	Monster.order.sort(function(a,b) {
		var aa, bb;
		if (Monster.data[a[0]][a[1]].state !== 'engage') {
			if (Monster.data[b[0]][b[1]].state === 'engage') {
				return 1;
			}
		} else if (Monster.data[b[0]][b[1]].state !== 'engage') {
			return -1;
		}
		if (typeof sorttype[sort] === 'string') {
			aa = Monster.data[a[0]][a[1]][sorttype[sort]];
			bb = Monster.data[b[0]][b[1]][sorttype[sort]];
		} else if (sort == 4) { // damage
			aa = Monster.data[a[0]][a[1]].damage ? Monster.data[a[0]][a[1]].damage[Player.data.FBID] : 0;
			bb = Monster.data[b[0]][b[1]].damage ? Monster.data[b[0]][b[1]].damage[Player.data.FBID] : 0;
		}
		if (typeof aa === 'string' || typeof bb === 'string') {
			return (rev ? (bb || '') > (aa || '') : (bb || '') < (aa || ''));
		}
		return (rev ? (aa || 0) - (bb || 0) : (bb || 0) - (aa || 0));
	});
	for (o=0; o<Monster.order.length; o++) {
		i = Monster.order[o][0];
		j = Monster.order[o][1];
		output = [];
		output.push('<strong style="position:absolute;margin:6px;color:#1fc23a;text-shadow:black 1px 1px 2px;">' + Monster.data[i][j].state + '</strong><img src="' + Player.data.imagepath + Monster.types[j].list + '" style="width:90px;height:25px" alt="' + j + '" title="' + (Monster.types[j].name ? Monster.types[j].name : j) + '">');
		output.push(Monster.data[i][j].name);
		if (Monster.data[i][j].state === 'engage') {
			output.push(Monster.data[i][j].health===100 ? '?' : addCommas(Monster.data[i][j].total - Monster.data[i][j].damage_total) + ' (' + Math.floor(Monster.data[i][j].health) + '%)');
			output.push(Monster.data[i][j].defense ? Math.floor(Monster.data[i][j].defense)+'%' : '');
			output.push(addCommas(Monster.data[i][j].damage[Player.data.FBID]));
			output.push(Monster.data[i][j].timer ? '<span class="golem-timer">' + makeTimer(Monster.data[i][j].timer) + '</span>' : '?');
			output.push(Monster.data[i][j].health===100 ? '?' : '<span class="golem-timer">'+makeTimer(Monster.data[i][j].ttk)+'</span>');
		} else {
			output.push('', '', '', '', '');
		}
		list.push('<tr><td>' + output.join('</td><td>') + '</td></tr>');
	}
	list.push('</tbody></table>');
	$('#golem-dashboard-Monster').html(list.join(''));
	$('#golem-dashboard-Monster thead th').css('cursor', 'pointer').click(function(event){
		Monster.dashboard($(this).prevAll().length, $(this).attr('name')==='sort');
	});
	$('#golem-dashboard-Monster tbody tr td:nth-child(2)').css('text-align', 'left');
	if (typeof sort !== 'undefined') {
		$('#golem-dashboard-Monster thead th:eq('+sort+')').attr('name',(rev ? 'reverse' : 'sort')).append('&nbsp;' + (rev ? '&uarr;' : '&darr;'));
	}
};


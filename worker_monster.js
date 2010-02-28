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
	legion: {
		list:'castle_siege_list.jpg',
		image:'castle_siege.jpg',
		name:'Battle of the Dark Legion',
		timer:604800, // 168 hours
		mpool:3
	},
	colossus: {
		list:'stone_giant_list.jpg',
		image:'stone_giant.jpg',
		timer:259200, // 72 hours
		mpool:1
	},
	dragon_red: {
		list:'dragon_list_red.jpg',
		image:'dragon_monster_red.jpg',
		name:'Ancient Red Dragon',
		timer:259200, // 72 hours
		mpool:2
	},
	raid: {
		list:'deathrune_list2.jpg',
		image:'deathrune.jpg',
		mpool:1
	},
	sylvanus: {
		list:'boss_sylvanus_list.jpg',
		image:'boss_sylvanus_large.jpg',
		name:'Sylvanas the Sorceress Queen',
		timer:172800, // 48 hours
		mpool:1
	},
	serpent: {
		list:'seamonster_list_red.jpg',
		image:'seamonster_red.jpg',
		name:'Ancient Sea Serpent',
		timer:259200, // 72 hours
		mpool:2
	}
};
Monster.fortify = ['input[src$="attack_monster_button3.jpg"]', 'input[src$="seamonster_fortify.gif"]'];
Monster.attack = ['input[src$="attack_monster_button2.jpg"]', 'input[src$="seamonster_power.gif"]', 'input[src$="attack_monster_button.jpg"]'];
Monster.count = 0;
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
		uid = $('img[linked="true"][size="square"]').attr('uid');
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
	if (!btn && !Page.to('keep_monster', '?user='+uid+'&mpool='+Monster.types[type].mpool)) {
		return true; // Reload if we can't find the button
	}
	Page.click(btn);
	return true;
};
Monster.dashboard = function() {
	var i, j, k, dam, txt, list = [], dps, total, ttk, output, alive;
	list.push('<table cellspacing="0" style="width:100%"><thead><tr><th></th><th>UserID</th><th>State</th><th title="(estimated)">Health</th><th>Fortify</th><th>Time Left...</th><th title="(estimated)">Kill In...</th></tr></thead><tbody>');
	for (i in Monster.data) {
		for (j in Monster.data[i]) {
			output = [];
			dam = 0;
			alive = (Monster.data[i][j].state === 'engage');
			for (k in Monster.data[i][j].damage) {
				dam += (typeof Monster.data[i][j].damage[k] === 'number' ? Monster.data[i][j].damage[k] : Monster.data[i][j].damage[k][0]);
			}
			if (alive) {
				dps = dam / (Monster.types[j].timer - Monster.data[i][j].timer);
				total = Math.floor(dam / (100 - Monster.data[i][j].health) * 100);
//				GM_debug('Timer: '+Monster.types[j].timer+', dam / dps = '+Math.floor(total / dps)+', left: '+Monster.data[i][j].timer);
				ttk = Math.floor((total - dam) / dps);
			}
			output.push('<img src="' + Player.data.imagepath + Monster.types[j].list + '" style="width:90px;height:25px" alt="' + j + '" title="' + (Monster.types[j].name ? Monster.types[j].name : j) + '">');
			output.push(i);
			output.push(Monster.data[i][j].state);
			if (alive) {
				output.push(Monster.data[i][j].health===100 ? '?' : addCommas(total - dam) + ' (' + Math.floor(Monster.data[i][j].health) + '%)');
				output.push(Monster.data[i][j].defense ? Math.floor(Monster.data[i][j].defense)+'%' : '');
				output.push(Monster.data[i][j].timer ? '<span class="golem-timer">' + makeTimer(Monster.data[i][j].timer) + '</span>' : '?');
				output.push(Monster.data[i][j].health===100 ? '?' : '<span class="golem-timer">'+makeTimer(ttk)+'</span>');
			} else {
				output.push('', '', '', '');
			}
			list.push('<tr><td>' + output.join('</td><td>') + '</td></tr>');
		}
	}
	list.push('</tbody></table>');
	$('#golem-dashboard-Monster').html(list.join(''));
};


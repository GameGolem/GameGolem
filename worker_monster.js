/********** Worker.Monster **********
* Automates Monster
*/
var Monster = new Worker('Monster', 'keep_monster keep_monster_active');
Monster.option = {
	fortify: 50,
	choice: 'Random'
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
		label:'Random only (for now)...'
	},{
		id:'choice',
		label:'Attack',
		select:['Random', 'Strongest', 'Weakest', 'Shortest', 'In Turn']
	}
];
Monster.types = {
	colossus: {
		list:'stone_giant_list',
		image:'stone_giant',
		mpool:1
	},
	legion: {
		list:'castle_siege_list',
		image:'castle_siege',
		mpool:3
	},
	raid: {
		list:'deathrune_list2',
		image:'deathrune',
		mpool:1
	},
	serpent: {
		list:'seamonster_list_red',
		image:'seamonster_red',
		mpool:2
	}
};
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
				break;
			}
		}
		if (!uid || !type) {
			GM_debug('Monster: Unknown monster');
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
			GM_debug('Damage: '+dmg);
			if (fort) {
				damage[user] = [dmg, fort];
			} else {
				damage[user] = dmg;
			}
		});
		Monster.data[uid][type].damage = damage;
	} else if (Page.page === 'keep_monster') { // Check monster list
		for (i in Monster.data) {
			for (j in Monster.data[i]) {
				Monster.data[i][j].state = null;
			}
		}
		$('img[src*="dragon_list_btn_"]').each(function(i,el){
			var i, uid = $(el).parent().attr('href').regex(/user=([0-9]+)/i), tmp = $(el).parent().parent().parent().prev().prev().html().regex(/graphics\/(.*)\./i), type = 'unknown';
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
			switch($(el).attr('src').regex(/dragon_list_btn_([0-9])/)) {
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
	return false;
};
Monster.work = function(state) {
	var list = [], uid = Monster.option.uid, type = Monster.option.type, btn, best;
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
				if (Monster.data[uid][type].state === 'engage') {
					list.push([uid, type]);
				}
			}
		}
		if (!list.length) {
			return false;
		}
		best = Math.floor(Math.random()*list.length);
		uid  = Monster.option.uid  = list[best][0];
		type = Monster.option.type = list[best][1];
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
		btn = $('input[src$="attack_monster_button3.jpg"],input[src$="seamonster_fortify.gif"]').eq(0);
	} else {
		if (!Generals.to(Generals.best('duel'))) {
			return true;
		}
		GM_debug('Monster: Attack '+uid);
		btn = $('input[src$="attack_monster_button2.jpg"],input[src$="seamonster_power.gif"],input[src$="attack_monster_button.jpg"]').eq(0);
	}
	if (!btn.length && !Page.to('keep_monster', '?user='+uid+'&mpool='+Monster.types[type].mpool)) {
		return true; // Reload if we can't find the button
	}
	Page.click(btn);
	return true;
};


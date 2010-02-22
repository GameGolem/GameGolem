/********** Worker.Monster **********
* Automates Monster
*/
var Monster = new Worker('Monster', 'keep_monster keep_monster_active');
Monster.option = {
	fortify: 50,
	choice: 'Random'
};
Monster.uid = null;
Monster.display = function() {
	var panel = new Panel(this.name);
	panel.info('Work in progress...');
	panel.select('fortify', 'Fortify Below:', [10, 20, 30, 40, 50, 60, 70, 80, 90, 100], {after:'%'});
	panel.info('Random only...');
	panel.select('choice', 'Attack:', ['Random', 'Strongest', 'Weakest']);
	return panel.show;
};
Monster.parse = function(change) {
	var i, user, $health, $defense, damage;
	if (Page.page === 'keep_monster_active') { // In a monster
//	if ($('input[src$="attack_monster_button2.jpg"]').length || $('input[src$="attack_monster_button3.jpg"]').length) { // In a monster
		user = $('img[linked="true"][size="square"]').attr('uid');
		$health = $('img[src$="monster_health_background.jpg"]').parent();
		Monster.data[user].health = Math.ceil($health.width() / $health.parent().width() * 100);
		if ($('img[src$="seamonster_ship_health.jpg"]').length) {
			$defense = $('img[src$="seamonster_ship_health.jpg"]').parent();
			Monster.data[user].defense = Math.ceil($defense.width() / ($defense.width() + $defense.next().width()) * 100);
		}
		Monster.data[user].timer = $('#app'+APP+'_monsterTicker').text().parseTimer();
		damage = {};
		$('td.dragonContainer table table a[href^="http://apps.facebook.com/castle_age/keep.php?user="]').each(function(i,el){
			var uid = $(el).attr('href').regex(/user=([0-9]+)/i);
			damage[uid] = parseInt($(el).parent().next().text().replace(/[^0-9]/g,''), 10);
		});
		Monster.data[user].damage = damage;
//		GM_debug('Raid: '+Raid.data[user].toSource());
	} else if (Page.page === 'keep_monster') { // Check monster list
		for (i in Monster.data) {
			Monster.data[i].state = null;
		}
		$('img[src*="dragon_list_btn_"]').each(function(i,el){
			var user = $(el).parent().attr('href').regex(/user=([0-9]+)/i);
			if (!Monster.data[user]) {
				Monster.data[user] = {};
			}
			switch($(el).attr('src').regex(/dragon_list_btn_([0-9])/)) {
				case 2: Monster.data[user].state = 'reward'; break;
				case 3: Monster.data[user].state = 'engage'; break;
				case 4: Monster.data[user].state = 'complete'; break;
				default: Monster.data[user].state = 'unknown'; break; // Should probably delete, but keep it on the list...
			}
			switch($(el).parent().parent().parent().prev().prev().html().regex(/graphics\/(.*)\./i)) {
				case 'castle_siege_list':	Monster.data[user].type = 'legion'; break;
				case 'stone_giant_list':	Monster.data[user].type = 'colossus'; break;
				case 'seamonster_list_red':	Monster.data[user].type = 'serpent'; break;
				case 'deathrune_list2':		Monster.data[user].type = 'raid'; break;
				default: Monster.data[user].type = 'unknown'; break;
			}
		});
		for (i in Monster.data) {
			if (!Monster.data[i].state) {
				delete Monster.data[i];
			}
		}
	}
	return false;
};
Monster.work = function(state) {
	var list = [], uid, btn, i;
	if (!state) {
		Monster.uid = null;
	}
	if (!length(Monster.data) || Player.data.health <= 10) {
		return false;
	}
	if (!Monster.uid || !Monster.data[Monster.uid] || Monster.data[Monster.uid] !== 'engage') {
		Monster.uid = null;
		for (i in Monster.data) {
			if (Monster.data[i].state === 'engage') {
				list.push(i);
			}
		}
		if (!list.length) {
			return false;
		}
		Monster.uid = list[Math.floor(Math.random()*list.length)];
	}
	if (Queue.burn.stamina < 5) {
		if (Queue.burn.energy < 10 || typeof Monster.data[Monster.uid].defense === 'undefined' || Monster.data[Monster.uid].defense >= Monster.option.fortify) {
			return false;
		}
	}
	if (!state) {
		return true;
	}
	if (Monster.data[Monster.uid].defense && Monster.data[Monster.uid].defense <= Monster.option.fortify && Queue.burn.energy >= 10) {
		if (!Generals.to(Generals.best('defend'))) {
			return true;
		}
		GM_debug('Monster: Fortify '+Monster.uid);
		btn = $('input[src$="attack_monster_button3.jpg"]:first');
	} else {
		if (!Generals.to(Generals.best('duel'))) {
			return true;
		}
		GM_debug('Monster: Attack '+Monster.uid);
		btn = $('input[src$="attack_monster_button2.jpg"]:first');
	}
	if (!btn.length && !Page.to('keep_monster', '?user='+Monster.uid+'&mpool=3')) {
		return true; // Reload if we can't find the button
	}
	Page.click(btn);
	return true;
};


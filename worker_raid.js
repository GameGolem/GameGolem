/********** Worker.Raid **********
* Automates Raids
*/
Raid = new Worker('Raid', 'battle_raid', {stamina:true});
Raid.onload = function() {
	if (!Raid.option.type) Raid.option.type = 'Invade';
}
Raid.display = function() {
	var panel = new Panel(this.name);
	panel.info('In progress...');
	panel.select('type', 'Attack Type:', ['Invade', 'Duel']);
	panel.general('general', 'General:');
	return panel.show;
}
Raid.parse = function(change) {
	if ($('input[name="help with raid"]').length) { // In a raid
		var user = $('img[linked="true"][size="square"]').attr('uid');
		var $health = $('img[src$="monster_health_background.jpg"]').parent();
		Raid.data[user].health = Math.ceil($health.width() / $health.parent().width() * 100);
		Raid.data[user].timer = $('#app'+APP+'_monsterTicker').text().parseTimer();
		var damage = {};
		$('td.dragonContainer table table a[href^="http://apps.facebook.com/castle_age/keep.php?user="]').each(function(i,el){
			var uid = $(el).attr('href').regex(/user=([0-9]+)/i);
			damage[uid] = parseInt($(el).parent().next().text().replace(/[^0-9]/g,''));
		});
		Raid.data[user].damage = damage;
//		GM_debug('Raid: '+Raid.data[user].toSource());
	} else { // Check raid list
		var data = {};
		$('img[src$="dragon_list_btn_3.jpg"]').each(function(i,el){
			var user = $(el).parent().attr('href').regex(/user=([0-9]+)/i);
			data[user] = {};
		});
		for (var i in data) if (!Raid.data[i]) Raid.data[i] = {};
		for (var i in Raid.data) if (!data[i]) delete Raid.data[i];
	}
	return false;
}
Raid.work = function(state) {
	if (!length(Raid.data)) return false;
	if (Player.data.health <= 10) return false;
	var best = null;
	for (var i in Raid.data) {
		best = i;
	}
	if (!best) return false;
	if (!state) return true;
	if (!Generals.to(Raid.option.general)) return true;
	if (Raid.option.type == 'Invade') var btn = $('input[src$="raid_attack_button.gif"]:first');
	else var btn = $('input[src$="raid_attack_button2.gif"]:first');
	if (!btn.length && !Page.to('battle_raid', '?user='+best)) return true;
	//http://image2.castleagegame.com/1288/graphics/raid_attack_button.gif
	if (Raid.option.type == 'Invade') var btn = $('input[src$="raid_attack_button.gif"]:first');
	else var btn = $('input[src$="raid_attack_button2.gif"]:first');
	Page.click(btn);
	return true;
}

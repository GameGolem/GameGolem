/********** Worker.Battle **********
* Battling other players (NOT raid)
*/
Battle = new Worker('Battle', 'battle_battle battle_rank');
Battle.onload = function() {
	if (!Battle.data.user) Battle.data.user = {};
	if (!Battle.data.rank) Battle.data.rank = {};
	if (!Battle.data.points) Battle.data.points = [];
	if (!Battle.option.type) Battle.option.type = 'Invade';
}
Battle.parse = function(change) {
	if (change) return false;
	if (Page.page == 'battle_battle') {
		var data = Battle.data.user;
		for (var i in data) {
			if (Player.data.rank - data[i].rank >= 5) {
				delete data[i]; // Forget low rank - no points
			}
		}
		if (Battle.data.attacking) {
			var uid = Battle.data.attacking;
			if ($('div.results').text().match(/You cannot battle someone in your army/i)) {
				delete data[uid];
			} else if ($('div.results').text().match(/Your opponent is dead or too weak/i)) {
				data[uid].dead = Date.now();
			} else if ($('img[src*="battle_victory"]').length) {
				if (!data[uid].win) data[uid].win = 1;
				else data[uid].win++;
			} else if ($('img[src*="battle_defeat"]').length) {
				if (!data[uid].loss) data[uid].loss = 1;
				else data[uid].loss++;
			} else {
				// Some other message - probably be a good idea to remove the target or something
				// delete data[uid];
			}
			Battle.data.attacking = null;
		}
		Battle.data.points = $('#app'+APP+'_app_body table.layout table table').prev().text().replace(/[^0-9\/]/g ,'').regex(/([0-9]+)\/10([0-9]+)\/10([0-9]+)\/10([0-9]+)\/10([0-9]+)\/10/);
		$('#app'+APP+'_app_body table.layout table table tr:even').each(function(i,el){
			var uid = $('img[uid!=""]', el).attr('uid');
			var info = $('td.bluelink', el).text().trim().regex(/Level ([0-9]+) (.*)/i);
			if (!uid || !info) return;
			if (!data[uid]) data[uid] = {};
			data[uid].name = $('a', el).text().trim();
			data[uid].level = info[0];
			data[uid].rank = Battle.rank(info[1]);
			data[uid].army = $('td.bluelink', el).next().text().regex(/([0-9]+)/);
			data[uid].align = $('img[src*="graphics/symbol_"]', el).attr('src').regex(/symbol_([0-9])/i);
		});
	} else if (Page.page == 'battle_rank') {
		var data = Battle.data.rank = {0:{name:'Squire',points:0}};
		$('tr[height="23"]').each(function(i,el){
			var info = $(el).text().regex(/Rank ([0-9]+) - (.*)\s*([0-9]+)/i);
			data[info[0]] = {name:info[1], points:info[2]};
		});
	}
//	GM_debug('Battle: '+Battle.data.toSource());
	return false;
}
Battle.display = function() {
	var panel = new Panel(this.name);
	panel.info('NOTE: Attacks at a loss up to 5 times more than a win');
	panel.checkbox('general', 'Use Best General');
	panel.select('type', 'Battle Type', ['Invade', 'Duel']);
	panel.checkbox('points', 'Always Get Demi-Points');
	panel.checkbox('monster', 'Fight Monsters First');
	return panel.show;
}
Battle.work = function(state) {
	if (!length(Battle.data.rank)) { // Need to parse it at least once
		if (!state) return true;
		Page.to('battle_battlerank');
	}
	if (!length(Battle.data.points)) { // Need to parse it at least once
		if (!state) return true;
		Page.to('battle_battle');
	}
	if (Player.data.health <= 10 || Queue.burn.stamina < 1) return false;
	var i, points = [], list = [], user = Battle.data.user;
	if (Battle.option.points) for (i=0; i<Battle.data.points.length; i++) if (Battle.data.points[i] < 10) points[i+1] = true;
	if ((!Battle.option.points || !points.length) && Battle.option.monster && Monster.uid) return false;
	for (var i in user) {
		if (user[i].dead && user[i].dead + 1800000 < Date.now()) continue; // If they're dead ignore them for 3m * 10hp = 30 mins
		if ((user[i].win || 0) - (user[i].loss || 0) < 5) continue; // Don't attack someone who wins more often
		if (!Battle.option.points || !points.length || typeof points[user[i].align] !== 'undefined') {
			list.push(i);
		}
	}
	if (!list.length) return false;
	if (!state) return true;
	if (Battle.option.general && !Generals.to(Generals.best(Battle.option.type))) return true;
	if (!Page.to('battle_battle')) return true;
	var uid = list[Math.floor(Math.random() * list.length)];
	GM_debug('Battle: Wanting to attack '+user[uid].name+' ('+uid+')');
	var $form = $('form input[alt="'+Battle.option.type+'"]').first().parents('form');
	if (!$form.length) {
		GM_log('Battle: Unable to find attack buttons, forcing reload');
		Page.to('index');
		return false;
	}
	Battle.data.attacking = uid;
	$('input[name="target_id"]', $form).attr('value', uid)
	Page.click($('input[type="image"]', $form));
	return true;
}
Battle.rank = function(name) {
	for (var i in Battle.data.rank) if (Battle.data.rank[i].name == name) return parseInt(i);
	return 0;
}

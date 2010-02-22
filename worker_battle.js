/********** Worker.Battle **********
* Battling other players (NOT raid)
*/
var Battle = new Worker('Battle', 'battle_battle battle_rank');
Battle.data = {
	user: {},
	rank: {},
	points: {}
};
Battle.option = {
	general: true,
	points: true,
	monster: true,
	type: 'Invade'
};
Battle.display = [
	{
		label:'NOTE: Attacks at a loss up to 5 times more than a win'
	},{
		id:'general',
		label:'Use Best General',
		checkbox:true
	},{
		id:'type',
		label:'Battle Type',
		select:['Invade', 'Duel']
	},{
		id:'points',
		label:'Always Get Demi-Points',
		checkbox:true
	},{
		id:'monster',
		label:'Fight Monsters First',
		checkbox:true
	}
];
Battle.parse = function(change) {
	var i, data, uid, info;
	if (Page.page === 'battle_battle') {
		data = Battle.data.user;
		for (i in data) {
			if (Player.data.rank - data[i].rank >= 5) {
				delete data[i]; // Forget low rank - no points
			}
		}
		if (Battle.data.attacking) {
			uid = Battle.data.attacking;
			if ($('div.results').text().match(/You cannot battle someone in your army/i)) {
				delete data[uid];
			} else if ($('div.results').text().match(/Your opponent is dead or too weak/i)) {
				data[uid].dead = Date.now();
			} else if ($('img[src*="battle_victory"]').length) {
				data[uid].win = (data[uid].win || 0) + 1;
			} else if ($('img[src*="battle_defeat"]').length) {
				data[uid].loss = (data[uid].loss || 0) + 1;
			} else {
				// Some other message - probably be a good idea to remove the target or something
				// delete data[uid];
			}
			Battle.data.attacking = null;
		}
		Battle.data.points = $('#app'+APP+'_app_body table.layout table table').prev().text().replace(/[^0-9\/]/g ,'').regex(/([0-9]+)\/10([0-9]+)\/10([0-9]+)\/10([0-9]+)\/10([0-9]+)\/10/);
		$('#app'+APP+'_app_body table.layout table table tr:even').each(function(i,el){
			var uid = $('img[uid!==""]', el).attr('uid'), info = $('td.bluelink', el).text().trim().regex(/Level ([0-9]+) (.*)/i);
			if (!uid || !info) {
				return;
			}
			if (!data[uid]) {
				data[uid] = {};
			}
			data[uid].name = $('a', el).text().trim();
			data[uid].level = info[0];
			data[uid].rank = Battle.rank(info[1]);
			data[uid].army = $('td.bluelink', el).next().text().regex(/([0-9]+)/);
			data[uid].align = $('img[src*="graphics/symbol_"]', el).attr('src').regex(/symbol_([0-9])/i);
		});
	} else if (Page.page === 'battle_rank') {
		data = Battle.data.rank = {0:{name:'Squire',points:0}};
		$('tr[height="23"]').each(function(i,el){
			info = $(el).text().regex(/Rank ([0-9]+) - (.*)\s*([0-9]+)/i);
			data[info[0]] = {name:info[1], points:info[2]};
		});
	}
//	GM_debug('Battle: '+Battle.data.toSource());
	return false;
};
Battle.work = function(state) {
	if (Player.data.health <= 10 || Queue.burn.stamina < 1) {
		return false;
	}
	var i, points = [], list = [], user = Battle.data.user, uid, $form;
	if (Battle.option.points) {
		for (i=0; i<Battle.data.points.length; i++) {
			if (Battle.data.points[i] < 10) {
				points[i+1] = true;
			}
		}
	}
	if ((!Battle.option.points || !points.length) && Battle.option.monster && Monster.uid) {
		return false;
	}
	for (i in user) {
		if (user[i].dead && user[i].dead + 1800000 < Date.now()) {
			continue; // If they're dead ignore them for 3m * 10hp = 30 mins
		}
		if ((user[i].win || 0) - (user[i].loss || 0) < 5) {
			continue; // Don't attack someone who wins more often
		}
		if (!Battle.option.points || !points.length || typeof points[user[i].align] !== 'undefined') {
			list.push(i);
		}
	}
	if (!list.length) {
		return false;
	}
	if (!state) {
		return true;
	}
	if (Battle.option.general && !Generals.to(Generals.best(Battle.option.type)) || !Page.to('battle_battle')) {
		return true;
	}
	uid = list[Math.floor(Math.random() * list.length)];
	GM_debug('Battle: Wanting to attack '+user[uid].name+' ('+uid+')');
	$form = $('form input[alt="'+Battle.option.type+'"]').first().parents('form');
	if (!$form.length) {
		GM_log('Battle: Unable to find attack buttons, forcing reload');
		Page.to('index');
		return false;
	}
	Battle.data.attacking = uid;
	$('input[name="target_id"]', $form).attr('value', uid);
	Page.click($('input[type="image"]', $form));
	return true;
};
Battle.rank = function(name) {
	for (var i in Battle.data.rank) {
		if (Battle.data.rank[i].name === name) {
			return parseInt(i, 10);
		}
	}
	return 0;
};


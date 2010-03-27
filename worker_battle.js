/********** Worker.Battle **********
* Battling other players (NOT raid)
*/
var Battle = new Worker('Battle', 'battle_rank battle_battle');
Battle.data = {
	user: {},
	rank: {},
	points: {}
};
Battle.option = {
	general: true,
	points: true,
	monster: true,
	arena:true,
	losses: 5,
	type: 'Invade',
	bp: 'Always'
};

Battle.display = [
	{
		id:'general',
		label:'Use Best General',
		checkbox:true
	},{
		id:'type',
		label:'Battle Type',
		select:['Invade', 'Duel']
	},{
		id:'losses',
		label:'Attack Until',
		select:[1,2,3,4,5,6,7,8,9,10],
		after:'Losses'
	},{
		id:'points',
		label:'Always Get Demi-Points',
		checkbox:true
	},{
		id:'arena',
		label:'Fight in Arena First',
		checkbox:true,
		help:'Only if the Arena is enabled!'
	},{
		id:'monster',
		label:'Fight Monsters First',
		checkbox:true
	},{
		id:'bp',
		label:'Get Battle Points<br>(Clears Cache)',
		select:['Always', 'Never', 'Don\'t Care']
	},{
		id:'cache',
		label:'Limit Cache Length',
		select:[100,200,300,400,500]
	}
];

Battle.parse = function(change) {
	var i, data, uid, info, list = [];
	if (Page.page === 'battle_rank') {
		data = {0:{name:'Squire',points:0}};
		$('tr[height="23"]').each(function(i,el){
			info = $(el).text().regex(/Rank ([0-9]+) - (.*)\s*([0-9]+)/i);
			data[info[0]] = {name:info[1], points:info[2]};
		});
		if (length(data) > length(Battle.data.rank)) {
			Battle.data.rank = data;
		}
	} else if (Page.page === 'battle_battle') {
		data = Battle.data.user;
		if (Battle.data.attacking) {
			uid = Battle.data.attacking;
			if ($('div.results').text().match(/You cannot battle someone in your army/i)) {
				delete data[uid];
			} else if ($('div.results').text().match(/Your opponent is dead or too weak/i)) {
				data[uid].hide = (data[uid].hide || 0) + 1;
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
		Battle.data.points = $('#app'+APPID+'_app_body table.layout table table').prev().text().replace(/[^0-9\/]/g ,'').regex(/([0-9]+)\/10([0-9]+)\/10([0-9]+)\/10([0-9]+)\/10([0-9]+)\/10/);
		$('#app'+APPID+'_app_body table.layout table table tr:even').each(function(i,el){
			var uid = $('img[uid!==""]', el).attr('uid'), info = $('td.bluelink', el).text().trim().regex(/Level ([0-9]+) (.*)/i), rank;
			if (!uid || !info) {
				return;
			}
			rank = Battle.rank(info[1]);
			if ((Battle.option.bp === 'Always' && Player.get('rank') - rank > 5) || (!Battle.option.bp === 'Never' && Player.get('rank') - rank <= 5)) {
				return;
			}
			if (!data[uid]) {
				data[uid] = {};
			}
			data[uid].name = $('a', el).text().trim();
			data[uid].level = info[0];
			data[uid].rank = rank;
			data[uid].army = $('td.bluelink', el).next().text().regex(/([0-9]+)/);
			data[uid].align = $('img[src*="graphics/symbol_"]', el).attr('src').regex(/symbol_([0-9])/i);
		});
		for (i in data) { // Forget low or high rank - no points or too many points
			if ((Battle.option.bp === 'Always' && Player.get('rank') - data[i].rank > 5) || (!Battle.option.bp === 'Never' && Player.get('rank') - data[i].rank <= 5)) {
				delete data[i];
			}
		}
		if (length(Battle.data.user) > Battle.option.cache) { // Need to prune our attack cache
			debug('Battle: Pruning target cache');
			for (i in data) {
				list.push(i);
			}
			list.sort(function(a,b) {
				var weight = 0;
					 if (((data[a].win || 0) - (data[a].loss || 0)) < ((data[b].win || 0) - (data[b].loss || 0))) { weight += 10; }
				else if (((data[a].win || 0) - (data[a].loss || 0)) > ((data[b].win || 0) - (data[b].loss || 0))) { weight -= 10; }
					 if ((data[a].hide || 0) > (data[b].hide || 0)) { weight += 1; }
				else if ((data[a].hide || 0) < (data[b].hide || 0)) { weight -= 1; }
					 if (data[a].army > data[b].army) { weight += 1; }
				else if (data[a].army < data[b].army) { weight -= 1; }
				if (Battle.option.bp === 'Always') { weight += (data[b].rank - data[a].rank) / 2; }
				if (Battle.option.bp === 'Never') { weight += (data[a].rank - data[b].rank) / 2; }
				weight += (data[a].level - data[b].level) / 10;
				return weight;
			});
			while (list.length > Battle.option.cache) {
				delete data[list.pop()];
			}
		}
	}
	return false;
};

Battle.update = function(type) {
	Dashboard.change(Battle);
}

Battle.work = function(state) {
	if (Player.get('health') <= 10 || Queue.burn.stamina < 1) {
		return false;
	}
	this._load();
	var i, points = [], list = [], user = Battle.data.user, uid, $form;
	if (Battle.option.points) {
		for (i=0; i<Battle.data.points.length; i++) {
			if (Battle.data.points[i] < 10) {
				points[i+1] = true;
			}
		}
	}
	if ((!Battle.option.points || !points.length) && ((Battle.option.monster && Monster.count) || (Battle.option.arena && Arena.option.enabled))) {
		return false;
	}
	for (i in user) {
		if (user[i].dead && user[i].dead + 1800000 >= Date.now()) {
			continue; // If they're dead ignore them for 3m * 10hp = 30 mins
		}
		if ((user[i].loss || 0) - (user[i].win || 0) >= Battle.option.losses) {
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
	debug('Battle: Wanting to attack '+user[uid].name+' ('+uid+')');
	$form = $('form input[alt="'+Battle.option.type+'"]').first().parents('form');
	if (!$form.length) {
		log('Battle: Unable to find attack buttons, forcing reload');
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

Battle.order = [];
Battle.dashboard = function(sort, rev) {
	this._load();
	var i, o, points = [0, 0, 0, 0, 0, 0], demi = ['Ambrosia', 'Malekus', 'Corvintheus', 'Aurora', 'Azeron'], list = [], output, sorttype = ['align', 'name', 'level', 'rank', 'army', 'win', 'loss', 'hide'];
	for (i in Battle.data.user) {
		points[Battle.data.user[i].align]++;
	}
	if (typeof sort === 'undefined') {
		Battle.order = [];
		for (i in Battle.data.user) {
			Battle.order.push(i);
		}
		sort = 1; // Default = sort by name
	}
	if (typeof sorttype[sort] === 'string') {
		Battle.order.sort(function(a,b) {
			var aa = (Battle.data.user[a][sorttype[sort]] || 0), bb = (Battle.data.user[b][sorttype[sort]] || 0);
			if (typeof aa === 'string' || typeof bb === 'string') {
				return (rev ? bb > aa : bb < aa);
			}
			return (rev ? aa - bb : bb - aa);
		});
	}
	list.push('<div style="text-align:center;"><strong>Targets:</strong> '+length(Battle.data.user)+', <strong>By Alignment:</strong>');
	for (i=1; i<6; i++ ) {
		list.push(' <img src="' + imagepath + 'symbol_tiny_' + i +'.jpg" alt="'+demi[i-1]+'" title="'+demi[i-1]+'"> '+points[i]);
	}
	list.push('</div><hr>');
	list.push('<table cellspacing="0" style="width:100%"><thead><th>Align</th><th>Name</th><th>Level</th><th>Rank</th><th>Army</th><th>Wins</th><th>Losses</th><th>Hides</th></tr></thead><tbody>');
	for (o=0; o<Battle.order.length; o++) {
		i = Battle.order[o];
		output = [];
		output.push('<img src="' + imagepath + 'symbol_tiny_' + Battle.data.user[i].align+'.jpg" alt="'+Battle.data.user[i]+'">');
		output.push('<span title="'+i+'">' + Battle.data.user[i].name + '</span>');
		output.push(Battle.data.user[i].level);
		output.push(Battle.data.rank[Battle.data.user[i].rank] ? Battle.data.rank[Battle.data.user[i].rank].name : '');
		output.push(Battle.data.user[i].army);
		output.push(Battle.data.user[i].win);
		output.push(Battle.data.user[i].loss);
		output.push(Battle.data.user[i].hide);
		list.push('<tr><td>' + output.join('</td><td>') + '</td></tr>');
	}
	list.push('</tbody></table>');
	$('#golem-dashboard-Battle').html(list.join(''));
	$('#golem-dashboard-Battle thead th').css('cursor', 'pointer').click(function(event){
		Battle.dashboard($(this).prevAll().length, $(this).attr('name')==='sort');
	});
	$('#golem-dashboard-Battle tbody tr td:nth-child(2)').css('text-align', 'left');
	if (typeof sort !== 'undefined') {
		$('#golem-dashboard-Battle thead th:eq('+sort+')').attr('name',(rev ? 'reverse' : 'sort')).append('&nbsp;' + (rev ? '&uarr;' : '&darr;'));
	}
};


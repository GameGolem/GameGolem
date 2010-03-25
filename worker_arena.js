/********** Worker.Arena() **********
* Build your arena army
* Auto-attack Arena targets
*/
var Arena = new Worker('Arena', 'army_viewarmy battle_arena');
Arena.data = {
	army:{},
	user:{}
};

Arena.option = {
	enabled:false,
	general:true,
	losses:5,
	type:'Invade',
	fill:true,
	every:24,
	cache:100,
	checking:null
};

Arena.rank = {
	Brawler:1,
	Swordsman:2,
	Warrior:3,
	Gladiator:4,
	Hero:5,
	Legend:6
};

Arena.knar = {
	1:'Brawler',
	2:'Swordsman',
	3:'Warrior',
	4:'Gladiator',
	5:'Hero',
	6:'Legend'
};

Arena.display = [
	{
		label:'NOTE: Make sure this is disabled if you are not fighting and drag into order relative to the Monster panel!'
	},{
		id:'enabled',
		label:'Arena Enabled',
		checkbox:true
	},{
		id:'general',
		label:'Use Best General',
		checkbox:true
	},{
		id:'type',
		label:'Battle Type',
		select:['Invade', 'Duel']
	},{
		id:'bp',
		label:'Higher Relative Rank<br>(Clears Cache)',
		select:['Always', 'Never', 'Don\'t Care']
	},{
		id:'losses',
		label:'Attack Until',
		select:[1,2,3,4,5,6,7,8,9,10],
		after:'Losses'
	},{
		id:'cache',
		label:'Limit Cache Length',
		select:[50,100,150,200,250]
	},{
		id:'fill',
		label:'Fill Arena Guard',
		checkbox:true
	},{
		id:'every',
		label:'Every',
		select:[1, 2, 3, 6, 12, 24],
		after:'hours'
	},{
		label:'Add UserIDs to prefer them over random army members.'
	},{
		id:'prefer',
		multiple:'number'
	}
];

Arena.parse = function(change) {
	if (Arena.option.checking) {
		$('span.result_body').each(function(i,el){
			if ($(el).text().match(/has not joined in the Arena!/i)) {
				Arena.data.army[Arena.option.checking] = -1;
			} else if ($(el).text().match(/Arena Guard, and they have joined/i)) {
				Arena.data.army[Arena.option.checking] = Date.now() + 86400000; // 24 hours
			} else if ($(el).text().match(/'s Arena Guard is FULL/i)) {
				Arena.data.army[Arena.option.checking] = Date.now() + 3600000; // 1 hour
			} else if ($(el).text().match(/YOUR Arena Guard is FULL/i)) {
				Arena.option.wait = Date.now();
				debug('Arena guard full, wait 24 hours');
			}
		});
		Arena.option.checking = null;
	}
	if (Page.page === 'army_viewarmy') {
		$('img[linked="true"][size="square"]').each(function(i,el){
			Arena.data.army[$(el).attr('uid')] = Arena.data.army[$(el).attr('uid')] || 0;
		});
	} else if (Page.page === 'battle_arena') {
		var i, list = [], data = Arena.data.user;
		if (Arena.data.attacking) {
			uid = Arena.data.attacking;
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
			Arena.data.attacking = null;
		}
		Arena.data.rank = $('#app'+APPID+'_arena_body img[src*="arena_rank"]').attr('src').regex(/arena_rank([0-9]+).gif/i);
		$('#app'+APPID+'_arena_body table tr:odd').each(function(i,el){
			var uid = $('img[uid!==""]', el).attr('uid'), info = $('td.bluelink', el).text().trim().regex(/Level ([0-9]+) (.*)/i), rank;
			if (!uid || !info) {
				return;
			}
			rank = Arena.rank[info[1]];
			if ((Arena.option.bp === 'Always' && Arena.data.rank > rank) || (!Arena.option.bp === 'Never' && Arena.data.rank < rank)) {
				return;
			}
			data[uid] = data[uid] || {};
			data[uid].name = $('a', el).text().trim();
			data[uid].level = info[0];
			data[uid].rank = rank;
			data[uid].army = $('td.bluelink', el).next().text().regex(/([0-9]+)/);
		});
		for (i in data) { // Forget low or high rank - no points or too many points
			if ((Arena.option.bp === 'Always' && Arena.data.rank > data[i].rank) || (!Arena.option.bp === 'Never' && Arena.data.rank < data[i].rank)) {
				delete data[i];
			}
		}
		if (length(Arena.data.user) > Arena.option.cache) { // Need to prune our attack cache
			debug('Arena: Pruning target cache');
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
				if (Arena.option.bp === 'Always') { weight += (data[b].rank - data[a].rank); }
				if (Arena.option.bp === 'Never') { weight += (data[a].rank - data[b].rank); }
				weight += (data[a].level - data[b].level) / 10;
				return weight;
			});
			while (list.length > Arena.option.cache) {
				delete data[list.pop()];
			}
		}
	}
	return false;
};

Arena.update = function(type) {
	if (type === 'data') {
		Dashboard.change(Arena);
	}
}

Arena.work = function(state) {
	var i, j, found = null;
	if (!Arena.option.enabled) {
		return false;
	}
	if (Arena.option.fill && (!Arena.option.wait || (Arena.option.wait + (Arena.option.every * 3600000)) < Date.now())) {
		for(j=0; j < Arena.option.prefer.length; j++) {
			i = Arena.option.prefer[j];
			if (!/[^0-9]/g.test(i)) {
				Arena.data.army[i] = Arena.data.army[i] || 0;
				if (typeof Arena.data.army[i] !== 'number' || (Arena.data.army[i] !== -1 && Arena.data.army[i] < Date.now())) {
					found = i;
					break;
				}
			}
		}
		if (!found) {
			for(i in Arena.data.army) {
				if (typeof Arena.data.army[i] !== 'number' || (Arena.data.army[i] !== -1 && Arena.data.army[i] < Date.now())) {
					found = i;
					break;
				}
			}
		}
		if (found || !length(Arena.data.army)) {
			if (!state) {
				return true;
			}
			if (!found && !length(Arena.data.army) && !Page.to('army_viewarmy')) {
				return true;
			}
			debug('Arena: Add member '+found);
			//http://apps.facebook.com/castle_age/arena.php?user=00000&lka=00000&agtw=1&ref=nf
			Arena.option.checking = found;
			if (!Page.to('battle_arena', '?user=' + found + '&lka=' + found + '&agtw=1&ref=nf')) {
				return true;
			}
		}
	}
	if (Player.data.health <= 10 || Queue.burn.stamina < 5) {
		return false;
	}
	var i, points = [], list = [], user = Arena.data.user, uid, $form;
	for (i in user) {
		if (user[i].dead && user[i].dead + 1800000 >= Date.now()) {
			continue; // If they're dead ignore them for 3m * 10hp = 30 mins
		}
		if ((user[i].loss || 0) - (user[i].win || 0) >= Arena.option.losses) {
			continue; // Don't attack someone who wins more often
		}
		list.push(i);
	}
	if (!list.length) {
		return false;
	}
	if (!state) {
		return true;
	}
	if (Arena.option.general && !Generals.to(Generals.best(Arena.option.type)) || !Page.to('battle_arena')) {
		return true;
	}
	uid = list[Math.floor(Math.random() * list.length)];
	debug('Arena: Wanting to attack '+user[uid].name+' ('+uid+')');
	$form = $('form input[alt="'+Arena.option.type+'"]').first().parents('form');
	if (!$form.length) {
		log('Arena: Unable to find attack buttons, forcing reload');
		Page.to('index');
		return false;
	}
	Arena.data.attacking = uid;
	$('input[name="target_id"]', $form).attr('value', uid);
	Page.click($('input[type="image"]', $form));
	return true;
};

Arena.order = [];
Arena.dashboard = function(sort, rev) {
	var i, o, points = [0, 0, 0, 0, 0, 0], list = [], output, sorttype = ['rank', 'name', 'level', 'army', 'win', 'loss', 'hide'];
	if (typeof sort === 'undefined') {
		Arena.order = [];
		for (i in Arena.data.user) {
			Arena.order.push(i);
		}
		sort = 1; // Default = sort by name
	}
	if (typeof sorttype[sort] === 'string') {
		Arena.order.sort(function(a,b) {
			var aa = (Arena.data.user[a][sorttype[sort]] || 0), bb = (Arena.data.user[b][sorttype[sort]] || 0);
			if (typeof aa === 'string' || typeof bb === 'string') {
				return (rev ? bb > aa : bb < aa);
			}
			return (rev ? aa - bb : bb - aa);
		});
	}
	list.push('<div style="text-align:center;"><strong>Rank:</strong> ' + Arena.knar[Arena.data.rank] + ' (' + Arena.data.rank + '), <strong>Targets:</strong> ' + length(Arena.data.user) + ' / ' + Arena.option.cache + '</div><hr>');
	list.push('<table cellspacing="0" style="width:100%"><thead><th>Rank</th><th>Name</th><th>Level</th><th>Army</th><th>Wins</th><th>Losses</th><th>Hides</th></tr></thead><tbody>');
	for (o=0; o<Arena.order.length; o++) {
		i = Arena.order[o];
		output = [];
		output.push('<img style="width:16px;height:16px;" src="' + Player.data.imagepath + 'arena_rank' + Arena.data.user[i].rank+'.gif"> ' + Arena.knar[Arena.data.user[i].rank] + ' (' + Arena.data.user[i].rank + ') ');
		output.push('<span title="'+i+'">' + Arena.data.user[i].name + '</span>');
		output.push(Arena.data.user[i].level);
		output.push(Arena.data.user[i].army);
		output.push(Arena.data.user[i].win);
		output.push(Arena.data.user[i].loss);
		output.push(Arena.data.user[i].hide);
		list.push('<tr><td>' + output.join('</td><td>') + '</td></tr>');
	}
	list.push('</tbody></table>');
	$('#golem-dashboard-Arena').html(list.join(''));
	$('#golem-dashboard-Arena thead th').css('cursor', 'pointer').click(function(event){
		Arena.dashboard($(this).prevAll().length, $(this).attr('name')==='sort');
	});
	$('#golem-dashboard-Arena tbody tr td:nth-child(1)').css('text-align', 'left');
	$('#golem-dashboard-Arena tbody tr td:nth-child(2)').css('text-align', 'left');
	if (typeof sort !== 'undefined') {
		$('#golem-dashboard-Arena thead th:eq('+sort+')').attr('name',(rev ? 'reverse' : 'sort')).append('&nbsp;' + (rev ? '&uarr;' : '&darr;'));
	}
};


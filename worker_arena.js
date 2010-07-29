/********** Worker.Arena() **********
* Build your arena army
* Auto-attack Arena targets
*/
var Arena = new Worker('Arena', 'battle_arena');
Arena.data = {
	user:{},
	points:0,
	rank:0
};

Arena.option = {
	enabled:false,
	general:true,
	losses:5,
	cache:50,
	type:'Invade',
	rank:'None',
	bp:'Don\'t Care',
	army:1,
	level:'Any'
};

Arena.runtime = {
	recheck:false,
	attacking:null,
	tokens:0
};

Arena.rank = {
	Brawler:1,
	Swordsman:2,
	Warrior:3,
	Gladiator:4,
	Hero:5,
	Legend:6,
	Vanguard:7,
	'Alpha Vanguard':8
};

Arena.knar = [
	'None',
	'Brawler',
	'Swordsman',
	'Warrior',
	'Gladiator',
	'Hero',
	'Vanguard',
	'Alpha Vanguard'
];

Arena.display = [
	{
		label:'NOTE: Make sure this is disabled if you are not fighting!<br>You need Stamina to Battle (though it doesn\'t use any)'
	},{
		id:'enabled',
		label:'Enabled',
		checkbox:true
	},{
		id:'general',
 		label:'Use Best General',
		checkbox:true
	},{
		id:'bp',
		label:'Higher Relative Rank<br>(Clears Cache)',
		select:['Always', 'Never', 'Don\'t Care']
	},{
		id:'rank',
		label:'Stop at Rank',
		select:Arena.knar,
		help:'Once you reach this rank it will gain a further 500 points, then check your rank every hour'
	},{
		advanced:true,
		id:'losses',
		label:'Attack Until',
		select:['Ignore',1,2,3,4,5,6,7,8,9,10],
		after:'Losses'
	},{
		advanced:true,
		id:'cache',
		label:'Limit Cache Length',
		select:[50,100,150,200,250]
	},{
		id:'level',
		label:'Target Level Ratio',
		select:['Any', 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.1, 1.2, 1.3, 1.4, 1.5],
		help:'Smaller number for lower target level. Reduce this number if you\'re losing a lot'
	}
];

Arena.init = function() {
	this._revive(360, 'tokens');// Gain more points every 10 minutes
};

Arena.parse = function(change) {
	var data = this.data.user, newrank;
	if ($('#app'+APPID+'_arena_body div div:contains("Arena is over, wait for next season!")').length) {
		// Arena is over for now, so disable and return!
		this.option.enabled = false;
//		$('#' + PREFIX + this.name + '_enabled').attr('checked', false);
//		$('#' + PREFIX + Elite.name + '_arena').attr('checked', false);
//		Elite.set('option.arena', false);
		return false;
	}
	if (this.runtime.attacking) {
		uid = this.runtime.attacking;
		this.runtime.attacking = null;
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
			this.runtime.attacking = uid; // Don't remove target as we've not hit them...
		}
	}
	this.runtime.tokens = $('#app'+APPID+'_arena_token_current_value').text().regex(/([0-9]+)/i);
	this._revive(360, 'tokens');// Gain more points every 10 minutes, restart from now
	newrank = $('#app'+APPID+'_arena_body img[src*="arena2_rank"]').attr('src').regex(/arena2_rank([0-9]+).gif/i);
	this.data.points = $('#app'+APPID+'_arena_body > div:first').text().replace(/,/g,'').regex(/Points: ([0-9]+)/i);
	if (this.data.rank !== newrank) {
		this.data.rank = newrank;
		this.data.rankat = this.data.points;
	}
	$('#app'+APPID+'_arena_body table tr:odd').each(function(i,el){
		var uid = $('img[uid]', el).attr('uid'), info = $('td.bluelink', el).text().trim().regex(/Level ([0-9]+) (.*)/i), rank;
		if (!uid || !info) {
			return;
		}
		rank = Arena.rank[info[1]];
		if ((Arena.option.bp === 'Always' && Arena.data.rank - rank > 0) || (!Arena.option.bp === 'Never' && Arena.data.rank - rank < 0)) {
			return;
		}
		data[uid] = data[uid] || {};
		data[uid].name = $('a', el).text().trim();
		data[uid].level = info[0];
		data[uid].rank = rank;
	});
	return false;
};

Arena.update = function(type, worker) {
	if (type === 'reminder' && !worker) {
		this.runtime.tokens = Math.min(150, this.runtime.tokens + 1);
		return;
	}
	var i, list = [], data = this.data.user, level = Player.get('level');
	// First make check our target list doesn't need reducing
	for (i in data) { // Forget low or high rank - no points or too many points
		if ((this.option.bp === 'Always' && this.data.rank - data[i].rank > 0) || (!this.option.bp === 'Never' && this.data.rank - data[i].rank < 0)) {
			delete data[i];
		}
	}
	if (length(data) > this.option.cache) { // Need to prune our attack cache
//		debug(this.name,'Pruning target cache');
		for (i in data) {
			list.push(i);
		}
		list.sort(function(a,b) {
			var weight = 0;
				 if (((data[a].win || 0) - (data[a].loss || 0)) < ((data[b].win || 0) - (data[b].loss || 0))) { weight += 10; }
			else if (((data[a].win || 0) - (data[a].loss || 0)) > ((data[b].win || 0) - (data[b].loss || 0))) { weight -= 10; }
			if (Arena.option.bp === 'Always') { weight += (data[b].rank - data[a].rank); }
			if (Arena.option.bp === 'Never') { weight += (data[a].rank - data[b].rank); }
			weight += Math.range(-1, (data[b].hide || 0) - (data[a].hide || 0), 1);
			weight += Math.range(-10, ((data[a].level - data[b].level) / 10), 10);
			return weight;
		});
		while (list.length > this.option.cache) {
			delete data[list.pop()];
		}
	}
	// Second choose our next target
	if (!this.option.enabled) {
		this.runtime.attacking = null;
		Dashboard.status(this);
	} else if (this.option.rank !== 'None' && this.data.rank >= this.rank[this.option.rank] && this.data.points - this.data.rankat >= 500) {
		this.runtime.attacking = null;
		Dashboard.status(this, 'Stopped at ' + this.option.rank + ' (' + makeImage('arena') + this.runtime.tokens + ')');
		this.runtime.recheck = (Page.get('battle_arena') + 3600000 < Date.now());
	} else {
		if (!this.runtime.attacking || !data[this.runtime.attacking]
		|| (this.option.level !== 'Any' && (data[this.runtime.attacking].level / level) > this.option.level)) {
			list = [];
			for (i in data) {
				if ((data[i].dead && data[i].dead + 1800000 >= Date.now()) // If they're dead ignore them for 3m * 10hp = 30 mins
				|| (typeof this.option.losses === 'number' && (data[i].loss || 0) - (data[i].win || 0) >= this.option.losses) // Don't attack someone who wins more often
				|| (this.option.level !== 'Any' && (data[i].level / level) > this.option.level)) {
					continue;
				}
				list.push(i);
			}
			if (list.length) {
				i = this.runtime.attacking = list[Math.floor(Math.random() * list.length)];
				Dashboard.status(this, 'Next Target: ' + data[i].name + ' (Level ' + data[i].level + ' ' + this.knar[data[i].rank] + '), ' + list.length + ' / ' + length(data) + ' targets (' + makeImage('arena') + this.runtime.tokens + ')');
			} else {
				this.runtime.attacking = null;
				Dashboard.status(this, 'No valid targets found (' + length(data) + ' total) (' + makeImage('arena') + this.runtime.tokens + ')');
			}
		}
	}
}

Arena.work = function(state) {
	// Needs 1 stamina, even though it doesn't use any...
	if (!this.option.enabled || (!this.runtime.recheck && (!this.runtime.attacking || this.runtime.tokens < 10 || Player.get('health',0) < 10 || Player.get('stamina',0) < 1))) {
		return false;
	}
	if (state && this.runtime.recheck && !Page.to('battle_arena')) {
		return true;
	}
	if (!state || this.runtime.recheck || (this.option.general && !Generals.to('war')) || !Page.to('battle_arena')) {
		return true;
	}
	var uid = this.runtime.attacking, $form = $('form input[alt="'+this.option.type+'"]').first().parents('form');;
	debug(this.name,'Wanting to attack '+this.data.user[uid].name+' ('+uid+')');
	if (!$form.length) {
		log(this.name,'Arena: Unable to find attack buttons, forcing reload');
		Page.to('index');
	} else {
		$('input[name="target_id"]', $form).attr('value', uid);
		Page.click($('input[type="image"]', $form));
	}
	return true;
};

Arena.order = [];
Arena.dashboard = function(sort, rev) {
	var i, o, list = [], output = [], sorttype = ['rank', 'name', 'level', 'win', 'loss', 'hide'], data = this.data.user, army = Player.get('army'), level = Player.get('level');
	if (typeof sort === 'undefined') {
		this.order = [];
		for (i in data) {
			this.order.push(i);
		}
		sort = 1; // Default = sort by name
	}
	if (typeof sorttype[sort] === 'string') {
		this.order.sort(function(a,b) {
			var aa = (data[a][sorttype[sort]] || 0), bb = (data[b][sorttype[sort]] || 0);
			if (typeof aa === 'string' || typeof bb === 'string') {
				return (rev ? bb > aa : bb < aa);
			}
			return (rev ? aa - bb : bb - aa);
		});
	}

	list.push('<div style="text-align:center;"><strong>Rank:</strong> ' + this.knar[this.data.rank] + ' (' + this.data.rank + '), <strong>Targets:</strong> ' + length(data) + ' / ' + this.option.cache + ', ' + makeImage('arena') + this.runtime.tokens + '</div><hr>');
	th(output, 'Rank');
	th(output, 'Name');
	th(output, 'Level');
	th(output, 'Wins');
	th(output, 'Losses');
	th(output, 'Hides');
	list.push('<table cellspacing="0" style="width:100%"><thead><tr>' + output.join('') + '</tr></thead><tbody>');
	for (o=0; o<this.order.length; o++) {
		data = this.data.user[this.order[o]];
		output = [];
		td(output, '<img style="width:22px;height:22px;" src="' + imagepath + 'arena2_rank' + data.rank + '.gif">', 'title="' + this.knar[data.rank] + ' (Rank ' + data.rank + ')"');
		th(output, data.name, 'title="'+this.order[o]+'"');
		td(output, (this.option.level !== 'Any' && (data.level / level) > this.option.level) ? '<i>'+data.level+'</i>' : data.level);
		td(output, data.win || '');
		td(output, data.loss || '');
		td(output, data.hide || '');
		tr(list, output.join(''));
	}
	list.push('</tbody></table>');
	$('#golem-dashboard-Arena').html(list.join(''));
	if (typeof sort !== 'undefined') {
		$('#golem-dashboard-Arena thead th:eq('+sort+')').attr('name',(rev ? 'reverse' : 'sort')).append('&nbsp;' + (rev ? '&uarr;' : '&darr;'));
	}
};


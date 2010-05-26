/********** Worker.Battle **********
* Battling other players (NOT raid or Arena)
*/
var Battle = new Worker('Battle');

Battle.settings = {
	stateful:true
};

Battle.defaults = {
	castle_age:{
		pages:'battle_rank battle_battle'
	}
};

Battle.data = {
	user: {},
	rank: {},
	points: {}
};

Battle.option = {
	general:true,
	points:true,
	monster:true,
	arena:false,
	losses:5,
	type:'Invade',
	bp:'Always',
	army:1.1,
	level:1.1,
	preferonly:'Sometimes',
	prefer:[]
};

Battle.runtime = {
	attacking:null
};

Battle.symbol = { // Demi-Power symbols
	1:"data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%16%00%00%00%16%08%03%00%00%00%F3j%9C%09%00%00%00%18PLTE%17%90%B3%1AIn%99%AD%B0%3F%5Erj%7F%8A4%40J%22*1%FF%FF%FFm%0F%82%CD%00%00%00%08tRNS%FF%FF%FF%FF%FF%FF%FF%00%DE%83%BDY%00%00%00%ABIDATx%DAl%91%0B%0E%04!%08CAh%E7%FE7%DE%02%BA3%FBib%A2O%A8%02vm%91%00xN%B6%A1%10%EB%86O%0C%22r%AD%0Cmn%0C%8A%8Drxa%60-%B3p%AF%8C%05%0C%06%15d%E6-%5D%90%8D%E5%90~%B0x%A20e%117%0E%D9P%18%A1%60w%F3%B0%1D%1E%18%1C%85m'D%B9%08%E7%C6%FE%0F%B7%CF%13%C77%1Eo%F4%93%05%AA%24%3D%D9%3F%E1%DB%25%8E%07%BB%CA%D8%9C%8E%FE6%A6J%B9%1F%FB%DAa%8A%BFNW3%B5%9ANc%D5%FEn%9El%F7%20%F6tt%8C%12%F01%B4%CE%F8%9D%E5%B7%5E%02%0C%00n%97%07%B1AU%81%B7%00%00%00%00IEND%AEB%60%82",
	2:"data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%16%00%00%00%16%08%03%00%00%00%F3j%9C%09%00%00%00%18PLTE%E0%0D%0CZ%5B%5Bv%13%0F%2F%1A%16%7Byx%8941DB%3F%FF%FF%FFOmpc%00%00%00%08tRNS%FF%FF%FF%FF%FF%FF%FF%00%DE%83%BDY%00%00%00%B4IDATx%DAT%D1%5B%12%C5%20%08%03P%08%C2%DD%FF%8Eo%12%EB%D8%F2%D1%C7%C1%01%C5%F8%3DQ%05T%9D%BFxP%C6%07%EA%CDF%07p%998%B9%14%C3%C4aj%AE%9CI%A5%B6%875zFL%0F%C8%CD%19vrG%AC%CD%5C%BC%C6nM%D57'%EB%CA%AD%EC%C2%E5b%B5%93%5B%E9%97%99%40D%CC%97sw%DB%FByqwF%83u%FA%F2%C8%A3%93u%A0%FD%8C%B8%BA%96NAn%90%17%C1%C7%E1'%D7%F2%85%01%D4%DC%A7d%16%EDM2%1A%C3%C5%1E%15%7DX%C7%23%19%EB%1El%F5h%B2lV%5B%CF%ED%A0w%89~%AE'%CE%ED%01%F7%CA%5E%FC%8D%BF%00%03%00%AA%CE%08%23%FB4h%C4%00%00%00%00IEND%AEB%60%82",
	3:"data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%16%00%00%00%16%08%03%00%00%00%F3j%9C%09%00%00%00%18PLTE%B1%98g%DE%BCyqpq%8CnF%12%11%0EME7y8%0B%FF%FF%FF6%A1%E73%00%00%00%08tRNS%FF%FF%FF%FF%FF%FF%FF%00%DE%83%BDY%00%00%00%B7IDATx%DA%5C%91Y%16C!%0CB%C9%40%BA%FF%1D%17%7Cz%9Em%BE%F4%8A%19%08%3E%3BX%40%F1%DC%B0%A1%99_xcT%EF(%BC8%D8%CC%9A%A9%D4!%0E%0E%8Bf%863%FE%16%0F%06%5BR%22%02%1C%A0%89%07w%E6T%AC%A8A%F6%C2%251_%9CPG%C2%A1r7N%CB%E1%1CtN%E7%06%86%7F%B85%8B%1A%22%2F%AC%3E%D4%B2_.%9C%C6%EA%B3%E2%C6%BB%24%CA%25uY%98%D5H%0D%EE%922%40b%19%09%CFNs%99%C8Y%E2XS%D2%F3*%0F7%B5%B9%B6%AA%16_%0E%9A%D61V%DCu-%E5%A2g%3BnO%C1%B3%1E%9C%EDiax%94%3F%F87%BE%02%0C%00%98%F2%07%E0%CE%8C%E4%B1%00%00%00%00IEND%AEB%60%82",
	4:"data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%16%00%00%00%16%08%03%00%00%00%F3j%9C%09%00%00%00%18PLTE%90%CA%3CSTRq%9B5On*%10%13%0Dx%7Ct6B'%FF%FF%FFx%0A%94%CE%00%00%00%08tRNS%FF%FF%FF%FF%FF%FF%FF%00%DE%83%BDY%00%00%00%B2IDATx%DAT%D1A%16%C4%20%08%03P%20%92%B9%FF%8D'%80%B5%96%85%AF~%95*%D8o%07%09%90%CF%CC6%96%F5%CA%CD%E0%DAA%BC%0CM%B3C%CBxX%9A%E9%15Z%18%B7QW%E2%DB%9B%3D%E0%CD%99%11%18V%3AM%02%CD%FA%08.%8A%B5%D95%B1%A0%A7%E9Ci%D0%9Cb3%034D%F8%CB(%EE%F8%F0%F1%FA%C5ae9%BB%FD%B0%A7%CF%F9%1Au%9FfR%DB%A3%A19%179%CFa%B1%8E%EB*%91%BE_%B9*M%A9S%B7%97%AE)%15%B5%3F%BAX%A9%0Aw%C9m%9A%A0%CA%AA%20%5Eu%E5%D5%1DL%23%D4%9Eu7%AD%DBvZv%F17%FE%02%0C%00%D3%0A%07%E1%0961%CF%00%00%00%00IEND%AEB%60%82",
	5:"data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%16%00%00%00%16%08%03%00%00%00%F3j%9C%09%00%00%00%18PLTE%F2%F2%EF!!%20%A5%A5%A3vvv%5BZZ%3D%3D%3B%00%00%00%FF%FF%FF.%C4%F9%B3%00%00%00%08tRNS%FF%FF%FF%FF%FF%FF%FF%00%DE%83%BDY%00%00%00%BEIDATx%DA%5C%91Q%92%C30%08C%11B%DE%FB%DFx%25%C7n3%E5%23%E3%3Cd%01%A6%FEN%00%12p%FF%EA%40%A3%05%A7%F0%C6%C2%0A%CCW_%AC%B5%C4%1D9%5D%EC39%09'%B0y%A5%D8%E2H%5D%D53%DDH%E1%E05%A6%9A2'%9Bkcw%40%E9%C5e%5Ev%B6g%E4%B1)%DA%DF%EEQ%D3%A0%25Vw%EC%B9%D5)%C8%5Cob%9C%1E%E2%E2%D8%16%F1%94%F8%E0-%AF%B9%F8x%CB%F2%FE%C8g%1Eo%A03w%CA%86%13%DB%C4%1D%CA%7C%B7%E8w%E4d%FAL%E9%CE%9B%F3%F0%D0g%F8%F0%AD%CFSyD%DC%875%87%3B%B0%D1%5D%C4%D9N%5C%13%3A%EB%A9%F7.%F5%BB%CB%DF%F8%17%60%00%EF%2F%081%0F%2BNZ%00%00%00%00IEND%AEB%60%82"
};
Battle.demi = {
	1:'Ambrosia',
	2:'Malekus',
	3:'Corvintheus',
	4:'Aurora',
	5:'Azeron'
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
		select:['Ignore',1,2,3,4,5,6,7,8,9,10],
		after:'Losses'
	},{
		id:'points',
		label:'Always Get Demi-Points',
		checkbox:true
	},{
//		advanced:true,
//		id:'arena',
//		label:'Fight in Arena First',
//		checkbox:true,
//		help:'Only if the Arena is enabled!'
//	},{
		advanced:true,
		id:'monster',
		label:'Fight Monsters First',
		checkbox:true
	},{
		id:'bp',
		label:'Get Battle Points<br>(Clears Cache)',
		select:['Always', 'Never', 'Don\'t Care']
	},{
		advanced:true,
		id:'cache',
		label:'Limit Cache Length',
		select:[100,200,300,400,500]
	},{
		id:'army',
		label:'Target Army Ratio<br>(Only needed for Invade)',
		select:['Any', 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.1, 1.2, 1.3, 1.4, 1.5],
		help:'Smaller number for smaller target army. Reduce this number if you\'re losing in Invade'
	},{
		id:'level',
		label:'Target Level Ratio<br>(Mainly used for Duel)',
		select:['Any', 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.1, 1.2, 1.3, 1.4, 1.5],
		help:'Smaller number for lower target level. Reduce this number if you\'re losing a lot'
	},{
		advanced:true,
		hr:true,
		title:'Preferred Targets'
	},{
		advanced:true,
		id:'preferonly',
		label:'Fight Preferred',
		select:['Never', 'Sometimes', 'Only', 'Until Dead']
	},{
		advanced:true,
		id:'prefer',
		multiple:'userid'
	}
];

/***** Battle.init() *****
1. Watch Arena and Monster for changes so we can update our target if needed
*/
Battle.init = function() {
//	this._watch(Arena);
	this._watch(Monster);
	this.option.arena = false;// ARENA!!!!!!
};

/***** Battle.parse() *****
1. On the Battle Rank page parse out our current Rank and Battle Points
2. On the Battle page
2a. Check if we've just attacked someone and parse out the results
2b. Parse the current Demi-Points
2c. Check every possible target and if they're eligable then add them to the target list
*/
Battle.parse = function(change) {
	var data, uid, tmp;
	if (Page.page === 'battle_rank') {
		data = {0:{name:'Newbie',points:0}};
		$('tr[height="23"]').each(function(i,el){
			var info = $(el).text().regex(/Rank ([0-9]+) - (.*)\s*([0-9]+)/i);
			data[info[0]] = {name:info[1], points:info[2]};
		});
		this.data.rank = data;
		this.data.bp = $('span:contains("Battle Points.")', 'div:contains("You are a Rank")').text().replace(/,/g, '').regex(/with ([0-9]+) Battle Points/i);
	} else if (Page.page === 'battle_battle') {
		data = this.data.user;
		if (this.runtime.attacking) {
			uid = this.runtime.attacking;
			this.runtime.attacking = null;
			if ($('div.results').text().match(/You cannot battle someone in your army/i)) {
				delete data[uid];
			} else if ($('div.results').text().match(/This trainee is too weak. Challenge someone closer to your level/i)) {
				delete data[uid];
			} else if ($('div.results').text().match(/Your opponent is dead or too weak/i)) {
				data[uid].hide = (data[uid].hide || 0) + 1;
				data[uid].dead = Date.now();
			} else if ($('img[src*="battle_victory"]').length) {
				this.data.bp = $('span.result_body:contains("Battle Points.")').text().replace(/,/g, '').regex(/total of ([0-9]+) Battle Points/i);
				data[uid].win = (data[uid].win || 0) + 1;
				History.add('battle+win',1);
			} else if ($('img[src*="battle_defeat"]').length) {
				data[uid].loss = (data[uid].loss || 0) + 1;
				History.add('battle+loss',-1);
			} else {
				this.runtime.attacking = uid; // Don't remove target as we've not hit them...
			}
		}
		tmp = $('#app'+APPID+'_app_body table.layout table div div:contains("Once a day you can")').text().replace(/[^0-9\/]/g ,'').regex(/([0-9]+)\/10([0-9]+)\/10([0-9]+)\/10([0-9]+)\/10([0-9]+)\/10/);
		if (tmp) {
			this.data.points = tmp;
		}
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
	}
	return false;
};

/***** Battle.update() *****
1. Delete targets who are now too high or too low in rank
2. If our target cache is longer than the user-set limit then prune it
2a. Add every target to an array
2b. Sort the array using weighted values - we want to keep people we win against etc
2c. While the list is too long, delete the extra entries
3. Check if we need to get Battle Points (points.length will be 0 if we don't)
4. Choose our next target
4a. If we don't want points and we want to fight in the arena, then skip
4b. If we don't want points and we want to fight monsters, then skip
4c. Loop through all preferred targets, and add them 10 times
4d. If we need to, now loop through all in target cache and add 1-5 times (more times for higher rank)
4e. Choose a random entry from our list (targets with more entries have more chance of being picked)
5. Update the Status line
*/
Battle.update = function(type) {
	var i, j, data = this.data.user, list = [], points = false, status = [], army = Player.get('army'), level = Player.get('level'), rank = Player.get('rank'), count = 0;

	status.push('Rank ' + Player.get('rank') + ' ' + (Player.get('rank') && this.data.rank[Player.get('rank')].name) + ' with ' + addCommas(this.data.bp || 0) + ' Battle Points, Targets: ' + length(data) + ' / ' + this.option.cache);
	status.push('Demi Points Earned Today: '
	+ '<img src="' + this.symbol[1] +'" alt=" " title="'+this.demi[1]+'" style="width:11px;height:11px;"> ' + (this.data.points[0] || 0) + '/10 '
	+ '<img src="' + this.symbol[2] +'" alt=" " title="'+this.demi[2]+'" style="width:11px;height:11px;"> ' + (this.data.points[1] || 0) + '/10 '
	+ '<img src="' + this.symbol[3] +'" alt=" " title="'+this.demi[3]+'" style="width:11px;height:11px;"> ' + (this.data.points[2] || 0) + '/10 '
	+ '<img src="' + this.symbol[4] +'" alt=" " title="'+this.demi[4]+'" style="width:11px;height:11px;"> ' + (this.data.points[3] || 0) + '/10 '
	+ '<img src="' + this.symbol[5] +'" alt=" " title="'+this.demi[5]+'" style="width:11px;height:11px;"> ' + (this.data.points[4] || 0) + '/10');

	// First make check our target list doesn't need reducing
	for (i in data) { // Forget low or high rank - no points or too many points
		if ((this.option.bp === 'Always' && rank - (data[i].rank || 0) >= 4) || (!this.option.bp === 'Never' && rank - (data[i].rank || 6) <= 5)) { // unknown rank never deleted
			delete data[i];
		}
	}
	if (length(data) > this.option.cache) { // Need to prune our target cache
//		debug('Pruning target cache');
		list = [];
		for (i in data) {
			list.push(i);
		}
		list.sort(function(a,b) {
			var weight = 0;
				 if (((data[a].win || 0) - (data[a].loss || 0)) < ((data[b].win || 0) - (data[b].loss || 0))) { weight += 10; }
			else if (((data[a].win || 0) - (data[a].loss || 0)) > ((data[b].win || 0) - (data[b].loss || 0))) { weight -= 10; }
			if (Battle.option.bp === 'Always') { weight += ((data[b].rank || 0) - (data[a].rank || 0)) / 2; }
			if (Battle.option.bp === 'Never') { weight += ((data[a].rank || 0) - (data[b].rank || 0)) / 2; }
			weight += Math.range(-1, (data[b].hide || 0) - (data[a].hide || 0), 1);
			weight += Math.range(-10, (((data[a].army || 0) - (data[b].army || 0)) / 10), 10);
			weight += Math.range(-10, (((data[a].level || 0) - (data[b].level || 0)) / 10), 10);
			return weight;
		});
		while (list.length > this.option.cache) {
			delete data[list.pop()];
		}
	}
	// Check if we need Demi-points
	points = (this.option.points && this.data.points && sum(this.data.points) < 50);
	// Second choose our next target
/*	if (!points.length && this.option.arena && Arena.option.enabled && Arena.runtime.attacking) {
		this.runtime.attacking = null;
		status.push('Battling in the Arena');
	} else*/
	if (!points && this.option.monster && Monster.get('runtime.uid') && Monster.get('runtime.type')) {
		this.runtime.attacking = null;
		status.push('Attacking Monsters');
	} else {
		if (!this.runtime.attacking || !data[this.runtime.attacking]
		|| (this.option.army !== 'Any' && (data[this.runtime.attacking].army / army) > this.option.army)
		|| (this.option.level !== 'Any' && (data[this.runtime.attacking].level / level) > this.option.level)) {
			this.runtime.attacking = null;
		}
		list = [];
		for(j=0; j<this.option.prefer.length; j++) {
			i = this.option.prefer[j];
			if (!/[^0-9]/g.test(i)) {
				data[i] = data[i] || {};
				if ((data[i].dead && data[i].dead + 300000 >= Date.now()) // If they're dead ignore them for 1hp = 5 mins
				|| (typeof this.option.losses === 'number' && (data[i].loss || 0) - (data[i].win || 0) >= this.option.losses) // Don't attack someone who wins more often
				|| (points && (!data[i].align || this.data.points[data[i].align - 1] >= 10))) {
					continue;
				}
				list.push(i,i,i,i,i,i,i,i,i,i); // If on the list then they're worth at least 10 ;-)
				count++;
			}
		}
		if (this.option.preferonly === 'Never' || this.option.preferonly === 'Sometimes' || (this.option.preferonly === 'Only' && !this.option.prefer.length) || (this.option.preferonly === 'Until Dead' && !list.length)) {
			for (i in data) {
				if ((data[i].dead && data[i].dead + 1800000 >= Date.now()) // If they're dead ignore them for 3m * 10hp = 30 mins
				|| (typeof this.option.losses === 'number' && (data[i].loss || 0) - (data[i].win || 0) >= this.option.losses) // Don't attack someone who wins more often
				|| (this.option.army !== 'Any' && ((data[i].army || 0) / army) > this.option.army)
				|| (this.option.level !== 'Any' && ((data[i].level || 0) / level) > this.option.level)
				|| (points && (!data[i].align || this.data.points[data[i].align - 1] >= 10))) {
					continue;
				}
				for (j=Math.range(1,(data[i].rank || 0)-rank+1,5); j>0; j--) { // more than 1 time if it's more than 1 difference
					list.push(i);
				}
				count++;
			}
		}
		if (!this.runtime.attacking && list.length) {
			this.runtime.attacking = list[Math.floor(Math.random() * list.length)];
		}
		if (this.runtime.attacking) {
			i = this.runtime.attacking;
			status.push('Next Target: ' + data[i].name + ' (Level ' + data[i].level + ' ' + this.data.rank[data[i].rank].name + ' with ' + data[i].army + ' army)' + (count ? ', ' + count + ' valid target' + plural(count) : ''));
		} else {
			this.runtime.attacking = null;
			status.push('No valid targets found');
			this._remind(60); // No targets, so check again in 1 minute...
		}
	}
	Dashboard.status(this, status.join('<br>'));
}

/***** Battle.work() *****
1. If we don't have a target, not enough health, or not enough stamina, return false
2. Otherwise
2a. Ask to work
2b. Get the correct General
2c. Go to the right page
3. Select our target
3a. Replace the first target on the page with the target we want to attack
3b. If we can't find any targets to replace / attack then force a reload
3c. Click the Invade / Dual attack button
*/
Battle.work = function(state) {
	if (!this.runtime.attacking || Player.get('health') < 13 || Queue.burn.stamina < 1) {
//		debug('Not attacking because: ' + (this.runtime.attacking ? '' : 'No Target, ') + 'Health: ' + Player.get('health') + ' (must be >=10), Burn Stamina: ' + Queue.burn.stamina + ' (must be >=1)');
		return false;
	}
	if (!state || (this.option.general && !Generals.to(Generals.best(this.option.type))) || !Page.to('battle_battle')) {
		return true;
	}
	var $form = $('form input[alt="'+this.option.type+'"]').first().parents('form');
	if (!$form.length) {
		debug('Unable to find attack buttons, forcing reload');
		Page.to('index');
	} else {
		log('Battle: Attacking ' + this.data.user[this.runtime.attacking].name + ' (' + this.runtime.attacking + ')');
		$('input[name="target_id"]', $form).attr('value', this.runtime.attacking);
		Page.click($('input[type="image"]', $form));
	}
	return QUEUE_RELEASE;
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
	var i, o, points = [0, 0, 0, 0, 0, 0], list = [], output = [], sorttype = ['align', 'name', 'level', 'rank', 'army', 'win', 'loss', 'hide'], data = this.data.user, army = Player.get('army'), level = Player.get('level');
	for (i in data) {
		points[data[i].align]++;
	}
	if (typeof sort === 'undefined') {
		this.order = [];
		for (i in data) {
			this.order.push(i);
		}
	}
	if (typeof sort === 'undefined') {
		sort = (this.runtime.sort || 1);
	}
	if (typeof rev === 'undefined'){
		rev = (this.runtime.rev || false);
	}
	this.runtime.sort = sort;
	this.runtime.rev = rev;
	if (typeof sorttype[sort] === 'string') {
		this.order.sort(function(a,b) {
			var aa = (data[a][sorttype[sort]] || 0), bb = (data[b][sorttype[sort]] || 0);
			if (typeof aa === 'string' || typeof bb === 'string') {
				return (rev ? bb > aa : bb < aa);
			}
			return (rev ? aa - bb : bb - aa);
		});
	}
	list.push('<div style="text-align:center;"><strong>Rank:</strong> ' + this.data.rank[Player.get('rank')].name + ' (' + Player.get('rank') + '), <strong>Targets:</strong> ' + length(data) + ' / ' + this.option.cache + ', <strong>By Alignment:</strong>');
	for (i=1; i<6; i++ ) {
		list.push(' <img src="' + this.symbol[i] +'" alt="'+this.demi[i]+'" title="'+this.demi[i]+'" style="width:11px;height:11px;"> ' + points[i]);
	}
	list.push('</div><hr>');
	th(output, 'Align');
	th(output, 'Name');
	th(output, 'Level');
	th(output, 'Rank');
	th(output, 'Army');
	th(output, 'Wins');
	th(output, 'Losses');
	th(output, 'Hides');
	list.push('<table cellspacing="0" style="width:100%"><thead><tr>' + output.join('') + '</tr></thead><tbody>');
	for (o=0; o<this.order.length; o++) {
		data = this.data.user[this.order[o]];
		output = [];
		td(output, '<img src="' + this.symbol[data.align] + '" alt="' + this.demi[data.align] + '">', 'title="' + this.demi[data.align] + '"');
		th(output, data.name, 'title="'+i+'"');
		td(output, (this.option.level !== 'Any' && (data.level / level) > this.option.level) ? '<i>'+data.level+'</i>' : data.level);
		td(output, this.data.rank[data.rank] ? this.data.rank[data.rank].name : '');
		td(output, (this.option.army !== 'Any' && (data.army / army) > this.option.army) ? '<i>'+data.army+'</i>' : data.army);
		td(output, data.win || '');
		td(output, data.loss || '');
		td(output, data.hide || '');
		tr(list, output.join(''));
	}
	list.push('</tbody></table>');
	$('#golem-dashboard-Battle').html(list.join(''));
	$('#golem-dashboard-Battle tbody tr td:nth-child(2)').css('text-align', 'left');
	if (typeof sort !== 'undefined') {
		$('#golem-dashboard-Battle thead th:eq('+sort+')').attr('name',(rev ? 'reverse' : 'sort')).append('&nbsp;' + (rev ? '&uarr;' : '&darr;'));
	}
};


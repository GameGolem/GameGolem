/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page, Queue, Resources,
	Battle:true, Generals, LevelUp, Monster, Player,
	APP, APPID, warn, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser, console,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, Divisor, length, unique, deleteElement, sum, findInArray, findInObject, objectIndex, sortObject, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
	makeImage, getImage
*/
/********** Worker.Battle **********
* Battling other players (NOT raid or Arena)
*/
var Battle = new Worker('Battle');

Battle.settings = {
	//taint: true
};

Battle.temp = null;

Battle.defaults['castle_age'] = {
	pages:'battle_rank battle_battle battle_war'
};

Battle.data = {
	user: {},
	rank: {},
	points: {},
	battle: {},
	war: {}
};

Battle.option = {
	general:true,
	general_choice:'any',
	points:'Invade',
	monster:true,
//	arena:false,
	losses:5,
	type:'Invade',
	bp:'Always',
	limit:0,
	chain:0,
	army:1.1,
	level:1.1,
	preferonly:'Sometimes',
	prefer:[],
	between:0,
	risk:false,
	stamina_reserve:0
};

Battle.runtime = {
	attacking:null,
	points:false
};

Battle.symbol = { // Demi-Power symbols
	1:getImage('symbol_1'),
	2:getImage('symbol_2'),
	3:getImage('symbol_3'),
	4:getImage('symbol_4'),
	5:getImage('symbol_5')
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
		advanced:true,
		id:'general_choice',
		label:'Use General',
		require:'!general',
		select:'generals'
	},{
		id:'stamina_reserve',
		label:'Stamina Reserve',
		select:'stamina',
		help:'Keep this much stamina in reserve for other workers.'
	},{
		id:'type',
		label:'Battle Type',
		select:['Invade', 'Duel', 'War'],
		help:'War needs level 100+, and is similar to Duel - though also uses 10 stamina'
	},{
		id:'points',
		label:'Get Demi-Points Type',
		select:['Never', 'Invade', 'Duel'],
		help:'This will make you attack specifically to get Demi-Points every day. War (above) will not earn Demi-Points, but otherwise you will gain them through normal battle - just not necessarily all ten a day'
	},{
		id:'losses',
		label:'Attack Until',
		select:['Ignore',1,2,3,4,5,6,7,8,9,10],
		after:'Losses'
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
		id:'limit',
		before:'<center>Target Ranks</center>',
		require:'bp=="Always"',
		select:'limit_list',
		after: '<center>and above</center>',
		help:'When Get Battle Points is Always, only fights targets at selected rank and above yours.'
	},{
		advanced:true,
		id:'cache',
		label:'Limit Cache Length',
		select:[100,200,300,400,500]
	},{
		advanced:true,
		id:'between',
		label:'Time Between Attacks<br>(On same target)',
		select:{
			0:'none',
			300000:'5 mins',
			900000:'15 mins',
			1800000:'30 mins',
			3600000:'1 hour',
			7200000:'2 hours',
			21600000:'6 hours',
			43200000:'12 hours',
			86400000:'24 hours'
		},
		help:'Stop yourself from being as noticed, but may result in fewer attacks and slower advancement'
	},{
		advanced:true,
		id:'chain',
		label:'Chain after wins',
		select:[1,2,3,4,5,6,7,8,9,10],
		help:'How many times to chain before stopping'
	},{
		advanced:true,
		id:'risk',
		label:'Risk Death',
		checkbox:true,
		help:'The lowest health you can attack with is 10, but you can lose up to 12 health in an attack, so are you going to risk it???'
	},{
		id:'army',
		require:'type=="Invade"',
		label:'Target Army Ratio<br>(Only needed for Invade)',
		select:['Any', 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.1, 1.2, 1.3, 1.4, 1.5],
		help:'Smaller number for smaller target army. Reduce this number if you\'re losing in Invade'
	},{
		id:'level',
		require:'type!="Invade"',
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

Battle.setup = function() {
	Resources.use('Stamina');
};

/***** Battle.init() *****
1. Watch Arena and Monster for changes so we can update our target if needed
*/
Battle.init = function() {
        var i, list, rank, data = this.data.user, mode = this.option.type === 'War' ? 'war' : 'battle';
//	this._watch(Arena);
	this._watch(Monster, 'runtime.attack');
	this._watch(this, 'option.prefer');
	if (typeof this.option.points === 'boolean') {
		this.option.points = this.option.points ? (this.option.type === 'War' ? 'Duel' : this.option.type) : 'Never';
		$(':golem(Battle,points)').val(this.option.points);
	}
	for (i in data) {
		if (data[i].rank) {
			this.set(['data','user',i,'battle','rank'], data[i].rank);
			this.set(['data','user',i,'battle','win'], data[i].win);
			this.set(['data','user',i,'battle','loss'], data[i].loss);
			this.set(['data','user',i,'war','rank'], data[i].war);
			delete data[i].rank;
			delete data[i].win;
			delete data[i].loss;
		}
	}
	if (this.data.rank) {
		this.data.battle.rank = this.data.rank;
		delete this.data.rank;
	}
//	this.option.arena = false;// ARENA!!!!!!
	// make a custom Config type of for rank, based on number so it carries forward on level ups
	list = {};
	rank = Player.get(mode,0);
	if (rank < 4) {
		for (i = rank - 4; i < 0; i++) {
			list[i] = '(' + i + ') ' + this.data[mode].rank[0];
		}
	}
	for (i in this.data[mode].rank){
		list[i - rank] = '(' + (i - rank) + ') ' + this.data[mode].rank[i].name;
	}
	Config.set('limit_list', list);

	// map old "(#) rank" string into the number
	i = this.get('option.limit');
	if (isString(i) && (i = i.regex(/\((-?\d+)\)/))) {
		this.set('option.limit', i);
	}

	$('.Battle-prefer-on').live('click', function(event) {
		Battle._unflush();
		var uid = $(this).attr('name');
		var prefs = Battle.get('option.prefer');
		if (uid && findInArray(prefs, uid)) {
			deleteElement(prefs, uid);
			Battle._taint['option'] = true;
			Battle._notify('option.prefer');
		}
		$(this).removeClass('Battle-prefer-on');
		$(this).attr('title', 'Click to remove from preferred list.');
		$(this).attr('src', getImage('star_off'));
		$(this).addClass('Battle-prefer-off');
	});

	$('.Battle-prefer-off').live('click', function(event) {
		Battle._unflush();
		var uid = $(this).attr('name');
		var prefs = Battle.get('option.prefer');
		if (uid && !findInArray(prefs, uid)) {
			prefs.push(uid);
			Battle._taint['option'] = true;
			Battle._notify('option.prefer');
		}
		$(this).removeClass('Battle-prefer-off');
		$(this).attr('title', 'Click to add to preferred list.');
		$(this).attr('src', getImage('star_on'));
		$(this).addClass('Battle-prefer-on');
	});
};

/***** Battle.parse() *****
1. On the Battle Rank page parse out our current Rank and Battle Points
2. On the Battle page
2a. Check if we've just attacked someone and parse out the results
2b. Parse the current Demi-Points
2c. Check every possible target and if they're eligable then add them to the target list
*/
Battle.parse = function(change) {
	var data, uid, tmp, myrank, mode = this.option.type === 'War' ? 'war' : 'battle';
	if (Page.page === 'battle_rank') {
		data = {0:{name:'Newbie',points:0}};
		$('tr[height="23"]').each(function(i,el){
			var info = $(el).text().regex(/Rank (\d+) - (.*)\s*(\d+)/i);
			data[info[0]] = {name:info[1], points:info[2]};
		});
		this.data.battle.rank = data;
		this.data.battle.bp = $('span:contains("Battle Points.")', 'div:contains("You are a Rank")').text().replace(/,/g, '').regex(/with (\d+) Battle Points/i);
	} else if (Page.page === 'battle_war') {
		data = {0:{name:'Newbie',points:0}};
		$('tr[height="23"]').each(function(i,el){
			var info = $(el).text().regex(/Rank (\d+) - (.*)\s*(\d+)/i);
			data[info[0]] = {name:info[1], points:info[2]};
		});
		this.data.war.rank = data;
	} else if (Page.page === 'battle_battle') {
		data = this.data.user;
		if (this.runtime.attacking) {
			uid = this.runtime.attacking;
			this.runtime.attacking = null;
			if ($('div.results').text().match(/You cannot battle someone in your army/i)) {
				delete data[uid];
			} else if ($('div.results').text().match(/This trainee is too weak. Challenge someone closer to your level/i)) {
				delete data[uid];
			} else if ($('div.results').text().match(/They are too high level for you to attack right now/i)) {
				delete data[uid];
			} else if ($('div.results').text().match(/Their army is far greater than yours! Build up your army first before attacking this player!/i)) {
				delete data[uid];
			} else if ($('div.results').text().match(/Your opponent is dead or too weak/i)) {
				data[uid].hide = (data[uid].hide || 0) + 1;
				data[uid].dead = Date.now();
//			} else if (!$('div.results').text().match(new RegExp(data[uid].name.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&")+"( fought with:|'s Army of (\d+) fought with|'s Defense)",'i'))) {
//			} else if (!$('div.results').text().match(data[uid].name)) {
//				this.runtime.attacking = uid; // Don't remove target as we've hit someone else...
//				console.log(warn(), 'wrong ID');
			} else if ($('img[src*="battle_victory"]').length) {
				this.data[mode].bp = $('span.result_body:contains(" Points.")').text().replace(/,/g, '').regex(/total of (\d+) \w+ Points/i);
				data[uid][mode].win = (data[uid][mode].win || 0) + 1;
				data[uid].last = Date.now();
				History.add('battle+win',1);
				if (this.option.chain && (data[uid][mode].win % this.option.chain)) {
					this.runtime.attacking = uid;
				}
				data[uid].last = Date.now();
				//console.log(warn(), 'win');
			} else if ($('img[src*="battle_defeat"]').length) {
				data[uid][mode].loss = (data[uid][mode].loss || 0) + 1;
				data[uid].last = Date.now();
				History.add('battle+loss',-1);
				//console.log(warn(), 'loss');
			} else {
				this.runtime.attacking = uid; // Don't remove target as we've not hit them...
			}
		}
		tmp = $('#app46755028429_app_body table.layout table div div:contains("Once a day you can")').text().replace(/[^0-9\/]/g ,'').regex(/(\d+)\/10(\d+)\/10(\d+)\/10(\d+)\/10(\d+)\/10/);
		if (tmp) {
			this.data.points = tmp;
		}
		myrank = Player.get(mode,0);
		$('#app46755028429_app_body table.layout table table tr:even').each(function(i,el){
			var uid = $('img[uid!==""]', el).attr('uid'), info = $('td.bluelink', el).text().replace(/[ \t\n]+/g, ' '), battle_rank = info.regex(/Battle:[^(]+\(Rank (\d+)\)/i), war_rank = info.regex(/War:[^(]+\(Rank (\d+)\)/i), rank;
			rank = mode === 'War' ? war_rank : battle_rank;
			if (!uid || !info || (Battle.option.bp === 'Always' && myrank - rank > 5) || (Battle.option.bp === 'Never' && myrank - rank <= 5)) {
				return;
			}
			data[uid] = data[uid] || {};
			data[uid].name = $('a', el).text().trim();
			data[uid].level = info.regex(/\(Level (\d+)\)/i);
			data[uid].battle = data[uid].battle || {};
			data[uid].war = data[uid].war || {};
			data[uid].battle.rank = battle_rank;
			data[uid].war.rank = war_rank;
			data[uid].army = $('td.bluelink', el).next().text().regex(/(\d+)/);
			data[uid].align = $('img[src*="graphics/symbol_"]', el).attr('src').regex(/symbol_(\d)/i);
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
Battle.update = function(event) {
	var i, j, data = this.data.user, list = [], points = false, status = [], army = Player.get('army',0), level = Player.get('level'), mode = this.option.type === 'War' ? 'war' : 'battle', rank = Player.get(mode,0), count = 0, skip, limit, enabled = !this.get(['option', '_disabled'], false);
	status.push('Rank ' + rank + ' ' + (rank && this.data[mode].rank[rank] && this.data[mode].rank[rank].name) + ' with ' + (this.data[mode].bp || 0).addCommas() + ' Battle Points, Targets: ' + length(data) + ' / ' + this.option.cache);
	if (event.type === 'watch' && event.id === 'option.prefer') {
		this.dashboard();
		return;
	}
	if (this.option.points !== 'Never') {
		status.push('Demi Points Earned Today: '
		+ '<img class="golem-image" src="' + this.symbol[1] +'" alt=" " title="'+this.demi[1]+'"> ' + (this.data.points[0] || 0) + '/10 '
		+ '<img class="golem-image" src="' + this.symbol[2] +'" alt=" " title="'+this.demi[2]+'"> ' + (this.data.points[1] || 0) + '/10 '
		+ '<img class="golem-image" src="' + this.symbol[3] +'" alt=" " title="'+this.demi[3]+'"> ' + (this.data.points[2] || 0) + '/10 '
		+ '<img class="golem-image" src="' + this.symbol[4] +'" alt=" " title="'+this.demi[4]+'"> ' + (this.data.points[3] || 0) + '/10 '
		+ '<img class="golem-image" src="' + this.symbol[5] +'" alt=" " title="'+this.demi[5]+'"> ' + (this.data.points[4] || 0) + '/10');
	}
	// First make check our target list doesn't need reducing
        limit = this.option.limit;
	if (!isNumber(limit)) {
		limit = -4;
	}
	for (i in data) { // Forget low or high rank - no points or too many points
		if ((this.option.bp === 'Always' && (data[i][mode].rank|| 0) - rank  <= limit) || (this.option.bp === 'Never' && rank - (data[i][mode].rank || 6) <= 5)) { // unknown rank never deleted
			delete data[i];
		}
	}
	if (length(data) > this.option.cache) { // Need to prune our target cache
//		console.log(warn(), 'Pruning target cache');
		list = [];
		for (i in data) {
/*			weight = Math.range(-10, (data[i][mode].win || 0) - (data[i][mode].loss || 0), 20) / 2;
			if (Battle.option.bp === 'Always') { weight += ((data[i][mode].rank || 0) - rank) / 2; }
			else if (Battle.option.bp === 'Never') { weight += (rank - (data[i][mode].rank || 0)) / 2; }
			weight += Math.range(-1, (data[b].hide || 0) - (data[a].hide || 0), 1);
			weight += Math.range(-10, (((data[a].army || 0) - (data[b].army || 0)) / 10), 10);
			weight += Math.range(-10, (((data[a].level || 0) - (data[b].level || 0)) / 10), 10);
*/
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
        //console.log(warn(), 'Queue Logic = ' + enabled);
	points = this.runtime.points = (this.option.points !== 'Never' && this.data.points && sum(this.data.points) < 50 && enabled);
	// Second choose our next target
/*	if (!points.length && this.option.arena && Arena.option.enabled && Arena.runtime.attacking) {
		this.runtime.attacking = null;
		status.push('Battling in the Arena');
	} else*/
	if (!points && (this.option.monster || Queue.runtime.big) && Monster.get('runtime.attack',false)) {
		this.runtime.attacking = null;
		status.push('Attacking Monsters');
	} else {
		if (!this.runtime.attacking || !data[this.runtime.attacking]
				|| (this.option.army !== 'Any' && (data[this.runtime.attacking].army / army) * (data[this.runtime.attacking].level / level) > this.option.army)
				|| (this.option.level !== 'Any' && (data[this.runtime.attacking].level / level) > this.option.level)
				|| (this.option.type === 'War' 
					&& data[this.runtime.attacking].last 
					&& data[this.runtime.attacking].last + 300000 < Date.now())) {
			this.runtime.attacking = null;
		}
		//console.log(log('data[this.runtime.attacking].last ' + data[this.runtime.attacking].last+ ' Date.now() '+ Date.now()) + ' test ' + (data[this.runtime.attacking].last + 300000 >= Date.now()));
		skip = {};
		list = [];
		for(j=0; j<this.option.prefer.length; j++) {
			i = this.option.prefer[j];
			if (!/\D/g.test(i)) {
				if (this.option.preferonly === 'Never') {
					skip[i] = true;
					continue;
				}
				data[i] = data[i] || {};
				if ((data[i].dead && data[i].dead + 300000 >= Date.now()) // If they're dead ignore them for 1hp = 5 mins
				|| (data[i].last && data[i].last + this.option.between >= Date.now()) // If we're spacing our attacks
				|| (typeof this.option.losses === 'number' && (data[i][mode].loss || 0) - (data[i][mode].win || 0) >= this.option.losses) // Don't attack someone who wins more often
				|| (points && data[i].align && this.data.points[data[i].align - 1] >= 10)) {
					continue;
				}
				list.push(i,i,i,i,i,i,i,i,i,i); // If on the list then they're worth at least 10 ;-)
				count++;
			}
		}
		if (this.option.preferonly === 'Never' || this.option.preferonly === 'Sometimes' || (this.option.preferonly === 'Only' && !this.option.prefer.length) || (this.option.preferonly === 'Until Dead' && !list.length)) {
			for (i in data) {
				if (skip[i] // If filtered out in preferred list
				|| (data[i].dead && data[i].dead + 1800000 >= Date.now()) // If they're dead ignore them for 3m * 10hp = 30 mins
				|| (data[i].last && data[i].last + this.option.between >= Date.now()) // If we're spacing our attacks
				|| (typeof this.option.losses === 'number' && (data[i][mode].loss || 0) - (data[i][mode].win || 0) >= this.option.losses) // Don't attack someone who wins more often
				|| (this.option.army !== 'Any' && ((data[i].army || 0) / army) * (data[i].level || 0) / level > this.option.army && this.option.type === 'Invade')
				|| (this.option.level !== 'Any' && ((data[i].level || 0) / level) > this.option.level && this.option.type !== 'Invade')
				|| (points && (!data[i].align || this.data.points[data[i].align - 1] >= 10))) {
					continue;
				}
				if (Battle.option.bp === 'Always') {
					for (j=Math.range(1,(data[i][mode].rank || 0)-rank+1,5); j>0; j--) { // more than 1 time if it's more than 1 difference
						list.push(i);
					}
				} else {
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
			if (isString(data[i].name) && data[i].name.trim() !== '') {
				j = data[i].name.html_escape();
			} else {
				j = '<i>id:</i> ' + i;
			}
			status.push('Next Target: <img class="golem-image" src="' + this.symbol[data[i].align] +'" alt=" " title="'+this.demi[data[i].align]+'"> ' + j + ' (Level ' + data[i].level + (data[i][mode].rank && this.data[mode].rank[data[i][mode].rank] ? ' ' + this.data[mode].rank[data[i][mode].rank].name : '') + ' with ' + data[i].army + ' army)' + (count ? ', ' + count + ' valid target' + plural(count) : ''));
		} else {
			this.runtime.attacking = null;
			status.push('No valid targets found.');
			this._remind(60); // No targets, so check again in 1 minute...
		}
	}
	Dashboard.status(this, status.join('<br>'));
};

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
	var useable_stamina = Queue.runtime.force.stamina ? Queue.runtime.stamina : Queue.runtime.stamina - this.option.stamina_reserve;
	if (!this.runtime.attacking || Player.get('health',0) < (this.option.risk ? 10 : 13) || useable_stamina < (!this.runtime.points && this.option.type === 'War' ? 10 : 1)) {
//		console.log(warn(), 'Not attacking because: ' + (this.runtime.attacking ? '' : 'No Target, ') + 'Health: ' + Player.get('health',0) + ' (must be >=10), Burn Stamina: ' + useable_stamina + ' (must be >=1)');
		return QUEUE_FINISH;
	}
	if (!state || !Generals.to(this.option.general ? (this.runtime.points ? this.option.points : this.option.type) : this.option.general_choice) || !Page.to('battle_battle')) {
		return QUEUE_CONTINUE;
	}
	/*jslint onevar:false*/
	var $symbol_rows = $('#app46755028429_app_body table.layout table table tr:even').has('img[src*="graphics/symbol_'+this.data.user[this.runtime.attacking].align+'"]');
	var $form = $('form input[alt="' + (this.runtime.points ? this.option.points : this.option.type) + '"]', $symbol_rows).first().parents('form');
	/*jslint onevar:true*/
	if (!$form.length) {
		console.log(warn(), 'Unable to find ' + (this.runtime.points ? this.option.points : this.option.type) + ' button, forcing reload');
		Page.to('index');
	} else {
		console.log(log(), (this.runtime.points ? this.option.points : this.option.type) + ' ' + this.data.user[this.runtime.attacking].name + ' (' + this.runtime.attacking + ')');
		$('input[name="target_id"]', $form).attr('value', this.runtime.attacking);
		Page.click($('input[type="image"]', $form));
	}
	return QUEUE_RELEASE;
};

Battle.rank = function(name) {
	var mode = this.option.type === 'War' ? 'war' : 'battle';
	for (var i in Battle.data[mode].rank) {
		if (Battle.data[mode].rank[i].name === name) {
			return parseInt(i, 10);
		}
	}
	return 0;
};

Battle.order = [];
Battle.dashboard = function(sort, rev) {
	var i, o, points = [0, 0, 0, 0, 0, 0], list = [], output = [], sorttype = ['align', 'name', 'level', 'rank', 'army', '*pref', 'win', 'loss', 'hide'], data = this.data.user, army = Player.get('army',0), level = Player.get('level',0), mode = this.option.type === 'War' ? 'war' : 'battle';
	for (i in data) {
		points[data[i].align]++;
	}
	var prefs = {};
	for (i = 0; i < this.option.prefer.length; i++) {
		prefs[this.option.prefer[i]] = 1;
	}
	var pref_img_on = '<img class="Battle-prefer-on" src="' + getImage('star_on') + '" title="Click to remove from preferred list." name="';
	var pref_img_off = '<img class="Battle-prefer-off" src="' + getImage('star_off') + '" title="Click to add to preferred list." name="';
	var pref_img_end = '">';
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
		var str = '';
		this.order.sort(function(a,b) {
			var aa, bb;
			if (sorttype[sort] === '*pref') {
				aa = prefs[a] || 0;
				bb = prefs[b] || 0;
				str += '\n' + a + ' = ' + aa;
				str += ', ' + b + ' = ' + bb;
			} else {
				aa = data[a][mode][sorttype[sort]] || data[a][sorttype[sort]] || 0;
				bb = data[b][mode][sorttype[sort]] || data[b][sorttype[sort]] || 0;
			}
			if (typeof aa === 'string' || typeof bb === 'string') {
				return (rev ? (''+bb).localeCompare(aa) : (''+aa).localeCompare(bb));
			}
			return (rev ? aa - bb : bb - aa);
		});
	}
	list.push('<div style="text-align:center;"><strong>Rank:</strong> ' + (this.data[mode].rank && this.data[mode].rank[Player.get(mode,0)] ? this.data[mode].rank[Player.get(mode,0)].name : 'unknown') + ' (' + Player.get(mode,0) + '), <strong>Targets:</strong> ' + length(data) + ' / ' + this.option.cache + ', <strong>By Alignment:</strong>');
	for (i=1; i<6; i++ ) {
		list.push(' <img class="golem-image" src="' + this.symbol[i] +'" alt="'+this.demi[i]+'" title="'+this.demi[i]+'"> ' + points[i]);
	}
	list.push('</div><hr>');
	th(output, 'Align');
	th(output, 'Name');
	th(output, 'Level');
	th(output, 'Rank');
	th(output, 'Army');
	th(output, 'Pref');
	th(output, 'Wins');
	th(output, 'Losses');
	th(output, 'Hides');
	list.push('<table cellspacing="0" style="width:100%"><thead><tr>' + output.join('') + '</tr></thead><tbody>');
	for (o=0; o<this.order.length; o++) {
		data = this.data.user[this.order[o]];
		output = [];
		td(output, isNumber(data.align) ? '<img class="golem-image" src="' + this.symbol[data.align] + '" alt="' + this.demi[data.align] + '">' : '', isNumber(data.align) ? 'title="' + this.demi[data.align] + '"' : null);
		th(output, data.name.html_escape(), 'title="'+this.order[o]+'"');
		td(output, (this.option.level !== 'Any' && (data.level / level) > this.option.level) ? '<i>'+data.level+'</i>' : data.level);
		td(output, this.data[mode].rank[data[mode].rank] ? this.data[mode].rank[data[mode].rank].name : '');
		td(output, (this.option.army !== 'Any' && (data.army / army * data.level / level) > this.option.army) ? '<i>'+data.army+'</i>' : data.army);
		td(output, (prefs[this.order[o]] ? pref_img_on : pref_img_off) + this.order[o] + pref_img_end);
		td(output, data[mode].win || '');
		td(output, data[mode].loss || '');
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


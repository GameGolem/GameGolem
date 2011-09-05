/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page, Queue, Resources,
	Battle:true, Generals, LevelUp, Monster, Player,
	APP, APPID, warn, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser, console,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, Divisor, length, sum, findInObject, objectIndex, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
	getImage
*/
/********** Worker.Battle **********
* Battling other players (NOT raid or Arena)
*/
var Battle = new Worker('Battle');

Battle.settings = {
	taint:true
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
	stamina_reserve:0,
	cache:100
};

Battle.runtime = {
	attacking:null,
	points:false,
	chain:0 // Number of times current target chained
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
		title:'Preferred Targets',
		group:[
			{
				id:'preferonly',
				label:'Fight Preferred',
				select:['Never', 'Sometimes', 'Only', 'Until Dead']
			},{
				id:'prefer',
				multiple:'userid'
			}
		]
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
		this.set(['option','points'], this.option.points ? (this.option.type === 'War' ? 'Duel' : this.option.type) : 'Never');
		$(':golem(Battle,points)').val(this.option.points);
	}
/* Old fix for users stored directly in .data - breaks data.battle.rank
	for (i in data) {
		if (!/[^\d]/.test(i) && data[i].rank) {
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
*/
//	this.option.arena = false;// ARENA!!!!!!
	// make a custom Config type of for rank, based on number so it carries forward on level ups
	list = {};
	if (this.get(['data',mode,'rank'])) {
		rank = Player.get(mode, 0);
		for (i in this.data[mode].rank){
			list[i - rank] = '(' + (i - rank) + ') ' + this.data[mode].rank[i].name;
		}
	} else {
		list[0] = '(0) Newbie';
	}
	Config.set('limit_list', list);

	// map old "(#) rank" string into the number
	i = this.get('option.limit');
	if (isString(i) && (i = i.regex(/\((-?\d+)\)/))) {
		this.set(['option','limit'], i);
	}

	// BEGIN: fix up "under level 4" generals
	if (this.option.general_choice === 'under level 4') {
		this.set(['option','general_choice'], 'under max level');
	}
	// END

	$('.Battle-prefer-on').live('click', function(event) {
		Battle._unflush();
		var uid = $(this).attr('name');
		var prefs = Battle.get('option.prefer');
		if (uid && prefs.find(uid)) {
			prefs.remove(uid);
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
		if (uid && !prefs.find(uid)) {
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

/***** Battle.page() *****
1. On the Battle Rank page parse out our current Rank and Battle Points
2. On the Battle page
2a. Check if we've just attacked someone and parse out the results
2b. Parse the current Demi-Points
2c. Check every possible target and if they're eligable then add them to the target list
*/
Battle.page = function(page, change) {
	var i, data, uid, info, $list, $el, tmp, rank, rank2, mode = this.option.type === 'War' ? 'war' : 'battle';
	if (page === 'battle_rank') {
		data = {0:{name:'Newbie',points:0}};
		$('tr[height="23"]').each(function(i,el) {
			var info = $(el).text().regex(/Rank (\d+) - (.*)\s*(\d+)/i);
			data[info[0]] = {name:info[1], points:info[2]};
		});
		this.set(['data','battle','rank'], data);
		this.set(['data','battle','bp'], $('span:contains("Battle Points.")', 'div:contains("You are a Rank")').text().replace(/,/g, '').regex(/with (\d+) Battle Points/i));
	} else if (page === 'battle_war') {
		data = {0:{name:'Newbie',points:0}};
		$('tr[height="23"]').each(function(i,el){
			var info = $(el).text().regex(/Rank (\d+) - (.*)\s*(\d+)/i);
			data[info[0]] = {name:info[1], points:info[2]};
		});
		this.set(['data','war','bp'], $('span:contains("War Points.")', 'div:contains("You are a Rank")').text().replace(/,/g, '').regex(/with (\d+) War Points/i));
		this.set(['data','war','rank'], data);
	} else if (page === 'battle_battle') {
		data = this.data.user;
		if ((uid = this.get(['runtime','attacking']))) {
			tmp = $('div.results').text();
			if ($('img[src*="battle_victory"]').length) {
				if (Player.get('general') === 'Zin'
						&& Generals.get(['data','Zin','charge'],1e99) < Date.now()) {
					Generals.set(['data','Zin','charge'],Date.now() + 82800000);
				}
				if (mode === 'battle') {
					this.set(['data',mode,'bp'], $('span.result_body:contains(" Points.")').text().replace(/,/g, '').regex(/total of (\d+) Battle Points/i));
				}
				this.set(['data','user',uid,mode,'win'], this.get(['data','user',uid,mode,'win'], 0) + 1);
				this.set(['data','user',uid,'last'], Date.now());
				History.add('battle+win',1);
				if (this.option.chain && this.runtime.chain <= this.option.chain) {
					this.set(['runtime','chain'], this.runtime.chain + 1);
				} else { 
					this.set(['runtime','attacking'], null);
					this.set(['runtime','chain'], 0);
				}
			} else if (tmp.match(/You cannot battle someone in your army/i)
					 || tmp.match(/This trainee is too weak. Challenge someone closer to your level/i)
					 || tmp.match(/They are too high level for you to attack right now/i)
					 || tmp.match(/Their army is far greater than yours! Build up your army first before attacking this player!/i)) {
//				log(LOG_DEBUG, 'data[this.runtime.attacking].last ' + data[this.runtime.attacking].last+ ' Date.now() '+ Date.now()) + ' test ' + (data[this.runtime.attacking].last + 300000 < Date.now());
				this.set(['data','user',uid]);
				this.set(['runtime','attacking'], null);
				this.set(['runtime','chain'], 0);
			} else if (tmp.match(/Your opponent is dead or too weak/i)) {
				this.set(['data','user',uid,'hide'], this.get(['data','user',uid,'hide'], 0) + 1);
				this.set(['data','user',uid,'dead'], Date.now());
				this.set(['runtime','attacking'], null);
				this.set(['runtime','chain'], 0);
//			} else if (!$('div.results').text().match(new RegExp(data[uid].name.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&")+"( fought with:|'s Army of (\d+) fought with|'s Defense)",'i'))) {
//			} else if (!$('div.results').text().match(data[uid].name)) {
//				uid = null; // Don't remove target as we've hit someone else...
//				log(LOG_WARN, 'wrong ID');
			} else if ($('img[src*="battle_defeat"]').length) {
				if (Player.get('general') === 'Zin'
						&& Generals.get(['data','Zin','charge'],1e99) < Date.now()) {
					Generals.set(['data','Zin','charge'],Date.now() + 82800000);
				}
				this.set(['runtime','attacking'], null);
				this.set(['runtime','chain'], 0);
				this.set(['data','user',uid,mode,'loss'], this.get(['data','user',uid,mode,'loss'], 0) + 1);
				this.set(['data','user',uid,'last'], Date.now());
				History.add('battle+loss',-1);
			}
		}
		this.set(['data','points'], $('#'+APPID_+'app_body table.layout table div div:contains("Once a day you can")').text().replace(/[^0-9\/]/g ,'').regex(/(\d+)\/10(\d+)\/10(\d+)\/10(\d+)\/10(\d+)\/10/), isArray);
		rank = {
			battle: Player.get('battle',0),
			war: Player.get('war',0)
		}
		$list = $('#'+APPID_+'app_body table.layout table table tr:even');
		for (i=0; i<$list.length; i++) {
			$el = $list[i];
			if (isFacebook) {
				uid = $('img[uid!=""]', $el).attr('uid');
			} else if ((tmp = $('a[href*="keep.php?casuser="]', $el)).length) {
				uid = (tmp.attr('href') || '').regex(/keep\.php\?casuser=(\d+)/i);
			} else if ((tmp = $('img[src*=".fbcdn.net"]', $el)).length) {
				uid = (tmp.attr('src') || '').filepart().regex(/^\d+_(\d+)_\d+_[a-z0-9]+\./i);
			}
			info = $('td.bluelink', $el).text().replace(/\s+/gm, ' ');
			rank2 = {
				battle: info.regex(/Battle:[^(]+\(Rank (\d+)\)/i),
				war: info.regex(/War:[^(]+\(Rank (\d+)\)/i)
			}
			if (uid && info && ((Battle.option.bp === 'Always' && rank2[mode] - rank[mode] >= this.option.limit) || (Battle.option.bp === 'Never' && rank[mode]- rank2[mode] >= 5) || Battle.option.bp === "Don't Care")) {
				this.set(['data','user',uid,'name'], $('a', $el).text().trim());
				this.set(['data','user',uid,'level'], info.regex(/\(Level (\d+)\)/i));
				this.set(['data','user',uid,'battle','rank'], rank2.battle);
				this.set(['data','user',uid,'war','rank'], rank2.war);
				this.set(['data','user',uid,'army'], $('td.bluelink', $el).next().text().regex(/(\d+)/));
				this.set(['data','user',uid,'align'], $('img[src*="graphics/symbol_"]', $el).attr('src').regex(/symbol_(\d)/i));
			}
		}
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
	var i, j, data = this.data.user, list = [], points = false, status = [], army = Player.get('army',0), level = Player.get('level'), mode = this.option.type === 'War' ? 'war' : 'battle', rank = Player.get(mode,0), count = 0, skip, limit, enabled = !this.get(['option', '_disabled'], false), tmp;
	tmp = this.get(['data',mode], {});
	status.push('Rank ' + rank + ' ' + this.get([tmp,'rank',rank,'name'], 'unknown', 'string') + ' with ' + this.get([tmp,'bp'], 0, 'number').addCommas() + ' Battle Points, Targets: ' + length(data) + ' / ' + this.option.cache);
	if (event.type === 'watch' && event.id === 'option.prefer') {
		this.dashboard();
		return;
	}
	if (this.option.points !== 'Never') {
		tmp = this.get(['data','points'],[]);
		status.push('Demi Points Earned Today: '
		+ '<img class="golem-image" src="' + this.symbol[1] +'" alt=" " title="'+this.demi[1]+'"> ' + this.get([tmp,0], 0) + '/10 '
		+ '<img class="golem-image" src="' + this.symbol[2] +'" alt=" " title="'+this.demi[2]+'"> ' + this.get([tmp,1], 0) + '/10 '
		+ '<img class="golem-image" src="' + this.symbol[3] +'" alt=" " title="'+this.demi[3]+'"> ' + this.get([tmp,2], 0) + '/10 '
		+ '<img class="golem-image" src="' + this.symbol[4] +'" alt=" " title="'+this.demi[4]+'"> ' + this.get([tmp,3], 0) + '/10 '
		+ '<img class="golem-image" src="' + this.symbol[5] +'" alt=" " title="'+this.demi[5]+'"> ' + this.get([tmp,4], 0) + '/10');
	}
	// First make check our target list doesn't need reducing
	limit = this.get(['option','limit'], -4, isNumber);
	for (i in data) { // Forget low or high rank - no points or too many points
		tmp = this.get([data,i,mode,'rank'],0);
		if ((this.option.bp === 'Always' && tmp - rank < limit) || (this.option.bp === 'Never' && rank - tmp <= 5)) { // unknown rank never deleted
			this.set(['data','user',i]); // Would be nicer to just ignore "bad" targets until they're naturally pruned...
		}
	}
	if (length(data) > this.option.cache) { // Need to prune our target cache
//		log('Pruning target cache');
		list = [];
		for (i in data) {
			list.push(i);
		}
		list.sort(function(a,b) {
			var weight = 0, aa = data[a], bb = data[b];
			if (((aa.win || 0) - (aa.loss || 0)) < ((bb.win || 0) - (bb.loss || 0))) {
				weight += 10;
			} else if (((aa.win || 0) - (aa.loss || 0)) > ((bb.win || 0) - (bb.loss || 0))) {
				weight -= 10;
			}
			if (Battle.option.bp === 'Always') {
				weight += ((bb.rank || 0) - (aa.rank || 0)) / 2;
			}
			if (Battle.option.bp === 'Never') {
				weight += ((aa.rank || 0) - (bb.rank || 0)) / 2;
			}
			weight += Math.range(-1, (bb.hide || 0) - (aa.hide || 0), 1);
			weight += Math.range(-10, (((aa.army || 0) - (bb.army || 0)) / 10), 10);
			weight += Math.range(-10, (((aa.level || 0) - (bb.level || 0)) / 10), 10);
			return weight;
		});
		while (list.length > this.option.cache) {
			this.set(['data','user',list.pop()]);
		}
	}
	// Check if we need Demi-points
//	log(LOG_WARN, 'Queue Logic = ' + enabled);
	points = this.set(['runtime','points'], this.option.points !== 'Never' && sum(this.get(['data','points'], [0])) < 50 && enabled);
	// Second choose our next target
/*	if (!points.length && this.option.arena && Arena.option.enabled && Arena.runtime.attacking) {
		this.runtime.attacking = null;
		status.push('Battling in the Arena');
	} else*/
	if (!points && (this.option.monster || LevelUp.runtime.big) && Monster.get('runtime.attack',false)) {
		this.set(['runtime','attacking'], null);
		status.push('Attacking Monsters');
	} else {
		if (!this.runtime.attacking || !data[this.runtime.attacking]
		|| (this.option.army !== 'Any' && (data[this.runtime.attacking].army / army) * (data[this.runtime.attacking].level / level) > this.option.army)
		|| (this.option.level !== 'Any' && (data[this.runtime.attacking].level / level) > this.option.level)
		|| (this.option.type === 'War' && data[this.runtime.attacking].last && data[this.runtime.attacking].last + 300000 < Date.now())) {
			this.set(['runtime','attacking'], null);
		}
//		log(LOG_DEBUG, 'data[this.runtime.attacking].last ' + data[this.runtime.attacking].last+ ' Date.now() '+ Date.now()) + ' test ' + (data[this.runtime.attacking].last + 300000 < Date.now());
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
			this.set(['runtime','attacking'], list[Math.floor(Math.random() * list.length)]);
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
			this.set(['runtime','attacking'], null);
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
	var useable_stamina = LevelUp.runtime.force.stamina ? LevelUp.runtime.stamina : LevelUp.runtime.stamina - this.option.stamina_reserve;
	if (!this.runtime.attacking || Player.get('health',0) < (this.option.risk ? 10 : 13) 
			|| useable_stamina < (!this.runtime.points && this.option.type === 'War' ? 10 : 1)
			|| LevelUp.runtime.big) {
//		log(LOG_WARN, 'Not attacking because: ' + (this.runtime.attacking ? '' : 'No Target, ') + 'Health: ' + Player.get('health',0) + ' (must be >=10), Burn Stamina: ' + useable_stamina + ' (must be >=1)');
		return QUEUE_FINISH;
	}
	if (!state || !Generals.to(Generals.runtime.zin || (this.option.general ? (this.runtime.points ? this.option.points : this.option.type) : this.option.general_choice)) || !Page.to('battle_battle')) {
		return QUEUE_CONTINUE;
	}
	/*jslint onevar:false*/
	var $symbol_rows = $('#'+APPID_+'app_body table.layout table table tr:even').has('img[src*="graphics/symbol_'+this.data.user[this.runtime.attacking].align+'"]');
	var $form = $('form input[alt="' + (this.runtime.points ? this.option.points : this.option.type) + '"]', $symbol_rows).first().parents('form');
	/*jslint onevar:true*/
	if (!$form.length) {
		log(LOG_WARN, 'Unable to find ' + (this.runtime.points ? this.option.points : this.option.type) + ' button, forcing reload');
		Page.to('index');
	} else {
		log(LOG_INFO, (this.runtime.points ? this.option.points : this.option.type) + ' ' + this.data.user[this.runtime.attacking].name + ' (' + this.runtime.attacking + ')');
		$('input[name="target_id"]', $form).attr('value', this.runtime.attacking);
		Page.click($('input[type="image"]', $form));
	}
	return QUEUE_RELEASE;
};

Battle.rank = function(name) {
	var i, mode = this.get(['data',this.option.type === 'War' ? 'war' : 'battle','rank'],{});
	for (i in mode) {
		if (this.get([mode,i,'name']) === name) {
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
		td(output, this.get(['data',mode,'rank',data[mode].rank,'name'], '', 'string'));
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


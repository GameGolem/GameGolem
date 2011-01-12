/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page, Queue, Resources,
	Battle, Generals:true, Idle, LevelUp, Player, Town,
	APP, APPID, warn, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser, console,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, Divisor, length, unique, deleteElement, sum, findInArray, findInObject, objectIndex, sortObject, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
	makeImage, bestObjValue,
*/
/********** Worker.Generals **********
* Updates the list of Generals
* Finds best General for other classes
* *** Need to take into account army size and real stats for attack and defense
*/
var Generals = new Worker('Generals');
Generals.temp = null;

Generals.settings = {
	taint:true
};

Generals.defaults['castle_age'] = {
	pages:'* heroes_generals'
};

Generals.runtime = {
	multipliers: {}, // Attack multipliers list for Orc King and Barbarus type generals
	force: false,
	armymax:1 // Don't force someone with a small army to buy a whole load of extra items...
};

Generals.init = function() {
	if (!Player.get('attack') || !Player.get('defense')) { // Only need them the first time...
		this._watch(Player, 'data.attack');
		this._watch(Player, 'data.defense');
	}
	this._watch(Town, 'runtime.invade');
	this._watch(Town, 'runtime.duel');
};

Generals.parse = function(change) {
	var i, j;
	if ($('div.results').text().match(/has gained a level!/i)) {
		// Our stats have changed but we don't care - they'll update as soon as we see the Generals page again...
		this.set(['data',Player.get('general'),'level'], this.get(['data',Player.get('general'),'level'], 0) + 1);
	}
	if (Page.page === 'heroes_generals') {
		var $elements = $('.generalSmallContainer2'), data = {}, bonus = [], current = $('div.general_name_div3').first().text().trim();
		if (this.data[current]){
			$('div[style*="model_items.jpg"] img[title]').each(function(i){
				var temp = $(this).attr('title');
				if (temp && temp.indexOf("[not owned]") === -1){
					bonus.push(temp.replace(/\<[^>]*\>|\s+|\n/g,' ').trim());
					//console.log(warn("Found weapon: " + bonus[bonus.length]));
				}
			});
			this.set(['data',current,'weaponbonus'], bonus.join(', '));
			i = $('div.general_pic_div3 a img[title]').first().attr('title').trim();
			if (i && (j = i.regex(/\bmax\.? (\d+)\b/i))) {
				this.set(['data', current, 'stats', 'cap'], j);
			}
		}
		$elements.each(function(i,el){
			var name = $('.general_name_div3_padding', el).text().trim(), level = parseInt($(el).text().regex(/Level (\d+)/i), 10), x;
			if (name && name.indexOf('\t') === -1 && name.length < 30) { // Stop the "All generals in one box" bug
				data[name] = $.extend(true, {}, Generals.get(['data',name], {}));
				data[name].id		= $('input[name=item]', el).val();
				data[name].type		= $('input[name=itype]', el).val();
				data[name].img		= $('.imgButton', el).attr('src').filepart();
				data[name].att		= $('.generals_indv_stats_padding div:eq(0)', el).text().regex(/(\d+)/);
				data[name].def		= $('.generals_indv_stats_padding div:eq(1)', el).text().regex(/(\d+)/);
				data[name].progress	= parseInt($('div.generals_indv_stats', el).next().children().children().children().next().attr('style').regex(/width: (\d*\.*\d+)%/i), 10);
				data[name].level	= level; // Might only be 4 so far, however...
				data[name].skills	= $(el).children(':last').html().replace(/\<[^>]*\>|\s+|\n/g,' ').trim();
				if (level >= 4 && data[name].priority){	// If we just leveled up to level 4, remove the priority
					data[name].priority = undefined;
				}
			}
		});
		this.set(['data'], data);
	}
	return false;
};

Generals.update = function(event) {
	var data = this.data, i, pa, priority_list = [], list = [], invade = Town.get('runtime.invade',0), duel = Town.get('runtime.duel',0), attack, attack_bonus, defend, defense_bonus, army, gen_att, gen_def, attack_potential, defense_potential, att_when_att_potential, def_when_att_potential, att_when_att = 0, def_when_att = 0, monster_att = 0, monster_multiplier = 1, current_att, current_def, listpush = function(list,i){list.push(i);}, skillcombo, calcStats = false;

	if (event.type === 'init' || event.type === 'data') {
		for (i in this.data) {
			list.push(i);
			if (data[i].level < 4) { // Take all existing priorities and change them to rank starting from 1 and keeping existing order.
				priority_list.push([i, data[i].priority]);
			}
			if (!data[i].stats) { // Force an update if stats not yet calculated
				this.set(['runtime','force'], true);
			}
			if (data[i].skills) {
				var x, num = 0, cap = 541, item, str = null;
				if ((x = data[i].skills.regex(/\bevery (\d+) ([\w\s']*[\w])/i))) {
					num = x[0];
					str = x[1];
				} else if ((x = data[i].skills.regex(/\bevery ([\w\s']*[\w])/i))) {
					num = 1;
					str = x;
				}
				if (data[i].stats && data[i].stats.cap) {
					cap = Math.max(cap, data[i].stats.cap);
				}
				if ((x = data[i].skills.regex(/\bmax\.? (\d+)/i))) {
					cap = Math.max(cap, x);
				}
				if (str) {
					for (x = str.split(' '); x.length > 0; x.pop()) {
						if (Town.get(['data', (str = x.join(' '))])) {
							item = str;
							break;
						}
					}
				}
				if (num * cap && item) {
					Resources.set(['data', '_' + item, 'generals'], num * cap);
					console.log(warn(), 'Save ' + (num * cap) + ' x ' + item + ' for General ' + i);
				}
			}
		}
		// "any" MUST remain lower case - all real generals are capitalised so this provides the first and most obvious difference
		Config.set('generals', ['any','under level 4'].concat(list.sort())); 
	}
	if ((i = priority_list.length)) {
		priority_list.sort(function(a,b) {
			return (a[1] - b[1]);
		});
		this.set(['runtime','max_priority'], i);
		while (i--) {
			this.set(['data',priority_list[i][0],'priority'], parseInt(i, 10)+1);
		}
	}
	
	if (((event.type === 'data' || event.worker.name === 'Town' || event.worker.name === 'Player') && invade && duel) || this.runtime.force) {
		this.set(['runtime','force'], false);
		if (event.worker.name === 'Player' && Player.get('attack') && Player.get('defense')) {
			this._unwatch(Player); // Only need them the first time...
		}
		for (i in data) {
			skillcombo = (data[i].skills || '') + ';' + (data[i].weaponbonus || '');
			attack_bonus = Math.floor(sum(skillcombo.regex(/([-+]?\d*\.?\d+) Player Attack|Increase Player Attack by (\d+)|Convert ([-+]?\d+\.?\d*) Attack/gi)) + (sum(data[i].skills.regex(/Increase ([-+]?\d+\.?\d*) Player Attack for every Hero Owned/gi)) * (length(data)-1)));
			defense_bonus = Math.floor(sum(skillcombo.regex(/([-+]?\d*\.?\d+) Player Defense|Increase Player Defense by (\d+)/gi))	
				+ sum(data[i].skills.regex(/Increase Player Defense by ([-+]?\d*\.?\d+) for every 3 Health/gi)) * Player.get('health') / 3
				+ (sum(data[i].skills.regex(/Increase ([-+]?\d*\.?\d+) Player Defense for every Hero Owned/gi)) * (length(data)-1)));
			attack = (Player.get('attack') + attack_bonus
						- (sum(skillcombo.regex(/Transfer (\d+)% Attack to Defense/gi)) * Player.get('attack') / 100).round(0) 
						+ (sum(skillcombo.regex(/Transfer (\d+)% Defense to Attack/gi)) * Player.get('defense') / 100).round(0));
			defend = (Player.get('defense') + defense_bonus
						+ (sum(skillcombo.regex(/Transfer (\d+)% Attack to Defense/gi)) * Player.get('attack') / 100).round(0) 
						- (sum(skillcombo.regex(/Transfer (\d+)% Defense to Attack/gi)) * Player.get('defense') / 100).round(0));
			attack_potential = Player.get('attack') + (attack_bonus * 4) / data[i].level;	// Approximation
			defense_potential = Player.get('defense') + (defense_bonus * 4) / data[i].level;	// Approximation
			army = Math.min(Player.get('armymax'),(sum(skillcombo.regex(/Increases? Army Limit to (\d+)/gi)) || 501));
			gen_att = getAttDef(data, listpush, 'att', Math.floor(army / 5));
			gen_def = getAttDef(data, listpush, 'def', Math.floor(army / 5));
			att_when_att = sum(skillcombo.regex(/Increase Player Attack when Defending by ([-+]?\d+)/gi));
			def_when_att = sum(skillcombo.regex(/([-+]?\d+) Defense when attacked/gi));
			att_when_att_potential = (att_when_att * 4) / data[i].level;	// Approximation
			def_when_att_potential = (def_when_att * 4) / data[i].level;	// Approximation
			monster_att = sum(skillcombo.regex(/([-+]?\d+) Monster attack/gi));
			monster_multiplier = 1.1 + sum(skillcombo.regex(/([-+]?\d+)% Critical/gi))/100;
			if ((pa = sum(skillcombo.regex(/Increase Power Attacks by (\d+)/gi)))) {
				this.set(['runtime','multipliers',i], pa);
			}
			current_att = data[i].att + parseInt(sum(data[i].skills.regex(/'s Attack by ([-+]?\d+)/gi)), 10) + (typeof data[i].weaponbonus !== 'undefined' ? parseInt(sum(data[i].weaponbonus.regex(/([-+]?\d+) attack/gi)), 10) : 0);	// Need to grab weapon bonuses without grabbing Serene's skill bonus
			current_def = data[i].def + (typeof data[i].weaponbonus !== 'undefined' ? parseInt(sum(data[i].weaponbonus.regex(/([-+]?\d+) defense/gi)), 10) : 0);
//			console.log(warn(i + ' attack: ' + current_att + ' = ' + data[i].att + ' + ' + parseInt((data[i].skills.regex(/'s Attack by ([-+]?\d+)/gi) || 0)) + ' + ' + parseInt((data[i].weaponbonus.regex(/([-+]?\d+) attack/gi) || 0))));
			this.set(['data',i,'invade'], {
				att: Math.floor(invade.attack + current_att + (current_def * 0.7) + ((attack + (defend * 0.7)) * army) + gen_att),
				def: Math.floor(invade.defend + current_def + (current_att * 0.7) + ((defend + def_when_att + ((attack + att_when_att) * 0.7)) * army) + gen_def)
			});
			this.set(['data',i,'stats'], {
				stamina: sum(skillcombo.regex(/Increase Max Stamina by (\d+)|([-+]?\d+) Max Stamina/gi)) 
						+ (sum(skillcombo.regex(/Transfer (\d+)% Max Energy to Max Stamina/gi)) * Player.get('maxenergy') / 100/2).round(0)
						- (sum(skillcombo.regex(/Transfer (\d+)% Max Stamina to Max Energy/gi)) * Player.get('maxstamina') / 100).round(0),
				energy:	sum(skillcombo.regex(/Increase Max Energy by (\d+)|([-+]?\d+) Max Energy/gi))
						- (sum(skillcombo.regex(/Transfer (\d+)% Max Energy to Max Stamina/gi)) * Player.get('maxenergy') / 100).round(0)
						+ (sum(skillcombo.regex(/Transfer (\d+)% Max Stamina to Max Energy/gi)) * Player.get('maxstamina') / 100*2).round(0)
			});
			this.set(['data',i,'duel'], {
				att: Math.floor(duel.attack + current_att + (current_def * 0.7) + attack + (defend * 0.7)),
				def: Math.floor(duel.defend + current_def + (current_att * 0.7) + defend + def_when_att + ((attack + att_when_att) * 0.7))
			});
			this.set(['data',i,'monster'], {
				att: Math.floor(monster_multiplier * (duel.attack + current_att + attack + monster_att)),
				def: Math.floor(duel.defend + current_def + defend) // Fortify, so no def_when_att
			});
/*			if (i === 'Xira' || i === 'Slayer') {
				console.log(warn(i +' skillcombo:'+skillcombo+' regex'+sum(data[i].skills.regex(/Increase Player Defense  by ([-+]?\d+\.?\d*) for every 3 Health/gi))+' attack:'+attack+' defend:'+defend));
			}
*/
			this.set(['data',i,'potential'], {
				bank: (skillcombo.regex(/Bank Fee/gi) ? 1 : 0),
				defense: Math.floor(duel.defend + (data[i].def + 4 - data[i].level) + ((data[i].att + 4 - data[i].level) * 0.7) + defense_potential + def_when_att_potential + ((attack_potential + att_when_att_potential) * 0.7)),
				income: (skillcombo.regex(/Increase Income by (\d+)/gi) * 4) / data[i].level,
				invade: Math.floor(invade.attack + (data[i].att + 4 - data[i].level) + ((data[i].def + 4 - data[i].level) * 0.7) + ((attack_potential + (defense_potential * 0.7)) * army) + gen_att),
				duel: Math.floor(duel.attack + (data[i].att + 4 - data[i].level) + ((data[i].def + 4 - data[i].level) * 0.7) + attack_potential + (defense_potential * 0.7)),
				monster: Math.floor(duel.attack + (data[i].att + 4 - data[i].level) + attack_potential + (monster_att * 4) / data[i].level),
				raid_invade: 0,
				raid_duel: 0,
				influence: (skillcombo.regex(/Influence (\d+)% Faster/gi) || 0),
				drops: (skillcombo.regex(/Chance (\d+)% Drops/gi) || 0),
				demi: (skillcombo.regex(/Extra Demi Points/gi) ? 1 : 0),
				cash: (skillcombo.regex(/Bonus (\d+) Gold/gi) || 0)
			});
			this.set(['data',i,'potential','raid_invade'], data[i].potential.defense + data[i].potential.invade);
			this.set(['data',i,'potential','raid_duel'], data[i].potential.defense + data[i].potential.duel);

			this.set(['runtime','armymax'], Math.max(army, this.runtime.armymax));
		}
	}
};

Generals.to = function(name) {
	this._unflush();
	if (name) {
		name = this.best(name);
	}
	if (!name || Player.get('general') === name || name.toLowerCase() === 'any') {
		return true;
	}
	if (!this.data[name]) {
		console.log(warn('General "'+name+'" requested but not found!'));
		return true; // Not found, so fake it
	}
	if (!this.test(name)) {
		console.log(log('General rejected due to energy or stamina loss: ' + Player.get('general') + ' to ' + name));
		return true;
	}
	console.log(warn('General change: ' + Player.get('general') + ' to ' + name));
	Page.to('heroes_generals', this.data[name].id && this.data[name].type ? {item:this.data[name].id, itype:this.data[name].type} : null, true);
	return false;
};

Generals.test = function(name) {
	Generals._unflush(); // Can't use "this" because called out of context
	var next = isObject(name) ? name : Generals.data[name];
	if (name === 'any') {
		return true;
	} else if (!name || !next) {
		return false;
	} else {
		return (Player.get('maxstamina') + ((next.stats && next.stats.stamina) || 0) >= Player.get('stamina') && Player.get('maxenergy') + ((next.stats && next.stats.energy) || 0) >= Player.get('energy'));
	}
};

Generals.best = function(type) {
	this._unflush();
	if (this.data[type]) {
		return type;
	}
	var rx = '', best = null, bestval = 0, i, value, current = Player.get('general'), first, second;
	switch(type.toLowerCase()) {
	case 'cost':		rx = /Decrease Soldier Cost by (\d+)/gi; break;
	case 'stamina':		rx = /Increase Max Stamina by (\d+)|\+(\d+) Max Stamina/gi; break;
	case 'energy':		rx = /Increase Max Energy by (\d+)|\+(\d+) Max Energy/gi; break;
	case 'income':		rx = /Increase Income by (\d+)/gi; break;
	case 'item':		rx = /(\d+)% Drops for Quest/gi; break;
	case 'influence':	rx = /Bonus Influence (\d+)/gi; break;
	case 'defense':		rx = /([-+]?\d+) Player Defense/gi; break;
	case 'cash':		rx = /Bonus (\d+) Gold/gi; break;
	case 'bank':		return 'Aeris';
	case 'war':			rx = /\+(\d+) Attack to your entire War Council|-(\d+) Attack to your opponents War Council/gi; break;
	case 'raid-invade':		// Fall through
	case 'invade':			first = 'invade';	second = 'att'; break;
	case 'raid-duel':		// Fall through
	case 'duel':			first = 'duel';		second = 'att'; break;
	case 'monster_attack':	first = 'monster';	second = 'att'; break;
	case 'dispel':			// Fall through
	case 'monster_defend':	first = 'monster';	second = 'def'; break;
	case 'defend':			first = 'duel';		second = 'def'; break;
	case 'under level 4':	value = function(g) { return (g.priority ? -g.priority : null); }; break;
	default:  return 'any';
	}
	if (rx) {
		value = function(g) { return sum(g.skills.regex(rx)); };
	} else if (first && second) {
		value = function(g) { return (g[first] ? g[first][second] : null); };
	} else if (!value) {
		console.log(warn('No definition for best general for ' + type));
		return 'any';
	}
	best = bestObjValue(this.data, value, Generals.test);
	return (best || 'any');
};

Generals.order = [];
Generals.dashboard = function(sort, rev) {
	var i, o, output = [], list = [], iatt = 0, idef = 0, datt = 0, ddef = 0, matt = 0, mdef = 0;

	if (typeof sort === 'undefined') {
		this.order = [];
		for (i in this.data) {
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
	if (typeof sort !== 'undefined') {
		this.order.sort(function(a,b) {
			var aa, bb, type, x;
			if (sort === 1) {
				aa = a;
				bb = b;
			} else if (sort === 2) {
				aa = (Generals.data[a].level || 0);
				bb = (Generals.data[b].level || 0);
			} else if (sort === 3) {
				aa = (Generals.data[a].priority || 999999);
				bb = (Generals.data[b].priority || 999999);
			} else {
				type = (sort<6 ? 'invade' : (sort<8 ? 'duel' : 'monster'));
				x = (sort%2 ? 'def' : 'att');
				aa = (Generals.data[a][type] ? (Generals.data[a][type][x] || 0) : 0);
				bb = (Generals.data[b][type] ? (Generals.data[b][type][x] || 0) : 0);
			}
			if (typeof aa === 'string' || typeof bb === 'string') {
				return (rev ? (''+bb).localeCompare(aa) : (''+aa).localeCompare(bb));
			}
			return (rev ? aa - bb : bb - aa);
		});
	}
	for (i in this.data) {
		iatt = Math.max(iatt, this.data[i].invade ? this.data[i].invade.att : 1);
		idef = Math.max(idef, this.data[i].invade ? this.data[i].invade.def : 1);
		datt = Math.max(datt, this.data[i].duel ? this.data[i].duel.att : 1);
		ddef = Math.max(ddef, this.data[i].duel ? this.data[i].duel.def : 1);
		matt = Math.max(matt, this.data[i].monster ? this.data[i].monster.att : 1);
		mdef = Math.max(mdef, this.data[i].monster ? this.data[i].monster.def : 1);
	}
	list.push('<table cellspacing="0" style="width:100%"><thead><tr><th></th><th>General</th><th>Level</th><th>Quest<br>Rank</th><th>Invade<br>Attack</th><th>Invade<br>Defend</th><th>Duel<br>Attack</th><th>Duel<br>Defend</th><th>Monster<br>Attack</th><th>Fortify<br>Dispel</th></tr></thead><tbody>');
	for (o=0; o<this.order.length; o++) {
		i = this.order[o];
		output = [];
		output.push('<a class="golem-link" href="generals.php?item=' + this.data[i].id + '&itype=' + this.data[i].type + '"><img src="' + imagepath + this.data[i].img+'" style="width:25px;height:25px;" title="Skills: ' + this.data[i].skills + ', Weapon Bonus: ' + (typeof this.data[i].weaponbonus !== 'unknown' ? (this.data[i].weaponbonus ? this.data[i].weaponbonus : 'none') : 'unknown') + '"></a>');
		output.push(i);
		output.push('<div'+(isNumber(this.data[i].progress) ? ' title="'+this.data[i].progress+'%"' : '')+'>'+this.data[i].level+'</div><div style="background-color: #9ba5b1; height: 2px; width=100%;"><div style="background-color: #1b3541; float: left; height: 2px; width: '+(this.data[i].progress || 0)+'%;"></div></div>');
		output.push(this.data[i].priority ? ((this.data[i].priority !== 1 ? '<a class="golem-moveup" name='+this.data[i].priority+'>&uarr</a> ' : '&nbsp;&nbsp; ') + this.data[i].priority + (this.data[i].priority !== this.runtime.max_priority ? ' <a class="golem-movedown" name='+this.data[i].priority+'>&darr</a>' : ' &nbsp;&nbsp;')) : '');
		output.push(this.data[i].invade ? (iatt === this.data[i].invade.att ? '<strong>' : '') + (this.data[i].invade.att).addCommas() + (iatt === this.data[i].invade.att ? '</strong>' : '') : '?');
		output.push(this.data[i].invade ? (idef === this.data[i].invade.def ? '<strong>' : '') + (this.data[i].invade.def).addCommas() + (idef === this.data[i].invade.def ? '</strong>' : '') : '?');
		output.push(this.data[i].duel ? (datt === this.data[i].duel.att ? '<strong>' : '') + (this.data[i].duel.att).addCommas() + (datt === this.data[i].duel.att ? '</strong>' : '') : '?');
		output.push(this.data[i].duel ? (ddef === this.data[i].duel.def ? '<strong>' : '') + (this.data[i].duel.def).addCommas() + (ddef === this.data[i].duel.def ? '</strong>' : '') : '?');
		output.push(this.data[i].monster ? (matt === this.data[i].monster.att ? '<strong>' : '') + (this.data[i].monster.att).addCommas() + (matt === this.data[i].monster.att ? '</strong>' : '') : '?');
		output.push(this.data[i].monster ? (mdef === this.data[i].monster.def ? '<strong>' : '') + (this.data[i].monster.def).addCommas() + (mdef === this.data[i].monster.def ? '</strong>' : '') : '?');
		list.push('<tr><td>' + output.join('</td><td>') + '</td></tr>');
	}
	list.push('</tbody></table>');
	$('a.golem-moveup').live('click', function(event){
		var i, gdown, gup, x = parseInt($(this).attr('name'), 10);
		Generals._unflush();
		for(i in Generals.data){
			if (Generals.data[i].priority === x){
				gup = i;
			}
			if (Generals.data[i].priority === (x-1)){
				gdown = i;
			}
		}
		if (gdown && gup) {
			console.log(log('Priority: Swapping '+gup+' with '+gdown));
			Generals.set(['data',gdown,'priority'], Generals.data[gdown].priority + 1);
			Generals.set(['data',gup,'priority'], Generals.data[gup].priority - 1);
		}
//		Generals.dashboard(sort,rev);
		return false;
	});
	$('a.golem-movedown').live('click', function(event){
		var i, gdown, gup, x = parseInt($(this).attr('name'), 10);
		Generals._unflush();
		for(i in Generals.data){
			if (Generals.data[i].priority === x){
				gdown = i;
			}
			if (Generals.data[i].priority === (x+1)) {
				gup = i;
			}
		}
		if (gdown && gup) {
			console.log(log('Priority: Swapping '+gup+' with '+gdown));
			Generals.set(['data',gdown,'priority'], Generals.data[gdown].priority + 1);
			Generals.set(['data',gup,'priority'], Generals.data[gup].priority - 1);
		}
//		Generals.dashboard(sort,rev);
		return false;
	});
	$('#golem-dashboard-Generals').html(list.join(''));
	$('#golem-dashboard-Generals tbody tr td:nth-child(2)').css('text-align', 'left');
	if (typeof sort !== 'undefined') {
		$('#golem-dashboard-Generals thead th:eq('+sort+')').attr('name',(rev ? 'reverse' : 'sort')).append('&nbsp;' + (rev ? '&uarr;' : '&darr;'));
	}
};



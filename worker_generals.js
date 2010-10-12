/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page, Queue, Resources,
	Battle, Generals:true, Idle, LevelUp, Player, Town,
	APP, APPID, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, shortNumber, WorkerByName, WorkerById, Divisor, length, unique, deleteElement, sum, addCommas, findInArray, findInObject, objectIndex, sortObject, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime, ucfirst, ucwords,
	makeImage
*/
/********** Worker.Generals **********
* Updates the list of Generals
* Finds best General for other classes
* *** Need to take into account army size and real stats for attack and defense
*/
var Generals = new Worker('Generals');
Generals.option = null;
Generals.data = {};

Generals.defaults['castle_age'] = {
	pages:'* heroes_generals'
};

Generals.runtime = {
	multipliers: {}, // Attack multipliers list for Orc King and Barbarus type generals
	force: false,
	armymax:1 // Don't force someone with a small army to buy a whole load of extra items...
};

Generals.init = function() {
	for (var i in this.data) {
		if (i.indexOf('\t') !== -1) { // Fix bad page loads...
			delete this.data[i];
		}
	}
	if (!Player.get('attack') || !Player.get('defense')) {
		this._watch(Player); // Only need them the first time...
	}
	this.runtime.force = true; // Flag to force initial re-read of general skills to catch new terms
	this._watch(Town);
};

Generals.parse = function(change) {
	if ($('div.results').text().match(/has gained a level!/i)) {
		this.data[Player.get('general')].level++; // Our stats have changed but we don't care - they'll update as soon as we see the Generals page again...
	}
	if (Page.page === 'heroes_generals') {
		var $elements = $('.generalSmallContainer2'), data = this.data, weapon_bonus = '', current = $('div.general_name_div3').first().text().trim();

		$('div[style*="model_items.jpg"] img[title]').each(function(i){
			var temp = $(this).attr('title');
			if (temp && temp.indexOf("[not owned]") === -1){
				if (weapon_bonus.length) {
					weapon_bonus += ', ';
				}
				weapon_bonus += temp.replace(/\<[^>]*\>|\s+|\n/g,' ').trim();
				//debug("Found weapon: " + temp.replace(/\<[^>]*\>|\s+|\n/g,' ').trim());
			}
		});
		if (data[current]){
			data[current].weaponbonus = weapon_bonus;
		}
// Hopefully our Page.to() logic now catches most bad page loads and removes the need for this...
//		if ($elements.length < length(data)) {
//			debug('Different number of generals, have '+$elements.length+', want '+length(data));
//			Page.to('heroes_generals', ''); // Force reload
//			return false;
//		}
		$elements.each(function(i,el){
			var name = $('.general_name_div3_padding', el).text().trim(), level = parseInt($(el).text().regex(/Level ([0-9]+)/i), 10), progress = parseInt($('div.generals_indv_stats', el).next().children().children().children().next().attr('style').regex(/width: ([0-9]*\.*[0-9]*)%/i), 10);
			if (name && name.indexOf('\t') === -1 && name.length < 30) { // Stop the "All generals in one box" bug
//				if (!data[name] || data[name].level !== level || data[name].progress !== progress) {
					data[name] = data[name] || {};
					data[name].id		= $('input[name=item]', el).val();
					data[name].type		= $('input[name=itype]', el).val();
					data[name].img		= $('.imgButton', el).attr('src').filepart();
					data[name].att		= $('.generals_indv_stats_padding div:eq(0)', el).text().regex(/([0-9]+)/);
					data[name].def		= $('.generals_indv_stats_padding div:eq(1)', el).text().regex(/([0-9]+)/);
					data[name].progress	= progress;
					data[name].level	= level; // Might only be 4 so far, however...
					data[name].skills	= $(el).children(':last').html().replace(/\<[^>]*\>|\s+|\n/g,' ').trim();
					if (level >= 4){	// If we just leveled up to level 4, remove the priority
						if (data[name].priority) {
							delete data[name].priority;
						}
					}
//				}
			}
		});
	}
	return false;
};

Generals.update = function(type, worker) {
	var data = this.data, i, priority_list = [], list = [], invade = Town.get('runtime.invade'), duel = Town.get('runtime.duel'), attack, attack_bonus, defend, defense_bonus, army, gen_att, gen_def, attack_potential, defense_potential, att_when_att_potential, def_when_att_potential, att_when_att = 0, def_when_att = 0, monster_att = 0, monster_multiplier = 1, current_att, current_def, listpush = function(list,i){list.push(i);}, skillcombo, calcStats = false;
	if (!type || type === 'data') {
		for (i in Generals.data) {
			list.push(i);
		}
		// "any" MUST remain lower case - all real generals are capitalised so this provides the first and most obvious difference
		Config.set('generals', ['any','under level 4'].concat(list.sort())); 
	}
	
	// Take all existing priorities and change them to rank starting from 1 and keeping existing order.
	for (i in data) {
		if (data[i].level < 4) {
			priority_list.push([i, data[i].priority]);
		}
		// Force an update if stats not yet calculated
		if (!data[i].stats) {
			this.runtime.force = true;
		}
	}
	priority_list.sort(function(a,b) {
		return (a[1] - b[1]);
	});
	for (i in priority_list){
		data[priority_list[i][0]].priority = parseInt(i, 10)+1;
	}
	this.runtime.max_priority = priority_list.length;
	// End Priority Stuff
	
	if (((type === 'data' || worker === Town || worker === Player) && invade && duel)
		|| this.runtime.force) {
		this.runtime.force = false;
		if (worker === Player && Player.get('attack') && Player.get('defense')) {
			this._unwatch(Player); // Only need them the first time...
		}
		for (i in data) {
			skillcombo = data[i].skills + (data[i].weaponbonus || '');
			attack_bonus = Math.floor(sum(skillcombo.numregex(/([-+]?[0-9]*\.?[0-9]+) Player Attack|Increase Player Attack by ([0-9]+)|Convert ([-+]?[0-9]+\.?[0-9]*) Attack/gi)) + (sum(data[i].skills.numregex(/Increase ([-+]?[0-9]+\.?[0-9]*) Player Attack for every Hero Owned/gi)) * (length(data)-1)));
			defense_bonus = Math.floor(sum(skillcombo.numregex(/([-+]?[0-9]*\.?[0-9]+) Player Defense|Increase Player Defense by ([0-9]+)/gi))	
				+ sum(data[i].skills.numregex(/Increase Player Defense  by ([-+]?[0-9]*\.?[0-9]+) for every 3 Health/gi)) * Player.get('health') / 3
				+ (sum(data[i].skills.numregex(/Increase ([-+]?[0-9]*\.?[0-9]+) Player Defense for every Hero Owned/gi)) * (length(data)-1)));
			attack = (Player.get('attack') + attack_bonus
						- (sum(skillcombo.numregex(/Transfer ([0-9]+)% Attack to Defense/gi)) * Player.get('attack') / 100).round(0) 
						+ (sum(skillcombo.numregex(/Transfer ([0-9]+)% Defense to Attack/gi)) * Player.get('defense') / 100).round(0));
			defend = (Player.get('defense') + defense_bonus
						+ (sum(skillcombo.numregex(/Transfer ([0-9]+)% Attack to Defense/gi)) * Player.get('attack') / 100).round(0) 
						- (sum(skillcombo.numregex(/Transfer ([0-9]+)% Defense to Attack/gi)) * Player.get('defense') / 100).round(0));
			attack_potential = Player.get('attack') + (attack_bonus * 4) / data[i].level;	// Approximation
			defense_potential = Player.get('defense') + (defense_bonus * 4) / data[i].level;	// Approximation
			army = Math.min(Player.get('armymax'),(sum(skillcombo.numregex(/Increases? Army Limit to ([0-9]+)/gi)) || 501));
			gen_att = getAttDef(data, listpush, 'att', Math.floor(army / 5));
			gen_def = getAttDef(data, listpush, 'def', Math.floor(army / 5));
			att_when_att = sum(skillcombo.numregex(/Increase Player Attack when Defending by ([-+]?[0-9]+)/gi));
			def_when_att = sum(skillcombo.numregex(/([-+]?[0-9]+) Defense when attacked/gi));
			att_when_att_potential = (att_when_att * 4) / data[i].level;	// Approximation
			def_when_att_potential = (def_when_att * 4) / data[i].level;	// Approximation
			monster_att = sum(skillcombo.numregex(/([-+]?[0-9]+) Monster attack/gi));
			monster_multiplier = 1.1 + sum(skillcombo.numregex(/([-+]?[0-9]+)% Critical/gi))/100;
			if (sum(skillcombo.numregex(/Increase Power Attacks by ([0-9]+)/gi))) {
				this.runtime.multipliers[i] = sum(skillcombo.numregex(/Increase Power Attacks by ([0-9]+)/gi));
			}
			current_att = data[i].att + parseInt(sum(data[i].skills.numregex(/'s Attack by ([-+]?[0-9]+)/gi)), 10) + (typeof data[i].weaponbonus !== 'undefined' ? parseInt(sum(data[i].weaponbonus.numregex(/([-+]?[0-9]+) attack/gi)), 10) : 0);	// Need to grab weapon bonuses without grabbing Serene's skill bonus
			current_def = data[i].def + (typeof data[i].weaponbonus !== 'undefined' ? parseInt(sum(data[i].weaponbonus.numregex(/([-+]?[0-9]+) defense/gi)), 10) : 0);
//			debug(i + ' attack: ' + current_att + ' = ' + data[i].att + ' + ' + parseInt((data[i].skills.regex(/'s Attack by ([-+]?[0-9]+)/gi) || 0)) + ' + ' + parseInt((data[i].weaponbonus.regex(/([-+]?[0-9]+) attack/gi) || 0)));
			data[i].invade = {
				att: Math.floor(invade.attack + current_att + (current_def * 0.7) + ((attack + (defend * 0.7)) * army) + gen_att),
				def: Math.floor(invade.defend + current_def + (current_att * 0.7) + ((defend + def_when_att + ((attack + att_when_att) * 0.7)) * army) + gen_def)
			};
			data[i].stats = {
				stamina: sum(skillcombo.numregex(/Increase Max Stamina by ([0-9]+)|([-+]?[0-9]+) Max Stamina/gi)) 
						+ (sum(skillcombo.numregex(/Transfer ([0-9]+)% Max Energy to Max Stamina/gi)) * Player.get('maxenergy') / 100/2).round(0)
						- (sum(skillcombo.numregex(/Transfer ([0-9]+)% Max Stamina to Max Energy/gi)) * Player.get('maxstamina') / 100).round(0),
				energy:	sum(skillcombo.numregex(/Increase Max Energy by ([0-9]+)|([-+]?[0-9]+) Max Energy/gi))
						- (sum(skillcombo.numregex(/Transfer ([0-9]+)% Max Energy to Max Stamina/gi)) * Player.get('maxenergy') / 100).round(0)
						+ (sum(skillcombo.numregex(/Transfer ([0-9]+)% Max Stamina to Max Energy/gi)) * Player.get('maxstamina') / 100*2).round(0)
			};
 			data[i].duel = {
				att: Math.floor(duel.attack + current_att + (current_def * 0.7) + attack + (defend * 0.7)),
				def: Math.floor(duel.defend + current_def + (current_att * 0.7) + defend + def_when_att + ((attack + att_when_att) * 0.7))
			};
			data[i].monster = {
				att: Math.floor(monster_multiplier * (duel.attack + current_att + attack + monster_att)),
				def: Math.floor(duel.defend + current_def + defend) // Fortify, so no def_when_att
			};
/*			if (i === 'Xira' || i === 'Slayer') {
				debug(i +' skillcombo:'+skillcombo+' numregex'+sum(data[i].skills.numregex(/Increase Player Defense  by ([-+]?[0-9]+\.?[0-9]*) for every 3 Health/gi))+' attack:'+attack+' defend:'+defend);
			}
*/			data[i].potential = {
				bank: (skillcombo.regex(/Bank Fee/gi) ? 1 : 0),
				defense: Math.floor(duel.defend + (data[i].def + 4 - data[i].level) + ((data[i].att + 4 - data[i].level) * 0.7) + defense_potential + def_when_att_potential + ((attack_potential + att_when_att_potential) * 0.7)),
				income: (skillcombo.regex(/Increase Income by ([0-9]+)/gi) * 4) / data[i].level,
				invade: Math.floor(invade.attack + (data[i].att + 4 - data[i].level) + ((data[i].def + 4 - data[i].level) * 0.7) + ((attack_potential + (defense_potential * 0.7)) * army) + gen_att),
				duel: Math.floor(duel.attack + (data[i].att + 4 - data[i].level) + ((data[i].def + 4 - data[i].level) * 0.7) + attack_potential + (defense_potential * 0.7)),
				monster: Math.floor(duel.attack + (data[i].att + 4 - data[i].level) + attack_potential + (monster_att * 4) / data[i].level),
				raid_invade: 0,
				raid_duel: 0,
				influence: (skillcombo.regex(/Influence ([0-9]+)% Faster/gi) || 0),
				drops: (skillcombo.regex(/Chance ([0-9]+)% Drops/gi) || 0),
				demi: (skillcombo.regex(/Extra Demi Points/gi) ? 1 : 0),
				cash: (skillcombo.regex(/Bonus ([0-9]+) Gold/gi) || 0)
			};
			data[i].potential.raid_invade = (data[i].potential.defense + data[i].potential.invade);
			data[i].potential.raid_duel = (data[i].potential.defense + data[i].potential.duel);

			this.runtime.armymax = Math.max(army, this.runtime.armymax);
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
		log('General "'+name+'" requested but not found!');
		return true; // Not found, so fake it
	}
	if (!Generals.test(name)) {
		//debug('Identified general ' + name + ', but changing would cost stamina or energy.');
		debug('General rejected due to energy or stamina loss: ' + Player.get('general') + ' to ' + name);
		//debug('stamina ' + Player.get('stamina') + ' new max stamina ' + (Player.get('maxstamina') + Generals.data[name].stats.stamina)+ ' old max stamina ' + Player.get('maxstamina') + ' new gen stamina ' + Generals.data[name].stats.stamina);
		return true;
	}
//	debug('Changing to General '+name);
	debug('General change: ' + Player.get('general') + ' to ' + name);
	Page.to('heroes_generals', this.data[name].id && this.data[name].type ? {item:this.data[name].id, itype:this.data[name].type} : null)
	return false;
};

Generals.test = function(name) {
	Generals._unflush(); // Can't use "this" because called out of context
	var next = isObject(name) ? name : Generals.data[name];
	if (!name || !next) {
		return false;
	} else if (name === 'any') {
		return true;
	} else {
		return (Player.get('maxstamina') + next.stats.stamina >= Player.get('stamina') && Player.get('maxenergy') + next.stats.energy >= Player.get('energy'));
	}
};

Generals.best = function(type) {
	this._unflush();
	if (this.data[type]) {
		return type;
	}
	var rx = '', best = null, bestval = 0, i, value, current = Player.get('general'), first, second;
	switch(type.toLowerCase()) {
	case 'cost':		rx = /Decrease Soldier Cost by ([0-9]+)/gi; break;
	case 'stamina':		rx = /Increase Max Stamina by ([0-9]+)|\+([0-9]+) Max Stamina/gi; break;
	case 'energy':		rx = /Increase Max Energy by ([0-9]+)|\+([0-9]+) Max Energy/gi; break;
	case 'income':		rx = /Increase Income by ([0-9]+)/gi; break;
	case 'item':		rx = /([0-9]+)% Drops for Quest/gi; break;
	case 'influence':	rx = /Bonus Influence ([0-9]+)/gi; break;
	case 'defense':		rx = /([-+]?[0-9]+) Player Defense/gi; break;
	case 'cash':		rx = /Bonus ([0-9]+) Gold/gi; break;
	case 'bank':		return 'Aeris';
	case 'war':			rx = /\+([0-9]+) Attack to your entire War Council|-([0-9]+) Attack to your opponents War Council/gi; break;
	case 'raid-invade': 	// Fall through
	case 'invade':			first = 'invade'; second = 'att'; break;
	case 'raid-duel':		// Fall through
	case 'duel':			first = 'duel'; second = 'att'; break;
	case 'monster_attack': 	first = 'monster'; second = 'att'; break;
	case 'dispel':			// Fall through
	case 'monster_defend': 	first = 'monster'; second = 'def'; break;
	case 'defend':			first = 'duel'; second = 'def'; break;
	case 'under level 4':	value = function(g) { return (g.priority ? -g.priority : null); }; break;
	default:  return 'any';
	}
	if (rx) {
		value = function(g) { return sum(g.skills.numregex(rx)); };
	} else if (first && second) {
		value = function(g) { return (g[first] ? g[first][second] : null); };
	} else if (!value) {
		debug('No definition for best general for ' + type);
		return 'any';
	}
	best = bestObjValue(this.data, value, Generals.test);
	return (best || 'any');
};

Generals.order = [];
Generals.dashboard = function(sort, rev) {
	var i, o, output = [], list = [], iatt = 0, idef = 0, datt = 0, ddef = 0, matt = 0, mdef = 0;

	if (typeof sort === 'undefined') {
		Generals.order = [];
		for (i in Generals.data) {
			Generals.order.push(i);
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
		Generals.order.sort(function(a,b) {
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
	for (i in Generals.data) {
		iatt = Math.max(iatt, Generals.data[i].invade ? Generals.data[i].invade.att : 1);
		idef = Math.max(idef, Generals.data[i].invade ? Generals.data[i].invade.def : 1);
		datt = Math.max(datt, Generals.data[i].duel ? Generals.data[i].duel.att : 1);
		ddef = Math.max(ddef, Generals.data[i].duel ? Generals.data[i].duel.def : 1);
		matt = Math.max(matt, Generals.data[i].monster ? Generals.data[i].monster.att : 1);
		mdef = Math.max(mdef, Generals.data[i].monster ? Generals.data[i].monster.def : 1);
	}
	list.push('<table cellspacing="0" style="width:100%"><thead><tr><th></th><th>General</th><th>Level</th><th>Quest<br>Rank</th><th>Invade<br>Attack</th><th>Invade<br>Defend</th><th>Duel<br>Attack</th><th>Duel<br>Defend</th><th>Monster<br>Attack</th><th>Fortify<br>Dispel</th></tr></thead><tbody>');
	for (o=0; o<Generals.order.length; o++) {
		i = Generals.order[o];
		output = [];
		output.push('<a class="golem-link" href="generals.php?item=' + Generals.data[i].id + '&itype=' + Generals.data[i].type + '"><img src="' + imagepath + Generals.data[i].img+'" style="width:25px;height:25px;" title="Skills: ' + Generals.data[i].skills + ', Weapon Bonus: ' + (typeof Generals.data[i].weaponbonus !== 'unknown' ? (Generals.data[i].weaponbonus ? Generals.data[i].weaponbonus : 'none') : 'unknown') + '"></a>');
		output.push(i);
		output.push('<div'+(isNumber(Generals.data[i].progress) ? ' title="'+Generals.data[i].progress+'%"' : '')+'>'+Generals.data[i].level+'</div><div style="background-color: #9ba5b1; height: 2px; width=100%;"><div style="background-color: #1b3541; float: left; height: 2px; width: '+(Generals.data[i].progress || 0)+'%;"></div></div>');
		output.push(Generals.data[i].priority ? ((Generals.data[i].priority !== 1 ? '<a class="golem-moveup" name='+Generals.data[i].priority+'>&uarr</a> ' : '&nbsp;&nbsp; ') + Generals.data[i].priority + (Generals.data[i].priority !== this.runtime.max_priority ? ' <a class="golem-movedown" name='+Generals.data[i].priority+'>&darr</a>' : ' &nbsp;&nbsp;')) : '');
		output.push(Generals.data[i].invade ? (iatt === Generals.data[i].invade.att ? '<strong>' : '') + addCommas(Generals.data[i].invade.att) + (iatt === Generals.data[i].invade.att ? '</strong>' : '') : '?');
		output.push(Generals.data[i].invade ? (idef === Generals.data[i].invade.def ? '<strong>' : '') + addCommas(Generals.data[i].invade.def) + (idef === Generals.data[i].invade.def ? '</strong>' : '') : '?');
		output.push(Generals.data[i].duel ? (datt === Generals.data[i].duel.att ? '<strong>' : '') + addCommas(Generals.data[i].duel.att) + (datt === Generals.data[i].duel.att ? '</strong>' : '') : '?');
		output.push(Generals.data[i].duel ? (ddef === Generals.data[i].duel.def ? '<strong>' : '') + addCommas(Generals.data[i].duel.def) + (ddef === Generals.data[i].duel.def ? '</strong>' : '') : '?');
		output.push(Generals.data[i].monster ? (matt === Generals.data[i].monster.att ? '<strong>' : '') + addCommas(Generals.data[i].monster.att) + (matt === Generals.data[i].monster.att ? '</strong>' : '') : '?');
		output.push(Generals.data[i].monster ? (mdef === Generals.data[i].monster.def ? '<strong>' : '') + addCommas(Generals.data[i].monster.def) + (mdef === Generals.data[i].monster.def ? '</strong>' : '') : '?');
		list.push('<tr><td>' + output.join('</td><td>') + '</td></tr>');
	}
	list.push('</tbody></table>');
	$('a.golem-moveup').live('click', function(event){
		var i, gdown = null, gup = null, x = parseInt($(this).attr('name'), 10);
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
			debug('Priority: Swapping '+gup+' with '+gdown);
			Generals.data[gdown].priority++;
			Generals.data[gup].priority--;
		}
		Generals.dashboard(sort,rev);
		return false;
	});
	$('a.golem-movedown').live('click', function(event){
		var i, gdown = null, gup = null, x = parseInt($(this).attr('name'), 10);
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
			debug('Priority: Swapping '+gup+' with '+gdown);
			Generals.data[gdown].priority++;
			Generals.data[gup].priority--;
		}
		Generals.dashboard(sort,rev);
		return false;
	});
	$('#golem-dashboard-Generals').html(list.join(''));
	$('#golem-dashboard-Generals tbody tr td:nth-child(2)').css('text-align', 'left');
	if (typeof sort !== 'undefined') {
		$('#golem-dashboard-Generals thead th:eq('+sort+')').attr('name',(rev ? 'reverse' : 'sort')).append('&nbsp;' + (rev ? '&uarr;' : '&darr;'));
	}
};



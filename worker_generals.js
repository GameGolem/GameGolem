/********** Worker.Generals **********
* Updates the list of Generals
* Finds best General for other classes
* *** Need to take into account army size and real stats for attack and defense
*/
var Generals = new Worker('Generals');
Generals.option = null;
Generals.data = {};

Generals.defaults = {
	castle_age:{
		pages:'*'
	}
};

Generals.runtime = {
	disabled:false // Nobody should touch this except LevelUp!!!
};

Generals.init = function() {
	for (var i in this.data) {
		if (i.indexOf('\t') !== -1) { // Fix bad page loads...
			delete this.data[i];
		}
	}
	this._watch(Town);
};

Generals.parse = function(change) {
	if ($('div.results').text().match(/has gained a level!/i)) {
		this.data[Player.get('general')].level++; // Our stats have changed but we don't care - they'll update as soon as we see the Generals page again...
	}
	if (Page.page === 'heroes_generals') {
		var $elements = $('.generalSmallContainer2'), data = this.data;
		if ($elements.length < length(data)) {
			debug('Generals: Different number of generals, have '+$elements.length+', want '+length(data));
	//		Page.to('heroes_generals', ''); // Force reload
			return false;
		}
		$elements.each(function(i,el){
			var name = $('.general_name_div3_padding', el).text().trim(), level = parseInt($(el).text().regex(/Level ([0-9]+)/i));
			var progress = parseInt($('div.generals_indv_stats', el).next().children().children().children().next().attr('style').regex(/width: ([0-9]*\.*[0-9]*)%/i));
			if (name && name.indexOf('\t') === -1 && name.length < 30) { // Stop the "All generals in one box" bug
				if (!data[name] || data[name].level !== level || data[name].progress !== progress) {
					data[name] = data[name] || {};
					data[name].img		= $('.imgButton', el).attr('src').filepart();
					data[name].att		= $('.generals_indv_stats_padding div:eq(0)', el).text().regex(/([0-9]+)/);
					data[name].def		= $('.generals_indv_stats_padding div:eq(1)', el).text().regex(/([0-9]+)/);
					data[name].progress	= progress;
					data[name].level	= level; // Might only be 4 so far, however...
					data[name].skills	= $('table div', el).html().replace(/\<[^>]*\>|\s+|\n/g,' ').trim();
					if (level >= 4){	// If we just leveled up to level 4, remove the priority
						if (data[name].priority) {
							delete data[name].priority;
						}
					}
				}
			}
		});
	}
	return false;
};

Generals.update = function(type) {
	var data = this.data, i, priority_list = [], list = [], invade = Town.get('runtime.invade'), duel = Town.get('runtime.duel'), attack, attack_bonus, defend, defense_bonus, army, gen_att, gen_def, attack_potential, defense_potential, att_when_att_potential, def_when_att_potential, att_when_att = 0, def_when_att = 0, monster_att = 0, iatt = 0, idef = 0, datt = 0, ddef = 0, listpush = function(list,i){list.push(i);};
	if (type === 'data') {
		for (i in Generals.data) {
			list.push(i);
		}
		Config.set('generals', ['any'].concat(list.sort()));
	}
	
	// Take all existing priorities and change them to rank starting from 1 and keeping existing order.
	for (i in data) {
		if (data[i].level < 4) {
			priority_list.push([i, data[i].priority]);
		}
	}
	priority_list.sort(function(a,b) {
		return (a[1] - b[1]);
	});
	for (i in priority_list){
		data[priority_list[i][0]].priority = parseInt(i)+1;
	}
	this.runtime.max_priority = priority_list.length;
	// End Priority Stuff
	
	if ((type === 'data' || type === Town) && invade && duel) {
		for (i in data) {
			attack_bonus = Math.floor(sum(data[i].skills.regex(/([-+]?[0-9]*\.?[0-9]*) Player Attack|Increase Player Attack by ([0-9]+)/i)) + ((data[i].skills.regex(/Increase ([-+]?[0-9]*\.?[0-9]*) Player Attack for every Hero Owned/i) || 0) * (length(data)-1)));
			defense_bonus = Math.floor(sum(data[i].skills.regex(/([-+]?[0-9]*\.?[0-9]*) Player Defense|Increase Player Defense by ([0-9]+)/i))	+ ((data[i].skills.regex(/Increase ([-+]?[0-9]*\.?[0-9]*) Player Defense for every Hero Owned/i) || 0) * (length(data)-1)));
			attack = Player.get('attack') + attack_bonus;
			defend = Player.get('defense') + defense_bonus;
			attack_potential = Player.get('attack') + (attack_bonus * 4) / data[i].level;	// Approximation
			defense_potential = Player.get('defense') + (defense_bonus * 4) / data[i].level;	// Approximation
			army = (data[i].skills.regex(/Increases? Army Limit to ([0-9]+)/i) || 501);
			gen_att = getAttDef(data, listpush, 'att', Math.floor(army / 5));
			gen_def = getAttDef(data, listpush, 'def', Math.floor(army / 5));
			att_when_att = (data[i].skills.regex(/([-+]?[0-9]+) Attack when attacked/i) || 0);
			def_when_att = (data[i].skills.regex(/([-+]?[0-9]+) Defense when attacked/i) || 0);
			att_when_att_potential = (att_when_att * 4) / data[i].level;	// Approximation
			def_when_att_potential = (def_when_att * 4) / data[i].level;	// Approximation
			monster_att = (data[i].skills.regex(/([-+]?[0-9]+) Monster attack/i) || 0);
			data[i].invade = {
				att: Math.floor(invade.attack + data[i].att + (data[i].def * 0.7) + ((attack + (defend * 0.7)) * army) + gen_att),
				def: Math.floor(invade.defend + data[i].def + (data[i].att * 0.7) + ((defend + def_when_att + ((attack + att_when_att) * 0.7)) * army) + gen_def)
			};
			data[i].duel = {
				att: Math.floor(duel.attack + data[i].att + (data[i].def * 0.7) + attack + (defend * 0.7)),
				def: Math.floor(duel.defend + data[i].def + (data[i].att * 0.7) + defend + def_when_att + ((attack + att_when_att) * 0.7))
			};
			data[i].monster = {
				att: Math.floor(duel.attack + data[i].att + attack + monster_att),
				def: Math.floor(duel.defend + data[i].def + defend) // Fortify, so no def_when_att
			};
			data[i].potential = {
				bank: (data[i].skills.regex(/Bank Fee/i) ? 1 : 0),
				defense: Math.floor(duel.defend + (data[i].def + 4 - data[i].level) + ((data[i].att + 4 - data[i].level) * 0.7) + defense_potential + def_when_att_potential + ((attack_potential + att_when_att_potential) * 0.7)),
				income: (data[i].skills.regex(/Increase Income by ([0-9]+)/i) * 4) / data[i].level,
				invade: Math.floor(invade.attack + (data[i].att + 4 - data[i].level) + ((data[i].def + 4 - data[i].level) * 0.7) + ((attack_potential + (defense_potential * 0.7)) * army) + gen_att),
				duel: Math.floor(duel.attack + (data[i].att + 4 - data[i].level) + ((data[i].def + 4 - data[i].level) * 0.7) + attack_potential + (defense_potential * 0.7)),
				monster: Math.floor(duel.attack + (data[i].att + 4 - data[i].level) + attack_potential + (monster_att * 4) / data[i].level),
				raid_invade: 0,
				raid_duel: 0,
				influence: (data[i].skills.regex(/Influence ([0-9]+)% Faster/i) || 0),
				drops: (data[i].skills.regex(/Chance ([0-9]+)% Drops/i) || 0),
				demi: (data[i].skills.regex(/Extra Demi Points/i) ? 1 : 0),
				cash: (data[i].skills.regex(/Bonus ([0-9]+) Gold/i) || 0)
			};
			data[i].potential.raid_invade = (data[i].potential.defense + data[i].potential.invade);
			data[i].potential.raid_duel = (data[i].potential.defense + data[i].potential.duel);
		}
	}
};

Generals.to = function(name) {
	if (this.runtime.disabled) {
		return true;
	}
	this._unflush();
	if (name && !this.data[name]) {
		name = this.best(name);
	}
	if (!name || Player.get('general') === name || name === 'any') {
		return true;
	}
	if (!name || !this.data[name]) {
		log('General "'+name+'" requested but not found!');
		return true; // Not found, so fake it
	}
	if (!Page.to('heroes_generals')) {
		return false;
	}
	debug('Changing to General '+name);
	Page.click('input[src$="' + this.data[name].img + '"]');
	this.data[name].used = (this.data[name].used || 0) + 1;
	return false;
};

Generals.best = function(type) {
	this._unflush();
	var rx = '', best = null, bestval = 0, i, value, list = [];
	switch(type.toLowerCase()) {
		case 'cost':		rx = /Decrease Soldier Cost by ([0-9]+)/i; break;
		case 'stamina':		rx = /Increase Max Stamina by ([0-9]+)|\+([0-9]+) Max Stamina/i; break;
		case 'energy':		rx = /Increase Max Energy by ([0-9]+)|\+([0-9]+) Max Energy/i; break;
		case 'income':		rx = /Increase Income by ([0-9]+)/i; break;
		case 'item':		rx = /([0-9]+)% Drops for Quest/i; break;
		case 'influence':	rx = /Bonus Influence ([0-9]+)/i; break;
		case 'attack':		rx = /([-+]?[0-9]+) Player Attack/i; break;
		case 'defense':		rx = /([-+]?[0-9]+) Player Defense/i; break;
		case 'cash':		rx = /Bonus ([0-9]+) Gold/i; break;
		case 'bank':		return 'Aeris';
		case 'invade':
			for (i in Generals.data) {
				if (!best || (Generals.data[i].invade && Generals.data[i].invade.att > Generals.data[best].invade.att) || (Generals.data[i].invade && Generals.data[i].invade.att === Generals.data[best].invade.att && best !== Player.get('general'))) {
					best = i;
				}
			}
			return (best || 'any');
		case 'duel':
			for (i in Generals.data) {
				if (!best || (Generals.data[i].duel && Generals.data[i].duel.att > Generals.data[best].duel.att) || (Generals.data[i].duel && Generals.data[i].duel.att === Generals.data[best].duel.att && best !== Player.get('general'))) {
					best = i;
				}
			}
			return (best || 'any');
		case 'raid-invade':
			for (i in Generals.data) {
				if (!best || (Generals.data[i].invade && (2*Generals.data[i].invade.att + Generals.data[i].invade.def) > (2*Generals.data[best].invade.att + Generals.data[best].invade.def))) {
					best = i;
				}
			}
			return (best || 'any');
		case 'raid-duel':
			for (i in Generals.data) {
				if (!best || (Generals.data[i].duel && (2*Generals.data[i].duel.att + Generals.data[i].duel.def) > (2*Generals.data[best].duel.att + Generals.data[best].duel.def))) {
					best = i;
				}
			}
			return (best || 'any');
		case 'monster':
			for (i in Generals.data) {
				if (!best || (Generals.data[i].monster && Generals.data[i].monster.att > Generals.data[best].monster.att)) {
					best = i;
				}
			}
			return (best || 'any');
		case 'dispel':
		case 'fortify':
			for (i in Generals.data) {
				if (!best || (Generals.data[i].monster && Generals.data[i].monster.def > Generals.data[best].monster.def)) {
					best = i;
				}
			}
			return (best || 'any');
		case 'defend':
			for (i in Generals.data) {
				if (!best || (Generals.data[i].duel && Generals.data[i].duel.def > Generals.data[best].duel.def) || (Generals.data[i].duel && Generals.data[i].duel.def === Generals.data[best].duel.def && best !== Player.get('general'))) {
					best = i;
				}
			}
			return (best || 'any');
		case 'under level 4':
/*			if (Generals.data[Player.get('general')] && Generals.data[Player.get('general')].level < 4) {
				return Player.get('general');
			}
			best = 0;
			for (i in Generals.data) {
				if (Generals.data[i].level < 4) {
					best = Math.max(best, (this.data[i].used || 0));
				}
			}
			for (i in Generals.data) {
				if ((Generals.data[i].used || 0) === best) {
					list.push(i);
				}
			}
			return list.length ? list[Math.floor(Math.random()*list.length)] : 'any';*/
			for (i in Generals.data){
				if (Generals.data[i].priority == 1){
					return i;
				}
			}
		default:
			return 'any';
	}
	for (i in Generals.data) {
		value = Generals.data[i].skills.regex(rx);
		if (value) {
			if (!best || value>bestval) {
				best = i;
				bestval = value;
			}
		}
	}
//	if (best) {
//		debug('Best general found: '+best);
//	}
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
			if (sort == 1) {
				aa = a;
				bb = b;
			} else if (sort == 2) {
				aa = (Generals.data[a].level || 0);
				bb = (Generals.data[b].level || 0);
			} else if (sort == 3) {
				aa = (Generals.data[a].priority || 999999);
				bb = (Generals.data[b].priority || 999999);
			} else {
				type = (sort<6 ? 'invade' : (sort<8 ? 'duel' : 'monster'));
				x = (sort%2 ? 'def' : 'att');
				aa = (Generals.data[a][type][x] || 0);
				bb = (Generals.data[b][type][x] || 0);
			}
			if (typeof aa === 'string' || typeof bb === 'string') {
				return (rev ? bb > aa : bb < aa);
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
		output.push('<img src="' + imagepath + Generals.data[i].img+'" style="width:25px;height:25px;" title="' + Generals.data[i].skills + '">');
		output.push(i);
		output.push('<div'+(isNumber(Generals.data[i].progress) ? ' title="'+Generals.data[i].progress+'%"' : '')+'>'+Generals.data[i].level+'</div><div style="background-color: #9ba5b1; height: 2px; width=100%;"><div style="background-color: #1b3541; float: left; height: 2px; width: '+(Generals.data[i].progress || 0)+'%;"></div></div>');
		output.push(Generals.data[i].priority ? ((Generals.data[i].priority != 1 ? '<a class="golem-moveup" name='+Generals.data[i].priority+'>&uarr</a> ' : '&nbsp;&nbsp; ') + Generals.data[i].priority + (Generals.data[i].priority != this.runtime.max_priority ? ' <a class="golem-movedown" name='+Generals.data[i].priority+'>&darr</a>' : ' &nbsp;&nbsp;')) : '');
		output.push(Generals.data[i].invade ? (iatt == Generals.data[i].invade.att ? '<strong>' : '') + addCommas(Generals.data[i].invade.att) + (iatt == Generals.data[i].invade.att ? '</strong>' : '') : '?')
		output.push(Generals.data[i].invade ? (idef == Generals.data[i].invade.def ? '<strong>' : '') + addCommas(Generals.data[i].invade.def) + (idef == Generals.data[i].invade.def ? '</strong>' : '') : '?');
		output.push(Generals.data[i].duel ? (datt == Generals.data[i].duel.att ? '<strong>' : '') + addCommas(Generals.data[i].duel.att) + (datt == Generals.data[i].duel.att ? '</strong>' : '') : '?');
		output.push(Generals.data[i].duel ? (ddef == Generals.data[i].duel.def ? '<strong>' : '') + addCommas(Generals.data[i].duel.def) + (ddef == Generals.data[i].duel.def ? '</strong>' : '') : '?');
		output.push(Generals.data[i].monster ? (matt == Generals.data[i].monster.att ? '<strong>' : '') + addCommas(Generals.data[i].monster.att) + (matt == Generals.data[i].monster.att ? '</strong>' : '') : '?');
		output.push(Generals.data[i].monster ? (mdef == Generals.data[i].monster.def ? '<strong>' : '') + addCommas(Generals.data[i].monster.def) + (mdef == Generals.data[i].monster.def ? '</strong>' : '') : '?');
		list.push('<tr><td>' + output.join('</td><td>') + '</td></tr>');
	}
	list.push('</tbody></table>');
	$('a.golem-moveup').live('click', function(event){
		var gdown = null, gup = null, x = parseInt($(this).attr('name'));
		Generals._unflush();
		for(var i in Generals.data){
			if (Generals.data[i].priority == x){
				gup = i;
			}
			if (Generals.data[i].priority == (x-1)){
				gdown = i;
			}
		}
		if (gdown && gup) {
			debug('Generals: Priority: Swapping '+gup+' with '+gdown);
			Generals.data[gdown].priority++;
			Generals.data[gup].priority--;
		}
		Generals.dashboard(sort,rev);
		return false;
	});
	$('a.golem-movedown').live('click', function(event){
		var gdown = null, gup = null, x = parseInt($(this).attr('name'));
		Generals._unflush();
		for(var i in Generals.data){
			if (Generals.data[i].priority == x){
				gdown = i;
			}
			if (Generals.data[i].priority == (x+1)){
				gup = i;
			}
		}
		if (gdown && gup) {
			debug('Generals: Priority: Swapping '+gup+' with '+gdown);
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
}


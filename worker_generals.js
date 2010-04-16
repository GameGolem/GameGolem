/********** Worker.Generals **********
* Updates the list of Generals
* Finds best General for other classes
* *** Need to take into account army size and real stats for attack and defense
*/
var Generals = new Worker('Generals');
Generals.option = null;

Generals.defaults = {
	castle_age:{
		pages:'heroes_generals'
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
	var $elements = $('.generalSmallContainer2'), data = this.data;
	if ($elements.length < length(data)) {
		debug('Generals: Different number of generals, have '+$elements.length+', want '+length(data));
//		Page.to('heroes_generals', ''); // Force reload
		return false;
	}
	$elements.each(function(i,el){
		var name = $('.general_name_div3_padding', el).text().trim(), level = $(el).text().regex(/Level ([0-9]+)/i);
		if (name && name.indexOf('\t') === -1 && name.length < 30) { // Stop the "All generals in one box" bug
			if (!data[name] || data[name].level !== level) {
				data[name] = data[name] || {};
				data[name].img		= $('.imgButton', el).attr('src').filepart();
				data[name].att		= $('.generals_indv_stats_padding div:eq(0)', el).text().regex(/([0-9]+)/);
				data[name].def		= $('.generals_indv_stats_padding div:eq(1)', el).text().regex(/([0-9]+)/);
				data[name].level	= level; // Might only be 4 so far, however...
				data[name].skills	= $('table div', el).html().replace(/\<[^>]*\>|\s+|\n/g,' ').trim();
			}
		}
	});
	return false;
};

Generals.update = function(type) {
	var data = this.data, i, list = [], invade = Town.get('runtime.invade'), duel = Town.get('runtime.duel'), attack, defend, army, gen_att, gen_def, att_when_att = 0, def_when_att = 0, iatt = 0, idef = 0, datt = 0, ddef = 0, listpush = function(list,i){list.push(i);};
	if (type === 'data') {
		for (i in Generals.data) {
			list.push(i);
		}
		Config.set('generals', ['any'].concat(list.sort()));
	}
	if ((type === 'data' || type === Town) && invade && duel) {
		for (i in data) {
			attack = Math.floor(Player.get('attack')	+ sum(data[i].skills.regex(/([-+]?[0-9]*\.?[0-9]*) Player Attack|Increase Player Attack by ([0-9]+)/gi))	+ ((data[i].skills.regex(/Increase ([-+]?[0-9]*\.?[0-9]*) Player Attack for every Hero Owned/i) || 0) * (length(data)-1)));
			defend = Math.floor(Player.get('defense')	+ sum(data[i].skills.regex(/([-+]?[0-9]*\.?[0-9]*) Player Defense|Increase Player Defense by ([0-9]+)/gi))+ ((data[i].skills.regex(/Increase ([-+]?[0-9]*\.?[0-9]*) Player Defense for every Hero Owned/i) || 0) * (length(data)-1)));
			army = (data[i].skills.regex(/Increases? Army Limit to ([0-9]+)/i) || 501);
			gen_att = getAttDef(data, listpush, 'att', Math.floor(army / 5));
			gen_def = getAttDef(data, listpush, 'def', Math.floor(army / 5));
			att_when_att = sum(data[i].skills.regex(/Attack is increased by ([-+]?[0-9]+) when attacked/i));
			def_when_att = sum(data[i].skills.regex(/([-+]?[0-9]+) Defense when attacked/i));
			data[i].invade = {
				att: Math.floor(invade.attack + data[i].att + (data[i].def * 0.7) + ((attack + (defend * 0.7)) * army) + gen_att),
				def: Math.floor(invade.defend + data[i].def + (data[i].att * 0.7) + ((defend + def_when_att + ((attack + att_when_att) * 0.7)) * army) + gen_def)
			};
			data[i].duel = {
				att: Math.floor(duel.attack + data[i].att + (data[i].def * 0.7) + attack + (defend * 0.7)),
				def: Math.floor(duel.defend + data[i].def + (data[i].att * 0.7) + defend + def_when_att + ((attack + att_when_att) * 0.7))
			};
			data[i].monster = {
				att: Math.floor(duel.attack + data[i].att + attack),
				def: Math.floor(duel.defend + data[i].def + defend + def_when_att)
			};
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
		case 'item':		rx = /Chance +([0-9]+)% Drops for Quest/i; break;
		case 'influence':	rx = /Bonus Influence ([0-9]+)/i; break;
		case 'attack':		rx = /([-+]?[0-9]+) Player Attack/i; break;
		case 'defense':		rx = /([-+]?[0-9]+) Player Defense/i; break;
		case 'cash':		rx = /Bonus ([0-9]+) Gold/i; break;
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
				if (!best || (Generals.data[i].invade && (Generals.data[i].invade.att + Generals.data[i].invade.def) > (Generals.data[best].invade.att + Generals.data[best].invade.def))) {
					best = i;
				}
			}
			return (best || 'any');
		case 'raid-duel':
			for (i in Generals.data) {
				if (!best || (Generals.data[i].duel && (Generals.data[i].duel.att + Generals.data[i].duel.def) > (Generals.data[best].duel.att + Generals.data[best].duel.def))) {
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
			if (Generals.data[Player.get('general')] && Generals.data[Player.get('general')].level < 4) {
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
			return list.length ? list[Math.floor(Math.random()*list.length)] : 'any';
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
		sort = 1; // Default = sort by name
	}
	if (typeof sort !== 'undefined') {
		Generals.order.sort(function(a,b) {
			var aa, bb, type, x;
			if (sort == 1) {
				aa = a;
				bb = b;
			} else if (sort == 2) {
				aa = (Generals.data[a].level || 0);
				bb = (Generals.data[b].level || 0);
			} else {
				type = (sort<5 ? 'invade' : (sort<7 ? 'duel' : 'monster'));
				x = (sort%2 ? 'att' : 'def');
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
	list.push('<table cellspacing="0" style="width:100%"><thead><tr><th></th><th>General</th><th>Level</th><th>Invade<br>Attack</th><th>Invade<br>Defend</th><th>Duel<br>Attack</th><th>Duel<br>Defend</th><th>Monster<br>Attack</th><th>Fortify<br>Dispel</th></tr></thead><tbody>');
	for (o=0; o<Generals.order.length; o++) {
		i = Generals.order[o];
		output = [];
		output.push('<img src="' + imagepath + Generals.data[i].img+'" style="width:25px;height:25px;" title="' + Generals.data[i].skills + '">');
		output.push(i);
		output.push(Generals.data[i].level);
		output.push(Generals.data[i].invade ? (iatt == Generals.data[i].invade.att ? '<strong>' : '') + addCommas(Generals.data[i].invade.att) + (iatt == Generals.data[i].invade.att ? '</strong>' : '') : '?')
		output.push(Generals.data[i].invade ? (idef == Generals.data[i].invade.def ? '<strong>' : '') + addCommas(Generals.data[i].invade.def) + (idef == Generals.data[i].invade.def ? '</strong>' : '') : '?');
		output.push(Generals.data[i].duel ? (datt == Generals.data[i].duel.att ? '<strong>' : '') + addCommas(Generals.data[i].duel.att) + (datt == Generals.data[i].duel.att ? '</strong>' : '') : '?');
		output.push(Generals.data[i].duel ? (ddef == Generals.data[i].duel.def ? '<strong>' : '') + addCommas(Generals.data[i].duel.def) + (ddef == Generals.data[i].duel.def ? '</strong>' : '') : '?');
		output.push(Generals.data[i].monster ? (matt == Generals.data[i].monster.att ? '<strong>' : '') + addCommas(Generals.data[i].monster.att) + (matt == Generals.data[i].monster.att ? '</strong>' : '') : '?');
		output.push(Generals.data[i].monster ? (mdef == Generals.data[i].monster.def ? '<strong>' : '') + addCommas(Generals.data[i].monster.def) + (mdef == Generals.data[i].monster.def ? '</strong>' : '') : '?');
		list.push('<tr><td>' + output.join('</td><td>') + '</td></tr>');
	}
	list.push('</tbody></table>');
	$('#golem-dashboard-Generals').html(list.join(''));
	$('#golem-dashboard-Generals tbody tr td:nth-child(2)').css('text-align', 'left');
	if (typeof sort !== 'undefined') {
		$('#golem-dashboard-Generals thead th:eq('+sort+')').attr('name',(rev ? 'reverse' : 'sort')).append('&nbsp;' + (rev ? '&uarr;' : '&darr;'));
	}
}


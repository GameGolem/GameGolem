/********** Worker.Generals **********
* Updates the list of Generals
* Finds best General for other classes
* *** Need to take into account army size and real stats for attack and defense
*/
var Generals = new Worker('Generals', 'heroes_generals');
Generals.data = {};
Generals.best_id = null;
Generals.sort = null;
Generals.parse = function(change) {
	var data, $elements, i, attack, defend, army, gen_att, gen_def, iatt = 0, idef = 0, datt = 0, ddef = 0, listpush = function(list,i){list.push(i);};
	$elements = $('#app'+APP+'_generalContainerBox2 > div > div.generalSmallContainer2')
	if ($elements.length < length(Generals.data)) {
		Page.to('heroes_generals', ''); // Force reload
		return false;
	}
	$elements.each(function(i,el){
		var $child = $(el).children(), name = $child.eq(0).text().trim(), level	= $child.eq(3).text().regex(/Level ([0-9]+)/i);
		if (name) {
			if (!Generals.data[name] || Generals.data[name].level !== level) {
				Generals.data[name] = Generals.data[name] || {};
				Generals.data[name].img		= $child.eq(1).find('input.imgButton').attr('src').filepart();
				Generals.data[name].att		= $child.eq(2).children().eq(0).text().regex(/([0-9]+)/);
				Generals.data[name].def		= $child.eq(2).children().eq(1).text().regex(/([0-9]+)/);
				Generals.data[name].level	= level; // Might only be 4 so far, however...
				Generals.data[name].skills	= $($child.eq(4).html().replace(/\<br\>|\s+|\n/g,' ')).text().trim();
			}
		}
	});
	if (length(Town.data.invade)) {
		for (i in Generals.data) {
			attack = Player.data.attack + (Generals.data[i].skills.regex(/([-+]?[0-9]+) Player Attack/i) || 0) + (Generals.data[i].skills.regex(/Increase Player Attack by ([0-9]+)/i) || 0);
			defend = Player.data.defense + (Generals.data[i].skills.regex(/([-+]?[0-9]+) Player Defense/i) || 0) + (Generals.data[i].skills.regex(/Increase Player Defense by ([0-9]+)/i) || 0);
			army = (Generals.data[i].skills.regex(/Increases? Army Limit to ([0-9]+)/i) || 501);
			gen_att = getAttDef(Generals.data, listpush, 'att', Math.floor(army / 5));
			gen_def = getAttDef(Generals.data, listpush, 'def', Math.floor(army / 5));
			Generals.data[i].invade = {
				att: Math.floor(Town.data.invade.attack + Generals.data[i].att + (Generals.data[i].def * 0.7) + ((attack + (defend * 0.7)) * army) + gen_att),
				def: Math.floor(Town.data.invade.defend + Generals.data[i].def + (Generals.data[i].att * 0.7) + ((defend + (Generals.data[i].skills.regex(/([-+]?[0-9]+) Defense when attacked/i) || 0) + (attack * 0.7)) * army) + gen_def)
			};
			Generals.data[i].duel = {
				att: Math.floor(Town.data.duel.attack + Generals.data[i].att + (Generals.data[i].def * 0.7) + attack + (defend * 0.7)),
				def: Math.floor(Town.data.duel.defend + Generals.data[i].def + (Generals.data[i].att * 0.7) + defend + (attack * 0.7))
			};
		}
	}
	if (Settings.Save(Generals)) {
		Generals.select();
		Dashboard.update(Generals);
	}
	return false;
};
Generals.to = function(name) {
	if (!name || Player.data.general === name || name === 'any') {
		return true;
	}
	if (!Generals.data[name]) {
		GM_log('General "'+name+'" requested but not found!');
		return true; // Not found, so fake it
	}
	if (!Page.to('heroes_generals')) {
		return false;
	}
	GM_debug('Changing to General '+name);
	Page.click('input[src$="'+Generals.data[name].img+'"]');
	return false;
};
Generals.best = function(type) {
	if (!Generals.data) {
		return 'any';
	}
	var rx = '', best = null, bestval = 0, i, value;
	switch(type.toLowerCase()) {
		case 'cost':		rx = /Decrease Soldier Cost by ([0-9]+)/i; break;
		case 'stamina':		rx = /Increase Max Stamina by ([0-9]+)|\+([0-9]+) Max Stamina/i; break;
		case 'energy':		rx = /Increase Max Energy by ([0-9]+)|\+([0-9]+) Max Energy/i; break;
		case 'income':		rx = /Increase Income by ([0-9]+)/i; break;
		case 'influence':	rx = /Bonus Influence ([0-9]+)/i; break;
		case 'attack':		rx = /([-+]?[0-9]+) Player Attack/i; break;
		case 'defense':		rx = /([-+]?[0-9]+) Player Defense/i; break;
		case 'invade':
			for (i in Generals.data) {
				if (!best || (Generals.data[i].invade && Generals.data[i].invade.att > Generals.data[best].invade.att) || (Generals.data[i].invade && Generals.data[i].invade.att === Generals.data[best].invade.att && best !== Player.data.general)) {
					best = i;
				}
			}
			return (best || 'any');
		case 'duel':
			for (i in Generals.data) {
				if (!best || (Generals.data[i].duel && Generals.data[i].duel.att > Generals.data[best].duel.att) || (Generals.data[i].duel && Generals.data[i].duel.att === Generals.data[best].duel.att && best !== Player.data.general)) {
					best = i;
				}
			}
			return (best || 'any');
		case 'defend':
			for (i in Generals.data) {
				if (!best || (Generals.data[i].duel && Generals.data[i].duel.def > Generals.data[best].duel.def) || (Generals.data[i].duel && Generals.data[i].duel.def === Generals.data[best].duel.def && best !== Player.data.general)) {
					best = i;
				}
			}
			return (best || 'any');
		case 'under level 4':
			if (Generals.data[Player.data.general] && Generals.data[Player.data.general].level < 4) {
				return Player.data.general;
			}
			return Generals.random(false);
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
	if (best) {
		GM_debug('Best general found: '+best);
	}
	return best;
};
Generals.random = function(level4) { // Note - true means *include* level 4
	var i, list = [];
	for (i in Generals.data) {
		if (level4) {
			list.push(i);
		} else if (Generals.data[i].level < 4) {
			list.push(i);
		}
	}
	if (list.length) {
		return list[Math.floor(Math.random()*list.length)];
	} else {
		return 'any';
	}
};
Generals.list = function(opts) {
	var i, value, list = [];
	if (!opts) {
		for (i in Generals.data) {
			list.push(i);
		}
		list.sort();
	} else if (opts.find) {
		for (i in Generals.data) {
			if (Generals.data[i].skills.indexOf(opts.find) >= 0) {
				list.push(i);
			}
		}
	} else if (opts.regex) {
		for (i in Generals.data) {
			value = Generals.data[i].skills.regex(opts.regex);
			if (value) {
				list.push([i, value]);
			}
		}
		list.sort(function(a,b) {
			return b[1] - a[1];
		});
//		for (var i in list) list[i] - list[i][0];
	}
	list.unshift('any');
	return list;
};
Generals.select = function() {
	$('select.golem_generals').each(function(a,el){
		$(el).empty();
		var i, tmp = $(el).attr('id').slice(PREFIX.length).regex(/([^_]*)_(.*)/i), value = tmp ? WorkerByName(tmp[0]).option[tmp[1]] : null, list = Generals.list();
		for (i in list) {
			$(el).append('<option value="'+list[i]+'"'+(list[i]===value ? ' selected' : '')+'>'+list[i]+'</value>');
		}
	});
};
Generals.order = [];
Generals.dashboard = function(sort, rev) {
	var i, o, output = [], list = [], iatt = 0, idef = 0, datt = 0, ddef = 0;

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
				type = (sort<5 ? 'invade' : 'duel');
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
	}
	list.push('<table cellspacing="0" style="width:100%"><thead><tr><th></th><th>General</th><th>Level</th><th>Invade<br>Attack</th><th>Invade<br>Defend</th><th>Duel<br>Attack</th><th>Duel<br>Defend</th></tr></thead><tbody>');
	for (o=0; o<Generals.order.length; o++) {
		i = Generals.order[o];
		output = [];
		output.push('<img src="'+Player.data.imagepath+Generals.data[i].img+'" style="width:25px;height:25px;" title="' + Generals.data[i].skills + '">');
		output.push(i);
		output.push(Generals.data[i].level);
		output.push(Generals.data[i].invade ? (iatt == Generals.data[i].invade.att ? '<strong>' : '') + addCommas(Generals.data[i].invade.att) + (iatt == Generals.data[i].invade.att ? '</strong>' : '') : '?')
		output.push(Generals.data[i].invade ? (idef == Generals.data[i].invade.def ? '<strong>' : '') + addCommas(Generals.data[i].invade.def) + (idef == Generals.data[i].invade.def ? '</strong>' : '') : '?');
		output.push(Generals.data[i].duel ? (datt == Generals.data[i].duel.att ? '<strong>' : '') + addCommas(Generals.data[i].duel.att) + (datt == Generals.data[i].duel.att ? '</strong>' : '') : '?');
		output.push(Generals.data[i].duel ? (ddef == Generals.data[i].duel.def ? '<strong>' : '') + addCommas(Generals.data[i].duel.def) + (ddef == Generals.data[i].duel.def ? '</strong>' : '') : '?');
		list.push('<tr><td>' + output.join('</td><td>') + '</td></tr>');
	}
	list.push('</tbody></table>');
	$('#golem-dashboard-Generals').html(list.join(''));
	$('#golem-dashboard-Generals thead th').css('cursor', 'pointer').click(function(event){
		Generals.dashboard($(this).prevAll().length, $(this).attr('name')==='sort');
	});
	$('#golem-dashboard-Generals tbody tr td:nth-child(2)').css('text-align', 'left');
	if (typeof sort !== 'undefined') {
		$('#golem-dashboard-Generals thead th:eq('+sort+')').attr('name',(rev ? 'reverse' : 'sort')).append('&nbsp;' + (rev ? '&uarr;' : '&darr;'));
	}
}


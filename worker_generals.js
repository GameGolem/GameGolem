/********** Worker.Generals **********
* Updates the list of Generals
* Finds best General for other classes
* *** Need to take into account army size and real stats for attack and defense
*/
var Generals = new Worker('General', 'heroes_generals');
Generals.data = {};
Generals.best_id = null;
Generals.parse = function(change) {
	var data, i, attack, defend, army, gen_att, gen_def, iatt = 0, idef = 0, datt = 0, ddef = 0, listpush = function(list,i){list.push(i);};
	if (!change) {
		data = {};
		$('#app'+APP+'_generalContainerBox2 > div > div.generalSmallContainer2').each(function(i,el){
			var $child = $(el).children(), name = $child.eq(0).text().trim();
			if (name) {
				data[name] = {};
				data[name].img		= $child.eq(1).find('input.imgButton').attr('src').filepart();
				data[name].att		= $child.eq(2).children().eq(0).text().regex(/([0-9]+)/);
				data[name].def		= $child.eq(2).children().eq(1).text().regex(/([0-9]+)/);
				data[name].level	= $child.eq(3).text().regex(/Level ([0-9]+)/i); // Might only be 4 so far, however...
				data[name].skills	= $($child.eq(4).html().replace(/\<br\>|\s+|\n/g,' ')).text().trim();
			}
		});
		if (length(data) >= length(Generals.data)) { // Assume we never sell!
			Generals.data = data;
			Generals.select();
		} else {
			Page.to('heroes_generals', ''); // Force reload
		}
	} else if (length(Town.data.invade)) {
		data = Generals.data;
		for (i in data) {
			attack = Player.data.attack + (data[i].skills.regex(/([-+]?[0-9]+) Player Attack/i) || 0) + (data[i].skills.regex(/Increase Player Attack by ([0-9]+)/i) || 0);
			defend = Player.data.defense + (data[i].skills.regex(/([-+]?[0-9]+) Player Defense/i) || 0) + (data[i].skills.regex(/Increase Player Defense by ([0-9]+)/i) || 0);
			army = (data[i].skills.regex(/Increases? Army Limit to ([0-9]+)/i) || 501);
			gen_att = getAttDef(Generals.data, listpush, 'att', Math.floor(army / 5));
			gen_def = getAttDef(data, listpush, 'def', Math.floor(army / 5));
			data[i].invade = {
				att: Math.floor(Town.data.invade.attack + data[i].att + (data[i].def * 0.7) + ((attack + (defend * 0.7)) * army) + gen_att),
				def: Math.floor(Town.data.invade.defend + data[i].def + (data[i].att * 0.7) + ((defend + (data[i].skills.regex(/([-+]?[0-9]+) Defense when attacked/i) || 0) + (attack * 0.7)) * army) + gen_def)
			};
			data[i].duel = {
				att: Math.floor(Town.data.duel.attack + data[i].att + (data[i].def * 0.7) + attack + (defend * 0.7)),
				def: Math.floor(Town.data.duel.defend + data[i].def + (data[i].att * 0.7) + defend + (attack * 0.7))
			};
		}
		for (i in Generals.data) {
			iatt = Math.max(iatt, Generals.data[i].invade.att);
			idef = Math.max(idef, Generals.data[i].invade.def);
			datt = Math.max(datt, Generals.data[i].duel.att);
			ddef = Math.max(ddef, Generals.data[i].duel.def);
		}
		$('#app'+APP+'_generalContainerBox2 > div > div.generalSmallContainer2').each(function(i,el){
			var $child = $(el).children(), name = $child.eq(0).text().trim();
			$child.eq(1).prepend('<div style="position:absolute;margin-left:8px;margin-top:2px;font-size:smaller;text-align:left;z-index:100;color:#ffd200;text-shadow:black 1px 1px 2px;"><strong>Invade</strong><br>&nbsp;&nbsp;&nbsp;Atk: '+(data[name].invade.att===iatt?'<span style="font-weight:bold;color:#00ff00;">':'')+addCommas(data[name].invade.att)+(data[name].invade.att===iatt?'</span>':'')+'<br>&nbsp;&nbsp;&nbsp;Def: '+(data[name].invade.def===idef?'<span style="font-weight:bold;color:#00ff00;">':'')+addCommas(data[name].invade.def)+(data[name].invade.def===idef?'</span>':'')+'<br><strong>Duel</strong><br>&nbsp;&nbsp;&nbsp;Atk: '+(data[name].duel.att===datt?'<span style="font-weight:bold;color:#00ff00;">':'')+addCommas(data[name].duel.att)+(data[name].duel.att===datt?'</span>':'')+'<br>&nbsp;&nbsp;&nbsp;Def: '+(data[name].duel.def===ddef?'<span style="font-weight:bold;color:#00ff00;">':'')+addCommas(data[name].duel.def)+(data[name].duel.def===ddef?'</span>':'')+'<br></div>');
		});
	}
	return true;
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
				if (!best || (Generals.data[i].invade && Generals.data[i].invade.att >= Generals.data[best].invade.att)) {
					if (Generals.data[i].invade.att > Generals.data[best].invade.att || best !== Player.data.general) {
						best = i;
					}
				}
			}
			return (best || 'any');
		case 'duel':
			for (i in Generals.data) {
				if (!best || (Generals.data[i].duel && Generals.data[i].duel.att >= Generals.data[best].duel.att)) {
					if (Generals.data[i].duel.att > Generals.data[best].duel.att || best !== Player.data.general) {
						best = i;
					}
				}
			}
			return (best || 'any');
		case 'defend':
			for (i in Generals.data) {
				if (!best || (Generals.data[i].duel && Generals.data[i].duel.def >= Generals.data[best].duel.def)) {
					if (Generals.data[i].duel.def > Generals.data[best].duel.def || best !== Player.data.general) {
						best = i;
					}
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


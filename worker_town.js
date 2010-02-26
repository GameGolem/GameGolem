/********** Worker.Town **********
* Sorts and auto-buys all town units (not property)
*/
var Town = new Worker('Town', 'town_soldiers town_blacksmith town_magic town_land');
Town.data = {
	soldiers: {},
	blacksmith: {},
	magic: {},
	land: {}
};
Town.display = [
	{
		label:'Work in progress...'
	},{
		id:'general',
		label:'Buy Number:',
		select:['None', 'Maximum', 'Match Army']
	},{
		id:'units',
		label:'Buy Type:',
		select:['All', 'Best Offense', 'Best Defense', 'Best of Both']
	}
];
Town.units = {};
Town.cache = {}; // for quick sorting
Town.table = null; // table units are in
Town.header = {};
Town.blacksmith = { // Shield must come after armor (currently)
	Weapon:	/avenger|axe|blade|bow|cudgel|dagger|halberd|mace|morningstar|rod|saber|spear|staff|stave|sword|talon|trident|wand|Daedalus|Dragonbane|Dreadnought Greatsword|Excalibur|Incarnation|Ironhart's Might|Judgement|Justice|Lightbringer|Oathkeeper|Onslaught/i,
	Shield:	/buckler|shield|tome|Defender|Dragon Scale|Frost Dagger|Frost Tear Dagger|Harmony|Sword of Redemption|The Dreadnought/i,
	Helmet:	/cowl|crown|helm|horns|mask|veil/i,
	Gloves:	/gauntlet|glove|hand|bracer|Slayer's Embrace/i,
	Armor:	/armor|chainmail|cloak|pauldrons|plate|robe|Blood Vestment|Faerie Wings|Ogre Raiments/i,
	Amulet:	/amulet|bauble|charm|eye|heart|jewel|lantern|memento|orb|shard|soul|talisman|trinket|Paladin's Oath|Poseidons Horn/i
};
Town.parse = function(change) {
	var land, landlist, unit, unitlist, tmp;
	if (!change) {
		if (Page.page==='town_land') {
			land = Town.data.land = {};
			landlist = $('tr.land_buy_row,tr.land_buy_row_unique');
			landlist.each(function(i,el){
				var name = $('img', el).attr('alt');
				land[name] = {};
				land[name].income = $('.land_buy_info .gold', el).text().replace(/[^0-9]/g,'').regex(/([0-9]+)/);
				land[name].max = $('.land_buy_info', el).text().regex(/Max Allowed For your level: ([0-9]+)/i);
				land[name].cost = $('.land_buy_costs .gold', el).text().replace(/[^0-9]/g,'').regex(/([0-9]+)/);
				land[name].own = $('.land_buy_costs span', el).text().replace(/[^0-9]/g,'').regex(/([0-9]+)/);
			});
			GM_debug('Land: '+Town.data.land.toSource());
		} else {
			switch (Page.page) {
				case 'town_soldiers':
					unit = Town.data.soldiers = {};
					break;
				case 'town_blacksmith':
					unit = Town.data.blacksmith = {};
					break;
				case 'town_magic':
					unit = Town.data.magic = {};
					break;
				default:
					// Error... somehow...
					return false;
			}
			unitlist = $('tr.eq_buy_row,tr.eq_buy_row2');
			unitlist.each(function(a,el){
				var i, name = $('div.eq_buy_txt strong:first-child', el).text().trim(),
					cost = $('div.eq_buy_costs strong:first-child', el).text().replace(/[^0-9]/g, '');
				Town.cache[name] = el;
				unit[name] = {};
				if (cost) {
					unit[name].cost = parseInt(cost, 10);
					unit[name].buy = [];
					$('div.eq_buy_costs select[name="amount"]:first option', el).each(function(i,el){
						unit[name].buy.push(parseInt($(el).val(), 10));
					});
				}
				unit[name].img = $('div.eq_buy_image img', el).attr('src').filepart();
				unit[name].own = $('div.eq_buy_costs span:first-child', el).text().regex(/([0-9]+)/);
				unit[name].att = $('div.eq_buy_stats div:first-child', el).text().regex(/([0-9]+)/);
				unit[name].def = $('div.eq_buy_stats div:last-child', el).text().regex(/([0-9]+)/);
				if (Page.page==='town_blacksmith') {
					for (i in Town.blacksmith) {
						if (name.match(Town.blacksmith[i])) {
							unit[name].type = i;
						}
					}
				}
			});
			Town.table = $(unitlist).first().parent();
			this.header = {};
			$(this.table).children().each(function(i,el) {
				if (!$(el).attr('class')) {
					Town.header[i] = [el, $(el).next()];
				}
			});
			Town.units = unit;
		}
		if (Page.page !== 'town_land' && length(Town.data.soldiers) && length(Town.data.blacksmith) && length(Town.data.magic)) {
			Town.getValues();
		}
	} else {
		if (Page.page==='town_blacksmith') {
			unit = Town.data.blacksmith;
			$('tr.eq_buy_row,tr.eq_buy_row2').each(function(i,el){
				var name = $('div.eq_buy_txt strong:first-child', el).text().trim();
				if (unit[name].type) {
					$('div.eq_buy_txt strong:first-child', el).parent().append('<br>'+unit[name].type);
				}
			});
		}
		if (Page.page !== 'town_land') {
			tmp = $('<tr><td><div style="padding:9px 0px 0px 15px; width:725px; height:28px;">Sort by <a id="sort_none">Normal</a> / <a id="sort_attack">Attack</a> / <a id="sort_defense">Defense</a></div></td></tr>');
			$('div', tmp).css({ backgroundImage:$('div[style*="hero_divider.gif"]').first().css('background-image'), color:'#fff', fontSize:'16px', fontWeight:'bold' });
			$('#sort_none', tmp).click(function(){Town.sortBy();});
			$('#sort_attack', tmp).click(function(){Town.sortBy('att');});
			$('#sort_defense', tmp).click(function(){Town.sortBy('def');});
			$(this.table).prepend(tmp);
			Town.dashboard();
		}
	}
	return true;
};
Town.work = function(state) {
	if (!Town.option.number) {
		return false;
	}
	var i, j, max = Math.min(Town.option.number==='Maximum' ? 501 : Player.data.army, 501), best = null, count = 0, gold = Player.data.gold + Player.data.bank, units = Town.data.soldiers;
	for (i in units) {
		count = 0;
		if (!units[i].cost || units[i].own >= max || (best && Town.option.units === 'Best Offense' && units[i].att <= best.att) || (best && Town.option.units === 'Best Defense' && units[i].def <= best.def) || (best && Town.option.units === 'Best of Both' && (units[i].att <= best.att || units[i].def <= best.def))) {
			continue;
		}
		for (j in units[i].buy) {
			if ((max - units[i].own) >= units[i].buy[j]) {
				count = units[i].buy[j]; // && (units[i].buy[j] * units[i].cost) < gold
			}
		}
		GM_debug('Thinking about buying: '+count+' of '+i+' at $'+(count * units[i].cost));
		if (count) {
			best = i;
			break;
		}
	}
	if (!best) {
		return false;
	}
	if (!state) {
		GM_debug('Want to buy '+count+' x '+best+' at $'+(count * units[best].cost));
		return true;
	}
//	if (!Bank.retrieve(best.cost * count)) return true;
//	if (Player.data.gold < best.cost) return false; // We're poor!
//	if (!Page.to('town_soldiers')) return true;
	return false;
};
Town.sortBy = function(x) {
	var i, units = [], x2 = (x==='att'?'def':'att');
	if (!x) {
		for (i in Town.units) {
			$(Town.table).append($(Town.cache[i]));
		}
		for (i in Town.header) {
			$($(Town.header[i][1])).before($(Town.header[i][0]));
			$(Town.header[i][0]).css('display','table-row');
		}
	} else {
		for (i in Town.units) {
			units.push(i);
		}
// We now check the actual total value rather than just the absolute values
//		units.sort(function(a,b) { return Town.units[b][x2] - Town.units[a][x2]; });
//		units.sort(function(a,b) { return Town.units[b][x] - Town.units[a][x]; });
		units.sort(function(a,b) {
			return (Town.units[b][x] + (0.7 * Town.units[b][x2])) - (Town.units[a][x] + (0.7 * Town.units[a][x2]));
		});
		for (i=0; i<units.length; i++) {
			$(Town.table).append($(Town.cache[units[i]]));
		}
		for (i in Town.header) {
			$(Town.header[i]).css('display','none');
		}
	}
};
Town.getValues = function() {
	var listpush = function(list,i){list.push(i);},
		listpushweapon = function(list,i,units){if (units[i].type === 'Weapon'){list.push(i);}},
		listpushnotweapon = function(list,i,units){if (units[i].type !== 'Weapon'){list.push(i);}},
		listpushshield = function(list,i,units){if (units[i].type === 'Shield'){list.push(i);}},
		listpushhelmet = function(list,i,units){if (units[i].type === 'Helmet'){list.push(i);}},
		listpushgloves = function(list,i,units){if (units[i].type === 'Gloves'){list.push(i);}},
		listpusharmor = function(list,i,units){if (units[i].type === 'Armor'){list.push(i);}},
		listpushamulet = function(list,i,units){if (units[i].type === 'Amulet'){list.push(i);}};
	Town.data.invade = {
		attack:	getAttDef(Town.data.soldiers, listpush, 'att', Player.data.army, 'invade')
			+	getAttDef(Town.data.blacksmith, listpushweapon, 'att', Player.data.army, 'invade')
			+	getAttDef(Town.data.blacksmith, listpushnotweapon, 'att', Player.data.army, 'invade')
			+	getAttDef(Town.data.magic, listpush, 'att', Player.data.army, 'invade'),
		defend:	getAttDef(Town.data.soldiers, listpush, 'def', Player.data.army, 'invade')
			+	getAttDef(Town.data.blacksmith, listpushweapon, 'def', Player.data.army, 'invade')
			+	getAttDef(Town.data.blacksmith, listpushnotweapon, 'def', Player.data.army, 'invade')
			+	getAttDef(Town.data.magic, listpush, 'def', Player.data.army, 'invade')
	};
	Town.data.duel = {
		attack:	getAttDef(Town.data.blacksmith, listpushweapon, 'att', 1, 'duel')
			+	getAttDef(Town.data.blacksmith, listpushshield, 'att', 1, 'duel')
			+	getAttDef(Town.data.blacksmith, listpushhelmet, 'att', 1, 'duel')
			+	getAttDef(Town.data.blacksmith, listpushgloves, 'att', 1, 'duel')
			+	getAttDef(Town.data.blacksmith, listpusharmor, 'att', 1, 'duel')
			+	getAttDef(Town.data.blacksmith, listpushamulet, 'att', 1, 'duel')
			+	getAttDef(Town.data.magic, listpush, 'att', 1, 'duel'),
		defend:	getAttDef(Town.data.blacksmith, listpushweapon, 'def', 1, 'duel')
			+	getAttDef(Town.data.blacksmith, listpushshield, 'def', 1, 'duel')
			+	getAttDef(Town.data.blacksmith, listpushhelmet, 'def', 1, 'duel')
			+	getAttDef(Town.data.blacksmith, listpushgloves, 'def', 1, 'duel')
			+	getAttDef(Town.data.blacksmith, listpusharmor, 'def', 1, 'duel')
			+	getAttDef(Town.data.blacksmith, listpushamulet, 'def', 1, 'duel')
			+	getAttDef(Town.data.magic, listpush, 'def', 1, 'duel')
	};
//	GM_debug('Town Invade: '+Town.data.invade.toSource()+', Town Duel: '+Town.data.duel.toSource());
};

var makeTownDash = function(list, unitfunc, x, type, name, count) { // Find total att(ack) or def(ense) value from a list of objects (with .att and .def)
	var units = [], output = [], x2 = (x==='att'?'def':'att'), i, order = {Weapon:1, Shield:2, Helmet:3, Armor:4, Amulet:5, Gloves:6, Magic:7};
	if (name) {
		output.push('<div class="golem-panel"><h3 class="golem-panel-header">'+name+'</h3><div class="golem-panel-content">');
	}
	for (i in list) {
		unitfunc(units, i, list);
	}
	if (type === 'duel' && list[units[0]].type) {
		units.sort(function(a,b) {
			return order[list[a].type] - order[list[b].type];
		});
	} else if (list[units[0]] && list[units[0]].skills && list[units[0]][type]) {
		units.sort(function(a,b) {
			return (list[b][type][x] || 0) - (list[a][type][x] || 0);
		});
	} else {
		units.sort(function(a,b) {
			return (list[b][x] + (0.7 * list[b][x2])) - (list[a][x] + (0.7 * list[a][x2]));
		});
	}
	for (i=0; i<(count ? count : units.length); i++) {
		if ((list[units[0]] && list[units[0]].skills) || (list[units[i]].use && list[units[i]].use[type+'_'+x])) {
			output.push('<div style="height:25px;margin:1px;"><img src="'+Player.data.imagepath+list[units[i]].img+'" style="width:25px;height:25px;float:left;margin-right:4px;">'+(list[units[i]].use ? list[units[i]].use[type+'_'+x]+' x ' : '')+units[i]+' ('+list[units[i]].att+' / '+list[units[i]].def+')'+(list[units[i]].cost?'<br>$'+addCommas(list[units[i]].cost):'')+'</div>');
		}
	}
	if (name) {
		output.push('</div></div>');
	}
	return output.join('');
};


Town.dashboard = function() {
	var left, right, duel = {}, best;
	var listpush = function(list,i){list.push(i);},
		listpushweapon = function(list,i,units){if (units[i].type === 'Weapon'){list.push(i);}},
		listpushnotweapon = function(list,i,units){if (units[i].type !== 'Weapon'){list.push(i);}};

	best = Generals.best('duel');
	left = '<div style="float:left;width:50%;"><div class="golem-panel"><h3 class="golem-panel-header">Invade - Attack</h3><div class="golem-panel-content" style="padding:8px;">'
			+	makeTownDash(Generals.data, listpush, 'att', 'invade', 'Heroes')
			+	makeTownDash(Town.data.soldiers, listpush, 'att', 'invade', 'Soldiers')
			+	makeTownDash(Town.data.blacksmith, listpushweapon, 'att', 'invade', 'Weapons')
			+	makeTownDash(Town.data.blacksmith, listpushnotweapon, 'att', 'invade', 'Equipment')
			+	makeTownDash(Town.data.magic, listpush, 'att', 'invade', 'Magic')
			+	'</div></div><div class="golem-panel"><h3 class="golem-panel-header">Duel - Attack</h3><div class="golem-panel-content" style="padding:8px;">'
			+	(best !== 'any' ? '<div style="height:25px;margin:1px;"><img src="'+Player.data.imagepath+Generals.data[best].img+'" style="width:25px;height:25px;float:left;margin-right:4px;">'+best+' ('+Generals.data[best].att+' / '+Generals.data[best].def+')</div>' : '')
			+	makeTownDash(Town.data.blacksmith, listpush, 'att', 'duel')
			+	makeTownDash(Town.data.magic, listpush, 'att', 'duel')
			+'</div></div></div>';
	best = Generals.best('defend');
	right = '<div style="float:right;width:50%;"><div class="golem-panel"><h3 class="golem-panel-header">Invade - Defend</h3><div class="golem-panel-content" style="padding:8px;">'
			+	makeTownDash(Generals.data, listpush, 'def', 'invade', 'Heroes')
			+	makeTownDash(Town.data.soldiers, listpush, 'def', 'invade', 'Soldiers')
			+	makeTownDash(Town.data.blacksmith, listpushweapon, 'def', 'invade', 'Weapons')
			+	makeTownDash(Town.data.blacksmith, listpushnotweapon, 'def', 'invade', 'Equipment')
			+	makeTownDash(Town.data.magic, listpush, 'def', 'invade', 'Magic')
			+	'</div></div><div class="golem-panel"><h3 class="golem-panel-header">Duel - Defend</h3><div class="golem-panel-content" style="padding:8px;">'
			+	(best !== 'any' ? '<div style="height:25px;margin:1px;"><img src="'+Player.data.imagepath+Generals.data[best].img+'" style="width:25px;height:25px;float:left;margin-right:4px;">'+best+' ('+Generals.data[best].att+' / '+Generals.data[best].def+')</div>' : '')
			+	makeTownDash(Town.data.blacksmith, listpush, 'def', 'duel')
			+	makeTownDash(Town.data.magic, listpush, 'def', 'duel')
			+'</div></div></div>';

	$('#golem-dashboard-Town').html(left+right);
}


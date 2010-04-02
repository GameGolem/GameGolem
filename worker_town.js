/********** Worker.Town **********
* Sorts and auto-buys all town units (not property)
*/
var Town = new Worker('Town', 'town_soldiers town_blacksmith town_magic', {keep:true});
Town.data = {
	soldiers: {},
	blacksmith: {},
	magic: {}
};
Town.option = {
	number:'Minimum',
	units:'All',
	sell:false
};

Town.display = [
	{
		label:'Work in progress...'
	},{
		id:'number',
		label:'Buy Number',
		select:['None', 'Minimum', 'Match Army', 'Maximum'],
		help:'Minimum will buy before any quests (otherwise only bought when needed), Maximum will buy 501 (depending on generals)'
	},{
		advanced:true,
		id:'units',
		label:'Buy Type',
		select:['All', 'Best Offense', 'Best Defense', 'Best of Both']
	},{
		advanced:true,
		id:'sell',
		label:'Auto-Sell<br>(Not enabled)',
		checkbox:true
	}
];

Town.blacksmith = { // Shield must come after armor (currently)
	Weapon:	/avenger|axe|blade|bow|cudgel|dagger|halberd|mace|morningstar|rod|saber|spear|staff|stave|sword|talon|trident|wand|Daedalus|Dragonbane|Dreadnought Greatsword|Excalibur|Incarnation|Ironhart's Might|Judgement|Justice|Lightbringer|Oathkeeper|Onslaught/i,
	Shield:	/buckler|shield|tome|Defender|Dragon Scale|Frost Dagger|Frost Tear Dagger|Harmony|Sword of Redemption|The Dreadnought/i,
	Helmet:	/cowl|crown|helm|horns|mask|veil/i,
	Gloves:	/gauntlet|glove|hand|bracer|Slayer's Embrace/i,
	Armor:	/armor|chainmail|cloak|pauldrons|plate|robe|Blood Vestment|Faerie Wings|Ogre Raiments/i,
	Amulet:	/amulet|bauble|charm|eye|heart|jewel|lantern|memento|orb|shard|soul|talisman|trinket|Paladin's Oath|Poseidons Horn/i
};

Town.parse = function(change) {
	if (!change) {
		var unit = {};
		$('.eq_buy_row,.eq_buy_row2').each(function(a,el){
			var i, costs = $('div.eq_buy_costs', el), stats = $('div.eq_buy_stats', el), name = $('div.eq_buy_txt strong:first-child', el).text().trim(),
				cost = $('strong:first-child', costs).text().replace(/[^0-9]/g, '');
			unit[name] = {};
			if (cost) {
				unit[name].cost = parseInt(cost, 10);
				unit[name].buy = [];
				$('select[name="amount"]:first option', costs).each(function(i,el){
					unit[name].buy.push(parseInt($(el).val(), 10));
				});
			}
			unit[name].img = $('div.eq_buy_image img', el).attr('src').filepart();
			unit[name].own = $('span:first-child', costs).text().regex(/Owned: ([0-9]+)/i);
			unit[name].att = $('div:first-child', stats).text().regex(/([0-9]+)/);
			unit[name].def = $('div:last-child', stats).text().regex(/([0-9]+)/);
			if (Page.page==='town_blacksmith') {
				for (i in Town.blacksmith) {
					if (name.match(Town.blacksmith[i])) {
						unit[name].type = i;
					}
				}
			}
		});
		Town.data[Page.page.substr(5)] = unit;
	} else {
		if (Page.page==='town_blacksmith') {
			$('.eq_buy_row,.eq_buy_row2').each(function(i,el){
				var $el = $('div.eq_buy_txt strong:first-child', el), name = $el.text().trim();
				if (Town.data.blacksmith[name].type) {
					$el.parent().append('<br>'+Town.data.blacksmith[name].type);
				}
			});
		}
	}
	return true;
};

Town.update = function(type) {
	var ia = 0, id = 0, da = 0, dd = 0, pa = Player.get('army'),
		listpush = function(list,i){list.push(i);},
		listpushweapon = function(list,i,units){if (units[i].type === 'Weapon'){list.push(i);}},
		listpushnotweapon = function(list,i,units){if (units[i].type !== 'Weapon'){list.push(i);}},
		listpushshield = function(list,i,units){if (units[i].type === 'Shield'){list.push(i);}},
		listpushhelmet = function(list,i,units){if (units[i].type === 'Helmet'){list.push(i);}},
		listpushgloves = function(list,i,units){if (units[i].type === 'Gloves'){list.push(i);}},
		listpusharmor = function(list,i,units){if (units[i].type === 'Armor'){list.push(i);}},
		listpushamulet = function(list,i,units){if (units[i].type === 'Amulet'){list.push(i);}};
	ia += getAttDef(Town.data.soldiers, listpush, 'att', pa, 'invade');
	id += getAttDef(Town.data.soldiers, null, 'def', pa, 'invade');
	ia += getAttDef(Town.data.blacksmith, listpushnotweapon, 'att', pa, 'invade');
	id += getAttDef(Town.data.blacksmith, null, 'def', pa, 'invade');
	ia += getAttDef(Town.data.blacksmith, listpushweapon, 'att', pa, 'invade');
	id += getAttDef(Town.data.blacksmith, null, 'def', pa, 'invade');
	da += getAttDef(Town.data.blacksmith, null, 'att', 1, 'duel');
	dd += getAttDef(Town.data.blacksmith, null, 'def', 1, 'duel');
	ia += getAttDef(Town.data.magic, listpush, 'att', pa, 'invade');
	id += getAttDef(Town.data.magic, null, 'def', pa, 'invade');
	da += getAttDef(Town.data.magic, null, 'att', 1, 'duel');
	dd += getAttDef(Town.data.magic, null, 'def', 1, 'duel');
	da += getAttDef(Town.data.blacksmith, listpushshield, 'att', 1, 'duel');
	dd += getAttDef(Town.data.blacksmith, null, 'def', 1, 'duel');
	da += getAttDef(Town.data.blacksmith, listpushhelmet, 'att', 1, 'duel');
	dd += getAttDef(Town.data.blacksmith, null, 'def', 1, 'duel');
	da += getAttDef(Town.data.blacksmith, listpushgloves, 'att', 1, 'duel');
	dd += getAttDef(Town.data.blacksmith, null, 'def', 1, 'duel');
	da += getAttDef(Town.data.blacksmith, listpusharmor, 'att', 1, 'duel');
	dd += getAttDef(Town.data.blacksmith, null, 'def', 1, 'duel');
	da += getAttDef(Town.data.blacksmith, listpushamulet, 'att', 1, 'duel');
	dd += getAttDef(Town.data.blacksmith, null, 'def', 1, 'duel');
	Town.data.invade = { attack:ia, defend:id };
	Town.data.duel = { attack:da, defend:dd };
};

Town.work = function(state) {
	if (!Town.option.number) {
		return false;
	}
	var i, j, max = Math.min(Town.option.number==='Maximum' ? 501 : Player.get('army'), 501), best = null, count = 0, gold = Bank.worth(), units = Town.data.soldiers;
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
		debug('Thinking about buying: '+count+' of '+i+' at $'+(count * units[i].cost));
		if (count) {
			best = i;
			break;
		}
	}
	if (!best) {
		return false;
	}
	if (!state) {
		debug('Want to buy '+count+' x '+best+' at $'+(count * units[best].cost));
		return true;
	}
//	if (!Bank.retrieve(best.cost * count)) return true;
//	if (Bank.worth() < best.cost) return false; // We're poor!
//	if (!Page.to('town_soldiers')) return true;
	return false;
};

var makeTownDash = function(list, unitfunc, x, type, name, count) { // Find total att(ack) or def(ense) value from a list of objects (with .att and .def)
	var units = [], output = [], x2 = (x==='att'?'def':'att'), i, order = {Weapon:1, Shield:2, Helmet:3, Armor:4, Amulet:5, Gloves:6, Magic:7};
	if (name) {
		output.push('<div class="golem-panel"><h3 class="golem-panel-header">'+name+'</h3><div class="golem-panel-content">');
	}
	for (i in list) {
		unitfunc(units, i, list);
	}
	if (list[units[0]]) {
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
	}
	for (i=0; i<(count ? count : units.length); i++) {
		if ((list[units[0]] && list[units[0]].skills) || (list[units[i]].use && list[units[i]].use[type+'_'+x])) {
			output.push('<div style="height:25px;margin:1px;"><img src="' + imagepath + list[units[i]].img + '" style="width:25px;height:25px;float:left;margin-right:4px;">' + (list[units[i]].use ? list[units[i]].use[type+'_'+x]+' x ' : '') + units[i] + ' (' + list[units[i]].att + ' / ' + list[units[i]].def + ')' + (list[units[i]].cost?'<br>$'+addCommas(list[units[i]].cost):'') + '</div>');
		}
	}
	if (name) {
		output.push('</div></div>');
	}
	return output.join('');
};

Town.dashboard = function() {
	var left, right, generals = Generals.get(), duel = {}, best,
		listpush = function(list,i){list.push(i);},
		usepush = function(list,i,units){if (units[i].use){list.push(i);}},
		usepushweapon = function(list,i,units){if (units[i].use && units[i].type === 'Weapon'){list.push(i);}},
		usepushnotweapon = function(list,i,units){if (units[i].use && units[i].type !== 'Weapon'){list.push(i);}};
	best = Generals.best('duel');
	left = '<div style="float:left;width:50%;"><div class="golem-panel"><h3 class="golem-panel-header">Invade - Attack</h3><div class="golem-panel-content" style="padding:8px;">'
			+	makeTownDash(generals, listpush, 'att', 'invade', 'Heroes')
			+	makeTownDash(Town.data.soldiers, usepush, 'att', 'invade', 'Soldiers')
			+	makeTownDash(Town.data.blacksmith, usepushweapon, 'att', 'invade', 'Weapons')
			+	makeTownDash(Town.data.blacksmith, usepushnotweapon, 'att', 'invade', 'Equipment')
			+	makeTownDash(Town.data.magic, usepush, 'att', 'invade', 'Magic')
			+	'</div></div><div class="golem-panel"><h3 class="golem-panel-header">Duel - Attack</h3><div class="golem-panel-content" style="padding:8px;">'
			+	(best !== 'any' ? '<div style="height:25px;margin:1px;"><img src="' + imagepath + generals[best].img + '" style="width:25px;height:25px;float:left;margin-right:4px;">' + best + ' (' + generals[best].att + ' / ' + generals[best].def + ')</div>' : '')
			+	makeTownDash(Town.data.blacksmith, usepush, 'att', 'duel')
			+	makeTownDash(Town.data.magic, usepush, 'att', 'duel')
			+'</div></div></div>';
	best = Generals.best('defend');
	right = '<div style="float:right;width:50%;"><div class="golem-panel"><h3 class="golem-panel-header">Invade - Defend</h3><div class="golem-panel-content" style="padding:8px;">'
			+	makeTownDash(generals, listpush, 'def', 'invade', 'Heroes')
			+	makeTownDash(Town.data.soldiers, usepush, 'def', 'invade', 'Soldiers')
			+	makeTownDash(Town.data.blacksmith, usepushweapon, 'def', 'invade', 'Weapons')
			+	makeTownDash(Town.data.blacksmith, usepushnotweapon, 'def', 'invade', 'Equipment')
			+	makeTownDash(Town.data.magic, usepush, 'def', 'invade', 'Magic')
			+	'</div></div><div class="golem-panel"><h3 class="golem-panel-header">Duel - Defend</h3><div class="golem-panel-content" style="padding:8px;">'
			+	(best !== 'any' ? '<div style="height:25px;margin:1px;"><img src="' + imagepath + generals[best].img + '" style="width:25px;height:25px;float:left;margin-right:4px;">' + best + ' (' + generals[best].att + ' / ' + generals[best].def + ')</div>' : '')
			+	makeTownDash(Town.data.blacksmith, usepush, 'def', 'duel')
			+	makeTownDash(Town.data.magic, usepush, 'def', 'duel')
			+'</div></div></div>';

	$('#golem-dashboard-Town').html(left+right);
};


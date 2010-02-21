/********** Worker.Town **********
* Sorts and auto-buys all town units (not property)
*/
Town = new Worker('Town', 'town_soldiers town_blacksmith town_magic town_land');
Town.units = {};
Town.cache = {}; // for quick sorting
Town.table = null; // table units are in
Town.header = {};
Town.blacksmith = { // Shield must come after armor (currently)
	Weapon:	/avenger|axe|blade|bow|dagger|halberd|mace|morningstar|rod|spear|staff|stave|sword|talon|trident|wand|Dragonbane|Ironhart's Might|Judgement|Oathkeeper/i,
	Shield:	/buckler|shield|dreadnought|Defender|Sword of Redemption/i,
	Helmet:	/cowl|crown|helm|horns|mask|veil/i,
	Gloves:	/gauntlet|glove|hand/i,
	Armor:	/armor|chainmail|cloak|pauldrons|plate|robe/i,
	Amulet:	/amulet|bauble|charm|jewel|memento|orb|shard|trinket|Paladin's Oath|Poseidons Horn/i
};
Town.onload = function() {
	if (!Town.data.soldiers) Town.data.soldiers = {};
	if (!Town.data.blacksmith) Town.data.blacksmith = {};
	if (!Town.data.magic) Town.data.magic = {};
	if (!Town.data.land) Town.data.land = {};
}
Town.parse = function(change) {
	if (!change) {
		if (Page.page=='town_land') {
			var land = Town.data.land = {};
			var landlist = $('tr.land_buy_row,tr.land_buy_row_unique');
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
			if (Page.page=='town_soldiers') var unit = Town.data.soldiers = {};
			else if (Page.page=='town_blacksmith') var unit = Town.data.blacksmith = {};
			else if (Page.page=='town_magic') var unit = Town.data.magic = {};
			var unitlist = $('tr.eq_buy_row,tr.eq_buy_row2');
			unitlist.each(function(i,el){
				var name = $('div.eq_buy_txt strong:first-child', el).text().trim();
				Town.cache[name] = el;
				unit[name] = {};
				var cost = $('div.eq_buy_costs strong:first-child', el).text().replace(/[^0-9]/g, '');
				if (cost) {
					unit[name].cost = parseInt(cost);
					unit[name].buy = [];
					$('div.eq_buy_costs select[name="amount"]:first option', el).each(function(i,el){
						unit[name].buy.push(parseInt($(el).val()));
					});
				}
				unit[name].own = $('div.eq_buy_costs span:first-child', el).text().regex(/([0-9]+)/);
				unit[name].att = $('div.eq_buy_stats div:first-child', el).text().regex(/([0-9]+)/);
				unit[name].def = $('div.eq_buy_stats div:last-child', el).text().regex(/([0-9]+)/);
				if (Page.page=='town_blacksmith') {
					for (var i in Town.blacksmith) if (name.match(Town.blacksmith[i])) unit[name].type = i;
				}
			});
			Town.table = $(unitlist).first().parent();
			this.header = {};
			$(this.table).children().each(function(i,el) {
				if (!$(el).attr('class')) Town.header[i] = [el, $(el).next()];
			});
			Town.units = unit;
		}
		if (Page.page != 'town_land' && length(Town.data.soldiers) && length(Town.data.blacksmith) && length(Town.data.magic)) {
			Town.getValues();
		}
	} else {
		if (Page.page=='town_blacksmith') {
			var unit = Town.data.blacksmith;
			$('tr.eq_buy_row,tr.eq_buy_row2').each(function(i,el){
				var name = $('div.eq_buy_txt strong:first-child', el).text().trim();
				if (unit[name].type) {
					$('div.eq_buy_txt strong:first-child', el).parent().append('<br>'+unit[name].type);
				}
			});
		}
		if (Page.page != 'town_land') {
			var tmp = $('<tr><td><div style="padding:9px 0px 0px 15px; width:725px; height:28px;">Sort by <a id="sort_none">Normal</a> / <a id="sort_attack">Attack</a> / <a id="sort_defense">Defense</a></div></td></tr>');
			$('div', tmp).css({ backgroundImage:$('div[style*="hero_divider.gif"]').first().css('background-image'), color:'#fff', fontSize:'16px', fontWeight:'bold' });
			$('#sort_none', tmp).click(function(){Town.sortBy();});
			$('#sort_attack', tmp).click(function(){Town.sortBy('att');});
			$('#sort_defense', tmp).click(function(){Town.sortBy('def');});
			$(this.table).prepend(tmp);
		}
	}
	return true;
}
Town.display = function() {
	var panel = new Panel(this.name);
	panel.info('In progress...');
	panel.checkbox('general', 'Use Best General:');
	panel.select('number', 'Buy Number:', ['None', 'Maximum', 'Match Army']);
	panel.select('units', 'Buy Type:', ['All', 'Best Offense', 'Best Defense', 'Best of Both']);
	return panel.show;
}
Town.work = function(state) {
	if (!length(Town.data.soldiers)) { // Need to parse it at least once
		if (!state) return true;
		if (!Page.to('town_soldiers')) return true;
	}
	if (!length(Town.data.blacksmith)) { // Need to parse it at least once
		if (!state) return true;
		if (!Page.to('town_blacksmith')) return true;
	}
	if (!length(Town.data.magic)) { // Need to parse it at least once
		if (!state) return true;
		if (!Page.to('town_magic')) return true;
	}
	if (!Town.option.number) return false;
	var max = Math.min(Town.option.number=='Maximum' ? 501 : Player.data.army, 501);
	// Soldiers first...
	var best = null;
	var count = 0;
	var gold = Player.data.gold + Player.data.bank;
	var units = Town.data.soldiers;
	for (var i in units) {
		count = 0;
		if (!units[i].cost) continue;
		if (units[i].own >= max) continue;
		if (best && Town.option.units == 'Best Offense' && units[i].att <= best.att) continue;
		if (best && Town.option.units == 'Best Defense' && units[i].def <= best.def) continue;
		if (best && Town.option.units == 'Best of Both' && (units[i].att <= best.att || units[i].def <= best.def)) continue;
		for (var j in units[i].buy) {
			if ((max - units[i].own) >= units[i].buy[j]) count = units[i].buy[j]; // && (units[i].buy[j] * units[i].cost) < gold
		}
		GM_debug('Thinking about buying: '+count+' of '+i+' at $'+(count * units[i].cost));
		if (count) {
			best = i;
			break;
		}
	}
	if (!best) return false;
	if (!state) {
		GM_debug('Want to buy '+count+' x '+best+' at $'+(count * units[best].cost));
		return true;
	}
//	if (!Bank.retrieve(best.cost * count)) return true;
//	if (Player.data.gold < best.cost) return false; // We're poor!
//	if (!Page.to('town_soldiers')) return true;

	return false;
}
Town.sortBy = function(x) {
	if (!x) {
		for (var i in Town.units) { $(Town.table).append($(Town.cache[i])); }
		for (var i in Town.header) {
			$($(Town.header[i][1])).before($(Town.header[i][0]));
			$(Town.header[i][0]).css('display','table-row');
		}
	} else {
		var units = [], x2 = (x=='att'?'def':'att');
		for (var i in Town.units) units.push(i);
// We now check the actual total value rather than just the absolute values
//		units.sort(function(a,b) { return Town.units[b][x2] - Town.units[a][x2]; });
//		units.sort(function(a,b) { return Town.units[b][x] - Town.units[a][x]; });
		units.sort(function(a,b) { return (Town.units[b][x] + (0.7 * Town.units[b][x2])) - (Town.units[a][x] + (0.7 * Town.units[a][x2])); });
		for (var i in units) { $(Town.table).append($(Town.cache[units[i]])); }
		for (var i in Town.header) $(Town.header[i]).css('display','none');
	}
}
Town.getValues = function() {
	Town.data.invade = {
		attack:	getAttDef(Town.data.soldiers, function(list,i){list.push(i);}, 'att', Player.data.army, 'invade')
			+	getAttDef(Town.data.blacksmith, function(list,i,units){if (units[i].type == 'Weapon'){list.push(i);}}, 'att', Player.data.army, 'invade')
			+	getAttDef(Town.data.blacksmith, function(list,i,units){if (units[i].type != 'Weapon'){list.push(i);}}, 'att', Player.data.army, 'invade')
			+	getAttDef(Town.data.magic, function(list,i){list.push(i);}, 'att', Player.data.army, 'invade'),
		defend:	getAttDef(Town.data.soldiers, function(list,i){list.push(i);}, 'def', Player.data.army, 'invade')
			+	getAttDef(Town.data.blacksmith, function(list,i,units){if (units[i].type == 'Weapon'){list.push(i);}}, 'def', Player.data.army, 'invade')
			+	getAttDef(Town.data.blacksmith, function(list,i,units){if (units[i].type != 'Weapon'){list.push(i);}}, 'def', Player.data.army, 'invade')
			+	getAttDef(Town.data.magic, function(list,i){list.push(i);}, 'def', Player.data.army, 'invade')
	};
	Town.data.duel = {
		attack:	getAttDef(Town.data.blacksmith, function(list,i,units){if (units[i].type == 'Weapon'){list.push(i);}}, 'att', 1, 'duel')
			+	getAttDef(Town.data.blacksmith, function(list,i,units){if (units[i].type == 'Shield'){list.push(i);}}, 'att', 1, 'duel')
			+	getAttDef(Town.data.blacksmith, function(list,i,units){if (units[i].type == 'Helmet'){list.push(i);}}, 'att', 1, 'duel')
			+	getAttDef(Town.data.blacksmith, function(list,i,units){if (units[i].type == 'Gloves'){list.push(i);}}, 'att', 1, 'duel')
			+	getAttDef(Town.data.blacksmith, function(list,i,units){if (units[i].type == 'Armor'){list.push(i);}}, 'att', 1, 'duel')
			+	getAttDef(Town.data.blacksmith, function(list,i,units){if (units[i].type == 'Amulet'){list.push(i);}}, 'att', 1, 'duel')
			+	getAttDef(Town.data.magic, function(list,i){list.push(i);}, 'att', 1, 'duel'),
		defend:	getAttDef(Town.data.blacksmith, function(list,i,units){if (units[i].type == 'Weapon'){list.push(i);}}, 'def', 1, 'duel')
			+	getAttDef(Town.data.blacksmith, function(list,i,units){if (units[i].type == 'Shield'){list.push(i);}}, 'def', 1, 'duel')
			+	getAttDef(Town.data.blacksmith, function(list,i,units){if (units[i].type == 'Helmet'){list.push(i);}}, 'def', 1, 'duel')
			+	getAttDef(Town.data.blacksmith, function(list,i,units){if (units[i].type == 'Gloves'){list.push(i);}}, 'def', 1, 'duel')
			+	getAttDef(Town.data.blacksmith, function(list,i,units){if (units[i].type == 'Armor'){list.push(i);}}, 'def', 1, 'duel')
			+	getAttDef(Town.data.blacksmith, function(list,i,units){if (units[i].type == 'Amulet'){list.push(i);}}, 'def', 1, 'duel')
			+	getAttDef(Town.data.magic, function(list,i){list.push(i);}, 'def', 1, 'duel')
	};
//	GM_debug('Town Invade: '+Town.data.invade.toSource()+', Town Duel: '+Town.data.duel.toSource());
}

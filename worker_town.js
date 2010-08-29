/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page, Queue, Resources,
	Bank, Battle, Generals, LevelUp, Player, Quest,
	APP, APPID, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, isGreasemonkey,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, shortNumber, WorkerByName, WorkerById, Divisor, length, unique, deleteElement, sum, addCommas, findInArray, findInObject, objectIndex, sortObject, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime, ucfirst, ucwords,
	makeImage
*/
/********** Worker.Town **********
* Sorts and auto-buys all town units (not property)
*/
var Town = new Worker('Town');
Town.data = {};

Town.defaults['castle_age'] = {
	pages:'town_soldiers town_blacksmith town_magic'
};

Town.option = {
	general:true,
	quest_buy:true,
	number:'None',
	maxcost:'$10m',
	units:'Best for Both',
	sell:false,
	upkeep:20
};

Town.runtime = {
	best_buy:null,
	best_sell:null,
	buy:0,
	sell:0,
	cost:0
};

Town.display = [
{
	id:'general',
	label:'Use Best General',
	checkbox:true
},{
	id:'quest_buy',
	label:'Buy Quest Items',
	checkbox:true
},{
	id:'number',
	label:'Buy Number',
	select:['None', 'Minimum', 'Army', 'Max Army'],
	help:'Minimum will only buy items need for quests if enabled. Army will buy up to your army size (modified by some generals), Max Army will buy up to 541 regardless of army size.'
},{
	id:'sell',
	require:{'number':[['None'],['Minimum']]},
	label:'Sell Surplus',
	checkbox:true,
	help:'Only keep the best items for selected sets.'
},{
	advanced:true,
	id:'units',
	require:{'number':[['None']]},
	label:'Set Type',
	select:['Best Offense', 'Best Defense', 'Best for Both'],
	help:'Select type of sets to keep. Best for Both will keep a Best Offense and a Best Defense set.'
},{
	advanced:true,
	id:'maxcost',
	require:{'number':[['None']]},
	label:'Maximum Item Cost',
	select:['$10k','$100k','$1m','$10m','$100m','$1b','$10b','$100b','$1t','$10t','$100t','INCR'],
	help:'Will buy best item based on Set Type with single item cost below selected value. INCR will start at $10k and work towards max buying at each level (WARNING, not cost effective!)'
},{
	advanced:true,
	require:{'number':[['None']]},
	id:'upkeep',
	label:'Max Upkeep',
	text:true,
	after:'%',
	help:'Enter maximum Total Upkeep in % of Total Income'
}
];

Town.blacksmith = {
	Weapon: /avenger|axe|blade|bow|cleaver|cudgel|dagger|edge|halberd|lance|mace|morningstar|rod|saber|scepter|spear|staff|stave|sword|talon|trident|wand|Celestas Devotion|Crystal Rod|Daedalus|Deliverance|Dragonbane|Dreadnought Greatsword|Excalibur|Incarnation|Ironhart's Might|Lionheart Blade|Judgement|Justice|Lightbringer|Oathkeeper|Onslaught|Punisher|Soulforge/i,
	Shield:	/aegis|buckler|shield|tome|Defender|Dragon Scale|Frost Tear Dagger|Harmony|Sword of Redemption|Terra's Guard|The Dreadnought|Purgatory|Zenarean Crest/i,
	Helmet:	/cowl|crown|helm|horns|mask|veil|Cowl of the Avenger|Lionheart Helm|Swordsman Helm|Virtue of Fortitude/i,
	Gloves:	/gauntlet|glove|hand|bracer|fist|Soul Eater|Slayer's Embrace|Soul Crusher|Virtue of Temperance/i,
	Armor:	/armor|belt|chainmail|cloak|gear|garb|pauldrons|plate|raiments|robe|vestment|Avenger Platemail|Faerie Wings|Epaulets of Might|Swordsmans Plate/i,
	Amulet:	/amulet|bauble|charm|crystal|eye|flask|heart|insignia|jewel|lantern|memento|necklace|orb|pendant|shard|signet|soul|talisman|trinket|Avenger Amulet|Paladin's Oath|Poseidons Horn| Ring|Ring of|Ruby Ore|Thawing Star|Mark of the Empire|Transcendence/i
};

Town.init = function(){
	this._watch(Bank);
	Resources.use('Gold');
};

Town.parse = function(change) {
	if (!change) {
		var unit = Town.data, page = Page.page.substr(5);
		$('.eq_buy_row,.eq_buy_row2').each(function(a,el){
			// Fix for broken magic page!!
			if (!$('div.eq_buy_costs_int', el).length) {
				$('div.eq_buy_costs', el).prepend('<div class="eq_buy_costs_int"></div>').children('div.eq_buy_costs_int').append($('div.eq_buy_costs >[class!="eq_buy_costs_int"]', el));
			}
			if (!$('div.eq_buy_stats_int', el).length) {
				$('div.eq_buy_stats', el).prepend('<div class="eq_buy_stats_int"></div>').children('div.eq_buy_stats_int').append($('div.eq_buy_stats >[class!="eq_buy_stats_int"]', el));
			}
			if (!$('div.eq_buy_txt_int', el).length) {
				$('div.eq_buy_txt', el).prepend('<div class="eq_buy_txt_int"></div>').children('div.eq_buy_txt_int').append($('div.eq_buy_txt >[class!="eq_buy_txt_int"]', el));
			}
			var i, j, stats = $('div.eq_buy_stats', el), name = $('div.eq_buy_txt strong:first', el).text().trim(), costs = $('div.eq_buy_costs', el), cost = $('strong:first-child', costs).text().replace(/[^0-9]/g, ''),upkeep = $('div.eq_buy_txt_int:first',el).children('span.negative').text().replace(/[^0-9]/g, ''), match, maxlen = 0;
			unit[name] = unit[name] || {};
			unit[name].page = page;
			unit[name].img = $('div.eq_buy_image img', el).attr('src').filepart();
			unit[name].own = $(costs).text().regex(/Owned: ([0-9]+)/i);
			Resources.add('_'+name, unit[name].own, true);
			unit[name].att = $('div.eq_buy_stats_int div:eq(0)', stats).text().regex(/([0-9]+)\s*Attack/);
			unit[name].def = $('div.eq_buy_stats_int div:eq(1)', stats).text().regex(/([0-9]+)\s*Defense/);
			unit[name].tot_att = unit[name].att + (0.7 * unit[name].def);
			unit[name].tot_def = unit[name].def + (0.7 * unit[name].att);
			if (cost) {
				unit[name].cost = parseInt(cost, 10);
				if (upkeep){
					unit[name].upkeep = parseInt(upkeep, 10);
				}
				if (costs.text().indexOf('locked') === -1) {
					unit[name].buy = [];
					$('select[name="amount"]:first option', costs).each(function(i,el){
						unit[name].buy.push(parseInt($(el).val(), 10));
					});
				} else {
					delete unit[name].buy;
				}
				unit[name].sell = [];
				$('select[name="amount"]:last option', costs).each(function(i,el){
					unit[name].sell.push(parseInt($(el).val(), 10));
				});
			}
			if (page === 'blacksmith') {
				for (i in Town.blacksmith) {
					if ((match = name.match(Town.blacksmith[i]))) {
						for (j=0; j<match.length; j++) {
							if (match[j].length > maxlen) {
								unit[name].type = i;
								maxlen = match[j].length;
							}
						}
					}
				}
			}
		});
	} else if (Page.page==='town_blacksmith') {
		$('.eq_buy_row,.eq_buy_row2').each(function(i,el){
			var $el = $('div.eq_buy_txt strong:first-child', el), name = $el.text().trim();
			if (Town.data[name].type) {
				$el.parent().append('<br>'+Town.data[name].type);
			}
		});
	}
	return true;
};

Town.getInvade = function(army) {
	var att = 0, def = 0, data = this.data;
	att += getAttDef(data, function(list,i,units){if (units[i].page==='soldiers'){list.push(i);}}, 'att', army, 'invade');
	def += getAttDef(data, null, 'def', army, 'invade');
	att += getAttDef(data, function(list,i,units){if (units[i].type && units[i].type !== 'Weapon'){list.push(i);}}, 'att', army, 'invade');
	def += getAttDef(data, null, 'def', army, 'invade');
	att += getAttDef(data, function(list,i,units){if (units[i].type === 'Weapon'){list.push(i);}}, 'att', army, 'invade');
	def += getAttDef(data, null, 'def', army, 'invade');
	att += getAttDef(data, function(list,i,units){if (units[i].page === 'magic'){list.push(i);}}, 'att', army, 'invade');
	def += getAttDef(data, null, 'def', army, 'invade');
	return {attack:att, defend:def};
};

Town.getDuel = function() {
	var att = 0, def = 0, data = this.data;
	att += getAttDef(data, function(list,i,units){if (units[i].type === 'Weapon'){list.push(i);}}, 'att', 1, 'duel');
	def += getAttDef(data, null, 'def', 1, 'duel');
	att += getAttDef(data, function(list,i,units){if (units[i].page === 'magic'){list.push(i);}}, 'att', 1, 'duel');
	def += getAttDef(data, null, 'def', 1, 'duel');
	att += getAttDef(data, function(list,i,units){if (units[i].type === 'Shield'){list.push(i);}}, 'att', 1, 'duel');
	def += getAttDef(data, null, 'def', 1, 'duel');
	att += getAttDef(data, function(list,i,units){if (units[i].type === 'Helmet'){list.push(i);}}, 'att', 1, 'duel');
	def += getAttDef(data, null, 'def', 1, 'duel');
	att += getAttDef(data, function(list,i,units){if (units[i].type === 'Gloves'){list.push(i);}}, 'att', 1, 'duel');
	def += getAttDef(data, null, 'def', 1, 'duel');
	att += getAttDef(data, function(list,i,units){if (units[i].type === 'Armor'){list.push(i);}}, 'att', 1, 'duel');
	def += getAttDef(data, null, 'def', 1, 'duel');
	att += getAttDef(data, function(list,i,units){if (units[i].type === 'Amulet'){list.push(i);}}, 'att', 1, 'duel');
	def += getAttDef(data, null, 'def', 1, 'duel');
	return {attack:att, defend:def};
};

Town.update = function(type) {
	var i, u, need, want, have, best_buy = null, best_sell = null, best_quest = false, buy = 0, sell = 0, data = this.data, quests, army = Math.min(Generals.get('runtime.armymax', 501), Player.get('armymax', 501)), max_buy = 0,
	incr = (this.runtime.cost_incr || 4);
        max_cost = ({
		'$10k':Math.pow(10,4),
		'$100k':Math.pow(10,5),
		'$1m':Math.pow(10,6),
		'$10m':Math.pow(10,7),
		'$100m':Math.pow(10,8),
		'$1b':Math.pow(10,9),
		'$10b':Math.pow(10,10),
		'$100b':Math.pow(10,11),
		'$1t':Math.pow(10,12),
		'$10t':Math.pow(10,13),
		'$100t':Math.pow(10,14),
                'INCR':Math.pow(10,incr)
	})[this.option.maxcost];
	switch (this.option.number) {
		case 'Army':
				max_buy = army;
				break;
		case 'Max Army':
				max_buy = Generals.get('runtime.armymax', army);
				break;
		default:
				max_buy = 0;
			break;
	}
	// These two fill in all the data we need for buying / sellings items
	this.runtime.invade = this.getInvade(army);
	this.runtime.duel = this.getDuel();
	// For all items / units
	// 1. parse through the list of buyable items of each type
	// 2. find the one with Resources.get(_item.invade_att) the highest (that's the number needed to hit 541 items in total)
	// 3. buy enough to get there
	// 4. profit (or something)...
	if (this.option.quest_buy || max_buy){
		for (u in data) {
			want = Resources.get(['_'+u, 'quest'], 0);
			need = this.option.quest_buy ? want : 0;
			have = data[u].own;
			// Sorry about the nested max/min/max -
			// Max - 'need' can't get smaller
			// Min - 'max_buy' is the most we want to buy
			// Max - needs to accounts for invade and duel
			if (this.option.units !== 'Best Defense') {
				need = Math.max(need, Math.min(max_buy, Math.max(Resources.get(['_'+u, 'invade_att'], 0), Resources.get(['_'+u, 'duel_att'], 0))));
			}
			if (this.option.units !== 'Best Offense') {
				need = Math.max(need, Math.min(max_buy, Math.max(Resources.get(['_'+u, 'invade_def'], 0), Resources.get(['_'+u, 'duel_def'], 0))));
			}
//			debug('Item: '+u+', need: '+need+', want: '+want);
			if (need > have) {// Want to buy more
				if (!best_quest && data[u].buy && data[u].buy.length) {
					if (data[u].cost <= max_cost && this.option.upkeep >= (((Player.get('upkeep') + (data[u].upkeep * bestValue(data[u].buy, need - have))) / Player.get('maxincome')) * 100) && (!best_buy || need > buy)) {
//						debug('Buy: '+need);
						best_buy = u;
						buy = need;
						if (this.option.quest_buy && want > have) {// If we're buying for a quest item then we're only going to buy that item first - though possibly more than specifically needed
							best_quest = true;
						}
					}
				}
			} else if (max_buy && this.option.sell && Math.max(need,want) < have && data[u].sell && data[u].sell.length) {// Want to sell off surplus (but never quest stuff)
				need = bestValue(data[u].sell, have - Math.max(need,want));
				if (need > 0 && (!best_sell || data[u].cost > data[best_sell].cost)) {
//					debug('Sell: '+need);
					best_sell = u;
					sell = need;
				}
			}
		}
	}

	this.runtime.best_buy = this.runtime.best_sell = null;
	this.runtime.buy = this.runtime.sell = this.runtime.cost = 0;
	if (best_sell) {// Sell before we buy
		this.runtime.best_sell = best_sell;
		this.runtime.sell = sell;
		this.runtime.cost = sell * data[best_sell].cost / 2;
		Dashboard.status(this, 'Selling ' + this.runtime.sell + ' &times; ' + best_sell + ' for ' + makeImage('gold') + '$' + shortNumber(this.runtime.cost));
	} else if (best_buy){
		this.runtime.best_buy = best_buy;
		this.runtime.buy = bestValue(data[best_buy].buy, buy - data[best_buy].own);
		this.runtime.cost = this.runtime.buy * data[best_buy].cost;
		if (Bank.worth(this.runtime.cost)) {
			Dashboard.status(this, 'Buying ' + this.runtime.buy + ' &times; ' + best_buy + ' for ' + makeImage('gold') + '$' + shortNumber(this.runtime.cost));
		} else {
			Dashboard.status(this, 'Waiting for ' + makeImage('gold') + '$' + shortNumber(this.runtime.cost - Bank.worth()) + ' to buy ' + this.runtime.buy + ' &times; ' + best_buy + ' for ' + makeImage('gold') + '$' + shortNumber(this.runtime.cost));
		}
	} else {
                if (this.option.maxcost === 'INCR'){
                    this.runtime.cost_incr = (incr === 14)? 4: incr + 1;
                    this.runtime.check = Date.now() + 3600000;
                } else {
                    this.runtime.cost_incr = null;
                    this.runtime.check = null;
                }
		Dashboard.status(this);
	}
};

Town.work = function(state) {
        var incr = (this.runtime.cost_incr || 4);
	if (this.runtime.best_sell){
		if (!state || !this.sell(this.runtime.best_sell, this.runtime.sell)) {
			return QUEUE_CONTINUE;
		}
	}
	if (this.runtime.best_buy){
		if (!state && !Bank.worth(this.runtime.cost)) {
                        if (this.runtime.check < Date.now() && this.option.maxcost === 'INCR'){
                                this.runtime.cost_incr = 4;
                                this.runtime.check = Date.now() + 3600000;
                        }                        
                        Dashboard.status(this, 'Waiting for ' + makeImage('gold') + '$' + shortNumber(this.runtime.cost - Bank.worth()) + ' to buy ' + this.runtime.buy + ' &times; ' + this.runtime.best_buy + ' for ' + makeImage('gold') + '$' + shortNumber(this.runtime.cost));
                        return QUEUE_FINISH;
		}
		if (!state || !this.buy(this.runtime.best_buy, this.runtime.buy)) {
			return QUEUE_CONTINUE;
		}
	}
	return QUEUE_FINISH;
};

Town.buy = function(item, number) { // number is absolute including already owned
	this._unflush();
	if (!this.data[item] || !this.data[item].buy || !this.data[item].buy.length || !Bank.worth(this.runtime.cost)) {
		return true; // We (pretend?) we own them
	}
	if (!Generals.to(this.option.general ? 'cost' : 'any') || !Bank.retrieve(this.runtime.cost) || !Page.to('town_'+this.data[item].page)) {
		return false;
	}
	var qty = bestValue(this.data[item].buy, number);
	$('.eq_buy_row,.eq_buy_row2').each(function(i,el){
		if ($('div.eq_buy_txt strong:first', el).text().trim() === item) {
				debug('Buying ' + qty + ' x ' + item + ' for $' + addCommas(qty * Town.data[item].cost));
				$('div.eq_buy_costs select[name="amount"]:eq(0)', el).val(qty);
				Page.click($('div.eq_buy_costs input[name="Buy"]', el));
		}
	});
        this.runtime.cost_incr = 4;
	return false;
};

Town.sell = function(item, number) { // number is absolute including already owned
	this._unflush();
	if (!this.data[item] || !this.data[item].sell || !this.data[item].sell.length) {
		return true;
	}
	if (!Page.to('town_'+this.data[item].page)) {
		return false;
	}
	var qty = bestValue(this.data[item].sell, number);
	$('.eq_buy_row,.eq_buy_row2').each(function(i,el){
		if ($('div.eq_buy_txt strong:first', el).text().trim() === item) {
				debug('Selling ' + qty + ' x ' + item + ' for $' + addCommas(qty * Town.data[item].cost / 2));
				$('div.eq_buy_costs select[name="amount"]:eq(1)', el).val(qty);
				Page.click($('div.eq_buy_costs input[name="Sell"]', el));
		}
	});
        this.runtime.cost_incr = 4;
	return false;
};

var makeTownDash = function(list, unitfunc, x, type, name, count) { // Find total att(ack) or def(ense) value from a list of objects (with .att and .def)
	var units = [], output = [], x2 = (x==='att'?'def':'att'), i, order = {
		Weapon:1,
		Shield:2,
		Helmet:3,
		Armor:4,
		Amulet:5,
		Gloves:6,
		Magic:7
	};
	if (name) {
		output.push('<div class="golem-panel"><h3 class="golem-panel-header" style="width:auto;">'+name+'</h3><div class="golem-panel-content">');
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
				output.push('<p><div style="height:25px;margin:1px;"><img src="' + imagepath + list[units[i]].img + '" style="width:25px;height:25px;float:left;margin-right:4px;"> ' + (list[units[i]].use ? list[units[i]].use[type+'_'+x]+' x ' : '') + units[i] + ' (' + list[units[i]].att + ' / ' + list[units[i]].def + ')' + (list[units[i]].cost?' $'+shortNumber(list[units[i]].cost):'') + '</div></p>');
		}
	}
	if (name) {
		output.push('</div></div>');
	}
	return output.join('');
};

Town.dashboard = function() {
	var left, right, generals = Generals.get(), best;
	best = Generals.best('duel');
	left = '<div style="float:left;width:50%;"><div class="golem-panel"><h3 class="golem-panel-header" style="width:auto;">Invade - Attack</h3><div class="golem-panel-content" style="padding:8px;">'
	+	makeTownDash(generals, function(list,i){list.push(i);}, 'att', 'invade', 'Heroes')
	+	makeTownDash(this.data, function(list,i,units){if (units[i].page==='soldiers' && units[i].use){list.push(i);}}, 'att', 'invade', 'Soldiers')
	+	makeTownDash(this.data, function(list,i,units){if (units[i].use && units[i].type === 'Weapon'){list.push(i);}}, 'att', 'invade', 'Weapons')
	+	makeTownDash(this.data, function(list,i,units){if (units[i].page==='blacksmith' && units[i].use && units[i].type !== 'Weapon'){list.push(i);}}, 'att', 'invade', 'Equipment')
	+	makeTownDash(this.data, function(list,i,units){if (units[i].page==='magic' && units[i].use){list.push(i);}}, 'att', 'invade', 'Magic')
	+	'</div></div><div class="golem-panel"><h3 class="golem-panel-header" style="width:auto;">Duel - Attack</h3><div class="golem-panel-content" style="padding:8px;">'
	+	(best !== 'any' ? '<div style="height:25px;margin:1px;"><img src="' + imagepath + generals[best].img + '" style="width:25px;height:25px;float:left;margin-right:4px;">' + best + ' (' + generals[best].att + ' / ' + generals[best].def + ')</div>' : '')
	+	makeTownDash(this.data, function(list,i,units){if (units[i].page==='blacksmith' && units[i].use){list.push(i);}}, 'att', 'duel')
	+	makeTownDash(this.data, function(list,i,units){if (units[i].page==='magic' && units[i].use){list.push(i);}}, 'att', 'duel')
	+	'</div></div></div>';
	best = Generals.best('defend');
	right = '<div style="float:right;width:50%;"><div class="golem-panel"><h3 class="golem-panel-header" style="width:auto;">Invade - Defend</h3><div class="golem-panel-content" style="padding:8px;">'
	+	makeTownDash(generals, function(list,i){list.push(i);}, 'def', 'invade', 'Heroes')
	+	makeTownDash(this.data, function(list,i,units){if (units[i].page==='soldiers' && units[i].use){list.push(i);}}, 'def', 'invade', 'Soldiers')
	+	makeTownDash(this.data, function(list,i,units){if (units[i].use && units[i].type === 'Weapon'){list.push(i);}}, 'def', 'invade', 'Weapons')
	+	makeTownDash(this.data, function(list,i,units){if (units[i].page==='blacksmith' && units[i].use && units[i].type !== 'Weapon'){list.push(i);}}, 'def', 'invade', 'Equipment')
	+	makeTownDash(this.data, function(list,i,units){if (units[i].page==='magic' && units[i].use){list.push(i);}}, 'def', 'invade', 'Magic')
	+	'</div></div><div class="golem-panel"><h3 class="golem-panel-header" style="width:auto;">Duel - Defend</h3><div class="golem-panel-content" style="padding:8px;">'
	+	(best !== 'any' ? '<div style="height:25px;margin:1px;"><img src="' + imagepath + generals[best].img + '" style="width:25px;height:25px;float:left;margin-right:4px;">' + best + ' (' + generals[best].att + ' / ' + generals[best].def + ')</div>' : '')
	+	makeTownDash(this.data, function(list,i,units){if (units[i].page==='blacksmith' && units[i].use){list.push(i);}}, 'def', 'duel')
	+	makeTownDash(this.data, function(list,i,units){if (units[i].page==='magic' && units[i].use){list.push(i);}}, 'def', 'duel')
	+	'</div></div></div>';

	$('#golem-dashboard-Town').html(left+right);
};


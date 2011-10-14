/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Workers, Config, Dashboard, Page, Queue, Resources,
	Bank, Battle, Generals, LevelUp, Player, Quest, Land,
	APP, APPID, APPID_, PREFIX, userID, imagepath,
	isRelease, version, revision, Images, window, browser, console,
	LOG_ERROR, LOG_WARN, LOG_LOG, LOG_INFO, LOG_DEBUG, log,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	isArray, isFunction, isNumber, isObject, isString, isUndefined,
	length, sum, getAttDef, tr, th, td
*/
/********** Worker.Town **********
* Sorts and auto-buys all town units (not property)
*/
var Town = new Worker('Town');
Town.temp = null;

Town.settings = {
	taint:true
};

Town.defaults['castle_age'] = {
	pages:'town_soldiers town_blacksmith town_magic keep_stats'
};

Town.option = {
	general:true,
	quest_buy:true,
	number:'None',
	maxcost:'$0',
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
	id:'generals_buy',
	label:'Buy Generals Items',
	checkbox:true
},{
	id:'number',
	label:'Buy Number',
	select:['None', 'Minimum', 'Army', 'Army+', 'Max Army'],
	help:'Minimum will only buy items need for quests if enabled.'
	  + ' Army will buy up to your army size (modified by some generals).'
	  + ' Army+ is like Army on purchases and Max Army on sales.'
	  + ' Max Army will buy up to 541 regardless of army size.'
},{
	id:'sell',
	require:'number!="None" && number!="Minimum"',
	label:'Sell Surplus',
	checkbox:true,
	help:'Only keep the best items for selected sets.'
},{
	advanced:true,
	id:'units',
	require:'number!="None"',
	label:'Set Type',
	select:['Best Offense', 'Best Defense', 'Best for Both'],
	help:'Select type of sets to keep. Best for Both will keep a Best Offense and a Best Defense set.'
},{
	advanced:true,
	id:'maxcost',
	require:'number!="None"',
	label:'Maximum Item Cost',
	select:['$0','$10k','$100k','$1m','$10m','$100m','$1b','$10b','$100b','$1t','$10t','$100t','INCR'],
	help:'Will buy best item based on Set Type with single item cost below selected value. INCR will start at $10k and work towards max buying at each level (WARNING, not cost effective!)'
},{
	advanced:true,
	require:'number!="None"',
	id:'upkeep',
	label:'Max Upkeep',
	number:true,
	min:0,
	max:100,
	after:'%',
	help:'Enter maximum Total Upkeep in % of Total Income'
}
];

Town.setup = function() {
	Resources.use('Gold');
};

Town.init = function() {
	var now = Date.now(), i, o, p;

	this._watch(Player, 'data.worth');			// cash available
	this._watch(Player, 'data.army');			// current army size
	this._watch(Player, 'data.armymax');		// capped army size (player)
	this._watch(Generals, 'runtime.armymax');	// capped army size (generals)
	this._watch(Generals, 'data');				// general stats
	this._watch(Land, 'option.save_ahead');		// land reservation flag
	this._watch(Land, 'runtime.save_amount');	// land reservation amount
	this._watch(Page, 'data.town_soldiers');	// page freshness
	this._watch(Page, 'data.town_blacksmith');	// page freshness
	this._watch(Page, 'data.town_magic');		// page freshness
	this.set('runtime.cost_incr', 4);

	// map old local stale page variables to Page values
	if (!isUndefined(i = this.runtime.soldiers)) {
		if (isNumber(i) && i) {
			Page.setStale('town_soldiers', now);
		}
		this.set('runtime.soldiers');
	}
	if (!isUndefined(i = this.runtime.blacksmith)) {
		if (isNumber(i) && i) {
			Page.setStale('town_blacksmith', now);
		}
		this.set('runtime.blacksmith');
	}
	if (!isUndefined(i = this.runtime.magic)) {
		if (isNumber(i) && i) {
			Page.setStale('town_magic', now);
		}
		this.set('runtime.magic');
	}

	// create item classification regexp from rrestr generated strings
	o = this.rrestr;
	p = {};
	for (i in o) {
		p[i.ucfirst()] = new RegExp('(' + o[i] + ')', 'i');
	}
	this.blacksmith = p;
};

  // .layout td >div:contains("Owned Items:")
  // .layout td >div div[style*="town_unit_bar."]
  // .layout td >div div[style*="town_unit_bar_owned."]
Town.page = function(page, change) {
	var now = Date.now(), self = this, i, j, el, tmp, img, filename, name, count, unit, purge, changes, cost_adj, modify = false;
	if (page === 'keep_stats') {
		// Only when it's our own keep and not someone elses
		if ($('.keep_attribute_section').length) {
			tmp = $('.statUnit', $('.statsT2 .statsTTitle:regex(^\\s*UNITS\\s*$)').parent());
			for (i=0; i<tmp.length; i++) {
				el = tmp[i];
				img = $('a img[src]', el);
				filename = ($(img).attr('src') || '').filepart();
				name = this.qualify(($(img).attr('title') || $(img).attr('alt') || '').trim(), filename);
				count = $(el).text().regex(/\bX\s*(\d+)\b/im);
				if (!this.data[name]) {
					//log(LOG_WARN, 'missing unit: ' + name + ' (' + filename + ')');
					Page.setStale('town_soldiers', now);
					break;
				} else if (isNumber(count)) {
					this.set(['data', name, 'own'], count);
				}
			}

			tmp = $('.statUnit', $('.statsT2 .statsTTitle:regex(^\\s*ITEMS\\s*$)').parent());
			for (i=0; i<tmp.length; i++) {
				el = tmp[i];
				img = $('a img[src]', el);
				filename = ($(img).attr('src') || '').filepart();
				name = this.qualify(($(img).attr('title') || $(img).attr('alt') || '').trim(), filename); // names aren't unique for items
				count = $(el).text().regex(/\bX\s*(\d+)\b/im);
				if (!this.data[name] || this.data[name].img !== filename) {
					//log(LOG_WARN, 'missing item: ' + name + ' (' + i + ')' + (this.data[name] ? ' img[' + this.data[name].img + ']' : ''));
					Page.setStale('town_blacksmith', now);
					Page.setStale('town_magic', now);
					break;
				} else if (isNumber(count)) {
					this.set(['data', name, 'own'], count);
				}
			}

			tmp = $('.statUnit', $('.statsT2 .statsTTitle:regex(^\\s*ARTIFACTS\\s*$)').parent());
			for (i=0; i<tmp.length; i++) {
				el = tmp[i];
				img = $('a img[src]', el);
				filename = ($(img).attr('src') || '').filepart();
				name = this.qualify(($(img).attr('title') || $(img).attr('alt') || '').trim(), filename); // names aren't unique for items
				this.set(['data', name, 'type'], 'artifact');
				this.set(['data', name, 'own'], 1);
			}
		}
	} else if (change && page === 'town_blacksmith') {
		$('div[style*="town_unit_bar."],div[style*="town_unit_bar_owned."]').each(function(i,el) {
			var name = ($('div img[alt]', el).attr('alt') || '').trim(),
				icon = ($('div img[src]', el).attr('src') || '').filepart();
			name = self.qualify(name, icon);
			if (self.data[name] && self.data[name].type) {
				$('div strong:first', el).parent().append('<br>'+self.data[name].type);
			}
		});
	} else if (!change && (page === 'town_soldiers' || page === 'town_blacksmith' || page === 'town_magic')) {
		unit = this.data;
		purge = {};
		changes = 0;
		cost_adj = 1;
		for (i in unit) {
			if (unit[i].page === page.substr(5)) {
				purge[i] = true;
			}
		}
		// undo cost reduction general values on the magic page
		if (page === 'town_magic' && (i = Generals.get(Player.get('general')))) {
			if (i.stats && isNumber(j = i.stats.cost)) {
				cost_adj = 100 / (100 - j);
			}
		}
		$('div[style*="town_unit_bar."],div[style*="town_unit_bar_owned."]').each(function(a,el) {
			try {
				var i, j, type, match, maxlen = 0,
					name = ($('div img[alt]', el).attr('alt') || '').trim(),
					icon = ($('div img[src]', el).attr('src') || '').filepart(),
					cost = parseInt(($('div strong.gold', el).text() || '').replace(/\D/g, '') || 0, 10),
					own = ($('div div:contains("Owned:")', el).text() || '').regex(/\bOwned:\s*(\d+)\b/i) || 0,
					atk = ($('div div div:contains("Attack")', el).text() || '').regex(/\b(\d+)\s+Attack\b/) || 0,
					def = ($('div div div:contains("Defense")', el).text() || '').regex(/\b(\d+)\s+Defense\b/i) || 0,
					upkeep = parseInt(($('div div:contains("Upkeep:") span.negative', el).text() || '').replace(/\D/g, '') || 0, 10);
				self._transaction(); // BEGIN TRANSACTION
				name = self.qualify(name, icon);
				delete purge[name];
				self.set(['data',name,'page'], page.substr(5));
				self.set(['data',name,'img'], icon);
				self.set(['data',name,'own'], own);
				Resources.add('_'+name, own, true);
				self.set(['data',name,'att'], atk);
				self.set(['data',name,'def'], def);
				self.set(['data',name,'tot_att'], atk + (0.7 * def));
				self.set(['data',name,'tot_def'], def + (0.7 * atk));
				self.set(['data',name,'cost'], cost ? Math.round(cost_adj * cost) : undefined);
				self.set(['data',name,'upkeep'], upkeep ? upkeep : undefined);
//				self.set(['data',name,'id'], null);
				self.set(['data',name,'buy']);
				if ((tmp = $('form[id*="itemBuy_"]', el)).length) {
					self.set(['data',name,'id'], tmp.attr('id').regex(/itemBuy_(\d+)/i), 'number');
					$('select[name="amount"] option', tmp).each(function(b, el) {
						self.push(['data',name,'buy'], parseInt($(el).val(), 10), 'number');
					});
				}
				self.set(['data',name,'sell']);
				if ((tmp = $('form[id*="itemSell_"]', el)).length) {
					self.set(['data',name,'id'], tmp.attr('id').regex(/itemSell_(\d+)/i), 'number');
					$('select[name="amount"] option', tmp).each(function(b, el) {
						self.push(['data',name,'sell'], parseInt($(el).val(), 10), 'number');
					});
				}
				if (page === 'town_blacksmith') {
					for (i in self.blacksmith) {
						if ((match = name.match(self.blacksmith[i]))) {
							if (match[1].length > maxlen) {
								type = i;
								maxlen = match[1].length;
							}
						}
					}
					self.set(['data',name,'type'], type);
				}
				self._transaction(true); // COMMIT TRANSACTION
				changes++; // this must come after the transaction
			} catch(e) {
				self._transaction(false); // ROLLBACK TRANSACTION on any error
				log(e, e.name + ' in ' + this.name + '.page(' + page + ', ' + change + '): ' + e.message);
			}
		});

		// if nothing at all changed above, something went wrong on the page download
		if (changes) {
			for (i in purge) {
				if (purge[i]) {
					log(LOG_WARN, 'Purge: ' + i);
					this.set(['data',i]);
					changes++;
				}
			}
		}

		// trigger the item type caption pass
		if (page === 'town_blacksmith') {
		    modify = true;
		}
	}

	return modify;
};

Town.getInvade = function(army, suffix) {
	var att = 0, def = 0, data = this.get('data');
	if (!suffix) { suffix = ''; }
	att += getAttDef(data, function(list,i,units){if (units[i].page==='soldiers'){list.push(i);}}, 'att', army, 'invade', suffix);
	def += getAttDef(data, null, 'def', army, 'invade', suffix);
	att += getAttDef(data, function(list,i,units){if (units[i].type && units[i].type !== 'Weapon'){list.push(i);}}, 'att', army, 'invade', suffix);
	def += getAttDef(data, null, 'def', army, 'invade', suffix);
	att += getAttDef(data, function(list,i,units){if (units[i].type === 'Weapon'){list.push(i);}}, 'att', army, 'invade', suffix);
	def += getAttDef(data, null, 'def', army, 'invade', suffix);
	att += getAttDef(data, function(list,i,units){if (units[i].page === 'magic'){list.push(i);}}, 'att', army, 'invade', suffix);
	def += getAttDef(data, null, 'def', army, 'invade', suffix);
	return {attack:att, defend:def};
};

Town.getDuel = function() {
	var att = 0, def = 0, data = this.get('data');
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

Town.getWar = function() {
	var att = 0, def = 0, data = this.get('data');
	att += getAttDef(data, function(list,i,units){if (units[i].type === 'Weapon'){list.push(i);}}, 'att', -7, 'war');
	def += getAttDef(data, null, 'def', -7, 'war');
	att += getAttDef(data, function(list,i,units){if (units[i].type === 'Shield'){list.push(i);}}, 'att', -7, 'war');
	def += getAttDef(data, null, 'def', -7, 'war');
	att += getAttDef(data, function(list,i,units){if (units[i].type === 'Armor'){list.push(i);}}, 'att', -7, 'war');
	def += getAttDef(data, null, 'def', -7, 'war');
	att += getAttDef(data, function(list,i,units){if (units[i].type === 'Helmet'){list.push(i);}}, 'att', -7, 'war');
	def += getAttDef(data, null, 'def', -7, 'war');
	att += getAttDef(data, function(list,i,units){if (units[i].type === 'Amulet'){list.push(i);}}, 'att', -7, 'war');
	def += getAttDef(data, null, 'def', -7, 'war');
	att += getAttDef(data, function(list,i,units){if (units[i].type === 'Gloves'){list.push(i);}}, 'att', -7, 'war');
	def += getAttDef(data, null, 'def', -7, 'war');
	att += getAttDef(data, function(list,i,units){if (units[i].page === 'magic'){list.push(i);}}, 'att', -7, 'war');
	def += getAttDef(data, null, 'def', -7, 'war');
	return {attack:att, defend:def};
};

Town.update = function(event, events) {
	var now = Date.now(), i, j, k, p, u, need, want, have, best_buy = null, buy_pref = 0, best_sell = null, sell_pref = 0, best_quest = false, buy = 0, sell = 0, cost,
		data = this.data,
		maxincome = Player.get('maxincome', 1, 'number'), // used as a divisor
		upkeep = Player.get('upkeep', 0, 'number'),
		// largest possible army, including bonus generals
		armymax = Math.max(541, Generals.get('runtime.armymax', 1, 'number')),
		// our army size, capped at the largest possible army size above
		army = Math.min(armymax, Math.max(Generals.get('runtime.army', 1, 'number'), Player.get('armymax', 1, 'number'))),
		max_buy = 0, max_sell = 0, resource, fixed_cost, max_cost, keep,
		land_buffer = (Land.get('option.save_ahead') && Land.get('runtime.save_amount', 0, 'number')) || 0,
		incr = this.runtime.cost_incr || 4,
		info_str, buy_str = '', sell_str = '', net_cost = 0, net_upkeep = 0;

	fixed_cost = ({
	    '$0':   0,
		'$10k': 1e4,
		'$100k':1e5,
		'$1m':  1e6,
		'$10m': 1e7,
		'$100m':1e8,
		'$1b':  1e9,
		'$10b': 1e10,
		'$100b':1e11,
		'$1t':  1e12,
		'$10t': 1e13,
		'$100t':1e14,
		'INCR': Math.pow(10,incr)
	})[this.option.maxcost] || 0;

	switch (this.option.number) {
		case 'Army':
			max_buy = max_sell = army;
			break;
		case 'Army+':
			max_buy = army;
			max_sell = armymax;
			break;
		case 'Max Army':
			max_buy = max_sell = armymax;
			break;
		default:
			max_buy = 0;
			max_sell = army;
			break;
	}

	// These three fill in all the data we need for buying / sellings items
	this.set(['runtime','invade'], this.getInvade(max_buy));
	this.set(['runtime','duel'], this.getDuel());
	this.set(['runtime','war'], this.getWar());

	// Set up a keep set for future army sizes
	keep = {};
	if (army < max_sell) {
		this.getInvade(max_sell, max_sell.toString());
		i = 'invade' + max_sell + '_att';
		j = 'invade' + max_sell + '_def';
		for (u in data) {
			if ((p = Resources.get(['data','_'+u]))) {
				need = 0;
				if (this.option.units !== 'Best Defense') {
					need = Math.max(need, Math.min(max_sell, Math.max(p[i] || 0, p.duel_att || 0, p.war_att || 0)));
				}
				if (this.option.units !== 'Best Offense') {
					need = Math.max(need, Math.min(max_sell, Math.max(p[j] || 0, p.duel_def || 0, p.war_def || 0)));
				}
				if ((keep[u] || 0) < need && data[u].sell && data[u].sell.length) {
					keep[u] = need;
				}
				Resources.set(['data','_'+u,i]);
				Resources.set(['data','_'+u,j]);
			}
		}
	}

	// For all items / units
	// 1. parse through the list of buyable items of each type
	// 2. find the one with Resources.get(_item.invade_att) the highest (that's the number needed to hit 541 items in total)
	// 3. buy enough to get there
	// 4. profit (or something)...
	for (u in data) {
		p = Resources.get(['data','_'+u]) || {};
		want = 0;
		if (p.quest) {
			if (this.option.quest_buy) {
				want = Math.max(want, p.quest);
			}
			// add quest counts to the keep set
			if ((keep[u] || 0) < p.quest) {
				keep[u] = p.quest;
			}
		}
		if (isNumber(p.generals)) {
			if (this.option.generals_buy) {
				want = Math.max(want, p.generals);
			}
			// add general item counts to the keep set
			if ((keep[u] || 0) < (p.generals || 1e99)) {
				// Don't sell them unless we know for sure that the general can't use them all
				keep[u] = p.generals || 1e99;
			}
		}
		have = data[u].own || 0;
		need = 0;
		if (this.option.units !== 'Best Defense') {
			need = Math.range(need, Math.max(p.invade_att || 0, p.duel_att || 0, p.war_att || 0), max_buy);
		}
		if (this.option.units !== 'Best Offense') {
			need = Math.range(need, Math.max(p.invade_def || 0, p.duel_def || 0, p.war_def || 0), max_buy);
		}
		if (want > have) {// If we're buying for a quest item then we're only going to buy that item first - though possibly more than specifically needed
			max_cost = 1e99; // arbitrarily high value
			need = want;
		} else {
			max_cost = fixed_cost;
		}

//			log(LOG_WARN, 'Item: '+u+', need: '+need+', want: '+want);
		if (need > have) { // Want to buy more                                
			if (!best_quest && data[u].buy && data[u].buy.length) {
				if (data[u].cost <= max_cost && this.option.upkeep >= (((upkeep + ((data[u].upkeep || 0) * (i = data[u].buy.lower(need - have)))) / maxincome) * 100) && i > 1 && (!best_buy || need > buy)) {
//						log(LOG_WARN, 'Buy: '+need);
					best_buy = u;
					buy = have + i; // this.buy() takes an absolute value
					buy_pref = Math.max(need, want);
					if (want && want > have) {// If we're buying for a quest item then we're only going to buy that item first - though possibly more than specifically needed
						best_quest = true;
					}
				}
			}
		} else if (max_buy && this.option.sell && Math.max(need,want) < have && data[u].sell && data[u].sell.length) {// Want to sell off surplus (but never quest stuff)
			need = data[u].sell.lower(have - (i = Math.max(need,want,keep[u] || 0)));
			if (need > 0 && (!best_sell || data[u].cost > data[best_sell].cost)) {
//				log(LOG_WARN, 'Sell: '+need);
				best_sell = u;
				sell = need;
				sell_pref = i;
			}
		}
	}

	if (best_sell) {// Sell before we buy
		best_buy = null;
		buy = 0;
		upkeep = sell * (data[best_sell].upkeep || 0);
		Dashboard.status(this, (this.option._disabled ? 'Would sell ' : 'Selling ') + sell + ' &times; ' + best_sell + ' for ' + Config.makeImage('gold') + '$' + (sell * data[best_sell].cost / 2).SI() + (upkeep ? ' (Upkeep: -$' + upkeep.SI() + ')': '') + (sell_pref < data[best_sell].own ? ' [' + data[best_sell].own + '/' + sell_pref + ']': ''));
	} else if (best_buy){
		best_sell = null;
		sell = 0;
		cost = (buy - data[best_buy].own) * data[best_buy].cost;
		net_upkeep = (buy - data[best_buy].own) * (data[best_buy].upkeep || 0);
		if (land_buffer && !Bank.worth(land_buffer)) {
			Dashboard.status(this, '<i>Deferring to Land</i>');
		} else if (Bank.worth(cost + land_buffer)) {
			Dashboard.status(this, (this.option._disabled ? 'Would buy ' : 'Buying ') + (buy - data[best_buy].own) + ' &times; ' + best_buy + ' for ' + Config.makeImage('gold') + '$' + cost.SI() + (net_upkeep ? ' (Upkeep: $' + net_upkeep.SI() + ')' : '') + (buy_pref > data[best_buy].own ? ' [' + data[best_buy].own + '/' + buy_pref + ']' : ''));
		} else {
			Dashboard.status(this, 'Waiting for ' + Config.makeImage('gold') + '$' + (cost + land_buffer - Bank.worth()).SI() + ' to buy ' + (buy - data[best_buy].own) + ' &times; ' + best_buy + ' for ' + Config.makeImage('gold') + '$' + cost.SI());
		}
	} else {
		if (this.option.maxcost === 'INCR'){
			this.set(['runtime','cost_incr'], incr === 14 ? 4 : incr + 1);
			this.set(['runtime','check'], now + 3600000);
		} else {
			this.set(['runtime','cost_incr'], null);
			this.set(['runtime','check'], null);
		}
		Dashboard.status(this);
	}
	this.set(['runtime','best_buy'], best_buy);
	this.set(['runtime','buy'], best_buy ? data[best_buy].buy.lower(buy - data[best_buy].own) : 0);
	this.set(['runtime','best_sell'], best_sell);
	this.set(['runtime','sell'], sell);
	this.set(['runtime','cost'], best_buy ? this.runtime.buy * data[best_buy].cost : 0);

	this.set(['option','_sleep'],
	  !this.runtime.best_sell &&
	  !(this.runtime.best_buy && Bank.worth(this.runtime.cost + land_buffer)) &&
	  !Page.isStale('town_soldiers') &&
	  !Page.isStale('town_blacksmith') &&
	  !Page.isStale('town_magic'));

	return true;
};

Town.work = function(state) {
	var i;
	if (state) {
		if (this.runtime.best_sell){
			this.sell(this.runtime.best_sell, this.runtime.sell);
		} else if (this.runtime.best_buy && Bank.worth(this.runtime.cost - ((Land.get('option.save_ahead', false) && Land.get('runtime.save_amount', 0)) || 0))){
			this.buy(this.runtime.best_buy, this.runtime.buy);
		} else if (!Page.data[i = 'town_soldiers'] || !Page.data[i = 'town_blacksmith'] || !Page.data[i = 'town_magic']) {
			Page.to(i);
		} else if (!Page.stale('town_soldiers', this.get('runtime.soldiers', 0), true)) {
			this.set('runtime.soldiers', 86400);
		} else if (!Page.stale('town_blacksmith', this.get('runtime.blacksmith', 0), true)) {
			this.set('runtime.blacksmith', 86400);
		} else if (!Page.stale('town_magic', this.get('runtime.magic', 0), true)) {
			this.set('runtime.magic', 86400);
		}
	}
	return QUEUE_CONTINUE;
};

Town.buy = function(item, number) { // number is absolute including already owned
	var qty, $form;
	this._unflush();
	if (!this.data[item] || !this.data[item].id || !this.data[item].buy || !this.data[item].buy.length || !Bank.worth(this.runtime.cost)) {
		return true; // We (pretend?) we own them
	}
	if (!Generals.to(this.option.general ? 'cost' : 'any') || !Bank.retrieve(this.runtime.cost) || !Page.to('town_'+this.data[item].page)) {
		return false;
	}
	qty = this.data[item].buy.lower(number);
	$form = $('form#'+APPID_+'itemBuy_' + this.data[item].id);
	if ($form.length) {
		log(LOG_WARN, 'Buying ' + qty + ' x ' + item + ' for $' + (qty * Town.data[item].cost).addCommas());
		$('select[name="amount"]', $form).val(qty);
		Page.click($('input[name="Buy"]', $form));
	}
	this.set(['runtime','cost_incr'], 4);
	return false;
};

Town.sell = function(item, number) { // number is absolute including already owned
	var qty, $form;
	this._unflush();
	if (!this.data[item] || !this.data[item].id || !this.data[item].sell || !this.data[item].sell.length) {
		return true;
	}
	if (!Page.to('town_'+this.data[item].page)) {
		return false;
	}
	qty = this.data[item].sell.lower(number);
	$form = $('form#'+APPID_+'itemSell_' + this.data[item].id);
	if ($form.length) {
		log(LOG_WARN, 'Selling ' + qty + ' x ' + item + ' for $' + (qty * Town.data[item].cost / 2).addCommas());
		$('select[name="amount"]', $form).val(qty);
		Page.click($('input[name="Sell"]', $form));
	}
	this.set(['runtime','cost_incr'], 4);
	return false;
};

Town.format_unit_str = function(name) {
    var i, j, k, n, m, p, s, str;

	if (name && ((p = Town.get(['data',name])) || (p = Generals.get(['data',name])))) {
		str = name;

		j = p.att || 0;
		k = p.def || 0;

		s = '';
		if ((m = (p.stats && p.stats.att) || 0) > 0) {
			s += j + '+' + m;
		} else if (m < 0) {
			s += j + m;
		} else {
			s += j;
		}
		j += m;

		s += '/';
		if ((n = (p.stats && p.stats.def) || 0) > 0) {
			s += k + '+' + n;
		} else if (n < 0) {
			s += k + n;
		} else {
			s += k;
		}
		k += n;

		if (m || n) {
			s = '<span style="color:green;" title="' + s + '">';
		} else {
			s = '';
		}

		str += ' (' + s + j + '/' + k + (s ? '</span>' : '') + ')';

		if ((n = p.cost)) {
			str += ' <span style="color:blue;">$' + n.SI() + '</span>';
		}

		if ((n = p.upkeep)) {
			str += ' <span style="color:red;">$' + n.SI() + '/hr</span>';
		}
	} else {
		log(LOG_WARN, '# format_unit_str(' + name + ') not found!');
    }

    return str;
};

var makeTownDash = function(list, unitfunc, x, type, name, count) { // Find total att(ack) or def(ense) value from a list of objects (with .att and .def)
	var units = [], output = [], i, o, p,
		order = {
			Weapon:1,
			Shield:2,
			Helmet:3,
			Armor:4,
			Amulet:5,
			Gloves:6,
			Magic:7
		};

	if (name) {
		output.push('<div><h3><a>' + name + '</a></h3><div>');
	}

	for (i in list) {
		unitfunc(units, i, list);
	}

	if ((o = list[units[0]])) {
		if (type === 'duel' && o.type) {
			units.sort(function(a,b) {
				return order[list[a].type] - order[list[b].type]
					|| (list[a].upkeep || 0) - (list[b].upkeep || 0)
					|| (list[a].cost || 0) - (list[b].cost || 0);
			});
		} else {
			units.sort(function(a,b) {
				return (list[b]['tot_'+x] - list[a]['tot_'+x])
					|| (list[a].upkeep || 0) - (list[b].upkeep || 0)
					|| (list[a].cost || 0) - (list[b].cost || 0);
			});
		}
	}
	for (i=0; i<(count ? count : units.length); i++) {
		p = list[units[i]];
		if ((o && o.skills) || (p.use && p.use[type+'_'+x])) {
			output.push('<div style="height:25px;margin:1px;">');
			output.push('<img src="' + imagepath + p.img + '"');
			output.push(' style="width:25px;height:25px;float:left;margin-right:4px;">');
			output.push(' ');
			if (p.use) {
				output.push(p.use[type+'_'+x]+' &times; ');
			}
			output.push(this.format_unit_str(units[i]));
			output.push('</div>');
		}
	}

	if (name) {
		output.push('</div></div>');
	}

	return output.join('');
};

Town.dashboard = function() {
	var i, best, tmp, lset = [], rset = [], generals = Generals.get(),
		fn_own = function(list, i, units) {
			if (units[i].own) {
				list.push(i);
			}
		},
		fn_page_soldiers = function(list, i, units) {
			if (units[i].page === 'soldiers') {
				list.push(i);
			}
		},
		fn_page_blacksmith = function(list, i, units) {
			if (units[i].page === 'blacksmith') {
				list.push(i);
			}
		},
		fn_page_magic = function(list, i, units) {
			if (units[i].page === 'magic') {
				list.push(i);
			}
		},
		fn_type_weapon = function(list, i, units) {
			if (units[i].type === 'Weapon') {
				list.push(i);
			}
		},
		fn_type_not_weapon = function(list, i, units) {
			if (units[i].page === 'blacksmith' && units[i].type !== 'Weapon') {
				list.push(i);
			}
		},
		fn_type_shield = function(list, i, units) {
			if (units[i].type === 'Shield') {
				list.push(i);
			}
		},
		fn_type_armor = function(list, i, units) {
			if (units[i].type === 'Armor') {
				list.push(i);
			}
		},
		fn_type_helmet = function(list, i, units) {
			if (units[i].type === 'Helmet') {
				list.push(i);
			}
		},
		fn_type_amulet = function(list, i, units) {
			if (units[i].type === 'Amulet') {
				list.push(i);
			}
		},
		fn_type_gloves = function(list, i, units) {
			if (units[i].type === 'Gloves') {
				list.push(i);
			}
		};

	// invade

	// prepare a short list of items being used
	tmp = {};
	for (i in this.data) {
		if (this.data[i].use && this.data[i].use.invade_att) {
			tmp[i] = this.data[i];
		}
	}

	lset.push('<div><h3><a>Invade - Attack</a></h3><div>');
	lset.push(makeTownDash(generals, fn_own, 'att', 'invade', 'Heroes'));
	lset.push(makeTownDash(tmp, fn_page_soldiers, 'att', 'invade', 'Soldiers'));
	lset.push(makeTownDash(tmp, fn_type_weapon, 'att', 'invade', 'Weapons'));
	lset.push(makeTownDash(tmp, fn_type_not_weapon, 'att', 'invade', 'Equipment'));
	lset.push(makeTownDash(tmp, fn_page_magic, 'att', 'invade', 'Magic'));
	lset.push('</div></div>');

	// prepare a short list of items being used
	tmp = {};
	for (i in this.data) {
		if (this.data[i].use && this.data[i].use.invade_def) {
			tmp[i] = this.data[i];
		}
	}

	rset.push('<div><h3><a>Invade - Defend</a></h3><div>');
	rset.push(makeTownDash(generals, fn_own, 'def', 'invade', 'Heroes'));
	rset.push(makeTownDash(tmp, fn_page_soldiers, 'def', 'invade', 'Soldiers'));
	rset.push(makeTownDash(tmp, fn_type_weapon, 'def', 'invade', 'Weapons'));
	rset.push(makeTownDash(tmp, fn_type_not_weapon, 'def', 'invade', 'Equipment'));
	rset.push(makeTownDash(tmp, fn_page_magic, 'def', 'invade', 'Magic'));
	rset.push('</div></div>');
	
	// duel

	// prepare a short list of items being used
	tmp = {};
	for (i in this.data) {
		if (this.data[i].use && this.data[i].use.duel_att) {
			tmp[i] = this.data[i];
		}
	}

	lset.push('<div><h3><a>Duel - Attack</a></h3><div>');
	if ((best = Generals.best('duel')) !== 'any') {
		lset.push('<div style="height:25px;margin:1px;">');
		lset.push('<img src="' + imagepath + generals[best].img + '"');
		lset.push(' style="width:25px;height:25px;float:left;margin-right:4px;">');
		lset.push(this.format_unit_str(best));
		lset.push('</div>');
	}
	lset.push(makeTownDash(tmp, fn_page_blacksmith, 'att', 'duel'));
	lset.push(makeTownDash(tmp, fn_page_magic, 'att', 'duel'));
	lset.push('</div></div>');
	
	// prepare a short list of items being used
	tmp = {};
	for (i in this.data) {
		if (this.data[i].use && this.data[i].use.duel_def) {
			tmp[i] = this.data[i];
		}
	}

	rset.push('<div><h3><a>Duel - Defend</a></h3><div>');
	if ((best = Generals.best('defend')) !== 'any') {
		rset.push('<div style="height:25px;margin:1px;">');
		rset.push('<img src="' + imagepath + generals[best].img + '"');
		rset.push(' style="width:25px;height:25px;float:left;margin-right:4px;">');
		rset.push(this.format_unit_str(best));
		rset.push('</div>');
	}
	rset.push(makeTownDash(tmp, fn_page_blacksmith, 'def', 'duel'));
	rset.push(makeTownDash(tmp, fn_page_magic, 'def', 'duel'));
	rset.push('</div></div>');

	// war

	// prepare a short list of items being used
	tmp = {};
	for (i in this.data) {
		if (this.data[i].use && this.data[i].use.war_att) {
			tmp[i] = this.data[i];
			}
	}

	lset.push('<div><h3><a>War - Attack</a></h3><div>');
	lset.push(makeTownDash(generals, fn_own, 'att', 'war', 'Heroes', 6));
	lset.push(makeTownDash(tmp, fn_type_weapon, 'att', 'war', 'Weapons'));
	lset.push(makeTownDash(tmp, fn_type_shield, 'att', 'war', 'Shield'));
	lset.push(makeTownDash(tmp, fn_type_armor, 'att', 'war', 'Armor'));
	lset.push(makeTownDash(tmp, fn_type_helmet, 'att', 'war', 'Helmet'));
	lset.push(makeTownDash(tmp, fn_type_amulet, 'att', 'war', 'Amulet'));
	lset.push(makeTownDash(tmp, fn_type_gloves, 'att', 'war', 'Gloves'));
	lset.push(makeTownDash(tmp, fn_page_magic, 'att', 'war', 'Magic'));
	lset.push('</div></div>');

	// prepare a short list of items being used
	tmp = {};
	for (i in this.data) {
		if (this.data[i].use && this.data[i].use.war_def) {
			tmp[i] = this.data[i];
		}
	}

	rset.push('<div><h3><a>War - Defend</a></h3><div>');
	rset.push(makeTownDash(generals, fn_own, 'def', 'war', 'Heroes', 6));
	rset.push(makeTownDash(tmp, fn_type_weapon, 'def', 'war', 'Weapons'));
	rset.push(makeTownDash(tmp, fn_type_shield, 'def', 'war', 'Shield'));
	rset.push(makeTownDash(tmp, fn_type_armor, 'def', 'war', 'Armor'));
	rset.push(makeTownDash(tmp, fn_type_helmet, 'def', 'war', 'Helmet'));
	rset.push(makeTownDash(tmp, fn_type_amulet, 'def', 'war', 'Amulet'));
	rset.push(makeTownDash(tmp, fn_type_gloves, 'def', 'war', 'Gloves'));
	rset.push(makeTownDash(tmp, fn_page_magic, 'def', 'war', 'Magic'));
	rset.push('</div></div>');
	
	// div wrappers

	lset.unshift('<div style="float:left;width:50%;">');
	lset.push('</div>');

	rset.unshift('<div style="float:right;width:50%;">');
	rset.push('</div>');

	$('#golem-dashboard-Town').html(lset.join('') + rset.join(''));
	$('#golem-dashboard-Town h3').parent().accordion({
		collapsible: true,
		autoHeight: false,
		active: false,
		clearStyle: true,
		animated: 'blind',
		header: '> h3'
	});

};

Town.qualify = function(name, icon) {
	var p;

	if (isString(name)) {
		// if name already has a qualifier, peel it off
		if ((p = name.search(/\s*\(/m)) >= 0) {
			name = name.substr(0, p).trim();
		}

		// if an icon is provided, use it to further qualify the name
		if (isString(icon)) {
			if (isObject(p = this.dup_map[name]) && (icon in p)) {
				name = p[icon];
			}
		}
	}

	return name;
};

Town.dup_map = {
	'Earth Shard': { // Alchemy
		'gift_earth_1.jpg':	'Earth Shard (1)',
		'gift_earth_2.jpg':	'Earth Shard (2)',
		'gift_earth_3.jpg':	'Earth Shard (3)',
		'gift_earth_4.jpg':	'Earth Shard (4)'
	},
	'Elven Crown': { // Helmet
		'gift_aeris_complete.jpg':	'Elven Crown (Aeris)',
		'eq_sylvanus_crown.jpg':	'Elven Crown (Sylvanas)'
	},
	'Green Emerald Shard': { // Alchemy
		'mystery_armor_emerald_1.jpg': 'Green Emerald Shard (1)',
		'mystery_armor_emerald_2.jpg': 'Green Emerald Shard (2)'
	},
	'Maelstrom': { // Magic
		'magic_maelstrom.jpg':		'Maelstrom (Marina)',
		'eq_valhalla_spell.jpg':	'Maelstrom (Valhalla)'
	}
};

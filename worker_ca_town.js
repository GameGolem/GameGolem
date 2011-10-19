/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Workers, Config, Dashboard, Page, Queue, Resources,
	Bank, Battle, Generals, LevelUp, Player, Quest, Land,
	APP, APPID, APPID_, PREFIX, userID, imagepath,
	isRelease, version, revision, Images, window, browser, console,
	LOG_ERROR, LOG_WARN, LOG_LOG, LOG_INFO, LOG_DEBUG, log,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	isArray, isFunction, isNumber, isObject, isString, isUndefined,
	length, sum, tr, th, td
*/
/********** Worker.Town **********
* Sorts and auto-buys all town units (not property)
*/
var Town = new Worker('Town');
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

Town.temp = {
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

// Find total att(ack) or def(ense) value from a list of objects (with .att and .def)
Town.getAttDef = function(list, unitfunc, x, count, type, suffix) {
	var units = [], limit = 1e99, attack = 0, defend = 0, i, n, p, w, own, x2,
		atk, def, val, ascale = 1, dscale = 1, hi = -1e99, lo = 1e99, used = 0;

	this.temp.AttDefMin = 0;
	this.temp.AttDefMax = 0;
	this.temp.AttDefAvg = 0;

	x2 = type === 'monster' ? x : 'tot_' + x;
	if (x === 'att') {
		dscale = type === 'monster' ? 0 : 0.7;
	} else if (x === 'def') {
		ascale = type === 'monster' ? 0 : 0.7;
	}

	if (unitfunc) {
		for (i in list) {
			unitfunc(units, i, list);
		}
	} else {
		units = this.temp.AttDefList || [];
	}

	units.sort(function(a,b) {
		return (list[b][x2] || 0) - (list[a][x2] || 0)
			|| (list[a].upkeep || 0) - (list[b].upkeep || 0)
			|| (list[a].cost || 0) - (list[b].cost || 0);
	});

	if (!suffix) { suffix = ''; }
	// hack for limits of 3 on war equipment
	if (count < 0) {
		limit = 3;
		count = Math.abs(count);
	}
	for (i = 0; i < units.length; i++) {
		p = list[units[i]];
		own = isNumber(p.own) ? p.own : 0;
		n = Math.min(count, own, limit);
		if (type) {
			// note how many we'd like to have used in Resources
			w = Math.max(0, Math.min(count, limit));
			/*
			if (w > 0 && w > n) {
				log(LOG_INFO, '# would use ' + w + '/' + n + ' ' + units[i]
				  + ' for ' + type + '.' + x
				);
			}
			*/
			Resources.set(['data', '_'+units[i], type+suffix+'_'+x], w || undefined);
			/*
			if (n > 0) {
				log(LOG_WARN, 'Utility','Using: '+n+' x '+units[i]+' = '+JSON.stringify(p));
			}
			*/
			this.set(['data',units[i],'use'+suffix,type+suffix+'_'+x], n > 0 ? n : undefined);
		}
		if (n > 0) {
			atk = (p['att'] || 0) + ((p['stats'] && p['stats']['att']) || 0);
			def = (p['def'] || 0) + ((p['stats'] && p['stats']['def']) || 0);
			attack += n * atk;
			defend += n * def;
			count -= n;
			used += n;
			val = atk * ascale + def * dscale;
			hi = Math.max(hi, val);
			lo = Math.min(lo, val);
		}
	}
	this.temp.AttDefList = units;

	// count empty slots as zero for min/max
	if (hi > -1e99) {
		this.temp.AttDefMax = hi;
	}
	if (count <= 0 && lo < 1e99) {
		this.temp.AttDefMin = lo;
	}
	val = attack * ascale + defend * dscale;
	if (used > 0 && val) {
		this.temp.AttDefAvg = val / used;
	}

	return val;
};

Town.getInvade = function(army, suffix) {
	var obj = {}, att = 0, def = 0, tag = 'invade',
		gens = 1 + Math.floor((army - 1) / 5),
		data = this.get('data'),
		generals = Generals.get('data');

	if (!suffix) { suffix = ''; }

	try {
		this._transaction();

		att += this.getAttDef(generals, function(list, i, units) {
			if (units[i].own) {
				list.push(i);
			}
		}, 'att', gens, tag, suffix);
		obj['attack_hero_max'] = this.temp.AttDefMax;
		obj['attack_hero_min'] = this.temp.AttDefMin;
		obj['attack_hero_avg'] = this.temp.AttDefAvg;
		def += this.getAttDef(generals, null, 'def', gens, tag, suffix);
		obj['defend_hero_max'] = this.temp.AttDefMax;
		obj['defend_hero_min'] = this.temp.AttDefMin;
		obj['defend_hero_avg'] = this.temp.AttDefAvg;

		att += this.getAttDef(data, function(list, i, units) {
			if (units[i].page === 'soldiers') {
				list.push(i);
			}
		}, 'att', army, tag, suffix);
		obj['attack_unit_max'] = this.temp.AttDefMax;
		obj['attack_unit_min'] = this.temp.AttDefMin;
		obj['attack_unit_avg'] = this.temp.AttDefAvg;
		def += this.getAttDef(data, null, 'def', army, tag, suffix);
		obj['defend_unit_max'] = this.temp.AttDefMax;
		obj['defend_unit_min'] = this.temp.AttDefMin;
		obj['defend_unit_avg'] = this.temp.AttDefAvg;

		att += this.getAttDef(data, function(list, i, units) {
			if (units[i].page === 'blacksmith' && units[i].type === 'Weapon') {
				list.push(i);
			}
		}, 'att', army, tag, suffix);
		obj['attack_weapon_max'] = this.temp.AttDefMax;
		obj['attack_weapon_min'] = this.temp.AttDefMin;
		obj['attack_weapon_avg'] = this.temp.AttDefAvg;
		def += this.getAttDef(data, null, 'def', army, tag, suffix);
		obj['defend_weapon_max'] = this.temp.AttDefMax;
		obj['defend_weapon_min'] = this.temp.AttDefMin;
		obj['defend_weapon_avg'] = this.temp.AttDefAvg;

		att += this.getAttDef(data, function(list, i, units) {
			if (units[i].page === 'blacksmith' && units[i].type !== 'Weapon') {
				list.push(i);
			}
		}, 'att', army, tag, suffix);
		obj['attack_equip_max'] = this.temp.AttDefMax;
		obj['attack_equip_min'] = this.temp.AttDefMin;
		obj['attack_equip_avg'] = this.temp.AttDefAvg;
		def += this.getAttDef(data, null, 'def', army, tag, suffix);
		obj['defend_equip_max'] = this.temp.AttDefMax;
		obj['defend_equip_min'] = this.temp.AttDefMin;
		obj['defend_equip_avg'] = this.temp.AttDefAvg;

		att += this.getAttDef(data, function(list, i, units) {
			if (units[i].page === 'magic') {
				list.push(i);
			}
		}, 'att', army, tag, suffix);
		obj['attack_magic_max'] = this.temp.AttDefMax;
		obj['attack_magic_min'] = this.temp.AttDefMin;
		obj['attack_magic_avg'] = this.temp.AttDefAvg;
		def += this.getAttDef(data, null, 'def', army, tag, suffix);
		obj['defend_magic_max'] = this.temp.AttDefMax;
		obj['defend_magic_min'] = this.temp.AttDefMin;
		obj['defend_magic_avg'] = this.temp.AttDefAvg;

		obj.attack = att;
		obj.defend = def;

		this._transaction(true);
	} catch (e) {
		log(LOG_ERROR, e.name + ' in ' + this.name + '.getInvade(): ' + e.message);
		this._transaction(false);
		obj.attack = obj.defend = 0;
	}

	return obj;
};

Town.getDuel = function() {
	var obj = {}, att = 0, def = 0, tag = 'duel', data = this.get('data');

	att += this.getAttDef(data, function(list, i, units) {
		if (units[i].page === 'blacksmith' && units[i].type === 'Weapon') {
			list.push(i);
		}
	}, 'att', 1, tag);
	obj['attack_weapon_max'] = this.temp.AttDefMax;
	obj['attack_weapon_min'] = this.temp.AttDefMin;
	def += this.getAttDef(data, null, 'def', 1, tag);
	obj['defend_weapon_max'] = this.temp.AttDefMax;
	obj['defend_weapon_min'] = this.temp.AttDefMin;

	att += this.getAttDef(data, function(list, i, units) {
		if (units[i].page === 'blacksmith' && units[i].type === 'Shield') {
			list.push(i);
		}
	}, 'att', 1, tag);
	obj['attack_shield_max'] = this.temp.AttDefMax;
	obj['attack_shield_min'] = this.temp.AttDefMin;
	def += this.getAttDef(data, null, 'def', 1, tag);
	obj['defend_shield_max'] = this.temp.AttDefMax;
	obj['defend_shield_min'] = this.temp.AttDefMin;

	att += this.getAttDef(data, function(list, i, units) {
		if (units[i].page === 'blacksmith' && units[i].type === 'Armor') {
			list.push(i);
		}
	}, 'att', 1, tag);
	obj['attack_armor_max'] = this.temp.AttDefMax;
	obj['attack_armor_min'] = this.temp.AttDefMin;
	def += this.getAttDef(data, null, 'def', 1, tag);
	obj['defend_armor_max'] = this.temp.AttDefMax;
	obj['defend_armor_min'] = this.temp.AttDefMin;

	att += this.getAttDef(data, function(list, i, units) {
		if (units[i].page === 'blacksmith' && units[i].type === 'Helmet') {
			list.push(i);
		}
	}, 'att', 1, tag);
	obj['attack_helmet_max'] = this.temp.AttDefMax;
	obj['attack_helmet_min'] = this.temp.AttDefMin;
	def += this.getAttDef(data, null, 'def', 1, tag);
	obj['defend_helmet_max'] = this.temp.AttDefMax;
	obj['defend_helmet_min'] = this.temp.AttDefMin;

	att += this.getAttDef(data, function(list, i, units) {
		if (units[i].page === 'blacksmith' && units[i].type === 'Amulet') {
			list.push(i);
		}
	}, 'att', 1, tag);
	obj['attack_amulet_max'] = this.temp.AttDefMax;
	obj['attack_amulet_min'] = this.temp.AttDefMin;
	def += this.getAttDef(data, null, 'def', 1, tag);
	obj['defend_amulet_max'] = this.temp.AttDefMax;
	obj['defend_amulet_min'] = this.temp.AttDefMin;

	att += this.getAttDef(data, function(list, i, units) {
		if (units[i].page === 'blacksmith' && units[i].type === 'Gloves') {
			list.push(i);
		}
	}, 'att', 1, tag);
	obj['attack_gloves_max'] = this.temp.AttDefMax;
	obj['attack_gloves_min'] = this.temp.AttDefMin;
	def += this.getAttDef(data, null, 'def', 1, tag);
	obj['defend_gloves_max'] = this.temp.AttDefMax;
	obj['defend_gloves_min'] = this.temp.AttDefMin;

	att += this.getAttDef(data, function(list, i, units) {
		if (units[i].page === 'magic') {
			list.push(i);
		}
	}, 'att', 1, tag);
	obj['attack_magic_max'] = this.temp.AttDefMax;
	obj['attack_magic_min'] = this.temp.AttDefMin;
	def += this.getAttDef(data, null, 'def', 1, tag);
	obj['defend_magic_max'] = this.temp.AttDefMax;
	obj['defend_magic_min'] = this.temp.AttDefMin;

	obj.attack = att;
	obj.defend = def;

	return obj;
};

Town.getWar = function() {
	var obj = {}, att = 0, def = 0, tag = 'war',
		data = this.get('data'),
		generals = Generals.get('data');

	att += this.getAttDef(generals, function(list, i, units) {
		if (units[i].own) {
			list.push(i);
		}
	}, 'att', 6, tag);
	obj['attack_hero_max'] = this.temp.AttDefMax;
	obj['attack_hero_min'] = this.temp.AttDefMin;
	obj['attack_hero_avg'] = this.temp.AttDefAvg;
	def += this.getAttDef(generals, null, 'def', 6, tag);
	obj['defend_hero_max'] = this.temp.AttDefMax;
	obj['defend_hero_min'] = this.temp.AttDefMin;
	obj['defend_hero_avg'] = this.temp.AttDefAvg;

	att += this.getAttDef(data, function(list, i, units) {
		if (units[i].page === 'blacksmith' && units[i].type === 'Weapon') {
			list.push(i);
		}
	}, 'att', -7, tag);
	obj['attack_weapon_max'] = this.temp.AttDefMax;
	obj['attack_weapon_min'] = this.temp.AttDefMin;
	obj['attack_weapon_avg'] = this.temp.AttDefAvg;
	def += this.getAttDef(data, null, 'def', -7, tag);
	obj['defend_weapon_max'] = this.temp.AttDefMax;
	obj['defend_weapon_min'] = this.temp.AttDefMin;
	obj['defend_weapon_avg'] = this.temp.AttDefAvg;

	att += this.getAttDef(data, function(list, i, units) {
		if (units[i].page === 'blacksmith' && units[i].type === 'Shield') {
			list.push(i);
		}
	}, 'att', -7, tag);
	obj['attack_shield_max'] = this.temp.AttDefMax;
	obj['attack_shield_min'] = this.temp.AttDefMin;
	obj['attack_shield_avg'] = this.temp.AttDefAvg;
	def += this.getAttDef(data, null, 'def', -7, tag);
	obj['defend_shield_max'] = this.temp.AttDefMax;
	obj['defend_shield_min'] = this.temp.AttDefMin;
	obj['defend_shield_avg'] = this.temp.AttDefAvg;

	att += this.getAttDef(data, function(list, i, units) {
		if (units[i].page === 'blacksmith' && units[i].type === 'Armor') {
			list.push(i);
		}
	}, 'att', -7, tag);
	obj['attack_armor_max'] = this.temp.AttDefMax;
	obj['attack_armor_min'] = this.temp.AttDefMin;
	obj['attack_armor_avg'] = this.temp.AttDefAvg;
	def += this.getAttDef(data, null, 'def', -7, tag);
	obj['defend_armor_max'] = this.temp.AttDefMax;
	obj['defend_armor_min'] = this.temp.AttDefMin;
	obj['defend_armor_avg'] = this.temp.AttDefAvg;

	att += this.getAttDef(data, function(list, i, units) {
		if (units[i].page === 'blacksmith' && units[i].type === 'Helmet') {
			list.push(i);
		}
	}, 'att', -7, tag);
	obj['attack_helmet_max'] = this.temp.AttDefMax;
	obj['attack_helmet_min'] = this.temp.AttDefMin;
	obj['attack_helmet_avg'] = this.temp.AttDefAvg;
	def += this.getAttDef(data, null, 'def', -7, tag);
	obj['defend_helmet_max'] = this.temp.AttDefMax;
	obj['defend_helmet_min'] = this.temp.AttDefMin;
	obj['defend_helmet_avg'] = this.temp.AttDefAvg;

	att += this.getAttDef(data, function(list, i, units) {
		if (units[i].page === 'blacksmith' && units[i].type === 'Amulet') {
			list.push(i);
		}
	}, 'att', -7, tag);
	obj['attack_amulet_max'] = this.temp.AttDefMax;
	obj['attack_amulet_min'] = this.temp.AttDefMin;
	obj['attack_amulet_avg'] = this.temp.AttDefAvg;
	def += this.getAttDef(data, null, 'def', -7, tag);
	obj['defend_amulet_max'] = this.temp.AttDefMax;
	obj['defend_amulet_min'] = this.temp.AttDefMin;
	obj['defend_amulet_avg'] = this.temp.AttDefAvg;

	att += this.getAttDef(data, function(list, i, units) {
		if (units[i].page === 'blacksmith' && units[i].type === 'Gloves') {
			list.push(i);
		}
	}, 'att', -7, tag);
	obj['attack_gloves_max'] = this.temp.AttDefMax;
	obj['attack_gloves_min'] = this.temp.AttDefMin;
	obj['attack_gloves_avg'] = this.temp.AttDefAvg;
	def += this.getAttDef(data, null, 'def', -7, tag);
	obj['defend_gloves_max'] = this.temp.AttDefMax;
	obj['defend_gloves_min'] = this.temp.AttDefMin;
	obj['defend_gloves_avg'] = this.temp.AttDefAvg;

	att += this.getAttDef(data, function(list, i, units) {
		if (units[i].page === 'magic') {
			list.push(i);
		}
	}, 'att', -7, tag);
	obj['attack_magic_max'] = this.temp.AttDefMax;
	obj['attack_magic_min'] = this.temp.AttDefMin;
	obj['attack_magic_avg'] = this.temp.AttDefAvg;
	def += this.getAttDef(data, null, 'def', -7, tag);
	obj['defend_magic_max'] = this.temp.AttDefMax;
	obj['defend_magic_min'] = this.temp.AttDefMin;
	obj['defend_magic_avg'] = this.temp.AttDefAvg;

	obj.attack = att;
	obj.defend = def;

	return obj;
};

Town.getMonster = function() {
	var obj = {}, att = 0, def = 0, tag = 'monster', data = this.get('data');

	att += this.getAttDef(data, function(list, i, units) {
		if (units[i].page === 'blacksmith' && units[i].type === 'Weapon') {
			list.push(i);
		}
	}, 'att', 1, tag);
	obj['attack_weapon_max'] = this.temp.AttDefMax;
	obj['attack_weapon_min'] = this.temp.AttDefMin;
	def += this.getAttDef(data, null, 'def', 1, tag);
	obj['defend_weapon_max'] = this.temp.AttDefMax;
	obj['defend_weapon_min'] = this.temp.AttDefMin;

	att += this.getAttDef(data, function(list, i, units) {
		if (units[i].page === 'blacksmith' && units[i].type === 'Shield') {
			list.push(i);
		}
	}, 'att', 1, tag);
	obj['attack_shield_max'] = this.temp.AttDefMax;
	obj['attack_shield_min'] = this.temp.AttDefMin;
	def += this.getAttDef(data, null, 'def', 1, tag);
	obj['defend_shield_max'] = this.temp.AttDefMax;
	obj['defend_shield_min'] = this.temp.AttDefMin;

	att += this.getAttDef(data, function(list, i, units) {
		if (units[i].page === 'blacksmith' && units[i].type === 'Armor') {
			list.push(i);
		}
	}, 'att', 1, tag);
	obj['attack_armor_max'] = this.temp.AttDefMax;
	obj['attack_armor_min'] = this.temp.AttDefMin;
	def += this.getAttDef(data, null, 'def', 1, tag);
	obj['defend_armor_max'] = this.temp.AttDefMax;
	obj['defend_armor_min'] = this.temp.AttDefMin;

	att += this.getAttDef(data, function(list, i, units) {
		if (units[i].page === 'blacksmith' && units[i].type === 'Helmet') {
			list.push(i);
		}
	}, 'att', 1, tag);
	obj['attack_helmet_max'] = this.temp.AttDefMax;
	obj['attack_helmet_min'] = this.temp.AttDefMin;
	def += this.getAttDef(data, null, 'def', 1, tag);
	obj['defend_helmet_max'] = this.temp.AttDefMax;
	obj['defend_helmet_min'] = this.temp.AttDefMin;

	att += this.getAttDef(data, function(list, i, units) {
		if (units[i].page === 'blacksmith' && units[i].type === 'Amulet') {
			list.push(i);
		}
	}, 'att', 1, tag);
	obj['attack_amulet_max'] = this.temp.AttDefMax;
	obj['attack_amulet_min'] = this.temp.AttDefMin;
	def += this.getAttDef(data, null, 'def', 1, tag);
	obj['defend_amulet_max'] = this.temp.AttDefMax;
	obj['defend_amulet_min'] = this.temp.AttDefMin;

	att += this.getAttDef(data, function(list, i, units) {
		if (units[i].page === 'blacksmith' && units[i].type === 'Gloves') {
			list.push(i);
		}
	}, 'att', 1, tag);
	obj['attack_gloves_max'] = this.temp.AttDefMax;
	obj['attack_gloves_min'] = this.temp.AttDefMin;
	def += this.getAttDef(data, null, 'def', 1, tag);
	obj['defend_gloves_max'] = this.temp.AttDefMax;
	obj['defend_gloves_min'] = this.temp.AttDefMin;

	att += this.getAttDef(data, function(list, i, units) {
		if (units[i].page === 'blacksmith' && units[i].type === 'Boots') {
			list.push(i);
		}
	}, 'att', 1, tag);
	obj['attack_boots_max'] = this.temp.AttDefMax;
	obj['attack_boots_min'] = this.temp.AttDefMin;
	def += this.getAttDef(data, null, 'def', 1, tag);
	obj['defend_boots_max'] = this.temp.AttDefMax;
	obj['defend_boots_min'] = this.temp.AttDefMin;

	att += this.getAttDef(data, function(list, i, units) {
		if (units[i].page === 'magic') {
			list.push(i);
		}
	}, 'att', 1, tag);
	obj['attack_magic_max'] = this.temp.AttDefMax;
	obj['attack_magic_min'] = this.temp.AttDefMin;
	def += this.getAttDef(data, null, 'def', 1, tag);
	obj['defend_magic_max'] = this.temp.AttDefMax;
	obj['defend_magic_min'] = this.temp.AttDefMin;

	obj.attack = att;
	obj.defend = def;

	return obj;
};

Town.update = function(event, events) {
	var now = Date.now(), c, i, j, k, n, o, p, v, u, x, y,
		need, want, have, cost, upkeep, cmp,
		data = this.data, x1, x2, x3, x4,
		best_buy = null, buy_pref = 0, best_sell = null,
		best_in_class = {}, best_in_name = {}, good_buy,
		sell_pref = 0, best_quest = false, buy = 0, sell = 0,
		maxincome = Player.get('maxincome', 1, 'number'), // used as a divisor
		total_upkeep = Player.get('upkeep', 0, 'number'),
		// largest possible army, including bonus generals
		armymax = Math.max(501, Generals.get('runtime.armymax', 1, 'number')),
		// our army size, capped at the largest possible army size above
		army = Math.min(armymax, Math.max(Generals.get('runtime.army', 1, 'number'), Player.get('armymax', 1, 'number'))),
		max_buy = 0, max_sell = 0, resource, fixed_cost, max_cost, keep,
		land_buffer = (Land.get('option.save_ahead') && Land.get('runtime.save_amount', 0, 'number')) || 0,
		incr = this.runtime.cost_incr || 4,
		info_str, buy_str = '', sell_str = '', net_cost = 0, net_upkeep = 0,
		type_map_duel = {
			weapon: 'weapon',
			shield: 'shield',
			helmet: 'helmet',
			armor: 'armor',
			amulet: 'amulet',
			gloves: 'gloves',
			boots: 'boots',
			magic: 'magic'
		},
		type_map_invade = {
			soldiers: 'unit',
			unit: 'unit',
			weapon: 'weapon',
			shield: 'equip',
			helmet: 'equip',
			armor: 'equip',
			amulet: 'equip',
			gloves: 'equip',
			boots: 'equip',
			magic: 'magic'
		}, type, value, types;

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
		max_sell = Math.max(armymax, 541);
		break;
	case 'Max Army':
		max_buy = max_sell = Math.max(armymax, 541);
		break;
	default:
		max_buy = 0;
		max_sell = army;
		break;
	}

	// These four fill in all the data we need for buying / sellings items
	this.set(['runtime','invade'], this.getInvade(army));
	this.set(['runtime','duel'], this.getDuel());
	this.set(['runtime','war'], this.getWar());
	this.set(['runtime','monster'], this.getMonster());

	// Set up a keep set for future army sizes
	keep = {};
	if (army < max_sell) {
		this.set(['runtime', 'invade'+max_sell], this.getInvade(max_sell, max_sell.toString()));
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
		o = data[u];
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
		have = o.own || 0;
		need = 0;
		if (this.option.units !== 'Best Defense') {
			need = Math.range(need, Math.max(p.invade_att || 0, p.duel_att || 0, p.war_att || 0), max_buy);
		}
		if (this.option.units !== 'Best Offense') {
			need = Math.range(need, Math.max(p.invade_def || 0, p.duel_def || 0, p.war_def || 0), max_buy);
		}
		// If we're buying for a quest item
		// then we're only going to buy that item first
		// though possibly more than specifically needed
		if (want > have) {
			max_cost = 1e99; // arbitrarily high value
			need = want;
		} else {
			max_cost = fixed_cost;
		}

//		log(LOG_WARN, 'Item: '+u+', need: '+need+', want: '+want);
		if ((n = need - have) > 0) { // Want to buy more                                
			if (o.buy && o.buy.length
			  && o.cost <= max_cost
			  && (c = o.buy.lower(n))
			  && (!o.upkeep || this.option.upkeep >= (((total_upkeep + (o.upkeep * c)) / maxincome) * 100))
			  //&& i > 1 && (!best_buy || need > buy)
			) {
				// c is a convenient purchase size
				// n is the total shortfall
				if (buy_str !== '') { buy_str += ', '; }
				buy_str += n + ' &times; ' + u + ' (~$' + (o.cost * n).SI();
				//buy_str += ' < $' + max_cost.SI();
				net_cost += o.cost * n;
				if (isNumber(o.upkeep)) {
					buy_str += ', upkeep $' + (o.upkeep * n).SI();
					net_upkeep += o.upkeep * n;
				}
				buy_str += ')';
				// pin the buy to the first quest item, if quest_buy is enabled
				// order: buys by lowest total cost, then lowest total upkeep
				// ---
				// consider best in class also, so we don't buy something only
				// to replace it immediately with something better when both
				// are on the list of things to buy
				log(LOG_INFO, 'Want: ' + c + '/' + n + ' ' + u
				  + ((k = o.type) ? ' type[' + k + ']' : '')
				  + ((k = o.page) ? ' page[' + k + ']' : '')
				  + ((k = (p.duel_att || 0) - have) > 0 ? ' da[' + k + ']' : '')
				  + ((k = (p.duel_def || 0) - have) > 0 ? ' dd[' + k + ']' : '')
				  + ((k = (p.invade_att || 0) - have) > 0 ? ' ia[' + k + ']' : '')
				  + ((k = (p.invade_def || 0) - have) > 0 ? ' id[' + k + ']' : '')
				  + ((k = (p.war_att || 0) - have) > 0 ? ' wa[' + k + ']' : '')
				  + ((k = (p.war_def || 0) - have) > 0 ? ' wd[' + k + ']' : '')
				);
				good_buy = false;
				value = {};
				types = [];
				for (x in {duel:1, invade:1, war:1}) {
					for (y in {att:1, def:1}) {
						if ((k = (p[x+'_'+y] || 0) - have) > 0) {
							if (x === 'invade') {
								type = type_map_invade[o.type || o.page];
							} else {
								type = type_map_duel[o.type || o.page];
							}
							log(LOG_INFO, '# want ' + k + ' ' + type+'.'+u);
							if ((v = o['tot_'+y])) {
								value[type] = (value[type] || 0) + v;
								types[type] = 1;
							}
							log(LOG_INFO, '# type[' + type + ']'
							  + ' v[' + v + ']'
							  + ' value[' + value[type] + ']'
							);
						}
					}
				}
				for (type in types) {
					if ((best_in_class[type] || 0) < (value[type] || 0)) {
						if (best_in_name[type] === best_buy) {
							best_buy = null;
						}
						log(LOG_INFO, '# best.' + type
						  + ' was[' + best_in_name[type]
						  + ': ' + best_in_class[type] + ']'
						  + ' now[' + u + ': ' + value[type] + ']'
						);
						best_in_class[type] = value[type];
						best_in_name[type] = u;
						good_buy = true;
					}
				}
				if ((!best_quest || want) && good_buy && (!best_buy
				  || (o.cost || 0) * (have + c) < (data[best_buy].cost || 0) * buy
				  || ((o.cost || 0) * (have + c) === (data[best_buy].cost || 0) * buy
				  && o.upkeep * (have + c) < (data[best_buy].upkeep || 0) * buy))
				) {
//					log(LOG_WARN, 'Buy: ' + c + '/' + n);
					best_buy = u;
					buy = have + c; // this.buy() takes an absolute value
					buy_pref = Math.max(need, want);
					// If we're buying for a quest item
					// then we're only going to buy that item first
					// though possibly more than specifically needed
					if (want && want > have) {
						best_quest = true;
					}
				}
			} else if (o.cost) {
				x1 = need - have;
				x2 = isArray(o.buy) ? o.buy.lower(x1) : 1e99;
				x3 = (o.upkeep || 0) * x2;
				x4 = (total_upkeep + x3) * 100 / maxincome;
				log(LOG_DEBUG, '# skip: ' + u +
				  ', have ' + have +
				  ', need ' + need +
				  (o.cost ? ', cost $' + o.cost.SI() : '') +
				  ', max_cost ' + max_cost.SI() +
				  (o.upkeep ? ', upkeep $' + o.upkeep.SI() : '') +
				  (o.buy ? ', buy ' + JSON.shallow(o.buy,2) : '') +
				  (o.buy ? ', sell ' + JSON.shallow(o.sell,2) : '') +
				  ', x1 ' + x1 +
				  ', x2 ' + x2 +
				  ', x3 $' + x3.SI() +
				  ', x4 ' + x4.SI() + '%'
				);
			}
		} else if (max_buy && this.option.sell && Math.max(need,want) < have
		  && o.sell && o.sell.length
		) {
			// Want to sell off surplus (but never quest stuff)
			c = o.sell.lower(n = have - (k = Math.max(need, want, keep[u] || 0)));
			// c is a convenient sale size
			// n is the total surplus
			// k is the total need
			if (n > 0) {
				if (sell_str !== '') { sell_str += ', '; }
				sell_str += n + ' &times; ' + u + ' (~$' + (o.cost * n / 2).SI();
				net_cost -= o.cost / 2 * n;
				if (isNumber(o.upkeep)) {
					sell_str += ', upkeep $' + (o.upkeep * n).SI();
					net_upkeep -= o.upkeep * n;
				}
				sell_str += ')';
				// order: sells by highest upkeep saved, then highest cash gain
				if (!best_sell
				  || (cmp = (o.upkeep || 0) * c - (data[best_sell].upkeep || 0) * sell) > 0
				  || (!cmp && o.cost * c > data[best_sell].cost * sell)
				) {
//					log(LOG_WARN, 'Sell: ' + c + '/' + n);
					best_sell = u;
					sell = c;
					sell_pref = n;
				}
			}
		}
	}

	info_str = '';
	//info_str = '[' + new Date(now).format('D Y-m-d H:i:s.u') + ']';
	if (sell_str !== '' || buy_str !== '') {
		if (sell_str !== '') {
			if (info_str !== '') { info_str += '; '; }
			info_str += 'Sell: ' + sell_str;
		}
		if (buy_str !== '') {
			if (info_str !== '') { info_str += '; '; }
			info_str += 'Buy: ' + buy_str;
		}
		if (net_cost > 0) {
			info_str += '; net cost $' + net_cost.SI();
		} else if (net_cost < 0) {
			info_str += '; net gain $' + (-net_cost).SI();
		}
		if (net_upkeep) {
			info_str += '; net upkeep $' + net_upkeep.SI();
		}
		log(LOG_DEBUG, '# action: ' + info_str);
		info_str = '<span title="' + info_str + '">';
	}

	if (best_sell) {// Sell before we buy
		best_buy = null;
		buy = 0;
		upkeep = sell * (data[best_sell].upkeep || 0);
		Dashboard.status(this, info_str
		  + (this.option._disabled ? 'Would sell ' : 'Selling ')
		  + sell + ' &times; ' + best_sell
		  + ' for ' + Config.makeImage('gold', 'Gold')
		  + '$' + (sell * data[best_sell].cost / 2).SI()
		  + (upkeep ? ' (Upkeep: -$' + upkeep.SI() + ')': '')
		  + (sell_pref < data[best_sell].own ? ' [' + sell_pref + '/' + data[best_sell].own + ']': '')
		  + (info_str ? '</span>' : '')
		);
	} else if (best_buy){
		best_sell = null;
		sell = 0;
		cost = (buy - data[best_buy].own) * data[best_buy].cost;
		upkeep = (buy - data[best_buy].own) * (data[best_buy].upkeep || 0);
		if (land_buffer && !Bank.worth(land_buffer)) {
			Dashboard.status(this, info_str
			  + '<i>Deferring to Land</i>'
			  + (info_str ? '</span>' : '')
			);
		} else if (Bank.worth(cost + land_buffer)) {
			Dashboard.status(this, info_str
			  + (this.option._disabled ? 'Would buy ' : 'Buying ')
			  + (buy - data[best_buy].own) + ' &times; ' + best_buy
			  + ' for ' + Config.makeImage('gold', 'Gold')
			  + '$' + cost.SI()
			  + (upkeep ? ' (Upkeep: $' + upkeep.SI() + ')' : '')
			  + (buy_pref > data[best_buy].own
			  ? ' [' + data[best_buy].own + '/' + buy_pref + ']' : '')
			  + (info_str ? '</span>' : '')
			);
		} else {
			Dashboard.status(this, info_str
			  + 'Waiting for ' + Config.makeImage('gold', 'Gold')
			  + '<span title="$' + cost.SI()
			  + ' + $' + land_buffer.SI()
			  + ' - $' + Bank.worth().SI()
			  + '">'
			  + '$' + (cost + land_buffer - Bank.worth()).SI()
			  + '</span>'
			  + ' to buy ' + (buy - data[best_buy].own) + ' &times; ' + best_buy
			  + ' for ' + Config.makeImage('gold', 'Gold')
			  + '$' + cost.SI()
			  + (info_str ? '</span>' : '')
			);
		}
	} else {
		if (this.option.maxcost === 'INCR'){
			this.set(['runtime','cost_incr'], incr === 14 ? 4 : incr + 1);
			this.set(['runtime','check'], now + 3600000);
		} else {
			this.set(['runtime','cost_incr'], null);
			this.set(['runtime','check'], null);
		}
		if (this.option._hide_status === 1 && info_str) {
			Dashboard.status(this, info_str + '<i>Nothing to do.</i></span>');
		} else {
			Dashboard.status(this);
		}
	}
	this.set(['runtime','best_buy'], best_buy);
	this.set(['runtime','buy'], best_buy ? data[best_buy].buy.lower(buy - data[best_buy].own) : 0);
	this.set(['runtime','best_sell'], best_sell);
	this.set(['runtime','sell'], sell);
	this.set(['runtime','cost'], best_buy ? this.runtime.buy * data[best_buy].cost : 0);

	this.set(['option','_sleep'],
	  !this.runtime.best_sell
	  && !(this.runtime.best_buy && Bank.worth(this.runtime.cost + land_buffer))
	  && !Page.isStale('town_soldiers')
	  && !Page.isStale('town_blacksmith')
	  && !Page.isStale('town_magic')
	);

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

	if (name && ((p = Generals.get(['data',name])) || (p = Town.get(['data',name])))) {
		str = name;

		j = p.att || 0;
		k = p.def || 0;

		s = '';
		if ((m = (p.stats && p.stats.att) || 0) > 0) {
			s += j + '+' + m;
		} else if (m < 0) {
			s += j + '' + m;
		} else {
			s += j;
		}
		j += m;

		s += '/';
		if ((n = (p.stats && p.stats.def) || 0) > 0) {
			s += k + '+' + n;
		} else if (n < 0) {
			s += k + '' + n;
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

// Find total att(ack) or def(ense) value from a list of objects (with .att and .def)
Town.makeDash = function(list, unitfunc, x, type, name, count) {
	var i, j, k, o, p, units = [], output = [], label = [], top = 0, end = 0,
		order = {
			Weapon:1,
			Shield:2,
			Helmet:3,
			Armor:4,
			Amulet:5,
			Gloves:6,
			Boots:7,
			magic:8
		};

	if (name && name.charAt(0) === '*') {
		p = name.substr(1).split(',');
		if (p.length >= 2) {
			top = order[p[0]];
			end = order[p[1]];
		} else if (p.length >= 1) {
			top = 1;
			end = order[p[0]];
		}
		name = null;
	}

	if (name) {
		output.push('<div><h3><a>' + name + '</a></h3><div>');
	}

	for (i in list) {
		unitfunc(units, i, list);
	}

	o = list[units[0]];
	if (type === 'duel' || type === 'monster') {
		units.sort(function(a,b) {
			return (order[list[a]['type'] || list[a]['page']]
			  - order[list[b]['type'] || list[b]['page']]
			  || (list[a]['upkeep'] || 0) - (list[b]['upkeep'] || 0)
			  || (list[a]['cost'] || 0) - (list[b]['cost'] || 0));
		});
		if (top) {
			for (i in order) {
				label[order[i] - 1] = i.ucfirst();
			}
		}
		if (units.length < end - top + 1) {
			k = [];
			while ((j = units.shift())) {
				p = list[j];
				while ((order[p.type || p.page] || top) > k.length + 2) {
					k.push('<i>empty</i>');
				}
				if (order[p.type || p.page] === k.length + 1) {
					k.push(j);
				}
			}
			while (k.length < end - top + 1) {
				k.push('<i>empty</i>');
			}
			units = k;
		}
	} else {
		units.sort(function(a,b) {
			return ((list[b]['tot_'+x] - list[a]['tot_'+x])
			  || (list[a]['upkeep'] || 0) - (list[b]['upkeep'] || 0)
			  || (list[a]['cost'] || 0) - (list[b]['cost'] || 0));
		});
	}

	for (i = 0; i < (count ? count : units.length); i++) {
		p = list[units[i]];
		if (!p) {
			output.push('<div style="height:25px;margin:1px;">');
			output.push('<img style="width:25px;height:25px;float:left;margin-right:4px;">');
			if (top) {
				output.push(' <b>' + label[i + top - 1] + ':</b>');
			}
			output.push(' ' + units[i]);
			output.push('</div>');
		} else if ((o && o['skills']) || (p['use'] && p['use'][type+'_'+x])) {
			output.push('<div style="height:25px;margin:1px;">');
			output.push('<img src="' + imagepath + p.img + '"');
			output.push(' style="width:25px;height:25px;float:left;margin-right:4px;">');
			output.push(' ');
			if (type === 'duel' || type === 'monster') {
				if (top) {
					output.push('<b>' + label[i + top - 1] + ':</b>');
				}
			} else if (name !== 'Heroes' && p['use']) {
				output.push(' ' + p.use[type+'_'+x]+' &times;');
			}
			output.push(' ' + this.format_unit_str(units[i]));
			output.push('</div>');
		}
	}

	if (name) {
		output.push('</div></div>');
	}

	return output.join('');
};

Town.dashboard = function() {
	var i, best, tag, tmp, lset = [], rset = [], generals = Generals.get(),
		fn_hero = function(list, i, units) {
			if (units[i].own) {
				list.push(i);
			}
		},
		fn_soldier = function(list, i, units) {
			if (units[i].page === 'soldiers') {
				list.push(i);
			}
		},
		fn_blacksmith = function(list, i, units) {
			if (units[i].page === 'blacksmith') {
				list.push(i);
			}
		},
		fn_magic = function(list, i, units) {
			if (units[i].page === 'magic') {
				list.push(i);
			}
		},
		fn_weapon = function(list, i, units) {
			if (units[i].page === 'blacksmith' && units[i].type === 'Weapon') {
				list.push(i);
			}
		},
		fn_equipment = function(list, i, units) {
			if (units[i].page === 'blacksmith' && units[i].type !== 'Weapon') {
				list.push(i);
			}
		},
		fn_shield = function(list, i, units) {
			if (units[i].page === 'blacksmith' && units[i].type === 'Shield') {
				list.push(i);
			}
		},
		fn_armor = function(list, i, units) {
			if (units[i].page === 'blacksmith' && units[i].type === 'Armor') {
				list.push(i);
			}
		},
		fn_helmet = function(list, i, units) {
			if (units[i].page === 'blacksmith' && units[i].type === 'Helmet') {
				list.push(i);
			}
		},
		fn_amulet = function(list, i, units) {
			if (units[i].page === 'blacksmith' && units[i].type === 'Amulet') {
				list.push(i);
			}
		},
		fn_gloves = function(list, i, units) {
			if (units[i].page === 'blacksmith' && units[i].type === 'Gloves') {
				list.push(i);
			}
		},
		fn_boots = function(list, i, units) {
			if (units[i].page === 'blacksmith' && units[i].type === 'Boots') {
				list.push(i);
			}
		};

	// invade
	tag = 'invade';

	// prepare a short list of items being used
	tmp = {};
	for (i in this.data) {
		if (this.get(['data',i,'use',tag+'_att'])) {
			tmp[i] = this.data[i];
		}
	}

	lset.push('<div><h3><a>'+tag.ucfirst()+' - Attack</a></h3><div>');
	lset.push(this.makeDash(generals, fn_hero, 'att', tag, 'Heroes'));
	lset.push(this.makeDash(tmp, fn_soldier, 'att', tag, 'Soldiers'));
	lset.push(this.makeDash(tmp, fn_weapon, 'att', tag, 'Weapons'));
	lset.push(this.makeDash(tmp, fn_equipment, 'att', tag, 'Equipment'));
	lset.push(this.makeDash(tmp, fn_magic, 'att', tag, 'Magic'));
	lset.push('</div></div>');

	// prepare a short list of items being used
	tmp = {};
	for (i in this.data) {
		if (this.get(['data',i,'use',tag+'_def'])) {
			tmp[i] = this.data[i];
		}
	}

	rset.push('<div><h3><a>'+tag.ucfirst()+' - Defend</a></h3><div>');
	rset.push(this.makeDash(generals, fn_hero, 'def', tag, 'Heroes'));
	rset.push(this.makeDash(tmp, fn_soldier, 'def', tag, 'Soldiers'));
	rset.push(this.makeDash(tmp, fn_weapon, 'def', tag, 'Weapons'));
	rset.push(this.makeDash(tmp, fn_equipment, 'def', tag, 'Equipment'));
	rset.push(this.makeDash(tmp, fn_magic, 'def', tag, 'Magic'));
	rset.push('</div></div>');
	
	// duel
	tag = 'duel';

	// prepare a short list of items being used
	tmp = {};
	for (i in this.data) {
		if (this.get(['data',i,'use',tag+'_att'])) {
			tmp[i] = this.data[i];
		}
	}

	lset.push('<div><h3><a>'+tag.ucfirst()+' - Attack</a></h3><div>');
	if ((best = Generals.best(tag+'-attack')) !== 'any') {
		lset.push('<div style="height:25px;margin:1px;">');
		lset.push('<img src="' + imagepath + generals[best].img + '"');
		lset.push(' style="width:25px;height:25px;float:left;margin-right:4px;">');
		lset.push(' <b>General:</b> ' + this.format_unit_str(best));
		lset.push('</div>');
	}
	lset.push(this.makeDash(tmp, fn_blacksmith, 'att', tag, '*Boots'));
	lset.push(this.makeDash(tmp, fn_magic, 'att', tag, '*magic,magic'));
	lset.push('</div></div>');
	
	// prepare a short list of items being used
	tmp = {};
	for (i in this.data) {
		if (this.get(['data',i,'use',tag+'_def'])) {
			tmp[i] = this.data[i];
		}
	}

	rset.push('<div><h3><a>'+tag.ucfirst()+' - Defend</a></h3><div>');
	if ((best = Generals.best(tag+'-defend')) !== 'any') {
		rset.push('<div style="height:25px;margin:1px;">');
		rset.push('<img src="' + imagepath + generals[best].img + '"');
		rset.push(' style="width:25px;height:25px;float:left;margin-right:4px;">');
		rset.push(' <b>General:</b> ' + this.format_unit_str(best));
		rset.push('</div>');
	}
	rset.push(this.makeDash(tmp, fn_blacksmith, 'def', tag, '*Boots'));
	rset.push(this.makeDash(tmp, fn_magic, 'def', tag, '*magic,magic'));
	rset.push('</div></div>');

	// war
	tag = 'war';

	// prepare a short list of items being used
	tmp = {};
	for (i in this.data) {
		if (this.get(['data',i,'use',tag+'_att'])) {
			tmp[i] = this.data[i];
		}
	}

	lset.push('<div><h3><a>'+tag.ucfirst()+' - Attack</a></h3><div>');
	lset.push(this.makeDash(generals, fn_hero, 'att', tag, 'Heroes', 6));
	lset.push(this.makeDash(tmp, fn_weapon, 'att', tag, 'Weapons'));
	lset.push(this.makeDash(tmp, fn_shield, 'att', tag, 'Shield'));
	lset.push(this.makeDash(tmp, fn_armor, 'att', tag, 'Armor'));
	lset.push(this.makeDash(tmp, fn_helmet, 'att', tag, 'Helmet'));
	lset.push(this.makeDash(tmp, fn_amulet, 'att', tag, 'Amulet'));
	lset.push(this.makeDash(tmp, fn_gloves, 'att', tag, 'Gloves'));
	lset.push(this.makeDash(tmp, fn_boots, 'att', tag, 'Boots'));
	lset.push(this.makeDash(tmp, fn_magic, 'att', tag, 'Magic'));
	lset.push('</div></div>');

	// prepare a short list of items being used
	tmp = {};
	for (i in this.data) {
		if (this.get(['data',i,'use',tag+'_def'])) {
			tmp[i] = this.data[i];
		}
	}

	rset.push('<div><h3><a>'+tag.ucfirst()+' - Defend</a></h3><div>');
	rset.push(this.makeDash(generals, fn_hero, 'def', tag, 'Heroes', 6));
	rset.push(this.makeDash(tmp, fn_weapon, 'def', tag, 'Weapons'));
	rset.push(this.makeDash(tmp, fn_shield, 'def', tag, 'Shield'));
	rset.push(this.makeDash(tmp, fn_armor, 'def', tag, 'Armor'));
	rset.push(this.makeDash(tmp, fn_helmet, 'def', tag, 'Helmet'));
	rset.push(this.makeDash(tmp, fn_amulet, 'def', tag, 'Amulet'));
	rset.push(this.makeDash(tmp, fn_gloves, 'def', tag, 'Gloves'));
	rset.push(this.makeDash(tmp, fn_boots, 'def', tag, 'Boots'));
	rset.push(this.makeDash(tmp, fn_magic, 'def', tag, 'Magic'));
	rset.push('</div></div>');
	
	// monster
	tag = 'monster';

	// prepare a short list of items being used
	tmp = {};
	for (i in this.data) {
		if (this.get(['data',i,'use',tag+'_att'])) {
			tmp[i] = this.data[i];
		}
	}

	lset.push('<div><h3><a>'+tag.ucfirst()+' - Attack</a></h3><div>');
	if ((best = Generals.best(tag+'-attack')) !== 'any') {
		lset.push('<div style="height:25px;margin:1px;">');
		lset.push('<img src="' + imagepath + generals[best].img + '"');
		lset.push(' style="width:25px;height:25px;float:left;margin-right:4px;">');
		lset.push(' <b>General:</b> ' + this.format_unit_str(best));
		lset.push('</div>');
	}
	lset.push(this.makeDash(tmp, fn_blacksmith, 'att', tag, '*Boots'));
	lset.push(this.makeDash(tmp, fn_magic, 'att', tag, '*magic,magic'));
	lset.push('</div></div>');
	
	// prepare a short list of items being used
	tmp = {};
	for (i in this.data) {
		if (this.get(['data',i,'use',tag+'_def'])) {
			tmp[i] = this.data[i];
		}
	}

	rset.push('<div><h3><a>'+tag.ucfirst()+' - Defend</a></h3><div>');
	if ((best = Generals.best(tag+'-defend')) !== 'any') {
		rset.push('<div style="height:25px;margin:1px;">');
		rset.push('<img src="' + imagepath + generals[best].img + '"');
		rset.push(' style="width:25px;height:25px;float:left;margin-right:4px;">');
		rset.push(' <b>General:</b> ' + this.format_unit_str(best));
		rset.push('</div>');
	}
	rset.push(this.makeDash(tmp, fn_blacksmith, 'def', tag, '*Boots'));
	rset.push(this.makeDash(tmp, fn_magic, 'def', tag, '*magic,magic'));
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

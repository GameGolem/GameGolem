/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Workers, Worker, Config, Dashboard, Idle, Page, Resources,
	LevelUp, Player, Town,
	APP, APPID, PREFIX, userID, imagepath,
	isRelease, version, revision, Images, window, browser, console,
	LOG_ERROR, LOG_WARN, LOG_INFO, LOG_DEBUG, log,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	isArray, isFunction, isNumber, isObject, isString, isWorker,
	sum, tr, th, td, makeTime, nmax, assert
*/
/********** Worker.Generals **********
* Updates the list of Generals
* Finds best General for other classes
* *** Need to take into account army size and real stats for attack and defense
*/
var Generals = new Worker('Generals');
Generals.temp = null;

Generals.settings = {
	unsortable:true,
	taint:true
};

Generals.defaults['castle_age'] = {
	pages:'* heroes_generals heroes_heroes keep_stats'
};

Generals.option = {
	fast:true,
	zin:false
};

Generals.display = [
	{
		id:'fast',
		label:'Use fast general links',
		checkbox:true,
		help:'Fast general links will use a single URL to select a general.'
		  + " This avoids the extra Generals page overhead and is faster, but sometimes does't work."
		  + ' Disabling this will select generals in the same manner a person would, via the Generals page and clicking on an image.'
	},
	{
		id:'zin',
		label:'Automatically use Zin',
		checkbox:true
	}
];

Generals.runtime = {
	multipliers: {}, // Attack multipliers list for Orc King and Barbarus type generals
	force: false,
	armymax:1, // Don't force someone with a small army to buy a whole load of extra items...
	last: {} // last visit timestamps
};

Generals.menu = function(worker, key) {
	if (worker === this) {
		if (!key) {
			return ['scan:Scan Generals at Idle'];
		} else if (key === 'scan') {
			Idle.set('temp.scan.generals', Date.now());
		}
	}
};

Generals.init = function(old_revision, fresh) {
	// BEGIN: remove old per-worker revision check
	this.set(['runtime','revision']);
	// END: 

	// Only need them the first time...
	if (!Player.get('attack') || !Player.get('defense')) {
		this._watch(Player, 'data.attack');
		this._watch(Player, 'data.defense');
	}

	this._watch(Player, 'data.army');
	this._watch(Player, 'data.armymax');
	this._watch(Town, 'runtime.invade');
	this._watch(Town, 'runtime.duel');
	this._watch(Town, 'runtime.war');
	this._watch(Town, 'data'); // item counts

	// last recalc revision is behind the current, fire a reminder
	if (old_revision < revision) {
		this._remindMs(1, 'revision');
	} else if (this.get('runtime.force')) {
		this._remindMs(1, 'force');
	}
};

Generals.page = function(page, change) {
	var now = Date.now(), i, j, k, s, seen = {}, el, el2, tmp, name, item, icon, info, stats, costs, level;

	if (($('div.results').text() || '').match(/has gained a level!/i)) {
		if ((name = Player.get('general'))) { // Our stats have changed but we don't care - they'll update as soon as we see the Generals page again...
			this.add(['data',name,'level'], 1);
			if (page !== (j = 'heroes_generals')) {
				Page.setStale(j, now);
			}
		}
	}

	if (page === 'heroes_generals') {
		tmp = $('.generalSmallContainer2');
		for (i=0; i<tmp.length; i++) {
			el = tmp[i];
			try {
				this._transaction(); // BEGIN TRANSACTION
				name = ($('.general_name_div3_padding', el).text() || '').trim(true).replace(/\s*\*+$/, '');
				assert(name && name.indexOf('\t') === -1 && name.length < 30, 'Bad general name - found tab character');
				seen[name] = true;
				assert(this.set(['data',name,'id'], parseInt($('input[name=item]', el).val(), 10), 'number') !== false, 'Bad general id: '+name);
				assert(this.set(['data',name,'type'], parseInt($('input[name=itype]', el).val(), 10), 'number') !== false, 'Bad general type: '+name);
				assert(this.set(['data',name,'img'], $('.imgButton', el).attr('src').filepart(), 'string'), 'Bad general image: '+name);
				assert(this.set(['data',name,'att'], $('.generals_indv_stats_padding div:eq(0)', el).text().regex(/(\d+)/), 'number') !== false, 'Bad general attack: '+name);
				assert(this.set(['data',name,'def'], $('.generals_indv_stats_padding div:eq(1)', el).text().regex(/(\d+)/), 'number') !== false, 'Bad general defense: '+name);
				if (isNumber(level = parseInt($(el).text().regex(/Level (\d+)/im), 10))) {
				    this.set(['data',name,'level'], level);
				}
				if ((k = $('.generals_indv_stats ~ div div[style*="background-color"]', el)).length) {
					if (isNumber(j = (k.attr('style') || '').regex(/width:\s*([-+]?\d*\.?\d+)%/im))) {
						// over cap progression fix, for when stuck at X/0%
						// negative width and level at least 4+
						if (level >= 4 && j < 0) {
							j = 100;
						}
						this.set(['data',name,'progress'], j);
						// If we just maxed level, remove the priority
						if (j >= 100) {
							this.set(['data',name,'priority']);
						}
					}
				}
				this.set(['data',name,'skillsbase'], s = $(el).children(':last').html().replace(/<[^>]*>|\s+/gm,' ').trim(true));
				j = parseInt($('.generals_indv_stats', el).next().next().text().regex(/(\d*\.*\d+)% Charged!/im), 10);
				if (j) {
					k = this.get(['data',name,'skills']) || s || '';
					this.set(['data',name,'charge'], now + Math.floor(3600000 * ((1-j/100) * (k.regex(/(\d*) Hours? Cooldown/im) || 0))));
					//log(LOG_WARN, name + ' ' + makeTime(this.data[name].charge, 'g:i a'));
				}
				this.set(['data',name,'own'], 1);
				this._transaction(true); // COMMIT TRANSACTION
			} catch(e) {
				this._transaction(false); // ROLLBACK TRANSACTION on any error
				log(e, e.name + ' in ' + this.name + '.page(' + change + '): ' + e.message);
			}
		}

		// parse general equipment, including those not yet owned
		name = $('#general_name_div_int').first().text().trim(true).regex(/^(.*\w)\** LEVEL \d+$/i);
		if (this.get(['data',name])) {
			tmp = $('div[style*="model_items."] img[title]');
			for (i=0; i<tmp.length; i++) {
				el = tmp[i];
				item = $(el).attr('title');
				icon = ($(el).attr('src') || '').filepart();
				if (isString(item)) {
					item = item.replace('[not owned]', ' ').replace(/<[^>]*>|\s+/gim, ' ').trim(true);
					if ((j = item.match(/^\s*([^:]*[^:\s])\s*:\s*(.*\S)\s*$/i))) {
						if ((item = Town.qualify(j[1], icon))) {
							Resources.set(['_'+item,'generals'], Math.max(1, Resources.get(['_'+item,'generals'], 0, 'number')));
							this.set(['data',name,'equip',item], j[2]);
						}
					}
				}
			}
			i = $('#main_bn div[style*="general_plate."] a[href*="generals.php"] img[title]').first().attr('title').trim(true);
			if (i) {
				this.set(['data',name,'skills'], i);
				if (isNumber(j = i.regex(/\bmax\.? (\d+)\b/i))) {
					this.set(['data',name,'cap'], j);
				}
			}
			this.set(['runtime','last',name], now);
		}

		// purge owned generals we didn't see
		for (i in this.data) {
			if (!seen[i] && this.data[i]['own']) {
				this.set(['data',i]);
			}
		}
	} else if (page === 'heroes_heroes') {
		// parse upkeep
		if ((tmp = $('.mContTMainBack div:contains("Total Upkeep")')).length) {
			j = ($('b.negative', tmp).text() || '').replace(/,/gm, '');
			if (isNumber(i = j.regex(/^\s*-?\$(\d+)\s*$/m))) {
				Player.set('upkeep', i);
			}
		}

		// parse purchasable heroes
		tmp = $('.hero_buy_row');
		for (j = 0; j < tmp.length; j++) {
			el = tmp[j];
			el2 = $('.hero_buy_image img', el);
			name = ($(el2).attr('title') || '').trim(true).replace(/\*+$/, '');
			if (name) {
				seen[name] = true;
				try {
					this._transaction(); // BEGIN TRANSACTION
					icon = ($(el2).attr('src') || '').filepart();
					info = $('.hero_buy_info', el);
					stats = $('.hero_select_stats', el);
					costs = $('.hero_buy_costs', el);
					i = $('form', costs).attr('id') || '';
					if (isNumber(i = i.regex(/^app\d+_item(?:buy|sell)_(\d+)$/i))) {
						this.set(['data',name,'id'], i);
					}

					if (icon) {
						this.set(['data',name,'img'], icon);
					}

					// only use these atk/def values if we don't know this general
					if (!this.get(['data',name])) {
						i = $('div:contains("Attack")', stats).text() || '';
						if (isNumber(i = i.regex(/\b(\d+)\s*Attack\b/im))) {
							this.set(['data',name,'att'], i);
						}

						i = $('div:contains("Defense")', stats).text() || '';
						if (isNumber(i = i.regex(/\b(\d+)\s*Defense\b/im))) {
							this.set(['data',name,'def'], i);
						}
					}

					i = $(costs).text() || '';
					if ((i = i.regex(/\bRecruited:\s*(\w+)\b/im))) {
						this.set(['data',name,'own'], i.toLowerCase() === 'yes' ? 1 : 0);
					}

					i = $('.gold', costs).text() || '';
					if (isNumber(i = i.replace(/,/gm, '').regex(/\$(\d+)\b/im))) {
						this.set(['data',name,'cost'], i);
					}

					i = $('div:contains("Upkeep") .negative', info).text() || '';
					if (isNumber(i = i.replace(/,/gm, '').regex(/\$(\d+)\b/im))) {
						this.set(['data',name,'upkeep'], i);
					}
					this._transaction(true); // COMMIT TRANSACTION
				} catch (e2) {
					this._transaction(false); // ROLLBACK TRANSACTION on any error
					log(e2, e2.name + ' in ' + this.name + '.page(' + page + ', ' + change + '): ' + e2.message);
				}
			}
		}

		// purge unowned generals we didn't see
		for (i in this.data) {
			if (!seen[i] && !this.data[i]['own']) {
				this.set(['data',i]);
			}
		}
	} else if (page === 'keep_stats') {
		// Only when it's our own keep and not someone elses
		if ($('.keep_attribute_section').length) {
			tmp = $('.statUnit', $('.statsT2 .statsTTitle:regex(^\\s*HEROES\\s*$)').parent());
			for (i=0; i<tmp.length; i++) {
				el = $('a img[src]', tmp[i]);
				name = ($(el).attr('title') || $(el).attr('alt') || '').trim(true).replace(/\*+$/, '');

				// new general(s), trigger page visits
				if (name && !this.get(['data',name])) {
					Page.setStale('heroes_heroes', now);
					Page.setStale('heroes_generals', now);
					break;
				}
			}
		}
	}
	return false;
};

Generals.resource = function() {
	Generals.runtime.zin = false;
	if (Generals.option.zin && Generals.get(['data','Zin','charge'],1e99) < Date.now()) {
		Generals.runtime.zin = 'Zin';
		LevelUp.runtime.force.stamina = true;
		return 'stamina';
	}
	return false;
};

Generals.update = function(event, events) {
	var data = this.data, i, j, k, o, p, s, x, y, evt,
		pa, priority_list, list,
		pattack, pdefense, maxstamina, maxenergy, stamina, energy,
		health, maxhealth, num, cap, item, str,
		army, armymax, gen_att, gen_def, war_att, war_def,
		invade = Town.get('runtime.invade'),
		duel = Town.get('runtime.duel'),
		war = Town.get('runtime.war'),
		attack, attack_bonus, att_when_att = 0, current_att,
		defend, defense_bonus, def_when_att = 0, current_def,
		monster_att = 0,
		listpush = function(list,i){list.push(i);},
		skillcombo, equipcombo, all_stats, stats,
		calcStats = false, bests;

	//log(LOG_DEBUG, '# events: ' + JSON.shallow(events,2));

	if ((evt = events.findEvent(this, 'init'))
	  || (evt = events.findEvent(this, 'data'))
	) {
		bests = true;

		list = [];
		priority_list = [];
		k = 0;
		for (i in data) {
			list.push(i);
			p = data[i];
			if ((isNumber(j = p['progress']) ? j : 100) < 100) { // Take all existing priorities and change them to rank starting from 1 and keeping existing order.
				priority_list.push([i, p['priority']]);
			}
			if (!p['stats']) { // Force an update if stats not yet calculated
				this.set(['runtime','force'], true);
			}
			k += p['own'] || 0;
			s = p['skills'] || p['skillsbase'] || '';
			if (s) {
				num = 0;
				cap = p['cap'] || 0;
				str = null;
				if ((x = s.regex(/\bevery (\d+) ([\w\s']*\w)/im))) {
					num = x[0];
					str = x[1];
				} else if ((x = s.regex(/\bevery ([\w\s']*\w)/im))) {
					num = 1;
					str = x;
				}
				if ((x = s.regex(/\bmax\.? (\d+)/i))) {
					cap = Math.max(cap, x);
				}
				if (cap) {
					if ((j = s.regex(/\b(\d+\.\d+)\b/))) {
						cap /= j;
					}
				}
				if (str) {
					for (x = str.split(' '); x.length > 0; x.pop()) {
						str = x.join(' ');
						if ((y = str.regex(/^(.+)ies$/i))) {
							if (Town.get(['data', y+'y'])) {
								item = y+'y';
								break;
							}
						} else if ((y = str.regex(/^(.+)s$/i))) {
							if (Town.get(['data', y])) {
								item = y;
								break;
							}
						}
						if (Town.get(['data', str])) {
							item = str;
							break;
						}
					}
				}
				if (num && item) {
					Resources.set(['data','_'+item,'generals'], Math.ceil(num * cap));
//					log(LOG_WARN, 'Save ' + (num * cap) + ' x ' + item + ' for General ' + i);
				}
			}
		}

		// need this count since we now store unpurchased heroes also
		this.set('runtime.heroes', k);

		if ((i = priority_list.length)) {
			priority_list.sort(function(a,b) {
				return (a[1] - b[1]);
			});
			this.set(['runtime','max_priority'], i);
			while (i--) {
				this.set(['data',priority_list[i][0],'priority'], parseInt(i, 10)+1);
			}
		}

		// "any" MUST remain lower case - all real generals are capitalised so this provides the first and most obvious difference
		list = ['any','under max level'].concat(list.sort());
		Config.set('generals', list); 
	}
	
	// busy stuff, so watch how often it runs
	// revision increases force a run via an event

	if ((invade && duel && war
	&& (this.runtime.force
		|| events.findEvent(null, 'data')
		|| events.findEvent(Town)
		|| events.findEvent(Player)))
	|| events.findEvent(this, 'reminder', 'revision')) {
		bests = true;
		this.set(['runtime','force'], false);

		pattack = Player.get('attack', 1, 'number');
		pdefense = Player.get('defense', 1, 'number');
		maxstamina = Player.get('maxstamina', 1, 'number');
		maxenergy = Player.get('maxenergy', 1, 'number');
		maxhealth = Player.get('maxhealth', 100, 'number');
		stamina = Player.get('stamina', 1, 'number');
		energy = Player.get('energy', 1, 'number');
		health = Player.get('health', 0, 'number');
		armymax = Player.get('armymax', 1, 'number');

		if (events.findEvent(Player) && pattack > 1 && pdefense > 1) {
			// Only need them the first time...
			this._unwatch(Player, 'data.attack');
			this._unwatch(Player, 'data.defense');
		}

		for (i in data) {
			p = data[i];

			// remove obsolete data
			this.set(['data',i,'invade']);
			this.set(['data',i,'duel']);
			this.set(['data',i,'war']);
			this.set(['data',i,'monster']);
			this.set(['data',i,'potential']);

			// update the equipment bonus list
			s = '';
			if ((o = p['equip'])) {
				for (j in o) {
					if (Town.get(['data',j,'own'], 0, 'number') > 0) {
						if (s !== '') { s += '; '; }
						s += j + ': ' + o[j];
					} else if (Generals.get(['data',j,'own'])) {
						if (s !== '') { s += '; '; }
						s += j + ': ' + o[j];
					}
				}
			}
			if (s) {
				this.set(['data',i,'weaponbonus'], s);
				equipcombo = ';' + s + ';';
			} else {
				this.set(['data',i,'weaponbonus']);
				equipcombo = '';
			}
			equipcombo = equipcombo.replace(/\s*;\s*\.|\s*\.\s*;/g, ';');

			skillcombo = ';' + (p['skills'] || p['skillsbase'] || '') + ';' + s + ';';
			skillcombo = skillcombo.replace(/\s+and\s+|\.\s+/ig, ', ');
			skillcombo = skillcombo.replace(/\s*;\s*\.|\s*\.\s*;/g, ';');
			skillcombo = skillcombo.replace(/\byou\b/gi, 'you');
			skillcombo = skillcombo.replace(/\byour\b/gi, 'your');
			skillcombo = skillcombo.replace(/\bopposing\b/gi, 'opposing');
			skillcombo = skillcombo.replace(/\bwhile equip/gi, 'when equip');

			// .att
			// .def
			// .own
			// .cost
			// .upkeep
			// .stats
			//   .att (effective attack if different from att)
			//   .def (effective defense if different from def)
			//   .att_when_att
			//   .def_when_att
			//   .invade
			//     .att
			//     .def
			//     .raid
			//   .duel
			//     .att
			//     .def
			//     .raid
			//   .war
			//     .att
			//     .def
			//   .monster
			//     .att
			//     .def
			//   .cost
			//   .cash

			stats = {};

			all_stats = sum(skillcombo.regex(/\bAll Stats by ([-+]?\d*\.?\d+)\b/gi)) || 0;

			// special handling for count based stat bonuses
			// assumes only one of these will apply to a given general
			k = {};
			if ((o = skillcombo.regex(/([-+]?\d*\.?\d+)(?:\s+Player)? (Attack|Defense) for Every (\d+) ([^;(]*\w)/i))) {
				// handle a plural requirement name
				if ((j = o[3].regex(/^(.+)s$/i))) {
					j = Town.get(['data',j,'own'], 0, 'number')
					  || Town.get(['data',o[3],'own'], 0, 'number');
				} else {
					j = Town.get(['data',o[3],'own'], 0, 'number');
				}
				k['p'+o[1].toLowerCase()] = Math.floor(o[0] * Math.floor(j / (o[2] || 1)));
				/*
				log(LOG_DEBUG, '# ' + i
				  + ' +k:' + JSON.shallow(k,2)
				  + ' from o:' + JSON.shallow(o,2)
				);
				*/
			} else if ((o = skillcombo.regex(/([-+]?\d*\.?\d+)(?:\s+Player)? (Attack|Defense) for Every ([^;(]*\w)/i))) {
				if ((j = o[2].regex(/^(.+)s$/i))) {
					j = Town.get(['data',j,'own'], 0, 'number')
					  || Town.get(['data',o[2],'own'], 0, 'number');
				} else {
					j = Town.get(['data',o[2],'own'], 0, 'number');
				}
				k['p'+o[1].toLowerCase()] = Math.floor(o[0] * j);
				/*
				log(LOG_DEBUG, '# ' + i
				  + ' +k:' + JSON.shallow(k,2)
				  + ' from o:' + JSON.shallow(o,2)
				);
				*/
			} else if ((o = skillcombo.regex(/\bEvery (\d+) ([^;(]*?\w)(?:\s*Increase|\s*Decrease)?(?:\s+Player)? (Attack|Defense) by ([-+]?\d*\.?\d+)/i))) {
				// handle a plural requirement name
				if ((j = o[1].regex(/^(.+)s$/i))) {
					j = Town.get(['data',j,'own'], 0, 'number')
					  || Town.get(['data',o[1],'own'], 0, 'number');
				} else {
					j = Town.get(['data',o[1],'own'], 0, 'number');
				}
				k['p'+o[2].toLowerCase()] = Math.floor(o[3] * Math.floor(j / (o[0] || 1)));
				/*
				log(LOG_DEBUG, '# ' + i
				  + ' +k:' + JSON.shallow(k,2)
				  + ' from o:' + JSON.shallow(o,2)
				);
				*/
			} else if ((o = skillcombo.regex(/\bEvery ([^;(]*?\w)(?:\s*Increase|\s*Decrease)?(?:\s+Player)? (Attack|Defense) by ([-+]?\d*\.?\d+)/i))) {
				// handle a plural requirement name
				if ((j = o[0].regex(/^(.+)s$/i))) {
					j = Town.get(['data',j,'own'], 0, 'number')
					  || Town.get(['data',o[0],'own'], 0, 'number');
				} else {
					j = Town.get(['data',o[0],'own'], 0, 'number');
				}
				k['p'+o[1].toLowerCase()] = Math.floor(o[2] * j);
				/*
				log(LOG_DEBUG, '# ' + i
				  + ' +k:' + JSON.shallow(k,2)
				  + ' from o:' + JSON.shallow(o,2)
				);
				*/
			} else if ((o = skillcombo.regex(/\b(\d*\.?\d+) (Attack|Defense) if you own ([^;(]*\w)\b/i))) {
				if (this.get(['data',o[2],'own'])) {
					k['p'+p[1].toLowerCase()] = o[0];
				} else {
					log(LOG_DEBUG, '# checked for '+o[0]+' '+o[1]+' bonus'
					  + ', but '+o[2]+' not owned'
					);
				}
			}

			j = Math.floor(0.001
			  + sum(skillcombo.regex(/([-+]?\d*\.?\d+) Player Attack\b/gi))
			  + sum(skillcombo.regex(/\bAttack by ([-+]\d*\.?\d+)\s*[,;]/gi))
			  + sum(skillcombo.regex(/[,;]\s*Increases? Player Attack by (\d*\.?\d+)\s*[,;]/gi))
			  - sum(skillcombo.regex(/[,;]\s*Decreases? Player Attack by (\d*\.?\d+)\s*[,;]/gi))
			  + sum(skillcombo.regex(/\bPlayer Attack by ([-+]\d*\.?\d+)\s*[,;]/gi))
			  - sum(skillcombo.regex(/\bConvert (\d*\.?\d+) Attack to\b/gi))
			  + sum(skillcombo.regex(/\bConvert (\d*\.?\d+) \w+ to Attack\b/gi))
			  - (sum(skillcombo.regex(/\bTransfer (\d*\.?\d+)% Attack to\b/gi)) * pattack / 100).round(0)
			  + (sum(skillcombo.regex(/\bTransfer (\d*\.?\d+)% Defense to Attack\b/gi)) * pdefense / 100).round(0)
			  + sum(skillcombo.regex(/([-+]?\d*\.?\d+) Player Attack for every Hero Owned\b/gi)) * ((this.runtime.heroes || 0) - 1)
			  + sum(skillcombo.regex(/\bPlayer Attack is increased by ([-+]?\d*\.?\d+) for every Hero player owns\b/gi)) * ((this.runtime.heroes || 0) - 1)
			  + (sum(skillcombo.regex(/\bPlayer Defense by ([-+]?\d*\.?\d+) for every 4 Health\b/gi)) * maxhealth / 4)
			  + all_stats + (k.pattack || 0));
			if (j) { stats['patt'] = j; }

			j = Math.floor(0.001
			  + sum(skillcombo.regex(/([-+]?\d*\.?\d+) Player Defense/gi))
			  + sum(skillcombo.regex(/\bDefense by ([-+]\d*\.?\d+)\s*[,;]/gi))
			  + sum(skillcombo.regex(/[,;]\s*Increases? Player Defense by (\d*\.?\d+)\s*[,;]/gi))
			  - sum(skillcombo.regex(/[,;]\s*Decreases? Player Defense by (\d*\.?\d+)\s*[,;]/gi))
			  + sum(skillcombo.regex(/\bPlayer Defense by ([-+]\d*\.?\d+)\s*[,;]/gi))
			  - sum(skillcombo.regex(/\bConvert (\d*\.?\d+) Defense to\b/gi))
			  + sum(skillcombo.regex(/\bConvert (\d*\.?\d+) \w+ to Defense\b/gi))
			  - (sum(skillcombo.regex(/\bTransfer (\d*\.?\d+)% Defense to\b/gi)) * pdefense / 100).round(0)
			  + (sum(skillcombo.regex(/\bTransfer (\d*\.?\d+)% Attack to Defense\b/gi)) * pattack / 100).round(0)
			  + sum(skillcombo.regex(/([-+]?\d*\.?\d+) Player Defense for every Hero Owned\b/gi)) * ((this.runtime.heroes || 0) - 1)
			  + sum(skillcombo.regex(/\bPlayer Defense is increased by ([-+]?\d*\.?\d+) for every Hero player owns\b/gi)) * ((this.runtime.heroes || 0) - 1)
			  + (sum(skillcombo.regex(/\bPlayer Defense by ([-+]?\d*\.?\d+) for every 3 Health\b/gi)) * maxhealth / 3)
			  + all_stats + (k.pdefense || 0));
			if (j) { stats['pdef'] = j; }

			// gear bonus while equipped
			j = Math.floor(0.001
			  + sum(equipcombo.regex(/(-?\d*\.?\d+) Attack\b[^;]*\bwhen\b[^;]*\bequip/gi))
			  + sum(equipcombo.regex(/\bwhen\b[^;]*\bequip[^;]* (-?\d*\.?\d+) Attack\b/gi)));
			if (j) { stats['att2'] = j; }
			j = Math.floor(0.001
			  + sum(equipcombo.regex(/(-?\d*\.?\d+) Defense\b[^;]*\bwhen\b[^;]*\bequip/gi))
			  + sum(equipcombo.regex(/\bwhen\b[^;]*\bequip[^;]* (-?\d*\.?\d+) Defense\b/gi)));
			if (j) { stats['def2'] = j; }

			// gear bonuses when not equipped
			j = Math.floor(0.001 - (stats['att2'] || 0)
			  + sum(equipcombo.regex(/(-?\d*\.?\d+) Attack\b/gi)));
			if (j) { stats['att'] = j; }
			j = Math.floor(0.001 - (stats['def2'] || 0)
			  + sum(equipcombo.regex(/(-?\d*\.?\d+) Defense\b/gi)));
			if (j) { stats['def'] = j; }

			j = (((stats['att'] || 0) + (p['att'] || 0))
			  + ((stats['def'] || 0) + (p['def'] || 0)) * 0.7).round(1);
			this.set(['data',i,'tot_att'], j ? j : undefined);

			j = (((stats['att'] || 0) + (p['att'] || 0)) * 0.7
			  + ((stats['def'] || 0) + (p['def'] || 0))).round(1);
			this.set(['data',i,'tot_def'], j ? j : undefined);

			j = sum(skillcombo.regex(/([-+]?\d+) Monster attack\b/gi))
			  + sum(skillcombo.regex(/\bPlayer Attack by ([-+]?\d+) against Monsters?\b/gi));
			if (j) { stats['matt'] = j; }

			j = Math.floor(0.001
			  + sum(skillcombo.regex(/\bPlayer Attack when Defending by ([-+]?\d*\.?\d+)\b/gi))
			  + sum(skillcombo.regex(/([-+]?\d*\.?\d+) Attack when attacked\b/gi))
			  + sum(skillcombo.regex(/\bPlayer Attack is increased an additional (\d*\.?\d+) when attacked\b/gi)));
			if (j) { stats['patt_when_att'] = j; }

			j = Math.floor(0.001
			  + sum(skillcombo.regex(/\bPlayer Defense when Defending by ([-+]?\d*\.?\d+)\b/gi))
			  + sum(skillcombo.regex(/([-+]?\d*\.?\d+) Defense when attacked\b/gi))
			  + sum(skillcombo.regex(/\bPlayer Defense is increased an additional (\d*\.?\d+) when attacked\b/gi)));
			if (j) { stats['pdef_when_att'] = j; }

			j = Math.floor(0.001
			  + sum(skillcombo.regex(/([-+]?\d*\.?\d+) Attack to your War Council when\b/gi)) * 17
			  + sum(skillcombo.regex(/([-+]?\d*\.?\d+) Attack to your War Council for the next \d+ attacks?\b/gi)) * 17
			  - sum(skillcombo.regex(/([-+]?\d*\.?\d+) Defense to Opposing War Council when\b/gi)) * 17
			  - sum(skillcombo.regex(/\bWar Attacks ([-+]?\d*\.?\d+) Attack to your opponents War Council\b/gi)) * 17);
			if (j) { stats['watt'] = j; }

			j = Math.floor(0.001
			  + sum(skillcombo.regex(/([-+]?\d*\.?\d+) Defense to your War Council when\b/gi)) * 17
			  + sum(skillcombo.regex(/([-+]?\d*\.?\d+) Defense to your War Council for the next \d+ attacks?\b/gi)) * 17);
			if (j) { stats['wdef'] = j; }

			army = Math.min(armymax + nmax(0, skillcombo.regex(/\b(\d+) Army members?/gi)), nmax(0, skillcombo.regex(/\bArmy Limit to (\d+)\b/gi)) || 501);

			gen_att = Town.getAttDef(data, listpush, 'att', 1 + Math.floor((army - 1) / 5));
			gen_def = Town.getAttDef(data, listpush, 'def', 1 + Math.floor((army - 1) / 5));

			war_att = Town.getAttDef(data, listpush, 'att', 6);
			war_def = Town.getAttDef(data, listpush, 'def', 6);

			j = sum(skillcombo.regex(/([-+]?\d*\.?\d+)% Crit/gi))
			  + sum(skillcombo.regex(/\bcritical\b[^;,]* (\d*\.?\d+)%/gi));
			if (j) { stats['crits'] = j; }

			// invade calcs

			j = Math.floor(0.001
			  + (invade.attack || 0) + gen_att
			  + ((p['att'] || 0) + (stats['att'] || 0) + (stats['att2'] || 0)
			  + (pattack + (stats['patt'] || 0)) * army)
			  + ((p['def'] || 0) + (stats['def'] || 0) + (stats['def2'] || 0)
			  + (pdefense + (stats['pdef'] || 0)) * army) * 0.7);
			stats['invade'] = {};
			stats['invade']['att'] = j;

			j = Math.floor(0.001
			  + (invade.defend || 0) + gen_def
			  + ((p['att'] || 0) + (stats['att'] || 0) + (stats['att2'] || 0)
			  + (pattack + (stats['patt'] || 0) + (stats['patt_when_att'] || 0)) * army) * 0.7
			  + ((p['def'] || 0) + (stats['def'] || 0) + (stats['def2'] || 0)
			  + (pdefense + (stats['pdef'] || 0) + (stats['pdef_when_att'] || 0)) * army));
			stats['invade']['def'] = j;

			// duel calcs

			j = Math.floor(0.001
			  + (duel.attack || 0)
			  + ((p['att'] || 0) + (stats['att'] || 0) + (stats['att2'] || 0)
			  + pattack + (stats['patt'] || 0))
			  + ((p['def'] || 0) + (stats['def'] || 0) + (stats['def2'] || 0)
			  + pdefense + (stats['pdef'] || 0)) * 0.7);
			stats['duel'] = {};
			stats['duel']['att'] = j;

			j = Math.floor(0.001
			  + (duel.defend || 0)
			  + ((p['att'] || 0) + (stats['att'] || 0) + (stats['att2'] || 0)
			  + pattack + (stats['patt'] || 0) + (stats['patt_when_att'] || 0)) * 0.7
			  + ((p['def'] || 0) + (stats['def'] || 0) + (stats['def2'] || 0)
			  + pdefense + (stats['pdef'] || 0) + (stats['pdef_when_att'] || 0)));
			stats['duel']['def'] = j;

			// war calcs

			// note: only counting patt/pdef at 5/17 power tops

			j = Math.floor(0.001
			  + (duel.attack || 0) + war_att
			  + (stats['watt'] || 0)
			  + (stats['wdef'] || 0) * 0.7
			  + ((pattack + (stats['patt'] || 0))
			  + (pdefense + (stats['pdef'] || 0)) * 0.7)
			  * 5 / 17);
			stats['war'] = {};
			stats['war']['att'] = j;

			j = Math.floor(0.001
			  + (duel.defend || 0) + war_def
			  + (stats['watt'] || 0) * 0.7
			  + (stats['wdef'] || 0)
			  + ((pattack + (stats['patt'] || 0) + (stats['patt_when_att'] || 0)) * 0.7
			  + (pdefense + (stats['pdef'] || 0) + (stats['pdef_when_att'] || 0)))
			  * 5 / 17);
			stats['war']['def'] = j;

			// monster calcs

			// not quite right, gear defense not counted on monster attack
			j = Math.floor(0.001
			  + ((duel.attack || 0)
			  + (stats['matt'] || 0)
			  + (p['att'] || 0) + (stats['att'] || 0) + (stats['att2'] || 0)
			  + pattack + (stats['patt'] || 0))
			  * (110 + (stats['crits'] || 0)) / 100);
			stats['monster'] = {};
			stats['monster']['att'] = j;

			// not quite right, gear attack not counted on monster defense
			j = Math.floor(0.001
			  + (duel.defend || 0)
			  + (stats['mdef'] || 0)
			  + (p['def'] || 0) + (stats['def'] || 0) + (stats['def2'] || 0)
			  + pdefense + (stats['pdef'] || 0));
			stats['monster']['def'] = j;

			j = nmax(0, skillcombo.regex(/Increase Power Attacks by (\d+)/gi),
			  skillcombo.regex(/Power Attacks now use (\d+) times the stamina/gi));
			if (j) { stats['multiplier'] = j; }
			this.set(['runtime','multipliers',i], j ? j : undefined);

			j = Math.floor(0.001
			  + sum(skillcombo.regex(/\bEnergy by ([-+]\d*\.?\d+)\b/gi))
			  + sum(skillcombo.regex(/\bIncreases? Energy by \+?(\d*\.?\d+)\b/gi))
			  + sum(skillcombo.regex(/\bIncreases? Max Energy by \+?(\d*\.?\d+)\b/gi))
			  - sum(skillcombo.regex(/\bDecreases? Energy by -?(\d*\.?\d+)\b/gi))
			  - sum(skillcombo.regex(/\bDecreases? Max Energy by -?(\d*\.?\d+)\b/gi))
			  - sum(skillcombo.regex(/\bConvert (\d*\.?\d+) Energy to\b/gi))
			  + sum(skillcombo.regex(/\bConvert (\d*\.?\d+) \w+ to Energy\b/gi))
			  + sum(skillcombo.regex(/(-?\d*\.?\d+) Energy when\b/gi))
			  + sum(skillcombo.regex(/([-+]?\d*\.?\d+) Max Energy\b/gi))
			  - (sum(skillcombo.regex(/\bTransfer (\d*\.?\d+)% Max Energy to\b/gi)) * Player.get('maxenergy') / 100).round(0)
			  + (sum(skillcombo.regex(/\bTransfer (\d*\.?\d+)% Max Stamina to Max Energy/gi)) * Player.get('maxstamina') / 100*2).round(0)
			  + all_stats);
			if (j) { stats['maxenergy'] = j; }

			j = Math.floor(0.001
			  + sum(skillcombo.regex(/\bMax Stamina by ([-+]\d*\.?\d+)/gi))
			  + sum(skillcombo.regex(/\bIncreases? Stamina by \+?(\d*\.?\d+)/gi))
			  + sum(skillcombo.regex(/\bIncreases? Max Stamina by \+?(\d*\.?\d+)/gi))
			  - sum(skillcombo.regex(/\bDecreases? Stamina by -?(\d*\.?\d+)/gi))
			  - sum(skillcombo.regex(/\bDecreases? Max Stamina by -?(\d*\.?\d+)/gi))
			  - sum(skillcombo.regex(/\bConvert (\d*\.?\d+) Stamina to\b/gi))
			  + sum(skillcombo.regex(/\bConvert (\d*\.?\d+) \w+ to Stamina\b/gi))
			  + sum(skillcombo.regex(/(-?\d*\.?\d+) Stamina when\b/gi))
			  + sum(skillcombo.regex(/([-+]?\d*\.?\d+) Max Stamina/gi))
			  - (sum(skillcombo.regex(/Transfer (\d*\.?\d+)% Max Stamina to\b/gi)) * maxstamina / 100).round(0)
			  + (sum(skillcombo.regex(/Transfer (\d*\.?\d+)% Max Energy to Max Stamina/gi)) * maxenergy / 200).round(0)
			  + all_stats);
			if (j) { stats['maxstamina'] = j; }

			j = Math.floor(0.001
			  + sum(skillcombo.regex(/\bMax Health by ([-+]\d*\.?\d+)\b/gi))
			  + sum(skillcombo.regex(/\bIncreases? Health by \+?(\d*\.?\d+)\b/gi))
			  + sum(skillcombo.regex(/\bIncreases? Max Health by \+?(\d*\.?\d+)\b/gi))
			  - sum(skillcombo.regex(/\bDecreases? Health by -?(\d*\.?\d+)\b/gi))
			  - sum(skillcombo.regex(/\bDecreases? Max Health by -?(\d*\.?\d+)\b/gi))
			  - sum(skillcombo.regex(/\bConvert (\d*\.?\d+) Health to\b/gi))
			  + sum(skillcombo.regex(/\bConvert (\d*\.?\d+) \w+ to Health\b/gi))
			  + sum(skillcombo.regex(/(-?\d*\.?\d+) Health when\b/gi))
			  + sum(skillcombo.regex(/\bPlayer Health by ([-+]?\d*\.?\d+)\b/gi))
			  + sum(skillcombo.regex(/([-+]?\d*\.?\d+) Max Health\b/gi))
			  + sum(skillcombo.regex(/([-+]?\d*\.?\d+) Player Health\b/gi))
			  + sum(skillcombo.regex(/([-+]?\d*\.?\d+) Health\b/gi))
			  + all_stats);
			if (j) { stats['maxhealth'] = j; }

			j = skillcombo.regex(/Bank Fee/gi) ? 100 : 0;
			if (j) { stats['bank'] = j; }

			j = nmax(0, skillcombo.regex(/\bBonus \$?(\d+) Gold\b/gi),
			  skillcombo.regex(/\badditional \$?(\d+) gold\b/gi));
			if (j) { stats['cash'] = j; }

			j = nmax(0, skillcombo.regex(/\bSoldier Cost by -?(\d*\.?\d+)%/gi),
			  skillcombo.regex(/\bsoldier costs are decreased by -?(\d*\.?\d+)% when you purchase soldiers\b/gi));
			if (j) { stats['cost'] = j; }

			j = skillcombo.regex(/Extra Demi Points/gi) ? 5 : 0;
			if (j) { stats['demi'] = j; }

			j = nmax(0, skillcombo.regex(/(\d*\.?\d+)% more income\b/gi),
			  skillcombo.regex(/\bIncome by \+?(\d*\.?\d+)\b/gi));
			if (j) { stats['income'] = j; }

			j = nmax(0, skillcombo.regex(/\bInfluence (\d*\.?\d+)% Faster\b/gi),
			  skillcombo.regex(/\bQuests? (\d*\.?\d+)% Faster\b/gi));
			if (j) { stats['influence'] = j; }

			j = nmax(0, skillcombo.regex(/\bChance ([-+]?\d*\.?\d+)% Drops/gi),
			  skillcombo.regex(/\bitems from quests by (\d*\.?\d+)%/gi));
			if (j) { stats['item'] = j; }

			j = nmax(0, skillcombo.regex(/\bDecreases? Damage Taken by (\d+)\b/gi),
			  skillcombo.regex(/\bdamage received is reduced by (\d+)\b/gi));
			if (j) { stats['mitigation'] = j; }

			// Guild skills

			j = nmax(0,
			  skillcombo.regex(/\bWhen attacked in guild battle[^;]*\b(\d+) damage done to you is deflected back on the attacker\b/gi),
			  skillcombo.regex(/\b(\d+) damage done to you is deflected back on the attacker[^;]*\bwhen attacked in guild battle\b/gi));
			if (j) { stats['guild_deflect_passive'] = j; }

			if (skillcombo.match(/\bDeals? Extra Damage In Battles?\b/i)) {
				if (i === 'Deianira') {
					j = (p['level'] || 1) * 5;
				} else {
					j = 5;
				}
			}
			j += sum(skillcombo.regex(/\bDeals? additional (\d+) Damage In Battles?\b/gi))
			  + sum(skillcombo.regex(/\bDeals? (\d+) Extra Damage In Battles?\b/gi))
			  + sum(skillcombo.regex(/\b(\d+) Damage in Battles?\b/gi));
			if (j) { stats['guild_damage'] = j; }

			// Sanna
			j = nmax(0,
			  skillcombo.regex(/\bHeal for additional (\d+) Health as a Cleric in a Guild Battle\b/i),
			  skillcombo.regex(/\bHeal for an additional (\d+) Health\s*;/i));
			if (j) { stats['guild_cleric_heal_gate'] = j; }

			// Zurran
			j = nmax(0,
			  skillcombo.regex(/\bDeal additional (\d+) damage as a Mage in a Guild Battle\b/i),
			  skillcombo.regex(/\bDeal additional (\d+) damage with Mage passive ability\b/i),
			  skillcombo.regex(/\bDeal an additional (\d+) Damage\s*[;,]/i));
			if (j) { stats['guild_mage_damage_gate'] = j; }

			// Elaida
			j = nmax(0, skillcombo.regex(/\bHeal for an additional (\d*\.?\d+) Health with Heal Ability\b/i));
			if (j) { stats['guild_cleric_heal'] = j; }

			// Shivak
			j = nmax(0, skillcombo.regex(/\bIncrease Fortitude Effect by ([-+]?\d*\.?\d+)% Health with Heal Ability\b/i));
			if (j) { stats['guild_cleric_fortitude'] = j; }

			// Anya
			j = nmax(0, skillcombo.regex(/\b(\d*\.?\d+)% chance to Polymorph opponent\b/gi));
			if (j) { stats['guild_mage_polymorph'] = j; }

			// Syren
			j = nmax(0, skillcombo.regex(/\bconfused target has additional (\d*\.?\d+)% chance to attack themselves\b/gi));
			if (j) { stats['guild_mage_confuse'] = j; }

			// Raziel the Silent
			j = nmax(0, skillcombo.regex(/\bIncrease Evade chance in Guild Battles and Monsters by (\d*\.?\d+)\b/gi));
			if (j) { stats['guild_rogue_evade'] = j; }

			// Aethyx
			j = nmax(0, skillcombo.regex(/\bIncreases Poison damage by ([-+]?\d*\.?\d+)\b/i));
			k = 5 + nmax(0, skillcombo.regex(/\bIncreases Poison\b[^;]*\bduration by ([-+]?\d*\.?\d+)\b/i));
			if (j * k) { stats['guild_rogue_poison'] = j * k; }

			// Ameron
			j = nmax(0, skillcombo.regex(/\bDeal an additional (\d*\.?\d+) to each surrounding enemy with Whirlwind\b/gi));
			if (j) { stats['guild_warrior_whirlwind'] = j; }

			// Meekah
			j = nmax(0, skillcombo.regex(/\bIncreases? Confidence Damage by ([-+]?\d*\.?\d+)\b/gi));
			if (j) { stats['guild_warrior_confidence'] = j; }

			// Tefaera
			j = nmax(0, skillcombo.regex(/\bIncreases? health restored with Revive\/Resurrection by (\d+)\b/gi));
			if (j) { stats['guild_cleric_resurrect'] = j; }

			this.set(['data',i,'stats'], stats);

			this.set(['runtime','armymax'], Math.max(army, this.runtime.armymax));
		}

		this.set('runtime.revision', revision);
	}

	if (bests || !this.runtime.best) {
		bests = {};
		list = {};

		for (i in this.data) {
			p = this.data[i];
			if ((stats = p['stats']) && p['own']) {
				for (j in stats) {
					if ((j === 'monster' || j === 'crits')
					  && (stats['multiplier'] || 0) > 1
					) {
						// make sure we don't count a pa multiplier in monster-based bests
						continue;
					} else if (isNumber(stats[j])) {
						if ((bests[j] || -1e99) < stats[j]) {
							bests[j] = stats[j];
							list[j] = i;
						}
					} else if (isObject(stats[j])) {
						for (k in stats[j]) {
							if (isNumber(stats[j][k])) {
								o = j + '-' + k;
								if ((bests[o] || -1e99) < stats[j][k]) {
									bests[o] = stats[j][k];
									list[o] = i;
								}
							}
						}
					}
				}
				if (isNumber(p[j = 'priority'])) {
					if ((bests[j] || 1e99) > p[j]) {
						bests[j] = p[j];
						list[j] = i;
					}
				}
			}
		}

		this.set(['runtime','best']);
		for (i in bests) {
			this.set(['runtime','best',i], list[i]);
		}
	}

	return true;
};

Generals.to = function(name) {
	var id, type, el;

	this._unflush();
	if (name) {
		name = this.best(name);
	}
	if (!name || Player.get('general') === name || name.toLowerCase() === 'any') {
		return true;
	}
	if (!this.data[name]) {
		log(LOG_WARN, 'General "'+name+'" requested but not found!');
		return true; // Not found, so fake it
	}
	if (!this.test(name)) {
		log(LOG_INFO, 'General rejected due to energy or stamina loss: ' + Player.get('general') + ' to ' + name);
		return true;
	}

	id = this.get(['data',name,'id']);
	type = this.get(['data',name,'type']);

	if (this.get('option.fast') && isNumber(id) && isNumber(type)) {
		log(LOG_DEBUG, 'General fast change: ' + Player.get('general') + ' to ' + name);
		Page.to('heroes_generals', {item:id, itype:type}, true);
	} else if (isNumber(id)) {
		if (!Page.to('heroes_generals')) {
			return false;
		} else if (!(el = $('.generalSmallContainer2 form input[name="item"][value="'+id+'"]')).length) {
			log(LOG_WARN, "Can't find select form for General: " + name);
			return null;
		} else if (!(el = $(el).closest('form')).length) {
			log(LOG_WARN, "Can't refind select form for General: " + name);
			return null;
		} else if (!(el = $('input.imgButton[type="image"]', el)).length) {
			log(LOG_WARN, "Can't find select button for General: " + name);
			return null;
		} else if (Page.click(el)) {
			log(LOG_DEBUG, 'General change: ' + Player.get('general') + ' to ' + name);
		} else {
			log(LOG_DEBUG, '# might be a page click cooldown');
		}
	} else {
		log(LOG_WARN, "Can't change to General: " + name);
		return null;
	}

	return false;
};

Generals.test = function(name) {
	Generals._unflush();
	var next = isObject(name) ? name : Generals.data[name];
	if (name === 'any') {
		return true;
	} else if (!name || !next) {
		return false;
	} else {
		return (Player.get('maxstamina') + ((next.stats && next.stats.stamina) || 0) >= Player.get('stamina') && Player.get('maxenergy') + ((next.stats && next.stats.energy) || 0) >= Player.get('energy'));
	}
};

Generals.best = function(type) {
	var best = 'any', i;

	if (type && isString(type)) {

		if (this.get(['data',type,'own'])) {
			best = type;
		}

		if ((!best || best === 'any') && (i = this.get(['runtime','best',type]))) {
			if (this.get(['data',i,'own'])) {
				best = i;
			}
		}

		if (!best || best === 'any') {
			switch (type.toLowerCase().replace('_', '-')) {
			case 'stamina':
				i = this.get(['runtime','best','maxstamina']);
				break;
			case 'energy':
				i = this.get(['runtime','best','maxenergy']);
				break;
			case 'health':
				i = this.get(['runtime','best','maxhealth']);
				break;
			case 'raid-duel':
			case 'duel':
			case 'duel-attack':
				i = this.get(['runtime','best','duel-att']);
				break;
			case 'defend':
			case 'duel-defend':
				i = this.get(['runtime','best','duel-def']);
				break;
			case 'raid-invade':
			case 'invade':
			case 'invade-attack':
				i = this.get(['runtime','best','invade-att']);
				break;
			case 'invade-defend':
				i = this.get(['runtime','best','invade-def']);
				break;
			case 'war':
			case 'war-attack':
				i = this.get(['runtime','best','war-att']);
				break;
			case 'war-defend':
				i = this.get(['runtime','best','war-def']);
				break;
			case 'monster':
			case 'monster-attack':
				i = this.get(['runtime','best','monster-att']);
				break;
			case 'dispell':
			case 'monster-defend':
				i = this.get(['runtime','best','monster-def']);
				break;
			case 'under max level':
				i = this.get(['runtime','best','priority']);
				break;
			default:
				i = null;
				break;
			}

			if (i && this.get(['data',i,'own'])) {
				best = i;
			}
		}
	}

	return best;
};

Generals.order = [];
Generals.dashboard = function(sort, rev) {
	var self = this, i, j, k, o, p, data, output = [], list = [], iatt = 0, idef = 0, datt = 0, ddef = 0, matt = 0, mdef = 0,
		sorttype = [
			'img',
			'name',
			'level',
			'priority',
			'stats.invade.att',
			'stats.invade.def',
			'stats.duel.att',
			'stats.duel.def',
			'stats.monster.att',
			'stats.monster.def'
		];

	if (typeof sort === 'undefined') {
		this.order = [];
		for (i in this.data) {
			this.order.push(i);
		}
	}
	if (typeof sort === 'undefined') {
		sort = this.runtime.sort || 1;
	}
	if (typeof rev === 'undefined'){
		rev = this.runtime.rev || false;
	}
	this.set('runtime.sort', sort);
	this.set('runtime.rev', rev);
	if (typeof sort !== 'undefined') {
		this.order.sort(function(a,b) {
			var aa, bb, type, x;
			if (sort === 1) {
				aa = a;
				bb = b;
			} else if (sort === 3) {
				aa = self.get(['data',a,'priority'], self.get(['data',a,'charge'], 1e9, 'number'), 'number');
				bb = self.get(['data',b,'priority'], self.get(['data',b,'charge'], 1e9, 'number'), 'number');
			} else if ((x = sorttype[sort])) {
				aa = self.get(['data',a].concat(x.split('.')), 0, 'number');
				bb = self.get(['data',b].concat(x.split('.')), 0, 'number');
			}
			if (typeof aa === 'string' || typeof bb === 'string') {
				return (rev ? (''+bb).localeCompare(aa) : (''+aa).localeCompare(bb));
			}
			return (rev ? aa - bb : bb - aa);
		});
	}

	for (i in this.data) {
		p = this.get(['data',i,'stats']) || {};
		iatt = Math.max(iatt, this.get([p,'invade','att'], 1, 'number'));
		idef = Math.max(idef, this.get([p,'invade','def'], 1, 'number'));
		datt = Math.max(datt, this.get([p,'duel','att'], 1, 'number'));
		ddef = Math.max(ddef, this.get([p,'duel','def'], 1, 'number'));
		matt = Math.max(matt, this.get([p,'monster','att'], 1, 'number'));
		mdef = Math.max(mdef, this.get([p,'monster','def'], 1, 'number'));
	}

	th(output, '');
	th(output, 'General');
	th(output, 'Level');
	th(output, 'Rank /<br>Timer');
	th(output, 'Invade<br>Attack');
	th(output, 'Invade<br>Defend');
	th(output, 'Duel<br>Attack');
	th(output, 'Duel<br>Defend');
	th(output, 'Monster<br>Attack');
	th(output, 'Fortify<br>Dispel');

	list.push('<table cellspacing="0" style="width:100%"><thead><tr>' + output.join('') + '</tr></thead><tbody>');

	for (o=0; o<this.order.length; o++) {
		i = this.order[o];
		p = this.get(['data',i]) || {};
		output = [];
		j = this.get([p, 'weaponbonus']);
		k = p['skills'] || p['skillsbase'] || 'none';
		td(output, Page.makeLink('heroes_generals', {item:p.id, itype:p.type}, '<img src="' + imagepath + p.img + '" style="width:25px;height:25px;" title="Skills: ' + k + (j ? '; Weapon Bonus: ' + j : '') + '">'));
		td(output, i);
		td(output, '<div'+(isNumber(p.progress) ? ' title="'+p.progress+'%"' : '')+'>'+p.level+'</div><div style="background-color: #9ba5b1; height: 2px; width=100%;"><div style="background-color: #1b3541; float: left; height: 2px; width: '+(p.progress || 0)+'%;"></div></div>');
		td(output, p.priority ? ((p.priority !== 1 ? '<a class="golem-moveup" name='+p.priority+'>&uarr;</a> ' : '&nbsp;&nbsp; ') + p.priority + (p.priority !== this.runtime.max_priority ? ' <a class="golem-movedown" name='+p.priority+'>&darr;</a>' : ' &nbsp;&nbsp;'))
				: !this.get([p,'charge'],0)
				? '&nbsp;&nbsp; '
				: (this.get([p,'charge'],0) <= Date.now()
				? 'Now'
				: makeTime(this.get([p,'charge'],0), 'g:i a')));
		td(output, (j = this.get([p,'stats','invade','att'],0,'number')).addCommas(), (iatt === j ? 'style="font-weight:bold;"' : ''));
		td(output, (j = this.get([p,'stats','invade','def'],0,'number')).addCommas(), (idef === j ? 'style="font-weight:bold;"' : ''));
		td(output, (j = this.get([p,'stats','duel','att'],0,'number')).addCommas(), (datt === j ? 'style="font-weight:bold;"' : ''));
		td(output, (j = this.get([p,'stats','duel','def'],0,'number')).addCommas(), (ddef === j ? 'style="font-weight:bold;"' : ''));
		td(output, (j = this.get([p,'stats','monster','att'],0,'number')).addCommas(), (matt === j ? 'style="font-weight:bold;"' : ''));
		td(output, (j = this.get([p,'stats','monster','def'],0,'number')).addCommas(), (mdef === j ? 'style="font-weight:bold;"' : ''));
		tr(list, output.join(''));
	}

	list.push('</tbody></table>');

	$('a.golem-moveup').live('click', function(event){
		var i, gdown, gup, x = parseInt($(this).attr('name'), 10);
		Generals._unflush();
		for(i in Generals.data){
			if (Generals.data[i].priority === x){
				gup = i;
			}
			if (Generals.data[i].priority === (x-1)){
				gdown = i;
			}
		}
		if (gdown && gup) {
			log('Priority: Swapping '+gup+' with '+gdown);
			Generals.set(['data',gdown,'priority'], Generals.data[gdown].priority + 1);
			Generals.set(['data',gup,'priority'], Generals.data[gup].priority - 1);
		}
//		Generals.dashboard(sort,rev);
		return false;
	});
	$('a.golem-movedown').live('click', function(event){
		var i, gdown, gup, x = parseInt($(this).attr('name'), 10);
		Generals._unflush();
		for(i in Generals.data){
			if (Generals.data[i].priority === x){
				gdown = i;
			}
			if (Generals.data[i].priority === (x+1)) {
				gup = i;
			}
		}
		if (gdown && gup) {
			log('Priority: Swapping '+gup+' with '+gdown);
			Generals.set(['data',gdown,'priority'], Generals.data[gdown].priority + 1);
			Generals.set(['data',gup,'priority'], Generals.data[gup].priority - 1);
		}
//		Generals.dashboard(sort,rev);
		return false;
	});
	$('#golem-dashboard-Generals').html(list.join(''));
	$('#golem-dashboard-Generals tbody tr td:nth-child(2)').css('text-align', 'left');
	if (typeof sort !== 'undefined') {
		$('#golem-dashboard-Generals thead th:eq('+sort+')').attr('name',(rev ? 'reverse' : 'sort')).append('&nbsp;' + (rev ? '&uarr;' : '&darr;'));
	}
};


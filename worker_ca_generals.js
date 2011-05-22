/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page, Queue, Resources,
	Battle, Generals:true, Idle, LevelUp, Player, Town,
	APP, APPID, warn, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser, console,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, Divisor, length, sum, findInObject, objectIndex, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
	bestObjValue,
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
	zin:false
};

Generals.display = [
	{
		id:'zin',
		label:'Automatically use Zin',
		checkbox:true
	}
];

Generals.runtime = {
	multipliers: {}, // Attack multipliers list for Orc King and Barbarus type generals
	force: false,
	armymax:1 // Don't force someone with a small army to buy a whole load of extra items...
};

Generals.init = function(old_revision) {
	if (!Player.get('attack') || !Player.get('defense')) { // Only need them the first time...
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
	if (this.get('runtime.revision', 0, 'number') < revision) {
		this._remind(1, 'revision');
	} else if (this.get('runtime.force')) {
		this._remind(1, 'force');
	}
};

Generals.parse = function(change) {
	var now = Date.now(), self = this, i, j, seen = {}, el, el2, tmp, name, item, icon;

	if (($('div.results').text() || '').match(/has gained a level!/i)) {
		if ((name = Player.get('general'))) { // Our stats have changed but we don't care - they'll update as soon as we see the Generals page again...
			this.add(['data',name,'level'], 1);
			if (Page.page !== (j = 'heroes_generals')) {
				Page.setStale(j, now);
			}
		}
	}

	if (Page.page === 'heroes_generals') {
		tmp = $('.generalSmallContainer2');
		for (i=0; i<tmp.length; i++) {
			el = tmp[i];
			try {
				this._transaction(); // BEGIN TRANSACTION
				name = $('.general_name_div3_padding', el).text().trim();
				assert(name && name.indexOf('\t') === -1 && name.length < 30, 'Bad general name - found tab character');
				seen[name] = true;
				assert(this.set(['data',name,'id'], parseInt($('input[name=item]', el).val()), 'number') !== false, 'Bad general id: '+name);
				assert(this.set(['data',name,'type'], parseInt($('input[name=itype]', el).val()), 'number') !== false, 'Bad general type: '+name);
				assert(this.set(['data',name,'img'], $('.imgButton', el).attr('src').filepart(), 'string'), 'Bad general image: '+name);
				assert(this.set(['data',name,'att'], $('.generals_indv_stats_padding div:eq(0)', el).text().regex(/(\d+)/), 'number') !== false, 'Bad general attack: '+name);
				assert(this.set(['data',name,'def'], $('.generals_indv_stats_padding div:eq(1)', el).text().regex(/(\d+)/), 'number') !== false, 'Bad general defense: '+name);
				this.set(['data',name,'progress'], j = parseInt($('div.generals_indv_stats', el).next().children().children().children().next().attr('style').regex(/width: (\d*\.*\d+)%/im), 10));
				// If we just maxed level, remove the priority
				if ((j || 0) >= 100) {
					this.set(['data',name,'priority']);
				}
				this.set(['data',name,'skills'], $(el).children(':last').html().replace(/\<[^>]*\>|\s+/gm,' ').trim());
				j = parseInt($('div.generals_indv_stats', el).next().next().text().regex(/(\d*\.*\d+)% Charged!/im), 10);
				if (j) {
					this.set(['data',name,'charge'], Date.now() + Math.floor(3600000 * ((1-j/100) * this.data[name].skills.regex(/(\d*) Hour Cooldown/im))));
					//log(LOG_WARN, name + ' ' + makeTime(this.data[name].charge, 'g:i a'));
				}
				this.set(['data',name,'level'], parseInt($(el).text().regex(/Level (\d+)/im), 10));
				this.set(['data',name,'own'], 1);
				this._transaction(true); // COMMIT TRANSACTION
			} catch(e) {
				this._transaction(false); // ROLLBACK TRANSACTION on any error
				log(LOG_ERROR, e.name + ' in ' + this.name + '.parse(' + change + '): ' + e.message);
			}
		}

		// parse general equipment, including those not yet owned
		name = $('div.general_name_div3').first().text().trim();
		if (this.get(['data',name])) {
			tmp = $('div[style*="model_items.jpg"] img[title]');
			for (i=0; i<tmp.length; i++) {
				el = tmp[i];
				item = $(el).attr('title');
				icon = ($(el).attr('src') || '').filepart();
				if (isString(item)) {
					item = item.replace('[not owned]', ' ').replace(/\<^>]*\>|\s+/gim, ' ').trim();
					if ((j = item.match(/^\s*([^:]*\w)\s*:\s*(.*\w)\s*$/i))) {
						item = Town.qualify(j[1], icon);
						Resources.set(['_'+item,'generals'], Math.max(1, Resources.get(['_'+item,'generals'], 0, 'number')));
						this.set(['data',name,'equip',item], j[2]);
					}
				}
			}
			i = ($('div.general_pic_div3 a img[title]').first().attr('title') || '').trim();
			if (i && (j = i.regex(/\bmax\.? (\d+)\b/im))) {
				this.set(['data', name, 'stats', 'cap'], j);
			}
			this.set(['data',name,'seen'], now);
		}

		// purge generals we didn't see
		for (i in this.data) {
			if (!seen[i]) {
				this.set(['data',i]);
			}
		}
	} else if (Page.page === 'heroes_heroes') {
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
			name = ($(el2).attr('title') || '').trim();
			if (name) {
				try {
					self._transaction(); // BEGIN TRANSACTION
					icon = ($(el2).attr('src') || '').filepart();
					info = $('.hero_buy_info', el);
					stats = $('.hero_select_stats', el);
					costs = $('.hero_buy_costs', el);
					i = $('form', costs).attr('id') || '';
					if (isNumber(i = i.regex(/^app\d+_item(?:buy|sell)_(\d+)$/i))) {
						self.set(['data',name,'id'], i);
					}

					if (icon) {
						self.set(['data',name,'img'], icon);
					}

					// only use these atk/def values if we don't know this general
					if (!self.data[name]) {
						i = $('div:contains("Attack")', stats).text() || '';
						if (isNumber(i = i.regex(/\b(\d+)\s*Attack\b/im))) {
							self.set(['data',name,'att'], i);
						}

						i = $('div:contains("Defense")', stats).text() || '';
						if (isNumber(i = i.regex(/\b(\d+)\s*Defense\b/im))) {
							self.set(['data',name,'def'], i);
						}
					}

					i = $(costs).text() || '';
					if ((i = i.regex(/\bRecruited:\s*(\w+)\b/im))) {
						self.set(['data',name,'own'], i.toLowerCase() === 'yes' ? 1 : 0);
					}

					i = $('.gold', costs).text() || '';
					if (isNumber(i = i.replace(/,/gm, '').regex(/\$(\d+)\b/im))) {
						self.set(['data',name,'cost'], i);
					}

					i = $('div:contains("Upkeep") .negative', info).text() || '';
					if (isNumber(i = i.replace(/,/gm, '').regex(/\$(\d+)\b/im))) {
						self.set(['data',name,'upkeep'], i);
					}
					self._transaction(true); // COMMIT TRANSACTION
				} catch (e2) {
					self._transaction(false); // ROLLBACK TRANSACTION on any error
					log(LOG_ERROR, e2.name + ' in ' + self.name + '.parse(' + change + '): ' + e2.message);
				}
			}
		}
	} else if (Page.page === 'keep_stats') {
		// Only when it's our own keep and not someone elses
		if ($('.keep_attribute_section').length) {
			tmp = $('.statsT2 .statsTTitle:contains("HEROES")').not(function(a) {
				return !$(this).text().regex(/^\s*HEROES\s*$/im);
			});
			tmp = $('.statUnit', $(tmp).parent());
			for (i=0; i<tmp.length; i++) {
				el = $('a img[src]', tmp[i]);
				name = ($(el).attr('title') || $(el).attr('alt') || '').trim();

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
	var data = this.data, i, j, k, o, p, pa, priority_list = [], list = [],
		pattack, pdefense, maxstamina, maxenergy, stamina, energy,
		army, armymax, gen_att, gen_def, war_att, war_def,
		invade = Town.get('runtime.invade'),
		duel = Town.get('runtime.duel'),
		war = Town.get('runtime.war'),
		attack, attack_bonus, att_when_att = 0, current_att,
		defend, defense_bonus, def_when_att = 0, current_def,
		monster_att = 0, monster_multiplier = 1,
		listpush = function(list,i){list.push(i);},
		skillcombo, calcStats = false, all_stats, bests;

	if (events.findEvent(this, 'init') || events.findEvent(this, 'data')) {
		bests = true;

		k = 0;
		for (i in data) {
			list.push(i);
			p = data[i];
			if ((isNumber(j = p.progress) ? j : 100) < 100) { // Take all existing priorities and change them to rank starting from 1 and keeping existing order.
				priority_list.push([i, p.priority]);
			}
			if (!p.stats) { // Force an update if stats not yet calculated
				this.set(['runtime','force'], true);
			}
			k += p.own || 0;
			if (p.skills) {
				var x, y, num = 0, cap = 0, item, str = null;
				if ((x = p.skills.regex(/\bevery (\d+) ([\w\s']*\w)/im))) {
					num = x[0];
					str = x[1];
				} else if ((x = p.skills.regex(/\bevery ([\w\s']*\w)/im))) {
					num = 1;
					str = x;
				}
				if (p.stats && p.stats.cap) {
					cap = Math.max(cap, p.stats.cap);
				}
				if ((x = p.skills.regex(/\bmax\.? (\d+)/i))) {
					cap = Math.max(cap, x);
				}
				if (str) {
					for (x = str.split(' '); x.length > 0; x.pop()) {
						str = x.join(' ');
						if ((y = str.regex(/^(.+)s$/i))) {
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
					Resources.set(['data', '_' + item, 'generals'], num * cap);
//					log(LOG_WARN, 'Save ' + (num * cap) + ' x ' + item + ' for General ' + i);
				}
			}
		}

		// need this since we now store unpurchased heroes also
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
		Config.set('generals', ['any','under max level'].concat(list.sort())); 
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

			this.set(['data',i,'invade']);
			this.set(['data',i,'duel']);
			this.set(['data',i,'war']);
			this.set(['data',i,'monster']);
			this.set(['data',i,'potential']);
			this.set(['data',i,'stats','stamina']);
			this.set(['data',i,'stats','energy']);

			// update the weapon bonus list
			s = '';
			if ((o = p.equip)) {
				for (j in o) {
					if (Town.get(['data',j,'own'], 0, 'number') > 0) {
						if (s !== '') { s += '; '; }
						s += j + ': ' + o[j];
					}
				}
			}
			if (s) {
				this.set(['data',i,'weaponbonus'], s);
			} else {
				this.set(['data',i,'weaponbonus']);
			}

			skillcombo = ';' + (p.skills || '') + ';' + s + ';';

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

			all_stats = sum(skillcombo.regex(/\bAll Stats by ([-+]?\d*\.?\d+)\b/gi)) || 0;

			k = {};
			if ((o = skillcombo.regex(/\bEvery (\d+) ([^;]*?\w)(?:\s*Increase|\s*Decrease)?(?:\s+Player)? (Attack|Defense) by ([-+]?\d*\.?\d+)/i))) {
				k['p'+o[2].toLowerCase()] = Math.floor(o[3] * Math.floor(Town.get(['data',o[1],'own'], 0, 'number') / (o[0] || 1)));
			} else if ((o = skillcombo.regex(/\bEvery ([^;]*?\w)(?:\s*Increase|\s*Decrease)?(?:\s+Player)? (Attack|Defense) by ([-+]?\d*\.?\d+)/i))) {
				k['p'+o[1].toLowerCase()] = Math.floor(o[2] * Town.get(['data',o[0],'own'], 0, 'number'));
			}

			j = Math.floor(sum(skillcombo.regex(/([-+]?\d*\.?\d+) Player Attack\b|\bPlayer Attack by ([-+]\d+)\b|\bConvert ([-+]?\d*\.?\d+) Attack\b/gi))
			  + sum(p.skills.regex(/([-+]?\d*\.?\d+) Player Attack for every Hero Owned|/gi)) * ((this.runtime.heroes || 0) - 1)
			  + all_stats + (k.pattack || 0));
			this.set(['data',i,'stats','patt'], j ? j : undefined);

			j = Math.floor(sum(skillcombo.regex(/([-+]?\d*\.?\d+) Player Defense|Player Defense by ([-+]?\d*\.?\d+)/gi))
			  + (sum(p.skills.regex(/\bPlayer Defense by ([-+]?\d*\.?\d+) for every 3 Health\b/gi)) * maxhealth / 3)
			  + sum(p.skills.regex(/([-+]?\d*\.?\d+) Player Defense for every Hero Owned/gi)) * ((this.runtime.heroes || 0) - 1)
			  + all_stats + (k.pdefense || 0));
			this.set(['data',i,'stats','pdef'], j ? j : undefined);

			j = Math.floor(sum(skillcombo.regex(/([-+]?\d*\.?\d+) [Aa]ttack [Tt]o [A-Z]/g))
			  + sum(skillcombo.regex(/([-+]?\d*\.?\d+) Attack when[^;]*equipped\b/gi)));
			this.set(['data',i,'stats','att'], j ? j : undefined);

			j = Math.floor(sum(skillcombo.regex(/([-+]?\d*\.?\d+) Defense to\b/gi))
			  + sum(skillcombo.regex(/([-+]?\d*\.?\d+) Defense when[^;]*equipped\b/gi)));
			this.set(['data',i,'stats','def'], j ? j : undefined);

			j = ((p.att || 0)
			  + ((p.stats && p.stats.att) || 0)
			  + ((p.def || 0)
			  + ((p.stats && p.stats.def) || 0)) * 0.7).round(1);
			this.set(['data',i,'tot_att'], j ? j : undefined);
			this.set(['data',i,'stats','tot_att']);

			j = (((p.att || 0)
			  + ((p.stats && p.stats.att) || 0)) * 0.7
			  + (p.def || 0)
			  + ((p.stats && p.stats.def) || 0)).round(1);
			this.set(['data',i,'tot_def'], j ? j : undefined);
			this.set(['data',i,'stats','tot_def']);

			j = sum(skillcombo.regex(/([-+]?\d+) Monster attack\b/gi));
			this.set(['data',i,'stats','matt'], j ? j : undefined);

			j = sum(skillcombo.regex(/\bPlayer Attack when Defending by ([-+]?\d+)\b|([-+]?\d+) Attack when attacked\b/gi));
			this.set(['data',i,'stats','patt_when_att'], j ? j : undefined);

			j = sum(skillcombo.regex(/\bPlayer Defense when Defending by ([-+]?\d+)\b|([-+]?\d+) Defense when attacked\b/gi));
			this.set(['data',i,'stats','pdef_when_att'], j ? j : undefined);

			army = Math.min(armymax + nmax(0, skillcombo.regex(/\b(\d+) Army members?/gi)), nmax(0, skillcombo.regex(/\bArmy Limit to (\d+)\b/gi)) || 501);

			gen_att = getAttDef(data, listpush, 'att', 1 + Math.floor((army - 1) / 5));
			gen_def = getAttDef(data, listpush, 'def', 1 + Math.floor((army - 1) / 5));

			war_att = getAttDef(data, listpush, 'att', 6);
			war_def = getAttDef(data, listpush, 'def', 6);

			monster_multiplier = 1.1 + sum(skillcombo.regex(/([-+]?\d+)% Critical\b/gi))/100;

			// invade calcs

			j = Math.floor((invade.attack || 0) + gen_att +
			  + ((p.att || 0) + ((p.stats && p.stats.att) || 0)
			  + (((p.stats && p.stats.patt) || 0)
			  + pattack) * army)
			  + ((p.def || 0) + ((p.stats && p.stats.def) || 0)
			  + (((p.stats && p.stats.pdef) || 0)
			  + pdefense) * army) * 0.7);
			this.set(['data',i,'stats','invade','att'], j ? j : undefined);

			j = Math.floor((invade.defend || 0) + gen_def +
			  + ((p.att || 0) + ((p.stats && p.stats.att) || 0)
			  + ((((p.stats && p.stats.patt) || 0)
			  + ((p.stats && p.stats.patt_when_att) || 0))
			  + pattack) * army) * 0.7
			  + ((p.def || 0) + ((p.stats && p.stats.def) || 0)
			  + ((((p.stats && p.stats.pdef) || 0)
			  + ((p.stats && p.stats.pdef_when_att) || 0))
			  + pdefense) * army));
			this.set(['data',i,'stats','invade','def'], j ? j : undefined);

			// duel calcs

			j = Math.floor((duel.attack || 0) +
			  + ((p.att || 0) + ((p.stats && p.stats.att) || 0)
			  + ((p.stats && p.stats.patt) || 0)
			  + pattack)
			  + ((p.def || 0) + ((p.stats && p.stats.def) || 0)
			  + ((p.stats && p.stats.pdef) || 0)
			  + pdefense) * 0.7);
			this.set(['data',i,'stats','duel','att'], j ? j : undefined);

			j = Math.floor((duel.defend || 0) +
			  + ((p.att || 0) + ((p.stats && p.stats.att) || 0)
			  + ((p.stats && p.stats.patt) || 0)
			  + ((p.stats && p.stats.patt_when_att) || 0)
			  + pattack) * 0.7
			  + ((p.def || 0) + ((p.stats && p.stats.def) || 0)
			  + ((p.stats && p.stats.pdef) || 0)
			  + ((p.stats && p.stats.pdef_when_att) || 0)
			  + pdefense));
			this.set(['data',i,'stats','duel','def'], j ? j : undefined);

			// war calcs

			j = Math.floor((duel.attack || 0) + war_att
			  + (((p.stats && p.stats.patt) || 0)
			  + pattack)
			  + (((p.stats && p.stats.pdef) || 0)
			  + pdefense) * 0.7);
			this.set(['data',i,'stats','war','att'], j ? j : undefined);

			j = Math.floor((duel.defend || 0) + war_def
			  + (((p.stats && p.stats.patt) || 0)
			  + ((p.stats && p.stats.patt_when_att) || 0)
			  + pattack) * 0.7
			  + (((p.stats && p.stats.pdef) || 0)
			  + ((p.stats && p.stats.pdef_when_att) || 0)
			  + pdefense));
			this.set(['data',i,'stats','war','def'], j ? j : undefined);

			// monster calcs

			// not quite right, gear defense not counted on monster attack
			j = Math.floor(((duel.attack || 0) +
			  + (p.att || 0) + ((p.stats && p.stats.att) || 0)
			  + ((p.stats && p.stats.patt) || 0)
			  + pattack
			  + ((p.stats && p.stats.matt) || 0))
			  * monster_multiplier);
			this.set(['data',i,'stats','monster','att'], j ? j : undefined);

			// not quite right, gear attack not counted on monster defense
			j = Math.floor((duel.defend || 0) +
			  + ((p.stats && p.stats.def) || p.att || 0)
			  + ((p.stats && p.stats.pdef) || 0)
			  + pdefense
			  + ((p.stats && p.stats.mdef) || 0));
			this.set(['data',i,'stats','monster','def'], j ? j : undefined);

			j = nmax(0, skillcombo.regex(/Increase Power Attacks by (\d+)/gi));
			this.set(['runtime','multipliers',i], j ? j : undefined);

			j = sum(skillcombo.regex(/\bMax Energy by ([-+]?\d+)\b|([-+]?\d+) Max Energy\b/gi))
			  - (sum(skillcombo.regex(/\bTransfer (\d+)% Max Energy to\b/gi)) * Player.get('maxenergy') / 100).round(0)
			  + (sum(skillcombo.regex(/\bTransfer (\d+)% Max Stamina to Max Energy/gi)) * Player.get('maxstamina') / 100*2).round(0)
			  + all_stats;
			this.set(['data',i,'stats','maxenergy'], j ? j : undefined);

			j = sum(skillcombo.regex(/\bMax Stamina by ([-+]?\d+)|([-+]?\d+) Max Stamina/gi))
			  - (sum(skillcombo.regex(/Transfer (\d+)% Max Stamina to\b/gi)) * maxstamina / 100).round(0)
			  + (sum(skillcombo.regex(/Transfer (\d+)% Max Energy to Max Stamina/gi)) * maxenergy / 200).round(0)
			  + all_stats;
			this.set(['data',i,'stats','maxstamina'], j ? j : undefined);

			j = all_stats;
			this.set(['data',i,'stats','maxhealth'], j ? j : undefined);

			j = skillcombo.regex(/Bank Fee/gi) ? 100 : 0;
			this.set(['data',i,'stats','bank'], j ? j : undefined);

			j = nmax(0, skillcombo.regex(/\bBonus \$?(\d+) Gold\b/gi));
			this.set(['data',i,'stats','cash'], j ? j : undefined);

			j = nmax(0, skillcombo.regex(/\bDecreases? Soldier Cost by (\d+)%/gi));
			this.set(['data',i,'stats','cost'], j ? j : undefined);

			j = skillcombo.regex(/Extra Demi Points/gi) ? 5 : 0;
			this.set(['data',i,'stats','demi'], j ? j : undefined);

			j = nmax(0, skillcombo.regex(/\bIncrease Income by (\d+)\b/gi));
			this.set(['data',i,'stats','income'], j ? j : undefined);

			j = nmax(0, skillcombo.regex(/\bInfluence (\d+)% Faster\b/gi));
			this.set(['data',i,'stats','influence'], j ? j : undefined);

			j = nmax(0, skillcombo.regex(/Chance ([-+]?\d+)% Drops|\bitems from quests by (\d+)%/gi));
			this.set(['data',i,'stats','item'], j ? j : undefined);

			this.set(['runtime','armymax'], Math.max(army, this.runtime.armymax));
		}

		this.set('runtime.revision', revision);
	}

	if (bests || !this.runtime.best) {
		bests = {};
		list = {};

		for (i in this.data) {
			p = this.data[i];
			if (p.stats && p.own) {
				for (j in p.stats) {
					if (isNumber(p.stats[j])) {
						if ((bests[j] || -1e99) < p.stats[j]) {
							bests[j] = p.stats[j];
							list[j] = i;
						}
					} else if (isObject(p.stats[j])) {
						for (k in p.stats[j]) {
							if (isNumber(p.stats[j][k])) {
								o = j + '-' + k;
								if ((bests[o] || -1e99) < p.stats[j][k]) {
									bests[o] = p.stats[j][k];
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
	log(LOG_WARN, 'General change: ' + Player.get('general') + ' to ' + name);
	var id = this.get(['data',name,'id']), type = this.get(['data',name,'type']);
	Page.to('heroes_generals', isNumber(id) && isNumber(type) ? {item:id, itype:type} : null, true);
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
			case 'monster-defend':
			case 'dispell':
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
	var self = this, i, j, o, p, data, output = [], list = [], iatt = 0, idef = 0, datt = 0, ddef = 0, matt = 0, mdef = 0,
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
			} else if ((i = sorttype[sort])) {
				aa = self.get(['data',a].concat(i.split('.')), 0, 'number');
				bb = self.get(['data',b].concat(i.split('.')), 0, 'number');
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
		td(output, '<a class="golem-link" href="generals.php?item=' + p.id + '&itype=' + p.type + '"><img src="' + imagepath + p.img + '" style="width:25px;height:25px;" title="Skills: ' + this.get([p,'skills'], 'none') + (j ? '; Weapon Bonus: ' + j : '') + '"></a>');
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

// vi: ts=4

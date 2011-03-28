/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page, Queue, Resources,
	Bank, Battle, Generals, LevelUp, Player, Quest, Land,
	APP, APPID, warn, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser, console,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, Divisor, length, sum, findInObject, objectIndex, sortObject, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
	makeImage, bestValue
*/
/********** Worker.Town **********
* Sorts and auto-buys all town units (not property)
*/
var Town = new Worker('Town');
Town.temp = null;

Town.defaults['castle_age'] = {
	pages:'town_soldiers town_blacksmith town_magic keep_stats'
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
	cost:0,
	soldiers:0,
	blacksmith:0,
	magic:0
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
	select:['$10k','$100k','$1m','$10m','$100m','$1b','$10b','$100b','$1t','$10t','$100t','INCR'],
	help:'Will buy best item based on Set Type with single item cost below selected value. INCR will start at $10k and work towards max buying at each level (WARNING, not cost effective!)'
},{
	advanced:true,
	require:'number!="None"',
	id:'upkeep',
	label:'Max Upkeep',
	text:true,
	after:'%',
	help:'Enter maximum Total Upkeep in % of Total Income'
}
];

/*
Town.blacksmith = {
	Weapon: /axe|blade|bow|cleaver|cudgel|dagger|edge|grinder|halberd|lance|mace|morningstar|rod|saber|scepter|spear|staff|stave|sword |sword$|talon|trident|wand|^Avenger$|Celestas Devotion|Crystal Rod|Daedalus|Deliverance|Dragonbane|Excalibur|Holy Avenger|Incarnation|Ironhart's Might|Judgement|Justice|Lightbringer|Oathkeeper|Onslaught|Punisher|Soulforge/i,
	Shield:	/aegis|buckler|shield|tome|Defender|Dragon Scale|Frost Tear Dagger|Harmony|Sword of Redemption|Terra's Guard|The Dreadnought|Purgatory|Zenarean Crest/i,
	Helmet:	/cowl|crown|helm|horns|mask|veil|Virtue of Fortitude/i,
	Gloves:	/gauntlet|glove|hand|bracer|fist|Slayer's Embrace|Soul Crusher|Soul Eater|Virtue of Temperance/i,
	Armor:	/armor|belt|chainmail|cloak|epaulets|gear|garb|pauldrons|plate|raiments|robe|tunic|vestment|Faerie Wings/i,
	Amulet:	/amulet|bauble|charm|crystal|eye|flask|insignia|jewel|lantern|memento|necklace|orb|pendant|shard|signet|soul|talisman|trinket|Heart of Elos|Mark of the Empire|Paladin's Oath|Poseidons Horn| Ring|Ring of|Ruby Ore|Terra's Heart|Thawing Star|Transcendence/i
};
*/

  // I know, I know, really verbose, but don't gripe unless it doesn't match
  // better than the short list above.  This is based on a generated list that
  // ensures the list has no outstanding mismatches or conflicts given all
  // known items as of a given date.

  // as of Fri Mar 25 22:00:26 2011 UTC
Town.blacksmith = {
      // Feral Staff is a multi-pass match:
      //   shield.11{Feral Staff}, weapon.5{Staff}
      // Frost Tear Dagger is a multi-pass match:
      //   shield.17{Frost Tear Dagger}, weapon.6{Dagger}
      // Ice Dagger is a multi-pass match:
      //   shield.10{Ice Dagger}, weapon.6{Dagger}
      // Sword of Redemption is a multi-pass match:
      //   shield.19{Sword of Redemption}, weapon.5{Sword}
    Weapon: new RegExp('(' +
      '\\baxe\\b' +				// 13
      '|\\bblades?\\b' +		// 27+1
      '|\\bbow\\b' +			// 8
      '|\\bclaw\\b' +			// 1
      '|\\bcleaver\\b' +		// 1
      '|\\bcudgel\\b' +			// 1
      '|\\bdagger\\b' +			// 8 (mismatches 2)
      '|\\bedge\\b' +			// 1
      '|\\bgreatsword\\b' +		// 2
      '|\\bgrinder\\b' +		// 1
      '|\\bhalberd\\b' +		// 1
      '|\\bhammer\\b' +			// 1
      '|\\bhellblade\\b' +		// 1
      '|\\bkatara\\b' +			// 1
      '|\\bkingblade\\b' +		// 1
      '|\\blance\\b' +			// 2
      '|\\blongsword\\b' +		// 1
      '|\\bmace\\b' +			// 6
      '|\\bmorningstar\\b' +	// 1
      '|\\brapier\\b' +			// 1
      '|\\brod\\b' +			// 2
      '|\\bsaber\\b' +			// 4
      '|\\bscepter\\b' +		// 1
      '|\\bshortsword\\b' +		// 1
      '|\\bspear\\b' +			// 3
      '|\\bstaff\\b' +			// 9 (mismatches 1)
      '|\\bstaves\\b' +			// 1
      '|\\bsword\\b' +			// 16 (mismatches 1)
      '|\\btalon\\b' +			// 1
      '|\\btrident\\b' +		// 2
      '|\\bwand\\b' +			// 3
      '|^Arachnid Slayer$' +
      '|^Atonement$' +
      '|^Avenger$' +
      '|^Bloodblade$' +
      '|^Bonecrusher$' +
      '|^Celestas Devotion$' +
      '|^Daedalus$' +
      '|^Death Dealer$' +
      '|^Deathbellow$' +
      '|^Deliverance$' +
      '|^Draganblade$' +
      '|^Dragonbane$' +
      '|^Excalibur$' +
      '|^Exsanguinator$' +
      '|^Heart of the Woods$' +
      '|^Holy Avenger$' +
      '|^Incarnation$' +
      '|^Inoculator$' +
      "|^Ironhart's Might$" +
      '|^Judgement$' +
      '|^Justice$' +
      '|^Lifebane$' +
      '|^Lightbringer$' +
      '|^Lion Fang$' +
      '|^Moonclaw$' +
      '|^Oathkeeper$' +
      "|^Oberon's Might$" +
      '|^Onslaught$' +
      '|^Path of the Tower$' +
      '|^Punisher$' +
      '|^Righteousness$' +
      '|^Scytheblade$' +
      '|^Soul Siphon$' +
      '|^Soulforge$' +
      '|^Stormcrusher$' +
      '|^The Disemboweler$' +
      '|^The Galvanizer$' +
      '|^The Reckoning$' +
      '|^Virtue of Justice$' +
      ')', 'i'),
    Shield: new RegExp('(' +
      '\\baegis\\b' +			// 4
      '|\\bbuckler\\b' +		// 1
      '|\\bdeathshield\\b' +	// 1
      '|\\bdefender\\b' +		// 5
      '|\\bprotector\\b' +		// 1
      '|\\bshield\\b' +			// 22
      '|\\btome\\b' +			// 3
      '|^Absolution$' +
      '|^Crest of the Griffin$' +
      '|^Dragon Scale$' +
      '|^Feral Staff$' +
      '|^Frost Tear Dagger$' +
      '|^Harmony$' +
      '|^Heart of the Pride$' +
      '|^Hour Glass$' +
      '|^Ice Dagger$' +
      '|^Illvasan Crest$' +
      '|^Purgatory$' +
      '|^Serenes Arrow$' +
      '|^Sword of Redemption$' +
      "|^Terra's Guard$" +
      '|^The Dreadnought$' +
      '|^Zenarean Crest$' +
      ')', 'i'),
    Armor: new RegExp('(' +
      '\\barmguard\\b' +		// 1
      '|\\barmor\\b' +			// 22
      '|\\bbattlegarb\\b' +		// 1
      '|\\bbattlegear\\b' +		// 3
      '|\\bbelt\\b' +			// 1
      '|\\bcarapace\\b' +		// 1
      '|\\bchainmail\\b' +		// 2
      '|\\bcloak\\b' +			// 7
      '|\\bepaulets\\b' +		// 1
      '|\\bgarb\\b' +			// 1
      '|\\bpauldrons\\b' +		// 1
      '|\\bplate\\b' +			// 32
      '|\\bplatemail\\b' +		// 2
      '|\\braiments\\b' +		// 5
      '|\\brobes?\\b' +			// 3+7
      '|\\btunic\\b' +			// 1
      '|\\bvestment\\b' +		// 1
      '|^Braving the Storm$' +
      '|^Castle Rampart$' +
      '|^Death Ward$' +
      '|^Deathrune Hellplate$' +
      '|^Faerie Wings$' +
      '|^Innocence$' +
      '|^Plated Earth$' +
      ')', 'i'),
    Helmet: new RegExp('(' +
      '\\bcowl\\b' +			// 1
      '|\\bcrown\\b' +			// 13
      '|\\bdoomhelm\\b' +		// 1
      '|\\bhelm\\b' +			// 38
      '|\\bhelmet\\b' +			// 2
      '|\\bhorns\\b' +			// 1
      '|\\bmane\\b' +			// 1
      '|\\bmask\\b' +			// 2
      '|\\btiara\\b' +			// 1
      '|\\bveil\\b' +			// 1
      '|^Virtue of Fortitude$' +
      ')', 'i'),
    Amulet: new RegExp('(' +
      '\\bamulet\\b' +			// 17
      '|\\bband\\b' +			// 2
      '|\\bbauble\\b' +			// 1
      '|\\bcharm\\b' +			// 2
      '|\\bcross\\b' +			// 1
      '|\\bearrings\\b' +		// 1
      '|\\beye\\b' +			// 3
      '|\\bflask\\b' +			// 1
      '|\\bheirloom\\b' +		// 1
      '|\\binsignia\\b' +		// 3
      '|\\bjewel\\b' +			// 3
      '|\\blantern\\b' +		// 1
      '|\\blocket\\b' +			// 2
      '|\\bmark\\b' +			// 1
      '|\\bmedallion\\b' +		// 1
      '|\\bmemento\\b' +		// 1
      '|\\bnecklace\\b' +		// 4
      '|\\bpendant\\b' +		// 11
      '|\\brelic\\b' +			// 1
      '|\\bring\\b' +			// 8
      '|\\bruby\\b' +			// 1
      '|\\bseal\\b' +			// 4
      '|\\bshard\\b' +			// 6
      '|\\bsignet\\b' +			// 8
      '|\\bsunstone\\b' +		// 1
      '|\\btalisman\\b' +		// 1
      '|\\btrinket\\b' +		// 2
      '|^Air Orb$' +
      '|^Blue Lotus Petal$' +
      '|^Crystal of Lament$' +
      '|^Dragon Ashes$' +
      '|^Earth Orb$' +
      '|^Force of Nature$' +
      '|^Gold Bar$' +
      '|^Heart of Elos$' +
      '|^Ice Orb$' +
      "|^Keira's Soul$" +
      '|^Lava Orb$' +
      '|^Magic Mushrooms$' +
      "|^Paladin's Oath$" +
      '|^Poseidons Horn$' +
      '|^Shadowmoon$' +
      '|^Silver Bar$' +
      '|^Soul Catcher$' +
      "|^Terra's Heart$" +
      '|^Thawing Star$' +
      '|^Tooth of Gehenna$' +
      '|^Transcendence$' +
      '|^Tribal Crest$' +
      '|^Vincents Soul$' +
      ')', 'i'),
    Gloves: new RegExp('(' +
      '\\bbracer\\b' +			// 1
      '|\\bfists?\\b' +			// 1+1
      '|\\bgauntlets?\\b' +		// 10+4
      '|\\bgloves?\\b' +		// 2+2
      '|\\bhandguards\\b' +		// 1
      '|\\bhands?\\b' +			// 5+3
      '|^Natures Reach$' +
      '|^Poisons Touch$' +
      "|^Slayer's Embrace$" +
      '|^Soul Crusher$' +
      '|^Soul Eater$' +
      '|^Stormbinder$' +
      '|^Stormbringer$' +
      '|^Tempered Steel$' +
      '|^Virtue of Temperance$' +
      ')', 'i')
};

Town.setup = function() {
	Resources.use('Gold');
};

Town.init = function() {
	this._watch(Player, 'data.worth');
	this._watch(Land, 'runtime.save_amount');
	this.runtime.cost_incr = 4;
	this.runtime.soldiers = this.runtime.blacksmith = this.runtime.magic = 0;
};

  // .layout td >div:contains("Owned Items:")
  // .layout td >div div[style*="town_unit_bar."]
  // .layout td >div div[style*="town_unit_bar_owned."]
Town.parse = function(change) {
	var modify = false;
	if (change && Page.page === 'town_blacksmith') {
		$('div[style*="town_unit_bar."],div[style*="town_unit_bar_owned."]').each(function(i,el) {
			var name = $('div img[alt]', el).attr('alt').trim(),
				icon = $('div img[src]', el).attr('src').filepart();
			if (Town.dup_map[name] && Town.dup_map[name][icon]) {
				name = Town.dup_map[name][icon];
			}
			if (Town.data[name] && Town.data[name].type) {
				$('div strong:first', el).parent().append('<br>'+Town.data[name].type);
			}
		});
	} else if (Page.page === 'keep_stats') {
		var keep = $('.keep_attribute_section').first();
		// Only when it's our own keep and not someone elses
		if (keep.length) {
			var tmp = $('.statsTTitle:contains("UNITS") + .statsTMain .statUnit');
			if (tmp.length) {
				tmp.each(function(a, el) {
					var b = $('a img[src]', el);
					var i = $(b).attr('src').filepart();
					var n = ($(b).attr('title') || $(b).attr('alt') || '').trim();
					var c = $(el).text().regex(/\bX\s*(\d+)\b/i);
					if (!Town.data[n]) {
						Town.set('runtime.soldiers', -1);
						return false;
					} else if (Town.data[n].own != c) {
						Town.set(['data', n, 'own'], c);
					}
				});
			}

			tmp = $('.statsTTitle:contains("ITEMS") + .statsTMain .statUnit');
			if (tmp.length) {
				tmp.each(function(a, el) {
					var b = $('a img[src]', el);
					var i = $(b).attr('src').filepart();
					var n = ($(b).attr('title') || $(b).attr('alt') || '').trim();
					var c = $(el).text().regex(/\bX\s*(\d+)\b/i);
					// names aren't unique for items
					if (n && Town.dup_map[n] && Town.dup_map[n][i]) {
						n = Town.dup_map[n][i];
					}
					if (!Town.data[n] || Town.data[n].img !== i) {
						Town.set('runtime.blacksmith', -1);
						Town.set('runtime.magic', -1);
						return false;
					} else if (Town.data[n].own != c) {
						Town.set(['data', n, 'own'], c);
					}
				});
			}
		}
	} else if (!change) {
		var unit = Town.data, page = Page.page.substr(5), purge, changes = 0, i, j, cost_adj = 1;
		purge = {};
		for (i in unit) {
			if (unit[i].page === page) {
				purge[i] = true;
			}
		}
		// undo cost reduction general values on the magic page
		if (page === 'magic' && (i = Generals.get(Player.get('general')))) {
			j = Math.max(nmax(((i.skills || '') + ';' + (i.weaponbonus || '')).regex(/\bDecrease Soldier Cost by (\d+)\b/ig)),
			  (i.stats && i.stats.cost) || 0,
			  (i.potential && i.potential.cost) || 0);
			if (j) {
				cost_adj = 100 / (100 - j);
			}
		}
		$('div[style*="town_unit_bar."],div[style*="town_unit_bar_owned."]').each(function(a,el) {
			var i, j,
				name = $('div img[alt]', el).attr('alt').trim(),
				icon = $('div img[src]', el).attr('src').filepart(),
				cost = $('div strong.gold', el).text().replace(/\D/g, ''),
				own = $('div div:contains("Owned:")', el).text().regex(/\bOwned:\s*(\d+)\b/i),
				atk = $('div div div:contains("Attack")', el).text().regex(/\b(\d+)\s+Attack\b/),
				def = $('div div div:contains("Defense")', el).text().regex(/\b(\d+)\s+Defense\b/i),
				upkeep = $('div div:contains("Upkeep:") span.negative', el).text().replace(/\D/g, ''),
				match, maxlen = 0;
			changes++;
			if (Town.dup_map[name] && Town.dup_map[name][icon]) {
				name = Town.dup_map[name][icon];
			}
			if (purge[name]) {
				purge[name] = false;
			}
			unit[name] = unit[name] || {};
			unit[name].page = page;
			unit[name].img = icon;
			unit[name].own = own || 0;
			Resources.add('_'+name, unit[name].own, true);
			unit[name].att = atk || 0;
			unit[name].def = def || 0;
			unit[name].tot_att = unit[name].att + (0.7 * unit[name].def);
			unit[name].tot_def = unit[name].def + (0.7 * unit[name].att);
			if (cost) {
				unit[name].cost = Math.round(cost_adj * (parseInt(cost, 10) || 0));
			} else if ('cost' in unit[name]) {
				delete unit[name].cost;
			}
			if (upkeep) {
				unit[name].upkeep = parseInt(upkeep, 10) || 0;
			} else if ('upkeep' in unit[name]) {
				delete unit[name].upkeep;
			}
			if (cost) {
				unit[name].id = null;
				if ((i = $('form .imgButton input[name="Buy"]', el)).length) {
					if ((j = i.closest('form').attr('id')) && (j = (j.regex(/^app46755028429_itemBuy_(\d+)$/)))) {
						unit[name].id = j;
					}
					unit[name].buy = [];
					$('select[name="amount"] option', i.closest('form')).each(function(b,el) {
						unit[name].buy.push(parseInt($(el).val(), 10));
					});
				} else {
					unit[name].buy = null;
				}
				if ((i = $('form .imgButton input[name="Sell"]', el)).length) {
					if ((j = i.closest('form').attr('id')) && (j = (j.regex(/^app46755028429_itemSell_(\d+)$/)))) {
						unit[name].id = j;
					}
					unit[name].sell = [];
					$('select[name="amount"] option', i.closest('form')).each(function(b,el) {
						unit[name].sell.push(parseInt($(el).val(), 10));
					});
				} else {
					unit[name].sell = null;
				}
			} else {
				if ('buy' in unit[name]) {
					delete unit[name].buy;
				}
				if ('sell' in unit[name]) {
					delete unit[name].sell;
				}
			}
			if (page === 'blacksmith') {
				unit[name].type = null;
				for (i in Town.blacksmith) {
					if ((match = name.match(Town.blacksmith[i]))) {
						j = 1;
//						for (j=0; j<match.length; j++) {
							if (match[j].length > maxlen) {
								unit[name].type = i;
								maxlen = match[j].length;
							}
//						}
					}
				}
			}
		});
		// if nothing at all changed above, something went wrong on the page download
		if (changes > 0) {
			for (i in purge) {
				if (purge[i]) {
					console.log(warn(), 'Purge: ' + i);
					delete unit[i];
					changes++;
				}
			}
		}
		if (changes) {
			this._notify('data');
		}
		modify = true;
	}
	return modify;
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

Town.update = function(event) {
	var i, u, need, want, have, best_buy = null, buy_pref = 0, best_sell = null, sell_pref = 0, best_quest = false, buy = 0, sell = 0, cost, upkeep, data = this.data, army = Math.min(Generals.get('runtime.armymax', 501), Player.get('armymax', 501)), max_buy = 0, max_sell = 0, resource, max_cost, keep,
	land_buffer = (Land.get('option.save_ahead', false) && Land.get('runtime.save_amount', 0)) || 0,
	incr = (this.runtime.cost_incr || 4), visit = false;
	if (!Page.data['town_soldiers'] || !Page.data['town_blacksmith'] || !Page.data['town_magic']) {
		visit = true;
	}

	switch (this.option.number) {
		case 'Army':
			max_buy = max_sell = army;
			break;
		case 'Army+':
			max_buy = army;
			max_sell = 541;
			break;
		case 'Max Army':
			max_buy = max_sell = 541;
			break;
		default:
			max_buy = max_sell = 0;
			break;
	}
	// These two fill in all the data we need for buying / sellings items
	this.set(['runtime','duel'], this.getDuel());
	keep = {};
	if (this.option.sell && max_sell !== max_buy) {
		this.getInvade(max_sell);
		for (u in data) {
			resource = Resources.data['_'+u] || {};
			need = 0;
			if (this.option.units !== 'Best Defense') {
				need = Math.max(need, Math.min(max_sell, Math.max(resource.invade_att || 0, resource.duel_att || 0)));
			}
			if (this.option.units !== 'Best Offense') {
				need = Math.max(need, Math.min(max_sell, Math.max(resource.invade_def || 0, resource.duel_def || 0)));
			}
			if ((keep[u] || 0) < need && data[u].sell && data[u].sell.length) {
				keep[u] = need;
//				console.log(warn(), 'Keep[' + u + '] = ' + keep[u]);
			}
			if (resource && (resource.invade_def || resource.invade_att)) {
				if (resource.invade_def) {
					delete resource.invade_def;
				}
				if (resource.invade_att) {
					delete resource.invade_att;
				}
				if (!length(resource)) {
					delete Resources.data['_'+u];
				}
			}
		}
		Resources._notify('data'); // reset the "what-if" tinkering
	}
	this.set(['runtime','invade'], this.getInvade(max_buy));
	// For all items / units
	// 1. parse through the list of buyable items of each type
	// 2. find the one with Resources.get(_item.invade_att) the highest (that's the number needed to hit 541 items in total)
	// 3. buy enough to get there
	// 4. profit (or something)...
	for (u in data) {
		resource = Resources.data['_'+u] || {};
		want = 0;
		if (resource.quest) {
			if (this.option.quest_buy) {
				want = Math.max(want, resource.quest);
			}
			if ((keep[u] || 0) < resource.quest) {
				keep[u] = resource.quest;
			}
		}
		if (isNumber(resource.generals)) {
			if (this.option.generals_buy) {
				want = Math.max(want, resource.generals);
			}
			if ((keep[u] || 0) < (resource.generals || 1e50)) {
				keep[u] = resource.generals || 1e50;
			}
		}
		have = data[u].own;
		// Sorry about the nested max/min/max -
		// Max - 'need' can't get smaller
		// Min - 'max_buy' is the most we want to buy
		// Max - needs to accounts for invade and duel
		need = 0;
		if (this.option.units !== 'Best Defense') {
			need = Math.max(need, Math.min(max_buy, Math.max(resource.invade_att || 0, resource.duel_att || 0)));
		}
		if (this.option.units !== 'Best Offense') {
			need = Math.max(need, Math.min(max_buy, Math.max(resource.invade_def || 0, resource.duel_def || 0)));
		}
		if (want > have) {// If we're buying for a quest item then we're only going to buy that item first - though possibly more than specifically needed
			max_cost = Math.pow(10,30);
			need = want;
		} else {
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
		}
//			console.log(warn(), 'Item: '+u+', need: '+need+', want: '+want);
		if (need > have) {// Want to buy more                                
			if (!best_quest && data[u].buy && data[u].buy.length) {
				if (data[u].cost <= max_cost && this.option.upkeep >= (((Player.get('upkeep') + ((data[u].upkeep || 0) * (i = bestValue(data[u].buy, need - have)))) / Player.get('maxincome')) * 100) && (!best_buy || need > buy)) {
//						console.log(warn(), 'Buy: '+need);
					best_buy = u;
					buy = have + i; // this.buy() takes an absolute value
					buy_pref = Math.max(need, want);
					if (want && want > have) {// If we're buying for a quest item then we're only going to buy that item first - though possibly more than specifically needed
						best_quest = true;
					}
				}
			}
		} else if (max_buy && this.option.sell && Math.max(need,want) < have && data[u].sell && data[u].sell.length) {// Want to sell off surplus (but never quest stuff)
			need = bestValue(data[u].sell, have - (i = Math.max(need,want,keep[u] || 0)));
			if (need > 0 && (!best_sell || data[u].cost > data[best_sell].cost)) {
//					console.log(warn(), 'Sell: '+need);
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
		Dashboard.status(this, (this.option._disabled ? 'Would sell ' : 'Selling ') + sell + ' &times; ' + best_sell + ' for ' + makeImage('gold') + '$' + (sell * data[best_sell].cost / 2).SI() + (upkeep ? ' (Upkeep: -$' + upkeep.SI() + ')': '') + (sell_pref < data[best_sell].own ? ' [' + data[best_sell].own + '/' + sell_pref + ']': ''));
	} else if (best_buy){
		best_sell = null;
		sell = 0;
		cost = (buy - data[best_buy].own) * data[best_buy].cost;
		upkeep = (buy - data[best_buy].own) * (data[best_buy].upkeep || 0);
		if (land_buffer && !Bank.worth(land_buffer)) {
			Dashboard.status(this, '<i>Deferring to Land</i>');
		}
		else if (Bank.worth(this.runtime.cost - land_buffer)) {
			Dashboard.status(this, (this.option._disabled ? 'Would buy ' : 'Buying ') + (buy - data[best_buy].own) + ' &times; ' + best_buy + ' for ' + makeImage('gold') + '$' + cost.SI() + (upkeep ? ' (Upkeep: $' + upkeep.SI() + ')' : '') + (buy_pref > data[best_buy].own ? ' [' + data[best_buy].own + '/' + buy_pref + ']' : ''));
		} else {
			Dashboard.status(this, 'Waiting for ' + makeImage('gold') + '$' + (cost - Bank.worth()).SI() + ' to buy ' + (buy - data[best_buy].own) + ' &times; ' + best_buy + ' for ' + makeImage('gold') + '$' + cost.SI());
		}
	} else {
		if (this.option.maxcost === 'INCR'){
			this.set(['runtime','cost_incr'], incr === 14 ? 4 : incr + 1);
			this.set(['runtime','check'], Date.now() + 3600000);
		} else {
			this.set(['runtime','cost_incr'], null);
			this.set(['runtime','check'], null);
		}
		Dashboard.status(this);
	}
	this.set(['runtime','best_buy'], best_buy);
	this.set(['runtime','buy'], best_buy ? bestValue(data[best_buy].buy, buy - data[best_buy].own) : 0);
	this.set(['runtime','best_sell'], best_sell);
	this.set(['runtime','sell'], sell);
	this.set(['runtime','cost'], best_buy ? this.runtime.buy * data[best_buy].cost : 0);
	this.set(['option','_sleep'], !(this.runtime.best_buy && Bank.worth(this.runtime.cost)) && !this.runtime.best_sell && !visit && Page.stale('town_soldiers', this.get('runtime.soldiers', 0)) && Page.stale('town_blacksmith', this.get('runtime.blacksmith', 0)) && Page.stale('town_magic', this.get('runtime.magic', 0)));
};

Town.work = function(state) {
	var i;
	if (state) {
		if (this.runtime.best_sell){
			this.sell(this.runtime.best_sell, this.runtime.sell);
		} else if (this.runtime.best_buy){
			this.buy(this.runtime.best_buy, this.runtime.buy);
		} else if (!Page.data[i = 'town_soldiers'] || !Page.data[i = 'town_blacksmith'] || !Page.data[i = 'town_magic']) {
			Page.to(i);
		} else if (!Page.stale('town_soldiers', this.get('runtime.soldiers', 0), true)) {
			this.set('runtime.soldiers', 0);
		} else if (!Page.stale('town_blacksmith', this.get('runtime.blacksmith', 0), true)) {
			this.set('runtime.blacksmith', 0);
		} else if (!Page.stale('town_magic', this.get('runtime.magic', 0), true)) {
			this.set('runtime.magic', 0);
		}
	}
	return QUEUE_CONTINUE;
};

Town.buy = function(item, number) { // number is absolute including already owned
	this._unflush();
	if (!this.data[item] || !this.data[item].id || !this.data[item].buy || !this.data[item].buy.length || !Bank.worth(this.runtime.cost)) {
		return true; // We (pretend?) we own them
	}
	if (!Generals.to(this.option.general ? 'cost' : 'any') || !Bank.retrieve(this.runtime.cost) || !Page.to('town_'+this.data[item].page)) {
		return false;
	}
	var qty = bestValue(this.data[item].buy, number);
	var $form = $('form#app46755028429_itemBuy_' + this.data[item].id);
	if ($form.length) {
		console.log(warn(), 'Buying ' + qty + ' x ' + item + ' for $' + (qty * Town.data[item].cost).addCommas());
		$('select[name="amount"]', $form).val(qty);
		Page.click($('input[name="Buy"]', $form));
	}
	this.set(['runtime','cost_incr'], 4);
	return false;
};

Town.sell = function(item, number) { // number is absolute including already owned
	this._unflush();
	if (!this.data[item] || !this.data[item].id || !this.data[item].sell || !this.data[item].sell.length) {
		return true;
	}
	if (!Page.to('town_'+this.data[item].page)) {
		return false;
	}
	var qty = bestValue(this.data[item].sell, number);
	var $form = $('form#app46755028429_itemSell_' + this.data[item].id);
	if ($form.length) {
		console.log(warn(), 'Selling ' + qty + ' x ' + item + ' for $' + (qty * Town.data[item].cost / 2).addCommas());
		$('select[name="amount"]', $form).val(qty);
		Page.click($('input[name="Sell"]', $form));
	}
	this.set(['runtime','cost_incr'], 4);
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
				return order[list[a].type] - order[list[b].type]
					|| (list[a].upkeep || 0) - (list[b].upkeep || 0)
					|| (list[a].cost || 0) - (list[b].cost || 0);
			});
		} else if (list[units[0]] && list[units[0]].skills && list[units[0]][type]) {
			units.sort(function(a,b) {
				return (list[b][type][x] || 0) - (list[a][type][x] || 0)
					|| (list[a].upkeep || 0) - (list[b].upkeep || 0)
					|| (list[a].cost || 0) - (list[b].cost || 0);
			});
		} else {
			units.sort(function(a,b) {
				return (list[b][x] + (0.7 * list[b][x2])) - (list[a][x] + (0.7 * list[a][x2]))
					|| (list[a].upkeep || 0) - (list[b].upkeep || 0)
					|| (list[a].cost || 0) - (list[b].cost || 0);
			});
		}
	}
	for (i=0; i<(count ? count : units.length); i++) {
		if ((list[units[0]] && list[units[0]].skills) || (list[units[i]].use && list[units[i]].use[type+'_'+x])) {
			output.push('<p><div style="height:25px;margin:1px;"><img src="' + imagepath + list[units[i]].img + '" style="width:25px;height:25px;float:left;margin-right:4px;"> ' + (list[units[i]].use ? list[units[i]].use[type+'_'+x]+' x ' : '') + units[i] + ' (' + list[units[i]].att + ' / ' + list[units[i]].def + ')' + (list[units[i]].cost?' $'+list[units[i]].cost.SI():'') + '</div></p>');
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

Town.dup_map = {
	'Earth Shard': {
		'gift_earth_1.jpg':	'Earth Shard (1)',
		'gift_earth_2.jpg':	'Earth Shard (2)',
		'gift_earth_3.jpg':	'Earth Shard (3)',
		'gift_earth_4.jpg':	'Earth Shard (4)'
	},
	'Elven Crown': {
		'gift_aeris_complete.jpg':	'Elven Crown (Aeris)',
		'eq_sylvanus_crown.jpg':	'Elven Crown (Sylvanas)'
	},
	'Green Emerald Shard': {
		'mystery_armor_emerald_1.jpg': 'Green Emerald Shard (1)',
		'mystery_armor_emerald_2.jpg': 'Green Emerald Shard (2)'
	}
};

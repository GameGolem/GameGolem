/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page, Queue, Resources,
	Bank, Battle, Generals, LevelUp, Player, Quest, Land,
	APP, APPID, warn, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser, console,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, Divisor, length, sum, findInObject, objectIndex, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
	makeImage
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

  // as of Tue Apr 12 11:25:28 2011 UTC
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
      '|\\bsword\\b' +			// 17 (mismatches 1)
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
      '|^Syrens Call$' +
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
      '|\\btome\\b' +			// 4
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
      '|\\bbattlegear\\b' +		// 4
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
      '\\bamulet\\b' +			// 18
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
      '|^Temptations Lure$' +
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
	var now = Date.now(), i;

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
};

  // .layout td >div:contains("Owned Items:")
  // .layout td >div div[style*="town_unit_bar."]
  // .layout td >div div[style*="town_unit_bar_owned."]
Town.parse = function(change) {
	var i, el, tmp, img, filename, name, count, now = Date.now(), self = this, modify = false, tmp;
	if (Page.page === 'keep_stats') {
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

			tmp = $('.statsT2 .statsTTitle:regex(^\\s*ITEMS\\s*$)');
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
		}
	} else if (change && Page.page === 'town_blacksmith') {
		$('div[style*="town_unit_bar."],div[style*="town_unit_bar_owned."]').each(function(i,el) {
			var name = ($('div img[alt]', el).attr('alt') || '').trim(),
				icon = ($('div img[src]', el).attr('src') || '').filepart();
			name = self.qualify(name, icon);
			if (self.data[name] && self.data[name].type) {
				$('div strong:first', el).parent().append('<br>'+self.data[name].type);
			}
		});
	} else if (!change && (Page.page === 'town_soldiers' || Page.page === 'town_blacksmith' || Page.page === 'town_magic')) {
		var unit = this.data, page = Page.page.substr(5), purge = {}, changes = 0, i, j, cost_adj = 1;
		for (i in unit) {
			if (unit[i].page === page) {
				purge[i] = true;
			}
		}
		// undo cost reduction general values on the magic page
		if (page === 'magic' && (i = Generals.get(Player.get('general')))) {
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
				self.set(['data',name,'page'], page);
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
				if ((tmp = $('form[id*="_itemBuy_"]', el)).length) {
					self.set(['data',name,'id'], tmp.attr('id').regex(/_itemBuy_(\d+)/i), 'number');
					$('select[name="amount"] option', tmp).each(function(b, el) {
						self.push(['data',name,'buy'], parseInt($(el).val(), 10), 'number')
					});
				}
				self.set(['data',name,'sell']);
				if ((tmp = $('form[id*="_itemSell_"]', el)).length) {
					self.set(['data',name,'id'], tmp.attr('id').regex(/_itemSell_(\d+)/i), 'number');
					$('select[name="amount"] option', tmp).each(function(b, el) {
						self.push(['data',name,'sell'], parseInt($(el).val(), 10), 'number')
					});
				}
				if (page === 'blacksmith') {
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
				log(LOG_ERROR, e.name + ' in ' + this.name + '.parse(' + change + '): ' + e.message);
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
		if (Page.page === 'town_blacksmith') {
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
	var now = Date.now(), i, j, k, p, u, need, want, have, best_buy = null, buy_pref = 0, best_sell = null, sell_pref = 0, best_quest = false, buy = 0, sell = 0, cost, upkeep,
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
				if (data[u].cost <= max_cost && this.option.upkeep >= (((Player.get('upkeep') + ((data[u].upkeep || 0) * (i = data[u].buy.lower(need - have)))) / Player.get('maxincome')) * 100) && i > 1 && (!best_buy || need > buy)) {
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
		Dashboard.status(this, (this.option._disabled ? 'Would sell ' : 'Selling ') + sell + ' &times; ' + best_sell + ' for ' + makeImage('gold') + '$' + (sell * data[best_sell].cost / 2).SI() + (upkeep ? ' (Upkeep: -$' + upkeep.SI() + ')': '') + (sell_pref < data[best_sell].own ? ' [' + data[best_sell].own + '/' + sell_pref + ']': ''));
	} else if (best_buy){
		best_sell = null;
		sell = 0;
		cost = (buy - data[best_buy].own) * data[best_buy].cost;
		upkeep = (buy - data[best_buy].own) * (data[best_buy].upkeep || 0);
		if (land_buffer && !Bank.worth(land_buffer)) {
			Dashboard.status(this, '<i>Deferring to Land</i>');
		} else if (Bank.worth(this.runtime.cost + land_buffer)) {
			Dashboard.status(this, (this.option._disabled ? 'Would buy ' : 'Buying ') + (buy - data[best_buy].own) + ' &times; ' + best_buy + ' for ' + makeImage('gold') + '$' + cost.SI() + (upkeep ? ' (Upkeep: $' + upkeep.SI() + ')' : '') + (buy_pref > data[best_buy].own ? ' [' + data[best_buy].own + '/' + buy_pref + ']' : ''));
		} else {
			Dashboard.status(this, 'Waiting for ' + makeImage('gold') + '$' + (this.runtime.cost + land_buffer - Bank.worth()).SI() + ' to buy ' + (buy - data[best_buy].own) + ' &times; ' + best_buy + ' for ' + makeImage('gold') + '$' + cost.SI());
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
	this._unflush();
	if (!this.data[item] || !this.data[item].id || !this.data[item].buy || !this.data[item].buy.length || !Bank.worth(this.runtime.cost)) {
		return true; // We (pretend?) we own them
	}
	if (!Generals.to(this.option.general ? 'cost' : 'any') || !Bank.retrieve(this.runtime.cost) || !Page.to('town_'+this.data[item].page)) {
		return false;
	}
	var qty = this.data[item].buy.lower(number);
	var $form = $('form#'+APPID_+'itemBuy_' + this.data[item].id);
	if ($form.length) {
		log(LOG_WARN, 'Buying ' + qty + ' x ' + item + ' for $' + (qty * Town.data[item].cost).addCommas());
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
	var qty = this.data[item].sell.lower(number);
	var $form = $('form#'+APPID_+'itemSell_' + this.data[item].id);
	if ($form.length) {
		log(LOG_WARN, 'Selling ' + qty + ' x ' + item + ' for $' + (qty * Town.data[item].cost / 2).addCommas());
		$('select[name="amount"]', $form).val(qty);
		Page.click($('input[name="Sell"]', $form));
	}
	this.set(['runtime','cost_incr'], 4);
	return false;
};

format_unit_str = function(name) {
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
		output.push('<div class="golem-panel">');
		output.push('<h3 class="golem-panel-header" style="width:auto;">');
		output.push(name);
		output.push('</h3>');
		output.push('<div class="golem-panel-content">');
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
			output.push(format_unit_str(units[i]));
			output.push('</div>');
		}
	}

	if (name) {
		output.push('</div></div>');
	}

	return output.join('');
};

Town.dashboard = function() {
	var lset = [], rset = [], generals = Generals.get(), best, tmp;

	// invade

	// prepare a short list of items being used
	tmp = {};
	for (i in this.data) {
	    if (this.data[i].use && this.data[i].use.invade_att) {
		tmp[i] = this.data[i];
	    }
	}

	lset.push('<div class="golem-panel">');
	lset.push('<h3 class="golem-panel-header" style="width:auto;">');
	lset.push('Invade - Attack');
	lset.push('</h3>');
	lset.push('<div class="golem-panel-content" style="padding:8px;">');
	lset.push(makeTownDash(generals, function(list, i, units) {
			if (units[i].own) {
				list.push(i);
			}
		}, 'att', 'invade', 'Heroes'));
	lset.push(makeTownDash(tmp, function(list, i, units) {
			if (units[i].page === 'soldiers') {
				list.push(i);
			}
		}, 'att', 'invade', 'Soldiers'));
	lset.push(makeTownDash(tmp, function(list, i, units) {
			if (units[i].type === 'Weapon') {
				list.push(i);
			}
		}, 'att', 'invade', 'Weapons'));
	lset.push(makeTownDash(tmp, function(list, i, units) {
			if (units[i].page === 'blacksmith' && units[i].type !== 'Weapon') {
				list.push(i);
			}
		}, 'att', 'invade', 'Equipment'));
	lset.push(makeTownDash(tmp, function(list, i, units) {
			if (units[i].page === 'magic') {
				list.push(i);
			}
		}, 'att', 'invade', 'Magic'));
	lset.push('</div></div>');

	// prepare a short list of items being used
	tmp = {};
	for (i in this.data) {
	    if (this.data[i].use && this.data[i].use.invade_def) {
		tmp[i] = this.data[i];
	    }
	}

	rset.push('<div class="golem-panel">');
	rset.push('<h3 class="golem-panel-header" style="width:auto;">');
	rset.push('Invade - Defend');
	rset.push('</h3>');
	rset.push('<div class="golem-panel-content" style="padding:8px;">');
	rset.push(makeTownDash(generals, function(list, i, units) {
			if (units[i].own) {
				list.push(i);
			}
		}, 'def', 'invade', 'Heroes'));
	rset.push(makeTownDash(tmp, function(list, i, units) {
			if (units[i].page === 'soldiers') {
				list.push(i);
			}
		}, 'def', 'invade', 'Soldiers'));
	rset.push(makeTownDash(tmp, function(list, i, units) {
			if (units[i].type === 'Weapon') {
				list.push(i);
			}
		}, 'def', 'invade', 'Weapons'));
	rset.push(makeTownDash(tmp, function(list, i, units) {
			if (units[i].page === 'blacksmith' && units[i].type !== 'Weapon') {
				list.push(i);
			}
		}, 'def', 'invade', 'Equipment'));
	rset.push(makeTownDash(tmp, function(list, i, units) {
			if (units[i].page === 'magic') {
				list.push(i);
			}
		}, 'def', 'invade', 'Magic'));
	rset.push('</div></div>');
	
	// duel

	// prepare a short list of items being used
	tmp = {};
	for (i in this.data) {
	    if (this.data[i].use && this.data[i].use.duel_att) {
		tmp[i] = this.data[i];
	    }
	}

	lset.push('<div class="golem-panel">');
	lset.push('<h3 class="golem-panel-header" style="width:auto;">');
	lset.push('Duel - Attack');
	lset.push('</h3>');
	lset.push('<div class="golem-panel-content" style="padding:8px;">');
	if ((best = Generals.best('duel')) !== 'any') {
		lset.push('<div style="height:25px;margin:1px;">');
		lset.push('<img src="' + imagepath + generals[best].img + '"');
		lset.push(' style="width:25px;height:25px;float:left;margin-right:4px;">');
		lset.push(format_unit_str(best));
		lset.push('</div>');
	}
	lset.push(makeTownDash(tmp, function(list, i, units) {
			if (units[i].page === 'blacksmith') {
				list.push(i);
			}
		}, 'att', 'duel'));
	lset.push(makeTownDash(tmp, function(list, i, units) {
			if (units[i].page === 'magic') {
				list.push(i);
			}
		}, 'att', 'duel'));
	lset.push('</div></div>');
	
	// prepare a short list of items being used
	tmp = {};
	for (i in this.data) {
	    if (this.data[i].use && this.data[i].use.duel_def) {
		tmp[i] = this.data[i];
	    }
	}

	rset.push('<div class="golem-panel">');
	rset.push('<h3 class="golem-panel-header" style="width:auto;">');
	rset.push('Duel - Defend');
	rset.push('</h3>');
	rset.push('<div class="golem-panel-content" style="padding:8px;">');
	if ((best = Generals.best('defend')) !== 'any') {
		rset.push('<div style="height:25px;margin:1px;">');
		rset.push('<img src="' + imagepath + generals[best].img + '"');
		rset.push(' style="width:25px;height:25px;float:left;margin-right:4px;">');
		rset.push(format_unit_str(best));
		rset.push('</div>');
	}
	rset.push(makeTownDash(tmp, function(list, i, units) {
			if (units[i].page === 'blacksmith') {
				list.push(i);
			}
		}, 'def', 'duel'));
	rset.push(makeTownDash(tmp, function(list, i, units) {
			if (units[i].page === 'magic') {
				list.push(i);
			}
		}, 'def', 'duel'));
	rset.push('</div></div>');

	// war

	// prepare a short list of items being used
	tmp = {};
	for (i in this.data) {
	    if (this.data[i].use && this.data[i].use.war_att) {
		tmp[i] = this.data[i];
	    }
	}

	lset.push('<div class="golem-panel">');
	lset.push('<h3 class="golem-panel-header" style="width:auto;">');
	lset.push('War - Attack');
	lset.push('</h3>');
	lset.push('<div class="golem-panel-content" style="padding:8px;">');
	lset.push(makeTownDash(generals, function(list, i, units) {
			if (units[i].own) {
				list.push(i);
			}
		}, 'att', 'war', 'Heroes', 6));
	lset.push(makeTownDash(tmp, function(list, i, units) {
			if (units[i].type === 'Weapon') {
				list.push(i);
			}
		}, 'att', 'war', 'Weapons'));
	lset.push(makeTownDash(tmp, function(list, i, units) {
			if (units[i].type === 'Shield') {
				list.push(i);
			}
		}, 'att', 'war', 'Shield'));
	lset.push(makeTownDash(tmp, function(list, i, units) {
			if (units[i].type === 'Armor') {
				list.push(i);
			}
		}, 'att', 'war', 'Armor'));
	lset.push(makeTownDash(tmp, function(list, i, units) {
			if (units[i].type === 'Helmet') {
				list.push(i);
			}
		}, 'att', 'war', 'Helmet'));
	lset.push(makeTownDash(tmp, function(list, i, units) {
			if (units[i].type === 'Amulet') {
				list.push(i);
			}
		}, 'att', 'war', 'Amulet'));
	lset.push(makeTownDash(tmp, function(list, i, units) {
			if (units[i].type === 'Gloves') {
				list.push(i);
			}
		}, 'att', 'war', 'Gloves'));
	lset.push(makeTownDash(tmp, function(list, i, units) {
			if (units[i].page === 'magic') {
				list.push(i);
			}
		}, 'att', 'war', 'Magic'));
	lset.push('</div></div>');

	// prepare a short list of items being used
	tmp = {};
	for (i in this.data) {
	    if (this.data[i].use && this.data[i].use.war_def) {
		tmp[i] = this.data[i];
	    }
	}

	rset.push('<div class="golem-panel">');
	rset.push('<h3 class="golem-panel-header" style="width:auto;">');
	rset.push('War - Defend');
	rset.push('</h3>');
	rset.push('<div class="golem-panel-content" style="padding:8px;">');
	rset.push(makeTownDash(generals, function(list, i, units) {
			if (units[i].own) {
				list.push(i);
			}
		}, 'def', 'war', 'Heroes', 6));
	rset.push(makeTownDash(tmp, function(list, i, units) {
			if (units[i].type === 'Weapon') {
				list.push(i);
			}
		}, 'def', 'war', 'Weapons'));
	rset.push(makeTownDash(tmp, function(list, i, units) {
			if (units[i].type === 'Shield') {
				list.push(i);
			}
		}, 'def', 'war', 'Shield'));
	rset.push(makeTownDash(tmp, function(list, i, units) {
			if (units[i].type === 'Armor') {
				list.push(i);
			}
		}, 'def', 'war', 'Armor'));
	rset.push(makeTownDash(tmp, function(list, i, units) {
			if (units[i].type === 'Helmet') {
				list.push(i);
			}
		}, 'def', 'war', 'Helmet'));
	rset.push(makeTownDash(tmp, function(list, i, units) {
			if (units[i].type === 'Amulet') {
				list.push(i);
			}
		}, 'def', 'war', 'Amulet'));
	rset.push(makeTownDash(tmp, function(list, i, units) {
			if (units[i].type === 'Gloves') {
				list.push(i);
			}
		}, 'def', 'war', 'Gloves'));
	rset.push(makeTownDash(tmp, function(list, i, units) {
			if (units[i].page === 'magic') {
				list.push(i);
			}
		}, 'def', 'war', 'Magic'));
	rset.push('</div></div>');
	
	// div wrappers

	lset.unshift('<div style="float:left;width:50%;">');
	lset.push('</div>');

	rset.unshift('<div style="float:left;width:50%;">');
	rset.push('</div>');

	$('#golem-dashboard-Town').html(lset.join('') + rset.join(''));
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

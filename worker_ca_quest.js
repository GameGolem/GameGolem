/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Workers, Config, Dashboard, Page, Resources,
	Alchemy, Bank, Generals, Idle, LevelUp, Monster, Player, Town,
	APP, APPID, APPID_, PREFIX, userID, imagepath,
	isRelease, version, revision, Images, window, browser,
	LOG_ERROR, LOG_WARN, LOG_LOG, LOG_INFO, LOG_DEBUG, log,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	isArray, isFunction, isNumber, isObject, isString, isWorker,
	tr, th, td, assert, isEvent
*/
/********** Worker.Quest **********
* Completes quests with a choice of general
*/
// Should also look for quests_quest but that should never be used unless there's a new area
var Quest = new Worker('Quest');

Quest.settings = {
	taint:true
};

Quest.defaults['castle_age'] = {
	pages:'quests_quest1 quests_quest2 quests_quest3 quests_quest4'
	  + ' quests_quest5 quests_quest6 quests_quest7 quests_quest8'
	  + ' quests_quest9 quests_quest10 quests_quest11 quests_quest12'
	  + ' quests_quest13 quests_quest14 quests_quest15 quests_quest16'
	  + ' quests_quest17'
	  + ' quests_demiquests quests_atlantis'
};

Quest.option = {
	general:true,
	general_choice:'any',
	what:'Advancement',
	unique:false,
	monster:'When able',
	bank:true,
	energy_reserve:0,
	diag:0
};

Quest.runtime = {
	page:null,
	best:null,
	energy:0
};

Quest.data = {
	id: {}
};

Quest.temp = {
	order: [],
	ilocked: {},
	iunlocked: {}
};

Quest.land = [
	'Land of Fire',
	'Land of Earth',
	'Land of Mist',
	'Land of Water',
	'Demon Realm',
	'Undead Realm',
	'Underworld',
	'Kingdom of Heaven',
	'Ivory City',
	'Earth II',
	'Water II',
	'Mist II',
	'Mist III',
	'Fire II',
	'Pangaea',
	'Perdition',
	'Land of Fire (IV)'
];
Quest.area = {quest:'Quests', demiquest:'Demi Quests', atlantis:'Atlantis'};
Quest.current = null;
Quest.display = [
	{
		id:'general',
		label:'Use Best General',
		checkbox:true
	},{
		advanced:true,
		id:'general_choice',
		label:'Use General',
		require:'!general',
		select:'generals'
	},{
		id:'energy_reserve',
		label:'Energy Reserve',
		select:'energy',
		help:'Keep this much energy in reserve for other workers.'
	},{
		id:'what',
		label:'Quest for',
		select:'quest_reward',
		help:'Cartigan will try to collect all items needed to summon Cartigan (via Alchemy), then cascades to Advancement.' +
		  ' Vampire Lord will try to collect 24 (for Calista), then cascades to Advancement.' +
		  ' Subquests (quick general levelling) will only run subquests under 100% influence, then cascades to Advancement.' +
		  ' Advancement will run viable quests to unlock all areas, then cascades to Influence.' +
		  ' Influence will run all viable influence gaining quests, then cascade to Experience.' +
		  ' Inf+Exp will run the best viable experience quests under 100% influence, then cascade to Experience.' +
		  ' Inf+Cash will run the best viable cash quests under 100% influence, then cascade to Cash.' +
		  ' Experience runs only the best experience quests.' +
		  ' Cash runs only the best cash quests.'
	},{
		id:'unique',
		label:'Get Unique Items First',
		checkbox:true
	},{
		id:'monster',
		label:'Fortify',
		select: ['Never','When able','Wait for']
	},{
		id:'bank',
		label:'Automatically Bank',
		checkbox:true
	},{
		advanced:true,
		id:'diag',
		require:'Debug.option.loglevel>=3',
		label:'Diagnostics level',
		select:{
			0:'None',
			1:'Light',
			2:'Medium',
			3:'Heavy'
		},
		help:'Normally should be set to "None" when not trying to diagnose a specific problem.'
		  + " When trying to determine why a particular quest is not chosen as you'd expect"
		  + ', you can try increasing the level and watching the results in the console logging.'
		  + ' Be sure to set back to "None" when you are done or it will quickly fill your console and may slow down your browser.'
	}
];

Quest.setup = function() {
	Resources.use('Energy');
};

Quest.init = function(old_revision, fresh) {
	var i, x, list;

	// BEGIN: Fix for *old* bad page loads
	for (i in this.data) {
		if (i.indexOf('\t') !== -1) {
			this.set(['data',i]);
		}
	}
	// END

	// BEGIN: Fix for option type changes
	if (this.option.monster === true) {
		this.set(['option','monster'], 'When able');
	} else if (this.option.monster === false) {
		this.set(['option','monster'], 'Never');
	}
	// END

	// BEGIN: one time pre-r845 fix for erroneous values in m_c, m_d, reps, eff
	if (old_revision < 845) {
		for (i in this.data) {
			if (this.data[i].reps) {
				x = this.wiki_reps(this.data[i], true);
				if (this.data[i].reps < Math.round(x * 0.8) || this.data[i].reps > Math.round(x * 1.2)) {
					log(LOG_WARN, 'Quest.init: deleting metrics for: ' + i);
					this.set(['data',i,'m_c']);
					this.set(['data',i,'m_d']);
					this.set(['data',i,'reps']);
					this.set(['data',i,'eff']);
				}
			}
		}
	}
	// END

	// BEGIN: one time pre-r850 fix to map data by id instead of name
	if (old_revision < 850) {
		this.set(['runtime','best'], null);
		this.set(['runtime','energy'], 0);
		this.set(['runtime','quest']);
		if (!this.data.hasOwnProperty('id') && this.data.hasOwnProperty('Pursuing Orcs')) {
			list = {};
			for (i in this.data) {
				if (i === 'id' || i === 'q') {
					continue;
				}
				if (this.data[i].hasOwnProperty('id')) {
					// map name indexed data to id indexed
					this.set(['data','id',this.data[i].id], this.data[i]);
					this.set(['data','id',this.data[i].id,'id']);
				} else {
					// map other data into a temporary holding pen
					this.set(['data','q',i], this.data[i]);
				}
				list[i] = true;
			}
			// removed old name indexed data
			for (i in list) {
				this.set(['data',i]);
			}
		}
	}
	// END

	// BEGIN: fix up "under level 4" generals
	if (old_revision <= 1100 && this.get(['option','general_choice']) === 'under level 4') {
		this.set('option.general_choice', 'under max level');
	}
	// END

	// BEGIN: No longer needed per-worker revision watching
	if (old_revision <= 1131) {
		this.set(['runtime','revision']);
	}
	// END

	// set up locked/unlocked image sets
	list = this.defaults['castle_age'].pages.split(/\s+/);
	this.temp.ilocked = {};
	this.temp.iunlocked = {};
	for (i = 0; i < list.length; i++) {
		if (isObject(x = Page.pageNames[list[i]]) && (x.locked || x.unlocked)) {
			if (x.image) {
				this.temp.iunlocked[x.image] = list[i];
			}
			if (x.unlocked) {
				this.temp.iunlocked[x.unlocked] = list[i];
			}
			if (x.locked) {
				this.temp.ilocked[x.locked] = list[i];
			}
		}
	}

//	this._watch(this, 'runtime.page');				// for stale pages
//	this._watch(this, 'runtime.best');				// for best quest
	this._watch(Player, 'data.energy');				// for available energy
	this._watch(Player, 'data.maxenergy');          // to aid Generals.test()
	this._watch(Player, 'data.stamina');            // to aid Generals.test()
	this._watch(Player, 'data.maxstamina');         // to aid Generals.test()
	this._watch(LevelUp, 'option._disabled');		// to detect when active
	this._watch(LevelUp, 'runtime.quest');			// for forced quest
	this._watch(LevelUp, 'runtime.force.energy');	// for forced energy
	this._watch(LevelUp, 'runtime.energy');			// for forced energy amount
	this._watch(LevelUp, 'runtime.general');		// for forced general
	this._watch(Alchemy, 'data.summons');			// for orbs
	this._watch(Alchemy, 'data.ingredients');		// for orbs/uniques
	this._watch(Monster, 'runtime.defending');		// for monster defense
	this._watch(Town, 'data');						// for quest prereqs
};

Quest.menu = function(worker, key) {
	if (worker === this) {
		if (!key) {
			return ['scan:Scan Quests at Idle'];
		} else if (key === 'scan') {
			Idle.set('temp.scan.quests', Date.now());
		}
	}
};

Quest.page = function(page, change) {
	var now = Date.now(), c, i, j, tmp, el, icon, quests,
		name, item, id, level, influence, reward, energy, exp, type, units,
		m_c, m_d, m_l, m_i, reps, purge = {},
		last_main = 0, area = null, land = null;

	if (page === 'quests_quest') {
		return false; // This is if we're looking at a page we don't have access to yet...
	} else if (page === 'quests_demiquests') {
		area = 'demiquest';
	} else if (page === 'quests_atlantis') {
		area = 'atlantis';
	} else {
		area = 'quest';
		land = page.regex(/quests_quest(\d+)/i) - 1;
	}

	// determine quest area lock state
	tmp = $('img[src]');
	for (i = 0; i < tmp.length; i++) {
		icon = tmp.eq(i).attr('src').filepart();
		if (isString(j = this.temp.ilocked[icon])) {
			// pretend we saw it far into the future
			Page.set(['data',j], Date.HUGE);
		} else if (isString(j = this.temp.iunlocked[icon])
		  && Page.get(['data',j]) === Date.HUGE
		) {
			// mark it as unseen, as it recently became unlocked
			Page.set(['data',j], 0);
		}
	}

	for (i in this.data.id) {
		j = this.get(['data','id',i]) || {};
		if (j.area === area && (area !== 'quest' || j.land === land)) {
			purge[i] = true;
		}
	}

	if ($('div.quests_background,div.quests_background_sub').length !== $('div.quests_background .quest_progress,div.quests_background_sub .quest_sub_progress').length) {
		// Force a page reload as we're pretty sure it's a bad page load!
		// Note: reloading in parse is bad, so mark it stale and scoot
		Page.setStale(page, now);
		//Page.to(page, '');
		return false;
	}

	quests = $('div.quests_background,div.quests_background_sub,div.quests_background_special');
	for (i=0; i<quests.length; i++) {
		el = quests[i];
		try {
			tmp = $('input[name="quest"]', el);
			if (!tmp.length || !tmp.val()) {
				continue;
			}
			assert(id = parseInt(tmp.val() || '0', 10), 'Bad quest id: '+tmp.val());
			this._transaction(); // BEGIN TRANSACTION
			delete purge[id]; // We've found it, and further errors shouldn't delete it
			name = undefined;
			type = undefined;
			level = undefined;
			influence = undefined;
			energy = undefined;
			exp = undefined;
			reward = undefined;
			if ($(el).hasClass('quests_background_sub')) { // Subquest
				name = $('.quest_sub_title', el).text().trim(true);
				assert((tmp = $('.qd_2_sub', el).text().replace(/\s+/gm, ' ').replace(/,/g, '').replace(/mil\b/gi, '000000')), 'Unknown rewards');
				exp = tmp.regex(/\b(\d+)\s*Exp\b/im);
				reward = tmp.regex(/\$\s*(\d+)\s*-\s*\$\s*(\d+)\b/im);
				energy = $('.quest_req_sub', el).text().regex(/\b(\d+)\s*Energy\b/im);
				tmp = $('.quest_sub_progress', el).text();
				level = tmp.regex(/\bLEVEL:?\s*(\d+)\b/im);
				influence = tmp.regex(/\bINFLUENCE:?\s*(\d+)%/im);
				type = 2;
			} else {
				name = $('.qd_1 b', el).text().trim(true);
				assert((tmp = $('.qd_2', el).text().replace(/\s+/gm, ' ').replace(/,/g, '').replace(/mil\b/gi, '000000')), 'Unknown rewards');
				exp = tmp.regex(/\b(\d+)\s*Exp\b/im);
				reward = tmp.regex(/\$\s*(\d+)\s*-\s*\$\s*(\d+)\b/im);
				energy = $('.quest_req', el).text().regex(/\b(\d+)\s*Energy\b/im);
				if ($(el).hasClass('quests_background')) { // Main quest
					last_main = id;
					tmp = $('.quest_progress', el).text();
					level = tmp.regex(/\bLEVEL:?\s*(\d+)\b/im);
					influence = tmp.regex(/\bINFLUENCE:?\s*(\d+)%/im);
					type = 1;
				} else { // Special / boss Quest
					type = 3;
				}
			}
			assert(name && name.indexOf('\t') === -1, 'Bad quest name - found tab character');
			this.set(['data','id',id,'button_fail'], 0);
			assert(this.set(['data','id',id,'name'], name, 'string'), 'Bad quest name: '+name);
			assert(this.set(['data','id',id,'area'], area, 'string'), 'Bad area name: '+area);
			assert(this.set(['data','id',id,'type'], type, 'number'), 'Unknown quest type: '+name);
			assert(this.set(['data','id',id,'exp'], exp, 'number'), 'Unknown exp reward');
			assert(this.set(['data','id',id,'reward'], (reward[0] + reward[1]) / 2), 'Bad money reward');
			this.set(['data','id',id,'energy'], energy);
			this.set(['data','id',id,'land'], isNumber(land) ? land : undefined);
			this.set(['data','id',id,'main'], type === 2 && last_main ? last_main : undefined);
			if (isNumber(influence)) {
				m_l = this.get(['data','id',id,'level'], 0, 'number'); // last influence value
				m_i = this.get(['data','id',id,'influence'], 0, 'number'); // last influence value
				this.set(['data','id',id,'level'], level || 0);
				this.set(['data','id',id,'influence'], influence);
				m_c = this.get(['data','id',id,'m_c'], 0, 'number'); // percentage count metric
				m_d = this.get(['data','id',id,'m_d'], 0, 'number'); // percentage delta metric
				reps = this.get(['data','id',id,'reps'], 0, 'number'); // average reps needed per level
				if (m_l === (level || 0) && m_i < influence && influence < 100) {
					m_d += influence - m_i;
					m_c++;
				}
				if (m_c && m_d) {
					this.set(['data','id',id,'m_c'], m_c);
					this.set(['data','id',id,'m_d'], m_d);
					reps = Math.ceil(m_c * 100 / m_d);
				}
				if (reps) {
					this.set(['data','id',id,'reps'], reps);
					this.set(['data','id',id,'eff'], energy * reps);
				}
			} else {
				this.set(['data','id',id,'level']);
			}
			if (type !== 2) { // That's everything for subquests
				this.set(['data','id',id,'unique'], type === 3 ? true : undefined); // Special / boss quests create unique items
				tmp = $('.qd_1 img', el).last();
				if (tmp.length && (item = tmp.attr('title'))) {
					item = item.trim(true);
					icon = (tmp.attr('src') || '').filepart();
					item = Town.qualify(item, icon);
					this.set(['data','id',id,'item'], item);
					this.set(['data','id',id,'itemimg'], icon);
					Alchemy.set(['data','source',icon,'quest',id], energy);
				}
				units = $('.quest_req >div >div >div', el);
				for (j=0; j<units.length; j++) {
					item = ($('img', units[j]).attr('title') || '').trim(true);
					icon = ($('img', units[j]).attr('src') || '').filepart();
					c = ($(units[j]).text() || '').regex(/\bx\s*(\d+)\b/im);
					item = Town.qualify(item, icon);
					this.set(['data','id',id,'units',item], c);
				}
				tmp = $('.quest_act_gen img', el).attr('title');
				this.set(['data','id',id,'general'], tmp || undefined);
			}
			this._transaction(true); // COMMIT TRANSACTION
		} catch(e) {
			this._transaction(false); // ROLLBACK TRANSACTION on any error
			log(e, e.name + ' in ' + this.name + '.page(' + page + ', ' + change + '): ' + e.message);
		}
	}
	for (i in purge) {
		j = this.get(['data','id',i]) || {};
		log(LOG_WARN, 'Deleting ' + i + '(' + (this.land[j.land] || j.area) + ')');
		this.set(['data','id',i]); // Delete unseen quests...
	}
	return false;
};

  // watch specific Generals if doing an alchemy quest giving a general
  // watch specific Town if doing an alchemy quest giving an item/unit
  // watch Generals if we passed up a preferred quest due to a missing req.
  // watch Town if we passed up a preferred quest due to a missing req.

Quest.update = function(event, events) {
	var now = Date.now(), i, s, x, oi, ob, ok, levelup, best,
		list, items, unit, usable_energy,
		energy = Player.get('energy', 0, 'number'),
		maxenergy = Player.get('maxenergy', 1e9, 'number'),
		diag = this.option.diag || 0;

	//log(LOG_INFO, '# events: ' + JSON.shallow(events,2));

	// First let's update the Quest dropdown list(s)...
	if (events.findEvent(this, 'init') || events.findEvent(this, 'data')) {
		list = [];
		items = {};

		for (i in this.data.id) {
			oi = this.get(['data','id',i]);
			if (oi.item && oi.type !== 3) {
				list.push(oi.item);
			}
			for (unit in oi.units) {
				if ((oi.units[unit] || 0) > 999) {
					log(LOG_WARN, '# Bad units: ' + JSON.shallow(oi, 3));
				}
				items[unit] = Math.max(items[unit] || 0, oi.units[unit]);
			}
		}

		Config.set('quest_reward', [
			'Nothing',
			'Cartigan',
			'Vampire Lord',
			'Subquests',
			'Advancement',
			'Influence',
			'Inf+Exp',
			'Experience',
			'Inf+Cash',
			'Cash'
		].concat(list.unique().sort()));

		for (unit in items) {
			Resources.set(['data', '_'+unit, 'quest'], items[unit]);
		}
	}

	// check that we've seen all available pages at least once
	list = this.defaults['castle_age'].pages.split(/\s+/);
	ok = true;
	this.set(['runtime','page'], null);
	for (i = 0; i < list.length; i++) {
		if (list[i] !== 'quests_quest' // old placebo, just in case...
		  && /^quests_/.test(list[i])
		  && !Page.get(list[i])
		) {
			this.set(['runtime','best'], null);
			this.set(['runtime','energy'], 0);
			this.set(['runtime','page'], list[i]);
			ok = false;
			break;
		}
	}
	if (ok && !Page.get(i = 'keep_alchemy')) {
		this.set(['runtime','best'], null);
		this.set(['runtime','energy'], 0);
		this.set(['runtime','page'], list[i]);
		ok = false;
	}

	best = this.runtime.best;

	if (!LevelUp.option._disabled && LevelUp.get(['runtime','levelup'])) {
		levelup = true;
	}

	if (levelup && (i = LevelUp.get(['runtime','quest']))) {
		// Only override if it has an actual quest for us
		best = i;
	} else if (ok) {
		// see if there's a reason to recalc the best quest
		if (best) {
			ok = false;
			for (i = 0; i < events.length; i++) {
				if (isEvent(events[i], this, 'runtime')
				  || isEvent(events[i], this, 'temp')
				) {
					// just our own tinkering here, so we don't need to recalc
					continue;
				} else {
					ok = true;
					break;
				}
			}
		}

		best = this.getBest(this.option.what, maxenergy);
	}

	if (best !== this.runtime.best) {
		this.set(['runtime','best'], best);
		if (best) {
			oi = this.get(['data','id',best]);
			this.set(['runtime','energy'], oi.energy);
			log(LOG_INFO, 'Wanting to perform - ' + oi.name
			  + ' in ' + (isNumber(oi.land) ? this.land[oi.land] : this.area[oi.area])
			  + ', energy ' + oi.energy
			  + ', exp ' + oi.exp
			  + ', $' + oi.reward.SI()
			  + (oi.general ? ', general ' + oi.general : '')
			);
		}
	}

	s = undefined;
	if (best && (oi = this.get(['data','id',best]))) {
		s = '';
		if (isNumber(oi.land)) {
			s += this.land[oi.land];
		} else {
			s += this.area[oi.area];
		}
		s += ': ' + oi.name;
		s += ' (' + Config.makeImage('energy', 'Energy') + oi.energy;
		s += ' = ' + Config.makeImage('exp', 'Experience') + oi.exp;
		s += ' + ' + Config.makeImage('gold', 'Gold') + '$' + oi.reward.SI();
		if (oi.item) {
			if ((i = oi.itemimg) || (i = Town.get([oi.item,'img']))) {
				s += ' + <img style="width:16px;height:16px;margin-bottom:-4px;"';
				s += ' src="' + imagepath + i + '"';
				s += ' title="' + oi.item + '"> ';
			} else {
				s += ' + ' + oi.item;
			}
		}
		if (isNumber(i = oi.influence) && i < 100) {
			s += ' @ ' + Config.makeImage('percent', 'Influence') + i + '%';
		}
		s += ')';
	}
	Dashboard.status(this, s);

	/*
	this.set(['option','_sleep'], !best
	  || p.energy > (LevelUp.get('runtime.force.energy') ? LevelUp.get('runtime.energy', 0) : LevelUp.get('runtime.energy', 0) - this.option.energy_reserve)
	  || (!LevelUp.runtime.levelup
	  && ((this.option.monster === 'When able' && Monster.get('runtime.defending'))
	  || (this.option.monster === 'Wait for' && (Monster.get('runtime.defending') || !LevelUp.get('runtime.force.energy'))))));
	*/

	if (!LevelUp.option._disabled
	  && (i = LevelUp.get('runtime.force.energy', 0))
	) {
		usable_energy = LevelUp.get('runtime.energy');
	} else if (this.option.monster === 'When able'
	  && Monster.get('runtime.defending')
	) {
		usable_energy = 0;
	} else if (this.option.monster !== 'Wait for') {
		usable_energy = Math.max(0, energy - Math.max(0, this.option.energy_reserve));
	}

	this.set(['option','_sleep'],
	  ok
	  && !this.runtime.page
	  && (!this.runtime.best
	  || this.get('runtime.energy', 1e9, 'number') > usable_energy)
	);

	/*
	best = this.get('runtime.best', 0, 'number');
	log(LOG_INFO, '# sleep ' + this.option._sleep
	  + ', ok ' + ok
	  + ', best ' + best
	  + (best ? this.get('runtime.energy', 1e99, 'number') + ' ('+this.get(['id',best,'name'])+')' : '')
	  + ', energy(' + this.runtime.energy + ')'
	  + ' > usable_energy(' + usable_energy + ')'
	);
	*/

	return true;
};

Quest.getBest = function(goal, maxenergy) {
	var g, i, x, oi, ob, cmp, eff, own, need, unit, noCanDo, ok,
		has_cartigan, has_vampire, forced_general, badgens = {},
		best, best_cartigan, best_vampire, best_subquest, best_advancement,
		best_influence, best_experience, best_land, best_unique,
		best_adv_eff, best_inf_eff,
		general = Player.get('general'),
		diag = this.option.diag || 0;

	best = null;
	best_unique = null;
	best_cartigan = null;
	best_vampire = null;
	best_subquest = null;
	best_advancement = null;
	best_influence = null;
	best_experience = null;
	best_land = 0;
	best_adv_eff = 1e10;
	best_inf_eff = 1e10;
	has_cartigan = false;
	has_vampire = false;

	if (!best && (goal !== 'Nothing' || this.option.unique)) {
		if (diag) {
			log(LOG_INFO, '# -----[ determining best ' + goal + ' quest ]-----');
		}

		if (goal !== 'Vampire Lord'
		  || Town.get(['Vampire Lord', 'own'], 0, 'number') >= 24
		) {
			// Stop trying once we've got the required number of Vampire Lords
			has_vampire = true;
		}

		if (goal !== 'Cartigan'
		  || Generals.get(['data','Cartigan','own'], 0, 'number')
		  || (Alchemy.get(['ingredients', 'eq_underworld_sword.jpg'], 0, 'number') >= 3
		  && Alchemy.get(['ingredients', 'eq_underworld_amulet.jpg'], 0, 'number') >= 3
		  && Alchemy.get(['ingredients', 'eq_underworld_gauntlet.jpg'], 0, 'number') >= 3)
		) {
			// Sword of the Faithless x3 - The Long Path, Burning Gates
			// Crystal of Lament x3 - Fiery Awakening
			// Soul Eater x3 - Fire and Brimstone, Deathrune Castle
			has_cartigan = true; // Stop trying once we've got the general or the ingredients
		}

		for (i in this.data.id) {
			oi = this.get(['data','id',i]);

			// Skip quests we can't afford or can't equip the general for
			x = 'any';
			if (oi.energy > maxenergy) {
				if (diag >= 3) {
					log(LOG_INFO, '# skipping ' + i + ':' + oi.name
					  + ' in ' + (isNumber(oi.land) ? this.land[oi.land] : this.area[oi.area])
					  + ' due to energy ' + oi.energy + ' > ' + maxenergy
					);
				}
				continue;
			}

			// Check that we have all the prerequisites
			if (oi.units) {
				own = 0;
				need = 0;
				noCanDo = false;
				for (unit in oi.units) {
					need = oi.units[unit];
					if (!Player.get(['data','artifact', i]) || need !== 1) {
						own = Town.get([unit, 'own'], 0, 'number');
						if (need > own) {	// Need more than we own, skip this quest.
							if (diag >= 2) {
								log(LOG_INFO, '# skipping ' + i + ':' + oi.name
								  + ' in ' + (isNumber(oi.land) ? this.land[oi.land] : this.area[oi.area])
								  + ' due to missing '
								  + (need - own) + '/' + need + ' ' + unit
								);
							}
							noCanDo = true;	// set flag
							break;	// no need to check more prerequisites.
						}
					}
				}
				if (noCanDo) {
					continue;	// Skip to the next quest in the list
				}
			}

			// effort = energy * quest reps per influence level
			eff = oi.eff || (oi.energy * this.wiki_reps(oi));
			if (0 < (oi.influence || 0) && (oi.influence || 0) < 100) {
				eff = Math.ceil(eff * (100 - oi.influence) / 100);
			}

			if (this.option.unique) {
				ob = this.get(['data','id',best_unique]);
				if (oi.type === 3
				  && (!best_unique || oi.energy < ob.energy)
				  && !Alchemy.get(['ingredients',oi.itemimg], 0, 'number')
				) {
					best_unique = i;
				}
			}

			// try to limit how often we look these up
			// once per possibly useful general should be all we need
			if (isNumber(oi.influence) && oi.influence < 100
			  && (x = oi.general) && !badgens.hasOwnProperty(x)
			) {
				badgens[x] = !Generals.test(x);
			}

			// Automatically fallback on type - but without changing options
			switch (goal) {
			case 'Vampire Lord': // Main quests or last subquest (can't check) in Undead Realm
				ob = this.get(['data','id',best_vampire]);
				// order: inf<100, <energy, >exp, >cash (vampire)
				ok = false;
				if (!has_vampire && oi.land === 5 && oi.type === 1) {
					ok = true;
				} else if (diag >= 3) {
					log(LOG_INFO, '# failed vampire reqs ' + i + ':' + oi.name);
				}
				if (ok && (!best_vampire
				  || (cmp = (isNumber(oi.influence) && oi.influence < 100 && !badgens[oi.general] ? 1 : 0) - (isNumber(ob.influence) && ob.influence < 100 && !badgens[ob.general] ? 1 : 0)) > 0
				  || (!cmp && (cmp = oi.energy - ob.energy) < 0)
				  || (!cmp && (cmp = (oi.exp / oi.energy) - (ob.exp / ob.energy)) > 0)
				  || (!cmp && (cmp = (oi.reward / oi.energy) - (ob.reward / ob.energy)) > 0))
				) {
					if (diag) {
						log(LOG_INFO, '# best vampire ' + i + ':' + oi.name
						  + ' in ' + (isNumber(oi.land) ? this.land[oi.land] : this.area[oi.area])
						  + ' > ' + best_vampire
						);
					}
					best_vampire = i;
				} else if (ok && diag >= 3) {
					log(LOG_INFO, '# skipping vampire ' + i + ':' + oi.name
					  + ' in ' + (isNumber(oi.land) ? this.land[oi.land] : this.area[oi.area])
					);
				}
				// Deliberate fallthrough
			case 'Cartigan': // Random Encounters in various Underworld Quests
				ob = this.get(['data','id',best_cartigan]);
				// order: inf<100, <energy, >exp, >cash (cartigan)
				ok = false;
				x = this.get(['data','id',oi.main || i,'name']);
				if (!has_cartigan && oi.land === 6
				  && (((x === 'The Long Path' || x === 'Burning Gates') && Alchemy.get(['ingredients', 'eq_underworld_sword.jpg'], 0, 'number') < 3)
				  || ((x === 'Fiery Awakening') && Alchemy.get(['ingredients', 'eq_underworld_amulet.jpg'], 0, 'number') < 3)
				  || ((x === 'Fire and Brimstone' || x === 'Deathrune Castle') && Alchemy.get(['ingredients', 'eq_underworld_gauntlet.jpg'], 0, 'number') < 3))
				) {
					ok = true;
				} else if (diag >= 3) {
					log(LOG_INFO, '# failed cartigan reqs ' + i + ':' + oi.name);
				}
				if (ok && (!best_cartigan
				  || (cmp = (isNumber(oi.influence) && oi.influence < 100 && !badgens[oi.general] ? 1 : 0) - (isNumber(ob.influence) && ob.influence < 100 && !badgens[ob.general] ? 1 : 0)) > 0
				  || (!cmp && (cmp = oi.energy - ob.energy) < 0)
				  || (!cmp && (cmp = (oi.exp / oi.energy) - (ob.exp / ob.energy)) > 0)
				  || (!cmp && (cmp = (oi.reward / oi.energy) - (ob.reward / ob.energy)) > 0))
				) {
					if (diag) {
						log(LOG_INFO, '# best cartigan ' + i + ':' + oi.name
						  + ' in ' + (isNumber(oi.land) ? this.land[oi.land] : this.area[oi.area])
						  + ' > ' + best_cartigan
						);
					}
					best_cartigan = i;
				} else if (ok && diag >= 3) {
					log(LOG_INFO, '# skipping cartigan ' + i + ':' + oi.name
					  + ' in ' + (isNumber(oi.land) ? this.land[oi.land] : this.area[oi.area])
					);
				}
				// Deliberate fallthrough
			case 'Subquests': // Find the cheapest energy cost *sub*quest with influence under 100%
				ob = this.get(['data','id',best_subquest]);
				// order: <energy, >exp, >cash (subquests)
				ok = false;
				g = true;
				if (oi.type === 2 && (g = isNumber(oi.influence) && oi.influence < 100 && !badgens[oi.general])) {
					ok = true;
				} else if (!g && badgens[oi.general]) {
					if (diag >= 2) {
						log(LOG_INFO, '# failed subquest reqs ' + i + ':' + oi.name
						  + ' in ' + (isNumber(oi.land) ? this.land[oi.land] : this.area[oi.area])
						  + ' due to resource issues swapping generals'
						  + ' (' + general + ' to ' + oi.general + ')'
						);
					}
				} else if (diag >= 3) {
					log(LOG_INFO, '# failed subquest reqs ' + i + ':' + oi.name);
				}
				if (ok && (!best_subquest
				  || (cmp = oi.energy - ob.energy) < 0
				  || (!cmp && (cmp = (oi.exp / oi.energy) - (ob.exp / ob.energy)) > 0)
				  || (!cmp && (cmp = (oi.reward / oi.energy) - (ob.reward / ob.energy)) > 0))
				) {
					if (diag) {
						log(LOG_INFO, '# best subquest ' + i + ':' + oi.name
						  + ' in ' + (isNumber(oi.land) ? this.land[oi.land] : this.area[oi.area])
						  + ' > ' + best_cartigan
						);
					}
					best_subquest = i;
				} else if (ok && diag >= 3) {
					log(LOG_INFO, '# skipping subquest ' + i + ':' + oi.name
					  + ' in ' + (isNumber(oi.land) ? this.land[oi.land] : this.area[oi.area])
					);
				}
				// Deliberate fallthrough
			case 'Advancement': // Complete all required main / boss quests in an area to unlock the next one (type === 2 means subquest)
				// No need to revisit old lands - leave them to Influence
				if (isNumber(oi.land) && oi.land > best_land) {
					if (diag && best_advancement) {
						ob = this.get(['data','id',best_advancement]);
						log(LOG_INFO, '# found a higher land ' + this.land[oi.land]
						  + ', skipping advancement ' + best_advancement + ':' + ob.name
						  + ' in ' + (isNumber(ob.land) ? this.land[ob.land] : this.area[ob.area])
						);
					}
					best_land = oi.land;
					best_advancement = null;
					best_adv_eff = 1e10;
				}
				ob = this.get(['data','id',best_advancement]);
				// order: <effort, >exp, >cash, <energy (advancement)
				ok = false;
				g = true;
				if (oi.type !== 2 && isNumber(oi.land)
				  //&& oi.level === 1 // Need to check if necessary to do boss to unlock next land without requiring orb
				  && oi.land >= best_land
				  && ((oi.level <= 1 && (g = isNumber(oi.influence) && oi.influence < 100 && !badgens[oi.general]))
				  || (oi.type === 3 && Alchemy.get(['summons',oi.itemimg]) && !Alchemy.get(['ingredients',oi.itemimg], 0, 'number')))
				) {
					if (diag) {
						log(LOG_INFO, '# artifact ' + oi.item
						  + ' [' + oi.itemimg + '] = '
						  + JSON.shallow(Alchemy.get(['ingredients',oi.itemimg]),2)
						);
					}
					ok = true;
				} else if (!g && badgens[oi.general]) {
					if (diag >= 2) {
						log(LOG_INFO, '# failed advancement reqs ' + i + ':' + oi.name
						  + ' in ' + (isNumber(oi.land) ? this.land[oi.land] : this.area[oi.area])
						  + ' due to resource issues swapping generals'
						  + ' (' + general + ' to ' + oi.general + ')'
						);
					}
				} else if (diag >= 3) {
					log(LOG_INFO, '# failed advancement reqs ' + i + ':' + oi.name);
				}
				if (ok && (!best_advancement
				  || (cmp = eff - best_adv_eff) < 0
				  || (!cmp && (cmp = (oi.exp / oi.energy) - (ob.exp / ob.energy)) > 0)
				  || (!cmp && (cmp = (oi.reward / oi.energy) - (ob.reward / ob.energy)) > 0)
				  || (!cmp && (cmp = oi.energy - ob.energy) < 0))
				) {
					if (diag) {
						log(LOG_INFO, '# best advancement ' + i + ':' + oi.name
						  + ' in ' + (isNumber(oi.land) ? this.land[oi.land] : this.area[oi.area])
						  + ' > ' + best_advancement
						);
					}
					best_land = Math.max(best_land, oi.land);
					best_advancement = i;
					best_adv_eff = eff;
				} else if (ok && diag >= 3) {
					log(LOG_INFO, '# skipping advancement ' + i + ':' + oi.name
					  + ' in ' + (isNumber(oi.land) ? this.land[oi.land] : this.area[oi.area])
					);
				}
				// Deliberate fallthrough
			case 'Influence': // Find the cheapest energy cost quest with influence under 100%
				ob = this.get(['data','id',best_influence]);
				// order: <effort, >exp, >cash, <energy (influence)
				ok = false;
				if (isNumber(oi.influence) && oi.influence < 100 && !badgens[oi.general]) {
					ok = true;
				} else if (badgens[oi.general]) {
					if (diag >= 2) {
						log(LOG_INFO, '# failed influence reqs ' + i + ':' + oi.name
						  + ' in ' + (isNumber(oi.land) ? this.land[oi.land] : this.area[oi.area])
						  + ' due to resource issues swapping generals'
						  + ' (' + general + ' to ' + oi.general + ')'
						);
					}
				} else if (diag >= 3) {
					log(LOG_INFO, '# failed influence reqs ' + i + ':' + oi.name);
				}
				if (ok && (!best_influence
				  || (cmp = eff - best_inf_eff) < 0
				  || (!cmp && (cmp = (oi.exp / oi.energy) - (ob.exp / ob.energy)) > 0)
				  || (!cmp && (cmp = (oi.reward / oi.energy) - (ob.reward / ob.energy)) > 0)
				  || (!cmp && (cmp = oi.energy - ob.energy) < 0))
				) {
					if (diag) {
						log(LOG_INFO, '# best influence ' + i + ':' + oi.name
						  + ' in ' + (isNumber(oi.land) ? this.land[oi.land] : this.area[oi.area])
						  + ' > ' + best_influence
						);
					}
					best_influence = i;
					best_inf_eff = eff;
				} else if (ok && diag >= 3) {
					log(LOG_INFO, '# skipping influence ' + i + ':' + oi.name
					  + ' in ' + (isNumber(oi.land) ? this.land[oi.land] : this.area[oi.area])
					);
				}
				// Deliberate fallthrough
			case 'Experience': // Find the best exp per energy quest
				ob = this.get(['data','id',best_experience]);
				// order: >exp, inf<100, >cash, <energy (experience)
				if (!best_experience
				  || (cmp = (oi.exp / oi.energy) - (ob.exp / ob.energy)) > 0
				  || (!cmp && (cmp = (isNumber(oi.influence) && oi.influence < 100 && !badgens[oi.general] ? 1 : 0) - (isNumber(ob.influence) && ob.influence < 100 && !badgens[ob.general] ? 1 : 0)) > 0)
				  || (!cmp && (cmp = (oi.reward / oi.energy) - (ob.reward / ob.energy)) > 0)
				  || (!cmp && (cmp = oi.energy - ob.energy) < 0)
				) {
					if (diag) {
						log(LOG_INFO, '# best experience ' + i + ':' + oi.name
						  + ' in ' + (isNumber(oi.land) ? this.land[oi.land] : this.area[oi.area])
						  + ' > ' + best_experience
						);
					}
					best_experience = i;
				} else if (diag >= 3) {
					log(LOG_INFO, '# skipping experience ' + i + ':' + oi.name
					  + ' in ' + (isNumber(oi.land) ? this.land[oi.land] : this.area[oi.area])
					);
				}
				break;
			case 'Inf+Exp': // Find the best exp per energy quest, favouring quests needing influence
				ob = this.get(['data','id',best_experience]);
				// order: inf<100, >exp, >cash, <energy (inf+exp)
				if (!best_experience
				  || (cmp = (isNumber(oi.influence) && oi.influence < 100 && !badgens[oi.general] ? 1 : 0) - (isNumber(ob.influence) && ob.influence < 100 && !badgens[ob.general] ? 1 : 0)) > 0
				  || (!cmp && (cmp = (oi.exp / oi.energy) - (ob.exp / ob.energy)) > 0)
				  || (!cmp && (cmp = (oi.reward / oi.energy) - (ob.reward / ob.energy)) > 0)
				  || (!cmp && (cmp = oi.energy - ob.energy) < 0)
				) {
					if (diag) {
						log(LOG_INFO, '# best inf+exp ' + i + ':' + oi.name
						  + ' in ' + (isNumber(oi.land) ? this.land[oi.land] : this.area[oi.area])
						  + ' > ' + best_experience
						);
					}
					best_experience = i;
				} else if (diag >= 3) {
					log(LOG_INFO, '# skipping inf+exp ' + i + ':' + oi.name
					  + ' in ' + (isNumber(oi.land) ? this.land[oi.land] : this.area[oi.area])
					);
				}
				break;
			case 'Inf+Cash': // Find the best (average) cash per energy quest, favouring quests needing influence
				ob = this.get(['data','id',best]);
				// order: inf<100, >cash, >exp, <energy (inf+cash)
				if (!best
				  || (cmp = (isNumber(oi.influence) && oi.influence < 100 && !badgens[oi.general] ? 1 : 0) - (isNumber(ob.influence) && ob.influence < 100 && !badgens[ob.general] ? 1 : 0)) > 0
				  || (!cmp && (cmp = (oi.reward / oi.energy) - (ob.reward / ob.energy)) > 0)
				  || (!cmp && (cmp = (oi.exp / oi.energy) - (ob.exp / ob.energy)) > 0)
				  || (!cmp && (cmp = oi.energy - ob.energy) < 0)
				) {
					if (diag) {
						log(LOG_INFO, '# best inf+cash ' + i + ':' + oi.name
						  + ' in ' + (isNumber(oi.land) ? this.land[oi.land] : this.area[oi.area])
						  + ' > ' + best
						);
					}
					best = i;
				} else if (diag >= 3) {
					log(LOG_INFO, '# skipping inf+cash ' + i + ':' + oi.name
					  + ' in ' + (isNumber(oi.land) ? this.land[oi.land] : this.area[oi.area])
					);
				}
				break;
			case 'Cash': // Find the best (average) cash per energy quest
				ob = this.get(['data','id',best]);
				// order: >cash, inf<100, >exp, <energy (cash)
				if (!best
				  || (cmp = (oi.reward / oi.energy) - (ob.reward / ob.energy)) > 0
				  || (!cmp && (cmp = (isNumber(oi.influence) && oi.influence < 100 && !badgens[oi.general] ? 1 : 0) - (isNumber(ob.influence) && ob.influence < 100 && !badgens[ob.general] ? 1 : 0)) > 0)
				  || (!cmp && (cmp = (oi.exp / oi.energy) - (ob.exp / ob.energy)) > 0)
				  || (!cmp && (cmp = oi.energy - ob.energy) < 0)
				) {
					if (diag) {
						log(LOG_INFO, '# best cash ' + i + ':' + oi.name
						  + ' in ' + (isNumber(oi.land) ? this.land[oi.land] : this.area[oi.area])
						  + ' > ' + best
						);
					}
					best = i;
				} else if (diag >= 3) {
					log(LOG_INFO, '# skipping cash ' + i + ':' + oi.name
					  + ' in ' + (isNumber(oi.land) ? this.land[oi.land] : this.area[oi.area])
					);
				}
				break;
			default: // For everything else, there's (cheap energy) items...
				ob = this.get(['data','id',best]);
				// order: <energy, inf<100, >exp, >cash (item)
				ok = false;
				if (oi.item === goal) {
					ok = true;
				} else if (diag >= 3) {
					log(LOG_INFO, '# failed ['+goal+'] reqs ' + i + ':' + oi.name);
				}
				if (ok && (!best
				  || (cmp = oi.energy - ob.energy) < 0
				  || (!cmp && (cmp = (isNumber(oi.influence) && oi.influence < 100 && !badgens[oi.general] ? 1 : 0) - (isNumber(ob.influence) && ob.influence < 100 && !badgens[ob.general] ? 1 : 0)) > 0)
				  || (!cmp && (cmp = (oi.exp / oi.energy) - (ob.exp / ob.energy)) > 0)
				  || (!cmp && (cmp = (oi.reward / oi.energy) - (ob.reward / ob.energy)) > 0))
				) {
					if (diag) {
						log(LOG_INFO, '# best default ' + i + ':' + oi.name
						  + ' in ' + (isNumber(oi.land) ? this.land[oi.land] : this.area[oi.area])
						  + ' > ' + best
						);
					}
					best = i;
				} else if (ok && diag >= 3) {
					log(LOG_INFO, '# skipping default ' + i + ':' + oi.name
					  + ' in ' + (isNumber(oi.land) ? this.land[oi.land] : this.area[oi.area])
					);
				}
				break;
			}
		}

		if (diag) {
			log(LOG_INFO, '# bests'
			  + (best_unique ? ' | unique ' + best_unique + ':' + this.data.id[best_unique].name : '')
			  + (best_vampire ? ' | vampire ' + best_vampire + ':' + this.data.id[best_vampire].name : '')
			  + (best_cartigan ? ' | cartigan ' + best_cartigan + ':' + this.data.id[best_cartigan].name : '')
			  + (best_subquest ? ' | subquest ' + best_subquest + ':' + this.data.id[best_subquest].name : '')
			  + (best_advancement ? ' | advancement ' + best_advancement + ':' + this.data.id[best_advancement].name : '')
			  + (best_influence ? ' | influence ' + best_influence + ':' + this.data.id[best_influence].name : '')
			  + (best_experience ? ' | experience ' + best_experience + ':' + this.data.id[best_experience].name : '')
			  + (best ? ' | other ' + best + ':' + this.data.id[best].name : '')
			);
		}

		// Automatically fallback on type - but without changing options
		switch (goal) {
		case 'Vampire Lord':
			best = best_unique || best_vampire || best_advancement || best_influence || best_experience;
			break;
		case 'Cartigan':
			best = best_unique || best_cartigan || best_advancement || best_influence || best_experience;
			break;
		case 'Subquests':
			best = best_unique || best_subquest || best_advancement || best_influence || best_experience;
			break;
		case 'Advancement':
			best = best_unique || best_advancement || best_influence || best_experience;
			break;
		case 'Influence':
			best = best_unique || best_influence || best_experience;
			break;
		case 'Inf+Exp':
			best = best_unique || best_experience;
			break;
		case 'Experience':
			best = best_unique || best_experience;
			break;
		}

		if (diag) {
			ob = this.get(['data','id',best]);
			log(LOG_INFO, '# best pick ' + best + ':' + ob.name
			  + ' in ' + (isNumber(ob.land) ? this.land[ob.land] : this.area[ob.area])
			);
		}
	}

	return best;
};

Quest.work = function(state) {
	var i, quest, page, button,
		best = this.runtime.best,
		general = 'any',
		energy = Player.get('energy');

	// Only override if it has an actual quest for us
	if (!LevelUp.option._disabled
	  && LevelUp.get(['runtime','levelup'])
	  && (i = LevelUp.get(['runtime','quest']))
	) {
		best = i;
		// assume levelup already ensured this general wasn't wasteful
		if ((i = LevelUp.get('runtime.general')) /*&& !Generals.test(i)*/) {
			general = i;
		}
	}

	if (!best && (i = this.runtime.page) && (!state || !Page.to(i))) {
		return QUEUE_CONTINUE;
	}

	if (!best || !(quest = this.get(['data','id',best]))) {
		return QUEUE_FINISH;
	}

	if (!state) {
		return QUEUE_CONTINUE;
	}

	if ((quest.energy || 1e99) > energy && this.option.bank) {
		if (!Bank.stash()) {
			return QUEUE_CONTINUE;
		}
		return QUEUE_FINISH;
	}

	// general selection logic is in work instead of update as it can be spam
	// logs if we are testing on every data update vs when about to run a quest
	if (general === 'any' && quest.general && isNumber(quest.influence) && quest.influence < 100) {
		general = quest.general;
	}
	if (general === 'any' && !this.option.general) {
		general = this.option.general_choice || 'any';
	}
	if (general === 'any') {
		general = Generals.best('under max level');
	}
	if (general === 'any' && isNumber(quest.influence) && quest.influence < 100) {
		general = Generals.best('influence');
	}
	if (general === 'any') {
		switch (this.option.what) {
		case 'Subquests':
		case 'Advancement':
		case 'Influence':
		case 'Inf+Exp':
		case 'Experience':
		case 'Inf+Cash':
		case 'Cash':
			break;
		case 'Vampire Lord':
		case 'Cartigan':
		default:
			general = Generals.best('item');
			break;
		}
	}
	if (general === 'any') {
		general = Generals.best('cash');
	}

	if (!Generals.to(general)) {
		return QUEUE_CONTINUE;
	}

	switch (quest.area) {
	case 'quest':
		page = 'quests_quest' + (quest.land + 1);
		break;
	case 'demiquest':
		page = 'quests_demiquests';
		break;
	case 'atlantis':
		page = 'quests_atlantis';
		break;
	default:
		log(LOG_WARN, "Can't get to quest area!");
		return QUEUE_FINISH;
	}
	if (!Page.to(page, '', 30)) {
		return QUEUE_CONTINUE;
	}

	// this *should* find either the do again button or the normal one
	button = $('input[name="quest"][value="'+best+'"]').siblings('.imgButton').children('input[type="image"]');
	if (!button.length) {
		this.add(['data','id',best,'button_fail'], 1);
		if (this.get(['data','id',best,'button_fail'], 0) > 5) {
			log(LOG_WARN, "Can't find button for " + quest.name + '...');
			this._remind(60, 'retry');
			return QUEUE_FINISH;
		}
		return QUEUE_CONTINUE;
	}

	log(LOG_LOG, 'Performing - ' + quest.name
	  + '; energy: ' + quest.energy
	  + (general !== 'any' ? '; general: ' + general : '')
	  //+ '; form ' + button.closest('form').attr('id')
	);

	if (!Page.click(button)) {
		log(LOG_WARN, "Can't click button for " + quest.name + ' - cooldown?');
		this._remind(60, 'retry');
		return QUEUE_FINISH;
	}

	if (best === LevelUp.get(['runtime','quest'])) {
		LevelUp.set(['runtime','quest']);
	}

	if (quest.type === 3) { // Just completed a boss quest
		if (!Alchemy.get(['ingredients', quest.itemimg], 0, 'number')) {
			// Add one as we've just gained it...
			Alchemy.set(['ingredients', quest.itemimg], 1);
		}
	}

	return QUEUE_RELEASE;
};

Quest.dashboard = function(sort, rev) {
	var self = this, i, j, k, o, r, quest, list = [], output = [], vv, tt, cc, span, v, eff, v1, v2, lo, hi;
	if (typeof sort === 'undefined') {
		this.temp.order = [];
		for (i in this.data.id) {
			this.temp.order.push(i);
		}
	}
	if (typeof sort === 'undefined') {
		sort = (this.runtime.sort || 1);
	}
	if (typeof rev === 'undefined'){
		rev = (this.runtime.rev || false);
	}
	this.runtime.sort = sort;
	this.runtime.rev = rev;
	function getValue(q){
		var r, n, o = self.data.id[q];
		switch(sort) {
			case 0:	// general
				return o.general || 'zzz';
			case 1: // name
				return o.name || 'zzz';
			case 2: // area
				return isNumber(o.land) && typeof self.land[o.land] !== 'undefined' ? self.land[o.land] : self.area[o.area];
			case 3: // level
				return (isNumber(o.level) ? o.level : -1) * 100 + (o.influence || 0);
			case 4: // energy
				return o.energy;
			case 5: // effort
				return o.eff || (o.energy * self.wiki_reps(o));
			case 6: // exp
				return o.exp / o.energy;
			case 7: // reward
				return o.reward / o.energy;
			case 8: // item
				return o.item || 'zzz';
		}
		return 0; // unknown
	}
	this.temp.order.sort(function(a,b) {
		var aa = getValue(a), bb = getValue(b);
		if (isString(aa) || isString(bb)) {
			return (rev ? (''+bb).localeCompare(aa) : (''+aa).localeCompare(bb));
		}
		return (rev ? (aa || 0) - (bb || 0) : (bb || 0) - (aa || 0));
	});
	th(output, 'General');
	th(output, 'Name');
	th(output, 'Area');
	th(output, 'Level');
	th(output, 'Energy');
	th(output, 'Effort', 'title="Energy required per influence level."');
	th(output, '@&nbsp;Exp');
	th(output, '@&nbsp;Reward');
	th(output, 'Item');
	list.push('<table cellspacing="0" style="width:100%"><thead><tr>' + output.join('') + '</tr></thead><tbody>');
	for (o=0; o<this.temp.order.length; o++) {
		i = this.temp.order[o];
		quest = this.data.id[i];
		output = [];

		// general
		td(output, Generals.get([quest.general]) ? '<img style="width:25px;height:25px;" src="' + imagepath + Generals.get([quest.general, 'img']) + '" alt="' + quest.general + '" title="' + quest.general + '">' : '');

		// name
		vv = quest.name;
		span = cc = '';
		tt = 'id: ' + i;
		if (quest.main) {
			tt += ' | main:';
			if (this.data.id[quest.main] && this.data.id[quest.main].name) {
				tt += ' ' + this.data.id[quest.main].name;
			}
			tt += ' (id: ' + quest.main + ')';
		}
		if (this.runtime.best === i) {
			vv = '<b>' + vv + '</b>';
			cc = 'green';
		}
		if (tt !== '') {
			tt = 'title="' + tt + '"';
		}
		if (cc !== '') {
			span += ' style="color:' + cc + '"';
		}
		if (span !== '') {
			vv = '<span' + span + '>' + vv + '</span>';
		}
		th(output, vv, tt);

		// area
		td(output, isNumber(quest.land) ? this.land[quest.land].replace(' ','&nbsp;') : this.area[quest.area].replace(' ','&nbsp;'));

		// level
		span = vv = tt = cc = '';
		if (isNumber(v = quest.level)) {
			vv = v + '&nbsp;(' + quest.influence + '%)';
			if (v >= 4 && quest.influence >= 100) {
				cc = 'red';
			} else if (this.cost(i)) {
				cc = 'blue';
				if (tt !== '') {
					tt += '; ';
				}
				tt += this.temp.desc;
			} else if (isNumber(quest.influence) && quest.influence < 100) {
				cc = 'green';
			}
		} else if (this.cost(i)) {
			vv = '<i>n/a</i>';
			cc = 'blue';
			if (tt !== '') {
				tt += '; ';
			}
			tt += this.temp.desc;
		}
		if (tt !== '') {
			tt = 'title="' + tt + '"';
		}
		if (cc !== '') {
			span += ' style="color:' + cc + '"';
		}
		if (span !== '') {
			vv = '<span' + span + '>' + vv + '</span>';
		}
		td(output, vv, tt);

		// energy
		td(output, quest.energy);

		// effort
		vv = tt = cc = span = '';
		if (!isNumber(quest.level)) {
			vv = '<i>' + quest.energy + '</i>';
		} else {
			r = 'reps_' + (isNumber(quest.land) ? (quest.land + 1) : quest.area);
			j = quest.name.toLowerCase();
			vv = quest.eff || (quest.energy * this.wiki_reps(quest));
			tt = 'effort ' + vv;
			if (0 < quest.influence && quest.influence < 100) {
				v = Math.round(vv * (100 - quest.influence) / 100);
				tt += ' (' + v + ')';
			}
			if ((v = quest.reps)) {
				if (tt !== '') {
					tt += ', ';
				}
				tt += 'reps ' + v;
				if (quest.m_d && quest.m_c) {
					v1 = 100 * quest.m_c / quest.m_d;
					v2 = 2 / quest.m_c;
					lo = Math.ceil(v1 - v2);
					hi = Math.ceil(v1 + v2);
					if (lo < hi) {
						tt += ' [' + lo + ',' + hi + ']';
					}
					v = this.wiki_reps(quest, true);
					if (!v || Math.ceil(lo) > v || Math.ceil(hi) < v) {
						tt += ' wiki[' + (v || '?') + ']';
						if (lo + 1 >= hi) {
							cc = 'purple';
						}
					} else if (lo + 1 >= hi) {
						cc = 'green';
					}
				}
			} else if ((v = this.wiki_reps(quest, true))) {
				if (tt !== '') {
					tt += ', ';
				}
				tt += 'wiki reps ' + v;
			} else {
				if (tt !== '') {
					tt += ', ';
				}
				tt += 'assuming reps 16';
				cc = 'blue';
			}
			if (quest.m_d || quest.m_c) {
				vv = '<b>' + vv + '</b>';
				if (tt !== '') {
					tt += ', ';
				}
				tt += 'effort metrics ' + (quest.m_d || '?') + '/' + (quest.m_c || '?');
			}
			if (tt !== '') {
				tt = 'title="' + tt + '"';
			}
		}
		if (cc !== '') {
			span += ' style="color:' + cc + '"';
		}
		if (span !== '') {
			vv = '<span' + span + '>' + vv + '</span>';
		}
		td(output, vv, tt);

		// exp
		td(output, (quest.exp / quest.energy).round(2), 'title="' + quest.exp + ' total, ' + (quest.exp / quest.energy * 12).round(2) + ' per hour"');

		// reward
		td(output, '$' + (quest.reward / quest.energy).addCommas(0), 'title="$' + quest.reward.addCommas() + ' total, $' + (quest.reward / quest.energy * 12).addCommas(0) + ' per hour"');

		// item
		td(output, quest.itemimg ? '<img style="width:25px;height:25px;" src="' + imagepath + quest.itemimg + '" alt="' + quest.item + '" title="' + quest.item + '">' : '');

		tr(list, output.join(''), 'style="height:25px;"');
	}
	list.push('</tbody></table>');
	$('#golem-dashboard-Quest').html(list.join(''));
	$('#golem-dashboard-Quest tbody tr td:nth-child(2)').css('text-align', 'left');
	if (typeof sort !== 'undefined') {
		$('#golem-dashboard-Quest thead th:eq('+sort+')').attr('name',(rev ? 'reverse' : 'sort')).append('&nbsp;' + (rev ? '&uarr;' : '&darr;'));
	}
};

Quest.cost = function(id) {
	/*jslint onevar:false*/
	var quest = this.get('data.id');
	var gens = Generals.get('data');
	var town = Town.get('data');
	var artifact = Player.get('data.artifact');
	var c, i, j, k, n, cost, upkeep, desc, ccount, ucount;
	/*jslint onevar:true*/

	this.temp.cost = 1e99;
	this.temp.upkeep = 1e99;
	this.temp.desc = '(n/a)';

	cost = ccount = 0;
	upkeep = ucount = 0;
	desc = '';

	if (id && quest[id]) {
		if ((i = quest[id].general)) {
			if (!gens || !gens[i] || !gens[i].own) {
				cost += 1e99;
				if (desc !== '') {
					desc += '; ';
				}
				desc += '(n/a)';
			}
		}

		if (quest[id].units) {
			for (i in quest[id].units) {
				n = quest[id].units[i];
				c = j = 0;
				k = 1e99;
				if (town && town[i]) {
					c = town[i].own || 0;
					if (town[i].buy && town[i].buy.length) {
						j = town[i].upkeep || 0;
						k = town[i].cost || 0;
					}
				} else if (artifact && artifact[i]) {
					c = 1;
					j = k = 0;
				}
				if (c < n) {
					cost += (n - c) * k;
					upkeep += (n - c) * j;
					if (desc !== '') {
						desc += '; ';
					}
					desc += (n - c) + '/' + n + ' ' + i;
					if (k >= 1e99) {
						desc += ' (n/a)';
						ccount++;
					} else if (k) {
						desc += ' $' + ((n - c) * k).SI();
						ccount++;
					}
					if (j) {
						desc += ' (upkeep $' + ((n - c) * j).SI() + ')';
						ucount++;
					}
				}
			}
		}

		if (ccount > 1 && cost) {
			desc += '; total ';
			if (cost < 1e99) {
				desc += '$' + cost.SI();
			} else {
				desc += '(n/a)';
			}
		}

		if (ucount > 1 && upkeep) {
			desc += '; upkeep $' + upkeep.SI();
		}

		this.temp.cost = cost;
		this.temp.upkeep = upkeep;
		this.temp.desc = desc;
	}

	return this.temp.cost;
};

Quest.wiki_reps = function(quest, pure) {
	var reps = 0, rdata;
	if (isObject(quest)) {
		if (!isNumber(quest.level)) {
			reps = 1;
		} else if ((rdata = this.rdata[(quest.name || '').toLowerCase()])) {
			reps = rdata['reps_' + quest.area[0] + ((quest.land || 0) + 1).toString()] || 0;
		}
	}
	return pure ? reps : reps || 16;
};


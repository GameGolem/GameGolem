/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page, Queue, Resources,
	Battle, Generals, LevelUp, Player,
	APP, APPID, log, debug, userID, imagepath,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH
	makeTimer, shortNumber, WorkerByName, WorkerById, Divisor, length, unique, deleteElement, sum, addCommas, findInArray, findInObject, objectIndex, arrayIndexOf, arrayLastIndexOf, sortObject, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime, ucfirst, ucwords,
	makeImage
*/
/********** Worker.Monster **********
 * Automates Monster
 */
var Monster = new Worker('Monster');
Monster.data = {};

Monster.defaults['castle_age'] = {
	pages:'monster_monster_list keep_monster_active monster_battle_monster battle_raid'
};

Monster.option = {
	general:true,
	general_defend:'any',
	general_attack:'any',
	defend: 30,
	//	quest_over: 90,
	min_to_attack: -30,
	defend_active:false,
	choice: 'Any',
	stop: 'Never',
	own: true,
	hide:false,
	armyratio: 'Any',
	levelratio: 'Any',
	force1: true,
	raid: 'Invade x5',
	assist: true,
	attack_max: 5,
	attack_min: 5,
	defend_max: 10,
	defend_min: 10,
//	monster_check:'Hourly',
	check_interval:3600000,
	avoid_lost_cause:false,
	lost_cause_hours:5,
	rescue:false,
	risk:false
};

Monster.runtime = {
	check:false, // id of monster to check if needed, otherwise false
	attack:false, // id of monster if we have an attack target, otherwise false
	defend:false, // id of monster if we have a defend target, otherwise false
	health:10 // minimum health to attack
};

Monster.display = [
	{
		id:'general',
		label:'Use Best General',
		checkbox:true
	},{
		title:'Attack'
	},{
		advanced:true,
		id:'general_attack',
		label:'Attack General',
		require:{'general':false},
		select:'bestgenerals'
	},{
		advanced:true,
		id:'hide',
		label:'Use Raids and Monsters to Hide',
		checkbox:true,
		help:'Fighting Raids keeps your health down. Fight Monsters with remaining stamina.'
	},{
		id:'min_to_attack',
		label:'Attack Over (AB)',
		text:1,
		help:'Attack if ATT BONUS is over this value. Range of -50% to +50%.',
		after:'%'
	},{
		id:'choice',
		label:'Attack',
		select:['Any', 'Strongest', 'Weakest', 'Shortest ETD', 'Longest ETD', 'Spread', 'Max Damage', 'Min Damage','ETD Maintain']
	},{
		id:'stop',
		label:'Stop',
		select:['Never', 'Achievement', '2X Achievement', 'Priority List'],
		help:'Select when to stop attacking a target.'
	},{
		id:'priority',
		label:'Priority List',
		require:{'stop':'Priority List'},
		textarea:true,
		help:'Prioritized list of which monsters to attack'
	},{
		advanced:true,
		id:'own',
		label:'Never stop on Your Monsters',
		checkbox:true,
		help:'Never stop attacking your own summoned monsters (Ignores Stop option).'
	},{
		advanced:true,
		id:'rescue',
		label:'Rescue failing monsters',
		checkbox:true,
		help:'Attempts to rescue failing monsters even if damage is at or above Stop Optionby continuing to attack. Can be used in coordination with Lost-cause monsters setting to give up if monster is too far gone to be rescued.'
	},{
		advanced:true,
		id:'att_avoid_lost_cause',
		label:'Avoid Lost-cause Monsters',
		checkbox:true,
		help:'Do not attack monsters that are a lost cause, i.e. the ETD is longer than the time remaining.'
	},{
		advanced:true,
		id:'att_lost_cause_hours',
		label:'Lost-cause if ETD is',
		require:'avoid_lost_cause',
		after:'hours after timer',
		text:true,
		help:'# of Hours Monster must be behind before preventing attacks.'
	},{
		id:'attack_min',
		label:'Min Stamina Cost',
		select:[1,5,10,20,50],
		help:'Select the minimum stamina for a single attack'
	},{
		id:'attack_max',
		label:'Max Stamina Cost',
		select:[1,5,10,20,50],
		help:'Select the maximum stamina for a single attack'
	},{
		title:'Raids'
	},{
		id:'raid',
		label:'Raid',
		select:['Invade', 'Invade x5', 'Duel', 'Duel x5']
	},{
		advanced:true,
		id:'risk',
		label:'Risk Death',
		checkbox:true,
		help:'The lowest health you can raid with is 10, but you can lose up to 12 health in a raid, so are you going to risk it???'
	},{
		id:'armyratio',
		require:{'raid':[['Duel', 'Duel x5']]},
		label:'Target Army Ratio',
		select:['Any', 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.1, 1.2, 1.3, 1.4, 1.5],
		help:'Smaller number for smaller target army. Reduce this number if you\'re losing in Invade'
	},{
		id:'levelratio',
		require:{'raid':[['Invade', 'Invade x5']]},
		label:'Target Level Ratio',
		select:['Any', 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.1, 1.2, 1.3, 1.4, 1.5],
		help:'Smaller number for lower target level. Reduce this number if you\'re losing a lot'
	},{
		id:'force1',
		label:'Force +1',
		checkbox:true,
		help:'Force the first player in the list to aid.'
	},{
		title:'Defend'
	},{
		id:'defend_active',
		label:'Defend Active',
		checkbox:true,
		help:'Must be checked to defend.'
	},{
//		id:'defend_group',
		require:'defend_active',
		group:[
			{
				advanced:true,
				id:'general_defend',
				require:{'general':false},
				label:'Defend General',
				select:'bestgenerals'
			},{
				id:'defend',
				label:'Defend Below (AB)',
				text:30,
				help:'Defend if ATT BONUS is under this value. Range of -50% to +50%.',
				after:'%'
			},{
				id:'defend_min',
				label:'Min Energy Cost',
				select:[10,20,40,100],
				help:'Select the minimum energy for a single energy action'
			},{
				id:'defend_max',
				label:'Max Energy Cost',
				select:[10,20,40,100],
				help:'Select the maximum energy for a single energy action'
			}
		]
	},{
		title:'Siege Assist Options'
	},{
		id:'assist',
		label:'Assist with Sieges',
		help:'Spend stamina to assist with sieges.',
		checkbox:true
	},{
		id:'assist_links',
		label:'Use Assist Links in Dashboard',
		checkbox:true
	},{
		advanced:true,
		id:'check_interval',//monster_check
		label:'Monster Review',
		select:{
			900000:'15 Minutes',
			1800000:'30 Minutes',
			3600000:'Hourly',
			7200000:'2 Hours',
			21600000:'6 Hours',
			43200000:'12 Hours',
			86400000:'Daily',
			604800000:'Weekly'},
		help:'Sets how often to check Monster Stats.'
	}
];

Monster.types = {
	// Special (level 5) - not under Monster tab
	//	kull: {
	//		name:'Kull, the Orc Captain',
	//		timer:259200 // 72 hours
	//	},
	// Raid

	raid_easy: {
		name:'The Deathrune Siege',
		list:'deathrune_list1.jpg',
		image:'raid_title_raid_a1.jpg',
		image2:'raid_title_raid_a2.jpg',
		dead:'raid_1_large_victory.jpg',
		achievement:100,
		timer:216000, // 60 hours
		timer2:302400, // 84 hours
		raid:true
	},

	raid: {
		name:'The Deathrune Siege',
		list:'deathrune_list2.jpg',
		image:'raid_title_raid_b1.jpg',
		image2:'raid_title_raid_b2.jpg',
		dead:'raid_1_large_victory.jpg',
		achievement:100,
		timer:319920, // 88 hours, 52 minutes
		timer2:519960, // 144 hours, 26 minutes
		raid:true
	},
	// Epic Boss
	colossus: {
		name:'Colossus of Terra',
		list:'stone_giant_list.jpg',
		image:'stone_giant_large.jpg',
		dead:'stone_giant_dead.jpg',
		achievement:20000,
		timer:259200, // 72 hours
		mpool:1,
		attack_button:'input[name="Attack Dragon"]',
		siege:false,
		attack:[1,5]
	},
	gildamesh: {
		name:'Gildamesh, the Orc King',
		list:'orc_boss_list.jpg',
		image:'orc_boss.jpg',
		dead:'orc_boss_dead.jpg',
		achievement:15000,
		timer:259200, // 72 hours
		mpool:1,
		attack_button:'input[name="Attack Dragon"]',
		siege:false,
		attack:[1,5]
	},
	keira: {
		name:'Keira the Dread Knight',
		list:'boss_keira_list.jpg',
		image:'boss_keira.jpg',
		dead:'boss_keira_dead.jpg',
		achievement:30000,
		timer:172800, // 48 hours
		mpool:1,
		attack_button:'input[name="Attack Dragon"]',
		siege:false,
		attack:[1,5]
	},
	lotus: {
		name:'Lotus Ravenmoore',
		list:'boss_lotus_list.jpg',
		image:'boss_lotus.jpg',
		dead:'boss_lotus_big_dead.jpg',
		achievement:500000,
		timer:172800, // 48 hours
		mpool:1,
		attack_button:'input[name="Attack Dragon"]',
		siege:false,
		attack:[1,5]
	},
	mephistopheles: {
		name:'Mephistopheles',
		list:'boss_mephistopheles_list.jpg',
		image:'boss_mephistopheles_large.jpg',
		dead:'boss_mephistopheles_dead.jpg',
		achievement:100000,
		timer:172800, // 48 hours
		mpool:1,
		attack_button:'input[name="Attack Dragon"]',
		siege:false,
		attack:[1,5]
	},
	skaar: {
		name:'Skaar Deathrune',
		list:'death_list.jpg',
		image:'death_large.jpg',
		dead:'death_dead.jpg',
		achievement:1000000,
		timer:345000, // 95 hours, 50 minutes
		mpool:1,
		attack_button:'input[name="Attack Dragon"][src*="attack"]',
		attack:[1,5,10,20,50],
		defend_button:'input[name="Attack Dragon"][src*="dispel"]',
		defend:[10,20,40,100]
	},
	sylvanus: {
		name:'Sylvana the Sorceress Queen',
		list:'boss_sylvanus_list.jpg',
		image:'boss_sylvanus_large.jpg',
		dead:'boss_sylvanus_dead.jpg',
		achievement:50000,
		timer:172800, // 48 hours
		mpool:1,
		attack_button:'input[name="Attack Dragon"]',
		attack:[1,5]
	},
	// Epic Team
	dragon_emerald: {
		name:'Emerald Dragon',
		list:'dragon_list_green.jpg',
		image:'dragon_monster_green.jpg',
		dead:'dead_dragon_image_green.jpg',
		achievement:100000,
		timer:259200, // 72 hours
		mpool:2,
		attack_button:'input[name="Attack Dragon"]',
		siege:false,
		attack:[1,5]
	},
	dragon_frost: {
		name:'Frost Dragon',
		list:'dragon_list_blue.jpg',
		image:'dragon_monster_blue.jpg',
		dead:'dead_dragon_image_blue.jpg',
		achievement:100000,
		timer:259200, // 72 hours
		mpool:2,
		attack_button:'input[name="Attack Dragon"]',
		siege:false,
		attack:[1,5]
	},
	dragon_gold: {
		name:'Gold Dragon',
		list:'dragon_list_yellow.jpg',
		image:'dragon_monster_gold.jpg',
		dead:'dead_dragon_image_gold.jpg',
		achievement:100000,
		timer:259200, // 72 hours
		mpool:2,
		attack_button:'input[name="Attack Dragon"]',
		siege:false,
		attack:[1,5]
	},
	dragon_red: {
		name:'Ancient Red Dragon',
		list:'dragon_list_red.jpg',
		image:'dragon_monster_red.jpg',
		dead:'dead_dragon_image_red.jpg',
		achievement:100000,
		timer:259200, // 72 hours
		mpool:2,
		attack_button:'input[name="Attack Dragon"]',
		siege:false,
		attack:[1,5]
	},
	serpent_amethyst: { // DEAD image Verified and enabled.
		name:'Amethyst Sea Serpent',
		list:'seamonster_list_purple.jpg',
		image:'seamonster_purple.jpg',
		dead:'seamonster_dead.jpg',
		title:'seamonster_title_amethyst.jpg',
		achievement:250000,
		timer:259200, // 72 hours
		mpool:2,
		attack_button:'input[name="Attack Dragon"]',
		siege:false,
		attack:[1,5],
		defend_button:'input[name="Defend against Monster"]',
		defend:[10]
	},
	serpent_ancient: { // DEAD image Verified and enabled.
		name:'Ancient Sea Serpent',
		list:'seamonster_list_red.jpg',
		image:'seamonster_red.jpg',
		dead:'seamonster_dead.jpg',
		title:'seamonster_title_ancient.jpg',
		achievement:250000,
		timer:259200, // 72 hours
		mpool:2,
		attack_button:'input[name="Attack Dragon"]',
		siege:false,
		attack:[1,5],
		defend_button:'input[name="Defend against Monster"]',
		defend:[10]
	},
	serpent_emerald: { // DEAD image Verified and enabled.
		name:'Emerald Sea Serpent',
		list:'seamonster_list_green.jpg',
		image:'seamonster_green.jpg',
		dead:'seamonster_dead.jpg',
		title:'seamonster_title_emerald.jpg', //Guesswork. Needs verify.
		achievement:250000,
		timer:259200, // 72 hours
		mpool:2,
		attack_button:'input[name="Attack Dragon"]',
		siege:false,
		attack:[1,5],
		defend_button:'input[name="Defend against Monster"]',
		defend:[10]
	},
	serpent_sapphire: { // DEAD image guesswork based on others and enabled.
		name:'Sapphire Sea Serpent',
		list:'seamonster_list_blue.jpg',
		image:'seamonster_blue.jpg',
		dead:'seamonster_dead.jpg',
		title:'seamonster_title_sapphire.jpg',
		achievement:250000,
		timer:259200, // 72 hours
		mpool:2,
		attack_button:'input[name="Attack Dragon"]',
		siege:false,
		attack:[1,5],
		defend_button:'input[name="Defend against Monster"]',
		defend:[10]
	},
	// Epic World
	cronus: {
		name:'Cronus, The World Hydra',
		list:'hydra_head.jpg',
		image:'hydra_large.jpg',
		dead:'hydra_dead.jpg',
		achievement:500000,
		timer:604800, // 168 hours
		mpool:3,
		attack_button:'input[name="Attack Dragon"]',
		attack:[1,5,10,20,50]
	},
	legion: {
		name:'Battle of the Dark Legion',
		list:'castle_siege_list.jpg',
		image:'castle_siege_large.jpg',
		dead:'castle_siege_dead.jpg',
		achievement:1000,
		timer:604800, // 168 hours
		mpool:3,
		attack_button:'input[name="Attack Dragon"][src*="attack"]',
		attack:[1,5,10,20,50],
		defend_button:'input[name="Attack Dragon"][src*="fortify"]',
		defend:[10,20,40,100],
		orcs:true
	},
	genesis: {
		name:'Genesis, The Earth Elemental',
		list:'earth_element_list.jpg',
		image:'earth_element_large.jpg',
		dead:'earth_element_dead.jpg',
		achievement:1000000,
		timer:604800, // 168 hours
		mpool:3,
		attack_button:'input[name="Attack Dragon"][src*="attack"]',
		attack:[1,5,10,20,50],
		defend_button:'input[name="Attack Dragon"][src*="fortify"]',
		defend:[10,20,40,100]
	},
	ragnarok: {
		name:'Ragnarok, The Ice Elemental',
		list:'water_list.jpg',
		image:'water_large.jpg',
		dead:'water_dead.jpg',
		achievement:1000000,
		timer:604800, // 168 hours
		mpool:3,
		attack_button:'input[name="Attack Dragon"][src*="attack"]',
		attack:[1,5,10,20,50],
		defend_button:'input[name="Attack Dragon"][src*="dispel"]',
		defend:[10,20,40,100]
	},
	bahamut: {
		name:'Bahamut, the Volcanic Dragon',
		list:'nm_volcanic_list.jpg',
		image:'nm_volcanic_large.jpg',
		dead:'nm_volcanic_dead.jpg',
		achievement:1000000, // Guesswork
		timer:604800, // 168 hours
		mpool:3,
		attack_button:'input[name="Attack Dragon"][src*="stab"],input[name="Attack Dragon"][src*="bolt"],input[name="Attack Dragon"][src*="smite"],input[name="Attack Dragon"][src*="bash"]',
		attack:[5,10,20,50],
		defend_button:'input[name="Attack Dragon"][src*="cripple"],input[name="Attack Dragon"][src*="deflect"],input[name="Attack Dragon"][src*="heal"],input[name="Attack Dragon"][src*="strengthen"]',
		defend:[10,20,40,100]
	},
	alpha_bahamut: {
		name:'Alpha Bahamut, the Volcanic Dragon',
		list:'nm_volcanic_list_2.jpg',
		image:'nm_volcanic_large_2.jpg',
		dead:'nm_volcanic_dead_2.jpg', //Guesswork
		achievement:3000000, // Guesswork
		timer:604800, // 168 hours
		mpool:3,
		attack_button:'input[name="Attack Dragon"][src*="stab"],input[name="Attack Dragon"][src*="bolt"],input[name="Attack Dragon"][src*="smite"],input[name="Attack Dragon"][src*="bash"]',
		attack:[5,10,20,50],
		defend_button:'input[name="Attack Dragon"][src*="cripple"],input[name="Attack Dragon"][src*="deflect"],input[name="Attack Dragon"][src*="heal"],input[name="Attack Dragon"][src*="strengthen"]',
		defend:[10,20,40,100]
	},
	azriel: {
		name:'Azriel, the Angel of Wrath',
		list:'nm_azriel_list.jpg',
		image:'nm_azriel_large2.jpg',
		dead:'nm_azriel_dead.jpg', //Guesswork
		achievement:3000000, // ~0.5%, 2X = ~1%
		timer:604800, // 168 hours
		mpool:1,
		attack_button:'input[name="Attack Dragon"][src*="stab"],input[name="Attack Dragon"][src*="bolt"],input[name="Attack Dragon"][src*="smite"],input[name="Attack Dragon"][src*="bash"]',
		attack:[5,10,20,50],
		defend_button:'input[name="Attack Dragon"][src*="cripple"],input[name="Attack Dragon"][src*="deflect"],input[name="Attack Dragon"][src*="heal"],input[name="Attack Dragon"][src*="strengthen"]',
		defend:[10,20,40,100]
	},
	red_plains: {
		name:'War of the Red Plains',
		list:'nm_war_list.jpg',
		image:'nm_war_large.jpg',
		dead:'nm_war_dead.jpg', //Guesswork
		achievement:1500, // ~0.5%, 2X = ~1%
		timer:604800, // 168 hours
		mpool:3,
		attack_button:'input[name="Attack Dragon"][src*="stab"],input[name="Attack Dragon"][src*="bolt"],input[name="Attack Dragon"][src*="smite"],input[name="Attack Dragon"][src*="bash"]',
		attack:[5,10,20,50],
		defend_button:'input[name="Attack Dragon"][src*="cripple"],input[name="Attack Dragon"][src*="deflect"],input[name="Attack Dragon"][src*="heal"],input[name="Attack Dragon"][src*="strengthen"]',
		defend:[10,20,40,100],
		orcs:true
	}
};

Monster.health_img = ['img[src$="nm_red.jpg"]', 'img[src$="monster_health_background.jpg"]'];
Monster.shield_img = ['img[src$="bar_dispel.gif"]'];
Monster.defense_img = ['img[src$="nm_green.jpg"]', 'img[src$="seamonster_ship_health.jpg"]'];
Monster.secondary_img = ['img[src$="nm_stun_bar.gif"]'];
Monster.class_img = ['div[style*="nm_bottom"] img[src$="nm_class_warrior.jpg"]', 'div[style*="nm_bottom"] img[src$="nm_class_cleric.jpg"]', 'div[style*="nm_bottom"] img[src$="nm_class_rogue.jpg"]', 'div[style*="nm_bottom"] img[src$="nm_class_mage.jpg"]'];
Monster.class_name = ['Warrior', 'Cleric', 'Rogue', 'Mage'];
Monster.class_off = ['', '', 'img[src$="nm_s_off_cripple.gif"]', 'img[src$="nm_s_off_deflect.gif"]'];

Monster.init = function() {
	this._watch(Player);
	this._watch(Queue);
	$('#golem-dashboard-Monster tbody td a').live('click', function(event){
		var url = $(this).attr('href');
		Page.to((url.indexOf('raid') > 0 ? 'battle_raid' : 'monster_battle_monster'), url.substr(url.indexOf('?')), false);
		return false;
	});
	Resources.useType('Energy');
	Resources.useType('Stamina');
};

Monster.parse = function(change) {
	var mid, uid, type_label, $health, $defense, $dispel, $secondary, dead = false, monster, timer, ATTACKHISTORY = 20, record, data = Monster.data, types = Monster.types;	//Is there a better way?  "this." doesn't seem to work.
	if (Page.page === 'keep_monster_active' || Page.page === 'monster_battle_monster') { // In a monster or raid
		uid = $('img[linked][size="square"]').attr('uid');
		//debug('Parsing for Monster type');
		for (i in types) {
			if (types[i].dead && $('#app'+APPID+'_app_body img[src$="'+types[i].dead+'"]').length && (!types[i].title || $('div[style*="'+types[i].title+'"]').length)) {
				//debug('Found a dead '+i);
				type_label = i;
				timer = types[i].timer;
				dead = true;
				break;
			} else if (types[i].image && $('#app'+APPID+'_app_body img[src$="'+types[i].image+'"],div[style*="'+types[i].image+'"]').length) {
				//debug('Parsing '+i);
				type_label = i;
				timer = types[i].timer;
				break;
			} else if (types[i].image2 && $('#app'+APPID+'_app_body img[src$="'+types[i].image2+'"],div[style*="'+types[i].image2+'"]').length) {
				//debug('Parsing second stage '+i);
				type_label = i;
				timer = types[i].timer2 || types[i].timer;
				break;
			}
		}
		if (!uid || !type_label) {
			debug('Unknown monster (probably dead)');
			return false;
		}
		mid = uid+'_'+(types[i].mpool || 4);
		monster = data[mid] = data[mid] || {};
		monster.type = type_label;
		monster.last = Date.now();
		if (dead) {
			// Will this catch Raid format rewards?
			if ($('input[src*="collect_reward_button.jpg"]').length || monster.state === 'engage') {
				monster.state = 'reward';
			} else if (monster.state === 'assist') {
				monster.state = null;
				return false;
			}
		}
		monster.stamina = monster.stamina || {};
		monster.damage = monster.damage || {};
		monster.damage.user = monster.damage.user || {};
		monster.energy = monster.energy || {};
		monster.defend = monster.defend || {};
		this.runtime.record = this.runtime.record || {};
		record = this.runtime.record[type_label] = this.runtime.record[type_label] || {};
		record.damage = record.damage || [];
		record.stamina = record.stamina || [];
		record.energy = record.energy || [];
		record.defend = record.defend || [];
		if ($('span.result_body').text().match(/for your help in summoning|You have already assisted on this objective|You don't have enough stamina assist in summoning/i)) {
			if ($('span.result_body').text().match(/for your help in summoning/i)) {
				monster.assist = Date.now();
			}
			monster.state = monster.state || 'assist';
		} else if (this.runtime.stamina_used) {
			if ($('span[class="positive"]').length && $('span[class="positive"]').prevAll('span').text().replace(/[^0-9\/]/g,'')) {
				record.damage.unshift(Number($('span[class="positive"]').prevAll('span').text().replace(/[^0-9\/]/g,'')));
				while (record.damage.length > ATTACKHISTORY) {
					record.damage.pop();
				}
				record.stamina.unshift(this.runtime.stamina_used);
				while (record.stamina.length > ATTACKHISTORY) {
					record.stamina.pop();
				}
				monster.stamina.script = (monster.stamina.script || 0) + record.stamina[0];
				monster.damage.user.script = (monster.damage.user.script || 0) + record.damage[0];
				record.dmg_per_stamina = sum(record.damage) / sum(record.stamina);
				//debug('Stamina used by script on this monster = ' + monster.stamina.script);
				//debug('Damage from script on this monster = ' + monster.damage.script);
				//debug('Damage per stamina = ' + record.dmg_per_stamina);
			}
			this.runtime.stamina_used = 0;
		} else if (this.runtime.energy_used) {
			if ($('span[class="positive"]').length && $('span[class="positive"]').prevAll('span').text().replace(/[^0-9\/]/g,'')) {
				record.defend.unshift(Number($('span[class="positive"]').prevAll('span').text().replace(/[^0-9\/]/g,'')));
				while (record.defend.length > ATTACKHISTORY) {
					record.defend.pop();
				}
				record.energy.unshift(this.runtime.energy_used);
				while (record.energy.length > ATTACKHISTORY) {
					record.energy.pop();
				}
				monster.energy.script = (monster.energy.script || 0) + this.runtime.energy_used;
				monster.defend.script = (monster.defense.script || 0) + record.defend[0];
				record.dfd_per_energy = sum(record.defend) / sum(record.energy);
				//debug('Energy used by script on this monster = ' + monster.energy.script);
				//debug('Defend from script on this monster = ' + monster.defend.script);
				//debug('Defend per energy = ' + record.dfd_per_energy);
			}
			this.runtime.energy_used = 0;
		}
		if ($('img[src$="battle_victory"]').length) {
			History.add('raid+win',1);
		} else if ($('img[src$="battle_defeat"]').length) {
			History.add('raid+loss',-1);
		}
		if (!monster.name) {
			monster.name = $('img[linked][size="square"]').parent().parent().next().text().trim().replace(/[\s\n\r]{2,}/g, ' ').regex(/(.+)'s /i);
		}
		// Need to also parse what our class is for Bahamut.  (Can probably just look for the strengthen button to find warrior class.)
		for (i in Monster['class_img']){
			if ($(Monster['class_img'][i]).length){
				monster.mclass = i;
				//debug('Monster class : '+Monster['class_name'][i]);
			}
		}
		if (monster.mclass > 1){	// If we are a Rogue or Mage
			// Attempt to check if we are in the wrong phase
			if ($(Monster['class_off'][monster.mclass]).length === 0){
				for(i in Monster['secondary_img']) {
					$secondary = $(Monster['secondary_img'][i]);
					if ($secondary.length) {
						monster.secondary = (100 * $secondary.width() / $secondary.parent().width());
						//debug(Monster['class_name'][monster.mclass]+" phase. Bar at "+monster.secondary+"%");
						break;
					}
				}
			} else {
				//debug("We aren't in "+Monster['class_name'][monster.mclass]+" phase. Skip defend.");
			}
		}
		for (i in Monster['health_img']){
			if ($(Monster['health_img'][i]).length){
				$health = $(Monster['health_img'][i]).parent();
				monster.health = $health.length ? (100 * $health.width() / $health.parent().width()) : 0;
				break;
			}
		}
		for (i in Monster['shield_img']){
			if ($(Monster['shield_img'][i]).length){
				$dispel = $(Monster['shield_img'][i]).parent();
				monster.defense = 100 * (1 - ($dispel.width() / ($dispel.next().length ? $dispel.width() + $dispel.next().width() : $dispel.parent().width())));
				monster.attackbonus = (monster.defense * (isNumber(monster.strength) ? (monster.strength/100) : 1)) - 50;
				break;
			}
		}
		for (i in Monster['defense_img']){
			if ($(Monster['defense_img'][i]).length){
				$defense = $(Monster['defense_img'][i]).parent();
				monster.defense = ($defense.width() / ($defense.next().length ? $defense.width() + $defense.next().width() : $defense.parent().width()) * 100);
				if ($defense.parent().width() < $defense.parent().parent().width()){
					monster.strength = 100 * $defense.parent().width() / $defense.parent().parent().width();
				} else {
					monster.strength = 100;
				}
				monster.attackbonus = (monster.defense * (isNumber(monster.strength) ? (monster.strength/100) : 1)) - 50;
				break;
			}
		}
		monster.timer = $('#app'+APPID+'_monsterTicker').text().parseTimer();
		monster.finish = Date.now() + (monster.timer * 1000);
		monster.damage.siege = 0;
		monster.damage.others = 0;
		if (!dead &&$('input[name*="help with"]').length && $('input[name*="help with"]').attr('title')) {
			//debug('Current Siege Phase is: '+ this.data[mid].phase);
			monster.phase = $('input[name*="help with"]').attr('title').regex(/ (.*)/i);
			//debug('Assisted on '+monster.phase+'.');
		}
		$('img[src*="siege_small"]').each(function(i,el){
			var /*siege = $(el).parent().next().next().next().children().eq(0).text(),*/ dmg = $(el).parent().next().next().next().children().eq(1).text().replace(/[^0-9]/g,'').regex(/([0-9]+)/);
			//debug('Monster Siege',siege + ' did ' + addCommas(dmg) + ' amount of damage.');
			monster.damage.siege += dmg / (types[type_label].orcs ? 1000 : 1);
		});
		$('td.dragonContainer table table a[href^="http://apps.facebook.com/castle_age/keep.php?user="]').each(function(i,el){
			var user = $(el).attr('href').regex(/user=([0-9]+)/i), tmp, dmg, fort;
			if (types[type_label].raid){
				tmp = $(el).parent().next().text().replace(/[^0-9\/]/g,'');
			} else {
				tmp = $(el).parent().parent().next().text().replace(/[^0-9\/]/g,'');
			}
			dmg = tmp.regex(/([0-9]+)/);
			fort = tmp.regex(/\/([0-9]+)/);
			if (user === userID){
				monster.damage.user.manual = dmg - (monster.damage.user.script || 0);
				monster.defend.manual = fort - (monster.defend.script || 0);
				monster.stamina.manual = Math.round(monster.damage.user.manual
						/ record.dmg_per_stamina);
			} else {
				monster.damage.others += dmg;
			}
		});
		monster.dps = sum(monster.damage) / (timer - monster.timer);
		if (types[type_label].raid) {
			monster.total = sum(monster.damage) + $('div[style*="monster_health_back.jpg"] div:nth-child(2)').text().regex(/([0-9]+)/);
		} else {
			monster.total = Math.ceil(100 * sum(monster.damage) / (monster.health === 100 ? 0.1 : (100 - monster.health)));
		}
		monster.eta = Date.now() + (Math.floor((monster.total - sum(monster.damage)) / monster.dps) * 1000);
	} else {
		this.runtime.stamina_used = 0;
		this.runtime.energy_used = 0;
		if (Page.page === 'monster_monster_list' || Page.page === 'battle_raid') { // Check monster / raid list
			if ($('div[style*="no_monster_back.jpg"]').attr('style')){
				debug('Found a timed out monster.');
				if (this.runtime.check){
					debug('Deleting ' + data[this.runtime.check].name + "'s " + data[this.runtime.check].type);
					delete data[this.runtime.check];
				} else {
					debug('Unknown monster (timed out)');
				}
				this.runtime.check = false;
				return false;
			}
			this.runtime.check = false;

			if (!$('#app'+APPID+'_app_body div.imgButton').length) {
				return false;
			}
			for (mid in data) {
				if (	(types[data[mid].type].raid 
							? Page.page === 'battle_raid'
							: Page.page === 'monster_monster_list')
						&& (data[mid].state === 'complete'
							|| data[mid].state === 'reward'
							|| (data[mid].state === 'assist'
								&& data[mid].finish < Date.now()))
					) {
					data[mid].state = null;
				}
			}
			$('#app'+APPID+'_app_body div.imgButton').each(function(a,el){
				var i, uid = $('a', el).attr('href').regex(/user=([0-9]+)/i), tmp = $(el).parent().parent().children().eq(1).html().regex(/graphics\/([^.]*\....)/i), type_label = 'unknown';
				for (i in types) {
					if (tmp === types[i].list) {
						type_label = i;
						break;
					}
				}
				if (!uid || type_label === 'unknown') {
					return;
				}
				mid = uid+'_'+(types[i].mpool || 4);
				data[mid] = data[mid] || {};
				data[mid].type = type_label;
				data[mid] = data[mid] || {};
				if (uid === userID) {
					data[mid].name = 'You';
				} else {
					tmp = $(el).parent().parent().children().eq(2).text().trim();
					data[mid].name = tmp.regex(/(.+)'s /i);
				}
				switch($('img', el).attr('src').regex(/dragon_list_btn_([0-9])/)) {
					case 2:
						data[mid].state = 'reward';
						break;
					case 3:
						data[mid].state = 'engage';
						break;
					case 4:
						// if (this.types[type].raid && data[mid].health) {
						//	data[mid].state = 'engage'; // Fix for page cache issues in 2-part raids
						// } else {
						data[mid].state = 'complete';
						// }
						break;
					default:
						data[mid].state = 'unknown';
						break; // Should probably delete, but keep it on the list...
				}
			});
		}
	}
	return false;
};

Monster.update = function(what,worker) {
/*	if (what === 'runtime') {
		return;
	}
*/	var i, mid, uid, type, req_stamina, req_health, req_energy, messages = [], fullname = {}, list = {}, amount, listSortFunc;
	list.defend = [];
	list.attack = [];
	// Flush stateless monsters
	for (mid in this.data) {
		if (!this.data[mid].state) {
			log('Deleted monster MID ' + mid + ' because state is ' + this.data[mid].state);
			delete this.data[mid];
		}
	}
	// Check monster progress regularly
	for (mid in this.data) {
		if (	(this.data[mid].last || 0) < Date.now() - this.option.check_interval
				&& !this.data[mid].ignore) {
			this.runtime.check = mid; // Do we need to parse info from a blank monster?
			return;
		}
	}

	/*
	var order = this.option.priority.split(/[\n,]/);
	for (var p in order) {
		order[p] = order[p].trim();
		if (!order[p]) {
			continue;
		}
		searchterm = $.trim(order[p].match(new RegExp("^[^:]+")).toString()).toLowerCase();
		condition = $.trim(order[p].replace(new RegExp("^[^:]+"), '').toString());
		for (i in this.data) {
			for (j in this.data[i]) {
			monster = data[mid];
				// If we set conditions on this monster already then we do not reprocess
				//if (this.data[mid].conditions) {
				//	continue;
				//}

				//If this monster does not match, skip to next one
				// Or if this monster is dead, skip to next one
				if (	(monster.name + ' ' +j ).toLowerCase().indexOf(searchterm) < 0)
						|| (monster.state !== 'engage')) {
					continue;
				}

				//Monster is a match so we set the conditions
				monster.ach = this.conditions('ach',condition) || this.types[j].achievement;
				monster.attack_max = this.conditions('max',condition) || 2 * this.types[j].achievement;
				monster.defend_max = this.conditions('f%',condition) || this.option.defend;

				// checkMonsterDamage would have set our 'color' and 'over' values. We need to check
				// these to see if this is the monster we should select/
				if (!att_underAch && monster.attackbonus <= this.option.min_to_attack) {
					if (monster.health < monster.ach) {
						att_underAch = mid;
					} else if (monster.health < monster.max && !att_overAch) {
						att_overAch = mid;
					}
				}

				if (!def_underach && this.types[j].defend && monster.attackbonus < monster.defend_max) {
					if (monster.health < monster.ach) {
						def_underAch = mid;
					} else if (monster.health < monster.max && !def_overAch) {
						def_overAch = mid;
					}
				}
			}
		}
	}

	// Now we use the first under max/under achievement that we found. If we didn't find any under
	// achievement then we use the first over achievement
	att_best = att_underAch || att_overAch;
	def_best = def_underAch || def_overAch;
	*/

	// Make lists of the possible attack and defend targets
	for (mid in this.data) {
		monster = this.data[mid];
		type = this.types[monster.type];
		req_stamina = type.raid ? (this.option.raid.search('x5') === -1 ? 1 : 5)
				: (this.option.attack_min < Math.min.apply(Math, type.attack)
					|| this.option.attack_max <= Math.min.apply(Math, type.attack))
				? Math.min.apply( Math, type.attack)
				: this.option.attack_min > Math.max.apply(Math, type.attack)
				? Math.max.apply(Math, type.attack)
				: this.option.attack_min > this.option.attack_max
				? this.option.attack_max : this.option.attack_min;
		req_energy = type.defend_button ? this.option.defend_min : null;
		req_health = type.raid ? (this.option.risk ? 13 : 10) : 10; // Don't want to die when attacking a raid

		if (	!monster.ignore
				&& monster.state === 'engage'
				&& monster.finish > Date.now()	) {
			uid = mid.replace(/_\d+/,'');
			if (uid === userID && this.option.own) {
				// add own monster
			} else if (this.option.avoid_lost_cause
					&& (monster.eta - monster.finish)/3600000
						> this.option.lost_cause_hours) {
				continue;  // Avoid lost cause monster
			} else if (this.option.rescue
					&& (monster.eta
						>= monster.finish - this.option.check_interval)) {
				// Add monster to rescue
			} else if (this.option.stop === 'Achievement'
					&& sum(monster.damage.user) + sum(monster.defend)
						> (type.achievement || 0)) {
				continue; // Don't add monster over achievement
			} else if (this.option.stop === '2X Achievement'
					&& sum(monster.damage.user) + sum(monster.defend)
						> type.achievement * 2) {
				continue; // Don't add monster over 2X  achievement
			}
			// Possible attack target?
			if ((!this.option.hide || (Player.get('health') >= req_health && Queue.burn.stamina >= req_stamina))
				&& ((monster.attackbonus || 50) >= this.option.min_to_attack)) {
				list.attack.push([mid, (sum(monster.damage.user) + sum(monster.defend)) / sum(monster.damage)]);
			}
			// Possible defend target?
			if (	this.option.defend_active
					&& (!this.option.hide
						|| Queue.burn.energy >= req_energy)
					&& (monster.attackbonus || 51) <= this.option.defend) {
				if ((monster.mclass || 0) < 2) {
					if ((monster.attackbonus || 101) >= this.option.defend
							&& monster.defense >= 100) {
						continue;
					}
				} else if ((monster.secondary || 101) >= 100){
					continue;
				}
				list.defend.push([mid, (sum(monster.damage.user) + sum(monster.defend)) / sum(monster.damage)]);
			}
		}
	}
	listSortFunc = function(a,b){
		var monster_a = Monster.data[a[0]], monster_b = Monster.data[a[0]];
		switch(Monster.option.choice) {
		case 'Any':
			return (Math.random()-0.5);
		case 'Strongest':
			return monster_b.health - monster_a.health;
		case 'Weakest':
			return monster_a.health - monster_b.health;
		case 'Shortest ETD':
			return monster_a.eta - monster_b.eta;
		case 'Longest ETD':
			return monster_b.eta - monster_a.eta;
		case 'Spread':
			return sum(monster_a.stamina) - sum(monster_b.stamina);
		case 'Max Damage':
			return b[1] - a[1];
		case 'Min Damage':
			return a[1] - b[1];
		case 'ETD Maintain':
			return monster_b.finish - monster_a.finish;
		}
	};
	for (i in list) {
		// Find best target
		//debug('list ' + i + ' is ' + list[i]);
		if (list[i].length) {
			list[i].sort(listSortFunc);
			this.runtime[i] = mid = list[i][0][0];
			uid = mid.replace(/_\d+/,'');
			type = this.types[this.data[mid].type];
			fullname[i] = (uid === userID ? 'your ': (this.data[mid].name + '\'s ')) + type.name;
		} else {
			this.runtime[i] = false;
		}
	}
	// Make the * dash messages for current attack and defend targets
	if (this.runtime.defend) {
		type = this.types[this.data[this.runtime.defend].type];
		this.runtime.energy = (!type.defend) ? 10
				: (this.option.defend_min < Math.min.apply(Math, type.defend)
					|| this.option.defend_max < Math.min.apply(Math, type.defend))
				? Math.min.apply(Math, type.defend)
				: (this.option.defend_min > Math.max.apply(Math, type.defend))
				? Math.max.apply(Math, type.defend)
				: (this.option.defend_min > this.option.defend_max)
				? this.option.defend_max : this.option.defend_min;
		if (Queue.burn.energy < this.runtime.energy) {
			amount = (LevelUp.runtime.running && LevelUp.option.enabled)
					? (this.runtime.energy - Queue.burn.energy)
					: Math.max((this.runtime.energy - Queue.burn.energy)
						,(this.runtime.energy + Queue.option.energy - Player.get('energy'))
						,(Queue.option.start_energy - Player.get('energy')));
			messages.push('Waiting for ' + amount + makeImage('energy') + ' to defend '
					+ fullname.defend + ' (' + makeImage('energy') + this.runtime.energy + '+)');
		} else {
			messages.push('Defend '	+ fullname.defend + ' (' + makeImage('energy')
					+ this.runtime.energy + '+)');
		}
	}
	if (this.runtime.attack) {
		type = this.types[this.data[this.runtime.attack].type];
		this.runtime.stamina = type.raid && this.option.raid.search('x5') === -1 ? 1
				: type.raid
				? 5 : (this.option.attack_min < Math.min.apply(Math, type.attack)
					|| this.option.attack_max < Math.min.apply(Math, type.attack))
				? Math.min.apply(Math, type.attack)
				: (this.option.attack_min > Math.max.apply(Math, type.attack))
				? Math.max.apply(Math, type.attack)
				: (this.option.attack_min > this.option.attack_max)
				? this.option.attack_max : this.option.attack_min;
		this.runtime.health = type.raid ? 13 : 10; // Don't want to die when attacking a raid
		if (Player.get('health') < this.runtime.health) {
			amount = this.runtime.health - Player.get('health');
			messages.push('Waiting for ' + amount + makeImage('health') + ' to attack '
					+ fullname.attack + ' (' + makeImage('health') + this.runtime.health + '+)');
		} else if (Queue.burn.stamina < this.runtime.stamina){
			amount = (LevelUp.runtime.running && LevelUp.option.enabled)
					? (this.runtime.stamina - Queue.burn.stamina)
					: Math.max((this.runtime.stamina - Queue.burn.stamina)
						,(this.runtime.stamina + Queue.option.stamina - Player.get('stamina'))
						,(Queue.option.start_stamina - Player.get('stamina')));
			messages.push('Waiting for ' + amount + makeImage('stamina') + ' to attack '
					+ fullname.attack + ' (' + makeImage('stamina') + this.runtime.stamina + '+)');
		} else {
			messages.push('Attack ' + fullname.attack + ' (' + makeImage('stamina')
					+ this.runtime.stamina + '+)');
		}
	}
	Dashboard.status(this, messages.length ? messages.join('<br>') : 'Nothing to do.');
};

Monster.work = function(state) {
	var i, j, target_info = [], battle_list, list = [], mid, uid, type, btn = null, b, mode = null, stat, monster;
	if (this.runtime.defend && Queue.burn.energy >= this.runtime.energy) {
		mode = 'defend';
		stat = 'energy';
	} else if (this.runtime.attack && Player.get('health') >= this.runtime.health
			&& Queue.burn.stamina >= this.runtime.stamina) {
		mode = 'attack';
		stat = 'stamina';
	}
	if (!this.runtime.check && !mode) {
		return QUEUE_FINISH;
	}
	if (!state) {
		return QUEUE_CONTINUE;
	}
	if (this.runtime.check) { // Parse pages of monsters we've not got the info for
		monster = this.data[this.runtime.check];
		uid = this.runtime.check.replace(/_\d+/,'');
		type = this.types[monster.type];
		if ((monster.last || 0) < Date.now() - this.option.check_interval) {
			debug( 'Reviewing ' + monster.name + '\'s ' + type.name);
			Page.to(
				type.raid
					? 'battle_raid'
					: 'monster_battle_monster',
				'?user=' + uid + ((monster.phase && this.option.assist) ? '&action=doObjective' : '') + (type.mpool ? '&mpool=' + type.mpool : ''));
			return QUEUE_RELEASE;
		}
		this.runtime.check = false;
		debug( 'Finished Monster / Raid review');
		return QUEUE_RELEASE;
	}
	uid = this.runtime[mode].replace(/_\d+/,'');
	monster = this.data[this.runtime[mode]];
	type = this.types[monster.type];
	if (type.raid) { // Raid has different buttons and generals
		if (!Generals.to((this.option.raid.search('Invade') === -1) ? 'raid-duel' : 'raid-invade')) {
			return QUEUE_CONTINUE;
		}
		switch(this.option.raid) {
		case 'Invade':
			btn = $('input[src$="raid_attack_button.gif"]:first');
			break;
		case 'Invade x5':
			btn = $('input[src$="raid_attack_button3.gif"]:first');
			break;
		case 'Duel':
			btn = $('input[src$="raid_attack_button2.gif"]:first');
			break;
		case 'Duel x5':
			btn = $('input[src$="raid_attack_button4.gif"]:first');
			break;
		}
	} else {
		//Primary method of finding button.
		if (!Generals.to(this.option.general ? 'monster_' + mode
				: this.option['general_'+mode])) {
			return QUEUE_CONTINUE;
		}
		debug('Try to ' + mode + ' ' + monster.name + '\'s ' + type.name);
		if (this.option[mode + '_max'] <= type[mode][0]) {
			btn = $(type[mode + '_button']).eq(0);
		} else {
			b = $(type[mode + '_button']).length - 1;
			for (i=b; i >= 0; i--){
				//debug('Burn ' + stat + ' is ' + Queue.burn[stat]);
				if (	type[mode][i] <= this.option[mode + '_max'] 
						&& Queue.burn[stat] >= type[mode][i] ) {
					//debug('Button cost is ' + type.defend[i]);
					this.runtime[stat + '_used'] = type[mode][i];
					btn = $(type[mode + '_button']).eq(i);
					break;
				}
			}
		}
		if (!btn || !btn.length){
			monster.button_fail = (monster.button_fail || 0) + 1;
			if (monster.button_fail > 10){
				log('Ignoring Monster ' + monster.name + '\'s ' + type.name + ': Unable to locate ' + mode + ' button ' + monster.button_fail + ' times!');
				monster.ignore = true;
				monster.button_fail = 0;
			}
		}
	}
	if (!btn || !btn.length ||
			(Page.page !== 'keep_monster_active'
				&& Page.page !== 'monster_battle_monster')
			|| ($('div[style*="dragon_title_owner"] img[linked]').attr('uid') !== uid
				&& $('div[style*="nm_top"] img[linked]').attr('uid') !== uid)) {
		//debug('Reloading page. Button = ' + btn.attr('name'));
		//debug('Reloading page. Page.page = '+ Page.page);
		//debug('Reloading page. Monster Owner UID is ' + $('div[style*="dragon_title_owner"] img[linked]').attr('uid') + ' Expecting UID : ' + uid);
		Page.to(type.raid ? 'battle_raid' : 'monster_battle_monster', '?user=' + uid
				+ ((monster.phase && this.option.assist) ? '&action=doObjective' : '')
				+ (type.mpool ? '&mpool=' + type.mpool : ''));
		return QUEUE_CONTINUE; // Reload if we can't find the button or we're on the wrong page
	}
	if (type.raid) {
		battle_list = Battle.get('user');
		if (this.option.force1) { // Grab a list of valid targets from the Battle Worker to substitute into the Raid buttons for +1 raid attacks.
			for (i in battle_list) {
				list.push(i);
			}
			$('input[name*="target_id"]').val((list[Math.floor(Math.random() * (list.length))] || 0)); // Changing the ID for the button we're gonna push.
		}
		target_info = $('div[id*="raid_atk_lst0"] div div').text().regex(/Lvl\s*([0-9]+).*Army: ([0-9]+)/);
		if ((this.option.armyratio !== 'Any' && ((target_info[1]/Player.get('army')) > this.option.armyratio) && this.option.raid.indexOf('Invade') >= 0) || (this.option.levelratio !== 'Any' && ((target_info[0]/Player.get('level')) > this.option.levelratio) && this.option.raid.indexOf('Invade') === -1)){ // Check our target (first player in Raid list) against our criteria - always get this target even with +1
			log('No valid Raid target!');
			Page.to('battle_raid', ''); // Force a page reload to change the targets
			return QUEUE_CONTINUE;
		}
	}
	Page.click(btn);
	monster.button_fail = 0;
	return QUEUE_RELEASE;
};

Monster.order = null;
Monster.dashboard = function(sort, rev) {
	var i, j, o, type, monster, url, list = [], output = [], sorttype = [null, 'name', 'health', 'defense', null, 'timer', 'eta'], state = {
		engage:0,
		assist:1,
		reward:2,
		complete:3
	}, blank, image_url;
	if (typeof sort === 'undefined') {
		this.order = [];
		for (mid in this.data) {
			this.order.push(mid);
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
	this.order.sort(function(a,b) {
		var aa, bb;
		if (state[Monster.data[a].state] > state[Monster.data[b].state]) {
			return 1;
		}
		if (state[Monster.data[a].state] < state[Monster.data[b].state]) {
			return -1;
		}
		if (typeof sorttype[sort] === 'string') {
			aa = Monster.data[a][sorttype[sort]];
			bb = Monster.data[b][sorttype[sort]];
		} else if (sort === 4) { // damage
			//			aa = Monster.data[a].damage ? Monster.data[a].damage[userID] : 0;
			//			bb = Monster.data[b].damage ? Monster.data[b].damage[userID] : 0;
			if (typeof Monster.data[a].damage !== 'undefined' && typeof Monster.data[a].damage.user !== 'undefined') {
				aa = sum(Monster.data[a].damage.user) / sum(Monster.data[a].damage);
			}
			if (typeof Monster.data[b].damage !== 'undefined' && typeof Monster.data[b].damage.user !== 'undefined') {
				bb = sum(Monster.data[b].damage.user) / sum(Monster.data[b].damage);
			}
		}
		if (typeof aa === 'undefined') {
			return 1;
		} else if (typeof bb === 'undefined') {
			return -1;
		}
		if (typeof aa === 'string' || typeof bb === 'string') {
			return (rev ? (''+bb).localeCompare(aa) : (''+aa).localeCompare(bb));
		}
		return (rev ? (aa || 0) - (bb || 0) : (bb || 0) - (aa || 0));
	});
	th(output, '');
	th(output, 'User');
	th(output, 'Health', 'title="(estimated)"');
	th(output, 'Att Bonus', 'title="Composite of Fortification or Dispel into an approximate attack bonus (+50%...-50%)."');
	//	th(output, 'Shield');
	th(output, 'Damage');
	th(output, 'Time Left');
	th(output, 'Kill In (ETD)', 'title="(estimated)"');
	th(output, '');
	list.push('<table cellspacing="0" style="width:100%"><thead><tr>' + output.join('') + '</tr></thead><tbody>');
	for (o=0; o<this.order.length; o++) {
		uid = this.order[o].replace(/_\d+/,'');
		monster = this.data[this.order[o]];
		type = this.types[monster.type];
		if (!type) {
			continue;
		}
		output = [];
		blank = !((monster.state === 'engage' || monster.state === 'assist') && monster.total);
		// http://apps.facebook.com/castle_age/battle_monster.php?user=00000&mpool=3
		// http://apps.facebook.com/castle_age/battle_monster.php?twt2=earth_1&user=00000&action=doObjective&mpool=3&lka=00000&ref=nf
		// http://apps.facebook.com/castle_age/raid.php?user=00000
		// http://apps.facebook.com/castle_age/raid.php?twt2=deathrune_adv&user=00000&action=doObjective&lka=00000&ref=nf
		if (Monster.option.assist_link && (monster.state === 'engage' || monster.state === 'assist')) {
			url = '?user=' + uid + '&action=doObjective' + (type.mpool ? '&mpool=' + type.mpool : '') + '&lka=' + uid + '&ref=nf';
		} else {
			url = '?user=' + uid + (type.mpool ? '&mpool=' + type.mpool : '');
		}
		td(output, '<a href="http://apps.facebook.com/castle_age/' + (type.raid ? 'raid.php' : 'battle_monster.php') + url + '"><img src="' + imagepath + type.list + '" style="width:72px;height:20px; position: relative; left: -8px; opacity:.7;" alt="' + type.name + '"><strong class="overlay">' + monster.state + '</strong></a>', 'title="' + type.name + ' | Achievement: ' + addCommas(type.achievement) + '"');
		image_url = imagepath + type.list;
		//debug(image_url);
		th(output, '<a class="golem-monster-ignore" name="'+this.order[o]+'" title="Toggle Active/Inactive"'+(monster.ignore ? ' style="text-decoration: line-through;"' : '')+'>'+monster.name+'</a>');
		td(output,
			blank
				? ''
				: monster.health === 100
					? '100%'
					: monster.health.round(1) + '%',
			blank
				? ''
				: 'title="' + addCommas(monster.total - sum(monster.damage)) + '"');
		td(output,
			blank
				? ''
				: isNumber(monster.attackbonus)
					? (monster.attackbonus.round(1))+'%'
					: '',
			(isNumber(monster.strength)
				? 'title="Max: '+((monster.strength-50).round(1))+'%"'
				: ''));
		td(output,
			(blank || monster.state !== 'engage' || (typeof monster.damage.user === 'undefined'))
				? ''
				: addCommas(sum(monster.damage.user)),
			blank
				? ''
				: 'title="' + ( sum(monster.damage.user) / monster.total * 100).round(2) + '% from ' + (sum(monster.stamina)/5 || 'an unknown number of') + ' PAs"');
		td(output,
			blank
				? ''
				: monster.timer
					? '<span class="golem-timer">' + makeTimer((monster.finish - Date.now()) / 1000) + '</span>'
					: '?');
		td(output,
			blank
				? ''
				: '<span class="golem-timer">' + (monster.health === 100
					? makeTimer((monster.finish - Date.now()) / 1000)
					: makeTimer((monster.eta - Date.now()) / 1000)) + '</span>');
		th(output, '<a class="golem-monster-delete" name="'+this.order[o]+'" title="Delete this Monster from the dashboard">[x]</a>');
		tr(list, output.join(''));
	}
	list.push('</tbody></table>');
	$('#golem-dashboard-Monster').html(list.join(''));
	$('a.golem-monster-delete').live('click', function(event){
		var x = $(this).attr('name');
		Monster._unflush();
		delete Monster.data[x];
		Monster.dashboard();
		return false;
	});
	$('a.golem-monster-ignore').live('click', function(event){
		var x = $(this).attr('name');
		Monster._unflush();
		Monster.data[x].ignore = !Monster.data[x].ignore;
		Monster.dashboard();
		if (Page.page !== 'monster_monster_list'){
			Page.to('monster_monster_list');
		} else {
			Page.to('index');
		}
		return false;
	});
	if (typeof sort !== 'undefined') {
		$('#golem-dashboard-Monster thead th:eq('+sort+')').attr('name',(rev ? 'reverse' : 'sort')).append('&nbsp;' + (rev ? '&uarr;' : '&darr;'));
	}
};

Monster.conditions = function (type, conditions) {
		if (!conditions || conditions.toLowerCase().indexOf(':' + type) < 0) {
			return false;
		}
		var value = conditions.substring(conditions.indexOf(':' + type) + type.length + 1).replace(new RegExp(":.+"), ''), first, second;
		if (/k$/i.test(value) || /m$/i.test(value)) {
			first = /\d+k/i.test(value);
			second = /\d+m/i.test(value);
			value = parseInt(value, 10) * 1000 * (first + second * 1000);
		}
		return parseInt(value, 10);
};

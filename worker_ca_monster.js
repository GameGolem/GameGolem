/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page, Queue, Resources,
	Battle, Generals, LevelUp, Player,
	APP, APPID, log, debug, userID, imagepath,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH
	makeTimer, Divisor, length, sum, findInObject, objectIndex, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
	makeImage, calc_rolling_weighted_average, bestObjValue
*/
/********** Worker.Monster **********
 * Automates Monster
 */
var Monster = new Worker('Monster');
Monster.temp = null;

Monster.defaults['castle_age'] = {
	pages:'monster_monster_list keep_monster_active monster_battle_monster battle_raid festival_monster_list festival_battle_monster monster_dead monster_remove_list'
};

Monster.option = {
	best_attack:true,
	best_defend:true,
	best_raid:true,
	general_defend:'any',
	general_attack:'any',
	general_raid:'any',
	defend: 80,
	//	quest_over: 90,
	min_to_attack: 20,
	defend_active:false,
	use_tactics:false,
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
	risk:false,
    points:false,
	remove:false
};

Monster.runtime = {
	check:false, // id of monster to check if needed, otherwise false
	attack:false, // id of monster if we have an attack target, otherwise false
	defend:false, // id of monster if we have a defend target, otherwise false
	secondary: false, // Is there a target for mage or rogue that is full or not in cycle?  Used to tell quest to wait if don't quest when fortifying is on.
	multiplier : {defend:1,attack:1}, // General multiplier like Orc King or Barbarus
	values : {defend:[],attack:[]}, // Attack/defend values available for levelup
	big : [], // Defend big values available for levelup
	energy: 0, // How much can be used for next attack
	stamina: 0, // How much can be used for next attack
	used:{stamina:0,energy:0}, // How much was used in last attack
	button: {attack: {pick:1, query:[]},  // Query - the jquery query for buttons, pick - which button to use
			defend: {pick:1, query:[]},
			count:1}, // How many attack/defend buttons can the player access?
	health:10, // minimum health to attack,
	mode: null, // Used by update to tell work if defending or attacking
	stat: null, // Used by update to tell work if using energy or stamina
	message: null, // Message to display on dash and log when removing or reviewing or collecting monsters
	
	levelupdefending : false, // Used to preserve the runtime.defending value even when in force.stamina mode
	page : null, // What page (battle or monster) the check page should go to
	monsters : {}, // Used for storing running weighted averages for monsters
	defending: false,	// hint for other workers as to whether we are potentially using energy to defend
	banthus : [], // Possible attack values for :ban condition crits
	banthusNow : false  // Set true when ready to use a Banthus crit
};

Monster.display = [
	{
		advanced:true,
		id:'remove',
		label:'Delete completed monsters',
		checkbox:true,
		help:'Check to have script remove completed monsters with rewards collected from the monster list.'
	},{
		title:'Attack',
		group:[
			{
				id:'best_attack',
				label:'Use Best General',
				checkbox:true
			},{
				advanced:true,
				id:'general_attack',
				label:'Attack General',
				require:'!best_attack',
				select:'generals'
			},{
				advanced:true,
				id:'hide',
				label:'Use Raids and Monsters to Hide',
				checkbox:true,
				require:'stop!="Priority List"',
				help:'Fighting Raids keeps your health down. Fight Monsters with remaining stamina.'
			},{
				advanced:true,
				id:'points',
				label:'Get Demi Points First',
				checkbox:true,
				help:'Use Battle to get Demi Points prior to attacking Monsters.'
			},{
				id:'min_to_attack',
				label:'Attack Over',
				text:1,
				help:'Attack if defense is over this value. Range of 0% to 100%.',
				after:'%'
			},{
				id:'use_tactics',
				label:'Use tactics',
				checkbox:true,
				help:'Use tactics to improve damage when it\'s available (may lower exp ratio)'
			},{
				id:'choice',
				label:'Attack',
				select:['Any', 'Strongest', 'Weakest', 'Shortest ETD', 'Longest ETD', 'Spread', 'Max Damage', 'Min Damage','ETD Maintain','Goal Maintain'],
				help:'Any selects a random monster.' +
					'\nStrongest and Weakest pick by monster health.' +
					'\nShortest and Longest ETD pick by estimated time the monster will die.' +
					'\nMin and Max Damage pick by your relative damage percent done to a monster.' +
					'\nETD Maintain picks based on the longest monster expiry time.' +
					'\nGoal Maintain picks by highest proportional damage needed to complete your damage goal in the time left on a monster.'
			},{
				id:'stop',
				label:'Stop',
				select:['Never', 'Achievement', '2X Achievement', 'Priority List', 'Continuous'],
				help:'Select when to stop attacking a target.'
			},{
				id:'priority',
				label:'Priority List',
				require:'stop==="Priority List"',
				textarea:true,
				help:'Prioritized list of which monsters to attack'
			},{
				advanced:true,
				id:'own',
				label:'Never stop on Your Monsters',
				require:'stop!=="Priority List"',
				checkbox:true,
				help:'Never stop attacking your own summoned monsters (Ignores Stop option).'
			},{
				advanced:true,
				id:'rescue',
				require:'stop!=="Priority List"',
				label:'Rescue failing monsters',
				checkbox:true,
				help:'Attempts to rescue failing monsters even if damage is at or above Stop Optionby continuing to attack. Can be used in coordination with Lost-cause monsters setting to give up if monster is too far gone to be rescued.'
			},{
				advanced:true,
				id:'avoid_lost_cause',
				label:'Avoid Lost-cause Monsters',
				require:'stop!=="Priority List"',
				checkbox:true,
				help:'Do not attack monsters that are a lost cause, i.e. the ETD is longer than the time remaining.'
			},{
				advanced:true,
				id:'lost_cause_hours',
				label:'Lost-cause if ETD is',
				require:'avoid_lost_cause',
				after:'hours after timer',
				text:true,
				help:'# of Hours Monster must be behind before preventing attacks.'
			},{
				id:'attack_min',
				label:'Min Stamina Cost',
				select:[1,5,10,20,50,100,200],
				help:'Select the minimum stamina for a single attack'
			},{
				id:'attack_max',
				label:'Max Stamina Cost',
				select:[1,5,10,20,50,100,200],
				help:'Select the maximum stamina for a single attack'
			}
		]
	},{
		title:'Defend',
		group:[
			{
				id:'defend_active',
				label:'Defend Active',
				checkbox:true,
				help:'Must be checked to defend.'
			},{
		//		id:'defend_group',
				require:'defend_active',
				group:[
					{
						id:'best_defend',
						label:'Use Best General',
						checkbox:true
					},{
						advanced:true,
						id:'general_defend',
						require:'!best_defend',
						label:'Defend General',
						select:'generals'
					},{
						id:'defend',
						label:'Defend Below',
						text:30,
						help:'Defend if defense is under this value. Range of 0% to 100%.',
						after:'%'
					},{
						id:'defend_min',
						label:'Min Energy Cost',
						select:[10,20,40,100,200],
						help:'Select the minimum energy for a single energy action'
					},{
						id:'defend_max',
						label:'Max Energy Cost',
						select:[10,20,40,100,200],
						help:'Select the maximum energy for a single energy action'
					}
				]
			}
		]
	},{
		title:'Raids',
		group:[
			{
				id:'best_raid',
				label:'Use Best General',
				checkbox:true
			},{
				advanced:true,
				id:'general_raid',
				label:'Raid General',
				require:'!best_raid',
				select:'generals'
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
				require:'raid!="Duel" && raid!="Duel x5"',
				label:'Target Army Ratio',
				select:['Any', 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.1, 1.2, 1.3, 1.4, 1.5],
				help:'Smaller number for smaller target army. Reduce this number if you\'re losing in Invade'
			},{
				id:'levelratio',
				require:'raid!="Invade" && raid!="Invade x5"',
				label:'Target Level Ratio',
				select:['Any', 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.1, 1.2, 1.3, 1.4, 1.5],
				help:'Smaller number for lower target level. Reduce this number if you\'re losing a lot'
			},{
				id:'force1',
				label:'Force +1',
				checkbox:true,
				help:'Force the first player in the list to aid.'
			}
		]
	},{
		title:'Siege Assist Options',
		group:[
			{
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
		]
	}
];

Monster.types = {
	// Quest unlocks
	kull: {
		name:'Kull, the Orc Captain',
		list:'orc_captain_list.jpg',
		image:'orc_captain_large.jpg',
		dead:'orc_captain_dead.jpg',
		achievement:1000, // total guess
		timer:259200, // 72 hours
		mpool:4,
		attack_button:'input[name="Attack Dragon"]',
		siege:false,
		attack:[1]
	},
	minotaur: {
		name:'Karn, The Minotaur',
		list:'monster_minotaur_list.jpg',
		image:'monster_minotaur.jpg',
		dead:'monster_minotaur_dead.jpg',
		achievement:10000, // total guess
		timer:432000, // 120 hours
		mpool:4,
		attack_button:'input[name="Attack Dragon"]',
		siege:false,
		attack:[1,6]
	},
	// Raids
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
		attack:[1,5],
		festival_timer: 345600, // 96 hours
		festival: 'stonegiant'
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
		attack:[1,5],
		festival_timer: 345600, // 96 hours
		festival: 'orcking'
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
		attack:[1,5],
		festival_timer: 320400, // 89 hours
		festival: 'mephistopheles'
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
		defend:[10,10,20,40,100],
		defense_img:'shield_img',
		festival_timer: 432000, // 120 hours
		festival: 'skaar_boss'
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
		attack:[1,5],
		festival_timer: 259200, // 72 hours
		festival: 'sylvanus'
	},
	ambrosia: {
		name:'Ambrosia',
		list:'boss_ambrosia_list.jpg',
		image:'boss_ambrosia_large.jpg',
		dead:'boss_ambrosia_dead.jpg',
		achievement:1000000,
		timer:604800, // 168 hours
		mpool:1,
		attack_button:'input[name="Attack Dragon"]',
		attack:[1,5,10,20,50] // Needs details
//		festival_timer: 259200, // 72 hours
//		festival: 'ambrosia'
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
		attack:[5,10],
		festival: 'dragon_green'
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
		attack:[5,10],
		festival_timer: 345600, // 96 hours
		festival: 'dragon_blue'
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
		attack:[5,10],
		festival_timer: 345600, // 96 hours
		festival: 'dragon_yellow'
	},
	dragon_red: {
		name:'Ancient Red Dragon',
		list:'dragon_list_red.jpg',
		image:'dragon_monster_red.jpg',
		image2:'dragon_monster.jpg',
		dead:'dead_dragon_image_red.jpg',
		achievement:100000,
		timer:259200, // 72 hours
		mpool:2,
		attack_button:'input[name="Attack Dragon"]',
		siege:false,
		attack:[5,10],
		festival_timer: 345600, // 96 hours
		festival: 'dragon_red'
	},
	serpent_amethyst: { 
		name:'Amethyst Sea Serpent',
		list:'seamonster_list_purple.jpg',
		image:'seamonster_purple.jpg',
		dead:'seamonster_dead.jpg',
		title:'monster_header_amyserpent.jpg',
		achievement:250000,
		timer:259200, // 72 hours
		mpool:2,
		attack_button:'input[name="Attack Dragon"]',
		siege:false,
		attack:[10,20],
		defend_button:'input[name="Defend against Monster"]',
		defend:[10],
		festival_timer: 345600, // 96 hours
		festival: 'seamonster_purple'
	},
	serpent_ancient: { 
		name:'Ancient Sea Serpent',
		list:'seamonster_list_red.jpg',
		image:'seamonster_red.jpg',
		dead:'seamonster_dead.jpg',
		title:'monster_header_ancientserpent.jpg',
		achievement:250000,
		timer:259200, // 72 hours
		mpool:2,
		attack_button:'input[name="Attack Dragon"]',
		siege:false,
		attack:[10,20],
		defend_button:'input[name="Defend against Monster"]',
		defend:[10],
		festival_timer: 345600, // 96 hours
		festival: 'seamonster_red'
	},
	serpent_emerald: { 
		name:'Emerald Sea Serpent',
		list:'seamonster_list_green.jpg',
		image:'seamonster_green.jpg',
		dead:'seamonster_dead.jpg',
		title:'seamonster_title_emerald.jpg',
		achievement:250000,
		timer:259200, // 72 hours
		mpool:2,
		attack_button:'input[name="Attack Dragon"]',
		siege:false,
		attack:[10,20],
		defend_button:'input[name="Defend against Monster"]',
		defend:[10],
		festival_timer: 345600, // 96 hours
		festival: 'seamonster_green'
	},
	serpent_sapphire: {
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
		attack:[10,20],
		defend_button:'input[name="Defend against Monster"]',
		defend:[10],
		festival_timer: 345600, // 96 hours
		festival: 'seamonster_blue'
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
		attack:[10,20,50,100,200],
		festival_timer: 691200, // 192 hours
		festival: 'hydra'
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
		defend:[10,10,20,40,100],
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
		defend:[10,10,20,40,100],
		festival_timer: 691200, // 192 hours
		festival: 'earth_element'
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
		defend:[10,10,20,40,100],
		defense_img:'shield_img',
		festival_timer: 691200, // 192 hours
		festival: 'water_element'
	},
	gehenna: {
		name:'Gehenna',
		list:'nm_gehenna_list.jpg',
		image:'nm_gehenna_large.jpg',
		dead:'nm_gehenna_dead.jpg',
		achievement:1000000,
		timer:604800, // 168 hours
		mpool:3,
		attack_button:'input[name="Attack Dragon"][src*="stab"],input[name="Attack Dragon"][src*="bolt"],input[name="Attack Dragon"][src*="smite"],input[name="Attack Dragon"][src*="bash"]',
		attack:[5,10,20,50],
		defend_button:'input[name="Attack Dragon"][src*="heal"]',
		defend:[10,20,40,100],
		festival_timer: 691200, // 192 hours
		festival: 'fire_element'
	},
	valhalla: {
		name:'Valhalla, The Air Elemental',
		list:'monster_valhalla_list.jpg',
		image:'monster_valhalla.jpg',
		dead:'monster_valhalla_dead.jpg',
		achievement:1000000,
		timer:604800, // 168 hours
		mpool:3,
		attack_button:'input[name="Attack Dragon"][src*="stab"],input[name="Attack Dragon"][src*="bolt"],input[name="Attack Dragon"][src*="smite"],input[name="Attack Dragon"][src*="bash"]',
		attack:[10,20,50,100,200],
		defend_button:'input[name="Attack Dragon"][src*="heal"]',
		defend:[20,40,100,200],
		festival_timer: 691200, // 192 hours
		festival: 'air_element'
	},
	bahamut: {
		name:'Bahamut, the Volcanic Dragon',
		list:'nm_volcanic_list.jpg',
		image:'nm_volcanic_large.jpg',
		dead:'nm_volcanic_dead.jpg',
		achievement:2000000, // Guesswork
		timer:604800, // 168 hours
		mpool:3,
		attack_button:'input[name="Attack Dragon"][src*="stab"],input[name="Attack Dragon"][src*="bolt"],input[name="Attack Dragon"][src*="smite"],input[name="Attack Dragon"][src*="bash"]',
		attack:[5,10,20,50],
		defend_button:'input[name="Attack Dragon"][src*="heal"]',
		defend:[10,20,40,100],
		festival_timer: 691200, // 192 hours
		festival: 'volcanic_new'
	},
	alpha_bahamut: {
		name:'Alpha Bahamut, the Volcanic Dragon',
		list:'nm_volcanic_list_2.jpg',
		image:'nm_volcanic_large_2.jpg',
		dead:'nm_volcanic_dead_2.jpg',
		achievement:6000000, // Guesswork
		timer:604800, // 168 hours
		mpool:3,
		attack_button:'input[name="Attack Dragon"][src*="stab"],input[name="Attack Dragon"][src*="bolt"],input[name="Attack Dragon"][src*="smite"],input[name="Attack Dragon"][src*="bash"]',
		attack:[5,10,20,50],
		defend_button:'input[name="Attack Dragon"][src*="heal"]',
		defend:[10,20,40,100]
	},
	azriel: {
		name:'Azriel, the Angel of Wrath',
		list:'nm_azriel_list.jpg',
		image:'nm_azriel_large2.jpg',
		dead:'nm_azriel_dead.jpg',
		achievement:6000000, // ~0.5%, 2X = ~1%
		timer:604800, // 168 hours
		mpool:1,
		attack_button:'input[name="Attack Dragon"][src*="stab"],input[name="Attack Dragon"][src*="bolt"],input[name="Attack Dragon"][src*="smite"],input[name="Attack Dragon"][src*="bash"]',
		attack:[5,10,20,50],
		defend_button:'input[name="Attack Dragon"][src*="heal"]',
		defend:[10,20,40,100],
		festival_timer: 691200, // 192 hours
		festival: 'boss_azriel'
	},
	red_plains: {
		name:'War of the Red Plains',
		list:'nm_war_list.jpg',
		image:'nm_war_large.jpg',
		dead:'nm_war_dead.jpg',
		achievement:2500,
		timer:604800, // 168 hours
		mpool:3,
		attack_button:'input[name="Attack Dragon"][src*="stab"],input[name="Attack Dragon"][src*="bolt"],input[name="Attack Dragon"][src*="smite"],input[name="Attack Dragon"][src*="bash"]',
		attack:[5,10,20,50],
		tactics_button:'input[name="Attack Dragon"][src*="tactics"]',
		tactics:[5,10,20,50],
		defend_button:'input[name="Attack Dragon"][src*="heal"]',
		defend:[10,20,40,100],
		orcs:true
	},
	corvintheus: {
		name:'Corvintheus',
		list:'corv_list.jpg',
		image:'boss_corv.jpg',
		dead:'boss_corv_dead.jpg',
		achievement:5000000,
		timer:604800, // 168 hours
		mpool:1,
		attack_button:'input[name="Attack Dragon"][src*="stab"],input[name="Attack Dragon"][src*="bolt"],input[name="Attack Dragon"][src*="smite"],input[name="Attack Dragon"][src*="bash"]',
		attack:[5,10,20,50],
		defend_button:'input[name="Attack Dragon"][src*="heal"]',
		defend:[10,20,40,100]
	},
	agamemnon: {
		name:'Agamemnon the Overseer',
		list:'boss_agamemnon_list.jpg',
		image:'boss_agamemnon_large.jpg',
		dead:'boss_agamemnon_dead.jpg',  // guess
		achievement:5000000,
		timer:604800, // 168 hours
		mpool:1,
		attack_button:'input[name="Attack Dragon"][src*="stab"],input[name="Attack Dragon"][src*="bolt"],input[name="Attack Dragon"][src*="smite"],input[name="Attack Dragon"][src*="bash"]',
		attack:[10,20,50,100,200],
		defend_button:'input[name="Attack Dragon"][src*="heal"]',
		defend:[20,40,100,200],
		festival_timer: 691200, // 192 hours
		festival : 'agamemnon'
	},
	jahanna: {
		name:'Jahanna, Priestess of Aurora',
		list:'boss_jahanna_list.jpg',
		image:'boss_jahanna_large.jpg',
		dead:'boss_jahanna_dead.jpg',
		achievement:5000000,
		timer:604800, // 168 hours
		mpool:1,
		attack_button:'input[name="Attack Dragon"][src*="stab"],input[name="Attack Dragon"][src*="bolt"],input[name="Attack Dragon"][src*="smite"],input[name="Attack Dragon"][src*="bash"]',
		attack:[10,20,50,100,200],
		defend_button:'input[name="Attack Dragon"][src*="heal"]',
		defend:[20,40,100,200]
	},
	aurora: {
		name:'Aurora',
		list:'boss_aurora_list.jpg',
		image:'boss_aurora_large.jpg',
		dead:'boss_aurora_dead.jpg',
		achievement:5000000,
		timer:604800, // 168 hours
		mpool:1,
		attack_button:'input[name="Attack Dragon"][src*="stab"],input[name="Attack Dragon"][src*="bolt"],input[name="Attack Dragon"][src*="smite"],input[name="Attack Dragon"][src*="bash"]',
		attack:[10,20,50,100,200],
		defend_button:'input[name="Attack Dragon"][src*="heal"]',
		defend:[20,40,100,200]
	},
	rebellion: {
		name:'Aurelius, Lion\'s Rebellion',
		list:'nm_aurelius_list.jpg',
		image:'nm_aurelius_large.jpg',
		dead:'nm_aurelius_large_dead.jpg',
		achievement:1000,
		timer:604800, // 168 hours
		mpool:1,
		attack_button:'input[name="Attack Dragon"][src*="stab"],input[name="Attack Dragon"][src*="bolt"],input[name="Attack Dragon"][src*="smite"],input[name="Attack Dragon"][src*="bash"]',
		attack:[5,10,20,50],
		tactics_button:'input[name="Attack Dragon"][src*="tactics"]',
		tactics:[5,10,20,50],
		defend_button:'input[name="Attack Dragon"][src*="heal"]',
		defend:[10,20,40,100],
		orcs:true
	},
	alpha_meph: {
		name:'Alpha Mephistopheles',
		list:'nm_alpha_mephistopheles_list.jpg',
		image:'nm_mephistopheles2_large.jpg',
		dead:'nm_mephistopheles2_dead.jpg',
		achievement:6000000,
		timer:604800, // 168 hours
		mpool:3,
		attack_button:'input[name="Attack Dragon"][src*="stab"],input[name="Attack Dragon"][src*="bolt"],input[name="Attack Dragon"][src*="smite"],input[name="Attack Dragon"][src*="bash"]',
		attack:[5,10,20,50],
		defend_button:'input[name="Attack Dragon"][src*="heal"]',
		defend:[10,20,40,100],
		festival_timer: 691200, // 192 hours
		festival: 'alpha_mephistopheles',
		festival_mpool: 1
	},
	giant_kromash: {
		name:'Kromash',
		list:'monster_kromash_list.jpg',
		image:'monster_kromash_large.jpg',
		dead:'monster_kromash_dead.jpg',
		achievement:6000000,
		timer:604800, // 168 hours
		mpool:3,
		attack_button:'input[name="Attack Dragon"][src*="stab"],input[name="Attack Dragon"][src*="bolt"],input[name="Attack Dragon"][src*="smite"],input[name="Attack Dragon"][src*="bash"]',
		attack:[5,10,20,50],
		defend_button:'input[name="Attack Dragon"][src*="heal"]',
		defend:[10,20,40,100]
	},
	giant_glacius: {
		name:'Glacius',
		list:'monster_glacius_list.jpg',
		image:'monster_glacius_large.jpg',
		dead:'monster_glacius_dead.jpg',
		achievement:6000000,
		timer:604800, // 168 hours
		mpool:3,
		attack_button:'input[name="Attack Dragon"][src*="stab"],input[name="Attack Dragon"][src*="bolt"],input[name="Attack Dragon"][src*="smite"],input[name="Attack Dragon"][src*="bash"]',
		attack:[5,10,20,50],
		defend_button:'input[name="Attack Dragon"][src*="heal"]',
		defend:[10,20,40,100]
	},
	giant_shardros: {
		name:'Shardros',
		list:'monster_shardros_list.jpg',
		image:'monster_shardros_large.jpg',
		dead:'monster_shardros_dead.jpg',
		achievement:6000000,
		timer:604800, // 168 hours
		mpool:3,
		attack_button:'input[name="Attack Dragon"][src*="stab"],input[name="Attack Dragon"][src*="bolt"],input[name="Attack Dragon"][src*="smite"],input[name="Attack Dragon"][src*="bash"]',
		attack:[5,10,20,50],
		defend_button:'input[name="Attack Dragon"][src*="heal"]',
		defend:[10,20,40,100]
	},
	giant_magmos: {
		name:'Magmos',
		list:'monster_magmos_list.jpg',
		image:'monster_magmos_large.jpg',
		dead:'monster_magmos_dead.jpg',
		achievement:6000000,
		timer:604800, // 168 hours
		mpool:3,
		attack_button:'input[name="Attack Dragon"][src*="stab"],input[name="Attack Dragon"][src*="bolt"],input[name="Attack Dragon"][src*="smite"],input[name="Attack Dragon"][src*="bash"]',
		attack:[5,10,20,50],
		defend_button:'input[name="Attack Dragon"][src*="heal"]',
		defend:[10,20,40,100]
	}
};

Monster.health_img = ['img[src$="nm_red.jpg"]', 'img[src$="monster_health_background.jpg"]'];
Monster.shield_img = ['img[src$="bar_dispel.gif"]'];
Monster.defense_img = ['img[src$="nm_green.jpg"]', 'img[src$="seamonster_ship_health.jpg"]'];
Monster.secondary_img = 'img[src$="nm_stun_bar.gif"]';
Monster.class_img = ['div[style*="nm_bottom"] img[src$="nm_class_warrior.jpg"]',
				'div[style*="nm_bottom"] img[src$="nm_class_cleric.jpg"]',
				'div[style*="nm_bottom"] img[src$="nm_class_rogue.jpg"]',
				'div[style*="nm_bottom"] img[src$="nm_class_mage.jpg"]',
				'div[style*="nm_bottom"] img[src$="nm_class_ranger.jpg"]',
				'div[style*="nm_bottom"] img[src$="nm_class_warlock.jpg"]'];
Monster.class_name = ['Warrior', 'Cleric', 'Rogue', 'Mage', 'Ranger', 'Warlock'];
Monster.secondary_off = 'img[src$="nm_s_off_cripple.gif"],img[src$="nm_s_off_deflect.gif"]';
Monster.secondary_on = 'input[name="Attack Dragon"][src*="cripple"],input[name="Attack Dragon"][src*="deflect"]';
Monster.warrior = 'input[name="Attack Dragon"][src*="strengthen"]';
Monster.raid_buttons = {
	'Invade':	'input[src$="raid_attack_button.gif"]:first',
	'Invade x5':'input[src$="raid_attack_button3.gif"]:first',
	'Duel':		'input[src$="raid_attack_button2.gif"]:first',
	'Duel x5':	'input[src$="raid_attack_button4.gif"]:first'};
Monster.name_re = null;
Monster.name2_re = /^\s*(.*\S)\s*'s\b/im; // secondary player/monster name match regexp

Monster.setup = function() {
	Resources.use('Energy');
	Resources.use('Stamina');
};

Monster.init = function() {
	var i, str;

	// BEGIN: fix up "under level 4" generals
	if (this.option.general_attack === 'under level 4') {
		this.set('option.general_attack', 'under max level');
	}
	if (this.option.general_defend === 'under level 4') {
		this.set('option.general_defend', 'under max level');
	}
	if (this.option.general_raid === 'under level 4') {
		this.set('option.general_raid', 'under max level');
	}
	// END

	this._watch(Player, 'data.health');
	this._watch(LevelUp, 'runtime');
	this._revive(60);
	this.runtime.limit = 0;
	if (isNumber(this.runtime.multiplier)) {
		delete this.runtime.multiplier;
		this.runtime.multiplier = {defend:1,attack:1}; // General multiplier like Orc King or Barbarus
	}
	delete this.runtime.record;

	// generate a complete primary player/monster name match regexp
	str = '';
	for (i in this.types) {
		if (this.types[i].name) {
			if (str !== '') {
				str += '|';
			}
			str += this.types[i].name.regexp_escape();
		}
	}
	this.name_re = new RegExp("^\\s*(.*\\S)\\s*'s\\s+(?:" + str + ')\\s*$', 'im');
};

Monster.parse = function(change) {
	var i, uid, name, type, tmp, list, el, mid, type_label, $health, $defense, $dispel, $secondary, dead = false, monster, timer, ATTACKHISTORY = 20, data = this.data, types = this.types, now = Date.now(), ensta = ['energy','stamina'], x, festival, parent = $('#'+APPID_+'app_body'), $children;
	//log(LOG_WARN, 'Parsing ' + Page.page);
	if (['keep_monster_active', 'monster_battle_monster', 'festival_battle_monster'].indexOf(Page.page)>=0) { // In a monster or raid
		festival = Page.page === 'festival_battle_monster';
		uid = $('img[linked][size="square"]').attr('uid');
		//log(LOG_WARN, 'Parsing for Monster type');
		for (i in types) {
			if (types[i].dead && $('img[src$="'+types[i].dead+'"]', parent).length 
					&& (!types[i].title || $('div[style*="'+types[i].title+'"]').length 
						|| $('div[style*="'+types[i].image+'"]', parent).length)) {
//			if (types[i].dead && $('img[src$="'+types[i].dead+'"]', parent).length) {
				//log(LOG_WARN, 'Found a dead '+i);
				type_label = i;
				timer = (festival ? types[i].festival_timer : 0) || types[i].timer;
				dead = true;
				break;
			} else if (types[i].image && $('img[src$="'+types[i].image+'"],div[style*="'+types[i].image+'"]', parent).length) {
				//log(LOG_WARN, 'Parsing '+i);
				type_label = i;
				timer = (festival ? types[i].festival_timer : 0) || types[i].timer;
				break;
			} else if (types[i].image2 && $('img[src$="'+types[i].image2+'"],div[style*="'+types[i].image2+'"]', parent).length) {
				//log(LOG_WARN, 'Parsing second stage '+i);
				type_label = i;
				timer = (festival ? types[i].festival_timer : 0) || types[i].timer2 || types[i].timer;
				break;
			}
		}
		if (!uid || !type_label) {
			log(LOG_WARN, 'Unable to identify monster' + (!uid ? ' owner' : '') + (!type_label ? ' type' : ''));
			return false;
		}
		mid = uid+'_' + (Page.page === 'festival_battle_monster' ? 'f' : (types[i].mpool || 4));
		if (this.runtime.check === mid) {
			this.set(['runtime','check'], false);
		}
		//log(LOG_WARN, 'MID '+ mid);
		this.set(['data',mid,'type'],type_label);
		monster = data[mid];
		monster.button_fail = 0;
		type = types[type_label];
		monster.last = now;
		if (Page.page === 'festival_battle_monster') {
			monster.page = 'festival';
		} else {
			monster.page = 'keep';
		}
		monster.name = $('img[linked][size="square"]').parent().parent().parent().text().replace('\'s summoned','').replace(' Summoned','').replace(/Monster Code: \w+:\d/,'').trim();
		if (dead) {
			// Will this catch Raid format rewards?
			if ($('input[src*="collect_reward_button"]').length) {
				monster.state = 'reward';
			} else if ($('td.dragonContainer table table a[href^="http://apps.facebook.com/castle_age/keep.php?casuser=' + userID + '"]').length) {
				if (!monster.dead) {
					History.add(type_label,1);
					monster.dead = true;
				}
				monster.state = 'complete';
				this.set(['data',mid,'remove'], true);
			} else {
				monster.state = null;
			}
			return false;
		}
		monster.stamina = monster.stamina || {};
		monster.damage = monster.damage || {};
		monster.damage.user = monster.damage.user || {};
		monster.energy = monster.energy || {};
		monster.defend = monster.defend || {};
		this.runtime.monsters[monster.type] = this.runtime.monsters[monster.type] || {};
		if ($('span.result_body').text().match(/for your help in summoning|You have already assisted on this objective|You don't have enough stamina assist in summoning/i)) {
			if ($('span.result_body').text().match(/for your help in summoning/i)) {
				monster.assist = now;
			}
			monster.state = monster.state || 'assist';
		} else {
			for (i in ensta) {
				if (this.runtime.used[ensta[i]]) {
					if ($('span[class="positive"]').length && $('span[class="positive"]').prevAll('span').text().replace(/[^0-9\/]/g,'')) {
						calc_rolling_weighted_average(this.runtime.monsters[monster.type]
								,'damage',Number($('span[class="positive"]').prevAll('span').text().replace(/[^0-9\/]/g,''))
								,ensta[i],this.runtime.used[ensta[i]],10);
						//log(LOG_WARN, 'Damage per ' + ensta[i] + ' = ' + this.runtime.monsters[monster.type]['avg_damage_per_' + ensta[i]]);
						if (Player.get('general') === 'Banthus Archfiend' 
								&& Generals.get(['data','Banthus Archfiend','charge'],1e99) < Date.now()) {
							Generals.set(['data','Banthus Archfiend','charge'],Date.now() + 4320000);
						}
						if (Player.get('general') === 'Zin'
								&& Generals.get(['data','Zin','charge'],1e99) < Date.now()) {
							Generals.set(['data','Zin','charge'],Date.now() + 82800000);
						}
					}
					this.runtime.used[ensta[i]] = 0;
					break;
				}
			}
		}
		if ($('img[src$="battle_victory"]').length) {
			History.add('raid+win',1);
		} else if ($('img[src$="battle_defeat"]').length) {
			History.add('raid+loss',-1);
		}
		// Check if variable number of button monster
		if (!type.raid && monster.state === 'engage' && type.attack.length > 2) {
			this.runtime.button.count = $(type.attack_button).length;
		}
		// Need to also parse what our class is for Bahamut.  (Can probably just look for the strengthen button to find warrior class.)
		for (i in Monster.class_img){
			if ($(Monster.class_img[i]).length){
				monster.mclass = i;
				break;
				//log(LOG_WARN, 'Monster class : '+Monster['class_name'][i]);
			}
		}
		if ($(Monster.warrior).length) {
			monster.warrior = true;
		}
		if ($(Monster.secondary_off).length) {
			monster.secondary = 100;
		} else if ($(Monster.secondary_on).length) {
			monster.secondary = 0.01; // Prevent from defaulting to false
			$secondary = $(Monster['secondary_img']);
			if ($secondary.length) {
				this.set(['data',mid,'secondary'], 100 * $secondary.width() / $secondary.parent().width());
				log(LOG_WARN, Monster['class_name'][monster.mclass]+" phase. Bar at "+monster.secondary+"%");
			}
		}
		// If we have some other class but no cleric button, then we can't heal.
		if ((monster.secondary || monster.warrior) && !$(type.defend_button).length) {
			monster.no_heal = true;
		}
		for (i in Monster['health_img']){
			if ($(Monster['health_img'][i]).length){
				$health = $(Monster['health_img'][i]).parent();
				monster.health = $health.length ? (100 * $health.width() / $health.parent().width()) : 0;
				break;
			}
		}
		if (!type.defense_img || type.defense_img === 'shield_img') {
			// If we know this monster should have a shield image and don't find it, assume 0
			if (type.defense_img === 'shield_img') {
				monster.defense = 100;
			}
			for (i in Monster['shield_img']){
				if ($(Monster['shield_img'][i]).length){
					$dispel = $(Monster['shield_img'][i]).parent();
					monster.defense = 100 * (1 - ($dispel.width() / ($dispel.next().length ? $dispel.width() + $dispel.next().width() : $dispel.parent().width())));
					break;
				}
			}
		}
		if (!type.defense_img || type.defense_img === 'defense_img') {
			// If we know this monster should have a defense image and don't find it, 
			for (i in Monster['defense_img']){
				if ($(Monster['defense_img'][i]).length){
					$defense = $(Monster['defense_img'][i]).parent();
					monster.defense = ($defense.width() / ($defense.next().length ? $defense.width() + $defense.next().width() : $defense.parent().width()) * 100);
					if ($defense.parent().width() < $defense.parent().parent().width()){
						monster.strength = 100 * $defense.parent().width() / $defense.parent().parent().width();
					} else {
						monster.strength = 100;
					}
					monster.defense = monster.defense * (monster.strength || 100) / 100;
					break;
				}
			}
		}
		monster.timer = $('#'+APPID_+'monsterTicker').text().parseTimer();
		monster.finish = now + (monster.timer * 1000);
		monster.damage.siege = 0;
		monster.damage.others = 0;
		if (!dead &&$('input[name*="help with"]').length && $('input[name*="help with"]').attr('title')) {
			//log(LOG_WARN, 'Current Siege Phase is: '+ this.data[mid].phase);
			monster.phase = $('input[name*="help with"]').attr('title').regex(/ (.*)/i);
			//log(LOG_WARN, 'Assisted on '+monster.phase+'.');
		}
		$('img[src*="siege_small"]').each(function(i,el){
			var /*siege = $(el).parent().next().next().next().children().eq(0).text(),*/ dmg = $(el).parent().next().next().next().children().eq(1).text().replace(/\D/g,'').regex(/(\d+)/);
			//log(LOG_WARN, 'Monster Siege',siege + ' did ' + dmg.addCommas() + ' amount of damage.');
			monster.damage.siege += dmg / (types[type_label].orcs ? 1000 : 1);
		});
		$('td.dragonContainer table table a[href^="http://apps.facebook.com/castle_age/keep.php?casuser="]').each(function(i,el){
			var user = $(el).attr('href').regex(/user=(\d+)/i), tmp, dmg, fort;
			if (types[type_label].raid){
				tmp = $(el).parent().next().text().replace(/[^0-9\/]/g,'');
			} else {
				tmp = $(el).parent().parent().next().text().replace(/[^0-9\/]/g,'');
			}
			dmg = tmp.regex(/(\d+)/);
			fort = tmp.regex(/\/(\d+)/);
			if (user === userID){
				Monster.set(['data',mid,'damage','user','manual'], dmg - (monster.damage.user.script || 0));
				monster.defend.manual = fort - (monster.defend.script || 0);
				monster.stamina.manual = Math.round(monster.damage.user.manual / Monster.runtime.monsters[type_label].avg_damage_per_stamina);
			} else {
				monster.damage.others += dmg;
			}
		});
		// If we're doing our first attack then add them without having to visit list
		if (monster.state === 'assist' && sum(monster.damage && monster.damage.user)) {
			monster.state = 'engage';
		}
		if (!type.raid && $(type.attack_button).length && sum(monster.damage && monster.damage.user)) {
			monster.state = monster.state || 'engage';
		}
		monster.dps = sum(monster.damage) / (timer - monster.timer);
		if (types[type_label].raid) {
			monster.total = sum(monster.damage) + $('div[style*="monster_health_back.jpg"] div:nth-child(2)').text().regex(/(\d+)/);
		} else {
			monster.total = Math.ceil(100 * sum(monster.damage) / (monster.health === 100 ? 0.1 : (100 - monster.health)));
		}
		monster.eta = now + (Math.floor((monster.total - sum(monster.damage)) / monster.dps) * 1000);
		this._taint[data] = true;
//		this.runtime.used.stamina = 0;
//		this.runtime.used.energy = 0;
	} else if (Page.page === 'monster_dead') {
		if (Queue.temp.current === 'Monster' && this.runtime.mid) { // Only if we went here ourselves...
			log(LOG_WARN, 'Deleting ' + data[this.runtime.mid].name + "'s " + data[this.runtime.mid].type);
			this.set(['data',this.runtime.mid]);
		} else {
			log(LOG_WARN, 'Unknown monster (timed out)');
		}
		this.set(['runtime','check'], false);
// Still need to do battle_raid
	} else if (Page.page === 'festival_monster_list') { // Check monster / raid list
		for (mid in data) {
			if (data[mid].page === 'festival'
					&& (data[mid].state !== 'assist' || data[mid].finish < now)) {
				data[mid].state = null;
			}
		}
		list = $('div[style*="festival_monster_list_middle.jpg"]')
		for (i=0; i<list.length; i++) {
			el = list[i];
			$children = $(el).children('div');
			try {
				this._transaction(); // BEGIN TRANSACTION
				assert(uid = $children.eq(3).find('a').attr('href').regex(/casuser=(\d+)/i), 'Unknown UserID');
				tmp = $children.eq(1).find('div').eq(0).attr('style').regex(/graphics\/([^.]*\....)/i);
				assert(type = findInObject(types, tmp, 'list'), 'Unknown monster type: '+tmp+ ' for ' + uid);
				assert(name = $children.eq(2).children().eq(0).text().replace(/'s$/i, ''), 'Unknown User Name');
//				log(LOG_WARN, 'Adding monster - uid: '+uid+', name: '+name+', image: "'+type+'"');
				mid = uid + '_f';
				this.set(['data',mid,'type'], type);
				this.set(['data',mid,'name'], name);
				this.set(['data',mid,'page'], 'festival');
				switch($children.eq(3).find('img').attr('src').filepart().regex(/(\w+)\.(gif|jpg)/)[0]) {
				case 'festival_monster_engagebtn':
					this.set(['data',mid,'state'], 'engage');
					break;
				case 'festival_monster_collectbtn':
					this.set(['data',mid,'state'], 'reward');
					break;
				case 'festival_monster_viewbtn':
					this.set(['data',mid,'state'], 'complete');
					break;
				default:
					this.set(['data',mid,'state'], 'unknown');
					break; // Should probably delete, but keep it on the list...
				}
				this._transaction(true); // COMMIT TRANSACTION
			} catch(e) {
				this._transaction(false); // ROLLBACK TRANSACTION on any error
				log(LOG_ERROR, e.name + ' in ' + this.name + '.parse(' + change + '): ' + e.message);
			}
		}
	} else if (Page.page === 'monster_monster_list') { // Check monster / raid list
		for (mid in data) {
			if (!types[data[mid].type].raid && data[mid].page !== 'festival'
					&& (data[mid].state !== 'assist' || data[mid].finish < now)) {
				data[mid].state = null;
			}
		}
		list = $('div[style*="monsterlist_container.gif"]')
		for (i=0; i<list.length; i++) {
			el = list[i];
			$children = $(el).children('div');
			try {
				this._transaction(); // BEGIN TRANSACTION
				assert(uid = $children.eq(2).find('input[name="casuser"]').attr('value'), 'Unknown UserID');
				tmp = $children.eq(0).find('img').eq(0).attr('src').regex(/graphics\/([^.]*\....)/i);
				assert(type = findInObject(types, tmp, 'list'), 'Unknown monster type: '+tmp);
				assert(name = $children.eq(1).children().eq(0).text().replace(/'s$/i, ''), 'Unknown User Name');
//				log(LOG_WARN, 'Adding monster - uid: '+uid+', name: '+name+', image: "'+type+'"');
				mid = uid + '_' + (types[type].mpool || 4);
				this.set(['data',mid,'type'], type);
				this.set(['data',mid,'name'], name);
				switch($children.eq(2).find('input[type="image"]').attr('src').regex(/(\w+)\.(gif|jpg)/)[0]) {
				case 'monsterlist_button_engage':
					this.set(['data',mid,'state'], 'engage');
					break;
				case 'monster_button_collect':
					// Can't tell if complete or reward, so set to complete, and will find reward when next visited
					this.set(['data',mid,'state'], 'complete');
					break;
				default:
					this.set(['data',mid,'state'], 'unknown');
					break; // Should probably delete, but keep it on the list...
				}
				this._transaction(true); // COMMIT TRANSACTION
			} catch(e) {
				this._transaction(false); // ROLLBACK TRANSACTION on any error
				log(LOG_ERROR, e.name + ' in ' + this.name + '.parse(' + change + '): ' + e.message);
			}
		}
	} else if (Page.page === 'monster_remove_list') { // Check monster / raid list
		for (mid in data) {
			if (!types[data[mid].type].raid && data[mid].page !== 'festival'
					&& (data[mid].state !== 'assist' || data[mid].finish < now)) {
				data[mid].state = null;
			}
		}
		$('#app'+APPID+'_app_body div.imgButton').each(function(a,el) {
			var link = $('a', el).attr('href'), mid;
			if (link && link.regex(/casuser=([0-9]+)/i)) {
				mid = link.regex(/casuser=([0-9]+)/i)+'_'+link.regex(/mpool=([0-9])/i);
				log(LOG_WARN, 'MID '+ mid);
				switch($('img', el).attr('src').regex(/dragon_list_btn_([0-9])/)) {
				case 2:
					Monster.set(['data',mid,'state'], 'reward');
					break;
				case 3:
					Monster.set(['data',mid,'state'], 'engage');
					break;
				case 4:
					Monster.set(['data',mid,'state'], 'complete');
					Monster.set(['data',mid,'remove'], true);
					break;
				default:
					Monster.set(['data',mid,'state'], 'unknown');
					break; // Should probably delete, but keep it on the list...
				}
			}
		});
	}
	return false;
};

Monster.resource = function() {
	if (Monster.runtime.banthus.length && Generals.get(['data','Banthus Archfiend','charge'],1e99) < Date.now()) {
		Monster.set(['runtime','banthusNow'], true);
		LevelUp.set(['runtime','basehit'], Monster.runtime.banthus.lower(LevelUp.get(['runtime','stamina'], 0)));
		LevelUp.set(['runtime','general'], 'Banthus Archfiend');
		return 'stamina';
	}
	Monster.set(['runtime','banthusNow'], false);
	return false;
};

Monster.update = function(event) {
	if (event.type === 'runtime' && event.worker.name !== 'LevelUp') {
		return;
	}
	var i, j, mid, uid, type, stat_req, req_stamina, req_health, req_energy, messages = [], fullname = {}, list = {}, listSortFunc, matched_mids = [], min, max, limit, filter, ensta = ['energy','stamina'], defatt = ['defend','attack'], button_count, monster, damage, target, now = Date.now(), waiting_ok;
	this.runtime.mode = this.runtime.stat = this.runtime.check = this.runtime.message = this.runtime.mid = null;
	this.runtime.big = this.runtime.values.attack = this.runtime.values.defend = [];
	limit = this.runtime.limit;
	if(!LevelUp.runtime.running && limit === 100){
		limit = 0;
	}
	list.defend = [];
	list.attack = [];
	// Flush stateless monsters
	for (mid in this.data) {
		if (!this.data[mid].state) {
			log(LOG_LOG, 'Deleted monster MID ' + mid + ' because state is ' + this.data[mid].state);
			delete this.data[mid];
		}
	}
	// Check for unviewed monsters
	for (mid in this.data) {
		if (!this.data[mid].last && !this.data[mid].ignore && this.data[mid].state === 'engage') {
			this.page(mid, 'Checking new monster ', 'casuser','');
			this.runtime.defending = true;
			this.data[mid].last = now; // Force it to only check once
			return;
		}
	}
	// Some generals use more stamina, but only in certain circumstances...
	defatt.forEach( function(mode) {
		Monster.runtime.multiplier[mode] = (Generals.get([LevelUp.runtime.general || (Generals.best(Monster.option['best_' + mode] ? ('monster_' + mode) : Monster.option['general_' + mode])), 'skills'], '').regex(/Increase Power Attacks by (\d+)/i) || 1);
		//log(LOG_WARN, 'mult ' + mode + ' X ' + Monster.runtime.multiplier[mode]);
	});
	waiting_ok = !this.option.hide && !LevelUp.runtime.force.stamina;
	if (this.option.stop === 'Priority List') {
		var condition, searchterm, attack_found = false, defend_found = false, attack_overach = false, defend_overach = false, o, suborder, p, defense_kind, button, order = [];
		this.runtime.banthus = [];
		if (this.option.priority) {
			order = this.option.priority.toLowerCase().replace(/ *[\n,]+ */g,',').replace(/[, ]*\|[, ]*/g,'|').split(',');
		}
		order.push('your ','\'s'); // Catch all at end in case no other match
		for (o=0; o<order.length; o++) {
			order[o] = order[o].trim();
			if (!order[o]) {
				continue;
			}
			if (order[o] === 'levelup') {
				if ((LevelUp.runtime.force.stamina && !list.attack.length) 
						|| (LevelUp.runtime.force.energy && !list.defend.length)) {
					matched_mids = [];
					continue;
				} else {
					break;
				}
			}
			suborder = order[o].split('|');
			for (p=0; p<suborder.length; p++) {
				suborder[p] = suborder[p].trim();
				if (!suborder[p]) {
					continue;
				}
				searchterm = suborder[p].match(new RegExp("^[^:]+")).toString().trim();
				condition = suborder[p].replace(new RegExp("^[^:]+"), '').toString().trim();
				//log(LOG_WARN, 'Priority order ' + searchterm +' condition ' + condition + ' o ' + o + ' p ' + p);
				for (mid in this.data) {
					monster = this.data[mid];
					type = this.types[monster.type];
					//If this monster does not match, skip to next one
					// Or if this monster is dead, skip to next one
					if (	matched_mids.indexOf(mid)>=0
							||((monster.name === 'You' ? 'Your' : monster.name + '\'s')
								+ ' ' + type.name).toLowerCase().indexOf(searchterm) < 0
							|| monster.ignore) {
						continue;
					}
					matched_mids.push(mid);
					monster.ac = /:ac\b/.test(condition);
					if (monster.state !== 'engage') {
						continue;
					}
					//Monster is a match so we set the conditions
					monster.max = this.conditions('max',condition);
					monster.ach = this.conditions('ach',condition) || type.achievement;
					// check for min/max stamina/energy overrides
					if ((i = this.conditions('smin',condition)) && isNumber(i) && !isNaN(i)) {
						monster.smin = i;
					} else if (monster.smin) {
						delete monster.smin;
					}
					if ((i = this.conditions('smax',condition)) && isNumber(i) && !isNaN(i)) {
						monster.smax = i;
					} else if (monster.smax) {
						delete monster.smax;
					}
					if ((i = this.conditions('emin',condition)) && isNumber(i) && !isNaN(i)) {
						monster.emin = i;
					} else if (monster.emin) {
						delete monster.emin;
					}
					if ((i = this.conditions('emax',condition)) && isNumber(i) && !isNaN(i)) {
						monster.emax = i;
					} else if (monster.emax) {
						delete monster.emax;
					}

					// check for pa ach/max overrides
					if ((i = this.conditions('achpa',condition)) && isNumber(i) && !isNaN(i)) {
						monster.achpa = i;
						if (isNumber(j = this.runtime.monsters[monster.type].avg_damage_per_stamina) && !isNaN(j)) {
							monster.ach = Math.ceil(i * 5 * j);
						}
					} else if (monster.achpa) {
						delete monster.achpa;
					}
					if ((i = this.conditions('maxpa',condition)) && isNumber(i) && !isNaN(i)) {
						monster.maxpa = i;
						if (isNumber(j = this.runtime.monsters[monster.type].avg_damage_per_stamina) && !isNaN(j)) {
							monster.max = Math.ceil(i * 5 * j);
						}
					} else if (monster.maxpa) {
						delete monster.maxpa;
					}

					monster.attack_min = this.conditions('a%',condition) || this.option.min_to_attack;
					if (isNumber(monster.ach) && !isNaN(monster.ach) && (!isNumber(monster.max) || isNaN(monster.max))) {
						monster.max = monster.ach;
					}
					if (isNumber(monster.max) && !isNaN(monster.max) && (!isNumber(monster.ach) || isNaN(monster.ach))) {
						monster.ach = monster.max;
					}
					if (isNumber(monster.max) && !isNaN(monster.max)) {
						monster.ach=Math.min(monster.ach, monster.max);
					}
					if (type.defend) {
						monster.defend_max = Math.min(this.conditions('f%',condition) || this.option.defend, (monster.strength || 100) - 1);
					}
					damage = 0;
					if (monster.damage && monster.damage.user) {
						damage += sum(monster.damage.user);
					}
					if (monster.defend) {
						damage += sum(monster.defend);
					}
					target = monster.max || monster.ach || 0;
					if(!type.raid){
						button_count = ((type.attack.length > 2) ? this.runtime.button.count : type.attack.length);
					}
					req_stamina = type.raid ? (this.option.raid.search('x5') === -1 ? 1	: 5)
							: Math.min(type.attack[Math.min(button_count, monster.smax || type.attack.length)-1], Math.max(type.attack[0], LevelUp.runtime.basehit || monster.smin || this.option.attack_min)) * this.runtime.multiplier.attack;
					req_health = type.raid ? (this.option.risk ? 13 : 10) : 10;
// Don't want to die when attacking a raid
					//log(LOG_WARN, 'monster name ' + type.name + ' basehit ' + LevelUp.runtime.basehit +' min ' + type.attack[Math.min(button_count, monster.smax || type.attack.length)-1]);
					if ((monster.defense || 100) >= monster.attack_min) {
// Set up this.values.attack for use in levelup calcs
						if (type.raid) {
							this.runtime.values.attack = this.runtime.values.attack.concat((this.option.raid.search('x5') < 0) ? 1 : 5).unique();
// If it's a defense monster, never hit for 1 damage.  Otherwise, 1 damage is ok.
						} else {
							if (damage < this.conditions('ban',condition)) {
								this.runtime.banthus = this.runtime.banthus.concat(type.attack).unique();
							}
							if (type.defend && type.attack.indexOf(1) > -1) {
								this.runtime.values.attack = this.runtime.values.attack.concat(type.attack.slice(1,this.runtime.button.count)).unique();
							} else {
								this.runtime.values.attack = this.runtime.values.attack.concat(type.attack.slice(0,this.runtime.button.count)).unique();
							}
						}
						if ((attack_found === false || attack_found === o)
								&& (waiting_ok || (Player.get('health', 0) >= req_health
								&& LevelUp.runtime.stamina >= req_stamina))
								&& (!this.runtime.banthusNow	
									|| damage < this.conditions('ban',condition))
								&& (!LevelUp.runtime.basehit
									|| type.attack.indexOf(LevelUp.runtime.basehit)>= 0)) {
							button = type.attack_button;
							if (this.option.use_tactics && type.tactics) {
								button = type.tactics_button;
							}
							if (damage < monster.ach
									|| (this.runtime.banthusNow	
										&& damage < this.conditions('ban',condition))
									|| (LevelUp.runtime.basehit
										&& type.attack.indexOf(LevelUp.runtime.basehit)>= 0)) {
								attack_found = o;
								if (attack_found && attack_overach) {
									list.attack = [[mid, damage / sum(monster.damage), button, damage, target]];
									attack_overach = false;
								} else {
									list.attack.push([mid, damage / sum(monster.damage), button, damage, target]);
								}
								//log(LOG_WARN, 'ATTACK monster ' + monster.name + ' ' + type.name);
							} else if ((monster.max === false || damage < monster.max)
									&& !attack_found 
									&& (attack_overach === false || attack_overach === o)) {
								list.attack.push([mid, damage / sum(monster.damage), button, damage, target]);
								attack_overach = o;
							}
						}
					}
					// Possible defend target?
					if (!monster.no_heal && type.defend && this.option.defend_active
							&& (/:big\b/.test(condition)
								|| ((monster.defense || 100) < monster.defend_max))) {
						this.runtime.big = this.runtime.big.concat(type.defend.slice(0,this.runtime.button.count)).unique();
					}
					if (this.option.defend_active && (defend_found === false || defend_found === o)) {
						defense_kind = false;
						if (typeof monster.secondary !== 'undefined' && monster.secondary < 100) {
							//log(LOG_WARN, 'Secondary target found (' + monster.secondary + '%)');
							defense_kind = Monster.secondary_on;
						} else if (monster.warrior && (monster.strength || 100) < 100 && monster.defense < monster.strength - 1) {
							defense_kind = Monster.warrior;
						} else if (!monster.no_heal 
								&& ((/:big\b/.test(condition) && LevelUp.runtime.big)
									|| (monster.defense || 100) < monster.defend_max)) {
							defense_kind = type.defend_button;
						}
						if (defense_kind) {
							this.runtime.values.defend = this.runtime.values.defend.concat(type.defend.slice(0,this.runtime.button.count)).unique();
							//log(LOG_WARN, 'defend ok' + damage + ' ' + LevelUp.runtime.basehit+ ' ' + type.defend.indexOf(LevelUp.runtime.basehit));
							if (!LevelUp.runtime.basehit 
									|| type.defend.indexOf(LevelUp.runtime.basehit)>= 0) {
								if (damage < monster.ach
										|| (/:sec\b/.test(condition)
											&& defense_kind === Monster.secondary_on)) {
									//log(LOG_WARN, 'DEFEND monster ' + monster.name + ' ' + type.name);
									defend_found = o;
								} else if ((monster.max === false || damage < monster.max)
										&& !defend_found && (defend_overach === false  || defend_overach === o)) {
									defend_overach = o;
								} else {
									continue;
								}
								if (defend_found && defend_overach) {
									list.defend = [[mid, damage / sum(monster.damage), defense_kind, damage, target]];
									defend_overach = false;
								} else {
									list.defend.push([mid, damage / sum(monster.damage), defense_kind, damage, target]);
								}
							}
						}
					}
				}
			}
		}
		matched_mids = [];
	} else {
		// Make lists of the possible attack and defend targets
		for (mid in this.data) {
			monster = this.data[mid];
			type = this.types[monster.type];
                        if(!type.raid){
                                button_count = ((type.attack.length > 2) ? this.runtime.button.count : type.attack.length);
                        }
			req_stamina = type.raid ? (this.option.raid.search('x5') === -1 ? 1	: 5)
					: Math.min(type.attack[Math.min(button_count,type.attack.length)-1], Math.max(type.attack[0], LevelUp.runtime.basehit || monster.smin || this.option.attack_min)) * this.runtime.multiplier.attack;
			req_health = type.raid ? (this.option.risk ? 13 : 10) : 10; // Don't want to die when attacking a raid
			monster.ach = (this.option.stop === 'Achievement') ? type.achievement : (this.option.stop === '2X Achievement') ? type.achievement : (this.option.stop === 'Continuous') ? type.achievement :0;
			monster.max = (this.option.stop === 'Achievement') ? type.achievement : (this.option.stop === '2X Achievement') ? type.achievement*2 : (this.option.stop === 'Continuous') ? type.achievement*this.runtime.limit :0;
			if (	!monster.ignore
					&& monster.state === 'engage'
					&& monster.finish > Date.now()	) {
				uid = mid.replace(/_.+/,'');
				/*jslint eqeqeq:false*/
				if (uid == userID && this.option.own) {
				/*jslint eqeqeq:true*/
					// add own monster
				} else if (this.option.avoid_lost_cause
						&& (monster.eta - monster.finish)/3600000
							> this.option.lost_cause_hours && (!LevelUp.option.override || !LevelUp.runtime.running) && !monster.override) {
					continue;  // Avoid lost cause monster
				} else if (this.option.rescue
						&& (monster.eta
							>= monster.finish - this.option.check_interval)) {
					// Add monster to rescue
				} else if (this.option.stop === 'Achievement'
						&& sum(monster.damage && monster.damage.user) + sum(monster.defend)
							> (type.achievement || 0)) {
					continue; // Don't add monster over achievement
				} else if (this.option.stop === '2X Achievement'
						&& sum(monster.damage && monster.damage.user) + sum(monster.defend)
							> type.achievement * 2) {
					continue; // Don't add monster over 2X  achievement
				} else if (this.option.stop === 'Continuous'
						&& sum(monster.damage && monster.damage.user) + sum(monster.defend)
							> type.achievement * limit) {
					continue; // Don't add monster over 2X  achievement
				}
				damage = 0;
				if (monster.damage && monster.damage.user) {
					damage += sum(monster.damage.user);
				}
				if (monster.defend) {
					damage += sum(monster.defend);
				}
				/*jslint eqeqeq:false*/
				if ((uid == userID && this.option.own) || this.option.stop === 'Never') {
				/*jslint eqeqeq:true*/
					target = 1e99;
				} else if (this.option.stop === 'Achievement') {
					target = type.achievement || 0;
				} else if (this.option.stop === '2X Achievement') {
					target = (type.achievement || 0) * 2;
				} else if (this.option.stop === 'Continuous') {
					target = (type.achievement || 0) * limit;
				} else {
					target = 0;
				}
				// Possible attack target?
				if ((waiting_ok || (Player.get('health', 0) >= req_health && LevelUp.runtime.stamina >= req_stamina))
				 && (isNumber(monster.defense) ? monster.defense : 100) >= Math.max(this.option.min_to_attack,0.1)) {
// Set up this.values.attack for use in levelup calcs
					if (type.raid) {
						this.runtime.values.attack = this.runtime.values.attack.concat((this.option.raid.search('x5') < 0) ? 1 : 5).unique();
// If it's a defense monster, never hit for 1 damage.  Otherwise, 1 damage is ok.
					} else if (type.defend && type.attack.indexOf(1) > -1) {
						this.runtime.values.attack = this.runtime.values.attack.concat(type.attack.slice(1,this.runtime.button.count)).unique();
					} else {
						this.runtime.values.attack = this.runtime.values.attack.concat(type.attack.slice(0,this.runtime.button.count)).unique();
					}
					if (this.option.use_tactics && type.tactics) {
						list.attack.push([mid, (sum(monster.damage && monster.damage.user) + sum(monster.defend)) / sum(monster.damage), type.tactics_button, damage, target]);
					} else {
						list.attack.push([mid, (sum(monster.damage && monster.damage.user) + sum(monster.defend)) / sum(monster.damage), type.attack_button, damage, target]);
					}
				}
				// Possible defend target?
				if (this.option.defend_active) {
					if(type.defend) {
						this.runtime.values.defend = this.runtime.values.defend.concat(type.defend.slice(0,this.runtime.button.count)).unique();
					}
					if ((monster.secondary || 100) < 100) {
						list.defend.push([mid, (sum(monster.damage && monster.damage.user) + sum(monster.defend)) / sum(monster.damage), Monster.secondary_on, damage, target]);
					} else if (monster.warrior && (monster.strength || 100) < 100){
						list.defend.push([mid, (sum(monster.damage && monster.damage.user) + sum(monster.defend)) / sum(monster.damage), Monster.warrior, damage, target]);
					} else if ((monster.defense || 100) < Math.min(this.option.defend, (monster.strength -1 || 100))
                                                && !monster.no_heal) {
						list.defend.push([mid, (sum(monster.damage && monster.damage.user) + sum(monster.defend)) / sum(monster.damage), type.defend_button, damage, target]);
					}
				}
			}
		}
	}
	this.runtime.defending = list.defend && list.defend.length > 0;
	// If using the priority list and levelup settings, the script may oscillate between having something to defend when in level up, and then forgetting it when it goes to attack something because it doesn't pass levelup in the priority list and tries to quest, and then finds it again.  The following preserves the runtime.defending value even when in force.stamina mode
	if (LevelUp.runtime.force.stamina) {
		this.runtime.defending = this.runtime.levelupdefending;
	} else {
		this.runtime.levelupdefending = this.runtime.defending;
	}
	
	listSortFunc = function(a,b){
		var monster_a = Monster.data[a[0]], monster_b = Monster.data[b[0]], late_a, late_b, time_a, time_b, goal_a, goal_b;
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
			late_a = monster_a.eta - monster_a.finish;
			late_b = monster_b.eta - monster_b.finish;
			// this is what used to happen before r655
			//return late_a < late_b ? 1 : (late_a > late_b ? -1 : 0);
			// this should capture the same intent,
			// but continue provide sorting after monsters are caught up
			return late_b - late_a;
		case 'Goal Maintain':
			time_a = Math.max(1, now - Math.min(monster_a.eta || monster_a.finish, monster_a.finish));
			time_b = Math.max(1, now - Math.min(monster_b.eta || monster_b.finish, monster_b.finish));
			// aim a little before the end so we aren't caught short
			time_a = Math.max((time_a + now) / 2, time_a - 14400000); // 4 hours

			time_b = Math.max((time_b + now) / 2, time_b - 14400000);
			goal_a = Math.max(1, a[4] - a[3]);
			goal_b = Math.max(1, b[4] - b[3]);
			return (goal_b / time_b) - (goal_a / time_a);
		}
	};
	for (i in list) {
		// Find best target
		//log(LOG_WARN, 'list ' + i + ' is ' + length(list[i]));
		if (list[i].length) {
			if (list[i].length > 1) {
				list[i].sort(listSortFunc);
			}
			this.runtime[i] = mid = list[i][0][0];
			this.runtime.button[i].query = list[i][0][2];
			uid = mid.replace(/_.+/,'');
			type = this.types[this.data[mid].type];
			fullname[i] = (uid === userID ? 'your ': (this.data[mid].name + '\'s ')) + type.name;
		} else {
			this.runtime[i] = false;
		}
	}
	// Make the * dash messages for current attack and defend targets
	for (i in ensta) {
		if (this.runtime[defatt[i]]) {
			monster = this.data[this.runtime[defatt[i]]];
			type = this.types[monster.type];
			// Calculate what button for att/def and how much energy/stamina cost
			if (ensta[i] === 'stamina' && type.raid) {
				this.runtime[ensta[i]] = this.option.raid.search('x5') < 0 ? 1 : 5;
			} else {
				button_count = ((type.attack.length > 2) ? this.runtime.button.count : type[defatt[i]].length);
				min = Math.min(type[defatt[i]][Math.min(button_count,type[defatt[i]].length)-1], Math.max(type[defatt[i]][0], LevelUp.runtime.basehit || this.option[defatt[i] + '_min']));
				max = Math.min(type[defatt[i]][Math.min(button_count,type[defatt[i]].length)-1], LevelUp.runtime.basehit || this.option[defatt[i] + '_max'], LevelUp.runtime[ensta[i]] / this.runtime.multiplier[defatt[i]]);
				damage = sum(monster.damage && monster.damage.user) + sum(monster.defend);
				limit = (LevelUp.runtime.big ? max : damage < (monster.ach || damage)
						? monster.ach : damage < (monster.max || damage)
						? monster.max : max);
				max = Math.min(max,(limit - damage)/(this.runtime.monsters[monster.type]['avg_damage_per_'+ensta[i]] || 1)/this.runtime.multiplier[defatt[i]]);
				//log(LOG_WARN, 'monster damage ' + damage + ' average damage ' + (this.runtime.monsters[monster.type]['avg_damage_per_'+ensta[i]] || 1).round(0) + ' limit ' + limit + ' max ' + ensta[i] + ' ' + max.round(1));
				filter = function(e) { return (e >= min && e <= max); };
				this.runtime.button[defatt[i]].pick = bestObjValue(type[defatt[i]], function(e) { return e; }, filter) || type[defatt[i]].indexOf(min);
				//log(LOG_WARN, ' ad ' + defatt[i] + ' min ' + min + ' max ' + max+ ' pick ' + this.runtime.button[defatt[i]].pick);
				//log(LOG_WARN, 'min detail '+ defatt[i] + ' # buttons   ' + Math.min(this.runtime.button.count,type[defatt[i]].length) +' button val ' +type[defatt[i]][Math.min(this.runtime.button.count,type[defatt[i]].length)-1] + ' max of type[0] ' + type[defatt[i]][0] + ' queue or option ' + (LevelUp.runtime.basehit || this.option[defatt[i] + '_min']));
				//log(LOG_WARN, 'max detail '+ defatt[i] + ' physical max ' + type[defatt[i]][Math.min(this.runtime.button.count,type[defatt[i]].length)-1] + ' basehit||option ' + (LevelUp.runtime.basehit || this.option[defatt[i]]) + ' stamina avail ' + (LevelUp.runtime[ensta[i]] / this.runtime.multiplier[defatt[i]]));
				this.runtime[ensta[i]] = type[defatt[i]][this.runtime.button[defatt[i]].pick] * this.runtime.multiplier[defatt[i]];
			}
			this.runtime.health = type.raid ? 13 : 10; // Don't want to die when attacking a raid
			req_health = (defatt[i] === 'attack' ? Math.max(0, this.runtime.health - Player.get('health', 0)) : 0);
			stat_req = Math.max(0, (this.runtime[ensta[i]] || 0) - LevelUp.runtime[ensta[i]]);
			if (stat_req || req_health) {
				messages.push('Waiting for ' + (stat_req ? makeImage(ensta[i]) + stat_req : '')
				+ (stat_req && req_health ? ' &amp; ' : '') + (req_health ? makeImage('health') + req_health : '')
				+ ' to ' + defatt[i] + ' ' + fullname[defatt[i]]
				+ ' (' + makeImage(ensta[i]) + (this.runtime[ensta[i]] || 0) + '+' + (stat_req && req_health ? ', ' : '') + (req_health ? makeImage('health') + req_health : '') + ')');
			} else {
				messages.push(defatt[i] + ' ' + fullname[defatt[i]] + ' (' + makeImage(ensta[i])
						+ (this.runtime[ensta[i]] || 0) + '+)');
				this.runtime.mode = this.runtime.mode || defatt[i];
				this.runtime.stat = this.runtime.stat || ensta[i];
			}
		}
	}
	if (this.runtime.mode === 'attack' && Battle.runtime.points && this.option.points && Battle.runtime.attacking) {
		this.runtime.mode = this.runtime.stat = null;
	}
	// Nothing to attack, so look for monsters we haven't reviewed for a while.
	//log(LOG_WARN, 'attack ' + this.runtime.attack + ' stat_req ' + stat_req + ' health ' + req_health);
	if ((!this.runtime.defend || LevelUp.runtime.energy < this.runtime.energy)
			&& (!this.runtime.attack || stat_req || req_health)) { // stat_req is last calculated in loop above, so ok
		for (mid in this.data) {
			monster = this.data[mid];
			if (!monster.ignore) {
				uid = mid.replace(/_.+/,'');
				type = this.types[monster.type];
				if (monster.state === 'reward' && monster.ac) {
					this.page(mid, 'Collecting Reward from ', 'casuser','&action=collectReward');
				} else if (monster.remove && this.option.remove && parseFloat(uid) !== userID
						&& monster.page !== 'festival') {
					//log(LOG_WARN, 'remove ' + mid + ' userid ' + userID + ' uid ' + uid + ' now ' + (uid === userID) + ' new ' + (parseFloat(uid) === userID));
					this.page(mid, 'Removing ', 'remove_list','');
				} else if (monster.last < Date.now() - this.option.check_interval * (monster.remove ? 5 : 1)) {
					this.page(mid, 'Reviewing ', 'casuser','');
				}
				if (this.runtime.message) {
					return;
				}
			}
		}
	}
	Dashboard.status(this, messages.length ? messages.join('<br>') : 'Nothing to do.');
	if(!Queue.option.pause){
		if(LevelUp.runtime.running){
			this.runtime.limit = 100;
		} else if (!this.runtime.attack){
			this.runtime.limit = (limit > 30)? 1: (limit + 1|0);
		}
	} else {
		this.runtime.limit = 0;
	}
	this._notify('data');// Temporary fix for Dashboard updating
};

Monster.work = function(state) {
	var i, j, target_info = [], battle_list, list = [], mid, uid, type, btn = null, b, mode = this.runtime.mode, stat = this.runtime.stat, monster, title;
	if (!this.runtime.check && !mode) {
		return QUEUE_NO_ACTION;
	}
	if (!state) {
		return QUEUE_CONTINUE;
	}
	if (this.runtime.check) {
		log(LOG_WARN, this.runtime.message);
		Page.to(this.runtime.page, this.runtime.check);
		this.runtime.check = this.runtime.limit = this.runtime.message = this.runtime.dead = false;
		return QUEUE_RELEASE;
	}
	if (mode === 'defend' && LevelUp.get('runtime.quest')) {
		return QUEUE_NO_ACTION;
	}	
	uid = this.runtime[mode].replace(/_\w+/,'');
	monster = this.data[this.runtime[mode]];
	type = this.types[monster.type];
//	if (this.runtime[stat] > LevelUp.runtime[stat] || (LevelUp.runtime.basehit && this.runtime[stat] !== LevelUp.runtime.basehit * this.runtime.multiplier[mode])) {
//		log(LOG_WARN, 'Check for ' + stat + ' burn to catch up ' + this.runtime[stat] + ' burn ' + LevelUp.runtime[stat]);
//		this._remind(0, 'levelup');
//		return QUEUE_RELEASE;
//	}
	if (!Generals.to(Generals.runtime.zin || LevelUp.runtime.general || (this.option['best_'+mode] 
			? (type.raid
				? ((this.option.raid.search('Invade') === -1) ? 'raid-duel' : 'raid-invade')
				: 'monster_' + mode)
			: this.option['general_'+mode]))) {
		return QUEUE_CONTINUE;
	}
	if (type.raid) { // Raid has different buttons
		btn = $(Monster.raid_buttons[this.option.raid]);
	} else {
		//Primary method of finding button.
		log(LOG_WARN, 'Try to ' + mode + ' ' + monster.name + '\'s ' + type.name + ' for ' + this.runtime[stat] + ' ' + stat);
		if (!$(this.runtime.button[mode].query).length || this.runtime.button[mode].pick >= $(this.runtime.button[mode].query).length) {
			//log(LOG_WARN, 'Unable to find '  + mode + ' button for ' + monster.name + '\'s ' + type.name);
		} else {
			//log(LOG_WARN, ' query ' + $(this.runtime.button[mode].query).length + ' ' + this.runtime.button[mode].pick);
			btn = $(this.runtime.button[mode].query).eq(this.runtime.button[mode].pick);
			this.runtime.used[stat] = this.runtime[stat];
		}
		if (!btn || !btn.length){
			monster.button_fail = (monster.button_fail || 0) + 1;
			if (monster.button_fail > 10){
				log(LOG_LOG, 'Ignoring Monster ' + monster.name + '\'s ' + type.name + ': Unable to locate ' + (this.runtime.button[mode].pick || 'unknown') + ' ' + mode + ' button ' + monster.button_fail + ' times!');
				monster.ignore = true;
				monster.button_fail = 0;
			}
		}
	}
	if (!btn || !btn.length 
			|| (['keep_monster_active', 'monster_battle_monster', 'festival_battle_monster'].indexOf(Page.page)<0)
			|| ($('div[style*="dragon_title_owner"] img[linked]').attr('uid') !== uid
				&& $('div[style*="nm_top"] img[linked]').attr('uid') !== uid
				&& $('img[linked][size="square"]').attr('uid') !== uid)) {
		//log(LOG_WARN, 'Reloading page. Button = ' + btn.attr('name'));
		//log(LOG_WARN, 'Reloading page. Page.page = '+ Page.page);
		//log(LOG_WARN, 'Reloading page. Monster Owner UID is ' + $('div[style*="dragon_title_owner"] img[linked]').attr('uid') + ' Expecting UID : ' + uid);
		this.page(this.runtime[mode],'','casuser','');
		Page.to(this.runtime.page,this.runtime.check);
		this.runtime.check = null;
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
		target_info = $('div[id*="raid_atk_lst0"] div div').text().regex(/Lvl\s*(\d+).*Army: (\d+)/);
		if ((this.option.armyratio !== 'Any' && ((target_info[1]/Player.get('army')) > this.option.armyratio) && this.option.raid.indexOf('Invade') >= 0) || (this.option.levelratio !== 'Any' && ((target_info[0]/Player.get('level')) > this.option.levelratio) && this.option.raid.indexOf('Invade') === -1)){ // Check our target (first player in Raid list) against our criteria - always get this target even with +1
			log(LOG_LOG, 'No valid Raid target!');
			Page.to('battle_raid', ''); // Force a page reload to change the targets
			return QUEUE_CONTINUE;
		}
	}
	Page.click(btn);
	return QUEUE_RELEASE;
};

Monster.page = function(mid, message, prefix, suffix) {
	var uid, type, monster, mpool, mmid;
	monster = this.data[mid];
	this.runtime.mid = mid;
	uid = mid.replace(/_.+/,'');
	type = this.types[monster.type];
	if (message) {
		this.runtime.message = message + (monster.name ? (monster.name === 'You' ? 'your' : monster.name.html_escape() + '\'s') : '') + ' ' + type.name;
		Dashboard.status(this, this.runtime.message);
	}
	this.runtime.page = type.raid ? 'battle_raid' 
			: monster.page === 'festival' ? 'festival_battle_monster' 
			: 'monster_battle_monster';
	if (monster.page === 'festival') {
		mpool = type.festival_mpool || type.mpool;
		if (type.festival) {
			mmid = '&mid=' + type.festival;
			if (prefix.indexOf('remove_list') >= 0) {
				mmid += '&remove_monsterKey=' + type.festival;
			}
		}
	} else {
		mpool = type.mpool;
	}
	this.runtime.check = prefix + '=' + uid
			+ ((monster.phase && this.option.assist
				&& !LevelUp.runtime.levelup
				&& (monster.state === 'engage' || monster.state === 'assist'))
					? '&action=doObjective' : '')
			+ (mpool ? '&mpool=' + mpool : '')
			+ (mmid ? mmid : '')
			+ suffix;
};


Monster.order = null;
Monster.dashboard = function(sort, rev) {
	var i, j, o, type, monster, args, list = [], output = [], sorttype = [null, 'name', 'health', 'defense', null, 'timer', 'eta'], state = {
		engage:0,
		assist:1,
		reward:2,
		complete:3
	}, blank, image_url, color, mid, uid, title, v, vv, tt, cc;
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
		var aa, bb, data = Monster.data;
		if (state[data[a].state] > state[data[b].state]) {
			return 1;
		}
		if (state[data[a].state] < state[data[b].state]) {
			return -1;
		}
		if (typeof sorttype[sort] === 'string') {
			aa = data[a][sorttype[sort]];
			bb = data[b][sorttype[sort]];
		} else if (sort === 4) { // damage
//			aa = data[a].damage ? data[a].damage[userID] : 0;
//			bb = data[b].damage ? data[b].damage[userID] : 0;
			if (data[a].damage && data[a].damage.user) {
				aa = sum(data[a].damage.user) / sum(data[a].damage);
			}
			if (data[b].damage && data[b].damage.user) {
				bb = sum(data[b].damage.user) / sum(data[b].damage);
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
	if (this.option.stop === 'Continuous'){
		th(output, '<center>Continuous=' + this.runtime.limit + '</center>', 'title="Stop Multiplier"');
	} else {
		th(output, '');
	}
	th(output, 'User');
	th(output, 'Health', 'title="(estimated)"');
	th(output, 'Defense', 'title="Composite of Fortification or Dispel (0%...100%)."');
//	th(output, 'Shield');
	th(output, 'Activity');
	th(output, 'Time Left');
	th(output, 'Kill In (ETD)', 'title="(estimated)"');
//	th(output, '');
//	th(output, '');
	list.push('<table cellspacing="0" style="width:100%"><thead><tr>' + output.join('') + '</tr></thead><tbody>');
	for (o=0; o<this.order.length; o++) {
		mid = this.order[o];
		uid = mid.replace(/_.+/,'');
		monster = this.data[mid];
		festival = monster.page === 'festival';
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
		args = '?casuser=' + uid + (type.mpool ? '&mpool=' + (monster.page === 'festival' && type.festival_mpool? type.festival_mpool  : type.mpool) : '') + (monster.page === 'festival' ? ('&mid=' + type.festival) : '');
		if (this.option.assist_links && (monster.state === 'engage' || monster.state === 'assist') && type.siege !== false ) {
			args += '&action=doObjective';
		}
		// link icon
		tt = type.name;
		if (isNumber(v = monster.ach || type.achievement)) {
		    tt += ' | Achievement: ';
			if (isNumber(monster.achpa)) {
				tt += monster.achpa + ' PA' + plural(monster.achpa) + ' (~' + v.SI() + ')';
			} else {
				tt += v.addCommas();
			}
		}
		if (isNumber(v = monster.max)) {
		    tt += ' | Max: ';
			if (isNumber(monster.maxpa)) {
				tt += monster.maxpa + ' PA' + plural(monster.maxpa) + ' (~' + v.SI() + ')';
			} else {
				tt += v.addCommas();
			}
		}
		td(output, Page.makeLink(type.raid ? 'raid.php' : monster.page === 'festival' ? 'festival_battle_monster.php' : 'battle_monster.php', args, '<img src="' + imagepath + type.list + '" style="width:72px;height:20px; position: relative; left: -8px; opacity:.7;" alt="' + type.name + '"><strong class="overlay"' + (monster.page === 'festival' ? ' style="color:#ffff00;"' : '') + '>' + monster.state + '</strong>'), 'title="' + tt + '"');
		image_url = imagepath + type.list;
		//log(LOG_WARN, image_url);

		// user
		if (isString(monster.name)) {
			vv = monster.name.html_escape();
		} else {
			vv = '{id:' + uid + '}';
		}
		th(output, '<a class="golem-monster-ignore" name="'+mid+'" title="Toggle Active/Inactive"'+(monster.ignore ? ' style="text-decoration: line-through;"' : '')+'>' + vv + '</a>');

		// health
		td(output,
			blank
				? ''
				: monster.health === 100
					? '100%'
					: monster.health.round(1) + '%',
			blank
				? ''
				: 'title="' + (monster.total - sum(monster.damage)).addCommas() + '"');

		// defense
		vv = tt = cc = '';
		if (!blank && isNumber(monster.defense)) {
			vv = monster.defense.round(1) + '%';
			if (isNumber(monster.strength)) {
				tt = 'Max: ' + monster.strength.round(1) + '% | ';
			}
			tt += 'Attack Bonus: ' + (monster.defense - 50).round(1) + '%';
			if (this.option.defend_active && this.option.defend > monster.defense) {
				cc = 'green';
			} else if (this.option.min_to_attack >= monster.defense) {
				cc = 'blue';
			}
		}
		if (cc !== '') {
			vv = '<span style="color:' + cc + ';">' + vv + '</span>';
		}
		if (tt !== '') {
			tt = 'title="' + tt + '"';
		}
		td(output, vv, tt);

		var activity = sum(monster.damage && monster.damage.user) + sum(monster.defend);
		if (monster.ach > 0 || monster.max > 0) {
			if (monster.max > 0 && activity >= monster.max) {
				color = 'red';
			} else if (monster.ach > 0 && activity >= monster.ach) {
				color = 'orange';
			} else {
				color = 'green';
			}
		} else {
			color = 'black';
		}

		// activity
		td(output,
			(blank || monster.state !== 'engage' || (typeof monster.damage === undefined || typeof monster.damage.user === 'undefined'))
				? ''
				: '<span style="color: ' + color + ';">' + activity.addCommas() + '</span>',
			blank
				? ''
				: 'title="' + ( sum(monster.damage && monster.damage.user) / monster.total * 100).round(2) + '% from ' + (sum(monster.stamina)/5 || 'an unknown number of') + ' PAs"');

		// time left
		td(output,
			blank
				? ''
				: monster.timer
					? Page.addTimer('monster_'+mid+'_finish', monster.finish)
					: '?');

		// etd
		td(output,
			blank
				? ''
				: Page.addTimer('monster_'+mid+'_eta', monster.health === 100 ? monster.finish : monster.eta));
		th(output, '<a class="golem-monster-delete" name="'+mid+'" title="Delete this Monster from the dashboard">[x]</a>');
		th(output, '<a class="golem-monster-override" name="'+mid+'" title="Override Lost Cause setting for this monster">'+(monster.override ? '[O]' : '[]')+'</a>');
                tr(list, output.join(''));
	}
	list.push('</tbody></table>');
	$('#golem-dashboard-Monster').html(list.join(''));
	$('a.golem-monster-delete').live('click', function(event){
		Monster.set(['data',$(this).attr('name')]);
		return false;
	});
	$('a.golem-monster-ignore').live('click', function(event){
		var x = $(this).attr('name');
		Monster.set(['data',x,'ignore'], !Monster.get(['data',x,'ignore'], false));
		return false;
	});
	$('a.golem-monster-override').live('click', function(event){
		var x = $(this).attr('name');
		Monster.set(['data',x,'override'], !Monster.get(['data',x,'override'], false));
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
		value = parseFloat(value, 10) * 1000 * (first + second * 1000);
	}
	return parseInt(value, 10);
};

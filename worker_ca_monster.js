/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Config, Dashboard, History, Page, Queue, Resources,
	Battle, Generals, LevelUp, Player,
	APP, APPID, APPID_, userID, imagepath, isFacebook,
	LOG_ERROR, LOG_WARN, LOG_LOG, LOG_INFO, LOG_DEBUG, log,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH, QUEUE_NO_ACTION,
	isArray, isFunction, isNumber, isObject, isString, isWorker
	findInObject, bestObjValue, plural, sum, tr, th, td,
	calc_rolling_weighted_average, assert
	dom_heritage
*/
/********** Worker.Monster **********
 * Automates Monster
 */
/*
 * Attack Buttons:
 *  5: seamonster_power.gif
 * 10: serpent_10stam_attack.gif
 */
var Monster = new Worker('Monster');
Monster.temp = null;

Monster.defaults['castle_age'] = {
	pages:'monster_monster_list monster_battle_monster monster_dead'
	  + ' monster_remove_list'
	  + ' keep_monster_active battle_raid'
	  + ' festival_monster_list festival_monster2_list festival_battle_monster'
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
	attack_active:false,
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
	check: false, // id of monster to check if needed, otherwise false
	attack: false, // id of monster if we have an attack target, otherwise false
	defend: false, // id of monster if we have a defend target, otherwise false
	secondary: false, // Is there a target for mage or rogue that is full or not in cycle?  Used to tell quest to wait if don't quest when fortifying is on.
	multiplier: {defend:1,attack:1}, // General multiplier like Orc King or Barbarus
	values: {defend:[],attack:[]}, // Attack/defend values available for levelup
	big: [], // Defend big values available for levelup
	energy: 0, // How much can be used for next attack
	stamina: 0, // How much can be used for next attack
	used: {stamina:0,energy:0}, // How much was used in last attack
	button: {attack: {pick:1,query:[]},  // Query - the jquery query for buttons, pick - which button to use
			defend: {pick:1,query:[]},
			count:1}, // How many attack/defend buttons can the player access?
	health: 10, // minimum health to attack,
	mode: null, // Used by update to tell work if defending or attacking
	stat: null, // Used by update to tell work if using energy or stamina
	message: null, // Message to display on dash and log when removing or reviewing or collecting monsters

	levelupdefending: false, // Used to preserve te runtime.defending value even when in force.stamina mode
	page: null, // What page (battle or monster) the check page should go to
	monsters: {}, // Used for storing running weighted averages for monsters
	defending: false, // hint for other workers as to whether we are potentially using energy to defend
	banthus: [], // Possible attack values for :ban condition crits
	banthusNow: false // Set true when ready to use a Banthus crit
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
				id:'attack_active',
				label:'Attack Active',
				checkbox:true,
				help:'Spend stamina to defend monsters.'
				  + ' Note: this option is not yet functional.'
			},{
//				id:'attack_group',
				require:'attack_active',
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
						number:20,
						min:0,
						max:100,
						step:1,
						help:'Attack if defense is over this value. Range of 0% to 100%.',
						after:'%'
					},{
						id:'use_tactics',
						label:'Use tactics',
						checkbox:true,
						help:"Use tactics to improve damage when it's available (may lower exp ratio)"
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
						require:'stop!=="Priority List"',
						label:'Avoid Lost-cause Monsters',
						checkbox:true,
						help:'Do not attack monsters that are a lost cause, i.e. the ETD is longer than the time remaining.'
					},{
						advanced:true,
						id:'lost_cause_hours',
						require:'avoid_lost_cause',
						label:'Lost-cause if ETD is',
						after:'hours late',
						cols:4,
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
			}
		]
	},{
		title:'Defend',
		group:[
			{
				id:'defend_active',
				label:'Defend Active',
				checkbox:true,
				help:'Spend energy to defend monsters.'
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
						number:30,
						min:0,
						max:100,
						step:1,
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
				help:"Smaller number for smaller target army. Reduce this number if you're losing in Invade"
			},{
				id:'levelratio',
				require:'raid!="Invade" && raid!="Invade x5"',
				label:'Target Level Ratio',
				select:['Any', 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.1, 1.2, 1.3, 1.4, 1.5],
				help:"Smaller number for lower target level. Reduce this number if you're losing a lot"
			},{
				id:'force1',
				label:'Force +1',
				checkbox:true,
				help:'Force the first player in the list to aid.'
			}
		]
	},{
		title:'Priority list',
		group:[
			{
				id:'priority',
				//require:'stop==="Priority List"',
				label:'Priority List',
				textarea:true,
				help:'Prioritized list of which monsters to attack'
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
		brief:'Kull',
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
		brief:'Karn',
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

	// Epic Boss (mpool 1)
	colossus: {
		name:'Colossus of Terra',
		brief:'Colossus',
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
		festival: 'stonegiant',
		festival_damage: 30000,
		festival_worth: 100
	},
	gildamesh: {
		name:'Gildamesh, the Orc King',
		brief:'Gildamesh',
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
		festival: 'orcking',
		festival_damage: 30000,
		festival_worth: 50
	},
	keira: {
		name:'Keira the Dread Knight',
		brief:'Keira',
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
		brief:'Lotus',
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
		festival_timer: 259200, // 72 hours (was 89 hours?)
		festival: 'mephistopheles',
		festival_damage: 50000,
		festival_worth: [150,200]
	},
	skaar: {
		name:'Skaar Deathrune',
		brief:'Skaar',
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
		festival: 'skaar_boss',
		festival_timer2: 691200, // 192 hours
		festival_damage: 1000000,
		festival_worth: 500,
		festival_worth2: 150
	},
	sylvanus: {
		name:'Sylvana the Sorceress Queen',
		brief:'Sylvana',
		list:'boss_sylvanus_list.jpg',
		image:'boss_sylvanus_large.jpg',
		dead:'boss_sylvanus_dead.jpg',
		achievement:50000,
		timer:172800, // 48 hours
		mpool:1,
		attack_button:'input[name="Attack Dragon"]',
		attack:[1,5],
		festival_timer: 259200, // 72 hours
		festival: 'sylvanus',
		festival_damage: 30000,
		festival_worth: 150
	},
	rebellion: {
		name:"Aurelius, Lion's Rebellion",
		brief:"Lion's Rebellion",
		list:'nm_aurelius_list.jpg',
		image:'nm_aurelius_large.jpg',
		dead:'nm_aurelius_large_dead.jpg',
		achievement:1000,
		timer:604800, // 168 hours
		mpool:1,
		attack_button:'input[name="Attack Dragon"][src*="stab"]'
		  + ',input[name="Attack Dragon"][src*="bolt"]'
		  + ',input[name="Attack Dragon"][src*="smite"]'
		  + ',input[name="Attack Dragon"][src*="bash"]',
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
		attack_button:'input[name="Attack Dragon"][src*="stab"]'
		  + ',input[name="Attack Dragon"][src*="bolt"]'
		  + ',input[name="Attack Dragon"][src*="smite"]'
		  + ',input[name="Attack Dragon"][src*="bash"]',
		attack:[5,10,20,50],
		defend_button:'input[name="Attack Dragon"][src*="heal"]',
		defend:[10,20,40,100],
		festival: 'boss_corvintheus',
		festival_timer2: 691200, // 192 hours
		festival_damage2: 1000000,
		festival_worth2: 575
	},
	jahanna: {
		name:'Jahanna, Priestess of Aurora',
		brief:'Jahanna',
		list:'boss_jahanna_list.jpg',
		image:'boss_jahanna_large.jpg',
		dead:'boss_jahanna_dead.jpg',
		achievement:5000000,
		timer:604800, // 168 hours
		mpool:1,
		attack_button:'input[name="Attack Dragon"][src*="stab"]'
		  + ',input[name="Attack Dragon"][src*="bolt"]'
		  + ',input[name="Attack Dragon"][src*="smite"]'
		  + ',input[name="Attack Dragon"][src*="bash"]',
		attack:[10,20,50,100,200],
		defend_button:'input[name="Attack Dragon"][src*="heal"]',
		defend:[20,40,100,200],
		festival: 'jahanna',
		festival_timer2: 691200, // 192 hours
		festival_damage2: 1000000,
		festival_worth2: 400
	},
	aurora: {
		name:'Aurora',
		list:'boss_aurora_list.jpg',
		image:'boss_aurora_large.jpg',
		dead:'boss_aurora_dead.jpg',
		achievement:5000000,
		timer:604800, // 168 hours
		mpool:1,
		attack_button:'input[name="Attack Dragon"][src*="stab"]'
		  + ',input[name="Attack Dragon"][src*="bolt"]'
		  + ',input[name="Attack Dragon"][src*="smite"]'
		  + ',input[name="Attack Dragon"][src*="bash"]',
		attack:[10,20,50,100], // removed 200 attack as per forums post
		defend_button:'input[name="Attack Dragon"][src*="heal"]',
		defend:[20,40,100,200],
		festival: 'aurora',
		festival_timer2: 691200, // 192 hours
		festival_damage2: 1000000,
		festival_worth2: 550
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
		attack:[5,10,20,50], // Needs details
		defend_button:'input[name="Attack Dragon"][src*="heal"]',
		defend:[10,20,40,100],
		festival: 'ambrosia',
		festival_timer2: 691200, // 192 hours
		festival_damage2: 1000000,
		festival_worth2: 500
	},
	agamemnon: {
		name:'Agamemnon the Overseer',
		brief:'Agamemnon',
		list:'boss_agamemnon_list.jpg',
		image:'boss_agamemnon_large.jpg',
		dead:'boss_agamemnon_dead.jpg',  // guess
		achievement:5000000,
		timer:604800, // 168 hours
		mpool:1,
		attack_button:'input[name="Attack Dragon"][src*="stab"]'
		  + ',input[name="Attack Dragon"][src*="bolt"]'
		  + ',input[name="Attack Dragon"][src*="smite"]'
		  + ',input[name="Attack Dragon"][src*="bash"]',
		attack:[10,20,50,100,200],
		defend_button:'input[name="Attack Dragon"][src*="heal"]',
		defend:[20,40,100,200],
		festival_timer: 691200, // 192 hours
		festival: 'agamemnon',
		festival_damage: null,
		festival_worth: null
	},
	azriel: {
		name:'Azriel, the Angel of Wrath',
		brief:'Azriel',
		list:'nm_azriel_list.jpg',
		image:'nm_azriel_large2.jpg',
		dead:'nm_azriel_dead.jpg',
		achievement:6000000, // ~0.5%, 2X = ~1%
		timer:604800, // 168 hours
		mpool:1,
		attack_button:'input[name="Attack Dragon"][src*="stab"]'
		  + ',input[name="Attack Dragon"][src*="bolt"]'
		  + ',input[name="Attack Dragon"][src*="smite"]'
		  + ',input[name="Attack Dragon"][src*="bash"]',
		attack:[5,10,20,50],
		defend_button:'input[name="Attack Dragon"][src*="heal"]',
		defend:[10,20,40,100],
		festival_timer: 691200, // 192 hours
		festival: 'boss_azriel',
		festival_damage: 1000000,
		festival_worth: 550,
		festival_worth2: 200
	},
	malekus: {
		name:'Malekus',
		list:'boss_malekus_list.jpg',
		image:'boss_malekus_large.jpg',
		dead:'boss_malekus_dead.jpg',
		achievement:11000000,
		timer:604800, // 168 hours
		mpool:1,
		attack_button:'input[name="Attack Dragon"][src*="stab"]'
		  + ',input[name="Attack Dragon"][src*="bolt"]'
		  + ',input[name="Attack Dragon"][src*="smite"]'
		  + ',input[name="Attack Dragon"][src*="bash"]',
		attack:[5,10,20, 50],
		defend_button:'input[name="Attack Dragon"][src*="heal"]',
		defend:[10,20,40,100],
		festival: 'malekus', // ?
		festival_timer2: 691200, // 192 hours
		festival_damage2: 1000000,
		festival_worth2: 550
	},
	alexandra: {
		name:'Alexandra, the Unbreakable',
		brief:'Alexandra',
		list:'monster_alexandra_list.jpg',
		image:'monster_alexandra_large.jpg',
		dead:'monster_alexandra_dead.jpg',
		medal:40000000,
		achievement:25000000,
		timer:691200, // 192 hours
		mpool:1,
		attack_button:'input[name="Attack Dragon"][src*="stab"]'
		  + ',input[name="Attack Dragon"][src*="bolt"]'
		  + ',input[name="Attack Dragon"][src*="smite"]'
		  + ',input[name="Attack Dragon"][src*="bash"]',
		attack:[5,10,20,50],
		defend_button:'input[name="Attack Dragon"][src*="heal"]',
		defend:[10,20,40,100],
		festival:'alexandra'
	},
	azeron: {
	    name:'Azeron',
		list:'boss_azeron_list.jpg',
		image:'boss_azeron_large.jpg',
		dead:'boss_azeron_dead.jpg',
		medal:40000000,
		achievement:25000000,
		timer:691200, // 192 hours
		mpool:1,
		attack_button:'input[name="Attack Dragon"][src*="stab"]'
		  + ',input[name="Attack Dragon"][src*="bolt"]'
		  + ',input[name="Attack Dragon"][src*="smite"]'
		  + ',input[name="Attack Dragon"][src*="bash"]',
		attack:[5,10,20,50],
		defend_button:'input[name="Attack Dragon"][src*="heal"]',
		defend:[10,20,40,100]
	},

	// Epic Team (mpool 2)
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
		festival: 'dragon_blue',
		festival_damage: 30000,
		festival_worth: 200
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
		festival: 'dragon_yellow',
		festival_damage: 30000,
		festival_worth: 250
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
		festival: 'dragon_red',
		festival_damage: 50000,
		festival_worth: 250
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
		festival: 'seamonster_purple',
		festival_damage: 30000,
		festival_worth: 300
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
		festival: 'seamonster_red',
		festival_damage: 30000,
		festival_worth: [250,300]
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
		festival: 'seamonster_green',
		festival_damage: 30000,
		festival_worth: 150
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
		festival: 'seamonster_blue',
		festival_damage: 30000,
		festival_worth: 200
	},

	// Epic World (mpool 3)
	cronus: {
		name:'Cronus, The World Hydra',
		brief:'Cronus',
		list:'hydra_head.jpg',
		image:'hydra_large.jpg',
		dead:'hydra_dead.jpg',
		achievement:500000,
		timer:604800, // 168 hours
		mpool:3,
		attack_button:'input[name="Attack Dragon"]',
		attack:[10,20,50,100,200],
		festival_timer: 691200, // 192 hours
		festival: 'hydra',
		festival_damage: 500000,
		festival_damage2: 50000,
		festival_worth: 300,
		festival_worth2: 200
	},
	legion: {
		name:'Battle of the Dark Legion',
		brief:'Dark Legion',
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
		brief:'Genesis',
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
		festival: 'earth_element',
		festival_damage: 1000000,
		festival_worth: 350,
		festival_worth2: 150
	},
	ragnarok: {
		name:'Ragnarok, The Ice Elemental',
		brief:'Ragnarok',
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
		festival: 'water_element',
		festival_damage: 1000000,
		festival_worth: 400,
		festival_worth2: 300
	},
	gehenna: {
		name:'Gehenna',
		list:'nm_gehenna_list.jpg',
		image:'nm_gehenna_large.jpg',
		dead:'nm_gehenna_dead.jpg',
		achievement:1000000,
		timer:604800, // 168 hours
		mpool:3,
		attack_button:'input[name="Attack Dragon"][src*="stab"]'
		  + ',input[name="Attack Dragon"][src*="bolt"]'
		  + ',input[name="Attack Dragon"][src*="smite"]'
		  + ',input[name="Attack Dragon"][src*="bash"]',
		attack:[5,10,20,50],
		defend_button:'input[name="Attack Dragon"][src*="heal"]',
		defend:[10,20,40,100],
		festival_timer: 691200, // 192 hours
		festival: 'fire_element',
		festival_damage: 1000000,
		festival_worth: 500,
		festival_worth2: 250
	},
	valhalla: {
		name:'Valhalla, The Air Elemental',
		brief:'Valhalla',
		list:'monster_valhalla_list.jpg',
		image:'monster_valhalla.jpg',
		dead:'monster_valhalla_dead.jpg',
		achievement:1000000,
		timer:604800, // 168 hours
		mpool:3,
		attack_button:'input[name="Attack Dragon"][src*="stab"]'
		  + ',input[name="Attack Dragon"][src*="bolt"]'
		  + ',input[name="Attack Dragon"][src*="smite"]'
		  + ',input[name="Attack Dragon"][src*="bash"]',
		attack:[10,20,50,100,200],
		defend_button:'input[name="Attack Dragon"][src*="heal"]',
		defend:[20,40,100,200],
		festival_timer: 691200, // 192 hours
		festival: 'air_element',
		festival_damage: 1000000,
		festival_worth: 575,
		festival_worth2: 250
	},
	bahamut: {
		name:'Bahamut, the Volcanic Dragon',
		brief:'Bahamut',
		list:'nm_volcanic_list.jpg',
		image:'nm_volcanic_large.jpg',
		dead:'nm_volcanic_dead.jpg',
		achievement:2000000, // Guesswork
		timer:604800, // 168 hours
		mpool:3,
		attack_button:'input[name="Attack Dragon"][src*="stab"]'
		  + ',input[name="Attack Dragon"][src*="bolt"]'
		  + ',input[name="Attack Dragon"][src*="smite"]'
		  + ',input[name="Attack Dragon"][src*="bash"]',
		attack:[5,10,20,50],
		defend_button:'input[name="Attack Dragon"][src*="heal"]',
		defend:[10,20,40,100],
		festival_timer: 691200, // 192 hours
		festival: 'volcanic_new',
		festival_damage: 1000000,
		festival_worth: 500,
		festival_worth2: 200
	},
	alpha_bahamut: {
		name:'Alpha Bahamut, the Volcanic Dragon',
		brief:'Alpha Bahamut',
		list:'nm_volcanic_list_2.jpg',
		image:'nm_volcanic_large_2.jpg',
		dead:'nm_volcanic_dead_2.jpg',
		achievement:6000000, // Guesswork
		timer:604800, // 168 hours
		mpool:3,
		attack_button:'input[name="Attack Dragon"][src*="stab"]'
		  + ',input[name="Attack Dragon"][src*="bolt"]'
		  + ',input[name="Attack Dragon"][src*="smite"]'
		  + ',input[name="Attack Dragon"][src*="bash"]',
		attack:[5,10,20,50],
		defend_button:'input[name="Attack Dragon"][src*="heal"]',
		defend:[10,20,40,100],
		festival: 'alpha_volcanic_new',
		festival_timer2: 691200, // 192 hours
		festival_damage2: 1000000,
		festival_worth2: 300
	},
	red_plains: {
		name:'War of the Red Plains',
		list:'nm_war_list.jpg',
		image:'nm_war_large.jpg',
		dead:'nm_war_dead.jpg',
		achievement:2500,
		timer:604800, // 168 hours
		mpool:3,
		attack_button:'input[name="Attack Dragon"][src*="stab"]'
		  + ',input[name="Attack Dragon"][src*="bolt"]'
		  + ',input[name="Attack Dragon"][src*="smite"]'
		  + ',input[name="Attack Dragon"][src*="bash"]',
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
		attack_button:'input[name="Attack Dragon"][src*="stab"]'
		  + ',input[name="Attack Dragon"][src*="bolt"]'
		  + ',input[name="Attack Dragon"][src*="smite"]'
		  + ',input[name="Attack Dragon"][src*="bash"]',
		attack:[5,10,20,50],
		defend_button:'input[name="Attack Dragon"][src*="heal"]'
		  + ',input[name="Attack Dragon"][src*="strengthen"]',
		defend:[10,20,40,100],
		festival_timer: 691200, // 192 hours
		festival: 'alpha_mephistopheles',
		festival_mpool: 1,
		festival_damage: 1000000,
		festival_worth: 550,
		festival_worth2: 500
	},
	giant_kromash: {
		name:'Kromash',
		list:'monster_kromash_list.jpg',
		image:'monster_kromash_large.jpg',
		dead:'monster_kromash_dead.jpg',
		achievement:6000000,
		timer:604800, // 168 hours
		mpool:3,
		attack_button:'input[name="Attack Dragon"][src*="stab"]'
		  + ',input[name="Attack Dragon"][src*="bolt"]'
		  + ',input[name="Attack Dragon"][src*="smite"]'
		  + ',input[name="Attack Dragon"][src*="bash"]',
		attack:[5,10,20,50],
		defend_button:'input[name="Attack Dragon"][src*="heal"]',
		defend:[10,20,40,100],
		festival: 'storm_giant',
		festival_timer2: 691200, // 192 hours
		festival_damage2: 1000000,
		festival_worth2: 100
	},
	giant_glacius: {
		name:'Glacius',
		list:'monster_glacius_list.jpg',
		image:'monster_glacius_large.jpg',
		dead:'monster_glacius_dead.jpg',
		achievement:6000000,
		timer:604800, // 168 hours
		mpool:3,
		attack_button:'input[name="Attack Dragon"][src*="stab"]'
		  + ',input[name="Attack Dragon"][src*="bolt"]'
		  + ',input[name="Attack Dragon"][src*="smite"]'
		  + ',input[name="Attack Dragon"][src*="bash"]',
		attack:[5,10,20,50],
		defend_button:'input[name="Attack Dragon"][src*="heal"]',
		defend:[10,20,40,100],
		festival: 'frost_giant',
		festival_timer2: 691200, // 192 hours
		festival_damage2: 1000000,
		festival_worth2: 350
	},
	giant_shardros: {
		name:'Shardros',
		list:'monster_shardros_list.jpg',
		image:'monster_shardros_large.jpg',
		dead:'monster_shardros_dead.jpg',
		achievement:6000000,
		timer:604800, // 168 hours
		mpool:3,
		attack_button:'input[name="Attack Dragon"][src*="stab"]'
		  + ',input[name="Attack Dragon"][src*="bolt"]'
		  + ',input[name="Attack Dragon"][src*="smite"]'
		  + ',input[name="Attack Dragon"][src*="bash"]',
		attack:[5,10,20,50],
		defend_button:'input[name="Attack Dragon"][src*="heal"]',
		defend:[10,20,40,100],
		festival: 'mountain_giant',
		festival_timer2: 691200, // 192 hours
		festival_damage2: 1000000,
		festival_worth2: 50
	},
	giant_magmos: {
		name:'Magmos',
		list:'monster_magmos_list.jpg',
		image:'monster_magmos_large.jpg',
		dead:'monster_magmos_dead.jpg',
		achievement:6000000,
		timer:604800, // 168 hours
		mpool:3,
		attack_button:'input[name="Attack Dragon"][src*="stab"]'
		  + ',input[name="Attack Dragon"][src*="bolt"]'
		  + ',input[name="Attack Dragon"][src*="smite"]'
		  + ',input[name="Attack Dragon"][src*="bash"]',
		attack:[5,10,20,50],
		defend_button:'input[name="Attack Dragon"][src*="heal"]',
		defend:[10,20,40,100],
		festival: 'lava_giant',
		festival_timer2: 691200, // 192 hours
		festival_damage2: 1000000,
		festival_worth2: 300
	},
	typhonus: {
		name:'Typhonus, the Chimera',
		brief:'Typhonus',
		list:'monster_chimera_list.jpg',
		image:'monster_chimera_large.jpg',
		dead:'monster_chimera_dead.jpg',
		achievement:6000000,
		timer:604800, // 168 hours
		mpool:3,
		attack_button:'input[name="Attack Dragon"][src*="stab"]'
		  + ',input[name="Attack Dragon"][src*="bolt"]'
		  + ',input[name="Attack Dragon"][src*="smite"]'
		  + ',input[name="Attack Dragon"][src*="bash"]',
		attack:[5,10,20,50],
		defend_button:'input[name="Attack Dragon"][src*="heal"]',
		defend:[10,20,40,100],
		festival: 'chimera',
		festival_timer2: 691200, // 192 hours
		festival_damage2: 1000000,
		festival_worth2: 500
	},
	kraken: {
		name:'Kraken',
		list:'monster_kraken_list.jpg',
		image:'monster_kraken_large.jpg',
		dead:'monster_kraken_dead.jpg',
		title:'monster_kraken_header.jpg',
		medal:8000000,
		loot:4000000,
		achievement:4000000,
		timer:604800, // 168 hours ??
		mpool:3,
		attack_button:'input[name="Attack Dragon"][src*="stab"]'
		  + ',input[name="Attack Dragon"][src*="bolt"]'
		  + ',input[name="Attack Dragon"][src*="smite"]'
		  + ',input[name="Attack Dragon"][src*="bash"]',
		attack:[5,10,20,50],
		defend_button:'input[name="Attack Dragon"][src*="heal"]',
		defend:[10,20,40,100]
	},
	alpha_kraken: {
		name:'Alpha Kraken',
		list:'monster_kraken_list.jpg',
		image:'monster_kraken_large.jpg',
		dead:'monster_kraken_dead.jpg',
		title:'monster_alpha_kraken_header.jpg',
		medal:17500000,
		loot:7500000,
		achievement:7500000,
		timer:604800, // 168 hours ??
		mpool:3,
		attack_button:'input[name="Attack Dragon"][src*="stab"]'
		  + ',input[name="Attack Dragon"][src*="bolt"]'
		  + ',input[name="Attack Dragon"][src*="smite"]'
		  + ',input[name="Attack Dragon"][src*="bash"]',
		attack:[5,10,20,50],
		defend_button:'input[name="Attack Dragon"][src*="heal"]',
		defend:[10,20,40,100]
	},

	// Castle Age/Heart of Darkness crossover monsters (mpool 100)
	thanatos: {
		name:'Thanatos of Fire & Ice',
		brief:'Thanatos',
		list:'monster_thanatos2_list_ca.jpg',
		image:'monster_thanatos2_large_ca.jpg',
		dead:'monster_thanatos2_dead_ca.jpg',
		achievement:6000000,
		timer:604800, // 168 hours
		mpool:100,
		attack_button:'input[name="Attack Dragon"][src*="stab"]'
		  + ',input[name="Attack Dragon"][src*="bolt"]'
		  + ',input[name="Attack Dragon"][src*="smite"]'
		  + ',input[name="Attack Dragon"][src*="bash"]',
		attack:[5,10,20, 50],
		defend_button:'input[name="Attack Dragon"][src*="heal"]',
		defend:[10,20,40,100]
	}
};

// festival tower 1:
// 1.1: bronze
// 1.1.1	Colossus of Terra					96		30,000		100
// 1.1.2	Gildamesh, the Orc King				96		30,000		50
// 1.1.3	The Emerald Sea Serpent				96		30,000		150
// 1.1.4	The Frost Dragon					96		30,000		200
// 1.2: silver
// 1.2.1	Sylvanas, The Sorceress Queen		72		30,000		150
// 1.2.2	The Amethyst Sea Serpent			96		30,000		300
// 1.2.3	The Sapphire Sea Serpent			96		30,000		200
// 1.2.4	The Gold Dragon						96		30,000		250
// 1.3: gold
// 1.3.1	*Skaar Deathrune					120		1,000,000	500
// 1.3.2	Mephistopheles						72		50,000		150-200
// 1.3.3	The Ancient Sea Serpent				96		30,000		250-300
// 1.3.4	The Ancient Red Dragon				96		50,000		250
// 1.4: platinum
// 1.4.1	*Bahamut, The Volcanic Dragon		192		1,000,000	500
// 1.4.2	*Ragnarok, the Ice Elemental		192		1,000,000	400
// 1.4.3	*Cronus, The World Hydra			192		500,000		300
// 1.4.4	*Genesis, The Earth Elemental		192		1,000,000	350
// 1.5: vanguard
// 1.5.1	*Valhalla, The Air Elemental		192		1,000,000	575
// 1.5.2	*Gehenna, The Fire Elemental		192		1,000,000	500
// 1.5.3	*Azriel, the Angel of Wrath			192		1,000,000	550
// 1.5.4	*Alpha Mephistopheles				192		1,000,000	550
// 1.6: boss
// 1.6.1	Agamemnon, the Overseer				192		None		None

// festival tower 2:
// 2.1: bronze
// 2.1.1	Kromash, the Storm Giant			192		1,000,000	100
// 2.1.2	Shardros, the Mountain Giant		192		1,000,000	50
// 2.1.3	*Genesis, The Earth Elemental		192		1,000,000	150
// 2.1.4	*Cronus, The World Hydra			192		50,000		200
// 2.2: silver
// 2.2.1	*Skaar Deathrune					192		1,000,000	150
// 2.2.2	*Ragnarok, the Ice Elemental		192		1,000,000	300
// 2.2.3	*Bahamut, the Volcanic Dragon		192		1,000,000	200
// 2.2.4	*Gehenna, the Fire Elemental		192		1,000,000	250
// 2.3: gold
// 2.3.1	*Alpha Mephistopheles				192		1,000,000	500
// 2.3.2	*Azriel, the Angel of Wrath			192		1,000,000	200
// 2.3.3	Alpha Bahamut, the Volcanic King	192		1,000,000	300
// 2.3.4	*Valhalla, the Air Elemental		192		1,000,000	250
// 2.4: platinum
// 2.4.1	Typhonus, the Chimera				192		1,000,000	500
// 2.4.2	Jahanna, Priestess of Aurora		192		1,000,000	400
// 2.4.3	Magmos, the Lava Giant				192		1,000,000	300
// 2.4.4	Glacius, the Frost Giant			192		1,000,000	350
// 2.5: vanguard
// 2.5.1	Corvintheus							192		1,000,000	575
// 2.5.2	Ambrosia							192		1,000,000	500
// 2.5.3	Malekus								192		1,000,000	550
// 2.5.4	Aurora								192		1,000,000	550
// 2.6: boss
// 2.6.1	Alexandra, the Unbreakable			192		None		None

Monster.health_img = ['img[src$="nm_red.jpg"]', 'img[src$="monster_health_background.jpg"]'];
Monster.shield_img = ['img[src$="bar_dispel.gif"]'];
Monster.defense_img = ['img[src$="nm_green.jpg"]', 'img[src$="seamonster_ship_health.jpg"]'];
Monster.secondary_img = 'img[src$="nm_stun_bar.gif"]';
Monster.class_img = [
	'div[style*="nm_bottom"] img[src$="nm_class_warrior.jpg"]',
	'div[style*="nm_bottom"] img[src$="nm_class_cleric.jpg"]',
	'div[style*="nm_bottom"] img[src$="nm_class_rogue.jpg"]',
	'div[style*="nm_bottom"] img[src$="nm_class_mage.jpg"]',
	'div[style*="nm_bottom"] img[src$="nm_class_ranger.jpg"]',
	'div[style*="nm_bottom"] img[src$="nm_class_warlock.jpg"]'
];
Monster.class_name = ['Warrior', 'Cleric', 'Rogue', 'Mage', 'Ranger', 'Warlock'];
Monster.secondary_off = 'img[src$="nm_s_off_cripple.gif"]'
  + ',img[src$="nm_s_off_deflect.gif"]';
Monster.secondary_on = 'input[name="Attack Dragon"][src*="cripple"]'
  + ',input[name="Attack Dragon"][src*="deflect"]';
Monster.warrior = 'input[name="Attack Dragon"][src*="strengthen"]';
Monster.raid_buttons = {
	'Invade':	'input[src$="raid_attack_button.gif"]:first',
	'Invade x5':'input[src$="raid_attack_button3.gif"]:first',
	'Duel':		'input[src$="raid_attack_button2.gif"]:first',
	'Duel x5':	'input[src$="raid_attack_button4.gif"]:first'
};
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
	this._watch(Player, 'data.energy');
	this._watch(Player, 'data.maxenergy');
	this._watch(Player, 'data.stamina');
	this._watch(Player, 'data.maxstamina');
	this._watch(LevelUp, 'runtime');

	this._revive(60);

	this.set('runtime.limit', 0);

	if (isNumber(this.runtime.multiplier)) {
		this.set('runtime.multiplier', {defend:1,attack:1}); // General multiplier like Orc King or Barbarus
	}
	this.set('runtime.record');

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
	$('#golem-monster-scout').live('click', function(event) {
		var link = $('#golem-monster-link').val();
		//log(LOG_INFO, '# scout ' + link);
		Monster.visit_link(link);
		return false;
	});
	$('#golem-monster-assist').live('click', function(event) {
		var link = $('#golem-monster-link').val();
		//log(LOG_INFO, '# assist ' + link);
		Monster.visit_link(link, true);
		return false;
	});
	$('#golem-monster-clear').live('click', function(event) {
		var link = $('#golem-monster-link').val();
		//log(LOG_INFO, '# clear ' + link);
		$('#golem-monster-link').val('');
		return false;
	});
};

Monster.page = function(page, change) {
	var now = Date.now(), i, j, o, oid, uid, name, code, tower, type, tmp, txt, dmg, fort, list, el, mid, type_label, $health, $defense, $dispel, $secondary, dead = false, monster, ATTACKHISTORY = 20, types = this.types, ensta = ['energy','stamina'], x, festival, parent, $children, owner;

	log(LOG_INFO, '# page ' + page);
	if (['keep_monster_active', 'monster_battle_monster', 'festival_battle_monster'].indexOf(page)>=0) { // In a monster or raid
		festival = (page === 'festival_battle_monster');

		i = $('div[style*="monster_header_"]'
		  + ',div[style*="boss_header_"]'
		  + ',div[style*="festival_monsters_top_"]'
		  + ',div[style*="dragon_title_owner."]'
		  + ',div[style*="monster_"][style*="_header."]'); // grrr

		if (!i.length) {
			log(LOG_WARN, "# can't find monster header div for owner name");
		} else if (isFacebook) {
			parent = i;
			owner = $('img[linked][size="square"]', parent);
			if (owner.length) {
				oid = owner.attr('uid');
			}
		} else {
			parent = i;
			if ((owner = $('img[src*="/picture?type=square"]', parent)).length) {
				oid = (owner.attr('src') || '').regex(/facebook\.com\/(\d+)\/picture\?type=square/i);
			} else if ((owner = $('a[href*="facebook.com/profile.php?id="]', parent)).length) {
				oid = (owner.attr('href') || '').regex(/facebook\.com\/profile\.php\?id=(\d+)/i);
				if ((x = $('~ div', owner.closest('div')).filter(':colour(white)')).length === 1
				  && (x = $(x).text().trim(true).match(/^(.*)'s [^']*$/))
				) {
					name = x[1].trim();
				} else if ((x = $('img[src*="fbcdn.net/"][title]', owner)).length === 1) {
					name = $(x).attr('title').trim(true);
				}
			} else {
				log(LOG_INFO, '# oid failure breakdown: ' + i.length);
				log(LOG_INFO, '# parent: ' + dom_heritage(parent));
				log(LOG_INFO, '# a: ' + $('a', parent).length
				  + ' | ' + dom_heritage($('a', parent))
				  + ' | href[' + ($('a').attr('href') || '') + ']'
				);
				log(LOG_INFO, '# a.fb_profile_pic_rendered: ' + dom_heritage($('a.fb_profile_pic_rendered', parent)));
				log(LOG_INFO, '# a.fb_link: ' + dom_heritage($('a.fb_link', parent)));
				log(LOG_INFO, '# a.fb_link[href]: ' + dom_heritage($('a.fb_link[href]', parent)));
			}
		}

		if (parent.length) {
			// dig out the monster code
			tmp = null;
			if ((j = $('div:contains("Monster Code")', parent)).length) {
				tmp = j.last().text().trim(true);
			} else if ((j = $('~ div:contains("Monster Code")', parent)).length) {
				tmp = j.last().text().trim(true);
			}
			if (isString(tmp) && isArray(x = tmp.match(/^Monster codes?: (\w+:\w+)\b/i))) {
				code = x[1];
			}

			// dig out the summoner's ca name
			tmp = null;
			if ((j = $('div:contains("ummoned")', parent)).length) {
				tmp = $(j.last()).text().trim(true);
				j = parent.parent();
			} else if ((j = $('~ div:contains("ummoned")', parent)).length) {
				tmp = $(j.last()).text().trim(true);
				j = parent;
			}
			if (isString(tmp)
			  && ((x = tmp.match(/^(.*\S)'s Summoned$/i))
			  || (x = tmp.match(/^(.*\S) Summoned$/i)))
			) {
				name = x[1].trim(true);
			}

			if (!j || !j.length) {
				j = parent;
			}
			type_label = this.identify(j);
		}

		if (!oid || !type_label) {
			log(LOG_WARN, 'Unable to identify monster:'
			  + (!oid ? ' owner' : '')
			  + (!type_label ? ' type' : '')
			);
			return false;
		}

		if (type_label.charAt(0) === '!') {
			dead = true;
			type_label = type_label.substr(1);
		}
		type = types[type_label];

		if (!(tower = this.get(['data',mid,'tower']))
		  && $('img[src*="festival_achievement_monster2_"]').length
		) {
			tower = 2;
		}

		uid = oid;
		if (festival) {
			mid = uid + '_f';
		} else if (type.raid) {
			mid = uid + '_r';
		} else {
			mid = uid + '_' + (type.mpool || 4);
		}
		if (this.runtime.check === mid) {
			this.set(['runtime','check'], false);
		}
		//log(LOG_WARN, 'MID '+ mid);
		this.set(['data',mid,'type'], type_label);
		if (festival) {
			this.set(['data',mid,'page'], 'festival');
		}
		if (tower) {
			this.set(['data',mid,'tower'], tower);
		}
		this.set(['data',mid,'button_fail'], 0);
		this.set(['data',mid,'last'], now);
		monster = this.get(['data',mid]);
		this.set(['data',mid,'page'], page === 'festival_battle_monster' ? 'festival' : 'keep');
		this.set(['data',mid,'name'], name);
		if (code) {
			this.set(['data',mid,'code'], code);
		}
		if (dead) {
			// Will this catch Raid format rewards?
			if ($('input[src*="collect_reward_button."]').length
			  || $('input[src*="monster_buttons_collectreward."]').length
			) {
				this.set(['data',mid,'state'], 'reward');
			} else if ($('td.dragonContainer table table a[href^="http://apps.facebook.com/castle_age/keep.php?casuser=' + userID + '"]').length) {
				if (!this.get(['data',mid,'dead'])) {
					History.add(type_label,1);
					this.set(['data',mid,'dead'], true);
				}
				this.set(['data',mid,'state'], 'complete');
				this.set(['data',mid,'remove'], true);
			} else {
				this.set(['data',mid,'state'], null);
			}
			return false;
		}

		if ((j = ($('span.result_body').text() || '').trim()).match(/for your help in summoning|You have already assisted on this objective|You don't have enough stamina assist in summoning/i)) {
			if (j.match(/for your help in summoning/i)) {
				this.set(['data',mid,'assist'], now);
			}
			j = this.get(['data',mid,'state']);
			if (j !== 'engage' && j !== 'reward' || j !== 'completed') {
				this.set(['data',mid,'state'], 'assist');
			}
		} else {
			if (!dead && ((j = $('div[style*="nm_bottom."]')).length
			  && j.text().trim(true).match(/already hit the max number of attacker/i))
			  || ((j = $('div[style*="monster_layout_2."]')).length
			  && j.text().trim(true).match(/already hit the max number of attacker/i))
			) {
				this.set(['data',mid,'state'], 'full');
				this.set(['data',mid,'scouted'], now);
			} else if (!dead && !this.get(['data',mid,'state'])) {
				this.set(['data',mid,'state'], 'scout');
				this.set(['data',mid,'scouted'], now);
			}

			for (i in ensta) {
				if (this.get(['runtime','used',ensta[i]])) {
					if ($('span[class="positive"]').length && $('span[class="positive"]').prevAll('span').text().replace(/[^0-9\/]/g,'')) {
						calc_rolling_weighted_average(this.runtime.monsters[type_label]
								,'damage',Number($('span[class="positive"]').prevAll('span').text().replace(/[^0-9\/]/g,''))
								,ensta[i],this.runtime.used[ensta[i]],10);
						//log(LOG_WARN, 'Damage per ' + ensta[i] + ' = ' + this.runtime.monsters[type_label]['avg_damage_per_' + ensta[i]]);
						if (Player.get('general') === 'Banthus Archfiend'
								&& Generals.get(['data','Banthus Archfiend','charge'],1e99) < now) {
							Generals.set(['data','Banthus Archfiend','charge'],now + 4320000);
						}
						if (Player.get('general') === 'Zin'
								&& Generals.get(['data','Zin','charge'],1e99) < now) {
							Generals.set(['data','Zin','charge'],now + 82800000);
						}
					}
					this.set(['runtime','used',ensta[i]], 0);
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
		if (!type.raid && this.get(['data',mid,'state']) === 'engage' && type.attack.length > 2) {
			this.set(['runtime','button','count'], $(type.attack_button).length);
		}
		// Need to also parse what our class is for Bahamut.  (Can probably just look for the strengthen button to find warrior class.)
		for (i = 0; i < this.class_img.length; i++) {
			if ($(this.class_img[i]).length){
				this.set(['data',mid,'mclass'], i);
				break;
				//log(LOG_WARN, 'Monster class : '+Monster['class_name'][i]);
			}
		}
		if ($(this.warrior).length) {
			this.set(['data',mid,'warrior'], true);
		}
		if ($(this.secondary_off).length) {
			this.set(['data',mid,'secondary'], 100);
		} else if ($(this.secondary_on).length) {
			this.set(['data',mid,'secondary'], 0.01); // Prevent from defaulting to false
			$secondary = $(this.secondary_img);
			if ($secondary.length) {
				this.set(['data',mid,'secondary'], 100 * $secondary.width() / $secondary.parent().width());
				log(LOG_WARN, this.class_name[this.get(['data',mid,'mclass'])] + ' phase. Bar at ' + this.get(['data',mid,'secondary']) + '%');
			}
		}
		// If we have some other class but no cleric button, then we can't heal.
		if ((this.get(['data',mid,'secondary']) || this.get(['data',mid,'warrior'])) && !$(type.defend_button).length) {
			this.set(['data',mid,'no_heal'], true);
		}
		for (i = 0; i < this.health_img.length; i++) {
			if ($(this.health_img[i]).length){
				$health = $(this.health_img[i]).parent();
				this.set(['data',mid,'health'], $health.length ? (100 * $health.width() / $health.parent().width()) : 0);
				break;
			}
		}
		if (!type.defense_img || type.defense_img === 'shield_img') {
			// If we know this monster should have a shield image and don't find it, assume 0
			if (type.defense_img === 'shield_img') {
				this.set(['data',mid,'defense'], 100);
			}
			for (i = 0; i < this.shield_img.length; i++) {
				if ($(this.shield_img[i]).length){
					$dispel = $(this.shield_img[i]).parent();
					this.set(['data',mid,'defense'], 100 * (1 - ($dispel.width() / ($dispel.next().length ? $dispel.width() + $dispel.next().width() : $dispel.parent().width()))));
					break;
				}
			}
		}
		if (!type.defense_img || type.defense_img === 'defense_img') {
			// If we know this monster should have a defense image and don't find it,
			for (i = 0; i < this.defense_img.length; i++) {
				if ($(this.defense_img[i]).length){
					$defense = $(this.defense_img[i]).parent();
					this.set(['data',mid,'defense'], $defense.width() / ($defense.next().length ? $defense.width() + $defense.next().width() : $defense.parent().width()) * 100);
					if ($defense.parent().width() < $defense.parent().parent().width()){
						this.set(['data',mid,'strength'], 100 * $defense.parent().width() / $defense.parent().parent().width());
					} else {
						this.set(['data',mid,'strength'], 100);
					}
					this.set(['data',mid,'defense'], this.get(['data',mid,'defense'], 0) * this.get(['data',mid,'strength'], 100) / 100);
					break;
				}
			}
		}
		this.set(['data',mid,'timer'], $('#'+APPID_+'monsterTicker').text().parseTimer());
		this.set(['data',mid,'finish'], now + (this.get(['data',mid,'timer']) * 1000));
		// doesn't take raid stage 2 into account yet
		i = (festival ? (this.get(['data',mid,'tower']) === 2 ? type.festival_timer2 : 0) || type.festival_timer : 0) || type.timer;
		this.set(['data',mid,'start'], this.get(['data',mid,'finish']) - i * 1000);
		this.set(['data',mid,'damage','siege'], 0);
		this.set(['data',mid,'damage','others'], 0);
		if (!dead &&$('input[name*="help with"]').length && $('input[name*="help with"]').attr('title')) {
			//log(LOG_WARN, 'Current Siege Phase is: '+ this.get(['data',mid,'phase']);
			this.set(['data',mid,'phase'], $('input[name*="help with"]').attr('title').regex(/ (.*)/i));
			//log(LOG_WARN, 'Assisted on '+this.get(['data',mid,'phase'])+'.');
		}
		tmp = $('img[src*="siege_small"]');
		for (i = 0; i < tmp.length; i++) {
			//siege = $(tmp[i]).parent().next().next().next().children().eq(0).text();
			dmg = $(tmp[i]).parent().next().next().next().children().eq(1).text().replace(/\D/g,'').regex(/(\d+)/);
			//log(LOG_WARN, 'Monster Siege',siege + ' did ' + dmg.addCommas() + ' amount of damage.');
			Monster.add(['data',mid,'damage','siege'], dmg / (types[type_label].orcs ? 1000 : 1));
		}
//		$('td.dragonContainer table table a[href^="http://apps.facebook.com/castle_age/keep.php?casuser="]').each(function(i,el){}
		tmp = $('.dragonContainer img[src*="team_attack_icon."]').closest('tr');
		if (!tmp.length) {
			if ((tmp = $('.dragonContainer img[src*="like_button2."]')).length) {
				tmp = $('table', tmp.closest('td'));
			}
		}
		if (tmp.length) {
			tmp = $('td a[href*="keep.php?casuser="]', tmp);
			for (i = 0; i < tmp.length; i++) {
				uid = $(tmp[i]).attr('href').regex(/user=(\d+)\b/i);
				txt = ($(tmp[i]).closest('td').next().text() || '').replace(/[^\d\/]+/gm, '');
				dmg = txt.regex(/^(\d+)/);
				fort = txt.regex(/\/(\d+)/);
				if (uid === userID){
					if (!this.get(['data',mid,'state'])
					  && this.get(['data',mid,'finish'], 0, 'number') > now
					) {
						this.set(['data',mid,'state'], 'engage');
					}
					this.set(['data',mid,'damage','user','manual'], dmg - this.get(['data',mid,'damage','user','script'], 0));
					this.set(['data',mid,'defend','manual'], fort - this.get(['data',mid,'defend','script'], 0));
					this.set(['data',mid,'stamina','manual'], Math.round(this.get(['data',mid,'damage','user','manual'], 0) / this.get(['runtime','monsters',type_label,'avg_damage_per_stamina'], 1)));
				} else {
					this.add(['data',mid,'damage','others'], dmg);
				}
			}
		}
		// If we're doing our first attack then add them without having to visit list
		if (this.get(['data',mid,'state']) === 'assist' && sum(this.get(['data',mid,'damage','user'], 0))) {
			this.set(['data',mid,'state'], 'engage');
		}
		if (!type.raid && $(type.attack_button).length && sum(this.get(['data',mid,'damage','user'], 0))) {
			this.set(['data',mid,'state'], this.get(['data',mid,'state'], 'engage', 'string'));
		}
		this.set(['data',mid,'dps'], sum(this.get(['data',mid,'damage'])) / (now - this.get(['data',mid,'start'])) * 1000);
		if (types[type_label].raid) {
			this.set(['data',mid,'total'], sum(this.get(['data',mid,'damage'])) + $('div[style*="monster_health_back.jpg"] div:nth-child(2)').text().regex(/(\d+)/));
		} else {
			this.set(['data',mid,'total'], Math.ceil(100 * sum(this.get(['data',mid,'damage'])) / (this.get(['data',mid,'health']) === 100 ? 0.1 : (100 - this.get(['data',mid,'health'])))));
		}
		this.set(['data',mid,'eta'], now + (Math.floor((this.get(['data',mid,'total']) - sum(this.get(['data',mid,'damage']))) / this.get(['data',mid,'dps'])) * 1000));
//		this.set('runtime.used.stamina', 0);
//		this.set('runtime.used.energy', 0);
	} else if (page === 'monster_dead') {
		if (Queue.temp.current === 'Monster' && this.runtime.mid) { // Only if we went here ourselves...
			log(LOG_WARN, 'Deleting ' + this.get(['data',this.runtime.mid,'name']) + "'s " + this.get(['data',this.runtime.mid,'type']));
//			this.set(['data',this.runtime.mid]);
			this.set(['data',this.runtime.mid,'remove'], true);
		} else {
			log(LOG_WARN, 'Unknown monster (timed out)');
		}
		this.set(['runtime','check'], false);
// Still need to do battle_raid
	} else if (page === 'festival_monster_list' || page === 'festival_monster2_list') { // Check monster / raid list
		list = $('div[style*="festival_monster_list_middle.jpg"]');
		for (i = 0; i < list.length; i++) {
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
				if (page === 'festival_monster2_list') {
					this.set(['data',mid,'tower'], 2);
				}
				this.set(['data',mid,'seen'], now);
				switch ($children.eq(3).find('img').attr('src').filepart().regex(/(\w+)\.(gif|jpg)/)[0]) {
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
				log(e, e.name + ' in ' + this.name + '.page(' + page + ', ' + change + '): ' + e.message);
			}
		}
		for (mid in this.data) {
			o = this.get(['data',mid]);
			if (o.page === 'festival'
			  && page === (o.tower === 2 ? 'festival_monster2_list' : 'festival_monster_list')
			  && this.get(['data',mid,'seen'], 0) < now
			  && ((o.scouted || Date.HUGE) + 5*60*1000 < now
			  || (o.finish || Date.HUGE) < now
			  || (o.state !== 'assist' && o.state !== 'scout'))
			) {
				log(LOG_INFO, 'Deleting stale festival '
				  + o.type + '.' + mid
				  + (o.tower ? '.' + tower : '')
				  + ' in state ' + o.state
				);
				this.set(['data',mid,'state'], null);
			}
		}
	} else if (page === 'monster_monster_list') { // Check monster / raid list
		list = $('div[style*="monsterlist_container.gif"]');
		for (i = 0; i < list.length; i++) {
			el = list[i];
			$children = $(el).children('div');
			try {
				this._transaction(); // BEGIN TRANSACTION
				assert(uid = $children.eq(2).find('input[name="casuser"]').attr('value'), 'Unknown UserID');
				tmp = $children.eq(0).find('img').eq(0).attr('src').regex(/graphics\/([^.]*\....)/i);
				assert(type = findInObject(types, tmp, 'list'), 'Unknown monster type: '+tmp);
				name = $children.eq(1).children().eq(0).text().trim(true);
				if ((x = name.indexOf("'s " + this.types[type].name)) >= 0
				  || ((x = this.types[type].brief)
				  && (x = name.indexOf("'s " + x)) >= 0)
				) {
					name = name.substr(0, x);
				}
//				log(LOG_INFO, 'Adding monster - uid: '+uid+', name: '+name+', image: "'+type+'"');
				mid = uid + '_' + (types[type].mpool || 4);
				this.set(['data',mid,'type'], type);
				this.set(['data',mid,'name'], name);
				this.set(['data',mid,'seen'], now);
				switch($children.eq(2).find('input[type="image"]').attr('src').regex(/(\w+)\.(gif|jpg)/)[0]) {
				case 'monsterlist_button_engage':
					this.set(['data',mid,'state'], 'engage');
					break;
				case 'monster_button_collect':
					// Can't tell if complete or reward, so set to complete, and will find reward when next visited
					if (!this.get(['data',mid,'collected'])) {
						this.set(['data',mid,'state'], 'reward');
					}
					break;
				default:
					this.set(['data',mid,'state'], 'unknown');
					break; // Should probably delete, but keep it on the list...
				}
				this._transaction(true); // COMMIT TRANSACTION
			} catch(e2) {
				this._transaction(false); // ROLLBACK TRANSACTION on any error
				log(e2, e2.name + ' in ' + this.name + '.page(' + page + ', ' + change + '): ' + e2.message);
			}
		}
		for (mid in this.data) {
			o = this.get(['data',mid]);
			if (o.page !== 'festival' && !types[o.type].raid
			  && this.get(['data',mid,'seen'], 0) < now
			  && ((o.scouted || Date.HUGE) + 5*60*1000 < now
			  || (o.finish || Date.HUGE) < now
			  || (o.state !== 'assist' && o.state !== 'scout'))
			) {
				log(LOG_INFO, 'Deleting stale monster '
				  + o.type + '.' + mid
				  + ' in state ' + o.state
				);
				this.set(['data',mid,'state'], null);
			}
		}
	} else if (page === 'monster_remove_list') { // Check monster / raid list
		$('#app'+APPID+'_app_body div.imgButton').each(function(a,el) {
			var link = $('a', el).attr('href'), mid;
			// this page may not be ours, so only use it to confirm known
			// monster state, not to learn new ones
			if (link && link.regex(/casuser=([0-9]+)/i)) {
				mid = link.regex(/casuser=([0-9]+)/i)+'_'+link.regex(/mpool=([0-9])/i);
				if (!this.get(['data',mid])) {
					return;
				}
				log(LOG_WARN, 'MID '+ mid);
				switch($('img', el).attr('src').regex(/dragon_list_btn_([0-9])/)) {
				case 2:
					if (Monster.get(['data',mid,'state']) === 'engage') {
						Monster.set(['data',mid,'state'], 'reward');
						Monster.set(['data',mid,'seen'], now);
					}
					break;
				case 3:
					//Monster.set(['data',mid,'state'], 'engage');
					this.set(['data',mid,'seen'], mid);
					break;
				case 4:
					if (Monster.get(['data',mid,'state']) === 'engage') {
						// might need collecting, check that first
						Monster.set(['data',mid,'state'], 'reward');
						Monster.set(['data',mid,'seen'], now);
					}
					break;
				default:
					//Monster.set(['data',mid,'state'], 'unknown');
					break; // Should probably delete, but keep it on the list...
				}
			}
		});
		for (mid in this.data) {
			o = this.get(['data',mid]);
			if (o.page !== 'festival' && !types[o.type].raid
			  && this.get(['data',mid,'seen'], 0) < now
			  && ((o.scouted || Date.HUGE) + 5*60*1000 < now
			  || (o.finish || Date.HUGE) < now
			  || (o.state !== 'assist' && o.state !== 'scout'))
			) {
				log(LOG_INFO, 'Possibly stale monster '
				  + ((j = types[o.type]) ? j : o.type)
				  + '.' + mid
				  + ' in state ' + o.state
				);
				//this.set(['data',mid,'state'], null);
			}
		}
	}
	return false;
};

Monster.resource = function() {
	if (Monster.get('runtime.banthus').length && Generals.get(['data','Banthus Archfiend','charge'],1e99) < Date.now()) {
		Monster.set(['runtime','banthusNow'], true);
		LevelUp.set(['runtime','basehit'], Monster.get('runtime.banthus').lower(LevelUp.get(['runtime','stamina'], 0)));
		LevelUp.set(['runtime','general'], 'Banthus Archfiend');
		return 'stamina';
	}
	Monster.set(['runtime','banthusNow'], false);
	return false;
};

Monster.update = function(event, events) {
	var now = Date.now(), i, j, o, p, mid, uid, type,
		stat_req, req_stamina, req_health, req_energy,
		messages = [], fullname = {}, list = {}, listSortFunc,
		matched_mids = [], min, max, limit, filter,
		ensta = ['energy','stamina'],
		defatt = ['defend','attack'],
		button_count, monster, damage, target, waiting_ok,
		condition, searchterm, attack_found, defend_found,
		attack_overach, defend_overach, suborder, defense_kind, button, order,
		health = Player.get('health');

	this.set('runtime.mode', null);
	this.set('runtime.stat', null);
	this.set('runtime.check', null);
	this.set('runtime.message', null);
	this.set('runtime.mid', null);
	this.set('runtime.big', []);
	this.set('runtime.values.attack', []);
	this.set('runtime.values.defend', []);

	limit = this.get('runtime.limit');
	if(!LevelUp.get('runtime.running') && limit === 100){
		limit = 0;
	}
	list.defend = [];
	list.attack = [];

	// Flush stateless monsters
	for (mid in this.data) {
		o = this.get(['data',mid]);
		if (!o.state) {
			log(LOG_LOG, 'Deleted monster MID ' + mid + ' because state is ' + o.state);
			this.set(['data',mid]);
		}
	}

	// Check for unviewed monsters
	for (mid in this.data) {
		o = this.get(['data',mid]);
		if (!o.last && !o.ignore && o.state === 'engage') {
			this.check(mid, 'Checking new monster ', 'casuser','');
			this.set('runtime.defending', true);
			this.set(['data',mid,'last'], now); // Force it to only check once
			return;
		}
	}

	// Some generals use more stamina, but only in certain circumstances...
	defatt.forEach( function(mode) {
		Monster.set(['runtime','multiplier',mode], (Generals.get([LevelUp.get('runtime.general') || (Generals.best(Monster.option['best_' + mode] ? ('monster_' + mode) : Monster.option['general_' + mode])), 'skills'], '').regex(/Increase Power Attacks by (\d+)/i) || 1));
		//log(LOG_WARN, 'mult ' + mode + ' X ' + Monster.get(['runtime','multiplier',mode]));
	});
	waiting_ok = !this.option.hide && !LevelUp.get('runtime.force.stamina');
	if (this.option.stop === 'Priority List') {
		attack_found = false;
		defend_found = false;
		attack_overach = false;
		defend_overach = false;
		order = [];
		this.set('runtime.banthus', []);
		if (this.option.priority) {
			order = this.option.priority.toLowerCase().replace(/ *[\n,]+ */g,',').replace(/[, ]*\|[, ]*/g,'|').split(',');
		}
		order.push('your ',"'s"); // Catch all at end in case no other match
		for (o = 0; o < order.length; o++) {
			order[o] = order[o].trim();
			if (!order[o]) {
				continue;
			}
			if (order[o] === 'levelup') {
				if ((LevelUp.get('runtime.force.stamina') && !list.attack.length)
						|| (LevelUp.get('runtime.force.energy') && !list.defend.length)) {
					matched_mids = [];
					continue;
				} else {
					break;
				}
			}
			suborder = order[o].split('|');
			for (p = 0; p < suborder.length; p++) {
				suborder[p] = suborder[p].trim();
				if (!suborder[p]) {
					continue;
				}
				searchterm = suborder[p].match(new RegExp("^[^:]+")).toString().trim();
				condition = suborder[p].replace(new RegExp("^[^:]+"), '').toString().trim();
				//log(LOG_WARN, 'Priority order ' + searchterm +' condition ' + condition + ' o ' + o + ' p ' + p);
				for (mid in this.data) {
					monster = this.get(['data',mid]);
					type = this.types[monster.type];
					//If this monster does not match, skip to next one
					// Or if this monster is dead, skip to next one
					if (	matched_mids.indexOf(mid)>=0
							||((monster.name === 'You' ? 'Your' : monster.name + "'s")
								+ ' ' + type.name).toLowerCase().indexOf(searchterm) < 0
							|| monster.ignore) {
						continue;
					}
					matched_mids.push(mid);
					this.set(['data',mid,'ac'], /:ac\b/.test(condition));
					if (monster.state !== 'engage') {
						continue;
					}
					//Monster is a match so we set the conditions
					this.set(['data',mid,'max'], this.conditions('max',condition));
					this.set(['data',mid,'ach'], this.conditions('ach',condition) || type.achievement);
					// check for min/max stamina/energy overrides
					if ((i = this.conditions('smin',condition)) && isNumber(i) && !isNaN(i)) {
						this.set(['data',mid,'smin'], i);
					} else {
						this.set(['data',mid,'smin']);
					}
					if ((i = this.conditions('smax',condition)) && isNumber(i) && !isNaN(i)) {
						this.set(['data',mid,'smax'], i);
					} else {
						this.set(['data',mid,'smax']);
					}
					if ((i = this.conditions('emin',condition)) && isNumber(i) && !isNaN(i)) {
						this.set(['data',mid,'emin'], i);
					} else {
						this.set(['data',mid,'emin']);
					}
					if ((i = this.conditions('emax',condition)) && isNumber(i) && !isNaN(i)) {
						this.set(['data',mid,'emax'], i);
					} else {
						this.set(['data',mid,'emax']);
					}

					// check for pa ach/max overrides
					if ((i = this.conditions('achpa',condition)) && isNumber(i) && !isNaN(i)) {
						this.set(['data',mid,'achpa'], i);
						if (isNumber(j = this.get(['runtime','monsters',monster.type,'avg_damage_per_stamina'])) && !isNaN(j)) {
							this.set(['data',mid,'ach'], Math.ceil(i * 5 * j));
						}
					} else {
						this.set(['data',mid,'achpa']);
					}
					if ((i = this.conditions('maxpa',condition)) && isNumber(i) && !isNaN(i)) {
						this.set(['data',mid,'maxpa'], i);
						if (isNumber(j = this.get(['runtime','monsters',monster.type,'avg_damage_per_stamina'])) && !isNaN(j)) {
							this.set(['data',mid,'max'], Math.ceil(i * 5 * j));
						}
					} else {
						this.set(['data',mid,'maxpa']);
					}

					this.set(['data',mid,'attack_min'], this.conditions('a%',condition) || this.option.min_to_attack);
					if (isNumber(monster.ach) && !isNaN(monster.ach) && (!isNumber(monster.max) || isNaN(monster.max))) {
						this.set(['data',mid,'max'], monster.ach);
					}
					if (isNumber(monster.max) && !isNaN(monster.max) && (!isNumber(monster.ach) || isNaN(monster.ach))) {
						this.set(['data',mid,'ach'], monster.max);
					}
					if (isNumber(monster.max) && !isNaN(monster.max)) {
						this.set(['data',mid,'ach'], Math.min(monster.ach, monster.max));
					}
					if (type.defend) {
						this.set(['data',mid,'defend_max'], Math.min(this.conditions('f%',condition) || this.option.defend, (monster.strength || 100) - 1));
					}
					monster = this.get(['data',mid]); // refetch
					damage = 0;
					damage += sum(this.get(['data',mid,'damage','user']));
					damage += sum(this.get(['data',mid,'defend']));
					target = monster.max || monster.ach || 0;
					if (!type.raid){
						button_count = ((type.attack.length > 2) ? this.get('runtime.button.count') : type.attack.length);
					}
					req_stamina = type.raid ? (this.option.raid.search('x5') === -1 ? 1	: 5)
							: Math.min(type.attack[Math.min(button_count, monster.smax || type.attack.length)-1], Math.max(type.attack[0], LevelUp.get('runtime.basehit') || monster.smin || this.option.attack_min)) * this.get(['runtime','multiplier','attack']);
					req_health = type.raid ? (this.option.risk ? 13 : 10) : 10;
// Don't want to die when attacking a raid
					//log(LOG_WARN, 'monster name ' + type.name + ' basehit ' + LevelUp.get('runtime.basehit') +' min ' + type.attack[Math.min(button_count, monster.smax || type.attack.length)-1]);
					if ((monster.defense || 100) >= monster.attack_min) {
// Set up this.values.attack for use in levelup calcs
						if (type.raid) {
							this.set('runtime.values.attack', this.get('runtime.values.attack').concat((this.option.raid.search('x5') < 0) ? 1 : 5).unique());
// If it's a defense monster, never hit for 1 damage.  Otherwise, 1 damage is ok.
						} else {
							if (damage < this.conditions('ban',condition)) {
								this.set('runtime.banthus', this.get('runtime.banthus').concat(type.attack).unique());
							}
							if (type.defend && type.attack.indexOf(1) > -1) {
								this.set('runtime.values.attack', this.get('runtime.values.attack').concat(type.attack.slice(1,this.get('runtime.button.count'))).unique());
							} else {
								this.set('runtime.values.attack', this.get('runtime.values.attack').concat(type.attack.slice(0,this.get('runtime.button.count'))).unique());
							}
						}
						if ((attack_found === false || attack_found === o)
								&& (waiting_ok || (health >= req_health
								&& LevelUp.get('runtime.stamina') >= req_stamina))
								&& (!this.get('runtime.banthusNow')
									|| damage < this.conditions('ban',condition))
								&& (!LevelUp.get('runtime.basehit')
									|| type.attack.indexOf(LevelUp.get('runtime.basehit'))>= 0)) {
							button = type.attack_button;
							if (this.option.use_tactics && type.tactics) {
								button = type.tactics_button;
							}
							if (damage < monster.ach
									|| (this.get('runtime.banthusNow')
										&& damage < this.conditions('ban',condition))
									|| (LevelUp.get('runtime.basehit')
										&& type.attack.indexOf(LevelUp.get('runtime.basehit'))>= 0)) {
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
						this.set('runtime.big', this.get('runtime.big').concat(type.defend.slice(0,this.get('runtime.button.count'))).unique());
					}
					if (this.option.defend_active && (defend_found === false || defend_found === o)) {
						defense_kind = false;
						if (typeof monster.secondary !== 'undefined' && monster.secondary < 100) {
							//log(LOG_WARN, 'Secondary target found (' + monster.secondary + '%)');
							defense_kind = Monster.secondary_on;
						} else if (monster.warrior && (monster.strength || 100) < 100 && monster.defense < monster.strength - 1) {
							defense_kind = Monster.warrior;
						} else if (!monster.no_heal
								&& ((/:big\b/.test(condition) && LevelUp.get('runtime.big'))
									|| (monster.defense || 100) < monster.defend_max)) {
							defense_kind = type.defend_button;
						}
						if (defense_kind) {
							this.set('runtime.values.defend', this.get('runtime.values.defend').concat(type.defend.slice(0,this.get('runtime.button.count'))).unique());
							//log(LOG_WARN, 'defend ok' + damage + ' ' + LevelUp.get('runtime.basehit')+ ' ' + type.defend.indexOf(LevelUp.get('runtime.basehit')));
							if (!LevelUp.get('runtime.basehit')
									|| type.defend.indexOf(LevelUp.get('runtime.basehit'))>= 0) {
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
                                button_count = ((type.attack.length > 2) ? this.get('runtime.button.count') : type.attack.length);
                        }
			req_stamina = type.raid ? (this.option.raid.search('x5') === -1 ? 1	: 5)
					: Math.min(type.attack[Math.min(button_count,type.attack.length)-1], Math.max(type.attack[0], LevelUp.get('runtime.basehit') || monster.smin || this.option.attack_min)) * this.get('runtime.multiplier.attack');
			req_health = type.raid ? (this.option.risk ? 13 : 10) : 10; // Don't want to die when attacking a raid
			monster.ach = (this.option.stop === 'Achievement') ? type.achievement : (this.option.stop === '2X Achievement') ? type.achievement : (this.option.stop === 'Continuous') ? type.achievement :0;
			monster.max = (this.option.stop === 'Achievement') ? type.achievement : (this.option.stop === '2X Achievement') ? type.achievement*2 : (this.option.stop === 'Continuous') ? type.achievement*this.get('runtime.limit') :0;
			if (	!monster.ignore
					&& monster.state === 'engage'
					&& monster.finish > now	) {
				uid = mid.replace(/_.+/,'');
				if (uid === userID && this.option.own) {
					// add own monster
				} else if (this.option.avoid_lost_cause
						&& (monster.eta - monster.finish)/3600000
							> this.option.lost_cause_hours && (!LevelUp.option.override || !LevelUp.get('runtime.running')) && !monster.override) {
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
				if ((uid === userID && this.option.own) || this.option.stop === 'Never') {
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
				if ((waiting_ok || (health >= req_health && LevelUp.get('runtime.stamina') >= req_stamina))
				 && (isNumber(monster.defense) ? monster.defense : 100) >= Math.max(this.option.min_to_attack,0.1)) {
// Set up this.values.attack for use in levelup calcs
					if (type.raid) {
						this.set('runtime.values.attack', this.get('runtime.values.attack').concat((this.option.raid.search('x5') < 0) ? 1 : 5).unique());
// If it's a defense monster, never hit for 1 damage.  Otherwise, 1 damage is ok.
					} else if (type.defend && type.attack.indexOf(1) > -1) {
						this.set('runtime.values.attack', this.get('runtime.values.attack').concat(type.attack.slice(1,this.get('runtime.button.count'))).unique());
					} else {
						this.set('runtime.values.attack', this.get('runtime.values.attack').concat(type.attack.slice(0,this.get('runtime.button.count'))).unique());
					}
					if (this.option.use_tactics && type.tactics) {
						list.attack.push([mid, (sum(monster.damage && monster.damage.user) + sum(monster.defend)) / sum(monster.damage), type.tactics_button, damage, target]);
					} else {
						list.attack.push([mid, (sum(monster.damage && monster.damage.user) + sum(monster.defend)) / sum(monster.damage), type.attack_button, damage, target]);
					}
				}
				// Possible defend target?
				if (this.option.defend_active) {
					if (type.defend) {
						this.set('runtime.values.defend', this.get('runtime.values.defend').concat(type.defend.slice(0,this.get('runtime.button.count'))).unique());
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

	this.set('runtime.defending', list.defend && list.defend.length > 0);

	// If using the priority list and levelup settings, the script may oscillate between having something to defend when in level up, and then forgetting it when it goes to attack something because it doesn't pass levelup in the priority list and tries to quest, and then finds it again.  The following preserves the runtime.defending value even when in force.stamina mode
	if (LevelUp.get('runtime.force.stamina')) {
		this.set('runtime.defending', this.get('runtime.levelupdefending'));
	} else {
		this.set('runtime.levelupdefending', this.get('runtime.defending'));
	}

	listSortFunc = function(a,b){
		var monster_a = Monster.get(['data',a[0]]),
			monster_b = Monster.get(['data',b[0]]),
			late_a, late_b, time_a, time_b, goal_a, goal_b;
		switch (Monster.option.choice) {
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
			this.set(['runtime',i], mid = list[i][0][0]);
			this.set(['runtime','button',i,'query'], list[i][0][2]);
			uid = mid.replace(/_.+/,'');
			type = this.types[this.data[mid].type];
			fullname[i] = (uid === userID ? 'your ': (this.get(['data',mid,'name']) + "'s ")) + type.name;
		} else {
			this.set(['runtime',i], false);
		}
	}
	// Make the * dash messages for current attack and defend targets
	for (i in ensta) {
		if (this.get(['runtime',defatt[i]])) {
			monster = this.get(['data',this.get(['runtime',defatt[i]])]);
			type = this.types[monster.type];
			// Calculate what button for att/def and how much energy/stamina cost
			if (ensta[i] === 'stamina' && type.raid) {
				this.set(['runtime',ensta[i]], this.option.raid.search('x5') < 0 ? 1 : 5);
			} else {
				button_count = ((type.attack.length > 2) ? this.get('runtime.button.count') : type[defatt[i]].length);
				min = Math.min(type[defatt[i]][Math.min(button_count,type[defatt[i]].length)-1], Math.max(type[defatt[i]][0], LevelUp.get('runtime.basehit') || this.option[defatt[i] + '_min']));
				max = Math.min(type[defatt[i]][Math.min(button_count,type[defatt[i]].length)-1], LevelUp.get('runtime.basehit') || this.option[defatt[i] + '_max'], LevelUp.get(['runtime',ensta[i]]) / this.get(['runtime','multiplier',defatt[i]]));
				damage = sum(monster.damage && monster.damage.user) + sum(monster.defend);
				limit = (LevelUp.get('runtime.big') ? max : damage < (monster.ach || damage)
						? monster.ach : damage < (monster.max || damage)
						? monster.max : max);
				max = Math.min(max,(limit - damage)/(this.get(['runtime','monsters',monster.type,'avg_damage_per_'+ensta[i]]) || 1)/this.get(['runtime','multiplier',defatt[i]]));
				//log(LOG_WARN, 'monster damage ' + damage + ' average damage ' + (this.get(['runtime','monsters',monster.type,'avg_damage_per_'+ensta[i]]) || 1).round(0) + ' limit ' + limit + ' max ' + ensta[i] + ' ' + max.round(1));
				filter = function(e) { return (e >= min && e <= max); };
				this.set(['runtime','button',defatt[i],'pick'], bestObjValue(type[defatt[i]], function(e) { return e; }, filter) || type[defatt[i]].indexOf(min));
				//log(LOG_WARN, ' ad ' + defatt[i] + ' min ' + min + ' max ' + max+ ' pick ' + this.get(['runtime','button',defatt[i],'pick']));
				//log(LOG_WARN, 'min detail '+ defatt[i] + ' # buttons   ' + Math.min(this.get('runtime.button.count'),type[defatt[i]].length) +' button val ' +type[defatt[i]][Math.min(this.get('runtime.button.count'),type[defatt[i]].length)-1] + ' max of type[0] ' + type[defatt[i]][0] + ' queue or option ' + (LevelUp.get('runtime.basehit') || this.option[defatt[i] + '_min']));
				//log(LOG_WARN, 'max detail '+ defatt[i] + ' physical max ' + type[defatt[i]][Math.min(this.get('runtime.button.count'),type[defatt[i]].length)-1] + ' basehit||option ' + (LevelUp.get('runtime.basehit') || this.option[defatt[i]]) + ' stamina avail ' + (LevelUp.get(['runtime',ensta[i]]) / this.get(['runtime','multiplier',defatt[i]])));
				this.set(['runtime',ensta[i]], type[defatt[i]][this.get(['runtime','button',defatt[i],'pick']) * this.get(['runtime','multiplier',defatt[i]])]);
			}
			this.set('runtime.health', type.raid ? 13 : 10); // Don't want to die when attacking a raid
			req_health = (defatt[i] === 'attack' ? Math.max(0, this.get('runtime.health') - health) : 0);
			stat_req = Math.max(0, (this.get(['runtime',ensta[i]]) || 0) - LevelUp.get(['runtime',ensta[i]]));
			if (stat_req || req_health) {
				messages.push('Waiting for ' + (stat_req ? Config.makeImage(ensta[i]) + stat_req : '')
				+ (stat_req && req_health ? ' &amp; ' : '') + (req_health ? Config.makeImage('health') + req_health : '')
				+ ' to ' + defatt[i] + ' ' + fullname[defatt[i]]
				+ ' (' + Config.makeImage(ensta[i]) + (this.get(['runtime',ensta[i]]) || 0) + '+' + (stat_req && req_health ? ', ' : '') + (req_health ? Config.makeImage('health') + req_health : '') + ')');
			} else {
				messages.push(defatt[i] + ' ' + fullname[defatt[i]] + ' (' + Config.makeImage(ensta[i])
						+ (this.get(['runtime',ensta[i]]) || 0) + '+)');
				this.set('runtime.mode', this.get('runtime.mode') || defatt[i]);
				this.set('runtime.stat', this.get('runtime.stat') || ensta[i]);
			}
		}
	}
	if (this.get('runtime.mode') === 'attack' && Battle.get('runtime.points') && this.option.points && Battle.get('runtime.attacking')) {
		this.set('runtime.mode', null);
		this.set('runtime.stat', null);
	}
	// Nothing to attack, so look for monsters we haven't reviewed for a while.
	//log(LOG_WARN, 'attack ' + this.get('runtime.attack') + ' stat_req ' + stat_req + ' health ' + req_health);
	if ((!this.get('runtime.defend') || LevelUp.get('runtime.energy') < this.get('runtime.energy'))
			&& (!this.get('runtime.attack') || stat_req || req_health)) { // stat_req is last calculated in loop above, so ok
		for (mid in this.data) {
			monster = this.data[mid];
			if (!monster.ignore) {
				uid = mid.replace(/_.+/,'');
				type = this.types[monster.type];
				if (monster.state === 'reward' && monster.ac) {
					this.check(mid, 'Collecting Reward from ', 'casuser','&action=collectReward');
				} else if (monster.remove && this.option.remove && parseFloat(uid) !== userID
						&& monster.page !== 'festival') {
					//log(LOG_WARN, 'remove ' + mid + ' userid ' + userID + ' uid ' + uid + ' now ' + (uid === userID) + ' new ' + (parseFloat(uid) === userID));
					this.check(mid, 'Removing ', 'remove_list','');
				} else if (monster.last < now - this.option.check_interval * (monster.remove ? 5 : 1)) {
					this.check(mid, 'Reviewing ', 'casuser','');
				}
				if (this.get('runtime.message')) {
					return;
				}
			}
		}
	}
	if (messages.length) {
	    Dashboard.status(this, messages.join('<br>'));
	} else {
	    Dashboard.status(this);
	}
	if (!Queue.option.pause){
		if (LevelUp.get('runtime.running')) {
			this.set('runtime.limit', 100);
		} else if (!this.get('runtime.attack')) {
			this.set('runtime.limit', (limit > 30)? 1: (limit + 1|0));
		}
	} else {
		this.set('runtime.limit', 0);
	}
	this._notify('data');// Temporary fix for Dashboard updating

	return true;
};

Monster.work = function(state) {
	var i, j, mid, uid, type, btn = null, b, monster, title,
		target_info = [], battle_list, list = [],
		mode = this.runtime.mode,
		stat = this.runtime.stat;

	if (!this.runtime.check && !mode) {
		return QUEUE_NO_ACTION;
	}
	if (!state) {
		return QUEUE_CONTINUE;
	}
	if (this.runtime.check) {
		log(LOG_WARN, this.runtime.message);
		Page.to(this.runtime.page, this.runtime.check);
		this.set('runtime.check', false);
		this.set('runtime.limit', false);
		this.set('runtime.message', false);
		this.set('runtime.dead', false);
		return QUEUE_RELEASE;
	}
	if (mode === 'defend' && LevelUp.get('runtime.quest')) {
		return QUEUE_NO_ACTION;
	}
	uid = this.runtime[mode].regex(/^(\d+)/);
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
		log(LOG_WARN, 'Try to ' + mode + ' ' + monster.name + "'s " + type.name + ' for ' + this.runtime[stat] + ' ' + stat);
		if (!$(this.runtime.button[mode].query).length || this.runtime.button[mode].pick >= $(this.runtime.button[mode].query).length) {
//			log(LOG_WARN, 'Unable to find '  + mode + ' button for ' + monster.name + "'s " + type.name + ' (' + this.runtime.button[mode].query + ')');
		} else {
//			log(LOG_WARN, ' query ' + $(this.runtime.button[mode].query).length + ' ' + this.runtime.button[mode].pick);
			btn = $(this.runtime.button[mode].query).eq(this.runtime.button[mode].pick);
			this.set(['runtime','used',stat], this.get(['runtime',stat]));
		}
		if (!btn || !btn.length){
			monster.button_fail = (monster.button_fail || 0) + 1;
			if (monster.button_fail > 10){
				log(LOG_LOG, 'Ignoring Monster ' + monster.name + "'s " + type.name + ': Unable to locate ' + (this.runtime.button[mode].pick || 'unknown') + ' ' + mode + ' button ' + monster.button_fail + ' times!');
				monster.ignore = true;
				monster.button_fail = 0;
			}
		}
	}
	if (!btn || !btn.length
	 || ['keep_monster_active', 'monster_battle_monster', 'festival_battle_monster'].indexOf(Page.temp.page) < 0
	 || (!$('div[style*="dragon_title_owner"] img[linked][uid="'+uid+'"]').length
		&& !$('div[style*="nm_top"] img[linked][uid="'+uid+'"]').length
		&& !$('img[linked][size="square"][uid="'+uid+'"]').length
		&& !$('img[width="52"][height="52"][src*="/'+uid+'/"]').length)) {
		//log(LOG_WARN, 'Reloading page. Button = ' + btn.attr('name'));
		//log(LOG_WARN, 'Reloading page. Page.temp.page = '+ Page.temp.page);
		//log(LOG_WARN, 'Reloading page. Monster Owner UID is ' + $('div[style*="dragon_title_owner"] img[linked]').attr('uid') + ' Expecting UID : ' + uid);
		this.check(this.runtime[mode],'','casuser','');
		Page.to(this.runtime.page,this.runtime.check);
		this.set('runtime.check', null);
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

Monster.check = function(mid, message, prefix, suffix) {
	var uid, type, monster, mpool, mmid;
	monster = this.data[mid];
	this.set('runtime.mid', mid);
	uid = mid.replace(/_.+/,'');
	type = this.types[monster.type];
	if (message) {
		this.set('runtime.message', message + (monster.name ? (monster.name === 'You' ? 'your' : monster.name.html_escape() + "'s") : '') + ' ' + type.name);
		Dashboard.status(this, this.get('runtime.message'));
	}
	this.set('runtime.page', type.raid ? 'battle_raid'
			: monster.page === 'festival' ? 'festival_battle_monster'
			: 'monster_battle_monster');
	if (monster.page === 'festival') {
		mpool = type.festival_mpool || type.mpool;
		if (type.festival) {
			mmid = '&mid=' + type.festival;
			if (monster.tower) {
				mmid += '&tower=' + monster.tower;
			}
			if (prefix.indexOf('remove_list') >= 0) {
				mmid += '&remove_monsterKey=' + type.festival;
			}
		}
	} else {
		mpool = type.mpool;
	}
	this.set('runtime.check', prefix + '=' + uid
			+ ((monster.phase && this.option.assist
				&& !LevelUp.runtime.levelup
				&& (monster.state === 'engage' || monster.state === 'assist'))
					? '&action=doObjective' : '')
			+ (mpool ? '&mpool=' + mpool : '')
			+ (mmid ? mmid : '')
			+ suffix);
};


Monster.order = null;
Monster.dashboard = function(sort, rev) {
	var i, j, o, type, monster, festival, args, list, output, page,
		blank, image_url, color, mid, uid, mpool, title, v, vv, tt, cc,
		sorttype = [null, 'name', 'health', 'defense', null, 'timer', 'eta'],
		state = {
			engage: 1,
			assist: 2,
			reward: 3,
			complete: 4,
			scout: 5,
			full: 6
		},
		viewable = {
			engage: true,
			assist: true,
			scout: true,
			full: true
		};

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
	this.set('runtime.sort', sort);
	this.set('runtime.rev', rev);
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

	list = [];
	list.push('<table cellspacing="0" style="width:100%;"><thead>');

	output = [];
	output.push('<td colspan="9" nowrap>');
	output.push('<span style="display:block;overflow:none;">');
	output.push('<input id="golem-monster-clear" type="button" value="Clear">');
	output.push('<input id="golem-monster-assist" type="button" value="Assist">');
	output.push('<input id="golem-monster-scout" type="button" value="Scout">');
	output.push('<input id="golem-monster-link" type="text" style="width:75%;" placeholder="Type monster URL here...">');
	output.push('</span>');
	output.push('</td>');
	list.push('<tr>' + output.join('') + '</tr>');

	output = [];
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
	list.push('<tr>' + output.join('') + '</tr>');
	list.push('</thead><tbody>');

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
		blank = !(viewable[monster.state] && monster.total);
		// http://apps.facebook.com/castle_age/battle_monster.php?user=00000&mpool=3
		// http://apps.facebook.com/castle_age/battle_monster.php?twt2=earth_1&user=00000&action=doObjective&mpool=3&lka=00000&ref=nf
		// http://apps.facebook.com/castle_age/raid.php?user=00000
		// http://apps.facebook.com/castle_age/raid.php?twt2=deathrune_adv&user=00000&action=doObjective&lka=00000&ref=nf
		// http://apps.facebook.com/castle_age/raid.php?twt2=deathrune_adv&casuser=100000419529058&action=doObjective&lka=100000419529058&ref=nf
		//args += '&twt2=' + ???;
		args = '?casuser=' + uid;
		mpool = type.mpool ? ('&mpool=' + type.mpool) : '';
		if (festival && monster.tower === 2 && (v = type.festival_mpool2)) {
			args += '&mpool=' + v;
		} else if (festival && (v = type.festival_mpool)) {
			args += '&mpool=' + v;
		} else if ((v = type.mpool)) {
			args += '&mpool=' + v;
		}
		if ((v = type.festival)) {
			args += '&mid=' + v;
		}
		if (festival && (v = monster.tower)) {
			args += '&tower=' + v;
		}
		if (this.option.assist_links && (monster.state === 'engage' || monster.state === 'assist') && type.siege !== false ) {
			args += '&action=doObjective';
		}
		//args += '&lka=' + uid;
		//args += '&ref=nf';

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
		if (type.raid) {
			page = 'battle_raid';
			cc = 'red';
		} else if (festival) {
			page = 'festival_battle_monster';
			cc = 'yellow';
		} else if (monster.page === 'guild') {
			page = 'guild_monster_battle';
			cc = 'green';
		} else {
			page = 'monster_battle_monster';
			cc = '';
		}
		td(output, Page.makeLink(page, args, '<img src="' + imagepath + type.list + '" style="width:72px;height:20px; position: relative; left: -8px; opacity:.7;" alt="' + type.name + '"><strong class="overlay"' + (cc !== '' ? ' style="color:'+cc+';"' : '') + '>' + monster.state + '</strong>'), 'title="' + tt + '"');
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

		// activity
		v = sum(monster.damage && monster.damage.user) + sum(monster.defend);
		if (monster.ach > 0 || monster.max > 0) {
			if (monster.max > 0 && v >= monster.max) {
				color = 'red';
			} else if (monster.ach > 0 && v >= monster.ach) {
				color = 'orange';
			} else {
				color = 'green';
			}
		} else {
			color = 'black';
		}
		td(output,
			(blank || monster.state !== 'engage' || (typeof monster.damage === undefined || typeof monster.damage.user === 'undefined'))
				? ''
				: '<span style="color: ' + color + ';">' + v.addCommas() + '</span>',
			blank
				? ''
				: 'title="' + ( sum(monster.damage && monster.damage.user) / monster.total * 100).round(2) + '% from ' + (sum(monster.stamina)/5 || 'an unknown number of') + ' PAs"');

		// time left
		vv = tt = '';
		if (!blank && (v = monster.finish)) {
			vv = Page.addTimer('monster_'+mid+'_finish', v);
			if ((j = monster.start)) {
				tt = 'Total: ' + (v - j).toTimespan(1);
			}
		}
		if (tt !== '') {
			tt = 'title="'+tt+'"';
		}
		td(output, vv, tt);

		// etd
		vv = tt = cc = '';
		if (!blank && (v = monster.eta)) {
			vv = Page.addTimer('monster_'+mid+'_eta', v);
			if (monster.start) {
				j = v - monster.start;
			} else if ((j = (festival
			  ? (this.get(['data',mid,'tower']) === 2
			  ? type.festival_timer2 : 0) || type.festival_timer : 0)
			  || type.timer)
			) {
				j = v - monster.finish + j * 1000;
			} else {
				j = Date.HUGE;
			}
			if (tt !== '') { tt += ' | '; }
			tt = 'Total: ' + j.toTimespan(1);
			if (!festival && isNumber(j) && j < 24*60*60*1000) {
				tt += ' (Gold status)';
				cc = 'green';
			} else if (!festival && isNumber(j) && j < 2*24*60*60*1000) {
				tt += ' (Silver status)';
				cc = 'green';
			} else if (!festival && isNumber(j) && j < 3*24*60*60*1000) {
				if (tt !== '') { tt += ' | '; }
				tt += ' (Bronze status)';
				cc = 'green';
			} else if (monster.finish < v) {
				if ((j = monster.start)) {
					j = (v - j) / (monster.finish - j) * 100 - 100;
					if (j.round() < 10) {
						tt += ' (' + j.round(1) + '% behind)';
					} else {
						tt += ' (' + j.addCommas() + '% behind)';
					}
				}
				cc = 'red';
			}
		}
		if (cc !== '') {
			vv = '<span style="color:'+cc+';">' + vv + '</span>';
		}
		if (tt !== '') {
			tt = 'title="'+tt+'"';
		}
		td(output, vv, tt);

		th(output, '<a class="golem-monster-delete" name="'+mid+'" title="Delete this Monster from the dashboard">[x]</a>');
		th(output, '<a class="golem-monster-override" name="'+mid+'" title="Override Lost Cause setting for this monster">'+(monster.override ? '[O]' : '[]')+'</a>');
		tr(list, output.join(''));
	}
	list.push('</tbody></table>');

	$('#golem-dashboard-Monster').html(list.join(''));

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

Monster.identify = function(root) {
	var i, o, x, base = root, type, types = this.types, tmp, tested, prefix,
		serpents = {
			'Amethyst Sea Serpent':	'serpent_amethyst',
			'Ancient Sea Serpent':	'serpent_ancient',
			'Emerald Sea Serpent':	'serpent_emerald',
			'Sapphire Sea Serpent':	'serpent_sapphire'
		},
		trace = {
			dragon_red:0,
			azriel:0,
			skaar:0,
			kraken:0,
			alpha_kraken:0,
			raid_easy:0,
			raid:0,
			'*':0
		};

	//log(LOG_DEBUG, 'identify: ' + dom_heritage(base));

	tested = 0;
	prefix = '';
	do {
		for (i in types) {
			o = types[i];
			if (o.dead
			  && $(prefix+'img[src*="'+o.dead+'"]', base).length
			  && (!o.title
			  || $(prefix+'div[style*="'+o.title+'"]').length
			  || $(prefix+'div[style*="'+o.image+'"]', base).length)
			) {
				//log(LOG_INFO, 'Found a dead ' + i);
				type = '!' + i;
				break;
			} else if (o.title
			  && $(prefix+'div[style*="'+o.title+'"]').length
			) {
				//log(LOG_INFO, 'Found a live ' + i + ' (via title)');
				type = i;
				break;
			} else if (o.image && !o.title
			  && ($(prefix+'img[src*="'+o.image+'"]', base).length
			  || $(prefix+'div[style*="'+o.image+'"]', base).length)
			) {
				//log(LOG_INFO, 'Found a live ' + i);
				type = i;
				break;
			} else if (o.image2 && !o.title
			  && ($(prefix+'img[src*="'+o.image2+'"]', base).length
			  || $(prefix+'div[style*="'+o.image2+'"]', base).length)
			) {
				//log(LOG_INFO, 'Found a live, second stage ' + i);
				type = i;
				break;
			} else if (trace[i]) {
				log(LOG_INFO, '# tried ' + i
				  + '\n - tested = ' + tested
				  + '\n - prefix = ' + prefix
				  //+ '\n - base = ' + dom_heritage(base)
				  + (o.dead ? '\n - dead = ' + o.dead : '')
				  + (o.title ? '\n - title = ' + o.title : '')
				  + (o.image ? '\n - image = ' + o.image : '')
				  + (o.image2 ? '\n - image2 = ' + o.image2 : '')
				);
			}
		}

		if (!type && !(tested & 0x1)
		  && (o = $('div[style*="monster_back."]')).length
		) {
			base = o;
			tested |= 0x1;
			continue;
		} else if (!type && !(tested & 0x2)
		  && (o = $('div[style*="nm_middle."]')).length
		) {
			base = o;
			tested |= 0x2;
			continue;
		} else if (!type && !(tested & 0x4)
		  && (o = $('div[style*="monster_layout_2."]')).length
		) {
			base = o;
			tested |= 0x4;
			continue;
		} else if (!type && !(tested & 0x8)) {
			base = root;
			prefix = '~ ';
			tested |= 0x8;
			continue;
		} else {
			break;
		}
	} while (true);

	if (!type) {
		tmp = $('#'+APPID_+'attack_log > div');
		for (i = 0; i < tmp.length; i++) {
			if ((x = ($(tmp[i]).text() || '').regex(/\bThe (\w+ Sea Serpent)\b/m))) {
				if ((type = serpents[x])) {
					//log(LOG_DEBUG, '# TYPE is SERPENT: ' + type);
					if (types[type].dead && $('img[src*="'+types[type].dead+'"]', root)) {
						//log(LOG_DEBUG, '# serpent is DEAD');
						type = '!' + type;
					}
					break;
				}
			}
		}
	}

	return type;
};

Monster.visit_link = function(raw, assist) {
	var str = raw.replace(/\s+/gm, ''), x, y, z, page, args = {};

	x = '';
	y = str;
	while ((z = y.match(/(^.*?)%([0-7][0-9a-fA-F])(.*)$/))) {
		x += z[1] + z[2].hex().chr();
		y = z[3];
	}
	str = x + y;

	if ((x = str.regex(/\b(battle_monster\.php)\b/))) {
		page = 'monster_battle_monster';
	} else if ((x = str.regex(/\b(festival_battle_monster\.php)\b/))) {
		page = 'festival_battle_monster';
	} else if ((x = str.regex(/\b(raid\.php)\b/))) {
		page = 'battle_raid';
	}

	if (isNumber(x = str.regex(/user=(\d+)\b/))) {
		args['casuser'] = x;
	}

	if (isNumber(x = str.regex(/\bmpool=(\d+)\b/))) {
		args['mpool'] = x;
	}

	if (isString(x = str.regex(/\bmid=(\w+)\b/))) {
		args['mid'] = x;
	}

	if (isNumber(x = str.regex(/\btower=(\d+)\b/))) {
		args['tower'] = x;
	}

	if (assist) {
		args['action'] = 'doObjective';
	}

	if (page) {
		log(LOG_INFO, '# visit: page ' + page
		  + ', args ' + JSON.shallow(args)
		);
		x = Page.get('temp.enabled');
		Page.set('temp.enabled', true);
		Page.to(page, args);
		Page.set('temp.enabled', x);
	}
};

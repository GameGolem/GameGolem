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
	general_fortify:'any',
	general_attack:'any',
	fortify: 30,
	//	quest_over: 90,
	min_to_attack: 0,
	//	dispel: 50,
	fortify_active:false,
	choice: 'Any',
	hide:false,
	stop: 'Never',
	own: true,
	armyratio: 'Any',
	levelratio: 'Any',
	force1: true,
	raid: 'Invade x5',
	assist: true,
	maxstamina: 5,
	minstamina: 5,
	maxenergy: 10,
	minenergy: 10,
//	monster_check:'Hourly',
	check_interval:3600000,
	avoid_behind:false,
	avoid_hours:5,
	behind_override:false,
	risk:false
};

Monster.runtime = {
	check:false, // got monster pages to visit and parse
	uid:null,
	type:null,
	fortify:false, // true if we can fortify / defend / etc
	attack:false, // true to attack
	stamina:5, // stamina to burn
	health:10 // minimum health to attack
};

Monster.display = [
	{
		id:'general',
		label:'Use Best General',
		checkbox:true
	},{
		title:'Fortification'
	},{
		id:'fortify_active',
		label:'Fortify Active',
		checkbox:true,
		help:'Must be checked to fortify.'
	},{
//		id:'fortify_group',
		require:'fortify_active',
		group:[
			{
				advanced:true,
				id:'general_fortify',
				require:{'general':false},
				label:'Fortify General',
				select:'bestgenerals'
			},{
				id:'fortify',
				label:'Fortify Below (AB)',
				text:30,
				help:'Fortify if ATT BONUS is under this value. Range of -50% to +50%.',
				after:'%'
			},{
				/*	id:'quest_over',
				require:'fortify_active',
				label:'Quest if Over',
				text:90,
				after:'%'
			},{*/
				id:'min_to_attack',
				label:'Attack Over (AB)',
				text:1,
				help:'Attack if ATT BONUS is over this value. Range of -50% to +50%.',
				after:'%'
			},{
				id:'minenergy',
				label:'Min Energy Cost',
				select:[10,20,40,100],
				help:'Select the minimum energy for a single energy action'
			},{
				id:'maxenergy',
				label:'Max Energy Cost',
				select:[10,20,40,100],
				help:'Select the maximum energy for a single energy action'
			}
		]
	},{
		title:'Who To Fight'
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
		id:'choice',
		label:'Attack',
		select:['Any', 'Strongest', 'Weakest', 'Shortest ETD', 'Longest ETD', 'Spread', 'Max Damage', 'Mim Damage','ETD Maintain']
	},{
		id:'stop',
		label:'Stop',
		select:['Never', 'Achievement', 'Loot'],
		help:'Select when to stop attacking a target.'
	},{
		advanced:true,
		id:'own',
		label:'Never stop on Your Monsters',
		checkbox:true,
		help:'Never stop attacking your own summoned monsters (Ignores Stop option).'
	},{
		advanced:true,
		id:'behind_override',
		label:'Rescue failing monsters',
		checkbox:true,
		help:'Attempts to rescue failing monsters even if damage is at or above Stop Optionby continuing to attack. Can be used in coordination with Lost-cause monsters setting to give up if monster is too far gone to be rescued.'
	},{
		advanced:true,
		id:'avoid_behind',
		label:'Avoid Lost-cause Monsters',
		checkbox:true,
		help:'Do not attack monsters that are a lost cause, i.e. the ETD is longer than the time remaining.'
	},{
		advanced:true,
		id:'avoid_hours',
		label:'Lost-cause if ETD is',
		require:'avoid_behind',
		after:'hours after timer',
		text:true,
		help:'# of Hours Monster must be behind before preventing attacks.'
	},{
		id:'minstamina',
		label:'Min Stamina Cost',
		select:[1,5,10,20,50],
		help:'Select the minimum stamina for a single attack'
	},{
		id:'maxstamina',
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
			900000:'Quarterly',
			1800000:'1/2 Hour',
			3600000:'Hourly',
			7200000:'2 Hours',
			21600000:'6 Hours',
			43200000:'12 Hours',
			86400000:'Daily',
			604800000:'Weekly'},
		help:'Sets how ofter to check Monster Stats.'
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
		atk_btn:'input[name="Attack Dragon"]',
		siege:false,
		attacks:[1,5]
	},
	gildamesh: {
		name:'Gildamesh, the Orc King',
		list:'orc_boss_list.jpg',
		image:'orc_boss.jpg',
		dead:'orc_boss_dead.jpg',
		achievement:15000,
		timer:259200, // 72 hours
		mpool:1,
		atk_btn:'input[name="Attack Dragon"]',
		siege:false,
		attacks:[1,5]
	},
	keira: {
		name:'Keira the Dread Knight',
		list:'boss_keira_list.jpg',
		image:'boss_keira.jpg',
		dead:'boss_keira_dead.jpg',
		achievement:30000,
		timer:172800, // 48 hours
		mpool:1,
		atk_btn:'input[name="Attack Dragon"]',
		siege:false,
		attacks:[1,5]
	},
	lotus: {
		name:'Lotus Ravenmoore',
		list:'boss_lotus_list.jpg',
		image:'boss_lotus.jpg',
		dead:'boss_lotus_big_dead.jpg',
		achievement:500000,
		timer:172800, // 48 hours
		mpool:1,
		atk_btn:'input[name="Attack Dragon"]',
		siege:false,
		attacks:[1,5]
	},
	mephistopheles: {
		name:'Mephistopheles',
		list:'boss_mephistopheles_list.jpg',
		image:'boss_mephistopheles_large.jpg',
		dead:'boss_mephistopheles_dead.jpg',
		achievement:100000,
		timer:172800, // 48 hours
		mpool:1,
		atk_btn:'input[name="Attack Dragon"]',
		siege:false,
		attacks:[1,5]
	},
	skaar: {
		name:'Skaar Deathrune',
		list:'death_list.jpg',
		image:'death_large.jpg',
		dead:'death_dead.jpg',
		achievement:1000000,
		timer:345000, // 95 hours, 50 minutes
		mpool:1,
		atk_btn:'input[name="Attack Dragon"][src*="attack"]',
		attacks:[1,5,10,20,50],
		def_btn:'input[name="Attack Dragon"][src*="dispel"]',
		defends:[10,20,40,100]
	},
	sylvanus: {
		name:'Sylvana the Sorceress Queen',
		list:'boss_sylvanus_list.jpg',
		image:'boss_sylvanus_large.jpg',
		dead:'boss_sylvanus_dead.jpg',
		achievement:50000,
		timer:172800, // 48 hours
		mpool:1,
		atk_btn:'input[name="Attack Dragon"]',
		attacks:[1,5]
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
		atk_btn:'input[name="Attack Dragon"]',
		siege:false,
		attacks:[1,5]
	},
	dragon_frost: {
		name:'Frost Dragon',
		list:'dragon_list_blue.jpg',
		image:'dragon_monster_blue.jpg',
		dead:'dead_dragon_image_blue.jpg',
		achievement:100000,
		timer:259200, // 72 hours
		mpool:2,
		atk_btn:'input[name="Attack Dragon"]',
		siege:false,
		attacks:[1,5]
	},
	dragon_gold: {
		name:'Gold Dragon',
		list:'dragon_list_yellow.jpg',
		image:'dragon_monster_gold.jpg',
		dead:'dead_dragon_image_gold.jpg',
		achievement:100000,
		timer:259200, // 72 hours
		mpool:2,
		atk_btn:'input[name="Attack Dragon"]',
		siege:false,
		attacks:[1,5]
	},
	dragon_red: {
		name:'Ancient Red Dragon',
		list:'dragon_list_red.jpg',
		image:'dragon_monster_red.jpg',
		dead:'dead_dragon_image_red.jpg',
		achievement:100000,
		timer:259200, // 72 hours
		mpool:2,
		atk_btn:'input[name="Attack Dragon"]',
		siege:false,
		attacks:[1,5]
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
		atk_btn:'input[name="Attack Dragon"]',
		siege:false,
		attacks:[1,5],
		def_btn:'input[name="Defend against Monster"]',
		defends:[10]
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
		atk_btn:'input[name="Attack Dragon"]',
		siege:false,
		attacks:[1,5],
		def_btn:'input[name="Defend against Monster"]',
		defends:[10]
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
		atk_btn:'input[name="Attack Dragon"]',
		siege:false,
		attacks:[1,5],
		def_btn:'input[name="Defend against Monster"]',
		defends:[10]
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
		atk_btn:'input[name="Attack Dragon"]',
		siege:false,
		attacks:[1,5],
		def_btn:'input[name="Defend against Monster"]',
		defends:[10]
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
		atk_btn:'input[name="Attack Dragon"]',
		attacks:[1,5,10,20,50]
	},
	legion: {
		name:'Battle of the Dark Legion',
		list:'castle_siege_list.jpg',
		image:'castle_siege_large.jpg',
		dead:'castle_siege_dead.jpg',
		achievement:1000,
		timer:604800, // 168 hours
		mpool:3,
		atk_btn:'input[name="Attack Dragon"][src*="attack"]',
		attacks:[1,5,10,20,50],
		def_btn:'input[name="Attack Dragon"][src*="fortify"]',
		defends:[10,20,40,100],
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
		atk_btn:'input[name="Attack Dragon"][src*="attack"]',
		attacks:[1,5,10,20,50],
		def_btn:'input[name="Attack Dragon"][src*="fortify"]',
		defends:[10,20,40,100]
	},
	ragnarok: {
		name:'Ragnarok, The Ice Elemental',
		list:'water_list.jpg',
		image:'water_large.jpg',
		dead:'water_dead.jpg',
		achievement:1000000,
		timer:604800, // 168 hours
		mpool:3,
		atk_btn:'input[name="Attack Dragon"][src*="attack"]',
		attacks:[1,5,10,20,50],
		def_btn:'input[name="Attack Dragon"][src*="dispel"]',
		defends:[10,20,40,100]
	},
	bahamut: {
		name:'Bahamut, the Volcanic Dragon',
		list:'nm_volcanic_list.jpg',
		image:'nm_volcanic_large.jpg',
		dead:'nm_volcanic_dead.jpg',
		achievement:1000000, // Guesswork
		timer:604800, // 168 hours
		mpool:3,
		atk_btn:'input[name="Attack Dragon"][src*="stab"],input[name="Attack Dragon"][src*="bolt"],input[name="Attack Dragon"][src*="smite"],input[name="Attack Dragon"][src*="bash"]',
		attacks:[5,10,20,50],
		def_btn:'input[name="Attack Dragon"][src*="cripple"],input[name="Attack Dragon"][src*="deflect"],input[name="Attack Dragon"][src*="heal"],input[name="Attack Dragon"][src*="strengthen"]',
		defends:[10,20,40,100]
	},
	alpha_bahamut: {
		name:'Alpha Bahamut, the Volcanic Dragon',
		list:'nm_volcanic_list_2.jpg',
		image:'nm_volcanic_large_2.jpg',
		dead:'nm_volcanic_dead_2.jpg', //Guesswork
		achievement:3000000, // Guesswork
		timer:604800, // 168 hours
		mpool:3,
		atk_btn:'input[name="Attack Dragon"][src*="stab"],input[name="Attack Dragon"][src*="bolt"],input[name="Attack Dragon"][src*="smite"],input[name="Attack Dragon"][src*="bash"]',
		attacks:[5,10,20,50],
		def_btn:'input[name="Attack Dragon"][src*="cripple"],input[name="Attack Dragon"][src*="deflect"],input[name="Attack Dragon"][src*="heal"],input[name="Attack Dragon"][src*="strengthen"]',
		defends:[10,20,40,100]
	},
	azriel: {
		name:'Azriel, the Angel of Wrath',
		list:'nm_azriel_list.jpg',
		image:'nm_azriel_large2.jpg',
		dead:'nm_azriel_dead.jpg', //Guesswork
		achievement:3000000, // ~0.5%, 2X = ~1%
		timer:604800, // 168 hours
		mpool:1,
		atk_btn:'input[name="Attack Dragon"][src*="stab"],input[name="Attack Dragon"][src*="bolt"],input[name="Attack Dragon"][src*="smite"],input[name="Attack Dragon"][src*="bash"]',
		attacks:[5,10,20,50],
		def_btn:'input[name="Attack Dragon"][src*="cripple"],input[name="Attack Dragon"][src*="deflect"],input[name="Attack Dragon"][src*="heal"],input[name="Attack Dragon"][src*="strengthen"]',
		defends:[10,20,40,100]
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
	var i, j;
	this._watch(Player);
	this._watch(Queue);
	this.runtime.count = 0;
	for (i in this.data) {
		for (j in this.data[i]) {
			if (this.data[i][j].state === 'engage') {
				this.runtime.count++;
			}
			if (typeof this.data[i][j].ignore === 'unknown'){
				this.data[i][j].ignore = false;
			}
			if (typeof this.data[i][j].dispel !== 'undefined') {
				this.data[i][j].defense = 100 - this.data[i][j].dispel;
				delete this.data[i][j].dispel;
			}
		}
	}
	$('#golem-dashboard-Monster tbody td a').live('click', function(event){
		var url = $(this).attr('href');
		Page.to((url.indexOf('raid') > 0 ? 'battle_raid' : 'monster_battle_monster'), url.substr(url.indexOf('?')));
		return false;
	});
	Resources.useType('Energy');
	Resources.useType('Stamina');
}

Monster.parse = function(change) {
	var i, j, k, new_id, id_list = [], battle_list = Battle.get('user'), uid, type, tmp, $health, $defense, $dispel, $secondary, dead = false, monster, timer, atk_dmg, dfd_amount;
	var data = Monster.data, types = Monster.types;	//Is there a better way?  "this." doesn't seem to work.
	if (Page.page === 'keep_monster_active' || Page.page === 'monster_battle_monster') { // In a monster or raid
		uid = $('img[linked][size="square"]').attr('uid');
		this.runtime.checkuid = this.runtime.checktype = null;
		debug('Parsing for Monster type');
		for (i in types) {
			if (types[i].dead && $('img[src$="'+types[i].dead+'"]').length  && !types[i].title) {
				//debug('Found a dead '+i);
				type = i;
				timer = types[i].timer;
				dead = true;
			} else if (types[i].dead && $('img[src$="'+types[i].dead+'"]').length && types[i].title && $('div[style*="'+types[i].title+'"]').length){
				//debug('Found a dead '+i);
				type = i;
				timer = types[i].timer;
				dead = true;
			} else if (types[i].image && ($('img[src$="'+types[i].image+'"]').length || $('div[style*="'+types[i].image+'"]').length)) {
				//debug('Parsing '+i);
				type = i;
				timer = types[i].timer;
			} else if (types[i].image2 && ($('img[src$="'+types[i].image2+'"]').length || $('div[style*="'+types[i].image2+'"]').length)) {
				//debug('Parsing second stage '+i);
				type = i;
				timer = types[i].timer2 || types[i].timer;
			}
		}
		if (!uid || !type) {
			debug('Unknown monster (probably dead)');
			return false;
		}
		data[uid] = data[uid] || {};
		data[uid][type] = data[uid][type] || {};
		monster = data[uid][type];
		monster.last = Date.now();
		if ($('input[src*="collect_reward_button.jpg"]').length) {
			monster.state = 'reward';
			return false;
		}
		if (dead && monster.state === 'assist') {
			monster.state = null;
		} else if (dead && monster.state === 'engage') {
			monster.state = 'reward';
		} else {
			if (!monster.state && $('span.result_body').text().match(/for your help in summoning|You have already assisted on this objective|You don't have enough stamina assist in summoning/i)) {
				if ($('span.result_body').text().match(/for your help in summoning/i)) {
					monster.assist = Date.now();
				}
				monster.state = 'assist';
			}
			if (this.runtime.attacked && $('span[class="positive"]').length && (typeof $('span[class="positive"]').prevAll('span').text().regex(/([0-9]+)/) === 'number')){
				//debug('Stamina after to attack' + Player.get('stamina'));
				this.runtime.post_stamina = Player.get('stamina');
				//debug('Battle stamina was ' + monster.battle_stamina);
				if (monster.battle_stamina){
					monster.battle_stamina += this.runtime.pre_stamina - this.runtime.post_stamina;
				} else{
					monster.battle_stamina = this.runtime.pre_stamina - this.runtime.post_stamina;
				}
				//debug('Setting battle stamina to ' + monster.battle_stamina);
				atk_dmg = $('span[class="positive"]').prevAll('span').text().regex(/([0-9]+)/);
				//debug('Damage done = ' + atk_dmg);
				//debug('Pre-Stamina = ' + this.runtime.pre_stamina + ' & Post-Stamina = ' + this.runtime.post_stamina);
				if (atk_dmg){
					if (monster.dmg_per_stamina){
						monster.dmg_per_stamina = Math.ceil((monster.dmg_per_stamina + (atk_dmg / (this.runtime.pre_stamina - this.runtime.post_stamina))) / 2);
					} else {
							monster.dmg_per_stamina = Math.ceil(atk_dmg / monster.battle_stamina);
					}
					//debug('Damage per stamina = ' + monster.dmg_per_stamina);
					if (monster.dmg_avg){
						monster.dmg_avg = Math.ceil((monster.dmg_avg + atk_dmg) / 2);
					} else{
						monster.dmg_avg = atk_dmg;
					}
					//debug('Avg Damage = ' + monster.dmg_avg);
				}
				this.runtime.pre_stamina = this.runtime.post_stamina = 0;
				this.runtime.attacked = false;
			}
			if (this.runtime.defended && $('span[class="positive"]').length && (typeof $('span[class="positive"]').prevAll('span').text().regex(/([0-9]+)/) === 'number')){
				this.runtime.post_energy = Player.get('energy');
				//debug('Pre-energy = ' + this.runtime.pre_energy + ' & Post-energy = ' + this.runtime.post_energy);
				dfd_amount = $('span[class="positive"]').prevAll('span').text().regex(/([0-9]+)/);
				//debug('Defend Amount = ' + dfd_amount);
				if (monster.battle_energy){
					monster.battle_energy += this.runtime.pre_energy - this.runtime.post_energy;
				} else{
					monster.battle_energy = this.runtime.pre_energy - this.runtime.post_energy;
				}
				if (dfd_amount){
					if (monster.dfd_per_energy){
						monster.dfd_per_energy = Math.ceil((monster.dfd_per_energy + (dfd_amount / (this.runtime.pre_energy - this.runtime.post_energy))) / 2);
					} else {
						monster.dfd_per_energy = Math.ceil(dfd_amount / monster.battle_energy);
					}
					//debug('Defend Amount per energy = ' + monster.dfd_per_energy);
					if (monster.dfd_avg){
						monster.dfd_avg = Math.ceil((monster.dfd_avg + dfd_amount) / 2);
					} else{
						monster.dfd_avg = dfd_amount;
					}
					//debug('Avg Defend = ' + monster.dfd_avg);
				}
				this.runtime.pre_energy = this.runtime.post_energy = 0;
				this.runtime.defended = false;
			}
			if ($('img[src$="battle_victory.gif"],img[src$="battle_defeat.gif"],span["result_body"] a:contains("Attack Again")').length)	{ //	img[src$="icon_weapon.gif"],
				monster.battle_count = (monster.battle_count || 0) + 1;
				//debug('Setting battle count to ' + monster.battle_count);
			}
			if ($('img[src$="battle_victory"]').length){
				History.add('raid+win',1);
			}
			if ($('img[src$="battle_defeat"]').length){
				History.add('raid+loss',-1);
			}
			if (!monster.name) {
				tmp = $('img[linked][size="square"]').parent().parent().next().text().trim().replace(/[\s\n\r]{2,}/g, ' ');
				//monster.name = tmp.substr(0, tmp.length - Monster.types[type].name.length - 3);
				monster.name = tmp.regex(/(.+)'s /i);
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
					//debug("We aren't in "+Monster['class_name'][monster.mclass]+" phase. Skip fortify.");
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
			monster.damage_total = 0;
			monster.damage_siege = 0;
			monster.damage_players = 0;
			monster.fortify = 0;
			monster.damage = {};
			if ($('input[name*="help with"]').length) {
				//debug('Current Siege Phase is: '+ this.data[uid][type].phase);
				monster.phase = $('input[name*="help with"]').attr('title').regex(/ (.*)/i);
				debug('Assisted on '+monster.phase+'.');
			}
			$('img[src*="siege_small"]').each(function(i,el){
				var siege = $(el).parent().next().next().next().children().eq(0).text();
				var tmp = $(el).parent().next().next().next().children().eq(1).text().replace(/[^0-9]/g,'');
				var dmg = tmp.regex(/([0-9]+)/);
				//debug('Monster Siege',siege + ' did ' + addCommas(dmg) + ' amount of damage.');
				monster.damage[siege]  = [dmg];
				monster.damage_siege += dmg;
			});
			$('td.dragonContainer table table a[href^="http://apps.facebook.com/castle_age/keep.php?user="]').each(function(i,el){
				var user = $(el).attr('href').regex(/user=([0-9]+)/i);
				var tmp = null;
				if (types[type].raid){
					tmp = $(el).parent().next().text().replace(/[^0-9\/]/g,'');
				} else {
					tmp = $(el).parent().parent().next().text().replace(/[^0-9\/]/g,'');
				}
				var dmg = tmp.regex(/([0-9]+)/), fort = tmp.regex(/\/([0-9]+)/);
				monster.damage[user]  = (fort ? [dmg, fort] : [dmg]);
				if (user === userID){
					monster.damage_user = dmg;
					if (monster.dmg_per_stamina && monster.battle_stamina){
						while (monster.dmg_per_stamina * monster.battle_stamina < monster.damage_user * 0.99){
							//debug('Battle stamina was ' + monster.battle_stamina);
							monster.battle_stamina++;
							//debug('Setting battle stamina to ' + monster.battle_stamina);
						}
						while (monster.dmg_per_stamina * monster.battle_stamina >= monster.damage_user * 1.01){
							//debug('Battle stamina was ' + monster.battle_stamina);
							monster.battle_stamina--;
							//debug('Setting battle stamina to ' + monster.battle_stamina);
						}
					}
				}
				monster.damage_players += dmg;
				if (fort) {
					monster.fortify += fort;
				}
			});
			if (types[type].orcs) {
				monster.damage_total = Math.ceil(monster.damage_siege / 1000) + monster.damage_players
			} else {
				monster.damage_total = monster.damage_siege + monster.damage_players;
			}
			monster.dps = monster.damage_players / (timer - monster.timer);
			if (types[type].raid) {
				monster.total = monster.damage_total + $('div[style*="monster_health_back.jpg"] div:nth-child(2)').text().regex(/([0-9]+)/);
			} else {
				monster.total = Math.ceil((1 + 100 * monster.damage_total) / (monster.health == 100 ? 0.1 : (100 - monster.health)));
			}
			monster.eta = Date.now() + (Math.floor((monster.total - monster.damage_total) / monster.dps) * 1000);
		}
	} else if (Page.page === 'monster_monster_list' || Page.page === 'battle_raid') { // Check monster / raid list
		if ($('div[style*="no_monster_back.jpg"]').attr('style')){
			debug('Found a timed out monster.');
			if (typeof this.runtime.checkuid !== 'undefined' && typeof this.runtime.checktype !== 'undefined' && this.runtime.checkuid && this.runtime.checktype){
				debug('Deleting ' + this.data[this.runtime.checkuid][this.runtime.checktype].name + "'s " + this.runtime.checktype);
				delete this.data[this.runtime.checkuid][this.runtime.checktype];
				if (!length(this.data[this.runtime.checkuid])) {
					delete this.data[this.runtime.checkuid];
				}
			} else {
				debug('Unknown monster (timed out)');
			}
			this.runtime.checkuid = this.runtime.checktype = null;
			return false;
		}
		this.runtime.checkuid = this.runtime.checktype = null;

		if (!$('#app'+APPID+'_app_body div.imgButton').length) {
			return false;
		}
		if (Page.page === 'battle_raid') {
			raid = true;
		}
		for (uid in data) {
			for (type in data[uid]) {
				if (
						((Page.page === 'battle_raid'
								&& this.types[type].raid)
							|| (Page.page === 'monster_monster_list'
								&& !this.types[type].raid))
						&& (data[uid][type].state === 'complete'
							|| data[uid][type].state === 'reward'
							|| (data[uid][type].state === 'assist'
								&& data[uid][type].finish < Date.now()))
					) {
					data[uid][type].state = null;
				}
			}
		}
		$('#app'+APPID+'_app_body div.imgButton').each(function(i,el){
			var i, uid = $('a', el).attr('href').regex(/user=([0-9]+)/i), tmp = $(el).parent().parent().children().eq(1).html().regex(/graphics\/([^.]*\....)/i), type = 'unknown';
			for (i in types) {
				if (tmp == types[i].list) {
					type = i;
					break;
				}
			}
			if (!uid || type === 'unknown') {
				return;
			}
			data[uid] = data[uid] || {};
			data[uid][type] = data[uid][type] || {};
			if (uid === userID) {
				data[uid][type].name = 'You';
			} else {
				tmp = $(el).parent().parent().children().eq(2).text().trim();
				data[uid][type].name = tmp.regex(/(.+)'s /i);
			}
			switch($('img', el).attr('src').regex(/dragon_list_btn_([0-9])/)) {
				case 2:
					data[uid][type].state = 'reward';
					break;
				case 3:
					data[uid][type].state = 'engage';
					break;
				case 4:
					// if (this.types[type].raid && data[uid][type].health) {
					//	data[uid][type].state = 'engage'; // Fix for page cache issues in 2-part raids
					// } else {
					data[uid][type].state = 'complete';
					// }
					break;
				default:
					data[uid][type].state = 'unknown';
					break; // Should probably delete, but keep it on the list...
			}
		});
	}
	return false;
};

Monster.update = function(what,worker) {
	if (what === 'runtime') {
		return;
	}
	var i, j, list = [], uid = this.runtime.uid, type = this.runtime.type, best = null, req_stamina, req_health, req_energy, label = null, amount = 0, fullname;
	if (worker === Player) {
		this.runtime.count = 0;
		for (i in this.data) { // Flush unknown monsters
			for (j in this.data[i]) {
				if (!this.data[i][j].state || this.data[i][j].state === null) {
					log('Found Invalid Monster State=(' + this.data[i][j].state + ')');
					delete this.data[i][j];
				} else if (this.data[i][j].state === 'engage') {
					this.runtime.count++;
				}
			}
			if (!length(this.data[i])) { // Delete uid's without an active monster
				log('Found Invalid Monster ID=(' + this.data[i] + ')');
				delete this.data[i];
			}
		}
		if (!uid || !type || !this.data[uid] || !this.data[uid][type] || (this.data[uid][type].state !== 'engage' && this.data[uid][type].state !== 'assist')) { // If we've not got a valid target...
			this.runtime.uid = uid = null;
			this.runtime.type = type = null;
		}
		// Testing this out
		uid = null;
		type = null;
		
		//this.runtime.check = false;
		for (i in this.data) {
			// Look for a new target...
			for (j in this.data[i]) {
				if (((!this.data[i][j].health && this.data[i][j].state === 'engage') || typeof this.data[i][j].last === 'undefined' || (this.data[i][j].last < (Date.now() - this.option.check_interval))) && (typeof this.data[i][j].ignore === 'undefined' || !this.data[i][j].ignore && this.data[i][j].state !== 'complete') && !this.runtime.check) {
					// Check monster progress every hour
					this.runtime.check = true; // Do we need to parse info from a blank monster?
					break;
				}
				req_stamina = (this.types[j].raid && this.option.raid.search('x5') == -1) ? 1 : (this.types[j].raid) ? 5 : (this.option.minstamina < Math.min.apply( Math, this.types[j].attacks) || this.option.maxstamina < Math.min.apply( Math, this.types[j].attacks)) ? Math.min.apply( Math, this.types[j].attacks): (this.option.minstamina > Math.max.apply( Math, this.types[j].attacks)) ? Math.max.apply( Math, this.types[j].attacks) : (this.option.minstamina > this.option.maxstamina) ? this.option.maxstamina : this.option.minstamina;
				req_energy = this.types[j].def_btn ? this.option.minenergy : null;
				req_health = this.types[j].raid ? (this.option.risk ? 13 : 10) : 10; // Don't want to die when attacking a raid
				
				if ((typeof this.data[i][j].ignore === 'undefined' || !this.data[i][j].ignore)
						&& this.data[i][j].state === 'engage'
						&& this.data[i][j].finish > Date.now() 
						&& (!this.option.hide
							|| Queue.burn.energy >= req_energy
							|| (Player.get('health') >= req_health
								&& Queue.burn.stamina >= req_stamina))
						&& (typeof this.data[i][j].attackbonus === 'undefined' 
							|| this.data[i][j].attackbonus >= this.option.min_to_attack
							|| (this.data[i][j].attackbonus <= this.option.fortify 
								&& this.option.fortify_active))) {
				
					if (!this.data[i][j].battle_count){
						this.data[i][j].battle_count = 1;
					}
					if (i === userID && this.option.own){
						list.push([i, j, this.data[i][j].health, this.data[i][j].eta, this.data[i][j].battle_count,((sum(this.data[i][j].damage[userID]) || 0) / this.data[i][j].damage_total * 100).round(4),this.data[i][j].finish,(this.data[i][j].eta - this.data[i][j].finish)/3600000]);
						break;
					} else if (this.option.behind_override && (this.data[i][j].eta >= this.data[i][j].finish - this.option.check_interval) && sum(this.data[i][j].damage[userID]) > this.types[j].achievement){
						//debug('Adding behind monster. ' + this.data[i][j].name + '\'s ' + this.types[j].name);
						list.push([i, j, this.data[i][j].health, this.data[i][j].eta, this.data[i][j].battle_count,((sum(this.data[i][j].damage[userID]) || 0) / this.data[i][j].damage_total * 100).round(4),this.data[i][j].finish,(this.data[i][j].eta - this.data[i][j].finish)/3600000]);
						break;
					} else {
						switch(this.option.stop) {
							default:
							case 'Never':
								list.push([i, j, this.data[i][j].health, this.data[i][j].eta, this.data[i][j].battle_count,((sum(this.data[i][j].damage[userID]) || 0) / this.data[i][j].damage_total * 100).round(4),this.data[i][j].finish,(this.data[i][j].eta - this.data[i][j].finish)/3600000]);
								break;
							case 'Achievement':
								if (isNumber(this.types[j].achievement) && (typeof this.data[i][j].damage[userID] === 'undefined' || sum(this.data[i][j].damage[userID]) < this.types[j].achievement)) {
									list.push([i, j, this.data[i][j].health, this.data[i][j].eta, this.data[i][j].battle_count,((sum(this.data[i][j].damage[userID]) || 0) / this.data[i][j].damage_total * 100).round(4),this.data[i][j].finish,(this.data[i][j].eta - this.data[i][j].finish)/3600000]);
								}
								break;
							case 'Loot':
								if (isNumber(this.types[j].achievement) && (typeof this.data[i][j].damage[userID] === 'undefined' || sum(this.data[i][j].damage[userID]) < ((i == userID && j === 'keira') ? 200000 : 2 * this.types[j].achievement))) {
									// Special case for your own Keira to get her soul.
									list.push([i, j, this.data[i][j].health, this.data[i][j].eta, this.data[i][j].battle_count,((sum(this.data[i][j].damage[userID]) || 0) / this.data[i][j].damage_total * 100).round(4),this.data[i][j].finish,(this.data[i][j].eta - this.data[i][j].finish)/3600000]);
								}
								break;
						}
					}
				}
			}
		}
		if (list.length){
			list.sort( function(a,b){
				switch(Monster.option.choice) {
					case 'Any':
						return (Math.random()-0.5);
						break;
					case 'Strongest':
						return b[2] - a[2];
						break;
					case 'Weakest':
						return a[2] - b[2];
						break;
					case 'Shortest ETD':
						return a[3] - b[3];
						break;
					case 'Longest ETD':
						return b[3] - a[3];
						break;
					case 'Spread':
						return a[4] - b[4];
						break;
					case 'Max Damage':
						return b[5] - a[5];
						break;
					case 'Min Damage':
						return a[5] - b[5];
						break;
					case 'ETD Maintain':
						if (a[7] < b[7]){
							return 1;
						} else if (a[7] > b[7]){
							return -1;
						} else {
							return 0;
						}
						break;
				}
			});	
			if (!this.option.avoid_behind){
				best = list[0];
			} else {
				for (i=0; i <= list.length - 1; i++){
					if (((list[i][3]/3600000) - (list[i][6]/3600000)).round(0) <= this.option.avoid_hours ){
						best = list[i];
						break;
					}
				}
			}
		}
		delete list;
		if (best) {
			uid  = best[0];
			type = best[1];
		}

		this.runtime.uid = uid;
		this.runtime.type = type;
	} // END IF worker===Player
	if (uid && type) {		
		this.runtime.stamina = 
			(this.types[type].raid && this.option.raid.search('x5') == -1)
			? 1
			: (this.types[type].raid)
				? 5
				: (this.option.minstamina < Math.min.apply(Math, this.types[type].attacks) || this.option.maxstamina < Math.min.apply(Math, this.types[type].attacks))
					? Math.min.apply(Math, this.types[type].attacks)
					: (this.option.minstamina > Math.max.apply(Math, this.types[type].attacks))
						? Math.max.apply(Math, this.types[type].attacks)
						: (this.option.minstamina > this.option.maxstamina)
							? this.option.maxstamina
							: this.option.minstamina;
		this.runtime.energy =
			(!this.types[type].defends)
			? 10
			: (this.option.minenergy < Math.min.apply(Math, this.types[type].defends) || this.option.maxenergy < Math.min.apply(Math, this.types[type].defends))
				? Math.min.apply(Math, this.types[type].defends)
				: (this.option.minenergy > Math.max.apply(Math, this.types[type].defends))
					? Math.max.apply(Math, this.types[type].defends)
					: (this.option.minenergy > this.option.maxenergy)
						? this.option.maxenergy
						: this.option.minenergy;
		this.runtime.health = this.types[type].raid ? 13 : 10; // Don't want to die when attacking a raid		
		if(this.option.fortify_active && (typeof this.data[uid][type].mclass === 'undefined' || this.data[uid][type].mclass < 2) && ((typeof this.data[uid][type].attackbonus !== 'undefined' && this.data[uid][type].attackbonus < this.option.fortify && this.data[uid][type].defense < 100))) {
			this.runtime.fortify = true;
		} else if (this.option.fortify_active && typeof this.data[uid][type].mclass !== 'undefined' && this.data[uid][type].mclass > 1 && typeof this.data[uid][type].secondary !== 'undefined' && this.data[uid][type].secondary < 100){
			this.runtime.fortify = true;
		} else {
			this.runtime.fortify = false;
		}
		if (Queue.burn.energy < this.runtime.energy) {
			this.runtime.fortify = false;
		}
		this.runtime.attack = true;
		fullname = (uid === userID ? 'your ': (this.data[uid][type].name + '\'s '))
				+ this.types[type].name;
		if ((Player.get('health') > this.runtime.health
					&& Queue.burn.stamina >= this.runtime.stamina)
				|| (this.runtime.fortify
					&& Queue.burn.energy >= this.runtime.energy )){
			Dashboard.status(this, (this.runtime.fortify ? 'Fortify ' : 'Attack ')
					+ fullname + ' (' + makeImage('stamina') + this.runtime.stamina + '+, ' + makeImage('energy') + this.runtime.energy + '+)');
		} else if (this.runtime.fortify 
				&& Queue.burn.energy < this.runtime.energy){
			label = 'energy';
			amount = (LevelUp.runtime.running && LevelUp.option.enabled) 
					? (this.runtime.energy - Queue.burn.energy)
					: Math.max((this.runtime.energy - Queue.burn.energy)
						,(this.runtime.energy + Queue.option.energy - Player.get('energy'))
						,(Queue.option.start_energy - Player.get('energy')));
		} else if (Queue.burn.stamina < this.runtime.stamina){
			label = 'stamina';
			amount = (LevelUp.runtime.running && LevelUp.option.enabled) 
					? (this.runtime.stamina - Queue.burn.stamina)
					: Math.max((this.runtime.stamina - Queue.burn.stamina)
						,(this.runtime.stamina + Queue.option.stamina - Player.get('stamina'))
						,(Queue.option.start_stamina - Player.get('stamina')));
		} else if (Player.get('health') < this.runtime.health){
			label = 'health';
			amount = this.runtime.health - Player.get('health');
		}
		if (label) {
			Dashboard.status(this,'Waiting for ' + amount + makeImage(label) + ' to '
					+ (this.runtime.fortify ? 'fortify ' : 'attack ') + fullname
					+ ' (' + makeImage('stamina') + this.runtime.stamina + '+, ' + makeImage('energy') + this.runtime.energy + '+)');
		}
	} else {
		this.runtime.attack = false;
		this.runtime.fortify = false;
		Dashboard.status(this, 'Nothing to do.');
	}
};

Monster.work = function(state) {
	var i, j, target_info = [], battle_list, list = [], uid = this.runtime.uid, type = this.runtime.type, btn = null, b, max;

	if (!this.runtime.check && ((!this.runtime.fortify || Queue.burn.energy < this.runtime.energy || Player.get('health') < 10) && (!this.runtime.attack || Queue.burn.stamina < this.runtime.stamina || Player.get('health') < this.runtime.health))) {
		return QUEUE_FINISH;
	}
	if (!state) {
		return QUEUE_CONTINUE;
	}
	if (this.runtime.check) { // Parse pages of monsters we've not got the info for
		for (i in this.data) {
			for (j in this.data[i]) {
				if (((!this.data[i][j].health && this.data[i][j].state === 'engage') || typeof this.data[i][j].last === 'undefined' || this.data[i][j].last < Date.now() - this.option.check_interval) && (typeof this.data[i][j].ignore === 'undefined' || !this.data[i][j].ignore)) {
					debug( 'Reviewing ' + this.data[i][j].name + '\'s ' + this.types[j].name)
					this.runtime.checkuid = i;
					this.runtime.checktype = j;
					Page.to(this.types[j].raid ? 'battle_raid' : 'monster_battle_monster', '?user=' + i 
							+ ((this.data[i][j].phase
									&& this.option.assist)
								? '&action=doObjective'
								: '')
							+ (this.types[j].mpool 
								? '&mpool=' + this.types[j].mpool
								: ''));
					return QUEUE_CONTINUE;
				}
			}
		}
		this.runtime.check = false;
		debug( 'Finished Monster / Raid review')
		return QUEUE_RELEASE;
	}
	if (this.types[type].raid) { // Raid has different buttons and generals
		if (!Generals.to((this.option.raid.search('Invade') == -1) ? 'raid-duel' : 'raid-invade')) {
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
		if (this.data[uid][type].button_fail <= 10 || !this.data[uid][type].button_fail){
			//Primary method of finding button.
			j = (this.runtime.fortify && Queue.burn.energy >= this.runtime.energy) ? 'fortify' : 'attack';
			if (!Generals.to(this.option.general ? j : this.option['general_'+j])) {
				return QUEUE_CONTINUE;
			}
			debug('Try to ' + j + ' [UID=' + uid + ']' + this.data[uid][type].name + '\'s ' + this.types[type].name);
			switch(j){
				case 'fortify':
					if (!btn && this.option.maxenergy < this.types[type].defends[0]){
						btn = $(this.types[type].def_btn).eq(0);
					} else {
						b = $(this.types[type].def_btn).length - 1;
						for (i=b; i >= 0; i--){									
							//debug('Burn Energy is ' + Queue.burn.energy);
							if (this.types[type].defends[i] <= this.option.maxenergy && Queue.burn.energy >= this.types[type].defends[i] ){
								//debug('Button cost is ' + this.types[type].defends[i]);
								btn = $(this.types[type].def_btn).eq(i);
								break;
							}
						}
					}
					break;
				case 'attack':
					if (!btn && this.option.maxstamina < Math.min.apply( Math, this.types[type].attacks)){
						btn = $(this.types[type].atk_btn).eq(0).name;
					} else {
						b = $(this.types[type].atk_btn).length - 1;
						//debug('B = ' + b);
						for (i=b; i >= 0; i--){
							//debug('Burn Stamina is ' + Queue.burn.stamina);
							if (this.types[type].attacks[i] <= this.option.maxstamina && Queue.burn.stamina >= this.types[type].attacks[i]){
								//debug('Button cost is ' + this.types[type].attacks[i]);
								btn = $(this.types[type].atk_btn).eq(i);
								break;
							}
						}
					}
					break;
				default:
					break;
			}
		}
		if (!btn || !btn.length){
			this.data[uid][type].button_fail = this.data[uid][type].button_fail + 1;
		}
		if (this.data[uid][type].button_fail > 10){
			log('Ignoring Monster ' + this.data[uid][type].name + '\'s ' + this.types[type].name + this.data[uid][type] + ': Unable to locate ' + j + ' button ' + this.data[uid][type].button_fail + ' times!');
			this.data[uid][type].ignore = true;
			this.data[uid][type].button_fail = 0
		}
	}
	if (!btn || !btn.length || (Page.page !== 'keep_monster_active' && Page.page !== 'monster_battle_monster') || ($('div[style*="dragon_title_owner"] img[linked]').attr('uid') != uid && $('div[style*="nm_top"] img[linked]').attr('uid') != uid)) {
		//debug('Reloading page. Button = ' + btn.attr('name'));
		//debug('Reloading page. Page.page = '+ Page.page);
		//debug('Reloading page. Monster Owner UID is ' + $('div[style*="dragon_title_owner"] img[linked]').attr('uid') + ' Expecting UID : ' + uid);
		Page.to(this.types[type].raid ? 'battle_raid' : 'monster_battle_monster', '?user=' + uid 
				+ ((this.data[uid][type].phase
						&& this.option.assist)
					? '&action=doObjective'
					: '')
				+ (this.types[type].mpool 
					? '&mpool=' + this.types[type].mpool
					: ''));
		return QUEUE_CONTINUE; // Reload if we can't find the button or we're on the wrong page
	}
	if (this.types[type].raid) {
		battle_list = Battle.get('user')
		if (this.option.force1) { // Grab a list of valid targets from the Battle Worker to substitute into the Raid buttons for +1 raid attacks.
			for (i in battle_list) {
				list.push(i);
			}
			$('input[name*="target_id"]').val((list[Math.floor(Math.random() * (list.length))] || 0)); // Changing the ID for the button we're gonna push.
		}
		target_info = $('div[id*="raid_atk_lst0"] div div').text().regex(/Lvl\s*([0-9]+).*Army: ([0-9]+)/);
		if ((this.option.armyratio !== 'Any' && ((target_info[1]/Player.get('army')) > this.option.armyratio) && this.option.raid.indexOf('Invade') >= 0) || (this.option.levelratio !== 'Any' && ((target_info[0]/Player.get('level')) > this.option.levelratio) && this.option.raid.indexOf('Invade') == -1)){ // Check our target (first player in Raid list) against our criteria - always get this target even with +1
			log('No valid Raid target!');
			Page.to('battle_raid', ''); // Force a page reload to change the targets
			return QUEUE_CONTINUE;
		}
	}
	this.runtime.uid = this.runtime.type = null; // Force us to choose a new target...
	switch (j){
		case 'fortify':
			//debug('Energy prior to defense ' + Player.get('energy'));
			this.runtime.pre_energy = Player.get('energy');
			Page.click(btn);
			this.runtime.defended = true;
			this.data[uid][type].button_fail = 0;
			return QUEUE_RELEASE;
			break;
		case 'attack':
			//debug('Stamina prior to attack ' + Player.get('stamina'));
			this.runtime.pre_stamina = Player.get('stamina');
			Page.click(btn);
			this.runtime.attacked = true;
			this.data[uid][type].button_fail = 0;
			return QUEUE_RELEASE;
			break;
		default:
			Page.click(btn);
			return QUEUE_RELEASE;
	}
};

Monster.order = null;
Monster.dashboard = function(sort, rev) {
	var i, j, o, monster, url, list = [], output = [], sorttype = [null, 'name', 'health', 'defense', null, 'timer', 'eta'], state = {
		engage:0,
		assist:1,
		reward:2,
		complete:3
	}, blank;
	if (typeof sort === 'undefined') {
		this.order = [];
		for (i in this.data) {
			for (j in this.data[i]) {
				this.order.push([i, j]);
			}
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
		if (state[Monster.data[a[0]][a[1]].state] > state[Monster.data[b[0]][b[1]].state]) {
			return 1;
		}
		if (state[Monster.data[a[0]][a[1]].state] < state[Monster.data[b[0]][b[1]].state]) {
			return -1;
		}
		if (typeof sorttype[sort] === 'string') {
			aa = Monster.data[a[0]][a[1]][sorttype[sort]];
			bb = Monster.data[b[0]][b[1]][sorttype[sort]];
		} else if (sort == 4) { // damage
			//			aa = Monster.data[a[0]][a[1]].damage ? Monster.data[a[0]][a[1]].damage[userID] : 0;
			//			bb = Monster.data[b[0]][b[1]].damage ? Monster.data[b[0]][b[1]].damage[userID] : 0;
			if (typeof Monster.data[a[0]][a[1]].damage !== 'undefined' && typeof Monster.data[b[0]][b[1]].total !== 'undefined' ){
				aa = sum((Monster.data[a[0]][a[1]].damage[userID] / Monster.data[a[0]][a[1]].total));
			}
			if (typeof Monster.data[b[0]][b[1]].damage !== 'undefined' && typeof Monster.data[b[0]][b[1]].total !== 'undefined' ){
				bb = sum((Monster.data[b[0]][b[1]].damage[userID] / Monster.data[b[0]][b[1]].total));
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
		i = this.order[o][0];
		j = this.order[o][1];
		if (!this.types[j]) {
			continue;
		}
		output = [];
		monster = this.data[i][j];
		blank = !((monster.state === 'engage' || monster.state === 'assist') && monster.total);
		// http://apps.facebook.com/castle_age/battle_monster.php?user=00000&mpool=3
		// http://apps.facebook.com/castle_age/battle_monster.php?twt2=earth_1&user=00000&action=doObjective&mpool=3&lka=00000&ref=nf
		// http://apps.facebook.com/castle_age/raid.php?user=00000
		// http://apps.facebook.com/castle_age/raid.php?twt2=deathrune_adv&user=00000&action=doObjective&lka=00000&ref=nf
		if (Monster.option.assist_link && (monster.state === 'engage' || monster.state === 'assist')) {
			url = '?user=' + i + '&action=doObjective' + (Monster.types[j].mpool ? '&mpool=' + Monster.types[j].mpool : '') + '&lka=' + i + '&ref=nf';
		} else {
			url = '?user=' + i + (Monster.types[j].mpool ? '&mpool=' + Monster.types[j].mpool : '');
		}
		td(output, '<a href="http://apps.facebook.com/castle_age/' + (Monster.types[j].raid ? 'raid.php' : 'battle_monster.php') + url + '"><img src="' + imagepath + Monster.types[j].list + '" style="width:72px;height:20px; position: relative; left: -8px; opacity:.7;" alt="' + j + '"><strong class="overlay">' + monster.state + '</strong></a>', 'title="' + Monster.types[j].name + ' | Achievement: ' + addCommas(Monster.types[j].achievement) + ' | Loot: ' + addCommas(Monster.types[j].achievement * 2) + '"');
		var image_url = imagepath + Monster.types[j].list;
		//debug(image_url);
		th(output, '<a class="golem-monster-ignore" name="'+i+'+'+j+'" title="Toggle Active/Inactive"'+(Monster.data[i][j].ignore ? ' style="text-decoration: line-through;"' : '')+'>'+Monster.data[i][j].name+'</a>');
		td(output, blank ? '' : monster.health === 100 ? '100%' : addCommas(monster.total - monster.damage_total) + ' (' + monster.health.round(1) + '%)');
		td(output, blank ? '' : isNumber(monster.attackbonus) ? (monster.attackbonus.round(1))+'%' : '', (isNumber(monster.strength) ? 'title="Max: '+((monster.strength-50).round(1))+'%"' : ''));
		td(output, blank ? '' : monster.state !== 'engage' ? '' : (typeof monster.damage[userID] === 'undefined') ? '' : addCommas(monster.damage[userID][0] || 0) + ' (' + ((monster.damage[userID][0] || 0) / monster.total * 100).round(2) + '%)', blank ? '' : 'title="In ' + (monster.battle_count || 'an unknown number of') + ' attacks"');
		td(output, blank ? '' : monster.timer ? '<span class="golem-timer">' + makeTimer((monster.finish - Date.now()) / 1000) + '</span>' : '?');
		td(output, blank ? '' : '<span class="golem-timer">' + (monster.health === 100 ? makeTimer((monster.finish - Date.now()) / 1000) : makeTimer((monster.eta - Date.now()) / 1000)) + '</span>');
		th(output, '<a class="golem-monster-delete" name="'+i+'+'+j+'" title="Delete this Monster from the dashboard">[x]</a>');
		tr(list, output.join(''));
	}
	list.push('</tbody></table>');
	$('#golem-dashboard-Monster').html(list.join(''));
	$('a.golem-monster-delete').live('click', function(event){
		var x = $(this).attr('name').split('+');
		Monster._unflush();
		delete Monster.data[x[0]][x[1]];
		if (!length(Monster.data[x[0]])) {
			delete Monster.data[x[0]];
		}
		Monster.dashboard();
		return false;
	});
	$('a.golem-monster-ignore').live('click', function(event){
		var x = $(this).attr('name').split('+');
		Monster._unflush();
		Monster.data[x[0]][x[1]].ignore = !Monster.data[x[0]][x[1]].ignore;
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


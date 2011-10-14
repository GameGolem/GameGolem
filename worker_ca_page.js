/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Workers, Page,
	APP, APPID, APPID_, PREFIX, userID, imagepath,
	isRelease, version, revision, Images, window, browser
*/
/********** Worker.Page for Castle Age **********
* Add defaults to Page for "Castle Age"
* This is the only safe place to change Page.setup, and is deliberately left open for it!
*/

Page.defaults.castle_age = {
	setup:function() {
		this.pageCheck = ['#'+APPID_+'globalContainer', '#'+APPID_+'globalcss', '#'+APPID_+'main_bntp', '#'+APPID_+'main_sts_container', '#'+APPID_+'app_body_container', '#'+APPID_+'nvbar', '#'+APPID_+'current_pg_url', '#'+APPID_+'current_pg_info'];
		// '#app_content_'+APPID, 
		this.pageNames = {
//			facebook:			- not real, but used in worker.pages for worker.page('facebook') on fb popup dialogs
			index:				{url:'index.php', selector:'#'+APPID_+'indexNewFeaturesBox'},
			quests_quest:			{url:'quests.php', image:'tab_quest_on.gif', skip:true}, // If we ever get this then it means a new land...
			quests_quest1:			{url:'quests.php?land=1', image:'land_fire_sel.gif', skip:true},
			quests_quest2:			{url:'quests.php?land=2', image:'land_earth_sel.gif', skip:true},
			quests_quest3:			{url:'quests.php?land=3', image:'land_mist_sel.gif', skip:true},
			quests_quest4:			{url:'quests.php?land=4', image:'land_water_sel.gif', skip:true},
			quests_quest5:			{url:'quests.php?land=5', image:'land_demon_realm_sel.gif', skip:true},
			quests_quest6:			{url:'quests.php?land=6', image:'land_undead_realm_sel.gif', skip:true},
			quests_quest7:			{url:'quests.php?land=7', image:'tab_underworld_big.gif', skip:true},
			quests_quest8:			{url:'quests.php?land=8', image:'tab_heaven_big2.gif', skip:true},
			quests_quest9:			{url:'quests.php?land=9', image:'tab_ivory_big.gif', skip:true},
			quests_quest10:			{url:'quests.php?land=10', image:'tab_earth2_big.gif', skip:true},
			quests_quest11:			{url:'quests.php?land=11', image:'tab_water2_big.gif', skip:true},
			quests_quest12:			{url:'quests.php?land=12', image:'tab_mist2_big.gif', skip:true},
			quests_quest13:			{url:'quests.php?land=13', image:'tab_mist3_big.gif', skip:true},
			quests_quest14:			{url:'quests.php?land=14', image:'tab_fire2_big.gif', skip:true},
			quests_quest15:			{url:'quests.php?land=15', image:'tab_pangaea_big.gif', skip:true},
			quests_quest16:			{url:'quests.php?land=16', image:'tab_perdition_big.gif', skip:true},
			quests_demiquests:		{url:'symbolquests.php', image:'demi_quest_on.gif', skip:true},
			quests_atlantis:		{url:'monster_quests.php', image:'tab_atlantis_on.gif', skip:true},
			battle_battle:			{url:'battle.php', image:'battle_on.gif', skip:true},
			battle_training:		{url:'battle_train.php', image:'training_grounds_on_new.gif', skip:true},
			battle_rank:			{url:'battlerank.php', image:'tab_battle_rank_on.gif'},
			battle_war:			{url:'war_rank.php', image:'tab_war_on.gif'},
			battle_raid:			{url:'raid.php', image:'tab_raid_on.gif', skip:true},
			battle_arena:			{url:'arena.php', image:'arena3_featurebuttonv2.jpg', skip:true},

			battle_arena_battle:		{url:'arena_battle.php', selector:'#'+APPID_+'arena_battle_banner_section', skip:true},
			festival_guild:			{url:'festival_battle_home.php', selector:'div[style*="festival_arena_home_background.jpg"]', skip:true},
			festival_guild_battle:		{url:'festival_guild_battle.php', selector:'#'+APPID_+'guild_battle_section', skip:true},
			battle_guild:			{url:'guild_current_battles.php', selector:'div[style*="guild_current_battles_title.gif"]', skip:true},
			battle_guild_battle:		{url:'guild_battle.php', selector:'#'+APPID_+'guild_battle_banner_section', skip:true},
			battle_war_council:		{url:'war_council.php', image:'war_select_banner.jpg', skip:true},
			monster_monster_list:		{url:'player_monster_list.php', image:'monster_button_yourmonster_on.jpg', skip:true},
			monster_remove_list:		{url:'player_monster_list.php', image:'mp_current_monsters.gif', skip:true},
			monster_battle_monster:		{url:'battle_monster.php', selector:'div[style*="monster_header"],div[style*="boss_header"]', skip:true},
			keep_monster_active:		{url:'raid.php', image:'dragon_view_more.gif', skip:true},
			festival_monster_list:		{url:'festival_tower.php?tab=monster', selector:'div[style*="festival_monster_list_middle.jpg"]', skip:true},
			festival_monster2_list:		{url:'festival_tower2.php?tab=monster', selector:'div[style*="festival_monster2_list_middle.jpg"]', skip:true},
			festival_battle_monster:	{url:'festival_battle_monster.php', image:'festival_monstertag_list.gif', skip:true},
			monster_dead:			{url:'battle_monster.php', selector:'div[style*="no_monster_back.jpg"]', skip:true},
			monster_summon:			{url:'monster_summon_list.php', image:'tab_summon_monster_on.gif', skip:true},
			monster_class:			{url:'view_class_progress.php', selector:'#'+APPID_+'choose_class_header', skip:true},
			heroes_heroes:			{url:'mercenary.php', image:'tab_heroes_on.gif'},
			heroes_generals:		{url:'generals.php', image:'tab_generals_on.gif'},
			town_soldiers:			{url:'soldiers.php', image:'tab_soldiers_on.gif'},
			town_blacksmith:		{url:'item.php', image:'tab_black_smith_on.gif'},
			town_magic:			{url:'magic.php', image:'tab_magic_on.gif'},
			town_land:			{url:'land.php', image:'tab_land_on.gif'},
			oracle_oracle:			{url:'oracle.php', image:'oracle_on.gif', skip:true},
			oracle_demipower:		{url:'symbols.php', image:'demi_on.gif', skip:true},
			oracle_treasurealpha:		{url:'treasure_chest.php', image:'tab_treasure_alpha_on.gif', skip:true},
//			oracle_treasurevanguard:	{url:'treasure_chest.php?treasure_set=alpha', image:'tab_treasure_vanguard_on.gif', skip:true},
//			oracle_treasureonslaught:	{url:'treasure_chest.php?treasure_set=onslaught', image:'tab_treasure_onslaught_on.gif', skip:true},
			keep_stats:			{url:'keep.php', image:'tab_stats_on.gif'},
			keep_eliteguard:		{url:'party.php', image:'tab_elite_guard_on.gif', skip:true},
			keep_achievements:		{url:'achievements.php', image:'tab_achievements_on.gif', skip:true},
			keep_alchemy:			{url:'alchemy.php', image:'tab_alchemy_on.gif', skip:true},
			army_invite:			{url:'army.php', image:'invite_on.gif', skip:true},
			army_gifts:			{url:'gift.php', selector:'#'+APPID_+'giftContainer', skip:true},
			army_viewarmy:			{url:'army_member.php', image:'view_army_on.gif', skip:true},
			army_sentinvites:		{url:'army_reqs.php', image:'sent_invites_on.gif', skip:true},
			army_newsfeed:			{url:'army_news_feed.php', selector:'#'+APPID_+'army_feed_header', skip:true},
			gift_accept:			{url:'gift_accept.php', selector:'div[style*="gift_background.jpg"]', skip:true}
//			apprentice_collect:		{url:'apprentice.php?collect=true', image:'ma_view_progress2.gif', skip:true}
		};
	}
};


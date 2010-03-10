/********** Worker.Page() **********
* All navigation including reloading
*/
var Page = new Worker('Page');
Page.unsortable = true;
Page.option = {
	timeout: 15,
	retry: 5
};
Page.page = '';
Page.last = null; // Need to have an "auto retry" after a period
Page.lastclick = null;
Page.when = null;
Page.retry = 0;
Page.checking = true;
Page.display = [
	{
		id:'timeout',
		label:'Retry after',
		select:[10, 15, 30, 60],
		after:'seconds'
	},{
		id:'retry',
		label:'Reload after',
		select:[2, 3, 5, 10],
		after:'tries'
	}
];
Page.work = function(state) {
	if (!Page.checking) {
		return false;
	}
	var i, l, list, found = null;
	for (i=0; i<Workers.length && !found; i++) {
		if (!Workers[i].pages || Workers[i].pages==='*') {
			continue;
		}
		list = Workers[i].pages.split(' ');
		for (l=0; l<list.length; l++) {
			if (Page.pageNames[list[l]] && !Page.data[list[l]] && list[l].indexOf('_active') === -1) {
				found = list[l];
				break;
			}
		}
	}
	if (!state) {
		if (found) {
			return true;
		}
		Page.checking = false;
		return false;
	}
	if (found && !Page.to(found)) {
		Page.data[found] = Date.now(); // Even if it's broken, we need to think we've been there!
		return true;
	}
	return false;
};
Page.pageNames = {
	index:					{url:'index.php', image:null},
	quests_quest:			{url:'quests.php', image:'tab_quest_on.gif'}, // If we ever get this then it means a new land...
	quests_quest1:			{url:'quests.php?land=1', image:'land_fire_sel.gif'},
	quests_quest2:			{url:'quests.php?land=2', image:'land_earth_sel.gif'},
	quests_quest3:			{url:'quests.php?land=3', image:'land_mist_sel.gif'},
	quests_quest4:			{url:'quests.php?land=4', image:'land_water_sel.gif'},
	quests_quest5:			{url:'quests.php?land=5', image:'land_demon_realm_sel.gif'},
	quests_quest6:			{url:'quests.php?land=6', image:'land_undead_realm_sel.gif'},
	quests_quest7:			{url:'quests.php?land=7', image:'tab_underworld_big.gif'},
	quests_demiquests:		{url:'symbolquests.php', image:'demi_quest_on.gif'},
	quests_atlantis:		{url:'monster_quests.php', image:'tab_atlantis_on.gif'},
	battle_battle:			{url:'battle.php', image:'battle_on.gif'},
	battle_training:		{url:'battle_train.php', image:'training_grounds_on_new.gif'},
	battle_rank:			{url:'battlerank.php', image:'tab_battle_rank_on.gif'},
	battle_raid:			{url:'raid.php', image:'tab_raid_on.gif'},
	heroes_heroes:			{url:'mercenary.php', image:'tab_heroes_on.gif'},
	heroes_generals:		{url:'generals.php', image:'tab_generals_on.gif'},
	town_soldiers:			{url:'soldiers.php', image:'tab_soldiers_on.gif'},
	town_blacksmith:		{url:'item.php', image:'tab_black_smith_on.gif'},
	town_magic:				{url:'magic.php', image:'tab_magic_on.gif'},
	town_land:				{url:'land.php', image:'tab_land_on.gif'},
	oracle_oracle:			{url:'oracle.php', image:'oracle_on.gif'},
	oracle_demipower:		{url:'symbols.php', image:'demi_on.gif'},
	oracle_treasurealpha:	{url:'treasure_chest.php', image:'tab_treasure_alpha_on.gif'},
	oracle_treasurevanguard:{url:'treasure_chest.php?treasure_set=alpha', image:'tab_treasure_vanguard_on.gif'},
	keep_stats:				{url:'keep.php?user='+userID, image:'tab_stats_on.gif'},
	keep_eliteguard:		{url:'party.php?user='+userID, image:'tab_elite_guard_on.gif'},
	keep_achievements:		{url:'achievements.php', image:'tab_achievements_on.gif'},
	keep_alchemy:			{url:'alchemy.php', image:'tab_alchemy_on.gif'},
	keep_monster:			{url:'battle_monster.php', image:'tab_monster_on.jpg'},
	keep_monster_active:	{url:'battle_monster.php', image:'dragon_view_more.gif'},
	army_invite:			{url:'army.php', image:'invite_on.gif'},
	army_gifts:				{url:'gift.php', image:null},
	army_viewarmy:			{url:'army_member.php', image:'view_army_on.gif'},
	army_sentinvites:		{url:'army_reqs.php', image:'sent_invites_on.gif'}
};
Page.identify = function() {
	Page.page = '';
	$('#app'+APPID+'_app_body img').each(function(i,el){
		var p, filename = $(el).attr('src').filepart();
		for (p in Page.pageNames) {
			if (filename === Page.pageNames[p].image) {
				Page.page = p; return;
			}
		}
	});
	if ($('#app'+APPID+'_indexNewFeaturesBox').length) {
		Page.page = 'index';
	} else if ($('div[style*="giftpage_title.jpg"]').length) {
		Page.page = 'army_gifts';
	}
	if (Page.page !== '') {
		Page.data[Page.page] = Date.now();
	}
//	debug('Page.identify("'+Page.page+'")');
	return Page.page;
};
Page.to = function(page, args) {
	if (page === Page.page && typeof args === 'undefined') {
		return true;
	}
	if (!args) {
		args = '';
	}
	if (page && Page.pageNames[page] && Page.pageNames[page].url) {
		Page.clear();
		Page.last = Page.pageNames[page].url;
		Page.when = Date.now();
		if (args.indexOf('?') === 0 && Page.last.indexOf('?') > 0) {
			Page.last = Page.last.substr(0, Page.last.indexOf('?')) + args;
		} else {
			Page.last = Page.last + args;
		}
		debug('Navigating to '+Page.last+' ('+Page.pageNames[page].url+')');
		if (unsafeWindow['a'+APPID+'_get_cached_ajax']) {
			unsafeWindow['a'+APPID+'_get_cached_ajax'](Page.last, "get_body");
		} else {
			window.location.href = 'http://apps.facebook.com/castle_age/index.php?bm=1';
		}
	}
	return false;
};
Page.click = function(el) {
	if (!$(el).length) {
		debug('Page.click: Unable to find element - '+el);
		return false;
	}
	var e = document.createEvent("MouseEvents");
	e.initEvent("click", true, true);
	$(el).get(0).wrappedJSObject.dispatchEvent(e);
	Page.clear();
	Page.lastclick = el;
	Page.when = Date.now();
	return true;
};
Page.clear = function() {
	Page.last = Page.lastclick = Page.when = null;
	Page.retry = 0;
};
Page.loading = function() {
	if (!unsafeWindow['a'+APPID+'_get_cached_ajax']) {
		if (!Page.when || (Date.now() - Page.when) >= (Page.option.timeout * Page.option.retry * 1000)) { // every xx seconds - we don't get called once it starts loading
			Page.when = Date.now();
			window.location.href = 'http://apps.facebook.com/castle_age/index.php';
		}
		debug('Page not loaded correctly, reloading.');
		return true;
	}
	if ($('#app'+APPID+'_AjaxLoadIcon').css('display') === 'none') { // Load icon is shown after 1.5 seconds
		if (Page.when && (Date.now() - Page.when) > (Page.option.timeout * 1000)) {
			Page.clear();
		}
		return false;
	}
	if (Page.when && (Date.now() - Page.when) >= (Page.option.timeout * 1000)) {
		debug('Page.loading for 15+ seconds - retrying...');
		Page.when = Date.now();
		if (Page.retry++ >= Page.option.retry) {
			debug('Page.loading for 1+ minutes - reloading...');
			window.location.href = 'http://apps.facebook.com/castle_age/index.php';
		} else if (Page.last) {
			unsafeWindow['a'+APPID+'_get_cached_ajax'](Page.last, "get_body");
		} else if (Page.lastclick) {
			Page.click(Page.lastclick);
		}
	}
	return true;
};
Page.reload = function() {
	if (!Page.when || (Date.now() - Page.when) >= (Page.option.timeout * Page.option.retry * 1000)) {
		Page.to((Page.page || 'index'), '');
	}
};


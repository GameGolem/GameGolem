/********** Worker.Page() **********
* All navigation including reloading
*/
var Page = new Worker('Page');

Page.settings = {
	system:true,
	unsortable:true,
	keep:true
};

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
Page.node_trigger = null;
Page.loading = false;

Page.display = [
	{
		id:'timeout',
		label:'Retry after',
		select:[10, 15, 30, 60],
		after:'seconds'
	}
];

Page.defaults = {
	'castle_age':{
		pageNames:{
			index:					{url:'index.php', selector:'#app'+APPID+'_indexNewFeaturesBox'},
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
			battle_arena:			{url:'arena.php', image:'tab_arena_on.gif'},
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
			oracle_treasureonslaught:{url:'treasure_chest.php?treasure_set=onslaught', image:'tab_treasure_onslaught_on.gif'},
			keep_stats:				{url:'keep.php?user='+userID, image:'tab_stats_on.gif'},
			keep_eliteguard:		{url:'party.php?user='+userID, image:'tab_elite_guard_on.gif'},
			keep_achievements:		{url:'achievements.php', image:'tab_achievements_on.gif'},
			keep_alchemy:			{url:'alchemy.php', image:'tab_alchemy_on.gif'},
			keep_monster:			{url:'battle_monster.php', image:'tab_monster_on.jpg'},
			keep_monster_active2:	{url:'battle_monster.php', selector:'div[style*="nm_monster_list_button.gif"]'},
			keep_monster_active:	{url:'raid.php', image:'dragon_view_more.gif'},
			army_invite:			{url:'army.php', image:'invite_on.gif'},
			army_gifts:				{url:'gift.php', selector:'#app'+APPID+'_giftContainer'},
			army_viewarmy:			{url:'army_member.php', image:'view_army_on.gif'},
			army_sentinvites:		{url:'army_reqs.php', image:'sent_invites_on.gif'},
			army_newsfeed:			{url:'army_news_feed.php', selector:'#app'+APPID+'_army_feed_header'},
                        apprentice_collect:             {url:'apprentice.php?collect=true', image:'ma_view_progress2.gif'}
		}
	}
};

Page.init = function() {
	// Only perform the check on the two id's referenced in get_cached_ajax()
	// Give a short delay due to multiple children being added at once, 0.1 sec should be more than enough
	$('body').bind('DOMNodeInserted', function(event){
		if (!Page.node_trigger && ($(event.target).attr('id') === 'app'+APPID+'_app_body_container' || $(event.target).attr('id') === 'app'+APPID+'_globalContainer')) {
			Page.node_trigger = window.setTimeout(function(){Page.node_trigger=null;Page.parse_all();},100);
		}
	});
};

Page.parse_all = function() {
	Page.identify();
	var i, list = [];
	for (i=0; i<Workers.length; i++) {
		if (Workers[i].parse && Workers[i].pages && (Workers[i].pages.indexOf('*')>=0 || (Page.page && Workers[i].pages.indexOf(Page.page)>=0))) {
			Workers[i]._unflush();
			if (Workers[i]._parse(false)) {
				list.push(Workers[i]);
			}
		}
	}
	for (i in list) {
		list[i]._parse(true);
	}
	for (i=0; i<Workers.length; i++) {
		Workers[i]._flush();
	}
}


Page.work = function(state) {
	if (!this.checking) {
		return false;
	}
	var i, l, list, found = null;
	for (i=0; i<Workers.length && !found; i++) {
		if (Workers[i].pages) {
			list = Workers[i].pages.split(' ');
			for (l=0; l<list.length; l++) {
				if (list[l] !== '*' && this.pageNames[list[l]] && !this.data[list[l]] && list[l].indexOf('_active') === -1) {
					found = list[l];
					break;
				}
			}
		}
	}
	if (!state) {
		if (found) {
			return true;
		}
		this.checking = false;
		return false;
	}
	if (found && !this.to(found)) {
		this.data[found] = Date.now(); // Even if it's broken, we need to think we've been there!
		return true;
	}
	return false;
};

Page.identify = function() {
	this.page = '';
	if (!$('#app_content_'+APPID).length) {
		this.reload();
		return null;
	}
	var app_body = $('#app'+APPID+'_app_body'), p;
	$('img', app_body).each(function(i,el){
		var filename = $(el).attr('src').filepart();
		for (p in Page.pageNames) {
			if (Page.pageNames[p].image && filename === Page.pageNames[p].image) {
				Page.page = p;
				return;
			}
		}
	});
	if (!this.page) {
		for (p in Page.pageNames) {
			if (Page.pageNames[p].selector && $(Page.pageNames[p].selector).length) {
				Page.page = p;
			}
		}
	}
	if (this.page !== '') {
		this.data[this.page] = Date.now();
	}
	//debug(this.name,'this.identify("'+Page.page+'")');
	return this.page;
};

Page.to = function(page, args, force) {
	if (Queue.option.pause) {
		debug(this.name,'Trying to load page when paused...');
		return true;
	}
	if (page === this.page && (force || typeof args === 'undefined')) {
		return true;
	}
	if (!args) {
		args = '';
	}
	if (page && this.pageNames[page] && this.pageNames[page].url) {
		this.clear();
		this.last = this.pageNames[page].url;
		this.when = Date.now();
		if (args.indexOf('?') === 0 && this.last.indexOf('?') > 0) {
			this.last = this.last.substr(0, this.last.indexOf('?')) + args;
		} else {
			this.last = this.last + args;
		}
		debug(this.name,'Navigating to ' + page + ' (' + (force ? 'FORCE: ' : '') + this.last + ')');
		if (force) {
//			this.loading=true;
			window.location.href = this.last;
		} else {
			this.ajaxload();
		}               
	}
	return false;
};

Page.ajaxload = function() {
	$.ajax({
		cache:false,
		dataType:'text',
		timeout:this.option.timeout * 1000,
		url:'http://apps.facebook.com/castle_age/'+this.last,
		error:function() {
			debug('Page not loaded correctly, reloading.');
			Page.ajaxload();
		},
		success:function(data){
		if (data.indexOf('app'+APPID+'_results_container') !== -1 && data.indexOf('</html>') !== -1 && data.indexOf('single_popup') !== -1 && data.indexOf('app'+APPID+'_index') !== -1) { // Last things in source if loaded correctly...
				Page.loading = false;
				data = data.substring(data.indexOf('<div id="app'+APPID+'_globalContainer"'), data.indexOf('<div class="UIStandardFrame_SidebarAds"'));
				$('#app'+APPID+'_AjaxLoadIcon').css('display', 'none');
				$('#app'+APPID+'_globalContainer').empty().append(data);
			} else {
				debug('Page not loaded correctly, reloading.');
				Page.ajaxload();
			}
		}
	});
	this.loading = true;
	setTimeout(function() { if (Page.loading) {$('#app'+APPID+'_AjaxLoadIcon').css('display', 'block');} }, 1500);
};

Page.reload = function() {
	debug(this.name,'Page.reload()');
	window.location.href = window.location.href;
};

Page.click = function(el) {
	if (!$(el).length) {
		log(this.name,'Page.click: Unable to find element - '+el);
		return false;
	}
	var e = document.createEvent("MouseEvents");
	e.initEvent("click", true, true);
	$(el).get(0).wrappedJSObject.dispatchEvent(e);
	this.clear();
	this.lastclick = el;
	this.when = Date.now();
	return true;
};

Page.clear = function() {
	this.last = this.lastclick = this.when = null;
	this.retry = 0;
};


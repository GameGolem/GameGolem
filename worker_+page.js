/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page:true, Queue, Resources,
	Battle, Generals, LevelUp, Player,
	APP, APPID, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, shortNumber, Divisor, length, unique, deleteElement, sum, addCommas, findInArray, findInObject, objectIndex, sortObject, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime, ucfirst, ucwords,
	makeImage
*/
/********** Worker.Page() **********
* All navigation including reloading
*/
var Page = new Worker('Page');

Page.settings = {
	system:true,
	unsortable:true,
	keep:true,
	no_disable:true
};

Page.option = {
	timeout:15,
	delay:1,
	reload:5,
	nochat:false,
	click:true
};

Page.page = '';
Page.lastclick = null;
Page.when = null;
Page.retry = 0; // Number of times we tried
Page.node_trigger = null;
Page.loading = false;

Page.display = [
	{
		id:'timeout',
		label:'Retry after',
		select:[10, 15, 30, 60],
		after:'seconds'
	},{
		id:'delay',
		label:'...Delay',
		select:[1, 2, 3, 4, 5],
		after:'seconds'
	},{
		id:'reload',
		label:'Reload after',
		select:[3, 5, 7, 9, 11, 13, 15],
		after:'tries'
	},{
		id:'nochat',
		label:'Remove Facebook Chat',
		checkbox:true,
		help:'This does not log you out of chat, only hides it from display and attempts to stop it loading - you can still be online in facebook'
	},{
		id:'click',
		label:'Replace Links',
		checkbox:true,
		help:'Uses Golem code for clicking on links rather than facebook code - may help with some white screen issues'
	}
];

Page.defaults = {
	'castle_age':{
		pageNames:{
//			facebook:				- not real, but used in worker.pages for worker.parse('facebook') on fb popup dialogs
			index:					{url:'index.php', selector:'#app'+APPID+'_indexNewFeaturesBox'},
			quests_quest:			{url:'quests.php', image:'tab_quest_on.gif'}, // If we ever get this then it means a new land...
			quests_quest1:			{url:'quests.php?land=1', image:'land_fire_sel.gif'},
			quests_quest2:			{url:'quests.php?land=2', image:'land_earth_sel.gif'},
			quests_quest3:			{url:'quests.php?land=3', image:'land_mist_sel.gif'},
			quests_quest4:			{url:'quests.php?land=4', image:'land_water_sel.gif'},
			quests_quest5:			{url:'quests.php?land=5', image:'land_demon_realm_sel.gif'},
			quests_quest6:			{url:'quests.php?land=6', image:'land_undead_realm_sel.gif'},
			quests_quest7:			{url:'quests.php?land=7', image:'tab_underworld_big.gif'},
			quests_quest8:			{url:'quests.php?land=8', image:'tab_heaven_big2.gif'},
			quests_quest9:			{url:'quests.php?land=9', image:'tab_ivory_big.gif'},
			quests_quest10:			{url:'quests.php?land=10', image:'tab_earth2_big.gif'},
			quests_quest11:			{url:'quests.php?land=11', image:'tab_water2_big.gif'},
			quests_demiquests:		{url:'symbolquests.php', image:'demi_quest_on.gif'},
			quests_atlantis:		{url:'monster_quests.php', image:'tab_atlantis_on.gif'},
			battle_battle:			{url:'battle.php', image:'battle_on.gif'},
			battle_training:		{url:'battle_train.php', image:'training_grounds_on_new.gif'},
			battle_rank:			{url:'battlerank.php', image:'tab_battle_rank_on.gif'},
			battle_raid:			{url:'raid.php', image:'tab_raid_on.gif'},
			battle_arena:			{url:'arena.php', image:'tab_arena_on.gif'},
			battle_war_council:		{url:'war_council.php', image:'war_select_banner.jpg'},
			monster_monster_list:	{url:'battle_monster.php', image:'tab_monster_list_on.gif'},
			monster_battle_monster:	{url:'battle_monster.php', selector:'div[style*="nm_monster_list_button.gif"]'},
			keep_monster_active:	{url:'raid.php', image:'dragon_view_more.gif'},
			monster_summon:			{url:'monster_summon_list.php', image:'tab_summon_monster_on.gif'},
			monster_class:			{url:'view_class_progress.php', selector:'#app'+APPID+'_choose_class_header'},
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
			keep_stats:				{url:'keep.php', image:'tab_stats_on.gif'},
			keep_eliteguard:		{url:'party.php', image:'tab_elite_guard_on.gif'},
			keep_achievements:		{url:'achievements.php', image:'tab_achievements_on.gif'},
			keep_alchemy:			{url:'alchemy.php', image:'tab_alchemy_on.gif'},
			army_invite:			{url:'army.php', image:'invite_on.gif'},
			army_gifts:				{url:'gift.php', selector:'#app'+APPID+'_giftContainer'},
			army_viewarmy:			{url:'army_member.php', image:'view_army_on.gif'},
			army_sentinvites:		{url:'army_reqs.php', image:'sent_invites_on.gif'},
			army_newsfeed:			{url:'army_news_feed.php', selector:'#app'+APPID+'_army_feed_header'},
			gift_accept:			{url:'gift_accept.php', selector:'div[style*="gift_background.jpg"]'},
			apprentice_collect:		{url:'apprentice.php?collect=true', image:'ma_view_progress2.gif'}
		}
	}
};

Page.removeFacebookChat = function() {
	$('script').each(function(i,el){
		$(el).text($(el).text()
		.replace(/\nonloadRegister.function \(\).*new ChatNotifications.*/g, '')
		.replace(/\n<script>big_pipe.onPageletArrive.{2}"id":"pagelet_chat_home".*/g, '')
		.replace(/\n<script>big_pipe.onPageletArrive.{2}"id":"pagelet_presence".*/g, '')
		.replace(/|chat\\\//,''));
	});
	var b = document.getElementsByTagName('body')[0] || document.documentElement, a = document.createElement('script');
	a.type = 'text/javascript';
	a.appendChild(document.createTextNode('window.setTimeout(function(){delete window.presenceNotifications;},1000);'));
	b.appendChild(a);
	$('#pagelet_presence').remove();
	$('#pagelet_chat_home').remove();
};

Page.replaceClickHandlers = function() {
	// Remove all CA click handlers...
	$('#app'+APPID+'_globalContainer a[href*="/'+APP+'/"]')
	.click(function(event){
		if (event.which === 1 && $(this).attr('href') && !Page.to($(this).attr('href'), false)) {// Left click only
			console.log(warn(), 'Replacing CA link');
			event.preventDefault();
			event.stopImmediatePropagation()
			return false;
		}
		return true;
	});
};

Page.init = function() {
	// Only perform the check on the two id's referenced in get_cached_ajax()
	// Give a short delay due to multiple children being added at once, 0.1 sec should be more than enough
	$('body').bind('DOMNodeInserted', function(event){
		if (($(event.target).attr('id') === 'app'+APPID+'_app_body_container' || $(event.target).attr('id') === 'app'+APPID+'_globalContainer')) {
			window.clearTimeout(Page.node_trigger);
			Page.node_trigger = window.setTimeout(function(){Page.node_trigger=null;Page.parse_all(false);},100);// Normal game stuff
		} else if ($(event.target).hasClass('generic_dialog_popup')) {
//		} else if ($(event.target).attr('id') === 'pop_content') {
			window.clearTimeout(Page.node_trigger);
			Page.node_trigger = window.setTimeout(function(){Page.node_trigger=null;Page.parse_all(true);},100);// Facebook popup display
		}
	});
	// New version -
//	this._trigger('#app'+APPID+'_app_body_container, #app'+APPID+'_globalContainer', 'page_change');
//	this._trigger('.generic_dialog_popup', 'facebook');// This could be removed as it's not really a Page issue...
	if (this.option.nochat) {
		this.removeFacebookChat();
	}
	if (this.option.click) {
		$('#app'+APPID+'_globalContainer a[href*="/'+APP+'/"][onclick]').each(function(i,el){
			if ($(el).parent().html()){
				$(el).parent().html($(el).parent().html().replace(/<a onclick="[^"]*" href/g, '<a href'));
			}
		});
		this.replaceClickHandlers();
	}
	$('.golem-link').live('click', function(event){
		if (!Page.to($(this).attr('href'), false)) {
			return false;
		}
	});
};

Page.parse_all = function(isFacebook) {
	this._push();
	if (!isFacebook) {
		Page.identify();
	}
	var i, list = [];
	for (i in Workers) {
		if (Workers[i].parse && Workers[i].pages) {
			if (isFacebook) {
				if (Workers[i].pages.indexOf('facebook') >= 0) {
					Workers[i]._parse('facebook');
				}
			} else if (Workers[i].pages.indexOf('*') >= 0 || (Page.page !== '' && Workers[i].pages.indexOf(Page.page) >= 0)) {
				if (Workers[i]._parse(false)) {
					list.push(Workers[i]);
				}
			}
		}
	}
	for (i in list) {
		list[i]._parse(true);
	}
	for (i in Workers) {
		Workers[i]._flush();
	}
	this._pop();
};
/*
Page.update = function(event) {
	if (event.type === 'trigger') {
		var i, list;
		if (event.id === 'page_change') {
			list = ['#app_content_'+APPID, '#app'+APPID+'_globalContainer', '#app'+APPID+'_globalcss', '#app'+APPID+'_main_bntp', '#app'+APPID+'_main_sts_container', '#app'+APPID+'_app_body_container', '#app'+APPID+'_nvbar', '#app'+APPID+'_current_pg_url', '#app'+APPID+'_current_pg_info'];
			console.log(warn('Page change noticed...'));
			for (i=0; i<list.length; i++) {
				if (!$(list[i]).length) {
					console.log(warn('Bad page warning: Unabled to find '+list[i]));
					// Need to do the page reloading bit in here...
					return;
				}
			}
			Page.identify();
			list = [];
			for (i in Workers) {
				if (Workers[i].parse
				 && Workers[i].pages
				 && (Workers[i].pages.indexOf('*') >= 0 || (this.page !== '' && Workers[i].pages.indexOf(this.page) >= 0))
				 && Workers[i]._parse(false)) {
					list.push(Workers[i]);
				}
			}
			for (i in list) {
				list[i]._parse(true);
			}
			for (i in Workers) {
				Workers[i]._flush();
			}
		} else if (event.id === 'facebook') {
			for (i in Workers) {
				if (Workers[i].parse && Workers[i].pages && Workers[i].pages.indexOf('facebook') >= 0) {
					Workers[i]._parse('facebook');
				}
			}
		}
	}
};
*/
Page.work = function(state) {
	var i, l, list, found = null;
	for (i in Workers) {
		if (isString(Workers[i].pages)) {
			list = Workers[i].pages.split(' ');
			for (l=0; l<list.length; l++) {
				if (list[l] !== '*' && this.pageNames[list[l]] && !this.data[list[l]] && list[l].indexOf('_active') === -1) {
					found = list[l];
					break;
				}
			}
		}
		if (found) {
			break;
		}
	}
	if (found) {
		if (!state) {
			return QUEUE_CONTINUE;
		}
		if (!this.to(found)) {
			this.data[found] = Date.now(); // Even if it's broken, we need to think we've been there!
			return QUEUE_CONTINUE;
		}
	}
	this.work = null;// Only check when first loading, once we're running we never work() again :-P
	return QUEUE_FINISH;
};

Page.identify = function() {
	this.page = '';
	if (!$('#app_content_'+APPID+' > div > div').length || !$('#app'+APPID+'_globalContainer > div > div').length) {
		console.log(warn(), 'Page apparently not loaded correctly, reloading.');
		this.reload();
		return null;
	}
	this.clear();
	var app_body = $('#app'+APPID+'_app_body'), p;
	$('img', app_body).each(function(i,el){
		var p, filename = $(el).attr('src').filepart();
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
//	console.log(warn(), 'this.identify("'+Page.page+'")');
	return this.page;
};

Page.request = {method:'GET', url:null, body:null}

Page.onreadystatechange = function() {
	if (this.readyState !== 4) {
		return;
	}
	try {
		// First check it's there, and an html page
		if (this.status !== 200 || !this.responseText || this.responseText.indexOf('</html>') === -1) {
			throw(this.status===200 ? 'Bad response status' : 'Bad data');
		}
		// Reduce it to just the stuff we want...
		var data = this.responseText.substring(this.responseText.indexOf('<div id="app'+APPID+'_globalContainer"'), this.responseText.indexOf('<div class="UIStandardFrame_SidebarAds"'));
		// Then check if it's still valid
		if (!data // || data.indexOf(APP) === -1
		|| data.indexOf('app'+APPID+'_results_container') === -1
		|| data.indexOf('app'+APPID+'_main_bntp') === -1
		|| data.indexOf('app'+APPID+'_app_body') === -1) {
			throw('Bad data');
		}
// Last things in source if loaded correctly...
		try {// Once we're here we want to complete...
			if (Page.option.nochat) {
				data = data.replace(/\nonloadRegister.function \(\).*new ChatNotifications.*/g, '').replace(/\n<script>big_pipe.onPageletArrive.{2}"id":"pagelet_chat_home".*/g, '').replace(/\n<script>big_pipe.onPageletArrive.{2}"id":"pagelet_presence".*/g, '').replace(/|chat\\\//,'');
			}
			if (Page.option.click) {
//				console.log(warn(), 'replacing click handlers');
				data = data.replace(/<a onclick="[^"]*" href/g, '<a href');
			}
			$('#app'+APPID+'_AjaxLoadIcon').hide();
			$('#app'+APPID+'_globalContainer').replaceWith(data);
			Page.clear();
			if (Page.option.click) {
				Page.replaceClickHandlers();
			}
		} catch(e1){
			console.log(warn(), e1.name + ' in XMLHttpRequest('+(Page.request.method || 'GET')+', '+Page.request.url+'): ' + e1.message);
		}
		return;// Stop here as we're done
	} catch(e2){
		console.log(warn(), 'AJAX_BAD_REPLY in XMLHttpRequest('+(Page.request.method || 'GET')+', '+Page.request.url+'): ' + e2);
	}
	if (++Page.retry < Page.option.retry && Page.request.url) {
		console.log(warn(), 'Page not loaded correctly, retry last action.');
		window.setTimeout(function(){
			var request = new XMLHttpRequest();
			request.open(Page.request.method || 'GET', Page.request.url);
			request.onreadystatechange = Page.onreadystatechange;
			request.send(Page.request.body);
		}, Page.option.delay * 1000);
	} else {
		console.log(warn(), 'Page not loaded correctly, reloading.');
		window.setTimeout(Page.reload, Page.option.delay * 1000);
	}
};

/*
Page.to(['GET' | 'POST',] 'index', ['args' | {arg1:val, arg2:val},] [true|false]
*/
Page.to = function() { // Force = true/false (ignore pause and reload page if true)
	var i, j, method = 'GET', page, body, args, force = 0, request;
	for (i=0; i<arguments.length; i++) {
		switch (typeof arguments[i]) {
			case 'string':
				if (arguments[i].toUpperCase() === 'GET' || arguments[i].toUpperCase() === 'POST') {
					method = arguments[i].toUpperCase();
				} else if (!page) {
					if (arguments[i].indexOf('apps.facebook.com/' + APP + '/') !== -1) {// Absolute url
						for (j in Page.pageNames) {
							if (arguments[i].indexOf('/'+Page.pageNames[j].url) !== -1) {
								page = j;
								args = arguments[i].indexOf('?')>=0 ? arguments[i].substr(arguments[i].indexOf('?')) : '';
							}
						}
					} else if (arguments[i].indexOf('/') === -1 && arguments[i].indexOf('?') !== -1) {// Relative url
						for (j in Page.pageNames) {
							if (arguments[i].indexOf(Page.pageNames[j].url) !== -1) {
								page = j;
								args = arguments[i].indexOf('?')>=0 ? arguments[i].substr(arguments[i].indexOf('?')) : '';
							}
						}
					} else {// Unknown domain - we'll probably not handle it...
						page = arguments[i];
					}
				} else {
					if (method === 'GET') {
						args = (arguments[i].indexOf('?') !== 0 ? '?' : '') + arguments[i];
					} else {
						body = arguments[i];
					}
				}
				break;
			case 'boolean':
				force = arguments[i];
				break;
			case 'object':
				if (arguments[i] !== null) {
					if (method === 'GET') {
						args = '?' + decodeURIComponent($.param(arguments[i]));
					} else {
						body = decodeURIComponent($.param(arguments[i]));
					}
				}
				break;
			default:
				break;
		}
	}
//	console.log(warn(), 'Page.to("'+method+'", "'+page+'", "'+args+'", '+force+');');
	if (force === 0 && Queue.option.pause) {
		console.log(warn(), 'Trying to load page when paused...');
		return true;
	}
	if (page === this.page && method !== 'POST' && (force || typeof args === 'undefined')) {
		return true;
	}
//	this._push();
	if (!this.loading && page && this.pageNames[page] && this.pageNames[page].url) {
		this.clear();
		page = window.location.protocol + '//apps.facebook.com/' + APP + '/' + this.pageNames[page].url;
		this.when = Date.now();
		if (method === 'GET' && args) {
			if (page.indexOf('?') > 0) {
				page = page.substr(0, page.indexOf('?'));
			}
			page = page + args;
		}
		this.loading = true;
		console.log(warn(), 'Navigating to ' + page + (force ? ' (FORCE)' : ''));
		if (force) {
			window.location.replace(page);// Load new page without giving a back button
			window.setTimeout(function(){Page.loading = false;}, this.option.timeout * 1000);// Don't try to load again for timeout secs...
		} else {
			Page.request = {
				method:method,
				url:page,
				body:body
			};
			request = new XMLHttpRequest();
			request.open(method, page);
			request.onreadystatechange = Page.onreadystatechange;
			request.send(body);
			setTimeout(function() { if (Page.loading) {$('#app'+APPID+'_AjaxLoadIcon').show();} }, 1500);
		}
	}
//	this._pop();
	return false;
};

Page.reload = function() {
	console.log(warn(), 'Page.reload()');
	window.location.replace(window.location.href);
};

Page.clearFBpost = function(obj) {
	var output = [];
	for (var i=0; i<obj.length; i++) {
		if (obj[i].name.indexOf('fb_') !== 0) {
			output.push(obj[i]);
		}
	}
	if (!output.bqh && $('input[name=bqh]').length) {
		output.push({name:'bqh', value:$('input[name=bqh]').first().val()});
	}
	return output;
};

Page.click = function(el) {
	if (!$(el).length) {
		console.log(log(), 'Page.click: Unable to find element - '+el);
		return false;
	}
	if (this.lastclick === el) {
		if (++this.retry >= this.option.retry) {
			console.log(warn(), 'Element not clicked properly, reloading.');
			Page.reload();
			return true;
		}
	} else {
		this.clear();
	}
	var e, element = $(el).get(0);
	e = document.createEvent("MouseEvents");
	e.initEvent("click", true, true);
	(element.wrappedJSObject ? element.wrappedJSObject : element).dispatchEvent(e);
	this.lastclick = el;
	this.when = Date.now();
	return true;
};

Page.clear = function() {
	this.lastclick = this.when = null;
	this.loading = false;
	this.retry = 0;
};


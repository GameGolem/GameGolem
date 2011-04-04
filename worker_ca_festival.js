/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page:true, Queue, Resources, Global,
	Battle, Generals, LevelUp, Player,
	APP, APPID, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, Divisor, length, sum, findInObject, objectIndex, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
	makeImage, log, warn, error
*//********** Worker.Festival() **********
* Build your festival army
* Auto-attack Festival targets
*/
var Festival = new Worker('Festival');

Festival.settings = {
	taint:true
};

Festival.defaults['castle_age'] = {
	pages:'festival_guild festival_guild_battle'
};

Festival.option = {
	general:true,
	general_choice:'any',
	start:false,
	collect:true,
	tokens:'min',
	safety:60000,
	ignore:'',
	limit:'',
	cleric:false
};

Festival.runtime = {
	tokens:10,
	status:'start',// wait, start, fight, collect
	start:0,
	finish:0,
	rank:0,
	points:0,
	burn:false,
	last:null, // name of last target, .data[last] then we've lost so skip them
	stunned:false
};

Festival.temp = {
	status:{
		none:'Unknown',
		wait:'Waiting for Next Battle',
		start:'Entering Battle',
		fight:'In Battle',
		collect:'Collecting Reward'
	}
};

Festival.display = [
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
		id:'start',
 		label:'Automatically Start',
		checkbox:true
	},{
		id:'delay',
		label:'Start Delay',
		require:'start',
		select:{0:'None',60000:'1 Minute',120000:'2 Minutes',180000:'3 Minutes',240000:'4 Minutes',300000:'5 Minutes'}
	},{
		id:'collect',
 		label:'Collect Rewards',
		checkbox:true
	},{
		id:'tokens',
		label:'Use Tokens',
		select:{min:'Immediately', healthy:'Save if Stunned', max:'Save Up'}
	},{
		id:'safety',
		label:'Safety Margin',
		require:'tokens!="min"',
		select:{30000:'30 Seconds',45000:'45 Seconds',60000:'60 Seconds',90000:'90 Seconds'}
	},{
		id:'order',
		label:'Attack',
		select:{health:'Lowest Health', level:'Lowest Level', maxhealth:'Lowest Max Health', activity:'Lowest Activity', health2:'Highest Health', level2:'Highest Level', maxhealth2:'Highest Max Health', activity2:'Highest Activity'}
	},{
		advanced:true,
		id:'limit',
		label:'Relative Level',
		text:true,
		help:'Positive values are levels above your own, negative are below. Leave blank for no limit'
	},{
		id:'cleric',
 		label:'Attack Clerics First',
		checkbox:true,
		help:'This will attack any *active* clerics first, which might help prevent the enemy from healing up again...'
	},{
		id:'defeat',
 		label:'Avoid Defeat',
		checkbox:true,
		help:'This will prevent you attacking a target that you have already lost to'
	},{
		advanced:true,
		id:'ignore',
		label:'Ignore Targets',
		text:true,
		help:'Ignore any targets with names containing these tags - use | to separate multiple tags'
	}
];

Festival.init = function() {
	var now = Date.now();

	// BEGIN: fix up "under level 4" generals
	if (this.option.general_choice === 'under level 4') {
		this.set('option.general_choice', 'under max level');
	}
	// END

	this._remind(180, 'tokens');// Gain more tokens every 5 minutes
	if (this.runtime.start && this.runtime.start > now) {
		this._remind((this.runtime.start - now) / 1000, 'start');
	}
	if (this.runtime.finish && this.runtime.finish > now) {
		this._remind((this.runtime.finish - now) / 1000, 'finish');
	}
	if (this.runtime.status === 'fight' && this.runtime.finish - this.option.safety > now) {
		this._remind((this.runtime.finish - this.option.safety - now) / 1000, 'fight');
	}
	this._trigger('#app46755028429_guild_token_current_value', 'tokens'); //fix
};

Festival.parse = function(change) {
	var now = Date.now(), tmp, i;
	switch (Page.page) {
		case 'festival_guild':
			tmp = $('#app46755028429_current_battle_info').text();
			if (tmp.indexOf('BATTLE NOW!') > -1) {
				if (this.runtime.status !== 'fight' && this.runtime.status !== 'start') {
					this.set(['runtime','status'], 'start');
				}
			} else {
				this.set(['runtime','status'], tmp.indexOf('COLLECT') > -1 ? 'collect' : 'wait');
				this._forget('finish');
				i = tmp.indexOf('HOURS') > -1 ? tmp.regex(/(\d+) HOURS/i) * 3600 
						: tmp.indexOf('MINS') > -1 ? tmp.regex(/(\d+) MINS/i) * 60 : 180;
				this._forget('finish');
				this.set(['runtime','start'], i*1000 + now);
				this._remind(i , 'start');
			}
			break;
		case 'festival_guild_battle':
			this.set(['runtime','tokens'], ($('#app46755028429_guild_token_current_value').text() || '10').regex(/(\d+)/));//fix
			this._remind(($('#app46755028429_guild_token_time_value').text() || '5:00').parseTimer(), 'tokens');//fix
			i = $('#app46755028429_monsterTicker').text().parseTimer();
			if ($('input[src*="arena3_collectbutton.gif"]').length) {
				this.set(['runtime','status'], 'collect');
			} else if (i === 9999) {
				this.set(['runtime','status'], 'wait');
				this.set(['runtime','start'], 3600000 + now);
				this._remind(3600 , 'start');
			} else {
				this.set(['runtime','status'], 'fight');
				this.set(['runtime','finish'], (i * 1000) + now);
				this._remind(i, 'finish');
			}
			tmp = $('#app46755028429_results_main_wrapper');
			if (tmp.length) {
				i = tmp.text().regex(/\+(\d+) \w+ Activity Points/i);
				if (isNumber(i)) {
					History.add('festival', i);
					History.add('festival_count', 1);
					this._notify('data');// Force dashboard update
				}
			}
			if ($('img[src*="battle_defeat"]').length && this.runtime.last) {//fix
				this.set(['data',this.runtime.last], true);
			}
			this.set(['runtime','stunned'], !!$('#app46755028429_guild_battle_banner_section:contains("Status: Stunned")').length);//fix
			break;
	}
};

Festival.update = function(event) {
	var now = Date.now();
	if (event.type === 'reminder') {
		if (event.id === 'tokens') {
			this.set(['runtime','tokens'], Math.min(10, this.runtime.tokens + 1));
			if (this.runtime.tokens < 10) {
				this._remind(180, 'tokens');
			}
		} else if (event.id === 'start') {
			this.set(['runtime','status'], 'start');
		} else if (event.id === 'finish') {
			this.set(['runtime','status'], 'collect');
		}
	}
	if (event.type === 'trigger' && event.id === 'tokens') {
		if ($('#app46755028429_guild_token_current_value').length) {//fix
			this.set(['runtime','tokens'], $('#app46755028429_guild_token_current_value').text().regex(/(\d+)/) || 0);
		}
	}
	if (this.runtime.status === 'fight' && this.runtime.finish - this.option.safety > now) {
		this._remind((this.runtime.finish - this.option.safety - now) / 1000, 'fight');
	}
	if (!this.runtime.tokens) {
		this.set(['runtime','burn'], false);
	} else if (this.runtime.tokens >= 10 || (this.runtime.finish || 0) - this.option.safety <= now) {
		this.set(['runtime','burn'], true);
	}
	this.set(['option','_sleep'],
		   !(this.runtime.status === 'wait' && this.runtime.start <= now) // Should be handled by an event
		&& !(this.runtime.status === 'start' && Player.get('stamina',0) >= 20 && this.option.start)
		&& !(this.runtime.status === 'fight' && this.runtime.tokens
			&& (!this.option.delay || this.runtime.finish - 3600000 >= now - this.option.delay)
			&& (this.option.tokens === 'min'
			|| (this.option.tokens === 'healthy' && (!this.runtime.stunned || this.runtime.burn))
			|| (this.option.tokens === 'max' && this.runtime.burn)))
		&& !(this.runtime.status === 'collect' && this.option.collect));
	Dashboard.status(this, 'Status: ' + this.temp.status[this.runtime.status] + (this.runtime.status === 'wait' ? ' (' + Page.addTimer('festival_start', this.runtime.start) + ')' : '') + (this.runtime.status === 'fight' ? ' (' + Page.addTimer('festival_start', this.runtime.finish) + ')' : '') + ', Tokens: ' + makeImage('arena', 'Festival Tokens') + ' ' + this.runtime.tokens + ' / 10');
};

Festival.work = function(state) {
	if (state) {
		if (this.runtime.status === 'wait') {
			if (!Page.to('festival_guild')) {
				return QUEUE_FINISH;
			}
		} else if (this.runtime.status !== 'fight' || Generals.to(this.option.general ? 'duel' : this.option.general_choice)) {
			if (Page.page !== 'festival_guild_battle') {
				if (Page.page !== 'festival_guild') {
					Page.to('festival_guild');
				} else {
					Page.click('img.imgButton[src*="festival_arena_enter.jpg"]');
				}
			} else {
				if (this.runtime.status === 'collect') {
					if (!$('input[src*="arena3_collectbutton.gif"]').length) {//fix
						Page.to('festival_guild');
					} else {
						console.log(log('Collecting Reward'));
						Page.click('input[src*="arena3_collectbutton.gif"]');//fix
					}
				} else if (this.runtime.status === 'start') {
					if ($('input[src*="guild_enter_battle_button.gif"]').length) {
						console.log(log('Entering Battle'));
						Page.click('input[src*="guild_enter_battle_button.gif"]');
					}
					this.set(['data'], {}); // Forget old "lose" list
				} else if (this.runtime.status === 'fight') {
					if ($('input[src*="guild_enter_battle_button.gif"]').length) {
						console.log(log('Entering Battle'));
						Page.click('input[src*="guild_enter_battle_button.gif"]');
					}
					var best = null, besttarget, besthealth, ignore = this.option.ignore && this.option.ignore.length ? this.option.ignore.split('|') : [];
					$('#app46755028429_enemy_guild_member_list_1 > div, #app46755028429_enemy_guild_member_list_2 > div, #app46755028429_enemy_guild_member_list_3 > div, #app46755028429_enemy_guild_member_list_4 > div').each(function(i,el){
					
						var test = false, cleric = false, i = ignore.length, $el = $(el), txt = $el.text().trim().replace(/\s+/g,' '), target = txt.regex(/^(.*) Level: (\d+) Class: ([^ ]+) Health: (\d+)\/(\d+) Status: ([^ ]+) \w+ Activity Points: (\d+)/i);
						// target = [0:name, 1:level, 2:class, 3:health, 4:maxhealth, 5:status, 6:activity]
						if (!target 
								|| (Festival.option.defeat && Festival.data 
									&& Festival.data[target[0]])
								|| (isNumber(Festival.option.limit) 
									&& target[1] > Player.get('level',0) + Festival.option.limit)) {
							return;
						}
						while (i--) {
							if (target[0].indexOf(ignore[i]) >= 0) {
								return;
							}
						}
						if (besttarget) {
							switch(Festival.option.order) {
								case 'level':		test = target[1] < besttarget[1];	break;
								case 'health':		test = target[3] < besttarget[3];	break;
								case 'maxhealth':	test = target[4] < besttarget[4];	break;
								case 'activity':	test = target[6] < besttarget[6];	break;
								case 'level2':		test = target[1] > besttarget[1];	break;
								case 'health2':		test = target[3] > besttarget[3];	break;
								case 'maxhealth2':	test = target[4] > besttarget[4];	break;
								case 'activity2':	test = target[6] > besttarget[6];	break;
							}
						}
						if (Festival.option.cleric) {
							cleric = target[2] === 'Cleric' && target[6] && (!best || besttarget[2] !== 'Cleric');
						}
						//console.log(log('cname ' + target[0] + ' cleric ' + cleric + ' test ' + test + ' bh ' + (best ? besttarget[3] : 'none') + ' candidate healt ' + target[3]));
						if ((target[3] && (!best || cleric)) || (target[3] >= 200 && (besttarget[3] < 200 || test))) {
							best = el;
							besttarget = target;
						}
					});
					if (best) {
						this.set(['runtime','last'], besttarget[0]);
						console.log(log('Attacking '+besttarget[0]+' with '+besttarget[3]+' health'));
						Page.click($('input[src*="monster_duel_button.gif"]', best));
					} else {
						this.set(['runtime','last'], null);
					}
				}
			}
		}
	}
	return QUEUE_CONTINUE;
};

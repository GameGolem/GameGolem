/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Workers, Worker, Config, Dashboard, History, Page, Queue, Resources,
	Generals, Player,
	APP, APPID, APPID_, PREFIX, userID, imagepath,
	isRelease, version, revision, Images, window, browser,
	LOG_ERROR, LOG_WARN, LOG_LOG, LOG_INFO, LOG_DEBUG, log,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	isArray, isFunction, isNumber, isObject, isString, isWorker
*//********** Worker.Guild() **********
* Build your guild army
* Auto-attack Guild targets
*/
var Guild = new Worker('Guild');

Guild.settings = {
	taint:true
};

Guild.defaults['castle_age'] = {
	pages:'battle_guild battle_guild_battle'
};

Guild.option = {
	general:true,
	general_choice:'any',
	start:false,
	collect:true,
	tokens:'min',
	safety:60000,
	order:'health',
	ignore:'',
	limit:'',
	cleric:false,
	active:true,
	live:true,
	suppress:false
};

Guild.runtime = {
	tokens:10,
	status:null, // wait, start, fight, collect
	start:0,
	finish:0,
	rank:0,
	points:0,
	burn:false,
	stunned:false
};

Guild.temp = {
	status:{
		none:'Unknown',
		wait:'Waiting for Next Battle',
		start:'Entering Battle',
		fight:'In Battle',
		collect:'Collecting Reward'
	},
	last:null // name of last target, .data[last] then we've lost so skip them
};

Guild.display = [
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
		label:'Automatically Join',
		checkbox:true
	},{
		id:'delay',
		label:'Join Delay',
		require:'start',
		select:{
			0:'None',
			60000:'1 minute',
			120000:'2 minutes',
			180000:'3 minutes',
			240000:'4 minutes',
			300000:'5 minutes'
		}
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
		select:{
			30000:'30 seconds',
			45000:'45 seconds',
			60000:'1 minute',
			90000:'1.5 minutes',
			120000:'2 minutes',
			150000:'2.5 minutes',
			180000:'3 minutes',
			240000:'4 minutes'
		}
	},{
		id:'order',
		label:'Attack',
		select:{
			health:'Lowest Health',
			level:'Lowest Level',
			maxhealth:'Lowest Max Health',
			activity:'Lowest Activity',
			health2:'Highest Health',
			level2:'Highest Level',
			maxhealth2:'Highest Max Health',
			activity2:'Highest Activity',
			levelactive:'Lowest Level with Activity',
			levelactive2:'Highest Level with Activity'
		}
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
		help:'This will attack active clerics first before considering others.'
		  + ' Note: this works in conjunction with Actives First, Live First'
		  + ' and the ordering preference.'
	},{
		id:'active',
		label:'Attack Actives First',
		checkbox:true,
		help:'This will attack active targets first before considering others.'
		  + ' Note: this works in conjunction with Clerics First, Live First'
		  + ' and the ordering preference.'
	},{
		id:'live',
		label:'Attack Live First',
		checkbox:true,
		help:'This will attack live targets first before considering others.'
		  + ' Note: this works in conjunction with Clerics First, Actives First'
		  + ' and the ordering preference.'
	},{
		id:'defeat',
		label:'Avoid Defeat',
		checkbox:true,
		help:"This will prevent you attacking targets against which you've been defeated."
	},{
		advanced:true,
		id:'suppress',
		label:'Suppress Actives',
		checkbox:true,
		help:'Continue to fight stunned active targets with remaining health.'
	},{
		advanced:true,
		id:'ignore',
		label:'Ignore Targets',
		text:true,
		help:'Ignore any targets with names containing these tags - use | to separate multiple tags'
	}
];

Guild.init = function() {
	var now = Date.now();

	// BEGIN: fix up "under level 4" generals
	if (this.option.general_choice === 'under level 4') {
		this.set('option.general_choice', 'under max level');
	}
	// END

	this._remind(6*60, 'tokens'); // Gain a token every 6 minutes
	if (this.runtime.start && this.runtime.start > now) {
		this._remindMs(this.runtime.start - now, 'start');
	}
	if (this.runtime.finish && this.runtime.finish > now) {
		this._remindMs(this.runtime.finish - now, 'finish');
	}
	if (this.runtime.status === 'fight' && this.runtime.finish - this.option.safety > now) {
		this._remindMs(this.runtime.finish - this.option.safety - now, 'fight');
	}
	this._trigger('#'+APPID_+'guild_token_current_value', 'tokens'); //fix
};

Guild.page = function(page, change) {
	var now = Date.now(), tmp, i;

	switch (page) {
	case 'battle_guild':
		if ($('input[src*="dragon_list_btn_2."]').length) {//fix
			this.set(['runtime','status'], 'collect');
			this._forget('finish');
			this.set(['runtime','start'], 30*60*1000 + now);
			this._remind(30*60, 'start');
		} else if ($('input[src*="dragon_list_btn_3."]').length) {
			if (this.runtime.status !== 'fight' && this.runtime.status !== 'start') {
				this.set(['runtime','status'], 'start');
			}
		} else {
			this._forget('finish');
			this.set(['runtime','start'], 30*60*1000 + now);
			this._remind(30*60, 'start');
			this.set(['runtime','status'], 'wait');
		}
		break;
	case 'battle_guild_battle':
		if ($('#guild_battle_banner_section:contains("You Must Be Apart of Either")').length) { 
			log(LOG_INFO, '# not our battle');
			Page.set('temp.page', null);
			return change;
		}
		this.set(['runtime','tokens'], ($('#'+APPID_+'guild_token_current_value').text() || '10').regex(/(\d+)/));//fix
		this._remind(($('#'+APPID_+'guild_token_time_value').text() || '5:00').parseTimer(), 'tokens');//fix
		i = $('#'+APPID_+'monsterTicker').text().parseTimer();
		tmp = $('input[src*="guild_battle_collectbtn_small."]'
		  + ',input[src*="arena3_collectbutton."]');
		if (tmp.length) {
			this.set(['runtime','status'], 'collect');
		} else if (i >= Date.HUGE) {
			this._forget('finish');
			this.set(['runtime','start'], 30*60*1000 + now);
			this._remind(30*60, 'start');
			this.set(['runtime','status'], 'wait');
		} else {
			this.set(['runtime','status'], 'fight');
			this.set(['runtime','finish'], i*1000 + now);
			this._remind(i, 'finish');
		}
		tmp = $('#'+APPID_+'results_main_wrapper');
		if (tmp.length) {
			i = tmp.text().regex(/\+(\d+) \w+ Activity Points/i);
			if (isNumber(i)) {
				History.add('guild', i);
				History.add('guild_count', 1);
				this._notify('data');// Force dashboard update
			}
		}
		if ($('img[src*="battle_defeat"]').length && this.temp.last) {//fix
			this.set(['data',this.temp.last], true);
		}
		this.set(['temp','last'], null);
		this.set(['runtime','stunned'], !!$('#'+APPID_+'guild_battle_banner_section:contains("Status: Stunned")').length);//fix
		break;
	}

	return change;
};

Guild.update = function(event, events) {
	var now = Date.now(), i, status;

	if (events.findEvent(null, 'trigger', 'tokens')) {
		if ((i = $('#'+APPID_+'guild_token_current_value')).length) {//fix
			this.set(['runtime','tokens'], i.text().regex(/(\d+)/) || 0);
		}
	}
	if (events.findEvent(null, 'reminder', 'tokens')) {
		this.set(['runtime','tokens'], Math.min(10, this.runtime.tokens + 1));
		if (this.runtime.tokens < 10) {
			this._remind(6*60, 'tokens');
		}
	}
	if (events.findEvent(null, 'reminder', 'start')) {
		if (this.runtime.status !== 'fight') {
			this.set(['runtime','status'], 'start');
		}
	}
	if (events.findEvent(null, 'reminder', 'finish')) {
		if (this.runtime.status !== 'wait') {
			this.set(['runtime','status'], 'collect');
		}
	}

	if (this.runtime.status === 'fight' && this.runtime.finish - this.option.safety > now) {
		this._remindMs(this.runtime.finish - this.option.safety - now, 'fight');
	}
	if (!this.runtime.tokens) {
		this.set(['runtime','burn'], false);
	} else if (this.runtime.tokens >= 10 || (this.runtime.finish || 0) - this.option.safety <= now) {
		this.set(['runtime','burn'], true);
	}

	this.set(['option','_sleep'],
		   Page.get('battle_guild')
		&& !(this.runtime.status === 'wait' && this.runtime.start <= now) // Should be handled by an event
		&& !(this.runtime.status === 'start' && Player.get('stamina',0) >= 20 && this.option.start)
		&& !(this.runtime.status === 'fight' && this.runtime.tokens
			&& (!this.option.delay || this.runtime.finish - 60*60*1000 >= now - this.option.delay)
				&& (this.option.tokens === 'min'
					|| (this.option.tokens === 'healthy' && (!this.runtime.stunned || this.runtime.burn))
					|| (this.option.tokens === 'max' && this.runtime.burn)))
		&& !(this.runtime.status === 'collect' && this.option.collect));

	status = this.get('runtime.status', 'wait');

	Dashboard.status(this, 'Status: ' + this.temp.status[status]
	  + (status === 'wait' ? ' (' + Page.addTimer('guild_start', this.runtime.start) + ')' : '')
	  + (status === 'fight' ? ' (' + Page.addTimer('guild_start', this.runtime.finish) + ')' : '')
	  + ', Tokens: ' + Config.makeImage('guild', 'Guild Stamina') + ' ' + this.runtime.tokens + ' / 10'
	);

	return true;
};

Guild.work = function(state) {
	var i, j, tmp, txt, skip, test, cleric, target, targetla, ignore,
		best, besttarget, besttargetla, level, tokens;

	if (state) {
		if (!Page.get('battle_guild')
		  || this.get('runtime.status', 'wait') === 'wait'
		) {
			if (!Page.to('battle_guild')) {
				return QUEUE_FINISH;
			}
		} else if (this.runtime.status !== 'fight'
		  || Generals.to(this.option.general ? 'duel' : this.option.general_choice)
		) {
			if (Page.temp.page !== 'battle_guild_battle') {
				if (Page.temp.page !== 'battle_guild') {
					Page.to('battle_guild');
				} else {
					tmp = $('input[src*="dragon_list_btn_3."]'
					  + ',input[src*="dragon_list_btn_2."]');
					if (!tmp.length) {
						this.set('runtime.status', 'wait');
					} else if (!Page.click(tmp[0])) {
						log(LOG_INFO, "Can't click enter button, bailing.");
					}
					return QUEUE_FINISH;
				}
			} else {
				if (this.runtime.status === 'collect') {
					tmp = $('input[src*="guild_battle_collectbtn_small."]'
					  + ',input[src*="arena3_collectbutton."]');
					if (!tmp.length) {
						Page.to('battle_guild');
					} else {
						log('Collecting Reward');
						Page.click(tmp[0]);
					}
				} else if (this.runtime.status === 'start') {
					tmp = $('input[src*="guild_enter_battle_button."]');
					if (tmp.length) {
						log('Entering Battle');
						Page.click(tmp[0]);
					}
					this.set(['data'], {}); // Forget old "lose" list
				} else if (this.runtime.status === 'fight') {
					tmp = $('input[src*="guild_enter_battle_button."]');
					if (tmp.length) {
						log('Entering Battle');
						Page.click(tmp[0]);
						return QUEUE_CONTINUE;
					}
					ignore = this.option.ignore && this.option.ignore.length ? this.option.ignore.split('|') : [];
					level = Player.get('level', 1, 'number');
					tokens = this.get(['runtime','tokens'], 0, 'number');
					best = null;
					besttarget = null;
					tmp = $('#'+APPID_+'enemy_guild_member_list_1 > div'
					  + ', #'+APPID_+'enemy_guild_member_list_2 > div'
					  + ', #'+APPID_+'enemy_guild_member_list_3 > div'
					  + ', #'+APPID_+'enemy_guild_member_list_4 > div');
					for (i = 0; i < tmp.length; i++) {
						txt = tmp.eq(i).text().trim().replace(/\s+/g,' ');
						target = txt.regex(/^(.*) Level *: (\d+) Class *: ([^ ]+) Health *: (\d+)\/(\d+) Status *: ([^ ]+) \w+ Points *: (\d+)/);
						// target = [0:name, 1:level, 2:class, 3:health, 4:maxhealth, 5:status, 6:activity]
						if (!target
						  || (this.option.defeat && this.data[target[0]])
						  || (isNumber(this.option.limit)
						  && target[1] > level + this.option.limit)
						) {
							continue;
						}
						skip = false;
						for (j = ignore.length - 1; j >= 0; j--) {
							if (target[0].indexOf(ignore[j]) >= 0) {
								skip = true;
								break;
							}
						}
						if (skip) {
							continue;
						}
						test = false;
						if (besttarget) {
							switch (this.option.order) {
							case 'level':		test = target[1] < besttarget[1];	break;
							case 'health':		test = target[3] < besttarget[3];	break;
							case 'maxhealth':	test = target[4] < besttarget[4];	break;
							case 'activity':	test = target[6] < besttarget[6];	break;
							case 'level2':		test = target[1] > besttarget[1];	break;
							case 'health2':		test = target[3] > besttarget[3];	break;
							case 'maxhealth2':	test = target[4] > besttarget[4];	break;
							case 'activity2':	test = target[6] > besttarget[6];	break;
							case 'levelactive':
								besttargetla = besttarget[1];
								if (besttarget[6]) {
									besttargetla = -1.0/besttargetla;
								}
								targetla = target[1];
								if (target[6]) {
									targetla = -1.0/targetla;
								}
								test = targetla < besttargetla;
								break;
							case 'levelactive2':
								besttargetla = besttarget[1];
								if (!besttarget[6]) {
									besttargetla = -1.0/besttargetla;
								}
								targetla = target[1];
								if (!target[6]) {
									targetla = -1.0/targetla;
								}
								test = targetla > besttargetla;
								break;
							}
						}
						cleric = false;
						if (this.option.cleric) {
							cleric = target[2] === 'Cleric' && target[6] && (!best || besttarget[2] !== 'Cleric');
						}
						if (((tokens >= 10 || (this.option.suppress && target[6])) ? target[3] : target[3] >= 200)
						  && (!best
						  || cleric
						  || (this.option.active && target[6] && !besttarget[6])
						  || (this.option.live && target[3] >= 200 && besttarget[3] < 200)
						  || test)
						) {
							log(LOG_INFO, '# ' + (best ? '' : 'initial ')
							  + 'best.' + i + ':'
							  + ' ' + (target[6] ? 'active' : 'inactive')
							  + ' ' + target[1] + '/' + target[2]
							  + ' ' + target[3] + '/' + target[4]
							  + ' ' + target[0]
							);
							best = tmp.el(i);
							besttarget = target;
						}
					}
					if (!best && tmp.length) {
						// cheap and dirty gate change hack
						j = tmp.length;
						i = tmp.closest('div[id^="enemy_guild_member_list_"]').attr('id').regex(/enemy_guild_member_list_(\d+)/i);
						tmp = $('#'+APPID_+'enemy_guild_tab_'+(i+1)+'.imgButton');
						if (tmp.length && Page.click(tmp[0])) {
							log(LOG_INFO, 'No targets, trying gate ' + (i+1));
							return QUEUE_CONTINUE;
						} else {
							log(LOG_INFO, 'No targets, no next gate ('+j+')');
							return QUEUE_FINISH;
						}
					} else if (best) {
						log('Attacking'
						  + ' ' + (besttarget[6] ? 'active' : 'inactive')
						  + ' ' + besttarget[1] + '/' + besttarget[2]
						  + ' ' + besttarget[3] + '/' + besttarget[4]
						  + ' ' + besttarget[0]
						);
						tmp = $('input[src*="monster_duel_button."]', best);
						if (!tmp.length) {
							log(LOG_INFO, "Can't find button, backing out.");
							Page.to('battle_guild');
						} else if (!Page.click(tmp[0])) {
							log(LOG_INFO, "Can't click button, backing out.");
							Page.to('battle_guild');
							this.set(['temp','last'], null);
						} else {
							this.set(['temp','last'], besttarget[0]);
						}
					} else {
						log(LOG_INFO, 'No targets, no next gate (0)');
					}
				}
			}
		}
	}

	return QUEUE_CONTINUE;
};

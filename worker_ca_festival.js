/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Workers, Worker, Config, Dashboard, History, Page, Queue, Resources,
	Generals, Player,
	APP, APPID, APPID_, PREFIX, userID, imagepath,
	isRelease, version, revision, Images, window, browser,
	LOG_ERROR, LOG_WARN, LOG_LOG, LOG_INFO, LOG_DEBUG, log,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	isArray, isFunction, isNumber, isObject, isString, isWorker
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
	order:'health',
	ignore:'',
	limit:'',
	cleric:false,
	active:true,
	live:true,
	suppress:false
};

Festival.runtime = {
	tokens:10,
	status:null, // wait, start, fight, collect
	start:0,
	finish:0,
	rank:0,
	points:0,
	burn:false,
	stunned:false
};

Festival.temp = {
	status:{
		none:'Unknown',
		wait:'Waiting for Next Battle',
		start:'Entering Battle',
		fight:'In Battle',
		collect:'Collecting Reward'
	},
	last:null // name of last target, .data[last] then we've lost so skip them
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
		select:{health:'Lowest Health', level:'Lowest Level', maxhealth:'Lowest Max Health', activity:'Lowest Activity', health2:'Highest Health', level2:'Highest Level', maxhealth2:'Highest Max Health', activity2:'Highest Activity', levelactive:'Lowest Level with Activity', levelactive2:'Highest Level with Activity'}
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

Festival.init = function() {
	var now = Date.now();

	// BEGIN: fix up "under level 4" generals
	if (this.option.general_choice === 'under level 4') {
		this.set('option.general_choice', 'under max level');
	}
	// END

	this._remind(300, 'tokens');// Gain more tokens every 5 minutes
	if (this.runtime.start && this.runtime.start > now) {
		this._remind((this.runtime.start - now) / 1000, 'start');
	}
	if (this.runtime.finish && this.runtime.finish > now) {
		this._remind((this.runtime.finish - now) / 1000, 'finish');
	}
	if (this.runtime.status === 'fight' && this.runtime.finish - this.option.safety > now) {
		this._remind((this.runtime.finish - this.option.safety - now) / 1000, 'fight');
	}
	this._trigger('#'+APPID_+'guild_token_current_value', 'tokens'); //fix
};

Festival.page = function(page, change) {
	var now = Date.now(), tmp, i;
	switch (page) {
	case 'festival_guild':
		tmp = $('#'+APPID_+'current_battle_info').text();
		if (tmp.indexOf('BATTLE NOW!') > -1) {
			if (this.runtime.status !== 'fight' && this.runtime.status !== 'start') {
				this.set(['runtime','status'], 'start');
			}
		} else {
			this.set(['runtime','status'], tmp.indexOf('COLLECT') > -1 ? 'collect' : 'wait');
			this._forget('finish');
			i = tmp.indexOf('HOURS') > -1 ? tmp.regex(/(\d+) HOURS/i) * 3600
					: tmp.indexOf('MINS') > -1 ? tmp.regex(/(\d+) MINS/i) * 60 : 300;
			this._forget('finish');
			this.set(['runtime','start'], i*1000 + now);
			this._remind(i , 'start');
		}
		break;
	case 'festival_guild_battle':
		this.set(['runtime','tokens'], ($('#'+APPID_+'guild_token_current_value').text() || '10').regex(/(\d+)/));//fix
		this._remind(($('#'+APPID_+'guild_token_time_value').text() || '5:00').parseTimer(), 'tokens');//fix
		i = $('#'+APPID_+'monsterTicker').text().parseTimer();
		tmp = $('input[src*="guild_battle_collectbtn_small."]'
		  + ',input[src*="arena3_collectbutton."]');
		if (tmp.length) {
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
		tmp = $('#'+APPID_+'results_main_wrapper');
		if (tmp.length) {
			i = tmp.text().regex(/\+(\d+) \w+ Activity Points/i);
			if (isNumber(i)) {
				History.add('festival', i);
				History.add('festival_count', 1);
				this._notify('data');// Force dashboard update
			}
		}
		if ($('img[src*="battle_defeat"]').length) {//fix
			if (this.temp.last) {
				this.set(['data',this.temp.last], true);
			}
			this.set(['temp','last'], null);
		} else if ($('img[src*="battle_victory"]').length) {
			this.set(['temp','last'], null);
		}
		this.set(['runtime','stunned'], !!$('#'+APPID_+'guild_battle_banner_section:contains("Status: Stunned")').length);//fix
		break;
	}
	return change;
};

Festival.update = function(event) {
	var now = Date.now(), status;
	if (event.type === 'reminder') {
		if (event.id === 'tokens') {
			this.set(['runtime','tokens'], Math.min(10, this.runtime.tokens + 1));
			if (this.runtime.tokens < 10) {
				this._remind(300, 'tokens');
			}
		} else if (event.id === 'start') {
			this.set(['runtime','status'], 'start');
		} else if (event.id === 'finish') {
			this.set(['runtime','status'], 'collect');
		}
	}
	if (event.type === 'trigger' && event.id === 'tokens') {
		if ($('#'+APPID_+'guild_token_current_value').length) {//fix
			this.set(['runtime','tokens'], $('#'+APPID_+'guild_token_current_value').text().regex(/(\d+)/) || 0);
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
		   Page.get('festival_guild')
		&& !(this.runtime.status === 'wait' && this.runtime.start <= now) // Should be handled by an event
		&& !(this.runtime.status === 'start' && Player.get('stamina',0) >= 20 && this.option.start)
		&& !(this.runtime.status === 'fight' && this.runtime.tokens
			&& (!this.option.delay || this.runtime.finish - 3600000 >= now - this.option.delay)
			&& (this.option.tokens === 'min'
			|| (this.option.tokens === 'healthy' && (!this.runtime.stunned || this.runtime.burn))
			|| (this.option.tokens === 'max' && this.runtime.burn)))
		&& !(this.runtime.status === 'collect' && this.option.collect));
	status = this.get('runtime.status', 'wait');
	Dashboard.status(this, 'Status: ' + this.temp.status[status] + (status === 'wait' ? ' (' + Page.addTimer('festival_start', this.runtime.start) + ')' : '') + (status === 'fight' ? ' (' + Page.addTimer('festival_start', this.runtime.finish) + ')' : '') + ', Tokens: ' + Config.makeImage('arena', 'Festival Tokens') + ' ' + this.runtime.tokens + ' / 10');
};

Festival.work = function(state) {
	var i, j, tmp, txt, skip, test, cleric, target, targetla, ignore,
		best, besttarget, besttargetla, level, tokens;

	if (state) {
		if (!Page.get('festival_guild')
		  || this.get('runtime.status', 'wait') === 'wait'
		) {
			if (!Page.to('festival_guild')) {
				return QUEUE_FINISH;
			}
		} else if (this.runtime.status !== 'fight'
		  || Generals.to(this.option.general ? 'duel' : this.option.general_choice)
		) {
			if (Page.temp.page !== 'festival_guild_battle') {
				if (Page.temp.page !== 'festival_guild') {
					Page.to('festival_guild');
				} else {
					tmp = $('img.imgButton[src*="festival_arena_enter."]');
					if (tmp.length && Page.click(tmp[0])) {
						this.set('runtime.status', 'wait');
						return QUEUE_FINISH;
					} else {
						log(LOG_INFO, "Can't find enter button, backing out.");
						Page.to('festival_guild');
					}
				}
			} else {
				if (this.runtime.status === 'collect') {
					tmp = $('input[src*="guild_battle_collectbtn_small."]'
					  + ',input[src*="arena3_collectbutton."]');
					if (!tmp.length) {
						Page.to('festival_guild');
					} else {
						log('Collecting Reward');
						Page.click(tmp[0]);
					}
				} else if (this.runtime.status === 'start') {
					tmp = $('input[src*="guild_enter_battle_button."]');
					if (tmp.length) {
						log('Entering Battle');
						Page.click(tmp[0]);
						this.set(['data'], {}); // Forget old "lose" list
					}
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
						//if ((target[3] && (!best || cleric)) || ((target[3] >= 200 || (this.option.suppress && target[3] && target[6])) && ((besttarget[3] < 200 && !(this.option.suppress && besttarget[3] && besttarget[6])) || test)))
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
						tmp = $('#'+APPID_+'enemy_arena_tab_'+(i+1)+'.imgButton');
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
							log(LOG_INFO, "Can't find button, so backing out.");
							Page.to('festival_guild');
						} else if (!Page.click(tmp[0])) {
							log(LOG_INFO, "Can't click button, so backing out.");
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

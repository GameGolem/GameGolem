/********** Worker.Arena() **********
* Build your arena army
* Auto-attack Arena targets
*/
var Arena = new Worker('Arena', 'index battle_arena battle_arena_battle');
Arena.data = null;

Arena.defaults['castle_age'] = {};

Arena.option = {
	general:true,
	general_choice:'any',
	start:false,
	collect:true,
	tokens:'min',
	safety:60000
};

Arena.runtime = {
	tokens:10,
	status:'none',// none, wait, start, fight, collect
	last:0,
	start:0,
	finish:0,
	rank:0,
	points:0
};

Arena.temp = {
	status:{
		none:'Unknown',
		wait:'Waiting for Next Battle',
		start:'Entering Battle',
		fight:'In Battle',
		collect:'Collecting Reward'
	},
	rank:[
		'None',
		'Brawler',
		'Swordsman',
		'Warrior',
		'Gladiator',
		'Hero',
		'Annihilator',
		'Alpha Annihilator'
	]
};

Arena.display = [
	{
		id:'general',
 		label:'Use Best General',
		checkbox:true
	},{
		advanced:true,
		id:'general_choice',
		label:'Use General',
		require:{'general':false},
		select:'generals'
	},{
		id:'start',
 		label:'Automatically Start',
		checkbox:true
	},{
		id:'collect',
 		label:'Collect Rewards',
		checkbox:true
	},{
		id:'tokens',
		label:'Use Tokens',
		select:{min:'Immediately', max:'Save Up'}
	},{
		is:'safety',
		label:'Safety Margin',
		select:{30000:'30 Seconds',60000:'60 Seconds',90000:'90 Seconds'}
	}
];

Arena.init = function() {
	var now = Date.now();
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
	this._trigger('#app'+APPID+'_guild_token_current_value', 'tokens');
};

Arena.parse = function(change) {
	var now = Date.now(), tmp, i;
	switch (Page.page) {
		case 'index':
			this.set(['runtime','tokens'], ($('#app'+APPID+'_arena_token_current_value').text() || '0').regex(/([0-9]+)/));
			break;
		case 'battle_arena':
			this.set(['runtime','tokens'], ($('#app'+APPID+'_guild_token_current_value').text() || '0').regex(/([0-9]+)/));
			this._remind(($('#app'+APPID+'_guild_token_time_value').text() || '5:00').parseTimer(), 'tokens');
			tmp = $('#app'+APPID+'_arena_banner').next().next().text();
			if (tmp.indexOf('Collect') !== -1) {
				if (this.runtime.status === 'fight') {
					this.set(['runtime','status'], 'collect');
				}
				i = tmp.regex(/Time Remaining: ([0-9]+:[0-9]+:[0-9]+)/i).parseTimer();
				this.set(['runtime','start'], i * 1000 + now);
				this._remind(i, 'start');
			} else if (this.runtime.status !== 'fight' && this.runtime.status !== 'start' && tmp.indexOf('Remaining') !== tmp.lastIndexOf('Remaining')) {
				this.set(['runtime','status'], 'start');
			}
			tmp = $('img[src*="arena3_rank"]');
			if (tmp.length) {
				this.set(['runtime','rank'], tmp.attr('src').regex(/arena3_rank([0-9]+)\.gif/i));
				this.set(['runtime','points'], parseInt(tmp.parent().next().next().text().regex(/Points: ([0-9,]+)/i).replace(/,/g,'')));
			}
			break;
		case 'battle_arena_battle':
			this.set(['runtime','tokens'], ($('#app'+APPID+'_guild_token_current_value').text() || '0').regex(/([0-9]+)/));
			this._remind(($('#app'+APPID+'_guild_token_time_value').text() || '5:00').parseTimer(), 'tokens');
			if ($('input[src*="arena3_collectbutton.gif"]').length) {
				this.set(['runtime','status'], 'collect');
			}
			i = ($('#app'+APPID+'_monsterTicker').text() || '0').parseTimer();
			this.set(['runtime','finish'], i * 1000 * now);
			this._remind(i, 'finish');
			break;
	}
};

Arena.update = function(event) {
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
		if ($('#app'+APPID+'_guild_token_current_value').length) {
			this.set(['runtime','tokens'], $('#app'+APPID+'_guild_token_current_value').text().regex(/([0-9]+)/) || 0);
		}
	}
	if (this.runtime.status === 'fight' && this.runtime.finish - this.option.safety > now) {
		this._remind((this.runtime.finish - this.option.safety - now) / 1000, 'fight');
	}
	this.set(['option','_sleep'],
		   !(this.runtime.status === 'wait' && this.runtime.start <= now) // Should be handled by an event
		&& !(this.runtime.status === 'start' && Player.get('stamina',0) >= 20 && this.option.start)
		&& !(this.runtime.status === 'fight'
			&& ((this.option.tokens === 'min' && this.runtime.tokens)
			|| (this.runtime.tokens === 'max' && (this.runtime.tokens === 10 || (this.runtime.tokens && (this.runtime.finish || 0) - this.option.safety <= now)))))
		&& !(this.runtime.status === 'collect' && this.option.collect));
	Dashboard.status(this, 'Rank: ' + this.temp.rank[this.runtime.rank] + (this.runtime.rank ? ' (' + this.runtime.points.addCommas() + ' points)' : '') + ', Status: ' + this.temp.status[this.runtime.status] + (this.runtime.status === 'wait' ? ' (<span class="golem-time" name="' + this.runtime.start + '">' + makeTimer((this.runtime.start - now) / 1000) + '</span>)' : '') + (this.runtime.status === 'fight' ? ' (<span class="golem-time" name="' + this.runtime.finish + '">' + makeTimer((this.runtime.finish - now) / 1000) + '</span>)' : '') + ', Tokens: ' + makeImage('arena', 'Arena Tokens') + ' ' + this.runtime.tokens + ' / 10');
}

Arena.work = function(state) {
	if (state) {
		if (this.runtime.status !== 'fight' || Generals.to(this.option.general ? 'duel' : this.option.general_choice)) {
			if (Page.page !== 'battle_arena_battle') {
				if (Page.page !== 'battle_arena') {
					Page.to('battle_arena');
				} else {
					Page.click('input[src*="battle_enter_battle.gif"]');
				}
			} else {
				if (this.runtime.status === 'collect') {
					Page.click('input[src*="arena3_collectbutton.gif"]');
					this.set(['runtime','status'], 'wait');
				} else if (this.runtime.status === 'start') {
					Page.click('input[src*="guild_enter_battle_button.gif"]');
					this.set(['runtime','status'], 'fight');
				} else if (this.runtime.status === 'fight') {
					var best = null, bestname, besthealth;
					$('#app'+APPID+'_enemy_guild_member_list_1 > div, #app'+APPID+'_enemy_guild_member_list_2 > div, #app'+APPID+'_enemy_guild_member_list_3 > div, #app'+APPID+'_enemy_guild_member_list_4 > div').each(function(i,el){
						var $el = $(el), txt = $el.text().trim().replace(/\s+/g,' '), health = (txt.regex(/Health: ([0-9]+)\//i) || 0);
						if ((health && !best) || (health >= 200 && (besthealth < 200 || health < besthealth))) {
							best = el;
							besthealth = health;
							bestname = txt.regex(/^(.*) Level:/i);
						}
					});
					if (best) {
						console.log(log('Attacking '+bestname+' with '+besthealth+' health'));
						Page.click($('input[src*="monster_duel_button.gif"]', best));
					}
				}
			}
		}
	}
	return QUEUE_CONTINUE;
};


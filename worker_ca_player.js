/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page, Queue, Resources, Window,
	Bank, Battle, Generals, LevelUp, Player:true, Title,
	APP, APPID, log, debug, script_started, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, Divisor, length, unique, deleteElement, sum, findInArray, findInObject, objectIndex, sortObject, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
	makeImage
*/
/********** Worker.Player **********
* Gets all current stats we can see
*/
var Player = new Worker('Player');
Player.option = Player.runtime = Player.temp = null;

Player.settings = {
	keep:true
};

Player.defaults['castle_age'] = {
	pages:'*'
};

Player.setup = function() {
	Resources.add('Energy');
	Resources.add('Stamina');
	Resources.add('Gold');
};

Player.init = function() {
	this._trigger('#app46755028429_gold_current_value', 'cash');
	this._trigger('#app46755028429_energy_current_value', 'energy');
	this._trigger('#app46755028429_stamina_current_value', 'stamina');
	this._trigger('#app46755028429_health_current_value', 'health');
	this._trigger('#app46755028429_gold_time_value', 'cash_timer');
	Title.alias('energy', 'Player:data.energy');
	Title.alias('maxenergy', 'Player:data.maxenergy');
	Title.alias('health', 'Player:data.health');
	Title.alias('maxhealth', 'Player:data.maxhealth');
	Title.alias('stamina', 'Player:data.stamina');
	Title.alias('maxstamina', 'Player:data.maxstamina');
	Title.alias('myname', 'Player:data.myname');
	Title.alias('level', 'Player:data.level');
	Title.alias('exp_needed', 'Player:exp_needed');
	Title.alias('bsi', 'Player:bsi');
	Title.alias('lsi', 'Player:lsi');
	Title.alias('csi', 'Player:csi');
	// function gold_increase_ticker(ticks_left, stat_current, tick_time, increase_value, first_call)
	this.set('cash_time', script_started + ($('*').html().regex(/gold_increase_ticker\((\d+),/) * 1000));
};

Player.parse = function(change) {
	if (change) {
		return false;
	}
	if (!('#app46755028429_main_bntp').length) {
		Page.reload();
		return;
	}
	var i, data = this.data, keep, stats, tmp, $tmp, artifacts = {};
	if ($('#app46755028429_energy_current_value').length) {
		this.set('energy', $('#app46755028429_energy_current_value').text().regex(/(\d+)/) || 0);
		Resources.add('Energy', data.energy, true);
	}
	if ($('#app46755028429_stamina_current_value').length) {
		this.set('stamina', $('#app46755028429_stamina_current_value').text().regex(/(\d+)/) || 0);
		Resources.add('Stamina', data.stamina, true);
	}
	if ($('#app46755028429_health_current_value').length) {
		this.set('health', $('#app46755028429_health_current_value').text().regex(/(\d+)/) || 0);
	}
	if ($('#app46755028429_st_2_5 strong:not([title])').length) {
		tmp = $('#app46755028429_st_2_5').text().regex(/(\d+)\s*\/\s*(\d+)/);
		if (tmp) {
			this.set('exp', tmp[0]);
			this.set('maxexp', tmp[1]);
		}
	}
	this.set('cash', $('#app46755028429_gold_current_value').text().replace(/\D/g, '').regex(/(\d+)/));
	this.set('level', $('#app46755028429_st_5').text().regex(/Level: (\d+)!/i));
	this.set('armymax', $('a[href*=army.php]', '#app46755028429_main_bntp').text().regex(/(\d+)/));
	this.set('army', Math.min(data.armymax, 501)); // XXX Need to check what max army is!
	this.set('upgrade', $('a[href*=keep.php]', '#app46755028429_main_bntp').text().regex(/(\d+)/) || 0);
	this.set('general', $('div.general_name_div3').first().text().trim());
	this.set('imagepath', $('#app46755028429_globalContainer img:eq(0)').attr('src').pathpart());
	if (Page.page==='keep_stats') {
		keep = $('.keep_attribute_section').first(); // Only when it's our own keep and not someone elses
		if (keep.length) {
			this.set('myname', $('div.keep_stat_title_inc > span', keep).text().regex(/"(.*)"/));
			this.set('rank', $('td.statsTMainback img[src*=rank_medals]').attr('src').filepart().regex(/(\d+)/));
			stats = $('div.attribute_stat_container', keep);
			this.set('maxenergy', $(stats).eq(0).text().regex(/(\d+)/));
			this.set('maxstamina', $(stats).eq(1).text().regex(/(\d+)/));
			this.set('attack', $(stats).eq(2).text().regex(/(\d+)/));
			this.set('defense', $(stats).eq(3).text().regex(/(\d+)/));
			this.set('maxhealth', $(stats).eq(4).text().regex(/(\d+)/));
			this.set('bank', parseInt($('td.statsTMainback b.money').text().replace(/\D/g,''), 10));
			stats = $('.statsTB table table:contains("Total Income")').text().replace(/[^0-9$]/g,'').regex(/(\d+)\$(\d+)\$(\d+)/);
			this.set('maxincome', stats[0]);
			this.set('upkeep', stats[1]);
			this.set('income', stats[2]);
			Resources.add('Gold', data.bank + data.cash, true);

			// remember artifacts - useful for quest requirements
			$tmp = $('.statsTTitle:contains("ARTIFACTS") + div div div a img');
			if ($tmp.length) {
				$tmp.each(function(i,el){
					if ((tmp = ($(el).attr('title') || $(el).attr('alt') || '').trim())) {
						artifacts[tmp] = $(el).attr('src').filepart();
					}
				});
				this.set(['data','artifact'], artifacts);
			}
		}
	}
	if (Page.page==='town_land') {
		stats = $('.mContTMainback div:last-child');
		this.set('income', stats.eq(stats.length - 4).text().replace(/\D/g,'').regex(/(\d+)/));
	}
	$('span.result_body').each(function(i,el){
		var txt = $(el).text().replace(/,|\s+|\n/g, '');
		History.add('income', sum(txt.regex(/Gain.*\$(\d+).*Cost|stealsGold:\+\$(\d+)|Youreceived\$(\d+)|Yougained\$(\d+)/i)));
		if (txt.regex(/incomepaymentof\$(\d+)gold/i)){
			History.set('land', sum(txt.regex(/incomepaymentof\$(\d+)gold|backinthemine:Extra(\d+)Gold|Yousuccessfullysold.*for$(\d+)/i)));
		}
	});
	this.set('worth', this.get('cash', 0) + this.get('bank', 0));
	$('#app46755028429_gold_current_value').attr('title', 'Cash in Bank: $' + this.get('bank', 0).addCommas());
	return false;
};

Player.update = function(event) {
	if (event.type === 'data' || event.type === 'init') {
		var i, j, types = ['stamina', 'energy', 'health'], list, step;
		for (j=0; j<types.length; j++) {
			list = [];
			step = Divisor(this.data['max'+types[j]]);
			for (i=0; i<=this.data['max'+types[j]]; i+=step) {
				list.push(i);
			}
			Config.set(types[j], list);
		}
		History.set('bank', this.data.bank);
		History.set('exp', this.data.exp);
	} else if (event.type === 'trigger') {
		if (event.id === 'cash_timer') {
			this.set(['data', 'cash_time'], (Math.floor(Date.now() / 1000) + $('#app46755028429_gold_time_value').text().parseTimer()) * 1000);
		} else {
			this.set(['data', event.id], $(event.selector).text().replace(/\D/g, '').regex(/(\d+)/));
			switch (event.id) {
				case 'energy':	Resources.add('Energy', this.data[event.id], true);	break;
				case 'stamina':	Resources.add('Stamina', this.data[event.id], true);	break;
				case 'cash':	Resources.add('Gold', this.data[event.id], true);	break;
			}
		}
	}
	Dashboard.status(this);
};

Player.get = function(what, def) {
	var data = this.data, when;
	switch(what) {
		case 'cash_timer':		return (data.cash_time - Date.now()) / 1000;
//		case 'cash_timer':		when = new Date();
//								return (3600 + data.cash_time - (when.getSeconds() + (when.getMinutes() * 60))) % 3600;
		case 'energy_timer':	return $('#app46755028429_energy_time_value').text().parseTimer();
		case 'health_timer':	return $('#app46755028429_health_time_value').text().parseTimer();
		case 'stamina_timer':	return $('#app46755028429_stamina_time_value').text().parseTimer();
		case 'exp_needed':		return data.maxexp - data.exp;
		case 'bank':			return (data.bank - Bank.option.keep > 0) ? data.bank - Bank.option.keep : 0;
		case 'bsi':				return ((data.attack + data.defense) / data.level).round(2);
		case 'lsi':				return (((data.maxstamina * 2) + data.maxenergy) / data.level).round(2);
		case 'csi':				return ((data.attack + data.defense + (data.maxstamina * 2) + data.maxenergy + data.maxhealth - 100) / data.level).round(2);
		default: return this._get(what, def);
	}
};


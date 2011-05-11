/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page, Queue, Resources, Window,
	Bank, Battle, Generals, LevelUp, Player:true, Title,
	APP, APPID, log, debug, script_started, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, Divisor, length, sum, findInObject, objectIndex, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
	makeImage
*/
/********** Worker.Player **********
* Gets all current stats we can see
*/
var Player = new Worker('Player');
Player.option = Player.runtime = Player.temp = null;

Player.settings = {
	keep:true,
	taint:true
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
	this._trigger('#'+APPID_+'gold_current_value', 'cash');
	this._trigger('#'+APPID_+'energy_current_value', 'energy');
	this._trigger('#'+APPID_+'stamina_current_value', 'stamina');
	this._trigger('#'+APPID_+'health_current_value', 'health');
	this._trigger('#'+APPID_+'gold_time_value', 'cash_timer');
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
	var i, data = this.data, keep, stats, tmp, $tmp, artifacts = {};
	if ($('#'+APPID_+'energy_current_value').length) {
		this.set('energy', $('#'+APPID_+'energy_current_value').text().regex(/(\d+)/) || 0);
		Resources.add('Energy', data.energy, true);
	}
	if ($('#'+APPID_+'stamina_current_value').length) {
		this.set('stamina', $('#'+APPID_+'stamina_current_value').text().regex(/(\d+)/) || 0);
		Resources.add('Stamina', data.stamina, true);
	}
	if ($('#'+APPID_+'health_current_value').length) {
		this.set('health', $('#'+APPID_+'health_current_value').text().regex(/(\d+)/) || 0);
	}
	if ($('#'+APPID_+'st_2_5 strong:not([title])').length) {
		tmp = $('#'+APPID_+'st_2_5').text().regex(/(\d+)\s*\/\s*(\d+)/);
		if (tmp) {
			this.set('exp', tmp[0]);
			this.set('maxexp', tmp[1]);
		}
	}
	this.set('cash', $('#'+APPID_+'gold_current_value').text().replace(/\D/g, '').regex(/(\d+)/));
	this.set('level', $('#'+APPID_+'st_5').text().regex(/Level: (\d+)!/i));
	this.set('armymax', $('a[href*=army.php]', '#'+APPID_+'main_bntp').text().regex(/(\d+)/));
	this.set('army', Math.min(data.armymax, 501)); // XXX Need to check what max army is!
	this.set('upgrade', $('a[href*=keep.php]', '#'+APPID_+'main_bntp').text().regex(/(\d+)/) || 0);
	this.set('general', $('div.general_name_div3').first().text().trim());
	this.set('imagepath', $('#'+APPID_+'globalContainer img:eq(0)').attr('src').pathpart());
	if (Page.page==='keep_stats') {
		keep = $('.keep_attribute_section').first(); // Only when it's our own keep and not someone elses
		if (keep.length) {
			this.set('myname', $('div.keep_stat_title_inc > span', keep).text().regex(/"(.*)"/));
			tmp = $('td.statsTMainback img[src*=rank_medals]');
			if (tmp.length) {
				this.set('battle',tmp.attr('src').filepart().regex(/(\d+)/));
			}
			tmp = $('td.statsTMainback img[src*=rank_medals_war]');
			if (tmp.length) {
				this.set('war', tmp.attr('src').filepart().regex(/(\d+)/));
			}
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
	} else if (Page.page === 'town_land') {
		$tmp = $('.layout div[style*="town_header_land."]');
		if ($tmp.length && ($tmp = $('div div:contains("Land Income:")', $tmp)).length) {
			var o = {};
			$('div', $tmp.last().parent()).each(function(a, el) {
				if (!o[a]) o[a] = {};
				o[a].label = ($(el).text() || '').trim();
			});
			$('div', $tmp.last().parent().next()).each(function(a, el) {
				if (!o[a]) o[a] = {};
				o[a].value = ($(el).text() || '').trim();
			});
			//log(LOG_WARN, 'Land.income: ' + JSON.shallow(o, 2));
			for (i in o) {
				if (o[i].label && o[i].value) {
					if (o[i].label.match(/Land Income:/i)) {
						if (isNumber(tmp = o[i].value.replace(/\D/g, '').regex(/(\d+)/))) {
							this.set('maxincome', tmp);
						}
					} else if (o[i].label.match(/Upkeep:/i)) {
						if (isNumber(tmp = o[i].value.replace(/\D/g, '').regex(/(\d+)/))) {
							this.set('upkeep', tmp);
						}
					} else if (o[i].label.match(/Income per Hour:/i)) {
						if (isNumber(tmp = o[i].value.replace(/\D/g, '').regex(/(\d+)/))) {
							this.set('income', tmp);
						}
					}
				}
			}
		}
	}
	$('span.result_body').each(function(i,el){
		var txt = $(el).text().replace(/,|\s+|\n/g, '');
		History.add('income', sum(txt.regex(/Gain.*\$(\d+).*Cost|stealsGold:\+\$(\d+)|Youreceived\$(\d+)|Yougained\$(\d+)/i)));
		if (txt.regex(/incomepaymentof\$(\d+)gold/i)){
			History.set('land', sum(txt.regex(/incomepaymentof\$(\d+)gold|backinthemine:Extra(\d+)Gold|Yousuccessfullysold.*for$(\d+)/i)));
		}
	});
	this.set('worth', this.get('cash', 0) + this.get('bank', 0));
	$('#'+APPID_+'gold_current_value').attr('title', 'Cash in Bank: $' + this.get('bank', 0).addCommas());
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
			if (types[j] === 'stamina') {
				step = this.data['max' + types[j]] || 10;
				for (i in { 1:1, 5:1, 10:1, 20:1, 50:1 }) {
					if (step >= i) {
						list.push(parseInt(i));
					}
				}
			} else if (types[j] === 'energy') {
				step = this.data['max' + types[j]] || 15;
				for (i in { 10:1, 20:1, 40:1, 100:1 }) {
					if (step >= i) {
						list.push(parseInt(i));
					}
				}
			} else if (types[j] === 'health') {
				step = this.data['max' + types[j]] || 100;
				for (i in { 1:1, 9:1, 10:1, 11:1, 12:1, 13:1 }) {
					if (step >= i) {
						list.push(parseInt(i));
					}
				}
			}
			Config.set(types[j], list.sort(function(a,b){return a-b;}).unique());
		}
		History.set('bank', this.data.bank);
		History.set('exp', this.data.exp);
	} else if (event.type === 'trigger') {
		if (event.id === 'cash_timer') {
			this.set(['data', 'cash_time'], (Math.floor(Date.now() / 1000) + $('#'+APPID_+'gold_time_value').text().parseTimer()) * 1000);
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
	var data = this.data;
	switch(what) {
		case 'cash_timer':		return (data.cash_time - Date.now()) / 1000;
		case 'energy_timer':	return $('#'+APPID_+'energy_time_value').text().parseTimer();
		case 'health_timer':	return $('#'+APPID_+'health_time_value').text().parseTimer();
		case 'stamina_timer':	return $('#'+APPID_+'stamina_time_value').text().parseTimer();
		case 'exp_needed':		return data.maxexp - data.exp;
		case 'bank':			return (data.bank - Bank.option.keep > 0) ? data.bank - Bank.option.keep : 0;
		case 'bsi':				return ((data.attack + data.defense) / data.level).round(2);
		case 'lsi':				return (((data.maxstamina * 2) + data.maxenergy) / data.level).round(2);
		case 'csi':				return ((data.attack + data.defense + (data.maxstamina * 2) + data.maxenergy + data.maxhealth - 100) / data.level).round(2);
		default: return this._get.apply(this, arguments);
	}
};


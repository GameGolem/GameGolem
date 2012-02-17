/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Workers, Config, Dashboard, History, Resources, Title,
	Bank,
	APP, APPID, APPID_, PREFIX, userID, imagepath, script_started,
	isRelease, version, revision, Images, window, browser,
	LOG_ERROR, LOG_WARN, LOG_LOG, LOG_INFO, LOG_DEBUG, log,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	isArray, isFunction, isNumber, isObject, isString, isWorker,
	Divisor, sum
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

Player.page = function(page, change) {
	var i, o, data = this.data, keep, stats, tmp, $tmp, b, icon, name;
	if (change) {
		if (page === 'keep_stats' && ($tmp = $('.keep_healer_section').first()).length) {
			tmp = '<table style="width:100%;"><thead><tr><td colspan="2" style="font-weight:bold;text-align:center;">Player Stats</td></tr></thead><tbody>' +
			'<tr title="Battle Strength Index: Attack + defense / level. This is a gauge of your strength in PvP relative to others of the same level. Often seems to be regarded as the length of your CA [censored] given the importance many people regard it with."><td>BSI:</td><td>' + this.get('bsi') + '</td></tr>' +
			'<tr title="Leveling Speed Index: 2X Stamina + energy / level. This is a gauge of how quickly you will level relative to others of the same level."><td>LSI:</td><td>' + this.get('lsi') + '</td></tr>' +
			'<tr title="Guild Battle Strength Index: Attack + defense + health - 100 / level. Health is no longer a waste with Guild battles."><td>GBSI:</td><td>' + this.get('gbsi') + '</td></tr>' +
			'<tr title="Skill Point Aquistion Efficiency Quotent: BSI + LSI + (Health -100) / level. This a overall gauge of your efficiency in playing Castle Age."><td>SPAEQ:</td><td>' + this.get('spaeq') + '</td></tr>' +
			'<tr title="Monster Hunting Build Effective Quotent: Attack + 2X Stamina / level. This is a gauge of how effective a monter hunter you are relative to others of the same level."><td>MHBEQ:</td><td>' + this.get('mhbeq') + '</td></tr>' +
			'<tr title="Attack + 0.7 * Defense"><td>Attack:</td><td>' + (data.attack + (0.7 * data.defense)).round(2) + '</td></tr>' +
			'<tr title="Defense + 0.7 * Attack"><td>Defense:</td><td>' + (data.defense + (0.7 * data.attack)).round(2) + '</td></tr>' +
			'<tr title="A label given to your build type."><td>Build:</td><td>' + this.get('build') + '</td></tr>' +
			'<tr title="A rough label given to the best way for you to level up."><td>Role:</td><td>' + this.get('role') + '</td></tr>' +
			'</tbody></table>';
			$tmp.append('<div style="margin:-238px 18px 2px 21px;height:213px;border:1px solid #8b5928;padding:10px;color:black;background-color:#b2804f;font-size:10px;">' + tmp + '</div>');
		}
	} else {
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
		this.set('armymax', $('a[href*="army.php"]', '#'+APPID_+'main_bntp').text().regex(/(\d+)/));
		this.set('army', Math.min(data.armymax, 501)); // XXX Need to check what max army is!
		this.set('upgrade', $('a[href*="keep.php"]', '#'+APPID_+'main_bntp').text().regex(/(\d+)/) || 0);
		this.set('general', $('#main_bn div[style*="general_plate."] > div').first().text().trim(true).replace(/\*+$/, ''));
		this.set('imagepath', $('#'+APPID_+'globalContainer img:eq(0)').attr('src').pathpart());
		if (page === 'keep_stats') {
			keep = $('.keep_attribute_section').first(); // Only when it's our own keep and not someone elses
			if (keep.length) {
				this.set('myname', $('div.keep_stat_title_inc > span', keep).text().regex(/"(.*)"/));
				tmp = $('td.statsTMainback img[src*="rank_medals"]');
				if (tmp.length) {
					this.set('battle',tmp.attr('src').filepart().regex(/(\d+)/));
				}
				tmp = $('td.statsTMainback img[src*="rank_medals_war"]');
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
				tmp = $('.statUnit', $('.statsT2 .statsTTitle:regex(^\\s*ARTIFACTS\\s*$)').parent());

				for (i = 0; i < tmp; i++) {
					b = $('a img[src]', tmp[i]);
					icon = ($(b).attr('src') || '').filepart();
					name = ($(b).attr('title') || $(b).attr('alt') || '').trim(true);
					name = this.qualify(name, icon, 'artifact', true); // artifacts should be unique...
					this.set(['data','artifact',name], icon);
				}
			}
		} else if (page === 'town_land') {
			$tmp = $('.layout div[style*="town_header_land."]');
			if ($tmp.length && ($tmp = $('div div:contains("Land Income:")', $tmp)).length) {
				o = {};
				$('div', $tmp.last().parent()).each(function(a, el) {
					if (!o[a]) { o[a] = {}; }
					o[a].label = ($(el).text() || '').trim(true);
				});
				$('div', $tmp.last().parent().next()).each(function(a, el) {
					if (!o[a]) { o[a] = {}; }
					o[a].value = ($(el).text() || '').trim(true);
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
	}
	return true;
};

Player.update = function(event) {
	var i, j, list, types, step, fn;

	if (event.type === 'data' || event.type === 'init') {
		types = ['stamina', 'energy', 'health'];
		fn = function(a, b) { return a - b; };
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
						list.push(parseInt(i, 10));
					}
				}
			} else if (types[j] === 'energy') {
				step = this.data['max' + types[j]] || 15;
				for (i in { 10:1, 20:1, 40:1, 100:1 }) {
					if (step >= i) {
						list.push(parseInt(i, 10));
					}
				}
			} else if (types[j] === 'health') {
				step = this.data['max' + types[j]] || 100;
				for (i in { 1:1, 9:1, 10:1, 11:1, 12:1, 13:1 }) {
					if (step >= i) {
						list.push(parseInt(i, 10));
					}
				}
			}
			Config.set(types[j], list.sort(fn).unique());
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
	var i, data = this.data;
	switch(what) {
		case 'cash_timer':		return (data.cash_time - Date.now()) / 1000;
		case 'energy_timer':	return $('#'+APPID_+'energy_time_value').text().parseTimer();
		case 'health_timer':	return $('#'+APPID_+'health_time_value').text().parseTimer();
		case 'stamina_timer':	return $('#'+APPID_+'stamina_time_value').text().parseTimer();
		case 'exp_needed':		return data.maxexp - data.exp;
		case 'bank':			return (data.bank - Bank.option.keep > 0) ? data.bank - Bank.option.keep : 0;
		case 'bsi':				return ((data.attack + data.defense) / data.level).round(2);
		case 'lsi':				return (((data.maxstamina * 2) + data.maxenergy) / data.level).round(2);
		case 'gbsi':			return ((data.attack + data.defense + data.maxhealth - 100) / data.level).round(2);
		case 'spaeq':			return ((data.attack + data.defense + (data.maxstamina * 2) + data.maxenergy + data.maxhealth - 100) / this.get('level')).round(2);
		case 'mhbeq':			return ((data.attack + (data.maxstamina * 2)) / data.level).round(2);
		case 'csi':				return ((data.attack + data.defense + (data.maxstamina * 2) + data.maxenergy + data.maxhealth - 100) / data.level).round(2);
		case 'build':			i = (data.attack / data.defense);
								return (i >= 10 ? 'Destroyer' : i >= 2 ? 'Aggressor' : i >= 1.1 ? 'Offensive' : i <= 0.9 ? 'Defensive' : i <= 0.5 ? 'Paladin' : i <= 0.1 ? 'Wall' : 'Balanced');
		case 'role':			i = (this.get('lsi') / this.get('bsi'));
								return (i >= 4 ? 'Leveller' : i >= 1.6 ? 'Hunter' : i >= 1.3 ? 'Hunter Hybrid' : i >= 0.75 ? 'Balanced Hybrid' : i >= 0.6 ? 'Strong Hybrid' : i >= 0.25 ? 'PvPer' : 'Pure PvPer');
		default: return this._get.apply(this, arguments);
	}
};


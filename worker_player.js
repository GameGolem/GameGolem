/********** Worker.Player **********
* Gets all current stats we can see
*/
var Player = new Worker('Player', '*', {keep:true});
Player.data = {};
Player.option = null;
Player.panel = null;

var use_average_level = false;

Player.init = function() {
	// Get the gold timer from within the page - should really remove the "official" one, and write a decent one, but we're about playing and not fixing...
	// gold_increase_ticker(1418, 6317, 3600, 174738470, 'gold', true);
	// function gold_increase_ticker(ticks_left, stat_current, tick_time, increase_value, first_call)
	var when = new Date(script_started + ($('*').html().regex(/gold_increase_ticker\(([0-9]+),/) * 1000));
	Player.data.cash_time = when.getSeconds() + (when.getMinutes() * 60);
};

Player.parse = function(change) {
	var data = this.data, keep, stats, tmp, energy_used = 0, stamina_used = 0;
	if (change) {
		$('#app'+APPID+'_st_2_5 strong').attr('title', data.exp + '/' + data.maxexp + ' at ' + addCommas(this.get('exp_average').round(1)) + ' per hour').html(addCommas(data.maxexp - data.exp) + '<span style="font-weight:normal;"> in <span class="golem-time" style="color:rgb(25,123,48);" name="' + this.get('level_time') + '">' + makeTimer(this.get('level_timer')) + '</span></span>');
		return true;
	}
	data.cash		= parseInt($('strong#app'+APPID+'_gold_current_value').text().replace(/[^0-9]/g, ''), 10);
	tmp = $('#app'+APPID+'_energy_current_value').parent().text().regex(/([0-9]+)\s*\/\s*([0-9]+)/);
	if (tmp[0] != data.energy) {
		energy_used = data.energy - tmp[0];
		LevelUp.runtime.leveltime = (Date.now()) + ((60*60*1000) * (((data.maxexp - data.exp) - (data.energy * (data.avgenergyexp || 0)) - (data.stamina * (data.avgstaminaexp || 0))) / (((12 * (data.avgenergyexp || 0)) + (12 * (data.avgstaminaexp || 0))) || 50))).round();
	}
	data.energy		= tmp[0] || 0;
	data.maxenergy	= tmp[1] || 0;
	tmp = $('#app'+APPID+'_health_current_value').parent().text().regex(/([0-9]+)\s*\/\s*([0-9]+)/);
	data.health		= tmp[0] || 0;
	data.maxhealth	= tmp[1] || 0;
	tmp = $('#app'+APPID+'_stamina_current_value').parent().text().regex(/([0-9]+)\s*\/\s*([0-9]+)/);
	if (tmp[0] != data.stamina) {
		stamina_used = data.stamina - tmp[0];
		LevelUp.runtime.leveltime = (Date.now()) + ((60*60*1000) * (((data.maxexp - data.exp) - (data.energy * (data.avgenergyexp || 0)) - (data.stamina * (data.avgstaminaexp || 0))) / (((12 * (data.avgenergyexp || 0)) + (12 * (data.avgstaminaexp || 0))) || 50))).round();
	}
	data.stamina	= tmp[0] || 0;
	data.maxstamina	= tmp[1] || 0;
	tmp = $('#app'+APPID+'_st_2_5').text().regex(/([0-9]+)\s*\/\s*([0-9]+)/);
	if (tmp[0] > data.exp) { // If experience has been gained, lets record how much was gained and how many points of energy/stamina were used and save an average weighted slighty towards recent results
		if (stamina_used > 0) {
			data.avgstaminaexp = ((((data.avgstaminaexp || 0) * Math.min((data.staminasamples || 0), 19)) + ((tmp[0] - data.exp)/stamina_used)) / Math.min((data.staminasamples || 0) + 1, 20)).round(3);
			data.staminasamples = Math.min((data.staminasamples || 0) + 1, 20);
			stamina_used = 0;
		} else if (energy_used > 0) {
			data.avgenergyexp = ((((data.avgenergyexp || 0) * Math.min((data.energysamples || 0), 19)) + (tmp[0] - data.exp)/energy_used) / Math.min((data.energysamples || 0) + 1, 20)).round(3);
			data.energysamples = Math.min((data.energysamples || 0) + 1, 20);
			energy_used = 0;
		}
	}
	data.exp		= tmp[0] || 0;
	data.maxexp		= tmp[1] || 0;
	data.level		= $('#app'+APPID+'_st_5').text().regex(/Level: ([0-9]+)!/i);
	data.armymax	= $('a[href*=army.php]', '#app'+APPID+'_main_bntp').text().regex(/([0-9]+)/);
	data.army		= Math.min(data.armymax, 501); // XXX Need to check what max army is!
	data.upgrade	= ($('a[href*=keep.php]', '#app'+APPID+'_main_bntp').text().regex(/([0-9]+)/) || 0);
	data.general	= $('div.general_name_div3').first().text().trim();
	data.imagepath	= $('#app'+APPID+'_globalContainer img:eq(0)').attr('src').pathpart();
	if (Page.page==='keep_stats') {
		keep = $('div.keep_attribute_section').first(); // Only when it's our own keep and not someone elses
		if (keep.length) {
			data.myname = $('div.keep_stat_title > span', keep).text().regex(/"(.*)"/);
			data.rank = $('td.statsTMainback img[src*=rank_medals]').attr('src').filepart().regex(/([0-9]+)/);
			stats = $('div.attribute_stat_container', keep);
			data.attack = $(stats).eq(2).text().regex(/([0-9]+)/);
			data.defense = $(stats).eq(3).text().regex(/([0-9]+)/);
			data.bank = parseInt($('td.statsTMainback b.money').text().replace(/[^0-9]/g,''), 10);
			stats = $('td.statsTMainback tr tr').text().replace(/[^0-9$]/g,'').regex(/([0-9]+)\$([0-9]+)\$([0-9]+)/);
			data.maxincome = stats[0];
			data.upkeep = stats[1];
			data.income = stats[2];
		}
	}
	if (Page.page==='town_land') {
		stats = $('.mContTMainback div:last-child');
		data.income = stats.eq(stats.length - 4).text().replace(/[^0-9]/g,'').regex(/([0-9]+)/);
	}
	$('span.result_body').each(function(i,el){
		var txt = $(el).text().replace(/,|\s+|\n/g, '');
		History.add('income', sum(txt.regex(/Gain.*\$([0-9]+).*Cost|stealsGold:\+\$([0-9]+)|Youreceived\$([0-9]+)|Yougained\$([0-9]+)/i)));
		if (txt.regex(/incomepaymentof\$([0-9]+)gold/i)){
			History.set('land', sum(txt.regex(/incomepaymentof\$([0-9]+)gold|backinthemine:Extra([0-9]+)Gold/i)));
		}
	});
	return true;
};

Player.update = function(type) {
	if (type !== 'option') {
		var i, j, types = ['stamina', 'energy', 'health'], list, step;
		for (j=0; j<types.length; j++) {
			list = [];
			step = Divisor(Player.data['max'+types[j]])
			for (i=0; i<=Player.data['max'+types[j]]; i+=step) {
				list.push(i);
			}
			Config.set(types[j], list);
		}
		History.set('bank', this.data.bank);
		History.set('exp', this.data.exp);
	}
//	var d = new Date(this.get('level_time'));
//	Dashboard.status(this, 'Exp: ' + addCommas(this.get('exp_average').round(1)) + ' per hour (next level: ' + d.format('D g:i a') + '), Income: $' + addCommas(History.get('income.average').round()) + ' per hour (plus $' + addCommas(History.get('land.average').round()) + ' from land)');
	Dashboard.status(this, 'Income: $' + addCommas(History.get('income.average').round()) + ' per hour (plus $' + addCommas(History.get('land.average').round()) + ' from land)');
};

Player.get = function(what) {
	var i, j = 0, low = Number.POSITIVE_INFINITY, high = Number.NEGATIVE_INFINITY, min = Number.POSITIVE_INFINITY, max = Number.NEGATIVE_INFINITY, data = this.data, now = Date.now();
	switch(what) {
		case 'cash':			return parseInt($('strong#app'+APPID+'_gold_current_value').text().replace(/[^0-9]/g, ''), 10);
		case 'cash_timer':		var when = new Date();
								return (3600 + data.cash_time - (when.getSeconds() + (when.getMinutes() * 60))) % 3600;
		case 'energy':			return $('#app'+APPID+'_energy_current_value').parent().text().regex(/([0-9]+)\s*\/\s*[0-9]+/);
		case 'energy_timer':	return $('#app'+APPID+'_energy_time_value').text().parseTimer();
		case 'health':			return $('#app'+APPID+'_health_current_value').parent().text().regex(/([0-9]+)\s*\/\s*[0-9]+/);
		case 'health_timer':	return $('#app'+APPID+'_health_time_value').text().parseTimer();
		case 'stamina':			return $('#app'+APPID+'_stamina_current_value').parent().text().regex(/([0-9]+)\s*\/\s*[0-9]+/);
		case 'stamina_timer':	return $('#app'+APPID+'_stamina_time_value').text().parseTimer();
		case 'exp_needed':		return data.maxexp - data.exp;
		case 'level_timer':
			return (this.get('level_time') - Date.now()) / 1000;
		case 'level_time':
			if (use_average_level) {
				return now + (3600000 * ((data.maxexp - data.exp + History.get('exp.change')) / (History.get('exp.harmonic.change') || 1))) - Math.floor(now % 3600000);
			} else {
				return (data.leveltime || (Date.now() + 43200000));
			}
		case 'exp_average':
			if (use_average_level) {
				return History.get('exp.average.change');
			} else {
				return (12 * ((this.data.avgenergyexp || 0) + (this.data.avgstaminaexp || 0)));
			}
		default: return this._get(what);
	}
};


/********** Worker.Player **********
* Gets all current stats we can see
*/
var Player = new Worker('Player', '*', {keep:true});
Player.data = {};
Player.option = null;
Player.panel = null;

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
		$('#app'+APPID+'_st_2_5 strong').attr('title', data.exp + '/' + data.maxexp).html(addCommas(data.maxexp - data.exp) + '<span style="font-weight:normal;"> in <span class="golem-timer" style="color:rgb(25,123,48);">' + makeTimer(this.get('level_timer')) + '</span></span>');
		return true;
	}
	data.cash		= parseInt($('strong#app'+APPID+'_gold_current_value').text().replace(/[^0-9]/g, ''), 10);
	tmp = $('#app'+APPID+'_energy_current_value').parent().text().regex(/([0-9]+)\s*\/\s*([0-9]+)/);
	if (tmp[0] < data.energy) {
		energy_used = data.energy - tmp[0];
	}
	data.energy		= tmp[0] || 0;
	data.maxenergy	= tmp[1] || 0;
	tmp = $('#app'+APPID+'_health_current_value').parent().text().regex(/([0-9]+)\s*\/\s*([0-9]+)/);
	data.health		= tmp[0] || 0;
	data.maxhealth	= tmp[1] || 0;
	tmp = $('#app'+APPID+'_stamina_current_value').parent().text().regex(/([0-9]+)\s*\/\s*([0-9]+)/);
	if (tmp[0] < data.stamina) {
		stamina_used = data.stamina - tmp[0];
	}
	data.stamina	= tmp[0] || 0;
	data.maxstamina	= tmp[1] || 0;
	tmp = $('#app'+APPID+'_st_2_5').text().regex(/([0-9]+)\s*\/\s*([0-9]+)/);
	if (tmp[0] > data.exp) { // If experience has been gained, lets record how much was gained and how many points of energy/stamina were used and save an average weighted slighty towards recent results
		if (energy_used) {
			data.avgenergyexp = ((((data.avgenergyexp || 0) * Math.min((data.energysamples || 0), 9)) + (tmp[0] - data.exp)/energy_used)/Math.min((data.energysamples || 0) + 1, 10)).round(-2);
			data.energysamples = Math.min((data.energysamples || 0) + 1, 10);
		} else if (stamina_used) {
			data.avgstaminaexp = ((((data.avgstaminaexp || 0) * Math.min((data.staminasamples || 0), 9)) + (tmp[0] - data.exp)/stamina_used)/Math.min((data.staminasamples || 0) + 1, 10)).round(-2);
			data.staminasamples = Math.min((data.staminasamples || 0) + 1, 10);
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
	this.data.leveltime = Math.round((Date.now()/1000) + (3600 * (((this.data.maxexp - this.data.exp) - (this.data.energy * this.data.avgenergyexp) - (this.data.stamina * this.data.avgstaminaexp)) / (((12 * this.data.avgenergyexp) + (12 * this.data.avgstaminaexp)) || 45))));
//	Dashboard.status(this, 'Exp: ' + addCommas(((12 * this.data.avgenergyexp) + (12 * this.data.avgstaminaexp)).round(-1)) + ' per hour (<span class="golem-timer">' + makeTimer(this.get('level_timer')) + '</span> to next level), Income: $' + addCommas(History.get('income.average')) + ' per hour (plus $' + addCommas(this.data.income) + ' from land)');
	Dashboard.status(this, 'Exp: ' + addCommas(History.get('exp.median.change')) + ' per hour (<span class="golem-timer">' + makeTimer(this.get('level_timer')) + '</span> to next level), Income: $' + addCommas(History.get('income.average')) + ' per hour (plus $' + addCommas(this.data.income) + ' from land)');
};

Player.get = function(what) {
	var i, j = 0, low = Number.POSITIVE_INFINITY, high = Number.NEGATIVE_INFINITY, min = Number.POSITIVE_INFINITY, max = Number.NEGATIVE_INFINITY, data = this.data;
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
//		case 'level_timer':		return (data.leveltime || (Date.now()/1000)) - Date.now()/1000;
		case 'level_timer':		return (3600 * (data.maxexp - data.exp) / (History.get('exp.median.change') || 1));
		default: return this._get(what);
	}
};


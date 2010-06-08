/********** Worker.Player **********
* Gets all current stats we can see
*/
var Player = new Worker('Player');
Player.option = null;

Player.settings = {
	keep:true
};

Player.defaults['castle_age'] = {
	pages:'*'
};

Player.runtime = {
	cash_timeout:null,
	energy_timeout:null,
	health_timeout:null,
	stamina_timeout:null
};

var use_average_level = false;

Player.init = function() {
	// Get the gold timer from within the page - should really remove the "official" one, and write a decent one, but we're about playing and not fixing...
	// gold_increase_ticker(1418, 6317, 3600, 174738470, 'gold', true);
	// function gold_increase_ticker(ticks_left, stat_current, tick_time, increase_value, first_call)
	var when = new Date(script_started + ($('*').html().regex(/gold_increase_ticker\(([0-9]+),/) * 1000));
	this.data.cash_time = when.getSeconds() + (when.getMinutes() * 60);
	this.runtime.cash_timeout = null;
	this.runtime.energy_timeout = null;
	this.runtime.health_timeout = null;
	this.runtime.stamina_timeout = null;
};

Player.parse = function(change) {
	var data = this.data, keep, stats, tmp, energy_used = 0, stamina_used = 0;
	if ($('#app'+APPID+'_energy_current_value').length) {
		tmp = $('#app'+APPID+'_energy_current_value').parent().text().regex(/([0-9]+)\s*\/\s*([0-9]+)/);
		data.energy		= tmp[0] || 0;
//		data.maxenergy	= tmp[1] || 0;
	}
	if ($('#app'+APPID+'_health_current_value').length) {
		tmp = $('#app'+APPID+'_health_current_value').parent().text().regex(/([0-9]+)\s*\/\s*([0-9]+)/);
		data.health		= tmp[0] || 0;
//		data.maxhealth	= tmp[1] || 0;
	}
	if ($('#app'+APPID+'_stamina_current_value').length) {
		tmp = $('#app'+APPID+'_stamina_current_value').parent().text().regex(/([0-9]+)\s*\/\s*([0-9]+)/);
		data.stamina	= tmp[0] || 0;
//		data.maxstamina	= tmp[1] || 0;
	}
	if ($('#app'+APPID+'_st_2_5 strong:not([title])').length) {
		tmp = $('#app'+APPID+'_st_2_5').text().regex(/([0-9]+)\s*\/\s*([0-9]+)/);
		data.exp		= tmp[0] || 0;
		data.maxexp		= tmp[1] || 0;
	}
	data.cash		= parseInt($('strong#app'+APPID+'_gold_current_value').text().replace(/[^0-9]/g, ''), 10);
	data.level		= $('#app'+APPID+'_st_5').text().regex(/Level: ([0-9]+)!/i);
	data.armymax	= $('a[href*=army.php]', '#app'+APPID+'_main_bntp').text().regex(/([0-9]+)/);
	data.army		= Math.min(data.armymax, 501); // XXX Need to check what max army is!
	data.upgrade	= ($('a[href*=keep.php]', '#app'+APPID+'_main_bntp').text().regex(/([0-9]+)/) || 0);
	data.general	= $('div.general_name_div3').first().text().trim();
	data.imagepath	= $('#app'+APPID+'_globalContainer img:eq(0)').attr('src').pathpart();
	if (Page.page==='keep_stats') {
		keep = $('div.keep_attribute_section').first(); // Only when it's our own keep and not someone elses
		if (keep.length) {
			data.myname = $('div.keep_stat_title_inc > span', keep).text().regex(/"(.*)"/);
			data.rank = $('td.statsTMainback img[src*=rank_medals]').attr('src').filepart().regex(/([0-9]+)/);
			stats = $('div.attribute_stat_container', keep);
			data.maxenergy = $(stats).eq(0).text().regex(/([0-9]+)/);
			data.maxstamina = $(stats).eq(1).text().regex(/([0-9]+)/);
			data.attack = $(stats).eq(2).text().regex(/([0-9]+)/);
			data.defense = $(stats).eq(3).text().regex(/([0-9]+)/);
			data.maxhealth = $(stats).eq(4).text().regex(/([0-9]+)/);
			data.bank = parseInt($('td.statsTMainback b.money').text().replace(/[^0-9]/g,''), 10);
			stats = $('.statsTB table table:contains("Total Income")').text().replace(/[^0-9$]/g,'').regex(/([0-9]+)\$([0-9]+)\$([0-9]+)/);
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
	if ($('#app'+APPID+'_energy_time_value').length) {
		window.clearTimeout(this.runtime.energy_timeout);
		this.runtime.energy_timeout = window.setTimeout(function(){Player.get('energy');}, $('#app'+APPID+'_energy_time_value').text().parseTimer() * 1000);
	}
	if ($('#app'+APPID+'_health_time_value').length) {
		window.clearTimeout(this.runtime.health_timeout);
		this.runtime.health_timeout = window.setTimeout(function(){Player.get('health');}, $('#app'+APPID+'_health_time_value').text().parseTimer() * 1000);
	}
	if ($('#app'+APPID+'_stamina_time_value').length) {
		window.clearTimeout(this.runtime.stamina_timeout);
		this.runtime.stamina_timeout = window.setTimeout(function(){Player.get('stamina');}, $('#app'+APPID+'_stamina_time_value').text().parseTimer() * 1000);
	}
	$('strong#app'+APPID+'_gold_current_value').attr('title', 'Cash in Bank: $' + addCommas(data.bank));
	return false;
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
	Dashboard.status(this, 'Income: $' + addCommas(Math.max(this.data.income, (History.get('land.average.1') + History.get('income.average.24')).round())) + ' per hour (currently $' + addCommas(History.get('land.average.1')) + ' from land)');
};

Player.get = function(what) {
	var i, j = 0, low = Number.POSITIVE_INFINITY, high = Number.NEGATIVE_INFINITY, min = Number.POSITIVE_INFINITY, max = Number.NEGATIVE_INFINITY, data = this.data, now = Date.now();
	switch(what) {
		case 'cash':			return (this.data.cash = parseInt($('strong#app'+APPID+'_gold_current_value').text().replace(/[^0-9]/g, ''), 10));
//		case 'cash_timer':		return $('#app'+APPID+'_gold_time_value').text().parseTimer();
		case 'cash_timer':		var when = new Date();
								return (3600 + data.cash_time - (when.getSeconds() + (when.getMinutes() * 60))) % 3600;
		case 'energy':			return (this.data.energy = $('#app'+APPID+'_energy_current_value').parent().text().regex(/([0-9]+)\s*\/\s*[0-9]+/));
		case 'energy_timer':            return $('#app'+APPID+'_energy_time_value').text().parseTimer();
		case 'health':			return (this.data.health = $('#app'+APPID+'_health_current_value').parent().text().regex(/([0-9]+)\s*\/\s*[0-9]+/));
		case 'health_timer':            return $('#app'+APPID+'_health_time_value').text().parseTimer();
		case 'stamina':			return (this.data.stamina = $('#app'+APPID+'_stamina_current_value').parent().text().regex(/([0-9]+)\s*\/\s*[0-9]+/));
		case 'stamina_timer':           return $('#app'+APPID+'_stamina_time_value').text().parseTimer();
		case 'exp_needed':		return data.maxexp - data.exp;
		case 'pause':			return isWorker(Window) && !Window.active ? '(Disabled) ' : isWorker(Queue) && Queue.get('option.pause') ? '(Paused) ' : '';
                case 'bank':                    return (data.bank - Bank.option.keep > 0) ? data.bank - Bank.option.keep : 0;
		default: return this._get(what);
	}
};


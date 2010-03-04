/********** Worker.Player **********
* Gets all current stats we can see
*/
var Player = new Worker('Player', '*');
Player.data = {
	history:{},
	average:0
};
Player.option = null;
Player.panel = null;
Player.onload = function() {
	// Get the gold timer from within the page - should really remove the "official" one, and write a decent one, but we're about playing and not fixing...
	// gold_increase_ticker(1418, 6317, 3600, 174738470, 'gold', true);
	// function gold_increase_ticker(ticks_left, stat_current, tick_time, increase_value, first_call)
	var when = new Date(script_started + ($('*').html().regex(/gold_increase_ticker\(([0-9]+),/) * 1000));
	Player.data.cash_time = when.getSeconds() + (when.getMinutes() * 60);
};
Player.parse = function(change) {
	if (!$('#app'+APP+'_app_body_container').length) {
		Page.reload();
		return false;
	}
	var data = Player.data, keep, stats, hour = Math.floor(Date.now() / 3600000), best = 0;
	data.FBID		= unsafeWindow.Env.user;
	data.cash		= parseInt($('strong#app'+APP+'_gold_current_value').text().replace(/[^0-9]/g, ''), 10);
	data.energy		= $('#app'+APP+'_energy_current_value').parent().text().regex(/([0-9]+)\s*\/\s*[0-9]+/);
	data.maxenergy	= $('#app'+APP+'_energy_current_value').parent().text().regex(/[0-9]+\s*\/\s*([0-9]+)/);
	data.health		= $('#app'+APP+'_health_current_value').parent().text().regex(/([0-9]+)\s*\/\s*[0-9]+/);
	data.maxhealth	= $('#app'+APP+'_health_current_value').parent().text().regex(/[0-9]+\s*\/\s*([0-9]+)/);
	data.stamina	= $('#app'+APP+'_stamina_current_value').parent().text().regex(/([0-9]+)\s*\/\s*[0-9]+/);
	data.maxstamina	= $('#app'+APP+'_stamina_current_value').parent().text().regex(/[0-9]+\s*\/\s*([0-9]+)/);
	data.exp		= $('#app'+APP+'_st_2_5').text().regex(/([0-9]+)\s*\/\s*[0-9]+/);
	data.maxexp		= $('#app'+APP+'_st_2_5').text().regex(/[0-9]+\s*\/\s*([0-9]+)/);
	data.level		= $('#app'+APP+'_st_5').text().regex(/Level: ([0-9]+)!/i);
	data.armymax	= $('a[href*=army.php]', '#app'+APP+'_main_bntp').text().regex(/([0-9]+)/);
	data.army		= Math.min(data.armymax, 501); // XXX Need to check what max army is!
	data.upgrade	= ($('a[href*=keep.php]', '#app'+APP+'_main_bntp').text().regex(/([0-9]+)/) || 0);
	data.general	= $('div.general_name_div3').first().text().trim();
	data.imagepath	= $('div.general_pic_div3 img').attr('src').pathpart();
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
		Player.data.income = stats.eq(stats.length - 4).text().replace(/[^0-9]/g,'').regex(/([0-9]+)/);
	}
	$('span.result_body').each(function(i,el){
		var txt = $(el).text().replace(/,|\s+|\n/g, '');
		data.history[hour] = (data.history[hour] || 0)
			+ (txt.regex(/Gain.*\$([0-9]+).*Cost/i) || 0)
			+ (txt.regex(/stealsGold:\+\$([0-9]+)/i) || 0)
			+ (txt.regex(/Youreceived\$([0-9]+)/i) || 0)
			+ (txt.regex(/Yougained\$([0-9]+)/i) || 0)
			+ (txt.regex(/incomepaymentof\$([0-9]+)gold/i) || 0)
			+ (txt.regex(/backinthemine:Extra([0-9]+)Gold/i) || 0);
	});
	hour -= 168; // 24x7
	data.average = 0;
	for (var i in data.history) {
		if (i < hour) {
			delete data.history[i];
		} else {
			if (!best || i < best) {
				best = i;
			}
			data.average += data.history[i];
		}
	}
	data.average = Math.floor(data.average / (hour - best + 169));
	if (Settings.Save(Player)) {
		Player.select();
	}
	return false;
};
Player.work = function(state) {
	// These can change every second - so keep them in mind
	Player.data.cash = parseInt($('strong#app'+APP+'_gold_current_value').text().replace(/[^0-9]/g, ''), 10);
// Very innacurate!!!
//	Player.data.cash_timer		= $('#app'+APP+'_gold_time_value').text().parseTimer();
	var when = new Date();
	when = Player.data.cash_time - (when.getSeconds() + (when.getMinutes() * 60));
	if (when < 0) {
		when += 3600;
	}
	Player.data.cash_timer		= when;
	Player.data.energy			= $('#app'+APP+'_energy_current_value').parent().text().regex(/([0-9]+)\s*\/\s*[0-9]+/);
	Player.data.energy_timer	= $('#app'+APP+'_energy_time_value').text().parseTimer();
	Player.data.health			= $('#app'+APP+'_health_current_value').parent().text().regex(/([0-9]+)\s*\/\s*[0-9]+/);
	Player.data.health_timer	= $('#app'+APP+'_health_time_value').text().parseTimer();
	Player.data.stamina			= $('#app'+APP+'_stamina_current_value').parent().text().regex(/([0-9]+)\s*\/\s*[0-9]+/);
	Player.data.stamina_timer	= $('#app'+APP+'_stamina_time_value').text().parseTimer();
};
Player.select = function() {
	var step = Divisor(Player.data.maxstamina)
	$('select.golem_stamina').each(function(a,el){
		$(el).empty();
		var i, tmp = $(el).attr('id').slice(PREFIX.length).regex(/([^_]*)_(.*)/i), value = tmp ? WorkerByName(tmp[0]).option[tmp[1]] : null;
		for (i=0; i<=Player.data.maxstamina; i+=step) {
			$(el).append('<option value="' + i + '"' + (value==i ? ' selected' : '') + '>' + i + '</option>');
		}
	});
	step = Divisor(Player.data.maxenergy)
	$('select.golem_energy').each(function(a,el){
		$(el).empty();
		var i, tmp = $(el).attr('id').slice(PREFIX.length).regex(/([^_]*)_(.*)/i), value = tmp ? WorkerByName(tmp[0]).option[tmp[1]] : null;
		for (i=0; i<=Player.data.maxenergy; i+=step) {
			$(el).append('<option value="' + i + '"' + (value==i ? ' selected' : '') + '>' + i + '</option>');
		}
	});
	step = Divisor(Player.data.maxhealth)
	$('select.golem_health').each(function(a,el){
		$(el).empty();
		var i, tmp = $(el).attr('id').slice(PREFIX.length).regex(/([^_]*)_(.*)/i), value = tmp ? WorkerByName(tmp[0]).option[tmp[1]] : null;
		for (i=0; i<=Player.data.maxhealth; i+=step) {
			$(el).append('<option value="' + i + '"' + (value==i ? ' selected' : '') + '>' + i + '</option>');
		}
	});
};
Player.income = function() {
	var amount = 0;
	for (var i in incomecache) {
		amount += incomecache[i];
	}
	return amount / (24 * 7);
}


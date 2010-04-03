/********** Worker.Player **********
* Gets all current stats we can see
*/
var Player = new Worker('Player', '*', {keep:true});
Player.data = {
	history:{}
};
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
	var data = this.data, keep, stats, hour = Math.floor(Date.now() / 3600000), tmp;
	if (change) {
		$('#app'+APPID+'_st_2_5 strong').attr('title', data.exp + '/' + data.maxexp).html(addCommas(data.maxexp - data.exp) + '<span style="font-weight:normal;"> in <span class="golem-timer" style="color:rgb(25,123,48);">' + makeTimer(this.get('level_timer')) + '</span></span>');
		return true;
	}
	data.cash		= parseInt($('strong#app'+APPID+'_gold_current_value').text().replace(/[^0-9]/g, ''), 10);
	tmp = $('#app'+APPID+'_energy_current_value').parent().text().regex(/([0-9]+)\s*\/\s*([0-9]+)/);
	data.energy		= tmp[0] || 0;
	data.maxenergy	= tmp[1] || 0;
	tmp = $('#app'+APPID+'_health_current_value').parent().text().regex(/([0-9]+)\s*\/\s*([0-9]+)/);
	data.health		= tmp[0] || 0;
	data.maxhealth	= tmp[1] || 0;
	tmp = $('#app'+APPID+'_stamina_current_value').parent().text().regex(/([0-9]+)\s*\/\s*([0-9]+)/);
	data.stamina	= tmp[0] || 0;
	data.maxstamina	= tmp[1] || 0;
	tmp = $('#app'+APPID+'_st_2_5').text().regex(/([0-9]+)\s*\/\s*([0-9]+)/);
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
	if (typeof data.history[hour] === 'number') {
		data.history[hour] = {income:data.history[hour]};
	} else {
		data.history[hour] = data.history[hour] || {};
	}
	data.history[hour].bank = data.bank;
	data.history[hour].exp = data.exp;
	$('span.result_body').each(function(i,el){
		var txt = $(el).text().replace(/,|\s+|\n/g, '');
		data.history[hour].income = (data.history[hour].income || 0)
			+ (txt.regex(/Gain.*\$([0-9]+).*Cost/i) || 0)
			+ (txt.regex(/stealsGold:\+\$([0-9]+)/i) || 0)
			+ (txt.regex(/Youreceived\$([0-9]+)/i) || 0)
			+ (txt.regex(/Yougained\$([0-9]+)/i) || 0);
		if (txt.regex(/incomepaymentof\$([0-9]+)gold/i)) {
			data.history[hour].land = (txt.regex(/incomepaymentof\$([0-9]+)gold/i) || 0) + (txt.regex(/backinthemine:Extra([0-9]+)Gold/i) || 0);
		}
	});
	hour -= 168; // 24x7
	for (var i in data.history) {
		if (i < hour) {
			delete data.history[i];
		}
	}
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
	}
	Dashboard.status(this, 'Exp: ' + addCommas(this.get('average_exp')) + ' per hour (<span class="golem-timer">' + makeTimer(this.get('level_timer')) + '</span> to next level), Income: $' + addCommas(this.get('average_income')) + ' per hour (plus $' + addCommas(this.data.income) + ' from land)');
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
		case 'level_timer':		return (3600 * (data.maxexp - data.exp) / (this.get('average_exp') || 1));
		case 'average_income':
			for (i in data.history) {
				j += (data.history[i].income || 0);
			}
			return Math.floor(j / length(data.history));
		case 'average_total_income':
			for (i in data.history) {
				j += (data.history[i].income || 0) + (data.history[i].land || 0);
			}
			return Math.floor(j / length(data.history));
		case 'average_cash':
			for (i in data.history) {
				if (data.history[i].bank) {
					j += data.history[i].bank;
					min = Math.min(min,i);
					max = Math.max(max,i);
				}
			}
			return Math.floor(j / length(data.history));
		case 'average_exp':
			for (i in data.history) {
				if (data.history[i].exp) {
					low = Math.min(low,data.history[i].exp);
					high = Math.max(high,data.history[i].exp);
					min = Math.min(min,i);
					max = Math.max(max,i);
				}
			}
			return Math.floor((high - low) / (max - min));
		default: return this._get(what);
	}
};

Player.dashboard = function() {
	var i, max = 0, list = [], output = [];
	list.push('<table cellspacing="0" cellpadding="0" class="golem-graph"><thead><tr><th></th><th colspan="73"><span style="float:left;">&lArr; Older</span>72 Hour History<span style="float:right;">Newer &rArr;</span><th></th></th></tr></thead><tbody>');
	list.push(Player.makeGraph(['income', 'land'], 'Income', true, this.get('average_total_income')));
	list.push(Player.makeGraph('bank', 'Bank', true, this.get('average_cash')));
	list.push(Player.makeGraph('exp', 'Experience', false, this.data.maxexp));
	list.push('</tbody></table>');
	$('#golem-dashboard-Player').html(list.join(''));
}

Player.makeGraph = function(type, title, iscash, goal) {
	var i, j, min, max = 0, max_s, min_s, goal_s, list = [], output = [], value = {}, hour = Math.floor(Date.now() / 3600000), title;
	if (typeof goal === 'undefined') {
		goal = 0;
	}
	for (i=hour-72; i<=hour; i++) {
		if (typeof type === 'string') {
			value[i] = 0;
			if (typeof Player.data.history[i] !== 'undefined' && typeof Player.data.history[i][type] !== 'undefined') {
				min = Math.min((typeof min === 'number' ? min : Number.POSITIVE_INFINITY), Player.data.history[i][type]);
				max = Math.max(max, Player.data.history[i][type]);
				value[i] = Player.data.history[i][type];
			}
		} else if (typeof type === 'object') {
			value[i] = [0, 0];
			if (typeof Player.data.history[i] !== 'undefined') {
				if (typeof Player.data.history[i][type[0]] !== 'undefined') {
					min = Math.min((typeof min === 'number' ? min : Number.POSITIVE_INFINITY), Player.data.history[i][type[0]]);
					max = Math.max(max, Player.data.history[i][type[0]]);
					value[i][0] = Player.data.history[i][type[0]];
				}
				if (typeof Player.data.history[i][type[1]] !== 'undefined') {
					min = Math.min((typeof min === 'number' ? min : Number.POSITIVE_INFINITY), Player.data.history[i][type[1]]);
					max = Math.max(max, Player.data.history[i][type[1]]);
					value[i][1] = Player.data.history[i][type[1]];
				}
				if (typeof Player.data.history[i][type[1]] !== 'undefined' && typeof Player.data.history[i][type[0]] !== 'undefined') {
					max = Math.max(max, Player.data.history[i][type[0]] + Player.data.history[i][type[1]]);
				}
			}
		}
	}
	if (goal) {
		max = Math.max(max, goal);
	}
	if (max >= 1000000000) {
		max = Math.ceil(max / 1000000000) * 1000000000;
		max_s = addCommas(max / 1000000000)+'b';
		goal_s = addCommas(Math.round(goal / 100000000)/10)+'b';
		min = Math.floor(min / 1000000000) * 1000000000;
		min_s = addCommas(min / 1000000000)+'b';
	} else if (max >= 1000000) {
		max = Math.ceil(max / 1000000) * 1000000;
		max_s = (max / 1000000)+'m';
		goal_s = (Math.round(goal / 100000)/10)+'m';
		min = Math.floor(min / 1000000) * 1000000;
		min_s = (min / 1000000)+'m';
	} else if (max >= 1000) {
		max = Math.ceil(max / 1000) * 1000;
		max_s = (max / 1000)+'k';
		goal_s = (Math.round(goal / 100)/10)+'k';
		min = Math.floor(min / 1000) * 1000;
		min_s = (min / 1000)+'k';
	} else {
		max_s = max || 0;
		goal_s = Math.round(goal) || 0;
		min_s = min || 0;
	}
	list.push('<th style="border-left:1px solid #dddddd;"><div>' + (iscash ? '$' : '') + max_s + '</div><div>' + title + '</div><div>' + (iscash ? '$' : '') + min_s + '</div></th>')
	for (i=hour-72; i<=hour; i++) {
		output = [];
		if (typeof type === 'string' && value[i]) {
			output.push('<div style="background:#00ff00;height:' + Math.ceil((value[i] - min) / (max - min) * 100) + 'px;"></div>')
			title = (hour - i) + ' hour' + ((hour - i)==1 ? '' : 's') +' ago, ' + (iscash ? '$' : '') + addCommas(value[i]);
		} else if (typeof type === 'object' && (value[i][0] || value[i][1])) {
			output.push('<div style="background:#00aa00;height:' + Math.max(Math.ceil((value[i][0] - min) / (max - min) * 100), 0) + 'px;"></div>');
			output.push('<div style="background:#00ff00;height:' + Math.max(Math.ceil((value[i][1] - min) / (max - min) * 100), 0) + 'px;"></div>');
			title = (hour - i) + ' hour' + ((hour - i)==1 ? '' : 's') +' ago, ' + (iscash ? '$' : '') + addCommas(value[i][1]) + ' + ' + (iscash ? '$' : '') + addCommas(value[i][0]) + ' = ' + (iscash ? '$' : '') + addCommas(value[i][0] + value[i][1]);
		} else {
			title = (hour - i) + ' hour' + ((hour - i)==1 ? '' : 's') +' ago';
		}
		if (goal) {
			output.push('<div style="position:relative;background:#ff0000;height:1px;margin-top:-1px;bottom:' + Math.max(Math.ceil((goal - min) / (max - min) * 100), 0) + 'px;"></div>');
		}
		td(list, output.join(''), 'title="' + title + '"');
	}
	if (goal) {
		th(list, '<div style="position:relative;height:10px;color:#ff0000;bottom:' + Math.max(Math.ceil((goal - min) / (max - min) * 100)+2, 0) + 'px;">' + (iscash ? '$' : '') + goal_s + '</div>', 'class="goal"');
	} else {
		th(list, '', 'class="goal"');
	}
	return '<tr>' + list.join('') + '</tr>';
}


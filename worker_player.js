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
	}
	Dashboard.status(this, 'Estimated time to next level <span class="golem-timer">' + makeTimer(this.get('level_timer')) + '</span>, average total income $' + addCommas(this.get('average_total_income')) + ' per hour');
};

Player.get = function(what) {
	var i, j = 0, min = Number.POSITIVE_INFINITY, max = Number.NEGATIVE_INFINITY, data = this.data, hour = Math.floor(Date.now() / 3600000);
	switch(what) {
		case 'cash':					return parseInt($('strong#app'+APPID+'_gold_current_value').text().replace(/[^0-9]/g, ''), 10);
		case 'cash_timer':				var when = new Date();
										return (3600 + data.cash_time - (when.getSeconds() + (when.getMinutes() * 60))) % 3600;
		case 'energy':					return $('#app'+APPID+'_energy_current_value').parent().text().regex(/([0-9]+)\s*\/\s*[0-9]+/);
		case 'energy_timer':			return $('#app'+APPID+'_energy_time_value').text().parseTimer();
		case 'health':					return $('#app'+APPID+'_health_current_value').parent().text().regex(/([0-9]+)\s*\/\s*[0-9]+/);
		case 'health_timer':			return $('#app'+APPID+'_health_time_value').text().parseTimer();
		case 'stamina':					return $('#app'+APPID+'_stamina_current_value').parent().text().regex(/([0-9]+)\s*\/\s*[0-9]+/);
		case 'stamina_timer':			return $('#app'+APPID+'_stamina_time_value').text().parseTimer();
		case 'level_timer':				return (3600 * (data.maxexp - data.exp) / (this.get('average_exp') || 1));
		case 'average_cash':			for (i in data.history) {j += (data.history[i].income || 0);}
										return Math.floor(j / length(data.history));
		case 'average_total_income':	return this.get('average_cash') + Math.max((data.history[hour-1].land || 0),(data.history[hour].land || 0));
		case 'average_exp':				for (i in data.history){min=Math.min(min,i);}
										return (data.history[hour].exp - data.history[min].exp)/(hour-min);
		case 'goal_exp':				return data.maxexp;
		case 'goal_cash':				return Land.option.bestcost;
		default:						return this._get(what);
	}
};

Player.dashboard = function() {
	var i, max = 0, list = [], output = [];
	list.push('<table cellspacing="0" cellpadding="0" class="golem-graph"><thead><tr><th></th><th colspan="73"><span style="float:left;">&lArr; Older</span>72 Hour History<span style="float:right;">Newer &rArr;</span><th></th></th></tr></thead><tbody>');
	list.push(Player.makeGraph(['income', 'land'], 'Income', 'average_total_income', true));
	list.push(Player.makeGraph('bank', 'Bank', 'goal_cash', true));
	list.push(Player.makeGraph('exp', 'Experience', 'goal_exp', false));
	list.push('</tbody></table>');
	$('#golem-dashboard-Player').html(list.join(''));
}

Player.makeGraph = function(type, title, goal, iscash, min) {
	var i, j, max = 0, max_s, min_s, goal_s, list = [], output = [], value = {}, hour = Math.floor(Date.now() / 3600000), goal_value;
	if (typeof goal === 'string') {goal_value = Player.get(goal);}
	list.push('<tr>');
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
	if (typeof goal === 'string') {
		max = Math.max(max, goal_value);
	}
	if (max >= 1000000000) {
		max = Math.ceil(max / 1000000000) * 1000000000;
		max_s = addCommas(max / 1000000000)+'b';
		goal_s = addCommas(Math.round(goal_value / 100000000)/10)+'b';
		min = Math.floor(min / 1000000000) * 1000000000;
		min_s = addCommas(min / 1000000000)+'b';
	} else if (max >= 1000000) {
		max = Math.ceil(max / 1000000) * 1000000;
		max_s = (max / 1000000)+'m';
		goal_s = (Math.round(goal_value / 100000)/10)+'m';
		min = Math.floor(min / 1000000) * 1000000;
		min_s = (min / 1000000)+'m';
	} else if (max >= 1000) {
		max = Math.ceil(max / 1000) * 1000;
		max_s = (max / 1000)+'k';
		goal_s = (Math.round(goal_value / 100)/10)+'k';
		min = Math.floor(min / 1000) * 1000;
		min_s = (min / 1000)+'k';
	} else {
		max_s = max || 0;
		goal_s = Math.round(goal_value) || 0;
		min_s = min || 0;
	}
//	if (min >= 1000000000) {min = min.round(-9);min_s = addCommas(min / 1000000000)+'b';}
//	else if (min >= 1000000) {min = min.round(-6);min_s = (min / 1000000)+'m';}
//	else if (min >= 1000) {min = min.round(-3);min_s = (min / 1000)+'k';}
//	else {min_s = min || 0;}
	list.push('<th style="border-left:1px solid #dddddd;"><div>' + (iscash ? '$' : '') + max_s + '</div><div>' + title + '</div><div>' + (iscash ? '$' : '') + min_s + '</div></th>')
	for (i=hour-72; i<=hour; i++) {
		if (typeof type === 'string' && value[i]) {
			list.push('<td title="' + (hour - i) + ' hour' + ((hour - i)==1 ? '' : 's') +' ago, ' + (iscash ? '$' : '') + addCommas(value[i]) + '"><div style=" background: #00ff00; height:'+Math.ceil((value[i] - min) / (max - min) * 100)+'px;"></div><div style="position:relative; background: red; border: 0px; height:1px; bottom:'+Math.max(Math.ceil((goal_value - min) / (max - min) * 100), 0)+'px;"></div></td>');
		} else if (typeof type === 'object' && (value[i][0] || value[i][1])) {
			list.push('<td title="' + (hour - i) + ' hour' + ((hour - i)==1 ? '' : 's') +' ago, ' + (iscash ? '$' : '') + addCommas(value[i][1]) + ' + ' + (iscash ? '$' : '') + addCommas(value[i][0]) + ' = ' + (iscash ? '$' : '') + addCommas(value[i][0] + value[i][1]) + '"><div style=" background: #00aa00; height:'+Math.max(Math.ceil((value[i][0] - min) / (max - min) * 100), 0)+'px;"></div><div style=" background: #00ff00; height:'+Math.max(Math.ceil((value[i][1] - min) / (max - min) * 100), 0)+'px;"></div><div style="position:relative; background: red; border: 0px; height:1px; bottom:'+Math.max(Math.ceil((goal_value - min) / (max - min) * 100), 0)+'px;"></div></td>');
		} else {
			list.push('<td title="' + (hour - i) + ' hour' + ((hour - i)==1 ? '' : 's') +' ago"><div style="position:relative; background: red; border: 0px; height:1px; bottom:'+Math.max(Math.ceil((goal_value - min) / (max - min) * 100), 0)+'px;"></div></td>');
		}
	}
	list.push('<th style="vertical-align:bottom;"><div style=" position:relative; height:10px; color:red; bottom:' + Math.max(Math.ceil((goal_value - min) / (max - min) * 100)-3, 0) + 'px;">' + (iscash ? '$' : '') + goal_s + '</div></th></tr>');
	return list.join('');
}

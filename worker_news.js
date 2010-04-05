/********** Worker.News **********
* Aggregate the news feed
*/
var News = new Worker('News', 'index');
News.data = null;
News.option = null;

News.parse = function(change) {
	if (change) { // golem/Rycochet's Castle Age Golem: TypeError in News.parse(true): $("a:eq(0)", el).attr("href") is undefined
		var xp = 0, bp = 0, win = 0, lose = 0, deaths = 0, cash = 0, i, j, list = [], user = {}, order;
		$('#app'+APPID+'_battleUpdateBox .alertsContainer .alert_content').each(function(i,el) {
			var txt = $(el).text().replace(/,/g, ''), uid;
			if (txt.regex(/You were killed/i)) {
				deaths++;
			} else {
				uid = $('a:eq(0)', el).attr('href').regex(/user=([0-9]+)/i);
				user[uid] = user[uid] || {name:$('a:eq(0)', el).text(), win:0, lose:0}
				if (txt.regex(/Victory!/i)) {
					win++;
					user[uid].lose++;
					xp += txt.regex(/([0-9]+) experience/i);
					bp += txt.regex(/([0-9]+) Battle Points!/i);
					cash += txt.regex(/\$([0-9]+)/i);
				} else {
					lose++;
					user[uid].win++;
					xp -= txt.regex(/([0-9]+) experience/i);
					bp -= txt.regex(/([0-9]+) Battle Points!/i);
					cash -= txt.regex(/\$([0-9]+)/i);
				}
			}
		});
		if (win || lose) {
			list.push('You were challenged <strong>' + (win + lose) + '</strong> times, winning <strong>' + win + '</strong> and losing <strong>' + lose + '</strong>.');
			list.push('You ' + (xp >= 0 ? 'gained <span class="positive">' : 'lost <span class="negative">') + addCommas(Math.abs(xp)) + '</span> experience points.');
			list.push('You ' + (cash >= 0 ? 'gained <span class="positive">' : 'lost <span class="negative">') + '<b class="gold">$' + addCommas(Math.abs(cash)) + '</b></span>.');
			list.push('You ' + (bp >= 0 ? 'gained <span class="positive">' : 'lost <span class="negative">') + addCommas(Math.abs(bp)) + '</span> Battle Points.');
			list.push('');
			order = sortObject(user, function(a,b){return (user[b].win + (user[b].lose / 100)) - (user[a].win + (user[a].lose / 100));});
			for (j=0; j<order.length; j++) {
				i = order[j];
				list.push('<strong title="' + i + '">' + user[i].name + '</strong> ' + (user[i].win ? 'beat you <span class="negative">' + user[i].win + '</span> time' + (user[i].win>1?'s':'') : '') + (user[i].lose ? (user[i].win ? ' and ' : '') + 'was beaten <span class="positive">' + user[i].lose + '</span> time' + (user[i].lose>1?'s':'') : '') + '.');
			}
			if (deaths) {
				list.push('You died ' + (deaths>1 ? deaths+' times' : 'once') + '!');
			}
			$('#app'+APPID+'_battleUpdateBox  .alertsContainer').prepend('<div style="padding: 0pt 0pt 10px;"><div class="alert_title">Summary:</div><div class="alert_content">' + list.join('<br>') + '</div></div>');
		}
	}
	return true;
};


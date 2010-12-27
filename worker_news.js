/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page, Queue, Resources,
	Battle, Generals, LevelUp, Player,
	APP, APPID, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, shortNumber, Divisor, length, unique, deleteElement, sum, addCommas, findInArray, findInObject, objectIndex, sortObject, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime, ucfirst, ucwords,
	makeImage
*/
/********** Worker.News **********
* Aggregate the news feed
*/
var News = new Worker('News');
News.data = null;

News.defaults['castle_age'] = {
	pages:'index'
};

News.runtime = {
	last:0
};

News.parse = function(change) {
	if (change) {
		var xp = 0, bp = 0, wp = 0, win = 0, lose = 0, deaths = 0, cash = 0, i, list = [], user = {}, last_time = this.runtime.last, killed = false;
		this.runtime.last = Date.now();
		$('#app'+APPID+'_battleUpdateBox .alertsContainer .alert_content').each(function(i,el) {
			var uid, txt = $(el).text().replace(/,/g, ''), title = $(el).prev().text(), days = title.regex(/([0-9]+) days/i), hours = title.regex(/([0-9]+) hours/i), minutes = title.regex(/([0-9]+) minutes/i), seconds = title.regex(/([0-9]+) seconds/i), time, my_xp = 0, my_bp = 0, my_wp = 0, my_cash = 0, result;
			time = Date.now() - ((((((((days || 0) * 24) + (hours || 0)) * 60) + (minutes || 59)) * 60) + (seconds || 59)) * 1000);
			if (txt.regex(/You were killed/i)) {
				killed = true;
				deaths++;
			} else {
				uid = $('a:eq(0)', el).attr('href').regex(/user=([0-9]+)/i);
				user[uid] = user[uid] || {name:$('a:eq(0)', el).text(), win:0, lose:0, deaths:0};
				result = null;
				if (txt.regex(/Victory!/i)) {
					win++;
					user[uid].lose++;
					my_xp = txt.regex(/([0-9]+) experience/i);
					my_bp = txt.regex(/([0-9]+) Battle Points!/i);
					my_wp = txt.regex(/([0-9]+) War Points!/i);
					my_cash = txt.regex(/\$([0-9]+)/i);
					result = 'win';
				} else {
					lose++;
					user[uid].win++;
					my_xp = 0 - txt.regex(/([0-9]+) experience/i);
					my_bp = 0 - txt.regex(/([0-9]+) Battle Points!/i);
					my_wp = 0 - txt.regex(/([0-9]+) War Points!/i);
					my_cash = 0 - txt.regex(/\$([0-9]+)/i);
					result = 'loss';
				}
				if (killed) {
					user[uid].deaths++;
					killed = false;
				}
				if (time > last_time) {
//					console.log(warn(), 'Add to History (+battle): exp = '+my_xp+', bp = '+my_bp+', wp = '+my_wp+', income = '+my_cash);
					time = Math.floor(time / 3600000);
					History.add([time, 'exp+battle'], my_xp);
					History.add([time, 'bp+battle'], my_bp);
					History.add([time, 'wp+battle'], my_wp);
					History.add([time, 'income+battle'], my_cash);
					switch (result) {
						case 'win':
							History.add([time, 'battle+win'], 1);
							break;
						case 'loss':
							History.add([time, 'battle+loss'], -1);
							break;
					}
				}
				xp += my_xp;
				bp += my_bp;
				wp += my_wp;
				cash += my_cash;
				
			}
		});
		if (win || lose) {
			list.push('You were challenged <strong>' + (win + lose) + '</strong> times, winning <strong>' + win + '</strong> and losing <strong>' + lose + '</strong>.');
			list.push('You ' + (xp >= 0 ? 'gained <span class="positive">' : 'lost <span class="negative">') + addCommas(Math.abs(xp)) + '</span> experience points.');
			list.push('You ' + (cash >= 0 ? 'gained <span class="positive">' : 'lost <span class="negative">') + '<b class="gold">$' + addCommas(Math.abs(cash)) + '</b></span>.');
			list.push('You ' + (bp >= 0 ? 'gained <span class="positive">' : 'lost <span class="negative">') + addCommas(Math.abs(bp)) + '</span> Battle Points.');
			list.push('You ' + (wp >= 0 ? 'gained <span class="positive">' : 'lost <span class="negative">') + addCommas(Math.abs(wp)) + '</span> War Points.');
			if (deaths) {
				list.push('You died ' + (deaths>1 ? deaths+' times' : 'once') + '!');
			}
			list.push('');
			user = sortObject(user, function(a,b){return (user[b].win + (user[b].lose / 100)) - (user[a].win + (user[a].lose / 100));});
			for (i in user) {
				list.push('<a class="golem-link" href="http://apps.facebook.com/castle_age/keep.php?casuser=' + i + '">' + user[i].name + '</a> <a target="_blank" href="http://www.facebook.com/profile.php?id=' + i + '">' + makeImage('facebook') + '</a> ' + (user[i].win ? 'beat you <span class="negative">' + user[i].win + '</span> time' + plural(user[i].win) : '') + (user[i].lose ? (user[i].win ? (user[i].deaths ? ', ' : ' and ') : '') + 'was beaten <span class="positive">' + user[i].lose + '</span> time' + plural(user[i].lose) : '') + (user[i].deaths ? (user[i].win || user[i].lose ? ' and ' : '') + 'killed you <span class="negative">' + user[i].deaths + '</span> time' + plural(user[i].deaths) : '') + '.');
			}
			$('#app'+APPID+'_battleUpdateBox  .alertsContainer').prepend('<div style="padding: 0pt 0pt 10px;"><div class="alert_title">Summary:</div><div class="alert_content">' + list.join('<br>') + '</div></div>');
		}
	}
	return true;
};


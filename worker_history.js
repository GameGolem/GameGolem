/********** Worker.History **********
* History of anything we want.
* Dashboard is exp, income and bank.
*
* History.set('key', value); - sets the current hour's value
* History.add('key', value); - adds to the current hour's value
*
* History.get('key') - gets current hour's value
* History.get([hour, 'key']) - gets value at specified hour
* History.get('key.change') - gets change between this and last value (use for most entries to get relative rather than absolute values)
* History.get('key.average') - gets mean average of values (use .change for average of changes etc) - http://en.wikipedia.org/wiki/Arithmetic_mean
* History.get('key.geometric') - gets geometric average of values (use .change for average of changes etc) - http://en.wikipedia.org/wiki/Geometric_mean
* History.get('key.harmonic') - gets harmonic average of values (use .change for average of changes etc) - http://en.wikipedia.org/wiki/Harmonic_mean
* History.get('key.mode') - gets the most common value (use .change again if needed)
* History.get('key.median') - gets the center value if all values sorted (use .change again etc)
* History.get('key.total') - gets total of all values added together
* History.get('key.max') - gets highest value (use .change for highest change in values)
* History.get('key.min') - gets lowest value
*/
var History = new Worker('History');
History.option = null;

History.dashboard = function() {
	var i, max = 0, list = [], output = [];
	list.push('<table cellspacing="0" cellpadding="0" class="golem-graph"><thead><tr><th></th><th colspan="73"><span style="float:left;">&lArr; Older</span>72 Hour History<span style="float:right;">Newer &rArr;</span><th></th></th></tr></thead><tbody>');
	list.push(this.makeGraph(['land', 'income'], 'Income', true, {'Average Income':this.get('land.mean') + this.get('income.mean')}));
	list.push(this.makeGraph('bank', 'Bank', true, Land.runtime.best ? {'Next Land':Land.runtime.cost} : null)); // <-- probably not the best way to do this, but is there a function to get options like there is for data?
	list.push(this.makeGraph('exp', 'Experience', false, {'Next Level':Player.get('maxexp')}));
	list.push(this.makeGraph('exp.change', 'Exp Gain', false, {'Average':this.get('exp.average.change'), 'Ignore entries above':(this.get('exp.mean.change') + 2 * this.get('exp.stddev.change'))} )); // , 'Harmonic Average':this.get('exp.harmonic.change') ,'Median Average':this.get('exp.median.change') ,'Mean Average':this.get('exp.mean.change')
	list.push('</tbody></table>');
	$('#golem-dashboard-History').html(list.join(''));
}

History.init = function() {
	if (Player.data.history) {
		this.data = Player.data.history;
		delete Player.data.history;
	}
};

History.update = function(type) {
	var i, hour = Math.floor(Date.now() / 3600000) - 168;
	for (i in this.data) {
		if (i < hour) {
			delete this.data[i];
		}
	}
//	debug('Exp: '+this.get('exp'));
//	debug('Exp max: '+this.get('exp.max'));
//	debug('Exp max change: '+this.get('exp.max.change'));
//	debug('Exp min: '+this.get('exp.min'));
//	debug('Exp min change: '+this.get('exp.min.change'));
//	debug('Exp change: '+this.get('exp.change'));
//	debug('Exp mean: '+this.get('exp.mean.change'));
//	debug('Exp harmonic: '+this.get('exp.harmonic.change'));
//	debug('Exp geometric: '+this.get('exp.geometric.change'));
//	debug('Exp mode: '+this.get('exp.mode.change'));
//	debug('Exp median: '+this.get('exp.median.change'));
//	debug('Average Exp = weighted average: ' + this.get('exp.average.change') + ', mean: ' + this.get('exp.mean.change') + ', geometric: ' + this.get('exp.geometric.change') + ', harmonic: ' + this.get('exp.harmonic.change') + ', mode: ' + this.get('exp.mode.change') + ', median: ' + this.get('exp.median.change'));
};

History.set = function(what, value) {
	if (!value) {
		return;
	}
	this._unflush();
	var hour = Math.floor(Date.now() / 3600000);
	this.data[hour] = this.data[hour] || {}
	this.data[hour][what] = value;
};

History.add = function(what, value) {
	if (!value) {
		return;
	}
	this._unflush();
	var hour = Math.floor(Date.now() / 3600000)
	this.data[hour] = this.data[hour] || {}
	this.data[hour][what] = (this.data[hour][what] || 0) + value;
};

History.math = {
	stddev: function(list) {
		var i, listsum = 0, mean = this.mean(list);
		for (i in list) {
			listsum += Math.pow(list[i] - mean, 2);
		}
		listsum /= list.length;
		return Math.sqrt(listsum);
	},
	average: function(list) {
		var i, mean = this.mean(list), stddev = this.stddev(list);
		for (i in list) {
			if (Math.abs(list[i] - mean) > stddev * 2) {
				delete list[i];
			}
		}
		return sum(list) / list.length;
	},
	oldaverage: function(list) {
		var i, max = this.max(list), mean = this.mean(list);
		if (mean < max / 3) {
			max = Math.max(max / 2, mean * 2);
			for (i in list) {
				if (list[i] > max) { // 2/3 of peak
					delete list[i];
				}
			}
		}
		return sum(list) / list.length;
	},
	mean: function(list) {
		return sum(list) / list.length;
	},
	harmonic: function(list) {
		var i, num = [];
		for (i in list) {
			if (list[i]) {
				num.push(1/list[i])
			}
		}
		return num.length / sum(num);
	},
	geometric: function(list) {
		var i, num = 1;
		for (i in list) {
			num *= list[i] || 1;
		}
		return Math.pow(num, 1 / list.length);
	},
	median: function(list) {
		list.sort(function(a,b){return a-b;});
		if (list.length % 2) {
			return (list[Math.floor(list.length / 2)] + list[Math.ceil(list.length / 2)]) / 2;
		}
		return list[Math.floor(list.length / 2)];
	},
	mode: function(list) {
		var i, j = 0, count = 0, num = {}, tmp;
		for (i in list) {
			num[list[i]] = (num[list[i]] || 0) + 1
		}
		tmp = sortObject(num, function(a,b){return num[b]-num[a];});
		for (i in tmp) {
			if (num[tmp[i]] === num[tmp[0]]) {
				j += parseInt(tmp[i]);
				count++;
			}
		}
		return j / count;
	},
	max: function(list) {
		list.sort(function(a,b){return b-a;});
		return list[0];
	},
	min: function(list) {
		list.sort(function(a,b){return a-b;});
		return list[0];
	}
};

History.get = function(what) {
	this._unflush();
	var i, last = null, list = [], data = this.data, x = typeof what === 'string' ? what.split('.') : (typeof what === 'object' ? what : []), hour = Math.floor(Date.now() / 3600000);
	if (x.length && !x[0].regex(/[^0-9]/gi)) {
		hour = x.shift();
	}
	if (!x.length) {
		return data;
	}
	if (x.length === 1) {
		return data[hour] ? data[hour][x[0]] : 0; // only the current value
	}
	if (x[1] === 'change') {
		if (data[hour] && data[hour-1] && typeof data[hour][x[0]] === 'number' && typeof data[hour-1][x[0]] === 'number') {
			return data[hour][x[0]] - data[hour-1][x[0]];
		}
		return 0;
	}
	if (x.length > 2 && x[2] === 'change') {
		for (i=hour-168; i<=hour; i++) {
			if (data[i] && typeof data[i][x[0]] === 'number') {
				if (last !== null) {
					list.push(data[i][x[0]] - last);
				}
				last = data[i][x[0]];
			} else {
				last = null;
			}
		}
	} else {
		for (i in data) {
			if (typeof data[i][x[0]] === 'number') {
				list.push(data[i][x[0]]);
			}
		}
	}
	if (History.math[x[1]]) {
		return History.math[x[1]](list);
	}
	throw('Wanting to get unknown History type ' + x[1] + ' on ' + x[0]);
};

History.makeGraph = function(type, title, iscash, goal) {
	var i, j, min = Number.POSITIVE_INFINITY, max = Number.NEGATIVE_INFINITY, max_s, min_s, goal_s = [], list = [], bars = [], output = [], value = {}, goalbars = '', divide = 1, suffix = '', hour = Math.floor(Date.now() / 3600000), title, numbers;
	if (typeof goal === 'number') {
		goal = [goal];
	} else if (typeof goal !== 'array' && typeof goal !== 'object') {
		goal = null;
	}
	if (goal && length(goal)) {
		for (i in goal) {
			min = Math.min(min, goal[i]);
			max = Math.max(max, goal[i]);
		}
	}
	if (typeof type === 'string') {
		type = [type];
	}
	for (i=hour-72; i<=hour; i++) {
		value[i] = [0];
		if (this.data[i]) {
			for (j=0; j<type.length; j++) {
				value[i][j] = this.get(i + '.' + type[j]);
				if (typeof value[i][j] !== 'undefined') {
					min = Math.min(min, value[i][j]);
					max = Math.max(max, value[i][j]);
				}
			}
			max = Math.max(max, sum(value[i]));
		}
	}
	if (max >= 1000000000) {
		divide = 1000000000;
		suffix = 'b';
	} else if (max >= 1000000) {
		divide = 1000000;
		suffix = 'm';
	} else if (max >= 1000) {
		divide = 1000;
		suffix = 'k';
	}
	max = Math.ceil(max / divide) * divide;
	max_s = (iscash ? '$' : '') + addCommas(max / divide) + suffix;
	min = Math.floor(min / divide) * divide;
	min_s = (iscash ? '$' : '') + addCommas(min / divide) + suffix;
	if (goal && length(goal)) {
		for (i in goal) {
			bars.push('<div style="bottom:' + Math.max(Math.floor((goal[i] - min) / (max - min) * 100), 0) + 'px;"></div>');
			goal_s.push('<div' + (typeof i !== 'number' ? ' title="'+i+'"' : '') + ' style="bottom:' + Math.range(2, Math.ceil((goal[i] - min) / (max - min) * 100)-2, 92) + 'px;">' + (iscash ? '$' : '') + addCommas((goal[i] / divide).round(1)) + suffix + '</div>');
		}
		goalbars = '<div class="goal">' + bars.reverse().join('') + '</div>';
		goal_s.reverse();
	}
	th(list, '<div>' + max_s + '</div><div>' + title + '</div><div>' + min_s + '</div>')
	for (i=hour-72; i<=hour; i++) {
		bars = []
		output = [];
		numbers = [];
		title = (hour - i) + ' hour' + ((hour - i)==1 ? '' : 's') +' ago';
		for (j in value[i]) {
			bars.push('<div style="height:' + Math.max(Math.ceil((value[i][j] - min) / (max - min) * 100), 0) + 'px;"></div>');
			if (value[i][j]) {
				numbers.push((value[i][j] ? (iscash ? '$' : '') + addCommas(value[i][j]) : ''));
			}
		}
		output.push('<div class="bars">' + bars.reverse().join('') + '</div>' + goalbars);
		numbers.reverse();
		title = title + (numbers.length ? ', ' : '') + numbers.join(' + ') + (numbers.length > 1 ? ' = ' + (iscash ? '$' : '') + addCommas(sum(value[i])) : '');
		td(list, output.join(''), 'title="' + title + '"');
	}
	th(list, goal_s.join(''));
	return '<tr>' + list.join('') + '</tr>';
}


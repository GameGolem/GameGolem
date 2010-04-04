/********** Worker.History **********
* Gets all current stats we can see
*/
var History = new Worker('History');

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
	debug('Exp max: '+this.get('exp.max'));
	debug('Exp min: '+this.get('exp.min'));
	debug('Exp mean: '+this.get('exp.mean.change'));
	debug('Exp mode: '+this.get('exp.mode.change'));
	debug('Exp median: '+this.get('exp.median.change'));
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

History.get = function(what) {
	this._unflush();
	var i, j = 0, count = 0, low = Number.POSITIVE_INFINITY, high = Number.NEGATIVE_INFINITY, min = Number.POSITIVE_INFINITY, max = Number.NEGATIVE_INFINITY, result = [], list = {}, tmp, data = this.data, x = typeof what === 'string' ? what.split('.') : (typeof what === 'object' ? what : []), hour = Math.floor(Date.now() / 3600000);
	if (!x.length) {
		return this.data;
	}
	switch(x[1]) {
		default:
			throw ['UnknownHistoryError', 'Wanting to get unknwn type ' + x[1] + ' on ' + x[0]];
		case 'undefined':
			return data[hour][x[0]]; // only the current value
		case 'total':
			if (x[2] === 'change') {
				for (i in data) {
					if (data[i][x[0]]) {
						low = Math.min(low, data[i][x[0]]);
					}
				}
			}
			for (i in data) {
				j += (data[i][x[0]] || 0) - (low === Number.POSITIVE_INFINITY ? 0 : low);
			}
			return j;
		case 'max':
			for (i in data) {
				max = Math.max(max, (data[i][x[0]] || 0));
			}
			return max;
		case 'min':
			for (i in data) {
				min = Math.min(min, (data[i][x[0]] || 0));
			}
			return min;
		case 'mean':
		case 'average':
			if (x[2] === 'change') {
				for (i in data) {
					if (data[i][x[0]]) {
						low = Math.min(low, data[i][x[0]]);
						high = Math.max(high, data[i][x[0]]);
						min = Math.min(min, i);
						max = Math.max(max, i);
					}
				}
				return Math.floor((high - low) / (max - min));
			}
			for (i in data) {
				j += (data[i][x[0]] || 0);
			}
			return Math.floor(j / length(data));
		case 'mode':
			for (i in data) {
				if (data[i][x[0]]) {
					if (x[2] === 'change') {
						if (low !== Number.POSITIVE_INFINITY) {
							high = data[i][x[0]] - low;
							list[high] = (list[high] || 0) + 1;
						}
						low = data[i][x[0]];
					} else {
						list[data[i][x[0]]] = (list[data[i][x[0]]] || 0) + 1;
					}
				}
			}
			tmp = sortObject(list, function(a,b){return list[b]-list[a];});
			max = list[tmp[0]];
			for (i in tmp) {
				if (list[tmp[i]] === max) {
					j += parseInt(tmp[i]);
					count++;
				}
			}
			return j / count;
		case 'median':
			list = [];
			for (i in data) {
				if (data[i][x[0]]) {
					if (x[2] === 'change') {
						if (low !== Number.POSITIVE_INFINITY) {
							high = data[i][x[0]] - low;
							list.push(high);
						}
						low = data[i][x[0]];
					} else {
						list.push(data[i][x[0]]);
					}
				}
			}
			list.sort(function(a,b){return a-b;});
			if (list.length % 2) {
				return (list[Math.floor(list.length / 2)] + list[Math.ceil(list.length / 2)]) / 2;
			}
			return list[Math.floor(list.length / 2)];
	}
};

History.dashboard = function() {
	var i, max = 0, list = [], output = [];
	list.push('<table cellspacing="0" cellpadding="0" class="golem-graph"><thead><tr><th></th><th colspan="73"><span style="float:left;">&lArr; Older</span>72 Hour History<span style="float:right;">Newer &rArr;</span><th></th></th></tr></thead><tbody>');
	list.push(this.makeGraph(['land', 'income'], 'Income', true, {'Average Income':this.get('land.average') + this.get('income.average')}));
	list.push(this.makeGraph('bank', 'Bank', true, Land.option.best ? {'Next Land':Land.option.bestcost} : null)); // <-- probably not the best way to do this, but is there a function to get options like there is for data?
	list.push(this.makeGraph('exp', 'Experience', false, {'Next Level':Player.get('maxexp')}));
	list.push('</tbody></table>');
	$('#golem-dashboard-History').html(list.join(''));
}

History.makeGraph = function(type, title, iscash, goal) {
	var i, j, min = Number.POSITIVE_INFINITY, max = Number.NEGATIVE_INFINITY, max_s, min_s, goal_s = [], list = [], bars = [], output = [], value = {}, goalbars = '', divide = 1, suffix = '', hour = Math.floor(Date.now() / 3600000), data = this.data, title, numbers;
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
				value[i][j] = this.data[i][type[j]] || 0;
				if (typeof value[i][j] !== 'undefined') {
					min = Math.min(min, value[i][j]);
					max = Math.max(max, value[i][j]);
				}
			}
			if (typeof data[i][type[1]] !== 'undefined' && typeof data[i][type[0]] !== 'undefined') {
				max = Math.max(max, sum(value[i]));
			}
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
			bars.push('<div style="bottom:' + Math.max(Math.ceil((goal[i] - min) / (max - min) * 100), 0) + 'px;"></div>');
			goal_s.push('<div' + (typeof i !== 'number' ? ' title="'+i+'"' : '') + ' style="bottom:' + Math.range(2, Math.ceil((goal[i] - min) / (max - min) * 100)-2, 92) + 'px;">' + (iscash ? '$' : '') + addCommas((goal[i] / divide).round(-1)) + suffix + '</div>');
		}
		goalbars = '<div class="goal">' + bars.join('') + '</div>';
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


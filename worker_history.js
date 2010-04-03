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
};

History.set = function(what, value) {
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
	var i, j = 0, low = Number.POSITIVE_INFINITY, high = Number.NEGATIVE_INFINITY, min = Number.POSITIVE_INFINITY, max = Number.NEGATIVE_INFINITY, data = this.data, x = typeof what === 'string' ? what.split('.') : (typeof what === 'object' ? what : []), hour = Math.floor(Date.now() / 3600000);
	if (!x.length) {
		return this.data;
	}
	switch(x[1]) {
		default:
			throw ['UnknownHistoryError', 'Wanting to get unknwn type ' + x[1] + ' on ' + x[0]];
		case 'undefined':
			return data[hour][x[0]]; // only the current value
		case 'average':
			for (i in data) {
				j += (data[i][x[0]] || 0);
			}
			return Math.floor(j / length(data));
		case 'total':
			for (i in data) {
				j += (data[i][x[0]] || 0);
			}
			return j;
		case 'change':
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
};

History.dashboard = function() {
	var i, max = 0, list = [], output = [];
	list.push('<table cellspacing="0" cellpadding="0" class="golem-graph"><thead><tr><th></th><th colspan="73"><span style="float:left;">&lArr; Older</span>72 Hour History<span style="float:right;">Newer &rArr;</span><th></th></th></tr></thead><tbody>');
	list.push(this.makeGraph(['land', 'income'], 'Income', true, this.get('land.average') + this.get('income.average')));
	list.push(this.makeGraph('bank', 'Bank', true, this.get('bank.average')));
	list.push(this.makeGraph('exp', 'Experience', false, Player.get('maxexp')));
	list.push('</tbody></table>');
	$('#golem-dashboard-History').html(list.join(''));
}

History.makeGraph = function(type, title, iscash, goal) {
	var i, j, min = Number.POSITIVE_INFINITY, max = (goal || Number.NEGATIVE_INFINITY), max_s, min_s, goal_s, list = [], output = [], value = {}, colors = ['#00ff00', '#00aa00', '#0000bb', '#0000aa'], hour = Math.floor(Date.now() / 3600000), data = this.data, title, numbers;
	if (typeof goal === 'undefined') {
		goal = 0;
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
		numbers = [];
		title = (hour - i) + ' hour' + ((hour - i)==1 ? '' : 's') +' ago';
		for (j in value[i]) {
			output.push('<div style="background:' + colors[j] + ';height:' + Math.max(Math.ceil((value[i][j] - min) / (max - min) * 100), 0) + 'px;"></div>');
			if (value[i][j]) {
				numbers.push((value[i][j] ? (iscash ? '$' : '') + addCommas(value[i][j]) : ''));
			}
		}
		output.reverse();
		numbers.reverse();
		title = title + (numbers.length ? ', ' : '') + numbers.join(' + ') + (numbers.length > 1 ? ' = ' + (iscash ? '$' : '') + addCommas(sum(value[i])) : '');
		if (goal) {
			output.push('<div style="position:relative;background:#ff0000;height:1px;margin-top:-1px;bottom:' + Math.max(Math.ceil((goal - min) / (max - min) * 100), 0) + 'px;"></div>');
		}
		td(list, output.join(''), 'title="' + title + '"');
	}
	if (goal) {
		th(list, '<div style="position:relative;height:10px;color:#ff0000;bottom:' + Math.max(Math.ceil((goal - min) / (max - min) * 100)+2, 0) + 'px;">' + (iscash ? '$' : '') + goal_s + '</div>', 'class="goal"');
	}
	return '<tr>' + list.join('') + '</tr>';
}


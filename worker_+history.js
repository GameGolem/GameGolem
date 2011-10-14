/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Workers,
	Land, Player,
	APP, APPID, PREFIX, userID, imagepath,
	isRelease, version, revision, Images, window, browser,
	LOG_ERROR, LOG_WARN, LOG_LOG, LOG_INFO, LOG_DEBUG, log,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	isArray, isFunction, isNumber, isObject, isString, isWorker,
	sum, tr, th, td
*/
/********** Worker.History **********
* History of anything we want.
* Dashboard is exp, income and bank.
*
* History.set('key', value); - sets the current hour's value
* History.set([hour, 'key'], value); - sets the specified hour's value
* History.add('key', value); - adds to the current hour's value (use negative value to subtract)
* History.add([hour, 'key'], value); - adds to the specified hour's value (use negative value to subtract)
*
* History.get('key') - gets current hour's value
* History.get([hour, 'key', 'maths', 'change', recent_hours]) - 'key' is the only non-optional. Must be in this order. Hour = start hour. Recent_hours is 1-168 and the number of hours to get.
* History.get('key.change') - gets change between this and last value (use for most entries to get relative rather than absolute values)
* History.get('key.average') - gets standard deviated mean average of values (use .change for average of changes etc) - http://en.wikipedia.org/wiki/Arithmetic_mean
* History.get('key.geometric') - gets geometric average of values (use .change for average of changes etc) - http://en.wikipedia.org/wiki/Geometric_mean
* History.get('key.harmonic') - gets harmonic average of values (use .change for average of changes etc) - http://en.wikipedia.org/wiki/Harmonic_mean
* History.get('key.mode') - gets the most common value (use .change again if needed)
* History.get('key.median') - gets the center value if all values sorted (use .change again etc)
* History.get('key.total') - gets total of all values added together
* History.get('key.max') - gets highest value (use .change for highest change in values)
* History.get('key.min') - gets lowest value
*/
var History = new Worker('History');
History.option = History.runtime = History.temp = null;

History.settings = {
	system:true,
	taint:true
};

History.dashboard = function() {
	var list = [];
	list.push('<table cellspacing="0" cellpadding="0" class="golem-graph"><thead><tr><th></th><th colspan="73"><span style="float:left;">&lArr; Older</span>72 Hour History<span style="float:right;">Newer &rArr;</span><th></th></th></tr></thead><tbody>');
	list.push(this.makeGraph(['land', 'income'], 'Income', {prefix:'$', goal:{'Average Income':this.get('land.mean') + this.get('income.mean')}}));
	list.push(this.makeGraph('bank', 'Bank', {prefix:'$', goal:Land.runtime.best ? {'Next Land':Land.runtime.cost} : null})); // <-- probably not the best way to do this, but is there a function to get options like there is for data?
	list.push(this.makeGraph('exp', 'Experience', {goal:{'Next Level':Player.get('maxexp')}}));
	list.push(this.makeGraph('favor points', 'Favor Points',{min:0}));
	list.push(this.makeGraph('exp.change', 'Exp Gain', {min:0, goal:{'Average':this.get('exp.average.change'), 'Standard Deviation':this.get('exp.stddev.change')}} )); // , 'Harmonic Average':this.get('exp.harmonic.change') ,'Median Average':this.get('exp.median.change') ,'Mean Average':this.get('exp.mean.change')
	list.push('</tbody></table>');
	$('#golem-dashboard-History').html(list.join(''));
};

History.update = function(event) {
	var i, hour = Math.floor(Date.now() / 3600000) - 168;
	for (i in this.data) {
		if (i < hour) {
			this._set(['data',i]);
		}
	}
};

History.set = function(what, value, type) {
	var x = isArray(what) ? what.slice(0) : isString(what) ? what.split('.') : [];
	if (x.length && !(x[0] in this._datatypes)) {
		if (typeof x[0] !== 'number' && !/^\d+$/i.test(x[0])) {
			x.unshift(Math.floor(Date.now() / 3600000));
		}
		x.unshift('data');
	}
	return this._set(x, value, type);
};

History.add = function(what, value, type) {
	var x = isArray(what) ? what.slice(0) : isString(what) ? what.split('.') : [];
	if (x.length && !(x[0] in this._datatypes)) {
		if (typeof x[0] !== 'number' && !/^\d+$/i.test(x[0])) {
			x.unshift(Math.floor(Date.now() / 3600000));
		}
		x.unshift('data');
	}
	return this._add(x, value, type);
};

History.math = {
	stddev: function(list) {
		var i, l, listsum = 0, mean = this.mean(list);
		for (i = 0, l = list.length; i < l; i++) {
			listsum += Math.pow(list[i] - mean, 2);
		}
		listsum /= list.length;
		return Math.sqrt(listsum);
	},
	average: function(list) {
		var i, l, mean = this.mean(list), stddev = this.stddev(list);
		for (i = 0, l = list.length; i < l; i++) {
			if (Math.abs(list[i] - mean) > stddev * 2) { // The difference between the mean and the entry needs to be in there.
				delete list[i];
			}
		}
		return sum(list) / list.length;
	},
	mean: function(list) {
		return sum(list) / list.length;
	},
	harmonic: function(list) {
		var i, l, num = [];
		for (i = 0, l = list.length; i < l; i++) {
			if (list[i]) {
				num.push(1/list[i]);
			}
		}
		return num.length / sum(num);
	},
	geometric: function(list) {
		var i, l, num = 1;
		for (i = 0, l = list.length; i < l; i++) {
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
		var i = list.length, j = 0, count = 0, num = {}, max = 0;
		while (i--) {
			num[list[i]] = (num[list[i]] || 0) + 1;
		}
		for (i in num) {
			max = Math.max(max, num[i]);
		}
		for (i in num) {
			if (num[i] >= max) {
				j += i;
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
	var i, j, value, last, list = [], data = this.data, x = isArray(what) ? what : isString(what) ? what.split('.') : [], hour, past, change = false;
	if (x.length && (isNumber(x[0]) || !x[0].regex(/\D/gi))) {
		hour = x.shift();
	} else {
		hour = Math.floor(Date.now() / 3600000);
	}
	if (x.length && (isNumber(x[x.length-1]) || !x[x.length-1].regex(/\D/gi))) {
		past = Math.range(1, parseInt(x.pop(), 10), 168);
	} else {
		past = 168;
	}
	if (x.length && x[x.length-1] === 'change') {
		x.pop();
		change = true;
	}
	if (!x.length) {
		return data;
	}
	if (x.length === 1) { // We want a single hourly value only
		past = change ? 1 : 0;
	}
	for (i=hour-past; i<=hour; i++) {
		if (data[i]) {
			last = value;
			value = null;
			for (j in data[i]) {
				if ((j === x[0] || j.indexOf(x[0] + '+') === 0) && isNumber(data[i][j])) {
					value = (value || 0) + data[i][j];
				}
			}
			if (x.length > 1 && isNumber(value)) {
				if (!change) {
					list.push(value);
				} else if (isNumber(last)) {
					list.push(value - last);
					if (isNaN(list[list.length - 1])) {
						log(LOG_WARN, 'NaN: '+value+' - '+last);
					}
				}
			}
		}
	}
	if (x.length === 1) {
		return change ? value - last : value;
	}
	if (History.math[x[1]]) {
		return History.math[x[1]](list);
	}
	throw('Wanting to get unknown History type ' + x[1] + ' on ' + x[0]);
};

History.getTypes = function(what) {
	var i, list = [], types = {}, data = this.data, x = what + '+';
	for (i in data) {
		if (i.indexOf(x) === 0) {
			types[i] = true;
		}
	}
	for (i in types) {
		list.push(i);
	}
	return list;
};

History.makeGraph = function(type, title, options) {
	var i, j, count, min = isNumber(options.min) ? options.min : Number.POSITIVE_INFINITY, max = isNumber(options.max) ? options.max : Number.NEGATIVE_INFINITY, max_s, min_s, goal_s = [], list = [], bars = [], output = [], value = {}, goalbars = '', divide = 1, suffix = '', hour = Math.floor(Date.now() / 3600000), numbers, prefix = options.prefix || '', goal;
	if (isNumber(options.goal)) {
		goal = [options.goal];
	} else if (!isArray(options.goal) && !isObject(options.goal)) {
		goal = null;
	} else {
		goal = options.goal;
	}
	if (goal && length(goal)) {
		for (i in goal) {
			if (goal.hasOwnProperty(i)) {
				min = Math.min(min, goal[i]);
				max = Math.max(max, goal[i]);
			}
		}
	}
	if (isString(type)) {
		type = [type];
	}
	for (i=hour-72; i<=hour; i++) {
		value[i] = [0];
		if (this.data[i]) {
			for (j in type) {
				if (type.hasOwnProperty(j)) {
					value[i][j] = this.get(i + '.' + type[j]);
				}
			}
			if ((j = sum(value[i]))) {
				min = Math.min(min, j);
				max = Math.max(max, j);
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
	max_s = prefix + (max / divide).addCommas() + suffix;
	min = Math.floor(min / divide) * divide;
	min_s = prefix + (min / divide).addCommas() + suffix;
	if (goal && length(goal)) {
		for (i in goal) {
			if (goal.hasOwnProperty(i)) {
				bars.push('<div style="bottom:' + Math.max(Math.floor((goal[i] - min) / (max - min) * 100), 0) + 'px;"></div>');
				goal_s.push('<div' + (typeof i !== 'number' ? ' title="'+i+'"' : '') + ' style="bottom:' + Math.range(2, Math.ceil((goal[i] - min) / (max - min) * 100)-2, 92) + 'px;">' + prefix + (goal[i] / divide).addCommas(1) + suffix + '</div>');
			}
		}
		goalbars = '<div class="goal">' + bars.reverse().join('') + '</div>';
		goal_s.reverse();
	}
	th(list, '<div>' + max_s + '</div><div>' + title + '</div><div>' + min_s + '</div>');
	for (i=hour-72; i<=hour; i++) {
		bars = [];
		output = [];
		numbers = [];
		title = (hour - i) + ' hour' + ((hour - i)===1 ? '' : 's') +' ago';
		count = 0;
		for (j in value[i]) {
			if (value[i].hasOwnProperty(j)) {
				bars.push('<div style="height:' + Math.max(Math.ceil(100 * (value[i][j] - (!count ? min : 0)) / (max - min)), 0) + 'px;"></div>');
				count++;
				if (value[i][j]) {
					numbers.push((value[i][j] ? prefix + value[i][j].addCommas() : ''));
				}
			}
		}
		output.push('<div class="bars">' + bars.reverse().join('') + '</div>' + goalbars);
		numbers.reverse();
		title = title + (numbers.length ? ', ' : '') + numbers.join(' + ') + (numbers.length > 1 ? ' = ' + prefix + sum(value[i]).addCommas() : '');
		td(list, output.join(''), 'title="' + title + '"');
	}
	th(list, goal_s.join(''));
	return '<tr>' + list.join('') + '</tr>';
};


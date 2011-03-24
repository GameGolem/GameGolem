/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Dashboard, History:true, Page, Queue, Resources, Land,
	Battle, Generals, LevelUp, Player,
	APP, APPID, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, Divisor, length, sum, findInObject, objectIndex, sortObject, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime, warn,
	makeImage
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
History.option = History.temp = null;
History.settings = {
	system:true
};

History.dashboard = function() {
	var list = [];
	list.push('<table cellspacing="0" cellpadding="0" class="golem-graph"><thead><tr><th></th><th colspan="73"><span style="float:left;">&lArr; Older</span>72 Hour History<span style="float:right;">Newer &rArr;</span><th></th></th></tr></thead><tbody>');
	list.push(this.makeGraph(['land', 'income'], 'Income', {prefix:'$', goal:{'Average Income':this.get('land.mean') + this.get('income.mean')}}));
	list.push(this.makeGraph('bank', 'Bank', {prefix:'$', goal:Land.runtime.best ? {'Next Land':Land.runtime.cost} : null})); // <-- probably not the best way to do this, but is there a function to get options like there is for data?
	list.push(this.makeGraph('exp', 'Experience', {goal:{'Next Level':Player.get('maxexp')}}));
	list.push(this.makeGraph('favor points', 'Favor Points',{}));
	list.push(this.makeGraph('exp.change', 'Exp Gain', {goal:{'Average':this.get('exp.average.change'), 'Standard Deviation':this.get('exp.stddev.change'), 'Ignore entries above':(this.get('exp.mean.change') + (2 * this.get('exp.stddev.change')))}} )); // , 'Harmonic Average':this.get('exp.harmonic.change') ,'Median Average':this.get('exp.median.change') ,'Mean Average':this.get('exp.mean.change')
	list.push('</tbody></table>');
	$('#golem-dashboard-History').html(list.join(''));
};

History.update = function(event) {
	var i, hour = Math.floor(Date.now() / 3600000) - 168;
	for (i in this.data) {
		if (i < hour) {
			delete this.data[i];
		}
	}
//	console.log(warn(), 'Exp: '+this.get('exp'));
//	console.log(warn(), 'Exp max: '+this.get('exp.max'));
//	console.log(warn(), 'Exp max change: '+this.get('exp.max.change'));
//	console.log(warn(), 'Exp min: '+this.get('exp.min'));
//	console.log(warn(), 'Exp min change: '+this.get('exp.min.change'));
//	console.log(warn(), 'Exp change: '+this.get('exp.change'));
//	console.log(warn(), 'Exp mean: '+this.get('exp.mean.change'));
//	console.log(warn(), 'Exp harmonic: '+this.get('exp.harmonic.change'));
//	console.log(warn(), 'Exp geometric: '+this.get('exp.geometric.change'));
//	console.log(warn(), 'Exp mode: '+this.get('exp.mode.change'));
//	console.log(warn(), 'Exp median: '+this.get('exp.median.change'));
//	console.log(warn(), 'Average Exp = weighted average: ' + this.get('exp.average.change') + ', mean: ' + this.get('exp.mean.change') + ', geometric: ' + this.get('exp.geometric.change') + ', harmonic: ' + this.get('exp.harmonic.change') + ', mode: ' + this.get('exp.mode.change') + ', median: ' + this.get('exp.median.change'));
};

History.set = function(what, value) {
	if (!value) {
		return;
	}
	this._unflush();
	var hour = Math.floor(Date.now() / 3600000), x = isObject(what) ? what : isString(what) ? what.split('.') : [];
	if (x.length && (typeof x[0] === 'number' || !x[0].regex(/\D/gi))) {
		hour = x.shift();
	}
	this.data[hour] = this.data[hour] || {};
	this.data[hour][x[0]] = value;
};

History.add = function(what, value) {
	if (!value) {
		return;
	}
	this._unflush();
	var hour = Math.floor(Date.now() / 3600000), x = isObject(what) ? what : isString(what) ? what.split('.') : [];
	if (x.length && (typeof x[0] === 'number' || !x[0].regex(/\D/gi))) {
		hour = x.shift();
	}
	this.data[hour] = this.data[hour] || {};
	this.data[hour][x[0]] = (this.data[hour][x[0]] || 0) + value;
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
		var i, l, j = 0, count = 0, num = {};
		for (i = 0, l = list.length; i < l; i++) {
			num[list[i]] = (num[list[i]] || 0) + 1;
		}
		num = sortObject(num, function(a,b){return num[b]-num[a];});
		for (i in num) {
			if (num[i] === num[0]) {
				j += parseInt(num[i], 10);
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
	var i, j, value, last = null, list = [], data = this.data, x = isObject(what) ? what : isString(what) ? what.split('.') : [], hour = Math.floor(Date.now() / 3600000), exact = false, past = 168, change = false;
	if (x.length && (isNumber(x[0]) || !x[0].regex(/\D/gi))) {
		hour = x.shift();
	}
	if (x.length && (isNumber(x[x.length-1]) || !x[x.length-1].regex(/\D/gi))) {
		past = Math.range(1, parseInt(x.pop(), 10), 168);
	}
	if (!x.length) {
		return data;
	}
	for (i in data) {
		if (isNumber(data[i][x[0]])) {
			exact = true;
			break;
		}
	}
	if (x.length === 1) { // only the current value
		if (exact) {
			return data[hour][x[0]];
		}
		for (j in data[hour]) {
			if (j.indexOf(x[0] + '+') === 0 && isNumber(data[hour][j])) {
				value = (value || 0) + data[hour][j];
			}
		}
		return value;
	}
	if (x.length === 2 && x[1] === 'change') {
		if (data[hour] && data[hour-1]) {
			i = this.get([hour, x[0]]);
			j = this.get([hour - 1, x[0]]);
			if (isNumber(i) && isNumber(j)) {
				return i - j;
			}
			return 0;
		}
		return 0;
	}
	if (x.length > 2 && x[2] === 'change') {
		change = true;
	}
	for (i=hour-past; i<=hour; i++) {
		if (data[i]) {
			value = null;
			if (exact) {
				if (isNumber(data[i][x[0]])) {
					value = data[i][x[0]];
				}
			} else {
				for (j in data[i]) {
					if (j.indexOf(x[0] + '+') === 0 && isNumber(data[i][j])) {
						value = (value || 0) + data[i][j];
					}
				}
			}
			if (change) {
				if (value !== null && last !== null) {
					list.push(value - last);
					if (isNaN(list[list.length - 1])) {
						console.log(warn('NaN: '+value+' - '+last));
					}
				}
				last = value;
			} else {
				if (value !== null) {
					list.push(value);
				}
			}
		}
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
	var i, j, count, min = options.min || Number.POSITIVE_INFINITY, max = options.max || Number.NEGATIVE_INFINITY, max_s, min_s, goal_s = [], list = [], bars = [], output = [], value = {}, goalbars = '', divide = 1, suffix = '', hour = Math.floor(Date.now() / 3600000), numbers, prefix = options.prefix || '', goal;
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


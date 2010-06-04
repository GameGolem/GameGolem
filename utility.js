// Utility functions

// Prototypes to ease functionality

String.prototype.trim = function() {
	return this.replace(/^\s+|\s+$/g, '');
};

String.prototype.filepart = function() {
	var x = this.lastIndexOf('/');
	if (x >= 0) {
		return this.substr(x+1);
	}
	return this;
};

String.prototype.pathpart = function() {
	var x = this.lastIndexOf('/');
	if (x >= 0) {
		return this.substr(0, x+1);
	}
	return this;
};

String.prototype.regex = function(r) {
	var a = this.match(r), i;
	if (a) {
		a.shift();
		for (i=0; i<a.length; i++) {
			if (a[i] && a[i].search(/^[-+]?[0-9]*\.?[0-9]*$/) >= 0) {
				a[i] = parseFloat(a[i]);
			}
		}
		if (a.length===1) {
			return a[0];
		}
	}
	return a;
};

String.prototype.toNumber = function() {
	return parseFloat(this);
};

String.prototype.parseTimer = function() {
	var a = this.split(':'), b = 0, i;
	for (i=0; i<a.length; i++) {
		b = b * 60 + parseInt(a[i],10);
	}
	if (isNaN(b)) {
		b = 9999;
	}
	return b;
};

Number.prototype.round = function(dec) {
	return result = Math.round(this*Math.pow(10,(dec||0))) / Math.pow(10,(dec||0));
};

Math.range = function(min, num, max) {
	return Math.max(min, Math.min(num, max));
};

//Array.prototype.unique = function() { var o = {}, i, l = this.length, r = []; for(i=0; i<l;i++) o[this[i]] = this[i]; for(i in o) r.push(o[i]); return r; };
//Array.prototype.inArray = function(value) {for (var i in this) if (this[i] === value) return true;return false;};

var makeTimer = function(sec) {
	var h = Math.floor(sec / 3600), m = Math.floor(sec / 60) % 60, s = Math.floor(sec % 60);
	return (h ? h+':'+(m>9 ? m : '0'+m) : m) + ':' + (s>9 ? s : '0'+s);
};

var WorkerByName = function(name) { // Get worker object by Worker.name (case insensitive, use Workers[name] for case sensitive (and speed).
	if (typeof name === 'string') {
		for (var i in Workers) {
			if (i.toLowerCase() === name.toLowerCase()) {
				return Workers[i];
			}
		}
	}
	return null;
};

var WorkerById = function(id) { // Get worker object by panel id
	for (var i in Workers) {
		if (Workers[i].id === id) {
			return Workers[i];
		}
	}
	return null;
};

var Divisor = function(number) { // Find a "nice" value that goes into number up to 20 times
	var num = number, step = 1;
	if (num < 20) {
		return 1;
	}
	while (num > 100) {
		num /= 10;
		step *= 10;
	}
	num -= num % 5;
	if ((number / step) > 40) {
		step *= 5;
	} else if ((number / step) > 20) {
		step *= 2.5;
	}
	return step;
};

var length = function(obj) { // Find the number of entries in an object (also works on arrays)
	var l = 0, i;
	if (typeof obj === 'object') {
		for(i in obj) {
			l++;
		}
	} else if (typeof obj === 'array') {
		l = obj.length;
	}
	return l;
};

var unique = function (a) { // Return an array with no duplicates
	var o = {}, i, l = a.length, r = [];
	for(i = 0; i < l; i++) {
		o[a[i]] = a[i];
	}
	for(i in o) {
		r.push(o[i]);
	}
	return r;
};

var deleteElement = function(list, value) { // Removes matching elements from an array
	if (isArray(list)) {
		while (value in list) {
			list.splice(list.indexOf(value), 1);
		}
	}
}
			
var sum = function(a) { // Adds the values of all array entries together
	var i, t = 0;
	if (isArray(a)) {
		for(i=0; i<a.length; i++) {
			t += sum(a[i] || 0);
		}
	} else if (typeof a === 'object') {
		for(i in a) {
			t += sum(a[i]);
		}
	} else if (typeof a === 'number') {
		t = a;
	} else if (typeof a === 'string' && a.search(/^[-+]?[0-9]*\.?[0-9]*$/) >= 0) {
		t = parseFloat(a);
	}
	return t;
};

var addCommas = function(s) { // Adds commas into a string, ignore any number formatting
	var a=s ? s.toString() : '0', r=new RegExp('(-?[0-9]+)([0-9]{3})');
	while(r.test(a)) {
		a = a.replace(r, '$1,$2');
	}
	return a;
};

var findInArray = function(list, value) {
	if (typeof list === 'array' || typeof list === 'object') {
		for (var i in list) {
			if (list[i] === value) {
				return true;
			}
		}
	}
	return false;
};

var arrayIndexOf = function(list, value) {
	if (isArray(list)) {
		for (var i=0; i<list.length; i++) {
			if (list[i] === value) {
				return i;
			}
		}
	}
	return -1;
};

var arrayLastIndexOf = function(list, value) {
	if (isArray(list)) {
		for (var i=list.length-1; i>=0; i--) {
			if (list[i] === value) {
				return i;
			}
		}
	}
	return -1;
};


var sortObject = function(obj, sortfunc) {
	var list = [], output = {};
	for (i in obj) {
		list.push(i);
	}
	list.sort(sortfunc);
	for (i=0; i<list.length; i++) {
		output[list[i]] = obj[list[i]];
	}
	return output;
};

var getAttDefList = [];
var getAttDef = function(list, unitfunc, x, count, user) { // Find total att(ack) or def(ense) value from a list of objects (with .att and .def)
	var units = [], attack = 0, defend = 0, x2 = (x==='att'?'def':'att'), i, own;
	if (unitfunc) {
		for (i in list) {
			unitfunc(units, i, list);
		}
	} else {
		units = getAttDefList;
	}
	units.sort(function(a,b) {
		return (list[b][x] + (0.7 * list[b][x2])) - (list[a][x] + (0.7 * list[a][x2]));
	});
	for (i=0; i<units.length; i++) {
		own = typeof list[units[i]].own === 'number' ? list[units[i]].own : 1;
		if (user) {
			if (Math.min(count, own) > 0) {
//				debug('Utility','Using: '+Math.min(count, own)+' x '+units[i]+' = '+JSON.stringify(list[units[i]]));
				if (!list[units[i]].use) {
					list[units[i]].use = {};
				}
				list[units[i]].use[(user+'_'+x)] = Math.min(count, own);
			} else if (length(list[units[i]].use)) {
				delete list[units[i]].use[(user+'_'+x)];
				if (!length(list[units[i]].use)) {
					delete list[units[i]].use;
				}
			}
		}
//		if (count <= 0) {break;}
		own = Math.min(count, own);
		attack += own * list[units[i]].att;
		defend += own * list[units[i]].def;
		count -= own;
	}
	getAttDefList = units;
	return (x==='att'?attack:(0.7*attack)) + (x==='def'?defend:(0.7*defend));
};

var tr = function(list, html, attr) {
	list.push('<tr' + (attr ? ' ' + attr : '') + '>' + (html || '') + '</tr>');
};

var th = function(list, html, attr) {
	list.push('<th' + (attr ? ' ' + attr : '') + '>' + (html || '') + '</th>');
};

var td = function(list, html, attr) {
	list.push('<td' + (attr ? ' ' + attr : '') + '>' + (html || '') + '</td>');
};

var isArray = function(obj) {   
    return obj && typeof obj === 'object' && !(obj.propertyIsEnumerable('length')) && typeof obj.length === 'number';
};

var isNumber = function(num) {
	return typeof num === 'number';
};

var isWorker = function(obj) {
	return obj && typeof obj === 'object' && typeof obj.name === 'string' && typeof Workers[obj.name] === 'object' && Workers[obj.name] === obj; // Only a worker if it's an active worker
};

var plural = function(i) {
	return (i === 1 ? '' : 's');
};

// Simulates PHP's date function
Date.prototype.format = function(format) {
	var returnStr = '';
	var replace = Date.replaceChars;
	for (var i = 0; i < format.length; i++) {
		var curChar = format.charAt(i);
		if (replace[curChar]) {
			returnStr += replace[curChar].call(this);
		} else {
			returnStr += curChar;
		}
	}
	return returnStr;
};

Date.replaceChars = {
	shortMonths: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
	longMonths: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
	shortDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
	longDays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
	// Day
	d: function() { return (this.getDate() < 10 ? '0' : '') + this.getDate(); },
	D: function() { return Date.replaceChars.shortDays[this.getDay()]; },
	j: function() { return this.getDate(); },
	l: function() { return Date.replaceChars.longDays[this.getDay()]; },
	N: function() { return this.getDay() + 1; },
	S: function() { return (this.getDate() % 10 == 1 && this.getDate() != 11 ? 'st' : (this.getDate() % 10 == 2 && this.getDate() != 12 ? 'nd' : (this.getDate() % 10 == 3 && this.getDate() != 13 ? 'rd' : 'th'))); },
	w: function() { return this.getDay(); },
	z: function() { return "Not Yet Supported"; },
	// Week
	W: function() { return "Not Yet Supported"; },
	// Month
	F: function() { return Date.replaceChars.longMonths[this.getMonth()]; },
	m: function() { return (this.getMonth() < 9 ? '0' : '') + (this.getMonth() + 1); },
	M: function() { return Date.replaceChars.shortMonths[this.getMonth()]; },
	n: function() { return this.getMonth() + 1; },
	t: function() { return "Not Yet Supported"; },
	// Year
	L: function() { return (((this.getFullYear()%4==0)&&(this.getFullYear()%100 != 0)) || (this.getFullYear()%400==0)) ? '1' : '0'; },
	o: function() { return "Not Supported"; },
	Y: function() { return this.getFullYear(); },
	y: function() { return ('' + this.getFullYear()).substr(2); },
	// Time
	a: function() { return this.getHours() < 12 ? 'am' : 'pm'; },
	A: function() { return this.getHours() < 12 ? 'AM' : 'PM'; },
	B: function() { return "Not Yet Supported"; },
	g: function() { return this.getHours() % 12 || 12; },
	G: function() { return this.getHours(); },
	h: function() { return ((this.getHours() % 12 || 12) < 10 ? '0' : '') + (this.getHours() % 12 || 12); },
	H: function() { return (this.getHours() < 10 ? '0' : '') + this.getHours(); },
	i: function() { return (this.getMinutes() < 10 ? '0' : '') + this.getMinutes(); },
	s: function() { return (this.getSeconds() < 10 ? '0' : '') + this.getSeconds(); },
	// Timezone
	e: function() { return "Not Yet Supported"; },
	I: function() { return "Not Supported"; },
	O: function() { return (-this.getTimezoneOffset() < 0 ? '-' : '+') + (Math.abs(this.getTimezoneOffset() / 60) < 10 ? '0' : '') + (Math.abs(this.getTimezoneOffset() / 60)) + '00'; },
	P: function() { return (-this.getTimezoneOffset() < 0 ? '-' : '+') + (Math.abs(this.getTimezoneOffset() / 60) < 10 ? '0' : '') + (Math.abs(this.getTimezoneOffset() / 60)) + ':' + (Math.abs(this.getTimezoneOffset() % 60) < 10 ? '0' : '') + (Math.abs(this.getTimezoneOffset() % 60)); },
	T: function() { var m = this.getMonth(); this.setMonth(0); var result = this.toTimeString().replace(/^.+ \(?([^\)]+)\)?$/, '$1'); this.setMonth(m); return result;},
	Z: function() { return -this.getTimezoneOffset() * 60; },
	// Full Date/Time
	c: function() { return this.format("Y-m-d") + "T" + this.format("H:i:sP"); },
	r: function() { return this.toString(); },
	U: function() { return this.getTime() / 1000; }
};

var iscaap = function() {
	return (typeof caap != 'undefined');
};

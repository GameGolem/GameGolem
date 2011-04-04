/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global console, isString, isArray, isNumber, isUndefined, Workers, Worker, Settings, $ */
// Internal scripting language - never give access to eval() etc.

// '!testing.blah=1234 & yet.another.path | !something & test.me > 5'
// [[false,"testing","blah"],"=",1234,"&",["yet","another","path"],"|",[false,"something"],"&",["test","me"],">",5]
// _operators - >,>=,=,==,<=,<,!=,!==,&,&&,|,||
// values = option, path.to.option, number, "string"
// components:
//	"[^"]*"								- string
//	'[^']*'								- string
//	\d*\.?\d+(?:[eE][-+]?\d+)?			- number
//	true|false							- boolean constants
//	[#A-Za-z_]\w*(?:\.\w+)*				- variable
//	[!=]==								- 3-char operators (comparators)
//	[-+*/%<>!=]=						- 2-char operators (comparators)
//	\|\|								- 2-char or operator
//	&&									- 2-char and operator
//	[-+*/%<>!=(){},;]					- 1-char operators

// '!testing.blah=1234 & yet.another.path | !something & test.me > 5'
// [["testing","blah"],"=",1234,"&",["yet","another","path"],"|",["something"],"&",["test","me"],">",5]

var Script = new Worker('Script');
Script.data = Script.runtime = null;

Script.option = {
	worker:'Player',
	type:'data'
};

Script.settings = {
	system:true,
	debug:true,
	taint:true
};

Script.temp = {}; // Used for variables only!!!

Script.dashboard = function() {
	var i, path = this.option.worker+'.'+this.option.type, html = '', list = [];
	html += '<input id="golem_script_run" type="button" value="Run">';
	html += ' Using: <select id="golem_script_worker">';
	for (i=1; i<Settings.temp.paths.length; i++) {
		html += '<option value="' + Settings.temp.paths[i] + '"' + (Settings.temp.paths[i] === path ? ' selected' : '') + '>' + Settings.temp.paths[i] + '</option>';
	}
	html += '</select>';
	html += ' Result: <input id="golem_script_result" type="text" value="" disabled>';
	html += '<input id="golem_script_clear" style="float:right;" type="button" value="Clear">';
//	html += '<br style="clear:both;"><input type="text" id="golem_script_edit" placeholder="Enter code here" style="width:99%;">';
	html += '<br style="clear:both;"><textarea id="golem_script_edit" placeholder="Enter code here" style="width:99%;"></textarea>';
	html += '<textarea id="golem_script_source" placeholder="Compiled code" style="width:99%;" disabled></textarea>';
	$('#golem-dashboard-Script').html(html);
	$('#golem_script_worker').change(function(){
		var path = $(this).val().regex(/([^.]*)\.?(.*)/);
		if (path[0] in Workers) {
			Script.option.worker = path[0];
			Script.option.type = path[1];
		} else {
			Script.option.worker = Script.option.type = null;
		}
	});
	$('#golem_script_source').autoSize();
	$('#golem_script_edit').autoSize();
	$('#golem_script_run').click(function(){
		var script = Script.parse(Workers[Script.option.worker], Script.option.type, $('#golem_script_edit').val());
		$('#golem_script_source').val(script.length ? JSON.stringify(script, null, '   ') : '').autoSize();
		$('#golem_script_result').val(Script.interpret(script));
	});
	$('#golem_script_clear').click(function(){$('#golem_script_edit,#golem_script_source,#golem_script_result').val('');});
};

Script._find = function(op, table) {
	var i = table.length;
	while (i--) {
		if (table[i][0] === op) {
			return i;
		}
	}
	return -1;
};

Script._operators = [ // Order of precidence, [name, expand_args, function]
	// Unary/Prefix
	//['u++',	false,	function(l,r) {return this.temp[r] += 1;}],
	//['u--',	false,	function(l,r) {return this.temp[r] -= 1;}],
	['u+',	true,	function(l,r) {return r;}],
	['u-',	true,	function(l,r) {return -r;}],
	['u!',	true,	function(l,r) {return !r;}],
	['!',	true,	false],		// placeholder
	// Postfix
	//['p++',	false,	function(l) {var v = this.temp[l]; this.temp[l] += 1; return v;}],
	//['++',	false,	false],	// placeholder
	//['p--',	false,	function(l) {var v = this.temp[l]; this.temp[l] -= 1; return v;}],
	//['--',	false,	false],	// placeholder
	// Maths
	['*',	true,	function(l,r) {return l * r;}],
	['/',	true,	function(l,r) {return l / r;}],
	['%',	true,	function(l,r) {return l % r;}],
	['+',	true,	function(l,r) {return l + r;}],
	['-',	true,	function(l,r) {return l - r;}],
	// Equality
	['>',	true,	function(l,r) {return l > r;}],
	['>=',	true,	function(l,r) {return l >= r;}],
	['<=',	true,	function(l,r) {return l <= r;}],
	['<',	true,	function(l,r) {return l < r;}],
	['===',	true,	function(l,r) {return l === r;}],
	['!==',	true,	function(l,r) {return l !== r;}],
/*jslint eqeqeq:false */
	['==',	true,	function(l,r) {return l == r;}],
	['!=',	true,	function(l,r) {return l != r;}],
/*jslint eqeqeq:true */
	// Logical
	['&&',	true,	function(l,r) {return l && r;}],
	['||',	true,	function(l,r) {return l || r;}],
	// Assignment
	['=',	false,	function(l,r) {return (this.temp[l] = this._expand(r));}],
	['*=',	false,	function(l,r) {return (this.temp[l] *= this._expand(r));}],
	['/=',	false,	function(l,r) {return (this.temp[l] /= this._expand(r));}],
	['%=',	false,	function(l,r) {return (this.temp[l] %= this._expand(r));}],
	['+=',	false,	function(l,r) {return (this.temp[l] += this._expand(r));}],
	['-=',	false,	function(l,r) {return (this.temp[l] -= this._expand(r));}]
];

var FN_EXPAND = 0; // function(expand(args)), expanded variables -> values
var FN_RAW = 1; // function(args), unexpanded (so variable names are not changed to their values)
var FN_CUSTOM = 2; // function(script, value_list, op_list)

Script._functions = [ // [name, expand_args, function]
	['min',		FN_EXPAND,	function() {return Math.min.apply(Math, arguments);}],
	['max',		FN_EXPAND,	function() {return Math.max.apply(Math, arguments);}],
	['round',	FN_EXPAND,	function() {return Math.round.apply(Math, arguments);}],
	['floor',	FN_EXPAND,	function() {return Math.floor.apply(Math, arguments);}],
	['ceil',	FN_EXPAND,	function() {return Math.ceil.apply(Math, arguments);}],
	['if',		FN_CUSTOM,	function(script, value_list, op_list) { // if (test) {func} [else if (test) {func}]* [else {func}]?
		var x, fn = 'if', test = false;
		while (fn) {
			x = fn === 'if' ? script.shift() : null; // Should probably report some sort of error if not an array...
			fn = script.shift(); // Should probably report some sort of error if not an array...
			if (!test && (!x || (test = Script._interpret(x).pop()))) {
				value_list = value_list.concat(Script._interpret(fn));
			}
			if (script[0] !== 'else') {
				break;
			}
			fn = script.shift(); // 'else'
			if (script[0] === 'if') {
				fn = script.shift();
			}
		}
	}],
	['for',	FN_CUSTOM,	function(script, value_list, op_list) {
		var a, i = 0; x = [[],[],[]], tmp = script.shift(), fn = script.shift(), now = Date.now();
		while ((a = tmp.shift())) {
			if (a === ';') {
				x[++i] = [];
			} else {
				x[i].push(a);
			}
		}
		// Should probably report some sort of error if not an array...
		Script._interpret(x[0]);
		while (Script._interpret(x[1]).pop() && Date.now() - now < 3000) { // 3 second limit on loops
			Script._interpret(fn);
			Script._interpret(x[2]);
		}
	}],
	['while',	FN_CUSTOM,	function(script, value_list, op_list) {
		var x = script.shift(), fn = script.shift(), now = Date.now();
		while (Script._interpret(x).pop() && Date.now() - now < 3000) { // 3 second limit on loops
			Script._interpret(fn);
		}
	}],
	['return',	FN_CUSTOM,	function(script, value_list, op_list) {
		var x = script.shift();
		Script._return = Script._interpret(isArray(x) ? x : [x]);
	}]
];

Script._expand = function(variable) { // Expand variables into values
	if (variable) {
		if (isArray(variable)) {
			var i = variable.length;
			while (i--) {
				variable[i] = arguments.callee.call(this, variable[i]);
			}
		} else if (isString(variable) && variable[0] === '#') {
			return this.temp[variable];
		}
	}
	return variable;
};

// Perform any operations of lower precedence than "op"
// Both op_list and value_list are altered
Script._operate = function(op, op_list, value_list) {
	var i, tmp, fn, args;
	while (op_list.length && op_list[0][0] <= op) {
		tmp = op_list.shift();
		fn = this._operators[tmp[0]][2];
		if ((i = fn.length)) { // function takes set args
			args = value_list.splice(-i, i);
			// pad out values to the left, if missing
			while (args.length < i) {
				args.unshift(null);
			}
		} else {
			args = value_list.splice(tmp[1], value_list.length - tmp[1]); // Args from the end
		}
		if (this._operators[tmp[0]][1]) {
			args = this._expand(args);
		}
//		console.log(log('Perform: '+this._operators[tmp[0]][0]+'('+args+')'));
		value_list.push(fn.apply(this, args));
	}
	if (this._operators[op]) {
		op_list.unshift([op, value_list.length]);
	}
};

Script._return = undefined;

// Interpret our script, return a single value
Script._interpret = function(_script) {
	var x, y, z, fn, value_list = [], op_list = [], script = _script.slice(0), test;
	while (!this._return && (x = script.shift()) !== null && !isUndefined(x)) {
		if (isArray(x)) {
			value_list = value_list.concat(arguments.callee.call(this, x));
		} else if (isString(x)) {
			if (x === ';') {
				this._operate(Number.MAX_VALUE, op_list, value_list);
				value_list = [];
				op_list = [];
			} else if ((fn = Script._find(x, this._operators)) >= 0) {
				this._operate(fn, op_list, value_list);
			} else if ((fn = Script._find(x, this._functions)) >= 0) {
				if (this._functions[fn][1] === FN_CUSTOM) {
					value_list.push(this._functions[fn][2].call(this, script, value_list, op_list));
				} else {
					x = script.shift(); // Should probably report some sort of error if not an array...
					x = arguments.callee.call(this, x);
					if (this._functions[fn][1] === FN_EXPAND) {
						x = this._expand(x);
					}
					value_list.push(this._functions[fn][2].apply(this, x));
				}
			} else if (/^[A-Z]\w*(?:\.\w+)*$/.test(x)) {
				x = x.split('.');
				value_list.push(Workers[x[0]]._get(x.slice(1), false));
			} else if (/^".*"$/.test(x)) {
				x = x.replace(/^"|"$/g, '');
				z = '';
				while (y = x.match(/^(.*)\\(.)(.*)$/)) {
					z = y[1] + y[2];
					x = y[3];
				}
				z += x;
				value_list.push(z);
			} else if (/^'.*'$/.test(x)) {
				x = x.replace(/^'|'$/g, '');
				z = '';
				while (y = x.match(/^(.*)\\(.)(.*)$/)) {
					z = y[1] + y[2];
					x = y[3];
				}
				z += x;
				value_list.push(z);
			} else if (x[0] === '#') {
				value_list.push(x);
			} else {
				console.log(error('Bad string format: '+x));
				value_list.push(x); // Should never hit this...
			}
		} else { // number or boolean
			value_list.push(x);
		}
	}
	this._operate(Number.MAX_VALUE, op_list, value_list);
	return this._return || value_list;
};

Script.interpret = function(script) {
	this.temp = {};
	this._return = undefined;
	return this._expand((this._interpret(script)).pop());
};

Script.parse = function(worker, datatype, text, map) {
	var atoms = (text + ';').regex(new RegExp('\\s*(' +
	  '"(?:\\\\.|[^"])*"' +					// string quoted with "
	  "|'(?:\\\\.|[^'])*'" +				// string quoted with '
	  '|\\d*\\.?\\d+(?:[eE][-+]?\\d+)?' +	// number
	  '|\\btrue\\b|\\bfalse\\b' +			// boolean
	  '|[#A-Za-z_]\\w*(?:\\.\\w+)*\\b' +	// variable
	  '|[!=]==' +							// 3-char operator
	  '|[-+*/%<>!=]=' +						// 2-char operator
	  '|\\+\\+(?=\\s*[#A-Za-z_,;}])' +		// increment
	  '|--(?=\\s*[#A-Za-z_,;}])' +			// decrement
	  '|&&' +								// boolean and
	  '|\\|\\|' +							// boolean or
	  '|[-+*/%<>!=]' +						// 1-char operator
	  '|[(){};]' +							// grouping, separator, terminator
	  '|\\s+' +								// spaces
	  '|[^#\\w\\.\\s"]+' +					// other ?
	  ')', 'gm'));
	if (atoms === null || isUndefined(atoms)) {
		return []; // Empty script
	}
	map = map || {};
	return (function() {
		var atom, path, script = [], i;
		while ((atom = atoms.shift()) !== null && !isUndefined(atom)) {
			if (atom === '(' || atom === '{') {
				script.push(arguments.callee());
			} else if (atom === ')') {
				break;
			} else if (atom === '}') {
				if (!script.length || script[script.length-1] !== ';') {
					script.push(';');
				}
				break;
			} else if (atom === 'true') {
				script.push(true);
			} else if (atom === 'false') {
				script.push(false);
			} else if (atom === ';') { // newline (resets values)
				if (script.length && script[script.length-1] !== ';') {
					script.push(atom);
				}
			} else if ((i = Script._find(atom, Script._operators)) !== -1) { // operator
				// unary op
				if (!script.length || Script._find(script[script.length-1], Script._operators) !== -1) {
					if (Script._find('u' + atom, Script._operators) !== -1) {
						//console.log(warn(), 'unary/prefix [' + atom + ']');
						atom = 'u' + atom;
					} else {
						console.log(warn(), 'unary/prefix [' + atom + '] is not supported');
					}
				} else if (Script._operators[i][2] === false) {
					if (Script._find('p' + atom, Script._operators) !== -1) {
						//console.log(warn(), 'postifx [' + atom + ']');
						atom = 'p' + atom;
					} else {
						console.log(warn(), 'postifx [' + atom + '] is not supported');
					}
				}
				script.push(atom);
			} else if (atom[0] === '#' // variable
				|| isNumber(atom) // number
				|| /^".*"$/.test(atom) // string
				|| /^'.*'$/.test(atom) // string
				//|| Script._find(atom, Script._operators) !== -1 // operator
				|| Script._find(atom, Script._functions) !== -1) { // function
				script.push(atom);
			} else if (atom !== ',') { // if it's not a comma, then worker.datatype.key or path.to.key
				if (map[atom]) {
					path = map[atom].split('.');
				} else {
					path = atom.split('.');
				}
				if (!Workers[path[0]]) {
					if (isUndefined(worker._datatypes[path[0]])) {
						path.unshift(datatype);
					}
					path.unshift(worker.name);
				}
				script.push(path.join('.'));
			}
		}
//		console.log('Script section: '+JSON.stringify(script));
		if (script[script.length-1] === ';') {
			script.pop();
		}
		return script;
	}());
};


/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global console, isString, isArray, isNumber, isUndefined, Workers, Worker, Settings, $ */
// Internal scripting language - never give access to eval() etc.

// '!testing.blah=1234 & yet.another.path | !something & test.me > 5'
// [[false,"testing","blah"],"=",1234,"&",["yet","another","path"],"|",[false,"something"],"&",["test","me"],">",5]
// _operators - >,>=,=,==,<=,<,!=,!==,&,&&,|,||
// values = option, path.to.option, number, "string"
// /(\(?)\s*("[^"]*"|[\d]+|[^\s><=!*^$&|]+)\s*(\)?)\s*(>|>=|={1,2}|<=|<|!={1,2}|&{1,2}|\|{1,2})?\s*/g

// '!testing.blah=1234 & yet.another.path | !something & test.me > 5'
// [["testing","blah"],"=",1234,"&",["yet","another","path"],"|",["something"],"&",["test","me"],">",5]

var Script = new Worker('Script');
Script.data = Script.runtime = Script.temp = null;

Script.option = {
	worker:'Player',
	type:'data'
};

Script.settings = {
	system:true,
	advanced:true
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
//	html += '<br style="clear:both;"><input type="text" id="golem_script_edit" placeholder="Enter code here" style="width:570px;">';
	html += '<br style="clear:both;"><textarea id="golem_script_edit" placeholder="Enter code here" style="width:570px;"></textarea>';
	html += '<textarea id="golem_script_source" placeholder="Compiled code" style="width:570px;" disabled></textarea>';
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
		$('#golem_script_result').val(Script.interpret(script)).autoSize();
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
	// Unary
	['!',	true,	function(l) {return !l;}],
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

Script._functions = [ // [name, expand_args, function]
	['min',		true,	function() {return Math.min.apply(Math, arguments);}],
	['max',		true,	function() {return Math.max.apply(Math, arguments);}],
	['round',	true,	function() {return Math.round.apply(Math, arguments);}],
	['floor',	true,	function() {return Math.floor.apply(Math, arguments);}],
	['ceil',	true,	function() {return Math.ceil.apply(Math, arguments);}]
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
	var x, x2, fn, value_list = [], op_list = [], script = _script.slice(0), test;
	while (!this._return && (x = script.shift())) {
		if (isArray(x)) {
			value_list = value_list.concat(arguments.callee.call(this, x));
		} else if (isString(x)) {
			if (x === ';') {
				this._operate(Number.MAX_VALUE, op_list, value_list);
				value_list = [];
				op_list = [];
			} else if (x === 'return') {
				x = script.shift();
				this._return = arguments.callee.call(this, isArray(x) && !Workers[x[0]] ? x : [x]);
			} else if (x === 'if') { // if (test) {func} [else if (test) {func}]* [else {func}]?
				test = false;
				fn = 'if';
				while (fn) {
					x = fn === 'if' ? script.shift() : null;
					fn = script.shift();
					if (!test && (!x || (test = (arguments.callee.call(this, isArray(x) ? x : [x])[0])))) {
						value_list = value_list.concat(arguments.callee.call(this, isArray(fn) ? fn : [fn]));
					}
					if (script[0] !== 'else') {
						break;
					}
					fn = script.shift(); // 'else'
					if (script[0] === 'if') {
						fn = script.shift();
					}
				}
			} else if ((fn = Script._find(x, this._operators)) >= 0) {
				this._operate(fn, op_list, value_list);
			} else if ((fn = Script._find(x, this._functions)) >= 0) {
				x = script.shift();
				// Should probably report some sort of error if not an array...
				x = arguments.callee.call(this, isArray(x) ? x : [x]);
				if (this._functions[fn][1]) {
					x = this._expand(x);
				}
				value_list.push(this._functions[fn][2].apply(this, x));
			} else if (/^[A-Z][\w\.]+$/.test(x)) {
				x = x.split('.');
				value_list.push(Workers[x[0]]._get(x.slice(1), false));
			} else if (/^".*"$/.test(x)) {
				value_list.push(x.replace(/^"|"$/g, ''));
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
	var atoms = text.regex(/\s*("[^"]*"|[\d]+|true|false|if|else|return|[#A-Za-z_][\w\.]*|\(|\)|\{|\}|;|[^#\w\.\s"]+)[\s\n\r]*/g);
	if (!atoms) {
		return []; // Empty script
	}
	map = map || {};
	return (function() {
		var atom, path, script = [];
		while ((atom = atoms.shift())) { // "(", value, ")", operator
			if (atom === '(' || atom === '{') {
				script.push(arguments.callee());
			} else if (atom === ')') {
				break;
			} else if (atom === '}') {
				if (script.length && script[script.length-1] !== ';') {
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
			} else if (atom[0] === '#' // variable
				|| atom === 'if' || atom === 'else' // flow control
				|| atom === 'return' // return statement
				|| isNumber(atom) // number
				|| /^".*"$/.test(atom) // string
				|| Script._find(atom, Script._operators) !== -1 // operator
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


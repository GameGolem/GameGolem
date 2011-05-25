/*
 * Scripting withing Golem.
 * This is a scripting language built inside javascript.
 * It has a javascript like syntax, however all local variables must begin with a # (#test etc)
 */

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

/**
 * Script class
 * @constructor
 * @param {string} source Source to the script
 * @param {Object} options Various options for compiling and running
 * - data:{} An object used for storing / retreiving variables from - only needed for persistance
 * - default:{} An object used for read-only access if not found in data:
 * - map:{} A translation map for shortcuts, must be fully qualified paths (ie, "energy":"Player.data.energy") - it will only be used so long as there isn't a "data:<map>" entry
 */
function Script(source, options) {
	options = isObject(options) ? options : isString(options) ? {'data':options} : {};
	this['map'] = options['map'] || {};
	this['data'] = options['data'] || {};
	this['default'] = options['default'] || {};
	this['source'] = source || '';
	this['script'] = source || [];
	this['result'] = undefined;

	this.parse();
};

Script.prototype.toString = Script.prototype.toJSON = function() {
	return '[script \'' + this.source + '\']';
};

Script.prototype._find = function(op, table) {
	var i = table.length;
	while (i--) {
		if (table[i][0] === op) {
			return i;
		}
	}
	return -1;
};

Script.prototype._operators = [ // Order of precidence, [name, expand_args, function]
	// Unary/Prefix
	['u++',	false,	function(l,r) {var v = parseInt(this._rvalue(r),10); this._lvalue(r, v + 1); return v;}],
	['u--',	false,	function(l,r) {var v = parseInt(this._rvalue(r),10); this._lvalue(r, v - 1); return v;}],
	['u+',	true,	function(l,r) {return parseInt(r,10);}],
	['u-',	true,	function(l,r) {return -parseInt(r,10);}],
	['u!',	true,	function(l,r) {return !r;}],
	// Postfix
	['p++',	false,	function(l,r) {var v = parseInt(this._rvalue(r),10) + 1; this._lvalue(r, v); return v;}],
	['p--',	false,	function(l,r) {var v = parseInt(this._rvalue(r),10) - 1; this._lvalue(r, v); return v;}],
	// Placeholders for Unary/Prefix/Postfix - only needed if there's not a normal one
	['!',	true,	false],	// placeholder
	['++',	true,	false],	// placeholder
	['--',	true,	false],	// placeholder
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
	['=',	false,	function(l,r) {return this._lvalue(l, this._rvalue(r));}],
	['*=',	false,	function(l,r) {return this._lvalue(l, l * this._rvalue(r));}],
	['/=',	false,	function(l,r) {return this._lvalue(l, l / this._rvalue(r));}],
	['%=',	false,	function(l,r) {return this._lvalue(l, l % this._rvalue(r));}],
	['+=',	false,	function(l,r) {return this._lvalue(l, l + this._rvalue(r));}],
	['-=',	false,	function(l,r) {return this._lvalue(l, l - this._rvalue(r));}]
];

Script.FN_rvalue = 0; // function(expand(args)), expanded variables -> values
Script.FN_RAW = 1; // function(args), unexpanded (so variable names are not changed to their values)
Script.FN_CUSTOM = 2; // function(script, value_list, op_list)

Script.prototype._functions = [ // [name, expand_args, function]
	['min',		Script.FN_rvalue,	function() {return Math.min.apply(Math, arguments);}],
	['max',		Script.FN_rvalue,	function() {return Math.max.apply(Math, arguments);}],
	['round',	Script.FN_rvalue,	function() {return Math.round.apply(Math, arguments);}],
	['floor',	Script.FN_rvalue,	function() {return Math.floor.apply(Math, arguments);}],
	['ceil',	Script.FN_rvalue,	function() {return Math.ceil.apply(Math, arguments);}],
	['if',		Script.FN_CUSTOM,	function(script, value_list, op_list) { // if (test) {func} [else if (test) {func}]* [else {func}]?
		var x, fn = 'if', test = false;
		while (fn) {
			x = fn === 'if' ? script.shift() : null; // Should probably report some sort of error if not an array...
			fn = script.shift(); // Should probably report some sort of error if not an array...
			if (!test && (!x || (test = this._interpret(x).pop()))) {
				value_list = value_list.concat(this._interpret(fn));
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
	['for',	Script.FN_CUSTOM,	function(script, value_list, op_list) {
		var a, i = 0; x = [[],[],[]], tmp = script.shift(), fn = script.shift(), now = Date.now();
		while ((a = tmp.shift())) {
			if (a === ';') {
				x[++i] = [];
			} else {
				x[i].push(a);
			}
		}
		// Should probably report some sort of error if not an array...
		this._interpret(x[0]);
		while (this._interpret(x[1]).pop() && Date.now() - now < 3000) { // 3 second limit on loops
			this._interpret(fn);
			this._interpret(x[2]);
		}
	}],
	['while',	Script.FN_CUSTOM,	function(script, value_list, op_list) {
		var x = script.shift(), fn = script.shift(), now = Date.now();
		while (this._interpret(x).pop() && Date.now() - now < 3000) { // 3 second limit on loops
			this._interpret(fn);
		}
	}],
	['return',	Script.FN_CUSTOM,	function(script, value_list, op_list) {
		var x = script.shift();
		this.result = this._interpret(isArray(x) ? x : [x]);
	}]
];

/**
 * Find the value of a variable using const, default and data
 */
Script.prototype._rvalue = function(variable) { // Expand variables into values
	var i, x, worker;
	if (isArray(variable)) { // Special case - an array of variables
		i = variable.length;
		while (i--) {
			variable[i] = arguments.callee.call(this, variable[i]);
		}
	} else if (isString(variable)) {
		if (/^".*"$/.test(variable) || /^'.*'$/.test(variable)) {
			variable = variable.replace(/^"|^'|'$|"$/g, '');
			i = '';
			while (y = variable.match(/^(.*)\\(.)(.*)$/)) {
				i = y[1] + y[2];
				variable = y[3];
			}
			variable = i + variable;
		} else if (/^[A-Z]\w*(?:\.\w+)*$/.test(variable)) {
			x = variable.split('.');
			variable = Workers[x[0]]._get(x.slice(1), false);
		} else {
			if (isObject(this['data'])) {
				i = this['data'][variable];
			} else if (isString(this['data'])) {
				x = (this['data'] + '.' + variable).split('.');
				i = Workers[x[0]].get(x.slice(1))
			} else {
				i = undefined; // Error!!!
			}
			if (!isUndefined(i)) {
				variable = i;
			} else {
				if (this.map[variable]) {
					x = this.map[variable].split('.');
					variable = Workers[x[0]]._get(x.slice(1), false);
				} else {
					variable = this['default'][variable];
				}
			}
		}
	}
	return variable;
};

// Push value back into variable
Script.prototype._lvalue = function(variable, value) {
	if (isObject(this['data'])) {
		this['data'][variable] = value;
	} else if (isString(this['data'])) {
		var x = (this['data'] + '.' + variable).split('.');
		Workers[x[0]].set(x.slice(1), value);
	} else {
		// Error
	}
};

// Perform any operations of lower precedence than "op"
// Both op_list and value_list are altered
Script.prototype._operate = function(op, op_list, value_list) {
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
			args = this._rvalue(args);
		}
//		log(LOG_LOG, 'Perform: '+this._operators[tmp[0]][0]+'('+args+')');
		value_list.push(fn.apply(this, args));
	}
	if (this._operators[op]) {
		op_list.unshift([op, value_list.length]);
	}
};

// Interpret our script, return a single value
Script.prototype._interpret = function(script) {
	var x, y, z, fn, value_list = [], op_list = [], test;
	script = script.slice(0); // Make sure we're a copy as we damage it
	while (!this.result && (x = script.shift()) !== null && !isUndefined(x)) {
		if (isArray(x)) {
			value_list = value_list.concat(arguments.callee.call(this, x));
		} else if (isString(x)) {
			if (x === ';') {
				this._operate.call(this, Number.MAX_VALUE, op_list, value_list);
				value_list = [];
				op_list = [];
			} else if ((fn = this._find(x, this._operators)) >= 0) {
				this._operate.call(this, fn, op_list, value_list);
			} else if ((fn = this._find(x, this._functions)) >= 0) {
				if (this._functions[fn][1] === Script.FN_CUSTOM) {
					value_list.push(this._functions[fn][2].call(this, script, value_list, op_list));
				} else {
					x = script.shift(); // Should probably report some sort of error if not an array...
					x = arguments.callee.call(this, x);
					if (this._functions[fn][1] === Script.FN_rvalue) {
						x = this._rvalue(x);
					}
					value_list.push(this._functions[fn][2].apply(this, x));
				}
			} else { // A "normal" variable of some type
				value_list.push(x);
			}
		} else { // number or boolean
			value_list.push(x);
		}
	}
	this._operate(Number.MAX_VALUE, op_list, value_list);
	return this.result || value_list;
};

/**
 * Run the parsed script, optionally resetting the data first
 * @param {Boolean} reset Should we clear data first?
 */
Script.prototype.run = function(reset) {
	if (reset) {
		this.reset();
	} else {
		this.result = undefined;
	}
	return this._rvalue((this._interpret(this.script)).pop());
};

Script.prototype.reset = function() {
	var x, i, data;
	if (isObject(this['data'])) {
		data = this['data'];
	} else if (isString(this['data'])) {
		x = this['data'].split('.');
		data = Workers[x[0]].get(x.slice(1), {});
	} else {
		data = {}; // Error
	}
	for (i in data) {
		delete data[i];
	}
	this.result = undefined;
};

Script.prototype.parse = function() {
	var atoms = (this['source'] + ';').regex(new RegExp('[\\t\\v\\f \\u00a0\\u2000\\u2001\\u2002\\u2003\\u2004\\u2005\\u2006\\u2007\\u2008\\u2009\\u200a\\u200b\\u2028\\u2029\\u3000]*' + // "/s" without "/n/r"
	  '(' +
		'"(?:\\\\.|[^"])*"' +				// string quoted with "
		"|'(?:\\\\.|[^'])*'" +				// string quoted with '
		'|\\d*\\.?\\d+(?:[eE][-+]?\\d+)?' +	// number
		'|\\btrue\\b|\\bfalse\\b' +			// boolean
		'|[#A-Za-z_]\\w*(?:\\.\\w+)*\\b' +	// variable
		'|[!=]==' +							// 3-char operator
		'|[-+*/%<>!=]=' +					// 2-char operator
//		'|\\+\\+(?=\\s*[#A-Za-z_,;}])' +	// increment
//		'|--(?=\\s*[#A-Za-z_,;}])' +		// decrement
		'|\\+\\+' +							// increment
		'|--' +								// decrement
		'|&&' +								// boolean and
		'|\\|\\|' +							// boolean or
		'|[-+*/%<>!=]' +					// 1-char operator
		'|[(){}\\n\\r;]' +					// grouping, separator, terminator
		'|\\s+' +							// spaces
		'|[^#\\w\\.\\s"]+' +				// other ?
	  ')', 'gm'));
//	log('Atoms: ' + JSON.stringify(atoms));
	this['script'] = !atoms || !atoms.length ? [] : (function(map) {
		var atom, path, script = [], i;
		while ((atom = atoms.shift()) !== null && !isUndefined(atom)) {
			if (atom === '(' || atom === '{') {
				script.push(arguments.callee.call(this));
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
			} else if (atom === ';' || atom === '\n' || atom === '\r') { // newline
				if (script.length && script[script.length-1] !== ';') {
					script.push(';');
				}
			} else if ((i = this._find(atom, this._operators)) !== -1) { // operator
				// unary op
				if (!script.length || script[script.length-1] !== ';' || this._find(script[script.length-1], this._operators) !== -1) {
					if (this._find('u' + atom, this._operators) !== -1) {
						atom = 'u' + atom;
					}
				} else if (this._operators[i][2] === false) {
					if (this._find('p' + atom, this._operators) !== -1) {
						atom = 'p' + atom;
					}
				}
				script.push(atom);
			} else if (atom[0] === '#' // variable
				|| isNumber(atom) // number
				|| /^".*"$/.test(atom) // string
				|| /^'.*'$/.test(atom) // string
				//|| this._find(atom, this._operators) !== -1 // operator
				|| this._find(atom, this._functions) !== -1) { // function
				script.push(atom);
			} else if (atom !== ',') { // if it's not a comma, then worker.datatype.key or path.to.key
				script.push(atom);
			}
		}
//		log(LOG_DEBUG, 'Script section: '+JSON.stringify(script));
		if (script[script.length-1] === ';') {
			script.pop();
		}
		return script;
	}.call(this, this['map']));
};


/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global console, isArray, isNumber, isUndefined, Workers */
// Internal scripting language - never give access to eval() etc.

// '!testing.blah=1234 & yet.another.path | !something & test.me > 5'
// [[false,"testing","blah"],"=",1234,"&",["yet","another","path"],"|",[false,"something"],"&",["test","me"],">",5]
// operators - >,>=,=,==,<=,<,!=,!==,&,&&,|,||
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

Script.dashboard = function() {
	var i, path = this.option.worker+'.'+this.option.type, html = '', list = [];
//	html += '<input id="golem_script_test" type="button" value="Test">';
	html += ' Using: <select id="golem_script_worker">';
	for (i=1; i<Settings.temp.paths.length; i++) {
		html += '<option value="' + Settings.temp.paths[i] + '"' + (Settings.temp.paths[i] === path ? ' selected' : '') + '>' + Settings.temp.paths[i] + '</option>';
	}
	html += '</select>';
	html += ' Result: <input id="golem_script_result" type="text" value="" disabled>';
	html += '<input id="golem_script_clear" style="float:right;" type="button" value="Clear">';
	html += '<br style="clear:both;"><input type="text" id="golem_script_edit" placeholder="Enter code here" style="width:570px;">';
//	html += '<br>Script: <textarea id="golem_script_edit" style="width:570px;"></textarea>';
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
	$('#golem_script_edit').autoSize().change(function(){
		var script = Script.parse(Workers[Script.option.worker], Script.option.type, $('#golem_script_edit').val());
		$('#golem_script_source').val(script.length ? JSON.stringify(script, null, '   ') : '').autoSize();
		$('#golem_script_result').val(Script.interpret(script)).autoSize();
	});
	$('#golem_script_clear').click(function(){$('#golem_script_edit').val('');});
};

Script.find = function(op) {
	var i, l = this.operate.length;
	for (i=0; i < l; i++) {
		if (Script.operate[i][0] === op) {
			return i;
		}
	}
	return -1;
};

Script.operate = [ // Order of precidence
	// Unary
	['!',	function(l) {return !l;}],
	// Maths
	['*',	function(l,r) {return l * r;}],
	['/',	function(l,r) {return l / r;}],
	['%',	function(l,r) {return l % r;}],
	['+',	function(l,r) {return l + r;}],
	['-',	function(l,r) {return l - r;}],
	// Complex
	['min',	function() {return Math.min.apply(Math, arguments);}],
	['max',	function() {return Math.max.apply(Math, arguments);}],
	['round',	function() {return Math.round.apply(Math, arguments);}],
	['floor',	function() {return Math.floor.apply(Math, arguments);}],
	['ceil',	function() {return Math.ceil.apply(Math, arguments);}],
	// Equality
	['>',	function(l,r) {return l > r;}],
	['>=',	function(l,r) {return l >= r;}],
	['<=',	function(l,r) {return l <= r;}],
	['<',	function(l,r) {return l < r;}],
	['==',	function(l,r) {return l == r;}],
	['!=',	function(l,r) {return l != r;}],
	// Logical
	['&&',	function(l,r) {return l && r;}],
	['||',	function(l,r) {return l || r;}]
];

// Interpret our script, return a single value
Script.interpret = function(script) {
	return (function(script){
		var i, x, path, value = [], last = -1, op_list = [], fn = function(op) {
			var i, tmp, args;
			while (op_list.length && op_list[0][0] <= op) {
				tmp = op_list.shift();
				if ((i = Script.operate[tmp[0]][1].length)) { // function takes set args
					args = value.splice(-i, i);
				} else {
					args = value.splice(tmp[1], value.length - tmp[1]); // Args from the end
				}
//				console.log(Script.operate[tmp[0]][0]+'('+args+')');
				value.push(Script.operate[tmp[0]][1].apply(null, args));
			}
			if (Script.operate[op]) {
				op_list.unshift([op, value.length]);
			}
			return -1;
		};
		while ((x = script.shift())) {
			if (isArray(x)) {
				if (Workers[x[0]]) {
					path = x.slice(1);
					value.push(Workers[x[0]]._get(path, false));
				} else {
					value = value.concat(arguments.callee(x));
				}
			} else if ((last = Script.find(x)) === -1) {
				if (/^".*"$/.test(x)) {
					value.push(x.replace(/^"|"$/g, ''));
				} else {
					value.push(x);
				}
			}
			last = fn(last);
		}
		fn(Number.MAX_VALUE);
		return value;
	}(script.slice(0)))[0];
};

Script.parse = function(worker, datatype, text, map) {
	var atoms = text.regex(/\s*("[^"]*"|[\d]+|[A-Za-z_][\w\.]*|[^\w\.\s"]+)[\s\n\r]*/g);
	if (!atoms) {
		return []; // Empty script
	}
	map = map || {};
	return (function() {
		var atom, path, script = [];
		while ((atom = atoms.shift())) { // "(", value, ")", operator
			if (atom === '(') {
				script.push(arguments.callee());
			} else if (atom === ')') {
				break;
			} else if (isNumber(atom) || /^".*"$/.test(atom) || Script.find(atom) !== -1) { // number, string or function
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
				script.push(path);
			}
		}
//		console.log('Script section: '+JSON.stringify(script));
		return script;
	}());
};


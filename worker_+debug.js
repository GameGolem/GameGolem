/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Dashboard, History, Page, Queue, Resources,
	Battle, Generals, LevelUp, Player, Config,
	APP, APPID, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, Divisor, length, sum, findInObject, objectIndex, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime, error:true, warn:true, log:true, getImage, isUndefined, script_started,
	makeImage
*/
/********** Worker.Debug **********
* Profiling information
*/
var Debug = new Worker('Debug');
Debug.data = null;

Debug.settings = {
//	system:true,
	unsortable:true,
	debug:true,
	taint:true
};

Debug.option = {
	timer:0,
	count:2,
	show:10,
	digits:1,
	total:false,
	prototypes:true,
	worker:'All',
	trace:false,
	logdef:LOG_LOG, // Default level when no LOG_* set...
	loglevel:LOG_INFO, // Level to show - can turn off individual levels in Debug config
	log:{0:'info', 1:'log', 2:'warn', 3:'error', 4:'debug'}
};

Debug.runtime = {
	sort:2,
	rev:false,
	watch:false
};

Debug.display = [
	{
		title:'Logging',
		group:[
			{
				id:'logdef',
				label:'Default log level',
				select:{0:'LOG_INFO', 1:'LOG_LOG', 2:'LOG_WARN', 3:'LOG_ERROR', 4:'LOG_DEBUG'}
			},{
				id:'log.0',
				label:'0: Info',
				select:{'-':'Disabled', 'info':'console.info()', 'log':'console.log()', 'warn':'console.warn()', 'error':'console.error()', 'debug':'console.debug()'}
			},{
				id:'log.1',
				label:'1: Log',
				select:{'-':'Disabled', 'info':'console.info()', 'log':'console.log()', 'warn':'console.warn()', 'error':'console.error()', 'debug':'console.debug()'}
			},{
				id:'log.2',
				label:'2: Warn',
				select:{'-':'Disabled', 'info':'console.info()', 'log':'console.log()', 'warn':'console.warn()', 'error':'console.error()', 'debug':'console.debug()'}
			},{
				id:'log.3',
				label:'3: Error',
				select:{'-':'Disabled', 'info':'console.info()', 'log':'console.log()', 'warn':'console.warn()', 'error':'console.error()', 'debug':'console.debug()'}
			},{
				id:'log.4',
				label:'4: Debug',
				select:{'-':'Disabled', 'info':'console.info()', 'log':'console.log()', 'warn':'console.warn()', 'error':'console.error()', 'debug':'console.debug()'}
			}
		]
	},{
		title:'Function Profiling',
		group:[
			{
				id:'timer',
				label:'Refresh',
				select:{0:'Manual', 5:'5 seconds', 10:'10 seconds', 15:'15 seconds', 30:'30 seconds', 60:'1 minute'}
			},{
				id:'count',
				label:'Minimum Count',
				select:[1,2,3,4,5,10,15,20,25,50,100]
			},{
				id:'show',
				label:'Display Lines',
				select:{0:'All',10:10,20:20,30:30,40:40,50:50,60:60,70:70,80:80,90:90,100:100}
			},{
				id:'digits',
				label:'Digits',
				select:[1,2,3,4,5]
			},{
				id:'total',
				label:'Show Worker Totals',
				checkbox:true
			},{
				id:'prototypes',
				label:'Show Prototype Functions',
				checkbox:true
			},{
				id:'worker',
				label:'Worker',
				select:'worker_list'
			}
		]
	},{
		title:'Stack Trace',
		group:[
			{
				id:'trace',
				label:'Full Stack Trace',
				checkbox:true
			}
		]
	}
];

Debug.stack = [];// Stack tracing = [[time, worker, function, args], ...]
Debug.setup = function() {
	if (this.option._disabled) {// Need to remove our dashboard when disabled
		delete this.dashboard;
		return;
	}
	// Go through every worker and replace their functions with a stub function
	var i, j, p, wkr, fn;
	Workers['__fake__'] = null;// Add a fake worker for accessing Worker.prototype
	for (i in Workers) {
		for (p=0; p<=1; p++) {
			wkr = (i === '__fake__' ? (p ? Worker.prototype : null) : (p ? Workers[i] : Workers[i].defaults[APP])) || {};
			for (j in wkr) {
				if (isFunction(wkr[j]) && wkr.hasOwnProperty(j) && !/^_.*_$/.test(j)) {// Don't overload functions using _blah_ names - they're speed conscious
					fn = wkr[j];
					wkr[j] = function() {
						var t, r, ac = arguments.callee, w = (ac._worker || (this ? this.name : null)), l = [], s;
						Debug.stack.unshift([0, w || '', arguments]);
						try {
							if (Debug.option._disabled) {
								r = ac._orig.apply(this, arguments);
							} else {
								if (w) {
									l = [w+'.'+ac._name, w];
								}
								if (!ac._worker) {
									l.push('_worker.'+ac._name);
								}
								t = Date.now();
								r = ac._orig.apply(this, arguments);
								t = Date.now() - t;
								if (Debug.stack.length > 1) {
									Debug.stack[1][0] += t;
								}
								while ((i = l.shift())) {
									w = Debug.temp[i] = Debug.temp[i] || [0,0,0,false];
									w[0]++;
									w[1] += t - Debug.stack[0][0];
									w[2] += t;
									if (Debug.temp[i][3]) {
										s = i + '(' + JSON.shallow(arguments, 2).replace(/^\[?|\]?$/g, '') + ') => ' + JSON.shallow(isUndefined(r) ? null : r, 2).replace(/^\[?|\]?$/g, '');
										if (Debug.option.trace) {
											log(LOG_DEBUG, '!!! ' + s);
										} else {
											log(LOG_INFO, '!!! ' + s);
										}
									}
								}
							}
						} catch(e) {
							log(LOG_ERROR, e.name + ': ' + e.message);
						}
						Debug.stack.shift();
						return r;
					};
					wkr[j]._name = j;
					wkr[j]._orig = fn;
					if (i !== '__fake__') {
						wkr[j]._worker = i;
					}
				}
			}
		}
	}
	delete Workers['__fake__']; // Remove the fake worker
	// Replace the global logging function for better log reporting
	log = function(level, txt /*, obj, array etc*/){
		var i, j, level, tmp, args = Array.prototype.slice.call(arguments), prefix = [], suffix = [],
			date = [true, true, true, true, true],
			rev = [false, false, true, true, true],
			worker = [false, true, true, true, true],
			stack = [false, false, false, true, true];
		if (isNumber(args[0])) {
			level = Math.range(0, args.shift(), 4);
		} else {
			level = Debug.get(['option','logdef'], LOG_LOG);
		}
		if (level > Debug.get(['option','loglevel', LOG_LOG]) || Debug.get(['option','log',level], '-') === '-') {
			return;
		}
		if (rev[level]) {
			prefix.push('[' + (isRelease ? 'v'+version : 'r'+revision) + ']');
		}
		if (date[level]) {
			prefix.push('[' + (new Date()).toLocaleTimeString() + ']');
		}
		if (worker[level]) {
			tmp = [];
			for (i=0; i<Debug.stack.length; i++) {
				if (!tmp.length || Debug.stack[i][1] !== tmp[0]) {
					tmp.unshift(Debug.stack[i][1]);
				}
			}
			prefix.push(tmp.join('->'));
		}
		if (stack[level]) {
			for (i=0; i<Debug.stack.length; i++) {
				suffix.unshift('->' + Debug.stack[i][1] + '.' + Debug.stack[i][2].callee._name + '(' + JSON.shallow(Debug.stack[i][2],2).replace(/^\[|\]$/g,'') + ')');
				for (j=1; j<suffix.length; j++) {
					suffix[j] = '  ' + suffix[j];
				}
			}
		}
		suffix.unshift(''); // Force an initial \n before the stack trace
		if (args.length > 1) {
			suffix.push(''); // Force an extra \n after the stack trace if there's more args
		}
		args[0] = prefix.join(' ') + (prefix.length && args[0] ? ': ' : '') + (args[0] || '') + suffix.join("\n");
		level = Debug.get(['option','log',level], '-');
		if (!console[level]) {
			level = 'log';
		}
		try {
			console[level].apply(console, args);
		} catch(e) { // FF4 fix
			console[level](args);
		}
	};
};

Debug.init = function(old_revision) {
	var i, list = [];
	// BEGIN: Change log message type from on/off to debug level
	if (old_revision <= 1097) {
		var type = ['info', 'log', 'warn', 'error', 'debug'];
		for (i in this.option.log) {
			if (this.option.log[i] === true) {
				this.option.log[i] = type[i];
			} else if (this.option.log[i] === false) {
				this.option.log[i] = '-';
			}
		}
		delete this.option.console;
	}
	// END
	for (i in Workers) {
		list.push(i);
	}
	Config.set('worker_list', ['All', '_worker'].concat(list.unique().sort()));
	Config.addButton({
		image:'bug',
		advanced:true,
		className:'blue',
		title:'Bug Reporting',
		click:function(){
			window.open('http://code.google.com/p/game-golem/wiki/BugReporting', '_blank'); 
		}
	});
//	try{abc.def.ghi = 123;}catch(e){console.log(JSON.stringify(e));}
/*
{
	"arguments":["abc"],
	"type":"not_defined",
	"message":"abc is not defined",
	"stack":"ReferenceError: abc is not defined\n    at Worker.<anonymous> (chrome-extension://pjopfpjfmcdkjjokkbijcehcjhmijhbm/worker_+debug.js:251:6)\n    at Worker.init (chrome-extension://pjopfpjfmcdkjjokkbijcehcjhmijhbm/worker_+debug.js:152:22)\n    at Worker.<anonymous> (chrome-extension://pjopfpjfmcdkjjokkbijcehcjhmijhbm/worker.js:345:9)\n    at Worker._init (chrome-extension://pjopfpjfmcdkjjokkbijcehcjhmijhbm/worker_+debug.js:152:22)\n    at Worker.<anonymous> (chrome-extension://pjopfpjfmcdkjjokkbijcehcjhmijhbm/worker_+main.js:58:15)\n    at Worker.<anonymous> (chrome-extension://pjopfpjfmcdkjjokkbijcehcjhmijhbm/worker.js:931:19)\n    at chrome-extension://pjopfpjfmcdkjjokkbijcehcjhmijhbm/worker.js:559:33"}
*/
};

Debug.update = function(event) {
	if (event.type === 'option' || event.type === 'init') {
		if (this.option.timer) {
			this._revive(this.option.timer, 'timer', function(){Debug._notify('data');});
		} else {
			this._forget('timer');
		}
		this._notify('data'); // Any changes to options should force a dashboard update
	}
};

Debug.work = function(){};// Stub so we can be disabled

Debug.menu = function(worker, key) {
	if (!worker) {
		if (!isUndefined(key)) {
			this.set(['option','loglevel'], parseInt(key, 10));
		} else if (Config.option.advanced || Config.option.debug) {
			return [
				':<img src="' + getImage('bug') + '"><b>Log Level</b>',
				'0:' + (this.option.loglevel === 0 ? '=' : '') + 'Info',
				'1:' + (this.option.loglevel === 1 ? '=' : '') + 'Log',
				'2:' + (this.option.loglevel === 2 ? '=' : '') + 'Warn',
				'3:' + (this.option.loglevel === 3 ? '=' : '') + 'Error',
				'4:' + (this.option.loglevel === 4 ? '=' : '') + 'Debug'
			]
		}
	}
};

Debug.dashboard = function(sort, rev) {
	var i, o, list = [], order = [], output = [], data = this.temp, total = 0, rx = new RegExp('^'+this.option.worker);
	for (i in data) {
		if (data[i][0] >= this.option.count && (this.option.total || i.indexOf('.') !== -1) && (this.option.prototypes || !/^[^.]+\._/.test(i)) && (this.option.worker === 'All' || rx.test(i))) {
			order.push(i);
		}
		if (i.indexOf('.') === -1) {
			total += parseInt(data[i][1], 10);
		}
	}
	this.runtime.sort = sort = isUndefined(sort) ? (this.runtime.sort || 0) : sort;
	this.runtime.rev = rev = isUndefined(rev) ? (this.runtime.rev || false) : rev;
	order.sort(function(a,b) {
		switch (sort) {
			case 0:	return (a).localeCompare(b);
			case 1: return data[b][0] - data[a][0];
			case 2: return data[b][1] - data[a][1];
			case 3: return data[b][2] - data[a][2];
			case 4: return (data[b][1]/data[b][0]) - (data[a][1]/data[a][0]);
			case 5: return (data[b][2]/data[b][0]) - (data[a][2]/data[a][0]);
			case 6: return ((data[b][2]/data[b][0])-(data[a][1]/data[a][0])) - ((data[a][2]/data[a][0])-(data[b][1]/data[b][0]));
		}
	});
	if (rev) {
		order.reverse();
	}
	list.push('<b>Estimated CPU Time:</b> ' + total.addCommas() + 'ms, <b>Efficiency:</b> ' + (100 - (total / (Date.now() - script_started) * 100)).addCommas(2) + '% <span style="float:right;">' + (this.option.timer ? '' : '&nbsp;<a id="golem-profile-update">update</a>') + '&nbsp;<a id="golem-profile-reset" style="color:red;">reset</a>&nbsp;</span><br style="clear:both">');
	th(output, 'Function', 'style="text-align:left;"');
	th(output, 'Count', 'style="text-align:right;"');
	th(output, 'Time', 'style="text-align:right;"');
	th(output, '&Psi; Time', 'style="text-align:right;"');
	th(output, 'Average', 'style="text-align:right;"');
	th(output, '&Psi; Average', 'style="text-align:right;"');
	th(output, '&Psi; Diff', 'style="text-align:right;"');
	list.push('<table cellspacing="0" style="width:100%"><thead><tr>' + output.join('') + '</tr></thead><tbody>');
	for (i=0; i<Math.min(this.option.show || Number.POSITIVE_INFINITY,order.length); i++) {
		output = [];
		o = order[i];
		th(output, '<input style="margin:0;" type="checkbox" name="'+o+'"' + (data[o][3] ? ' checked' : '') + (o.indexOf('.') >= 0 ? '' : ' disabled') + '> ' + o, 'style="text-align:left;"');
		o = data[o];
		td(output, o[0].addCommas(), 'style="text-align:right;"');
		td(output, o[1].addCommas() + 'ms', 'style="text-align:right;"');
		td(output, o[2].addCommas() + 'ms', 'style="text-align:right;"');
		td(output, (o[1]/o[0]).addCommas(this.option.digits) + 'ms', 'style="text-align:right;"');
		td(output, (o[2]/o[0]).addCommas(this.option.digits) + 'ms', 'style="text-align:right;"');
		td(output, ((o[2]/o[0])-(o[1]/o[0])).addCommas(this.option.digits) + 'ms', 'style="text-align:right;"');
		tr(list, output.join(''));
	}
	list.push('</tbody></table>');
	$('#golem-dashboard-Debug').html(list.join(''));
	$('#golem-dashboard-Debug thead th:eq('+sort+')').attr('name',(rev ? 'reverse' : 'sort')).append('&nbsp;' + (rev ? '&uarr;' : '&darr;'));
	$('#golem-dashboard-Debug input').change(function() {
		var name = $(this).attr('name');
		Debug.temp[name][3] = !Debug.temp[name][3];
	});
	$('#golem-profile-update').click(function(){Debug._notify('data');});
	$('#golem-profile-reset').click(function(){Debug.temp={};Debug._notify('data');});
};


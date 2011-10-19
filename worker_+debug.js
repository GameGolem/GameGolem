/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Workers, Worker, Config,
	APP, APPID, PREFIX, userID, imagepath, script_started,
	isRelease, version, revision, Images, window, browser, console,
	LOG_ERROR, LOG_WARN, LOG_LOG, LOG_INFO, LOG_DEBUG,
	error:true, warn:true, log:true,
	isArray, isBoolean, isError, isFunction, isNumber, isObject, isString, isUndefined, isWorker,
	length, tr, th, td, getImage
*/
/********** Worker.Debug **********
* Profiling information
*/
var Debug = new Worker('Debug');

Debug.settings = {
	system:true,
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
	trace:4,
	logdef:LOG_LOG, // Default level when no LOG_* set...
	logexception:LOG_ERROR, // Default when it's an exception
	loglevel:LOG_LOG, // Maximum level to show (set by menu) - can turn off individual levels in Debug config
	logs:{
		0:{ /* LOG_ERROR */	display:'error',date:true,	revision:true,	worker:true,	stack:true,	prefix:''	},
		1:{ /* LOG_WARN */	display:'warn',	date:true,	revision:true,	worker:true,	stack:false,	prefix:''	},
		2:{ /* LOG_LOG */	display:'log',	date:true,	revision:false,	worker:true,	stack:false,	prefix:''	},
		3:{ /* LOG_INFO */	display:'info',	date:true,	revision:false,	worker:true,	stack:false,	prefix:''	},
		4:{ /* LOG_DEBUG */	display:'debug',date:true,	revision:false,	worker:true,	stack:false,	prefix:''	},
		5:{ /* LOG_USER1 */	display:'-',	date:true,	revision:false,	worker:true,	stack:false,	prefix:''	},
		6:{ /* LOG_USER2 */	display:'-',	date:true,	revision:false,	worker:true,	stack:false,	prefix:''	},
		7:{ /* LOG_USER3 */	display:'-',	date:true,	revision:false,	worker:true,	stack:false,	prefix:''	},
		8:{ /* LOG_USER4 */	display:'-',	date:true,	revision:false,	worker:true,	stack:false,	prefix:''	},
		9:{ /* LOG_USER5 */	display:'-',	date:true,	revision:false,	worker:true,	stack:false,	prefix:''	}
	}
};

Debug.runtime = {
	sort:2,
	rev:false,
	watch:false
};

Debug.display = [
	{
		title:'Function Profiling',
		group:[
			{
				id:'timer',
				label:'Refresh',
				select:{0:'Manual', 5:'5 seconds', 10:'10 seconds', 15:'15 seconds', 30:'30 seconds', 60:'1 minute'}
			},{
				id:'count',
				label:'Minimum Count',
				select:[0,1,2,3,4,5,10,15,20,25,50,100]
			},{
				id:'show',
				label:'Display Lines',
				select:{0:'All',10:10,20:20,30:30,40:40,50:50,60:60,70:70,80:80,90:90,100:100}
			},{
				id:'digits',
				label:'Time Digits',
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
			},{
				id:'trace',
				label:'Tracing',
				select:{
					0:'LOG_ERROR',
					1:'LOG_WARN',
					2:'LOG_LOG',
					3:'LOG_INFO',
					4:'LOG_DEBUG',
					5:'LOG_USER1',
					6:'LOG_USER2',
					7:'LOG_USER3',
					8:'LOG_USER4',
					9:'LOG_USER5'
				}
			}
		]
	},{
		title:'Logging',
		group:[
			{
				id:'logdef',
				label:'Default log',
				select:{
					0:'LOG_ERROR',
					1:'LOG_WARN',
					2:'LOG_LOG',
					3:'LOG_INFO',
					4:'LOG_DEBUG',
					5:'LOG_USER1',
					6:'LOG_USER2',
					7:'LOG_USER3',
					8:'LOG_USER4',
					9:'LOG_USER5'
				},
				help:'This is for log() lines that do not have an exception or LOG_* as the first argument'
			},{
				id:'logexception',
				label:'Default exception',
				select:{
					0:'LOG_ERROR',
					1:'LOG_WARN',
					2:'LOG_LOG',
					3:'LOG_INFO',
					4:'LOG_DEBUG',
					5:'LOG_USER1',
					6:'LOG_USER2',
					7:'LOG_USER3',
					8:'LOG_USER4',
					9:'LOG_USER5'
				},
				help:'This is for log() lines that have an exception as the first argument'
			},{
				group:function() {
					var i, options = [], levels = ['Error', 'Warn', 'Log', 'Info', 'Debug', 'User1', 'User2', 'User3', 'User4', 'User5'];
					for (i=0; i<levels.length; i++) {
						options.push({
							title:i + ': ' + levels[i],
							group:[
								{
									id:'logs.'+i+'.display',
									label:'Display',
									select:{
										'-':'Disabled',
										'error':'console.error()',
										'warn':'console.warn()',
										'log':'console.log()',
										'info':'console.info()',
										'debug':'console.debug()'
									}
								},{
									id:'logs.'+i+'.date',
									label:'Timestamp',
									select:{
										'-':'None',
										'G:i':'13:24',
										'G:i:s':'13:24:56',
										'G:i:s.u':'13:24:56.001',
										'D G:i':'Mon 13:24',
										'D G:i:s':'Mon 13:24:56',
										'D G:i:s.u':'Mon 13:24:56.001'
									}
								},{
									id:'logs.'+i+'.prefix',
									label:'Prefix',
									text:true
								},{
									id:'logs.'+i+'.revision',
									label:'Revision',
									checkbox:true
								},{
									id:'logs.'+i+'.worker',
									label:'Worker',
									checkbox:true
								},{
									id:'logs.'+i+'.stack',
									label:'Stack',
									checkbox:true
								}
							]
						});
					}
					return options;
				}
			}
		]
	}
];

Debug.stack = [];// Stack tracing = [[time, worker, function, args], ...]

/** @this {Worker} */
Debug.setup = function(old_revision, fresh) {
	var i, j, o, p, wkr, fn;
	// BEGIN Change of log options
	if (old_revision <= 1111 && this.option.log) {
		this.set(['option','logs','0','display'], this.get(['option','log','0'], 'info'));
		this.set(['option','logs','1','display'], this.get(['option','log','1'], 'log'));
		this.set(['option','logs','2','display'], this.get(['option','log','2'], 'warn'));
		this.set(['option','logs','3','display'], this.get(['option','log','3'], 'error'));
		this.set(['option','logs','4','display'], this.get(['option','log','4'], 'debug'));
		this.set(['option','log']);
	}
	if (old_revision <= 1112 && this.option.logs) {
		for (i in this.option.logs) {
			if (isBoolean(this.option.logs[i].date)) {
				this.set(['option','logs',i,'date'], this.option.logs[i].date ? 'G:i:s' : '-');
			}
		}
	}
	if (old_revision <= 1112 && isBoolean(this.option.trace)) {
		this.set(['option','trace'], this.option.trace ? LOG_DEBUG : LOG_LOG);
	}
	// reverse order of info/log/warn/error to error/warn/log/info
	if (old_revision <= 1164 && !fresh) {
		o = {0:'error', 1:'warn', 2:'log', 3:'info'};
		p = {};
		for (i = 0; i <= 3; i++) {
			p[i] = $.extend({}, this.get(['option','logs',i]));
		}
		for (i = 0; i <= 3; i++) {
			if (isObject(p[3 - i]) && length(p[3-i])) {
				log('# option.logs.'+i+' = p['+(3-i)+']');
				this.set(['option','logs',i], p[3-i]);
				//log('# option.logs.'+i+'.display = '+o[i]);
				//this.set(['option','logs',i,'display'], o[i]);
			}
		}
		if (isNumber(i = this.get(j = 'option.logdef', 1)) <= 3) {
		    log('# '+j+' = '+(3-i));
		    this.set(j, 3 - i);
		}
		if (isNumber(i = this.get(j = 'option.logexception', 3)) <= 3) {
		    log('# '+j+' = '+(3-i));
		    this.set(j, 3 - i);
		}
		if (isNumber(i = this.get(j = 'option.loglevel', 3)) <= 3) {
		    log('# '+j+' = '+(3-i));
		    this.set(j, 3 - i);
		}
	}
	// END
	// Go through every worker and replace their functions with a stub function
	Workers['__fake__'] = null;// Add a fake worker for accessing Worker.prototype
	for (i in Workers) {
		for (p=0; p<=1; p++) {
			wkr = (i === '__fake__' ? (p ? Worker.prototype : null) : (p ? Workers[i] : Workers[i].defaults[APP])) || {};
			for (j in wkr) {
				if (isFunction(wkr[j]) && wkr.hasOwnProperty(j) && !/^_.*_$/.test(j)) {// Don't overload functions using _blah_ names - they're speed conscious
					fn = wkr[j];
					wkr[j] = function() {
						var i, t, r, ac = arguments.callee, w = (ac._worker || (this ? this.name : null)), l = [], s;
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
										log(Debug.option.trace, i + '(' + JSON.shallow(arguments, 3).replace(/^\[?|\]?$/g, '') + ') => ' + JSON.shallow(isUndefined(r) ? null : r, 2).replace(/^\[?|\]?$/g, ''));
									}
								}
							}
						} catch(e) {
							log(e, isString(e) ? e : e.name + ': ' + e.message);
						}
						Debug.stack.shift();
						return r;
					};
					wkr[j]._name = j;
					wkr[j]._orig = fn;
					if (i !== '__fake__') {
						wkr[j]._worker = i;
						Debug.temp[i+'.'+j] = Debug.temp[i+'.'+j] || [0,0,0,false];
					}
				}
			}
		}
	}
	delete Workers['__fake__']; // Remove the fake worker
	// Replace the global logging function for better log reporting
	log = function(lvl, txt /*, obj, array etc*/){
		var i, j, worker, name, line = '', level, tmp, stack,
			args = Array.prototype.slice.call(arguments),
			prefix = [], suffix = [], display = '-';
		if (isNumber(args[0])) {
			level = Math.range(0, args.shift(), 9);
		} else if (isError(args[0])) {
			tmp = args.shift();
			if (browser === 'chrome' && isString(tmp.stack)) {
				stack = tmp.stack.split("\n");
			}
			level = Debug.get(['option','logexception'], LOG_ERROR);
		} else {
			level = Debug.get(['option','logdef'], LOG_LOG);
		}
		if (isNumber(level)
		 && level <= Debug.get(['option','loglevel'], LOG_LOG)
		 && (display = Debug.get(['option','logs',level,'display'], '-')) !== '-') {
			if ((tmp = Debug.get(['option','logs',level,'prefix'], false))) {
				prefix.push(tmp);
			}
			if (Debug.get(['option','logs',level,'revision'], false)) {
				prefix.push('[' + (isRelease ? 'v'+version : 'r'+revision) + ']');
			}
			if ((tmp = Debug.get(['option','logs',level,'date'], '-')) !== 'tmp') {
				prefix.push('[' + (new Date()).format(tmp) + ']');
			}
			if (Debug.get(['option','logs',level,'worker'], false)) {
				tmp = [];
				for (i=0; i<Debug.stack.length; i++) {
					if (!tmp.length || Debug.stack[i][1] !== tmp[0]) {
						tmp.unshift(Debug.stack[i][1]);
					}
				}
				prefix.push(tmp.join('->'));
			}
/*
e.stack contents by browser:
CHROME:
ReferenceError: abc is not defined
    at Worker.<anonymous> (chrome-extension://pjopfpjfmcdkjjokkbijcehcjhmijhbm/worker_+debug.js:251:6)
    at Worker.init (chrome-extension://pjopfpjfmcdkjjokkbijcehcjhmijhbm/worker_+debug.js:152:22)
    at Worker.<anonymous> (chrome-extension://pjopfpjfmcdkjjokkbijcehcjhmijhbm/worker.js:345:9)
    at Worker._init (chrome-extension://pjopfpjfmcdkjjokkbijcehcjhmijhbm/worker_+debug.js:152:22)
    at Worker.<anonymous> (chrome-extension://pjopfpjfmcdkjjokkbijcehcjhmijhbm/worker_+main.js:58:15)
    at Worker.<anonymous> (chrome-extension://pjopfpjfmcdkjjokkbijcehcjhmijhbm/worker.js:931:19)
    at chrome-extension://pjopfpjfmcdkjjokkbijcehcjhmijhbm/worker.js:559:33

GREASEMONKEY:
@jar:file:///C:/Users/Robin/AppData/Roaming/Mozilla/Firefox/Profiles/0cxznhqg.default/extensions/%7Be4a8a97b-f2ed-450b-b12d-ee082ba24781%7D.xpi!/components/greasemonkey.js:4452,(1111)
@jar:file:///C:/Users/Robin/AppData/Roaming/Mozilla/Firefox/Profiles/0cxznhqg.default/extensions/%7Be4a8a97b-f2ed-450b-b12d-ee082ba24781%7D.xpi!/components/greasemonkey.js:4330,(1111)
@jar:file:///C:/Users/Robin/AppData/Roaming/Mozilla/Firefox/Profiles/0cxznhqg.default/extensions/%7Be4a8a97b-f2ed-450b-b12d-ee082ba24781%7D.xpi!/components/greasemonkey.js:2185,(1111)
@jar:file:///C:/Users/Robin/AppData/Roaming/Mozilla/Firefox/Profiles/0cxznhqg.default/extensions/%7Be4a8a97b-f2ed-450b-b12d-ee082ba24781%7D.xpi!/components/greasemonkey.js:4330,([object Object],[object Array])
@jar:file:///C:/Users/Robin/AppData/Roaming/Mozilla/Firefox/Profiles/0cxznhqg.default/extensions/%7Be4a8a97b-f2ed-450b-b12d-ee082ba24781%7D.xpi!/components/greasemonkey.js:4975,([object Object],"run")
@jar:file:///C:/Users/Robin/AppData/Roaming/Mozilla/Firefox/Profiles/0cxznhqg.default/extensions/%7Be4a8a97b-f2ed-450b-b12d-ee082ba24781%7D.xpi!/components/greasemonkey.js:2814,(215)
@jar:file:///C:/Users/Robin/AppData/Roaming/Mozilla/Firefox/Profiles/0cxznhqg.default/extensions/%7Be4a8a97b-f2ed-450b-b12d-ee082ba24781%7D.xpi!/components/greasemonkey.js:2401,@:0,
*/
			if (Debug.get(['option','logs',level,'stack'], false)) {
				for (i=0; i<Debug.stack.length; i++) {
					worker = Debug.stack[i][1];
					name = Debug.stack[i][2].callee._name;
					if (stack && browser === 'chrome') { // Chrome format stack trace
						while ((tmp = stack.shift())) {
							if (tmp.indexOf('Worker.'+name+' ') >= 0 && tmp.indexOf(worker.toLowerCase()) >= 0) {
								break;
							}
							line = ' <' + tmp.regex(/\/([^\/]+:\d+:\d+)\)$/i) + '>'; // We're the anonymous function before the real call
						}
					}
					suffix.unshift('->' + worker + '.' + name + '(' + JSON.shallow(Debug.stack[i][2],2).replace(/^\[|\]$/g,'') + ')' + line);
					for (j=1; j<suffix.length; j++) {
						suffix[j] = '  ' + suffix[j];
					}
				}
				if (!suffix.length) { // Sometimes we're called from a handler
					suffix.push('-> unknown');
				}
				suffix.unshift(''); // Force an initial \n before the stack trace
				if (args.length > 1) {
					suffix.push(''); // Force an extra \n after the stack trace if there's more args
				}
			}
			if (!isString(args[0]) && !isNumber(args[0])) { // If we want to pass a single object for inspection
				args.unshift('');
			}
			args[0] = prefix.join(' ') + (prefix.length && args[0] ? ': ' : '') + (args[0] || '') + suffix.join("\n");
			try {
				if (isFunction(console[display])) {
					console[display].apply(console.firebug ? window : console, args);
				} else {
					console.log.apply(console.firebug ? window : console, args);
				}
			} catch(e) { // FF4 fix - doesn't like .apply
				if (isFunction(console[display])) {
					console[display](args);
				} else {
					console.log(args);
				}
			}
		}
	};
};

/** @this {Worker} */
Debug.init = function(old_revision) {
	var i, list = [], type;
	// BEGIN: Change log message type from on/off to debug level
	if (old_revision <= 1097) {
		type = ['info', 'log', 'warn', 'error', 'debug'];
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
};

/** @this {Worker} */
Debug.update = function(event, events) {
	if (events.findEvent(this, 'init')
	 || events.findEvent(this, 'option')) {
		if (this.option.timer) {
			this._revive(this.option.timer, 'timer');
		} else {
			this._forget('timer');
		}
	}
	if (events.findEvent(this, 'init')
	 || events.findEvent(this, 'option')
	 || events.findEvent(this, 'reminder')) {
		this._notify('data'); // Any changes to options should force a dashboard update
	}
	return true;
};

Debug.work = function(){};// Stub so we can be disabled

/** @this {Worker} */
Debug.menu = function(worker, key) {
	if (!worker) {
		if (!isUndefined(key)) {
			this.set(['option','loglevel'], parseInt(key, 10));
		} else if (Config.option.advanced || Config.option.debug) {
			var levels = [
				': <img src="' + getImage('bug') + '"><b>Log Level</b>',
				'0:' + (this.option.loglevel === 0 ? '=' : '') + 'Error',
				'1:' + (this.option.loglevel === 1 ? '=' : '') + 'Warn',
				'2:' + (this.option.loglevel === 2 ? '=' : '') + 'Log',
				'3:' + (this.option.loglevel === 3 ? '=' : '') + 'Info',
				'4:' + (this.option.loglevel === 4 ? '=' : '') + 'Debug'
			];
			if (Config.option.debug) {
				levels = levels.concat(
					'5:' + (this.option.loglevel === 5 ? '=' : '') + 'User1',
					'6:' + (this.option.loglevel === 6 ? '=' : '') + 'User2',
					'7:' + (this.option.loglevel === 7 ? '=' : '') + 'User3',
					'8:' + (this.option.loglevel === 8 ? '=' : '') + 'User4',
					'9:' + (this.option.loglevel === 9 ? '=' : '') + 'User5'
				);
			}
			return levels;
		}
	}
};

/** @this {Worker} */
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
		td(output, (o[1]/o[0] || 0).addCommas(this.option.digits) + 'ms', 'style="text-align:right;"');
		td(output, (o[2]/o[0] || 0).addCommas(this.option.digits) + 'ms', 'style="text-align:right;"');
		td(output, ((o[2]/o[0] || 0)-(o[1]/o[0] || 0)).addCommas(this.option.digits) + 'ms', 'style="text-align:right;"');
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


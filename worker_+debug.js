/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Dashboard, History, Page, Queue, Resources,
	Battle, Generals, LevelUp, Player,
	APP, APPID, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, shortNumber, Divisor, length, unique, deleteElement, sum, addCommas, findInArray, findInObject, objectIndex, sortObject, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime, ucfirst, ucwords,
	makeImage
*/
/********** Worker.Debug **********
* Profiling information
*/
var Debug = new Worker('Debug');
Debug.data = Debug.runtime = null;

Debug.option = {
	timer:0,
	count:2,
	show:10,
	digits:1,
	total:false,
	worker:'All'
};

Debug.runtime = {
	sort:2,
	rev:false
};

Debug.settings = {
//	system:true,
	unsortable:true,
	advanced:true,
	taint:true
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
				id:'worker',
				label:'Worker',
				select:'worker_list'
			},{
				label:'<b>NOTE:</b> You must reload Golem to show/hide the dashboard panel.'
			}
		]
	}
];

Debug.stack = [];// Stack tracing = [[time, worker, function, args], ...]
Debug.setup = function() {
	if (this.option._enabled === false) {// Need to remove our dashboard when disabled
		delete this.dashboard;
		return;
	}
	// Go through every worker and replace their functions with a stub function
	var i, j, wkr, fn;
	Workers['__fake__'] = null;// Add a fake worker for accessing Worker.prototype
	for (i in Workers) {
		wkr = i === '__fake__' ? Worker.prototype : Workers[i];
		for (j in wkr) {
			if (isFunction(wkr[j]) && wkr.hasOwnProperty(j)) {
				fn = wkr[j];
				wkr[j] = function() {
					var t = Date.now(), r, w = (arguments.callee._worker || (this ? this.name : null)), l = [];
					Debug.stack.unshift([0, w || '', arguments]);
					if (Debug.option._enabled) {
						if (w) {
							l = [w+'.'+arguments.callee._name, w];
						}
						if (!arguments.callee._worker) {
							l[l.length] = '_worker.'+arguments.callee._name;
						}
					}
					r = arguments.callee._orig.apply(this, arguments);
					if (Debug.option._enabled) {
						t = Date.now() - t;
						if (Debug.stack.length > 1) {
							Debug.stack[1][0] += t;
						}
						for (i=0; i<l.length; i++) {
							w = Debug.temp[l[i]] = Debug.temp[l[i]] || [0,0,0];
							w[0]++;
							w[1] += t - Debug.stack[0][0];
							w[2] += t;
						}
					}
					Debug.stack.shift();
					return r;
				}
				wkr[j]._name = j;
				wkr[j]._orig = fn;
				if (i !== '__fake__') {
					wkr[j]._worker = i;
				}
			}
		}
	}
	delete Workers['__fake__']; // Remove the fake worker
	// Replace the global functions for better log reporting
	log = function(txt){
		return '[' + (new Date()).toLocaleTimeString() + ']' + (txt ? ' ' + txt : '');
	};
	warn = function(txt){
		var i, output = [];
		for (i=0; i<Debug.stack.length; i++) {
			if (!output.length || Debug.stack[i][1] !== output[0]) {
				output.unshift(Debug.stack[i][1]);
			}
		}
		return '[' + (isRelease ? 'v'+version : 'r'+revision) + '] [' + (new Date()).toLocaleTimeString() + '] ' + output.join('->') + ':' + (txt ? ' ' + txt : '');
	};
	error = function(txt) {
		var i, j, output = [];
		for (i=0; i<Debug.stack.length; i++) {
			output.unshift('->' + Debug.stack[i][1] + '.' + Debug.stack[i][2].callee._name + '(' + JSON.shallow(Debug.stack[i][2],2).replace(/^\[|\]$/g,'') + ')');
			for (j=1; j<output.length; j++) {
				output[j] = '  ' + output[j];
			}
		}
		output.unshift('');
		return '[' + (isRelease ? 'v'+version : 'r'+revision) + '] [' + (new Date()).toLocaleTimeString() + ']' + (txt ? ': ' + txt : '') + output.join("\n") + (txt ? "\n:" : '');
	};
};

Debug.init = function() {
	var i, list = [];
	for (i in Workers) {
		list.push(i);
	}
	Config.set('worker_list', ['All', '_worker'].concat(unique(list).sort()));
};

Debug.update = function(event) {
	if (event.type === 'option' || event.type === 'init') {
		if (this.option.timer) {
			this._revive(this.option.timer, 'timer', function(){Debug._notify('data');})
		} else {
			this._forget('timer');
		}
		this._notify('data');// Any changes to options should force a dashboard update
	}
};

Debug.work = function(){};// Stub so we can be disabled

Debug.dashboard = function(sort, rev) {
	var i, o, list = [], order = [], output = [], data = this.temp, total = 0, rx = new RegExp('^'+this.option.worker);
	for (i in data) {
		if (data[i][0] >= this.option.count && (this.option.total || i.indexOf('.') !== -1) && (this.option.worker === 'All' || rx.test(i))) {
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
	list.push('<b>Estimated CPU Time:</b> ' + addCommas(total) + 'ms, <b>Total Run Time:</b> ' + addCommas(Date.now() - script_started) + 'ms, <b>CPU Percent:</b> ' + addCommas((total / (Date.now() - script_started) * 100).toFixed(2)) + '% <span style="float:right;">' + (this.option.timer ? '' : '&nbsp;<a id="golem-profile-update">update</a>') + '&nbsp;<a id="golem-profile-reset" style="color:red;">reset</a>&nbsp;</span><br style="clear:both">');
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
		th(output, o, 'style="text-align:left;"');
		o = data[o];
		td(output, addCommas(o[0]), 'style="text-align:right;"');
		td(output, addCommas(o[1]) + 'ms', 'style="text-align:right;"');
		td(output, addCommas(o[2]) + 'ms', 'style="text-align:right;"');
		td(output, addCommas((o[1]/o[0]).toFixed(this.option.digits)) + 'ms', 'style="text-align:right;"');
		td(output, addCommas((o[2]/o[0]).toFixed(this.option.digits)) + 'ms', 'style="text-align:right;"');
		td(output, addCommas(((o[2]/o[0])-(o[1]/o[0])).toFixed(this.option.digits)) + 'ms', 'style="text-align:right;"');
		tr(list, output.join(''));
	}
	list.push('</tbody></table>');
	$('#golem-dashboard-Debug').html(list.join(''));
	$('#golem-dashboard-Debug thead th:eq('+sort+')').attr('name',(rev ? 'reverse' : 'sort')).append('&nbsp;' + (rev ? '&uarr;' : '&darr;'));
	$('#golem-profile-update').click(function(){Debug._notify('data');});
	$('#golem-profile-reset').click(function(){Debug.temp={};Debug._notify('data');});
};


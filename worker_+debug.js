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
	advanced:true
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

Debug.parents = [0];
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
					var t = Date.now(), r, l;
					if (arguments.callee._worker) {
						l = [arguments.callee._worker+'.'+arguments.callee._name, arguments.callee._worker];
					} else {
						l = ['_worker.'+arguments.callee._name, this ? this.name+'.'+arguments.callee._name : null, this ? this.name : null];
					}
					Debug.parents.unshift(0);
					r = arguments.callee._orig.apply(this, arguments);
					t = Date.now() - t;
					for (i=0; i<l.length; i++) {
						Debug.temp[l[i]] = Debug.temp[l[i]] || [0,0,0];
						Debug.temp[l[i]][0]++;
						Debug.temp[l[i]][1] += t - Debug.parents[0];
						Debug.temp[l[i]][2] += t;
						Debug.temp[l[i]][3] = Debug.temp[l[i]][1] / Debug.temp[l[i]][0];
						Debug.temp[l[i]][4] = Debug.temp[l[i]][2] / Debug.temp[l[i]][0];
						Debug.temp[l[i]][5] = Debug.temp[l[i]][4] - Debug.temp[l[i]][3];
					}
					Debug.parents.shift();
					Debug.parents[0] += t;
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
			case 0:	return (rev ? (b).localeCompare(a) : (a).localeCompare(b));
			default: return (rev ? data[a][sort-1] - data[b][sort-1] : data[b][sort-1] - data[a][sort-1]);
		}
	});
	list.push('<b>Estimated CPU Time:</b> ' + addCommas(total) + 'ms, <b>Total Run Time:</b> ' + addCommas(Date.now() - script_started) + 'ms, <b>CPU Percent:</b> ' + addCommas((total / (Date.now() - script_started) * 100).toFixed(2)) + '% <span style="float:right;">' + (this.option.timer ? '' : '&nbsp;<a id="golem-profile-update">update</a>') + '&nbsp;<a id="golem-profile-reset" style="color:red;">reset</a>&nbsp;</span><br style="clear:both">');
	th(output, 'Function', 'style="text-align:left;"');
	th(output, 'Count');
	th(output, 'Time', 'style="text-align:right;"');
	th(output, '&Psi; Time', 'style="text-align:right;"');
	th(output, 'Average', 'style="text-align:right;"');
	th(output, '&Psi; Average', 'style="text-align:right;"');
	th(output, '&Psi; Diff', 'style="text-align:right;"');
	list.push('<table cellspacing="0" style="width:100%"><thead><tr>' + output.join('') + '</tr></thead><tbody>');
	for (o=0; o<Math.min(this.option.show || Number.POSITIVE_INFINITY,order.length); o++) {
		output = [];
		th(output, order[o], 'style="text-align:left;"');
		td(output, addCommas(data[order[o]][0]));
		td(output, addCommas(data[order[o]][1]) + 'ms', 'style="text-align:right;"');
		td(output, addCommas(data[order[o]][2]) + 'ms', 'style="text-align:right;"');
		td(output, addCommas(data[order[o]][3].toFixed(this.option.digits)) + 'ms', 'style="text-align:right;"');
		td(output, addCommas(data[order[o]][4].toFixed(this.option.digits)) + 'ms', 'style="text-align:right;"');
		td(output, addCommas(data[order[o]][5].toFixed(this.option.digits)) + 'ms', 'style="text-align:right;"');
		tr(list, output.join(''));
	}
	list.push('</tbody></table>');
	$('#golem-dashboard-Debug').html(list.join(''));
	$('#golem-dashboard-Debug thead th:eq('+sort+')').attr('name',(rev ? 'reverse' : 'sort')).append('&nbsp;' + (rev ? '&uarr;' : '&darr;'));
	$('#golem-profile-update').click(function(){Debug._notify('data');});
	$('#golem-profile-reset').click(function(){Debug.temp={};Debug._notify('data');});
};


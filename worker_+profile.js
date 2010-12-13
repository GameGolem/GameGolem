/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Dashboard, History, Page, Queue, Resources,
	Battle, Generals, LevelUp, Player,
	APP, APPID, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, shortNumber, Divisor, length, unique, deleteElement, sum, addCommas, findInArray, findInObject, objectIndex, sortObject, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime, ucfirst, ucwords,
	makeImage
*/
/********** Worker.Profile **********
* Profiling information
*/
var Profile = new Worker('Profile');
Profile.data = Profile.runtime = null;

Profile.option = {
	timer:0,
	count:2,
	show:10,
	digits:1,
	total:false
};

Profile.runtime = {
	sort:2,
	rev:false
};

Profile.settings = {
	system:true,
	unsortable:true,
	advanced:true
};

Profile.display = [
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
		title:'IMPORTANT',
		label:'You must reload Golem to change the Enabled state.'
	}
];

function addMethod(object, name, fn){
	var old = object[ name ];
	object[ name ] = function(){
		if ( fn.length == arguments.length )
			return fn.apply( this, arguments );
		else if ( typeof old == 'function' )
			return old.apply( this, arguments );
	};
}

Profile.setup = function() {
	// Go through every worker and replace their functions with a stub function
	var i, j, wkr, fn;
	for (i in Workers) {
		wkr = Workers[i]
		for (j in wkr) {
			if (isFunction(wkr[j]) && wkr.hasOwnProperty(j)) {
				fn = wkr[j];
				wkr[j] = function() {
					var t = Date.now(), i, r, log = [arguments.callee._worker, arguments.callee._worker+'.'+arguments.callee.name];
					r = arguments.callee._orig.apply(this, arguments);
					t = Date.now() - t;
					for (i=0; i<log.length; i++) {
						Profile.temp[log[i]] = Profile.temp[log[i]] || [0,0];
						Profile.temp[log[i]][0]++;
						Profile.temp[log[i]][1] += t;
						Profile.temp[log[i]][2] = Profile.temp[log[i]][1] / Profile.temp[log[i]][0];
					}
					return r;
				}
				wkr[j].name = j;
				wkr[j]._orig = fn;
				wkr[j]._worker = i;
			}
		}
	}
	for (i in Worker.prototype) {
		if (isFunction(Worker.prototype[i])) {
			fn = Worker.prototype[i];
			Worker.prototype[i] = function() {
				var t = Date.now(), r, log = [this ? this.name : null, this ? this.name+'.'+arguments.callee.name : null, '*.'+arguments.callee.name];
				r = arguments.callee._orig.apply(this, arguments);
				t = Date.now() - t;
				for (i=0; i<log.length; i++) {
					if (log[i]) {
						Profile.temp[log[i]] = Profile.temp[log[i]] || [0,0];
						Profile.temp[log[i]][0]++;
						Profile.temp[log[i]][1] += t;
						Profile.temp[log[i]][2] = Profile.temp[log[i]][1] / Profile.temp[log[i]][0];
					}
				}
				return r;
			}
			Worker.prototype[i].name = i;
			Worker.prototype[i]._orig = fn;
		}
	}
};

Profile.update = function(event) {
	if (event.type === 'option' || event.type === 'init') {
		if (this.option.timer) {
			this._revive(this.option.timer, 'timer', function(){Profile._notify('data');})
		} else {
			this._forget('timer');
		}
		this._notify('data');
	}
};

Profile.dashboard = function(sort, rev) {
	var i, o, list = [], order = [], output = [], data = this.temp;
	for (i in data) {
		if (data[i][0] >= this.option.count && (this.option.total || (i.indexOf('.') !== -1 && i.indexOf('*') === -1))) {
			order.push(i);
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
	list.push('<span style="float:right;">' + (this.option.timer ? '' : '&nbsp;<a id="golem-profile-update">update</a>') + '&nbsp;<a id="golem-profile-reset" style="color:red;">reset</a>&nbsp;</span><br style="clear:both">');
	th(output, 'Function', 'style="text-align:left;"');
	th(output, 'Count');
	th(output, 'Time', 'style="text-align:right;"');
	th(output, 'Average', 'style="text-align:right;"');
	list.push('<table cellspacing="0" style="width:100%"><thead><tr>' + output.join('') + '</tr></thead><tbody>');
	for (o=0; o<Math.min(this.option.show || Number.POSITIVE_INFINITY,order.length); o++) {
		output = [];
		th(output, order[o], 'style="text-align:left;"');
		td(output, addCommas(data[order[o]][0]));
		td(output, addCommas(data[order[o]][1]) + 'ms', 'style="text-align:right;"');
		td(output, addCommas(data[order[o]][2].toFixed(this.option.digits)) + 'ms', 'style="text-align:right;"');
		tr(list, output.join(''));
	}
	list.push('</tbody></table>');
	$('#golem-dashboard-Profile').html(list.join(''));
	$('#golem-dashboard-Profile thead th:eq('+sort+')').attr('name',(rev ? 'reverse' : 'sort')).append('&nbsp;' + (rev ? '&uarr;' : '&darr;'));
	$('#golem-profile-update').click(function(){Profile._notify('data');});
	$('#golem-profile-reset').click(function(){Profile.temp={};Profile._notify('data');});
};


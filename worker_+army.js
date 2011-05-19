/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army:true, Dashboard, History, Page, Queue, Resources,
	Battle, Generals, LevelUp, Player,
	APP, APPID, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, Divisor, length, sum, findInObject, objectIndex, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
	makeImage
*/
/********** Worker.Army **********
* Stores data by facebook userid for any worker that wants to use it.
* Data is stored as -
* Army.data.section.uid[...] = value
* section == 'Army' for general use of any workers with data useful for many
*/
var Army = new Worker('Army');
Army.data = {};

Army.settings = {
	system:true,
	taint:true
};

Army.option = {
	forget:14// Number of days to remember any userid
};

Army.runtime = {
	// Dashboard defaults:
	sort:0,rev:false,show:'Name',info:'uid'
};
/*
Army.display = [
	{
		id:'forget',
		label:'Forget after',
		select:[1,2,3,4,5,6,7,14,21,28],
		after:'days',
		help:'This will delete any userID that\'s not been seen for a length of time'
	}
];
*/

Army.setup = function(old_revision) {
	// BEGIN Change of storage from "data.uid.section.xyz" to "data.section.uid.xyz"
	if (old_revision <= 1113) {
		log('Updating Army...');
		var i, j;
		for (i in this.data) { // First change the layout
			if (isNumber(i) || !/[^\d]/.test(i)) {
				for (j in this.data[i]) {
					this._set(['data',j,i], this.data[i][j]);
					this._set(['data',i,j]);
				}
				this._set(['data',i]);
			}
		}
		this.data.Army = this.data.Army || {};
		for (i in this.data.Army) { // Second change the uid.Army bool to be Army.uid.member
			if (this.data.Army[i] === true) {
				this._set(['data','Army',i], this._get(['data','_info',i],{}));
				this._set(['data','_info',i])
				this._set(['data','Army',i,'member'], true);
			}
		}
		this.data._info = this.data._info || {};
		for (i in this.data._info) { // Finally remove _info into Army
			this._set(['data','Army',i], this._get(['data','_info',i],{}));
			this._set(['data','_info',i])
		}
		this._set(['data','_info'])
	}
	// END
};

Army.set = function(what) {
	var x = arguments[0] = isArray(what) ? what.slice(0) : (isString(what) ? what.split('.') : []);
	if (!x.length || isNumber(x[0]) || !/[^\d]/.test(x[0])) {
		x.unshift(Worker.stack[0]); // Section first - if it's not a valid section then use the current worker
	}
	return this._set.apply(this, arguments);
};

Army.get = function(what) {
	var x = arguments[0] = isArray(what) ? what.slice(0) : (isString(what) ? what.split('.') : []);
	if (!x.length || isNumber(x[0]) || !/[^\d]/.test(x[0])) {
		x.unshift(Worker.stack[0]); // Section first - if it's not a valid section then use the current worker
	}
	return this._get.apply(this, arguments);
};

Army.army_name = function(action, uid) {
	switch(action) {
	case 'title':
		return 'Name';
	case 'show':
		return Army._get(['Army',uid,'name'],'-').html_escape();
	case 'sort':
		return Army._get(['Army',uid,'name']);
	case 'click':
		if (uid) {
			Army._unflush();
			var i, obj = {};
			for (i in Army.data) {
				if (Army.data[i][uid]) {
					obj[i] = Army.data[i][uid];
				}
			}
			Config.makeTooltip(Army._get(['Army',uid,'name']) || uid, Page.makeLink('keep.php', 'user=' + uid, 'Visit Keep') + '<hr><b>userID: </b>' + uid + '<br><hr><b>Raw Data:</b><pre>' + JSON.stringify(obj, null, '   ') + '</pre>');
		}
		return true;
	}
};

Army.army = function(action, uid) {
	var i, tmp, value, list = [], info = 'UserID', infolist = {
		'UserID':'uid',
		'Level':'level',
		'FBName':'fbname',
		'Seen':'seen',
		'Changed':'changed',
		'Army Size':'army_size'
	};
	switch(action) {
	case 'title':
		return 'Info (' + this.get(['runtime','info'],'UserID') + ')';
	case 'info':
		if ($('#golem-army-info').length) {
			info = $('#golem-army-info').val();
		}
		this.set(['runtime','info'], info)
		for (i in infolist) {
			list.push('<option value="' + i + '"' + (i === info ? ' selected' : '') + '>' + i + '</option>');
		}
		return 'Info: <select id="golem-army-info">' + list.join('') + '</select>';
	case 'show':
		tmp = infolist[this.get(['runtime','info'],'UserID')];
		if (tmp === 'uid') {
			value = uid;
		} else {
			value = this.get(['Army',uid,tmp],'-');
			if (isNumber(value) && Math.abs(value - Date.now()) < (365 * 24 * 60 * 60 * 1000)) { // If it's probably a date
				value = makeTime(value, 'R');
			}
		}
		return value;
	case 'sort':
		return this.runtime.info === 'UserID' ? parseInt(uid,10) : this.get(['Army',uid,infolist[this.runtime.info]]);
	}
};

Army.order = [];
Army.dashboard = function(sort, rev) {
	var i, j, k, label, show = this.get(['runtime','show'],'*'), list = [], output = [], section = [], title = [], showinfo = [], army_fn = [];
	sort = isUndefined(sort) ? this.get(['runtime','sort'],0) : sort;
	rev = isUndefined(rev) ? this.get(['runtime','rev'],false) : rev;
	if ($('#golem-army-show').length) {
		show = $('#golem-army-show').val();
	}
	section.push('<option value="*"' + ('*' === show ? ' selected' : '') + '>All</option>');
	for (i in this.data) {
		section.push('<option value="' + i + '"' + (i === show ? ' selected' : '') + '>' + i + '</option>');
	}
	army_fn.push('*');
	showinfo.push(Army.army_name('info'));
	th(title, Army.army_name('title'));
	for (i in Workers) {
		if (Workers[i].army) {
			army_fn.push(i);
			showinfo.push(Workers[i].army('info'));
			th(title, Workers[i].army('title'));
		}
	}
	list.push('Limit entries to <select id="golem-army-show">' + section.join('') + '</select>, ' + showinfo.trim().join(', '));
	if (!this.order.length || this.runtime.show !== show || !arguments.length) {
		this.set(['runtime','show'], show);
		this.order = [];
		if (show === '*') {
			for (i in this.data) {
				for (j in this.data[i]) {
					this.order.push(j);
				}
			}
			this.order = this.order.unique();
		} else {
			for (i in this.data[show]) {
				this.order.push(i);
			}
		}
	}
	if (sort !== this.runtime.sort || rev !== this.runtime.rev || !arguments.length) {
		this.set(['runtime','sort'], sort);
		this.set(['runtime','rev'], rev);
		this.order.sort(function(a,b) {
			var aa = 0, bb = 0;
//			try {
				if (army_fn[sort] === '*') {
					aa = Army.army_name('sort', a);
					bb = Army.army_name('sort', b);
				} else {
					aa = Workers[army_fn[sort]].army('sort', a);
					bb = Workers[army_fn[sort]].army('sort', b);
				}
//			} catch(e) {}
			if (typeof aa === 'string' || typeof bb === 'string') {
				return (rev ? (''+bb).localeCompare(aa) : (''+aa).localeCompare(bb));
			}
			return (rev ? (aa || 0) - (bb || 0) : (bb || 0) - (aa || 0));
		});
	}

	list.push('<table cellspacing="0" style="width:100%"><thead><tr>' + title.join('') + '</tr></thead><tbody>');
	for (j=0; j<this.order.length; j++) {
		output = [];
		td(output, '<a>' + this.army_name('show', this.order[j]) + '</a>', 'id="golem_army_*_' + this.order[j] + '" style="cursor:pointer;"');
		for (i in Workers) {
			if (Workers[i].army) {
				try {
					k = Workers[i].army('show', this.order[j]) || '-';
					if (Workers[i].army('click')) {
						td(output, '<a>' + k + '</a>', 'id="golem_army_' + i + '_' + this.order[j] + '" style="cursor:pointer;"');
					} else {
						td(output, k);
					}
				} catch(e) {
					td(output, '-');
				}
			}
		}
		tr(list, output.join(''));//, 'style="height:25px;"');
	}
	list.push('</tbody></table>');
	$('#golem-dashboard-Army').html(list.join(''));
	$('#golem-dashboard-Army td:first-child,#golem-dashboard-Army th:first-child').css('text-align', 'left');
	$('#golem-dashboard-Army select').change(function() {Army._notify('data');});// Force a redraw
	$('#golem-dashboard-Army thead th:eq('+sort+')').attr('name',(rev ? 'reverse' : 'sort')).append('&nbsp;' + (rev ? '&uarr;' : '&darr;'));
	$('#golem-dashboard-Army td').click(function(e){
		var tmp = $(this).attr('id').regex(/^golem_army_(.*)_(\d+)$/i);
		if (tmp.length) {
			if (tmp[0] === '*') {
				Army.army_name('click', tmp[1])
			} else {
				Workers[tmp[0]]('click', tmp[1])
			}
		}
		e.stopImmediatePropagation();
		return false;
	});
};


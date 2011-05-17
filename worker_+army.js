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
		for (i in this.data._info) { // Finally remove _info into Army
			this._set(['data','Army',i], this.data._info[i]);
			this._set(['data','_info',i])
		}
	}
	// END
};

Army.init = function() {
	$('#golem').append('<div id="golem-army-tooltip" class="golem-tooltip golem-shadow golem-overlay"><a>&nbsp;x&nbsp;</a><p></p></div>');
	$('#golem-army-tooltip > a').click(function(){$('#golem-army-tooltip').hide();});
	$('#golem-army-tooltip a[href*="keep.php"]').live('click', function(){
		Page.to('keep_stats', $(this).attr('href').substr($(this).attr('href').indexOf('?')));
		return false;
	});
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

Army.infolist = {
	'UserID':'uid',
	'Level':'level',
	'Army Size':'army_size'
};

Army.sectionlist = {
	'Army':{ //
		'title':'Name',
		'show':function(uid) {
			return this.get(['Army',uid,'name'],'-').html_escape();
		},
		'tooltip':function(uid) {
			var i, obj = {};
			for (i in this.data) {
				if (this.data[i][uid]) {
					obj[i] = this.data[i][uid];
				}
			}
			return $(Page.makeLink('keep.php', 'user=' + uid, 'Visit Keep') + '<hr><b>userID: </b>' + uid + '<br><hr><b>Raw Data:</b><pre>' + JSON.stringify(obj, null, '   ') + '</pre><br>');
		}
	},
	'_info':{ // Second column = Info
		'title':function(){
			return 'Info (' + (findInObject(Army.infolist, Army.runtime.info) || '') + ')';
		},
		'show':function(uid){
			return Army.runtime.info === 'uid' ? uid : this.get(['Army',uid,Army.runtime.info],'-');
		},
		'sort':function(uid){
			return Army.runtime.info === 'uid' ? uid : this.get(['Army',uid,Army.runtime.info],'-');
		}
	}
};

Army.section = function(name, fn) { // Safe to call in setup()
	// Add a section to the dashboard.
	// callback = function(type, data), returns text or html string
	// type = 'id', 'sort', 'tooltip'
	this.sectionlist[name] = fn;
};

Army._getSection_ = function(show, key, uid) { // Named with underscores to prevent Debug overhead...
	try {
		if (isNumber(show)) {
			show = objectIndex(this.sectionlist, show);
		}
		switch(typeof this.sectionlist[show][key]) {
			case 'string':
				return this.sectionlist[show][key];
			case 'function':
				return this.sectionlist[show][key](uid);
			default:
				return '';
		}
	} catch(e){}// *Really* don't want to do anything in the catch as it's performance sensitive!
	return '';
};

Army.order = [];
Army.dashboard = function(sort, rev) {
	var i, j, k, label, show = this.runtime.show || 'Army', info = this.runtime.info, list = [], output = [], showsection = [], showinfo = [];
	if ($('#golem-army-show').length) {
		show = $('#golem-army-show').val();
	}
	if ($('#golem-army-info').length) {
		info = $('#golem-army-info').val();
	}
	if (typeof sort === 'undefined' || this.runtime.show !== show || this.runtime.info !== info) {
		this.runtime.show = show;
		this.runtime.info = info;
		this.order = [];
		for (i in this.data[show]) {
			this.order.push(i);
		}
	}
	for (i in this.data) {
		showsection.push('<option value="' + i + '"' + (i === show ? ' selected' : '') + '>' + i + '</option>');
	}
	for (i in this.infolist) {
		showinfo.push('<option value="' + (this.infolist[i] || '') + '"' + (this.infolist[i] === info ? ' selected' : '') + '>' + i + '</option>');
	}
	list.push('Limit entries to <select id="golem-army-show">' + showsection.join('') + '</select> ... Info: <select id="golem-army-info">' + showinfo.join('') + '</select>');
	if (sort !== this.runtime.sort || rev !== this.runtime.rev) {
		this.runtime.sort = sort = typeof sort !== 'undefined' ? sort : (this.runtime.sort || 0);
		this.runtime.rev = rev = typeof rev !== 'undefined' ? rev : (this.runtime.rev || false);
		this.order.sort(function(a,b) {
			var aa = 0, bb = 0;
			try {
				aa = Army._getSection_(sort, 'show', a);
			} catch(e1){}
			try {
				bb = Army._getSection_(sort, 'show', b);
			} catch(e2){}
			if (typeof aa === 'string' || typeof bb === 'string') {
				return (rev ? (''+bb).localeCompare(aa) : (''+aa).localeCompare(bb));
			}
			return (rev ? (aa || 0) - (bb || 0) : (bb || 0) - (aa || 0));
		});
	}
	th(output, 'UserID');
	for (i in this.sectionlist) {
		th(output, this._getSection_(i, 'title'));
	}
	list.push('<table cellspacing="0" style="width:100%"><thead><tr>' + output.join('') + '</tr></thead><tbody>');
	for (j=0; j<this.order.length; j++) {
		output = [];
		td(output, this.order[j]);
		for (i in this.sectionlist) {
			try {
				k = this._getSection_(i, 'show', this.order[j]);
				if (k) {
					if (this.sectionlist[i]['tooltip'] || this.sectionlist[i]['click']) {
						td(output, '<a>' + k + '</a>');
					} else {
						td(output, k);
					}
				} else {
					td(output, '');
				}
			} catch(e3) {
				log(LOG_WARN, e3.name + ' in Army.dashboard(): ' + i + '("label"): ' + e3.message);
				td(output, '');
			}
		}
		tr(list, output.join(''));//, 'style="height:25px;"');
	}
	list.push('</tbody></table>');
	$('#golem-dashboard-Army').html(list.join(''));
	$('#golem-dashboard-Army td:first-child,#golem-dashboard-Army th:first-child').css('text-align', 'left');
	$('#golem-dashboard-Army select').change(function(e){Army._unflush();Army.dashboard();});// Force a redraw
	$('#golem-dashboard-Army thead th:eq('+sort+')').attr('name',(rev ? 'reverse' : 'sort')).append('&nbsp;' + (rev ? '&uarr;' : '&darr;'));
	$('#golem-dashboard-Army td a').click(function(e){
		e.stopPropagation();
		var $this, section, uid, tooltip;
		$this = $(this.wrappedJSObject || this);
		try {
			section = objectIndex(Army.sectionlist, $this.closest('td').index());
			uid = Army.order[$this.closest('tr').index()];
			Army._unflush();
			if ('tooltip' in Army.sectionlist[section]) {
				tooltip = Army._getSection_(section, 'tooltip', uid);
				if (tooltip && tooltip !== '') {
					$('#golem-army-tooltip > p').html(tooltip);
					$('#golem-army-tooltip').css({
						top:($this.offset().top + $this.height()),
						left:$this.closest('td').offset().left
					}).show();
				}
			}
		} catch(e4) {
			log(LOG_WARN, e4.name + ' in Army.dashboard(): ' + Army._getSection_($this.closest('td').index(),'name') + '(data,"tooltip"): ' + e4.message);
		}
		return false;
	});
};


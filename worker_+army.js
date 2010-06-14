/********** Worker.Army **********
* Stores data by facebook userid for any worker that wants to use it.
* Data is stored as -
* Army.data.uid.section[...] = value
* section == '_info' for general use of any workers with data useful for many
* section == '_last' is the last time the data was accessed (not including making a list)
*/
var Army = new Worker('Army');
Army.data = {};

Army.settings = {
	system:true,
	advanced:true
};

Army.option = {
	forget:14// Number of days to remember any userid
};

Army.runtime = {
	update:{},// WorkerName:true, cleared in Army.update() as we poll each in turn
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
Army.update = function(type,worker) {
	if (type === 'data' && !worker) {
		for (var i in this.runtime.update) {
			Workers[i]._update(type, this);
			delete this.runtime.update[i];
		}
	}
};

Army.init = function() {
	$('#content').append('<div id="golem-army-tooltip" class="golem-tooltip"><a>&nbsp;x&nbsp;</a><p></p></div>');
	$('#golem-army-tooltip > a').click(function(){$('#golem-army-tooltip').hide()});
	$('#golem-army-tooltip a[href*="keep.php"]').live('click', function(){
		Page.to('keep_stats', $(this).attr('href').substr($(this).attr('href').indexOf('?')));
		return false;
	});
	for (var i in this.data) {// Fix for accidentally added bad data in a previous version
		if (typeof i === 'string' && i.regex(/[^0-9]/g)) {
			delete this.data[i];
		}
	}
};

// what = ['worker', userID, key ...]
Army.set = function(what, value) {
	var x = typeof what === 'string' ? what.split('.') : (typeof what === 'object' ? what : []), section = null, uid = null;
	if (x[0] === 'option' || x[0] === 'runtime') {
		return this._set(x, value);// Pasthrough
	}
	// Section first - either string id, worker.name, or current_worker.name
	if (isWorker(x[0])) {
		section = x.shift().name;
	} else if (typeof x[0] === 'string' && x[0].regex(/[^0-9]/gi)) {
		section = x.shift();
	} else {
		section = WorkerStack.length ? WorkerStack[WorkerStack.length-1].name : null;
	}
	// userID next
	if (x.length && typeof x[0] === 'string' && !x[0].regex(/[^0-9]/gi)) {
		uid = x.shift();
	}
	if (!section || !uid) { // Must have both section name and userID to continue
		return;
	}
//	log('this._set(\'data.' + uid + '.' + section + (x.length ? '.' + x.join('.') : '') + ', ' + value + ')');
	if (section in Workers && !section in this.runtime.update) {
		this.runtime.update[section] = true;
	}
// Removed for performance reasons...
//	this._set(['data', uid, '_last'], Date.now()); // Remember when it was last accessed
	x.unshift('data', uid, section);
	return this._set(x, value);
};

// what = [] (for list of uids that this worker knows about), ['section', userID, key ...]
Army.get = function(what, def) {
	var i, x = typeof what === 'string' ? what.split('.') : (typeof what === 'object' ? what : []), section = null, uid = null, list = [];
	if (x[0] === 'option' || x[0] === 'runtime') {
		return this._get(x, def);// Pasthrough
	}
	// Section first - either string id, worker.name, or current_worker.name
	if (isWorker(x[0])) {
		section = x.shift().name;
	} else if (typeof x[0] === 'string' && x[0].regex(/[^0-9]/gi)) {
		section = x.shift();
	} else {
		section = WorkerStack.length ? WorkerStack[WorkerStack.length-1].name : null;
	}
	// No userid, so return a list of userid's used by this section
	if (section && x.length === 0) {
		this._unflush();
		for (i in this.data) {
			if (section in this.data[i]) {
				list.push(i);
			}
		}
		return list;
	}
	// userID next
	if (x.length && typeof x[0] === 'string' && !x[0].regex(/[^0-9]/gi)) {
		uid = x.shift();
	}
	if (!section || !uid) { // Must have both section name and userID to continue
		return;
	}
// Removed for performance reasons...
//	this._set(['data', uid, '_last'], Date.now()); // Remember when it was last accessed
	x.unshift('data', uid, section);
	return this._get(x, def);
};

Army.infolist = {
	'UserID':'uid',
	'Level':'level',
	'Army':'army'
};
Army.sectionlist = {
	'Name':{ // First column = Name
		'key':'_info',
		'name':'Name',
		'label':function(data,uid){
			return typeof data[uid]['_info']['name'] !== 'undefined' ? data[uid]['_info']['name'] : '';
		},
		'sort':function(data,uid){
			return typeof data[uid]['_info']['name'] !== 'undefined' ? data[uid]['_info']['name'] : null;
		},
		'tooltip':function(data,uid){
			var space = '&nbsp;&nbsp;&nbsp;', $tooltip;
			$tooltip = $('<a href="http://apps.facebook.com/castle_age/keep.php?user=' + uid + '">Visit Keep</a><hr><b>' + uid + ':</b> {<br>' + ((function(obj,indent){
				var i, output = '';
				for(i in obj) {
					output = output + indent + (isArray(obj) ? '' : '<b>' + i + ':</b> ');
					if (isArray(obj[i])) {
						output = output + '[<br>' + arguments.callee(obj[i],indent + space).replace(/,<br>$/, '<br>') + indent + ']';
					} else if (typeof obj[i] === 'object') {
						output = output + '{<br>' + arguments.callee(obj[i],indent + space).replace(/,<br>$/, '<br>') + indent + '}';
					} else if (typeof obj[i] === 'string') {
						output = output + '"' + obj[i] + '"';
					} else {
						output = output + obj[i];
					}
					output = output + ',<br>';
				}
				return output;
			})(data[uid],space).replace(/,<br>$/, '<br>')) + '}<br>');
			return $tooltip;
		}
	},
	'Info':{ // Second column = Info
		'key':'_info',
		'name':function(){return 'Info (' + (findInObject(Army.infolist, Army.runtime.info) || '') + ')';},
		'show':'Info',
		'label':function(data,uid){
			return Army.runtime.info === 'uid' ? uid : typeof data[uid]['_info'][Army.runtime.info] !== 'undefined' ? data[uid]['_info'][Army.runtime.info] : '';
		},
		'sort':function(data,uid){
			return Army.runtime.info === 'uid' ? uid : typeof data[uid]['_info'][Army.runtime.info] !== 'undefined' ? data[uid]['_info'][Army.runtime.info] : null;
		}
	}
};
Army.section = function(name, object) {
	// Add a section to the dashboard.
	// callback = function(type, data), returns text or html string
	// type = 'id', 'sort', 'tooltip'
	this.sectionlist[name] = object;
};
Army.getSection = function(show, key, uid) {
	try {
		if (isNumber(show)) {
			show = objectIndex(this.sectionlist, show);
		}
		switch(typeof this.sectionlist[show][key]) {
			case 'string':
				return this.sectionlist[show][key];
			case 'function':
				return this.sectionlist[show][key](this.data, uid);
			default:
				return '';
		}
	} catch(e){}// *Really* don't want to do anything in the catch as it's performance sensitive!
	return '';
};

Army.order = [];
Army.dashboard = function(sort, rev) {
	var i, j, k, label, show = this.runtime.show, info = this.runtime.info, list = [], output = [], showsection = [], showinfo = [];
	if ($('#golem-army-show').length) {
		show = $('#golem-army-show').attr('value');
	}
	if ($('#golem-army-info').length) {
		info = $('#golem-army-info').attr('value');
	}
	if (typeof sort === 'undefined' || this.runtime.show !== show || this.runtime.info !== info) {
		this.runtime.show = show;
		this.runtime.info = info;
		this.order = [];
		k = this.getSection(show, 'key');
		for (i in this.data) {
			try {
				label = this.getSection(show, 'sort', i);
				if (label) {
					this.order.push(i);
				}
			} catch(e){}
		}
	}
	for (i in this.sectionlist) {
		th(output, this.getSection(i, 'name'));
		k = this.getSection(i, 'show');
		if (k && k!== '') {
			showsection.push('<option value="' + i + '"' + (i == show ? ' selected' : '') + '>' + k + '</option>');
		}
	}
	for (i in this.infolist) {
		showinfo.push('<option value="' + (this.infolist[i] || '') + '"' + (this.infolist[i] == info ? ' selected' : '') + '>' + i + '</option>');
	}
	list.push('Limit entries to <select id="golem-army-show">' + showsection.join('') + '</select> ... Info: <select id="golem-army-info">' + showinfo.join('') + '</select>');
	if (sort !== this.runtime.sort || rev !== this.runtime.rev) {
		this.runtime.sort = sort = typeof sort !== 'undefined' ? sort : (this.runtime.sort || 0);
		this.runtime.rev = rev = typeof rev !== 'undefined' ? rev : (this.runtime.rev || false);
		this.order.sort(function(a,b) {
			var aa = 0, bb = 0;
			try {
				aa = Army.getSection(sort, 'sort', a);
			} catch(e){}
			try {
				bb = Army.getSection(sort, 'sort', b);
			} catch(e){}
			if (typeof aa === 'string' || typeof bb === 'string') {
				return (rev ? (''+bb).localeCompare(aa) : (''+aa).localeCompare(bb));
			}
			return (rev ? (aa || 0) - (bb || 0) : (bb || 0) - (aa || 0));
		});
	}
	list.push('<table cellspacing="0" style="width:100%"><thead><tr>' + output.join('') + '</tr></thead><tbody>');
	for (j=0; j<this.order.length; j++) {
		output = [];
		for (i in this.sectionlist) {
			try {
//				if (typeof this.data[this.order[j]][this.getSection(i,'key')] !== 'undefined') {
				k = this.getSection(i,'label', this.order[j]);
				if (typeof k !== 'undefined' && k !== null && k !== '') {
					if (this.sectionlist[i]['tooltip'] || this.sectionlist[i]['click']) {
						td(output, '<a>' + k + '</a>');
					} else {
						td(output, k);
					}
				} else {
					td(output, '');
				}
			} catch(e) {
				debug(e.name + ' in Army.dashboard(): ' + i + '("label"): ' + e.message);
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
		$this = $(this.wrappedJSObject ? this.wrappedJSObject : this);
		try {
			section = objectIndex(Army.sectionlist, $this.closest('td').index());
			uid = Army.order[$this.closest('tr').index()];
			Army._unflush();
			if ('click' in Army.sectionlist[section]) {
				if (Army.getSection(section, 'click', uid)) {
					$this.html('<a>' + Army.getSection(section, 'label', uid) + '</a>');
//					Army.dashboard(Army.runtime.show, Army.runtime.rev);
				}
			} else {
				tooltip = Army.getSection(section, 'tooltip', uid);
				if (tooltip && tooltip !== '') {
					$('#golem-army-tooltip > p').html(tooltip);
					$('#golem-army-tooltip').css({
						top:($this.offset().top + $this.height()),
						left:$this.closest('td').offset().left
					}).show();
				}
			}
		} catch(e) {
			debug(e.name + ' in Army.dashboard(): ' + Army.getSection($this.closest('td').index(),'name') + '(data,"tooltip"): ' + e.message);
		}
		return false;
	});
};


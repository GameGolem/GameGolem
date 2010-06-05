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
	sort:0,rev:false,show:'_info'
};

Army.display = [
	{
		id:'forget',
		label:'Forget after',
		select:[1,2,3,4,5,6,7,14,21,28],
		after:'days',
		help:'This will delete any userID that\'s not been seen for a length of time'
	}
];

Army.update = function(type,worker) {
	if (type === 'data' && !worker) {
		var i;
		for (i in this.runtime.update) {
			if (this.runtime.update[i]) {
				Workers[i]._update(type, this);
				this.runtime.update[i] = false;
			}
		}
	}
};

Army.init = function() {
	$('div.UIStandardFrame_Content').after('<div id="golem-army-tooltip" class="golem-tooltip"><img src="data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%10%00%00%00%10%08%03%00%00%00(-%0FS%00%00%00%06PLTE%00%00%00%00%00%00%A5g%B9%CF%00%00%00%01tRNS%00%40%E6%D8f%00%00%00%0FIDATx%DAb%60%18%05%C8%00%20%C0%00%01%10%00%01%3BBBK%00%00%00%00IEND%AEB%60%82"><p></p></div>');
	$('#golem-army-tooltip > img').click(function(){$('#golem-army-tooltip').hide()});
};

// what = ['worker', userID, key ...]
Army.set = function(what, value) {
	this._unflush();
	var x = typeof what === 'string' ? what.split('.') : (typeof what === 'object' ? what : []), section = null, uid = null;
	if (x[0] === 'option' || x[0] === 'runtime') {
		return this._set(x, value);// Pasthrough
	}
	// Section first - either string id, worker.name, or current_worker.name
	x[0] === 'data' && x.shift();// "data" is an illegal section
	if (typeof x[0] === 'string' && x[0].regex(/[^0-9]/gi)) {
		section = x.shift();
	} else if (isWorker(x[0])) {
		section = x.shift().name;
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
	if (typeof Workers[section] !== 'undefined') {
		this.runtime.update[section] = true;
	}
	this._set('data.' + uid + '._last', Date.now()); // Remember when it was last accessed
	this._set('data.' + uid + '.' + section + (x.length ? '.' + x.join('.') : ''), value);
};

// what = [] (for list of uids that this worker knows about), ['section', userID, key ...]
Army.get = function(what, def) {
	this._unflush();
	var x = typeof what === 'string' ? what.split('.') : (typeof what === 'object' ? what : []), section = null, uid = null, list, i;
	if (x[0] === 'option' || x[0] === 'runtime') {
		return this._get(x, def);// Pasthrough
	}
	// Section first - either string id, worker.name, or current_worker.name
	x[0] === 'data' && x.shift();// "data" is an illegal section
	if (typeof x[0] === 'string' && x[0].regex(/[^0-9]/gi)) {
		section = x.shift();
	} else if (isWorker(x[0])) {
		section = x.shift().name;
	} else {
		section = WorkerStack.length ? WorkerStack[WorkerStack.length-1].name : null;
	}
	// No userid, so return a list of userid's used by this section
	if (section && x.length === 0) {
		list = [];
		for (i in this.data) {
			if (typeof this.data[i][section] !== 'undefined') {
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
	this._set('data.' + uid + '._last', Date.now()); // Remember when it was last accessed
	return this._get('data.' + uid + '.' + section + (x.length ? '.' + x.join('.') : ''), def);
};

Army.info_callback = function(type, data, uid) {
	switch(type) {
		default:		return '';
		case 'key':		return '_info';
		case 'name':	return 'Name';
		case 'label':	return data[uid]['_info']['name'] || uid;
		case 'sort':	return data[uid]['_info'] ? data[uid]['_info']['name'] : '';
		case 'tooltip':
			return 'Name: ' + (data[uid]['_info']['name'] || '');
			break;
	}
};

Army.sectionlist = [
	Army.info_callback
];
Army.section = function(name, callback) {
	// Add a section to the dashboard.
	// callback = function(type, data), returns text or html string
	// type = 'id', 'sort', 'tooltip'
	this.sectionlist.push(callback);
};

Army.order = [];
Army.dashboard = function(sort, rev) {
	var i, j, show = this.runtime.show, list = [], output = [], tmp = [];
	if ($('#golem-dashboard-Army select').length) {
		show = $('#golem-dashboard-Army select').attr('value');
		if (show === 'All') {
			show = '_info';
		}
	}
	if (typeof sort === 'undefined' || 	this.runtime.show !== show) {
		this.order = [];
		for (i in this.data) {
			if (typeof this.data[i][show] !== 'undefined') {
				this.order.push(i);
			}
		}
		this.runtime.show = show;
	}
	for (i in this.sectionlist) {
		th(output, this.sectionlist[i]('name'));
		j = this.sectionlist[i]('key');
		tmp.push('<option value="' + j + '"' + (j == show ? ' selected' : '') + '>' + (j === '_info' ? 'All' : this.sectionlist[i]('name')) + '</option>');
	}
	if (sort !== this.runtime.sort || rev !== this.runtime.rev) {
		this.runtime.sort = sort = typeof sort !== 'undefined' ? sort : (this.runtime.sort || 0);
		this.runtime.rev = rev = typeof rev !== 'undefined' ? rev : (this.runtime.rev || false);
		this.order.sort(function(a,b) {
			var aa = 0, bb = 0;
			try {
				aa = sectionlist[sort]('sort', Army.data, a);
			} catch(e){}
			try {
				bb = sectionlist[sort]('sort', Army.data, b);
			} catch(e){}
			if (typeof aa === 'string' || typeof bb === 'string') {
				return (rev ? (bb || '') > (aa || '') : (bb || '') < (aa || ''));
			}
			return (rev ? (aa || 0) - (bb || 0) : (bb || 0) - (aa || 0));
		});
	}
	list.push('Show <select>' + tmp.join('') + '</select> - still very beta, so have patience...');
	list.push('<table cellspacing="0" style="width:100%"><thead><tr>' + output.join('') + '</tr></thead><tbody>');
	for (j=0; j<this.order.length; j++) {
		output = [];
		for (i in this.sectionlist) {
			try {
				if (typeof this.data[this.order[j]][this.sectionlist[i]('key')] !== 'undefined') {
					td(output, '<a>' + this.sectionlist[i]('label', this.data, this.order[j]) + '</a>');
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
	$('#golem-dashboard-Army select').change(function(e){Army._unflush();Army.dashboard();});// Force a redraw
	$('#golem-dashboard-Army thead th:eq('+sort+')').attr('name',(rev ? 'reverse' : 'sort')).append('&nbsp;' + (rev ? '&uarr;' : '&darr;'));
	$('#golem-dashboard-Army tbody td a').click(function(e){
		e.stopPropagation();
		var $this, tooltip;
		$this = $(this.wrappedJSObject ? this.wrappedJSObject : this);
		try {
			Army._unflush();
			tooltip = Army.sectionlist[$this.index()]('tooltip', Army.data, Army.order[$this.closest('tr').index()]);
			if (tooltip) {
				$('#golem-army-tooltip > p').html(tooltip);
				$('#golem-army-tooltip').css({
					top:($this.offset().top + $this.height()),
					left:$this.closest('td').offset().left
				}).show();
			}
		} catch(e) {
			debug(e.name + ' in Army.dashboard(): ' + (Army.sectionlist ? Army.sectionlist[$this.index()]('name') : 'unknown') + '("tooltip"): ' + e.message);
		}
		return false;
	});
};


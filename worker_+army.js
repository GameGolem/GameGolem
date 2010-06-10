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
	$('#content').append('<div id="golem-army-tooltip" class="golem-tooltip"><a>&nbsp;x&nbsp;</a><p></p></div>');
	$('#golem-army-tooltip > a').click(function(){$('#golem-army-tooltip').hide()});
	$('#golem-army-tooltip a[href*="keep.php"]').live('click', function(){
		Page.to('keep_stats', $(this).attr('href').substr($(this).attr('href').indexOf('?')));
		return false;
	});
};

// what = ['worker', userID, key ...]
Army.set = function(what, value) {
	this._unflush();
	var x = typeof what === 'string' ? what.split('.') : (typeof what === 'object' ? what : []), section = null, uid = null;
	if (x[0] === 'option' || x[0] === 'runtime') {
		return this._set(x, value);// Pasthrough
	}
	// Section first - either string id, worker.name, or current_worker.name
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
	this._set(['data', uid, '_last'], Date.now()); // Remember when it was last accessed
	x.unshift('data', uid, section);
	return this._set(x, value);
};

// what = [] (for list of uids that this worker knows about), ['section', userID, key ...]
Army.get = function(what, def) {
	this._unflush();
	var x = typeof what === 'string' ? what.split('.') : (typeof what === 'object' ? what : []), section = null, uid = null, list, i;
	if (x[0] === 'option' || x[0] === 'runtime') {
		return this._get(x, def);// Pasthrough
	}
	// Section first - either string id, worker.name, or current_worker.name
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
// Removed for performance reasons...
//	this._set(['data', uid, '_last'], Date.now()); // Remember when it was last accessed
	x.unshift('data', uid, section);
	return this._get(x, def);
};

Army.star_off = "data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%0C%00%00%00%0C%08%03%00%00%00a%AB%AC%D5%00%00%00%96PLTE%E7%E8%E9%E7%E8%EA%F2%F3%F4%E4%E5%E6%DF%E0%E1%E1%E2%E3%DA%DB%DC%D2%D3%D4%D3%D4%D5%DE%DF%E0%F1%F2%F3%E8%E9%EB%D8%D9%DA%EF%F1%F2%EE%F0%F2%EB%ED%EF%EB%ED%EE%EA%EC%EE%F1%F3%F4%DF%E1%E1%E4%E6%E7%DB%DD%DD%E3%E4%E6%DA%DC%DD%EA%EB%ED%F0%F1%F2%E3%E4%E5%E2%E3%E4%EC%ED%EE%F5%F6%F8%F2%F3%F5%EC%EE%EF%DC%DE%DF%E4%E5%E7%EF%F0%F2%EA%EB%EC%F4%F5%F7%E7%E9%EA%F6%F7%F9%E6%E8%E9%DB%DD%DE%F3%F4%F6%EC%EE%EE%E0%E1%E2%ED%EE%EF%D4%D5%D6%F4%F5%F6%D5%D6%D7%F5%F6%F7%FF%FF%FFmf%FB%E3%00%00%002tRNS%FF%FF%FF%FF%FF%FF%FF%FF%FF%FF%FF%FF%FF%FF%FF%FF%FF%FF%FF%FF%FF%FF%FF%FF%FF%FF%FF%FF%FF%FF%FF%FF%FF%FF%FF%FF%FF%FF%FF%FF%FF%FF%FF%FF%FF%FF%FF%FF%FF%00%0DP%98%EF%00%00%00vIDATx%DA%3C%8D%D9%16%820%0CD%C3NE%C5%05%10%DC%C0%05%94ni%FF%FF%E7%A0%C1%E3%7D%C8%E4%BE%CC%80ux%1E%05%B8%F3Vj%FC%CBC%88j%91%DB%B3%C6f%85%99%BC%0F%20%D25%03c%5Ea%9C%96%B0Ci%08%89%1C%2C%C7%EB%EFw%05%7D%ACgXAm%9FP%FB%BE%3E_H%A2%20P*%82%2F%C9)%E96%87c%82%24y%EB%06%B7%7Bk'%01%06%00%92%E5%14%B02%9F%07%C0%00%00%00%00IEND%AEB%60%82";
Army.star_on = "data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%0C%00%00%00%0C%08%03%00%00%00a%AB%AC%D5%00%00%00%FCPLTE%FF%ECx%EC%E5%D8%C2%956%DB%C3%8F%C4%968%C3%96%3A%F6%E2w%E5%D7%BB%C9%9D%3B%C2%959%CC%A5U%D3%B6w%EA%E3%D3%EE%E7%DA%FD%EA%5D%EA%E0%CC%FE%EFc%DC%B6A%FF%E3K%C2%937%C5%9A%3A%D7%BD%85%FE%F3%95%E1%BA%3B%E9%E0%CB%E0%BDH%EF%D6l%EF%E9%DF%E7%CCd%E8%DF%C9%F4%DFq%D6%AC%3C%CD%A2%3D%FF%F1%8A%E3%C6%60%D8%BE%88%F5%F5%F5%D0%B0k%F2%F2%EE%FF%E2P%EB%CEN%EE%C8%3C%EF%EC%E3%C3%957%C4%98%3A%EC%E4%D4%CA%A3S%DD%C6%9B%EC%D3k%E0%CF%AB%FF%EE%60%D6%BA%80%DA%BF%87%F1%F0%EB%EA%E1%CF%CF%AA%5D%FF%E5O%E2%D1%AF%FA%E9%83%F5%DDj%E7%C3%40%E8%C5C%C4%959%ED%D3i%E4%D7%BC%F2%EF%E7%C4%977%FB%EC%87%E0%C1_%FF%EF%80%FF%F5%99%C2%969%DC%C8%9F%C5%978%F3%F0%EC%D9%C1%90%DA%C4%94%D3%B4t%BF%8E.%C5%997%FF%EC%5C%FF%DEB%FF%F7%A0%FF%FF%FFv%E6%2F%B2%00%00%00TtRNS%FF%FF%FF%FF%FF%FF%FF%FF%FF%FF%FF%FF%FF%FF%FF%FF%FF%FF%FF%FF%FF%FF%FF%FF%FF%FF%FF%FF%FF%FF%FF%FF%FF%FF%FF%FF%FF%FF%FF%FF%FF%FF%FF%FF%FF%FF%FF%FF%FF%FF%FF%FF%FF%FF%FF%FF%FF%FF%FF%FF%FF%FF%FF%FF%FF%FF%FF%FF%FF%FF%FF%FF%FF%FF%FF%FF%FF%FF%FF%FF%FF%FF%FF%00S%F7r%D1%00%00%00%83IDATx%DAb%08%06%01f%130%C5%00%22%1C%99%3C%A5%E1%1Ce%19%7B_0G%85%97%5D%9FE%CCM%C4%DB%92%DF%8BA%D5%DF%C5%C0*(%C8YJ%89C%8F%C1%CC%8E-((H%D1%95%C1ZG%96!X%97U%8EA%3D0PS%5B%02d%80%83B%A0%90E%A0%BC%07%D84C%C1%00%01%3E%23%5Bc0GT%5C%C3%C9%5D%D2%86%0B%CC1%F7%E3%D6R%F3%11%E6%04s%18%19A%16%9A%F2%04%07%03%04%18%001%8C%20dI%CC%B1%85%00%00%00%00IEND%AEB%60%82";
Army.timer = "data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%0C%00%00%00%0C%08%03%00%00%00a%AB%AC%D5%00%00%00%06PLTE%22%22%22%FF%FF%FF%5E%87%201%00%00%00%02tRNS%FF%00%E5%B70J%00%00%00'IDATx%DAb%60D%02%0C%E8%1C%06%08%00s%C0%0C%08A%12%07%CC%83s%40%3C%04%07*%83b%0F%02%00%04%18%00%18%EF%00Jb%DAw%FF%00%00%00%00IEND%AEB%60%82";

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
				if (label !== null && label !== '') {
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
				return (rev ? (bb || '') > (aa || '') : (bb || '') < (aa || ''));
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
			section = $this.closest('td').index();
			uid = $this.closest('tr').index();
			Army._unflush();
			if (Army.sectionlist[objectIndex(Army.sectionlist, section)]['click']) {
				if (Army.getSection(section, 'click', Army.order[uid])) {
					$this.html('<a>' + Army.getSection(section, 'label', Army.order[uid]) + '</a>');
				}
			} else {
				tooltip = Army.getSection(section, 'tooltip', Army.order[uid]);
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


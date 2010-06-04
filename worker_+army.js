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

Army.display = [
	{
		id:'forget',
		label:'Forget after',
		select:[1,2,3,4,5,6,7,14,21,28],
		after:'days',
		help:'This will delete any userID that\'s not been seen for a length of time'
	}
];

// what = ['worker', userID, key ...]
Army.set = function(what, value) {
	this._unflush();
	var x = typeof what === 'string' ? what.split('.') : (typeof what === 'object' ? what : []), worker = null, uid = null;
	// Worker first - if we want to pass a different ID then feel free
	if (x[0] === 'option' || x[0] === 'runtime') {
		return this._set(x, value);// Pasthrough
	}
	x[0] === 'data' && x.shift();// "data" is an illegal section
	if (typeof x[0] === 'string' && x[0].regex(/[^0-9]/gi)) {
		worker = x.shift();
	} else if (isWorker(x[0])) {
		worker = x.shift().name;
	} else {
		worker = WorkerStack.length ? WorkerStack[WorkerStack.length-1].name : null;
	}
	// userID next
	if (x.length && typeof x[0] === 'string' && !x[0].regex(/[^0-9]/gi)) {
		uid = x.shift();
	}
	if (!worker || !uid) { // Must have both worker name and userID to continue
		return;
	}
//	log('this._set(\'data.' + uid + '.' + worker + (x.length ? '.' + x.join('.') : '') + ', ' + value + ')');
	this._set('data.' + uid + '._last', Date.now()); // Remember when it was last accessed
	this._set('data.' + uid + '.' + worker + (x.length ? '.' + x.join('.') : ''), value);
};

// what = [] (for list of uids that this worker knows about), ['worker', userID, key ...]
Army.get = function(what, def) {
	this._unflush();
	var x = typeof what === 'string' ? what.split('.') : (typeof what === 'object' ? what : []), worker = null, uid = null, list, i;
	// Worker first - if we want to pass a different ID then feel free
	if (x[0] === 'option' || x[0] === 'runtime') {
		return this._get(x, def);// Pasthrough
	}
	x[0] === 'data' && x.shift();// "data" is an illegal section
	if (typeof x[0] === 'string' && x[0].regex(/[^0-9]/gi)) {
		worker = x.shift();
	} else if (isWorker(x[0])) {
		worker = x.shift().name;
	} else {
		worker = WorkerStack.length ? WorkerStack[WorkerStack.length-1].name : null;
	}
	// No userid, so return a list of userid's used by this worker
	if (worker && x.length === 0) {
		list = [];
		for (i in this.data) {
			if (typeof this.data[i][worker] !== 'undefined') {
				list.push(i);
			}
		}
		return list;
	}
	// userID next
	if (x.length && typeof x[0] === 'string' && !x[0].regex(/[^0-9]/gi)) {
		uid = x.shift();
	}
	if (!worker || !uid) { // Must have both worker name and userID to continue
		return;
	}
	this._set('data.' + uid + '_last', Date.now()); // Remember when it was last accessed
	return this._get('data.' + uid + '.' + worker + (x.length ? '.' + x.join('.') : ''), def);
};
/*
Army.order = [];
Army.dashboard = function(sort, rev) {
	var i, o, list = [], output = [];
	if (typeof sort === 'undefined') {
		this.order = [];
		for (i in this.data) {
			this.order.push(i);
		}
	}
	if (typeof sort === 'undefined') {
		sort = (this.runtime.sort || 1);
	}
	if (typeof rev === 'undefined'){
		rev = (this.runtime.rev || false);
	}
	this.runtime.sort = sort;
	this.runtime.rev = rev;
	function getValue(q){
		switch(sort) {
			case 0:	// general
				return Army.data[q].general || 'zzz';
			case 1: // name
				return q;
			case 2: // area
				return typeof Army.data[q].land === 'number' && typeof Army.land[Army.data[q].land] !== 'undefined' ? Army.land[Army.data[q].land] : Army.area[Army.data[q].area];
			case 3: // level
				return (typeof Army.data[q].level !== 'undefined' ? Army.data[q].level : -1) * 100 + (Army.data[q].influence || 0);
			case 4: // energy
				return Army.data[q].energy;
			case 5: // exp
				return Army.data[q].exp / Army.data[q].energy;
			case 6: // reward
				return Army.data[q].reward / Army.data[q].energy;
			case 7: // item
				return Army.data[q].item || 'zzz';
		}
		return 0; // unknown
	}
	this.order.sort(function(a,b) {
		var aa = getValue(a), bb = getValue(b);
		if (typeof aa === 'string' || typeof bb === 'string') {
			return (rev ? (bb || '') > (aa || '') : (bb || '') < (aa || ''));
		}
		return (rev ? (aa || 0) - (bb || 0) : (bb || 0) - (aa || 0));
	});
	th(output, 'General');
	th(output, 'Name');
	th(output, 'Area');
	th(output, 'Level');
	th(output, 'Energy');
	th(output, '@&nbsp;Exp');
	th(output, '@&nbsp;Reward');
	th(output, 'Item');
	list.push('<table cellspacing="0" style="width:100%"><thead><tr>' + output.join('') + '</tr></thead><tbody>');
	for (o=0; o<this.order.length; o++) {
		i = this.order[o];
		output = [];
		td(output, Generals.get([this.data[i].general]) ? '<img style="width:25px;height:25px;" src="' + imagepath + Generals.get([this.data[i].general, 'img']) + '" alt="' + this.data[i].general + '" title="' + this.data[i].general + '">' : '');
		th(output, i);
		td(output, typeof this.data[i].land === 'number' ? this.land[this.data[i].land].replace(' ','&nbsp;') : this.area[this.data[i].area].replace(' ','&nbsp;'));
		td(output, typeof this.data[i].level !== 'undefined' ? this.data[i].level + '&nbsp;(' + this.data[i].influence + '%)' : '');
		td(output, this.data[i].energy);
		td(output, (this.data[i].exp / this.data[i].energy).round(2), 'title="' + this.data[i].exp + ' total, ' + (this.data[i].exp / this.data[i].energy * 12).round(2) + ' per hour"');
		td(output, '$' + addCommas((this.data[i].reward / this.data[i].energy).round()), 'title="$' + addCommas(this.data[i].reward) + ' total, $' + addCommas((this.data[i].reward / this.data[i].energy * 12).round()) + ' per hour"');
		td(output, this.data[i].itemimg ? '<img style="width:25px;height:25px;" src="' + imagepath + this.data[i].itemimg + '" alt="' + this.data[i].item + '" title="' + this.data[i].item + '">' : '');
		tr(list, output.join(''), 'style="height:25px;"');
	}
	list.push('</tbody></table>');
	$('#golem-dashboard-Army').html(list.join(''));
	$('#golem-dashboard-Army tbody tr td:nth-child(2)').css('text-align', 'left');
	if (typeof sort !== 'undefined') {
		$('#golem-dashboard-Army thead th:eq('+sort+')').attr('name',(rev ? 'reverse' : 'sort')).append('&nbsp;' + (rev ? '&uarr;' : '&darr;'));
	}
};
*/


/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page:true, Queue, Resources,
	Battle, Generals, LevelUp, Player,
	APP, APPID, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, window, browser,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, Divisor, length, unique, deleteElement, sum, findInArray, findInObject, objectIndex, sortObject, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
	makeImage
*/
/********** Worker.Elite() **********
* Build your elite army
*/
var Elite = new Worker('Elite');
Elite.data = null;

Elite.settings = {
	taint:true
};

Elite.defaults['castle_age'] = {
	pages:'* keep_eliteguard army_viewarmy'
};

Elite.option = {
	every:12,
	friends:true,
	armyperpage:25 // Read only, but if they change it and I don't notice...
};

Elite.runtime = {
	armylastpage:1,
	armyextra:0,
	waitelite:0,
	nextelite:0
};

Elite.display = [
	{
		title:'Fill Elite Guard',
		group:[
			{
				id:'friends',
				label:'Facebook Friends Only',
				checkbox:true
			},{
				id:'every',
				label:'Every',
				select:[1, 2, 3, 6, 12, 24],
				after:'hours',
				help:'Although people can leave your Elite Guard after 24 hours, after 12 hours you can re-confirm them'
			}
		]
	}
];

Elite.setup = function() {
	Army.section(this.name, {
		'key':'Elite',
		'name':'Elite',
		'show':'Elite',
		'label':function(data,uid){
			return ('Elite' in data[uid]
				? ('prefer' in data[uid]['Elite'] && data[uid]['Elite']['prefer']
					? '<img src="' + getImage('star_on') + '">'
					: '<img src="' + getImage('star_off') + '">')
				 + ('elite' in data[uid]['Elite'] && data[uid]['Elite']['elite']
					? ' <img src="' + getImage('timer') + '" title="Member until: ' + makeTime(data[uid]['Elite']['elite']) + '">'
					: '')
				 + ('full' in data[uid]['Elite'] && data[uid]['Elite']['full']
					? ' <img src="' + getImage('timer_red') + '" title="Full until: ' + makeTime(data[uid]['Elite']['full']) + '">'
					: '')
				: ('Army' in data[uid] && data[uid]['Army']
					? '<img src="' + getImage('star_off') + '">'
					: '')
				);
		},
		'sort':function(data,uid){
			if (!('Elite' in data[uid]) && !('Army' in data[uid]) && !data[uid]['Army']) {
				return 0;
			}
			return (('prefer' in data[uid]['Elite'] && data[uid]['Elite']['prefer']
					? Date.now()
					: 0)
				+ ('elite' in data[uid]['Elite']
					? Date.now() - parseInt(data[uid]['Elite']['elite'], 10)
					: 0)
				+ ('full' in data[uid]['Elite']
					? Date.now() - parseInt(data[uid]['Elite']['full'], 10)
					: 0));
		},
		'click':function(data,uid){
			if (Army.get(['Elite',uid,'prefer'], false)) {
				Army.set(['Elite',uid,'prefer']);
			} else {
				Army.set(['Elite',uid,'prefer'], true);
			}
			return true;
		}
	});
};

Elite.init = function() {
	if (!this.get(['option','elite'], true)) {
		this.option._disabled = true;
		this.set(['option','elite']);
	}
};

Elite.menu = function(worker, key) {
	if (worker === this) {
		if (!key) {
			return ['fill:Fill&nbsp;Elite&nbsp;Guard&nbsp;Now'];
		} else if (key === 'fill') {
			this.set('runtime.waitelite', 0);
			this._save('runtime');
		}
	}
};

Elite.parse = function(change) {
	if (Page.page === 'keep_eliteguard') {
		$('span.result_body').each(function(i,el){
			var txt = $(el).text();
			if (txt.match(/Elite Guard, and they have joined/i)) {
				Army.set([$('img', el).attr('uid'), 'elite'], Date.now() + 86400000); // 24 hours
				Elite.set(['runtime','nextelite']);
			} else if (txt.match(/'s Elite Guard is FULL!/i)) {
				Army.set([$('img', el).attr('uid'), 'full'], Date.now() + 1800000); // half hour
				Elite.set(['runtime','nextelite']);
			} else if (txt.match(/YOUR Elite Guard is FULL!/i)) {
				Elite.set(['runtime','waitelite'], Date.now());
				Elite.set(['runtime','nextelite']);
				console.log(warn(), 'Elite guard full, wait '+Elite.option.every+' hours');
			}
		});
	} else {
		if ($('input[src*="elite_guard_add"]').length) {
			this.set(['runtime','waitelite'], 0);
		}
	}
	return false;
};

Elite.update = function(event) {
	var i, list, tmp = [], now = Date.now(), check, next;
	if (!this.get(['option', '_disabled'], false)) {
		list = Army.get('Elite');// Try to keep the same guards
		for(i=0; i<list.length; i++) {
			check = Army.get([list[i],'elite'], 0) || Army.get([list[i],'full'], 0);
			if (check < now) {
				Army.set([list[i],'elite']);// Delete the old timers if they exist...
				Army.set([list[i],'full']);// Delete the old timers if they exist...
				if (Army.get([list[i],'prefer'], false)) {// Prefer takes precidence
					next = list[i];
					break;
				}
				if (!next && (!this.option.friends || Army.get(['_info',list[i],'friend'], false))) { // Only facebook friends unless we say otherwise
					next = list[i];// Earlier in our army rather than later
				}
			}
		}
		if (!next) {
			list = Army.get('Army');// Otherwise lets just get anyone in the army
			for(i=0; i<list.length; i++) {
				if (!Army.get([list[i]], false) && (!this.option.friends || Army.get(['_info',list[i],'friend'], false))) {// Only try to add a non-member who's not already added
					next = list[i];
					break;
				}
			}
		}
		check = ((this.runtime.waitelite + (this.option.every * 3600000)) - now) / 1000;
		tmp.push('Elite Guard: Check' + (check <= 0 ? 'ing now' : ' in <span class="golem-time" name="' + ((check * 1000) + now) + '">' + makeTimer(check) + '</span>') + (next ? ', Next: '+Army.get(['_info', next, 'name']) : ''));
		if (next && this.runtime.waitelite) {
			this._remind(check, 'recheck');
		}
	}
	this.set(['runtime','nextelite'], next);
	this.set(['option','_sleep'], !next || (this.runtime.waitelite + (this.option.every * 3600000)) > now);
	Dashboard.status(this, tmp.join('<br>'));
};

Elite.work = function(state) {
	if (state) {
		console.log(warn(), 'Add ' + Army.get(['_info', this.runtime.nextelite, 'name'], this.runtime.nextelite) + ' to Elite Guard');
		Page.to('keep_eliteguard', {twt:'jneg' , jneg:true, user:this.runtime.nextelite});
	}
	return true;
};


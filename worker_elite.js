/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page:true, Queue, Resources,
	Battle, Generals, LevelUp, Player,
	APP, APPID, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, shortNumber, Divisor, length, unique, deleteElement, sum, addCommas, findInArray, findInObject, objectIndex, sortObject, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime, ucfirst, ucwords,
	makeImage
*/
/********** Worker.Elite() **********
* Build your elite army
*/
var Elite = new Worker('Elite');
Elite.data = null;

Elite.defaults['castle_age'] = {
	pages:'* keep_eliteguard army_viewarmy'
};

Elite.option = {
//	elite:true,
	every:12,
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
		id:'elite',
		label:'Fill Elite Guard',
		checkbox:true
	},{
		id:'every',
		label:'Every',
		select:[1, 2, 3, 6, 12, 24],
		after:'hours',
		help:'Although people can leave your Elite Guard after 24 hours, after 12 hours you can re-confirm them'
	},{
		id:'fill',
		label:'Fill Now',
		button:true
	}
];

Elite.init = function() { // Convert old elite guard list
	Army.section(this.name, {
		'key':'Elite',
		'name':'Elite',
		'show':'Elite',
		'label':function(data,uid){
			return ('Elite' in data[uid]
				? ('prefer' in data[uid]['Elite'] && data[uid]['Elite']['prefer']
					? '<img src="' + Images.star_on + '">'
					: '<img src="' + Images.star_off + '">')
				 + ('elite' in data[uid]['Elite'] && data[uid]['Elite']['elite']
					? ' <img src="' + Images.timer + '" title="Member until: ' + makeTime(data[uid]['Elite']['elite']) + '">'
					: '')
				 + ('full' in data[uid]['Elite'] && data[uid]['Elite']['full']
					? ' <img src="' + Images.timer_red + '" title="Full until: ' + makeTime(data[uid]['Elite']['full']) + '">'
					: '')
				: ('Army' in data[uid] && data[uid]['Army']
					? '<img src="' + Images.star_off + '">'
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
	
	$('#'+Config.makeID(this,'fill')).live('click',function(i,el){
		Elite.set('runtime.waitelite', 0);
		Elite._save('runtime');
	});
};

Elite.parse = function(change) {
	if (Page.page === 'keep_eliteguard') {
		$('span.result_body').each(function(i,el){
			var txt = $(el).text();
	/*Arena possibly gone for good
			if (Elite.runtime.nextarena) {
				if (txt.match(/has not joined in the Arena!/i)) {
					Army.set([Elite.runtime.nextarena, 'arena'], -1);
				} else if (txt.match(/Arena Guard, and they have joined/i)) {
					Army.set([Elite.runtime.nextarena, 'arena'], Date.now() + 43200000); // 12 hours
				} else if (txt.match(/'s Arena Guard is FULL/i)) {
					Army.set([Elite.runtime.nextarena, 'arena'], Date.now() + 1800000); // half hour
				} else if (txt.match(/YOUR Arena Guard is FULL/i)) {
					Elite.runtime.waitarena = Date.now();
					console.log(warn(), this + 'Arena guard full, wait '+Elite.option.every+' hours');
				}
			}
	*/
			if (txt.match(/Elite Guard, and they have joined/i)) {
				Army.set([$('img', el).attr('uid'), 'elite'], Date.now() + 86400000); // 24 hours
				Elite.runtime.nextelite = null;
			} else if (txt.match(/'s Elite Guard is FULL!/i)) {
				Army.set([$('img', el).attr('uid'), 'full'], Date.now() + 1800000); // half hour
				Elite.runtime.nextelite = null;
			} else if (txt.match(/YOUR Elite Guard is FULL!/i)) {
				Elite.runtime.waitelite = Date.now();
				Elite.runtime.nextelite = null;
				console.log(warn(), 'Elite guard full, wait '+Elite.option.every+' hours');
			}
		});
	} else {
		if ($('input[src*="elite_guard_add"]').length) {
			this.runtime.waitelite = 0;
		}
	}
	return false;
};

Elite.update = function(event) {
	var i, list, tmp = [], now = Date.now(), check;
	this.runtime.nextelite = null;
	if (this.get(['option', '_enabled'], true)) {
		list = Army.get('Elite');// Try to keep the same guards
		for(i=0; i<list.length; i++) {
			/*jslint eqeqeq:false*/
			if (list[i] == userID) {
			/*jslint eqeqeq:true*/
				continue; // skip self
			}
			check = Army.get([list[i],'elite'], 0) || Army.get([list[i],'full'], 0);
			if (check < now) {
				Army.set([list[i],'elite']);// Delete the old timers if they exist...
				Army.set([list[i],'full']);// Delete the old timers if they exist...
				if (Army.get([list[i],'prefer'], false)) {// Prefer takes precidence
					this.runtime.nextelite = list[i];
					break;
				}
				this.runtime.nextelite = this.runtime.nextelite || list[i];// Earlier in our army rather than later
			}
		}
		if (!this.runtime.nextelite) {
			list = Army.get('Army');// Otherwise lets just get anyone in the army
			for(i=0; i<list.length; i++) {
				/*jslint eqeqeq:false*/
				if (list[i] == userID) {
				/*jslint eqeqeq:true*/
					continue; // skip self
				}
				if (!Army.get([list[i]], false)) {// Only try to add a non-member who's not already added
					this.runtime.nextelite = list[i];
					break;
				}
			}
		}
		check = (this.runtime.waitelite + (this.option.every * 3600000));
		tmp.push('Elite Guard: Check' + (check < now ? 'ing now' : ' in <span class="golem-time" name="' + check + '">' + makeTimer((check - now) / 1000) + '</span>') + (this.runtime.nextelite ? ', Next: '+Army.get(['_info', this.runtime.nextelite, 'name']) : ''));
	}
	Dashboard.status(this, tmp.join('<br>'));
};

Elite.work = function(state) {
	if (!this.option.elite || !this.runtime.nextelite || (this.runtime.waitelite + (this.option.every * 3600000)) > Date.now()) {
		return false;
	}
	if (!state) {
		return true;
	}
	if ((this.runtime.waitelite + (this.option.every * 3600000)) <= Date.now()) {
		console.log(warn(), 'Add ' + Army.get(['_info', this.runtime.nextelite, 'name'], this.runtime.nextelite) + ' to Elite Guard');
		if (!Page.to('keep_eliteguard', {twt:'jneg' , jneg:true, user:this.runtime.nextelite})) {
			return true;
		}
	}
	return false;
};


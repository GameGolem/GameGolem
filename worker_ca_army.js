/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page:true, Queue, Resources,
	Battle, Generals, LevelUp, Player,
	APP, APPID, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, shortNumber, Divisor, length, unique, deleteElement, sum, addCommas, findInArray, findInObject, objectIndex, sortObject, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime, ucfirst, ucwords,
	makeImage
*/
/********** Worker Army Extension **********
* This fills in your army information by overloading Worker.Army()
* We are only allowed to replace Army.work() and Army.parse() - all other Army functions should only be overloaded if really needed
* This is the CA version
*/
Army.pages = 'army_invite army_viewarmy army_gifts';

// Careful not to hit any *real* army options
Army.option.armyperpage = 25; // Read only, but if they change it and I don't notice...
Army.option.invite = false;
Army.option.check = 86400000;
Army.option.recheck = 0;

Army.runtime.count = -1; // How many people have we actively seen
Army.runtime.next = 0; // Next page we want to look at 
Army.runtime.last = 0; // Last time we visited the army list page
Army.runtime.extra = 0; // How many non-real army members are there
Army.runtime.recheck = 0; // Timestamp of when we last saw the oldest member

Army.display = [
{
	id:'invite',
	label:'Auto-Join New Armies',
	checkbox:true
},{
	title:'Members',
	group:[
		{
			id:'check',
			label:'Check for New',
			select:{
				900000:'Quarterly',
				3600000:'Hourly',
				7200000:'2 Hours',
				21600000:'6 Hours',
				43200000:'12 Hours',
				86400000:'Daily',
				604800000:'Weekly'
			}
		},{
			id:'recheck',
			label:'Re-check Old',
			select:{
				0:'Never',
				86400000:'Daily',
				259200000:'3 Days',
				604800000:'Weekly',
				1209600000:'2 Weekly',
				2419200000:'4 Weekly'
			}
		}
	]
}
];

Army.oldinit = Army.init;
Army.init = function() {
	this._watch(Player, 'data.armymax');
	this._watch(Army, 'runtime.next');
	this._remind(Math.min(1, Date.now() - this.runtime.last + this.option.check) / 1000, 'members');
	if (this.runtime.recheck && this.option.recheck) {
		this._remind(Math.min(1, Date.now() - this.runtime.recheck + this.option.recheck) / 1000, 'recheck');
	}
	this.oldinit();
};

Army.parse = function(change) {
	var i, army, tmp, now = Date.now();
	if (Page.page === 'army_viewarmy') {
		$('img[linked="true"][size="square"]').each(function(i,el){
			var uid = $(el).attr('uid'), who = $(el).parent().parent().parent().next();
			Army.set(['Army', uid], true); // Set for people in our actual army
			Army.set(['_info', uid, 'name'], $('a', who).text() + ' ' + $('a', who).next().text());
			Army.set(['_info', uid, 'level'], $(who).text().regex(/([0-9]+) Commander/i));
			Army.set(['_info', uid, 'seen'], now);
		});
		if ($('img[src*="bonus_member.jpg"]').length) {
			Army.runtime.extra = 1 + $('img[src*="bonus_member.jpg"]').parent().next().text().regex('Extra member x([0-9]+)');
			debug('Extra Army Members Found: '+Army.runtime.extra);
		}
		army = this.get('Army');
		for (i=0; i<army.length; i++) {
			/*jslint eqeqeq:false*/
			if (army[i] == userID) {
			/*jslint eqeqeq:true*/
				continue; // skip self
			}
			if (this.get(['_info', army[i], 'page'], 0) === this.runtime.next) {
				if (this.get(['_info', army[i], 'seen'], 0) !== now) {
					this.set(['Army', army[i]]);// Forget this one, he aint been found!!!
				}
			}
		}
	} else if (Page.page === 'army_gifts' && $('img[src*="gift_invite_castle_on.gif"]').length) {
		army = this.get('Army');
		tmp = {};
		for (i=0; i<army.length; i++) {
			tmp[army[i]] = false;
		}
		$('.unselected_list input').each(function(i,el){
			tmp[el.value] = true;
		});
		for (i in tmp) {
			if (tmp[i]) {
				this.set(['Army', i], tmp[i]);
			} else {
				this.set(['Army', i]);
			}
		}
		this.runtime.last = Date.now();
		this._remind(this.option.check / 1000, 'members');
	}
	// Count current Army members
	army = this.get('Army');
	this.runtime.count = 0;
	for (i=0; i<army.length; i++) {
		if (this.get(['_info', army[i], 'seen'], -1) !== -1) {
			this.runtime.count++;
		}
	}
	this.update({self:true, worker:this, type:'watch'});
	return false;
};

Army.oldupdate = Army.update;
Army.update = function(event) {
	this.oldupdate(event);
	if (this.option._enabled && (event.type === 'reminder' || event.type === 'watch')) {
		this.runtime.next = 0;
		if (Player.get('armymax',0) > this.runtime.count + this.runtime.extra || event.type === 'reminder' && event.id === 'recheck') {// Watching for the size of our army changing...
			var i, page, seen, now = Date.now(), army = this.get('Army');// All potential army members
			this.runtime.recheck = 0;
			army.sort(function(a,b){return parseInt(a,10) > parseInt(b,10);});
			for (i=0; i<army.length; i++) {
				seen = this.get(['_info', army[i], 'seen'], -1);
				if (this.runtime.recheck > 0 && seen > 0) {
					this.runtime.recheck = Math.min(this.runtime.recheck, seen);
				}
				if (seen === -1 || (this.option.recheck && now - seen > this.option.recheck)) {
					page = Math.floor((i + 1) / this.option.armyperpage) + 1;
					if (!this.runtime.next || this.runtime.next > page) {
						this.runtime.next = page;
						debug('Want to see userid '+army[i]+', and others on page '+page);
					}
					this.set(['_info', army[i], 'page'], page);
//					break;
				}
			}
			if (this.runtime.recheck && this.option.recheck) {
				this._remind(Math.min(1, Date.now() - this.runtime.recheck + this.option.recheck) / 1000, 'recheck');
			} else {
				this._forget('recheck');
			}
		}
		this.set('option._sleep', (event.type === 'reminder' && event.id === 'members') || !this.runtime.next); // Only sleep if we don't want to see anything
	}
};

Army.work = function(state) {
	if (this.runtime.next || Date.now() - this.runtime.last > this.option.check) {
		if (state) {
			if (this.runtime.next) {
				Page.to('army_viewarmy', {page:this.runtime.next});
			} else {
				Page.to('army_gifts', {app_friends:'c'}, true);
			}
		}
		return true;
	}
	return false;
};


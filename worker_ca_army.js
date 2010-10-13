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
Army.pages = 'army_invite army_viewarmy';

// Careful not to hit any *real* army options
Army.option.armyperpage = 25; // Read only, but if they change it and I don't notice...
Army.option.invite = false;
Army.option.check = 86400000;
Army.option.recheck = 0;

Army.runtime.count = -1; // How many people have we actively seen
Army.runtime.next = 0;
Army.runtime.last = 0;
Army.runtime.extra = 0;

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
	this._watch(Player);
	this._remind((Date.now() - this.runtime.last + this.option.check) / 1000, 'members');
	this.oldinit();
};

Army.parse = function(change) {
	var i, army;
	if (Page.page === 'army_viewarmy') {
		$('img[linked="true"][size="square"]').each(function(i,el){
			var uid = $(el).attr('uid'), who = $(el).parent().parent().parent().next();
			Army.set(['Army', uid], true); // Set for people in our actual army
			Army.set(['_info', uid, 'name'], $('a', who).text() + ' ' + $('a', who).next().text());
			Army.set(['_info', uid, 'level'], $(who).text().regex(/([0-9]+) Commander/i));
			Army.set(['_info', uid, 'seen'], Date.now());
		});
		if ($('img[src*="bonus_member.jpg"]').length) {
			Army.runtime.extra = 1 + $('img[src*="bonus_member.jpg"]').parent().next().text().regex('Extra member x([0-9]+)');
			debug('Extra Army Members Found: '+Army.runtime.extra);
		}
	} else if (Page.page === 'army_invite' && $('img[src*="gift_invite_castle_on.gif"]').length) {
		army = this.get('Army');
		for (i in army) {
			this.set('Army', false);
		}
		$('.unselected_list input').each(function(i,el){
			Army.set(['Army', el.value], true);
		});
	}
	army = this.get('Army');
	this.runtime.next = 0;
	this.runtime.count = 0;
	var i, army = this.get('Army');
	for (i in army) {
		if (this.get(['_info', army[i], 'seen'], -1) !== -1) {
			this.runtime.count++;
		}
	}
	return false;
};

Army.oldupdate = Army.update;
Army.update = function(type, worker) {
	if (type === 'reminder') {
		if (Player.get('armymax',0) > this.runtime.count + this.runtime.extra) {// Watching for the size of our army changing...
			var i, seen, now = Date.now(), army = this.get('Army');// All potential army members
			army.sort(function(a,b){return parseInt(a) > parseInt(b);});
			for (i=0; i<army.length; i++) {
				seen = this.get(['_info', army[i], 'seen'], -1);
				if (seen == -1 || (this.option.recheck && now - seen > this.option.recheck)) {
					this.runtime.next = Math.floor((i + 1) / this.option.armyperpage) + 1;
					debug('Want to see userid '+i+', and others on page '+this.runtime.next);
					break;
				}
			}
		}
		if (!this.runtime.next) {
			this.runtime.last = Date.now();
		}
		this._remind((Date.now() - this.runtime.last + this.option.check) / 1000, 'members');
	}
	this.oldupdate(type, worker);
};

Army.work = function(state) {
	if (this.runtime.next || Date.now() - this.runtime.last > this.option.check) {
		if (state) {
			if (this.runtime.next) {
				Page.to('army_viewarmy', {page:this.runtime.next});
			} else {
				Page.to('army_invite', {app_friends:'c'});
			}
		}
		return true;
	}
	return false;
};


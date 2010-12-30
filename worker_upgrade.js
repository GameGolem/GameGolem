/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page, Queue, Resources,
	Battle, Generals, LevelUp, Player,
	APP, APPID, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, shortNumber, Divisor, length, unique, deleteElement, sum, addCommas, findInArray, findInObject, objectIndex, sortObject, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime, ucfirst, ucwords,
	makeImage
*/
/********** Worker.Upgrade **********
* Spends upgrade points
*/
var Upgrade = new Worker('Upgrade');
Upgrade.data = null;

Upgrade.defaults['castle_age'] = {
	pages:'keep_stats'
};

Upgrade.option = {
	order:[]
};

Upgrade.runtime = {
	working:false,
	run:0
};

Upgrade.display = [
	{
		label:'Points will be allocated in this order, add multiple entries if wanted (ie, 3x Attack and 1x Defense would put &frac34; on Attack and &frac14; on Defense)'
	},{
		id:'order',
		multiple:['Energy', 'Stamina', 'Attack', 'Defense', 'Health']
	}
];

Upgrade.init = function() {
	this._watch(Player, 'data.upgrade');
};

Upgrade.parse = function(change) {
	var result = $('div.results');
	if (this.runtime.working && result.length && result.text().match(/You just upgraded your/i)) {
		this.set('runtime.working', false);
		this.runtime.run++;
	}
	return false;
};

Upgrade.update = function(event) {
	if (this.runtime.run >= this.option.order.length) {
		this.runtime.run = 0;
	}
	var points = Player.get('upgrade'), args;
	this.set('option._sleep', !this.option.order.length || Player.get('upgrade') < (this.option.order[this.runtime.run]==='Stamina' ? 2 : 1));
};

Upgrade.work = function(state) {
	var args;
	switch (this.option.order[this.runtime.run]) {
		case 'Energy':	args = 'energy_max';	break;
		case 'Stamina':	args = 'stamina_max';	break;
		case 'Attack':	args = 'attack';		break;
		case 'Defense':	args = 'defense';		break;
		case 'Health':	args = 'health_max';	break;
		default: this.runtime.run++; return QUEUE_RELEASE; // Should never happen
	}
	if (state) {
		this.runtime.working = true;
		Page.to('keep_stats', {upgrade:args}, true);
	}
	return QUEUE_RELEASE;
};


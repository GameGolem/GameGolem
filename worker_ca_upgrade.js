/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page, Queue, Resources,
	Battle, Generals, LevelUp, Player,
	APP, APPID, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, Divisor, length, sum, findInObject, objectIndex, sortObject, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
	makeImage
*/
/********** Worker.Upgrade **********
* Spends upgrade points
*/
var Upgrade = new Worker('Upgrade');
Upgrade.data = Upgrade.temp = null;

Upgrade.settings = {
	taint:true
};

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
		this.set(['runtime','run'], this.runtime.run + 1);
	}
	return false;
};

Upgrade.update = function(event) {
	if (this.runtime.run >= this.option.order.length) {
		this.set(['runtime','run'], 0);
	}
	var points = Player.get('upgrade'), args;
	this.set('option._sleep', !this.option.order.length || Player.get('upgrade') < (this.option.order[this.runtime.run]==='Stamina' ? 2 : 1));
};

Upgrade.work = function(state) {
	var args = ({Energy:'energy_max', Stamina:'stamina_max', Attack:'attack', Defense:'defense', Health:'health_max'})[this.option.order[this.runtime.run]];
	if (!args) {
		this.set(['runtime','run'], this.runtime.run + 1);
	} else if (state) {
		this.set(['runtime','working'], true);
		Page.to('keep_stats', {upgrade:args}, true);
	}
	return QUEUE_RELEASE;
};


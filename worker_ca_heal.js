/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page, Queue, Resources,
	Battle, Generals, LevelUp, Player,
	APP, APPID, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, Divisor, length, unique, deleteElement, sum, findInArray, findInObject, objectIndex, sortObject, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
	makeImage
*/
/********** Worker.Heal **********
* Auto-Heal above a stamina level
* *** Needs to check if we have enough money (cash and bank)
*/
var Heal = new Worker('Heal');
Heal.data = Heal.temp = null;

Heal.settings = {
	taint:true
};

Heal.defaults['castle_age'] = {};

Heal.option = {
	stamina: 0,
	health: 0
};

Heal.display = [
	{
		id:'stamina',
		label:'Heal Above',
		after:'stamina',
		select:'stamina'
	},{
		id:'health',
		label:'...And Below',
		after:'health',
		select:'health'
	}
];

Heal.init = function() {
	this._watch(Player, 'data.health');
	this._watch(Player, 'data.maxhealth');
	this._watch(Player, 'data.stamina');
};

Heal.update = function(event) {
	var health = Player.get('health', -1);
	this.set(['option','_sleep'], health >= Player.get('maxhealth') || Player.get('stamina') < this.option.stamina || health >= this.option.health);
};

Heal.work = function(state) {
	if (!state || this.me()) {
		return true;
	}
	return false;
};

Heal.me = function() {
	if (!Page.to('keep_stats')) {
		return true;
	}
	console.log(warn(), 'Healing...');
	if ($('input[value="Heal Wounds"]').length) {
		Page.click('input[value="Heal Wounds"]');
	} else {
		console.log(log(), 'Danger Danger Will Robinson... Unable to heal!');
		this.set(['option','_disabled'], true);
	}
	return false;
};


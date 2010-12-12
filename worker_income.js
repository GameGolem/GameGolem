/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page, Queue, Resources,
	Bank, Battle, Generals, LevelUp, Player,
	APP, APPID, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, shortNumber, Divisor, length, unique, deleteElement, sum, addCommas, findInArray, findInObject, objectIndex, sortObject, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime, ucfirst, ucwords,
	makeImage
*/
/********** Worker.Income **********
* Auto-general for Income, also optional bank
* User selectable safety margin - at default 5 sec trigger it can take up to 14 seconds (+ netlag) to change
*/
var Income = new Worker('Income');
Income.data = null;

Income.settings = {
	important:true
};

Income.defaults['castle_age'] = {};

Income.option = {
	general:true,
	bank:true,
	margin:45
};

Income.display = [
	{
		id:'general',
		label:'Use Best General',
		checkbox:true
	},{
		id:'bank',
		label:'Automatically Bank',
		checkbox:true
	},{
		advanced:true,
		id:'margin',
		label:'Safety Margin',
		select:[15,30,45,60],
		suffix:'seconds'
	}
];

Income.work = function(state) {
	if (!this.option.general || !Generals.test(Generals.best('income'))) {
		return QUEUE_FINISH;
	}
//	debug(when + ', Margin: ' + Income.option.margin);
	if (Player.get('cash_timer') > this.option.margin) {
		if (state && this.option.bank && !Bank.stash()) {
			return QUEUE_CONTINUE;
		}
		return QUEUE_FINISH;
	}
	if (!state || !Generals.to('income')) {
		return QUEUE_CONTINUE;
	}
	debug('Waiting for Income... (' + Player.get('cash_timer') + ' seconds)');
	return QUEUE_CONTINUE;
};


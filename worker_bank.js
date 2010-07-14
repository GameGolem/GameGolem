/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page:true, Queue, Resources,
	Battle, Generals, LevelUp, Player,
	APP, APPID, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, isGreasemonkey,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, shortNumber, WorkerByName, WorkerById, Divisor, length, unique, deleteElement, sum, addCommas, findInArray, findInObject, objectIndex, sortObject, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime, ucfirst, ucwords,
	makeImage
*/
/********** Worker.Bank **********
* Auto-banking
*/
var Bank = new Worker('Bank');
Bank.data = null;

Bank.defaults['castle_age'] = {};

Bank.option = {
	general:true,
	above:10000,
	hand:0,
	keep:10000,
	status:true
};

Bank.display = [
	{
		id:'general',
		label:'Use Best General',
		checkbox:true
	},{
		id:'above',
		label:'Bank Above',
		text:true
	},{
		id:'hand',
		label:'Keep in Cash',
		text:true
	},{
		id:'keep',
		label:'Keep in Bank',
		text:true
	},{
		id:'status',
		label:'Show in Dashboard',
		checkbox:true
	}
];

Bank.work = function(state) {
	if (Player.get('cash') <= 10 || Player.get('cash') <= this.option.above) {
		return QUEUE_FINISH;
	} else if (!state || this.stash(Player.get('cash') - this.option.hand)) {
		return QUEUE_CONTINUE;
	}
	return QUEUE_RELEASE;
};

Bank.update = function(type, worker) {
	if (this.option.status) {// Don't use this.worth() as it ignores this.option.keep
		Dashboard.status(this, 'Worth: ' + makeImage('gold') + '$' + addCommas(Player.get('cash') + Player.get('bank')) + ' (Upkeep ' + (Player.get('upkeep') / Player.get('maxincome') * 100).round(2) + '%)<br>Income: ' + makeImage('gold') + '$' + addCommas(Player.get('income') + History.get('income.average.24').round()) + ' per hour (currently ' + makeImage('gold') + '$' + addCommas(Player.get('income')) + ' from land)');
	} else {
		Dashboard.status(this);
	}
};

Bank.stash = function(amount) {
	if (!amount || !Player.get('cash') || Math.min(Player.get('cash'),amount) <= 10) {
		return true;
	}
	if ((this.option.general && !Generals.to('bank')) || !Page.to('keep_stats')) {
		return false;
	}
	$('input[name="stash_gold"]').val(Math.min(Player.get('cash'), amount));
	Page.click('input[value="Stash"]');
	return true;
};

Bank.retrieve = function(amount) {
	WorkerByName(Queue.get('runtime.current')).settings.bank = true;
	amount -= Player.get('cash');
	if (amount <= 0 || (Player.get('bank') - this.option.keep) < amount) {
		return true; // Got to deal with being poor exactly the same as having it in hand...
	}
	if (!Page.to('keep_stats')) {
		return false;
	}
	$('input[name="get_gold"]').val(amount.toString());
	Page.click('input[value="Retrieve"]');
	return false;
};

Bank.worth = function(amount) { // Anything withdrawing should check this first!
	var worth = Player.get('cash') + Math.max(0,Player.get('bank') - this.option.keep);
	if (typeof amount === 'number') {
		return (amount <= worth);
	}
	return worth;
};


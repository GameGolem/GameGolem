/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Workers, Worker, Config, Dashboard, History, Page,
	Generals, LevelUp, Player,
	APP, APPID, APPID_, PREFIX, userID, imagepath,
	isRelease, version, revision, Images, window, browser,
	LOG_ERROR, LOG_WARN, LOG_LOG, LOG_INFO, LOG_DEBUG, log,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH, QUEUE_NO_ACTION,
	isArray, isFunction, isNumber, isObject, isString, isWorker
*/
/********** Worker.FP **********
* Automatically buys FP refills
*/
var FP = new Worker('FP');
FP.temp = null;

FP.settings = {
	advanced:true,
	taint:true
};

FP.defaults['castle_age'] = {
	pages:'index oracle_oracle'
};

FP.option = {
	type:'stamina',
	general:'any',
	xp:2800,
	times:0,
	fps:100,
	stat:10
};

FP.display = [
	{
		title:'Important!',
		label:'If Times per Level > 0, this will SPEND FAVOR POINTS!  Use with care.  No guarantee of any kind given.  No refunds.'
	},{
		id:'times',
		label:'Times per level ',
		text:true,
		help:'Never refill more than this many times per level.'
	},{
		id:'general',
		label:'Use General',
//		require:'general=="Manual"',
		select:'generals'
	},{
		id:'type',
		label:'Refill ',
		select:['energy','stamina'],
		help:'Select which resource you want to refill.'
	},{
		id:'xp',
		label:'Refill ',
		text:true,
		help:'Refill when more than this much xp needed to level up.'
	},{
		id:'stat',
		label:'When stat under ',
		text:true,
		help:'Refill when stamina/energy under this number'
	},{
		id:'fps',
		label:'Amount of FPs to keep always',
		text:true,
		help:'Only do a refill if you will have over this amount of FP after refill'
	}
];

FP.runtime = {
	points:0
};

FP.init = function() {
	// BEGIN: fix up "under level 4" generals
	if (this.option.general=== 'under level 4') {
	        this.set('option.general', 'under max level');
	}
	// END
};

FP.page = function(page, change) {
	// No need to parse out Income potions as about to visit the Keep anyway...
	$('.oracleItemSmallBoxGeneral:contains("You have : ")').each(function(i,el){
		FP.set(['runtime','points'], $(el).text().regex(/You have : (\d+) points/i));
	});
	$('.title_action:contains("favor points")').each(function(i,el){
		FP.set(['runtime','points'], $(el).text().regex(/You have (\d+) favor points/i));
	});
	History.set('favor points',this.runtime.points);
	return false;
};

FP.notReady = function() {
	return (Player.get(this.option.type,0) >= this.option.stat 
			|| Player.get('exp_needed', 0) < this.option.xp 
			|| (this.data[Player.get('level',0)] || 0) >= this.option.times 
			|| this.runtime.points < this.option.fps + 10 
			|| LevelUp.get('runtime.running'));
};

FP.update = function(event) {
	Dashboard.status(this, 'You have ' + Config.makeImage('favor') + this.runtime.points + ' favor points.');
	this.set(['option','_sleep'], FP.notReady());
//	log(LOG_WARN, 'a '+(Player.get(this.option.type,0) >= this.option.stat));
//	log(LOG_WARN, 'b '+(Player.get('exp_needed', 0) < this.option.xp));
//	log(LOG_WARN, 'c '+((this.data[Player.get('level',0)] || 0) >= this.option.times));
//	log(LOG_WARN, 'd '+(this.runtime.points < this.option.fps + 10));
};

FP.work = function(state) {
	if (FP.notReady()) {
		return QUEUE_NO_ACTION;
	}
	if (state && Generals.to(this.option.general) && Page.to('oracle_oracle')) {
		Page.click('#'+APPID_+'favorBuy_' + (this.option.type === 'energy' ? '5' : '6') + ' input[name="favor submit"]');
		//this.set(['data', Player.get('level',0).toString()], (parseInt(this.data[Player.get('level',0).toString()] || 0, 10)) + 1); 
		log(LOG_WARN, 'Clicking on ' + this.option.type + ' refill ' + Player.get('level',0));
	}
	return QUEUE_CONTINUE;
};


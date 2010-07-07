/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page, Queue, Resources:true,
	Battle, Generals, LevelUp, Player,
	APP, APPID, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, isGreasemonkey,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, shortNumber, WorkerByName, WorkerById, Divisor, length, unique, deleteElement, sum, addCommas, findInArray, findInObject, objectIndex, arrayIndexOf, arrayLastIndexOf, sortObject, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime, ucfirst, ucwords,
	makeImage
*/
/********** Worker.Resources **********
* Store and report Resourcess

Workers can add a type of Resources that they supply - Player would supply Energy and Stamina when parsing etc
Workers request buckets of Resourcess during init() - each bucket gets a display in the normal Resources config panel.

Resources stores the buckets as well as an overflow bucket - the overflow is used during level up

Buckets may be either -
"Shared" buckets are like now - first-come, first-served from a single source
- or -
"Exclusive" buckets are filled by a drip system, forcing workers to share Resourcess

The Shared bucket has a priority of 0

When there is a combination of Shared and Exclusive, the relative priority of the buckets are used - total of all priorities / number of buckets.
Priority is displayed as -5, -4, -3, -2, -1, 0, +1, +2, +3, +4, +5

When a worker is disabled (Queue.option.enabled[worker] === false) then it's bucket is completely ignored and Resourcess are shared to other buckets.

Buckets are filled in priority order, in cases of same priority, alphabetical order is used
*/

var Resources = new Worker('Resources');
Resources.settings = {
	system:true,
	unsortable:true
};

Resources.option = {
	types:{},
	buckets:{}
};

Resources.runtime = {
	types:{},// {'Energy':true}
	buckets:{}
};

Resources.display = function() {
	var type, group, worker, require, display = [];
	if (!length(this.runtime.types)) {
		return 'Discovering Resources...';
	}
	display.push({label:'Not doing anything yet...'});
	for (type in this.option.types) {
		group = [];
		require = {};
		require['types.'+type] = 2;
		for (worker in this.runtime.buckets) {
			if (type in this.runtime.buckets[worker]) {
				group.push({
					id:'buckets.'+worker+'.priority',
					label:'...<b>'+worker+'</b> priority',
					select:{9:'+4',8:'+3',7:'+2',6:'+1',5:'0',4:'-1',3:'-2',2:'-3',1:'-4',0:'Disabled'}
				});
			}
		}
		display.push({
			title:type
		},{
			id:'types.'+type,
			label:'Resource Use',
			select:{0:'None',1:'Shared',2:'Exclusive'}
		},{
			group:group,
			require:require
		});
	}
	return display;
};

Resources.init = function() {
//	Config.addOption({label:'test',checkbox:true});
};

/***** Resources.addType() *****
Add a type of Resources
*/
Resources.addType = function(type) {
	this._push();
	this.set(['runtime','types',type], this.get(['runtime','types',type], 0));
	this.set(['option','types',type], this.get(['option','types',type], true));
	Config.makePanel();
	this._pop();
};

/***** Resources.useType() *****
Register to use a type of resource
Actually use a type of resource (must register with no amount first)
*/
Resources.useType = function(type, amount) {
	if (!Worker.stack.length) {
		return;
	}
	var worker = Worker.stack[Worker.stack.length-1];
	if (typeof amount === 'undefined') {
//		this.set(['runtime','types',type], this.get(['runtime','types',type], 0));
//		this.set(['option','types',type], this.get(['option','types',type], true));
		this.set(['runtime','buckets',worker.name,type], this.get(['runtime','buckets',worker.name,type], 0));
		this.set(['option','buckets',worker.name,type], this.get(['option','buckets',worker.name,type], 1));
		this.set(['option','buckets',worker.name,'priority'], this.get(['option','buckets',worker.name,'priority'], 5));
	} else {
	}
};

/***** Resources.add() *****
type = name of Resources
amount = amount to add
abs = is an absolute amount, not relative
1. Set the amount we have to the new value
2. If we've gained, then share some out
*/
Resources.add = function(type, amount, abs) {
	var change, old = this.get(['runtime','types',type], 0);
	if (abs) {
		change = amount - old;
		this.set(['runtime','types',type], amount);
	} else {
		change = amount;
		this.set(['runtime','types',type], amount + old);
	}
//	if (change > 0) {// We've gotten higher, lets share some out...
//	}
};

Resources.get = function(what,def) {
//	log('Resources.get('+what+', '+(def?def:'null')+')');
	return this._get(what,def);
};

Resources.set = function(what,value) {
//	log('Resources.set('+what+', '+(value?value:'null')+')');
	return this._set(what,value);
};


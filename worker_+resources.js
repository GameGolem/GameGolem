/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page, Queue, Resources:true,
	Battle, Generals, LevelUp, Player,
	APP, APPID, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, shortNumber, Divisor, length, unique, deleteElement, sum, addCommas, findInArray, findInObject, objectIndex, sortObject, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime, ucfirst, ucwords,
	makeImage
*/
/********** Worker.Resources **********
* Store and report Resources

Workers can add a type of Resources that they supply - Player would supply Energy and Stamina when parsing etc
Workers request buckets of Resourcess during init() - each bucket gets a display in the normal Resources config panel.

Items can be added as a type - *however* - they should be added with an amount and not as a spendable type by only calling Resources.add(type,amount)
Convention for unspendable Resourcess is to prefix the name with an underscore, ie. "_someitemimage.jpg" (needs to be unique)

Data can be stored for types by using Resourec.set([type, key], value); etc - this makes it "safer" for workers to discuss needs ;-)
Data can be stored at multiple levels deep - simply add extra keys - [type, key1, key2]

Resources stores the buckets as well as an overflow bucket - the overflow is used during level up

Buckets may be either -
"Shared" buckets are like now - first-come, first-served from a single source
- or -
"Exclusive" buckets are filled by a drip system, forcing workers to share Resourcess

The Shared bucket has a priority of 0

When there is a combination of Shared and Exclusive, the relative priority of the buckets are used - total of all priorities / number of buckets.
Priority is displayed as Disabled, -4, -3, -2, -1, 0, +1, +2, +3, +4, +5

When a worker is disabled (worker.get(['option', '_enabled'], true) === false) then it's bucket is completely ignored and Resourcess are shared to other buckets.

Buckets are filled in priority order, in cases of same priority, alphabetical order is used
*/

var Resources = new Worker('Resources');
Resources.settings = {
	system:true,
	unsortable:true,
	no_disable:true
};

Resources.data = {// type:{data} - managed by any access...
};

Resources.option = {
	types:{},
	reserve:{},
	buckets:{}
};

Resources.runtime = {
	types:{},// {'Energy':true}
	buckets:{}
};

//Resources.display = 'Discovering Resources...';

Resources.display = function() {
	var type, group, worker, require, display = [];
	if (!length(this.runtime.types)) {
		return 'No Resources to be Used...';
	}
	display.push({label:'Not doing anything yet...'});
	for (type in this.option.types) {
		group = [];
		require = {};
		require['types.'+type] = 2;
		for (worker in this.runtime.buckets) {
			if (type in this.runtime.buckets[worker]) {
				group.push({
					id:'buckets.'+worker+'.'+type,
					label:'...<b>'+worker+'</b> priority',
					select:{10:'+5',9:'+4',8:'+3',7:'+2',6:'+1',5:'0',4:'-1',3:'-2',2:'-3',1:'-4',0:'Disabled'}
				});
			}
		}
		if (group.length) {
			display.push({
				title:type
			},{
				advanced:true,
				id:'reserve.'+type,
				label:'Reserve',
				text:true
			},{
				id:'types.'+type,
				label:'Resources Use',
				select:{0:'None',1:'Shared',2:'Exclusive'}
			},{
				group:group,
				require:require
			});
		}
	}
	return display;
};

Resources.init = function() {
//	Config.addOption({label:'test',checkbox:true});
};

Resources.update = function(event) {
//	if (event.type === 'init' && event.self) {
//		Config.makePanel(this, this.display2);
//	}
	var worker, type, total = 0;
//	debug('Resources.update()');
	for (type in this.option.types) {
		for (worker in this.runtime.buckets) {
			if (type in this.runtime.buckets[worker]) {
				if (this.option.types[type] === 2) {// Exclusive
					total += this.runtime.buckets[worker][type];
				} else {
					this.runtime.buckets[worker][type] = 0;
				}
			}
		}
		if (this.option.types[type] === 2 && Math.ceil(total) < Math.floor(this.runtime.types[type])) {// We've got an excess for Exclusive, so share
			total = this.runtime.types[type] - total;
			this.runtime.types[type] -= total;
			this.add(type, total);
		}
	}
//	debug(this.runtime.buckets.toSource());
};

/***** Resources.add() *****
type = name of Resources
amount = amount to add
absolute = is an absolute amount, not relative
1a. If amount isn't set then add a type of Resources that can be spent
1b. Update the display with the new type
1c. Don't do anything else ;-)
2. Changing the amount:
2a. If absolute then get the relative amount and work from there
3. Save the new amount
NOTE: we can add() items etc here, by never calling with just the item name - so it won't ever be "spent"
*/
Resources.add = function(type, amount, absolute) {
//	debug('Resources.add('+type+', '+amount+', '+(absolute ? true : false)+')');
	this._push();
	var i, total = 0, worker, old_amount = this.get(['runtime','types',type], 0);
	if (isUndefined(amount)) {// Setting up that we use this type
		this.set(['runtime','types',type], old_amount);
		this.set(['option','types',type], this.get(['option','types',type], 1));
		this.set(['option','reserve',type], this.get(['option','reserve',type], 0));
	} else {// Telling of any changes to the amount
		if (absolute) {
			amount -= old_amount;
		}
		// Store the new value
		this.set(['runtime','types',type], old_amount + amount);
		// Now fill any pots...
		amount -= Math.max(0, old_amount - parseInt(this.option.reserve[type]));
		if (amount > 0 && this.option.types[type] === 2) {
			for (worker in this.option.buckets) {
				if (type in this.option.buckets[worker]) {
					total += this.option.buckets[worker][type]
				}
			}
			amount /= total;
			for (worker in this.option.buckets) {
				if (type in this.option.buckets[worker]) {
					this.runtime.buckets[worker][type] += amount * this.option.buckets[worker][type];
				}
			}
		}		
	}
	this._pop();
};

/***** Resources.use() *****
Register to use a type of Resources that can be spent
Actually use a type of Resources (must register with no amount first)
type = name of Resources
amount = amount to use
use = are we using it, or just checking if we can?
*/
Resources.use = function(type, amount, use) {
	if (Worker.stack.length <= 1) {
		var worker = Worker.stack[0];
		if (isUndefined(amount)) {
			this.set(['runtime','buckets',worker,type], this.get(['runtime','buckets',worker,type], 0));
			this.set(['option','buckets',worker,type], this.get(['option','buckets',worker,type], 5));
		} else if (this.option.types[type] === 1 && this.runtime.types[type] >= amount) {// Shared
			if (use) {
				this.runtime.types[type] -= amount;
			}
			return true;
		} else if (this.option.types[type] === 2 && this.runtime.buckets[worker][type] >= amount) {// Exlusive
			if (use) {
				this.runtime.buckets[worker][type] -= amount;
			}
			return true;
		}
	}
	return false;
};

/***** Resources.has() *****
Check if we've got a certain number of a Resources in total - not on a per-worker basis
Use this to check on "non-spending" resources
*/
Resources.has = function(type, amount) {
	return isUndefined(amount) ? this.get(['runtime','types',type], 0) : this.get(['runtime','types',type], 0) >= amount;
};

Resources.get = function(what,def) {
//	log('Resources.get('+what+', '+(def?def:'null')+')');
	return this._get(what,def);
};

Resources.set = function(what,value) {
//	log('Resources.set('+what+', '+(value?value:'null')+')');
	return this._set(what,value);
};


/********** Worker.Army **********
* Stores data by facebook userid for any worker that wants to use it.
* Data is stored as -
* Army.data.uid.section[...] = value
* section == '_info' for general use of any workers with data useful for many
* section == '_last' is the last time the data was accessed (not including making a list)
*/
var Army = new Worker('Army');
Army.data = {};

Army.settings = {
	system:true,
	advanced:true
};

Army.option = {
	forget:14// Number of days to remember any userid
};

Army.display = [
	{
		id:'forget',
		label:'Forget after',
		select:[1,2,3,4,5,6,7,14,21,28],
		after:'days',
		help:'This will delete any userID that\'s not been seen for a length of time'
	}
];

// what = ['worker', userID, key ...]
Army.set = function(what, value) {
	this._unflush();
	var x = typeof what === 'string' ? what.split('.') : (typeof what === 'object' ? what : []), worker = null, uid = null;
	// Worker first - if we want to pass a different ID then feel free
	if (typeof x[0] === 'string' && x[0].regex(/[^0-9]/gi)) {
		worker = x.shift();
	} else if (isWorker(x[0])) {
		worker = x.shift().name;
	} else {
		worker = WorkerStack.length ? WorkerStack[WorkerStack.length-1].name : null;
	}
	// userID next
	if (x.length && typeof x[0] === 'string' && !x[0].regex(/[^0-9]/gi)) {
		uid = x.shift();
	}
	if (!worker || !uid) { // Must have both worker name and userID to continue
		return;
	}
//	log('this._set(\'data.' + uid + '.' + worker + (x.length ? '.' + x.join('.') : '') + ', ' + value + ')');
	this._set('data.' + uid + '._last', Date.now()); // Remember when it was last accessed
	this._set('data.' + uid + '.' + worker + (x.length ? '.' + x.join('.') : ''), value);
};

// what = [] (for list of uids that this worker knows about), ['worker', userID, key ...]
Army.get = function(what, def) {
	this._unflush();
	var x = typeof what === 'string' ? what.split('.') : (typeof what === 'object' ? what : []), worker = null, uid = null, list, i;
	// Worker first - if we want to pass a different ID then feel free
	if (typeof x[0] === 'string' && x[0].regex(/[^0-9]/gi)) {
		worker = x.shift();
	} else if (isWorker(x[0])) {
		worker = x.shift().name;
	} else {
		worker = WorkerStack.length ? WorkerStack[WorkerStack.length-1].name : null;
	}
	// No userid, so return a list of userid's used by this worker
	if (worker && x.length === 0) {
		list = [];
		for (i in this.data) {
			if (typeof this.data[i][worker] !== 'undefined') {
				list.push(i);
			}
		}
		return list;
	}
	// userID next
	if (x.length && typeof x[0] === 'string' && !x[0].regex(/[^0-9]/gi)) {
		uid = x.shift();
	}
	if (!worker || !uid) { // Must have both worker name and userID to continue
		return;
	}
	this._set('data.' + uid + '_last', Date.now()); // Remember when it was last accessed
	return this._get('data.' + uid + '.' + worker + (x.length ? '.' + x.join('.') : ''), def);
};



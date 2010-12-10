/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Dashboard, History, Page, Queue, Resources,
	Battle, Generals, LevelUp, Player,
	APP, APPID, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, shortNumber, Divisor, length, unique, deleteElement, sum, addCommas, findInArray, findInObject, objectIndex, sortObject, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime, ucfirst, ucwords,
	makeImage
*/
/********** Worker.Title **********
* Changes the window title to user defined data.
* String may contain {stamina} or {Player:stamina} using the worker name (default Player)
*/
var Title = new Worker('Title');
Title.data = null;

Title.settings = {
	system:true,
	unsortable:true,
	advanced:true
};

Title.option = {
	enabled:false,
	title:"CA: {worker} | {energy}e | {stamina}s | {exp_needed}xp by {LevelUp:time}"
};

Title.temp = {
	old:null, // Old title, in case we ever have to change back
	alias:{} // name:'worker:path.to.data[:txt if true[:txt if false]]' - fill via Title.alias()
};

Title.display = [
	{
		id:'enabled',
		label:'Change Window Title',
		checkbox:true
	},{
		id:'title',
		text:true,
		size:24
	},{
		title:'Useful Values',
		info:'{myname}<br>{energy} / {maxenergy}<br>{health} / {maxhealth}<br>{stamina} / {maxstamina}<br>{level}<br>{pause} - "(Paused) " when paused<br>{LevelUp:time} - Next level time<br>{worker} - Current worker<br>{bsi} / {lsi} / {csi}'
	}
];

/***** Title.update() *****
* 1. Split option.title into sections containing at most one bit of text and one {value}
* 2. Output the plain text first
* 3. Split the {value} in case it's really {worker:value}
* 4. Output worker.get(value)
* 5. Watch worker for changes
*/
Title.update = function(event) {
	if (this.option.enabled && this.option.title) {
		var i, tmp, what, worker, value, output = '', parts = this.option.title.match(/([^}]+\}?)/g);// split into "text {option}"
		if (parts) {
			for (i=0; i<parts.length; i++) {
				tmp = parts[i].regex(/([^{]*)\{?([^}]*)\}?/);// now split to "text" "option"
				output += tmp[0];
				if (tmp[1]) {// We have an {option}
					what = (this.temp.alias[tmp[1]] || tmp[1]).split(':');// if option is "worker:value" then deal with it here
					worker = Worker.find(what.shift());
					if (worker) {
						this._watch(worker, what[0]); // Doesn't matter how often we add, it's only there once...
						value = worker.get(what[0], '');
						if (what[1] && value === true) {
							value = what[1];
						} else if (what[2] && !value) {
							value = what[2];
						}
						output += typeof value === 'number' ? addCommas(value) : typeof value === 'string' ? value : '';
					} else {
						debug('Bad worker specified = "' + tmp[1] + '"');
					}
				}
			}
		}
		if (!this.temp.old) {
			this.temp.old = document.title;
		}
		if (!document.title || output !== document.title) {
			document.title = output;
		}
	} else if (this.temp.old) {
		document.title = this.temp.old;
		this.temp.old = null;
	}
};

/***** Title.alias() *****
* Pass a name and a string in the format "Worker:path.to.data[:txt if true[:txt if false]]"
*/
Title.alias = function(name,str) {
	this.temp.alias[name] = str;
};


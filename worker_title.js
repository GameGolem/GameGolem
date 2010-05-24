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
	title:"CA: {Queue:runtime.current} | {energy}e | {stamina}s | {exp_needed}xp by {LevelUp:time}"
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
		info:'{energy} / {maxenergy}<br>{health} / {maxhealth}<br>{stamina} / {maxstamina}<br>{level}<br>{pause} - "(Paused) " when paused<br>{LevelUp:time} - Next level time<br>{Queue:runtime.current} - Activity'
	}
];

Title.old = null; // Old title, in case we ever have to change back

Title.init = function() {
	this._watch(Player);
};

/***** Title.update() *****
* 1. Split option.title into sections containing at most one bit of text and one {value}
* 2. Output the plain text first
* 3. Split the {value} in case it's really {worker:value}
* 4. Output worker.get(value)
* 5. Watch worker for changes
*/
Title.update = function(type) {
	if (this.option.enabled && this.option.title) {
		var i, tmp, what, worker, value, output = '', parts = this.option.title.match(/([^}]+\}?)/g);// split into "text {option}"
		for (i in parts) {
			tmp = parts[i].regex(/([^{]*)\{?([^}]*)\}?/);// now split to "text" "option"
			output += tmp[0];
			if (tmp[1]) {
				worker = Player;
				what = tmp[1].split(':');// if option is "worker:value" then deal with it here
				if (what[1]) {
					worker = WorkerByName(what.shift());
				}
				if (worker) {
					value = worker.get(what[0]);
					output += typeof value === 'number' ? addCommas(value) : typeof value === 'string' ? value : '';
					this._watch(worker); // Doesn't matter how often we add, it's only there once...
				} else {
					debug('Bad worker specified = "' + tmp[1] + '"');
				}
			}
		}
		if (!this.old) {
			this.old = document.title;
		}
		document.title = output;
	} else if (this.old) {
		document.title = this.old;
		this.old = null;
	}
};


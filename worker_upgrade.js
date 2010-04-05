/********** Worker.Upgrade **********
* Spends upgrade points
*/
var Upgrade = new Worker('Upgrade', 'keep_stats');
Upgrade.data = null;

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
	if (this.option.run) {
		this.runtime.run = this.option.run;
		delete this.option.run;
	}
	if (this.option.working) {
		this.runtime.working = this.option.working;
		delete this.option.working;
	}
};

Upgrade.parse = function(change) {
	var result = $('div.results');
	if (this.runtime.working && result.length && result.text().match(/You just upgraded your/i)) {
		this.runtime.working = false;
		this.runtime.run++;
	}
	return false;
};

Upgrade.work = function(state) {
	var points = Player.get('upgrade'), btn;
	if (this.runtime.run >= this.option.order.length) {
		this.runtime.run = 0;
	}
	if (!this.option.order.length || !points || (this.option.order[this.runtime.run]==='Stamina' && points<2)) {
		return false;
	}
	if (!state || !Page.to('keep_stats')) {
		return true;
	}
	switch (this.option.order[this.runtime.run]) {
		case 'Energy':	btn = 'a[href$="?upgrade=energy_max"]';	break;
		case 'Stamina':	btn = 'a[href$="?upgrade=stamina_max"]';break;
		case 'Attack':	btn = 'a[href$="?upgrade=attack"]';		break;
		case 'Defense':	btn = 'a[href$="?upgrade=defense"]';	break;
		case 'Health':	btn = 'a[href$="?upgrade=health_max"]';	break;
		default: this.runtime.run++; return true; // Should never happen
	}
	if (Page.click(btn)) {
		this.runtime.working = true;
	} else {
		Page.reload(); // Only get here if we can't click!
	}
	return true;
};


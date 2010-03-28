/********** Worker.Upgrade **********
* Spends upgrade points
*/
var Upgrade = new Worker('Upgrade', 'keep_stats');
Upgrade.data = null;
Upgrade.option = {
	order:[],
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
	this.option.working = this.data.working;
	this.option.run = this.data.run;
};

Upgrade.parse = function(change) {
	var result = $('div.results');
	if (this.option.working && result.length && result.text().match(/You just upgraded your/i)) {
		this.option.working = false;
		this.option.run++;
	}
	return false;
};

Upgrade.work = function(state) {
	var points = Player.get('upgrade'), btn;
	if (this.option.run >= this.option.order.length) {
		this.option.run = 0;
	}
	if (!this.option.order.length || !points || (this.option.order[this.option.run]==='Stamina' && points<2)) {
		return false;
	}
	if (!state || !Page.to('keep_stats')) {
		return true;
	}
	switch (this.option.order[this.option.run]) {
		case 'Energy':	btn = 'a[href$="?upgrade=energy_max"]';	break;
		case 'Stamina':	btn = 'a[href$="?upgrade=stamina_max"]';break;
		case 'Attack':	btn = 'a[href$="?upgrade=attack"]';		break;
		case 'Defense':	btn = 'a[href$="?upgrade=defense"]';	break;
		case 'Health':	btn = 'a[href$="?upgrade=health_max"]';	break;
		default: this.option.run++; return true; // Should never happen
	}
	if (Page.click(btn)) {
		this.option.working = true;
		return true;
	}
	Page.reload(); // Only get here if we can't click!
	return true;
};


/********** Worker.Upgrade **********
* Spends upgrade points
*/
var Upgrade = new Worker('Upgrade', 'keep_stats');
Upgrade.data = {
	run: 0
};
Upgrade.display = [
	{
		label:'Points will be allocated in this order, add multiple entries if wanted (ie, 3x Attack and 1x Defense would put &frac34; on Attack and &frac14; on Defense)'
	},{
		id:'order',
		multiple:['Energy', 'Stamina', 'Attack', 'Defense', 'Health']
	}
];
Upgrade.parse = function(change) {
	var result = $('div.results');
	if (Upgrade.data.working && result.length && result.text().match(/You just upgraded your/i)) {
		Upgrade.data.working = false;
		Upgrade.data.run++;
		if (Upgrade.data.run >= Upgrade.option.order.length) {
			Upgrade.data.run = 0;
		}
	}
	return false;
};
Upgrade.work = function(state) {
	if (!Upgrade.option.order || !Upgrade.option.order.length || !Player.data.upgrade) {
		return false;
	}
	if (!state) {
		return true;
	}
	if (!Page.to('keep_stats')) {
		return true;
	}
	Upgrade.data.working = true;
	if (Upgrade.data.run >= Upgrade.option.order.length) {
		Upgrade.data.run = 0;
	}
	switch (Upgrade.option.order[Upgrade.data.run]) {
		case 'Energy':
			if (Page.click('a[href$="?upgrade=energy_max"]')) {
				return true;
			}
			break;
		case 'Stamina':
			if (Page.click('a[href$="?upgrade=stamina_max"]')) {
				return true;
			}
			break;
		case 'Attack':
			if (Page.click('a[href$="?upgrade=attack"]')) {
				return true;
			}
			break;
		case 'Defense':
			if (Page.click('a[href$="?upgrade=defense"]')) {
				return true;
			}
			break;
		case 'Health':
			if (Page.click('a[href$="?upgrade=health_max"]')) {
				return true;
			}
			break;
	}
	Page.reload(); // We should never get to this point!
	return true;
};


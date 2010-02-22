/********** Worker.Blessing **********
* Automatically receive blessings
*/
var Blessing = new Worker('Blessing', 'oracle_demipower');
Blessing.option = {
	which: 'Stamina'
};
Blessing.which = ['None', 'Energy', 'Attack', 'Defense', 'Health', 'Stamina'];
Blessing.parse = function(change) {
	var result = $('div.results'), time;
	if (result.length) {
		time = result.text().regex(/Please come back in: ([0-9]+) hours and ([0-9]+) minutes/i);
		if (time && time.length) {
			Blessing.data.when = Date.now() + (((time[0] * 60) + time[1] + 1) * 60000);
		} else if (result.text().match(/You have paid tribute to/i)) {
			Blessing.data.when = Date.now() + 86460000; // 24 hours and 1 minute
		}
	}
	return false;
};
Blessing.display = function() {
	var panel = new Panel(this.name);
	panel.select('which', 'Which:', Blessing.which);
	return panel.show;
};
Blessing.work = function(state) {
	if (!Blessing.option.which || Blessing.option.which === 'None' || Date.now() <= Blessing.data.when) {
		return false;
	}
	if (!state) {
		return true;
	}
	if (!Page.to('oracle_demipower')) {
		return true;
	}
	Page.click('#app'+APP+'_symbols_form_'+Blessing.which.indexOf(Blessing.option.which)+' input.imgButton');
	return false;
};


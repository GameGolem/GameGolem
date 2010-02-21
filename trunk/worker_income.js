/********** Worker.Income **********
* Auto-general for Income, also optional bank
* User selectable safety margin - at default 5 sec trigger it can take up to 14 seconds (+ netlag) to change
*/
Income = new Worker('Income');
Income.data = null;
Income.option = {margin:30};
Income.display = function() {
	var panel = new Panel(this.name);
	panel.checkbox('general', 'Use Best General:');
	panel.checkbox('bank', 'Automatically Bank:');
	panel.select('margin', 'Safety Margin', [15,30,45,60], {suffix:' seconds'});
	return panel.show;
}
Income.work = function(state) {
	if (!Income.option.margin) return false;
	var when = new Date();
	when = Player.data.cash_time - (when.getSeconds() + (when.getMinutes() * 60));
	if (when < 0) {when += 3600;}
//	GM_debug('Income: '+when+', Margin: '+Income.option.margin);
	if (when > Income.option.margin) {
		if (state && Income.option.bank) return Bank.work(true);
		return false;
	}
	if (!state) return true;
	if (Income.option.general && !Generals.to(Generals.best('income'))) return true;
	GM_debug('Income: Waiting for Income...');
	return true;
}

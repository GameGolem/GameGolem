/********** Worker.Income **********
* Auto-general for Income, also optional bank
* User selectable safety margin - at default 5 sec trigger it can take up to 14 seconds (+ netlag) to change
*/
var Income = new Worker('Income');
Income.data = null;
Income.option = {
	general: true,
	bank: true,
	margin: 30
};
Income.display = [
	{
		id:'general',
		label:'Use Best General',
		checkbox:true
	},{
		id:'bank',
		label:'Automatically Bank',
		checkbox:true
	},{
		advanced:true,
		id:'margin',
		label:'Safety Margin',
		select:[15,30,45,60],
		suffix:'seconds'
	}
];

Income.work = function(state) {
	if (!Income.option.margin) {
		return false;
	}
//	debug('Income: '+when+', Margin: '+Income.option.margin);
	if (Player.get('cash_timer') > this.option.margin) {
		if (state && this.option.bank) {
			return Bank.work(true);
		}
		return false;
	}
	if (!state) {
		return true;
	}
	if (this.option.general && !Generals.to(Generals.best('income'))) {
		return true;
	}
	debug('Income: Waiting for Income... (' + Player.get('cash_timer') + ' seconds)');
	return true;
};


/********** Worker.Bank **********
* Auto-banking
*/
var Bank = new Worker('Bank', null);
Bank.data = null;
Bank.option = {
	general: true,
	above: 10000,
	hand: 0,
	keep: 10000
};
Bank.display = [
	{
		id:'general',
		label:'Use Best General',
		checkbox:true
	},{
		id:'above',
		label:'Bank Above',
		text:true
	},{
		id:'hand',
		label:'Keep in Cash',
		text:true
	},{
		id:'keep',
		label:'Keep in Bank',
		text:true
	}
];

Bank.work = function(state) {
	if (Player.get('cash') < this.option.above && (!Queue.get('current') || !WorkerByName(Queue.get('current')).settings.bank)) {
		return false;
	}
	if (!state || !Bank.stash(Player.get('cash') - Math.min(this.option.above, this.option.hand))) {
		return true;
	}
	return false;
};

Bank.stash = function(amount) {
	if (!amount || !Player.get('cash') || Math.min(Player.get('cash'),amount) <= 10) {
		return true;
	}
	if (!Generals.to(Bank.option.general ? 'Aeris' : 'any') || !Page.to('keep_stats')) {
		return false;
	}
	$('input[name="stash_gold"]').val(Math.min(Player.get('cash'), amount));
	Page.click('input[value="Stash"]');
	return true;
};

Bank.retrieve = function(amount) {
	WorkerByName(Queue.get('current')).settings.bank = true;
	amount -= Player.get('cash');
	if (amount <= 0 || (Player.get('bank') - this.option.keep) < amount) {
		return true; // Got to deal with being poor exactly the same as having it in hand...
	}
	if (!Page.to('keep_stats')) {
		return false;
	}
	$('input[name="get_gold"]').val(amount.toString());
	Page.click('input[value="Retrieve"]');
	return false;
};

Bank.worth = function(amount) { // Anything withdrawing should check this first!
	var worth = Player.get('cash') + Math.max(0,Player.get('bank') - Bank.option.keep);
	if (typeof amount === 'number') {
		return (amount <= worth);
	}
	return worth;
};


/********** Worker.Heal **********
* Auto-Heal above a stamina level
* *** Needs to check if we have enough money (cash and bank)
*/
var Heal = new Worker('Heal');
Heal.data = null;
Heal.option = {
	stamina: 0,
	health: 0
};
Heal.display = [
	{
		id:'stamina',
		label:'Heal Above',
		after:'stamina',
		select:'stamina'
	},{
		id:'health',
		label:'...And Below',
		after:'health',
		select:'health'
	}
];
Heal.work = function(state) {
	if (Player.data.health >= Player.data.maxhealth || Player.data.stamina < Heal.option.stamina || Player.data.health >= Heal.option.health) {
		return false;
	}
	if (!state) {
		return true;
	}
	if (!Page.to('keep_stats')) {
		return true;
	}
	GM_debug('Heal: Healing...');
	if ($('input[value="Heal Wounds"]').length) {
		Page.click('input[value="Heal Wounds"]');
	} else {
		GM_log('Danger Danger Will Robinson... Unable to heal!');
	}
	return false;
};


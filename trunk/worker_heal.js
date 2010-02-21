/********** Worker.Heal **********
* Auto-Heal above a stamina level
* *** Needs to check if we have enough money (cash and bank)
*/
Heal = new Worker('Heal');
Heal.data = null;
Heal.onload = function() {
	if (!Heal.option.stamina) Heal.option.stamina = 0;
	if (!Heal.option.health) Heal.option.health = 0;
}
Heal.display = function() {
	var panel = new Panel(this.name);
	panel.select('stamina', 'Heal Above', Player.data.maxstamina, {after:' stamina'});
	panel.select('health', '...And Below', Player.data.maxhealth, {after:' health'});
	return panel.show;
}
Heal.work = function(state) {
	if (Player.data.health >= Player.data.maxhealth) return false;
	if (Player.data.stamina < Heal.option.stamina) return false;
	if (Player.data.health >= Heal.option.health) return false;
	if (!state) return true;
	if (!Page.to('keep_stats')) return true;
	GM_debug('Heal: Healing...');
	if ($('input[value="Heal Wounds"]').length) Page.click('input[value="Heal Wounds"]');
	else GM_log('Danger Danger Will Robinson... Unable to heal!');
	return false;
}

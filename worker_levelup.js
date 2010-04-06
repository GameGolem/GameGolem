/********** Worker.LevelUp **********
* Will switch "best" quest and call Quest.work function if there is enough energy available
* Switches generals to specified general
* Will call Heal.work function if current health is under 10 and there is enough stamina available to level up (So Battle/Arena/Monster can automatically use up the stamina.)
* NOTE: We should probably migrate the level up time estimation functions to this worker from Player.  Player still needs the functions to calculate the avgenergyexp and avgstaminaexp though
*/

var LevelUp = new Worker('LevelUp');

LevelUp.data = null;

LevelUp.runtime = {
	leveltime: 0
};

LevelUp.option = {
	general: 'any',
	algorithm: 'Per Action'
};

Battle.init = function() {
	this._watch(Player);
};

LevelUp.display = [
	{
		label:'Beta: Use at your own risk'
	},{
		id:'general',
		label:'LevelUp General',
		select:'generals',
		help:'Select which general to use when leveling up.'
	},{
		id:'algorithm',
		label:'Estimation Method',
		select:['Per Action', 'Per Hour'],
		help:"'Per Hour' uses your gain per hour. 'Per Action' uses your gain per action."
	}
];

LevelUp.work = function(state) {

/**********************
* Here is my version of what I think the LevelUp.work function should do.
* I would like to see some of the code I copied from the various other workers made into their own callable functions within those workers.
***********************/

	var i, best = [];
	
	if(Date.now() > Player.get('level_time')) {
		// Set LevelUp General
		if (!Generals.to(this.option.general)) {
			return true;
		}

		if (Player.get('energy') > 0) {
			// Determine the best quest to run
			// i.e. the highest experience/energy ratio quest with energy requirements below our current energy store
			for (i in Quest.data) {
				if (!best || (Quest.data[i].energy <= Player.get('energy') && ((Quest.data[i].exp / Quest.data[i].energy) >= best.ratio))) {
					best.id = i;
					best.ratio = (Quest.data[i].exp / Quest.data[i].energy);
					best.energy = Quest.data[i].energy;
				}
			}
			// Quest.runtime.best = best.id; // only needed if we are calling a Quest function
			// Run selected Quest
			// The following code is copied from quest.work - should probably make this its own callable function
			switch(Quest.data[best.id].area) {
				case 'quest':
					if (!Page.to('quests_quest' + (Quest.data[best.id].land + 1))) {
						return true;
					}
					break;
				case 'demiquest':
					if (!Page.to('quests_demiquests')) {
						return true;
					}
					break;
				case 'atlantis':
					if (!Page.to('quests_atlantis')) {
						return true;
					}
					break;
				default:
					debug('Quest: Can\'t get to quest area!');
					return false;
			}
			debug('LevelUp: Performing - ' + best + ' (energy: ' + Quest.data[best.id].energy + ')');
			if (!Page.click('div.action[title^="' + best + '"] input[type="image"]')) {
				Page.reload(); // Shouldn't happen
			}
			return true;
			// end copy
		}
		else if (Player.get('stamina') > 0) {
			if (health < 10) {
				// Heal
				// The following code is copied from Heal.work - should probably make this its own callable function
				if (!Page.to('keep_stats')) {
					return true;
				}
				debug('LevelUp: Healing...');
				if ($('input[value="Heal Wounds"]').length) {
					Page.click('input[value="Heal Wounds"]');
				} else {
					log('Unable to heal!  WTF?');
				}
				return true;
				// end copy
			} else {
				// call Battle.work directly because battling has been turned off?
				// Probably need its own callable function as well.
				// If Battling has been turned off, is there a battle targets cache to pull from?  Is there a target ready to attack?
				return true
			}
		}
	}
	return false;
};

LevelUp.update = function(type) {
	var d = new Date(this.get('level_time'));
	Dashboard.status(this, 'Exp: ' + addCommas(this.get('exp_average').round(1)) + ' per hour (next level: ' + d.format('D g:i a') + ')');
//	Dashboard.status(this, 'Testing');
}

LevelUp.get = function(what) {
	var now = Date.now();
	switch(what) {
		case 'level_timer':
			return (this.get('level_time') - Date.now()) / 1000;
		case 'level_time':
			if (this.option.algorithm == 'Per Hour') {
				return now + ((60 * 60 * 1000) * ((Player.get('exp_needed') + History.get('exp.change')) / (History.get('exp.average.change') || 1))) - Math.floor(now % 3600000);
			} else {
				return (this.runtime.leveltime || (Date.now() + (12 * 60 * 60 * 1000)));
			}
		case 'exp_average':
			if (this.option.algorithm == 'Per Hour') {
				return History.get('exp.average.change');
			} else {
				return (12 * ((Player.get('avgenergyexp') || 0) + (Player.get('avgstaminaexp') || 0)));
			}
		default: return this._get(what);
	}
}
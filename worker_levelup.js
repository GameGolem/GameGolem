/********** Worker.LevelUp **********
* Will switch "best" quest and call Quest.work function if there is enough energy available
* Switches generals to specified general
* Will call Heal.work function if current health is under 10 and there is enough stamina available to level up (So Battle/Arena/Monster can automatically use up the stamina.)
*/
var LevelUp = new Worker('LevelUp (beta)');
LevelUp.data = null;

LevelUp.option = {
	general: 'any',
	uselevelup: true
};

LevelUp.display = [
	{
		label:'beta - non-functional'
	},{
		id:'uselevelup',
		label:'Use LevelUp',
		checkbox:true
	},{
		id:'general',
		label:'LevelUp General',
		select:'generals'
	}
];

LevelUp.work = function(state) {
	// **************
	// * Pseudo code to describe what I think the LevelUp.work function should do
	// **************
	
	// If(current time > level up time) {
	// 	Set LevelUp General
	// 	If (available energy > 0) {
	// 		Set Quest.runtime.best to the highest experience/energy ratio quest with energy requirements below our current energy store
	// 		Call Quest.work
	// 		Return true
	//	}
	// 	Else  if (available stamina > 0) {
	// 		if (health < 10) {
	// 			Heal (somehow)
	// 			Return true
	// 		{
	// 		else {
	// 			call Battle.work directly because battling has been turned off?
	// 			Return true
	// 		}
	// 	}
	
	return false;
};


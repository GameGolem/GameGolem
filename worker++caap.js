/********** Worker.Caap **********
* Changes the window Caap to user defined data.
* String may contain {stamina} or {Player:stamina} using the worker name (default Player)
*/
var Caap = new Worker('Caap');
Caap.data = null;

Caap.init = function() {
	Player.option.trusted = true;
};

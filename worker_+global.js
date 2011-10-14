/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Workers,
	APP, APPID, PREFIX, userID, imagepath,
	isRelease, version, revision, Images, window, browser
*/
/********** Worker.Global **********
* Purely here for global options - save having too many system panels
*/
var Global = new Worker('Global');
Global.data = Global.runtime = Global.temp = null;
Global.option = {}; // Left in for config options

Global.settings = {
	system:true,
	unsortable:true,
	no_disable:true,
	taint:true
};

// Use .push() to add our own panel groups
Global.display = [];

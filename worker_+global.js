/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Global:true, History, Page:true, Queue, Resources,
	Battle, Generals, LevelUp, Player,
	APP, APPID, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, Divisor, length, sum, findInObject, objectIndex, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
	makeImage
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

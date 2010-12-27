/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page, Queue, Resources,
	Battle, Generals, LevelUp, Player,
	GM_log, GM_setValue, GM_getValue, localStorage, console, window, revision, version, do_css, jQuery,
	Workers, QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH
	makeTimer, shortNumber, Divisor, length, unique, deleteElement, sum, addCommas, findInArray, findInObject, objectIndex, sortObject, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime, ucfirst, ucwords,
	makeImage
*/
// Global variables only

// Shouldn't touch
var isRelease = false;
var script_started = Date.now();

// Automatically filled
var userID, imagepath, APP, APPID, APPNAME, PREFIX; // All set from Worker:Main

// Detect browser - this is rough detection, mainly for updates
var browser = 'unknown';
if (navigator.userAgent.indexOf('Chrome') >= 0) {
	browser = 'chrome';
} else if (navigator.userAgent.indexOf('Safari') >= 0) {
	browser = 'safari';
} else if (navigator.userAgent.indexOf('Opera') >= 0) {
	browser = 'opera';
} else if (navigator.userAgent.indexOf('Mozilla') >= 0) {
	browser = 'firefox';
	if (typeof GM_log === 'function') {
		browser = 'greasemonkey'; // Treating separately as Firefox will get a "real" extension at some point.
	}
}


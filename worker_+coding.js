/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page, Queue, Resources, Coding:true,
	Battle, Generals, LevelUp, Player,
	APP, APPID, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH, APPNAME,
	makeTimer, Divisor, length, sum, findInObject, objectIndex, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime, makeImage,
	GM_listValues, GM_deleteValue, localStorage
*/
/********** Worker.Coding **********
* Just some coding nifo about current workers - nothing special
*/
var Coding = new Worker('Coding');
Coding.data = Coding.option = Coding.runtime = Coding.temp = null;

Coding.settings = {
	system:true,
	debug:true,
	taint:true
};

Coding.dashboard = function() {
	var i, j, html, list = [], types = ['system', 'advanced', 'debug', 'taint', 'keep'], data = ['display', 'dashboard', 'data', 'option', 'runtime', 'temp'];

	for (i in Workers) {
		html = '';
		for (j=0; j<types.length; j++) {
			if (Workers[i].settings[types[j]]) {
				html += '<td class="green">true</td>';
			} else {
				html += '<td class="red">false</td>';
			}
		}
		for (j=0; j<data.length; j++) {
			if (Workers[i][data[j]]) {
				html += '<td class="green">true</td>';
			} else {
				html += '<td class="red">false</td>';
			}
		}
		list.push('<tr><th>' + i + '</th>' + html + '</tr>');
	}
	list.sort();
	html = '';
	for (j=0; j<types.length; j++) {
		html += '<th>' + types[j].ucfirst() + '</td>';
	}
	for (j=0; j<data.length; j++) {
		html += '<th>' + data[j].ucfirst() + '</td>';
	}
	$('#golem-dashboard-Coding').html('<table><tr><th></th>' + html + '</tr>' + list.join('') + '</table>');
};


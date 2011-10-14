/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Workers, Config, Dashboard, History, Page, Queue,
	APP, APPID, PREFIX, userID, imagepath,
	isRelease, version, revision, Images, window, browser,
	LOG_ERROR, LOG_WARN, LOG_LOG, LOG_INFO, LOG_DEBUG, log,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH, APPNAME,
	isArray, isBoolean, isFunction, isNumber, isObject, isString, isWorker
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
		if (isBoolean(Workers[i]._get(['option','_sleep']))) {
			html += '<td class="green">true</td>';
		} else {
			html += '<td class="red">false</td>';
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
	html += '<th>Sleep</th>';
	for (j=0; j<data.length; j++) {
		html += '<th>' + data[j].ucfirst() + '</td>';
	}
	$('#golem-dashboard-Coding').html('<table><thead><tr><th></th>' + html + '</tr></thead><tbody>' + list.join('') + '</tbody></table>');
};


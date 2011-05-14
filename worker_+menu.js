/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$:true, Worker, Army, Menu:true, History, Page:true, Queue, Resources,
	Battle, Generals, LevelUp, Player,
	APP:true, APPID:true, APPNAME:true, userID:true, imagepath:true, isRelease, version, revision, Workers, PREFIX:true, Images, window, browser,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, Divisor, length, sum, findInObject, objectIndex, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
	makeImage, unsafeWindow, log, warn, error, chrome, GM_addStyle, GM_getResourceText
*/
/********** Worker.Menu **********
* Handles menu creation and selection for Config
*/
var Menu = new Worker('Menu');
Menu.data = Menu.runtime = Menu.option = Menu.temp = null;

Menu.settings = {
	system:true,
	taint:true
};

Menu.init = function() {
	Config._init(); // We patch into the output of Config.init so it must finish first
	$('<span class="ui-icon golem-menu-icon ui-icon-' + Theme.get('Menu_icon', 'gear') + '"></span>')
		.click(function(event) {
			var i, j, k, keys, hr = false, html = '', $this = $(this.wrappedJSObject || this), worker = Worker.find($this.closest('div').attr('name')), name = worker ? worker.name : '';
			if (Config.get(['temp','menu']) !== name) {
				Config.set(['temp','menu'], name);
				for (i in Workers) {
					if (Workers[i].menu) {
						hr = true;
						Workers[i]._unflush();
						keys = Workers[i].menu(worker) || [];
						for (j=0; j<keys.length; j++) {
							k = keys[j].regex(/([^:]*):?(.*)/);
							if (k[0] === '---') {
								hr = true;
							} else if (k[1]) {
								if (hr) {
									html += html ? '<hr>' : '';
									hr = false;
								}
								switch (k[1].charAt(0)) {
									case '!':	k[1] = '<img src="' + getImage('warning') + '">' + k[1].substr(1);	break;
									case '+':	k[1] = '<img src="' + getImage('tick') + '">' + k[1].substr(1);	break;
									case '-':	k[1] = '<img src="' + getImage('cross') + '">' + k[1].substr(1);	break;
									case '=':	k[1] = '<img src="' + getImage('dot') + '">' + k[1].substr(1);	break;
									default:	break;
								}
								html += '<div name="' + i + '.' + name + '.' + k[0] + '">' + k[1] + '</div>';
							}
						}
					}
				}
				$('#golem-menu').html(html || 'no&nbsp;options');
				$('#golem-menu').css({
					position:Config.get(['option','fixed']) ? 'fixed' : 'absolute',
					top:$this.offset().top + $this.height(),
					left:Math.min($this.offset().left, $('body').width() - $('#golem-menu').outerWidth(true) - 4)
				}).show();
			} else {// Need to stop it going up to the config panel, but still close the menu if needed
				Config.set(['temp','menu']);
				$('#golem-menu').hide();
			}
			Worker.flush();
			event.stopPropagation();
			return false;
		})
		.appendTo('#golem_config_frame > h3:first,#golem_config > div > h3 > a');
};


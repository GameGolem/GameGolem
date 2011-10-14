/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Workers, Config, Theme,
	APP, APPID, APPNAME, PREFIX, userID, imagepath,
	isRelease, version, revision, Images, window, browser,
	isArray, isFunction, isNumber, isObject, isString, isWorker,
	getImage
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
			var i, j, k, w, keys, ord, hr = false, html = '',
				$this = $(this.wrappedJSObject || this),
				worker = Worker.find($this.closest('div').attr('name')),
				name = worker ? worker.name : '';
			if (Config.get(['temp','menu']) !== name) {
				Config.set(['temp','menu'], name);
				ord = [];
				ord.push('Queue');
				ord.push('Dashboard');
				for (i in Workers) {
					if (!ord.find(i)) {
						ord.push(i);
					}
				}
				for (i = 0; i < ord.length; i++) {
					w = ord[i];
					if (isFunction(Workers[w].menu)) {
						hr = true;
						Workers[w]._unflush();
						keys = Workers[w].menu(worker) || [];
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
								html += '<div name="' + w + '.' + name + '.' + k[0] + '">' + k[1] + '</div>';
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
//			Worker.flush();
			event.stopPropagation();
			return false;
		})
		.appendTo('#golem_config_frame > h3:first,#golem_config > div > h3 > a');
};


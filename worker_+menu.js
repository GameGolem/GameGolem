/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Workers, Config, Theme,
	APP, APPID, APPNAME, PREFIX, userID, imagepath,
	isRelease, version, revision, Images, window, browser,
	LOG_ERROR, LOG_WARN, LOG_LOG, LOG_INFO, LOG_DEBUG, log,
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

// array of {key}[P][I]{label} strings
//   key = '---'	- horizontal line separator is added into the menu
//   key = *		- key name for that menu action
//   label = *		- displayed label for that menu action
//   P = ' '		- no mapping, spaces are left alone
//   P = *			- spaces are mapped to &nbsp; to prevent wrapping (default)
//   I = '!'		- !!! warning icon
//   I = '+'		- checkbox style, set to selected (tick)
//   I = '-'		- checkbox style, set to not selected (cross)
//   I = '='		- radio button style, set to selected (dot)
//   I = *			- plain menu item (default)

Menu.init = function() {
	Config._init(); // We patch into the output of Config.init so it must finish first
	$('<span class="ui-icon golem-menu-icon ui-icon-' + Theme.get('Menu_icon', 'gear') + '"></span>')
		.click(function(event) {
			var i, j, k, s, w, keys, ord, hr = false, html = '',
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
					if (Workers[w].menu) {
						hr = true;
						Workers[w]._unflush();
						try {
							keys = Workers[w].menu(worker) || [];
						} catch (e) {
							log(e, e.name + ' in ' + w + '.menu(' + worker.name + '): ' + e.message);
						}
						for (j=0; j<keys.length; j++) {
							k = keys[j].regex(/([^:]*):?(.*)/);
							if (k[0] === '---') {
								hr = true;
							} else if (k[1]) {
								if (hr) {
									html += html ? '<hr>' : '';
									hr = false;
								}
								if (k[1].charAt(0) === ' ') {
									s = k[1].substr(1);
								} else {
									s = k[1].replace(' ', '&nbsp;');
								}
								switch (s.charAt(0)) {
								case '!':	s = '<img src="' + getImage('warning') + '">' + s.substr(1);	break;
								case '+':	s = '<img src="' + getImage('tick') + '">' + s.substr(1);	break;
								case '-':	s = '<img src="' + getImage('cross') + '">' + s.substr(1);	break;
								case '=':	s = '<img src="' + getImage('dot') + '">' + s.substr(1);	break;
								default:	break;
								}
								html += '<div name="' + w + '.' + name + '.' + k[0] + '">' + s + '</div>';
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


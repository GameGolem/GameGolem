/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$:true, Worker, Army, Theme:true, History, Page:true, Queue, Resources,
	Battle, Generals, LevelUp, Player,
	APP:true, APPID:true, APPNAME:true, userID:true, imagepath:true, isRelease, version, revision, Workers, PREFIX:true, Images, window, browser,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, Divisor, length, sum, findInObject, objectIndex, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
	makeImage, unsafeWindow, log, warn, error, chrome, GM_addStyle, GM_getResourceText
*/
/********** Worker.Theme **********
* Stores Theme-specific settings as well as allowing to change the theme.
*/
var Theme = new Worker('Theme');
Theme.runtime = Theme.temp = null;

Theme.settings = {
	system:true,
	taint:true
};

Theme.option = {
	theme: 'default',
	themes: { // Put in here so we can update it manually
		'default':{
			'Menu_icon':'gear',
			'Queue_disabled':'ui-state-disabled red',
			'Queue_active':'ui-priority-primary green'
		},
		'test':{}
	}
};

Theme.data = {}; // This is a copy of the current theme from Theme.option, doesn't exist until after .setup

Global.display.push({
	title:'Theming',
	group:[
		function() {
			var i, list = [], options = [];
			for (i in Theme.option.themes) {
				list.push(i);
			}
			for (i in Theme.option.themes['default']) {
				options.push({
					debug:true,
					id:['Theme','option','themes',Theme.option.theme,i],
					label:i,
					text:true
				});
			}
			options.unshift({
				id:['Theme','option','theme'],
				label:'Current Theme',
				select:list
			});
			return options;
		}
	]
});

Theme.setup = function() {
	this._replace('data', this.option.themes[this.option.theme]); // Needs to be here for anything wanting the theme in init()
};

Theme.update = function(event, events) {
	if (events.findEvent(null,'option') || events.findEvent(null,'init')) {
		var i, list = [];
		for (i in this.option.themes) {
			if (i !== this.option.theme) {
				list.push(i);
			}
		}
		this._replace('data', this.option.themes[this.option.theme]);
		$('#golem').removeClass(list.join(' ')).addClass('golem-theme golem-theme-' + this.option.theme);
		Config.makePanel(this);
	}
};

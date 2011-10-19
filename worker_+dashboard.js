/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Workers, Worker, Config,
	APP, APPID, APPID_, PREFIX, userID, imagepath,
	isRelease, version, revision, Images, window, browser,
	LOG_ERROR, LOG_WARN, LOG_LOG, LOG_INFO, LOG_DEBUG, log,
	isArray, isFunction, isNumber, isObject, isString, isWorker
*/
/********** Worker.Dashboard **********
* Displays statistics and other useful info
*/
var Dashboard = new Worker('Dashboard');
Dashboard.temp = null;

Dashboard.settings = {
	taint:true
};

Dashboard.option = {
	display:true,
	expand:false,
	active:'Dashboard',
	width:600,
	height:183
};

/** @this {Worker} */
Dashboard.init = function(old_revision) {
	// BEGIN: Changing this.option.display to a bool
	if (old_revision <= 1110) {
		this.option.display = (this.option.display === true || this.option.display === 'block');
	}
	// END
	var i, j, list = [], tabs = [], divs = [], active = this.option.active, hide, selected = 0;
	if (!Workers[active]) {
		this.set('option.active', active = this.name);
	}
	for (i in Workers) {
		if (i !== this.name && Workers[i].dashboard) {
			list.push(i);
		}
	}
	list.sort();
	list.unshift(this.name);
	for (j=0; j<list.length; j++) {
		i = list[j];
		hide = Workers[i]._get(['option','_hide_dashboard'], false) || (Workers[i].settings.advanced && !Config.option.advanced) || (Workers[i].settings.debug && !Config.option.debug);
		if (this.option.active === i) { // Make sure we can see the active worker
			if (hide) {
				this.set(['option','active'], this.name);
			} else {
				selected = j;
			}
		}
		tabs.push('<li class="' + (hide ? 'ui-helper-hidden' : '') + (Workers[i].settings.advanced ? ' red' : Workers[i].settings.debug ? ' blue' : '') + '"><a href="#golem-dashboard-' + i + '">' + (i===this.name ? '&nbsp;*&nbsp;' : i) + '</a></li>');
		divs.push('<div id="golem-dashboard-' + i + '"></div>');
		this._watch(Workers[i], 'data');
		this._watch(Workers[i], 'option._hide_dashboard');
	}
	$('#golem').append('<div id="golem-dashboard" class="ui-corner-none" style="position:absolute;' + (this.option.display ? '' : 'display:none;') + '"><ul class="ui-corner-none">' + tabs.join('') + '</ul><div>' + divs.join('') + '</div></div>');
	$('<a style="position:absolute;top:3px;right:3px;" class="ui-icon ui-icon-circle-' + (this.option.expand ? 'minus' : 'plus') + '"></a>').click(function(event){
		$(this).toggleClass('ui-icon-circle-minus ui-icon-circle-plus');
		Dashboard.toggle(['option','expand']);
	}).appendTo('#golem-dashboard');
	$('#golem-dashboard')
		.tabs({
			fx: {opacity:'toggle', duration:100},
			selected: selected,
			show: function(event,ui) {
				Dashboard.set(['option','active'], Worker.find(ui.panel.id.slice('golem-dashboard-'.length)).name);
				Dashboard._update(null, 'run');
			}
		});
	Config.addButton({
		id:'golem_icon_dashboard',
		image:'dashboard',
		title:'Show Dashboard',
		active:this.option.display,
		className:this.option.display ? 'green' : '',
		click:function(){
			$(this).toggleClass('golem-button golem-button-active green');
			$('#golem-dashboard').stop()[Dashboard.toggle(['option','display'], true) ? 'fadeIn' : 'fadeOut']('fast');
		}
	});
	$('#golem-dashboard thead th').live('click', function(event){
		var $this = $(this), worker = Workers[Dashboard.option.active];
		worker._unflush();
		worker.dashboard($this.index(), $this.attr('name')==='sort');
	});
	this._resize();
	this._trigger('#'+APPID_+'app_body_container, #'+APPID_+'globalContainer', 'page_change');
	this._watch(this, 'option.active');
	this._watch(this, 'option.expand');
	this._watch(Config, 'option.advanced');
	this._watch(Config, 'option.debug');
};

/** @this {Worker} */
Dashboard.update = function(event, events) {
	var i, advanced, debug, show, $el, offset, width, height, margin = 0;
	if (events.findEvent(Config, 'watch', 'option.advanced') || events.findEvent(Config, 'watch', 'option.debug') || events.findEvent(null, 'watch', 'option._hide_dashboard')) {
		advanced = Config.get(['option','advanced'], false);
		debug = Config.get(['option','debug'], false);
		for (i in Workers) {
			show = (!Workers[i].settings.advanced || advanced) && (!Workers[i].settings.debug || debug) && !Workers[i]._get(['option','_hide_dashboard'], false);
			$('#golem-dashboard .ui-tabs-nav a[href*="'+i+'"]').parent().toggleClass('ui-helper-hidden', !show);
			if (!show && this.option.active === i) {
				this.set(['option','active'], this.name);
			}
		}
		return;
	}
	if (events.findEvent(this, 'watch', 'option.active')
	 || events.findEvent(this.option.active, 'watch', 'data')
	 || events.findEvent(this, 'init')) {
		try {
			Workers[this.option.active]._unflush();
			Workers[this.option.active].dashboard();
		}catch(e) {
			log(LOG_ERROR, e.name + ' in ' + this.option.active + '.dashboard(): ' + e.message);
		}
	}
	if (events.findEvent(this, 'watch', 'option.active')) {
		$('#golem-dashboard').tabs('option', 'selected', $('#golem-dashboard-'+this.option.active).index());
	}
	if ((event = events.findEvent(this, 'resize'))
	 || (event = events.findEvent(this, 'trigger'))
	 || (event = events.findEvent(this, 'init'))
	 || events.findEvent(this, 'watch', 'option.expand')) { // Make sure we're always in the right place
		if (this.get(['option','expand'], false)) {
			$el = $('#contentArea,#globalcss').eq(0);
			width = $el.width();
			height = $el.height();
			margin = 10;
		} else {
			$el = $('#'+APPID_+'app_body_container');
			width = this.get(['option','width'], 0);
			height = this.get(['option','height'], 0);
		}
		offset = $el.offset();
		$('#golem-dashboard')[event ? 'css' : 'animate']({'top':offset.top + margin, 'left':offset.left + margin, 'width':width - (2 * margin), 'height':height - (2 * margin)});
	}
	return true;
};

/** @this {Worker} */
Dashboard.dashboard = function() {
	var i, j, s, list = [];

	for (i in this.data) {
		if (Workers[i]) {
			j = Workers[i]._get(['option','_hide_status'], 2, 'number');
		} else {
			j = null;
		}
		s = this.data[i];
		if (j === 1 && !s) {
			s = '<i>Nothing to do.</i>';
		}
		if ((j === 2 || j === true) && s && /\bNothing to do\b/i.test(s)) {
			s = null;
		}
		if (j && s) {
			list.push('<tr><th>' + i + ':</th><td id="golem-status-' + i + '">' + s + '</td></tr>');
		}
	}

	list.sort(); // Ok with plain text as first thing that can change is name

	$('#golem-dashboard-Dashboard').html('<table cellspacing="0" cellpadding="0" class="golem-status">' + list.join('') + '</table>');
};

/** @this {Worker} */
Dashboard.status = function(worker, value) {
	var w = Worker.find(worker);
	if (w) {
		this.set(['data', w.name], value ? value : null);
	}
};

/** @this {Worker} */
Dashboard.menu = function(worker, key) {
	var i, keys;

	if (worker) {
		this._unflush();
		if (!key) {
			keys = [];
			if (isFunction(worker.dashboard)) {
				keys.push('dashboard:' + (worker.get(['option','_hide_dashboard'], false) ? '-' : '+') + 'Show Dashboard');
			}
			if (this.data.hasOwnProperty(worker.name)
			  || this.get(['temp','status',worker.name])
			) {
				i = worker.get(['option','_hide_status'], 2, 'number');
				if (i === true) { i = 2; }
				if (i !== 1 && i !== 2) { i = 0; }
				keys.push('status0:' + (i === 0 ? '=' : '') + 'Hide Status');
				keys.push('status1:' + (i === 1 ? '=' : '') + 'Show Status');
				keys.push('status2:' + (i === 2 ? '=' : '') + 'Active Status');
			}
			return keys;
		} else {
			switch (key) {
			case 'status0':
				worker.set(['option','_hide_status'], 0);
				break;
			case 'status1':
				worker.set(['option','_hide_status'], 1);
				break;
			case 'status2':
				worker.set(['option','_hide_status'], 2);
				break;
			case 'dashboard':
				if (worker.get('option._hide_dashboard')) {
					worker.set(['option','_hide_dashboard']);
				} else {
					worker.set(['option','_hide_dashboard'], true);
				}
				break;
			}
			this._notify('data');
		}
	}
};


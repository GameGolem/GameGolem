/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Dashboard:true, History, Page:true, Queue, Resources,
	Battle, Generals, LevelUp, Player,
	APP, APPID, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, Divisor, length, sum, findInObject, objectIndex, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
	makeImage
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

Dashboard.init = function(old_revision) {
	// BEGIN: Changing this.option.display to a bool
	if (old_revision <= 1110) {
		if (this.option.display === 'block') {
			this.option.display = true;
		} else {
			delete this.option.display;
		}
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
				selected = j
			}
		}
		tabs.push('<li class="' + (hide ? 'ui-helper-hidden' : '') + (Workers[i].settings.advanced ? ' red' : Workers[i].settings.debug ? ' blue' : '') + '"><a href="#golem-dashboard-' + i + '">' + (i===this.name ? '&nbsp;*&nbsp;' : i) + '</a></li>');
		divs.push('<div id="golem-dashboard-' + i + '"></div>');
		this._watch(Workers[i], 'data');
		this._watch(Workers[i], 'option._hide_dashboard');
	}
	$('#golem').append('<div id="golem-dashboard" class="ui-corner-none" style="position:absolute;display:none;"><ul class="ui-corner-none">' + tabs.join('') + '</ul><div>' + divs.join('') + '</div></div>');
	$('<span style="position:absolute;top:0;right:0;" class="ui-icon ui-icon-arrowthick-2-ne-sw"></span>').click(function(event){
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
			Dashboard._update(null, 'run');
		}
	});
	$('#golem-dashboard thead th').live('click', function(event){
		var worker = Workers[Dashboard.option.active];
		worker._unflush();
		worker.dashboard($(this).prevAll().length, $(this).attr('name')==='sort');
	});
	this._resize();
	this._trigger('#'+APPID_+'app_body_container, #'+APPID_+'globalContainer', 'page_change');
	this._watch(this, 'option.active');
	this._watch(this, 'option.expand');
	this._watch(Config, 'option.advanced');
	this._watch(Config, 'option.debug');
	this._update({type:'watch', worker:this.option.active, id:'option.active'}); // Make sure we draw the first one, no id so we don't do excess processing...
};

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
	 || events.findEvent(this, 'watch', 'option.expand')
	 || events.findEvent(this, 'init')) { // Make sure we're always in the right place
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
	if (events.findEvent(this, 'init') && this.option.display) {
		$('#golem-dashboard').show();
	}
	return true;
};

Dashboard.dashboard = function() {
	var i, list = [];
	for (i in this.data) {
		if (!Workers[i]._get(['option','_hide_status'], false)) {
			list.push('<tr><th>' + i + ':</th><td id="golem-status-' + i + '">' + this.data[i] + '</td></tr>');
		}
	}
	list.sort(); // Ok with plain text as first thing that can change is name
	$('#golem-dashboard-Dashboard').html('<table cellspacing="0" cellpadding="0" class="golem-status">' + list.join('') + '</table>');
};

Dashboard.status = function(worker, value) {
	var w = Worker.find(worker);
	if (w) {
		this.set(['data', w.name], value);
	}
};

Dashboard.menu = function(worker, key) {
	if (worker) {
		this._unflush();
		if (!key) {
			var keys = [];
			if (this.data[worker.name]) {
				keys.push('status:' + (worker.get(['option','_hide_status'], false) ? '-' : '+') + 'Show&nbsp;Status');
			}
			if (worker.dashboard) {
				keys.push('dashboard:' + (worker.get(['option','_hide_dashboard'], false) ? '-' : '+') + 'Show&nbsp;Dashboard');
			}
			return keys;
		} else {
			switch (key) {
				case 'status':		worker.set(['option','_hide_status'], worker.option._hide_status ? undefined : true);	break;
				case 'dashboard':	worker.set(['option','_hide_dashboard'], worker.option._hide_dashboard ? undefined : true);	break;
			}
			this._notify('data');
		}
	}
};


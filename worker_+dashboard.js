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
	display:'block',
	active:'Dashboard',
	expand:false,
	width:600,
	height:183
};

Dashboard.init = function() {
	var i, j, list = [], tabs = [], divs = [], active = this.option.active, hide;
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
		if (hide && this.option.active === i) { // Make sure we can see the active worker
			this.set(['option','active'], this.name);
		}
		tabs.push('<h3 name="' + i + '" class="golem-tab-header golem-theme-button" style="' + (hide ? 'display:none;' : '') + (Workers[i].settings.advanced ? 'background:#ffeeee;' : Workers[i].settings.debug ? 'background:#ddddff;' : '') + '">' + (i===this.name ? '&nbsp;*&nbsp;' : i) + '</h3>');
		divs.push('<div id="golem-dashboard-' + i + '" style="display:none;"></div>');
		this._watch(Workers[i], 'data');
		this._watch(Workers[i], 'option._hide_dashboard');
	}
	$('#golem').append('<div id="golem-dashboard" style="position:absolute;display:none;">' + tabs.join('') + '<img id="golem_dashboard_expand" style="position:absolute;top:0;right:0;" src="'+getImage('expand')+'"><div>' + divs.join('') + '</div></div>');
	$('#golem-dashboard').offset($('#'+APPID_+'app_body_container').offset()).css('display', this.option.display); // Make sure we're always in the right place
	$('.golem-tab-header').click(function(){
		if (!$(this).hasClass('golem-tab-header-active')) {
			Dashboard.set(['option','active'], $(this).attr('name'));
		}
	});
	$('#golem_dashboard_expand').click(function(event){
		Dashboard.set(['option','expand'], !Dashboard.get(['option','expand'], false));
		Dashboard._update('trigger','run');
	});
	$('#golem-dashboard .golem-panel > h3').live('click', function(event){
		if ($(this).parent().hasClass('golem-panel-show')) {
			$(this).next().hide('blind',function(){$(this).parent().toggleClass('golem-panel-show');});
		} else {
			$(this).parent().toggleClass('golem-panel-show');
			$(this).next().show('blind');
		}
	});
	$('#golem-dashboard thead th').live('click', function(event){
		var worker = Workers[Dashboard.option.active];
		worker._unflush();
		worker.dashboard($(this).prevAll().length, $(this).attr('name')==='sort');
	});
	Config.addButton({
		id:'golem_icon_dashboard',
		image:'dashboard',
		active:(Dashboard.option.display==='block'),
		title:'Show Dashboard',
		click:function(){
			$(this).toggleClass('golem-button golem-button-active');
			Dashboard.set(['option','display'], Dashboard.option.display==='block' ? 'none' : 'block');
			if (Dashboard.option.display === 'block' && !$('#golem-dashboard-'+Dashboard.option.active).children().length) {
				Dashboard._update('trigger','run');
				Workers[Dashboard.option.active].dashboard();
			}
			$('#golem-dashboard').toggle('drop');
		}
	});
	this._resize();
	this._trigger('#'+APPID_+'app_body_container, #'+APPID_+'globalContainer', 'page_change');
	this._watch(this, 'option.active');
	this._watch(Config, 'option.advanced');
	this._watch(Config, 'option.debug');
	this._update({type:'watch', worker:this.option.active, id:'option.active'}); // Make sure we draw the first one, no id so we don't do excess processing...
};

Dashboard.update = function(event, events) {
	var i, settings, advanced, debug, $el, offset, width, height, margin = 0;
	for (event=events.getEvent(null, 'watch'); event; event=events.getEvent()) {
		if (event.id === 'option.advanced' || event.id === 'option.debug') {
			advanced = Config.get(['option','advanced'], false);
			debug = Config.get(['option','debug'], false);
			for (i in Workers) {
				settings = Workers[i].settings;
				if ((!settings.advanced || advanced) && (!settings.debug || debug)) {
					$('#golem-dashboard > h3[name="'+i+'"]').show();
				} else {
					$('#golem-dashboard > h3[name="'+i+'"]').hide();
					if (this.option.active === i) {
						this.set(['option','active'], this.name);
					}
				}
			}
			return;
		}
		if (event.id === 'option._hide_dashboard') {
			if (event.worker._get(['option','_hide_dashboard'], false)) {
				$('#golem-dashboard > h3[name="'+event.worker.name+'"]').hide();
				if (this.option.active === event.worker.name) {
					this.set(['option','active'], this.name);
				}
			} else {
				$('#golem-dashboard > h3[name="'+event.worker.name+'"]').show();
			}
			return;
		}
		if (event.id === 'option.active') {
			if (!Workers[this.option.active]) {
				this.set('option.active', this.name);
			}
			$('#golem-dashboard > h3').removeClass('golem-tab-header-active');
			$('#golem-dashboard > div > div').hide();
			$('#golem-dashboard > h3[name="'+this.option.active+'"]').addClass('golem-tab-header-active');
			$('#golem-dashboard-'+this.option.active).show();
			event.worker = Workers[this.option.active];
		}
		if (this.option.active === event.worker.name && this.option.display === 'block') {
			try {
				event.worker._unflush();
				event.worker.dashboard();
			}catch(e) {
				log(LOG_ERROR, e.name + ' in ' + event.worker.name + '.dashboard(): ' + e.message);
			}
		} else {
			$('#golem-dashboard-'+event.worker.name).empty();
		}
	}
	if ((i = events.getEvent(null, 'resize'))
	 || events.getEvent(null, 'trigger')
	 || events.getEvent(null, 'init')) { // Make sure we're always in the right place
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
		$('#golem-dashboard')[i ? 'css' : 'animate']({'top':offset.top + margin, 'left':offset.left + margin, 'width':width - (2 * margin), 'height':height - (2 * margin)});
	}
	return true;
};

Dashboard.dashboard = function() {
	var i, list = [];
	for (i in Workers) {
		if (this.data[i] && !Workers[i].get(['option','_hide_status'], false)) {
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


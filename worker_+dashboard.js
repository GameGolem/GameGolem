/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Dashboard:true, History, Page:true, Queue, Resources,
	Battle, Generals, LevelUp, Player,
	APP, APPID, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, Divisor, length, unique, deleteElement, sum, findInArray, findInObject, objectIndex, sortObject, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
	makeImage
*/
/********** Worker.Dashboard **********
* Displays statistics and other useful info
*/
var Dashboard = new Worker('Dashboard');
Dashboard.temp = null;

Dashboard.settings = {
	taint:true
//	keep:true
};

Dashboard.defaults = {
	castle_age:{
		pages:'*'
	}
};

Dashboard.option = {
	display:'block',
	active:'Dashboard'
};

Dashboard.init = function() {
	var i, tabs = [], divs = [], active = this.option.active, hide;
	if (!Workers[this.option.active]) {
		active = this.option.active = this.name;
	}
	for (i in Workers) {
		if (Workers[i].dashboard) {
			if (Workers[i] === this) { // Dashboard always comes first with the * tab
				tabs.unshift('<h3 name="'+i+'" class="golem-tab-header' + (active===i ? ' golem-tab-header-active' : '') + '">&nbsp;*&nbsp;</h3>');
			} else {
				hide = Workers[i]._get(['option','_hide_dashboard'], false) || (Workers[i].settings.advanced && !Config.option.advanced);
				tabs.push('<h3 name="'+i+'" class="golem-tab-header' + (active===i ? ' golem-tab-header-active' : '') + '"' + (hide ? ' style="display:none;"' : '') + '>' + i + '</h3>');
				if (hide && this.option.active === i) {
					this.set(['option','active'], this.name);
				}
			}
			divs.push('<div id="golem-dashboard-'+i+'"'+(active === i ? '' : ' style="display:none;"')+'></div>');
			this._watch(Workers[i], 'data');
			this._watch(Workers[i], 'option._hide_dashboard');
		}
	}
	$('<div id="golem-dashboard" style="top:' + $('#app46755028429_main_bn').offset().top+'px;display:' + this.option.display + ';">' + tabs.join('') + '<img id="golem_dashboard_expand" style="float:right;" src="'+getImage('expand')+'"><div>' + divs.join('') + '</div></div>').prependTo('.UIStandardFrame_Content');
	$('.golem-tab-header').click(function(){
		if (!$(this).hasClass('golem-tab-header-active')) {
			Dashboard.set(['option','active'], $(this).attr('name'));
		}
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
	$('#golem_buttons').append('<img class="golem-button' + (Dashboard.option.display==='block'?'-active':'') + '" id="golem_icon_dashboard" src="' + getImage('dashboard') + '">');
	$('#golem_icon_dashboard').click(function(){
		$(this).toggleClass('golem-button golem-button-active');
		Dashboard.set(['option','display'], Dashboard.option.display==='block' ? 'none' : 'block');
		if (Dashboard.option.display === 'block' && !$('#golem-dashboard-'+Dashboard.option.active).children().length) {
			Workers[Dashboard.option.active].dashboard();
		}
		$('#golem-dashboard').toggle('drop');
		Dashboard._save('option');
	});
	this._watch(this, 'option.active');
	this._watch(Config, 'option.advanced');
	this._revive(1);// update() once every second to update any timers
};

Dashboard.parse = function(change) {
	$('#golem-dashboard').css('top', $('#app46755028429_main_bn').offset().top+'px'); // Make sure we're always in the right place
};

Dashboard.update = function(event) {
	if (event.self && event.type === 'reminder') {
		$('.golem-timer').each(function(i,el){
			var time = $(el).text().parseTimer();
			if (time && time > 0) {
				$(el).text(makeTimer(time - 1));
			} else {
				$(el).removeClass('golem-timer').text('now?');
			}
		});
		$('.golem-time').each(function(i,el){
			var time = parseInt($(el).attr('name'), 10) - Date.now();
			if (time && time > 0) {
				$(el).text(makeTimer(time / 1000));
			} else {
				$(el).removeClass('golem-time').text('now?');
			}
		});
	}
	if (event.type === 'init') {
		event.worker = Workers[this.option.active];
	} else if (event.type !== 'watch') { // we only care about updating the dashboard when something we're *watching* changes (including ourselves)
		return;
	}
	if (event.id === 'option.advanced') {
		for (var i in Workers) {
			if (Workers[i].settings.advanced) {
				if (Config.option.advanced) {
					$('#golem-dashboard > h3[name="'+i+'"]').show();
				} else {
					$('#golem-dashboard > h3[name="'+i+'"]').hide();
					if (this.option.active === i) {
						this.set(['option','active'], this.name);
					}
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
			this.option.active = this.name;
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
			console.log(warn(), e.name + ' in ' + event.worker.name + '.dashboard(): ' + e.message);
		}
	} else {
		$('#golem-dashboard-'+event.worker.name).empty();
	}
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
	this.set(['data', isString(worker) ? worker : worker.name], value);
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


/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page, Queue, Resources, Settings:true,
	Battle, Generals, LevelUp, Player,
	APP, APPID, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, Divisor, length, unique, deleteElement, sum, findInArray, findInObject, objectIndex, sortObject, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
	makeImage
*/
/********** Worker.Settings **********
* Save and Load settings by name - never does anything to CA beyond Page.reload()
*/
var Settings = new Worker('Settings');
Settings._rootpath = false; // Override save path so we don't get limited to per-user
Settings.option = Settings.runtime = null;

Settings.settings = {
	system:true,
	unsortable:true,
	advanced:true,
	no_disable:true
};

Settings.temp = {
	worker:null,
	edit:null,
	paths:['-']
};

Settings.init = function() {
	var i, j;
	for (i in Workers) {
		for (j in Workers[i]._datatypes) {
			this.temp.paths.push(i + '.' + j);
		}
	}
	this.temp.paths.sort();
	if (this.data['- default -']) {
		this.data = this.data['- default -'];
	}
};

Settings.menu = function(worker, key) {
	var i, keys = [];
	if (worker) {
		if (!key) {
			for (i in worker._datatypes) {
				keys.push(i+':' + (worker.name === this.temp.worker && i === this.temp.edit ? '=' : '') + 'Edit&nbsp;"' + worker.name + '.' + i + '"');
			}
			keys.push('---');
			keys.push('backup:Backup&nbsp;Options');
			keys.push('restore:Restore&nbsp;Options');
			return keys;
		} else if (key) {
			if (key === 'backup') {
				this.set(['data', worker.name], $.extend(true, {}, worker.option));
			} else if (key === 'restore') {
				if (confirm("WARNING!!!\n\nAbout to restore '+worker.name+' options.\n\Are you sure?")) {
					this.replace(worker, 'option', $.extend(true, {}, this.data[worker.name]));
				}
			} else if (this.temp.worker === worker.name && this.temp.edit === key) {
				this.temp.worker = this.temp.edit = null;
				this._notify('data');// Force dashboard update
			} else {
				this.temp.worker = worker.name;
				this.temp.edit = key;
				this._notify('data');// Force dashboard update
			}
		}
	} else {
		if (!key) {
			keys.push('backup:Backup&nbsp;Options');
			keys.push('restore:Restore&nbsp;Options');
			return keys;
		} else {
			if (key === 'backup') {
				for (i in Workers) {
					this.set(['data',i], Workers[i].option);
				}
			} else if (key === 'restore') {
				if (confirm("WARNING!!!\n\nAbout to restore options for all workers.\n\Are you sure?")) {
					for (i in Workers) {
						if (i in this.data) {
							this.replace(Workers[i], 'option', $.extend(true, {}, this.data[i]));
						}
					}
				}
			}
		}
	}
};

Settings.replace = function(worker, type, data) {
	if (type === 'data') {
		worker._unflush();
	}
	var i, val, old = worker[type], rx = new RegExp('^'+type+'\.');
	for (i in worker._watching) {
		if (rx.test(i)) {
			worker[type] = old;
			val = worker._get(i, null);
			worker[type] = data;
			if (val !== worker._get(i, null)) {
				worker._notify(i);
			}
		}
	}
	worker[type] = data;
	if (type === 'option') {
		Config.setOptions(worker);
	}
	worker._taint[type] = true;
};

Settings.dashboard = function() {
	var i, path = this.temp.worker+'.'+this.temp.edit, html = '';
	html = '<select id="golem_settings_path">';
	for (i=0; i<this.temp.paths.length; i++) {
		html += '<option value="' + this.temp.paths[i] + '"' + (this.temp.paths[i] === path ? ' selected' : '') + '>' + this.temp.paths[i] + '</option>';
	}
	html += '</select>';
//	html += '<input type="text" value="'+this.temp.worker+'.'+this.temp.edit+'" disabled>';
	html += '<input id="golem_settings_refresh" type="button" value="Refresh">';
	if (Config.option.advanced) {
		html += '<input style="float:right;" id="golem_settings_save" type="button" value="Save">';
	}
	html += '<br>';
	if (this.temp.worker && this.temp.edit) {
		if (this.temp.edit === 'data') {
			Workers[this.temp.worker]._unflush();
		}
		html += '<textarea id="golem_settings_edit" style="width:570px;">' + JSON.stringify(Workers[this.temp.worker][this.temp.edit], null, '   ') + '</textarea>';
	}
	$('#golem-dashboard-Settings').html(html);
	$('#golem_settings_refresh').click(function(){Settings.dashboard();});
	$('#golem_settings_save').click(function(){
		var i, data;
		try {
			data = JSON.parse($('#golem_settings_edit').val())
		} catch(e) {
			alert("ERROR!!!\n\nBadly formed JSON data.\n\nPlease check the data and try again!");
			return;
		}
		if (confirm("WARNING!!!\n\nReplacing internal data can be dangrous, only do this if you know exactly what you are doing.\n\nAre you sure you wish to replace "+Settings.temp.worker+'.'+Settings.temp.edit+"?")) {
			// Need to copy data over and then trigger any notifications
			Settings.replace(Workers[Settings.temp.worker], Settings.temp.edit, data);
		}
	});
	$('#golem_settings_path').change(function(){
		var path = $('#golem_settings_path').val().regex(/([^.]*)\.?(.*)/);
		if (path[0] in Workers) {
			Settings.temp.worker = path[0];
			Settings.temp.edit = path[1];
		} else {
			Settings.temp.worker = Settings.temp.edit = null;
		}
		Settings.dashboard();
	});
	$('#golem_settings_edit').autoSize();
};


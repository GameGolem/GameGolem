/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page, Queue, Resources, Settings:true,
	Battle, Generals, LevelUp, Player,
	APP, APPID, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH, APPNAME,
	makeTimer, Divisor, length, sum, findInObject, objectIndex, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime, makeImage,
	GM_listValues, GM_deleteValue, localStorage
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
			if (Config.option.advanced) {
				for (i in worker._datatypes) {
					keys.push(i+':' + (worker.name === this.temp.worker && i === this.temp.edit ? '=' : '') + 'Edit&nbsp;"' + worker.name + '.' + i + '"');
				}
				keys.push('---');
			}
			keys.push('backup:Backup&nbsp;Options');
			keys.push('restore:Restore&nbsp;Options');
			return keys;
		} else if (key) {
			if (key === 'backup') {
				if (confirm("BACKUP WARNING!!!\n\nAbout to replace '+worker.name+' backup options.\n\nAre you sure?")) {
					this.set(['data', worker.name], $.extend(true, {}, worker.option));
				}
			} else if (key === 'restore') {
				if (confirm("RESTORE WARNING!!!\n\nAbout to restore '+worker.name+' options.\n\nAre you sure?")) {
					worker._replace('option', $.extend(true, {}, this.data[worker.name]));
				}
			} else if (this.temp.worker === worker.name && this.temp.edit === key) {
				this.temp.worker = this.temp.edit = null;
				this._notify('data');// Force dashboard update
			} else {
				this.temp.worker = worker.name;
				this.temp.edit = key;
				this._notify('data');// Force dashboard update
				Dashboard.set(['option','active'], this.name);
			}
		}
	} else {
		if (!key) {
			keys.push('backup:Backup&nbsp;Options');
			keys.push('restore:Restore&nbsp;Options');
			if (Config.option.advanced) {
				keys.push('---');
				keys.push('reset:!Reset&nbsp;Golem');
			}
			return keys;
		} else {
			if (key === 'backup') {
				if (confirm("BACKUP WARNING!!!\n\nAbout to replace backup options for all workers.\n\nAre you sure?")) {
					for (i in Workers) {
						this.set(['data',i], $.extend(true, {}, Workers[i].option));
					}
				}
			} else if (key === 'restore') {
				if (confirm("RESTORE WARNING!!!\n\nAbout to restore options for all workers.\n\nAre you sure?")) {
					for (i in Workers) {
						if (i in this.data) {
							Workers[i]._replace('option', $.extend(true, {}, this.data[i]));
						}
					}
				}
			} else if (key === 'reset') {
				if (confirm("IMPORTANT WARNING!!!\n\nAbout to delete all data for Golem on "+APPNAME+".\n\nAre you sure?")) {
					if (confirm("VERY IMPORTANT WARNING!!!\n\nThis will clear everything, reload the page, and make Golem act like it is the first time it has ever been used on "+APPNAME+".\n\nAre you REALLY sure??")) {
						// Well, they've had two chances...
						if (browser === 'greasemonkey') {
							keys = GM_listValues();
							while ((i = keys.pop())) {
								GM_deleteValue(i);
							}
						} else {
							for (i in localStorage) {
								if (i.indexOf('golem.' + APP + '.') === 0) {
									localStorage.removeItem(i);
								}
							}
						}
						window.location.replace(window.location.href);
					}
				}
			}
		}
	}
};

Settings.dashboard = function() {
	var i, j, total, path = this.temp.worker+'.'+this.temp.edit, html = '', storage = [];
	html = '<select id="golem_settings_path">';
	for (i=0; i<this.temp.paths.length; i++) {
		html += '<option value="' + this.temp.paths[i] + '"' + (this.temp.paths[i] === path ? ' selected' : '') + '>' + this.temp.paths[i] + '</option>';
	}
	html += '</select>';
//	html += '<input type="text" value="'+this.temp.worker+'.'+this.temp.edit+'" disabled>';
	html += '<input id="golem_settings_refresh" type="button" value="Refresh">';
	if (this.temp.worker && this.temp.edit) {
		if (this.temp.edit === 'data') {
			Workers[this.temp.worker]._unflush();
		}
	}
	if (!this.temp.worker) {
		total = 0;
		for (i in Workers) {
			for (j in Workers[i]._storage) {
				if (Workers[i]._storage[j]) {
					total += Workers[i]._storage[j];
					storage.push('<tr><th>' + i + '.' + j + '</th><td style="text-align:right;">' + Workers[i]._storage[j].addCommas() + ' bytes</td></tr>');
				}
			}
		}
		html += ' No worker specified (total ' + total.addCommas() +' bytes)';
		html += '<br><table>' + storage.join('') + '</table>';
	} else if (!this.temp.edit) {
		html += ' No ' + this.temp.worker + ' element specified.';
	} else if (typeof Workers[this.temp.worker][this.temp.edit] === 'undefined') {
		html += ' The element is undefined.';
	} else if (Workers[this.temp.worker][this.temp.edit] === null) {
		html += ' The element is null.';
	} else if (typeof Workers[this.temp.worker][this.temp.edit] !== 'object') {
		html += ' The element is scalar.';
	} else {
		i = length(Workers[this.temp.worker][this.temp.edit]);
		html += ' The element contains ' + i + ' element' + plural(i);
		if (Workers[this.temp.worker]._storage[this.temp.edit]) {
			html += ' (' + (Workers[this.temp.worker]._storage[this.temp.edit]).addCommas() + ' bytes)';
		}
		html += '.';
	}
	if (this.temp.worker && this.temp.edit) {
		if (Config.option.advanced) {
			html += '<input style="float:right;" id="golem_settings_save" type="button" value="Save">';
		}
		html += '<br><textarea id="golem_settings_edit" style="width:99%;">' + JSON.stringify(Workers[this.temp.worker][this.temp.edit], null, '   ') + '</textarea>';
	}
	$('#golem-dashboard-Settings').html(html);
	$('#golem_settings_refresh').click(function(){Settings.dashboard();});
	$('#golem_settings_save').click(function(){
		var data;
		try {
			data = JSON.parse($('#golem_settings_edit').val());
		} catch(e) {
			alert("ERROR!!!\n\nBadly formed JSON data.\n\nPlease check the data and try again!");
			return;
		}
		if (confirm("WARNING!!!\n\nReplacing internal data can be dangrous, only do this if you know exactly what you are doing.\n\nAre you sure you wish to replace "+Settings.temp.worker+'.'+Settings.temp.edit+"?")) {
			// Need to copy data over and then trigger any notifications
			Workers[Settings.temp.worker]._replace(Settings.temp.edit, data);
		}
	});
	$('#golem_settings_path').change(function(){
		var path = $(this).val().regex(/([^.]*)\.?(.*)/);
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


/********** Worker.Settings **********
* Save and Load settings by name - never does anything to CA beyond Page.reload()
*/
var Settings = new Worker('Settings');
Settings._rootpath = false; // Override save path so we don't get limited to per-user

Settings.settings = {
	system:true,
	unsortable:true,
	advanced:true
};

Settings.option = {
	action:'None',
	which:'- default -',
	name:'- default -',
	confirm:false
};

Settings.display = [
	{
		title:'IMPORTANT!',
		label:'This will backup and restore your current options.<br>There is no confirmation dialog!'
	},{
		id:'action',
		label:'Action (<b>Immediate!!</b>)',
		select:['None', 'Load', 'Save', 'Delete']
	},{
		id:'which',
		label:'Which',
		select:'settings'
	},{
		id:'name',
		label:'New Name',
		text:true
	}
];

Settings.oldwhich = null;

Settings.init = function() {
	if (!this.data['- default -']) {
		this.set('- default -');
	}
	Settings.oldwhich = this.option.which;
};

Settings.update = function(type) {
	if (type === 'option') {
		var i, list = [];
		if (this.oldwhich !== this.option.which) {
			$('input:golem(settings,name)').val(this.option.which);
			this.option.name = this.option.which;
			this.oldwhich = this.option.which;
		}
		switch (this.option.action) {
			default:
			case 'None':
				break;
			case 'Load':
				debug(this.name,'Loading ' + this.option.which);
				this.get(this.option.which);
				break;
			case 'Save':
				debug(this.name,'Saving ' + this.option.name);
				this.set(this.option.name);
				this.option.which = this.option.name;
				break;
			case 'Delete':
				if (this.option.which !== '- default -') {
					delete this.data[this.option.which];
				}
				this.option.which = '- default -';
				this.option.name = '- default -';
				break;
		}
		$('select:golem(settings,action)').val('None');
		this.option.action = 'None';
		for (i in this.data) {
			list.push(i);
		}
		Config.set('settings', list.sort());
	}
};

Settings.set = function(what, value) {
	var x = typeof what === 'string' ? what.split('.') : (typeof what === 'object' ? what : []);
	if (x.length && (x[0] === 'option' || x[0] === 'runtime')) {
		return this._set(what, value);
	}
	this._unflush();
	this.data[what] = {};
	for (var i in Workers) {
		if (Workers[i] !== this && Workers[i].option) {
			this.data[what][Workers[i].name] = $.extend(true, {}, Workers[i].option);
		}
	}
};

Settings.get = function(what) {
	var x = typeof what === 'string' ? what.split('.') : (typeof what === 'object' ? what : []);
	if (x.length && (x[0] === 'option' || x[0] === 'runtime')) {
		return this._get(what);
	}
	this._unflush();
	if (this.data[what]) {
		for (var i in Workers) {
			if (Workers[i] !== this && Workers[i].option && this.data[what][Workers[i].name]) {
				Workers[i].option = $.extend(true, {}, this.data[what][Workers[i].name]);
				Workers[i]._save('option');
			}
		}
		Page.reload();
	}
	return;
};


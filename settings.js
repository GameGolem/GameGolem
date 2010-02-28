/********** Settings **********
* Used for storing prefs, prefer to use this over GM_set/getValue
* Should never be called by anyone directly - let the main function do it when needed
*/
var Settings = {
	userID: unsafeWindow.Env.user,
	cache: {},
	SetValue:function(n,v) {
		if (typeof v === 'string') {
			v = '"' + v + '"';
		} else if (typeof v === 'array' || typeof v === 'object') {
			v = v.toSource();
		}
		if (typeof Settings.cache[n] !== 'undefined' && v !== Settings.cache[n]) {
			Settings.cache[n] = v;
			return GM_setValue(Settings.userID + '.' + n, v);
		}
	},
	GetValue:function(n,d) {
		var v = null;
		Settings.cache[n] = GM_getValue(Settings.userID + '.' + n, d);
		if (typeof Settings.cache[n] === 'string') {
			if (Settings.cache[n].charAt(0) === '"') {
				v = Settings.cache[n].replace(/^"|"$/g,'');
			} else if (Settings.cache[n].charAt(0) === '(' || Settings.cache[n].charAt(0) === '[') {
				if (typeof d === 'array' || typeof d === 'object') {
					v = $.extend(true, {}, d, eval(Settings.cache[n]));
				} else {
					v = eval(Settings.cache[n]);
				}
			}
		}
		if (v === null) {
			v = Settings.cache[n];
		}
		return v;
	},
	Save:function() { // type (string - 'data'|'option'), worker (object)
		var i, type = 'data', worker = null;
		for (i=0; i<arguments.length; i++) {
			if (typeof arguments[i] === 'object') {
				worker = arguments[i];
			} else if (arguments[i]==='data' || arguments[i]==='option') {
				type = arguments[i];
			}
		}
		if (worker && worker[type]) {
			Settings.SetValue(type + '.' + worker.name, worker[type]);
		} else {
			for (i=0; i<Workers.length; i++) {
				if (Workers[i][type]) {
					Settings.SetValue(type + '.' + Workers[i].name, Workers[i][type]);
				}
			}
		}
	},
	Load:function() { // type (string - 'data'|'option'), worker (object)
		var i, type = 'data', worker = null;
		for (i=0; i<arguments.length; i++) {
			if (typeof arguments[i] === 'object') {
				worker = arguments[i];
			} else if (arguments[i]==='data' || arguments[i]==='option') {
				type = arguments[i];
			}
		}
		if (worker && worker[type]) {
			worker[type] = Settings.GetValue(type + '.' + worker.name, worker[type]);
		} else {
			for (i=0; i<Workers.length; i++) {
				if (Workers[i][type]) {
					Workers[i][type] = Settings.GetValue(type + '.' + Workers[i].name, Workers[i][type]);
				}
			}
		}
	}
};

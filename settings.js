/********** Settings **********
* Used for storing prefs, prefer to use this over GM_set/getValue
* Should never be called by anyone directly - let the main function do it when needed
*/
var Settings = {
	userID: unsafeWindow.Env.user,
	SetValue:function(n,v) {
		switch(typeof v) {
			case 'boolean':
			case 'number':	return GM_setValue(Settings.userID + '.' + n, v);
			case 'string':	return GM_setValue(Settings.userID + '.' + n, '"' + v + '"');
			case 'array':
			case 'object':	return GM_setValue(Settings.userID + '.' + n, v.toSource());
			default:		GM_debug("Unknown variable type: "+n);
		}
		return null;
	},
	GetValue:function(n,d) {
		v = GM_getValue(Settings.userID + '.' + n, d);
		if (typeof v === 'string') {
			if (v.charAt(0) === '"') {
				v = v.replace(/^"|"$/g,'');
			} else if (v.charAt(0) === '(' || v.charAt(0) === '[') {
				if (typeof d === 'array' || typeof d === 'object') {
					v = $.extend(true, {}, d, eval(v));
				} else {
					v = eval(v);
				}
			}
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

/********** Settings **********
* Used for storing prefs in localStorage
* Should never be called by anyone directly - let the main function do it when needed
*/
if (typeof GM_getValue === 'undefined' && typeof localStorage === 'undefined') {
	if (typeof window.localStorage !== 'undefined') {
		var localStorage = window.localStorage;
	} else if (typeof globalStorage !== 'undefined') {
		var localStorage = globalStorage[location.hostname];
	}
}
var Settings = {
	SetValue:function(n,v) {
		if (typeof v === 'string') {
			v = '"' + v + '"';
		} else if (typeof v === 'array' || typeof v === 'object') {
			v = v.toSource();
		}
		if (typeof GM_getValue === 'undefined') {
			if (typeof localStorage.getItem('golem.' + userID + '.' + APP + '.' + n) === 'undefined' || localStorage.getItem('golem.' + userID + '.' + APP + '.' + n) !== v) {
				localStorage.setItem('golem.' + userID + '.' + APP + '.' + n, v);
				return true;
			}
		} else {
			if (GM_getValue(userID + '.' + n) === 'undefined' || GM_getValue(userID + '.' + n) !== v) {
				GM_setValue(userID + '.' + n, v);
				return true;
			}
		}
		return false;
	},
	GetValue:function(n,d) {
		var v = d;
		if (typeof GM_getValue === 'undefined') {
			v = localStorage.getItem('golem.' + userID + '.' + APP + '.' + n) || v;
		} else {
			v = GM_getValue(userID + '.' + n) || v;
		}
		if (typeof v === 'string') {
			if (v.charAt(0) === '"') {
				v = v.replace(/^"|"$/g,'');
			} else if (v.charAt(0) === '(' || v.charAt(0) === '[') {
				v = eval(v);
				if (typeof d === 'array' || typeof d === 'object') {
					v = $.extend(true, {}, d, v);
				}
			}
		}
		return v;
	},
	Save:function() { // type (string - 'data'|'option'), worker (object)
		var i, type = 'data', worker = null, change = false;
		for (i=0; i<arguments.length; i++) {
			if (typeof arguments[i] === 'object') {
				worker = arguments[i];
			} else if (arguments[i]==='data' || arguments[i]==='option') {
				type = arguments[i];
			}
		}
		if (worker && worker[type]) {
			if (Settings.SetValue(type + '.' + worker.name, worker[type])) {
				change = true;
				if (worker.update && worker.update(type)) {
					Settings.SetValue(type + '.' + worker.name, worker[type]);
				}
			}
		} else {
			for (i=0; i<Workers.length; i++) {
				if (Workers[i][type]) {
					if (Settings.SetValue(type + '.' + Workers[i].name, Workers[i][type])) {
						change = true;
						if (Workers[i].update && Workers[i].update(type)) {
							Settings.SetValue(type + '.' + Workers[i].name, Workers[i][type]);
						}
					}
				}
			}
		}
		return change;
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

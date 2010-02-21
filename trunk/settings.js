/********** Settings **********
* Used for storing prefs, prefer to use this over GM_set/getValue
* Should never be called by anyone directly - let the main function do it when needed
*/
var Settings = {
	SetValue:function(n,v) {
		switch(typeof v) {
			case 'boolean':
			case 'number':	return GM_setValue(n,v);
			case 'string':	return GM_setValue(n,'"' + v + '"');
			case 'array':
			case 'object':	return GM_setValue(n,v.toSource());
			default:		GM_debug("Unknown variable type: "+n);
		}
		return null;
	},
	GetValue:function(n,v) {
		v = GM_getValue(n,v);
		if (typeof v === 'string') {
			if (v.charAt(0) === '"') {
				v = v.replace(/^"|"$/g,'');
			} else if (v.charAt(0) === '(' || v.charAt(0) === '[') {
				v = eval(v);
			}
		}
		return v;
	},
	Save:function(type, worker) {
		if (typeof type === 'object') {
			worker = type; type = 'data';
		}
		if (type!=='data' && type!=='option') {
			type = 'data';
		}
		if (worker && worker[type]) {
			Settings.SetValue(type+'.'+worker.name, worker[type]);
		} else {
			for (var i in Workers) {
				if (Workers[i][type]) {
					Settings.SetValue(type+'.'+Workers[i].name, Workers[i][type]);
				}
			}
		}
	},
	Load:function(type, worker) {
		if (typeof type === 'object') {
			worker = type; type = 'data';
		}
		if (type!=='data' && type!=='option') {
			type = 'data';
		}
		if (worker && worker[type]) {
			worker[type] = Settings.GetValue(type+'.'+worker.name, worker[type]);
		} else {
			for (var i in Workers) {
				if (Workers[i][type]) {
					Workers[i][type] = Settings.GetValue(type+'.'+Workers[i].name, Workers[i][type]);
				}
			}
		}
	}
};

/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page, Queue, Resources,
	Battle, Generals, LevelUp, Player,
	APP, APPID, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, Divisor, length, sum, findInObject, objectIndex, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime
*/
/********** Worker.Upgrade **********
* Spends upgrade points
*/
var Upgrade = new Worker('Upgrade');
Upgrade.data = null;

Upgrade.settings = {
	taint:true
};

Upgrade.defaults['castle_age'] = {
	pages:'keep_stats'
};

Upgrade.option = {
	script:''
};

Upgrade.runtime = {
	next:null
};

Upgrade.temp = {};

Upgrade.display = [
	{
		info:'Use GolemScript to spend your Upgrade Points.'
	},{
		id:'script',
		textarea:true
	},{
		title:'Help',
		group:{
			info:'The stats will be set in the order they are first set (use if() blocks to enforce order if it\'s important - you can easily have a "dump" stat at the end by this method).<br>' +
			'Stats: <pre>stamina\nenergy\nattack\ndefense\nhealth</pre>' +
			'Useful Functions: <pre>value = min(1,2,3);\nvalue = max(1,2,3);\nif (value1 === value2) {\n   do something\n}</pre>'
		}
	},{
		title:'Examples',
		group:[
			{
				title:'Simple Offensive',
				group:{info:'<pre>attack = level * 5;\n' +
					'defense = attack / 2;\n' +
					'stamina = level;\n' +
					'energy = level / 2;\n' +
					'health++;</pre>'
				}
			},{
				title:'Complex with fallback',
				group:{info:'<pre>attack = level * 5;\n' +
					'defense = level * 2.5;\n' +
					'if (health < level) {\n' +
					'   health = level;\n' +
					'} else if (stamina < level) {\n' +
					'   stamina = level;\n' +
					'} else if (energy < level) {\n' +
					'   energy = level;\n' +
					'} else {\n' +
					'   health++;\n' +
					'}</pre>'
				}
			}
		]
	}
];

Upgrade.script = null;

Upgrade.init = function() {
	this._watch(this, 'option.script');
	this._watch(Player, 'data.upgrade');
};

Upgrade.update = function(event, events) {
	if (events.findEvent(this,'init') || events.findEvent(this,'watch','option.script')) {
		this.temp = {};
		this.script = new Script(this.option.script, {
			'map':{
				stamina:'Player.data.maxstamina',
				energy:'Player.data.maxenergy',
				health:'Player.data.maxhealth'
			},
			'default':Player.data,
			'data':this.temp // So we can manually view it easily
		});
		this.script.run();
	}
	var i, j, data = this.script.data, points = Player.get('upgrade'), need = {
		'energy':1,
		'stamina':2,
		'attack':1,
		'defense':1,
		'health':1
	};
	this.set(['runtime','next']);
	for (i in data) {
		if (need[i] && (j = Player.get(['data',i],0)) < data[i]) {
			Dashboard.status(this, 'Next point: ' + Config.makeImage(i) + ' ' + i.ucfirst() + ' (' + j + ' / ' + data[i] + ')');
			this.set(['runtime','next'], i);
			break;
		}
	}
	this.set('option._sleep', !this.runtime.next || points < need[this.runtime.next]);
	return true;
};

Upgrade.work = function(state) {
	var args = ({energy:'energy_max', stamina:'stamina_max', attack:'attack', defense:'defense', health:'health_max'})[this.runtime.next];
	if (state) {
		Page.to('keep_stats', {upgrade:args}, true);
	}
	return QUEUE_RELEASE;
};


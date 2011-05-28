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
Upgrade.temp = null;

Upgrade.settings = {
	taint:true
};

Upgrade.defaults['castle_age'] = {
	pages:'keep_stats'
};

Upgrade.option = {
	script:'',
	cycle:true
};

Upgrade.runtime = {
	next:null
};

Upgrade.display = [
	{
		id:'cycle',
		label:'Update "Next" Every Cycle',
		checkbox:true,
		help:'If this is checked then every time a point is spent it will run the Upgrade Script and recalculate what to do. If not, then it will calculate it once, and only recalculate when there is nothing else to spend. In either case, any changes to the script will force it to recalculate immediately.'
	},{
		title:'Upgrade Script',
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
	this._watch(Player, 'data.maxstamina');
	this._watch(Player, 'data.maxenergy');
	this._watch(Player, 'data.maxhealth');
	this._watch(Player, 'data.attack');
	this._watch(Player, 'data.defense');
};

Upgrade.update = function(event, events) {
	if (events.findEvent(this,'calc') || events.findEvent(this,'watch','option.script') || (this.option.cycle && events.findEvent(Player,'watch'))) {
		this.script = new Script(this.option.script, {
			'map':{
				stamina:'Player.data.maxstamina',
				energy:'Player.data.maxenergy',
				health:'Player.data.maxhealth'
			},
			'default':Player.data,
			'data':'Upgrade.data' // So we can manually view it easily
		});
		this.script.run(true);
	}
	var i, j, points = Player.get('upgrade'), next = null, real = {'stamina':'maxstamina', 'energy':'maxenergy', 'health':'maxhealth'}, need = {
		'energy':1,
		'stamina':2,
		'attack':1,
		'defense':1,
		'health':1
	};
	for (i in this.data) {
		if (need[i] && (j = Player.get(['data',real[i] || i],0)) < this.data[i]) {
			Dashboard.status(this, 'Next point: ' + Config.makeImage(i) + ' ' + i.ucfirst() + ' (' + j + ' / ' + this.data[i] + ')');
			next = i;
			break;
		}
	}
	if (!next) {
		this._update('calc');
	}
	this.set(['runtime','next'], next);
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

Upgrade.menu = function(worker, key) {
	if (worker === this) {
		if (!key) {
			return ['calc:Recalculate&nbsp;Points&nbsp;Now'];
		} else if (key === 'calc') {
			this._update('calc');
		}
	}
};

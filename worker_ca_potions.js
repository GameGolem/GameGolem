/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page, Queue, Resources,
	Battle, Generals, LevelUp, Player,
	APP, APPID, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, Divisor, length, unique, deleteElement, sum, findInArray, findInObject, objectIndex, sortObject, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
	makeImage
*/
/********** Worker.Potions **********
* Automatically drinks potions
*/
var Potions = new Worker('Potions');
Potions.temp = null;

Potions.settings = {
	taint:true
};

Potions.defaults['castle_age'] = {
	pages:'*'
};

Potions.data = {
	Energy:0,
	Stamina:0
};

Potions.option = {
	Energy:35,
	Stamina:35
};

Potions.runtime = {
	type:null,
	amount:0
};

Potions.display = function(){
	var i, opts = [];
	for (i in this.option) {
		if (i.charAt(0) !== '_') {
			opts.push({
				id:i,
				label:'Maximum '+i+' Potions',
				select:{0:0,5:5,10:10,15:15,20:20,25:25,30:30,35:35,39:39,infinite:'&infin;'},
				help:'Will use them when you have to many, if you collect more than 40 they will be lost anyway'
			});
		}
	}
	return opts;
};

Potions.setup = function() {
	this.set(['option','energy']); // Remove old data
	this.set(['option','stamina']); // Remove old data
};

Potions.init = function() {
	$('a.golem-potion-drink').live('click', function(event) {
		if (/Do/.test($(this).text())) {
			Potions.set(['runtime','type'], null);
			Potions.set(['runtime','amount'], 0);
		} else {
			Potions.set(['runtime','type'], $(this).attr('name'));
			Potions.set(['runtime','amount'], 1);
		}
	});

	this._watch(Player, 'data.energy');
	this._watch(Player, 'data.maxenergy');
	this._watch(Player, 'data.stamina');
	this._watch(Player, 'data.maxstamina');
	this._watch(LevelUp, 'runtime.running');
};

Potions.parse = function(change) {
	// No need to parse out Income potions as about to visit the Keep anyway...
	$('.result_body:contains("You have acquired the Energy Potion!")').each(function(i,el){
		Potions.set(['data','Energy'], Potions.data['Energy'] + 1);
	});
	if (Page.page === 'keep_stats' && $('.keep_attribute_section').length) {// Only our own keep
		var potions = {};
		$('.statsTTitle:contains("CONSUMABLES") + div > div').each(function(i,el){
			var info = $(el).text().replace(/\s+/g, ' ').trim().regex(/(\w+) Potion x (\d+)/i);
			if (info && info[0]) {
				potions[info[0]] = info[1];
				// Default only newly discovered potion types to 35
				if (isUndefined(Potions.option[info[0]]) || isNull(Potions.option[info[0]])) {
					Potions.set(['option',info[0]], Potions.option[info[0]] || 35);
				}
			}
		});
		this._replace(['data'], potions);
	}
	return false;
};

Potions.update = function(event) {
	var i, l, txt = [], levelup = LevelUp.get('runtime.running');
	for (i in this.data) {
		if (this.data[i]) {
			l = i.toLowerCase();
			txt.push(makeImage('potion_'+l) + this.data[i] + '/' + this.option[i] + (this.option._disabled ? '' : ' <a class="golem-potion-drink" name="'+i+'" title="Drink one of this potion">' + (this.runtime.type === i ? '[Don\'t Drink]' : '[Drink]') + '</a>'));
		}
		if (!levelup && isNumber(this.option[i]) && this.data[i] > this.option[i] && Player.get(l, 0) + 10 < Player.get('max' + l, 0)) {
			this.set(['runtime','type'], i);
			this.set(['runtime','amount'], 1);
		}
	}
	if (!this.option._disabled && this.runtime.type && this.runtime.amount){
		txt.push('Drinking ' + this.runtime.amount + 'x ' + this.runtime.type + ' potion');
	}
	Dashboard.status(this, txt.join(', '));
	this.set(['option','_sleep'], !this.runtime.type || !this.runtime.amount);
};

Potions.work = function(state) {
	if (state && Page.to('keep_stats')) {
		console.log(warn(), 'Wanting to drink a ' + this.runtime.type + ' potion');
		Page.click('.statUnit:contains("' + this.runtime.type + '") form .imgButton input');
		this.set(['runtime','type'], null);
		this.set(['runtime','amount'], 0);
	}
	return QUEUE_CONTINUE;
};


/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Workers, Worker, Config, Dashboard, Page,
	LevelUp, Player,
	APP, APPID, PREFIX, userID, imagepath,
	isRelease, version, revision, Images, window, browser,
	LOG_ERROR, LOG_WARN, LOG_LOG, LOG_INFO, LOG_DEBUG, log,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	isArray, isFunction, isNull, isNumber, isObject, isString, isUndefined, isWorker
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
	Energy:39,
	Stamina:'infinite'
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
				select:{
					0:0,
					1:1,
					2:2,
					3:3,
					4:4,
					5:5,
					10:10,
					15:15,
					20:20,
					25:25,
					30:30,
					35:35,
					36:36,
					37:37,
					38:38,
					39:39,
					infinite:'infinite'
				},
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

Potions.page = function(page, change) {
	// No need to parse out Income potions as about to visit the Keep anyway...
	var potions = $('.result_body:contains("You have acquired the Energy Potion!")');
	if (potions.length) {
		Potions.set(['data','Energy'], Potions.data['Energy'] + potions.length);
	}
	if (page === 'keep_stats' && $('.keep_attribute_section').length) {// Only our own keep
		potions = {};
		$('.statsTTitle:contains("CONSUMABLES") + div > div').each(function(i,el){
			var info = $(el).text().replace(/\s+/g, ' ').trim().regex(/(\w+) Potion x (\d+)/i);
			if (info && info[0]) {
				potions[info[0]] = info[1];
				// Default only newly discovered potion types to 39
				if (isUndefined(Potions.option[info[0]]) || isNull(Potions.option[info[0]])) {
					Potions.set(['option',info[0]], Potions.option[info[0]] || 39);
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
			txt.push(Config.makeImage('potion-'+l) + this.data[i] + '/' + this.option[i] + (this.option._disabled ? '' : ' <a class="golem-potion-drink" name="'+i+'" title="Drink one of this potion">' + (this.runtime.type === i ? '[Don\'t Drink]' : '[Drink]') + '</a>'));
		}
		if (!levelup && isNumber(this.option[i]) && this.data[i] > this.option[i] && Player.get(l, 0) + 10 < Player.get('max' + l, 0)) {
			this.set(['runtime','type'], i);
			this.set(['runtime','amount'], 1);
		}
	}
	if (!this.option._disabled && this.runtime.type && this.runtime.amount){
		txt.push('Drinking ' + this.runtime.amount + 'x ' + this.runtime.type + ' potion');
	}
	if (txt.length) {
	    Dashboard.status(this, txt.join(', '));
	} else {
	    Dashboard.status(this);
	}
	this.set(['option','_sleep'], !this.runtime.type || !this.runtime.amount);
};

Potions.work = function(state) {
	if (state && this.runtime.type && this.runtime.amount && Page.to('keep_stats')) {
		log(LOG_WARN, 'Wanting to drink a ' + this.runtime.type + ' potion');
		Page.click('.statUnit:contains("' + this.runtime.type + '") form .imgButton input');
		this.set(['runtime','type'], null);
		this.set(['runtime','amount'], 0);
	}
	return QUEUE_CONTINUE;
};


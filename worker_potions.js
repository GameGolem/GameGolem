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

Potions.defaults['castle_age'] = {
	pages:'*'
};

Potions.option = {
	energy:35,
	stamina:35
};

Potions.runtime = {
	drink:false
};

Potions.display = [
	{
		id:'energy',
		label:'Maximum Energy Potions',
		select:{0:0,5:5,10:10,15:15,20:20,25:25,30:30,35:35,39:39,infinite:'&infin;'},
		help:'Will use them when you have to many, if you collect more than 40 they will be lost anyway'
	},{
		id:'stamina',
		label:'Maximum Stamina Potions',
		select:{0:0,5:5,10:10,15:15,20:20,25:25,30:30,35:35,39:39,infinite:'&infin;'},
		help:'Will use them when you have to many, if you collect more than 40 they will be lost anyway'
	}
];

Potions.parse = function(change) {
	// No need to parse out Income potions as about to visit the Keep anyway...
	$('.result_body:contains("You have acquired the Energy Potion!")').each(function(i,el){
		Potions.data['Energy'] = (Potions.data['Energy'] || 0) + 1;
	});
	if (Page.page === 'keep_stats' && $('div.keep_attribute_section').length) {// Only our own keep
		this.data = {}; // Reset potion count completely at the keep
		$('.statUnit', $('.statsTTitle:contains("CONSUMABLES")').next()).each(function(i,el){
			var info = $(el).text().replace(/\s+/g, ' ').trim().regex(/(.*) Potion x ([0-9]+)/i);
			if (info && info[0] && info[1]) {
				Potions.data[info[0]] = info[1];
			}
		});
	}
	return false;
};

Potions.update = function(event) {
	var i, txt = [], levelup = LevelUp.get('runtime.running');
	this.runtime.drink = false;
	if (!this.get(['option', '_disabled'], false)) {
		for(i in this.data) {
			if (this.data[i]) {
				txt.push(makeImage('potion_'+i.toLowerCase()) + this.data[i] + '/' + this.option[i.toLowerCase()] + '<a class="golem-potion-drink" name="'+i+'" title="Drink one of this potion">' + ((this.runtime.type)?'[Don\'t Drink]':'[Drink]') + '</a>');
			}
			if (!levelup && isNumber(this.option[i.toLowerCase()]) && this.data[i] > this.option[i.toLowerCase()] && (Player.get(i.toLowerCase()) || 0) + 10 < (Player.get('max' + i.toLowerCase()) || 0)) {
				this.runtime.drink = true;
			}
		}
	}
        if (this.runtime.type){
            txt.push('Going to drink ' + this.runtime.amount + ' ' + this.runtime.type + ' potion.');
        }
	Dashboard.status(this, txt.join(', '));
        $('a.golem-potion-drink').live('click', function(event){
		var x = $(this).attr('name');
                var act = $(this).text().regex(/(.*)/);
		//console.log(warn(), 'Clicked on ' + x);
                //console.log(warn(), 'Action = ' + act);
                switch (act){
                    case '[Drink]':
                        //console.log(warn(), 'Setting Runtime');
                        Potions.runtime.type = x;
                        Potions.runtime.amount = 1;
                        break;
                    default:
                        //console.log(warn(), 'Clearing Runtime');
                        Potions.runtime.type = Potions.runtime.amount = null;
                }
                
                
	});
};

Potions.work = function(state) {
	if (!this.runtime.drink && !this.runtime.type) {
		return QUEUE_FINISH;
	}
	if (!state || !Page.to('keep_stats')) {
		return QUEUE_CONTINUE;
	}
	for(var i in this.data) {
		if (typeof this.option[i.toLowerCase()] === 'number' && this.data[i] > this.option[i.toLowerCase()]) {
			console.log(warn(), 'Wanting to drink a ' + i + ' potion');
			Page.click('.statUnit:contains("' + i + '") form .imgButton input');
			break;
		}
	}
        if (this.runtime.type && this.runtime.amount){
                console.log(warn(), 'Wanting to drink a ' + this.runtime.type + ' potion');
		Page.click('.statUnit:contains("' + this.runtime.type + '") form .imgButton input');
                this.runtime.type = this.runtime.amount = null;
        }
	return QUEUE_RELEASE;
};


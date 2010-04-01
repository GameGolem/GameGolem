/********** Worker.Potions **********
* Automatically drinks potions
*/
var Potions = new Worker('Potions', 'keep_stats');

Potions.option = {
	energy:35,
	stamina:35,
	drink:false
};

Potions.display = [
	{
		id:'energy',
		label:'Maximum Energy Potions',
		select:[0,5,10,15,20,25,30,35,40],
		help:'Will use them when you have to many, if you collect more than 40 they will be lost anyway'
	},{
		id:'stamina',
		label:'Maximum Stamina Potions',
		select:[0,5,10,15,20,25,30,35,40],
		help:'Will use them when you have to many, if you collect more than 40 they will be lost anyway'
	}
];

Potions.parse = function(change) {
	$('.statsT2:eq(2) .statUnit').each(function(i,el){
		var info = $(el).text().replace(/\s+/g, ' ').trim().regex(/(.*) Potion x ([0-9]+)/i);
		if (info && info[0] && info[1]) {
			Potions.data[info[0]] = info[1];
		}
	});
	return false;
};

Potions.update = function(type) {
	var txt = [];
	this.option.drink = false;
	for(var i in this.data) {
		if (this.data[i]) {
			txt.push(i + ': ' + this.data[i]);
		}
		if (typeof this.option[i.toLowerCase()] === 'number' && this.data[i] > this.option[i.toLowerCase()]) {
			this.option.drink = true;
		}
	}
	Dashboard.status(this, txt.join(', '));
};

Potions.work = function(state) {
	if (!this.option.drink) {
		return false;
	}
	if (!state || !Page.to('keep_stats')) {
		return true;
	}
	for(var i in this.data) {
		if (typeof this.option[i.toLowerCase()] === 'number' && this.data[i] > this.option[i.toLowerCase()]) {
			debug('Potions: Wanting to drink a ' + i + ' potion');
			Page.click('.statUnit:contains("' + i + '") form .imgButton input');
			break;
		}
	}
	return true;
};


/********** Worker.Elite() **********
* Build your elite army
*/
var Elite = new Worker('Elite', 'keep_eliteguard army_viewarmy battle_arena');
Elite.data = {};
Elite.option = {
	fill:true,
	arena:false,
	every:24,
	prefer:[],
	waitfill:0,
	waitarena:0,
	nextfill:null,
	nextarena:null
};
Elite.display = [
	{
		id:'fill',
		label:'Fill Elite Guard',
		checkbox:true
	},{
		id:'arena',
		label:'Fill Arena Guard',
		checkbox:true
	},{
		id:'every',
		label:'Every',
		select:[1, 2, 3, 6, 12, 24],
		after:'hours'
	},{
		advanced:true,
		label:'Add UserIDs to prefer them over random army members.'
	},{
		advanced:true,
		id:'prefer',
		multiple:'number'
	}
];

Elite.init = function() { // Convert old elite guard list
	for(i in this.data) {
		if (typeof this.data[i] === 'number') {
			this.data[i] = {elite:this.data[i]};
		}
	}
};

Elite.parse = function(change) {
	$('span.result_body').each(function(i,el){
		if (Elite.option.nextarena) {
			if ($(el).text().match(/has not joined in the Arena!/i)) {
				Elite.data[Elite.option.nextarena].arena = -1;
			} else if ($(el).text().match(/Arena Guard, and they have joined/i)) {
				Elite.data[Elite.option.nextarena].arena = Date.now() + 86400000; // 24 hours
			} else if ($(el).text().match(/'s Arena Guard is FULL/i)) {
				Elite.data[Elite.option.nextarena].arena = Date.now() + 3600000; // 1 hour
			} else if ($(el).text().match(/YOUR Arena Guard is FULL/i)) {
				Elite.option.waitarena = Date.now();
				debug('Arena guard full, wait '+Elite.option.every+' hours');
			}
		}
		if ($(el).text().match(/Elite Guard, and they have joined/i)) {
			Elite.data[$('img', el).attr('uid')].elite = Date.now() + 86400000; // 24 hours
		} else if ($(el).text().match(/'s Elite Guard is FULL!/i)) {
			Elite.data[$('img', el).attr('uid')].elite = Date.now() + 3600000; // 1 hour
		} else if ($(el).text().match(/YOUR Elite Guard is FULL!/i)) {
			Elite.option.waitfill = Date.now();
			debug('Elite guard full, wait '+Elite.option.every+' hours');
		}
	});
	if (Page.page === 'army_viewarmy') {
		$('img[linked="true"][size="square"]').each(function(i,el){
			Elite.data[$(el).attr('uid')] = Elite.data[$(el).attr('uid')] || {};
			var who = $(el).parent().parent().next();
			Elite.data[$(el).attr('uid')].name = $('a', who).text();
			Elite.data[$(el).attr('uid')].level = $(who).text().regex(/([0-9]+) Commander/i);
		});
	}
	return false;
};

Elite.update = function() {
	this.option.nextfill = this.option.nextarena = 0;
	for(j=0; j<this.option.prefer.length; j++) {
		i = this.option.prefer[j];
		if (!/[^0-9]/g.test(i)) {
			if (!this.option.nextfill && (typeof this.data[i].elite !== 'number' || this.data[i].elite < Date.now())) {
				this.option.nextfill = i;
			}
			if (!this.option.nextarena && (typeof this.data[i].arena !== 'number' || (this.data[i].arena !== -1 && this.data[i].arena < Date.now()))) {
				this.option.nextarena = i;
			}
		}
	}
	for(i in this.data) {
		if (!this.option.nextfill && (typeof this.data[i].elite !== 'number' || this.data[i].elite < Date.now())) {
			this.option.nextfill = i;
		}
		if (!this.option.nextarena && (typeof this.data[i].arena !== 'number' || (this.data[i].arena !== -1 && this.data[i].arena < Date.now()))) {
			this.option.nextarena = i;
		}
	}
};

Elite.work = function(state) {
	var i, j, found = null;
	if ((!this.option.fill || (this.option.waitfill + (this.option.every * 3600000)) > Date.now()) && (!this.option.arena || (this.option.waitarena + (this.option.every * 3600000)) > Date.now())) {
		return false;
	}
//	if (length(Elite.data) < Player.get('army')) {
//	}
	if (!state) {
		return true;
	}
	if (!this.option.nextfill && !this.option.nextarena && !length(this.data) && !Page.to('army_viewarmy')) {
		return true;
	}
	if ((this.option.waitfill + (this.option.every * 3600000)) <= Date.now()) {
		debug('Elite: Add Elite Guard member '+this.option.nextfill);
		if (!Page.to('keep_eliteguard', '?twt=jneg&jneg=true&user=' + this.option.nextfill)) {
			return true;
		}
	}
	if ((this.option.waitarena + (this.option.every * 3600000)) <= Date.now()) {
		debug('Elite: Add Arena Guard member '+this.option.nextarena);
		if (!Page.to('battle_arena', '?user=' + this.option.nextarena + '&lka=' + this.option.nextarena + '&agtw=1&ref=nf')) {
			return true;
		}
	}
	return false;
};


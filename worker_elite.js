/********** Worker.Elite() **********
* Build your elite army
*/
var Elite = new Worker('Elite', 'keep_eliteguard army_viewarmy battle_arena');
Elite.data = {};

Elite.defaults = {
	castle_age:{
		pages:'keep_eliteguard army_viewarmy battle_arena'
	}
};

Elite.option = {
	elite:true,
	arena:false,
	every:12,
	prefer:[],
	armyperpage:25 // Read only, but if they change it and I don't notice...
};

Elite.caap_load = function() {
	this.option.prefer = gm.getListFromText('EliteArmyList');
	this.option.elite = gm.getValue('AutoElite', false);
	this.option.every = 1;
};

Elite.runtime = {
	armylastpage:1,
	armyextra:0,
	waitelite:0,
	nextelite:0,
	waitarena:0,
	nextarena:0
};

Elite.display = [
	{
//		id:'arena',
//		label:'Fill Arena Guard',
//		checkbox:true
//	},{
		id:'elite',
		label:'Fill Elite Guard',
		checkbox:true
	},{
		id:'every',
		label:'Every',
		select:[1, 2, 3, 6, 12, 24],
		after:'hours',
		help:'Although people can leave your Elite Guard after 24 hours, after 12 hours you can re-confirm them'
	},{
		advanced:true,
		label:'Add UserIDs to prefer them over random army members. These <b>must</b> be in your army to be checked.',
		id:'prefer',
		multiple:'userid'
	}
];

Elite.init = function() { // Convert old elite guard list
	for(i in this.data) {
		if (typeof this.data[i] === 'number') {
			this.data[i] = {elite:this.data[i]};
		}
	}
	this.option.arena = false; // ARENA!!!!!!
};

Elite.parse = function(change) {
	$('span.result_body').each(function(i,el){
		var txt = $(el).text();
		if (Elite.runtime.nextarena) {
			if (txt.match(/has not joined in the Arena!/i)) {
				Elite.data[Elite.runtime.nextarena].arena = -1;
			} else if (txt.match(/Arena Guard, and they have joined/i)) {
				Elite.data[Elite.runtime.nextarena].arena = Date.now() + 43200000; // 12 hours
			} else if (txt.match(/'s Arena Guard is FULL/i)) {
				Elite.data[Elite.runtime.nextarena].arena = Date.now() + 1800000; // half hour
			} else if (txt.match(/YOUR Arena Guard is FULL/i)) {
				Elite.runtime.waitarena = Date.now();
				debug(this + 'Arena guard full, wait '+Elite.option.every+' hours');
			}
		}
		if (txt.match(/Elite Guard, and they have joined/i)) {
			Elite.data[$('img', el).attr('uid')].elite = Date.now() + 43200000; // 12 hours
		} else if (txt.match(/'s Elite Guard is FULL!/i)) {
			Elite.data[$('img', el).attr('uid')].elite = Date.now() + 1800000; // half hour
		} else if (txt.match(/YOUR Elite Guard is FULL!/i)) {
			Elite.runtime.waitelite = Date.now();
			debug('Elite guard full, wait '+Elite.option.every+' hours');
		}
	});
	if (Page.page === 'army_viewarmy') {
		var count = 0;
		$('img[linked="true"][size="square"]').each(function(i,el){
			var uid = $(el).attr('uid'), who = $(el).parent().parent().next();
			count++;
			Elite.data[uid] = Elite.data[uid] || {};
			Elite.data[uid].name = $('a', who).text();
			Elite.data[uid].level = $(who).text().regex(/([0-9]+) Commander/i);
		});
		if (count < 25) {
			this.runtime.armyextra = Player.get('armymax') - length(this.data) - 1;
		}
	}
	return false;
};

Elite.update = function() {
	var i, j, tmp = [], now = Date.now(), check;
	this.runtime.nextelite = this.runtime.nextarena = 0;
	// Elite Guard
	if (this.option.elite) {
		for(j=0; j<this.option.prefer.length; j++) {
			i = this.option.prefer[j];
			if (!/[^0-9]/g.test(i) && this.data[i]) {
				if (typeof this.data[i].elite !== 'number' || this.data[i].elite < now) {
					this.runtime.nextelite = i;
					break;
				}
			}
		}
		if (!this.runtime.nextelite) {
			for(i in this.data) {
				if ((typeof this.data[i].elite !== 'number' || this.data[i].elite < now)) {
					this.runtime.nextelite = i;
				}
			}
		}
		check = (this.runtime.waitelite + (this.option.every * 3600000));
		tmp.push('Elite Guard: Check' + (check < now ? 'ing now' : ' in <span class="golem-time" name="' + check + '">' + makeTimer((check - now) / 1000) + '</span>'));
	}
	// Arena Guard
/* - Currently Disabled!
	if (this.option.arena) {
		for(j=0; j<this.option.prefer.length; j++) {
			i = this.option.prefer[j];
			if (!/[^0-9]/g.test(i) && this.data[i]) {
				if (typeof this.data[i].arena !== 'number' || (this.data[i].arena !== -1 && this.data[i].arena < now)) {
					this.runtime.nextarena = i;
					break;
				}
			}
		}
		if (!this.runtime.nextarena) {
			for(i in this.data) {
				if (!this.runtime.nextarena && (typeof this.data[i].arena !== 'number' || (this.data[i].arena !== -1 && this.data[i].arena < Date.now()))) {
					this.runtime.nextarena = i;
				}
			}
		}
		check = (this.runtime.waitarena + (this.option.every * 3600000));
		tmp.push('Arena Guard: Check' + (check < now ? 'ing now' : ' in <span class="golem-time" name="' + check + '">' + makeTimer((check - now) / 1000) + '</span>'));
	}
*/
	Dashboard.status(this, tmp.join(', '));
};

Elite.work = function(state) {
	var i, j, found = null;
	if (Math.ceil((Player.get('armymax') - this.runtime.armyextra - 1) / this.option.armyperpage) > this.runtime.armylastpage) {
		if (state) {
			debug('Filling army list');
			this.runtime.armylastpage = Math.max(this.runtime.armylastpage + 1, Math.ceil((length(this.data) + 1) / this.option.armyperpage));
			Page.to('army_viewarmy', '?page=' + this.runtime.armylastpage);
		}
		return true;
	}
	if ((!this.option.elite || !this.runtime.nextelite || (this.runtime.waitelite + (this.option.every * 3600000)) > Date.now()) && (!this.option.arena || !this.runtime.nextarena || (this.runtime.waitarena + (this.option.every * 3600000)) > Date.now())) {
		return false;
	}
	if (!state) {
		return true;
	}
	if (!this.runtime.nextelite && !this.runtime.nextarena && !length(this.data) && !Page.to('army_viewarmy')) {
		return true;
	}
	if ((this.runtime.waitelite + (this.option.every * 3600000)) <= Date.now()) {
		debug('Add Elite Guard member '+this.runtime.nextelite);
		if (!Page.to('keep_eliteguard', '?twt=jneg&jneg=true&user=' + this.runtime.nextelite)) {
			return true;
		}
	}
	if ((this.runtime.waitarena + (this.option.every * 3600000)) <= Date.now()) {
		debug('Add Arena Guard member '+this.runtime.nextarena);
		if (!Page.to('battle_arena', '?user=' + this.runtime.nextarena + '&lka=' + this.runtime.nextarena + '&agtw=1&ref=nf')) {
			return true;
		}
	}
	return false;
};


/********** Worker.Queue() **********
* Keeps track of the worker queue
*/
var Queue = new Worker('Queue', '*');
Queue.data = null;

var QUEUE_RELEASE = -1;

Queue.settings = {
	system:true,
	unsortable:true,
	keep:true
};

Queue.runtime = {
	reminder:{},
	current:null
};

Queue.option = {
	delay: 5,
	clickdelay: 5,
	queue: ['Page', 'Queue', 'Settings', 'Title', 'Income', 'LevelUp', 'Elite', 'Quest', 'Monster', 'Battle', 'Heal', 'Land', 'Town', 'Bank', 'Alchemy', 'Blessing', 'Gift', 'Upgrade', 'Potions', 'Idle'],
	start_stamina: 0,
	stamina: 0,
	start_energy: 0,
	energy: 0,
	pause: false
};

Queue.caap_load = function() {
	this.option.pause = false;
};

Queue.display = [
	{
		label:'Drag the unlocked panels into the order you wish them run.'
	},{
		id:'delay',
		label:'Delay Between Events',
		text:true,
		after:'secs',
		size:3
	},{
		id:'clickdelay',
		label:'Delay After Mouse Click',
		text:true,
		after:'secs',
		size:3,
		help:'This should be a multiple of Event Delay'
	},{
		id:'start_stamina',
		before:'Save',
		select:'stamina',
		after:'Stamina Before Using'
	},{
		id:'stamina',
		before:'Always Keep',
		select:'stamina',
		after:'Stamina'
	},{
		id:'start_energy',
		before:'Save',
		select:'energy',
		after:'Energy Before Using'
	},{
		id:'energy',
		before:'Always Keep',
		select:'energy',
		after:'Energy'
	}
];

Queue.runfirst = [];
Queue.lastclick = Date.now();	// Last mouse click - don't interrupt the player
Queue.lastrun = Date.now();		// Last time we ran
Queue.burn = {stamina:false, energy:false};
Queue.timer = null;

Queue.lasttimer = 0;
Queue.lastpause = false;

Queue.init = function() {
	if (iscaap()) {
		return false;
	}
	var i, worker, play = 'data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%10%00%00%00%10%08%03%00%00%00(-%0FS%00%00%00%0FPLTE%A7%A7%A7%C8%C8%C8YYY%40%40%40%00%00%00%9F0%E7%C0%00%00%00%05tRNS%FF%FF%FF%FF%00%FB%B6%0ES%00%00%00%2BIDATx%DAb%60A%03%0CT%13%60fbD%13%60%86%0B%C1%05%60BH%02%CC%CC%0CxU%A0%99%81n%0BeN%07%080%00%03%EF%03%C6%E9%D4%E3)%00%00%00%00IEND%AEB%60%82', pause = 'data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%10%00%00%00%10%08%03%00%00%00(-%0FS%00%00%00%06PLTE%40%40%40%00%00%00i%D8%B3%D7%00%00%00%02tRNS%FF%00%E5%B70J%00%00%00%1AIDATx%DAb%60D%03%0CT%13%60%60%80%60%3A%0BP%E6t%80%00%03%00%7B%1E%00%E5E%89X%9D%00%00%00%00IEND%AEB%60%82';
	this.option.queue = unique(this.option.queue);
	for (i in Workers) {// Add any new workers that have a display (ie, sortable)
		if (Workers[i].work && Workers[i].display && !findInArray(this.option.queue, Workers[i].name)) {
			log('Adding '+Workers[i].name+' to Queue');
			if (Workers[i].settings.unsortable) {
				this.option.queue.unshift(Workers[i].name);
			} else {
				this.option.queue.push(Workers[i].name);
			}
		}
	}
	for (i=0; i<this.option.queue.length; i++) {// Then put them in saved order
		worker = WorkerByName(this.option.queue[i]);
		if (worker && worker.id) {
			if (this.runtime.current && worker.name === this.runtime.current) {
				debug('Trigger '+worker.name+' (continue after load)');
				$('#'+worker.id+' > h3').css('font-weight', 'bold');
			}
			$('#golem_config').append($('#'+worker.id));
		}
	}
	$(document).click(function(){Queue.lastclick=Date.now();});

	Queue.lastpause = this.option.pause;
	$btn = $('<img class="golem-button' + (this.option.pause?' red':'') + '" id="golem_pause" src="' + (this.option.pause?play:pause) + '">').click(function() {
		Queue.option.pause ^= true;
		debug('Queue','State: '+((Queue.option.pause)?"paused":"running"));
		$(this).toggleClass('red').attr('src', (Queue.option.pause?play:pause));
		Page.clear();
		Config.updateOptions();
	});
	$('#golem_buttons').prepend($btn); // Make sure it comes first
	// Running the queue every second, options within it give more delay
};

Queue.update = function(type) {
	if (iscaap()) {
		return false;
	}
	if (!this.option.pause && this.option.delay !== this.lasttimer) {
		window.clearInterval(this.timer);
		this.timer = window.setInterval(function(){Queue.run();}, this.option.delay * 1000);
		this.lasttimer = this.option.delay;
	} else if (this.option.pause && this.option.pause !== this.lastpause) {
		window.clearInterval(this.timer);
		this.lasttimer = -1;
	}
	this.lastpause = this.option.pause;
};

Queue.run = function() {
	var i, worker, current, result, now = Date.now(), next = null, release = false;
	if (this.option.pause || now - this.lastclick < this.option.clickdelay * 1000) {
		return;
	}
	if (Page.loading) {
		return; // We want to wait xx seconds after the page has loaded
	}
	WorkerStack.push(this);
//	debug('Start Queue');
	this.burn.stamina = this.burn.energy = 0;
	if (this.option.burn_stamina || Player.get('stamina') >= this.option.start_stamina) {
		this.burn.stamina = Math.max(0, Player.get('stamina') - this.option.stamina);
		this.option.burn_stamina = this.burn.stamina > 0;
	}
	if (this.option.burn_energy || Player.get('energy') >= this.option.start_energy) {
		this.burn.energy = Math.max(0, Player.get('energy') - this.option.energy);
		this.option.burn_energy = this.burn.energy > 0;
	}
	// We don't want to stay at max any longer than we have to because it is wasteful.  Burn a bit to start the countdown timer.
/*	if (Player.get('energy') >= Player.get('maxenergy')){
		this.burn.stamina = 0;	// Focus on burning energy
		debug('At max energy, burning energy first.');
	} else if (Player.get('stamina') >= Player.get('maxstamina')){
		this.burn.energy = 0;	// Focus on burning stamina
		debug('At max stamina, burning stamina first.');
	}
*/	
	for (i=0; i<Workers.length; i++) { // Run any workers that don't have a display, can never get focus!!
		if (Workers[i].work && !Workers[i].display) {
//			debug(Workers[i].name + '.work(false);');
			Workers[i]._unflush();
			Workers[i]._work(false);
		}
	}
	for (i=0; i<this.option.queue.length; i++) {
		worker = WorkerByName(this.option.queue[i]);
		if (!worker || !worker.work || !worker.display) {
			continue;
		}
//		debug(worker.name + '.work(' + (this.runtime.current === worker.name) + ');');
		if (this.runtime.current === worker.name) {
			worker._unflush();
			result = worker._work(true);
			if (result === QUEUE_RELEASE) {
				worker.settings.stateful = true;
				release = true;
			} else if (!result) {
				this.runtime.current = null;
				worker.id && $('#'+worker.id+' > h3').css('font-weight', 'normal');
				debug('End '+worker.name);
			}
		} else {
			result = worker._work(false);
		}
		if (!next && result) {
			next = worker; // the worker who wants to take over
		}
	}
	current = this.runtime.current ? WorkerByName(this.runtime.current) : null;
	if (next !== current && (!current || !current.settings.stateful || next.settings.important || release)) {// Something wants to interrupt...
		if (current) {
			debug('Interrupt ' + current.name + ' with ' + next.name);
			current.id && $('#'+current.id+' > h3').css('font-weight', 'normal');
		} else {
			debug('Trigger ' + next.name);
		}
		this.runtime.current = next.name;
		next.id && $('#'+next.id+' > h3').css('font-weight', 'bold');
	}
//	debug('End Queue');
	for (i=0; i<Workers.length; i++) {
		Workers[i]._flush();
	}
	WorkerStack.pop();
};


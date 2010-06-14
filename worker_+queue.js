/********** Worker.Queue() **********
* Keeps track of the worker queue
*/
var Queue = new Worker('Queue', '*');
Queue.data = null;

// worker.work() return values for stateful - ie, only let other things interrupt when it's "safe"
var QUEUE_FINISH	= 0;// Finished everything, let something else work
var QUEUE_CONTINUE	= 1;// Not finished at all, don't interrupt
var QUEUE_RELEASE	= 2;// Not quite finished, but safe to interrupt 
// worker.work() can also return true/false for "continue"/"finish" - which means they can be interrupted at any time

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
	queue: ['Page', 'Resources', 'Queue', 'Settings', 'Title', 'Income', 'LevelUp', 'Elite', 'Quest', 'Monster', 'Battle', 'Heal', 'Land', 'Town', 'Bank', 'Alchemy', 'Blessing', 'Gift', 'Upgrade', 'Potions', 'Army', 'Idle'],//Must match worker names exactly - even by case
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
		id:'stamina',
		before:'Keep',
		select:'stamina',
		after:'Stamina Always'
	},{
		id:'start_stamina',
		before:'Stock Up',
		select:'stamina',
		after:'Stamina Before Using'
	},{
		id:'energy',
		before:'Keep',
		select:'energy',
		after:'Energy Always'
	},{
		id:'start_energy',
		before:'Stock Up',
		select:'energy',
		after:'Energy Before Using'
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
	if ('Caap' in Workers) {
		return false;
	}
	var i, worker;
	this._watch(Player);
	this.option.queue = unique(this.option.queue);
	for (i in Workers) {// Add any new workers that have a display (ie, sortable)
		if (Workers[i].work && Workers[i].display && !findInArray(this.option.queue, i)) {
			log('Adding '+i+' to Queue');
			if (Workers[i].settings.unsortable) {
				this.option.queue.unshift(i);
			} else {
				this.option.queue.push(i);
			}
		}
	}
	for (i=0; i<this.option.queue.length; i++) {// Then put them in saved order
		worker = Workers[this.option.queue[i]];
		if (worker && worker.display) {
			if (this.runtime.current && worker.name === this.runtime.current) {
				debug('Trigger '+worker.name+' (continue after load)');
				$('#'+worker.id+' > h3').css('font-weight', 'bold');
			}
			$('#golem_config').append($('#'+worker.id));
		}
	}
	$(document).bind('click keypress', function(event){
		if (!event.target || !$(event.target).parents().is('#golem_config_frame,#golem-dashboard')) {
			Queue.lastclick=Date.now();
		}
	});
	Queue.lastpause = this.option.pause;
	$btn = $('<img class="golem-button' + (this.option.pause?' red':' green') + '" id="golem_pause" src="' + (this.option.pause ? Images.play : Images.pause) + '">').click(function() {
		var paused = Queue.set('option.pause', !Queue.get('option.pause', false));
		debug('State: ' + (paused ? "paused" : "running"));
		$(this).toggleClass('red green').attr('src', (paused ? Images.play : Images.pause));
		Page.clear();
		Queue.clearCurrent();
		Config.updateOptions();
	});
	$('#golem_buttons').prepend($btn); // Make sure it comes first
	// Running the queue every second, options within it give more delay
};

Queue.clearCurrent = function() {
	var current = this.get('runtime.current', null)
	if (current) {
		$('#'+Workers[current].id+' > h3').css('font-weight', 'normal');
		this.set('runtime.current', null);// Make sure we deal with changed circumstances
	}
}

Queue.update = function(type) {
	if ('Caap' in Workers) {
		return false;
	}
	var i, $worker;
	if (!this.option.pause && this.option.delay !== this.lasttimer) {
		window.clearInterval(this.timer);
		this.timer = window.setInterval(function(){Queue.run();}, this.option.delay * 1000);
		this.lasttimer = this.option.delay;
	} else if (this.option.pause && this.option.pause !== this.lastpause) {
		window.clearInterval(this.timer);
		this.lasttimer = -1;
	}
	this.lastpause = this.option.pause;
	for (i in Workers) {
		$worker = $('#'+Workers[i].id+' .golem-panel-header');
		if (Queue.enabled(Workers[i])) {
			if ($worker.hasClass('red')) {
				$worker.removeClass('red');
				Workers[i]._update('option', null);
			}
		} else {
			if (!$worker.hasClass('red')) {
				$worker.addClass('red');
				Workers[i]._update('option', null);
			}
		}
	}
	if (this.runtime.current && !this.get(['option', 'enabled', this.runtime.current], true)) {
		this.clearCurrent();
	}
	this.burn.stamina = this.burn.energy = 0;
	if (this.option.burn_stamina || Player.get('stamina') >= this.option.start_stamina) {
		this.burn.stamina = Math.max(0, Player.get('stamina') - this.option.stamina);
		this.option.burn_stamina = this.burn.stamina > 0;
	}
	if (this.option.burn_energy || Player.get('energy') >= this.option.start_energy) {
		this.burn.energy = Math.max(0, Player.get('energy') - this.option.energy);
		this.option.burn_energy = this.burn.energy > 0;
	}
	//debug('Burnable stamina ' + this.burn.stamina +" burnable energy " + this.burn.energy );
};

Queue.run = function() {
	if (isWorker(Window) && !Window.active) {// Disabled tabs don't get to do anything!!!
		return;
	}
	var i, worker, current, result, now = Date.now(), next = null, release = false;
	if (this.option.pause || now - this.lastclick < this.option.clickdelay * 1000) {
		return;
	}
	if (Page.loading) {
		return; // We want to wait xx seconds after the page has loaded
	}
	WorkerStack.push(this);
//	debug('Start Queue');
	
	// We don't want to stay at max any longer than we have to because it is wasteful.  Burn a bit to start the countdown timer.
/*	if (Player.get('energy') >= Player.get('maxenergy')){
		this.burn.stamina = 0;	// Focus on burning energy
		debug('At max energy, burning energy first.');
	} else if (Player.get('stamina') >= Player.get('maxstamina')){
		this.burn.energy = 0;	// Focus on burning stamina
		debug('At max stamina, burning stamina first.');
	}
*/	
	for (i in Workers) { // Run any workers that don't have a display, can never get focus!!
		if (Workers[i].work && !Workers[i].display && this.enabled(Workers[i])) {
//			debug(Workers[i].name + '.work(false);');
			Workers[i]._unflush();
			Workers[i]._work(false);
		}
	}
	for (i=0; i<this.option.queue.length; i++) {
		worker = Workers[this.option.queue[i]];
		if (!worker || !worker.work || !worker.display || !this.enabled(worker)) {
			continue;
		}
//		debug(worker.name + '.work(' + (this.runtime.current === worker.name) + ');');
		if (this.runtime.current === worker.name) {
			worker._unflush();
			result = worker._work(true);
			if (result === QUEUE_RELEASE) {
				release = true;
			} else if (!result) {// false or QUEUE_FINISH
				this.runtime.current = null;
				worker.id && $('#'+worker.id+' > h3').css('font-weight', 'normal');
				debug('End '+worker.name);
			}
		} else {
			result = worker._work(false);
		}
		if (!worker.settings.stateful && typeof result !== 'boolean') {// QUEUE_* are all numbers
			worker.settings.stateful = true;
		}
		if (!next && result) {
			next = worker; // the worker who wants to take over
		}
	}
	current = this.runtime.current ? Workers[this.runtime.current] : null;
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
	for (i in Workers) {
		Workers[i]._flush();
	}
	WorkerStack.pop();
};

Queue.enabled = function(worker) {
	return isWorker(worker) && this.get(['option', 'enabled', worker.name], true);
};


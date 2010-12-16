/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page, Queue:true, Resources, Window,
	Battle, Generals, LevelUp, Player,
	APP, APPID, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser,
	makeTimer, shortNumber, Divisor, length, unique, deleteElement, sum, addCommas, findInArray, findInObject, objectIndex, sortObject, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime, ucfirst, ucwords,
	makeImage
*/
/********** Worker.Queue() **********
* Keeps track of the worker queue
*/
var Queue = new Worker('Queue', '*');
Queue.data = null;

// worker.work() return values for stateful - ie, only let other things interrupt when it's "safe"
var QUEUE_FINISH	= 0;// Finished everything, let something else work
var QUEUE_NO_ACTION	= QUEUE_FINISH;// Finished everything, let something else work
var QUEUE_CONTINUE	= 1;// Not finished at all, don't interrupt
var QUEUE_RELEASE	= 2;// Not quite finished, but safe to interrupt 
var QUEUE_INTERRUPT_OK	= QUEUE_RELEASE;// Not quite finished, but safe to interrupt 
// worker.work() can also return true/false for "continue"/"finish" - which means they can be interrupted at any time

Queue.settings = {
	system:true,
	unsortable:true,
	keep:true,
	no_disable:true
};

// NOTE: ALL THIS CRAP MUST MOVE, Queue is a *SYSTEM* worker, so it must know nothing about CA workers or data
Queue.runtime = {
	quest: false, // Use for name of quest if over-riding quest
	general : false, // If necessary to specify a multiple general for attack
	action: false, // Level up action
	stamina:false, //How much stamina can be used by workers, false if none
	energy:false, //How much energy can be used by workers, false if none
	
	// Force is TRUE when energy/stamina is at max or needed to burn to level up,
	// used to tell workers to do anything necessary to use energy/stamina
	force: {energy:false, 
			stamina:false}, 
	burn: {energy:false, // True when burning energy after stocking up
			stamina:false}, // True when burning stamina after stocking up
	current:null
};

Queue.option = {
	queue: ['Debug', 'Page', 'Queue', 'Resources', 'Settings', 'Title', 'Income', 'LevelUp', 'Elite', 'Quest', 'Monster', 'Battle', 'Arena', 'Heal', 'Land', 'Town', 'Bank', 'Alchemy', 'Blessing', 'Gift', 'Upgrade', 'Potions', 'Army', 'Idle'],//Must match worker names exactly - even by case
	delay: 5,
	clickdelay: 5,
	start_stamina: 0,
	stamina: 0,
	start_energy: 0,
	energy: 0,
	pause: false
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

Queue.lastclick = Date.now();	// Last mouse click - don't interrupt the player

Queue.lasttimer = -1;

Queue.init = function() {
	var i, $btn, worker;
//	this._watch(Player);
	this.option.queue = unique(this.option.queue);
	for (i in Workers) {
		if (Workers[i].work && Workers[i].display) {
			this._watch(Workers[i], 'option._enabled');// Keep an eye out for them going disabled
			if (!findInArray(this.option.queue, i)) {// Add any new workers that have a display (ie, sortable)
				console.log(log(), 'Adding '+i+' to Queue');
				if (Workers[i].settings.unsortable) {
					this.option.queue.unshift(i);
				} else {
					this.option.queue.push(i);
				}
			}
		}
	}
	for (i=0; i<this.option.queue.length; i++) {// Then put them in saved order
		worker = Workers[this.option.queue[i]];
		if (worker && worker.display) {
			if (this.runtime.current && worker.name === this.runtime.current) {
				console.log(warn(), 'Trigger '+worker.name+' (continue after load)');
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
	$btn = $('<img class="golem-button' + (this.option.pause?' red':' green') + '" id="golem_pause" src="' + (this.option.pause ? Images.play : Images.pause) + '">').click(function() {
		var pause = Queue.set('option.pause', !Queue.get('option.pause', false));
		console.log(warn(), 'State: ' + (pause ? "paused" : "running"));
		$(this).toggleClass('red green').attr('src', (pause ? Images.play : Images.pause));
		Page.clear();
		Queue.clearCurrent();
		Config.updateOptions();
	});
	$('#golem_buttons').prepend($btn); // Make sure it comes first
	// Running the queue every second, options within it give more delay
	Title.alias('pause', 'Queue:option.pause:(Pause) ');
	Title.alias('worker', 'Queue:runtime.current::None');
};

Queue.clearCurrent = function() {
//	var current = this.get('runtime.current', null);
//	if (current) {
		$('#golem_config > div > h3').css('font-weight', 'normal');
		this.set('runtime.current', null);// Make sure we deal with changed circumstances
//	}
};

Queue.update = function(event) {
	var i, $worker, worker, current, result, now = Date.now(), next = null, release = false, ensta = ['energy','stamina'], action;
	if (event.type === 'watch') { // A worker getting disabled / enabled
		if (event.id === 'option._enabled') {
			if (event.worker.get(['option', '_enabled'], true)) {
				$('#'+event.worker.id+' .golem-panel-header').removeClass('red');
			} else {
				$('#'+event.worker.id+' .golem-panel-header').addClass('red');
				if (this.runtime.current === i) {
					this.clearCurrent();
				}
			}
		}
	} else if (event.type === 'init' || event.type === 'option') { // options have changed
		if (this.option.pause) {
			this._forget('run');
			this.lasttimer = -1;
		} else if (this.option.delay !== this.lasttimer) {
			this._revive(this.option.delay, 'run');
			this.lasttimer = this.option.delay;
		}
	} else if (event.type === 'reminder' && !Page.loading) { // This is where we call worker.work() for everyone
		if ((isWorker(Window) && !Window.temp.active) // Disabled tabs don't get to do anything!!!
		|| now - this.lastclick < this.option.clickdelay * 1000 // Want to make sure we delay after a click
		|| Page.loading) { // We want to wait xx seconds after the page has loaded
			return;
		}

		this.runtime.stamina = this.runtime.energy = 0;
		this.runtime.levelup = this.runtime.basehit = this.runtime.quest = this.runtime.general = this.runtime.force.stamina = this.runtime.force.energy = this.runtime.big = false;
		for (i=0; i<ensta.length; i++) {
			if (Player.get(ensta[i]) >= Player.get('max'+ensta[i])) {
				console.log(warn(), 'At max ' + ensta[i] + ', burning ' + ensta[i] + ' first.');
				this.runtime[ensta[i]] = Player.get(ensta[i]);
				this.runtime.force[ensta[i]] = true;
				break;
			}
		}
		if (LevelUp.get(['option', '_enabled'], true) && !this.runtime.stamina && !this.runtime.energy 
				 && LevelUp.get('exp_possible') > Player.get('exp_needed')) {
			action = LevelUp.runtime.action = LevelUp.findAction('best', Player.get('energy'), Player.get('stamina'), Player.get('exp_needed'));
			if (action.exp) {
				this.runtime.energy = action.energy;
				this.runtime.stamina = action.stamina;
				this.runtime.levelup = true;
				mode = (action.energy ? 'defend' : 'attack');
				stat = (action.energy ? 'energy' : 'stamina');
				if (action.quest) {
					this.runtime.quest = action.quest;
				}
				this.runtime.basehit = ((action.basehit < Monster.get('option.attack_min')) 
						? action.basehit : false);
				this.runtime.big = action.big;
				if (action.big) {
					this.runtime.general = action.general || (LevelUp.option.general === 'any' 
							? false 
							: LevelUp.option.general === 'Manual' 
							? LevelUp.option.general_choice
							: LevelUp.option.general );
					this.runtime.basehit = action.basehit;
				} else if (action.basehit === action[stat] && !Monster.get('option.best_'+mode) && Monster.get('option.general_' + mode) in Generals.get('runtime.multipliers')) {
					console.log(warn(), 'Overriding manual general that multiplies attack/defense');
					this.runtime.general = (action.stamina ? 'monster_attack' : 'monster_defend');
				}
				Queue.runtime.force.stamina = (action.stamina !== 0);
				Queue.runtime.force.energy = (action.energy !== 0);
				console.log(warn(), 'Leveling up: force burn ' + (this.runtime.stamina ? 'stamina' : 'energy') + ' ' + (this.runtime.stamina || this.runtime.energy));
				//console.log(warn(), 'Level up general ' + this.runtime.general + ' base ' + this.runtime.basehit + ' action[stat] ' + action[stat] + ' best ' + !Monster.get('option.best_'+mode) + ' muly ' + (Monster.get('option.general_' + mode) in Generals.get('runtime.multipliers')));
				LevelUp.runtime.running = true;
			}
		} else {
			LevelUp.runtime.running = false;
		}
		if (!this.runtime.stamina && !this.runtime.energy) {
			if (this.runtime.burn.stamina || Player.get('stamina') >= this.option.start_stamina) {
				this.runtime.stamina = Math.max(0, Player.get('stamina') - this.option.stamina);
				this.runtime.burn.stamina = this.runtime.stamina > 0;
			}
			if (this.runtime.burn.energy || Player.get('energy') >= this.option.start_energy) {
				this.runtime.energy = Math.max(0, Player.get('energy') - this.option.energy);
				this.runtime.burn.energy = this.runtime.energy > 0;
			}
		} else {
			if (this.runtime.force.stamina && Player.get('health') < 13) {
				LevelUp.set('heal_me',true);
			}
		}
		this._push();
		for (i in Workers) { // Run any workers that don't have a display, can never get focus!!
			if (Workers[i].work && !Workers[i].display && Workers[i].get(['option', '_enabled'], true) && !Workers[i].get(['option', '_sleep'], false)) {
				console.log(warn(), Workers[i].name + '.work(false);');
				Workers[i]._unflush();
				Workers[i]._work(false);
			}
		}
		for (i=0; i<this.option.queue.length; i++) {
			worker = Workers[this.option.queue[i]];
			if (!worker || !worker.work || !worker.display || !worker.get(['option', '_enabled'], true) || worker.get(['option', '_sleep'], false)) {
				if (worker && this.runtime.current === worker.name) {
					this.clearCurrent();
				}
				continue;
			}
//			console.log(warn(), worker.name + '.work(' + (this.runtime.current === worker.name) + ');');
			if (this.runtime.current === worker.name) {
				worker._unflush();
				result = worker._work(true);
				if (result === QUEUE_RELEASE) {
					release = true;
				} else if (!result) {// false or QUEUE_FINISH
					this.clearCurrent();
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
			this.clearCurrent();
			console.log(warn(), 'Trigger ' + next.name);
			this.set('runtime.current', next.name);
			if (next.id) {
				$('#'+next.id+' > h3').css('font-weight', 'bold');
			}
			this._notify('runtime.current');
		}
//		console.log(warn(), 'End Queue');
		for (i in Workers) {
			Workers[i]._flush();
		}
		this._pop();
	}
};


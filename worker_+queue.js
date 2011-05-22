/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page, Queue:true, Resources, Window,
	Battle, Generals, LevelUp, Player,
	APP, APPID, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, window, browser,
	makeTimer, Divisor, length, sum, findInObject, objectIndex, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
	makeImage
*/
/********** Worker.Queue() **********
* Keeps track of the worker queue
*/
var Queue = new Worker('Queue');
Queue.data = Queue.runtime = null;

// worker.work() return values for stateful - ie, only let other things interrupt when it's "safe"
var QUEUE_FINISH	= 0;// Finished everything, let something else work
var QUEUE_NO_ACTION	= QUEUE_FINISH;// Finished everything, let something else work
var QUEUE_CONTINUE	= 1;// Not finished at all, don't interrupt
var QUEUE_RELEASE	= 2;// Not quite finished, but safe to interrupt 
var QUEUE_INTERRUPT_OK	= QUEUE_RELEASE;// Not quite finished, but safe to interrupt 
// worker.work() can also return true/false for "continue"/"finish" - which means they can be interrupted at any time

Queue.settings = {
	system:true,
	keep:true,
	taint:true
};

// NOTE: ALL THIS CRAP MUST MOVE, Queue is a *SYSTEM* worker, so it must know nothing about CA workers or data
Queue.temp = {
	current:null
};

Queue.option = {
	queue: ['Global', 'Debug', 'Resources', 'Generals', 'Income', 'LevelUp', 'Elite', 'Quest', 'Monster', 'Battle', 'Guild', 'Festival', 'Heal', 'Land', 'Town', 'Bank', 'Alchemy', 'Blessing', 'Gift', 'Upgrade', 'Potions', 'Army', 'Idle', 'FP'], // Must match worker names exactly - even by case
	delay: 5,
	clickdelay: 5,
	pause: false
};

Queue.temp = {
	sleep:false // If we're currently sleeping, no workers can run...
};

Global.display.push({
	title:'Running',
	group:[
		{
			id:['Queue','option','delay'],
			label:'Delay Between Events',
			number:true,
			after:'secs',
			min:1,
			max:30
		},{
			id:['Queue','option','clickdelay'],
			label:'Delay After Mouse Click',
			number:true,
			after:'secs',
			min:1,
			max:60,
			help:'This should be a multiple of Event Delay'
		}
	]
});

Queue.init = function(old_revision) {
	Config._init(); // Make sure we're running after the display is created...
	var i, $btn, worker;
	// BEGIN: Moving stats into Resources
	if (old_revision <= 1095) {
		if (this.option.energy) {
			Resources.set(['option','reserve','energy'], this.option.energy);
			this.set(['option','energy']);
			this.set(['option','start_energy']);
		}
		if (this.option.stamina) {
			Resources.set(['option','reserve','stamina'], this.option.stamina);
			this.set(['option','stamina']);
			this.set(['option','start_stamina']);
		}
		this.set(['runtime','quest']);
		this.set(['runtime','general']);
		this.set(['runtime','action']);
		this.set(['runtime','stamina']);
		this.set(['runtime','energy']);
		this.set(['runtime','force']);
		this.set(['runtime','burn']);
		this.set(['runtime','big']);
		this.set(['runtime','basehit']);
		this.set(['runtime','levelup']);
	}
	// END
	this.option.queue = this.option.queue.unique();
	for (i in Workers) {
		if (Workers[i].work && Workers[i].display) {
			this._watch(Workers[i], 'option._disabled');// Keep an eye out for them going disabled
			if (!this.option.queue.find(i)) {// Add any new workers that have a display (ie, sortable)
				log('Adding '+i+' to Queue');
				this.option.queue[Workers[i].settings.unsortable ? 'unshift' : 'push'](i);
			}
		}
	}
	for (i=0; i<this.option.queue.length; i++) {// Then put them in saved order
		worker = Workers[this.option.queue[i]];
		if (worker && worker.display) {
			$('#golem_config').append($('#'+worker.id));
		}
	}
	$(document).bind('click keypress', function(event){
		if (!event.target || !$(event.target).parents().is('#golem_config_frame,#golem-dashboard')) {
			Queue.set(['temp','sleep'], true);
			Queue._remind(Queue.get(['option','clickdelay'], 5), 'click');
		}
	});
	Config.addButton({
		id:'golem_pause',
		image:this.option.pause ? 'play' : 'pause',
		className:this.option.pause ? 'red' : 'green',
		prepend:true,
		title:'Pause',
		click:function() {
			var pause = Queue.toggle(['option','pause'], true);
			log(LOG_INFO, 'State: ' + (pause ? 'paused' : 'running'));
			$(this).toggleClass('red green').attr('src', getImage(pause ? 'play' : 'pause'));
			if (!pause) {
				$('#golem_step').hide();
			} else if (Config.get(['option','debug'], false)) {
				$('#golem_step').show();
			}
			Queue.set(['temp','current']);
		}
	});
	Config.addButton({
		id:'golem_step',
		image:'step',
		className:'green',
		after:'golem_pause',
		hide:!this.option.pause || !Config.get(['option','debug'], false),
		click:function() {
			$(this).toggleClass('red green');
			Queue._update({type:'step'}, 'run'); // A single shot
			$(this).toggleClass('red green');
		}
	});
	// Running the queue every second, options within it give more delay
	this._watch('Page', 'temp.loading');
	this._watch('Session', 'temp.active');
	this._watch(this, 'option.pause');
	this._watch(this, 'option.delay');
	this._watch(this, 'temp.current');
	this._watch(this, 'temp.sleep');
	Title.alias('pause', 'Queue:option.pause:(Pause) ');
	Title.alias('worker', 'Queue:temp.current::None');
	this._notify('temp.current');
};

Queue.update = function(event, events) {
	var i, worker, result, next, release = false;
	for (event=events.findEvent(null, 'watch', 'option._disabled'); event; event=events.findEvent()) { // A worker getting disabled / enabled
		worker = event.worker;
		i = worker._get(['option', '_disabled'], false);
		$('#'+worker.id+' > h3').toggleClass(Theme.get('Queue_disabled', 'ui-state-disabled'), i);
		if (i && this.temp.current === worker.name) {
			this.set(['temp','current'], null);
		}
	}
	if (events.getEvent(this, 'watch', 'option.delay')) {
		this._forget('run'); // Re-started later if possible
	}
	if (events.getEvent(this, 'watch', 'temp.current')) {
		$('#golem_config > div > h3').removeClass(Theme.get('Queue_active', 'ui-state-highlight'));
		if (this.temp.current) {
			$('#'+Workers[this.temp.current].id+' > h3').addClass(Theme.get('Queue_active', 'ui-state-highlight'));
		}
	}
	if (this.temp.sleep
	 || events.findEvent(null, 'watch')
	 || events.findEvent(this, 'init')) { // loading a page, pausing, resuming after a mouse-click, or init
		if (this._get(['option','pause']) || Page._get(['temp','loading']) || !Session._get(['temp','active']) || this._timer('click')) {
			this.temp.sleep = true;
		} else {
			this.temp.sleep = false;
		}
	}
	if (this.temp.sleep) {
		while (events.getEvent(this,'reminder')) { // Only delete the run timer if it's been triggered when we're "busy"
			this._forget('run');
		}
	} else if (!this._timer('run')) {
		this._revive(this.option.delay, 'run');
	}
	if ((!this.temp.sleep && events.findEvent(this,'reminder')) || events.findEvent(this,'step')) { // Will fire on the "run" and "click" reminders if we're not sleeping, also on "step"
		for (i in Workers) { // Run any workers that don't have a display, can never get focus!!
			if (Workers[i].work && !Workers[i].display && !Workers[i]._get(['option', '_disabled'], false) && !Workers[i]._get(['option', '_sleep'], false)) {
//				log(LOG_DEBUG, Workers[i].name + '.work(false);');
				Workers[i]._unflush();
				Workers[i]._work(false);
			}
		}
		for (i=0; i<this.option.queue.length; i++) {
			worker = Workers[this.option.queue[i]];
			if (!worker || !worker.work || !worker.display || worker._get(['option', '_disabled'], false) || worker._get(['option', '_sleep'], false)) {
				if (worker && this.temp.current === worker.name) {
					this.set(['temp','current']);
				}
				continue;
			}
//			log(LOG_DEBUG, worker.name + '.work(' + (this.temp.current === worker.name) + ');');
			if (this.temp.current === worker.name) {
				worker._unflush();
				Page.temp.enabled = true;
				result = worker._work(true);
				Page.temp.enabled = false;
				if (result === QUEUE_RELEASE) {
					release = true;
				} else if (!result) {// false or QUEUE_FINISH
					this.set(['temp','current']);
				}
			} else {
				result = worker._work(false);
			}
			if (!worker.settings.stateful && typeof result === 'number') {// QUEUE_* are all numbers
				worker.settings.stateful = true;
			}
			if (!next && result) {
				next = worker; // the worker who wants to take over
			}
		}
		worker = Worker.find(this.temp.current);
		if (next !== worker && (!worker || !worker.settings.stateful || next.settings.important || release)) {// Something wants to interrupt...
			log(LOG_INFO, 'Trigger ' + next.name);
			this.set(['temp','current'], next.name);
		}
//		log(LOG_DEBUG, 'End Queue');
	}
	return true;
};

Queue.menu = function(worker, key) {
	if (worker) {
		if (!key) {
			if (worker.work && !worker.settings.no_disable) {
				return ['enable:' + (worker.get(['option','_disabled'], false) ? '-Disabled' : '+Enabled')];
			}
		} else if (key === 'enable') {
			worker.set(['option','_disabled'], worker.option._disabled ? undefined : true);
		}
	}
};


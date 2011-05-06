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
	keep:true,
	taint:true
};

// NOTE: ALL THIS CRAP MUST MOVE, Queue is a *SYSTEM* worker, so it must know nothing about CA workers or data
Queue.runtime = {
	current:null
};

Queue.option = {
	queue: ['Global', 'Debug', 'Resources', 'Generals', 'Income', 'LevelUp', 'Elite', 'Quest', 'Monster', 'Battle', 'Arena', 'Heal', 'Land', 'Town', 'Bank', 'Alchemy', 'Blessing', 'Gift', 'Upgrade', 'Potions', 'Army', 'Idle'],//Must match worker names exactly - even by case
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
				log(LOG_INFO, 'Trigger '+worker.name+' (continue after load)');
				$('#'+worker.id+' > h3').css('font-weight', 'bold');
			}
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
			var pause = Queue.set(['option','pause'], !Queue.option.pause);
			log(LOG_INFO, 'State: ' + (pause ? "paused" : "running"));
			$(this).toggleClass('red green').attr('src', getImage(pause ? 'play' : 'pause'));
			if (!pause) {
				$('#golem_step').remove();
			} else if (Config.get(['option','debug'], false)) {
				Config.addButton({
					id:'golem_step',
					image:'step',
					className:'green',
					after:'golem_pause',
					click:function() {
						$(this).toggleClass('red green');
						Queue._update({type:'reminder'}, 'run'); // A single shot
						$(this).toggleClass('red green');
					}
				});
			}
			Queue.clearCurrent();
		}
	});
	// Running the queue every second, options within it give more delay
	this._watch(Page, 'temp.loading');
	this._watch(Session, 'temp.active');
	this._watch(this, 'option.pause');
	this._watch(this, 'temp.sleep');
	Title.alias('pause', 'Queue:option.pause:(Pause) ');
	Title.alias('worker', 'Queue:runtime.current::None');
};

Queue.clearCurrent = function() {
//	var current = this.get('runtime.current', null);
//	if (current) {
		$('#golem_config > div > h3').css('font-weight', 'normal');
		this.set(['runtime','current'], null);// Make sure we deal with changed circumstances
//	}
};

Queue.update = function(event, events) {
	var i, $worker, worker, current, result, next = null, release = false, ensta = ['energy','stamina'];
	for (i=0; i<events.length; i++) {
		if (isEvent(events[i], null, 'watch', 'option._disabled')) { // A worker getting disabled / enabled
			worker = events[i].worker;
			if (worker.get(['option', '_disabled'], false)) {
				$('#'+worker.id+' .golem-panel-header').addClass('red');
				if (this.runtime.current === worker.name) {
					this.clearCurrent();
				}
			} else {
				$('#'+worker.id+' .golem-panel-header').removeClass('red');
			}
		}
	}
	if (this.temp.sleep || events.findEvent(null, 'watch') || events.findEvent(null, 'init')) { // loading a page, pausing, resuming after a mouse-click, or init
		if (this.get(['option','pause']) || Page.get(['temp','loading']) || !Session.get(['temp','active']) || this._timer('click')) {
			this.temp.sleep = true;
		} else {
			this.temp.sleep = false;
		}
	}
	if (this.temp.sleep) {
		this._forget('run');
	} else if (!this._timer('run')) {
		this._revive(this.option.delay, 'run');
	}
	if (!this.temp.sleep && events.findEvent(null,'reminder') >= 0) { // Will fire on the "run" and "click" reminders if we're not sleeping
		for (i in Workers) { // Run any workers that don't have a display, can never get focus!!
			if (Workers[i].work && !Workers[i].display && !Workers[i].get(['option', '_disabled'], false) && !Workers[i].get(['option', '_sleep'], false)) {
//				log(LOG_DEBUG, Workers[i].name + '.work(false);');
				Workers[i]._unflush();
				Workers[i]._work(false);
			}
		}
		for (i=0; i<this.option.queue.length; i++) {
			worker = Workers[this.option.queue[i]];
			if (!worker || !worker.work || !worker.display || worker.get(['option', '_disabled'], false) || worker.get(['option', '_sleep'], false)) {
				if (worker && this.runtime.current === worker.name) {
					this.clearCurrent();
				}
				continue;
			}
//			log(LOG_DEBUG, worker.name + '.work(' + (this.runtime.current === worker.name) + ');');
			if (this.runtime.current === worker.name) {
				worker._unflush();
				Page.temp.enabled = true;
				result = worker._work(true);
				Page.temp.enabled = false;
				if (result === QUEUE_RELEASE) {
					release = true;
				} else if (!result) {// false or QUEUE_FINISH
					this.clearCurrent();
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
		current = this.runtime.current ? Workers[this.runtime.current] : null;
		if (next !== current && (!current || !current.settings.stateful || next.settings.important || release)) {// Something wants to interrupt...
			this.clearCurrent();
			log(LOG_INFO, 'Trigger ' + next.name);
			this.set(['runtime','current'], next.name);
			if (next.id) {
				$('#'+next.id+' > h3').css('font-weight', 'bold');
			}
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


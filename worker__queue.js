/********** Worker.Queue() **********
* Keeps track of the worker queue
*/
var Queue = new Worker('Queue', '*', {unsortable:true, option:true, keep:true});
Queue.data = {
	current: null
};
Queue.option = {
	delay: 5,
	clickdelay: 5,
	queue: ["Page", "Queue", "Income", "Quest", "Monster", "Arena", "Battle", "Heal", "Land", "Town", "Bank", "Alchemy", "Blessing", "Gift", "Upgrade", "Elite", "Idle"],
	start_stamina: 0,
	stamina: 0,
	start_energy: 0,
	energy: 0
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

Queue.init = function() {
	var i, worker, found = {}, play = 'data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%10%00%00%00%10%08%03%00%00%00(-%0FS%00%00%00%0FPLTE%A7%A7%A7%C8%C8%C8YYY%40%40%40%00%00%00%9F0%E7%C0%00%00%00%05tRNS%FF%FF%FF%FF%00%FB%B6%0ES%00%00%00%2BIDATx%DAb%60A%03%0CT%13%60fbD%13%60%86%0B%C1%05%60BH%02%CC%CC%0CxU%A0%99%81n%0BeN%07%080%00%03%EF%03%C6%E9%D4%E3)%00%00%00%00IEND%AEB%60%82', pause = 'data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%10%00%00%00%10%08%03%00%00%00(-%0FS%00%00%00%06PLTE%40%40%40%00%00%00i%D8%B3%D7%00%00%00%02tRNS%FF%00%E5%B70J%00%00%00%1AIDATx%DAb%60D%03%0CT%13%60%60%80%60%3A%0BP%E6t%80%00%03%00%7B%1E%00%E5E%89X%9D%00%00%00%00IEND%AEB%60%82';
	for (i=0; i<this.option.queue.length; i++) { // First find what we've already got
		worker = WorkerByName(this.option.queue[i]);
		if (worker) {
			found[worker.name] = true;
		}
	}
	for (i in Workers) { // Second add any new workers that have a display (ie, sortable)
		if (found[Workers[i].name] || !Workers[i].work || !Workers[i].display) {
			continue;
		}
		log('Adding '+Workers[i].name+' to Queue');
		if (Workers[i].settings.unsortable) {
			this.option.queue.unshift(Workers[i].name);
		} else {
			this.option.queue.push(Workers[i].name);
		}
	}
	for (i=0; i<this.option.queue.length; i++) {	// Third put them in saved order
		worker = WorkerByName(this.option.queue[i]);
		if (worker && worker.id) {
			if (this.data.current && worker.name === this.data.current) {
				debug('Queue: Trigger '+worker.name+' (continue after load)');
				$('#'+worker.id+' > h3').css('font-weight', 'bold');
			}
			$('#golem_config').append($('#'+worker.id));
		}
	}
	$(document).click(function(){Queue.lastclick=Date.now();});

	$btn = $('<img class="golem-button' + (this.option.pause?' red':'') + '" id="golem_pause" src="' + (this.option.pause?play:pause) + '">').click(function() {
		Queue.option.pause ^= true;
		debug('State: '+((Queue.option.pause)?"paused":"running"));
		$(this).toggleClass('red').attr('src', (Queue.option.pause?play:pause));
		Page.clear();
		Config.updateOptions();
	});
	$('#golem_buttons').prepend($btn); // Make sure it comes first
	// Running the queue every second, options within it give more delay
};

Queue.update = function(type) {
	if (this.option.delay !== this.lasttimer) {
		window.clearInterval(this.timer);
		this.timer = window.setInterval(function(){Queue.run();}, this.option.delay * 1000);
		this.lasttimer = this.option.delay;
	}
};

Queue.run = function() {
	var i, worker, found = false, now = Date.now(), result;
	if (this.option.pause || now - this.lastrun < this.option.delay * 1000) {
		return;
	}
	this.lastrun = now;
	if (Page.loading) {
		return; // We want to wait xx seconds after the page has loaded
	}
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
	for (i=0; i<Workers.length; i++) { // Run any workers that don't have a display, can never get focus!!
		if (Workers[i].work && !Workers[i].display) {
//			debug(Workers[i].name + '.work(false);');
			Workers[i]._load();
			Workers[i].work(false);
			Workers[i]._flush();
		}
	}
	for (i=0; i<this.option.queue.length; i++) {
		worker = WorkerByName(this.option.queue[i]);
		if (!worker || !worker.work || !worker.display) {
			continue;
		}
//		debug(worker.name + '.work(' + (this.data.current === worker.name) + ');');
		if (this.data.current === worker.name) {
			worker._load();
			result = worker.work(true);
			worker._save(); // Save for everyone, only flush if not active
		} else {
			result = worker.work(false);
		}
		if (!result && this.data.current === worker.name) {
			this.data.current = null;
			if (worker.id) {
				$('#'+worker.id+' > h3').css('font-weight', 'normal');
			}
			debug('Queue: End '+worker.name);
		}
		if (!result || found) { // We will work(false) everything, but only one gets work(true) at a time
			worker._flush();
			continue;
		}
		found = true;
		if (this.data.current === worker.name) {
			continue;
		}
		if (this.data.current) {
			debug('Queue: Interrupt '+this.data.current);
			if (WorkerByName(this.data.current).id) {
				$('#'+WorkerByName(this.data.current).id+' > h3').css('font-weight', 'normal');
			}
		}
		this.data.current = worker.name;
		if (worker.id) {
			$('#'+worker.id+' > h3').css('font-weight', 'bold');
		}
		debug('Queue: Trigger '+worker.name);
	}
//	debug('End Queue');
	this._save();
};

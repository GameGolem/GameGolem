/********** Worker.Queue() **********
* Keeps track of the worker queue
*/
var Queue = new Worker('Queue', '*');
Queue.data = {
	current: null
};
Queue.option = {
	delay: 5,
	clickdelay: 5,
	queue: ["Page", "Queue", "Income", "Quest", "Monster", "Battle", "Heal", "Land", "Town", "Bank", "Alchemy", "Blessing", "Gift", "Upgrade", "Elite", "Idle", "Raid"],
	start_stamina: 0,
	stamina: 0,
	start_energy: 0,
	energy: 0
};
Queue.display = [
	{
		label:'Drag the other panels into the order you wish them run.'
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
		size:3
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
Queue.unsortable = true;
Queue.lastclick = Date.now();	// Last mouse click - don't interrupt the player
Queue.lastrun = Date.now();		// Last time we ran
Queue.burn = {stamina:false, energy:false};
Queue.onload = function() {
	var i, worker, found = {}, play = 'data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%10%00%00%00%10%08%03%00%00%00(-%0FS%00%00%00%0FPLTE%A7%A7%A7%C8%C8%C8YYY%40%40%40%00%00%00%9F0%E7%C0%00%00%00%05tRNS%FF%FF%FF%FF%00%FB%B6%0ES%00%00%00%2BIDATx%DAb%60A%03%0CT%13%60fbD%13%60%86%0B%C1%05%60BH%02%CC%CC%0CxU%A0%99%81n%0BeN%07%080%00%03%EF%03%C6%E9%D4%E3)%00%00%00%00IEND%AEB%60%82', pause = 'data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%10%00%00%00%10%08%03%00%00%00(-%0FS%00%00%00%06PLTE%40%40%40%00%00%00i%D8%B3%D7%00%00%00%02tRNS%FF%00%E5%B70J%00%00%00%1AIDATx%DAb%60D%03%0CT%13%60%60%80%60%3A%0BP%E6t%80%00%03%00%7B%1E%00%E5E%89X%9D%00%00%00%00IEND%AEB%60%82';
	for (i=0; i<Queue.option.queue.length; i++) { // First find what we've already got
		worker = WorkerByName(Queue.option.queue[i]);
		if (worker) {
			found[worker.name] = true;
		}
	}
	for (i in Workers) { // Second add any new workers that have a display (ie, sortable)
		if (found[Workers[i].name] || !Workers[i].work || !Workers[i].display) {
			continue;
		}
		GM_log('Adding '+Workers[i].name+' to Queue');
		if (Workers[i].unsortable) {
			Queue.option.queue.unshift(Workers[i].name);
		} else {
			Queue.option.queue.push(Workers[i].name);
		}
	}
	for (i=0; i<Queue.option.queue.length; i++) {	// Third put them in saved order
		worker = WorkerByName(Queue.option.queue[i]);
		if (worker && worker.priv_id) {
			if (Queue.data.current && worker.name === Queue.data.current) {
				GM_debug('Queue: Trigger '+worker.name+' (continue after load)');
				$('#'+worker.priv_id+' > h3').css('font-weight', 'bold');
			}
			$('#golem_config').append($('#'+worker.priv_id));
		}
	}
	$(document).click(function(){Queue.lastclick=Date.now();});

	$btn = $('<img class="golem-button" id="golem_pause" src="' + (Queue.option.pause?play:pause) + '">').click(function() {
		Queue.option.pause ^= true;
		GM_debug('State: '+((Queue.option.pause)?"paused":"running"));
		$(this).attr('src', (Queue.option.pause?play:pause));
		Page.clear();
		Config.updateOptions();
	});
	$('#golem_buttons').prepend($btn); // Make sure it comes first
};
Queue.run = function() {
	var i, worker, found = false, now = Date.now();
	if (Queue.option.pause || now - Queue.lastclick < Queue.option.clickdelay * 1000 || now - Queue.lastrun < Queue.option.delay * 1000) {
		return;
	}
	Queue.lastrun = now;
	if (Page.loading()) {
		return; // We want to wait xx seconds after the page has loaded
	}
	Queue.burn.stamina = Queue.burn.energy = 0;
	if (Queue.option.burn_stamina || Player.data.stamina >= Queue.option.start_stamina) {
		Queue.burn.stamina = Math.max(0, Player.data.stamina - Queue.option.stamina);
		Queue.option.burn_stamina = Queue.burn.stamina > 0;
	}
	if (Queue.option.burn_energy || Player.data.energy >= Queue.option.start_energy) {
		Queue.burn.energy = Math.max(0, Player.data.energy - Queue.option.energy);
		Queue.option.burn_energy = Queue.burn.energy > 0;
	}
	for (i in Workers) { // Run any workers that don't have a display, can never get focus!!
		if (Workers[i].work && !Workers[i].display) {
			Workers[i].work(false);
		}
	}
	for (i=0; i<Queue.option.queue.length; i++) {
		worker = WorkerByName(Queue.option.queue[i]);
		if (!worker || !worker.work || !worker.display) {
			continue;
		}
		if (!worker.work(Queue.data.current === worker.name)) {
			if (Queue.data.current === worker.name) {
				Queue.data.current = null;
				if (worker.priv_id) {
					$('#'+worker.priv_id+' > h3').css('font-weight', 'normal');
				}
				GM_debug('Queue: End '+worker.name);
			}
			continue;
		}
		if (!found) { // We will work(false) everything, but only one gets work(true) at a time
			found = true;
			if (Queue.data.current === worker.name) {
				continue;
			}
			worker.priv_since = now;
			if (Queue.data.current) {
				GM_debug('Queue: Interrupt '+Queue.data.current);
				if (WorkerByName(Queue.data.current).priv_id) {
					$('#'+WorkerByName(Queue.data.current).priv_id+' > h3').css('font-weight', 'normal');
				}
			}
			Queue.data.current = worker.name;
			if (worker.priv_id) {
				$('#'+worker.priv_id+' > h3').css('font-weight', 'bold');
			}
			GM_debug('Queue: Trigger '+worker.name);
		}
	}
	Settings.Save('option');
	Settings.Save('data');
};

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
	queue: ["Page", "Queue", "Income", "Quest", "Monster", "Battle", "Heal", "Bank", "Alchemy", "Town", "Blessing", "Gift", "Upgrade", "Elite", "Idle", "Raid"],
	stamina: 0,
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
		id:'stamina',
		label:'Keep Stamina',
		select:'stamina'
	},{
		id:'energy',
		label:'Keep Energy',
		select:'energy'
	}
];
Queue.runfirst = [];
Queue.unsortable = true;
Queue.lastclick = Date.now();	// Last mouse click - don't interrupt the player
Queue.lastrun = Date.now();		// Last time we ran
Queue.burn = {stamina:false, energy:false};
Queue.onload = function() {
	var i, worker, found = {};
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
	$btn = $('<button id="golem_pause">pause</button>')
		.button({ text:false, icons:{primary:(Queue.option.pause?'ui-icon-play':'ui-icon-pause')} })
		.click(function() {
			Queue.option.pause ^= true;
			GM_debug('State: '+((Queue.option.pause)?"paused":"running"));
			$(this).button('option', { icons:{primary:(Queue.option.pause?'ui-icon-play':'ui-icon-pause')} });
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
	Queue.burn.stamina	= Math.max(0, Player.data.stamina - Queue.option.stamina);
	Queue.burn.energy	= Math.max(0, Player.data.energy - Queue.option.energy);
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

/********** Worker.Queue() **********
* Keeps track of the worker queue
*/
Queue = new Worker('Queue', '*');
Queue.data = {};
Queue.option = {delay:5, clickdelay:5, queue:["Page", "Queue", "Income", "Quest", "Monster", "Battle", "Heal", "Bank", "Alchemy", "Town", "Blessing", "Gift", "Upgrade", "Idle", "Raid"]};
Queue.runfirst = [];
Queue.unsortable = true;
Queue.lastclick = Date.now();	// Last mouse click - don't interrupt the player
Queue.lastrun = Date.now();		// Last time we ran
Queue.burn = {stamina:false, energy:false};
Queue.onload = function() {
	if (!Queue.option.queue) Queue.option.queue = [];
	if (!Queue.data.current) Queue.data.current = null;
	if (!Queue.option.stamina) Queue.option.stamina = 0;
	if (!Queue.option.energy) Queue.option.energy = 0;
	var found = {};
	for (var i in Queue.option.queue) { // First find what we've already got
		var worker = WorkerByName(Queue.option.queue[i]);
		if (worker) found[worker.name] = true;
	}
	for (var i in Workers) { // Second add any new workers that have a display (ie, sortable)
		if (found[Workers[i].name] || !Workers[i].work || !Workers[i].display) continue;
		GM_log('Adding '+Workers[i].name+' to Queue');
		if (Workers[i].unsortable) Queue.option.queue.unshift(Workers[i].name);
		else Queue.option.queue.push(Workers[i].name);
	}
	for (i in Queue.option.queue) {	// Third put them in saved order
		var worker = WorkerByName(Queue.option.queue[i]);
		if (worker && worker.priv_id) {
			if (Queue.data.current && worker.name == Queue.data.current) {
				GM_debug('Queue: Trigger '+worker.name+' (continue after load)');
				$('#'+worker.priv_id+' > h3 > a').css('font-weight', 'bold');
			}
			$('#golem_config').append($('#'+worker.priv_id));
		}
	}
	$(document).click(function(){Queue.lastclick=Date.now();});
}
Queue.display = function() {
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
	var panel = new Panel(this.name);
	panel.info('Drag the other panels into the order you wish them run.');
	panel.text('delay', 'Delay Between Events', {after:'secs', size:3});
	panel.text('clickdelay', 'Delay After Mouse Click', {after:'secs', size:3});
	panel.select('stamina', 'Keep Stamina:', Player.data.maxstamina);
	panel.select('energy', 'Keep Energy:', Player.data.maxenergy);
	return panel.show;
}
Queue.run = function() {
	var i, worker, found = false, now = Date.now();
	if (Queue.option.pause || now - Queue.lastclick < Queue.option.clickdelay * 1000 || now - Queue.lastrun < Queue.option.delay * 1000) {
		return;
	}
	Queue.lastrun = now;
	if (Page.loading()) return; // We want to wait xx seconds after the page has loaded
	Queue.burn.stamina	= Math.max(0, Player.data.stamina - Queue.option.stamina);
	Queue.burn.energy	= Math.max(0, Player.data.energy - Queue.option.energy);
	for (i in Workers) { // Run any workers that don't have a display, can never get focus!!
		if (Workers[i].work && !Workers[i].display) Workers[i].work(false);
	}
	for (i in Queue.option.queue) {
		worker = WorkerByName(Queue.option.queue[i]);
		if (!worker || !worker.work || !worker.display) continue;
		if (!worker.work(Queue.data.current == worker.name)) {
			Settings.Save(worker);
			if (Queue.data.current == worker.name) {
				Queue.data.current = null;
				$('#'+worker.priv_id+' > h3 > a').css('font-weight', 'normal');
				GM_debug('Queue: End '+worker.name);
			}
			continue;
		}
		Settings.Save(worker);
		if (!found) { // We will work(false) everything, but only one gets work(true) at a time
			found = true;
			if (Queue.data.current == worker.name) continue;
			worker.priv_since = now;
			if (Queue.data.current) {
				GM_debug('Queue: Interrupt '+Queue.data.current);
				$('#'+WorkerByName(Queue.data.current).priv_id+' > h3 > a').css('font-weight', 'normal');
			}
			Queue.data.current = worker.name;
			$('#'+worker.priv_id+' > h3 > a').css('font-weight', 'bold');
			GM_debug('Queue: Trigger '+worker.name);
		}
	}
	Settings.Save(Queue);
}

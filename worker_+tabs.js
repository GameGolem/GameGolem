/********** Worker.Tabs **********
* Deals with multiple tabs being open at the same time...
*
* http://code.google.com/p/game-golem/issues/detail?id=86
*
* Use Tabs.data to store information - then it's auto-flushed when not used...
*/
var Tabs = new Worker('Tabs');
Tabs.runtime = Tabs.option = null;
Tabs._rootpath = false; // Override save path so we don't get limited to per-user

Tabs.data = {
	active:false,
	list:{}
};

Tabs.settings = {
	system:true
};

Tabs.active = false; // Are we the active tab (able to do anything)?
Tabs.tab_id = 'golem_' + Date.now();

/***** Tabs.init() *****
1. Check if we're the only copy active or if the active copy hasn't updated in the last 3 seconds
2. Add ourselves to the list of tabs using Tabs.tab_id
*/
Tabs.init = function() {
	var i, now = Date.now();
	this.data['list'] = this.data['list'] || {};
	this.data['list'][this.tab_id] = now;
//	log('Adding tab "' + this.tab_id + '"');
	if (!this.data['active'] || this.data['active'] < now - 3000) {
		this.active = true;
		this.data['active'] = now;
		$('.golem-title').after('<div id="golem-multiple" class="golem-button green" style="display:none;">Enabled</div>');
	} else {
		$('.golem-title').after('<div id="golem-multiple" class="golem-button red"><b>Disabled</b></div>');
		$('#golem-multiple').nextAll().hide();
	}
	// Can't put as jQuery bind() for some reason...
	(isGreasemonkey ? window.wrappedJSObject : window).onbeforeunload = function(event){
//		log('Removing tab "' + Tabs.tab_id + '"');
		Tabs._unflush();
		if (Tabs.active) {
			Tabs.data['active'] = null;
		}
		delete Tabs.data['list'][Tabs.tab_id];
		Tabs._save('data');
	};
	$('#golem-multiple').click(function(event){
		Tabs._unflush();
		if (Tabs.active) {
			$(this).html('<b>Disabled</b>').toggleClass('red green').nextAll().hide();
			Tabs.data['active'] = null;
			Tabs.active = false;
			Tabs._save('data');
		} else if (!Tabs.data['active'] || Tabs.data['active'] < Date.now() - 3000) { // Make enabled
			$(this).html('Enabled').toggleClass('red green')
			$('#golem_buttons').show();
			Config.get('option.display') === 'block' && $('#golem_config').parent().show();
			Tabs.data['active'] = Date.now();
			Tabs.active = true;
			Tabs._save('data');
		}
		Tabs._flush();
	});
	this._revive(1); // Call us *every* 1 second - not ideal with loads of tabs, but good enough for half a dozen or more
};

/***** Tabs.update() *****
*/
Tabs.update = function(type,worker) {
	if (type !== 'reminder') {
		return;
	}
	this.data = this.data || {};
	var i, now = Date.now();
	if (this.active) {
		this.data['active'] = now;
	}
	this.data['list'] = this.data['list'] || {};
	this.data['list'][this.tab_id] = now;
	for(i in this.data['list']) {
		if (this.data['list'][i] < (now - 3000)) {
			delete this.data['list'][i];
		}
	}
	i = length(this.data['list']);
	if (i === 1 && this.active) {
		$('#golem-multiple').hide();
	} else if (i > 1) {
		$('#golem-multiple').show();
	}
	this._flush();// We really don't want to store data any longer than we really have to!
};


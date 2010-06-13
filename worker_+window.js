/********** Worker.Window **********
* Deals with multiple Windows being open at the same time...
*
* http://code.google.com/p/game-golem/issues/detail?id=86
*
* Use window.name to store global information - so it's reloaded even if the page changes...
*/
var Window = new Worker('Window');
Window.runtime = Window.option = null;
Window._rootpath = false; // Override save path so we don't get limited to per-user

Window.settings = {
	system:true
};

Window.data = {
	active:false,
	list:{}
};

Window.global = {
	'_magic':'golem-magic-key',
	'_id':'#' + Date.now()
};

Window.active = false; // Are we the active tab (able to do anything)?
Window.timeout = 15000; // How long to give a tab to update itself before deleting it (15 seconds)
Window.warning = null;// If clicking the Disabled button when not able to go Enabled

/***** Window.init() *****
1. First try to load window.name information
1a. Parse JSON data and check #1 it's an object, #2 it's got the right magic key (compare to our global magic)
1b. Replace our current global data (including id) with the new one if it's real
2. Save our global data to window.name (maybe just writing back what we just loaded)
3. Add ourselves to this.data.list with the current time
4. If no active worker (in the last 2 seconds) then make ourselves active
4a. Set this.active, this.data.active, and immediately call this._save()
4b/5. Add the "Enabled/Disabled" button, hidden if necessary (hiding other elements if we're disabled)
6. Add a click handler for the Enable/Disable button
6a. Button only works when either active, or no active at all.
6b. If active, make inactive, update this.active, this.data.active and hide other elements
6c. If inactive , make active, update this.active, this.data.active and show other elements (if necessary)
7. Add a repeating reminder for every 1 second
*/
Window.init = function() {
	var now = Date.now(), data;
	try {
		data = JSON.parse((isGreasemonkey ? window.wrappedJSObject : window).name);
		if (typeof data === 'object' && typeof data['_magic'] !== 'undefined' && data['_magic'] === this.global['_magic']) {
			this.global = data;
		}
	} catch(e){};
//	debug('Adding tab "' + this.global['_id'] + '"');
	(isGreasemonkey ? window.wrappedJSObject : window).name = JSON.stringify(this.global);
	this.data['list'] = this.data['list'] || {};
	this.data['list'][this.global['_id']] = now;
	if (!this.data['active'] || typeof this.data['list'][this.data['active']] === 'undefined' || this.data['list'][this.data['active']] < now - this.timeout || this.data['active'] === this.global['_id']) {
		this.active = true;
		this.data['active'] = this.global['_id'];
		this._save('data');// Force it to save immediately - reduce the length of time it's waiting
		$('.golem-title').after('<div id="golem_window" class="golem-button green" style="display:none;">Enabled</div>');
	} else {
		$('.golem-title').after('<div id="golem_window" class="golem-info golem-button red"><b>Disabled</b></div>');
		$('#golem_window').nextAll().hide();
	}
	$('#golem_window').click(function(event){
		Window._unflush();
		if (Window.active) {
			$(this).html('<b>Disabled</b>').toggleClass('red green').nextAll().hide();
			Window.data['active'] = null;
			Window.active = false;
		} else if (!Window.data['active'] || typeof Window.data['list'][Window.data['active']] === 'undefined' || Window.data['list'][Window.data['active']] < Date.now() - Window.timeout) {
			$(this).html('Enabled').toggleClass('red green')
			$('#golem_buttons').show();
			Config.get('option.display') === 'block' && $('#golem_config').parent().show();
			Queue.clearCurrent();// Make sure we deal with changed circumstances
			Window.data['active'] = Window.global['_id'];
			Window.active = true;
		} else {// Not able to go active
			$(this).html('<b>Disabled</b><br><span>Another instance running!</span>');
			!Window.warning && (function(){
				if ($('#golem_window span').length) {
					if ($('#golem_window span').css('color').indexOf('255') === -1) {
						$('#golem_window span').animate({'color':'red'},200,arguments.callee);
					} else {
						$('#golem_window span').animate({'color':'black'},200,arguments.callee);
					}
				}
			})();
			window.clearTimeout(Window.warning);
			Window.warning = window.setTimeout(function(){if(!Window.active){$('#golem_window').html('<b>Disabled</b>');}Window.warning=null;}, 3000);
		}
		Window._flush();
	});
	this._revive(1); // Call us *every* 1 second - not ideal with loads of Window, but good enough for half a dozen or more
};

/***** Window.update() *****
1. We don't care about any data, only about the regular reminder we've set, so return if not the reminder
2. Update the data[id] to now() so we're not removed
3. If no other open instances then make ourselves active (if not already) and remove the "Enabled/Disabled" button
4. If there are other open instances then show the "Enabled/Disabled" button
*/
Window.update = function(type,worker) {
	if (type !== 'reminder') {
		return;
	}
	var i, now = Date.now();
	this.data = this.data || {};
	this.data['list'] = this.data['list'] || {};
	this.data['list'][this.global['_id']] = now;
	for(i in this.data['list']) {
		if (this.data['list'][i] < (now - this.timeout)) {
			delete this.data['list'][i];
		}
	}
	i = length(this.data['list']);
	if (i === 1) {
		if (!this.active) {
			$('#golem_window').css('color','black').html('Enabled').toggleClass('red green')
			$('#golem_buttons').show();
			Config.get('option.display') === 'block' && $('#golem_config').parent().show();
			Queue.set('runtime.current', null);// Make sure we deal with changed circumstances
			this.data['active'] = this.global['_id'];
			this.active = true;
		}
		$('#golem_window').hide();
	} else if (i > 1) {
		$('#golem_window').show();
	}
	this._flush();// We really don't want to store data any longer than we really have to!
};

/***** Window.get() *****
1. Load data as Worker._get() but only for global window data
*/
Window.get = function(what, def) { // 'path.to.data'
	var x = typeof what === 'string' ? what.split('.') : (typeof what === 'object' ? what : []), data = this.global;
	try {
		return (function(a,b,d){
			if (b.length) {
				var c = b.shift();
				return arguments.callee(a[c],b,d);
			} else {
				return typeof a !== 'undefined' ? a : d;
			}
		})(data,x,def);
	} catch(e) {
		if (typeof def === 'undefined') {
			debug(e.name + ' in ' + this.name + '.get('+what.toString()+'): ' + e.message);
		}
	}
	return typeof def !== 'undefined' ? def : null;// Don't want to return "undefined" at this time...
};

/***** Window.set() *****
1. Save data as Worker._get() but only for global window data
*/
Window.set = function(what, value) {
	var x = typeof what === 'string' ? what.split('.') : (typeof what === 'object' ? what : []), data = this.global;
	if (!x.length) {
		return;
	}
	try {
		(function(a,b){
			var c = b.shift();
			if (b.length) {
				if (typeof a[c] !== 'object') {
					a[c] = {};
				}
				arguments.callee(a[c], b);
				if (!length(a[c])) {// Can clear out empty trees completely...
					delete a[c];
				}
			} else {
				if (typeof value !== 'undefined') {
					a[c] = value;
				} else {
					delete a[c];
				}
			}
		})(data,x);
		(isGreasemonkey ? window.wrappedJSObject : window).name = JSON.stringify(this.global);// Save immediately
	} catch(e) {
		debug(e.name + ' in ' + this.name + '.set('+what+', '+value+'): ' + e.message);
	}
	return;
};


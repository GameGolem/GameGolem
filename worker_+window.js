/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page, Queue, Resources,
	Battle, Generals, LevelUp, Player,
	APP, APPID, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, shortNumber, Divisor, length, unique, deleteElement, sum, addCommas, findInArray, findInObject, objectIndex, sortObject, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime, ucfirst, ucwords,
	makeImage
*/
/********** Worker.Window **********
* Deals with multiple Windows being open at the same time...
*
* http://code.google.com/p/game-golem/issues/detail?id=86
*
* NOTE: Cannot share "global" information across page reloads any more
*/
var Window = new Worker('Window');
Window.runtime = null; // Don't save anything except global stuff
Window._rootpath = false; // Override save path so we don't get limited to per-user

Window.settings = {
	system:true
};

Window.data = { // Shared between all windows
	current:null, // Currently active window
	list:{} // List of available windows
};

Window.temp = {
	active:false // Are we the active tab (able to do anything)?
};

Window.global = {
	'_magic':'golem-magic-key',
	'_id':'#' + Date.now()
};

Window.timeout = 15000; // How long to give a tab to update itself before deleting it (15 seconds)
Window.warning = null;// If clicking the Disabled button when not able to go Enabled

/***** Window.init() *****
1. First try to load window.name information
1a. Parse JSON data and check #1 it's an object, #2 it's got the right magic key (compare to our global magic)
1b. Replace our current global data (including id) with the new one if it's real
2. Save our global data to window.name (maybe just writing back what we just loaded)
3. Add ourselves to this.data.list with the current time
4. If no active worker (in the last 2 seconds) then make ourselves active
4a. Set this.temp.active, this.data.current, and immediately call this._save()
4b/5. Add the "Enabled/Disabled" button, hidden if necessary (hiding other elements if we're disabled)
6. Add a click handler for the Enable/Disable button
6a. Button only works when either active, or no active at all.
6b. If active, make inactive, update this.temp.active, this.data.current and hide other elements
6c. If inactive , make active, update this.temp.active, this.data.current and show other elements (if necessary)
7. Add a repeating reminder for every 1 second
*/
Window.init = function() {
	var now = Date.now(), data;
	try {
		data = JSON.parse((window.wrappedJSObject ? window.wrappedJSObject : window).name);
		if (typeof data === 'object' && typeof data['_magic'] !== 'undefined' && data['_magic'] === this.global['_magic']) {
			this.global = data;
		}
	} catch(e){}
//	debug('Adding tab "' + this.global._id + '"');
	(window.wrappedJSObject ? window.wrappedJSObject : window).name = JSON.stringify(this.global);
	this.data.list = this.data.list || {};
	this.data.list[this.global._id] = now;
	if (!this.data.current || typeof this.data.list[this.data.current] === 'undefined' || this.data.list[this.data.current] < now - this.timeout || this.data.current === this.global._id) {
		this._set('temp.active', true);
		this.data.current = this.global._id;
		this._save('data');// Force it to save immediately - reduce the length of time it's waiting
		$('.golem-title').after('<div id="golem_window" class="golem-info golem-button green" style="display:none;">Enabled</div>');
	} else {
		$('.golem-title').after('<div id="golem_window" class="golem-info golem-button red"><b>Disabled</b></div>');
		$('#golem_window').nextAll().hide();
	}
	$('#golem_window').click(function(event){
		Window._unflush();
		if (Window.temp.active) {
			$(this).html('<b>Disabled</b>').toggleClass('red green').nextAll().hide();
			Window.data.current = null;
			Window.temp.active = false;
		} else if (!Window.data.current || typeof Window.data.list[Window.data.current] === 'undefined' || Window.data.list[Window.data.current] < Date.now() - Window.timeout) {
			$(this).html('Enabled').toggleClass('red green');
			$('#golem_buttons').show();
			if (Config.get('option.display') === 'block') {
				$('#golem_config').parent().show();
			}
			Queue.clearCurrent();// Make sure we deal with changed circumstances
			Window.data.current = Window.global._id;
			Window.temp.active = true;
		} else {// Not able to go active
			Queue.clearCurrent();
			$(this).html('<b>Disabled</b><br><span>Another instance running!</span>');
			if (!Window.warning) {
				(function(){
					if ($('#golem_window span').length) {
						if ($('#golem_window span').css('color').indexOf('255') === -1) {
							$('#golem_window span').animate({'color':'red'},200,arguments.callee);
						} else {
							$('#golem_window span').animate({'color':'black'},200,arguments.callee);
						}
					}
				})();
			}
			window.clearTimeout(Window.warning);
			Window.warning = window.setTimeout(function(){if(!Window.temp.active){$('#golem_window').html('<b>Disabled</b>');}Window.warning=null;}, 3000);
		}
		Window._flush();
	});
	this._revive(1); // Call us *every* 1 second - not ideal with loads of Window, but good enough for half a dozen or more
	Title.alias('disable', 'Window:temp.active::(Disabled) ');
};

/***** Window.update() *****
1. We don't care about any data, only about the regular reminder we've set, so return if not the reminder
2. Update the data[id] to now() so we're not removed
3. If no other open instances then make ourselves active (if not already) and remove the "Enabled/Disabled" button
4. If there are other open instances then show the "Enabled/Disabled" button
*/
Window.update = function(event) {
	if (event.type !== 'reminder') {
		return;
	}
	var i, now = Date.now();
	this.data = this.data || {};
	this.data.list = this.data.list || {};
	this.data.list[this.global._id] = now;
	for(i in this.data.list) {
		if (this.data.list[i] < (now - this.timeout)) {
			delete this.data.list[i];
		}
	}
	i = length(this.data.list);
	if (i === 1) {
		if (!this.temp.active) {
			$('#golem_window').css('color','black').html('Enabled').toggleClass('red green');
			$('#golem_buttons').show();
			if (Config.get('option.display') === 'block') {
				$('#golem_config').parent().show();
			}
			Queue.clearCurrent();// Make sure we deal with changed circumstances
			this.data.current = this.global._id;
			this.temp.active = true;
			this._notify('temp.active');
		}
		$('#golem_window').hide();
	} else if (i > 1) {
		$('#golem_window').show();
	}
	this._flush();// We really don't want to store data any longer than we really have to!
};

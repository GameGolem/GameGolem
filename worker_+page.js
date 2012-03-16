/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Workers, Global, Main,
	APP, APPID, APPID_, PREFIX, userID, imagepath, script_started,
	isRelease, version, revision, Images, window, browser,
	LOG_ERROR, LOG_WARN, LOG_LOG, LOG_INFO, LOG_DEBUG, log,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	isArray, isFunction, isNumber, isObject, isString, isWorker,
	makeTimerMs
*/
/********** Worker.Page() **********
* All navigation including reloading
*/
var Page = new Worker('Page');

Page.settings = {
	system:true,
	keep:true,
	taint:true
};

Page.option = {
	timeout:60,
	reload:5,
	nochat:false,
	refresh:250,
	reload_max_time:3*24*60*60*1000,
	link_reload: false
};

Page.temp = {
	loading:false,
	last:'', // Last url we tried to load
	when:null,
	retry:0, // Number of times we tried before hitting option.reload
	checked:false, // Finished checking for new pages
	count:0,
	enabled:false, // Set to true in .work(true) - otherwise Page.to() should throw an error
	page:'' // Old Page.page
};

Page.lastclick = null;

Page.runtime = {
	delay:0, // Delay used for bad page load - reset in Page.clear(), otherwise double to a max of 5 minutes
	timers:{}, // Tickers being displayed
	stale:{}
};

Page.pageNames = {}; //id:{url:'...', image:'filename.jpg', selector:'jquery selector'}

Page.pageCheck = []; // List of selectors that *must* match for a valid page load

Global.display.push({
	title:'Page Loading',
	group:[
		{
			id:['Page','option','timeout'],
			label:'Retry after',
			select:[10, 15, 20, 30, 45, 60, 75, 90],
			after:'seconds'
		},{
			id:['Page','option','reload'],
			label:'Reload after',
			select:[3, 5, 7, 9, 11, 13, 15],
			after:'tries'
		},{
			id:['Page','option','nochat'],
			label:'Remove Facebook Chat',
			checkbox:true,
			help:'This does not log you out of chat, only hides it from display and attempts to stop it loading - you can still be online in other facebook windows'
		},{
			id:['Page','option','refresh'],
			label:'Refresh After',
			select:{
				0:'Never',
				50:'50 pages',
				100:'100 pages',
				150:'150 pages',
				200:'200 pages',
				250:'250 pages',
				500:'500 pages',
				750:'750 pages',
				1000:'1000 pages'
			}
		},{
			id:['Page','option','reload_max_time'],
			label:'Reload after',
			select:{
				0:'Never',
				3600000: '1 hour',
				7200000: '2 hours',
				10800000: '3 hours',
				14400000: '4 hours',
				21600000: '6 hours',
				28800000: '8 hours',
				43200000: '12 hours',
				64800000: '18 hours',
				86400000: '1 day',
				172800000: '2 days',
				259200000: '3 days',
				432000000: '5 days',
				604800000: '1 week'
			}
		},{
			id:['Page','option','link_reload'],
			label:'Reload via link',
			checkbox:true,
			help:'Reload via a remote link that directs the browser back one in history.'
			  + ' The alternative is to simply replace the current link'
			  + ', but this may not be as effective at clearing out memory in your browser.'
		}
	]
});

// We want this to run on the Global context
Global._overload(null, 'work', function(state) {
	var now = Date.now(), i, l, list, found = null;

	if (!Page.temp.checked) {
		for (i in Workers) {
			if (isString(Workers[i].pages)) {
				list = Workers[i].pages.split(' ');
				for (l=0; l<list.length; l++) {
					if (list[l] !== '*' && list[l] !== 'facebook' && Page.pageNames[list[l]] && !Page.pageNames[list[l]].skip && !Page.data[list[l]] && list[l].indexOf('_active') === -1) {
						found = list[l];
						break;
					}
				}
			}
			if (found) {
				break;
			}
		}
		if (found) {
			if (!state) {
				return QUEUE_CONTINUE;
			}
			Page.to(found);
			Page._set(['data', found], Date.now()); // Even if it's broken, we need to think we've been there!
			return QUEUE_CONTINUE;
		}
	//	arguments.callee = new Function();// Only check when first loading, once we're running we never work() again :-P
		Page.set(['temp','checked'], true);
	}

	if (((i = Page.option.refresh || 0) && i >= (Page.temp.count || 0))
	  || (((i = Page.option.reload_max_time || 0) && script_started + i > now))
	  || (Page.runtime.retry || 0) >= this.option.reload
	) {
		if (state) {
			Page.reload();
		}
		return QUEUE_CONTINUE;
	}

	return this._parent();
});

Page.init = function(old_revision, fresh) {
	this._trigger('#'+APPID_+'app_body_container, #'+APPID_+'globalContainer', 'page_change');
	this._trigger('.generic_dialog_popup', 'facebook');
	if (this.option.nochat) {
		$('#fbDockChat').hide();
	}
	this._revive(1, 'timers');// update() once every second to update any timers
};

Page.update = function(event, events) {
	// Can use init as no system workers (which can come before us) care what page we are on
	var i, list, now = Date.now(), time, page_change, facebook_page;

	if (events.findEvent(null, 'reminder', 'timers')) {
		for (i in this.runtime.timers) {
			time = this.runtime.timers[i] - now;
			// Delete old timers 1 week after "now?"
			if (time <= -7*24*60*60*1000) {
				this.set(['runtime','timers',i]);
			} else {
				$('#'+i).text(time > 0 ? makeTimerMs(time) : 'now?');
			}
		}
	}

	if (events.findEvent(null, 'trigger', 'page_change')
	  || events.findEvent(null,'init')
	) {
		page_change = true;
	}

	// Need to act as if it's a page change
	if (events.findEvent(null, 'trigger', 'facebook')) {
		page_change = true;
		facebook_page = true;
	}

	if (events.findEvent(null, 'reminder', 'timeout')) {
		this.temp.page = ''; // timeout invalidates the current page
		this.set(['temp','id'], null);
		this.set(['temp','loading'], false);
		//this.retry();
	}

	if (page_change) {
//		log('Page change noticed...');
		this._forget('timeout');
		if (!this.temp.loading) {
			// manual page change, so tick the counter
			this.add('temp.count', 1);
		}
		$('#AjaxLoadIcon').hide(); // sometimes it doesn't go away
		this.set(['temp','loading'], false);

		if (facebook_page) {
			this.temp.page = 'facebook';
			list = {};
			for (i in Workers) {
				if (Workers[i].pages
				  && Workers[i].pages.indexOf
				  && (Workers[i].pages.indexOf('*') >= 0
					|| (this.temp.page !== ''
					  && Workers[i].pages.indexOf(this.temp.page) >= 0))
				  && Workers[i]._page(this.temp.page, false)
				) {
					list[i] = true;
				}
			}
			for (i in list) {
				Workers[i]._page(this.temp.page, true);
			}
			return true;
		}

		// failed parse invalidates the current page
		this.temp.page = '';

		list = this.pageCheck;
		for (i = 0; i < list.length; i++) {
			if (!$(list[i]).length) {
				log(LOG_WARN, 'Bad page warning: Unabled to find '+list[i]);
				//this.retry();
				return true;
			}
		}

		// NOTE: Need a better function to identify pages, this lot is bad for CPU
		$('img', $('#'+APPID_+'app_body')).each(function(a,el){
			var i, filename = $(el).attr('src').filepart();
			for (i in Page.pageNames) {
				if (Page.pageNames[i].image && filename === Page.pageNames[i].image) {
					Page.temp.page = i;
//					log(LOG_DEBUG, 'Page:' + Page.temp.page);
					return;
				}
			}
		});
		if (this.temp.page === '') {
			for (i in this.pageNames) {
				if (this.pageNames[i].selector && $(this.pageNames[i].selector).length) {
					this.temp.page = i;
//					log(LOG_DEBUG, 'Page:' + this.temp.page);
				}
			}
		}
		if (this.temp.page !== '') {
			this.set(['data',this.temp.page], Date.now());
			this.set(['runtime','stale',this.temp.page]);
		}

//		log(LOG_WARN, 'Page.update: ' + (this.temp.page || 'Unknown page') + ' recognised');
		list = {};
		for (i in Workers) {
			if (Workers[i].pages
			 && Workers[i].pages.indexOf
			 && (Workers[i].pages.indexOf('*') >= 0 || (this.temp.page !== ''
			   && Workers[i].pages.indexOf(this.temp.page) >= 0))
			 && Workers[i]._page(this.temp.page, false)
			) {
				list[i] = true;
			}
		}
		for (i in list) {
			Workers[i]._page(this.temp.page, true);
		}
	}

	return true;
};

/**
 * @param {string} url The symbolic page name or a URL.
 * @param {?(string|Object)=} args An addition string or object of components.
 * @return {string} The resulting qualified URL.
 */
Page.makeURL = function(url, args) {
	var abs = Main.domain + Main.path;
	if (url in this.pageNames) {
		url = this.pageNames[url].url;
	} else {
		if (url.indexOf(abs) !== -1) {// Absolute url within app
			url = url.substr(abs.length);
		}
	}
	if (isString(args) && args.length) {
		url += (/^\?/.test(args) ? '' : '?') + args;
	} else if (isObject(args)) {
		url += '?' + decodeURIComponent($.param(args));
	}
	return url;
};

/**
 * @param {string} url The symbolic page name or a URL.
 * @param {?(string|Object)=} args An addition string or object of components.
 * @param {string} content An addition string or object of components.
 * @return {string} The resulting HTML link string.
 */
Page.makeLink = function(url, args, content) {
	var page = this.makeURL(url, args);
	return ('<a href="' + Main.scheme + Main.domain + Main.path + page + '"'
	  + ' onclick="' + (APPID_ === '' ? '' : 'a'+APPID+'_')
	  + 'ajaxLinkSend(&#039;globalContainer&#039;,&#039;' + page + '&#039;);'
	  + 'return false;' + '">' + content + '</a>');
};

/**
 * @param {string} url The symbolic page name or a URL.
 * @param {?(string|Object)=} args An addition string or object of components.
 * @param {?(boolean|number)=} force Force refresh threshold
 *		true = always force,
 *		false = never force,
 *		number = force if number seconds stale.
 * @param {boolean=} noWait Do not to block pages/clicks until the page loads.
 * @return {?boolean} true = page loaded, false = try again.
 */
Page.to = function(url, args, force, noWait) {
	if (!this.temp.enabled) {
		log(LOG_ERROR, 'BAD_FUNCTION_USE in Page.to('+JSON.shallow(arguments,2)+'): Not allowed to use Page.to() outside .work(true)');
		return true;
	}

	var page = this.makeURL(url, args),
		oldpage = this.temp.last || this.makeURL(this.temp.page);

	if (isNumber(force)) {
		if (page === oldpage) {
			force = Page.isStale(url, Date.now() - force*1000);
		} else {
			force = true;
		}
	}

	// check that we aren't already loading a page
	if (this.temp.loading) {
		log(LOG_WARN, 'Trying to load page while loading'
		  + ': ' + (Date.now() - this.temp.loading).toTimespan(2)
		  + ', id ' + this.temp.id
		);
		return null;
	}

	if (!page || (!force && page === oldpage)) {
		return true;
	}

	if (page === oldpage && force) {
		window.location.href = Main.js + 'void((function(){})())';
	}

	this.clear();
	this.set(['temp','last'], page);
	this.set(['temp','when'], Date.now());
	if (!noWait) {
		this.set(['temp','loading'], true);
	}

	log('Navigating to ' + page);

	// set the new page
	if (/^\w+:/.test(page)) {
		window.location.href = page;
	} else {
		window.location.href = Main.js + 'void('
		  + (APPID_ === '' ? '' : 'a'+APPID+'_')
		  + 'ajaxLinkSend("globalContainer","' + page + '"))';
	}
	if (!noWait) {
		this._remind(this.option.timeout, 'timeout');
		this.add(['temp','count'], 1);
	}

	return false;
};

Page.retry = function() {
	if (this.temp.reload || ++this.temp.retry >= this.option.reload) {
		this.reload();
	} else if (this.temp.last) {
		log(LOG_WARN, 'Page load timeout, retry '+this.temp.retry+'...');
		this.temp.enabled = true;
		this.to(this.temp.last, null, true);// Force
		this.temp.enabled = false;
	} else if (this.lastclick) {
		log(LOG_WARN, 'Page click timeout, retry '+this.temp.retry+'...');
		this.temp.enabled = true;
		this.click(this.lastclick);
		this.temp.enabled = false;
	} else {
		// Probably a bad initial page load...
		// Reload the page - but use an incrimental delay - every time we double it to a maximum of 5 minutes
		var delay = this.set(['runtime','delay'], Math.max((this.get(['runtime','delay'], 0) * 2) || this.get(['option','timeout'], 10), 300));
		this.set(['temp','reload'], true);
		this.set(['temp','loading'], true);
		this._remind(delay,'retry',{worker:this, type:'init'});// Fake it to force a re-check
		$('body').append('<div style="position:fixed;width:100%;top:50%;text-align:center;"><span style="font-size:36px;color:red;padding:0 4px 2px 4px;margin:-18px auto;background:white;border:1px solid red;border-radius:4px;">ERROR: Reloading in ' + Page.addTimer('reload',delay * 1000, true) + '</span></div>');
//		log(LOG_ERROR, 'Unexpected retry event.');
	}
};
		
Page.reload = function() {
	var i;

	log('Reloading...');

	Main.shutdown();

	if (!isString(Main.file)) {
		window.location.replace(window.location.href);
	} else if (!this.option.link_reload) {
		i = Main.scheme + Main.domain + Main.path + Main.file;
		window.location.replace(i);
	} else {
		if (!$('#reload_link').length) {
			$('body').append('<a id="reload_link" href="http://www.cloutman.com/reload.php">reload</a>');
		}
		this.click('#reload_link');
	}
};

Page.clearFBpost = function(obj) {
	var i, output = [];
	for (i=0; i<obj.length; i++) {
		if (obj[i].name.indexOf('fb_') !== 0) {
			output.push(obj[i]);
		}
	}
	if (!output.bqh && $('input[name=bqh]').length) {
		output.push({name:'bqh', value:$('input[name=bqh]').first().val()});
	}
	return output;
};

/**
 * @param {(string|jQuery|Element)} el The jQuery selector or Element to click.
 * @param {boolean=} noWait Do not to block pages/clicks until the page loads.
 * @return {?boolean} true = page loaded, false = try again.
 */
Page.click = function(el, noWait) {
	if (!this.temp.enabled) {
		log(LOG_ERROR, 'BAD_FUNCTION_USE in Page.click('+JSON.shallow(arguments,2)+'): Not allowed to use Page.click() outside .work(true)');
		return true;
	}
	if (!$(el).length) {
		log(LOG_ERROR, 'Page.click: Unable to find element - '+el);
		return false;
	}
	var e, element = $(el).get(0);
	if (this.lastclick !== el) {
		this.clear();
	}
	this.set(['runtime', 'delay'], 0);
	this.lastclick = el; // Causes circular reference when watching...
	this.set(['temp','when'], Date.now());
	if (!noWait) {
		this.set(['temp','loading'], true);
	}
	e = document.createEvent("MouseEvents");
	e.initEvent("click", true, true);
	(element.wrappedJSObject ? element.wrappedJSObject : element).dispatchEvent(e);
	if (!noWait) {
		this._remind(this.option.timeout, 'timeout');
		this.add(['temp','count'], 1);
	}
	return true;
};

Page.clear = function() {
	this.lastclick = null;
	this.set(['temp','last'], null);
	this.set(['temp','when'], null);
	this.set(['temp','retry'], 0);
	this.set(['temp','reload'], 0);
	this.set(['temp','loading'], false);
	this.set(['runtime','delay'], 0);
};

Page.addTimer = function(id, time, relative) {
	var now = Date.now();
	if (relative) {
		time = now + time;
	}
	this.set(['runtime','timers','golem_timer_'+id], time);
	return '<span id="golem_timer_'+id+'">' + makeTimerMs(time - now) + '</span>';
};

Page.delTimer = function(id) {
	this.set(['runtime','timers','golem_timer_'+id]);
};

/**
 * Set a value in one of our _datatypes
 * @param {string} page The page we need to visit
 * @param {number} age How long is it allowed to be stale before we need to visit it again (in seconds), use -1 for "now"
 * @param {boolean} go Automatically call Page.to(page)
 * @return {boolean} True if we don't need to visit the page, false if we do
 */
Page.stale = function(page, age, go) {
	if (age && (page in this.pageNames)) {
		var now = Date.now();
		if (this.data[page] < now - (age * 1000)) {
			if (go && !this.to(page)) {
				this.set(['data',page], now);
			}
			return false;
		}
	}
	return true;
};

/**
 * Mark a page as stale, hinting to relevant workers that it needs a visit.
 * @param {string} page The page to mark as stale
 * @param {number} when Optional point when the page became stale.
 */
Page.setStale = function(page, when) {
	var now = Date.now(),
		seen = this.get(['data',page], 0, 'number'),
		want = this.get(['runtime','stale',page], 0, 'number');

	// don't let this be negative (pre 1970) or future (past "now")
	if (!isNumber(when) || when < 0 || when > now || want > now) {
		when = now;
	}

	// maintain the later date if ours is older
	if (seen >= when && seen >= want) {
		this.set(['runtime','stale',page]);
	} else if (want < when || want > now) {
		this.set(['runtime','stale',page], Math.round(when));
	}
};

/**
 * Test if a page is considered stale.
 * @param {string} page The page to check for staleness
 * @param {number} [when] Optional check against a specific time.
 * @return {boolean} True if the page is considered stale.
 */
Page.isStale = function(page, when) {
	var seen = this.get(['data',page], 0, 'number'),
		want = this.get(['runtime','stale',page], 0, 'number');

	if (isNumber(when) && want < when) {
		want = when;
	}

	// never seen or older than our stale mark
	return !seen || seen < want;
};

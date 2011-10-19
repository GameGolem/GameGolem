/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Workers, Global, Main,
	APP, APPID, APPID_, PREFIX, userID, imagepath,
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
	timeout:15,
	reload:5,
	nochat:false,
	refresh:250
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
			select:[10, 15, 30, 60],
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
			select:{0:'Never', 50:'50 Pages', 100:'100 Pages', 150:'150 Pages', 200:'200 Pages', 250:'250 Pages', 500:'500 Pages'}
		}
	]
});

// We want this to run on the Global context
Global._overload(null, 'work', function(state) {
	var i, l, list, found = null;
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
	if (Page.option.refresh && Page.temp.count >= Page.option.refresh) {
		if (state) {
			if (!$('#reload_link').length) {
				$('body').append('<a id="reload_link" href="http://www.cloutman.com/reload.php">reload</a>');
			}
			Page.click('#reload_link');
		}
		return QUEUE_CONTINUE;
	}
	return this._parent();
});

Page.init = function() {
	this._trigger('#'+APPID_+'app_body_container, #'+APPID_+'globalContainer', 'page_change');
	this._trigger('.generic_dialog_popup', 'facebook');
	if (this.option.nochat) {
		$('#fbDockChat').hide();
	}
	this._revive(1, 'timers');// update() once every second to update any timers
};

Page.update = function(event, events) {
	// Can use init as no system workers (which can come before us) care what page we are on
	var i, list, now = Date.now(), time;
	if (events.findEvent(null,'reminder','timers')) {
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
	if (events.findEvent(null,'reminder','retry')) {
		this.retry();
	}
	if (events.findEvent(null,'init') || events.findEvent(null,'trigger','page_change')) {
		list = this.pageCheck;
//		log('Page change noticed...');
		this._forget('retry');
		this.set(['temp','loading'], false);
		for (i=0; i<list.length; i++) {
			if (!$(list[i]).length) {
				log(LOG_WARN, 'Bad page warning: Unabled to find '+list[i]);
				this.retry();
				return;
			}
		}
		// NOTE: Need a better function to identify pages, this lot is bad for CPU
		this.temp.page = '';
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
			this.set(['runtime', 'stale', this.temp.page]);
		}
//		log(LOG_WARN, 'Page.update: ' + (this.temp.page || 'Unknown page') + ' recognised');
		list = {};
		for (i in Workers) {
			if (Workers[i].pages
			 && Workers[i].pages.indexOf
			 && (Workers[i].pages.indexOf('*') >= 0 || (this.temp.page !== '' && Workers[i].pages.indexOf(this.temp.page) >= 0))
			 && Workers[i]._page(this.temp.page, false)) {
				list[i] = true;
			}
		}
		for (i in list) {
			Workers[i]._page(this.temp.page, true);
		}
	}
	if (events.findEvent(null,'trigger','facebook')) { // Need to act as if it's a page change
		this._forget('retry');
		this.set(['temp', 'loading'], false);
		for (i in Workers) {
			if (Workers[i].page && Workers[i].pages && Workers[i].pages.indexOf('facebook') >= 0) {
				Workers[i]._page('facebook', false);
			}
		}
	}
	return true;
};

Page.makeURL = function(url, args) {
	var abs = 'apps.facebook.com/' + APP + '/';
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

Page.makeLink = function(url, args, content) {
	var page = this.makeURL(url, args);
	return '<a href="' + window.location.protocol + '//apps.facebook.com/' + APP + '/' + page + '" onclick="' + (APPID_==='' ? '' : 'a'+APPID+'_') + 'ajaxLinkSend(&#039;globalContainer&#039;,&#039;' + page + '&#039;);return false;' + '">' + content + '</a>';
};

/*
Page.to('index', ['args' | {arg1:val, arg2:val},] [true|false]
*/
Page.to = function(url, args, force) { // Force = true/false (allows to reload the same page again)
	if (!this.temp.enabled) {
		log(LOG_ERROR, 'BAD_FUNCTION_USE in Page.to('+JSON.shallow(arguments,2)+'): Not allowed to use Page.to() outside .work(true)');
		return true;
	}
	var page = this.makeURL(url, args);
//	if (Queue.option.pause) {
//		log(LOG_ERROR, 'Trying to load page when paused...');
//		return true;
//	}
	if (!page || (!force && page === (this.temp.last || this.temp.page))) {
		return true;
	}
	if (page !== (this.temp.last || this.temp.page)) {
		this.clear();
		this.set(['temp','last'], page);
		this.set(['temp','when'], Date.now());
		this.set(['temp','loading'], true);
		log('Navigating to ' + page);
	} else if (force) {
		window.location.href = 'javascript:void((function(){})())';// Force it to change
	}
	window.location.href = /^https?:/i.test(page) ? page : 'javascript:void(' + (APPID_==='' ? '' : 'a'+APPID+'_') + 'ajaxLinkSend("globalContainer","' + page + '"))';
	this._remind(this.option.timeout, 'retry');
	this.set(['temp','count'], this.get(['temp','count'], 0) + 1);
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
	log('Page.reload()');
	window.location.replace(window.location.href);
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

Page.click = function(el) {
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
	this.set(['temp','loading'], true);
	e = document.createEvent("MouseEvents");
	e.initEvent("click", true, true);
	(element.wrappedJSObject ? element.wrappedJSObject : element).dispatchEvent(e);
	this._remind(this.option.timeout, 'retry');
	this.set(['temp','count'], this.get(['temp','count'], 0) + 1);
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

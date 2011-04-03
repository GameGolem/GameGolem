/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page:true, Queue, Resources, Global,
	Battle, Generals, LevelUp, Player,
	APP, APPID, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, Divisor, length, sum, findInObject, objectIndex, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
	makeImage, log, warn, error
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
	count:0
};

Page.lastclick = null;

Page.runtime = {
	delay:0, // Delay used for bad page load - reset in Page.clear(), otherwise double to a max of 5 minutes
	timers:{} // Tickers being displayed
};

Page.page = '';

Page.pageNames = {}; //id:{url:'...', image:'filename.jpg', selector:'jquery selector'}

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
		if (!state) {
			return QUEUE_CONTINUE;
		}
		Page.to('http://www.cloutman.com/reload.php');
	}
	return this._parent();
});

Page.init = function() {
	// BEGIN: Fix for before Config supported path'ed set
	if (Global.get(['option','page'], false)) {
		this.set(['option','timeout'], Global.get(['option','page','timeout'], this.option.timeout));
		this.set(['option','reload'], Global.get(['option','page','reload'], this.option.reload));
		this.set(['option','nochat'], Global.get(['option','page','nochat'], this.option.nochat));
		this.set(['option','refresh'], Global.get(['option','page','refresh'], this.option.refresh));
		Global.set(['option','page']);
	}
	// END
	this._trigger('#app46755028429_app_body_container, #app46755028429_globalContainer', 'page_change');
	this._trigger('.generic_dialog_popup', 'facebook');
	if (this.option.nochat) {
		$('#fbDockChat').hide();
	}
	$('.golem-link').live('click', function(event){
		if (!Page.to($(this).attr('href'), false)) {
			return false;
		}
	});
	this._revive(1, 'timers');// update() once every second to update any timers
};

Page.update_reminder = function(event) {
	if (event.id === 'timers') {
		var i, now = Date.now(), time;
		for (i in this.runtime.timers) {
			time = (this.runtime.timers[i] - now) / 1000;
			if (time <= -604800) { // Delete old timers 1 week after "now?"
				this.set(['runtime','timers',i]);
			} else {
				$('#'+i).text(time > 0 ? makeTimer(time) : 'now?')
			}
		}
	} else {
		this.update(event);
	}
};

Page.update = function(event) {
	// Can use init as no system workers (which can come before us) care what page we are on
	if (event.type === 'init' || event.type === 'trigger') {
		var i, list;
		if (event.type === 'init' || event.id === 'page_change') {
			list = ['#app_content_'+APPID, '#app46755028429_globalContainer', '#app46755028429_globalcss', '#app46755028429_main_bntp', '#app46755028429_main_sts_container', '#app46755028429_app_body_container', '#app46755028429_nvbar', '#app46755028429_current_pg_url', '#app46755028429_current_pg_info'];
//			console.log(warn('Page change noticed...'));
			this._forget('retry');
			this.set(['temp', 'loading'], false);
			for (i=0; i<list.length; i++) {
				if (!$(list[i]).length) {
					console.log(warn('Bad page warning: Unabled to find '+list[i]));
					this.retry();
					return;
				}
			}
			// NOTE: Need a better function to identify pages, this lot is bad for CPU
			this.page = '';
			$('img', $('#app46755028429_app_body')).each(function(i,el){
				var i, filename = $(el).attr('src').filepart();
				for (i in Page.pageNames) {
					if (Page.pageNames[i].image && filename === Page.pageNames[i].image) {
						Page.page = i;
						//console.log(log('Page:' + Page.page));
						return;
					}
				}
			});
			if (this.page === '') {
				for (i in Page.pageNames) {
					if (Page.pageNames[i].selector && $(Page.pageNames[i].selector).length) {
						//console.log(log('Page:' + Page.page));
						Page.page = i;
					}
				}
			}
			if (this.page !== '') {
				this.set(['data',this.page], Date.now());
			}
//			console.log(warn('Page.update: ' + (this.page || 'Unknown page') + ' recognised'));
			list = {};
			for (i in Workers) {
				if (Workers[i].parse
				 && Workers[i].pages
				 && (Workers[i].pages.indexOf('*') >= 0 || (this.page !== '' && Workers[i].pages.indexOf(this.page) >= 0))
				 && Workers[i]._parse(false)) {
					list[i] = true;
				}
			}
			for (i in list) {
				Workers[i]._parse(true);
			}
			for (i in Workers) {
				Workers[i]._flush();
			}
		} else if (event.id === 'facebook') { // Need to act as if it's a page change
			this._forget('retry');
			this.set(['temp', 'loading'], false);
			for (i in Workers) {
				if (Workers[i].parse && Workers[i].pages && Workers[i].pages.indexOf('facebook') >= 0) {
					Workers[i]._parse('facebook');
				}
			}
		}
	} else if (event.type === 'reminder' && event.id === 'retry') {
		this.retry();
	}
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
	if (isString(args)) {
		url += (/^\?/.test(args) ? '' : '?') + args;
	} else if (isObject(args)) {
		url += '?' + decodeURIComponent($.param(args));
	}
	return url;
};

Page.makeLink = function(url, args, content) {
	var page = this.makeURL(url, args);
	return '<a href="' + window.location.protocol + '//apps.facebook.com/' + APP + '/' + page + '" onclick="' + 'a46755028429_ajaxLinkSend(&#039;globalContainer&#039;,&#039;' + page + '&#039;);return false;' + '">' + content + '</a>';
};

/*
Page.to('index', ['args' | {arg1:val, arg2:val},] [true|false]
*/
Page.to = function(url, args, force) { // Force = true/false (allows to reload the same page again)
	var page = this.makeURL(url, args);
//	console.log(warn(), 'Page.to("'+page+'", "'+args+'");');
//	if (Queue.option.pause) {
//		console.log(error('Trying to load page when paused...'));
//		return true;
//	}
	if (!page || (!force && page === (this.temp.last || this.page))) {
		return true;
	}
	if (page !== (this.temp.last || this.page)) {
		this.clear();
		this.set(['temp','last'], page);
		this.set(['temp','when'], Date.now());
		this.set(['temp', 'loading'], true);
		console.log(warn('Navigating to ' + page));
	} else if (force) {
		window.location.href = 'javascript:void((function(){})())';// Force it to change
	}
	window.location.href = 'javascript:void(a46755028429_ajaxLinkSend("globalContainer","' + page + '"))';
	this._remind(this.option.timeout, 'retry');
	this.set(['temp','count'], this.get(['temp','count'], 0) + 1);
	return false;
};

Page.retry = function() {
	if (this.temp.reload || ++this.temp.retry >= this.option.reload) {
		this.reload();
	} else if (this.temp.last) {
		console.log(log('Page load timeout, retry '+this.temp.retry+'...'));
		this.to(this.temp.last, null, true);// Force
	} else if (this.lastclick) {
		console.log(log('Page click timeout, retry '+this.temp.retry+'...'));
		this.click(this.lastclick);
	} else {
		// Probably a bad initial page load...
		// Reload the page - but use an incrimental delay - every time we double it to a maximum of 5 minutes
		var delay = this.set(['runtime','delay'], Math.max((this.get(['runtime','delay'], 0) * 2) || this.get(['option','timeout'], 10), 300));
		this.set(['temp','reload'], true);
		this.set(['temp', 'loading'], true);
		this._remind(delay, 'retry', {worker:this, type:'init'});// Fake it to force a re-check
		$('body').append('<div style="position:absolute;top:100;left:0;width:100%;"><div style="margin:auto;font-size:36px;color:red;">ERROR: Reloading in ' + Page.addTimer('reload',delay * 1000, true) + '</div></div>');
		console.log(log('Unexpected retry event.'));
	}
};
		
Page.reload = function() {
	console.log(warn('Page.reload()'));
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
	if (!$(el).length) {
		console.log(log(), 'Page.click: Unable to find element - '+el);
		return false;
	}
	var e, element = $(el).get(0);
	if (this.lastclick !== el) {
		this.clear();
	}
	this.set(['runtime', 'delay'], 0);
	this.lastclick = el; // Causes circular reference when watching...
	this.set(['temp','when'], Date.now());
	this.set(['temp', 'loading'], true);
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
	this.set(['temp', 'loading'], false);
	this.set(['runtime', 'delay'], 0);
};

Page.addTimer = function(id, time, relative) {
	if (relative) {
		time = Date.now() + time;
	}
	this.set(['runtime','timers','golem_timer_'+id], time);
	return '<span id="golem_timer_'+id+'">' + makeTimer((time - Date.now()) / 1000) + '</span>';
};

Page.delTimer = function(id) {
	this.set(['runtime','timers','golem_timer_'+id]);
};

/*
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

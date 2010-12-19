/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page:true, Queue, Resources,
	Battle, Generals, LevelUp, Player,
	APP, APPID, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, shortNumber, Divisor, length, unique, deleteElement, sum, addCommas, findInArray, findInObject, objectIndex, sortObject, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime, ucfirst, ucwords,
	makeImage
*/
/********** Worker.Page() **********
* All navigation including reloading
*/
var Page = new Worker('Page');

Page.settings = {
	system:true,
	keep:true
};

Global.option.page = {
	timeout:15,
	reload:5,
	nochat:false
};

Page.temp = {
	loading:false,
	last:'', // Last url we tried to load
	when:null,
	lastclick:null,
	retry:0 // Number of times we tried before hitting option.reload
};

Page.runtime = {
	delay:0 // Delay used for bad page load - reset in Page.clear(), otherwise double to a max of 5 minutes
};

Page.page = '';

Page.pageNames = {}; //id:{url:'...', image:'filename.jpg', selector:'jquery selector'}

Global.display.push({
	title:'Page Loading',
	group:[
		{
			id:'page.timeout',
			label:'Retry after',
			select:[10, 15, 30, 60],
			after:'seconds'
		},{
			id:'page.reload',
			label:'Reload after',
			select:[3, 5, 7, 9, 11, 13, 15],
			after:'tries'
		},{
			id:'page.nochat',
			label:'Remove Facebook Chat',
			checkbox:true,
			help:'This does not log you out of chat, only hides it from display and attempts to stop it loading - you can still be online in other facebook windows'
		}
	]
});

// We want this to run on the Global context
Global._overload(null, 'work', function(state) {
	var i, l, list, found = null;
	for (i in Workers) {
		if (isString(Workers[i].pages)) {
			list = Workers[i].pages.split(' ');
			for (l=0; l<list.length; l++) {
				if (list[l] !== '*' && Page.pageNames[list[l]] && !Page.data[list[l]] && list[l].indexOf('_active') === -1) {
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
	arguments.callee = new Function();// Only check when first loading, once we're running we never work() again :-P
	return this._parent();
});

Page.removeFacebookChat = function() {
	$('script').each(function(i,el){
		$(el).text($(el).text()
		.replace(/\nonloadRegister.function \(\).*new ChatNotifications.*/g, '')
		.replace(/\n<script>big_pipe.onPageletArrive.{2}"id":"pagelet_chat_home".*/g, '')
		.replace(/\n<script>big_pipe.onPageletArrive.{2}"id":"pagelet_presence".*/g, '')
		.replace(/|chat\\\//,''));
	});
	var b = document.getElementsByTagName('body')[0] || document.documentElement, a = document.createElement('script');
	a.type = 'text/javascript';
	a.appendChild(document.createTextNode('window.setTimeout(function(){delete window.presenceNotifications;},1000);'));
	b.appendChild(a);
	$('#pagelet_presence').remove();
	$('#pagelet_chat_home').remove();
};

Page.init = function() {
	this._trigger('#app'+APPID+'_app_body_container, #app'+APPID+'_globalContainer', 'page_change');
	this._trigger('.generic_dialog_popup', 'facebook');
	if (Global.option.page.nochat) {
		this.removeFacebookChat();
	}
	$('.golem-link').live('click', function(event){
		if (!Page.to($(this).attr('href'), false)) {
			return false;
		}
	});
};

Page.update = function(event) {
	// Can use init as no system workers (which can come before us) care what page we are on
	if (event.type === 'init' || event.type === 'trigger') {
		var i, list;
		if (event.type === 'init' || event.id === 'page_change') {
			list = ['#app_content_'+APPID, '#app'+APPID+'_globalContainer', '#app'+APPID+'_globalcss', '#app'+APPID+'_main_bntp', '#app'+APPID+'_main_sts_container', '#app'+APPID+'_app_body_container', '#app'+APPID+'_nvbar', '#app'+APPID+'_current_pg_url', '#app'+APPID+'_current_pg_info'];
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
			$('img', $('#app'+APPID+'_app_body')).each(function(i,el){
				var i, filename = $(el).attr('src').filepart();
				for (i in Page.pageNames) {
					if (Page.pageNames[i].image && filename === Page.pageNames[i].image) {
						Page.page = i;
						return;
					}
				}
			});
			if (!this.page) {
				for (i in Page.pageNames) {
					if (Page.pageNames[i].selector && $(Page.pageNames[i].selector).length) {
						Page.page = i;
					}
				}
			}
			if (this.page !== '') {
				this.data[this.page] = Date.now();
			}
//			console.log(warn('Page.update: ' + (this.page || 'Unknown page') + ' recognised'));
			list = [];
			for (i in Workers) {
				if (Workers[i].parse
				 && Workers[i].pages
				 && (Workers[i].pages.indexOf('*') >= 0 || (this.page !== '' && Workers[i].pages.indexOf(this.page) >= 0))
				 && Workers[i]._parse(false)) {
					list.push(Workers[i]);
				}
			}
			for (i in list) {
				list[i]._parse(true);
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
Page.to = function(url, args) { // Force = true/false (ignore pause if true)
	var page = this.makeURL(url, args);
//	console.log(warn(), 'Page.to("'+page+'", "'+args+'");');
	if (Queue.option.pause) {
		console.log(error('Trying to load page when paused...'));
		return true;
	}
	if (!page || page === (this.temp.last || this.page)) {
		return true;
	}
	this.clear();
	this.temp.last = page;
	this.temp.when = Date.now();
	this.set(['temp', 'loading'], true);
	console.log(warn('Navigating to ' + page));
	window.location.href = 'javascript:void(a46755028429_ajaxLinkSend("globalContainer","' + page + '"))';
	this._remind(Global.option.page.timeout, 'retry');
	return false;
};

Page.retry = function() {
	if (this.temp.reload || ++this.temp.retry >= Global.option.page.reload) {
		this.reload();
	} else if (this.temp.last) {
		console.log(log('Page load timeout, retry '+this.temp.retry+'...'));
		this.to(this.temp.last);
	} else if (this.temp.lastclick) {
		console.log(log('Page click timeout, retry '+this.temp.retry+'...'));
		this.click(this.temp.lastclick);
	} else {
		// Probably a bad initial page load...
		// Reload the page - but use an incrimental delay - every time we double it to a maximum of 5 minutes
		this._load('runtime');// Just in case we've got multiple copies
		this.runtime.delay = this.runtime.delay ? Math.max(this.runtime.delay * 2, 300) : Global.option.page.timeout;
		this._save('runtime');// Make sure it's saved for our next try
		this.temp.reload = true;
		$('body').append('<div style="position:absolute;top:100;left:0;width:100%;"><div style="margin:auto;font-size:36px;color:red;">ERROR: Reloading in <span class="golem-time" name="' + (Date.now() + (this.runtime.delay * 1000)) + '">' + makeTimer(this.runtime.delay) + '</span></div></div>');
		this.set(['temp', 'loading'], true);
		this._remind(this.runtime.delay, 'retry', {worker:this, type:'init'});// Fake it to force a re-check
		console.log(log('Unexpected retry event.'));
	}
};
		
Page.reload = function() {
	console.log(warn('Page.reload()'));
	window.location.replace(window.location.href);
};

Page.clearFBpost = function(obj) {
	var output = [];
	for (var i=0; i<obj.length; i++) {
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
	this.clear();
	this.temp.lastclick = el;
	this.temp.when = Date.now();
	this.set(['temp', 'loading'], true);
	e = document.createEvent("MouseEvents");
	e.initEvent("click", true, true);
	(element.wrappedJSObject ? element.wrappedJSObject : element).dispatchEvent(e);
	this._remind(Global.option.page.timeout, 'retry');
	return true;
};

Page.clear = function() {
	this.temp.last = this.temp.lastclick = this.temp.when = null;
	this.temp.retry = 0;
	this.temp.reload = false;
	this.set(['temp', 'loading'], false);
	this.set(['runtime', 'delay'], 0);
};


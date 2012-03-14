/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Workers, Config, Dashboard, Page,
	Upgrade,
	APP, APPID, APPID_, PREFIX, userID, imagepath,
	isRelease, version, revision, Images, window, browser,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	isArray, isFunction, isNumber, isObject, isString, isWorker
*/
/********** Worker.Blessing **********
* Automatically receive blessings
*/
var Blessing = new Worker('Blessing');
Blessing.temp = null;

Blessing.settings = {
	taint:true
};

Blessing.defaults['castle_age'] = {
	pages:'oracle_demipower'
};

Blessing.option = {
	which:'Stamina'
};

Blessing.runtime = {
	upgrade:false,
	when:0
};

Blessing.which = ['None', 'Energy', 'Attack', 'Defense', 'Health', 'Stamina'];
Blessing.display = [
    {
		id:'upgrade',
		label:'Use Upgrade Rules',
		checkbox:true,
		help:'This will spend your blessing on the next stat point that your Upgrade worker wishes to use. If Upgrade doesn\'t want to spend anything, then fall back to Which below'
	},{
		id:'which',
		label:'Which',
		select:Blessing.which
    }
];

Blessing.init = function() {
	var when = this.get(['runtime','when'], 0);

	if (when) {
		this._remindMs(Math.max(1, when - Date.now()), 'blessing');
	}

	this._watch(Upgrade, 'runtime.next');
};

Blessing.page = function(page, change) {
	var result = $('div.results'), time, when;
	if (result.length) {
		time = result.text().regex(/Please come back in: (\d+) hours and (\d+) minutes/i);
		if (time && time.length) {
			this.set(['runtime','when'], Date.now() + (((time[0] * 60) + time[1] + 1) * 60000));
		} else if (result.text().match(/You have paid tribute to/i)) {
			this.set(['runtime','when'], Date.now() + 86460000); // 24 hours and 1 minute
		}
		if ((when = this.get(['runtime','when'], 0, 'number'))) {
			this._remindMs(Math.max(1, when - Date.now()), 'blessing');
		}
	}
//app46755028429_symbol_displaysymbols1
//You have 28279 Demi Points!
/*
	this.set(['data','energy'], $('#'+APPID_+'symbol_displaysymbols1').text().trim(true).regex(/You have (\d+) Demi Points/i), 'number');
	this.set(['data','attack'], $('#'+APPID_+'symbol_displaysymbols2').text().trim(true).regex(/You have (\d+) Demi Points/i), 'number');
	this.set(['data','defense'], $('#'+APPID_+'symbol_displaysymbols3').text().trim(true).regex(/You have (\d+) Demi Points/i), 'number');
	this.set(['data','health'], $('#'+APPID_+'symbol_displaysymbols4').text().trim(true).regex(/You have (\d+) Demi Points/i), 'number');
	this.set(['data','stamina'], $('#'+APPID_+'symbol_displaysymbols5').text().trim(true).regex(/You have (\d+) Demi Points/i), 'number');
*/
	return false;
};

Blessing.update = function(event, events) {
	var now = Date.now(), d, i, demi, which = this.option.which;

	if (this.option.upgrade) {
		which = Upgrade.get(['runtime','next']) || which;
	}

	if (which && which !== 'None') {
		which = which.ucfirst();
		d = new Date(this.runtime.when);
		switch (which.toLowerCase()) {
		case 'energy':
			demi = Config.makeImage('symbol-1', 'Ambrosia');
			break;
		case 'attack':
			demi = Config.makeImage('symbol-2', 'Malekus');
			break;
		case 'defense':
			demi = Config.makeImage('symbol-3', 'Corvintheus');
			break;
		case 'health':
			demi = Config.makeImage('symbol-4', 'Aurora');
			break;
		case 'stamina':
			demi = Config.makeImage('symbol-5', 'Azeron');
			break;
		default:
			demi = 'Unknown';
			break;
		}
		Dashboard.status(this, '<span title="Next Blessing">' + 'Next Blessing due on ' + d.format('l g:i a') + ' to ' + demi + ' for ' + which + '</span>');
		this.set(['option','_sleep'], now < this.runtime.when);
	} else {
		Dashboard.status(this);
		this.set(['option','_sleep'], true);
	}

	return true;
};

Blessing.work = function(state) {
	if (!state || !Page.to('oracle_demipower', '', 30)) {
		return QUEUE_CONTINUE;
	}
	var which = this.option.which;
	if (this.option.upgrade) {
		which = Upgrade.get(['runtime','next'], which, 'string'); // use type to force it to fallback
	}
	Page.click('#'+APPID_+'symbols_form_'+this.which.indexOf(which.ucfirst())+' input.imgButton');
	return QUEUE_RELEASE;
};


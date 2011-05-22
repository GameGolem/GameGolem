/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page:true, Queue, Resources,
	Battle, Generals, LevelUp, Player,
	APP, APPID, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, Divisor, length, sum, findInObject, objectIndex, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
	makeImage
*/
/********** Worker.Blessing **********
* Automatically receive blessings
*/
var Blessing = new Worker('Blessing');
Blessing.data = Blessing.temp = null;

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
	when:0
};

Blessing.which = ['None', 'Energy', 'Attack', 'Defense', 'Health', 'Stamina'];
Blessing.display = [
    {
		id:'which',
		label:'Which',
		select:Blessing.which
    }
];

Blessing.setup = function() {
	// BEGIN: Use global "Show Status" instead of custom option
	if ('display' in this.option) {
		this.set(['option','_hide_status'], !this.option.display);
		this.set(['option','display']);
	}
	// END
};

Blessing.init = function() {
	var when = this.get(['runtime','when'],0);
	if (when) {
		this._remind((when - Date.now()) / 1000, 'blessing');
	}
};

Blessing.parse = function(change) {
	var result = $('div.results'), time, when;
	if (result.length) {
		time = result.text().regex(/Please come back in: (\d+) hours and (\d+) minutes/i);
		if (time && time.length) {
			this.set(['runtime','when'], Date.now() + (((time[0] * 60) + time[1] + 1) * 60000));
		} else if (result.text().match(/You have paid tribute to/i)) {
			this.set(['runtime','when'], Date.now() + 86460000); // 24 hours and 1 minute
		}
		if ((when = this.get(['runtime','when'],0))) {
			this._remind((when - Date.now()) / 1000, 'blessing');
		}
	}
	return false;
};

Blessing.update = function(event){
    var d, demi;
     if (this.option.which && this.option.which !== 'None'){
         d = new Date(this.runtime.when);
         switch(this.option.which){
             case 'Energy':
                 demi = makeImage('symbol-1', 'Energy') + ' Ambrosia (' + this.option.which + ')';
                 break;
             case 'Attack':
                 demi = makeImage('symbol-2', 'Attack') + ' Malekus (' + this.option.which + ')';
                 break;
             case 'Defense':
                 demi = makeImage('symbol-3', 'Defense') + ' Corvintheus (' + this.option.which + ')';
                 break;
             case 'Health':
                 demi = makeImage('symbol-4', 'Health') + ' Aurora (' + this.option.which + ')';
                 break;
             case 'Stamina':
                 demi = makeImage('symbol-5', 'Stamina') + ' Azeron (' + this.option.which + ')';
                 break;
             default:
                 demi = 'Unknown';
                 break;
         }
         Dashboard.status(this, '<span title="Next Blessing">' + 'Next Blessing performed on ' + d.format('l g:i a') + ' to ' + demi + ' </span>');
		 this.set(['option','_sleep'], Date.now() < this.runtime.when);
     } else {
         Dashboard.status(this);
 		 this.set(['option','_sleep'], true);
    }
};

Blessing.work = function(state) {
	if (!state || !Page.to('oracle_demipower')) {
		return QUEUE_CONTINUE;
	}
	Page.click('#'+APPID_+'symbols_form_'+this.which.indexOf(this.option.which)+' input.imgButton');
	return QUEUE_RELEASE;
};


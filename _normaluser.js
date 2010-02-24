// ==UserScript==
// @name           Rycochet's Castle Age Golem
// @namespace      golem
// @description    Auto player for castle age game
// @version        12
// @include        http*://apps.*facebook.com/castle_age/*
// @require        http://cloutman.com/jquery-latest.min.js
// @require        http://cloutman.com/jquery-ui-latest.min.js
// ==/UserScript==
// -- @include        http://www.facebook.com/common/error.html
// -- @include        http://www.facebook.com/reqs.php#confirm_46755028429_0
// -- @include        http://www.facebook.com/home.php
// -- @include        http://www.facebook.com/home.php*filter=app_46755028429*

// Elite army
// http://apps.facebook.com/castle_age/party.php?twt=jneg&jneg=true&user=44404517

// User changeable
var debug = true;

// Shouldn't touch
var VERSION = 12;
var APP = '46755028429';
var PREFIX = 'golem'+APP+'_';
var userID = unsafeWindow.Env.user; // Facebook userid
var script_started = Date.now();

/********** main() **********
* Runs every second, only does something when the page changes
*/
function main() {
	// First - check if the page has changed...
	if (!Page.loading() && !$('#secret_golem_check').length) {
		if (!$('#app'+APP+'_nvbar_div_end').length) {
			Page.reload();
			return;
		}
		$('#app'+APP+'_nvbar_div_end').append('<br id="secret_golem_check" style="display:none"/>');
		Page.identify();
		var i;
		for (i in Workers) {
			if (Workers[i].pages && (Workers[i].pages==='*' || (Page.page && Workers[i].pages.indexOf(Page.page)>=0)) && Workers[i].parse) {
//				GM_debug(Workers[i].name + '.parse(false)');
				Workers[i].priv_parse = Workers[i].parse(false);
			} else {
				Workers[i].priv_parse = false;
			}
		}
		Settings.Save('data');
		for (i in Workers) {
			if (Workers[i].priv_parse) {
//				GM_debug(Workers[i].name + '.parse(true)');
				Workers[i].parse(true);
			}
		}
	}
	Queue.run();
}

/********** $(document).ready() **********
* Runs when the page has finished loading, but the external data might still be coming in
*/
$(document).ready(function() {
	Page.identify();
	Settings.Load('data');
	Settings.Load('option');
	if (window.location.href.indexOf('castle_age') >= 0) {
		for (var i in Workers) {
			if (Workers[i].onload) {
				Workers[i].onload();
			}
		}
		main(); // Call once to get the ball rolling...
		window.setInterval(function(){main();},1000);
	}
});

/********** Settings **********
* Used for storing prefs, prefer to use this over GM_set/getValue
* Should never be called by anyone directly - let the main function do it when needed
*/
var Settings = {
	userID: unsafeWindow.Env.user,
	SetValue:function(n,v) {
		switch(typeof v) {
			case 'boolean':
			case 'number':	return GM_setValue(Settings.userID + '.' + n, v);
			case 'string':	return GM_setValue(Settings.userID + '.' + n, '"' + v + '"');
			case 'array':
			case 'object':	return GM_setValue(Settings.userID + '.' + n, v.toSource());
			default:		GM_debug("Unknown variable type: "+n);
		}
		return null;
	},
	GetValue:function(n,d) {
		v = GM_getValue(Settings.userID + '.' + n, d);
		if (typeof v === 'string') {
			if (v.charAt(0) === '"') {
				v = v.replace(/^"|"$/g,'');
			} else if (v.charAt(0) === '(' || v.charAt(0) === '[') {
				if (typeof d === 'array' || typeof d === 'object') {
					v = $.extend(true, {}, d, eval(v));
				} else {
					v = eval(v);
				}
			}
		}
		return v;
	},
	Save:function() { // type (string - 'data'|'option'), worker (object)
		var i, type = 'data', worker = null;
		for (i=0; i<arguments.length; i++) {
			if (typeof arguments[i] === 'object') {
				worker = arguments[i];
			} else if (arguments[i]==='data' || arguments[i]==='option') {
				type = arguments[i];
			}
		}
		if (worker && worker[type]) {
			Settings.SetValue(type + '.' + worker.name, worker[type]);
		} else {
			for (i=0; i<Workers.length; i++) {
				if (Workers[i][type]) {
					Settings.SetValue(type + '.' + Workers[i].name, Workers[i][type]);
				}
			}
		}
	},
	Load:function() { // type (string - 'data'|'option'), worker (object)
		var i, type = 'data', worker = null;
		for (i=0; i<arguments.length; i++) {
			if (typeof arguments[i] === 'object') {
				worker = arguments[i];
			} else if (arguments[i]==='data' || arguments[i]==='option') {
				type = arguments[i];
			}
		}
		if (worker && worker[type]) {
			worker[type] = Settings.GetValue(type + '.' + worker.name, worker[type]);
		} else {
			for (i=0; i<Workers.length; i++) {
				if (Workers[i][type]) {
					Workers[i][type] = Settings.GetValue(type + '.' + Workers[i].name, Workers[i][type]);
				}
			}
		}
	}
};
// Utility functions

// Prototypes to ease functionality

String.prototype.trim = function() {
	return this.replace(/^\s+|\s+$/g, '');
};

String.prototype.filepart = function() {
	var x = this.lastIndexOf('/');
	if (x >= 0) {
		return this.substr(x+1);
	}
	return this;
};

String.prototype.pathpart = function() {
	var x = this.lastIndexOf('/');
	if (x >= 0) {
		return this.substr(0, x+1);
	}
	return this;
};

String.prototype.regex = function(r) {
	var a = this.match(r), i;
	if (a) {
		a.shift();
		for (i=0; i<a.length; i++) {
			if (a[i] && a[i].search(/^[-+]?[0-9]+\.?[0-9]*$/) >= 0) {
				a[i] = parseFloat(a[i]);
			}
		}
		if (a.length===1) {
			return a[0];
		}
	}
	return a;
};

String.prototype.toNumber = function() {
	return parseFloat(this);
};

String.prototype.parseTimer = function() {
	var a = this.split(':'), b = 0, i;
	for (i=0; i<a.length; i++) {
		b = b * 60 + parseInt(a[i],10);
	}
	if (isNaN(b)) {
		b = 9999;
	}
	return b;
};

//Array.prototype.unique = function() { var o = {}, i, l = this.length, r = []; for(i=0; i<l;i++) o[this[i]] = this[i]; for(i in o) r.push(o[i]); return r; };
//Array.prototype.inArray = function(value) {for (var i in this) if (this[i] === value) return true;return false;};

if(typeof GM_debug === 'undefined') {
	GM_debug = function(txt) { if(debug) { GM_log(txt); } };
}

var WorkerByName = function(name) { // Get worker object by Worker.name
	for (var i in Workers) {
		if (Workers[i].name === name) {
			return Workers[i];
		}
	}
	return null;
};

var WorkerById = function(id) { // Get worker object by panel id
	for (var i in Workers) {
		if (Workers[i].priv_id === id) {
			return Workers[i];
		}
	}
	return null;
};

var Divisor = function(number) { // Find a "nice" value that goes into number up to 20 times
	var num = number, step = 1;
	if (num < 20) {
		return 1;
	}
	while (num > 100) {
		num /= 10;
		step *= 10;
	}
	num -= num % 5;
	if ((number / step) > 40) {
		step *= 5;
	} else if ((number / step) > 20) {
		step *= 2.5;
	}
	return step;
};

var length = function(obj) { // Find the number of entries in an object (also works on arrays)
	var l = 0, i;
	if (typeof obj === 'object') {
		for(i in obj) {
			l++;
		}
	} else if (typeof obj === 'array') {
		l = obj.length;
	}
	return l;
};

var unique = function (a) { // Return an array with no duplicates
	var o = {}, i, l = a.length, r = [];
	for(i = 0; i < l; i++) {
		o[a[i]] = a[i];
	}
	for(i in o) {
		r.push(o[i]);
	}
	return r;
};

var addCommas = function(s) { // Adds commas into a string, ignore any number formatting
	var a=s.toString(), r=new RegExp('(-?[0-9]+)([0-9]{3})');
	while(r.test(a)) {
		a = a.replace(r, '$1,$2');
	}
	return a;
};

var findInArray = function(list, value) {
	if (typeof list === 'array' || typeof list === 'object') {
		for (var i in list) {
			if (list[i] === value) {
				return true;
			}
		}
	}
	return false;
};

var getAttDef = function(list, unitfunc, x, count, user) { // Find total att(ack) or def(ense) value from a list of objects (with .att and .def)
	var units = [], attack = 0, defend = 0, x2 = (x==='att'?'def':'att'), i, own;
	for (i in list) {
		unitfunc(units, i, list);
	}
	units.sort(function(a,b) {
		return (list[b][x] + (0.7 * list[b][x2])) - (list[a][x] + (0.7 * list[a][x2]));
	});
	for (i=0; i<units.length; i++) {
		own = typeof list[units[i]].own === 'number' ? list[units[i]].own : 1;
		if (user) {
			if (Math.min(count, own) > 0) {
//				GM_debug('Using: '+Math.min(count, own)+' x '+units[i]+' = '+list[units[i]].toSource());
				if (!list[units[i]].use) {
					list[units[i]].use = {};
				}
				list[units[i]].use[(user+'_'+x)] = Math.min(count, own);
			} else if (list[units[i]].use) {
				delete list[units[i]].use[user+'_'+x];
				if (!length(list[units[i]].use)) {
					delete list[units[i]].use;
				}
			}
		}
		if (count <= 0) {break;}
		own = Math.min(count, own);
		attack += own * list[units[i]].att;
		defend += own * list[units[i]].def;
		count -= own;
	}
	return (x==='att'?attack:(0.7*attack)) + (x==='def'?defend:(0.7*defend));
};

/* Worker Prototype
   ----------------
new Worker(name,pages)
.name			- String, the same as our class name.
.pages			- String, list of pages that we want in the form "town.soldiers keep.stats"
.data			- Object, for public reading, automatically saved
.option			- Object, our options, changed from outide ourselves
.unsortable		- Stops the .display from being sorted in the Queue - added to the front (semi-private) - never use if it has .work(true)

.onload()		- After the script has loaded, but before anything else has run. Data has been filled, but nothing has been run.
				This is the bext place to put default values etc...
.parse(change)	- This can read data from the current page and cannot perform any actions.
				change = false - Not allowed to change *anything*, cannot read from other Workers.
				change = true - Can now change inline and read from other Workers.
				return true - We need to run again with status=1
				return false - We're finished
.work(state)	- Do anything we need to do when it's our turn - this includes page changes.
				state = false - It's not our turn, don't start anything if we can't finish in this one call
				state = true - It's our turn, do everything - Only true if not interrupted
				return true if we need to keep working (after a delay etc)
				return false when someone else can work
.display()		- Create the display object for the settings page.
				All elements of the display are in here, it's called before anything else in the worker.
				The header is taken care of elsewhere.

If there is a work() but no display() then work(false) will be called before anything on the queue, but it will never be able to have focus (ie, read only)
*/
var Workers = [];

function Worker(name,pages) {
	this.id = Workers.push(this);
	this.name = name;
	this.pages = pages;
	this.unsortable = false;
	this.data = {};
	this.option = {};
	this.onload = null;
	this.display = null; //function(added) {return false;};
	this.parse = null; //function(change) {return false;};
	this.work = null; //function(state) {return false;};
	this.priv_parse = false;
	this.priv_since = 0;
	this.priv_id = null;
}
/********** Worker.Config **********
* Has everything to do with the config
* Named with a double dash to ensure it comes early as other workers rely on it's onload() function!
*/
var Config = new Worker('Config');
Config.data = null;
Config.option = {
	display:'block',
	fixed:true
};
Config.panel = null;
Config.onload = function() {
	$('head').append('<link rel="stylesheet" href="http://cloutman.com/css/golem/jquery-ui.css" type="text/css" />');
	var $btn, $golem_config, $newPanel, i;
//<img id="golem_working" src="http://cloutman.com/css/base/images/ui-anim.basic.16x16.gif" style="border:0;float:right;display:none;" alt="Working...">
	Config.panel = $('<div class="golem-config'+(Config.option.fixed?' golem-config-fixed':'')+'"><div class="ui-widget-content" style="display:'+Config.option.display+';"><div class="golem-title">Castle Age Golem v'+VERSION+'<span id="golem_fixed" class="ui-icon ui-icon-pin-'+(Config.option.fixed?'s':'w')+'" style="float:right;margin-top:-2px;"></span></div><div id="golem_buttons" style="margin:4px;"></div><div id="golem_config" style="margin:4px;overflow:hidden;overflow-y:auto;"></div></div></div>');
	$('div.UIStandardFrame_Content').after(Config.panel);
	$('#golem_fixed').click(function(){
			Config.option.fixed ^= true;
			$(this).toggleClass('ui-icon-pin-w ui-icon-pin-s');
			$(this).parent().parent().parent().toggleClass('golem-config-fixed');
			Config.option.active = [];
			Settings.Save('option', Config);
	});
	$golem_config = $('#golem_config');
	for (i in Workers) {
		$golem_config.append(Config.makePanel(Workers[i]));
	}
	$golem_config.sortable({axis:"y"}); //, items:'div', handle:'h3' - broken inside GM
	$('.golem-panel > h3').click(function(event){
//		$(this).parent().toggleClass('golem-panel-show');
//		$(this).toggleClass('ui-corner-all ui-corner-top');
		if ($(this).parent().hasClass('golem-panel-show')) {
			$(this).next().hide('blind',function(){$(this).parent().toggleClass('golem-panel-show');});
		} else {
			$(this).parent().toggleClass('golem-panel-show');
			$(this).next().show('blind');
		}
		Config.option.active = [];
		$('.golem-panel-show').each(function(i,el){Config.option.active.push($(this).attr('id'));});
		Settings.Save('option', Config);
	});
	$golem_config.children('.golem-panel-sortable')
		.draggable({ connectToSortable:'#golem_config', axis:'y', distance:5, scroll:false, handle:'h3', helper:'clone', opacity:0.75, zIndex:100,
refreshPositions:true, stop:function(){Config.updateOptions();} })
		.droppable({ tolerance:'pointer', over:function(e,ui) {
			if (Config.getPlace($(this).attr('id')) < Config.getPlace($(ui.draggable).attr('id'))) {
				$(this).before(ui.draggable);
			} else {
				$(this).after(ui.draggable);
			}
		} });
	for (i in Workers) { // Update all select elements
		if (Workers[i].select) {
			Workers[i].select();
		}
	}
	$('input.golem_addselect').click(function(){
		$('select.golem_multiple', $(this).parent()).append('<option>'+$('select.golem_select', $(this).parent()).val()+'</option>');
		Config.updateOptions();
	});
	$('input.golem_delselect').click(function(){
		$('select.golem_multiple option[selected=true]', $(this).parent()).each(function(i,el){$(el).remove();})
		Config.updateOptions();
	});
	$('input ,textarea, select', $golem_config).change( function(){Config.updateOptions();} );
	//	$(Config.panel).css({display:'block'});
};
Config.makePanel = function(worker) {
	var i, o, x, id, step, show, $head, $panel, display = worker.display, panel = [], txt = [], list = [], options = {
		before: '',
		after: '',
		suffix: '',
		className: '',
		between: 'to',
		size: 7,
		min: 0,
		max: 100
	};
	if (!display) {
		return false;
	}
	worker.priv_id = 'golem_panel_'+worker.name.toLowerCase().replace(/[^0-9a-z]/,'_');
	show = findInArray(Config.option.active, worker.priv_id);
	$head = $('<div id="'+worker.priv_id+'" class="golem-panel'+(worker.unsortable?'':' golem-panel-sortable')+(show?' golem-panel-show':'')+'" name="'+worker.name+'"><h3 class="golem-panel-header "><span class="ui-icon golem-icon"></span>'+worker.name+'<span class="ui-icon golem-locked"></span></h3></div>');
	switch (typeof display) {
		case 'array':
		case 'object':
			for (i in display) {
				txt = [];
				list = [];
				o = $.extend(true, {}, options, display[i]);
				o.real_id = PREFIX + worker.name + '_' + o.id;
				o.value = worker.option[o.id] || null;
				o.alt = (o.alt ? ' alt="'+o.alt+'"' : '');
				if (o.label) {
					txt.push('<span style="float:left;margin-top:2px;">'+o.label.replace(' ','&nbsp;')+'</span>');
					if (o.text || o.checkbox || o.select || o.multiple) {
						txt.push('<span style="float:right;">');
					}
				}
				if (o.before) {
					txt.push(o.before+' ');
				}
				// our different types of input elements
				if (o.info) { // only useful for externally changed
					if (o.id) {
						txt.push('<span id="' + o.real_id + '">' + o.info + '</span>');
					} else {
						txt.push(o.info);
					}
				} else if (o.text) {
					txt.push('<input type="text" id="' + o.real_id + '" size="' + o.size + '" value="' + (o.value || '') + '">');
				} else if (o.checkbox) {
					txt.push('<input type="checkbox" id="' + o.real_id + '"' + (o.value ? ' checked' : '') + '>');
				} else if (o.select) {
					switch (typeof o.select) {
						case 'string':
							o.className = ' class="golem_'+o.select+'"';
							break;
						case 'number':
							step = Divisor(o.select);
							for (x=0; x<=o.select; x+=step) {
								list.push('<option' + (o.value==x ? ' selected' : '') + '>' + x + '</option>');
							}
							break;
						case 'array':
						case 'object':
							for (x in o.select) {
								list.push('<option value="' + o.select[x] + '"' + (o.value==o.select[x] ? ' selected' : '') + '>' + o.select[x] + (o.suffix ? ' '+o.suffix : '') + '</option>');
							}
							break;
					}
					txt.push('<select id="' + o.real_id + '"' + o.className + o.alt + '>' + list.join('') + '</select>');
				} else if (o.multiple) {
					if (typeof o.value === 'array' || typeof o.value === 'object') {
						for (i in o.value) {
							list.push('<option value="'+o.value[i]+'">'+o.value[i]+'</option>');
						}
					}
					txt.push('<select style="width:100%" class="golem_multiple" multiple id="' + o.real_id + '">' + list.join('') + '</select><br>');
					list = [];
					switch (typeof o.multiple) {
						case 'string':
							o.className = ' class="golem_'+o.select+'"';
							break;
						case 'number':
							step = Divisor(o.select);
							for (x=0; x<=o.multiple; x+=step) {
								list.push('<option>' + x + '</option>');
							}
							break;
						case 'array':
							for (x=0; x<o.multiple.length; x++) {
								list.push('<option value="' + o.multiple[x] + '">' + o.multiple[x] + (o.suffix ? ' '+o.suffix : '') + '</option>');
							}
							break;
						case 'object':
							for (x in o.multiple) {
								list.push('<option value="' + x + '">' + o.multiple[x] + (o.suffix ? ' '+o.suffix : '') + '</option>');
							}
							break;
					}
					txt.push('<select class="golem_select">'+list.join('')+'</select><input type="button" class="golem_addselect" value="Add" /><input type="button" class="golem_delselect" value="Del" />');
				}
				if (o.after) {
					txt.push(' '+o.after);
				}
				if (o.label && (o.text || o.checkbox || o.select || o.multiple)) {
					txt.push('</span>');
				}
				panel.push('<div style="clear:both">' + txt.join('') + '</div>');
			}
			$head.append('<div class="golem-panel-content" style="font-size:smaller;">' + panel.join('') + '<div style="clear:both"></div></div>');
			return $head;
//		case 'function':
//			$panel = display();
//			if ($panel) {
//				$head.append($panel);
//				return $head;
//			}
//			return null;
		default:
			return null;
	}
};
Config.updateOptions = function() {
	GM_debug('Options changed');
	// Get order of panels first
	var found = {};
	Queue.option.queue = [];
	$('#golem_config > div').each(function(i,el){
		var name = WorkerById($(el).attr('id')).name;
		if (!found[name]) {
			Queue.option.queue.push(name);
		}
		found[name] = true;
	});
	// Now save the contents of all elements with the right id style
	$('#golem_config :input').each(function(i,el){
		if ($(el).attr('id')) {
			var val, tmp = $(el).attr('id').slice(PREFIX.length).regex(/([^_]*)_(.*)/i);
			if (!tmp) {
				return;
			}
			if ($(el).attr('type') === 'checkbox') {
				WorkerByName(tmp[0]).option[tmp[1]] = $(el).attr('checked');
			} else if ($(el).attr('multiple')) {
				val = [];
				$('option', el).each(function(i,el){ val.push($(el).text()); });
				WorkerByName(tmp[0]).option[tmp[1]] = val;
			} else {
				val = $(el).attr('value') || ($(el).val() || null);
				if (val && val.search(/[^0-9.]/) === -1) {
					val = parseFloat(val);
				}
				WorkerByName(tmp[0]).option[tmp[1]] = val;
			}
		}
	});
	Settings.Save('option');
};
Config.getPlace = function(id) {
	var place = -1;
	$('#golem_config > div').each(function(i,el){
		if ($(el).attr('id') === id && place === -1) {
			place = i;
		}
	});
	return place;
};

/********** Worker.Alchemy **********
* Get all ingredients and recipes
*/
var Alchemy = new Worker('Alchemy', 'keep_alchemy');
Alchemy.data = {
	ingredients:{},
	recipe:{}
};
Alchemy.display = [
	{
		id:'perform',
		label:'Automatically Perform',
		checkbox:true
	},{
		id:'hearts',
		label:'Use Battle Hearts',
		checkbox:true
	}
];
Alchemy.parse = function(change) {
	var ingredients = Alchemy.data.ingredients = {}, recipe = Alchemy.data.recipe = {};
	$('div.ingredientUnit').each(function(i,el){
		var name = $('img', el).attr('src').filepart();
		ingredients[name] = $(el).text().regex(/x([0-9]+)/);
	});
	$('div.alchemyQuestBack,div.alchemyRecipeBack,div.alchemyRecipeBackMonster').each(function(i,el){
		var me = {}, title = $('div.recipeTitle', el).text().trim().replace('RECIPES: ','');
		if (title.indexOf(' (')>0) {title = title.substr(0, title.indexOf(' ('));}
		if ($(el).hasClass('alchemyQuestBack')) {me.type = 'Quest';}
		else if ($(el).hasClass('alchemyRecipeBack')) {me.type = 'Recipe';}
		else if ($(el).hasClass('alchemyRecipeBackMonster')) {me.type = 'Summons';}
		else {me.type = 'wtf';}
		me.ingredients = {};
		$('div.recipeImgContainer', el).parent().each(function(i,el){
			var name = $('img', el).attr('src').filepart();
			me.ingredients[name] = ($(el).text().regex(/x([0-9]+)/) || 1);
		});
		recipe[title] = me;
	});
};
Alchemy.work = function(state) {
	if (!Alchemy.option.perform) {
		return false;
	}
	var found = null, recipe = Alchemy.data.recipe, r, i;
	for (r in recipe) {
		if (recipe[r].type === 'Recipe') {
			found = r;
			for (i in recipe[r].ingredients) {
				if ((!Alchemy.option.hearts && i === 'raid_hearts.gif') || recipe[r].ingredients[i] > (Alchemy.data.ingredients[i] || 0)) {
					found = null;
					break;
				}
			}
			if (found) {break;}
		}
	}
	if (!found) {return false;}
	if (!state) {return true;}
	if (!Page.to('keep_alchemy')) {return true;}
	GM_debug('Alchemy: Perform - '+found);
	$('div.alchemyRecipeBack').each(function(i,el){
		if($('div.recipeTitle', el).text().indexOf(found) >=0) {
			Page.click($('input[type="image"]', el));
			return true;
		}
	});
	return true;
};
/********** Worker.Bank **********
* Auto-banking
*/
var Bank = new Worker('Bank');
Bank.data = null;
Bank.option = {
	general: true,
	above: 10000,
	hand: 0,
	keep: 10000
};
Bank.display = [
	{
		id:'general',
		label:'Use Best General',
		checkbox:true
	},{
		id:'above',
		label:'Bank Above',
		text:true
	},{
		id:'hand',
		label:'Keep in Cash',
		text:true
	},{
		id:'keep',
		label:'Keep in Bank',
		text:true
	}
];
Bank.work = function(state) {
	if (Player.data.cash < Bank.option.above) {
		return false;
	}
	if (!state) {
		return true;
	}
	if (!Bank.stash(Player.data.cash - Math.min(Bank.option.above, Bank.option.hand))) {
		return true;
	}
	return false;
};
Bank.stash = function(amount) {
	if (!amount || !Player.data.cash) {
		return true;
	}
	if (Bank.option.general && !Generals.to('Aeris')) {
		return false;
	}
	if (!Page.to('keep_stats')) {
		return false;
	}
	$('input[name="stash_gold"]').val(Math.min(Player.data.cash, amount));
	Page.click('input[value="Stash"]');
	return true;
};
Bank.retrieve = function(amount) {
	amount -= Player.data.gold;
	if (amount <= 0) {
		return true;
	}
	if ((Player.data.bank - Bank.option.keep) < amount) {
		return true; // Got to deal with being poor...
	}
	if (!Page.to('keep_stats')) {
		return false;
	}
	$('input[name="get_gold"]').val(amount);
	Page.click('input[value="Retrieve"]');
	return true;
};
Bank.worth = function() { // Anything withdrawing should check this first!
	return Player.data.cash + Math.max(0,Player.data.bank - Bank.option.keep);
};

/********** Worker.Battle **********
* Battling other players (NOT raid)
*/
var Battle = new Worker('Battle', 'battle_battle battle_rank');
Battle.data = {
	user: {},
	rank: {},
	points: {}
};
Battle.option = {
	general: true,
	points: true,
	monster: true,
	type: 'Invade'
};
Battle.display = [
	{
		label:'NOTE: Attacks at a loss up to 5 times more than a win'
	},{
		id:'general',
		label:'Use Best General',
		checkbox:true
	},{
		id:'type',
		label:'Battle Type',
		select:['Invade', 'Duel']
	},{
		id:'points',
		label:'Always Get Demi-Points',
		checkbox:true
	},{
		id:'monster',
		label:'Fight Monsters First',
		checkbox:true
	}
];
Battle.parse = function(change) {
	var i, data, uid, info;
	if (Page.page === 'battle_battle') {
		data = Battle.data.user;
		for (i in data) {
			if (Player.data.rank - data[i].rank >= 5) {
				delete data[i]; // Forget low rank - no points
			}
		}
		if (Battle.data.attacking) {
			uid = Battle.data.attacking;
			if ($('div.results').text().match(/You cannot battle someone in your army/i)) {
				delete data[uid];
			} else if ($('div.results').text().match(/Your opponent is dead or too weak/i)) {
				data[uid].dead = Date.now();
			} else if ($('img[src*="battle_victory"]').length) {
				data[uid].win = (data[uid].win || 0) + 1;
			} else if ($('img[src*="battle_defeat"]').length) {
				data[uid].loss = (data[uid].loss || 0) + 1;
			} else {
				// Some other message - probably be a good idea to remove the target or something
				// delete data[uid];
			}
			Battle.data.attacking = null;
		}
		Battle.data.points = $('#app'+APP+'_app_body table.layout table table').prev().text().replace(/[^0-9\/]/g ,'').regex(/([0-9]+)\/10([0-9]+)\/10([0-9]+)\/10([0-9]+)\/10([0-9]+)\/10/);
		$('#app'+APP+'_app_body table.layout table table tr:even').each(function(i,el){
			var uid = $('img[uid!==""]', el).attr('uid'), info = $('td.bluelink', el).text().trim().regex(/Level ([0-9]+) (.*)/i);
			if (!uid || !info) {
				return;
			}
			if (!data[uid]) {
				data[uid] = {};
			}
			data[uid].name = $('a', el).text().trim();
			data[uid].level = info[0];
			data[uid].rank = Battle.rank(info[1]);
			data[uid].army = $('td.bluelink', el).next().text().regex(/([0-9]+)/);
			data[uid].align = $('img[src*="graphics/symbol_"]', el).attr('src').regex(/symbol_([0-9])/i);
		});
	} else if (Page.page === 'battle_rank') {
		data = Battle.data.rank = {0:{name:'Squire',points:0}};
		$('tr[height="23"]').each(function(i,el){
			info = $(el).text().regex(/Rank ([0-9]+) - (.*)\s*([0-9]+)/i);
			data[info[0]] = {name:info[1], points:info[2]};
		});
	}
//	GM_debug('Battle: '+Battle.data.toSource());
	return false;
};
Battle.work = function(state) {
	if (Player.data.health <= 10 || Queue.burn.stamina < 1) {
		return false;
	}
	var i, points = [], list = [], user = Battle.data.user, uid, $form;
	if (Battle.option.points) {
		for (i=0; i<Battle.data.points.length; i++) {
			if (Battle.data.points[i] < 10) {
				points[i+1] = true;
			}
		}
	}
	if ((!Battle.option.points || !points.length) && Battle.option.monster && Monster.uid) {
		return false;
	}
	for (i in user) {
		if (user[i].dead && user[i].dead + 1800000 < Date.now()) {
			continue; // If they're dead ignore them for 3m * 10hp = 30 mins
		}
		if ((user[i].win || 0) - (user[i].loss || 0) < 5) {
			continue; // Don't attack someone who wins more often
		}
		if (!Battle.option.points || !points.length || typeof points[user[i].align] !== 'undefined') {
			list.push(i);
		}
	}
	if (!list.length) {
		return false;
	}
	if (!state) {
		return true;
	}
	if (Battle.option.general && !Generals.to(Generals.best(Battle.option.type)) || !Page.to('battle_battle')) {
		return true;
	}
	uid = list[Math.floor(Math.random() * list.length)];
	GM_debug('Battle: Wanting to attack '+user[uid].name+' ('+uid+')');
	$form = $('form input[alt="'+Battle.option.type+'"]').first().parents('form');
	if (!$form.length) {
		GM_log('Battle: Unable to find attack buttons, forcing reload');
		Page.to('index');
		return false;
	}
	Battle.data.attacking = uid;
	$('input[name="target_id"]', $form).attr('value', uid);
	Page.click($('input[type="image"]', $form));
	return true;
};
Battle.rank = function(name) {
	for (var i in Battle.data.rank) {
		if (Battle.data.rank[i].name === name) {
			return parseInt(i, 10);
		}
	}
	return 0;
};

/********** Worker.Blessing **********
* Automatically receive blessings
*/
var Blessing = new Worker('Blessing', 'oracle_demipower');
Blessing.option = {
	which: 'Stamina'
};
Blessing.which = ['None', 'Energy', 'Attack', 'Defense', 'Health', 'Stamina'];
Blessing.display = [{
	id:'which',
	label:'Which',
	select:Blessing.which
}];
Blessing.parse = function(change) {
	var result = $('div.results'), time;
	if (result.length) {
		time = result.text().regex(/Please come back in: ([0-9]+) hours and ([0-9]+) minutes/i);
		if (time && time.length) {
			Blessing.data.when = Date.now() + (((time[0] * 60) + time[1] + 1) * 60000);
		} else if (result.text().match(/You have paid tribute to/i)) {
			Blessing.data.when = Date.now() + 86460000; // 24 hours and 1 minute
		}
	}
	return false;
};
Blessing.work = function(state) {
	if (!Blessing.option.which || Blessing.option.which === 'None' || Date.now() <= Blessing.data.when) {
		return false;
	}
	if (!state) {
		return true;
	}
	if (!Page.to('oracle_demipower')) {
		return true;
	}
	Page.click('#app'+APP+'_symbols_form_'+Blessing.which.indexOf(Blessing.option.which)+' input.imgButton');
	return false;
};

/********** Worker.Dashboard **********
* Displays statistics and other useful info
*/
var Dashboard = new Worker('Dashboard', '*');
Dashboard.parse = function(change) {
//	if (!change) return true; // Ok, so we're lying...
	if (!$('#golem_dashboard').length) {
		$('#app'+APP+'_nvbar_nvl').css({width:'760px', 'padding-left':0, 'margin':'auto'});
		$('<div><div class="nvbar_start"></div><div class="nvbar_middle"><a id="golem_toggle_dash"><span class="hover_header">Dashboard</span></a></div><div class="nvbar_end"></div></div><div><div class="nvbar_start"></div><div class="nvbar_middle"><a id="golem_toggle_config"><span class="hover_header">Config</span></a></div><div class="nvbar_end"></div></div>').prependTo('#app'+APP+'_nvbar_nvl > div:last-child');
		$('<div id="golem_dashboard" style="position:absolute;width:600px;height:185px;margin:0;border-left:1px solid black;border-right:1px solid black;padding4px;overflow:hidden;overflow-y:auto;background:white;z-index:1;display:none;">Dashboard...</div>').prependTo('#app'+APP+'_main_bn_container');
		$('#golem_toggle_dash').click(function(){$('#golem_dashboard').toggle('drop');});
		$('#golem_toggle_config').click(function(){$('.golem-config > div').toggle(Config.option.fixed?null:'blind');});
	}
	return false;
};

/********** Worker.Debug() **********
* Turns on/off the debug flag - doesn't save
*/
var Debug = new Worker('Debug');
Debug.data = null;
Debug.option = null;
Debug.onload = function() {
	if (!debug) {
		return null; // Only add the button if debug is default on
	}
	var $btn = $('<button>Debug</button>')
		.button()
		.click(function(){debug^=true;GM_log('Debug '+(debug?'on':'off'));$('span', this).css('text-decoration', (debug?'none':'line-through'));});
	$('#golem_buttons').append($btn);
	return null;
};

/********** Worker.Generals **********
* Updates the list of Generals
* Finds best General for other classes
* *** Need to take into account army size and real stats for attack and defense
*/
var Generals = new Worker('General', 'heroes_generals');
Generals.data = {};
Generals.best_id = null;
Generals.parse = function(change) {
	var data, i, attack, defend, army, gen_att, gen_def, iatt = 0, idef = 0, datt = 0, ddef = 0, listpush = function(list,i){list.push(i);};
	if (!change) {
		data = {};
		$('#app'+APP+'_generalContainerBox2 > div > div.generalSmallContainer2').each(function(i,el){
			var $child = $(el).children(), name = $child.eq(0).text().trim();
			if (name) {
				data[name] = {};
				data[name].img		= $child.eq(1).find('input.imgButton').attr('src').filepart();
				data[name].att		= $child.eq(2).children().eq(0).text().regex(/([0-9]+)/);
				data[name].def		= $child.eq(2).children().eq(1).text().regex(/([0-9]+)/);
				data[name].level	= $child.eq(3).text().regex(/Level ([0-9]+)/i); // Might only be 4 so far, however...
				data[name].skills	= $($child.eq(4).html().replace(/\<br\>|\s+|\n/g,' ')).text().trim();
			}
		});
		if (length(data) >= length(Generals.data)) { // Assume we never sell!
			Generals.data = data;
			Generals.select();
		} else {
			Page.to('heroes_generals', ''); // Force reload
		}
	} else if (length(Town.data.invade)) {
		data = Generals.data;
		for (i in data) {
			attack = Player.data.attack + (data[i].skills.regex(/([-+]?[0-9]+) Player Attack/i) || 0) + (data[i].skills.regex(/Increase Player Attack by ([0-9]+)/i) || 0);
			defend = Player.data.defense + (data[i].skills.regex(/([-+]?[0-9]+) Player Defense/i) || 0) + (data[i].skills.regex(/Increase Player Defense by ([0-9]+)/i) || 0);
			army = (data[i].skills.regex(/Increases? Army Limit to ([0-9]+)/i) || 501);
			gen_att = getAttDef(Generals.data, listpush, 'att', Math.floor(army / 5));
			gen_def = getAttDef(data, listpush, 'def', Math.floor(army / 5));
			data[i].invade = {
				att: Math.floor(Town.data.invade.attack + data[i].att + (data[i].def * 0.7) + ((attack + (defend * 0.7)) * army) + gen_att),
				def: Math.floor(Town.data.invade.defend + data[i].def + (data[i].att * 0.7) + ((defend + (data[i].skills.regex(/([-+]?[0-9]+) Defense when attacked/i) || 0) + (attack * 0.7)) * army) + gen_def)
			};
			data[i].duel = {
				att: Math.floor(Town.data.duel.attack + data[i].att + (data[i].def * 0.7) + attack + (defend * 0.7)),
				def: Math.floor(Town.data.duel.defend + data[i].def + (data[i].att * 0.7) + defend + (attack * 0.7))
			};
		}
		for (i in Generals.data) {
			iatt = Math.max(iatt, Generals.data[i].invade.att);
			idef = Math.max(idef, Generals.data[i].invade.def);
			datt = Math.max(datt, Generals.data[i].duel.att);
			ddef = Math.max(ddef, Generals.data[i].duel.def);
		}
		$('#app'+APP+'_generalContainerBox2 > div > div.generalSmallContainer2').each(function(i,el){
			var $child = $(el).children(), name = $child.eq(0).text().trim();
			$child.eq(1).prepend('<div style="position:absolute;margin-left:8px;margin-top:2px;font-size:smaller;text-align:left;z-index:100;color:#ffd200;text-shadow:black 1px 1px 2px;"><strong>Invade</strong><br>&nbsp;&nbsp;&nbsp;Atk: '+(data[name].invade.att===iatt?'<span style="font-weight:bold;color:#00ff00;">':'')+addCommas(data[name].invade.att)+(data[name].invade.att===iatt?'</span>':'')+'<br>&nbsp;&nbsp;&nbsp;Def: '+(data[name].invade.def===idef?'<span style="font-weight:bold;color:#00ff00;">':'')+addCommas(data[name].invade.def)+(data[name].invade.def===idef?'</span>':'')+'<br><strong>Duel</strong><br>&nbsp;&nbsp;&nbsp;Atk: '+(data[name].duel.att===datt?'<span style="font-weight:bold;color:#00ff00;">':'')+addCommas(data[name].duel.att)+(data[name].duel.att===datt?'</span>':'')+'<br>&nbsp;&nbsp;&nbsp;Def: '+(data[name].duel.def===ddef?'<span style="font-weight:bold;color:#00ff00;">':'')+addCommas(data[name].duel.def)+(data[name].duel.def===ddef?'</span>':'')+'<br></div>');
		});
	}
	return true;
};
Generals.to = function(name) {
	if (!name || Player.data.general === name || name === 'any') {
		return true;
	}
	if (!Generals.data[name]) {
		GM_log('General "'+name+'" requested but not found!');
		return true; // Not found, so fake it
	}
	if (!Page.to('heroes_generals')) {
		return false;
	}
	GM_debug('Changing to General '+name);
	Page.click('input[src$="'+Generals.data[name].img+'"]');
	return false;
};
Generals.best = function(type) {
	if (!Generals.data) {
		return 'any';
	}
	var rx = '', best = null, bestval = 0, i, value;
	switch(type.toLowerCase()) {
		case 'cost':		rx = /Decrease Soldier Cost by ([0-9]+)/i; break;
		case 'stamina':		rx = /Increase Max Stamina by ([0-9]+)|\+([0-9]+) Max Stamina/i; break;
		case 'energy':		rx = /Increase Max Energy by ([0-9]+)|\+([0-9]+) Max Energy/i; break;
		case 'income':		rx = /Increase Income by ([0-9]+)/i; break;
		case 'influence':	rx = /Bonus Influence ([0-9]+)/i; break;
		case 'attack':		rx = /([-+]?[0-9]+) Player Attack/i; break;
		case 'defense':		rx = /([-+]?[0-9]+) Player Defense/i; break;
		case 'invade':
			for (i in Generals.data) {
				if (!best || (Generals.data[i].invade && Generals.data[i].invade.att > Generals.data[best].invade.att)) {
					best = i;
				}
			}
			return (best || 'any');
		case 'duel':
			for (i in Generals.data) {
				if (!best || (Generals.data[i].duel && Generals.data[i].duel.att > Generals.data[best].duel.att)) {
					best = i;
				}
			}
			return (best || 'any');
		case 'defend':
			for (i in Generals.data) {
				if (!best || (Generals.data[i].duel && Generals.data[i].duel.def > Generals.data[best].duel.def)) {
					best = i;
				}
			}
			return (best || 'any');
		case 'under level 4':
			if (Generals.data[Player.data.general] && Generals.data[Player.data.general].level < 4) {
				return Player.data.general;
			}
			return Generals.random(false);
		default:
			return 'any';
	}
	for (i in Generals.data) {
		value = Generals.data[i].skills.regex(rx);
		if (value) {
			if (!best || value>bestval) {
				best = i;
				bestval = value;
			}
		}
	}
	if (best) {
		GM_debug('Best general found: '+best);
	}
	return best;
};
Generals.random = function(level4) { // Note - true means *include* level 4
	var i, list = [];
	for (i in Generals.data) {
		if (level4) {
			list.push(i);
		} else if (Generals.data[i].level < 4) {
			list.push(i);
		}
	}
	if (list.length) {
		return list[Math.floor(Math.random()*list.length)];
	} else {
		return 'any';
	}
};
Generals.list = function(opts) {
	var i, value, list = [];
	if (!opts) {
		for (i in Generals.data) {
			list.push(i);
		}
		list.sort();
	} else if (opts.find) {
		for (i in Generals.data) {
			if (Generals.data[i].skills.indexOf(opts.find) >= 0) {
				list.push(i);
			}
		}
	} else if (opts.regex) {
		for (i in Generals.data) {
			value = Generals.data[i].skills.regex(opts.regex);
			if (value) {
				list.push([i, value]);
			}
		}
		list.sort(function(a,b) {
			return b[1] - a[1];
		});
//		for (var i in list) list[i] - list[i][0];
	}
	list.unshift('any');
	return list;
};
Generals.select = function() {
	$('select.golem_generals').each(function(a,el){
		$(el).empty();
		var i, tmp = $(el).attr('id').slice(PREFIX.length).regex(/([^_]*)_(.*)/i), value = tmp ? WorkerByName(tmp[0]).option[tmp[1]] : null, list = Generals.list();
		for (i in list) {
			$(el).append('<option value="'+list[i]+'"'+(list[i]===value ? ' selected' : '')+'>'+list[i]+'</value>');
		}
	});
};

/********** Worker.Gift() **********
* Auto accept gifts and return if needed
* *** Needs to talk to Alchemy to work out what's being made
*/
var Gift = new Worker('Gift', 'index army_invite army_gifts');
Gift.data = {
	uid: [],
	todo: {},
	gifts: {}
};
Gift.display = [
	{
		label:'Work in progress...'
	},{
		id:'type',
		label:'Return Gifts',
		select:['None', 'Random', 'Same as Received']
	}
];
Gift.lookup = {
	'eq_gift_mystic_mystery.jpg':	'Mystic Armor',
	'eq_drakehelm_mystery.jpg':		'Drake Helm',
	'gift_angel_mystery2.jpg':		'Battle Of Dark Legion',
	'alchemy_serpent_mystery.jpg':	'Serpentine Shield',
	'alchemy_horn_mystery.jpg':		'Poseidons Horn',
	'gift_sea_egg_mystery.jpg':		'Sea Serpent',
	'gift_egg_mystery.jpg':			'Dragon',
	'gift_druid_mystery.jpg':		'Whisper Bow',
	'gift_armor_mystery.jpg':		'Golden Hand',
	'mystery_frost_weapon.jpg':		'Frost Tear Dagger',
	'eq_mace_mystery.jpg':			'Morning Star'
};
Gift.parse = function(change) {
	if (change) {
		return false;
	}
	var uid, gifts;
	if (Page.page === 'index') {
		// If we have a gift waiting it doesn't matter from whom as it gets parsed on the right page...
		if (!Gift.data.uid.length && $('div.result').text().indexOf('has sent you a gift') >= 0) {
			Gift.data.uid.push(1);
		}
	} else if (Page.page === 'army_invite') {
		// Accepted gift first
		GM_debug('Gift: Checking for accepted');
		if (Gift.data.lastgift) {
			if ($('div.result').text().indexOf('accepted the gift') >= 0) {
				uid = Gift.data.lastgift;
				if (!Gift.data.todo[uid].gifts) {
					Gift.data.todo[uid].gifts = [];
				}
				Gift.data.todo[uid].gifts.push($('div.result img').attr('src').filepart());
				Gift.data.lastgift = null;
			}
		}
		// Check for gifts
		GM_debug('Gift: Checking for new gift to accept');
		uid = Gift.data.uid = [];
		if ($('div.messages').text().indexOf('gift') >= 0) {
			GM_debug('Gift: Found gift div');
			$('div.messages img').each(function(i,el) {
				uid.push($(el).attr('uid'));
				GM_debug('Gift: Adding gift from '+$(el).attr('uid'));
			});
		}
	} else if (Page.page === 'army_gifts') {
		gifts = Gift.data.gifts = {};
//		GM_debug('Gifts found: '+$('#app'+APP+'_giftContainer div[id^="app'+APP+'_gift"]').length);
		$('#app'+APP+'_giftContainer div[id^="app'+APP+'_gift"]').each(function(i,el){
//			GM_debug('Gift adding: '+$(el).text()+' = '+$('img', el).attr('src'));
			var id = $('img', el).attr('src').filepart(), name = $(el).text().trim().replace('!','');
			if (!gifts[id]) {
				gifts[id] = {};
			}
			gifts[id].name = name;
			if (Gift.lookup[name]) {
				gifts[id].create = Gift.lookup[name];
			}
		});
	}
	return false;
};
Gift.work = function(state) {
	if (!state) {
		if (!Gift.data.uid.length) {
			return false;
		}
		return true;
	}
	if (Gift.data.uid.length) { // Receive before giving
		if (!Page.to('army_invite')) {
			return true;
		}
		var uid = Gift.data.uid.shift();
		if (!Gift.data.todo[uid]) {
			Gift.data.todo[uid] = {};
		}
		Gift.data.todo[uid].time = Date.now();
		Gift.data.lastgift = uid;
		GM_debug('Gift: Accepting gift from '+uid);
		if (!Page.to('army_invite', '?act=acpt&rqtp=gift&uid=' + uid) || Gift.data.uid.length > 0) {
			return true;
		}
	}
	Page.to('keep_alchemy');
	return false;
};

/********** Worker.Heal **********
* Auto-Heal above a stamina level
* *** Needs to check if we have enough money (cash and bank)
*/
var Heal = new Worker('Heal');
Heal.data = null;
Heal.option = {
	stamina: 0,
	health: 0
};
Heal.display = [
	{
		id:'stamina',
		label:'Heal Above',
		after:'stamina',
		select:'stamina'
	},{
		id:'health',
		label:'...And Below',
		after:'health',
		select:'health'
	}
];
Heal.work = function(state) {
	if (Player.data.health >= Player.data.maxhealth || Player.data.stamina < Heal.option.stamina || Player.data.health >= Heal.option.health) {
		return false;
	}
	if (!state) {
		return true;
	}
	if (!Page.to('keep_stats')) {
		return true;
	}
	GM_debug('Heal: Healing...');
	if ($('input[value="Heal Wounds"]').length) {
		Page.click('input[value="Heal Wounds"]');
	} else {
		GM_log('Danger Danger Will Robinson... Unable to heal!');
	}
	return false;
};

/********** Worker.Idle **********
* Set the idle general
* Keep focus for disabling other workers
*/
var Idle = new Worker('Idle');
Idle.data = null;
Idle.option = {
	general: 'any',
	index: 'Daily',
	alchemy: 'Daily',
	quests: 'Never',
	town: 'Never',
	battle: 'Daily'
};
Idle.when = ['Never', 'Hourly', '2 Hours', '6 Hours', '12 Hours', 'Daily', 'Weekly'];
Idle.display = [
	{
		label:'<strong>NOTE:</strong> Any workers below this will <strong>not</strong> run!<br>Use this for disabling workers you do not use.'
	},{
		id:'general',
		label:'Idle General',
		select:'generals'
	},{
		label:'Check Pages:'
	},{
		id:'index',
		label:'Home Page',
		select:Idle.when
	},{
		id:'alchemy',
		label:'Alchemy',
		select:Idle.when
	},{
		id:'quests',
		label:'Quests',
		select:Idle.when
	},{
		id:'town',
		label:'Town',
		select:Idle.when
	},{
		id:'battle',
		label:'Battle',
		select:Idle.when
	}
];

Idle.work = function(state) {
	var i, p, time, pages = {
		index:['index'],
		alchemy:['keep_alchemy'],
		quests:['quests_quest1', 'quests_quest2', 'quests_quest3', 'quests_quest4', 'quests_quest5', 'quests_quest6', 'quests_demiquests', 'quests_atlantis'],
		town:['town_soldiers', 'town_blacksmith', 'town_magic', 'town_land'],
		battle:['battle_battle']
	}, when = { 'Never':0, 'Hourly':3600000, '2 Hours':7200000, '6 Hours':21600000, '12 Hours':43200000, 'Daily':86400000, 'Weekly':604800000 };
	if (!state) {
		return true;
	}
	if (!Generals.to(Idle.option.general)) {
		return true;
	}
	for (i in pages) {
		if (!when[Idle.option[i]]) {
			continue;
		}
		time = Date.now() - when[Idle.option[i]];
		for (p=0; p<pages[i].length; p++) {
			if (!Page.data[pages[i][p]] || Page.data[pages[i][p]] < time) {
				if (!Page.to(pages[i][p])) {
					return true;
				}
			}
		}
	}
	return true;
};

/********** Worker.Income **********
* Auto-general for Income, also optional bank
* User selectable safety margin - at default 5 sec trigger it can take up to 14 seconds (+ netlag) to change
*/
var Income = new Worker('Income');
Income.data = null;
Income.option = {
	general: true,
	bank: true,
	margin: 30
};
Income.display = [
	{
		id:'general',
		label:'Use Best General',
		checkbox:true
	},{
		id:'bank',
		label:'Automatically Bank',
		checkbox:true
	},{
		id:'margin',
		label:'Safety Margin',
		select:[15,30,45,60],
		suffix:'seconds'
	}
];

Income.work = function(state) {
	if (!Income.option.margin) {
		return false;
	}
	var when = new Date();
	when = Player.data.cash_time - (when.getSeconds() + (when.getMinutes() * 60));
	if (when < 0) {
		when += 3600;
	}
//	GM_debug('Income: '+when+', Margin: '+Income.option.margin);
	if (when > Income.option.margin) {
		if (state && Income.option.bank) {
			return Bank.work(true);
		}
		return false;
	}
	if (!state) {
		return true;
	}
	if (Income.option.general && !Generals.to(Generals.best('income'))) {
		return true;
	}
	GM_debug('Income: Waiting for Income... ('+when+' seconds)');
	return true;
};

/********** Worker.Monster **********
* Automates Monster
*/
var Monster = new Worker('Monster', 'keep_monster keep_monster_active');
Monster.option = {
	fortify: 50,
	choice: 'Random'
};
Monster.display = [
	{
		label:'Work in progress...'
	},{
		id:'fortify',
		label:'Fortify Below',
		select:[10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
		after:'%'
	},{
		label:'Random only (for now)...'
	},{
		id:'choice',
		label:'Attack',
		select:['Random', 'Strongest', 'Weakest']
	}
];
Monster.uid = null;
Monster.parse = function(change) {
	var i, user, $health, $defense, damage;
	if (Page.page === 'keep_monster_active') { // In a monster
//	if ($('input[src$="attack_monster_button2.jpg"]').length || $('input[src$="attack_monster_button3.jpg"]').length) { // In a monster
		user = $('img[linked="true"][size="square"]').attr('uid');
		$health = $('img[src$="monster_health_background.jpg"]').parent();
		Monster.data[user].health = Math.ceil($health.width() / $health.parent().width() * 100);
		if ($('img[src$="seamonster_ship_health.jpg"]').length) {
			$defense = $('img[src$="seamonster_ship_health.jpg"]').parent();
			Monster.data[user].defense = Math.ceil($defense.width() / ($defense.width() + $defense.next().width()) * 100);
		}
		Monster.data[user].timer = $('#app'+APP+'_monsterTicker').text().parseTimer();
		damage = {};
		$('td.dragonContainer table table a[href^="http://apps.facebook.com/castle_age/keep.php?user="]').each(function(i,el){
			var uid = $(el).attr('href').regex(/user=([0-9]+)/i);
			damage[uid] = parseInt($(el).parent().next().text().replace(/[^0-9]/g,''), 10);
		});
		Monster.data[user].damage = damage;
//		GM_debug('Raid: '+Raid.data[user].toSource());
	} else if (Page.page === 'keep_monster') { // Check monster list
		for (i in Monster.data) {
			Monster.data[i].state = null;
		}
		$('img[src*="dragon_list_btn_"]').each(function(i,el){
			var user = $(el).parent().attr('href').regex(/user=([0-9]+)/i);
			if (!Monster.data[user]) {
				Monster.data[user] = {};
			}
			switch($(el).attr('src').regex(/dragon_list_btn_([0-9])/)) {
				case 2: Monster.data[user].state = 'reward'; break;
				case 3: Monster.data[user].state = 'engage'; break;
				case 4: Monster.data[user].state = 'complete'; break;
				default: Monster.data[user].state = 'unknown'; break; // Should probably delete, but keep it on the list...
			}
			switch($(el).parent().parent().parent().prev().prev().html().regex(/graphics\/(.*)\./i)) {
				case 'castle_siege_list':	Monster.data[user].type = 'legion'; break;
				case 'stone_giant_list':	Monster.data[user].type = 'colossus'; break;
				case 'seamonster_list_red':	Monster.data[user].type = 'serpent'; break;
				case 'deathrune_list2':		Monster.data[user].type = 'raid'; break;
				default: Monster.data[user].type = 'unknown'; break;
			}
		});
		for (i in Monster.data) {
			if (!Monster.data[i].state) {
				delete Monster.data[i];
			}
		}
	}
	return false;
};
Monster.work = function(state) {
	var list = [], uid, btn, i;
	if (!state) {
		Monster.uid = null;
	}
	if (!length(Monster.data) || Player.data.health <= 10) {
		return false;
	}
	if (!Monster.uid || !Monster.data[Monster.uid] || Monster.data[Monster.uid] !== 'engage') {
		Monster.uid = null;
		for (i in Monster.data) {
			if (Monster.data[i].state === 'engage') {
				list.push(i);
			}
		}
		if (!list.length) {
			return false;
		}
		Monster.uid = list[Math.floor(Math.random()*list.length)];
	}
	if (Queue.burn.stamina < 5) {
		if (Queue.burn.energy < 10 || typeof Monster.data[Monster.uid].defense === 'undefined' || Monster.data[Monster.uid].defense >= Monster.option.fortify) {
			return false;
		}
	}
	if (!state) {
		return true;
	}
	if (Monster.data[Monster.uid].defense && Monster.data[Monster.uid].defense <= Monster.option.fortify && Queue.burn.energy >= 10) {
		if (!Generals.to(Generals.best('defend'))) {
			return true;
		}
		GM_debug('Monster: Fortify '+Monster.uid);
		btn = $('input[src$="attack_monster_button3.jpg"]:first');
	} else {
		if (!Generals.to(Generals.best('duel'))) {
			return true;
		}
		GM_debug('Monster: Attack '+Monster.uid);
		btn = $('input[src$="attack_monster_button2.jpg"]:first');
	}
	if (!btn.length && !Page.to('keep_monster', '?user='+Monster.uid+'&mpool=3')) {
		return true; // Reload if we can't find the button
	}
	Page.click(btn);
	return true;
};

/********** Worker.Page() **********
* All navigation including reloading
*/
var Page = new Worker('Page');
Page.unsortable = true;
Page.option = {
	timeout: 15,
	retry: 5
};
Page.page = '';
Page.last = null; // Need to have an "auto retry" after a period
Page.lastclick = null;
Page.when = null;
Page.retry = 0;
Page.checking = true;
Page.display = [
	{
		id:'timeout',
		label:'Retry after',
		select:[10, 15, 30, 60],
		after:'seconds'
	},{
		id:'retry',
		label:'Reload after',
		select:[2, 3, 5, 10],
		after:'tries'
	}
];
Page.work = function(state) {
	if (!Page.checking) {
		return false;
	}
	var i, l, list, found = null;
	for (i=0; i<Workers.length && !found; i++) {
		if (!Workers[i].pages || Workers[i].pages==='*') {
			continue;
		}
		list = Workers[i].pages.split(' ');
		for (l=0; l<list.length; l++) {
			if (Page.pageNames[list[l]] && !Page.data[list[l]] && list[l].indexOf('_active') === -1) {
				found = list[l];
				break;
			}
		}
	}
	if (!state) {
		if (found) {
			return true;
		}
		Page.checking = false;
		return false;
	}
	if (found && !Page.to(found)) {
		return true;
	}
	return false;
};
Page.pageNames = {
	index:					{url:'index.php', image:null},
	quests_quest:			{url:'quests.php', image:'tab_quest_on.gif'}, // If we ever get this then it means a new land...
	quests_quest1:			{url:'quests.php?land=1', image:'land_fire_sel.gif'},
	quests_quest2:			{url:'quests.php?land=2', image:'land_earth_sel.gif'},
	quests_quest3:			{url:'quests.php?land=3', image:'land_mist_sel.gif'},
	quests_quest4:			{url:'quests.php?land=4', image:'land_water_sel.gif'},
	quests_quest5:			{url:'quests.php?land=5', image:'land_demon_realm_sel.gif'},
	quests_quest6:			{url:'quests.php?land=6', image:'land_undead_realm_sel.gif'},
	quests_demiquests:		{url:'symbolquests.php', image:'demi_quest_on.gif'},
	quests_atlantis:		{url:'monster_quests.php', image:'tab_atlantis_on.gif'},
	battle_battle:			{url:'battle.php', image:'battle_on.gif'},
	battle_training:		{url:'battle_train.php', image:'training_grounds_on_new.gif'},
	battle_rank:			{url:'battlerank.php', image:'tab_battle_rank_on.gif'},
	battle_raid:			{url:'raid.php', image:'tab_raid_on.gif'},
	heroes_heroes:			{url:'mercenary.php', image:'tab_heroes_on.gif'},
	heroes_generals:		{url:'generals.php', image:'tab_generals_on.gif'},
	town_soldiers:			{url:'soldiers.php', image:'tab_soldiers_on.gif'},
	town_blacksmith:		{url:'item.php', image:'tab_black_smith_on.gif'},
	town_magic:				{url:'magic.php', image:'tab_magic_on.gif'},
	town_land:				{url:'land.php', image:'tab_land_on.gif'},
	oracle_oracle:			{url:'oracle.php', image:'oracle_on.gif'},
	oracle_demipower:		{url:'symbols.php', image:'demi_on.gif'},
	oracle_treasurealpha:	{url:'treasure_chest.php', image:'tab_treasure_alpha_on.gif'},
	oracle_treasurevanguard:{url:'treasure_chest.php?treasure_set=alpha', image:'tab_treasure_vanguard_on.gif'},
	keep_stats:				{url:'keep.php?user='+userID, image:'tab_stats_on.gif'},
	keep_eliteguard:		{url:'party.php?user='+userID, image:'tab_elite_guard_on.gif'},
	keep_achievements:		{url:'achievements.php', image:'tab_achievements_on.gif'},
	keep_alchemy:			{url:'alchemy.php', image:'tab_alchemy_on.gif'},
	keep_monster:			{url:'battle_monster.php', image:'tab_monster_on.jpg'},
	keep_monster_active:	{url:'battle_monster.php', image:'dragon_view_more.gif'},
	army_invite:			{url:'army.php', image:'invite_on.gif'},
	army_gifts:				{url:'gift.php', image:null},
	army_viewarmy:			{url:'army_member.php', image:'view_army_on.gif'},
	army_sentinvites:		{url:'army_reqs.php', image:'sent_invites_on.gif'}
};
Page.identify = function() {
	Page.page = '';
	$('#app'+APP+'_app_body img').each(function(i,el){
		var p, filename = $(el).attr('src').filepart();
		for (p in Page.pageNames) {
			if (filename === Page.pageNames[p].image) {
				Page.page = p; return;
			}
		}
	});
	if ($('#app'+APP+'_indexNewFeaturesBox').length) {
		Page.page = 'index';
	} else if ($('div[style*="giftpage_title.jpg"]').length) {
		Page.page = 'army_gifts';
	}
	if (Page.page !== '') {
		Page.data[Page.page] = Date.now();
	}
//	GM_debug('Page.identify("'+Page.page+'")');
	return Page.page;
};
Page.to = function(page, args) {
	if (page === Page.page && typeof args === 'undefined') {
		return true;
	}
	if (!args) {
		args = '';
	}
	if (page && Page.pageNames[page] && Page.pageNames[page].url) {
		Page.clear();
		Page.last = Page.pageNames[page].url+args;
		Page.when = Date.now();
		GM_debug('Navigating to '+Page.last+' ('+Page.pageNames[page].url+')');
		if (unsafeWindow['a'+APP+'_get_cached_ajax']) {
			unsafeWindow['a'+APP+'_get_cached_ajax'](Page.last, "get_body");
		} else {
			window.location.href = 'http://apps.facebook.com/castle_age/index.php?bm=1';
		}
	}
	return false;
};
Page.click = function(el) {
	if (!$(el).length) {
		GM_debug('Page.click: Unable to find element - '+el);
		return false;
	}
	var e = document.createEvent("MouseEvents");
	e.initEvent("click", true, true);
	$(el).get(0).wrappedJSObject.dispatchEvent(e);
	Page.clear();
	Page.lastclick = el;
	Page.when = Date.now();
	return true;
};
Page.clear = function() {
	Page.last = Page.lastclick = Page.when = null;
	Page.retry = 0;
};
Page.loading = function() {
	if (!unsafeWindow['a'+APP+'_get_cached_ajax']) {
		if (!Page.when || (Date.now() - Page.when) >= (Page.option.timeout * Page.option.retry * 1000)) { // every xx seconds - we don't get called once it starts loading
			Page.when = Date.now();
			window.location.href = 'http://apps.facebook.com/castle_age/index.php';
		}
		GM_debug('Page not loaded correctly, reloading.');
		return true;
	}
	if ($('#app'+APP+'_AjaxLoadIcon').css('display') === 'none') { // Load icon is shown after 1.5 seconds
		if (Page.when && (Date.now() - Page.when) > (Page.option.timeout * 1000)) {
			Page.clear();
		}
		return false;
	}
	if (Page.when && (Date.now() - Page.when) >= (Page.option.timeout * 1000)) {
		GM_debug('Page.loading for 15+ seconds - retrying...');
		Page.when = Date.now();
		if (Page.retry++ >= Page.option.retry) {
			GM_debug('Page.loading for 1+ minutes - reloading...');
			window.location.href = 'http://apps.facebook.com/castle_age/index.php';
		} else if (Page.last) {
			unsafeWindow['a'+APP+'_get_cached_ajax'](Page.last, "get_body");
		} else if (Page.lastclick) {
			Page.click(Page.lastclick);
		}
	}
	return true;
};
Page.reload = function() {
	if (!Page.when || (Date.now() - Page.when) >= (Page.option.timeout * Page.option.retry * 1000)) {
		Page.to((Page.page || 'index'), '');
	}
};

/********** Worker.Player **********
* Gets all current stats we can see
*/
var Player = new Worker('Player', '*');
Player.option = null;
Player.panel = null;
Player.onload = function() {
	// Get the gold timer from within the page - should really remove the "official" one, and write a decent one, but we're about playing and not fixing...
	// gold_increase_ticker(1418, 6317, 3600, 174738470, 'gold', true);
	// function gold_increase_ticker(ticks_left, stat_current, tick_time, increase_value, first_call)
	var when = new Date(script_started + ($('*').html().regex(/gold_increase_ticker\(([0-9]+),/) * 1000));
	Player.data.cash_time = when.getSeconds() + (when.getMinutes() * 60);
};
Player.parse = function(change) {
	if (!$('#app'+APP+'_app_body_container').length) {
		Page.reload();
		return false;
	}
	var data = Player.data, keep, stats;
	data.FBID		= unsafeWindow.Env.user;
	data.cash		= parseInt($('strong#app'+APP+'_gold_current_value').text().replace(/[^0-9]/g, ''), 10);
	data.energy		= $('#app'+APP+'_energy_current_value').parent().text().regex(/([0-9]+)\s*\/\s*[0-9]+/);
	data.maxenergy	= $('#app'+APP+'_energy_current_value').parent().text().regex(/[0-9]+\s*\/\s*([0-9]+)/);
	data.health		= $('#app'+APP+'_health_current_value').parent().text().regex(/([0-9]+)\s*\/\s*[0-9]+/);
	data.maxhealth	= $('#app'+APP+'_health_current_value').parent().text().regex(/[0-9]+\s*\/\s*([0-9]+)/);
	data.stamina	= $('#app'+APP+'_stamina_current_value').parent().text().regex(/([0-9]+)\s*\/\s*[0-9]+/);
	data.maxstamina	= $('#app'+APP+'_stamina_current_value').parent().text().regex(/[0-9]+\s*\/\s*([0-9]+)/);
	data.exp		= $('#app'+APP+'_st_2_5').text().regex(/([0-9]+)\s*\/\s*[0-9]+/);
	data.maxexp		= $('#app'+APP+'_st_2_5').text().regex(/[0-9]+\s*\/\s*([0-9]+)/);
	data.level		= $('#app'+APP+'_st_5').text().regex(/Level: ([0-9]+)!/i);
	data.armymax	= $('a[href*=army.php]', '#app'+APP+'_main_bntp').text().regex(/([0-9]+)/);
	data.army		= Math.min(data.armymax, 501); // XXX Need to check what max army is!
	data.upgrade	= ($('a[href*=keep.php]', '#app'+APP+'_main_bntp').text().regex(/([0-9]+)/) || 0);
	data.general	= $('div.general_name_div3').first().text().trim();
	data.imagepath	= $('div.general_pic_div3 img').attr('src').pathpart();
	// Keep page
	if (Page.page==='keep_stats') {
		keep = $('div.keep_attribute_section').first(); // Only when it's our own keep and not someone elses
		if (keep.length) {
			data.myname = $('div.keep_stat_title > span', keep).text().regex(/"(.*)"/);
			data.rank = $('td.statsTMainback img[src*=rank_medals]').attr('src').filepart().regex(/([0-9]+)/);
			stats = $('div.attribute_stat_container', keep);
			data.attack = $(stats).eq(2).text().regex(/([0-9]+)/);
			data.defense = $(stats).eq(3).text().regex(/([0-9]+)/);
			data.bank = parseInt($('td.statsTMainback b.money').text().replace(/[^0-9]/g,''), 10);
		}
	}
	return false;
};
Player.work = function(state) {
	// These can change every second - so keep them in mind
	Player.data.cash = parseInt($('strong#app'+APP+'_gold_current_value').text().replace(/[^0-9]/g, ''), 10);
// Very innacurate!!!
//	Player.data.cash_timer		= $('#app'+APP+'_gold_time_value').text().parseTimer();
	var when = new Date();
	when = Player.data.cash_time - (when.getSeconds() + (when.getMinutes() * 60));
	if (when < 0) {
		when += 3600;
	}
	Player.data.cash_timer		= when;
	Player.data.energy			= $('#app'+APP+'_energy_current_value').parent().text().regex(/([0-9]+)\s*\/\s*[0-9]+/);
	Player.data.energy_timer	= $('#app'+APP+'_energy_time_value').text().parseTimer();
	Player.data.health			= $('#app'+APP+'_health_current_value').parent().text().regex(/([0-9]+)\s*\/\s*[0-9]+/);
	Player.data.health_timer	= $('#app'+APP+'_health_time_value').text().parseTimer();
	Player.data.stamina			= $('#app'+APP+'_stamina_current_value').parent().text().regex(/([0-9]+)\s*\/\s*[0-9]+/);
	Player.data.stamina_timer	= $('#app'+APP+'_stamina_time_value').text().parseTimer();
};
Player.select = function() {
	var step = Divisor(Player.data.maxstamina)
	$('select.golem_stamina').each(function(a,el){
		$(el).empty();
		var i, tmp = $(el).attr('id').slice(PREFIX.length).regex(/([^_]*)_(.*)/i), value = tmp ? WorkerByName(tmp[0]).option[tmp[1]] : null;
		for (i=0; i<=Player.data.maxstamina; i+=step) {
			$(el).append('<option value="' + i + '"' + (value==i ? ' selected' : '') + '>' + i + '</option>');
		}
	});
	step = Divisor(Player.data.maxenergy)
	$('select.golem_energy').each(function(a,el){
		$(el).empty();
		var i, tmp = $(el).attr('id').slice(PREFIX.length).regex(/([^_]*)_(.*)/i), value = tmp ? WorkerByName(tmp[0]).option[tmp[1]] : null;
		for (i=0; i<=Player.data.maxenergy; i+=step) {
			$(el).append('<option value="' + i + '"' + (value==i ? ' selected' : '') + '>' + i + '</option>');
		}
	});
	step = Divisor(Player.data.maxhealth)
	$('select.golem_health').each(function(a,el){
		$(el).empty();
		var i, tmp = $(el).attr('id').slice(PREFIX.length).regex(/([^_]*)_(.*)/i), value = tmp ? WorkerByName(tmp[0]).option[tmp[1]] : null;
		for (i=0; i<=Player.data.maxhealth; i+=step) {
			$(el).append('<option value="' + i + '"' + (value==i ? ' selected' : '') + '>' + i + '</option>');
		}
	});
};

/********** Worker.Quest **********
* Completes quests with a choice of general
*/
// Should also look for quests_quest but that should never be used unless there's a new area
var Quest = new Worker('Quest', 'quests_quest1 quests_quest2 quests_quest3 quests_quest4 quests_quest5 quests_quest6 quests_demiquests quests_atlantis');
Quest.option = {
	general: 'Under Level 4',
	what: 'Influence'
};
Quest.land = ['fire', 'earth', 'mist', 'water', 'demon', 'undead'];
Quest.current = null;
Quest.display = [
	{
		id:'general',
		label:'General',
		select:['any', 'Under Level 4', 'Influence']
	},{
		id:'what',
		label:'Quest for',
		select:'quest_reward'
	},{
		id:'current',
		label:'Current',
		info:'None'
	}
];
Quest.parse = function(change) {
	var quest = Quest.data, area, land = null;
	switch(Page.page) {
		case 'quests_quest':
		case 'quests_quest1':
		case 'quests_quest2':
		case 'quests_quest3':
		case 'quests_quest4':
		case 'quests_quest5':
		case 'quests_quest6':
			area = 'quest';
			land = $('div.title_tab_selected img[id^="app'+APP+'_land_image"]').attr('id').regex(/_image([0-9]+)$/,'');
			break;
		case 'quests_demiquests':
			area = 'demiquest';
			break;
		case 'quests_atlantis':
			area = 'atlantis';
			break;
		default: // Unknown quest area :-(
			return false;
	}
	if (!change) { // Parse first
		$('div.quests_background,div.quests_background_sub').each(function(i,el){
			var name, influence, reward, units, energy;
			if ($(el).hasClass('quests_background')) { // Main quest
				name = $('div.qd_1 b', el).text().trim();
				influence = $('div.quest_progress', el).text().regex(/LEVEL ([0-9]+) INFLUENCE: ([0-9]+)%/i);
				reward = $('div.qd_2', el).text().replace(/[^0-9$]/g, '').regex(/^([0-9]+)\$([0-9]+)\$([0-9]+)$/);
				energy = $('div.quest_req b', el).text().regex(/([0-9]+)/);
			} else { // Subquest
				name = $('div.quest_sub_title', el).text().trim();
				influence = $('div.quest_sub_progress', el).text().regex(/LEVEL ([0-9]+) INFLUENCE: ([0-9]+)%/i);
				reward = $('div.qd_2_sub', el).text().replace(/[^0-9$]/g, '').regex(/^([0-9]+)\$([0-9]+)\$([0-9]+)$/);
				energy = $('div.qd_3_sub', el).text().regex(/([0-9]+)/);
			}
			if (!name) {
				return;
			}
			quest[name] = {};
			quest[name].area = area;
			if (land) {
				quest[name].land = land;
			}
			if (influence) {
				quest[name].level = influence[0];
				quest[name].influence = influence[1];
			} else {
				quest[name].level = quest[name].influence = 0;
			}
			quest[name].exp = reward.shift();
			quest[name].reward = (reward[0] + reward[1]) / 2;
			quest[name].energy = energy;
			if ($(el).hasClass('quests_background')) { // Main quest has some extra stuff
				if ($('div.qd_1 img', el).attr('title')) {
					quest[name].item = $('div.qd_1 img', el).attr('title').trim();
				}
				if ($('div.quest_act_gen img', el).attr('title')) {
					quest[name].general = $('div.quest_act_gen img', el).attr('title');
				}
				units = {};
				$('div.quest_req > div > div > div', el).each(function(i,el){
					var title = $('img', el).attr('title');
					units[title] = $(el).text().regex(/([0-9]+)/);
				});
				if (units.length) {
					quest[name].units = units;
				}
//				GM_debug('Quest: '+name+' = '+quest[name].toSource());
			}
		});
		Quest.select();
	}
	return false;
};
Quest.select = function() {
	var i, list = ['Nothing', 'Influence', 'Experience', 'Cash'];
	for (i in Quest.data) {
		if (Quest.data[i].item) {
			list.push(Quest.data[i].item);
		}
	}
	$('select.golem_quest_reward').each(function(a,el){
		$(el).empty();
		var i, tmp = $(el).attr('id').slice(PREFIX.length).regex(/([^_]*)_(.*)/i), value = tmp ? WorkerByName(tmp[0]).option[tmp[1]] : null;
		for (i=0; i<list.length; i++) {
			$(el).append('<option value="'+list[i]+'"'+(list[i]===value ? ' selected' : '')+'>'+list[i]+'</value>');
		}
	});
};
Quest.work = function(state) {
	var i, list, best = null;
	if (Quest.option.what === 'Nothing') {
		return false;
	}
	for (i in Quest.data) {
		switch(Quest.option.what) {
			case 'Influence':
				if (Quest.data[i].influence >= 100 || best && Quest.data[i].energy >= Quest.data[best].energy) {
					continue;
				}
				break;
			case 'Experience':
				if (best && (Quest.data[i].energy / Quest.data[i].exp) >= (Quest.data[best].energy / Quest.data[best].exp)) {
					continue;
				}
				break;
			case 'Cash':
				if (best && (Quest.data[i].energy / Quest.data[i].reward) >= (Quest.data[best].energy / Quest.data[best].reward)) {
					continue;
				}
				break;
			default: // We're going for an item instead
				if (!Quest.data[i].item || Quest.data[i].item !== Quest.option.what || (best && (Quest.data[i].energy > Quest.data[best].energy))) {
					continue;
				}
				break;
		}
		best = i;
	}
	if (best !== Quest.current) {
		Quest.current = best;
		if (best) {
			GM_debug('Quest: Wanting to perform - '+best+' (energy: '+Quest.data[best].energy+')');
			$('#'+PREFIX+'Quest_current').html(''+best+' (energy: '+Quest.data[best].energy+')');
		}
	}
	if (!best || Quest.data[best].energy > Queue.burn.energy) {
		return false;
	}
	if (!state) {
		return true;
	}
	if (Quest.data[best].general) {
		if (!Generals.to(Quest.data[best].general)) 
		{
			return true;
		}
	} else if (!Generals.to(Generals.best(Quest.option.general))) {
		return true;
	}
	switch(Quest.data[best].area) {
		case 'quest':
			if (!Page.to('quests_quest'+Quest.data[best].land)) {
				return true;
			}
			break;
		case 'demiquest':
			if (!Page.to('quests_demiquests')) {
				return true;
			}
			break;
		case 'atlantis':
			if (!Page.to('quests_atlantis')) {
				return true;
			}
			break;
		default:
			GM_debug('Quest: Can\'t get to quest area!');
			return false;
	}
	GM_debug('Quest: Performing - '+best+' (energy: '+Quest.data[best].energy+')');
	if (!Page.click('div.action[title^="'+best+'"] input[type="image"]')) {
		Page.reload();
	}
	return true;
};

/********** Worker.Queue() **********
* Keeps track of the worker queue
*/
var Queue = new Worker('Queue', '*');
Queue.data = {
	current: null
};
Queue.option = {
	delay: 5,
	clickdelay: 5,
	queue: ["Page", "Queue", "Income", "Quest", "Monster", "Battle", "Heal", "Bank", "Alchemy", "Town", "Blessing", "Gift", "Upgrade", "Idle", "Raid"],
	stamina: 0,
	energy: 0
};
Queue.display = [
	{
		label:'Drag the other panels into the order you wish them run.'
	},{
		id:'delay',
		label:'Delay Between Events',
		text:true,
		after:'secs',
		size:3
	},{
		id:'clickdelay',
		label:'Delay After Mouse Click',
		text:true,
		after:'secs',
		size:3
	},{
		id:'stamina',
		label:'Keep Stamina',
		select:'stamina'
	},{
		id:'energy',
		label:'Keep Energy',
		select:'energy'
	}
];
Queue.runfirst = [];
Queue.unsortable = true;
Queue.lastclick = Date.now();	// Last mouse click - don't interrupt the player
Queue.lastrun = Date.now();		// Last time we ran
Queue.burn = {stamina:false, energy:false};
Queue.onload = function() {
	var i, worker, found = {};
	for (i=0; i<Queue.option.queue.length; i++) { // First find what we've already got
		worker = WorkerByName(Queue.option.queue[i]);
		if (worker) {
			found[worker.name] = true;
		}
	}
	for (i in Workers) { // Second add any new workers that have a display (ie, sortable)
		if (found[Workers[i].name] || !Workers[i].work || !Workers[i].display) {
			continue;
		}
		GM_log('Adding '+Workers[i].name+' to Queue');
		if (Workers[i].unsortable) {
			Queue.option.queue.unshift(Workers[i].name);
		} else {
			Queue.option.queue.push(Workers[i].name);
		}
	}
	for (i=0; i<Queue.option.queue.length; i++) {	// Third put them in saved order
		worker = WorkerByName(Queue.option.queue[i]);
		if (worker && worker.priv_id) {
			if (Queue.data.current && worker.name === Queue.data.current) {
				GM_debug('Queue: Trigger '+worker.name+' (continue after load)');
				$('#'+worker.priv_id+' > h3').css('font-weight', 'bold');
			}
			$('#golem_config').append($('#'+worker.priv_id));
		}
	}
	$(document).click(function(){Queue.lastclick=Date.now();});
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
};
Queue.run = function() {
	var i, worker, found = false, now = Date.now();
	if (Queue.option.pause || now - Queue.lastclick < Queue.option.clickdelay * 1000 || now - Queue.lastrun < Queue.option.delay * 1000) {
		return;
	}
	Queue.lastrun = now;
	if (Page.loading()) {
		return; // We want to wait xx seconds after the page has loaded
	}
	Queue.burn.stamina	= Math.max(0, Player.data.stamina - Queue.option.stamina);
	Queue.burn.energy	= Math.max(0, Player.data.energy - Queue.option.energy);
	for (i in Workers) { // Run any workers that don't have a display, can never get focus!!
		if (Workers[i].work && !Workers[i].display) {
			Workers[i].work(false);
		}
	}
	for (i=0; i<Queue.option.queue.length; i++) {
		worker = WorkerByName(Queue.option.queue[i]);
		if (!worker || !worker.work || !worker.display) {
			continue;
		}
		if (!worker.work(Queue.data.current === worker.name)) {
			Settings.Save(worker);
			if (Queue.data.current === worker.name) {
				Queue.data.current = null;
				if (worker.priv_id) {
					$('#'+worker.priv_id+' > h3').css('font-weight', 'normal');
				}
				GM_debug('Queue: End '+worker.name);
			}
			continue;
		}
		Settings.Save(worker);
		if (!found) { // We will work(false) everything, but only one gets work(true) at a time
			found = true;
			if (Queue.data.current === worker.name) {
				continue;
			}
			worker.priv_since = now;
			if (Queue.data.current) {
				GM_debug('Queue: Interrupt '+Queue.data.current);
				if (WorkerByName(Queue.data.current).priv_id) {
					$('#'+WorkerByName(Queue.data.current).priv_id+' > h3').css('font-weight', 'normal');
				}
			}
			Queue.data.current = worker.name;
			if (worker.priv_id) {
				$('#'+worker.priv_id+' > h3').css('font-weight', 'bold');
			}
			GM_debug('Queue: Trigger '+worker.name);
		}
	}
	Settings.Save(Queue);
};
/********** Worker.Raid **********
* Automates Raids
*/
Raid = new Worker('Raid', 'battle_raid', {stamina:true});
Raid.onload = function() {
	if (!Raid.option.type) Raid.option.type = 'Invade';
}
Raid.display = [
	{
		label:'Work in progress... Will be merged with main Monster section later'
	},{
		id:'general',
		label:'General',
		select:'generals'
	},{
		id:'type',
		label:'Attack Type',
		select:['Invade', 'Duel']
	}
];
Raid.parse = function(change) {
	if ($('input[name="help with raid"]').length) { // In a raid
		var user = $('img[linked="true"][size="square"]').attr('uid');
		var $health = $('img[src$="monster_health_background.jpg"]').parent();
		Raid.data[user].health = Math.ceil($health.width() / $health.parent().width() * 100);
		Raid.data[user].timer = $('#app'+APP+'_monsterTicker').text().parseTimer();
		var damage = {};
		$('td.dragonContainer table table a[href^="http://apps.facebook.com/castle_age/keep.php?user="]').each(function(i,el){
			var uid = $(el).attr('href').regex(/user=([0-9]+)/i);
			damage[uid] = parseInt($(el).parent().next().text().replace(/[^0-9]/g,''));
		});
		Raid.data[user].damage = damage;
//		GM_debug('Raid: '+Raid.data[user].toSource());
	} else { // Check raid list
		var data = {};
		$('img[src$="dragon_list_btn_3.jpg"]').each(function(i,el){
			var user = $(el).parent().attr('href').regex(/user=([0-9]+)/i);
			data[user] = {};
		});
		for (var i in data) if (!Raid.data[i]) Raid.data[i] = {};
		for (var i in Raid.data) if (!data[i]) delete Raid.data[i];
	}
	return false;
}
Raid.work = function(state) {
	if (!length(Raid.data)) return false;
	if (Player.data.health <= 10) return false;
	var best = null;
	for (var i in Raid.data) {
		best = i;
	}
	if (!best) return false;
	if (!state) return true;
	if (!Generals.to(Raid.option.general)) return true;
	if (Raid.option.type == 'Invade') var btn = $('input[src$="raid_attack_button.gif"]:first');
	else var btn = $('input[src$="raid_attack_button2.gif"]:first');
	if (!btn.length && !Page.to('battle_raid', '?user='+best)) return true;
	//http://image2.castleagegame.com/1288/graphics/raid_attack_button.gif
	if (Raid.option.type == 'Invade') var btn = $('input[src$="raid_attack_button.gif"]:first');
	else var btn = $('input[src$="raid_attack_button2.gif"]:first');
	Page.click(btn);
	return true;
}
/********** Worker.Town **********
* Sorts and auto-buys all town units (not property)
*/
var Town = new Worker('Town', 'town_soldiers town_blacksmith town_magic town_land');
Town.data = {
	soldiers: {},
	blacksmith: {},
	magic: {},
	land: {}
};
Town.display = [
	{
		label:'Work in progress...'
	},{
		id:'general',
		label:'Buy Number:',
		select:['None', 'Maximum', 'Match Army']
	},{
		id:'units',
		label:'Buy Type:',
		select:['All', 'Best Offense', 'Best Defense', 'Best of Both']
	}
];
Town.units = {};
Town.cache = {}; // for quick sorting
Town.table = null; // table units are in
Town.header = {};
Town.blacksmith = { // Shield must come after armor (currently)
	Weapon:	/avenger|axe|blade|bow|dagger|halberd|mace|morningstar|rod|spear|staff|stave|sword|talon|trident|wand|Dragonbane|Ironhart's Might|Judgement|Oathkeeper/i,
	Shield:	/buckler|shield|dreadnought|Defender|Sword of Redemption/i,
	Helmet:	/cowl|crown|helm|horns|mask|veil/i,
	Gloves:	/gauntlet|glove|hand/i,
	Armor:	/armor|chainmail|cloak|pauldrons|plate|robe/i,
	Amulet:	/amulet|bauble|charm|jewel|memento|orb|shard|trinket|Paladin's Oath|Poseidons Horn/i
};
Town.parse = function(change) {
	var land, landlist, unit, unitlist, tmp;
	if (!change) {
		if (Page.page==='town_land') {
			land = Town.data.land = {};
			landlist = $('tr.land_buy_row,tr.land_buy_row_unique');
			landlist.each(function(i,el){
				var name = $('img', el).attr('alt');
				land[name] = {};
				land[name].income = $('.land_buy_info .gold', el).text().replace(/[^0-9]/g,'').regex(/([0-9]+)/);
				land[name].max = $('.land_buy_info', el).text().regex(/Max Allowed For your level: ([0-9]+)/i);
				land[name].cost = $('.land_buy_costs .gold', el).text().replace(/[^0-9]/g,'').regex(/([0-9]+)/);
				land[name].own = $('.land_buy_costs span', el).text().replace(/[^0-9]/g,'').regex(/([0-9]+)/);
			});
			GM_debug('Land: '+Town.data.land.toSource());
		} else {
			switch (Page.page) {
				case 'town_soldiers':
					unit = Town.data.soldiers = {};
					break;
				case 'town_blacksmith':
					unit = Town.data.blacksmith = {};
					break;
				case 'town_magic':
					unit = Town.data.magic = {};
					break;
				default:
					// Error... somehow...
					return false;
			}
			unitlist = $('tr.eq_buy_row,tr.eq_buy_row2');
			unitlist.each(function(a,el){
				var i, name = $('div.eq_buy_txt strong:first-child', el).text().trim(),
					cost = $('div.eq_buy_costs strong:first-child', el).text().replace(/[^0-9]/g, '');
				Town.cache[name] = el;
				unit[name] = {};
				if (cost) {
					unit[name].cost = parseInt(cost, 10);
					unit[name].buy = [];
					$('div.eq_buy_costs select[name="amount"]:first option', el).each(function(i,el){
						unit[name].buy.push(parseInt($(el).val(), 10));
					});
				}
				unit[name].own = $('div.eq_buy_costs span:first-child', el).text().regex(/([0-9]+)/);
				unit[name].att = $('div.eq_buy_stats div:first-child', el).text().regex(/([0-9]+)/);
				unit[name].def = $('div.eq_buy_stats div:last-child', el).text().regex(/([0-9]+)/);
				if (Page.page==='town_blacksmith') {
					for (i in Town.blacksmith) {
						if (name.match(Town.blacksmith[i])) {
							unit[name].type = i;
						}
					}
				}
			});
			Town.table = $(unitlist).first().parent();
			this.header = {};
			$(this.table).children().each(function(i,el) {
				if (!$(el).attr('class')) {
					Town.header[i] = [el, $(el).next()];
				}
			});
			Town.units = unit;
		}
		if (Page.page !== 'town_land' && length(Town.data.soldiers) && length(Town.data.blacksmith) && length(Town.data.magic)) {
			Town.getValues();
		}
	} else {
		if (Page.page==='town_blacksmith') {
			unit = Town.data.blacksmith;
			$('tr.eq_buy_row,tr.eq_buy_row2').each(function(i,el){
				var name = $('div.eq_buy_txt strong:first-child', el).text().trim();
				if (unit[name].type) {
					$('div.eq_buy_txt strong:first-child', el).parent().append('<br>'+unit[name].type);
				}
			});
		}
		if (Page.page !== 'town_land') {
			tmp = $('<tr><td><div style="padding:9px 0px 0px 15px; width:725px; height:28px;">Sort by <a id="sort_none">Normal</a> / <a id="sort_attack">Attack</a> / <a id="sort_defense">Defense</a></div></td></tr>');
			$('div', tmp).css({ backgroundImage:$('div[style*="hero_divider.gif"]').first().css('background-image'), color:'#fff', fontSize:'16px', fontWeight:'bold' });
			$('#sort_none', tmp).click(function(){Town.sortBy();});
			$('#sort_attack', tmp).click(function(){Town.sortBy('att');});
			$('#sort_defense', tmp).click(function(){Town.sortBy('def');});
			$(this.table).prepend(tmp);
		}
	}
	return true;
};
Town.work = function(state) {
	if (!Town.option.number) {
		return false;
	}
	var i, j, max = Math.min(Town.option.number==='Maximum' ? 501 : Player.data.army, 501), best = null, count = 0, gold = Player.data.gold + Player.data.bank, units = Town.data.soldiers;
	for (i in units) {
		count = 0;
		if (!units[i].cost || units[i].own >= max || (best && Town.option.units === 'Best Offense' && units[i].att <= best.att) || (best && Town.option.units === 'Best Defense' && units[i].def <= best.def) || (best && Town.option.units === 'Best of Both' && (units[i].att <= best.att || units[i].def <= best.def))) {
			continue;
		}
		for (j in units[i].buy) {
			if ((max - units[i].own) >= units[i].buy[j]) {
				count = units[i].buy[j]; // && (units[i].buy[j] * units[i].cost) < gold
			}
		}
		GM_debug('Thinking about buying: '+count+' of '+i+' at $'+(count * units[i].cost));
		if (count) {
			best = i;
			break;
		}
	}
	if (!best) {
		return false;
	}
	if (!state) {
		GM_debug('Want to buy '+count+' x '+best+' at $'+(count * units[best].cost));
		return true;
	}
//	if (!Bank.retrieve(best.cost * count)) return true;
//	if (Player.data.gold < best.cost) return false; // We're poor!
//	if (!Page.to('town_soldiers')) return true;
	return false;
};
Town.sortBy = function(x) {
	var i, units = [], x2 = (x==='att'?'def':'att');
	if (!x) {
		for (i in Town.units) {
			$(Town.table).append($(Town.cache[i]));
		}
		for (i in Town.header) {
			$($(Town.header[i][1])).before($(Town.header[i][0]));
			$(Town.header[i][0]).css('display','table-row');
		}
	} else {
		for (i in Town.units) {
			units.push(i);
		}
// We now check the actual total value rather than just the absolute values
//		units.sort(function(a,b) { return Town.units[b][x2] - Town.units[a][x2]; });
//		units.sort(function(a,b) { return Town.units[b][x] - Town.units[a][x]; });
		units.sort(function(a,b) {
			return (Town.units[b][x] + (0.7 * Town.units[b][x2])) - (Town.units[a][x] + (0.7 * Town.units[a][x2]));
		});
		for (i=0; i<units.length; i++) {
			$(Town.table).append($(Town.cache[units[i]]));
		}
		for (i in Town.header) {
			$(Town.header[i]).css('display','none');
		}
	}
};
Town.getValues = function() {
	var listpush = function(list,i){list.push(i);},
		listpushweapon = function(list,i,units){if (units[i].type === 'Weapon'){list.push(i);}},
		listpushnotweapon = function(list,i,units){if (units[i].type !== 'Weapon'){list.push(i);}},
		listpushshield = function(list,i,units){if (units[i].type === 'Shield'){list.push(i);}},
		listpushhelmet = function(list,i,units){if (units[i].type === 'Helmet'){list.push(i);}},
		listpushgloves = function(list,i,units){if (units[i].type === 'Gloves'){list.push(i);}},
		listpusharmor = function(list,i,units){if (units[i].type === 'Armor'){list.push(i);}},
		listpushamulet = function(list,i,units){if (units[i].type === 'Amulet'){list.push(i);}};
	Town.data.invade = {
		attack:	getAttDef(Town.data.soldiers, listpush, 'att', Player.data.army, 'invade')
			+	getAttDef(Town.data.blacksmith, listpushweapon, 'att', Player.data.army, 'invade')
			+	getAttDef(Town.data.blacksmith, listpushnotweapon, 'att', Player.data.army, 'invade')
			+	getAttDef(Town.data.magic, listpush, 'att', Player.data.army, 'invade'),
		defend:	getAttDef(Town.data.soldiers, listpush, 'def', Player.data.army, 'invade')
			+	getAttDef(Town.data.blacksmith, listpushweapon, 'def', Player.data.army, 'invade')
			+	getAttDef(Town.data.blacksmith, listpushnotweapon, 'def', Player.data.army, 'invade')
			+	getAttDef(Town.data.magic, listpush, 'def', Player.data.army, 'invade')
	};
	Town.data.duel = {
		attack:	getAttDef(Town.data.blacksmith, listpushweapon, 'att', 1, 'duel')
			+	getAttDef(Town.data.blacksmith, listpushshield, 'att', 1, 'duel')
			+	getAttDef(Town.data.blacksmith, listpushhelmet, 'att', 1, 'duel')
			+	getAttDef(Town.data.blacksmith, listpushgloves, 'att', 1, 'duel')
			+	getAttDef(Town.data.blacksmith, listpusharmor, 'att', 1, 'duel')
			+	getAttDef(Town.data.blacksmith, listpushamulet, 'att', 1, 'duel')
			+	getAttDef(Town.data.magic, listpush, 'att', 1, 'duel'),
		defend:	getAttDef(Town.data.blacksmith, listpushweapon, 'def', 1, 'duel')
			+	getAttDef(Town.data.blacksmith, listpushshield, 'def', 1, 'duel')
			+	getAttDef(Town.data.blacksmith, listpushhelmet, 'def', 1, 'duel')
			+	getAttDef(Town.data.blacksmith, listpushgloves, 'def', 1, 'duel')
			+	getAttDef(Town.data.blacksmith, listpusharmor, 'def', 1, 'duel')
			+	getAttDef(Town.data.blacksmith, listpushamulet, 'def', 1, 'duel')
			+	getAttDef(Town.data.magic, listpush, 'def', 1, 'duel')
	};
//	GM_debug('Town Invade: '+Town.data.invade.toSource()+', Town Duel: '+Town.data.duel.toSource());
};

/********** Worker.Update **********
* Checks if there's an update to the script, and lets the user update if there is.
*/
var Update = new Worker('Update');
Update.data = null;
Update.option = null;
Update.found = false;
Update.onload = function() {
	var $btn = $('<button name="Script Update" id="golem_update">Check</button>')
		.button().click(function(){Update.now(true);});
	$('#golem_buttons').append($btn);
};
Update.now = function(force) {
	if (Update.found) {
		window.location.href = 'http://userscripts.org/scripts/source/67412.user.js';
		return;
	}
	var lastUpdateCheck = Settings.GetValue("lastUpdateCheck", 0);
	if (force || Date.now() - lastUpdateCheck > 86400000) {
		// 24+ hours since last check (60x60x24x1000ms)
		Settings.SetValue("lastUpdateCheck", Date.now().toString());
		GM_xmlhttpRequest({
			method: "GET",
			url: 'http://userscripts.org/scripts/show/67412',
			onload: function(evt) {
				if (evt.readyState === 4 && evt.status === 200) {
					var tmp = $(evt.responseText), remoteVersion = $('#summary', tmp).text().regex(/Version:[^0-9.]+([0-9.]+)/i);
					if (force) {
						$('#golem_request').remove();
					}
					if (remoteVersion>VERSION) {
						Update.found = true;
						$('#golem_update span').text('Install');
						if (force) {
							$('#golem_config').after('<div id="golem_request" title="Castle Age Golem"><p>There is a new version of Castle Age Golem available.</p><p>Current&nbsp;version:&nbsp;'+VERSION+', New&nbsp;version:&nbsp;'+remoteVersion+'</p></div>');
							$('#golem_request').dialog({ modal:true, buttons:{"Install":function(){$(this).dialog("close");window.location.href='http://userscripts.org/scripts/source/67412.user.js';}, "Skip":function(){$(this).dialog("close");}} });
						}
						GM_log('New version available: '+remoteVersion);
					} else if (force) {
						$('#golem_config').after('<div id="golem_request" title="Castle Age Golem"><p>There are no new versions available.</p></div>');
						$('#golem_request').dialog({ modal:true, buttons:{"Ok":function(){$(this).dialog("close");}} });
					}
				}
			}
		});
	}
};

/********** Worker.Upgrade **********
* Spends upgrade points
*/
var Upgrade = new Worker('Upgrade', 'keep_stats');
Upgrade.data = {
	run: 0
};
Upgrade.display = [
	{
		label:'Points will be allocated in this order, add multiple entries if wanted (ie, 3x Attack and 1x Defense would put &frac34; on Attack and &frac14; on Defense)'
	},{
		id:'order',
		multiple:['Energy', 'Stamina', 'Attack', 'Defense', 'Health']
	}
];
Upgrade.parse = function(change) {
	var result = $('div.results');
	if (Upgrade.data.working && result.length && result.text().match(/You just upgraded your/i)) {
		Upgrade.data.working = false;
		Upgrade.data.run++;
		if (Upgrade.data.run >= Upgrade.option.order.length) {
			Upgrade.data.run = 0;
		}
	}
	return false;
};
Upgrade.work = function(state) {
	if (!Upgrade.option.order || !Upgrade.option.order.length || !Player.data.upgrade) {
		return false;
	}
	if (!state) {
		return true;
	}
	if (!Page.to('keep_stats')) {
		return true;
	}
	Upgrade.data.working = true;
	if (Upgrade.data.run >= Upgrade.option.order.length) {
		Upgrade.data.run = 0;
	}
	switch (Upgrade.option.order[Upgrade.data.run]) {
		case 'Energy':
			if (Page.click('a[href$="?upgrade=energy_max"]')) {
				return true;
			}
			break;
		case 'Stamina':
			if (Page.click('a[href$="?upgrade=stamina_max"]')) {
				return true;
			}
			break;
		case 'Attack':
			if (Page.click('a[href$="?upgrade=attack"]')) {
				return true;
			}
			break;
		case 'Defense':
			if (Page.click('a[href$="?upgrade=defense"]')) {
				return true;
			}
			break;
		case 'Health':
			if (Page.click('a[href$="?upgrade=health_max"]')) {
				return true;
			}
			break;
	}
	Page.reload(); // We should never get to this point!
	return true;
};


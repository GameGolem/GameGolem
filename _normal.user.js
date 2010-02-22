// ==UserScript==
// @name           Rycochet's Castle Age Golem
// @namespace      golem
// @description    Auto player for castle age game
// @version        10
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
var VERSION = 10;
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
		for (var i in Workers) {
			if (Workers[i].pages && (Workers[i].pages=='*' || (Page.page && Workers[i].pages.indexOf(Page.page)>=0)) && Workers[i].parse) {
//				GM_debug(Workers[i].name + '.parse(false)');
				Workers[i].priv_parse = Workers[i].parse(false);
			} else Workers[i].priv_parse = false;
		}
		Settings.Save('data');
		for (var i in Workers) {
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
			if (Workers[i].onload) Workers[i].onload();
		}
		main(); // Call once to get the ball rolling...
		window.setInterval(function(){main();},1000);
	}
});

/********** Panel **********
* Create an instance of a panel for creating the display
* This code is a total mess...
*/
function Panel(name) {
	this.name = name;
	this.show = $('<div style="font-size:smaller;padding:12px;"></div>');
	this.options = function(opts) {
		opts		= opts || {};
		opts.before	= opts.before || '';
		opts.after	= opts.after || '';
		opts.suffix	= opts.suffix || '';
		opts.between= opts.between || 'to';
		opts.size	= opts.size || 7;
		opts.min	= opts.min || 0;
		opts.max	= opts.max || 100;
		return opts;
	};
	this.checkbox = function(id,label,opts) {
		var value = (WorkerByName(this.name).option[id] || false);
		var id = PREFIX + this.name + '_' + id;
		var label = label.replace(' ','&nbsp;');
		opts = this.options(opts);
		$(this.show).append('<div style="clear:both"><span style="float:left;">'+label+'</span><span style="float:right;text-align:right">'+opts.before+'<input type="checkbox" id="'+id+'" '+(value?' checked':'')+'>'+opts.after+'</span></div>');
		return id;
	};
	this.text = function(id,label,opts) {
		var value = (WorkerByName(this.name).option[id] || '');
		var id = PREFIX + this.name + '_' + id;
		var label = label.replace(' ','&nbsp;');
		opts = this.options(opts);
		$(this.show).append('<div style="clear:both"><span style="float:left;">'+label+'</span><span style="float:right;text-align:right">'+opts.before+'<input type="text" id="'+id+'" size="'+opts.size+'" value="'+value+'">'+opts.after+'</span></div>');
		return id;
	};
	this.select = function(id,label,list,opts) {
		var value = (WorkerByName(this.name).option[id] || null);
		var id = PREFIX + this.name + '_' + id;
		var label = label.replace(' ','&nbsp;');
		var options = [];
		opts = this.options(opts);
		if (!list) list = [];
		if (typeof list == 'number') { // Give us a selection of numbers
			var step = Divisor(list), max = list;
			list = [];
			for (var i=0; i<=max; i+=step) list.push(i);
		}
		for (var i in list) {
			if (typeof list[i] == 'object') options[i] = '<option value="'+list[i][0]+'"'+(value==list[i][0]?' selected':'')+'>'+list[i][0]+' ('+list[i][1]+opts.suffix+')</option>';
			else options[i] = '<option value="'+list[i]+'"'+(value==list[i]?' selected':'')+'>'+list[i]+opts.suffix+'</option>';
		}
		$(this.show).append('<div style="clear:both"><span style="float:left;">'+label+'</span><span style="float:right;text-align:right">'+opts.before+'<select id="'+id+'">'+options.join('')+'</select>'+opts.after+'</span></div>');
		return id;
	};
	this.multiple = function(id,label,list,opts) {
		var value = (WorkerByName(this.name).option[id] || []);
		var id = PREFIX + this.name + '_' + id;
		var label = label.replace(' ','&nbsp;');
		var options = [], values = [];
		opts = this.options(opts);
		if (!list) list = [];
		for (var i in list) {
			if (typeof list[i] == 'object') options[i] = '<option value="'+list[i][0]+'">'+list[i][0]+' ('+list[i][1]+')</option>';
			else options[i] = '<option value="'+list[i]+'">'+list[i]+'</option>';
		}
		for (var i in value) {
			values[i] = '<option value="'+value[i]+'">'+value[i]+'</option>';
		}
		var $obj = $('<div style="clear:both"><span style="float:left;">'+label+'</span><span style="float:right;text-align:right"><select style="width:100%" class="golem_multiple" multiple id="'+id+'">'+values.join('')+'</select><br><select class="golem_select">'+options.join('')+'</select><input type="button" class="golem_addselect" value="Add" /><input type="button" class="golem_delselect" value="Del" /></span></div>');
		$('input.golem_addselect', $obj).click(function(){
			$('select.golem_multiple', $(this).parent()).append('<option>'+$('select.golem_select', $(this).parent()).val()+'</option>');
			Config.updateOptions();
		});
		$('input.golem_delselect', $obj).click(function(){
			$('select.golem_multiple option[selected=true]', $(this).parent()).each(function(i,el){$(el).remove();})
			Config.updateOptions();
		});
		$(this.show).append($obj);
		return id;
	};
	this.range = function(id,label,opts) {	// Would prefer to use jQueryUI .slider instead, but doesn't like GM
		var value1 = (WorkerByName(this.name).option[id+'_min'] || 0);
		var value2 = (WorkerByName(this.name).option[id+'_max'] || 100);
		var id = PREFIX + this.name + '_' + id;
		var label = label.replace(' ','&nbsp;');
		opts = this.options(opts);//<input type="text" id="' + id + '" size="'+opts.size+'" value="'+value+'">
		var step = Divisor(opts.max-opts.min), list1 = [], list2 = [];
		if (typeof value1 == 'number') value1 -= value1 % step;
		if (typeof value2 == 'number') value2 -= value2 % step;
		for (var i=opts.min; i<=opts.max; i+=step) {
			list1.push('<option value="'+i+'"'+(value1==i?' selected':'')+'>'+i+'</option>');
			list2.push('<option value="'+i+'"'+(value2==i?' selected':'')+'>'+i+'</option>');
		}
		list1.unshift('<option value="None"'+(value1=='None'?' selected':'')+'>None</option>');
		list2.push('<option value="All"'+(value2=='All'?' selected':'')+'>All</option>');
		$(this.show).append('<div style="clear:both"><span style="float:left;">'+label+'</span><span style="float:right;text-align:right">'+opts.before+'<select id="'+id+'_min">'+list1.join('')+'</select> '+opts.between+' <select id="'+id+'_max">'+list2.join('')+'</select>'+opts.after+'</span></div>');
		return id;
	};
	this.general = function(id,label,options) {
		var id = PREFIX + this.name + '_' + id;
		var label = label.replace(' ','&nbsp;');
		$(this.show).append('<div style="clear:both"><span style="float:left;">'+label+'</span><span style="float:right;"><select id="'+id+'" class="golem_generals" alt="'+options+'"></select></span></div>');
	};
	this.div = function(id,text) {
		var id = PREFIX + this.name + '_' + id;
		$(this.show).append('<div id="'+id+'" style="clear:both">'+text+'<br /><br /></div>');
		return id;
	};
	this.info = function(text,id,label) {
		if (id && label) {
			var id = PREFIX + this.name + '_' + id;
			var label = label.replace(' ','&nbsp;');
			$(this.show).append('<div style="clear:both"><span style="float:left;">'+label+'</span><span style="float:right;" id="'+id+'">'+text+'</span></div>');
			return id;
		} else {
			$(this.show).append('<div style="clear:both">'+text+'<br /><br /></div>');
		}
	};
}
/********** Settings **********
* Used for storing prefs, prefer to use this over GM_set/getValue
* Should never be called by anyone directly - let the main function do it when needed
*/
var Settings = {
	SetValue:function(n,v) {
		switch(typeof v) {
			case 'boolean':
			case 'number':	return GM_setValue(n,v);
			case 'string':	return GM_setValue(n,'"' + v + '"');
			case 'array':
			case 'object':	return GM_setValue(n,v.toSource());
			default:		GM_debug("Unknown variable type: "+n);
		}
		return null;
	},
	GetValue:function(n,v) {
		v = GM_getValue(n,v);
		if (typeof v === 'string') {
			if (v.charAt(0) === '"') {
				v = v.replace(/^"|"$/g,'');
			} else if (v.charAt(0) === '(' || v.charAt(0) === '[') {
				v = eval(v);
			}
		}
		return v;
	},
	Save:function(type, worker) {
		if (typeof type === 'object') {
			worker = type; type = 'data';
		}
		if (type!=='data' && type!=='option') {
			type = 'data';
		}
		if (worker && worker[type]) {
			Settings.SetValue(type+'.'+worker.name, worker[type]);
		} else {
			for (var i in Workers) {
				if (Workers[i][type]) {
					Settings.SetValue(type+'.'+Workers[i].name, Workers[i][type]);
				}
			}
		}
	},
	Load:function(type, worker) {
		if (typeof type === 'object') {
			worker = type; type = 'data';
		}
		if (type!=='data' && type!=='option') {
			type = 'data';
		}
		if (worker && worker[type]) {
			worker[type] = Settings.GetValue(type+'.'+worker.name, worker[type]);
		} else {
			for (var i in Workers) {
				if (Workers[i][type]) {
					Workers[i][type] = Settings.GetValue(type+'.'+Workers[i].name, Workers[i][type]);
				}
			}
		}
	}
};
// Utility functions

// Prototypes to ease functionality

String.prototype.trim = function() { return this.replace(/^\s+|\s+$/g, ''); };
String.prototype.filepart = function() { var x = this.lastIndexOf('/'); if (x>=0) {return this.substr(x+1);} return this; };
String.prototype.pathpart = function() { var x = this.lastIndexOf('/'); if (x>=0) {return this.substr(0, x+1);} return this; };
//String.prototype.regex = function(r) { var a = r.exec(this); if (a) {a.shift(); if (a.length==1) return (a[0].search(/^[0-9]+\.?[0-9]*$/)?a[0]:parseFloat(a[0]));} return a; };
String.prototype.regex = function(r) { var a = this.match(r),i; if (a) { a.shift(); for(i=0;i<a.length;i++){ if(a[i] && a[i].search(/^[-+]?[0-9]+\.?[0-9]*$/)>=0){a[i]=parseFloat(a[i]);} } if (a.length===1) {return a[0];} } return a; };
String.prototype.toNumber = function() { return parseFloat(this); };
String.prototype.parseTimer = function() { var a=this.split(':'),b=0,i; for(i=0;i<a.length;i++){b=b*60+parseInt(a[i],10);} if(isNaN(b)){b=9999;} return b; };

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
var getAttDef = function(list, unitfunc, x, count, user) { // Find total att(ack) or def(ense) value from a list of objects (with .att and .def)
	var units = [], attack = 0, defend = 0, x2 = (x=='att'?'def':'att'), i, own;
	for (i in list) unitfunc(units, i, list);
	units.sort(function(a,b) { return (list[b][x] + (0.7 * list[b][x2])) - (list[a][x] + (0.7 * list[a][x2])); });
	for (i=0; i<units.length; i++) {
		own = typeof list[units[i]].own === 'number' ? list[units[i]].own : 1;
		if (user) {
			if (Math.min(count, own) > 0) {
				GM_debug('Using: '+Math.min(count, own)+' x '+units[i]+' = '+list[units[i]].toSource());
				if (!list[units[i]].use) list[units[i]].use = {};
				list[units[i]].use[(user+'_'+x)] = Math.min(count, own);
			} else if (list[units[i]].use) {
				delete list[units[i]].use[user+'_'+x];
				if (!length(list[units[i]].use)) delete list[units[i]].use;
			}
		}
		if (count <= 0) break;
		var amount = Math.min(count, own);
		attack += amount * list[units[i]].att;
		defend += amount * list[units[i]].def;
		count -= amount;
	}
	return (x=='att'?attack:(0.7*attack)) + (x=='def'?defend:(0.7*defend));
}

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
	this.unsortable = false
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
/********** Worker.Alchemy **********
* Get all ingredients and recipes
*/
Alchemy = new Worker('Alchemy', 'keep_alchemy');
Alchemy.onload = function() {
	if (!Alchemy.data.ingredients) Alchemy.data.ingredients = {};
	if (!Alchemy.data.recipe) Alchemy.data.recipe = {};
}
Alchemy.parse = function(change) {
	var ingredients = Alchemy.data.ingredients = {};
	var recipe = Alchemy.data.recipe = {};
	$('div.ingredientUnit').each(function(i,el){
		var name = $('img', el).attr('src').filepart();
		ingredients[name] = $(el).text().regex(/x([0-9]+)/);
	});
	$('div.alchemyQuestBack,div.alchemyRecipeBack,div.alchemyRecipeBackMonster').each(function(i,el){
		var me = {};
		var title = $('div.recipeTitle', el).text().trim().replace('RECIPES: ','');
		if (title.indexOf(' (')>0) title = title.substr(0, title.indexOf(' ('));
		if ($(el).hasClass('alchemyQuestBack')) me.type = 'Quest';
		else if ($(el).hasClass('alchemyRecipeBack')) me.type = 'Recipe';
		else if ($(el).hasClass('alchemyRecipeBackMonster')) me.type = 'Summons';
		else me.type = 'wtf';
		me.ingredients = {};
		$('div.recipeImgContainer', el).parent().each(function(i,el){
			var name = $('img', el).attr('src').filepart();
			me.ingredients[name] = ($(el).text().regex(/x([0-9]+)/) || 1);
		});
		recipe[title] = me;;
	});
}
Alchemy.display = function() {
	var panel = new Panel(this.name);
	panel.checkbox('perform', 'Automatically Perform');
	panel.checkbox('hearts', 'Use Battle Hearts');
	return panel.show;
}
Alchemy.work = function(state) {
	if (!length(Alchemy.data.ingredients)) { // Need to parse it at least once
		if (!state) return true;
		if (!Page.to('keep_alchemy')) return true;
	}
	if (!Alchemy.option.perform) return false;
	var found = null, recipe = Alchemy.data.recipe;
	for (var r in recipe) if (recipe[r].type == 'Recipe') {
		found = r;
		for (var i in recipe[r].ingredients) {
			if ((!Alchemy.option.hearts && i == 'raid_hearts.gif') || recipe[r].ingredients[i] > (Alchemy.data.ingredients[i] || 0)) {
				found = null;
				break;
			}
		}
		if (found) break;
	}
	if (!found) return false;
	if (!state) return true;
	if (!Page.to('keep_alchemy')) return true;
	GM_debug('Alchemy: Perform - '+found);
	$('div.alchemyRecipeBack').each(function(i,el){
		if($('div.recipeTitle', el).text().indexOf(found) >=0) {
			Page.click($('input[type="image"]', el));
			return true;
		}
	});
	return true;
}
/********** Worker.Bank **********
* Auto-banking
*/
Bank = new Worker('Bank');
Bank.data = null;
Bank.onload = function() {
	if (!Bank.option.above || isNaN(Bank.option.above)) Bank.option.above = 0;
	if (!Bank.option.hand || isNaN(Bank.option.hand)) Bank.option.hand = 0;
	if (!Bank.option.keep || isNaN(Bank.option.keep)) Bank.option.keep = 0;
}
Bank.display = function() {
	var panel = new Panel(this.name);
	panel.checkbox('general', 'Use Best General:');
	panel.text('above', 'Bank Above:');
	panel.text('hand', 'Keep in Cash:');
	panel.text('keep', 'Keep in Bank:');
	return panel.show;
}
Bank.work = function(state) {
	if (Player.data.cash < Bank.option.above) return false;
	if (!state) return true;
	if (!Bank.stash(Player.data.cash - Math.min(Bank.option.above, Bank.option.hand))) return true;
	return false;
}
Bank.stash = function(amount) {
	if (!amount || !Player.data.cash) return true;
	if (Bank.option.general && !Generals.to('Aeris')) return false;
	if (!Page.to('keep_stats')) return false;
	$('input[name="stash_gold"]').val(Math.min(Player.data.cash, amount));
	Page.click('input[value="Stash"]');
	return true;
}
Bank.retrieve = function(amount) {
	amount -= Player.data.gold;
	if (amount <= 0) return true;
	if ((Player.data.bank - Bank.option.keep) < amount) return true; // Got to deal with being poor...
	if (!Page.to('keep_stats')) return false;
	$('input[name="get_gold"]').val(amount);
	Page.click('input[value="Retrieve"]');
	return true;
}
Bank.worth = function() { // Anything withdrawing should check this first!
	return Player.data.cash + Math.max(0,Player.data.bank - Bank.option.keep);
}
/********** Worker.Battle **********
* Battling other players (NOT raid)
*/
Battle = new Worker('Battle', 'battle_battle battle_rank');
Battle.onload = function() {
	if (!Battle.data.user) Battle.data.user = {};
	if (!Battle.data.rank) Battle.data.rank = {};
	if (!Battle.data.points) Battle.data.points = [];
	if (!Battle.option.type) Battle.option.type = 'Invade';
}
Battle.parse = function(change) {
	if (change) return false;
	if (Page.page == 'battle_battle') {
		var data = Battle.data.user;
		for (var i in data) {
			if (Player.data.rank - data[i].rank >= 5) {
				delete data[i]; // Forget low rank - no points
			}
		}
		if (Battle.data.attacking) {
			var uid = Battle.data.attacking;
			if ($('div.results').text().match(/You cannot battle someone in your army/i)) {
				delete data[uid];
			} else if ($('div.results').text().match(/Your opponent is dead or too weak/i)) {
				data[uid].dead = Date.now();
			} else if ($('img[src*="battle_victory"]').length) {
				if (!data[uid].win) data[uid].win = 1;
				else data[uid].win++;
			} else if ($('img[src*="battle_defeat"]').length) {
				if (!data[uid].loss) data[uid].loss = 1;
				else data[uid].loss++;
			} else {
				// Some other message - probably be a good idea to remove the target or something
				// delete data[uid];
			}
			Battle.data.attacking = null;
		}
		Battle.data.points = $('#app'+APP+'_app_body table.layout table table').prev().text().replace(/[^0-9\/]/g ,'').regex(/([0-9]+)\/10([0-9]+)\/10([0-9]+)\/10([0-9]+)\/10([0-9]+)\/10/);
		$('#app'+APP+'_app_body table.layout table table tr:even').each(function(i,el){
			var uid = $('img[uid!=""]', el).attr('uid');
			var info = $('td.bluelink', el).text().trim().regex(/Level ([0-9]+) (.*)/i);
			if (!uid || !info) return;
			if (!data[uid]) data[uid] = {};
			data[uid].name = $('a', el).text().trim();
			data[uid].level = info[0];
			data[uid].rank = Battle.rank(info[1]);
			data[uid].army = $('td.bluelink', el).next().text().regex(/([0-9]+)/);
			data[uid].align = $('img[src*="graphics/symbol_"]', el).attr('src').regex(/symbol_([0-9])/i);
		});
	} else if (Page.page == 'battle_rank') {
		var data = Battle.data.rank = {0:{name:'Squire',points:0}};
		$('tr[height="23"]').each(function(i,el){
			var info = $(el).text().regex(/Rank ([0-9]+) - (.*)\s*([0-9]+)/i);
			data[info[0]] = {name:info[1], points:info[2]};
		});
	}
//	GM_debug('Battle: '+Battle.data.toSource());
	return false;
}
Battle.display = function() {
	var panel = new Panel(this.name);
	panel.info('NOTE: Attacks at a loss up to 5 times more than a win');
	panel.checkbox('general', 'Use Best General');
	panel.select('type', 'Battle Type', ['Invade', 'Duel']);
	panel.checkbox('points', 'Always Get Demi-Points');
	panel.checkbox('monster', 'Fight Monsters First');
	return panel.show;
}
Battle.work = function(state) {
	if (!length(Battle.data.rank)) { // Need to parse it at least once
		if (!state) return true;
		Page.to('battle_battlerank');
	}
	if (!length(Battle.data.points)) { // Need to parse it at least once
		if (!state) return true;
		Page.to('battle_battle');
	}
	if (Player.data.health <= 10 || Queue.burn.stamina < 1) return false;
	var i, points = [], list = [], user = Battle.data.user;
	if (Battle.option.points) for (i=0; i<Battle.data.points.length; i++) if (Battle.data.points[i] < 10) points[i+1] = true;
	if ((!Battle.option.points || !points.length) && Battle.option.monster && Monster.uid) return false;
	for (var i in user) {
		if (user[i].dead && user[i].dead + 1800000 < Date.now()) continue; // If they're dead ignore them for 3m * 10hp = 30 mins
		if ((user[i].win || 0) - (user[i].loss || 0) < 5) continue; // Don't attack someone who wins more often
		if (!Battle.option.points || !points.length || typeof points[user[i].align] !== 'undefined') {
			list.push(i);
		}
	}
	if (!list.length) return false;
	if (!state) return true;
	if (Battle.option.general && !Generals.to(Generals.best(Battle.option.type))) return true;
	if (!Page.to('battle_battle')) return true;
	var uid = list[Math.floor(Math.random() * list.length)];
	GM_debug('Battle: Wanting to attack '+user[uid].name+' ('+uid+')');
	var $form = $('form input[alt="'+Battle.option.type+'"]').first().parents('form');
	if (!$form.length) {
		GM_log('Battle: Unable to find attack buttons, forcing reload');
		Page.to('index');
		return false;
	}
	Battle.data.attacking = uid;
	$('input[name="target_id"]', $form).attr('value', uid)
	Page.click($('input[type="image"]', $form));
	return true;
}
Battle.rank = function(name) {
	for (var i in Battle.data.rank) if (Battle.data.rank[i].name == name) return parseInt(i);
	return 0;
}
/********** Worker.Blessing **********
* Automatically receive blessings
*/
Blessing = new Worker('Blessing', 'oracle_demipower');
Blessing.which = ['None', 'Energy', 'Attack', 'Defense', 'Health', 'Stamina'];
Blessing.parse = function(change) {
	var result = $('div.results');
	if (result.length) {
		var time = result.text().regex(/Please come back in: ([0-9]+) hours and ([0-9]+) minutes/i);
		if (time && time.length) Blessing.data.when = Date.now() + (((time[0] * 60) + time[1] + 1) * 60000);
		else if (result.text().match(/You have paid tribute to/i)) Blessing.data.when = Date.now() + 86460000; // 24 hours and 1 minute
	}
	return false;
}
Blessing.display = function() {
	var panel = new Panel(this.name);
	panel.select('which', 'Which:', Blessing.which)
	return panel.show;
}
Blessing.work = function(state) {
	if (!Blessing.option.which || Blessing.option.which == 'None') return false;
	if (Date.now() <= Blessing.data.when) return false;
	if (!state) return true;
	if (!Page.to('oracle_demipower')) return true;
	Page.click('#app'+APP+'_symbols_form_'+Blessing.which.indexOf(Blessing.option.which)+' input.imgButton');
	return false;
}
/********** Worker.Config **********
* Has everything to do with the config
*/
var $configWindow = null;

Config = new Worker('Config');
Config.data = null;
Config.option = '({top:60,left:25,width:250,height:"auto",active:false})';
Config.panel = null;
Config.onload = function() {
	$('head').append('<link rel="stylesheet" href="http://cloutman.com/css/base/jquery-ui.css" type="text/css" />');
	var pos = 'top:'+Config.option.top+'px;left:'+Config.option.left+'px;width:'+Config.option.width+'px;height:auto;';
//<img id="golem_working" src="http://cloutman.com/css/base/images/ui-anim.basic.16x16.gif" style="border:0;float:right;display:none;" alt="Working...">
	Config.panel = $('<div class="ui-widget-content" style="'+pos+'padding:0;position:absolute;overflow:hidden;overflow-y:auto;"><div class="ui-widget-header" id="golem_title" style="padding:4px;cursor:move;overflow:hidden;">Castle Age Golem v'+VERSION+'</div><div id="golem_buttons" style="margin:4px;"></div><div id="golem_config" style="margin:4px;overflow:hidden;overflow-y:auto;"></div></div>');
	$('#content').append(Config.panel);
	$(Config.panel)
		.draggable({ containment:'parent', handle:'#golem_title', stop:function(){Config.saveWindow();} })
		.resizable({ containment:'parent', handles:'se', minWidth:100, resize:function(){$('#golem_config').height($(Config.panel).height()-$('#golem_config').position().top-8)}, stop:function(){Config.saveWindow();} });
//	$('.ui-resizable-se', Config.panel).last().dblclick(function(){$(Config.panel).css('height','auto');});
	var $golem_config = $('#golem_config');
	$golem_config
		.sortable({axis:"y"});//, items:'div', handle:'h3'
	for (var i in Workers) {	// Load the display panels up
		if (Workers[i].display) {
//			GM_debug(Workers[i].name + '.display()');
			var panel = Workers[i].display();
			if (panel) { // <span class="ui-icon ui-icon-arrow-1-n"></span><span class="ui-icon ui-icon-arrow-1-s"></span>
				Workers[i].priv_id = 'golem_panel_'+Workers[i].name.toLowerCase().replace(/[^0-9a-z]/,'_');
				// <input type="checkbox" id="'+Workers[i].priv_id+'_disabled" '+(true?' checked':'')+'>
				var $newPanel = $('<div id="'+Workers[i].priv_id+'"'+(Workers[i].unsortable?' class="golem_unsortable"':'')+' name="'+Workers[i].name+'"><h3><a>'+(Workers[i].unsortable?'<img "class="ui-icon ui-icon-locked" style="left:2em;width:16px;height:16px" />&nbsp;&nbsp;&nbsp;&nbsp;':'')+Workers[i].name+'</a></h3></div>');
				$newPanel.append(panel);
				$golem_config.append($newPanel);
			}
		}
	}
	$golem_config
		.accordion({ autoHeight:false, clearStyle:true, active:false, collapsible:true, header:'div > h3', change:function(){Config.saveWindow();} });
	$golem_config.children(':not(.golem_unsortable)')
		.draggable({ connectToSortable:'#golem_config', axis:'y', distance:5, scroll:false, handle:'h3', helper:'clone', opacity:0.75, zIndex:100,
refreshPositions:true, stop:function(){Config.updateOptions();} })
		.droppable({ tolerance:'pointer', over:function(e,ui) {
			if (Config.getPlace($(this).attr('id')) < Config.getPlace($(ui.draggable).attr('id'))) $(this).before(ui.draggable);
			else $(this).after(ui.draggable);
		} });
	Generals.select();
	$('input ,textarea, select', $golem_config).change( function(){Config.updateOptions()} );
//	$(Config.panel).css({display:'block'});
}
Config.saveWindow = function() {
	Config.option.top = $(Config.panel).offset().top;
	Config.option.left = $(Config.panel).offset().left;
	Config.option.width = $(Config.panel).width();
	Config.option.height = $(Config.panel).height();
	Config.option.active = $('#golem_config h3.ui-state-active').parent().attr('id');
//	Config.option.active = $('#golem_config').accordion('option','active'); // Accordian is still bugged at the time of writing...
	Settings.Save('option', Config);
}
Config.updateOptions = function() {
	GM_debug('Options changed');
	// Get order of panels first
	var found = {};
	Queue.option.queue = [];
	$('#golem_config > div').each(function(i,el){
		var name = WorkerById($(el).attr('id')).name;
		if (!found[name]) Queue.option.queue.push(name);
		found[name] = true;
	});
	// Now save the contents of all elements with the right id style
	$('#golem_config :input').each(function(i,el){
		if ($(el).attr('id')) {
			var tmp = $(el).attr('id').slice(PREFIX.length).regex(/([^_]*)_(.*)/i);
			if (!tmp) return;
			if ($(el).attr('type') == 'checkbox') {
				WorkerByName(tmp[0]).option[tmp[1]] = $(el).attr('checked');
			} else if ($(el).attr('multiple')) {
				var val = [];
				$('option', el).each(function(i,el){val.push($(el).text())});
				WorkerByName(tmp[0]).option[tmp[1]] = val;
			} else {
				var val = ($(el).val() || null);
				if (val && val.search(/[^0-9.]/)) val = parseFloat(val);
				WorkerByName(tmp[0]).option[tmp[1]] = val;
			}
		}
	});
	Settings.Save('option');
}
Config.getPlace = function(id) {
	var place = -1;
	$('#golem_config > div').each(function(i,el){
		if ($(el).attr('id') == id && place == -1) place = i;
	});
	return place;
}
/********** Worker.Dashboard **********
* Displays statistics and other useful info
*/
Dashboard = new Worker('Dashboard', '*');
Dashboard.parse = function(change) {
//	if (!change) return true; // Ok, so we're lying...
	if (!$('#golem_dashboard').length) {
		$('#app'+APP+'_nvbar_nvl').css({width:'760px', 'padding-left':0, 'margin':'auto'});
		$('<div><div class="nvbar_start"></div><div class="nvbar_middle"><a id="golem_toggle_dash"><span class="hover_header">Dashboard</span></a></div><div class="nvbar_end"></div></div><div><div class="nvbar_start"></div><div class="nvbar_middle"><a id="golem_toggle_config"><span class="hover_header">Config</span></a></div><div class="nvbar_end"></div></div>').prependTo('#app'+APP+'_nvbar_nvl > div:last-child');
		$('<div id="golem_dashboard" style="position:absolute;width:600px;height:185px;margin:0;border-left:1px solid black;border-right:1px solid black;padding4px;overflow:hidden;overflow-y:auto;background:white;z-index:1;">Dashboard...</div>').prependTo('#app'+APP+'_main_bn_container');
		$('#golem_toggle_dash').toggle(function(){$('#golem_dashboard').hide();}, function(){$('#golem_dashboard').show();});
		$('#golem_toggle_config').toggle(function(){$('#golem_title').parent().hide();}, function(){$('#golem_title').parent().show();});
	}
	return false;
}
/********** Worker.Debug() **********
* Turns on/off the debug flag - doesn't save
*/
Debug = new Worker('Debug');
Debug.data = null;
Debug.option = null;
Debug.display = function() {
	if (!debug) return null; // Only add the button if debug is default on
	var $btn = $('<button>Debug</button>')
		.button()
		.click(function(){debug^=true;GM_log('Debug '+(debug?'on':'off'));$('span', this).css('text-decoration', (debug?'none':'line-through'));});
	$('#golem_buttons').append($btn);
	return null;
}
/********** Worker.Generals **********
* Updates the list of Generals
* Finds best General for other classes
* *** Need to take into account army size and real stats for attack and defense
*/
Generals = new Worker('General', 'heroes_generals');
Generals.best_id = null;
Generals.onload = function() {
	if (!Generals.data) Generals.data = {};
}
Generals.parse = function(change) {
	if (!change) {
		var data = {};
		$('#app'+APP+'_generalContainerBox2 > div > div.generalSmallContainer2').each(function(i,el){
			var $child = $(el).children();
			var name = $child.eq(0).text().trim();
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
		var data = Generals.data;
		for (var i in data) {
			var attack = Player.data.attack + (data[i].skills.regex(/([+-]?[0-9]+) Player Attack/i) || 0) + (data[i].skills.regex(/Increase Player Attack by ([0-9]+)/i) || 0);
			var defend = Player.data.defense + (data[i].skills.regex(/([+-]?[0-9]+) Player Defense/i) || 0) + (data[i].skills.regex(/Increase Player Defense by ([0-9]+)/i) || 0);
			var army = (data[i].skills.regex(/Increases? Army Limit to ([0-9]+)/i) || 501);
			var gen_att = getAttDef(Generals.data, function(list,i){list.push(i);}, 'att', Math.floor(army / 5));
			var gen_def = getAttDef(data, function(list,i){list.push(i);}, 'def', Math.floor(army / 5))
			data[i].invade = {
				att: Math.floor(Town.data.invade.attack + data[i].att + (data[i].def * 0.7) + ((attack + (defend * 0.7)) * army) + gen_att),
				def: Math.floor(Town.data.invade.defend + data[i].def + (data[i].att * 0.7) + ((defend + (data[i].skills.regex(/([-+]?[0-9]+) Defense when attacked/i) || 0) + (attack * 0.7)) * army) + gen_def)
			};
			data[i].duel = {
				att: Math.floor(Town.data.duel.attack + data[i].att + (data[i].def * 0.7) + attack + (defend * 0.7)),
				def: Math.floor(Town.data.duel.defend + data[i].def + (data[i].att * 0.7) + defend + (attack * 0.7))
			};
		}
		var iatt = 0, idef = 0, datt = 0, ddef = 0;
		for (var i in Generals.data) {
			iatt = Math.max(iatt, Generals.data[i].invade.att);
			idef = Math.max(idef, Generals.data[i].invade.def);
			datt = Math.max(datt, Generals.data[i].duel.att);
			ddef = Math.max(ddef, Generals.data[i].duel.def);
		}
		$('#app'+APP+'_generalContainerBox2 > div > div.generalSmallContainer2').each(function(i,el){
			var $child = $(el).children(), name = $child.eq(0).text().trim();
			$child.eq(1).prepend('<div style="position:absolute;margin-left:8px;margin-top:2px;font-size:smaller;text-align:left;z-index:100;color:#ffd200;text-shadow:black 1px 1px 2px;"><strong>Invade</strong><br>&nbsp;&nbsp;&nbsp;Atk: '+(data[name].invade.att==iatt?'<span style="font-weight:bold;color:#00ff00;">':'')+addCommas(data[name].invade.att)+(data[name].invade.att==iatt?'</span>':'')+'<br>&nbsp;&nbsp;&nbsp;Def: '+(data[name].invade.def==idef?'<span style="font-weight:bold;color:#00ff00;">':'')+addCommas(data[name].invade.def)+(data[name].invade.def==idef?'</span>':'')+'<br><strong>Duel</strong><br>&nbsp;&nbsp;&nbsp;Atk: '+(data[name].duel.att==datt?'<span style="font-weight:bold;color:#00ff00;">':'')+addCommas(data[name].duel.att)+(data[name].duel.att==datt?'</span>':'')+'<br>&nbsp;&nbsp;&nbsp;Def: '+(data[name].duel.def==ddef?'<span style="font-weight:bold;color:#00ff00;">':'')+addCommas(data[name].duel.def)+(data[name].duel.def==ddef?'</span>':'')+'<br></div>');
		});
	}
	return true;
}
Generals.work = function(state) {
	if (!length(Generals.data)) Page.to('heroes_generals'); // Only ever run it once the first time we're loaded - can't be blocked
	return false;
}
Generals.to = function(name) {
	if (!name || Player.data.general == name || name == 'any') return true;
	if (!Generals.data[name]) {
		GM_log('General "'+name+'" requested but not found!');
		return true; // Not found, so fake it
	}
	if (!Page.to('heroes_generals')) return false;
	GM_debug('Changing to General '+name);
	Page.click('input[src$="'+Generals.data[name].img+'"]');
	return false;
}
Generals.best = function(type) {
	if (!Generals.data) return 'any';
	var rx = '';
	switch(type.toLowerCase()) {
		case 'cost':		rx = /Decrease Soldier Cost by ([0-9]+)/i; break;
		case 'stamina':		rx = /Increase Max Stamina by ([0-9]+)|\+([0-9]+) Max Stamina/i; break;
		case 'energy':		rx = /Increase Max Energy by ([0-9]+)|\+([0-9]+) Max Energy/i; break;
		case 'income':		rx = /Increase Income by ([0-9]+)/i; break;
		case 'influence':	rx = /Bonus Influence ([0-9]+)/i; break;
		case 'attack':		rx = /([+-]?[0-9]+) Player Attack/i; break;
		case 'defense':		rx = /([+-]?[0-9]+) Player Defense/i; break;
		case 'invade':
			var best = null;
			for (var i in Generals.data) if (!best || (Generals.data[i].invade && Generals.data[i].invade.att > Generals.data[best].invade.att)) best = i;
			return (best || 'any');
		case 'duel':
			var best = null;
			for (var i in Generals.data) if (!best || (Generals.data[i].duel && Generals.data[i].duel.att > Generals.data[best].duel.att)) best = i;
			return (best || 'any');
		case 'defend':
			var best = null;
			for (var i in Generals.data) if (!best || (Generals.data[i].duel && Generals.data[i].duel.def > Generals.data[best].duel.def)) best = i;
			return (best || 'any');
		case 'under level 4':
			if (Generals.data[Player.data.general] && Generals.data[Player.data.general].level < 4) return Player.data.general;
			return Generals.random(false);
		default: return 'any';
	}
	var best = null;
	var bestval = 0;
	for (var i in Generals.data) {
		var value = Generals.data[i].skills.regex(rx);
		if (value) {
			if (!best || value>bestval) {
				best = i;
				bestval = value;
			}
		}
	}
	if (best) GM_debug('Best general found: '+best);
	return best;
}
Generals.random = function(level4) { // Note - true means *include* level 4
	var list = [];
	for (var i in Generals.data) {
		if (level4) list.push(i);
		else if (Generals.data[i].level < 4) list.push(i);
	}
	if (list.length) return list[Math.floor(Math.random()*list.length)];
	else return 'any';
}
Generals.list = function(opts) {
	var list = [];
	if (!opts) {
		for (var i in Generals.data) list.push(i);
		list.sort();
	} else if (opts.find) {
		for (var i in Generals.data) {
			if (Generals.data[i].skills.indexOf(opts.find) >= 0) {
				list.push(i);
			}
		}
	} else if (opts.regex) {
		for (var i in Generals.data) {
			var value = Generals.data[i].skills.regex(opts.regex);
			if (value) list.push([i, value]);
		}
		list.sort(function(a,b) { return b[1] - a[1]; });
//		for (var i in list) list[i] - list[i][0];
	}
	list.unshift('any');
	return list;
}
Generals.select = function() {
	$('select.golem_generals').each(function(i,el){
		$(el).empty();
		var tmp = $(el).attr('id').slice(PREFIX.length).regex(/([^_]*)_(.*)/i);
		var value = tmp ? WorkerByName(tmp[0]).option[tmp[1]] : null;
		var list = Generals.list();
		for (var i in list) {
			$(el).append('<option value="'+list[i]+'"'+(list[i]==value ? ' selected' : '')+'>'+list[i]+'</value>');
		}
	});
}
/********** Worker.Gift() **********
* Auto accept gifts and return if needed
* *** Needs to talk to Alchemy to work out what's being made
*/
Gift = new Worker('Gift', 'index army_invite army_gifts');
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
}
Gift.onload = function() {
	if (!Gift.data.uid) Gift.data.uid = [];
	if (!Gift.data.todo) Gift.data.todo = {};
	if (!Gift.data.gifts) Gift.data.gifts = {};
}
Gift.parse = function(change) {
	if (change) return false;
	if (Page.page == 'index') {
		// If we have a gift waiting it doesn't matter from whom as it gets parsed on the right page...
		if (!Gift.data.uid.length && $('div.result').text().indexOf('has sent you a gift') >= 0) Gift.data.uid.push(1);
	} else if (Page.page == 'army_invite') {
		// Accepted gift first
		GM_debug('Gift: Checking for accepted');
		if (Gift.data.lastgift) {
			if ($('div.result').text().indexOf('accepted the gift') >= 0) {
				var uid = Gift.data.lastgift;
				if (!Gift.data.todo[uid].gifts) Gift.data.todo[uid].gifts = [];
				Gift.data.todo[uid].gifts.push($('div.result img').attr('src').filepart());
				Gift.data.lastgift = null;
			}
		}
		// Check for gifts
		GM_debug('Gift: Checking for new to accept');
		var uid = Gift.data.uid = [];
		if ($('div.messages').text().indexOf('gift') >= 0) {
			GM_debug('Gift: Found gift div');
			$('div.messages img').each(function(i,el) {
				uid.push($(el).attr('uid'));
				GM_debug('Gift: Adding gift from '+$(el).attr('uid'));
			});
		}
	} else if (Page.page == 'army_gifts') {
		var gifts = Gift.data.gifts = {};
		GM_debug('Gifts found: '+$('#app'+APP+'_giftContainer div[id^="app'+APP+'_gift"]').length);
		$('#app'+APP+'_giftContainer div[id^="app'+APP+'_gift"]').each(function(i,el){
			GM_debug('Gift adding: '+$(el).text()+' = '+$('img', el).attr('src'));
			var id = $('img', el).attr('src').filepart();
			var name = $(el).text().trim().replace('!','');
			if (!gifts[id]) gifts[id] = {};
			gifts[id].name = name;
			if (Gift.lookup[name]) gifts[id].create = Gift.lookup[name];
		});
	}
	return false;
}
Gift.display = function() {
	var panel = new Panel(this.name);
	panel.info('Work in progress...');
	panel.select('type', 'Return Gifts:', ['None', 'Random', 'Same as Received']);
	return panel.show;
}
Gift.work = function(state) {
	if (!length(Gift.data.gifts)) { // Need to parse it at least once
		if (!state) return true;
		if (!Page.to('army_gifts')) return true;
	}
	if (!state) {
		if (Gift.data.uid.length == 0) return false;
		return true;
	}
	if (Gift.data.uid.length) { // Receive before giving
		if (!Page.to('army_invite')) return true;
		var uid = Gift.data.uid.shift();
		if (!Gift.data.todo[uid]) Gift.data.todo[uid] = {};
		Gift.data.todo[uid].time = Date.now();
		Gift.data.lastgift = uid;
		GM_debug('Gift: Accepting gift from '+uid);
		if (!Page.to('army_invite', '?act=acpt&rqtp=gift&uid=' + uid)) return true;
		if (Gift.data.uid.length > 0) return true;
	}
	Page.to('keep_alchemy');
	return false;
}
/********** Worker.Heal **********
* Auto-Heal above a stamina level
* *** Needs to check if we have enough money (cash and bank)
*/
Heal = new Worker('Heal');
Heal.data = null;
Heal.onload = function() {
	if (!Heal.option.stamina) Heal.option.stamina = 0;
	if (!Heal.option.health) Heal.option.health = 0;
}
Heal.display = function() {
	var panel = new Panel(this.name);
	panel.select('stamina', 'Heal Above', Player.data.maxstamina, {after:' stamina'});
	panel.select('health', '...And Below', Player.data.maxhealth, {after:' health'});
	return panel.show;
}
Heal.work = function(state) {
	if (Player.data.health >= Player.data.maxhealth) return false;
	if (Player.data.stamina < Heal.option.stamina) return false;
	if (Player.data.health >= Heal.option.health) return false;
	if (!state) return true;
	if (!Page.to('keep_stats')) return true;
	GM_debug('Heal: Healing...');
	if ($('input[value="Heal Wounds"]').length) Page.click('input[value="Heal Wounds"]');
	else GM_log('Danger Danger Will Robinson... Unable to heal!');
	return false;
}
/********** Worker.Idle **********
* Set the idle general
* Keep focus for disabling other workers
*/
Idle = new Worker('Idle');
Idle.data = null;
Idle.display = function() {
	var panel = new Panel(this.name), when = ['Never', 'Hourly', '2 Hours', '6 Hours', '12 Hours', 'Daily', 'Weekly'];
	panel.info('<strong>NOTE:</strong> Any workers below this will <strong>not</strong> run!<br>Use this for disabling workers you do not use.');
	panel.general('general', 'Idle General', 'any');
	panel.info('Check Pages:');
	panel.select('index', 'Home Page', when);
	panel.select('alchemy', 'Alchemy', when);
	panel.select('quests', 'Quests', when);
	panel.select('town', 'Town', when);
	panel.select('battle', 'Battle', when);
	return panel.show;
}
Idle.work = function(state) {
	var i, p, time, pages = {
		index:['index'],
		alchemy:['keep_alchemy'],
		quests:['quests_quest1', 'quests_quest2', 'quests_quest3', 'quests_quest4', 'quests_quest5', 'quests_quest6', 'quests_demiquests', 'quests_atlantis'],
		town:['town_soldiers', 'town_blacksmith', 'town_magic', 'town_land'],
		battle:['battle_battle']
	}, when = { 'Never':0, 'Hourly':3600000, '2 Hours':7200000, '6 Hours':21600000, '12 Hours':43200000, 'Daily':86400000, 'Weekly':604800000 };
	if (!state) return true;
	if (!Generals.to(Idle.option.general)) return true;
	for (i in pages) {
		if (!when[Idle.option[i]]) continue;
		time = Date.now() - when[Idle.option[i]];
		for (p=0; p<pages[i].length; p++) {
			if (!Page.data[pages[i][p]] || Page.data[pages[i][p]] < time) {
				if (!Page.to(pages[i][p])) return true;
			}
		}
	}
	return true;
}
/********** Worker.Income **********
* Auto-general for Income, also optional bank
* User selectable safety margin - at default 5 sec trigger it can take up to 14 seconds (+ netlag) to change
*/
Income = new Worker('Income');
Income.data = null;
Income.option = {margin:30};
Income.display = function() {
	var panel = new Panel(this.name);
	panel.checkbox('general', 'Use Best General:');
	panel.checkbox('bank', 'Automatically Bank:');
	panel.select('margin', 'Safety Margin', [15,30,45,60], {suffix:' seconds'});
	return panel.show;
}
Income.work = function(state) {
	if (!Income.option.margin) return false;
	var when = new Date();
	when = Player.data.cash_time - (when.getSeconds() + (when.getMinutes() * 60));
	if (when < 0) {when += 3600;}
//	GM_debug('Income: '+when+', Margin: '+Income.option.margin);
	if (when > Income.option.margin) {
		if (state && Income.option.bank) return Bank.work(true);
		return false;
	}
	if (!state) return true;
	if (Income.option.general && !Generals.to(Generals.best('income'))) return true;
	GM_debug('Income: Waiting for Income...');
	return true;
}
/********** Worker.Monster **********
* Automates Monster
*/
Monster = new Worker('Monster', 'keep_monster keep_monster_active');
Monster.uid = null;
Monster.display = function() {
	var panel = new Panel(this.name);
	panel.info('Work in progress...');
	panel.select('fortify', 'Fortify Below:', [10, 20, 30, 40, 50, 60, 70, 80, 90, 100], {after:'%'});
	panel.info('Random only...');
	panel.select('choice', 'Attack:', ['Random', 'Strongest', 'Weakest']);
	return panel.show;
}
Monster.parse = function(change) {
	if (Page.page == 'keep_monster_active') { // In a monster
//	if ($('input[src$="attack_monster_button2.jpg"]').length || $('input[src$="attack_monster_button3.jpg"]').length) { // In a monster
		var user = $('img[linked="true"][size="square"]').attr('uid');
		var $health = $('img[src$="monster_health_background.jpg"]').parent();
		Monster.data[user].health = Math.ceil($health.width() / $health.parent().width() * 100);
		if ($('img[src$="seamonster_ship_health.jpg"]').length) {
			var $defense = $('img[src$="seamonster_ship_health.jpg"]').parent();
			Monster.data[user].defense = Math.ceil($defense.width() / ($defense.width() + $defense.next().width()) * 100);
		}
		Monster.data[user].timer = $('#app'+APP+'_monsterTicker').text().parseTimer();
		var damage = {};
		$('td.dragonContainer table table a[href^="http://apps.facebook.com/castle_age/keep.php?user="]').each(function(i,el){
			var uid = $(el).attr('href').regex(/user=([0-9]+)/i);
			damage[uid] = parseInt($(el).parent().next().text().replace(/[^0-9]/g,''));
		});
		Monster.data[user].damage = damage;
//		GM_debug('Raid: '+Raid.data[user].toSource());
	} else if (Page.page == 'keep_monster') { // Check monster list
		for (var i in Monster.data) Monster.data[i].state = null;
		$('img[src*="dragon_list_btn_"]').each(function(i,el){
			var user = $(el).parent().attr('href').regex(/user=([0-9]+)/i);
			if (!Monster.data[user]) Monster.data[user] = {};
			switch($(el).attr('src').regex(/dragon_list_btn_([0-9])/)) {
				case 2: Monster.data[user].state = 'reward'; break;
				case 3: Monster.data[user].state = 'engage'; break;
				case 4: Monster.data[user].state = 'complete'; break;
				default: Monster.data[user].state = 'unknown'; break; // Should probably delete, but it's still on the list...
			}
			switch($(el).parent().parent().parent().prev().prev().html().regex(/graphics\/(.*)\./i)) {
				case 'castle_siege_list':	Monster.data[user].type = 'legion'; break;
				case 'stone_giant_list':	Monster.data[user].type = 'colossus'; break;
				case 'seamonster_list_red':	Monster.data[user].type = 'serpent'; break;
				case 'deathrune_list2':		Monster.data[user].type = 'raid'; break;
				default: Monster.data[user].type = 'unknown'; break;
			}
		});
		for (var i in Monster.data) if (!Monster.data[i].state) delete Monster.data[i];
	}
	return false;
}
Monster.work = function(state) {
	var list = [], uid, btn, i;
	if (!state) Monster.uid = null;
	if (!length(Monster.data)) return false;
	if (Player.data.health <= 10) return false;
	if (!Monster.uid || !Monster.data[Monster.uid] || Monster.data[Monster.uid] != 'engage') {
		Monster.uid = null;
		for (i in Monster.data) {
			if (Monster.data[i].state == 'engage') list.push(i);
		}
		if (!list.length) return false;
		Monster.uid = list[Math.floor(Math.random()*list.length)];
	}
	if (Queue.burn.stamina < 5) {
		if (Queue.burn.energy < 10) return false;
		if (!Monster.data[Monster.uid].defense) return false;
		if (Monster.data[Monster.uid].defense >= Monster.option.fortify) return false;
	}
	if (!state) return true;
	if (Monster.data[Monster.uid].defense && Monster.data[Monster.uid].defense <= Monster.option.fortify && Queue.burn.energy >= 10) {
		if (!Generals.to(Generals.best('defend'))) return true;
		GM_debug('Monster: Fortify '+Monster.uid);
		btn = $('input[src$="attack_monster_button3.jpg"]:first');
	} else {
		if (!Generals.to(Generals.best('duel'))) return true;
		GM_debug('Monster: Attack '+Monster.uid);
		btn = $('input[src$="attack_monster_button2.jpg"]:first');
	}
	if (!btn.length && !Page.to('keep_monster', '?user='+Monster.uid+'&mpool=3')) return true; // Reload if we can't find the button
	Page.click(btn);
	return true;
}
/********** Worker.Page() **********
* All navigation including reloading
*/
Page = new Worker('Page');
Page.unsortable = true;
Page.page = '';
Page.last = null; // Need to have an "auto retry" after a period
Page.lastclick = null;
Page.when = null;
Page.retry = 0;
Page.onload = function() {
	if (!Page.option.timeout) Page.option.timeout = 15;
	if (!Page.option.retry) Page.option.retry = 5;
}
Page.display = function() {
	var panel = new Panel(this.name);
	panel.select('timeout', 'Retry after ', [10, 15, 30, 60], {after:' seconds'});
	panel.select('retry', 'Reload after ', [2, 3, 5, 10], {after:' tries'});
	return panel.show;
}
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
		var filename = $(el).attr('src').filepart();
		for (var p in Page.pageNames) { if (filename == Page.pageNames[p].image) { Page.page = p; return; } }
	});
	if ($('#app'+APP+'_indexNewFeaturesBox').length) Page.page = 'index';
	else if ($('div[style*="giftpage_title.jpg"]').length) Page.page = 'army_gifts';
	if (Page.page != '') {Page.data[Page.page] = Date.now();}
//	GM_debug('Page.identify("'+Page.page+'")');
	return Page.page;
}
Page.to = function(page, args) {
	if (page == Page.page && typeof args == 'undefined') return true;
	if (!args) args = '';
	if (page && Page.pageNames[page] && Page.pageNames[page].url) {
		Page.clear();
		Page.last = Page.pageNames[page].url+args;
		Page.when = Date.now();
		GM_debug('Navigating to '+Page.last+' ('+Page.pageNames[page].url+')');
		if (unsafeWindow['a'+APP+'_get_cached_ajax']) unsafeWindow['a'+APP+'_get_cached_ajax'](Page.last, "get_body");
		else window.location.href = 'http://apps.facebook.com/castle_age/index.php?bm=1';
	}
	return false;
},
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
},
Page.clear = function() {
	Page.last = Page.lastclick = Page.when = null;
	Page.retry = 0;
},
Page.loading = function() {
	if (!unsafeWindow['a'+APP+'_get_cached_ajax']) {
		if (!Page.when || (Date.now() - Page.when) >= (Page.option.timeout * Page.option.retry * 1000)) { // every xx seconds - we don't get called once it starts loading
			Page.when = Date.now();
			window.location.href = 'http://apps.facebook.com/castle_age/index.php';
		}
		GM_debug('Page not loaded correctly, reloading.');
		return true;
	}
	if ($('#app'+APP+'_AjaxLoadIcon').css('display') == 'none') { // Load icon is shown after 1.5 seconds
		if (Page.when && (Date.now() - Page.when) > (Page.option.timeout * 1000)) Page.clear();
		return false;
	}
	if (Page.when && (Date.now() - Page.when) >= (Page.option.timeout * 1000)) {
		GM_debug('Page.loading for 15+ seconds - retrying...');
		Page.when = Date.now();
		if (Page.retry++ >= Page.option.retry) {
			GM_debug('Page.loading for 1+ minutes - reloading...');
			window.location.href = 'http://apps.facebook.com/castle_age/index.php';
		}
		else if (Page.last) unsafeWindow['a'+APP+'_get_cached_ajax'](Page.last, "get_body");
		else if (Page.lastclick) Page.click(Page.lastclick);
	}
	return true;
}
Page.reload = function() {
	if (!Page.when || (Date.now() - Page.when) >= (Page.option.timeout * Page.option.retry * 1000)) {
		Page.to((Page.page || 'index'), '');
	}
}
/********** Worker.Player **********
* Gets all current stats we can see
*/
Player = new Worker('Player', '*');
Player.option = null;
Player.panel = null;
Player.onload = function() {
	// Get the gold timer from within the page - should really remove the "official" one, and write a decent one, but we're about playing and not fixing...
	// gold_increase_ticker(1418, 6317, 3600, 174738470, 'gold', true);
	// function gold_increase_ticker(ticks_left, stat_current, tick_time, increase_value, first_call)
	var when = new Date(script_started + ($('*').html().regex(/gold_increase_ticker\(([0-9]+),/) * 1000));
	Player.data.cash_time = when.getSeconds() + (when.getMinutes() * 60);
}
Player.parse = function(change) {
	if (!$('#app'+APP+'_app_body_container').length) return false;
	var data		= Player.data;
	data.FBID		= unsafeWindow.Env.user;
	data.cash		= parseInt($('strong#app'+APP+'_gold_current_value').text().replace(/[^0-9]/g, ''));
	data.energy 	= $('#app'+APP+'_energy_current_value').parent().text().regex(/([0-9]+)\s*\/\s*[0-9]+/);
	data.maxenergy 	= $('#app'+APP+'_energy_current_value').parent().text().regex(/[0-9]+\s*\/\s*([0-9]+)/);
	data.health 	= $('#app'+APP+'_health_current_value').parent().text().regex(/([0-9]+)\s*\/\s*[0-9]+/);
	data.maxhealth 	= $('#app'+APP+'_health_current_value').parent().text().regex(/[0-9]+\s*\/\s*([0-9]+)/);
	data.stamina 	= $('#app'+APP+'_stamina_current_value').parent().text().regex(/([0-9]+)\s*\/\s*[0-9]+/);
	data.maxstamina = $('#app'+APP+'_stamina_current_value').parent().text().regex(/[0-9]+\s*\/\s*([0-9]+)/);
	data.exp 		= $('#app'+APP+'_st_2_5').text().regex(/([0-9]+)\s*\/\s*[0-9]+/);
	data.maxexp 	= $('#app'+APP+'_st_2_5').text().regex(/[0-9]+\s*\/\s*([0-9]+)/);
	data.level 		= $('#app'+APP+'_st_5').text().regex(/Level: ([0-9]+)!/i);
	data.armymax	= $('a[href*=army.php]', '#app'+APP+'_main_bntp').text().regex(/([0-9]+)/);
	data.army		= Math.min(data.armymax, 501); // XXX Need to check what max army is!
	data.upgrade	= ($('a[href*=keep.php]', '#app'+APP+'_main_bntp').text().regex(/([0-9]+)/) || 0);
	data.general 	= $('div.general_name_div3').first().text().trim();
	data.imagepath 	= $('div.general_pic_div3 img').attr('src').pathpart();
	// Keep page
	if (Page.page=='keep_stats') {
		var keep = $('div.keep_attribute_section').first(); // Only when it's our own keep and not someone elses
		if (keep.length) {
			data.myname = $('div.keep_stat_title > span', keep).text().regex(/"(.*)"/);
			data.rank = $('td.statsTMainback img[src*=rank_medals]').attr('src').filepart().regex(/([0-9]+)/);
			var stats = $('div.attribute_stat_container', keep);
			data.attack = $(stats).eq(2).text().regex(/([0-9]+)/);
			data.defense = $(stats).eq(3).text().regex(/([0-9]+)/);
			data.bank = parseInt($('td.statsTMainback b.money').text().replace(/[^0-9]/g,''));
		}
	}
	return false;
}
Player.work = function(state) {
	if (!Player.data.attack) Page.to('keep_stats'); // Only ever run it once the first time we're loaded - no check for state
	// These can change every second - so keep them in mind
	Player.data.cash			= parseInt($('strong#app'+APP+'_gold_current_value').text().replace(/[^0-9]/g, ''));
// Very innacurate!!!
//	Player.data.cash_timer		= $('#app'+APP+'_gold_time_value').text().parseTimer();
	var when = new Date();
	when = Player.data.cash_time - (when.getSeconds() + (when.getMinutes() * 60));
	if (when < 0) {when += 3600;}
	Player.data.cash_timer		= when;
	Player.data.energy			= $('#app'+APP+'_energy_current_value').parent().text().regex(/([0-9]+)\s*\/\s*[0-9]+/);
	Player.data.energy_timer	= $('#app'+APP+'_energy_time_value').text().parseTimer();
	Player.data.health			= $('#app'+APP+'_health_current_value').parent().text().regex(/([0-9]+)\s*\/\s*[0-9]+/);
	Player.data.health_timer	= $('#app'+APP+'_health_time_value').text().parseTimer();
	Player.data.stamina			= $('#app'+APP+'_stamina_current_value').parent().text().regex(/([0-9]+)\s*\/\s*[0-9]+/);
	Player.data.stamina_timer	= $('#app'+APP+'_stamina_time_value').text().parseTimer();
}
/********** Worker.Quest **********
* Completes quests with a choice of general
*/
Quest = new Worker('Quest', 'quests_quest quests_quest1 quests_quest2 quests_quest3 quests_quest4 quests_quest5 quests_quest6 quests_demiquests quests_atlantis');
Quest.land = ['fire', 'earth', 'mist', 'water', 'demon', 'undead'];
Quest.current = null;
Quest.current_id = null;
Quest.what_id = null;
Quest.onload = function() {
	if (!Quest.option.what) Quest.option.what = 'Influence';
	if (!Quest.option.general) Quest.option.general = 'Under Level 4';
}
Quest.parse = function(change) {
	switch(Page.page) {
		case 'quests_quest':
		case 'quests_quest1':
		case 'quests_quest2':
		case 'quests_quest3':
		case 'quests_quest4':
		case 'quests_quest5':
		case 'quests_quest6':
			var area = 'quest';
			var land = $('div.title_tab_selected img[id^="app'+APP+'_land_image"]').attr('id').regex(/_image([0-9]+)$/,'');
			break;
		case 'quests_demiquests': var area = 'demiquest'; break;
		case 'quests_atlantis': var area = 'atlantis'; break;
		default: return false;
	}
	if (!change) { // Parse first
		var quest = Quest.data;
		$('div.quests_background,div.quests_background_sub').each(function(i,el){
			if ($(el).hasClass('quests_background')) { // Main quest
				var name = $('div.qd_1 b', el).text().trim();
				if (!name) return;
				quest[name] = {};
				quest[name].area = area;
				if (land) quest[name].land = land;
				var influence = $('div.quest_progress', el).text().regex(/LEVEL ([0-9]+) INFLUENCE: ([0-9]+)%/i);
				if (influence) {
					quest[name].level = influence[0];
					quest[name].influence = influence[1];
				} else quest[name].level = quest[name].influence = 0;
				// Some have no general requirement
				if ($('div.quest_act_gen img', el).attr('title')) quest[name].general = $('div.quest_act_gen img', el).attr('title');
				var reward = $('div.qd_2', el).text().replace(/[^0-9$]/g, '').regex(/^([0-9]+)\$([0-9]+)\$([0-9]+)$/);
				quest[name].exp = reward.shift();
				quest[name].reward = (reward[0] + reward[1]) / 2;
				quest[name].energy = $('div.quest_req b', el).text().regex(/([0-9]+)/);
				if($('div.qd_1 img', el).attr('title')) quest[name].item = $('div.qd_1 img', el).attr('title').trim();
				var units = {};
				$('div.quest_req > div > div > div', el).each(function(i,el){
					var title = $('img', el).attr('title');
					units[title] = $(el).text().regex(/([0-9]+)/);
				});
				if (units.length) quest[name].units = units;
//				GM_debug('Quest: '+name+' = '+quest[name].toSource());
			} else { // Subquest
				var name = $('div.quest_sub_title', el).text().trim();
				if (!name) return;
				quest[name] = {};
				quest[name].area = area;
				if (land) quest[name].land = land;
				var influence = $('div.quest_sub_progress', el).text().regex(/LEVEL ([0-9]+) INFLUENCE: ([0-9]+)%/i);
				if (influence) {
					quest[name].level = influence[0];
					quest[name].influence = influence[1];
				} else quest[name].level = quest[name].influence = 0;
				var reward = $('div.qd_2_sub', el).text().replace(/[^0-9$]/g, '').regex(/^([0-9]+)\$([0-9]+)\$([0-9]+)$/);
				quest[name].exp = reward.shift();
				quest[name].reward = (reward[0] + reward[1]) / 2;
				quest[name].energy = $('div.qd_3_sub', el).text().regex(/([0-9]+)/);
//				GM_debug('Subuest: '+name+' = '+quest[name].toSource());
			}
		});
		Quest.select();
	} else { // Set auto-quest
	}
}
Quest.display = function() {
	var i, list = [];
	for (i in Quest.data) {
		if (Quest.data[i].item) list.push(Quest.data[i].item);
	}
	var panel = new Panel(this.name);
	panel.select('general', 'General:', ['any', 'Under Level 4', 'Influence']);
	Quest.what_id = panel.select('what', 'Quest for:', Array.concat(['Nothing', 'Influence', 'Experience', 'Cash'], unique(list.sort())));
	Quest.current_id = panel.info('None', 'current', 'Current:');
	return panel.show;
}
Quest.work = function(state) {
	if (Quest.option.firstrun || !length(Quest.data)) {
		var list = Quest.pages.split(' ');
		if (!state) {
			Quest.option.firstrun = 1; // Skip quests_quest
			Settings.Save('option', Quest);
			return true;
		}
		var i = Quest.option.firstrun++;
		if (list[i]) {
			Settings.Save('option', Quest);
			Page.to(list[i]);
			return true;
		}
		delete Quest.option.firstrun;
		Settings.Save('option', Quest);
		Quest.select();
		return false;
	}
	var best = null;
	if (Quest.option.what == 'Nothing') return false;
	for (var i in Quest.data) {
		switch(Quest.option.what) {
			case 'Influence':
				if (Quest.data[i].influence >= 100) continue;
				if (best && Quest.data[i].energy >= Quest.data[best].energy) continue;
				break;
			case 'Experience':
				if (best && (Quest.data[i].energy / Quest.data[i].exp) >= (Quest.data[best].energy / Quest.data[best].exp)) continue;
				break;
			case 'Cash':
				if (best && (Quest.data[i].energy / Quest.data[i].reward) >= (Quest.data[best].energy / Quest.data[best].reward)) continue;
				break;
			default: // We're going for an item instead
				if (!Quest.data[i].item || Quest.data[i].item != Quest.option.what) continue;
				if (best && (Quest.data[i].energy > Quest.data[best].energy)) continue;
				break;
		}
		best = i;
	}
	if (best != Quest.current) {
		Quest.current = best;
		if (best) {
			GM_debug('Quest: Wanting to perform - '+best+' (energy: '+Quest.data[best].energy+')');
			$('#'+Quest.current_id).html('<strong>Current:</strong> '+best+' (energy: '+Quest.data[best].energy+')');
		}
	}
	if (!best) return false;
	if (Quest.data[best].energy > Queue.burn.energy) return false;
	if (!state) return true;
	if (Quest.data[best].general) {
		if (!Generals.to(Quest.data[best].general)) return true;
	}
	else if (!Generals.to(Generals.best(Quest.option.general))) return true;
	switch(Quest.data[best].area) {
		case 'quest':		if (!Page.to('quests_quest'+Quest.data[best].land)) return true; break;
		case 'demiquest':	if (!Page.to('quests_demiquests')) return true; break;
		case 'atlantis':	if (!Page.to('quests_atlantis')) return true;	break;
		default:			GM_debug('Quest: Can\'t get to quest area!');	return false;
	}
	GM_debug('Quest: Performing - '+best+' (energy: '+Quest.data[best].energy+')');
	if (!Page.click('div.action[title^="'+best+'"] input[type="image"]')) Page.reload();
	return true;
}
Quest.select = function() {
	var def = ['Nothing', 'Influence', 'Experience', 'Cash'];
	var list = [];
	for (var i in Quest.data) {
		if (Quest.data[i].item) list.push(Quest.data[i].item);
	}
	list = def.concat(unique(list.sort()));
	$('#'+Quest.what_id).empty();
	for (var i in list) {
		$('#'+Quest.what_id).append('<option value="'+list[i]+'"'+(list[i]==Quest.option.what ? ' selected' : '')+'>'+list[i]+'</value>');
	}
}
/********** Worker.Queue() **********
* Keeps track of the worker queue
*/
Queue = new Worker('Queue', '*');
Queue.data = {};
Queue.option = {delay:5, clickdelay:5, queue:["Page", "Queue", "Income", "Quest", "Monster", "Battle", "Heal", "Bank", "Alchemy", "Town", "Blessing", "Gift", "Upgrade", "Idle", "Raid"]};
Queue.runfirst = [];
Queue.unsortable = true;
Queue.lastclick = Date.now();	// Last mouse click - don't interrupt the player
Queue.lastrun = Date.now();		// Last time we ran
Queue.burn = {stamina:false, energy:false};
Queue.onload = function() {
	if (!Queue.option.queue) Queue.option.queue = [];
	if (!Queue.data.current) Queue.data.current = null;
	if (!Queue.option.stamina) Queue.option.stamina = 0;
	if (!Queue.option.energy) Queue.option.energy = 0;
	var found = {};
	for (var i in Queue.option.queue) { // First find what we've already got
		var worker = WorkerByName(Queue.option.queue[i]);
		if (worker) found[worker.name] = true;
	}
	for (var i in Workers) { // Second add any new workers that have a display (ie, sortable)
		if (found[Workers[i].name] || !Workers[i].work || !Workers[i].display) continue;
		GM_log('Adding '+Workers[i].name+' to Queue');
		if (Workers[i].unsortable) Queue.option.queue.unshift(Workers[i].name);
		else Queue.option.queue.push(Workers[i].name);
	}
	for (i in Queue.option.queue) {	// Third put them in saved order
		var worker = WorkerByName(Queue.option.queue[i]);
		if (worker && worker.priv_id) {
			if (Queue.data.current && worker.name == Queue.data.current) {
				GM_debug('Queue: Trigger '+worker.name+' (continue after load)');
				$('#'+worker.priv_id+' > h3 > a').css('font-weight', 'bold');
			}
			$('#golem_config').append($('#'+worker.priv_id));
		}
	}
	$(document).click(function(){Queue.lastclick=Date.now();});
}
Queue.display = function() {
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
	var panel = new Panel(this.name);
	panel.info('Drag the other panels into the order you wish them run.');
	panel.text('delay', 'Delay Between Events', {after:'secs', size:3});
	panel.text('clickdelay', 'Delay After Mouse Click', {after:'secs', size:3});
	panel.select('stamina', 'Keep Stamina:', Player.data.maxstamina);
	panel.select('energy', 'Keep Energy:', Player.data.maxenergy);
	return panel.show;
}
Queue.run = function() {
	var i, worker, found = false, now = Date.now();
	if (Queue.option.pause || now - Queue.lastclick < Queue.option.clickdelay * 1000 || now - Queue.lastrun < Queue.option.delay * 1000) {
		return;
	}
	Queue.lastrun = now;
	if (Page.loading()) return; // We want to wait xx seconds after the page has loaded
	Queue.burn.stamina	= Math.max(0, Player.data.stamina - Queue.option.stamina);
	Queue.burn.energy	= Math.max(0, Player.data.energy - Queue.option.energy);
	for (i in Workers) { // Run any workers that don't have a display, can never get focus!!
		if (Workers[i].work && !Workers[i].display) Workers[i].work(false);
	}
	for (i in Queue.option.queue) {
		worker = WorkerByName(Queue.option.queue[i]);
		if (!worker || !worker.work || !worker.display) continue;
		if (!worker.work(Queue.data.current == worker.name)) {
			Settings.Save(worker);
			if (Queue.data.current == worker.name) {
				Queue.data.current = null;
				$('#'+worker.priv_id+' > h3 > a').css('font-weight', 'normal');
				GM_debug('Queue: End '+worker.name);
			}
			continue;
		}
		Settings.Save(worker);
		if (!found) { // We will work(false) everything, but only one gets work(true) at a time
			found = true;
			if (Queue.data.current == worker.name) continue;
			worker.priv_since = now;
			if (Queue.data.current) {
				GM_debug('Queue: Interrupt '+Queue.data.current);
				$('#'+WorkerByName(Queue.data.current).priv_id+' > h3 > a').css('font-weight', 'normal');
			}
			Queue.data.current = worker.name;
			$('#'+worker.priv_id+' > h3 > a').css('font-weight', 'bold');
			GM_debug('Queue: Trigger '+worker.name);
		}
	}
	Settings.Save(Queue);
}
/********** Worker.Raid **********
* Automates Raids
*/
Raid = new Worker('Raid', 'battle_raid', {stamina:true});
Raid.onload = function() {
	if (!Raid.option.type) Raid.option.type = 'Invade';
}
Raid.display = function() {
	var panel = new Panel(this.name);
	panel.info('In progress...');
	panel.select('type', 'Attack Type:', ['Invade', 'Duel']);
	panel.general('general', 'General:');
	return panel.show;
}
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
Town = new Worker('Town', 'town_soldiers town_blacksmith town_magic town_land');
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
Town.onload = function() {
	if (!Town.data.soldiers) Town.data.soldiers = {};
	if (!Town.data.blacksmith) Town.data.blacksmith = {};
	if (!Town.data.magic) Town.data.magic = {};
	if (!Town.data.land) Town.data.land = {};
}
Town.parse = function(change) {
	if (!change) {
		if (Page.page=='town_land') {
			var land = Town.data.land = {};
			var landlist = $('tr.land_buy_row,tr.land_buy_row_unique');
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
			if (Page.page=='town_soldiers') var unit = Town.data.soldiers = {};
			else if (Page.page=='town_blacksmith') var unit = Town.data.blacksmith = {};
			else if (Page.page=='town_magic') var unit = Town.data.magic = {};
			var unitlist = $('tr.eq_buy_row,tr.eq_buy_row2');
			unitlist.each(function(i,el){
				var name = $('div.eq_buy_txt strong:first-child', el).text().trim();
				Town.cache[name] = el;
				unit[name] = {};
				var cost = $('div.eq_buy_costs strong:first-child', el).text().replace(/[^0-9]/g, '');
				if (cost) {
					unit[name].cost = parseInt(cost);
					unit[name].buy = [];
					$('div.eq_buy_costs select[name="amount"]:first option', el).each(function(i,el){
						unit[name].buy.push(parseInt($(el).val()));
					});
				}
				unit[name].own = $('div.eq_buy_costs span:first-child', el).text().regex(/([0-9]+)/);
				unit[name].att = $('div.eq_buy_stats div:first-child', el).text().regex(/([0-9]+)/);
				unit[name].def = $('div.eq_buy_stats div:last-child', el).text().regex(/([0-9]+)/);
				if (Page.page=='town_blacksmith') {
					for (var i in Town.blacksmith) if (name.match(Town.blacksmith[i])) unit[name].type = i;
				}
			});
			Town.table = $(unitlist).first().parent();
			this.header = {};
			$(this.table).children().each(function(i,el) {
				if (!$(el).attr('class')) Town.header[i] = [el, $(el).next()];
			});
			Town.units = unit;
		}
		if (Page.page != 'town_land' && length(Town.data.soldiers) && length(Town.data.blacksmith) && length(Town.data.magic)) {
			Town.getValues();
		}
	} else {
		if (Page.page=='town_blacksmith') {
			var unit = Town.data.blacksmith;
			$('tr.eq_buy_row,tr.eq_buy_row2').each(function(i,el){
				var name = $('div.eq_buy_txt strong:first-child', el).text().trim();
				if (unit[name].type) {
					$('div.eq_buy_txt strong:first-child', el).parent().append('<br>'+unit[name].type);
				}
			});
		}
		if (Page.page != 'town_land') {
			var tmp = $('<tr><td><div style="padding:9px 0px 0px 15px; width:725px; height:28px;">Sort by <a id="sort_none">Normal</a> / <a id="sort_attack">Attack</a> / <a id="sort_defense">Defense</a></div></td></tr>');
			$('div', tmp).css({ backgroundImage:$('div[style*="hero_divider.gif"]').first().css('background-image'), color:'#fff', fontSize:'16px', fontWeight:'bold' });
			$('#sort_none', tmp).click(function(){Town.sortBy();});
			$('#sort_attack', tmp).click(function(){Town.sortBy('att');});
			$('#sort_defense', tmp).click(function(){Town.sortBy('def');});
			$(this.table).prepend(tmp);
		}
	}
	return true;
}
Town.display = function() {
	var panel = new Panel(this.name);
	panel.info('In progress...');
	panel.checkbox('general', 'Use Best General:');
	panel.select('number', 'Buy Number:', ['None', 'Maximum', 'Match Army']);
	panel.select('units', 'Buy Type:', ['All', 'Best Offense', 'Best Defense', 'Best of Both']);
	return panel.show;
}
Town.work = function(state) {
	if (!length(Town.data.soldiers)) { // Need to parse it at least once
		if (!state) return true;
		if (!Page.to('town_soldiers')) return true;
	}
	if (!length(Town.data.blacksmith)) { // Need to parse it at least once
		if (!state) return true;
		if (!Page.to('town_blacksmith')) return true;
	}
	if (!length(Town.data.magic)) { // Need to parse it at least once
		if (!state) return true;
		if (!Page.to('town_magic')) return true;
	}
	if (!Town.option.number) return false;
	var max = Math.min(Town.option.number=='Maximum' ? 501 : Player.data.army, 501);
	// Soldiers first...
	var best = null;
	var count = 0;
	var gold = Player.data.gold + Player.data.bank;
	var units = Town.data.soldiers;
	for (var i in units) {
		count = 0;
		if (!units[i].cost) continue;
		if (units[i].own >= max) continue;
		if (best && Town.option.units == 'Best Offense' && units[i].att <= best.att) continue;
		if (best && Town.option.units == 'Best Defense' && units[i].def <= best.def) continue;
		if (best && Town.option.units == 'Best of Both' && (units[i].att <= best.att || units[i].def <= best.def)) continue;
		for (var j in units[i].buy) {
			if ((max - units[i].own) >= units[i].buy[j]) count = units[i].buy[j]; // && (units[i].buy[j] * units[i].cost) < gold
		}
		GM_debug('Thinking about buying: '+count+' of '+i+' at $'+(count * units[i].cost));
		if (count) {
			best = i;
			break;
		}
	}
	if (!best) return false;
	if (!state) {
		GM_debug('Want to buy '+count+' x '+best+' at $'+(count * units[best].cost));
		return true;
	}
//	if (!Bank.retrieve(best.cost * count)) return true;
//	if (Player.data.gold < best.cost) return false; // We're poor!
//	if (!Page.to('town_soldiers')) return true;

	return false;
}
Town.sortBy = function(x) {
	if (!x) {
		for (var i in Town.units) { $(Town.table).append($(Town.cache[i])); }
		for (var i in Town.header) {
			$($(Town.header[i][1])).before($(Town.header[i][0]));
			$(Town.header[i][0]).css('display','table-row');
		}
	} else {
		var units = [], x2 = (x=='att'?'def':'att');
		for (var i in Town.units) units.push(i);
// We now check the actual total value rather than just the absolute values
//		units.sort(function(a,b) { return Town.units[b][x2] - Town.units[a][x2]; });
//		units.sort(function(a,b) { return Town.units[b][x] - Town.units[a][x]; });
		units.sort(function(a,b) { return (Town.units[b][x] + (0.7 * Town.units[b][x2])) - (Town.units[a][x] + (0.7 * Town.units[a][x2])); });
		for (var i in units) { $(Town.table).append($(Town.cache[units[i]])); }
		for (var i in Town.header) $(Town.header[i]).css('display','none');
	}
}
Town.getValues = function() {
	Town.data.invade = {
		attack:	getAttDef(Town.data.soldiers, function(list,i){list.push(i);}, 'att', Player.data.army, 'invade')
			+	getAttDef(Town.data.blacksmith, function(list,i,units){if (units[i].type == 'Weapon'){list.push(i);}}, 'att', Player.data.army, 'invade')
			+	getAttDef(Town.data.blacksmith, function(list,i,units){if (units[i].type != 'Weapon'){list.push(i);}}, 'att', Player.data.army, 'invade')
			+	getAttDef(Town.data.magic, function(list,i){list.push(i);}, 'att', Player.data.army, 'invade'),
		defend:	getAttDef(Town.data.soldiers, function(list,i){list.push(i);}, 'def', Player.data.army, 'invade')
			+	getAttDef(Town.data.blacksmith, function(list,i,units){if (units[i].type == 'Weapon'){list.push(i);}}, 'def', Player.data.army, 'invade')
			+	getAttDef(Town.data.blacksmith, function(list,i,units){if (units[i].type != 'Weapon'){list.push(i);}}, 'def', Player.data.army, 'invade')
			+	getAttDef(Town.data.magic, function(list,i){list.push(i);}, 'def', Player.data.army, 'invade')
	};
	Town.data.duel = {
		attack:	getAttDef(Town.data.blacksmith, function(list,i,units){if (units[i].type == 'Weapon'){list.push(i);}}, 'att', 1, 'duel')
			+	getAttDef(Town.data.blacksmith, function(list,i,units){if (units[i].type == 'Shield'){list.push(i);}}, 'att', 1, 'duel')
			+	getAttDef(Town.data.blacksmith, function(list,i,units){if (units[i].type == 'Helmet'){list.push(i);}}, 'att', 1, 'duel')
			+	getAttDef(Town.data.blacksmith, function(list,i,units){if (units[i].type == 'Gloves'){list.push(i);}}, 'att', 1, 'duel')
			+	getAttDef(Town.data.blacksmith, function(list,i,units){if (units[i].type == 'Armor'){list.push(i);}}, 'att', 1, 'duel')
			+	getAttDef(Town.data.blacksmith, function(list,i,units){if (units[i].type == 'Amulet'){list.push(i);}}, 'att', 1, 'duel')
			+	getAttDef(Town.data.magic, function(list,i){list.push(i);}, 'att', 1, 'duel'),
		defend:	getAttDef(Town.data.blacksmith, function(list,i,units){if (units[i].type == 'Weapon'){list.push(i);}}, 'def', 1, 'duel')
			+	getAttDef(Town.data.blacksmith, function(list,i,units){if (units[i].type == 'Shield'){list.push(i);}}, 'def', 1, 'duel')
			+	getAttDef(Town.data.blacksmith, function(list,i,units){if (units[i].type == 'Helmet'){list.push(i);}}, 'def', 1, 'duel')
			+	getAttDef(Town.data.blacksmith, function(list,i,units){if (units[i].type == 'Gloves'){list.push(i);}}, 'def', 1, 'duel')
			+	getAttDef(Town.data.blacksmith, function(list,i,units){if (units[i].type == 'Armor'){list.push(i);}}, 'def', 1, 'duel')
			+	getAttDef(Town.data.blacksmith, function(list,i,units){if (units[i].type == 'Amulet'){list.push(i);}}, 'def', 1, 'duel')
			+	getAttDef(Town.data.magic, function(list,i){list.push(i);}, 'def', 1, 'duel')
	};
//	GM_debug('Town Invade: '+Town.data.invade.toSource()+', Town Duel: '+Town.data.duel.toSource());
}
/********** Worker.Update **********
* Checks if there's an update to the script, and lets the user update if there is.
*/
Update = new Worker('Update');
Update.data = null;
Update.option = null;
Update.found = false;
Update.onload = function() {
	var $btn = $('<button name="Script Update" id="golem_update">Check</button>')
		.button().click(function(){Update.now(true);});
	$('#golem_buttons').append($btn);
}
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
				if ((evt.readyState == 4) && (evt.status == 200)) {
					var tmp = $(evt.responseText);
					if (force) $('#golem_request').remove();
					var remoteVersion = $('#summary', tmp).text().regex(/Version:[^0-9.]+([0-9.]+)/i);
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
}
/********** Worker.Upgrade **********
* Spends upgrade points
*/
Upgrade = new Worker('Upgrade', 'keep_stats');
Upgrade.onload = function() {
	if (!Upgrade.data.run) Upgrade.data.run = 0;
}
Upgrade.parse = function(change) {
	// You just upgraded your Attack by 1.
	var result = $('div.results');
	if (Upgrade.data.working && result.length && result.text().match(/You just upgraded your/i)) {
		Upgrade.data.working = false;
		Upgrade.data.run++;
		if (Upgrade.data.run >= Upgrade.option.order.length) Upgrade.data.run = 0;
	}
	return false;
}
Upgrade.display = function() {
	var panel = new Panel(this.name);
	panel.info('Points will be allocated in this order, add multiple entries if wanted (ie, 3x Attack and 1x Defense would put &frac34; on Attack and &frac14; on Defense)');
	panel.multiple('order', 'Stats:', ['Energy', 'Stamina', 'Attack', 'Defense', 'Health']);
	return panel.show;
}
Upgrade.work = function(state) {
	if (!Upgrade.option.order || !Upgrade.option.order.length || !Player.data.upgrade) return false;
	if (!state) return true;
	if (!Page.to('keep_stats')) return true;
	Upgrade.data.working = true;
	if (Upgrade.data.run >= Upgrade.option.order.length) Upgrade.data.run = 0;
	switch(Upgrade.option.order[Upgrade.data.run]) {
		case 'Energy':	if (Page.click('a[href$="?upgrade=energy_max"]')) return true; break;
		case 'Stamina':	if (Page.click('a[href$="?upgrade=stamina_max"]')) return true; break;
		case 'Attack':	if (Page.click('a[href$="?upgrade=attack"]')) return true; break;
		case 'Defense':	if (Page.click('a[href$="?upgrade=defense"]')) return true; break;
		case 'Health':	if (Page.click('a[href$="?upgrade=health_max"]')) return true; break;
	}
	if (!Page.to('index')) return true; // Try to force a stat reload
	return false;
}

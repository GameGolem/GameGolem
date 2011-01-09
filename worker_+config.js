/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Dashboard, History, Page, Queue, Resources,
	Battle, Generals, LevelUp, Player,
	APP, APPID, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, Divisor, length, unique, deleteElement, sum, findInArray, findInObject, objectIndex, sortObject, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
	makeImage
*/
/********** Worker.Config **********
* Has everything to do with the config
*/
var Config = new Worker('Config');

Config.settings = {
	system:true,
	keep:true
};

Config.option = {
	display:'block',
	fixed:true,
	advanced:false,
	exploit:false
};

Config.temp = {
	menu:null
};

Config.init = function() {
	var i, j, k, $display;
	// START: Only safe place to put this - temporary for deleting old queue enabled code...
	for (i in Workers) {
		if (Workers[i].option && ('_enabled' in Workers[i].option)) {
			if (!Workers[i].option._enabled) {
				Workers[i].set(['option','_disabled'], true);
			}
			Workers[i].set(['option','_enabled']);
		}
	}
	// END
	$('head').append('<link rel="stylesheet" href="http://cloutman.com/css/base/jquery-ui.css" type="text/css" />');
	$display = $('<div id="golem_config_frame" class="golem-config ui-widget-content' + (Config.option.fixed?' golem-config-fixed':'') + '" style="display:none;"><div class="golem-title">&nbsp;Castle Age Golem ' + (isRelease ? 'v'+version : 'r'+revision) + '<img class="golem-image golem-icon-menu" src="' + getImage('menu') + '"></div><div id="golem_buttons"><img class="golem-button' + (Config.option.display==='block'?'-active':'') + '" id="golem_options" src="' + getImage('options') + '"></div><div style="display:'+Config.option.display+';"><div id="golem_config" style="overflow:hidden;overflow-y:auto;"></div></div></div>');
	$('div.UIStandardFrame_Content').after($display);// Should really be inside #UIStandardFrame_SidebarAds - but some ad-blockers remove that
	$('#golem_options').click(function(){
		$(this).toggleClass('golem-button golem-button-active');
		Config.option.display = Config.option.display==='block' ? 'none' : 'block';
		$('#golem_config').parent().toggle('blind'); //Config.option.fixed?null:
		Config._save('option');
	});
	for (i in Workers) {
		this.makePanel(Workers[i]);
	}
	$('.golem-config .golem-panel > h3').click(function(event){
		if ($(this).parent().hasClass('golem-panel-show')) {
			$(this).next().hide('blind',function(){
				$(this).parent().toggleClass('golem-panel-show');
				Config.option.active = [];
				$('.golem-panel-show').each(function(i,el){Config.option.active.push($(this).attr('id'));});
				Config._save('option');
			});
		} else {
			$(this).parent().toggleClass('golem-panel-show');
			$(this).next().show('blind');
			Config.option.active = [];
			$('.golem-panel-show').each(function(i,el){Config.option.active.push($(this).attr('id'));});
			Config._save('option');
		}
	});
	$('#golem_config .golem-panel-sortable')
		.draggable({
			axis:'y',
			distance:5,
			scroll:false,
			handle:'h3',
			helper:'clone',
			opacity:0.75,
			zIndex:100,
			refreshPositions:true,
			containment:'parent',
			stop:function(event,ui) {
				Queue.clearCurrent();// Make sure we deal with changed circumstances
				Queue.set(['option','queue'], Config.getOrder());
			}
		})
		.droppable({
			tolerance:'pointer',
			over:function(e,ui) {
				var i, order = Config.getOrder(), me = Worker.find($(ui.draggable).attr('name')), newplace = order.indexOf($(this).attr('name'));
				if (order.indexOf('Idle') >= newplace) {
					if (me.settings.before) {
						for(i=0; i<me.settings.before.length; i++) {
							if (order.indexOf(me.settings.before[i]) <= newplace) {
								return;
							}
						}
					}
					if (me.settings.after) {
						for(i=0; i<me.settings.after.length; i++) {
							if (order.indexOf(me.settings.after[i]) >= newplace) {
								return;
							}
						}
					}
				}
				if (newplace < order.indexOf($(ui.draggable).attr('name'))) {
					$(this).before(ui.draggable);
				} else {
					$(this).after(ui.draggable);
				}
			}
		});
	for (i in Workers) { // Propagate all before and after settings
		if (Workers[i].settings.before) {
			for (j=0; j<Workers[i].settings.before.length; j++) {
				k = Worker.find(Workers[i].settings.before[j]);
				if (k) {
					k.settings.after = k.settings.after || [];
					k.settings.after.push(Workers[i].name);
					k.settings.after = unique(k.settings.after);
//					console.log(warn(), 'Pushing '+k.name+' after '+Workers[i].name+' = '+k.settings.after);
				}
			}
		}
		if (Workers[i].settings.after) {
			for (j=0; j<Workers[i].settings.after.length; j++) {
				k = Worker.find(Workers[i].settings.after[j]);
				if (k) {
					k.settings.before = k.settings.before || [];
					k.settings.before.push(Workers[i].name);
					k.settings.before = unique(k.settings.before);
//					console.log(warn(), 'Pushing '+k.name+' before '+Workers[i].name+' = '+k.settings.before);
				}
			}
		}
	}
	$('input.golem_addselect').live('click', function(){
		var i, value, values = $(this).prev().val().split(','), $multiple = $(this).parent().children().first();
		for (i=0; i<values.length; i++) {
			value = values[i].trim();
			if (value) {
				$multiple.append('<option>' + value + '</option>');
			}
		}
		$multiple.change();
	});
	$('input.golem_delselect').live('click', function(){
		var $multiple = $(this).parent().children().first();
		$multiple.children().selected().remove();
		$multiple.change();
	});
	$('#golem_config input,textarea,select').live('change', function(){
		var $this = $(this), tmp, worker, val;
		if ($this.is('#golem_config :input:not(:button)') && $this.attr('id') && (tmp = $this.attr('id').slice(PREFIX.length).regex(/([^_]*)_(.*)/i)) && (worker = Worker.find(tmp[0]))) {
			if ($this.attr('type') === 'checkbox') {
				val = $this.attr('checked');
			} else if ($this.attr('multiple')) {
				val = [];
				$this.children().each(function(i,el){ val.push($(el).text()); });
			} else {
				val = $this.attr('value') || $this.val() || null;
				if (val && val.search(/[^-0-9.]/) === -1) {
					val = parseFloat(val);
				}
			}
			if (!compare(val, worker.option[tmp[1]])) { // only continue if they change
				worker.set('option.'+tmp[1], val);
				Config.checkRequire();
			}
		}
	});
	$('.golem-panel-header input').click(function(event){
		event.stopPropagation(true);
	});
	this.checkRequire();
	$('#golem_config_frame').show();// make sure everything is created before showing (css sometimes takes another second to load though)
	$('#content').append('<div id="golem-menu" class="golem-menu golem-shadow"></div>');
	$('.golem-icon-menu').click(function(event) {
		var i, j, k, keys, hr = false, html = '', $this = $(this.wrappedJSObject || this), worker = Worker.find($this.attr('name')), name = worker ? worker.name : '';
		$('.golem-icon-menu-active').removeClass('golem-icon-menu-active');
		if (Config.temp.menu !== name) {
			Config.temp.menu = name;
			for (i in Workers) {
				if (Workers[i].menu) {
					hr = true;
					Workers[i]._unflush();
					keys = Workers[i].menu(worker) || [];
					for (j=0; j<keys.length; j++) {
						k = keys[j].regex(/([^:]*):?(.*)/);
						if (k[0] === '---') {
							hr = true;
						} else if (k[1]) {
							if (hr) {
								html += html ? '<hr>' : '';
								hr = false;
							}
							switch (k[1].charAt(0)) {
								case '!':	k[1] = '<img src="' + getImage('warning') + '">' + k[1].substr(1);	break;
								case '+':	k[1] = '<img src="' + getImage('tick') + '">' + k[1].substr(1);	break;
								case '-':	k[1] = '<img src="' + getImage('cross') + '">' + k[1].substr(1);	break;
								case '=':	k[1] = '<img src="' + getImage('dot') + '">' + k[1].substr(1);	break;
								default:	break;
							}
							html += '<div name="' + i + '.' + name + '.' + k[0] + '">' + k[1] + '</div>';
						}
					}
				}
			}
			$this.addClass('golem-icon-menu-active');
			$('#golem-menu').html(html || 'no&nbsp;options');
			$('#golem-menu').css({
				position:Config.option.fixed ? 'fixed' : 'absolute',
				top:$this.offset().top + $this.height(),
				left:Math.min($this.offset().left, $('#content').width() - $('#golem-menu').outerWidth(true) - 4)
			}).show();
		} else {// Need to stop it going up to the config panel, but still close the menu if needed
			Config.temp.menu = null;
			$('#golem-menu').hide();
		}
		event.stopPropagation();
		return false;
	});
	$('.golem-menu > div').live('click', function(event) {
		var i, $this = $(this.wrappedJSObject || this), key = $this.attr('name').regex(/^([^.]*)\.([^.]*)\.(.*)/);
//		console.log(key[0] + '.menu(' + key[1] + ', ' + key[2] + ')');
		var worker = Worker.find(key[0]);
		worker._unflush();
		worker.menu(Worker.find(key[1]), key[2]);
	});
	$(document).click(function(event){ // Any click hides it, relevant handling done above
		Config.temp.menu = null;
		$('.golem-icon-menu-active').removeClass('golem-icon-menu-active');
		$('#golem-menu').hide();
	});
};

Config.update = function(event) {
	if (event.type === 'watch') {
		var i, $el, worker = event.worker, id = event.id.slice('option.'.length);
		if (id === '_sleep') {
			$('#golem_sleep_' + worker.name).css('display', worker.option._sleep ? '' : 'none');
		} else {
			if (($el = $('#'+this.makeID(worker, id))).length === 1) {
				if ($el.attr('type') === 'checkbox') {
					$el.attr('checked', worker.option[id]);
				} else if ($el.attr('multiple')) {
					$el.empty();
					(worker.option[id] || []).forEach(function(val){$el.append('<option>'+val+'</option>')});
				} else if ($el.attr('value')) {
					$el.attr('value', worker.option[id]);
				} else {
					$el.val(worker.option[id]);
				}
			}
			this.checkRequire();
		}
	}
};

Config.menu = function(worker, key) {
	if (!worker) {
		if (!key) {
			return [
				'fixed:' + (this.option.fixed ? '<img src="' + getImage('pin_down') + '">Fixed' : '<img src="' + getImage('pin_left') + '">Normal') + '&nbsp;Position',
				'advanced:' + (this.option.advanced ? '+' : '-') + 'Advanced&nbsp;Options'
			];
		} else if (key) {
			switch (key) {
				case 'fixed':
					this._set(['option','fixed'], !this.option.fixed);
					$('#golem_config_frame').toggleClass('golem-config-fixed');
					break;
				case 'advanced':
					this._set(['option','advanced'], !this.option.advanced);
					$('.golem-advanced:not(".golem-require")').css('display', this.option.advanced ? '' : 'none');
					this.checkRequire();
					break;
			}
			this._save('option');
		}
	}
};

Config.makePanel = function(worker, args) {
	if (!isWorker(worker)) {
		if (Worker.stack.length <= 1) {
			return;
		}
		args = worker;
		worker = Worker.get(Worker.stack[0]);
	}
	if (!args) {
		if (!worker.display) {
			return;
		}
		args = worker.display;
	}
//	worker.id = 'golem_panel_'+worker.name.toLowerCase().replace(/[^0-9a-z]/g,'-');
	if (!$('#'+worker.id).length) {
		$('#golem_config').append('<div id="' + worker.id + '" class="golem-panel' + (worker.settings.unsortable?'':' golem-panel-sortable') + (findInArray(this.option.active, worker.id)?' golem-panel-show':'') + (worker.settings.advanced ? ' golem-advanced' : '') + '"' + ((worker.settings.advanced && !this.option.advanced) || (worker.settings.exploit && !this.option.exploit) ? ' style="display:none;"' : '') + ' name="' + worker.name + '"><h3 class="golem-panel-header' + (worker.get(['option', '_disabled'], false) ? ' red' : '') + '"><img class="golem-icon" src="' + getImage('blank') + '">' + worker.name + '<img id="golem_sleep_' + worker.name + '" class="golem-image" src="' + getImage('zzz') + '"' + (worker.option._sleep ? '' : ' style="display:none;"') + '><img class="golem-image golem-icon-menu" name="' + worker.name + '" src="' + getImage('menu') + '"><img class="golem-lock" src="' + getImage('lock') + '"></h3><div class="golem-panel-content" style="font-size:smaller;"></div></div>');
		this._watch(worker, 'option._sleep');
	} else {
		$('#'+worker.id+' > div').empty();
	}
	this.addOption(worker, args);
	this.checkRequire(worker.id);
};

Config.makeID = function(worker, id) {
	return PREFIX + worker.name.toLowerCase().replace(/[^0-9a-z]/g,'-') + '_' + id;
};

Config.clearPanel = function(selector) {
	this._init(); // Make sure we're properly loaded first!
	if (isWorker(selector)) {
		selector = '#'+selector.id+' > div';
	} else if (typeof selector === 'undefined' || !selector) {
		if (Worker.stack.length <= 1) {
			return;
		}
		selector = '#'+Workers[Worker.stack[0]].id+' > div';
	}
	$(selector).empty();
};

Config.addOption = function(selector, args) {
	this._init(); // Make sure we're properly loaded first!
	var worker;
	if (isWorker(selector)) {
		worker = selector;
		selector = '#'+selector.id+' > div';
	} else if (typeof args === 'undefined' || !args) {
		if (Worker.stack.length <= 1) {
			return;
		}
		worker = Workers[Worker.stack[0]];
		args = selector;
		selector = '#'+worker.id+' > div';
	}
	$(selector).append(this.makeOptions(worker, args));
};

Config.makeOptions = function(worker, args) {
	this._init(); // Make sure we're properly loaded first!
	if (isArray(args)) {
		var i, $output = $([]);
		for (i=0; i<args.length; i++) {
			$output = $output.add(this.makeOptions(worker, args[i]));
		}
		return $output;
	} else if (isObject(args)) {
		return this.makeOption(worker, args);
	} else if (isString(args)) {
		return this.makeOption(worker, {title:args});
	} else if (isFunction(args)) {
		try {
			return this.makeOptions(worker, args.call(worker));
		} catch(e) {
			console.log(warn(), e.name + ' in Config.makeOptions(' + worker.name + '.display()): ' + e.message);
		}
	} else {
		console.log(warn(), Worker.stack[0]+' is trying to add an unknown type of option');
	}
	return $([]);
};

Config.makeOption = function(worker, args) {
	var i, o, step, $option, txt = [], list = [];
	o = $.extend(true, {}, {
		before: '',
		after: '',
		suffix: '',
		className: '',
		between: 'to',
		size: 7,
		min: 0,
		max: 100
	}, args);
	this._watch(worker, 'option.' + o.id);
	o.real_id = o.id ? ' id="' + this.makeID(worker, o.id) + '"' : '';
	o.value = worker.get('option.'+o.id, null);
	o.alt = (o.alt ? ' alt="'+o.alt+'"' : '');
	if (o.hr) {
		txt.push('<br><hr style="clear:both;margin:0;">');
	}
	if (o.title) {
		txt.push('<div style="text-align:center;font-size:larger;font-weight:bold;">'+o.title.replace(' ','&nbsp;')+'</div>');
	}
	if (o.label && !o.button) {
		txt.push('<span style="float:left;margin-top:2px;">'+o.label.replace(' ','&nbsp;')+'</span>');
		if (o.text || o.checkbox || o.select) {
			txt.push('<span style="float:right;">');
		} else if (o.multiple) {
			txt.push('<br>');
		}
	}
	if (o.before) {
		txt.push(o.before+' ');
	}
	// our different types of input elements
	if (o.info) { // only useful for externally changed
		if (o.id) {
			txt.push('<span style="float:right"' + o.real_id + '>' + (o.value || o.info) + '</span>');
		} else {
			txt.push(o.info);
		}
	} else if (o.text) {
		txt.push('<input type="text"' + o.real_id + ' size="' + o.size + '" value="' + (o.value || isNumber(o.value) ? o.value : '') + '">');
	} else if (o.textarea) {
		txt.push('<textarea' + o.real_id + ' cols="23" rows="5">' + (o.value || '') + '</textarea>');
	} else if (o.checkbox) {
		txt.push('<input type="checkbox"' + o.real_id + (o.value ? ' checked' : '') + '>');
	} else if (o.button) {
		txt.push('<input type="button"' + o.real_id + ' value="' + o.label + '">');
	} else if (o.select) {
		if (typeof o.select === 'function') {
			o.select = o.select.call(worker, o.id);
		}
		switch (typeof o.select) {
			case 'number':
				step = Divisor(o.select);
				for (i=0; i<=o.select; i+=step) {
					list.push('<option' + (o.value==i ? ' selected' : '') + '>' + i + '</option>');
				}
				break;
			case 'string':
				o.className = ' class="golem_'+o.select+'"';
				if (this.data && this.data[o.select] && (typeof this.data[o.select] === 'array' || typeof this.data[o.select] === 'object')) {
					o.select = this.data[o.select];
				} else {
					break;
				} // deliberate fallthrough
			case 'array':
			case 'object':
				if (isArray(o.select)) {
					for (i=0; i<o.select.length; i++) {
						list.push('<option value="' + o.select[i] + '"' + (o.value==o.select[i] ? ' selected' : '') + '>' + o.select[i] + (o.suffix ? ' '+o.suffix : '') + '</option>');
					}
				} else {
					for (i in o.select) {
						list.push('<option value="' + i + '"' + (o.value==i ? ' selected' : '') + '>' + o.select[i] + (o.suffix ? ' '+o.suffix : '') + '</option>');
					}
				}
				break;
		}
		txt.push('<select' + o.real_id + o.className + o.alt + '>' + list.join('') + '</select>');
	} else if (o.multiple) {
		if (typeof o.value === 'array' || typeof o.value === 'object') {
			for (i in o.value) {
				list.push('<option>'+o.value[i]+'</option>');
			}
		}
		txt.push('<select style="width:100%;clear:both;" class="golem_multiple" multiple' + o.real_id + '>' + list.join('') + '</select><br>');
		if (typeof o.multiple === 'string') {
			txt.push('<input class="golem_select" type="text" size="' + o.size + '">');
		} else {
			list = [];
			switch (typeof o.multiple) {
				case 'number':
					step = Divisor(o.select);
					for (i=0; i<=o.multiple; i+=step) {
						list.push('<option>' + i + '</option>');
					}
					break;
				case 'array':
				case 'object':
					if (isArray(o.multiple)) {
						for (i=0; i<o.multiple.length; i++) {
							list.push('<option value="' + o.multiple[i] + '">' + o.multiple[i] + (o.suffix ? ' '+o.suffix : '') + '</option>');
						}
					} else {
						for (i in o.multiple) {
							list.push('<option value="' + i + '">' + o.multiple[i] + (o.suffix ? ' '+o.suffix : '') + '</option>');
						}
					}
					break;
			}
			txt.push('<select class="golem_select">'+list.join('')+'</select>');
		}
		txt.push('<input type="button" class="golem_addselect" value="Add" /><input type="button" class="golem_delselect" value="Del" />');
	}
	if (o.after) {
		txt.push(' '+o.after);
	}
	if (o.label && (o.text || o.checkbox || o.select || o.multiple)) {
		txt.push('</span>');
	}
	$option = $('<div>' + txt.join('') + '</div>');
	if (o.require) {
		if (typeof o.require === 'string') {
			i = o.require;
			o.require = {};
			o.require[i] = true;
		}
		for (i in o.require) { // Make sure all paths are absolute, "worker.option.key" (option/runtime/data) and all values are in an array
			if (typeof o.require[i] !== 'object') {
				o.require[i] = [o.require[i]];
			}
			if (i.search(/\.(data|option|runtime)\./) === -1) {
				o.require[worker.name + '.option.' + i] = o.require[i];
				delete o.require[i];
			} else if (i.search(/(data|option|runtime)\./) === 0) {
				o.require[worker.name + '.' + i] = o.require[i];
				delete o.require[i];
			}
		}
		$option.addClass('golem-require').attr('require', JSON.stringify(o.require));
	}
	if (o.group) {
		$option.append(this.makeOptions(worker,o.group));
	} else {
		$option.append('<br>');
	}
	if (o.advanced) {
		$option.addClass('golem-advanced');
	}
	if (o.help) {
		$option.attr('title', o.help);
	}
	if (o.advanced || o.exploit) {
		$option.css('background','#ffeeee');
	}
	if (o.advanced && !this.option.advanced) {
		$option.css('display','none');
	}
	if (o.exploit && !this.option.exploit) {
		$option.css('display','none');
	}
	if (o.exploit) {
		$option.css('border','1px solid red');
	}
	return $option;
};

Config.set = function(key, value) {
	this._unflush();
	if (!this.data[key] || JSON.stringify(this.data[key]) !== JSON.stringify(value)) {
		this.data[key] = value;
		$('select.golem_' + key).each(function(a,el){
			var i, worker = Worker.find($(el).closest('div.golem-panel').attr('id')), val = worker ? worker.get(['option', $(el).attr('id').regex(/_([^_]*)$/i)]) : null, list = Config.data[key], options = [];
			if (isArray(list)) {
				for (i=0; i<list.length; i++) {
					options.push('<option value="' + list[i] + '">' + list[i] + '</option>');//' + (val===i ? ' selected' : '') + '
				}
			} else {
				for (i in list) {
					options.push('<option value="' + i + '">' + list[i] + '</option>');//' + (val===i ? ' selected' : '') + '
				}
			}
			$(el).html(options.join('')).val(val);
		});
		this._save();
		return true;
	}
	return false;
};

Config.checkRequire = function(selector) {
//	console.log(log(), 'checkRequire($("'+(typeof id === 'string' ? '#'+id+' ' : '')+'.golem-require"))');
	if (isWorker(selector)) {
		selector = '#'+selector.id+' .golem-require';
	} else if (typeof selector !== 'undefined' && $(selector).length) {
		selector = $('.golem-require', selector);
	} else {
		selector = '.golem-require';
	}
	$(selector).each(function(a,el){
		var i, j, worker, path, value, show = true, or, require = JSON.parse($(el).attr('require'));
		if ($(el).hasClass('golem-advanced')) {
			show = Config.option.advanced;
		}
		for (i in require) {
			path = i.split('.');
			worker = Worker.find(path.shift());
			if (!isWorker(worker)) {
				show = false;// Worker doesn't exist - assume it's not a typo, so always hide us...
				break;
			}
			value = worker.get(path,false);
//			{key:[true,true,true], key:[[false,false,false],true,true]} - false is AND, true are OR
			or = [];
			for (j=0; j<require[i].length; j++) {
				if (isArray(require[i][j])) {
					if (findInArray(require[i][j], value)) {
						show = false;
						break;
					}
				} else {
					or.push(require[i][j]);
				}
			}
			if (!show || (or.length && !findInArray(or, value))) {
				show = false;
				break;
			}
		}
		if (show) {
			$(el).show();
		} else {
			$(el).hide();
		}
	});
	for (var i in Workers) {
		Workers[i]._save('option');
	}
};

Config.getOrder = function() {
	var order = [];
	$('#golem_config > div').each(function(i,el){
		order.push($(el).attr('name'));
	});
	return unique(order);
};


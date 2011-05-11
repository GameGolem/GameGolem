/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Dashboard, History, Page, Queue, Resources, Script,
	Battle, Generals, LevelUp, Player,
	APP, APPID, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, Divisor, length, sum, findInObject, objectIndex, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
	makeImage, getImage, log, warn, error, isUndefined
*/
/********** Worker.Config **********
* Has everything to do with the config
*/
var Config = new Worker('Config');

Config.settings = {
	system:true,
	keep:true,
	taint:true
};

Config.option = {
	display:'block',
	fixed:false,
	advanced:false,
	debug:false,
	exploit:false
};

Config.temp = {
	require:[],
	menu:null
};

Config.init = function() {
	var i, j, k, tmp, worker, multi_change_fn;
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
	// START: Move active (unfolded) workers into individual worker.option._config._show
	if (this.option.active) {
		for (i=0; i<this.option.active.length; i++) {
			worker = Worker.find(this.option.active[i]);
			if (worker) {
				worker.set(['option','_config','_show'], true);
			}
		}
		this.set(['option','active']);
	}
	// END
	$('head').append('<link rel="stylesheet" href="http://cloutman.com/css/base/jquery-ui.css" type="text/css" />');
	this.makeWindow(); // Creates all UI stuff
	$('.golem-config .golem-panel > h3').live('click.golem', function(event){ // Toggle display of config panels
		var worker = Worker.find($(this).parent().attr('id'));
		worker.set(['option','_config','_show'], worker.get(['option','_config','_show'], false) ? undefined : true); // Only set when *showing* panel
		Worker.flush();
	});
	$('.golem-config .golem-panel h4').live('click.golem', function(event){ // Toggle display of config groups
		var $this = $(this), $next = $this.next('div'), worker = Worker.find($this.parents('.golem-panel').attr('id')), id = $this.text().toLowerCase().replace(/[^a-z]/g,'');
		if ($next.length && worker && id) {
			worker.set(['option','_config',id], worker.get(['option','_config',id], false) ? undefined : true); // Only set when *hiding* group
			$this.toggleClass('golem-group-show');
			$next.stop(true,true).toggle('blind');
			Worker.flush();
		}
	});
	multi_change_fn = function(el) {
		var $this = $(el), tmp, worker, val;
		if ($this.attr('id') && (tmp = $this.attr('id').slice(PREFIX.length).regex(/([^_]*)_(.*)/i)) && (worker = Worker.find(tmp[0]))) {
			val = [];
			$this.children().each(function(a,el){ val.push($(el).text()); });
			worker.get(['option', tmp[1]]);
			worker.set(['option', tmp[1]], val);
		}
	};

	$('input.golem_addselect').live('click.golem', function(){
		var i, value, values = $(this).prev().val().split(','), $multiple = $(this).parent().children().first();
		for (i=0; i<values.length; i++) {
			value = values[i].trim();
			if (value) {
				$multiple.append('<option>' + value + '</option>').change();
			}
		}
		multi_change_fn($multiple[0]);
		Worker.flush();
	});
	$('input.golem_delselect').live('click.golem', function(){
		var $multiple = $(this).parent().children().first();
		$multiple.children().selected().remove();
		multi_change_fn($multiple[0]);
		Worker.flush();
	});
	$('#golem_config input,textarea,select').live('change.golem', function(){
		var $this = $(this), tmp, worker, val, handled = false;
		if ($this.is('#golem_config :input:not(:button)') && $this.attr('id') && (tmp = $this.attr('id').slice(PREFIX.length).regex(/([^_]*)_(.*)/i)) && (worker = Worker.find(tmp[0]))) {
			if ($this.attr('type') === 'checkbox') {
				val = $this.attr('checked');
			} else if ($this.attr('multiple')) {
				multi_change_fn($this[0]);
				handled = true;
			} else {
				val = $this.attr('value') || $this.val() || null;
				if (val && val.search(/^[-+]?\d*\.?\d+$/) >= 0) {
					val = parseFloat(val);
				}
			}
			if (!handled) {
				worker.set('option.'+tmp[1], val);
				Worker.flush();
			}
		}
	});
	$('.golem-panel-header input').live('click.golem', function(event){
		event.stopPropagation(true);
	});
	$('#content').append('<div id="golem-menu" class="golem-menu golem-shadow"></div>');
	$('.golem-icon-menu').live('click.golem', function(event) {
		var i, j, k, keys, hr = false, html = '', $this = $(this.wrappedJSObject || this), worker = Worker.find($this.attr('name')), name = worker ? worker.name : '';
		$('.golem-icon-menu-active').removeClass('golem-icon-menu-active');
		if (Config.get(['temp','menu']) !== name) {
			Config.set(['temp','menu'], name);
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
				position:Config.get(['option','fixed']) ? 'fixed' : 'absolute',
				top:$this.offset().top + $this.height(),
				left:Math.min($this.offset().left, $('body').width() - $('#golem-menu').outerWidth(true) - 4)
			}).show();
		} else {// Need to stop it going up to the config panel, but still close the menu if needed
			Config.set(['temp','menu']);
			$('#golem-menu').hide();
		}
		Worker.flush();
		event.stopPropagation();
		return false;
	});
	$('.golem-menu > div').live('click.golem', function(event) {
		var i, $this = $(this.wrappedJSObject || this), key = $this.attr('name').regex(/^([^.]*)\.([^.]*)\.(.*)/), worker = Worker.find(key[0]);
//		log(key[0] + '.menu(' + key[1] + ', ' + key[2] + ')');
		worker._unflush();
		worker.menu(Worker.find(key[1]), key[2]);
		Worker.flush();
	});
	$('body').live('click.golem', function(event){ // Any click hides it, relevant handling done above
		Config.set(['temp','menu']);
		$('.golem-icon-menu-active').removeClass('golem-icon-menu-active');
		$('#golem-menu').hide();
		Worker.flush();
	});
	this._watch(this, 'option.advanced');
	this._watch(this, 'option.debug');
	this._watch(this, 'option.exploit');
};

Config.update = function(event) {
	if (event.type === 'show') {
		$('#golem_config_frame').show();// make sure everything is created before showing (css sometimes takes another second to load though)
	}
	if (event.type === 'watch') {
		var i, $el, $el2, worker = event.worker, id = event.id.slice('option.'.length), value, list, options = [];
		if (worker === this && event.id === 'data') { // Changing one of our dropdown lists
			list = [];
			value = this.get(event.path);
			if (isArray(value)) {
				for (i=0; i<value.length; i++) {
					list.push('<option value="' + value[i] + '">' + value[i] + '</option>');
				}
			} else if (isObject(value)) {
				for (i in value) {
					list.push('<option value="' + i + '">' + value[i] + '</option>');
				}
			}
			list = list.join('');
			$('select.golem_' + event.path.slice('data.'.length)).each(function(a,el){
				var worker = Worker.find($(el).closest('div.golem-panel').attr('id')), val = worker ? worker.get(['option', $(el).attr('id').regex(/_([^_]*)$/i)]) : null;
				$(el).html(list).val(val);
			});
		} else if (worker === this && (id === 'advanced' || id === 'debug' || id === 'exploit')) {
			for (i in Workers) {
				if (Workers[i].settings.advanced || Workers[i].settings.debug || Workers[i].settings.exploit) {
					$('#'+Workers[i].id).css('display', ((!Workers[i].settings.advanced || this.option.advanced) && (!Workers[i].settings.debug || this.option.debug) && (!Workers[i].settings.exploit || this.option.exploit)) ? '' : 'none');
				}
			}
		} else if (id === '_config._show') { // Fold / unfold a config panel or group panel
			i = worker.get(['option','_config','_show'], false);
			$el = $('#' + worker.id);
			$el2 = $el.children('div').stop(true,true);
			if (i) {
				$el2.show('blind');
				$el.addClass('golem-panel-show');
			} else {
				$el2.hide('blind',function(){
					$el.removeClass('golem-panel-show');
				});
			}
		} else if (id === '_sleep') { // Show the ZZZ icon
			$('#golem_sleep_' + worker.name).css('display', worker.get(['option','_sleep'],false) ? '' : 'none');
		} else {
			if (($el = $('#'+this.makeID(worker, id))).length === 1) {
				if ($el.attr('type') === 'checkbox') {
					$el.attr('checked', worker.get('option.'+id, false));
				} else if ($el.attr('multiple')) {
					$el.empty();
					worker.get('option.'+id, [], isArray).forEach(function(val){
						$el.append('<option>'+val+'</option>');
					});
				} else if ($el.attr('value')) {
					$el.attr('value', worker.get('option.'+id));
				} else {
					$el.val(worker.get('option.'+id));
				}
			}
		}
		this.checkRequire();
	}
};

Config.menu = function(worker, key) {
	if (!worker) {
		if (!key) {
			return [
				'fixed:' + (this.option.fixed ? '<img src="' + getImage('pin_down') + '">Fixed' : '<img src="' + getImage('pin_left') + '">Normal') + '&nbsp;Position',
				'advanced:' + (this.option.advanced ? '+' : '-') + 'Advanced&nbsp;Options',
				'debug:' + (this.option.debug ? '+' : '-') + 'Debug&nbsp;Options'
			];
		} else if (key) {
			switch (key) {
				case 'fixed':
					this.set(['option','fixed'], !this.option.fixed);
					$('#golem_config_frame').toggleClass('golem-config-fixed');
					break;
				case 'advanced':
					this.set(['option','advanced'], !this.option.advanced);
					this.checkRequire();
					break;
				case 'debug':
					this.set(['option','debug'], !this.option.debug);
					this.checkRequire();
					break;
			}
		}
	}
};

Config.addButton = function(options) {
	if (options.advanced >= 0 && !Config.get(['option','advanced'],false)) {
		options.hide = true;
	}
	var html = $('<img class="golem-theme-button golem-button' + (options.active ? '-active' : '') + (options.advanced ? ' golem-advanced' : '') + (options.className ? ' '+options.className : '') + '" ' + (options.id ? 'id="'+options.id+'" ' : '') + (options.title ? 'title="'+options.title+'" ' : '') + (options.hide ? 'style="display:none;" ' : '') + 'src="' + getImage(options.image) + '">');
	if (options.prepend) {
		$('#golem_buttons').prepend(html);
	} else if (options.after) {
		$('#'+options.after).after(html);
	} else {
		$('#golem_buttons').append(html);
	}
	if (options.click) {
		html.click(options.click);
	}
}

Config.makeWindow = function() {  // Make use of the Facebook CSS for width etc - UIStandardFrame_SidebarAds
	var i, j, k, tmp = $('<div id="golem_config_frame" class="ui-widget-content golem-config' + (this.option.fixed?' golem-config-fixed':'') + '" style="display:none;width:' + $('#rightCol').width() + 'px;">' +
		'<div class="golem-title">' +
			'&nbsp;Castle Age Golem ' + (isRelease ? 'v'+version : 'r'+revision) +
			'<img class="golem-image golem-icon-menu" src="' + getImage('menu') + '">' +
		'</div>' +
		'<div id="golem_buttons">' +
		'</div>' +
		'<div style="display:'+this.option.display+';">' +
			'<div id="golem_config" style="overflow:hidden;overflow-y:auto;">' +
				// All config panels go in here
			'</div>' +
		'</div>' +
	'</div>');
	$('#rightCol').prepend(tmp);
	this.addButton({
		id:'golem_options',
		image:'options',
		active:this.option.display==='block',
		title:'Show Options',
		click:function(){
			$(this).toggleClass('golem-button golem-button-active');
			Config.set(['option','display'], Config.get(['option','display'], false) === 'block' ? 'none' : 'block');
			$('#golem_config').parent().toggle('blind'); //Config.option.fixed?null:
		}
	});
	for (i in Workers) { // Propagate all before and after settings
		if (Workers[i].settings.before) {
			for (j=0; j<Workers[i].settings.before.length; j++) {
				k = Worker.find(Workers[i].settings.before[j]);
				if (k) {
					k.settings.after = k.settings.after || [];
					k.settings.after.push(Workers[i].name);
					k.settings.after = k.settings.after.unique();
//					log(LOG_WARN, 'Pushing '+k.name+' after '+Workers[i].name+' = '+k.settings.after);
				}
			}
		}
		if (Workers[i].settings.after) {
			for (j=0; j<Workers[i].settings.after.length; j++) {
				k = Worker.find(Workers[i].settings.after[j]);
				if (k) {
					k.settings.before = k.settings.before || [];
					k.settings.before.push(Workers[i].name);
					k.settings.before = k.settings.before.unique();
//					log(LOG_WARN, 'Pushing '+k.name+' before '+Workers[i].name+' = '+k.settings.before);
				}
			}
		}
	}
	for (i in Workers) {
		this.makePanel(Workers[i]);
	}
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
	this._update('show');
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
		var unsortable = worker.settings.unsortable ? '' : ' golem-panel-sortable',
			show = worker.get(['option','_config','_show'], false) ? ' golem-panel-show' : '',
			display = (worker.settings.advanced && !this.option.advanced) || (worker.settings.debug && !this.option.debug) || (worker.settings.exploit && !this.option.exploit),
			disabled = worker.get(['option', '_disabled'], false) ? ' red' : '',
			sleep = worker.get(['option','_sleep'], false) ? '' : ' style="display:none;"';
		$('#golem_config').append(
			'<div id="' + worker.id + '" class="golem-panel' + unsortable + show + '"' + (display ? ' style="display:none;"' : '') + ' name="' + worker.name + '">' +
				'<h3 class="golem-theme-panel golem-panel-header' + disabled + '">' +
					'<img class="golem-icon" src="' + getImage('blank') + '">' +
					worker.name +
					'<img id="golem_sleep_' + worker.name + '" class="golem-image" src="' + getImage('zzz') + '"' + sleep + '>' +
					'<img class="golem-image golem-icon-menu" name="' + worker.name + '" src="' + getImage('menu') + '">' +
					'<img class="golem-lock" src="' + getImage('lock') + '">' +
				'</h3>' +
			'<div class="golem-panel-content" style="font-size:smaller;"></div></div>'
		);
		this._watch(worker, 'option._config._show');
		this._watch(worker, 'option._sleep');
	} else {
		$('#'+worker.id+' > div').empty();
	}
	this.addOption(worker, args);
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
			log(LOG_WARN, e.name + ' in Config.makeOptions(' + worker.name + '.display()): ' + e.message);
		}
	} else {
		log(LOG_ERROR, worker.name+' is trying to add an unknown type of option: '+(typeof args));
	}
	return $([]);
};

Config.makeOption = function(worker, args) {
	var i, j, o, r, step, $option, txt = [], list = [];
	o = $.extend({}, {
		before: '',
		after: '',
		suffix: '',
		className: '',
		between: 'to',
		size: 18,
		min: 0,
		max: 100,
		real_id: ''
	}, args);
	if (o.id) {
		if (!isArray(o.id)) {
			o.id = o.id.split('.');
		}
		if (o.id.length > 0 && Workers[o.id[0]]) {
			worker = Workers[o.id.shift()];
		}
		if (isUndefined(worker._datatypes[o.id[0]])) {
			o.id.unshift('option');
		}
		o.path = o.id;
		o.id = o.id.slice(1).join('.');
		this._watch(worker, o.path);
		o.real_id = ' id="' + this.makeID(worker, o.id) + '"';
		o.value = worker.get(o.path, null);
	}
	o.alt = (o.alt ? ' alt="'+o.alt+'"' : '');
	if (o.hr) {
		txt.push('<br><hr style="clear:both;margin:0;">');
	}
	if (o.title) {
		txt.push('<h4 class="golem-group-title' + (o.group ? ' golem-group' + (worker.get(['option','_config',o.title.replace(' ','').toLowerCase()], false) ? '' : ' golem-group-show') : '') + '">' + (o.group ? '<img class="golem-icon" src="' + getImage('blank') + '">' : '') + o.title.replace(' ','&nbsp;') + '</h4>');
	}
	if (o.label && !o.button) {
		txt.push('<span style="float:left;margin-top:2px;">'+o.label.replace(' ','&nbsp;')+'</span>');
		if (o.text || o.checkbox || o.select || o.number) {
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
		txt.push('<input type="text"' + o.real_id + (o.label || o.before || o.after ? '' : ' style="width:100%;"') + ' size="' + o.size + '" value="' + (o.value || isNumber(o.value) ? o.value : '') + '">');
	} else if (o.number) {
		txt.push('<input type="number"' + o.real_id + (o.label || o.before || o.after ? '' : ' style="width:100%;"') + ' size="6"' + (o.step ? ' step="'+o.step+'"' : '') + ' min="' + o.min + '" max="' + o.max + '" value="' + (isNumber(o.value) ? o.value : o.min) + '">');
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
		if (isArray(o.value)) {
			for (i = 0; i < o.value.length; i++) {
				list.push('<option>'+o.value[i]+'</option>');
			}
		} else if (isObject(o.value)) {
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
	if (o.require || o.advanced || o.debug || o.exploit) {
		try {
			r = {depth:0};
			r.require = {};
			if (o.advanced) {
				r.require.advanced = true;
				$option.css('background','#ffeeee');
			}
			if (o.debug) {
				r.require.debug = true;
				$option.css({border:'1px solid blue', 'background':'#ddddff'});
			}
			if (o.exploit) {
				r.require.exploit = true;
				$option.css({border:'1px solid red', 'background':'#ffeeee'});
			}
			if (o.require) {
				r.require.x = Script.parse(worker, 'option', o.require);
			}
			this.temp.require.push(r.require);
			$option.attr('id', 'golem_require_'+(this.temp.require.length-1)).css('display', this.checkRequire(this.temp.require.length - 1) ? '' : 'none');
		} catch(e) {
			log(LOG_ERROR, e.name + ' in createRequire(' + o.require + '): ' + e.message);
		}
	}
	if (o.group) {
		$option.append($('<div' + o.real_id + (o.title ? ' style="padding-left:16px;' + (worker.get(['option','_config',o.title.toLowerCase().replace(/[^a-z]/g,'')], false) ? 'display:none;' : '') + '"' : '') + '></div>').append(this.makeOptions(worker,o.group)));
	} else {
		$option.append('<br>');
	}
	if (o.help) {
		$option.attr('title', o.help);
	}
	return $option;
};

Config.checkRequire = function(id) {
	var i, show = true, require;
	if (!isNumber(id) || !(require = this.temp.require[id])) {
		for (i=0; i<this.temp.require.length; i++) {
			arguments.callee.call(this, i);
		}
		return;
	}
	if (require.advanced) {
		show = Config.option.advanced;
	}
	if (require.debug) {
		show = Config.option.debug;
	}
	if (show && require.exploit) {
		show = Config.option.exploit;
	}
	if (show && require.x) {
		show = Script.interpret(require.x);
	}
	if (require.show !== show) {
		require.show = show;
		$('#golem_require_'+id).css('display', show ? '' : 'none');
	}
	return show;
};

Config.getOrder = function() {
	var order = [];
	$('#golem_config > div').each(function(i,el){
		order.push($(el).attr('name'));
	});
	return order.unique();
};


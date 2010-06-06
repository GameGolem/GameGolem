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

Config.init = function() {
	if (iscaap()) {
		return false;
	}
	$('head').append('<link rel="stylesheet" href="http://cloutman.com/css/base/jquery-ui.css" type="text/css" />');
	var $btn, $golem_config, $newPanel, i, j, k;
	$('div.UIStandardFrame_Content').after('<div class="golem-config' + (Config.option.fixed?' golem-config-fixed':'') + '"><div class="ui-widget-content"><div class="golem-title">Castle Age Golem ' + (typeof revision !== 'undefined' && revision !== '$WCREV$' ? 'r'+revision : 'v'+VERSION) + '<img id="golem_fixed"></div><div id="golem_buttons" style="margin:4px;"><img class="golem-button' + (Config.option.display==='block'?'-active':'') + '" id="golem_options" src="data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%10%00%00%00%10%08%03%00%00%00(-%0FS%00%00%00%0FPLTE%E2%E2%E2%8A%8A%8A%AC%AC%AC%FF%FF%FFUUU%1C%CB%CE%D3%00%00%00%04tRNS%FF%FF%FF%00%40*%A9%F4%00%00%00%3DIDATx%DA%A4%8FA%0E%00%40%04%03%A9%FE%FF%CDK%D2%B0%BBW%BD%CD%94%08%8B%2F%B6%10N%BE%A2%18%97%00%09pDr%A5%85%B8W%8A%911%09%A8%EC%2B%8CaM%60%F5%CB%11%60%00%9C%F0%03%07%F6%BC%1D%2C%00%00%00%00IEND%AEB%60%82"></div><div style="display:'+Config.option.display+';"><div id="golem_config" style="margin:0 4px;overflow:hidden;overflow-y:auto;"></div><div style="text-align:right;"><label>Advanced <input type="checkbox" id="golem-config-advanced"' + (Config.option.advanced ? ' checked' : '') + '></label></div></div></div></div>');
	$('#golem_options').click(function(){
		$(this).toggleClass('golem-button golem-button-active');
		Config.option.display = Config.option.display==='block' ? 'none' : 'block';
		$('#golem_config').parent().toggle('blind'); //Config.option.fixed?null:
		Config._save('option');
	});
	$('#golem_fixed').click(function(){
		Config.option.fixed ^= true;
		$(this).closest('.golem-config').toggleClass('golem-config-fixed');
		Config._save('option');
	});
	$golem_config = $('#golem_config');
	for (i in Workers) {
		$golem_config.append(Config.makePanel(Workers[i]));
	}
	$golem_config.sortable({axis:"y"}); //, items:'div', handle:'h3' - broken inside GM
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
	$golem_config.children('.golem-panel-sortable')
		.draggable({ connectToSortable:'#golem_config', axis:'y', distance:5, scroll:false, handle:'h3', helper:'clone', opacity:0.75, zIndex:100,
refreshPositions:true, stop:function(){Config.updateOptions();} })
		.droppable({ tolerance:'pointer', over:function(e,ui) {
			var i, order = Config.getOrder(), me = WorkerByName($(ui.draggable).attr('name')), newplace = arrayIndexOf(order, $(this).attr('name'));
			if (arrayIndexOf(order, 'Idle') >= newplace) {
				if (me.settings.before) {
					for(i=0; i<me.settings.before.length; i++) {
						if (arrayIndexOf(order, me.settings.before[i]) <= newplace) {
							return;
						}
					}
				}
				if (me.settings.after) {
					for(i=0; i<me.settings.after.length; i++) {
						if (arrayIndexOf(order, me.settings.after[i]) >= newplace) {
							return;
						}
					}
				}
			}
			if (newplace < arrayIndexOf(order, $(ui.draggable).attr('name'))) {
				$(this).before(ui.draggable);
			} else {
				$(this).after(ui.draggable);
			}
		} });
	for (i in Workers) { // Propagate all before and after settings
		if (Workers[i].settings.before) {
			for (j=0; j<Workers[i].settings.before.length; j++) {
				k = WorkerByName(Workers[i].settings.before[j]);
				if (k) {
					k.settings.after = k.settings.after || [];
					k.settings.after.push(Workers[i].name);
					k.settings.after = unique(k.settings.after);
//					debug('Pushing '+k.name+' after '+Workers[i].name+' = '+k.settings.after);
				}
			}
		}
		if (Workers[i].settings.after) {
			for (j=0; j<Workers[i].settings.after.length; j++) {
				k = WorkerByName(Workers[i].settings.after[j]);
				if (k) {
					k.settings.before = k.settings.before || [];
					k.settings.before.push(Workers[i].name);
					k.settings.before = unique(k.settings.before);
//					debug('Pushing '+k.name+' before '+Workers[i].name+' = '+k.settings.before);
				}
			}
		}
	}
	$.expr[':'].golem = function(obj, index, meta, stack) { // $('input:golem(worker,id)') - selects correct id
		var args = meta[3].toLowerCase().split(',');
		if ($(obj).attr('id') === PREFIX + args[0].trim().replace(/[^0-9a-z]/g,'-') + '_' + args[1].trim()) {
			return true;
		}
		return false;
	};
	$('input.golem_addselect').live('click', function(){
		var i, value, values = $('.golem_select', $(this).parent()).val().split(',');
		for (i=0; i<values.length; i++) {
			value = values[i].trim();
			if (value) {
				$('select.golem_multiple', $(this).parent()).append('<option>' + value + '</option>');
			}
		}
		Config.updateOptions();
	});
	$('input.golem_delselect').live('click', function(){
		$('select.golem_multiple option[selected=true]', $(this).parent()).each(function(i,el){$(el).remove();})
		Config.updateOptions();
	});
	$('input,textarea,select', $golem_config).change( function(){
		Config.updateOptions();
	});
	$('#golem-config-advanced').click(function(){
		Config.updateOptions();
		$('.golem-advanced').css('display', Config.option.advanced ? '' : 'none');}
	);
};

Config.makePanel = function(worker) {
	var i, o, x, y, req, id, step, show, $head, $panel, $option, display = worker.display, txt = [], list = [], options = {
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
	worker.id = 'golem_panel_'+worker.name.toLowerCase().replace(/[^0-9a-z]/g,'-');
	show = findInArray(this.option.active, worker.id);
	$head = $('<div id="' + worker.id + '" class="golem-panel' + (worker.settings.unsortable?'':' golem-panel-sortable') + (show?' golem-panel-show':'') + (worker.settings.advanced ? ' golem-advanced' : '') + '"' + ((worker.settings.advanced && !this.option.advanced) || (worker.settings.exploit && !this.option.exploit) ? ' style="display:none;"' : '') + ' name="' + worker.name + '"><h3 class="golem-panel-header "><img class="golem-icon" src="data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%10%00%00%00%10%08%03%00%00%00(-%0FS%00%00%00%06PLTE%00%00%00%00%00%00%A5g%B9%CF%00%00%00%01tRNS%00%40%E6%D8f%00%00%00%0FIDATx%DAb%60%18%05%C8%00%20%C0%00%01%10%00%01%3BBBK%00%00%00%00IEND%AEB%60%82">' + worker.name + '<img class="golem-lock" src="data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%10%00%00%00%10%08%03%00%00%00(-%0FS%00%00%00%06PLTE%00%00%00%00%00%00%A5g%B9%CF%00%00%00%01tRNS%00%40%E6%D8f%00%00%00%0FIDATx%DAb%60%18%05%C8%00%20%C0%00%01%10%00%01%3BBBK%00%00%00%00IEND%AEB%60%82"></h3></div>');
	switch (typeof display) {
		case 'array':
		case 'object':
			$panel = $('<div class="golem-panel-content" style="font-size:smaller;"></div>');
			for (i in display) {
				txt = [];
				list = [];
				o = $.extend(true, {}, options, display[i]);
				o.real_id = PREFIX + worker.name.toLowerCase().replace(/[^0-9a-z]/g,'-') + '_' + o.id;
				o.value = worker.get('option.'+o.id) || null;
				o.alt = (o.alt ? ' alt="'+o.alt+'"' : '');
				if (o.hr) {
					txt.push('<br><hr style="clear:both;margin:0;">');
				}
				if (o.title) {
					txt.push('<div style="text-align:center;font-size:larger;font-weight:bold;">'+o.title.replace(' ','&nbsp;')+'</div>');
				}
				if (o.label) {
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
						txt.push('<span style="float:right" id="' + o.real_id + '">' + (o.value || o.info) + '</span>');
					} else {
						txt.push(o.info);
					}
				} else if (o.text) {
					txt.push('<input type="text" id="' + o.real_id + '" size="' + o.size + '" value="' + (o.value || '') + '">');
				} else if (o.textarea) {
					txt.push('<textarea id="' + o.real_id + '" name="' + o.real_id + '" cols="23" rows="5">' + (o.value || '') + '</textarea>');
				} else if (o.checkbox) {
					txt.push('<input type="checkbox" id="' + o.real_id + '"' + (o.value ? ' checked' : '') + '>');
				} else if (o.select) {
					switch (typeof o.select) {
						case 'number':
							step = Divisor(o.select);
							for (x=0; x<=o.select; x+=step) {
								list.push('<option' + (o.value==x ? ' selected' : '') + '>' + x + '</option>');
							}
							break;
						case 'string':
							o.className = ' class="golem_'+o.select+'"';
							if (this.data && this.data[o.select] && (typeof this.data[o.select] === 'array' || typeof this.data[o.select] === 'object')) {
								o.select = this.data[o.select];
							} else {
								break; // deliberate fallthrough
							}
						case 'array':
						case 'object':
							if (isArray(o.select)) {
								for (x=0; x<o.select.length; x++) {
									list.push('<option value="' + o.select[x] + '"' + (o.value==o.select[x] ? ' selected' : '') + '>' + o.select[x] + (o.suffix ? ' '+o.suffix : '') + '</option>');
								}
							} else {
								for (x in o.select) {
									list.push('<option value="' + x + '"' + (o.value==x ? ' selected' : '') + '>' + o.select[x] + (o.suffix ? ' '+o.suffix : '') + '</option>');
								}
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
					txt.push('<select style="width:100%;clear:both;" class="golem_multiple" multiple id="' + o.real_id + '">' + list.join('') + '</select><br>');
					if (typeof o.multiple === 'string') {
						txt.push('<input class="golem_select" type="text" size="' + o.size + '">');
					} else {
						list = [];
						switch (typeof o.multiple) {
							case 'number':
								step = Divisor(o.select);
								for (x=0; x<=o.multiple; x+=step) {
									list.push('<option>' + x + '</option>');
								}
								break;
							case 'array':
							case 'object':
								if (isArray(o.multiple)) {
									for (x=0; x<o.multiple.length; x++) {
										list.push('<option value="' + o.multiple[x] + '">' + o.multiple[x] + (o.suffix ? ' '+o.suffix : '') + '</option>');
									}
								} else {
									for (x in o.multiple) {
										list.push('<option value="' + x + '">' + o.multiple[x] + (o.suffix ? ' '+o.suffix : '') + '</option>');
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
				$option = $('<div>' + txt.join('') + '<br></div>');
				if (o.require) {
					if (typeof o.require === 'string') {
						x = o.require;
						o.require = {};
						o.require[x] = true;
					}
					for (x in o.require) { // Make sure all paths are absolute, "worker.option.key" (option/runtime/data) and all values are in an array
						if (typeof o.require[x] !== 'object') {
							o.require[x] = [o.require[x]];
						}
						if (x.search(/\.(data|option|runtime)\./) === -1) {
							o.require[worker.name + '.option.' + x] = o.require[x];
							delete o.require[x];
						} else if (x.search(/(data|option|runtime)\./) === 0) {
							o.require[worker.name + '.' + x] = o.require[x];
							delete o.require[x];
						}
					}
					$option.addClass('golem-require').attr('require', JSON.stringify(o.require));
				}
				o.advanced && $option.addClass('golem-advanced');
				o.help && $option.attr('title', o.help);
				(o.advanced || o.exploit) && $option.css('background','#ffeeee');
				o.advanced && !this.option.advanced && $option.css('display','none');
				o.exploit && !this.option.exploit && $option.css('display','none');
				o.exploit && $option.css('border','1px solid red');
				$panel.append($option);
			}
			$head.append($panel);
			return $head;
		case 'function':
			$head.append('<div class="golem-panel-content" style="font-size:smaller;"></div>');
			try {
				$('.golem-panel-content', $head).append(display());
			} catch(e) {
				debug(e.name + ' in Config.makePanel(' + worker.name + '.display()): ' + e.message);
			}
			return $head;
		default:
			return null;
	}
};

Config.set = function(key, value) {
	if (iscaap()) {
		return false;
	}
	this._unflush();
	if (!this.data[key] || JSON.stringify(this.data[key]) !== JSON.stringify(value)) {
		this.data[key] = value;
		$('select.golem_' + key).each(function(i,el){
			var worker = WorkerById($(el).closest('div.golem-panel').attr('id')), val = worker ? worker.get(['option', $(el).attr('id').regex(/_([^_]*)$/i)]) : null, list = Config.data[key], options = [];
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

Config.updateOptions = function() {
//	debug('Options changed');
	// Get order of panels first
	Queue.option.queue = this.getOrder();
	// Now can we see the advanced stuff
	this.option.advanced = $('#golem-config-advanced').attr('checked');
	// Now save the contents of all elements with the right id style
	$('#golem_config :input').each(function(i,el){
		if ($(el).attr('id')) {
			var val, tmp = $(el).attr('id').slice(PREFIX.length).regex(/([^_]*)_(.*)/i);
			if (!tmp) {
				return;
			}
			if ($(el).attr('type') === 'checkbox') {
				val = $(el).attr('checked');
			} else if ($(el).attr('multiple')) {
				val = [];
				$('option', el).each(function(i,el){ val.push($(el).text()); });
			} else {
				val = $(el).attr('value') || ($(el).val() || null);
				if (val && val.search(/[^0-9.]/) === -1) {
					val = parseFloat(val);
				}
			}
			try {
				WorkerByName(tmp[0]).set('option.'+tmp[1], val);
			} catch(e) {
				debug(e.name + ' in Config.updateOptions(): ' + $(el).attr('id') + '(' + JSON.stringify(tmp) + ') = ' + e.message);
			}
		}
	});
	$('.golem-require').each(function(i,el){
		var i, worker, path, value, show = true, require = JSON.parse($(el).attr('require'));
		for (i in require) {
			path = i.split('.');
			worker = path.shift();
			value = WorkerByName(worker).get(path,false);
			if (!findInArray(require[i], value)) {
				show = false;
			}
		}
		if (show) {
			$(el).show();
		} else {
			$(el).hide();
		}
		log('Checking require: ' + (typeof require === 'object' ? require.toSource() : require));
	});
	for (i in Workers) {
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


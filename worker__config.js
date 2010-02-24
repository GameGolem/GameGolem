/********** Worker.Config **********
* Has everything to do with the config
* Named with a double dash to ensure it comes early as other workers rely on it's onload() function!
*/
var Config = new Worker('Config');
Config.data = null;
Config.option = {
	display:'block',
	active:false,
	fixed:true
};
Config.panel = null;
Config.onload = function() {
	$('head').append('<link rel="stylesheet" href="http://cloutman.com/css/golem/jquery-ui.css" type="text/css" />');
	var $btn, $golem_config, $newPanel, i;
//<img id="golem_working" src="http://cloutman.com/css/base/images/ui-anim.basic.16x16.gif" style="border:0;float:right;display:none;" alt="Working...">
	Config.panel = $('<div class="golem-config'+(Config.option.fixed?' golem-config-fixed':'')+'"><div class="ui-widget-content" style="display:'+Config.option.display+';"><div class="ui-widget-header" id="golem_title" style="padding:4px;overflow:hidden;">Castle Age Golem v'+VERSION+'<span id="golem_fixed" class="ui-icon ui-icon-pin-'+(Config.option.fixed?'s':'w')+'" style="float:right;margin-top:-2px;"></span></div><div id="golem_buttons" style="margin:4px;"></div><div id="golem_config" style="margin:4px;overflow:hidden;overflow-y:auto;"></div></div></div>');
	$('div.UIStandardFrame_Content').after(Config.panel);
	$('#golem_fixed').click(function(){
			Config.option.fixed ^= true;
			$(this).toggleClass('ui-icon-pin-w ui-icon-pin-s');
			$(this).parent().parent().parent().toggleClass('golem-config-fixed');
			Settings.Save('option', Config);
	});
	$golem_config = $('#golem_config');
	for (i in Workers) {
		$golem_config.append(Config.makePanel(Workers[i]));
	}
	$golem_config
		.sortable({axis:"y"}) //, items:'div', handle:'h3' - broken inside GM
		.accordion({ autoHeight:false, clearStyle:true, active:(Config.option.active ? $('#'+Config.option.active, $golem_config) : false), collapsible:true, header:'div > h3', change:function(){Config.saveWindow();} });
	$golem_config.children(':not(.golem_unsortable)')
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
	var i, o, x, id, step, $head, $panel, display = worker.display, panel = [], txt = [], list = [], options = {
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
	$head = $('<div id="'+worker.priv_id+'"'+(worker.unsortable?' class="golem_unsortable"':'')+' name="'+worker.name+'"><h3 style="width:186px;">'+(worker.unsortable?'<span class="ui-icon ui-icon-locked" style="float:right;"></span>':'')+'<a>'+worker.name+'</a></h3></div>');
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
			$head.append('<div style="font-size:smaller;">' + panel.join('') + '</div>');
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
Config.saveWindow = function() {
	Config.option.top = Config.panel.offset().top;
	Config.option.left = Config.panel.offset().left;
	if (Config.panel.width() && Config.panel.height()) {
		Config.option.width = Config.panel.width();
		Config.option.height = Config.panel.height();
	}
	Config.option.active = $('#golem_config h3.ui-state-active').parent().attr('id');
//	Config.option.active = $('#golem_config').accordion('option','active'); // Accordian is still bugged at the time of writing...
	Settings.Save('option', Config);
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


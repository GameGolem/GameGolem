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
	$('head').append('<link rel="stylesheet" href="http://cloutman.com/css/base/jquery-ui.css" type="text/css" />');
	var $btn, $golem_config, $newPanel, i, pin1 = 'data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%10%00%00%00%10%08%03%00%00%00(-%0FS%00%00%00%0FPLTE%DE%DE%DE%DD%DD%DDcccUUU%00%00%00%23%06%7B1%00%00%00%05tRNS%FF%FF%FF%FF%00%FB%B6%0ES%00%00%00.IDATx%DAb%60A%03%0Cd%0B03%81%18LH%02%10%80%2C%C0%84%24%00%96d%C2%A7%02%AB%19L%8C%A8%B6P%C3%E9%08%00%10%60%00%00z%03%C7%24%170%91%00%00%00%00IEND%AEB%60%82', pin2 = 'data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%10%00%00%00%10%08%03%00%00%00(-%0FS%00%00%00%0FPLTE%DE%DE%DE%DD%DD%DDcccUUU%00%00%00%23%06%7B1%00%00%00%05tRNS%FF%FF%FF%FF%00%FB%B6%0ES%00%00%005IDATx%DAb%60A%03%0C%C4%0901%83%00%13%92%0A%B0%00%0B)%02%8C%CCLLL%CC%0Cx%0CefF%E8%81%B9%83%19%DDa%84%05H%F0%1C%40%80%01%00%FE9%03%C7%D4%8CU%A3%00%00%00%00IEND%AEB%60%82';

	
	//<img id="golem_working" src="http://cloutman.com/css/base/images/ui-anim.basic.16x16.gif" style="border:0;float:right;display:none;" alt="Working...">
	Config.panel = $('<div class="golem-config' + (Config.option.fixed?' golem-config-fixed':'') + '"><div class="ui-widget-content"><div class="golem-title">Castle Age Golem v' + VERSION + '<img id="golem_fixed" style="float:right;margin:-2px;" src="' + (Config.option.fixed?pin2:pin1) + '"></div><div id="golem_buttons" style="margin:4px;"><img class="golem-button' + (Config.option.display==='block'?'-active':'') + '" id="golem_options" src="data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%10%00%00%00%10%08%03%00%00%00(-%0FS%00%00%00%0FPLTE%E2%E2%E2%8A%8A%8A%AC%AC%AC%FF%FF%FFUUU%1C%CB%CE%D3%00%00%00%04tRNS%FF%FF%FF%00%40*%A9%F4%00%00%00%3DIDATx%DA%A4%8FA%0E%00%40%04%03%A9%FE%FF%CDK%D2%B0%BBW%BD%CD%94%08%8B%2F%B6%10N%BE%A2%18%97%00%09pDr%A5%85%B8W%8A%911%09%A8%EC%2B%8CaM%60%F5%CB%11%60%00%9C%F0%03%07%F6%BC%1D%2C%00%00%00%00IEND%AEB%60%82"></div><div id="golem_config" style="display:'+Config.option.display+';margin:0 4px 4px 4px;overflow:hidden;overflow-y:auto;"></div></div></div>');
	$('div.UIStandardFrame_Content').after(Config.panel);
	$('#golem_options').click(function(){
		$(this).toggleClass('golem-button golem-button-active');
		Config.option.display = Config.option.display==='block' ? 'none' : 'block';
		$('#golem_config').toggle('blind'); //Config.option.fixed?null:
		Settings.Save('option', Config);
	});
	$('#golem_fixed').click(function(){
			Config.option.fixed ^= true;
			$(this).attr('src', Config.option.fixed?pin2:pin1);
			$(this).parent().parent().parent().toggleClass('golem-config-fixed');
			Settings.Save('option', Config);
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
				Settings.Save('option', Config);
			});
		} else {
			$(this).parent().toggleClass('golem-panel-show');
			$(this).next().show('blind');
			Config.option.active = [];
			$('.golem-panel-show').each(function(i,el){Config.option.active.push($(this).attr('id'));});
			Settings.Save('option', Config);
		}
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
// padlock = data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAAZQTFRFVVVVAAAA9QSfoAAAAAJ0Uk5T%2FwDltzBKAAAAMUlEQVR42mJgRAMMRAswMDCgCDAwwETgAowoAgwMcCW4BRgJCqBqwbSWHL%2FAAUCAAQBuEQDPfStrmwAAAABJRU5ErkJggg%3D%3D
// arrow-right
	worker.priv_id = 'golem_panel_'+worker.name.toLowerCase().replace(/[^0-9a-z]/,'_');
	show = findInArray(Config.option.active, worker.priv_id);
	$head = $('<div id="'+worker.priv_id+'" class="golem-panel'+(worker.unsortable?'':' golem-panel-sortable')+(show?' golem-panel-show':'')+'" name="'+worker.name+'"><h3 class="golem-panel-header "><img class="golem-icon">'+worker.name+'<img class="golem-lock"></h3></div>');
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
						txt.push('<span style="float:right" id="' + o.real_id + '">' + o.info + '</span>');
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


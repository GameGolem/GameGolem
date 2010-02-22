/********** Worker.Config **********
* Has everything to do with the config
*/
var $configWindow = null;

var Config = new Worker('Config');
Config.data = null;
Config.option = {
	top: 60,
	left: 25,
	width: 250,
	height: "auto",
	active:false
};
Config.panel = null;
Config.onload = function() {
	$('head').append('<link rel="stylesheet" href="http://cloutman.com/css/base/jquery-ui.css" type="text/css" />');
	var $golem_config, $newPanel, i, panel, pos = 'top:'+Config.option.top+'px;left:'+Config.option.left+'px;width:'+Config.option.width+'px;height:auto;';
//<img id="golem_working" src="http://cloutman.com/css/base/images/ui-anim.basic.16x16.gif" style="border:0;float:right;display:none;" alt="Working...">
	Config.panel = $('<div class="ui-widget-content" style="'+pos+'padding:0;position:absolute;overflow:hidden;overflow-y:auto;"><div class="ui-widget-header" id="golem_title" style="padding:4px;cursor:move;overflow:hidden;">Castle Age Golem v'+VERSION+'</div><div id="golem_buttons" style="margin:4px;"></div><div id="golem_config" style="margin:4px;overflow:hidden;overflow-y:auto;"></div></div>');
	$('#content').append(Config.panel);
	$(Config.panel)
		.draggable({ containment:'parent', handle:'#golem_title', stop:function(){
			Config.saveWindow();
		} })
		.resizable({ containment:'parent', handles:'se', minWidth:100, resize:function(){
			$('#golem_config').height($(Config.panel).height()-$('#golem_config').position().top-8);
		}, stop:function(){
			Config.saveWindow();
		} });
//	$('.ui-resizable-se', Config.panel).last().dblclick(function(){$(Config.panel).css('height','auto');});
	$golem_config = $('#golem_config');
	$golem_config
		.sortable({axis:"y"});//, items:'div', handle:'h3'
	for (i in Workers) {	// Load the display panels up
		if (Workers[i].display) {
//			GM_debug(Workers[i].name + '.display()');
			panel = Workers[i].display();
			if (panel) { // <span class="ui-icon ui-icon-arrow-1-n"></span><span class="ui-icon ui-icon-arrow-1-s"></span>
				Workers[i].priv_id = 'golem_panel_'+Workers[i].name.toLowerCase().replace(/[^0-9a-z]/,'_');
				// <input type="checkbox" id="'+Workers[i].priv_id+'_disabled" '+(true?' checked':'')+'>
				$newPanel = $('<div id="'+Workers[i].priv_id+'"'+(Workers[i].unsortable?' class="golem_unsortable"':'')+' name="'+Workers[i].name+'"><h3><a>'+(Workers[i].unsortable?'<img "class="ui-icon ui-icon-locked" style="left:2em;width:16px;height:16px" />&nbsp;&nbsp;&nbsp;&nbsp;':'')+Workers[i].name+'</a></h3></div>');
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
			if (Config.getPlace($(this).attr('id')) < Config.getPlace($(ui.draggable).attr('id'))) {
				$(this).before(ui.draggable);
			} else {
				$(this).after(ui.draggable);
			}
		} });
	Generals.select();
	$('input ,textarea, select', $golem_config).change( function(){Config.updateOptions();} );
//	$(Config.panel).css({display:'block'});
};
Config.saveWindow = function() {
	Config.option.top = $(Config.panel).offset().top;
	Config.option.left = $(Config.panel).offset().left;
	Config.option.width = $(Config.panel).width();
	Config.option.height = $(Config.panel).height();
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
				val = ($(el).val() || null);
				if (val && val.search(/[^0-9.]/)) {
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


/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global console, isString, isArray, isNumber, isUndefined, Workers, Worker, Settings, $ */

var Scripting = new Worker('Script'); // The one and only time we're using the wrong name - BAD!!!
Scripting.data = Scripting.temp = Scripting.runtime = null;

Scripting.settings = {
	system:true,
	advanced:true,
	taint:true
};

Scripting.option = {
	path:'Player.data',
	script:'', // Script shown in Dashboard
	worker:'Player',
	type:'data'
};

Scripting.dashboard = function() {
	var i, path = this.option.worker+'.'+this.option.type, html = '', list = [];
	html += '<input id="golem_script_run" type="button" value="Run">';
	html += ' Using: <select id="golem_script_worker">';
	for (i=1; i<Settings.temp.paths.length; i++) {
		html += '<option value="' + Settings.temp.paths[i] + '"' + (Settings.temp.paths[i] === path ? ' selected' : '') + '>' + Settings.temp.paths[i] + '</option>';
	}
	html += '</select>';
	html += ' Result: <input id="golem_script_result" type="text" value="" disabled>';
	html += '<input id="golem_script_clear" style="float:right;" type="button" value="Clear">';
	html += '<div class="ui-helper-clearfix"><textarea id="golem_script_edit" placeholder="Enter code here" style="width:98%;">' + (Scripting.option.script || '') + '</textarea></div>';
	html += '<div class="ui-helper-clearfix"><h3><a>Variables</a></h3><pre id="golem_script_data">-</pre></div>';
	html += '<div class="ui-helper-clearfix"><h3><a>Compiled code</a></h3><pre id="golem_script_source">-</pre></div>';
	$('#golem-dashboard-Script').html(html);
	$('#golem_script_edit').autoSize();
	$('#golem_script_source').parent().accordion({
		collapsible: true,
		autoHeight: false,
		clearStyle: true,
		animated: 'blind',
		active: this.get(['option','_config','source'], false) || 0,
		change: function(event, ui){
			Scripting.set(['option','_config','source'], ui.newHeader.length ? undefined : true, null, true); // Only set when *hiding* panel
		}
	});
	$('#golem_script_data').parent().accordion({
		collapsible: true,
		autoHeight: false,
		clearStyle: true,
		animated: 'blind',
		active: this.get(['option','_config','data'], false) || 0,
		change: function(event, ui){
			Scripting.set(['option','_config','data'], ui.newHeader.length ? undefined : true, null, true); // Only set when *hiding* panel
		}
	});
	$('#golem_script_worker').change(function(){Scripting.set(['option','path'], $(this).val());});
	$('#golem_script_run').click(function(){
		Scripting.set(['option','script'], $('#golem_script_edit').val());
		var path = Scripting.option.path.regex(/([^.]*)\.(.*)/), script = new Script(Scripting.option.script, {
			'default':Workers[path[0]].get(path[1], {})
		});
		Scripting.set(['option','worker'], path[0]);
		Scripting.set(['option','type'], path[1]);
		$('#golem_script_result').val(script.run());
		$('#golem_script_data').text(JSON.stringify(script.data, null, '   '));
		$('#golem_script_source').text(JSON.stringify(script.script, null, '   '));
	});
	$('#golem_script_clear').click(function(){$('#golem_script_edit,#golem_script_source,#golem_script_result').val('');});
};


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

/********** Worker.Dashboard **********
* Displays statistics and other useful info
*/
var Dashboard = new Worker('Dashboard', '*');
Dashboard.option = {
	display:'none'
};
Dashboard.parse = function(change) {
	if (!$('#golem_dashboard').length) {
		$('#app'+APP+'_nvbar_nvl').css({width:'760px', 'padding-left':0, 'margin':'auto'});
		$('<div><div class="nvbar_start"></div><div class="nvbar_middle"><a id="golem_toggle_dash"><span class="hover_header">Dashboard</span></a></div><div class="nvbar_end"></div></div><div><div class="nvbar_start"></div><div class="nvbar_middle"><a id="golem_toggle_config"><span class="hover_header">Config</span></a></div><div class="nvbar_end"></div></div>').prependTo('#app'+APP+'_nvbar_nvl > div:last-child');
		$('<div id="golem_dashboard" style="position:absolute;width:600px;height:185px;margin:0;border-left:1px solid black;border-right:1px solid black;padding4px;overflow:hidden;overflow-y:auto;background:white;z-index:1;display:'+Dashboard.option.display+';">Dashboard...</div>').prependTo('#app'+APP+'_main_bn_container');
		$('#golem_toggle_dash').click(function(){
			Dashboard.option.display = Dashboard.option.display==='block' ? 'none' : 'block';
			$('#golem_dashboard').toggle('drop');
		});
		$('#golem_toggle_config').click(function(){
			Config.option.display = Config.option.display==='block' ? 'none' : 'block';
			$('.golem-config > div').toggle(Config.option.fixed?null:'blind');
		});
	}
	return false;
};


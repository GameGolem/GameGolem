/********** Worker.Dashboard **********
* Displays statistics and other useful info
*/
var Dashboard = new Worker('Dashboard', '*');
Dashboard.option = {
	display:'none'
};
Dashboard.div = null;
Dashboard.onload = function() {
	Dashboard.div = $('<div id="golem-dashboard" style="display:'+Dashboard.option.display+';">Dashboard...</div>').prependTo('.UIStandardFrame_Content');
}
Dashboard.parse = function(change) {
	$('#app'+APP+'_nvbar_nvl').css({width:'760px', 'padding-left':0, 'margin':'auto'});
	$('<div><div class="nvbar_start"></div><div class="nvbar_middle"><a id="golem_toggle_dash"><span class="hover_header">Dashboard</span></a></div><div class="nvbar_end"></div></div><div><div class="nvbar_start"></div><div class="nvbar_middle"><a id="golem_toggle_config"><span class="hover_header">Config</span></a></div><div class="nvbar_end"></div></div>').prependTo('#app'+APP+'_nvbar_nvl > div:last-child');
	$('#golem_toggle_dash').click(function(){
		Dashboard.option.display = Dashboard.option.display==='block' ? 'none' : 'block';
		$('#golem_dashboard').toggle('drop');
		Settings.Save('option', Dashboard);
	});
	$('#golem_toggle_config').click(function(){
		Config.option.display = Config.option.display==='block' ? 'none' : 'block';
		$('.golem-config > div').toggle(Config.option.fixed?null:'blind');
		Settings.Save('option', Config);
	});
	return false;
};


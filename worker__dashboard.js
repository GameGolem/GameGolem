/********** Worker.Dashboard **********
* Displays statistics and other useful info
*/
var Dashboard = new Worker('Dashboard', '*');
Dashboard.data = null;
Dashboard.option = {
	display:'block',
	active:null
};
Dashboard.div = null;
Dashboard.onload = function() {
	var id, tabs = [], divs = [], active = Dashboard.option.active;
	for (i in Workers) {
		if (Workers[i].dashboard) {
			id = 'golem-dashboard-'+Workers[i].name;
			if (!active) {
				Dashboard.option.active = active = id;
			}
			tabs.push('<h3 name="'+id+'" class="golem-tab-header'+(active===id ? ' golem-tab-header-active' : '')+'">'+Workers[i].name+'</h3>');
			divs.push('<div id="'+id+'"'+(active===id ? '' : ' style="display:none;"')+'></div>');
		}
	}
	Dashboard.div = $('<div id="golem-dashboard" style="top:' + $('#app'+APP+'_main_bn').offset().top+'px;display:' + Dashboard.option.display+';">' + tabs.join('') + '<div>' + divs.join('') + '</div></div>').prependTo('.UIStandardFrame_Content');
	$('.golem-tab-header').click(function(){
		if ($(this).hasClass('golem-tab-header-active')) {
			return;
		}
		if (Dashboard.option.active) {
			$('h3[name="'+Dashboard.option.active+'"]').removeClass('golem-tab-header-active');
			$('#'+Dashboard.option.active).hide();
		}
		Dashboard.option.active = $(this).attr('name');
		$(this).addClass('golem-tab-header-active');
		$('#'+Dashboard.option.active).show();
		Settings.Save('option', Dashboard);
	});
	$('#golem-dashboard .golem-panel > h3').live('click', function(event){
		if ($(this).parent().hasClass('golem-panel-show')) {
			$(this).next().hide('blind',function(){$(this).parent().toggleClass('golem-panel-show');});
		} else {
			$(this).parent().toggleClass('golem-panel-show');
			$(this).next().show('blind');
		}
	});

	window.setInterval(function(){
		$('.golem-timer').each(function(i,el){
			$(el).text(makeTimer($(el).text().parseTimer() - 1));
		});
	},1000);
}
Dashboard.parse = function(change) {
	$('#app'+APP+'_nvbar_nvl').css({width:'760px', 'padding-left':0, 'margin':'auto'});
	$('<div><div class="nvbar_start"></div><div class="nvbar_middle"><a id="golem_toggle_dash"><span class="hover_header">Dashboard</span></a></div><div class="nvbar_end"></div></div><div><div class="nvbar_start"></div></div>').prependTo('#app'+APP+'_nvbar_nvl > div:last-child');
	$('#golem_toggle_dash').click(function(){
		Dashboard.option.display = Dashboard.option.display==='block' ? 'none' : 'block';
		$('#golem-dashboard').toggle('drop');
		Settings.Save('option', Dashboard);
	});
	$('#golem_toggle_config').click(function(){
		Config.option.display = Config.option.display==='block' ? 'none' : 'block';
		$('#golem_config').toggle('blind'); //Config.option.fixed?null:
		Settings.Save('option', Config);
	});
	return false;
};


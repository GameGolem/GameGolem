
// Elite army
// http://apps.facebook.com/castle_age/party.php?twt=jneg&jneg=true&user=44404517

/********** main() **********
* Runs every second, only does something when the page changes
*/
function main() {
	// First - check if the page has changed...
	if (!Page.loading() && !$('#secret_golem_check').length) {
		if (!$('#app'+APP+'_nvbar_div_end').length) {
			Page.reload();
			return;
		}
		$('#app'+APP+'_nvbar_div_end').append('<br id="secret_golem_check" style="display:none"/>');
		Page.identify();
		for (var i in Workers) {
			if (Workers[i].pages && (Workers[i].pages=='*' || (Page.page && Workers[i].pages.indexOf(Page.page)>=0)) && Workers[i].parse) {
//				GM_debug(Workers[i].name + '.parse(false)');
				Workers[i].priv_parse = Workers[i].parse(false);
			} else Workers[i].priv_parse = false;
		}
		Settings.Save('data');
		for (var i in Workers) {
			if (Workers[i].priv_parse) {
//				GM_debug(Workers[i].name + '.parse(true)');
				Workers[i].parse(true);
			}
		}
	}
	Queue.run();
}

/********** $(document).ready() **********
* Runs when the page has finished loading, but the external data might still be coming in
*/
$(document).ready(function() {
	Page.identify();
	Settings.Load('data');
	Settings.Load('option');
	if (window.location.href.indexOf('castle_age') >= 0) {
		for (var i in Workers) {
			if (Workers[i].onload) Workers[i].onload();
		}
		main(); // Call once to get the ball rolling...
		window.setInterval(function(){main();},1000);
	}
});


/********** Worker.Update **********
* Checks if there's an update to the script, and lets the user update if there is.
*/
var Update = new Worker('Update');
Update.data = null;
Update.option = null;
Update.found = false;
Update.onload = function() {
	var $btn = $('<button name="Script Update" id="golem_update">Check</button>')
		.button().click(function(){Update.now(true);});
	$('#golem_buttons').append($btn);
};
Update.now = function(force) {
	if (Update.found) {
		window.location.href = 'http://userscripts.org/scripts/source/67412.user.js';
		return;
	}
	var lastUpdateCheck = Settings.GetValue("lastUpdateCheck", 0);
	if (force || Date.now() - lastUpdateCheck > 21600000) {
		// 6+ hours since last check (60x60x6x1000ms)
		Settings.SetValue("lastUpdateCheck", Date.now().toString());
		GM_xmlhttpRequest({
			method: "GET",
			url: 'http://userscripts.org/scripts/show/67412',
			onload: function(evt) {
				if (evt.readyState === 4 && evt.status === 200) {
					var tmp = $(evt.responseText), remoteVersion = $('#summary', tmp).text().regex(/Version:[^0-9.]+([0-9.]+)/i);
					if (force) {
						$('#golem_request').remove();
					}
					if (remoteVersion>VERSION) {
						Update.found = true;
						$('#golem_update span').text('Install');
						if (force) {
							$('#golem_config').after('<div id="golem_request" title="Castle Age Golem"><p>There is a new version of Castle Age Golem available.</p><p>Current&nbsp;version:&nbsp;'+VERSION+', New&nbsp;version:&nbsp;'+remoteVersion+'</p></div>');
							$('#golem_request').dialog({ modal:true, buttons:{"Install":function(){$(this).dialog("close");window.location.href='http://userscripts.org/scripts/source/67412.user.js';}, "Skip":function(){$(this).dialog("close");}} });
						}
						GM_log('New version available: '+remoteVersion);
					} else if (force) {
						$('#golem_config').after('<div id="golem_request" title="Castle Age Golem"><p>There are no new versions available.</p></div>');
						$('#golem_request').dialog({ modal:true, buttons:{"Ok":function(){$(this).dialog("close");}} });
					}
				}
			}
		});
	}
};


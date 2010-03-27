/********** Worker.Update **********
* Checks if there's an update to the script, and lets the user update if there is.
*/
var Update = new Worker('Update');
Update.data = null;
Update.option = null;
Update.found = false;
Update.init = function() {
	var $btn = $('<img class="golem-button" name="Script Update" id="golem_update" src="data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%10%00%00%00%10%08%03%00%00%00(-%0FS%00%00%00%18PLTE%C7%C7%C7UUU%7B%7B%7B%BF%BF%BF%A6%A6%A6%FF%FF%FF%40%40%40%FF%FF%FFk5%D0%FB%00%00%00%08tRNS%FF%FF%FF%FF%FF%FF%FF%00%DE%83%BDY%00%00%00UIDATx%DAt%8F%5B%12%800%08%03%23%8Fx%FF%1B%5B%C0%96%EA%E8~%95%9D%C0%A48_%E0S%A8p%20%3A%85%F1%C6Jh%3C%DD%FD%205E%E4%3D%18%5B)*%9E%82-%24W6Q%F3Cp%09%E1%A2%8E%A2%13%E8b)lVGU%C7%FF%E7v.%01%06%005%D6%06%07%F9%3B(%D0%00%00%00%00IEND%AEB%60%82">').click(function(){Update.now(true);});
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
						$('#golem_update').attr('src', 'data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%10%00%00%00%10%08%03%00%00%00(-%0FS%00%00%00%18PLTE%C8%C8%C8%C1%C1%C1%BA%BA%BA%F1%F1%F1ggg%FF%FF%FF%40%40%40%FF%FF%FF%7D%5C%EC%14%00%00%00%08tRNS%FF%FF%FF%FF%FF%FF%FF%00%DE%83%BDY%00%00%00OIDATx%DA%8C%8FA%0A%C0%20%0C%04W%8D%EB%FF%7F%AC1%5BQi%A1s%0A%C3%24%10%B4%0B%7C%89%9COa%A4%ED%22q%906a%2CE%09%14%D4%AA%04%BA0%8AH%5C%80%02%12%3E%FB%0A%19b%06%BE2%13D%F0%F0.~%3E%B7%E8%02%0C%00Z%03%06Q9dE%25%00%00%00%00IEND%AEB%60%82').toggleClass('golem-button golem-button-active');
						if (force) {
							$('#golem_config').after('<div id="golem_request" title="Castle Age Golem"><p>There is a new version of Castle Age Golem available.</p><p>Current&nbsp;version:&nbsp;'+VERSION+', New&nbsp;version:&nbsp;'+remoteVersion+'</p></div>');
							$('#golem_request').dialog({ modal:true, buttons:{"Install":function(){$(this).dialog("close");window.location.href='http://userscripts.org/scripts/source/67412.user.js';}, "Skip":function(){$(this).dialog("close");}} });
						}
						log('New version available: '+remoteVersion);
					} else if (force) {
						$('#golem_config').after('<div id="golem_request" title="Castle Age Golem"><p>There are no new versions available.</p></div>');
						$('#golem_request').dialog({ modal:true, buttons:{"Ok":function(){$(this).dialog("close");}} });
					}
				}
			}
		});
	}
};


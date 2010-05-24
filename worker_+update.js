/********** Worker.Update **********
* Checks if there's an update to the script, and lets the user update if there is.
*/
var Update = new Worker('Update');
Update.data = null;
Update.option = null;

Update.settings = {
	system:true
};

Update.runtime = {
	lastcheck:0,// Date.now() = time since last check
	force:false,// Have we clicked a button, or is it an automatic check
	last:0,
	revision:0,
	beta:0,
	found:false// Have we found a new version
};

/***** Update.init() *****
1. Add a "Update Now" button to the button bar at the top of Config
1a. On clicking the button check if we've already found an update
1b. If an update was found then get GM to install it
1c. If no update was found then set the lastcheck to 0 to force the next check to come in 5 seconds
2. Add an (Advanced) "WIP" button to the button bar at the top of Config
2a. On clicking the button offer to install the latest WIP version
*/
Update.init = function() {
	var $btn = $('<img class="golem-button" name="Script Update" id="golem_update" src="data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%10%00%00%00%10%08%03%00%00%00(-%0FS%00%00%00%18PLTE%C7%C7%C7UUU%7B%7B%7B%BF%BF%BF%A6%A6%A6%FF%FF%FF%40%40%40%FF%FF%FFk5%D0%FB%00%00%00%08tRNS%FF%FF%FF%FF%FF%FF%FF%00%DE%83%BDY%00%00%00UIDATx%DAt%8F%5B%12%800%08%03%23%8Fx%FF%1B%5B%C0%96%EA%E8~%95%9D%C0%A48_%E0S%A8p%20%3A%85%F1%C6Jh%3C%DD%FD%205E%E4%3D%18%5B)*%9E%82-%24W6Q%F3Cp%09%E1%A2%8E%A2%13%E8b)lVGU%C7%FF%E7v.%01%06%005%D6%06%07%F9%3B(%D0%00%00%00%00IEND%AEB%60%82">').click(function(){if (Update.get('runtime.found')){window.location.href = 'http://game-golem.googlecode.com/svn/trunk/_release.user.js';} else {Update.set('runtime.force', true);Update.set('runtime.lastcheck', 0);}});
	$('#golem_buttons').append($btn);
	$btn = $('<img class="golem-button golem-advanced"' + (Config.get('option.advanced') ? '' : ' style="display:none;"') + ' name="Beta Update" src="data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%10%00%00%00%10%08%03%00%00%00(-%0FS%00%00%00%06PLTE%FF%FF%FFiii%92%95*%C3%00%00%00%01tRNS%00%40%E6%D8f%00%00%00%2FIDATx%DAb%60%C0%00%8CP%8CO%80%91%90%00%08%80H%14%25h%C60%10%2B%80l%0E%98%C3%88%AE%0ES%80%91%91T%8B%C0%00%20%C0%00%17G%00(%A6%C6G%AA%00%00%00%00IEND%AEB%60%82">').click(function(){
		$('#golem_config').after('<div id="golem_request" title="Castle Age Golem"><p>This will update to the latest Work-In-Progress version of Castle Age Golem.<br><br>Are you sure you wish to run a potentially buggy update?<br><br>You must reload the page after installing to use the new version.</div>');
		$('#golem_request').dialog({ modal:true, buttons:{"Install":function(){$(this).dialog("close").remove();window.location.href='http://game-golem.googlecode.com/svn/trunk/_normal.user.js';}, "Skip":function(){$(this).dialog("close").remove();}} });
	});
	$('#golem_buttons').append($btn);
};

/***** Update.work() *****
1a. Check that we've not already found an update
1b. Check that it's been more than 6 hours since the last update
2a. Use AJAX to get the google trunk source webpage (list of files and revisions)
2b. Parse out the revision string for both release and beta

5. Compare with our own version
6. Remember it if we have an update
7. Notify the user -
7a. Change the update button image
7b. Show a requester to the user asking if they'd like to update
*/
Update.work = function(state) {
	if (!this.runtime.found && Date.now() - this.runtime.lastcheck > 21600000) {// 6+ hours since last check (60x60x6x1000ms)
		this.runtime.lastcheck = Date.now();
		/*
		debug('Checking trunk revisions');
		GM_xmlhttpRequest({ // Cross-site ajax, only via GreaseMonkey currently...
			method: "GET",
			url: 'http://code.google.com/p/game-golem/source/browse/#svn/trunk',
			onload: function(evt) {
				if (evt.readyState === 4 && evt.status === 200) {
					var release = evt.responseText.regex(/"_release.user.js":\["[^"]*","([0-9]+)"/i), beta = evt.responseText.regex(/"_normal.user.js":\["[^"]*","([0-9]+)"/i);
					debug('Version: '+release+', Beta: '+beta);
				}
			}
		});
		*/
		GM_xmlhttpRequest({
			method: "GET",
			url: 'http://game-golem.googlecode.com/svn/trunk/_normal.user.js',
			onload: function(evt) {
				if (evt.readyState === 4 && evt.status === 200) {
					var remoteVersion = evt.responseText.regex(/@version[^0-9.]+([0-9.]+)/i);
					if (Update.get('runtime.force')) {
						$('#golem_request').remove();
					}
					if (remoteVersion>VERSION) {
						Update.set('runtime.found', true);
						$('#golem_update').attr('src', 'data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%10%00%00%00%10%08%03%00%00%00(-%0FS%00%00%00%18PLTE%C8%C8%C8%C1%C1%C1%BA%BA%BA%F1%F1%F1ggg%FF%FF%FF%40%40%40%FF%FF%FF%7D%5C%EC%14%00%00%00%08tRNS%FF%FF%FF%FF%FF%FF%FF%00%DE%83%BDY%00%00%00OIDATx%DA%8C%8FA%0A%C0%20%0C%04W%8D%EB%FF%7F%AC1%5BQi%A1s%0A%C3%24%10%B4%0B%7C%89%9COa%A4%ED%22q%906a%2CE%09%14%D4%AA%04%BA0%8AH%5C%80%02%12%3E%FB%0A%19b%06%BE2%13D%F0%F0.~%3E%B7%E8%02%0C%00Z%03%06Q9dE%25%00%00%00%00IEND%AEB%60%82').toggleClass('golem-button golem-button-active');
						if (Update.get('runtime.force')) {
							$('#golem_config').after('<div id="golem_request" title="Castle Age Golem"><p>There is a new version of Castle Age Golem available.</p><p>Current&nbsp;version:&nbsp;'+VERSION+', New&nbsp;version:&nbsp;'+remoteVersion+'</p></div>');
							$('#golem_request').dialog({ modal:true, buttons:{"Install":function(){$(this).dialog("close");window.location.href='http://game-golem.googlecode.com/svn/trunk/_release.user.js';}, "Skip":function(){$(this).dialog("close");}} });
						}
						log('New version available: '+remoteVersion);
					} else if (Update.get('runtime.force')) {
						$('#golem_config').after('<div id="golem_request" title="Castle Age Golem"><p>There are no new versions available.</p></div>');
						$('#golem_request').dialog({ modal:true, buttons:{"Ok":function(){$(this).dialog("close");}} });
					}
					Update.set('runtime.force', false);
				}
			}
		});
	}
};


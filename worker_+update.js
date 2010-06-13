/********** Worker.Update **********
* Checks if there's an update to the script, and lets the user update if there is.
*/
var Update = new Worker('Update');
Update.data = null;
Update.option = null;

Update.settings = {
	gm_only:true,// We need the cross-site ajax for our update checks
	system:true
};

Update.runtime = {
	lastcheck:0,// Date.now() = time since last check
	force:false// Have we clicked a button, or is it an automatic check
};

Update.found = false;

/***** Update.init() *****
1. Add a "Update Now" button to the button bar at the top of Config
1a. On clicking the button check if we've already found an update
1b. If an update was found then get GM to install it
1c. If no update was found then set the lastcheck to 0 to force the next check to come in 5 seconds
2. Add an (Advanced) "WIP" button to the button bar at the top of Config
2a. On clicking the button offer to install the latest WIP version
*/
Update.init = function() {
	var $btn = $('<img class="golem-button" name="Script Update" id="golem_update" src="' + (isRelease ? Images.update : Images.beta) + '">').click(function(){
		$(this).addClass('red');
		Update.runtime.force = true;
	});
	$('#golem_buttons').append($btn);
	if (isRelease) {
		$btn = $('<img class="golem-button golem-advanced"' + (Config.get('option.advanced') ? '' : ' style="display:none;"') + ' name="Beta Update" src="' + Images.beta + '">').click(function(){
			$(this).addClass('red');
			isRelease = false;
			Update.runtime.force = true;
		});
		$('#golem_buttons').append($btn);
	}
};

/***** Update.work() *****
1a. Check that we've not already found an update
1b. Check that it's been more than 6 hours since the last update
2a. Use AJAX to get the google trunk source webpage (list of files and revisions)
2b. Parse out the revision string for both release and beta
3. Display a notification if there's a new version - 
*/
Update.work = function(state) {
	if (!this.found && (this.runtime.force || Date.now() - this.runtime.lastcheck > 21600000)) {// 6+ hours since last check (60x60x6x1000ms)
		this.runtime.lastcheck = Date.now();
		debug('Checking trunk revisions');
		GM_xmlhttpRequest({ // Cross-site ajax, only via GreaseMonkey currently...
			method: "GET",
			url: 'http://code.google.com/p/game-golem/source/browse/#svn/trunk',
			onload: function(evt) {
				if (evt.readyState === 4 && evt.status === 200) {
					var file, $btn;
					file = evt.responseText.regex(/"trunk":{".*"_release.user.js":\["[^"]*","([0-9]+)","([^"]*)"/i);
					if (file[0] > revision) {
						$('#golem_buttons').after('<div class="golem-button golem-info green" title="r' + file[0] + ' released ' + file[1] + ', currently on r' + revision +'"><a href="http://game-golem.googlecode.com/svn/trunk/_release.user.js">New Version Available</a></div>');
						Update.found = true;
						log('New version available: '+file[0]+', currently on r'+revision);
					}
					if (!isRelease) {
						file = evt.responseText.regex(/"trunk":{".*"_normal.user.js":\["[^"]*","([0-9]+)","([^"]*)"/i);
						if (file[0] > revision) {
							$('#golem_buttons').after('<div class="golem-button golem-info green" title="r' + file[0] + ' released ' + file[1] + ', currently on r' + revision +'"><a href="http://game-golem.googlecode.com/svn/trunk/_normal.user.js">New Beta Available</a></div>');
							Update.found = true;
							log('New revision available: '+file[0]+', currently on r'+revision);
						}
					}
					if (Update.runtime.force && !Update.found) {
						$btn = $('<div class="golem-button golem-info red">No Update Found</div>').animate({'z-index':0}, {
							duration:5000,
							complete:function(){log('test');$(this).remove();}
						});
						$('#golem_buttons').after($btn);
					}
					Update.runtime.force = false;
					$('#golem_update').removeClass('red');
				}
			}
		});
	}
};
/*
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
*/


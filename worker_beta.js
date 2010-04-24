/********** Worker.Beta **********
* Allows you to update the WIP version of the script.
*/
var Beta = new Worker('Beta');
Beta.data = null;
Beta.option = null;

Beta.settings = {
	system:true // Set to false for official releases
};

/***** Beta.init() *****
1. Add a "ß" button to the button bar at the top of Config
1a. On clicking the button offer to install the latest WIP version
*/
Beta.init = function() {
	var $btn = $('<img class="golem-button" name="Beta Update" src="data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%10%00%00%00%10%08%03%00%00%00(-%0FS%00%00%00%06PLTE%FF%FF%FFiii%92%95*%C3%00%00%00%01tRNS%00%40%E6%D8f%00%00%00%2FIDATx%DAb%60%C0%00%8CP%8CO%80%91%90%00%08%80H%14%25h%C60%10%2B%80l%0E%98%C3%88%AE%0ES%80%91%91T%8B%C0%00%20%C0%00%17G%00(%A6%C6G%AA%00%00%00%00IEND%AEB%60%82">').click(function(){
		$('#golem_config').after('<div id="golem_request" title="Castle Age Golem"><p>This will update to the latest Work-In-Progress version of Castle Age Golem.<br><br>Are you sure you wish to run a potentially buggy update?<br><br>You must reload the page after installing to use the new version.</div>');
		$('#golem_request').dialog({ modal:true, buttons:{"Install":function(){$(this).dialog("close").remove();window.location.href='http://game-golem.googlecode.com/svn/trunk/_normal.user.js';}, "Skip":function(){$(this).dialog("close").remove();}} });
	});
	$('#golem_buttons').append($btn);
};


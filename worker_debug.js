/********** Worker.Debug() **********
* Turns on/off the debug flag - doesn't save
*/
var Debug = new Worker('Debug');
Debug.data = null;
Debug.option = null;
Debug.display = function() {
	if (!debug) {
		return null; // Only add the button if debug is default on
	}
	var $btn = $('<button>Debug</button>')
		.button()
		.click(function(){debug^=true;GM_log('Debug '+(debug?'on':'off'));$('span', this).css('text-decoration', (debug?'none':'line-through'));});
	$('#golem_buttons').append($btn);
	return null;
};


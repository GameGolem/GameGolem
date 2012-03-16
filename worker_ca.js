/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false*/
/*global
	$, Worker, Workers, Main,
	APP, APPID, PREFIX, userID:true, imagepath:true, isFacebook,
	isRelease, version, revision, Images, window, browser,
	LOG_ERROR, LOG_WARN, LOG_LOG, LOG_INFO, LOG_DEBUG, log,
*/
// Add "Castle Age" to known applications
Main.add('castle_age', '46755028429', 'Castle Age', /^https?:\/\/web3\.castleagegame\.com\/castle_ws\//i, function() {
	if (!isFacebook) {
		Main.file = 'index.php';
		userID = ($('#main_bntp img').attr('src') || '').regex(/graph\.facebook\.com\/(\d+)\/picture/i);
		imagepath = ($('#AjaxLoadIcon img').attr('src') || '').pathpart();
		var fn = function(){
			var body = $('body').width(),
			    game = $('globalcss').width() || 762,
			    left = Math.max(0, Math.floor((body - game - 244) / 2));
			$('#rightCol').css({'padding-left':(left + game) + 'px'});
			$('center').css({'text-align':'left', 'padding-left':left+'px'});
			$('#collapsedGuildChat').css({'left':(left+5)+'px'});
			$('#expandedGuildChat').css({'left':(left+5)+'px'});
		};
		$('body').prepend('<div id="rightCol" style="position:absolute;left:0;top:2px;width:244px;height:0;"></div>');
		fn();
		Main._resize(fn);
	}
});

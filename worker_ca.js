// Add "Castle Age" to known applications
Main.add('castle_age', '46755028429', 'Castle Age', /^http:\/\/web3.castleagegame.com\/castle_ws\/index.php/i, function() {
	if (!isFacebook) {
		userID = ($('#main_bntp img').attr('src') || '').regex(/graph.facebook.com\/(\d+)\/picture/i);
		// imagepath = 'http://image4.castleagegame.com/graphics/';
		imagepath = ($('#AjaxLoadIcon img').attr('src') || '').pathpart();
		var fn = function(){
			var left = Math.max(0, Math.floor(($('body').width() - 1030) / 2));
			$('#rightCol').css({'padding-left':(left + 781) + 'px'});
			$('center').css({'text-align':'left', 'padding-left':left+'px'});
		};
		$('body').prepend('<div id="rightCol" style="position:absolute;left:0;top:2px;width:244px;height:0;"></div>');
		fn();
		Main._resize(fn);
	}
});

// Add "Castle Age" to known applications
Main.add('castle_age', '46755028429', 'Castle Age', /^http:\/\/web3.castleagegame.com\/castle_ws\/index.php/i, function() {
	if (!isFacebook) {
		userID = $('#main_bntp img').attr('src').regex(/graph.facebook.com\/([\d]+)\/picture/i);
		imagepath = 'http://image4.castleagegame.com/graphics/';
		PREFIX = 'golem'+APPID+'2_';
		$('body').prepend('<div id="rightCol" style="position:absolute;left:0;top:0;width:244px;"></div>');
	}
});

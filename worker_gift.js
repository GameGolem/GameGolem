/********** Worker.Gift() **********
* Auto accept gifts and return if needed
* *** Needs to talk to Alchemy to work out what's being made
*/
Gift = new Worker('Gift', 'index army_invite army_gifts');
Gift.lookup = {
	'eq_gift_mystic_mystery.jpg':	'Mystic Armor',
	'eq_drakehelm_mystery.jpg':		'Drake Helm',
	'gift_angel_mystery2.jpg':		'Battle Of Dark Legion',
	'alchemy_serpent_mystery.jpg':	'Serpentine Shield',
	'alchemy_horn_mystery.jpg':		'Poseidons Horn',
	'gift_sea_egg_mystery.jpg':		'Sea Serpent',
	'gift_egg_mystery.jpg':			'Dragon',
	'gift_druid_mystery.jpg':		'Whisper Bow',
	'gift_armor_mystery.jpg':		'Golden Hand',
	'mystery_frost_weapon.jpg':		'Frost Tear Dagger',
	'eq_mace_mystery.jpg':			'Morning Star'
}
Gift.onload = function() {
	if (!Gift.data.uid) Gift.data.uid = [];
	if (!Gift.data.todo) Gift.data.todo = {};
	if (!Gift.data.gifts) Gift.data.gifts = {};
}
Gift.parse = function(change) {
	if (change) return false;
	if (Page.page == 'index') {
		// If we have a gift waiting it doesn't matter from whom as it gets parsed on the right page...
		if (!Gift.data.uid.length && $('div.result').text().indexOf('has sent you a gift') >= 0) Gift.data.uid.push(1);
	} else if (Page.page == 'army_invite') {
		// Accepted gift first
		GM_debug('Gift: Checking for accepted');
		if (Gift.data.lastgift) {
			if ($('div.result').text().indexOf('accepted the gift') >= 0) {
				var uid = Gift.data.lastgift;
				if (!Gift.data.todo[uid].gifts) Gift.data.todo[uid].gifts = [];
				Gift.data.todo[uid].gifts.push($('div.result img').attr('src').filepart());
				Gift.data.lastgift = null;
			}
		}
		// Check for gifts
		GM_debug('Gift: Checking for new to accept');
		var uid = Gift.data.uid = [];
		if ($('div.messages').text().indexOf('gift') >= 0) {
			GM_debug('Gift: Found gift div');
			$('div.messages img').each(function(i,el) {
				uid.push($(el).attr('uid'));
				GM_debug('Gift: Adding gift from '+$(el).attr('uid'));
			});
		}
	} else if (Page.page == 'army_gifts') {
		var gifts = Gift.data.gifts = {};
		GM_debug('Gifts found: '+$('#app'+APP+'_giftContainer div[id^="app'+APP+'_gift"]').length);
		$('#app'+APP+'_giftContainer div[id^="app'+APP+'_gift"]').each(function(i,el){
			GM_debug('Gift adding: '+$(el).text()+' = '+$('img', el).attr('src'));
			var id = $('img', el).attr('src').filepart();
			var name = $(el).text().trim().replace('!','');
			if (!gifts[id]) gifts[id] = {};
			gifts[id].name = name;
			if (Gift.lookup[name]) gifts[id].create = Gift.lookup[name];
		});
	}
	return false;
}
Gift.display = function() {
	var panel = new Panel(this.name);
	panel.info('Work in progress...');
	panel.select('type', 'Return Gifts:', ['None', 'Random', 'Same as Received']);
	return panel.show;
}
Gift.work = function(state) {
	if (!length(Gift.data.gifts)) { // Need to parse it at least once
		if (!state) return true;
		if (!Page.to('army_gifts')) return true;
	}
	if (!state) {
		if (Gift.data.uid.length == 0) return false;
		return true;
	}
	if (Gift.data.uid.length) { // Receive before giving
		if (!Page.to('army_invite')) return true;
		var uid = Gift.data.uid.shift();
		if (!Gift.data.todo[uid]) Gift.data.todo[uid] = {};
		Gift.data.todo[uid].time = Date.now();
		Gift.data.lastgift = uid;
		GM_debug('Gift: Accepting gift from '+uid);
		if (!Page.to('army_invite', '?act=acpt&rqtp=gift&uid=' + uid)) return true;
		if (Gift.data.uid.length > 0) return true;
	}
	Page.to('keep_alchemy');
	return false;
}

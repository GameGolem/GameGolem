/********** Worker.Gift() **********
* Auto accept gifts and return if needed
* *** Needs to talk to Alchemy to work out what's being made
*/
var Gift = new Worker('Gift', 'index army_invite army_gifts');
Gift.data = {
	uid: [],
	todo: {},
	gifts: {}
};
Gift.display = [
	{
		label:'Work in progress...'
	},{
		id:'type',
		label:'Return Gifts',
		select:['None', 'Random', 'Same as Received']
	}
];
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
};
Gift.parse = function(change) {
	if (change) {
		return false;
	}
	var uid, gifts;
	if (Page.page === 'index') {
		// If we have a gift waiting it doesn't matter from whom as it gets parsed on the right page...
		if (!Gift.data.uid.length && $('span.result_body').text().indexOf('has sent you a gift') >= 0) {
			Gift.data.uid.push(1);
		}
	} else if (Page.page === 'army_invite') {
		// Accepted gift first
		debug('Gift: Checking for accepted');
		if (Gift.data.lastgift) {
			if ($('div.result').text().indexOf('accepted the gift') >= 0) {
				uid = Gift.data.lastgift;
				if (!Gift.data.todo[uid].gifts) {
					Gift.data.todo[uid].gifts = [];
				}
				Gift.data.todo[uid].gifts.push($('div.result img').attr('src').filepart());
				Gift.data.lastgift = null;
			}
		}
		// Check for gifts
		debug('Gift: Checking for new gift to accept');
		uid = Gift.data.uid = [];
		if ($('div.messages').text().indexOf('gift') >= 0) {
			debug('Gift: Found gift div');
			$('div.messages img').each(function(i,el) {
				uid.push($(el).attr('uid'));
				debug('Gift: Adding gift from '+$(el).attr('uid'));
			});
		}
	} else if (Page.page === 'army_gifts') {
		gifts = Gift.data.gifts = {};
//		debug('Gifts found: '+$('#app'+APPID+'_giftContainer div[id^="app'+APPID+'_gift"]').length);
		$('#app'+APPID+'_giftContainer div[id^="app'+APPID+'_gift"]').each(function(i,el){
//			debug('Gift adding: '+$(el).text()+' = '+$('img', el).attr('src'));
			var id = $('img', el).attr('src').filepart(), name = $(el).text().trim().replace('!','');
			if (!gifts[id]) {
				gifts[id] = {};
			}
			gifts[id].name = name;
			if (Gift.lookup[name]) {
				gifts[id].create = Gift.lookup[name];
			}
		});
	}
	return false;
};
Gift.work = function(state) {
	if (!state) {
		if (!Gift.data.uid.length) {
			return false;
		}
		return true;
	}
	if (Gift.data.uid.length) { // Receive before giving
		if (!Page.to('army_invite')) {
			return true;
		}
		var uid = Gift.data.uid.shift();
		if (!Gift.data.todo[uid]) {
			Gift.data.todo[uid] = {};
		}
		Gift.data.todo[uid].time = Date.now();
		Gift.data.lastgift = uid;
		debug('Gift: Accepting gift from '+uid);
		if (!Page.to('army_invite', '?act=acpt&rqtp=gift&uid=' + uid) || Gift.data.uid.length > 0) {
			return true;
		}
	}
	Page.to('keep_alchemy');
	return false;
};


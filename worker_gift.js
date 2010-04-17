/********** Worker.Gift() **********
* Auto accept gifts and return if needed
* *** Needs to talk to Alchemy to work out what's being made
*/
var Gift = new Worker('Gift');

Gift.settings = {
	keep:true
};

Gift.defaults = {
	castle_age:{
		pages:'index army_invite army_gifts'
	}
};

Gift.data = {
	received: [],
	todo: {},
	gifts: {}
};

Gift.option = {
	type:'None'
};

Gift.runtime = {
	work:false,
	gift_waiting:false,
	gift_sent:0,
	sent_id:null,
	gift:{
		sender_id:null,
		sender_ca_name:null,
		sender_fb_name:null,
		name:null,
		id:null
	}
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

Gift.init = function() {
	delete this.data.uid;
	delete this.data.lastgift;
	if (length(this.data.gifts)) {
		var gift_ids = [];
		for (var j in this.data.gifts) {
			gift_ids.push(j);
		}
		for (var i in this.data.todo) {
			if (!(/[^0-9]/g).test(i)) {	// If we have an old entry
				var random_gift_id = Math.floor(Math.random() * gift_ids.length);
				if (!this.data.todo[gift_ids[random_gift_id]]) {
					this.data.todo[gift_ids[random_gift_id]] = [];
				}
				this.data.todo[gift_ids[random_gift_id]].push(i);
				delete this.data.todo[i];
			}
		}
	}
};

Gift.parse = function(change) {
	if (change) {
		return false;
	}
	var gifts = this.data.gifts, todo = this.data.todo, received = this.data.received, sender_id;
	//alert('Gift.parse running');
	if (Page.page === 'index') {
		// We need to get the image of the gift from the index page.
//		debug('Gift: Checking for a waiting gift and getting the id of the gift.');
		if ($('span.result_body').text().indexOf('has sent you a gift') >= 0) {
			this.runtime.gift.sender_ca_name = $('span.result_body').text().regex(/[\t\n]*(.+) has sent you a gift/i);
			this.runtime.gift.name = $('span.result_body').text().regex(/has sent you a gift:\s+(.+)!/i);
			this.runtime.gift.id = $('span.result_body img').attr('src').filepart();
			debug('Gift: ' + this.runtime.gift.sender_ca_name + ' has a gift of ' + this.runtime.gift.name + ' waiting for you. (' + this.runtime.gift.id + ')');
			this.runtime.gift_waiting = true;
			return true
		}
	} else if (Page.page === 'army_invite') {
		// Check for sent
//		debug('Gift: Checking for sent gifts.');
		if (this.runtime.sent_id && $('div.result').text().indexOf('request sent') >= 0) {
			debug('Gift: ' + gifts[this.runtime.sent_id].name+' sent.');
			for (j=0; j < Math.min(todo[this.runtime.sent_id].length, 30); j++) {	// Remove the IDs from the list because we have sent them
				todo[this.runtime.sent_id].shift();
			}
			if (!todo[this.runtime.sent_id].length) {
				delete todo[this.runtime.sent_id];
			}
			this.runtime.sent_id = null;
			if (todo.length == 0) {
				this.runtime.work = false;
			}
		}
		
		// Accepted gift first
//		debug('Gift: Checking for accepted gift.');
		if (this.runtime.gift.sender_id) { // if we have already determined the ID of the sender
			if ($('div.result').text().indexOf('accepted the gift') >= 0) { // and we have just accepted a gift
				debug('Gift: Accepted ' + this.runtime.gift.name + ' from ' + this.runtime.gift.sender_ca_name + '(id:' + this.runtime.gift.sender_id + ')');
				received.push(this.runtime.gift); // add the gift to our list of received gifts.  We will use this to clear facebook notifications and possibly return gifts
				this.runtime.work = true;	// We need to clear our facebook notifications and/or return gifts
				this.runtime.gift = {}; // reset our runtime gift tracker
			}
		}
		// Check for gifts
//		debug('Gift: Checking for waiting gifts and getting the id of the sender if we already have the sender\'s name.');		
		if ($('div.messages').text().indexOf('gift') >= 0) { // This will trigger if there are gifts waiting
			this.runtime.gift_waiting = true;
			if (!this.runtime.gift.id) { // We haven't gotten the info from the index page yet.
				return false;	// let the work function send us to the index page to get the info.
			}
//			debug('Sender Name: ' + $('div.messages img[title*="' + this.runtime.gift.sender_ca_name + '"]').first().attr('title'));
			this.runtime.gift.sender_id = $('div.messages img[uid]').first().attr('uid'); // get the ID of the gift sender. (The sender listed on the index page should always be the first sender listed on the army page.)
			if (this.runtime.gift.sender_id) {
				this.runtime.gift.sender_fb_name = $('div.messages img[uid]').first().attr('title');
//				debug('Gift: Found ' + this.runtime.gift.sender_fb_name + "'s ID. (" + this.runtime.gift.sender_id + ')');
			} else {
				debug("Gift: Can't find the gift sender's ID.");
			}
		} else {
			this.runtime.gift_waiting = false;
		}
		
	} else if (Page.page === 'army_gifts') { // Parse for the current available gifts
//		debug('Gift: Parsing gifts.');
//		debug('Gifts found: '+$('#app'+APPID+'_giftContainer div[id^="app'+APPID+'_gift"]').length);
		$('div[id*="_giftContainer"] div[id*="_gift"]').each(function(i,el){
			var id = $('img', el).attr('src').filepart(), name = $(el).text().trim().replace('!',''), slot = $(el).attr('id').regex(/_gift([0-9]+)/);
//			debug('Gift adding: '+name+'('+id+') to slot '+slot);
			if (!gifts[id]) {
				gifts[id] = {};
			}
			gifts[id].name = name;
			gifts[id].slot = slot;
		});
	}
	return false;
};

Gift.work = function(state) {
	if (!state) {
		if (this.runtime.gift_waiting || this.runtime.work) {	// We need to get our waiting gift or return gifts.
			return true;
		}
		return false;
	}
	if (!this.runtime.gift_waiting && !this.runtime.work) {
		return false;
	}
	if(this.runtime.gift_waiting && !this.runtime.gift.id) {	// We have a gift waiting, but we don't know the id.
		if (!Page.to('index')) {	// Get the gift id from the index page.
			return true;
		}
	}
	if(this.runtime.gift.id && !this.runtime.gift.sender_id) {	// We have a gift id, but no sender id.
		if (!Page.to('army_invite')) {	// Get the sender id from the army_invite page.
			return true;
		}
	}
	if (this.runtime.gift.sender_id) { // We have the sender id so we can receive the gift.
		if (!Page.to('army_invite')) {
			return true;
		}
//		debug('Gift: Accepting ' + this.runtime.gift.name + ' from ' + this.runtime.gift.sender_ca_name + '(id:' + this.runtime.gift.sender_id + ')');
		if (!Page.to('army_invite', '?act=acpt&rqtp=gift&uid=' + this.runtime.gift.sender_id) || this.runtime.gift.sender_id.length > 0) {	// Shortcut to accept gifts without going through Facebook's confirmation page
			return true;
		}
	}
	
	var i, j, k, todo = this.data.todo, received = this.data.received, gift_ids = [], random_gift_id;

	if (!received.length && !length(todo)) {
		this.runtime.work = false;
		Page.to('keep_alchemy');
		return false;
	}
	
	// We have received gifts and need to clear out the facebook confirmation page
	if (received.length) {
		// Fill out our todo list with gifts to send, or not.
		switch(this.option.type) {
			case 'Random':
				for (i in received) {
					if (length(this.data.gifts)) {
						gift_ids = [];
						for (j in this.data.gifts) {
							gift_ids.push(j);
						}
						random_gift_id = Math.floor(Math.random() * gift_ids.length);
						debug('Gift: will randomly send a ' + this.data.gifts[random_gift_id].name + ' to ' + received[i].sender_ca_name);
						if (!todo[gift_ids[random_gift_id]]) {
							todo[gift_ids[random_gift_id]] = [];
						}
						todo[gift_ids[random_gift_id]].push(received[i].sender_id);
					}
				}
				this.runtime.work = true;
				break;
			case 'Same as Received':
				for (i in received) {
					if (!length(this.data.gifts[received[i].id])) {
						debug('Gift: ' + received[i].id+' was not found in our sendable gift list (ignoring).');
						continue;
					}
					debug('Gift: will return a ' + received[i].name + ' to ' + received[i].sender_ca_name);
					if (!todo[received[i].id]) {
						todo[received[i].id] = [];
					}
					todo[received[i].id].push(received[i].sender_id);
				}
				this.runtime.work = true;
				break;
			case 'None':
			default:
				this.runtime.work = false;	// Since we aren't returning gifts, we don't need to do any more work.
				break;
		}
		
		// Clear the facebook notifications and empty the received list.
		for (i in received) {
			// Go to the facebook page and click the "ignore" button for this entry
			
			// Then delete the entry from the received list.
			received.shift();
		}
		
	}
	
	if (this.runtime.gift_sent > Date.now()) {	// We have sent gift(s) and are waiting for the fb popup
//		debug('Gift: Waiting for FB popup.');
		if ($('div.dialog_buttons input[value="Send"]').length){
			this.runtime.gift_sent = null;
			Page.click('div.dialog_buttons input[value="Send"]');
		}
		return true;
	} else if (this.runtime.gift_sent) {
		this.runtime.gift_sent = null;
	}
	
	// Give some gifts back
	if (length(todo)) {
		for (i in todo) {
			if ($('div.unselected_list').children().length) {
				debug('Gift: Sending out ' + this.data.gifts[i].name);
				k = 0;
				for (j in todo[i]) {	// Need to limit to 30 at a time somehow
					if (k< 30) {
						if (!$('div.unselected_list input[value=\'' + todo[i][j] + '\']').length){
							debug('Gift: User '+todo[i][j]+' wasn\'t in the CA friend list.');
							continue;
						}
						Page.click('div.unselected_list input[value="' + todo[i][j] + '"]');
						k++;
					}
				}
				if (k == 0) {
					delete todo[i];
					return true;
				}
				this.runtime.sent_id = i;
				this.runtime.gift_sent = Date.now() + (30000);	// wait max 30 seconds for the popup.
				Page.click('input[value^="Send"]');
				$('input[value^="Send"]').click();
				return true;
			} else {
				Page.to('army_gifts', '?app_friends=true&giftSelection=' + this.data.gifts[i].slot, true)
				return true;
			}
		}
	}
	
	return false;
};


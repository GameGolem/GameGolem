/********** Worker.Arena() **********
* Build your arena army
* Auto-attack Arena targets
*/
var Arena = new Worker('Arena', 'army_viewarmy battle_arena');
Arena.data = {
	army:{}
};
Arena.option = {
	fill:true,
	every:24,
	checking:null
};
Arena.display = [
	{
		label:'NOTE: Make sure this is disabled if you are not fighting and make sure this is before Battle if you are!'
	},{
		id:'fill',
		label:'Fill Arena Guard',
		checkbox:true
	},{
		id:'every',
		label:'Every',
		select:[1, 2, 3, 6, 12, 24],
		after:'hours'
	},{
		label:'Add UserIDs to prefer them over random army members.'
	},{
		id:'prefer',
		multiple:'number'
	}
];
Arena.parse = function(change) {
	if (Arena.option.checking) {
		$('span.result_body').each(function(i,el){
			if ($(el).text().match(/has not joined in the Arena!/i)) {
				Arena.data.army[Arena.option.checking] = -1;
			} else if ($(el).text().match(/Arena Guard, and they have joined/i)) {
				Arena.data.army[Arena.option.checking] = Date.now() + 86400000; // 24 hours
			} else if ($(el).text().match(/'s Arena Guard is FULL/i)) {
				Arena.data.army[Arena.option.checking] = Date.now() + 3600000; // 1 hour
			} else if ($(el).text().match(/YOUR Arena Guard is FULL/i)) {
				Arena.option.wait = Date.now();
				debug('Arena guard full, wait 24 hours');
			}
		});
		Arena.option.checking = null;
	}
	if (Page.page === 'army_viewarmy') {
		$('img[linked="true"][size="square"]').each(function(i,el){
			Arena.data.army[$(el).attr('uid')] = Arena.data.army[$(el).attr('uid')] || 0;
		});
	}
	return false;
};
Arena.work = function(state) {
	var i, j, found = null;
	if (!Arena.option.fill || (Arena.option.wait && (Arena.option.wait + (Arena.option.every * 3600000)) > Date.now())) {
		return false;
	}
	for(j=0; j < Arena.option.prefer.length; j++) {
		i = Arena.option.prefer[j];
		if (!/[^0-9]/g.test(i)) {
			Arena.data.army[i] = Arena.data.army[i] || 0;
			if (typeof Arena.data.army[i] !== 'number' || (Arena.data.army[i] !== -1 && Arena.data.army[i] < Date.now())) {
				found = i;
				break;
			}
		}
	}
	if (!found) {
		for(i in Arena.data.army) {
			if (typeof Arena.data.army[i] !== 'number' || (Arena.data.army[i] !== -1 && Arena.data.army[i] < Date.now())) {
				found = i;
				break;
			}
		}
	}
	if (!found && length(Arena.data.army)) {
		return false;
	}
	if (!state) {
		return true;
	}
	if (!found && !length(Arena.data.army) && !Page.to('army_viewarmy')) {
		return true;
	}
	debug('Arena: Add member '+found);
	//http://apps.facebook.com/castle_age/arena.php?user=00000&lka=00000&agtw=1&ref=nf
	Arena.option.checking = found;
	if (!Page.to('battle_arena', '?user=' + found + '&lka=' + found + '&agtw=1&ref=nf')) {
		return true;
	}
	return false;
};


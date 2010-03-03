/********** Worker.Elite() **********
* Build your elite army
*/
var Elite = new Worker('Elite', 'keep_eliteguard army_viewarmy');
Elite.data = {};
Elite.option = {
	fill:true,
	every:24
};
Elite.display = [
	{
		id:'fill',
		label:'Fill Elite Guard',
		checkbox:true
	},{
		id:'every',
		label:'Every',
		select:[1, 2, 3, 6, 12, 24],
		after:'hours'
	}
];
Elite.parse = function(change) {
	var i;
	$('span.result_body').each(function(i,el){
		if ($(el).text().match(/Elite Guard, and they have joined/i)) {
			Elite.data[$('img', el).attr('uid')] = Date.now() + 86400000; // 24 hours
		} else if ($(el).text().match(/'s Elite Guard is FULL!/i)) {
			Elite.data[$('img', el).attr('uid')] = Date.now() + 3600000; // 1 hour
		} else if ($(el).text().match(/YOUR Elite Guard is FULL!/i)) {
			Elite.option.wait = Date.now();
			GM_debug('Elite guard full, wait 24 hours');
		}
	});
	if (Page.page === 'army_viewarmy') {
		$('img[linked="true"][size="square"]').each(function(i,el){
			Elite.data[$(el).attr('uid')] = Elite.data[$(el).attr('uid')] || 0;
		});
	}
	return false;
};
Elite.work = function(state) {
	var i, found = null;
	if (!Elite.option.fill || (Elite.option.wait && (Elite.option.wait + (Elite.option.every * 3600000)) > Date.now())) {
		return false;
	}
	for(i in Elite.data) {
		if (typeof Elite.data[i] !== 'number' || Elite.data[i] < Date.now()) {
			if (!found) {
				found = i;
			}
		}
	}
	if ((!found && length(Elite.data))) {
		return false;
	}
	if (!state) {
		return true;
	}
	if (!found && !length(Elite.data) && !Page.to('army_viewarmy')) {
		return true;
	}
	GM_debug('Elite: Add member '+found);
	if (!Page.to('keep_eliteguard', '?twt=jneg&jneg=true&user=' + found)) {
		return true;
	}
	return false;
};


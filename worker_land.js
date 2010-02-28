/********** Worker.Land **********
* Auto-buys property
*/
var Land = new Worker('Land', 'town_land');
Land.option = {
	buy:true
};
Land.display = [
	{
		id:'buy',
		label:'Auto-Buy Land',
		checkbox:true
	}
];
Land.parse = function(change) {
	if (!change) {
		$('tr.land_buy_row,tr.land_buy_row_unique').each(function(i,el){
			var name = $('img', el).attr('alt'), tmp;
			Land.data[name] = {};
			Land.data[name].income = $('.land_buy_info .gold', el).text().replace(/[^0-9]/g,'').regex(/([0-9]+)/);
			Land.data[name].max = $('.land_buy_info', el).text().regex(/Max Allowed For your level: ([0-9]+)/i);
			Land.data[name].cost = $('.land_buy_costs .gold', el).text().replace(/[^0-9]/g,'').regex(/([0-9]+)/);
			tmp = $('option', $('.land_buy_costs .gold', el).parent().next()).last().attr('value');
			if (tmp) {
				Land.data[name].buy = tmp;
			}
			Land.data[name].own = $('.land_buy_costs span', el).text().replace(/[^0-9]/g,'').regex(/([0-9]+)/);
		});
	}
};
Land.work = function(state) {
	if (!Land.option.buy) {
		return false;
	}
	var i, max = 0, best = null, value, bestvalue;
	for (i in Land.data) {
		if (Land.data[i].buy) {
			max = Math.max(max, Land.data[i].cost * Land.data[i].buy / Player.data.income); // Maximum buy time in income hours
		}
	}
	if (!max) {
		return false;
	}
	for (i in Land.data) {
		if (Land.data[i].buy) {
			value = (max - (Land.data[i].cost * Land.data[i].buy / Player.data.income) + 1) * ((Land.data[i].income * Land.data[i].buy) + Player.data.income);
			if (!best || value > bestvalue) {
				bestvalue = value;
				best = i;
			}
		}
	}
	if (!best || !Bank.worth(Land.data[best].buy * Land.data[best].cost)) {
		return false;
	}
	if (!state) {
		return true;
	}
	if (!Bank.retrieve(Land.data[best].buy * Land.data[best].cost)) {
		return true;
	}
	if (!Page.to('town_land')) return true;
	$('tr.land_buy_row,tr.land_buy_row_unique').each(function(i,el){
		var name = $('img', el).attr('alt'), tmp;
		if (name === best) {
			GM_debug('Land: Buying '+Land.data[best].buy+' x '+best+' for $'+(Land.data[best].buy * Land.data[best].cost));
			$('select', $('.land_buy_costs .gold', el).parent().next()).val(Land.data[best].buy);
			Page.click($('.land_buy_costs input[name="Buy"]', el));
		}
	});
	return true;
};


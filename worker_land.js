/********** Worker.Land **********
* Auto-buys property
*/
var Land = new Worker('Land', 'town_land');
Land.option = {
	buy:true,
	wait:48
};
Land.display = [
	{
		id:'buy',
		label:'Auto-Buy Land',
		checkbox:true
	},{
		id:'wait',
		label:'Maximum Wait Time',
		select:[0, 24, 36, 48],
		suffix:'hours'
	},{
		id:'current',
		label:'Want to buy',
		info:'None'
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
	var i, best = null, worth = Bank.worth(), buy = 0;
	for (var i in Land.data) {
		if (Land.data[i].buy) {
			if (!best || ((Land.data[best].cost / Player.data.income) + (Land.data[i].cost / Player.data.income + Land.data[best].income)) > ((Land.data[i].cost / Player.data.income) + (Land.data[best].cost / (Player.data.income + land[i].income)))) {
				best = i;
			}
		}
	}
	if (!best) {
		return false;
	}
	if ((Land.data[best].cost * 10) >= worth || (Land.data[best].cost * 10 / Player.data.income < Land.option.wait && Land.data[best].max - Land.data[best].own >= 10)) {
		buy = 10;
	} else if ((Land.data[best].cost * 5) >= worth || (Land.data[best].cost * 5 / Player.data.income < Land.option.wait && Land.data[best].max - Land.data[best].own >= 5)) {
		buy = 5;
	} else if (Land.data[best].cost >= worth){
		buy = 1;
	}
	$('#'+PREFIX+'Land_current').text(buy + 'x ' + best + ' for $' + addCommas(buy * Land.data[best].cost));
	if (!buy || (buy * Land.data[best].cost) > worth) {
		return false;
	}
	if (!state) {
		return true;
	}
	if (!Bank.retrieve(buy * Land.data[best].cost)) {
		return true;
	}
	if (!Page.to('town_land')) return true;
	$('tr.land_buy_row,tr.land_buy_row_unique').each(function(i,el){
		var name = $('img', el).attr('alt'), tmp;
		if (name === best) {
			GM_debug('Land: Buying '+Land.data[best].buy+' x '+best+' for $'+(Land.data[best].buy * Land.data[best].cost));
			$('select', $('.land_buy_costs .gold', el).parent().next()).val(buy);
			Page.click($('.land_buy_costs input[name="Buy"]', el));
		}
	});
	return true;
};


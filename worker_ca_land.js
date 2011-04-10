/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page, Queue, Resources,
	Bank, Battle, Generals, LevelUp, Player,
	APP, APPID, warn, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser, console,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, Divisor, length, sum, findInObject, objectIndex, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
	makeImage
*/
/********** Worker.Land **********
* Auto-buys property
*/
var Land = new Worker('Land');
Land.temp = null;

Land.settings = {
	taint: true
};

Land.defaults['castle_age'] = {
	pages:'town_land keep_stats'
};

Land.option = {
	enabled:true,
//	wait:48,
	onlyten:false,
	sell:false,
	land_exp:false,
	style:0
};

Land.runtime = {
	lastlevel:0,
	best:null,
	buy:0,
	cost:0,
	snooze:0
};

Land.display = [
	{
		id:'enabled',
		label:'Auto-Buy Land',
		checkbox:true
	},{
		id:'save_ahead',
		label:'Save for future Land',
		checkbox:true
	},{
		advanced:true,
		id:'sell',
		label:'Sell Extra Land',
		checkbox:true,
		help:'You can sell land above your Max at full price.'
	},{
		exploit:true,
		id:'land_exp',
		label:'Sell Extra Land 10 at a time',
		checkbox:true,
		help:'If you have extra lands, this will sell 10x.  The extra sold lands will be repurchased at a lower cost.'
	},{
		id:'style',
		label:'ROI Style',
		select:{0:'Percent', 1:'Daily'},
		help:'This changes the display when visiting the LanD page.'
	}
/*
	},{
		id:'wait',
		label:'Maximum Wait Time',
		select:[0, 24, 36, 48],
		suffix:'hours',
		help:'There has been a lot of testing in this code, it is the fastest way to increase your income despite appearances!'
	},{
		advanced:true,
		id:'onlyten',
		label:'Only buy 10x<br>NOTE: This is slower!!!',
		checkbox:true,
		help:'The standard method is guaranteed to be the most efficient.  Choosing this option will slow down your income.'
	}
*/
];

Land.setup = function() {
	Resources.use('Gold');

	// one time pre-r959 fix for bad land name "name"
	if ((this.runtime.revision || 0) < 959) {
		if (this.data && this.data.name) {
			delete this.data.name;
		}
	}

	this.runtime.revision = revision; // started r959 for historic reference
};

Land.init = function() {
	for (var i in this.data) {
		if (!this.data[i].id || !this.data[i].cost || isNumber(this.data[i].buy) || isNumber(this.data[i].sell)) {
			// force an initial visit if anything important is missing
			Page.set('town_land', 0);
			break;
		}
	}

	this._watch(Player, 'data.level');		// watch for level ups
	this._watch(Player, 'data.worth');		// watch for bank increases
	this._watch(Bank, 'option.keep');		// Watch for changing available amount
	this._watch(Page, 'data.town_land');	// watch for land triggers
};

Land.parse = function(change) {
	var i, tmp, name, txt, modify = false;

	if (Page.page === 'town_land') {
		$('div[style*="town_land_bar."],div[style*="town_land_bar_special."]').each(function(a, el) {
			if ((name = $('div img[alt]', el).attr('alt').trim())) {
				if (!change) {
					try {
						var txt = $(el).text().replace(/[,\s]+/g, '');
						Land._transaction(); // BEGIN TRANSACTION
						assert(Land.set(['data',name,'max'], txt.regex(/yourlevel:(\d+)/i), 'number'), 'Bad maximum: '+name);
						assert(Land.set(['data',name,'income'], txt.regex(/Income:\$(\d+)/), 'number'), 'Bad income: '+name);
						assert(Land.set(['data',name,'cost'], txt.regex(/Income:\$\d+\$(\d+)/), 'number'), 'Bad cost: '+name);
						assert(Land.set(['data',name,'own'], $('span:contains("Owned:")', el).text().replace(/[,\s]+/g, '').regex(/Owned:(\d+)/i), 'number'), 'Bad own count: '+name);
						Land.set(['data',name,'buy']);
						if ((tmp = $('form[id*="_prop_"]', el)).length) {
							Land.set(['data',name,'id'], tmp.attr('id').regex(/_prop_(\d+)/i), 'number');
							$('select[name="amount"] option', tmp).each(function(b, el) {
								Land.push(['data',name,'buy'], parseFloat($(el).val()), 'number')
							});
						}
						Land.set(['data',name,'sell']);
						if ((tmp = $('form[id*="_propsell_"]', el)).length) {
							Land.set(['data',name,'id'], tmp.attr('id').regex(/_propsell_(\d+)/i), 'number');
							$('select[name="amount"] option', tmp).each(function(b, el) {
								Land.push(['data',name,'sell'], parseFloat($(el).val()), 'number')
							})
						}
						Land._transaction(true); // COMMIT TRANSACTION
					} catch(e) {
						Land._transaction(false); // ROLLBACK TRANSACTION on any error
						console.log(error(e.name + ' in ' + this.name + '.parse(' + change + '): ' + e.message));
					}
				} else if (Land.data[name]) {
					$('strong:first', el).after(' (<span title="Return On Investment - higher is better"><strong>ROI</strong>: ' + ((Land.data[name].income * 100 * (Land.option.style ? 24 : 1)) / Land.data[name].cost).round(3) + '%' + (Land.option.style ? ' / Day' : '') + '</span>)');
				}
			}
			modify = true;
		});
	} else if (Page.page === 'keep_stats') {
		// Only when it's our own keep and not someone elses
		if ($('.keep_attribute_section').length) {
			$('.statsTTitle:contains("LAND") + .statsTMain .statUnit').each(function(a, el) {
				var tmp = $('a img[src]', el), name = ($(tmp).attr('alt') || '').trim(), i = $(el).text().regex(/\bX\s*(\d+)\b/i);
				if (!Land.data[name]) {
					Page.set(['data','town_land'], 0);
				} else if (Land.data[name].own !== i) {
					Land.set(['data', name, 'own'], i);
				}
			});
		}
	}

	return modify;
};

Land.update = function(event) {
	var i, j, k, worth = Bank.worth(), income = Player.get('income', 0) + History.get('income.mean'), level = Player.get('level', 0), best, i_cost, b_cost, buy = 0, cost_increase, time_limit;
	
	if (event.type === 'option' && this.option.land_exp) {
		this.set(['option','sell'], true);
	}
	
	k = 0;
	if (this.option.save_ahead && this.option.enabled) {
		for (i in this.data) {
			if ((this.data[i].max || 0) > 0 && (this.data[i].own || 0) >= this.data[i].max) {
				j = Math.min(10, Math.max(0, this.data[i].max + 10 - this.data[i].own));
				k += j * (this.data[i].cost || 0);
			}
		}
	}
	this.set(['runtime', 'save_amount'], k);

	// don't sell into future buffer if save ahead is enabled
	k = this.option.save_ahead && !this.option.land_exp ? 10 : 0;
	for (i in this.data) {
		if (this.option.sell && this.data[i].sell.length && (this.data[i].max || 0) > 0 && (this.data[i].own || 0) > this.data[i].max + k) {
			best = i;
			buy = this.data[i].max + k - this.data[i].own;// Negative number means sell
			if (this.option.land_exp) {
				buy = -this.data[i].sell[this.data[i].sell.length - 1];
			}
			break;
		}

		if ((income || 0) > 0 && this.data[i].buy && this.data[i].buy.length) {
			b_cost = best ? (this.data[best].cost || 0) : 1e50;
			i_cost = (this.data[i].cost || 0);
			if (!best || ((b_cost / income) + (i_cost / (income + this.data[best].income))) > ((i_cost / income) + (b_cost / (income + this.data[i].income)))) {
				best = i;
			}
		}
	}

	this.set(['runtime','best'], null);
	this.set(['runtime','buy'], 0);
	this.set(['runtime','cost'], 0);

	if (best) {
		if (!buy) {
			//	This calculates the perfect time to switch the amounts to buy.
			//	If the added income from a smaller purchase will pay for the increase in price before you can afford to buy again, buy small.
			//	In other words, make the smallest purchase where the time to make the purchase is larger than the time to payoff the increased cost with the extra income.
			//	It's different for each land because each land has a different "time to payoff the increased cost".
			
			cost_increase = this.data[best].cost / (10 + this.data[best].own);		// Increased cost per purchased land.  (Calculated from the current price and the quantity owned, knowing that the price increases by 10% of the original price per purchase.)
			time_limit = cost_increase / this.data[best].income;		// How long it will take to payoff the increased cost with only the extra income from the purchase.  (This is constant per property no matter how many are owned.)
			time_limit = time_limit * 1.5;		// fudge factor to take into account that most of the time we won't be buying the same property twice in a row, so we will have a bit more time to recoup the extra costs.
//			if (this.option.onlyten || (this.data[best].cost * 10) <= worth) {}			// If we can afford 10, buy 10.  (Or if people want to only buy 10.)
			if ((this.data[best].cost * 10) <= worth) {			// If we can afford 10, buy 10.
				buy = Math.min(this.data[best].max - this.data[best].own, 10);
			} else if (this.data[best].cost / income > time_limit){		// If it will take longer to save for 1 land than it will take to payoff the increased cost, buy 1.
				buy = 1;
			} else if (this.data[best].cost * 5 / income > time_limit){	// If it will take longer to save for 5 lands than it will take to payoff the increased cost, buy 5.
				buy = Math.min(this.data[best].max - this.data[best].own, 5);
			} else {																	// Otherwise buy 10 because that's the max.
				buy = Math.min(this.data[best].max - this.data[best].own, 10);
			}
		}

		k = buy * this.data[best].cost; // May be negative if we're making money by selling
		if ((buy > 0 && this.option.enabled) || (buy < 0 && this.option.sell)) {
			this.set(['runtime','best'], best);
			this.set(['runtime','buy'], buy);
			this.set(['runtime','cost'], k);
		}
	}

	if (best && buy) {
		Dashboard.status(this, (buy > 0 ? (this.runtime.buy ? 'Buying ' : 'Want to buy ') : (this.runtime.buy ? 'Selling ' : 'Want to sell ')) + Math.abs(buy) + 'x ' + best + ' for $' + Math.abs(k).SI() + ' (Available Cash: $' + worth.SI() + ')');
	} else if (this.option.save_ahead && this.runtime.save_amount) {
		if (worth >= this.runtime.save_amount) {
			Dashboard.status(this, 'Saved $' + this.runtime.save_amount.SI() + ' for future land.');
		} else {
			Dashboard.status(this, 'Saved $' + worth.SI() + ' of $' + this.runtime.save_amount.SI() + ' for future land.');
		}
	} else {
		Dashboard.status(this, 'Nothing to do.');
	}

	this.set(['option','_sleep'],
	  level === this.runtime.lastlevel &&
	  (Page.get('town_land') || 0) > 0 &&
	  (!this.runtime.best ||
	  !this.runtime.buy ||
	  worth < this.runtime.cost ||
	  this.runtime.snooze > Date.now()));
};

Land.work = function(state) {
	var o, q;
	if (!state) {
		return QUEUE_CONTINUE;
	} else if (this.runtime.cost > 0 && !Bank.retrieve(this.runtime.cost)) {
		return QUEUE_CONTINUE;
	} else if (!Page.to('town_land')) {
		return QUEUE_CONTINUE;
	} else {
		this.set('runtime.lastlevel', Player.get('level'));
		if (this.runtime.buy < 0) {
			if (!(o = $('form#app'+APPID+'_propsell_'+this.data[this.runtime.best].id)).length) {
				console.log(warn(), 'Can\'t find Land sell form for',
				  this.runtime.best,
				  'id[' + this.data[this.runtime.best].id + ']');
				this.set('runtime.snooze', Date.now() + 60000);
				this._remind(60.1, 'sell_land');
				return QUEUE_RELEASE;
			} else {
				q = this.data[this.runtime.best].sell.lower(Math.abs(this.runtime.buy));
				console.log(warn(), 'Selling ' + q + '/' + Math.abs(this.runtime.buy) + ' x ' + this.runtime.best + ' for $' + Math.abs(this.runtime.cost).SI());

				$('select[name="amount"]', o).val(q);
				console.log(warn(), 'Land.sell:', q, 'x', this.runtime.best);
				Page.click($('input[name="Sell"]', o));
				return QUEUE_CONTINUE;
			}
		} else if (this.runtime.buy > 0) {
			if (!(o = $('form#app'+APPID+'_prop_'+this.data[this.runtime.best].id)).length) {
				console.log(warn(), 'Can\'t find Land buy form for',
				  this.runtime.best,
				  'id[' + this.data[this.runtime.best].id + ']');
				this.set('runtime.snooze', Date.now() + 60000);
				this._remind(60.1, 'buy_land');
				return QUEUE_RELEASE;
			} else {
				q = this.data[this.runtime.best].buy.higher(this.runtime.buy);
				console.log(warn(), 'Buying ' + q + '/' + this.runtime.buy + ' x ' + this.runtime.best + ' for $' + Math.abs(this.runtime.cost).SI());

				$('select[name="amount"]', o).val(q);
				console.log(warn(), 'Land.buy:', q, 'x', this.runtime.best);
				Page.click($('input[name="Buy"]', o));
				return QUEUE_CONTINUE;
			}
		}
	}

	return QUEUE_RELEASE;
};


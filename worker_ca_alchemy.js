/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page, Queue, Resources,
	Battle, Generals, LevelUp, Player,
	APP, APPID, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, Divisor, length, sum, findInObject, objectIndex, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
	makeImage
*/
/********** Worker.Alchemy **********
* Get all ingredients and recipes
*/
var Alchemy = new Worker('Alchemy');
Alchemy.temp = null;

Alchemy.settings = {
	taint:true
};

Alchemy.defaults['castle_age'] = {
	pages:'keep_alchemy keep_stats'
};

Alchemy.data = {
	ingredients:{},
	summons:{},
	recipe:{}
};

Alchemy.option = {
	perform:false,
	hearts:false,
	summon:false
};

Alchemy.runtime = {
	best:null,
	wait:0
};

Alchemy.display = [
	{
		id:'hearts',
		label:'Use Battle Hearts',
		checkbox:true
	},{
		id:'summon',
		label:'Use Summon Ingredients',
		checkbox:true
	}
];

Alchemy.parse = function(change) {
	var now = Date.now(), self = this, i, tmp,
		ipurge = {}, rpurge = {}, spurge = {};

	if (Page.page === 'keep_alchemy') {
		tmp = $('div.ingredientUnit');

		if (!tmp.length) {
			console.log(warn("Can't find any alchemy ingredients..."));
			//Page.to('keep_alchemy', false); // Force reload
			//return false;
		} else {
			for (i in this.data.ingredients) {
				if (this.data.ingredients[i] !== 0) {
					ipurge[i] = true;
				}
			}
		}

		// ingredients list
		tmp.each(function(a, el) {
			var icon = ($('img', el).attr('src') || '').filepart();
			var c = ($(el).text() || '').regex(/\bx\s*(\d+)\b/im);
			ipurge[icon] = false;
			if (isNumber(c)) {
				self.set(['ingredients', icon], c);
			} else {
				console.log(warn(), 'bad count ' + c + ' on ' + icon);
			}
		});

		tmp = $('div.alchemyQuestBack,div.alchemyRecipeBack,div.alchemyRecipeBackMonster');

		if (!tmp.length) {
			console.log(warn("Can't find any alchemy recipes..."));
			//Page.to('keep_alchemy', false); // Force reload
			//return false;
		} else {
			for (i in this.data.recipe) {
				rpurge[i] = true;
			}
			for (i in this.data.summons) {
				spurge[i] = true;
			}
		}

		// recipe list
		tmp.each(function(a, el) {
			var name = ($('div.recipeTitle', el).text() || '').replace('RECIPES:','').replace(/\s+/gm, ' ').trim(),
				recipe = {}, i;
			if ((i = name.search(/\s*\(/m)) >= 0) {
				name = name.substr(0, i);
			}
			if ($(el).hasClass('alchemyQuestBack')) {
				recipe.type = 'Quest';
			} else if ($(el).hasClass('alchemyRecipeBack')) {
				recipe.type = 'Recipe';
			} else if ($(el).hasClass('alchemyRecipeBackMonster')) {
				recipe.type = 'Summons';
			}
			recipe.ingredients = {};
			$('div.recipeImgContainer', el).parent().each(function(b, el2) {
				var icon = ($('img', el2).attr('src') || '').filepart();
				var c = ($(el2).text() || '').regex(/\bx\s*(\d+)\b/im) || 1;
				recipe.ingredients[icon] = c;
				// Make sure we know an ingredient exists
				if (!(icon in self.data.ingredients)) {
					self.set(['ingredients', icon], 0);
					ipurge[icon] = false;
				}
				if (recipe.type === 'Summons') {
					spurge[icon] = false;
					self.set(['summons', icon], true);
				}
			});
			rpurge[name] = false;
			self.set(['recipe', name], recipe);
		});
	} else if (Page.page === 'keep_stats') {
		// Only when it's our own keep and not someone elses
		if ($('.keep_attribute_section').length) {
			// some ingredients are units
			tmp = $('.statsT2 .statsTTitle:contains("UNITS")').not(function(a) {
				return !$(this).text().regex(/^\s*UNITS\s*$/im);
			});
			$('.statUnit', $(tmp).parent()).each(function(a, el) {
				var b = $('a img[src]', el);
				var i = ($(b).attr('src') || '').filepart();
				var n = ($(b).attr('title') || $(b).attr('alt') || '').trim();
				var c = ($(el).text() || '').regex(/\bX\s*(\d+)\b/im);
				n = Town.qualify(n, i);
				if (i in self.data.ingredients) {
					if (isNumber(c)) {
						self.set(['ingredients', i], c);
					}
				}
			});

			// some ingredients are items
			tmp = $('.statsT2 .statsTTitle:contains("ITEMS")').not(function(a) {
				return !$(this).text().regex(/^\s*ITEMS\s*$/im);
			});
			$('.statUnit', $(tmp).parent()).each(function(a, el) {
				var b = $('a img[src]', el);
				var i = ($(b).attr('src') || '').filepart();
				var n = ($(b).attr('title') || $(b).attr('alt') || '').trim();
				var c = ($(el).text() || '').regex(/\bX\s*(\d+)\b/im);
				n = Town.qualify(n, i);
				if (i in self.data.ingredients) {
					if (isNumber(c)) {
						self.set(['ingredients', i], c);
					}
				}
			});

			tmp = $('.statsT2 .statsTTitle:contains("ALCHEMY INGREDIENTS")').not(function(a) {
				return !$(this).text().regex(/^\s*ALCHEMY INGREDIENTS\s*$/im);
			});
			$('.statUnit', $(tmp).parent()).each(function(a, el) {
				var b = $('a img[src]', el);
				var i = ($(b).attr('src') || '').filepart();
				var c = $(el).text().regex(/\bX\s*(\d+)\b/i);
				if (i) {
					self.set(['ingredients', i], c || 1);
				} else {
					Page.setStale('keep_alchemy', now);
				}
			});
		}
	}

	// purge (zero) any ingredients we didn't encounter.
	// Note: we need to leave placeholders for all known ingredients so keep
	// parsing knows which unit/item overlaps to watch.
	for (i in ipurge) {
		if (ipurge[i] && this.data.ingredients[i] !== 0) {
			console.log(warn(), 'zero ingredient ' + i + ' [' + (this.data.ingredients[i] || 0) + ']');
			this.set(['data', 'ingredients', i], 0);
		}
	}

	// purge any recipes we didn't encounter.
	for (i in rpurge) {
		if (rpurge[i]) {
			console.log(warn(), 'delete recipe ' + i);
			this.set(['recipe', i]);
		}
	}

	// purge any summons we didn't encounter.
	for (i in spurge) {
		if (spurge[i]) {
			console.log(warn(), 'delete summon ' + i);
			this.set(['summons', i]);
		}
	}

	return false;
};

Alchemy.update = function(event) {
	var now = Date.now(), best = null, recipe = this.data.recipe, r, i, s;

	if (recipe) {
		for (r in recipe) {
			if (recipe[r].type === 'Recipe') {
				best = r;
				for (i in recipe[r].ingredients) {
					if ((!this.option.hearts && i === 'raid_hearts.gif') || (!this.option.summon && this.data.summons[i]) || recipe[r].ingredients[i] > this.data.ingredients[i]) {
						best = null;
						break;
					}
				}
				if (best) {break;}
			}
		}
	}

	s = undefined;
	if (!best) {
		s = 'Nothing to do.';
	} else {
		s = (this.option._disabled ? 'Would perform ' : 'Perform ') + best;
	}
	Dashboard.status(this, s);

	this.set('runtime.best', best);

	this.set('option._sleep', (this.runtime.wait || 0) > now || !best || Page.isStale('keep_alchemy'));
};

Alchemy.work = function(state) {
	var now = Date.now();

	if (!state && !best && !Page.isStale('keep_alchemy')) {
		return QUEUE_FINISH;
	} else if (!Page.to('keep_alchemy')) {
		return QUEUE_CONTINUE;
	} else if (this.runtime.best) {
		console.log(warn('Perform - ' + this.runtime.best));
		if (!Page.click($('input[type="image"]', $('div.recipeTitle:contains("' + this.runtime.best + '")').next()))) {
			console.log(warn("Can't find the recipe - waiting a minute"));
			this.set('runtime.wait', now + 60000);
			this._remind(60, 'wait');
		}
	}

	return QUEUE_RELEASE;
};

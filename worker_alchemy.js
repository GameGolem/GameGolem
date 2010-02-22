/********** Worker.Alchemy **********
* Get all ingredients and recipes
*/
var Alchemy = new Worker('Alchemy', 'keep_alchemy');
Alchemy.data = {
	ingredients:{},
	recipe:{}
};
Alchemy.parse = function(change) {
	var ingredients = Alchemy.data.ingredients = {}, recipe = Alchemy.data.recipe = {};
	$('div.ingredientUnit').each(function(i,el){
		var name = $('img', el).attr('src').filepart();
		ingredients[name] = $(el).text().regex(/x([0-9]+)/);
	});
	$('div.alchemyQuestBack,div.alchemyRecipeBack,div.alchemyRecipeBackMonster').each(function(i,el){
		var me = {}, title = $('div.recipeTitle', el).text().trim().replace('RECIPES: ','');
		if (title.indexOf(' (')>0) {title = title.substr(0, title.indexOf(' ('));}
		if ($(el).hasClass('alchemyQuestBack')) {me.type = 'Quest';}
		else if ($(el).hasClass('alchemyRecipeBack')) {me.type = 'Recipe';}
		else if ($(el).hasClass('alchemyRecipeBackMonster')) {me.type = 'Summons';}
		else {me.type = 'wtf';}
		me.ingredients = {};
		$('div.recipeImgContainer', el).parent().each(function(i,el){
			var name = $('img', el).attr('src').filepart();
			me.ingredients[name] = ($(el).text().regex(/x([0-9]+)/) || 1);
		});
		recipe[title] = me;
	});
};
Alchemy.display = function() {
	var panel = new Panel(this.name);
	panel.checkbox('perform', 'Automatically Perform');
	panel.checkbox('hearts', 'Use Battle Hearts');
	return panel.show;
};
Alchemy.work = function(state) {
	if (!Alchemy.option.perform) {
		return false;
	}
	var found = null, recipe = Alchemy.data.recipe, r, i;
	for (r in recipe) {
		if (recipe[r].type === 'Recipe') {
			found = r;
			for (i in recipe[r].ingredients) {
				if ((!Alchemy.option.hearts && i === 'raid_hearts.gif') || recipe[r].ingredients[i] > (Alchemy.data.ingredients[i] || 0)) {
					found = null;
					break;
				}
			}
			if (found) {break;}
		}
	}
	if (!found) {return false;}
	if (!state) {return true;}
	if (!Page.to('keep_alchemy')) {return true;}
	GM_debug('Alchemy: Perform - '+found);
	$('div.alchemyRecipeBack').each(function(i,el){
		if($('div.recipeTitle', el).text().indexOf(found) >=0) {
			Page.click($('input[type="image"]', el));
			return true;
		}
	});
	return true;
};

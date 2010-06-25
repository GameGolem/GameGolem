/********** Worker.Town **********
* Sorts and auto-buys all town units (not property)
*/
var Town = new Worker('Town');
Town.data = {};

Town.defaults['castle_age'] = {
    pages:'town_soldiers town_blacksmith town_magic'
};

Town.option = {
    general:true,
    quest_buy:true,
    number:'None',
    maxcost:'$10k',
    units:'Best for Both',
    sell:'None',
    upkeep:20
};

Town.runtime = {
    best_buy:null,
    best_sell:null,
    buy:0,
    sell:0,
    cost:0
};

Town.display = [
{
    id:'general',
    label:'Use Best General',
    checkbox:true
},{
    id:'quest_buy',
    label:'Buy Quest Items',
    checkbox:true
},{
    id:'number',
    label:'Buy Number',
    select:['None', 'Minimum', 'Army', 'Max Army'],
    help:'Minimum will only buy items need for quests if enabled. Army will buy equal to army size or 501 (modified by some generals), Max Army will buy up to 501 (modified by some generals) regardless of army size.'
},{
    advanced:true,
    id:'units',
    require:{'number':[['None']]},
    label:'Set Type',
    select:['Best Offense', 'Best Defense', 'Best for Both'],
    help:'Select type of sets to keep. Best for Both will keep a Best Offense and a Best Defense set.'
},{
    advanced:true,
    id:'maxcost',
    require:{'number':[['None']]},
    label:'Maximum Item Cost',
    select:['$10k','$100k','$1m','$10m','$100m','$1b','$10b','$100b'],
    help:'Will buy best item based on Set Type with single item cost below selected value.'
},{
    advanced:true,
    require:{'number':[['None']]},
    id:'upkeep',
    label:'Max Upkeep',
    text:true,
    after:'%',
    help:'Enter maximum Total Upkeep in % of Total Income'
},{
    advanced:true,
    id:'sell',
    label:'Auto-Sell',
    select:['None', 'Above Army', 'Above Max Army'],
    help:'Only keep the best items for selected sets. Sell off all items not required for quests if total used amount is greater than Auto-Sell option and Buy Number.'
}
];

Town.blacksmith = {
    Weapon:	/avenger|axe|blade|bow|cleaver|cudgel|dagger|halberd|lance|mace|morningstar|rod|saber|spear|staff|stave|sword|talon|trident|wand|Crystal Rod|Daedalus|Dragonbane|Dreadnought Greatsword|Excalibur|Incarnation|Ironhart's Might|Lionheart Blade|Judgement|Justice|Lightbringer|Oathkeeper|Onslaught/i,
    Shield:	/buckler|shield|tome|Defender|Dragon Scale|Frost Dagger|Frost Tear Dagger|Harmony|Sword of Redemption|Terra's Guard|The Dreadnought/i,
    Helmet:	/cowl|crown|helm|horns|mask|veil|Lionheart Helm/i,
    Gloves:	/gauntlet|glove|hand|bracer|Slayer's Embrace/i,
    Armor:	/armor|chainmail|cloak|pauldrons|plate|raiments|robe|Blood Vestment|Garlans Battlegear|Faerie Wings/i,
    Amulet:	/amulet|bauble|charm|crystal|eye|heart|insignia|jewel|lantern|memento|orb|shard|soul|talisman|trinket|Paladin's Oath|Poseidons Horn| Ring|Ring of|Ruby Ore|Thawing Star/i
};

Town.init = function(){
    this._watch(Bank);
    Resources.useType('Gold');
};

Town.parse = function(change) {
    if (!change) {
        var unit = Town.data, page = Page.page.substr(5);
        $('.eq_buy_row,.eq_buy_row2').each(function(a,el){
            // Fix for broken magic page!!
            !$('div.eq_buy_costs_int', el).length && $('div.eq_buy_costs', el).prepend('<div class="eq_buy_costs_int"></div>').children('div.eq_buy_costs_int').append($('div.eq_buy_costs >[class!="eq_buy_costs_int"]', el));
            !$('div.eq_buy_stats_int', el).length && $('div.eq_buy_stats', el).prepend('<div class="eq_buy_stats_int"></div>').children('div.eq_buy_stats_int').append($('div.eq_buy_stats >[class!="eq_buy_stats_int"]', el));
            !$('div.eq_buy_txt_int', el).length && $('div.eq_buy_txt', el).prepend('<div class="eq_buy_txt_int"></div>').children('div.eq_buy_txt_int').append($('div.eq_buy_txt >[class!="eq_buy_txt_int"]', el));
            var i, j, stats = $('div.eq_buy_stats', el), name = $('div.eq_buy_txt strong:first', el).text().trim(), costs = $('div.eq_buy_costs', el), cost = $('strong:first-child', costs).text().replace(/[^0-9]/g, ''),upkeep = $('div.eq_buy_txt_int:first',el).children('span.negative').text().replace(/[^0-9]/g, ''), match, maxlen = 0;
            unit[name] = unit[name] || {};
            unit[name].page = page;
            unit[name].img = $('div.eq_buy_image img', el).attr('src').filepart();
            unit[name].own = $(costs).text().regex(/Owned: ([0-9]+)/i);
            unit[name].att = $('div.eq_buy_stats_int div:eq(0)', stats).text().regex(/([0-9]+)\s*Attack/);
            unit[name].def = $('div.eq_buy_stats_int div:eq(1)', stats).text().regex(/([0-9]+)\s*Defense/);
            unit[name].tot_att = unit[name].att + (0.7 * unit[name].def);
            unit[name].tot_def = unit[name].def + (0.7 * unit[name].att);            
            if (cost) {
                unit[name].cost = parseInt(cost, 10);
                if (upkeep){
                    unit[name].upkeep = parseInt(upkeep, 10);
                }
                unit[name].buy = [];
                unit[name].sell = [];
                $('select[name="amount"]:first option', costs).each(function(i,el){
                    unit[name].buy.push(parseInt($(el).val(), 10));
                });
                $('select[name="amount"]:last option', costs).each(function(i,el){
                    unit[name].sell.push(parseInt($(el).val(), 10));
                });
                
            }
            if (page === 'blacksmith') {
                for (i in Town.blacksmith) {
                    if ((match = name.match(Town.blacksmith[i]))) {
                        for (j=0; j<match.length; j++) {
                            if (match[j].length > maxlen) {
                                unit[name].type = i;
                                maxlen = match[j].length;
                            }
                        }
                    }
                }
            }
        });
    } else if (Page.page==='town_blacksmith') {
        $('.eq_buy_row,.eq_buy_row2').each(function(i,el){
            var $el = $('div.eq_buy_txt strong:first-child', el), name = $el.text().trim();
            if (Town.data[name].type) {
                $el.parent().append('<br>'+Town.data[name].type);
            }
        });
    }
    return true;
};

Town.getInvade = function(army) {
    var att = 0, def = 0, data = this.data;
    att += getAttDef(data, function(list,i,units){if (units[i].page==='soldiers'){list.push(i);}}, 'att', army, 'invade');
    def += getAttDef(data, null, 'def', army, 'invade');
    att += getAttDef(data, function(list,i,units){if (units[i].type && units[i].type !== 'Weapon'){list.push(i);}}, 'att', army, 'invade');
    def += getAttDef(data, null, 'def', army, 'invade');
    att += getAttDef(data, function(list,i,units){if (units[i].type === 'Weapon'){list.push(i);}}, 'att', army, 'invade');
    def += getAttDef(data, null, 'def', army, 'invade');
    att += getAttDef(data, function(list,i,units){if (units[i].page === 'magic'){list.push(i);}}, 'att', army, 'invade');
    def += getAttDef(data, null, 'def', army, 'invade');
    return {attack:att, defend:def};
};

Town.getDuel = function() {
    var att = 0, def = 0, data = this.data;
    att += getAttDef(data, function(list,i,units){if (units[i].type === 'Weapon'){list.push(i);}}, 'att', 1, 'duel');
    def += getAttDef(data, null, 'def', 1, 'duel');
    att += getAttDef(data, function(list,i,units){if (units[i].page === 'magic'){list.push(i);}}, 'att', 1, 'duel');
    def += getAttDef(data, null, 'def', 1, 'duel');
    att += getAttDef(data, function(list,i,units){if (units[i].type === 'Shield'){list.push(i);}}, 'att', 1, 'duel');
    def += getAttDef(data, null, 'def', 1, 'duel');
    att += getAttDef(data, function(list,i,units){if (units[i].type === 'Helmet'){list.push(i);}}, 'att', 1, 'duel');
    def += getAttDef(data, null, 'def', 1, 'duel');
    att += getAttDef(data, function(list,i,units){if (units[i].type === 'Gloves'){list.push(i);}}, 'att', 1, 'duel');
    def += getAttDef(data, null, 'def', 1, 'duel');
    att += getAttDef(data, function(list,i,units){if (units[i].type === 'Armor'){list.push(i);}}, 'att', 1, 'duel');
    def += getAttDef(data, null, 'def', 1, 'duel');
    att += getAttDef(data, function(list,i,units){if (units[i].type === 'Amulet'){list.push(i);}}, 'att', 1, 'duel');
    def += getAttDef(data, null, 'def', 1, 'duel');
    return {attack:att, defend:def};
};

Town.update = function(type) {
    var i, u, best_buy = null,best_sell = null, keep_sets = [], buy = 0, sell = 0, data = this.data, quests, army = 0, max = 0, max_buy = 0, max_sell = 0;
    var list_buy = [], soldiers_att = [], weapon_att = [], equipment_att = [], magic_att = [],own_soldiers_att, own_weapon_att, own_equipment_att,own_magic_att;
    var list_sell = [], soldiers_def = [], weapon_def = [], equipment_def = [], magic_def = [],own_soldiers_def,own_weapon_def,own_equipment_def,own_magic_def;
    var max_cost = {
        '$10k':Math.pow(10,4),
        '$100k':Math.pow(10,5),
        '$1m':Math.pow(10,6),
        '$10m':Math.pow(10,7),
        '$100m':Math.pow(10,8),
        '$1b':Math.pow(10,9),
        '$10b':Math.pow(10,10),
        '$100b':Math.pow(10,11)
    };
    var rtn = 0;
    army = Player.get('army');
    switch (this.option.number){
        case 'Army':
            max_buy = army;
            break;
        case 'Max Army':
            max_buy = Math.max(501,army);
            break;
        default:
            max_buy = 0;
    }
    switch (this.option.sell){
        case 'Above Army':
            max_sell = army;
            break;
        case 'Above Max Army':
            max_sell = Math.max(501,army);
            break;
        default:
            max_sell = 0;
    }
    max = Math.max(max_buy,max_sell);
    this.runtime.invade = this.getInvade(army);
    this.runtime.duel = this.getDuel();
    if (this.option.number !== 'None') {
        quests = Quest.get();
        for (i in quests) {
            if (quests[i].units) {
                for (u in quests[i].units) {
                    if (data[u] && data[u].cost){
                        data[u].req = Math.max(quests[i].units[u],data[u].req);
                        if (data[u].own < data[u].req && this.option.quest_buy){
                            list_buy.push([u,data[u].req - data[u].own,data[u].cost]);
                        }
                    }
                }
            }
        }
        if(list_buy.length){
            list_buy = unique(list_buy);
            list_buy.sort(function(a,b){
                return (a[2]*a[1]) - (b[2]*b[1]);
            });
            best_buy = list_buy[0][0];
            buy = list_buy[0][1];
            delete list_buy;
        }
    }
    if (!best_buy && max_buy){
        delete list_buy;
        own_soldiers_att = own_weapon_att = own_equipment_att = own_magic_att = own_soldiers_def = own_weapon_def = own_equipment_def = own_magic_def = 0;
        for (u in data){
            data[u].best = 0;
            if (data[u].page === 'soldiers'){
                soldiers_att.push([u,data[u].own,data[u].tot_att,data[u].tot_def,data[u].cost,data[u].buy,data[u].upkeep]);
                soldiers_def.push([u,data[u].own,data[u].tot_att,data[u].tot_def,data[u].cost,data[u].buy,data[u].upkeep]);
                own_soldiers_def = own_soldiers_att += data[u].own;
            } else if (data[u].page === 'blacksmith' && data[u].type === 'Weapon'){
                weapon_att.push([u,data[u].own,data[u].tot_att,data[u].tot_def,data[u].cost,data[u].buy,data[u].upkeep]);
                weapon_def.push([u,data[u].own,data[u].tot_att,data[u].tot_def,data[u].cost,data[u].buy,data[u].upkeep]);
                own_weapon_def = own_weapon_att += data[u].own;
            } else if (data[u].page === 'blacksmith' && data[u].type !== 'Weapon'){
                equipment_att.push([u,data[u].own,data[u].tot_att,data[u].tot_def,data[u].cost,data[u].buy,data[u].upkeep]);
                equipment_def.push([u,data[u].own,data[u].tot_att,data[u].tot_def,data[u].cost,data[u].buy,data[u].upkeep]);
                own_equipment_def = own_equipment_att += data[u].own;
            } else if (data[u].page === 'magic'){
                magic_att.push([u,data[u].own,data[u].tot_att,data[u].tot_def,data[u].cost,data[u].buy,data[u].upkeep]);
                magic_def.push([u,data[u].own,data[u].tot_att,data[u].tot_def,data[u].cost,data[u].buy,data[u].upkeep]);
                own_magic_def = own_magic_att += data[u].own;
            }
        }
        switch(this.option.units){
            default:
            case 'Best Offense':
                rtn = 2;
                
                    own_soldiers_att = 0;
                    if (soldiers_att.length){
                        soldiers_att.sort(function(a,b){
                            return b[rtn] - a[rtn];
                        });
                        while (!soldiers_att[0][4] || soldiers_att[0][4] > max_cost[Town.option.maxcost] || (soldiers_att[0][6] && Player.get('upkeep') / Player.get('maxincome') * 100 >= this.option.upkeep)){
                            if (max - soldiers_att[0][1] > own_soldiers_att){
                                data[soldiers_att[0][0]].best = Math.max(data[soldiers_att[0][0]].own,data[soldiers_att[0][0]].best);
                            } else {
                                data[soldiers_att[0][0]].best = Math.max(max -own_soldiers_att,data[soldiers_att[0][0]].best);
                            }
                            own_soldiers_att += soldiers_att[0][1];
                            if (typeof soldiers_att[1] === 'undefined'){
                                data[soldiers_att[0][0]].best = Math.max(data[soldiers_att[0][0]].own,data[soldiers_att[0][0]].best);
                            }
                            soldiers_att.shift();
                            if (!soldiers_att.length){
                                break;
                            }
                        }
                    }
                    if(soldiers_att.length) {
                        if (max - soldiers_att[0][1] > own_soldiers_att){
                            data[soldiers_att[0][0]].best = Math.max(data[soldiers_att[0][0]].own,data[soldiers_att[0][0]].best);
                        } else {
                            data[soldiers_att[0][0]].best = Math.max(max -own_soldiers_att,data[soldiers_att[0][0]].best);
                        }
                        own_soldiers_att += soldiers_att[0][1];
                        if (own_soldiers_att < max_buy){
                            list_buy.push([soldiers_att[0][0],soldiers_att[0][1],soldiers_att[0][2],soldiers_att[0][3],soldiers_att[0][4],soldiers_att[0][5],max_buy - own_soldiers_att]);
                        }
                        for (i=1;own_soldiers_att < max; i++){
                            if (typeof soldiers_att[i] === 'undefined'){
                                data[soldiers_att[i-1][0]].best = Math.max(data[soldiers_att[i-1][0]].own,data[soldiers_att[i-1][0]].best);
                                own_soldiers_att += max - own_soldiers_att;
                                break;
                            }
                            if (max - soldiers_att[i][1] > own_soldiers_att){
                                data[soldiers_att[i][0]].best = Math.max(data[soldiers_att[i][0]].own,data[soldiers_att[i][0]].best);
                                own_soldiers_att += soldiers_att[i][1];
                            } else {
                                data[soldiers_att[i][0]].best = Math.max(max - own_soldiers_att,data[soldiers_att[i][0]].best);
                                own_soldiers_att += max - own_soldiers_att;
                            }
                        }
                    }
                    own_weapon_att = 0;
                    if (weapon_att.length){
                        weapon_att.sort(function(a,b){
                            return b[rtn] - a[rtn];
                        });
                        while (!weapon_att[0][4] || weapon_att[0][4] > max_cost[Town.option.maxcost] || (weapon_att[0][6] && Player.get('upkeep') / Player.get('maxincome') * 100 >= this.option.upkeep)){
                            if (max - weapon_att[0][1] > own_weapon_att){
                                data[weapon_att[0][0]].best = Math.max(data[weapon_att[0][0]].own,data[weapon_att[0][0]].best);
                            } else {
                                data[weapon_att[0][0]].best = Math.max(max - own_weapon_att,data[weapon_att[0][0]].best);
                            }
                            own_weapon_att += weapon_att[0][1];
                            if (typeof weapon_att[1] === 'undefined'){
                                debug('Setting Best for ' + data[weapon_att[0][0]]);
                                data[weapon_att[0][0]].best = Math.max(data[weapon_att[0][0]].own,data[weapon_att[0][0]].best);
                            }
                            weapon_att.shift();
                            if (!weapon_att.length){
                                break;
                            }
                        }
                    }
                    if(weapon_att.length) {
                        if (max - weapon_att[0][1] > own_weapon_att){
                            data[weapon_att[0][0]].best = Math.max(data[weapon_att[0][0]].own,data[weapon_att[0][0]].best);
                        } else {
                            data[weapon_att[0][0]].best = Math.max(max -own_weapon_att,data[weapon_att[0][0]].best);
                        }
                        own_weapon_att += weapon_att[0][1];
                        if (own_weapon_att < max_buy) {
                            list_buy.push([weapon_att[0][0],weapon_att[0][1],weapon_att[0][2],weapon_att[0][3],weapon_att[0][4],weapon_att[0][5],max_buy - own_weapon_att]);
                        }
                        for (i=1;own_weapon_att < max; i++){
                            if (typeof weapon_att[i] === 'undefined'){
                                data[weapon_att[i-1][0]].best = Math.max(data[weapon_att[i-1][0]].own,data[weapon_att[i-1][0]].best);
                                own_weapon_att += max - own_weapon_att;
                                break;
                            } else if (max - weapon_att[i][1] > own_weapon_att){
                                data[weapon_att[i][0]].best = Math.max(data[weapon_att[i][0]].own,data[weapon_att[i][0]].best);
                                own_weapon_att += weapon_att[i][1];
                            } else {
                                data[weapon_att[i][0]].best = Math.max(max - own_weapon_att,data[weapon_att[i][0]].best);
                                own_weapon_att += max - own_weapon_att;
                            }
                        }
                    }
                    own_equipment_att = 0;
                    if (equipment_att.length){
                        equipment_att.sort(function(a,b){
                            return b[rtn] - a[rtn];
                        });
                        while (!equipment_att[0][4] || equipment_att[0][4] > max_cost[Town.option.maxcost] || (equipment_att[0][6] && Player.get('upkeep') / Player.get('maxincome') * 100 >= this.option.upkeep)){
                            if (max - equipment_att[0][1] > own_equipment_att){
                                data[equipment_att[0][0]].best = Math.max(data[equipment_att[0][0]].own,data[equipment_att[0][0]].best);
                            } else {
                                data[equipment_att[0][0]].best = Math.max(max -own_equipment_att,data[equipment_att[0][0]].best);
                            }
                            own_equipment_att += equipment_att[0][1];
                            if (typeof equipment_att[1] === 'undefined'){
                                data[equipment_att[0][0]].best = Math.max(data[equipment_att[0][0]].own,data[equipment_att[0][0]].best);
                            }
                            equipment_att.shift();
                            if (!equipment_att.length){
                                break;
                            }
                        }
                    }
                    if(equipment_att.length) {
                        if (max - equipment_att[0][1] > own_equipment_att){
                            data[equipment_att[0][0]].best = Math.max(data[equipment_att[0][0]].own,data[equipment_att[0][0]].best);
                        } else {
                            data[equipment_att[0][0]].best = Math.max(max -own_equipment_att,data[equipment_att[0][0]].best);
                        }
                        own_equipment_att += equipment_att[0][1];
                        if (own_equipment_att < max_buy){
                            list_buy.push([equipment_att[0][0],equipment_att[0][1],equipment_att[0][2],equipment_att[0][3],equipment_att[0][4],equipment_att[0][5],max_buy - own_equipment_att]);
                        }
                        for (i=1;own_equipment_att < max; i++){
                            if (typeof equipment_att[i] === 'undefined'){
                                data[equipment_att[i-1][0]].best = Math.max(data[equipment_att[i-1][0]].own,data[equipment_att[i-1][0]].best);
                                own_equipment_att += max - own_equipment_att;
                                break;
                            }
                            if (max - equipment_att[i][1] > own_equipment_att){
                                data[equipment_att[i][0]].best = Math.max(data[equipment_att[i][0]].own,data[equipment_att[i][0]].best);
                                own_equipment_att += equipment_att[i][1];
                            } else {
                                data[equipment_att[i][0]].best = Math.max(max - own_equipment_att,data[equipment_att[i][0]].best);
                                own_equipment_att += max - own_equipment_att;
                            }
                        }
                    }
                    own_magic_att = 0;
                    if (magic_att.length){
                        magic_att.sort(function(a,b){
                            return b[rtn] - a[rtn];
                        });
                        while (!magic_att[0][4] || magic_att[0][4] > max_cost[Town.option.maxcost] || (magic_att[0][6] && Player.get('upkeep') / Player.get('maxincome') * 100 >= this.option.upkeep)){
                            if (max - magic_att[0][1] > own_magic_att){
                                data[magic_att[0][0]].best = Math.max(data[magic_att[0][0]].own,data[magic_att[0][0]].best);
                            } else {
                                data[magic_att[0][0]].best = Math.max(max -own_magic_att,data[magic_att[0][0]].best);
                            }
                            own_magic_att += magic_att[0][1];
                            if (typeof magic_att[1] === 'undefined'){
                                data[magic_att[0][0]].best = Math.max(data[magic_att[0][0]].own,data[magic_att[0][0]].best);
                            }
                            magic_att.shift();
                            if (!magic_att.length){
                                break;
                            }
                        }
                    }
                    if(magic_att.length) {
                        if (max - magic_att[0][1] > own_magic_att){
                            data[magic_att[0][0]].best = Math.max(data[magic_att[0][0]].own,data[magic_att[0][0]].best);
                        } else {
                            data[magic_att[0][0]].best = Math.max(max -own_magic_att,data[magic_att[0][0]].best);
                        }
                        own_magic_att += magic_att[0][1];
                        if (own_magic_att < max_buy){
                            list_buy.push([magic_att[0][0],magic_att[0][1],magic_att[0][2],magic_att[0][3],magic_att[0][4],magic_att[0][5],max_buy - own_magic_att]);
                        }
                        for (i=1;own_magic_att < max; i++){
                            if (typeof magic_att[i] === 'undefined'){
                                data[magic_att[i-1][0]].best = Math.max(data[magic_att[i-1][0]].own,data[magic_att[i-1][0]].best);
                                own_magic_att += max - own_magic_att;
                                break;
                            }
                            if (max - magic_att[i][1] > own_magic_att){
                                data[magic_att[i][0]].best = Math.max(data[magic_att[i][0]].own,data[magic_att[i][0]].best);
                                own_magic_att += magic_att[i][1];
                            } else {
                                data[magic_att[i][0]].best = Math.max(max - own_magic_att,data[magic_att[i][0]].best);
                                own_magic_att += max - own_magic_att;
                            }
                        }
                    }
                
                if (this.option.units === 'Best Offense'){
                    break;
                }
            case 'Best Defense':
                rtn = 3;
                
                    own_soldiers_def = 0;
                    if (soldiers_def.length){
                        soldiers_def.sort(function(a,b){
                            return b[rtn] - a[rtn];
                        });
                        while (!soldiers_def[0][4] || soldiers_def[0][4] > max_cost[Town.option.maxcost] || (soldiers_def[0][6] && Player.get('upkeep') / Player.get('maxincome') * 100 >= this.option.upkeep)){
                            if (max - soldiers_def[0][1] > own_soldiers_def){
                                data[soldiers_def[0][0]].best = Math.max(data[soldiers_def[0][0]].own,data[soldiers_def[0][0]].best);
                            } else {
                                data[soldiers_def[0][0]].best = Math.max(max -own_soldiers_def,data[soldiers_def[0][0]].best);
                            }
                            own_soldiers_def += soldiers_def[0][1];
                            if (typeof soldiers_def[1] === 'undefined'){
                                data[soldiers_def[0][0]].best = Math.max(data[soldiers_def[0][0]].own,data[soldiers_def[0][0]].best);
                            }
                            soldiers_def.shift();
                            if (!soldiers_def.length){
                                break;
                            }
                        }
                    }
                    if(soldiers_def.length) {
                        if (max - soldiers_def[0][1] > own_soldiers_def){
                            data[soldiers_def[0][0]].best = Math.max(data[soldiers_def[0][0]].own,data[soldiers_def[0][0]].best);
                        } else {
                            data[soldiers_def[0][0]].best = Math.max(max -own_soldiers_def,data[soldiers_def[0][0]].best);
                        }
                        own_soldiers_def += soldiers_def[0][1];
                        if (own_soldiers_def < max_buy){
                            list_buy.push([soldiers_def[0][0],soldiers_def[0][1],soldiers_def[0][2],soldiers_def[0][3],soldiers_def[0][4],soldiers_def[0][5],max_buy - own_soldiers_def]);
                        }
                        for (i=1;own_soldiers_def < max; i++){
                            if (typeof soldiers_def[i] === 'undefined'){
                                data[soldiers_def[i-1][0]].best = Math.max(data[soldiers_def[i-1][0]].own,data[soldiers_def[i-1][0]].best);
                                own_soldiers_def += max - own_soldiers_def;
                                break;
                            }
                            if (max - soldiers_def[i][1] > own_soldiers_def){
                                data[soldiers_def[i][0]].best = Math.max(data[soldiers_def[i][0]].own,data[soldiers_def[i][0]].best);
                                own_soldiers_def += soldiers_def[i][1];
                            } else {
                                data[soldiers_def[i][0]].best = Math.max(max - own_soldiers_def,data[soldiers_def[i][0]].best);
                                own_soldiers_def += max - own_soldiers_def;
                            }
                            
                        }
                    }
                    own_weapon_def = 0;
                    if (weapon_def.length){
                        weapon_def.sort(function(a,b){
                            return b[rtn] - a[rtn];
                        });
                        while (!weapon_def[0][4] || weapon_def[0][4] > max_cost[Town.option.maxcost] || (weapon_def[0][6] && Player.get('upkeep') / Player.get('maxincome') * 100 >= this.option.upkeep)){
                            if (max - weapon_def[0][1] > own_weapon_def){
                                data[weapon_def[0][0]].best = Math.max(data[weapon_def[0][0]].own,data[weapon_def[0][0]].best);
                            } else {
                                data[weapon_def[0][0]].best = Math.max(max -own_weapon_def,data[weapon_def[0][0]].best);
                            }
                            own_weapon_def += weapon_def[0][1];
                            if (typeof weapon_def[1] === 'undefined'){
                                data[weapon_def[0][0]].best = Math.max(data[weapon_def[0][0]].own,data[weapon_def[0][0]].best);
                            }
                            weapon_def.shift();
                            if (!weapon_def.length){
                                break;
                            }
                        }
                    }
                    if(weapon_def.length) {
                        if (max - weapon_def[0][1] > own_weapon_def){
                            data[weapon_def[0][0]].best = Math.max(data[weapon_def[0][0]].own,data[weapon_def[0][0]].best);
                        } else {
                            data[weapon_def[0][0]].best = Math.max(max - own_weapon_def,data[weapon_def[0][0]].best);
                        }
                        own_weapon_def += weapon_def[0][1];
                        if (own_weapon_def < max_buy){
                            list_buy.push([weapon_def[0][0],weapon_def[0][1],weapon_def[0][2],weapon_def[0][3],weapon_def[0][4],weapon_def[0][5],max_buy - own_weapon_def]);
                        }
                        for (i=1;own_weapon_def < max; i++){
                            if (typeof weapon_def[i] === 'undefined'){
                                data[weapon_def[i-1][0]].best = Math.max(data[weapon_def[i-1][0]].own,data[weapon_def[i-1][0]].best);
                                own_weapon_def += max - own_weapon_def;
                                break;
                            }
                            if (max - weapon_def[i][1] > own_weapon_def){
                                data[weapon_def[i][0]].best = Math.max(data[weapon_def[i][0]].own,data[weapon_def[i][0]].best);
                                own_weapon_def += weapon_def[i][1];
                            } else {
                                data[weapon_def[i][0]].best = Math.max(max - own_weapon_def,data[weapon_def[i][0]].best);
                                own_weapon_def += max - own_weapon_def;
                            }
                        }
                    }
                    own_equipment_def = 0;
                    if (equipment_def.length){
                        equipment_def.sort(function(a,b){
                            return b[rtn] - a[rtn];
                        });
                        while (!equipment_def[0][4] || equipment_def[0][4] > max_cost[Town.option.maxcost] || (equipment_def[0][6] && Player.get('upkeep') / Player.get('maxincome') * 100 >= this.option.upkeep)){
                            if (max - equipment_def[0][1] > own_equipment_def){
                                data[equipment_def[0][0]].best = Math.max(data[equipment_def[0][0]].own,data[equipment_def[0][0]].best);
                            } else {
                                data[equipment_def[0][0]].best = Math.max(max -own_equipment_def,data[equipment_def[0][0]].best);
                            }
                            own_equipment_def += equipment_def[0][1];
                            if (typeof equipment_def[1] === 'undefined'){
                                data[equipment_def[0][0]].best = Math.max(data[equipment_def[0][0]].own,data[equipment_def[0][0]].best);
                            }
                            equipment_def.shift();
                            if (!equipment_def.length){
                                break;
                            }
                        }
                    }
                    if(equipment_def.length) {
                        if (max - equipment_def[0][1] > own_equipment_def){
                            data[equipment_def[0][0]].best = Math.max(data[equipment_def[0][0]].own,data[equipment_def[0][0]].best);
                        } else {
                            data[equipment_def[0][0]].best = Math.max(max -own_equipment_def,data[equipment_def[0][0]].best);
                        }
                        own_equipment_def += equipment_def[0][1];
                        if (own_equipment_def < max_buy){
                            list_buy.push([equipment_def[0][0],equipment_def[0][1],equipment_def[0][2],equipment_def[0][3],equipment_def[0][4],equipment_def[0][5],max_buy - own_equipment_def]);
                        }
                        for (i=1;own_equipment_def < max; i++){
                            if (typeof equipment_def[i] === 'undefined'){
                                data[equipment_def[i-1][0]].best = Math.max(data[equipment_def[i-1][0]].own,data[equipment_def[i-1][0]].best);
                                own_equipment_def += max - own_equipment_def;
                                break;
                            }
                            if (max - equipment_def[i][1] > own_equipment_def){
                                data[equipment_def[i][0]].best = Math.max(data[equipment_def[i][0]].own,data[equipment_def[i][0]].best);
                                own_equipment_def += equipment_def[i][1];
                            } else {
                                data[equipment_def[i][0]].best = Math.max(max - own_equipment_def,data[equipment_def[i][0]].best);
                                own_equipment_def += max - own_equipment_def;
                            }
                        }
                    }
                    own_magic_def = 0;
                    if (magic_def.length){
                        magic_def.sort(function(a,b){
                            return b[rtn] - a[rtn];
                        });
                        while (!magic_def[0][4] || magic_def[0][4] > max_cost[Town.option.maxcost] || (magic_def[0][6] && Player.get('upkeep') / Player.get('maxincome') * 100 >= this.option.upkeep)){
                            if (max - magic_def[0][1] > own_magic_def){
                                data[magic_def[0][0]].best = Math.max(data[magic_def[0][0]].own,data[magic_def[0][0]].best);
                            } else {
                                data[magic_def[0][0]].best = Math.max(max -own_magic_def,data[magic_def[0][0]].best);
                            }
                            own_magic_def += magic_def[0][1];
                            if (typeof magic_def[1] === 'undefined'){
                                data[magic_def[0][0]].best = Math.max(data[magic_def[0][0]].own,data[magic_def[0][0]].best);
                            }
                            magic_def.shift();
                            if (!magic_def.length){
                                break;
                            }
                        }
                    }
                    if(magic_def.length) {
                        if (max - magic_def[0][1] > own_magic_def){
                            data[magic_def[0][0]].best = Math.max(data[magic_def[0][0]].own,data[magic_def[0][0]].best);
                        } else {
                            data[magic_def[0][0]].best = Math.max(max -own_magic_def,data[magic_def[0][0]].best);
                        }
                        own_magic_def += magic_def[0][1];
                        if (own_magic_def < max_buy){
                            list_buy.push([magic_def[0][0],magic_def[0][1],magic_def[0][2],magic_def[0][3],magic_def[0][4],magic_def[0][5],max_buy - own_magic_def]);
                        }
                        for (i=1;own_magic_def < max; i++){
                            if (typeof magic_def[i] === 'undefined'){
                                data[magic_def[i-1][0]].best = Math.max(data[magic_def[i-1][0]].own,data[magic_def[i-1][0]].best);
                                own_magic_def += max - own_magic_def;
                                break;
                            }
                            if (max - magic_def[i][1] > own_magic_def){
                                data[magic_def[i][0]].best = Math.max(data[magic_def[i][0]].own,data[magic_def[i][0]].best);
                                own_magic_def += magic_def[i][1];
                            } else {
                                data[magic_def[i][0]].best = Math.max(max - own_magic_def,data[magic_def[i][0]].best);
                                own_magic_def += max - own_magic_def;
                            }
                        }
                    }
                
                break;

        }
        if(list_buy.length){
            list_buy = unique(list_buy);
            list_buy.sort(function(a,b){
                return a[4]-b[4];
            });
            best_buy = list_buy[0][0];
            buy = (list_buy[0][6] > Math.max.apply( Math, list_buy[0][5])) ? Math.max.apply( Math, list_buy[0][5]) : list_buy[0][6];

        }

    }
    if (this.option.sell !== 'None' && max_sell){
        delete list_sell;

        for(u in data){
            if (data[u].sell && ((data[u].own > data[u].req || !data[u].req) && data[u].own - data[u].best > 0) && data[u].own){
                list_sell.push([u,(data[u].req)?Math.min(data[u].own - data[u].req,data[u].own - data[u].best):data[u].own - data[u].best,data[u].tot_att + data[u].tot_def]);
            }
        }


        if (list_sell.length){
            list_sell.sort(function(a,b){
                return a[2] - b[2];
            });
        }
        list_sell = unique(list_sell);
        if (list_sell.length){
            list_sell.sort(function(a,b){
                return a[2] - b[2];
            });
        }

    }
    if (list_sell.length){
        best_sell = list_sell[0][0];
        sell = list_sell[0][1];
        this.runtime.best_sell = best_sell;
    } else {
        this.runtime.best_sell = null;
        this.runtime.sell = null;
    }
    if (best_buy){
        this.runtime.best_buy = best_buy;
    } else {
        this.runtime.best_buy = null;
        this.runtime.buy = null;
    }
    if (best_sell && sell) {
        this.runtime.sell = sell;
        this.runtime.cost = sell * data[best_sell].cost / 2;
        Dashboard.status(this, 'Want to sell ' + sell + ' x ' + best_sell + ' for $' + shortNumber(this.runtime.cost) + '<br> (Available Cash: $' + shortNumber(Bank.worth()) + ' Upkeep ' + (Player.get('upkeep') / Player.get('maxincome') * 100).round(2) + '%)');
    } else if (best_buy && buy){
        this.runtime.buy = buy;
        this.runtime.cost = buy * data[best_buy].cost;
        Dashboard.status(this, 'Want to buy ' + buy + ' x ' + best_buy + ' for $' + shortNumber(this.runtime.cost) + '<br> (Available Cash: $' + shortNumber(Bank.worth()) + ' Upkeep ' + (Player.get('upkeep') / Player.get('maxincome') * 100).round(2) + '%)');
    } else {
        this.runtime.cost = null;
        Dashboard.status(this);
    }
};

Town.work = function(state) {
    var qty;
    if (state && this.runtime.best_sell !== null){
        if (!state || !this.sell(this.runtime.best_sell, this.runtime.sell)) {
            Dashboard.status(this, 'Want to sell ' + this.runtime.sell + ' x ' + this.runtime.best_sell + ' for $' + shortNumber(this.runtime.cost) + '<br> (Available Cash: $' + shortNumber(Bank.worth()) + ' Upkeep ' + (Player.get('upkeep') / Player.get('maxincome') * 100).round(2) + '%)');
            //debug('Checking Sell');
            return QUEUE_CONTINUE;
        }
    }
    if (this.runtime.best_buy){
        if (!state && !Bank.worth(this.runtime.cost)) {
            Dashboard.status(this, 'Want to buy ' + this.runtime.buy + ' x ' + this.runtime.best_buy + ' for $' + shortNumber(this.runtime.cost) + '<br> (Available Cash: $' + shortNumber(Bank.worth()) + ' Upkeep ' + (Player.get('upkeep') / Player.get('maxincome') * 100).round(2) + '%)');
            //debug('Checking Bank');
            return QUEUE_FINISH;
        }
        if (!state || !this.buy(this.runtime.best_buy, this.runtime.buy)) {
            Dashboard.status(this, 'Want to buy ' + this.runtime.buy + ' x ' + this.runtime.best_buy + ' for $' + shortNumber(this.runtime.cost) + '<br> (Available Cash: $' + shortNumber(Bank.worth()) + ' Upkeep ' + (Player.get('upkeep') / Player.get('maxincome') * 100).round(2) + '%)');
            //debug('Checking Buy');
            return QUEUE_CONTINUE;
        }
    }
    return QUEUE_FINISH;
};

Town.buy = function(item, number) { // number is absolute including already owned
    this._unflush();
    if (!this.data[item] || !this.data[item].buy || !Bank.worth(this.runtime.cost)) {
        return true; // We (pretend?) we own them
    }
    if (!Generals.to(this.option.general ? 'cost' : 'any') || !Bank.retrieve(this.runtime.cost) || (this.data[item].page === 'soldiers' && !Generals.to('cost')) || !Page.to('town_'+this.data[item].page)) {
        return false;
    }
    var i, qty = 0;
    for (i=0; i<this.data[item].buy.length && this.data[item].buy[i] <= number; i++) {
        qty = this.data[item].buy[i];
    }
    $('.eq_buy_row,.eq_buy_row2').each(function(i,el){
        if ($('div.eq_buy_txt strong:first', el).text().trim() === item) {
            debug('Buying ' + qty + ' x ' + item + ' for $' + addCommas(qty * Town.data[item].cost));
            $('div.eq_buy_costs select[name="amount"]:eq(0)', el).val(qty);
            Page.click($('div.eq_buy_costs input[name="Buy"]', el));
        }
    });
    return false;
};

Town.sell = function(item, number) { // number is absolute including already owned
    this._unflush();
    if (!this.data[item] || !this.data[item].sell) {
        return true;
    }
    if (!Generals.to(this.option.general ? 'cost' : 'any') || (this.data[item].page === 'soldiers' && !Generals.to('cost')) || !Page.to('town_'+this.data[item].page)) {
        return false;
    }
    var i, qty = 0;
    for (i=0; i<this.data[item].sell.length && this.data[item].sell[i] <= number; i++) {
        qty = this.data[item].sell[i];
    }
    $('.eq_buy_row,.eq_buy_row2').each(function(i,el){
        if ($('div.eq_buy_txt strong:first', el).text().trim() === item) {
            debug('Selling ' + qty + ' x ' + item + ' for $' + addCommas(qty * Town.data[item].cost / 2));
            $('div.eq_buy_costs select[name="amount"]:eq(1)', el).val(qty);
            Page.click($('div.eq_buy_costs input[name="Sell"]', el));
        }
    });
    return false;
};

var makeTownDash = function(list, unitfunc, x, type, name, count) { // Find total att(ack) or def(ense) value from a list of objects (with .att and .def)
    var units = [], output = [], x2 = (x==='att'?'def':'att'), i, order = {
        Weapon:1,
        Shield:2,
        Helmet:3,
        Armor:4,
        Amulet:5,
        Gloves:6,
        Magic:7
    };
    if (name) {
        output.push('<div class="golem-panel"><h3 class="golem-panel-header" style="width:auto;">'+name+'</h3><div class="golem-panel-content">');
    }
    for (i in list) {
        unitfunc(units, i, list);
    }
    if (list[units[0]]) {
        if (type === 'duel' && list[units[0]].type) {
            units.sort(function(a,b) {
                return order[list[a].type] - order[list[b].type];
            });
        } else if (list[units[0]] && list[units[0]].skills && list[units[0]][type]) {
            units.sort(function(a,b) {
                return (list[b][type][x] || 0) - (list[a][type][x] || 0);
            });
        } else {
            units.sort(function(a,b) {
                return (list[b][x] + (0.7 * list[b][x2])) - (list[a][x] + (0.7 * list[a][x2]));
            });
        }
    }
    for (i=0; i<(count ? count : units.length); i++) {
        if ((list[units[0]] && list[units[0]].skills) || (list[units[i]].use && list[units[i]].use[type+'_'+x])) {
            output.push('<p><div style="height:25px;margin:1px;"><img src="' + imagepath + list[units[i]].img + '" style="width:25px;height:25px;float:left;margin-right:4px;"> ' + (list[units[i]].use ? list[units[i]].use[type+'_'+x]+' x ' : '') + units[i] + ' (' + list[units[i]].att + ' / ' + list[units[i]].def + ')' + (list[units[i]].cost?' $'+shortNumber(list[units[i]].cost):'') + '</div></p>');
        }
    }
    if (name) {
        output.push('</div></div>');
    }
    return output.join('');
};

Town.dashboard = function() {
    var left, right, generals = Generals.get(), duel = {}, best;
    best = Generals.best('duel');
    left = '<div style="float:left;width:50%;"><div class="golem-panel"><h3 class="golem-panel-header" style="width:auto;">Invade - Attack</h3><div class="golem-panel-content" style="padding:8px;">'
    +	makeTownDash(generals, function(list,i){list.push(i);}, 'att', 'invade', 'Heroes')
    +	makeTownDash(this.data, function(list,i,units){if (units[i].page==='soldiers' && units[i].use){list.push(i);}}, 'att', 'invade', 'Soldiers')
    +	makeTownDash(this.data, function(list,i,units){if (units[i].use && units[i].type === 'Weapon'){list.push(i);}}, 'att', 'invade', 'Weapons')
    +	makeTownDash(this.data, function(list,i,units){if (units[i].page==='blacksmith' && units[i].use && units[i].type !== 'Weapon'){list.push(i);}}, 'att', 'invade', 'Equipment')
    +	makeTownDash(this.data, function(list,i,units){if (units[i].page==='magic' && units[i].use){list.push(i);}}, 'att', 'invade', 'Magic')
    +	'</div></div><div class="golem-panel"><h3 class="golem-panel-header" style="width:auto;">Duel - Attack</h3><div class="golem-panel-content" style="padding:8px;">'
    +	(best !== 'any' ? '<div style="height:25px;margin:1px;"><img src="' + imagepath + generals[best].img + '" style="width:25px;height:25px;float:left;margin-right:4px;">' + best + ' (' + generals[best].att + ' / ' + generals[best].def + ')</div>' : '')
    +	makeTownDash(this.data, function(list,i,units){if (units[i].page==='blacksmith' && units[i].use){list.push(i);}}, 'att', 'duel')
    +	makeTownDash(this.data, function(list,i,units){if (units[i].page==='magic' && units[i].use){list.push(i);}}, 'att', 'duel')
    +   '</div></div></div>';
    best = Generals.best('defend');
    right = '<div style="float:right;width:50%;"><div class="golem-panel"><h3 class="golem-panel-header" style="width:auto;">Invade - Defend</h3><div class="golem-panel-content" style="padding:8px;">'
    +	makeTownDash(generals, function(list,i){list.push(i);}, 'def', 'invade', 'Heroes')
    +	makeTownDash(this.data, function(list,i,units){if (units[i].page==='soldiers' && units[i].use){list.push(i);}}, 'def', 'invade', 'Soldiers')
    +	makeTownDash(this.data, function(list,i,units){if (units[i].use && units[i].type === 'Weapon'){list.push(i);}}, 'def', 'invade', 'Weapons')
    +	makeTownDash(this.data, function(list,i,units){if (units[i].page==='blacksmith' && units[i].use && units[i].type !== 'Weapon'){list.push(i);}}, 'def', 'invade', 'Equipment')
    +	makeTownDash(this.data, function(list,i,units){if (units[i].page==='magic' && units[i].use){list.push(i);}}, 'def', 'invade', 'Magic')
    +	'</div></div><div class="golem-panel"><h3 class="golem-panel-header" style="width:auto;">Duel - Defend</h3><div class="golem-panel-content" style="padding:8px;">'
    +	(best !== 'any' ? '<div style="height:25px;margin:1px;"><img src="' + imagepath + generals[best].img + '" style="width:25px;height:25px;float:left;margin-right:4px;">' + best + ' (' + generals[best].att + ' / ' + generals[best].def + ')</div>' : '')
    +	makeTownDash(this.data, function(list,i,units){if (units[i].page==='blacksmith' && units[i].use){list.push(i);}}, 'def', 'duel')
    +	makeTownDash(this.data, function(list,i,units){if (units[i].page==='magic' && units[i].use){list.push(i);}}, 'def', 'duel')
    +   '</div></div></div>';

    $('#golem-dashboard-Town').html(left+right);
};


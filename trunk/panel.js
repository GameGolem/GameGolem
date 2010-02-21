/********** Panel **********
* Create an instance of a panel for creating the display
* This code is a total mess...
*/
function Panel(name) {
	this.name = name;
	this.show = $('<div style="font-size:smaller;padding:12px;"></div>');
	this.options = function(opts) {
		opts		= opts || {};
		opts.before	= opts.before || '';
		opts.after	= opts.after || '';
		opts.suffix	= opts.suffix || '';
		opts.between= opts.between || 'to';
		opts.size	= opts.size || 7;
		opts.min	= opts.min || 0;
		opts.max	= opts.max || 100;
		return opts;
	};
	this.checkbox = function(id,label,opts) {
		var value = (WorkerByName(this.name).option[id] || false);
		var id = PREFIX + this.name + '_' + id;
		var label = label.replace(' ','&nbsp;');
		opts = this.options(opts);
		$(this.show).append('<div style="clear:both"><span style="float:left;">'+label+'</span><span style="float:right;text-align:right">'+opts.before+'<input type="checkbox" id="'+id+'" '+(value?' checked':'')+'>'+opts.after+'</span></div>');
		return id;
	};
	this.text = function(id,label,opts) {
		var value = (WorkerByName(this.name).option[id] || '');
		var id = PREFIX + this.name + '_' + id;
		var label = label.replace(' ','&nbsp;');
		opts = this.options(opts);
		$(this.show).append('<div style="clear:both"><span style="float:left;">'+label+'</span><span style="float:right;text-align:right">'+opts.before+'<input type="text" id="'+id+'" size="'+opts.size+'" value="'+value+'">'+opts.after+'</span></div>');
		return id;
	};
	this.select = function(id,label,list,opts) {
		var value = (WorkerByName(this.name).option[id] || null);
		var id = PREFIX + this.name + '_' + id;
		var label = label.replace(' ','&nbsp;');
		var options = [];
		opts = this.options(opts);
		if (!list) list = [];
		if (typeof list == 'number') { // Give us a selection of numbers
			var step = Divisor(list), max = list;
			list = [];
			for (var i=0; i<=max; i+=step) list.push(i);
		}
		for (var i in list) {
			if (typeof list[i] == 'object') options[i] = '<option value="'+list[i][0]+'"'+(value==list[i][0]?' selected':'')+'>'+list[i][0]+' ('+list[i][1]+opts.suffix+')</option>';
			else options[i] = '<option value="'+list[i]+'"'+(value==list[i]?' selected':'')+'>'+list[i]+opts.suffix+'</option>';
		}
		$(this.show).append('<div style="clear:both"><span style="float:left;">'+label+'</span><span style="float:right;text-align:right">'+opts.before+'<select id="'+id+'">'+options.join('')+'</select>'+opts.after+'</span></div>');
		return id;
	};
	this.multiple = function(id,label,list,opts) {
		var value = (WorkerByName(this.name).option[id] || []);
		var id = PREFIX + this.name + '_' + id;
		var label = label.replace(' ','&nbsp;');
		var options = [], values = [];
		opts = this.options(opts);
		if (!list) list = [];
		for (var i in list) {
			if (typeof list[i] == 'object') options[i] = '<option value="'+list[i][0]+'">'+list[i][0]+' ('+list[i][1]+')</option>';
			else options[i] = '<option value="'+list[i]+'">'+list[i]+'</option>';
		}
		for (var i in value) {
			values[i] = '<option value="'+value[i]+'">'+value[i]+'</option>';
		}
		var $obj = $('<div style="clear:both"><span style="float:left;">'+label+'</span><span style="float:right;text-align:right"><select style="width:100%" class="golem_multiple" multiple id="'+id+'">'+values.join('')+'</select><br><select class="golem_select">'+options.join('')+'</select><input type="button" class="golem_addselect" value="Add" /><input type="button" class="golem_delselect" value="Del" /></span></div>');
		$('input.golem_addselect', $obj).click(function(){
			$('select.golem_multiple', $(this).parent()).append('<option>'+$('select.golem_select', $(this).parent()).val()+'</option>');
			Config.updateOptions();
		});
		$('input.golem_delselect', $obj).click(function(){
			$('select.golem_multiple option[selected=true]', $(this).parent()).each(function(i,el){$(el).remove();})
			Config.updateOptions();
		});
		$(this.show).append($obj);
		return id;
	};
	this.range = function(id,label,opts) {	// Would prefer to use jQueryUI .slider instead, but doesn't like GM
		var value1 = (WorkerByName(this.name).option[id+'_min'] || 0);
		var value2 = (WorkerByName(this.name).option[id+'_max'] || 100);
		var id = PREFIX + this.name + '_' + id;
		var label = label.replace(' ','&nbsp;');
		opts = this.options(opts);//<input type="text" id="' + id + '" size="'+opts.size+'" value="'+value+'">
		var step = Divisor(opts.max-opts.min), list1 = [], list2 = [];
		if (typeof value1 == 'number') value1 -= value1 % step;
		if (typeof value2 == 'number') value2 -= value2 % step;
		for (var i=opts.min; i<=opts.max; i+=step) {
			list1.push('<option value="'+i+'"'+(value1==i?' selected':'')+'>'+i+'</option>');
			list2.push('<option value="'+i+'"'+(value2==i?' selected':'')+'>'+i+'</option>');
		}
		list1.unshift('<option value="None"'+(value1=='None'?' selected':'')+'>None</option>');
		list2.push('<option value="All"'+(value2=='All'?' selected':'')+'>All</option>');
		$(this.show).append('<div style="clear:both"><span style="float:left;">'+label+'</span><span style="float:right;text-align:right">'+opts.before+'<select id="'+id+'_min">'+list1.join('')+'</select> '+opts.between+' <select id="'+id+'_max">'+list2.join('')+'</select>'+opts.after+'</span></div>');
		return id;
	};
	this.general = function(id,label,options) {
		var id = PREFIX + this.name + '_' + id;
		var label = label.replace(' ','&nbsp;');
		$(this.show).append('<div style="clear:both"><span style="float:left;">'+label+'</span><span style="float:right;"><select id="'+id+'" class="golem_generals" alt="'+options+'"></select></span></div>');
	};
	this.div = function(id,text) {
		var id = PREFIX + this.name + '_' + id;
		$(this.show).append('<div id="'+id+'" style="clear:both">'+text+'<br /><br /></div>');
		return id;
	};
	this.info = function(text,id,label) {
		if (id && label) {
			var id = PREFIX + this.name + '_' + id;
			var label = label.replace(' ','&nbsp;');
			$(this.show).append('<div style="clear:both"><span style="float:left;">'+label+'</span><span style="float:right;" id="'+id+'">'+text+'</span></div>');
			return id;
		} else {
			$(this.show).append('<div style="clear:both">'+text+'<br /><br /></div>');
		}
	};
}

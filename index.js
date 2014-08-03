module.exports = {
	RuleBefore: function (rule) {
		var prefix = rule.children('Selector').length > 1 ? ':matches(' + rule.selector + ')' : rule.selector;
		var index = rule.index();

		rule.children('Rule').forEach(function (child, i) {
			var selector = child.selector;
			var space = ' ';

			if (selector[0] === '&') {
				space = '';
				selector = selector.substr(1);
			}

			child.selector = prefix + space + (child.children('Selector').length > 1 ? ':matches(' + selector + ')' : selector);
			rule.parent.add(child, index + i, true);
		});
	}
};

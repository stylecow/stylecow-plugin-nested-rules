module.exports = function (stylecow) {
	return {
		Rule: function (rule) {
			var ruleSelectors = rule.children('Selector');
			var index = rule.index();

			rule.children('Rule').forEach(function (child, i) {
				child.children('Selector').forEach(function (childSelector) {
					var space = ' ';

					if (childSelector.name[0] === '&') {
						childSelector.name = childSelector.name.substr(1);
						space = '';
					}

					ruleSelectors.forEach(function (ruleSelector) {
						var selector = stylecow.css.Selector.create(ruleSelector.name + space + childSelector.name);
						child.add(selector);
					});

					childSelector.detach();
				});

				rule.parent.add(child, index + i, true);
			});
		}
	}
};

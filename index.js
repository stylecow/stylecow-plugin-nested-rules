module.exports = function (stylecow) {
	return {
		Rule: function (rule) {
			var ruleSelectors = rule.children('Selector');
			var index = rule.index();

			rule.children('Rule').forEach(function (child, i) {
				child.children('Selector').forEach(function (childSelector) {
					var space = ' ';
					var prepend = false;

					if (childSelector.name[0] === '&') {
						childSelector.name = childSelector.name.substr(1);
						space = '';

						if (/^\w/.test(childSelector.name)) {
							prepend = true;
						}
					}

					ruleSelectors.forEach(function (ruleSelector) {
						var code;

						if (prepend) {
							var content = ruleSelector.content;

							code = content.slice(0, -1);
							code.push(childSelector[0].name);
							code.push(content.slice(-1));
							code = code.concat(childSelector.slice(1)).join('');
						} else {
							code = ruleSelector.name + space + childSelector.name;
						}

						child.add(stylecow.css.Selector.create(code));
					});

					childSelector.detach();
				});

				rule.parent.add(child, index + i, true);
			});

			if (rule.children('Selector').length === rule.length) {
				rule.remove();
			}
		}
	}
};

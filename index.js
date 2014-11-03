module.exports = function (stylecow) {

	var operators = ['>', '~', '+'];

	stylecow.addTask({
		Rule: function (rule) {
			var ruleSelectors = rule.children({type: 'Selector'});
			var index = rule.index();

			var i = 0;

			rule.children({type: 'Rule'}).forEach(function (child) {
				child.children({type: 'Selector'}).forEach(function (childSelector) {
					var prepend;

					if (childSelector[0].name === '&') {
						childSelector[0].remove();
						prepend = /^\w/.test(childSelector[0].name);
					} else if (operators.indexOf(childSelector[0].name) === -1) {
						childSelector.unshift(new stylecow.Keyword(' '));
					}

					ruleSelectors.forEach(function (ruleSelector) {
						var selector = child.add(new stylecow.Selector);

						if (prepend) {
							ruleSelector.slice(0, -1).forEach(function (child) {
								selector.push(child.clone());
							});

							childSelector.slice(0, 1).forEach(function (child) {
								selector.push(child.clone());
							});

							ruleSelector.slice(-1).forEach(function (child) {
								selector.push(child.clone());
							});

							childSelector.slice(1).forEach(function (child) {
								selector.push(child.clone());
							});
						} else {
							ruleSelector.forEach(function (child) {
								selector.push(child.clone());
							});

							childSelector.forEach(function (child) {
								selector.push(child.clone());
							});
						}
					});

					childSelector.remove();
				});

				var prev = child.prev();

				rule.parent().add(child, index + i + 1);

				if (prev.type === 'Comment') {
					child.before(prev);
					++i;
				}

				++i;
			});

			if (rule.children({type: 'Selector'}).length === rule.length) {
				rule.remove();
			}
		}
	});
};

module.exports = function (stylecow) {

	stylecow.addTask({
		Rule: function (parentRule) {
			var parentSelectors = parentRule.firstChild({type: 'Selectors'});
			var index = parentRule.index();
			var offset = 1;

			parentRule
				.firstChild({type: 'Block'})
				.children({type: 'Rule'})
				.forEach(function (rule) {
					var selectors = rule.firstChild({type: 'Selectors'});
					var mergedSelectors = new stylecow.Selectors();

					parentSelectors.forEach(function (parentSelector) {
						selectors.forEach(function (selector) {
							var mergedSelector = parentSelector.clone();

							merge(mergedSelector, selector[0].clone());

							selector.slice(1).forEach(function (element) {
								mergedSelector.push(element.clone());
							});

							mergedSelectors.push(mergedSelector);
						});
					});

					selectors.replaceWith(mergedSelectors);

					parentRule.parent().splice(index + offset, 0, rule);
					++offset;
				});

			if (!parentRule.firstChild({type: 'Block'}).length) {
				parentRule.remove();
			}
		}
	});

	function merge (selector, element) {
		if (element[0].name !== '&') {
			return selector.push(element);
		}

		element[0].remove();

		if (element.length) {
			var prevElement = selector.slice(-1)[0];
			var curr = element[0];

			if (curr.is({
				type: 'Keyword',
				name: /^\w/
			})) {
				prevElement.unshift(curr);
			} else {
				prevElement.push(curr);
			}
		}
	}
};

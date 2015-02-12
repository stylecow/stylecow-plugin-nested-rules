module.exports = function (stylecow) {

	stylecow.addTask({
		filter: {
			type: 'Rule'
		},
		fn: function (parentRule) {
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
							mergedSelectors.push(merge(parentSelector.clone(), selector.clone()));
						});
					});

					selectors.replaceWith(mergedSelectors);

					parentRule.parent().splice(index + offset, 0, rule);
					++offset;
				});

			if (!parentRule.firstChild('Block').length) {
				parentRule.remove();
			}
		}
	});

	function merge (selector, appendedSelector) {
		var firstElement = appendedSelector.shift();

		// html { .foo {  => html .foo
		if (firstElement.type !== 'Combinator') {
			var separator = new stylecow.Combinator();
			separator.name = ' ';
			selector.push(separator);
			selector.push(firstElement);
		}
		
		// html { >.foo {  => html>.foo
		else if (firstElement.name !== '&') {
			selector.push(firstElement);
		}

		// .foo { &html {  => html.foo
		else if (appendedSelector.length && (appendedSelector[0].is({
			type: 'Keyword',
			name: /^\w/
		}))) {
			firstElement = appendedSelector.shift();

			var combinators = selector.children('Combinator');

			if (combinators.length) {
				combinators.pop().after(firstElement);
			} else {
				selector.unshift(firstElement);
			}
		}

		while (appendedSelector[0]) {
			selector.push(appendedSelector[0]);
		}

		return selector;
	}
};

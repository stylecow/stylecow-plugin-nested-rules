module.exports = function (stylecow) {

	stylecow.addTask({
		filter: {
			type: 'Rule'
		},
		fn: function (parentRule) {

			// resolve nested @media
			parentRule
				.firstChild({type: 'Block'})
				.children({
					type: 'AtRule',
					name: 'media'
				})
				.forEach(function (media) {
					nestedMedia(parentRule, media);
				});

			// resolve nested rules
			var index = parentRule.index();
			var offset = 1;

			parentRule
				.firstChild({type: 'Block'})
				.children('Rule')
				.forEach(function (child) {
					nestedRule(parentRule, child, index + offset);
					++offset;
				});

			if (!parentRule.firstChild('Block').length) {
				parentRule.remove();
			}
		}
	});

	function nestedMedia(parentRule, media) {
		var rule = new stylecow.Rule();

		rule.push(parentRule.firstChild('Selectors').clone());
		rule.push(media.firstChild('Block'));

		var block = new stylecow.Block();
		block.push(rule);

		media.push(block);

		parentRule.after(media);
	}

	function nestedRule(parentRule, rule, parentRuleIndex) {
		var selectors = rule.firstChild({type: 'Selectors'});
		var mergedSelectors = new stylecow.Selectors();

		parentRule
			.firstChild({type: 'Selectors'})
			.forEach(function (parentSelector) {
				selectors.forEach(function (selector) {
					mergedSelectors.push(merge(parentSelector.clone(), selector.clone()));
				});
			});

		selectors.replaceWith(mergedSelectors);
		parentRule.parent().splice(parentRuleIndex, 0, rule);
	}

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

module.exports = function (stylecow) {

	stylecow.addTask({
		filter: {
			type: 'Rule'
		},
		fn: function (parentRule) {
			var index = parentRule.index();
			var offset = 1;

			parentRule
				.getChild('Block')
				.getChildren()
				.forEach(function (child) {

					// resolve nested @media
					if (child.type === 'AtRule' && child.name === 'media') {
						nestedMedia(parentRule, child, index + offset);
						++offset;
					}

					// resolve nested rules
					else if (child.type === 'Rule') {
						nestedRule(parentRule, child, index + offset);
						++offset;
					}
				});

			if (!parentRule.getChild('Block').length) {
				parentRule.remove();
			}
		}
	});

	function nestedMedia(parentRule, media, parentRuleIndex) {
		var rule = new stylecow.Rule();

		rule.push(parentRule.getChild('Selectors').clone());
		rule.push(media.getChild('Block'));

		var block = new stylecow.Block();
		block.push(rule);
		media.push(block);

		var index = rule.index();
		var offset = 1;

		rule
			.getChild('Block')
			.getChildren('Rule')
			.forEach(function (child) {
				nestedRule(rule, child, index + offset);
				++offset;
			});

		if (rule.getChild('Block').length === 0) {
			rule.remove();
		}

		parentRule.getParent().splice(parentRuleIndex, 0, media);
	}

	function nestedRule(parentRule, rule, parentRuleIndex) {
		var selectors = rule.getChild('Selectors');
		var mergedSelectors = new stylecow.Selectors();

		parentRule
			.getChild('Selectors')
			.forEach(function (parentSelector) {
				selectors.forEach(function (selector) {
					mergedSelectors.push(merge(parentSelector.clone(), selector.clone()));
				});
			});

		selectors.replaceWith(mergedSelectors);
		parentRule.getParent().splice(parentRuleIndex, 0, rule);
	}

	function merge (selector, appendedSelector) {
		var joinCombinator = appendedSelector.getChild({
			type: 'Combinator',
			name: '&'
		});

		if (!joinCombinator) {
			if (appendedSelector[0].type !== 'Combinator') {
				appendedSelector.unshift((new stylecow.Combinator()).setName(' '));
			}
			joinCombinator = (new stylecow.Combinator()).setName('&');
			appendedSelector.unshift(joinCombinator);
		}

		//resolve .foo&html => html.foo
		var next = joinCombinator.next();

		if (next && next.is('TypeSelector')) {
			var combinators = selector.getChildren('Combinator');

			if (combinators.length) {
				combinators.pop().after(next);
			} else {
				selector.unshift(next);
			}
		}

		while (selector[0]) {
			joinCombinator.before(selector.shift());
		}

		joinCombinator.remove();

		return appendedSelector;
	}
};

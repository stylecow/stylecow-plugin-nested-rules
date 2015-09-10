"use strict";

module.exports = function (tasks, stylecow) {

	tasks.addTask({
		filter: 'Rule',
		fn: function (parentRule) {
			var index = parentRule.index(), offset = 1;

			parentRule
				.getChild('Block')
				.getChildren()
				.forEach(function (child) {
					// resolve nested @media
					if (child.type === 'AtRule' && child.name === 'media') {
						nestedRuleMedia(parentRule, child, index + offset);
						++offset;
					}

					// resolve nested rules
					else if (child.type === 'Rule') {
						nestedRule(parentRule, child, index + offset);
						++offset;
					}
				});

			//remove the rule if it's empty
			if (!parentRule.getChild('Block').length) {
				parentRule.remove();
			}
		}
	});

	//Merge nested @media
	tasks.addTask({
		filter: {
			type: 'AtRule',
			name: 'media'
		},
		fn: function (parentMedia) {
			var index = parentMedia.index(), offset = 1;

			parentMedia
				.getChild('Block')
				.getChildren({
					type: 'AtRule',
					name: 'media'
				})
				.forEach(function (child) {
					nestedMedia(parentMedia, child, index + offset);
				});
		}
	});

	function nestedRuleMedia(parentRule, media, parentRuleIndex) {
		var rule = new stylecow.Rule();

		rule.push(parentRule.getChild('Selectors').clone());
		rule.push(media.getChild('Block'));

		var block = new stylecow.Block();
		block.push(rule);
		media.push(block);

		var index = rule.index(), offset = 1;

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

	function nestedMedia(parentMedia, media, parentMediaIndex) {
		var mediaQueries = media.getChild('MediaQueries'),
			mergedMediaQueries = new stylecow.MediaQueries();

		parentMedia
			.getChild('MediaQueries')
			.forEach(function (parentMediaQuery) {
				mediaQueries.forEach(function (mediaQuery) {
					mergedMediaQueries.push(mergeMediaQuery(parentMediaQuery.clone(), mediaQuery.clone()));
				});
			});

		mediaQueries.replaceWith(mergedMediaQueries);
		parentMedia.getParent().splice(parentMediaIndex, 0, media);
	}

	function nestedRule(parentRule, rule, parentRuleIndex) {
		var selectors = rule.getChild('Selectors'),
			mergedSelectors = new stylecow.Selectors();

		parentRule
			.getChild('Selectors')
			.forEach(function (parentSelector) {
				selectors.forEach(function (selector) {
					mergedSelectors.push(mergeSelector(parentSelector.clone(), selector.clone()));
				});
			});

		selectors.replaceWith(mergedSelectors);
		parentRule.getParent().splice(parentRuleIndex, 0, rule);
	}

	function mergeSelector (selector, appendedSelector) {
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

	function mergeMediaQuery (mediaQueries, appendedMediaQuery) {
		mediaQueries.push((new stylecow.Keyword()).setName('and'));

		if ((appendedMediaQuery.length === 1) && (appendedMediaQuery[0].type === 'ConditionalExpression')) {
			mediaQueries.push(appendedMediaQuery[0]);

			return mediaQueries;
		}

		var expression = new stylecow.ConditionalExpression();

		while (appendedMediaQuery[0]) {
			expression.push(appendedMediaQuery.shift());
		}

		mediaQueries.push(expression);

		return mediaQueries;
	}
};

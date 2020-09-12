import Block from "https://deno.land/x/stylecow_core/css/block.js";
import Rule from "https://deno.land/x/stylecow_core/css/rule.js";
import MediaQueries from "https://deno.land/x/stylecow_core/css/media-queries.js";
import Keyword from "https://deno.land/x/stylecow_core/css/keyword.js";
import ConditionalExpression from "https://deno.land/x/stylecow_core/css/conditional-expression.js";
import Selectors from "https://deno.land/x/stylecow_core/css/selectors.js";
import Combinator from "https://deno.land/x/stylecow_core/css/combinator.js";

export default function (tasks) {
  //Merge nested rules
  tasks.addTask({
    filter: "Rule",
    fn: resolveNested,
  });

  //Merge nested @nest
  tasks.addTask({
    filter: {
      type: "AtRule",
      name: "nest",
    },
    fn: resolveNested,
  });

  //Merge nested @media
  tasks.addTask({
    filter: {
      type: "AtRule",
      name: "media",
    },
    fn: function (parentMedia) {
      const index = parentMedia.index(), offset = 1;

      parentMedia
        .getChild("Block")
        .getChildren({
          type: "AtRule",
          name: "media",
        })
        .forEach((child) => nestedMedia(parentMedia, child, index + offset));
    },
  });
}

function resolveNested(parentRule) {
  const index = parentRule.index();
  let offset = 1;

  parentRule
    .getChild("Block")
    .getChildren()
    .forEach(function (child) {
      if (child.type === "AtRule") {
        // resolve nested @media
        if (child.name === "media") {
          nestedRuleMedia(parentRule, child, index + offset);
          ++offset;
        } // resolve @nested at-rules
        else if (child.name === "nest") {
          nestedRule(parentRule, child, index + offset);
          ++offset;
        }
      } // resolve nested rules
      else if (child.type === "Rule") {
        nestedRule(parentRule, child, index + offset);
        ++offset;
      }
    });

  //remove the rule if it's empty
  if (!parentRule.getChild("Block").length) {
    parentRule.remove();
  }
}

function nestedRuleMedia(parentRule, media, parentRuleIndex) {
  const rule = new Rule();

  rule.push(parentRule.getChild("Selectors").clone());
  rule.push(media.getChild("Block"));

  const block = new Block();
  block.push(rule);
  media.push(block);

  const index = rule.index();
  let offset = 1;

  rule
    .getChild("Block")
    .getChildren("Rule")
    .forEach(function (child) {
      nestedRule(rule, child, index + offset);
      ++offset;
    });

  if (rule.getChild("Block").length === 0) {
    rule.remove();
  }

  parentRule.getParent().splice(parentRuleIndex, 0, media);
}

function nestedMedia(parentMedia, media, parentMediaIndex) {
  const mediaQueries = media.getChild("MediaQueries");
  const mergedMediaQueries = new MediaQueries();

  parentMedia
    .getChild("MediaQueries")
    .forEach(function (parentMediaQuery) {
      mediaQueries.forEach(function (mediaQuery) {
        mergedMediaQueries.push(
          mergeMediaQuery(parentMediaQuery.clone(), mediaQuery.clone()),
        );
      });
    });

  mediaQueries.replaceWith(mergedMediaQueries);
  parentMedia.getParent().splice(parentMediaIndex, 0, media);
}

function nestedRule(parentRule, rule, parentRuleIndex) {
  const selectors = rule.getChild("Selectors");
  const mergedSelectors = new Selectors();

  parentRule
    .getChild("Selectors")
    .forEach(function (parentSelector) {
      selectors.forEach(function (selector) {
        mergedSelectors.push(
          mergeSelector(parentSelector.clone(), selector.clone()),
        );
      });
    });

  selectors.replaceWith(mergedSelectors);

  //@nest
  if (rule.type === "AtRule") {
    const tmpRule = new Rule();

    while (rule.length) {
      tmpRule.push(rule.shift());
    }

    rule.remove();
    rule = tmpRule;
  }

  parentRule.getParent().splice(parentRuleIndex, 0, rule);
}

function mergeSelector(selector, appendedSelector) {
  let joinCombinator = appendedSelector.get({
    type: "Combinator",
    name: "&",
  });

  if (!joinCombinator) {
    if (appendedSelector[0].type !== "Combinator") {
      appendedSelector.unshift(new Combinator().setName(" "));
    }

    joinCombinator = new Combinator().setName("&");
    appendedSelector.unshift(joinCombinator);
  }

  //resolve .foo&html => html.foo
  const next = joinCombinator.next();

  if (next && next.is("TypeSelector")) {
    const combinators = selector.getChildren("Combinator");

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

function mergeMediaQuery(mediaQueries, appendedMediaQuery) {
  mediaQueries.push(new Keyword().setName("and"));

  if (
    (appendedMediaQuery.length === 1) &&
    (appendedMediaQuery[0].type === "ConditionalExpression")
  ) {
    mediaQueries.push(appendedMediaQuery[0]);

    return mediaQueries;
  }

  const expression = new ConditionalExpression();

  while (appendedMediaQuery[0]) {
    expression.push(appendedMediaQuery.shift());
  }

  mediaQueries.push(expression);

  return mediaQueries;
}

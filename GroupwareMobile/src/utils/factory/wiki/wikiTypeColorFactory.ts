import {WikiType, RuleCategory} from '../../../types';
import {allPostalColor, knowledgeColor, qaColor, ruleColor} from '../../colors';

export const wikiTypeColorFactory = (
  wikiType: WikiType,
  ruleCategory?: RuleCategory,
) => {
  switch (wikiType) {
    case WikiType.QA:
      return qaColor;
    case WikiType.KNOWLEDGE:
      return knowledgeColor;
    case WikiType.ALL_POSTAL:
      return allPostalColor;
    case WikiType.RULES:
      // NOTE: 以下はWebでは分けられてなかったので、のちに併せて実装してください。
      switch (ruleCategory) {
        case RuleCategory.RULES:
          return ruleColor;
        case RuleCategory.ABC:
          return ruleColor;
        case RuleCategory.PHILOSOPHY:
          return ruleColor;
        case RuleCategory.BENEFITS:
          return ruleColor;
        case RuleCategory.DOCUMENT:
          return ruleColor;
        default:
          return ruleColor;
      }
  }
};

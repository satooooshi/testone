import {WikiType, RuleCategory} from '../../../types';

export const wikiTypeNameFactory = (
  wikiType: WikiType,
  ruleCategory?: RuleCategory,
) => {
  switch (wikiType) {
    case WikiType.QA:
      return '質問';
    case WikiType.KNOWLEDGE:
      return 'ナレッジ';
    case WikiType.RULES:
      switch (ruleCategory) {
        case RuleCategory.RULES:
          return '社内規則';
        case RuleCategory.ABC:
          return 'ABC制度';
        case RuleCategory.PHILOSOPHY:
          return '会社理念';
        case RuleCategory.BENEFITS:
          return '福利厚生等';
        case RuleCategory.DOCUMENT:
          return '各種申請書';
        default:
          return '社内規則';
      }
  }
};

import {WikiType, RuleCategory} from '../../../types';

export const wikiTypeNameFactory = (
  wikiType: WikiType,
  ruleCategory?: RuleCategory,
  nested?: boolean,
) => {
  switch (wikiType) {
    case WikiType.QA:
      return 'Q&A';
    case WikiType.KNOWLEDGE:
      return 'ナレッジ';
    case WikiType.ALL_POSTAL:
      return 'オール便';
    case WikiType.RULES:
      if (nested) {
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
      } else {
        return '社内規則';
      }
  }
};

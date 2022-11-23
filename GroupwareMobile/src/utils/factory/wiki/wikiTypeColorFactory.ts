import {interviewColor} from './../../colors/index';
import {WikiType, RuleCategory} from '../../../types';
import {
  allPostalColor,
  ruleColor,
  boardColor,
  mailMagazineColor,
} from '../../colors';

export const wikiTypeColorFactory = (
  wikiType: WikiType,
  ruleCategory?: RuleCategory,
  // boardCategory?: BoardCategory,
) => {
  switch (wikiType) {
    case WikiType.BOARD:
      return boardColor;
    case WikiType.ALL_POSTAL:
      return allPostalColor;
    case WikiType.MAIL_MAGAZINE:
      return mailMagazineColor;
    case WikiType.INTERVIEW:
      return interviewColor;
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

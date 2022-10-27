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
    // switch (boardCategory) {
    // case BoardCategory.KNOWLEDGE:
    //   return knowledgeColor;
    // case BoardCategory.QA:
    //   return qaColor;
    // case BoardCategory.NEWS:
    //   return ruleColor;
    // case BoardCategory.IMPRESSIVE_UNIVERSITY:
    //   return ruleColor;
    // case BoardCategory.STUDY_MEETING:
    //   return ruleColor;
    // case BoardCategory.SELF_IMPROVEMENT:
    //   return ruleColor;
    // case BoardCategory.PERSONAL_ANNOUNCEMENT:
    //   return ruleColor;
    // case BoardCategory.CELEBRATION:
    //   return ruleColor;
    // case BoardCategory.CLUB:
    //   return clubColor;
    // case BoardCategory.OTHER:
    //   return ruleColor;
    //   default:
    //     return boardColor;
    // }
    case WikiType.ALL_POSTAL:
      return allPostalColor;
    case WikiType.MAIL_MAGAZINE:
      return mailMagazineColor;
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

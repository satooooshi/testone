import {WikiType, RuleCategory, BoardCategory} from '../../../types';

export const wikiTypeNameFactory = (
  wikiType?: WikiType,
  ruleCategory?: RuleCategory,
  nested?: boolean,
  boardCategory?: BoardCategory,
) => {
  switch (wikiType) {
    case WikiType.BOARD:
      if (nested) {
        switch (boardCategory) {
          case BoardCategory.KNOWLEDGE:
            return 'ファン募集';
          // case BoardCategory.QA:
          //   return 'Q&A';
          case BoardCategory.NEWS:
            return 'イベント情報';
          // case BoardCategory.IMPRESSIVE_UNIVERSITY:
          //   return '感動大学';
          case BoardCategory.CLUB:
            return '活動報告';
          // case BoardCategory.STUDY_MEETING:
          //   return '勉強会';
          case BoardCategory.SELF_IMPROVEMENT:
            return 'ファンリターン';
          // case BoardCategory.PERSONAL_ANNOUNCEMENT:
          //   return '個人告知';
          // case BoardCategory.CELEBRATION:
          //   return 'お祝い事';
          case BoardCategory.OTHER:
            return 'その他';
          default:
            return 'All';
        }
      } else {
        return '掲示板';
      }
    case WikiType.ALL_POSTAL:
      return '運営からのお知らせ';
    // case WikiType.RULES:
    //   if (nested) {
    //     switch (ruleCategory) {
    //       case RuleCategory.RULES:
    //         return '社内規則';
    //       // case RuleCategory.ABC:
    //       //   return 'ABC制度';
    //       case RuleCategory.PHILOSOPHY:
    //         return '会社理念';
    //       case RuleCategory.BENEFITS:
    //         return '福利厚生等';
    //       case RuleCategory.DOCUMENT:
    //         return '各種申請書';
    //       default:
    //         return '社内規則';
    //     }
    //   } else {
    //     return '社内規則';
    //   }
    default:
      return '';
  }
};

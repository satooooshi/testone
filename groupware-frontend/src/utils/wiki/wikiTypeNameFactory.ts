import { WikiType, RuleCategory, BoardCategory } from 'src/types';

export const wikiTypeNameFactory = (
  wikiType: WikiType,
  ruleCategory?: RuleCategory,
  nested?: boolean,
  boardCategory?: BoardCategory,
) => {
  switch (wikiType) {
    case WikiType.BOARD:
      if (nested) {
        switch (boardCategory) {
          case BoardCategory.KNOWLEDGE:
            return 'ナレッジ';
          case BoardCategory.QA:
            return 'Q&A';
          case BoardCategory.NEWS:
            return '本社からのお知らせ';
          case BoardCategory.IMPRESSIVE_UNIVERSITY:
            return '感動大学';
          case BoardCategory.CLUB:
            return '部活動・サークル';
          case BoardCategory.STUDY_MEETING:
            return '勉強会';
          case BoardCategory.SELF_IMPROVEMENT:
            return '自己研鑽';
          case BoardCategory.PERSONAL_ANNOUNCEMENT:
            return '個人告知';
          case BoardCategory.CELEBRATION:
            return 'お祝い事';
          case BoardCategory.OTHER:
            return 'その他';
          default:
            return '掲示板';
        }
      } else {
        return '掲示板';
      }
    case WikiType.ALL_POSTAL:
      return 'オール便';
    case WikiType.MAIL_MAGAZINE:
      return 'メルマガ';
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

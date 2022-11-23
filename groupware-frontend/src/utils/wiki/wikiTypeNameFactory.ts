import { WikiType, RuleCategory, BoardCategory } from 'src/types';

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

export const getWikiCategoryList = (wikiType?: WikiType) => {
  switch (wikiType) {
    case WikiType.BOARD:
      return [
        'All',
        'ファン募集',
        // 'Q&A',
        'イベント情報',
        // '感動大学',
        '活動報告',
        // '勉強会',
        'ファンリターン',
        // '個人告知',
        // 'お祝い事',
        'その他',
      ];
    // case WikiType.RULES:
    //   return ['社内規則', '会社理念', '福利厚生等', '各種申請書'];
  }
};

export const getBoardCategory = (name: string) => {
  switch (name) {
    case 'ファン募集':
      return BoardCategory.KNOWLEDGE;
    // case 'Q&A':
    //   return BoardCategory.QA;
    case 'イベント情報':
      return BoardCategory.NEWS;
    case '活動報告':
      return BoardCategory.CLUB;
      // case '勉強会':
      return BoardCategory.STUDY_MEETING;
    case 'ファンリターン':
      return BoardCategory.SELF_IMPROVEMENT;
    // case '個人告知':
    //   return BoardCategory.PERSONAL_ANNOUNCEMENT;
    // case 'お祝い事':
    //   return BoardCategory.CELEBRATION;
    case 'その他':
      return BoardCategory.OTHER;
  }
};

export const getRuleCategory = (name: string) => {
  switch (name) {
    case '社内規則':
      return RuleCategory.RULES;
    // case 'ABC制度':
    //   return RuleCategory.ABC;
    case '会社理念':
      return RuleCategory.PHILOSOPHY;
    case '福利厚生等':
      return RuleCategory.BENEFITS;
    case '各種申請書':
      return RuleCategory.DOCUMENT;
    default:
      return undefined;
  }
};

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
            return 'All';
        }
      } else {
        return '掲示板';
      }
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
    default:
      return '';
  }
};

export const getWikiCategoryList = (wikiType?: WikiType) => {
  switch (wikiType) {
    case WikiType.BOARD:
      return [
        'All',
        'ナレッジ',
        'Q&A',
        '本社からのお知らせ',
        '感動大学',
        '部活動・サークル',
        '勉強会',
        '自己研鑽',
        '個人告知',
        'お祝い事',
        'その他',
      ];
    case WikiType.RULES:
      return ['社内規則', 'ABC制度', '会社理念', '福利厚生等', '各種申請書'];
    default:
      return [''];
  }
};

export const getBoardCategory = (name: string) => {
  switch (name) {
    case 'ナレッジ':
      return BoardCategory.KNOWLEDGE;
    case 'Q&A':
      return BoardCategory.QA;
    case '本社からのお知らせ':
      return BoardCategory.NEWS;
    case '感動大学':
      return BoardCategory.IMPRESSIVE_UNIVERSITY;
    case '部活動・サークル':
      return BoardCategory.CLUB;
    case '勉強会':
      return BoardCategory.STUDY_MEETING;
    case '自己研鑽':
      return BoardCategory.SELF_IMPROVEMENT;
    case '個人告知':
      return BoardCategory.PERSONAL_ANNOUNCEMENT;
    case 'お祝い事':
      return BoardCategory.CELEBRATION;
    case 'その他':
      return BoardCategory.OTHER;
  }
};

export const getRuleCategory = (name: string) => {
  switch (name) {
    case '社内規則':
      return RuleCategory.RULES;
    case 'ABC制度':
      return RuleCategory.ABC;
    case '会社理念':
      return RuleCategory.PHILOSOPHY;
    case '福利厚生等':
      return RuleCategory.BENEFITS;
    case '各種申請書':
      return RuleCategory.DOCUMENT;
  }
};

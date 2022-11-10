import {
  BoardCategory,
  RuleCategory,
  User,
  UserRole,
  Wiki,
  WikiType,
} from '../../../types';

type Context = {
  type: WikiType;
  boardCategory?: BoardCategory;
  ruleCategory?: RuleCategory;
  userRole?: UserRole;
};

export const isCreatableWiki = (context: Context): boolean => {
  const userRole = context?.userRole;
  switch (context.type) {
    case WikiType.BOARD:
      if (context?.boardCategory) {
        switch (context?.boardCategory) {
          case BoardCategory.KNOWLEDGE:
            return true;
          case BoardCategory.QA:
            return true;
          case BoardCategory.NEWS:
            return userRole === UserRole.ADMIN;
          case BoardCategory.IMPRESSIVE_UNIVERSITY:
            return userRole === UserRole.ADMIN;
          case BoardCategory.CLUB:
            return true;
          case BoardCategory.STUDY_MEETING:
            return userRole === UserRole.ADMIN;
          case BoardCategory.SELF_IMPROVEMENT:
            return true;
          case BoardCategory.PERSONAL_ANNOUNCEMENT:
            return true;
          case BoardCategory.CELEBRATION:
            return userRole === UserRole.ADMIN;
          case BoardCategory.OTHER:
            return true;
        }
      }
      return false;
    case WikiType.ALL_POSTAL:
      return userRole === UserRole.ADMIN;
    case WikiType.MAIL_MAGAZINE:
      return userRole === UserRole.ADMIN;
    case WikiType.INTERVIEW:
      return userRole === UserRole.ADMIN;
    case WikiType.RULES:
      return userRole === UserRole.ADMIN;
  }
};

export const isWikiAuthor = (event: Wiki, targetUser?: Partial<User>) => {
  if (event.writer?.id === targetUser?.id) {
    return true;
  }
  return false;
};

export const isEditableWiki = (wiki: Wiki, targetUser?: Partial<User>) => {
  return (
    isWikiAuthor(wiki, targetUser) ||
    isCreatableWiki({
      type: wiki.type,
      boardCategory: wiki.boardCategory,
      userRole: targetUser?.role,
    })
  );
};

import {
  WikiType,
  BoardCategory,
  RuleCategory,
  UserRole,
  Wiki,
  User,
} from 'src/types';

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
            return (
              userRole === UserRole.ADMIN || userRole === UserRole.INFLUENCER
            );
          case BoardCategory.QA:
            return true;
          case BoardCategory.NEWS:
            return userRole === UserRole.ADMIN;
          case BoardCategory.CLUB:
            return (
              userRole === UserRole.ADMIN || userRole === UserRole.INFLUENCER
            );
          // case BoardCategory.STUDY_MEETING:
          //   return userRole === UserRole.ADMIN;
          case BoardCategory.SELF_IMPROVEMENT:
            return (
              userRole === UserRole.ADMIN || userRole === UserRole.INFLUENCER
            );
          // case BoardCategory.PERSONAL_ANNOUNCEMENT:
          //   return true;
          // case BoardCategory.CELEBRATION:
          //   return userRole === UserRole.ADMIN;
          case BoardCategory.OTHER:
            return true;
        }
      }
      return false;
    case WikiType.ALL_POSTAL:
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
  return isWikiAuthor(wiki, targetUser);
};

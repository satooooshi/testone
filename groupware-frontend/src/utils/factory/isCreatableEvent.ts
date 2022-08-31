import { EventType, UserRole, EventSchedule, User } from 'src/types';

export const isCreatableEvent = (
  type: EventType,
  userRole?: UserRole,
): boolean => {
  switch (type) {
    case EventType.IMPRESSIVE_UNIVERSITY:
      return userRole === UserRole.ADMIN;
    case EventType.BOLDAY:
      return userRole === UserRole.ADMIN;
    case EventType.STUDY_MEETING:
      return (
        userRole === UserRole.ADMIN || userRole === UserRole.INTERNAL_INSTRUCTOR
      );
    case EventType.COACH:
      return userRole === UserRole.ADMIN || userRole === UserRole.COACH;
    case EventType.CLUB:
      return (
        userRole === UserRole.ADMIN ||
        userRole === UserRole.INTERNAL_INSTRUCTOR ||
        userRole === UserRole.COMMON
      );
    case EventType.SUBMISSION_ETC:
      return userRole === UserRole.ADMIN;
  }
};

export const isEventAuthor = (
  event: EventSchedule,
  targetUser?: Partial<User>,
) => {
  if (event.author?.id === targetUser?.id) {
    return true;
  }
  return false;
};

export const isEditableEvent = (
  event: EventSchedule,
  targetUser?: Partial<User>,
) => {
  return (
    isEventAuthor(event, targetUser) ||
    isCreatableEvent(event.type, targetUser?.role)
  );
};

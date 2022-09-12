import {AttendanceCategory} from '../../../types';

export const isDisplayableWorkingTime = (
  category: AttendanceCategory,
): boolean => {
  switch (category) {
    case AttendanceCategory.PAILD_ABSENCE:
    case AttendanceCategory.TRANSFER_HOLIDAY:
    case AttendanceCategory.ABSENCE:
    case AttendanceCategory.HOLIDAY:
      return false;
    default:
      return true;
  }
};

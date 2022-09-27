import { AttendanceCategory } from 'src/types';

export const attendanceCategoryName = (
  category: AttendanceCategory,
): string => {
  switch (category) {
    case AttendanceCategory.COMMON:
      return '通常';
    case AttendanceCategory.PAILD_ABSENCE:
      return '欠勤有給';
    case AttendanceCategory.LATE:
      return '遅刻';
    case AttendanceCategory.TRAINDELAY:
      return '電車遅延';
    case AttendanceCategory.EARLY_LEAVING:
      return '早退';
    case AttendanceCategory.LATE_AND_EARY_LEAVING:
      return '遅刻かつ早退';
    case AttendanceCategory.HOLIDAY:
      return '有給などの休日';
    case AttendanceCategory.HOLIDAY_WORK:
      return '休日出勤';
    case AttendanceCategory.TRANSFER_HOLIDAY:
      return '振替休日';
    case AttendanceCategory.GOOUT:
      return '外出';
    case AttendanceCategory.SHIFTWORK:
      return 'シフト';
    case AttendanceCategory.ABSENCE:
      return '欠勤';
    case AttendanceCategory.HALF_HOLIDAY:
      return '半休';
  }
};

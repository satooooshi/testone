import {AttendanceReason} from '../../../types';

export const attendanceReasonName = (Reason: AttendanceReason): string => {
  switch (Reason) {
    case AttendanceReason.PRIVATE:
      return '私用';
    case AttendanceReason.SICK:
      return '体調不良';
    case AttendanceReason.HOUSEWORK:
      return '家事都合';
    case AttendanceReason.HOLIDAY:
      return '有給休暇';
    case AttendanceReason.CONDOLENCE:
      return '慶弔';
    case AttendanceReason.SITE:
      return '現場都合';
    case AttendanceReason.DISASTER:
      return '災害';
    case AttendanceReason.MEETING:
      return '面談';
    case AttendanceReason.BIRTHDAY:
      return 'バースデー';
    case AttendanceReason.MORNING_OFF:
      return '午前半休';
    case AttendanceReason.AFTERNOON_OFF:
      return '午後半休';
    case AttendanceReason.LATE_OFF:
      return '遅刻半休';
    case AttendanceReason.EARLY_LEAVING_OFF:
      return '早退半休';
  }
};

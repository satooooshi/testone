import dayjs from 'dayjs';

export type WeekNum = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export function getDatesInWeek(
  date: Date | dayjs.Dayjs = new Date(),
  weekStartsOn: WeekNum = 0,
  locale = 'ja',
) {
  const subject = dayjs(date);
  const subjectDOW = subject.day();
  const days = Array(7)
    .fill(0)
    .map((_, i) => {
      return subject
        .add(
          i -
            (subjectDOW < weekStartsOn ? 7 + subjectDOW : subjectDOW) +
            weekStartsOn,
          'day',
        )
        .locale(locale);
    });
  return days;
}

export function getDatesInMonth(
  date: Date | dayjs.Dayjs = new Date(),
  locale = 'en',
) {
  const subject = dayjs(date);
  const days = Array(subject.daysInMonth() - 1)
    .fill(0)
    .map((_, i) => {
      return subject.date(i + 1).locale(locale);
    });
  return days;
}

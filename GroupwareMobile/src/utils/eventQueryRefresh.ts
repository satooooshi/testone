import {DateTime} from 'luxon';
import {SearchQueryToGetEvents} from '../hooks/api/event/useAPIGetEventList';

export const defaultCalendarEventQuery = (): {from: string; to: string} => {
  const now = new Date();
  const from = DateTime.fromJSDate(now).minus({days: 7}).toFormat('yyyy-LL-dd');
  const to = DateTime.fromJSDate(now).plus({days: 31}).toFormat('yyyy-LL-dd');
  return {from, to};
};
export const defaultWeekQuery = (): {from: string; to: string} => {
  const now = new Date();
  const from = DateTime.fromJSDate(now)
    .minus({days: 3})
    .set({hour: 0, minute: 0, second: 0})
    .toFormat('yyyy-LL-dd');
  const to = DateTime.fromJSDate(now)
    .plus({days: 3})
    .set({hour: 0, minute: 0, second: 0})
    .toFormat('yyyy-LL-dd');
  return {from, to};
};
export const monthQueryFactoryFromTargetDate = (
  date: Date,
): {from: string; to: string} => {
  const fromDate = DateTime.fromJSDate(date).set({
    day: 0,
    hour: 0,
    minute: 0,
    second: 0,
  });
  const from = fromDate.toFormat('yyyy-LL-dd');
  const to = DateTime.fromJSDate(fromDate.toJSDate())
    .plus({months: 1})
    .minus({days: 1})
    .toFormat('yyyy-LL-dd');
  return {from, to};
};
export const weekQueryFactoryFromTargetDate = (
  date: Date,
): {from: string; to: string} => {
  const from = DateTime.fromJSDate(date)
    .minus({days: 3})
    .set({hour: 0, minute: 0, second: 0})
    .toFormat('yyyy-LL-dd');
  const to = DateTime.fromJSDate(date)
    .plus({days: 3})
    .set({hour: 0, minute: 0, second: 0})
    .toFormat('yyyy-LL-dd');
  return {from, to};
};
export const daysQueryFactoryFromTargetDate = (
  date: Date,
): {from: string; to: string} => {
  const from = DateTime.fromJSDate(date)
    .set({hour: 0, minute: 0, second: 0})
    .toFormat('yyyy-LL-dd');
  const to = DateTime.fromJSDate(date)
    .plus({days: 1})
    .minus({seconds: 1})
    .toFormat('yyyy-LL-dd');
  return {from, to};
};

export const generateEventSearchQueryString = (
  query: Partial<SearchQueryToGetEvents>,
): string => {
  const {
    page: newPage = '1',
    tag: newTag = query.tag || '',
    word: newWord = query.word || '',
    status: newStatus = query.status || 'past',
    type: newType = query.type || '',
    from: newFrom = query.from,
    to: newTo = query.to,
    participant_id: newParticipantId = query.participant_id,
  } = query;
  const {from: defaultFrom, to: defaultTo} = defaultCalendarEventQuery();
  const parsedWord = newWord.split(' ').join('+');
  let refreshURL = `?page=${newPage}&tag=${newTag}&word=${parsedWord}&status=${newStatus}`;
  if (newType) {
    refreshURL = refreshURL + `&type=${newType}`;
  }
  if (newFrom && newTo) {
    refreshURL = refreshURL + `&from=${newFrom}&to=${newTo}`;
  }
  if (newFrom === '' && newTo === '') {
    refreshURL = refreshURL + `&from=${defaultFrom}&to=${defaultTo}`;
  }
  if (newParticipantId) {
    refreshURL = refreshURL + `&participant_id=${newParticipantId}`;
  }

  return refreshURL;
};

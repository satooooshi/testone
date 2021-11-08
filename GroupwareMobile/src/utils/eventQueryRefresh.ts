import {DateTime} from 'luxon';
import {SearchQueryToGetEvents} from '../hooks/api/event/useAPIGetEventList';

export const defaultCalendarEventQuery = (): {from: string; to: string} => {
  const now = new Date();
  const from = DateTime.fromJSDate(now, {zone: 'Asia/Tokyo'})
    .minus({days: 7})
    .toFormat('yyyy-LL-dd');
  const to = DateTime.fromJSDate(now).plus({days: 31}).toFormat('yyyy-LL-dd');
  return {from, to};
};
export const defaultWeekQuery = (): {from: string; to: string} => {
  const now = new Date();
  const from = DateTime.fromJSDate(now, {zone: 'Asia/Tokyo'})
    .minus({days: 3})
    .set({hour: 0, minute: 0, second: 0})
    .toFormat('yyyy-LL-dd');
  const to = DateTime.fromJSDate(now)
    .plus({days: 3})
    .set({hour: 0, minute: 0, second: 0})
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

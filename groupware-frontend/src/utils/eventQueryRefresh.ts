import { SearchQueryToGetEvents } from '@/hooks/api/event/useAPIGetEventList';
import { DateTime } from 'luxon';

export const defaultCalendarEventQuery = (): { from: string; to: string } => {
  const now = new Date();
  const from = DateTime.fromJSDate(now, { zone: 'Asia/Tokyo' })
    .minus({ day: 7 })
    .toFormat('yyyy-LL-dd');
  const to = DateTime.fromJSDate(now).plus({ day: 31 }).toFormat('yyyy-LL-dd');
  return { from, to };
};

export const generateEventSearchQueryString = (
  query: Partial<SearchQueryToGetEvents>,
  defaultDuration?: boolean,
): string => {
  const {
    page: newPage = '1',
    tag: newTag = query.tag || '',
    word: newWord = query.word || '',
    status: newStatus = query.status || 'future',
    type: newType = query.type || '',
    from: newFrom = query.from,
    to: newTo = query.to,
  } = query;
  const { from: defaultFrom, to: defaultTo } = defaultCalendarEventQuery();
  let refreshURL = `?page=${newPage}&tag=${newTag}&word=${newWord}&status=${newStatus}`;
  if (newType) {
    refreshURL = refreshURL + `&type=${newType}`;
  }
  if ((newFrom || newFrom === '') && !defaultDuration) {
    refreshURL = refreshURL + `&from=${newFrom}`;
  } else if ((newFrom || newFrom === '') && defaultDuration) {
    refreshURL = refreshURL + `&from=${defaultFrom}`;
  }
  if ((newTo || newTo === '') && !defaultDuration) {
    refreshURL = refreshURL + `&to=${newTo}`;
  } else if ((newFrom || newFrom === '') && defaultDuration) {
    refreshURL = refreshURL + `&to=${defaultTo}`;
  }
  return refreshURL;
};

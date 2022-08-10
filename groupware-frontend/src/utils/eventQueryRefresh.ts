import { SearchQueryToGetEvents } from '@/hooks/api/event/useAPIGetEventList';
import { DateTime } from 'luxon';

export const defaultCalendarEventQuery = (): { from: string; to: string } => {
  const calendarFirstDay = () => {
    const date = new Date();
    const firstDate = new Date(date.getFullYear(), date.getMonth(), 1);
    firstDate.setDate(1);
    const dayOfWeek = firstDate.getDay();
    if (dayOfWeek === 0) {
      return firstDate;
    } else {
      firstDate.setDate(firstDate.getDate() - dayOfWeek);
      return firstDate;
    }
  };
  const now = calendarFirstDay();
  const from = DateTime.fromJSDate(now, { zone: 'Asia/Tokyo' }).toFormat(
    'yyyy-LL-dd',
  );
  const to = DateTime.fromJSDate(now).plus({ day: 34 }).toFormat('yyyy-LL-dd');
  return { from, to };
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
    personal,
    participant_id: newParticipantId = query.participant_id,
  } = query;
  const { from: defaultFrom, to: defaultTo } = defaultCalendarEventQuery();
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
  if (personal) {
    refreshURL = refreshURL + '&personal=true';
  }
  if (newParticipantId) {
    refreshURL = refreshURL + `&participant_id=${newParticipantId}`;
  }
  console.log('refreshURL===', refreshURL);
  return refreshURL;
};

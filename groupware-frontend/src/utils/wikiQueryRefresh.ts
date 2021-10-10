import { SearchQueryToGetWiki } from '@/hooks/api/wiki/useAPIGetWikiList';

export const wikiQueryRefresh = (
  query: Partial<SearchQueryToGetWiki>,
): string => {
  const {
    page: newPage = '1',
    tag: newTag = query.tag || '',
    word: newWord = query.word || '',
    status: newStatus = query.status || 'new',
    type: newType = query.type || '',
  } = query;

  return `page=${newPage}&tag=${newTag}&word=${newWord}&status=${newStatus}&type=${newType}`;
};

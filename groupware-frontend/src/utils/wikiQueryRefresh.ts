import { SearchQueryToGetWiki } from '@/hooks/api/wiki/useAPIGetWikiList';

export const wikiQueryRefresh = (
  query: Partial<SearchQueryToGetWiki>,
): string => {
  const {
    page: newPage = '1',
    tag: newTag = query.tag || '',
    word: newWord = query.word?.split(' ').join('+') || '',
    status: newStatus = query.status || 'new',
    type: newType = query.type || '',
    writer: newWriter = query.writer || '',
    answer_writer: newAnswerWriter = query.answer_writer || '',
    rule_category: newRuleCategory = query.rule_category || '',
    board_category: newBoardCategory = query.board_category || '',
  } = query;
  const parsedWord = newWord.split(' ').join('+');
  let searchQuery = `page=${newPage}&tag=${newTag}&word=${parsedWord}&status=${newStatus}&type=${newType}`;
  if (newWriter) {
    searchQuery += `&writer=${newWriter}`;
  }
  if (newAnswerWriter) {
    searchQuery += `&answer_writer=${newAnswerWriter}`;
  }
  if (newRuleCategory) {
    searchQuery += `&rule_category=${newRuleCategory}`;
  }
  if (newBoardCategory) {
    searchQuery += `&board_category=${newBoardCategory}`;
  }

  return searchQuery;
};

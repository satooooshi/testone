export const getUserSortValue = (name: string) => {
  switch (name) {
    case 'イベント参加数順':
      return 'event';
    case '質問数順':
      return 'question';
    case '回答数順':
      return 'answer';
    case 'ナレッジ投稿数順':
      return 'knowledge';
  }
};
export const getUserSortName = (value?: string) => {
  switch (value) {
    case '':
      return '指定なし';
    case 'event':
      return 'イベント参加数順';
    case 'question':
      return '質問数順';
    case 'answer':
      return '回答数順';
    case 'knowledge':
      return 'ナレッジ投稿数順';
    default:
      return '';
  }
};

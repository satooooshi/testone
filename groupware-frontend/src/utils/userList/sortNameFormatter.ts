export const getUserSortValue = (name: string) => {
  switch (name) {
    case 'イベント参加数順':
      return 'event';
    case 'メッセージ数順':
      return 'question';
    case '回答数順':
      return 'answer';
    case 'コメント数順':
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
      return 'メッセージ数順';
    case 'answer':
      return '回答数順';
    case 'knowledge':
      return 'コメント数順';
    default:
      return '';
  }
};

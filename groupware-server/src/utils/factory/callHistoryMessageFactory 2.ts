export const callHistoryMessageFactory = (message: string | undefined) => {
  if (!message) return '';

  switch (message) {
    case 'キャンセル' || '応答なし':
      return '不在着信';
    default:
      return message;
  }
};

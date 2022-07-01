export const wikiRuleCategoryToName = () => {
  switch (value) {
    case 'future':
      return '今後のイベント';
    case 'past':
      return '過去のイベント';
    case 'current':
      return '進行中のイベント';
    default:
      return '';
  }
};

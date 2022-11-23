export const eventStatusNameToValue = (name: string) => {
  switch (name) {
    case '今後のイベント':
      return 'future';
    case '過去のイベント':
      return 'past';
    case '進行中のイベント':
      return 'current';
  }
};

export const eventStatusValueToName = (value: string) => {
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

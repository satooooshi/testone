export const removeHalfWidthSpace = (text: string): string => {
  return text.replace(/ /g, '');
};

export const replaceFullWidthSpace = (text: string): string => {
  return text.replace('　', ' ');
};

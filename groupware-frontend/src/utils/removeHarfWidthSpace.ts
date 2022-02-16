export const removeHalfWidthSpace = (text: string): string => {
  return text.replace(/ /g, '');
};

export const numbersOfSameValueInKeyOfObjArr = <T>(
  array: T[],
  target: T,
  key: keyof T,
): number => {
  return array.filter((elm) => elm[key] === target[key]).length;
};

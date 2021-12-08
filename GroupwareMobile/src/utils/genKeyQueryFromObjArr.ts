export const genKeyQueryFromObjArr = <T>(arr: T[], key: keyof T) => {
  const specificT = arr.map(o => o[key]);
  const query = specificT.join('+');
  return query;
};

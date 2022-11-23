export const fileNameTransformer = (url: string) => {
  return (decodeURI(url).match('.+/(.+?)([?#;].*)?$') || ['', url])[1];
};

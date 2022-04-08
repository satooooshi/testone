export const genStorageURL = (text: string): string => {
  if (!text) {
    return text;
  }
  let parseText = text;
  const bucketName = process.env.CLOUD_STORAGE_BUCKET;
  const url = 'https://storage.googleapis.com/' + bucketName + '/';
  const regex = new RegExp(`${url}\\S+\\.[^'")\\s]+`, 'g');
  const urls = text.match(regex);
  if (!urls || !urls.length) {
    return text;
  }
  for (const matchedSignedURL of urls) {
    let unsignedURL = matchedSignedURL;
    const isQueryParamExists = unsignedURL.includes('?');
    if (isQueryParamExists) {
      unsignedURL = unsignedURL.substr(0, unsignedURL.indexOf('?'));
    }
    if (matchedSignedURL.slice(-1) === '"') {
      unsignedURL += '"';
    }
    unsignedURL = decodeURI(unsignedURL);
    parseText = parseText.replace(matchedSignedURL, unsignedURL);
  }
  return parseText;
};

export const isImage = (fileName: string): boolean => {
  if (
    fileName
      .toUpperCase()
      .match(/\.(jpg|jpeg|png|gif|tiff|tif|heif|heic|svg|svgz)/i)
  ) {
    return true;
  }
  return false;
};

export const isVideo = (fileName: string): boolean => {
  if (fileName.toUpperCase().match(/\.(mp4|avi|fiv|mov|wmv)/i)) {
    return true;
  }
  return false;
};

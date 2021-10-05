export const isImage = (fileName: string): boolean => {
  fileName = fileName.substring(fileName.lastIndexOf('.'));
  if (fileName.toUpperCase().match(/\.(jpg|jpeg|png|gif)$/i)) {
    return true;
  }
  return false;
};

export const isVideo = (fileName: string): boolean => {
  fileName = fileName.substring(fileName.lastIndexOf('.'));
  if (fileName.toUpperCase().match(/\.(mp4|avi|fiv|mov|wmv)$/i)) {
    return true;
  }
  return false;
};

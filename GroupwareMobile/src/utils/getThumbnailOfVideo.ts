import {createThumbnail} from 'react-native-create-thumbnail';

export const getThumbnailOfVideo = async (videoUrl: string) => {
  const thumbnail = await createThumbnail({
    url: videoUrl,
    timeStamp: 10000,
    format: 'png',
  });
  return thumbnail.path;
};

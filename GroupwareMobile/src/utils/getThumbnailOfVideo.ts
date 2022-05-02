import {Platform} from 'react-native';
import {createThumbnail} from 'react-native-create-thumbnail';
import {getFileUrl} from './storage/getFileUrl';

export const getThumbnailOfVideo = async (
  videoUrl: string,
  fileName: string,
) => {
  const url =
    Platform.OS === 'ios' ? await getFileUrl(fileName, videoUrl) : videoUrl;
  const thumbnail = await createThumbnail({
    url: url ? url : videoUrl,
    timeStamp: 10000,
    format: 'png',
  });
  return thumbnail.path;
};

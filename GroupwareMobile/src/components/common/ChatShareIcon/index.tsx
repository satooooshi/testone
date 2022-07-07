import React from 'react';
import {Platform, TouchableOpacity} from 'react-native';
import {Icon} from 'react-native-magnus';
import tailwind from 'tailwind-rn';
import {FIleSource} from '../../../types';
import Share, {ShareOptions} from 'react-native-share';
import {getFileUrl} from '../../../utils/storage/getFileUrl';
import RNFetchBlob from 'rn-fetch-blob';
const {fs, config} = RNFetchBlob;

type DownloadIconProps = {
  image: FIleSource;
  isVideo?: boolean;
};

const ChatShareIcon: React.FC<DownloadIconProps> = ({image, isVideo}) => {
  const openShare = async () => {
    if (Platform.OS === 'android') {
      let imagePath: string;
      config({
        fileCache: true,
      })
        .fetch('GET', image.uri)
        .then(resp => {
          imagePath = resp.path();
          return resp.readFile('base64');
        })
        .then(async data => {
          let format = isVideo
            ? 'data:video/mp4;base64,'
            : 'data:image/png;base64,';
          let base64Data = format + data;
          await Share.open({url: base64Data});
          return fs.unlink(imagePath);
        });
    } else {
      if (!image.createdUrl) {
        image.createdUrl = await getFileUrl(image.fileName, image.uri);
      }
      const option: ShareOptions = {
        url: image.createdUrl ? image.createdUrl : image.uri,
        failOnCancel: false,
      };
      Share.open(option);
    }
  };

  return (
    <TouchableOpacity
      style={tailwind('absolute bottom-5 right-20')}
      onPress={async () => {
        openShare();
      }}>
      <Icon
        color="white"
        name="share"
        fontFamily="MaterialCommunityIcons"
        fontSize={24}
      />
    </TouchableOpacity>
  );
};

export default ChatShareIcon;

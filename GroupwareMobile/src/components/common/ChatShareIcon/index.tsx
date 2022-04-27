import React from 'react';
import {Alert, TouchableOpacity} from 'react-native';
import {Icon} from 'react-native-magnus';
import tailwind from 'tailwind-rn';
import {FIleSource} from '../../../types';
import Share, {ShareOptions} from 'react-native-share';
import {getFileUrl} from '../../../utils/storage/getFileUrl';

type DownloadIconProps = {
  image: FIleSource;
  isUrlCreated?: boolean;
};

const ChatShareIcon: React.FC<DownloadIconProps> = ({image, isUrlCreated}) => {
  const openShare = async () => {
    let option: ShareOptions = {};
    if (isUrlCreated) {
      option = {
        url: image.uri,
        filename: image.fileName,
      };
    } else {
      const url = await getFileUrl(image.fileName, image.uri);

      if (url) {
        option = {
          url: url,
          filename: image.fileName,
        };
      }
    }

    Share.open(option)
      .then(res => {
        console.log(res);
      })
      .catch(err => {
        console.log(err);
        // Alert.alert('ファイル情報取得時にエラーが発生しました', err);
      });
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

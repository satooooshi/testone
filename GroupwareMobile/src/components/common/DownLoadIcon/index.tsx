import React from 'react';
import {TouchableOpacity} from 'react-native';
import {Icon} from 'react-native-magnus';
import tailwind from 'tailwind-rn';
import {saveToCameraRoll} from '../../../utils/storage/saveToCameraRoll';

type DownloadIconProps = {
  url: string;
};

const DownloadIcon: React.FC<DownloadIconProps> = ({url}) => {
  return (
    <TouchableOpacity
      style={tailwind('absolute bottom-5 right-5')}
      onPress={() => saveToCameraRoll({url, type: 'image'})}>
      <Icon color="white" name="download" fontSize={24} />
    </TouchableOpacity>
  );
};

export default DownloadIcon;

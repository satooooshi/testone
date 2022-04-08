import React, {useState} from 'react';
import {TouchableOpacity} from 'react-native';
import {Icon} from 'react-native-magnus';
import {ActivityIndicator} from 'react-native-paper';
import tailwind from 'tailwind-rn';
import {saveToCameraRoll} from '../../../utils/storage/saveToCameraRoll';

type DownloadIconProps = {
  url: string;
};

const DownloadIcon: React.FC<DownloadIconProps> = ({url}) => {
  const [loading, setLoading] = useState(false);
  return (
    <TouchableOpacity
      style={tailwind('absolute bottom-5 right-5')}
      onPress={async () => {
        setLoading(true);
        await saveToCameraRoll({url, type: 'image'});
        setLoading(false);
      }}>
      {loading ? (
        <ActivityIndicator />
      ) : (
        <Icon color="white" name="download" fontSize={24} />
      )}
    </TouchableOpacity>
  );
};

export default DownloadIcon;

import React from 'react';
import {Pressable, Text} from 'react-native';
import tailwind from 'tailwind-rn';

export default function TOCEntry({
  headerName,
  tagName,
  active,
  onPress,
}: {
  headerName: string;
  tagName: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[
        tailwind('px-4 ml-4 rounded-md mb-4'),
        active && tailwind('bg-blue-200'),
      ]}
      onPress={onPress}
      android_ripple={{color: '#baebf3'}}>
      <Text
        style={[
          tagName === 'h1' && tailwind('text-xl font-bold'),
          tagName === 'h2' && tailwind('text-lg'),
        ]}>
        {headerName}
      </Text>
    </Pressable>
  );
}

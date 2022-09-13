import React, {memo} from 'react';
import {
  NativeSyntheticEvent,
  Platform,
  TextInput,
  TextInputSelectionChangeEventData,
  useWindowDimensions,
} from 'react-native';
import {Part} from 'react-native-controlled-mentions';
import {defaultMentionTextStyle} from 'react-native-controlled-mentions/dist/utils';
import {Text} from 'react-native-magnus';
import {chatStyles} from '../../../../styles/screen/chat/chat.style';

type InputProps = {
  inputRef?: React.RefObject<TextInput>;
  onChangeInput: (changedText: string) => void;
  handleSelectionChange: (
    event: NativeSyntheticEvent<TextInputSelectionChangeEventData>,
  ) => void;
  parseContent: {
    plainText: string;
    parts: Part[];
  };
};

const Input: React.FC<InputProps> = ({
  inputRef,
  onChangeInput,
  handleSelectionChange,
  parseContent,
}) => {
  const {height: windowHeight} = useWindowDimensions();
  return (
    <TextInput
      ref={inputRef}
      onSelectionChange={handleSelectionChange}
      multiline
      onChangeText={t => onChangeInput(t)}
      autoCapitalize="none"
      placeholderTextColor="#868596"
      style={[
        Platform.OS === 'android'
          ? chatStyles.inputAndroid
          : chatStyles.inputIos,
        {
          color: 'black',
          minHeight: windowHeight * 0.03,
          maxHeight: windowHeight * 0.22,
        },
      ]}>
      <Text>
        {parseContent.parts.map(({text, partType, data}, index) =>
          partType ? (
            <Text
              key={`${index}-${data?.trigger ?? 'pattern'}`}
              style={partType.textStyle ?? defaultMentionTextStyle}>
              {text}
            </Text>
          ) : (
            <Text key={index}>{text}</Text>
          ),
        )}
      </Text>
    </TextInput>
  );
};

export default memo(Input, (prev, next) => {
  return prev.parseContent.plainText === next.parseContent.plainText;
});

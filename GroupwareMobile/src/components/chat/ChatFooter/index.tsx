import React, {memo, useMemo, useRef, useState} from 'react';
import {
  Platform,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import {Suggestion, useMentions} from 'react-native-controlled-mentions';

import {Pressable, View} from 'react-native';

import {Div, Icon, ScrollDiv, Text} from 'react-native-magnus';
import {ActivityIndicator} from 'react-native-paper';
import {Menu} from 'react-native-paper';
//import Input from './Input';

import {chatStyles} from '../../../styles/screen/chat/chat.style';

// Custom component for rendering suggestions
const Suggestions: FC<SuggestionsProvidedProps & {suggestions: Suggestion[]}> =
  ({keyword, onSelect, suggestions}) => {
    if (keyword == null) {
      return null;
    }

    return (
      <View>
        <ScrollDiv bg="white">
          {suggestions
            .filter(one =>
              one.name
                .toLocaleLowerCase()
                .includes(keyword.toLocaleLowerCase()),
            )
            .map(one => (
              <Pressable
                key={one.id}
                onPress={() => onSelect(one)}
                style={{padding: 12}}>
                <Text>{one.name}</Text>
              </Pressable>
            ))}
        </ScrollDiv>
      </View>
    );
  };

// Config of suggestible triggers
const triggersConfig = {
  mention: {
    trigger: '@',
    allowedSpacesCount: 3,
    isInsertSpaceAfterMention: true,
    textStyle: {fontWeight: 'bold', color: 'blue'},
  },
};

type ChatFooterProps = {
  text: string | undefined;
  onChangeText: (text: string) => void;
  onUploadFile: () => void;
  onUploadVideo: () => void;
  onUploadImage: (useCamera: boolean) => void;
  onSend: () => void;
  footerHeight: number;
  setVisibleStickerSelector: React.Dispatch<React.SetStateAction<boolean>>;
  mentionSuggestions: Suggestion[];
  isLoading: boolean;
};

const ChatFooter: React.FC<ChatFooterProps> = ({
  text: text,
  onChangeText,
  onUploadFile,
  onUploadVideo,
  onUploadImage,
  onSend,
  footerHeight,
  setVisibleStickerSelector,
  mentionSuggestions,
  isLoading,
}) => {
  const textInputRef = useRef<TextInput>(null);
  const {width: windowWidth, height: windowHeight} = useWindowDimensions();
  const [visibleMenu, setVisibleMenu] = useState(false);
  const [textValue, setTextValue] = useState(text);
  const onChangeInput = (t: string) => {
    setTextValue(t);
    onChangeText(t);
  };
  const {textInputProps, triggers} = useMentions({
    value: textValue || '',
    onChange: onChangeInput,
    triggersConfig,
  });

  const sendable = useMemo(() => {
    return !!textValue?.trim();
  }, [textValue]);

  return (
    <Div flexDir="column">
      <Suggestions suggestions={mentionSuggestions} {...triggers.mention} />

      <Div
        alignSelf="center"
        borderTopWidth={1}
        borderTopColor="gray300"
        flexDir="row"
        justifyContent="space-evenly"
        bg="white"
        alignItems="baseline"
        p={4}
        w={windowWidth}>
        <TouchableOpacity onPress={onUploadFile}>
          <Icon name="paper-clip" fontFamily="SimpleLineIcons" fontSize={21} />
        </TouchableOpacity>
        <Menu
          style={{
            position: 'absolute',
            top: footerHeight - (Platform.OS === 'ios' ? 70 : 160),
          }}
          visible={visibleMenu}
          onDismiss={() => setVisibleMenu(false)}
          anchor={
            <TouchableOpacity
              onPress={() => {
                setVisibleMenu(true);
              }}>
              <Icon name="picture" fontSize={21} />
            </TouchableOpacity>
          }>
          <Menu.Item
            icon="camera-image"
            onPress={() => {
              onUploadImage(false);
              setVisibleMenu(false);
            }}
            title="写真を選択"
          />
          <Menu.Item
            icon="camera"
            onPress={() => {
              onUploadImage(true);
              setVisibleMenu(false);
            }}
            title="写真を撮る"
          />
          <Menu.Item
            icon="video"
            onPress={() => {
              onUploadVideo();
              setVisibleMenu(false);
            }}
            title="ビデオを選択"
          />
        </Menu>
        <TouchableOpacity onPress={() => setVisibleStickerSelector(true)}>
          <Icon name="smile-o" fontFamily="FontAwesome" fontSize={21} />
        </TouchableOpacity>
        <Div
          alignItems="center"
          bg="#f5f6fa"
          flexDir="row"
          px={8}
          rounded="md"
          w="60%">
          <TextInput
            placeholder="メッセージを入力"
            placeholderTextColor="#868596"
            style={{padding: 12}}
            multiline
            ref={textInputRef}
            {...textInputProps}
            style={[
              Platform.OS === 'android'
                ? chatStyles.inputAndroid
                : chatStyles.inputIos,
              {
                color: 'black',
                minHeight: windowHeight * 0.03,
                maxHeight: windowHeight * 0.22,
              },
            ]}
          />
        </Div>
        {isLoading ? (
          <ActivityIndicator />
        ) : (
          <TouchableOpacity
            onPress={() => {
              sendable && onSend();
              setTextValue('');
              //textInputRef?.current?.clear();// it clears the field but the field is soonly overwritten by textValue state
            }}>
            <Icon
              name="send"
              fontFamily="Ionicons"
              fontSize={21}
              color={sendable ? 'blue600' : 'gray'}
            />
          </TouchableOpacity>
        )}
      </Div>
    </Div>
  );
};

export default memo(ChatFooter);

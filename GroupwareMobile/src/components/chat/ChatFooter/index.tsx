import React, {Fragment, useMemo, useRef, useState} from 'react';
import {
  NativeSyntheticEvent,
  Platform,
  Text,
  TextInput,
  TextInputSelectionChangeEventData,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import {
  MentionSuggestionsProps,
  parseValue,
  Suggestion,
} from 'react-native-controlled-mentions';
import {MentionPartType} from 'react-native-controlled-mentions/dist/types';
import {
  defaultMentionTextStyle,
  generateValueFromPartsAndChangedText,
  generateValueWithAddedSuggestion,
  getMentionPartSuggestionKeywords,
  isMentionPartType,
} from 'react-native-controlled-mentions/dist/utils';
import {Div, Icon, ScrollDiv} from 'react-native-magnus';
import {ActivityIndicator} from 'react-native-paper';
import {chatStyles} from '../../../styles/screen/chat/chat.style';

type ChatFooterProps = {
  text: string;
  onChangeText: (text: string) => void;
  onUploadFile: () => void;
  onUploadVideo: () => void;
  onUploadImage: () => void;
  onSend: () => void;
  setVisibleStickerSelector: React.Dispatch<React.SetStateAction<boolean>>;
  mentionSuggestions: Suggestion[];
  isLoading: boolean;
};

const ChatFooter: React.FC<ChatFooterProps> = ({
  text: value,
  onChangeText,
  onUploadFile,
  onUploadVideo,
  onUploadImage,
  onSend,
  setVisibleStickerSelector,
  mentionSuggestions,
  isLoading,
}) => {
  const {width: windowWidth, height: windowHeight} = useWindowDimensions();
  const [selection, setSelection] = useState({start: 0, end: 0});
  const [mentionAdded, setMentionAdded] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const renderSuggestions: React.FC<MentionSuggestionsProps> = ({
    keyword,
    onSuggestionPress,
  }) => {
    if (keyword == null) {
      return null;
    }

    return (
      <ScrollDiv h={140} borderTopColor="blue200" borderTopWidth={1}>
        {mentionSuggestions
          .filter(one =>
            one.name.toLocaleLowerCase().includes(keyword.toLocaleLowerCase()),
          )
          .map(one => (
            <TouchableOpacity
              key={one.id}
              onPress={() => onSuggestionPress(one)}
              style={{padding: 12, width: '100%'}}>
              <Text>{one.name}</Text>
            </TouchableOpacity>
          ))}
      </ScrollDiv>
    );
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const partTypes: MentionPartType[] = [
    {
      trigger: '@', // Should be a single character like '@' or '#'
      renderSuggestions,
      textStyle: {fontWeight: 'bold', color: 'blue'}, // The mention style in the input
    },
  ];
  const {plainText, parts} = useMemo(
    () => parseValue(value, partTypes),
    [value, partTypes],
  );

  const onChangeInput = (changedText: string) => {
    onChangeText(
      generateValueFromPartsAndChangedText(parts, plainText, changedText),
    );
  };

  const handleSelectionChange = (
    event: NativeSyntheticEvent<TextInputSelectionChangeEventData>,
  ) => {
    setSelection(event.nativeEvent.selection);
  };

  /**
   * We memoize the keyword to know should we show mention suggestions or not
   */
  const keywordByTrigger = useMemo(() => {
    return getMentionPartSuggestionKeywords(
      parts,
      plainText,
      selection,
      partTypes,
    );
  }, [parts, plainText, selection, partTypes]);

  const onSuggestionPress =
    (mentionType: MentionPartType) => (suggestion: Suggestion) => {
      const newValue = generateValueWithAddedSuggestion(
        parts,
        mentionType,
        plainText,
        selection,
        suggestion,
      );

      if (!newValue) {
        return;
      }

      //Mention style doesn't work correctly
      //https://github.com/dabakovich/react-native-controlled-mentions/issues/66
      onChangeText(newValue + '\n');
      setMentionAdded(true);

      /**
       * Move cursor to the end of just added mention starting from trigger string and including:
       * - Length of trigger string
       * - Length of mention name
       * - Length of space after mention (1)
       *
       * Not working now due to the RN bug
       */
      // const newCursorPosition = currentPart.position.start + triggerPartIndex + trigger.length +
      // suggestion.name.length + 1;

      // textInput.current?.setNativeProps({selection: {start: newCursorPosition, end: newCursorPosition}});
    };

  const renderMentionSuggestions = (mentionType: MentionPartType) => (
    <Fragment key={mentionType.trigger}>
      {renderSuggestions({
        keyword: keywordByTrigger[mentionType.trigger],
        onSuggestionPress: onSuggestionPress(mentionType),
      })}
    </Fragment>
  );

  return (
    <Div flexDir="column">
      {inputRef.current?.isFocused()
        ? (
            partTypes.filter(
              one =>
                isMentionPartType(one) &&
                one.renderSuggestions != null &&
                !one.isBottomMentionSuggestionsRender,
            ) as MentionPartType[]
          ).map(renderMentionSuggestions)
        : null}
      <Div
        alignSelf="center"
        flexDir="row"
        justifyContent="space-evenly"
        bg="white"
        alignItems="baseline"
        p={4}
        w={windowWidth}>
        <TouchableOpacity onPress={onUploadFile}>
          <Icon name="paper-clip" fontFamily="SimpleLineIcons" fontSize={21} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onUploadVideo}>
          <Icon name="video-camera" fontFamily="FontAwesome" fontSize={21} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onUploadImage}>
          <Icon name="picture" fontSize={21} />
        </TouchableOpacity>
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
            ref={inputRef}
            onSelectionChange={handleSelectionChange}
            multiline
            onChangeText={onChangeInput}
            autoCapitalize="none"
            placeholderTextColor="#868596"
            style={[
              Platform.OS === 'android'
                ? chatStyles.inputAndroid
                : chatStyles.inputIos,
              {
                minHeight: windowHeight * 0.03,
                maxHeight: windowHeight * 0.22,
              },
            ]}>
            <Text>
              {parts.map(({text, partType, data}, index) =>
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
        </Div>
        {isLoading ? (
          <ActivityIndicator />
        ) : (
          <TouchableOpacity onPress={onSend}>
            <Icon
              name="send"
              fontFamily="Ionicons"
              fontSize={21}
              color={value ? 'blue600' : 'gray'}
            />
          </TouchableOpacity>
        )}
      </Div>
    </Div>
  );
};

export default ChatFooter;

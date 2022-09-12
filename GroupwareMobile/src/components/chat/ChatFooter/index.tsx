import React, {
  Fragment,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
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
import {
  MentionPartType,
  Part,
} from 'react-native-controlled-mentions/dist/types';
import {
  generateValueFromPartsAndChangedText,
  generateValueWithAddedSuggestion,
  getMentionPartSuggestionKeywords,
  isMentionPartType,
} from 'react-native-controlled-mentions/dist/utils';
import {Div, Icon, ScrollDiv} from 'react-native-magnus';
import {ActivityIndicator} from 'react-native-paper';
import {Menu} from 'react-native-paper';
import Input from './Input';

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
  text: value,
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
  const {width: windowWidth} = useWindowDimensions();
  const [selection, setSelection] = useState({start: 0, end: 0});
  const [mentionAdded, setMentionAdded] = useState(false);
  const [visibleMenu, setVisibleMenu] = useState(false);

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
  const [parseContent, setParseContent] = useState<{
    plainText: string;
    parts: Part[];
  }>(parseValue('', partTypes));

  useEffect(() => {
    if (value) {
      setParseContent(parseValue(value, partTypes));
    } else {
      setParseContent(parseValue('', partTypes));
      // inputRef?.current?.clear();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const onChangeInput = useCallback(
    (changedText: string) => {
      setParseContent(parseValue(changedText, partTypes));
      onChangeText(
        generateValueFromPartsAndChangedText(
          parseContent.parts,
          parseContent.plainText,
          changedText,
        ),
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [inputRef, parseContent],
  );

  const handleSelectionChange = useCallback(
    (event: NativeSyntheticEvent<TextInputSelectionChangeEventData>) => {
      setSelection(event.nativeEvent.selection);
    },
    [],
  );

  /**
   * We memoize the keyword to know should we show mention suggestions or not
   */
  const keywordByTrigger = useMemo(() => {
    return getMentionPartSuggestionKeywords(
      parseContent.parts,
      parseContent.plainText,
      selection,
      partTypes,
    );
  }, [parseContent.parts, parseContent.plainText, selection, partTypes]);

  const onSuggestionPress =
    (mentionType: MentionPartType) => (suggestion: Suggestion) => {
      const newValue = generateValueWithAddedSuggestion(
        parseContent.parts,
        mentionType,
        parseContent.plainText,
        selection,
        suggestion,
      );

      if (!newValue) {
        return;
      }

      //Mention style doesn't work correctly
      //https://github.com/dabakovich/react-native-controlled-mentions/issues/66
      // onChangeText(newValue + '\n');
      setParseContent(parseValue(newValue + '\n', partTypes));
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

  const sendable = useMemo(() => {
    return !!parseContent.parts?.[0]?.text;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parseContent.parts?.[0]?.text]);

  return (
    <Div flexDir="column">
      {(
        partTypes.filter(
          one =>
            isMentionPartType(one) &&
            one.renderSuggestions != null &&
            !one.isBottomMentionSuggestionsRender,
        ) as MentionPartType[]
      ).map(renderMentionSuggestions)}
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
          <Input
            onChangeInput={onChangeInput}
            handleSelectionChange={handleSelectionChange}
            parseContent={parseContent}
          />
        </Div>
        {isLoading ? (
          <ActivityIndicator />
        ) : (
          <TouchableOpacity
            onPress={() => {
              sendable && onSend();
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

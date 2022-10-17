import React, {useState, useEffect} from 'react';
import Autolink, {CustomMatcher} from 'react-native-autolink';
import {linkOpen} from '../../../utils/linkHelper';
import {useNavigation} from '@react-navigation/native';
import {Linking, StyleProp, TextStyle} from 'react-native';
import {ChatMessage} from '../../../types';
import {mentionTransform} from '../../../utils/messageTransform';

type AutoLinkedTextProps = {
  // Use "message" for chat and "text" for others.
  text?: string;
  message?: ChatMessage;
  inputtedSearchWord?: string;
  searchedResultIds?: (number | undefined)[];
  style?: StyleProp<TextStyle>;
  linkStyle?: StyleProp<TextStyle>;
  selectable?: boolean;
};

const AutoLinkedText: React.FC<AutoLinkedTextProps> = ({
  text,
  message,
  inputtedSearchWord,
  searchedResultIds,
  style,
  linkStyle,
  selectable,
}) => {
  const navigation = useNavigation<any>();
  const [searchedWords, setSearchedWords] = useState<string[]>(['']);
  const matcher: CustomMatcher[] = [];
  searchedResultIds?.includes(message?.id) &&
    searchedWords.map(w => {
      matcher.push({
        style: {backgroundColor: 'yellow', color: 'black'},
        pattern: new RegExp(w),
      });
    });

  useEffect(() => {
    if (inputtedSearchWord !== undefined) {
      const replaceFullWidthSpace = inputtedSearchWord.replace('　', ' ');
      setSearchedWords(replaceFullWidthSpace.split(' '));
    }
  }, [inputtedSearchWord]);

  return (
    <Autolink
      // Required: the text to parse for links
      text={message ? mentionTransform(message.content) : text || ''}
      matchers={matcher}
      url
      linkStyle={linkStyle}
      style={style}
      selectable={selectable}
      onPress={url => {
        const screenInfo = linkOpen(url);
        if (screenInfo) {
          const {screenName, idParams} = screenInfo;
          switch (screenName) {
            case 'AccountDetail':
              navigation.navigate('AccountStack', {
                screen: screenName,
                params: {id: idParams},
              });
              break;
            case 'WikiDetail':
              navigation.navigate('WikiStack', {
                screen: screenName,
                params: {id: idParams},
              });
              break;
            case 'EventDetail':
              navigation.navigate('EventStack', {
                screen: screenName,
                params: {id: idParams},
              });
              break;
          }
        } else {
          Linking.openURL(url);
        }
      }}
    />
  );
};

export default AutoLinkedText;

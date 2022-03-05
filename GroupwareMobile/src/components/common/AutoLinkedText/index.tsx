import React, {useState, useEffect} from 'react';
import Autolink from 'react-native-autolink';
import {linkOpen} from '../../../utils/linkHelper';
import {useNavigation} from '@react-navigation/native';
import {Linking, StyleProp, TextStyle} from 'react-native';
import {ChatMessage} from '../../../types';
import {mentionTransform} from '../../../utils/messageTransform';

type AutoLinkedTextProps = {
  message: ChatMessage;
  inputtedSearchWord?: string;
  searchedResultIds?: (number | undefined)[];
  style?: StyleProp<TextStyle>;
  linkStyle?: StyleProp<TextStyle>;
};

const AutoLinkedText: React.FC<AutoLinkedTextProps> = ({
  message,
  inputtedSearchWord,
  searchedResultIds,
  style,
  linkStyle,
}) => {
  const navigation = useNavigation<any>();
  const [searchedWords, setSearchedWords] = useState<string[]>(['']);
  const matcher: any = [];
  searchedResultIds?.includes(message.id) &&
    searchedWords.map(w => {
      matcher.push({
        ...{style: {backgroundColor: 'yellow', color: 'black'}, pattern: w},
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
      text={mentionTransform(message.content)}
      matchers={matcher}
      url
      linkStyle={linkStyle}
      style={style}
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

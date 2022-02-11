import React from 'react';
import Autolink from 'react-native-autolink';
import {linkOpen} from '../../../utils/linkHelper';
import {useNavigation} from '@react-navigation/native';
import {Linking, StyleProp, TextStyle} from 'react-native';

type AutoLinkedTextProps = {
  text: string;
  inputtedSearchWord?: string;
  style?: StyleProp<TextStyle>;
  linkStyle?: StyleProp<TextStyle>;
};

const AutoLinkedText: React.FC<AutoLinkedTextProps> = ({
  text,
  inputtedSearchWord,
  style,
  linkStyle,
}) => {
  const navigation = useNavigation<any>();
  const matcher: any = {
    pattern: inputtedSearchWord,
    style: {backgroundColor: 'yellow', color: 'black'},
  };
  return (
    <Autolink
      // Required: the text to parse for links
      text={text}
      matchers={[matcher]}
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

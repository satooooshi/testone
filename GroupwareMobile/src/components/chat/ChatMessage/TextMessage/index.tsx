import React from 'react';
import {TouchableHighlight, useWindowDimensions} from 'react-native';
import {Div, Text} from 'react-native-magnus';
import {ChatMessage, User} from '../../../../types';
import ReplyParent from '../ReplyParent';
import tailwind from 'tailwind-rn';
import AutoLinkedText from '../../../common/AutoLinkedText';
import {darkFontColor} from '../../../../utils/colors';

export type TextMessageProps = {
  message: ChatMessage;
  inputtedSearchWord?: string;
  searchedResultIds?: (number | undefined)[];
  onLongPress: () => void;
  senderAvatars?: {
    member: User;
    avatar: JSX.Element;
  }[];
};

const TextMessage: React.FC<TextMessageProps> = ({
  message,
  inputtedSearchWord,
  searchedResultIds,
  onLongPress,
  senderAvatars,
}) => {
  const {width: windowWidth} = useWindowDimensions();
  return (
    <TouchableHighlight onLongPress={onLongPress} underlayColor="none">
      <Div
        rounded="xl"
        maxW={windowWidth * 0.6}
        minW={windowWidth * 0.4}
        bg={message.isSender ? 'blue900' : 'white'}
        p={8}
        justifyContent="center">
        {message.replyParentMessage && (
          <ReplyParent
            senderAvatar={senderAvatars?.find(
              s => s.member.id === message.replyParentMessage?.sender?.id,
            )}
            parentMessage={message.replyParentMessage}
            isSender={message.isSender}
          />
        )}
        <AutoLinkedText
          message={message}
          inputtedSearchWord={inputtedSearchWord}
          searchedResultIds={searchedResultIds}
          linkStyle={tailwind(
            message.isSender
              ? 'font-bold text-pink-300 text-base'
              : 'font-bold text-blue-600 text-base',
          )}
          style={
            message.isSender ? tailwind('text-white') : tailwind('text-black')
          }
        />
        {message.modifiedAt ? (
          <Text fontSize={10} mt={3} color={darkFontColor} textAlign="right">
            編集済み
          </Text>
        ) : null}
      </Div>
    </TouchableHighlight>
  );
};

export default TextMessage;

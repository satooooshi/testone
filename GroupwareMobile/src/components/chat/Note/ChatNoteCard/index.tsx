import React from 'react';
import {TouchableHighlight} from 'react-native';
import {Button, Div, Icon, Image, Text} from 'react-native-magnus';
import {ChatNote} from '../../../../types';
import {darkFontColor} from '../../../../utils/colors';
import {dateTimeFormatterFromJSDDate} from '../../../../utils/dateTimeFormatterFromJSDate';
import {userNameFactory} from '../../../../utils/factory/userNameFactory';

type ChatNoteCardProps = {
  note: ChatNote;
  onPress: () => void;
};

const ChatNoteCard: React.FC<ChatNoteCardProps> = ({note, onPress}) => {
  return (
    <TouchableHighlight onPress={onPress} underlayColor="none">
      <Div
        bg="white"
        py="lg"
        px="sm"
        borderBottomWidth={0.5}
        borderBottomColor={darkFontColor}>
        <Div flexDir="row" justifyContent="space-between" mb="lg">
          <Div flexDir="row" alignItems="center">
            <Image
              mr="sm"
              rounded="circle"
              h={40}
              w={40}
              source={
                note.editor?.length && note.editor[0].avatarUrl
                  ? {uri: note.editor[0].avatarUrl}
                  : require('../../../../../assets/no-image-avatar.png')
              }
            />
            <Text fontWeight="bold" fontSize={16}>
              {note.editor?.length
                ? userNameFactory(note.editor[0])
                : 'ボールドくん'}
            </Text>
          </Div>
          {note.isEditor && (
            <Button rounded="circle">
              <Icon
                name="pencil"
                fontFamily="Entypo"
                fontSize={20}
                color="white"
              />
            </Button>
          )}
        </Div>
        <Div mb="lg">
          <Text fontSize={16}>{note.content}</Text>
        </Div>
        <Text fontSize={12} color={darkFontColor}>
          {dateTimeFormatterFromJSDDate({
            dateTime: new Date(note.createdAt),
          })}
        </Text>
      </Div>
    </TouchableHighlight>
  );
};

export default ChatNoteCard;

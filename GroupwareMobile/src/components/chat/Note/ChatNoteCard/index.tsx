import React from 'react';
import {TouchableHighlight, TextInput, Platform} from 'react-native';
import {Button, Div, Icon, Image, Text} from 'react-native-magnus';
import tailwind from 'tailwind-rn';
import {ChatNote, ChatNoteImage} from '../../../../types';
import {darkFontColor} from '../../../../utils/colors';
import {dateTimeFormatterFromJSDDate} from '../../../../utils/dateTimeFormatterFromJSDate';
import {userNameFactory} from '../../../../utils/factory/userNameFactory';
import AutoLinkedText from '../../../common/AutoLinkedText';
import UserAvatar from '../../../common/UserAvatar';

type ChatNoteCardProps = {
  note: ChatNote;
  onPressEditButton: () => void;
  onPressDeleteButton: () => void;
  onPressImage: (
    images: Partial<ChatNoteImage>[],
    targetImage: Partial<ChatNoteImage>,
  ) => void;
};

const ChatNoteCard: React.FC<ChatNoteCardProps> = ({
  note,
  onPressEditButton,
  onPressDeleteButton,
  onPressImage,
}) => {
  return (
    <Div
      bg="white"
      py="lg"
      px="sm"
      borderBottomWidth={0.5}
      borderBottomColor={darkFontColor}>
      <Div flexDir="row" justifyContent="space-between" mb="lg">
        <Div flexDir="row" alignItems="center">
          <Div mr="sm">
            <UserAvatar
              h={40}
              w={40}
              user={note.editors?.[0]}
              GoProfile={true}
            />
          </Div>
          <Text fontWeight="bold" fontSize={16}>
            {note.editors?.length
              ? userNameFactory(note.editors[0])
              : 'ボールドくん'}
          </Text>
        </Div>
        {note.isEditor && (
          <Div flexDir="row">
            <Button rounded="circle" onPress={onPressEditButton} mr="sm">
              <Icon
                name="pencil"
                fontFamily="Entypo"
                fontSize={20}
                color="white"
              />
            </Button>
            <Button
              bg="white"
              borderColor="red"
              borderWidth={1}
              rounded="circle"
              onPress={onPressDeleteButton}
              mr="sm">
              <Icon name="delete" fontSize={20} color="red" />
            </Button>
          </Div>
        )}
      </Div>
      <Div flexDir="row" flexWrap="wrap">
        {note.images?.map(i => (
          <TouchableHighlight
            key={i.id}
            underlayColor="none"
            onPress={() => note.images && onPressImage(note.images, i)}>
            <Image
              h={96}
              w={96}
              source={{uri: i.imageURL}}
              borderWidth={1}
              borderColor="white"
            />
          </TouchableHighlight>
        ))}
      </Div>
      <Div mb="lg">
        {Platform.OS === 'ios' ? (
          <TextInput
            multiline={true}
            editable={false}
            scrollEnabled={false}
            value={note.content}
            style={tailwind(' text-black text-base')}
            dataDetectorTypes={'link'}
          />
        ) : (
          <AutoLinkedText
            selectable={true}
            text={note.content}
            style={tailwind(' text-black text-base')}
            linkStyle={tailwind('text-blue-500 text-base text-base')}
          />
        )}
      </Div>
      <Text fontSize={12} color={darkFontColor}>
        {dateTimeFormatterFromJSDDate({
          dateTime: new Date(note.createdAt),
        })}
      </Text>
    </Div>
  );
};

export default ChatNoteCard;

import {Div, Image, Text} from 'react-native-magnus';
import {User} from '../../../types';
import {dateTimeFormatterFromJSDDate} from '../../../utils/dateTimeFormatterFromJSDate';
import React from 'react';
import {useWindowDimensions} from 'react-native';

type EventCommentCardProps = {
  body: string;
  date: Date;
  writer: User;
};

const EventCommentCard: React.FC<EventCommentCardProps> = ({
  body,
  date,
  writer,
}) => {
  const {width: windowWidth} = useWindowDimensions();
  const avatarProps = {
    mt: 'sm',
    mb: 'sm',
    h: windowWidth * 0.09,
    w: windowWidth * 0.09,
    rounded: 'circle',
    ...(writer.existence
      ? {
          source: writer.avatarUrl
            ? {uri: writer.avatarUrl}
            : require('../../../../assets/no-image-avatar.png'),
        }
      : {
          source: require('../../../../assets/bold-mascot.png'),
        }),
  };

  return (
    <Div flexDir="column" justifyContent="space-between" mb={16}>
      <Div alignItems="center" flexDir="row" justifyContent="space-between">
        <Div flex={1} alignItems="center">
          <Image {...avatarProps} />
          <Text fontSize={12} color="gray800">
            {writer.existence
              ? writer.lastName + ' ' + writer.firstName
              : 'ボールドくん'}
          </Text>
        </Div>
        <Div p={20} bg="white" rounded="sm" flex={3}>
          <Text>{body}</Text>
          <Div position="absolute" right={4} bottom={4}>
            <Text fontSize={10} color="gray500">
              {dateTimeFormatterFromJSDDate({dateTime: new Date(date)})}
            </Text>
          </Div>
        </Div>
      </Div>
    </Div>
  );
};

export default EventCommentCard;

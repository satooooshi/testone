import {Div, Text} from 'react-native-magnus';
import {User} from '../../../types';
import {dateTimeFormatterFromJSDDate} from '../../../utils/dateTimeFormatterFromJSDate';
import React from 'react';
import {useWindowDimensions} from 'react-native';
import UserAvatar from '../../../components/common/UserAvatar';

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

  return (
    <Div flexDir="column" justifyContent="space-between" mb={16}>
      <Div alignItems="center" flexDir="row" justifyContent="space-between">
        <Div flex={1} alignItems="center">
          <Div my={'sm'}>
            <UserAvatar
              h={windowWidth * 0.09}
              w={windowWidth * 0.09}
              user={writer}
            />
          </Div>
          <Text fontSize={12} color="gray800">
            {writer.existence
              ? writer.lastName + ' ' + writer.firstName
              : 'サンプル'}
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

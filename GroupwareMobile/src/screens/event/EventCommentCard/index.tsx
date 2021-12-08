import {Div, Image, Text} from 'react-native-magnus';
import {User} from '../../../types';
import {dateTimeFormatterFromJSDDate} from '../../../utils/dateTimeFormatterFromJSDate';
import React from 'react';
import {useWindowDimensions} from 'react-native';
import tailwind from 'tailwind-rn';

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
    <Div style={tailwind('flex-col justify-between mb-4')}>
      {writer.existence ? (
        <Div style={tailwind('flex-row justify-between items-center')}>
          <Div style={tailwind('flex-row justify-between items-center')}>
            <Image
              mt={'lg'}
              h={windowWidth * 0.1}
              w={windowWidth * 0.1}
              source={
                writer.avatarUrl
                  ? {uri: writer.avatarUrl}
                  : require('../../../../assets/no-image-avatar.png')
              }
              rounded="circle"
              mb={'lg'}
              mr={16}
            />
            <Text mr={64}>{writer.lastName + ' ' + writer.firstName}</Text>
          </Div>
          <Text>
            {dateTimeFormatterFromJSDDate({dateTime: new Date(date)})}
          </Text>
        </Div>
      ) : (
        <Div style={tailwind('flex-row justify-between items-center')}>
          <Div style={tailwind('flex-row justify-between items-center')}>
            <Image
              mt={'lg'}
              h={windowWidth * 0.1}
              w={windowWidth * 0.1}
              source={require('../../../../assets/bold-mascot.png')}
              rounded="circle"
              mb={'lg'}
              mr={16}
            />
            <Text mr={64}>ボールドくん</Text>
          </Div>
          <Text>
            {dateTimeFormatterFromJSDDate({dateTime: new Date(date)})}
          </Text>
        </Div>
      )}
      <Div style={tailwind('p-4 bg-white rounded')}>
        <Text>{body}</Text>
      </Div>
    </Div>
  );
};

export default EventCommentCard;

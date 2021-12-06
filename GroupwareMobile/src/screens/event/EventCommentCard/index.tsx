import {Div, Image, Text} from 'react-native-magnus';
import {User} from '../../../types';
import {dateTimeFormatterFromJSDDate} from '../../../utils/dateTimeFormatterFromJSDate';
import React from 'react';
import {useWindowDimensions} from 'react-native';
import {eventDetail} from '../../../styles/component/event/eventDetail.style';

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
    <Div style={eventDetail.commentCardWrapper}>
      {writer.existence ? (
        <Div style={eventDetail.commentInfoWrapper}>
          <Div style={eventDetail.commentWriterInfoWrapper}>
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
        <Div style={eventDetail.commentInfoWrapper}>
          <Div style={eventDetail.commentWriterInfoWrapper}>
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
      <Div style={eventDetail.commentBody}>
        <Text>{body}</Text>
      </Div>
    </Div>
  );
};

export default EventCommentCard;

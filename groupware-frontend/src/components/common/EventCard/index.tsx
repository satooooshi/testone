import React, { useMemo } from 'react';
import { EventSchedule, EventType, Tag } from 'src/types';
import clsx from 'clsx';
import { dateTimeFormatterFromJSDDate } from 'src/utils/dateTimeFormatter';
import { Box, Button, Link, useMediaQuery, Text } from '@chakra-ui/react';
import noImage from '@/public/no-image.jpg';
import boldayImage1 from '@/public/bolday_1.jpg';
import impressiveUnivertyImage from '@/public/impressive_university_1.png';
import coachImage from '@/public/coach_1.jpeg';
import studyMeeting1Image from '@/public/study_meeting_1.jpg';
import Image from 'next/image';
import portalLinkBoxStyles from '@/styles/components/PortalLinkBox.module.scss';
import { MdAssignment } from 'react-icons/md';
import { FcSportsMode } from 'react-icons/fc';
import { tagColorFactory } from 'src/utils/factory/tagColorFactory';
import { darkFontColor } from 'src/utils/colors';
import { hideScrollbarCss } from 'src/utils/chakra/hideScrollBar.css';

type EventCardProps = {
  eventSchedule: EventSchedule;
  hrefTagClick?: (t: Tag) => string;
};

const EventCard: React.FC<EventCardProps> = ({
  eventSchedule,
  hrefTagClick,
}) => {
  const [isSmallerThan1024] = useMediaQuery('(max-width: 1024px)');
  const [isSmallerThan768] = useMediaQuery('(max-width: 768px)');
  const [isSmallerThan576] = useMediaQuery('(max-width: 576px)');
  const [isSmallerThan350] = useMediaQuery('(max-width: 350px)');
  const imageSource = useMemo(() => {
    switch (eventSchedule.type) {
      case EventType.STUDY_MEETING:
        return <Image src={studyMeeting1Image} alt="イベント画像" />;
      case EventType.BOLDAY:
        return <Image src={boldayImage1} alt="イベント画像" />;
      case EventType.CLUB:
        return (
          <FcSportsMode
            style={{ height: '100%', width: '100%' }}
            className={clsx(portalLinkBoxStyles.club_icon)}
          />
        );
      case EventType.IMPRESSIVE_UNIVERSITY:
        return <Image src={impressiveUnivertyImage} alt="イベント画像" />;
      case EventType.COACH:
        return <Image src={coachImage} alt="イベント画像" />;
      case EventType.SUBMISSION_ETC:
        return (
          <MdAssignment
            style={{ height: '100%', width: '100%' }}
            className={clsx(portalLinkBoxStyles.submission_etc_icon)}
          />
        );

      default:
        return <Image src={noImage} alt="イベント画像" />;
    }
  }, [eventSchedule.type]);

  return (
    <Link
      minH="160px"
      display="flex"
      flexDir="column"
      justifyContent="space-between"
      w={isSmallerThan768 ? '90vw' : isSmallerThan1024 ? '75vw' : '36vw'}
      backgroundColor="gray.100"
      borderWidth={1}
      borderColor="gray.200"
      shadow="md"
      href={`/event/${eventSchedule.id}`}
      _hover={{ textDecoration: 'none' }}>
      <Box
        display="flex"
        flexDir="row"
        alignItems="flex-start"
        justifyContent="flex-start"
        px="8px"
        pt="8px">
        <Box
          mr="16px"
          minW="40%"
          maxW="40%"
          minH="100%"
          maxH="100%"
          alignSelf="flex-start"
          css={{ aspectRatio: '1' }}>
          {eventSchedule.imageURL ? (
            <img
              src={eventSchedule.imageURL}
              alt="イベント画像"
              // width="50px"
              // height="100%"
              // style={{ height: '100px', width: '100%' }}
            />
          ) : (
            imageSource
          )}
        </Box>
        <Box
          display="flex"
          flexDir="column"
          w={isSmallerThan576 ? '50%' : '55%'}
          h="100%">
          <Box mb="8px">
            <Text
              fontSize={isSmallerThan768 ? 18 : 16}
              fontWeight="bold"
              h="auto"
              verticalAlign="baseline"
              whiteSpace="nowrap"
              overflow="hidden"
              isTruncated={true}>
              {eventSchedule.title}
            </Text>
            <Text fontSize={14} noOfLines={isSmallerThan350 ? 2 : 3}>
              {eventSchedule.description}
            </Text>
          </Box>
          <Box display="flex" flexDir="column" justifyContent="space-between">
            {eventSchedule.type !== EventType.SUBMISSION_ETC && (
              <Text fontSize={isSmallerThan768 ? 14 : 16}>
                {dateTimeFormatterFromJSDDate({
                  dateTime: new Date(eventSchedule.startAt),
                  format: '開始: yyyy/LL/dd HH:mm ~',
                })}
              </Text>
            )}
            <Text fontSize={isSmallerThan768 ? 14 : 16}>
              {`
                  ${
                    eventSchedule.type !== EventType.SUBMISSION_ETC
                      ? '終了'
                      : '締切'
                  }: ${dateTimeFormatterFromJSDDate({
                dateTime: new Date(eventSchedule.endAt),
                format: 'yyyy/LL/dd HH:mm',
              })}
                `}
            </Text>
          </Box>
        </Box>
      </Box>
      <Box pb="8px">
        <Box
          display="flex"
          flexDir="row"
          overflowX="auto"
          css={hideScrollbarCss}>
          {eventSchedule.tags && eventSchedule.tags.length
            ? eventSchedule.tags.map((t) => (
                <Link
                  _hover={{ textDecoration: 'none' }}
                  mr="4px"
                  _first={{ marginLeft: '4px' }}
                  passHref
                  href={
                    hrefTagClick ? hrefTagClick(t) : `/event/list?tag=${t.id}`
                  }
                  key={t.id}>
                  <Button size="xs" colorScheme={tagColorFactory(t.type)}>
                    {t.name}
                  </Button>
                </Link>
              ))
            : null}
        </Box>
      </Box>
    </Link>
  );
};

export default EventCard;

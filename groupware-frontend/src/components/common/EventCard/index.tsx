import React, { useMemo } from 'react';
import { EventSchedule, EventType, Tag } from 'src/types';
import clsx from 'clsx';
import { dateTimeFormatterFromJSDDate } from 'src/utils/dateTimeFormatter';
import {
  Box,
  Button,
  Link,
  useMediaQuery,
  Text,
  Image,
  AspectRatio,
  Badge,
  Divider,
} from '@chakra-ui/react';
import noImage from '@/public/no-image.jpg';
import boldayImage1 from '@/public/bolday_1.jpg';
import impressiveUnivertyImage from '@/public/impressive_university_1.png';
import coachImage from '@/public/coach_1.jpeg';
import studyMeeting1Image from '@/public/study_meeting_1.jpg';
// import Image from 'next/image';
import portalLinkBoxStyles from '@/styles/components/PortalLinkBox.module.scss';
import { MdAssignment } from 'react-icons/md';
import { FcSportsMode } from 'react-icons/fc';
import { tagColorFactory } from 'src/utils/factory/tagColorFactory';
import { darkFontColor } from 'src/utils/colors';
import { hideScrollbarCss } from 'src/utils/chakra/hideScrollBar.css';
import valleyinLogo from '@/public/fanreturn_logo.png';
import { AiOutlineArrowRight } from 'react-icons/ai';
import { useRouter } from 'next/router';

type EventCardProps = {
  eventSchedule: EventSchedule;
  hrefTagClick?: (t: Tag) => string;
  onClickAnswer?: (id: number) => void;
};

const EventCard: React.FC<EventCardProps> = ({
  eventSchedule,
  hrefTagClick,
  onClickAnswer,
}) => {
  const [isSmallerThan1024] = useMediaQuery('(max-width: 1024px)');
  const [isSmallerThan768] = useMediaQuery('(max-width: 768px)');
  const [isSmallerThan576] = useMediaQuery('(max-width: 576px)');
  const [isSmallerThan350] = useMediaQuery('(max-width: 350px)');
  const router = useRouter();

  // const imageSource = useMemo(() => {
  //   switch (eventSchedule.type) {
  //     case EventType.STUDY_MEETING:
  //       return (
  //         <Image
  //           src={studyMeeting1Image.src}
  //           alt="イベント画像"
  //           borderLeftRadius={10}
  //         />
  //       );
  //     case EventType.BOLDAY:
  //       return (
  //         <Image
  //           src={boldayImage1.src}
  //           alt="イベント画像"
  //           borderLeftRadius={10}
  //         />
  //       );
  //     case EventType.CLUB:
  //       return (
  //         <FcSportsMode
  //           style={{ height: '100%', width: '100%' }}
  //           className={clsx(portalLinkBoxStyles.club_icon)}
  //         />
  //       );
  //     case EventType.IMPRESSIVE_UNIVERSITY:
  //       return (
  //         <Image
  //           src={impressiveUnivertyImage.src}
  //           alt="イベント画像"
  //           borderLeftRadius={10}
  //         />
  //       );
  //     case EventType.COACH:
  //       return (
  //         <Image
  //           src={coachImage.src}
  //           alt="イベント画像"
  //           borderLeftRadius={10}
  //         />
  //       );
  //     case EventType.SUBMISSION_ETC:
  //       return (
  //         <MdAssignment
  //           style={{ height: '100%', width: '100%' }}
  //           className={clsx(portalLinkBoxStyles.submission_etc_icon)}
  //         />
  //       );

  //     default:
  //       return <Image src={noImage.src} alt="イベント画像" />;
  //   }
  // }, [eventSchedule.type]);

  return (
    <Box
      // minH="160px"
      borderRadius={10}
      display="flex"
      // flexDir="column"
      // justifyContent="space-between"
      // mb={3}
      h="250px"
      w="100%"
      maxW="500px"
      backgroundColor="white"
      borderWidth={1}
      borderColor="gray.200"
      shadow="md"
      // href={`/event/${eventSchedule.id}`}
      // _hover={{ textDecoration: 'none' }}
    >
      <Box
        display="flex"
        flexDir="row"
        h="100%"
        w="100%"
        // alignItems="flex-start"
        // justifyContent="flex-start"
      >
        <Box
          borderRightWidth={1}
          w="40%"
          h="100%"
          // alignSelf="flex-start"
        >
          <AspectRatio h="100%" w="100%">
            {eventSchedule.imageURL ? (
              <Image
                borderLeftRadius={10}
                // h="100%"
                src={valleyinLogo.src}
                // src={eventSchedule.imageURL}
                alt="イベント画像"
              />
            ) : (
              <Image src={noImage.src} alt="イベント画像" />
            )}
          </AspectRatio>
        </Box>
        <Box display="flex" flexDir="column" w="60%" h="100%" px={2}>
          <Box my="8px" w="100%">
            <Box
              display="flex"
              flexDir="row"
              overflowX="auto"
              ml={-1}
              mb={1}
              css={hideScrollbarCss}>
              {eventSchedule.tags && eventSchedule.tags.length
                ? eventSchedule.tags.map((t) => (
                    <Link
                      _hover={{ textDecoration: 'none' }}
                      passHref
                      href={
                        hrefTagClick
                          ? hrefTagClick(t)
                          : `/event/list?tag=${t.id}`
                      }
                      key={t.id}>
                      <Badge
                        ml={1}
                        mb={1}
                        p={2}
                        as="sub"
                        fontSize="x-small"
                        display="flex"
                        colorScheme={tagColorFactory(t.type)}
                        borderRadius={50}
                        alignItems="center"
                        variant="outline"
                        borderWidth={1}>
                        {t.name}
                      </Badge>
                    </Link>
                  ))
                : null}
            </Box>
          </Box>
          <Box mb="8px" h="80px" mr={4} mt={3}>
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
            <Box>
              <Text mt={3} fontSize={12} noOfLines={isSmallerThan350 ? 2 : 3}>
                {eventSchedule.description}
              </Text>
            </Box>
          </Box>
          <Divider orientation="horizontal" mb={3} />
          <Box display="flex" flexDir="column" justifyContent="space-between">
            <Text fontSize={isSmallerThan768 ? 10 : 13} color={darkFontColor}>
              {dateTimeFormatterFromJSDDate({
                dateTime: new Date(eventSchedule.startAt),
                format: '開始: yyyy/LL/dd HH:mm ',
              })}
            </Text>
            <Text
              fontSize={isSmallerThan768 ? 10 : 13}
              mt="2px"
              color={darkFontColor}>
              {dateTimeFormatterFromJSDDate({
                dateTime: new Date(eventSchedule.endAt),
                format: '終了: yyyy/LL/dd HH:mm',
              })}
            </Text>
          </Box>
          <Box my="auto" pl={-1}>
            {/* <Button
            borderRadius={50}
            width="100px"
            height={7}
            colorScheme="blue"
            onClick={() => onClickAnswer(eventSchedule.id)}>
            <Box display="flex">
              <Text fontSize={10} mr="6px">
                回答する
              </Text>
              <AiOutlineArrowRight size={13} />
            </Box>
          </Button> */}
            <Link
              href={`/event/${eventSchedule.id}`}
              style={{ textDecoration: 'none' }}>
              <Button
                ml={2}
                borderRadius={50}
                width="100px"
                height={7}
                colorScheme="blue"
                variant="outline">
                <Box display="flex">
                  <Text fontSize={10} mr="4px">
                    詳細を見る
                  </Text>
                  <AiOutlineArrowRight size={13} />
                </Box>
              </Button>
            </Link>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default EventCard;

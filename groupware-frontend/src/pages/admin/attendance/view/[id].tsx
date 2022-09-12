import LayoutWithTab from '@/components/layout/LayoutWithTab';
import { SidebarScreenName } from '@/components/layout/Sidebar';
import Head from 'next/head';
import React, { useMemo, useState } from 'react';
import { Tab } from 'src/types/header/tab/types';
import {
  Box,
  FormControl,
  FormLabel,
  Input,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Text,
  useMediaQuery,
  Button,
  Modal,
  ModalOverlay,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
} from '@chakra-ui/react';
import { DateTime } from 'luxon';
import { Attendance, AttendanceCategory } from 'src/types';
import { useAPIGetAttendance } from '@/hooks/api/attendance/useAPIGetAttendance';
import { useAuthenticate } from 'src/contexts/useAuthenticate';
import { attendanceCategoryName } from 'src/utils/factory/attendanceCategoryName';
import { useRouter } from 'next/router';
import TravelCostDetailModal from '@/components/attendance/TravelCostDetailModal';
import { useAPIGetMiniProfileById } from '@/hooks/api/user/useAPIGetMiniProfileById';
import { userNameFactory } from 'src/utils/factory/userNameFactory';

const AttendanceTableRow = ({
  date,
  attendanceData,
}: {
  date: DateTime;
  attendanceData?: Attendance[];
}) => {
  const [detailModal, setDetailModal] = useState(false);
  const [selectedDateForApplication, setSelectedDateForApplication] =
    useState<DateTime>();
  const targetData = attendanceData?.filter(
    (a) =>
      DateTime.fromJSDate(new Date(a?.targetDate)).toFormat('yyyy-LL-dd') ===
      date.toFormat('yyyy-LL-dd'),
  )?.[0];

  const workingTime = useMemo(() => {
    if (targetData) {
      const breakHourAndMinutes = targetData.breakMinutes.split(':');
      const diff =
        (new Date(targetData.absenceTime).getTime() -
          new Date(targetData.attendanceTime).getTime()) /
        3600000;
      const minutesNumber =
        Math.round((diff - Math.floor(diff)) * 60) -
        Number(breakHourAndMinutes[1]);

      const minutes = String(
        '00' + (minutesNumber < 0 ? 60 + minutesNumber : minutesNumber),
      ).slice(-2);
      const hoursNumber =
        Math.floor(diff) -
        Number(breakHourAndMinutes[0]) -
        (minutesNumber < 0 ? 1 : 0);
      const hours = String('00' + hoursNumber).slice(-2);
      return hours + ':' + minutes;
    }
  }, [targetData]);

  return (
    <>
      <Modal
        scrollBehavior="inside"
        isOpen={detailModal}
        onClose={() => setDetailModal(false)}>
        <ModalOverlay />
        <ModalContent h="90vh" bg={'#f9fafb'}>
          <ModalHeader
            flexDir="row"
            justifyContent="space-between"
            display="flex"
            mr="24px">
            <Text>{date?.toFormat('LL月dd日 備考')}</Text>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text whiteSpace="pre-line">{targetData?.detail}</Text>
          </ModalBody>
        </ModalContent>
      </Modal>
      <Td>
        <Text
          color={
            targetData?.category !== AttendanceCategory.COMMON
              ? targetData?.verifiedAt
                ? 'red'
                : 'blue'
              : 'black'
          }>
          {date.setLocale('ja').toFormat('d日(EEE)')}
        </Text>
      </Td>
      {targetData ? (
        <>
          <TravelCostDetailModal
            isOpen={!!selectedDateForApplication}
            onClose={() => setSelectedDateForApplication(undefined)}
            attendance={targetData}
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            //@ts-ignore
            date={selectedDateForApplication}
          />
          <Td>
            <Text> {attendanceCategoryName(targetData?.category)}</Text>
          </Td>
          <Td>
            {DateTime.fromJSDate(new Date(targetData.attendanceTime)).toFormat(
              'HH:mm',
            )}
          </Td>
          <Td>
            {DateTime.fromJSDate(new Date(targetData.absenceTime)).toFormat(
              'HH:mm',
            )}
          </Td>
          <Td>{targetData.breakMinutes}</Td>
          <Td>{workingTime}</Td>
          <Td>
            {targetData.travelCost.length ? (
              <Button
                onClick={() => setSelectedDateForApplication(date)}
                colorScheme="blue">
                確認
              </Button>
            ) : null}
          </Td>
          <Td>
            {targetData.detail.length ? (
              <Button colorScheme="blue" onClick={() => setDetailModal(true)}>
                確認
              </Button>
            ) : null}
          </Td>
        </>
      ) : null}
    </>
  );
};

const AttendanceView = () => {
  const router = useRouter();
  const { id } = router.query as { id: string };

  const [isSmallerThan768] = useMediaQuery('(max-width: 768px)');
  const tabs: Tab[] = [
    { type: 'link', name: '勤怠打刻', href: `/admin/attendance/view/${id}` },
    { type: 'link', name: '勤怠報告', href: `/admin/attendance/report/${id}` },
  ];

  const { data: userInfo } = useAPIGetMiniProfileById(id);
  const [month, setMonth] = useState(DateTime.now());
  const { data } = useAPIGetAttendance({
    id: Number(router.query.id),
    from_date: month.startOf('month').toFormat('yyyy-LL-dd'),
    to_date: month.endOf('month').endOf('day').toFormat('yyyy-LL-dd'),
  });
  const dates = useMemo(() => {
    const start = month.startOf('month');
    const end = month.endOf('month');
    const arr: DateTime[] = [];
    let i = 0;
    while (arr[arr.length - 1]?.day !== end.day) {
      arr.push(start.plus({ days: i }));
      i++;
    }
    return arr;
  }, [month]);

  return (
    <LayoutWithTab
      sidebar={{ activeScreenName: SidebarScreenName.ADMIN }}
      header={{
        title: `${userNameFactory(userInfo)}  勤怠打刻`,
        tabs,
        activeTabName: '勤怠打刻',
      }}>
      <Head>
        <title>ボールド | 勤怠打刻</title>
      </Head>
      <Box display="flex" ml={10} mr="auto" alignItems="center">
        <Text fontSize={20} mr={2}>
          氏名:
        </Text>
        <Text fontSize={25} fontWeight="bold">
          {userNameFactory(userInfo)}
        </Text>
      </Box>
      <Box display="flex" flexDir="row" justifyContent="flex-start" mb="32px">
        <FormControl
          display="flex"
          flexDir="column"
          alignItems="center"
          justifyContent="flex-start">
          <FormLabel>対象月</FormLabel>
          <Input
            type="month"
            bg="white"
            value={month.toFormat('yyyy-LL')}
            onChange={(e) => {
              const yearAndMonth = e.target.value.split('-');
              setMonth((m) =>
                m.set({
                  year: Number(yearAndMonth[0]),
                  month: Number(yearAndMonth[1]),
                }),
              );
            }}
          />
        </FormControl>
      </Box>
      <Button right="50px" position="absolute">
        CSV出力
      </Button>
      <Box
        w={'100%'}
        justifyContent={isSmallerThan768 ? 'flex-start' : 'center'}
        alignItems="center"
        display="flex"
        overflowX="auto"
        maxW="1980px"
        mx="auto"
        alignSelf="center">
        <Table variant="simple" alignSelf="center" w="100%" overflowX="auto">
          <Thead bg="white">
            <Tr>
              <Th minW={'100px'}>日付</Th>
              <Th>区分</Th>
              <Th>出勤時間</Th>
              <Th>退勤時間</Th>
              <Th>休憩時間</Th>
              <Th minW={'100px'}>実働</Th>
              <Th>申請</Th>
              <Th>備考</Th>
            </Tr>
          </Thead>
          <Tbody position="relative" borderColor="gray.300" borderWidth={1}>
            {dates.map((d) => (
              <Tr key={d.toISO()}>
                <AttendanceTableRow date={d} attendanceData={data} />
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </LayoutWithTab>
  );
};

export default AttendanceView;

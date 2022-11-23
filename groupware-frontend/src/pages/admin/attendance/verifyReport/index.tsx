import LayoutWithTab from '@/components/layout/LayoutWithTab';
import { SidebarScreenName } from '@/components/layout/Sidebar';
import Head from 'next/head';
import React, { useEffect, useState } from 'react';
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
} from '@chakra-ui/react';
import { DateTime } from 'luxon';
import { AttendanceRepo } from 'src/types';
import { attendanceCategoryName } from 'src/utils/factory/attendanceCategoryName';
import { useAPIGetAttendanceReport } from '@/hooks/api/attendance/attendanceReport/useAPIGetAttendanceReport';
import ReportFormModal from '@/components/attendance/ReportFormModal';
import { useAPICreateAttendanceReport } from '@/hooks/api/attendance/attendanceReport/useAPICreateAttendanceReport';
import { responseErrorMsgFactory } from 'src/utils/factory/responseErrorMsgFactory';
import TopTabBar, { TopTabBehavior } from '@/components/layout/TopTabBar';
import { useAPIUpdateAttendanceReport } from '@/hooks/api/attendance/attendanceReport/useAPIUpdateAttendanceReport';
import ReportDetailModal from '@/components/attendance/ReportDetailModal';
import { useAPIDeleteAttendanceReport } from '@/hooks/api/attendance/attendanceReport/useAPIDeleteAttendanceReport';
import { useHeaderTab } from '@/hooks/headerTab/useHeaderTab';
import { useAPIGetAllUnverifiedAttendanceReport } from '@/hooks/api/attendance/attendanceReport/useAPIGetAllUnverifiedAttendanceReport';
import UnverifiedAttendanceReportRow from '@/components/attendance/UnverifiedAttendanceReportRow';

const AttendanceReportAdmin = () => {
  const [isSmallerThan768] = useMediaQuery('(max-width: 768px)');
  const tabs: Tab[] = useHeaderTab({ headerTabType: 'admin' });
  const [month, setMonth] = useState(DateTime.now());
  const { data: data, refetch: refetchReports } =
    useAPIGetAllUnverifiedAttendanceReport({
      from_date: month.startOf('month').toFormat('yyyy-LL-dd'),
      to_date: month.endOf('month').endOf('day').toFormat('yyyy-LL-dd'),
    });

  useEffect(() => {
    refetchReports();
  }, [month, refetchReports]);

  return (
    <LayoutWithTab
      sidebar={{ activeScreenName: SidebarScreenName.ADMIN }}
      header={{
        title: '勤怠報告承認',
        activeTabName: '勤怠報告管理',
        tabs,
      }}>
      <Head>
        <title>FanReturn | 勤怠報告</title>
      </Head>

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
      <Box
        w={'100%'}
        justifyContent={isSmallerThan768 ? 'flex-start' : 'center'}
        alignItems="center"
        display="flex"
        flexDir="column"
        maxW="1980px"
        mx="auto"
        alignSelf="center">
        <Table variant="simple" alignSelf="center" w="100%">
          <Thead bg="white">
            <Tr>
              <Th minW={'100px'}>日付</Th>
              <Th>氏名</Th>
              <Th>メンバー区分</Th>
              <Th>区分</Th>
              <Th>詳細</Th>
            </Tr>
          </Thead>
          {data?.length ? (
            <Tbody position="relative" borderColor="gray.300" borderWidth={1}>
              {data.map((d) => (
                <Tr key={d.id}>
                  <UnverifiedAttendanceReportRow reportData={d} />
                </Tr>
              ))}
            </Tbody>
          ) : null}
        </Table>
        {!data?.length ? (
          <Text mt={20} fontSize={25} textAlign="center" w="100%">
            承認待ちの報告はありません
          </Text>
        ) : null}
      </Box>
    </LayoutWithTab>
  );
};

export default AttendanceReportAdmin;

import LayoutWithTab from '@/components/layout/LayoutWithTab';
import { SidebarScreenName } from '@/components/layout/Sidebar';
import Head from 'next/head';
import React, { useEffect, useMemo, useState } from 'react';
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
  Select,
  Button,
  useToast,
  Modal,
  ModalOverlay,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  Textarea,
  Alert,
} from '@chakra-ui/react';
import { DateTime } from 'luxon';
import {
  Attendance,
  AttendanceCategory,
  AttendanceRepo,
  DefaultAttendance,
  User,
} from 'src/types';
import { useFormik } from 'formik';
import { useAPIGetAttendace } from '@/hooks/api/attendance/useAPIGetAttendance';
import { useAPICreateAttendance } from '@/hooks/api/attendance/useAPICreateAttendance';
import { useAPIUpdateAttendance } from '@/hooks/api/attendance/useAPIUpdateAttendance';
import { useAuthenticate } from 'src/contexts/useAuthenticate';
import { attendanceCategoryName } from 'src/utils/factory/attendanceCategoryName';
import TravelCostFormModal from '@/components/attendance/TravelCostFormModal';
import { attendanceSchema } from 'src/utils/validation/schema';
import { formikErrorMsgFactory } from 'src/utils/factory/formikErrorMsgFactory';
import { useAPIGetDefaultAttendance } from '@/hooks/api/attendance/useAPIGetDefaultAttendance';
import { useAPIGetAttendanceReport } from '@/hooks/api/attendance/attendanceReport/useAPIGetAttendanceReport';
import ReportFormModal from '@/components/attendance/ReportFormModal ';
import { useAPICreateAttendanceReport } from '@/hooks/api/attendance/attendanceReport/useAPICreateAttendanceReport';
import { responseErrorMsgFactory } from 'src/utils/factory/responseErrorMsgFactory';

const AttendanceReportRow = ({
  reportData,
  refetchReports,
}: {
  reportData: AttendanceRepo;
  refetchReports?: () => void;
}) => {
  const [detailModal, setDetailModal] = useState(false);
  const { user } = useAuthenticate();

  return (
    <>
      <Td>
        <Text>
          {DateTime.fromJSDate(new Date(reportData.targetDate)).toFormat(
            'yyyy/LL/dd',
          )}
        </Text>
      </Td>
      <Td>{attendanceCategoryName(reportData.category)}</Td>
      <Td>
        {DateTime.fromJSDate(new Date(reportData.createdAt)).toFormat(
          'yyyy/LL/dd',
        )}
      </Td>
      <Td>
        {DateTime.fromJSDate(new Date(reportData.createdAt)).toFormat(
          'yyyy/LL/dd',
        )}
      </Td>
      <Td>詳細</Td>
    </>
  );
};

const AttendanceReport = () => {
  const [isSmallerThan768] = useMediaQuery('(max-width: 768px)');
  const tabs: Tab[] = [
    { type: 'link', name: '勤怠報告', href: '/attendance/report' },
    { type: 'link', name: '勤怠打刻', href: '/attendance/view' },
    { type: 'link', name: '定時設定', href: '/attendance/default' },
  ];
  const [visibleFormModal, setFormModal] = useState(false);
  const [month, setMonth] = useState(DateTime.now());
  const { data: data, refetch: refetchReports } = useAPIGetAttendanceReport({
    from_date: month.startOf('month').toFormat('yyyy-LL-dd'),
    to_date: month.endOf('month').endOf('day').toFormat('yyyy-LL-dd'),
  });
  const { mutate: saveReport, isSuccess } = useAPICreateAttendanceReport({
    onSuccess: () => {
      setFormModal(false);
      alert('新規勤怠報告を作成しました。');
      refetchReports();
    },
    onError: (e) => {
      alert(responseErrorMsgFactory(e));
    },
  });

  const handleSaveReport = (report: Partial<AttendanceRepo>) => {
    let isSameDateReportExist = false;
    if (data) {
      for (const d of data) {
        if (
          report?.targetDate &&
          DateTime.fromJSDate(new Date(d.targetDate)).toFormat('yyyy/LL/dd') ===
            DateTime.fromJSDate(new Date(report?.targetDate)).toFormat(
              'yyyy/LL/dd',
            )
        ) {
          isSameDateReportExist = true;
        }
      }
    }
    if (isSameDateReportExist) {
      alert('同じ日付の報告が既に存在しています');
    } else {
      saveReport(report);
    }
  };

  useEffect(() => {
    refetchReports();
  }, [month, refetchReports]);

  return (
    <LayoutWithTab
      sidebar={{ activeScreenName: SidebarScreenName.ATTENDANCE }}
      header={{
        title: '勤怠報告',
        tabs,
        activeTabName: '勤怠報告',
        rightButtonName: '新規勤怠報告',
        onClickRightButton: () => setFormModal(true),
      }}>
      <Head>
        <title>ボールド | 勤怠打刻</title>
      </Head>
      <ReportFormModal
        isOpen={visibleFormModal}
        onCloseModal={() => setFormModal(false)}
        onSubmit={(report) => handleSaveReport(report)}
        isSuccess={isSuccess}
      />

      <Box display="flex" flexDir="row" justifyContent="flex-start" mb="16px">
        <FormControl>
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
        overflowX="auto"
        maxW="1980px"
        mx="auto"
        alignSelf="center">
        <Table variant="simple" alignSelf="center" w="100%" overflowX="auto">
          <Thead bg="white">
            <Tr>
              <Th minW={'100px'}>日付</Th>
              <Th>区分</Th>
              <Th>送信日</Th>
              <Th>受理日</Th>
              <Th>詳細</Th>
            </Tr>
          </Thead>
          {data?.length ? (
            <Tbody position="relative" borderColor="gray.300" borderWidth={1}>
              {data.map((d) => (
                <Tr key={d.id}>
                  <AttendanceReportRow
                    reportData={d}
                    refetchReports={refetchReports}
                  />
                </Tr>
              ))}
            </Tbody>
          ) : null}
        </Table>
      </Box>
      {!data?.length && (
        <Text mt={20} fontSize={25} textAlign="center">
          承認済みの報告はありません
        </Text>
      )}
    </LayoutWithTab>
  );
};

export default AttendanceReport;

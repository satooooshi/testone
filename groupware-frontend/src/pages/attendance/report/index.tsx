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

const AttendanceReportRow = ({
  reportData,
  refetchReports,
}: {
  reportData: AttendanceRepo;
  refetchReports?: () => void;
}) => {
  const [detailModal, setDetailModal] = useState(false);
  const [visibleFormModal, setFormModal] = useState(false);
  const { mutate: saveReport, isSuccess } = useAPIUpdateAttendanceReport({
    onSuccess: () => {
      setFormModal(false);
      alert('勤怠報告を更新しました。');
      if (refetchReports) {
        refetchReports();
      }
    },
    onError: (e) => {
      alert(responseErrorMsgFactory(e));
    },
  });

  return (
    <>
      <ReportFormModal
        report={reportData}
        isOpen={visibleFormModal}
        onCloseModal={() => setFormModal(false)}
        onSubmit={(report) => saveReport(report)}
        isSuccess={isSuccess}
      />
      <ReportDetailModal
        report={reportData}
        isOpen={detailModal}
        onCloseModal={() => setDetailModal(false)}
      />
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
      {reportData.verifiedAt ? (
        <Td>
          {DateTime.fromJSDate(new Date(reportData.createdAt)).toFormat(
            'yyyy/LL/dd',
          )}
        </Td>
      ) : (
        <Td>
          <Button
            fontSize={16}
            colorScheme="blue"
            onClick={() => setFormModal(true)}>
            編集
          </Button>
        </Td>
      )}
      <Td>
        <Button
          fontSize={16}
          colorScheme="blue"
          onClick={() => setDetailModal(true)}>
          詳細
        </Button>
      </Td>
    </>
  );
};

const AttendanceReport = () => {
  const [isSmallerThan768] = useMediaQuery('(max-width: 768px)');
  const tabs: Tab[] = [
    { type: 'link', name: '勤怠打刻', href: '/attendance/view' },
    { type: 'link', name: '勤怠報告', href: '/attendance/report' },
    { type: 'link', name: '入社前申請', href: '/attendance/application' },
  ];
  const [visibleFormModal, setFormModal] = useState(false);
  const [activeTabName, setActiveTabName] = useState('reportAfterAccepted');
  const [unAcceptedReport, setUnAcceptedREport] = useState<
    AttendanceRepo[] | undefined
  >();
  const [acceptedReport, setAcceptedREport] = useState<
    AttendanceRepo[] | undefined
  >();
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
  const topTabBehaviorList: TopTabBehavior[] = [
    {
      tabName: '承認済みの報告',
      onClick: () => {
        setActiveTabName('reportAfterAccepted');
      },
      isActiveTab: activeTabName === 'reportAfterAccepted',
    },
    {
      tabName: '承認前の報告',
      onClick: () => {
        setActiveTabName('reportBeforeAccepted');
      },
      isActiveTab: activeTabName === 'reportBeforeAccepted',
    },
  ];

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

  useEffect(() => {
    if (data?.length) {
      const UnAcceptedRepo = data?.filter((d) => d.verifiedAt == null);
      const acceptedRepo = data?.filter((d) => d.verifiedAt != null);

      setUnAcceptedREport(UnAcceptedRepo);
      setAcceptedREport(acceptedRepo);
    } else {
      setUnAcceptedREport(undefined);
      setAcceptedREport(undefined);
    }
  }, [data, data?.length]);

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
      <Box mb="24px">
        <TopTabBar topTabBehaviorList={topTabBehaviorList} />
      </Box>
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
              <Th>
                {activeTabName === 'reportAfterAccepted' ? '受理日' : '編集'}
              </Th>
              <Th>詳細</Th>
            </Tr>
          </Thead>
          {activeTabName === 'reportAfterAccepted' && acceptedReport?.length ? (
            <Tbody position="relative" borderColor="gray.300" borderWidth={1}>
              {acceptedReport.map((d) => (
                <Tr key={d.id}>
                  <AttendanceReportRow
                    reportData={d}
                    refetchReports={refetchReports}
                  />
                </Tr>
              ))}
            </Tbody>
          ) : null}
          {activeTabName === 'reportBeforeAccepted' &&
          unAcceptedReport?.length ? (
            <Tbody position="relative" borderColor="gray.300" borderWidth={1}>
              {unAcceptedReport.map((d) => (
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
      {activeTabName === 'reportAfterAccepted' && !acceptedReport?.length && (
        <Text mt={20} fontSize={25} textAlign="center">
          承認済みの報告はありません
        </Text>
      )}
      {activeTabName === 'reportBeforeAccepted' && !unAcceptedReport?.length && (
        <Text mt={20} fontSize={25} textAlign="center">
          承認済みの報告はありません
        </Text>
      )}
    </LayoutWithTab>
  );
};

export default AttendanceReport;

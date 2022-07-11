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
} from '@chakra-ui/react';
import { DateTime } from 'luxon';
import {
  Attendance,
  AttendanceCategory,
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
import { attendanceSchema, emptySchema } from 'src/utils/validation/schema';
import { formikErrorMsgFactory } from 'src/utils/factory/formikErrorMsgFactory';
import { useAPIGetDefaultAttendance } from '@/hooks/api/attendance/useAPIGetDefaultAttendance';
import DefaultModal from 'src/components/attendance/DefaultModal';
import { isDisplayableWorkingTime } from 'src/utils/factory/isDisplayableWorkingTime';
import router from 'next/router';

const AttendanceTableRow = ({
  date,
  attendanceData,
}: {
  date: DateTime;
  attendanceData?: Attendance[];
}) => {
  const [detailModal, setDetailModal] = useState(false);
  const { user } = useAuthenticate();
  const [hasWorkingTime, setHasWorkingTime] = useState(true);
  // const [WorkingTime, setWorkingTime] = useState<string | undefined>();
  const [selectedDateForApplication, setSelectedDateForApplication] =
    useState<DateTime>();
  const toast = useToast();
  const targetData = attendanceData?.filter(
    (a) =>
      DateTime.fromJSDate(new Date(a?.targetDate)).toFormat('yyyy-LL-dd') ===
      date.toFormat('yyyy-LL-dd'),
  )?.[0];
  const initialValues: Partial<Attendance> = {
    category: AttendanceCategory.COMMON,
    targetDate: date.toJSDate(),
    breakMinutes: '00:00',
    user: user as User,
    travelCost: [],
  };
  const { mutate: createAttendance } = useAPICreateAttendance({
    onSuccess: (created) => {
      setValues(created);
      toast({
        title: '申請が完了しました',
        status: 'success',
      });
    },
  });
  const { mutate: updateAttendance } = useAPIUpdateAttendance({
    onSuccess: () => {
      toast({
        title: '更新が完了しました',
        status: 'success',
      });
    },
  });

  const validate = () => {
    const errorMsg = formikErrorMsgFactory(errors);
    if (errorMsg && hasWorkingTime) {
      toast({
        description: errorMsg,
        status: 'error',
        isClosable: true,
      });
    }
  };
  const { values, handleSubmit, setValues, errors } = useFormik({
    initialValues: targetData || initialValues,
    enableReinitialize: true,
    validationSchema: hasWorkingTime ? attendanceSchema : undefined,
    validateOnChange: true,
    validateOnMount: true,
    onSubmit: (submitted) => {
      if (
        submitted?.targetDate &&
        new Date(submitted?.targetDate)?.getMonth() !== new Date().getMonth()
      ) {
        toast({
          title: '今月のデータのみ編集可能です',
          status: 'error',
        });
        return;
      }
      submitted.travelCost = submitted?.travelCost?.filter(
        (t) => !!t.travelCost,
      );
      if (submitted?.id) {
        updateAttendance(submitted as Attendance);
        return;
      }
      createAttendance(submitted);
    },
  });

  const dateToTime = (target: Date | string | undefined) => {
    if (!target) {
      return undefined;
    }
    const dateObj = new Date(target);
    if (dateObj instanceof Date) {
      return DateTime.fromJSDate(dateObj).toFormat('HH:mm');
    }
    return undefined;
  };
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

  useEffect(() => {
    if (targetData) {
      setValues(targetData);
    }
  }, [setValues, targetData]);

  useEffect(() => {
    if (values.category) {
      setHasWorkingTime(isDisplayableWorkingTime(values.category));
    }
  }, [values.category]);
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
      <TravelCostFormModal
        isOpen={!!selectedDateForApplication}
        onClose={() => setSelectedDateForApplication(undefined)}
        attendance={values}
        setAttendance={setValues}
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        date={selectedDateForApplication}
      />
      <Td>
        <Text
          color={
            values.category !== AttendanceCategory.COMMON
              ? values.verifiedAt
                ? 'red'
                : 'blue'
              : 'black'
          }>
          {date.setLocale('ja').toFormat('d日(EEE)')}
        </Text>
      </Td>
      {targetData ? (
        <>
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
            <Button
              onClick={() => setSelectedDateForApplication(date)}
              colorScheme="blue">
              申請
            </Button>
          </Td>
          <Td>
            <Button colorScheme="blue" onClick={() => setDetailModal(true)}>
              備考
            </Button>
          </Td>
        </>
      ) : null}
    </>
  );
};

const AttendanceView = () => {
  const { id } = router.query as { id: string };
  const [isSmallerThan768] = useMediaQuery('(max-width: 768px)');
  const { data: defaultData } = useAPIGetDefaultAttendance();
  const tabs: Tab[] = [
    { type: 'link', name: '勤怠打刻', href: `/admin/attendance/view/${id}` },
    { type: 'link', name: '勤怠報告', href: `/admin/attendance/report/${id}` },
  ];
  const [visibleDefaultModal, setDefaultModal] = useState(false);
  const [month, setMonth] = useState(DateTime.now());
  const { data } = useAPIGetAttendace({
    id: Number(id),
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
        title: '勤怠打刻',
        tabs,
        activeTabName: '勤怠打刻',
      }}>
      <Head>
        <title>ボールド | 勤怠打刻</title>
      </Head>
      <DefaultModal
        onCloseModal={() => setDefaultModal(false)}
        isOpen={visibleDefaultModal}
      />

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

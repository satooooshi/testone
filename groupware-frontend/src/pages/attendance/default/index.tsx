import LayoutWithTab from '@/components/layout/LayoutWithTab';
import { SidebarScreenName } from '@/components/layout/Sidebar';
import { useAPICreateDefaultAttendance } from '@/hooks/api/attendance/useAPICreateDefaultAttendance';
import { useAPIGetDefaultAttendance } from '@/hooks/api/attendance/useAPIGetDefaultAttendance';
import { useAPIUpdateDefaultAttendance } from '@/hooks/api/attendance/useAPIUpdateDefaultAttendance';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  useToast,
} from '@chakra-ui/react';
import { useFormik } from 'formik';
import Head from 'next/head';
import React from 'react';
import { DefaultAttendance } from 'src/types';
import { Tab } from 'src/types/header/tab/types';

const initialValues: Partial<DefaultAttendance> = {
  attendanceTime: '00:00',
  absenceTime: '00:00',
  breakMinutes: '00:00',
};

const Default: React.FC = () => {
  const { data } = useAPIGetDefaultAttendance();
  const toast = useToast();
  const { mutate: updateDefaultAttendance } = useAPIUpdateDefaultAttendance({
    onSuccess: (updated) => {
      setValues(updated);
      toast({
        title: '更新が完了しました',
        status: 'success',
      });
    },
  });
  const { mutate: createDefaultAttendance } = useAPICreateDefaultAttendance({
    onSuccess: (created) => {
      setValues(created);
      toast({
        title: '登録が完了しました',
        status: 'success',
      });
    },
  });
  const { values, setValues, handleSubmit } = useFormik({
    initialValues: data || initialValues,
    enableReinitialize: true,
    onSubmit: (submitted) => {
      if (submitted?.id) {
        updateDefaultAttendance(submitted as DefaultAttendance);
        return;
      }
      createDefaultAttendance(submitted);
    },
  });
  const tabs: Tab[] = [
    { type: 'link', name: '勤怠打刻', href: '/attendance/view' },
    { type: 'link', name: '定時設定', href: '/attendance/default' },
  ];

  return (
    <LayoutWithTab
      sidebar={{ activeScreenName: SidebarScreenName.ATTENDANCE }}
      header={{
        title: '定時設定',
        tabs,
        activeTabName: '定時設定',
      }}>
      <Head>
        <title>ボールド | 定時設定</title>
      </Head>
      <Box
        display="flex"
        flexDir="row"
        justifyContent="flex-start"
        mb="16px"
        w="300px">
        <FormControl display="flex" flexDir="row" alignItems="center">
          <FormLabel mr="16px" w="40%">
            出勤時刻
          </FormLabel>
          <Input
            type="time"
            value={values.attendanceTime}
            onChange={(e) => {
              setValues((v) => ({
                ...v,
                attendanceTime: e.target.value,
              }));
            }}
          />
        </FormControl>
      </Box>
      <Box
        display="flex"
        flexDir="row"
        justifyContent="flex-start"
        mb="16px"
        w="300px">
        <FormControl display="flex" flexDir="row" alignItems="center">
          <FormLabel mr="16px" w="40%">
            退勤時刻
          </FormLabel>
          <Input
            type="time"
            value={values.absenceTime}
            onChange={(e) => {
              setValues((v) => ({
                ...v,
                absenceTime: e.target.value,
              }));
            }}
          />
        </FormControl>
      </Box>
      <Box
        display="flex"
        flexDir="row"
        justifyContent="flex-start"
        mb="16px"
        w="300px">
        <FormControl display="flex" flexDir="row" alignItems="center">
          <FormLabel mr="16px" w="40%">
            休憩時間
          </FormLabel>
          <Input
            type="time"
            value={values?.breakMinutes}
            onChange={(e) => {
              setValues((v) => ({ ...v, breakMinutes: e.target.value }));
            }}
          />
        </FormControl>
      </Box>
      <Button colorScheme="green" onClick={() => handleSubmit()}>
        保存
      </Button>
    </LayoutWithTab>
  );
};

export default Default;

import LayoutWithTab from '@/components/layout/LayoutWithTab';
import { SidebarScreenName } from '@/components/layout/Sidebar';
import Head from 'next/head';
import React from 'react';
import PortalLinkBox, { PortalLinkType } from '@/components/PortalLinkBox';
import { Tab } from 'src/types/header/tab/types';
import {
  Box,
  FormControl,
  FormLabel,
  Input,
  SimpleGrid,
} from '@chakra-ui/react';

const Attendance = () => {
  const tabs: Tab[] = [
    { type: 'link', name: '勤怠管理 Home', href: '/attendance' },
  ];

  return (
    <LayoutWithTab
      sidebar={{ activeScreenName: SidebarScreenName.QA }}
      header={{
        title: '勤怠管理',
        tabs,
        activeTabName: '勤怠管理 Home',
      }}>
      <Head>
        <title>ボールド | 勤怠打刻</title>
      </Head>

      <Box>
        <FormControl>
          <FormLabel>対象月</FormLabel>
          <Input type="month" />
        </FormControl>
      </Box>
    </LayoutWithTab>
  );
};

export default Attendance;

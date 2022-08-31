import LayoutWithTab from '@/components/layout/LayoutWithTab';
import { SidebarScreenName } from '@/components/layout/Sidebar';
import Head from 'next/head';
import React from 'react';
import PortalLinkBox, { PortalLinkType } from '@/components/PortalLinkBox';
import { Tab } from 'src/types/header/tab/types';
import { SimpleGrid } from '@chakra-ui/react';

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
        <title>ボールド | 社内Wiki</title>
      </Head>

      <SimpleGrid columns={{ sm: 1, md: 2, lg: 3 }} spacing={'16px'}>
        <PortalLinkBox href={PortalLinkType.ATTENDANCE_VIEW} />
        <PortalLinkBox href={PortalLinkType.ATTENDANCE_REPORT} />
        <PortalLinkBox href={PortalLinkType.APPLICATION} />
      </SimpleGrid>
    </LayoutWithTab>
  );
};

export default Attendance;

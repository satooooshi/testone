import LayoutWithTab from '@/components/layout/LayoutWithTab';
import { SidebarScreenName } from '@/components/layout/Sidebar';
import Head from 'next/head';
import React from 'react';
import PortalLinkBox, { PortalLinkType } from '@/components/PortalLinkBox';
import { Tab } from 'src/types/header/tab/types';
import { useHeaderTab } from '@/hooks/headerTab/useHeaderTab';
import { SimpleGrid } from '@chakra-ui/react';

const Wiki = () => {
  const tabs: Tab[] = useHeaderTab({ headerTabType: 'wiki' });

  return (
    <LayoutWithTab
      sidebar={{ activeScreenName: SidebarScreenName.QA }}
      header={{
        title: '社内Wiki',
        tabs,
        activeTabName: '社内Wiki Home',
      }}>
      <Head>
        <title>ボールド | 社内Wiki</title>
      </Head>

      <SimpleGrid columns={{ sm: 1, md: 2, lg: 3 }} spacing={'16px'}>
        <PortalLinkBox href={PortalLinkType.RULES} />
        <PortalLinkBox href={PortalLinkType.ALL_POSTAL} />
        <PortalLinkBox href={PortalLinkType.BOARD} />
        <PortalLinkBox href={PortalLinkType.MAIL_MAGAZINE} />
        <PortalLinkBox href={PortalLinkType.INTERVIEW} />
      </SimpleGrid>
    </LayoutWithTab>
  );
};

export default Wiki;

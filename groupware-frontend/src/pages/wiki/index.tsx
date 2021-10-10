import LayoutWithTab from '@/components/LayoutWithTab';
import { ScreenName } from '@/components/Sidebar';
import Head from 'next/head';
import React from 'react';
import homeStyles from '@/styles/layouts/Home.module.scss';
import PortalLinkBox, { PortalLinkType } from '@/components/PortalLinkBox';
import { Tab } from 'src/types/header/tab/types';
import { useHeaderTab } from '@/hooks/headerTab/useHeaderTab';

const Wiki = () => {
  const tabs: Tab[] = useHeaderTab({ headerTabType: 'wiki' });

  return (
    <LayoutWithTab
      sidebar={{ activeScreenName: ScreenName.QA }}
      header={{
        title: '社内Wiki',
        tabs,
        activeTabName: '社内Wiki Home',
      }}>
      <Head>
        <title>ボールド | 社内Wiki</title>
      </Head>

      <div className={homeStyles.box_row_wrapper}>
        <div className={homeStyles.box_wrapper}>
          <PortalLinkBox href={PortalLinkType.RULES} />
        </div>
        <div className={homeStyles.box_wrapper}>
          <PortalLinkBox href={PortalLinkType.KNOWLEDGE} />
        </div>
        <div className={homeStyles.box_wrapper}>
          <PortalLinkBox href={PortalLinkType.QA} />
        </div>
      </div>
    </LayoutWithTab>
  );
};

export default Wiki;

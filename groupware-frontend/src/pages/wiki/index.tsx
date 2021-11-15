import LayoutWithTab from '@/components/layout/LayoutWithTab';
import { SidebarScreenName } from '@/components/layout/Sidebar';
import Head from 'next/head';
import React from 'react';
import wikiStyles from '@/styles/layouts/Wiki.module.scss';
import PortalLinkBox, { PortalLinkType } from '@/components/PortalLinkBox';
import { Tab } from 'src/types/header/tab/types';
import { useHeaderTab } from '@/hooks/headerTab/useHeaderTab';

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

      <div className={wikiStyles.box_row_wrapper}>
        <div className={wikiStyles.box_wrapper}>
          <PortalLinkBox href={PortalLinkType.RULES} />
        </div>
        <div className={wikiStyles.box_wrapper}>
          <PortalLinkBox href={PortalLinkType.ALL_POSTAL} />
        </div>
        <div className={wikiStyles.box_wrapper}>
          <PortalLinkBox href={PortalLinkType.KNOWLEDGE} />
        </div>
        <div className={wikiStyles.box_wrapper}>
          <PortalLinkBox href={PortalLinkType.QA} />
        </div>
      </div>
    </LayoutWithTab>
  );
};

export default Wiki;

import { SidebarScreenName } from '@/components/layout/Sidebar';
import { Tab } from 'src/types/header/tab/types';
import LayoutWithTab from '@/components/layout/LayoutWithTab';
import homeStyles from '@/styles/layouts/Home.module.scss';
import PortalLinkBox, { PortalLinkType } from '@/components/PortalLinkBox';
import Head from 'next/head';
import { useHeaderTab } from '@/hooks/headerTab/useHeaderTab';

export default function Home() {
  const tabs: Tab[] = useHeaderTab({ headerTabType: 'home' });

  return (
    <LayoutWithTab
      sidebar={{ activeScreenName: SidebarScreenName.HOME }}
      header={{
        title: 'Home',
        activeTabName: 'ダッシュボード',
        tabs: tabs,
      }}>
      <Head>
        <title>ボールド | Home</title>
      </Head>
      <div className={homeStyles.box_row_wrapper}>
        <div className={homeStyles.box_wrapper}>
          <PortalLinkBox href={PortalLinkType.IMPRESSIVE_UNIVERSITY} />
        </div>
        <div className={homeStyles.box_wrapper}>
          <PortalLinkBox href={PortalLinkType.STUDY_MEETING} />
        </div>
        <div className={homeStyles.box_wrapper}>
          <PortalLinkBox href={PortalLinkType.BOLDAY} />
        </div>
        <div className={homeStyles.box_wrapper}>
          <PortalLinkBox href={PortalLinkType.COACH} />
        </div>
        <div className={homeStyles.box_wrapper}>
          <PortalLinkBox href={PortalLinkType.CLUB} />
        </div>
        <div className={homeStyles.box_wrapper}>
          <PortalLinkBox href={PortalLinkType.SUBMISSION_ETC} />
        </div>
        <div className={homeStyles.box_wrapper}>
          <PortalLinkBox href={PortalLinkType.WIKI} />
        </div>
        <div className={homeStyles.box_wrapper}>
          <PortalLinkBox href={PortalLinkType.CHAT} />
        </div>
        <div className={homeStyles.box_wrapper}>
          <PortalLinkBox href={PortalLinkType.ACCOUNT} />
        </div>
      </div>
    </LayoutWithTab>
  );
}

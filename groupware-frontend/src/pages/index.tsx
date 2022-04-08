import { SidebarScreenName } from '@/components/layout/Sidebar';
import { Tab } from 'src/types/header/tab/types';
import LayoutWithTab from '@/components/layout/LayoutWithTab';
import homeStyles from '@/styles/layouts/Home.module.scss';
import PortalLinkBox, { PortalLinkType } from '@/components/PortalLinkBox';
import Head from 'next/head';
import { useHeaderTab } from '@/hooks/headerTab/useHeaderTab';
import { useAPILogout } from '@/hooks/api/auth/useAPILogout';
import { axiosInstance } from 'src/utils/url';
import { jsonHeader } from 'src/utils/url/header';
import router from 'next/router';

export default function Home() {
  const tabs: Tab[] = useHeaderTab({ headerTabType: 'home' });
  const { mutate: logout } = useAPILogout({
    onSuccess: () => {
      const removeLocalStorage = async () => {
        await Promise.resolve();
        localStorage.removeItem('userToken');
        axiosInstance.defaults.headers = jsonHeader;
      };
      removeLocalStorage();
      router.push('/login');
    },
  });

  return (
    <LayoutWithTab
      sidebar={{ activeScreenName: SidebarScreenName.HOME }}
      header={{
        title: 'Home',
        activeTabName: 'ダッシュボード',
        tabs: tabs,
        rightButtonName: 'ログアウト',
        onClickRightButton: () => logout(),
      }}>
      <Head>
        <title>ボールド | Home</title>
      </Head>
      <div className={homeStyles.box_row_wrapper}>
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
        <div className={homeStyles.box_wrapper}>
          <PortalLinkBox href={PortalLinkType.MYSCHEDULE} />
        </div>
      </div>
    </LayoutWithTab>
  );
}

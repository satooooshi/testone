import LayoutWithTab from '@/components/layout/LayoutWithTab';
import { SidebarScreenName } from '@/components/layout/Sidebar';
import {
  QueryToGetEventCsv,
  useAPIDownloadEventCsv,
} from '@/hooks/api/event/useAPIDownloadEventCsv';
import {
  QueryToGetUserCsv,
  useAPIDownloadUserCsv,
} from '@/hooks/api/user/useAPIDownloadUserCsv';
import { Button, Progress, Spinner, Text } from '@chakra-ui/react';
import Head from 'next/head';
import React, { useEffect, useState } from 'react';
import { DatePicker } from 'react-rainbow-components';
import { Tab } from 'src/types/header/tab/types';
import exportCsvStyles from '@/styles/layouts/admin/ExportCsv.module.scss';
import clsx from 'clsx';
import { useHeaderTab } from '@/hooks/headerTab/useHeaderTab';
import { useRouter } from 'next/router';
import { useAuthenticate } from 'src/contexts/useAuthenticate';
import { UserRole } from 'src/types';

const ExportCsv = () => {
  const router = useRouter();
  const { user } = useAuthenticate();
  const [eventDuration, setEventDuration] =
    useState<Partial<QueryToGetEventCsv>>();
  const [userDuration, setUserDuration] =
    useState<Partial<QueryToGetUserCsv>>();
  const { mutate: downloadEvent, isLoading: loadingEventCsv } =
    useAPIDownloadEventCsv();
  const { mutate: downloadUser, isLoading: loadingUserCsv } =
    useAPIDownloadUserCsv();
  const tabs: Tab[] = useHeaderTab({ headerTabType: 'admin' });
  const [loadingUserRole, setLoadingUserRole] = useState(true);

  useEffect(() => {
    if (user?.role !== UserRole.ADMIN) {
      router.back();
      return;
    }
    setLoadingUserRole(false);
  }, [user, router]);

  if (loadingUserRole) {
    return <Progress isIndeterminate size="lg" />;
  }

  return (
    <LayoutWithTab
      sidebar={{ activeScreenName: SidebarScreenName.ADMIN }}
      header={{
        title: 'Admin',
        activeTabName: 'CSV出力',
        tabs,
      }}>
      <Head>
        <title>CSV出力</title>
      </Head>
      <div className={exportCsvStyles.main}>
        <div
          className={clsx(
            exportCsvStyles.form_wrapper,
            exportCsvStyles.event_export_form,
          )}>
          <p className={clsx(exportCsvStyles.mb_8, exportCsvStyles.sub_title)}>
            社員データの出力
          </p>
          <div className={exportCsvStyles.duration_wrapper}>
            <div
              className={clsx(
                exportCsvStyles.mb_8,
                exportCsvStyles.date_select_wrapper,
              )}>
              <DatePicker
                value={userDuration?.from}
                onChange={(d) =>
                  setUserDuration((prev) => ({ ...prev, from: d }))
                }
                label="開始日"
                formatStyle={'medium'}
              />
            </div>
            <div
              className={clsx(
                exportCsvStyles.mb_8,
                exportCsvStyles.date_select_wrapper,
              )}>
              <DatePicker
                value={userDuration?.to}
                onChange={(d) =>
                  setUserDuration((prev) => ({ ...prev, to: d }))
                }
                label="終了日"
                formatStyle={'medium'}
              />
            </div>
          </div>
          <p
            className={clsx(
              exportCsvStyles.mb_8,
              exportCsvStyles.annotation_text,
            )}>
            ※イベント参加数などを開始日で選択した日付以降、終了日で指定した日付以前でフィルタリングして出力されます
          </p>
          <div className={exportCsvStyles.download_button_wrapper}>
            <Button
              onClick={() => downloadUser(userDuration || {})}
              colorScheme="green">
              {loadingUserCsv ? <Spinner /> : <Text>ダウンロード</Text>}
            </Button>
          </div>
        </div>
        <div className={clsx(exportCsvStyles.form_wrapper)}>
          <p className={clsx(exportCsvStyles.mb_8, exportCsvStyles.sub_title)}>
            イベントデータの出力
          </p>
          <div className={clsx(exportCsvStyles.duration_wrapper)}>
            <div
              className={clsx(
                exportCsvStyles.date_select_wrapper,
                exportCsvStyles.mb_8,
              )}>
              <DatePicker
                value={eventDuration?.from}
                onChange={(d) =>
                  setEventDuration((prev) => ({ ...prev, from: d }))
                }
                label="開始日"
                formatStyle={'medium'}
              />
            </div>
            <div
              className={clsx(
                exportCsvStyles.date_select_wrapper,
                exportCsvStyles.mb_8,
              )}>
              <DatePicker
                value={eventDuration?.to}
                onChange={(d) =>
                  setEventDuration((prev) => ({ ...prev, to: d }))
                }
                label="終了日"
                formatStyle={'medium'}
              />
            </div>
          </div>
          <p
            className={clsx(
              exportCsvStyles.mb_8,
              exportCsvStyles.annotation_text,
            )}>
            ※提出物等を除いて出力されます
          </p>
          <p
            className={clsx(
              exportCsvStyles.mb_8,
              exportCsvStyles.annotation_text,
            )}>
            ※開始日で選択した日付以降、終了日で指定した日付以前に終了したイベントデータが出力されます
          </p>
          <div className={exportCsvStyles.download_button_wrapper}>
            <Button
              onClick={() => downloadEvent(eventDuration || {})}
              colorScheme="green">
              {loadingEventCsv ? <Spinner /> : <Text>ダウンロード</Text>}
            </Button>
          </div>
        </div>
      </div>
    </LayoutWithTab>
  );
};

export default ExportCsv;

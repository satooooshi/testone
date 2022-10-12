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
import {
  Box,
  Button,
  Heading,
  Progress,
  Spinner,
  Text,
} from '@chakra-ui/react';
import Head from 'next/head';
import React, { useEffect, useState } from 'react';
import DatePicker from 'node_modules/react-rainbow-components/components/DatePicker';
import { Tab } from 'src/types/header/tab/types';
import { useHeaderTab } from '@/hooks/headerTab/useHeaderTab';
import { useRouter } from 'next/router';
import { useAuthenticate } from 'src/contexts/useAuthenticate';
import { UserRole } from 'src/types';
import { darkFontColor } from 'src/utils/colors';

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
      <Box display="flex" flexDir="column" w="100%" pt={8}>
        <Heading size="md">社員データの出力</Heading>
        <Box w="100%" bg="white" mt={3} py={8} px={5} rounded={10}>
          <Box
            display="flex"
            flexDir="column"
            w="100%"
            maxW="800px"
            mx="auto"
            justifyContent="center">
            <Box
              display="flex"
              flexDir="row"
              alignItems="center"
              justifyContent="center"
              w="100%">
              <Heading size="sm" mr={5} whiteSpace="nowrap">
                開始日
              </Heading>
              <Box minW="200px" maxW="500px" w="100%">
                <DatePicker
                  value={userDuration?.from}
                  onChange={(d) =>
                    setUserDuration((prev) => ({ ...prev, from: d }))
                  }
                  placeholder="選択して下さい"
                  formatStyle="large"
                />
              </Box>
            </Box>
            <Box
              display="flex"
              flexDir="row"
              alignItems="center"
              justifyContent="center"
              w="100%"
              mt={8}>
              <Heading size="sm" mr={5} whiteSpace="nowrap">
                終了日
              </Heading>
              <Box minW="200px" maxW="500px" w="100%">
                <DatePicker
                  value={userDuration?.to}
                  onChange={(d) =>
                    setUserDuration((prev) => ({ ...prev, to: d }))
                  }
                  placeholder="選択して下さい"
                  formatStyle="large"
                />
              </Box>
            </Box>

            <Text color={darkFontColor} mt={5}>
              ※イベント参加数などを開始日で選択した日付以降、終了日で指定した日付以前でフィルタリングして出力されます
            </Text>
            <Box w="100%" mt={5}>
              <Button
                w="100%"
                onClick={() => downloadUser(userDuration || {})}
                colorScheme="blue"
                rounded={50}
                variant="outline">
                {loadingUserCsv ? <Spinner /> : <Text>CSV出力</Text>}
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>
      <Box display="flex" flexDir="column" w="100%" pt={10}>
        <Heading size="md">イベントデータの出力</Heading>
        <Box w="100%" bg="white" mt={3} py={8} px={5} rounded={10}>
          <Box
            display="flex"
            flexDir="column"
            w="100%"
            maxW="800px"
            mx="auto"
            justifyContent="center">
            <Box
              display="flex"
              flexDir="row"
              alignItems="center"
              justifyContent="center"
              w="100%">
              <Heading size="sm" mr={5} whiteSpace="nowrap">
                開始日
              </Heading>
              <Box minW="200px" maxW="500px" w="100%">
                <DatePicker
                  value={eventDuration?.from}
                  onChange={(d) =>
                    setEventDuration((prev) => ({ ...prev, from: d }))
                  }
                  placeholder="選択して下さい"
                  formatStyle="large"
                />
              </Box>
            </Box>
            <Box
              display="flex"
              flexDir="row"
              alignItems="center"
              justifyContent="center"
              w="100%"
              mt={8}>
              <Heading size="sm" mr={5} whiteSpace="nowrap">
                終了日
              </Heading>
              <Box minW="200px" maxW="500px" w="100%">
                <DatePicker
                  value={eventDuration?.to}
                  onChange={(d) =>
                    setEventDuration((prev) => ({ ...prev, to: d }))
                  }
                  placeholder="選択して下さい"
                  formatStyle="large"
                />
              </Box>
            </Box>

            <Text color={darkFontColor} mt={3}>
              ※開始日で選択した日付以降、終了日で指定した日付以前に終了したイベントデータが出力されます
            </Text>
            <Box w="100%" mt={5}>
              <Button
                w="100%"
                onClick={() => downloadEvent(eventDuration || {})}
                colorScheme="blue"
                rounded={50}
                variant="outline">
                {loadingUserCsv ? <Spinner /> : <Text>CSV出力</Text>}
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>
    </LayoutWithTab>
  );
};

export default ExportCsv;

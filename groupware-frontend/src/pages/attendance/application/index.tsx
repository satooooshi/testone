import ApplicationFormModal from '@/components/attendance/ApplicationFormModal';
import LayoutWithTab from '@/components/layout/LayoutWithTab';
import { SidebarScreenName } from '@/components/layout/Sidebar';
import { useAPIGetApplication } from '@/hooks/api/attendance/application/useAPIGetApplication';
import {
  Box,
  Button,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useMediaQuery,
} from '@chakra-ui/react';
import { DateTime } from 'luxon';
import Head from 'next/head';
import React, { useState } from 'react';
import { ApplicationBeforeJoining } from 'src/types';
import { Tab } from 'src/types/header/tab/types';

const Application: React.FC = () => {
  const { data, refetch } = useAPIGetApplication();
  const [modal, setModal] = useState(false);
  const [selectedApplication, setSelectedApplication] =
    useState<ApplicationBeforeJoining>();
  const [isSmallerThan768] = useMediaQuery('(max-width: 768px)');
  const tabs: Tab[] = [
    {
      type: 'link',
      name: '入社前申請',
      href: '/attendance/application',
    },
  ];
  return (
    <LayoutWithTab
      sidebar={{ activeScreenName: SidebarScreenName.ATTENDANCE }}
      header={{
        title: '入社前申請',
        tabs,
        activeTabName: '入社前申請',
      }}>
      <Head>
        <title>ボールド | 入社前申請</title>
      </Head>
      <ApplicationFormModal
        application={selectedApplication}
        onClose={() => {
          setSelectedApplication(undefined);
          setModal(false);
          refetch();
        }}
        isOpen={modal}
      />

      <Box
        w={isSmallerThan768 ? '100%' : '80%'}
        justifyContent={isSmallerThan768 ? 'flex-start' : 'center'}
        alignItems="center"
        display="flex"
        overflowX="auto"
        maxW="1980px"
        mx="auto"
        alignSelf="center">
        <Table variant="simple" alignSelf="center" w="100%" overflowX="auto">
          <Thead bg="white">
            <Tr>
              <Th minW={'100px'}>日付</Th>
              <Th>行先</Th>
              <Th minW="100px">目的</Th>
              <Th>合計金額</Th>
              <Th>操作</Th>
            </Tr>
          </Thead>
          <Tbody position="relative" borderWidth={1} borderColor={'gray.600'}>
            {data?.map((a) => (
              <Tr key={a.id}>
                <Td>
                  {DateTime.fromJSDate(new Date(a.attendanceTime)).toFormat(
                    'yyyy/LL/dd日',
                  )}
                </Td>
                <Td>{a.destination}</Td>
                <Td>{a.purpose}</Td>
                <Td>{a.travelCost}</Td>
                <Td>
                  <Button
                    colorScheme="green"
                    onClick={() => {
                      setSelectedApplication(a);
                      setModal(true);
                    }}>
                    編集
                  </Button>
                </Td>
              </Tr>
            ))}
            <Tr>
              <Td bg="gray.400" />
              <Td bg="gray.400" />
              <Td bg="gray.400" />
              <Td bg="gray.400" />
              <Td bg="gray.400">
                <Button colorScheme="blue" onClick={() => setModal(true)}>
                  追加
                </Button>
              </Td>
            </Tr>
          </Tbody>
        </Table>
      </Box>
    </LayoutWithTab>
  );
};

export default Application;

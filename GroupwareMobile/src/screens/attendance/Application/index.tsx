import {DateTime} from 'luxon';
import React, {useState} from 'react';
import {Div, ScrollDiv, Text, Button} from 'react-native-magnus';
import ApplicationFormModal from '../../../components/attendance/ApplicationFormModal';
import HeaderWithTextButton from '../../../components/Header';
import {Tab} from '../../../components/Header/HeaderTemplate';
import WholeContainer from '../../../components/WholeContainer';
import {useAPIGetApplication} from '../../../hooks/api/attendance/application/useAPIGetApplication';
import {ApplicationBeforeJoining} from '../../../types';

const Application: React.FC = () => {
  const {data, refetch} = useAPIGetApplication();
  const [modal, setModal] = useState(false);
  const [selectedApplication, setSelectedApplication] =
    useState<ApplicationBeforeJoining>();

  const tabs: Tab[] = [
    {
      name: '入社前申請',
      onPress: () => {},
    },
  ];

  return (
    <WholeContainer>
      <HeaderWithTextButton
        title="入社前申請"
        tabs={tabs}
        activeTabName={'入社前申請'}
      />
      <ApplicationFormModal
        isOpen={modal}
        onClose={() => {
          setSelectedApplication(undefined);
          setModal(false);
          refetch();
        }}
        application={selectedApplication}
      />
      <Div
        borderBottomWidth={1}
        borderBottomColor={'#b0b0b0'}
        flexDir="row"
        h={40}>
        <Div minW={'20%'} justifyContent="center" alignItems="center">
          <Text fontSize={16}>{'日付'}</Text>
        </Div>
        <Div minW={'20%'} justifyContent="center" alignItems="center">
          <Text fontSize={16}>{'行先'}</Text>
        </Div>
        <Div minW={'20%'} justifyContent="center" alignItems="center">
          <Text fontSize={16}>目的</Text>
        </Div>
        <Div minW={'20%'} justifyContent="center" alignItems="center">
          <Text fontSize={16}>合計金額</Text>
        </Div>
        <Div minW={'20%'} justifyContent="center" alignItems="center">
          <Text fontSize={16}>操作</Text>
        </Div>
      </Div>
      <ScrollDiv>
        {data?.map(a => (
          <Div key={a.id} flexDir="row" my="sm">
            <Div minW={'20%'} justifyContent="center" alignItems="center">
              <Text fontSize={16}>
                {DateTime.fromJSDate(new Date(a.attendanceTime)).toFormat(
                  'yyyy/LL/dd日',
                )}
              </Text>
            </Div>
            <Div minW={'20%'} justifyContent="center" alignItems="center">
              <Text fontSize={16}>{a.destination}</Text>
            </Div>
            <Div minW={'20%'} justifyContent="center" alignItems="center">
              <Text fontSize={16}>{a.purpose}</Text>
            </Div>
            <Div minW={'20%'} justifyContent="center" alignItems="center">
              <Text fontSize={16}>{a.travelCost}</Text>
            </Div>
            <Div minW={'20%'} justifyContent="center" alignItems="center">
              <Button
                color="white"
                bg="green600"
                onPress={() => {
                  setSelectedApplication(a);
                  setModal(true);
                }}>
                編集
              </Button>
            </Div>
          </Div>
        ))}
        <Div flexDir="row" my="sm" bg="gray500">
          <Div minW={'20%'} justifyContent="center" alignItems="center" />
          <Div minW={'20%'} justifyContent="center" alignItems="center" />
          <Div minW={'20%'} justifyContent="center" alignItems="center" />
          <Div minW={'20%'} justifyContent="center" alignItems="center" />
          <Div minW={'20%'} justifyContent="center" alignItems="center">
            <Button
              alignSelf="center"
              color="white"
              bg="blue600"
              onPress={() => {
                setModal(true);
              }}>
              追加
            </Button>
          </Div>
        </Div>
      </ScrollDiv>
    </WholeContainer>
  );
};

export default Application;

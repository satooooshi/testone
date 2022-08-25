import React from 'react';
import WholeContainer from '../../components/WholeContainer';
import HeaderWithTextButton from '../../components/Header';
import PortalLinkBox from '../../components/PortalLinkBox';
import {Div, ScrollDiv, Text} from 'react-native-magnus';
import {Alert, Linking} from 'react-native';
import {useAuthenticate} from '../../contexts/useAuthenticate';
import {EventType} from '../../types';
import {useNavigation} from '@react-navigation/native';
import {HomeNavigationProps} from '../../types/navigator/drawerScreenProps/home';

const Home: React.FC = () => {
  const {setUser, logout} = useAuthenticate();
  const navigation = useNavigation<HomeNavigationProps>();

  const handleLogout = () => {
    logout();
    setUser({});
  };

  return (
    <WholeContainer>
      <HeaderWithTextButton
        title="Menu"
        activeTabName="ダッシュボード"
        rightButtonName={'ログアウト'}
        onPressRightButton={handleLogout}
      />
      {/* TODO: ログイン名を出す */}
      <ScrollDiv mt="lg" px={16}>
        <Div flexDir="row" mb={8}>
          <Div flex={1} mr={12}>
            <PortalLinkBox
              type="account"
              onPress={() => {
                navigation.navigate('AccountStack', {
                  screen: 'AccountDetail',
                });
              }}
            />
          </Div>
          <Div flex={1}>
            <PortalLinkBox
              type="my_schedule"
              onPress={() => {
                navigation.navigate('EventStack', {
                  screen: 'EventList',
                  params: {personal: true},
                });
              }}
            />
          </Div>
        </Div>

        <Div flexDir="row" mb={8}>
          <Div flex={1} mr={12}>
            <PortalLinkBox
              type="safety_confirmation"
              onPress={() => {
                Alert.alert('近日公開予定です');
              }}
            />
          </Div>
          <Div flex={1}>
            <PortalLinkBox
              type="salary"
              onPress={() => {
                Alert.alert('今後実装予定です');
              }}
            />
          </Div>
        </Div>
        <Div flexDir="row" mb={8}>
          <Div flex={1} mr={12}>
            <PortalLinkBox
              type="attendance"
              onPress={() => {
                Linking.openURL('https://bold-kintai.net/bold/root/attendance');
              }}
            />
          </Div>
          <Div flex={1} />
        </Div>

        <Text fontSize={18} fontWeight="bold" my={12}>
          全体
        </Text>
        <Div flexDir="row" mb={8}>
          <Div flex={1} mr={12}>
            <PortalLinkBox
              type="impressive_university"
              onPress={() =>
                navigation.navigate('EventStack', {
                  screen: 'EventIntroduction',
                  params: {type: EventType.IMPRESSIVE_UNIVERSITY},
                })
              }
            />
          </Div>
          <Div flex={1}>
            <PortalLinkBox
              type="study_meeting"
              onPress={() =>
                navigation.navigate('EventStack', {
                  screen: 'EventIntroduction',
                  params: {type: EventType.STUDY_MEETING},
                })
              }
            />
          </Div>
        </Div>

        <Div flexDir="row" mb={8}>
          <Div flex={1} mr={12}>
            <PortalLinkBox
              type="bolday"
              onPress={() =>
                navigation.navigate('EventStack', {
                  screen: 'EventIntroduction',
                  params: {type: EventType.BOLDAY},
                })
              }
            />
          </Div>
          <Div flex={1}>
            <PortalLinkBox
              type="coach"
              onPress={() =>
                navigation.navigate('EventStack', {
                  screen: 'EventIntroduction',
                  params: {type: EventType.COACH},
                })
              }
            />
          </Div>
        </Div>

        <Div flexDir="row" mb={8}>
          <Div flex={1} mr={12}>
            <PortalLinkBox
              type="club"
              onPress={() =>
                navigation.navigate('EventStack', {
                  screen: 'EventIntroduction',
                  params: {type: EventType.CLUB},
                })
              }
            />
          </Div>
          <Div flex={1}>
            <PortalLinkBox
              type="submission_etc"
              onPress={() =>
                navigation.navigate('EventStack', {
                  screen: 'EventList',
                  params: {type: EventType.SUBMISSION_ETC},
                })
              }
            />
          </Div>
        </Div>

        <Div flexDir="row" mb={8}>
          <Div flex={1} mr={12}>
            <PortalLinkBox
              type="wiki"
              onPress={() => {
                navigation.navigate('WikiStack', {
                  screen: 'WikiList',
                  params: {},
                });
              }}
            />
          </Div>
          <Div flex={1}>
            <PortalLinkBox
              type="chat"
              onPress={() => {
                navigation.navigate('ChatStack', {
                  screen: 'RoomList',
                });
              }}
            />
          </Div>
        </Div>

        <Div flexDir="row" mb={8}>
          <Div flex={1} mr={12}>
            <PortalLinkBox
              type="users"
              onPress={() => {
                navigation.navigate('UsersStack', {
                  screen: 'UserList',
                  params: {},
                });
              }}
            />
          </Div>
          <Div flex={1} />
        </Div>

        <Text fontSize={18} fontWeight="bold" my={12}>
          アカウント
        </Text>
        <Div flexDir="row" mb={8}>
          <Div flex={1} mr={12}>
            <PortalLinkBox type="logout" onPress={handleLogout} />
          </Div>
          <Div flex={1} />
        </Div>
      </ScrollDiv>
    </WholeContainer>
  );
};

export default Home;

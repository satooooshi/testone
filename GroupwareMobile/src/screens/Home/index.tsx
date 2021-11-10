import React, {useEffect} from 'react';
import WholeContainer from '../../components/WholeContainer';
import AppHeader, {Tab} from '../../components/Header';
import PortalLinkBox from '../../components/PortalLinkBox';
import {Div} from 'react-native-magnus';
import {ScrollView} from 'react-native';
import {useAuthenticate} from '../../contexts/useAuthenticate';
import {HomeProps} from '../../types/navigator/screenProps/Login';

const Home: React.FC<HomeProps> = ({navigation}) => {
  const {user} = useAuthenticate();
  const tabs: Tab[] = [
    {
      name: 'ダッシュボード',
      onPress: console.log,
    },
    {
      name: 'メンション一覧',
      onPress: console.log,
    },
  ];

  useEffect(() => {
    if (!user?.id) {
      navigation.navigate('Login');
    }
  }, [navigation, user?.id]);

  return (
    <WholeContainer>
      <AppHeader title="Home" tabs={tabs} activeTabName="ダッシュボード" />
      <ScrollView>
        <Div flexDir="column" justifyContent="center" alignItems="center">
          <Div mb={8}>
            <PortalLinkBox type="impressive_university" onPress={console.log} />
          </Div>
          <Div mb={8}>
            <PortalLinkBox type="study_meeting" onPress={console.log} />
          </Div>
          <Div mb={8}>
            <PortalLinkBox type="bolday" onPress={console.log} />
          </Div>
          <Div mb={8}>
            <PortalLinkBox type="coach" onPress={console.log} />
          </Div>
          <Div mb={8}>
            <PortalLinkBox type="club" onPress={console.log} />
          </Div>
          <Div mb={8}>
            <PortalLinkBox type="submission_etc" onPress={console.log} />
          </Div>
          <Div mb={8}>
            <PortalLinkBox type="wiki" onPress={console.log} />
          </Div>
          <Div mb={8}>
            <PortalLinkBox type="chat" onPress={console.log} />
          </Div>
          <Div mb={8}>
            <PortalLinkBox type="account" onPress={console.log} />
          </Div>
        </Div>
      </ScrollView>
    </WholeContainer>
  );
};

export default Home;

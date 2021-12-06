import React from 'react';
import WholeContainer from '../../components/WholeContainer';
import HeaderWithTextButton, {Tab} from '../../components/Header';
import PortalLinkBox from '../../components/PortalLinkBox';
import {Div} from 'react-native-magnus';
import {ScrollView} from 'react-native';
import {storage} from '../../utils/url';
import {useAuthenticate} from '../../contexts/useAuthenticate';

const Home: React.FC = () => {
  const {setUser} = useAuthenticate();

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
  const handleLogout = () => {
    storage.delete('userToken');
    setUser({});
  };

  return (
    <WholeContainer>
      <HeaderWithTextButton
        title="Home"
        tabs={tabs}
        activeTabName="ダッシュボード"
        rightButtonName={'ログアウト'}
        onPressRightButton={handleLogout}
      />
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

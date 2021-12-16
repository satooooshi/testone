import React from 'react';
import WholeContainer from '../../components/WholeContainer';
import {ScrollDiv, Div} from 'react-native-magnus';
import PortalLinkBox from '../../components/PortalLinkBox';
import {WikiType} from '../../types';
import {wikiStyles} from '../../styles/screen/wiki/wiki.style';
import HeaderWithTextButton from '../../components/Header';
import {useNavigation} from '@react-navigation/native';
import {WikiNavigationProps} from '../../types/navigator/drawerScreenProps';
import {Tab} from '../../components/Header/HeaderTemplate';

const Wiki: React.FC = () => {
  const navigation = useNavigation<WikiNavigationProps>();
  const tabs: Tab[] = [
    {
      name: '社内Wiki Home',
      onPress: () => {},
    },
  ];
  return (
    <WholeContainer>
      <HeaderWithTextButton
        title="社内Wiki"
        activeTabName="社内Wiki Home"
        tabs={tabs}
      />
      <ScrollDiv
        flexDir="column"
        contentContainerStyle={wikiStyles.portalBoxList}>
        <Div mb={8}>
          <PortalLinkBox
            type="rules"
            onPress={() =>
              navigation.navigate('WikiStack', {
                screen: 'WikiList',
                params: {type: WikiType.RULES},
              })
            }
          />
        </Div>
        <Div mb={8}>
          <PortalLinkBox
            type="knowledge"
            onPress={() =>
              navigation.navigate('WikiStack', {
                screen: 'WikiList',
                params: {type: WikiType.QA},
              })
            }
          />
        </Div>
        <Div mb={8}>
          <PortalLinkBox
            type="qa"
            onPress={() =>
              navigation.navigate('WikiStack', {
                screen: 'WikiList',
                params: {type: WikiType.KNOWLEDGE},
              })
            }
          />
        </Div>
      </ScrollDiv>
    </WholeContainer>
  );
};

export default Wiki;

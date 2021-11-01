import React from 'react';
import WholeContainer from '../../components/WholeContainer';
import {ScrollDiv, Div} from 'react-native-magnus';
import PortalLinkBox from '../../components/PortalLinkBox';
import {WikiProps} from '../../types/navigator/screenProps/Wiki';
import {WikiType} from '../../types';
import {wikiStyles} from '../../styles/screen/wiki/wiki.style';
import AppHeader, {Tab} from '../../components/Header';

const Wiki: React.FC<WikiProps> = ({navigation}) => {
  const tabs: Tab[] = [
    {
      name: '社内Wiki Home',
      onPress: () => {},
    },
  ];
  return (
    <WholeContainer>
      <AppHeader title="社内Wiki" activeTabName="社内Wiki Home" tabs={tabs} />
      <ScrollDiv
        flexDir="column"
        contentContainerStyle={wikiStyles.portalBoxList}>
        <Div mb={8}>
          <PortalLinkBox
            type="rules"
            onPress={() =>
              navigation.navigate('WikiList', {type: WikiType.RULES})
            }
          />
        </Div>
        <Div mb={8}>
          <PortalLinkBox
            type="knowledge"
            onPress={() => navigation.navigate('WikiList', {type: WikiType.QA})}
          />
        </Div>
        <Div mb={8}>
          <PortalLinkBox
            type="qa"
            onPress={() =>
              navigation.navigate('WikiList', {type: WikiType.KNOWLEDGE})
            }
          />
        </Div>
      </ScrollDiv>
    </WholeContainer>
  );
};

export default Wiki;

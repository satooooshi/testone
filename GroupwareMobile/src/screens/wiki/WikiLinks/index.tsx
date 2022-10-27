import {useNavigation} from '@react-navigation/native';
import React from 'react';
import {Div} from 'react-native-magnus';
import HeaderWithTextButton from '../../../components/Header';
import PortalLinkBox from '../../../components/PortalLinkBox';
import WholeContainer from '../../../components/WholeContainer';
import {WikiType} from '../../../types';
import {WikiLinksNavigationProps} from '../../../types/navigator/drawerScreenProps';

const WikiLinks: React.FC = () => {
  const navigation = useNavigation<WikiLinksNavigationProps>();

  return (
    <WholeContainer>
      <HeaderWithTextButton title="社内Wiki Home" />
      <Div ml={7} mt="lg">
        <Div
          flexDir="row"
          alignItems="center"
          justifyContent="flex-start"
          mb="lg">
          <Div mr="lg">
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
          <Div mr="lg">
            <PortalLinkBox
              type="all-postal"
              onPress={() =>
                navigation.navigate('WikiStack', {
                  screen: 'WikiList',
                  params: {type: WikiType.ALL_POSTAL},
                })
              }
            />
          </Div>
          <PortalLinkBox
            type="board"
            onPress={() =>
              navigation.navigate('WikiStack', {
                screen: 'WikiList',
                params: {type: WikiType.BOARD},
              })
            }
          />
        </Div>
        <Div
          flexDir="row"
          alignItems="center"
          justifyContent="flex-start"
          mb="lg">
          <PortalLinkBox
            type="mail_magazine"
            onPress={() =>
              navigation.navigate('WikiStack', {
                screen: 'WikiList',
                params: {type: WikiType.MAIL_MAGAZINE},
              })
            }
          />
        </Div>
      </Div>
    </WholeContainer>
  );
};

export default WikiLinks;

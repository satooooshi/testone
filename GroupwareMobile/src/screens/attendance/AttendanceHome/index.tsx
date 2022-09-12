import {useNavigation} from '@react-navigation/core';
import React from 'react';
import {Div, ScrollDiv} from 'react-native-magnus';
import HeaderWithTextButton from '../../../components/Header';
import {Tab} from '../../../components/Header/HeaderTemplate';
import PortalLinkBox from '../../../components/PortalLinkBox';
import WholeContainer from '../../../components/WholeContainer';
import {AttendanceHomeNavigationProps} from '../../../types/navigator/drawerScreenProps/attendance';

const AttendanceHome: React.FC = () => {
  const navigation = useNavigation<AttendanceHomeNavigationProps>();
  return (
    <WholeContainer>
      <HeaderWithTextButton
        title="勤怠管理 Home"
        activeTabName="勤怠管理 Home"
      />
      <ScrollDiv mt="lg">
        <Div flexDir="row" justifyContent="center" alignItems="center">
          <Div mb={8} mr={4}>
            <PortalLinkBox
              type="attendance"
              onPress={() =>
                navigation.navigate('AttendanceStack', {
                  screen: 'Attendance',
                })
              }
            />
          </Div>
          <Div mb={8} mr={4}>
            <PortalLinkBox
              type="attendance_report"
              onPress={() =>
                navigation.navigate('AttendanceStack', {
                  screen: 'AttendanceReport',
                })
              }
            />
          </Div>
          <Div mb={8}>
            <PortalLinkBox
              type="application"
              onPress={() =>
                navigation.navigate('AttendanceStack', {
                  screen: 'ApplicationBeforeJoining',
                })
              }
            />
          </Div>
        </Div>
      </ScrollDiv>
    </WholeContainer>
  );
};

export default AttendanceHome;

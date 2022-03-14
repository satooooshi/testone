import {useNavigation} from '@react-navigation/native';
import {useFormik} from 'formik';
import {DateTime} from 'luxon';
import React, {useEffect, useRef, useState} from 'react';
import {Alert} from 'react-native';
import {Button, Div, Text} from 'react-native-magnus';
import {AttendanceRepo} from '../../../types';
import {AttendanceHomeNavigationProps} from '../../../types/navigator/drawerScreenProps/attendance';
import {attendanceCategoryName} from '../../../utils/factory/attendance/attendanceCategoryName';
import {userRoleNameFactory} from '../../../utils/factory/userRoleNameFactory';
import AttendanceReportFormModal from '../AttendanceReportFrom';

type UnverifiedAttendanceReportRowProps = {
  reportData: AttendanceRepo;
};

const UnverifiedAttendanceReportRow: React.FC<UnverifiedAttendanceReportRowProps> =
  ({reportData}) => {
    const navigation = useNavigation<any>();
    const routes = navigation.getState()?.routes;

    return (
      <>
        <Div w={'20%'} justifyContent="center" alignItems="center">
          <Text fontSize={13}>
            {DateTime.fromJSDate(new Date(reportData.targetDate)).toFormat(
              'yyyy/LL/dd',
            )}
          </Text>
        </Div>
        <Div w={'20%'} justifyContent="center" alignItems="center">
          <Text fontSize={13}>
            {reportData.user?.lastName}
            {reportData.user?.firstName}
          </Text>
        </Div>
        <Div w={'20%'} justifyContent="center" alignItems="center">
          <Text fontSize={13}>
            {reportData.user?.role &&
              userRoleNameFactory(reportData.user?.role)}
          </Text>
        </Div>
        <Div w={'30%'} justifyContent="center" alignItems="center">
          <Text fontSize={13}>
            {attendanceCategoryName(reportData.category)}
          </Text>
        </Div>
        <Div w={'10%'} justifyContent="center" alignItems="center">
          <Text
            fontSize={13}
            color="blue"
            onPress={() => {
              navigation.navigate('AttendanceStack', {
                screen: 'AttendanceReportDetail',
                params: {
                  report: reportData,
                  previousScreenName: routes[routes?.length - 1],
                },
              });
            }}>
            詳細
          </Text>
        </Div>
      </>
    );
  };

export default UnverifiedAttendanceReportRow;

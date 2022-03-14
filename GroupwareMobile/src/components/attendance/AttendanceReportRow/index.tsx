import {useNavigation} from '@react-navigation/native';
import {useFormik} from 'formik';
import {DateTime} from 'luxon';
import React, {useEffect, useRef, useState} from 'react';
import {Alert, u} from 'react-native';
import {Button, Div, Text} from 'react-native-magnus';
import {AttendanceRepo} from '../../../types';
import {AttendanceHomeNavigationProps} from '../../../types/navigator/drawerScreenProps/attendance';
import {attendanceCategoryName} from '../../../utils/factory/attendance/attendanceCategoryName';
import AttendanceReportFormModal from '../AttendanceReportFrom';

type AttendanceReportRowProps = {
  reportData: AttendanceRepo;
};

const AttendanceReportRow: React.FC<AttendanceReportRowProps> = ({
  reportData,
}) => {
  const navigation = useNavigation<AttendanceHomeNavigationProps>();

  return (
    <>
      <Div w={'20%'} justifyContent="center" alignItems="center">
        <Text fontSize={13}>
          {DateTime.fromJSDate(new Date(reportData.targetDate)).toFormat(
            'yyyy/LL/dd',
          )}
        </Text>
      </Div>
      <Div w={'30%'} justifyContent="center" alignItems="center">
        <Text fontSize={13}>{attendanceCategoryName(reportData.category)}</Text>
      </Div>
      <Div w={'20%'} justifyContent="center" alignItems="center">
        <Text fontSize={13}>
          {DateTime.fromJSDate(new Date(reportData.createdAt)).toFormat(
            'yyyy/LL/dd',
          )}
        </Text>
      </Div>

      <Div w={'20%'} justifyContent="center" alignItems="center">
        {reportData.verifiedAt ? (
          <Text fontSize={13}>{reportData.verifiedAt}</Text>
        ) : (
          <Text fontSize={13} color="blue">
            編集
          </Text>
        )}
      </Div>
      <Div w={'10%'} justifyContent="center" alignItems="center">
        <Text
          fontSize={13}
          color="blue"
          onPress={() => {
            navigation.navigate('AttendanceStack', {
              screen: 'AttendanceReportDetail',
              params: {report: reportData},
            });
          }}>
          詳細
        </Text>
      </Div>
    </>
  );
};
export default AttendanceReportRow;

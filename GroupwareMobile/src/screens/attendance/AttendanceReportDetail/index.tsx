import {DateTime} from 'luxon';
import React from 'react';
import {useWindowDimensions} from 'react-native';
import {ModalProps, Text, Box, ScrollDiv} from 'react-native-magnus';
import {AttendanceRepo} from '../../../types';
import {attendanceCategoryName} from '../../../utils/factory/attendance/attendanceCategoryName';
import {attendanceReasonName} from '../../../utils/factory/attendance/attendanceReasonName';
import HeaderWithTextButton from '../../../components/Header';
import WholeContainer from '../../../components/WholeContainer';
import {AttendanceReportDetailProps} from '../../../types/navigator/drawerScreenProps/attendance';

type CustomModalProps = Omit<ModalProps, 'children'>;

// type AttendanceReportDetailProps = {
//   report: AttendanceRepo;
//   // route: AttendanceReportDetailRouteProps;
// };

const AttendanceReportDetail: React.FC<AttendanceReportDetailProps> = ({
  route,
}) => {
  const {width: windowWidth} = useWindowDimensions();
  const {report} = route.params;

  return (
    <WholeContainer>
      <HeaderWithTextButton enableBackButton={true} title="勤怠報告詳細" />
      <ScrollDiv
        contentContainerStyle={{width: windowWidth * 0.9}}
        alignSelf="center">
        <Text fontSize={25} my="lg" fontWeight="bold">
          勤怠報告詳細
        </Text>
        <Text ml={4} fontSize={16}>
          日付:
        </Text>
        <Text mt={5} ml={4} fontSize={20} fontWeight="bold">
          {DateTime.fromJSDate(new Date(report.targetDate)).toFormat(
            'yyyy/LL/dd',
          )}
        </Text>
        <Text mt="lg" ml={4} fontSize={16}>
          区分:
        </Text>
        <Text mt={5} ml={4} fontSize={20} fontWeight="bold">
          {attendanceCategoryName(report.category)}
        </Text>
        <Text mt="lg" ml={4} fontSize={16}>
          理由:
        </Text>
        <Text mt={5} ml={4} fontSize={20} fontWeight="bold">
          {attendanceReasonName(report.reason)}
        </Text>
        <Text mt="lg" ml={4} fontSize={16}>
          詳細:
        </Text>
        <Text mt={5} ml={4} fontSize={20} fontWeight="bold">
          {report.detail ? report.detail : '詳細はありません。'}
        </Text>
        <Text fontSize={16} ml={4} mt="lg">
          本社報告日:
        </Text>
        <Text mt={5} ml={4} fontSize={20} fontWeight="bold">
          {report.reportDate
            ? DateTime.fromJSDate(new Date(report.reportDate)).toFormat(
                'yyyy/LL/dd',
              )
            : '記載されていません。'}
        </Text>
        <Text fontSize={16} ml={4} mt="lg">
          報告承認日:
        </Text>
        <Text mt={5} ml={4} fontSize={20} fontWeight="bold">
          {report.verifiedAt
            ? DateTime.fromJSDate(new Date(report.verifiedAt)).toFormat(
                'yyyy/LL/dd',
              )
            : '承認されていません。'}
        </Text>
      </ScrollDiv>
    </WholeContainer>
  );
};

export default AttendanceReportDetail;

import {DateTime} from 'luxon';
import React from 'react';
import {Alert, useWindowDimensions} from 'react-native';
import {ModalProps, Text, Box, ScrollDiv, Button} from 'react-native-magnus';
import {AttendanceRepo, UserRole} from '../../../types';
import {attendanceCategoryName} from '../../../utils/factory/attendance/attendanceCategoryName';
import {attendanceReasonName} from '../../../utils/factory/attendance/attendanceReasonName';
import HeaderWithTextButton from '../../../components/Header';
import WholeContainer from '../../../components/WholeContainer';
import {AttendanceReportDetailProps} from '../../../types/navigator/drawerScreenProps/attendance';
import {useAuthenticate} from '../../../contexts/useAuthenticate';
import {useAPIVerifyAttendanceReport} from '../../../hooks/api/attendance/attendanceReport/useAPIVerifyAttendanceReport';
import {useNavigation} from '@react-navigation/native';
import {responseErrorMsgFactory} from '../../../utils/factory/responseEroorMsgFactory';

type CustomModalProps = Omit<ModalProps, 'children'>;

const AttendanceReportDetail: React.FC<AttendanceReportDetailProps> = ({
  route,
}) => {
  const {user} = useAuthenticate();
  const navigation = useNavigation<any>();
  const isAdmin = user?.role === UserRole.ADMIN;
  const {width: windowWidth} = useWindowDimensions();
  const {report} = route.params;

  const {mutate: verifyReport} = useAPIVerifyAttendanceReport({
    onSuccess: () => {
      Alert.alert('承認が完了しました');
      navigation.navigate('AdminStack', {
        screen: 'AttendanceVerifyReportAdmin',
      });
    },
    onError: e => {
      Alert.alert(responseErrorMsgFactory(e));
    },
  });

  return (
    <WholeContainer>
      <HeaderWithTextButton
        enableBackButton={true}
        screenForBack={
          route.params?.previousScreenName
            ? route.params.previousScreenName
            : undefined
        }
        title="勤怠報告詳細"
      />
      <ScrollDiv
        contentContainerStyle={{width: windowWidth * 0.9}}
        alignSelf="center">
        <Text fontSize={25} my="lg" fontWeight="bold">
          勤怠報告詳細
        </Text>
        <Text ml={4} fontSize={16} fontWeight="bold">
          日付:
        </Text>
        <Text mt={5} ml={4} fontSize={20}>
          {DateTime.fromJSDate(new Date(report.targetDate)).toFormat(
            'yyyy/LL/dd',
          )}
        </Text>
        <Text mt="lg" ml={4} fontSize={16} fontWeight="bold">
          区分:
        </Text>
        <Text mt={5} ml={4} fontSize={20}>
          {attendanceCategoryName(report.category)}
        </Text>
        <Text mt="lg" ml={4} fontSize={16} fontWeight="bold">
          理由:
        </Text>
        <Text mt={5} ml={4} fontSize={20}>
          {attendanceReasonName(report.reason)}
        </Text>
        <Text mt="lg" ml={4} fontSize={16} fontWeight="bold">
          詳細:
        </Text>
        <Text mt={5} ml={4} fontSize={16}>
          {report.detail ? report.detail : '詳細はありません。'}
        </Text>
        <Text fontSize={16} ml={4} mt="lg" fontWeight="bold">
          本社報告日:
        </Text>
        <Text mt={5} ml={4} fontSize={20}>
          {report.reportDate
            ? DateTime.fromJSDate(new Date(report.reportDate)).toFormat(
                'yyyy/LL/dd',
              )
            : '記載されていません。'}
        </Text>
        <Text fontSize={16} ml={4} mt="lg" fontWeight="bold">
          報告承認日:
        </Text>
        <Text mt={5} ml={4} fontSize={20}>
          {report.verifiedAt
            ? DateTime.fromJSDate(new Date(report.verifiedAt)).toFormat(
                'yyyy/LL/dd',
              )
            : '承認されていません。'}
        </Text>
        {isAdmin && (
          <Button my="lg" onPress={() => verifyReport(report)}>
            承認
          </Button>
        )}
      </ScrollDiv>
    </WholeContainer>
  );
};

export default AttendanceReportDetail;

import {useNavigation} from '@react-navigation/native';
import {DateTime} from 'luxon';
import React, {useState} from 'react';
import {Alert} from 'react-native';
import {Div, Text} from 'react-native-magnus';
import {useAPIUpdateAttendanceReport} from '../../../hooks/api/attendance/attendanceReport/useAPIUpdateAttendanceReport';
import {AttendanceRepo} from '../../../types';
import {AttendanceHomeNavigationProps} from '../../../types/navigator/drawerScreenProps/attendance';
import {attendanceCategoryName} from '../../../utils/factory/attendance/attendanceCategoryName';
import {responseErrorMsgFactory} from '../../../utils/factory/responseEroorMsgFactory';
import AttendanceReportFormModal from '../AttendanceReportFrom';

type AttendanceReportRowProps = {
  reportData: AttendanceRepo;
  refetchReports?: () => void;
};

const AttendanceReportRow: React.FC<AttendanceReportRowProps> = ({
  reportData,
  refetchReports,
}) => {
  const navigation = useNavigation<AttendanceHomeNavigationProps>();
  const [visibleAttendanceFormModal, setAttendanceFormModal] = useState(false);
  const {mutate: saveReport, isSuccess} = useAPIUpdateAttendanceReport({
    onSuccess: () => {
      setAttendanceFormModal(false);
      Alert.alert('勤怠報告を更新しました。');
      if (refetchReports) {
        refetchReports();
      }
    },
    onError: e => {
      Alert.alert(responseErrorMsgFactory(e));
    },
  });

  return (
    <>
      <AttendanceReportFormModal
        report={reportData}
        isVisible={visibleAttendanceFormModal}
        onCloseModal={() => setAttendanceFormModal(false)}
        onSubmit={report => saveReport(report)}
        isSuccess={isSuccess}
      />
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
          <Text fontSize={13}>
            {' '}
            {DateTime.fromJSDate(new Date(reportData.verifiedAt)).toFormat(
              'yyyy/LL/dd',
            )}
          </Text>
        ) : (
          <Text
            fontSize={15}
            color="blue"
            onPress={() => setAttendanceFormModal(true)}>
            編集
          </Text>
        )}
      </Div>
      <Div w={'10%'} justifyContent="center" alignItems="center">
        <Text
          fontSize={15}
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

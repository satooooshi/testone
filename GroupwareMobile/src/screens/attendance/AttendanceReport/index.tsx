import {useNavigation} from '@react-navigation/core';
import {DateTime} from 'luxon';
import React, {useEffect, useMemo, useState} from 'react';
import DropdownOpenerButton from '../../../components/common/DropdownOpenerButton';
import HeaderWithTextButton from '../../../components/Header';
import {Tab} from '../../../components/Header/HeaderTemplate';
import WholeContainer from '../../../components/WholeContainer';
import {
  AttendanceHomeNavigationProps,
  AttendanceNavigationProps,
} from '../../../types/navigator/drawerScreenProps/attendance';
import MonthPicker from 'react-native-month-year-picker';
import {Alert, useWindowDimensions} from 'react-native';
import {Text, Div, ScrollDiv, Button} from 'react-native-magnus';
import {useAPIGetDefaultAttendance} from '../../../hooks/api/attendance/useAPIGetDefaultAttendance';
import {useAPIGetAttendace} from '../../../hooks/api/attendance/useAPIGetAttendance';
import AttendanceRow from '../../../components/attendance/AttendanceRow';
import {
  useAPIGetAttendaceReport,
  useAPIGetAttendanceReport,
} from '../../../hooks/api/attendance/attendanceReport/useAPIGetAttendanceReport';
import AttendanceReportRow from '../../../components/attendance/AttendanceReportRow';
import AttendanceReportFormModal from '../../../components/attendance/AttendanceReportFrom';
import {useAPICreateAttendanceReport} from '../../../hooks/api/attendance/attendanceReport/useAPICreateAttendanceReport';
import {responseErrorMsgFactory} from '../../../utils/factory/responseEroorMsgFactory';
import {AttendanceRepo} from '../../../types';

const AttendanceReport: React.FC = () => {
  const navigation = useNavigation<AttendanceHomeNavigationProps>();
  const [activeTabName, setActiveTabName] = useState('reportBeforeAccepted');
  const [month, setMonth] = useState(DateTime.now());
  const [dateTimeModal, setDateTimeModal] = useState(false);
  const [visibleAttendanceFormModal, setAttendanceFormModal] = useState(false);
  const windowWidth = useWindowDimensions().width;
  const {data: data, refetch: refetchReports} = useAPIGetAttendanceReport({
    from_date: month.startOf('month').toFormat('yyyy-LL-dd'),
    to_date: month.endOf('month').endOf('day').toFormat('yyyy-LL-dd'),
  });

  const [unAcceptedReport, setUnAcceptedREport] = useState<
    AttendanceRepo[] | undefined
  >();
  const [acceptedReport, setAcceptedREport] = useState<
    AttendanceRepo[] | undefined
  >();
  const tabs: Tab[] = [
    {
      name: '承認済みの報告',
      onPress: () => setActiveTabName('reportAfterAccepted'),
    },
    {
      name: '承認前の報告',
      onPress: () => setActiveTabName('reportBeforeAccepted'),
    },
  ];
  const {
    mutate: saveReport,
    isSuccess,
    isLoading: isLoadingSaveEvent,
  } = useAPICreateAttendanceReport({
    onSuccess: () => {
      setAttendanceFormModal(false);
      refetchReports();
    },
    onError: e => {
      Alert.alert(responseErrorMsgFactory(e));
    },
  });

  useEffect(() => {
    refetchReports();
  }, [month, refetchReports]);

  useEffect(() => {
    if (data?.length) {
      const UnAcceptedRepo = data?.filter(d => d.verifiedAt == null);
      const acceptedRepo = data?.filter(d => d.verifiedAt != null);
      console.log('UnAcceptedRepo', UnAcceptedRepo);
      console.log('acceptedRepo', acceptedRepo);

      setUnAcceptedREport(UnAcceptedRepo);
      setAcceptedREport(acceptedRepo);
    } else {
      setUnAcceptedREport(undefined);
      setAcceptedREport(undefined);
    }
  }, [data, data?.length]);

  return (
    <WholeContainer>
      <HeaderWithTextButton
        enableBackButton={true}
        title="勤怠報告"
        tabs={tabs}
        activeTabName={
          activeTabName === 'reportAfterAccepted'
            ? '承認済みの報告'
            : '承認前の報告'
        }
        rightButtonName={'勤怠報告入力'}
        onPressRightButton={() => setAttendanceFormModal(true)}
      />
      <AttendanceReportFormModal
        isVisible={visibleAttendanceFormModal}
        onCloseModal={() => setAttendanceFormModal(false)}
        onSubmit={report => saveReport(report)}
        isSuccess={isSuccess}
      />
      <Div w={windowWidth * 0.8} alignSelf="center">
        <Text>対象月</Text>
        <DropdownOpenerButton
          name={month.toFormat('yyyy-LL')}
          onPress={() => {
            setDateTimeModal(true);
          }}
        />
      </Div>
      {dateTimeModal && (
        <MonthPicker
          onChange={(_, date) => {
            // console.log(date);
            setMonth(DateTime.fromJSDate(new Date(date)));
            setDateTimeModal(false);
          }}
          value={month.toJSDate()}
          locale="ja"
        />
      )}
      <Div
        borderBottomWidth={1}
        borderBottomColor={'#b0b0b0'}
        flexDir="row"
        h={40}>
        <Div w={'20%'} justifyContent="center" alignItems="center">
          <Text fontSize={16}>日付</Text>
        </Div>
        <Div w={'30%'} justifyContent="center" alignItems="center">
          <Text fontSize={16}>区分</Text>
        </Div>
        <Div w={'20%'} justifyContent="center" alignItems="center">
          <Text fontSize={16}>送信日</Text>
        </Div>
        {activeTabName === 'reportAfterAccepted' && (
          <>
            <Div w={'20%'} justifyContent="center" alignItems="center">
              <Text fontSize={16}>受理日</Text>
            </Div>
            <Div w={'10%'} justifyContent="center" alignItems="center">
              <Text fontSize={16}>詳細</Text>
            </Div>
          </>
        )}
        {activeTabName === 'reportBeforeAccepted' && (
          <>
            <Div w={'20%'} justifyContent="center" alignItems="center">
              <Text fontSize={16}>編集</Text>
            </Div>
            <Div w={'10%'} justifyContent="center" alignItems="center">
              <Text fontSize={16}>詳細</Text>
            </Div>
          </>
        )}
      </Div>

      {activeTabName === 'reportAfterAccepted' &&
        (acceptedReport?.length ? (
          <ScrollDiv>
            {acceptedReport.map(
              d =>
                d.verifiedAt !== null && (
                  <Div key={d.id} flexDir="row" my="sm">
                    <AttendanceReportRow reportData={d} />
                  </Div>
                ),
            )}
          </ScrollDiv>
        ) : (
          <Text mt={20} fontSize={20} textAlign="center">
            承認済みの報告はありません
          </Text>
        ))}

      {activeTabName === 'reportBeforeAccepted' &&
        (unAcceptedReport?.length ? (
          <ScrollDiv>
            {unAcceptedReport.map(
              d =>
                d.verifiedAt === null && (
                  <Div key={d.id} flexDir="row" my="sm">
                    <AttendanceReportRow reportData={d} />
                  </Div>
                ),
            )}
          </ScrollDiv>
        ) : (
          <Text mt={20} fontSize={20} textAlign="center">
            承認前の報告はありません
          </Text>
        ))}
    </WholeContainer>
  );
};

export default AttendanceReport;

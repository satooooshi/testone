import {DateTime} from 'luxon';
import React, {useEffect, useState} from 'react';
import DropdownOpenerButton from '../../../components/common/DropdownOpenerButton';
import HeaderWithTextButton from '../../../components/Header';
import {Tab} from '../../../components/Header/HeaderTemplate';
import WholeContainer from '../../../components/WholeContainer';
import MonthPicker from 'react-native-month-year-picker';
import {Alert, useWindowDimensions} from 'react-native';
import {Text, Div, ScrollDiv} from 'react-native-magnus';
import {useAPIGetAttendanceReport} from '../../../hooks/api/attendance/attendanceReport/useAPIGetAttendanceReport';
import AttendanceReportRow from '../../../components/attendance/AttendanceReportRow';
import AttendanceReportFormModal from '../../../components/attendance/AttendanceReportFrom';
import {useAPICreateAttendanceReport} from '../../../hooks/api/attendance/attendanceReport/useAPICreateAttendanceReport';
import {responseErrorMsgFactory} from '../../../utils/factory/responseEroorMsgFactory';
import {AttendanceRepo} from '../../../types';

const AttendanceReport: React.FC = () => {
  const [activeTabName, setActiveTabName] = useState('reportAfterAccepted');
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
  const {mutate: saveReport, isSuccess} = useAPICreateAttendanceReport({
    onSuccess: () => {
      setAttendanceFormModal(false);
      Alert.alert('新規勤怠報告を作成しました。');
      refetchReports();
    },
    onError: e => {
      Alert.alert(responseErrorMsgFactory(e));
    },
  });

  const handleSaveReport = (report: Partial<AttendanceRepo>) => {
    let isSameDateReportExist = false;
    if (data) {
      for (const d of data) {
        if (
          report?.targetDate &&
          DateTime.fromJSDate(new Date(d.targetDate)).toFormat('yyyy/LL/dd') ===
            DateTime.fromJSDate(new Date(report?.targetDate)).toFormat(
              'yyyy/LL/dd',
            )
        ) {
          isSameDateReportExist = true;
        }
      }
    }
    if (isSameDateReportExist) {
      Alert.alert('同じ日付の報告が既に存在しています');
    } else {
      saveReport(report);
    }
  };

  useEffect(() => {
    refetchReports();
  }, [month, refetchReports]);

  useEffect(() => {
    if (data?.length) {
      const UnAcceptedRepo = data?.filter(d => d.verifiedAt == null);
      const acceptedRepo = data?.filter(d => d.verifiedAt != null);

      setUnAcceptedREport(UnAcceptedRepo);
      setAcceptedREport(acceptedRepo);
    } else {
      setUnAcceptedREport(undefined);
      setAcceptedREport(undefined);
    }
  }, [data, data?.length]);

  return (
    <WholeContainer>
      <Div mr={7} ml={7}>
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
          onSubmit={report => handleSaveReport(report)}
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
                    <Div key={d.id} flexDir="row" my="sm" mt={10}>
                      <AttendanceReportRow
                        reportData={d}
                        refetchReports={() => refetchReports()}
                      />
                    </Div>
                  ),
              )}
            </ScrollDiv>
          ) : (
            <Text mt={20} fontSize={20} textAlign="center">
              承認前の報告はありません
            </Text>
          ))}
      </Div>
    </WholeContainer>
  );
};

export default AttendanceReport;

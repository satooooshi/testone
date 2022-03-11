import {useNavigation} from '@react-navigation/core';
import {DateTime} from 'luxon';
import React, {useMemo, useState} from 'react';
import DropdownOpenerButton from '../../../components/common/DropdownOpenerButton';
import HeaderWithTextButton from '../../../components/Header';
import {Tab} from '../../../components/Header/HeaderTemplate';
import WholeContainer from '../../../components/WholeContainer';
import {AttendanceNavigationProps} from '../../../types/navigator/drawerScreenProps/attendance';
import MonthPicker from 'react-native-month-year-picker';
import {useWindowDimensions} from 'react-native';
import {Text, Div, ScrollDiv, Button} from 'react-native-magnus';
import {useAPIGetDefaultAttendance} from '../../../hooks/api/attendance/useAPIGetDefaultAttendance';
import {useAPIGetAttendace} from '../../../hooks/api/attendance/useAPIGetAttendance';
import AttendanceRow from '../../../components/attendance/AttendanceRow';
import {useAPIGetAttendaceReport} from '../../../hooks/api/attendance/attendanceReport/useAPIGetAttendanceReport';
import AttendanceReportRow from '../../../components/attendance/AttendanceReportRow';

const AttendanceReport: React.FC = () => {
  const [activeTabName, setActiveTabName] = useState('reportBeforeAccepted');
  const [month, setMonth] = useState(DateTime.now());
  const [dateTimeModal, setDateTimeModal] = useState(false);
  const windowWidth = useWindowDimensions().width;
  const {data} = useAPIGetAttendaceReport({
    from_date: month.startOf('month').toFormat('yyyy-LL-dd'),
    to_date: month.endOf('month').endOf('day').toFormat('yyyy-LL-dd'),
  });
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
  const dates = useMemo(() => {
    const start = month.startOf('month');
    const end = month.endOf('month');
    const arr: DateTime[] = [];
    let i = 0;
    while (arr[arr.length - 1]?.day !== end.day) {
      arr.push(start.plus({days: i}));
      i++;
    }
    return arr;
  }, [month]);

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
        <Div minW={'20%'} justifyContent="center" alignItems="center">
          <Text fontSize={16}>日付</Text>
        </Div>
        <Div minW={'30%'} justifyContent="center" alignItems="center">
          <Text fontSize={16}>区分</Text>
        </Div>
        <Div minW={'30%'} justifyContent="center" alignItems="center">
          <Text fontSize={16}>送信日</Text>
        </Div>
        <Div minW={'20%'} justifyContent="center" alignItems="center">
          <Text fontSize={16}>受理日</Text>
        </Div>
      </Div>

      {activeTabName === 'reportAfterAccepted' &&
        (data ? (
          <ScrollDiv>
            {data?.map(
              d =>
                d.verifiedAt !== null && (
                  <Div flexDir="row" my="sm">
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
        (data ? (
          <ScrollDiv>
            {data?.map(
              d =>
                d.verifiedAt === null && (
                  <Div flexDir="row" my="sm">
                    <Div flexDir="row" my="sm">
                      <AttendanceReportRow reportData={d} />
                    </Div>
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

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

const Attendance: React.FC = () => {
  const navigation = useNavigation<AttendanceNavigationProps>();
  const [month, setMonth] = useState(DateTime.now());
  const [dateTimeModal, setDateTimeModal] = useState(false);
  const windowWidth = useWindowDimensions().width;
  const {data: defaultData} = useAPIGetDefaultAttendance();
  const {data} = useAPIGetAttendace({
    from_date: month.startOf('month').toFormat('yyyy-LL-dd'),
    to_date: month.endOf('month').endOf('day').toFormat('yyyy-LL-dd'),
  });
  const tabs: Tab[] = [
    {
      name: '勤怠打刻',
      onPress: () =>
        navigation.navigate('AttendanceStack', {screen: 'Attendance'}),
    },
    {
      name: '定時設定',
      onPress: () =>
        navigation.navigate('AttendanceStack', {screen: 'DefaultAttendance'}),
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
        title="勤怠打刻"
        tabs={tabs}
        activeTabName={'勤怠打刻'}
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
          <Text fontSize={16}>{'日付'}</Text>
        </Div>
        <Div minW={'30%'} justifyContent="center" alignItems="center">
          <Text fontSize={16}>{'打刻情報'}</Text>
        </Div>
        <Div minW={'30%'} justifyContent="center" alignItems="center">
          <Text fontSize={16}>申請</Text>
        </Div>
        <Div minW={'20%'} justifyContent="center" alignItems="center">
          <Text fontSize={16}>保存</Text>
        </Div>
      </Div>
      <ScrollDiv>
        {dates.map(d => (
          <Div key={d.toFormat('yyyy/LL/dd')} flexDir="row" my="sm">
            <AttendanceRow
              date={d}
              attendanceData={data}
              defaultData={defaultData}
            />
          </Div>
        ))}
      </ScrollDiv>
    </WholeContainer>
  );
};

export default Attendance;

import {DateTime} from 'luxon';
import React, {useState} from 'react';
import {useWindowDimensions} from 'react-native';
import {Div, ScrollDiv, Text} from 'react-native-magnus';
import MonthPicker from 'react-native-month-year-picker';
import UnverifiedAttendanceReportRow from '../../../components/attendance/UnverifiedAttendanceReportRow';
import DropdownOpenerButton from '../../../components/common/DropdownOpenerButton';
import HeaderWithTextButton from '../../../components/Header';
import WholeContainer from '../../../components/WholeContainer';
import {useAdminHeaderTab} from '../../../contexts/admin/useAdminHeaderTab';
import {useAPIGetAllUnverifiedAttendanceReport} from '../../../hooks/api/attendance/attendanceReport/useAPIGetAllUnverifiedAttendanceReport';

const AttendanceReportAdmin: React.FC = () => {
  const [month, setMonth] = useState(DateTime.now());
  const windowWidth = useWindowDimensions().width;
  const [dateTimeModal, setDateTimeModal] = useState(false);
  const tabs = useAdminHeaderTab();
  const {data: reports, refetch: refetchReports} =
    useAPIGetAllUnverifiedAttendanceReport({
      from_date: month.startOf('month').toFormat('yyyy-LL-dd'),
      to_date: month.endOf('month').endOf('day').toFormat('yyyy-LL-dd'),
    });
  console.log('------------repo', reports);

  return (
    <WholeContainer>
      <HeaderWithTextButton
        enableBackButton={true}
        title="勤怠報告"
        tabs={tabs}
        activeTabName={'勤怠報告'}
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
        <Div w={'20%'} justifyContent="center" alignItems="center">
          <Text fontSize={16}>氏名</Text>
        </Div>
        <Div w={'20%'} justifyContent="center" alignItems="center">
          <Text fontSize={16}>社員区分</Text>
        </Div>
        <Div w={'30%'} justifyContent="center" alignItems="center">
          <Text fontSize={16}>区分</Text>
        </Div>
        <Div w={'10%'} justifyContent="center" alignItems="center">
          <Text fontSize={16}>詳細</Text>
        </Div>
      </Div>

      {reports?.length ? (
        <ScrollDiv>
          {reports.map(d => (
            <Div key={d.id} flexDir="row" my="sm">
              <UnverifiedAttendanceReportRow reportData={d} />
            </Div>
          ))}
        </ScrollDiv>
      ) : (
        <Text mt={20} fontSize={20} textAlign="center">
          承認申請はありません。
        </Text>
      )}
    </WholeContainer>
  );
};

export default AttendanceReportAdmin;

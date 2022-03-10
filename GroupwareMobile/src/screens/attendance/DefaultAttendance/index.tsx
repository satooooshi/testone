import {useNavigation} from '@react-navigation/native';
import {useFormik} from 'formik';
import {DateTime} from 'luxon';
import React, {useState} from 'react';
import {Alert, useWindowDimensions} from 'react-native';
import {Button, Div, Text} from 'react-native-magnus';
import DateTimePicker from 'react-native-modal-datetime-picker';
import DropdownOpenerButton from '../../../components/common/DropdownOpenerButton';
import HeaderWithTextButton from '../../../components/Header';
import {Tab} from '../../../components/Header/HeaderTemplate';
import WholeContainer from '../../../components/WholeContainer';
import {useAPICreateDefaultAttendance} from '../../../hooks/api/attendance/useAPICreateDefaultAttendance';
import {useAPIGetDefaultAttendance} from '../../../hooks/api/attendance/useAPIGetDefaultAttendance';
import {useAPIUpdateDefaultAttendance} from '../../../hooks/api/attendance/useAPIUpdateDefaultAttendance';
import {DefaultAttendance} from '../../../types';
import {DefaultAttendanceNavigationProps} from '../../../types/navigator/drawerScreenProps/attendance';

const initialValues: Partial<DefaultAttendance> = {
  attendanceTime: '00:00',
  absenceTime: '00:00',
  breakMinutes: '00:00',
};

const DefaultAttendanceForm: React.FC = () => {
  const navigation = useNavigation<DefaultAttendanceNavigationProps>();
  const {width: windowWidth} = useWindowDimensions();
  const [timePicker, setTimePicker] = useState<keyof DefaultAttendance>();
  const {data} = useAPIGetDefaultAttendance();
  const {mutate: updateDefaultAttendance} = useAPIUpdateDefaultAttendance({
    onSuccess: updated => {
      setValues(updated);
      Alert.alert('更新が完了しました');
    },
  });
  const {mutate: createDefaultAttendance} = useAPICreateDefaultAttendance({
    onSuccess: created => {
      setValues(created);
      Alert.alert('登録が完了しました');
    },
  });
  const {values, setValues, handleSubmit} = useFormik<
    Partial<DefaultAttendance>
  >({
    initialValues: data || initialValues,
    enableReinitialize: true,
    onSubmit: submitted => {
      if (submitted?.id) {
        updateDefaultAttendance(submitted as DefaultAttendance);
        return;
      }
      createDefaultAttendance(submitted);
    },
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

  const timeFormatter = (time: string) => {
    const hourAndMinutes = time.split(':');
    const hour = Number(hourAndMinutes[0]);
    const minute = Number(hourAndMinutes[1]);
    return DateTime.now().set({hour, minute}).toJSDate();
  };
  return (
    <WholeContainer>
      <HeaderWithTextButton
        enableBackButton={true}
        title={'定時設定'}
        tabs={tabs}
        activeTabName={'定時設定'}
      />
      <DateTimePicker
        isVisible={!!timePicker}
        mode="time"
        onCancel={() => setTimePicker(undefined)}
        onConfirm={date => {
          if (timePicker) {
            setValues(v => ({
              ...v,
              [timePicker]: DateTime.fromJSDate(date).toFormat('HH:mm'),
            }));
            setTimePicker(undefined);
          }
        }}
        date={
          timePicker && values[timePicker]
            ? //@ts-ignore
              timeFormatter(values[timePicker])
            : new Date()
        }
      />
      <Div w={windowWidth * 0.9} alignSelf="center" mt={'lg'}>
        <Div mb={'lg'}>
          <Text fontSize={16} fontWeight="bold">
            出勤時間
          </Text>
          <DropdownOpenerButton
            name={values?.attendanceTime ? values.attendanceTime : '未設定'}
            onPress={() => setTimePicker('attendanceTime')}
          />
        </Div>
        <Div mb={'lg'}>
          <Text fontSize={16} fontWeight="bold">
            退勤時間
          </Text>
          <DropdownOpenerButton
            name={values?.absenceTime ? values.absenceTime : '未設定'}
            onPress={() => setTimePicker('absenceTime')}
          />
        </Div>
        <Div mb={'lg'}>
          <Text fontSize={16} fontWeight="bold">
            休憩時間
          </Text>
          <DropdownOpenerButton
            name={values?.breakMinutes ? values.breakMinutes : '未設定'}
            onPress={() => setTimePicker('breakMinutes')}
          />
        </Div>
        <Button
          color="white"
          bg="green600"
          onPress={() => handleSubmit()}
          w="100%">
          保存
        </Button>
      </Div>
    </WholeContainer>
  );
};

export default DefaultAttendanceForm;

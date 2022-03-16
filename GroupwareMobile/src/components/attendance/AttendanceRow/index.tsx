import {useFormik} from 'formik';
import {DateTime} from 'luxon';
import React, {useEffect, useRef, useState} from 'react';
import {Alert, TextInput, useWindowDimensions} from 'react-native';
import {
  Button,
  Div,
  Dropdown,
  Icon,
  Modal,
  ScrollDiv,
  Text,
} from 'react-native-magnus';
import DateTimePicker from 'react-native-modal-datetime-picker';
import {useAuthenticate} from '../../../contexts/useAuthenticate';
import {useAPICreateAttendance} from '../../../hooks/api/attendance/useAPICreateAttendance';
import {useAPIUpdateAttendance} from '../../../hooks/api/attendance/useAPIUpdateAttendance';
import {eventFormModalStyles} from '../../../styles/component/event/eventFormModal.style';
import {
  Attendance,
  DefaultAttendance,
  AttendanceCategory,
  User,
} from '../../../types';
import {
  defaultDropdownOptionProps,
  defaultDropdownProps,
} from '../../../utils/dropdown/helper';
import {attendanceCategoryName} from '../../../utils/factory/attendance/attendanceCategoryName';
import {isDisplayableWorkingTime} from '../../../utils/factory/attendance/isDisplayableWorkingTime';
import {formikErrorMsgFactory} from '../../../utils/factory/formikEroorMsgFactory';
import {attendanceSchema} from '../../../utils/validation/schema';
import DropdownOpenerButton from '../../common/DropdownOpenerButton';
import TravelCostFormModal from './TravelCostFormModal';

const AttendanceRow = ({
  date,
  attendanceData,
  defaultData,
}: {
  date: DateTime;
  attendanceData?: Attendance[];
  defaultData?: DefaultAttendance;
}) => {
  const [selectedDateForApplication, setSelectedDateForApplication] =
    useState<DateTime>();
  const {user} = useAuthenticate();
  const windowWidth = useWindowDimensions().width;
  const dropdownRef = useRef<any | null>(null);
  const targetData = attendanceData?.filter(
    a =>
      DateTime.fromJSDate(new Date(a?.targetDate)).toFormat('yyyy-LL-dd') ===
      date.toFormat('yyyy-LL-dd'),
  )?.[0];
  const initialValues: Partial<Attendance> = {
    category: AttendanceCategory.COMMON,
    targetDate: date.toJSDate(),
    breakMinutes: '00:00',
    user: user as User,
    travelCost: [],
  };
  const {mutate: createAttendance} = useAPICreateAttendance({
    onSuccess: created => {
      setValues(created);
      Alert.alert('申請が完了しました');
    },
  });
  const {mutate: updateAttendance} = useAPIUpdateAttendance({
    onSuccess: update => {
      setValues(update);
      Alert.alert('更新が完了しました');
    },
  });
  const [visibleAttendanceModal, setVisibleAttendanceModal] = useState(false);
  const [hasWorkingTime, setHasWorkingTime] = useState(true);
  const [WorkingTime, setWorkingTime] = useState<string | undefined>();
  const [visibleTimePicker, setVisibleTimePicker] = useState<
    'attendanceTime' | 'absenceTime' | 'breakMinutes'
  >();

  const {values, handleSubmit, setValues, errors} = useFormik({
    initialValues: targetData || initialValues,
    enableReinitialize: true,
    validationSchema: hasWorkingTime ? attendanceSchema : undefined,
    validateOnChange: true,
    validateOnMount: true,
    onSubmit: submitted => {
      if (
        submitted?.targetDate &&
        new Date(submitted?.targetDate)?.getMonth() !== new Date().getMonth()
      ) {
        Alert.alert('今月のデータのみ編集可能です');
        return;
      }
      // submitted.travelCost = submitted?.travelCost?.filter(t => !!t.travelCost);
      if (submitted?.id) {
        updateAttendance(submitted);
        return;
      }

      createAttendance(submitted);
    },
  });
  const validate = () => {
    const errorMsg = formikErrorMsgFactory(errors);
    if (errorMsg) {
      Alert.alert(errorMsg);
    }
  };

  const breakTime = () => {
    const now = DateTime.now();
    if (!values.breakMinutes) {
      return now.startOf('day').toJSDate();
    }

    const breakHourAndMinutes = values.breakMinutes.split(':');
    const hour = Number(breakHourAndMinutes[0]);
    const minute = Number(breakHourAndMinutes[1]);
    return now.set({hour, minute}).toJSDate();
  };

  useEffect(() => {
    if (values.attendanceTime && values.absenceTime && values.breakMinutes) {
      const breakHourAndMinutes = values.breakMinutes.split(':');
      const diff =
        (new Date(values.absenceTime).getTime() -
          new Date(values.attendanceTime).getTime()) /
        3600000;
      const minutesNumber =
        Math.round((diff - Math.floor(diff)) * 60) -
        Number(breakHourAndMinutes[1]);

      const minutes = String(
        '00' + (minutesNumber < 0 ? 60 + minutesNumber : minutesNumber),
      ).slice(-2);
      const hoursNumber =
        Math.floor(diff) -
        Number(breakHourAndMinutes[0]) -
        (minutesNumber < 0 ? 1 : 0);
      const hours = String('00' + hoursNumber).slice(-2);
      setWorkingTime(hours + ':' + minutes);
    }
  }, [values.attendanceTime, values.absenceTime, values.breakMinutes]);

  useEffect(() => {
    if (values.category) {
      setHasWorkingTime(isDisplayableWorkingTime(values.category));
    }
  }, [values.category]);

  return (
    <>
      <Modal isVisible={visibleAttendanceModal}>
        <ScrollDiv
          contentContainerStyle={{width: windowWidth * 0.9}}
          alignSelf="center">
          <Button
            bg="gray400"
            h={35}
            w={35}
            mb="lg"
            alignSelf="flex-end"
            rounded="circle"
            onPress={() => setVisibleAttendanceModal(false)}>
            <Icon color="black" name="close" />
          </Button>
          <Button
            color="black"
            w="100%"
            bg="yellow500"
            onPress={() => {
              if (defaultData) {
                const attendanceHourAndMinutes =
                  defaultData.attendanceTime.split(':');
                const absenceHourAndMinutes =
                  defaultData.absenceTime.split(':');
                setValues(v => ({
                  ...v,
                  attendanceTime: date
                    .set({
                      hour: Number(attendanceHourAndMinutes[0]),
                      minute: Number(attendanceHourAndMinutes[1]),
                    })
                    .toJSDate(),
                  absenceTime: date
                    .set({
                      hour: Number(absenceHourAndMinutes[0]),
                      minute: Number(absenceHourAndMinutes[1]),
                    })
                    .toJSDate(),
                  breakMinutes: defaultData.breakMinutes,
                }));
              }
            }}>
            定時
          </Button>
          <Text fontSize={16}>区分</Text>
          <DropdownOpenerButton
            name={
              values?.category
                ? attendanceCategoryName(values.category)
                : '未選択'
            }
            onPress={() => dropdownRef.current?.open()}
          />

          {hasWorkingTime && (
            <>
              <Text fontSize={16}>出勤時間</Text>
              <DropdownOpenerButton
                name={
                  values?.attendanceTime
                    ? DateTime.fromJSDate(
                        new Date(values.attendanceTime),
                      ).toFormat('HH:mm')
                    : '未選択'
                }
                onPress={() => setVisibleTimePicker('attendanceTime')}
              />
              <Text fontSize={16}>退勤時間</Text>
              <DropdownOpenerButton
                name={
                  values?.absenceTime
                    ? DateTime.fromJSDate(
                        new Date(values.absenceTime),
                      ).toFormat('HH:mm')
                    : '未選択'
                }
                onPress={() => setVisibleTimePicker('absenceTime')}
              />
              <Text fontSize={16}>休憩時間</Text>
              <DropdownOpenerButton
                name={values?.breakMinutes ? values.breakMinutes : '未選択'}
                onPress={() => setVisibleTimePicker('breakMinutes')}
              />
            </>
          )}
          <Text fontSize={16}>備考</Text>
          <TextInput
            value={values.detail}
            //@ts-ignore
            onChangeText={t => setValues(v => ({...v, detail: t}))}
            placeholder="備考を入力してください"
            numberOfLines={10}
            multiline={true}
            textAlignVertical={'top'}
            autoCapitalize="none"
            style={eventFormModalStyles.descriptionInput}
          />
          <Dropdown
            {...defaultDropdownProps}
            ref={dropdownRef}
            title="区分を選択">
            <Dropdown.Option
              {...defaultDropdownOptionProps}
              onPress={() => {
                setValues(v => ({...v, category: AttendanceCategory.COMMON}));
              }}
              value={AttendanceCategory.COMMON}>
              {attendanceCategoryName(AttendanceCategory.COMMON)}
            </Dropdown.Option>
            <Dropdown.Option
              {...defaultDropdownOptionProps}
              onPress={() =>
                setValues(v => ({
                  ...v,
                  category: AttendanceCategory.PAILD_ABSENCE,
                }))
              }
              value={AttendanceCategory.PAILD_ABSENCE}>
              {attendanceCategoryName(AttendanceCategory.PAILD_ABSENCE)}
            </Dropdown.Option>
            <Dropdown.Option
              {...defaultDropdownOptionProps}
              onPress={() =>
                setValues(v => ({...v, category: AttendanceCategory.LATE}))
              }
              value={AttendanceCategory.LATE}>
              {attendanceCategoryName(AttendanceCategory.LATE)}
            </Dropdown.Option>
            <Dropdown.Option
              {...defaultDropdownOptionProps}
              onPress={() =>
                setValues(v => ({
                  ...v,
                  category: AttendanceCategory.TRAINDELAY,
                }))
              }
              value={AttendanceCategory.TRAINDELAY}>
              {attendanceCategoryName(AttendanceCategory.TRAINDELAY)}
            </Dropdown.Option>
            <Dropdown.Option
              {...defaultDropdownOptionProps}
              onPress={() =>
                setValues(v => ({
                  ...v,
                  category: AttendanceCategory.EARLY_LEAVING,
                }))
              }
              value={AttendanceCategory.EARLY_LEAVING}>
              {attendanceCategoryName(AttendanceCategory.EARLY_LEAVING)}
            </Dropdown.Option>
            <Dropdown.Option
              {...defaultDropdownOptionProps}
              onPress={() =>
                setValues(v => ({
                  ...v,
                  category: AttendanceCategory.LATE_AND_EARY_LEAVING,
                }))
              }
              value={AttendanceCategory.EARLY_LEAVING}>
              {attendanceCategoryName(AttendanceCategory.LATE_AND_EARY_LEAVING)}
            </Dropdown.Option>
            <Dropdown.Option
              {...defaultDropdownOptionProps}
              onPress={() =>
                setValues(v => ({...v, category: AttendanceCategory.HOLIDAY}))
              }
              value={AttendanceCategory.HOLIDAY}>
              {attendanceCategoryName(AttendanceCategory.HOLIDAY)}
            </Dropdown.Option>
            <Dropdown.Option
              {...defaultDropdownOptionProps}
              onPress={() =>
                setValues(v => ({
                  ...v,
                  category: AttendanceCategory.HOLIDAY_WORK,
                }))
              }
              value={AttendanceCategory.HOLIDAY}>
              {attendanceCategoryName(AttendanceCategory.HOLIDAY_WORK)}
            </Dropdown.Option>
            <Dropdown.Option
              {...defaultDropdownOptionProps}
              onPress={() =>
                setValues(v => ({
                  ...v,
                  category: AttendanceCategory.TRANSFER_HOLIDAY,
                }))
              }
              value={AttendanceCategory.HOLIDAY_WORK}>
              {attendanceCategoryName(AttendanceCategory.TRANSFER_HOLIDAY)}
            </Dropdown.Option>
            <Dropdown.Option
              {...defaultDropdownOptionProps}
              onPress={() =>
                setValues(v => ({...v, category: AttendanceCategory.GOOUT}))
              }
              value={AttendanceCategory.TRANSFER_HOLIDAY}>
              {attendanceCategoryName(AttendanceCategory.GOOUT)}
            </Dropdown.Option>
            <Dropdown.Option
              {...defaultDropdownOptionProps}
              onPress={() =>
                setValues(v => ({...v, category: AttendanceCategory.SHIFTWORK}))
              }
              value={AttendanceCategory.SHIFTWORK}>
              {attendanceCategoryName(AttendanceCategory.SHIFTWORK)}
            </Dropdown.Option>
            <Dropdown.Option
              {...defaultDropdownOptionProps}
              onPress={() =>
                setValues(v => ({...v, category: AttendanceCategory.ABSENCE}))
              }
              value={AttendanceCategory.ABSENCE}>
              {attendanceCategoryName(AttendanceCategory.ABSENCE)}
            </Dropdown.Option>
            <Dropdown.Option
              {...defaultDropdownOptionProps}
              onPress={() =>
                setValues(v => ({
                  ...v,
                  category: AttendanceCategory.HALF_HOLIDAY,
                }))
              }
              value={AttendanceCategory.HALF_HOLIDAY}>
              {attendanceCategoryName(AttendanceCategory.HALF_HOLIDAY)}
            </Dropdown.Option>
          </Dropdown>
          <DateTimePicker
            isVisible={!!visibleTimePicker}
            mode="time"
            date={
              visibleTimePicker === 'breakMinutes'
                ? breakTime()
                : visibleTimePicker === 'attendanceTime' &&
                  values.attendanceTime
                ? new Date(values.attendanceTime)
                : visibleTimePicker === 'absenceTime' && values.absenceTime
                ? new Date(values.absenceTime)
                : new Date()
            }
            onCancel={() => setVisibleTimePicker(undefined)}
            onConfirm={selected => {
              if (visibleTimePicker === 'breakMinutes') {
                const hourAndMinutes =
                  DateTime.fromJSDate(selected).toFormat('HH:mm');
                setValues(v => ({...v, breakMinutes: hourAndMinutes}));
              } else if (
                visibleTimePicker === 'attendanceTime' ||
                visibleTimePicker === 'absenceTime'
              ) {
                setValues(v => ({...v, [visibleTimePicker]: selected}));
              }
              setVisibleTimePicker(undefined);
            }}
          />
        </ScrollDiv>
      </Modal>
      <TravelCostFormModal
        isOpen={!!selectedDateForApplication}
        onClose={() => setSelectedDateForApplication(undefined)}
        attendance={values}
        setAttendance={setValues}
        //@ts-ignore
        date={selectedDateForApplication}
      />
      <Div w={'20%'} justifyContent="center" alignItems="center">
        <Text
          fontSize={16}
          color={
            values.category !== AttendanceCategory.COMMON
              ? values.verifiedAt
                ? 'red'
                : 'blue'
              : 'black'
          }>
          {date.setLocale('ja').toFormat('d日(EEE)')}
        </Text>
      </Div>
      <Div w={'30%'} justifyContent="center" alignItems="center">
        <Button
          w={'100%'}
          onPress={() => setVisibleAttendanceModal(true)}
          alignSelf="center">
          {values?.category &&
          values.attendanceTime &&
          values.absenceTime &&
          values?.id
            ? hasWorkingTime
              ? DateTime.fromJSDate(new Date(values.attendanceTime)).toFormat(
                  'HH:mm',
                ) +
                '~' +
                DateTime.fromJSDate(new Date(values.absenceTime)).toFormat(
                  'HH:mm',
                )
              : '公休'
            : '詳細を入力'}
        </Button>
      </Div>
      <Div w={'20%'} justifyContent="center" alignItems="center">
        <Text>{hasWorkingTime && WorkingTime}</Text>
      </Div>
      <Div w={'15%'} justifyContent="center" alignItems="center">
        <Button
          onPress={() => setSelectedDateForApplication(date)}
          alignSelf="center">
          申請
        </Button>
      </Div>
      <Div w={'15%'} alignItems="center">
        <Button
          alignSelf="center"
          bg="green600"
          color="white"
          onPress={() => {
            validate();
            handleSubmit();
          }}>
          {values?.id ? '更新' : '保存'}
        </Button>
      </Div>
    </>
  );
};
export default AttendanceRow;

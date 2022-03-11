import {DateTime} from 'luxon';
import React, {useEffect, useRef, useState} from 'react';
import {Alert, TextInput, useWindowDimensions} from 'react-native';
import {
  Button,
  Div,
  Icon,
  Modal,
  ModalProps,
  Text,
  Dropdown,
  Box,
  ScrollDiv,
} from 'react-native-magnus';
import DateTimePicker from 'react-native-modal-datetime-picker';
import {eventFormModalStyles} from '../../../styles/component/event/eventFormModal.style';
import {
  AttendanceCategory,
  AttendanceReason,
  AttendanceRepo,
  User,
} from '../../../types';
import {useFormik} from 'formik';
import {attendanceReportSchema} from '../../../utils/validation/schema';
import {formikErrorMsgFactory} from '../../../utils/factory/formikEroorMsgFactory';
import WholeContainer from '../../WholeContainer';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {useAuthenticate} from '../../../contexts/useAuthenticate';
import tailwind from 'tailwind-rn';
import {attendanceCategoryName} from '../../../utils/factory/attendance/attendanceCategoryName';
import {attendanceReasonName} from '../../../utils/factory/attendance/attendanceReasonName';
import {
  defaultDropdownOptionProps,
  defaultDropdownProps,
} from '../../../utils/dropdown/helper';
import DropdownOpenerButton from '../../common/DropdownOpenerButton';

type CustomModalProps = Omit<ModalProps, 'children'>;

type AttendanceReportFormModalProps = CustomModalProps & {
  report?: Partial<AttendanceRepo>;
  onCloseModal: () => void;
  onSubmit: (event: Partial<AttendanceRepo>) => void;
  isSuccess?: boolean;
};

const AttendanceReportFormModal: React.FC<AttendanceReportFormModalProps> =
  props => {
    const {onCloseModal, report, onSubmit, isSuccess = false} = props;
    const {user} = useAuthenticate();
    const reportCategoryRef = useRef<any | null>(null);
    const reportReasonRef = useRef<any | null>(null);
    const {width: windowWidth} = useWindowDimensions();
    const [visibleTimePicker, setVisibleTimePicker] = useState<
      'targetDate' | 'reportDate'
    >();
    const initialReportValue = {
      category: AttendanceCategory.PAILD_ABSENCE,
      reason: AttendanceReason.PRIVATE,
      detail: '',
      user: user as User,
    };
    const {
      values: newReport,
      handleSubmit: onComplete,
      setValues: setNewReport,
      validateForm,
      resetForm,
    } = useFormik<Partial<AttendanceRepo>>({
      initialValues: report ? Object.assign(report) : initialReportValue,
      validationSchema: attendanceReportSchema,
      onSubmit: async values => {
        onSubmit(values);
      },
    });

    useEffect(() => {
      isSuccess && resetForm();
    }, [isSuccess, resetForm]);

    const checkValidateErrors = async () => {
      const errors = await validateForm();
      const messages = formikErrorMsgFactory(errors);
      if (messages) {
        Alert.alert(messages);
      } else {
        onComplete();
      }
    };

    useEffect(() => {
      if (report) {
        setNewReport(report);
      }
    }, [report, setNewReport]);

    return (
      <Modal {...props}>
        <WholeContainer>
          <Button
            bg="blue700"
            h={60}
            w={60}
            position="absolute"
            zIndex={20}
            right={10}
            bottom={10}
            alignSelf="flex-end"
            rounded="circle"
            onPress={() => checkValidateErrors()}>
            <Icon color="white" name="check" fontSize={32} />
          </Button>
          <KeyboardAwareScrollView
            contentContainerStyle={{
              width: windowWidth * 0.9,
              ...tailwind('self-center'),
            }}>
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
                onPress={() => {
                  resetForm();
                  onCloseModal();
                }}>
                <Icon color="black" name="close" />
              </Button>
              <Text fontSize={25} my="lg" fontWeight="bold">
                勤怠報告
              </Text>
              <Box mb={4}>
                <Text ml={4} fontSize={16}>
                  日付:
                </Text>
                <DropdownOpenerButton
                  name={
                    newReport.targetDate
                      ? DateTime.fromJSDate(
                          new Date(newReport.targetDate),
                        ).toFormat('yyyy/LL/dd')
                      : '未設定'
                  }
                  onPress={() => setVisibleTimePicker('targetDate')}
                />
              </Box>
              <Text mt="lg" ml={4} fontSize={16}>
                区分:
              </Text>
              <DropdownOpenerButton
                name={
                  newReport?.category
                    ? attendanceCategoryName(newReport.category)
                    : '未選択'
                }
                onPress={() => reportCategoryRef.current?.open()}
              />
              <Text mt="lg" ml={4} fontSize={16}>
                理由:
              </Text>
              <DropdownOpenerButton
                name={
                  newReport?.reason
                    ? attendanceReasonName(newReport.reason)
                    : '未選択'
                }
                onPress={() => reportReasonRef.current?.open()}
              />
              <Text mt="lg" ml={4} fontSize={16}>
                詳細:
              </Text>
              <TextInput
                value={newReport.detail}
                //@ts-ignore
                onChange={t => setNewReport(v => ({...v, detail: t}))}
                placeholder="詳細を入力してください"
                numberOfLines={10}
                multiline={true}
                textAlignVertical={'top'}
                autoCapitalize="none"
                style={eventFormModalStyles.descriptionInput}
              />
              <Box my="lg">
                <Text fontSize={16} ml={4}>
                  本社報告日:
                </Text>
                <DropdownOpenerButton
                  name={
                    newReport.reportDate
                      ? DateTime.fromJSDate(
                          new Date(newReport.reportDate),
                        ).toFormat('yyyy/LL/dd')
                      : '未設定'
                  }
                  onPress={() => setVisibleTimePicker('reportDate')}
                />
              </Box>
              <Dropdown
                {...defaultDropdownProps}
                ref={reportCategoryRef}
                title="区分を選択">
                <Dropdown.Option
                  {...defaultDropdownOptionProps}
                  onPress={() =>
                    setNewReport(v => ({
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
                    setNewReport(v => ({
                      ...v,
                      category: AttendanceCategory.LATE,
                    }))
                  }
                  value={AttendanceCategory.LATE}>
                  {attendanceCategoryName(AttendanceCategory.LATE)}
                </Dropdown.Option>
                <Dropdown.Option
                  {...defaultDropdownOptionProps}
                  onPress={() =>
                    setNewReport(v => ({
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
                    setNewReport(v => ({
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
                    setNewReport(v => ({
                      ...v,
                      category: AttendanceCategory.LATE_AND_EARY_LEAVING,
                    }))
                  }
                  value={AttendanceCategory.EARLY_LEAVING}>
                  {attendanceCategoryName(
                    AttendanceCategory.LATE_AND_EARY_LEAVING,
                  )}
                </Dropdown.Option>
                <Dropdown.Option
                  {...defaultDropdownOptionProps}
                  onPress={() =>
                    setNewReport(v => ({
                      ...v,
                      category: AttendanceCategory.HOLIDAY,
                    }))
                  }
                  value={AttendanceCategory.HOLIDAY}>
                  {attendanceCategoryName(AttendanceCategory.HOLIDAY)}
                </Dropdown.Option>
                <Dropdown.Option
                  {...defaultDropdownOptionProps}
                  onPress={() =>
                    setNewReport(v => ({
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
                    setNewReport(v => ({
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
                    setNewReport(v => ({
                      ...v,
                      category: AttendanceCategory.GOOUT,
                    }))
                  }
                  value={AttendanceCategory.TRANSFER_HOLIDAY}>
                  {attendanceCategoryName(AttendanceCategory.GOOUT)}
                </Dropdown.Option>
                <Dropdown.Option
                  {...defaultDropdownOptionProps}
                  onPress={() =>
                    setNewReport(v => ({
                      ...v,
                      category: AttendanceCategory.SHIFTWORK,
                    }))
                  }
                  value={AttendanceCategory.SHIFTWORK}>
                  {attendanceCategoryName(AttendanceCategory.SHIFTWORK)}
                </Dropdown.Option>
                <Dropdown.Option
                  {...defaultDropdownOptionProps}
                  onPress={() =>
                    setNewReport(v => ({
                      ...v,
                      category: AttendanceCategory.ABSENCE,
                    }))
                  }
                  value={AttendanceCategory.ABSENCE}>
                  {attendanceCategoryName(AttendanceCategory.ABSENCE)}
                </Dropdown.Option>
                <Dropdown.Option
                  {...defaultDropdownOptionProps}
                  onPress={() =>
                    setNewReport(v => ({
                      ...v,
                      category: AttendanceCategory.HALF_HOLIDAY,
                    }))
                  }
                  value={AttendanceCategory.HALF_HOLIDAY}>
                  {attendanceCategoryName(AttendanceCategory.HALF_HOLIDAY)}
                </Dropdown.Option>
              </Dropdown>
              <Dropdown
                {...defaultDropdownProps}
                ref={reportReasonRef}
                title="理由を選択">
                <Dropdown.Option
                  {...defaultDropdownOptionProps}
                  onPress={() =>
                    setNewReport(v => ({
                      ...v,
                      reason: AttendanceReason.PRIVATE,
                    }))
                  }
                  value={AttendanceReason.PRIVATE}>
                  {attendanceReasonName(AttendanceReason.PRIVATE)}
                </Dropdown.Option>
                <Dropdown.Option
                  {...defaultDropdownOptionProps}
                  onPress={() =>
                    setNewReport(v => ({
                      ...v,
                      reason: AttendanceReason.SICK,
                    }))
                  }
                  value={AttendanceReason.SICK}>
                  {attendanceReasonName(AttendanceReason.SICK)}
                </Dropdown.Option>
                <Dropdown.Option
                  {...defaultDropdownOptionProps}
                  onPress={() =>
                    setNewReport(v => ({
                      ...v,
                      reason: AttendanceReason.HOUSEWORK,
                    }))
                  }
                  value={AttendanceReason.HOUSEWORK}>
                  {attendanceReasonName(AttendanceReason.HOUSEWORK)}
                </Dropdown.Option>
                <Dropdown.Option
                  {...defaultDropdownOptionProps}
                  onPress={() =>
                    setNewReport(v => ({
                      ...v,
                      reason: AttendanceReason.HOLIDAY,
                    }))
                  }
                  value={AttendanceReason.HOLIDAY}>
                  {attendanceReasonName(AttendanceReason.HOLIDAY)}
                </Dropdown.Option>
                <Dropdown.Option
                  {...defaultDropdownOptionProps}
                  onPress={() =>
                    setNewReport(v => ({
                      ...v,
                      reason: AttendanceReason.CONDOLENCE,
                    }))
                  }
                  value={AttendanceReason.CONDOLENCE}>
                  {attendanceReasonName(AttendanceReason.CONDOLENCE)}
                </Dropdown.Option>
                <Dropdown.Option
                  {...defaultDropdownOptionProps}
                  onPress={() =>
                    setNewReport(v => ({
                      ...v,
                      reason: AttendanceReason.SITE,
                    }))
                  }
                  value={AttendanceReason.SITE}>
                  {attendanceReasonName(AttendanceReason.SITE)}
                </Dropdown.Option>
                <Dropdown.Option
                  {...defaultDropdownOptionProps}
                  onPress={() =>
                    setNewReport(v => ({
                      ...v,
                      reason: AttendanceReason.DISASTER,
                    }))
                  }
                  value={AttendanceReason.DISASTER}>
                  {attendanceReasonName(AttendanceReason.DISASTER)}
                </Dropdown.Option>
                <Dropdown.Option
                  {...defaultDropdownOptionProps}
                  onPress={() =>
                    setNewReport(v => ({
                      ...v,
                      reason: AttendanceReason.MEETING,
                    }))
                  }
                  value={AttendanceReason.MEETING}>
                  {attendanceReasonName(AttendanceReason.MEETING)}
                </Dropdown.Option>
                <Dropdown.Option
                  {...defaultDropdownOptionProps}
                  onPress={() =>
                    setNewReport(v => ({
                      ...v,
                      reason: AttendanceReason.BIRTHDAY,
                    }))
                  }
                  value={AttendanceReason.BIRTHDAY}>
                  {attendanceReasonName(AttendanceReason.BIRTHDAY)}
                </Dropdown.Option>
                <Dropdown.Option
                  {...defaultDropdownOptionProps}
                  onPress={() =>
                    setNewReport(v => ({
                      ...v,
                      reason: AttendanceReason.MORNING_OFF,
                    }))
                  }
                  value={AttendanceReason.MORNING_OFF}>
                  {attendanceReasonName(AttendanceReason.MORNING_OFF)}
                </Dropdown.Option>
                <Dropdown.Option
                  {...defaultDropdownOptionProps}
                  onPress={() =>
                    setNewReport(v => ({
                      ...v,
                      reason: AttendanceReason.AFTERNOON_OFF,
                    }))
                  }
                  value={AttendanceReason.AFTERNOON_OFF}>
                  {attendanceReasonName(AttendanceReason.AFTERNOON_OFF)}
                </Dropdown.Option>
                <Dropdown.Option
                  {...defaultDropdownOptionProps}
                  onPress={() =>
                    setNewReport(v => ({
                      ...v,
                      reason: AttendanceReason.LATE_OFF,
                    }))
                  }
                  value={AttendanceReason.LATE_OFF}>
                  {attendanceReasonName(AttendanceReason.LATE_OFF)}
                </Dropdown.Option>
                <Dropdown.Option
                  {...defaultDropdownOptionProps}
                  onPress={() =>
                    setNewReport(v => ({
                      ...v,
                      reason: AttendanceReason.EARLY_LEAVING_OFF,
                    }))
                  }
                  value={AttendanceReason.EARLY_LEAVING_OFF}>
                  {attendanceReasonName(AttendanceReason.EARLY_LEAVING_OFF)}
                </Dropdown.Option>
              </Dropdown>
              <DateTimePicker
                isVisible={!!visibleTimePicker}
                date={
                  visibleTimePicker === 'targetDate' && newReport.targetDate
                    ? new Date(newReport.targetDate)
                    : visibleTimePicker === 'reportDate' && newReport.reportDate
                    ? new Date(newReport.reportDate)
                    : new Date()
                }
                onCancel={() => setVisibleTimePicker(undefined)}
                onConfirm={date => {
                  if (visibleTimePicker === 'targetDate') {
                    setNewReport(v => ({...v, targetDate: date}));
                  } else if (visibleTimePicker === 'reportDate') {
                    setNewReport(v => ({...v, reportDate: date}));
                  }
                  setVisibleTimePicker(undefined);
                }}
              />
            </ScrollDiv>
          </KeyboardAwareScrollView>
        </WholeContainer>
      </Modal>
    );
  };

export default AttendanceReportFormModal;

import { useAPIDeleteAttendanceReport } from '@/hooks/api/attendance/attendanceReport/useAPIDeleteAttendanceReport';
import {
  FormControl,
  FormLabel,
  Select,
  Input,
  Button,
  Box,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  Textarea,
} from '@chakra-ui/react';
import { useFormik } from 'formik';
import { DateTime } from 'luxon';
import React from 'react';
import { useAuthenticate } from 'src/contexts/useAuthenticate';
import {
  AttendanceCategory,
  AttendanceReason,
  AttendanceRepo,
  User,
} from 'src/types';
import { attendanceCategoryName } from 'src/utils/factory/attendanceCategoryName';
import { attendanceReasonName } from 'src/utils/factory/attendanceReasonName';
import { formikErrorMsgFactory } from 'src/utils/factory/formikErrorMsgFactory';
import { attendanceReportSchema } from 'src/utils/validation/schema';

type ReportFormModalProps = {
  report?: Partial<AttendanceRepo>;
  onCloseModal: () => void;
  onSubmit: (event: Partial<AttendanceRepo>) => void;
  onDelete?: (reportId: number) => void;
  isOpen: boolean;
};

const ReportForm: React.FC<ReportFormModalProps> = (props) => {
  const { report, onSubmit, onDelete } = props;
  const { user } = useAuthenticate();
  const initialReportValue = {
    category: AttendanceCategory.PAILD_ABSENCE,
    reason: AttendanceReason.PRIVATE,
    detail: '',
    user: user as User,
  };

  const {
    values: values,
    handleSubmit: onComplete,
    setValues: setValues,
    validateForm,
  } = useFormik<Partial<AttendanceRepo>>({
    initialValues: report ? report : initialReportValue,
    validationSchema: attendanceReportSchema,
    onSubmit: async (values) => {
      onSubmit(values);
    },
  });
  const checkValidateErrors = async () => {
    const errors = await validateForm();
    const messages = formikErrorMsgFactory(errors);
    if (messages) {
      alert(messages);
    } else {
      onComplete();
    }
  };
  return (
    <Box borderTopWidth={5} borderTopColor={'brand.600'}>
      <FormControl
        mt={5}
        display="flex"
        flexDir="row"
        alignItems="center"
        justifyContent="space-between">
        <FormLabel w="40%">日付:</FormLabel>
        <Input
          type="date"
          value={
            values.targetDate
              ? DateTime.fromJSDate(new Date(values.targetDate)).toFormat(
                  'yyyy-LL-dd',
                )
              : undefined
          }
          bg="white"
          onChange={(e) =>
            setValues((a) => ({
              ...a,
              targetDate: new Date(e.target.value),
            }))
          }
        />
      </FormControl>
      <Text mt={5}>区分:</Text>
      <Select
        colorScheme="teal"
        bg="white"
        defaultValue={values.category}
        onChange={(e) =>
          setValues((v) => ({
            ...v,
            category: e.target.value as AttendanceCategory,
          }))
        }
        value={values.category}>
        <option value={AttendanceCategory.PAILD_ABSENCE}>
          {attendanceCategoryName(AttendanceCategory.PAILD_ABSENCE)}
        </option>
        <option value={AttendanceCategory.LATE}>
          {attendanceCategoryName(AttendanceCategory.LATE)}
        </option>
        <option value={AttendanceCategory.TRAINDELAY}>
          {attendanceCategoryName(AttendanceCategory.TRAINDELAY)}
        </option>
        <option value={AttendanceCategory.EARLY_LEAVING}>
          {attendanceCategoryName(AttendanceCategory.EARLY_LEAVING)}
        </option>
        <option value={AttendanceCategory.LATE_AND_EARY_LEAVING}>
          {attendanceCategoryName(AttendanceCategory.LATE_AND_EARY_LEAVING)}
        </option>
        <option value={AttendanceCategory.HOLIDAY}>
          {attendanceCategoryName(AttendanceCategory.HOLIDAY)}
        </option>
        <option value={AttendanceCategory.HOLIDAY_WORK}>
          {attendanceCategoryName(AttendanceCategory.HOLIDAY_WORK)}
        </option>
        <option value={AttendanceCategory.TRANSFER_HOLIDAY}>
          {attendanceCategoryName(AttendanceCategory.TRANSFER_HOLIDAY)}
        </option>
        <option value={AttendanceCategory.GOOUT}>
          {attendanceCategoryName(AttendanceCategory.GOOUT)}
        </option>
        <option value={AttendanceCategory.SHIFTWORK}>
          {attendanceCategoryName(AttendanceCategory.SHIFTWORK)}
        </option>
        <option value={AttendanceCategory.ABSENCE}>
          {attendanceCategoryName(AttendanceCategory.ABSENCE)}
        </option>
        <option value={AttendanceCategory.HALF_HOLIDAY}>
          {attendanceCategoryName(AttendanceCategory.HALF_HOLIDAY)}
        </option>
      </Select>
      <Text mt={5}>理由:</Text>
      <Select
        colorScheme="teal"
        bg="white"
        defaultValue={values.reason}
        onChange={(e) =>
          setValues((v) => ({
            ...v,
            reason: e.target.value as AttendanceReason,
          }))
        }
        value={values.reason}>
        <option value={AttendanceReason.PRIVATE}>
          {attendanceReasonName(AttendanceReason.PRIVATE)}
        </option>
        <option value={AttendanceReason.SICK}>
          {attendanceReasonName(AttendanceReason.SICK)}
        </option>
        <option value={AttendanceReason.HOUSEWORK}>
          {attendanceReasonName(AttendanceReason.HOUSEWORK)}
        </option>
        <option value={AttendanceReason.HOLIDAY}>
          {attendanceReasonName(AttendanceReason.HOLIDAY)}
        </option>
        <option value={AttendanceReason.CONDOLENCE}>
          {attendanceReasonName(AttendanceReason.CONDOLENCE)}
        </option>
        <option value={AttendanceReason.SITE}>
          {attendanceReasonName(AttendanceReason.SITE)}
        </option>
        <option value={AttendanceReason.DISASTER}>
          {attendanceReasonName(AttendanceReason.DISASTER)}
        </option>
        <option value={AttendanceReason.MEETING}>
          {attendanceReasonName(AttendanceReason.MEETING)}
        </option>
        <option value={AttendanceReason.BIRTHDAY}>
          {attendanceReasonName(AttendanceReason.BIRTHDAY)}
        </option>
        <option value={AttendanceReason.MORNING_OFF}>
          {attendanceReasonName(AttendanceReason.MORNING_OFF)}
        </option>
        <option value={AttendanceReason.AFTERNOON_OFF}>
          {attendanceReasonName(AttendanceReason.AFTERNOON_OFF)}
        </option>
        <option value={AttendanceReason.LATE_OFF}>
          {attendanceReasonName(AttendanceReason.LATE_OFF)}
        </option>
        <option value={AttendanceReason.EARLY_LEAVING_OFF}>
          {attendanceReasonName(AttendanceReason.EARLY_LEAVING_OFF)}
        </option>
      </Select>
      <Text mt={5}>詳細:</Text>
      <Textarea
        type="text"
        value={values.detail}
        h="300px"
        placeholder="詳細を入力してください"
        onChange={(e) => setValues((v) => ({ ...v, detail: e.target.value }))}
      />
      <FormControl
        mt={5}
        display="flex"
        flexDir="row"
        alignItems="center"
        justifyContent="space-between">
        <FormLabel w="40%">本社報告日</FormLabel>
        <Input
          type="date"
          value={
            values.reportDate
              ? DateTime.fromJSDate(new Date(values.reportDate)).toFormat(
                  'yyyy-LL-dd',
                )
              : undefined
          }
          bg="white"
          onChange={(e) =>
            setValues((v) => ({
              ...v,
              reportDate: new Date(e.target.value),
            }))
          }
        />
      </FormControl>
      <Box mt={5} flexDir="row" display="flex" justifyContent="flex-end">
        <Button colorScheme={'blue'} onClick={() => checkValidateErrors()}>
          {values.id ? '更新' : '送信'}
        </Button>
        {values.id && onDelete && (
          <Button
            ml={1}
            colorScheme={'red'}
            onClick={() => {
              if (values.id && confirm('アルバムを削除してよろしいですか？')) {
                onDelete(values.id);
              }
            }}>
            削除
          </Button>
        )}
      </Box>
    </Box>
  );
};

const ReportFormModal: React.FC<ReportFormModalProps> = (props) => {
  const { onCloseModal, isOpen } = props;
  return (
    <Modal
      onClose={onCloseModal}
      scrollBehavior="inside"
      isOpen={isOpen}
      size="xl">
      <>
        <ModalOverlay />
        <ModalContent h="90vh" bg={'#f9fafb'}>
          <ModalHeader
            flexDir="row"
            justifyContent="space-between"
            display="flex"
            mr="24px">
            <Text>勤怠報告</Text>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <ReportForm {...props} />
          </ModalBody>
        </ModalContent>
      </>
    </Modal>
  );
};

export default ReportFormModal;

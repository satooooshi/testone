import { useAPIVerifyAttendanceReport } from '@/hooks/api/attendance/attendanceReport/useAPIVerifyAttendanceReport';
import {
  Box,
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  Textarea,
} from '@chakra-ui/react';
import { DateTime } from 'luxon';
import React from 'react';
import { useAuthenticate } from 'src/contexts/useAuthenticate';
import { AttendanceRepo, UserRole } from 'src/types';
import { attendanceCategoryName } from 'src/utils/factory/attendanceCategoryName';
import { attendanceReasonName } from 'src/utils/factory/attendanceReasonName';
import { responseErrorMsgFactory } from 'src/utils/factory/responseErrorMsgFactory';

type ReportDetailModalProps = {
  report: AttendanceRepo;
  onCloseModal: () => void;
  isOpen: boolean;
  refetchReports?: () => void;
};

const ReportDetailModal: React.FC<ReportDetailModalProps> = (props) => {
  const { onCloseModal, report, isOpen, refetchReports } = props;
  const { user } = useAuthenticate();
  const isAdmin = user?.role === UserRole.ADMIN;
  const { mutate: verifyReport } = useAPIVerifyAttendanceReport({
    onSuccess: () => {
      alert('承認が完了しました');
      onCloseModal();
      refetchReports && refetchReports();
    },
    onError: (e) => {
      alert(responseErrorMsgFactory(e));
    },
  });
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
            <Text>勤怠報告詳細</Text>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box borderTopWidth={5} borderTopColor={'blue.600'} fontSize={20}>
              <Box display="flex" flexDir="row" mt={5}>
                <Text fontWeight="bold">日付:</Text>
                <Text ml={5}>
                  {DateTime.fromJSDate(new Date(report.targetDate)).toFormat(
                    'yyyy/LL/dd',
                  )}
                </Text>
              </Box>
              <Box display="flex" flexDir="row" mt={5}>
                <Text fontWeight="bold">区分:</Text>
                <Text ml={5}> {attendanceCategoryName(report.category)}</Text>
              </Box>
              <Box display="flex" flexDir="row" mt={5}>
                <Text fontWeight="bold">理由:</Text>
                <Text ml={5}>{attendanceReasonName(report.reason)}</Text>
              </Box>
              <Box display="flex" flexDir="column" mt={5}>
                <Text fontWeight="bold">詳細:</Text>
                <Text mt={5} whiteSpace="pre-line">
                  {report.detail ? report.detail : '詳細はありません。'}
                </Text>
              </Box>
              <Box display="flex" flexDir="row" mt={5}>
                <Text fontWeight="bold">本社報告日:</Text>
                <Text ml={5}>
                  {report.reportDate
                    ? DateTime.fromJSDate(new Date(report.reportDate)).toFormat(
                        'yyyy/LL/dd',
                      )
                    : '記載されていません。'}
                </Text>
              </Box>
              <Box display="flex" flexDir="row" mt={5}>
                <Text fontWeight="bold">報告承認日:</Text>
                <Text ml={5}>
                  {report.verifiedAt
                    ? DateTime.fromJSDate(new Date(report.verifiedAt)).toFormat(
                        'yyyy/LL/dd',
                      )
                    : '承認されていません。'}
                </Text>
              </Box>
              {isAdmin && !report.verifiedAt ? (
                <Button
                  mt={5}
                  mb={3}
                  onClick={() => {
                    verifyReport(report);
                  }}>
                  承認
                </Button>
              ) : null}
            </Box>
          </ModalBody>
        </ModalContent>
      </>
    </Modal>
  );
};

export default ReportDetailModal;

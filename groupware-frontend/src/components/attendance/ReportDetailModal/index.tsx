import {
  Box,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
} from '@chakra-ui/react';
import { DateTime } from 'luxon';
import React from 'react';
import { AttendanceRepo } from 'src/types';
import { attendanceCategoryName } from 'src/utils/factory/attendanceCategoryName';
import { attendanceReasonName } from 'src/utils/factory/attendanceReasonName';

type ReportDetailModalProps = {
  report: AttendanceRepo;
  onCloseModal: () => void;
  isOpen: boolean;
};

const ReportDetailModal: React.FC<ReportDetailModalProps> = (props) => {
  const { onCloseModal, report, isOpen } = props;
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
                <Text mt={5}>
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
              {/* {isAdmin && (
                <Button my="lg" onPress={() => verifyReport(report)}>
                  承認
                </Button>
              )} */}
            </Box>
          </ModalBody>
        </ModalContent>
      </>
    </Modal>
  );
};

export default ReportDetailModal;

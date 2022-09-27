import { Box, Button, Td, Text } from '@chakra-ui/react';
import { DateTime } from 'luxon';
import React, { useState } from 'react';
import { AttendanceRepo } from 'src/types';
import { attendanceCategoryName } from 'src/utils/factory/attendanceCategoryName';
import { userRoleNameFactory } from 'src/utils/factory/userRoleNameFactory';
import ReportDetailModal from '../ReportDetailModal';

type UnverifiedAttendanceReportRowProps = {
  reportData: AttendanceRepo;
};

const UnverifiedAttendanceReportRow: React.FC<UnverifiedAttendanceReportRowProps> =
  ({ reportData }) => {
    const [detailModal, setDetailModal] = useState(false);
    return (
      <>
        <ReportDetailModal
          report={reportData}
          isOpen={detailModal}
          onCloseModal={() => setDetailModal(false)}
        />
        <Td>
          <Text>
            {DateTime.fromJSDate(new Date(reportData.targetDate)).toFormat(
              'yyyy/LL/dd',
            )}
          </Text>
        </Td>
        <Td>
          <Text fontSize={13}>
            {reportData.user?.lastName}
            {reportData.user?.firstName}
          </Text>
        </Td>
        <Td>
          <Text fontSize={13}>
            {reportData.user?.role &&
              userRoleNameFactory(reportData.user?.role)}
          </Text>
        </Td>
        <Td>
          <Text fontSize={13}>
            {attendanceCategoryName(reportData.category)}
          </Text>
        </Td>
        <Td>
          <Button
            fontSize={16}
            colorScheme="blue"
            onClick={() => setDetailModal(true)}>
            詳細
          </Button>
        </Td>
        {/* <Box w={'10%'} justifyContent="center" alignItems="center">
          <Text fontSize={13} color="blue" onPress={() => setDetailModal(true)}>
          詳細
          </Text>
        </Box> */}
      </>
    );
  };

export default UnverifiedAttendanceReportRow;

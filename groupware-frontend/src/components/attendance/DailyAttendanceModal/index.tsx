import { useAPICreateDefaultAttendance } from '@/hooks/api/attendance/useAPICreateDefaultAttendance';
import { useAPIGetDefaultAttendance } from '@/hooks/api/attendance/useAPIGetDefaultAttendance';
import { useAPIUpdateDefaultAttendance } from '@/hooks/api/attendance/useAPIUpdateDefaultAttendance';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  useToast,
} from '@chakra-ui/react';
import { useFormik } from 'formik';
import React, { useEffect, useState } from 'react';
import { DefaultAttendance } from 'src/types';
import { darkFontColor } from 'src/utils/colors';
import { dateTimeFormatterFromJSDDate } from 'src/utils/dateTimeFormatter';
type DailyAttendanceModalProps = {
  onCloseModal: () => void;
  isOpen: boolean;
  refetch: () => void;
};
const initialValues: Partial<DefaultAttendance> = {
  attendanceTime: '00:00',
  absenceTime: '00:00',
  breakMinutes: '00:00',
};

const DailyAttendanceModal: React.FC<DailyAttendanceModalProps> = ({
  onCloseModal,
  isOpen,
  refetch,
}) => {
  const weeks = ['日', '月', '火', '水', '木', '金', '土'];
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    if (isOpen) {
      setNow(new Date());
      const myInterval = setInterval(() => {
        setNow(new Date());
      }, 1000);
      return () => {
        clearInterval(myInterval);
      };
    }
  }, [isOpen]);

  return (
    <Modal onClose={onCloseModal} scrollBehavior="inside" isOpen={isOpen}>
      <>
        <ModalOverlay />
        <ModalContent bg={'#f9fafb'}>
          <ModalHeader flexDir="row" display="flex" alignItems="center">
            <Text mr="auto" ml="auto">
              本日の勤怠
            </Text>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box display="flex" flexDir="column" alignItems="center">
              <Text fontSize="20px">
                {dateTimeFormatterFromJSDDate({
                  dateTime: now,
                  format: `yyyy/LL/dd(${weeks[now.getDay()]})`,
                })}
              </Text>
              <Text fontSize="40px" mt={3}>
                {dateTimeFormatterFromJSDDate({
                  dateTime: now,
                  format: 'HH:mm',
                })}
              </Text>
              <Box
                display="flex"
                flexDir="row"
                my="16px"
                w="60%"
                justifyContent="space-between">
                <Button colorScheme="blue" w="100px">
                  出勤
                </Button>
                <Button colorScheme="red" w="100px">
                  退勤
                </Button>
              </Box>
            </Box>
          </ModalBody>
        </ModalContent>
      </>
    </Modal>
  );
};

export default DailyAttendanceModal;

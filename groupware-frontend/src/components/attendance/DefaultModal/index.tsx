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
import React from 'react';
import { DefaultAttendance } from 'src/types';
type DefaultModalProps = {
  onCloseModal: () => void;
  isOpen: boolean;
};
const initialValues: Partial<DefaultAttendance> = {
  attendanceTime: '00:00',
  absenceTime: '00:00',
  breakMinutes: '00:00',
};

const DefaultModal: React.FC<DefaultModalProps> = ({
  onCloseModal,
  isOpen,
}) => {
  const { data } = useAPIGetDefaultAttendance();
  const toast = useToast();
  const { mutate: updateDefaultAttendance } = useAPIUpdateDefaultAttendance({
    onSuccess: (updated) => {
      onCloseModal();
      setValues(updated);
      toast({
        title: '更新が完了しました',
        status: 'success',
      });
    },
  });
  const { mutate: createDefaultAttendance } = useAPICreateDefaultAttendance({
    onSuccess: (created) => {
      onCloseModal();
      setValues(created);
      toast({
        title: '登録が完了しました',
        status: 'success',
      });
    },
  });
  const { values, setValues, handleSubmit } = useFormik({
    initialValues: data || initialValues,
    enableReinitialize: true,
    onSubmit: (submitted) => {
      if (submitted?.id) {
        updateDefaultAttendance(submitted as DefaultAttendance);
        return;
      }
      createDefaultAttendance(submitted);
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
          <ModalHeader flexDir="row" display="flex" alignItems="center">
            <Text mr="auto" ml="auto">
              定時設定
            </Text>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box display="flex" flexDir="column" alignItems="center">
              <Box
                display="flex"
                flexDir="row"
                justifyContent="flex-start"
                mb="16px"
                w="300px">
                <FormControl display="flex" flexDir="row" alignItems="center">
                  <FormLabel mr="16px" w="40%">
                    出勤時刻
                  </FormLabel>
                  <Input
                    type="time"
                    value={values.attendanceTime}
                    onChange={(e) => {
                      setValues((v) => ({
                        ...v,
                        attendanceTime: e.target.value,
                      }));
                    }}
                  />
                </FormControl>
              </Box>
              <Box
                display="flex"
                flexDir="row"
                justifyContent="flex-start"
                mb="16px"
                w="300px">
                <FormControl display="flex" flexDir="row" alignItems="center">
                  <FormLabel mr="16px" w="40%">
                    退勤時刻
                  </FormLabel>
                  <Input
                    type="time"
                    value={values.absenceTime}
                    onChange={(e) => {
                      setValues((v) => ({
                        ...v,
                        absenceTime: e.target.value,
                      }));
                    }}
                  />
                </FormControl>
              </Box>
              <Box
                display="flex"
                flexDir="row"
                justifyContent="flex-start"
                mb="16px"
                w="300px">
                <FormControl display="flex" flexDir="row" alignItems="center">
                  <FormLabel mr="16px" w="40%">
                    休憩時間
                  </FormLabel>
                  <Input
                    type="time"
                    value={values?.breakMinutes}
                    onChange={(e) => {
                      setValues((v) => ({
                        ...v,
                        breakMinutes: e.target.value,
                      }));
                    }}
                  />
                </FormControl>
              </Box>
              <Button colorScheme="green" onClick={() => handleSubmit()}>
                保存
              </Button>
            </Box>
          </ModalBody>
        </ModalContent>
      </>
    </Modal>
  );
};

export default DefaultModal;

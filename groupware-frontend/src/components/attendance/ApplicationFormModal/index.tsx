import { useAPICreateApplication } from '@/hooks/api/attendance/application/useAPICreateApplication';
import { useAPIDeleteApplication } from '@/hooks/api/attendance/application/useAPIDeleteApplication';
import { useAPIUpdateApplication } from '@/hooks/api/attendance/application/useAPIUpdateApplication';
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
  useToast,
} from '@chakra-ui/react';
import { useFormik } from 'formik';
import { DateTime } from 'luxon';
import app from 'next/app';
import React from 'react';
import { ApplicationBeforeJoining, OneWayOrRound } from 'src/types';
import { applicationFormModalSchema } from 'src/utils/validation/schema';

type ApplicationFormModalProps = {
  application?: ApplicationBeforeJoining;
  onClose: () => void;
  isOpen: boolean;
};

const ApplicationForm = ({
  application,
  onClose,
}: ApplicationFormModalProps) => {
  const initialValues: Partial<ApplicationBeforeJoining> = {
    destination: '',
    purpose: '',
    departureStation: '',
    viaStation: '',
    destinationStation: '',
    travelCost: 0,
    oneWayOrRound: OneWayOrRound.ROUND,
  };
  const toast = useToast();
  const { mutate: createApplication } = useAPICreateApplication({
    onSuccess: () => {
      toast({
        title: '申請が完了しました',
        status: 'success',
      });
      onClose();
    },
  });
  const { mutate: updateApplication } = useAPIUpdateApplication({
    onSuccess: () => {
      toast({
        title: '更新が完了しました',
        status: 'success',
      });
      onClose();
    },
  });

  const { mutate: deleteApplication } = useAPIDeleteApplication({
    onSuccess: () => {
      alert('削除が完了しました');
      onClose();
    },
  });
  const onDeleteButtonClicked = () => {
    if (!application) {
      return;
    }
    if (confirm('アルバムを削除してよろしいですか？')) {
      deleteApplication({ applicationId: application.id });
    }
  };
  const { values, setValues, handleSubmit, errors, touched } = useFormik({
    initialValues: application || initialValues,
    validationSchema: applicationFormModalSchema,
    onSubmit: (submittedValues) => {
      if (submittedValues.id) {
        updateApplication(submittedValues as ApplicationBeforeJoining);
        return;
      }
      createApplication(submittedValues);
    },
  });

  const checkRoute = () => {
    const url = `https://transit.yahoo.co.jp/search/result?from=${values.departureStation}&via=${values.viaStation}&to=${values.destinationStation}`;
    window.open(url, '_blank');
  };

  return (
    <Box borderTopWidth={5} borderTopColor={'blue.600'}>
      {errors?.attendanceTime && touched.attendanceTime ? (
        <FormLabel color="tomato">{errors?.attendanceTime}</FormLabel>
      ) : null}
      <FormControl
        mb="8px"
        display="flex"
        flexDir="row"
        alignItems="center"
        justifyContent="space-between">
        <FormLabel w="40%">日付</FormLabel>
        <Input
          type="date"
          value={
            values.attendanceTime
              ? DateTime.fromJSDate(new Date(values.attendanceTime)).toFormat(
                  'yyyy-LL-dd',
                )
              : undefined
          }
          bg="white"
          onChange={(e) =>
            setValues((a) => ({
              ...a,
              attendanceTime: new Date(e.target.value),
            }))
          }
        />
      </FormControl>
      {errors?.destination && touched.destination ? (
        <FormLabel color="tomato">{errors?.destination}</FormLabel>
      ) : null}
      <FormControl
        mb="8px"
        display="flex"
        flexDir="row"
        alignItems="center"
        justifyContent="space-between">
        <FormLabel w="40%">行先</FormLabel>
        <Input
          value={values.destination}
          placeholder="行先"
          bg="white"
          onChange={(e) =>
            setValues((a) => ({
              ...a,
              destination: e.target.value,
            }))
          }
        />
      </FormControl>
      {errors?.purpose && touched.purpose ? (
        <FormLabel color="tomato">{errors?.purpose}</FormLabel>
      ) : null}
      <FormControl
        mb="8px"
        display="flex"
        flexDir="row"
        alignItems="center"
        justifyContent="space-between">
        <FormLabel w="40%">目的</FormLabel>
        <Input
          value={values.purpose}
          placeholder="目的"
          bg="white"
          onChange={(e) =>
            setValues((a) => ({
              ...a,
              purpose: e.target.value,
            }))
          }
        />
      </FormControl>
      {errors?.destination && touched.destination ? (
        <FormLabel color="tomato">{errors?.destination}</FormLabel>
      ) : null}
      <FormControl
        mb="8px"
        display="flex"
        flexDir="row"
        alignItems="center"
        justifyContent="space-between">
        <FormLabel w="40%">出発駅</FormLabel>
        <Input
          value={values.departureStation}
          placeholder="出発駅"
          bg="white"
          onChange={(e) =>
            setValues((a) => ({
              ...a,
              departureStation: e.target.value,
            }))
          }
        />
      </FormControl>
      <FormControl
        mb="8px"
        display="flex"
        flexDir="row"
        alignItems="center"
        justifyContent="space-between">
        <FormLabel w="40%">経由</FormLabel>
        <Input
          value={values.viaStation}
          placeholder="経由"
          bg="white"
          onChange={(e) =>
            setValues((a) => ({
              ...a,
              viaStation: e.target.value,
            }))
          }
        />
      </FormControl>
      {errors?.destinationStation && touched.destinationStation ? (
        <FormLabel color="tomato">{errors?.destinationStation}</FormLabel>
      ) : null}
      <FormControl
        mb="8px"
        display="flex"
        flexDir="row"
        alignItems="center"
        justifyContent="space-between">
        <FormLabel w="40%">到着駅</FormLabel>
        <Input
          value={values.destinationStation}
          placeholder="到着駅"
          bg="white"
          onChange={(e) =>
            setValues((a) => ({
              ...a,
              destinationStation: e.target.value,
            }))
          }
        />
      </FormControl>
      <Box mb="8px" flexDir="row" display="flex" justifyContent="flex-end">
        <Button colorScheme="orange" onClick={checkRoute}>
          経路を確認
        </Button>
      </Box>
      {errors?.travelCost && touched.travelCost ? (
        <FormLabel color="tomato">{errors?.travelCost}</FormLabel>
      ) : null}
      <FormControl
        mb="8px"
        display="flex"
        flexDir="row"
        alignItems="center"
        justifyContent="space-between">
        <FormLabel w="40%">小計</FormLabel>
        <Input
          value={values.travelCost}
          placeholder="小計"
          bg="white"
          onChange={(e) => {
            if (isNaN(Number(e.target.value))) {
              return;
            }
            setValues((a) => ({
              ...a,
              travelCost: Number(e.target.value),
            }));
          }}
        />
      </FormControl>
      <FormControl
        mb="8px"
        display="flex"
        flexDir="row"
        alignItems="center"
        justifyContent="space-between">
        <FormLabel w="40%">片道往復区分</FormLabel>
        <Select
          value={values.oneWayOrRound}
          onChange={(e) =>
            setValues((a) => ({
              ...a,
              oneWayOrRound: e.target.value as OneWayOrRound,
            }))
          }>
          <option value={OneWayOrRound.ONE_WAY}>片道</option>
          <option value={OneWayOrRound.ROUND}>往復</option>
        </Select>
      </FormControl>
      <Box mb="8px" flexDir="row" display="flex" justifyContent="flex-end">
        <Button colorScheme={'blue'} onClick={() => handleSubmit()}>
          {values.id ? '更新する' : '申請する'}
        </Button>
        {application?.id && (
          <Button colorScheme="red" onClick={() => onDeleteButtonClicked()}>
            削除する
          </Button>
        )}
      </Box>
    </Box>
  );
};

const ApplicationFormModal: React.FC<ApplicationFormModalProps> = (props) => {
  const { onClose, isOpen } = props;
  return (
    <Modal onClose={onClose} scrollBehavior="inside" isOpen={isOpen}>
      <>
        <ModalOverlay />
        <ModalContent h="90vh" bg={'#f9fafb'}>
          <ModalHeader
            flexDir="row"
            justifyContent="space-between"
            display="flex"
            mr="24px">
            <Text>入社前経費申請</Text>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <ApplicationForm {...props} />
          </ModalBody>
        </ModalContent>
      </>
    </Modal>
  );
};

export default ApplicationFormModal;

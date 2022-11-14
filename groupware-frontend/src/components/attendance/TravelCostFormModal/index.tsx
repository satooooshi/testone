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
} from '@chakra-ui/react';
import { useFormik } from 'formik';
import { DateTime } from 'luxon';
import React, { Dispatch, SetStateAction, useEffect } from 'react';
import {
  Attendance,
  TravelCost,
  TravelCostCategory,
  TravelCostOneWayOrRound,
} from 'src/types';
import { travelCostCategoryName } from 'src/utils/factory/travelCostCategoryName';
import { travelCostFormModalSchema } from 'src/utils/validation/schema';

type TravelCostFormModalProps = {
  date: DateTime;
  attendance: Partial<Attendance>;
  setAttendance: SetStateAction<Dispatch<Partial<Attendance>>>;
  onClose: () => void;
  isOpen: boolean;
};

const TravelForm = ({
  index,
  travelCost,
  attendance,
  setAttendance,
}: {
  index?: number;
  travelCost?: TravelCost;
  attendance: Partial<Attendance>;
  setAttendance: SetStateAction<Dispatch<Partial<Attendance>>>;
}) => {
  const initialValues: Partial<TravelCost> = {
    category: TravelCostCategory.CLIENT,
    destination: '',
    purpose: '',
    departureStation: '',
    viaStation: '',
    destinationStation: '',
    travelCost: 0,
    oneWayOrRound: TravelCostOneWayOrRound.ROUND,
    attendance: attendance as Attendance,
  };
  const { values, setValues, handleSubmit, errors, touched, resetForm } =
    useFormik({
      initialValues: travelCost || initialValues,
      validationSchema: travelCostFormModalSchema,
      onSubmit: (submittedValues) => {
        setAttendance((a) => {
          if (a?.travelCost?.length) {
            const travelCost = index
              ? a?.travelCost?.map((t, arrIndex) => {
                  if (index === arrIndex) {
                    return submittedValues;
                  }
                  return t;
                })
              : { ...a.travelCost, submittedValues };
            return { ...a, travelCost };
          }
          return { ...a, travelCost: [submittedValues] };
        });
        resetForm();
      },
    });

  const checkRoute = () => {
    const url = `https://transit.yahoo.co.jp/search/result?from=${values.departureStation}&via=${values.viaStation}&to=${values.destinationStation}`;
    window.open(url, '_blank');
  };

  return (
    <Box borderTopWidth={5} borderTopColor={'brand.600'}>
      <Text fontSize={22} fontWeight="bold">{`申請#${
        index ? index + 1 : 1
      }`}</Text>
      <FormControl
        mb="8px"
        display="flex"
        flexDir="row"
        alignItems="center"
        justifyContent="space-between">
        <FormLabel w="40%">交通費区分</FormLabel>
        <Select
          value={values.category}
          onChange={(e) =>
            setValues((a) => ({
              ...a,
              category: e.target.value as TravelCostCategory,
            }))
          }>
          <option value={TravelCostCategory.CLIENT}>
            {travelCostCategoryName(TravelCostCategory.CLIENT)}
          </option>
          <option value={TravelCostCategory.INHOUSE}>
            {travelCostCategoryName(TravelCostCategory.INHOUSE)}
          </option>
        </Select>
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
              oneWayOrRound: e.target.value as TravelCostOneWayOrRound,
            }))
          }>
          <option value={TravelCostOneWayOrRound.ONE_WAY}>片道</option>
          <option value={TravelCostOneWayOrRound.ROUND}>往復</option>
        </Select>
      </FormControl>
      {(!attendance?.travelCost?.length ||
        attendance?.travelCost?.length < 6) &&
      (index === undefined ||
        (index !== undefined && !attendance?.travelCost?.[index + 1])) ? (
        <Box mb="8px" flexDir="row" display="flex" justifyContent="flex-end">
          <Button colorScheme="brand" onClick={() => handleSubmit()}>
            {values.createdAt ? '更新する' : '保存する'}
          </Button>
        </Box>
      ) : null}
    </Box>
  );
};

const TravelCostFormModal: React.FC<TravelCostFormModalProps> = ({
  date,
  attendance,
  setAttendance,
  onClose,
  isOpen,
}) => {
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
            <Text>{date?.toFormat('LL月dd日')}</Text>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {attendance?.travelCost?.length
              ? attendance?.travelCost?.map((t, index) => (
                  <Box mb="32px" key={t.id}>
                    <TravelForm
                      index={index}
                      attendance={attendance}
                      setAttendance={setAttendance}
                      travelCost={t}
                    />
                  </Box>
                ))
              : null}
            {!attendance?.travelCost?.length ||
            attendance?.travelCost?.length < 6 ? (
              <TravelForm
                attendance={attendance}
                setAttendance={setAttendance}
              />
            ) : null}
          </ModalBody>
        </ModalContent>
      </>
    </Modal>
  );
};

export default TravelCostFormModal;

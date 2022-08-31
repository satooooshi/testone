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
  onClose: () => void;
  isOpen: boolean;
};

const TravelCostModal = ({
  index,
  travelCost,
}: {
  index?: number;
  travelCost: TravelCost;
}) => {
  return (
    <Box borderTopWidth={5} borderTopColor={'blue.600'}>
      <Text fontSize={22} fontWeight="bold">{`申請#${
        index ? index + 1 : 1
      }`}</Text>
      <Box
        mb="8px"
        display="flex"
        flexDir="row"
        alignItems="center"
        justifyContent="space-between">
        <Text>交通費区分:</Text>
        <Text>{travelCostCategoryName(travelCost.category)}</Text>
      </Box>
      <Box
        mb="8px"
        display="flex"
        flexDir="row"
        alignItems="center"
        justifyContent="space-between">
        <Text>行き先:</Text>
        <Text>{travelCost.destination}</Text>
      </Box>
      <Box
        mb="8px"
        display="flex"
        flexDir="row"
        alignItems="center"
        justifyContent="space-between">
        <Text>目的:</Text>
        <Text>{travelCost.purpose}</Text>
      </Box>
      <Box
        mb="8px"
        display="flex"
        flexDir="row"
        alignItems="center"
        justifyContent="space-between">
        <Text>出発駅:</Text>
        <Text>{travelCost.departureStation}</Text>
      </Box>
      <Box
        mb="8px"
        display="flex"
        flexDir="row"
        alignItems="center"
        justifyContent="space-between">
        <Text>経由:</Text>
        <Text>{travelCost.viaStation}</Text>
      </Box>
      <Box
        mb="8px"
        display="flex"
        flexDir="row"
        alignItems="center"
        justifyContent="space-between">
        <Text>到着駅:</Text>
        <Text>{travelCost.destinationStation}</Text>
      </Box>
      <Box
        mb="8px"
        display="flex"
        flexDir="row"
        alignItems="center"
        justifyContent="space-between">
        <Text>片道往復区分:</Text>
        <Text>{travelCost.oneWayOrRound === 'round' ? '往復' : '片道'}</Text>
      </Box>
      <Box
        mb="8px"
        display="flex"
        flexDir="row"
        alignItems="center"
        justifyContent="space-between">
        <Text>小計:</Text>
        <Text>{travelCost.travelCost}円</Text>
      </Box>
    </Box>
  );
};

const TravelCostDetailModal: React.FC<TravelCostFormModalProps> = ({
  date,
  attendance,
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
                    <TravelCostModal index={index} travelCost={t} />
                  </Box>
                ))
              : null}
          </ModalBody>
        </ModalContent>
      </>
    </Modal>
  );
};

export default TravelCostDetailModal;

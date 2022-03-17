import {useFormik} from 'formik';
import {DateTime} from 'luxon';
import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from 'react';
import {Linking, useWindowDimensions} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {
  Modal,
  Div,
  Text,
  Box,
  Input,
  Button,
  Icon,
  Dropdown,
} from 'react-native-magnus';
import tailwind from 'tailwind-rn';
import {
  Attendance,
  TravelCost,
  TravelCostCategory,
  TravelCostOneWayOrRound,
} from '../../../../types';
import {
  defaultDropdownOptionProps,
  defaultDropdownProps,
} from '../../../../utils/dropdown/helper';
import {travelCostCategoryName} from '../../../../utils/factory/attendance/travelCostCategoryName';
import {travelCostFormModalSchema} from '../../../../utils/validation/schema';
import DropdownOpenerButton from '../../../common/DropdownOpenerButton';

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

  const reportCategoryRef = useRef<any | null>(null);
  const fareCategoryRef = useRef<any | null>(null);
  const {values, setValues, handleSubmit, errors, touched} = useFormik({
    initialValues: travelCost || initialValues,
    validationSchema: travelCostFormModalSchema,
    onSubmit: submittedValues => {
      setAttendance(a => {
        if (a?.travelCost?.length) {
          const travelCosts = a?.travelCost?.map((t, arrIndex) => {
            if (index === arrIndex) {
              return submittedValues;
            }
            return t;
          });
          return {...a, travelCost: travelCosts};
        }
        return {...a, travelCost: [submittedValues]};
      });
    },
  });

  const checkRoute = () => {
    const url = `https://transit.yahoo.co.jp/search/result?from=${values.departureStation}&via=${values.viaStation}&to=${values.destinationStation}`;
    Linking.openURL(url);
  };

  useEffect(() => {
    handleSubmit();
  }, [handleSubmit, values]);

  return (
    <Div borderTopWidth={5} borderTopColor={'blue600'}>
      <Text fontSize={22} fontWeight="bold">{`申請#${
        index ? index + 1 : 1
      }`}</Text>
      <Box mb={4}>
        <Text>交通費区分</Text>
        <DropdownOpenerButton
          name={
            values.category ? travelCostCategoryName(values.category) : '未設定'
          }
          onPress={() => reportCategoryRef.current?.open()}
        />
      </Box>
      <Box mb={4}>
        <Text>行先</Text>
        {errors?.destination && touched.destination ? (
          <Text color="tomato">{errors?.destination}</Text>
        ) : null}
        <Input
          value={values.destination}
          placeholder="行先"
          bg="white"
          onChangeText={t =>
            setValues(a => ({
              ...a,
              destination: t,
            }))
          }
        />
      </Box>
      <Box mb={4}>
        <Text>目的</Text>
        {errors?.purpose && touched.purpose ? (
          <Text color="tomato">{errors?.purpose}</Text>
        ) : null}
        <Input
          value={values.purpose}
          placeholder="行先"
          bg="white"
          onChangeText={t =>
            setValues(a => ({
              ...a,
              purpose: t,
            }))
          }
        />
      </Box>
      <Box mb={4}>
        <Text>出発駅</Text>
        {errors?.departureStation && touched.departureStation ? (
          <Text color="tomato">{errors?.departureStation}</Text>
        ) : null}
        <Input
          value={values.departureStation}
          placeholder="行先"
          bg="white"
          onChangeText={t =>
            setValues(a => ({
              ...a,
              departureStation: t,
            }))
          }
        />
      </Box>
      <Box mb={4}>
        <Text>経由</Text>
        {errors?.viaStation && touched.viaStation ? (
          <Text color="tomato">{errors?.viaStation}</Text>
        ) : null}
        <Input
          value={values.viaStation}
          placeholder="行先"
          bg="white"
          onChangeText={t =>
            setValues(a => ({
              ...a,
              viaStation: t,
            }))
          }
        />
      </Box>
      <Box mb={4}>
        <Text>到着駅</Text>
        {errors?.destinationStation && touched.destinationStation ? (
          <Text color="tomato">{errors?.destinationStation}</Text>
        ) : null}
        <Input
          value={values.destinationStation}
          placeholder="行先"
          bg="white"
          onChangeText={t =>
            setValues(a => ({
              ...a,
              destinationStation: t,
            }))
          }
        />
      </Box>
      <Button
        bg="orange600"
        color="white"
        onPress={checkRoute}
        alignSelf="flex-end">
        経路を確認
      </Button>
      <Box mb={4}>
        <Text>小計</Text>
        {errors?.travelCost && touched.travelCost ? (
          <Text color="tomato">{errors?.travelCost}</Text>
        ) : null}
        <Input
          value={values.travelCost ? values.travelCost.toString() : ''}
          placeholder="行先"
          bg="white"
          onChangeText={t =>
            setValues(a => ({
              ...a,
              travelCost: Number(t),
            }))
          }
        />
      </Box>
      <Box mb={4}>
        <Text>交通費区分</Text>
        <DropdownOpenerButton
          name={
            values.oneWayOrRound === TravelCostOneWayOrRound.ROUND
              ? '往復'
              : values.oneWayOrRound === TravelCostOneWayOrRound.ONE_WAY
              ? '片道'
              : '未設定'
          }
          onPress={() => fareCategoryRef.current?.open()}
        />
      </Box>
      {(!attendance?.travelCost?.length ||
        attendance?.travelCost?.length < 6) &&
      (index === undefined ||
        (index !== undefined && !attendance?.travelCost?.[index + 1])) ? (
        <Button
          bg="blue600"
          color="white"
          alignSelf="flex-end"
          onPress={() =>
            setAttendance(a => ({
              ...a,
              travelCost: a?.travelCost?.length
                ? [...a.travelCost, initialValues]
                : [values, initialValues],
            }))
          }>
          申請を追加
        </Button>
      ) : null}

      <Dropdown
        {...defaultDropdownProps}
        ref={reportCategoryRef}
        title="交通費区分を選択">
        <Dropdown.Option
          {...defaultDropdownOptionProps}
          onPress={() => {
            setValues(v => ({...v, category: TravelCostCategory.CLIENT}));
          }}
          value={TravelCostCategory.CLIENT}>
          {travelCostCategoryName(TravelCostCategory.CLIENT)}
        </Dropdown.Option>
        <Dropdown.Option
          {...defaultDropdownOptionProps}
          onPress={() => {
            setValues(v => ({...v, category: TravelCostCategory.INHOUSE}));
          }}
          value={TravelCostCategory.INHOUSE}>
          {travelCostCategoryName(TravelCostCategory.INHOUSE)}
        </Dropdown.Option>
      </Dropdown>
      <Dropdown
        {...defaultDropdownProps}
        ref={fareCategoryRef}
        title="交通費区分を選択">
        <Dropdown.Option
          {...defaultDropdownOptionProps}
          onPress={() => {
            setValues(v => ({
              ...v,
              oneWayOrRound: TravelCostOneWayOrRound.ONE_WAY,
            }));
          }}
          value={TravelCostOneWayOrRound.ROUND}>
          片道
        </Dropdown.Option>
        <Dropdown.Option
          {...defaultDropdownOptionProps}
          onPress={() => {
            setValues(v => ({
              ...v,
              oneWayOrRound: TravelCostOneWayOrRound.ROUND,
            }));
          }}
          value={TravelCostOneWayOrRound.ROUND}>
          往復
        </Dropdown.Option>
      </Dropdown>
    </Div>
  );
};

const TravelCostFormModal: React.FC<TravelCostFormModalProps> = ({
  date,
  attendance,
  setAttendance,
  onClose,
  isOpen,
}) => {
  const windowWidth = useWindowDimensions().width;
  return (
    <Modal isVisible={isOpen}>
      <Button
        bg="gray400"
        h={35}
        w={35}
        mb="lg"
        alignSelf="flex-end"
        rounded="circle"
        onPress={onClose}>
        <Icon color="black" name="close" />
      </Button>
      <KeyboardAwareScrollView
        contentContainerStyle={{width: windowWidth * 0.9}}
        style={tailwind('self-center')}>
        <Text fontSize={16}>{date?.toFormat('LL月dd日')}</Text>
        {attendance?.travelCost?.length ? (
          attendance?.travelCost?.map((t, index) => (
            <Box mb={16} key={t.id}>
              <TravelForm
                index={index}
                attendance={attendance}
                setAttendance={setAttendance}
                travelCost={t}
              />
            </Box>
          ))
        ) : (
          <TravelForm attendance={attendance} setAttendance={setAttendance} />
        )}
      </KeyboardAwareScrollView>
    </Modal>
  );
};

export default TravelCostFormModal;

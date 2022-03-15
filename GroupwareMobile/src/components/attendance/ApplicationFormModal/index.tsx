import {useFormik} from 'formik';
import {DateTime} from 'luxon';
import React, {useEffect, useRef, useState} from 'react';
import {Alert, Linking, useWindowDimensions} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {
  Box,
  Button,
  Div,
  Dropdown,
  Icon,
  Input,
  Modal,
  Text,
} from 'react-native-magnus';
import DateTimePicker from 'react-native-modal-datetime-picker';
import tailwind from 'tailwind-rn';
import {useAPICreateApplication} from '../../../hooks/api/attendance/application/useAPICreateApplication';
import {useAPIDeleteApplication} from '../../../hooks/api/attendance/application/useAPIDeleteApplication';
import {useAPIUpdateApplication} from '../../../hooks/api/attendance/application/useAPIUpdateApplication';
import {ApplicationBeforeJoining, OneWayOrRound} from '../../../types';
import {
  defaultDropdownProps,
  defaultDropdownOptionProps,
} from '../../../utils/dropdown/helper';
import {applicationFormModalSchema} from '../../../utils/validation/schema';
import DropdownOpenerButton from '../../common/DropdownOpenerButton';

type ApplicationFormModalProps = {
  application?: ApplicationBeforeJoining;
  onClose: () => void;
  isOpen: boolean;
};

const ApplicationForm: React.FC<ApplicationFormModalProps> = ({
  application,
  onClose,
}) => {
  const fareCategoryRef = useRef<any | null>(null);
  const [dateTimeModal, setDateTimeModal] = useState(false);
  const initialValues: Partial<ApplicationBeforeJoining> = {
    destination: '',
    purpose: '',
    departureStation: '',
    viaStation: '',
    destinationStation: '',
    travelCost: 0,
    oneWayOrRound: OneWayOrRound.ROUND,
  };
  const {mutate: createApplication} = useAPICreateApplication({
    onSuccess: () => {
      Alert.alert('申請が完了しました');
      onClose();
    },
  });
  const {mutate: updateApplication} = useAPIUpdateApplication({
    onSuccess: () => {
      Alert.alert('更新が完了しました');
      onClose();
    },
  });

  const {mutate: deleteApplication} = useAPIDeleteApplication({
    onSuccess: () => {
      Alert.alert('削除が完了しました');
      onClose();
    },
  });

  const onDeleteButtonClicked = () => {
    if (!application) {
      return;
    }
    Alert.alert(
      '申請を削除してよろしいですか？',
      '',
      [
        {text: 'キャンセル', style: 'cancel'},
        {
          text: '削除する',
          style: 'destructive',
          onPress: () => deleteApplication({applicationId: application.id}),
        },
      ],
      {cancelable: false},
    );
  };
  const {values, setValues, handleSubmit, errors, touched} = useFormik({
    initialValues: application || initialValues,
    validationSchema: applicationFormModalSchema,
    onSubmit: submittedValues => {
      if (submittedValues.id) {
        updateApplication(submittedValues as ApplicationBeforeJoining);
        return;
      }
      createApplication(submittedValues);
    },
  });

  const checkRoute = () => {
    const url = `https://transit.yahoo.co.jp/search/result?from=${values.departureStation}&via=${values.viaStation}&to=${values.destinationStation}`;
    Linking.openURL(url);
  };

  return (
    <Div borderTopWidth={5} borderTopColor={'blue600'}>
      <Box mb={4}>
        <Text>日付</Text>
        <DropdownOpenerButton
          name={
            values.attendanceTime
              ? DateTime.fromJSDate(new Date(values.attendanceTime)).toFormat(
                  'yyyy/LL/dd',
                )
              : '未設定'
          }
          onPress={() => setDateTimeModal(true)}
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
          placeholder="目的"
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
          placeholder="出発駅"
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
          placeholder="経由"
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
          placeholder="到着駅"
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
          placeholder="小計"
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
        <Text>片道往復区分</Text>
        <DropdownOpenerButton
          name={
            values.oneWayOrRound === OneWayOrRound.ROUND
              ? '往復'
              : values.oneWayOrRound === OneWayOrRound.ONE_WAY
              ? '片道'
              : '未設定'
          }
          onPress={() => fareCategoryRef.current?.open()}
        />
      </Box>
      <Box flexDir="row" alignSelf="flex-end">
        <Button
          bg="blue600"
          color="white"
          alignSelf="flex-end"
          onPress={() => handleSubmit()}>
          {values.id ? '更新する' : '申請する'}
        </Button>
        {application?.id && (
          <Button
            bg="red600"
            color="white"
            alignSelf="flex-end"
            onPress={() => onDeleteButtonClicked()}>
            削除する
          </Button>
        )}
      </Box>
      <Dropdown
        {...defaultDropdownProps}
        ref={fareCategoryRef}
        title="交通費区分を選択">
        <Dropdown.Option
          {...defaultDropdownOptionProps}
          onPress={() => {
            setValues(v => ({
              ...v,
              oneWayOrRound: OneWayOrRound.ONE_WAY,
            }));
          }}
          value={OneWayOrRound.ROUND}>
          片道
        </Dropdown.Option>
        <Dropdown.Option
          {...defaultDropdownOptionProps}
          onPress={() => {
            setValues(v => ({
              ...v,
              oneWayOrRound: OneWayOrRound.ROUND,
            }));
          }}
          value={OneWayOrRound.ROUND}>
          往復
        </Dropdown.Option>
      </Dropdown>
      <DateTimePicker
        isVisible={dateTimeModal}
        date={
          values.attendanceTime ? new Date(values.attendanceTime) : new Date()
        }
        onCancel={() => setDateTimeModal(false)}
        onConfirm={date => {
          setValues(v => ({...v, attendanceTime: date}));
          setDateTimeModal(false);
        }}
      />
    </Div>
  );
};

const ApplicationFormModal: React.FC<ApplicationFormModalProps> = props => {
  const {isOpen, onClose} = props;
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
        <Text my="lg" fontWeight="bold" fontSize={20}>
          入社前経費申請
        </Text>
        <ApplicationForm {...props} />
      </KeyboardAwareScrollView>
    </Modal>
  );
};
export default ApplicationFormModal;

import {AxiosError} from 'axios';
import React, {useRef, useState} from 'react';
import {Alert, TouchableHighlight, useWindowDimensions} from 'react-native';
import {
  Text,
  Button,
  Div,
  Icon,
  Overlay,
  ScrollDiv,
  Select,
  SelectRef,
} from 'react-native-magnus';
import tailwind from 'tailwind-rn';
import {useAPISaveUserJoiningEvent} from '../../../hooks/api/event/useAPISaveUserJoiningEvent';
import {UserJoiningEvent} from '../../../types';
import {userNameFactory} from '../../../utils/factory/userNameFactory';
import UserAvatar from '../../common/UserAvatar';

type EventParticipantsProps = {
  userJoiningEvents: UserJoiningEvent[];
  isEditable: boolean;
  onSuccessSaveUserJoiningEvent: (uje: UserJoiningEvent) => void;
};

const EventParticipants: React.FC<EventParticipantsProps> = ({
  userJoiningEvents,
  isEditable,
  onSuccessSaveUserJoiningEvent,
}) => {
  const windowWidth = useWindowDimensions().width;
  const [joiningUserVisiable, setJoiningUserVisiable] =
    useState<boolean>(false);
  const lateRecorderRef = useRef<SelectRef>(null);
  const lateRecorderInOverLayRef = useRef<SelectRef>(null);
  const [
    lateRecordTargetUserJoiningEvent,
    setLateRecordTargetUserJoiningEvent,
  ] = useState<UserJoiningEvent>();
  const {mutate: handleChangeJoiningData} = useAPISaveUserJoiningEvent({
    onSuccess: data => {
      onSuccessSaveUserJoiningEvent(data);
      Alert.alert('遅刻を記録しました。');
    },
    onError: () => {
      Alert.alert(
        '遅刻記録中にエラーが発生しました。\n時間をおいて再度実行してください。',
      );
    },
  });

  return (
    <>
      <Select
        onSelect={v => {
          if (lateRecordTargetUserJoiningEvent) {
            handleChangeJoiningData({
              ...lateRecordTargetUserJoiningEvent,
              lateMinutes: v,
            });
          }
        }}
        ref={lateRecorderRef}
        value={lateRecordTargetUserJoiningEvent?.lateMinutes}
        title={
          userNameFactory(lateRecordTargetUserJoiningEvent?.user) +
          'さんの遅刻を記録'
        }
        message="遅刻時間を選択してください。"
        roundedTop="xl"
        style={tailwind('z-50')}
        data={[15, 30, 45, 60, 90, 120]}
        renderItem={item => (
          <Select.Option value={item} py="md" px="xl">
            <Text>{item}分遅刻</Text>
          </Select.Option>
        )}
      />
      <Overlay
        w="90%"
        visible={joiningUserVisiable}
        onBackdropPress={() => setJoiningUserVisiable(false)}>
        <Div my="lg" flexDir="row" justifyContent="space-between" w="100%">
          <Text fontSize={14} ml={24}>
            参加者一覧 : {userJoiningEvents?.length}名
            {isEditable && '(タップで遅刻を記録)'}
          </Text>
          <Button
            bg="gray400"
            h={35}
            w={35}
            rounded="circle"
            onPress={() => {
              setJoiningUserVisiable(false);
            }}>
            <Icon color="black900" name="close" />
          </Button>
        </Div>
        <ScrollDiv
          mb={'lg'}
          contentContainerStyle={tailwind(
            'flex-row flex-wrap justify-between',
          )}>
          {userJoiningEvents?.map(uje => {
            return (
              <TouchableHighlight
                underlayColor="none"
                key={uje.id}
                style={{
                  ...tailwind(
                    'bg-white flex-row flex-wrap rounded items-center border border-gray-400 mb-2 p-2',
                  ),
                  width: windowWidth * 0.4,
                }}
                onPress={() => {
                  if (isEditable && lateRecorderInOverLayRef.current) {
                    setLateRecordTargetUserJoiningEvent(uje);
                    lateRecorderInOverLayRef.current.open();
                  }
                }}>
                <>
                  <Div mr="lg">
                    <UserAvatar
                      user={uje.user}
                      h={windowWidth * 0.09}
                      w={windowWidth * 0.09}
                    />
                  </Div>
                  <Div>
                    <Text numberOfLines={1}>{userNameFactory(uje.user)}</Text>
                    {isEditable && uje.lateMinutes !== 0 && (
                      <Text color="red">{uje.lateMinutes}分遅刻</Text>
                    )}
                  </Div>
                </>
              </TouchableHighlight>
            );
          })}
        </ScrollDiv>
        <Select
          onSelect={v => {
            if (lateRecordTargetUserJoiningEvent) {
              handleChangeJoiningData({
                ...lateRecordTargetUserJoiningEvent,
                lateMinutes: v,
              });
            }
          }}
          ref={lateRecorderInOverLayRef}
          value={lateRecordTargetUserJoiningEvent?.lateMinutes}
          title={
            userNameFactory(lateRecordTargetUserJoiningEvent?.user) +
            'さんの遅刻を記録'
          }
          message="遅刻時間を選択してください。"
          roundedTop="xl"
          style={tailwind('z-50')}
          data={[15, 30, 45, 60, 90, 120]}
          renderItem={item => (
            <Select.Option value={item} py="md" px="xl">
              <Text>{item}分遅刻</Text>
            </Select.Option>
          )}
        />
      </Overlay>
      <Div
        borderBottomWidth={1}
        borderColor="green400"
        flexDir="row"
        justifyContent="space-between"
        alignItems="flex-end"
        mb="lg"
        pb="md">
        <Text>
          参加者:
          {userJoiningEvents.length || 0}名
          {isEditable && '(タップで遅刻を記録)'}
        </Text>
      </Div>
      <Div
        flexDir="row"
        justifyContent="space-between"
        alignItems="center"
        flexWrap="wrap">
        {userJoiningEvents.map((uje, index) => {
          if (index > 6) {
            return;
          } else if (index === 6) {
            return (
              <Button
                block
                rounded="sm"
                fontSize={12}
                onPress={() => setJoiningUserVisiable(true)}>
                参加者を一覧表示
              </Button>
            );
          } else {
            return (
              <TouchableHighlight
                underlayColor="none"
                style={{
                  ...tailwind(
                    'bg-white flex-row flex-wrap rounded items-center border border-gray-400 mb-2 p-2',
                  ),
                  width: windowWidth * 0.45,
                }}
                onPress={() => {
                  if (isEditable && lateRecorderRef.current) {
                    setLateRecordTargetUserJoiningEvent(uje);
                    lateRecorderRef.current.open();
                  }
                }}>
                <>
                  <Div mr="lg">
                    <UserAvatar
                      user={uje.user}
                      h={windowWidth * 0.09}
                      w={windowWidth * 0.09}
                    />
                  </Div>
                  <Div>
                    <Text numberOfLines={1}>{userNameFactory(uje.user)}</Text>
                    {isEditable && uje.lateMinutes !== 0 && (
                      <Text color="red">{uje.lateMinutes}分遅刻</Text>
                    )}
                  </Div>
                </>
              </TouchableHighlight>
            );
          }
        })}
      </Div>
    </>
  );
};

export default EventParticipants;

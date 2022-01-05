import React, { useState } from 'react';
import { UserJoiningEvent, UserRole } from 'src/types';
import {
  Box,
  Button,
  Link,
  Menu,
  MenuButton,
  MenuItemOption,
  MenuList,
  MenuOptionGroup,
  Text,
} from '@chakra-ui/react';
import { useAuthenticate } from 'src/contexts/useAuthenticate';
import { darkFontColor } from 'src/utils/colors';
import UserAvatar from '@/components/common/UserAvatar';
import { userNameFactory } from 'src/utils/factory/userNameFactory';

type EventParticipantsProps = {
  userJoiningEvent: UserJoiningEvent[];
  onChangeJoiningData: (uje: UserJoiningEvent) => void;
};

const EventParticipants: React.FC<EventParticipantsProps> = ({
  userJoiningEvent,
  onChangeJoiningData,
}) => {
  const [allVisible, setAllVisible] = useState(false);
  const { user } = useAuthenticate();
  const participantsExceptCanceled = userJoiningEvent.filter(
    (uje) => uje.canceledAt === null,
  );

  const lateMinutesText = (v: number) => {
    if (!v) {
      return '遅刻を記録';
    }
    let message = '';
    const hour = Math.floor(v / 60);
    const minutes = v % 60;
    if (hour) {
      message += `${hour}時間`;
    }
    if (minutes) {
      message += `${minutes}分`;
    }
    return `${message}遅刻`;
  };
  return (
    <Box shadow="md" rounded="md" borderWidth={1} borderColor={'gray.200'}>
      <Box
        display="flex"
        flexDir="row"
        alignItems="center"
        mx="16px"
        minH="50px"
        justifyContent="space-between"
        borderBottomColor="gray.200"
        borderBottomWidth={1}>
        <Text color="green.600" fontWeight="bold" fontSize="20px">
          参加者一覧
        </Text>
        {!allVisible && participantsExceptCanceled.length > 15 ? (
          <Link onClick={() => setAllVisible(true)}>
            <Text fontWeight="bold" fontSize="20px" color="blue.600">
              See All
            </Text>
          </Link>
        ) : null}
      </Box>
      {!participantsExceptCanceled?.length && (
        <Box
          borderWidth={1}
          borderColor={'gray.200'}
          py="8px"
          px="16px"
          display="flex"
          flexDir="row"
          alignItems="center"
          justifyContent="space-between">
          <Text color={darkFontColor} fontWeight="bold" fontSize="18px">
            まだ参加申し込みされていません
          </Text>
        </Box>
      )}
      {participantsExceptCanceled
        ?.filter((u) => u.user.existence)
        ?.map((u, index) =>
          index <= 15 || allVisible ? (
            <Box
              borderWidth={1}
              borderColor={'gray.200'}
              py="8px"
              px="16px"
              display="flex"
              flexDir="row"
              alignItems="center"
              key={u.user.id}
              justifyContent="space-between">
              <Link href={`/account/${u.user.id}`}>
                <Box display="flex" flexDir="row" alignItems="center">
                  <UserAvatar user={u.user} h="40px" w="40px" mr="8px" />
                  <Text color={darkFontColor} fontWeight="bold" fontSize="18px">
                    {userNameFactory(u.user)}
                  </Text>
                </Box>
              </Link>
              {user?.role === UserRole.ADMIN && (
                <Menu>
                  <MenuButton as={Button} colorScheme="red" size="sm">
                    {u.lateMinutes
                      ? lateMinutesText(Number(u.lateMinutes))
                      : '遅刻を記録'}
                  </MenuButton>
                  <MenuList>
                    <MenuOptionGroup
                      onChange={(v) =>
                        onChangeJoiningData({ ...u, lateMinutes: Number(v) })
                      }
                      defaultValue={''}
                      value={u.lateMinutes.toString()}
                      type="radio">
                      <MenuItemOption value="">記録しない</MenuItemOption>
                      <MenuItemOption value="15">15分遅刻</MenuItemOption>
                      <MenuItemOption value="30">30分遅刻</MenuItemOption>
                      <MenuItemOption value="45">45分遅刻</MenuItemOption>
                      <MenuItemOption value="60">1時間遅刻</MenuItemOption>
                      <MenuItemOption value="90">1時間半遅刻</MenuItemOption>
                      <MenuItemOption value="120">2時間遅刻</MenuItemOption>
                    </MenuOptionGroup>
                  </MenuList>
                </Menu>
              )}
            </Box>
          ) : (
            <></>
          ),
        )}
    </Box>
  );
};

export default EventParticipants;

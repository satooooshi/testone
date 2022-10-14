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
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  SimpleGrid,
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

  const userList = (users: UserJoiningEvent[], isModal?: boolean) => {
    return (
      <Box rounded="md" bg="white" w="100%" p={5} mt={3}>
        {!isModal ? (
          <Box
            w="100%"
            display="flex"
            flexDir="row"
            alignItems="center"
            justifyContent="space-between">
            {users?.length >= 10 ? (
              <Link onClick={() => setAllVisible((v) => !v)}>
                <Text
                  fontWeight="bold"
                  fontSize="20px"
                  color="brand.600"
                  mb={2}>
                  {'全て見る'}
                </Text>
              </Link>
            ) : null}
          </Box>
        ) : null}
        {!participantsExceptCanceled?.length && (
          <Box>
            <Text
              color={darkFontColor}
              fontWeight="bold"
              fontSize="18px"
              textAlign="center">
              まだ参加申し込みされていません
            </Text>
          </Box>
        )}
        <SimpleGrid
          minChildWidth="120px"
          spacing="10px"
          display={users.length < 5 ? 'flex' : undefined}
          // justifyContent="flex-start"
          flexWrap="wrap">
          {users.map((u, index) =>
            index <= 10 || allVisible ? (
              <Box
                maxW="130px"
                minW="120px"
                my={1}
                rounded="md"
                borderWidth={1}
                borderColor={'gray.200'}
                py="8px"
                display="flex"
                flexDir="column"
                alignItems="center"
                key={u.user.id}>
                <Link href={`/account/${u.user.id}`} mb={2}>
                  <Box display="flex" flexDir="column" alignItems="center">
                    <UserAvatar user={u.user} h="80px" w="80px" mb="8px" />
                    <Text fontWeight="bold" fontSize="14px" textAlign="center">
                      {userNameFactory(u.user)}
                    </Text>
                  </Box>
                </Link>
                {user?.role === UserRole.ADMIN && (
                  <Menu>
                    <MenuButton
                      as={Button}
                      mt="auto"
                      size="xs"
                      borderRadius={50}
                      colorScheme="brand"
                      variant="outline">
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
        </SimpleGrid>
      </Box>
    );
  };

  return (
    <>
      <Modal
        onClose={() => setAllVisible(false)}
        isOpen={allVisible}
        scrollBehavior="inside"
        size="xl">
        <ModalOverlay />
        <ModalContent h="90vh" bg={'#f9fafb'}>
          <ModalCloseButton />
          <ModalHeader fontSize="16px">参加者一覧</ModalHeader>
          <ModalBody>
            {userList(
              participantsExceptCanceled?.filter((u) => u.user.existence),
              true,
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
      {userList(
        participantsExceptCanceled?.filter(
          (u, index) => u.user.existence && index <= 10,
          false,
        ),
      )}
    </>
  );
};

export default EventParticipants;

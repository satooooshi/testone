import { Box, Text, useMediaQuery } from '@chakra-ui/react';
import '@draft-js-plugins/mention/lib/plugin.css';
import '@draft-js-plugins/image/lib/plugin.css';
import { useRouter } from 'next/router';
import { darkFontColor } from 'src/utils/colors';
import RoomList from '@/components/chat/RoomList';
import ChatLayout from '@/components/chat/Layout';

const Chat = () => {
  const router = useRouter();
  const [isLargerTahn1024] = useMediaQuery('(min-width: 1024px)');
  const [isSmallerThan768] = useMediaQuery('(max-width: 768px)');

  return (
    <ChatLayout>
      {isSmallerThan768 ? (
        <>
          <Box alignSelf="center">
            <Text fontWeight="bold" color={darkFontColor} fontSize="14px">
              ルームを選択
            </Text>
          </Box>
          <Box w={'85%'}>
            <RoomList
              onClickRoom={(g) => {
                router.push(`/chat/${g.id.toString()}`, undefined, {
                  shallow: true,
                });
              }}
            />
          </Box>
        </>
      ) : (
        <Box
          w="100%"
          display="flex"
          flexDir="row"
          h="83vh"
          justifyContent="center">
          <Box w={isLargerTahn1024 ? '30%' : '40%'}>
            <RoomList
              onClickRoom={(g) => {
                router.push(`/chat/${g.id.toString()}`, undefined, {
                  shallow: true,
                });
              }}
            />
          </Box>
          <Box
            w="60vw"
            h="100%"
            display="flex"
            flexDir="row"
            justifyContent="center"
            alignItems="center"
            boxShadow="md"
            bg="white"
            borderRadius="md">
            <Text position="absolute" top="auto" bottom="auto">
              ルームを選択してください
            </Text>
          </Box>
        </Box>
      )}
    </ChatLayout>
  );
};

export default Chat;

import { Flex, Text } from '@chakra-ui/react';
import { useMemo } from 'react';

type UserPointCounterType = {
  label: 'event' | 'question' | 'answer' | 'knowledge';
  count: number | string;
  duration?: 'week' | 'month';
};

const UserPointCounter: React.FC<UserPointCounterType> = ({
  label,
  count,
  duration,
}) => {
  const labelText = useMemo(() => {
    switch (label) {
      case 'event':
        return 'イベント参加数';
      case 'question':
        return 'メッセージ数';
      case 'answer':
        return 'メッセージ回答数';
      case 'knowledge':
        return 'コメント数';
    }
  }, [label]);

  // const durationText = () => {
  //   if (duration === 'week') {
  //     return '(週間)';
  //   }
  //   if (duration === 'month') {
  //     return '(月間)';
  //   }
  //   return '';
  // };
  return (
    <Flex alignItems="center">
      <Text fontSize="12px" color="gray" noOfLines={1} w="100px">
        {labelText}
        {/* {durationText()} */}
      </Text>
      <Text fontSize="12px" fontWeight="bold" color="green.300">
        {count.toString()}
      </Text>
    </Flex>
  );
};
export default UserPointCounter;

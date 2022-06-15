import userCardStyles from '@/styles/components/UserCard.module.scss';
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
        return '質問数';
      case 'answer':
        return '質問回答数';
      case 'knowledge':
        return 'ナレッジ投稿数';
    }
  }, [label]);

  const durationText = () => {
    if (duration === 'week') {
      return '(週間)';
    }
    if (duration === 'month') {
      return '(月間)';
    }
    return '';
  };
  return (
    <Flex
      alignItems="center"
      justifyContent="space-between"
      w="40%"
      className={userCardStyles.sub_info_text}>
      <Text fontSize="14px">
        {labelText}
        {durationText()}
      </Text>
      <Text fontWeight="bold" fontSize="18px" color="green.400">
        {count.toString()}
      </Text>
    </Flex>
  );
};
export default UserPointCounter;

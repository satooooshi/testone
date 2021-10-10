import userCardStyles from '@/styles/components/UserCard.module.scss';
import { useMemo } from 'react';

type UserPointCounterType = {
  label: 'event' | 'question' | 'answer' | 'knowledge';
  count: number | string;
  duration: 'week' | 'month';
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
  };
  return (
    <span className={userCardStyles.sub_info_text}>
      <p className={userCardStyles.count_label_text}>
        {labelText}
        {durationText()}
      </p>
      <p className={userCardStyles.count}>{count.toString()}</p>
    </span>
  );
};
export default UserPointCounter;

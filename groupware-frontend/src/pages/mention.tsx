import LayoutWithTab from '@/components/LayoutWithTab';
import React from 'react';
import { ScreenName } from '@/components/Sidebar';
import mentionStyles from '@/styles/layouts/Mention.module.scss';
import { Tab } from 'src/types/header/tab/types';
import MentionMessageCard from '@/components/MentionMessageCard';
import Link from 'next/link';
import { useAPIGetLatestMentionedChatMessage } from '@/hooks/api/chat/useAPIGetLatestMentionedChatMessage';
import { useHeaderTab } from '@/hooks/headerTab/useHeaderTab';

const MentionList = () => {
  const { data: messages } = useAPIGetLatestMentionedChatMessage();
  const tabs: Tab[] = useHeaderTab({ headerTabType: 'mention' });

  return (
    <LayoutWithTab
      sidebar={{ activeScreenName: ScreenName.HOME }}
      header={{
        title: 'Home',
        activeTabName: 'メンション一覧',
        tabs: tabs,
      }}>
      <div className={mentionStyles.mention_list}>
        {messages && messages.length ? (
          messages.map((m) => (
            <Link key={m.id} href={`/chat/${m.chatGroup?.id}`} passHref>
              <a className={mentionStyles.card_wrapper}>
                <MentionMessageCard message={m} />
              </a>
            </Link>
          ))
        ) : (
          <p>直近のメンション履歴はありません</p>
        )}
      </div>
    </LayoutWithTab>
  );
};

export default MentionList;

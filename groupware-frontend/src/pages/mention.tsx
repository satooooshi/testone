import LayoutWithTab from '@/components/layout/LayoutWithTab';
import React from 'react';
import { SidebarScreenName } from '@/components/layout/Sidebar';
import mentionStyles from '@/styles/layouts/Mention.module.scss';
import { Tab } from 'src/types/header/tab/types';
import MentionMessageCard from '@/components/common/MentionMessageCard';
import Link from 'next/link';
import { useAPIGetLatestMentionedChatMessage } from '@/hooks/api/chat/useAPIGetLatestMentionedChatMessage';
import { useHeaderTab } from '@/hooks/headerTab/useHeaderTab';
import Head from 'next/head';

const MentionList = () => {
  const { data: messages } = useAPIGetLatestMentionedChatMessage();
  const tabs: Tab[] = useHeaderTab({ headerTabType: 'mention' });

  return (
    <LayoutWithTab
      sidebar={{ activeScreenName: SidebarScreenName.HOME }}
      header={{
        title: 'Home',
        activeTabName: 'メンション一覧',
        tabs: tabs,
      }}>
      <Head>
        <title>りゅう鍼灸整骨院 | メンション一覧</title>
      </Head>
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
          <p>直近一週間にメンション履歴はありません</p>
        )}
      </div>
    </LayoutWithTab>
  );
};

export default MentionList;

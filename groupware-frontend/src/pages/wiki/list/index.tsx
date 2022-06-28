import { SidebarScreenName } from '@/components/layout/Sidebar';
import { Tab } from 'src/types/header/tab/types';
import { useRouter } from 'next/router';
import WikiCard from '@/components/common/WikiCard';
import dynamic from 'next/dynamic';
const ReactPaginate = dynamic(() => import('react-paginate'), { ssr: false });
import paginationStyles from '@/styles/components/Pagination.module.scss';
import qaListStyles from '@/styles/layouts/QAList.module.scss';
import React, { useEffect, useState } from 'react';
import LayoutWithTab from '@/components/layout/LayoutWithTab';
import SearchForm from '@/components/common/SearchForm';
import { useAPIGetTag } from '@/hooks/api/tag/useAPIGetTag';
import { toggleTag } from 'src/utils/toggleTag';
import { BoardCategory, RuleCategory, Tag, WikiType } from 'src/types';
import { wikiQueryRefresh } from 'src/utils/wikiQueryRefresh';
import Head from 'next/head';
import {
  SearchQueryToGetWiki,
  useAPIGetWikiList,
} from '@/hooks/api/wiki/useAPIGetWikiList';
import { useHeaderTab } from '@/hooks/headerTab/useHeaderTab';
import TopTabBar, { TopTabBehavior } from '@/components/layout/TopTabBar';
import { Box, Radio, RadioGroup, Stack, Text } from '@chakra-ui/react';
import { wikiTypeNameFactory } from 'src/utils/wiki/wikiTypeNameFactory';
import TabList from '@/components/common/TabList';

const QAQuestionList = () => {
  const router = useRouter();
  const {
    page = '',
    tag = '',
    word = '',
    status = 'new',
    type,
    rule_category,
    board_category,
  } = router.query as SearchQueryToGetWiki;
  const { data: questions, isLoading } = useAPIGetWikiList({
    page,
    tag,
    word,
    status,
    type,
    rule_category,
    board_category,
  });
  const [searchWord, setSearchWord] = useState(word);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const { data: tags } = useAPIGetTag();

  const boardTabs: Tab[] = [
    {
      name: 'All',
      onClick: () =>
        queryRefresh({
          type: WikiType.BOARD,
          board_category: undefined,
          status: undefined,
        }),
      isActive: type === WikiType.BOARD && !board_category,
    },
    {
      name: wikiTypeNameFactory(
        WikiType.BOARD,
        undefined,
        true,
        BoardCategory.KNOWLEDGE,
      ),
      onClick: () =>
        queryRefresh({
          type: WikiType.BOARD,
          board_category: BoardCategory.KNOWLEDGE,
          status: undefined,
        }),
      isActive:
        type === WikiType.BOARD && board_category === BoardCategory.KNOWLEDGE,
    },
    {
      name: wikiTypeNameFactory(
        WikiType.BOARD,
        undefined,
        true,
        BoardCategory.QA,
      ),
      onClick: () =>
        queryRefresh({
          type: WikiType.BOARD,
          board_category: BoardCategory.QA,
          status: 'new',
        }),
      isActive: type === WikiType.BOARD && board_category === BoardCategory.QA,
    },
    {
      name: wikiTypeNameFactory(
        WikiType.BOARD,
        undefined,
        true,
        BoardCategory.NEWS,
      ),
      onClick: () =>
        queryRefresh({
          type: WikiType.BOARD,
          board_category: BoardCategory.NEWS,
          status: undefined,
        }),
      isActive:
        type === WikiType.BOARD && board_category === BoardCategory.NEWS,
    },
    {
      name: wikiTypeNameFactory(
        WikiType.BOARD,
        undefined,
        true,
        BoardCategory.IMPRESSIVE_UNIVERSITY,
      ),
      onClick: () =>
        queryRefresh({
          type: WikiType.BOARD,
          board_category: BoardCategory.IMPRESSIVE_UNIVERSITY,
          status: undefined,
        }),
      isActive:
        type === WikiType.BOARD &&
        board_category === BoardCategory.IMPRESSIVE_UNIVERSITY,
    },
    {
      name: wikiTypeNameFactory(
        WikiType.BOARD,
        undefined,
        true,
        BoardCategory.CLUB,
      ),
      onClick: () =>
        queryRefresh({
          type: WikiType.BOARD,
          board_category: BoardCategory.CLUB,
          status: undefined,
        }),
      isActive:
        type === WikiType.BOARD && board_category === BoardCategory.CLUB,
    },
    {
      name: wikiTypeNameFactory(
        WikiType.BOARD,
        undefined,
        true,
        BoardCategory.STUDY_MEETING,
      ),
      onClick: () =>
        queryRefresh({
          type: WikiType.BOARD,
          board_category: BoardCategory.STUDY_MEETING,
          status: undefined,
        }),
      isActive:
        type === WikiType.BOARD &&
        board_category === BoardCategory.STUDY_MEETING,
    },
    {
      name: wikiTypeNameFactory(
        WikiType.BOARD,
        undefined,
        true,
        BoardCategory.SELF_IMPROVEMENT,
      ),
      onClick: () =>
        queryRefresh({
          type: WikiType.BOARD,
          board_category: BoardCategory.SELF_IMPROVEMENT,
          status: undefined,
        }),
      isActive:
        type === WikiType.BOARD &&
        board_category === BoardCategory.SELF_IMPROVEMENT,
    },
    {
      name: wikiTypeNameFactory(
        WikiType.BOARD,
        undefined,
        true,
        BoardCategory.PERSONAL_ANNOUNCEMENT,
      ),
      onClick: () =>
        queryRefresh({
          type: WikiType.BOARD,
          board_category: BoardCategory.PERSONAL_ANNOUNCEMENT,
          status: undefined,
        }),
      isActive:
        type === WikiType.BOARD &&
        board_category === BoardCategory.PERSONAL_ANNOUNCEMENT,
    },
    {
      name: wikiTypeNameFactory(
        WikiType.BOARD,
        undefined,
        true,
        BoardCategory.CELEBRATION,
      ),
      onClick: () =>
        queryRefresh({
          type: WikiType.BOARD,
          board_category: BoardCategory.CELEBRATION,
          status: undefined,
        }),
      isActive:
        type === WikiType.BOARD && board_category === BoardCategory.CELEBRATION,
    },
    {
      name: wikiTypeNameFactory(
        WikiType.BOARD,
        undefined,
        true,
        BoardCategory.OTHER,
      ),
      onClick: () =>
        queryRefresh({
          type: WikiType.BOARD,
          board_category: BoardCategory.OTHER,
          status: undefined,
        }),
      isActive:
        type === WikiType.BOARD && board_category === BoardCategory.OTHER,
    },
  ];
  // const qaTopTab: TopTabBehavior[] = [
  //   {
  //     tabName: '新着',
  //     onClick: () =>
  //       queryRefresh({
  //         type: WikiType.QA,
  //         status: 'new',
  //       }),
  //     isActiveTab: status === 'new',
  //   },
  //   {
  //     tabName: '解決済み',
  //     onClick: () =>
  //       queryRefresh({
  //         type: WikiType.QA,
  //         status: 'resolved',
  //       }),
  //     isActiveTab: status === 'resolved',
  //   },
  // ];

  const rulesTab: Tab[] = [
    {
      name: '会社理念',
      onClick: () =>
        queryRefresh({
          type: WikiType.RULES,
          rule_category: RuleCategory.PHILOSOPHY,
        }),
      isActive: !rule_category || rule_category === RuleCategory.PHILOSOPHY,
    },
    {
      name: '社内規則',
      onClick: () =>
        queryRefresh({
          type: WikiType.RULES,
          rule_category: RuleCategory.RULES,
        }),
      isActive: rule_category === RuleCategory.RULES,
    },
    {
      name: 'ABC制度',
      onClick: () =>
        queryRefresh({ type: WikiType.RULES, rule_category: RuleCategory.ABC }),
      isActive: rule_category === RuleCategory.ABC,
    },
    {
      name: '福利厚生等',
      onClick: () =>
        queryRefresh({
          type: WikiType.RULES,
          rule_category: RuleCategory.BENEFITS,
        }),
      isActive: rule_category === RuleCategory.BENEFITS,
    },
    {
      name: '各種申請書',
      onClick: () =>
        queryRefresh({
          type: WikiType.RULES,
          rule_category: RuleCategory.DOCUMENT,
        }),
      isActive: rule_category === RuleCategory.DOCUMENT,
    },
  ];

  const onToggleTag = (t: Tag) => {
    setSelectedTags((s) => toggleTag(s, t));
  };

  const queryRefresh = (query: Partial<SearchQueryToGetWiki>) => {
    const selectedTagIDs = selectedTags.map((t) => t.id.toString());
    const tagQuery = selectedTagIDs.join('+');
    const refreshedQueryStrings = wikiQueryRefresh({
      ...router.query,
      ...query,
      tag: tagQuery,
    });
    router.push(`/wiki/list?${refreshedQueryStrings}`);
  };

  const tabs: Tab[] = useHeaderTab({
    headerTabType: 'wikiList',
    queryRefresh,
    onCreateClicked: () => router.push('/wiki/new'),
  });

  const initialHeaderValue = {
    title: '社内Wiki',
    activeTabName:
      type === WikiType.RULES
        ? '社内規則'
        : type === WikiType.BOARD
        ? '掲示板'
        : type === WikiType.ALL_POSTAL
        ? 'オール便'
        : 'All',
    tabs,
  };

  useEffect(() => {
    if (tags) {
      const tagParam = tag;
      const tagsInQueryParams = tagParam.split(' ');
      const searchedTags =
        tags.filter((t) => tagsInQueryParams.includes(t.id.toString())) || [];
      setSelectedTags(searchedTags);
    }
  }, [tag, tags]);

  const isQA = type === WikiType.BOARD && board_category === BoardCategory.QA;

  return (
    <LayoutWithTab
      sidebar={{ activeScreenName: SidebarScreenName.QA }}
      header={initialHeaderValue}>
      <Head>
        <title>ボールド | Wiki</title>
      </Head>
      {/* <Box w="100%" mb="24px">
        <TopTabBar topTabBehaviorList={topTab} />
      </Box> */}
      {type === WikiType.RULES && <TabList tabs={rulesTab} />}
      {type === WikiType.BOARD && <TabList tabs={boardTabs} />}
      <div className={qaListStyles.top_contents_wrapper}>
        <div className={qaListStyles.search_form_wrapper}>
          <SearchForm
            onClear={() => setSelectedTags([])}
            value={searchWord}
            onChange={(e) => setSearchWord(e.currentTarget.value)}
            onClickButton={() =>
              queryRefresh({
                page: '1',
                tag,
                status,
                word: searchWord,
                type,
              })
            }
            tags={tags || []}
            selectedTags={selectedTags}
            toggleTag={onToggleTag}
          />
        </div>
        {!isLoading && !questions?.wiki.length && (
          <Text alignItems="center" textAlign="center" mb={4}>
            検索結果が見つかりませんでした
          </Text>
        )}
        <div className={qaListStyles.qa_list}>
          {isQA ? (
            <RadioGroup
              bg="white"
              p="3"
              rounded="md"
              mb="8px"
              alignSelf="flex-end"
              defaultValue={status}
              onChange={(value) =>
                queryRefresh({ status: value as 'new' | 'resolved' })
              }>
              <Stack direction="row">
                <Radio value="new" checked={status === 'new'} cursor="pointer">
                  新着
                </Radio>
                <Radio
                  value="resolved"
                  checked={status === 'resolved'}
                  cursor="pointer">
                  解決済み
                </Radio>
              </Stack>
            </RadioGroup>
          ) : null}
          {questions?.wiki.map((q) => (
            <WikiCard key={q.id} wiki={q} type={type} />
          ))}
        </div>
      </div>
      <div className={paginationStyles.pagination_wrap_layout}>
        {typeof window !== 'undefined' && questions && questions.pageCount ? (
          <ReactPaginate
            pageCount={questions.pageCount}
            onPageChange={({ selected }) => {
              queryRefresh({ page: (selected + 1).toString() });
            }}
            initialPage={page ? Number(page) - 1 : 0}
            disableInitialCallback={true}
            previousLabel={'前へ'}
            nextLabel={'次へ'}
            marginPagesDisplayed={2}
            pageRangeDisplayed={5}
            containerClassName={paginationStyles.pagination}
            activeClassName={paginationStyles.active}
            disabledClassName={paginationStyles.button__disabled}
          />
        ) : null}
      </div>
    </LayoutWithTab>
  );
};

export default QAQuestionList;

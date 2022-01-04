import { SidebarScreenName } from '@/components/layout/Sidebar';
import { Tab } from 'src/types/header/tab/types';
import { useRouter } from 'next/router';
import WikiCard from '@/components/common/WikiCard';
import dynamic from 'next/dynamic';
const ReactPaginate = dynamic(() => import('react-paginate'), { ssr: false });
import paginationStyles from '@/styles/components/Pagination.module.scss';
import qaListStyles from '@/styles/layouts/QAList.module.scss';
import { useEffect, useMemo, useState } from 'react';
import LayoutWithTab from '@/components/layout/LayoutWithTab';
import SearchForm from '@/components/common/SearchForm';
import { useAPIGetTag } from '@/hooks/api/tag/useAPIGetTag';
import { toggleTag } from 'src/utils/toggleTag';
import {
  BoardCategory,
  RuleCategory,
  Tag,
  UserRole,
  WikiType,
} from 'src/types';
import { wikiQueryRefresh } from 'src/utils/wikiQueryRefresh';
import Head from 'next/head';
import {
  SearchQueryToGetWiki,
  useAPIGetWikiList,
} from '@/hooks/api/wiki/useAPIGetWikiList';
import { useAuthenticate } from 'src/contexts/useAuthenticate';
import { useHeaderTab } from '@/hooks/headerTab/useHeaderTab';
import TopTabBar, { TopTabBehavior } from '@/components/layout/TopTabBar';
import topTabBarStyles from '@/styles/components/TopTabBar.module.scss';
import { Text } from '@chakra-ui/react';
import { wikiTypeNameFactory } from 'src/utils/wiki/wikiTypeNameFactory';

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
  const { user } = useAuthenticate();
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
  const boardTopTab: TopTabBehavior[] = [
    {
      tabName: '全て',
      onClick: () =>
        queryRefresh({
          type: WikiType.BOARD,
          board_category: undefined,
        }),
      isActiveTab: type === WikiType.BOARD && !board_category,
    },
    {
      tabName: wikiTypeNameFactory(
        WikiType.BOARD,
        undefined,
        true,
        BoardCategory.KNOWLEDGE,
      ),
      onClick: () =>
        queryRefresh({
          type: WikiType.BOARD,
          board_category: BoardCategory.KNOWLEDGE,
        }),
      isActiveTab:
        type === WikiType.BOARD && board_category === BoardCategory.KNOWLEDGE,
    },
    {
      tabName: wikiTypeNameFactory(
        WikiType.BOARD,
        undefined,
        true,
        BoardCategory.QA,
      ),
      onClick: () =>
        queryRefresh({
          type: WikiType.BOARD,
          board_category: BoardCategory.QA,
        }),
      isActiveTab:
        type === WikiType.BOARD && board_category === BoardCategory.QA,
    },
    {
      tabName: wikiTypeNameFactory(
        WikiType.BOARD,
        undefined,
        true,
        BoardCategory.NEWS,
      ),
      onClick: () =>
        queryRefresh({
          type: WikiType.BOARD,
          board_category: BoardCategory.NEWS,
        }),
      isActiveTab:
        type === WikiType.BOARD && board_category === BoardCategory.NEWS,
    },
    {
      tabName: wikiTypeNameFactory(
        WikiType.BOARD,
        undefined,
        true,
        BoardCategory.IMPRESSIVE_UNIVERSITY,
      ),
      onClick: () =>
        queryRefresh({
          type: WikiType.BOARD,
          board_category: BoardCategory.IMPRESSIVE_UNIVERSITY,
        }),
      isActiveTab:
        type === WikiType.BOARD &&
        board_category === BoardCategory.IMPRESSIVE_UNIVERSITY,
    },
    {
      tabName: wikiTypeNameFactory(
        WikiType.BOARD,
        undefined,
        true,
        BoardCategory.CLUB,
      ),
      onClick: () =>
        queryRefresh({
          type: WikiType.BOARD,
          board_category: BoardCategory.CLUB,
        }),
      isActiveTab:
        type === WikiType.BOARD && board_category === BoardCategory.CLUB,
    },
    {
      tabName: wikiTypeNameFactory(
        WikiType.BOARD,
        undefined,
        true,
        BoardCategory.STUDY_MEETING,
      ),
      onClick: () =>
        queryRefresh({
          type: WikiType.BOARD,
          board_category: BoardCategory.STUDY_MEETING,
        }),
      isActiveTab:
        type === WikiType.BOARD &&
        board_category === BoardCategory.STUDY_MEETING,
    },
    {
      tabName: wikiTypeNameFactory(
        WikiType.BOARD,
        undefined,
        true,
        BoardCategory.CELEBRATION,
      ),
      onClick: () =>
        queryRefresh({
          type: WikiType.BOARD,
          board_category: BoardCategory.CELEBRATION,
        }),
      isActiveTab:
        type === WikiType.BOARD && board_category === BoardCategory.CELEBRATION,
    },
    {
      tabName: wikiTypeNameFactory(
        WikiType.BOARD,
        undefined,
        true,
        BoardCategory.OTHER,
      ),
      onClick: () =>
        queryRefresh({
          type: WikiType.BOARD,
          board_category: BoardCategory.OTHER,
        }),
      isActiveTab:
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
  const rulesTopTab: TopTabBehavior[] = [
    {
      tabName: '会社理念',
      onClick: () =>
        queryRefresh({
          type: WikiType.RULES,
          rule_category: RuleCategory.PHILOSOPHY,
        }),
      isActiveTab: !rule_category || rule_category === RuleCategory.PHILOSOPHY,
    },
    {
      tabName: '社内規則',
      onClick: () =>
        queryRefresh({
          type: WikiType.RULES,
          rule_category: RuleCategory.RULES,
        }),
      isActiveTab: rule_category === RuleCategory.RULES,
    },
    {
      tabName: 'ABC制度',
      onClick: () =>
        queryRefresh({ type: WikiType.RULES, rule_category: RuleCategory.ABC }),
      isActiveTab: rule_category === RuleCategory.ABC,
    },
    {
      tabName: '福利厚生等',
      onClick: () =>
        queryRefresh({
          type: WikiType.RULES,
          rule_category: RuleCategory.BENEFITS,
        }),
      isActiveTab: rule_category === RuleCategory.BENEFITS,
    },
    {
      tabName: '各種申請書',
      onClick: () =>
        queryRefresh({
          type: WikiType.RULES,
          rule_category: RuleCategory.DOCUMENT,
        }),
      isActiveTab: rule_category === RuleCategory.DOCUMENT,
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

  const tabs: Tab[] = useHeaderTab({ headerTabType: 'wikiList', queryRefresh });

  const onClickCreateButton =
    type === WikiType.RULES || type === WikiType.ALL_POSTAL
      ? user?.role === UserRole.ADMIN
        ? () => {
            router.push('/wiki/new?type=' + type || '');
          }
        : undefined
      : () => {
          router.push('/wiki/new?type=' + type || '');
        };

  const headerRightButtonName = useMemo(() => {
    return type
      ? `${wikiTypeNameFactory(
          type,
          rule_category,
          true,
          board_category,
        )}を新規作成`
      : 'Wikiを新規作成';
  }, [board_category, rule_category, type]);

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
    rightButtonName: headerRightButtonName,
    onClickRightButton: onClickCreateButton,
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

  return (
    <LayoutWithTab
      sidebar={{ activeScreenName: SidebarScreenName.QA }}
      header={initialHeaderValue}>
      <Head>
        <title>ボールド | Wiki</title>
      </Head>
      {type === WikiType.RULES && (
        <div className={topTabBarStyles.component_wrapper}>
          <TopTabBar topTabBehaviorList={rulesTopTab} />
        </div>
      )}
      {type === WikiType.BOARD && (
        <div className={topTabBarStyles.component_wrapper}>
          <TopTabBar topTabBehaviorList={boardTopTab} />
        </div>
      )}
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
          {questions?.wiki.map((q) => (
            <WikiCard key={q.id} wiki={q} />
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

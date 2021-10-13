import { ScreenName } from '@/components/layout/Sidebar';
import { Tab } from 'src/types/header/tab/types';
import { useRouter } from 'next/router';
import WikiCard from '@/components/common/WikiCard';
import ReactPaginate from 'react-paginate';
import paginationStyles from '@/styles/components/Pagination.module.scss';
import qaListStyles from '@/styles/layouts/QAList.module.scss';
import { useMemo, useState } from 'react';
import LayoutWithTab from '@/components/layout/LayoutWithTab';
import SearchForm from '@/components/common/SearchForm';
import { useAPIGetTag } from '@/hooks/api/tag/useAPIGetTag';
import { toggleTag } from 'src/utils/toggleTag';
import { RuleCategory, Tag, UserRole, WikiType } from 'src/types';
import { wikiQueryRefresh } from 'src/utils/wikiQueryRefresh';
import Head from 'next/head';
import {
  SearchQueryToGetWiki,
  useAPIGetWikiList,
} from '@/hooks/api/wiki/useAPIGetWikiList';
import { useAuthenticate } from 'src/contexts/useAuthenticate';
import { useHeaderTab } from '@/hooks/headerTab/useHeaderTab';
import TopTabBar, { TopTabBehavior } from '@/components/TopTabBar';
import topTabBarStyles from '@/styles/components/TopTabBar.module.scss';

const QAQuestionList = () => {
  const router = useRouter();
  const {
    page = '',
    tag = '',
    word = '',
    status = 'new',
    type,
    rule_category,
  } = router.query as SearchQueryToGetWiki;
  const { user } = useAuthenticate();
  const { data: questions } = useAPIGetWikiList({
    page,
    tag,
    word,
    status,
    type,
    rule_category,
  });
  const [searchWord, setSearchWord] = useState('');
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const { data: tags } = useAPIGetTag();
  const topTabBehaviorList: TopTabBehavior[] = [
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
      ...query,
      tag: tagQuery,
    });
    router.push(`/wiki/list?${refreshedQueryStrings}`);
  };

  const tabs: Tab[] = useHeaderTab({ headerTabType: 'wikiList', queryRefresh });

  const onClickCreateButton =
    type === WikiType.RULES
      ? user?.role === UserRole.ADMIN
        ? () => {
            router.push('/wiki/new?type=' + type || '');
          }
        : undefined
      : () => {
          router.push('/wiki/new?type=' + type || '');
        };

  const headerRightButtonName = useMemo(() => {
    switch (type) {
      case WikiType.RULES:
        return '社内規則を新規作成';
      case WikiType.KNOWLEDGE:
        return 'ナレッジを新規作成';
      case WikiType.QA:
        return '質問を新規作成';
      default:
        return '新規作成';
    }
  }, [type]);

  const initialHeaderValue = {
    title: '社内Wiki',
    activeTabName:
      type === WikiType.RULES
        ? '社内規則'
        : type === WikiType.KNOWLEDGE
        ? 'ナレッジ'
        : type === WikiType.QA
        ? 'Q&A'
        : 'All',
    tabs,
    rightButtonName: headerRightButtonName,
    onClickRightButton: onClickCreateButton,
  };

  return (
    <LayoutWithTab
      sidebar={{ activeScreenName: ScreenName.QA }}
      header={initialHeaderValue}>
      <Head>
        <title>ボールド | Wiki</title>
      </Head>
      {type === WikiType.RULES && (
        <div className={topTabBarStyles.component_wrapper}>
          <TopTabBar topTabBehaviorList={topTabBehaviorList} />
        </div>
      )}
      <div className={qaListStyles.top_contents_wrapper}>
        <div className={qaListStyles.search_form_wrapper}>
          <SearchForm
            onCancelTagModal={() => setSelectedTags([])}
            value={searchWord}
            onChange={(e) => setSearchWord(e.currentTarget.value)}
            onClickButton={() =>
              queryRefresh({ page, tag, status, word: searchWord })
            }
            tags={tags || []}
            selectedTags={selectedTags}
            toggleTag={onToggleTag}
          />
        </div>
        <div className={qaListStyles.qa_list}>
          {questions?.wiki.map((q) => (
            <WikiCard key={q.id} wiki={q} />
          ))}
          {!questions?.wiki.length && <p>検索結果が見つかりませんでした</p>}
        </div>
      </div>
      <div className={paginationStyles.pagination_wrap_layout}>
        {questions && questions.pageCount ? (
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

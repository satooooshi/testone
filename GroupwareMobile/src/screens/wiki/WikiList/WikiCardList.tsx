import React, {
  useState,
  useEffect,
  Dispatch,
  SetStateAction,
  useRef,
} from 'react';
import {BoardCategory, RuleCategory, WikiType} from '../../../types';
import {
  SearchQueryToGetWiki,
  useAPIGetWikiList,
} from '../../../hooks/api/wiki/useAPIGetWikiList';
import {Div, Radio, Text} from 'react-native-magnus';
import WikiCard from '../../../components/wiki/WikiCard';
import {FlatList} from 'react-native';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import {useIsFocused, useRoute} from '@react-navigation/native';
import SearchForm from '../../../components/common/SearchForm';
import SearchFormOpenerButton from '../../../components/common/SearchForm/SearchFormOpenerButton';
import {WikiListRouteProps} from '../../../types/navigator/drawerScreenProps';
import {ActivityIndicator} from 'react-native-paper';
import {wikiTypeNameFactory} from '../../../utils/factory/wiki/wikiTypeNameFactory';
import tailwind from 'tailwind-rn';

const TopTab = createMaterialTopTabNavigator();

type WikiCardListProps = {
  type?: WikiType;
  setType: Dispatch<SetStateAction<WikiType | undefined>>;
  setRuleCategory: Dispatch<SetStateAction<RuleCategory>>;
  setBoardCategory: Dispatch<SetStateAction<BoardCategory>>;
};

type RenderWikiCardListProps = {
  word: string;
  tag: string;
  ruleCategory?: RuleCategory;
  boardCategory?: BoardCategory;
  setRuleCategory: Dispatch<SetStateAction<RuleCategory>>;
  setBoardCategory: Dispatch<SetStateAction<BoardCategory>>;
  type?: WikiType;
};

const RenderWikiCardList: React.FC<RenderWikiCardListProps> = ({
  word,
  tag,
  ruleCategory,
  setRuleCategory,
  boardCategory,
  setBoardCategory,
  type,
}) => {
  const [searchQuery, setSearchQuery] = useState<SearchQueryToGetWiki>({
    page: '1',
    word,
    tag,
    rule_category: ruleCategory,
    board_category: boardCategory,
    type,
    status:
      type === WikiType.BOARD && boardCategory === BoardCategory.QA
        ? 'new'
        : undefined,
  });
  const {
    data: fetchedWiki,
    isLoading,
    refetch,
  } = useAPIGetWikiList(searchQuery, {
    enabled: false,
    onSuccess: responseWikis => {
      setWikiForInfiniteScroll(w => {
        if (w.length && searchQuery.page !== '1') {
          return [...w, ...responseWikis.wiki];
        }
        return responseWikis.wiki;
      });
    },
  });
  const [wikiForInfiniteScroll, setWikiForInfiniteScroll] = useState(
    fetchedWiki?.wiki || [],
  );
  const flatListRef = useRef<FlatList | null>(null);
  const isFocused = useIsFocused();

  const onEndReached = () => {
    setSearchQuery(q => ({
      ...q,
      page: q.page ? (Number(q.page) + 1).toString() : '1',
    }));
  };

  useEffect(() => {
    if (isFocused) {
      setRuleCategory(ruleCategory || RuleCategory.NON_RULE);
      setBoardCategory(boardCategory || BoardCategory.NON_BOARD);
      setWikiForInfiniteScroll([]);
      setSearchQuery(q => ({
        ...q,
        type,
        board_category: boardCategory,
        rule_category: ruleCategory,
        page: '1',
      }));
      flatListRef?.current?.scrollToOffset({animated: false, offset: 0});
    }
  }, [
    isFocused,
    refetch,
    tag,
    type,
    word,
    boardCategory,
    ruleCategory,
    setBoardCategory,
    setRuleCategory,
  ]);

  useEffect(() => {
    if (isFocused) {
      refetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  // useEffect(() => {
  //   if (!isFetching && fetchedWiki?.wiki && fetchedWiki?.wiki.length) {
  //     setWikiForInfiniteScroll(w => {
  //       if (
  //         w.length &&
  //         fetchedWiki.wiki[0].id !== w[0].id &&
  //         searchQuery.page !== '1'
  //       ) {
  //         return [...w, ...fetchedWiki.wiki];
  //       }
  //       return fetchedWiki.wiki;
  //     });
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [fetchedWiki?.wiki]);

  const isQA = type === WikiType.BOARD && boardCategory === BoardCategory.QA;

  return (
    <>
      <Div>
        {isQA ? (
          <Div flexDir="row" justifyContent="flex-end" my="sm" mr="sm">
            {/* @ts-ignore */}
            <Radio
              mr="sm"
              activeColor="green500"
              checked={searchQuery.status === 'new'}
              value="new"
              suffix={<Text>新着</Text>}
              onChange={() => setSearchQuery(q => ({...q, status: 'new'}))}
            />
            {/* @ts-ignore */}
            <Radio
              activeColor="green500"
              checked={searchQuery.status === 'resolved'}
              value="resolved"
              suffix={<Text>解決済み</Text>}
              onChange={() => setSearchQuery(q => ({...q, status: 'resolved'}))}
            />
          </Div>
        ) : null}
        {wikiForInfiniteScroll.length ? (
          <Div h={isQA ? '90%' : '100%'}>
            <FlatList
              ref={flatListRef}
              contentContainerStyle={tailwind('pb-8')}
              onEndReached={onEndReached}
              onEndReachedThreshold={0.5}
              data={wikiForInfiniteScroll || []}
              keyExtractor={item => item.id.toString()}
              renderItem={({item}) => <WikiCard wiki={item} />}
            />
          </Div>
        ) : !wikiForInfiniteScroll.length ? (
          <Text fontSize={16} textAlign="center">
            検索結果が見つかりませんでした
          </Text>
        ) : null}
        {isLoading && <ActivityIndicator />}
      </Div>
    </>
  );
};

const WikiCardList: React.FC<WikiCardListProps> = ({
  type,
  setType,
  setRuleCategory,
  setBoardCategory,
}) => {
  const routeParams = useRoute<WikiListRouteProps>().params;
  const [visibleSearchFormModal, setVisibleSearchFormModal] = useState(false);
  const [word, setWord] = useState('');
  const [tag, setTag] = useState('');

  useEffect(() => {
    if (routeParams?.tag) {
      setTag(routeParams?.tag);
    }
  }, [routeParams?.tag]);

  return (
    <>
      <SearchForm
        searchTarget="other"
        isVisible={visibleSearchFormModal}
        onCloseModal={() => setVisibleSearchFormModal(false)}
        onSubmit={values => {
          setVisibleSearchFormModal(false);
          setType(undefined);
          setWord(values.word);
          const selectedTagIDs = values.selectedTags.map(t => t.id.toString());
          const tagQuery = selectedTagIDs.join('+');
          setTag(tagQuery);
        }}
        defaultSelectedTagIds={tag.split('+')?.map(t => Number(t))}
      />
      <SearchFormOpenerButton onPress={() => setVisibleSearchFormModal(true)} />
      <Div flexDir="column" h="100%" pb={80}>
        {type === WikiType.RULES ? (
          <TopTab.Navigator
            screenOptions={{
              tabBarScrollEnabled: true,
            }}>
            <TopTab.Screen
              name={'WikiList-' + RuleCategory.RULES}
              children={() => (
                <RenderWikiCardList
                  setRuleCategory={setRuleCategory}
                  setBoardCategory={setBoardCategory}
                  ruleCategory={RuleCategory.RULES}
                  word={word}
                  tag={tag}
                  type={type}
                />
              )}
              options={{title: '社内規則'}}
            />
            <TopTab.Screen
              name={'WikiList-' + RuleCategory.PHILOSOPHY}
              children={() => (
                <RenderWikiCardList
                  setRuleCategory={setRuleCategory}
                  setBoardCategory={setBoardCategory}
                  ruleCategory={RuleCategory.PHILOSOPHY}
                  word={word}
                  tag={tag}
                  type={type}
                />
              )}
              options={{title: '会社理念'}}
            />
            <TopTab.Screen
              name={'WikiList-' + RuleCategory.ABC}
              children={() => (
                <RenderWikiCardList
                  setRuleCategory={setRuleCategory}
                  setBoardCategory={setBoardCategory}
                  ruleCategory={RuleCategory.ABC}
                  word={word}
                  tag={tag}
                  type={type}
                />
              )}
              options={{title: 'ABC制度'}}
            />
            <TopTab.Screen
              name={'WikiList-' + RuleCategory.BENEFITS}
              children={() => (
                <RenderWikiCardList
                  setRuleCategory={setRuleCategory}
                  setBoardCategory={setBoardCategory}
                  ruleCategory={RuleCategory.BENEFITS}
                  word={word}
                  tag={tag}
                  type={type}
                />
              )}
              options={{title: '福利厚生等'}}
            />
            <TopTab.Screen
              name={'WikiList-' + RuleCategory.DOCUMENT}
              children={() => (
                <RenderWikiCardList
                  setRuleCategory={setRuleCategory}
                  setBoardCategory={setBoardCategory}
                  ruleCategory={RuleCategory.DOCUMENT}
                  word={word}
                  tag={tag}
                  type={type}
                />
              )}
              options={{title: '各種申請書'}}
            />
          </TopTab.Navigator>
        ) : type === WikiType.BOARD ? (
          <TopTab.Navigator
            screenOptions={{
              tabBarScrollEnabled: true,
            }}>
            <TopTab.Screen
              name={'WikiList-board'}
              children={() => (
                <RenderWikiCardList
                  setRuleCategory={setRuleCategory}
                  setBoardCategory={setBoardCategory}
                  ruleCategory={undefined}
                  word={word}
                  tag={tag}
                  type={type}
                />
              )}
              options={{title: '全て'}}
            />
            <TopTab.Screen
              name={'WikiList-' + BoardCategory.KNOWLEDGE}
              children={() => (
                <RenderWikiCardList
                  setRuleCategory={setRuleCategory}
                  setBoardCategory={setBoardCategory}
                  ruleCategory={undefined}
                  boardCategory={BoardCategory.KNOWLEDGE}
                  word={word}
                  tag={tag}
                  type={type}
                />
              )}
              options={{
                title: wikiTypeNameFactory(
                  WikiType.BOARD,
                  undefined,
                  true,
                  BoardCategory.KNOWLEDGE,
                ),
              }}
            />
            <TopTab.Screen
              name={'WikiList-' + BoardCategory.QA}
              children={() => (
                <RenderWikiCardList
                  setRuleCategory={setRuleCategory}
                  setBoardCategory={setBoardCategory}
                  ruleCategory={undefined}
                  boardCategory={BoardCategory.QA}
                  word={word}
                  tag={tag}
                  type={type}
                />
              )}
              options={{
                title: wikiTypeNameFactory(
                  WikiType.BOARD,
                  undefined,
                  true,
                  BoardCategory.QA,
                ),
              }}
            />
            <TopTab.Screen
              name={'WikiList-' + BoardCategory.NEWS}
              children={() => (
                <RenderWikiCardList
                  setRuleCategory={setRuleCategory}
                  setBoardCategory={setBoardCategory}
                  ruleCategory={undefined}
                  boardCategory={BoardCategory.NEWS}
                  word={word}
                  tag={tag}
                  type={type}
                />
              )}
              options={{
                title: wikiTypeNameFactory(
                  WikiType.BOARD,
                  undefined,
                  true,
                  BoardCategory.NEWS,
                ),
              }}
            />
            <TopTab.Screen
              name={'WikiList-' + BoardCategory.IMPRESSIVE_UNIVERSITY}
              children={() => (
                <RenderWikiCardList
                  setRuleCategory={setRuleCategory}
                  setBoardCategory={setBoardCategory}
                  ruleCategory={undefined}
                  boardCategory={BoardCategory.IMPRESSIVE_UNIVERSITY}
                  word={word}
                  tag={tag}
                  type={type}
                />
              )}
              options={{
                title: wikiTypeNameFactory(
                  WikiType.BOARD,
                  undefined,
                  true,
                  BoardCategory.IMPRESSIVE_UNIVERSITY,
                ),
              }}
            />
            <TopTab.Screen
              name={'WikiList-' + BoardCategory.CLUB}
              children={() => (
                <RenderWikiCardList
                  setRuleCategory={setRuleCategory}
                  setBoardCategory={setBoardCategory}
                  ruleCategory={undefined}
                  boardCategory={BoardCategory.CLUB}
                  word={word}
                  tag={tag}
                  type={type}
                />
              )}
              options={{
                title: wikiTypeNameFactory(
                  WikiType.BOARD,
                  undefined,
                  true,
                  BoardCategory.CLUB,
                ),
              }}
            />
            <TopTab.Screen
              name={'WikiList-' + BoardCategory.STUDY_MEETING}
              children={() => (
                <RenderWikiCardList
                  setRuleCategory={setRuleCategory}
                  setBoardCategory={setBoardCategory}
                  ruleCategory={undefined}
                  boardCategory={BoardCategory.STUDY_MEETING}
                  word={word}
                  tag={tag}
                  type={type}
                />
              )}
              options={{
                title: wikiTypeNameFactory(
                  WikiType.BOARD,
                  undefined,
                  true,
                  BoardCategory.STUDY_MEETING,
                ),
              }}
            />
            <TopTab.Screen
              name={'WikiList-' + BoardCategory.SELF_IMPROVEMENT}
              children={() => (
                <RenderWikiCardList
                  setRuleCategory={setRuleCategory}
                  setBoardCategory={setBoardCategory}
                  ruleCategory={undefined}
                  boardCategory={BoardCategory.SELF_IMPROVEMENT}
                  word={word}
                  tag={tag}
                  type={type}
                />
              )}
              options={{
                title: wikiTypeNameFactory(
                  WikiType.BOARD,
                  undefined,
                  true,
                  BoardCategory.SELF_IMPROVEMENT,
                ),
              }}
            />
            <TopTab.Screen
              name={'WikiList-' + BoardCategory.PERSONAL_ANNOUNCEMENT}
              children={() => (
                <RenderWikiCardList
                  setRuleCategory={setRuleCategory}
                  setBoardCategory={setBoardCategory}
                  ruleCategory={undefined}
                  boardCategory={BoardCategory.PERSONAL_ANNOUNCEMENT}
                  word={word}
                  tag={tag}
                  type={type}
                />
              )}
              options={{
                title: wikiTypeNameFactory(
                  WikiType.BOARD,
                  undefined,
                  true,
                  BoardCategory.PERSONAL_ANNOUNCEMENT,
                ),
              }}
            />
            <TopTab.Screen
              name={'WikiList-' + BoardCategory.CELEBRATION}
              children={() => (
                <RenderWikiCardList
                  setRuleCategory={setRuleCategory}
                  setBoardCategory={setBoardCategory}
                  ruleCategory={undefined}
                  boardCategory={BoardCategory.CELEBRATION}
                  word={word}
                  tag={tag}
                  type={type}
                />
              )}
              options={{
                title: wikiTypeNameFactory(
                  WikiType.BOARD,
                  undefined,
                  true,
                  BoardCategory.CELEBRATION,
                ),
              }}
            />
            <TopTab.Screen
              name={'WikiList-' + BoardCategory.OTHER}
              children={() => (
                <RenderWikiCardList
                  setRuleCategory={setRuleCategory}
                  setBoardCategory={setBoardCategory}
                  ruleCategory={undefined}
                  boardCategory={BoardCategory.OTHER}
                  word={word}
                  tag={tag}
                  type={type}
                />
              )}
              options={{
                title: wikiTypeNameFactory(
                  WikiType.BOARD,
                  undefined,
                  true,
                  BoardCategory.OTHER,
                ),
              }}
            />
          </TopTab.Navigator>
        ) : (
          <RenderWikiCardList
            setRuleCategory={setRuleCategory}
            setBoardCategory={setBoardCategory}
            ruleCategory={undefined}
            word={word}
            tag={tag}
            type={type}
          />
        )}
      </Div>
    </>
  );
};

export default WikiCardList;

import React, {
  useState,
  useEffect,
  Dispatch,
  SetStateAction,
  useCallback,
} from 'react';
import {RuleCategory, WikiType} from '../../../types';
import {
  SearchQueryToGetWiki,
  useAPIGetWikiList,
} from '../../../hooks/api/wiki/useAPIGetWikiList';
import {Div, Text} from 'react-native-magnus';
import WikiCard from '../../../components/wiki/WikiCard';
import {FlatList} from 'react-native';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import {useFocusEffect, useIsFocused, useRoute} from '@react-navigation/native';
import SearchForm from '../../../components/common/SearchForm';
import SearchFormOpenerButton from '../../../components/common/SearchForm/SearchFormOpenerButton';
import {WikiListRouteProps} from '../../../types/navigator/drawerScreenProps';
import {ActivityIndicator} from 'react-native-paper';

const TopTab = createMaterialTopTabNavigator();

type WikiCardListProps = {
  type?: WikiType;
  setType: Dispatch<SetStateAction<WikiType | undefined>>;
  setRuleCategory: Dispatch<SetStateAction<RuleCategory>>;
};

type RenderWikiCardListProps = {
  word: string;
  tag: string;
  ruleCategory?: RuleCategory;
  setRuleCategory: Dispatch<SetStateAction<RuleCategory>>;
  status?: 'new' | 'resolved';
  type?: WikiType;
  focused: boolean;
};

const RenderWikiCardList: React.FC<RenderWikiCardListProps> = ({
  word,
  tag,
  ruleCategory,
  setRuleCategory,
  type,
  status,
  focused,
}) => {
  const [searchQuery, setSearchQuery] = useState<SearchQueryToGetWiki>({
    page: '1',
    word,
    tag,
    rule_category: ruleCategory,
    type,
    status,
  });
  const {
    data: fetchedWiki,
    isLoading,
    isFetching,
    refetch,
  } = useAPIGetWikiList(searchQuery);
  const [wikiForInfiniteScroll, setWikiForInfiniteScroll] = useState(
    fetchedWiki?.wiki || [],
  );

  const onEndReached = () => {
    setSearchQuery(q => ({
      ...q,
      page: q.page ? (Number(q.page) + 1).toString() : '1',
    }));
  };

  useFocusEffect(
    useCallback(() => {
      setRuleCategory(ruleCategory || RuleCategory.OTHERS);
    }, [ruleCategory, setRuleCategory]),
  );

  useEffect(() => {
    if (focused) {
      setWikiForInfiniteScroll([]);
      setSearchQuery(q => ({...q, page: '1', type, word, tag}));
      refetch();
    }
  }, [focused, refetch, tag, type, word]);

  useEffect(() => {
    if (!isFetching && fetchedWiki?.wiki && fetchedWiki?.wiki.length) {
      setWikiForInfiniteScroll(w => {
        if (w.length && fetchedWiki.wiki[0].id !== w[0].id) {
          return [...w, ...fetchedWiki.wiki];
        }
        return fetchedWiki.wiki;
      });
    }
  }, [fetchedWiki?.wiki, isFetching]);

  return (
    <>
      <Div>
        {wikiForInfiniteScroll.length ? (
          <FlatList
            onEndReached={onEndReached}
            onEndReachedThreshold={0.5}
            data={wikiForInfiniteScroll || []}
            keyExtractor={item => item.id.toString()}
            renderItem={({item}) => <WikiCard wiki={item} />}
          />
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


const WikiCardList: React.FC<WikiCardListProps> = ({type, setType, setRuleCategory}) => {
  const routeParams = useRoute<WikiListRouteProps>().params;
  const [visibleSearchFormModal, setVisibleSearchFormModal] = useState(false);
  const [word, setWord] = useState('');
  const [tag, setTag] = useState('');
  const isFocused = useIsFocused();

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
                  focused={isFocused}
                  setRuleCategory={setRuleCategory}
                  ruleCategory={RuleCategory.RULES}
                  status={undefined}
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
                  focused={isFocused}
                  setRuleCategory={setRuleCategory}
                  ruleCategory={RuleCategory.PHILOSOPHY}
                  status={undefined}
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
                  focused={isFocused}
                  setRuleCategory={setRuleCategory}
                  ruleCategory={RuleCategory.ABC}
                  status={undefined}
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
                  focused={isFocused}
                  setRuleCategory={setRuleCategory}
                  ruleCategory={RuleCategory.BENEFITS}
                  status={undefined}
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
                  focused={isFocused}
                  setRuleCategory={setRuleCategory}
                  ruleCategory={RuleCategory.DOCUMENT}
                  status={undefined}
                  word={word}
                  tag={tag}
                  type={type}
                />
              )}
              options={{title: '各種申請書'}}
            />
          </TopTab.Navigator>
        ) : type === WikiType.QA ? (
          <TopTab.Navigator>
            <TopTab.Screen
              name={'WikiList-' + WikiType.QA + '-new'}
              children={() => (
                <RenderWikiCardList
                  focused={isFocused}
                  setRuleCategory={setRuleCategory}
                  ruleCategory={undefined}
                  status={'new'}
                  word={word}
                  tag={tag}
                  type={type}
                />
              )}
              options={{title: '新着'}}
            />
            <TopTab.Screen
              name={'WikiList-' + WikiType.QA + '-resolved'}
              children={() => (
                <RenderWikiCardList
                  focused={isFocused}
                  setRuleCategory={setRuleCategory}
                  ruleCategory={undefined}
                  status={'resolved'}
                  word={word}
                  tag={tag}
                  type={type}
                />
              )}
              options={{title: '解決済み'}}
            />
          </TopTab.Navigator>
        ) : (
          <RenderWikiCardList
            focused={isFocused}
            setRuleCategory={setRuleCategory}
            ruleCategory={undefined}
            status={undefined}
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

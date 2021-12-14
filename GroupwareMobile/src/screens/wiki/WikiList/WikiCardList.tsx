import React, {useState, useEffect, Dispatch, SetStateAction} from 'react';
import {AllTag, RuleCategory, Wiki, WikiType} from '../../../types';
import {
  SearchQueryToGetWiki,
  useAPIGetWikiList,
} from '../../../hooks/api/wiki/useAPIGetWikiList';
import {Div, Text} from 'react-native-magnus';
import WikiCard from '../../../components/wiki/WikiCard';
import {FlatList} from 'react-native';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import {useNavigation} from '@react-navigation/native';
import {useIsFocused} from '@react-navigation/native';
import SearchForm from '../../../components/common/SearchForm';
import {useAPIGetTag} from '../../../hooks/api/tag/useAPIGetTag';
import SearchFormOpenerButton from '../../../components/common/SearchForm/SearchFormOpenerButton';
import {WikiListNavigationProps} from '../../../types/navigator/drawerScreenProps';
import {ActivityIndicator} from 'react-native-paper';

const TopTab = createMaterialTopTabNavigator();

type WikiCardListProps = {
  type?: WikiType;
  setRuleCategory: Dispatch<SetStateAction<RuleCategory>>;
};

type RenderWikiCardListProps = {
  wiki: Wiki[];
  ruleCategory?: RuleCategory;
  status?: 'new' | 'resolved';
  searchQuery: SearchQueryToGetWiki;
  setSearchQuery: Dispatch<SetStateAction<SearchQueryToGetWiki>>;
  isLoading: boolean;
  setRuleCategory: Dispatch<SetStateAction<RuleCategory>>;
};

const RenderWikiCardList: React.FC<RenderWikiCardListProps> = ({
  wiki,
  ruleCategory,
  status,
  setSearchQuery,
  isLoading,
  setRuleCategory,
}) => {
  const navigation: WikiListNavigationProps =
    useNavigation<WikiListNavigationProps>();
  const isFocused = useIsFocused();

  const onEndReached = () => {
    setSearchQuery(q => ({
      ...q,
      page: q.page ? (Number(q.page) + 1).toString() : '1',
    }));
  };

  useEffect(() => {
    if (isFocused) {
      setSearchQuery(q => ({
        ...q,
        page: '1',
        rule_category: ruleCategory,
        status: status,
      }));
      ruleCategory && setRuleCategory(ruleCategory);
    }
  }, [isFocused, ruleCategory, setRuleCategory, setSearchQuery, status, wiki]);

  return (
    <Div>
      {wiki.length ? (
        <FlatList
          onEndReached={onEndReached}
          data={wiki || []}
          keyExtractor={item => item.id.toString()}
          renderItem={({item}) => (
            <WikiCard
              onPress={w =>
                navigation.navigate('WikiStack', {
                  screen: 'WikiDetail',
                  params: {id: w.id},
                })
              }
              wiki={item}
            />
          )}
        />
      ) : !wiki.length ? (
        <Text fontSize={16} textAlign="center">
          検索結果が見つかりませんでした
        </Text>
      ) : null}
      {isLoading && <ActivityIndicator />}
    </Div>
  );
};

const WikiCardList: React.FC<WikiCardListProps> = ({type, setRuleCategory}) => {
  const [searchQuery, setSearchQuery] = useState<SearchQueryToGetWiki>({
    page: '1',
    type,
  });
  const {data: fetchedWiki, isLoading: isLoadingWiki} =
    useAPIGetWikiList(searchQuery);
  const [wikiForInfiniteScroll, setWikiForInfiniteScroll] = useState(
    fetchedWiki?.wiki || [],
  );
  const [visibleSearchFormModal, setVisibleSearchFormModal] = useState(false);
  const {data: tags} = useAPIGetTag();

  const queryRefresh = (
    query: Partial<SearchQueryToGetWiki>,
    selectedTags: AllTag[],
  ) => {
    const selectedTagIDs = selectedTags.map(t => t.id.toString());
    const tagQuery = selectedTagIDs.join('+');

    setSearchQuery({...query, tag: tagQuery});
  };

  useEffect(() => {
    setSearchQuery(q => ({...q, page: '1', type}));
  }, [type]);

  useEffect(() => {
    if (fetchedWiki?.wiki && fetchedWiki?.wiki.length) {
      setWikiForInfiniteScroll(w => {
        if (w.length) {
          return [...w, ...fetchedWiki.wiki];
        }
        return fetchedWiki.wiki;
      });
    }
  }, [fetchedWiki?.wiki]);

  useEffect(() => {
    setWikiForInfiniteScroll([]);
  }, [
    searchQuery.word,
    searchQuery.status,
    searchQuery.type,
    searchQuery.tag,
    searchQuery.rule_category,
  ]);

  return (
    <Div flexDir="column" h="100%" pb={80}>
      <SearchForm
        isVisible={visibleSearchFormModal}
        onCloseModal={() => setVisibleSearchFormModal(false)}
        tags={tags || []}
        onSubmit={values => {
          setVisibleSearchFormModal(false);
          queryRefresh({word: values.word}, values.selectedTags);
        }}
      />
      <SearchFormOpenerButton onPress={() => setVisibleSearchFormModal(true)} />
      {type === WikiType.RULES ? (
        <TopTab.Navigator
          screenOptions={{
            tabBarScrollEnabled: true,
          }}>
          <TopTab.Screen
            name={'WikiList-' + RuleCategory.RULES}
            children={() => (
              <RenderWikiCardList
                isLoading={isLoadingWiki}
                wiki={wikiForInfiniteScroll}
                ruleCategory={RuleCategory.RULES}
                status={undefined}
                setSearchQuery={setSearchQuery}
                searchQuery={searchQuery}
                setRuleCategory={setRuleCategory}
              />
            )}
            options={{title: '社内規則'}}
          />
          <TopTab.Screen
            name={'WikiList-' + RuleCategory.PHILOSOPHY}
            children={() => (
              <RenderWikiCardList
                isLoading={isLoadingWiki}
                wiki={wikiForInfiniteScroll}
                ruleCategory={RuleCategory.PHILOSOPHY}
                status={undefined}
                setSearchQuery={setSearchQuery}
                searchQuery={searchQuery}
                setRuleCategory={setRuleCategory}
              />
            )}
            options={{title: '会社理念'}}
          />
          <TopTab.Screen
            name={'WikiList-' + RuleCategory.ABC}
            children={() => (
              <RenderWikiCardList
                isLoading={isLoadingWiki}
                wiki={wikiForInfiniteScroll}
                ruleCategory={RuleCategory.ABC}
                status={undefined}
                setSearchQuery={setSearchQuery}
                searchQuery={searchQuery}
                setRuleCategory={setRuleCategory}
              />
            )}
            options={{title: 'ABC制度'}}
          />
          <TopTab.Screen
            name={'WikiList-' + RuleCategory.BENEFITS}
            children={() => (
              <RenderWikiCardList
                isLoading={isLoadingWiki}
                wiki={wikiForInfiniteScroll}
                ruleCategory={RuleCategory.BENEFITS}
                status={undefined}
                setSearchQuery={setSearchQuery}
                searchQuery={searchQuery}
                setRuleCategory={setRuleCategory}
              />
            )}
            options={{title: '福利厚生等'}}
          />
          <TopTab.Screen
            name={'WikiList-' + RuleCategory.DOCUMENT}
            children={() => (
              <RenderWikiCardList
                isLoading={isLoadingWiki}
                wiki={wikiForInfiniteScroll}
                ruleCategory={RuleCategory.DOCUMENT}
                status={undefined}
                setSearchQuery={setSearchQuery}
                searchQuery={searchQuery}
                setRuleCategory={setRuleCategory}
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
                isLoading={isLoadingWiki}
                wiki={wikiForInfiniteScroll}
                ruleCategory={undefined}
                status={'new'}
                setSearchQuery={setSearchQuery}
                searchQuery={searchQuery}
                setRuleCategory={setRuleCategory}
              />
            )}
            options={{title: '新着'}}
          />
          <TopTab.Screen
            name={'WikiList-' + WikiType.QA + '-resolved'}
            children={() => (
              <RenderWikiCardList
                isLoading={isLoadingWiki}
                wiki={wikiForInfiniteScroll}
                ruleCategory={undefined}
                status={'resolved'}
                setSearchQuery={setSearchQuery}
                searchQuery={searchQuery}
                setRuleCategory={setRuleCategory}
              />
            )}
            options={{title: '解決済み'}}
          />
        </TopTab.Navigator>
      ) : (
        <RenderWikiCardList
          isLoading={isLoadingWiki}
          wiki={wikiForInfiniteScroll}
          ruleCategory={undefined}
          status={undefined}
          setSearchQuery={setSearchQuery}
          searchQuery={searchQuery}
          setRuleCategory={setRuleCategory}
        />
      )}
    </Div>
  );
};

export default WikiCardList;

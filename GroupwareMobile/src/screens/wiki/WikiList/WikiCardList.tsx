import React, {useState, useEffect, Dispatch, SetStateAction} from 'react';
import {AllTag, RuleCategory, Wiki, WikiType} from '../../../types';
import {
  SearchQueryToGetWiki,
  useAPIGetWikiList,
} from '../../../hooks/api/wiki/useAPIGetWikiList';
import {Div, Overlay, Text} from 'react-native-magnus';
import WikiCard from '../../../components/wiki/WikiCard';
import {ActivityIndicator, FlatList} from 'react-native';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import {useNavigation} from '@react-navigation/native';
import {useIsFocused} from '@react-navigation/native';
import SearchForm from '../../../components/common/SearchForm';
import {useAPIGetTag} from '../../../hooks/api/tag/useAPIGetTag';
import SearchFormOpenerButton from '../../../components/common/SearchForm/SearchFormOpenerButton';
import {WikiListNavigationProps} from '../../../types/navigator/drawerScreenProps';

const TopTab = createMaterialTopTabNavigator();

type WikiCardListProps = {
  type?: WikiType;
};

type RenderWikiCardListProps = {
  wiki: Wiki[];
  ruleCategory?: RuleCategory;
  status?: 'new' | 'resolved';
  searchQuery: SearchQueryToGetWiki;
  setSearchQuery: Dispatch<SetStateAction<SearchQueryToGetWiki>>;
};

const RenderWikiCardList: React.FC<RenderWikiCardListProps> = ({
  wiki,
  ruleCategory,
  status,
  setSearchQuery,
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
    }
  }, [isFocused, ruleCategory, setSearchQuery, status, wiki]);

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
    </Div>
  );
};

const WikiCardList: React.FC<WikiCardListProps> = ({type}) => {
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
  const [customLoading, setCustomLoading] = useState(false);

  const queryRefresh = (
    query: Partial<SearchQueryToGetWiki>,
    selectedTags: AllTag[],
  ) => {
    const selectedTagIDs = selectedTags.map(t => t.id.toString());
    const tagQuery = selectedTagIDs.join('+');

    setSearchQuery({...query, tag: tagQuery});
  };

  useEffect(() => {
    if (isLoadingWiki) {
      setCustomLoading(true);
    } else {
      setCustomLoading(false);
    }
  }, [isLoadingWiki]);

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
  }, [searchQuery.word, searchQuery.status, searchQuery.type, searchQuery.tag]);

  return (
    <Div flexDir="column" h="100%" pb={80}>
      <Overlay visible={customLoading} p="xl">
        <ActivityIndicator />
      </Overlay>
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
            name={'WikiList-' + RuleCategory.PHILOSOPHY}
            children={() => (
              <RenderWikiCardList
                wiki={wikiForInfiniteScroll}
                ruleCategory={RuleCategory.PHILOSOPHY}
                status={undefined}
                setSearchQuery={setSearchQuery}
                searchQuery={searchQuery}
              />
            )}
            options={{title: '会社理念'}}
          />
          <TopTab.Screen
            name={'WikiList-' + RuleCategory.RULES}
            children={() => (
              <RenderWikiCardList
                wiki={wikiForInfiniteScroll}
                ruleCategory={RuleCategory.RULES}
                status={undefined}
                setSearchQuery={setSearchQuery}
                searchQuery={searchQuery}
              />
            )}
            options={{title: '社内規則'}}
          />
          <TopTab.Screen
            name={'WikiList-' + RuleCategory.ABC}
            children={() => (
              <RenderWikiCardList
                wiki={wikiForInfiniteScroll}
                ruleCategory={RuleCategory.ABC}
                status={undefined}
                setSearchQuery={setSearchQuery}
                searchQuery={searchQuery}
              />
            )}
            options={{title: 'ABC制度'}}
          />
          <TopTab.Screen
            name={'WikiList-' + RuleCategory.BENEFITS}
            children={() => (
              <RenderWikiCardList
                wiki={wikiForInfiniteScroll}
                ruleCategory={RuleCategory.BENEFITS}
                status={undefined}
                setSearchQuery={setSearchQuery}
                searchQuery={searchQuery}
              />
            )}
            options={{title: '福利厚生等'}}
          />
          <TopTab.Screen
            name={'WikiList-' + RuleCategory.DOCUMENT}
            children={() => (
              <RenderWikiCardList
                wiki={wikiForInfiniteScroll}
                ruleCategory={RuleCategory.DOCUMENT}
                status={undefined}
                setSearchQuery={setSearchQuery}
                searchQuery={searchQuery}
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
                wiki={wikiForInfiniteScroll}
                ruleCategory={undefined}
                status={'new'}
                setSearchQuery={setSearchQuery}
                searchQuery={searchQuery}
              />
            )}
            options={{title: '新着'}}
          />
          <TopTab.Screen
            name={'WikiList-' + WikiType.QA + '-resolved'}
            children={() => (
              <RenderWikiCardList
                wiki={wikiForInfiniteScroll}
                ruleCategory={undefined}
                status={'resolved'}
                setSearchQuery={setSearchQuery}
                searchQuery={searchQuery}
              />
            )}
            options={{title: '解決済み'}}
          />
        </TopTab.Navigator>
      ) : (
        <RenderWikiCardList
          wiki={wikiForInfiniteScroll}
          ruleCategory={undefined}
          status={undefined}
          setSearchQuery={setSearchQuery}
          searchQuery={searchQuery}
        />
      )}
    </Div>
  );
};

export default WikiCardList;

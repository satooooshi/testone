import React, {useState, useEffect, Dispatch, SetStateAction} from 'react';
import {RuleCategory, WikiType} from '../../../types';
import {
  SearchQueryToGetWiki,
  useAPIGetWikiList,
} from '../../../hooks/api/wiki/useAPIGetWikiList';
import {Div, Overlay, Text} from 'react-native-magnus';
import WikiCard from '../../../components/wiki/WikiCard';
import {WikiListNavigationProps} from '../../../types/navigator/screenProps/Wiki';
import {ActivityIndicator, FlatList} from 'react-native';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import {useNavigation} from '@react-navigation/native';
import {useIsFocused} from '@react-navigation/native';

const TopTab = createMaterialTopTabNavigator();

type WikiCardListProps = {
  type?: WikiType;
  navigation: WikiListNavigationProps;
};

type RenderWikiCardListProps = {
  type?: WikiType;
  ruleCategory?: RuleCategory;
  status?: 'new' | 'resolved';
  searchQuery: SearchQueryToGetWiki;
  setSearchQuery: Dispatch<SetStateAction<SearchQueryToGetWiki>>;
};

const RenderWikiCardList: React.FC<RenderWikiCardListProps> = ({
  type,
  ruleCategory,
  status,
  searchQuery,
  setSearchQuery,
}) => {
  const navigation = useNavigation<any>();
  const {data: fetchedWiki, isLoading: isLoadingWiki} = useAPIGetWikiList(
    searchQuery,
    {
      onSuccess: () => {
        setCustomLoading(false);
      },
    },
  );
  const isFocsed = useIsFocused();
  const [customLoading, setCustomLoading] = useState(false);

  useEffect(() => {
    if (isFocsed) {
      setCustomLoading(true);
      setSearchQuery(q => ({
        ...q,
        type,
        rule_category: ruleCategory,
        status: status,
      }));
    }
  }, [isFocsed, ruleCategory, setSearchQuery, status, type]);

  useEffect(() => {
    if (isLoadingWiki) {
      setCustomLoading(true);
      return;
    }
    setCustomLoading(false);
  }, [isLoadingWiki]);

  return (
    <Div>
      {!customLoading && fetchedWiki?.wiki.length ? (
        <FlatList
          data={fetchedWiki?.wiki || []}
          renderItem={({item: wiki}) => (
            <WikiCard
              onPress={w => navigation.navigate('WikiDetail', {id: w.id})}
              wiki={wiki}
            />
          )}
        />
      ) : !customLoading && !fetchedWiki?.wiki.length ? (
        <Text fontSize={16} textAlign="center">
          検索結果が見つかりませんでした
        </Text>
      ) : (
        <Overlay visible={customLoading} p="xl">
          <ActivityIndicator />
        </Overlay>
      )}
    </Div>
  );
};

const WikiCardList: React.FC<WikiCardListProps> = ({type}) => {
  const [searchQuery, setSearchQuery] = useState<SearchQueryToGetWiki>({
    page: '1',
    type,
  });

  useEffect(() => {
    setSearchQuery(q => ({...q, type}));
  }, [type]);

  return (
    <Div flexDir="column" h="100%" pb={80}>
      {type === WikiType.RULES ? (
        <TopTab.Navigator
          screenOptions={{
            tabBarScrollEnabled: true,
          }}>
          <TopTab.Screen
            name={'WikiList-' + RuleCategory.PHILOSOPHY}
            children={() => (
              <RenderWikiCardList
                type={WikiType.RULES}
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
                type={WikiType.RULES}
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
                type={WikiType.RULES}
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
                type={WikiType.RULES}
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
                type={WikiType.RULES}
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
                type={WikiType.QA}
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
                type={WikiType.QA}
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
          type={WikiType.KNOWLEDGE}
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

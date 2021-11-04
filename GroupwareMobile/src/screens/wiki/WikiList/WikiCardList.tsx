import React, {useState, useEffect} from 'react';
import {WikiType} from '../../../types';
import {
  SearchQueryToGetWiki,
  useAPIGetWikiList,
} from '../../../hooks/api/wiki/useAPIGetWikiList';
import {Div} from 'react-native-magnus';
import WikiCard from '../../../components/wiki/WikiCard';
import {WikiListNavigationProps} from '../../../types/navigator/screenProps/Wiki';
import {FlatList} from 'react-native';

type WikiCardListProps = {
  type?: WikiType;
  navigation: WikiListNavigationProps;
};

const WikiCardList: React.FC<WikiCardListProps> = ({type, navigation}) => {
  const [searchQuery, setSearchQuery] = useState<SearchQueryToGetWiki>({
    page: '1',
    type,
  });
  const {data: fetchedWiki} = useAPIGetWikiList(searchQuery);

  useEffect(() => {
    setSearchQuery(q => ({...q, type}));
  }, [type]);

  return (
    <Div flexDir="column" alignItems="center" h="100%">
      <FlatList
        data={fetchedWiki?.wiki || []}
        renderItem={({item: wiki}) => (
          <WikiCard
            onPress={w => navigation.navigate('WikiDetail', {id: w.id})}
            wiki={wiki}
          />
        )}
      />
    </Div>
  );
};

export default WikiCardList;

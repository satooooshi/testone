import React, {useState} from 'react';
import {WikiListProps} from '../../../types/navigator/screenProps/Wiki';
import WholeContainer from '../../../components/WholeContainer';
import AppHeader, {Tab} from '../../../components/Header';
import {WikiType} from '../../../types';
import WikiCardList from './WikiCardList';
import {wikiTypeNameFactory} from '../../../utils/factory/wiki/wikiTypeNameFactory';

const WikiList: React.FC<WikiListProps> = ({navigation}) => {
  const [type, setType] = useState<WikiType>();
  const tabs: Tab[] = [
    {
      name: 'All',
      onPress: () => setType(undefined),
    },
    {
      name: '社内規則',
      onPress: () => setType(WikiType.RULES),
    },
    {
      name: 'ナレッジ',
      onPress: () => setType(WikiType.KNOWLEDGE),
    },
    {
      name: 'Q&A',
      onPress: () => setType(WikiType.QA),
    },
  ];

  return (
    <WholeContainer>
      <AppHeader
        tabs={tabs}
        title="社内Wiki"
        activeTabName={type ? wikiTypeNameFactory(type) : 'All'}
        rightButtonName="新規作成"
        onPressRightButton={() =>
          navigation.navigate('PostWiki', {type: undefined})
        }
      />
      <WikiCardList type={type} navigation={navigation} />
    </WholeContainer>
  );
};

export default WikiList;

import React, {useState} from 'react';
import WholeContainer from '../../../components/WholeContainer';
import HeaderWithTextButton, {Tab} from '../../../components/Header';
import {WikiType} from '../../../types';
import WikiCardList from './WikiCardList';
import {wikiTypeNameFactory} from '../../../utils/factory/wiki/wikiTypeNameFactory';
import {WikiListProps} from '../../../types/navigator/drawerScreenProps';

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
      name: 'オール便',
      onPress: () => setType(WikiType.ALL_POSTAL),
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
      <HeaderWithTextButton
        tabs={tabs}
        title="社内Wiki"
        activeTabName={type ? wikiTypeNameFactory(type) : 'All'}
        rightButtonName={
          type ? `${wikiTypeNameFactory(type)}新規作成` : '新規作成'
        }
        onPressRightButton={() =>
          navigation.navigate('WikiStack', {
            screen: 'PostWiki',
            params: {type: type ? type : undefined},
          })
        }
      />
      <WikiCardList type={type} />
    </WholeContainer>
  );
};

export default WikiList;

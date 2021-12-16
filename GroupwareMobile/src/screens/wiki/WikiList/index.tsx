import React, {useState} from 'react';
import WholeContainer from '../../../components/WholeContainer';
import HeaderWithTextButton from '../../../components/Header';
import {RuleCategory, WikiType} from '../../../types';
import WikiCardList from './WikiCardList';
import {wikiTypeNameFactory} from '../../../utils/factory/wiki/wikiTypeNameFactory';
import {WikiListProps} from '../../../types/navigator/drawerScreenProps';
import {Tab} from '../../../components/Header/HeaderTemplate';

const WikiList: React.FC<WikiListProps> = ({navigation}) => {
  const [type, setType] = useState<WikiType>();
  const [ruleCategory, setRuleCategory] = useState<RuleCategory>(
    RuleCategory.OTHERS,
  );
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
      {/* <SearchFormOpenerButton onPress={console.log} /> */}
      <HeaderWithTextButton
        tabs={tabs}
        title="社内Wiki"
        activeTabName={type ? wikiTypeNameFactory(type, ruleCategory) : 'All'}
        rightButtonName={
          type
            ? `${wikiTypeNameFactory(type, ruleCategory)}新規作成`
            : '新規作成'
        }
        onPressRightButton={() =>
          navigation.navigate('WikiStack', {
            screen: 'PostWiki',
            params: {type, ruleCategory},
          })
        }
      />
      <WikiCardList type={type} setRuleCategory={setRuleCategory} />
    </WholeContainer>
  );
};

export default WikiList;

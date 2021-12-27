import React, {useEffect, useState} from 'react';
import WholeContainer from '../../../components/WholeContainer';
import HeaderWithTextButton from '../../../components/Header';
import {RuleCategory, WikiType} from '../../../types';
import WikiCardList from './WikiCardList';
import {wikiTypeNameFactory} from '../../../utils/factory/wiki/wikiTypeNameFactory';
import {
  WikiListProps,
  WikiListRouteProps,
} from '../../../types/navigator/drawerScreenProps';
import {Tab} from '../../../components/Header/HeaderTemplate';
import {useRoute} from '@react-navigation/native';

const WikiList: React.FC<WikiListProps> = ({navigation}) => {
  const typePassedByRoute = useRoute<WikiListRouteProps>()?.params?.type;
  const [type, setType] = useState<WikiType | undefined>(typePassedByRoute);
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

  useEffect(() => {
    if (typePassedByRoute) {
      setType(typePassedByRoute);
    }
  }, [typePassedByRoute]);

  return (
    <WholeContainer>
      {/* <SearchFormOpenerButton onPress={console.log} /> */}
      <HeaderWithTextButton
        enableBackButton={true}
        tabs={tabs}
        title="社内Wiki"
        activeTabName={
          type ? wikiTypeNameFactory(type, ruleCategory, false) : 'All'
        }
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
      <WikiCardList
        type={type}
        setType={setType}
        setRuleCategory={setRuleCategory}
      />
    </WholeContainer>
  );
};

export default WikiList;

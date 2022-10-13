import React, {useEffect, useState} from 'react';
import WholeContainer from '../../../components/WholeContainer';
import HeaderWithTextButton from '../../../components/Header';
import {BoardCategory, RuleCategory, WikiType} from '../../../types';
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
    RuleCategory.NON_RULE,
  );
  const [boardCategory, setBoardCategory] = useState<BoardCategory>(
    BoardCategory.NON_BOARD,
  );
  const tabs: Tab[] = [
    {
      name: 'All',
      onPress: () => setType(undefined),
    },
    // {
    //   name: '社内規則',
    //   onPress: () => setType(WikiType.RULES),
    // },
    {
      name: '運営からのお知らせ',
      onPress: () => setType(WikiType.ALL_POSTAL),
    },
    {
      name: '掲示板',
      onPress: () => setType(WikiType.BOARD),
    },
  ];

  useEffect(() => {
    if (typePassedByRoute) {
      setType(typePassedByRoute);
    }
  }, [typePassedByRoute]);

  return (
    <WholeContainer>
      <HeaderWithTextButton
        enableBackButton={false}
        tabs={tabs}
        title="News"
        activeTabName={
          type ? wikiTypeNameFactory(type, ruleCategory, false) : 'All'
        }
        rightButtonName={'新規作成'}
        onPressRightButton={() =>
          navigation.navigate('WikiStack', {
            screen: 'PostWiki',
            params: {},
          })
        }
      />
      <WikiCardList
        type={type}
        setType={setType}
        setRuleCategory={setRuleCategory}
        setBoardCategory={setBoardCategory}
      />
    </WholeContainer>
  );
};

export default WikiList;

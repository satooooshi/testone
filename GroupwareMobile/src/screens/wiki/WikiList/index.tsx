import React, {useState} from 'react';
import {WikiListProps} from '../../../types/navigator/screenProps/Wiki';
import WholeContainer from '../../../components/WholeContainer';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import AppHeader, {Tab} from '../../../components/Header';
import {WikiType} from '../../../types';
import WikiCardList from './WikiCardList';

const TopTab = createMaterialTopTabNavigator();

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
      <AppHeader tabs={tabs} title="社内Wiki" activeTabName="All" />
      <WikiCardList type={type} navigation={navigation} />
    </WholeContainer>
  );
};

export default WikiList;

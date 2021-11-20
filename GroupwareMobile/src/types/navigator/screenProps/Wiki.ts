import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../RootStackParamList';
import {RouteProp} from '@react-navigation/native';
import {DrawerNavigationProp} from '@react-navigation/drawer';

type WikiNavigationProps = StackNavigationProp<RootStackParamList, 'Wiki'>;
export type WikiProps = {
  navigation: WikiNavigationProps;
};
export type WikiListNavigationProps = StackNavigationProp<
  RootStackParamList,
  'WikiList'
>;
export type WikiListRouteProps = RouteProp<RootStackParamList, 'WikiList'>;
export type WikiListProps = {
  navigation: WikiListNavigationProps;
  route: WikiListRouteProps;
};
export type WikiDetailNavigationProps = StackNavigationProp<
  RootStackParamList,
  'WikiDetail'
>;
export type WikiDetailRouteProps = RouteProp<RootStackParamList, 'WikiDetail'>;
export type WikiDetailProps = {
  navigation: WikiDetailNavigationProps;
  route: WikiDetailRouteProps;
};

export type PostWikiNavigationProps = DrawerNavigationProp<
  RootStackParamList,
  'PostWiki'
>;
export type PostWikiRouteProps = RouteProp<RootStackParamList, 'PostWiki'>;

export type EditWikiNavigationProps = StackNavigationProp<
  RootStackParamList,
  'EditWiki'
>;
export type EditWikiRouteProps = RouteProp<RootStackParamList, 'EditWiki'>;
export type EditWikiProps = {
  navigation: EditWikiNavigationProps;
  route: EditWikiRouteProps;
};

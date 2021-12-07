import {RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {DrawerTabParamList} from '../DrawerTabParamList';
import {RootStackParamList} from '../RootStackParamList';

export type WikiNavigationProps = StackNavigationProp<
  DrawerTabParamList,
  'WikiStack'
>;

export type WikiListNavigationProps = StackNavigationProp<
  DrawerTabParamList,
  'WikiStack'
>;
export type WikiListProps = {
  navigation: WikiListNavigationProps;
};

export type WikiDetailRouteProps = RouteProp<RootStackParamList, 'WikiDetail'>;

export type WikiDetailProps = {
  navigation: WikiListNavigationProps;
  route: WikiDetailRouteProps;
};

export type PostWikiNavigationProps = StackNavigationProp<
  DrawerTabParamList,
  'WikiStack'
>;

export type PostWikiRouteProps = RouteProp<RootStackParamList, 'PostWiki'>;

export type EditWikiNavigationProps = StackNavigationProp<
  DrawerTabParamList,
  'WikiStack'
>;

export type EditWikiRouteProps = RouteProp<RootStackParamList, 'EditWiki'>;

export type PostAnswerRouteProps = RouteProp<RootStackParamList, 'PostAnswer'>;

export type PostReplyNavigationProps = StackNavigationProp<
  DrawerTabParamList,
  'WikiStack'
>;

import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../RootStackParamList';
import {RouteProp} from '@react-navigation/native';

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

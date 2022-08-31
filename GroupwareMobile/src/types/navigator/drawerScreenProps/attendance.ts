import {RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {DrawerTabParamList} from '../DrawerTabParamList';
import {RootStackParamList} from '../RootStackParamList';

export type AttendanceHomeNavigationProps = StackNavigationProp<
  DrawerTabParamList,
  'AttendanceStack'
>;
export type AttendanceNavigationProps = StackNavigationProp<
  DrawerTabParamList,
  'AttendanceStack'
>;
export type DefaultAttendanceNavigationProps = StackNavigationProp<
  DrawerTabParamList,
  'AttendanceStack'
>;
export type ApplicationNavigationProps = StackNavigationProp<
  DrawerTabParamList,
  'AccountStack'
>;
export type AttendanceReportDetailProps = {
  route: AttendanceReportDetailRouteProps;
};

export type AttendanceReportDetailRouteProps = RouteProp<
  RootStackParamList,
  'AttendanceReportDetail'
>;

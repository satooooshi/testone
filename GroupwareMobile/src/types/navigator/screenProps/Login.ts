import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../RootStackParamList';

type LoginNavigationPropsn = StackNavigationProp<RootStackParamList, 'Login'>;

export type LoginProps = {
  navigation: LoginNavigationPropsn;
};
type HomeNavigationPropsn = StackNavigationProp<RootStackParamList, 'Home'>;

export type HomeProps = {
  navigation: HomeNavigationPropsn;
};

import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../RootStackParamList';

type LoginNavigationPropsn = StackNavigationProp<RootStackParamList, 'Login'>;

export type LoginProps = {
  navigation: LoginNavigationPropsn;
};

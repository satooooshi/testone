import React from 'react';
import {LoginProps} from '../../../types/navigator/screenProps/Login';
import WholeContainer from '../../../components/WholeContainer';
import {Input, Button, Text} from 'react-native-magnus';
import {darkFontColor} from '../../../utils/colors';
import FastImage from 'react-native-fast-image';
import {
  useWindowDimensions,
  View,
  Alert,
  TouchableHighlight,
} from 'react-native';
import {loginStyles} from '../../../styles/screen/auth/login.style';
import {Formik} from 'formik';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {useAPIRefreshPassword} from '../../../hooks/api/auth/useAPIRefreshPassword';

const ForgotPassword: React.FC<LoginProps> = ({navigation}) => {
  const windowWidth = useWindowDimensions().width;
  const {mutate: refreshPassword} = useAPIRefreshPassword({
    onSuccess: () => {
      Alert.alert('パスワード再発行メールを送信しました');
    },
    onError: () => {
      Alert.alert('エラーが発生しました\n入力内容をお確かめください');
    },
  });

  return (
    <WholeContainer>
      <KeyboardAwareScrollView>
        <View style={{...loginStyles.layout, width: windowWidth * 0.9}}>
          <FastImage
            style={{
              ...loginStyles.imageBottomMargin,
              width: windowWidth * 0.9,
              minHeight: windowWidth * 0.6,
            }}
            resizeMode="contain"
            source={require('../../../../assets/valleyin-logo.png')}
          />
          <Formik
            initialValues={{email: ''}}
            onSubmit={values => refreshPassword(values)}>
            {({values, handleBlur, handleChange, handleSubmit}) => (
              <>
                <Text
                  fontSize={30}
                  fontWeight="bold"
                  color={darkFontColor}
                  mb={24}
                  style={loginStyles.centerize}>
                  Login to Service
                </Text>
                <TouchableHighlight
                  underlayColor="none"
                  style={loginStyles.centerize}
                  onPress={() => navigation.navigate('Login')}>
                  <Text
                    color="green600"
                    fontSize={16}
                    fontWeight="bold"
                    mb={24}>
                    ログイン画面へ
                  </Text>
                </TouchableHighlight>
                <Input
                  h={48}
                  fontSize={16}
                  style={loginStyles.fontSize}
                  autoCapitalize="none"
                  placeholder="登録済みのメールアドレスを入力してください"
                  p={10}
                  mb="lg"
                  value={values.email}
                  onBlur={handleBlur('email')}
                  onChangeText={handleChange('email')}
                />
                <Button
                  onPress={() => handleSubmit()}
                  h={48}
                  fontSize={22}
                  block
                  px="xl"
                  py="lg"
                  bg="green700"
                  fontWeight="bold"
                  color="white">
                  再発行メールを送信
                </Button>
              </>
            )}
          </Formik>
        </View>
      </KeyboardAwareScrollView>
    </WholeContainer>
  );
};

export default ForgotPassword;

import React from 'react';
import {LoginProps} from '../../../types/navigator/screenProps/Login';
import WholeContainer from '../../../components/WholeContainer';
import {Input, Button, Text, Div} from 'react-native-magnus';
import {darkFontColor} from '../../../utils/colors';
import FastImage from 'react-native-fast-image';
import {
  useWindowDimensions,
  View,
  Alert,
  TouchableHighlight,
} from 'react-native';
import {loginStyles} from '../../../styles/screen/auth/login.style';
import {useAuthenticate} from '../../../contexts/useAuthenticate';
import {useAPILogin} from '../../../hooks/api/auth/useAPILogin';
import {axiosInstance, storage} from '../../../utils/url';
import {useFormik} from 'formik';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import messaging from '@react-native-firebase/messaging';
import {useAPIRegisterDevice} from '../../../hooks/api/notification/useAPIRegisterDevice';
import {loginSchema} from '../../../utils/validation/schema';
import {formikErrorMsgFactory} from '../../../utils/factory/formikEroorMsgFactory';

const Login: React.FC<LoginProps> = ({navigation}) => {
  const {mutate: registerDevice} = useAPIRegisterDevice();
  const windowWidth = useWindowDimensions().width;
  const {setUser} = useAuthenticate();
  const {mutate: mutateLogin} = useAPILogin({
    onSuccess: async data => {
      axiosInstance.defaults.headers.common = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${data.token || ''}`,
      };
      const token = await messaging().getToken();
      registerDevice({token});
      storage.set('userToken', data.token || '');
      setUser(data);
      navigation.navigate('Main');
    },
    onError: () => {
      Alert.alert('認証に失敗しました。入力内容をご確認ください');
    },
  });
  const {values, handleChange, handleSubmit, handleBlur, validateForm} =
    useFormik({
      initialValues: {email: '', password: ''},
      validationSchema: loginSchema,
      onSubmit: values => mutateLogin(values),
    });

  const checkValidateErrors = async () => {
    const errors = await validateForm();
    const messages = formikErrorMsgFactory(errors);
    if (messages) {
      Alert.alert(messages);
    } else {
      handleSubmit();
    }
  };

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
            source={require('../../../../assets/bold-logo.png')}
          />
          <>
            <Text
              fontSize={30}
              fontWeight="bold"
              color={darkFontColor}
              mb={24}
              style={loginStyles.centerize}>
              Login to Service
            </Text>
            <Div
              flexDir="row"
              alignItems="center"
              justifyContent="center"
              mb={24}>
              <Text
                fontSize={16}
                fontWeight="bold"
                color={darkFontColor}
                style={loginStyles.centerize}>
                パスワードをお忘れの方は
              </Text>
              <TouchableHighlight
                underlayColor="none"
                onPress={() => navigation.navigate('ForgotPassword')}>
                <Text color="green600" fontSize={16}>
                  こちら
                </Text>
              </TouchableHighlight>
            </Div>
            <Input
              h={48}
              fontSize={16}
              style={loginStyles.fontSize}
              autoCapitalize="none"
              placeholder="email@example.com"
              p={10}
              mb="lg"
              value={values.email}
              onBlur={handleBlur('email')}
              onChangeText={handleChange('email')}
            />
            <Input
              h={48}
              fontSize={16}
              placeholder="password"
              autoCapitalize="none"
              secureTextEntry={true}
              p={10}
              mb={'lg'}
              value={values.password}
              onChangeText={handleChange('password')}
              onBlur={handleBlur('password')}
            />
            <Button
              onPress={() => checkValidateErrors()}
              h={48}
              fontSize={22}
              block
              px="xl"
              py="lg"
              bg="green700"
              fontWeight="bold"
              color="white">
              ログイン
            </Button>
          </>
        </View>
      </KeyboardAwareScrollView>
    </WholeContainer>
  );
};

export default Login;

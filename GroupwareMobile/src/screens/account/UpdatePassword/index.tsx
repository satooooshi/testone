import {useFormik} from 'formik';
import React from 'react';
import {ActivityIndicator, Alert, useWindowDimensions} from 'react-native';
import {Button, Div, Icon, Input, Overlay, Text} from 'react-native-magnus';
import AppHeader, {Tab} from '../../../components/Header';
import WholeContainer from '../../../components/WholeContainer';
import {useAPIUpdatePassword} from '../../../hooks/api/user/useAPIUpdatePassword';
import {UpdatePasswordProps} from '../../../types/navigator/screenProps/Account';
import {updatePasswordSchema} from '../../../utils/validation/schema';

const UpdatePassword: React.FC<UpdatePasswordProps> = ({navigation}) => {
  const {width: windowWidth} = useWindowDimensions();
  const {mutate: updatePassword, isLoading: loadingUpdate} =
    useAPIUpdatePassword({
      onSuccess: () => {
        Alert.alert('パスワードの更新が完了しました');
        resetForm();
      },
    });
  const tabs: Tab[] = [
    {
      name: 'アカウント情報',
      onPress: () => navigation.navigate('AccountDetail'),
    },
    {
      name: 'プロフィール編集',
      onPress: () => navigation.navigate('Profile'),
    },
    {
      name: 'パスワード更新',
      onPress: () => {},
    },
  ];
  const {handleSubmit, values, resetForm, setValues, errors, touched} =
    useFormik({
      initialValues: {
        currentPassword: '',
        newPassword: '',
        newPasswordConfirmation: '',
      },
      validationSchema: updatePasswordSchema,
      onSubmit: v => {
        updatePassword(v);
      },
    });

  return (
    <WholeContainer>
      <Overlay visible={loadingUpdate} p="xl">
        <ActivityIndicator />
      </Overlay>
      <AppHeader
        title={'Account'}
        tabs={tabs}
        activeTabName={'パスワード更新'}
      />
      <Button
        bg="blue700"
        h={60}
        w={60}
        position="absolute"
        zIndex={20}
        right={10}
        bottom={10}
        alignSelf="flex-end"
        rounded="circle"
        onPress={() => handleSubmit()}>
        <Icon color="white" name="check" fontSize={32} />
      </Button>

      <Div w={windowWidth * 0.9} alignSelf="center" mt={'lg'}>
        <Div mb={'lg'}>
          <Text fontSize={16} fontWeight="bold">
            現在のパスワード
          </Text>
          {errors.currentPassword && touched.currentPassword ? (
            <Text fontSize={16} fontWeight="bold" color="tomato">
              {errors.newPassword}
            </Text>
          ) : null}
          <Input
            secureTextEntry={true}
            value={values.currentPassword}
            onChangeText={t => setValues(v => ({...v, currentPassword: t}))}
            autoCapitalize="none"
            placeholder="現在のパスワードを入力してください"
          />
        </Div>
        <Div mb={'lg'}>
          <Text fontSize={16} fontWeight="bold">
            新しいパスワード
          </Text>
          {errors.newPassword && touched.newPassword ? (
            <Text fontSize={16} fontWeight="bold" color="tomato">
              {errors.newPassword}
            </Text>
          ) : null}
          <Input
            secureTextEntry={true}
            value={values.newPassword}
            onChangeText={t => setValues(v => ({...v, newPassword: t}))}
            autoCapitalize="none"
            placeholder="新しいパスワードを入力してください"
          />
        </Div>
        <Div mb={'lg'}>
          <Text fontSize={16} fontWeight="bold">
            新しいパスワード(再入力)
          </Text>
          {errors.newPasswordConfirmation && touched.newPasswordConfirmation ? (
            <Text fontSize={16} fontWeight="bold" color="tomato">
              {errors.newPasswordConfirmation}
            </Text>
          ) : null}
          <Input
            secureTextEntry={true}
            value={values.newPasswordConfirmation}
            onChangeText={t =>
              setValues(v => ({...v, newPasswordConfirmation: t}))
            }
            autoCapitalize="none"
            placeholder="新しいパスワードを再入力してください"
          />
        </Div>
      </Div>
    </WholeContainer>
  );
};

export default UpdatePassword;

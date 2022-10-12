import React from 'react';
import { SidebarScreenName } from '@/components/layout/Sidebar';
import LayoutWithTab from '@/components/layout/LayoutWithTab';
import profileStyles from '@/styles/layouts/Profile.module.scss';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Text,
  useToast,
} from '@chakra-ui/react';
import { useAuthenticate } from 'src/contexts/useAuthenticate';
import Head from 'next/head';
import { useFormik } from 'formik';
import { useAPIUpdatePassword } from '@/hooks/api/user/useAPIUpdatePassword';
import { updatePasswordSchema } from 'src/utils/validation/schema';
import router from 'next/router';
import { AiOutlineArrowLeft } from 'react-icons/ai';

const UpdatePassword = () => {
  const { user } = useAuthenticate();
  const toast = useToast();
  const { mutate: updatePassword } = useAPIUpdatePassword({
    onSuccess: (data) => {
      toast({
        title: 'パスワードの更新が完了しました',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      resetForm();
      router.push(`/account/${data.id.toString()}`);
    },
    onError: (err) => {
      toast({
        title: err.response?.data?.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    },
  });
  const { handleChange, handleSubmit, values, resetForm, errors, touched } =
    useFormik({
      initialValues: {
        currentPassword: '',
        newPassword: '',
        newPasswordConfirmation: '',
      },
      validationSchema: updatePasswordSchema,
      onSubmit: (values) => {
        updatePassword(values);
      },
    });

  return (
    <LayoutWithTab
      sidebar={{ activeScreenName: SidebarScreenName.ACCOUNT }}
      header={{
        title: 'Account',
        activeTabName: 'パスワード更新',
      }}>
      <Head>
        <title>FanReturn | パスワード更新</title>
      </Head>
      <Box w="100%" mt="20px" mb="40px">
        <Button bg="white" w="120px" onClick={() => router.back()}>
          <Box mr="10px">
            <AiOutlineArrowLeft size="20px" />
          </Box>
          <Text fontSize="14px">戻る</Text>
        </Button>
      </Box>
      <Box className={profileStyles.form_wrapper} justifyContent="center">
        <FormControl className={profileStyles.input_wrapper}>
          <FormLabel fontWeight={'bold'} fontSize="14px">
            旧パスワード
          </FormLabel>
          {errors.currentPassword && touched.currentPassword ? (
            <Text fontSize="sm" color="red">
              {errors.currentPassword}
            </Text>
          ) : null}
          <Input
            type="password"
            border="none"
            placeholder="現在のパスワードを入力してください"
            value={values.currentPassword}
            background="white"
            name="currentPassword"
            onChange={handleChange}
          />
        </FormControl>
        <FormControl className={profileStyles.input_wrapper}>
          <FormLabel fontWeight={'bold'} fontSize="14px">
            新パスワード
          </FormLabel>
          {errors.currentPassword && touched.currentPassword ? (
            <Text fontSize="sm" color="red">
              {errors.newPassword}
            </Text>
          ) : null}
          <Input
            type="password"
            border="none"
            placeholder="新しいパスワードを入力してください"
            value={values.newPassword}
            background="white"
            name="newPassword"
            onChange={handleChange}
          />
        </FormControl>
        <FormControl className={profileStyles.input_wrapper}>
          <FormLabel fontWeight={'bold'} fontSize="14px">
            新パスワード確認
          </FormLabel>
          {errors.newPasswordConfirmation && touched.newPasswordConfirmation ? (
            <Text fontSize="sm" color="red">
              {errors.newPasswordConfirmation}
            </Text>
          ) : null}
          <Input
            type="password"
            border="none"
            placeholder="新しいパスワードを入力してください"
            value={values.newPasswordConfirmation}
            background="white"
            name="newPasswordConfirmation"
            onChange={handleChange}
          />
        </FormControl>
      </Box>
      <Button
        className={profileStyles.update_button_wrapper}
        width="25%"
        colorScheme="blue"
        rounded="full"
        onClick={() => handleSubmit()}>
        <Text fontSize="14px">保存</Text>
      </Button>
    </LayoutWithTab>
  );
};
export default UpdatePassword;

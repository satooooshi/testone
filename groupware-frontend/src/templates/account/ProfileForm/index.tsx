import React, { useReducer } from 'react';
import profileStyles from '@/styles/layouts/Profile.module.scss';
import { User, TagType, BranchType, UserTag } from 'src/types';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Radio,
  Stack,
} from '@chakra-ui/react';
import { useFormik } from 'formik';
import FormToLinkTag from '@/components/FormToLinkTag';
import TagModal from '@/components/common/TagModal';
import { toggleTag } from 'src/utils/toggleTag';

type ProfileFormProps = {
  profile?: User;
  tags?: UserTag[];
};

type ModalState = {
  isOpen: boolean;
  filteredTagType?: TagType;
};

type ModalAction = {
  type: 'openTech' | 'openQualification' | 'openClub' | 'openHobby' | 'close';
};

const ProfileForm: React.FC<ProfileFormProps> = (profile, tags) => {
  const initialUserValues = {
    email: '',
    isEmailPublic: false,
    phone: '',
    isPhonePublic: false,
    lastName: '',
    firstName: '',
    lastNameKana: '',
    firstNameKana: '',
    branch: BranchType.NON_SET,
    avatarUrl: '',
    introduceOther: '',
    introduceTech: '',
    introduceQualification: '',
    introduceClub: '',
    introduceHobby: '',
  };

  const modalReducer = (
    _state: ModalState,
    action: ModalAction,
  ): ModalState => {
    switch (action.type) {
      case 'openTech': {
        return {
          isOpen: true,
          filteredTagType: TagType.TECH,
        };
      }
      case 'openQualification': {
        return {
          isOpen: true,
          filteredTagType: TagType.QUALIFICATION,
        };
      }
      case 'openClub': {
        return {
          isOpen: true,
          filteredTagType: TagType.CLUB,
        };
      }
      case 'openHobby': {
        return {
          isOpen: true,
          filteredTagType: TagType.HOBBY,
        };
      }
      case 'close': {
        return {
          isOpen: false,
        };
      }
    }
  };

  const [{ isOpen, filteredTagType }, dispatchModal] = useReducer(
    modalReducer,
    {
      isOpen: false,
    },
  );

  const {
    values: userInfo,
    setValues: setUserInfo,
    handleSubmit: onFinish,
    handleChange,
    validateForm,
  } = useFormik<Partial<User>>({
    initialValues: profile ? profile : initialUserValues,
    enableReinitialize: true,
    // validationSchema: profileSchema,
    // onSubmit: () => {
    //   handleUpdateUser();
    // },
  });

  const toggleSelectedTag = (t: UserTag) => {
    const toggledTag = toggleTag(userInfo?.tags, t);
    setUserInfo((i) => ({
      ...i,
      tags: toggledTag,
    }));
  };

  return (
    <>
      {tags.length && (
        <TagModal
          isOpen={isOpen}
          isSearch={false}
          tags={tags}
          selectedTags={userInfo?.tags || []}
          filteredTagType={filteredTagType}
          toggleTag={toggleSelectedTag}
          onClear={() => {
            dispatchModal({ type: 'close' });
          }}
          onComplete={() => dispatchModal({ type: 'close' })}
        />
      )}
      <div className={profileStyles.form_wrapper}></div>
      <FormControl className={profileStyles.input_wrapper}>
        <FormLabel fontWeight={'bold'}>メールアドレス</FormLabel>
        <Input
          type="email"
          name="email"
          placeholder="email@example.com"
          value={userInfo.email}
          background="white"
          onChange={handleChange}
        />
        <Stack spacing={5} direction="row">
          <Radio
            bg="white"
            colorScheme="green"
            isChecked={userInfo.isEmailPublic}
            value={'public'}
            onChange={() =>
              setUserInfo((v) => ({ ...v, isEmailPublic: true }))
            }>
            公開
          </Radio>
          <Radio
            bg="white"
            colorScheme="green"
            isChecked={!userInfo.isEmailPublic}
            value={'inPublic'}
            onChange={() =>
              setUserInfo((v) => ({ ...v, isEmailPublic: true }))
            }>
            非公開
          </Radio>
        </Stack>
      </FormControl>
      <FormControl className={profileStyles.input_wrapper}>
        <FormLabel fontWeight={'bold'}>電話番号</FormLabel>
        <Input
          type="phone"
          name="phone"
          placeholder="000-0000-0000"
          background="white"
          value={userInfo.phone}
          onChange={handleChange}
        />
        <Stack spacing={5} direction="row">
          <Radio
            bg="white"
            colorScheme="green"
            isChecked={userInfo.isPhonePublic}
            value={'public'}
            onChange={() =>
              setUserInfo((v) => ({ ...v, isPhonePublic: true }))
            }>
            公開
          </Radio>
          <Radio
            bg="white"
            colorScheme="green"
            isChecked={!userInfo.isPhonePublic}
            value={'unPublic'}
            onChange={() =>
              setUserInfo((v) => ({ ...v, isPhonePublic: false }))
            }>
            非公開
          </Radio>
        </Stack>
      </FormControl>
      <FormControl className={profileStyles.input_wrapper}>
        <FormLabel fontWeight={'bold'}>姓</FormLabel>
        <Input
          type="text"
          name="lastName"
          placeholder="山田"
          value={userInfo.lastName}
          background="white"
          onChange={handleChange}
        />
      </FormControl>
      <FormControl className={profileStyles.input_wrapper}>
        <FormLabel fontWeight={'bold'}>名</FormLabel>
        <Input
          type="text"
          name="firstName"
          placeholder="太郎"
          value={userInfo.firstName}
          background="white"
          onChange={handleChange}
        />
      </FormControl>
      <FormControl className={profileStyles.input_wrapper}>
        <FormLabel fontWeight={'bold'}>姓(フリガナ)</FormLabel>
        <Input
          type="text"
          name="lastNameKana"
          placeholder="ヤマダ"
          value={userInfo.lastNameKana}
          background="white"
          onChange={handleChange}
        />
      </FormControl>
      <FormControl className={profileStyles.input_wrapper}>
        <FormLabel fontWeight={'bold'}>名(フリガナ)</FormLabel>
        <Input
          type="text"
          name="firstNameKana"
          placeholder="タロウ"
          value={userInfo.firstNameKana}
          background="white"
          onChange={handleChange}
        />
      </FormControl>
      <FormControl mb={4}>
        <FormLabel fontWeight={'bold'}>所属支社</FormLabel>
        <Select
          name="branch"
          value={userInfo.branch}
          bg="white"
          height="10"
          onChange={handleChange}>
          <option value={BranchType.NON_SET}>未設定</option>
          <option value={BranchType.TOKYO}>東京</option>
          <option value={BranchType.OSAKA}>大阪</option>
        </Select>
      </FormControl>
      <FormControl mb={4}>
        <FormLabel fontWeight={'bold'}>自己紹介</FormLabel>
        <Textarea
          type="text"
          name="introduceOther"
          height="10"
          placeholder="自己紹介を入力してください"
          value={userInfo.introduceOther}
          background="white"
          onChange={handleChange}
        />
      </FormControl>
      <Box mb={2} w={'100%'}>
        <FormToLinkTag
          tags={userInfo?.tags || []}
          tagType={TagType.TECH}
          toggleTag={toggleSelectedTag}
          onEditButtonClick={() => dispatchModal({ type: 'openTech' })}
        />
      </Box>
      <FormControl mb={6}>
        <FormLabel fontWeight={'bold'}>技術の紹介</FormLabel>
        <Textarea
          placeholder="技術についての紹介を入力してください"
          type="text"
          name="introduceTech"
          height="10"
          value={userInfo.introduceTech}
          background="white"
          onChange={handleChange}
        />
      </FormControl>
      <Box mb={2} w={'100%'}>
        <FormToLinkTag
          tags={userInfo?.tags || []}
          tagType={TagType.QUALIFICATION}
          toggleTag={toggleSelectedTag}
          onEditButtonClick={() => dispatchModal({ type: 'openQualification' })}
        />
      </Box>
      <FormControl mb={6}>
        <FormLabel fontWeight={'bold'}>資格の紹介</FormLabel>
        <Textarea
          placeholder="資格についての紹介を入力してください"
          type="text"
          name="introduceQualification"
          height="10"
          value={userInfo.introduceQualification}
          background="white"
          onChange={handleChange}
        />
      </FormControl>
      <Box mb={2} w={'100%'}>
        <FormToLinkTag
          tags={userInfo?.tags || []}
          tagType={TagType.CLUB}
          toggleTag={toggleSelectedTag}
          onEditButtonClick={() => dispatchModal({ type: 'openClub' })}
        />
      </Box>
      <FormControl mb={6}>
        <FormLabel fontWeight={'bold'}>部活動の紹介</FormLabel>
        <Textarea
          placeholder="部活動についての紹介を入力してください"
          type="text"
          name="introduceClub"
          height="10"
          value={userInfo.introduceClub}
          background="white"
          onChange={handleChange}
        />
      </FormControl>
      <Box mb={2} w={'100%'}>
        <FormToLinkTag
          tags={userInfo?.tags || []}
          tagType={TagType.HOBBY}
          toggleTag={toggleSelectedTag}
          onEditButtonClick={() => dispatchModal({ type: 'openHobby' })}
        />
      </Box>
      <FormControl mb={8}>
        <FormLabel fontWeight={'bold'}>趣味の紹介</FormLabel>
        <Textarea
          placeholder="趣味についての紹介を入力してください"
          type="text"
          name="introduceHobby"
          height="10"
          value={userInfo.introduceHobby}
          background="white"
          onChange={handleChange}
        />
      </FormControl>
      <Button
        className={profileStyles.update_button_wrapper}
        width="40"
        colorScheme="blue">
        {/* {isLoading ? <Spinner /> : <Text>更新</Text>} */}
      </Button>
    </>
  );
};

export default ProfileForm;

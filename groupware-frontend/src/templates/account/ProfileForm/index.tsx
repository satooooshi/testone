import React, {
  Dispatch,
  SetStateAction,
  useReducer,
  useRef,
  useCallback,
} from 'react';
import profileStyles from '@/styles/layouts/Profile.module.scss';
import { User, TagType, BranchType, UserTag } from 'src/types';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Spinner,
  Textarea,
  Select,
  useToast,
  Text,
  Radio,
  Stack,
} from '@chakra-ui/react';
import Image from 'next/image';
import noImage from '@/public/no-image.jpg';
import ReactCrop from 'react-image-crop';
import { useFormik } from 'formik';
import { useDropzone } from 'react-dropzone';
import FormToLinkTag from '@/components/FormToLinkTag';
import TagModal from '@/components/common/TagModal';
import { useImageCrop } from '@/hooks/crop/useImageCrop';
import { UserRole } from 'src/types';
import { formikErrorMsgFactory } from 'src/utils/factory/formikErrorMsgFactory';
import { registerSchema, profileSchema } from 'src/utils/validation/schema';
import { userRoleNameFactory } from 'src/utils/factory/userRoleNameFactory';
import { imageExtensions } from 'src/utils/imageExtensions';
import { dataURLToFile } from 'src/utils/dataURLToFile';
import { toggleTag } from 'src/utils/toggleTag';

type ProfileFormProps = {
  profile?: User;
  tags?: UserTag[];
  isLoading: boolean;
  saveUser: (userInfo: Partial<User>) => void;
  uploadImage: (result: File[]) => void;
  setUserInfoProps: Dispatch<SetStateAction<Partial<User> | undefined>>;
};

type ModalState = {
  isOpen: boolean;
  filteredTagType?: TagType;
};

type ModalAction = {
  type: 'openTech' | 'openQualification' | 'openClub' | 'openHobby' | 'close';
};

const ProfileForm: React.FC<ProfileFormProps> = ({
  profile,
  tags,
  isLoading,
  saveUser,
  uploadImage,
  setUserInfoProps,
}) => {
  const toast = useToast();

  const initialUserValues = profile || {
    email: '',
    phone: '',
    lastName: '',
    firstName: '',
    lastNameKana: '',
    firstNameKana: '',
    password: '',
    role: UserRole.COMMON,
    branch: BranchType.NON_SET,
    avatarUrl: '',
    employeeId: '',
    introduceOther: '',
    introduceTech: '',
    introduceQualification: '',
    introduceClub: '',
    introduceHobby: '',
    verifiedAt: new Date(),
    tags: [],
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

  const [
    {
      crop,
      completedCrop,
      croppedImageURL,
      imageName: selectImageName,
      imageURL: selectImageUrl,
    },
    dispatchCrop,
  ] = useImageCrop();
  const imgRef = useRef<HTMLImageElement | null>(null);

  const onEventImageDrop = useCallback(
    (f: File[]) => {
      dispatchCrop({ type: 'setImageFile', value: f[0] });
    },
    [dispatchCrop],
  );

  const {
    getRootProps: getEventImageRootProps,
    getInputProps: getEventImageInputProps,
  } = useDropzone({
    onDrop: onEventImageDrop,
    accept: imageExtensions,
  });

  const {
    values: userInfo,
    setValues: setUserInfo,
    handleSubmit: onFinish,
    handleChange,
    validateForm,
  } = useFormik<Partial<User>>({
    initialValues: initialUserValues,
    enableReinitialize: true,
    validationSchema: profile ? profileSchema : registerSchema,
    onSubmit: () => {
      handleUpdateUser();
    },
  });

  const toggleSelectedTag = (t: UserTag) => {
    const toggledTag = toggleTag(userInfo?.tags, t);
    setUserInfo((i) => ({
      ...i,
      tags: toggledTag,
    }));
  };

  const checkErrors = async () => {
    const errors = await validateForm();
    const messages = formikErrorMsgFactory(errors);
    if (messages) {
      toast({
        title: messages,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } else {
      onFinish();
    }
  };

  const handleUpdateUser = async () => {
    if (croppedImageURL && completedCrop && selectImageName) {
      const result = await dataURLToFile(croppedImageURL, selectImageName);
      setUserInfoProps(userInfo);
      uploadImage([result]);
      return;
    }
    saveUser(userInfo);
  };

  const onLoad = useCallback((img) => {
    imgRef.current = img;
  }, []);

  return (
    <>
      {tags && (
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
      <div className={profileStyles.main}>
        <div className={profileStyles.image_wrapper}>
          {userInfo.avatarUrl && !selectImageUrl ? (
            <div
              {...getEventImageRootProps({
                className: profileStyles.image_dropzone,
              })}>
              <input {...getEventImageInputProps()} />
              <img
                className={profileStyles.avatar}
                src={croppedImageURL ? croppedImageURL : userInfo.avatarUrl}
                alt="アバター画像"
              />
            </div>
          ) : null}
          {!userInfo.avatarUrl && !selectImageUrl ? (
            <div
              {...getEventImageRootProps({
                className: profileStyles.image_dropzone,
              })}>
              <input {...getEventImageInputProps()} />
              <div className={profileStyles.next_image_wrapper}>
                <Image
                  className={profileStyles.avatar}
                  src={noImage}
                  alt="アバター画像"
                />
              </div>
            </div>
          ) : null}
          {selectImageUrl ? (
            <ReactCrop
              keepSelection={true}
              src={selectImageUrl}
              crop={crop}
              onChange={(newCrop) => {
                dispatchCrop({ type: 'setCrop', value: newCrop });
              }}
              onComplete={(c) => {
                dispatchCrop({
                  type: 'setCompletedCrop',
                  value: c,
                  ref: imgRef.current,
                });
              }}
              onImageLoaded={onLoad}
              circularCrop={true}
            />
          ) : null}
        </div>
        <div className={profileStyles.form_wrapper}>
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
            {profile && (
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
            )}
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
            {profile && (
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
            )}
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
          {!profile && (
            <FormControl className={profileStyles.input_wrapper}>
              <FormLabel fontWeight={'bold'}>
                <p>社員区分</p>
              </FormLabel>
              <Select
                name="role"
                value={userInfo.role}
                colorScheme="teal"
                bg="white"
                onChange={handleChange}
                defaultValue={UserRole.COMMON}>
                <option value={UserRole.ADMIN}>管理者</option>
                <option value={UserRole.EXTERNAL_INSTRUCTOR}>
                  {userRoleNameFactory(UserRole.EXTERNAL_INSTRUCTOR)}
                </option>
                <option value={UserRole.INTERNAL_INSTRUCTOR}>
                  {userRoleNameFactory(UserRole.INTERNAL_INSTRUCTOR)}
                </option>
                <option value={UserRole.COACH}>コーチ</option>
                <option value={UserRole.COMMON}>一般社員</option>
              </Select>
            </FormControl>
          )}
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
          {!profile && (
            <>
              <FormControl className={profileStyles.input_wrapper}>
                <FormLabel fontWeight={'bold'}>
                  <p>社員コード</p>
                </FormLabel>
                <Input
                  type="text"
                  placeholder="社員コード"
                  value={userInfo.employeeId || ''}
                  background="white"
                  name="employeeId"
                  onChange={handleChange}
                />
              </FormControl>
              <FormControl mb={4}></FormControl>
              <FormControl className={profileStyles.input_wrapper}>
                <FormLabel fontWeight={'bold'}>
                  <p>パスワード</p>
                </FormLabel>
                <Input
                  type="password"
                  placeholder="password"
                  value={userInfo.password}
                  background="white"
                  name="password"
                  onChange={handleChange}
                />
              </FormControl>
            </>
          )}
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
              onEditButtonClick={() =>
                dispatchModal({ type: 'openQualification' })
              }
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
        </div>
      </div>
      <Button
        className={profileStyles.update_button_wrapper}
        width="40"
        colorScheme="blue"
        onClick={() => checkErrors()}>
        {isLoading ? <Spinner /> : <Text>{profile ? '更新' : '作成'}</Text>}
      </Button>
    </>
  );
};

export default ProfileForm;

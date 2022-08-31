import LayoutWithTab from '@/components/layout/LayoutWithTab';
import { SidebarScreenName } from '@/components/layout/Sidebar';
import React, {
  useCallback,
  useEffect,
  useReducer,
  useRef,
  useState,
} from 'react';
import { Tab } from 'src/types/header/tab/types';
import Head from 'next/head';
import Image from 'next/image';
import { TagType, User, UserRole, UserTag, BranchType } from 'src/types';
import { useAPIUploadStorage } from '@/hooks/api/storage/useAPIUploadStorage';
import { useDropzone } from 'react-dropzone';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Progress,
  Select,
  Textarea,
  useToast,
  Text,
  Spinner,
} from '@chakra-ui/react';
import { imageExtensions } from 'src/utils/imageExtensions';
import noImage from '@/public/no-image.jpg';
import { useAPIRegister } from '@/hooks/api/auth/useAPIRegister';
import createNewUserStyles from '@/styles/layouts/admin/CreateNewUser.module.scss';
import { toggleTag } from 'src/utils/toggleTag';
import TagModal from '@/components/common/TagModal';
import { useAPIGetUserTag } from '@/hooks/api/tag/useAPIGetUserTag';
import { useFormik } from 'formik';
import { registerSchema } from 'src/utils/validation/schema';
import validationErrorStyles from '@/styles/components/ValidationError.module.scss';
import ReactCrop from 'react-image-crop';
import { dataURLToFile } from 'src/utils/dataURLToFile';
import { useImageCrop } from '@/hooks/crop/useImageCrop';
import { useHeaderTab } from '@/hooks/headerTab/useHeaderTab';
import { userRoleNameFactory } from 'src/utils/factory/userRoleNameFactory';
import FormToLinkTag from '@/components/FormToLinkTag';
import { useRouter } from 'next/router';
import { useAuthenticate } from 'src/contexts/useAuthenticate';
import { formikErrorMsgFactory } from 'src/utils/factory/formikErrorMsgFactory';

type ModalState = {
  isOpen: boolean;
  filteredTagType?: TagType;
};

type ModalAction = {
  type: 'openTech' | 'openQualification' | 'openClub' | 'openHobby' | 'close';
};

const CreateNewUser = () => {
  const toast = useToast();
  const { data: tags } = useAPIGetUserTag();
  const router = useRouter();
  const { user } = useAuthenticate();
  const [loadingUserRole, setLoadingUserRole] = useState(true);
  const initialUserValues: Partial<User> = {
    email: '',
    lastName: '',
    firstName: '',
    lastNameKana: '',
    firstNameKana: '',
    password: '',
    role: UserRole.COMMON,
    avatarUrl: '',
    employeeId: '',
    introduceOther: '',
    introduceTech: '',
    introduceClub: '',
    introduceHobby: '',
    introduceQualification: '',
    verifiedAt: new Date(),
    tags: [],
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

  const {
    handleSubmit: onFinish,
    handleChange,
    handleBlur,
    validateForm,
    setValues: setUserInfo,
    values,
    resetForm,
  } = useFormik({
    initialValues: initialUserValues,
    onSubmit: async (submitted) => {
      if (croppedImageURL && imageName) {
        const result = await dataURLToFile(croppedImageURL, imageName);
        uploadImage([result]);
        return;
      }
      registerUser(submitted);
    },
    validationSchema: registerSchema,
  });
  const imgRef = useRef<HTMLImageElement | null>(null);

  const onLoad = useCallback((img) => {
    imgRef.current = img;
    const diameter: number = img.height < img.width ? img.height : img.width;
    dispatchCrop({
      type: 'setCropAndImage',
      value: {
        unit: 'px',
        x: (img.width - diameter) / 2,
        y: (img.height - diameter) / 2,
        width: diameter,
        height: diameter,
        aspect: 1,
      },
      ref: img,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const [{ crop, croppedImageURL, imageName, imageURL }, dispatchCrop] =
    useImageCrop();

  // const [userInfo, setUserInfo] = useState<Partial<User>>(initialUserValues);
  const { mutate: uploadImage, isLoading: loadingUplaod } = useAPIUploadStorage(
    {
      onSuccess: async (fileURLs) => {
        const updateEventImageOnState = async () => {
          Promise.resolve();
          setUserInfo((e) => ({ ...e, avatarUrl: fileURLs[0] }));
        };
        await updateEventImageOnState();
        registerUser({ ...values, avatarUrl: fileURLs[0] });
        dispatchCrop({
          type: 'setImageFile',
          value: undefined,
        });
      },
    },
  );

  const onEventImageDrop = useCallback(
    (f: File[]) => {
      dispatchCrop({
        type: 'setImageFile',
        value: f[0],
      });
    },
    [dispatchCrop],
  );

  const onClickDeleteImage = () => {
    dispatchCrop({ type: 'resetImage', value: 'resetImage' });
  };

  const {
    getRootProps: getEventImageRootProps,
    getInputProps: getEventImageInputProps,
  } = useDropzone({
    onDrop: onEventImageDrop,
    accept: imageExtensions,
  });

  const { mutate: registerUser, isLoading: loadingRegister } = useAPIRegister({
    onSuccess: (responseData) => {
      if (responseData) {
        const tempPassword: string = values.password || '';
        toast({
          title: `${responseData.lastName} ${responseData.firstName}さんのアカウントを作成しました`,
          description: `パスワード: ${tempPassword}`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        resetForm();
        dispatchCrop({ type: 'resetImage', value: 'resetImage' });
        setUserInfo(initialUserValues);
      }
    },
  });

  const tabs: Tab[] = useHeaderTab({ headerTabType: 'admin' });

  const toggleSelectedTag = (t: UserTag) => {
    const toggledTag = toggleTag(values.tags, t);
    setUserInfo((i) => ({
      ...i,
      tags: toggledTag,
    }));
  };

  const isLoading = loadingRegister || loadingUplaod;

  useEffect(() => {
    if (user?.role !== UserRole.ADMIN) {
      router.back();
      return;
    }
    setLoadingUserRole(false);
  }, [user, router]);

  if (loadingUserRole) {
    return <Progress isIndeterminate size="lg" />;
  }

  return (
    <LayoutWithTab
      sidebar={{
        activeScreenName: SidebarScreenName.ADMIN,
      }}
      header={{
        title: '新規ユーザー作成',
        tabs: tabs,
        activeTabName: 'ユーザー作成',
      }}>
      <Head>
        <title>sample | ユーザー作成</title>
      </Head>
      {tags && (
        <TagModal
          isOpen={isOpen}
          isSearch={false}
          tags={tags}
          selectedTags={values.tags || []}
          filteredTagType={filteredTagType}
          toggleTag={toggleSelectedTag}
          onClear={() => {
            dispatchModal({ type: 'close' });
          }}
          onComplete={() => dispatchModal({ type: 'close' })}
        />
      )}
      <div className={createNewUserStyles.main}>
        <div className={createNewUserStyles.image_wrapper}>
          {imageURL ? (
            <>
              <ReactCrop
                keepSelection={true}
                src={imageURL}
                crop={crop}
                onChange={(newCrop) => {
                  if (
                    newCrop.height !== crop.height ||
                    newCrop.width !== crop.width ||
                    newCrop.y !== crop.y ||
                    newCrop.x !== crop.x
                  )
                    dispatchCrop({
                      type: 'setCropAndImage',
                      value: newCrop,
                      ref: imgRef.current,
                    });
                }}
                onImageLoaded={onLoad}
                circularCrop={true}
                imageStyle={{
                  minHeight: '100px',
                  maxHeight: '1000px',
                  minWidth: '100px',
                }}
              />
              <Button
                mb="15px"
                colorScheme="blue"
                marginTop="30px"
                onClick={() => onClickDeleteImage()}>
                既存画像を削除
              </Button>
            </>
          ) : (
            <div
              {...getEventImageRootProps({
                className: createNewUserStyles.image_dropzone,
              })}>
              <input {...getEventImageInputProps()} />
              <div className={createNewUserStyles.next_image_wrapper}>
                <Image
                  className={createNewUserStyles.avatar}
                  src={noImage}
                  alt="アバター画像"
                />
              </div>
            </div>
          )}
        </div>
        <div className={createNewUserStyles.form_wrapper}>
          <FormControl className={createNewUserStyles.input_wrapper}>
            <FormLabel fontWeight={'bold'}>
              <p>姓</p>
            </FormLabel>
            <Input
              type="text"
              placeholder="山田"
              value={values.lastName}
              background="white"
              name="lastName"
              onChange={handleChange}
            />
          </FormControl>
          <FormControl className={createNewUserStyles.input_wrapper}>
            <FormLabel fontWeight={'bold'}>
              <p>名</p>
            </FormLabel>
            <Input
              type="text"
              placeholder="太郎"
              value={values.firstName}
              background="white"
              onChange={(e) =>
                setUserInfo((i) => ({ ...i, firstName: e.target.value }))
              }
              name="firstName"
            />
          </FormControl>
          <FormControl className={createNewUserStyles.input_wrapper}>
            <FormLabel fontWeight={'bold'}>姓(フリガナ)</FormLabel>
            <Input
              type="text"
              name="lastNameKana"
              placeholder="ヤマダ"
              value={validationErrorStyles.lastNameKana}
              background="white"
              onChange={handleChange}
            />
          </FormControl>
          <FormControl className={createNewUserStyles.input_wrapper}>
            <FormLabel fontWeight={'bold'}>名(フリガナ)</FormLabel>
            <Input
              type="text"
              name="firstNameKana"
              placeholder="タロウ"
              value={validationErrorStyles.firstNameKana}
              background="white"
              onChange={handleChange}
            />
          </FormControl>
          <FormControl className={createNewUserStyles.input_wrapper}>
            <FormLabel fontWeight={'bold'}>
              <p>メールアドレス</p>
            </FormLabel>
            <Input
              type="email"
              placeholder="email@example.com"
              value={values.email}
              background="white"
              onChange={(e) =>
                setUserInfo((i) => ({ ...i, email: e.target.value }))
              }
              name="email"
            />
          </FormControl>
          <FormControl className={createNewUserStyles.input_wrapper}>
            <FormLabel fontWeight={'bold'}>
              <p>電話番号</p>
            </FormLabel>
            <Input
              type="phone"
              placeholder="000-0000-0000"
              value={values.phone}
              background="white"
              onChange={(e) =>
                setUserInfo((i) => ({ ...i, phone: e.target.value }))
              }
              name="phone"
            />
          </FormControl>
          <FormControl className={createNewUserStyles.input_wrapper}>
            <FormLabel fontWeight={'bold'}>
              <p>社員区分</p>
            </FormLabel>
            <Select
              name="role"
              value={values.role}
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
          <FormControl mb={4}>
            <FormLabel fontWeight={'bold'}>所属支社</FormLabel>
            <Select
              name="branch"
              value={values.branch}
              defaultValue={BranchType.NON_SET}
              bg="white"
              height="10"
              onChange={handleChange}>
              <option value={BranchType.NON_SET}>未設定</option>
              <option value={BranchType.TOKYO}>東京</option>
              <option value={BranchType.OSAKA}>大阪</option>
            </Select>
          </FormControl>
          <FormControl className={createNewUserStyles.input_wrapper}>
            <FormLabel fontWeight={'bold'}>
              <p>社員コード</p>
            </FormLabel>
            <Input
              type="text"
              placeholder="社員コード"
              value={values.employeeId || ''}
              background="white"
              name="employeeId"
              onChange={handleChange}
            />
          </FormControl>
          <FormControl mb={4}></FormControl>
          <FormControl className={createNewUserStyles.input_wrapper}>
            <FormLabel fontWeight={'bold'}>
              <p>パスワード</p>
            </FormLabel>
            <Input
              placeholder="password"
              value={values.password}
              background="white"
              name="password"
              onChange={handleChange}
            />
          </FormControl>
          <FormControl mb={4}>
            <FormLabel fontWeight={'bold'}>自己紹介</FormLabel>
            <Textarea
              placeholder="自己紹介を入力してください"
              type="text"
              height="10"
              value={values.introduceOther}
              background="white"
              name="introduceOther"
              onChange={handleChange}
            />
          </FormControl>

          <Box mb={2} w={'100%'}>
            <FormToLinkTag
              tags={values?.tags || []}
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
              height="10"
              background="white"
              value={values.introduceTech}
              name="introduceTech"
              onChange={handleChange}
            />
          </FormControl>
          <Box mb={2} w={'100%'}>
            <FormToLinkTag
              tags={values?.tags || []}
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
              type="text"
              placeholder="資格についての紹介を入力してください"
              height="10"
              value={values.introduceQualification}
              background="white"
              name="introduceQualification"
              onChange={handleChange}
            />
          </FormControl>
          <Box mb={2} w={'100%'}>
            <FormToLinkTag
              tags={values?.tags || []}
              tagType={TagType.CLUB}
              toggleTag={toggleSelectedTag}
              onEditButtonClick={() => dispatchModal({ type: 'openClub' })}
            />
          </Box>
          <FormControl mb={6}>
            <FormLabel fontWeight={'bold'}>部活動の紹介</FormLabel>
            <Textarea
              type="text"
              placeholder="部活動についての紹介を入力してください"
              height="10"
              value={values.introduceClub}
              background="white"
              name="introduceClub"
              onChange={handleChange}
            />
          </FormControl>
          <Box mb={2} w={'100%'}>
            <FormToLinkTag
              tags={values?.tags || []}
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
              height="10"
              value={values.introduceHobby}
              background="white"
              name="introduceHobby"
              onChange={handleChange}
            />
          </FormControl>
        </div>
      </div>
      <div className={createNewUserStyles.finish_button_wrapper}>
        <Button
          className={createNewUserStyles.update_button_wrapper}
          width="40"
          colorScheme="blue"
          onClick={() => checkErrors()}>
          {isLoading ? <Spinner /> : <Text>作成</Text>}
        </Button>
      </div>
    </LayoutWithTab>
  );
};

export default CreateNewUser;

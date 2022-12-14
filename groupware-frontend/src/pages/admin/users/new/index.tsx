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
  Stack,
  Radio,
} from '@chakra-ui/react';
import profileStyles from '@/styles/layouts/Profile.module.scss';
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
import { FiEdit2 } from 'react-icons/fi';
import { AiOutlineArrowLeft, AiOutlineDelete } from 'react-icons/ai';

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

  // const [values, setUserInfo] = useState<Partial<User>>(initialUserValues);
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
          title: `${responseData.lastName} ${responseData.firstName}?????????????????????????????????????????????`,
          description: `???????????????: ${tempPassword}`,
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
        title: '????????????????????????',
      }}>
      <Head>
        <title>???????????? | ??????????????????</title>
      </Head>
      <Box w="100%" mt="20px" mb="40px">
        <Button bg="white" w="120px" onClick={() => router.back()}>
          <Box mr="10px">
            <AiOutlineArrowLeft size="20px" />
          </Box>
          <Text fontSize="14px">??????</Text>
        </Button>
      </Box>
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
      <Box className={profileStyles.image_wrapper} mb="32px">
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
            <Box h="8px" />
            <div {...getEventImageRootProps()}>
              <input {...getEventImageInputProps()} />
              <Stack
                justifyContent="center"
                direction="row"
                my="8px"
                cursor="pointer"
                color="brand.400">
                <FiEdit2 />
                <Text fontSize="14px">?????????????????????</Text>
              </Stack>
            </div>
            <Stack
              justifyContent="center"
              direction="row"
              my="8px"
              cursor="pointer"
              color="red"
              onClick={() => onClickDeleteImage()}>
              <AiOutlineDelete />
              <Text fontSize="14px">?????????????????????</Text>
            </Stack>
          </>
        ) : (
          <div {...getEventImageRootProps()}>
            <div className={profileStyles.image_dropzone}>
              <input {...getEventImageInputProps()} />
              <div className={profileStyles.next_image_wrapper}>
                <Image
                  className={profileStyles.avatar}
                  src={noImage}
                  alt="??????????????????"
                />
              </div>
            </div>
            <Box h="8px" />
            <Stack
              justifyContent="center"
              direction="row"
              my="8px"
              cursor="pointer"
              color="brand.400">
              <FiEdit2 />
              <Text fontSize="14px">?????????????????????</Text>
            </Stack>
          </div>
        )}
      </Box>
      <Box className={profileStyles.form_wrapper}>
        <Stack direction="row" w="100%">
          <FormControl className={profileStyles.input_wrapper}>
            <FormLabel fontWeight={'bold'} fontSize="14px">
              ???
            </FormLabel>
            <Input
              type="text"
              name="lastName"
              placeholder="??????"
              value={values.lastName}
              background="white"
              border="none"
              onChange={handleChange}
            />
          </FormControl>
          <FormControl className={profileStyles.input_wrapper}>
            <FormLabel fontWeight={'bold'} fontSize="14px">
              ???
            </FormLabel>
            <Input
              type="text"
              name="firstName"
              placeholder="??????"
              value={values.firstName}
              background="white"
              border="none"
              onChange={handleChange}
            />
          </FormControl>
        </Stack>
        <Stack direction="row" w="100%">
          <FormControl className={profileStyles.input_wrapper}>
            <FormLabel fontWeight={'bold'} fontSize="14px">
              ??????
            </FormLabel>
            <Input
              type="text"
              name="lastNameKana"
              placeholder="?????????"
              value={values.lastNameKana}
              background="white"
              border="none"
              onChange={handleChange}
            />
          </FormControl>

          <FormControl className={profileStyles.input_wrapper}>
            <FormLabel fontWeight={'bold'} fontSize="14px">
              ??????
            </FormLabel>
            <Input
              type="text"
              name="firstNameKana"
              placeholder="?????????"
              value={values.firstNameKana}
              background="white"
              border="none"
              onChange={handleChange}
            />
          </FormControl>
        </Stack>
        <FormControl className={profileStyles.input_wrapper}>
          <FormLabel fontWeight={'bold'} fontSize="14px">
            ?????????????????????
          </FormLabel>
          <Input
            type="email"
            name="email"
            placeholder="email@example.com"
            value={values.email}
            background="white"
            border="none"
            onChange={handleChange}
          />
          <Stack spacing={5} direction="row" mt="8px">
            <Radio
              bg="white"
              colorScheme="brand"
              isChecked={values.isEmailPublic}
              value={'public'}
              onChange={() =>
                setUserInfo((v) => ({ ...v, isEmailPublic: true }))
              }>
              <Text fontSize="14px">??????</Text>
            </Radio>
            <Radio
              bg="white"
              colorScheme="brand"
              isChecked={!values.isEmailPublic}
              value={'inPublic'}
              onChange={() =>
                setUserInfo((v) => ({ ...v, isEmailPublic: true }))
              }>
              <Text fontSize="14px">?????????</Text>
            </Radio>
          </Stack>
        </FormControl>
        <FormControl className={profileStyles.input_wrapper}>
          <FormLabel fontWeight={'bold'} fontSize="14px">
            ????????????
          </FormLabel>
          <Input
            type="phone"
            name="phone"
            placeholder="000-0000-0000"
            background="white"
            border="none"
            value={values.phone}
            onChange={handleChange}
          />
          <Stack spacing={5} direction="row" mt="8px">
            <Radio
              bg="white"
              colorScheme="brand"
              isChecked={values.isPhonePublic}
              value={'public'}
              onChange={() =>
                setUserInfo((v) => ({ ...v, isPhonePublic: true }))
              }>
              <Text fontSize="14px">??????</Text>
            </Radio>
            <Radio
              bg="white"
              colorScheme="brand"
              isChecked={!values.isPhonePublic}
              value={'unPublic'}
              onChange={() =>
                setUserInfo((v) => ({ ...v, isPhonePublic: false }))
              }>
              <Text fontSize="14px">?????????</Text>
            </Radio>
          </Stack>
        </FormControl>
        <FormControl className={createNewUserStyles.input_wrapper}>
          <FormLabel fontWeight={'bold'}>
            <p>????????????</p>
          </FormLabel>
          <Select
            name="role"
            value={values.role}
            colorScheme="teal"
            bg="white"
            onChange={handleChange}
            defaultValue={UserRole.COMMON}>
            <option value={UserRole.ADMIN}>
              {userRoleNameFactory(UserRole.ADMIN)}
            </option>
            <option value={UserRole.EXTERNAL_INSTRUCTOR}>
              {userRoleNameFactory(UserRole.EXTERNAL_INSTRUCTOR)}
            </option>
            <option value={UserRole.INTERNAL_INSTRUCTOR}>
              {userRoleNameFactory(UserRole.INTERNAL_INSTRUCTOR)}
            </option>
            <option value={UserRole.COACH}>
              {userRoleNameFactory(UserRole.COACH)}
            </option>
            <option value={UserRole.COMMON}>
              {userRoleNameFactory(UserRole.COMMON)}
            </option>
          </Select>
        </FormControl>
        <FormControl mb={4}>
          <FormLabel fontWeight={'bold'} fontSize="14px">
            ????????????
          </FormLabel>
          <Select
            name="branch"
            value={values.branch}
            bg="white"
            border="none"
            onChange={handleChange}>
            <option value={BranchType.NON_SET}>?????????</option>
            <option value={BranchType.TOKYO}>??????</option>
            <option value={BranchType.OSAKA}>??????</option>
          </Select>
        </FormControl>
        <FormControl mb={4}>
          <FormLabel fontWeight={'bold'} fontSize={14}>
            <p>???????????????</p>
          </FormLabel>
          <Input
            type="text"
            placeholder="???????????????"
            value={values.employeeId || ''}
            background="white"
            name="employeeId"
            onChange={handleChange}
          />
        </FormControl>
        <FormControl mb={4}>
          <FormLabel fontWeight={'bold'} fontSize={14}>
            <p>???????????????</p>
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
          <FormLabel fontWeight={'bold'} fontSize="14px">
            ????????????
          </FormLabel>
          <Textarea
            type="text"
            name="introduceOther"
            height="200px"
            placeholder="???????????????????????????????????????"
            value={values.introduceOther}
            background="white"
            border="none"
            onChange={handleChange}
          />
        </FormControl>
        <FormControl mb={6}>
          <FormLabel fontWeight={'bold'} fontSize="14px">
            ???????????????
          </FormLabel>
          <Box mb={2} w={'100%'}>
            <FormToLinkTag
              tags={values?.tags || []}
              tagType={TagType.TECH}
              toggleTag={toggleSelectedTag}
              onEditButtonClick={() => dispatchModal({ type: 'openTech' })}
            />
          </Box>
          <Textarea
            placeholder="??????????????????????????????????????????????????????"
            type="text"
            name="introduceTech"
            height="200px"
            value={values.introduceTech}
            background="white"
            border="none"
            onChange={handleChange}
          />
        </FormControl>
        <FormControl mb={6}>
          <FormLabel fontWeight={'bold'} fontSize="14px">
            ???????????????
          </FormLabel>
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
          <Textarea
            placeholder="??????????????????????????????????????????????????????"
            type="text"
            name="introduceQualification"
            height="200px"
            value={values.introduceQualification}
            background="white"
            border="none"
            onChange={handleChange}
          />
        </FormControl>

        <FormControl mb={6}>
          <FormLabel fontWeight={'bold'} fontSize="14px">
            ??????????????????
          </FormLabel>
          <Box mb={2} w={'100%'}>
            <FormToLinkTag
              tags={values?.tags || []}
              tagType={TagType.CLUB}
              toggleTag={toggleSelectedTag}
              onEditButtonClick={() => dispatchModal({ type: 'openClub' })}
            />
          </Box>
          <Textarea
            placeholder="?????????????????????????????????????????????????????????"
            type="text"
            name="introduceClub"
            height="200px"
            value={values.introduceClub}
            background="white"
            border="none"
            onChange={handleChange}
          />
        </FormControl>
        <FormControl mb={8}>
          <FormLabel fontWeight={'bold'} fontSize="14px">
            ???????????????
          </FormLabel>
          <Box mb={2} w={'100%'}>
            <FormToLinkTag
              tags={values?.tags || []}
              tagType={TagType.HOBBY}
              toggleTag={toggleSelectedTag}
              onEditButtonClick={() => dispatchModal({ type: 'openHobby' })}
            />
          </Box>
          <Textarea
            placeholder="??????????????????????????????????????????????????????"
            type="text"
            name="introduceHobby"
            height="200px"
            value={values.introduceHobby}
            background="white"
            border="none"
            onChange={handleChange}
          />
        </FormControl>
      </Box>
      <Box mb={40}>
        <Button
          className={profileStyles.update_button_wrapper}
          width="40"
          colorScheme="brand"
          onClick={() => checkErrors()}>
          {isLoading ? <Spinner /> : <Text>??????</Text>}
        </Button>
      </Box>
    </LayoutWithTab>
  );
};

export default CreateNewUser;

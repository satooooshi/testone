import {useFormik} from 'formik';
import React, {useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import {
  Button,
  Div,
  Dropdown,
  Icon,
  Image,
  Input,
  Overlay,
  Text,
} from 'react-native-magnus';
import DropdownOpenerButton from '../../../components/common/DropdownOpenerButton';
import TagModal from '../../../components/common/TagModal';
import HeaderWithTextButton from '../../../components/Header';
import TagEditLine from '../../../components/TagEditLine';
import WholeContainer from '../../../components/WholeContainer';
import {useAPIRegister} from '../../../hooks/api/auth/useAPIRegister';
import {useAPIUploadStorage} from '../../../hooks/api/storage/useAPIUploadStorage';
import {useAPIGetUserTag} from '../../../hooks/api/tag/useAPIGetUserTag';
import {useTagType} from '../../../hooks/tag/useTagType';
import {userRegisteringAdminStyles} from '../../../styles/screen/admin/userRegisteringAdmin.style';
import {User, TagType, UserRole, BranchType} from '../../../types';
import {uploadImageFromGallery} from '../../../utils/cropImage/uploadImageFromGallery';
import {
  defaultDropdownOptionProps,
  defaultDropdownProps,
} from '../../../utils/dropdown/helper';
import {userNameFactory} from '../../../utils/factory/userNameFactory';
import {userRoleNameFactory} from '../../../utils/factory/userRoleNameFactory';
import {formikErrorMsgFactory} from '../../../utils/factory/formikEroorMsgFactory';
import {branchTypeNameFactory} from '../../../utils/factory/branchTypeNameFactory';
import {createUserSchema} from '../../../utils/validation/schema';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';

const initialValues: Partial<User> = {
  email: '',
  lastName: '',
  firstName: '',
  lastNameKana: '',
  firstNameKana: '',
  avatarUrl: '',
  role: UserRole.COMMON,
  employeeId: '',
  password: '',
  introduceOther: '',
  introduceTech: '',
  introduceQualification: '',
  introduceClub: '',
  introduceHobby: '',
  tags: [],
};

const UserRegisteringAdmin: React.FC = () => {
  const userRoleDropdownRef = useRef<any | null>(null);
  const branchTypeDropdownRef = useRef<any | null>(null);
  const {mutate: register, isLoading} = useAPIRegister({
    onSuccess: responseData => {
      if (responseData) {
        const password = values.password;
        Alert.alert(
          `${userNameFactory(responseData)}?????????????????????????????????????????????`,
          `???????????????: ${password}`,
        );
        resetForm();
      }
    },
    onError: err => {
      if (err.response?.status === 500) {
        Alert.alert(
          '????????????????????????????????????????????????????????????\n??????????????????????????????????????????????????????????????????????????????',
        );
        return;
      }
      Alert.alert(
        '????????????????????????????????????????????????????????????\n???????????????????????????????????????????????????',
      );
    },
  });
  const {
    values,
    setValues,
    handleChange,
    handleSubmit,
    validateForm,
    resetForm,
  } = useFormik<Partial<User>>({
    initialValues: initialValues,
    validationSchema: createUserSchema,
    enableReinitialize: true,
    onSubmit: v => register(v),
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
  const {width: windowWidth} = useWindowDimensions();
  const {data: tags} = useAPIGetUserTag();
  const [visibleTagModal, setVisibleTagModal] = useState(false);
  const {selectedTagType, selectTagType, filteredTags} = useTagType(
    'All',
    tags,
  );
  const {filteredTags: techTags} = useTagType(TagType.TECH, values?.tags || []);
  const {filteredTags: qualificationTags} = useTagType(
    TagType.QUALIFICATION,
    values?.tags || [],
  );
  const {filteredTags: clubTags} = useTagType(TagType.CLUB, values?.tags || []);
  const {filteredTags: hobbyTags} = useTagType(
    TagType.HOBBY,
    values?.tags || [],
  );
  const {mutate: uploadImage} = useAPIUploadStorage({
    onSuccess: async fileURLs => {
      setValues(v => ({...v, avatarUrl: fileURLs[0]}));
    },
    onError: () => {
      Alert.alert(
        '?????????????????????????????????????????????????????????\n????????????????????????????????????????????????',
      );
    },
  });

  const handleUploadImage = async () => {
    const {formData} = await uploadImageFromGallery({
      cropping: true,
      mediaType: 'photo',
      multiple: false,
      width: 300,
      height: 300,
    });
    if (formData) {
      uploadImage(formData);
    }
  };

  const handleOpenTagModal = (tagType: TagType) => {
    selectTagType(tagType);
    setVisibleTagModal(true);
  };

  return (
    <WholeContainer>
      <Overlay visible={isLoading} p="xl">
        <ActivityIndicator />
      </Overlay>
      <HeaderWithTextButton
        title="??????????????????"
        enableBackButton={true}
        screenForBack={'Menu'}
      />
      <TagModal
        onCompleteModal={selectedTagsInModal =>
          setValues(v => ({...v, tags: selectedTagsInModal}))
        }
        isVisible={visibleTagModal}
        tags={filteredTags || []}
        onCloseModal={() => setVisibleTagModal(false)}
        selectedTagType={selectedTagType}
        defaultSelectedTags={values.tags}
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
        onPress={() => checkValidateErrors()}>
        <Icon color="white" name="check" fontSize={32} />
      </Button>
      <Dropdown {...defaultDropdownProps} ref={userRoleDropdownRef}>
        <Dropdown.Option
          {...defaultDropdownOptionProps}
          value={UserRole.ADMIN}
          onPress={() => {
            setValues(v => ({...v, role: UserRole.ADMIN}));
          }}>
          {userRoleNameFactory(UserRole.ADMIN)}
        </Dropdown.Option>
        <Dropdown.Option
          {...defaultDropdownOptionProps}
          value={UserRole.COMMON}
          onPress={() => {
            setValues(v => ({...v, role: UserRole.COMMON}));
          }}>
          {userRoleNameFactory(UserRole.COMMON)}
        </Dropdown.Option>
        <Dropdown.Option
          {...defaultDropdownOptionProps}
          value={UserRole.COACH}
          onPress={() => {
            setValues(v => ({...v, role: UserRole.COACH}));
          }}>
          {userRoleNameFactory(UserRole.COACH)}
        </Dropdown.Option>
        <Dropdown.Option
          {...defaultDropdownOptionProps}
          value={UserRole.INTERNAL_INSTRUCTOR}
          onPress={() => {
            setValues(v => ({...v, role: UserRole.INTERNAL_INSTRUCTOR}));
          }}>
          {userRoleNameFactory(UserRole.INTERNAL_INSTRUCTOR)}
        </Dropdown.Option>
        <Dropdown.Option
          {...defaultDropdownOptionProps}
          value={UserRole.EXTERNAL_INSTRUCTOR}
          onPress={() => {
            setValues(v => ({...v, role: UserRole.EXTERNAL_INSTRUCTOR}));
          }}>
          {userRoleNameFactory(UserRole.EXTERNAL_INSTRUCTOR)}
        </Dropdown.Option>
      </Dropdown>

      <Dropdown ref={branchTypeDropdownRef} {...defaultDropdownProps}>
        <Dropdown.Option
          {...defaultDropdownOptionProps}
          value={BranchType.NON_SET}
          onPress={() => setValues(v => ({...v, branch: BranchType.NON_SET}))}>
          {branchTypeNameFactory(BranchType.NON_SET)}
        </Dropdown.Option>
        <Dropdown.Option
          {...defaultDropdownOptionProps}
          value={BranchType.TOKYO}
          onPress={() => setValues(v => ({...v, branch: BranchType.TOKYO}))}>
          {branchTypeNameFactory(BranchType.TOKYO)}
        </Dropdown.Option>
        <Dropdown.Option
          {...defaultDropdownOptionProps}
          value={BranchType.OSAKA}
          onPress={() => setValues(v => ({...v, branch: BranchType.OSAKA}))}>
          {branchTypeNameFactory(BranchType.OSAKA)}
        </Dropdown.Option>
      </Dropdown>
      <KeyboardAwareScrollView
        // eslint-disable-next-line react-native/no-inline-styles
        style={{backgroundColor: 'white'}}
        contentContainerStyle={{
          ...userRegisteringAdminStyles.scrollView,
        }}>
        <Div px="5%" bg="white">
          <Div my="2xl">
            <Image
              alignSelf="center"
              h={windowWidth * 0.4}
              w={windowWidth * 0.4}
              source={
                values.avatarUrl
                  ? {uri: values.avatarUrl}
                  : require('../../../../assets/no-image-avatar.png')
              }
              rounded="circle"
            />
            <Button
              borderless
              bg="white"
              p={'sm'}
              alignSelf="center"
              onPress={handleUploadImage}>
              <Icon
                name="edit-2"
                fontFamily={'Feather'}
                fontSize={22}
                color="blue600"
              />
              <Text fontSize={16} p={'md'} color="blue600">
                ?????????????????????
              </Text>
            </Button>
          </Div>
          <Div mb="xl">
            <Text ml={'lg'} mb={'sm'} fontSize={16}>
              ???
            </Text>
            <Input
              fontSize={16}
              value={values.lastName}
              onChangeText={t => setValues({...values, lastName: t})}
              placeholder="??????"
              autoCapitalize="none"
            />
          </Div>
          <Div mb="xl">
            <Text ml={'lg'} mb={'sm'} fontSize={16}>
              ???
            </Text>
            <Input
              fontSize={16}
              value={values.firstName}
              onChangeText={t => setValues({...values, firstName: t})}
              placeholder="??????"
              autoCapitalize="none"
            />
          </Div>
          <Div mb="xl">
            <Text ml={'lg'} mb={'sm'} fontSize={16}>
              ??????
            </Text>
            <Input
              fontSize={16}
              value={values.lastNameKana}
              onChangeText={handleChange('lastNameKana')}
              placeholder="?????????"
              autoCapitalize="none"
            />
          </Div>
          <Div mb="xl">
            <Text ml={'lg'} mb={'sm'} fontSize={16}>
              ??????
            </Text>
            <Input
              fontSize={16}
              value={values.firstNameKana}
              onChangeText={handleChange('firstNameKana')}
              placeholder="?????????"
              autoCapitalize="none"
            />
          </Div>
          <Div mb="xl">
            <Text ml={'lg'} mb={'sm'} fontSize={16}>
              ?????????????????????
            </Text>
            <Input
              fontSize={16}
              value={values.email}
              onChangeText={t => setValues({...values, email: t})}
              placeholder="bold@example.com"
              autoCapitalize="none"
            />
          </Div>
          <Div mb="xl">
            <Text ml={'lg'} mb={'sm'} fontSize={16}>
              ????????????
            </Text>
            <Input
              fontSize={16}
              value={values.phone}
              onChangeText={t => setValues({...values, phone: t})}
              placeholder="000-0000-0000"
              autoCapitalize="none"
            />
          </Div>
          <Div mb="xl">
            <Text ml={'lg'} mb={'sm'} fontSize={16}>
              ????????????
            </Text>
            <DropdownOpenerButton
              fontSize={16}
              onPress={() => {
                userRoleDropdownRef.current?.open();
              }}
              name={values.role ? userRoleNameFactory(values.role) : '?????????'}
            />
          </Div>
          <Div mb="xl">
            <Text ml={'lg'} mb={'sm'} fontSize={16}>
              ????????????
            </Text>
            <DropdownOpenerButton
              fontSize={16}
              name={branchTypeNameFactory(values.branch || BranchType.NON_SET)}
              onPress={() => branchTypeDropdownRef.current?.open()}
            />
          </Div>
          <Div mb="xl">
            <Text ml={'lg'} mb={'sm'} fontSize={16}>
              ???????????????
            </Text>
            <Input
              fontSize={16}
              value={values.employeeId || ''}
              onChangeText={t => setValues({...values, employeeId: t})}
              autoCapitalize="none"
            />
          </Div>
          <Div mb="xl">
            <Text ml={'lg'} mb={'sm'} fontSize={16}>
              ???????????????
            </Text>
            <Input
              fontSize={16}
              value={values.password}
              onChangeText={t => setValues({...values, password: t})}
              placeholder="8???????????????????????????????????????"
              autoCapitalize="none"
            />
          </Div>
          <Div mb="xl">
            <Text ml={'lg'} mb={'sm'} fontSize={16}>
              ????????????
            </Text>
            <TextInput
              value={values.introduceOther}
              onChangeText={t => setValues({...values, introduceOther: t})}
              multiline={true}
              placeholder="???????????????????????????????????????????????????????????????????????????"
              autoCapitalize="none"
              style={userRegisteringAdminStyles.textArea}
            />
          </Div>
          <Div mb="xl">
            <Text ml={'lg'} mb={'sm'} fontSize={16}>
              ???????????????
            </Text>
            <TagEditLine
              onPressRightButton={() => handleOpenTagModal(TagType.TECH)}
              tags={techTags || []}
              tagType={TagType.TECH}
            />
            <TextInput
              value={values.introduceTech}
              onChangeText={t => setValues({...values, introduceTech: t})}
              multiline={true}
              placeholder="???????????????????????????????????????????????????????????????"
              autoCapitalize="none"
              style={userRegisteringAdminStyles.textArea}
            />
          </Div>
          <Div mb="xl">
            <Text ml={'lg'} mb={'sm'} fontSize={16}>
              ???????????????
            </Text>
            <TagEditLine
              onPressRightButton={() =>
                handleOpenTagModal(TagType.QUALIFICATION)
              }
              tags={qualificationTags || []}
              tagType={TagType.QUALIFICATION}
            />
            <TextInput
              value={values.introduceQualification}
              onChangeText={t =>
                setValues({...values, introduceQualification: t})
              }
              multiline={true}
              placeholder="???????????????????????????????????????????????????????????????"
              autoCapitalize="none"
              style={userRegisteringAdminStyles.textArea}
            />
          </Div>
          <Div mb="xl">
            <Text ml={'lg'} mb={'sm'} fontSize={16}>
              ??????????????????
            </Text>
            <TagEditLine
              onPressRightButton={() => handleOpenTagModal(TagType.CLUB)}
              tags={clubTags || []}
              tagType={TagType.CLUB}
            />
            <TextInput
              value={values.introduceClub}
              onChangeText={t => setValues({...values, introduceClub: t})}
              multiline={true}
              placeholder="??????????????????????????????????????????????????????????????????"
              autoCapitalize="none"
              style={userRegisteringAdminStyles.textArea}
            />
          </Div>
          <Div mb="xl">
            <Text ml={'lg'} mb={'sm'} fontSize={16}>
              ???????????????
            </Text>
            <TagEditLine
              onPressRightButton={() => handleOpenTagModal(TagType.HOBBY)}
              tags={hobbyTags || []}
              tagType={TagType.HOBBY}
            />
            <TextInput
              value={values.introduceHobby}
              onChangeText={t => setValues({...values, introduceHobby: t})}
              multiline={true}
              placeholder="???????????????????????????????????????????????????????????????"
              autoCapitalize="none"
              style={userRegisteringAdminStyles.textArea}
            />
          </Div>
        </Div>
      </KeyboardAwareScrollView>
    </WholeContainer>
  );
};

export default UserRegisteringAdmin;

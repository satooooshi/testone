import {useIsFocused} from '@react-navigation/native';
import {useFormik} from 'formik';
import React, {useEffect, useState, useRef} from 'react';
import {
  ActivityIndicator,
  Alert,
  TextInput,
  useWindowDimensions,
} from 'react-native';
import {
  Text,
  Div,
  Input,
  Button,
  Icon,
  Overlay,
  Radio,
  Dropdown,
} from 'react-native-magnus';
import DropdownOpenerButton from '../../../components/common/DropdownOpenerButton';
import TagModal from '../../../components/common/TagModal';
import HeaderWithTextButton from '../../../components/Header';
import TagEditLine from '../../../components/TagEditLine';
import WholeContainer from '../../../components/WholeContainer';
import {useAPIUploadStorage} from '../../../hooks/api/storage/useAPIUploadStorage';
import {useAPIGetUserTag} from '../../../hooks/api/tag/useAPIGetUserTag';
import {useAPIGetProfile} from '../../../hooks/api/user/useAPIGetProfile';
import {useAPIUpdateUser} from '../../../hooks/api/user/useAPIUpdateUser';
import {useTagType} from '../../../hooks/tag/useTagType';
import {profileStyles} from '../../../styles/screen/account/profile.style';
import {TagType, User, BranchType} from '../../../types';
import {uploadImageFromGallery} from '../../../utils/cropImage/uploadImageFromGallery';
import {formikErrorMsgFactory} from '../../../utils/factory/formikEroorMsgFactory';
import {branchTypeNameFactory} from '../../../utils/factory/branchTypeNameFactory';
import {profileSchema} from '../../../utils/validation/schema';
import UserAvatar from '../../../components/common/UserAvatar';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {
  defaultDropdownProps,
  defaultDropdownOptionProps,
} from '../../../utils/dropdown/helper';
import {useIsTabBarVisible} from '../../../contexts/bottomTab/useIsTabBarVisible';

const initialValues: Partial<User> = {
  email: '',
  phone: '',
  lastName: '',
  firstName: '',
  lastNameKana: '',
  firstNameKana: '',
  avatarUrl: '',
  branch: BranchType.NON_SET,
  introduceOther: '',
  introduceTech: '',
  introduceQualification: '',
  introduceClub: '',
  introduceHobby: '',
  tags: [],
};

const Profile: React.FC = () => {
  const {
    data: profile,
    refetch,
    isLoading: loadingProfile,
  } = useAPIGetProfile();
  const isFocused = useIsFocused();
  const {setIsTabBarVisible} = useIsTabBarVisible();
  const {mutate: updateUser, isLoading: loadingUpdate} = useAPIUpdateUser({
    onSuccess: responseData => {
      if (responseData) {
        Alert.alert('???????????????????????????????????????');
      }
    },
    onError: () => {
      Alert.alert(
        '??????????????????????????????????????????????????????????????????\n???????????????????????????????????????????????????',
      );
    },
  });
  const {values, setValues, handleChange, handleSubmit, validateForm} =
    useFormik<Partial<User>>({
      initialValues: profile || initialValues,
      enableReinitialize: true,
      validationSchema: profileSchema,
      onSubmit: v => updateUser(v),
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
  const dropdownRef = useRef<any | null>(null);
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

  useEffect(() => {
    if (isFocused) {
      refetch();
      setIsTabBarVisible(false);
    } else {
      setIsTabBarVisible(true);
    }
  }, [isFocused, refetch, setIsTabBarVisible]);

  return (
    <WholeContainer>
      <Overlay visible={loadingProfile || loadingUpdate} p="xl">
        <ActivityIndicator />
      </Overlay>
      <HeaderWithTextButton
        title={'????????????????????????'}
        enableBackButton={true}
        activeTabName={'????????????????????????'}
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
      {values && (
        <KeyboardAwareScrollView
          // eslint-disable-next-line react-native/no-inline-styles
          style={{backgroundColor: 'white'}}
          extraScrollHeight={50}>
          <Div px={'5%'} bg="white">
            <Div my="2xl" alignSelf="center">
              <UserAvatar
                h={windowWidth * 0.4}
                w={windowWidth * 0.4}
                user={values}
                onPress={() => {}}
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
                ?????????????????????
              </Text>
              <Input
                fontSize={16}
                value={values.email}
                onChangeText={handleChange('email')}
                placeholder="bold@example.com"
                autoCapitalize="none"
              />
              <Div row>
                <Div row alignItems="center" mr="sm">
                  <Text>??????</Text>
                  {/* @ts-ignore */}
                  <Radio
                    value={1}
                    activeColor="green500"
                    onChange={() =>
                      setValues(e => ({...e, isEmailPublic: true}))
                    }
                    checked={values.isEmailPublic}
                  />
                </Div>
                <Div row alignItems="center">
                  <Text>?????????</Text>
                  {/* @ts-ignore */}
                  <Radio
                    value={2}
                    activeColor="green500"
                    onChange={() =>
                      setValues(e => ({...e, isEmailPublic: false}))
                    }
                    checked={!values.isEmailPublic}
                  />
                </Div>
              </Div>
            </Div>
            <Div mb="xl">
              <Text ml={'lg'} mb={'sm'} fontSize={16}>
                ????????????
              </Text>
              <Input
                fontSize={16}
                value={values.phone}
                onChangeText={handleChange('phone')}
                placeholder="000-0000-0000"
                autoCapitalize="none"
              />
              <Div row>
                <Div row alignItems="center" mr="sm">
                  <Text>??????</Text>
                  {/* @ts-ignore */}
                  <Radio
                    value={1}
                    activeColor="green500"
                    onChange={() =>
                      setValues(e => ({...e, isPhonePublic: true}))
                    }
                    checked={values.isPhonePublic}
                  />
                </Div>
                <Div row alignItems="center">
                  <Text>?????????</Text>
                  {/* @ts-ignore */}
                  <Radio
                    value={2}
                    activeColor="green500"
                    onChange={() =>
                      setValues(e => ({...e, isPhonePublic: false}))
                    }
                    checked={!values.isPhonePublic}
                  />
                </Div>
              </Div>
            </Div>
            {/* <Div mb="xl">
              <Text ml={'lg'} mb={'sm'} fontSize={16}>
                ???
              </Text>
              <Input
                fontSize={16}
                value={values.lastName}
                onChangeText={handleChange('lastName')}
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
                onChangeText={handleChange('firstName')}
                placeholder="??????"
                autoCapitalize="none"
              />
            </Div>
            <Div mb="xl">
              <Text ml={'lg'} mb={'sm'} fontSize={16}>
                ???(????????????)
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
                ???(????????????)
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
                ????????????
              </Text>
              <DropdownOpenerButton
                fontSize={16}
                name={branchTypeNameFactory(
                  values.branch || BranchType.NON_SET,
                )}
                onPress={() => dropdownRef.current?.open()}
              />
            </Div>
            <Dropdown ref={dropdownRef} {...defaultDropdownProps}>
              <Dropdown.Option
                {...defaultDropdownOptionProps}
                value={BranchType.NON_SET}
                onPress={() =>
                  setValues(v => ({...v, branch: BranchType.NON_SET}))
                }>
                {branchTypeNameFactory(BranchType.NON_SET)}
              </Dropdown.Option>
              <Dropdown.Option
                {...defaultDropdownOptionProps}
                value={BranchType.TOKYO}
                onPress={() =>
                  setValues(v => ({...v, branch: BranchType.TOKYO}))
                }>
                {branchTypeNameFactory(BranchType.TOKYO)}
              </Dropdown.Option>
              <Dropdown.Option
                {...defaultDropdownOptionProps}
                value={BranchType.OSAKA}
                onPress={() =>
                  setValues(v => ({...v, branch: BranchType.OSAKA}))
                }>
                {branchTypeNameFactory(BranchType.OSAKA)}
              </Dropdown.Option>
            </Dropdown> */}
            <Div mb="xl">
              <Text ml={'lg'} mb={'sm'} fontSize={16}>
                ????????????
              </Text>
              <TextInput
                textAlignVertical="top"
                value={values.introduceOther}
                onChangeText={handleChange('introduceOther')}
                multiline={true}
                placeholder="???????????????????????????????????????????????????????????????????????????"
                autoCapitalize="none"
                style={profileStyles.textArea}
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
                textAlignVertical="top"
                value={values.introduceTech}
                onChangeText={handleChange('introduceTech')}
                multiline={true}
                placeholder="???????????????????????????????????????????????????????????????"
                autoCapitalize="none"
                style={profileStyles.textArea}
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
                onChangeText={handleChange('introduceQualification')}
                multiline={true}
                textAlignVertical="top"
                placeholder="???????????????????????????????????????????????????????????????"
                autoCapitalize="none"
                style={profileStyles.textArea}
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
                onChangeText={handleChange('introduceClub')}
                multiline={true}
                textAlignVertical="top"
                placeholder="??????????????????????????????????????????????????????????????????"
                autoCapitalize="none"
                style={profileStyles.textArea}
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
                onChangeText={handleChange('introduceHobby')}
                multiline={true}
                textAlignVertical="top"
                placeholder="???????????????????????????????????????????????????????????????"
                autoCapitalize="none"
                style={profileStyles.textArea}
              />
            </Div>
          </Div>
        </KeyboardAwareScrollView>
      )}
    </WholeContainer>
  );
};

export default Profile;

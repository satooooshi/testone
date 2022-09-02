import {useIsFocused, useNavigation} from '@react-navigation/native';
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
  Image,
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
import {ProfileNavigationProps} from '../../../types/navigator/drawerScreenProps/account';
import {uploadImageFromGallery} from '../../../utils/cropImage/uploadImageFromGallery';
import {formikErrorMsgFactory} from '../../../utils/factory/formikEroorMsgFactory';
import {branchTypeNameFactory} from '../../../utils/factory/branchTypeNameFactory';
import {profileSchema} from '../../../utils/validation/schema';
import {Tab} from '../../../components/Header/HeaderTemplate';
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
  const navigation = useNavigation<ProfileNavigationProps>();
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
        Alert.alert('プロフィールを更新しました');
      }
    },
    onError: () => {
      Alert.alert(
        'プロフィールの更新中にエラーが発生しました。\n時間をおいて再度実行してください。',
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
        'アップロード中にエラーが発生しました。\n時間をおいて再実行してください。',
      );
    },
  });
  const tabs: Tab[] = [
    {
      name: 'アカウント情報',
      onPress: () => navigation.navigate('AccountStack', {screen: 'MyProfile'}),
    },
    {
      name: 'プロフィール編集',
      onPress: () => {},
    },
    {
      name: 'パスワード更新',
      onPress: () =>
        navigation.navigate('AccountStack', {screen: 'UpdatePassword'}),
    },
  ];

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
        title={'Account'}
        tabs={tabs}
        activeTabName={'プロフィール編集'}
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
          extraScrollHeight={50}
          contentContainerStyle={{
            ...profileStyles.scrollView,
          }}>
          <Div px={'5%'} bg="white">
            <Div my="lg" alignSelf="center">
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
                  写真を編集する
                </Text>
              </Button>
            </Div>
            <Div mb="xl">
              <Text ml={'lg'} mb={'sm'} fontSize={16}>
                メールアドレス
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
                  <Text>公開</Text>
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
                  <Text>非公開</Text>
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
                電話番号
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
                  <Text>公開</Text>
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
                  <Text>非公開</Text>
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
            <Div mb="xl">
              <Text ml={'lg'} mb={'sm'} fontSize={16}>
                姓
              </Text>
              <Input
                fontSize={16}
                value={values.lastName}
                onChangeText={handleChange('lastName')}
                placeholder="山田"
                autoCapitalize="none"
              />
            </Div>
            <Div mb="xl">
              <Text ml={'lg'} mb={'sm'} fontSize={16}>
                名
              </Text>
              <Input
                fontSize={16}
                value={values.firstName}
                onChangeText={handleChange('firstName')}
                placeholder="太郎"
                autoCapitalize="none"
              />
            </Div>
            <Div mb="xl">
              <Text ml={'lg'} mb={'sm'} fontSize={16}>
                姓(フリガナ)
              </Text>
              <Input
                fontSize={16}
                value={values.lastNameKana}
                onChangeText={handleChange('lastNameKana')}
                placeholder="ヤマダ"
                autoCapitalize="none"
              />
            </Div>
            <Div mb="xl">
              <Text ml={'lg'} mb={'sm'} fontSize={16}>
                名(フリガナ)
              </Text>
              <Input
                fontSize={16}
                value={values.firstNameKana}
                onChangeText={handleChange('firstNameKana')}
                placeholder="タロウ"
                autoCapitalize="none"
              />
            </Div>
            <Div mb="xl">
              <Text ml={'lg'} mb={'sm'} fontSize={16}>
                所属支社
              </Text>
              <DropdownOpenerButton
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
            </Dropdown>
            <Div mb="xl">
              <Text ml={'lg'} mb={'sm'} fontSize={16}>
                自己紹介
              </Text>
              <TextInput
                textAlignVertical="top"
                value={values.introduceOther}
                onChangeText={handleChange('introduceOther')}
                multiline={true}
                placeholder="新しく入社した山田太郎です。よろしくお願いします！"
                autoCapitalize="none"
                style={profileStyles.textArea}
              />
            </Div>
            <Div mb="xl">
              <TagEditLine
                onPressRightButton={() => handleOpenTagModal(TagType.TECH)}
                tags={techTags || []}
                tagType={TagType.TECH}
              />

              <Text ml={'lg'} mb={'sm'} fontSize={16}>
                技術の紹介
              </Text>
              <TextInput
                textAlignVertical="top"
                value={values.introduceTech}
                onChangeText={handleChange('introduceTech')}
                multiline={true}
                placeholder="自分の技術についての紹介を入力してください"
                autoCapitalize="none"
                style={profileStyles.textArea}
              />
            </Div>
            <Div mb="xl">
              <TagEditLine
                onPressRightButton={() =>
                  handleOpenTagModal(TagType.QUALIFICATION)
                }
                tags={qualificationTags || []}
                tagType={TagType.QUALIFICATION}
              />
              <Text ml={'lg'} mb={'sm'} fontSize={16}>
                資格の紹介
              </Text>
              <TextInput
                value={values.introduceQualification}
                onChangeText={handleChange('introduceQualification')}
                multiline={true}
                textAlignVertical="top"
                placeholder="自分の資格についての紹介を入力してください"
                autoCapitalize="none"
                style={profileStyles.textArea}
              />
            </Div>
            <Div mb="xl">
              <TagEditLine
                onPressRightButton={() => handleOpenTagModal(TagType.CLUB)}
                tags={clubTags || []}
                tagType={TagType.CLUB}
              />
              <Text ml={'lg'} mb={'sm'} fontSize={16}>
                部活動の紹介
              </Text>
              <TextInput
                value={values.introduceClub}
                onChangeText={handleChange('introduceClub')}
                multiline={true}
                textAlignVertical="top"
                placeholder="自分の部活動についての紹介を入力してください"
                autoCapitalize="none"
                style={profileStyles.textArea}
              />
            </Div>
            <Div mb="xl">
              <TagEditLine
                onPressRightButton={() => handleOpenTagModal(TagType.HOBBY)}
                tags={hobbyTags || []}
                tagType={TagType.HOBBY}
              />
              <Text ml={'lg'} mb={'sm'} fontSize={16}>
                趣味の紹介
              </Text>
              <TextInput
                value={values.introduceHobby}
                onChangeText={handleChange('introduceHobby')}
                multiline={true}
                textAlignVertical="top"
                placeholder="自分の趣味についての紹介を入力してください"
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

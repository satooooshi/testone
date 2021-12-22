import {useIsFocused, useNavigation} from '@react-navigation/native';
import {useFormik} from 'formik';
import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import {
  Text,
  Div,
  ScrollDiv,
  Input,
  Button,
  Icon,
  Overlay,
} from 'react-native-magnus';
import TagModal from '../../../components/common/TagModal';
import HeaderWithTextButton from '../../../components/Header';
import TagEditLine from '../../../components/TagEditLine';
import WholeContainer from '../../../components/WholeContainer';
import {useAPIUploadStorage} from '../../../hooks/api/storage/useAPIUploadStorage';
import {useAPIGetUserTag} from '../../../hooks/api/tag/useAPIGetUserTag';
import {useAPIGetProfile} from '../../../hooks/api/user/useAPIGetProfile';
import {useAPIUpdateUser} from '../../../hooks/api/user/useAPIUpdateUser';
import {useSelectedTags} from '../../../hooks/tag/useSelectedTags';
import {useTagType} from '../../../hooks/tag/useTagType';
import {profileStyles} from '../../../styles/screen/account/profile.style';
import {TagType, User} from '../../../types';
import {ProfileNavigationProps} from '../../../types/navigator/drawerScreenProps/account';
import {uploadImageFromGallery} from '../../../utils/cropImage/uploadImageFromGallery';
import {formikErrorMsgFactory} from '../../../utils/factory/formikEroorMsgFactory';
import {profileSchema} from '../../../utils/validation/schema';
import {Tab} from '../../../components/Header/HeaderTemplate';
import UserAvatar from '../../../components/common/UserAvatar';

const initialValues: Partial<User> = {
  email: '',
  lastName: '',
  firstName: '',
  avatarUrl: '',
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
  const {selectedTags, toggleTag, isSelected} = useSelectedTags(
    values?.tags || [],
  );
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
    }
  }, [isFocused, refetch]);

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
        <ScrollDiv
          contentContainerStyle={{
            ...profileStyles.scrollView,
            width: windowWidth * 0.9,
          }}>
          <Div my={'lg'} justifyContent="center" alignItems="center">
            <UserAvatar
              h={windowWidth * 0.6}
              w={windowWidth * 0.6}
              user={values}
              onPress={handleUploadImage}
            />
          </Div>
          <Div mb="lg">
            <Text fontSize={16} fontWeight="bold">
              メールアドレス
            </Text>
            <Input
              value={values.email}
              onChangeText={handleChange('email')}
              placeholder="bold@example.com"
              autoCapitalize="none"
            />
          </Div>
          <Div mb="lg">
            <Text fontSize={16} fontWeight="bold">
              姓
            </Text>
            <Input
              value={values.lastName}
              onChangeText={handleChange('lastName')}
              placeholder="山田"
              autoCapitalize="none"
            />
          </Div>
          <Div mb="lg">
            <Text fontSize={16} fontWeight="bold">
              名
            </Text>
            <Input
              value={values.firstName}
              onChangeText={handleChange('firstName')}
              placeholder="太郎"
              autoCapitalize="none"
            />
          </Div>
          <Div mb="lg">
            <Text fontSize={16} fontWeight="bold">
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
          <Div mb="lg">
            <TagEditLine
              onPressRightButton={() => handleOpenTagModal(TagType.TECH)}
              tags={techTags || []}
              tagType={TagType.TECH}
            />

            <Text fontSize={16} fontWeight="bold">
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
          <Div mb="lg">
            <TagEditLine
              onPressRightButton={() =>
                handleOpenTagModal(TagType.QUALIFICATION)
              }
              tags={qualificationTags || []}
              tagType={TagType.QUALIFICATION}
            />
            <Text fontSize={16} fontWeight="bold">
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
          <Div mb="lg">
            <TagEditLine
              onPressRightButton={() => handleOpenTagModal(TagType.CLUB)}
              tags={clubTags || []}
              tagType={TagType.CLUB}
            />
            <Text fontSize={16} fontWeight="bold">
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
          <Div mb="lg">
            <TagEditLine
              onPressRightButton={() => handleOpenTagModal(TagType.HOBBY)}
              tags={hobbyTags || []}
              tagType={TagType.HOBBY}
            />
            <Text fontSize={16} fontWeight="bold">
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
        </ScrollDiv>
      )}
    </WholeContainer>
  );
};

export default Profile;

import {useIsFocused} from '@react-navigation/native';
import {useFormik} from 'formik';
import React, {useEffect, useState} from 'react';
import {
  Alert,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import {
  Text,
  Div,
  Image,
  ScrollDiv,
  Input,
  Button,
  Icon,
} from 'react-native-magnus';
import TagModal from '../../../components/common/TagModal';
import AppHeader, {Tab} from '../../../components/Header';
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
import {ProfileProps} from '../../../types/navigator/screenProps/Account';
import {uploadImageFromGallery} from '../../../utils/cropImage/uploadImageFromGallery';
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
};

const Profile: React.FC<ProfileProps> = ({navigation}) => {
  const {data: profile, refetch} = useAPIGetProfile();
  const isFocused = useIsFocused();
  const {mutate: updateUser} = useAPIUpdateUser({
    onSuccess: responseData => {
      if (responseData) {
        Alert.alert('プロフィールを更新しました');
      }
    },
  });
  const {values, setValues, handleSubmit} = useFormik<Partial<User>>({
    initialValues: profile || initialValues,
    enableReinitialize: true,
    onSubmit: v => updateUser(v),
  });
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
      console.log(fileURLs[0]);
      setValues(v => ({...v, avatarUrl: fileURLs[0]}));
    },
  });
  const tabs: Tab[] = [
    {
      name: 'アカウント情報',
      onPress: () => navigation.navigate('AccountDetail'),
    },
    {
      name: 'プロフィール編集',
      onPress: () => {},
    },
    {
      name: 'パスワード更新',
      onPress: () => {},
    },
  ];

  const handleUploadImage = async () => {
    const {formData} = await uploadImageFromGallery();
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

  useEffect(() => {
    setValues(v => ({...v, tags: selectedTags}));
  }, [selectedTags, setValues]);

  return (
    <WholeContainer>
      <AppHeader
        title={'Account'}
        tabs={tabs}
        activeTabName={'プロフィール編集'}
      />
      <TagModal
        isVisible={visibleTagModal}
        tags={filteredTags || []}
        onCloseModal={() => setVisibleTagModal(false)}
        onPressTag={toggleTag}
        isSelected={isSelected}
        selectedTagType={selectedTagType}
        selectTagType={selectTagType}
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
      {profile && (
        <ScrollDiv
          contentContainerStyle={{
            ...profileStyles.scrollView,
            width: windowWidth * 0.9,
          }}>
          <TouchableOpacity onPress={handleUploadImage}>
            <Image
              alignSelf="center"
              mt={'lg'}
              h={windowWidth * 0.6}
              w={windowWidth * 0.6}
              source={{uri: values.avatarUrl}}
              rounded="circle"
              mb={'lg'}
            />
          </TouchableOpacity>
          <Div mb="lg">
            <Text fontSize={16} fontWeight="bold">
              メールアドレス
            </Text>
            <Input
              value={values.email}
              onChangeText={t => setValues({...values, email: t})}
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
              onChangeText={t => setValues({...values, lastName: t})}
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
              onChangeText={t => setValues({...values, firstName: t})}
              placeholder="太郎"
              autoCapitalize="none"
            />
          </Div>
          <Div mb="lg">
            <Text fontSize={16} fontWeight="bold">
              自己紹介
            </Text>
            <TextInput
              value={values.introduceOther}
              onChangeText={t => setValues({...values, introduceOther: t})}
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
              value={values.introduceTech}
              onChangeText={t => setValues({...values, introduceTech: t})}
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
              onChangeText={t =>
                setValues({...values, introduceQualification: t})
              }
              multiline={true}
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
              onChangeText={t => setValues({...values, introduceClub: t})}
              multiline={true}
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
              onChangeText={t => setValues({...values, introduceHobby: t})}
              multiline={true}
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

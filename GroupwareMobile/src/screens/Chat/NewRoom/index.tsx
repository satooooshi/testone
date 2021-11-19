import {useFormik} from 'formik';
import React, {useEffect, useState} from 'react';
import {Alert, TouchableOpacity, useWindowDimensions} from 'react-native';
import {
  Button,
  Div,
  Icon,
  Image,
  Input,
  ScrollDiv,
  Text,
  Tag as TagButton,
} from 'react-native-magnus';
import UserModal from '../../../components/common/UserModal';
import AppHeader from '../../../components/Header';
import WholeContainer from '../../../components/WholeContainer';
import {useAPISaveChatGroup} from '../../../hooks/api/chat/useAPISaveChatGroup';
import {useAPIUploadStorage} from '../../../hooks/api/storage/useAPIUploadStorage';
import {useAPIGetUsers} from '../../../hooks/api/user/useAPIGetUsers';
import {useSelectedUsers} from '../../../hooks/user/useSelectedUsers';
import {useUserRole} from '../../../hooks/user/useUserRole';
import {newRoomStyles} from '../../../styles/screen/chat/newRoom.style';
import {ChatGroup} from '../../../types';
import {NewRoomProps} from '../../../types/navigator/screenProps/Chat';
import {uploadImageFromGallery} from '../../../utils/cropImage/uploadImageFromGallery';
import {userNameFactory} from '../../../utils/factory/userNameFactory';
import {savingRoomSchema} from '../../../utils/validation/schema';

const NewRoom: React.FC<NewRoomProps> = ({navigation}) => {
  const {width: windowWidth} = useWindowDimensions();
  const {mutate: uploadImage} = useAPIUploadStorage();
  const [visibleUserModal, setVisibleUserModal] = useState(false);
  const {data: users} = useAPIGetUsers();
  const initialValues: Partial<ChatGroup> = {
    name: '',
    imageURL: '',
    members: [],
  };
  const {values, handleSubmit, setValues} = useFormik({
    initialValues,
    onSubmit: submittedValues => {
      createGroup(submittedValues);
    },
    validationSchema: savingRoomSchema,
  });
  const {mutate: createGroup} = useAPISaveChatGroup({
    onSuccess: () => {
      Alert.alert('チャットルームの作成が完了しました。', undefined, [
        {
          text: 'OK',
          onPress: () => {
            navigation.navigate('RoomList', {needRefetch: true});
          },
        },
      ]);
    },
  });
  const {
    selectedUsers,
    toggleUser,
    isSelected: isSelectedUser,
  } = useSelectedUsers(values.members || []);
  const {selectedUserRole, selectUserRole, filteredUsers} = useUserRole(
    'All',
    users,
  );
  const handleUploadImage = async () => {
    const {formData} = await uploadImageFromGallery();
    if (formData) {
      uploadImage(formData, {
        onSuccess: imageURL => {
          setValues(v => ({...v, imageURL: imageURL[0]}));
        },
      });
    }
  };

  useEffect(() => {
    if (selectedUsers && selectedUsers.length) {
      setValues(v => ({...v, members: selectedUsers}));
    }
  }, [selectedUsers, setValues]);

  return (
    <WholeContainer>
      <UserModal
        isVisible={visibleUserModal}
        users={filteredUsers || []}
        onCloseModal={() => setVisibleUserModal(false)}
        onPressUser={toggleUser}
        isSelected={isSelectedUser}
        selectedUserRole={selectedUserRole}
        selectUserRole={selectUserRole}
      />
      <AppHeader title={'ルーム新規作成'} />
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
      <ScrollDiv
        contentContainerStyle={{
          ...newRoomStyles.scrollView,
          width: windowWidth * 0.9,
        }}>
        <TouchableOpacity onPress={handleUploadImage}>
          <Image
            alignSelf="center"
            mt={'lg'}
            h={windowWidth * 0.6}
            w={windowWidth * 0.6}
            source={
              values.imageURL
                ? {uri: values.imageURL}
                : require('../../../../assets/no-image.jpg')
            }
            rounded="circle"
            mb={'lg'}
          />
        </TouchableOpacity>
        <Div mb="lg">
          <Text fontSize={16} fontWeight="bold">
            ルーム名
          </Text>
          <Input
            value={values.name}
            onChangeText={t => setValues({...values, name: t})}
            placeholder="ルーム名を入力してください"
            autoCapitalize="none"
          />
        </Div>
        <Div mb="lg">
          <Button
            w={'100%'}
            mb="lg"
            onPress={() => setVisibleUserModal(true)}
            bg="pink600"
            fontWeight="bold">
            メンバーを編集
          </Button>
        </Div>
        <Div flexDir="row" flexWrap="wrap" mb={'lg'}>
          {values.members?.map(u => (
            <TagButton key={u.id} mr={4} mb={8} color="white" bg={'purple800'}>
              {userNameFactory(u)}
            </TagButton>
          ))}
        </Div>
      </ScrollDiv>
    </WholeContainer>
  );
};

export default NewRoom;

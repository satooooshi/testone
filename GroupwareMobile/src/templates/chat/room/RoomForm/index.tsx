import {useFormik} from 'formik';
import React, {useEffect, useState} from 'react';
import {TouchableOpacity, useWindowDimensions} from 'react-native';
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
import RoomMemberModal from '../../../../components/chat/RoomMemberModal';
import HeaderWithTextButton from '../../../../components/Header';
import WholeContainer from '../../../../components/WholeContainer';
import {useAuthenticate} from '../../../../contexts/useAuthenticate';
import {useUserRole} from '../../../../hooks/user/useUserRole';
import {newRoomStyles} from '../../../../styles/screen/chat/newRoom.style';
import {ChatGroup, User} from '../../../../types';
import {uploadImageFromGallery} from '../../../../utils/cropImage/uploadImageFromGallery';
import {userNameFactory} from '../../../../utils/factory/userNameFactory';
import {savingRoomSchema} from '../../../../utils/validation/schema';

type RoomFormProps = {
  users: User[];
  headerTitle: string;
  initialRoom?: ChatGroup;
  selectedMembers?: User[];
  onSubmit: (chatGroup: Partial<ChatGroup> | ChatGroup) => void;
  onUploadImage: (
    formData: FormData,
    onSuccess: (imageUrls: string[]) => void,
  ) => void;
};

const RoomForm: React.FC<RoomFormProps> = ({
  users,
  headerTitle,
  initialRoom,
  selectedMembers,
  onSubmit,
  onUploadImage,
}) => {
  const {user: myProfile} = useAuthenticate();
  const {width: windowWidth} = useWindowDimensions();
  const [visibleUserModal, setVisibleUserModal] = useState(false);
  const [visibleOwnerModal, setVisibleOwnerModal] = useState(false);
  const [willSubmit, setWillSubmit] = useState(false);
  const initialValues: Partial<ChatGroup> = {
    name: '',
    imageURL: '',
    members: selectedMembers || [],
  };
  const {values, setValues, handleChange, handleSubmit, errors, touched} =
    useFormik({
      initialValues: initialRoom || initialValues,
      enableReinitialize: true,
      onSubmit: submittedValues => {
        onSubmit(submittedValues);
      },
      validationSchema: savingRoomSchema,
    });
  const {selectedUserRole, filteredUsers} = useUserRole('All', users);

  const handleUploadImage = async () => {
    const {formData} = await uploadImageFromGallery();
    if (formData) {
      onUploadImage(formData, imageURLs =>
        setValues(v => ({...v, imageURL: imageURLs[0]})),
      );
    }
  };

  useEffect(() => {
    if (initialRoom) {
      setValues(initialRoom);
    }
  }, [initialRoom, setValues]);

  useEffect(() => {
    const safetySubmit = async () => {
      handleSubmit();
      await new Promise(r => setTimeout(r, 1000));
      setWillSubmit(false);
    };
    if (willSubmit) {
      safetySubmit();
    }
  }, [willSubmit, handleSubmit]);

  return (
    <WholeContainer>
      <RoomMemberModal
        isChatGroupOwner={true}
        isVisible={visibleUserModal}
        users={filteredUsers?.filter(u => u.id !== myProfile?.id) || []}
        onCloseModal={() => setVisibleUserModal(false)}
        selectedUserRole={selectedUserRole}
        defaultSelectedUsers={values.members}
        onCompleteModal={selectedUsers =>
          setValues(v => ({...v, members: selectedUsers}))
        }
      />
      <RoomMemberModal
        isChatGroupOwner={true}
        isOwnerEdit={true}
        isVisible={visibleOwnerModal}
        users={
          filteredUsers?.filter(u => {
            const member = values.members?.filter(m => {
              return m.id === u.id;
            });
            if (member?.length) {
              return member;
            }
          }) || []
        }
        onCloseModal={() => setVisibleOwnerModal(false)}
        selectedUserRole={selectedUserRole}
        defaultSelectedUsers={values.owner}
        onCompleteModal={selectedUsers =>
          setValues(v => ({...v, owner: selectedUsers}))
        }
      />
      <HeaderWithTextButton enableBackButton={true} title={headerTitle} />
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
        onPress={() => setWillSubmit(true)}>
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
                : require('../../../../../assets/no-image.jpg')
            }
            rounded="circle"
            mb={'lg'}
          />
        </TouchableOpacity>
        <Div mb="lg">
          <Text fontSize={16} fontWeight="bold">
            ルーム名
          </Text>
          {errors.name && touched.name ? (
            <Text fontSize={16} color="tomato">
              {errors.name}
            </Text>
          ) : null}
          <Input
            value={values.name}
            onChangeText={handleChange('name')}
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
        {errors.members && touched.members ? (
          <Text fontSize={16} color="tomato">
            {errors.members}
          </Text>
        ) : null}
        <Div flexDir="row" flexWrap="wrap" mb={'lg'}>
          {values.members?.map(u => (
            <TagButton key={u.id} mr={4} mb={8} color="white" bg={'purple800'}>
              {userNameFactory(u)}
            </TagButton>
          ))}
        </Div>
        {initialRoom?.owner ? (
          <Div mb="lg">
            <Button
              w={'100%'}
              mb="lg"
              onPress={() => setVisibleOwnerModal(true)}
              bg="pink600"
              fontWeight="bold">
              オーナーを編集
            </Button>
          </Div>
        ) : null}

        <Div flexDir="row" flexWrap="wrap" mb={'lg'}>
          {values.owner?.map(u => (
            <TagButton key={u.id} mr={4} mb={8} color="white" bg={'purple800'}>
              {userNameFactory(u)}
            </TagButton>
          ))}
        </Div>
      </ScrollDiv>
    </WholeContainer>
  );
};

export default RoomForm;

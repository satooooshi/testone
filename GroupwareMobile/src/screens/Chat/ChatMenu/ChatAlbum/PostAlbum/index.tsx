import {useNavigation, useRoute} from '@react-navigation/native';
import React from 'react';
import {useAPICreateChatAlbum} from '../../../../../hooks/api/chat/album/useAPICreateChatAlbum';
import {useAPIUploadStorage} from '../../../../../hooks/api/storage/useAPIUploadStorage';
import {
  ChatRouteProps,
  PostChatAlbumsNavigationProps,
} from '../../../../../types/navigator/drawerScreenProps';
import ChatAlbumForm from '../../../../../templates/chat/album/ChatAlbumForm';
import {Alert} from 'react-native';
import {AxiosError} from 'axios';

const PostChatAlbum: React.FC = () => {
  const {mutate: createChatAlbum} = useAPICreateChatAlbum();
  const navigation = useNavigation<PostChatAlbumsNavigationProps>();
  const {mutate: onUploadImage} = useAPIUploadStorage();
  const {room} = useRoute<ChatRouteProps>().params;

  return (
    <ChatAlbumForm
      room={room}
      onSubmit={submittedValues =>
        createChatAlbum(submittedValues, {
          onSuccess: () =>
            navigation.navigate('ChatStack', {
              screen: 'ChatAlbums',
              params: {room},
            }),
          onError: err => {
            if (err.response?.data) {
              Alert.alert((err.response?.data as AxiosError)?.message);
            }
          },
        })
      }
      uploadImage={onUploadImage}
    />
  );
};

export default PostChatAlbum;

import {useNavigation, useRoute} from '@react-navigation/native';
import React from 'react';
import {useAPIUploadStorage} from '../../../../../hooks/api/storage/useAPIUploadStorage';
import {ChatAlbum} from '../../../../../types';
import {
  ChatRouteProps,
  EditChatAlbumRouteProps,
  PostChatAlbumsNavigationProps,
} from '../../../../../types/navigator/drawerScreenProps';
import {useAPIUpdateAlbum} from '../../../../../hooks/api/chat/album/useAPIUpdateChatAlbum';
import ChatAlbumForm from '../../../../../templates/chat/album/ChatAlbumForm';
import {Alert} from 'react-native';
import {AxiosError} from 'axios';

const EditChatAlbum: React.FC = () => {
  const {album} = useRoute<EditChatAlbumRouteProps>().params;
  const {mutate: updateChatAlbum} = useAPIUpdateAlbum();
  const navigation = useNavigation<PostChatAlbumsNavigationProps>();
  const {mutate: onUploadImage} = useAPIUploadStorage();
  const {room} = useRoute<ChatRouteProps>().params;

  return (
    <ChatAlbumForm
      album={album}
      room={room}
      onSubmit={submittedValues =>
        updateChatAlbum(submittedValues as ChatAlbum, {
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

export default EditChatAlbum;

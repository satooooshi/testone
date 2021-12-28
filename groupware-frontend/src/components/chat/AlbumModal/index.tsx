import React, { useState } from 'react';
import { ChatAlbum, ChatGroup } from 'src/types';
import AlbumList from './AlbumList';
import PostAlbum from './PostAlbum';
import EditAlbum from './EditAlbum';
import AlbumDetail from './AlbumDetail';

type AlbumModalProps = {
  isOpen: boolean;
  onClose: () => void;
  room: ChatGroup;
};

const AlbumModal: React.FC<AlbumModalProps> = ({ isOpen, onClose, room }) => {
  const [selectedAlbum, setSelectedAlbum] = useState<ChatAlbum>();

  const [mode, setMode] = useState<'post' | 'list' | 'edit' | 'detail'>('list');

  return (
    <>
      {mode === 'list' ? (
        <AlbumList
          isOpen={isOpen}
          onClose={onClose}
          room={room}
          onClickAlbum={(a) => {
            setMode('detail');
            setSelectedAlbum(a);
          }}
        />
      ) : selectedAlbum && mode === 'detail' ? (
        <AlbumDetail
          isOpen={isOpen}
          onClose={onClose}
          selectedAlbum={selectedAlbum}
          navigateToList={() => setMode('list')}
          onClickEdit={() => setMode('edit')}
        />
      ) : mode === 'edit' && selectedAlbum ? (
        <EditAlbum
          isOpen={isOpen}
          onClose={onClose}
          selectedAlbum={selectedAlbum}
          navigateToList={() => setMode('list')}
        />
      ) : (
        <PostAlbum
          isOpen={isOpen}
          onClose={onClose}
          room={room}
          navigateToList={() => setMode('list')}
        />
      )}
    </>
  );
};

export default AlbumModal;

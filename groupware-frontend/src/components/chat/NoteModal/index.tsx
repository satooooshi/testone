import React, { useState } from 'react';
import { ChatGroup, ChatNote } from 'src/types';
import NoteList from './NoteList';
import PostNote from './PostNote';

type NoteModalProps = {
  isOpen: boolean;
  onClose: () => void;
  room: ChatGroup;
};

const NoteModal: React.FC<NoteModalProps> = ({ isOpen, onClose, room }) => {
  const [mode, setMode] = useState<'new' | 'edit' | 'list'>('list');
  const [edittedNote, setEdittedNote] = useState<ChatNote>();

  return (
    <>
      {mode === 'new' ? (
        <PostNote
          {...{ isOpen, onClose, room }}
          navigateToList={() => setMode('list')}
        />
      ) : edittedNote && mode === 'edit' ? (
        <PostNote
          {...{ isOpen, onClose, room }}
          navigateToList={() => {
            setEdittedNote(undefined);
            setMode('list');
          }}
          note={edittedNote}
        />
      ) : (
        <NoteList
          {...{ isOpen, onClose, room }}
          onClickEdit={(n) => {
            setMode('edit');
            setEdittedNote(n);
          }}
          onClickPost={() => setMode('new')}
        />
      )}
    </>
  );
};

export default NoteModal;

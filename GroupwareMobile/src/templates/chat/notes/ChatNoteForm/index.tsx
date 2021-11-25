import {useFormik} from 'formik';
import React from 'react';
import {TextInput} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {Button, Icon} from 'react-native-magnus';
import tailwind from 'tailwind-rn';
import HeaderWithTextButton from '../../../../components/Header';
import WholeContainer from '../../../../components/WholeContainer';
import {ChatGroup, ChatNote} from '../../../../types';

type ChatNoteFormProps = {
  rightButtonNameOnHeader: string;
  room: ChatGroup;
  note?: ChatNote | Partial<ChatNote>;
  onSubmit: (note: Partial<ChatNote> | ChatNote) => void;
};

const ChatNoteForm: React.FC<ChatNoteFormProps> = ({room, note, onSubmit}) => {
  const initialValues: Partial<ChatNote> = {
    content: '',
    chatGroup: room,
    editor: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const {values, setValues, handleSubmit} = useFormik<
    ChatNote | Partial<ChatNote>
  >({
    initialValues: note || initialValues,
    onSubmit: submittedValues => onSubmit(submittedValues),
  });

  return (
    <WholeContainer>
      <HeaderWithTextButton
        title="ノート"
        rightButtonName={'更新'}
        onPressRightButton={() => handleSubmit()}
      />
      <KeyboardAwareScrollView
        contentContainerStyle={tailwind('h-full bg-white')}
        style={tailwind('h-full bg-white')}>
        <TextInput
          multiline
          placeholder="今なにしてる？"
          value={values.content}
          onChangeText={t => setValues(v => ({...v, content: t}))}
          style={tailwind(' h-full p-4')}
          autoCapitalize={'none'}
        />
        <Button
          bg="purple600"
          position="absolute"
          right={10}
          bottom={10}
          h={60}
          zIndex={20}
          rounded="circle"
          w={60}>
          <Icon
            fontSize={'6xl'}
            name="image"
            fontFamily="Entypo"
            color="white"
          />
        </Button>
      </KeyboardAwareScrollView>
    </WholeContainer>
  );
};

export default ChatNoteForm;

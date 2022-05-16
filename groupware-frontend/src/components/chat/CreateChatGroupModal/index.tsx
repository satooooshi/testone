import React, { useCallback, useRef, useState, useEffect } from 'react';
import { ChatGroup, User } from 'src/types';
import {
  Button,
  FormLabel,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  useToast,
  Text,
  Box,
  Input,
  ButtonGroup,
  IconButton,
  Avatar,
  Spinner,
} from '@chakra-ui/react';
import { useDropzone } from 'react-dropzone';
import { chatGroupSchema } from 'src/utils/validation/schema';
import { imageExtensions } from 'src/utils/imageExtensions';
import ReactCrop, { Crop } from 'react-image-crop';
import { useFormik } from 'formik';
import { getCroppedImageURL } from 'src/utils/getCroppedImageURL';
import { dataURLToFile } from 'src/utils/dataURLToFile';
import { formikErrorMsgFactory } from 'src/utils/factory/formikErrorMsgFactory';
import { useAPIUploadStorage } from '@/hooks/api/storage/useAPIUploadStorage';
import { useAPISaveChatGroup } from '@/hooks/api/chat/useAPISaveChatGroup';
import { useRouter } from 'next/router';
import { hideScrollbarCss } from 'src/utils/chakra/hideScrollBar.css';
import EditChatGroupMembersModal from '../EditChatGroupMembersModal';
import { MdCancel } from 'react-icons/md';
import { userNameFactory } from 'src/utils/factory/userNameFactory';
import { useRoomRefetch } from 'src/contexts/chat/useRoomRefetch';

type CreateChatGroupModalProps = {
  isOpen: boolean;
  closeModal: () => void;
  onComplete: () => void;
  selectedMembers: User[];
};

const CreateChatGroupModal: React.FC<CreateChatGroupModalProps> = ({
  isOpen,
  closeModal,
  onComplete,
  selectedMembers,
}) => {
  const toast = useToast();
  const initialChatValues = {
    name: '',
    members: selectedMembers,
  };
  const { setNewChatGroup } = useRoomRefetch();
  const [membersModal, setMembersModal] = useState(false);
  const [selectImageUrl, setSelectImageUrl] = useState<string>('');
  const [selectImageName, setSelectImageName] = useState<string>('');
  const [crop, setCrop] = useState<Crop>({
    unit: 'px',
    x: 130,
    y: 50,
    width: 200,
    height: 200,
    aspect: 1,
  });
  const [completedCrop, setCompletedCrop] = useState<Crop>();
  const imgRef = useRef<HTMLImageElement>();
  const [imgUploaded, setImgUploaded] = useState(false);
  const onEventImageDrop = useCallback((f: File[]) => {
    setSelectImageUrl(URL.createObjectURL(f[0]));
    setSelectImageName(f[0].name);
  }, []);
  const { getRootProps, getInputProps } = useDropzone({
    onDrop: onEventImageDrop,
    accept: imageExtensions,
  });
  const router = useRouter();

  const onLoad = useCallback((img) => {
    imgRef.current = img;
    setImgUploaded(false);
  }, []);

  const { mutate: createGroup, isLoading: loadingCreateGroup } =
    useAPISaveChatGroup({
      onSuccess: (createdData) => {
        onClose();
        setNewChatGroup(createdData);
        router.push(`/chat/${createdData.id.toString()}`, undefined, {
          shallow: true,
        });
      },
    });

  const {
    values: newGroup,
    setValues: setNewGroup,
    handleSubmit: onFinish,
    handleChange,
    resetForm,
    validateForm,
  } = useFormik<Partial<ChatGroup>>({
    initialValues: initialChatValues,
    enableReinitialize: true,
    validationSchema: chatGroupSchema,
    onSubmit: async () => {
      if (imgRef.current && completedCrop && imgUploaded === false) {
        const img = getCroppedImageURL(imgRef.current, completedCrop);
        if (!img) {
          return;
        }
        const result = await dataURLToFile(img, selectImageName);
        return uploadImage([result]);
      }
      onComplete();
      createGroup(newGroup);
    },
  });
  const { mutate: uploadImage, isLoading: loadingUpload } = useAPIUploadStorage(
    {
      onSuccess: async (fileURLs) => {
        createGroup({ ...newGroup, imageURL: fileURLs[0] });
      },
    },
  );
  const isLoading = loadingCreateGroup || loadingUpload;

  const checkErrors = async () => {
    const errors = await validateForm();
    const messages = formikErrorMsgFactory(errors);
    if (messages) {
      toast({
        description: messages,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } else {
      onFinish();
    }
  };

  const onClose = () => {
    resetForm();
    closeModal();
  };

  const removeFromSelectedMember = (member: User) => {
    const newMembers =
      newGroup.members?.filter((m) => m.id !== member.id) || [];
    setNewGroup((g) => ({ ...g, members: newMembers }));
  };

  useEffect(() => {
    setSelectImageUrl('');
    setImgUploaded(true);
  }, [newGroup]);

  return (
    <Modal onClose={onClose} scrollBehavior="inside" isOpen={isOpen}>
      <ModalOverlay />
      <ModalContent h="90vh" bg={'#f9fafb'}>
        <ModalHeader
          flexDir="row"
          justifyContent="space-between"
          display="flex"
          mr="24px">
          <Text>新しいルーム</Text>
          <Button
            size="sm"
            flexDir="row"
            onClick={checkErrors}
            mb="8px"
            colorScheme="green"
            alignItems="center">
            {isLoading ? <Spinner /> : <Text display="inline">作成</Text>}
          </Button>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <EditChatGroupMembersModal
            isOpen={membersModal}
            onClose={() => setMembersModal(false)}
            onComplete={(selected) => {
              setNewGroup((g) => ({ ...g, members: selected }));
              setMembersModal(false);
            }}
          />
          <Box overflowY="auto" css={hideScrollbarCss}>
            {selectImageUrl ? (
              <ReactCrop
                keepSelection={true}
                imageStyle={{ maxHeight: '80%' }}
                src={selectImageUrl}
                crop={crop}
                onChange={(newCrop) => setCrop(newCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                onImageLoaded={onLoad}
                circularCrop={true}
              />
            ) : (
              <>
                <FormLabel>ルーム画像</FormLabel>
                <Box
                  m="0 auto"
                  textAlign="center"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  border="3px dashed #eeeeee"
                  w="300px"
                  h="300px"
                  rounded="full"
                  cursor="pointer"
                  {...getRootProps()}>
                  <input {...getInputProps()} />
                  <Avatar
                    src={newGroup.imageURL}
                    h="100%"
                    w="100%"
                    rounded="full"
                    alt=""
                  />
                </Box>
              </>
            )}
            <Box mb="16px">
              <FormLabel>ルーム名</FormLabel>
              <Input
                type="text"
                name="name"
                w="100%"
                value={newGroup.name}
                onChange={handleChange}
                placeholder="ルーム名を入力して下さい"
              />
            </Box>
            <Box mb="16px" display="flex" flexDir="row" flexWrap="wrap">
              {newGroup.members?.map((u) => (
                <Box mr={'4px'} mb={'8px'} key={u.id}>
                  <ButtonGroup isAttached size="xs" colorScheme="purple">
                    <Button mr="-px">{userNameFactory(u)}</Button>
                    <IconButton
                      onClick={() => removeFromSelectedMember(u as User)}
                      aria-label="削除"
                      icon={<MdCancel size={18} />}
                    />
                  </ButtonGroup>
                </Box>
              ))}
              <Button
                colorScheme="pink"
                fontWeight="bold"
                w="100%"
                onClick={() => closeModal()}>
                メンバーを編集
              </Button>
            </Box>
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default CreateChatGroupModal;

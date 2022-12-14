import React, { useCallback, useEffect, useRef, useState } from 'react';
import editChatGroupModalStyles from '@/styles/components/EditChatGroupModal.module.scss';
import { ChatGroup } from 'src/types';
import {
  Text,
  Button,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Box,
  Avatar,
  Spinner,
  Stack,
} from '@chakra-ui/react';
import { useAPIUploadStorage } from '@/hooks/api/storage/useAPIUploadStorage';
import { useDropzone } from 'react-dropzone';
import ReactCrop, { Crop } from 'react-image-crop';
import { useFormik } from 'formik';
import { chatGroupSchema } from 'src/utils/validation/schema';
import { dataURLToFile } from 'src/utils/dataURLToFile';
import { getCroppedImageURL } from 'src/utils/getCroppedImageURL';
import { imageExtensions } from 'src/utils/imageExtensions';
import { useAPIUpdateChatGroup } from '@/hooks/api/chat/useAPIUpdateChatGroup';
import { useHandleBadge } from 'src/contexts/badge/useHandleBadge';
import { socket } from '../ChatBox/socket';
import { AiOutlineDelete } from 'react-icons/ai';
import { FiEdit2 } from 'react-icons/fi';

type EditChatGroupModalProps = {
  isOpen: boolean;
  closeModal: () => void;
  chatGroup: Partial<ChatGroup>;
  onComplete: (room: ChatGroup) => void;
};

const EditChatGroupModal: React.FC<EditChatGroupModalProps> = ({
  isOpen,
  closeModal,
  chatGroup,
  onComplete,
}) => {
  const { mutate: saveGroup } = useAPIUpdateChatGroup({
    onSuccess: (data) => {
      closeModal();
      editChatGroup(data.room);
      onComplete(data.room);
      for (const msg of data.systemMessage) {
        socket.emit('message', { type: 'send', chatMessage: msg });
      }
    },
    onError: () => {
      alert('グループの更新中にエラーが発生しました');
    },
  });

  const [isDeleted, setIsDeleted] = useState<boolean>(false);
  const { editChatGroup } = useHandleBadge();
  const [selectImageUrl, setSelectImageUrl] = useState<string>('');
  const { mutate: uploadImage, isLoading } = useAPIUploadStorage({
    onSuccess: async (fileURLs) => {
      saveGroup({ ...newGroupInfo, imageURL: fileURLs[0] } as ChatGroup);
      setSelectImageUrl('');
      setSelectImageName('');
    },
  });
  const [selectImageName, setSelectImageName] = useState<string>('');
  const [crop, setCrop] = useState<Crop>({
    unit: 'px',
    x: 130,
    y: 50,
    width: 200,
    height: 200,
    aspect: 1,
  });
  const imgRef = useRef<HTMLImageElement>();
  const onEventImageDrop = useCallback((f: File[]) => {
    setSelectImageUrl(URL.createObjectURL(f[0]));
    setSelectImageName(f[0].name);
  }, []);
  const { getRootProps, getInputProps } = useDropzone({
    onDrop: onEventImageDrop,
    accept: imageExtensions,
  });
  const onLoad = useCallback((img) => {
    imgRef.current = img;
    setIsDeleted(false);
    const diameter: number = img.height < img.width ? img.height : img.width;
    setCrop({
      unit: 'px',
      x: (img.width - diameter) / 2,
      y: (img.height - diameter) / 2,
      height: diameter,
      width: diameter,
      aspect: 1,
    });
  }, []);

  const {
    values: newGroupInfo,
    setValues: setNewGroupInfo,
    handleSubmit: onFinish,
    handleChange,
    errors,
    touched,
  } = useFormik<Partial<ChatGroup>>({
    initialValues: { name: chatGroup.name },
    validationSchema: chatGroupSchema,
    onSubmit: async () => {
      if (imgRef.current) {
        const img = getCroppedImageURL(imgRef.current, crop);
        if (!img) {
          return;
        }
        const result = await dataURLToFile(img, selectImageName);
        uploadImage([result]);
        return;
      } else {
        const newGroupInfoCopy: Partial<ChatGroup> = newGroupInfo;
        newGroupInfoCopy.imageURL = '';
        setNewGroupInfo(newGroupInfoCopy);
      }
      saveGroup(newGroupInfo as ChatGroup);
    },
  });

  const onChange = (newCrop: Crop) => {
    if (
      newCrop.height !== crop.height ||
      newCrop.width !== crop.width ||
      newCrop.y !== crop.y ||
      newCrop.x !== crop.x
    )
      setCrop(newCrop);
  };

  const onClickDeleteImage = () => {
    setIsDeleted(true);
    setSelectImageUrl('');
    imgRef.current = undefined;
  };

  useEffect(() => {
    setNewGroupInfo(chatGroup);
  }, [chatGroup, setNewGroupInfo]);

  const onClickClose = () => {
    setSelectImageUrl('');
    setSelectImageName('');
    setIsDeleted(false);
  };

  return (
    <Modal onClose={closeModal} scrollBehavior="inside" isOpen={isOpen}>
      <ModalOverlay />
      <ModalContent h="90vh" bg={'#f9fafb'}>
        <ModalHeader
          flexDir="row"
          justifyContent="space-between"
          display="flex"
          mr="24px">
          <Text>ルーム情報を編集</Text>
          <Button
            size="sm"
            flexDir="row"
            onClick={() => onFinish()}
            mb="8px"
            colorScheme="brand"
            alignItems="center">
            {isLoading ? <Spinner /> : <Text display="inline">更新</Text>}
          </Button>
        </ModalHeader>
        <ModalCloseButton onClick={() => onClickClose()} />
        <ModalBody>
          <FormLabel fontWeight="bold">ルーム画像</FormLabel>
          {selectImageUrl ? (
            <Box textAlign="center">
              <ReactCrop
                src={selectImageUrl}
                crop={crop}
                onChange={(newCrop) => onChange(newCrop)}
                onImageLoaded={onLoad}
                circularCrop={true}
                keepSelection={true}
                imageStyle={{
                  minHeight: '100px',
                  maxHeight: '300px',
                  minWidth: '100px',
                }}
              />
            </Box>
          ) : (
            <Box
              m="0 auto"
              textAlign="center"
              alignItems="center"
              justifyContent="center"
              w="200px"
              rounded="full"
              cursor="pointer"
              {...getRootProps()}>
              <input {...getInputProps()} />
              <Avatar
                src={isDeleted ? undefined : newGroupInfo.imageURL}
                h="100%"
                w="100%"
                rounded="full"
                alt=""
              />
              <Stack
                justifyContent="center"
                direction="row"
                my="8px"
                color="blue.400">
                <FiEdit2 />
                <Text fontSize="14px">画像を編集する</Text>
              </Stack>
            </Box>
          )}
          {!isDeleted && (selectImageUrl || newGroupInfo.imageURL) ? (
            <Box textAlign="center">
              <Stack
                justifyContent="center"
                direction="row"
                my="8px"
                cursor="pointer"
                color="red"
                onClick={() => onClickDeleteImage()}>
                <AiOutlineDelete />
                <Text fontSize="14px">画像を削除する</Text>
              </Stack>
            </Box>
          ) : null}
          <FormLabel>
            <FormLabel fontWeight="bold">ルーム名</FormLabel>
            {errors.name && touched.name ? (
              <Text color="tomato">{errors.name}</Text>
            ) : null}
          </FormLabel>
          <Input
            type="text"
            name="name"
            className={editChatGroupModalStyles.modal_input_name}
            mb="16px"
            px="8px"
            h="40px"
            rounded="md"
            border="1px"
            value={newGroupInfo.name}
            onChange={handleChange}
            placeholder="ルーム名を入力して下さい"
          />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default EditChatGroupModal;

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
    onSuccess: (newInfo) => {
      closeModal();
      setNewChatGroup(newInfo);
      onComplete(newInfo);
    },
  });

  const { setNewChatGroup } = useHandleBadge();
  const [selectImageUrl, setSelectImageUrl] = useState<string>('');
  const { mutate: uploadImage, isLoading } = useAPIUploadStorage({
    onSuccess: async (fileURLs) => {
      saveGroup({ ...newGroupInfo, imageURL: fileURLs[0] } as ChatGroup);
      setSelectImageUrl('');
      setSelectImageName('');
      setCompletedCrop(undefined);
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
  const [completedCrop, setCompletedCrop] = useState<Crop>();
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
      if (imgRef.current && completedCrop) {
        const img = getCroppedImageURL(imgRef.current, completedCrop);
        if (!img) {
          return;
        }
        const result = await dataURLToFile(img, selectImageName);
        uploadImage([result]);
        return;
      }
      saveGroup(newGroupInfo as ChatGroup);
    },
  });

  useEffect(() => {
    setNewGroupInfo(chatGroup);
  }, [chatGroup, setNewGroupInfo]);

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
            colorScheme="green"
            alignItems="center">
            {isLoading ? <Spinner /> : <Text display="inline">更新</Text>}
          </Button>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Box>
            <Box>
              {selectImageUrl ? (
                <ReactCrop
                  src={selectImageUrl}
                  crop={crop}
                  onChange={(newCrop) => setCrop(newCrop)}
                  onComplete={(c) => setCompletedCrop(c)}
                  onImageLoaded={onLoad}
                  circularCrop={true}
                  keepSelection={true}
                />
              ) : (
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
                    src={newGroupInfo.imageURL}
                    h="100%"
                    w="100%"
                    rounded="full"
                    alt=""
                  />
                </Box>
              )}
              <FormLabel>
                <p>ルーム名</p>
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
            </Box>
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default EditChatGroupModal;

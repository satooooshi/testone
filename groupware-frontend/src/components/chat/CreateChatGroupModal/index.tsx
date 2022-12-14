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
  Stack,
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
import { useHandleBadge } from 'src/contexts/badge/useHandleBadge';
import { AiOutlineArrowLeft, AiOutlineDelete } from 'react-icons/ai';
import { FiEdit2 } from 'react-icons/fi';

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
  const { editChatGroup } = useHandleBadge();
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
  const imgRef = useRef<HTMLImageElement>();
  const onEventImageDrop = useCallback((f: File[]) => {
    setSelectImageUrl(URL.createObjectURL(f[0]));
    setSelectImageName(f[0].name);
  }, []);
  const { getRootProps, getInputProps } = useDropzone({
    onDrop: onEventImageDrop,
    accept: imageExtensions,
  });
  const [willSubmit, setWillSubmit] = useState(false);
  const router = useRouter();

  const onLoad = useCallback((img: HTMLImageElement) => {
    imgRef.current = img;
    const radius = img.height < img.width ? img.height : img.width;
    setCrop({
      unit: 'px',
      x: (img.width - radius) / 2,
      y: (img.height - radius) / 2,
      width: radius,
      height: radius,
      aspect: 1,
    });
  }, []);

  const onChange = (newCrop: Crop) => {
    if (
      newCrop.height !== crop.height ||
      newCrop.width !== crop.width ||
      newCrop.y !== crop.y ||
      newCrop.x !== crop.x
    )
      setCrop(newCrop);
  };

  const { mutate: createGroup, isLoading: loadingCreateGroup } =
    useAPISaveChatGroup({
      onSuccess: (createdData) => {
        onClose();
        onComplete();
        editChatGroup(createdData);
        router.push(`/chat/${createdData.id.toString()}`, undefined, {
          shallow: true,
        });
      },
    });

  useEffect(() => {
    if (isOpen) {
      setWillSubmit(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    if (willSubmit) {
      onFinish();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [willSubmit]);

  const resetImageUrl = () => {
    setSelectImageUrl('');
    imgRef.current = undefined;
  };

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
      if (imgRef.current) {
        const img = getCroppedImageURL(imgRef.current, crop);
        if (!img) {
          return;
        }
        const result = await dataURLToFile(img, selectImageName);
        return uploadImage([result]);
      }
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
      setWillSubmit(true);
    }
  };

  const onClose = () => {
    resetForm();
    closeModal();
    resetImageUrl();
  };

  const removeFromSelectedMember = (member: User) => {
    const newMembers =
      newGroup.members?.filter((m) => m.id !== member.id) || [];
    setNewGroup((g) => ({ ...g, members: newMembers }));
  };

  return (
    <Modal onClose={onClose} scrollBehavior="inside" isOpen={isOpen}>
      <ModalOverlay />
      <ModalContent h="90vh" bg={'#f9fafb'} textAlign="center">
        <ModalHeader flexDir="row" display="flex" mr="24px">
          <Text>??????????????????</Text>
          <Box flex={1} />
          <Button
            size="sm"
            colorScheme="gray"
            variant="outline"
            color="gray"
            fontWeight="bold"
            onClick={() => closeModal()}>
            ??????
          </Button>
          <Button
            size="sm"
            flexDir="row"
            ml="8px"
            onClick={checkErrors}
            colorScheme="brand"
            alignItems="center">
            {isLoading ? <Spinner /> : <Text display="inline">??????</Text>}
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
            category="????????????"
          />
          <Box overflowY="auto" css={hideScrollbarCss}>
            <FormLabel fontWeight="bold">???????????????</FormLabel>
            {selectImageUrl ? (
              <Box>
                <ReactCrop
                  keepSelection={true}
                  imageStyle={{
                    minHeight: '100px',
                    maxHeight: '300px',
                    minWidth: '100px',
                  }}
                  src={selectImageUrl}
                  crop={crop}
                  onChange={(newCrop) => onChange(newCrop)}
                  onImageLoaded={onLoad}
                  circularCrop={true}
                />
                <Stack
                  justifyContent="center"
                  direction="row"
                  my="8px"
                  cursor="pointer"
                  color="red"
                  onClick={() => resetImageUrl()}>
                  <AiOutlineDelete />
                  <Text fontSize="14px">?????????????????????</Text>
                </Stack>
              </Box>
            ) : (
              <Box
                m="0 auto"
                textAlign="center"
                w="200px"
                rounded="full"
                cursor="pointer"
                {...getRootProps()}>
                <input {...getInputProps()} />
                <Avatar
                  src={newGroup.imageURL}
                  h="200px"
                  w="200px"
                  rounded="full"
                  alt=""
                />
                <Stack
                  justifyContent="center"
                  direction="row"
                  my="8px"
                  color="blue.400">
                  <FiEdit2 />
                  <Text fontSize="14px">?????????????????????</Text>
                </Stack>
              </Box>
            )}
            <Box mb="16px">
              <FormLabel fontWeight="bold">????????????</FormLabel>
              <Input
                type="text"
                name="name"
                w="100%"
                value={newGroup.name}
                onChange={handleChange}
                placeholder="????????????????????????????????????"
              />
            </Box>
            <FormLabel fontWeight="bold">????????????</FormLabel>
            <Box mb="16px" display="flex" flexDir="row" flexWrap="wrap">
              {newGroup.members?.map((u) => (
                <Box mr={'4px'} mb={'8px'} key={u.id}>
                  <ButtonGroup isAttached size="xs" colorScheme="purple">
                    <Button mr="-px">{userNameFactory(u)}</Button>
                  </ButtonGroup>
                </Box>
              ))}
            </Box>
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default CreateChatGroupModal;

import {
  Box,
  Button,
  FormLabel,
  Image,
  Input,
  Link,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  SimpleGrid,
  Text,
} from '@chakra-ui/react';
import React, { useMemo, useRef, useState } from 'react';
import { ChatAlbum, ChatAlbumImage, ChatGroup } from 'src/types';
import { AiOutlineLeft, AiOutlinePlus } from 'react-icons/ai';
import dynamic from 'next/dynamic';

const Viewer = dynamic(() => import('react-viewer'), { ssr: false });
import { ImageDecorator } from 'react-viewer/lib/ViewerProps';
import AlbumBox from './AlbumBox';
import { dateTimeFormatterFromJSDDate } from 'src/utils/dateTimeFormatter';
import { useFormik } from 'formik';
import { darkFontColor } from 'src/utils/colors';
import { useAPIUploadStorage } from '@/hooks/api/storage/useAPIUploadStorage';
import { useAPICreateChatAlbum } from '@/hooks/api/chat/album/useAPICreateChatAlbum';

type AlbumModalProps = {
  isOpen: boolean;
  onClose: () => void;
  headerName: string;
  albums: ChatAlbum[];
  images: ChatAlbumImage[];
  room: ChatGroup;
  selectedAlbum?: ChatAlbum;
  onClickAlbum: (album: ChatAlbum) => void;
  onClickBackButton: () => void;
  onUploadImage: (files: File[]) => void;
};

const AlbumModal: React.FC<AlbumModalProps> = ({
  isOpen,
  onClose,
  headerName,
  albums,
  images,
  room,
  selectedAlbum,
  onClickAlbum,
  onClickBackButton,
  onUploadImage,
}) => {
  const imageUploaderRef = useRef<HTMLInputElement | null>(null);
  const [selectedImage, setSelectedImage] = useState<Partial<ChatAlbumImage>>();
  const [mode, setMode] = useState<'post' | 'list'>('list');
  const initialValues: Partial<ChatAlbum> = {
    title: '',
    images: [],
    chatGroup: room,
  };
  const { mutate: uploadImage } = useAPIUploadStorage();
  const { mutate: createAlbum } = useAPICreateChatAlbum();
  const { values, handleChange, setValues, handleSubmit } = useFormik<
    Partial<ChatAlbum>
  >({
    initialValues: initialValues,
    onSubmit: (submittedValues, { resetForm }) =>
      createAlbum(submittedValues, {
        onSuccess: () => {
          setMode('list');
          resetForm();
        },
      }),
  });
  const imagesInNewAlbumViewer = useMemo((): ImageDecorator[] => {
    return (
      values.images?.map((i) => ({
        src: i.imageURL || '',
        alt: 'アルバム画像',
        downloadUrl: i.imageURL || '',
      })) || []
    );
  }, [values]);
  const imagesInDetailViewer = useMemo((): ImageDecorator[] => {
    if (selectedAlbum) {
      return (
        selectedAlbum.images?.map((i) => ({
          src: i.imageURL || '',
          alt: 'アルバム画像',
          downloadUrl: i.imageURL || '',
        })) || []
      );
    } else if (selectedImage) {
      return [
        {
          src: selectedImage.imageURL || '',
          alt: 'アルバム画像',
          downloadUrl: selectedImage.imageURL || '',
        },
      ];
    } else {
      return [];
    }
  }, [selectedAlbum, selectedImage]);
  const activeIndex = useMemo(() => {
    if (selectedImage) {
      const isNowUri = (element: ImageDecorator) =>
        element.src === selectedImage?.imageURL;
      return imagesInDetailViewer.findIndex(isNowUri) + 1;
    }
  }, [imagesInDetailViewer, selectedImage]);

  const imageUploadToAlbum = () => {
    const files = imageUploaderRef.current?.files;
    const fileArr: File[] = [];
    if (!files) {
      return;
    }
    for (let i = 0; i < files.length; i++) {
      const renamedFile = new File([files[i]], files[i].name, {
        type: files[i].type,
        lastModified: files[i].lastModified,
      });
      fileArr.push(renamedFile);
    }
    onUploadImage(fileArr);
  };

  const imageUploadToNewAlbum = () => {
    const files = imageUploaderRef.current?.files;
    const fileArr: File[] = [];
    if (!files) {
      return;
    }
    for (let i = 0; i < files.length; i++) {
      const renamedFile = new File([files[i]], files[i].name, {
        type: files[i].type,
        lastModified: files[i].lastModified,
      });
      fileArr.push(renamedFile);
    }
    uploadImage(fileArr, {
      onSuccess: (imageURLs) => {
        const images: Partial<ChatAlbumImage>[] = imageURLs.map((i) => ({
          imageURL: i,
        }));
        setValues((v) => ({
          ...v,
          images: v.images?.length ? [...v.images, ...images] : [...images],
        }));
      },
    });
  };

  const postMode = (
    <Box>
      <Box flexDir="row" justifyContent="space-between" display="flex">
        <Button
          size="sm"
          flexDir="row"
          onClick={() => setMode('list')}
          mb="8px"
          alignItems="center">
          <AiOutlineLeft size={24} style={{ display: 'inline' }} />
          <Text display="inline">一覧へ戻る</Text>
        </Button>
        <Button
          size="sm"
          flexDir="row"
          onClick={() => handleSubmit()}
          mb="8px"
          colorScheme="green"
          alignItems="center">
          <Text display="inline">アルバムを作成</Text>
        </Button>
      </Box>
      <FormLabel>アルバム名</FormLabel>
      <Input
        bg="white"
        mb="8px"
        value={values.title}
        name="title"
        onChange={handleChange}
        placeholder={dateTimeFormatterFromJSDDate({
          dateTime: new Date(),
          format: 'yyyy/LL/dd',
        })}
      />
      <Box flexDir="row" display="flex" flexWrap="wrap">
        {values?.images?.map((i) => (
          <Link key={i.imageURL} onClick={() => setSelectedImage(i)}>
            <Image
              src={i.imageURL}
              alt="アルバム画像"
              h={'80px'}
              w={'80px'}
              mr={'4px'}
              mb={'4px'}
            />
          </Link>
        ))}
        <Link
          h={'80px'}
          w={'80px'}
          mr={'4px'}
          flexDir="row"
          justifyContent="center"
          alignItems="center"
          display="flex"
          bg="white"
          borderColor="gray.300"
          onClick={() => imageUploaderRef.current?.click()}
          borderWidth="0.5px">
          <AiOutlinePlus size={40} color={darkFontColor} />
          <input
            multiple
            ref={imageUploaderRef}
            accept="image/*"
            type="file"
            hidden
            name="imageUploadToAlbum"
            onChange={imageUploadToNewAlbum}
          />
        </Link>
      </Box>
    </Box>
  );

  const listMode = (
    <>
      <Box flexDir="row" justifyContent="flex-end" display="flex" mb={'40px'}>
        <Button
          size="sm"
          flexDir="row"
          onClick={() => setMode('post')}
          position="absolute"
          mb="8px"
          colorScheme="green"
          alignItems="center">
          <Text display="inline">アルバムを作成</Text>
        </Button>
      </Box>

      {albums.map((a) => (
        <Box mb="16px" key={a.id}>
          <AlbumBox album={a} onClick={onClickAlbum} />
        </Box>
      ))}
    </>
  );

  return (
    <>
      <Viewer
        images={mode === 'list' ? imagesInDetailViewer : imagesInNewAlbumViewer}
        visible={!!selectedImage}
        onClose={() => setSelectedImage(undefined)}
        downloadable={true}
        downloadInNewWindow={true}
        activeIndex={activeIndex}
      />
      <Modal
        onClose={onClose}
        isOpen={isOpen && !selectedImage}
        scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent h="80vh" bg={'#f9fafb'}>
          <ModalHeader>{headerName}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {!selectedAlbum && mode === 'list' ? (
              listMode
            ) : !selectedAlbum && mode === 'post' ? (
              postMode
            ) : (
              <Box>
                <Box
                  flexDir="row"
                  justifyContent="space-between"
                  display="flex">
                  <Button
                    size="sm"
                    flexDir="row"
                    onClick={onClickBackButton}
                    mb="8px"
                    alignItems="center">
                    <AiOutlineLeft size={24} style={{ display: 'inline' }} />
                    <Text display="inline">一覧へ戻る</Text>
                  </Button>
                  <Button
                    size="sm"
                    flexDir="row"
                    onClick={() => imageUploaderRef.current?.click()}
                    mb="8px"
                    colorScheme="green"
                    alignItems="center">
                    <Text display="inline">写真を追加</Text>
                  </Button>
                  <input
                    multiple
                    ref={imageUploaderRef}
                    accept="image/*"
                    type="file"
                    hidden
                    name="imageUploadToAlbum"
                    onChange={imageUploadToAlbum}
                  />
                </Box>
                <SimpleGrid spacing="8px" columns={2}>
                  {images?.map((i) => (
                    <Link key={i.id} onClick={() => setSelectedImage(i)}>
                      <Image src={i.imageURL} alt="アルバム画像" w="100%" />
                    </Link>
                  ))}
                </SimpleGrid>
              </Box>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default AlbumModal;

import { useAPIGetChatAlbumImages } from '@/hooks/api/chat/album/useAPIGetChatAlbumImages';
import { useAPIUpdateAlbum } from '@/hooks/api/chat/album/useAPIUpdateChatAlbum';
import { useAPIUploadStorage } from '@/hooks/api/storage/useAPIUploadStorage';
import {
  ModalBody,
  Box,
  FormLabel,
  SimpleGrid,
  Link,
  Text,
  useToast,
  Button,
  Spinner,
  Input,
  Image,
  Modal,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/react';
import { useFormik } from 'formik';
import React, { useMemo, useRef, useState } from 'react';
import { AiOutlineLeft, AiFillCloseCircle } from 'react-icons/ai';
import { ChatAlbum, ChatAlbumImage } from 'src/types';
import { dateTimeFormatterFromJSDDate } from 'src/utils/dateTimeFormatter';
import { albumSchema } from 'src/utils/validation/schema';
import dynamic from 'next/dynamic';
import { ImageDecorator } from 'react-viewer/lib/ViewerProps';
const Viewer = dynamic(() => import('react-viewer'), { ssr: false });
import { saveAs } from 'file-saver';
import { fileNameTransformer } from 'src/utils/factory/fileNameTransformer';

type EditAlbumProps = {
  selectedAlbum: ChatAlbum;
  navigateToList: () => void;
  isOpen: boolean;
  onClose: () => void;
};

const EditAlbum: React.FC<EditAlbumProps> = ({
  selectedAlbum,
  navigateToList,
  isOpen,
  onClose,
}) => {
  const imageUploaderRef = useRef<HTMLInputElement | null>(null);
  const [selectedImage, setSelectedImage] = useState<Partial<ChatAlbumImage>>();
  const toast = useToast();
  const { mutate: updateAlbum } = useAPIUpdateAlbum();
  const { values, handleChange, setValues, handleSubmit, errors, touched } =
    useFormik<Partial<ChatAlbum>>({
      initialValues: selectedAlbum,
      validationSchema: albumSchema,
      onSubmit: (submittedValues) => {
        updateAlbum(
          { ...(submittedValues as ChatAlbum) },
          {
            onSuccess: () => {
              navigateToList();
              toast({
                description: 'アルバムを更新しました。',
                status: 'success',
                duration: 3000,
                isClosable: true,
              });
            },
          },
        );
      },
    });
  const imagesInDetailViewer = useMemo((): ImageDecorator[] => {
    return (
      values.images?.map((i) => ({
        src: i.imageURL || '',
        downloadUrl: i.imageURL || '',
      })) || []
    );
  }, [values.images]);

  useAPIGetChatAlbumImages(
    {
      roomId: selectedAlbum?.chatGroup?.id.toString() || '',
      albumId: selectedAlbum?.id.toString() || '0',
    },
    {
      onSuccess: (data) => {
        setValues((v) => ({ ...v, images: data.images }));
      },
    },
  );
  const { mutate: uploadImage, isLoading: imageUploading } =
    useAPIUploadStorage();

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
    uploadImage(fileArr, {
      onSuccess: (imageURLs) => {
        const images: Partial<ChatAlbumImage>[] = imageURLs.map((image, i) => ({
          imageURL: image,
          name: fileArr[i].name,
        }));
        setValues((v) => ({
          ...v,
          images: v.images?.length ? [...v.images, ...images] : [...images],
        }));
      },
    });
  };
  const removeImage = (image: Partial<ChatAlbumImage>) => {
    if (!image.imageURL) {
      return;
    }
    setValues((v) => ({
      ...v,
      images: v.images?.filter((i) => i.imageURL !== image.imageURL) || [],
    }));
  };

  const activeIndex = useMemo(() => {
    if (selectedImage) {
      const isNowUri = (element: ImageDecorator) =>
        element.src === selectedImage?.imageURL;
      return imagesInDetailViewer.findIndex(isNowUri);
    }
  }, [imagesInDetailViewer, selectedImage]);

  return (
    <>
      <Viewer
        customToolbar={(config) => {
          return config.concat([
            {
              key: 'donwload',
              render: (
                <i
                  className={`react-viewer-icon react-viewer-icon-download`}></i>
              ),
              onClick: ({ src }) => {
                if (selectedImage?.fileName)
                  saveAs(src, selectedImage.fileName);
              },
            },
          ]);
        }}
        images={imagesInDetailViewer}
        visible={!!selectedImage}
        onClose={() => setSelectedImage(undefined)}
        activeIndex={activeIndex !== -1 ? activeIndex : 0}
      />
      {!selectedImage && (
        <Modal onClose={onClose} isOpen={isOpen} scrollBehavior="inside">
          <ModalOverlay />
          <ModalContent h="80vh" bg={'#f9fafb'}>
            <ModalHeader
              flexDir="row"
              justifyContent="space-between"
              display="flex"
              mr="24px">
              <Text>アルバム</Text>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Box>
                <Box
                  flexDir="row"
                  justifyContent="space-between"
                  display="flex">
                  <Button
                    size="sm"
                    flexDir="row"
                    onClick={navigateToList}
                    mb="8px"
                    alignItems="center">
                    <AiOutlineLeft size={24} style={{ display: 'inline' }} />
                    <Text display="inline">一覧へ戻る</Text>
                  </Button>
                  <Box>
                    <Button
                      size="xs"
                      flexDir="row"
                      mr="4px"
                      onClick={() => imageUploaderRef.current?.click()}
                      mb="8px"
                      colorScheme="green"
                      alignItems="center">
                      <Text display="inline">写真を追加</Text>
                    </Button>
                    {imageUploading ? (
                      <Button
                        size="xs"
                        flexDir="row"
                        mb="8px"
                        disabled
                        colorScheme="green"
                        alignItems="center">
                        <Text display="inline">画像アップロード中</Text>
                        <Spinner />
                      </Button>
                    ) : (
                      <Button
                        size="xs"
                        flexDir="row"
                        mr="4px"
                        onClick={() => handleSubmit()}
                        mb="8px"
                        colorScheme="blue"
                        alignItems="center">
                        <Text display="inline">アルバムを更新</Text>
                      </Button>
                    )}
                  </Box>
                </Box>
                <FormLabel>アルバム名</FormLabel>
                {errors.title && touched.title ? (
                  <FormLabel color="tomato">{errors.title}</FormLabel>
                ) : null}
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
                {errors.images && touched.images ? (
                  <FormLabel color="tomato">{errors.images}</FormLabel>
                ) : null}
                <SimpleGrid spacing="8px" columns={2}>
                  {values?.images?.map((i) => (
                    <Box position="relative" key={i.id}>
                      <AiFillCloseCircle
                        onClick={() => removeImage(i)}
                        size={24}
                        style={{
                          color: 'white',
                          top: 0,
                          right: 0,
                          background: 'black',
                          borderRadius: '100%',
                          position: 'absolute',
                          cursor: 'pointer',
                        }}
                      />
                      <Link key={i.id} onClick={() => setSelectedImage(i)}>
                        <Image src={i.imageURL} alt="アルバム画像" w="100%" />
                      </Link>
                    </Box>
                  ))}
                </SimpleGrid>
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
            </ModalBody>
          </ModalContent>
        </Modal>
      )}
    </>
  );
};

export default EditAlbum;

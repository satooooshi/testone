import { useAPICreateChatAlbum } from '@/hooks/api/chat/album/useAPICreateChatAlbum';
import { useAPIUploadStorage } from '@/hooks/api/storage/useAPIUploadStorage';
import {
  Box,
  Button,
  FormLabel,
  Input,
  Link,
  ModalBody,
  Spinner,
  Text,
  Image,
  useToast,
  Modal,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/react';
import { useFormik } from 'formik';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AiOutlineLeft,
  AiFillCloseCircle,
  AiOutlinePlus,
} from 'react-icons/ai';
import { ChatAlbum, ChatAlbumImage, ChatGroup } from 'src/types';
import { darkFontColor } from 'src/utils/colors';
import { dateTimeFormatterFromJSDDate } from 'src/utils/dateTimeFormatter';
import { albumSchema } from 'src/utils/validation/schema';
import dynamic from 'next/dynamic';
import { ImageDecorator } from 'react-viewer/lib/ViewerProps';
import { saveAs } from 'file-saver';
import { fileNameTransformer } from 'src/utils/factory/fileNameTransformer';
const Viewer = dynamic(() => import('react-viewer'), { ssr: false });

type PostAlbumProps = {
  room: ChatGroup;
  navigateToList: () => void;
  isOpen: boolean;
  onClose: () => void;
};

const PostAlbum: React.FC<PostAlbumProps> = ({
  room,
  navigateToList,
  isOpen,
  onClose,
}) => {
  const { mutate: uploadImage, isLoading: imageUploading } =
    useAPIUploadStorage();
  const { mutate: createAlbum } = useAPICreateChatAlbum();
  const toast = useToast();
  const initialValues: Partial<ChatAlbum> = {
    title: '',
    images: [],
    chatGroup: room,
  };
  const [selectedImage, setSelectedImage] = useState<Partial<ChatAlbumImage>>();
  const imageUploaderRef = useRef<HTMLInputElement | null>(null);
  const { values, handleChange, setValues, handleSubmit, errors, touched } =
    useFormik<Partial<ChatAlbum>>({
      initialValues: initialValues,
      validationSchema: albumSchema,
      onSubmit: (submittedValues, { resetForm }) => {
        createAlbum(submittedValues, {
          onSuccess: () => {
            navigateToList();
            toast({
              description: 'アルバムを作成しました',
              status: 'success',
              duration: 3000,
              isClosable: true,
            });
            resetForm();
          },
        });
      },
    });

  const [willSubmit, setWillSubmit] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setWillSubmit(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    if (willSubmit) {
      handleSubmit();
    }
  }, [willSubmit, handleSubmit]);
  const imagesInNewAlbumViewer = useMemo((): ImageDecorator[] => {
    return (
      values.images?.map((i) => ({
        src: i.imageURL || '',
        alt: 'アルバム画像',
        downloadUrl: i.imageURL || '',
      })) || []
    );
  }, [values]);

  const removeImage = (image: Partial<ChatAlbumImage>) => {
    if (!image.imageURL) {
      return;
    }
    setValues((v) => ({
      ...v,
      images: v.images?.filter((i) => i.imageURL !== image.imageURL) || [],
    }));
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
  const activeIndex = useMemo(() => {
    if (selectedImage) {
      const isNowUri = (element: ImageDecorator) =>
        element.src === selectedImage?.imageURL;
      return imagesInNewAlbumViewer.findIndex(isNowUri);
    }
  }, [imagesInNewAlbumViewer, selectedImage]);

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
        images={imagesInNewAlbumViewer}
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
                    onClick={() => navigateToList()}
                    mb="8px"
                    alignItems="center">
                    <AiOutlineLeft size={24} style={{ display: 'inline' }} />
                    <Text display="inline">一覧へ戻る</Text>
                  </Button>
                  {imageUploading ? (
                    <Button
                      size="sm"
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
                      size="sm"
                      flexDir="row"
                      onClick={() => setWillSubmit(true)}
                      mb="8px"
                      colorScheme="green"
                      alignItems="center">
                      <Text display="inline">アルバムを作成</Text>
                    </Button>
                  )}
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
                <Box flexDir="row" display="flex" flexWrap="wrap">
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
                      <Link
                        key={i.imageURL}
                        onClick={() => setSelectedImage(i)}>
                        <Image
                          src={i.imageURL}
                          alt="アルバム画像"
                          h={'80px'}
                          w={'80px'}
                          mr={'4px'}
                          mb={'4px'}
                        />
                      </Link>
                    </Box>
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
            </ModalBody>
          </ModalContent>
        </Modal>
      )}
    </>
  );
};

export default PostAlbum;

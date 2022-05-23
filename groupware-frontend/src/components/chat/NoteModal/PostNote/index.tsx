import { useAPICreateChatNote } from '@/hooks/api/chat/note/useAPICreateChatNote';
import { useAPIUploadStorage } from '@/hooks/api/storage/useAPIUploadStorage';
import {
  useToast,
  Box,
  SimpleGrid,
  Link,
  FormLabel,
  Button,
  Textarea,
  Spinner,
  Text,
  Image,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/react';
import { useFormik } from 'formik';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AiOutlineLeft, AiFillCloseCircle } from 'react-icons/ai';
import { ImageDecorator } from 'react-viewer/lib/ViewerProps';
import { ChatGroup, ChatNote, ChatNoteImage } from 'src/types';
import { noteSchema } from 'src/utils/validation/schema';
import dynamic from 'next/dynamic';
const Viewer = dynamic(() => import('react-viewer'), { ssr: false });
import { saveAs } from 'file-saver';
import { fileNameTransformer } from 'src/utils/factory/fileNameTransformer';
import { useAPIUpdateNote } from '@/hooks/api/chat/note/useAPIUpdateChatNote';

type EditNoteProps = {
  room: ChatGroup;
  isOpen: boolean;
  navigateToList: () => void;
  onClose: () => void;
  //if edit mode, this props is needed
  note?: ChatNote;
};

const EditNote: React.FC<EditNoteProps> = ({
  room,
  isOpen,
  navigateToList,
  onClose,
  note,
}) => {
  const toast = useToast();
  const imageUploaderRef = useRef<HTMLInputElement | null>(null);
  const initialValues: Partial<ChatNote> = {
    content: '',
    chatGroup: room,
    editors: [],
    images: [],
  };
  const { mutate: createNote } = useAPICreateChatNote({
    onSuccess: () => {
      toast({
        title: 'ノートを保存しました',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      navigateToList();
    },
  });
  const { mutate: updateNote } = useAPIUpdateNote({
    onSuccess: () => {
      toast({
        title: 'ノートを更新しました',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    },
    onError: () => {
      toast({
        title: 'ノートの更新に失敗しました',
        description: 'しばらくしてからお試しください',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    },
  });
  const {
    resetForm,
    values,
    setValues,
    handleChange,
    handleSubmit,
    errors,
    touched,
  } = useFormik<ChatNote | Partial<ChatNote>>({
    initialValues: note || initialValues,
    validationSchema: noteSchema,
    onSubmit: (submittedValues) => {
      if (note) {
        updateNote(submittedValues as ChatNote);
      } else {
        createNote(submittedValues);
      }
    },
  });
  const [selectedImage, setSelectedImage] = useState<Partial<ChatNoteImage>>();
  const imagesInSelectedNote: ImageDecorator[] = useMemo(() => {
    return (
      values?.images?.map((i) => ({
        src: i.imageURL || '',
        downloadUrl: i.imageURL || '',
      })) || []
    );
  }, [values?.images]);
  const { mutate: uploadImage, isLoading: loadingUploadFile } =
    useAPIUploadStorage();
  const removeImage = (image: Partial<ChatNoteImage>) => {
    if (!image.imageURL) {
      return;
    }
    if (confirm('画像をノートから削除してよろしいですか？')) {
      setValues((v) => ({
        ...v,
        images: v.images?.filter((i) => i.imageURL !== image.imageURL) || [],
      }));
    }
  };
  const isNowUri = (element: ImageDecorator) =>
    element.src === selectedImage?.imageURL;
  const activeIndex = imagesInSelectedNote.findIndex(isNowUri);

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

  useEffect(() => {
    if (!note) {
      resetForm();
    }
  }, [note, resetForm]);

  useEffect(() => {
    if (note) {
      setValues(note);
    }
  }, [note, setValues]);

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
        images={imagesInSelectedNote}
        visible={!!selectedImage}
        onClose={() => setSelectedImage(undefined)}
        activeIndex={activeIndex !== -1 ? activeIndex : 0}
      />
      {!selectedImage && (
        <Modal onClose={onClose} isOpen={isOpen} scrollBehavior="inside">
          <ModalOverlay />
          <ModalContent h="90vh" bg={'#f9fafb'}>
            <ModalHeader
              flexDir="row"
              justifyContent="space-between"
              display="flex"
              mr="24px">
              <Text>{note ? 'ノート編集' : '新規ノート作成'}</Text>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Box>
                <Box mb="8px">
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
                    <Box display="flex" flexDir="row" mb="8px">
                      <Button
                        size="sm"
                        mr="4px"
                        flexDir="row"
                        onClick={() => imageUploaderRef.current?.click()}
                        colorScheme="green"
                        alignItems="center">
                        <Text display="inline">写真を追加</Text>
                      </Button>
                      <Button
                        size="sm"
                        colorScheme="blue"
                        onClick={() => setWillSubmit(true)}>
                        {loadingUploadFile ? (
                          <Spinner />
                        ) : (
                          <Text>ノートを保存</Text>
                        )}
                      </Button>
                    </Box>
                    <input
                      multiple
                      ref={imageUploaderRef}
                      accept="image/*"
                      type="file"
                      hidden
                      name="imageUploadToAlbum"
                      onChange={() => {
                        const files = imageUploaderRef.current?.files;
                        const fileArr: File[] = [];
                        if (!files) {
                          return;
                        }
                        for (let i = 0; i < files.length; i++) {
                          const renamedFile = new File(
                            [files[i]],
                            files[i].name,
                            {
                              type: files[i].type,
                              lastModified: files[i].lastModified,
                            },
                          );
                          fileArr.push(renamedFile);
                        }
                        uploadImage(fileArr, {
                          onSuccess: (imageURLs) => {
                            const images: Partial<ChatNoteImage>[] =
                              imageURLs.map((image, i) => ({
                                imageURL: image,
                                name: fileArr[i].name,
                              }));
                            setValues((v) => ({
                              ...v,
                              images: v.images?.length
                                ? [...v.images, ...images]
                                : [...images],
                            }));
                          },
                        });
                      }}
                    />
                  </Box>
                  <SimpleGrid mb="8px" spacing="4px" columns={3} w="100%">
                    {values.images?.map((i) => (
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
                          <Image src={i.imageURL} alt="関連画像" />
                        </Link>
                      </Box>
                    ))}
                  </SimpleGrid>
                  {errors.content && touched.content ? (
                    <FormLabel color="tomato">{errors.content}</FormLabel>
                  ) : null}
                  <Textarea
                    value={values.content}
                    name="content"
                    onChange={handleChange}
                    placeholder="今なにしてる？"
                    bg="white"
                    minH={'300px'}
                  />
                </Box>
              </Box>
            </ModalBody>
          </ModalContent>
        </Modal>
      )}
    </>
  );
};

export default EditNote;

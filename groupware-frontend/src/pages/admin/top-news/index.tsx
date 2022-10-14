import LayoutWithTab from '@/components/layout/LayoutWithTab';
import { SidebarScreenName } from '@/components/layout/Sidebar';
import { useAPICreateNews } from '@/hooks/api/topNews/useAPICreateTopNews';
import { useAPIDeleteNews } from '@/hooks/api/topNews/useAPIDeleteTopNews';
import {
  GetTopNewsQuery,
  useAPIGetTopNews,
} from '@/hooks/api/topNews/useAPIGetTopNews';
import { useAPIUpdateNews } from '@/hooks/api/topNews/useAPIUpdateTopNews';
import paginationStyles from '@/styles/components/Pagination.module.scss';
import { useHeaderTab } from '@/hooks/headerTab/useHeaderTab';
import {
  Box,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useMediaQuery,
  Text,
  Spinner,
  FormControl,
  FormLabel,
  Input,
  Button,
  Link,
  useToast,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/react';
import { FormikErrors, useFormik } from 'formik';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { BsPencilSquare } from 'react-icons/bs';
import { MdDelete } from 'react-icons/md';
import { TopNews } from 'src/types';
import { darkFontColor } from 'src/utils/colors';
import { dateTimeFormatterFromJSDDate } from 'src/utils/dateTimeFormatter';
import NextLink from 'next/link';
import dynamic from 'next/dynamic';
import { topNewsSchema } from 'src/utils/validation/schema';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import type {
  DropResult,
  DroppableProvided,
  DraggableProvided,
} from 'react-beautiful-dnd';
import { AiOutlinePlus } from 'react-icons/ai';
import { FiEdit2 } from 'react-icons/fi';
import { RiDeleteBin6Line } from 'react-icons/ri';
const ReactPaginate = dynamic(() => import('react-paginate'), { ssr: false });

const NewsAdmin: React.VFC = () => {
  const router = useRouter();
  const toast = useToast();
  const [isSmallerThan768] = useMediaQuery('(max-width: 768px)');
  const formRef = useRef<HTMLDivElement | null>(null);
  const { page = '1' } = router.query as GetTopNewsQuery;
  const [formOpened, setFormOpened] = useState(false);
  const tabs = useHeaderTab({ headerTabType: 'admin' });
  const activeTabName = '特集管理';
  const { data, isLoading, refetch } = useAPIGetTopNews({ page });
  const { mutate: createNews } = useAPICreateNews();
  const { mutate: updateNews, isLoading: updateLoading } = useAPIUpdateNews();
  const { mutate: deleteNews } = useAPIDeleteNews();
  const [news, setNews] = useState(data?.news);
  const [isOpen, setModal] = useState(false);

  const initialValues: Partial<TopNews> = {
    title: '',
    urlPath: '',
  };
  const {
    values,
    setValues,
    handleChange,
    handleSubmit,
    resetForm: reset,
    errors,
    touched,
  } = useFormik<Partial<TopNews>>({
    initialValues,
    validationSchema: topNewsSchema,
    validate: (inputValues) => {
      const errors: FormikErrors<Partial<TopNews>> = {};
      if (inputValues.urlPath) {
        const idExists = new RegExp(
          `${location.origin}/(event|wiki/detail|account)\/[0-9]+$`,
        ).test(inputValues.urlPath);
        if (!idExists) {
          errors.urlPath =
            'URLはイベント詳細/Wiki詳細/アカウント詳細のいずれかのURLを入力してください';
        }
      }
      return errors;
    },
    onSubmit: (urlUnParsedValue, { resetForm }) => {
      const submittedValues = {
        ...urlUnParsedValue,
        urlPath: urlUnParsedValue.urlPath?.replace(/.*\/\/[^/]*/, ''),
      };
      if (submittedValues.id) {
        updateNews(submittedValues as TopNews, {
          onSuccess: () => {
            resetForm();
            setFormOpened(false);
            toast({
              title: '特集の更新が完了しました',
              status: 'success',
              duration: 3000,
              isClosable: true,
            });
            refetch();
          },
        });
      } else {
        createNews(submittedValues, {
          onSuccess: () => {
            resetForm();
            toast({
              title: '特集の作成が完了しました',
              status: 'success',
              duration: 3000,
              isClosable: true,
            });
            refetch();
          },
        });
      }
      setModal(false);
    },
  });

  const newsExistence = !(page === '1' && !data?.news?.length && !isLoading);

  const onDeleteNews = (news: TopNews) => {
    if (confirm(`「${news.title}」を削除してよろしいですか？`)) {
      deleteNews(news.id, {
        onSuccess: () => {
          refetch();
        },
      });
    }
  };

  useEffect(() => {
    if (formRef.current && formOpened) {
      formRef.current?.scrollTo({ top: 0 });
    }
  }, [formOpened]);

  const handleDragEnd = useCallback(
    (result: DropResult) => {
      if (!result.destination) {
        return;
      }
      if (news) {
        const newNews = [...news];
        if (result.source.index < result.destination.index) {
          for (let i = result.source.index; i < result.destination.index; i++) {
            updateNews({ ...news[i + 1], id: news[i].id });
          }
        } else {
          for (let i = result.source.index; i > result.destination.index; i--) {
            updateNews({ ...news[i - 1], id: news[i].id });
          }
        }
        const [pickedNews] = newNews.splice(result.source.index, 1);
        updateNews(
          { ...pickedNews, id: news[result.destination.index].id },
          {
            onSuccess: () => {
              refetch();
            },
          },
        );
        newNews.splice(result.destination.index, 0, pickedNews);
        setNews(newNews);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [news],
  );

  useEffect(() => {
    setNews(data?.news);
  }, [data]);

  return (
    <LayoutWithTab
      sidebar={{ activeScreenName: SidebarScreenName.ADMIN }}
      header={{
        title: 'Admin',
        activeTabName,
        tabs,
      }}>
      <Head>
        <title>特集管理</title>
      </Head>
      <Modal
        size="5xl"
        isOpen={isOpen}
        onClose={() => {
          setModal(false);
          reset();
        }}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{isOpen ? '特集の編集' : '新規特集の作成'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb="20px">
              <FormLabel fontWeight="bold">URL</FormLabel>
              {errors.urlPath && touched.urlPath ? (
                <FormLabel color="tomato">{errors.urlPath}</FormLabel>
              ) : null}
              <Input
                bg="white"
                value={values.urlPath}
                onChange={handleChange}
                name="urlPath"
                placeholder="イベント詳細/Wiki詳細/アカウント詳細のいずれかのURLを入力してください"
              />
            </FormControl>
            <FormControl mb="20px">
              <FormLabel fontWeight="bold">タイトル(100文字以内)</FormLabel>
              {errors.title && touched.title ? (
                <FormLabel color="tomato">{errors.title}</FormLabel>
              ) : null}
              <Input
                bg="white"
                value={values.title}
                onChange={handleChange}
                name="title"
                placeholder="タイトルを入力してください"
              />
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button
              onClick={() => handleSubmit()}
              mx="auto"
              colorScheme="brand">
              作成
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Box w="70px" mb={5} mr={3} ml="auto">
        <Button
          onClick={() => setModal(true)}
          rounded={50}
          w="80px"
          h="35px"
          colorScheme="brand"
          rightIcon={<AiOutlinePlus />}>
          作成
        </Button>
      </Box>
      <Box
        display="flex"
        flexDir="column"
        justifyContent={!isSmallerThan768 ? 'center' : 'flex-start'}
        alignItems="center"
        w={!isSmallerThan768 ? '100%' : '99vw'}>
        {/* <Text color="brand.500" fontSize="16px" mb="8px">
          特集管理ではアプリのTOP画面に表示されるリンクの管理ができます
        </Text> */}
        {!newsExistence ? (
          <>
            <Text my="16px" fontSize={20}>
              まだ特集が作成されていません。
            </Text>
          </>
        ) : (
          <>
            <Box
              w={'100%'}
              bg="white"
              justifyContent={isSmallerThan768 ? 'flex-start' : 'center'}
              alignItems="center"
              display="flex"
              flexDir="column"
              overflowX="auto"
              alignSelf="center">
              <Box
                px={5}
                display="flex"
                flexDir="row"
                w="100%"
                h="50px"
                border="1px"
                alignItems="center"
                mb="-1px">
                <Text w="40%" fontWeight="bold" ml="5px" color={darkFontColor}>
                  URL
                </Text>
                <Text w="20%" fontWeight="bold" color={darkFontColor}>
                  タイトル
                </Text>
                <Text w="20%" fontWeight="bold" color={darkFontColor}>
                  作成日
                </Text>
              </Box>
              {(!isLoading || !updateLoading) && (
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="items">
                    {(provided: DroppableProvided) => (
                      <ul
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        style={{
                          listStyleType: 'none',
                          width: '100%',
                        }} // スタイル調整用
                      >
                        {news?.map((n, i) => (
                          <Draggable
                            draggableId={n.id.toString()}
                            key={n.id}
                            index={i}>
                            {(provided: DraggableProvided) => (
                              <li
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}>
                                <Box
                                  display="flex"
                                  flexDir="row"
                                  w="100%"
                                  border="1px"
                                  h="40px"
                                  px={5}
                                  alignItems="center"
                                  mb={i + 1 < news.length ? '-1px' : '0px'}>
                                  <Box
                                    w="40%"
                                    color="brand"
                                    ml="5px"

                                    // whiteSpace="nowrap"
                                  >
                                    <NextLink href={n.urlPath}>
                                      <a target="_blank">
                                        {location.origin + n.urlPath}
                                      </a>
                                    </NextLink>
                                  </Box>
                                  <Box
                                    w="20%"
                                    // whiteSpace="nowrap"
                                  >
                                    {n.title}
                                  </Box>
                                  <Box
                                    w="20%"
                                    // whiteSpace="nowrap"
                                  >
                                    {dateTimeFormatterFromJSDDate({
                                      dateTime: new Date(n.createdAt),
                                      format: 'yyyy/LL/dd HH:mm',
                                    })}
                                  </Box>
                                  <Box display="flex" ml="auto">
                                    <Link
                                      onClick={() => {
                                        setValues({
                                          ...n,
                                          urlPath: location.origin + n.urlPath,
                                        });
                                        setModal(true);
                                      }}>
                                      <FiEdit2 size={24} />
                                    </Link>
                                    <Link
                                      ml={3}
                                      onClick={() => onDeleteNews(n)}>
                                      <RiDeleteBin6Line size={24} />
                                    </Link>
                                  </Box>
                                </Box>
                              </li>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </ul>
                    )}
                  </Droppable>
                </DragDropContext>
              )}
            </Box>
            {(isLoading || updateLoading) && <Spinner />}
          </>
        )}
      </Box>
      {typeof window !== 'undefined' && data && data.pageCount ? (
        <div className={paginationStyles.pagination_wrap_layout}>
          <ReactPaginate
            pageCount={data.pageCount}
            onPageChange={({ selected }) => {
              router.push(
                `/admin/top-news?page=${(selected + 1).toString()}`,
                undefined,
                {
                  shallow: true,
                },
              );
            }}
            initialPage={page ? Number(page) - 1 : 0}
            forcePage={page ? Number(page) - 1 : 0}
            disableInitialCallback={true}
            previousLabel={'前へ'}
            nextLabel={'次へ'}
            marginPagesDisplayed={2}
            pageRangeDisplayed={5}
            containerClassName={paginationStyles.pagination}
            activeClassName={paginationStyles.active}
            disabledClassName={paginationStyles.button__disabled}
          />
        </div>
      ) : null}
    </LayoutWithTab>
  );
};

export default NewsAdmin;

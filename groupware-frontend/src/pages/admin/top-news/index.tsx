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
} from '@chakra-ui/react';
import { FormikErrors, useFormik } from 'formik';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useEffect, useRef, useState } from 'react';
import { BsPencilSquare } from 'react-icons/bs';
import { MdDelete } from 'react-icons/md';
import { TopNews } from 'src/types';
import { darkFontColor } from 'src/utils/colors';
import { dateTimeFormatterFromJSDDate } from 'src/utils/dateTimeFormatter';
import NextLink from 'next/link';
import dynamic from 'next/dynamic';
import { topNewsSchema } from 'src/utils/validation/schema';
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
  const { mutate: updateNews } = useAPIUpdateNews();
  const { mutate: deleteNews } = useAPIDeleteNews();
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
          `${location.origin}/(event|wiki|account)\/[0-9]+$`,
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
    },
  });

  const newsExistence = !(page === '1' && !data?.news?.length && !isLoading);

  const form = (
    <Box
      ref={formRef}
      mb="16px"
      w="85vw"
      maxW="800px"
      flexDir={'column'}
      display="flex"
      alignItems={'flex-end'}>
      <FormControl mb="8px">
        <FormLabel>URL</FormLabel>
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
      <FormControl mb="8px">
        <FormLabel>タイトル(100文字以内)</FormLabel>
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
      <Box flexDir="row">
        {newsExistence && (
          <Button
            onClick={() => {
              setFormOpened(false);
              reset();
            }}
            colorScheme="green"
            size="md"
            mr="8px">
            閉じる
          </Button>
        )}
        <Button onClick={() => handleSubmit()} colorScheme="pink" size="md">
          作成
        </Button>
      </Box>
    </Box>
  );

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
      <Box
        display="flex"
        flexDir="column"
        justifyContent={!isSmallerThan768 ? 'center' : 'flex-start'}
        alignItems="center"
        w={!isSmallerThan768 ? '100%' : '100vw'}
        mb="72px">
        <Text color="blue.500" fontSize="16px" mb="8px">
          特集管理ではアプリのTOP画面に表示されるリンクの管理ができます
        </Text>
        {!newsExistence ? (
          <>
            <Text mb="16px">
              まだ特集が作成されていません。下のフォームから特集を作成してください。
            </Text>
            {form}
          </>
        ) : (
          <>
            {formOpened ? (
              form
            ) : (
              <Box
                display="flex"
                justifyContent="flex-end"
                w="85vw"
                mb="16px"
                maxW="1980px">
                <Button
                  colorScheme="pink"
                  size="md"
                  alignSelf="flex-end"
                  onClick={() => setFormOpened(true)}>
                  新規特集の作成
                </Button>
              </Box>
            )}
            <Box
              w={isSmallerThan768 ? '100vw' : '100%'}
              justifyContent={isSmallerThan768 ? 'flex-start' : 'center'}
              display="flex"
              overflowX="auto"
              maxW="1980px"
              alignSelf="center">
              <Table
                variant="simple"
                alignSelf="center"
                w="100%"
                overflowX="auto">
                <Thead bg="white">
                  <Tr>
                    <Th>URL</Th>
                    <Th>タイトル</Th>
                    <Th>作成日</Th>
                    <Th />
                    <Th />
                  </Tr>
                </Thead>
                {!isLoading && (
                  <Tbody
                    position="relative"
                    borderColor="gray.300"
                    borderWidth={1}>
                    {data?.news?.map((n) => (
                      <Tr key={n.id}>
                        <Td w={'fit-content'} color="blue">
                          <NextLink href={location.href + n.urlPath}>
                            <a target="_blank">{location.origin + n.urlPath}</a>
                          </NextLink>
                        </Td>
                        <Td>{n.title}</Td>
                        <Td>
                          {dateTimeFormatterFromJSDDate({
                            dateTime: new Date(n.createdAt),
                            format: 'yyyy/LL/dd HH:mm',
                          })}
                        </Td>
                        <Td>
                          <Link
                            onClick={() => {
                              setValues(n);
                              setFormOpened(true);
                            }}>
                            <BsPencilSquare size={24} color={darkFontColor} />
                          </Link>
                        </Td>
                        <Td>
                          <Link onClick={() => onDeleteNews(n)}>
                            <MdDelete size={24} color={darkFontColor} />
                          </Link>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                )}
              </Table>
            </Box>
            {isLoading && <Spinner />}
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

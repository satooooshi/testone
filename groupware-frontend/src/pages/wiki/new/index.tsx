import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useAPICreateWiki } from '@/hooks/api/wiki/useAPICreateWiki';
import { useAPIGetTag } from '@/hooks/api/tag/useAPIGetTag';
import { useToast } from '@chakra-ui/react';
import QADraftForm from 'src/templates/WikiForm';
import { responseErrorMsgFactory } from 'src/utils/factory/responseErrorMsgFactory';

const CreateQA = () => {
  const router = useRouter();
  const toast = useToast();
  const { data: tags } = useAPIGetTag();
  const [wikiType, setWikiType] = useState('');

  const { mutate: createQuestion } = useAPICreateWiki({
    onSuccess: () => {
      router.push('/wiki/list?page=1&tag=&word=&status=new&type=');
      toast({
        description: wikiType + 'の作成が完了しました。',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    },
    onError: (e) => {
      const messages = responseErrorMsgFactory(e?.response?.data.message);
      toast({
        description: messages,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    },
  });

  return (
    <>
      <QADraftForm
        tags={tags}
        onClickSaveButton={createQuestion}
        setWikiType={setWikiType}
      />
    </>
  );
};
export default CreateQA;

import { useRouter } from 'next/router';
import { useAPICreateWiki } from '@/hooks/api/wiki/useAPICreateWiki';
import { useAPIGetTag } from '@/hooks/api/tag/useAPIGetTag';
import QADraftForm from 'src/templates/WikiForm';
import { useToast } from '@chakra-ui/toast';
import { responseErrorMsgFactory } from 'src/utils/factory/responseErrorMsgFactory';

const CreateQA = () => {
  const router = useRouter();
  const { data: tags } = useAPIGetTag();
  const toast = useToast();

  const { mutate: createQuestion } = useAPICreateWiki({
    onSuccess: () => {
      router.push('/wiki/list?page=1&tag=&word=&status=new&type=');
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
      <QADraftForm tags={tags} onClickSaveButton={createQuestion} />
    </>
  );
};
export default CreateQA;

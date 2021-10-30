import { useRouter } from 'next/router';
import { useAPICreateWiki } from '@/hooks/api/wiki/useAPICreateWiki';
import { useAPIGetTag } from '@/hooks/api/tag/useAPIGetTag';
import QADraftForm from 'src/templates/WikiForm';

const CreateQA = () => {
  const router = useRouter();
  const { data: tags } = useAPIGetTag();

  const { mutate: createQuestion } = useAPICreateWiki({
    onSuccess: () => {
      router.push('/wiki/list?page=1&tag=&word=&status=new&type=');
    },
    onError: () => {
      alert('Wiki作成が失敗しました。入力内容をご確認ください。');
    },
  });

  return (
    <>
      <QADraftForm tags={tags} onClickSaveButton={createQuestion} />
    </>
  );
};
export default CreateQA;

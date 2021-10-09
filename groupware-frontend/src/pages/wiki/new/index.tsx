import { useRouter } from 'next/router';
import { useAPICreateWiki } from '@/hooks/api/wiki/useAPICreateWiki';
import { useAPIGetTag } from '@/hooks/api/tag/useAPIGetTag';
import QADraftForm from 'src/templates/QADraftForm';

const CreateQA = () => {
  const router = useRouter();
  const { data: tags } = useAPIGetTag();

  const { mutate: createQuestion } = useAPICreateWiki({
    onSuccess: () => {
      router.push('/wiki/list');
    },
  });

  return (
    <>
      <QADraftForm tags={tags} onClickSaveButton={createQuestion} />
    </>
  );
};
export default CreateQA;

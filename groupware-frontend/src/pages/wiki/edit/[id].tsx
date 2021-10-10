import { useRouter } from 'next/router';
import { useAPIUpdateWiki } from '@/hooks/api/wiki/useAPIUpdateQuestion';
import { useAPIGetWikiDetail } from '@/hooks/api/wiki/useAPIGetWikiDetail';
import { useAPIGetTag } from '@/hooks/api/tag/useAPIGetTag';
import React from 'react';
import WikiForm from 'src/templates/WikiForm';

const EditQuestion = () => {
  const router = useRouter();
  const { id } = router.query as { id: string };
  const { data: wiki } = useAPIGetWikiDetail(id);
  const { data: tags } = useAPIGetTag();

  const { mutate: updateQuestion } = useAPIUpdateWiki({
    onSuccess: () => {
      wiki && router.push('/wiki/' + wiki.id);
    },
  });

  return (
    <WikiForm wiki={wiki} tags={tags} onClickSaveButton={updateQuestion} />
  );
};
export default EditQuestion;

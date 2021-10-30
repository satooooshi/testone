import { useRouter } from 'next/router';
import { useAPIUpdateWiki } from '@/hooks/api/wiki/useAPIUpdateQuestion';
import { useAPIGetWikiDetail } from '@/hooks/api/wiki/useAPIGetWikiDetail';
import { useAPIGetTag } from '@/hooks/api/tag/useAPIGetTag';
import React, { useEffect, useState } from 'react';
import WikiForm from 'src/templates/WikiForm';
import { Progress } from '@chakra-ui/react';
import { useAuthenticate } from 'src/contexts/useAuthenticate';
import { UserRole } from 'src/types';

const EditQuestion = () => {
  const router = useRouter();
  const { id } = router.query as { id: string };
  const { data: wiki, isLoading } = useAPIGetWikiDetail(id);
  const { data: tags } = useAPIGetTag();
  const { user } = useAuthenticate();
  const [visible, setVisible] = useState(false);

  const { mutate: updateQuestion } = useAPIUpdateWiki({
    onSuccess: () => {
      wiki && router.push('/wiki/detail/' + wiki.id);
    },
  });

  const isAllWikiEditable = user?.role === UserRole.ADMIN;

  useEffect(() => {
    if (wiki) {
      if (!isLoading && wiki?.writer?.id !== user?.id && !isAllWikiEditable) {
        router.back();
        return;
      }
      setVisible(true);
    }
  }, [isAllWikiEditable, isLoading, router, user?.id, wiki]);

  if (isLoading || !visible) {
    return <Progress isIndeterminate size="lg" />;
  }

  return (
    <WikiForm wiki={wiki} tags={tags} onClickSaveButton={updateQuestion} />
  );
};
export default EditQuestion;

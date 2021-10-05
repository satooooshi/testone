import { useRouter } from 'next/router';
import { useAPIUpdateWiki } from '@/hooks/api/wiki/useAPIUpdateQuestion';
import { useAPIGetWikiDetail } from '@/hooks/api/wiki/useAPIGetWikiDetail';
import { useAPIGetTag } from '@/hooks/api/tag/useAPIGetTag';
import { uploadStorage } from '@/hooks/api/storage/useAPIUploadStorage';
import QAForm from 'src/templates/QAForm';

const EditQuestion = () => {
  const router = useRouter();
  const { id } = router.query as { id: string };
  const { data: question } = useAPIGetWikiDetail(id);
  const { data: tags } = useAPIGetTag();

  const { mutate: updateQuestion } = useAPIUpdateWiki({
    onSuccess: () => {
      question && router.push('/wiki/' + question.id);
    },
  });

  const handleImageUpload = async (file: File) => {
    const uploadedImageURL = await uploadStorage([file]);
    return uploadedImageURL[0];
  };

  return (
    <>
      <QAForm
        question={question}
        tags={tags}
        onClickSaveButton={updateQuestion}
        handleImageUpload={handleImageUpload}
      />
    </>
  );
};
export default EditQuestion;

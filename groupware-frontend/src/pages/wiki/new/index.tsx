import { useRouter } from 'next/router';
import { useAPICreateWiki } from '@/hooks/api/wiki/useAPICreateWiki';
import { useAPIGetTag } from '@/hooks/api/tag/useAPIGetTag';
import { uploadStorage } from '@/hooks/api/storage/useAPIUploadStorage';
import QAForm from 'src/templates/wiki/QAForm';

const CreateQA = () => {
  const router = useRouter();
  const { data: tags } = useAPIGetTag();

  const { mutate: createQuestion } = useAPICreateWiki({
    onSuccess: () => {
      router.push('/wiki/list');
    },
  });

  const handleImageUpload = async (file: File) => {
    const uploadedImageURL = await uploadStorage([file]);
    return uploadedImageURL[0];
  };

  return (
    <>
      <QAForm
        tags={tags}
        onClickSaveButton={createQuestion}
        handleImageUpload={handleImageUpload}
      />
    </>
  );
};
export default CreateQA;

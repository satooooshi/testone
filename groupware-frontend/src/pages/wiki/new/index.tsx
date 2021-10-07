import { useRouter } from 'next/router';
import { useAPICreateWiki } from '@/hooks/api/wiki/useAPICreateWiki';
import { useAPIGetTag } from '@/hooks/api/tag/useAPIGetTag';
import { uploadStorage } from '@/hooks/api/storage/useAPIUploadStorage';
import QAForm from 'src/templates/QAForm';

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
    if (uploadedImageURL[0] === '413') {
      alert(
        '画像ファイルの容量が大きい為、アップロード出来ませんでした。\n容量が大きくない画像を使用して下さい。',
      );
      return '画像アップロード失敗';
    } else {
      return uploadedImageURL[0];
    }
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

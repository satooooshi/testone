import React, {useEffect} from 'react';
import {useAPICreateWiki} from '../../../hooks/api/wiki/useAPICreateWiki';
import {RuleCategory, Wiki, WikiType} from '../../../types';
import {EditWikiProps} from '../../../types/navigator/screenProps/Wiki';
import {useFormik} from 'formik';
import {wikiSchema} from '../../../utils/validation/schema';
import {useAPIGetTag} from '../../../hooks/api/tag/useAPIGetTag';
import {useSelectedTags} from '../../../hooks/tag/useSelectedTags';
import WikiForm from '../../../templates/wiki/WikiForm';
import {useAPIUploadStorage} from '../../../hooks/api/storage/useAPIUploadStorage';
import {uploadImageFromGallery} from '../../../utils/cropImage/uploadImageFromGallery';
import {ActivityIndicator} from 'react-native';
import {Overlay} from 'react-native-magnus';
import {useAPIGetWikiDetail} from '../../../hooks/api/wiki/useAPIGetWikiDetail';

const EditWiki: React.FC<EditWikiProps> = ({route, navigation}) => {
  const {id} = route.params;
  const {data: wiki} = useAPIGetWikiDetail(id);
  const {mutate: saveWiki, isLoading: loadingSaveWiki} = useAPICreateWiki({
    onSuccess: () => {
      navigation.goBack();
    },
  });
  const {data: tags} = useAPIGetTag();
  const {mutate: uploadImage, isLoading: loadingUploadImage} =
    useAPIUploadStorage();
  const isLoading = loadingSaveWiki || loadingUploadImage;
  const {selectedTags} = useSelectedTags();
  const initialValues: Partial<Wiki> = {
    title: '',
    body: '',
    tags: [],
    type: WikiType.QA,
    ruleCategory: RuleCategory.OTHERS,
    textFormat: 'html',
  };
  const {setValues: setNewWiki} = useFormik({
    enableReinitialize: true,
    initialValues,
    validationSchema: wikiSchema,
    onSubmit: w => {
      saveWiki(w);
    },
  });

  const handleUploadImage = async (onSuccess: (imageURL: string[]) => void) => {
    const {formData} = await uploadImageFromGallery();
    if (formData) {
      uploadImage(formData, {onSuccess});
    }
  };

  useEffect(() => {
    setNewWiki(w => ({...w, tags: selectedTags}));
  }, [selectedTags, setNewWiki]);

  return (
    <>
      <Overlay visible={isLoading} p="xl">
        <ActivityIndicator />
      </Overlay>
      <WikiForm
        wiki={wiki}
        onUploadImage={handleUploadImage}
        tags={tags || []}
        saveWiki={saveWiki}
      />
    </>
  );
};

export default EditWiki;

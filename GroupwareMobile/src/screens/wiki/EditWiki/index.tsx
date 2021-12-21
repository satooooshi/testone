import React, {useEffect} from 'react';
import {useAPICreateWiki} from '../../../hooks/api/wiki/useAPICreateWiki';
import {RuleCategory, Wiki, WikiType} from '../../../types';
import {useFormik} from 'formik';
import {wikiSchema} from '../../../utils/validation/schema';
import {useAPIGetTag} from '../../../hooks/api/tag/useAPIGetTag';
import {useSelectedTags} from '../../../hooks/tag/useSelectedTags';
import WikiForm from '../../../templates/wiki/WikiForm';
import {useAPIUploadStorage} from '../../../hooks/api/storage/useAPIUploadStorage';
import {uploadImageFromGallery} from '../../../utils/cropImage/uploadImageFromGallery';
import {ActivityIndicator, Alert} from 'react-native';
import {Overlay} from 'react-native-magnus';
import {useAPIGetWikiDetail} from '../../../hooks/api/wiki/useAPIGetWikiDetail';
import {useNavigation, useRoute} from '@react-navigation/native';
import {
  EditWikiNavigationProps,
  EditWikiRouteProps,
} from '../../../types/navigator/drawerScreenProps';
import {AxiosError} from 'axios';

const EditWiki: React.FC = () => {
  const navigation = useNavigation<EditWikiNavigationProps>();
  const route = useRoute<EditWikiRouteProps>();
  const {id} = route.params;
  const {data: wiki} = useAPIGetWikiDetail(id);
  const {mutate: saveWiki, isLoading: loadingSaveWiki} = useAPICreateWiki({
    onSuccess: () => {
      navigation.goBack();
    },
    onError: () => {
      Alert.alert(
        'Wiki更新中にエラーが発生しました。\n時間をおいて再実行してください。',
      );
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

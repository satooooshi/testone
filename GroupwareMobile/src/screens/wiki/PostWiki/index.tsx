import {useNavigation, useRoute} from '@react-navigation/native';
import React, {useEffect} from 'react';
import {useAPICreateWiki} from '../../../hooks/api/wiki/useAPICreateWiki';
import {BoardCategory, RuleCategory, Tag, Wiki, WikiType} from '../../../types';
import {useFormik} from 'formik';
import {wikiSchema} from '../../../utils/validation/schema';
import {useAPIGetTag} from '../../../hooks/api/tag/useAPIGetTag';
import {useSelectedTags} from '../../../hooks/tag/useSelectedTags';
import WikiForm from '../../../templates/wiki/WikiForm';
import {useAPIUploadStorage} from '../../../hooks/api/storage/useAPIUploadStorage';
import {uploadImageFromGallery} from '../../../utils/cropImage/uploadImageFromGallery';
import {ActivityIndicator, Alert} from 'react-native';
import {Overlay} from 'react-native-magnus';
import {
  PostWikiNavigationProps,
  PostWikiRouteProps,
} from '../../../types/navigator/drawerScreenProps';

const PostWiki: React.FC = () => {
  const navigation = useNavigation<PostWikiNavigationProps>();
  const route = useRoute<PostWikiRouteProps>();
  const type = route.params?.type;
  const ruleCategory = route.params?.ruleCategory;
  const boardCategory = route.params?.boardCategory;
  const {mutate: saveWiki, isLoading: loadingSaveWiki} = useAPICreateWiki({
    onSuccess: () => {
      navigation.goBack();
    },
    onError: () => {
      Alert.alert(
        'Wiki作成中にエラーが発生しました。\n時間をおいて再実行してください。',
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
    type: type || WikiType.BOARD,
    ruleCategory: ruleCategory || RuleCategory.NON_RULE,
    boardCategory: boardCategory || BoardCategory.QA,
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
    setNewWiki(w => ({...w, tags: selectedTags as Tag[]}));
  }, [selectedTags, setNewWiki]);

  return (
    <>
      <Overlay visible={isLoading} p="xl">
        <ActivityIndicator />
      </Overlay>
      <WikiForm
        onUploadImage={handleUploadImage}
        tags={tags || []}
        type={type}
        ruleCategory={ruleCategory}
        saveWiki={saveWiki}
      />
    </>
  );
};

export default PostWiki;

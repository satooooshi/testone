import React, {useEffect} from 'react';
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
import {useAPIGetWikiDetail} from '../../../hooks/api/wiki/useAPIGetWikiDetail';
import {useIsFocused, useNavigation, useRoute} from '@react-navigation/native';
import {
  EditWikiNavigationProps,
  EditWikiRouteProps,
} from '../../../types/navigator/drawerScreenProps';
import {useAPIUpdateWiki} from '../../../hooks/api/wiki/useAPIUpdateQuestion';
import {responseErrorMsgFactory} from '../../../utils/factory/responseEroorMsgFactory';
import {useIsTabBarVisible} from '../../../contexts/bottomTab/useIsTabBarVisible';

const EditWiki: React.FC = () => {
  const navigation = useNavigation<EditWikiNavigationProps>();
  const route = useRoute<EditWikiRouteProps>();
  const {id} = route.params;
  const isFocused = useIsFocused();
  const {setIsTabBarVisible} = useIsTabBarVisible();
  const {data: wiki} = useAPIGetWikiDetail(id);
  const {mutate: saveWiki, isLoading: loadingSaveWiki} = useAPIUpdateWiki({
    onSuccess: () => {
      Alert.alert('Wikiを編集しました。');
      navigation.goBack();
    },
    onError: e => {
      Alert.alert(responseErrorMsgFactory(e));
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
    type: WikiType.BOARD,
    ruleCategory: RuleCategory.NON_RULE,
    boardCategory: BoardCategory.QA,
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
    if (isFocused) {
      setIsTabBarVisible(false);
    } else {
      setIsTabBarVisible(true);
    }
  }, [isFocused, setIsTabBarVisible]);

  useEffect(() => {
    setNewWiki(w => ({...w, tags: selectedTags as Tag[]}));
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

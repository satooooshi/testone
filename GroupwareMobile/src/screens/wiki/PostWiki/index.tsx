import {useNavigation, useRoute} from '@react-navigation/native';
import React, {useEffect} from 'react';
import {useAPICreateWiki} from '../../../hooks/api/wiki/useAPICreateWiki';
import {RuleCategory, Wiki, WikiType} from '../../../types';
import {
  PostWikiNavigationProps,
  PostWikiRouteProps,
} from '../../../types/navigator/screenProps/Wiki';
import {useFormik} from 'formik';
import {wikiSchema} from '../../../utils/validation/schema';
import {useAPIGetTag} from '../../../hooks/api/tag/useAPIGetTag';
import {useSelectedTags} from '../../../hooks/tag/useSelectedTags';
import WikiForm from '../../../templates/wiki/WikiForm';

const PostWiki: React.FC = () => {
  const navigation = useNavigation<PostWikiNavigationProps>();
  const route = useRoute<PostWikiRouteProps>();
  const type = route.params?.type;
  const {mutate: saveWiki} = useAPICreateWiki({
    onSuccess: () => {
      navigation.goBack();
    },
  });
  const {data: tags} = useAPIGetTag();
  const {selectedTags} = useSelectedTags();
  const initialValues: Partial<Wiki> = {
    title: '',
    body: '',
    tags: [],
    type: type || WikiType.QA,
    ruleCategory: type ? RuleCategory.RULES : RuleCategory.OTHERS,
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

  useEffect(() => {
    setNewWiki(w => ({...w, tags: selectedTags}));
  }, [selectedTags, setNewWiki]);

  return <WikiForm tags={tags || []} type={type} saveWiki={saveWiki} />;
};

export default PostWiki;

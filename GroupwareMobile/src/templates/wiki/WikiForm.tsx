import React, {useRef} from 'react';
import {Wiki, WikiType, RuleCategory} from '../../types';
import WholeContainer from '../../components/WholeContainer';
import {ScrollDiv, Text, Button, Dropdown} from 'react-native-magnus';
import AppHeader from '../../components/Header';
// import {useAPICreateWiki} from '../../hooks/api/wiki/useAPICreateWiki';
// import {useFormik} from 'formik';
// import {wikiSchema} from '../../utils/validation/schema';
import {wikiTypeNameFactory} from '../../utils/factory/wiki/wikiTypeNameFactory';

type WikiFormProps = {
  wiki?: Wiki;
};

const WikiForm: React.FC<WikiFormProps> = (/* {wiki: existWiki} */) => {
  // const initialValues: Partial<Wiki> = existWiki || {
  //   title: '',
  //   body: '',
  //   ruleCategory: RuleCategory.OTHERS,
  //   textFormat: 'html',
  // };
  // const {mutate: createWiki} = useAPICreateWiki();
  // const {values, handleSubmit} = useFormik({
  //   initialValues,
  //   onSubmit: values => {
  //     createWiki(values);
  //   },
  //   validationSchema: wikiSchema,
  // });
  //@FIXME type annotation
  const typeDropdownRef = useRef<any | null>(null);

  return (
    <WholeContainer>
      <AppHeader title="内容を編集" />
      <ScrollDiv>
        <Text fontSize={18}>タイトル</Text>
        <Text fontWeight="bold" fontSize={18}>
          タイプを選択してください
        </Text>
        <Button
          block
          bg="pink500"
          mt="sm"
          p="md"
          color="white"
          onPress={() => typeDropdownRef.current?.open()}>
          Open Dropdown
        </Button>
        <Dropdown
          ref={typeDropdownRef}
          m="md"
          pb="md"
          bg="transparent"
          showSwipeIndicator={false}
          roundedTop="xl">
          <Dropdown.Option
            value={RuleCategory.RULES}
            block
            bg="gray100"
            color="blue600"
            py="lg"
            px="xl"
            borderBottomWidth={1}
            borderBottomColor="gray200"
            justifyContent="center"
            roundedTop="lg">
            {wikiTypeNameFactory(WikiType.RULES, RuleCategory.RULES)}
          </Dropdown.Option>
          <Dropdown.Option
            value={RuleCategory.PHILOSOPHY}
            block
            bg="gray100"
            color="blue600"
            py="lg"
            px="xl"
            borderBottomWidth={1}
            borderBottomColor="gray200"
            justifyContent="center"
            roundedTop="lg">
            {wikiTypeNameFactory(WikiType.RULES, RuleCategory.PHILOSOPHY)}
          </Dropdown.Option>
          <Dropdown.Option
            value={RuleCategory.ABC}
            block
            bg="gray100"
            color="blue600"
            py="lg"
            px="xl"
            borderBottomWidth={1}
            borderBottomColor="gray200"
            justifyContent="center"
            roundedTop="lg">
            {wikiTypeNameFactory(WikiType.RULES, RuleCategory.BENEFITS)}
          </Dropdown.Option>
          <Dropdown.Option
            value={RuleCategory.BENEFITS}
            block
            bg="gray100"
            color="blue600"
            py="lg"
            px="xl"
            borderBottomWidth={1}
            borderBottomColor="gray200"
            justifyContent="center"
            roundedTop="lg">
            {wikiTypeNameFactory(WikiType.RULES, RuleCategory.BENEFITS)}
          </Dropdown.Option>
          <Dropdown.Option
            value={RuleCategory.DOCUMENT}
            block
            bg="gray100"
            color="blue600"
            py="lg"
            px="xl"
            borderBottomWidth={1}
            borderBottomColor="gray200"
            justifyContent="center"
            roundedTop="lg">
            {wikiTypeNameFactory(WikiType.RULES, RuleCategory.DOCUMENT)}
          </Dropdown.Option>
        </Dropdown>
      </ScrollDiv>
    </WholeContainer>
  );
};

export default WikiForm;

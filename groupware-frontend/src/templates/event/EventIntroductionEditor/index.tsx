import eventPRStyles from '@/styles/layouts/EventPR.module.scss';
import { EventTab } from 'src/types/header/tab/types';
import Image from 'next/image';
import { useFormik } from 'formik';
import { EventIntroduction, EventType } from 'src/types';
import { editEventIntroductionSchema } from 'src/utils/validation/schema';
import { Input } from '@chakra-ui/input';
import { Textarea } from '@chakra-ui/textarea';
import { FormControl, FormLabel } from '@chakra-ui/form-control';
import { Button } from '@chakra-ui/button';
import { formikErrorMsgFactory } from 'src/utils/factory/formikErrorMsgFactory';
import { useToast } from '@chakra-ui/toast';

export interface EventIntroductionEditorProps {
  headlineImgSource: string;
  bottomImgSources: string[];
  heading: EventTab;
  subHeading: string;
  content: string;
}

const EventIntroductionEditor: React.FC<EventIntroductionEditorProps> = ({
  headlineImgSource,
  bottomImgSources,
  heading,
  subHeading,
  content,
}) => {
  const toast = useToast();
  const initialEventIntroductionValues: Partial<EventIntroduction> = {
    type: EventType.CLUB,
    title: subHeading,
    description: content,
    imageUrl: headlineImgSource.toString(),
    imageUrlSub1: bottomImgSources[0].toString(),
    imageUrlSub2: bottomImgSources[1].toString(),
    imageUrlSub3: bottomImgSources[2].toString(),
    imageUrlSub4: bottomImgSources[3].toString(),
  };
  const {
    handleSubmit,
    handleBlur,
    setValues: setEventIntroductionInfo,
    values,
    validateForm,
  } = useFormik({
    initialValues: initialEventIntroductionValues,
    onSubmit: async (submitted, { resetForm }) => {
      resetForm;
    },
    validationSchema: editEventIntroductionSchema,
  });

  const checkErrors = async () => {
    const errors = await validateForm();
    const messages = formikErrorMsgFactory(errors);
    if (messages) {
      toast({
        description: messages,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } else {
      handleSubmit();
    }
  };

  return (
    <div className={eventPRStyles.main_wrapper}>
      <div className={eventPRStyles.top_title_wrapper}>
        <p className={eventPRStyles.culture}>culture</p>
        <p className={eventPRStyles.top_title}>{heading}</p>
      </div>
      <div className={eventPRStyles.top_images_wrapper}>
        <div className={eventPRStyles.main_image_wrapper}>
          <img src={initialEventIntroductionValues.imageUrl} alt="" />
        </div>
      </div>
      <div className={eventPRStyles.latest_events_wrapper}>
        <div className={eventPRStyles.info_wrapper}>
          <div className={eventPRStyles.title_wrapper}>
            <FormControl id="title">
              <FormLabel>タイトル</FormLabel>
              <Input
                type="text"
                placeholder="タイトルを記入してください。"
                value={values.title}
                background="white"
                onChange={(e) =>
                  setEventIntroductionInfo((i) => ({
                    ...i,
                    title: e.target.value,
                  }))
                }
                name="title"
                onBlur={handleBlur}
              />
            </FormControl>
          </div>
          <div className={eventPRStyles.description_wrapper}>
            <FormControl id="description">
              <FormLabel>説明文</FormLabel>
              <Textarea
                height="max( 240px, 30vh )"
                type="text"
                placeholder="説明文を記入してください。"
                value={values.description}
                background="white"
                onChange={(e) =>
                  setEventIntroductionInfo((i) => ({
                    ...i,
                    description: e.target.value,
                  }))
                }
                name="description"
                onBlur={handleBlur}
              />
            </FormControl>
          </div>
          <div className={eventPRStyles.edit_button_wrapper}>
            <Button
              width="40"
              colorScheme="blue"
              onClick={() => {
                checkErrors();
              }}>
              更新
            </Button>
          </div>
        </div>
        <div className={eventPRStyles.bottom_images_row}>
          {bottomImgSources !== [''] &&
            bottomImgSources.map((bottomImgSource, id) => (
              <div key={id} className={eventPRStyles.bottom_image_wrapper}>
                <img src={bottomImgSource} alt="" />
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default EventIntroductionEditor;

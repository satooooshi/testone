import eventPRStyles from '@/styles/layouts/EventPR.module.scss';
import { useFormik } from 'formik';
import { EventIntroduction } from 'src/types';
import { editEventIntroductionSchema } from 'src/utils/validation/schema';
import { Input } from '@chakra-ui/input';
import { Textarea } from '@chakra-ui/textarea';
import { FormControl, FormLabel } from '@chakra-ui/form-control';
import { Button } from '@chakra-ui/button';
import { formikErrorMsgFactory } from 'src/utils/factory/formikErrorMsgFactory';
import { useToast } from '@chakra-ui/toast';
import eventTypeNameFactory from 'src/utils/factory/eventTypeNameFactory';

const EventIntroductionEditor: React.FC<Partial<EventIntroduction>> = ({
  type,
  title,
  description,
  imageUrl,
  imageUrlSub1,
  imageUrlSub2,
  imageUrlSub3,
  imageUrlSub4,
}) => {
  const toast = useToast();
  const initialEventIntroductionValues: Partial<EventIntroduction> = {
    type: type,
    title: title,
    description: description,
    imageUrl: imageUrl,
    imageUrlSub1: imageUrlSub1,
    imageUrlSub2: imageUrlSub2,
    imageUrlSub3: imageUrlSub3,
    imageUrlSub4: imageUrlSub4,
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
  const eventTypeName = type ? eventTypeNameFactory(type) : '';

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
        <p className={eventPRStyles.top_title}>{eventTypeName}</p>
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
          <div className={eventPRStyles.bottom_image_wrapper}>
            <img src={imageUrlSub1} alt="" />
          </div>
          <div className={eventPRStyles.bottom_image_wrapper}>
            <img src={imageUrlSub2} alt="" />
          </div>
          <div className={eventPRStyles.bottom_image_wrapper}>
            <img src={imageUrlSub3} alt="" />
          </div>
          <div className={eventPRStyles.bottom_image_wrapper}>
            <img src={imageUrlSub4} alt="" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventIntroductionEditor;

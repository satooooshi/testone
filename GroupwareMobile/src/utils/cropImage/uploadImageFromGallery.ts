import {Platform} from 'react-native';
import ImagePicker, {Image, Options} from 'react-native-image-crop-picker';

export const uploadImageFromGallery = async (
  options: Options = {
    cropping: true,
    mediaType: 'photo',
    multiple: false,
  },
): Promise<{formData: FormData | undefined; mime: string}> => {
  const photo = await ImagePicker.openPicker(options);
  console.log(photo);
  const mime = photo.mime;
  const formData = imagePickerResponseToFormData(photo);
  return {formData, mime};
};

export const imagePickerResponseToFormData = (
  imagePickerResponse: Image | Image[],
): FormData | undefined => {
  const formData = new FormData();
  if (Array.isArray(imagePickerResponse)) {
    for (const image of imagePickerResponse) {
      formData.append('files', {
        name:
          Platform.OS === 'android'
            ? image.path.split('/').slice(-1)[0]
            : image.filename,
        type: image.mime,
        uri: image.path,
      });
    }
    return formData;
  }
  formData.append('files', {
    name:
      Platform.OS === 'android'
        ? imagePickerResponse.path.split('/').slice(-1)[0]
        : imagePickerResponse.filename,
    type: imagePickerResponse.mime,
    uri: imagePickerResponse.path,
  });
  return formData;
};

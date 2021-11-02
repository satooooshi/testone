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
  const mime = photo.mime;
  const formData = imagePickerResponseToFormData(photo);
  return {formData, mime};
};

export const imagePickerResponseToFormData = (
  imagePickerResponse: Image,
): FormData | undefined => {
  const formData = new FormData();
  formData.append('files', {
    name:
      Platform.OS === 'android'
        ? imagePickerResponse.path.split('/').slice(-1)[0]
        : imagePickerResponse.filename,
    type: imagePickerResponse.mime,
    uri:
      Platform.OS === 'android'
        ? imagePickerResponse.path
        : imagePickerResponse.sourceURL?.replace('file://', ''),
  });
  return formData;
};

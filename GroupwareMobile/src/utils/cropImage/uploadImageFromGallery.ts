import {Alert, Platform} from 'react-native';
import ImagePicker, {
  Image,
  Options,
  PickerErrorCode,
} from 'react-native-image-crop-picker';

export const uploadImageFromGallery = async (
  options: Options = {
    cropping: true,
    mediaType: 'photo',
    multiple: false,
  },
): Promise<{formData: FormData | undefined; mime: string | undefined}> => {
  try {
    const optionsExec: Options =
      options.mediaType === 'photo' ? {...options, forceJpg: true} : options;
    const photo = await ImagePicker.openPicker(optionsExec);
    const mime = photo.mime;
    const formData = imagePickerResponseToFormData(photo);
    return {formData, mime};
  } catch (err) {
    const code = (err as {code: PickerErrorCode})?.code;
    switch (code) {
      case 'E_PICKER_CANCELLED':
        break;
      case 'E_NO_IMAGE_DATA_FOUND':
        Alert.alert(
          'ギャラリーの表示に失敗しました。\n端末の設定からアプリにアクセスの許可がされているかご確認ください。',
        );
        break;
      case 'E_NO_LIBRARY_PERMISSION':
        Alert.alert(
          'ギャラリーの表示に失敗しました。\n端末の設定からアプリにアクセスの許可がされているかご確認ください。',
        );
        break;
      case 'E_NO_CAMERA_PERMISSION':
        Alert.alert(
          'カメラの表示に失敗しました。\n端末の設定からアプリにアクセスの許可がされているかご確認ください。',
        );
        break;
      case 'E_PICKER_CANNOT_RUN_CAMERA_ON_SIMULATOR':
        Alert.alert('シミュレーターでカメラの使用はできません。');
        break;
      case 'E_CROPPER_IMAGE_NOT_FOUND':
        Alert.alert('エラーが発生しました。');
        break;
      case 'E_CANNOT_SAVE_IMAGE':
        Alert.alert('エラーが発生しました。');
        break;
      case 'E_ACTIVITY_DOES_NOT_EXIST':
        Alert.alert('エラーが発生しました。');
        break;
      case 'E_CALLBACK_ERROR':
        Alert.alert('エラーが発生しました。');
        break;
      case 'E_FAILED_TO_SHOW_PICKER':
        Alert.alert(
          'ギャラリーの表示に失敗しました。\n端末の設定からアプリにアクセスの許可がされているかご確認ください。',
        );
        break;
      case 'E_FAILED_TO_OPEN_CAMERA':
        Alert.alert(
          'ギャラリーの表示に失敗しました。\n端末の設定からアプリにアクセスの許可がされているかご確認ください。',
        );
        break;
      case 'E_CAMERA_IS_NOT_AVAILABLE':
        Alert.alert(
          'ギャラリーの表示に失敗しました。\n端末の設定からアプリにアクセスの許可がされているかご確認ください。',
        );
        break;
      case 'E_CANNOT_LAUNCH_CAMERA':
        Alert.alert(
          'カメラの表示に失敗しました。\n端末の設定からアプリにアクセスの許可がされているかご確認ください。',
        );
        break;
    }

    return {formData: undefined, mime: undefined};
  }
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

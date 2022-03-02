import {AxiosError} from 'axios';
import DocumentPicker from 'react-native-document-picker';
import {UseMutateFunction} from 'react-query';

const normalizeURL = (url: string) => {
  const filePrefix = 'file://';
  if (url.startsWith(filePrefix)) {
    url = url.substring(filePrefix.length);
    url = decodeURI(url);
    return url;
  }
};

export const handlePickDocument = async (
  uploadFile: UseMutateFunction<
    string[],
    AxiosError<unknown, any>,
    FormData,
    unknown
  >,
) => {
  try {
    const res = await DocumentPicker.pickSingle({
      type: [DocumentPicker.types.allFiles],
    });
    const formData = new FormData();
    formData.append('files', {
      name: res.name,
      uri: normalizeURL(res.uri),
      type: res.type,
    });
    uploadFile(formData);
  } catch (err) {
    if (DocumentPicker.isCancel(err)) {
    } else {
      throw err;
    }
  }
};

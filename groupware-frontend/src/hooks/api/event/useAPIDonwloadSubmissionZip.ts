import { useMutation } from 'react-query';
import { axiosInstance } from 'src/utils/url';
import { downloadSubmissionZipURL } from 'src/utils/url/event.url';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import axios, { AxiosError } from 'axios';
import { SubmissionFile } from 'src/types';
import { fileNameTransformer } from 'src/utils/factory/fileNameTransformer';
import { readStorageURL } from 'src/utils/url/storage.url';

export interface QueryToGetZipSubmission {
  id?: string;
  name: string;
}

const downloadZip = async (query: QueryToGetZipSubmission) => {
  let queryParam = '?';
  const { id, name } = query;
  if (id) {
    queryParam = `${queryParam}id=${id}`;
  }
  const res = await axiosInstance.get(downloadSubmissionZipURL + queryParam);
  const submissions: SubmissionFile[] = res.data;
  const storageURLs = submissions.map((s) => s.url);
  const signedUrlRes = await axiosInstance.post<string[]>(
    readStorageURL,
    storageURLs,
  );
  const zip = new JSZip();
  const folder = zip.folder(name.replace(' ', '_'));
  for (let i = 0; i <= submissions.length - 1; i++) {
    const userName = `${submissions[i].userSubmitted?.lastName}_${submissions[i].userSubmitted?.firstName}`;
    const fileName = userName + '_' + fileNameTransformer(submissions[i].url);
    const blobRes = await axios.get<Blob>(signedUrlRes.data[i], {
      responseType: 'blob',
      withCredentials: false,
    });
    folder?.file(fileName, blobRes.data);
  }
  const content = await zip.generateAsync({ type: 'blob' });
  return content;
};

export const useAPIDonwloadSubmissionZip = () => {
  return useMutation<any, AxiosError, QueryToGetZipSubmission>(downloadZip, {
    onSuccess: async (data, variables) => {
      const { name } = variables;
      saveAs(data, name);
    },
    onError: () => {
      alert('zipファイルのダウンロード時にエラーが発生しました');
    },
  });
};

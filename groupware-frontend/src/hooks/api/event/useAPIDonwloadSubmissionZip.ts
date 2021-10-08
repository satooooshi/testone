import { useMutation } from 'react-query';
import { axiosInstance } from 'src/utils/url';
import { downloadSubmissionZipURL } from 'src/utils/url/event.url';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';

export interface QueryToGetZipSubmission {
  id?: string;
  name: string;
}

const downloadZip = async (query: QueryToGetZipSubmission) => {
  let queryParam = '?';
  const { id } = query;
  if (id) {
    queryParam = `${queryParam}id=${id}`;
  }
  const res = await axiosInstance.get(downloadSubmissionZipURL + queryParam);
  return res.data;
};

export const useAPIDonwloadSubmissionZip = () => {
  return useMutation<any, Error, QueryToGetZipSubmission>(downloadZip, {
    onSuccess: async (data, variables) => {
      const { name } = variables;
      const fileName = name;
      const zip = new JSZip();
      const blob = await (
        await zip.loadAsync(data, { base64: true })
      ).generateAsync({ type: 'blob' });
      saveAs(blob, fileName);
    },
  });
};

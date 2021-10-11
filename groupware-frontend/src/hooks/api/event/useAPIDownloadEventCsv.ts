import { useMutation } from 'react-query';
import { dateTimeFormatterFromJSDDate } from 'src/utils/dateTimeFormatter';
import { axiosInstance } from 'src/utils/url';
import { downloadEventCsvURL } from 'src/utils/url/event.url';

export interface QueryToGetEventCsv {
  id?: string;
  from?: Date;
  to?: Date;
  name?: string;
}

const downloadCsv = async (query: QueryToGetEventCsv) => {
  let queryParam = '?';
  const { id, from, to } = query;
  if (id) {
    queryParam = `${queryParam}id=${id}`;
  }
  if (from) {
    queryParam = `${queryParam}from=${dateTimeFormatterFromJSDDate({
      dateTime: from,
      format: 'yyyy-LL-dd',
    })}`;
  }
  if (to) {
    queryParam = `${queryParam}&to=${dateTimeFormatterFromJSDDate({
      dateTime: to,
      format: 'yyyy-LL-dd',
    })}`;
  }
  const res = await axiosInstance.get(downloadEventCsvURL + queryParam);
  return res.data;
};

export const useAPIDownloadEventCsv = () => {
  return useMutation<string, Error, QueryToGetEventCsv>(downloadCsv, {
    onSuccess: (data, variables) => {
      const { from, to, name } = variables;
      let fileName = name || '';
      if (from && to) {
        const fromDate = dateTimeFormatterFromJSDDate({
          dateTime: from,
          format: 'yyyy-LL-dd',
        });
        const toDate = dateTimeFormatterFromJSDDate({
          dateTime: to,
          format: 'yyyy-LL-dd',
        });
        fileName = `${fromDate}~${toDate} イベント`;
      }
      if (!fileName) {
        fileName = `イベント`;
      }
      const bom = new Uint8Array([0xef, 0xbb, 0xbf]);
      const downloadLink = document.createElement('a');
      downloadLink.download = fileName + '.csv';
      downloadLink.href = URL.createObjectURL(
        new Blob([bom, data], { type: 'text/csv' }),
      );
      downloadLink.dataset.downloadurl = [
        'text/csv',
        downloadLink.download,
        downloadLink.href,
      ].join(':');
      downloadLink.click();
    },
  });
};

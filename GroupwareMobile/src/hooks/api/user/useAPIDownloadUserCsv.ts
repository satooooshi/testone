import {AxiosError} from 'axios';
import {useMutation} from 'react-query';
import {dateTimeFormatterFromJSDDate} from '../../../utils/dateTimeFormatterFromJSDate';
import {axiosInstance} from '../../../utils/url';
import {downloadUserCsvURL} from '../../../utils/url/user.url';

export interface QueryToGetUserCsv {
  from?: Date;
  to?: Date;
}

const donwloadCsv = async (query: QueryToGetUserCsv) => {
  let queryParam = '?';
  const {from, to} = query;
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
  const res = await axiosInstance.get<string>(downloadUserCsvURL + queryParam);
  return res.data;
};

export const useAPIDownloadUserCsv = () => {
  return useMutation<string, AxiosError, QueryToGetUserCsv>(donwloadCsv, {
    //@TODO download
    // onSuccess: (data, variables) => {
    //   const {from, to} = variables;
    //   let fileName = '';
    //   const bom = new Uint8Array([0xef, 0xbb, 0xbf]);
    //   if (from && to) {
    //     const fromDate = dateTimeFormatterFromJSDDate({
    //       dateTime: from,
    //       format: 'yyyy-LL-dd',
    //     });
    //     const toDate = dateTimeFormatterFromJSDDate({
    //       dateTime: to,
    //       format: 'yyyy-LL-dd',
    //     });
    //     fileName = `${fromDate} ~ ${toDate} 社員`;
    //   }
    //   if (!fileName) {
    //     fileName = `社員`;
    //   }
    //
    //   const downloadLink = document.createElement('a');
    //   downloadLink.download = fileName + '.csv';
    //   downloadLink.href = URL.createObjectURL(
    //     new Blob([bom, data], {type: 'text/csv'}),
    //   );
    //   downloadLink.dataset.downloadurl = [
    //     'text/csv',
    //     downloadLink.download,
    //     downloadLink.href,
    //   ].join(':');
    //   downloadLink.click();
    // },
  });
};

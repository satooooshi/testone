import { AxiosError } from 'axios';
import { useQuery, UseQueryOptions } from 'react-query';
import { ApplicationBeforeJoining } from 'src/types';
import { axiosInstance } from 'src/utils/url';
import { applicationURL } from 'src/utils/url/attendance.url';

const getApplication = async () => {
  const res = await axiosInstance.get<ApplicationBeforeJoining[]>(
    applicationURL,
  );
  return res.data;
};

export const useAPIGetApplication = (
  options?: UseQueryOptions<ApplicationBeforeJoining[], AxiosError>,
) => {
  return useQuery<ApplicationBeforeJoining[], AxiosError>(
    'getApplications',
    getApplication,
    options,
  );
};

import { AxiosError } from 'axios';
import { useMutation, UseMutationOptions } from 'react-query';
import { EventIntroduction } from 'src/types';
import { axiosInstance } from 'src/utils/url';
import { saveEventIntroductionURL } from 'src/utils/url/event.url';
import { jsonHeader } from 'src/utils/url/header';

const saveEventIntroduction = async (
  eventIntroduction: Partial<EventIntroduction>,
): Promise<EventIntroduction> => {
  const res = await axiosInstance.patch(
    saveEventIntroductionURL,
    eventIntroduction,
    {
      headers: jsonHeader,
    },
  );
  return res.data;
};

export const useAPISaveEventIntroduction = (
  mutationOptions?: UseMutationOptions<
    EventIntroduction,
    AxiosError,
    Partial<EventIntroduction>,
    unknown
  >,
) => {
  return useMutation<EventIntroduction, AxiosError, Partial<EventIntroduction>>(
    saveEventIntroduction,
    mutationOptions,
  );
};

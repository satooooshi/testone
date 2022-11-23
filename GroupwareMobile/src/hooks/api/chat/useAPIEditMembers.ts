import {AxiosError} from 'axios';
import {useMutation} from 'react-query';
import {User, ChatGroup} from '../../../types';
import {axiosInstance} from '../../../utils/url';
import {editMembersURL} from '../../../utils/url/chat.url';

export type EditMembersQuery = {
  roomId: number;
  members: User[];
};

const editMembers = async (query: EditMembersQuery) => {
  const res = await axiosInstance.patch<ChatGroup>(
    editMembersURL(query.roomId),
    query.members,
  );
  return res.data;
};

export const useAPIEditMembers = () => {
  return useMutation<ChatGroup, AxiosError, EditMembersQuery, unknown>(
    editMembers,
  );
};

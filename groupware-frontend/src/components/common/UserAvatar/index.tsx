import { Avatar, AvatarProps } from '@chakra-ui/react';
import Link from 'next/link';
import React from 'react';
import { User } from 'src/types';
import noImage from '@/public/no-image.jpg';

type UserAvatarProps = AvatarProps & {
  user?: Partial<User>;
};

const UserAvatar: React.FC<UserAvatarProps> = (props) => {
  const { user } = props;
  return (
    <Link href={`/account/${user?.id}`} passHref>
      <Avatar
        h="40px"
        w="40px"
        cursor="pointer"
        {...props}
        src={!user?.existence ? noImage.src : user?.avatarUrl}
      />
    </Link>
  );
};

export default UserAvatar;

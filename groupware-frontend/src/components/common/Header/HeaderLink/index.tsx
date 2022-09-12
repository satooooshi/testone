import React from 'react';
import { Link, Text } from '@chakra-ui/react';
import { Tab } from 'src/types/header/tab/types';

type HeaderLinkProps = {
  t: Tab;
  activeTabName?: string;
};

const HeaderLink: React.FC<HeaderLinkProps> = ({ t, activeTabName }) => {
  return (
    <>
      <Link
        style={{ textDecoration: 'none' }}
        key={t.name}
        h="100%"
        href={t.href}
        onClick={t.onClick}
        px={3}
        display="flex"
        alignItems="center"
        whiteSpace="nowrap"
        borderBottomColor={t.name === activeTabName ? 'blue.500' : undefined}
        borderBottomWidth={t.name === activeTabName ? 2 : undefined}>
        <Text
          color={t.name === activeTabName ? 'blue.500' : undefined}
          fontWeight="bold">
          {t.name}
        </Text>
      </Link>
    </>
  );
};

export default HeaderLink;

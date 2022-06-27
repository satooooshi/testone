import { Box, Link, Text, useMediaQuery } from '@chakra-ui/react';
import React from 'react';
import { hideScrollbarCss } from 'src/utils/chakra/hideScrollBar.css';
import { darkFontColor } from 'src/utils/colors';

export type TopTabBehavior = {
  tabName: string;
  onClick: () => void;
  isActiveTab: boolean;
};

type TopTabBarProps = {
  topTabBehaviorList: TopTabBehavior[];
};
const TopTabBar: React.FC<TopTabBarProps> = ({ topTabBehaviorList }) => {
  const tabCount = topTabBehaviorList.length;
  const [isSmallerThan768] = useMediaQuery('(max-width: 768px)');
  return (
    <Box
      mx="auto"
      alignSelf="center"
      display="flex"
      flexDir="row"
      alignItems="center"
      w="100%"
      // w={isSmallerThan768 ? '100vw' : '80vw'}
      px={isSmallerThan768 ? '5%' : undefined}
      h="40px"
      borderBottomWidth={1}
      borderBottomColor={'gray.200'}
      overflowX="auto"
      css={hideScrollbarCss}>
      {topTabBehaviorList.map((topTabBehavior) => {
        return (
          <Link
            onClick={topTabBehavior.onClick}
            key={topTabBehavior.tabName}
            display="flex"
            flexDir="row"
            justifyContent="center"
            alignItems="center"
            h="100%"
            minW="160px"
            mx="16px"
            w={`${Math.floor(100 / tabCount)}%`}
            whiteSpace="nowrap"
            color={topTabBehavior.isActiveTab ? 'blue.500' : darkFontColor}
            borderBottomWidth={topTabBehavior.isActiveTab ? 1 : undefined}
            _hover={{ textDecoration: 'none' }}
            borderBottomColor={
              topTabBehavior.isActiveTab ? 'blue.500' : 'gray.200'
            }>
            <Text pb="8px" fontSize={isSmallerThan768 ? '14px' : '16px'}>
              {topTabBehavior.tabName}
            </Text>
          </Link>
        );
      })}
    </Box>
  );
};

export default TopTabBar;

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
  // const tabCount = topTabBehaviorList.length;
  // const [isSmallerThan768] = useMediaQuery('(max-width: 768px)');
  return (
    <Box
      alignSelf="center"
      display="flex"
      flexDir="row"
      alignItems="center"
      w="100%"
      // w={isSmallerThan768 ? '100vw' : '80vw'}
      h="40px"
      // borderBottomWidth={1}
      // borderBottomColor={'gray.200'}
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
            whiteSpace="nowrap"
            mr={5}
            color={topTabBehavior.isActiveTab ? 'blue.600' : darkFontColor}
            borderBottomWidth={topTabBehavior.isActiveTab ? 1 : undefined}
            _hover={{ textDecoration: 'none' }}
            borderBottomColor="blue.600">
            <Text
              pb="8px"
              fontSize="16px"
              fontWeight={topTabBehavior.isActiveTab ? 'bold' : ''}>
              {topTabBehavior.tabName}
            </Text>
          </Link>
        );
      })}
    </Box>
  );
};

export default TopTabBar;

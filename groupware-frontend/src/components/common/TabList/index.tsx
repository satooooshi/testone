import { Box, Button } from '@chakra-ui/react';
import { Tab } from 'src/types/header/tab/types';
import { hideScrollbarCss } from 'src/utils/chakra/hideScrollBar.css';

type TabListProps = {
  activeTabName?: string;
  tabs: Tab[];
};

const TabList: React.FC<TabListProps> = ({ activeTabName, tabs }) => {
  return (
    <Box
      w={'100%'}
      //   h="50px"
      display="flex"
      flexDir="row"
      p={3}
      mb={3}
      overflowX="auto"
      css={hideScrollbarCss}>
      {tabs?.map((t) =>
        !t.type ? (
          <Button
            minW={`${t.name.length * 20}px`}
            borderRadius={50}
            key={t.name}
            mr={2}
            colorScheme={
              t.name === activeTabName || t.isActive ? 'blue' : undefined
            }
            bg={t.name !== activeTabName && !t.isActive ? 'white' : undefined}
            onClick={t.onClick}>
            {t.name}
          </Button>
        ) : null,
      )}
    </Box>
  );
};

export default TabList;

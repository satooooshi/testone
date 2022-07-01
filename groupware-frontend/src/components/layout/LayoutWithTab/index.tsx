import { SidebarProps } from '../Sidebar';
import Sidebar from '@/components/layout/Sidebar';
import HeaderWithTab, { HeaderProps } from '../HeaderWithTab';
import layoutStyles from '@/styles/layouts/Layout.module.scss';
import { useState } from 'react';
import clsx from 'clsx';
import { useMediaQuery } from '@chakra-ui/react';

type LayoutWithTabProps = {
  sidebar: SidebarProps;
  header: Omit<HeaderProps, 'isDrawerOpen' | 'setIsDrawerOpen'>;
};

const LayoutWithTab: React.FC<LayoutWithTabProps> = ({
  sidebar,
  header,
  children,
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSmallerThan912] = useMediaQuery('(max-width: 912px)');
  return (
    <div className={layoutStyles.whole_layout}>
      {isSmallerThan912 && isDrawerOpen && (
        <>
          <Sidebar
            {...sidebar}
            isDrawerOpen={isDrawerOpen}
            hideDrawer={() => {
              setIsDrawerOpen(false);
            }}
          />
          <div
            className={layoutStyles.fadeLayer}
            onClick={() => {
              setIsDrawerOpen(false);
            }}
          />
        </>
      )}
      {!isSmallerThan912 && (
        <Sidebar {...sidebar} hideDrawer={() => setIsDrawerOpen(false)} />
      )}

      <div className={layoutStyles.right_contents}>
        <div className={layoutStyles.header_bottom_margin}>
          <HeaderWithTab
            {...header}
            isDrawerOpen={isDrawerOpen}
            setIsDrawerOpen={setIsDrawerOpen}
          />
        </div>
        <div
          className={clsx(
            layoutStyles.main,
            header.tabs && header.tabs.length
              ? layoutStyles.main_padding_with_tab
              : layoutStyles.main_padding_no_tab,
          )}>
          {/* <Box overflowX="scroll" w="100%" px={2}> */}
          {children}
          {/* </Box> */}
        </div>
      </div>
    </div>
  );
};

export default LayoutWithTab;

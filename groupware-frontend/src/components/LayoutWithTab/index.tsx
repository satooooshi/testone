import { SidebarProps } from '../Sidebar';
import Sidebar from '@/components/Sidebar';
import HeaderWithTab, { HeaderProps } from '../HeaderWithTab';
import layoutStyles from '@/styles/layouts/Layout.module.scss';
import { useState } from 'react';
import clsx from 'clsx';

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
  return (
    <div className={layoutStyles.whole_layout}>
      <Sidebar
        {...sidebar}
        isDrawerOpen={isDrawerOpen}
        hideDrawer={() => setIsDrawerOpen(false)}
      />
      {!isDrawerOpen && (
        <>
          <Sidebar {...sidebar} />
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
              {children}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default LayoutWithTab;

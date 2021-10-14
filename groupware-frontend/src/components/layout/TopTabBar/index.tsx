import clsx from 'clsx';
import topTagBarStyle from '@/styles/components/TopTabBar.module.scss';

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
  return (
    <div className={topTagBarStyle.tabs_wrapper}>
      {topTabBehaviorList.map((topTabBehavior, index) => {
        return (
          <a
            key={index}
            className={clsx(
              topTagBarStyle.tab,
              topTabBehavior.isActiveTab
                ? topTagBarStyle.active_tab
                : topTagBarStyle.disable_tab,
            )}
            style={{ width: `${Math.floor(100 / tabCount)}%` }}
            onClick={topTabBehavior.onClick}>
            <p className={topTagBarStyle.tab_name}>{topTabBehavior.tabName}</p>
          </a>
        );
      })}
    </div>
  );
};

export default TopTabBar;

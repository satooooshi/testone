import headerStyles from '@/styles/components/Header.module.scss';

const ChatHeader = () => {
  return (
    <div className={headerStyles.header}>
      <div className={headerStyles.header_top_wrapper}>
        <h1 className={headerStyles.header_title}>{'Chat'}</h1>
      </div>
    </div>
  );
};

export default ChatHeader;

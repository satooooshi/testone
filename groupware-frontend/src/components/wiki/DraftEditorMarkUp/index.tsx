import React from 'react';
import DOMPurify from 'dompurify';
import DraftMarkupStyles from '@/styles/components/DraftMarkup.module.scss';

type DraftMarkupProps = {
  renderHTML: string;
};

const DraftMarkup: React.FC<DraftMarkupProps> = ({ renderHTML }) => {
  return (
    <div
      className={DraftMarkupStyles.editor_wrapper}
      dangerouslySetInnerHTML={{
        __html: DOMPurify.sanitize(renderHTML),
      }}></div>
  );
};

export default DraftMarkup;

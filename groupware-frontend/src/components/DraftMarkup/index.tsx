import React from 'react';
import DOMPurify from 'dompurify';

type DraftMarkupProps = {
  renderHTML: string;
};

const DraftMarkup: React.FC<DraftMarkupProps> = ({ renderHTML }) => {
  return (
    <div
      dangerouslySetInnerHTML={{
        __html: DOMPurify.sanitize(renderHTML),
      }}></div>
  );
};

export default DraftMarkup;

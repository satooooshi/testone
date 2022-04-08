import React from 'react';
import DOMPurify from 'dompurify';
import DraftMarkupStyles from '@/styles/components/DraftMarkup.module.scss';
import linkifyHtml from 'linkifyjs/html';
import { Box } from '@chakra-ui/react';

type DraftMarkupProps = {
  renderHTML: string;
};

const DraftMarkup: React.FC<DraftMarkupProps> = ({ renderHTML }) => {
  return (
    <Box
      className={DraftMarkupStyles.editor_wrapper}
      dangerouslySetInnerHTML={{
        __html: linkifyHtml(DOMPurify.sanitize(renderHTML)),
      }}></Box>
  );
};

export default DraftMarkup;

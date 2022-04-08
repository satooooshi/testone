import { Link } from '@chakra-ui/react';
import React from 'react';
import { AiOutlineFileProtect } from 'react-icons/ai';
import { ChatMessage } from 'src/types';
import { darkFontColor } from 'src/utils/colors';
import { fileNameTransformer } from 'src/utils/factory/fileNameTransformer';

type FileMessageProps = {
  message: ChatMessage;
};

const FileMessage: React.FC<FileMessageProps> = ({ message }) => {
  return (
    <Link
      onClick={() => saveAs(message.content, message.fileName)}
      target="_blank"
      mr="8px"
      display="flex"
      flexDir="column"
      alignItems="center"
      borderWidth={'1px'}
      borderColor="gray"
      borderRadius="8px"
      p="8px">
      <AiOutlineFileProtect
        style={{ height: '48px', width: '48px' }}
        color={darkFontColor}
      />
      <p>{message.fileName}</p>
    </Link>
  );
};

export default FileMessage;

import React from 'react';
import { Link, Text } from '@chakra-ui/react';
import { fileNameTransformer } from 'src/utils/factory/fileNameTransformer';
import { AiOutlineFileProtect } from 'react-icons/ai';

type FileIconProps = {
  href: string | undefined;
  submitted?: boolean;
};

const FileIcon: React.FC<FileIconProps> = ({ href, submitted }) => {
  return (
    <>
      {href ? (
        <Link
          onClick={() => saveAs(href, fileNameTransformer(href))}
          display="flex"
          flexDir="column"
          alignItems="center"
          justifyContent="center"
          border="1px solid #e0e0e0"
          rounded="md"
          p="8px"
          w="136px"
          h="136px"
          bg={!submitted ? 'white' : 'lightblue'}>
          <AiOutlineFileProtect style={{ height: '48px', width: '48px' }} />
          <Text isTruncated={true} w="100%" textAlign="center">
            {fileNameTransformer(href)}
          </Text>
        </Link>
      ) : null}
    </>
  );
};

export default FileIcon;

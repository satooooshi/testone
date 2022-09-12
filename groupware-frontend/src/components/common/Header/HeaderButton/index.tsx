import React from 'react';
import { Box, Button } from '@chakra-ui/react';
import { Tab } from 'src/types/header/tab/types';
import { AiOutlineLeft, AiOutlinePlus } from 'react-icons/ai';
import { FiEdit2 } from 'react-icons/fi';
import { RiDeleteBin6Line } from 'react-icons/ri';

type HeaderButtonProps = {
  t: Tab;
};

const HeaderButton: React.FC<HeaderButtonProps> = ({ t }) => {
  return (
    <>
      {t.type === 'create' ? (
        <Box w="70px" ml="auto" right={0}>
          <Button
            onClick={t.onClick}
            rounded={50}
            w="70px"
            h="35px"
            colorScheme="blue"
            rightIcon={<AiOutlinePlus />}>
            {t.name}
          </Button>
        </Box>
      ) : t.type === 'edit' || t.type === 'delete' ? (
        <Button
          onClick={t.onClick}
          ml="10px"
          leftIcon={
            t.type === 'edit' ? <FiEdit2 /> : <RiDeleteBin6Line size="20px" />
          }
          bg="white">
          {t.name}
        </Button>
      ) : null}
    </>
  );
};

export default HeaderButton;

import {
  Portal,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  SimpleGrid,
  Popover,
  PopoverTrigger,
  Link,
  Box,
  Image,
} from '@chakra-ui/react';
import React, { Fragment, memo } from 'react';
import { BiSmile } from 'react-icons/bi';
import { darkFontColor } from 'src/utils/colors';
import { reactionStickers } from 'src/utils/reactionStickers';

type stickerProps = {
  handleStickerSelected: (sticker: string) => void;
};

const Sticker: React.FC<stickerProps> = memo(({ handleStickerSelected }) => {
  return (
    <Popover closeOnBlur={false} placement="top-start">
      {({ onClose }) => (
        <>
          <PopoverTrigger>
            <Link
              color={darkFontColor}
              position="absolute"
              zIndex={1}
              bottom={'8px'}
              cursor="pointer"
              right="90px">
              <BiSmile size={20} color={darkFontColor} />
            </Link>
          </PopoverTrigger>
          <Portal>
            <PopoverContent>
              <PopoverHeader border="0">
                <PopoverCloseButton />
              </PopoverHeader>

              <PopoverBody>
                <SimpleGrid columns={3}>
                  {reactionStickers.map((e) => (
                    <Fragment key={e.name}>
                      <a
                        onClick={() => {
                          handleStickerSelected(e.name);
                          onClose();
                        }}>
                        <Box display="flex" maxW="300px" maxH={'300px'}>
                          <Image
                            src={e.src}
                            w={100}
                            h={100}
                            padding={2}
                            alt="送信された画像"
                          />
                        </Box>
                      </a>
                    </Fragment>
                  ))}
                </SimpleGrid>
              </PopoverBody>
            </PopoverContent>
          </Portal>
        </>
      )}
    </Popover>
  );
});

Sticker.displayName = 'Sticker';
export default Sticker;

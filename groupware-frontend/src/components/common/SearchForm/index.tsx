import React, {
  ChangeEventHandler,
  useState,
  createContext,
  useContext,
} from 'react';
import searchFormStyles from '@/styles/components/SearchForm.module.scss';
import TagModal from '../TagModal';
import { Tag } from 'src/types';
import {
  Badge,
  Box,
  Button,
  ButtonGroup,
  IconButton,
  Select,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Text,
  useMediaQuery,
} from '@chakra-ui/react';
import { GiCancel } from 'react-icons/gi';
import ReactModal from 'react-modal';
import { AiOutlinePlus, AiOutlineSearch } from 'react-icons/ai';
import clsx from 'clsx';
import { tagColorFactory } from 'src/utils/factory/tagColorFactory';
import { MdCancel } from 'react-icons/md';

const SearchFormContext = createContext({
  isSmallerThan768: false,
  isVisibleSearchModal: false,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  hideSearchModal: () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  showSearchModal: () => {},
});

const SearchProvider: React.FC = ({ children }) => {
  const [isVisibleSearchModal, setIsVisibleSearchModal] = useState(false);
  const [isSmallerThan768] = useMediaQuery('(max-width: 768px)');

  const hideSearchModal = () => {
    setIsVisibleSearchModal(false);
  };
  const showSearchModal = () => {
    setIsVisibleSearchModal(true);
  };

  return (
    <SearchFormContext.Provider
      value={{
        isSmallerThan768,
        isVisibleSearchModal,
        hideSearchModal,
        showSearchModal,
      }}>
      {children}
    </SearchFormContext.Provider>
  );
};

const useSearchForm = () => useContext(SearchFormContext);

type SearchFormProps = {
  // value: string;
  // onChange: ChangeEventHandler<HTMLInputElement>;
  selectItems?: string[];
  selectingItem?: string;
  onSelect?: ChangeEventHandler<HTMLSelectElement>;
  // onClickButton: () => void;
  onClickButton: (word: string) => void;
  tags?: Tag[];
  selectedTags?: Tag[];
  toggleTag: (t: Tag) => void;
  onClear: () => void;
};

const SearchInput: React.FC<SearchFormProps> = ({
  selectItems,
  selectingItem,
  onSelect,
  onClickButton,
  tags = [],
  selectedTags = [],
  toggleTag,
  onClear,
}) => {
  const [tagModal, setTagModal] = useState(false);
  const [word, setWord] = useState('');
  const [searchedWord, setSearchedWord] = useState('');
  const { isSmallerThan768, hideSearchModal } = useSearchForm();

  const handleModalSearchButton = () => {
    onClickButton(word);
    setSearchedWord(word);
    isSmallerThan768 && hideSearchModal();
  };

  return (
    <Box
      display="flex"
      flexDir="column"
      justifyContent="center"
      width={'100%'}
      my={5}>
      <div
        className={clsx(
          searchFormStyles.search_form_wrapper,
          selectedTags.length && searchFormStyles.selected_tag_top_margin,
        )}>
        {isSmallerThan768 && (
          <div className={searchFormStyles.close_icon_wrapper}>
            <GiCancel
              onClick={() => hideSearchModal()}
              size="24"
              className={searchFormStyles.close_icon}
            />
          </div>
        )}
        <TagModal
          isOpen={tagModal}
          tags={tags || []}
          selectedTags={selectedTags}
          toggleTag={toggleTag}
          onClear={() => {
            onClear();
          }}
          onComplete={() => {
            setTagModal(false);
            // handleModalSearchButton();
          }}
          isSearch={true}
        />
        <Box display="flex" flexDir="row" w="100%">
          <InputGroup width="50%" maxW="700px">
            <InputLeftElement pointerEvents="none">
              <AiOutlineSearch />
            </InputLeftElement>
            <Input
              w="100%"
              // className={searchFormStyles.input}
              type="search"
              name="word"
              placeholder="検索する"
              background="white"
              value={word}
              onChange={(e) => setWord(e.target.value)}
              // value={value}
              // onChange={onChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleModalSearchButton();
                }
              }}
            />
            <InputRightElement
              width="85px"
              mr={0}
              display="flex"
              flexDir="row"
              justifyContent="flex-start">
              {word.length ? (
                <Text w="10px" textAlign="center" mr={3} cursor="pointer">
                  ✖️
                </Text>
              ) : null}
              <Button
                colorScheme="blue"
                w="70px"
                h="80%"
                size="sm"
                ml="auto"
                mr={2}
                onClick={handleModalSearchButton}>
                検索
              </Button>
            </InputRightElement>
          </InputGroup>
          <Button
            ml="1%"
            bg="white"
            justifyContent="flex-start"
            w="24%"
            maxW="200px"
            onClick={() => setTagModal(true)}>
            <Text ml={1}>タグ</Text>
            {selectedTags.length ? (
              <Badge
                ml="auto"
                bg="blue.400"
                color="white"
                w="25px"
                h="25px"
                borderRadius="50%"
                textAlign="center"
                lineHeight="25px">
                {selectedTags.length}
              </Badge>
            ) : null}
          </Button>
          {selectItems && (
            <Select
              ml="1%"
              name="branch"
              value={selectingItem}
              bg="white"
              height="10"
              w="24%"
              maxW="230px"
              onChange={onSelect}>
              {selectItems?.length &&
                selectItems.map((i) => (
                  <option key={i} value={i}>
                    {i}
                  </option>
                ))}
            </Select>
          )}
        </Box>
      </div>
      <Box display="flex" mt={2} alignItems="center">
        {selectedTags?.length ? (
          <>
            <Box ml={1} display="flex">
              {selectedTags.map((tag) => (
                <Badge
                  ml={2}
                  p={2}
                  key={tag.id}
                  display="flex"
                  colorScheme={tagColorFactory(tag.type)}
                  borderRadius={50}
                  alignItems="center"
                  variant="outline"
                  borderWidth={1}>
                  {tag.name}
                  <Box ml={1}>
                    <MdCancel size={14} onClick={() => toggleTag(tag)} />
                  </Box>
                </Badge>
              ))}
            </Box>
          </>
        ) : null}
      </Box>
      {searchedWord ? (
        <Text mt={2}>{`"${searchedWord}"での検索結果`}</Text>
      ) : null}
    </Box>
  );
};

const SearchModal: React.FC<SearchFormProps> = (props) => {
  return (
    <ReactModal
      style={{ overlay: { zIndex: 110 } }}
      ariaHideApp={false}
      isOpen={true}
      className={searchFormStyles.modal}>
      <SearchInput {...props} />
    </ReactModal>
  );
};

const SearchFormResponsively: React.FC<SearchFormProps> = (props) => {
  const { isSmallerThan768, isVisibleSearchModal, showSearchModal } =
    useSearchForm();

  return isSmallerThan768 ? (
    <>
      {!isVisibleSearchModal ? (
        <AiOutlineSearch
          onClick={() => showSearchModal()}
          className={searchFormStyles.search_button}
        />
      ) : (
        <SearchModal {...props} />
      )}
    </>
  ) : (
    <SearchInput {...props} />
  );
};

const SearchForm: React.FC<SearchFormProps> = (props) => {
  return (
    <SearchProvider>
      <SearchFormResponsively {...props} />
    </SearchProvider>
  );
};

export default SearchForm;

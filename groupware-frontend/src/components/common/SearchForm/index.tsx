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
  value: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
  selectItems?: string[];
  selectingItem?: string;
  onSelect?: ChangeEventHandler<HTMLSelectElement>;
  onClickButton: () => void;
  tags?: Tag[];
  selectedTags?: Tag[];
  toggleTag: (t: Tag) => void;
  onClear: () => void;
};

const SearchInput: React.FC<SearchFormProps> = ({
  value,
  onChange,
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
  const [searchedWord, setSearchedWord] = useState(value);
  const { isSmallerThan768, hideSearchModal } = useSearchForm();

  const handleModalSearchButton = () => {
    onClickButton();
    setSearchedWord(value);
    isSmallerThan768 && hideSearchModal();
  };

  return (
    <Box
      display="flex"
      flexDir="column"
      justifyContent="center"
      width={'100%'}
      mt={5}>
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
          onComplete={() => setTagModal(false)}
          isSearch={true}
        />
        <Box display="flex" flexDir="row" w="100%">
          <InputGroup width="50%">
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
              value={value}
              onChange={onChange}
            />
            <InputRightElement width="70px" mr={0}>
              <Button
                colorScheme="blue"
                h="80%"
                size="sm"
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
      {searchedWord ? <p>{`"${searchedWord}"での検索結果`}</p> : null}
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

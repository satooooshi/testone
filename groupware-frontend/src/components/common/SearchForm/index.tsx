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
  Input,
  InputGroup,
  InputLeftElement,
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
  onClickButton: () => void;
  tags?: Tag[];
  selectedTags?: Tag[];
  toggleTag: (t: Tag) => void;
  onClear: () => void;
};

const SearchInput: React.FC<SearchFormProps> = ({
  value,
  onChange,
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
    <Box display="flex" flexDir="column" justifyContent="center" width={'100%'}>
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
        <InputGroup width={'100%'}>
          <InputLeftElement pointerEvents="none">
            <AiOutlineSearch />
          </InputLeftElement>
          <Input
            className={searchFormStyles.input}
            type="search"
            name="word"
            placeholder="検索ワードを入力"
            background="white"
            value={value}
            onChange={onChange}
          />
        </InputGroup>
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
        <div className={clsx(searchFormStyles.search_and_close_button_wrapper)}>
          <Button
            borderRadius={50}
            width={isSmallerThan768 ? '100%' : '20vw'}
            colorScheme="blue"
            onClick={handleModalSearchButton}>
            <Box display="flex">
              <AiOutlineSearch size={20} />
              <Text ml={1}>検索</Text>
            </Box>
          </Button>
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
        </div>
      </div>
      <Box display="flex" mt={2} alignItems="center">
        <Button
          borderRadius={50}
          width={'8wh'}
          height={8}
          className={searchFormStyles.add_tag_button}
          colorScheme="blue"
          variant="outline"
          onClick={() => setTagModal(true)}>
          <Box display="flex">
            <AiOutlinePlus size={15} />
            <Text fontSize={12}>タグを追加</Text>
          </Box>
        </Button>
        {selectedTags.length ? (
          <>
            <Text>選択したタグ</Text>
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

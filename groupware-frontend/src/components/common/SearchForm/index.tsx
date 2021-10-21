import React, {
  ChangeEventHandler,
  useState,
  createContext,
  useContext,
} from 'react';
import searchFormStyles from '@/styles/components/SearchForm.module.scss';
import TagModal from '../TagModal';
import { Tag } from 'src/types';
import { Button, Input, useMediaQuery } from '@chakra-ui/react';
import { GiCancel } from 'react-icons/gi';
import ReactModal from 'react-modal';
import { AiOutlineSearch } from 'react-icons/ai';
import clsx from 'clsx';
import { tagColorFactory } from 'src/utils/factory/tagColorFactory';

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
  onCancelTagModal: () => void;
};

const SearchInput: React.FC<SearchFormProps> = ({
  value,
  onChange,
  onClickButton,
  tags = [],
  selectedTags = [],
  toggleTag,
  onCancelTagModal,
}) => {
  const [tagModal, setTagModal] = useState(false);
  const [searchedWord, setSearchedWord] = useState('');
  const { isSmallerThan768, hideSearchModal } = useSearchForm();

  const handleModalSearchButton = () => {
    onClickButton();
    setSearchedWord(value);
    isSmallerThan768 && hideSearchModal();
  };

  return (
    <div className={searchFormStyles.main_wrapper}>
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
        <Input
          className={searchFormStyles.input}
          type="search"
          name="word"
          width={isSmallerThan768 ? '100%' : '60%'}
          placeholder="検索ワードを入力"
          background="white"
          value={value}
          onChange={onChange}
        />
        <Button
          width={isSmallerThan768 ? '100%' : '15vw'}
          className={searchFormStyles.add_tag_button}
          colorScheme="green"
          onClick={() => setTagModal(true)}>
          {selectedTags.length
            ? `${selectedTags.length}個のタグ`
            : 'タグを選択'}
        </Button>
        <TagModal
          isOpen={tagModal}
          tags={tags || []}
          selectedTags={selectedTags}
          toggleTag={toggleTag}
          onCancel={() => {
            onCancelTagModal();
            setTagModal(false);
          }}
          onComplete={() => setTagModal(false)}
          isSearch={true}
        />
        <div className={clsx(searchFormStyles.search_and_close_button_wrapper)}>
          <Button
            width={isSmallerThan768 ? '100%' : '15vw'}
            colorScheme="pink"
            onClick={handleModalSearchButton}>
            検索
          </Button>
          <TagModal
            isOpen={tagModal}
            tags={tags || []}
            selectedTags={selectedTags}
            toggleTag={toggleTag}
            onCancel={() => {
              onCancelTagModal();
              setTagModal(false);
            }}
            onComplete={() => setTagModal(false)}
            isSearch={true}
          />
        </div>
      </div>
      {selectedTags.length ? (
        <div className={searchFormStyles.search_items_wrapper}>
          <div className={searchFormStyles.searched_items_title_wrapper}>
            <p className={searchFormStyles.searched_items_title}>
              選択したタグ
            </p>
          </div>
          <div className={searchFormStyles.selected_tags_wrapper}>
            {selectedTags.map((tag) => {
              return (
                <Button
                  colorScheme={tagColorFactory(tag.type)}
                  size="xs"
                  key={tag.id}
                  className={searchFormStyles.tag_item}>
                  {tag.name}
                </Button>
              );
            })}
          </div>
        </div>
      ) : null}
      {searchedWord ? <p>{`"${searchedWord}"での検索結果`}</p> : null}
    </div>
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

import React, { useCallback, useState } from 'react';
import {
  Editor,
  EditorState,
  RichUtils,
  AtomicBlockUtils,
  ContentState,
  ContentBlock,
  DraftEditorCommand,
  DraftHandleValue,
} from 'draft-js';
import '@draft-js-plugins/image/lib/plugin.css';
import WrappedDraftEditorStyles from '@/styles/components/WrappedDraftEditor.module.scss';
import { useDropzone } from 'react-dropzone';
import { useAPIUploadStorage } from '@/hooks/api/storage/useAPIUploadStorage';
import 'draft-js/dist/Draft.css';
import {
  FaRedoAlt,
  FaRegTrashAlt,
  FaUndoAlt,
  FaCode,
  FaStrikethrough,
  FaBold,
  FaItalic,
  FaListOl,
  FaListUl,
  FaQuoteRight,
  FaImage,
  FaHeading,
} from 'react-icons/fa';
import { GoCode } from 'react-icons/go';

type WrappedDraftEditorProps = {
  style?: React.CSSProperties;
  placeholder: string;
  editorRef?: React.LegacyRef<Editor>;
  editorState: EditorState;
  setEditorState: React.Dispatch<React.SetStateAction<EditorState>>;
};

type HeadlineInlineButtonProps = {
  editorState: EditorState;
  setEditorState: React.Dispatch<React.SetStateAction<EditorState>>;
  inlineStyle: string;
  DisplayIcon: JSX.Element | string;
};

type HeadlineBlockButtonProps = {
  editorState: EditorState;
  setEditorState: React.Dispatch<React.SetStateAction<EditorState>>;
  blockType: string;
  DisplayIcon: JSX.Element | string;
};

const headerBlocks = [
  { style: 'header-one', icon: 'H1' },
  { style: 'header-two', icon: 'H2' },
  { style: 'header-three', icon: 'H3' },
  { style: 'header-four', icon: 'H4' },
  { style: 'header-five', icon: 'H5' },
  { style: 'header-six', icon: 'H6' },
];

const inlineStyles = [
  { style: 'BOLD', icon: <FaBold /> },
  { style: 'ITALIC', icon: <FaItalic /> },
  { style: 'STRIKETHROUGH', icon: <FaStrikethrough /> },
  { style: 'CODE', icon: <GoCode /> },
];

const blockTypes = [
  { style: 'ordered-list-item', icon: <FaListOl /> },
  { style: 'unordered-list-item', icon: <FaListUl /> },
  { style: 'code-block', icon: <FaCode /> },
  { style: 'blockquote', icon: <FaQuoteRight /> },
];

const HeadlineInlineButton: React.FC<HeadlineInlineButtonProps> = ({
  editorState,
  setEditorState,
  inlineStyle,
  DisplayIcon,
}) => {
  return (
    <div className={WrappedDraftEditorStyles.headlineButtonWrapper}>
      <button
        onMouseDown={(e) => {
          e.preventDefault();
          setEditorState(RichUtils.toggleInlineStyle(editorState, inlineStyle));
        }}
        className={
          editorState.getCurrentInlineStyle().has(inlineStyle)
            ? WrappedDraftEditorStyles.headlineButton__active
            : WrappedDraftEditorStyles.headlineButton
        }>
        {DisplayIcon}
      </button>
    </div>
  );
};

const HeadlineBlockButton: React.FC<HeadlineBlockButtonProps> = ({
  editorState,
  setEditorState,
  blockType,
  DisplayIcon,
}) => {
  return (
    <div className={WrappedDraftEditorStyles.headlineButtonWrapper}>
      <button
        onMouseDown={(e) => {
          e.preventDefault();
          setEditorState(RichUtils.toggleBlockType(editorState, blockType));
        }}
        className={
          RichUtils.getCurrentBlockType(editorState) === blockType
            ? WrappedDraftEditorStyles.headlineButton__active
            : WrappedDraftEditorStyles.headlineButton
        }>
        {DisplayIcon}
      </button>
    </div>
  );
};

const Image: React.FC<{ blockProps: { src: string } }> = (props) => (
  <img src={props.blockProps.src} alt={props.blockProps.src} />
);

const WrappedDraftEditor: React.FC<WrappedDraftEditorProps> = ({
  style,
  placeholder,
  editorRef,
  editorState,
  setEditorState,
}) => {
  const [enableHeaderBlocks, setEnableHeaderBlocks] = useState(false);
  const blockStyleFn = useCallback((block: ContentBlock): string => {
    switch (block.getType()) {
      case 'blockquote':
        return WrappedDraftEditorStyles.blockquoteStyle;
      case 'code-block':
        return WrappedDraftEditorStyles.codeBlockStyle;
      default:
        return '';
    }
  }, []);
  const inlineStyleMap = {
    CODE: {
      backgroundColor: '#eeeeee',
    },
  };

  const handleKeyCommand = (
    editorCommand: DraftEditorCommand,
    editorState: EditorState,
  ): DraftHandleValue => {
    const newState = RichUtils.handleKeyCommand(editorState, editorCommand);
    if (newState) {
      setEditorState(newState);
      return 'handled';
    }
    return 'not-handled';
  };

  const handleInsertImageToEditor = (url: string) => {
    const contentState = editorState.getCurrentContent();
    const contentStateWithEntity = contentState.createEntity(
      'IMAGE',
      'IMMUTABLE',
      {
        src: url,
        alt: url,
      },
    );
    const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
    const newEditorState = EditorState.set(editorState, {
      currentContent: contentStateWithEntity,
    });
    return setEditorState(
      AtomicBlockUtils.insertAtomicBlock(newEditorState, entityKey, ' '),
    );
  };

  const { mutate: uploadImage } = useAPIUploadStorage({
    onSuccess: async (fileURLs) => {
      handleInsertImageToEditor(fileURLs[0]);
    },
  });

  const onInsertImageDrop = (img: File[]) => {
    uploadImage(img);
  };

  const {
    getRootProps: getinsertImageRootProps,
    getInputProps: getinsertImageInputProps,
  } = useDropzone({
    onDrop: onInsertImageDrop,
  });

  const mediaBlockRenderer = (block: ContentBlock) => {
    if (block.getType() === 'atomic') {
      const entityKey = block.getEntityAt(0);
      if (!entityKey) return null;
      const entity = editorState.getCurrentContent().getEntity(entityKey);
      if (!entity) return null;
      if (entity.getType() === 'IMAGE') {
        const data = entity.getData();
        return {
          component: Image,
          editable: false,
          props: {
            src: data.src,
          },
        };
      }
    }
    return null;
  };

  return (
    <div style={style} className={WrappedDraftEditorStyles.container}>
      <div className={WrappedDraftEditorStyles.toolbar}>
        <div className={WrappedDraftEditorStyles.headlineButtonWrapper}>
          <button
            className={WrappedDraftEditorStyles.headlineButton}
            onClick={() => setEnableHeaderBlocks(!enableHeaderBlocks)}>
            <FaHeading />
          </button>
        </div>
        {enableHeaderBlocks && (
          <>
            {headerBlocks.map((h) => (
              <HeadlineBlockButton
                key={h.style}
                editorState={editorState}
                setEditorState={setEditorState}
                blockType={h.style}
                DisplayIcon={h.icon}
              />
            ))}
          </>
        )}
        {inlineStyles.map((i) => (
          <HeadlineInlineButton
            key={i.style}
            editorState={editorState}
            setEditorState={setEditorState}
            inlineStyle={i.style}
            DisplayIcon={i.icon}
          />
        ))}
        {blockTypes.map((b) => (
          <HeadlineBlockButton
            key={b.style}
            editorState={editorState}
            setEditorState={setEditorState}
            blockType={b.style}
            DisplayIcon={b.icon}
          />
        ))}
        <div className={WrappedDraftEditorStyles.headlineButtonWrapper}>
          <button
            {...getinsertImageRootProps({
              className: WrappedDraftEditorStyles.headlineButton,
            })}>
            <input {...getinsertImageInputProps()} />
            <FaImage />
          </button>
        </div>
        <div className={WrappedDraftEditorStyles.headlineButtonWrapper}>
          <button
            className={WrappedDraftEditorStyles.headlineButton}
            disabled={editorState.getUndoStack().size <= 0}
            onMouseDown={() => setEditorState(EditorState.undo(editorState))}>
            <FaUndoAlt />
          </button>
        </div>
        <div className={WrappedDraftEditorStyles.headlineButtonWrapper}>
          <button
            className={WrappedDraftEditorStyles.headlineButton}
            disabled={editorState.getRedoStack().size <= 0}
            onMouseDown={() => setEditorState(EditorState.redo(editorState))}>
            <FaRedoAlt />
          </button>
        </div>
        <div className={WrappedDraftEditorStyles.headlineButtonWrapper}>
          <button
            className={WrappedDraftEditorStyles.headlineButton}
            onMouseDown={() =>
              setEditorState(
                EditorState.push(
                  editorState,
                  ContentState.createFromText(''),
                  'undo',
                ),
              )
            }>
            <FaRegTrashAlt />
          </button>
        </div>
      </div>
      <div className={WrappedDraftEditorStyles.editor}>
        <Editor
          customStyleMap={inlineStyleMap}
          editorState={editorState}
          onChange={setEditorState}
          ref={editorRef}
          blockRendererFn={mediaBlockRenderer}
          blockStyleFn={blockStyleFn}
          placeholder={placeholder}
          handleKeyCommand={handleKeyCommand}
        />
      </div>
    </div>
  );
};
export default WrappedDraftEditor;

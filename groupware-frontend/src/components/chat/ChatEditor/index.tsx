import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import { EditorState, getDefaultKeyBinding } from 'draft-js';
import Editor from '@draft-js-plugins/editor';
import { draftToMarkdown } from 'markdown-draft-js';
import createMentionPlugin, { MentionData } from '@draft-js-plugins/mention';
import { Box, Link, Spinner } from '@chakra-ui/react';
import { EntryComponentProps } from '@draft-js-plugins/mention/lib/MentionSuggestions/Entry/Entry';
import { userNameFactory } from 'src/utils/factory/userNameFactory';
import { ChatGroup } from 'src/types';
import { useAuthenticate } from 'src/contexts/useAuthenticate';
import suggestionStyles from '@/styles/components/Suggestion.module.scss';
import { useDropzone } from 'react-dropzone';
import { IoSend } from 'react-icons/io5';
import { AiOutlinePaperClip } from 'react-icons/ai';
import { blueColor, darkFontColor } from 'src/utils/colors';
import { MutateOptions } from 'react-query';
import { AxiosError } from 'axios';

export const Entry: React.FC<EntryComponentProps> = ({
  mention,
  isFocused,
  id,
  onMouseUp,
  onMouseDown,
  onMouseEnter,
}) => {
  const entryRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isFocused) {
      if ('scrollIntoViewIfNeeded' in document.body) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        entryRef.current?.scrollIntoViewIfNeeded(false);
      } else {
        entryRef.current?.scrollIntoView(false);
      }
    }
  }, [isFocused]);

  return (
    <div
      ref={entryRef}
      style={
        isFocused
          ? {
              padding: '5px',
              backgroundColor: 'cornsilk',
            }
          : {
              padding: '5px',
            }
      }
      role="option"
      aria-selected={isFocused ? 'true' : 'false'}
      id={id}
      onMouseUp={onMouseUp}
      onMouseEnter={onMouseEnter}
      onMouseDown={onMouseDown}>
      {mention.name}
    </div>
  );
};

type ChatEditorProps = {
  room: ChatGroup;
  onSend: (content: string) => void;
  isLoading: boolean;
  uploadFiles: (
    variables: File[],
    options?:
      | MutateOptions<string[], AxiosError<any>, File[], unknown>
      | undefined,
  ) => void;
};

const ChatEditor: React.FC<ChatEditorProps> = memo(
  ({ room, onSend, isLoading, uploadFiles }) => {
    const { user } = useAuthenticate();
    const [content, setContent] = useState('');
    const [editorState, setEditorState] = useState<EditorState>(
      EditorState.createEmpty(),
    );
    // const editorStateRef = useRef(EditorState.createEmpty());
    const editorRef = useRef<Editor>(null);
    const [mentionedUserData, setMentionedUserData] = useState<MentionData[]>(
      [],
    );
    const [mentionOpened, setMentionOpened] = useState(false);

    const userDataForMention: MentionData[] = useMemo(() => {
      const users =
        room?.members
          ?.filter((u) => u.id !== user?.id)
          .map((u) => ({
            id: u.id,
            name: userNameFactory(u) + 'さん',
            avatar: u.avatarUrl,
          })) || [];
      const allTag = { id: 0, name: 'all', avatar: '' };
      users.unshift(allTag);
      return users;
    }, [room?.members, user?.id]);

    const [suggestions, setSuggestions] =
      useState<MentionData[]>(userDataForMention);

    const onAddMention = (newMention: MentionData) => {
      setMentionedUserData((m) => [...m, newMention]);
    };

    const onSuggestionOpenChange = (_open: boolean) => {
      setMentionOpened(_open);
    };

    const onSuggestionSearchChange = ({ value }: { value: string }) => {
      setSuggestions(
        userDataForMention.filter((m) => {
          return m.name.toLowerCase().includes(value.toLowerCase());
        }),
      );
    };

    useEffect(() => {
      setSuggestions(userDataForMention);
    }, [userDataForMention]);

    const { MentionSuggestions, plugins } = useMemo(() => {
      const mentionPlugin = createMentionPlugin();
      const { MentionSuggestions } = mentionPlugin;
      const plugins = [mentionPlugin];
      return {
        MentionSuggestions,
        plugins,
      };
    }, []);

    const { getRootProps: getRootProps, getInputProps } = useDropzone({
      onDrop: (f) => uploadFiles(f),
    });

    const onEditorChange = (newState: EditorState) => {
      // editorStateRef.current = newState;
      const newContent = newState.getCurrentContent().getPlainText();
      const prevContent = editorState.getCurrentContent().getPlainText();
      setContent(newContent);
      if (prevContent.length === 0) {
        setEditorState(EditorState.moveFocusToEnd(newState));
      } else {
        setEditorState(newState);
      }
    };

    const handleOnSend = () => {
      //   const content = editorState.getCurrentContent();
      //   const rawObject = convertToRaw(content);
      //   const markdownString = draftToMarkdown(rawObject);
      let parsedMessage = content;
      if (parsedMessage) {
        for (const m of mentionedUserData) {
          const regexp = new RegExp(`\\s${m.name}|^${m.name}`, 'g');
          parsedMessage = parsedMessage.replace(regexp, `@${m.name}`);
        }
        onSend(parsedMessage);
        setEditorState(EditorState.createEmpty());
      }
    };
    return (
      <>
        <Box
          boxSizing="border-box"
          cursor="text"
          p="16px"
          bg="#fefefe"
          h="20%"
          onClick={() => {
            editorRef.current?.focus();
          }}>
          <Editor
            editorKey={'editor'}
            stripPastedStyles={true}
            placeholder="メッセージを入力"
            editorState={editorState}
            onChange={onEditorChange}
            plugins={plugins}
            ref={editorRef}
            keyBindingFn={(e) => {
              if (e.ctrlKey !== e.metaKey && e.key === 'Enter') {
                handleOnSend();
                return 'handled';
              }
              return getDefaultKeyBinding(e);
            }}
          />
          <div className={suggestionStyles.suggestion_wrapper}>
            <MentionSuggestions
              open={mentionOpened}
              onOpenChange={onSuggestionOpenChange}
              suggestions={suggestions}
              onSearchChange={onSuggestionSearchChange}
              onAddMention={onAddMention}
              entryComponent={Entry}
            />
          </div>
        </Box>
        <Link
          {...getRootProps()}
          color={darkFontColor}
          position="absolute"
          zIndex={1}
          bottom={'8px'}
          cursor="pointer"
          right="50px">
          <input {...getInputProps()} onClick={getInputProps().onDrag} />
          <AiOutlinePaperClip size={20} color={darkFontColor} />
        </Link>

        <Link
          color={darkFontColor}
          position="absolute"
          zIndex={1}
          bottom={'8px'}
          cursor="pointer"
          right="8px">
          {isLoading ? (
            <Spinner />
          ) : (
            <IoSend
              size={20}
              onClick={() => handleOnSend()}
              color={content ? blueColor : darkFontColor}
            />
          )}
        </Link>
      </>
    );
  },
);

ChatEditor.displayName = 'ChatEditor';
export default ChatEditor;

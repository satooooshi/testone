import React, { useCallback, useRef, useState } from 'react';
import ReactModal from 'react-modal';
import { ChatGroup, User, UserRole } from 'src/types';
import selectUserModalStyles from '@/styles/components/SelectUserModal.module.scss';
import clsx from 'clsx';
import {
  Avatar,
  Button,
  FormControl,
  FormLabel,
  Select,
} from '@chakra-ui/react';
import { useDropzone } from 'react-dropzone';
import { imageExtensions } from 'src/utils/imageExtensions';
import ReactCrop, { Crop } from 'react-image-crop';
import { getCroppedImageURL } from 'src/utils/getCroppedImageURL';
import { useAPIUploadStorage } from '@/hooks/api/storage/useAPIUploadStorage';
import { dataURLToFile } from 'src/utils/dataURLToFile';

type CreateChatGroupModalProps = {
  isOpen: boolean;
  closeModal: () => void;
  newGroup: Partial<ChatGroup>;
  onChangeNewGroupName: (groupName: string) => void;
  toggleNewGroupMember: (u: User) => void;
  users: User[];
  createGroup: (g: Partial<ChatGroup>) => void;
};

const CreateChatGroupModal: React.FC<CreateChatGroupModalProps> = ({
  isOpen,
  closeModal,
  newGroup,
  onChangeNewGroupName,
  toggleNewGroupMember,
  users,
  createGroup,
}) => {
  const [selectedUserRole, setSelectedUserRole] = useState<UserRole | 'all'>(
    'all',
  );
  const [selectImageUrl, setSelectImageUrl] = useState<string>('');
  const { mutate: uploadImage } = useAPIUploadStorage({
    onSuccess: async (fileURLs) => {
      createGroup({ ...newGroup, imageURL: fileURLs[0] });
      setSelectImageUrl('');
    },
  });
  const [selectImageName, setSelectImageName] = useState<string>('');
  const [crop, setCrop] = useState<Crop>({
    unit: 'px',
    x: 130,
    y: 50,
    width: 200,
    height: 200,
    aspect: 1,
  });
  const [completedCrop, setCompletedCrop] = useState<Crop>();
  const imgRef = useRef<HTMLImageElement>();
  const onEventImageDrop = useCallback((f: File[]) => {
    setSelectImageUrl(URL.createObjectURL(f[0]));
    setSelectImageName(f[0].name);
  }, []);
  const { getRootProps, getInputProps } = useDropzone({
    onDrop: onEventImageDrop,
    accept: imageExtensions,
  });

  const onLoad = useCallback((img) => {
    imgRef.current = img;
  }, []);

  const onFinish = async () => {
    if (imgRef.current && completedCrop) {
      const img = getCroppedImageURL(imgRef.current, completedCrop);
      if (!img) {
        return;
      }
      const result = await dataURLToFile(img, selectImageName);
      uploadImage([result]);
      return;
    }
    if (newGroup.members?.length) {
      createGroup(newGroup);
    }
  };

  return (
    <ReactModal
      ariaHideApp={false}
      style={{ overlay: { zIndex: 100 } }}
      isOpen={isOpen}
      className={selectUserModalStyles.modal}>
      <div className={selectUserModalStyles.top}>
        <div className={selectUserModalStyles.left}>
          <div className={selectUserModalStyles.modal_input_wrapper}>
            <FormLabel>グループ名</FormLabel>
            <input
              type="text"
              className={selectUserModalStyles.modal_input_name}
              value={newGroup.name}
              onChange={(e) => onChangeNewGroupName(e.target.value)}
              placeholder="グループ名を入力して下さい"
            />
          </div>
          {selectImageUrl ? (
            <ReactCrop
              imageStyle={{ maxHeight: '80%' }}
              className={selectUserModalStyles.scroll}
              src={selectImageUrl}
              crop={crop}
              onChange={(newCrop) => setCrop(newCrop)}
              onComplete={(c) => setCompletedCrop(c)}
              onImageLoaded={onLoad}
              circularCrop={true}
            />
          ) : (
            <>
              <FormLabel>ルーム画像</FormLabel>
              <div
                {...getRootProps({
                  className: selectUserModalStyles.image_dropzone,
                })}>
                <input {...getInputProps()} />
                <p>クリックかドラッグアンドドロップでアップロード</p>
              </div>
            </>
          )}
        </div>
        <div className={selectUserModalStyles.right}>
          <FormControl
            className={selectUserModalStyles.user_role_select_wrapper}>
            <FormLabel>招待するユーザーの社員区分</FormLabel>
            <Select
              bg="white"
              onChange={(e) =>
                setSelectedUserRole(e.target.value as UserRole | 'all')
              }
              defaultValue={selectedUserRole}>
              <option value={'all'}>全て</option>
              <option value={UserRole.ADMIN}>管理者</option>
              <option value={UserRole.INSTRUCTOR}>講師</option>
              <option value={UserRole.COACH}>コーチ</option>
              <option value={UserRole.COMMON}>一般社員</option>
            </Select>
          </FormControl>
          <div className={selectUserModalStyles.users}>
            {selectedUserRole === 'all'
              ? users.map((u) => (
                  <a
                    key={u.id}
                    onClick={() => toggleNewGroupMember(u)}
                    className={clsx(
                      selectUserModalStyles.user_card,
                      newGroup.members?.filter((s) => s.id === u.id).length &&
                        selectUserModalStyles.selected_member,
                    )}>
                    <div className={selectUserModalStyles.user_card_left}>
                      <Avatar
                        src={u.avatarUrl}
                        className={selectUserModalStyles.user_card_avatar}
                      />
                      <p className={selectUserModalStyles.user_card_name}>
                        {u.lastName + ' ' + u.firstName}
                      </p>
                    </div>
                  </a>
                ))
              : users.map(
                  (u) =>
                    u.role === selectedUserRole && (
                      <a
                        key={u.id}
                        onClick={() => toggleNewGroupMember(u)}
                        className={clsx(
                          selectUserModalStyles.user_card,
                          newGroup.members?.filter((s) => s.id === u.id)
                            .length && selectUserModalStyles.selected_member,
                        )}>
                        <div className={selectUserModalStyles.user_card_left}>
                          <Avatar
                            src={u.avatarUrl}
                            className={selectUserModalStyles.user_card_avatar}
                          />
                          <p className={selectUserModalStyles.user_card_name}>
                            {u.lastName + ' ' + u.firstName}
                          </p>
                        </div>
                      </a>
                    ),
                )}
          </div>
        </div>
      </div>
      <div className={selectUserModalStyles.bottom}>
        <div className={selectUserModalStyles.modal_bottom_buttons}>
          <Button
            size="md"
            width="140px"
            colorScheme="blue"
            borderRadius={5}
            className={selectUserModalStyles.modal_cancel_button}
            onClick={closeModal}>
            キャンセル
          </Button>
          <Button
            size="md"
            width="140px"
            colorScheme="green"
            borderRadius={5}
            onClick={onFinish}>
            作成
          </Button>
        </div>
      </div>
    </ReactModal>
  );
};

export default CreateChatGroupModal;

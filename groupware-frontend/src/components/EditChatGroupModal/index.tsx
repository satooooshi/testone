import React, { useCallback, useEffect, useRef, useState } from 'react';
import ReactModal from 'react-modal';
import editChatGroupModalStyles from '@/styles/components/EditChatGroupModal.module.scss';
import { ChatGroup } from 'src/types';
import { Button, FormLabel, Input } from '@chakra-ui/react';
// import selectUserModalStyles from '@/styles/components/SelectUserModal.module.scss';
import { useAPIUploadStorage } from '@/hooks/api/storage/useAPIUploadStorage';
import { useDropzone } from 'react-dropzone';
import ReactCrop, { Crop } from 'react-image-crop';
import { dataURLToFile } from 'src/utils/dataURLToFile';
import { getCroppedImageURL } from 'src/utils/getCroppedImageURL';
import { imageExtensions } from 'src/utils/imageExtensions';

type EditChatGroupModalProps = {
  isOpen: boolean;
  closeModal: () => void;
  chatGroup: Partial<ChatGroup>;
  saveGroup: (g: Partial<ChatGroup>) => void;
};

const EditChatGroupModal: React.FC<EditChatGroupModalProps> = ({
  isOpen,
  closeModal,
  chatGroup,
  saveGroup,
}) => {
  const [newGroupInfo, setNewGroupInfo] =
    useState<Partial<ChatGroup>>(chatGroup);
  const [selectImageUrl, setSelectImageUrl] = useState<string>('');
  const { mutate: uploadImage } = useAPIUploadStorage({
    onSuccess: async (fileURLs) => {
      saveGroup({ ...newGroupInfo, imageURL: fileURLs[0] });
      setSelectImageUrl('');
      setSelectImageName('');
      setCompletedCrop(undefined);
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
    saveGroup(newGroupInfo);
  };

  useEffect(() => {
    setNewGroupInfo(chatGroup);
  }, [chatGroup]);

  return (
    <ReactModal
      style={{ overlay: { zIndex: 110 } }}
      ariaHideApp={false}
      isOpen={isOpen}
      className={editChatGroupModalStyles.modal}>
      <div className={editChatGroupModalStyles.top}>
        <div className={editChatGroupModalStyles.modal_input_wrapper}>
          <FormLabel>グループ名</FormLabel>
          <Input
            type="text"
            className={editChatGroupModalStyles.modal_input_name}
            value={newGroupInfo.name}
            defaultValue={chatGroup.name}
            onChange={(e) =>
              setNewGroupInfo((i) => ({ ...i, name: e.target.value }))
            }
            placeholder="グループ名を入力して下さい"
          />
        </div>
        {selectImageUrl ? (
          <ReactCrop
            src={selectImageUrl}
            crop={crop}
            onChange={(newCrop) => setCrop(newCrop)}
            onComplete={(c) => setCompletedCrop(c)}
            onImageLoaded={onLoad}
            circularCrop={true}
          />
        ) : (
          <div
            {...getRootProps({
              className: editChatGroupModalStyles.image_dropzone,
            })}>
            <input {...getInputProps()} />
            <img
              src={newGroupInfo.imageURL}
              className={editChatGroupModalStyles.image}
              alt=""
            />
          </div>
        )}
      </div>
      <div className={editChatGroupModalStyles.bottom}>
        <div className={editChatGroupModalStyles.modal_bottom_buttons}>
          <Button
            size="md"
            width="140px"
            colorScheme="blue"
            borderRadius={5}
            className={editChatGroupModalStyles.modal_cancel_button}
            onClick={closeModal}>
            キャンセル
          </Button>
          <Button
            size="md"
            width="140px"
            colorScheme="green"
            borderRadius={5}
            onClick={onFinish}>
            更新
          </Button>
        </div>
      </div>
    </ReactModal>
  );
};

export default EditChatGroupModal;

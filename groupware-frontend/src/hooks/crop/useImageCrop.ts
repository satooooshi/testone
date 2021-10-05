import { useReducer } from 'react';
import { Crop } from 'react-image-crop';
import { getCroppedImageURL } from 'src/utils/getCroppedImageURL';

type UseImageCropState = {
  crop: Crop;
  completedCrop?: Crop;
  imageName?: string;
  imageURL?: string;
  croppedImageURL?: string;
};

type UseImageCropAction =
  | {
      type: 'setCrop';
      value: Crop;
    }
  | {
      type: 'setCompletedCrop';
      value: Crop;
      ref: HTMLImageElement | null;
    }
  | {
      type: 'setImageFile';
      value: File | undefined;
    };

const cropReducer = (
  state: UseImageCropState,
  action: UseImageCropAction,
): UseImageCropState => {
  switch (action.type) {
    case 'setCrop': {
      return { ...state, crop: action.value };
    }
    case 'setCompletedCrop': {
      if (!action.ref) {
        return state;
      }
      const croppedImageURL = getCroppedImageURL(action.ref, action.value);
      return {
        ...state,
        completedCrop: action.value,
        croppedImageURL: croppedImageURL,
      };
    }
    case 'setImageFile': {
      if (!action.value) {
        return {
          ...state,
          imageURL: undefined,
          imageName: undefined,
          completedCrop: undefined,
          croppedImageURL: undefined,
        };
      }
      const imageURL = URL.createObjectURL(action.value);
      const imageName = action.value.name;
      return { ...state, imageURL, imageName };
    }
  }
};

export const useImageCrop = (initialValue?: Crop) => {
  return useReducer(cropReducer, {
    crop: initialValue || {
      unit: 'px',
      aspect: 1 / 1,
      x: 130,
      y: 50,
      width: 200,
      height: 200,
    },
  });
};

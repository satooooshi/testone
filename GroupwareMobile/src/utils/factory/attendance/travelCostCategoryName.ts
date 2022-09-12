import {TravelCostCategory} from '../../../types';

export const travelCostCategoryName = (category: TravelCostCategory) => {
  switch (category) {
    case TravelCostCategory.CLIENT:
      return '現場(お客様都合)';
    case TravelCostCategory.INHOUSE:
      return 'ボールド(自社都合)';
  }
};

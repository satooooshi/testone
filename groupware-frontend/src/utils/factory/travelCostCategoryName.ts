import { TravelCostCategory } from 'src/types';

export const travelCostCategoryName = (category: TravelCostCategory) => {
  switch (category) {
    case TravelCostCategory.CLIENT:
      return '現場(お客様都合)';
    case TravelCostCategory.INHOUSE:
      return 'Valleyin(自社都合)';
  }
};

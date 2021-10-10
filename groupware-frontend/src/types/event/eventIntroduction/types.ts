import { EventSchedule } from 'src/types';
import { EventTab } from 'src/types/header/tab/types';

export interface EachEventData {
  events?: EventSchedule[];
  bottomImages: StaticImageData[];
  headlineImage: JSX.Element | StaticImageData;
  heading: EventTab;
  subHeading: string;
  content: string;
}

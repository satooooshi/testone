import { EventSchedule } from 'src/types';

export interface EachEventData {
  events?: EventSchedule[];
  bottomImages: StaticImageData[];
  headlineImage: JSX.Element | StaticImageData;
  subHeading: string;
  content: string;
}

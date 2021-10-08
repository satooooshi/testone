import { EventSchedule } from 'src/types';

export interface EachEventData {
  events?: EventSchedule[];
  bottomImages: StaticImageData[];
  imgUrl: string;
  subHeading: string;
  content: string;
}

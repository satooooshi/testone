import { Map } from 'immutable';
import goodSticker from '@/public/good_sticker.png';
import shockSticker from '@/public/shock_sticker.png';
import angrySticker from '@/public/angry_sticker.png';
import funnySticker from '@/public/funny_sticker.png';
import callSticker from '@/public/call_sticker.png';
import lookSticker from '@/public/look_sticker.png';
import helpSticker from '@/public/help_sticker.png';
import questionSticker from '@/public/question_sticker.png';
import goodJobSticker from '@/public/goodjob_sticker.png';
import rogerSticker from '@/public/roger_sticker.png';
import sorrySticker from '@/public/sorry_sticker.png';
import willDoSticker from '@/public/willdo_sticker.png';

const reactionStickers: Immutable.Map<
  string,
  Immutable.Map<string, Immutable.Map<string, string>>
> = Map({
  data: Map({
    0: Map({
      url: goodSticker.src,
    }),
    1: Map({
      url: shockSticker.src,
    }),
    2: Map({
      url: angrySticker.src,
    }),
    3: Map({
      url: funnySticker.src,
    }),
    4: Map({
      url: callSticker.src,
    }),
    5: Map({
      url: lookSticker.src,
    }),
    6: Map({
      url: helpSticker.src,
    }),
    7: Map({
      url: questionSticker.src,
    }),
    8: Map({
      url: goodJobSticker.src,
    }),
    9: Map({
      url: rogerSticker.src,
    }),
    10: Map({
      url: sorrySticker.src,
    }),
    11: Map({
      url: willDoSticker.src,
    }),
  }),
});

export default reactionStickers;

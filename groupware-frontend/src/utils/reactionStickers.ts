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
    'b3aa388f-b9f4-45b0-bba5-d92cf2caa48b': Map({
      id: goodSticker.src,
      url: goodSticker.src,
    }),
    'adec3f13-823c-47c3-b4d1-be4f68dd9d6d': Map({
      id: shockSticker.src,
      url: shockSticker.src,
    }),
    'e14b5a20-1025-4952-b731-41cd4b118ba0': Map({
      id: angrySticker.src,
      url: angrySticker.src,
    }),
    '659a0dbf-5f85-4f32-999d-eb9ba6b0f417': Map({
      id: funnySticker.src,
      url: funnySticker.src,
    }),
    'fab0ae95-ae95-4775-b484-72c290437602': Map({
      id: callSticker.src,
      url: callSticker.src,
    }),
    '71853190-8acd-4d3b-b4fd-63f7b0648daa': Map({
      id: lookSticker.src,
      url: lookSticker.src,
    }),
    // 6: Map({
    //   url: helpSticker.src,
    // }),
    // 7: Map({
    //   url: questionSticker.src,
    // }),
    // 8: Map({
    //   url: goodJobSticker.src,
    // }),
    // 9: Map({
    //   url: rogerSticker.src,
    // }),
    // 10: Map({
    //   url: sorrySticker.src,
    // }),
    // 11: Map({
    //   url: willDoSticker.src,
    // }),
  }),
});

export default reactionStickers;

import { TagType } from 'src/entities/tag.entity';
import { isNotEmptyExceptTags } from 'src/utils/dto/isNotEmptyExceptTags';

export class CreateTagDto {
  @isNotEmptyExceptTags({
    message: '名前は必須項目です。空白のみは設定できません。',
  })
  name: string;

  @isNotEmptyExceptTags({
    message: 'タイプは必須項目です。',
  })
  type: TagType;
}
export default CreateTagDto;

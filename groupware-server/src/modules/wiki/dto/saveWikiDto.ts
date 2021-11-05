import { IsNotEmpty, IsString } from 'class-validator';
import { isNotEmptyExceptTags } from 'src/utils/dto/isNotEmptyExceptTags';

export class saveWikiDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @isNotEmptyExceptTags()
  @IsString()
  body: string;
}
export default saveWikiDto;

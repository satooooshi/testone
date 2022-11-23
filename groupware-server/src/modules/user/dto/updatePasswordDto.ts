import { IsString } from 'class-validator';
class UpdatePasswordDto {
  @IsString()
  currentPassword: string;

  @IsString()
  newPassword: string;
}
export default UpdatePasswordDto;

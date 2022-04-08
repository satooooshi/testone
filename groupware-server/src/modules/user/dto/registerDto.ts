import { UserRole } from 'src/entities/user.entity';

class RegisterDto {
  email: string;
  lastName: string;
  firstName: string;
  password: string;
  introduce: string;
  role: UserRole;
  avatarUrl?: string;
  employeeId: string | null;
}
export default RegisterDto;

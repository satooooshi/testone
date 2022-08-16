import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { UserRole } from 'src/entities/user.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private roles: UserRole[]) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    if (!this.roles) {
      return true;
    }
    if (!this.roles.includes(request.user?.role)) {
      throw new BadRequestException('The action is not allowed');
    }
    return true;
  }
}

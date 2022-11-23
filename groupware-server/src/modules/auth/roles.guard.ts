import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  SetMetadata,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from 'src/entities/user.entity';

export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<UserRole[]>('roles', context.getHandler());
    if (!roles) {
      return false;
    }

    const request = context.switchToHttp().getRequest();
    if (!request.user) {
      throw new UnauthorizedException();
    }
    if (!roles.includes(request.user?.role)) {
      throw new BadRequestException('The action is not allowed');
    }
    return true;
  }
}

@Injectable()
export class ReqUserOrRolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<UserRole[]>('roles', context.getHandler());
    if (!roles) {
      return false;
    }

    const request = context.switchToHttp().getRequest();
    if (!request.user) {
      throw new UnauthorizedException();
    }
    if (request.user.id === request.body?.id) {
      return true;
    }
    if (!roles.includes(request.user?.role)) {
      throw new BadRequestException('The action is not allowed');
    }
    return true;
  }
}

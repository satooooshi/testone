import {
  Controller,
  Get,
  Req,
  UseGuards,
  Post,
  Body,
  Param,
  Query,
  BadRequestException,
  Res,
} from '@nestjs/common';
import { BranchType, User, UserRole } from 'src/entities/user.entity';
import JwtAuthenticationGuard from '../auth/jwtAuthentication.guard';
import RequestWithUser from '../auth/requestWithUser.interface';
import { UserService } from './user.service';
import UpdatePasswordDto from './dto/updatePasswordDto';
import { Response } from 'express';
import { ChatService } from '../chat/chat.service';

export interface SearchQueryToGetUsers {
  page?: string;
  word?: string;
  tag?: string;
  sort?: 'event' | 'question' | 'answer' | 'knowledge';
  branch?: BranchType;
  role?: UserRole;
  verified?: boolean;
  duration?: 'month' | 'week';
}

export interface QueryToGetUserCsv {
  from?: string;
  to?: string;
}

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly chatService: ChatService,
  ) {}

  //@TODO this endpoint is for inputting data
  // @Post('register-users')
  // async registerUsers(@Body() users: User[]) {
  //   return await this.userService.registerUsers(users);
  // }

  @Get('csv')
  @UseGuards(JwtAuthenticationGuard)
  async getCsv(@Query() query: QueryToGetUserCsv, @Res() res: Response) {
    const { from = new Date().toString(), to = new Date().toString() } = query;
    if (!from && !to) {
      throw new BadRequestException();
    }

    const fromDate = new Date(from);
    const toDate = new Date(to);
    const csv = await this.userService.getCsv({ fromDate, toDate });
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=ueer.csv');

    res.status(200).end(csv);
  }

  @Get('search')
  @UseGuards(JwtAuthenticationGuard)
  async search(@Query() query: SearchQueryToGetUsers) {
    return await this.userService.search(query);
  }

  @UseGuards(JwtAuthenticationGuard)
  @Get('profile')
  async getProfile(@Req() req: RequestWithUser): Promise<User> {
    const { id } = req.user;
    const user = await this.userService.getProfile(id);
    return user;
  }

  @UseGuards(JwtAuthenticationGuard)
  @Get('profile/:id')
  async getAllInfoById(@Param() params: { id: number }): Promise<User> {
    const { id } = params;
    const userProfile = await this.userService.getAllInfoById(id);

    return userProfile;
  }

  @UseGuards(JwtAuthenticationGuard)
  @Get('others-list')
  async getUsers(
    @Req() req: RequestWithUser,
    @Query() query: { status: 'ALL' | '' },
  ): Promise<User[]> {
    const requestUser = req.user;
    const allUsers = await this.userService.getUsers();
    if (query.status === 'ALL') {
      return allUsers;
    }
    const usersExceptRequestUser = allUsers.filter(
      (u) => u.id !== requestUser.id,
    );
    return usersExceptRequestUser;
  }

  @UseGuards(JwtAuthenticationGuard)
  @Post('update-user')
  async updateUser(
    @Req() request: RequestWithUser,
    @Body() user: Partial<User>,
  ): Promise<User> {
    if (!user?.id) {
      throw new BadRequestException('The user is not exist');
    }
    // if (!user.id) {
    //   return await this.userService.saveUser({ ...request.user, ...user });
    // }
    return await this.userService.saveUser(user);
  }

  @UseGuards(JwtAuthenticationGuard)
  @Post('update-password')
  async updatePassword(
    @Req() request: RequestWithUser,
    @Body()
    content: UpdatePasswordDto,
  ): Promise<User> {
    return await this.userService.updatePassword(request, content);
  }

  @UseGuards(JwtAuthenticationGuard)
  @Post('delete-user')
  async deleteUser(@Body() user: User) {
    const rooms = await this.chatService.getRoomsId(user.id);
    for (const r of rooms) {
      if (r.id) {
        await this.chatService.leaveChatRoom(user.id, r.id);
      }
    }
    await this.userService.deleteUser(user);
  }
}

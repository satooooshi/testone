import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { Tag } from 'src/entities/tag.entity';
import { UserTag } from 'src/entities/userTag.entity';
import JwtAuthenticationGuard from '../auth/jwtAuthentication.guard';
import { TagService } from './tag.service';

@Controller('tag')
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Get('list')
  async getTags(): Promise<Tag[]> {
    const tags = await this.tagService.getTags();
    return tags;
  }

  @Get('user-tag/list')
  async getUserTags(): Promise<UserTag[]> {
    const tags = await this.tagService.getUserTags();
    return tags;
  }

  @Post('create')
  @UseGuards(JwtAuthenticationGuard)
  async createTag(@Body() body: Partial<Tag>): Promise<Tag> {
    if (!body.name) {
      throw new BadRequestException('tag name is required');
    }
    return await this.tagService.createTag(body);
  }

  @Delete('delete/:id')
  @UseGuards(JwtAuthenticationGuard)
  async deleteTag(@Param() params: { id: number }, @Res() res: Response) {
    const { id } = params;
    const deleteResult = await this.tagService.deleteTag(id);
    console.log(deleteResult);
    if (deleteResult) {
      res.sendStatus(200);
    }
  }

  @Delete('user-tag/delete/:id')
  @UseGuards(JwtAuthenticationGuard)
  async deleteUserTag(@Param() params: { id: number }, @Res() res: Response) {
    const { id } = params;
    const deleteResult = await this.tagService.deleteUserTag(id);
    if (deleteResult) {
      res.sendStatus(200);
    }
  }

  @Post('user-tag/create')
  @UseGuards(JwtAuthenticationGuard)
  async createUserTag(@Body() body: Partial<Tag>): Promise<Tag> {
    if (!body.name) {
      throw new BadRequestException('tag name is required');
    }
    return await this.tagService.createUserTag(body);
  }
}

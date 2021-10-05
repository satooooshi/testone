import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
} from '@nestjs/common';
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

  @Post('user-tag/create')
  @UseGuards(JwtAuthenticationGuard)
  async createUserTag(@Body() body: Partial<Tag>): Promise<Tag> {
    if (!body.name) {
      throw new BadRequestException('tag name is required');
    }
    return await this.tagService.createUserTag(body);
  }
}

import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Tag } from 'src/entities/tag.entity';
import { UserTag } from 'src/entities/userTag.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TagService {
  constructor(
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
    @InjectRepository(UserTag)
    private readonly userTagRepository: Repository<UserTag>,
  ) {}

  public async getTags(): Promise<Tag[]> {
    return await this.tagRepository.find({ order: { name: 'ASC' } });
  }

  public async getUserTags(): Promise<UserTag[]> {
    return await this.userTagRepository.find({ order: { name: 'ASC' } });
  }

  public async createTag(tag: Partial<Tag>): Promise<Tag> {
    try {
      const newTag = await this.tagRepository.save(tag);
      return newTag;
    } catch (err) {
      console.log(err);
      //@TODO more error handling is required
      throw new InternalServerErrorException('Something happened');
    }
  }

  public async createUserTag(userTag: Partial<Tag>): Promise<Tag> {
    try {
      const newUserTag = await this.userTagRepository.save(userTag);
      return newUserTag;
    } catch (err) {
      throw new BadRequestException(
        'some parameter is missing or illegal request',
      );
    }
  }
}

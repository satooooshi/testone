import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChatAlbum } from 'src/entities/chatAlbum.entity';
import { ChatAlbumImage } from 'src/entities/chatAlbumImage.entity';
import { ChatGroup } from 'src/entities/chatGroup.entity';
import { Repository } from 'typeorm';
import { StorageService } from '../storage/storage.service';

export interface GetChatAlbumsQuery {
  group: number;
  page?: string;
}

export interface GetChatAlbumsResult {
  albums: ChatAlbum[];
  pageCount: number;
}

export interface GetChatAlbumImagesResult {
  images: ChatAlbumImage[];
  pageCount: number;
}

@Injectable()
export class ChatAlbumService {
  constructor(
    @InjectRepository(ChatGroup)
    private readonly chatGroupRepository: Repository<ChatGroup>,
    @InjectRepository(ChatAlbum)
    private readonly albumRepository: Repository<ChatAlbum>,
    @InjectRepository(ChatAlbumImage)
    private readonly albumImageRepository: Repository<ChatAlbumImage>,
    private readonly storageService: StorageService,
  ) {}
  public async saveChatAlbums(dto: Partial<ChatAlbum>): Promise<ChatAlbum> {
    const savedAlbum = await this.albumRepository.save({
      ...dto,
      images: undefined,
    });
    if (dto.images?.length) {
      const sentImages = dto.images.map((i) => ({
        ...i,
        imageURL: this.storageService.parseSignedURLToStorageURL(i.imageURL),
        chatAlbum: savedAlbum,
      }));

      await this.albumImageRepository.save(sentImages);
      return { ...savedAlbum, images: sentImages };
    }
    return savedAlbum;
  }

  public async saveChatAlbumImages(
    dto: Partial<ChatAlbumImage[]>,
  ): Promise<ChatAlbumImage[]> {
    const sentImages = dto.map((i) => ({
      ...i,
      imageURL: this.storageService.parseSignedURLToStorageURL(i.imageURL),
    }));

    return await this.albumImageRepository.save(sentImages);
  }

  public async deleteChatAlbums(albumId: number) {
    await this.albumRepository.delete(albumId);
  }

  public async getChatAlbumImages(
    albumID: number,
    page: string,
  ): Promise<GetChatAlbumImagesResult> {
    const limit = 20;
    const offset = limit * (Number(page) - 1);
    const [albumImages, count] = await this.albumImageRepository
      .createQueryBuilder('album_images')
      .leftJoinAndSelect('album_images.chatAlbum', 'chat_albums')
      .where('chat_albums.id = :albumID', { albumID })
      .withDeleted()
      .skip(offset)
      .take(limit)
      .orderBy('chat_albums.createdAt', 'DESC')
      .getManyAndCount();
    const pageCount = Math.floor(count / limit) + 1;
    return { images: albumImages, pageCount };
  }

  public async getChatAlbums(
    query: GetChatAlbumsQuery,
    userID: number,
  ): Promise<GetChatAlbumsResult> {
    const { page, group } = query;
    const limit = 20;
    const offset = limit * (Number(page) - 1);
    //@TODO limit images
    const [existAlbums, count] = await this.albumRepository
      .createQueryBuilder('chat_albums')
      .leftJoinAndSelect('chat_albums.chatGroup', 'chat_groups')
      .leftJoinAndSelect('chat_albums.editors', 'editors')
      .leftJoinAndSelect('chat_albums.images', 'images')
      .where('chat_groups.id = :chatGroupId', { chatGroupId: group })
      .withDeleted()
      .skip(offset)
      .take(limit)
      .orderBy('chat_albums.createdAt', 'DESC')
      .getManyAndCount();

    const albums = existAlbums.map((n) => ({
      ...n,
      isEditor: !!n.editors?.filter((e) => e.id === userID).length,
    }));
    const pageCount = Math.floor(count / limit) + 1;
    return { albums, pageCount };
  }
}

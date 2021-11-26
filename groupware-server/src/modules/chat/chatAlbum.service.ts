import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChatAlbum } from 'src/entities/chatAlbum.entity';
import { ChatAlbumImage } from 'src/entities/chatAlbumImage.entity';
import { ChatGroup } from 'src/entities/chatGroup.entity';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import { StorageService } from '../storage/storage.service';
import { UserService } from '../user/user.service';

export interface GetChatAlbumsQuery {
  group: number;
  page?: string;
}

export interface GetChatAlbumsResult {
  albums: ChatAlbum[];
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
    private readonly userService: UserService,
  ) {}

  public async generateSignedStorageURLsFromChatAlbumObj(
    chatAlbum: ChatAlbum,
  ): Promise<ChatAlbum> {
    const images: ChatAlbumImage[] = [];
    const editors: User[] = [];
    for (const i of chatAlbum.images) {
      const parsedImageUrl =
        await this.storageService.parseStorageURLToSignedURL(i.imageURL);
      const parsedImageObj = { ...i, imageURL: parsedImageUrl };
      images.push(parsedImageObj);
    }
    for (const e of chatAlbum.editors) {
      const parsedAvatarUrl =
        await this.storageService.parseStorageURLToSignedURL(e.avatarUrl);
      const parsedAvatarObj = { ...e, avatarUrl: parsedAvatarUrl };
      editors.push(parsedAvatarObj);
    }
    chatAlbum.images = images;
    chatAlbum.editors = editors;

    return chatAlbum;
  }

  public async generateSignedStorageURLsFromChatAlbumArr(
    chatAlbums: ChatAlbum[],
  ): Promise<ChatAlbum[]> {
    const parsedAlbums = [];
    for (const n of chatAlbums) {
      const parsed = await this.generateSignedStorageURLsFromChatAlbumObj(n);
      parsedAlbums.push(parsed);
    }
    return parsedAlbums;
  }

  public async saveChatAlbums(dto: Partial<ChatAlbum>): Promise<ChatAlbum> {
    const savedAlbum = await this.albumRepository.save(dto);
    if (dto.images?.length) {
      const sentImages = dto.images.map((i) => ({
        ...i,
        imageURL: this.storageService.parseSignedURLToStorageURL(i.imageURL),
        chatAlbum: savedAlbum,
      }));

      await this.albumImageRepository.save(sentImages);
    }
    return savedAlbum;
  }

  public async deleteChatAlbums(albumId: number) {
    await this.albumRepository.delete(albumId);
  }

  public async getChatAlbumDetail(
    albumID: number,
    userID: number,
  ): Promise<ChatAlbum> {
    let albumDetail = await this.albumRepository.findOne(albumID, {
      relations: ['chatGroup', 'editors', 'images'],
      withDeleted: true,
    });
    albumDetail = await this.generateSignedStorageURLsFromChatAlbumObj(
      albumDetail,
    );
    albumDetail.isEditor = !!albumDetail.editors.filter((e) => e.id === userID)
      .length;
    return albumDetail;
  }

  public async getChatAlbums(
    query: GetChatAlbumsQuery,
    userID: number,
  ): Promise<GetChatAlbumsResult> {
    const { page, group } = query;
    const limit = 60;
    const offset = limit * (Number(page) - 1);
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

    let albums = await this.generateSignedStorageURLsFromChatAlbumArr(
      existAlbums,
    );
    albums = existAlbums.map((n) => ({
      ...n,
      isEditor: !!n.editors?.filter((e) => e.id === userID).length,
    }));
    const pageCount = Math.floor(count / limit) + 1;
    return { albums, pageCount };
  }
}

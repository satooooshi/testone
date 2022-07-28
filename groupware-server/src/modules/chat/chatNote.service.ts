import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChatGroup } from 'src/entities/chatGroup.entity';
import { ChatNote } from 'src/entities/chatNote.entity';
import { ChatNoteImage } from 'src/entities/chatNoteImage.entity';
import { Repository } from 'typeorm';

export interface GetChatNotesQuery {
  group: number;
  page?: string;
}

export interface GetChatNotesResult {
  notes: ChatNote[];
  pageCount: number;
}

@Injectable()
export class ChatNoteService {
  constructor(
    @InjectRepository(ChatNote)
    private readonly noteRepository: Repository<ChatNote>,
    @InjectRepository(ChatNoteImage)
    private readonly noteImageRepository: Repository<ChatNoteImage>,
    @InjectRepository(ChatGroup)
    private readonly chatGroupRepository: Repository<ChatGroup>,
  ) {}

  public async saveChatNotes(dto: Partial<ChatNote>): Promise<ChatNote> {
    const savedNote = await this.noteRepository.save(dto);
    if (dto.images?.length) {
      const sentImages = dto.images.map((i) => ({
        ...i,
        chatNote: savedNote,
      }));

      await this.noteImageRepository.save(sentImages);
    }
    return savedNote;
  }

  public async deleteChatNotes(noteId: number) {
    await this.noteRepository.delete(noteId);
  }

  public async getChatNoteDetail(
    roomID: number,
    noteID: number,
    userID: number,
  ): Promise<ChatNote> {
    const isUserJoining = await this.chatGroupRepository
      .createQueryBuilder('chat_groups')
      .innerJoin('chat_groups.members', 'm', 'm.id = :userId', {
        userId: userID,
      })
      .where('chat_groups.id = :chatGroupId', { chatGroupId: roomID })
      .getOne();
    if (!isUserJoining) {
      throw new BadRequestException('The user is not a member');
    }

    const noteDetail = await this.noteRepository.findOne(noteID, {
      relations: ['chatGroup', 'editors', 'images'],
      withDeleted: true,
    });
    noteDetail.isEditor = !!noteDetail.editors.filter((e) => e.id === userID)
      .length;
    return noteDetail;
  }

  public async getChatNotes(
    query: GetChatNotesQuery,
    userID: number,
  ): Promise<GetChatNotesResult> {
    const { page, group } = query;

    const isUserJoining = await this.chatGroupRepository
      .createQueryBuilder('chat_groups')
      .innerJoin('chat_groups.members', 'm', 'm.id = :userId', {
        userId: userID,
      })
      .where('chat_groups.id = :chatGroupId', { chatGroupId: group })
      .getOne();
    if (!isUserJoining) {
      throw new BadRequestException('The user is not a member');
    }

    const limit = 20;
    const offset = limit * (Number(page) - 1);
    const [existNotes, count] = await this.noteRepository
      .createQueryBuilder('chat_notes')
      .leftJoinAndSelect('chat_notes.chatGroup', 'chat_groups')
      .leftJoinAndSelect('chat_notes.editors', 'editors')
      .leftJoinAndSelect('chat_notes.images', 'images')
      .where('chat_groups.id = :chatGroupId', { chatGroupId: group })
      .withDeleted()
      .skip(offset)
      .take(limit)
      .orderBy('chat_notes.createdAt', 'DESC')
      .getManyAndCount();

    const notes = existNotes.map((n) => ({
      ...n,
      isEditor: !!n.editors?.filter((e) => e.id === userID).length,
    }));
    const pageCount = Math.floor(count / limit) + 1;
    return { notes, pageCount };
  }

  public async saveChatNoteImages(
    dto: Partial<ChatNoteImage[]>,
  ): Promise<ChatNoteImage[]> {
    const sentImages = dto.map((i) => ({
      ...i,
    }));

    return await this.noteImageRepository.save(sentImages);
  }
}

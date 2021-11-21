import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { QAAnswer } from 'src/entities/qaAnswer.entity';
import { QAAnswerReply } from 'src/entities/qaAnswerReply.entity';
import { RuleCategory, Wiki, WikiType } from 'src/entities/wiki.entity';
import JwtAuthenticationGuard from '../auth/jwtAuthentication.guard';
import RequestWithUser from '../auth/requestWithUser.interface';
import SaveWikiDto from './dto/SaveWikiDto';
import { WikiService } from './wiki.service';

export interface SearchQueryToGetWiki {
  page?: string;
  word?: string;
  tag?: string;
  type?: WikiType;
  status?: 'new' | 'resolved';
  writer?: string;
  answer_writer?: string;
  rule_category?: RuleCategory;
}

export interface SearchResultToGetWiki {
  // this key is the total page count
  pageCount: number;
  wiki: Wiki[];
}

@Controller('wiki')
export class WikiController {
  constructor(private readonly qaService: WikiService) {}

  @Get('list')
  @UseGuards(JwtAuthenticationGuard)
  async getWikiList(
    @Query() query: SearchQueryToGetWiki,
  ): Promise<SearchResultToGetWiki> {
    return await this.qaService.getWikiList(query);
  }

  @Get('detail/:id')
  async getWikiDetail(@Param() params: { id: number }): Promise<Wiki> {
    return await this.qaService.getWikiDetail(params.id);
  }

  @Get('latest')
  @UseGuards(JwtAuthenticationGuard)
  async getLatest(): Promise<Wiki[]> {
    return await this.qaService.getLatestWiki();
  }

  @UseGuards(JwtAuthenticationGuard)
  @Post('create-wiki')
  async createWiki(
    @Req() request: RequestWithUser,
    @Body() wiki: SaveWikiDto,
  ): Promise<Wiki> {
    wiki.writer = request.user;
    return await this.qaService.saveWiki(wiki);
  }

  @UseGuards(JwtAuthenticationGuard)
  @Post('update-wiki')
  async updateWiki(
    @Req() request: RequestWithUser,
    @Body() wiki: SaveWikiDto,
  ): Promise<Wiki> {
    if (!wiki.id || !wiki.title || !wiki.body) {
      throw new BadRequestException('title and body is necessary');
    }
    wiki.writer = request.user;
    return await this.qaService.saveWiki(wiki);
  }

  @UseGuards(JwtAuthenticationGuard)
  @Post('create-answer')
  async createAnswer(
    @Req() request: RequestWithUser,
    @Body() answer: QAAnswer,
  ): Promise<QAAnswer> {
    answer.writer = request.user;
    return await this.qaService.createAnswer(answer);
  }

  @UseGuards(JwtAuthenticationGuard)
  @Post('create-answer-reply')
  async createAnswerReply(
    @Req() request: RequestWithUser,
    @Body() reply: QAAnswerReply,
  ): Promise<QAAnswerReply> {
    reply.writer = request.user;
    return await this.qaService.createAnswerReply(reply);
  }

  @UseGuards(JwtAuthenticationGuard)
  @Post('create-best-answer')
  async createBestAnswer(@Body() wiki: Partial<Wiki>): Promise<Wiki> {
    if (!wiki.bestAnswer) {
      throw new BadRequestException('bestAnswer is necessary');
    }
    return await this.qaService.saveWiki({
      ...wiki,
      resolvedAt: new Date(),
    });
  }
}

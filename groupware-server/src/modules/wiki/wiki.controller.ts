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
import {
  BoardCategory,
  RuleCategory,
  Wiki,
  WikiType,
} from 'src/entities/wiki.entity';
import JwtAuthenticationGuard from '../auth/jwtAuthentication.guard';
import RequestWithUser from '../auth/requestWithUser.interface';
import SaveWikiDto from './dto/saveWikiDto';
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
  board_category?: BoardCategory;
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
    @Req() req: RequestWithUser,
    @Query() query: SearchQueryToGetWiki,
  ): Promise<SearchResultToGetWiki> {
    const userID = req.user.id;
    return await this.qaService.getWikiList(userID, query);
  }

  @Get('detail/:id')
  @UseGuards(JwtAuthenticationGuard)
  async getWikiDetail(
    @Req() request: RequestWithUser,
    @Param('id') id: number,
  ): Promise<Wiki> {
    return await this.qaService.getWikiDetail(request.user.id, id);
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

  @Get('/v2/answer-detail/:id')
  async getAnswerDetail(@Param('id') id: number): Promise<QAAnswer> {
    return await this.qaService.getAnswerDetail(id);
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

  @UseGuards(JwtAuthenticationGuard)
  @Post('toggle-good-for-board')
  async toggleGoodForBoard(
    @Req() req: RequestWithUser,
    @Body() WikiID: { id: number },
  ): Promise<Partial<Wiki>> {
    return this.qaService.toggleGoodForBoard(req.user.id, WikiID.id);
  }
}

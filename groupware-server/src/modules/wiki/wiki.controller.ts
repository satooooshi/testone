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
import { Wiki, WikiType } from 'src/entities/qaQuestion.entity';
import JwtAuthenticationGuard from '../auth/jwtAuthentication.guard';
import RequestWithUser from '../auth/requestWithUser.interface';
import { WikiService } from './wiki.service';

export interface SearchQueryToGetWiki {
  page?: string;
  word?: string;
  tag?: string;
  type?: WikiType;
  status?: 'new' | 'resolved';
  writer?: string;
  answer_writer?: string;
}

export interface SearchResultToGetWiki {
  // this key is the total page count
  pageCount: number;
  qaQuestions: Wiki[];
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
    return await this.qaService.getLatestQuestion();
  }

  @UseGuards(JwtAuthenticationGuard)
  @Post('create-question')
  async createQuestion(
    @Req() request: RequestWithUser,
    @Body() question: Partial<Wiki>,
  ): Promise<Wiki> {
    if (!question.title || !question.body) {
      throw new BadRequestException('title and body is necessary');
    }
    question.writer = request.user;
    return await this.qaService.saveWiki(question);
  }

  @UseGuards(JwtAuthenticationGuard)
  @Post('update-question')
  async updateQuestion(
    @Req() request: RequestWithUser,
    @Body() question: Wiki,
  ): Promise<Wiki> {
    if (!question.id || !question.title || !question.body) {
      throw new BadRequestException('title and body is necessary');
    }
    question.writer = request.user;
    return await this.qaService.saveWiki(question);
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
  async createBestAnswer(@Body() question: Partial<Wiki>): Promise<Wiki> {
    if (!question.bestAnswer) {
      throw new BadRequestException('bestAnswer is necessary');
    }
    return await this.qaService.saveWiki({
      ...question,
      resolvedAt: new Date(),
    });
  }
}

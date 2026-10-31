import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatQueryRequest } from '@viksit/shared';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('query')
  @HttpCode(HttpStatus.OK)
  async handleQuery(@Body() dto: ChatQueryRequest) {
    return this.chatService.processQuery(dto);
  }
}

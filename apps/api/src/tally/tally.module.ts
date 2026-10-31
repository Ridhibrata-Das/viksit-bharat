import { Module } from '@nestjs/common';
import { TallyService } from './tally.service';
import { LlmModule } from '../llm/llm.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule, LlmModule],
  providers: [TallyService],
  exports: [TallyService],
})
export class TallyModule {}

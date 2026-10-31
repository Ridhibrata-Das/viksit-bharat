import { Module } from '@nestjs/common';
import { ScraperService } from './scraper.service';
import { ScraperController } from './scraper.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { TallyModule } from '../tally/tally.module';

@Module({
  imports: [PrismaModule, TallyModule],
  controllers: [ScraperController],
  providers: [ScraperService],
  exports: [ScraperService],
})
export class ScraperModule {}

import { Body, Controller, Get, Post } from '@nestjs/common';
import { ScraperService } from './scraper.service';

@Controller('scraper')
export class ScraperController {
  constructor(private readonly scraperService: ScraperService) {}

  @Post('run')
  async triggerRun() {
    return this.scraperService.runScraperJob();
  }

  @Get('daily-tally')
  async getDailyTally() {
    return this.scraperService.getDailyTally();
  }

  @Get('sources')
  async getSources() {
    return this.scraperService.getSources();
  }

  @Get('runs')
  async getRuns() {
    return this.scraperService.getRuns();
  }

  @Post('citizen-evidence')
  async submitCitizenEvidence(
    @Body()
    dto: {
      promiseCode: string;
      title: string;
      sourceUrl?: string;
      excerpt?: string;
      districtCode?: string;
      submitterEmail?: string;
    },
  ) {
    return this.scraperService.submitCitizenEvidence(dto);
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LlmService, ScrapedArticleInput, MatchResult } from '../llm/llm.service';
import { SourceType, SourceTier, ReviewStatus } from '@viksit/database';
import * as crypto from 'crypto';

@Injectable()
export class TallyService {
  private readonly logger = new Logger(TallyService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly llmService: LlmService,
  ) {}

  /**
   * Generates a unique SHA-256 checksum for deduplication
   */
  computeChecksum(url: string, title: string): string {
    return crypto.createHash('sha256').update(`${url.trim()}|${title.trim()}`).digest('hex');
  }

  /**
   * Tallies an ingested article against the active database promises,
   * registers the evidence, and generates a drafted review update.
   */
  async tallyAndRegisterArticle(
    article: ScrapedArticleInput,
    sourceId?: string,
  ): Promise<{
    status: 'CREATED' | 'SKIPPED_DUPLICATE';
    evidenceItem?: any;
    matchResult?: MatchResult;
  }> {
    const checksum = this.computeChecksum(article.url, article.title);

    // 1. Deduplication check: check if already exists
    const existing = await this.prisma.evidenceItem.findFirst({
      where: {
        OR: [{ checksum }, { sourceUrl: article.url }],
      },
    });

    if (existing) {
      this.logger.debug(`Duplicate evidence item detected, skipping: ${article.title}`);
      return { status: 'SKIPPED_DUPLICATE', evidenceItem: existing };
    }

    // 2. Fetch candidate promises
    const promises = await this.prisma.promise.findMany({
      include: {
        category: true,
      },
      take: 200,
    });

    const candidatePromises = promises.map((p) => ({
      id: p.id,
      code: p.code,
      titleEn: p.titleEn,
      titleBn: p.titleBn,
      descriptionEn: p.descriptionEn,
      categoryCode: p.category.code,
      status: p.status,
    }));

    // 3. Match article to candidate promises
    const matchResult = await this.llmService.matchArticleToPromises(article, candidatePromises);

    // 4. Create EvidenceItem
    const evidenceItem = await this.prisma.evidenceItem.create({
      data: {
        title: article.title,
        sourceUrl: article.url,
        publisher: article.publisher || 'Verified Official Source',
        publishedAt: article.publishedAt ? new Date(article.publishedAt) : new Date(),
        sourceType: (article.sourceType as SourceType) || SourceType.GAZETTE,
        sourceTier: (article.sourceTier as SourceTier) || SourceTier.TIER_1,
        extractedText: article.content,
        language: 'en',
        checksum,
        matchScore: matchResult.matchScore,
        sourceId: sourceId || undefined,
      },
    });

    // 5. If matched to a promise, link through status history and update
    if (matchResult.matchedPromiseId && matchResult.matchScore >= 0.35) {
      const matchedPromise = promises.find((p) => p.id === matchResult.matchedPromiseId);

      if (matchedPromise) {
        // Record in status history for verification trail
        await this.prisma.statusHistory.create({
          data: {
            promiseId: matchedPromise.id,
            oldStatus: matchedPromise.status,
            newStatus: matchResult.proposedStatus || matchedPromise.status,
            reason: `${matchResult.statusJustificationEn} (Auto-matched with ${Math.round(matchResult.matchScore * 100)}% score from ${article.publisher || 'source'})`,
            changedById: 'ai-sentinel-scraper',
            evidenceItemId: evidenceItem.id,
          },
        });

        // Create an Update item in PENDING review status for researcher CMS
        const update = await this.prisma.update.create({
          data: {
            titleEn: article.title,
            titleBn: article.title,
            summaryEn: matchResult.statusJustificationEn,
            summaryBn: matchResult.statusJustificationBn,
            eventType: matchResult.proposedStatus?.toString() || 'STATUS_EVALUATED',
            eventDate: article.publishedAt ? new Date(article.publishedAt) : new Date(),
            reviewStatus: ReviewStatus.PENDING,
            createdById: 'ai-sentinel-scraper',
          },
        });

        await this.prisma.promiseUpdate.create({
          data: {
            promiseId: matchedPromise.id,
            updateId: update.id,
          },
        });
      }
    }

    return {
      status: 'CREATED',
      evidenceItem,
      matchResult,
    };
  }
}

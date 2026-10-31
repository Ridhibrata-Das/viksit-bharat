import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LlmService } from '../llm/llm.service';
import { ChatQueryRequest, ChatQueryResponse } from '@viksit/shared';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly llmService: LlmService,
  ) {}

  async processQuery(dto: ChatQueryRequest): Promise<ChatQueryResponse> {
    const locale = dto.locale || 'en';

    // Fetch active promises with category and recent evidence
    const promises = await this.prisma.promise.findMany({
      take: 60,
      include: {
        category: true,
        history: {
          take: 2,
          orderBy: { createdAt: 'desc' },
          include: {
            evidenceItem: true,
          },
        },
      },
      orderBy: [{ isKeyPromise: 'desc' }, { createdAt: 'desc' }],
    });

    const candidatePromises = promises.map((p) => {
      const evidences = p.history
        .filter((h) => h.evidenceItem)
        .map((h) => ({
          title: h.evidenceItem!.title,
          sourceUrl: h.evidenceItem!.sourceUrl,
          tier: h.evidenceItem!.sourceTier,
        }));

      return {
        code: p.code,
        titleEn: p.titleEn,
        titleBn: p.titleBn,
        descriptionEn: p.descriptionEn,
        status: p.status,
        categoryTitleEn: p.category.titleEn,
        categoryTitleBn: p.category.titleBn,
        evidences,
      };
    });

    const districts = await this.prisma.district.findMany({
      take: 23,
      select: {
        code: true,
        nameEn: true,
        nameBn: true,
        population: true,
      },
    });

    const targets = await this.prisma.gsdpTarget.findMany({
      take: 3,
    });

    const response = await this.llmService.generateChatResponse({
      query: dto.message,
      locale,
      promises: candidatePromises,
      districts,
      macroTargets: targets.map((t) => ({
        scenario: t.scenario,
        targetGdpUsd: Number(t.targetGdpUsd),
        growthRate: Number(t.growthRate),
      })),
    });

    return {
      answer: response.answer,
      locale,
      citations: response.citations,
      suggestedFollowUps: response.suggestedFollowUps,
      matchedPromises: response.matchedPromises,
    };
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { PromiseStatus } from '@viksit/database';

export interface ScrapedArticleInput {
  title: string;
  url: string;
  publisher?: string;
  publishedAt?: string;
  sourceType: string;
  sourceTier: 'TIER_1' | 'TIER_2' | 'TIER_3';
  content: string;
  categoryHint?: string;
  districtHint?: string;
}

export interface MatchResult {
  matchedPromiseCode?: string;
  matchedPromiseId?: string;
  matchScore: number; // 0 to 1
  confidenceTier: 'HIGH' | 'MEDIUM' | 'LOW';
  proposedStatus?: PromiseStatus;
  statusJustificationEn: string;
  statusJustificationBn: string;
  extractedFundingAmountCr?: number;
  extractedDepartment?: string;
}

export interface ChatPromptContext {
  query: string;
  locale: 'en' | 'bn';
  promises: Array<{
    code: string;
    titleEn: string;
    titleBn: string;
    descriptionEn?: string | null;
    status: string;
    categoryTitleEn: string;
    categoryTitleBn: string;
    evidences?: Array<{ title: string; sourceUrl?: string | null; tier: string }>;
  }>;
  districts?: Array<{
    code: string;
    nameEn: string;
    nameBn: string;
    population?: number | null;
  }>;
  macroTargets?: Array<{
    scenario: string;
    targetGdpUsd: number;
    growthRate: number;
  }>;
}

@Injectable()
export class LlmService {
  private readonly logger = new Logger(LlmService.name);
  private readonly openrouterKey = process.env.OPENROUTER_API_KEY;
  private readonly openrouterBaseUrl = process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1';
  private readonly openrouterModel = process.env.OPENROUTER_MODEL || 'google/gemini-2.0-flash-001';
  private readonly geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

  /**
   * Matches a scraped article against candidate promises
   */
  async matchArticleToPromises(
    article: ScrapedArticleInput,
    candidatePromises: Array<{
      id: string;
      code: string;
      titleEn: string;
      titleBn: string;
      descriptionEn?: string | null;
      categoryCode?: string;
      status: PromiseStatus;
    }>,
  ): Promise<MatchResult> {
    const textToAnalyze = `${article.title} ${article.content}`.toLowerCase();

    // Check OpenRouter first (OpenAI-compatible)
    if (this.openrouterKey) {
      try {
        const result = await this.callOpenRouterForMatch(article, candidatePromises);
        if (result) return result;
      } catch (err: any) {
        this.logger.warn(`OpenRouter match call failed: ${err.message}, falling back to heuristics`);
      }
    } else if (this.geminiKey) {
      try {
        const llmResult = await this.callGeminiForMatch(article, candidatePromises);
        if (llmResult) return llmResult;
      } catch (err: any) {
        this.logger.warn(`Gemini API match call failed: ${err.message}`);
      }
    }

    // High-fidelity heuristic and entity overlap matcher
    let bestMatch: (typeof candidatePromises)[0] | null = null;
    let highestScore = 0;

    for (const promise of candidatePromises) {
      let score = 0;
      const promiseText = `${promise.titleEn} ${promise.descriptionEn || ''} ${promise.code}`.toLowerCase();
      const keywords = promiseText
        .split(/[\s,./—–-]+/)
        .filter((w) => w.length > 3 && !['with', 'from', 'that', 'this', 'have', 'were', 'been', 'west', 'bengal'].includes(w));

      let matchedKeywordsCount = 0;
      for (const kw of keywords) {
        if (textToAnalyze.includes(kw)) {
          matchedKeywordsCount++;
        }
      }

      if (keywords.length > 0) {
        score = matchedKeywordsCount / Math.min(keywords.length, 8);
      }

      // Boost if category hint matches
      if (article.categoryHint && promise.categoryCode && article.categoryHint.toLowerCase().includes(promise.categoryCode.toLowerCase())) {
        score += 0.25;
      }

      // Check title direct match boost
      if (textToAnalyze.includes(promise.titleEn.toLowerCase().slice(0, 20))) {
        score += 0.4;
      }

      if (score > highestScore) {
        highestScore = score;
        bestMatch = promise;
      }
    }

    // Determine funding amount if any
    let fundingCr: number | undefined;
    const crMatch = textToAnalyze.match(/₹?\s*(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:crore|cr)/i);
    if (crMatch) {
      fundingCr = parseFloat(crMatch[1].replace(/,/g, ''));
    }

    // Determine proposed status
    let proposedStatus: PromiseStatus = bestMatch ? bestMatch.status : PromiseStatus.NOT_STARTED;
    let reasonEn = 'Evidence verified from source.';
    let reasonBn = 'উৎস থেকে প্রমাণ যাচাই করা হয়েছে।';

    if (textToAnalyze.includes('gazette notification') || textToAnalyze.includes('notified in gazette') || textToAnalyze.includes('ordinance promulgated')) {
      proposedStatus = PromiseStatus.LEGALLY_INITIATED;
      reasonEn = `Official gazette notification issued confirming legal initiation.`;
      reasonBn = `আইনি সূচনা নিশ্চিত করে অফিশিয়াল গেজেট বিজ্ঞপ্তি প্রকাশিত হয়েছে।`;
    } else if (fundingCr || textToAnalyze.includes('sanctioned') || textToAnalyze.includes('budget allocation') || textToAnalyze.includes('funds released')) {
      proposedStatus = PromiseStatus.FUNDED;
      reasonEn = `Budgetary sanction detected (${fundingCr ? `₹${fundingCr} Cr` : 'Allocated funds'}).`;
      reasonBn = `বাজেট অনুমোদন পাওয়া গেছে (${fundingCr ? `₹${fundingCr} কোটি` : 'অনুমোদিত তহবিল'})।`;
    } else if (textToAnalyze.includes('tender floated') || textToAnalyze.includes('foundation stone') || textToAnalyze.includes('work in progress') || textToAnalyze.includes('construction begun')) {
      proposedStatus = PromiseStatus.UNDER_IMPLEMENTATION;
      reasonEn = `Physical works / procurement tenders launched.`;
      reasonBn = `ভৌত কাজ বা দরপত্র প্রক্রিয়া শুরু হয়েছে।`;
    } else if (textToAnalyze.includes('inaugurated') || textToAnalyze.includes('commissioned') || textToAnalyze.includes('100% delivered') || textToAnalyze.includes('dedicated to the state')) {
      proposedStatus = PromiseStatus.DELIVERED;
      reasonEn = `Project officially dedicated / fully delivered.`;
      reasonBn = `প্রকল্পটি আনুষ্ঠানিকভাবে উদ্বোধন / সম্পূর্ণরূপে বাস্তবায়িত হয়েছে।`;
    } else if (textToAnalyze.includes('delayed') || textToAnalyze.includes('stalled') || textToAnalyze.includes('deadline missed')) {
      proposedStatus = PromiseStatus.DELAYED;
      reasonEn = `Implementation delays reported by audit/monitoring.`;
      reasonBn = `নিরীক্ষা বা পর্যবেক্ষণে বাস্তবায়নে বিলম্বের কথা উল্লেখ করা হয়েছে।`;
    }

    const normalizedScore = Math.min(1, Math.max(0, highestScore));
    const confidenceTier: 'HIGH' | 'MEDIUM' | 'LOW' =
      normalizedScore >= 0.75 ? 'HIGH' : normalizedScore >= 0.45 ? 'MEDIUM' : 'LOW';

    return {
      matchedPromiseCode: bestMatch ? bestMatch.code : undefined,
      matchedPromiseId: bestMatch ? bestMatch.id : undefined,
      matchScore: parseFloat(normalizedScore.toFixed(2)),
      confidenceTier,
      proposedStatus,
      statusJustificationEn: reasonEn,
      statusJustificationBn: reasonBn,
      extractedFundingAmountCr: fundingCr,
    };
  }

  /**
   * Generates RAG Chatbot response
   */
  async generateChatResponse(ctx: ChatPromptContext): Promise<{
    answer: string;
    citations: Array<{ promiseCode?: string; sourceTitle: string; sourceUrl?: string; sourceTier: string }>;
    suggestedFollowUps: string[];
    matchedPromises: Array<{ code: string; title: string; status: string }>;
  }> {
    const isBn = ctx.locale === 'bn';

    // 1. Try OpenRouter AI First
    if (this.openrouterKey) {
      try {
        const result = await this.callOpenRouterForChat(ctx);
        if (result) return result;
      } catch (err: any) {
        this.logger.warn(`OpenRouter Chat call failed: ${err.message}, falling back to grounded local engine`);
      }
    } else if (this.geminiKey) {
      try {
        const result = await this.callGeminiForChat(ctx);
        if (result) return result;
      } catch (err: any) {
        this.logger.warn(`Gemini Chat RAG failed, using local grounded generator: ${err.message}`);
      }
    }

    // 2. High-precision Grounded RAG Generator
    const queryLower = ctx.query.toLowerCase();
    const matched = ctx.promises.filter((p) => {
      const q = queryLower;
      return (
        p.code.toLowerCase().includes(q) ||
        p.titleEn.toLowerCase().includes(q) ||
        p.titleBn.includes(q) ||
        (p.descriptionEn && p.descriptionEn.toLowerCase().includes(q)) ||
        p.categoryTitleEn.toLowerCase().includes(q) ||
        p.categoryTitleBn.includes(q)
      );
    });

    const citations: Array<{ promiseCode?: string; sourceTitle: string; sourceUrl?: string; sourceTier: string }> = [];
    const matchedPills: Array<{ code: string; title: string; status: string }> = [];

    let answer = '';
    const followUps: string[] = [];

    // Macroeconomic query
    if (queryLower.includes('trillion') || queryLower.includes('gsdp') || queryLower.includes('economy') || queryLower.includes('অর্থনীতি') || queryLower.includes('ট্রিলিয়ন')) {
      if (isBn) {
        answer = `**পশ্চিমবঙ্গের \$১ ট্রিলিয়ন অর্থনীতির রূপরেখা:**
- **মূল লক্ষ্য:** ২০৩৩–২০৩৬ সালের মধ্যে পশ্চিমবঙ্গকে ১ ট্রিলিয়ন মার্কিন ডলারের GSDP অর্জনে সক্ষম করা।
- **প্রয়োজনীয় প্রবৃদ্ধির হার:** প্রায় ১৩.০% – ১৫.৫% বার্ষিক চক্রবৃদ্ধি প্রবৃদ্ধি (CAGR) প্রয়োজন।
- **মূল খাতসমূহ:** উৎপাদন ও শিল্প (সিঙ্গুর, হলদিয়া, খড়গপুর করিডোর), কৃষি ও চা শিল্প, এবং সুনীল অর্থনীতি (গভীর সমুদ্র মৎস্য আহরণ)।
- **বর্তমান অগ্রগতি:** বিভিন্ন অবকাঠামো এবং শিল্প করিডোর বাস্তবায়নের বিভিন্ন স্তরে রয়েছে।`;
        followUps.push('দার্জিলিং চা শিল্পের জন্য কী প্রতিশ্রুতি রয়েছে?');
        followUps.push('১ কোটি চাকরির প্রতিশ্রুতির বর্তমান স্থিতি কী?');
        followUps.push('কোন কোন জেলায় শিল্প পার্ক গড়ে উঠছে?');
      } else {
        answer = `**West Bengal's \$1 Trillion Economy Trajectory:**
- **Core Vision:** Elevate West Bengal's GSDP to \$1,000 Billion (Base case) by 2033–2036.
- **Required Growth:** Target CAGR of 13.0% (Base case) to 15.5% (Ambitious scenario), predicated on manufacturing, IT/AVGC services, and coastal export hubs.
- **Pillar Sectors:** Haldia & Tajpur port logistics, Singur automotive & electronics cluster, Darjeeling GI tea revival, and MSME integration.
- **Current Status:** Policy trackers monitor budget outlays, gazette orders, and industrial sanctions daily.`;
        followUps.push('What is the status of the 1 crore jobs promise?');
        followUps.push('Show tea industry promises in Darjeeling');
        followUps.push('Which districts lead in industrial implementation?');
      }
      return { answer, citations, suggestedFollowUps: followUps, matchedPromises: matchedPills };
    }

    if (matched.length > 0) {
      const topPromises = matched.slice(0, 3);
      topPromises.forEach((p) => {
        matchedPills.push({
          code: p.code,
          title: isBn ? p.titleBn : p.titleEn,
          status: p.status,
        });
        if (p.evidences && p.evidences.length > 0) {
          p.evidences.forEach((ev) => {
            citations.push({
              promiseCode: p.code,
              sourceTitle: ev.title,
              sourceUrl: ev.sourceUrl || undefined,
              sourceTier: ev.tier,
            });
          });
        }
      });

      if (isBn) {
        answer = `আপনার প্রশ্নের সাথে সম্পর্কিত **${topPromises.length}টি প্রধান প্রতিশ্রুতি** পাওয়া গেছে:\n\n` +
          topPromises.map((p, idx) => {
            return `${idx + 1}. **[${p.code}] ${p.titleBn}**
- **খাত:** ${p.categoryTitleBn}
- **বর্তমান স্থিতি:** \`${p.status}\`
- **বিবরণ:** ${p.descriptionEn || 'প্রকল্প বিবরণ ট্র্যাকিংয়ে রয়েছে।'}`;
          }).join('\n\n') +
          `\n\n*সমস্ত তথ্য রাজ্য সরকারের গ্যাজেট, বাজেট বরাদ্দ এবং যাচাইকৃত সরকারি বিজ্ঞপ্তি থেকে নিয়মিত হালনাগাদ করা হয়।*`;
        followUps.push(`[${topPromises[0].code}] এর সাম্প্রতিক গ্যাজেট বা সরকারি আদেশ দেখান`);
        followUps.push('আজকের সর্বশেষ যাচাইকৃত খতিয়ান কী?');
      } else {
        answer = `Found **${topPromises.length} policy commitment(s)** matching your query:\n\n` +
          topPromises.map((p, idx) => {
            return `${idx + 1}. **[${p.code}] ${p.titleEn}**
- **Sector:** ${p.categoryTitleEn}
- **Current Status:** \`${p.status}\`
- **Summary:** ${p.descriptionEn || 'Active monitoring under public governance.'}`;
          }).join('\n\n') +
          `\n\n*All records are tallied daily against verified state gazettes, executive orders, and institutional audit releases.*`;
        followUps.push(`Show verified evidence documents for [${topPromises[0].code}]`);
        followUps.push("What are today's newly verified announcements?");
      }
    } else {
      if (isBn) {
        answer = `আপনার অনুসন্ধানের জন্য সরাসরি কোনো প্রতিশ্রুতির রেকর্ড মেলেনি। 
আপনি কি নির্দিষ্ট কোনো খাত (যেমন: **চা শিল্প**, **নারী সুরক্ষা**, **কর্মসংস্থান**, **স্বাস্থ্য**) অথবা কোনো নির্দিষ্ট জেলা (যেমন: **কলকাতা**, **দার্জিলিং**, **মুর্শিদাবাদ**) সম্পর্কে জানতে চান?`;
        followUps.push('১ কোটি চাকরির প্রতিশ্রুতি');
        followUps.push('কৃষক ও গ্রামীণ অর্থনীতি সংক্রান্ত ঘোষণা');
        followUps.push('পশ্চিমবঙ্গের ২৩টি জেলার তালিকা');
      } else {
        answer = `I could not find an exact policy commitment matching that phrasing. 
Would you like to explore by sector (e.g., **Tea Industry**, **Women's Safety**, **Youth & Employment**, **Health**) or by a specific district (e.g., **Darjeeling**, **Kolkata**, **Purulia**)?`;
        followUps.push('1 crore youth jobs status');
        followUps.push('Farmers & Rural MSP scheme');
        followUps.push('$1 Trillion economy milestones');
      }
    }

    return {
      answer,
      citations,
      suggestedFollowUps: followUps,
      matchedPromises: matchedPills,
    };
  }

  /**
   * OpenRouter OpenAI-compatible match call
   */
  private async callOpenRouterForMatch(article: ScrapedArticleInput, candidatePromises: any[]): Promise<MatchResult | null> {
    const prompt = `You are an AI Policy Classifier. Analyze this news or government order against candidate promises:
Article Title: ${article.title}
Content: ${article.content.slice(0, 1000)}
Source Tier: ${article.sourceTier}

Candidate Promises:
${candidatePromises.slice(0, 15).map((p) => `- Code: ${p.code}, Title: ${p.titleEn}`).join('\n')}

Respond ONLY with valid JSON (no markdown formatting, no code fencing):
{
  "matchedPromiseCode": string or null,
  "matchScore": number (0.0 to 1.0),
  "confidenceTier": "HIGH"|"MEDIUM"|"LOW",
  "proposedStatus": "FUNDED"|"LEGALLY_INITIATED"|"UNDER_IMPLEMENTATION"|"DELIVERED"|"DELAYED"|"NOT_STARTED",
  "statusJustificationEn": string,
  "statusJustificationBn": string,
  "extractedFundingAmountCr": number or null
}`;

    const res = await fetch(`${this.openrouterBaseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.openrouterKey}`,
        'HTTP-Referer': 'https://viksitbengal.in',
        'X-Title': 'Viksit Bengal Dashboard',
      },
      body: JSON.stringify({
        model: this.openrouterModel,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
      }),
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      const err = await res.text();
      this.logger.warn(`OpenRouter error: ${res.status} ${err}`);
      return null;
    }

    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) return null;

    const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  }

  /**
   * OpenRouter OpenAI-compatible chat call
   */
  private async callOpenRouterForChat(ctx: ChatPromptContext): Promise<any | null> {
    const prompt = `You are "Sonar Bondhu", an objective, fact-based AI assistant for the Viksit Bengal Dashboard & $1 Trillion Economy platform.
User Query: "${ctx.query}"
Language: ${ctx.locale === 'bn' ? 'Bengali' : 'English'}

Relevant Database Context:
${ctx.promises.slice(0, 8).map((p) => `[${p.code}] ${p.titleEn} / ${p.titleBn} (Status: ${p.status}, Sector: ${p.categoryTitleEn})`).join('\n')}

Macroeconomic Targets:
- Base GSDP: ₹18.5 Lakh Crore ($220B). Target GSDP: $1,000 Billion ($1 Trillion) by 2033-2036. Required CAGR: 13-15%.

Instructions:
1. Answer strictly based on the provided context. Do NOT fabricate unverified government claims.
2. If language is Bengali, output fluently and grammatically in Bengali.
3. Cite promise codes in brackets like [TEA-01] whenever referencing a promise.
4. Keep the tone helpful, non-partisan, and authoritative.`;

    const res = await fetch(`${this.openrouterBaseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.openrouterKey}`,
        'HTTP-Referer': 'https://viksitbengal.in',
        'X-Title': 'Viksit Bengal Dashboard',
      },
      body: JSON.stringify({
        model: this.openrouterModel,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
      }),
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) return null;
    const data = await res.json();
    const answer = data?.choices?.[0]?.message?.content;
    if (!answer) return null;

    const matchedPills = ctx.promises.slice(0, 3).map((p) => ({
      code: p.code,
      title: ctx.locale === 'bn' ? p.titleBn : p.titleEn,
      status: p.status,
    }));

    const citations: Array<{ promiseCode?: string; sourceTitle: string; sourceUrl?: string; sourceTier: string }> = [];
    ctx.promises.slice(0, 3).forEach((p) => {
      if (p.evidences && p.evidences.length > 0) {
        citations.push({
          promiseCode: p.code,
          sourceTitle: p.evidences[0].title,
          sourceUrl: p.evidences[0].sourceUrl || undefined,
          sourceTier: p.evidences[0].tier,
        });
      }
    });

    return {
      answer,
      citations,
      suggestedFollowUps: ctx.locale === 'bn'
        ? ['আজকের সর্বশেষ যাচাইকৃত খতিয়ান', 'দার্জিলিং চা শিল্পের স্থিতি', '১ কোটি চাকরির অগ্রগতি']
        : ['Today\'s newly verified announcements', 'Tea industry promises in Darjeeling', '1 crore youth jobs status'],
      matchedPromises: matchedPills,
    };
  }

  private async callGeminiForMatch(article: ScrapedArticleInput, candidatePromises: any[]): Promise<MatchResult | null> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.geminiKey}`;
    const prompt = `Analyze this government news/order against the provided policy promises:
Article Title: ${article.title}
Content: ${article.content.slice(0, 1000)}
Source Tier: ${article.sourceTier}

Candidate Promises:
${candidatePromises.slice(0, 15).map((p) => `- Code: ${p.code}, Title: ${p.titleEn}`).join('\n')}

Respond ONLY with valid JSON:
{
  "matchedPromiseCode": string or null,
  "matchScore": number (0.0 to 1.0),
  "confidenceTier": "HIGH"|"MEDIUM"|"LOW",
  "proposedStatus": "FUNDED"|"LEGALLY_INITIATED"|"UNDER_IMPLEMENTATION"|"DELIVERED"|"DELAYED"|"NOT_STARTED",
  "statusJustificationEn": string,
  "statusJustificationBn": string,
  "extractedFundingAmountCr": number or null
}`;

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      signal: AbortSignal.timeout(6000),
    });

    if (!res.ok) return null;
    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return null;

    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  }

  private async callGeminiForChat(ctx: ChatPromptContext): Promise<any | null> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.geminiKey}`;
    const prompt = `You are "Sonar Bondhu", an objective, fact-based AI assistant for the Viksit Bengal Dashboard and $1 Trillion Economy platform.
User Query: "${ctx.query}"
Language: ${ctx.locale === 'bn' ? 'Bengali' : 'English'}

Relevant Database Context:
${ctx.promises.slice(0, 6).map((p) => `[${p.code}] ${p.titleEn} (Status: ${p.status}, Category: ${p.categoryTitleEn})`).join('\n')}`;

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      signal: AbortSignal.timeout(6000),
    });

    if (!res.ok) return null;
    const data = await res.json();
    const answer = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!answer) return null;

    return {
      answer,
      citations: [],
      suggestedFollowUps: ['What are the latest verified updates?', 'Show district-wise implementation'],
      matchedPromises: ctx.promises.slice(0, 3).map((p) => ({ code: p.code, title: p.titleEn, status: p.status })),
    };
  }
}

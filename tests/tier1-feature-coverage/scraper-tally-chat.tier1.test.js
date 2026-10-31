/**
 * Tier 1 Feature Coverage: Automated Scraper, Tally Engine, and Citizen AI Chatbot
 */

import { assertEqual, assertArrayLength, assertProperties, assertStatusCode } from '../harness/assertions.js';

export async function run(ctx) {
  const results = [];

  // 1. GET /scraper/sources returns verified source registry
  try {
    const res = await ctx.getScraperSources();
    assertStatusCode(res, 200, 'GET /scraper/sources should return 200');
    if (!Array.isArray(res.data) || res.data.length < 5) {
      throw new Error(`Expected at least 5 verified sources, got ${res.data?.length}`);
    }
    const gazette = res.data.find((s) => s.sourceType === 'GAZETTE');
    if (!gazette || gazette.sourceTier !== 'TIER_1') {
      throw new Error('Expected Tier 1 Official Gazette source');
    }
    results.push({ name: 'GET /scraper/sources returns verified registry (Gazette, PIB, Orders)', status: 'PASS' });
  } catch (err) {
    results.push({ name: 'GET /scraper/sources returns verified registry (Gazette, PIB, Orders)', status: 'FAIL', error: err.message });
  }

  // 2. POST /scraper/run executes multi-source intake and tally
  try {
    const res = await ctx.runScraperJob();
    if (res.status !== 200 && res.status !== 201) {
      throw new Error(`Expected status 200 or 201, got ${res.status}`);
    }
    if (typeof res.data.itemsDiscovered !== 'number' || res.data.itemsDiscovered < 1) {
      throw new Error('Expected itemsDiscovered >= 1');
    }
    results.push({ name: 'POST /scraper/run executes verified scraper run and reports discovery metrics', status: 'PASS' });
  } catch (err) {
    results.push({ name: 'POST /scraper/run executes verified scraper run and reports discovery metrics', status: 'FAIL', error: err.message });
  }

  // 3. GET /scraper/daily-tally returns daily pulse & recent evidence feed
  try {
    const res = await ctx.getDailyTally();
    assertStatusCode(res, 200, 'GET /scraper/daily-tally should return 200');
    assertProperties(res.data, ['date', 'todayVerifiedItemsCount', 'todayPromisesMovedCount', 'recentEvidences'], 'Daily tally structure');
    if (!Array.isArray(res.data.recentEvidences) || res.data.recentEvidences.length === 0) {
      throw new Error('Expected non-empty recentEvidences array');
    }
    results.push({ name: 'GET /scraper/daily-tally returns daily pulse & recent evidence feed', status: 'PASS' });
  } catch (err) {
    results.push({ name: 'GET /scraper/daily-tally returns daily pulse & recent evidence feed', status: 'FAIL', error: err.message });
  }

  // 4. Citizen evidence crowdsourcing submission
  try {
    const res = await ctx.submitCitizenEvidence({
      promiseCode: 'TEA-01',
      title: 'Local tea workers cooperative launched near Kurseong',
      sourceUrl: 'https://localnews.wb.gov.in/kurseong-tea',
      excerpt: 'Local self-help group formed under tea modernisation scheme.',
      submitterEmail: 'citizen.researcher@bengal.org',
    });
    if (res.status !== 200 && res.status !== 201) {
      throw new Error(`Expected 200 or 201, got ${res.status}`);
    }
    if (res.data.success !== true || !res.data.evidenceId) {
      throw new Error('Expected success: true and evidenceId');
    }
    results.push({ name: 'POST /scraper/citizen-evidence queues community ground evidence for researcher audit', status: 'PASS' });
  } catch (err) {
    results.push({ name: 'POST /scraper/citizen-evidence queues community ground evidence for researcher audit', status: 'FAIL', error: err.message });
  }

  // 5. Citizen Chatbot RAG query in English
  try {
    const res = await ctx.queryChat({
      message: 'What is the vision for the $1 Trillion economy and tea industry?',
      locale: 'en',
    });
    assertStatusCode(res, 200, 'POST /chat/query should return 200');
    if (!res.data.answer || res.data.answer.length < 30) {
      throw new Error('Expected substantive answer in English');
    }
    if (res.data.locale !== 'en') {
      throw new Error('Expected locale to match query');
    }
    results.push({ name: 'POST /chat/query handles policy questions in English with grounded answers', status: 'PASS' });
  } catch (err) {
    results.push({ name: 'POST /chat/query handles policy questions in English with grounded answers', status: 'FAIL', error: err.message });
  }

  // 6. Citizen Chatbot RAG query in Bengali
  try {
    const res = await ctx.queryChat({
      message: 'দার্জিলিং চা শিল্পের জন্য কী কী ঘোষণা রয়েছে?',
      locale: 'bn',
    });
    assertStatusCode(res, 200, 'POST /chat/query should return 200 in Bengali');
    if (!res.data.answer || res.data.locale !== 'bn') {
      throw new Error('Expected answer in Bengali');
    }
    results.push({ name: 'POST /chat/query handles questions in Bengali (বাংলা) fluently', status: 'PASS' });
  } catch (err) {
    results.push({ name: 'POST /chat/query handles questions in Bengali (বাংলা) fluently', status: 'FAIL', error: err.message });
  }

  return results;
}

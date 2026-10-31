import { NextRequest, NextResponse } from 'next/server';
import { answerPolicyQuery } from '@/lib/live-store';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const response = await answerPolicyQuery({
      message: body.message || '',
      locale: body.locale === 'bn' ? 'bn' : 'en',
      conversationId: body.conversationId,
      contextDistrictCode: body.contextDistrictCode,
      contextCategoryCode: body.contextCategoryCode,
    });
    return NextResponse.json(response);
  } catch (err: any) {
    return NextResponse.json(
      { message: err.message || 'Failed to process policy query' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { getHealth, ApiError } from '@/lib/api/client';

export const dynamic = 'force-dynamic';

export async function GET() {
  const startTime = Date.now();
  try {
    const health = await getHealth();
    const durationMs = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      bridge: 'Next.js Server -> Express API -> MongoDB & Redis',
      durationMs,
      health,
    });
  } catch (error) {
    const durationMs = Date.now() - startTime;
    if (error instanceof ApiError) {
      return NextResponse.json(
        {
          success: false,
          bridge: 'Next.js Server -> Express API (Failed)',
          durationMs,
          error: error.message,
          statusCode: error.statusCode,
          details: error.data,
        },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        bridge: 'Next.js Server -> Express API (Unreachable)',
        durationMs,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 }
    );
  }
}

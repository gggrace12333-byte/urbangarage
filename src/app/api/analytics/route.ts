import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  return NextResponse.json({ success: true });
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    totalVisits: 0, cartAdds: 0, orders: 0, refunds: 0, revenue: 0,
    countries: [], trend: []
  });
}

/**
 * Order Statistics API Route
 * 
 * GET /api/orders/stats
 * Returns order statistics and metrics
 */

import { NextRequest, NextResponse } from 'next/server';
import { OrderService } from '@/lib/services/OrderService';
import { getCurrentUser, getUserRestaurant } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's restaurant
    const { restaurant } = await getUserRestaurant();
    if (!restaurant) {
      return NextResponse.json(
        { error: 'No restaurant found' },
        { status: 404 }
      );
    }

    // Get period from query params
    const { searchParams } = new URL(request.url);
    const period = (searchParams.get('period') || 'today') as 'today' | 'week' | 'month';

    // Fetch stats
    const stats = await OrderService.getOrderStats(restaurant.id, period);

    return NextResponse.json({
      success: true,
      data: stats,
      period,
    });

  } catch (error) {
    console.error('GET /api/orders/stats error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

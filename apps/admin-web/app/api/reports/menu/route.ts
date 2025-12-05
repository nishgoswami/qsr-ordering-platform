/**
 * GET /api/reports/menu
 * Get menu item performance analytics
 */

import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { orderRepository, orderItemRepository } from '@/lib/dal';

export async function GET(request: Request) {
  try {
    const { user } = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30d';

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    switch (period) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
    }

    // Get completed orders
    const orders = await orderRepository.findByRestaurant(user.id);
    const completedOrders = orders.filter(
      (order) =>
        order.status === 'completed' &&
        new Date(order.created_at) >= startDate &&
        new Date(order.created_at) <= endDate
    );

    // Get all order items for these orders
    const itemStats: {
      [itemName: string]: {
        quantity: number;
        revenue: number;
        orders: number;
      };
    } = {};

    for (const order of completedOrders) {
      const items = await orderItemRepository.findByOrderId(order.id);
      items.forEach((item: any) => {
        const name = item.menu_items?.name || 'Unknown Item';
        if (!itemStats[name]) {
          itemStats[name] = { quantity: 0, revenue: 0, orders: 0 };
        }
        itemStats[name].quantity += item.quantity;
        itemStats[name].revenue += Number(item.price) * item.quantity;
        itemStats[name].orders += 1;
      });
    }

    // Convert to array and sort
    const popularItems = Object.entries(itemStats)
      .map(([name, stats]) => ({
        name,
        ...stats,
        avgPrice: stats.revenue / stats.quantity,
      }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 20);

    return NextResponse.json({
      success: true,
      data: {
        popularItems,
        period,
      },
    });
  } catch (error) {
    console.error('GET /api/reports/menu error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch menu report' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/reports/sales
 * Get sales analytics and reports
 */

import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { orderRepository } from '@/lib/dal';

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
    const period = searchParams.get('period') || '7d'; // 7d, 30d, 90d, 1y

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
      case '1y':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
    }

    // Get orders for the period
    const orders = await orderRepository.findByRestaurant(user.id);
    const filteredOrders = orders.filter((order) => {
      const orderDate = new Date(order.created_at);
      return orderDate >= startDate && orderDate <= endDate;
    });

    // Calculate metrics
    const completedOrders = filteredOrders.filter((o) => o.status === 'completed');
    const totalRevenue = completedOrders.reduce((sum, order) => sum + Number(order.total_amount), 0);
    const totalOrders = completedOrders.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Group by date
    const dailySales: { [key: string]: { revenue: number; orders: number } } = {};
    completedOrders.forEach((order) => {
      const date = new Date(order.created_at).toISOString().split('T')[0];
      if (!dailySales[date]) {
        dailySales[date] = { revenue: 0, orders: 0 };
      }
      dailySales[date].revenue += Number(order.total_amount);
      dailySales[date].orders += 1;
    });

    // Group by hour (for peak hours)
    const hourlyOrders: { [key: number]: number } = {};
    completedOrders.forEach((order) => {
      const hour = new Date(order.created_at).getHours();
      hourlyOrders[hour] = (hourlyOrders[hour] || 0) + 1;
    });

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalRevenue,
          totalOrders,
          avgOrderValue,
          period,
        },
        dailySales: Object.entries(dailySales).map(([date, data]) => ({
          date,
          revenue: data.revenue,
          orders: data.orders,
        })),
        hourlyOrders,
      },
    });
  } catch (error) {
    console.error('GET /api/reports/sales error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sales report' },
      { status: 500 }
    );
  }
}

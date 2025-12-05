/**
 * Orders API Route
 * 
 * Handles order-related operations:
 * - GET: List orders with filters
 * - POST: Create new order
 * 
 * @see OrderService for business logic
 */

import { NextRequest, NextResponse } from 'next/server';
import { OrderService } from '@/lib/services/OrderService';
import { getCurrentUser, getUserRestaurant } from '@/lib/auth';
import { z } from 'zod';

// Validation schemas
const createOrderSchema = z.object({
  items: z.array(
    z.object({
      menuItemId: z.string().uuid(),
      quantity: z.number().int().min(1).max(99),
      notes: z.string().optional(),
    })
  ).min(1, 'At least one item required'),
  deliveryAddress: z.string().optional(),
  phone: z.string().min(10, 'Valid phone number required'),
  customerName: z.string().optional(),
  customerEmail: z.string().email().optional(),
  notes: z.string().optional(),
});

/**
 * GET /api/orders
 * List orders with optional filters
 * 
 * Query params:
 * - status: Filter by order status
 * - limit: Number of orders to return (default: 50)
 * - offset: Pagination offset (default: 0)
 * - startDate: Filter orders after this date (ISO string)
 * - endDate: Filter orders before this date (ISO string)
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 2. Get user's restaurant
    const { restaurant } = await getUserRestaurant();
    if (!restaurant) {
      return NextResponse.json(
        { error: 'No restaurant found' },
        { status: 404 }
      );
    }

    // 3. Parse query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as any;
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const startDateStr = searchParams.get('startDate');
    const endDateStr = searchParams.get('endDate');

    // 4. Build filters
    const filters = {
      restaurantId: restaurant.id,
      status: status || undefined,
      limit,
      offset,
      startDate: startDateStr ? new Date(startDateStr) : undefined,
      endDate: endDateStr ? new Date(endDateStr) : undefined,
    };

    // 5. Fetch orders via service
    const orders = await OrderService.getOrders(filters);

    // 6. Return response
    return NextResponse.json({
      success: true,
      data: orders,
      pagination: {
        limit,
        offset,
        total: orders.length,
      },
    });

  } catch (error) {
    console.error('GET /api/orders error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/orders
 * Create new order
 * 
 * Body:
 * {
 *   items: [{ menuItemId, quantity, notes? }],
 *   deliveryAddress?: string,
 *   phone: string,
 *   customerName?: string,
 *   customerEmail?: string,
 *   notes?: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Authentication
    const { user } = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 2. Get user's restaurant
    const { restaurant } = await getUserRestaurant();
    if (!restaurant) {
      return NextResponse.json(
        { error: 'No restaurant found' },
        { status: 404 }
      );
    }

    // 3. Parse and validate request body
    const body = await request.json();
    const validationResult = createOrderSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const orderData = validationResult.data;

    // 4. Create order via service
    const order = await OrderService.createOrder(
      {
        restaurantId: restaurant.id,
        items: orderData.items,
        deliveryAddress: orderData.deliveryAddress,
        phone: orderData.phone,
        customerName: orderData.customerName,
        customerEmail: orderData.customerEmail,
        notes: orderData.notes,
      },
      user.id
    );

    // 5. Return created order
    return NextResponse.json(
      {
        success: true,
        data: order,
        message: 'Order created successfully',
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('POST /api/orders error:', error);

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('Menu items not available')) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 400 }
        );
      }
      
      if (error.message.includes('not found')) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

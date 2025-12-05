/**
 * Single Order API Route
 * 
 * Handles operations on specific order:
 * - GET: Get order details
 * - PATCH: Update order status
 * - DELETE: Cancel order
 */

import { NextRequest, NextResponse } from 'next/server';
import { OrderService } from '@/lib/services/OrderService';
import { getCurrentUser, getUserRestaurant } from '@/lib/auth';
import { z } from 'zod';

// Validation schemas
const updateStatusSchema = z.object({
  status: z.enum([
    'pending',
    'confirmed',
    'preparing',
    'ready',
    'out_for_delivery',
    'completed',
    'cancelled',
  ]),
});

const cancelOrderSchema = z.object({
  reason: z.string().min(1, 'Cancellation reason required'),
});

/**
 * GET /api/orders/[id]
 * Get single order by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get order
    const order = await OrderService.getOrderById(params.id);

    // Verify order belongs to user's restaurant
    const { restaurant } = await getUserRestaurant();
    if (order.restaurant_id !== restaurant?.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: order,
    });

  } catch (error) {
    console.error(`GET /api/orders/${params.id} error:`, error);

    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
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

/**
 * PATCH /api/orders/[id]
 * Update order status
 * 
 * Body: { status: OrderStatus }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authentication
    const { user } = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify order belongs to user's restaurant
    const order = await OrderService.getOrderById(params.id);
    const { restaurant } = await getUserRestaurant();
    
    if (order.restaurant_id !== restaurant?.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Parse and validate body
    const body = await request.json();
    const validationResult = updateStatusSchema.safeParse(body);

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

    // Update status
    const updatedOrder = await OrderService.updateOrderStatus(
      params.id,
      validationResult.data.status,
      user.id
    );

    return NextResponse.json({
      success: true,
      data: updatedOrder,
      message: 'Order status updated successfully',
    });

  } catch (error) {
    console.error(`PATCH /api/orders/${params.id} error:`, error);

    if (error instanceof Error) {
      if (error.message.includes('Invalid status transition')) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 400 }
        );
      }

      if (error.message.includes('not found')) {
        return NextResponse.json(
          { success: false, error: 'Order not found' },
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

/**
 * DELETE /api/orders/[id]
 * Cancel order
 * 
 * Body: { reason: string }
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authentication
    const { user } = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify order belongs to user's restaurant
    const order = await OrderService.getOrderById(params.id);
    const { restaurant } = await getUserRestaurant();
    
    if (order.restaurant_id !== restaurant?.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Parse and validate body
    const body = await request.json();
    const validationResult = cancelOrderSchema.safeParse(body);

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

    // Cancel order
    const cancelledOrder = await OrderService.cancelOrder(
      params.id,
      validationResult.data.reason,
      user.id
    );

    return NextResponse.json({
      success: true,
      data: cancelledOrder,
      message: 'Order cancelled successfully',
    });

  } catch (error) {
    console.error(`DELETE /api/orders/${params.id} error:`, error);

    if (error instanceof Error) {
      if (error.message.includes('Cannot cancel')) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 400 }
        );
      }

      if (error.message.includes('not found')) {
        return NextResponse.json(
          { success: false, error: 'Order not found' },
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

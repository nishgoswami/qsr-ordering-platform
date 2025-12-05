import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * Webhook handler for receiving orders from third-party delivery platforms
 * POST /api/webhooks/orders
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const platform = request.headers.get('x-platform') || 'unknown';
    
    console.log(`[Webhook] Received order from ${platform}:`, body);

    // Validate platform
    const validPlatforms = ['uber-eats', 'skip-the-dishes', 'doordash', 'grubhub'];
    if (!validPlatforms.includes(platform)) {
      return NextResponse.json(
        { error: 'Invalid platform' },
        { status: 400 }
      );
    }

    // Parse order based on platform
    const parsedOrder = parseOrderByPlatform(platform, body);

    if (!parsedOrder) {
      return NextResponse.json(
        { error: 'Failed to parse order' },
        { status: 400 }
      );
    }

    // Save order to database
    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        organization_id: parsedOrder.organizationId,
        order_number: parsedOrder.orderNumber,
        order_type: 'delivery',
        order_source: platform,
        customer_name: parsedOrder.customer.name,
        customer_phone: parsedOrder.customer.phone,
        customer_email: parsedOrder.customer.email,
        delivery_address: parsedOrder.customer.address,
        items: parsedOrder.items,
        subtotal: parsedOrder.subtotal,
        tax: parsedOrder.tax,
        delivery_fee: parsedOrder.deliveryFee,
        total: parsedOrder.total,
        status: 'pending',
        special_instructions: parsedOrder.notes,
        metadata: {
          platformOrderId: parsedOrder.platformOrderId,
          rawPayload: body
        }
      })
      .select()
      .single();

    if (error) {
      console.error('[Webhook] Failed to save order:', error);
      return NextResponse.json(
        { error: 'Failed to save order' },
        { status: 500 }
      );
    }

    console.log('[Webhook] Order saved successfully:', order.id);

    // TODO: Trigger real-time notification to kitchen tablet
    // TODO: Send confirmation email/SMS to customer
    // TODO: Auto-print order if enabled in integration settings

    return NextResponse.json({
      success: true,
      orderId: order.id,
      message: 'Order received successfully'
    });

  } catch (error) {
    console.error('[Webhook] Error processing order:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Parse order payload based on delivery platform
 */
function parseOrderByPlatform(platform: string, payload: any) {
  try {
    switch (platform) {
      case 'uber-eats':
        return parseUberEatsOrder(payload);
      case 'skip-the-dishes':
        return parseSkipTheDishesOrder(payload);
      case 'doordash':
        return parseDoorDashOrder(payload);
      case 'grubhub':
        return parseGrubhubOrder(payload);
      default:
        return null;
    }
  } catch (error) {
    console.error(`[Webhook] Failed to parse ${platform} order:`, error);
    return null;
  }
}

/**
 * Uber Eats order parser
 */
function parseUberEatsOrder(payload: any) {
  return {
    platformOrderId: payload.id,
    organizationId: payload.restaurant_id, // Map to your org ID
    orderNumber: payload.display_id,
    customer: {
      name: payload.eater?.first_name + ' ' + payload.eater?.last_name,
      phone: payload.eater?.phone,
      email: payload.eater?.email,
      address: formatAddress(payload.cart?.dropoff_address)
    },
    items: payload.cart?.items?.map((item: any) => ({
      name: item.title,
      quantity: item.quantity,
      price: item.price / 100, // Convert cents to dollars
      modifiers: item.selected_modifier_groups?.flatMap((group: any) =>
        group.selected_items?.map((mod: any) => mod.title)
      ) || []
    })) || [],
    subtotal: payload.payment?.charges?.subtotal / 100,
    tax: payload.payment?.charges?.tax / 100,
    deliveryFee: payload.payment?.charges?.delivery_fee / 100,
    total: payload.payment?.charges?.total / 100,
    notes: payload.special_instructions || ''
  };
}

/**
 * Skip The Dishes order parser
 */
function parseSkipTheDishesOrder(payload: any) {
  return {
    platformOrderId: payload.order_id,
    organizationId: payload.restaurant_id,
    orderNumber: payload.order_number,
    customer: {
      name: payload.customer?.name,
      phone: payload.customer?.phone,
      email: payload.customer?.email,
      address: formatAddress(payload.delivery_address)
    },
    items: payload.items?.map((item: any) => ({
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      modifiers: item.options || []
    })) || [],
    subtotal: payload.pricing?.subtotal,
    tax: payload.pricing?.tax,
    deliveryFee: payload.pricing?.delivery_fee,
    total: payload.pricing?.total,
    notes: payload.notes || ''
  };
}

/**
 * DoorDash order parser
 */
function parseDoorDashOrder(payload: any) {
  return {
    platformOrderId: payload.external_delivery_id,
    organizationId: payload.business_id,
    orderNumber: payload.order_id,
    customer: {
      name: payload.customer?.first_name + ' ' + payload.customer?.last_name,
      phone: payload.customer?.phone_number,
      email: payload.customer?.email,
      address: formatAddress(payload.delivery_address)
    },
    items: payload.items?.map((item: any) => ({
      name: item.name,
      quantity: item.quantity,
      price: item.unit_price,
      modifiers: item.substitutions?.map((sub: any) => sub.name) || []
    })) || [],
    subtotal: payload.order_value,
    tax: payload.tax,
    deliveryFee: payload.delivery_fee,
    total: payload.total_charge,
    notes: payload.special_instructions || ''
  };
}

/**
 * Grubhub order parser
 */
function parseGrubhubOrder(payload: any) {
  return {
    platformOrderId: payload.order_id,
    organizationId: payload.restaurant_id,
    orderNumber: payload.order_number,
    customer: {
      name: payload.diner?.name,
      phone: payload.diner?.phone,
      email: payload.diner?.email,
      address: formatAddress(payload.delivery_info?.address)
    },
    items: payload.order_items?.map((item: any) => ({
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      modifiers: item.special_instructions || []
    })) || [],
    subtotal: payload.amounts?.subtotal,
    tax: payload.amounts?.tax,
    deliveryFee: payload.amounts?.delivery_fee,
    total: payload.amounts?.total,
    notes: payload.notes || ''
  };
}

/**
 * Format address object to string
 */
function formatAddress(address: any): string {
  if (!address) return '';
  
  const parts = [
    address.street_address || address.street || address.line1,
    address.unit || address.apt || address.line2,
    address.city,
    address.state || address.province,
    address.zip_code || address.postal_code
  ].filter(Boolean);

  return parts.join(', ');
}

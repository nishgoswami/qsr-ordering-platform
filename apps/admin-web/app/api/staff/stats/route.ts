/**
 * GET /api/staff/stats
 * Get staff statistics
 */

import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { staffService } from '@/lib/services/StaffService';

export async function GET() {
  try {
    const { user } = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const stats = await staffService.getStats(user.id);

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('GET /api/staff/stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch staff statistics' },
      { status: 500 }
    );
  }
}
